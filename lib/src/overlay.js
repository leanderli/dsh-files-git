		// ── panel body: header + tabs ────────────────────────────────────────────
		const FilePanelBody = React.memo(function FilePanelBody({ cwd, maximized = false, onToggleMax, onSetMax, onSuspend }) {
			const git = useGit(cwd);
			const [tab, setTab] = useState("files");
			const [refreshTick, setRefreshTick] = useState(0);
			const t = useT();
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
			const refreshAll = useCallback(() => { git.refresh(); setRefreshTick((t) => t + 1); }, [git.refresh]);
			const tabBtn = (id, label, icon) => h("button", { className: "dgp-tab", "data-active": tab === id ? "true" : "false", onClick: () => setTab(id) }, icon, label);
			// Git tab is a split control: text switches tabs, the chevron opens the
			// branch list (BranchSelector) — both stay visually one tab button.
			// Hidden entirely when cwd is not a git repository.
			const gitTab = git.isRepo === false ? null : h("div", { className: "dgp-tab dgp-tabSplit", "data-active": tab === "git" ? "true" : "false" },
				h("button", { className: "dgp-tabMain", "data-active": tab === "git" ? "true" : "false", onClick: () => setTab("git") },
					h(IconBranch, { size: 14 }),
					h("span", null, `Git${git.status ? ` · ${git.status.branch}` : ""}`)),
				h(BranchSelector, { git })
			);
			useEffect(() => { if (git.isRepo === false && tab === "git") setTab("files"); }, [git.isRepo, tab]);
			return h(React.Fragment, null,
				h("div", { className: "dgp-header" },
					h("div", { className: "dgp-titleWrap" },
						h("h2", { className: "dgp-title" }, t("panel.title"))
					),
					btn(null, refreshAll, { disabled: git.busy !== null, icon: h(IconRefresh, { size: 14 }), title: t("common.refresh") }),
					btn(null, onSuspend, { icon: h(IconChevronUp, { size: 14 }), title: t("panel.suspend") }),
					btn(null, onToggleMax, { icon: h(IconMaximize, { size: 14 }), title: maximized ? t("panel.restore") : t("panel.maximize") }),
					h("button", { className: "dgp-close", title: t("panel.close"), onClick: () => overlayStore.set(false), "aria-label": t("panel.close") }, h(IconClose, { size: 16 }))
				),
				h("div", { className: "dgp-tabs" },
					tabBtn("files", `${t("tab.files")}${git.status ? ` · ${git.allPaths.length}` : ""}`, h(IconFolderOpen, { size: 14 })),
					gitTab,
					tabBtn("settings", t("tab.settings"), h("span", { style: { fontSize: 13, lineHeight: 1 } }, "⚙"))
				),
				h("div", { className: "dgp-body", "data-tab": tab, style: { overflow: "auto", padding: "12px 16px 16px", gap: 10 } },
					tab === "settings" ? h(SettingsView, { maximized, onSetMax })
						: (tab === "files" || git.isRepo === false ? h(FileBrowser, { cwd, status: git.status, refreshTick, onEdited: () => { git.refresh(); setRefreshTick((t) => t + 1); } }) : h(GitView, { git }))
				)
			);
		});

		// ── overlay modal (mirrors DSH Modal visual language) ────────────────────
		function FilePanelOverlay() {
			const open = useSyncExternalStore(subscribeOverlay, getOverlay);
			const hidden = useSyncExternalStore(subscribeHidden, getHidden);
			const overlayRef = useRef(null);
			const t = useT();
			// Suspended (hide): the panel keeps ALL its state (tab, preview file,
			// scroll, search…) and slides out of the viewport, leaving a handle at
			// the top bar; hovering the handle slides it back in instantly.
			const hideTimer = useRef(null);
			const mousePos = useRef({ x: 0, y: 0 });
			// Track the cursor globally: when the cursor leaves the panel and stays
			// out (350ms debounce), suspend automatically — no need to click the
			// suspend button. The handle hot zone (top-center, where hovering the
			// handle just expanded the panel) is exempt, otherwise the panel would
			// instantly re-hide while the cursor still rests on the handle spot.
			useEffect(() => {
				const onMove = (e) => { mousePos.current = { x: e.clientX, y: e.clientY }; };
				document.addEventListener("mousemove", onMove, { passive: true });
				return () => { document.removeEventListener("mousemove", onMove); clearTimeout(hideTimer.current); };
			}, []);
			const cancelHide = useCallback(() => clearTimeout(hideTimer.current), []);
			// Any click inside the panel (e.g. the fullscreen toggle, which
			// resizes the dialog and can momentarily leave the cursor outside its
			// new bounds) grants a short exemption window so the auto-suspend
			// debounce does not fire right after a deliberate in-panel click.
			const lastPanelClick = useRef(0);
			const scheduleHide = useCallback(() => {
				clearTimeout(hideTimer.current);
				hideTimer.current = setTimeout(() => {
					const m = mousePos.current;
					// Handle hot zone (top-center) — where hovering the handle
					// just expanded the panel.
					if (m.y <= 40 && Math.abs(m.x - window.innerWidth / 2) <= 110) return;
					// Cursor is currently back inside the dialog or a popup.
					const el = document.elementFromPoint(m.x, m.y);
					if (el && el.closest?.(".dgp-dialog, .dgp-searchHist, .dgp-branchPop, .dgp-logMenu")) return;
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
			// Workspace list: hero state (no session yet) still lets the panel open
			// on the most recently created workspace directory.
			const wsSnapshot = useSyncExternalStore(
				(cb) => (workspacesService ? workspacesService.list.subscribe(cb) : () => {}),
				() => (workspacesService ? workspacesService.list.getSnapshot() : { items: [], phase: "pending" })
			);
			useEffect(() => {
				if (!open || hidden) return;
				const prevFocus = document.activeElement;
				const FOCUSABLE = 'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
				const onKey = (e) => {
					if (e.key === "Escape") { overlayStore.set(false); return; }
					if (e.key !== "Tab") return;
					const el = overlayRef.current;
					if (!el) return;
					const nodes = [...el.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
					if (nodes.length === 0) { e.preventDefault(); return; }
					const first = nodes[0], last = nodes[nodes.length - 1];
					const active = document.activeElement;
					if (e.shiftKey) {
						if (active === first || !el.contains(active)) { e.preventDefault(); last.focus(); }
					} else {
						if (active === last || !el.contains(active)) { e.preventDefault(); first.focus(); }
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
			const current = snapshot?.current;
			const summary = current !== undefined ? snapshot?.byId?.[current] : undefined;
			let cwd = typeof summary?.cwd === "string" && summary.cwd !== "" ? summary.cwd : null;
			if (cwd === null && wsSnapshot?.phase === "ready" && wsSnapshot.items.length > 0) {
				const recent = wsSnapshot.items.find((w) => typeof w?.path === "string" && w.path !== "") ?? null;
				cwd = recent?.path ?? null;
			}
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
			useEffect(() => {
				if (!open) openReqStore.clear();
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
			// real mouse input (hover on the suspend handle, clicking the mask)
			// would never reach it. On body, z 1050 sits above dsh's root (z 1000).
			return ReactDOM.createPortal(
				h("div", { className: "dgp-root", ref: overlayRef, role: "presentation", "data-hidden": hidden ? "true" : "false" },
					h("div", { className: "dgp-mask", "aria-hidden": "true", "data-hidden": hidden ? "true" : "false", onClick: suspend }),
					h("div", { className: "dgp-dialog", role: "dialog", "aria-modal": "true", "aria-label": t("panel.aria"), "data-max": maximized ? "true" : "false", style: hidden ? { transform: "translateY(-112%)" } : undefined,
						onClickCapture: () => { lastPanelClick.current = Date.now(); },
						onMouseEnter: cancelHide,
						onMouseLeave: (e) => {
							// Moving into a portaled popup (branch list, search
							// history, log menu) is still "inside the panel".
							const t = e.relatedTarget;
							if (t && (t.closest?.(".dgp-searchHist") || t.closest?.(".dgp-branchPop") || t.closest?.(".dgp-logMenu"))) return;
							scheduleHide();
						}
					}, content),
					hidden ? h("div", { className: "dgp-handle", role: "button", tabIndex: 0, title: t("panel.handle"), onMouseEnter: () => hiddenStore.set(false), onClick: () => hiddenStore.set(false), onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); hiddenStore.set(false); } } },
						h(IconChevronDown, { size: 12 }),
						h("span", null, t("trigger.label"))
					) : null
				), document.body);
		}
