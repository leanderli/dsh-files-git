		// ── git state hook ───────────────────────────────────────────────────────
		function useGit(cwd) {
			const [status, setStatus] = useState(null);
			// null = probing, true = git repo, false = plain directory (hide Git tab).
			const [isRepo, setIsRepo] = useState(null);
			const [log, setLog] = useState(null);
			const [gitConfig, setGitConfig] = useState(null);
			const [branches, setBranches] = useState(null);
			const [diff, setDiff] = useState(null);
			const [selected, setSelected] = useState({});
			const [rebase, setRebase] = useState(false);
			const [force, setForce] = useState(false);
			const [busy, setBusy] = useState(null);
			const [error, setError] = useState(null);
			// Operation record shown under the action bar: {label, status: "running"|"success"|"error", detail}.
			// Appears on every operation, persists after it finishes (success or error),
			// and is dismissed only via the close button (next operation shows it again).
			const [op, setOp] = useState(null);
			const mounted = useRef(true);
			const lastRefreshKey = useRef("");
			useEffect(() => () => { mounted.current = false; }, []);

			const refresh = useCallback(async (quiet) => {
				if (!quiet) setBusy("op.refresh");
				setError(null);
				try {
					const [st, lg, cfg, br] = await Promise.all([
						gitRpc("status", { repo: cwd }),
						gitRpc("log", { repo: cwd, count: 100 }),
						gitRpc("config", { repo: cwd }),
						gitRpc("branches", { repo: cwd })
					]);
					if (!mounted.current) return;
					// 5s 轮询每次都 setState 会触发整棵面板树重渲染（几百行变更 +
					// 历史），结果没变时跳过（引用不变 → React 不重渲）。
					const key = JSON.stringify([st, lg, cfg, br.branches]);
					if (lastRefreshKey.current === key) return;
					lastRefreshKey.current = key;
					setStatus(st); setLog(lg); setGitConfig(cfg); setBranches(br.branches);
					setIsRepo(true);
					setSelected((prev) => {
						const known = new Set([...st.staged, ...st.unstaged, ...st.untracked, ...st.conflicts].map((e) => e.path));
						const next = {};
						for (const [p, on] of Object.entries(prev)) if (on && known.has(p)) next[p] = true;
						return next;
					});
				} catch (err) {
					if (!mounted.current) return;
					if (err && (err.code === "not-a-git-repo" || /不是 Git 仓库|not a git repository/i.test(String(err.message || "")))) { setIsRepo(false); setError(null); }
					else setError(err.message);
				} finally {
					if (mounted.current && !quiet) setBusy(null);
				}
			}, [cwd]);

			useEffect(() => { refresh(); }, [refresh]);

			const runOp = useCallback(async (label, fn) => {
				setBusy(label); setError(null);
				setOp({ label, status: "running", detail: "" });
				try {
					const value = await fn();
					if (!mounted.current) return;
					const detail = value && typeof value.output === "string" && value.output.trim() ? value.output : t("commit.done");
					setOp({ label, status: "success", detail });
					await refresh();
				} catch (err) {
					if (mounted.current) setOp({ label, status: "error", detail: err.message });
				} finally {
					if (mounted.current) setBusy(null);
				}
			}, [refresh]);

			// Silent periodic refresh: keeps the change list / file badges in sync
			// with external edits without flashing the busy state. Pauses when the
			// tab is hidden or an operation is in flight.
			const busyRef = useRef(busy);
			busyRef.current = busy;
			useEffect(() => {
				const t = setInterval(() => {
					if (document.visibilityState === "visible" && busyRef.current === null) refresh(true);
				}, 5000);
				return () => clearInterval(t);
			}, [refresh]);

			const allPaths = useMemo(() => {
				if (!status) return [];
				return [...status.staged, ...status.unstaged, ...status.untracked, ...status.conflicts].map((e) => e.path);
			}, [status]);

			const togglePath = useCallback((path) => setSelected((p) => { const n = { ...p }; if (n[path]) delete n[path]; else n[path] = true; return n; }), []);
			const selectAll = useCallback(() => setSelected(Object.fromEntries(allPaths.map((p) => [p, true]))), [allPaths]);
			const clearAll = useCallback(() => setSelected({}), []);

			const showDiff = useCallback(async (path, staged) => {
				setBusy("op.diff"); setError(null);
				try {
					const v = await gitRpc("diff", { repo: cwd, staged, path });
					if (!mounted.current) return;
					setDiff({ kind: "work", path, staged, text: v.text, truncated: v.truncated });
				} catch (err) {
					if (mounted.current) setError(err.message);
				} finally {
					if (mounted.current) setBusy(null);
				}
			}, [cwd]);

			// Untracked files have no `git diff` output — read the file and
			// render it as a brand-new-file diff (all lines added).
			const showNewFile = useCallback(async (path) => {
				setBusy("op.read"); setError(null);
				try {
					const v = await gitRpc("read", { repo: cwd, path });
					if (!mounted.current) return;
					let text = "";
					if (!v.binary) {
						const lines = (v.text || "").split("\n");
						if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop(); // trailing newline
						text = ["diff --git a/" + path + " b/" + path, "new file mode 100644", "--- /dev/null", "+++ b/" + path, "@@ -0,0 +1," + lines.length + " @@", ...lines.map((l) => "+" + l)].join("\n");
					}
					setDiff({ kind: "work", path, staged: false, text, truncated: v.truncated });
				} catch (err) {
					if (mounted.current) setError(err.message);
				} finally {
					if (mounted.current) setBusy(null);
				}
			}, [cwd]);

			// Commit detail view (replaces the work area): {hash, subject, files,
			// file, text, truncated, loadingFile}. Opening it fetches the commit's
			// changed-file list, then auto-loads the first file's patch.
			const [commitDetail, setCommitDetail] = useState(null);
			const showCommit = useCallback(async (target, subject) => {
				setBusy("op.commitRead"); setError(null);
				try {
					const v = await gitRpc("show", { repo: cwd, target });
					if (!mounted.current) return;
					const files = Array.isArray(v.files) ? v.files : [];
					setCommitDetail({ hash: target, subject: subject || "", files, file: null, text: "", truncated: false, loadingFile: false });
					setDiff(null);
					if (files.length > 0) {
						const fv = await gitRpc("show", { repo: cwd, target, path: files[0].path });
						if (!mounted.current) return;
						setCommitDetail((cd) => cd && cd.hash === target ? { ...cd, file: files[0].path, text: fv.text, truncated: fv.truncated, loadingFile: false } : cd);
					}
				} catch (err) {
					if (mounted.current) setError(err.message);
				} finally {
					if (mounted.current) setBusy(null);
				}
			}, [cwd]);
			const showCommitFile = useCallback(async (target, path) => {
				setCommitDetail((cd) => cd && cd.hash === target ? { ...cd, file: path, loadingFile: true } : cd);
				try {
					const v = await gitRpc("show", { repo: cwd, target, path });
					if (!mounted.current) return;
					setCommitDetail((cd) => cd && cd.hash === target ? { ...cd, text: v.text, truncated: v.truncated, loadingFile: false } : cd);
				} catch (err) {
					if (mounted.current) { setError(err.message); setCommitDetail((cd) => cd && cd.hash === target ? { ...cd, loadingFile: false } : cd); }
				}
			}, [cwd]);
			const closeCommitDetail = useCallback(() => setCommitDetail(null), []);

			// Commit with an explicit message: text/amend live in CommitBox's own
			// state so typing never re-renders the whole panel tree.
			const commitWith = useCallback(async (all, text, amendFlag) => {
				const msg = (text || "").trim();
				if (!msg) { setError(t("commit.msgRequired")); return; }
				const paths = all ? null : Object.keys(selected).filter((p) => selected[p]);
				if (!all && paths.length === 0) { setError(t("commit.noneSelected")); return; }
				await runOp(all ? "op.commitAll" : "op.commitSel", () => gitRpc("commit", { repo: cwd, message: msg, all: all || undefined, paths: all ? undefined : paths, amend: amendFlag || undefined }));
				setSelected({});
			}, [cwd, selected, runOp]);

			// ── branch operations ────────────────────────────────────────────────
			const checkoutBranch = useCallback((branch, opts = {}) => runOp(opts.create ? "op.checkoutNew" : "op.checkout", () => gitRpc("checkout", { repo: cwd, branch, create: opts.create || undefined, start: opts.start })), [cwd, runOp]);
			const mergeBranch = useCallback((branch) => runOp("op.merge", () => gitRpc("merge", { repo: cwd, branch })), [cwd, runOp]);
			const updateBranch = useCallback((branch) => runOp("op.update", () => gitRpc("update", { repo: cwd, branch })), [cwd, runOp]);
			const renameBranch = useCallback((branch, name) => runOp("op.rename", () => gitRpc("rename", { repo: cwd, branch, name })), [cwd, runOp]);

			// ── staging / untracking / ignore (file or directory path) ──────────
			const stagePath = useCallback((path) => runOp("op.stage", () => gitRpc("stage", { repo: cwd, path })), [cwd, runOp]);
			const unstagePath = useCallback((path) => runOp("op.unstage", () => gitRpc("unstage", { repo: cwd, path })), [cwd, runOp]);
			const untrackPath = useCallback((path) => runOp("op.untrack", () => gitRpc("untrack", { repo: cwd, path })), [cwd, runOp]);
			const ignorePath = useCallback((path) => runOp("op.ignore", () => gitRpc("gitignore", { repo: cwd, path })), [cwd, runOp]);

			// Stable object identity: the git object only changes when real data
			// changes, so memoized consumers (panel body / sub-views) skip
			// re-renders when unrelated global stores update.
			return useMemo(() => ({
				cwd, isRepo, status, log, gitConfig, branches, diff, setDiff, commitDetail, showCommit, showCommitFile, closeCommitDetail, selected, rebase, setRebase, force, setForce, busy, error, setError, op, setOp, refresh, runOp, commitWith, showDiff, showNewFile, togglePath, selectAll, clearAll, allPaths, checkoutBranch, mergeBranch, updateBranch, renameBranch, stagePath, unstagePath, untrackPath, ignorePath
			}), [cwd, isRepo, status, log, gitConfig, branches, diff, commitDetail, showCommit, showCommitFile, closeCommitDetail, selected, rebase, force, busy, error, op, refresh, runOp, commitWith, showDiff, showNewFile, togglePath, selectAll, clearAll, allPaths, checkoutBranch, mergeBranch, updateBranch, renameBranch, stagePath, unstagePath, untrackPath, ignorePath]);
		}
