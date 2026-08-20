		// ── file browser tab ─────────────────────────────────────────────────────
		function gitBadgeOf(status, path) {
			if (!status) return null;
			if (status.conflicts?.some((e) => e.path === path)) return { label: "file.badgeConflict", tone: "error" };
			const staged = status.staged?.find((e) => e.path === path);
			const unstaged = status.unstaged?.find((e) => e.path === path);
			if (status.untracked?.some((e) => e.path === path)) return { label: "file.badgeUntracked" };
			if (staged && unstaged) return { label: "file.badgeStagedMod", tone: "warn" };
			if (staged) return { label: "file.badgeStaged", tone: "success" };
			if (unstaged) return { label: "file.badgeModified", tone: "warn" };
			return null;
		}

		// ── file-type → DSH icon + preview kind ──────────────────────────────────
		const escHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
		const CODE_EXTS = new Set(["js", "jsx", "ts", "tsx", "mjs", "cjs", "py", "java", "go", "rs", "c", "cc", "cpp", "cxx", "h", "hpp", "cs", "php", "rb", "sh", "bash", "swift", "kt", "scala", "lua", "sql", "vue"]);
		const DATA_EXTS = new Set(["json", "jsonc", "yaml", "yml", "toml", "ini", "cfg", "conf", "env", "properties", "xml", "csv", "tsv"]);
		const WEB_EXTS = new Set(["html", "htm", "css", "scss", "sass", "less"]);
		const DOC_EXTS = new Set(["md", "markdown", "txt", "log", "rtf"]);
		const IMG_EXTS = new Set(["png", "jpg", "jpeg", "gif", "svg", "webp", "ico", "bmp"]);
		function extOf(name) { const i = name.lastIndexOf("."); return i === -1 ? "" : name.slice(i + 1).toLowerCase(); }
		function iconForFile(name) {
			const ext = extOf(name);
			if (WEB_EXTS.has(ext)) return IconGlobe;
			if (CODE_EXTS.has(ext)) return IconCode;
			if (DATA_EXTS.has(ext)) return IconData;
			if (DOC_EXTS.has(ext)) return IconListPen;
			if (IMG_EXTS.has(ext)) return IconPaperclip;
			return IconPaperclip;
		}
		const MD_EXTS = new Set(["md", "markdown"]);

		// ── lightweight syntax highlighter (self-contained, token-level) ─────────
		const LANG_KEYWORDS = {
			js: "const let var function return if else for while do switch case break continue new class extends super this typeof instanceof in of try catch finally throw async await yield import export from default null undefined true false void delete static get set",
			ts: "const let var function return if else for while do switch case break continue new class extends super this typeof instanceof in of try catch finally throw async await yield import export from default null undefined true false void delete static get set interface type enum implements private public protected readonly abstract keyof satisfies as is namespace declare module",
			json: "true false null",
			py: "def return if elif else for while import from as class try except finally raise with lambda pass None True False and or not in is global nonlocal yield assert async await del break continue",
			java: "public private protected class interface enum extends implements return if else for while do switch case break continue new try catch finally throw throws import package static final void int long double float boolean char byte short this super null true false abstract synchronized volatile transient instanceof",
			go: "func return if else for range switch case default package import var const type struct interface map chan go defer select break continue fallthrough true false nil len cap make new append panic recover",
			rs: "fn let mut const return if else for while loop match use mod pub struct enum trait impl type where as ref move dyn async await in true false self",
			c: "int char float double void long short unsigned signed const static struct union enum typedef return if else for while do switch case break continue sizeof goto",
			cpp: "int char float double void long short unsigned signed const static struct union enum typedef return if else for while do switch case break continue class namespace template typename public private protected virtual override new delete this nullptr true false using",
			cs: "public private protected internal class interface enum struct namespace using return if else for foreach while do switch case break continue new try catch finally throw async await var void int long double float bool char string decimal object null true false this base override virtual readonly const static abstract sealed partial",
			php: "public private protected class function return if else elseif for foreach while do switch case break continue new try catch finally throw namespace use echo print null true false this static extends implements interface const",
			rb: "def end return if elsif else unless for while do case when break next class module require include attr_reader attr_writer new nil true false self",
			sh: "if then else elif fi for while do done case esac function return local export readonly echo cd ls pwd mkdir rm cp mv cat grep sed awk exit true false",
			sql: "select from where insert into values update set delete join inner left right outer on group by order having limit offset as and or not null is in like between exists distinct count sum avg min max create table drop alter index primary key foreign references union case when then else end",
			yaml: "true false null yes no on off",
			css: "px em rem vh vw important",
			html: "html head body div span p a img script style link meta title h1 h2 h3 h4 h5 h6 ul ol li table tr td th form input button class id href src style"
		};
		const LANG_LINE_COMMENT = { py: "#", rb: "#", sh: "#", yaml: "#", sql: "--" };
		const LANG_FROM_EXT = { js: "js", jsx: "js", mjs: "js", cjs: "js", ts: "ts", tsx: "ts", json: "json", jsonc: "json", py: "py", java: "java", go: "go", rs: "rs", c: "c", h: "c", cc: "cpp", cpp: "cpp", cxx: "cpp", hpp: "cpp", cs: "cs", php: "php", rb: "rb", sh: "sh", bash: "sh", swift: "c", kt: "java", sql: "sql", yaml: "yaml", yml: "yaml", css: "css", scss: "css", less: "css", html: "html", htm: "html", vue: "js" };
		function highlightCode(code, lang) {
			const kwSet = new Set((LANG_KEYWORDS[lang] || LANG_KEYWORDS.js || "").split(/\s+/).filter(Boolean));
			const lineCmt = LANG_LINE_COMMENT[lang] || "//";
			const lcEsc = lineCmt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			const re = new RegExp(
				"(" + lcEsc + "[^\\n]*)|" +
				"(\\/\\*[\\s\\S]*?\\*\\/|<!--[\\s\\S]*?-->)|" +
				"(\"(?:[^\"\\\\\\n]|\\\\.)*\"|'(?:[^'\\\\\\n]|\\\\.)*'|`(?:[^`\\\\\\n]|\\\\.)*`)|" +
				"(\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b)|" +
				"(\\b[A-Za-z_$][\\w$]*\\b)",
				"g");
			let html = "";
			let last = 0;
			let m;
			while ((m = re.exec(code))) {
				const [full, lineC, blockC, str, num, id] = m;
				html += escHtml(code.slice(last, m.index));
				if (lineC) html += `<span class="dgp-tk-c">${escHtml(lineC)}</span>`;
				else if (blockC) html += `<span class="dgp-tk-c">${escHtml(blockC)}</span>`;
				else if (str) html += `<span class="dgp-tk-s">${escHtml(str)}</span>`;
				else if (num) html += `<span class="dgp-tk-n">${escHtml(num)}</span>`;
				else if (id) {
					if (kwSet.has(id)) html += `<span class="dgp-tk-k">${escHtml(id)}</span>`;
					else if (/^[A-Z]/.test(id) && (lang === "ts" || lang === "java" || lang === "cs" || lang === "go" || lang === "cpp" || lang === "c" || lang === "rs")) html += `<span class="dgp-tk-t">${escHtml(id)}</span>`;
					else html += escHtml(id);
				}
				last = m.index + full.length;
			}
			html += escHtml(code.slice(last));
			return html;
		}

		// ── compact markdown → HTML (self-contained, escaped) ────────────────────
		function inlineMd(s) {
			let r = escHtml(s);
			r = r.replace(/`([^`]+)`/g, "<code>$1</code>");
			r = r.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
			r = r.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
			r = r.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m2, alt, u) => /^(https?:)/.test(u) ? `<img src="${escHtml(u)}" alt="${escHtml(alt)}" />` : escHtml(alt || "(image)"));
			r = r.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m2, t, u) => /^(https?:|mailto:|#)/.test(u) ? `<a href="${escHtml(u)}" target="_blank" rel="noreferrer">${t}</a>` : t);
			return r;
		}
		function renderMarkdown(src) {
			const lines = String(src ?? "").replace(/\r\n/g, "\n").split("\n");
			let html = "";
			let i = 0;
			while (i < lines.length) {
				const t = lines[i].trim();
				const fence = t.match(/^```(\w*)\s*$/);
				if (fence) {
					const lang = fence[1].toLowerCase();
					const buf = [];
					i++;
					while (i < lines.length && !/^```\s*$/.test(lines[i].trim())) { buf.push(lines[i]); i++; }
					i++;
					const body = buf.join("\n");
					html += `<pre class="dgp-mdPre"><code>` + (lang ? highlightCode(body, lang) : escHtml(body)) + `</code></pre>\n`;
					continue;
				}
				const hd = t.match(/^(#{1,6})\s+(.*)$/);
				if (hd) { const n = hd[1].length; html += `<h${n}>` + inlineMd(hd[2]) + `</h${n}>\n`; i++; continue; }
				if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { html += "<hr>\n"; i++; continue; }
				if (t.startsWith(">")) {
					const buf = [];
					while (i < lines.length && lines[i].trim().startsWith(">")) { buf.push(lines[i].trim().replace(/^>\s?/, "")); i++; }
					html += `<blockquote>` + renderMarkdown(buf.join("\n")) + `</blockquote>\n`;
					continue;
				}
				const ul = t.match(/^[-*+]\s+(.*)$/);
				if (ul) {
					html += "<ul>\n";
					while (i < lines.length) { const m2 = lines[i].trim().match(/^[-*+]\s+(.*)$/); if (!m2) break; html += `<li>` + inlineMd(m2[1]) + `</li>\n`; i++; }
					html += "</ul>\n";
					continue;
				}
				const ol = t.match(/^\d+[.)]\s+(.*)$/);
				if (ol) {
					html += "<ol>\n";
					while (i < lines.length) { const m2 = lines[i].trim().match(/^\d+[.)]\s+(.*)$/); if (!m2) break; html += `<li>` + inlineMd(m2[1]) + `</li>\n`; i++; }
					html += "</ol>\n";
					continue;
				}
				if (t.startsWith("|") && lines[i + 1] && /^\|?[\s:|-]+\|?$/.test(lines[i + 1].trim()) && lines[i + 1].includes("-")) {
					const parseRow = (r) => r.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
					const header = parseRow(t);
					i += 2;
					const body = [];
					while (i < lines.length && lines[i].trim().startsWith("|")) { body.push(parseRow(lines[i])); i++; }
					html += "<table><thead><tr>" + header.map((c) => `<th>` + inlineMd(c) + `</th>`).join("") + "</tr></thead><tbody>";
					for (const row of body) html += "<tr>" + row.map((c) => `<td>` + inlineMd(c) + `</td>`).join("") + "</tr>";
					html += "</tbody></table>\n";
					continue;
				}
				if (t === "") { i++; continue; }
				const para = [t];
				i++;
				while (i < lines.length) {
					const nt = lines[i].trim();
					if (nt === "" || /^(#{1,6}\s|```|>\s?|[-*+]\s|\d+[.)]\s|(-{3,}|\*{3,}|_{3,})$|^\|)/.test(nt)) break;
					para.push(nt); i++;
				}
				html += `<p>` + para.map(inlineMd).join("<br>\n") + `</p>\n`;
			}
			return html;
		}

		// Clipboard write with a legacy fallback (127.0.0.1 is a secure context,
		// so navigator.clipboard normally works; fallback covers odd hosts).
		const copyText = async (text) => {
			try { await navigator.clipboard.writeText(text); return true; }
			catch {
				try {
					const ta = document.createElement("textarea");
					ta.value = text;
					ta.style.position = "fixed"; ta.style.opacity = "0";
					document.body.appendChild(ta); ta.select();
					const ok = document.execCommand("copy");
					ta.remove();
					return ok;
				} catch { return false; }
			}
		};

		// One file-browser row (memoized: clicking a row to select it only
		// re-renders that row, not the whole pane list). Hovering reveals
		// quick actions: open the containing folder in the system explorer,
		// copy the absolute path, copy the file name.
		const FileRow = React.memo(function FileRow({ entry, path, selected, status, onSelect, onOpenDir, onOpenPreview, onOpenFolder, onCopyPath, onCopyName }) {
			const isDir = entry.type === "dir";
			const badge = isDir ? null : gitBadgeOf(status, entry.path);
			const Icon = isDir ? IconFolderOpen : iconForFile(entry.name);
			const [copied, setCopied] = useState(null);   // "path" | "name" | null
			const copiedTimer = useRef(null);
			const t = useT();
			const flash = (kind) => {
				setCopied(kind);
				clearTimeout(copiedTimer.current);
				copiedTimer.current = setTimeout(() => setCopied(null), 1200);
			};
			return h("div", { className: "dgp-row", "data-clickable": "true", "data-selected": selected ? "true" : "false", title: entry.path, onClick: onSelect, onDoubleClick: () => (isDir ? onOpenDir(path, entry.path) : onOpenPreview(path, entry.path)) },
				h("span", { className: "dgp-fileIcon" }, h(Icon, { size: isDir ? 15 : 14 })),
				h("span", { className: "dgp-treeName", style: isDir ? { fontWeight: 500 } : { fontFamily: "var(--dsw-font-mono,monospace)", fontSize: 12 } }, entry.name),
				badge ? h("span", { className: "dgp-badge", "data-tone": badge.tone }, t(badge.label)) : null,
				!isDir && entry.size != null ? h("span", { className: "dgp-rowMeta" }, fmtSize(entry.size)) : null,
				h("span", { className: "dgp-fileActs" },
					lbtn(t("file.openDirRow"), (e) => { e.stopPropagation(); onOpenFolder(entry.path, isDir); }, { title: t("file.openDirRowTitle") }),
					lbtn(copied === "path" ? t("file.copied") : t("file.copyPath"), (e) => { e.stopPropagation(); onCopyPath(entry.path, isDir).then((ok) => ok && flash("path")); }, { title: t("file.copyPathTitle") }),
					lbtn(copied === "name" ? t("file.copied") : t("file.copyName"), (e) => { e.stopPropagation(); onCopyName(entry.name).then((ok) => ok && flash("name")); }, { title: t("file.copyNameTitle") })
				)
			);
		});

		function FileBrowser({ cwd, status, refreshTick, onEdited }) {
			// `dirs`: rel-path → entries; `leftPath`/`rightPath`: the two panes;
			// `preview`: {path,name,text,truncated,binary,size,kind} when previewing.
			const [dirs, setDirs] = useState({});
			const [leftPath, setLeftPath] = useState(null);   // null ⇒ single list
			const [rightPath, setRightPath] = useState("");   // current list (root = "")
			const [preview, setPreview] = useState(null);
			const [sel, setSel] = useState(null);
			const [query, setQuery] = useState("");   // file list name filter
			// Inline editing (CodeMirror 6, lazy CDN): `pvEdit` toggles the
			// editor inside the preview pane; `editBusy` covers load+save; the
			// EditorView instance lives in editorRef (destroyed on unmount).
			const [pvEdit, setPvEdit] = useState(false);
			const [editBusy, setEditBusy] = useState(false);
			const [editErr, setEditErr] = useState(null);
			const t = useT();
			const editorHostRef = useRef(null);
			const editorRef = useRef(null);
			// Preview render mode: "source" (default — plain text, no highlight /
			// markdown render, no head-cut) vs "preview" (rendered: markdown /
			// syntax highlight, rendered in full — code highlighted in chunks so
			// huge files stream in without freezing the UI). Reset to source on
			// every file open.
			const [pvMode, setPvMode] = useState("source");
			// Chunked highlight output for preview mode (code kind); null while
			// still rendering, "" when the file has no text.
			const [pvRendered, setPvRendered] = useState(null);
			// Recent search terms (whole-workspace box), persisted locally so the
			// user can jump straight back to a file they searched before.
			const [histOpen, setHistOpen] = useState(false);
			const [history, setHistory] = useState(() => {
				try { return JSON.parse(localStorage.getItem("dsh-files-git.searchHistory")) || []; }
				catch { return []; }
			});
			const rememberQuery = useCallback((term) => {
				const t = (term || "").trim().toLowerCase();
				if (!t) return;
				setHistory((prev) => {
					const next = [t, ...prev.filter((x) => x !== t)].slice(0, 8);
					try { localStorage.setItem("dsh-files-git.searchHistory", JSON.stringify(next)); } catch {}
					return next;
				});
			}, []);
			const clearHistory = useCallback(() => {
				setHistory([]);
				try { localStorage.removeItem("dsh-files-git.searchHistory"); } catch {}
			}, []);
			// Auto-remember: 1s after the user stops typing (and on blur / Enter),
			// the current term is saved — no need to press Enter explicitly.
			useEffect(() => {
				if (!query.trim()) return;
				const t = setTimeout(() => rememberQuery(query), 1000);
				return () => clearTimeout(t);
			}, [query, rememberQuery]);
			// The search-history dropdown is portaled to the panel root (outside
			// the dialog content) so its backdrop-filter actually renders — Chrome
			// silently drops backdrop-filter inside a layer that already has one.
			// It needs fixed viewport coordinates from the search input.
			const [histPos, setHistPos] = useState(null);
			const openHist = useCallback((open) => {
				const inp = document.querySelector(".dgp-search");
				if (inp && open) {
					const r = inp.getBoundingClientRect();
					setHistPos({ left: Math.round(r.left), top: Math.round(r.bottom + 4), width: Math.round(r.width) });
				}
				setHistOpen(open);
			}, []);
			// Wheel lock while the dropdown is open: scrolling anywhere in the
			// panel (outside the dropdown) is swallowed so the wheel cannot pass
			// through to content beneath the popup.
			useEffect(() => {
				if (!histOpen) return;
				const onWheel = (e) => {
					if (e.target.closest(".dgp-searchHist")) return;
					if (e.target.closest(".dgp-root")) e.preventDefault();
				};
				document.addEventListener("wheel", onWheel, { passive: false });
				return () => document.removeEventListener("wheel", onWheel);
			}, [histOpen]);
			// Whole-workspace file index (git ls-files): fetched once per cwd,
			// null while loading or when cwd is not a git repo (falls back to
			// filtering the current directory only).
			const [allFiles, setAllFiles] = useState(null);
			useEffect(() => {
				let alive = true;
				setAllFiles(null);
				gitRpc("search", { repo: cwd })
					.then((v) => { if (alive) setAllFiles(Array.isArray(v.files) ? v.files : null); })
					.catch(() => { if (alive) setAllFiles(null); });
				return () => { alive = false; };
			}, [cwd]);
			const [browseError, setBrowseError] = useState(null);
			// External file-open request (produced-file/link click routed through
			// the openPath interception): {path, ts} → navigate to the file's
			// directory and open a preview. Paths outside the current workspace
			// show a hint bar with a "system app" fallback button. The effect
			// itself lives below (after loadDir/openPreview are defined).
			const openReq = useSyncExternalStore(subscribeOpenReq, getOpenReq);
			const lastOpenReqTs = useRef(0);
			const [extOpen, setExtOpen] = useState(null);
			// Split ratio control: `listFrac` (list split, default .5) and
			// `previewFrac` (preview, default .15); null = default. Draggable gutter.
			const [listFrac, setListFrac] = useState(null);
			const [previewFrac, setPreviewFrac] = useState(null);
			const [dragging, setDragging] = useState(false);
			const splitRef = useRef(null);

			const loadDir = useCallback(async (rel) => {
				setDirs((d) => ({ ...d, [rel]: "loading" }));
				try {
					const v = await gitRpc("list", { repo: cwd, path: rel });
					setDirs((d) => ({ ...d, [rel]: v.entries }));
				} catch (err) {
					setBrowseError(err.message);
					setDirs((d) => ({ ...d, [rel]: [] }));
				}
			}, [cwd]);

			useEffect(() => { setDirs({}); setLeftPath(null); setRightPath(""); setPreview(null); setSel(null); setBrowseError(null); loadDir(""); }, [loadDir]);
			useEffect(() => { if (refreshTick > 0) { loadDir(""); if (leftPath) loadDir(leftPath); loadDir(rightPath); } }, [refreshTick, leftPath, rightPath, loadDir]);
			useEffect(() => { const cur = dirs[rightPath]; if (cur === undefined || cur === "loading") loadDir(rightPath); }, [rightPath, dirs, loadDir]);
			// Left pane auto-load: external open requests set leftPath to the
			// file's grandparent directory (never loaded on its own) — without
			// this, that pane would show "加载中…" forever.
			useEffect(() => { if (leftPath === null) return; const cur = dirs[leftPath]; if (cur === undefined || cur === "loading") loadDir(leftPath); }, [leftPath, dirs, loadDir]);

			const parentOf = (p) => { const i = p.lastIndexOf("/"); return i === -1 ? "" : p.slice(0, i); };
			const baseName = (p) => p === "" ? "" : p.split("/").pop();
			const rootName = (() => { const s = cwd.replace(/[\\/]+$/, "").split(/[\\/]/); return s[s.length - 1] || cwd; })();

			// Double-click a folder in pane `panePath` → cascade: the pane's list
			// moves to the left, the folder's contents become the right list.
			const openDir = useCallback((panePath, entryPath) => {
				setPreview(null);
				setSel(entryPath);
				if (panePath === rightPath) {          // entered from the right (or single) list
					setLeftPath(rightPath);
					setRightPath(entryPath);
				} else if (panePath === leftPath) {    // entered from the left list → drill down
					setLeftPath(panePath);
					setRightPath(entryPath);
				} else {                                // entered from single list
					setLeftPath(panePath);
					setRightPath(entryPath);
				}
			}, [leftPath, rightPath]);

			// Double-click a file → preview expands right; the list it was in
			// becomes the left pane (even from the single root list).
			const openPreview = useCallback(async (panePath, entryPath) => {
				setBrowseError(null);
				try {
					const v = await gitRpc("read", { repo: cwd, path: entryPath });
					const kind = v.binary ? "binary" : (MD_EXTS.has(extOf(entryPath)) ? "md" : (CODE_EXTS.has(extOf(entryPath)) || DATA_EXTS.has(extOf(entryPath)) || WEB_EXTS.has(extOf(entryPath)) ? "code" : "text"));
					const lang = LANG_FROM_EXT[extOf(entryPath)] || "js";
					setLeftPath((lp) => (lp === null ? panePath : lp));   // promote single list to left pane
					setPvMode("source");
					setPreview({ path: entryPath, name: entryPath.split("/").pop(), text: v.text, truncated: v.truncated, binary: v.binary, size: v.size, kind, lang });
				} catch (err) { setBrowseError(err.message); }
			}, [cwd]);

			// Closing the preview: if it was opened from the single list, the list
			// was promoted to the left pane (leftPath === rightPath, both the same
			// directory) — collapse back to a single list instead of mirroring it.
			const closePreview = useCallback(() => {
				setPreview(null);
				setLeftPath((lp) => (lp !== null && lp === rightPath ? null : lp));
			}, [rightPath]);
			const openInEditor = useCallback(async (rel) => {
				try { await rpc("api", "host.openPath", { path: `${cwd.replace(/[\\/]+$/, "")}/${rel}` }); }
				catch (err) { setBrowseError(err.message); }
			}, [cwd]);
			// System-open an ABSOLUTE path (used for files previewed from outside
			// the workspace, where the cwd-relative form is meaningless).
			const openInEditorAbs = useCallback(async (abs) => {
				try { await rpc("api", "host.openPath", { path: abs }); }
				catch (err) { setBrowseError(err.message); }
			}, []);
			// Row quick actions: absolute-path helpers shared by copy/open.
			const absOf = useCallback((rel) => `${cwd.replace(/[\\/]+$/, "")}/${rel.replace(/^\/+/, "")}`, [cwd]);
			// Open the entry's folder in the system file explorer (for a file:
			// its parent directory; for a directory: itself).
			const onOpenFolder = useCallback(async (rel, isDir) => {
				try {
					const target = isDir ? absOf(rel) : absOf(parentOf(rel));
					await rpc("api", "host.openPath", { path: target });
				} catch (err) { setBrowseError(err.message); }
			}, [absOf]);
			const onCopyPath = useCallback((rel, isDir) => copyText(absOf(rel)), [absOf]);
			const onCopyName = useCallback((name) => copyText(name), []);

			// Consume an external open request: navigate to the file's directory
			// and open a preview. Defined here (after loadDir/openPreview) so the
			// dependency array never touches a const before initialization.
			useEffect(() => {
				if (!openReq || openReq.ts === lastOpenReqTs.current) return;
				lastOpenReqTs.current = openReq.ts;
				const abs = String(openReq.path || "").trim();
				if (!abs) return;
				const normCwd = cwd.replace(/[\\/]+$/, "");
				const absSlash = abs.replace(/\\/g, "/");
				const cwdSlash = normCwd.replace(/\\/g, "/");
				const absLower = absSlash.toLowerCase();
				const cwdLower = cwdSlash.toLowerCase();
				if (absLower === cwdLower) return; // the workspace root itself
				if (absLower.startsWith(cwdLower + "/")) {
					const rel = absSlash.slice(cwdSlash.length).replace(/^\/+/, "");
					if (!rel) return;
					const dir = parentOf(rel);
					setExtOpen(null);
					setBrowseError(null);
					if (dir === "") { setLeftPath(null); setRightPath(""); }
					else { setLeftPath(parentOf(dir)); setRightPath(dir); }
					loadDir(dir);
					openPreview(dir, rel);
				} else {
					// File outside the current workspace: read it via the
					// absolute-path endpoint and preview inline; on failure
					// fall back to the hint bar with a system-open button.
					setExtOpen(null);
					setBrowseError(null);
					// Give the preview a left pane (the workspace root) so the
					// split grid renders two real panes — without a leftPath the
					// 3-column grid would get only the gutter + preview children
					// and the preview would collapse into the 8px gutter column.
					setLeftPath((lp) => (lp === null ? "" : lp));
					(async () => {
						try {
							const v = await gitRpc("readPath", { repo: cwd, path: abs });
							const fname = absSlash.split("/").pop() || abs;
							const ext = extOf(fname);
							const kind = v.binary ? "binary" : (MD_EXTS.has(ext) ? "md" : (CODE_EXTS.has(ext) || DATA_EXTS.has(ext) || WEB_EXTS.has(ext) ? "code" : "text"));
							const lang = LANG_FROM_EXT[ext] || "js";
							setPvMode("source");
							setPreview({ path: fname, abs, name: fname, text: v.text, truncated: v.truncated, binary: v.binary, size: v.size, kind, lang });
						} catch {
							setExtOpen({ abs });
						}
					})();
				}
			}, [openReq, cwd, loadDir, openPreview]);

			// Breadcrumb: root ▸ a ▸ b ▸ (file). Clicking a segment jumps there.
			// For a file previewed from OUTSIDE the workspace (abs set) the crumb
			// chain shows the file's own absolute path segments instead of the
			// workspace-relative rightPath — those segments are display-only
			// (the external directory is not navigable inside this panel).
			const navTo = useCallback((target) => {
				setPreview(null);
				if (target === "") { setLeftPath(null); setRightPath(""); }
				else { setLeftPath(parentOf(target)); setRightPath(target); }
			}, []);
			// The crumb chain doubles as the panel's path display (the header
			// shows no cwd line): in-workspace paths are clickable segments, an
			// external preview shows the file's absolute path, read-only.
			// Rightmost button opens the current crumb directory in the system
			// file explorer (works for both in-workspace and external paths).
			const openCrumbDir = useCallback(() => {
				if (preview?.abs) {
					// External file: its parent directory, normalized back to
					// native separators for the system explorer call.
					const absNative = preview.abs.replace(/\//g, "\\");
					const i = absNative.lastIndexOf("\\");
					openInEditorAbs(i === -1 ? absNative : absNative.slice(0, i) || absNative);
				} else {
					openInEditorAbs(rightPath === "" ? cwd : absOf(rightPath));
				}
			}, [preview, rightPath, cwd, openInEditorAbs, absOf]);
			const extCrumbs = preview?.abs ? preview.abs.replace(/\\/g, "/").split("/").filter(Boolean) : null;
			const segs = rightPath === "" ? [] : rightPath.split("/");
			const crumbs = h("div", { className: "dgp-crumbs" },
				extCrumbs
					? extCrumbs.map((seg, i) => h(React.Fragment, { key: i },
						h("span", { className: "dgp-crumbSep" }, i === 0 ? "" : " / "),
						h("span", { className: "dgp-crumb dgp-crumbStatic" + (i === extCrumbs.length - 1 ? " dgp-crumbActive" : ""), title: preview.abs }, seg)
					))
					: h(React.Fragment, null,
						h("button", { className: "dgp-crumb" + (segs.length === 0 && !preview ? " dgp-crumbActive" : ""), onClick: () => navTo(""), title: cwd }, h(IconFolderOpen, { size: 12 }), rootName),
						segs.map((seg, i) => h(React.Fragment, { key: i },
							h("span", { className: "dgp-crumbSep" }, " / "),
							h("button", { className: "dgp-crumb" + (i === segs.length - 1 && !preview ? " dgp-crumbActive" : ""), onClick: () => navTo(segs.slice(0, i + 1).join("/")) }, seg)
						)),
						preview ? h(React.Fragment, null,
							h("span", { className: "dgp-crumbSep" }, " / "),
							h("span", { className: "dgp-crumb dgp-crumbActive" }, preview.name)
						) : null
					),
				h("button", { type: "button", className: "dgp-crumbDir", title: t("file.openFolder"), onClick: openCrumbDir },
					h(IconFolderOpen, { size: 13 }),
					h("span", null, t("common.openDir")))
			);

			// One list pane (folders first, then files). Single click selects,
			// double click on a folder drills in, on a file previews.
			const renderList = (path, opts = {}) => {
				const entries = dirs[path];
				if (entries === undefined || entries === "loading") return h("div", { className: "dgp-paneEmpty" }, t("common.loading"));
				const q = query.trim().toLowerCase();
				const items = entries.filter((e) => e.name !== ".git" && (!q || e.name.toLowerCase().includes(q)));
				const dirItems = items.filter((e) => e.type === "dir");
				const fileItems = items.filter((e) => e.type !== "dir");
				const row = (entry) => h(FileRow, { key: entry.path, entry, path, selected: sel === entry.path, status, onSelect: () => setSel(entry.path), onOpenDir: openDir, onOpenPreview: openPreview, onOpenFolder, onCopyPath, onCopyName });
				return h(React.Fragment, null,
					h("div", { className: "dgp-paneTitle", title: path === "" ? cwd : path }, opts.title ?? (path === "" ? rootName : baseName(path))),
					dirItems.map(row),
					fileItems.map(row),
					items.length === 0 ? h("div", { className: "dgp-paneEmpty" }, t("common.emptyDir")) : null
				);
			};

			// Preview body: source mode shows the plain text (no highlight /
			// markdown render, so even 512 KB files are cheap and NOT head-cut);
			// preview mode renders markdown / syntax-highlighted code IN FULL —
			// no truncation. Code is highlighted chunk-by-chunk (see effect
			// below) so a 500 KB file streams in progressively instead of
			// blocking the main thread. Memoized by preview + mode + chunked html.
			// Leaving a preview (new file, close, cwd change) exits edit mode.
			useEffect(() => { setPvEdit(false); setEditErr(null); }, [preview]);
			// Editor lifecycle: while editing, mount CodeMirror into the host
			// element; destroy it on exit/unmount. Recreated per file open.
			useEffect(() => {
				if (!pvEdit || !preview || !editorHostRef.current) return;
				let alive = true;
				setEditBusy(true);
				setEditErr(null);
				const dark = typeof document !== "undefined" && document.body.hasAttribute("data-ds-dark-theme");
				cmCreateEditor(editorHostRef.current, {
					doc: preview.text || "",
					ext: extOf(preview.name),
					dark,
					onChange: () => {}
				}).then((view) => {
					if (!alive) { view.destroy(); return; }
					editorRef.current = view;
					setEditBusy(false);
				}).catch((err) => {
					if (!alive) return;
					setEditErr(t("pv.editFail", { msg: err?.message ?? err }));
					setEditBusy(false);
				});
				return () => {
					alive = false;
					if (editorRef.current) { editorRef.current.destroy(); editorRef.current = null; }
				};
			}, [pvEdit, preview]);
			// Save the edited content back to disk. Works for workspace-relative
			// paths (containment-checked by the host) and absolute paths for
			// files outside the workspace. On success the preview text is
			// refreshed and the parent is told to re-pull git status.
			const saveEdit = useCallback(async () => {
				const view = editorRef.current;
				const p = preview;
				if (!view || !p) return;
				const content = view.state.doc.toString();
				setEditBusy(true);
				setEditErr(null);
				try {
					const payload = p.abs ? { repo: cwd, abs: p.abs, content } : { repo: cwd, path: p.path, content };
					await gitRpc("write", payload);
					setPreview((prev) => (prev && prev.path === p.path && prev.abs === p.abs ? { ...prev, text: content, size: new TextEncoder().encode(content).length, truncated: false } : prev));
					setPvEdit(false);
					if (typeof onEdited === "function") onEdited();
				} catch (err) {
					setEditErr(err.message);
				} finally {
					setEditBusy(false);
				}
			}, [preview, cwd, onEdited]);
			const cancelEdit = useCallback(() => { setPvEdit(false); setEditErr(null); }, []);
			const PREVIEW_CHARS = 60000;
			useEffect(() => {
				if (!preview || preview.kind !== "code" || pvMode !== "preview") { setPvRendered(null); return; }
				let alive = true;
				setPvRendered(null);
				const text = preview.text || "";
				if (text === "") { setPvRendered(""); return; }
				const CHUNK = 30000;
				const chunks = [];
				for (let i = 0; i < text.length; i += CHUNK) chunks.push(text.slice(i, i + CHUNK));
				let out = "";
				let k = 0;
				const step = () => {
					if (!alive) return;
					out += highlightCode(chunks[k], preview.lang);
					k++;
					if (k < chunks.length) setTimeout(step, 0);
					else setPvRendered(out);
				};
				step();
				return () => { alive = false; };
			}, [preview, pvMode]);
			const previewBody = useMemo(() => {
				if (!preview) return null;
				const p = preview;
				if (p.kind === "binary") return { kind: "binary" };
				if (pvMode === "source") {
					const note = p.truncated ? t("file.truncatedNote") : "";
					return { kind: "text", text: (p.text || "") + note };
				}
				if (p.kind === "md") return { kind: "md", html: renderMarkdown(p.text || "") };
				if (p.kind === "code") return { kind: "code", html: pvRendered, pending: pvRendered === null };
				return { kind: "text", text: p.text || "" };
			}, [preview, pvMode, pvRendered]);

			const previewView = () => {
				const p = preview;
				let body;
				if (!previewBody) return null;
				if (pvEdit) {
					// Inline CodeMirror editing replaces the rendered body.
					body = h(React.Fragment, null,
						editErr ? h("div", { className: "dgp-error" },
							h("span", { style: { flex: 1 } }, editErr),
							lbtn(t("common.retry"), () => { setEditErr(null); setPvEdit(false); setTimeout(() => setPvEdit(true), 0); }, { tone: "default" }),
							lbtn(t("common.close"), () => setEditErr(null), { tone: "default" })) : null,
						h("div", { className: "dgp-editorHost", ref: editorHostRef }, editBusy ? h("div", { className: "dgp-paneEmpty" }, t("pv.loadingEditor")) : null)
					);
				} else if (previewBody.kind === "binary") {
					body = h("div", { className: "dgp-paneEmpty" }, t("file.binary"));
				} else if (previewBody.kind === "md") {
					body = h("div", { className: "dgp-md" }, h("div", { dangerouslySetInnerHTML: { __html: previewBody.html } }));
				} else if (previewBody.kind === "code") {
					body = previewBody.pending ? h("div", { className: "dgp-paneEmpty" }, t("pv.renderHighlight")) : h("pre", { className: "dgp-pre" }, h("code", { dangerouslySetInnerHTML: { __html: previewBody.html } }));
				} else {
					body = h("pre", { className: "dgp-pre" }, previewBody.text);
				}
				const editable = !p.binary && !p.truncated;
				return h(React.Fragment, null,
					h("div", { className: "dgp-previewHead" },
						h("span", { className: "dgp-fileIcon" }, h(iconForFile(p.name), { size: 15 })),
						h("span", { className: "dgp-previewName", title: p.abs || p.path }, p.name),
						p.size != null ? h("span", { className: "dgp-rowMeta" }, fmtSize(p.size)) : null,
						!pvEdit && (p.kind === "md" || p.kind === "code") ? h(React.Fragment, null,
							h("span", { className: "dgp-pvSwitch", role: "group", "aria-label": t("pv.modeAria") },
								lbtn(t("pv.preview"), () => setPvMode("preview"), { active: pvMode === "preview" }),
								lbtn(t("pv.source"), () => setPvMode("source"), { active: pvMode === "source", tone: "default" }))
						) : null,
						h("span", { style: { flex: 1 } }),
						pvEdit
							? h(React.Fragment, null,
								lbtn(t("pv.save"), saveEdit, { disabled: editBusy, title: editBusy ? t("pv.saving") : t("pv.save") }),
								lbtn(t("common.cancel"), cancelEdit, { tone: "default" }))
							: h(React.Fragment, null,
								editable ? lbtn(t("pv.edit"), () => setPvEdit(true), { title: p.truncated ? t("pv.editTruncated") : t("pv.editHint") }) : null,
								lbtn(t("pv.openEditor"), () => (p.abs ? openInEditorAbs(p.abs) : openInEditor(p.path))),
								lbtn(t("pv.closePreview"), closePreview, { tone: "default" }))
					),
					h("div", { className: "dgp-previewBody" + (pvEdit ? " dgp-editBody" : "") }, body)
				);
			};

			const split = leftPath !== null;
			// Effective left-pane share of the split (0..1); user-drag overrides default.
			// Preview default is 3:7 (list : preview); plain browsing defaults 1:1.
			const leftShare = preview ? (previewFrac ?? 0.3) : (listFrac ?? 0.5);
			const gridCols = (split || preview) ? `${leftShare.toFixed(3)}fr 8px ${(1 - leftShare).toFixed(3)}fr` : "1fr";

			// Gutter drag → resize left pane (clamped so both sides stay usable).
			const onGutterDown = useCallback((e) => {
				e.preventDefault();
				setDragging(true);
				const el = splitRef.current;
				if (!el) return;
				const isPreview = preview !== null;
				const move = (ev) => {
					const rect = el.getBoundingClientRect();
					if (rect.width <= 0) return;
					let f = (ev.clientX - rect.left) / rect.width;
					f = Math.max(0.08, Math.min(0.85, f));
					if (isPreview) setPreviewFrac(f); else setListFrac(f);
				};
				const up = () => { setDragging(false); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
				window.addEventListener("pointermove", move);
				window.addEventListener("pointerup", up);
			}, [preview]);
			const resetSplit = useCallback(() => {
				if (preview) setPreviewFrac(null); else setListFrac(null);
			}, [preview]);

			// Whole-workspace search: when typing in the box (and the workspace
			// file index is available) the main area becomes a flat result list;
			// double-click previews the file (right pane if a preview is open).
			const q = query.trim().toLowerCase();
			const globalSearch = q !== "" && allFiles !== null;
			// Memoize the whole-workspace filter: typing filters up to 5000 paths,
			// recomputing on every keystroke would be wasteful.
			const globalResults = useMemo(
				() => (globalSearch ? allFiles.filter((p) => p.toLowerCase().includes(q)).slice(0, 200) : []),
				[globalSearch, allFiles, q]
			);
			const globalList = () => h(React.Fragment, null,
				h("div", { className: "dgp-paneTitle" }, t("file.results", { count: globalResults.length >= 200 ? "200+" : globalResults.length })),
				globalResults.length === 0 ? h("div", { className: "dgp-paneEmpty" }, t("file.noMatch")) :
				globalResults.map((p) => {
					const badge = gitBadgeOf(status, p);
					return h("div", { key: p, className: "dgp-row", "data-clickable": "true", "data-selected": sel === p ? "true" : "false", title: `${p}\n${t("common.doubleClick")}`, onClick: () => setSel(p), onDoubleClick: () => openPreview("", p) },
						h("span", { className: "dgp-fileIcon" }, h(iconForFile(p), { size: 14 })),
						h("span", { className: "dgp-treeName", style: { fontFamily: "var(--dsw-font-mono,ui-monospace,monospace)", fontSize: 12 } }, p),
						badge ? h("span", { className: "dgp-badge", "data-tone": badge.tone }, t(badge.label)) : null
					);
				})
			);

			return h(React.Fragment, null,
				// The crumb chain is the panel's path display (the header no
				// longer shows a cwd line), so it stays visible in every state —
				// single list, split, preview, and external-file preview alike.
				// Only whole-workspace search replaces it with the result count.
				!globalSearch ? crumbs : null,
				h("div", { className: "dgp-searchRow" },
					h("span", { className: "dgp-searchIcon" }, h(IconSearch, { size: 12 })),
					h("input", { className: "dgp-search", placeholder: allFiles ? t("file.searchAll") : t("file.searchDir"), value: query, onChange: (e) => setQuery(e.target.value), onFocus: () => openHist(true), onBlur: () => { if (query.trim()) rememberQuery(query); setTimeout(() => setHistOpen(false), 120); }, onKeyDown: (e) => { if (e.key === "Enter") rememberQuery(query); }, spellCheck: false }),
					lbtn(t("common.history"), () => openHist(!histOpen), { active: histOpen, tone: "default" }),
					query ? lbtn(t("common.clear"), () => setQuery(""), { tone: "default" }) : null,
					histOpen && query.trim() === "" && histPos ? ReactDOM.createPortal(h("div", { className: "dgp-searchHist", style: { left: histPos.left, top: histPos.top, width: histPos.width } },
						history.length > 0 ? h(React.Fragment, null,
							h("div", { className: "dgp-searchHistHead" },
								h("span", null, t("file.recent")),
								lbtn(t("common.cleanAll"), clearHistory, { tone: "default" })
							),
							history.map((t) => h("button", { type: "button", key: t, className: "dgp-searchHistItem", title: t, onMouseDown: (e) => e.preventDefault(), onClick: () => { setQuery(t); setHistOpen(false); rememberQuery(t); } },
								h(IconSearch, { size: 12 }),
								h("span", { className: "dgp-treeName" }, t)
							))
						) : h("div", { className: "dgp-searchHistHead" }, h("span", null, t("file.noHistory")))
					), document.querySelector(".dgp-root")) : null
				),
				browseError ? h("div", { className: "dgp-error" }, h("span", { style: { flex: 1 } }, browseError), lbtn(t("common.close"), () => setBrowseError(null), { tone: "default" })) : null,
				extOpen ? h("div", { className: "dgp-error" },
					h("span", { style: { flex: 1 } }, `${t("file.cantPreview", { path: extOpen.abs })}`),
					lbtn(t("file.openSystem"), () => { rpc("api", "host.openPath", { path: extOpen.abs }).catch((err) => setBrowseError(err.message)); setExtOpen(null); }),
					lbtn(t("common.close"), () => setExtOpen(null), { tone: "default" })
				) : null,
				globalSearch
					? (preview
						? h("div", { className: "dgp-split", ref: splitRef, "data-dragging": dragging ? "true" : "false", style: { gridTemplateColumns: gridCols } },
							h("div", { className: "dgp-pane" }, globalList()),
							h("div", { className: "dgp-gutter", title: t("file.gutter"), onPointerDown: onGutterDown, onDoubleClick: resetSplit }),
							h("div", { className: "dgp-pane" }, previewView()))
						: h("div", { className: "dgp-split", "data-dragging": "false", style: { gridTemplateColumns: "1fr" } },
							h("div", { className: "dgp-pane" }, globalList())))
					: h("div", { className: "dgp-split", ref: splitRef, "data-dragging": dragging ? "true" : "false", style: { gridTemplateColumns: gridCols } },
						split ? h("div", { className: "dgp-pane" }, renderList(leftPath)) : null,
						(split || preview) ? h("div", { className: "dgp-gutter", title: t("file.gutter"), onPointerDown: onGutterDown, onDoubleClick: resetSplit }) : null,
						preview ? h("div", { className: "dgp-pane" }, previewView()) : h("div", { className: "dgp-pane" }, renderList(rightPath))
					)
			);
		}

		// Settings page (a real tab — clicking the tab switches the body, no popover).
		const SettingsView = React.memo(function SettingsView({ maximized, onSetMax }) {
			const t = useT();
			const [defaultMax, setDefaultMax] = useState(readDefaultMaximized);
			const pick = useCallback((v) => {
				writeDefaultMaximized(v);
				setDefaultMax(v);
				onSetMax(v);   // apply to the current window too
			}, [onSetMax]);
			const [previewOpen, setPreviewOpen] = useState(() => {
				try { return localStorage.getItem(PREVIEW_OPEN_KEY) === "1"; } catch { return false; }
			});
			const setPreviewOpenFlag = useCallback((v) => {
				try { localStorage.setItem(PREVIEW_OPEN_KEY, v ? "1" : "0"); } catch {}
				setPreviewOpen(v);
			}, []);
			return h("div", { className: "dgp-settingsPage" },
				h("div", { className: "dgp-settingsTitle" }, t("set.title")),
				h("div", { className: "dgp-settingsCard" },
					h("div", { className: "dgp-settingsRow" }, t("set.defaultOpen")),
					h("div", { className: "dgp-settingsOpts" },
						h("button", { type: "button", className: "dgp-settingsOpt", "data-active": defaultMax ? "true" : "false", onClick: () => pick(true) }, t("set.maximized")),
						h("button", { type: "button", className: "dgp-settingsOpt", "data-active": defaultMax ? "false" : "true", onClick: () => pick(false) }, t("set.normal"))
					),
					h("div", { className: "dgp-settingsHint" }, t("set.applyHint")),
					h("div", { className: "dgp-settingsHint" }, t("set.current", { cur: maximized ? t("set.maximized") : t("set.normal"), def: defaultMax ? t("set.maximized") : t("set.normal") }))
				),
				h("div", { className: "dgp-settingsCard" },
					h("div", { className: "dgp-settingsRow" }, t("set.click")),
					h("div", { className: "dgp-settingsOpts" },
						h("button", { type: "button", className: "dgp-settingsOpt", "data-active": previewOpen ? "true" : "false", onClick: () => setPreviewOpenFlag(true) }, t("set.panelPreview")),
						h("button", { type: "button", className: "dgp-settingsOpt", "data-active": previewOpen ? "false" : "true", onClick: () => setPreviewOpenFlag(false) }, t("set.systemOpen"))
					),
					h("div", { className: "dgp-settingsHint" }, t("set.previewHint")),
					h("div", { className: "dgp-settingsHint" }, t("set.editorHint"))
				)
			);
		});
