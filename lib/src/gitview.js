		// ── Branch selector in the shared header's Git context ─────────────────
		function BranchSelector({ git, showLabel = false }) {
			const [branchOpen, setBranchOpen] = useState(false);
			const [branchQuery, setBranchQuery] = useState("");
			const [branchSel, setBranchSel] = useState(null);   // branch row being acted on
			const [branchInput, setBranchInput] = useState(null); // {mode:"new"|"rename", value}
			const t = useT();
			const closeBranch = useCallback(() => { setBranchOpen(false); setBranchSel(null); setBranchInput(null); setBranchQuery(""); }, []);

			// Suspending the panel (manual button or auto mouse-out) must close
			// the popup: it is portaled under .dgp-root, so the dialog's
			// slide-out transform never moves it — without this reset it keeps
			// floating over the main UI while suspended, and the hidden root's
			// pointer-events:none makes it unclosable until the panel restores.
			const panelHidden = useSyncExternalStore(subscribeHidden, getHidden);
			useEffect(() => { if (panelHidden) closeBranch(); }, [panelHidden, closeBranch]);

			// Esc closes the branch popup (stopPropagation so the panel-level Esc
			// handler that closes the whole overlay doesn't fire at the same time).
			useEffect(() => {
				if (!branchOpen) return;
				const onKey = (e) => { if (e.key === "Escape") { e.stopPropagation(); closeBranch(); } };
				document.addEventListener("keydown", onKey, true);
				return () => document.removeEventListener("keydown", onKey, true);
			}, [branchOpen, closeBranch]);
			// Click-outside closes: the popup itself and the chevron button stop
			// propagation, so any click that bubbles to document happened
			// outside → close (same pattern as the history context menu).
			useEffect(() => {
				if (!branchOpen) return;
				const onClick = () => closeBranch();
				document.addEventListener("click", onClick);
				return () => document.removeEventListener("click", onClick);
			}, [branchOpen, closeBranch]);
			// The branch list is portaled to the panel root (outside the dialog
			// content) so its backdrop-filter renders, and positioned in fixed
			// viewport coordinates taken from the chevron button. While open, the
			// wheel is locked everywhere in the panel except inside the popup, so
			// scrolling cannot pass through to the content beneath it.
			const [branchPos, setBranchPos] = useState(null);
			useEffect(() => {
				if (!branchOpen) return;
				const onWheel = (e) => {
					if (e.target.closest(".dgp-branchPop")) return;
					if (e.target.closest(".dgp-root")) e.preventDefault();
				};
				document.addEventListener("wheel", onWheel, { passive: false });
				return () => document.removeEventListener("wheel", onWheel);
			}, [branchOpen]);

			const allBranches = git.branches ?? [];
			const locals = allBranches.filter((b) => !b.remote);
			const remotes = allBranches.filter((b) => b.remote);
			const q = branchQuery.trim().toLowerCase();
			// Current branch first, then locals, then remotes (each name-sorted).
			const sortedBranches = (list) => [...list].sort((a, b) => {
				if (!!a.current !== !!b.current) return a.current ? -1 : 1;
				if (!!a.remote !== !!b.remote) return a.remote ? 1 : -1;
				return a.name.localeCompare(b.name);
			});
			const visibleBranches = q ? sortedBranches(allBranches.filter((b) => b.name.toLowerCase().includes(q))) : sortedBranches(allBranches);

			const runBranchAction = async (fn) => {
				closeBranch();
				await fn();
			};

			const branchRow = (b) => {
				const selected = branchSel?.name === b.name;
				const displayName = b.remote ? b.name.slice("origin/".length) : b.name;
				return h("div", { key: b.name, className: "dgp-row", "data-clickable": "true", "data-selected": selected ? "true" : "false", "data-muted": b.remote ? "true" : "false", "data-current": b.current ? "true" : "false", onClick: () => setBranchSel(b) },
					h("span", { className: "dgp-badge", "data-tone": b.current ? "success" : (b.remote ? "remote" : "info") }, b.current ? t("branch.current") : (b.remote ? t("branch.remote") : t("branch.local"))),
					h("span", { className: "dgp-rowPath", title: b.name }, displayName),
					b.upstream ? h("span", { className: "dgp-rowMeta", title: t("branch.upstream", { name: b.upstream }) }, b.upstream) : null,
					b.sha ? h("span", { className: "dgp-rowMeta" }, b.sha) : null
				);
			};

			const displayNameOf = (b) => b.remote ? b.name.slice("origin/".length) : b.name;

			// Per-branch action bar (icon + text, by common-use priority).
			const branchActions = branchSel ? h("div", { className: "dgp-branchActions" },
				h("div", { className: "dgp-sectionTitle", style: { marginBottom: 6 } }, t("branch.title", { name: branchSel.name })),
				h("div", { className: "dgp-actions", style: { flexWrap: "wrap" } },
					btn(t("branch.checkout"), () => runBranchAction(() => git.checkoutBranch(branchSel.remote ? branchSel.name.slice("origin/".length) : branchSel.name)), { disabled: git.busy !== null || branchSel.current, variant: "primary", icon: h(IconBranchOp, { size: 14 }), title: branchSel.current ? t("branch.currentTitle") : t("branch.checkoutTitle") }),
					btn(t("branch.merge"), () => runBranchAction(() => git.mergeBranch(branchSel.name)), { disabled: git.busy !== null || branchSel.current, icon: h(IconRightUp, { size: 14 }), title: branchSel.current ? t("branch.mergeCurrent") : t("branch.mergeTitle") }),
					btn(t("branch.new"), () => { setBranchInput({ mode: "new", value: "" }); }, { disabled: git.busy !== null, icon: h(IconPlus, { size: 14 }), title: t("branch.newTitle") }),
					btn(t("branch.update"), () => runBranchAction(() => git.updateBranch(branchSel.name)), { disabled: git.busy !== null || branchSel.remote, icon: h(IconDownload, { size: 14 }), title: branchSel.remote ? t("branch.remoteNoUpdate") : t("branch.updateTitle") }),
					btn(t("branch.rename"), () => { setBranchInput({ mode: "rename", value: branchSel.remote ? "" : displayNameOf(branchSel) }); }, { disabled: git.busy !== null || branchSel.remote, icon: h(IconEdit, { size: 14 }), title: branchSel.remote ? t("branch.remoteNoRename") : t("branch.renameTitle") })
				),
				branchInput ? h("div", { className: "dgp-branchInput" },
					h("input", { className: "dgp-textarea", style: { height: 34, padding: "0 10px" }, placeholder: branchInput.mode === "new" ? t("branch.newName") : t("branch.newRename"), value: branchInput.value, onChange: (e) => setBranchInput((bi) => ({ ...bi, value: e.target.value })), onKeyDown: (e) => { if (e.key === "Enter" && branchInput.value.trim()) submitBranchInput(); if (e.key === "Escape") setBranchInput(null); } }),
					h("span", { style: { flex: 1 } }),
					lbtn(t("common.cancel"), () => setBranchInput(null)),
					lbtn(t("common.ok"), () => submitBranchInput())
				) : null
			) : null;

			const submitBranchInput = () => {
				const name = (branchInput?.value ?? "").trim();
				if (!name) return;
				if (branchInput.mode === "new") {
					const start = branchSel?.name ?? "";
					runBranchAction(() => git.checkoutBranch(name, { create: true, start }));
				} else if (branchInput.mode === "rename" && branchSel) {
					const target = branchSel.name;
					runBranchAction(() => git.renameBranch(target, name));
				}
			};

			return h("div", { className: "dgp-branchTab", "data-open": branchOpen ? "true" : "false" },
				h("button", {
					type: "button",
					className: showLabel ? "dgp-branchSelect" : "dgp-tabArrow",
					title: (showLabel ? (git.status?.branch || "") + "\n" : "") + t("branch.arrowTitle", { l: locals.length, r: remotes.length }),
					"aria-label": t("branch.arrowTitle", { l: locals.length, r: remotes.length }), "aria-haspopup": "dialog", "aria-expanded": branchOpen,
					onClick: (e) => {
						e.stopPropagation();
						if (!branchOpen) {
							const r = e.currentTarget.getBoundingClientRect();
							setBranchPos({ left: Math.round(r.left), top: Math.round(r.bottom + 4) });
						}
						setBranchOpen((o) => !o);
					},
					"data-open": branchOpen ? "true" : "false"
				}, showLabel ? h(React.Fragment, null, h(IconBranch, { size: 14 }), h("span", { className: "dgp-toolbarTitle" }, git.status?.branch || "…")) : null, h(IconChevronDown, { size: 12 })),
				branchOpen && branchPos ? portal(h("div", { className: "dgp-branchPop", role: "dialog", "aria-label": t("branch.popTitle", { l: locals.length, r: remotes.length }), style: { left: branchPos.left, top: branchPos.top }, onClick: (e) => e.stopPropagation() },
					h("div", { className: "dgp-branchPopHead" }, t("branch.popTitle", { l: locals.length, r: remotes.length })),
					h("input", { className: "dgp-branchSearch", placeholder: t("branch.search"), value: branchQuery, onChange: (e) => setBranchQuery(e.target.value) }),
					h("div", { className: "dgp-branchList" },
						visibleBranches.length === 0 ? h("div", { className: "dgp-paneEmpty" }, t("branch.noMatch")) : visibleBranches.map(branchRow)
					),
					branchActions,
					h("div", { className: "dgp-branchPopFoot" }, lbtn(t("common.close"), () => closeBranch()))
				), document.querySelector(".dgp-root")) : null
			);
		}

		// ── confirmation dialog for dangerous operations ───────────────────────
		function ConfirmDialog({ spec, onClose }) {
			const t = useT();
			const dialogRef = useRef(null);
			useEffect(() => {
				if (!spec) return;
				const previous = document.activeElement;
				dialogRef.current?.querySelector("button:not(:disabled)")?.focus();
				return () => { if (previous?.isConnected) previous.focus(); };
			}, [spec]);
			if (!spec) return null;
			const keys = (e) => {
				if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); }
				if (e.key !== "Tab") return;
				e.stopPropagation();
				const buttons = [...(dialogRef.current?.querySelectorAll("button:not(:disabled)") ?? [])];
				const first = buttons[0], last = buttons[buttons.length - 1];
				if (!first) { e.preventDefault(); return; }
				if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
				else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
			};
			return h("div", { className: "dgp-confirm", ref: dialogRef, onClick: onClose, role: "dialog", "aria-modal": "true", "aria-label": spec.title, onKeyDown: keys },
				h("div", { className: "dgp-confirmCard", onClick: (e) => e.stopPropagation() },
					h("div", { className: "dgp-confirmTitle", "data-danger": spec.danger ? "true" : "false" },
						spec.danger ? h(IconWarning, { size: 15 }) : h(IconBranchOp, { size: 15 }),
						spec.title),
					spec.message ? h("div", { className: "dgp-confirmMsg" }, spec.message) : null,
					h("div", { className: "dgp-confirmActions" },
						spec.dismissOnly ? btn(t("common.close"), onClose) : h(React.Fragment, null, btn(t("common.cancel"), onClose),
						btn(spec.confirmLabel || t("common.ok"), () => { const fn = spec.onConfirm; onClose(); fn(); }, { variant: spec.danger ? "dangerFill" : "primary" }))
					)
				)
			);
		}

		// ── Git tab ──────────────────────────────────────────────────────────────
		function GitView({ git, headerHost, pageNavigation }) {
			const busyOn = (label) => git.busy === label || git.busy === "op.refresh";
			const s = git.status;
			const t = useT();
			// Narrow viewport: the work area collapses to one screen at a time —
			// changes list, or the full-width diff (DiffPane's 关闭 acts as back).
			const narrow = useNarrow();

			// Confirmation dialog for dangerous ops: {title, message, confirmLabel, danger, onConfirm}
			const [confirm, setConfirm] = useState(null);

			// Working-tree diff split: left (changes) : right (diff), default 3:7.
			// Dragging the gutter overrides; double-click restores the default.
			const [diffFrac, setDiffFrac] = useState(null);
			const diffRef = useRef(null);
			const onDiffGutterDown = useCallback((e) => {
				e.preventDefault();
				const el = diffRef.current;
				if (!el) return;
				const move = (ev) => {
					const rect = el.getBoundingClientRect();
					if (rect.width <= 0) return;
					let f = (ev.clientX - rect.left) / rect.width;
					f = Math.max(0.08, Math.min(0.7, f));   // clamp 8%–70%
					setDiffFrac(f);
				};
				const up = () => {
					window.removeEventListener("pointermove", move);
					window.removeEventListener("pointerup", up);
					window.removeEventListener("pointercancel", up);
				};
				window.addEventListener("pointermove", move);
				window.addEventListener("pointerup", up);
				// pointercancel: the browser took the pointer mid-drag — clean up
				// so the window listeners never leak until the next drag.
				window.addEventListener("pointercancel", up);
			}, []);
			const resetDiffSplit = useCallback(() => setDiffFrac(null), []);
			const diffShare = diffFrac ?? 0.3;

			const pull = () => git.runOp("op.pull", () => gitRpc("pull", { repo: git.cwd, rebase: git.rebase || undefined }));
			const push = (force = false) => {
				const doPush = () => git.runOp("op.push", () => gitRpc("push", { repo: git.cwd, force: force || undefined }));
				if (force) setConfirm({ title: t("gv.forceTitle2"), message: t("gv.forceMsg", { upstream: s?.upstream ? t("gv.forceUpstream", { name: s.upstream }) : "" }), confirmLabel: t("gv.forceConfirm"), danger: true, onConfirm: doPush });
				else doPush();
			};
			const repoInfo = () => setConfirm({ title: t("gv.repoInfo"), dismissOnly: true, message: h("div", { className: "dgp-repoInfoRows" },
				[[t("gv.upstreamLabel"), s?.upstream || "—"], [t("gv.remoteLabel"), git.gitConfig?.remote || "—"], [t("gv.identityLabel"), git.gitConfig?.name || git.gitConfig?.email ? `${git.gitConfig.name ?? ""} <${git.gitConfig.email ?? ""}>`.trim() : t("gv.noIdentity")]].map(([label, value]) => h("div", { key: label, className: "dgp-repoInfoRow" }, h("span", { className: "dgp-repoInfoLabel" }, label), h("span", { className: "dgp-repoInfoValue" }, value)))) });
			const repoMenu = h(ToolbarMenu, { label: t("gv.repoActions"), items: [
				narrow ? { label: t("gv.pull"), icon: IconRefresh, disabled: git.busy !== null || !s, run: pull } : null,
				narrow ? { label: t("gv.push"), icon: IconSend, disabled: git.busy !== null || !s, run: () => push() } : null,
				{ label: busyOn("op.fetch") ? t("gv.fetchBusy") : t("gv.fetch"), icon: IconDownload, disabled: git.busy !== null || !s, run: () => git.runOp("op.fetch", () => gitRpc("fetch", { repo: git.cwd })) },
				{ label: t("gv.rebase"), icon: IconBranch, checked: git.rebase, disabled: git.busy !== null, run: () => git.setRebase(!git.rebase) },
				{ label: t("gv.forceAction"), icon: IconWarning, disabled: git.busy !== null || !s, danger: true, run: () => push(true) },
				{ label: t("gv.repoInfo"), icon: IconInfo, run: repoInfo }
			].filter(Boolean) });
			const toolbar = h("div", { className: "dgp-pageToolbar dgp-gitToolbar" },
				pageNavigation ? h("span", { className: "dgp-toolbarDivider", "aria-hidden": "true" }) : null,
				pageNavigation,
				h("div", { className: "dgp-gitContext" }, h(BranchSelector, { git, showLabel: true }),
					s ? h("span", { className: "dgp-changeCount" }, t("git.changes", { count: git.allPaths.length })) : null,
					s?.ahead > 0 ? chip(t("gv.ahead", { count: s.ahead }), "primary") : null,
					s?.behind > 0 ? chip(t("gv.behind", { count: s.behind }), "warn") : null),
				h("div", { className: "dgp-pageActions" }, !narrow ? h(React.Fragment, null,
					lbtn(busyOn("op.pull") ? t("gv.pullBusy") : t("gv.pull"), pull, { disabled: git.busy !== null || !s, icon: h(IconRefresh, { size: 14 }) }),
					lbtn(busyOn("op.push") ? t("gv.pushBusy") : t("gv.push"), () => push(), { disabled: git.busy !== null || !s, icon: h(IconSend, { size: 14 }) })) : null, repoMenu));
			const opOutput = git.op ? h("div", { className: "dgp-op", "data-status": git.op.status },
						h("div", { className: "dgp-opHead" },
							h("span", { className: "dgp-opIcon", "data-status": git.op.status },
								git.op.status === "running" ? h(IconLoading, { size: 14 })
									: git.op.status === "success" ? h(IconCheckOk, { size: 14 })
									: h(IconWarning, { size: 14 })
							),
							h("span", { className: "dgp-opTitle" },
								t(git.op.status === "running" ? "gv.opRunning" : git.op.status === "success" ? "gv.opSuccess" : "gv.opFailed", { label: t(git.op.label) })),
							h("span", { style: { flex: 1 } }),
							h("button", { type: "button", className: "dgp-opClose", title: t("gv.opClose"), "aria-label": t("gv.opCloseAria"), onClick: () => git.setOp(null) }, h(IconClose, { size: 12 }))
						),
						git.op.status === "running" ? h("div", { className: "dgp-progress" }, h("div", { className: "dgp-progressBar" })) : null,
						git.op.detail ? h("pre", { className: "dgp-opDetail" }, git.op.detail) : null
					) : null;
			return h(React.Fragment, null,
				inPanelHeader(headerHost, git.commitDetail ? null : toolbar),
				// Keep the work tree mounted behind history details, preserving
				// the draft and editor. Empty and selected-diff states share a split.
				h("div", { className: "dgp-gitWork", hidden: !!git.commitDetail, "data-diff": git.diff ? "true" : "false", ref: narrow ? undefined : diffRef, style: !narrow ? { gridTemplateColumns: `minmax(240px,${diffShare.toFixed(3)}fr) 8px minmax(0,${(1 - diffShare).toFixed(3)}fr)` } : undefined },
					// The left column owns changes, history and the bottom draft.
					// Hiding it on narrow screens preserves the draft.
					h("div", { className: "dgp-gitCol", hidden: narrow && !!git.diff },
						s ? h(ChangeList, {
							status: s, allPaths: git.allPaths, selected: git.selected, busy: git.busy,
							onShowDiff: git.showDiff, onShowNewFile: git.showNewFile, onTogglePath: git.togglePath,
							onStage: git.stagePath, onUnstage: git.unstagePath, onUntrack: git.untrackPath, onIgnore: git.ignorePath,
							onSelectAll: git.selectAll, onClearAll: git.clearAll
						}) : h("div", { className: "dgp-empty dgp-gitGrow" }, t("common.loading")),
						s ? h("div", { className: "dgp-gitState" },
							s.conflicts?.length > 0 ? chip(t("gv.conflicts", { count: s.conflicts.length }), "error") : null,
							git.busy !== null || git.readBusy !== null ? h("span", { className: "dgp-hint" }, t("gv.busy", { op: t(git.busy ?? git.readBusy) })) : null) : null,
						opOutput,
						git.log?.lines?.length > 0 ? h(HistoryBlock, { log: git.log, currentHash: null, onShowCommit: git.showCommit, setConfirm, runOp: git.runOp, cwd: git.cwd }) : null,
						h(CommitBox, { busy: git.busy, commitWith: git.commitWith, hasRepo: !!s })
					),
					// right pane: working-tree diff preview, split by a draggable
					// gutter (default left 3 : right 7; double-click resets).
					// Narrow: the diff takes the full width — no gutter, and its
					// 关闭 button is the way back to the changes list.
					narrow ? null : h("div", { className: "dgp-gutter", title: t("file.gutter"), onPointerDown: onDiffGutterDown, onDoubleClick: resetDiffSplit }),
					git.diff ? h(DiffPane, { diff: git.diff, onShowDiff: git.showDiff, onClose: () => git.setDiff(null) }) : !narrow ? h("div", { className: "dgp-diffEmpty" }, h(IconCode, { size: 28 }), h("span", null, t("git.chooseFileHint"))) : null
				),
				git.commitDetail ? h(CommitDetailView, { commitDetail: git.commitDetail, onShowFile: git.showCommitFile, onClose: git.closeCommitDetail, headerHost, pageNavigation }) : null,
				git.error ? h("div", { className: "dgp-error" }, h("span", { style: { flex: 1 } }, git.error), lbtn(t("common.close"), () => git.setError(null), { tone: "default" })) : null,
				h(ConfirmDialog, { spec: confirm, onClose: () => setConfirm(null) })
			);
		}
