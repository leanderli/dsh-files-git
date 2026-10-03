		// ── Session-header trigger capsule (matches "Session log" styling) ──────
		function FileHeaderAction(props) {
			const open = useSyncExternalStore(subscribeOverlay, getOverlay);
			const suspended = useSyncExternalStore(subscribeHidden, getHidden);
			const compact = props?.wide === false; // sidebar collapsed rail: icon only
			const t = useT();
			// While suspended, hovering the exposed top edge restores the panel;
			// this capsule remains a clickable fallback so suspension cannot lock
			// the user out.
			const onTrigger = () => {
				if (getHidden()) { hiddenStore.set(false); return; }
				overlayStore.set(!open);
			};
			return h("button", {
				type: "button",
				className: "dgp-trigger" + (compact ? " dgp-triggerCompact" : ""),
				title: suspended ? t("trigger.resumeTitle") : t("trigger.title"),
				"aria-label": suspended ? t("trigger.resumeLabel") : t("trigger.label"),
				onClick: onTrigger,
				"data-active": (open || suspended) ? "true" : "false",
				"data-suspended": suspended ? "true" : undefined
			}, compact ? null : h("span", null, t("trigger.label")), h(IconFolderOpen, { size: 12 }));
		}

		// ── composer reference injector (session scope, headless) ────────────────
		// Renders nothing. It exists to OWN the session-scope input face that the
		// panel cannot reach: slot components mounted inside a session receive
		// `inputActions` (documented programmatic draft write) plus the InputZone
		// `input` projection (draft text). The panel lives in the SHELL scope, so
		// its row buttons hand the request to the store bridge and this component
		// performs the insert — the same cross-scope pattern the openPath
		// interception already uses.
		//
		// Registered in two session slots (dock + header utilities): whichever is
		// mounted consumes the request, and `consume()` is take-and-clear so a
		// request can never be applied twice. Missing props (older DSH build, or a
		// slot that does not carry the input face) degrade to a silent no-op
		// instead of throwing — the rest of the panel keeps working.
		function ReferenceInjector(props) {
			// The draft MUST be read live. `props.input` is a render-time SNAPSHOT of
			// the input state and the slot owner does not re-render on every draft
			// change, so reading it made the second click compose from the OLD text
			// and overwrite the first mention (reported: only one reference
			// survives). `useInput` is the store-subscription hook the runner pairs
			// with `inputActions` exactly for live reads; it re-renders us on each
			// draft change. The hook is always present on current builds; when it is
			// absent the conditional call is still stable for a mounted cell and we
			// fall back to our own last write (never to the stale snapshot first).
			const useInput = typeof props?.useInput === "function" ? props.useInput : null;
			const live = useInput ? useInput((s) => s?.draft ?? "") : null;
			const lastWrittenRef = useRef(null);
			const snapshot = props?.input?.draft ?? "";
			const draftRef = useRef("");
			draftRef.current = live ?? lastWrittenRef.current ?? snapshot;
			const actionsRef = useRef(null);
			actionsRef.current = props?.inputActions ?? null;
			useEffect(() => subscribeRefReq(() => {
				const req = consumeRefReq();
				const actions = actionsRef.current;
				if (!req || !actions || typeof actions.setDraft !== "function") return;
				const mention = fileMentionText(req.path, req.isDir);
				if (mention === "") return;
				const next = appendMention(draftRef.current, mention);
				if (next === draftRef.current) return;
				// Record our own write first: if the live read is unavailable on the
				// next click, accumulating from this value still keeps every mention.
				lastWrittenRef.current = next;
				actions.setDraft(next);
			}), []);
			return null;
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
					// Shallow-equal guard: the observers below re-measure on every
					// composer mutation (even per keystroke via childList changes);
					// skip the state write when the geometry did not actually change,
					// or typing would re-render this capsule for nothing.
					const next = { top: rr.top - base.top, height: rr.height, left: sr.left - base.left, width: sr.width };
					if (alive) setOffset((prev) => (prev && prev.top === next.top && prev.height === next.height && prev.left === next.left && prev.width === next.width ? prev : next));
				};
				measure();
				// The composer changes height INDEPENDENTLY of the window: an
				// image/file attachment grows the input card (attachment strip)
				// which can rise over the hero row and cover this capsule — the
				// old one-shot 250ms + window-resize measure missed that. Keep
				// the geometry fresh: re-measure (rAF-throttled) on any size
				// change of the hero row's stack / containing region and on any
				// DOM mutation inside the composer region (strip mount/unmount).
				let raf = 0;
				const schedule = () => {
					if (raf !== 0 || !alive) return;
					raf = requestAnimationFrame(() => { raf = 0; if (alive) measure(); });
				};
				let ro = null;
				let mo = null;
				try {
					const stack0 = document.querySelector('[class*="heroWorkspaceRow"]')?.parentElement ?? null;
					const region = dockRef.current?.offsetParent ?? stack0?.parentElement ?? null;
					ro = new ResizeObserver(schedule);
					if (stack0) ro.observe(stack0);
					if (region && region !== stack0) ro.observe(region);
					const mroot = region ?? stack0;
					if (mroot) {
						mo = new MutationObserver(schedule);
						mo.observe(mroot, { childList: true, subtree: true });
					}
				} catch { /* observers unavailable: resize + timeout fallbacks remain */ }
				window.addEventListener("resize", schedule);
				return () => {
					alive = false;
					if (raf !== 0) cancelAnimationFrame(raf);
					window.removeEventListener("resize", schedule);
					try { ro?.disconnect(); } catch { /* noop */ }
					try { mo?.disconnect(); } catch { /* noop */ }
				};
			}, [blank]);
			if (!blank) return null; // active session: header button is showing
			// Suspended: keep the same restore-on-click fallback as the header.
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
				title: suspended ? t("trigger.resumeTitle") : t("trigger.title"),
				"aria-label": suspended ? t("trigger.resumeLabel") : t("trigger.label"),
				onClick: onTrigger,
				"data-active": (open || suspended) ? "true" : "false",
				"data-suspended": suspended ? "true" : undefined
				}, h("span", null, t("trigger.label")), h(IconFolderOpen, { size: 12 })));
		}
