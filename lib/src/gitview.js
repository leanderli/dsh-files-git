		// ── Branch selector (integrated into the Git tab button) ────────────────
		// The Git tab button shows "Git · <branch>"; clicking the tab text switches
		// tabs, while the chevron at the tab's right edge opens this branch list.
		function BranchSelector({ git }) {
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
					lbtn(t("common.ok"), () => submitBranchInput(), false)
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
					className: "dgp-tabArrow",
					title: t("branch.arrowTitle", { l: locals.length, r: remotes.length }),
					onClick: (e) => {
						e.stopPropagation();
						if (!branchOpen) {
							const r = e.currentTarget.getBoundingClientRect();
							setBranchPos({ left: Math.round(r.left), top: Math.round(r.bottom + 4) });
						}
						setBranchOpen((o) => !o);
					},
					"data-open": branchOpen ? "true" : "false"
				}, h(IconChevronDown, { size: 12 })),
				branchOpen && branchPos ? ReactDOM.createPortal(h("div", { className: "dgp-branchPop", style: { left: branchPos.left, top: branchPos.top }, onClick: (e) => e.stopPropagation() },
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
			if (!spec) return null;
			return h("div", { className: "dgp-confirm", onClick: onClose },
				h("div", { className: "dgp-confirmCard", onClick: (e) => e.stopPropagation() },
					h("div", { className: "dgp-confirmTitle", "data-danger": spec.danger ? "true" : "false" },
						spec.danger ? h(IconWarning, { size: 15 }) : h(IconBranchOp, { size: 15 }),
						spec.title),
					spec.message ? h("div", { className: "dgp-confirmMsg" }, spec.message) : null,
					h("div", { className: "dgp-confirmActions" },
						btn(t("common.cancel"), onClose),
						btn(spec.confirmLabel || t("common.ok"), () => { const fn = spec.onConfirm; onClose(); fn(); }, { variant: spec.danger ? "dangerFill" : "primary" })
					)
				)
			);
		}

		// ── Git tab ──────────────────────────────────────────────────────────────
		function GitView({ git }) {
			const busyOn = (label) => git.busy === label || git.busy === "op.refresh";
			const s = git.status;
			const t = useT();

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
				};
				window.addEventListener("pointermove", move);
				window.addEventListener("pointerup", up);
			}, []);
			const resetDiffSplit = useCallback(() => setDiffFrac(null), []);
			const diffShare = diffFrac ?? 0.3;

			return h(React.Fragment, null,
				// ── top strip: status chips + sync actions + op output ──────────
				h("div", { className: "dgp-gitTop" },
					s ? h("div", { className: "dgp-chips" },
						s.ahead > 0 ? chip(t("gv.ahead", { count: s.ahead }), "primary") : null,
						s.behind > 0 ? chip(t("gv.behind", { count: s.behind }), "warn") : null,
						s.upstream ? chip(s.upstream) : null,
						git.gitConfig?.remote ? chip(git.gitConfig.remote) : null,
						git.gitConfig?.name || git.gitConfig?.email ? chip(`${git.gitConfig.name ?? ""} <${git.gitConfig.email ?? ""}>`.trim()) : chip(t("gv.noIdentity"), "warn"),
						s.conflicts?.length > 0 ? chip(t("gv.conflicts", { count: s.conflicts.length }), "error") : null
					) : null,
					// Action bar + inline commit row, separated by a vertical rule:
					// left = sync ops, right = commit message input + commit buttons.
					h("div", { className: "dgp-opBar" },
						h("div", { className: "dgp-actions" },
							btn(busyOn("op.pull") ? t("gv.pullBusy") : t("gv.pull"), () => git.runOp("op.pull", () => gitRpc("pull", { repo: git.cwd, rebase: git.rebase || undefined })), { disabled: git.busy !== null || !s, icon: h(IconRefresh, { size: 12 }), title: t("gv.pullTitle") }),
							btn(busyOn("op.push") ? t("gv.pushBusy") : t("gv.push"), () => {
								const doPush = () => git.runOp("op.push", () => gitRpc("push", { repo: git.cwd, force: git.force || undefined }));
								if (git.force) setConfirm({
									title: t("gv.forceTitle2"),
									message: t("gv.forceMsg", { upstream: git.status?.upstream ? t("gv.forceUpstream", { name: git.status.upstream }) : "" }),
									confirmLabel: t("gv.forceConfirm"),
									danger: true,
									onConfirm: doPush
								});
								else doPush();
							}, { disabled: git.busy !== null || !s, variant: "primary", icon: h(IconSend, { size: 12 }), title: t("gv.pushTitle") }),
							btn(busyOn("op.fetch") ? t("gv.fetchBusy") : t("gv.fetch"), () => git.runOp("op.fetch", () => gitRpc("fetch", { repo: git.cwd })), { disabled: git.busy !== null || !s, icon: h(IconDownload, { size: 12 }), title: t("gv.fetchTitle") }),
							h("label", { className: "dgp-chkLbl", title: t("gv.rebaseTitle") }, h("input", { type: "checkbox", className: "dgp-chk", checked: git.rebase, onChange: (e) => git.setRebase(e.target.checked) }), t("gv.rebase")),
							h("label", { className: "dgp-chkLbl", title: t("gv.forceTitle") }, h("input", { type: "checkbox", className: "dgp-chk", checked: git.force, onChange: (e) => git.setForce(e.target.checked) }), t("gv.force")),
							git.busy !== null ? h("span", { className: "dgp-hint" }, t("gv.busy", { op: t(git.busy) })) : null
						),
						h("div", { className: "dgp-opDivider" }),
						h(CommitBox, { busy: git.busy, commitWith: git.commitWith, hasRepo: !!s })
					),
					// Command output module: shown under the action bar whenever an
					// operation runs; stays visible after success/error until closed.
					git.op ? h("div", { className: "dgp-op", "data-status": git.op.status },
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
					) : null
				),
				// ── main: a commit detail view REPLACES the work area + history
				// (left = the commit's changed files, right = first file's diff);
				// otherwise the work area is a vertical stack — changes list →
				// commit box — collapsing to a 2:8 master-detail when a diff opens.
				git.commitDetail ? h(CommitDetailView, { commitDetail: git.commitDetail, onShowFile: git.showCommitFile, onClose: git.closeCommitDetail })
				: h(React.Fragment, null,
				h("div", { className: "dgp-gitWork", "data-diff": git.diff ? "true" : "false", ref: diffRef, style: git.diff ? { gridTemplateColumns: `minmax(0,${diffShare.toFixed(3)}fr) 8px minmax(0,${(1 - diffShare).toFixed(3)}fr)` } : undefined },
					// left column: working-tree changes (commit row now lives in
					// the action bar above, so the list reaches down to history)
					h("div", { className: "dgp-gitCol" },
						s ? h(ChangeList, {
							status: s, allPaths: git.allPaths, selected: git.selected, busy: git.busy,
							onShowDiff: git.showDiff, onShowNewFile: git.showNewFile, onTogglePath: git.togglePath,
							onStage: git.stagePath, onUnstage: git.unstagePath, onUntrack: git.untrackPath, onIgnore: git.ignorePath,
							onSelectAll: git.selectAll, onClearAll: git.clearAll
						}) : null
					),
					// right pane: working-tree diff preview, split by a draggable
					// gutter (default left 3 : right 7; double-click resets)
					git.diff ? h(React.Fragment, null,
						h("div", { className: "dgp-gutter", title: t("file.gutter"), onPointerDown: onDiffGutterDown, onDoubleClick: resetDiffSplit }),
						h(DiffPane, { diff: git.diff, onShowDiff: git.showDiff, onClose: () => git.setDiff(null) })
					) : null
				),
				// ── commit history: a full-width horizontal bar, collapsed by
				// default (IDEA-style). Expanding does not squeeze the work area
				// above — the list takes a capped height and scrolls internally,
				// and the block auto-scrolls to the middle of the panel.
				git.log?.lines?.length > 0 ? h(HistoryBlock, { log: git.log, currentHash: git.commitDetail?.hash ?? null, onShowCommit: git.showCommit, setConfirm, runOp: git.runOp, cwd: git.cwd }) : null
				),
				git.error ? h("div", { className: "dgp-error" }, h("span", { style: { flex: 1 } }, git.error), lbtn(t("common.close"), () => git.setError(null), { tone: "default" })) : null,
				h(ConfirmDialog, { spec: confirm, onClose: () => setConfirm(null) })
			);
		}
