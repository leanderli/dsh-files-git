		// ── file browser tab ─────────────────────────────────────────────────────
		function gitBadgesOf(status) {
			const badges = new Map();
			if (!status) return badges;
			for (const entry of status.conflicts || []) badges.set(entry.path, "conflict");
			for (const entry of status.untracked || []) if (!badges.has(entry.path)) badges.set(entry.path, "untracked");
			const staged = new Set((status.staged || []).map((entry) => entry.path));
			const unstaged = new Set((status.unstaged || []).map((entry) => entry.path));
			for (const path of staged) {
				if (!badges.has(path)) badges.set(path, unstaged.has(path) ? "stagedMod" : "staged");
			}
			for (const path of unstaged) if (!badges.has(path)) badges.set(path, "modified");
			return badges;
		}
		const GIT_BADGES = {
			conflict: { label: "file.badgeConflict", tone: "error" },
			untracked: { label: "file.badgeUntracked" },
			stagedMod: { label: "file.badgeStagedMod", tone: "warn" },
			staged: { label: "file.badgeStaged", tone: "success" },
			modified: { label: "file.badgeModified", tone: "warn" }
		};

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
		// Declared BEFORE classifyOf so the dependency reads top-down (the
		// bundle concatenates fragments — a use above its const works only
		// because calls happen at runtime, which is needlessly fragile).
		const MD_EXTS = new Set(["md", "markdown"]);
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
		// ── HTML preview prelude ─────────────────────────────────────────────────
		// The preview iframe runs WITH scripts but WITHOUT same-origin (see the
		// sandbox at the html branch): a srcdoc/blob document must never inherit
		// this page's origin, or a workspace HTML file could read the DSH
		// session. In that opaque origin the real localStorage / sessionStorage
		// THROW SecurityError, which kills any page touching them at startup —
		// theme persistence being the common case. Install in-memory stand-ins
		// BEFORE the page's own scripts: the page works and still cannot reach
		// anything outside its sandbox. (Verified in a sandboxed iframe:
		// defineProperty succeeds and the stub round-trips values.)
		const HTML_STORAGE_SHIM = "<script>(function(){function mk(){var m={},ks;return{getItem:function(k){return Object.prototype.hasOwnProperty.call(m,k)?m[k]:null},setItem:function(k,v){m[k]=String(v)},removeItem:function(k){delete m[k]},clear:function(){m={}},key:function(i){ks=Object.keys(m);return i<ks.length?ks[i]:null},get length(){return Object.keys(m).length}}};var names=['localStorage','sessionStorage'];for(var i=0;i<names.length;i++){var n=names[i];try{window[n].getItem('__dsh_probe');}catch(e){try{Object.defineProperty(window,n,{value:mk(),configurable:true});}catch(e2){}}}})()</scr" + "ipt>";
		function withHtmlPrelude(html) {
			// The shim must precede the document's first script; <head> is the
			// earliest safe spot — the lookahead keeps <header> from matching (a
			// <header>-only document would otherwise inject mid-body). Without a
			// <head> (or doctype) we prepend — never BEFORE a doctype, which
			// would drop the document into quirks mode.
			const head = /<head(?=[\s>])/i;
			if (head.test(html)) return html.replace(head, (m) => m + HTML_STORAGE_SHIM);
			const dt = /<!doctype[^>]*>/i.exec(html);
			if (dt) { const end = dt.index + dt[0].length; return html.slice(0, end) + HTML_STORAGE_SHIM + html.slice(end); }
			return HTML_STORAGE_SHIM + html;
		}
		// ── file-type icons (vscode-icons artwork, inlined at build time) ────────
		// Solid brand tiles, the same visual language DSH's own file tree uses
		// (its built-in set is devicon artwork composed onto rounded tiles). The
		// artwork table lives in fileicons.js, generated by
		// scripts/gen-file-icons.mjs; here we only own the NAME → type-key rules.
		// Unknown extensions fall through to the generic file art (never a
		// bare stroke glyph), so every row is recognizable at a glance.
		const FILE_ICON_EXTS = {
			ts: "ts", tsx: "ts", mts: "ts", cts: "ts",
			js: "js", jsx: "js", mjs: "js", cjs: "js",
			py: "py", pyi: "py", rs: "rs", go: "go", java: "java",
			c: "c", h: "c", cc: "cpp", cpp: "cpp", cxx: "cpp", hpp: "cpp", hh: "cpp",
			cs: "cs", kt: "kt", kts: "kt", swift: "swift", rb: "rb", php: "php",
			lua: "lua", dart: "dart", r: "r", scala: "scala", sh: "sh", bash: "sh",
			zsh: "sh", fish: "sh", bat: "sh", cmd: "sh", ps1: "sh",
			vue: "vue", svelte: "svelte", graphql: "graphql", gql: "graphql",
			cmake: "cmake", sql: "sql",
			md: "md", markdown: "md", mdx: "md", txt: "txt", log: "txt",
			json: "json", jsonc: "json", json5: "json",
			yml: "yml", yaml: "yml", toml: "toml", ini: "ini", cfg: "ini", conf: "ini", properties: "ini",
			xml: "xml", plist: "xml",
			xls: "xls", xlsx: "xls", csv: "csv", tsv: "csv",
			pdf: "pdf", zip: "zip", gz: "zip", tar: "zip", rar: "zip", "7z": "zip",
			png: "img", jpg: "img", jpeg: "img", gif: "img", svg: "img", webp: "img",
			ico: "img", bmp: "img", avif: "img", tiff: "img",
			mp3: "aud", wav: "aud", flac: "aud", m4a: "aud", ogg: "aud",
			mp4: "vid", mov: "vid", webm: "vid", mkv: "vid", avi: "vid",
			woff: "font", woff2: "font", ttf: "font", otf: "font", eot: "font",
			html: "html", htm: "html",
			css: "css", scss: "css", sass: "css", less: "css", styl: "css",
			env: "env", lock: "lock"
		};
		const FILE_ICON_NAMES = {
			".gitignore": "git", ".gitattributes": "git", ".gitmodules": "git",
			".gitkeep": "git", ".gitconfig": "git", ".mailmap": "git",
			"license": "lic", "licence": "lic", "copying": "lic", "notice": "lic",
			"package-lock.json": "lock", "npm-shrinkwrap.json": "lock",
			"yarn.lock": "lock", "pnpm-lock.yaml": "lock", "bun.lockb": "lock",
			"package.json": "json", "tsconfig.json": "json", "composer.json": "json",
			"dockerfile": "docker", "docker-compose.yml": "docker", "docker-compose.yaml": "docker",
			".env": "env", ".env.local": "env", ".env.development": "env", ".env.production": "env",
			"makefile": "cmake", "gnumakefile": "cmake",
			"readme": "md", "readme.md": "md", "changelog": "md", "changelog.md": "md"
		};
		function fileIconTypeOf(name) {
			const lower = String(name ?? "").toLowerCase();
			if (FILE_ICON_NAMES[lower]) return FILE_ICON_NAMES[lower];
			const ext = extOf(lower);
			return FILE_ICON_EXTS[ext] || null;
		}
		// Always returns a renderable component: a known type uses its brand tile,
		// anything else the generic file art — so the caller never branches.
		function iconForFile(name) {
			return fileIconFor(fileIconTypeOf(name) ?? "fallback");
		}

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
			// NOTE: `s` is escaped ONCE at the top, so the captured `u`/`alt`
			// are already entity-encoded (no raw quotes/angles survive) and
			// attribute-safe as-is. Escaping them AGAIN turned `?a=1&b=2` into
			// `?a=1&amp;b=2`, breaking every link with query parameters.
			r = r.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m2, alt, u) => /^(https?:)/.test(u) ? `<img src="${u}" alt="${alt}" />` : alt || "(image)");
			r = r.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m2, t, u) => /^(https?:|mailto:|#)/.test(u) ? `<a href="${u}" target="_blank" rel="noreferrer">${t}</a>` : t);
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
					// Avoid generating tens of thousands of token spans for a huge
					// fenced sample; preserve all source characters without highlighting.
					html += `<pre class="dgp-mdPre"><code>` + (lang && !expensivePreviewText(body) ? highlightCode(body, lang) : escHtml(body)) + `</code></pre>\n`;
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
		// Only ONE row context menu may be open at a time. A row menu closes on a
		// document `click` — but a RIGHT-click does not emit one, so without this
		// registry the previous row's menu stayed open next to the new one (two
		// overlapping menus). Rows register their closer here; opening a menu
		// first closes whichever row held it.
		let closeActiveRowMenu = null;
		// Suspending the panel must drop any open row menu too: it is portaled
		// under .dgp-root, so the dialog's slide-out transform never moves it and
		// the hidden root swallows the pointer events that would close it.
		hiddenStore.subscribe(() => { if (hiddenStore.get() && closeActiveRowMenu) closeActiveRowMenu(); });
		const FileRow = React.memo(function FileRow({ entry, path, selected, opened, badgeKind, tapOpens, checkable, checked, onSelect, onToggle, onOpenDir, onOpenPreview, onOpenFolder, onCopyPath, onCopyName, onDownload, onDownloadZip, onDelete }) {
			const isDir = entry.type === "dir";
			const badge = isDir ? null : GIT_BADGES[badgeKind];
			const Icon = isDir ? (opened ? IconFolderOpen : IconFolderClose) : iconForFile(entry.name);
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
			const closeMenu = useCallback(() => {
				if (closeActiveRowMenu === closeMenu) closeActiveRowMenu = null;
				setMenu(null);
			}, []);
			// A row unmounting (list re-render, navigation, filter change) must
			// not leave a stale closer behind.
			useEffect(() => () => { if (closeActiveRowMenu === closeMenu) closeActiveRowMenu = null; }, [closeMenu]);
			useEffect(() => {
				if (!menu) return undefined;
				document.addEventListener("click", closeMenu);
				return () => document.removeEventListener("click", closeMenu);
			}, [menu, closeMenu]);
			const openMenuAt = useCallback((x, y) => {
				if (closeActiveRowMenu && closeActiveRowMenu !== closeMenu) closeActiveRowMenu();
				closeActiveRowMenu = closeMenu;
				setMenu(menuAt(x, y));
			}, [closeMenu]);
			const menuItems = [
				{ icon: IconFolderOpen, label: t("file.openDirRow"), title: t("file.openDirRowTitle"), run: () => onOpenFolder(entry.path, isDir) },
				{ icon: IconData, label: copied === "path" ? t("file.copied") : t("file.copyPath"), title: t("file.copyPathTitle"), run: () => onCopyPath(entry.path, isDir).then((ok) => ok && flash("path")) },
				{ icon: IconListPen, label: copied === "name" ? t("file.copied") : t("file.copyName"), title: t("file.copyNameTitle"), run: () => onCopyName(entry.name).then((ok) => ok && flash("name")) },
				...(isDir
					? (onDownloadZip ? [{ icon: IconFolderOpen, label: t("file.downloadZip"), title: t("file.downloadZipTitle"), run: () => onDownloadZip(entry.path, entry.name) }] : [])
					: (onDownload ? [{ icon: IconPaperclip, label: t("file.download"), title: t("file.downloadTitle"), run: () => onDownload(entry.path, entry.name) }] : [])),
				// Destructive action last, separated by the theme's danger tone;
				// the confirm dialog is the only thing that actually deletes.
				...(onDelete ? [{ icon: IconTrash, label: t("file.delete"), title: isDir ? t("file.deleteDirHint") : t("file.deleteHint"), danger: true, run: () => onDelete(entry) }] : [])
			];
			const tapOpen = () => { onSelect(entry.path); isDir ? onOpenDir(path, entry.path) : onOpenPreview(path, entry.path); };
			// Status badge hugs the file name (left group) instead of floating
			// at the far right; size + the actions ⋯ button keep the right edge.
			return h("div", { className: "dgp-row", "data-clickable": "true", "data-directory": isDir ? "true" : "false", "data-selected": selected ? "true" : "false", "data-ignored": entry.ignored ? "true" : "false", title: entry.path + (entry.ignored ? "\n" + t("file.ignoredHint") : ""), onClick: tapOpens ? tapOpen : () => onSelect(entry.path), onDoubleClick: () => (isDir ? onOpenDir(path, entry.path) : onOpenPreview(path, entry.path)), onContextMenu: (e) => { e.preventDefault(); e.stopPropagation(); onSelect(entry.path); openMenuAt(e.clientX, e.clientY); } },
				checkable ? h("span", { className: "dgp-rowCheck", "data-checked": checked ? "true" : "false", role: "checkbox", "aria-checked": checked ? "true" : "false", onClick: (e) => { e.stopPropagation(); onToggle?.(entry); } }, checked ? h(IconCheck, { size: 11 }) : null) : null,
				// Reference-into-composer action, ALWAYS visible (deliberately not
				// hover-gated like ⋯): one click points the agent at this entry.
				// It writes the cross-scope bridge store; the session-scope injector
				// registered in triggers.js performs the actual draft insert.
				h("button", {
					type: "button", className: "dgp-refBtn",
					title: isDir ? t("file.referenceDirHint") : t("file.referenceHint"),
					"aria-label": t("file.reference"),
					onClick: (e) => { e.stopPropagation(); requestReference(entry.path, isDir); }
				}, h(IconAtSign, { size: 13 })),
				h("span", { className: "dgp-fileIcon" + (isDir ? " dgp-fileIcon--dir" : "") }, h(Icon, { size: 15 })),
				h("span", { className: "dgp-treeName", style: { ...(isDir ? { fontWeight: 500 } : { fontFamily: "var(--dgp-font-mono,var(--dsw-font-mono,monospace))", fontSize: "calc(12px * var(--dgp-ui-scale, 1))" }), flex: "0 1 auto" } }, entry.name),
				badge ? h("span", { className: "dgp-badge", "data-tone": badge.tone }, t(badge.label)) : null,
				h("span", { style: { flex: 1 } }),
				entry.mtimeMs != null ? h("span", { className: "dgp-rowTime", title: t("file.colTime") }, fmtTime(entry.mtimeMs)) : null,
				isDir ? h("span", { className: "dgp-rowMeta" }, "—") : entry.size != null ? h("span", { className: "dgp-rowMeta" }, fmtSize(entry.size)) : null,
				h("span", { className: "dgp-fileActs" },
					h("button", {
						type: "button", className: "dgp-logMenuBtn", title: t("file.actionsTitle"),
						onClick: (e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); openMenuAt(r.right, r.bottom + 4); }
					}, copied ? h(IconCheck, { size: 14 }) : h(IconEllipsis, { size: 14 }))
				),
				menu ? portal(
					h("div", { className: "dgp-logMenu", "data-flip": menu.flip ? "true" : undefined, style: { top: menu.y, left: menu.x }, onClick: (e) => e.stopPropagation() },
						menuItems.map((it) => h("button", { key: it.label, type: "button", className: "dgp-logMenuItem", "data-danger": it.danger ? "true" : undefined, title: it.title, onClick: () => { closeMenu(); it.run(); } },
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

		function FileBrowser({ cwd, status, refreshTick, onEdited, headerHost, pageNavigation, rootNavigationRef }) {
			// `dirs`: rel-path → entries; `leftPath`/`rightPath`: the two panes;
			// `preview`: {path,name,text,truncated,binary,size,kind} when previewing.
			const [dirs, setDirs] = useState({});
			const [leftPath, setLeftPath] = useState(null);   // null ⇒ single list
			const [rightPath, setRightPath] = useState("");   // current list (root = "")
			const [preview, setPreview] = useState(null);
			const previewSeqRef = useRef(0);
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
			// Pending delete confirmation ({ title, message, onConfirm, danger }).
			// Delete is irreversible on disk, so it always goes through the dialog.
			const [delConfirm, setDelConfirm] = useState(null);
			const overwriteResolveRef = useRef(null);
			const fileInputRef = useRef(null);
			// cancel() closures of active transfers live in the registry
			// declared below (cancelsRef); the upload flow owns uploadAbortRef.
			// Unmount flag: in-flight listings/preview loads stop writing state
			// after the browser (or the whole panel) goes away.
			const mounted = useRef(true);
			useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
			// Narrow-viewport (mobile) drill-down pane: 'list' ⇄ 'preview'.
			// Consulted only when narrow — wide mode keeps the master-detail
			// split and never reads this flag.
			const narrow = useNarrow();
			const [mobilePane, setMobilePane] = useState("list");
			const [searchOpen, setSearchOpen] = useState(false);
			const searchInputRef = useRef(null);
			const [query, setQuery] = useState("");   // file list name filter
			// A single Monaco instance serves preview and editing for the active file.
			const [pvEdit, setPvEdit] = useState(false);
			const [editBusy, setEditBusy] = useState(false);
			const [editErr, setEditErr] = useState(null);
			const [pvCopyStatus, setPvCopyStatus] = useState(null);
			const pvCopyTimerRef = useRef(null);
			const t = useT();
			const editorHostRef = useRef(null);
			const editorRef = useRef(null);
			const [pvMode, setPvMode] = useState("source");
			const [pvCmTick, setPvCmTick] = useState(0);
			// Finished HTML blocks keep their element identity across progress updates.
			const [mdRendered, setMdRendered] = useState(null);
			// Recent search terms (whole-workspace box), persisted locally so the
			// user can jump straight back to a file they searched before.
			const [histOpen, setHistOpen] = useState(false);
			const [crumbMenuPos, setCrumbMenuPos] = useState(null);
			const [history, setHistory] = useState(() => {
				try { return JSON.parse(localStorage.getItem("dsh-files-git.searchHistory")) || []; }
				catch { return []; }
			});
			// Resolve Git badges once per status payload. File rows do constant-time
			// lookups instead of scanning every changed path for every visible file.
			const statusBadges = useMemo(
				() => gitBadgesOf(status),
				[status?.conflicts, status?.staged, status?.unstaged, status?.untracked]
			);
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
			useEffect(() => {
				if (panelHidden) { setHistOpen(false); setCrumbMenuPos(null); }
			}, [panelHidden]);
			useEffect(() => {
				if (!crumbMenuPos) return undefined;
				document.querySelector(".dgp-crumbMenuItem")?.focus();
				const onDoc = (e) => {
					if (e.target.closest?.(".dgp-crumbMenu, .dgp-crumbEllipsis")) return;
					setCrumbMenuPos(null);
				};
				const onKey = (e) => {
					if (e.key !== "Escape") return;
					setCrumbMenuPos(null);
					document.querySelector(".dgp-crumbEllipsis")?.focus();
				};
				document.addEventListener("mousedown", onDoc);
				document.addEventListener("keydown", onKey);
				return () => {
					document.removeEventListener("mousedown", onDoc);
					document.removeEventListener("keydown", onKey);
				};
			}, [crumbMenuPos]);
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
			// loadDir during navigation), so the load re-runs on settle. A Map so
			// the queued call keeps its own opts (`silent`), otherwise a silent
			// post-upload refresh that lost the race would re-run visibly.
			const pendingDirsRef = useRef(new Map());
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
			const loadDir = useCallback(async (rel, opts = {}) => {
				if (loadingDirsRef.current.has(rel)) {
					// Already in flight: remember it and re-run after settle —
					// dropping it would leave a stale listing (e.g. an upload
					// finishing right after navigation started a load).
					if (!opts.ensure) pendingDirsRef.current.set(rel, opts);
					return;
				}
				loadingDirsRef.current.add(rel);
				// `silent` skips the loading placeholder: an in-place refresh after an
				// upload/delete must not wipe the list and flip the pane into its
				// spinner state (reported as "上传后整个文件列表都刷新了"). Keys stay
				// stable, so React reconciles rows in place.
				if (!opts.silent) setDir(rel, "loading");
				try {
					const v = await gitRpc("list", { repo: cwd, path: rel });
					if (mounted.current) setDir(rel, Array.isArray(v.entries) ? v.entries : []);
				} catch (err) {
					// "error" (NOT []): caching an empty array made the pane
					// permanently show an EMPTY directory — the auto-load
					// effects only trigger on `undefined`, so a failed load
					// never retried. "error" renders a retry card instead.
					if (mounted.current) {
						setBrowseError(err.message);
						setDir(rel, "error");
					}
				} finally {
					loadingDirsRef.current.delete(rel);
					const queued = pendingDirsRef.current.get(rel);
					if (pendingDirsRef.current.delete(rel) && mounted.current) void loadDir(rel, queued ?? {});
				}
			}, [cwd]);

			useEffect(() => { setDirs({}); setLeftPath(null); setRightPath(""); setPreview(null); setSel(null); setSelSet({}); setBrowseError(null); pendingDirsRef.current.clear(); loadDir(""); }, [loadDir]);
			// Manual refresh: reload each visible pane exactly once (the Set
			// dedupes the case where leftPath === rightPath). Pane paths are
			// read from REFS: with leftPath/rightPath as deps, every
			// navigation re-fired this effect and re-loaded up to 4
			// directories, invalidating the visited-listings cache that makes
			// pane switches instant.
			useEffect(() => {
				if (refreshTick > 0) {
					const targets = new Set([""]);
					if (leftPathRef.current) targets.add(leftPathRef.current);
					targets.add(rightPathRef.current);
					for (const p of targets) loadDir(p);
				}
			}, [refreshTick, loadDir]);
			// Auto-load a pane whose directory was NEVER loaded (`undefined`).
			// "loading" must NOT re-trigger: the in-flight load owns that state,
			// and a re-request here queues into pendingDirsRef — which re-runs
			// the load on settle, which re-sets "loading", which re-triggers…
			// i.e. an infinite reload loop (v0.6.3 regression: the old guard
			// silently DROPPED these duplicate calls, so the "loading" branch
			// was harmless then and a perpetual-motion fuel source now).
			useEffect(() => { if (dirs[rightPath] === undefined) loadDir(rightPath, { ensure: true }); }, [rightPath, dirs, loadDir]);
			// Left pane auto-load: external open requests set leftPath to the
			// file's grandparent directory (never loaded on its own) — without
			// this, that pane would show "加载中…" forever.
			useEffect(() => { if (leftPath === null) return; if (dirs[leftPath] === undefined) loadDir(leftPath, { ensure: true }); }, [leftPath, dirs, loadDir]);

			const parentOf = (p) => { const i = p.lastIndexOf("/"); return i === -1 ? "" : p.slice(0, i); };
			const baseName = (p) => p === "" ? "" : p.split("/").pop();

			// Double-click a folder in pane `panePath` → cascade: the pane's list
			// moves to the left, the folder's contents become the right list.
			const openDir = useCallback((panePath, entryPath) => {
				previewSeqRef.current++;
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
			// previewSeqRef: the read is async — a newer open must win over a
			// slower older one (double-click A then B could land B then A and
			// leave the header saying B while the body shows A).
			const openPreview = useCallback(async (panePath, entryPath, abs = null) => {
				const seq = ++previewSeqRef.current;
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
					const identity = { path: entryPath, name, seq, ...(abs ? { abs } : {}) };
					setLeftPath(panePath); setRightPath(panePath);   // preview actions belong to the displayed directory
					if (kind === "image" || kind === "pdf") {
						// Media preview: no text read at all — the media view fetches
						// base64 via readBlob and owns a blob URL.
						setPvMode("preview");
						setPreview({ ...identity, text: "", truncated: false, binary: true, size: null, kind, mime: MIME_FROM_EXT[extOf(entryPath)] });
						return;
					}
					// Load editor assets alongside I/O instead of after it.
					if (kind === "code") ensureMonaco().catch(() => {});
					setPreview({ ...identity, kind, loading: true });
					const v = await gitRpc(abs ? "readPath" : "read", { repo: cwd, path: abs || entryPath });
					if (seq !== previewSeqRef.current || !mounted.current) return;   // a newer open (or unmount) won
					const effKind = v.binary ? "binary" : kind;
					const lang = LANG_FROM_EXT[extOf(entryPath)] || "js";
					setPvMode(defaultModeOf(effKind));
					setPreview({ ...identity, text: v.text, truncated: v.truncated, binary: v.binary, size: v.size, kind: effKind, lang });
				} catch (err) { if (seq === previewSeqRef.current && mounted.current) { setPreview(null); if (abs) setExtOpen({ abs }); setBrowseError(err?.message ?? String(err)); } }
			}, [cwd]);

			// Closing the preview: if it was opened from the single list, the list
			// was promoted to the left pane (leftPath === rightPath, both the same
			// directory) — collapse back to a single list instead of mirroring it.
			const closePreview = useCallback(() => {
				previewSeqRef.current++;
				setPreview(null);
				setLeftPath((lp) => (lp !== null && lp === rightPath ? null : lp));
			}, [rightPath]);
			const openSystemPath = useCallback(async (abs, rel) => {
				try { await rpc("api", "session/openWorkspacePath", { args: { request: { path: abs } } }); }
				catch (err) {
					// DSH's Windows native opener can fail resolving Explorer through
					// PATH. Only that exact host failure may fall back, and only for a
					// workspace-relative file that the sidecar checks again.
					if (!rel || err.code !== "gateway/internal" || err.message !== "path open failed") throw err;
					await gitRpc("openFile", { repo: cwd, path: rel });
				}
			}, [cwd]);
			const openInEditor = useCallback(async (rel) => {
				try { await openSystemPath(`${cwd.replace(/[\\/]+$/, "")}/${rel}`, rel); }
				catch (err) { setBrowseError(err.message); }
			}, [cwd, openSystemPath]);
			// Absolute preview paths may still point inside this workspace; convert
			// only those to the sidecar's relative-only open contract. Windows paths
			// compare case-insensitively, while POSIX paths remain case-sensitive.
			const workspaceRelOf = useCallback((abs) => {
				let root = String(cwd ?? "").replace(/\\/g, "/");
				if (root.length > 1) root = root.replace(/[\\/]+$/, "");
				if (!root) return null;
				const target = String(abs ?? "").replace(/\\/g, "/");
				const insensitive = /^[a-zA-Z]:/.test(root) || root.startsWith("//");
				const prefix = root.endsWith("/") ? root : `${root}/`;
				const targetKey = insensitive ? target.toLowerCase() : target;
				const prefixKey = insensitive ? prefix.toLowerCase() : prefix;
				return targetKey.startsWith(prefixKey) ? target.slice(prefix.length) || null : null;
			}, [cwd]);
			// System-open an ABSOLUTE path (used for files previewed from outside
			// the workspace, where the cwd-relative form is meaningless).
			const openInEditorAbs = useCallback(async (abs) => {
				try { await openSystemPath(abs, workspaceRelOf(abs)); }
				catch (err) { setBrowseError(err.message); }
			}, [openSystemPath, workspaceRelOf]);
			// Row quick actions: absolute-path helpers shared by copy/open.
			const absOf = useCallback((rel) => `${cwd.replace(/[\\/]+$/, "")}/${rel.replace(/^\/+/, "")}`, [cwd]);
			const openDirectory = useCallback(async (rel) => {
				setBrowseError(null);
				try {
					try { await rpc("api", "session/openWorkspacePath", { args: { request: { path: absOf(rel) } } }); }
					catch (err) {
						// DSH 0.2's Windows opener resolves Explorer through PATH.
						// Only its native internal failure is eligible for fallback;
						// authentication, invalid paths and cancellation stay final.
						if (err.code !== "gateway/internal" || err.message !== "path open failed") throw err;
						await gitRpc("openDirectory", { repo: cwd, path: rel });
					}
				} catch (err) { setBrowseError(err.message); }
			}, [cwd, absOf]);
			// Open the entry's folder in the system file explorer (for a file:
			// its parent directory; for a directory: itself).
			const onOpenFolder = useCallback(async (rel, isDir) => {
				await openDirectory(isDir ? rel : parentOf(rel));
			}, [openDirectory]);
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
			// Active-transfer cancel registry: several transfers CAN be alive
			// at once (an upload running while a download starts), and the old
			// single-slot abortRef let each new transfer orphan the previous
			// one's canceler (upload became uncancellable, its progress row
			// was silently swallowed). Each flow registers its canceler and
			// removes it on settle; the busy row's 取消 aborts everything
			// still registered.
			const cancelsRef = useRef(new Set());
			const registerCancel = useCallback((myCancel) => {
				cancelsRef.current.add(myCancel);
				return () => { cancelsRef.current.delete(myCancel); };
			}, []);
			const cancelBusy = useCallback(() => {
				for (const fn of cancelsRef.current) {
					try { fn(); } catch { /* already gone */ }
				}
				cancelsRef.current.clear();
				setBusyRow(null);
			}, []);

			// Download one file (row menu / preview header). Cancelable via the
			// status row; aborts surface silently.
			const downloadStart = useCallback(async (params, name) => {
				const controller = new AbortController();
				const myCancel = () => controller.abort();
				const unregister = registerCancel(myCancel);
				setBusyRow({ kind: "download", text: t("file.downloading", { name }), pct: null });
				try {
					await downloadFile({ repo: cwd, ...params, name, signal: controller.signal });
				} catch (err) {
					if (err?.name !== "AbortError") setBrowseError(t("file.downloadFailRow", { msg: String(err?.message ?? err) }));
				} finally {
					unregister();
					setBusyRow((b) => (b && b.kind === "download" ? null : b));
				}
			}, [cwd, registerCancel]);
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
				const unregister = registerCancel(myCancel);
				setBusyRow({ kind: "export", text: t("file.exporting", { count: paths.length }), pct: null });
				try {
					await exportZipDownload({ repo: cwd, paths, name, signal: controller.signal });
					return true;
				} catch (err) {
					if (err?.name === "AbortError") return false;   // user cancel: silent
					setBrowseError(t("file.exportFailRow", { msg: String(err?.message ?? err) }));
					return false;
				} finally {
					unregister();
					setBusyRow((b) => (b && b.kind === "export" ? null : b));
				}
			}, [cwd, registerCancel]);
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
			// Select-all is a TOGGLE: the button label flips to "取消全选" once the
			// whole directory is selected, mirroring the change list in ui.js.
			// Without it the only way out of a select-all was unticking rows one
			// by one (reported bug).
			const clearSel = useCallback(() => setSelSet({}), []);
			const selectableEntries = Array.isArray(dirs[rightPath]) ? dirs[rightPath].filter((e) => e.name !== ".git") : [];
			const selCount = Object.keys(selSet).length;
			const allSelected = selectableEntries.length > 0 && selectableEntries.every((e) => selSet[e.path]);
			const exportSelected = useCallback(async () => {
				const done = await exportStart(Object.keys(selSet), "");
				if (done) exitMulti();
			}, [selSet, exportStart, exitMulti]);

			// ── delete (row menu + multi-select) ────────────────────────────────
			// Disk removal is irreversible, so it always passes the danger dialog
			// first. The sidecar op (`delete`) is workspace-relative and
			// containment-checked; a tracked file simply shows up as a deletion in
			// git status afterwards (no `git rm` — the file is gone from disk).
			const deleteEntries = useCallback(async (list) => {
				let done = 0;
				let failed = null;
				for (const entry of list) {
					// `cancelable:false` hides the status row's cancel button: the
					// sidecar delete has no abort plumbing, and a cancel button that
					// does nothing is worse than none.
					setBusyRow({ kind: "delete", text: t("file.deleting", { name: entry.name }), pct: null, cancelable: false });
					try {
						// eslint-disable-next-line no-await-in-loop
						await gitRpc("delete", { repo: cwd, path: entry.path });
						done += 1;
					} catch (err) {
						failed = err;
						break;
					}
				}
				setBusyRow((b) => (b && b.kind === "delete" ? null : b));
				if (failed) setBrowseError(t("file.deleteFail", { msg: String(failed?.message ?? failed) }));
				if (done > 0) {
					// Silent refresh: the rows reconcile in place instead of the pane
					// flipping to its loading card; onEdited() then refreshes git
					// status so the removed entry stops showing as a change.
					if (multiMode) exitMulti();
					await loadDir(rightPath, { silent: true });
					if (typeof onEdited === "function") onEdited();
				}
			}, [cwd, t, loadDir, rightPath, onEdited, multiMode, exitMulti]);

			// Ask first, then delete. One entry or the whole selection.
			const askDelete = useCallback((entries) => {
				const list = (Array.isArray(entries) ? entries : [entries]).filter(Boolean);
				if (list.length === 0) return;
				const many = list.length > 1;
				const hasDir = list.some((e) => e.type === "dir");
				setDelConfirm({
					title: many ? t("file.deleteTitleMany", { count: list.length }) : t("file.deleteTitle", { name: list[0].name }),
					message: many ? t("file.deleteMsgMany") : (hasDir ? t("file.deleteMsgDir") : t("file.deleteMsg")),
					confirmLabel: t("file.delete"),
					danger: true,
					onConfirm: () => { void deleteEntries(list); }
				});
			}, [t, deleteEntries]);

			// Upload: hidden file input → sequential uploads into the current
			// directory. Existing targets ask once (覆盖 / 取消); the batch
			// stops at the first real failure.
			const pickFiles = useCallback(() => fileInputRef.current?.click(), []);
			// The upload flow needs a REF (uploadFile reads signalRef.current
			// per chunk), so it gets its own slot — separate from the download
			// registry so a concurrent download can't be swallowed by it.
			const uploadAbortRef = useRef(null);
			const onFilesPicked = useCallback((fileList) => {
				const files = Array.from(fileList ?? []);
				if (files.length === 0) return;
				void (async () => {
					let okCount = 0;
					let lastError = null;
					const myCancel = () => { try { uploadAbortRef.current?.(); } catch { /* already gone */ } };
					const unregister = registerCancel(myCancel);
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
								signalRef: uploadAbortRef
							});
							okCount++;
						} catch (err) {
							if (/aborted/i.test(String(err?.message ?? err))) break;
							lastError = err;
							break;
						}
					}
					unregister();
					uploadAbortRef.current = null;
					setBusyRow((b) => (b && b.kind === "upload" ? null : b));
					if (lastError) setBrowseError(t("file.uploadFailRow", { msg: String(lastError?.message ?? lastError) }));
					if (okCount > 0) {
						// Silent: the uploaded rows appear in place (stable keys) instead
						// of the pane flipping to a loading card and rebuilding the
						// whole listing — the reported "上传后列表全部刷新" jank.
						loadDir(rightPath, { silent: true });
						if (typeof onEdited === "function") onEdited();
					}
				})();
			}, [cwd, rightPath, absOf, askOverwrite, loadDir, onEdited, registerCancel]);

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
						const fname = absSlash.split("/").pop() || abs;
						openPreview("", fname, abs);
					}
				} catch (err) { setBrowseError(err?.message ?? String(err)); }
			}, [openReq, cwd, loadDir, openPreview]);

			// The list toolbar shows directories only; the preview owns the file
			// name and its full-path tooltip (including external files).
			const navTo = useCallback((target) => {
				previewSeqRef.current++;
				setPreview(null);
				setSelSet({});   // a new directory is a new selection
				if (target === "") { setLeftPath(null); setRightPath(""); }
				else { setLeftPath(parentOf(target)); setRightPath(target); }
			}, []);
			useEffect(() => {
				if (!rootNavigationRef) return;
				rootNavigationRef.current = navTo;
				return () => { if (rootNavigationRef.current === navTo) rootNavigationRef.current = null; };
			}, [rootNavigationRef, navTo]);
			const segs = rightPath === "" ? [] : rightPath.split("/");
			// Keep the workspace root and the two nearest directory levels visible.
			// Older levels remain reachable from the ellipsis menu.
			const hiddenCrumbs = segs.length > 2
				? segs.slice(0, -2).map((name, i) => ({ name, path: segs.slice(0, i + 1).join("/") }))
				: [];
			useEffect(() => {
				if (hiddenCrumbs.length === 0 && crumbMenuPos) setCrumbMenuPos(null);
			}, [hiddenCrumbs.length, crumbMenuPos]);
			const visibleSegs = hiddenCrumbs.length
				? segs.slice(-2).map((name, i) => ({ name, index: segs.length - 2 + i }))
				: segs.map((name, index) => ({ name, index }));
			const crumbs = h("div", { className: "dgp-crumbs dgp-crumbsInline" },
				h(React.Fragment, null,
						hiddenCrumbs.length ? h(React.Fragment, null,
							h("span", { className: "dgp-crumbSep" }, "/"),
							h("button", {
								type: "button", className: "dgp-crumb dgp-crumbEllipsis",
								title: hiddenCrumbs.map((c) => c.path).join(" / "),
								"aria-label": t("file.morePath"),
								"aria-haspopup": "menu", "aria-expanded": crumbMenuPos ? "true" : "false",
								onClick: (e) => {
									if (crumbMenuPos) { setCrumbMenuPos(null); return; }
									const r = e.currentTarget.getBoundingClientRect();
									setCrumbMenuPos({ left: Math.round(r.left), top: Math.round(r.bottom + 4) });
								}
							}, "…")
						) : null,
						visibleSegs.map(({ name, index }) => h(React.Fragment, { key: index },
							h("span", { className: "dgp-crumbSep" }, "/"),
							h("button", { className: "dgp-crumb" + (index === segs.length - 1 ? " dgp-crumbActive" : ""), onClick: () => navTo(segs.slice(0, index + 1).join("/")), title: segs.slice(0, index + 1).join("/") }, h("span", { className: "dgp-crumbLabel" }, name))
						))
					)
			);
			const crumbMenu = crumbMenuPos && hiddenCrumbs.length > 0 ? portal(
				h("div", { className: "dgp-crumbMenu", role: "menu", "aria-label": t("file.morePath"), style: { left: crumbMenuPos.left, top: crumbMenuPos.top } },
					hiddenCrumbs.map((item) => h("button", { key: item.path, type: "button", className: "dgp-crumbMenuItem", role: "menuitem", title: item.path, onClick: () => { setCrumbMenuPos(null); navTo(item.path); } },
						h(IconFolderOpen, { size: 13 }),
						h("span", { className: "dgp-crumbMenuLabel" }, item.path)))
				), document.querySelector(".dgp-root")) : null;

			// Prepare only the visible pane listings, and only when their directory
			// data or filter changes. Selection/preview state updates no longer
			// refilter thousands of names on every click.
			const visibleListings = useMemo(() => {
				const listings = new Map();
				const paths = new Set([rightPath]);
				if (leftPath !== null) paths.add(leftPath);
				const q = query.trim().toLowerCase();
				for (const path of paths) {
					const entries = dirs[path];
					if (!Array.isArray(entries)) continue;
					const items = [];
					for (const entry of entries) {
						if (entry.name === ".git" || (q && !entry.name.toLowerCase().includes(q))) continue;
						items.push(entry);
					}
					listings.set(path, { items });
				}
				return listings;
			}, [dirs, leftPath, rightPath, query]);

			// One list pane (folders first, then files). Single click selects,
			// double click on a folder drills in, on a file previews.
			const renderList = (path) => {
				const entries = dirs[path];
				if (entries === undefined || entries === "loading") return h("div", { className: "dgp-paneEmpty" }, t("common.loading"));
				// A FAILED load (repo vanished, transport error): show a retry
				// card instead of a silently empty directory (auto-load only
				// triggers on `undefined`, so this needs an explicit way out).
				if (entries === "error") return h("div", { className: "dgp-paneEmpty" },
					h("span", { style: { marginBottom: 8 } }, t("file.loadFailed")),
					h("button", { type: "button", className: "dgp-lbtn", onClick: () => loadDir(path) }, t("common.retry"))
				);
				const listing = visibleListings.get(path);
				const items = listing?.items || [];
				const row = (entry) => h(FileRow, { key: entry.path, entry, path, selected: sel === entry.path, opened: entry.type === "dir" && (rightPath === entry.path || rightPath.startsWith(entry.path + "/")), badgeKind: statusBadges.get(entry.path), tapOpens: narrow, checkable: multiMode, checked: !!selSet[entry.path], onSelect: setSel, onToggle: toggleSel, onOpenDir: openDir, onOpenPreview: openPreview, onOpenFolder, onCopyPath, onCopyName, onDownload, onDownloadZip, onDelete: askDelete });
				return h(React.Fragment, null,
					h("div", { className: "dgp-fileCard" },
						items.length === 0 ? h("div", { className: "dgp-paneEmpty" }, t("common.emptyDir")) : h(WindowedList, { key: path, className: "dgp-fileRows", items, rowHeight: 32, renderItem: row, itemKey: (entry) => entry.path })
					)
				);
			};

			useEffect(() => { setPvEdit(false); setEditErr(null); }, [preview?.seq]);
			useEffect(() => {
				setPvCopyStatus(null);
				return () => clearTimeout(pvCopyTimerRef.current);
			}, [preview]);
			const sourceView = pvMode === "source" || preview?.kind === "text";
			const needsEditor = !!preview && !preview.loading && !preview.binary &&
				(pvEdit || (preview.kind === "code" && !sourceView) || (sourceView && expensivePreviewText(preview.text || "")));
			const editorInput = {
				value: (preview?.text || "") + (sourceView && preview?.truncated ? t("file.truncatedNote") : ""), path: preview?.name,
				readOnly: !pvEdit, plainText: sourceView && !pvEdit
			};
			const editorInputRef = useRef(editorInput); editorInputRef.current = editorInput;
			// Toggle readOnly instead of rebuilding the model; never serialize on input.
			useEffect(() => {
				if (!needsEditor || !editorHostRef.current) { setEditBusy(false); return; }
				const controller = new AbortController();
				setEditBusy(true); setEditErr(null);
				mountMonacoEditor(editorHostRef.current, { ...editorInputRef.current, signal: controller.signal }).then((ed) => {
					if (controller.signal.aborted) { ed.dispose(); return; }
					try { ed.update(editorInputRef.current); } catch (err) { ed.dispose(); throw err; }
					editorRef.current = ed;
					setEditBusy(false);
				}).catch((err) => {
					if (controller.signal.aborted) return;
					setEditErr(err?.message ?? String(err)); setEditBusy(false);
				});
				return () => {
					controller.abort();
					editorRef.current?.dispose(); editorRef.current = null;
				};
			}, [needsEditor, preview?.seq, pvCmTick]);
			useEffect(() => {
				editorRef.current?.update(editorInputRef.current);
			}, [preview?.text, preview?.truncated, pvEdit, sourceView, t]);
			// Save the edited content back to disk. Works for workspace-relative
			// paths (containment-checked by the host) and absolute paths for
			// files outside the workspace. On success the preview text is
			// refreshed and the parent is told to re-pull git status.
			const saveEdit = useCallback(async () => {
				const view = editorRef.current;
				const p = preview;
				if (!view || !p) return;
				const content = view.getValue();
				const seq = previewSeqRef.current;
				setEditBusy(true);
				setEditErr(null);
				try {
					const payload = p.abs ? { repo: cwd, abs: p.abs, content } : { repo: cwd, path: p.path, content };
					await gitRpc("write", payload);
					if (typeof onEdited === "function") onEdited();
					if (!mounted.current || seq !== previewSeqRef.current) return;
					setPreview((prev) => (prev && prev.path === p.path && prev.abs === p.abs ? { ...prev, text: content, size: new TextEncoder().encode(content).length, truncated: false } : prev));
					setPvEdit(false);
				} catch (err) {
					if (mounted.current && seq === previewSeqRef.current) setEditErr(err.message);
				} finally {
					if (mounted.current && seq === previewSeqRef.current) setEditBusy(false);
				}
			}, [preview, cwd, onEdited]);
			const cancelEdit = useCallback(() => { setPvEdit(false); setEditErr(null); }, []);
			const copyPreviewContent = useCallback(async () => {
				const p = preview;
				if (!p || p.binary || typeof p.text !== "string") return;
				const content = pvEdit ? (editorRef.current?.getValue() ?? p.text) : p.text;
				const ok = await copyText(content);
				setPvCopyStatus(ok ? "copied" : "failed");
				clearTimeout(pvCopyTimerRef.current);
				pvCopyTimerRef.current = window.setTimeout(() => setPvCopyStatus(null), 1200);
			}, [preview, pvEdit]);
			// Warm independently of the search index, after the initial list settles.
			useEffect(() => {
				const ric = typeof window.requestIdleCallback === "function";
				const run = () => { ensureMonaco().catch(() => {}); };
				const handle = ric ? window.requestIdleCallback(run, { timeout: 1500 }) : window.setTimeout(run, 1200);
				return () => { if (ric) window.cancelIdleCallback(handle); else window.clearTimeout(handle); };
			}, [cwd]);
			// Markdown preview uses a chunked async pipeline: a large
			// document would otherwise render synchronously inside useMemo and
			// freeze the whole panel (double-click → minutes of nothing). The
			// source is split at SAFE top-level boundaries only — never inside
			// a fenced code block (inFence tracking), and only at a blank line
			// once the chunk has enough lines — so every chunk renders exactly
			// the same blocks the whole-document pass would produce. Each
			// finished chunk keeps its own HTML element: content streams in
			// top-down and a thin progress bar shows pct.
			useEffect(() => {
				if (!preview || preview.loading || pvEdit || preview.kind !== "md" || pvMode !== "preview") { setMdRendered(null); return; }
				let alive = true;
				setMdRendered({ seq: preview.seq, blocks: [], pct: 0 });
				const lines = (preview.text || "").replace(/\r\n/g, "\n").split("\n");
				if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === "")) { setMdRendered({ seq: preview.seq, blocks: [], pct: 100 }); return; }
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
				const blocks = [];
				let k = 0;
				const step = () => {
					if (!alive) return;
					blocks.push(h("div", { key: k, className: "dgp-mdChunk", dangerouslySetInnerHTML: { __html: renderMarkdown(chunks[k]) } }));
					k++;
					setMdRendered({ seq: preview.seq, blocks: blocks.slice(), pct: Math.round((k / chunks.length) * 100) });
					if (k < chunks.length) timer = setTimeout(step, 0);
				};
				let timer = setTimeout(step, 0);
				return () => { alive = false; clearTimeout(timer); };
			}, [preview, pvMode, pvEdit]);
			const previewBody = useMemo(() => {
				if (!preview) return null;
				const p = preview;
				if (p.loading) return { kind: "loading" };
				// Media kinds always render (no mode switch, no text pipeline).
				if (p.kind === "image" || p.kind === "pdf") return { kind: p.kind };
				if (p.kind === "html") {
					// Preview mode renders the HTML in a sandboxed iframe (opaque
					// origin, scripts allowed); source mode falls through to the
					// plain-text branch below.
					if (pvMode === "preview") return { kind: "html", text: p.text || "" };
					return { kind: "text", text: (p.text || "") + (p.truncated ? t("file.truncatedNote") : "") };
				}
				if (p.kind === "binary") return { kind: "binary" };
				if (pvMode === "source") {
					const note = p.truncated ? t("file.truncatedNote") : "";
					return { kind: "text", text: (p.text || "") + note };
				}
				if (p.kind === "md") return { kind: "md", blocks: mdRendered?.seq === p.seq ? mdRendered.blocks : [], pct: mdRendered?.seq === p.seq ? mdRendered.pct : 0 };
				if (p.kind === "code") return { kind: "code" };
				return { kind: "text", text: p.text || "" };
			}, [preview, pvMode, mdRendered, t]);

			const previewView = () => {
				const p = preview;
				let body;
				if (!previewBody) return null;
				if (previewBody.kind === "loading") {
					body = h("div", { className: "dgp-paneEmpty" }, t("pv.loadingPreview"));
				} else if (needsEditor) {
					// Keep this host at the same reconciliation position in both modes.
					body = h(React.Fragment, null,
						editErr ? h("div", { className: "dgp-error" },
							h("span", { style: { flex: 1 } }, pvEdit ? editErr : t("pv.editFail", { msg: editErr })),
							lbtn(t("common.retry"), () => { setEditErr(null); setPvCmTick((n) => n + 1); }, { tone: "default" })) : null,
						h("div", { className: "dgp-editorHost", ref: editorHostRef },
							editBusy && !editorRef.current ? h("div", { className: "dgp-paneEmpty" }, t("pv.loadingEditor")) : null,
							editErr && !pvEdit ? h("pre", { className: "dgp-pre" }, preview.text || "") : null));
				} else if (previewBody.kind === "binary") {
					body = h("div", { className: "dgp-paneEmpty" }, t("file.binary"));
				} else if (previewBody.kind === "image" || previewBody.kind === "pdf") {
					// Media (image / PDF): MediaView fetches base64 → blob URL.
					body = h(MediaView, { cwd, p, onUrl: setMediaUrl });
				} else if (previewBody.kind === "html") {
					// Scripts MUST run: a standalone page builds its content (and
					// often its theme) from inline JS, so sandbox="" rendered an
					// empty shell. `allow-scripts` keeps the document in an OPAQUE
					// origin — the page's JS runs, while a compromised HTML file
					// still cannot reach the panel, the DSH app or its storage.
					// Deliberately NO `allow-same-origin`: with it, a srcdoc/blob
					// document inherits THIS page's origin and could read the
					// session. Consequence: same-origin APIs (localStorage,
					// relative fetch) stay unavailable — that is the price of the
					// boundary, not a bug. `allow-modals` lets alert/confirm/print
					// work instead of failing silently; forms and popups stay
					// blocked (a preview must not POST or spawn windows).
					body = h("iframe", { className: "dgp-htmlFrame", srcDoc: withHtmlPrelude(previewBody.text), sandbox: "allow-scripts allow-modals", title: p.name });
				} else if (previewBody.kind === "md") {
					// Chunked rendering: nothing done yet → centered hint with
					// percent; partial/done → content (streams top-down) with a
					// thin progress bar pinned above it until 100%.
					body = previewBody.blocks.length === 0 && previewBody.pct < 100
						? h("div", { className: "dgp-paneEmpty" }, h(IconLoading, { size: 16 }), h("span", { style: { marginLeft: 8 } }, t("pv.renderMd", { pct: previewBody.pct })))
						: h(React.Fragment, null,
							previewBody.pct < 100 ? h("div", { className: "dgp-mdProg", role: "progressbar", "aria-valuenow": previewBody.pct, "aria-valuemin": 0, "aria-valuemax": 100 },
								h("div", { className: "dgp-mdProgBar", style: { width: `${previewBody.pct}%` } })) : null,
							h("div", { className: "dgp-md" }, previewBody.blocks)
						);
				} else {
					body = h("pre", { className: "dgp-pre" }, previewBody.text);
				}
				const editable = !p.loading && !p.binary && !p.truncated;
				const copyTitle = pvCopyStatus === "copied" ? t("file.copied")
					: pvCopyStatus === "failed" ? t("pv.copyFailed")
						: p.truncated ? t("pv.copyContentTruncatedTitle") : t("pv.copyContentTitle");
				const isFrame = !pvEdit && (previewBody.kind === "pdf" || previewBody.kind === "html");
				const modeItems = [
					{ label: t("pv.preview"), icon: IconEye, checked: pvMode === "preview", run: () => setPvMode("preview") },
					{ label: t("pv.source"), icon: IconCode, checked: pvMode === "source", run: () => setPvMode("source") }
				];
				const fileItems = [
					{ label: t("file.download"), icon: IconDownload, run: () => p.abs ? onDownloadAbs(p.abs, p.name) : onDownload(p.path, p.name) },
					!p.binary && typeof p.text === "string" ? { label: t("pv.copyContent"), title: copyTitle, icon: IconCopy, run: copyPreviewContent } : null,
					(p.kind === "html" || ((p.kind === "image" || p.kind === "pdf") && mediaUrl)) ? { label: t("pv.openBrowser"), icon: IconExternalLink, run: () => {
						if (p.kind === "html") { p.abs ? openInEditorAbs(p.abs) : openInEditor(p.path); return; }
						window.open(mediaUrl, "_blank");
					} } : null,
					!narrow ? { label: t("pv.openEditor"), icon: IconRightUp, run: () => p.abs ? openInEditorAbs(p.abs) : openInEditor(p.path) } : null,
					narrow && SWITCHABLE_KINDS.has(p.kind) && !pvEdit ? modeItems[0] : null,
					narrow && SWITCHABLE_KINDS.has(p.kind) && !pvEdit ? modeItems[1] : null,
					narrow ? { label: t("file.searchDir"), icon: IconSearch, run: () => setSearchOpen(true) } : null,
					{ label: t("pv.closePreview"), icon: IconClose, run: closePreview }
				];
				return { toolbar: h("div", { className: "dgp-pageToolbar dgp-fileToolbar", "data-editing": pvEdit ? "true" : "false" },
						narrow ? lbtn(null, () => setMobilePane("list"), { tone: "default", title: t("common.back"), ariaLabel: t("common.back"), icon: h(IconArrowLeft, { size: 14 }) }) : null,
						h("div", { className: "dgp-fileContext" }, directoryContext(rightPath, p, !narrow, false)),
						pageNavigation ? h("span", { className: "dgp-toolbarDivider", "aria-hidden": "true" }) : null,
						pageNavigation,
						h("div", { className: "dgp-fileSearchSlot", "data-open": searchOpen || query ? "true" : "false" }, searchOpen || query ? searchControl() : !narrow ? searchButton() : null),
						h("div", { className: "dgp-pageActions" },
						!pvEdit && SWITCHABLE_KINDS.has(p.kind) ? h(React.Fragment, null,
							h("span", { className: "dgp-pvSwitch dgp-modeWide", role: "group", "aria-label": t("pv.modeAria") },
								lbtn(t("pv.preview"), () => setPvMode("preview"), { active: pvMode === "preview" }),
								lbtn(t("pv.source"), () => setPvMode("source"), { active: pvMode === "source", tone: "default" })),
							h(ToolbarMenu, { className: "dgp-modeCompact", label: t("pv.modeAria"), icon: pvMode === "preview" ? IconEye : IconCode, items: modeItems })) : null,
						pvEdit ? h(React.Fragment, null,
							lbtn(t("pv.save"), saveEdit, { disabled: editBusy, title: editBusy ? t("pv.saving") : t("pv.save"), icon: h(IconSave, { size: 14 }) }),
							lbtn(t("common.cancel"), cancelEdit, { tone: "default" })) :
							editable ? lbtn(t("pv.edit"), () => setPvEdit(true), { title: t("pv.editHint"), icon: h(IconEdit, { size: 14 }) }) : null,
						h(ToolbarMenu, { label: pvCopyStatus ? copyTitle : t("file.actionsTitle"), icon: pvCopyStatus === "copied" ? IconCheck : pvCopyStatus === "failed" ? IconWarning : IconEllipsis, items: fileItems, info: h(React.Fragment, null, h("div", null, p.abs || p.path), p.size != null ? h("span", { className: "dgp-hint" }, fmtSize(p.size)) : null) })
						)),
					body: h("div", { className: "dgp-previewBody" + (needsEditor ? " dgp-editBody" : "") + (isFrame ? " dgp-frameBody" : "") }, body)
				};
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
				h("div", { className: "dgp-globalList" },
				globalResults.length === 0 ? h("div", { className: "dgp-paneEmpty" }, t("file.noMatch")) :
				globalResults.map((p) => {
						const badge = GIT_BADGES[statusBadges.get(p)];
						return h("div", { key: p, className: "dgp-row", "data-clickable": "true", "data-selected": sel === p ? "true" : "false", title: narrow ? p : `${p}\n${t("common.doubleClick")}`, onClick: () => { setSel(p); if (narrow) openPreview("", p); }, onDoubleClick: () => openPreview("", p) },
							h("span", { className: "dgp-fileIcon" }, h(iconForFile(p), { size: 15 })),
					h("span", { className: "dgp-treeName", style: { fontFamily: "var(--dgp-font-mono,var(--dsw-font-mono,ui-monospace,monospace))", fontSize: "calc(12px * var(--dgp-ui-scale, 1))" } }, p),
							badge ? h("span", { className: "dgp-badge", "data-tone": badge.tone }, t(badge.label)) : null
						);
					})
				)
			);

			// Narrow drill-down: the preview screen (full-width preview + back)
			// replaces the split; the list screen keeps crumbs + search. Wide
			// mode renders the master-detail split exactly as before.
			const narrowPreviewScreen = narrow && preview !== null && mobilePane === "preview";
			const closeSearch = () => { setSearchOpen(false); setQuery(""); setHistOpen(false); };
			useEffect(() => { if (searchOpen) searchInputRef.current?.focus(); }, [searchOpen]);
			const directoryMenu = (path) => h(ToolbarMenu, { label: t("file.directoryActions"), icon: IconChevronDown, items: [
				{ label: t("file.openFolderShort"), title: t("file.openFolder"), icon: IconFolderOpen, run: () => openDirectory(path) },
				{ label: t("file.upload"), icon: IconPaperclip, run: pickFiles },
				{ label: t("file.multi"), icon: IconListChecks, checked: multiMode, run: toggleMulti }
			] });
			const searchControl = () => h("div", { className: "dgp-searchRow" },
					h("span", { className: "dgp-searchIcon" }, h(IconSearch, { size: 13 })),
					h("input", { ref: searchInputRef, className: "dgp-search", "aria-label": allFiles ? t("file.searchAll") : t("file.searchDir"), placeholder: allFiles ? t("file.searchAll") : t("file.searchDir"), value: query,
						onChange: (e) => { setQuery(e.target.value); armSearch(); }, onFocus: () => { armSearch(); openHist(true); },
						onBlur: () => { if (query.trim()) rememberQuery(query); setTimeout(() => setHistOpen(false), 120); },
						onKeyDown: (e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeSearch(); } else if (e.key === "Enter") rememberQuery(query); }, spellCheck: false }),
					lbtn(null, () => openHist(!histOpen), { title: t("common.history"), ariaLabel: t("common.history"), active: histOpen, tone: "default", icon: h(IconListPen, { size: 13 }) }),
					lbtn(null, closeSearch, { title: t("common.close"), ariaLabel: t("common.close"), tone: "default", icon: h(IconClose, { size: 13 }) })
				);
			const searchButton = () => !(searchOpen || query) ? lbtn(null, () => setSearchOpen(true), { title: allFiles ? t("file.searchAll") : t("file.searchDir"), ariaLabel: t("file.searchDir"), tone: "default", icon: h(IconSearch, { size: 14 }) }) : null;
			// The parent header supplies the workspace root. Keep the path and
			// directory actions together, then place file search after Git navigation.
			const directoryContext = (path, file = null, showDirectory = true, includeSearch = true) => h("div", { className: "dgp-directoryContext", "data-search": searchOpen || query ? "true" : "false" },
				h("div", { className: "dgp-contextPath", "data-preview": file ? "true" : "false" },
					!narrow || !file ? crumbs : null,
					file && !narrow ? h("span", { className: "dgp-crumbSep" }, "/") : null,
					file ? h("span", { className: "dgp-previewName", title: file.abs || file.path }, file.name) : null),
				h("div", { className: "dgp-contextActions" },
					showDirectory ? directoryMenu(path) : null,
					includeSearch ? (searchOpen || query ? searchControl() : showDirectory ? searchButton() : null) : null));
			const directoryToolbar = (path) => h("div", { className: "dgp-pageToolbar dgp-directoryToolbar" },
				directoryContext(path, null, true, false),
				pageNavigation ? h("span", { className: "dgp-toolbarDivider", "aria-hidden": "true" }) : null,
				pageNavigation,
				h("div", { className: "dgp-fileSearchSlot", "data-open": searchOpen || query ? "true" : "false" }, searchOpen || query ? searchControl() : searchButton()));
			const previewContent = preview ? previewView() : null;
			// Browsing, preview and search share the same single-row context.
			const pageToolbar = preview && (!narrow || narrowPreviewScreen) ? previewContent.toolbar : directoryToolbar(rightPath);
			const historyPopup = histOpen && query.trim() === "" && histPos ? portal(h("div", { className: "dgp-searchHist", style: { left: histPos.left, top: histPos.top, width: histPos.width } },
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
						), document.querySelector(".dgp-root")) : null;
			return h(React.Fragment, null,
				inPanelHeader(headerHost, pageToolbar),
				historyPopup,
				crumbMenu,
				busyRow ? h("div", { className: "dgp-noteRow" },
					h("span", { style: { flex: 1, minWidth: 0 } }, busyRow.text),
					busyRow.pct != null ? h("div", { className: "dgp-mdProg", style: { width: 140, margin: 0, flex: "none" } }, h("div", { className: "dgp-mdProgBar", style: { width: `${busyRow.pct}%`, transition: "none" } })) : null,
					busyRow.cancelable === false ? null : lbtn(t("common.cancel"), cancelBusy, { tone: "default" })
				) : null,
				multiMode ? h("div", { className: "dgp-multiBar", role: "toolbar", "aria-label": t("git.selectionActions") },
					h("div", { className: "dgp-multiSelection" },
						h("span", { className: "dgp-multiCount", "aria-live": "polite" },
							t("file.selectedCount", { count: selCount })
						),
						lbtn(allSelected ? t("git.deselectAll") : t("git.selectAll"), () => (allSelected ? clearSel() : selectAllCurrent()), {
							tone: "default", active: allSelected, disabled: busyRow !== null,
							icon: h(IconListChecks, { size: 14 })
						})
					),
					h("div", { className: "dgp-multiBarActions" },
						lbtn(t("file.exportSel"), exportSelected, { disabled: selCount === 0 || busyRow !== null, icon: h(IconDownload, { size: 14 }) }),
						lbtn(t("file.deleteSel"), () => askDelete(selectableEntries.filter((e) => selSet[e.path])), { tone: "error", disabled: selCount === 0 || busyRow !== null, icon: h(IconTrash, { size: 14 }) }),
						h("span", { className: "dgp-multiDivider", "aria-hidden": "true" }),
						lbtn(t("common.cancel"), exitMulti, { tone: "default", icon: h(IconClose, { size: 13 }) })
					)
				) : null,
				browseError ? h("div", { className: "dgp-error" }, h("span", { style: { flex: 1 } }, browseError), lbtn(t("common.close"), () => setBrowseError(null), { tone: "default" })) : null,
				extOpen ? h("div", { className: "dgp-error" },
					h("span", { style: { flex: 1 } }, `${t("file.cantPreview", { path: extOpen.abs })}`),
					lbtn(t("file.openSystem"), () => { rpc("api", "session/openWorkspacePath", { args: { request: { path: extOpen.abs } } }).catch((err) => setBrowseError(err.message)); setExtOpen(null); }),
					lbtn(t("common.close"), () => setExtOpen(null), { tone: "default" })
				) : null,
				h("div", { className: "dgp-split", ref: splitRef, "data-dragging": dragging ? "true" : "false", style: { gridTemplateColumns: (preview || (split && !globalSearch)) ? gridCols : "1fr" } },
					(preview || (split && !globalSearch)) ? h("div", { key: "left", className: "dgp-pane dgp-listPane", "data-flat": "true", hidden: narrow && (!preview || narrowPreviewScreen) }, preview && globalSearch ? globalList() : renderList(leftPath ?? rightPath)) : null,
					(preview || (split && !globalSearch)) && !narrow ? h("div", { key: "gutter", className: "dgp-gutter", title: t("file.gutter"), onPointerDown: onGutterDown, onDoubleClick: resetSplit }) : null,
					h("div", { key: "right", className: "dgp-pane " + (preview ? "dgp-previewPane" : "dgp-listPane"), "data-flat": preview ? undefined : "true", hidden: narrow && !!preview && !narrowPreviewScreen }, preview ? previewContent.body : globalSearch ? globalList() : renderList(rightPath))
				),
				// Hidden multi-file picker behind the 上传 button. Snapshot the
				// files into a plain array BEFORE resetting .value — input.files
				// is a LIVE FileList: clearing the value empties the very object
				// we captured, and the upload would silently see zero files.
				h("input", { ref: fileInputRef, type: "file", multiple: true, style: { display: "none" }, onChange: (e) => { const files = Array.from(e.target.files ?? []); e.target.value = ""; onFilesPicked(files); } }),
				overwriteAsk ? h("div", { className: "dgp-confirm", onClick: () => finishOverwrite(false) },
					h("div", { className: "dgp-confirmCard", onClick: (e) => e.stopPropagation() },
						h("div", { className: "dgp-confirmTitle" }, t("file.overwriteTitle")),
						h("div", { className: "dgp-confirmMsg" }, t("file.overwriteMsg", { name: overwriteAsk.name })),
						h("div", { className: "dgp-confirmActions" },
							lbtn(t("common.cancel"), () => finishOverwrite(false), { tone: "default" }),
							lbtn(t("file.overwrite"), () => finishOverwrite(true))
						)
					)
				) : null,
				// Delete confirmation: the same inline card shape as the overwrite
				// prompt, with the danger tone (warning glyph + red confirm button).
				delConfirm ? h("div", { className: "dgp-confirm", onClick: () => setDelConfirm(null) },
					h("div", { className: "dgp-confirmCard", onClick: (e) => e.stopPropagation() },
						h("div", { className: "dgp-confirmTitle", "data-danger": "true" }, h(IconWarning, { size: 15 }), delConfirm.title),
						delConfirm.message ? h("div", { className: "dgp-confirmMsg" }, delConfirm.message) : null,
						h("div", { className: "dgp-confirmActions" },
							btn(t("common.cancel"), () => setDelConfirm(null)),
							btn(delConfirm.confirmLabel || t("common.ok"), () => { const run = delConfirm.onConfirm; setDelConfirm(null); run(); }, { variant: "dangerFill" })
						)
					)
				) : null
			);
		}

		// Shared DSH-style dropdown: pill trigger + floating option card. The
		// card closes on outside click / Escape; the selected item carries a
		// trailing checkmark exactly like the DSH settings page. Keyboard nav
		// mirrors the native menu: ArrowUp/Down/Home/End move a cursor row,
		// Enter/Space commits it, Escape closes; Enter's default (re-toggling
		// the trigger button) is suppressed while the menu is open.
		const DsSelect = function DsSelect({ value, options, onChange, label }) {
			const [open, setOpen] = useState(false);
			const [cursor, setCursor] = useState(0);
			const ref = useRef(null);
			useEffect(() => {
				if (!open) return undefined;
				const selected = options.findIndex((o) => String(o.value) === value);
				setCursor(selected < 0 ? 0 : selected);
				const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
				const onDocKey = (e) => { if (e.key === "Escape") setOpen(false); };
				document.addEventListener("mousedown", onDoc);
				document.addEventListener("keydown", onDocKey);
				return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onDocKey); };
			}, [open]);
			const commit = (o) => { setOpen(false); if (o !== undefined && String(o.value) !== value) onChange(o.value); };
			const onKey = (e) => {
				if (!open || options.length === 0) return;
				if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => (c + 1) % options.length); }
				else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => (c - 1 + options.length) % options.length); }
				else if (e.key === "Home") { e.preventDefault(); setCursor(0); }
				else if (e.key === "End") { e.preventDefault(); setCursor(options.length - 1); }
				else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); commit(options[cursor]); }
			};
			return h("div", { className: "dgp-ddWrap", ref, onKeyDown: onKey },
				h("button", {
					type: "button", className: "dgp-ddBtn", "data-open": open ? "true" : "false",
					"aria-haspopup": "listbox", "aria-expanded": open ? "true" : "false",
					onClick: () => setOpen(!open)
				},
					h("span", { className: "dgp-ddLabel" }, label),
					h(IconChevronDown, { size: 14 })),
				open ? h("div", { className: "dgp-ddMenu", role: "listbox" },
					options.map((o, i) => h("button", {
						key: String(o.value), type: "button", role: "option",
						className: "dgp-ddItem",
						"aria-selected": String(o.value) === value ? "true" : "false",
						"data-selected": String(o.value) === value ? "true" : "false",
						"data-cursor": i === cursor ? "true" : "false",
						onMouseEnter: () => setCursor(i),
						onClick: () => commit(o)
					},
						h("span", null, o.label),
						String(o.value) === value ? h(IconCheck, { size: 13 }) : null))) : null);
		};

		// Settings page (a real tab — clicking the tab switches the body, no popover).
		// Layout: one statement-style row per setting — descriptive label (+ hint)
		// on the LEFT, a dropdown select on the RIGHT. The theme row additionally
		// carries a side-by-side light/dark comparison preview block under its
		// label, so the choice is visible before it is made. No tiled button cubes.
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
			const [fontPrefs, setFontPrefs] = useState(getPanelFontPrefs);
			const pickUiFont = useCallback((id) => {
				const next = { ...fontPrefs, ui: id };
				setFontPrefs(setPanelFonts(next.ui, next.code));
			}, [fontPrefs]);
			const pickCodeFont = useCallback((id) => {
				const next = { ...fontPrefs, code: id };
				setFontPrefs(setPanelFonts(next.ui, next.code));
			}, [fontPrefs]);
			// One dropdown row: statement label left, native select right.
			const row = (label, hint, control) => h("div", { className: "dgp-setRow" },
				h("div", { className: "dgp-setRowMain" },
					h("div", { className: "dgp-setRowLabel" }, label),
					hint ? h("div", { className: "dgp-setRowHint" }, hint) : null),
				control);
			// DSH-style dropdown select. A native <select>'s popup list cannot be
			// styled, so the trigger is a pill button and the option menu is a
			// floating card matching the DSH settings page: rounded frosted card,
			// hover row highlight, checkmark on the selected item (right side).
			const dropdown = (value, options, onPick) => {
				const current = options.find((o) => String(o.value) === String(value));
				return h(DsSelect, { value: String(value), options, onChange: onPick, label: current?.label ?? "" });
			};
			// Theme preview uses the exact light/dark palettes registered in Monaco.
			// The selector remains one family entry while both variants are previewed.
			const SAMPLE = [
				[["comment", "// 计算斐波那契数列第 n 项"]],
				[["plain", "function "], ["func", "fib"], ["plain", "(n) {"]],
				[["plain", "  "], ["keyword", "if"], ["plain", " (n <= "], ["number", "1"], ["plain", ") "], ["keyword", "return"], ["plain", " n;"]],
				[["plain", "  "], ["keyword", "return"], ["plain", " fib(n - "], ["number", "1"], ["plain", ") + fib(n - "], ["number", "2"], ["plain", ");"]],
				[["plain", "}"]],
				[["keyword", "const"], ["plain", " answer = "], ["func", "fib"], ["plain", "("], ["number", "10"], ["plain", "); "], ["comment", "// 55"]]
			];
			const themePane = (preset, key) => {
				const pal = preset.colors;
				return h("div", {
				key, className: "dgp-themePreview", "aria-hidden": "true",
				style: { background: pal.bg, fontFamily: "var(--dgp-font-mono)" }
			},
				h("div", { className: "dgp-themePreviewFile", style: { color: pal.comment } }, t(preset.labelKey)),
				SAMPLE.map((line, li) => h("div", { key: li },
					line.map(([kind, text], ti) => h("span", { key: ti, style: { color: kind === "plain" ? pal.fg : pal[kind] } }, text))),
				),
				h("div", { style: { color: pal.fg } }, "…"));
			};
			const themePair = () => {
				const family = themePref === "auto" ? "vscode" : themePref;
				const variants = MONACO_THEME_PRESETS.filter((preset) => MONACO_THEME_FAMILY_BY_PRESET[preset.id] === family);
				const light = variants.find((preset) => !preset.dark) ?? MONACO_THEME_PRESETS.find((preset) => preset.id === "vs");
				const dark = variants.find((preset) => preset.dark) ?? MONACO_THEME_PRESETS.find((preset) => preset.id === "vs-dark");
				return [light, dark];
			};
			const [palL, palR] = themePair();
			const themeSplit = h("div", { className: "dgp-themeSplit", "aria-hidden": "true" },
				themePane(palL, "L"),
				themePane(palR, "R"));
			const themeOptions = MONACO_THEME_OPTIONS.map((option) => ({ value: option.id, label: t(option.labelKey) }));
			const uiFontOptions = UI_FONT_OPTIONS.map((id) => ({ value: id, label: t(`set.fontUi${id[0].toUpperCase()}${id.slice(1)}`) }));
			const codeFontOptions = CODE_FONT_OPTIONS.map((id) => ({ value: id, label: t(`set.fontCode${id[0].toUpperCase()}${id.slice(1)}`) }));
			const sizeOptions = (min, max) => Array.from({ length: max - min + 1 }, (_, i) => ({ value: min + i, label: `${min + i} px` }));
			return h("div", { className: "dgp-settingsPage" },
				h("div", { className: "dgp-settingsTitle" }, t("set.title")),
				row(t("set.editorGroup"), t("set.themeHint"),
					dropdown(themePref, themeOptions, pickTheme)),
				// Full-width split preview directly under the theme row.
				themeSplit,
				row(t("set.uiFont"), t("set.fontHint"), dropdown(fontPrefs.ui, uiFontOptions, pickUiFont)),
				row(t("set.uiSize"), t("set.uiSizeHint"), dropdown(fontPrefs.uiSize, sizeOptions(10, 20), (size) => setFontPrefs(setPanelFontSizes(size, fontPrefs.previewSize)))),
				row(t("set.codeFont"), t("set.codeFontHint"), dropdown(fontPrefs.code, codeFontOptions, pickCodeFont)),
				row(t("set.previewSize"), t("set.previewSizeHint"), dropdown(fontPrefs.previewSize, sizeOptions(8, 24), (size) => setFontPrefs(setPanelFontSizes(fontPrefs.uiSize, size)))),
				h("pre", { className: "dgp-fontSample" }, t("set.sizeSample")),
				row(t("set.defaultOpen"), t("set.applyHint"),
					dropdown(defaultMax, [
						{ value: true, label: t("set.maximized") },
						{ value: false, label: t("set.normal") }
					], pick)),
				row(t("set.click"), t("set.previewHint"),
					dropdown(previewOpen, [
						{ value: true, label: t("set.panelPreview") },
						{ value: false, label: t("set.systemOpen") }
					], setPreviewOpenFlag))
			);
		});
