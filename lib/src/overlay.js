		// ── panel body: header + tabs ────────────────────────────────────────────
		const FilePanelBody = React.memo(function FilePanelBody({ cwd, maximized = false, onToggleMax, onSetMax, onSuspend }) {
			const git = useGit(cwd);
			const [tab, setTab] = useState("files");
			const [refreshTick, setRefreshTick] = useState(0);
			const [headerHost, setHeaderHost] = useState(null);
			const rootNavigationRef = useRef(null);
			const t = useT();
			// Narrow viewport: the dialog IS the full screen — the maximize
			// toggle has nothing to do and its button is dropped.
			const narrow = useNarrow();
			// External open request (produced-file/link click) forces the file tab
			// so FileBrowser mounts and consumes the request (its own effect does
			// the navigation + preview).
			const openReq = useSyncExternalStore(subscribeOpenReq, getOpenReq);
			const lastOpenReqTs = useRef(0);
			useEffect(() => {
				if (openReq && openReq.ts !== lastOpenReqTs.current) {
					lastOpenReqTs.current = openReq.ts;
					setTab("files");
				}
			}, [openReq]);
			const refreshAll = useCallback(() => { git.refresh({ full: true }); setRefreshTick((t) => t + 1); }, [git.refresh]);
			// The workspace title IS the file-view entry and breadcrumb root.
			const wsName = (() => { const s = String(cwd ?? "").replace(/[\\/]+$/, "").split(/[\\/]/); return s[s.length - 1] || ""; })();
			// Pages portal their context/actions into this stable shared header.
			const tabBtn = (id, label) => h("button", { type: "button", className: "dgp-tab" + (id === "git" ? " dgp-pageNavGit" : ""), "aria-pressed": tab === id, "data-active": tab === id ? "true" : "false", onClick: () => setTab(id) }, id === "git" ? h(IconBranch, { size: 14 }) : null, label);
			const openFiles = () => { if (tab === "files") rootNavigationRef.current?.(""); else setTab("files"); };
			// Branch controls belong to the Git page; navigation stays short.
			const pageNavigation = git.isRepo === false || narrow ? null : tabBtn("git", "Git");
			useEffect(() => { if (git.isRepo === false && tab === "git") setTab("files"); }, [git.isRepo, tab]);
			return h(React.Fragment, null,
				h("div", { className: "dgp-header dgp-singleHeader", "data-page": tab },
					h("button", { type: "button", className: "dgp-titleWrap dgp-workspaceTab", title: cwd, "aria-label": wsName + " · " + t("tab.files"), "aria-pressed": tab === "files", "data-active": tab === "files" ? "true" : "false", onClick: openFiles },
						h("span", { className: "dgp-wsIcon", "aria-hidden": "true" }, h(IconFolderClose, { size: 18 })),
						h("span", { className: "dgp-title" }, wsName)
					),
					narrow ? h(ToolbarMenu, { className: "dgp-navigationMenu", label: t("panel.navigation"), text: tab === "files" ? wsName : tab === "git" ? "Git" : t("tab.settings"), icon: null, items: [
						{ label: wsName, title: cwd, checked: tab === "files", run: openFiles },
						git.isRepo === false ? null : { label: "Git", checked: tab === "git", run: () => setTab("git") },
						{ label: t("tab.settings"), checked: tab === "settings", run: () => setTab("settings") },
						{ label: t("common.refresh"), run: refreshAll, disabled: git.busy !== null },
						{ label: t("panel.suspend"), run: onSuspend },
						{ label: t("panel.close"), run: () => overlayStore.set(false) }
					] }) : null,
					h("div", { className: "dgp-headerHost", ref: setHeaderHost }, tab === "settings" ? h(React.Fragment, null,
						pageNavigation ? h("span", { className: "dgp-toolbarDivider", "aria-hidden": "true" }) : null,
						pageNavigation
					) : null),
					h("div", { className: "dgp-headerActions" },
						btn(null, () => setTab((value) => value === "settings" ? "files" : "settings"), { icon: h(IconSettings, { size: 14 }), title: t("tab.settings"), className: tab === "settings" ? "dgp-settingsActive" : "" }),
						btn(null, refreshAll, { disabled: git.busy !== null, icon: h(IconRefresh, { size: 14 }), title: t("common.refresh") }),
						btn(null, onSuspend, { icon: h(IconChevronUp, { size: 14 }), title: t("panel.suspend") }),
						narrow ? null : btn(null, onToggleMax, { icon: h(IconMaximize, { size: 14 }), title: maximized ? t("panel.restore") : t("panel.maximize") }),
						h("button", { className: "dgp-close", title: t("panel.close"), onClick: () => overlayStore.set(false), "aria-label": t("panel.close") }, h(IconClose, { size: 16 }))
					)
				),
				h("div", { className: "dgp-body", "data-tab": tab },
					tab === "settings" ? h(SettingsView, { onSetMax })
						: (tab === "files" || git.isRepo === false ? h(FileBrowser, { cwd, status: git.status, refreshTick, onEdited: refreshAll, headerHost, pageNavigation, rootNavigationRef }) : h(GitView, { git, headerHost, pageNavigation }))
				)
			);
		});

		// ── render-error boundary ────────────────────────────────────────────────
		// A render bug inside the panel body (unexpected data shape from a
		// stale host process, a future regression…) must degrade to a visible
		// error card with a retry — NEVER unmount the slot silently: the slot's
		// death also removes the exposed-strip restore target, stranding the
		// panel for good.
		class PanelBoundary extends React.Component {
			constructor(props) { super(props); this.state = { err: null, nonce: 0 }; }
			static getDerivedStateFromError(err) { return { err }; }
			componentDidCatch(err) { try { console.error("files-git: panel render error", err); } catch { /* ignore */ } }
			render() {
				if (this.state.err !== null) {
					return h("div", { className: "dgp-body", style: { display: "flex", alignItems: "center", justifyContent: "center", padding: 24 } },
						h("div", { className: "dgp-error", style: { maxWidth: 620 } },
							h("span", { style: { flex: 1, minWidth: 0, wordBreak: "break-all" } }, t("panel.renderErr", { msg: String(this.state.err?.message ?? this.state.err) })),
							lbtn(t("common.retry"), () => this.setState((s) => ({ err: null, nonce: s.nonce + 1 })), { tone: "default" })));
				}
				// key bump: retry remounts the subtree fresh (stale crash state gone)
				return h(React.Fragment, { key: this.state.nonce }, this.props.children);
			}
		}

		// ── overlay modal (mirrors DSH Modal visual language) ────────────────────
		function FilePanelOverlay() {
			const open = useSyncExternalStore(subscribeOverlay, getOverlay);
			const hidden = useSyncExternalStore(subscribeHidden, getHidden);
			const narrow = useNarrow();
			const overlayRef = useRef(null);
			const t = useT();
			// Suspended (hide): the panel keeps ALL its state (tab, preview file,
			// scroll, search…) and slides out of the viewport, leaving its top edge
			// exposed; hovering anywhere along that strip slides it back in.
			const hideTimer = useRef(null);
			const mousePos = useRef({ x: 0, y: 0 });
			// Track the cursor globally: when the cursor leaves the panel and stays
			// out (350ms debounce), suspend automatically — no need to click the
			// suspend button. The exposed top strip is exempt, otherwise the panel
			// would re-hide while the cursor still rests on the restore area.
			useEffect(() => {
				// Narrow/touch: no cursor to track, no hover-out suspend — the
				// suspend button and exposed strip remain the exits.
				if (narrow) return;
				const onMove = (e) => { mousePos.current = { x: e.clientX, y: e.clientY }; };
				document.addEventListener("mousemove", onMove, { passive: true });
				return () => { document.removeEventListener("mousemove", onMove); clearTimeout(hideTimer.current); };
			}, [narrow]);
			const cancelHide = useCallback(() => clearTimeout(hideTimer.current), []);
			// Any click inside the panel (e.g. the fullscreen toggle, which
			// resizes the dialog and can momentarily leave the cursor outside its
			// new bounds) grants a short exemption window so the auto-suspend
			// debounce does not fire right after a deliberate in-panel click.
			const lastPanelClick = useRef(0);
			const scheduleHide = useCallback(() => {
				clearTimeout(hideTimer.current);
				hideTimer.current = setTimeout(() => {
					// Narrow/touch never schedules a hide (see scheduleHide callers).
					if (narrowStore.get()) return;
					const m = mousePos.current;
					// Keep the panel open while the cursor rests anywhere over its
					// exposed 40px top strip, including after hover restored it.
					const dialog = overlayRef.current?.querySelector(".dgp-dialog");
					const rect = dialog?.getBoundingClientRect();
					if (m.y <= 40 && rect && m.x >= rect.left && m.x <= rect.right) return;
					// Cursor is currently back inside the dialog or a popup.
					const el = document.elementFromPoint(m.x, m.y);
					if (el && el.closest?.(".dgp-dialog, .dgp-searchHist, .dgp-branchPop, .dgp-logMenu, .dgp-crumbMenu, .dgp-toolbarMenu")) return;
					// A click inside the panel happened within the last 500ms
					// (fullscreen toggle, refresh…): its layout change may have
					// pushed the cursor out of the dialog — don't suspend for that.
					if (Date.now() - lastPanelClick.current < 500) return;
					hiddenStore.set(true);
				}, 350);
			}, []);
			// Default state: fullscreen unless the setting says otherwise.
			const [maximized, setMaximized] = useState(readDefaultMaximized);
			// Stable identity so the memoized FilePanelBody is not re-rendered by
			// unrelated global store updates (sessions/workspaces churn).
			const toggleMax = useCallback(() => setMaximized((m) => !m), []);
			const setMax = useCallback((v) => setMaximized(v), []);
			const suspend = useCallback(() => { clearTimeout(hideTimer.current); hiddenStore.set(true); }, []);
			const snapshot = useSyncExternalStore(
				(cb) => (sessionsService ? sessionsService.list.subscribe(cb) : () => {}),
				() => (sessionsService ? sessionsService.list.getSnapshot() : { ids: [], byId: {}, current: undefined, phase: "pending" })
			);
			// Workspace membership resolves a selected session without a cwd;
			// hero fallback is limited to hosts with an unambiguous workspace.
			const wsSnapshot = useSyncExternalStore(
				(cb) => (workspacesService ? workspacesService.list.subscribe(cb) : () => {}),
				() => (workspacesService ? workspacesService.list.getSnapshot() : { items: [], phase: "pending" })
			);
			useEffect(() => {
				if (!open || hidden) return;
				const prevFocus = document.activeElement;
				const FOCUSABLE = 'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
				const onKey = (e) => {
					if (e.key === "Escape") {
						if (closeActiveToolbarMenu || document.activeElement?.closest?.(".dgp-crumbMenu")) return;
						overlayStore.set(false);
						return;
					}
					if (e.key !== "Tab") return;
					const el = overlayRef.current;
					if (!el) return;
					const portalNodes = [...document.querySelectorAll(".dgp-crumbMenu, .dgp-toolbarMenu")].flatMap((menu) => [...menu.querySelectorAll(FOCUSABLE)]);
					const nodes = [...el.querySelectorAll(FOCUSABLE), ...portalNodes].filter((n) => n.offsetParent !== null);
					if (nodes.length === 0) { e.preventDefault(); return; }
					const first = nodes[0], last = nodes[nodes.length - 1];
					const active = document.activeElement;
					const activeInScope = el.contains(active) || !!active.closest?.(".dgp-crumbMenu, .dgp-toolbarMenu");
					if (e.shiftKey) {
						if (active === first || !activeInScope) { e.preventDefault(); last.focus(); }
					} else {
						if (active === last || !activeInScope) { e.preventDefault(); first.focus(); }
					}
				};
				document.addEventListener("keydown", onKey);
				// Move focus inside the dialog so keyboard input never leaks to
				// the main UI underneath; restore it when the panel closes.
				const root = overlayRef.current;
				if (root && !root.contains(document.activeElement)) {
					const first = root.querySelector(FOCUSABLE);
					if (first) first.focus();
					else { root.setAttribute("tabindex", "-1"); root.focus(); }
				}
				return () => {
					document.removeEventListener("keydown", onKey);
					root?.removeAttribute?.("tabindex");
					if (prevFocus && typeof prevFocus.focus === "function") prevFocus.focus();
				};
			}, [open, hidden]);
			// Resolve the panel's workspace (cwd) BEFORE the early return so the
			// suspend-lifecycle effects below can depend on it.
			const cwd = workspaceCwdOf(snapshot, wsSnapshot) || null;
			// The panel is bound to ONE workspace at a time. Switching to a
			// session of a DIFFERENT workspace closes the panel entirely (which
			// also clears any suspension): the suspended state must never leak
			// into other workspaces, and the panel must never pop open by itself
			// in a workspace that did not ask for it. Sessions of the SAME
			// workspace keep the panel (and its suspension) untouched.
			const prevCwdRef = useRef(null);
			useEffect(() => {
				if (prevCwdRef.current !== null && prevCwdRef.current !== cwd) {
					overlayStore.set(false);
				}
				prevCwdRef.current = cwd;
			}, [cwd]);
			// Closing the panel also clears any suspension: reopening it must show
			// the panel expanded, not still slid out.
			useEffect(() => {
				if (!open && getHidden()) hiddenStore.set(false);
			}, [open]);
			// Closing the panel must also drop any pending external open request —
			// otherwise reopening would replay the last produced-file click
			// (preview + breadcrumb left over from the previous session).
			// The same rule covers a pending `@` reference: it must not fire into
			// the composer later, after the panel that produced it is gone.
			useEffect(() => {
				if (!open) { openReqStore.clear(); clearRefReq(); }
			}, [open]);
			if (!open) return null;
			let content;
			if (snapshot?.phase === "pending") {
				content = h("div", { className: "dgp-body" }, h("div", { className: "dgp-empty" }, t("panel.loadingSession")));
			} else if (!cwd) {
				content = h("div", { className: "dgp-body" }, h("div", { className: "dgp-empty", style: { lineHeight: "26px" } }, t("panel.noWorkspace")));
			} else {
				content = h(FilePanelBody, { key: cwd, cwd, maximized, onToggleMax: toggleMax, onSetMax: setMax, onSuspend: suspend });
			}
			// Portaled straight to <body>: the dsh overlay container that hosts
			// this slot has a low z-index stacking context (z 20), which would trap
			// the panel underneath dsh's own (transparent) event-swallowing mask —
			// real mouse input (hover on the exposed restore strip, clicking the mask)
			// would never reach it. On body, z 1050 sits above dsh's root (z 1000).
			// OUTER boundary: a render crash ANYWHERE in the overlay subtree
				// (dialog shell, exposed restore strip, an effect-driven re-render) must degrade
			// to a visible error card — never escape and kill the DSH web slot.
			return portal(
				h(PanelBoundary, null,
					h("div", { className: "dgp-root", style: getPanelFontStyle(), ref: overlayRef, role: "presentation", "data-hidden": hidden ? "true" : "false", "data-narrow": narrow ? "true" : "false" },
						h("div", { className: "dgp-mask", "aria-hidden": "true", "data-hidden": hidden ? "true" : "false", onClick: suspend }),
						h("div", { className: "dgp-dialog", role: "dialog", "aria-modal": "true", "aria-label": t("panel.aria"), "data-max": maximized ? "true" : "false",
							onClickCapture: () => { lastPanelClick.current = Date.now(); if (getHidden()) hiddenStore.set(false); },
							onMouseEnter: () => { cancelHide(); if (getHidden()) hiddenStore.set(false); },
							onMouseLeave: (e) => {
								// Touch devices synthesize mouseleave after taps with a
								// stale cursor position — never auto-suspend there.
								if (narrowStore.get()) return;
								// Moving into a portaled popup (branch list, search
								// history, log menu) is still "inside the panel".
								const t = e.relatedTarget;
								if (t && (t.closest?.(".dgp-searchHist") || t.closest?.(".dgp-branchPop") || t.closest?.(".dgp-logMenu"))) return;
								scheduleHide();
							}
							// INNER boundary: a body/content error keeps the shell
							// (mask, header, close button) visible so the user can
							// dismiss/retry without a dead pane.
						}, h(PanelBoundary, null, content),
						hidden ? h("div", { className: "dgp-suspendCue", "aria-hidden": "true" }, h(IconArrowDown, { size: 16 })) : null)
					)
				), document.body);
		}
