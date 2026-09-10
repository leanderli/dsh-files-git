/**
 * dsh-files-git — host half (lifecycle manager + proxy).
 *
 * The heavy lifting (git operations + file browsing) lives in a STANDALONE
 * sidecar process (`lib/server/server.js`, spawned with the same Node binary
 * that runs DSH). This half only:
 *
 *  1. makes sure the sidecar is running (singleton via a runtime file in the
 *     user temp dir: read → health check → reuse, else request old shutdown,
 *     spawn, poll until healthy; version + config fingerprint trigger a
 *     rotation on upgrade/config change), and
 *  2. proxies `/git-api/*` RPCs to it over loopback HTTP.
 *
 * Why a separate process: the DSH main process can park EVERY response
 * (even static 404s) behind a saturated event loop for seconds — measured
 * pain that forced the client's read timeout up to 20s. With the sidecar,
 * git runs in a clean process group of our own (Windows DLL-init crash
 * retry, process-tree kill, concurrency gate included) and nothing the
 * panel does touches the DSH loop beyond a lightweight proxy hop.
 *
 * The browser half keeps talking to `/git-api/<endpoint>` with the standard
 * client-request envelope — it is byte-for-byte unaware of the sidecar:
 *
 *   POST /git-api/<endpoint>  { type: "client-request", rpcId, method: <endpoint>, payload }
 *
 * Byte-stream work (upload / download / zip export) does NOT ride that JSON
 * channel: the plugin also registers a raw `/git-api-files/*` route directly
 * on the DSH webServer (same requestRejection fence) and pipes bytes between
 * browser and sidecar with backpressure — no base64, no body buffering, no
 * size caps, for loopback and remote (SSH tunnel) pages alike.
 *
 * Proxy failure semantics:
 *   - ECONNREFUSED (nothing listening → the request was never processed):
 *     safe to respawn + retry ONCE;
 *   - timeout/abort mid-request: NEVER retried (the sidecar may still be
 *     executing a mutation — same no-blind-retry rule the client applies);
 *   - service errors arrive as regular RpcResult failures (HTTP 200), so
 *     they flow to the browser unchanged.
 */
import { spawn } from "node:child_process";
import http from "node:http";
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { configFingerprint, runtimeFilePath } from "./server/shared.js";

const name = "files-git";

/** Required services: the shared channel registry (node half of dsh-client-connection) and the HTTP route registry (its register() reads owner.webServer). */
const inject = ["connection", "webServer"];

/** RPC channel prefix (single path segment; the connection service asserts the pattern). */
const CHANNEL = "/git-api";

/** Plugin version — must match the sidecar's, else the instance is rotated. */
let PLUGIN_VERSION = "0";
try {
	PLUGIN_VERSION = String(JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version ?? "0");
} catch {
	/* broken install: a healthy same-version instance still wins */
}

/** Singleton/rotation runtime file: per-config path (fingerprint-namespaced,
 * mirrors server.js via shared.js), computed per apply() instance — NOT a
 * module global, so two apply() calls with different configs in one process
 * (tests, exotic hosts) never clobber each other's singleton. */

const SERVICE_START_TIMEOUT_MS = 8000;
/** After one failed boot, fail fast for this long before retrying. */
const ENSURE_FAIL_COOLDOWN_MS = 30000;
/** Sidecar mutation budget is 180s; the proxy waits a little longer. */
const SERVICE_REQUEST_TIMEOUT_MS = 200000;

/**
 * Proxy-side concurrency cap: fail fast when the panel storms or the sidecar
 * is down, instead of piling up half-open proxy requests inside DSH. (The
 * sidecar enforces its own identical gate for actual git work.)
 */
const MAX_CONCURRENT_RPCS = 12;

/**
 * Slow/failed request trail for offline diagnosis: one line appended to
 * `{DSH_HOME}/logs/files-git.log` whenever an RPC takes ≥800ms, comes back
 * aborted (the client timed out or navigated away), is rejected by the busy
 * gate, or throws. The happy path (<800ms, ok) never touches the disk, so
 * logging costs the RPC nothing. (The sidecar keeps its own command-level
 * log in `files-git-service.log` next to this one.)
 */
function slowLog(line) {
	try {
		const home = process.env.DSH_HOME;
		if (!home) return;
		const dir = join(home, "logs");
		mkdirSync(dir, { recursive: true });
		appendFileSync(join(dir, "files-git.log"), `${new Date().toISOString()} ${line}\n`, "utf8");
	} catch {
		/* diagnostics must never break the RPC */
	}
}

function fail(code, message) {
	return { ok: false, error: { code, message } };
}

function ok(value) {
	return { ok: true, value };
}

/** JSON responder for the raw byte channel (its errors speak RpcResult). */
function sendJson(res, status, body) {
	if (res.headersSent || res.writableEnded) return;
	const payload = JSON.stringify(body);
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"content-length": Buffer.byteLength(payload),
		"cache-control": "no-store"
	});
	res.end(payload);
}

/** Raw file-channel byte caps: optional plugin config, defaults on the sidecar. */
const DEFAULT_MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024;
const DEFAULT_MAX_EXPORT_BYTES = 2 * 1024 * 1024 * 1024;
const byteCap = (value) => (Number.isFinite(value) && value > 0 ? Math.floor(value) : null);

function readRuntimeFile(file) {
	try {
		const parsed = JSON.parse(readFileSync(file, "utf8"));
		if (parsed && typeof parsed.port === "number" && typeof parsed.token === "string") return parsed;
	} catch {
		/* missing/corrupt: treat as no instance */
	}
	return null;
}

async function fetchJson(url, token, method, timeoutMs) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetch(url, {
			method: method ?? "GET",
			headers: token ? { authorization: `Bearer ${token}` } : {},
			signal: controller.signal
		});
		return { status: res.status, data: await res.json().catch(() => null) };
	} finally {
		clearTimeout(timer);
	}
}

async function instanceHealthy(entry, timeoutMs) {
	try {
		const { status, data } = await fetchJson(`http://127.0.0.1:${entry.port}/health`, entry.token, "GET", timeoutMs);
		return status === 200 && data?.ok === true && data?.version === PLUGIN_VERSION;
	} catch {
		return false;
	}
}

/** Best-effort shutdown of a stale/foreign instance. Never throws. */
async function requestShutdown(entry) {
	try {
		await fetchJson(`http://127.0.0.1:${entry.port}/shutdown`, entry.token, "POST", 1500);
	} catch {
		/* stale instance: proceed regardless */
	}
}

function isConnectRefused(error) {
	return error?.cause?.code === "ECONNREFUSED";
}

/**
 * Plugin body: manage the sidecar lifecycle and register the proxying
 * `/git-api` channel. `config` comes from the `files-git` row's `config` in
 * cordis.patch.yml (gitPath / defaultRoot); no schema is declared so the
 * package stays dependency-free.
 */
function apply(ctx, config) {
	const cfg = config ?? {};
	// Raw values: the sidecar resolves gitPath itself (PATH scan, shim skip).
	const gitPathRaw = typeof cfg.gitPath === "string" ? cfg.gitPath.trim() : "";
	const defaultRoot = typeof cfg.defaultRoot === "string" ? cfg.defaultRoot : "";
	const uploadCap = byteCap(cfg.maxUploadBytes);
	const exportCap = byteCap(cfg.maxExportBytes);
	const caps = { uploadBytes: uploadCap ?? DEFAULT_MAX_UPLOAD_BYTES, exportBytes: exportCap ?? DEFAULT_MAX_EXPORT_BYTES };
	// Caps participate in the fingerprint only when actually configured, so a
	// deployment that never sets them keeps the legacy runtime-file name.
	const fingerprint = configFingerprint(gitPathRaw, defaultRoot, (uploadCap !== null || exportCap !== null) ? caps : undefined);
	const serverJs = fileURLToPath(new URL("./server/server.js", import.meta.url));

	let service = null;   // { pid, port, token, version, fingerprint }
	let ensuring = null;  // in-flight ensure promise (single-flight)
	const runtimeFile = runtimeFilePath(fingerprint);

	// Negative cache for a failing boot: when the sidecar cannot come up
	// (broken install, gitPath typo…), each RPC would otherwise pay the full
	// spawn+poll window twice (service-info bootstrap + the actual request,
	// both run ensure). After one failed attempt, fail FAST with a readable
	// error for a cooldown window, then allow one retry.
	let ensureFailedAt = 0;

	/** Respawn flow: spawn → poll the runtime file + health until ready. */
	async function ensureService() {
		if (ensureFailedAt !== 0) {
			const remaining = Math.ceil((ENSURE_FAIL_COOLDOWN_MS - (Date.now() - ensureFailedAt)) / 1000);
			if (remaining > 0) {
				throw new Error(`git 服务未能启动，已暂停重试（${remaining}s 后自动再试；详见 logs/files-git-service.log）`);
			}
			ensureFailedAt = 0;
		}
		const entry = readRuntimeFile(runtimeFile);
		if (
			entry &&
			entry.version === PLUGIN_VERSION &&
			entry.fingerprint === fingerprint &&
			(await instanceHealthy(entry, 1200))
		) {
			ensureFailedAt = 0;
			service = entry;
			return;
		}
		if (entry) await requestShutdown(entry);
		try {
			const args = [serverJs];
			if (gitPathRaw !== "") args.push("--gitPath", gitPathRaw);
			if (defaultRoot !== "") args.push("--defaultRoot", defaultRoot);
			if (uploadCap !== null) args.push("--maxUploadBytes", String(uploadCap));
			if (exportCap !== null) args.push("--maxExportBytes", String(exportCap));
			const child = spawn(process.execPath, args, { stdio: "ignore", windowsHide: true });
			child.unref();
			child.on("exit", (code) => {
				if (code !== 0 && code !== null) slowLog(`service exited prematurely code=${code}`);
			});
		} catch (error) {
			slowLog(`spawn service failed: ${String(error?.message ?? error)}`);
		}
		const deadline = Date.now() + SERVICE_START_TIMEOUT_MS;
		while (Date.now() < deadline) {
			await new Promise((r) => setTimeout(r, 250));
			const e = readRuntimeFile(runtimeFile);
			if (
				e &&
				e.version === PLUGIN_VERSION &&
				e.fingerprint === fingerprint &&
				(await instanceHealthy(e, 800))
			) {
				ensureFailedAt = 0;
				service = e;
				return;
			}
		}
		ensureFailedAt = Date.now();
		throw new Error(`git 服务未能在 ${Math.round(SERVICE_START_TIMEOUT_MS / 1000)}s 内就绪（详见 logs/files-git-service.log）`);
	}

	const ensureOnce = () => (ensuring ??= ensureService().finally(() => { ensuring = null; }));

	/** One proxied RPC. Throws on transport failure (caller decides retry). */
	async function callService(endpoint, payload, signal) {
		const s = service;
		const controller = new AbortController();
		const onAbort = () => controller.abort();
		signal?.addEventListener("abort", onAbort, { once: true });
		const timer = setTimeout(onAbort, SERVICE_REQUEST_TIMEOUT_MS);
		try {
			const res = await fetch(`http://127.0.0.1:${s.port}/git/${encodeURIComponent(endpoint)}`, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					authorization: `Bearer ${s.token}`
				},
				body: JSON.stringify(payload ?? {}),
				signal: controller.signal
			});
			const data = await res.json().catch(() => null);
			if (res.status === 200 && data && typeof data === "object" && "ok" in data) return data;
			return fail("service-error", `git 服务响应异常（HTTP ${res.status}）`);
		} finally {
			clearTimeout(timer);
			signal?.removeEventListener("abort", onAbort);
		}
	}

	// Per-channel concurrency cap: the panel fires bursts of RPCs (initial
	// load, polling, refresh-all); without a bound, a request storm would run
	// unbounded through the DSH process and starve the rest of DSH. Excess
	// requests fail fast with `busy` — the client surfaces a retryable error,
	// and its own in-flight dedup + loadDir guard prevent a re-storm.
	let activeRpc = 0;
	ctx.connection.register(
		ctx,
		CHANNEL,
		async (endpoint, payload, signal) => {
			if (endpoint === "service-info") {
				// Bootstrap for the browser's direct-connect mode: hands the
				// sidecar's port + token to the panel. Safe by construction —
				// this channel is already loopback-fenced, and the token only
				// unlocks a service that itself binds 127.0.0.1.
				if (activeRpc >= MAX_CONCURRENT_RPCS) {
					slowLog("service-info BUSY");
					return fail("busy", "服务器繁忙，请稍后重试");
				}
				activeRpc++;
				try {
					await ensureOnce();
					return ok({ port: service.port, token: service.token, version: PLUGIN_VERSION, pid: service.pid });
				} catch (error) {
					return fail("service-unavailable", String(error?.message ?? error));
				} finally {
					activeRpc--;
				}
			}
			if (activeRpc >= MAX_CONCURRENT_RPCS) {
				slowLog(`${endpoint} BUSY (active=${activeRpc}) — request storm or stalled requests holding slots`);
				return fail("busy", "服务器繁忙，请稍后重试");
			}
			activeRpc++;
			const started = Date.now();
			try {
				if (!service) {
					try {
						await ensureOnce();
					} catch (error) {
						return fail("service-unavailable", String(error?.message ?? error));
					}
				}
				let result;
				try {
					result = await callService(endpoint, payload ?? {}, signal);
				} catch (error) {
					if (signal?.aborted || error?.name === "AbortError") {
						result = fail("aborted", "请求已取消");
					} else if (isConnectRefused(error)) {
						// Nothing was listening → the request was never processed:
						// respawn and retry exactly once (mutations stay safe).
						service = null;
						slowLog(`${endpoint} service gone (ECONNREFUSED) — respawning`);
						try {
							await ensureOnce();
							result = await callService(endpoint, payload ?? {}, signal);
						} catch (retryError) {
							result = fail("service-unavailable", String(retryError?.message ?? retryError));
						}
					} else {
						// Mid-request transport failure (timeout/reset): the sidecar
						// may still be executing — never retry, force re-ensure next call.
						service = null;
						slowLog(`${endpoint} service transport error: ${String(error?.cause?.code ?? error?.message ?? error).slice(0, 120)}`);
						result = fail("service-unavailable", `git 服务通信失败：${String(error?.cause?.code ?? error?.message ?? error)}`);
					}
				}
				const ms = Date.now() - started;
				if (result?.error?.code === "aborted") slowLog(`${endpoint} ABORT after ${ms}ms (client gave up / navigated away)`);
				else if (ms >= 800) slowLog(`${endpoint} SLOW ${ms}ms (active=${activeRpc})`);
				return result;
			} catch (error) {
				ctx.logger.warn(`files-git: ${endpoint} failed:`, error);
				slowLog(`${endpoint} ERROR after ${Date.now() - started}ms: ${String(error?.message ?? error).slice(0, 200)}`);
				return fail("service-unavailable", String(error?.message ?? error));
			} finally {
				activeRpc--;
			}
		}
		// NOTE: older code passed `{ authority: "loopback" }` here as a 4th
		// argument — dsh-client-connection's register(owner, channel, handler)
		// silently ignores it. The real request fence lives INSIDE the
		// connection service (requestRejection: Host/Origin trust + browser
		// cookie auth); the /git-api-files raw route below applies that same
		// fence explicitly.
	);

	// ── raw byte channel (/git-api-files/*) ────────────────────────────────────
	// Upload / download / export move ARBITRARY-SIZED byte streams, which must
	// not ride the JSON RPC channel (base64 +33%, whole-request-body buffering
	// inside the DSH main process). This route registers directly on the DSH
	// webServer and PIPES raw bytes to the sidecar over loopback with
	// backpressure — the DSH process shuttles chunks, it never buffers a body,
	// so remote (LAN / SSH-tunnel) access gets the same unbounded transfers as
	// loopback pages, just one hop slower. The fence is the SAME one the
	// /git-api RPC channel uses (connection.requestRejection: Host/Origin
	// trust + browser cookie auth) — no new auth surface.
	const RAW_PREFIX = "/git-api-files";
	const RAW_ROUTES = { "/upload": "POST", "/download": "GET", "/export": "GET" };

	/**
	 * One raw pass-through: browser ↔ DSH ↔ sidecar, both legs streamed. A
	 * mid-flight failure is never retried here (a POST body may be half
	 * consumed); on connect-refused the sidecar is respawned and the client
	 * gets a 503 so its transport can retry ONCE from the top with a fresh
	 * request.
	 */
	async function proxyRaw(req, res, upstreamPath, search) {
		const s = service;
		if (!s) {
			sendJson(res, 503, fail("service-unavailable", "git 服务未就绪，请重试"));
			return;
		}
		const settled = await new Promise((settle) => {
			const up = http.request({
				host: "127.0.0.1",
				port: s.port,
				method: req.method,
				path: `${upstreamPath}${search || ""}`,
				headers: { authorization: `Bearer ${s.token}` }
			}, (upRes) => {
				if (res.writableEnded || res.destroyed) {
					upRes.destroy();
					settle(null);
					return;
				}
				const headers = {};
				for (const h of ["content-type", "content-length", "content-disposition", "cache-control", "x-content-type-options"]) {
					const v = upRes.headers[h];
					if (v !== undefined) headers[h] = Array.isArray(v) ? v[0] : v;
				}
				res.writeHead(upRes.statusCode ?? 502, headers);
				upRes.pipe(res);
				upRes.on("end", () => settle(null));
				upRes.on("error", (error) => settle({ error }));
			});
			up.on("error", (error) => settle({ error }));
			res.on("close", () => { if (!res.writableEnded) up.destroy(); });
			if (req.method === "POST") req.pipe(up);
			else up.end();
		});
		if (!settled?.error) return;
		if (!isConnectRefused(settled.error)) {
			// Upstream failed mid-request: 502 if nothing streamed yet, else
			// the socket is already torn — nothing left to answer.
			if (res.headersSent) res.destroy();
			else sendJson(res, 502, fail("service-unavailable", `git 服务通信失败：${String(settled.error?.cause?.code ?? settled.error?.message ?? settled.error)}`));
			return;
		}
		// Nothing was listening → nothing was processed: respawn for the next
		// attempt and hand the retry decision to the client transport.
		service = null;
		slowLog(`raw channel ${upstreamPath} service gone (ECONNREFUSED) — respawning`);
		try { await ensureOnce(); } catch { /* surfaced by the next attempt */ }
		if (res.headersSent) { res.destroy(); return; }
		sendJson(res, 503, fail("service-unavailable", "git 服务已重启，请重试"));
	}

	ctx.effect(() => ctx.webServer.register({
		kind: "prefix",
		path: RAW_PREFIX,
		handler: async (req, res) => {
			const rejection = ctx.connection?.requestRejection?.(req);
			if (rejection !== undefined) {
				res.writeHead(rejection);
				res.end(rejection === 401 ? "unauthorized" : "forbidden");
				return;
			}
			let urlObj = null;
			try { urlObj = new URL(req.url ?? "/", "http://127.0.0.1"); } catch { /* 400 below */ }
			const sub = urlObj ? urlObj.pathname.slice(RAW_PREFIX.length) : "";
			const expectedMethod = RAW_ROUTES[sub];
			if (!urlObj || expectedMethod === undefined || req.method !== expectedMethod) {
				sendJson(res, urlObj ? 404 : 400, fail("not-found", "未知文件通道"));
				return;
			}
			try {
				await ensureOnce();
			} catch (error) {
				sendJson(res, 503, fail("service-unavailable", String(error?.message ?? error)));
				return;
			}
			await proxyRaw(req, res, `/files${sub}`, urlObj.search);
		}
	}), "files-git: /git-api-files raw byte channel");
}

export { apply, inject, name };
