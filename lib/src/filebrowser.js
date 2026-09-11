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
		// Media preview mapping: mime types for blob-URL rendering (images,
		// PDFs, sandboxed HTML). Decided by extension only — the host returns
		// raw base64 bytes.
		const MIME_FROM_EXT = {
			png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif",
			svg: "image/svg+xml", webp: "image/webp", ico: "image/x-icon", bmp: "image/bmp",
			pdf: "application/pdf", html: "text/html", htm: "text/html"
		};
		function extOf(name) { const i = name.lastIndexOf("."); return i === -1 ? "" : name.slice(i + 1).toLowerCase(); }
		// Classify a file for preview. Media kinds (image/pdf) skip the text
		// `read` RPC entirely — they go straight to `readBlob`.
		function classifyOf(name) {
			const ext = extOf(name);
			if (IMG_EXTS.has(ext)) return "image";
			if (ext === "pdf") return "pdf";
			if (WEB_EXTS.has(ext) && (ext === "html" || ext === "htm")) return "html";
			if (MD_EXTS.has(ext)) return "md";
			if (CODE_EXTS.has(ext) || DATA_EXTS.has(ext) || WEB_EXTS.has(ext)) return "code";
			return "text";
		}
		// Files that offer the preview/source toggle (anything renderable).
		const SWITCHABLE_KINDS = new Set(["md", "code", "html"]);
		// Kinds that open DIRECTLY in preview mode: code (chunked async
		// highlight is cheap) and html (sandboxed render). Markdown stays on
		// source by default — rendering a large document is heavier than
		// highlighting, so it renders only on explicit toggle.
		const DEFAULT_PREVIEW_KINDS = new Set(["code", "html"]);
		const defaultModeOf = (kind) => (DEFAULT_PREVIEW_KINDS.has(kind) ? "preview" : "source");
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
		function renderMarkdown(src, depth = 0) {
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
					// Depth cap: a file of thousands of nested ">" lines must not
					// recurse into a stack overflow — beyond the cap the block
					// renders as plain escaped paragraphs.
					if (depth >= 16) {
						html += `<blockquote>` + buf.map((l) => `<p>` + escHtml(l) + `</p>`).join("") + `</blockquote>\n`;
					} else {
						html += `<blockquote>` + renderMarkdown(buf.join("\n"), depth + 1) + `</blockquote>\n`;
					}
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
		// `tapOpens` (narrow viewports): a single tap navigates — folders drill
		// in, files open the preview — because double-tap is unreliable on
		// touch; the wide mode keeps select-on-click / open-on-double-click.
		const FileRow = React.memo(function FileRow({ entry, path, selected, status, tapOpens, checkable, checked, onSelect, onToggle, onOpenDir, onOpenPreview, onOpenFolder, onCopyPath, onCopyName, onDownload, onDownloadZip }) {
			const isDir = entry.type === "dir";
			const badge = isDir ? null : gitBadgeOf(status, entry.path);
			const Icon = isDir ? IconFolderOpen : iconForFile(entry.name);
			const [copied, setCopied] = useState(null);   // "path" | "name" | null
			// Row actions live in a "⋯" menu button (hover-revealed) and the
			// same menu opens on right-click — mirrors the git log context
			// menu (portal under .dgp-root, icons, click-away close).
			const [menu, setMenu] = useState(null);       // {x,y} | null
			const copiedTimer = useRef(null);
			const t = useT();
			const flash = (kind) => {
				setCopied(kind);
				clearTimeout(copiedTimer.current);
				copiedTimer.current = setTimeout(() => setCopied(null), 1200);
			};
			useEffect(() => () => clearTimeout(copiedTimer.current), []);
			useEffect(() => {
				if (!menu) return undefined;
				const close = () => setMenu(null);
				document.addEventListener("click", close);
				return () => document.removeEventListener("click", close);
			}, [menu]);
			const openMenuAt = (x, y) => setMenu({ x: Math.max(8, Math.min(x, window.innerWidth - 240)), y: Math.max(8, Math.min(y, window.innerHeight - 140)) });
			const menuItems = [
				{ icon: IconFolderOpen, label: t("file.openDirRow"), title: t("file.openDirRowTitle"), run: () => onOpenFolder(entry.path, isDir) },
				{ icon: IconData, label: copied === "path" ? t("file.copied") : t("file.copyPath"), title: t("file.copyPathTitle"), run: () => onCopyPath(entry.path, isDir).then((ok) => ok && flash("path")) },
				{ icon: IconListPen, label: copied === "name" ? t("file.copied") : t("file.copyName"), title: t("file.copyNameTitle"), run: () => onCopyName(entry.name).then((ok) => ok && flash("name")) },
				...(isDir
					? (onDownloadZip ? [{ icon: IconFolderOpen, label: t("file.downloadZip"), title: t("file.downloadZipTitle"), run: () => onDownloadZip(entry.path, entry.name) }] : [])
					: (onDownload ? [{ icon: IconPaperclip, label: t("file.download"), title: t("file.downloadTitle"), run: () => onDownload(entry.path, entry.name) }] : []))
			];
			const tapOpen = () => { onSelect(); isDir ? onOpenDir(path, entry.path) : onOpenPreview(path, entry.path); };
			// Status badge hugs the file name (left group) instead of floating
			// at the far right; size + the actions ⋯ button keep the right edge.
			return h("div", { className: "dgp-row", "data-clickable": "true", "data-selected": selected ? "true" : "false", "data-ignored": entry.ignored ? "true" : "false", title: entry.path + (entry.ignored ? "\n" + t("file.ignoredHint") : ""), onClick: tapOpens ? tapOpen : onSelect, onDoubleClick: () => (isDir ? onOpenDir(path, entry.path) : onOpenPreview(path, entry.path)), onContextMenu: (e) => { e.preventDefault(); e.stopPropagation(); onSelect(); openMenuAt(e.clientX, e.clientY); } },
				checkable ? h("span", { className: "dgp-rowCheck", "data-checked": checked ? "true" : "false", role: "checkbox", "aria-checked": checked ? "true" : "false", onClick: (e) => { e.stopPropagation(); onToggle?.(entry); } }, checked ? "✓" : "") : null,
				h("span", { className: "dgp-fileIcon" }, h(Icon, { size: isDir ? 15 : 14 })),
				h("span", { className: "dgp-treeName", style: { ...(isDir ? { fontWeight: 500 } : { fontFamily: "var(--dsw-font-mono,monospace)", fontSize: 12 }), flex: "0 1 auto" } }, entry.name),
				badge ? h("span", { className: "dgp-badge", "data-tone": badge.tone }, t(badge.label)) : null,
				h("span", { style: { flex: 1 } }),
				!isDir && entry.size != null ? h("span", { className: "dgp-rowMeta" }, fmtSize(entry.size)) : null,
				h("span", { className: "dgp-fileActs" },
					h("button", {
						type: "button", className: "dgp-logMenuBtn", title: t("file.actionsTitle"),
						onClick: (e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); openMenuAt(r.right, r.bottom + 4); }
					}, copied ? "✓" : "⋯")
				),
				menu ? ReactDOM.createPortal(
					h("div", { className: "dgp-logMenu", style: { top: menu.y, left: menu.x }, onClick: (e) => e.stopPropagation() },
						menuItems.map((it) => h("button", { key: it.label, type: "button", className: "dgp-logMenuItem", title: it.title, onClick: () => { setMenu(null); it.run(); } },
							h(it.icon, { size: 13 }), it.label))
					), document.querySelector(".dgp-root")) : null
			);
		});

		// ── media preview (images / PDFs): base64 readBlob → blob URL ──────────
		// Fetches the binary through the host's readBlob endpoint (workspace
		// path or outside-workspace abs, same trust model as write), converts
		// base64 → Blob → object URL and renders <img> / <iframe>. The object
		// URL is revoked on unmount / file switch so big payloads are freed.
		// `onUrl` reports the URL up to the preview header, whose「在浏览器打开」
		// button opens it in a NEW BROWSER TAB (window.open) — no dependence on
		// system file associations (a .png default app may be Photos, a .pdf
		// may be a desktop reader; the browser renders both natively).
		function MediaView({ cwd, p, onUrl }) {
			const t = useT();
			const [state, setState] = useState({ url: null, error: null });
			useEffect(() => {
				let alive = true;
				let url = null;
				setState({ url: null, error: null });
				onUrl?.(null);
				(async () => {
					try {
						const v = await gitRpc("readBlob", p.abs ? { repo: cwd, abs: p.abs } : { repo: cwd, path: p.path });
						// Decode through fetch(data:): the browser's native base64
						// decoder does the byte conversion off the JS main thread.
						// The old Uint8Array.from(atob(...), charCode) loop ran one
						// JS callback PER BYTE and froze the whole page for seconds
						// on 10-20MB PDFs/images.
						const res = await fetch(`data:${p.mime || "application/octet-stream"};base64,${v.base64}`);
						url = URL.createObjectURL(await res.blob());
						if (alive) { setState({ url, error: null }); onUrl?.(url); }
					} catch (err) {
						if (alive) setState({ url: null, error: String(err?.message ?? err) });
					}
				})();
				return () => { alive = false; if (url) { URL.revokeObjectURL(url); onUrl?.(null); } };
			}, [cwd, p.path, p.abs, p.mime, onUrl]);
			const sysOpen = () => {
				const target = p.abs ? p.abs : `${cwd.replace(/[\\/]+$/, "")}/${p.path}`;
				// DSH Remote wire format: endpoint = namespace/method, payload =
				// {args}. `session/openWorkspacePath` hands the path to the OS
				// default app (openNativePath) — same endpoint the chat UI uses.
				rpc("api", "session/openWorkspacePath", { args: { request: { path: target } } }).catch(() => {});
			};
			if (state.error) return h("div", { className: "dgp-paneEmpty" },
				h("div", null, t("pv.mediaFail", { msg: state.error })),
				h("div", { style: { marginTop: 8 } }, lbtn(t("pv.openEditor"), sysOpen, { tone: "default" }))
			);
			if (!state.url) return h("div", { className: "dgp-paneEmpty" }, t("pv.mediaLoading"));
			if (p.kind === "image") return h("div", { className: "dgp-mediaBody" }, h("img", { src: state.url, alt: p.name }));
			return h("iframe", { className: "dgp-pdfFrame", src: state.url, title: p.name });
		}

		function FileBrowser({ cwd, status, refreshTick, onEdited }) {
			// `dirs`: rel-path → entries; `leftPath`/`rightPath`: the two panes;
			// `preview`: {path,name,text,truncated,binary,size,kind} when previewing.
			const [dirs, setDirs] = useState({});
			const [leftPath, setLeftPath] = useState(null);   // null ⇒ single list
			const [rightPath, setRightPath] = useState("");   // current list (root = "")
			const [preview, setPreview] = useState(null);
			// Blob URL of the media file being previewed (image/pdf) — reported
			// by MediaView so the preview header's「在浏览器打开」button can
			// window.open it; null when no media preview is active.
			const [mediaUrl, setMediaUrl] = useState(null);
			const [sel, setSel] = useState(null);
			// ── upload / download / batch export ──────────────────────────────────
			// Multi-select (batch export): toggle on the search row; the checked
			// set is keyed by workspace-relative path and cleared on navigation
			// (a new directory is a new selection). Checkbox click selects; the
			// row itself keeps its navigate/preview behavior.
			const [multiMode, setMultiMode] = useState(false);
			const [selSet, setSelSet] = useState({});
			// Upload / export status row: { kind, text, pct } — pct null means
			// indeterminate (zip building / download streaming).
			const [busyRow, setBusyRow] = useState(null);
			// Pending upload-overwrite confirmation: the card shows { name },
			// the promise resolver waits in a ref so it resolves exactly once.
			const [overwriteAsk, setOverwriteAsk] = useState(null);
			const overwriteResolveRef = useRef(null);
			const fileInputRef = useRef(null);
			// cancel() closure for the active transfer (XHR abort / fetch abort).
			const abortRef = useRef(null);
			// Narrow-viewport (mobile) drill-down pane: 'list' ⇄ 'preview'.
			// Consulted only when narrow — wide mode keeps the master-detail
			// split and never reads this flag.
			const narrow = useNarrow();
			const [mobilePane, setMobilePane] = useState("list");
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
			// markdown render, no head-cut) vs "preview" (rendered: markdown, or
			// code through a READ-ONLY CodeMirror view — the same renderer edit
			// mode uses, so indentation and highlighting are identical). Reset
			// to source on every file open.
			const [pvMode, setPvMode] = useState("source");
			// Read-only CodeMirror preview state (code kind, preview mode): host
			// ref + view ref mirror the edit-mode editor lifecycle; pvCmBusy is
			// the CDN-loading indicator; pvCmErr carries a load failure so the
			// pane can fall back to the plain source view (offline-safe).
			const pvCmHostRef = useRef(null);
			const pvCmRef = useRef(null);
			const [pvCmBusy, setPvCmBusy] = useState(false);
			const [pvCmErr, setPvCmErr] = useState(null);
			// Retry tick: bumping it re-runs the read-only-CM mount effect (used
			// by the error banner's retry button; never auto-bumped, so a CDN
			// outage cannot spin an infinite remount loop).
			const [pvCmTick, setPvCmTick] = useState(0);
			// Chunked markdown output for preview mode: {html, pct} — html grows
			// chunk by chunk (content streams in top-down) and pct is the render
			// progress 0..100 shown as a thin bar on top of the preview body.
			// null = not started, {html:"", pct:0} = first chunk pending.
			const [mdRendered, setMdRendered] = useState(null);
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
			// Suspending the panel closes the search-history dropdown: it is
			// portaled under .dgp-root, so the dialog's slide-out transform never
			// moves it — it would keep floating over the main UI while suspended.
			const panelHidden = useSyncExternalStore(subscribeHidden, getHidden);
			useEffect(() => { if (panelHidden) setHistOpen(false); }, [panelHidden]);
			// Whole-workspace file index (git ls-files): LAZY — fetched only when
			// the search box is first focused or typed into, NOT on every panel
			// open. Opening the panel previously fired this full-workspace walk
			// alongside the status/list burst; if one request stalls (proxy,
			// browser's 6-connection HTTP/1.1 pool), every queued RPC ages
			// toward its timeout together. null while loading or when cwd is
			// not a git repo (falls back to filtering the current directory).
			const [allFiles, setAllFiles] = useState(null);
			const [searchArmed, setSearchArmed] = useState(false);
			useEffect(() => {
				if (!searchArmed) return;
				let alive = true;
				setAllFiles(null);
				gitRpc("search", { repo: cwd })
					.then((v) => { if (alive) setAllFiles(Array.isArray(v.files) ? v.files : null); })
					.catch(() => { if (alive) setAllFiles(null); });
				return () => { alive = false; };
			}, [searchArmed, cwd]);
			const armSearch = useCallback(() => setSearchArmed(true), []);
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
			// In-flight guard for loadDir: a directory whose request is still
			// pending must never be re-requested. Without it, the auto-load
			// effects below re-fire on every `dirs` identity change while the
			// value is "loading" — an unbounded list-request storm that first
			// saturates the host/connection pool ("Failed to fetch") and then
			// pegs the main thread with a render loop (whole tab freezes).
			const loadingDirsRef = useRef(new Set());
			// Directories whose refresh arrived WHILE a load was in flight —
			// the in-flight response predates the event that asked (upload →
			// loadDir during navigation), so the load re-runs on settle.
			const pendingDirsRef = useRef(new Set());
			// Current pane paths mirrored to refs so the cache eviction below can
			// protect the visible directories without depending on state identity.
			const leftPathRef = useRef(leftPath); leftPathRef.current = leftPath;
			const rightPathRef = useRef(rightPath); rightPathRef.current = rightPath;
			// dirs cache eviction: visited listings are kept so pane switches are
			// instant, but the cache must not grow forever across a long browsing
			// session — once it exceeds 60 paths, evict the least-recently-needed
			// entries (never the visible panes or the root) down to 40.
			const setDir = (rel, value) => setDirs((d) => {
				const next = { ...d, [rel]: value };
				const keys = Object.keys(next);
				if (keys.length > 60) {
					const keep = new Set([rel, "", rightPathRef.current, leftPathRef.current]);
					for (const k of keys) {
						if (keep.has(k)) continue;
						delete next[k];
						if (Object.keys(next).length <= 40) break;
					}
				}
				return next;
			});
			const loadDir = useCallback(async (rel) => {
				if (loadingDirsRef.current.has(rel)) {
					// Already in flight: remember it and re-run after settle —
					// dropping it would leave a stale listing (e.g. an upload
					// finishing right after navigation started a load).
					pendingDirsRef.current.add(rel);
					return;
				}
				loadingDirsRef.current.add(rel);
				setDir(rel, "loading");
				try {
					const v = await gitRpc("list", { repo: cwd, path: rel });
					setDir(rel, v.entries);
				} catch (err) {
					setBrowseError(err.message);
					setDir(rel, []);
				} finally {
					loadingDirsRef.current.delete(rel);
					if (pendingDirsRef.current.delete(rel)) void loadDir(rel);
				}
			}, [cwd]);

			useEffect(() => { setDirs({}); setLeftPath(null); setRightPath(""); setPreview(null); setSel(null); setSelSet({}); setBrowseError(null); pendingDirsRef.current.clear(); loadDir(""); }, [loadDir]);
			// Manual refresh: reload each visible pane exactly once (the Set
			// dedupes the case where leftPath === rightPath).
			useEffect(() => {
				if (refreshTick > 0) {
					const targets = new Set([""]);
					if (leftPath) targets.add(leftPath);
					targets.add(rightPath);
					for (const p of targets) loadDir(p);
				}
			}, [refreshTick, leftPath, rightPath, loadDir]);
			// Auto-load a pane whose directory was NEVER loaded (`undefined`).
			// "loading" must NOT re-trigger: the in-flight load owns that state,
			// and a re-request here queues into pendingDirsRef — which re-runs
			// the load on settle, which re-sets "loading", which re-triggers…
			// i.e. an infinite reload loop (v0.6.3 regression: the old guard
			// silently DROPPED these duplicate calls, so the "loading" branch
			// was harmless then and a perpetual-motion fuel source now).
			useEffect(() => { if (dirs[rightPath] === undefined) loadDir(rightPath); }, [rightPath, dirs, loadDir]);
			// Left pane auto-load: external open requests set leftPath to the
			// file's grandparent directory (never loaded on its own) — without
			// this, that pane would show "加载中…" forever.
			useEffect(() => { if (leftPath === null) return; if (dirs[leftPath] === undefined) loadDir(leftPath); }, [leftPath, dirs, loadDir]);

			const parentOf = (p) => { const i = p.lastIndexOf("/"); return i === -1 ? "" : p.slice(0, i); };
			const baseName = (p) => p === "" ? "" : p.split("/").pop();
			const rootName = (() => { const s = cwd.replace(/[\\/]+$/, "").split(/[\\/]/); return s[s.length - 1] || cwd; })();

			// Double-click a folder in pane `panePath` → cascade: the pane's list
			// moves to the left, the folder's contents become the right list.
			const openDir = useCallback((panePath, entryPath) => {
				setPreview(null);
				setSel(entryPath);
				setSelSet({});   // a new directory is a new selection
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
				// Whole body is wrapped: a throw in the pre-await sync code
				// (classifyOf / split / setState) or the media branch must NOT
				// become an unhandled rejection — the openReq effect calls this
				// fire-and-forget, and an escaped rejection crashes DSH web.
				try {
					setBrowseError(null);
					// Narrow drill-down: opening a preview switches to the
					// preview screen (the list screen comes back via 返回).
					if (narrowStore.get()) setMobilePane("preview");
					const kind = classifyOf(entryPath);
					const name = entryPath.split("/").pop();
					setLeftPath((lp) => (lp === null ? panePath : lp));   // promote single list to left pane
					if (kind === "image" || kind === "pdf") {
						// Media preview: no text read at all — the media view fetches
						// base64 via readBlob and owns a blob URL.
						setPvMode("preview");
						setPreview({ path: entryPath, name, text: "", truncated: false, binary: true, size: null, kind, mime: MIME_FROM_EXT[extOf(entryPath)] });
						return;
					}
					const v = await gitRpc("read", { repo: cwd, path: entryPath });
					const effKind = v.binary ? "binary" : kind;
					const lang = LANG_FROM_EXT[extOf(entryPath)] || "js";
					setPvMode(defaultModeOf(effKind));
					setPreview({ path: entryPath, name, text: v.text, truncated: v.truncated, binary: v.binary, size: v.size, kind: effKind, lang });
				} catch (err) { setBrowseError(err?.message ?? String(err)); }
			}, [cwd]);

			// Closing the preview: if it was opened from the single list, the list
			// was promoted to the left pane (leftPath === rightPath, both the same
			// directory) — collapse back to a single list instead of mirroring it.
			const closePreview = useCallback(() => {
				setPreview(null);
				setLeftPath((lp) => (lp !== null && lp === rightPath ? null : lp));
			}, [rightPath]);
			const openInEditor = useCallback(async (rel) => {
				try { await rpc("api", "session/openWorkspacePath", { args: { request: { path: `${cwd.replace(/[\\/]+$/, "")}/${rel}` } } }); }
				catch (err) { setBrowseError(err.message); }
			}, [cwd]);
			// System-open an ABSOLUTE path (used for files previewed from outside
			// the workspace, where the cwd-relative form is meaningless).
			const openInEditorAbs = useCallback(async (abs) => {
				try { await rpc("api", "session/openWorkspacePath", { args: { request: { path: abs } } }); }
				catch (err) { setBrowseError(err.message); }
			}, []);
			// Row quick actions: absolute-path helpers shared by copy/open.
			const absOf = useCallback((rel) => `${cwd.replace(/[\\/]+$/, "")}/${rel.replace(/^\/+/, "")}`, [cwd]);
			// Open the entry's folder in the system file explorer (for a file:
			// its parent directory; for a directory: itself).
			const onOpenFolder = useCallback(async (rel, isDir) => {
				try {
					const target = isDir ? absOf(rel) : absOf(parentOf(rel));
					await rpc("api", "session/openWorkspacePath", { args: { request: { path: target } } });
				} catch (err) { setBrowseError(err.message); }
			}, [absOf]);
			const onCopyPath = useCallback((rel, isDir) => copyText(absOf(rel)), [absOf]);
			const onCopyName = useCallback((name) => copyText(name), []);

			// ── upload / download / batch export flows ──────────────────────────
			// Resolve the pending overwrite card exactly once (also on unmount).
			const finishOverwrite = useCallback((v) => {
				setOverwriteAsk(null);
				const resolve = overwriteResolveRef.current;
				overwriteResolveRef.current = null;
				resolve?.(v);
			}, []);
			useEffect(() => () => { overwriteResolveRef.current?.(false); }, []);
			const askOverwrite = useCallback((name) => new Promise((resolve) => {
				overwriteResolveRef.current = resolve;
				setOverwriteAsk({ name });
			}), []);
			const cancelBusy = useCallback(() => {
				try { abortRef.current?.(); } catch { /* already gone */ }
				abortRef.current = null;
				setBusyRow(null);
			}, []);

			// Download one file (row menu / preview header). Cancelable via the
			// status row; aborts surface silently.
			const downloadStart = useCallback(async (params, name) => {
				const controller = new AbortController();
				const myCancel = () => controller.abort();
				abortRef.current = myCancel;
				setBusyRow({ kind: "download", text: t("file.downloading", { name }), pct: null });
				try {
					await downloadFile({ repo: cwd, ...params, name, signal: controller.signal });
				} catch (err) {
					if (err?.name !== "AbortError") setBrowseError(t("file.downloadFailRow", { msg: String(err?.message ?? err) }));
				} finally {
					if (abortRef.current === myCancel) abortRef.current = null;
					setBusyRow((b) => (b && b.kind === "download" ? null : b));
				}
			}, [cwd]);
			const onDownload = useCallback((rel, name) => downloadStart({ path: rel }, name), [downloadStart]);
			const onDownloadAbs = useCallback((abs, name) => downloadStart({ abs }, name), [downloadStart]);

			// Build + download a zip. Returns true on success (the batch-export
			// bar exits multi mode only then). The busy-row 取消 aborts the
			// download half (the sidecar build is bounded by caps and finishes
			// on its own — its result is simply discarded when cancelled).
			const exportStart = useCallback(async (paths, name) => {
				if (paths.length === 0) return false;
				const controller = new AbortController();
				const myCancel = () => controller.abort();
				abortRef.current = myCancel;
				setBusyRow({ kind: "export", text: t("file.exporting", { count: paths.length }), pct: null });
				try {
					await exportZipDownload({ repo: cwd, paths, name, signal: controller.signal });
					return true;
				} catch (err) {
					if (err?.name === "AbortError") return false;   // user cancel: silent
					setBrowseError(t("file.exportFailRow", { msg: String(err?.message ?? err) }));
					return false;
				} finally {
					if (abortRef.current === myCancel) abortRef.current = null;
					setBusyRow((b) => (b && b.kind === "export" ? null : b));
				}
			}, [cwd]);
			const onDownloadZip = useCallback((rel, name) => exportStart([rel], `${name}.zip`), [exportStart]);

			// Multi-select mode.
			const toggleMulti = useCallback(() => {
				setMultiMode((v) => !v);
				setSelSet({});   // entering or leaving both start from a clean set
			}, []);
			const exitMulti = useCallback(() => { setMultiMode(false); setSelSet({}); }, []);
			const toggleSel = useCallback((entry) => {
				setSelSet((set) => {
					const next = { ...set };
					if (next[entry.path]) delete next[entry.path];
					else next[entry.path] = entry;
					return next;
				});
			}, []);
			const selectAllCurrent = useCallback(() => {
				const entries = dirs[rightPath];
				if (!Array.isArray(entries)) return;
				const next = {};
				for (const e of entries) { if (e.name === ".git") continue; next[e.path] = e; }
				setSelSet(next);
			}, [dirs, rightPath]);
			const exportSelected = useCallback(async () => {
				const done = await exportStart(Object.keys(selSet), "");
				if (done) exitMulti();
			}, [selSet, exportStart, exitMulti]);

			// Upload: hidden file input → sequential uploads into the current
			// directory. Existing targets ask once (覆盖 / 取消); the batch
			// stops at the first real failure.
			const pickFiles = useCallback(() => fileInputRef.current?.click(), []);
			const onFilesPicked = useCallback((fileList) => {
				const files = Array.from(fileList ?? []);
				if (files.length === 0) return;
				void (async () => {
					let okCount = 0;
					let lastError = null;
					for (const file of files) {
						// Existence probe (the stat endpoint takes an absolute
						// path); a missing/unreadable target just means absent —
						// the upload itself surfaces real failures.
						let exists = false;
						try {
							const s = await gitRpc("stat", { repo: cwd, path: absOf(rightPath ? `${rightPath}/${file.name}` : file.name) });
							exists = s?.type === "file";
						} catch { exists = false; }
						if (exists) {
							// eslint-disable-next-line no-await-in-loop
							const overwrite = await askOverwrite(file.name);
							if (!overwrite) continue;
						}
						try {
							setBusyRow({ kind: "upload", text: t("file.uploading", { name: file.name, pct: 0 }), pct: 0 });
							// eslint-disable-next-line no-await-in-loop
							await uploadFile({
								repo: cwd,
								dirRel: rightPath,
								file,
								overwrite: exists,
								onProgress: (pct) => setBusyRow((b) => (b && b.kind === "upload" ? { ...b, pct, text: t("file.uploading", { name: file.name, pct }) } : b)),
								signalRef: abortRef
							});
							okCount++;
						} catch (err) {
							if (/aborted/i.test(String(err?.message ?? err))) break;
							lastError = err;
							break;
						}
					}
					abortRef.current = null;
					setBusyRow((b) => (b && b.kind === "upload" ? null : b));
					if (lastError) setBrowseError(t("file.uploadFailRow", { msg: String(lastError?.message ?? lastError) }));
					if (okCount > 0) {
						loadDir(rightPath);
						if (typeof onEdited === "function") onEdited();
					}
				})();
			}, [cwd, rightPath, absOf, askOverwrite, loadDir, onEdited]);

			// Consume an external open request: navigate to the file's directory
			// and open a preview. Defined here (after loadDir/openPreview) so the
			// dependency array never touches a const before initialization.
			useEffect(() => {
				// Whole body is wrapped: a throw in the path math / setState
				// here would otherwise become an unhandled error escaping the
				// panel boundary (the openReq effect runs as a passive effect;
				// fire-and-forget async inside it must never reject uncaught).
				try {
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
						setSelSet({});   // external open = navigation: selection resets
						if (dir === "") { setLeftPath(null); setRightPath(""); }
						else { setLeftPath(parentOf(dir)); setRightPath(dir); }
						loadDir(dir);
						// Fire-and-forget: attach .catch so a rejected preview
						// (locked/being-written file, etc.) never surfaces as
						// an unhandled rejection that crashes DSH web.
						openPreview(dir, rel).catch((e) => setBrowseError(e?.message ?? String(e)));
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
						// Narrow drill-down: the external preview opens on the
						// preview screen too (a failed read leaves preview null
						// and the render falls back to the list + error bar).
						if (narrowStore.get()) setMobilePane("preview");
						(async () => {
							try {
								const fname = absSlash.split("/").pop() || abs;
								const ext = extOf(fname);
								const kind = classifyOf(fname);
								if (kind === "image" || kind === "pdf") {
									setPvMode("preview");
									setPreview({ path: fname, abs, name: fname, text: "", truncated: false, binary: true, size: null, kind, mime: MIME_FROM_EXT[ext] });
									return;
								}
								const v = await gitRpc("readPath", { repo: cwd, path: abs });
								const effKind = v.binary ? "binary" : kind;
								const lang = LANG_FROM_EXT[ext] || "js";
								setPvMode(defaultModeOf(effKind));
								setPreview({ path: fname, abs, name: fname, text: v.text, truncated: v.truncated, binary: v.binary, size: v.size, kind: effKind, lang });
							} catch (err) {
								setExtOpen({ abs });
								if (err) setBrowseError(err?.message ?? String(err));
							}
						})();
					}
				} catch (err) { setBrowseError(err?.message ?? String(err)); }
			}, [openReq, cwd, loadDir, openPreview]);

			// Breadcrumb: root ▸ a ▸ b ▸ (file). Clicking a segment jumps there.
			// For a file previewed from OUTSIDE the workspace (abs set) the crumb
			// chain shows the file's own absolute path segments instead of the
			// workspace-relative rightPath — those segments are display-only
			// (the external directory is not navigable inside this panel).
			const navTo = useCallback((target) => {
				setPreview(null);
				setSelSet({});   // a new directory is a new selection
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
				const row = (entry) => h(FileRow, { key: entry.path, entry, path, selected: sel === entry.path, status, tapOpens: narrow, checkable: multiMode, checked: !!selSet[entry.path], onSelect: () => setSel(entry.path), onToggle: toggleSel, onOpenDir: openDir, onOpenPreview: openPreview, onOpenFolder, onCopyPath, onCopyName, onDownload, onDownloadZip });
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
			// Editor lifecycle: while editing, mount Monaco into the host
			// element; destroy it on exit/unmount. Recreated per file open.
			useEffect(() => {
				if (!pvEdit || !preview || !editorHostRef.current) return;
				let alive = true;
				setEditBusy(true);
				setEditErr(null);
				mountMonacoEditor(editorHostRef.current, {
					value: preview.text || "",
					path: preview.name
				}).then((ed) => {
					if (!alive) { ed.dispose(); return; }
					editorRef.current = ed;
					setEditBusy(false);
				}).catch((err) => {
					if (!alive) return;
					setEditErr(t("pv.editFail", { msg: err?.message ?? err }));
					setEditBusy(false);
				});
				return () => {
					alive = false;
					if (editorRef.current) { editorRef.current.dispose(); editorRef.current = null; }
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
				const content = view.getValue();
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
			// Read-only Monaco preview for code files: the SAME renderer edit
			// mode uses (sidecar-hosted Monaco), so indentation, wrapping and
			// token highlighting are identical to the editor. Mutually exclusive
			// with edit mode (pvEdit); destroyed on preview change, mode switch
			// or unmount.
			useEffect(() => {
				if (!preview || preview.kind !== "code" || pvMode !== "preview" || pvEdit || !pvCmHostRef.current) { setPvCmBusy(false); return; }
				let alive = true;
				// The busy hint is DELAYED (150ms): once Monaco is in the page
				// cache the mount finishes within a few microtasks, and an
				// unconditional hint would flash "loading" on EVERY file open.
				// Only genuinely slow mounts (cold cache / huge document) ever
				// show it. The warmup effect below keeps the cache hot.
				const hintTimer = window.setTimeout(() => { if (alive) setPvCmBusy(true); }, 150);
				setPvCmErr(null);
				mountMonacoEditor(pvCmHostRef.current, {
					value: preview.text || "",
					path: preview.name,
					readOnly: true
				}).then((ed) => {
					window.clearTimeout(hintTimer);
					if (!alive) { ed.dispose(); return; }
					pvCmRef.current = ed;
					setPvCmBusy(false);
				}).catch((err) => {
					window.clearTimeout(hintTimer);
					// Sidecar unreachable → fall back to the plain source view
					// (one click away in source mode); never leave a dead pane.
					if (!alive) return;
					setPvCmBusy(false);
					setPvCmErr(err?.message ?? String(err));
				});
				return () => {
					alive = false;
					window.clearTimeout(hintTimer);
					if (pvCmRef.current) { pvCmRef.current.dispose(); pvCmRef.current = null; }
				};
			}, [preview, pvMode, pvEdit, pvCmTick]);
			// Warm the Monaco loader/core while the user merely browses: the
			// sidecar-hosted editor core is fetched once on idle, so the first
			// code preview usually mounts with zero wait. Local loopback —
			// failure is invisible and retried on first real use.
			useEffect(() => {
				if (!allFiles) return;
				const ric = typeof window.requestIdleCallback === "function";
				const run = () => { ensureMonaco().catch(() => {}); };
				const handle = ric ? window.requestIdleCallback(run) : window.setTimeout(run, 1200);
				return () => { if (ric) window.cancelIdleCallback(handle); else window.clearTimeout(handle); };
			}, [allFiles]);
			// Markdown preview uses the SAME chunked async pipeline: a large
			// document would otherwise render synchronously inside useMemo and
			// freeze the whole panel (double-click → minutes of nothing). The
			// source is split at SAFE top-level boundaries only — never inside
			// a fenced code block (inFence tracking), and only at a blank line
			// once the chunk has enough lines — so every chunk renders exactly
			// the same blocks the whole-document pass would produce. Each
			// finished chunk is appended to the HTML: content streams in
			// top-down and a thin progress bar shows pct.
			useEffect(() => {
				if (!preview || preview.kind !== "md" || pvMode !== "preview") { setMdRendered(null); return; }
				let alive = true;
				setMdRendered({ html: "", pct: 0 });
				const lines = (preview.text || "").replace(/\r\n/g, "\n").split("\n");
				if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === "")) { setMdRendered({ html: "", pct: 100 }); return; }
				const CHUNK_LINES = 300;
				const chunks = [];
				let cur = [];
				let inFence = false;
				for (const line of lines) {
					if (/^\s*```/.test(line)) inFence = !inFence;
					cur.push(line);
					if (!inFence && line.trim() === "" && cur.length >= CHUNK_LINES) { chunks.push(cur.join("\n")); cur = []; }
				}
				if (cur.length) chunks.push(cur.join("\n"));
				let out = "";
				let k = 0;
				const step = () => {
					if (!alive) return;
					out += renderMarkdown(chunks[k]);
					k++;
					setMdRendered({ html: out, pct: Math.round((k / chunks.length) * 100) });
					if (k < chunks.length) setTimeout(step, 0);
				};
				step();
				return () => { alive = false; };
			}, [preview, pvMode]);
			const previewBody = useMemo(() => {
				if (!preview) return null;
				const p = preview;
				// Media kinds always render (no mode switch, no text pipeline).
				if (p.kind === "image" || p.kind === "pdf") return { kind: p.kind };
				if (p.kind === "html") {
					// Preview mode renders the HTML in a sandboxed iframe (no
					// scripts, no same-origin); source mode falls through to the
					// plain-text branch below.
					if (pvMode === "preview") return { kind: "html", text: p.text || "" };
					return { kind: "text", text: (p.text || "") + (p.truncated ? t("file.truncatedNote") : "") };
				}
				if (p.kind === "binary") return { kind: "binary" };
				if (pvMode === "source") {
					const note = p.truncated ? t("file.truncatedNote") : "";
					return { kind: "text", text: (p.text || "") + note };
				}
				if (p.kind === "md") return { kind: "md", html: mdRendered?.html ?? "", pct: mdRendered?.pct ?? 0 };
				if (p.kind === "code") return { kind: "code" };
				return { kind: "text", text: p.text || "" };
			}, [preview, pvMode, mdRendered]);

			const previewView = () => {
				const p = preview;
				let body;
				if (!previewBody) return null;
				if (pvEdit) {
					// Inline Monaco editing replaces the rendered body.
					body = h(React.Fragment, null,
						editErr ? h("div", { className: "dgp-error" },
							h("span", { style: { flex: 1 } }, editErr),
							lbtn(t("common.retry"), () => { setEditErr(null); setPvEdit(false); setTimeout(() => setPvEdit(true), 0); }, { tone: "default" }),
							lbtn(t("common.close"), () => setEditErr(null), { tone: "default" })) : null,
						h("div", { className: "dgp-editorHost", ref: editorHostRef }, editBusy ? h("div", { className: "dgp-paneEmpty" }, t("pv.loadingEditor")) : null)
					);
				} else if (previewBody.kind === "binary") {
					body = h("div", { className: "dgp-paneEmpty" }, t("file.binary"));
				} else if (previewBody.kind === "image" || previewBody.kind === "pdf") {
					// Media (image / PDF): MediaView fetches base64 → blob URL.
					body = h(MediaView, { cwd, p, onUrl: setMediaUrl });
				} else if (previewBody.kind === "html") {
					// Sandboxed static render: sandbox="" disables scripts, forms
					// and same-origin — a compromised HTML file cannot touch the
					// panel or the DSH app around it.
					body = h("iframe", { className: "dgp-htmlFrame", srcDoc: previewBody.text, sandbox: "", title: p.name });
				} else if (previewBody.kind === "md") {
					// Chunked rendering: nothing done yet → centered hint with
					// percent; partial/done → content (streams top-down) with a
					// thin progress bar pinned above it until 100%.
					body = previewBody.html === "" && previewBody.pct < 100
						? h("div", { className: "dgp-paneEmpty" }, h(IconLoading, { size: 16 }), h("span", { style: { marginLeft: 8 } }, t("pv.renderMd", { pct: previewBody.pct })))
						: h(React.Fragment, null,
							previewBody.pct < 100 ? h("div", { className: "dgp-mdProg", role: "progressbar", "aria-valuenow": previewBody.pct, "aria-valuemin": 0, "aria-valuemax": 100 },
								h("div", { className: "dgp-mdProgBar", style: { width: `${previewBody.pct}%` } })) : null,
							h("div", { className: "dgp-md" }, h("div", { dangerouslySetInnerHTML: { __html: previewBody.html } }))
						);
				} else if (previewBody.kind === "code") {
					// Preview mode: read-only Monaco — the SAME renderer as
					// edit mode, so indentation/highlighting are identical. On
					// sidecar failure (offline) the pane falls back to the plain
					// source view; dismissing the banner retries the mount.
					body = pvCmErr
						? h(React.Fragment, null,
							h("div", { className: "dgp-error" },
								h("span", { style: { flex: 1 } }, t("pv.editFail", { msg: pvCmErr })),
								lbtn(t("common.retry"), () => { setPvCmErr(null); setPvCmTick((n) => n + 1); }, { tone: "default" }),
								lbtn(t("common.close"), () => setPvCmErr(null), { tone: "default" })),
							h("pre", { className: "dgp-pre" }, p.text || ""))
						: h("div", { className: "dgp-editorHost", ref: pvCmHostRef }, pvCmBusy ? h("div", { className: "dgp-paneEmpty" }, t("pv.loadingPreview")) : null);
				} else {
					body = h("pre", { className: "dgp-pre" }, previewBody.text);
				}
				const editable = !p.binary && !p.truncated;
				const isFrame = previewBody.kind === "pdf" || previewBody.kind === "html";
				// Read-only CM previews reuse the editor container layout
				// (paddingless column flex; the editor fills the pane).
				const isCmCode = previewBody.kind === "code" && pvMode === "preview" && !pvCmErr;
				return h(React.Fragment, null,
					h("div", { className: "dgp-previewHead" },
						// Narrow drill-down: 返回 goes back to the list screen (the
						// preview itself stays loaded for a quick re-entry).
						narrow ? lbtn(t("common.back"), () => setMobilePane("list"), { tone: "default", title: t("common.back") }) : null,
						h("span", { className: "dgp-fileIcon" }, h(iconForFile(p.name), { size: 15 })),
						h("span", { className: "dgp-previewName", title: p.abs || p.path }, p.name),
						p.size != null ? h("span", { className: "dgp-rowMeta" }, fmtSize(p.size)) : null,
						!pvEdit && SWITCHABLE_KINDS.has(p.kind) ? h(React.Fragment, null,
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
								lbtn(t("file.download"), () => (p.abs ? onDownloadAbs(p.abs, p.name) : onDownload(p.path, p.name)), { title: t("file.downloadTitle") }),
								(p.kind === "html" || ((p.kind === "image" || p.kind === "pdf") && mediaUrl)) ? lbtn(t("pv.openBrowser"), () => {
								if (p.kind === "html") { p.abs ? openInEditorAbs(p.abs) : openInEditor(p.path); return; }
								window.open(mediaUrl, "_blank");   // blob URL → real browser tab
							}, { title: t("pv.openBrowserTitle") }) : null,
								editable ? lbtn(t("pv.edit"), () => setPvEdit(true), { title: p.truncated ? t("pv.editTruncated") : t("pv.editHint") }) : null,
								// Narrow: "open in system editor" needs a desktop app and
								// close is redundant with 返回 — both stay desktop-only.
								narrow ? null : h(React.Fragment, null,
									lbtn(t("pv.openEditor"), () => (p.abs ? openInEditorAbs(p.abs) : openInEditor(p.path))),
									lbtn(t("pv.closePreview"), closePreview, { tone: "default" })))
					),
					h("div", { className: "dgp-previewBody" + ((pvEdit || isCmCode) ? " dgp-editBody" : "") + (isFrame ? " dgp-frameBody" : "") }, body)
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
				const up = () => { setDragging(false); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); };
				window.addEventListener("pointermove", move);
				window.addEventListener("pointerup", up);
				// pointercancel: the browser took the pointer (scroll gesture,
				// element removed mid-drag) — without this the listeners would
				// stay attached until the next drag overwrites them.
				window.addEventListener("pointercancel", up);
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
					return h("div", { key: p, className: "dgp-row", "data-clickable": "true", "data-selected": sel === p ? "true" : "false", title: narrow ? p : `${p}\n${t("common.doubleClick")}`, onClick: () => { setSel(p); if (narrow) openPreview("", p); }, onDoubleClick: () => openPreview("", p) },
						h("span", { className: "dgp-fileIcon" }, h(iconForFile(p), { size: 14 })),
						h("span", { className: "dgp-treeName", style: { fontFamily: "var(--dsw-font-mono,ui-monospace,monospace)", fontSize: 12 } }, p),
						badge ? h("span", { className: "dgp-badge", "data-tone": badge.tone }, t(badge.label)) : null
					);
				})
			);

			// Narrow drill-down: the preview screen (full-width preview + back)
			// replaces the split; the list screen keeps crumbs + search. Wide
			// mode renders the master-detail split exactly as before.
			const narrowPreviewScreen = narrow && preview !== null && mobilePane === "preview";
			return h(React.Fragment, null,
				// The crumb chain is the panel's path display (the header no
				// longer shows a cwd line), so it stays visible in every state —
				// single list, split, preview, and external-file preview alike.
				// Only whole-workspace search replaces it with the result count,
				// and the narrow preview screen drops it (its head shows the file).
				(!globalSearch && !narrowPreviewScreen) ? crumbs : null,
				!narrowPreviewScreen ? h("div", { className: "dgp-searchRow" },
					h("span", { className: "dgp-searchIcon" }, h(IconSearch, { size: 12 })),
					h("input", { className: "dgp-search", placeholder: allFiles ? t("file.searchAll") : t("file.searchDir"), value: query, onChange: (e) => { setQuery(e.target.value); armSearch(); }, onFocus: () => { armSearch(); openHist(true); }, onBlur: () => { if (query.trim()) rememberQuery(query); setTimeout(() => setHistOpen(false), 120); }, onKeyDown: (e) => { if (e.key === "Enter") rememberQuery(query); }, spellCheck: false }),
					lbtn(t("common.history"), () => openHist(!histOpen), { active: histOpen, tone: "default" }),
					query ? lbtn(t("common.clear"), () => setQuery(""), { tone: "default" }) : null,
					lbtn(t("file.upload"), pickFiles, { title: t("file.uploadTitle") }),
					lbtn(t("file.multi"), toggleMulti, { active: multiMode, tone: "default", title: t("file.multiTitle") }),
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
				) : null,
				busyRow ? h("div", { className: "dgp-noteRow" },
					h("span", { style: { flex: 1, minWidth: 0 } }, busyRow.text),
					busyRow.pct != null ? h("div", { className: "dgp-mdProg", style: { width: 140, margin: 0, flex: "none" } }, h("div", { className: "dgp-mdProgBar", style: { width: `${busyRow.pct}%`, transition: "none" } })) : null,
					lbtn(t("common.cancel"), cancelBusy, { tone: "default" })
				) : null,
				multiMode ? h("div", { className: "dgp-multiBar" },
					h("span", { className: "dgp-hint" }, t("file.selectedCount", { count: Object.keys(selSet).length })),
					lbtn(t("file.exportSel"), exportSelected, { disabled: Object.keys(selSet).length === 0 || busyRow !== null }),
					lbtn(t("git.selectAll"), selectAllCurrent, { tone: "default", disabled: busyRow !== null }),
					lbtn(t("common.cancel"), exitMulti, { tone: "default" })
				) : null,
				browseError ? h("div", { className: "dgp-error" }, h("span", { style: { flex: 1 } }, browseError), lbtn(t("common.close"), () => setBrowseError(null), { tone: "default" })) : null,
				extOpen ? h("div", { className: "dgp-error" },
					h("span", { style: { flex: 1 } }, `${t("file.cantPreview", { path: extOpen.abs })}`),
					lbtn(t("file.openSystem"), () => { rpc("api", "session/openWorkspacePath", { args: { request: { path: extOpen.abs } } }).catch((err) => setBrowseError(err.message)); setExtOpen(null); }),
					lbtn(t("common.close"), () => setExtOpen(null), { tone: "default" })
				) : null,
				narrow
					// ── narrow: one screen at a time, no gutter ──────────────────
					? h("div", { className: "dgp-split", "data-dragging": "false", style: { gridTemplateColumns: "1fr" } },
						narrowPreviewScreen
							? h("div", { className: "dgp-pane" }, previewView())
							: h("div", { className: "dgp-pane" }, globalSearch ? globalList() : renderList(rightPath)))
					: globalSearch
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
					),
				// Hidden multi-file picker behind the 上传 button; value reset so
				// picking the SAME file again still fires onChange.
				h("input", { ref: fileInputRef, type: "file", multiple: true, style: { display: "none" }, onChange: (e) => { const fileList = e.target.files; e.target.value = ""; onFilesPicked(fileList); } }),
				overwriteAsk ? h("div", { className: "dgp-confirm", onClick: () => finishOverwrite(false) },
					h("div", { className: "dgp-confirmCard", onClick: (e) => e.stopPropagation() },
						h("div", { className: "dgp-confirmTitle" }, t("file.overwriteTitle")),
						h("div", { className: "dgp-confirmMsg" }, t("file.overwriteMsg", { name: overwriteAsk.name })),
						h("div", { className: "dgp-confirmActions" },
							lbtn(t("common.cancel"), () => finishOverwrite(false), { tone: "default" }),
							lbtn(t("file.overwrite"), () => finishOverwrite(true))
						)
					)
				) : null
			);
		}

		// Settings page (a real tab — clicking the tab switches the body, no popover).
		// Visual spec mirrors the DSH settings panel: groups separated by hairline
		// rules (.5px border-l2), 14px group titles, and rounded "cube" option
		// buttons with the platform-module selected treatment — NOT cards.
		const SettingsView = React.memo(function SettingsView({ onSetMax }) {
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
			const [themePref, setThemePref] = useState(getMonacoThemePref);
			const pickTheme = useCallback((id) => {
				setMonacoTheme(id);
				setThemePref(id);
			}, []);
			const THEME_CHOICES = ["auto", "hc-black", "hc-light", "vs-dark", "vs"];
			const optRow = (value, choices, onPick, labels) => h("div", { className: "dgp-setCubes", role: "radiogroup" },
				choices.map((id) => h("button", {
					key: id, type: "button", className: "dgp-setCube", role: "radio",
					"aria-checked": value === id, "data-active": value === id ? "true" : "false",
					onClick: () => onPick(id)
				}, labels[id] ?? id)));
			const group = (title, hint, control) => h("div", { className: "dgp-setGroup" },
				h("div", { className: "dgp-setGroupHead" },
					h("div", { className: "dgp-setGroupTitle" }, title),
					hint ? h("div", { className: "dgp-setGroupHint" }, hint) : null),
				control);
			return h("div", { className: "dgp-settingsPage" },
				h("div", { className: "dgp-settingsTitle" }, t("set.title")),
				group(t("set.editorGroup"), t("set.themeHint"),
					optRow(themePref, THEME_CHOICES, pickTheme, {
						auto: t("set.themeAuto"), "hc-black": "HC Black", "hc-light": "HC Light", "vs-dark": "Dark", "vs": "Light"
					})),
				group(t("set.defaultOpen"), t("set.applyHint"),
					optRow(defaultMax, [true, false], pick, { true: t("set.maximized"), false: t("set.normal") })),
				group(t("set.click"), t("set.previewHint"),
					optRow(previewOpen, [true, false], setPreviewOpenFlag, { true: t("set.panelPreview"), false: t("set.systemOpen") }))
			);
		});
