		// ── memoized sub-views (isolate re-renders from unrelated state) ────────
		// One change-list row; memoized so toggling a checkbox / expanding a dir
		// only rebuilds the rows whose props actually changed.
		const ChangeRow = React.memo(function ChangeRow({ entry, stagedFlag, depth, checked, busy, conflict, onShowDiff, onShowNewFile, onTogglePath, onStage, onUnstage, onIgnore }) {
			const code = stagedFlag ? entry.code[0] : entry.code[1];
			const untracked = entry.code === "??";
			const busyOn = (label) => busy === label || busy === "op.refresh";
			const t = useT();
			const tone = conflict ? "error" : code === "A" ? "success" : code === "D" ? "error" : (code === "R" || code === "C") ? "warn" : undefined;
			// Directory context is already expressed by the tree above; the row
			// shows just the file name (full path stays in the tooltip).
			const fileName = entry.path.slice(entry.path.lastIndexOf("/") + 1);
			return h("div", { className: "dgp-row dgp-treeRow" + (depth >= 2 ? " dgp-treeDeep" : ""), "data-clickable": "true", "data-selected": checked ? "true" : "false", style: { paddingLeft: 6 + depth * 12 }, onClick: () => (untracked ? onShowNewFile(entry.path) : onShowDiff(entry.path, stagedFlag)) },
				// 12px spacer = chevron column of DirRow, so the checkbox lines up
			// with the folder icons above it instead of floating at row start.
			h("span", { style: { width: 12, flex: "none" } }),
				h("input", { type: "checkbox", className: "dgp-chk", checked, onChange: () => onTogglePath(entry.path), onClick: (e) => e.stopPropagation() }),
				h("span", { className: "dgp-badge", "data-tone": tone }, letterLabel(code)),
				h("span", { className: "dgp-rowPath", title: entry.path, style: { flex: "0 1 auto", color: conflict ? "var(--dsw-alias-state-error-primary)" : undefined } }, fileName),
				// Staging-state text only where it adds info: untracked rows drop
				// it — the ?? badge + 未跟踪 group title already say it twice.
				h("span", { className: "dgp-rowMeta" }, untracked ? null : stagedFlag ? t("git.flagStaged") : t("git.flagUnstaged")),
				h("span", { style: { flex: 1 } }),
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
			const submit = async (all) => {
				// Keep the message on failure: a rejected commit (hook refusal,
				// noneSelected, timeout) must not destroy what the user typed.
				const done = await commitWith(all, msg);
				if (done) setMsg("");
			};
			// Inline commit row (merged into the git action bar): message input
			// sits left of the two commit buttons, which start from the far right.
			return h("div", { className: "dgp-commitInline" },
				h("input", { className: "dgp-commitInput", placeholder: t("commit.placeholder"), value: msg, onChange: (e) => setMsg(e.target.value), onKeyDown: (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); submit(true); } }, title: t("commit.ctrlEnter") }),
				btn(busyOn("op.commitSel") ? t("commit.committing") : t("commit.sel"), () => submit(false), { disabled: busy !== null || !hasRepo }),
				btn(busyOn("op.commitAll") ? t("commit.committing") : t("commit.all"), () => submit(true), { disabled: busy !== null || !hasRepo, variant: "primary" })
			);
		});

		// Shared Monaco diff host: mounts the sidecar-hosted diff editor (with
		// the FIXED red/blue diff palette) once per element lifetime and swaps
		// models on text/path changes; falls back to the legacy row renderer
		// (`children`) when Monaco is unavailable (loader failure, non-loopback
		// page) or the unified text is not reconstructable. Used by the work
		// diff AND the commit-file diff, so both always look the same.
		// `fallback` is a RENDER FUNCTION, invoked only when the legacy rows
		// actually render — building up to 5000 row elements per pass would
		// otherwise run on every render even while Monaco shows, and defeat
		// the memo (function identity is irrelevant since it is not a dep).
		const MonacoDiffHost = React.memo(function MonacoDiffHost({ text, path, fallback: renderFallback, truncated }) {
			const hostRef = useRef(null);
			const edRef = useRef(null);
			const [fallback, setFallback] = useState(false);
			useEffect(() => {
				if (text.trim() === "") return undefined;
				let alive = true;
				let timer = null;
				let retried = false;
				const attempt = async () => {
					if (!alive || !hostRef.current) return;
					// Fast path: an already-mounted editor just swaps models.
					if (edRef.current) {
						if (edRef.current.update(text, path)) { setFallback(false); return; }
						edRef.current.dispose();          // unparseable now: replace
						edRef.current = null;
					}
					try {
						const inst = await mountMonacoDiff(hostRef.current, text, path);
						if (!alive) { inst?.dispose(); return; }
						if (!inst) { setFallback(true); return; }   // unparseable diff
						edRef.current = inst;
						setFallback(false);
					} catch {
						// loader/sidecar failure: retry once (the first attempt
						// often races the host element's layout), then give up to
						// the legacy renderer for THIS text. A later text re-runs
						// the whole attempt (the effect re-fires on [text, path]),
						// so a one-off failure no longer poisons the pane.
						if (!alive) return;
						if (!retried) { retried = true; timer = window.setTimeout(attempt, 60); }
						else setFallback(true);
					}
				};
				void attempt();
				return () => {
					alive = false;
					if (timer) window.clearTimeout(timer);
				};
			}, [text, path]);
			// Dispose on unmount — React removes the host DOM node, but the
			// Monaco editor instance and its models survive until disposed.
			useEffect(() => () => {
				if (edRef.current) { edRef.current.dispose(); edRef.current = null; }
			}, []);
			return h(React.Fragment, null,
				// Truncation notice on the MONACO path — the legacy fallback
				// renders its own (diffRowsView), and previously the Monaco
				// view silently ended mid-file looking like the complete diff.
				truncated && !fallback ? h("div", { className: "dgp-hint", style: { padding: "2px 10px" } }, t("diff.truncatedText")) : null,
				h("div", { ref: hostRef, className: "dgp-diff dgp-diffMonaco", style: fallback ? { display: "none" } : undefined }),
				fallback ? renderFallback() : null
			);
		});

		// Work-tree diff preview card (parsed rows memoized per diff text).
		// Body renders through the shared MonacoDiffHost (Monaco diff with the
		// fixed red/blue palette; legacy rows as fallback). The stats chips
		// always come from diffRows() — they show in BOTH render paths.
		const DiffPane = React.memo(function DiffPane({ diff, onShowDiff, onClose }) {
			const parsed = useMemo(() => (diff.text.trim() === "" ? null : diffRows(diff.text)), [diff.text]);
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
				parsed === null ? h("div", { className: "dgp-empty", style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" } }, t("diff.noContent"))
					: h(React.Fragment, null,
						h("div", { className: "dgp-diffStats" },
							chip(`+${parsed.added}`, "info"),
							chip(`−${parsed.removed}`, "error")
						),
						h(MonacoDiffHost, { text: diff.text, path: diff.path, truncated: diff.truncated === true, fallback: () => diffRowsView(parsed, diff.truncated) })
					)
			);
		});

		// Commit detail view (replaces work area + history).
		// Narrow drill-down: the 3:7 grid collapses to one screen at a time —
		// the commit's file list, or the selected file's full-width diff with
		// a 返回 button. Wide mode renders both panes and never reads pane state.
		// The file diff renders through the SAME MonacoDiffHost as the work
		// diff (fixed red/blue palette) — never the bare legacy renderer.
		const CommitDetailView = React.memo(function CommitDetailView({ commitDetail, onShowFile, onClose }) {
			const d = commitDetail;
			const t = useT();
			const narrow = useNarrow();
			const [pane, setPane] = useState("list");   // narrow: 'list' ⇄ 'file'
			const filePane = narrow && pane === "file" && !!d.file;
			// Same parsing the work diff uses: stats chips from diffRows, body
			// through MonacoDiffHost with the legacy rows as fallback.
			const fileParsed = useMemo(() => (!d.file || d.text.trim() === "" ? null : diffRows(d.text)), [d.file, d.text]);
			return h("div", { className: "dgp-commitView" },
				h("div", { className: "dgp-commitHead" },
					lbtn(t("git.back"), onClose),
					chip(d.hash.slice(0, 7)),
					h("span", { className: "dgp-sectionTitle", style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, title: d.subject },
						d.subject || t("commit.title", { hash: d.hash.slice(0, 7) })),
					h("span", { className: "dgp-hint" }, t("commit.filesHint", { count: d.files.length }))
				),
				h("div", { className: "dgp-commitGrid" },
					(!narrow || !filePane) ? h("div", { className: "dgp-gitCard" },
						h("div", { className: "dgp-sectionHead" }, h("div", { className: "dgp-sectionTitle" }, t("commit.files", { count: d.files.length }))),
						h("div", { className: "dgp-gitScroll" },
							d.files.length === 0 ? h("div", { className: "dgp-empty" }, t("commit.noFiles")) :
							d.files.map((f) => h("div", {
								key: `cf:${f.path}`, className: "dgp-row dgp-logRow", "data-clickable": "true",
								"data-active": d.file === f.path ? "true" : "false",
								title: f.path, onClick: () => { onShowFile(d.hash, f.path); if (narrow) setPane("file"); }
							},
								h("span", { className: "dgp-badge", "data-tone": f.code === "A" ? "success" : f.code === "D" ? "error" : "warn" }, f.code),
								h("span", { className: "dgp-rowPath", style: { flex: 1, minWidth: 0 } }, f.path)
							))
						)
					) : null,
					(!narrow || filePane) ? h("div", { className: "dgp-gitCard dgp-diffCard" },
						h("div", { className: "dgp-sectionHead" },
							filePane ? lbtn(t("git.back"), () => setPane("list")) : null,
							h("div", { className: "dgp-sectionTitle", title: d.file }, d.file || t("commit.noFile"))
						),
						d.loadingFile ? h("div", { className: "dgp-empty", style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" } }, t("common.loading"))
							: fileParsed ? h(React.Fragment, null,
								h("div", { className: "dgp-diffStats" },
									chip(`+${fileParsed.added}`, "info"),
									chip(`−${fileParsed.removed}`, "error")
								),
								h(MonacoDiffHost, { text: d.text, path: d.file, truncated: d.truncated === true, fallback: () => diffRowsView(fileParsed, d.truncated) })
							)
							: h("div", { className: "dgp-empty", style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" } }, t("diff.empty"))
					) : null
				)
			);
		});

		// Commit history block: collapsed bar ⇄ expanded list with internal
		// scroll + auto-scroll-into-view; own limit/open state. The log context
		// menu lives HERE (not in GitView) so right-clicking a row only
		// re-renders this block, never the whole panel.
		// ── git graph lanes ──────────────────────────────────────────────────────
		// Classic streaming lane assignment (the GitLens / gitgraph.js family):
		// log entries arrive newest-first; every lane expects the sha of the
		// commit that will appear next on that branch line. A commit consumes
		// its lane, the first parent continues it, merge parents fan OUT to
		// new lanes to its right — or fan IN when that parent line already
		// exists. Colors belong to the LINE (they survive index shifts) and
		// cycle through a fixed palette; capacity is capped and overflow
		// collapses into the last lane. Output per entry: { dot, color, segs }
		// where segs are {a, b, half, color} lane-index segments — the
		// renderer tiles ONE svg per row (top edge = lane arrangement before
		// the commit, bottom edge = after), so variable row heights cost
		// nothing and curves never span rows.
		const GRAPH_LANES_MAX = 12;
		const GRAPH_PALETTE = 6;
		function computeLogLanes(entries) {
			let lanes = [];   // [{sha, color}] — lane i expects lanes[i].sha next
			let nextColor = 0;
			return entries.map((e) => {
				const sha = String(e.hash ?? "");
				const parents = Array.isArray(e.parents) ? e.parents.map((p) => String(p)).filter(Boolean) : [];
				let dot = lanes.findIndex((l) => l.sha === sha);
				if (dot === -1) {
					// A tip with no visible child above (truncated log slice or a
					// fan-in from beyond it). At capacity, TAKE OVER the last lane
					// (replace, never grow): the old splice-insert pushed every
					// further tip one lane further out and the array grew without
					// bound past the documented 12-lane cap.
					if (lanes.length < GRAPH_LANES_MAX) {
						dot = lanes.length;
						lanes.splice(dot, 0, { sha, color: nextColor++ % GRAPH_PALETTE });
					} else {
						dot = GRAPH_LANES_MAX - 1;
						lanes[dot] = { sha, color: nextColor++ % GRAPH_PALETTE };
					}
				}
				const consumed = lanes[dot];
				const topLanes = lanes.slice();
				// Bottom-edge arrangement: consume the commit's lane, first
				// parent continues it, extra parents fan out / in.
				lanes = topLanes.filter((_, i) => i !== dot);
				const p0 = parents[0] ?? null;
				// Fan-in check for the FIRST parent too: on a standard merge
				// the side branch's lane already expects p0 (the merge's first
				// parent IS that branch's expected continuation). Without this
				// check the splice duplicated the sha into a second lane — a
				// zombie line running to the bottom of the log, one leaked slot
				// per merge, and the visual fan-in collapsed into a straight line.
				const p0Existing = p0 ? lanes.findIndex((l) => l.sha === p0) : -1;
				if (p0 && p0Existing === -1) lanes.splice(dot, 0, { sha: p0, color: consumed.color });
				const curves = [];
				let insertAt = dot + 1;
				for (const p of parents.slice(1)) {
					const existing = lanes.findIndex((l) => l.sha === p);
					if (existing !== -1) {
						curves.push({ lane: existing, color: lanes[existing].color });
					} else if (lanes.length < GRAPH_LANES_MAX) {
						lanes.splice(insertAt, 0, { sha: p, color: nextColor++ % GRAPH_PALETTE });
						curves.push({ lane: insertAt, color: lanes[insertAt].color });
						insertAt += 1;
					} else {
						curves.push({ lane: GRAPH_LANES_MAX - 1, color: lanes[GRAPH_LANES_MAX - 1].color });
					}
				}
				// Pass-through segments: match every non-consumed top lane by
				// sha in the bottom arrangement (straight when the index is
				// unchanged, an S-curve when merge insertions shifted it).
				const segs = [];
				for (let i = 0; i < topLanes.length; i++) {
					if (i === dot) continue;
					const j = lanes.findIndex((l) => l.sha === topLanes[i].sha);
					if (j !== -1) segs.push({ a: i, b: j, half: "full", color: topLanes[i].color });
				}
				// The consumed lane: incoming half + dot (+ first-parent half —
				// straight when p0 continued the lane, an S-curve into its
				// EXISTING lane when this was a fan-in).
				segs.push({ a: dot, b: dot, half: "top", color: consumed.color });
				if (p0) segs.push({ a: dot, b: p0Existing === -1 ? dot : p0Existing, half: "bottom", color: consumed.color });
				for (const c of curves) segs.push({ a: dot, b: c.lane, half: "mid", color: c.color });
				return { dot, color: consumed.color, segs };
			});
		}
		/** One log row's graph column: x = 7 + lane*13 px; the svg viewport is
		 * graphW×100 with vertical stretch (preserveAspectRatio none) — lines
		 * and curves tolerate it, and non-scaling-stroke keeps 2px strokes.
		 * The commit dot is a DOM span (never distorted), HEAD gets a ring. */
		function logGraphPath(s) {
			const ax = 7 + s.a * 13;
			const bx = 7 + s.b * 13;
			if (s.half === "top") return `M ${ax} 0 L ${ax} 50`;
			if (s.half === "bottom") return `M ${ax} 50 L ${ax} 100`;
			if (s.half === "mid") return `M ${ax} 50 C ${ax} 70, ${bx} 80, ${bx} 100`;
			return s.a === s.b ? `M ${ax} 0 L ${ax} 100` : `M ${ax} 0 C ${ax} 30, ${bx} 70, ${bx} 100`;
		}

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
			// Suspending the panel closes the context menu: it is portaled under
			// .dgp-root, so the dialog's slide-out transform never moves it — it
			// would keep floating over the main UI while suspended (and the
			// hidden root swallows pointer events, making it unclosable).
			const panelHidden = useSyncExternalStore(subscribeHidden, getHidden);
			useEffect(() => { if (panelHidden) setLogMenu(null); }, [panelHidden]);
			const safeLines = Array.isArray(log?.lines) ? log.lines : [];
			// Normalize entries: a STALE host process (not restarted after the
			// structured-log upgrade) still returns `--oneline` strings while
			// this client renders objects — coerce once so BOTH shapes render
			// (identity fields simply stay empty) instead of crashing the slot.
			const entries = safeLines.map((raw) => {
				if (typeof raw === "string") {
					const sp = raw.indexOf(" ");
					const h = sp === -1 ? raw : raw.slice(0, sp);
					return { h, hash: h, subject: sp === -1 ? "" : raw.slice(sp + 1), refs: "", name: "", email: "", date: "", parents: [] };
				}
				return raw;
			});
			// Graph lanes over the VISIBLE slice — recomputed per render (≤100
			// entries of small constant work; cheaper than memo bookkeeping).
			const visible = entries.slice(0, logLimit);
			const graphs = computeLogLanes(visible);
			let laneMax = 0;
			for (const g of graphs) {
				laneMax = Math.max(laneMax, g.dot);
				for (const s of g.segs) laneMax = Math.max(laneMax, s.a, s.b);
			}
			const graphW = 14 + (laneMax + 1) * 13;
			if (!safeLines.length) return null;
			if (!histOpen) return h("button", { type: "button", className: "dgp-histBar", ref: histRef, onClick: () => setHistOpen(true), title: t("hist.title") },
				h(IconChevronRight, { size: 12 }),
				h("span", { className: "dgp-sectionTitle" }, t("hist.title")),
				h("span", { className: "dgp-hint" }, t("hist.recent", { count: safeLines.length })),
				h("span", { style: { flex: 1 } }),
				h("span", { className: "dgp-hint" }, t("hist.expand"))
			);
			return h(React.Fragment, null,
				h("div", { className: "dgp-gitCard dgp-histCard", ref: histRef },
					h("div", { className: "dgp-sectionHead" },
						h("div", { className: "dgp-sectionTitle" }, t("hist.title")),
						h("div", { style: { display: "flex", gap: 4, alignItems: "center" } },
							safeLines.length > logLimit ? lbtn(t("hist.loadMore", { count: safeLines.length - logLimit }), () => setLogLimit((n) => n + 10)) : null,
							h("span", { className: "dgp-hint" }, `${Math.min(logLimit, safeLines.length)} / ${safeLines.length}`),
							lbtn(t("hist.collapse"), () => setHistOpen(false), { tone: "default" })
						)
					),
					h("div", { className: "dgp-gitScroll dgp-histList" }, entries.slice(0, logLimit).map((e, idx) => {
						const hash = String(e.h ?? e.hash ?? "");
						const subject = String(e.subject ?? "");
						// Tooltip: committer, email, time + operation hints. All
						// fields render as TEXT (React escaping) — no HTML sinks.
						const hasMeta = Boolean(e.name || e.email || e.date);
						const who = hasMeta ? `${e.name} <${e.email}> · ${e.date}\n` : "";
							const g = graphs[idx];
							const isHead = String(e.refs ?? "").includes("HEAD");
						return h("div", {
							key: `log:${e.hash ?? hash}`, className: "dgp-row dgp-histEntry", "data-clickable": "true",
							"data-active": currentHash === hash ? "true" : "false",
							title: `${who}${t("hist.rowTitle")}`,
							onClick: () => onShowCommit(hash, subject),
							onContextMenu: (ev) => { ev.preventDefault(); setLogMenu({ hash, subject, x: ev.clientX, y: Math.max(8, Math.min(ev.clientY, window.innerHeight - 160)) }); }
						},
							// Graph column: per-row SVG (vertical stretch is fine for lines;
							// non-scaling-stroke keeps 2px) + a DOM dot that never
							// distorts. HEAD's tip commit wears a ring.
							h("div", { className: "dgp-logGraph", style: { width: graphW } },
								h("svg", { viewBox: `0 0 ${graphW} 100`, preserveAspectRatio: "none", "aria-hidden": "true" },
									g.segs.map((s, si) => h("path", {
										key: `sg${si}`, d: logGraphPath(s), fill: "none",
										style: { stroke: `var(--dsw-graph-c${s.color})` },
										"vector-effect": "non-scaling-stroke", "stroke-width": 2
									}))
								),
								h("span", {
									className: "dgp-graphDot" + (isHead ? " dgp-graphDotHead" : ""),
									style: { left: 7 + g.dot * 13, background: `var(--dsw-graph-c${g.color})` }
								})
							),
							h("div", { className: "dgp-histBody" },
								h("div", { className: "dgp-logMain" },
									chip(hash.slice(0, 9)),
									e.refs ? h("span", { className: "dgp-chip dgp-logRefs", title: e.refs }, e.refs) : null,
									h("span", { className: "dgp-rowPath", style: { flex: 1, minWidth: 0 } }, subject),
									h("button", {
										type: "button", className: "dgp-logMenuBtn", title: t("hist.menuTitle"),
										onClick: (ev) => { ev.stopPropagation(); const r = ev.currentTarget.getBoundingClientRect(); setLogMenu({ hash, subject, x: r.right, y: Math.max(8, Math.min(r.bottom + 4, window.innerHeight - 160)) }); }
									}, "⋯")
								),
							hasMeta ? h("div", { className: "dgp-logMeta" },
									h("span", { className: "dgp-logAuthor" }, e.name),
									h("span", { className: "dgp-logEmail" }, `<${e.email}>`),
									h("span", { className: "dgp-logDate" }, e.date)
								) : null
							)
						);
					}))
				),
				logMenu ? portal(h("div", { className: "dgp-logMenu", style: { top: logMenu.y, left: logMenu.x }, onClick: (e) => e.stopPropagation() },
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
