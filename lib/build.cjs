/**
 * build.js — dsh-files-git browser-bundle assembler.
 *
 * The runtime ModuleLoader accepts exactly ONE bundle per plugin id and its
 * `require` only resolves platform seeds / registered factories — relative
 * requires are impossible. So the plugin source lives as readable fragments
 * under lib/src/ (shared factory scope, order matters) and this script
 * stitches them back into the single self-contained lib/client.js bundle.
 *
 * Usage: node build.js            (split current bundle → src/, then rebuild)
 *        node build.js --rebuild  (only rebuild client.js from src/, no split)
 */
const fs = require("fs");
const path = require("path");

const LIB = __dirname;
const SRC = path.join(LIB, "src");
const BUNDLE = path.join(LIB, "client.js");
const INJECT = path.join(LIB, "inject");

// Bundle head: platform deps live in the factory scope shared by all parts.
const HEAD = `window.__ModuleLoader__.load({
	id: "dsh-files-git",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region head · platform deps (require/seed words only)
		const React = require("react");
		const { useState, useEffect, useCallback, useMemo, useRef, useSyncExternalStore } = React;
		const h = React.createElement;
		const ReactDOM = (() => { try { return require("react-dom"); } catch (e) { return null; } })();
		//#endregion
`;

const FOOT = `		return module.exports;
	}
});
`;

/**
 * Fragment table: [src filename, first line (1-based), last line (inclusive)]
 * of the CURRENT lib/client.js, in dependency order (they share one scope, so
 * a part may reference names declared by any earlier part).
 */
const PARTS = [
	["styles.js", 32, 326],
	["icons.js", 328, 373],
	["store.js", 375, 420],
	["i18n.js", 422, 730],
	["utils.js", 732, 810],
	["triggers.js", 812, 870],
	["hooks.js", 872, 1063],
	["diffutil.js", 1065, 1140],
	["ui.js", 1142, 1431],
	["gitview.js", 1433, 1660],
	["editor.js", 1662, 1786],
	["filebrowser.js", 1788, 2357],
	["overlay.js", 2359, 2553],
	["index.js", 2555, 2584],
];

/** First-line marker per fragment, used as a cheap sanity assertion. */
const HEADS = {
	"styles.js": "// ── inject one <style>",
	"icons.js": "// ── inlined DSH icons",
	"store.js": "// ── service bridges",
	"i18n.js": "// ── i18n: follow DSH locale",
	"utils.js": "// ── RPC",
	"triggers.js": "// ── Session-header trigger capsule",
	"hooks.js": "// ── git state hook",
	"diffutil.js": "// ── module-level diff helpers",
	"ui.js": "// ── memoized sub-views",
	"gitview.js": "// ── Branch selector",
	"editor.js": "// ── CodeMirror 6 editor (lazy-loaded from CDN",
	"filebrowser.js": "// ── file browser tab",
	"overlay.js": "// ── panel body: header + tabs",
	"index.js": "/** Required client services: slot registry",
};

/** Last-line marker per fragment (optional), another cheap sanity assertion. */
const TAILS = {
	"index.js": "exports.inject = inject;",
};

function splitOnce() {
	const lines = fs.readFileSync(BUNDLE, "utf8").replace(/\r\n/g, "\n").split("\n");
	if (!fs.existsSync(SRC)) fs.mkdirSync(SRC, { recursive: true });
	for (const [name, from, to] of PARTS) {
		const slice = lines.slice(from - 1, to);
		if (slice.length !== to - from + 1) throw new Error(`split ${name}: line count mismatch (${slice.length} != ${to - from + 1})`);
		const head = HEADS[name];
		const first = slice[0] || "";
		if (!first.includes(head)) throw new Error(`split ${name}: first line mismatch — got "${first.slice(0, 60)}", want "${head}"`);
		const tail = TAILS[name];
		const last = slice[slice.length - 1] || "";
		if (tail && !last.includes(tail)) throw new Error(`split ${name}: last line mismatch — got "${last.slice(0, 60)}", want "${tail}"`);
		fs.writeFileSync(path.join(SRC, name), slice.join("\n") + "\n", "utf8");
	}
	console.log(`split: ${PARTS.length} fragments written to ${SRC}`);
}

function assemble() {
	const body = [];
	for (const [name] of PARTS) {
		const frag = fs.readFileSync(path.join(SRC, name), "utf8").replace(/\r\n/g, "\n").replace(/\n+$/, "\n");
		body.push(`		//#region ${name.replace(/\.js$/, "")}\n${frag}		//#endregion\n`);
	}
	const out = HEAD + body.join("\n") + FOOT;
	fs.writeFileSync(BUNDLE, out, "utf8");
	console.log(`build: ${BUNDLE} assembled (${PARTS.length} parts, ${out.split("\n").length} lines)`);
}

if (process.argv.includes("--rebuild")) {
	assemble();
} else {
	splitOnce();
	assemble();
}
