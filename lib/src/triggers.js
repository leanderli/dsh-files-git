		// ── Session-header trigger capsule (matches "Session log" styling) ──────
		function FileHeaderAction(props) {
			const open = useSyncExternalStore(subscribeOverlay, getOverlay);
			const suspended = useSyncExternalStore(subscribeHidden, getHidden);
			const compact = props?.wide === false; // sidebar collapsed rail: icon only
			const t = useT();
			// While suspended the top-center handle is the hover entry, but the
			// header capsule stays clickable as a SECOND entry — clicking it
			// slides the panel back in. A stranded suspension (e.g. the handle
			// missed, or the slot briefly died) must never lock the user out.
			const onTrigger = () => {
				if (getHidden()) { hiddenStore.set(false); return; }
				overlayStore.set(!open);
			};
			return h("button", {
				type: "button",
				className: "dgp-trigger" + (compact ? " dgp-triggerCompact" : ""),
				title: t("trigger.title"),
				onClick: onTrigger,
				"data-active": (open || suspended) ? "true" : "false"
			}, compact ? null : h("span", null, t("trigger.label")), h(IconFolderOpen, { size: 12 }));
		}

		// ── Shell phase (DSH 0.1.2 compatibility) ───────────────────────────────
		// Older dsh builds carried `composerPhase` on the session snapshot; the
		// 0.1.2 conversation shell removed that field and now derives the same
		// "blank | engaging | active" machine locally (its conversationPhase():
		// active while a turn is observable or the session is running, engaging
		// once a prompt has been attempted, blank otherwise). Mirror that
		// derivation from the fields that remain, keeping the legacy field as a
		// fallback so this trigger stays correct on both generations.
		function shellPhaseOf(session) {
			if (!session) return "blank";
			if (typeof session.composerPhase === "string") return session.composerPhase;
			if (session.running === true || (session.blank === false && session.awaitingFirstTurn === false)) return "active";
			return session.promptAttempted === true ? "engaging" : "blank";
		}

		// ── Blank-session trigger aligned to the hero workspace row ─────────────
		// DSH renders the session header (and our header button) only once a
		// conversation exists. In a fresh workspace with no chat yet the header is
		// hidden (`hideChrome` = session.blank && phase "blank" — exactly the
		// condition mirrored below), and the composer shows its hero row — the
		// line of workspace/agent chips just above the input. We render our
		// borderless capsule as an absolutely-positioned overlay pinned to the
		// RIGHT end of that same hero row (measured at runtime), so it never
		// becomes its own extra row — and it disappears the moment the session
		// engages (top bar with its 文件与变更 button takes over).
		function InputDockTrigger(props) {
			const open = useSyncExternalStore(subscribeOverlay, getOverlay);
			const suspended = useSyncExternalStore(subscribeHidden, getHidden);
			const session = props?.session;
			const blank = session?.blank === true && shellPhaseOf(session) === "blank";
			const t = useT();
			const [offset, setOffset] = useState(null);
			const dockRef = useRef(null);
			// Layout effect: the capsule must be pinned before the first paint or
			// it flashes at its unmeasured fallback position.
			React.useLayoutEffect(() => {
				if (!blank) { setOffset(null); return; }
				let alive = true;
				const measure = () => {
					const row = document.querySelector('[class*="heroWorkspaceRow"]');
					const dock = dockRef.current;
					const stack = row?.parentElement;
					if (!row || !stack || !dock) return;
					// Containing block the browser actually resolves for the
					// absolutely-positioned dockRow. DSH moved its
					// position:relative around between releases (0.1.2 keeps it
					// off the composer stack, so the old full-width
					// `left:0;right:0` stretched to the shell edge), so instead
					// of trusting the containing block width we overlay the
					// hero row's parent stack — card-wide and centered in the
					// hero state — with explicit left/width relative to that
					// real containing block.
					const base = dock.offsetParent
						? dock.offsetParent.getBoundingClientRect()
						: stack.getBoundingClientRect();
					if (!base) return;
					const rr = row.getBoundingClientRect();
					const sr = stack.getBoundingClientRect();
					if (alive) setOffset({
						top: rr.top - base.top,
						height: rr.height,
						left: sr.left - base.left,
						width: sr.width
					});
				};
				measure();
				const t = setTimeout(measure, 250);
				window.addEventListener("resize", measure);
				return () => { alive = false; clearTimeout(t); window.removeEventListener("resize", measure); };
			}, [blank]);
			if (!blank) return null; // active session: header button is showing
			// Suspended: same restore-on-click contract as the header capsule.
			const onTrigger = () => {
				if (getHidden()) { hiddenStore.set(false); return; }
				overlayStore.set(!open);
			};
			return h("div", {
				ref: dockRef,
				className: "dgp-dockRow",
				// right:"auto" neutralizes the stylesheet's right:0 once the
				// explicit left/width geometry is known.
				style: offset ? { top: offset.top, height: offset.height, left: offset.left, width: offset.width, right: "auto" } : undefined
			},
				h("button", {
					type: "button",
					className: "dgp-trigger dgp-triggerGhost",
					title: t("trigger.title"),
					onClick: onTrigger,
					"data-active": (open || suspended) ? "true" : "false"
				}, h("span", null, t("trigger.label")), h(IconFolderOpen, { size: 12 })));
		}
