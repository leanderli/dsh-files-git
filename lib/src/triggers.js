		// ── Session-header trigger capsule (matches "Session log" styling) ──────
		function FileHeaderAction(props) {
			const open = useSyncExternalStore(subscribeOverlay, getOverlay);
			const suspended = useSyncExternalStore(subscribeHidden, getHidden);
			const compact = props?.wide === false; // sidebar collapsed rail: icon only
			const t = useT();
			if (suspended) return null; // while suspended the top-bar handle is the only entry
			return h("button", {
				type: "button",
				className: "dgp-trigger" + (compact ? " dgp-triggerCompact" : ""),
				title: t("trigger.title"),
				onClick: () => overlayStore.set(!open),
				"data-active": open ? "true" : "false"
			}, compact ? null : h("span", null, t("trigger.label")), h(IconFolderOpen, { size: 12 }));
		}

		// ── Blank-session trigger aligned to the hero workspace row ─────────────
		// DSH renders the session header (and our header button) only once a
		// conversation exists. In a fresh workspace with no chat yet the header is
		// hidden (`hideChrome`), and the composer shows its hero row — the line of
		// workspace/agent chips just above the input. We render our borderless
		// capsule as an absolutely-positioned overlay pinned to the RIGHT end of
		// that same hero row (measured at runtime), so it never becomes its own
		// extra row — and it disappears the moment the session engages (top bar
		// with its 文件与变更 button takes over).
		function InputDockTrigger(props) {
			const open = useSyncExternalStore(subscribeOverlay, getOverlay);
			const suspended = useSyncExternalStore(subscribeHidden, getHidden);
			const session = props?.session;
			const blank = session?.blank === true && session?.composerPhase === "blank";
			const t = useT();
			const [offset, setOffset] = useState(null);
			useEffect(() => {
				if (!blank) { setOffset(null); return; }
				let alive = true;
				const measure = () => {
					const row = document.querySelector('[class*="heroWorkspaceRow"]');
					const stack = row?.parentElement;
					if (!row || !stack) return;
					const rr = row.getBoundingClientRect();
					const sr = stack.getBoundingClientRect();
					if (alive) setOffset({ top: rr.top - sr.top, height: rr.height });
				};
				measure();
				const t = setTimeout(measure, 250);
				window.addEventListener("resize", measure);
				return () => { alive = false; clearTimeout(t); window.removeEventListener("resize", measure); };
			}, [blank]);
			if (!blank || suspended) return null; // active session: header button is showing
			return h("div", {
				className: "dgp-dockRow",
				style: offset ? { top: offset.top, height: offset.height } : undefined
			},
				h("button", {
					type: "button",
					className: "dgp-trigger dgp-triggerGhost",
					title: t("trigger.title"),
					onClick: () => overlayStore.set(!open),
					"data-active": open ? "true" : "false"
				}, h("span", null, t("trigger.label")), h(IconFolderOpen, { size: 12 })));
		}
