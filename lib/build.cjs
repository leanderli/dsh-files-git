/**
 * build.js — dsh-files-git browser-bundle assembler.
 *
 * The runtime ModuleLoader accepts exactly ONE bundle per plugin id and its
 * `require` only resolves platform seeds / registered factories — relative
 * requires are impossible. So the plugin source lives as readable fragments
 * under lib/src/ (shared factory scope, order matters) and this script
 * stitches them back into the single self-contained lib/client.js bundle.
 *
 * Fragment boundaries are located by the `//#region <name>` / `//#endregion`
 * markers this script itself writes into the bundle — NOT by hard-coded line
 * numbers. Editing any fragment changes the bundle's line layout, and a stale
 * line table would silently mis-slice the sources back out on the next split.
 *
 * Usage: node build.js            (split current bundle → src/, then rebuild)
 *        node build.js --rebuild  (only rebuild client.js from src/, no split)
 */
const fs = require("fs");
const path = require("path");

const LIB = __dirname;
const SRC = path.join(LIB, "src");
const BUNDLE = path.join(LIB, "client.js");

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
		// Portal helper for the portal call sites in the fragments: react-dom
		// is normally present, but the require above may yield null (a platform
		// without the seed). Falling back to IN-PLACE rendering degrades the
		// portaled popovers/menus to non-floating instead of crashing the whole
		// panel with a TypeError on the null deref.
		const portal = (children, container) => (ReactDOM && typeof ReactDOM.createPortal === "function" ? ReactDOM.createPortal(children, container) : children);
		//#endregion
`;

const FOOT = `		return module.exports;
	}
});
`;

/**
 * Fragment table: just the ordered part names (region markers in the bundle
 * carry the line boundaries). A part may reference names declared by any
 * earlier part — the order below is the declaration order.
 */
const PARTS = [
	"styles.js",
	"icons.js",
	"store.js",
	"i18n.js",
	"utils.js",
	"triggers.js",
	"hooks.js",
	"diffutil.js",
	"ui.js",
	"gitview.js",
	"monaco.js",
	"filebrowser.js",
	"overlay.js",
	"index.js"
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
	"monaco.js": "// ── Monaco editor (locally hosted by the sidecar",
	"filebrowser.js": "// ── file browser tab",
	"overlay.js": "// ── panel body: header + tabs",
	"index.js": "/** Required client services: slot registry",
};

/** Last-line marker per fragment (optional), another cheap sanity assertion. */
const TAILS = {
	"index.js": "exports.inject = inject;",
};

/** Map every `//#region <name>` → [start, end) content lines in the bundle.
 * Markers may sit on their own line (`//#region x` / `//#endregion`) or be
 * glued to a content line (`}		//#endregion`) — both layouts are accepted,
 * so the split survives bundles assembled from fragments that lost their
 * trailing newline. */
function regionSpans(lines) {
	const spans = new Map();
	let cur = null;
	let start = 0;
	for (let i = 0; i < lines.length; i++) {
		const m = /\/\/#region\s+(.+?)\s*$/.exec(lines[i]);
		if (m) { cur = m[1].trim(); start = i + 1; continue; }
		if (/\/\/#endregion\s*$/.test(lines[i])) {
			if (cur) spans.set(cur, [start, i]);
			cur = null;
		}
	}
	return spans;
}

/** Extract the content lines of the region that starts at `startIdx` (the
 * line right after `//#region <name>`), up to and including the endregion
 * marker line. When the marker is glued to content (`}		//#endregion`),
 * the content prefix is kept and the marker suffix stripped — so a region
 * whose last line shares the marker line round-trips without losing bytes. */
function regionContent(lines, startIdx) {
	const out = [];
	for (let i = startIdx; i < lines.length; i++) {
		const m = /(.*)\/\/#endregion\s*$/.exec(lines[i]);
		if (m) {
			const content = m[1].replace(/\s+$/, "");
			if (content !== "") out.push(content);
			return out;
		}
		out.push(lines[i]);
	}
	return out;
}

function splitOnce() {
	const lines = fs.readFileSync(BUNDLE, "utf8").replace(/\r\n/g, "\n").split("\n");
	if (!fs.existsSync(SRC)) fs.mkdirSync(SRC, { recursive: true });
	const spans = regionSpans(lines);
	for (const name of PARTS) {
		const span = spans.get(name.replace(/\.js$/, ""));
		if (!span) throw new Error(`split ${name}: //#region ${name.replace(/\.js$/, "")} not found in ${BUNDLE}`);
		// Content slice, normalized to end with exactly one newline.
		const slice = regionContent(lines, span[0]).join("\n").replace(/\n+$/, "") + "\n";
		if (slice.split("\n").length < 2 || slice.trim() === "") throw new Error(`split ${name}: empty or degenerate slice`);
		const head = HEADS[name];
		if (!slice.split("\n")[0].includes(head)) throw new Error(`split ${name}: first line mismatch — got "${slice.split("\n")[0].slice(0, 60)}", want "${head}"`);
		const tail = TAILS[name];
		if (tail && !slice.trimEnd().endsWith(tail)) throw new Error(`split ${name}: last line mismatch — got "${slice.trimEnd().slice(-60)}", want "${tail}"`);
		fs.writeFileSync(path.join(SRC, name), slice, "utf8");
	}
	console.log(`split: ${PARTS.length} fragments written to ${SRC}`);
}

function assemble() {
	const body = [];
	for (const name of PARTS) {
		// Strip trailing newlines from the fragment, then emit the endregion
		// marker on its OWN line — content stays byte-exact and the region
		// layout is stable no matter how the fragment file ends.
		const frag = fs.readFileSync(path.join(SRC, name), "utf8").replace(/\r\n/g, "\n").replace(/\n+$/, "");
		body.push(`		//#region ${name.replace(/\.js$/, "")}\n${frag}\n		//#endregion\n`);
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
