		// ── service bridges, filled by apply() ─────────────────────────────────
		let sessionsService = null;
		let workspacesService = null;

		// ── modal open state shared by trigger and overlay ───────────────────────
		const overlayStore = {
			open: false,
			listeners: new Set(),
			set(open) {
				if (this.open === open) return;
				this.open = open;
				for (const fn of this.listeners) fn();
			},
			subscribe(fn) {
				this.listeners.add(fn);
				return () => this.listeners.delete(fn);
			},
			get() {
				return this.open;
			}
		};
		const subscribeOverlay = (fn) => overlayStore.subscribe(fn);
		const getOverlay = () => overlayStore.get();

		// ── suspend (temporarily hide) state, shared by trigger + overlay ────────
		// Suspending keeps every bit of panel state and slides it out of the
		// viewport, leaving a top-bar handle to hover back in. While suspended
		// the header trigger button hides (the handle is the only entry point).
		const hiddenStore = {
			hidden: false,
			listeners: new Set(),
			set(hidden) {
				if (this.hidden === hidden) return;
				this.hidden = hidden;
				for (const fn of this.listeners) fn();
			},
			subscribe(fn) {
				this.listeners.add(fn);
				return () => this.listeners.delete(fn);
			},
			get() {
				return this.hidden;
			}
		};
		const subscribeHidden = (fn) => hiddenStore.subscribe(fn);
		const getHidden = () => hiddenStore.get();

		// ── external file-open request (from the openPath interception) ──────────
		// When the "open produced files in the panel" setting is on, the wrapped
		// workspaces.openPath routes FILE clicks here: {path, ts} wakes the file
		// tab and opens a preview of that absolute path. Directories are never
		// routed here (they keep the system "open in folder" behavior).
		// `ts` is a MONOTONIC COUNTER, not Date.now(): two clicks on the same
		// file within one millisecond would collide on a wall-clock stamp and
		// the consumer's dedup guard would silently drop the second open.
		let openReqSeq = 0;
		const openReqStore = {
			req: null,
			listeners: new Set(),
			request(path) {
				openReqSeq += 1;
				this.req = { path, ts: openReqSeq };
				for (const fn of this.listeners) fn();
			},
			// Closing the panel must forget any pending open request: reopening
			// must start clean instead of replaying the last produced-file click.
			clear() {
				if (this.req === null) return;
				this.req = null;
				for (const fn of this.listeners) fn();
			},
			subscribe(fn) {
				this.listeners.add(fn);
				return () => this.listeners.delete(fn);
			},
			get() {
				return this.req;
			}
		};
		const subscribeOpenReq = (fn) => openReqStore.subscribe(fn);
		const getOpenReq = () => openReqStore.get();

		// ── narrow-viewport (mobile) flag ────────────────────────────────────────
		// Single source of truth for the narrow-screen layout: evaluated once
		// from matchMedia and kept live through the change listener. CSS keys
		// off the data-narrow attribute this drives on .dgp-root, and render
		// logic reads this same store — never two independent media queries.
		// Breakpoint (定案 2026-09): ≤720px, or a touch device (no hover) up to
		// 1024px — narrow tablets take the drill-down layout because split
		// panes + pointer-drag gutters are mouse affordances.
		const narrowStore = {
			narrow: false,
			listeners: new Set(),
			set(v) {
				if (this.narrow === v) return;
				this.narrow = v;
				for (const fn of this.listeners) fn();
			},
			subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
			get() { return this.narrow; }
		};
		if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
			try {
				const mq = window.matchMedia("(max-width: 720px), ((hover: none) and (max-width: 1024px))");
				narrowStore.narrow = mq.matches === true;
				const onMq = (e) => narrowStore.set(e.matches === true);
				if (typeof mq.addEventListener === "function") mq.addEventListener("change", onMq);
				else if (typeof mq.addListener === "function") mq.addListener(onMq);   // legacy Safari
			} catch { /* matchMedia unavailable: desktop layout stays */ }
		}
		const subscribeNarrow = (fn) => narrowStore.subscribe(fn);
		const getNarrow = () => narrowStore.get();
		const useNarrow = () => useSyncExternalStore(subscribeNarrow, getNarrow);
