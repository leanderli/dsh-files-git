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
 *
 * Run: node scripts/e2e.mjs
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
	const ctx = {
		connection: { register: (_self, _channel, fn) => { handler = fn; } },
		webServer: {}
	};
	host.apply(ctx, config);
	return {
		rpc: async (endpoint, payload = {}) => {
			const ac = new AbortController();
			const out = await handler(endpoint, payload, ac.signal);
			if (!out || typeof out !== "object" || !("ok" in out)) throw new Error(`bad RpcResult for ${endpoint}`);
			return out;
		}
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
