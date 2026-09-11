/**
 * dsh-files-git — end-to-end transport tests (Phase 1 + Phase 2 + review fixes).
 *
 * Exercises the REAL host half (lib/index.js apply) and the REAL sidecar
 * (lib/server/server.js) as spawned processes, over loopback HTTP:
 *
 *   1.  service-info bootstrap (real ensureService flow)
 *   2.  single-flight / reuse (second call → same pid)
 *   3.  direct RPC with Bearer token (real git status against a temp repo)
 *   4.  CORS: loopback origin echoed, foreign origin suppressed
 *   5.  OPTIONS preflight: 204 + private-network header, no auth needed
 *   6.  SSE /events: initial snapshot + live push on create + push on delete
 *   7.  /events with a bad repo → 400
 *   8.  oversized body → readable 413 (not a bare connection reset)
 *   9.  per-fingerprint isolation: a second host with a DIFFERENT config
 *       gets its OWN sidecar and does NOT kill the first one (regression
 *       test for the runtime-file singleton fight)
 *   10. runtime files exist, one per fingerprint, distinct paths
 *   11. self-heal: killed sidecar → next RPC respawns a fresh pid
 *   12. raw file channel: /files/upload (bytes round-trip, overwrite 409 →
 *       overwrite=1, traversal/illegal-name/missing-parent rejection),
 *       /files/download (byte-equal + RFC 5987 headers, traversal reject),
 *       exportZip + /files/export (central-directory parse, inflate, CRC,
 *       UTF-8 names, explicit dir entry), token gate, host route wiring
 *
 * Run: node scripts/e2e.mjs
 */
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inflateRawSync } from "node:zlib";
import * as host from "../lib/index.js";
import { configFingerprint, runtimeFilePath } from "../lib/server/shared.js";

const pluginVersion = String(JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version ?? "");

let passed = 0;
let failed = 0;
const results = [];
function check(name, cond, detail = "") {
	if (cond) {
		passed++;
		results.push(`PASS  ${name}`);
	} else {
		failed++;
		results.push(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
	}
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function makeHost(config) {
	let handler = null;
	const rawRoutes = [];
	const ctx = {
		// cordis ctx.effect runs the registration callback immediately and
		// keeps its return value as the disposer — same call shape as the
		// real host.
		effect: (fn) => fn(),
		connection: {
			register: (_self, _channel, fn) => { handler = fn; },
			requestRejection: () => undefined   // the raw channel's fence, stubbed for direct handler checks
		},
		webServer: { register: (route) => { rawRoutes.push(route); return () => {}; } }
	};
	host.apply(ctx, config);
	return {
		rpc: async (endpoint, payload = {}) => {
			const ac = new AbortController();
			const out = await handler(endpoint, payload, ac.signal);
			if (!out || typeof out !== "object" || !("ok" in out)) throw new Error(`bad RpcResult for ${endpoint}`);
			return out;
		},
		rawRoutes
	};
}

function git(repo, ...args) {
	return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function killTree(pid) {
	execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
}

async function directCall(info, endpoint, payload, { method = "POST", headers = {}, body } = {}) {
	return fetch(`http://127.0.0.1:${info.port}/git/${encodeURIComponent(endpoint)}`, {
		method,
		headers: { authorization: `Bearer ${info.token}`, "content-type": "application/json", ...headers },
		body: body ?? (payload === undefined ? undefined : JSON.stringify(payload))
	});
}

async function main() {
	const repo = mkdtempSync(join(tmpdir(), "fg-e2e-"));
	git(repo, "init", "-b", "main");
	git(repo, "config", "user.email", "e2e@test");
	git(repo, "config", "user.name", "e2e");
	writeFileSync(join(repo, "a.txt"), "hello\n", "utf8");
	git(repo, "add", ".");
	git(repo, "commit", "-m", "init");

	let shutdownUrls = [];
	try {
		// ── 1+2: service-info bootstrap via the real host ────────────────────
		const hostA = makeHost({});
		const info1 = await hostA.rpc("service-info");
		check("1. service-info returns ok with port/token/pid", info1.ok && info1.value.port > 0 && /^[0-9a-f]{64}$/.test(info1.value.token) && info1.value.pid > 0);
		check("1b. version matches package.json", info1.value.version === pluginVersion, `${info1.value?.version} vs ${pluginVersion}`);
		const pidA = info1.value.pid;
		const infoA2 = await hostA.rpc("service-info");
		check("2. second call reuses the same instance", infoA2.ok && infoA2.value.pid === pidA, `${infoA2.value?.pid} vs ${pidA}`);
		const info = info1.value;
		shutdownUrls.push({ port: info.port, token: info.token });

		// ── 3: direct RPC with Bearer token ──────────────────────────────────
		const st = await directCall(info, "status", { repo });
		const stJson = await st.json();
		check(
			"3. direct status RPC ok",
			st.status === 200 && stJson.ok && stJson.value.branch === "main" && stJson.value.staged.length === 0 && stJson.value.untracked.length === 0
		);
		const noAuth = await fetch(`http://127.0.0.1:${info.port}/git/status`, { method: "POST", body: "{}" });
		check("3b. missing token → 401", noAuth.status === 401);

		// ── 4+5: CORS + preflight ────────────────────────────────────────────
		const corsEcho = await fetch(`http://127.0.0.1:${info.port}/health`, { headers: { origin: "http://127.0.0.1:3080" } });
		check("4. loopback origin echoed", corsEcho.headers.get("access-control-allow-origin") === "http://127.0.0.1:3080");
		const corsForeign = await fetch(`http://127.0.0.1:${info.port}/health`, { headers: { origin: "https://evil.example" } });
		check("4b. foreign origin suppressed", corsForeign.headers.get("access-control-allow-origin") === null);
		const pre = await fetch(`http://127.0.0.1:${info.port}/git/status`, {
			method: "OPTIONS",
			headers: { origin: "http://localhost:3080", "access-control-request-method": "POST", "access-control-request-headers": "authorization" }
		});
		check("5. preflight 204 no-auth", pre.status === 204);
		check("5b. preflight PNA header present", pre.headers.get("access-control-allow-private-network") === "true");

		// ── 6+7: SSE (phase-based, cursor over the event sequence) ───────────
		// Position-indexed assertions are flaky: if the service's FIRST git
		// status is slow (Defender/cold cache), the create-change coalesces
		// into the initial snapshot. Phase waits over a moving cursor are
		// deterministic: snapshot → wait event WITH new.txt → wait event
		// WITHOUT it.
		const sseCtl = new AbortController();
		const sseEvents = [];
		{
			const res = await fetch(`http://127.0.0.1:${info.port}/events?repo=${encodeURIComponent(repo)}`, {
				headers: { authorization: `Bearer ${info.token}` },
				signal: sseCtl.signal
			});
			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";
			(async () => {
				try {
					for (;;) {
						const { value, done: fin } = await reader.read();
						if (fin) break;
						buffer += decoder.decode(value, { stream: true });
						let idx;
						while ((idx = buffer.indexOf("\n\n")) !== -1) {
							const frame = buffer.slice(0, idx);
							buffer = buffer.slice(idx + 2);
							const dataLine = frame.split("\n").find((l) => l.startsWith("data:"));
							if (!dataLine) continue;
							try { sseEvents.push(JSON.parse(dataLine.slice(5).trim())); } catch { /* ignore */ }
						}
					}
				} catch { /* aborted at the end */ }
			})();
		}
		let cursor = 0;
		const waitEvent = async (pred, ms) => {
			const deadline = Date.now() + ms;
			for (;;) {
				for (; cursor < sseEvents.length; cursor++) {
					if (pred(sseEvents[cursor])) return sseEvents[cursor];
				}
				if (Date.now() > deadline) return null;
				await sleep(80);
			}
		};
		const hasNew = (e) => !e.error && e.untracked.some((u) => u.path === "new.txt");
		try {
			const snapshot = await waitEvent((e) => !e.error, 15000);
			check(
				"6. SSE initial snapshot",
				Boolean(snapshot) && snapshot.repo === repo && snapshot.branch === "main",
				JSON.stringify(snapshot)?.slice(0, 300)
			);
			writeFileSync(join(repo, "new.txt"), "x\n", "utf8");
			const created = await waitEvent(hasNew, 10000);
			check("6b. file create pushed live", Boolean(created), `cursor=${cursor}/${sseEvents.length}`);
			rmSync(join(repo, "new.txt"));
			const deleted = await waitEvent((e) => !e.error && !hasNew(e), 10000);
			check("6c. file delete pushed live", Boolean(deleted), `cursor=${cursor}/${sseEvents.length}`);
		} finally {
			sseCtl.abort();
		}
		const evBad = await fetch(`http://127.0.0.1:${info.port}/events?repo=${encodeURIComponent(join(repo, "nope"))}`, { headers: { authorization: `Bearer ${info.token}` } });
		check("7. events bad repo → 400", evBad.status === 400);

		// ── 8: oversized body → 413 ──────────────────────────────────────────
		const big = Buffer.alloc(9 * 1024 * 1024, 0x61);
		const tooBig = await directCall(info, "status", undefined, { body: big });
		const tooBigJson = await tooBig.json().catch(() => null);
		check("8. oversized body → readable 413", tooBig.status === 413 && tooBigJson?.error === "payload-too-large", `status=${tooBig.status}`);

		// ── 9+10: per-fingerprint isolation ──────────────────────────────────
		const hostB = makeHost({ defaultRoot: repo });
		const infoB = await hostB.rpc("service-info");
		const pidB = infoB.value?.pid;
		check("9. second config spawns its own sidecar", infoB.ok && pidB > 0 && pidB !== pidA, `${pidB} vs ${pidA}`);
		if (infoB.ok) shutdownUrls.push({ port: infoB.value.port, token: infoB.value.token });
		const infoA3 = await hostA.rpc("service-info");
		check("9b. host A unaffected by host B (no mutual kill)", infoA3.ok && infoA3.value.pid === pidA, `${infoA3.value?.pid} vs ${pidA}`);
		const stB = await directCall(infoB.value, "status", { repo });
		const stBJson = await stB.json();
		check("9c. host B sidecar serves git too", stB.status === 200 && stBJson.ok && stBJson.value.branch === "main");
		const fpA = configFingerprint("", "");
		const fpB = configFingerprint("", repo);
		check(
			"10. runtime files exist per fingerprint",
			existsSync(runtimeFilePath(fpA)) && existsSync(runtimeFilePath(fpB)) && runtimeFilePath(fpA) !== runtimeFilePath(fpB)
		);

		// ── 11: self-heal respawn ────────────────────────────────────────────
		killTree(pidA);
		await sleep(300);
		const infoA4 = await hostA.rpc("service-info");
		check("11. killed sidecar respawns on next RPC", infoA4.ok && infoA4.value.pid !== pidA, `${infoA4.value?.pid} vs ${pidA}`);
		shutdownUrls[0] = { port: infoA4.value.port, token: infoA4.value.token };
		const st2 = await directCall(infoA4.value, "status", { repo });
		const st2Json = await st2.json();
		check("11b. respawned sidecar serves status", st2.status === 200 && st2Json.ok && st2Json.value.branch === "main");

		// ── 12: raw file channel (upload / download / exportZip) ─────────────
		check("12a. host registers the /git-api-files raw route", hostA.rawRoutes.some((r) => r.kind === "prefix" && r.path === "/git-api-files"));
		const filesUrl = (route, params) => `http://127.0.0.1:${infoA4.value.port}/files/${route}?${new URLSearchParams(params).toString()}`;
		const filesAuth = { authorization: `Bearer ${infoA4.value.token}` };
		const noAuthFiles = await fetch(filesUrl("download", { repo, path: "a.txt" }));
		check("12b. files channel missing token → 401", noAuthFiles.status === 401);

		const upPayload = Buffer.from("upload-payload-你好\n", "utf8");
		const up = await fetch(filesUrl("upload", { repo, path: "uploaded 文件.txt" }), { method: "POST", headers: { ...filesAuth, "content-type": "application/octet-stream" }, body: upPayload });
		const upJson = await up.json().catch(() => null);
		check("12c. upload writes bytes (UTF-8 name)", up.status === 200 && upJson?.ok === true && upJson?.value?.size === upPayload.length, JSON.stringify(upJson)?.slice(0, 200));
		check("12d. uploaded bytes round-trip on disk", readFileSync(join(repo, "uploaded 文件.txt")).equals(upPayload));

		const upDup = await fetch(filesUrl("upload", { repo, path: "uploaded 文件.txt" }), { method: "POST", headers: { ...filesAuth, "content-type": "application/octet-stream" }, body: upPayload });
		check("12e. duplicate upload without overwrite → 409", upDup.status === 409);
		const upOvr = await fetch(filesUrl("upload", { repo, path: "uploaded 文件.txt", overwrite: "1" }), { method: "POST", headers: { ...filesAuth, "content-type": "application/octet-stream" }, body: Buffer.from("overwritten\n", "utf8") });
		check("12f. duplicate upload with overwrite=1 → 200", upOvr.status === 200 && (await upOvr.json())?.ok === true);
		check("12g. overwritten content on disk", readFileSync(join(repo, "uploaded 文件.txt"), "utf8") === "overwritten\n");

		const upEscape = await fetch(filesUrl("upload", { repo, path: "../escape.txt" }), { method: "POST", headers: { ...filesAuth }, body: "x" });
		check("12h. upload path traversal rejected", upEscape.status === 400);
		const upColon = await fetch(filesUrl("upload", { repo, path: "a:bad.txt" }), { method: "POST", headers: { ...filesAuth }, body: "x" });
		check("12i. upload illegal filename rejected", upColon.status === 400);
		const upNoDir = await fetch(filesUrl("upload", { repo, path: "no-such-dir/x.txt" }), { method: "POST", headers: { ...filesAuth }, body: "x" });
		check("12j. upload into missing parent dir rejected", upNoDir.status === 400);

		const dl = await fetch(filesUrl("download", { repo, path: "a.txt" }), { headers: filesAuth });
		const dlBytes = Buffer.from(await dl.arrayBuffer());
		check("12k. download streams the file back", dl.status === 200 && dlBytes.equals(Buffer.from("hello\n", "utf8")));
		check("12l. download attachment headers (RFC 5987)", (dl.headers.get("content-disposition") ?? "").includes("attachment") && (dl.headers.get("content-disposition") ?? "").includes("filename*=UTF-8''a.txt"));
		const dlEscape = await fetch(filesUrl("download", { repo, path: "../outside.txt" }), { headers: filesAuth });
		check("12m. download path traversal rejected", dlEscape.status === 400);

		mkdirSync(join(repo, "sub"), { recursive: true });
		writeFileSync(join(repo, "sub", "nested.txt"), "nested-content\n", "utf8");
		const ex = await directCall(infoA4.value, "exportZip", { repo, paths: ["a.txt", "uploaded 文件.txt", "sub"] });
		const exJson = await ex.json();
		const exVal = exJson?.value;
		check("12n. exportZip builds an archive", ex.status === 200 && exJson.ok === true && typeof exVal?.exportId === "string" && exVal.fileCount === 3 && exVal.dirCount === 1, JSON.stringify(exJson)?.slice(0, 240));
		const zipRes = await fetch(filesUrl("export", { id: exVal.exportId }), { headers: filesAuth });
		const zipBuf = Buffer.from(await zipRes.arrayBuffer());
		check("12o. export download streams the zip", zipRes.status === 200 && zipBuf.length > 0 && (zipRes.headers.get("content-disposition") ?? "").includes(".zip"));
		const missingExport = await fetch(filesUrl("export", { id: "deadbeef" }), { headers: filesAuth });
		check("12p. unknown export id → 404", missingExport.status === 404);

		// Minimal ZIP reader: EOCD → central directory → per-entry inflate +
		// CRC verification against a local crc32 implementation.
		const CRC_TABLE = (() => {
			const table = new Int32Array(256);
			for (let n = 0; n < 256; n++) {
				let c = n;
				for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
				table[n] = c;
			}
			return table;
		})();
		const crc32Of = (buf) => {
			let c = 0xFFFFFFFF;
			for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
			return (c ^ 0xFFFFFFFF) >>> 0;
		};
		function readZip(buf) {
			let eocd = -1;
			for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 0xFFFF); i--) {
				if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
			}
			if (eocd === -1) throw new Error("EOCD not found");
			const count = buf.readUInt16LE(eocd + 10);
			const cdOffset = buf.readUInt32LE(eocd + 16);
			const entries = [];
			let at = cdOffset;
			for (let k = 0; k < count; k++) {
				if (buf.readUInt32LE(at) !== 0x02014b50) throw new Error("bad central directory entry");
				const flags = buf.readUInt16LE(at + 8);
				const method = buf.readUInt16LE(at + 10);
				const crc = buf.readUInt32LE(at + 16);
				const csize = buf.readUInt32LE(at + 20);
				const nameLen = buf.readUInt16LE(at + 28);
				const extraLen = buf.readUInt16LE(at + 30);
				const commentLen = buf.readUInt16LE(at + 32);
				const localOffset = buf.readUInt32LE(at + 42);
				const name = buf.subarray(at + 46, at + 46 + nameLen).toString("utf8");
				const localNameLen = buf.readUInt16LE(localOffset + 26);
				const localExtraLen = buf.readUInt16LE(localOffset + 28);
				const dataAt = localOffset + 30 + localNameLen + localExtraLen;
				const data = buf.subarray(dataAt, dataAt + csize);
				const plain = method === 8 ? inflateRawSync(data) : Buffer.from(data);
				entries.push({ name, flags, method, crc, plain });
				at += 46 + nameLen + extraLen + commentLen;
			}
			return { count, entries };
		}
		const zip = readZip(zipBuf);
		const zipNames = zip.entries.map((e) => e.name).sort();
		check("12q. zip entries match the selection (dir structure kept)", zip.count === 4 && zipNames.join("|") === ["a.txt", "sub/", "sub/nested.txt", "uploaded 文件.txt"].join("|"), zipNames.join(","));
		const aEntry = zip.entries.find((e) => e.name === "a.txt");
		check("12r. zip entry content + CRC verified", Boolean(aEntry) && aEntry.plain.equals(Buffer.from("hello\n", "utf8")) && aEntry.crc === crc32Of(Buffer.from("hello\n", "utf8")));
		const nestedEntry = zip.entries.find((e) => e.name === "sub/nested.txt");
		check("12s. zip nested file content verified", Boolean(nestedEntry) && nestedEntry.plain.equals(Buffer.from("nested-content\n", "utf8")));
		const uploadedEntry = zip.entries.find((e) => e.name === "uploaded 文件.txt");
		check("12t. zip UTF-8 entry name round-trips", Boolean(uploadedEntry) && uploadedEntry.plain.equals(Buffer.from("overwritten\n", "utf8")));
		const dirEntry = zip.entries.find((e) => e.name === "sub/");
		check("12u. explicit directory entry present", Boolean(dirEntry) && dirEntry.method === 0 && (dirEntry.flags & 0x0800) !== 0);

		// ── 12v-12y: review regression tests ─────────────────────────────────
		// 12v drives the REGISTERED host raw route through a real HTTP server
		// with the CLIENT-shaped URL — the proxy path every non-loopback page
		// takes (regression: /git-api-files/files/<route> used to 404 because
		// the client glued an extra /files segment onto the proxy base).
		const capturedRoute = hostA.rawRoutes.find((r) => r.kind === "prefix" && r.path === "/git-api-files");
		const proxySrv = createServer((req, res) => { void capturedRoute.handler(req, res); });
		await new Promise((resolve) => proxySrv.listen(0, "127.0.0.1", resolve));
		const proxyPort = proxySrv.address().port;
		const proxyDl = await fetch(`http://127.0.0.1:${proxyPort}/git-api-files/download?${new URLSearchParams({ repo, path: "a.txt" })}`);
		const proxyDlBytes = Buffer.from(await proxyDl.arrayBuffer());
		check("12v. proxy route serves the client-shaped URL (byte round-trip)", proxyDl.status === 200 && proxyDlBytes.equals(Buffer.from("hello\n", "utf8")), `status=${proxyDl.status} body=${proxyDlBytes.toString("utf8").slice(0, 60)}`);
		const proxyStale = await fetch(`http://127.0.0.1:${proxyPort}/git-api-files/files/download?${new URLSearchParams({ repo, path: "a.txt" })}`);
		check("12w. stale /git-api-files/files/* shape rejected (404)", proxyStale.status === 404, `status=${proxyStale.status}`);
		proxySrv.close();

		// 12x: a caps-configured host must boot its sidecar — host and sidecar
		// must agree on the runtime-file fingerprint (regression: the sidecar
		// computed its fingerprint WITHOUT caps, so the host polled a runtime
		// file that never appeared and every RPC failed the 8s boot window).
		const hostCaps = makeHost({ maxUploadBytes: 1024 * 1024 });
		const infoCaps = await hostCaps.rpc("service-info");
		check("12x. caps-configured host boots its sidecar (fingerprint parity)", infoCaps.ok === true && infoCaps.value?.port > 0, JSON.stringify(infoCaps).slice(0, 160));
		if (infoCaps.ok) {
			shutdownUrls.push({ port: infoCaps.value.port, token: infoCaps.value.token });
			// 12y: the configured cap actually reaches the upload route.
			const capsUrl = (route, params) => `http://127.0.0.1:${infoCaps.value.port}/files/${route}?${new URLSearchParams(params).toString()}`;
			const bigPayload = Buffer.alloc(1024 * 1024 + 64, 7);
			const upBig = await fetch(capsUrl("upload", { repo, path: "big.bin" }), { method: "POST", headers: { authorization: `Bearer ${infoCaps.value.token}`, "content-type": "application/octet-stream" }, body: bigPayload });
			check("12y. configured upload cap enforced (413 over 1MB)", upBig.status === 413, `status=${upBig.status}`);
		}
	} finally {
		for (const { port, token } of shutdownUrls) {
			await fetch(`http://127.0.0.1:${port}/shutdown`, { method: "POST", headers: { authorization: `Bearer ${token}` } }).catch(() => {});
		}
		await sleep(400);
		try { rmSync(repo, { recursive: true, force: true }); } catch { /* temp dir */ }
	}

	console.log(results.join("\n"));
	console.log(`\n${passed} passed, ${failed} failed`);
	process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
	console.error("E2E fatal:", error?.stack ?? error);
	process.exit(1);
});
