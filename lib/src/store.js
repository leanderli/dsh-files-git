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
		const openReqStore = {
			req: null,
			listeners: new Set(),
			request(path) {
				this.req = { path, ts: Date.now() };
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
