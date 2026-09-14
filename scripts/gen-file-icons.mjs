/**
 * gen-file-icons.mjs — regenerate lib/src/fileicons.js from the
 * `@iconify-json/vscode-icons` set (the VS Code "vscode-icons" artwork).
 *
 * WHY this is a build-time codegen instead of a runtime import:
 * the client half of this plugin is a SINGLE self-contained bundle assembled by
 * lib/build.cjs, and the runtime ModuleLoader's `require` only resolves platform
 * seeds — an npm icon package could never be required from the bundle. Emitting
 * the icons as a source fragment keeps the bundle offline-capable and
 * dependency-free at runtime; `@iconify-json/vscode-icons` is a devDependency.
 *
 * The name table is EXPLICIT on purpose: an earlier fuzzy match silently bound
 * `js` to `file-type-dotjs`. Every name is therefore validated and a missing one
 * aborts generation, so the plugin can never ship a broken mapping.
 *
 * Usage: node scripts/gen-file-icons.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "node_modules", "@iconify-json", "vscode-icons", "icons.json");
const OUT = join(ROOT, "lib", "src", "fileicons.js");

/** Our type key → exact iconify name. Keys are referenced by filebrowser.js. */
const TABLE = {
	ts: "file-type-typescript", js: "file-type-js", py: "file-type-python",
	rs: "file-type-rust", go: "file-type-go", java: "file-type-java",
	c: "file-type-c", cpp: "file-type-cpp", cs: "file-type-csharp",
	kt: "file-type-kotlin", swift: "file-type-swift", rb: "file-type-ruby",
	php: "file-type-php", lua: "file-type-lua", dart: "file-type-dartlang",
	r: "file-type-r", scala: "file-type-scala", sh: "file-type-shell",
	vue: "file-type-vue", svelte: "file-type-svelte", graphql: "file-type-graphql", cmake: "file-type-cmake", sql: "file-type-sql",
	md: "file-type-markdown", txt: "file-type-text", log: "file-type-log",
	json: "file-type-json", yml: "file-type-yaml", toml: "file-type-toml",
	ini: "file-type-ini", xml: "file-type-xml", xls: "file-type-excel",
	csv: "file-type-excel", pdf: "file-type-pdf2", zip: "file-type-zip",
	img: "file-type-image", aud: "file-type-audio", vid: "file-type-video",
	font: "file-type-font", html: "file-type-html", css: "file-type-css",
	docker: "file-type-docker", env: "file-type-dotenv", git: "file-type-git",
	lic: "file-type-license", lock: "file-type-npm",
	fallback: "default-file"
};

const set = JSON.parse(readFileSync(SRC, "utf8"));
const icons = set.icons ?? {};
const missing = Object.entries(TABLE).filter(([, name]) => !icons[name]).map(([key, name]) => `${key}→${name}`);
if (missing.length > 0) {
	console.error(`gen-file-icons: ${missing.length} icon name(s) missing from @iconify-json/vscode-icons:\n  ${missing.join("\n  ")}`);
	process.exit(1);
}

/** Strip the wrapper-free body and normalize it for inline use.
 * `currentColor` is left alone; vscode-icons artwork carries its own brand fills.
 *
 * Several bodies carry hardcoded ids (`<defs><linearGradient id="SVGCgNrzdsa">`
 * plus `url(#…)` references). Two copies of such an icon in ONE document make
 * the second reference resolve into the first copy's defs — wrong gradient, or
 * a blank shape once the first copy unmounts. DSH namespaces its own inlined
 * icons for exactly this reason, so every id AND every reference to it is
 * rewritten to a token that `fileIconFor` substitutes with a per-instance id. */
const TOKEN = "__DGPICON__";
const cleanBody = (name) => {
	const { body, width, height } = icons[name];
	let s = String(body).replace(/\s+/g, " ").trim();
	const ids = [...new Set([...s.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]))];
	for (const id of ids) {
		const esc = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		s = s.replace(new RegExp(`\\bid="${esc}"`, "g"), `id="${TOKEN}${id}"`);
		s = s.replace(new RegExp(`url\\(#${esc}\\)`, "g"), `url(#${TOKEN}${id})`);
		s = s.replace(new RegExp(`href="#${esc}"`, "g"), `href="#${TOKEN}${id}"`);
	}
	return {
		body: s,
		width: width ?? set.width ?? 32,
		height: height ?? set.height ?? 32,
		namespaced: ids.length > 0
	};
};

/** One entry per DISTINCT icon (several type keys share artwork). */
const distinct = [...new Set(Object.values(TABLE))].sort();
let namespacedCount = 0;
const entries = distinct.map((name) => {
	const { body, width, height, namespaced } = cleanBody(name);
	if (namespaced) namespacedCount += 1;
	return `\t\t${JSON.stringify(name)}: { w: ${width}, h: ${height}, body: ${JSON.stringify(body)} }`;
});

const keyMap = Object.entries(TABLE).map(([key, name]) => `\t\t\t${key}: ${JSON.stringify(name)}`);

const out = `\t\t// ── file-type icons (GENERATED — do not edit by hand) ────────────────────
\t\t// Source: @iconify-json/vscode-icons (the VS Code "vscode-icons" artwork,
\t\t// MIT). Regenerate with: node scripts/gen-file-icons.mjs
\t\t// Each entry is an inline SVG body plus its intrinsic viewBox, so the icons
\t\t// need no network and no runtime dependency — the plugin stays a single
\t\t// self-contained bundle. Bodies that define ids carry the ${TOKEN} token
\t\t// instead: fileIconFor swaps it for a per-instance id (see the generator).
\t\tconst FILE_ICON_ART = {
${entries.join(",\n")}
\t\t};
\t\t// Our type key → artwork key. filebrowser.js owns extension/filename → key.
\t\tconst FILE_ICON_KEY = {
${keyMap.join(",\n")}
\t\t};
\t\tconst FILE_ICON_TOKEN = ${JSON.stringify(TOKEN)};
\t\t// One component per DISTINCT artwork, cached forever: call sites render
\t\t// inside row components, and a fresh component identity per call would
\t\t// remount the <svg> (re-parsing its dangerouslySetInnerHTML body and
\t\t// regenerating the useId) on every re-render — per keystroke while the
\t\t// file search box filters. useId stays per-mounted-instance, so caching
\t\t// the component keeps every instance's id stable across re-renders.
\t\tconst FILE_ICON_CACHE = new Map();
\t\t/**
\t\t * Render one file-type icon.
\t\t * @param key - type key from filebrowser.js (unknown keys fall back to the generic file art).
\t\t * @returns component taking { size, className, style }; stable per artwork key.
\t\t */
\t\tfunction fileIconFor(key) {
\t\t\tconst artKey = FILE_ICON_KEY[key] ?? FILE_ICON_KEY.fallback;
\t\t\tconst cached = FILE_ICON_CACHE.get(artKey);
\t\t\tif (cached) return cached;
\t\t\tconst art = FILE_ICON_ART[artKey];
\t\t\tconst Icon = ({ size = 16, className, style }) => {
\t\t\t\t// useId is collision-free per mounted instance. Its format changed
\t\t\t\t// between React majors (':' in v18), and while any id is legal HTML,
\t\t\t\t// url(#…) fragment references are safest on a URL-safe charset —
\t\t\t\t// strip everything else so the substitution survives host upgrades.
\t\t\t\tconst unique = \`\${useId().replace(/[^A-Za-z0-9_-]/g, "")}i\`;
\t\t\t\tconst body = art.body.includes(FILE_ICON_TOKEN) ? art.body.split(FILE_ICON_TOKEN).join(unique) : art.body;
\t\t\t\treturn h("svg", {
\t\t\t\t\twidth: size, height: size, viewBox: \`0 0 \${art.w} \${art.h}\`,
\t\t\t\t\txmlns: "http://www.w3.org/2000/svg", className, style, "aria-hidden": "true",
\t\t\t\t\tdangerouslySetInnerHTML: { __html: body }
\t\t\t\t});
\t\t\t};
\t\t\tFILE_ICON_CACHE.set(artKey, Icon);
\t\t\treturn Icon;
\t\t}
`;
writeFileSync(OUT, out, "utf8");
const bytes = Buffer.byteLength(out, "utf8");
console.log(`gen-file-icons: ${distinct.length} icons (${namespacedCount} id-namespaced), ${Object.keys(TABLE).length} type keys → ${OUT}`);
console.log(`  fragment ${(bytes / 1024).toFixed(1)} KB raw (gzip ≈ ${(bytes / 1024 / 3).toFixed(0)} KB)`);
