// ── Monaco editor (locally hosted by the sidecar; lazy; coexists with the
// CodeMirror CDN pipeline until the migration completes) ────────────────────
//
// Assets live in the plugin's `vendor/monaco/vs` tree and are served by the
// sidecar at `http://127.0.0.1:<port>/vendor/...` (direct mode only — a
// non-loopback page has no route to the sidecar and simply keeps using the
// legacy diff renderer). Everything loads on first use; a failed load is
// retryable on the next call.

let monacoPromise = null;

// ── theme management ──────────────────────────────────────────────────────────
// Setting lives in localStorage (plugin-local preference). "auto" follows the
// DSH light/dark scheme (body[data-ds-dark-theme]); the other values pin one
// of Monaco's four built-in themes. Settled preference: dark → hc-black,
// light → hc-light (the user picked the high-contrast family as default).

const MONACO_THEME_KEY = "dgp.monacoTheme";
const MONACO_THEMES = ["auto", "vs", "vs-dark", "hc-black", "hc-light"];
const THEME_EVENT = "dgp:monaco-theme";
let darkWatcherInstalled = false;

function isDshDark() {
	try { return typeof document !== "undefined" && document.body?.hasAttribute("data-ds-dark-theme"); } catch { return true; }
}

// ── fixed diff palette (user requirement, 2026-09-12) ────────────────────────
// Diff blocks are THEME-INDEPENDENT: removed lines are always RED, inserted /
// changed lines always BLUE — the same hues in every theme, light or dark.
// Every selectable preference resolves to a DERIVED theme that carries this
// palette: the stock HC themes paint a11y borders instead of line
// backgrounds, and the stock vs/vs-dark palettes repaint diffs per theme —
// either would break the fixed red/blue semantics the user asked for.

/** Removed lines: red (shared hue for dark and light bases). */
const DIFF_DEL_DARK = "#FF5252";
const DIFF_DEL_LIGHT = "#E5484D";
/** Inserted / changed lines: blue (replaces the former green). */
const DIFF_ADD_DARK = "#4C8DFF";
const DIFF_ADD_LIGHT = "#2F6BED";

/** Register the derived themes (called once per Monaco load). */
function defineDshThemes(monaco) {
	monaco.editor.defineTheme("dsh-dark", {
		base: "hc-black", inherit: true, rules: [],
		colors: {
			"diffEditor.insertedLineBackground": `${DIFF_ADD_DARK}2E`,
			"diffEditor.removedLineBackground": `${DIFF_DEL_DARK}2E`,
			"diffEditor.insertedTextBackground": `${DIFF_ADD_DARK}45`,
			"diffEditor.removedTextBackground": `${DIFF_DEL_DARK}45`
		}
	});
	monaco.editor.defineTheme("dsh-light", {
		base: "hc-light", inherit: true, rules: [],
		colors: {
			"diffEditor.insertedLineBackground": `${DIFF_ADD_LIGHT}26`,
			"diffEditor.removedLineBackground": `${DIFF_DEL_LIGHT}26`,
			"diffEditor.insertedTextBackground": `${DIFF_ADD_LIGHT}40`,
			"diffEditor.removedTextBackground": `${DIFF_DEL_LIGHT}40`
		}
	});
	monaco.editor.defineTheme("dsh-vs-dark", {
		base: "vs-dark", inherit: true, rules: [],
		colors: {
			"diffEditor.insertedLineBackground": `${DIFF_ADD_DARK}2E`,
			"diffEditor.removedLineBackground": `${DIFF_DEL_DARK}2E`,
			"diffEditor.insertedTextBackground": `${DIFF_ADD_DARK}45`,
			"diffEditor.removedTextBackground": `${DIFF_DEL_DARK}45`
		}
	});
	monaco.editor.defineTheme("dsh-vs", {
		base: "vs", inherit: true, rules: [],
		colors: {
			"diffEditor.insertedLineBackground": `${DIFF_ADD_LIGHT}26`,
			"diffEditor.removedLineBackground": `${DIFF_DEL_LIGHT}26`,
			"diffEditor.insertedTextBackground": `${DIFF_ADD_LIGHT}40`,
			"diffEditor.removedTextBackground": `${DIFF_DEL_LIGHT}40`
		}
	});
}

/** Resolved (concrete) Monaco theme id for the current preference + scheme.
 * EVERY preference maps to a derived theme, so the diff palette above stays
 * fixed while the code colors follow the chosen base. */
function resolveMonacoTheme() {
	let pref = "auto";
	try { pref = localStorage.getItem(MONACO_THEME_KEY) || "auto"; } catch { /* private mode */ }
	if (pref === "vs") return "dsh-vs";
	if (pref === "vs-dark") return "dsh-vs-dark";
	const dark = pref === "hc-black" ? true : pref === "hc-light" ? false : isDshDark();
	return dark ? "dsh-dark" : "dsh-light";
}

/** Persist a theme choice ("auto" or a concrete id) and hot-apply it. */
function setMonacoTheme(pref) {
	try { localStorage.setItem(MONACO_THEME_KEY, pref); } catch { /* ignore */ }
	if (window.monaco?.editor) window.monaco.editor.setTheme(resolveMonacoTheme());
	try { document.dispatchEvent(new CustomEvent(THEME_EVENT)); } catch { /* non-DOM */ }
}

/** Current preference as stored ("auto" or a concrete id) — for the settings UI. */
function getMonacoThemePref() {
	try {
		const pref = localStorage.getItem(MONACO_THEME_KEY);
		return MONACO_THEMES.includes(pref) ? pref : "auto";
	} catch { return "auto"; }
}

/**
 * One observer for the page lifetime: when DSH flips its light/dark attribute
 * and the preference is "auto", re-resolve so every open editor follows.
 */
function installDarkModeWatcher(monaco) {
	if (darkWatcherInstalled || typeof MutationObserver === "undefined" || !document.body) return;
	darkWatcherInstalled = true;
	new MutationObserver(() => {
		if (getMonacoThemePref() === "auto") monaco.editor.setTheme(resolveMonacoTheme());
	}).observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme"] });
}

/**
 * Load and configure Monaco once. Resolves to the `monaco` namespace or
 * rejects (callers must fall back). Worker strategy: the sidecar is a
 * DIFFERENT origin than the DSH web UI, and cross-origin `new Worker(url)`
 * is blocked — the classic workaround applies: hand Monaco a blob URL whose
 * script importScripts() the real cross-origin worker main.
 */
function ensureMonaco() {
	if (monacoPromise) return monacoPromise;
	monacoPromise = (async () => {
		const info = await bootstrapServiceInfo();
		if (!info) throw new Error("monaco unavailable: no direct sidecar connection");
		const base = `http://127.0.0.1:${info.port}/vendor/monaco/vs`;
		// 1) AMD loader (idempotent enough: one panel, one load).
		if (!window.require?.config) {
			await new Promise((res, rej) => {
				const s = document.createElement("script");
				s.src = `${base}/loader.js`;
				s.onload = res;
				s.onerror = () => rej(new Error("monaco loader.js failed to load"));
				document.head.appendChild(s);
			});
		}
		const req = window.require;
		if (!req?.config) throw new Error("monaco AMD loader missing");
		// 2) Blob proxy for cross-origin workers.
		self.MonacoEnvironment = {
			getWorkerUrl() {
				return URL.createObjectURL(new Blob([
					`self.MonacoEnvironment={baseUrl:'${base}/'};importScripts('${base}/vs/base/worker/workerMain.js');`
				], { type: "text/javascript" }));
			}
		};
		// 3) Core (workers/language chunks are pulled on demand from `vs`).
		// NOTE: `base` already ends with /vs — it IS the AMD "vs" prefix.
		req.config({ paths: { vs: base } });
		await new Promise((res, rej) => {
			// The AMD loader's errback only hands us an opaque Event. Capture
			// resource-level script failures in the load window (capture phase
			// 'error' events carry the failing element) so the rejection names
			// the exact URL instead of "[object Event]".
			const failed = [];
			const onResErr = (ev) => {
				const tag = ev?.target;
				if (tag && tag.tagName === "SCRIPT" && tag.src) {
					const src = String(tag.src);
					if (src.includes("/vendor/monaco/") && !failed.includes(src)) failed.push(src);
				}
			};
			document.addEventListener("error", onResErr, true);
			// Safety net: if the loader never calls back (hung chunk), still
			// detach the diagnostic listener eventually.
			const watchdog = setTimeout(() => {
				document.removeEventListener("error", onResErr, true);
			}, 60000);
			const done = () => {
				clearTimeout(watchdog);
				document.removeEventListener("error", onResErr, true);
			};
			req(["vs/editor/editor.main"], () => {
				done();
				res();
			}, (e) => {
				done();
				const detail = failed.length ? `failed scripts: ${failed.join(" | ")}` : `no script element reported (errback: ${String(e)})`;
				rej(new Error(`monaco editor.main load failed — ${detail}`));
			});
		});
		const monaco = window.monaco;
		if (!monaco?.editor) throw new Error("monaco namespace missing");
		// Register the derived DSH diff themes, then apply the persisted theme
		// right after load, and keep following DSH's light/dark switch while in
		// "auto" mode.
		defineDshThemes(monaco);
		monaco.editor.setTheme(resolveMonacoTheme());
		installDarkModeWatcher(monaco);
		return monaco;
	})();
	// A failed load must not cache the rejection forever (sidecar may have
	// been idle-exited and come back before the next attempt).
	monacoPromise.catch(() => { monacoPromise = null; });
	return monacoPromise;
}

// Best-effort language id from a workspace-relative path (tokenizer only —
// heavy language services are not vendored; unknown → plain text).
function monacoLanguageFor(path) {
	const monaco = window.monaco;
	if (!monaco?.languages || !path) return "plaintext";
	const ext = path.slice(path.lastIndexOf(".") + 1).toLowerCase();
	for (const lang of monaco.languages.getLanguages()) {
		if ((lang.extensions ?? []).some((e) => e.slice(1).toLowerCase() === ext)) return lang.id;
	}
	return "plaintext";
}

/**
 * Reconstruct { original, modified } document pair from a `git diff` unified
 * text so Monaco's own differ can render it. Returns null when the text is
 * not faithfully reconstructable (binary notes, truncated output, unknown
 * lines) — the caller then keeps the legacy renderer.
 */
function splitUnifiedDiff(text) {
	const lines = text.split("\n");
	// Drop the trailing empty element from the final newline (git output ends
	// with \n; the diff content itself never has a phantom last line).
	if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
	const orig = [];
	const mod = [];
	// Line numbers from @@ headers keep multi-file / multi-hunk order honest,
	// but sequential application is sufficient for well-formed input; we use
	// them only as a sanity signal (a rewind means misordered/partial input).
	let expectOld = -1;
	let expectNew = -1;
	for (const line of lines) {
		if (line.startsWith("@@ ")) {
			const m = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
			if (!m) return null;
			const o = parseInt(m[1], 10), n = parseInt(m[2], 10);
			if (expectOld !== -1 && (o < expectOld || n < expectNew)) return null;
			expectOld = o; expectNew = n;
			orig.push(line);
			mod.push(line);
		} else if (line.startsWith("diff --git")) {
			// New file: its hunks restart at line 1 (new files even at 0) —
			// reset the monotonic cursors so a later file after a modified one
			// is not misjudged as out-of-order.
			expectOld = -1;
			expectNew = -1;
		} else if (line.startsWith("index ") ||
			line.startsWith("--- ") || line.startsWith("+++ ") ||
			line.startsWith("new file") || line.startsWith("deleted file") ||
			line.startsWith("old mode") || line.startsWith("new mode") ||
			line.startsWith("rename ") || line.startsWith("similarity ") ||
			line.startsWith("copy from") || line.startsWith("copy to") ||
			line.startsWith("dissimilarity ")) {
			/* file-header meta lines (new/deleted/renamed files) — skip, the
			 * documents themselves reconstruct fine without them */
		} else if (line.startsWith("Binary files") || line.startsWith("GIT binary patch")) {
			return null; // binary payload: nothing to reconstruct
		} else if (line.startsWith("+")) {
			mod.push(line.slice(1));
		} else if (line.startsWith("-")) {
			orig.push(line.slice(1));
		} else if (line.startsWith(" ")) {
			orig.push(line.slice(1));
			mod.push(line.slice(1));
		} else if (line.startsWith("\\")) {
			/* "\ No newline at end of file" — skip */
		} else if (line === "") {
			// git context lines for empty content come as " " — a bare "" is
			// malformed for our purposes.
			return null;
		} else {
			return null;
		}
	}
	return { original: orig.join("\n"), modified: mod.join("\n") };
}

/**
 * Mount a read-only UNIFIED diff editor into `hostEl`. Resolves to
 * { update(text, path), dispose() } — or null when the diff text cannot be
 * reconstructed (caller falls back to the legacy renderer).
 */
async function mountMonacoDiff(hostEl, unifiedText, path) {
	const monaco = await ensureMonaco();
	const parsed = splitUnifiedDiff(unifiedText);
	if (!parsed) return null;
	const lang = monacoLanguageFor(path);
	const ed = monaco.editor.createDiffEditor(hostEl, {
		readOnly: true,
		renderSideBySide: false,          // unified view, like `git diff`
		automaticLayout: true,
		minimap: { enabled: false },
		scrollBeyondLastLine: false,
		fontSize: 12,
		lineHeight: 20,
		fontFamily: "var(--dsw-font-mono, Consolas, monospace)",
		renderOverviewRuler: false,
		hideUnchangedRegions: { enabled: true, contextSize: 3 },
		diffCodeLens: false,
		scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
		theme: resolveMonacoTheme()
	});
	const orig = monaco.editor.createModel(parsed.original, lang);
	const mod = monaco.editor.createModel(parsed.modified, lang);
	ed.setModel({ original: orig, modified: mod });
	return {
		update(text, newPath) {
			const next = splitUnifiedDiff(text);
			if (!next) return false;
			const newLang = monacoLanguageFor(newPath);
			if (newLang !== orig.getLanguageId()) {
				monaco.editor.setModelLanguage(orig, newLang);
				monaco.editor.setModelLanguage(mod, newLang);
			}
			orig.setValue(next.original);
			mod.setValue(next.modified);
			return true;
		},
		dispose() {
			ed.dispose();
			orig.dispose();
			mod.dispose();
		}
	};
}

/**
 * Mount a Monaco code editor (plain, not diff) into `hostEl`. This is the
 * replacement for the former CDN CodeMirror pipeline — file preview (readOnly)
 * and inline editing share this ONE renderer, so indentation, wrapping and
 * token highlighting are identical in both modes. Resolves to
 * { getValue(), dispose() } or rejects (caller decides the fallback UI).
 */
async function mountMonacoEditor(hostEl, { value, path, readOnly }) {
	const monaco = await ensureMonaco();
	const ed = monaco.editor.create(hostEl, {
		value: value || "",
		language: monacoLanguageFor(path),
		readOnly: readOnly === true,
		automaticLayout: true,
		minimap: { enabled: false },
		scrollBeyondLastLine: false,
		fontSize: 12,
		lineHeight: 20,
		fontFamily: "var(--dsw-font-mono, Consolas, monospace)",
		tabSize: 2,
		lineNumbers: "on",
		renderWhitespace: "selection",
		scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
		theme: resolveMonacoTheme()
	});
	// NOTE: no per-keystroke onChange — the only consumer (inline editing)
	// reads getValue() at save time; serializing the whole doc per keystroke
	// would be O(n) on every key for large files.
	return {
		getValue() { return ed.getValue(); },
		dispose() {
			const model = ed.getModel();
			ed.dispose();
			model?.dispose();
		}
	};
}
