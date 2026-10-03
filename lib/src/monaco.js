// ── Monaco editor (locally hosted by the sidecar; lazy; coexists with the
// CodeMirror CDN pipeline until the migration completes) ────────────────────
//
// Assets live in the plugin's `vendor/monaco/vs` tree and are served by the
// sidecar at `http://127.0.0.1:<port>/vendor/...` (direct mode only — a
// non-loopback page has no route to the sidecar and simply keeps using the
// legacy diff renderer). Everything loads on first use; a failed load is
// retryable on the next call.

let monacoPromise = null;
let monacoAssetBase = null;
let monacoWorkerBlobUrl = null;

// ── editor themes and font preferences ────────────────────────────────────────
// Theme definitions keep the Monaco syntax palette and settings preview in one
// source of truth. The selector stores a family; its light/dark variant follows DSH.
const MONACO_THEME_KEY = "dgp.monacoTheme";
const MONACO_FONT_KEY = "dgp.monacoFonts";
const THEME_EVENT = "dgp:monaco-theme";
const FONT_EVENT = "dgp:monaco-fonts";
let darkWatcherInstalled = false;

const MONACO_THEME_PRESETS = [
	{ id: "vs", labelKey: "set.themeVs", base: "vs", dark: false, pair: "vs-dark", colors: { bg: "#FFFFFF", fg: "#202124", comment: "#008000", keyword: "#0000FF", string: "#A31515", func: "#795E26", number: "#098658", type: "#267F99", accent: "#007ACC", selection: "#ADD6FF" } },
	{ id: "vs-dark", labelKey: "set.themeVsDark", base: "vs-dark", dark: true, pair: "vs", colors: { bg: "#1F1F1F", fg: "#D4D4D4", comment: "#6A9955", keyword: "#569CD6", string: "#CE9178", func: "#DCDCAA", number: "#B5CEA8", type: "#4EC9B0", accent: "#007ACC", selection: "#264F78" } },
	{ id: "hc-light", labelKey: "set.themeHcLight", base: "hc-light", dark: false, highContrast: true, pair: "hc-black", colors: { bg: "#FFFFFF", fg: "#000000", comment: "#4B4B4B", keyword: "#99005F", string: "#0B6F4B", func: "#0000D1", number: "#A33E00", type: "#005A9C", accent: "#0000D1", selection: "#B3D7FF" } },
	{ id: "hc-black", labelKey: "set.themeHcBlack", base: "hc-black", dark: true, highContrast: true, pair: "hc-light", colors: { bg: "#000000", fg: "#FFFFFF", comment: "#A0A0A0", keyword: "#E07BE0", string: "#7EE787", func: "#6CB6FF", number: "#FFB867", type: "#79C0FF", accent: "#6CB6FF", selection: "#264F78" } },
	{ id: "github-light", labelKey: "set.themeGithubLight", base: "vs", dark: false, pair: "github-dark", colors: { bg: "#FFFFFF", fg: "#1F2328", comment: "#6E7781", keyword: "#CF222E", string: "#0A3069", func: "#8250DF", number: "#0550AE", type: "#953800", accent: "#0969DA", selection: "#DDF4FF" } },
	{ id: "github-dark", labelKey: "set.themeGithubDark", base: "vs-dark", dark: true, pair: "github-light", colors: { bg: "#0D1117", fg: "#E6EDF3", comment: "#8B949E", keyword: "#FF7B72", string: "#A5D6FF", func: "#D2A8FF", number: "#79C0FF", type: "#FFA657", accent: "#58A6FF", selection: "#1F3A5F" } },
	{ id: "one-light", labelKey: "set.themeOneLight", base: "vs", dark: false, pair: "one-dark", colors: { bg: "#FAFAFA", fg: "#383A42", comment: "#A0A1A7", keyword: "#A626A4", string: "#50A14F", func: "#4078F2", number: "#986801", type: "#C18401", accent: "#526FFF", selection: "#D7EAFF" } },
	{ id: "one-dark", labelKey: "set.themeOneDark", base: "vs-dark", dark: true, pair: "one-light", colors: { bg: "#282C34", fg: "#ABB2BF", comment: "#5C6370", keyword: "#C678DD", string: "#98C379", func: "#61AFEF", number: "#D19A66", type: "#E5C07B", accent: "#528BFF", selection: "#3E4451" } },
	{ id: "dracula", labelKey: "set.themeDracula", base: "vs-dark", dark: true, colors: { bg: "#282A36", fg: "#F8F8F2", comment: "#6272A4", keyword: "#FF79C6", string: "#F1FA8C", func: "#50FA7B", number: "#BD93F9", type: "#8BE9FD", accent: "#BD93F9", selection: "#44475A" } },
	{ id: "dracula-light", labelKey: "set.themeDraculaLight", base: "vs", dark: false, pair: "dracula", colors: { bg: "#F8F8F2", fg: "#282A36", comment: "#6272A4", keyword: "#D63384", string: "#607D00", func: "#1B8C50", number: "#7C3AED", type: "#007C91", accent: "#6B46C1", selection: "#E8DEF8" } },
	{ id: "monokai", labelKey: "set.themeMonokai", base: "vs-dark", dark: true, colors: { bg: "#272822", fg: "#F8F8F2", comment: "#75715E", keyword: "#F92672", string: "#E6DB74", func: "#A6E22E", number: "#AE81FF", type: "#66D9EF", accent: "#FD971F", selection: "#49483E" } },
	{ id: "monokai-light", labelKey: "set.themeMonokaiLight", base: "vs", dark: false, pair: "monokai", colors: { bg: "#FAF9F5", fg: "#272822", comment: "#8B8778", keyword: "#C2185B", string: "#8A6D00", func: "#5A7A00", number: "#7048A8", type: "#007F8B", accent: "#E07A00", selection: "#E9E3D1" } },
	{ id: "nord", labelKey: "set.themeNord", base: "vs-dark", dark: true, colors: { bg: "#2E3440", fg: "#D8DEE9", comment: "#616E88", keyword: "#81A1C1", string: "#A3BE8C", func: "#88C0D0", number: "#B48EAD", type: "#8FBCBB", accent: "#88C0D0", selection: "#434C5E" } },
	{ id: "nord-light", labelKey: "set.themeNordLight", base: "vs", dark: false, pair: "nord", colors: { bg: "#ECEFF4", fg: "#2E3440", comment: "#7B88A1", keyword: "#5E81AC", string: "#6F8F61", func: "#4C78A8", number: "#A05F8F", type: "#4E8D91", accent: "#5E81AC", selection: "#D8DEE9" } },
	{ id: "solarized-light", labelKey: "set.themeSolarizedLight", base: "vs", dark: false, pair: "solarized-dark", colors: { bg: "#FDF6E3", fg: "#657B83", comment: "#93A1A1", keyword: "#859900", string: "#2AA198", func: "#268BD2", number: "#D33682", type: "#B58900", accent: "#268BD2", selection: "#EEE8D5" } },
	{ id: "solarized-dark", labelKey: "set.themeSolarizedDark", base: "vs-dark", dark: true, pair: "solarized-light", colors: { bg: "#002B36", fg: "#839496", comment: "#586E75", keyword: "#859900", string: "#2AA198", func: "#268BD2", number: "#D33682", type: "#B58900", accent: "#268BD2", selection: "#073642" } },
	{ id: "gruvbox-light", labelKey: "set.themeGruvboxLight", base: "vs", dark: false, pair: "gruvbox-dark", colors: { bg: "#FBF1C7", fg: "#3C3836", comment: "#928374", keyword: "#AF3A03", string: "#79740E", func: "#427B58", number: "#8F3F71", type: "#076678", accent: "#076678", selection: "#EBDBB2" } },
	{ id: "gruvbox-dark", labelKey: "set.themeGruvboxDark", base: "vs-dark", dark: true, pair: "gruvbox-light", colors: { bg: "#282828", fg: "#EBDBB2", comment: "#928374", keyword: "#FB4934", string: "#B8BB26", func: "#FABD2F", number: "#D3869B", type: "#8EC07C", accent: "#83A598", selection: "#3C3836" } },
	{ id: "ayu-light", labelKey: "set.themeAyuLight", base: "vs", dark: false, pair: "ayu-dark", colors: { bg: "#FAFAFA", fg: "#5C6166", comment: "#ABB0B6", keyword: "#F29718", string: "#86B300", func: "#F2AE49", number: "#A37ACC", type: "#399EE6", accent: "#FF9940", selection: "#F2EED7" } },
	{ id: "ayu-dark", labelKey: "set.themeAyuDark", base: "vs-dark", dark: true, pair: "ayu-light", colors: { bg: "#0F1419", fg: "#BFBDB6", comment: "#5C6773", keyword: "#FF8F40", string: "#B8CC52", func: "#FFD173", number: "#D4BFFF", type: "#59C2FF", accent: "#FF8F40", selection: "#253340" } },
	{ id: "material-light", labelKey: "set.themeMaterialLight", base: "vs", dark: false, pair: "material-dark", colors: { bg: "#FAFAFA", fg: "#546E7A", comment: "#90A4AE", keyword: "#7C4DFF", string: "#91B859", func: "#6182B8", number: "#F76D47", type: "#39ADB5", accent: "#6182B8", selection: "#CFD8DC" } },
	{ id: "material-dark", labelKey: "set.themeMaterialDark", base: "vs-dark", dark: true, pair: "material-light", colors: { bg: "#263238", fg: "#EEFFFF", comment: "#546E7A", keyword: "#C792EA", string: "#C3E88D", func: "#82AAFF", number: "#F78C6C", type: "#FFCB6B", accent: "#89DDFF", selection: "#37474F" } },
	{ id: "tokyo-night", labelKey: "set.themeTokyoNight", base: "vs-dark", dark: true, pair: "tokyo-night-day", colors: { bg: "#1A1B26", fg: "#C0CAF5", comment: "#565F89", keyword: "#BB9AF7", string: "#9ECE6A", func: "#7AA2F7", number: "#FF9E64", type: "#2AC3DE", accent: "#7AA2F7", selection: "#283457" } },
	{ id: "tokyo-night-day", labelKey: "set.themeTokyoNightDay", base: "vs", dark: false, pair: "tokyo-night", colors: { bg: "#E1E2E7", fg: "#3760BF", comment: "#848CB5", keyword: "#9854F1", string: "#485E30", func: "#2E7DE9", number: "#965027", type: "#007197", accent: "#2E7DE9", selection: "#D0D5E3" } },
	{ id: "catppuccin-latte", labelKey: "set.themeCatppuccinLatte", base: "vs", dark: false, pair: "catppuccin-mocha", colors: { bg: "#EFF1F5", fg: "#4C4F69", comment: "#9CA0B0", keyword: "#8839EF", string: "#40A02B", func: "#1E66F5", number: "#FE640B", type: "#179299", accent: "#1E66F5", selection: "#CCD0DA" } },
	{ id: "catppuccin-mocha", labelKey: "set.themeCatppuccinMocha", base: "vs-dark", dark: true, pair: "catppuccin-latte", colors: { bg: "#1E1E2E", fg: "#CDD6F4", comment: "#6C7086", keyword: "#CBA6F7", string: "#A6E3A1", func: "#89B4FA", number: "#FAB387", type: "#94E2D5", accent: "#89B4FA", selection: "#45475A" } }
];
const MONACO_THEME_FAMILY_BY_PRESET = {
	vs: "vscode", "vs-dark": "vscode",
	"hc-light": "high-contrast", "hc-black": "high-contrast",
	"github-light": "github", "github-dark": "github",
	"one-light": "one", "one-dark": "one",
	dracula: "dracula", "dracula-light": "dracula",
	monokai: "monokai", "monokai-light": "monokai",
	nord: "nord", "nord-light": "nord",
	"solarized-light": "solarized", "solarized-dark": "solarized",
	"gruvbox-light": "gruvbox", "gruvbox-dark": "gruvbox",
	"ayu-light": "ayu", "ayu-dark": "ayu",
	"material-light": "material", "material-dark": "material",
	"tokyo-night": "tokyo-night", "tokyo-night-day": "tokyo-night",
	"catppuccin-latte": "catppuccin", "catppuccin-mocha": "catppuccin"
};
const MONACO_THEME_FAMILIES = [
	{ id: "vscode", labelKey: "set.themeFamilyVsCode" },
	{ id: "high-contrast", labelKey: "set.themeFamilyHighContrast" },
	{ id: "github", labelKey: "set.themeFamilyGithub" },
	{ id: "one", labelKey: "set.themeFamilyOne" },
	{ id: "dracula", labelKey: "set.themeFamilyDracula" },
	{ id: "monokai", labelKey: "set.themeFamilyMonokai" },
	{ id: "nord", labelKey: "set.themeFamilyNord" },
	{ id: "solarized", labelKey: "set.themeFamilySolarized" },
	{ id: "gruvbox", labelKey: "set.themeFamilyGruvbox" },
	{ id: "ayu", labelKey: "set.themeFamilyAyu" },
	{ id: "material", labelKey: "set.themeFamilyMaterial" },
	{ id: "tokyo-night", labelKey: "set.themeFamilyTokyoNight" },
	{ id: "catppuccin", labelKey: "set.themeFamilyCatppuccin" }
];
const MONACO_THEMES = ["auto", ...MONACO_THEME_FAMILIES.map((family) => family.id)];
const MONACO_THEME_OPTIONS = [
	{ id: "auto", labelKey: "set.themeAuto" },
	...MONACO_THEME_FAMILIES
];

const UI_FONT_STACKS = {
	system: "var(--dsw-font-family, system-ui, sans-serif)",
	inter: 'Inter, "Microsoft YaHei", system-ui, sans-serif',
	segoe: '"Segoe UI", "Microsoft YaHei", sans-serif',
	noto: '"Noto Sans SC", "Microsoft YaHei", sans-serif',
	yahei: '"Microsoft YaHei", "Noto Sans SC", sans-serif'
};
const CODE_FONT_STACKS = {
	system: "var(--dsw-font-mono, ui-monospace, SFMono-Regular, Consolas, monospace)",
	cascadia: '"Cascadia Code", Consolas, monospace',
	cascadiaMono: '"Cascadia Mono", Consolas, monospace',
	consolas: 'Consolas, "Courier New", monospace',
	courier: '"Courier New", monospace'
};
const UI_FONT_OPTIONS = ["system", "inter", "segoe", "noto", "yahei"];
const CODE_FONT_OPTIONS = ["system", "cascadia", "cascadiaMono", "consolas", "courier"];
const LEGACY_CODE_FONT_ALIASES = { jetbrains: "cascadiaMono", fira: "consolas", source: "courier" };

function normalizeCodeFont(id) {
	const normalized = LEGACY_CODE_FONT_ALIASES[id] ?? id;
	return Object.hasOwn(CODE_FONT_STACKS, normalized) ? normalized : "system";
}

function getPanelFontPrefs() {
	try {
		const saved = JSON.parse(localStorage.getItem(MONACO_FONT_KEY) || "{}");
		return {
			ui: Object.hasOwn(UI_FONT_STACKS, saved.ui) ? saved.ui : "system",
			code: normalizeCodeFont(saved.code)
		};
	} catch { return { ui: "system", code: "system" }; }
}

function getPanelFontStyle() {
	const prefs = getPanelFontPrefs();
	return { "--dgp-font-ui": UI_FONT_STACKS[prefs.ui], "--dgp-font-mono": CODE_FONT_STACKS[prefs.code] };
}

function setPanelFonts(ui, code) {
	const previous = getPanelFontPrefs();
	const prefs = {
		ui: Object.hasOwn(UI_FONT_STACKS, ui) ? ui : previous.ui,
		code: normalizeCodeFont(code)
	};
	try { localStorage.setItem(MONACO_FONT_KEY, JSON.stringify(prefs)); } catch { /* ignore */ }
	const root = document.querySelector(".dgp-root");
	// Apply the requested values directly as well as persisting them. If browser
	// storage is unavailable, the current panel must still react immediately.
	if (root) {
		root.style.setProperty("--dgp-font-ui", UI_FONT_STACKS[prefs.ui]);
		root.style.setProperty("--dgp-font-mono", CODE_FONT_STACKS[prefs.code]);
	}
	try { document.dispatchEvent(new CustomEvent(FONT_EVENT)); } catch { /* non-DOM */ }
}

function resolveMonacoFontFamily() {
	const prefs = getPanelFontPrefs();
	if (prefs.code !== "system") return CODE_FONT_STACKS[prefs.code];
	try {
		const hostFont = getComputedStyle(document.body).getPropertyValue("--dsw-font-mono").trim();
		if (hostFont) return hostFont;
	} catch { /* use fallback */ }
	return 'ui-monospace, "SFMono-Regular", Consolas, monospace';
}

function isDshDark() {
	try { return typeof document !== "undefined" && document.body?.hasAttribute("data-ds-dark-theme"); } catch { return true; }
}

// ── theme-aware diff palette ──────────────────────────────────────────────────
const DIFF_DEL_DARK = "#F0787E";
const DIFF_DEL_LIGHT = "#D84E58";
const DIFF_ADD_DARK = "#76A8F7";
const DIFF_ADD_LIGHT = "#3975D6";

function makeThemeRules(colors) {
	const token = (name, property, extra = {}) => ({ token: name, foreground: colors[property].slice(1), ...extra });
	return [
		token("comment", "comment", { fontStyle: "italic" }),
		token("keyword", "keyword"), token("string", "string"), token("number", "number"),
		token("type.identifier", "type"), token("function", "func"), token("delimiter", "fg"),
		{ token: "identifier", foreground: colors.fg.slice(1) }
	];
}

function makeDiffTheme(preset) {
	const { base, dark, highContrast, colors } = preset;
	const added = dark ? DIFF_ADD_DARK : DIFF_ADD_LIGHT;
	const removed = dark ? DIFF_DEL_DARK : DIFF_DEL_LIGHT;
	const lineAlpha = highContrast ? "24" : dark ? "14" : "0A";
	const textAlpha = highContrast ? "3E" : dark ? "26" : "1C";
	const gutterAlpha = dark ? "18" : "12";
	const transparent = "#00000000";
	return {
		base, inherit: true, rules: makeThemeRules(colors),
		colors: {
			"editor.background": colors.bg,
			"editor.foreground": colors.fg,
			"editorGutter.background": colors.bg,
			"editorLineNumber.foreground": colors.comment,
			"editorLineNumber.activeForeground": colors.fg,
			"editorCursor.foreground": colors.accent,
			"editor.selectionBackground": colors.selection,
			"editor.inactiveSelectionBackground": `${colors.selection}99`,
			"diffEditor.insertedLineBackground": `${added}${lineAlpha}`,
			"diffEditor.removedLineBackground": `${removed}${lineAlpha}`,
			"diffEditor.insertedTextBackground": `${added}${textAlpha}`,
			"diffEditor.removedTextBackground": `${removed}${textAlpha}`,
			"diffEditorGutter.insertedLineBackground": `${added}${gutterAlpha}`,
			"diffEditorGutter.removedLineBackground": `${removed}${gutterAlpha}`,
			"diffEditor.insertedLineBorder": transparent,
			"diffEditor.removedLineBorder": transparent,
			"diffEditor.insertedTextBorder": transparent,
			"diffEditor.removedTextBorder": transparent
		}
	};
}

/** Register derived themes (called once per Monaco load). */
function defineDshThemes(monaco) {
	for (const preset of MONACO_THEME_PRESETS) monaco.editor.defineTheme(`dsh-${preset.id}`, makeDiffTheme(preset));
	const dark = { ...MONACO_THEME_PRESETS[0], id: "dark", base: "vs-dark", dark: true, colors: MONACO_THEME_PRESETS[1].colors };
	const light = { ...MONACO_THEME_PRESETS[0], id: "light", colors: MONACO_THEME_PRESETS[0].colors };
	monaco.editor.defineTheme("dsh-dark", makeDiffTheme(dark));
	monaco.editor.defineTheme("dsh-light", makeDiffTheme(light));
}

function resolveMonacoTheme() {
	const pref = getMonacoThemePref();
	const family = pref === "auto" ? "vscode" : pref;
	const dark = isDshDark();
	const preset = MONACO_THEME_PRESETS.find((theme) =>
		MONACO_THEME_FAMILY_BY_PRESET[theme.id] === family && theme.dark === dark);
	return `dsh-${preset?.id ?? (dark ? "vs-dark" : "vs")}`;
}

function setMonacoTheme(pref) {
	const safePref = MONACO_THEMES.includes(pref) ? pref : MONACO_THEME_FAMILY_BY_PRESET[pref] ?? "auto";
	try { localStorage.setItem(MONACO_THEME_KEY, safePref); } catch { /* ignore */ }
	if (window.monaco?.editor) window.monaco.editor.setTheme(resolveMonacoTheme());
	try { document.dispatchEvent(new CustomEvent(THEME_EVENT)); } catch { /* non-DOM */ }
}

function getMonacoThemePref() {
	try {
		const pref = localStorage.getItem(MONACO_THEME_KEY);
		if (MONACO_THEMES.includes(pref)) return pref;
		return MONACO_THEME_FAMILY_BY_PRESET[pref] ?? "auto";
	} catch { return "auto"; }
}

function installDarkModeWatcher(monaco) {
	if (darkWatcherInstalled || typeof MutationObserver === "undefined" || !document.body) return;
	darkWatcherInstalled = true;
	new MutationObserver(() => {
		monaco.editor.setTheme(resolveMonacoTheme());
	}).observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme"] });
}

/**
 * Monaco workers load their entry script through a blob URL that imports the
 * sidecar's workerMain.js. The sidecar can idle-exit and restart on a new port
 * while this page stays alive, so repoint new workers whenever bootstrap has
 * refreshed the sidecar info. Keep prior blob URLs alive: an existing editor
 * may still have a worker starting from one of them.
 */
function configureMonacoAssets(base) {
	if (monacoAssetBase === base && monacoWorkerBlobUrl) return;
	monacoWorkerBlobUrl = URL.createObjectURL(new Blob([
		`self.MonacoEnvironment={baseUrl:'${base}/'};importScripts('${base}/vs/base/worker/workerMain.js');`
	], { type: "text/javascript" }));
	self.MonacoEnvironment = {
		...(self.MonacoEnvironment ?? {}),
		getWorkerUrl() { return monacoWorkerBlobUrl; }
	};
	monacoAssetBase = base;
	window.require?.config?.({ paths: { vs: base } });
}

/**
 * Load and configure Monaco once. Resolves to the `monaco` namespace or
 * rejects (callers must fall back). Worker strategy: the sidecar is a
 * DIFFERENT origin than the DSH web UI, and cross-origin `new Worker(url)`
 * is blocked — the classic workaround applies: hand Monaco a blob URL whose
 * script importScripts() the real cross-origin worker main.
 */
async function ensureMonaco() {
	const info = await bootstrapServiceInfo();
	if (!info) throw new Error("monaco unavailable: no direct sidecar connection");
	const base = `http://127.0.0.1:${info.port}/vendor/monaco/vs`;
	if (!monacoPromise) {
		monacoPromise = (async () => {
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
		// 2) Point Monaco and its workers at this sidecar instance. The port
		// can change after the sidecar's idle exit; ensureMonaco re-runs this
		// configuration against refreshed service info on later editor mounts.
		configureMonacoAssets(base);
		// 3) Core (workers/language chunks are pulled on demand from `vs`).
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
				// editor.main only includes JSON, CSS, HTML, and TypeScript. Load
				// Monaco's lazy basic-language registry too, otherwise extensions
				// such as XML/Java/Python are resolved as plaintext and theme token
				// colors never appear in their previews.
				req(["vs/basic-languages/monaco.contribution"], () => {
					done();
					res();
				}, (error) => {
					done();
					rej(new Error(`monaco language contribution failed to load: ${String(error)}`));
				});
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
	}
	const monaco = await monacoPromise;
	// A git RPC may have detected a stale sidecar and refreshed service-info
	// while Monaco was loading. Re-read the cached/current port before returning
	// so a worker never starts against the previous instance in that race.
	const current = await bootstrapServiceInfo();
	if (!current) throw new Error("monaco unavailable: sidecar info expired");
	configureMonacoAssets(`http://127.0.0.1:${current.port}/vendor/monaco/vs`);
	return monaco;
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
		compactMode: true,                // hide the unused original-line-number lane
		renderIndicators: true,
		glyphMargin: false,
		lineDecorationsWidth: 8,
		lineNumbersMinChars: 3,
		folding: false,
		automaticLayout: true,
		minimap: { enabled: false },
		scrollBeyondLastLine: false,
		fontSize: 12,
		lineHeight: 20,
		fontFamily: resolveMonacoFontFamily(),
		renderOverviewRuler: false,
		hideUnchangedRegions: { enabled: true, contextSize: 3 },
		diffCodeLens: false,
		scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
		theme: resolveMonacoTheme()
	});
	const orig = monaco.editor.createModel(parsed.original, lang);
	const mod = monaco.editor.createModel(parsed.modified, lang);
	ed.setModel({ original: orig, modified: mod });
	const onFontsChanged = () => {
		ed.updateOptions({ fontFamily: resolveMonacoFontFamily() });
		monaco.editor.remeasureFonts?.();
	};
	document.addEventListener(FONT_EVENT, onFontsChanged);
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
			document.removeEventListener(FONT_EVENT, onFontsChanged);
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
		fontFamily: resolveMonacoFontFamily(),
		tabSize: 2,
		lineNumbers: "on",
		renderWhitespace: "selection",
		scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
		theme: resolveMonacoTheme()
	});
	const onFontsChanged = () => {
		ed.updateOptions({ fontFamily: resolveMonacoFontFamily() });
		monaco.editor.remeasureFonts?.();
	};
	document.addEventListener(FONT_EVENT, onFontsChanged);
	// NOTE: no per-keystroke onChange — the only consumer (inline editing)
	// reads getValue() at save time; serializing the whole doc per keystroke
	// would be O(n) on every key for large files.
	return {
		getValue() { return ed.getValue(); },
		dispose() {
			document.removeEventListener(FONT_EVENT, onFontsChanged);
			const model = ed.getModel();
			ed.dispose();
			model?.dispose();
		}
	};
}
