		// ── RPC (standard client-request envelope, plain fetch) ──────────────────
		// Two request classes so a slow remote never starves the panel and a
		// retried mutation can never run twice:
		//  - reads (list/read/status/…)  : short timeout + ONE retry with backoff
		//  - mutations (commit/push/…)    : long timeout, NO retry — the first
		//    attempt may already have executed server-side; auto-retrying could
		//    commit/pull twice, so only the user may re-trigger those.
		const RPC_READ_TIMEOUT_MS = 10000;
		const RPC_MUTATION_TIMEOUT_MS = 300000;
		const MUTATION_METHODS = new Set([
			"commit", "push", "pull", "fetch", "checkout", "merge", "update",
			"rename", "revert", "reset", "stage", "unstage", "untrack",
			"gitignore", "write"
		]);
		async function rpc(base, method, payload, _attempt = 0) {
			const mutation = MUTATION_METHODS.has(method);
			let res;
			try {
				res = await fetch(`/${base}/${method}`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ type: "client-request", rpcId: crypto.randomUUID(), method, payload: payload ?? {} }),
					signal: AbortSignal.timeout(mutation ? RPC_MUTATION_TIMEOUT_MS : RPC_READ_TIMEOUT_MS)
				});
			} catch (err) {
				if (!mutation && _attempt < 1) {
					await new Promise((r) => setTimeout(r, 300));
					return rpc(base, method, payload, _attempt + 1);
				}
				throw err;
			}
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
		// In-flight dedup: identical concurrent git-api calls share ONE request.
		// This collapses duplicate list/status/read round-trips (double loads,
		// poll races, any re-entrant caller) into a single fetch, so the
		// same-origin connection pool can never be flooded by repeats. Entries
		// are removed on settle — the map is bounded by the in-flight set.
		const gitRpcInFlight = new Map();
		const gitRpc = (method, payload) => {
			const key = `${method}\u0000${JSON.stringify(payload ?? {})}`;
			const existing = gitRpcInFlight.get(key);
			if (existing) return existing;
			const promise = rpc("git-api", method, payload);
			const tracked = promise.finally(() => {
				if (gitRpcInFlight.get(key) === tracked) gitRpcInFlight.delete(key);
			});
			gitRpcInFlight.set(key, tracked);
			return tracked;
		};

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
