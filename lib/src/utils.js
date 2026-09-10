		// ── RPC (standard client-request envelope, plain fetch) ──────────────────
		// Two request classes so a slow remote never starves the panel and a
		// retried mutation can never run twice:
		//  - reads (list/read/status/…)  : timeout + NO blind retry (only
		//    transport-level failures retry once)
		//  - mutations (commit/push/…)    : long timeout, NO retry — the first
		//    attempt may already have executed server-side; auto-retrying could
		//    commit/pull twice, so only the user may re-trigger those.
		// Read limit is 20s: the handlers themselves finish in <1s, but the DSH
		// main process can park EVERY response (even static 404s) behind a
		// saturated event loop for seconds at a time — 10s produced frequent
		// false timeouts during exactly those windows.
		const RPC_READ_TIMEOUT_MS = 20000;
		const RPC_MUTATION_TIMEOUT_MS = 300000;
		const MUTATION_METHODS = new Set([
			"commit", "push", "pull", "fetch", "checkout", "merge", "update",
			"rename", "revert", "reset", "stage", "unstage", "untrack",
			"gitignore", "write"
		]);
		// ── request id (secure-context-safe) ─────────────────────────────────────
		// crypto.randomUUID() only exists in SECURE contexts (https / localhost).
		// Over LAN (http://192.168.x.x:3080) it is undefined, so EVERY RPC threw
		// "crypto.randomUUID is not a function" (the same failure class as DSH's
		// own model-settings page on LAN). crypto.getRandomValues, however, IS
		// available in insecure contexts — build an RFC4122 v4 uuid from it; the
		// timestamp fallback only covers engines without either API.
		const rpcIdOf = () => {
			if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
				try { return crypto.randomUUID(); } catch { /* fall through */ }
			}
			if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
				const b = crypto.getRandomValues(new Uint8Array(16));
				b[6] = (b[6] & 0x0f) | 0x40;   // version 4
				b[8] = (b[8] & 0x3f) | 0x80;   // variant 10x
				const hex = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
				return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
			}
			return `rpc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
		};

		async function rpc(base, method, payload, _attempt = 0) {
			const mutation = MUTATION_METHODS.has(method);
			const timeoutMs = mutation ? RPC_MUTATION_TIMEOUT_MS : RPC_READ_TIMEOUT_MS;
			const started = Date.now();
			let res;
			try {
				res = await fetch(`/${base}/${method}`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ type: "client-request", rpcId: rpcIdOf(), method, payload: payload ?? {} }),
					signal: AbortSignal.timeout(timeoutMs)
				});
			} catch (err) {
				// TimeoutError: the server-side command may STILL be running — a
				// blind retry stacks a second git process on top of the first,
				// which is how isolated timeouts avalanche into "接口全是超时".
				// Only transport-level failures (server down, connection reset)
				// are safe to retry once. Timeouts surface as a readable error
				// instead of Chrome's cryptic "signal timed out".
				if (err?.name === "TimeoutError") {
					console.warn(`[files-git] ${method} TIMEOUT after ${Date.now() - started}ms (limit ${timeoutMs}ms)`);
					throw new Error(t("rpc.timeout", { method, ms: timeoutMs }));
				}
				if (!mutation && _attempt < 1) {
					console.warn(`[files-git] ${method} transport error, retrying once:`, err?.message ?? err);
					await new Promise((r) => setTimeout(r, 300));
					return rpc(base, method, payload, _attempt + 1);
				}
				console.warn(`[files-git] ${method} FAILED after ${Date.now() - started}ms:`, err?.message ?? err);
				throw err;
			}
			const ms = Date.now() - started;
			if (ms >= 800) console.debug(`[files-git] ${method} slow: ${ms}ms`);
			if (!res.ok) throw new Error(`dsh-files-git: transport HTTP ${res.status}`);
			const data = await res.json();
			if (!data || data.type !== "server-response") throw new Error(t("rpc.badResponse"));
			if (!data.result.ok) {
				const err = new Error(data.result.error?.message ?? t("rpc.failed"));
				err.code = data.result.error?.code;
				throw err;
			}
			return data.result.value;
		}
		// ── direct-to-sidecar transport (Phase 2) ────────────────────────────────
		// Bootstrap: the loopback-fenced DSH channel hands us the sidecar's
		// port+token once ("service-info"); afterwards reads/mutations hit
		// http://127.0.0.1:<port>/git/* directly and never touch the DSH main
		// process. Failure rules mirror the proxy's no-blind-retry semantics:
		//  - result errors (git-error envelopes)        → final, no fallback
		//  - timeouts (request may have executed)       → final, no fallback
		//  - mutation transport failure (may have run)  → final, no fallback
		//  - read transport failure                     → one proxy fallback
		// Any transport failure invalidates the cached service info; the next
		// call re-bootstraps (service restart / idle exit / rotation).
		let svcInfo = null;
		let svcInfoPromise = null;
		// Direct-connect eligibility: the sidecar lives on the SERVER's
		// loopback. When the panel page is NOT served from a loopback origin
		// (SSH tunnel / port-forward to a deployed DSH), "127.0.0.1" would
		// dial the BROWSER's own machine — where nothing listens. Worse,
		// mutation transport failures are deliberately final (the request may
		// have executed), so remote pages would see hard mutation errors.
		// Non-loopback origins therefore skip direct mode entirely and stay
		// on the fenced /git-api proxy: an SSH tunnel satisfies the server's
		// loopback fence (the TCP peer is the server's own sshd), so every
		// operation works through it. Status falls back to polling (no SSE
		// on the proxy path) — same as the pre-Phase-2 behavior.
		const DIRECT_ELIGIBLE = ["127.0.0.1", "localhost", "[::1]", "::1"].includes(globalThis.location?.hostname ?? "");
		function bootstrapServiceInfo() {
			if (!DIRECT_ELIGIBLE) return Promise.resolve(null);
			if (svcInfo) return Promise.resolve(svcInfo);
			if (!svcInfoPromise) {
				svcInfoPromise = rpc("git-api", "service-info", {})
					.then((v) => { svcInfo = v; return v; })
					.catch(() => null)
					.finally(() => { svcInfoPromise = null; });
			}
			return svcInfoPromise;
		}
		// No eager warm-up here on purpose: bootstrapping spawns the sidecar,
		// and that must only happen once the panel is actually used — the
		// first RPC proxies (and kicks the bootstrap), later ones go direct.

		async function directRpc(method, payload, info) {
			const mutation = MUTATION_METHODS.has(method);
			const timeoutMs = mutation ? RPC_MUTATION_TIMEOUT_MS : RPC_READ_TIMEOUT_MS;
			const started = Date.now();
			let res;
			try {
				res = await fetch(`http://127.0.0.1:${info.port}/git/${encodeURIComponent(method)}`, {
					method: "POST",
					headers: { "content-type": "application/json", authorization: `Bearer ${info.token}` },
					body: JSON.stringify(payload ?? {}),
					mode: "cors",
					signal: AbortSignal.timeout(timeoutMs)
				});
			} catch (err) {
				const ms = Date.now() - started;
				if (err?.name === "TimeoutError") {
					console.warn(`[files-git] ${method} TIMEOUT after ${ms}ms (limit ${timeoutMs}ms)`);
					const e = new Error(t("rpc.timeout", { method, ms: timeoutMs }));
					e.rpcTimeout = true;
					throw e;
				}
				console.warn(`[files-git] ${method} direct transport error:`, err?.message ?? err);
				throw err;
			}
			const ms = Date.now() - started;
			if (ms >= 800) console.debug(`[files-git] ${method} slow: ${ms}ms`);
			if (!res.ok) throw new Error(`dsh-files-git: direct HTTP ${res.status}`);
			const data = await res.json();
			// Service answers with the bare RpcResult (no DSH envelope).
			if (!data || typeof data.ok !== "boolean") throw new Error(t("rpc.badResponse"));
			if (!data.ok) {
				const e = new Error(data.error?.message ?? t("rpc.failed"));
				e.code = data.error?.code;
				e.rpcResult = true;
				throw e;
			}
			return data.value;
		}

		async function rpcSmart(method, payload) {
			const mutation = MUTATION_METHODS.has(method);
			if (svcInfo) {
				try {
					return await directRpc(method, payload, svcInfo);
				} catch (err) {
					if (err?.rpcResult) throw err;               // real git/path error: final
					if (err?.rpcTimeout || err?.name === "TimeoutError") throw err; // may have executed
					svcInfo = null;                              // stale bootstrap info
					if (mutation) throw err;                     // may have executed: never re-run
					// read-class transport failure → safe proxy fallback below
				}
			} else {
				void bootstrapServiceInfo(); // warm for the NEXT call; this one proxies
			}
			return rpc("git-api", method, payload);
		}

		// In-flight dedup: identical concurrent git-api calls share ONE request.
		// This collapses duplicate list/status/read round-trips (double loads,
		// poll races, any re-entrant caller) into a single fetch. Entries are
		// removed on settle — the map is bounded by the in-flight set.
		const gitRpcInFlight = new Map();

		// gitRpc now picks the fastest healthy transport; the in-flight dedup
		// stays transport-agnostic so duplicate calls share ONE request.
		const gitRpc = (method, payload) => {
			const key = `${method}\u0000${JSON.stringify(payload ?? {})}`;
			const existing = gitRpcInFlight.get(key);
			if (existing) return existing;
			const promise = rpcSmart(method, payload ?? {}).finally(() => {
				if (gitRpcInFlight.get(key) === promise) gitRpcInFlight.delete(key);
			});
			gitRpcInFlight.set(key, promise);
			return promise;
		};

		// SSE status subscription (direct mode). Resolves to null when direct
		// mode is unavailable → the caller keeps its polling fallback; else to
		// { close(), done } — done resolves when the stream ends for any
		// reason other than close(), so the caller can revert to polling.
		async function subscribeStatus(repo, onData) {
			const info = svcInfo ?? await bootstrapServiceInfo();
			if (!info) return null;
			const controller = new AbortController();
			let res;
			try {
				res = await fetch(`http://127.0.0.1:${info.port}/events?repo=${encodeURIComponent(repo)}`, {
					headers: { authorization: `Bearer ${info.token}` },
					mode: "cors",
					signal: controller.signal
				});
			} catch {
				return null;
			}
			if (!res.ok || !res.body) {
				try { controller.abort(); } catch { /* already */ }
				return null;
			}
			let closedByUs = false;
			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			const pump = (async () => {
				let buffer = "";
				const processBuffer = () => {
					let idx;
					while ((idx = buffer.indexOf("\n\n")) !== -1) {
						const frame = buffer.slice(0, idx);
						buffer = buffer.slice(idx + 2);
						const dataLine = frame.split("\n").find((l) => l.startsWith("data:"));
						if (!dataLine) continue; // comment / heartbeat frame
						try { onData(JSON.parse(dataLine.slice(5).trim())); } catch { /* malformed frame */ }
					}
				};
				try {
					for (;;) {
						const { done, value } = await reader.read();
						if (done) break;
						buffer += decoder.decode(value, { stream: true });
						processBuffer();
					}
					decoder.decode(); // final flush of the multi-byte decoder state
					processBuffer();
				} catch { /* aborted or network drop */ }
			})();
			return {
				close: () => { closedByUs = true; try { controller.abort(); } catch { /* already */ } },
				done: pump.then(() => { return closedByUs ? "closed" : "ended"; })
			};
		}

		// ── panel default-size setting (localStorage; legacy key honored) ────────
		const SIZE_KEY = "dsh-files-git.defaultMaximized";
		const LEGACY_SIZE_KEY = "dsh-git-panel.defaultMaximized";
		const readDefaultMaximized = () => {
			try {
				const v = localStorage.getItem(SIZE_KEY);
				if (v !== null) return v !== "0";
				const old = localStorage.getItem(LEGACY_SIZE_KEY);
				if (old !== null) return old !== "0";
				return true;
			} catch { return true; }
		};
		const writeDefaultMaximized = (v) => {
			try { localStorage.setItem(SIZE_KEY, v ? "1" : "0"); } catch {}
		};

		// ── status letter → label (localized via the i18n dictionary) ───────────
		const LETTER_LABEL = { M: "letter.M", A: "letter.A", D: "letter.D", R: "letter.R", C: "letter.C", U: "letter.U", "?": "letter.?", "!": "letter.!" };
		const letterLabel = (ch) => t(LETTER_LABEL[ch] ?? ch);

		// ── UI atoms (className-based) ───────────────────────────────────────────
		const btn = (label, onClick, opts = {}) => {
			const handlers = {};
			if (onClick || opts.onClick) handlers.onClick = (e) => { if (opts.onClick) opts.onClick(e); if (onClick) onClick(e); };
			return h("button", { className: "dgp-btn" + (opts.className ? ` ${opts.className}` : ""), ...handlers, disabled: opts.disabled, title: opts.title, "data-variant": opts.variant || "default" }, opts.icon || null, label ? h("span", null, label) : null);
		};
		const chip = (text, tone) => h("span", { className: "dgp-chip", "data-tone": tone || undefined }, text);
		// Ghost action button — the single visual language for in-page operations
		// (replace raw text links): accent blue by default, "default" = neutral
		// grey, "error" = danger red; `active` highlights toggle pairs.
		const lbtn = (label, onClick, opts = {}) => h("button", {
			type: "button",
			className: "dgp-lbtn",
			"data-tone": opts.tone || "accent",
			"data-active": opts.active ? "true" : "false",
			"data-disabled": opts.disabled ? "true" : "false",
			title: opts.title,
			onClick: (e) => { e.preventDefault(); e.stopPropagation(); if (!opts.disabled && onClick) onClick(e); }
		}, opts.icon || null, label);
		const link = (text, onClick, muted) => h("button", { className: "dgp-link" + (muted ? " dgp-linkMuted" : ""), onClick: (e) => { e.preventDefault(); onClick(); } }, text);

		function fmtSize(bytes) {
			if (bytes == null) return "";
			if (bytes < 1024) return `${bytes} B`;
			if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
			return `${(bytes / 1048576).toFixed(1)} MB`;
		}
