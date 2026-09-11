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
			"gitignore", "write", "exportZip"
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
			let data;
			try {
				if (!res.ok) throw new Error(`dsh-files-git: transport HTTP ${res.status}`);
				data = await res.json();
			} catch (err) {
				// A body that fails to arrive intact (JSON parse over a truncated
				// stream) is a TRANSPORT failure, not a git error: reads may retry
				// once, mutations stay final (the request may have executed).
				// HTTP-status errors stay final for both, as before.
				if (err instanceof SyntaxError && !mutation && _attempt < 1) {
					console.warn(`[files-git] ${method} truncated response body, retrying once`);
					await new Promise((r) => setTimeout(r, 300));
					return rpc(base, method, payload, _attempt + 1);
				}
				throw err;
			}
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
		let svcInfoFailedAt = 0;
		const BOOTSTRAP_RETRY_MS = 30000;
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
		function bootstrapServiceInfo({ force = false } = {}) {
			if (!DIRECT_ELIGIBLE) return Promise.resolve(null);
			if (svcInfo) return Promise.resolve(svcInfo);
			// Negative cache: while the sidecar is down, every svcInfo-less
			// call would otherwise fire a fresh service-info attempt (the
			// single-flight only covers the in-flight window). Retrying at
			// most once per 30s keeps the 5s polling from doubling its load;
			// `force` bypasses it for paths that know the old info is stale
			// (e.g. a just-received 401).
			if (!force && svcInfoFailedAt !== 0 && Date.now() - svcInfoFailedAt < BOOTSTRAP_RETRY_MS) {
				return Promise.resolve(null);
			}
			if (!svcInfoPromise) {
				svcInfoPromise = rpc("git-api", "service-info", {})
					.then((v) => { svcInfo = v; svcInfoFailedAt = 0; return v; })
					.catch(() => { svcInfoFailedAt = Date.now(); return null; })
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
			if (!res.ok) {
				// Surface the service's own reason when it sent one (the bare
				// "direct HTTP 401" hid "unauthorized" etc.).
				const reason = await res.json().catch(() => null);
				const err = new Error(`dsh-files-git: direct HTTP ${res.status}${reason?.error ? `（${reason.error}）` : ""}`);
				// 401/403 = the token was rejected BEFORE anything executed —
				// provably safe to re-bootstrap and re-send once (rpcSmart).
				if (res.status === 401 || res.status === 403) err.rpcAuth = true;
				throw err;
			}
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
					if (err?.rpcAuth) {
						// 401/403: rejected at the token gate, BEFORE any git ran.
						// Re-bootstrap (force past the negative cache) and retry
						// exactly once; without this, the first mutation after
						// every sidecar rotation failed with a raw 401.
						const staleToken = svcInfo?.token;
						svcInfo = null;
						const fresh = await bootstrapServiceInfo({ force: true });
						if (fresh && fresh.token !== staleToken) {
							try {
								return await directRpc(method, payload, fresh);
							} catch (retryErr) {
								if (retryErr?.rpcResult) throw retryErr;
								svcInfo = null;
								if (mutation) throw retryErr;
								// read-class failure → proxy fallback below
							}
						} else if (mutation) {
							throw err; // no fresher info: a mutation must not re-run blindly
						}
						// reads fall through to the proxy path
						return rpc("git-api", method, payload);
					}
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
			// Handshake watchdog: a silently-dropped connection (server gone,
			// middlebox) would otherwise leave this fetch unsettled forever
			// and stall the polling upgrade. Only the handshake is bounded —
			// the stream itself must run free (it can live for hours).
			const handshake = setTimeout(() => controller.abort(), 15000);
			let res;
			try {
				res = await fetch(`http://127.0.0.1:${info.port}/events?repo=${encodeURIComponent(repo)}`, {
					headers: { authorization: `Bearer ${info.token}` },
					mode: "cors",
					signal: controller.signal
				});
			} catch {
				// Direct connect failed: drop the stale bootstrap so the next
				// RPC re-establishes instead of waiting for a poll to notice.
				svcInfo = null;
				return null;
			} finally {
				clearTimeout(handshake);
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
					// Tolerate CRLF framing (SSE spec allows both) even though
					// our own server always emits LF.
					let m;
					while ((m = /\r?\n\r?\n/.exec(buffer)) !== null) {
						const frame = buffer.slice(0, m.index);
						buffer = buffer.slice(m.index + m[0].length);
						const dataLine = frame.split(/\r?\n/).find((l) => l.startsWith("data:"));
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

		// ── raw file channel (upload / download / export) ──────────────────────
		// Byte streams ride dedicated routes on the sidecar (/files/*), reached
		// through one of two transports:
		//  - direct:  http://127.0.0.1:<port>/files/* + Bearer (loopback pages
		//    only — skips the DSH hop entirely), or
		//  - proxy:   same-origin /git-api-files/* — a raw route the host half
		//    registers on the DSH webServer (same requestRejection fence as the
		//    RPC channel), which PIPES bytes to the sidecar with backpressure.
		//    No base64, no body buffering → no size caps, remote (LAN/SSH
		//    tunnel) pages included.
		// Transfers deliberately take NO 20s read timeout (a slow multi-GB
		// transfer is healthy); only transport errors end them. A 502/503 from
		// the proxy (respawned sidecar, request never processed) is retried
		// once with a FRESH request — the proxy never replays a half-consumed
		// upload body itself.
		const RAW_RETRY = new Set([502, 503]);
		// Both transports carry the SAME base shape — the /files segment is
		// part of the base: direct hits the sidecar's /files/* routes, the
		// proxy maps /git-api-files/<route> onto them. (The two shapes must
		// NOT be mixed: /git-api-files/files/<route> 404s in the host route.)
		async function filesTransport() {
			const info = svcInfo ?? await bootstrapServiceInfo();
			return info
				? { base: `http://127.0.0.1:${info.port}/files`, token: info.token }
				: { base: "/git-api-files", token: null };
		}
		const filesUrl = (base, route, params) => {
			const qs = new URLSearchParams(params ?? {}).toString();
			return `${base}/${route}${qs ? `?${qs}` : ""}`;
		};
		const rawErrorMessage = (data, status) => (data?.error?.message || data?.message || `HTTP ${status}`);

		/** Kick the browser's save flow for an in-memory blob. */
		function triggerDownload(blob, name) {
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = name || "download";
			document.body.appendChild(a);
			a.click();
			a.remove();
			setTimeout(() => URL.revokeObjectURL(url), 30000);
		}

		/**
		 * Save one fetch Response to disk. Payloads over the threshold stream
		 * through the File System Access API where available — a multi-GB blob
		 * would otherwise materialize entirely in tab memory. Smaller payloads
		 * keep the silent anchor download (identical UX to before). Picker
		 * failures degrade gracefully: dismissal/abort cancel silently, an
		 * expired activation window (SecurityError — e.g. a long exportZip RPC
		 * ate the 5s user-activation budget) or an unsupported FS falls back
		 * to the in-memory path.
		 */
		const STREAM_SAVE_THRESHOLD = 512 * 1024 * 1024;
		async function saveResponse(res, name, signal) {
			const len = Number(res.headers.get("content-length") ?? 0);
			if (len > STREAM_SAVE_THRESHOLD && typeof window?.showSaveFilePicker === "function") {
				// Stage 1 — picker + writable creation: failures here (user
				// dismissed, SecurityError, unsupported) still have an intact
				// body, so the in-memory fallback below is a real option.
				let writable;
				try {
					const handle = await window.showSaveFilePicker({ suggestedName: name });
					writable = await handle.createWritable();
				} catch (err) {
					if (err?.name === "AbortError") throw err;   // user dismissed: silent
					if (signal?.aborted) throw new DOMException("aborted", "AbortError");
					// SecurityError / unsupported / quota → in-memory fallback
					writable = null;
				}
				if (writable) {
					// Stage 2 — the transfer itself: a failure here has already
					// consumed/locked the body (res.blob() would reject with a
					// bare TypeError per the fetch spec), so surface a readable
					// network error instead of attempting the impossible.
					try {
						await res.body.pipeTo(writable, { signal });
						return { size: len };
					} catch (err) {
						if (err?.name === "AbortError") throw err;
						if (signal?.aborted) throw new DOMException("aborted", "AbortError");
						throw new Error(t("rpc.netError", { name }) || `下载 ${name} 时网络中断`);
					}
				}
			}
			const blob = await res.blob();
			triggerDownload(blob, name);
			return { size: blob.size };
		}

		/**
		 * Stream one file (workspace-relative or abs) to a browser download.
		 * @returns {Promise<{size: number}>}
		 */
		async function downloadFile({ repo, path, abs, name, signal }) {
			const params = { repo };
			if (abs) params.abs = abs;
			else params.path = path ?? "";
			let lastError = null;
			for (let attempt = 0; attempt < 2; attempt++) {
				// Resolve the transport PER attempt: a direct attempt against a
				// dead sidecar (idle exit / rotation) must clear the stale
				// bootstrap and let the retry re-resolve (usually onto the
				// proxy transport) — same self-healing the RPC layer applies.
				let res;
				const { base, token } = await filesTransport();
				try {
					res = await fetch(filesUrl(base, "download", params), {
						headers: token ? { authorization: `Bearer ${token}` } : {},
						mode: "cors",
						cache: "no-store",
						signal
					});
				} catch (error) {
					if (error?.name === "AbortError") throw error;
					if (token) svcInfo = null;
					lastError = error;
					continue;
				}
				if (RAW_RETRY.has(res.status) && attempt === 0) { lastError = new Error(`HTTP ${res.status}`); continue; }
				if (!res.ok) {
					const data = await res.json().catch(() => null);
					throw new Error(rawErrorMessage(data, res.status));
				}
				return await saveResponse(res, name, signal);
			}
			throw lastError ?? new Error("download failed");
		}

		/**
		 * Upload one File via XHR (fetch has no upload progress). Resolves to
		 * the sidecar's { size, path } value. `signalRef` (a ref object)
		 * receives a cancel() closure so the caller can abort mid-flight.
		 */
		function uploadFileOnce({ repo, dirRel, file, overwrite, onProgress, signalRef }) {
			return new Promise((resolve, reject) => {
				let settled = false;
				const done = (fn, v) => { if (!settled) { settled = true; fn(v); } };
				void (async () => {
					try {
						const { base, token } = await filesTransport();
						const params = { repo, path: dirRel ? `${dirRel}/${file.name}` : file.name };
						if (overwrite) params.overwrite = "1";
						const xhr = new XMLHttpRequest();
						if (signalRef) signalRef.current = () => xhr.abort();
						xhr.open("POST", filesUrl(base, "upload", params), true);
						if (token) xhr.setRequestHeader("authorization", `Bearer ${token}`);
						xhr.setRequestHeader("content-type", "application/octet-stream");
						xhr.upload.onprogress = (e) => {
							if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
						};
						xhr.onload = () => {
							let data = null;
							try { data = JSON.parse(xhr.responseText); } catch { /* non-JSON */ }
							if (xhr.status === 200 && data?.ok) done(resolve, data.value);
							else if (RAW_RETRY.has(xhr.status)) done(reject, new Error(`__RETRY__${xhr.status}`));
							else done(reject, new Error(data?.error?.message ?? `HTTP ${xhr.status}`));
						};
						xhr.onerror = () => {
						// Network-level failure on a direct attempt usually means
						// the sidecar went away — drop the stale bootstrap so the
						// next transport resolution re-establishes (or proxies).
						if (token) svcInfo = null;
						done(reject, new Error("network error"));
					};
						xhr.onabort = () => done(reject, new Error("aborted"));
						xhr.send(file);
					} catch (error) { done(reject, error); }
				})();
			});
		}
		async function uploadFile(args) {
			try {
				return await uploadFileOnce(args);
			} catch (error) {
				if (!String(error?.message ?? "").startsWith("__RETRY__")) throw error;
				return uploadFileOnce(args);
			}
		}

		/**
		 * Build a zip of `paths` on the sidecar (exportZip RPC) and stream it
		 * into a browser download. Resolves to the exportZip value.
		 */
		async function exportZipDownload({ repo, paths, name, signal }) {
			const value = await gitRpc("exportZip", { repo, paths, name });
			// The sidecar build itself has no abort plumbing (bounded by the
			// export caps); honoring the signal here at least stops the user-
			// visible half — no download pops for a cancelled export.
			if (signal?.aborted) throw new DOMException("aborted", "AbortError");
			let lastError = null;
			for (let attempt = 0; attempt < 2; attempt++) {
				let res;
				const { base, token } = await filesTransport();
				try {
					res = await fetch(filesUrl(base, "export", { id: value.exportId }), {
						headers: token ? { authorization: `Bearer ${token}` } : {},
						mode: "cors",
						cache: "no-store",
						signal
					});
				} catch (error) {
					if (error?.name === "AbortError") throw error;
					lastError = error;
					continue;
				}
				if (RAW_RETRY.has(res.status) && attempt === 0) { lastError = new Error(`HTTP ${res.status}`); continue; }
				if (!res.ok) {
					const data = await res.json().catch(() => null);
					throw new Error(rawErrorMessage(data, res.status));
				}
				await saveResponse(res, value.name, signal);
				return value;
			}
			throw lastError ?? new Error("export download failed");
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
			if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
			return `${(bytes / 1073741824).toFixed(2)} GB`;
		}
