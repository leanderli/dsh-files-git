		/** Required client services: slot registry, session runtime, workspace list, locale (i18n). */
		const inject = ["slots", "sessions", "workspaces", "locale"];

		/** Setting key: route produced-file/link clicks into the panel preview. */
		const PREVIEW_OPEN_KEY = "dsh-files-git.previewOpenPath";
		const previewOpenEnabled = () => {
			try { return localStorage.getItem(PREVIEW_OPEN_KEY) === "1"; } catch { return false; }
		};

		/**
		 * Register the trigger capsules (session header + blank-session input dock,
		 * so the button stays reachable before any conversation exists) and overlay.
		 */
		function apply(ctx) {
			sessionsService = ctx.sessions;
			workspacesService = ctx.workspaces;
			// i18n: register the zh/en dictionaries and bind the LocaleFace.
			// ctx.effect disposes the registration on HMR reload (the locale
			// service rejects duplicate registrations of the same namespace).
			ctx.effect(() => installLocale(ctx.locale), "files-git: locale");
			// Intercept the workspace "open with system application" entry point.
			// This is the ONLY caller of the host openPath RPC (the conversation
			// view's file opener), so wrapping it covers every produced-file chip,
			// in-message file mention and "open in folder" action with no other
			// side effects. When the setting is on, FILE paths are previewed in
			// the panel instead; directories ("." and friends) always keep the
			// system behavior.
			const openPath = workspacesService?.openPath?.bind(workspacesService);
			if (typeof openPath === "function") {
				workspacesService.openPath = async (path) => {
					if (previewOpenEnabled() && typeof path === "string" && path.trim() !== "" && path !== "." && !/[\\/]$/.test(path)) {
						try {
							const st = await gitRpc("stat", { repo: cwdOf(), path: path.trim() });
							if (st?.type === "file") {
								overlayStore.set(true);
								// Also slide the panel back in if it was suspended:
								// a produced-file click must always surface the preview.
								hiddenStore.set(false);
								openReqStore.request(path.trim());
								return;
							}
						} catch { /* stat unreachable / foreign: fall through to the system opener */ }
					}
					return openPath(path);
				};
			}
			// Trigger A: conversation.session.header.utilities (list, session-scope),
			// order -1 so it renders just LEFT of the "Session log" capsule (order 0).
			ctx.slots.inject("conversation.session.header.utilities", () =>
				ctx.slots.register({ name: "conversation.session.header.utilities", id: "files-git", order: -1 }, FileHeaderAction));
			// Trigger B: conversation.input.dock (list, session-scope) — the session
			// header does not render before a conversation exists (blank session,
			// hero state), so this borderless capsule renders in the row right
			// ABOVE the composer input (right-aligned to the input card) and
			// self-hides once the session engages (header button takes over).
			ctx.slots.inject("conversation.input.dock", () =>
				ctx.slots.register({ name: "conversation.input.dock", id: "files-git" }, InputDockTrigger));
			// Modal: shell.overlay (list, root-scope, additive — no conflict).
			ctx.slots.inject("shell.overlay", () =>
				ctx.slots.register({ name: "shell.overlay", id: "files-git" }, FilePanelOverlay));
		}

		/** Absolute path of the active session's workspace (mirrors overlay cwd resolution). */
		function cwdOf() {
			const snapshot = sessionsService?.list?.getSnapshot?.() ?? null;
			const current = snapshot?.current;
			const summary = current !== undefined ? snapshot?.byId?.[current] : undefined;
			if (typeof summary?.cwd === "string" && summary.cwd !== "") return summary.cwd;
			const ws = workspacesService?.list?.getSnapshot?.();
			if (Array.isArray(ws?.items) && ws.items.length > 0) {
				const recent = ws.items.find((w) => typeof w?.path === "string" && w.path !== "") ?? null;
				if (recent) return recent.path;
			}
			return "";
		}

		exports.FileHeaderAction = FileHeaderAction;
		exports.FilePanelOverlay = FilePanelOverlay;
		exports.apply = apply;
		exports.inject = inject;
