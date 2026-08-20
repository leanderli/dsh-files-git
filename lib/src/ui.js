		// ── memoized sub-views (isolate re-renders from unrelated state) ────────
		// One change-list row; memoized so toggling a checkbox / expanding a dir
		// only rebuilds the rows whose props actually changed.
		const ChangeRow = React.memo(function ChangeRow({ entry, stagedFlag, depth, checked, busy, conflict, onShowDiff, onShowNewFile, onTogglePath, onStage, onUnstage, onIgnore }) {
			const code = stagedFlag ? entry.code[0] : entry.code[1];
			const untracked = entry.code === "??";
			const busyOn = (label) => busy === label || busy === "op.refresh";
			const t = useT();
			const tone = conflict ? "error" : code === "A" ? "success" : code === "D" ? "error" : (code === "R" || code === "C") ? "warn" : undefined;
			return h("div", { className: "dgp-row dgp-treeRow" + (depth >= 2 ? " dgp-treeDeep" : ""), "data-clickable": "true", "data-selected": checked ? "true" : "false", style: { paddingLeft: 6 + depth * 12 }, onClick: () => (untracked ? onShowNewFile(entry.path) : onShowDiff(entry.path, stagedFlag)) },
				h("input", { type: "checkbox", className: "dgp-chk", checked, onChange: () => onTogglePath(entry.path), onClick: (e) => e.stopPropagation() }),
				h("span", { className: "dgp-badge", "data-tone": tone }, letterLabel(code)),
				h("span", { className: "dgp-rowPath", title: entry.path, style: { color: conflict ? "var(--dsw-alias-state-error-primary)" : undefined } }, entry.path),
				h("span", { className: "dgp-rowMeta" }, stagedFlag ? t("git.flagStaged") : untracked ? t("git.flagUntracked") : t("git.flagUnstaged")),
				h("span", { className: "dgp-rowActions" },
					stagedFlag && !conflict ? lbtn(busyOn("op.unstage") ? "…" : t("git.unstage"), () => onUnstage(entry.path), { disabled: busy !== null }) : null,
					!stagedFlag && !untracked ? lbtn(busyOn("op.stage") ? "…" : t("git.stage"), () => onStage(entry.path), { disabled: busy !== null }) : null,
					!stagedFlag && untracked ? lbtn(busyOn("op.stage") ? "…" : t("git.track"), () => onStage(entry.path), { disabled: busy !== null, title: t("git.trackFile") }) : null,
					!stagedFlag && untracked ? lbtn(busyOn("op.ignore") ? "…" : t("git.ignore"), () => onIgnore(entry.path), { disabled: busy !== null, title: t("git.ignoreFile") }) : null
				)
			);
		}, (prev, next) =>
			// Compare by content, not by object identity: a status refresh creates
			// brand-new entry objects, but rows whose path/code didn't change must
			// NOT re-render (this is the hot path for 5s polling + refresh-all).
			prev.entry.path === next.entry.path && prev.entry.code === next.entry.code &&
			prev.stagedFlag === next.stagedFlag && prev.depth === next.depth &&
			prev.checked === next.checked && prev.busy === next.busy && prev.conflict === next.conflict &&
			prev.onShowDiff === next.onShowDiff && prev.onShowNewFile === next.onShowNewFile &&
			prev.onTogglePath === next.onTogglePath && prev.onStage === next.onStage &&
			prev.onUnstage === next.onUnstage && prev.onIgnore === next.onIgnore
		);
		const DirRow = React.memo(function DirRow({ name, count, depth, open, onToggle, actions, title }) {
			const t = useT();
			return h("div", { className: "dgp-row dgp-dirRow dgp-treeRow" + (depth >= 2 ? " dgp-treeDeep" : ""), "data-clickable": "true", title, onClick: onToggle, style: { paddingLeft: 6 + depth * 12 } },
				h(open ? IconChevronDown : IconChevronRight, { size: 12 }),
				h("span", { className: "dgp-fileIcon" }, h(IconFolderOpen, { size: 14 })),
				h("span", { className: "dgp-rowPath", style: { fontWeight: 500 } }, name),
				h("span", { className: "dgp-rowMeta" }, t("common.items", { count })),
				actions && actions.length > 0 ? h("span", { className: "dgp-rowActions" }, actions.map((a) => lbtn(a.label, (e) => { e.stopPropagation(); a.onClick(); }, { disabled: a.disabled, title: a.title }))) : null
			);
		});

		// Working-tree changes as a collapsible directory tree (one card).
		const ChangeList = React.memo(function ChangeList({ status, allPaths, selected, busy, onShowDiff, onShowNewFile, onTogglePath, onStage, onUnstage, onUntrack, onIgnore, onSelectAll, onClearAll }) {
			const s = status;
			const t = useT();
			const [openDirs, setOpenDirs] = useState(null); // null = all open; Set of "group|dirPath" = collapsed
			const toggleDir = useCallback((key) => {
				setOpenDirs((prev) => {
					const n = prev === null ? new Set() : new Set(prev);
					if (n.has(key)) n.delete(key); else n.add(key);
					return n.size === 0 ? null : n;
				});
			}, []);
			const dirOpen = (key) => openDirs === null || !openDirs.has(key);
			const buildTree = useCallback((entries) => {
				const root = { dirs: new Map(), files: [] };
				for (const e of entries) {
					const parts = e.path.split("/");
					let node = root;
					for (let d = 0; d < parts.length - 1; d++) {
						const seg = parts[d];
						if (!node.dirs.has(seg)) node.dirs.set(seg, { dirs: new Map(), files: [] });
						node = node.dirs.get(seg);
					}
					node.files.push(e);
				}
				return root;
			}, []);
			const treeCount = (node) => {
				let n = node.files.length;
				for (const child of node.dirs.values()) n += treeCount(child);
				return n;
			};
			// Tree render is cheap (small lists); rows themselves are memoized.
			// Directory-level actions differ per group:
			//   staged   → unstage (restore --staged), untrack (rm --cached -r)
			//   unstaged → stage (add), untrack
			//   untracked→ track (add), ignore (.gitignore) — untracked has no untrack
			const dirActions = (groupKind, dirPath) => {
				const busyOn = (label) => busy === label || busy === "op.refresh";
				if (groupKind === "s") return [
					{ label: busyOn("op.unstage") ? "…" : t("git.unstage"), onClick: () => onUnstage(dirPath), disabled: busy !== null, title: t("git.actUnstage", { path: dirPath }) },
					{ label: busyOn("op.untrack") ? "…" : t("git.untrack"), onClick: () => onUntrack(dirPath), disabled: busy !== null, title: t("git.actUntrack", { path: dirPath }) }
				];
				if (groupKind === "t") return [
					{ label: busyOn("op.stage") ? "…" : t("git.track"), onClick: () => onStage(dirPath), disabled: busy !== null, title: t("git.actTrack", { path: dirPath }) },
					{ label: busyOn("op.ignore") ? "…" : t("git.ignore"), onClick: () => onIgnore(dirPath), disabled: busy !== null, title: t("git.actIgnore", { path: dirPath }) }
				];
				return [
					{ label: busyOn("op.stage") ? "…" : t("git.stage"), onClick: () => onStage(dirPath), disabled: busy !== null, title: t("git.actStage", { path: dirPath }) },
					{ label: busyOn("op.untrack") ? "…" : t("git.untrack"), onClick: () => onUntrack(dirPath), disabled: busy !== null, title: t("git.actUntrack", { path: dirPath }) }
				];
			};
			const renderTree = (node, depth, groupKey, pathPrefix, groupKind) => {
				const out = [];
				for (const [name, child] of node.dirs) {
					const dirPath = pathPrefix ? `${pathPrefix}/${name}` : name;
					const key = `${groupKey}|${dirPath}`;
					const open = dirOpen(key);
					out.push(h("div", { key: `dir:${key}` },
						h(DirRow, { name, count: treeCount(child), depth, open, onToggle: () => toggleDir(key), actions: dirActions(groupKind, dirPath), title: t("common.expandCollapse", { path: dirPath }) })
					));
					if (open) out.push(...renderTree(child, depth + 1, groupKey, dirPath, groupKind));
				}
				for (const f of node.files) {
					const conflict = !!s?.conflicts?.some((c) => c.path === f.path);
					out.push(h(ChangeRow, { key: `${groupKind}:${f.path}`, entry: f, stagedFlag: groupKind === "s", depth, checked: !!selected[f.path], busy, conflict, onShowDiff, onShowNewFile, onTogglePath, onStage, onUnstage, onIgnore }));
				}
				return out;
			};
			// Tree structures only change when status changes (status is a fresh
			// object after refresh, but the memo comparison in ChangeRow then
			// prevents unchanged rows from re-rendering).
			const trees = useMemo(() => ({
				staged: buildTree(s.staged),
				unstaged: buildTree(s.unstaged),
				untracked: buildTree(s.untracked)
			}), [s, buildTree]);
			const allChecked = allPaths.length > 0 && allPaths.every((p) => !!selected[p]);
			return h("div", { className: "dgp-gitCard dgp-gitGrow" },
				h("div", { className: "dgp-sectionHead" },
					h("div", { className: "dgp-sectionTitle" }, t("git.changes", { count: allPaths.length })),
					h("div", { style: { display: "flex", gap: 4, alignItems: "center" } },
						lbtn(t("git.allDiff"), () => onShowDiff("", false)),
						lbtn(allChecked ? t("git.deselectAll") : t("git.selectAll"), () => (allChecked ? onClearAll() : onSelectAll()), { active: allChecked }),
						lbtn(t("common.clear"), onClearAll, { tone: "default" }))
				),
				h("div", { className: "dgp-gitScroll" },
					s.conflicts?.length > 0 ? h("div", { style: { marginBottom: 6 } }, h("div", { className: "dgp-sectionTitle", style: { marginBottom: 4 } }, t("git.conflicts", { count: s.conflicts.length })), s.conflicts.map((e) => h("div", { key: `c:${e.path}`, className: "dgp-row", "data-clickable": "true", onClick: () => onShowDiff(e.path, false) }, h("span", { className: "dgp-badge", "data-tone": "error" }, letterLabel(e.code)), h("span", { className: "dgp-rowPath", style: { color: "var(--dsw-alias-state-error-primary)" } }, e.path)))) : null,
					s.staged.length > 0 ? h("div", { style: { marginBottom: 6 } }, h("div", { className: "dgp-sectionTitle", style: { marginBottom: 4 } }, t("git.staged", { count: s.staged.length })), renderTree(trees.staged, 0, "s", "", "s")) : null,
					s.unstaged.length > 0 ? h("div", { style: { marginBottom: 6 } }, h("div", { className: "dgp-sectionTitle", style: { marginBottom: 4 } }, t("git.unstaged", { count: s.unstaged.length })), renderTree(trees.unstaged, 0, "u", "", "u")) : null,
					s.untracked.length > 0 ? h("div", null, h("div", { className: "dgp-sectionTitle", style: { marginBottom: 4 } }, t("git.untracked", { count: s.untracked.length })), renderTree(trees.untracked, 0, "t", "", "t")) : null,
					allPaths.length === 0 ? h("div", { className: "dgp-empty" }, t("git.clean")) : null
				)
			);
		});

		// Commit message input (inline in the git action bar): isolated state so
		// typing never touches the rest of the panel tree.
		const CommitBox = React.memo(function CommitBox({ busy, commitWith, hasRepo }) {
			const [msg, setMsg] = useState("");
			const busyOn = (label) => busy === label || busy === "op.refresh";
			const t = useT();
			const submit = async (all) => { await commitWith(all, msg); setMsg(""); };
			// Inline commit row (merged into the git action bar): message input
			// sits left of the two commit buttons, which start from the far right.
			return h("div", { className: "dgp-commitInline" },
				h("input", { className: "dgp-commitInput", placeholder: t("commit.placeholder"), value: msg, onChange: (e) => setMsg(e.target.value), onKeyDown: (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); submit(true); } }, title: t("commit.ctrlEnter") }),
				btn(busyOn("op.commitSel") ? t("commit.committing") : t("commit.sel"), () => submit(false), { disabled: busy !== null || !hasRepo }),
				btn(busyOn("op.commitAll") ? t("commit.committing") : t("commit.all"), () => submit(true), { disabled: busy !== null || !hasRepo, variant: "primary" })
			);
		});

		// Work-tree diff preview card (parsed rows memoized per diff text).
		const DiffPane = React.memo(function DiffPane({ diff, onShowDiff, onClose }) {
			const body = useMemo(() => (diff.text.trim() === "" ? null : diffBody(diff.text, diff.truncated)), [diff.text, diff.truncated]);
			const t = useT();
			const titleLabel = diff.path === "" ? (diff.staged ? t("diff.allStaged") : t("diff.allUnstaged")) : diff.path + (diff.staged ? t("diff.stagedSuffix") : "");
			return h("div", { className: "dgp-gitCard dgp-diffCard" },
				h("div", { className: "dgp-sectionHead" },
					h("div", { className: "dgp-sectionTitle", title: diff.path },
						t("diff.title", { label: titleLabel })),
					h("div", { style: { display: "flex", gap: 4, alignItems: "center" } },
						diff.path === "" ? h(React.Fragment, null,
							lbtn(t("git.flagUnstaged"), () => onShowDiff("", false), { active: !diff.staged }),
							lbtn(t("git.flagStaged"), () => onShowDiff("", true), { active: diff.staged })
						) : lbtn(t("common.viewAll"), () => onShowDiff("", false)),
						lbtn(t("common.close"), onClose, { tone: "default" })
					)
				),
				body === null ? h("div", { className: "dgp-empty", style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" } }, t("diff.noContent"))
					: h("div", { className: "dgp-diff" }, body)
			);
		});

		// Commit detail view (replaces work area + history).
		const CommitDetailView = React.memo(function CommitDetailView({ commitDetail, onShowFile, onClose }) {
			const d = commitDetail;
			const t = useT();
			return h("div", { className: "dgp-commitView" },
				h("div", { className: "dgp-commitHead" },
					lbtn(t("git.back"), onClose),
					chip(d.hash.slice(0, 7)),
					h("span", { className: "dgp-sectionTitle", style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, title: d.subject },
						d.subject || t("commit.title", { hash: d.hash.slice(0, 7) })),
					h("span", { className: "dgp-hint" }, t("commit.filesHint", { count: d.files.length }))
				),
				h("div", { className: "dgp-commitGrid" },
					h("div", { className: "dgp-gitCard" },
						h("div", { className: "dgp-sectionHead" }, h("div", { className: "dgp-sectionTitle" }, t("commit.files", { count: d.files.length }))),
						h("div", { className: "dgp-gitScroll" },
							d.files.length === 0 ? h("div", { className: "dgp-empty" }, t("commit.noFiles")) :
							d.files.map((f) => h("div", {
								key: `cf:${f.path}`, className: "dgp-row dgp-logRow", "data-clickable": "true",
								"data-active": d.file === f.path ? "true" : "false",
								title: f.path, onClick: () => onShowFile(d.hash, f.path)
							},
								h("span", { className: "dgp-badge", "data-tone": f.code === "A" ? "success" : f.code === "D" ? "error" : "warn" }, f.code),
								h("span", { className: "dgp-rowPath", style: { flex: 1, minWidth: 0 } }, f.path)
							))
						)
					),
					h("div", { className: "dgp-gitCard dgp-diffCard" },
						h("div", { className: "dgp-sectionHead" },
							h("div", { className: "dgp-sectionTitle", title: d.file }, d.file || t("commit.noFile"))
						),
						d.loadingFile ? h("div", { className: "dgp-empty", style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" } }, t("common.loading"))
							: (d.file && d.text.trim() !== "" ? h("div", { className: "dgp-diff" }, diffBody(d.text, d.truncated))
								: h("div", { className: "dgp-empty", style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" } }, t("diff.empty")))
					)
				)
			);
		});

		// Commit history block: collapsed bar ⇄ expanded list with internal
		// scroll + auto-scroll-into-view; own limit/open state. The log context
		// menu lives HERE (not in GitView) so right-clicking a row only
		// re-renders this block, never the whole panel.
		const HistoryBlock = React.memo(function HistoryBlock({ log, currentHash, onShowCommit, setConfirm, runOp, cwd }) {
			const [histOpen, setHistOpen] = useState(false);
			const [logLimit, setLogLimit] = useState(10);
			const [logMenu, setLogMenu] = useState(null); // {hash, subject, x, y}
			const histRef = useRef(null);
			const t = useT();
			useEffect(() => {
				if (histOpen && histRef.current) histRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
			}, [histOpen]);
			useEffect(() => {
				if (!logMenu) return;
				const close = () => setLogMenu(null);
				document.addEventListener("click", close);
				return () => document.removeEventListener("click", close);
			}, [logMenu]);
			// The log context menu is portaled to the panel root (outside the
			// dialog content) so its backdrop-filter renders; while open, wheel
			// is locked everywhere in the panel except inside the menu.
			useEffect(() => {
				if (!logMenu) return;
				const onWheel = (e) => {
					if (e.target.closest(".dgp-logMenu")) return;
					if (e.target.closest(".dgp-root")) e.preventDefault();
				};
				document.addEventListener("wheel", onWheel, { passive: false });
				return () => document.removeEventListener("wheel", onWheel);
			}, [logMenu]);
			if (!log?.lines?.length) return null;
			if (!histOpen) return h("button", { type: "button", className: "dgp-histBar", ref: histRef, onClick: () => setHistOpen(true), title: t("hist.title") },
				h(IconChevronRight, { size: 12 }),
				h("span", { className: "dgp-sectionTitle" }, t("hist.title")),
				h("span", { className: "dgp-hint" }, t("hist.recent", { count: log.lines.length })),
				h("span", { style: { flex: 1 } }),
				h("span", { className: "dgp-hint" }, t("hist.expand"))
			);
			return h(React.Fragment, null,
				h("div", { className: "dgp-gitCard dgp-histCard", ref: histRef },
					h("div", { className: "dgp-sectionHead" },
						h("div", { className: "dgp-sectionTitle" }, t("hist.title")),
						h("div", { style: { display: "flex", gap: 4, alignItems: "center" } },
							log.lines.length > logLimit ? lbtn(t("hist.loadMore", { count: log.lines.length - logLimit }), () => setLogLimit((n) => n + 10)) : null,
							h("span", { className: "dgp-hint" }, `${Math.min(logLimit, log.lines.length)} / ${log.lines.length}`),
							lbtn(t("hist.collapse"), () => setHistOpen(false), { tone: "default" })
						)
					),
					h("div", { className: "dgp-gitScroll dgp-histList" }, log.lines.slice(0, logLimit).map((line) => {
						const sp = line.indexOf(" "); const hash = sp === -1 ? line : line.slice(0, sp); const subject = sp === -1 ? "" : line.slice(sp + 1);
						return h("div", {
							key: `log:${line}`, className: "dgp-row dgp-logRow", "data-clickable": "true",
							"data-active": currentHash === hash ? "true" : "false",
							title: t("hist.rowTitle"),
							onClick: () => onShowCommit(hash, subject),
							onContextMenu: (e) => { e.preventDefault(); setLogMenu({ hash, subject, x: e.clientX, y: Math.max(8, Math.min(e.clientY, window.innerHeight - 160)) }); }
						},
							chip(hash.slice(0, 7)),
							h("span", { className: "dgp-rowPath", style: { flex: 1, minWidth: 0 } }, subject),
							h("button", {
								type: "button", className: "dgp-logMenuBtn", title: t("hist.menuTitle"),
								onClick: (e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); setLogMenu({ hash, subject, x: r.right, y: Math.max(8, Math.min(r.bottom + 4, window.innerHeight - 160)) }); }
							}, "⋯")
						);
					}))
				),
				logMenu ? ReactDOM.createPortal(h("div", { className: "dgp-logMenu", style: { top: logMenu.y, left: logMenu.x }, onClick: (e) => e.stopPropagation() },
					h("button", { type: "button", className: "dgp-logMenuItem", onClick: () => { onShowCommit(logMenu.hash, logMenu.subject); setLogMenu(null); } }, h(IconCode, { size: 13 }), t("hist.view")),
					h("button", { type: "button", className: "dgp-logMenuItem", onClick: () => {
						setConfirm({
							title: t("hist.revertTitle", { hash: logMenu.hash.slice(0, 7) }),
							message: t("hist.revertMsg", { hash: logMenu.hash, subject: logMenu.subject }),
							confirmLabel: t("hist.revertConfirm"),
							danger: false,
							onConfirm: () => runOp("op.revert", () => gitRpc("revert", { repo: cwd, target: logMenu.hash }))
						});
						setLogMenu(null);
					} }, h(IconRefresh, { size: 13 }), t("hist.revert")),
					h("button", { type: "button", className: "dgp-logMenuItem", onClick: () => {
						setConfirm({
							title: t("hist.resetSoftTitle", { hash: logMenu.hash.slice(0, 7) }),
							message: t("hist.resetSoftMsg", { hash: logMenu.hash.slice(0, 7), subject: logMenu.subject }),
							confirmLabel: t("hist.resetSoftConfirm"),
							danger: false,
							onConfirm: () => runOp("op.reset", () => gitRpc("reset", { repo: cwd, target: logMenu.hash, mode: "soft" }))
						});
						setLogMenu(null);
					} }, h(IconBranchOp, { size: 13 }), t("hist.resetSoft")),
					h("button", { type: "button", className: "dgp-logMenuItem", "data-danger": "true", onClick: () => {
						setConfirm({
							title: t("hist.resetHardTitle", { hash: logMenu.hash.slice(0, 7) }),
							message: t("hist.resetHardMsg", { hash: logMenu.hash.slice(0, 7), subject: logMenu.subject }),
							confirmLabel: t("hist.resetHardConfirm"),
							danger: true,
							onConfirm: () => runOp("op.reset", () => gitRpc("reset", { repo: cwd, target: logMenu.hash, mode: "hard" }))
						});
						setLogMenu(null);
					} }, h(IconWarning, { size: 13 }), t("hist.resetHard"))
				), document.querySelector(".dgp-root")) : null
			);
		});
