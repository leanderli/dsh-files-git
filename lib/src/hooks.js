		// ── git state hook ───────────────────────────────────────────────────────
		// Status signature: change-sensitive comparison key (paths + status
		// codes + counters) — lets both the RPC refresh and the SSE push skip
		// setState when nothing actually changed (no re-render storms).
		const statusSig = (st) => {
			const sig = (arr) => arr.map((e) => `${e.code}\u0000${e.path}`).join("\u0001");
			return [st.branch, st.upstream, st.ahead, st.behind, sig(st.staged), sig(st.unstaged), sig(st.untracked), sig(st.conflicts)].join("\u0002");
		};
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
			// Read-side busy lane: diff / show reads must NOT disable the whole
			// panel (a slow `git diff` on a large repo used to freeze every
			// button via `disabled: busy !== null`). Only mutations take the
			// global `busy`; reads surface as a hint in the Git op bar.
			const [readBusy, setReadBusy] = useState(null);
			const [error, setError] = useState(null);
			// Operation record shown under the action bar: {label, status: "running"|"success"|"error", detail}.
			// Appears on every operation, persists after it finishes (success or error),
			// and is dismissed only via the close button (next operation shows it again).
			const [op, setOp] = useState(null);
			const mounted = useRef(true);
			// Refresh serialization: at most ONE refresh in flight; requests that
			// arrive mid-refresh are coalesced into a single follow-up run. This
			// stops overlapping refreshes (5s poll vs manual vs post-op) from
			// stacking 4 git processes each into a spawn storm.
			const refreshingRef = useRef(false);
			const refreshQueued = useRef(false);
			// Slow-trio cache: log / config / branches almost never change on
			// their own, so the silent poll fetches ONLY status (1 git process
			// instead of 6-7 spawns per 5s). The trio refreshes on mount, on
			// manual / post-op refresh (full: true), and on a slow ~60s poll
			// cadence so terminal-side changes self-heal.
			const slowLoadedRef = useRef(false);
			const statusSigRef = useRef("");
			const fullSigRef = useRef("");
			useEffect(() => () => { mounted.current = false; }, []);

			// Drop selected paths that no longer exist in the change lists.
			const pruneSelection = (st) => {
				setSelected((prev) => {
					const known = new Set([...st.staged, ...st.unstaged, ...st.untracked, ...st.conflicts].map((e) => e.path));
					const next = {};
					for (const [p, on] of Object.entries(prev)) if (on && known.has(p)) next[p] = true;
					return next;
				});
			};

			const refresh = useCallback(async ({ quiet = false, full = false } = {}) => {
				if (refreshingRef.current) {
					if (!quiet) refreshQueued.current = true;   // manual requests always win a slot
					return false;
				}
				refreshingRef.current = true;
				if (!quiet) setBusy("op.refresh");
				setError(null);
				try {
					const needSlow = full || !slowLoadedRef.current;
					const [st, lg, cfg, br] = await Promise.all([
						gitRpc("status", { repo: cwd }),
						needSlow ? gitRpc("log", { repo: cwd, count: 100 }) : null,
						needSlow ? gitRpc("config", { repo: cwd }) : null,
						needSlow ? gitRpc("branches", { repo: cwd }) : null
					]);
					if (!mounted.current) return false;
					// 5s 轮询每次都 setState 会触发整棵面板树重渲染（几百行变更 +
					// 历史），结果没变时跳过（引用不变 → React 不重渲）。比对键只取
					// 变化敏感字段（路径/状态码/计数），见 statusSig。
					const sKey = statusSig(st);
					// Light poll (slow trio served from cache): compare status
					// only, and when nothing changed skip every setState — an
					// idle tick costs one `git status` and zero re-renders.
					if (!needSlow) {
						if (sKey === statusSigRef.current) return true;
						statusSigRef.current = sKey;
						setStatus(st);
						setIsRepo(true);
						pruneSelection(st);
						return true;
					}
					slowLoadedRef.current = true;
					// Log signature: full hash + subject + date of the newest
					// entry — entries are structured objects now, so coerce to
					// a string explicitly (a raw object would collapse to
					// "[object Object]" and hide same-length changes).
					const lg0 = Array.isArray(lg?.lines) && lg.lines[0] ? `${lg.lines[0].hash}\u0003${lg.lines[0].subject}\u0003${lg.lines[0].date}` : "";
					const key = [
						sKey, lg.lines?.length ?? 0, lg0,
						cfg.name, cfg.email, cfg.remote,
						br.branches?.length ?? 0
					].join("\u0002");
					if (key === fullSigRef.current) return true;
					fullSigRef.current = key;
					statusSigRef.current = sKey;
					setStatus(st); setLog(lg); setGitConfig(cfg); setBranches(br.branches);
					setIsRepo(true);
					pruneSelection(st);
					return true;
				} catch (err) {
					if (!mounted.current) return false;
					if (err && (err.code === "not-a-git-repo" || /不是 Git 仓库|not a git repository/i.test(String(err.message || "")))) { setIsRepo(false); setError(null); }
					else setError(err.message);
					return false;
				} finally {
					refreshingRef.current = false;
					if (mounted.current && !quiet) setBusy(null);
					if (refreshQueued.current) {
						refreshQueued.current = false;
						void refresh({ quiet: true, full: true });
					}
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
					// Mutations change log/branches too (commit → new entry,
					// checkout → current branch), so post-op refresh is FULL.
					await refresh({ full: true });
				} catch (err) {
					if (mounted.current) setOp({ label, status: "error", detail: err.message });
				} finally {
					if (mounted.current) setBusy(null);
				}
			}, [refresh]);

			// Push mode (Phase 2 direct): subscribe to the sidecar's SSE status
			// stream. While the stream is live the 5s poll stands down entirely
			// (only the ~60s slow self-heal remains); the stream ending for any
			// external reason (service restart / rotation / network) reverts to
			// polling AND re-arms a subscription attempt. Events carry the same
			// shape as the status RPC value, so applying one is the identical
			// signature-gated path.
			const [pushLive, setPushLive] = useState(false);
			const pushLiveRef = useRef(false);
			pushLiveRef.current = pushLive;
			useEffect(() => {
				if (!cwd) return undefined;
				let alive = true;
				let sub = null;
				let retryTimer = null;
				const applyMsg = (msg) => {
					if (!alive || !msg || msg.repo !== cwd) return;
					if (msg.error) {
						// Not-a-repo must still hide the Git tab; other git
						// errors surface through the regular refresh path.
						if (/not a git repo/i.test(String(msg.error?.message ?? msg.error))) { setIsRepo(false); setError(null); }
						return;
					}
					const sKey = statusSig(msg);
					if (sKey === statusSigRef.current) return;
					statusSigRef.current = sKey;
					setStatus(msg);
					setIsRepo(true);
					pruneSelection(msg);
				};
				// Retry cadence: an unavailable service (panel opened before the
				// sidecar came up) retries slowly; a stream that DIED retries
				// quickly — a rotation only needs a couple of seconds.
				const armRetry = (ms) => {
					if (!alive || retryTimer) return;
					retryTimer = setTimeout(() => {
						retryTimer = null;
						if (alive && !sub) start();
					}, ms);
				};
				const start = () => {
					subscribeStatus(cwd, applyMsg).then((s) => {
						if (!alive) { s?.close?.(); return; }
						if (!s) { setPushLive(false); armRetry(30000); return; }
						sub = s;
						setPushLive(true);
						s.done.then((why) => {
							if (!alive || sub !== s) return; // we closed it via cleanup / repo switch
							sub = null;
							setPushLive(false);
							if (why === "ended") {
								// External close (service restart / rotation /
								// network): polling covers correctness meanwhile.
								armRetry(5000);
							}
						});
					}).catch(() => {
						if (alive) { setPushLive(false); armRetry(30000); }
					});
				};
				start();
				return () => {
					alive = false;
					if (retryTimer) clearTimeout(retryTimer);
					if (sub) { const s = sub; sub = null; s.close(); }
				};
			}, [cwd]);

			// Silent periodic refresh: keeps the change list / file badges in sync
			// with external edits without flashing the busy state. Each tick only
			// fires when NOTHING else is refreshing (busy op, manual refresh, an
			// in-flight poll) and the next tick is scheduled AFTER the previous
			// refresh settles — no overlap by construction. Consecutive failures
			// back the interval off (5s → … → 60s) so a down host is not hammered
			// every 5 seconds; a successful refresh restores the 5s cadence.
			// While the push stream is live, light ticks are skipped entirely —
			// every 12th tick (~60s) still upgrades to a full refresh so log /
			// branches / config pick up terminal-side changes without user action.
			const busyRef = useRef(busy);
			busyRef.current = busy;
			useEffect(() => {
				let alive = true;
				let timer = null;
				const pollRef = { ms: 5000, failures: 0, ticks: 0 };
				const SLOW_EVERY = 12;
				const schedule = (ms) => { timer = setTimeout(tick, ms); };
				const tick = () => {
					if (!alive) return;
					// Skip while the tab is hidden OR the panel is suspended
					// (slid out of view): no point spawning git processes the
					// user cannot see — during a hang window that churn would
					// keep re-filling the host's RPC slots. The next tick after
					// re-expanding (<=5s) refreshes, so data is never stale
					// for long.
					if (document.visibilityState !== "visible" || getHidden() || busyRef.current !== null || refreshingRef.current) {
						schedule(pollRef.ms);
						return;
					}
					pollRef.ticks++;
					const wantFull = pollRef.ticks % SLOW_EVERY === 0;
					if (pushLiveRef.current && !wantFull) {
						schedule(pollRef.ms);
						return;
					}
					refresh({ quiet: true, full: wantFull }).then((ok) => {
						if (!alive) return;
						pollRef.failures = ok ? 0 : pollRef.failures + 1;
						pollRef.ms = ok ? 5000 : Math.min(60000, 5000 * Math.pow(2, pollRef.failures));
						schedule(pollRef.ms);
					});
				};
				schedule(pollRef.ms);
				return () => { alive = false; clearTimeout(timer); };
			}, [refresh]);

			const allPaths = useMemo(() => {
				if (!status) return [];
				return [...status.staged, ...status.unstaged, ...status.untracked, ...status.conflicts].map((e) => e.path);
			}, [status]);

			const togglePath = useCallback((path) => setSelected((p) => { const n = { ...p }; if (n[path]) delete n[path]; else n[path] = true; return n; }), []);
			const selectAll = useCallback(() => setSelected(Object.fromEntries(allPaths.map((p) => [p, true]))), [allPaths]);
			const clearAll = useCallback(() => setSelected({}), []);

			// Diff / show reads run in their own lane with a sequence guard:
			// the newest click always wins the pane even when an older request
			// settles later, and a slow read never blocks mutations (no global
			// busy → row buttons stay clickable while a diff loads).
			const diffSeqRef = useRef(0);
			const showDiff = useCallback(async (path, staged) => {
				const seq = ++diffSeqRef.current;
				setReadBusy("op.diff"); setError(null);
				try {
					const v = await gitRpc("diff", { repo: cwd, staged, path });
					if (!mounted.current || seq !== diffSeqRef.current) return;
					setDiff({ kind: "work", path, staged, text: v.text, truncated: v.truncated });
				} catch (err) {
					if (mounted.current && seq === diffSeqRef.current) setError(err.message);
				} finally {
					if (mounted.current && seq === diffSeqRef.current) setReadBusy(null);
				}
			}, [cwd]);

			// Untracked files have no `git diff` output — read the file and
			// render it as a brand-new-file diff (all lines added).
			const showNewFile = useCallback(async (path) => {
				const seq = ++diffSeqRef.current;
				setReadBusy("op.read"); setError(null);
				try {
					const v = await gitRpc("read", { repo: cwd, path });
					if (!mounted.current || seq !== diffSeqRef.current) return;
					let text = "";
					if (!v.binary) {
						const lines = (v.text || "").split("\n");
						if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop(); // trailing newline
						text = ["diff --git a/" + path + " b/" + path, "new file mode 100644", "--- /dev/null", "+++ b/" + path, "@@ -0,0 +1," + lines.length + " @@", ...lines.map((l) => "+" + l)].join("\n");
					}
					setDiff({ kind: "work", path, staged: false, text, truncated: v.truncated });
				} catch (err) {
					if (mounted.current && seq === diffSeqRef.current) setError(err.message);
				} finally {
					if (mounted.current && seq === diffSeqRef.current) setReadBusy(null);
				}
			}, [cwd]);

			// Commit detail view (replaces the work area): {hash, subject, files,
			// file, text, truncated, loadingFile}. Opening it fetches the commit's
			// changed-file list, then auto-loads the first file's patch.
			const [commitDetail, setCommitDetail] = useState(null);
			const commitSeqRef = useRef(0);
			const showCommit = useCallback(async (target, subject) => {
				const seq = ++commitSeqRef.current;
				setReadBusy("op.commitRead"); setError(null);
				try {
					const v = await gitRpc("show", { repo: cwd, target });
					if (!mounted.current || seq !== commitSeqRef.current) return;
					const files = Array.isArray(v.files) ? v.files : [];
					setCommitDetail({ hash: target, subject: subject || "", files, file: null, text: "", truncated: false, loadingFile: false });
					setDiff(null);
					if (files.length > 0) {
						const fv = await gitRpc("show", { repo: cwd, target, path: files[0].path });
						if (!mounted.current || seq !== commitSeqRef.current) return;
						setCommitDetail((cd) => cd && cd.hash === target ? { ...cd, file: files[0].path, text: fv.text, truncated: fv.truncated, loadingFile: false } : cd);
					}
				} catch (err) {
					if (mounted.current && seq === commitSeqRef.current) setError(err.message);
				} finally {
					if (mounted.current && seq === commitSeqRef.current) setReadBusy(null);
				}
			}, [cwd]);
			const showCommitFile = useCallback(async (target, path) => {
				setCommitDetail((cd) => cd && cd.hash === target ? { ...cd, file: path, loadingFile: true } : cd);
				try {
					const v = await gitRpc("show", { repo: cwd, target, path });
					if (!mounted.current) return;
					// Stale-guard (same contract as diffSeq/commitSeq): a newer
					// click may have replaced the selected file while this fetch
					// was in flight — only land the text if it is still current,
					// otherwise the slower OLD request would overwrite the newer
					// file's diff (label says B, content says A).
					setCommitDetail((cd) => cd && cd.hash === target && cd.file === path ? { ...cd, text: v.text, truncated: v.truncated, loadingFile: false } : cd);
				} catch (err) {
					if (mounted.current) { setError(err.message); setCommitDetail((cd) => cd && cd.hash === target && cd.file === path ? { ...cd, loadingFile: false } : cd); }
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
				cwd, isRepo, status, log, gitConfig, branches, diff, setDiff, commitDetail, showCommit, showCommitFile, closeCommitDetail, selected, rebase, setRebase, force, setForce, busy, readBusy, error, setError, op, setOp, refresh, runOp, commitWith, showDiff, showNewFile, togglePath, selectAll, clearAll, allPaths, checkoutBranch, mergeBranch, updateBranch, renameBranch, stagePath, unstagePath, untrackPath, ignorePath
			}), [cwd, isRepo, status, log, gitConfig, branches, diff, commitDetail, showCommit, showCommitFile, closeCommitDetail, selected, rebase, force, busy, readBusy, error, op, refresh, runOp, commitWith, showDiff, showNewFile, togglePath, selectAll, clearAll, allPaths, checkoutBranch, mergeBranch, updateBranch, renameBranch, stagePath, unstagePath, untrackPath, ignorePath]);
		}
