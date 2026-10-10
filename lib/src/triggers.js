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

		// ── Blank-session trigger at the end of the composer leading controls ──
		// The host renders input.left after its built-in permission/plan controls
		// and before the trailing model/submit group, so the folder action remains
		// beside related input tools without entering the hero/pet overlay area.
		function InputLeftTrigger(props) {
			const open = useSyncExternalStore(subscribeOverlay, getOverlay);
			const suspended = useSyncExternalStore(subscribeHidden, getHidden);
			const blank = typeof props?.useSession === "function"
				? props.useSession((session) => session?.blank === true && shellPhaseOf(session) === "blank")
				: false;
			const t = useT();
			if (!blank) return null; // active sessions use the header button instead
			const onTrigger = () => {
				if (getHidden()) { hiddenStore.set(false); return; }
				overlayStore.set(!open);
			};
			return h("button", {
				type: "button",
				className: "dgp-trigger dgp-triggerCompact dgp-triggerGhost",
				title: suspended ? t("trigger.resumeTitle") : t("trigger.title"),
				"aria-label": suspended ? t("trigger.resumeLabel") : t("trigger.label"),
				onClick: onTrigger,
				"data-active": (open || suspended) ? "true" : "false",
				"data-suspended": suspended ? "true" : undefined
			}, h(IconFolderOpen, { size: 14 }));
		}
