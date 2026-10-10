// Exercise the built plugin's actual components with deterministic hook/transport
// scheduling. No copied resolver/list implementation and no new runtime dependency.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const bundle = readFileSync(new URL("../lib/client.js", import.meta.url), "utf8");
const tick = () => new Promise(setImmediate);
function deferred() {
	let resolve, reject;
	const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
	return { promise, resolve, reject };
}
function harness(rpc = async () => ({}), options = {}) {
	let slots = [], cursor = 0, effects = [], dirty = false, output;
	const state = (value) => {
		const i = cursor++;
		if (!slots[i]) slots[i] = { value: typeof value === "function" ? value() : value };
		return [slots[i].value, (next) => {
			const value = typeof next === "function" ? next(slots[i].value) : next;
			if (!Object.is(value, slots[i].value)) { slots[i].value = value; dirty = true; }
		}];
	};
	const memo = (fn, deps) => {
		const i = cursor++, old = slots[i];
		if (!old || !deps || deps.some((d, j) => !Object.is(d, old.deps[j]))) slots[i] = { value: fn(), deps };
		return slots[i].value;
	};
	const effect = (fn, deps) => {
		const i = cursor++, old = slots[i];
		if (!old || !deps || deps.some((d, j) => !Object.is(d, old.deps[j]))) {
			slots[i] = { deps, cleanup: old?.cleanup };
			effects.push(() => { slots[i].cleanup?.(); slots[i].cleanup = fn(); });
		}
	};
	const react = {
		useState: state, useRef: (value) => memo(() => ({ current: value }), []),
		useMemo: memo, useCallback: (fn, deps) => memo(() => fn, deps), useEffect: effect,
		useSyncExternalStore: (_subscribe, read) => read(), useId: () => "test-id",
		memo: (fn) => fn, Component: class {}, Fragment: "fragment",
		createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false) })
	};
	let api, onPush;
	const timers = new Map(), hosts = new Map();
	const workerBlobs = new Map();
	let timerId = 0;
	const schedule = (fn, delay = 0) => { const id = ++timerId; if (options.timers) timers.set(id, { fn, delay }); return id; };
	const cancel = (id) => timers.delete(id);
	const storage = new Map(options.initialFonts ? [["dgp.monacoFonts", options.initialFonts]] : []);
	const listeners = new Map(), rootStyles = new Map();
	const context = vm.createContext({
		console, fetch: options.apiRpc ? async (url, init) => ({ ok: true, json: async () => ({ type: "server-response", result: await options.apiRpc(url, JSON.parse(init.body)) }) }) : undefined, URL: options.workerAssets ? class extends URL {
			static createObjectURL(blob) { const url = `blob:test-${workerBlobs.size}`; workerBlobs.set(url, blob); return url; }
		} : URL, Blob, Worker: class { constructor(url) { this.url = url; } }, AbortController, AbortSignal, TextEncoder, TextDecoder,
		CustomEvent: class { constructor(type) { this.type = type; } },
		localStorage: {
			getItem: (key) => { if (options.blockStorage) throw new Error("storage blocked"); return storage.get(key) ?? null; },
			setItem: (key, value) => { if (options.blockStorage) throw new Error("storage blocked"); storage.set(key, value); }
		},
		setTimeout: schedule, clearTimeout: cancel, testRpc: rpc,
		testSubscribe: async (_repo, listener) => { onPush = listener; return null; },
		window: { innerWidth: 1600, innerHeight: 900, __ModuleLoader__: { load: ({ factory }) => {
			api = factory((name) => { if (name === "react") return react; if (name === "react-dom" && options.portals) return { createPortal: (content, host) => ({ type: "portal", props: { host }, children: [content] }) }; throw new Error(`no seed ${name}`); });
		} }, addEventListener() {}, removeEventListener() {}, setTimeout: schedule, clearTimeout: cancel }
	});
	const instrumented = bundle.replace("const gitRpc = (", "const originalGitRpc = (").replace("return module.exports;", `
		const gitRpc = globalThis.testRpc;
		subscribeStatus = globalThis.testSubscribe;
		return { ...module.exports, InputLeftTrigger: typeof InputLeftTrigger === "function" ? InputLeftTrigger : undefined, workspaceCwdOf, currentSessionIdOf, FileRow, FileBrowser, FilePanelBody, overlayStore,
			IconFolderClose, IconFolderOpen, IconBranch, IconListChecks: typeof IconListChecks === "function" ? IconListChecks : undefined, WindowedList, listWindow, ChangeList, useGit,
			ToolbarMenu, GitView, HistoryBlock, DiffPane, CommitDetailView, ConfirmDialog, CommitBox, narrowStore,
			getPanelFontPrefs, getPanelFontStyle, setPanelFonts, setPanelFontSizes, monacoFontOptions, SettingsView, DsSelect,
			mountMonacoEditor, mountMonacoDiff, renderMarkdown, expensivePreviewText, openReqStore,
			configureMonacoAssets, MONACO_WORKER_ENTRIES,
			getWorkerForTest: (label) => self.MonacoEnvironment.getWorker(null, label),
			overrideWorkerFactoryForTest: () => { self.MonacoEnvironment = { getWorker: () => { throw new Error("stale bundled factory"); } }; },
			setMonacoForTest: (monaco) => { window.monaco = monaco; ensureMonaco = async () => monaco; },
			setMonacoLoaderForTest: (loader) => { ensureMonaco = loader; },
			setServices: (sessions, workspaces) => { sessionsService = sessions; workspacesService = workspaces; },
			cwdOf, cwdOfSession };
	`);
	vm.runInContext(instrumented, context);
	context.self = context.window;
	context.document = {
		visibilityState: "visible", body: { hasAttribute: () => false },
		querySelector: (selector) => selector === ".dgp-dialog" && options.dialogBounds ? { getBoundingClientRect: () => options.dialogBounds } : options.panelRoot && selector === ".dgp-root" ? { style: { setProperty: (key, value) => rootStyles.set(key, value) } } : null,
		addEventListener(type, callback) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(callback); },
		removeEventListener(type, callback) { listeners.get(type)?.delete(callback); },
		dispatchEvent(event) { for (const callback of listeners.get(event.type) ?? []) callback(event); }
	};
	return {
		api, storage, rootStyles, workerBlobs, document: context.document,
		runTimer(delay) {
			const entry = [...timers].find(([, timer]) => timer.delay === delay);
			if (!entry) return false;
			timers.delete(entry[0]); entry[1].fn(); return true;
		},
		render(fn, props) {
			for (let pass = 0; pass < 30; pass++) {
				cursor = 0; dirty = false; effects = [];
				output = fn(props);
				if (options.attachEditorHost) {
					const host = find(output, (node) => node.props.className === "dgp-editorHost");
					for (const ref of hosts.keys()) if (ref !== host?.props.ref) ref.current = null;
					if (host?.props.ref) {
						if (!hosts.has(host.props.ref)) hosts.set(host.props.ref, {});
						host.props.ref.current = hosts.get(host.props.ref);
					}
				}
				if (options.dialogButtons) {
					const dialog = find(output, (node) => node.props.className === "dgp-confirm");
					if (dialog?.props.ref) dialog.props.ref.current = { querySelector: () => options.dialogButtons[0], querySelectorAll: () => options.dialogButtons };
				}
				for (const run of effects) run();
				if (!dirty) return output;
			}
			throw new Error("render loop");
		},
		unmount() { for (const slot of slots) slot?.cleanup?.(); },
		push: (status) => onPush(status)
	};
}
function find(node, predicate) {
	if (!node || typeof node !== "object") return undefined;
	if (predicate(node)) return node;
	for (const child of node.children ?? []) { const hit = find(child, predicate); if (hit) return hit; }
}
function assertDirectoryAnchor(env, node, searching) {
	const context = find(node, (n) => n.props.className?.split(" ").includes("dgp-directoryContext"));
	assert.ok(context, "directory controls share a stable context in both search states");
	const [path, actions] = context.children;
	assert.equal(path.props.className, "dgp-contextPath", "complete path precedes every directory/search control");
	assert.equal(actions.props.className, "dgp-contextActions");
	assert.ok(find(path, (n) => n.props.className === "dgp-crumbs dgp-crumbsInline"), "search keeps breadcrumbs beside the workspace title");
	assert.equal(find(path, (n) => n.type === env.api.ToolbarMenu), undefined, "directory controls cannot split the breadcrumb path");
	assert.equal(actions.children.length, 1, "directory controls stay grouped before Git navigation");
	assert.equal(actions.children[0].type, env.api.ToolbarMenu);
	assert.equal(actions.children[0].props.label, "目录操作", "directory menu stays with the path context");
	const searchSlot = find(node, (n) => n.props.className === "dgp-fileSearchSlot");
	assert.ok(searchSlot, "file search has its own trailing header slot");
	if (searching) assert.ok(find(searchSlot, (n) => n.props.className === "dgp-searchRow"));
	else assert.ok(find(searchSlot, (n) => n.type === "button" && n.props.title === "搜索当前目录…"));
	const toolbar = find(node, (n) => n.props.className === "dgp-pageToolbar dgp-directoryToolbar" || n.props.className === "dgp-pageToolbar dgp-fileToolbar");
	const navigation = find(toolbar, (n) => n.props.className === "dgp-tab dgp-pageNavGit");
	if (navigation) {
		const divider = find(toolbar, (n) => n.props.className === "dgp-toolbarDivider");
		assert.ok(toolbar.children.indexOf(context) < toolbar.children.indexOf(divider));
		assert.ok(toolbar.children.indexOf(divider) < toolbar.children.indexOf(navigation));
		assert.ok(toolbar.children.indexOf(navigation) < toolbar.children.indexOf(searchSlot));
	}
	const file = find(context, (n) => n.props.className === "dgp-previewName");
	if (file) assert.equal(path.children.at(-1), file, "preview filename completes the path before the directory menu");
}
const ws = { phase: "ready", items: [
	{ workspaceId: "a", path: "D:/A", sessionIds: ["sa"] },
	{ workspaceId: "b", path: "D:/B", sessionIds: ["sb"] }
] };

test("blank-session file trigger uses the composer's left-control end slot", () => {
	assert.ok(bundle.includes('ctx.slots.register({ name: "conversation.input.left", id: "files-git", order: 50 }, InputLeftTrigger)'), "the trigger registers at the end of the left control group");
	assert.ok(!bundle.includes('ctx.slots.register({ name: "conversation.input.right", id: "files-git"'), "the trigger is not placed in the trailing group");
	assert.ok(!bundle.includes('ctx.slots.register({ name: "conversation.input.dock", id: "files-git"'), "the trigger no longer shares the floating dock row");
	assert.ok(!bundle.includes(".dgp-dockRow{"), "the old overlay-row styling is removed");
	const env = harness();
	const props = { useSession: (select) => select({ blank: true, composerPhase: "blank" }) };
	const button = find(env.render(env.api.InputLeftTrigger, props), (node) => node.type === "button");
	assert.ok(button, "the button remains visible for a blank session");
	assert.match(button.props.className, /dgp-triggerCompact/);
	assert.ok(button.props.title);
	assert.ok(button.props["aria-label"]);
	assert.equal(find(button, (node) => node.type === "span"), undefined, "compact mode keeps only the folder icon, avoiding the floating pet's text collision area");
	button.props.onClick();
	assert.equal(find(env.render(env.api.InputLeftTrigger, props), (node) => node.type === "button").props["data-active"], "true", "the compact trigger still toggles the panel");
	assert.equal(env.render(env.api.InputLeftTrigger, { useSession: (select) => select({ blank: false, composerPhase: "active" }) }), null, "active sessions continue to use the header trigger");
	env.unmount();
});

test("toolbar menus clamp to the dialog, restore focus, navigate enabled actions and release listeners", () => {
	const env = harness(undefined, { dialogBounds: { left: 10, top: 10, right: 330, bottom: 200 } });
	let ran = 0, restored = 0;
	const props = { label: "目录操作", items: [
		{ label: "disabled", disabled: true, run() {} },
		{ label: "multi", checked: true, run: () => ran++ }
	] };
	const render = () => env.render(env.api.ToolbarMenu, props);
	let node = render(), trigger = find(node, (n) => n.type === "button");
	trigger.props.ref.current = { focus: () => restored++, contains: () => false };
	trigger.props.onKeyDown({ key: "ArrowDown", preventDefault() {}, stopPropagation() {}, currentTarget: { getBoundingClientRect: () => ({ right: 325, bottom: 195 }) } });
	node = render();
	const menu = find(node, (n) => n.props.role === "menu");
	assert.ok(menu.props.style.left >= 18);
	assert.ok(menu.props.style.left + menu.props.style.width <= 322);
	assert.equal(menu.props.style.height, undefined, "menu uses natural height rather than an item-count estimate");
	assert.ok(900 - menu.props.style.bottom - menu.props.style.maxHeight >= 18);
	assert.ok(900 - menu.props.style.bottom <= 192, "menu flips above a trigger close to the dialog bottom");
	const disabled = find(menu, (n) => n.props.disabled);
	assert.equal(disabled.props.disabled, true);
	const action = find(menu, (n) => n.props.role === "menuitemcheckbox");
	assert.equal(action.props["aria-checked"], true);
	let focused = 0;
	menu.props.ref.current = { querySelector: () => null, querySelectorAll: () => [{ focus: () => focused++ }], contains: () => false };
	menu.props.onKeyDown({ key: "Home", preventDefault() {} });
	assert.equal(focused, 1);
	action.props.onClick();
	assert.equal(ran, 1); assert.equal(restored, 1);
	assert.equal(find(render(), (n) => n.props.role === "menu"), undefined);
	trigger = find(render(), (n) => n.type === "button");
	trigger.props.onClick({ preventDefault() {}, stopPropagation() {}, currentTarget: { getBoundingClientRect: () => ({ right: 200, bottom: 40 }) } });
	render();
	env.document.dispatchEvent({ type: "keydown", key: "Escape", preventDefault() {} });
	assert.equal(find(render(), (n) => n.props.role === "menu"), undefined);
	assert.equal(restored, 2);
	env.unmount();
	env.document.dispatchEvent({ type: "keydown", key: "Escape", preventDefault() {} });
	assert.equal(restored, 2, "unmount removes the document listener");
});

test("only one pane toolbar menu stays open and outside clicks dismiss it", () => {
	const env = harness();
	const props = { label: "menu", items: [{ label: "action", run() {} }] };
	const render = () => env.render(() => ({ props: {}, children: [env.api.ToolbarMenu(props), env.api.ToolbarMenu(props)] }));
	const open = (node) => find(node, (n) => n.type === "button").props.onClick({ preventDefault() {}, stopPropagation() {}, currentTarget: { getBoundingClientRect: () => ({ right: 200, bottom: 40 }) } });
	open(render().children[0]);
	let node = render();
	assert.ok(find(node.children[0], (n) => n.props.role === "menu"));
	open(node.children[1]); node = render();
	assert.equal(find(node.children[0], (n) => n.props.role === "menu"), undefined);
	assert.ok(find(node.children[1], (n) => n.props.role === "menu"));
	env.document.dispatchEvent({ type: "mousedown", target: {} });
	assert.equal(find(render(), (n) => n.props.role === "menu"), undefined);
	env.unmount();
});

test("Git header owns repository actions; normal push is safe and force push requires confirmation", async () => {
	const calls = [], env = harness(async (method, payload) => { calls.push({ method, payload }); return {}; });
	const git = {
		cwd: "D:/B", busy: null, readBusy: null, force: true, rebase: false,
		status: { branch: "main", upstream: "origin/main", ahead: 1, staged: [], unstaged: [], untracked: [], conflicts: [] },
		allPaths: [], selected: {}, diff: { path: "src/file.js", staged: false, text: "" },
		log: { lines: [{ hash: "abcdef" }] }, op: { status: "success", label: "op.fetch", detail: "done" },
		runOp: (_label, run) => run(), setForce() {}, setRebase() {}, setDiff() {}, commitWith() {}
	};
	const render = () => env.render(env.api.GitView, { git });
	let node = render();
	const left = find(node, (n) => n.props.className === "dgp-gitCol");
	assert.ok(find(left, (n) => n.type === env.api.CommitBox));
	assert.ok(find(left, (n) => n.props.className === "dgp-op"));
	const changes = find(left, (n) => n.type === env.api.ChangeList);
	assert.equal(changes.props.toolbar, undefined, "repository actions no longer create a second toolbar in the body");
	const header = find(node, (n) => n.props.className === "dgp-pageToolbar dgp-gitToolbar");
	assert.ok(header);
	const actions = find(header, (n) => n.type === env.api.ToolbarMenu);
	assert.ok(actions.props.items.every((item) => typeof item.icon === "function"), "every repository action has a visible semantic icon");
	assert.ok(find(node, (n) => n.type === env.api.DiffPane));
	assert.equal(find(node, (n) => n.props.className === "dgp-opBar"), undefined);
	find(header, (n) => n.type === "button" && n.children.includes("推送")).props.onClick({ preventDefault() {}, stopPropagation() {} });
	await tick();
	assert.equal(calls[0].payload.force, undefined, "normal push ignores a retained legacy force preference");
	calls.length = 0;
	actions.props.items.find((i) => i.danger).run(); node = render();
	const confirm = find(node, (n) => n.type === env.api.ConfirmDialog);
	assert.equal(confirm.props.spec.danger, true);
	assert.equal(calls.length, 0);
	await confirm.props.spec.onConfirm();
	assert.equal(calls[0].method, "push"); assert.equal(calls[0].payload.force, true);
	git.busy = "op.fetch";
	const busyMenu = find(render(), (n) => n.type === env.api.ToolbarMenu);
	assert.ok(busyMenu.props.items.slice(0, -1).every((i) => i.disabled));
	assert.ok(!busyMenu.props.items.at(-1).disabled, "read-only repository information remains available");
	busyMenu.props.items.at(-1).run();
	assert.equal(find(render(), (n) => n.type === env.api.ConfirmDialog).props.spec.dismissOnly, true);
	env.api.narrowStore.set(true);
	assert.equal(find(render(), (n) => n.props.className === "dgp-gitCol").props.hidden, true);
	git.diff = null;
	assert.equal(find(render(), (n) => n.props.className === "dgp-gitCol").props.hidden, false);
	env.api.narrowStore.set(false);
	assert.ok(find(render(), (n) => n.props.className === "dgp-diffEmpty"));
	assert.ok(find(render(), (n) => n.props.className === "dgp-gitWork").props.style.gridTemplateColumns.includes("minmax(240px"));
	git.commitDetail = { hash: "abcdef" };
	const work = find(render(), (n) => n.props.className === "dgp-gitWork");
	assert.equal(work.props.hidden, true);
	assert.ok(find(work, (n) => n.type === env.api.CommitBox), "history hides rather than unmounts the commit draft");
	env.unmount();
});

test("Git history emphasizes commit subjects and connects graph lanes without row-padding gaps", () => {
	assert.match(bundle, /\.dgp-histEntry\{[^}]*padding-top:0;padding-bottom:0\}/, "graph tiles have no vertical row-padding gaps");
	assert.match(bundle, /\.dgp-histBody\{[^}]*margin-block:5px/, "text keeps its inset while the graph spans the full row");
	assert.match(bundle, /\.dgp-logGraph svg\.dgp-graphNode\{[^}]*width:14px;height:14px/, "node SVG keeps a square viewport independent from the stretched graph SVG");
	const env = harness();
	const props = { log: { lines: [
		{ hash: "c2", subject: "Merge feature into main", refs: "HEAD -> main", name: "Lee", email: "lee@example.test", date: "2026-10-10", parents: ["c1"] },
		{ hash: "c1", subject: "Add graph rendering", refs: "", name: "Lee", email: "lee@example.test", date: "2026-10-09", parents: [] }
	] }, currentHash: null, onShowCommit() {}, setConfirm() {}, runOp() {}, cwd: "D:/repo" };
	let node = env.render(env.api.HistoryBlock, props);
	find(node, (n) => n.props.className === "dgp-histBar").props.onClick();
	node = env.render(env.api.HistoryBlock, props);
	const list = find(node, (n) => n.props.className === "dgp-gitScroll dgp-histList");
	assert.equal(list.children.length, 2);
	for (const row of list.children) {
		assert.ok(find(row, (n) => n.props.className === "dgp-logSubject"), "commit subject has a dedicated primary-text style");
		assert.ok(find(row, (n) => n.props.className === "dgp-logMeta"), "author and date remain secondary metadata");
		const graph = find(row, (n) => n.type === "svg");
		assert.ok(graph, "each row renders its graph segment");
		assert.ok(graph.children.length > 0 && graph.children.every((path) => path.props["stroke-width"] === 1.5), "graph lines use the smaller stroke width");
		assert.ok(find(row, (n) => n.type === "circle" && n.props.className === "dgp-graphDot" && n.props.cx === n.props.cy && n.props.r === 3.5), "commit marker uses a true SVG circle, not a rounded rectangle");
	}
	env.unmount();
});

test("change selection menu preserves select-all, clear and full-diff actions", () => {
	const env = harness(), calls = [];
	const props = { status: { staged: [], unstaged: [], untracked: [], conflicts: [] }, allPaths: ["a.js"], selected: {}, busy: null,
		onSelectAll: () => calls.push("all"), onClearAll: () => calls.push("clear"), onShowDiff: (path, staged) => calls.push([path, staged]) };
	const menu = () => find(env.render(env.api.ChangeList, props), (n) => n.type === env.api.ToolbarMenu);
	menu().props.items[1].run();
	props.selected = { "a.js": true };
	assert.equal(menu().props.items[1].checked, true);
	menu().props.items[1].run(); menu().props.items[0].run(); menu().props.items[2].run();
	assert.deepEqual(calls, ["all", "clear", ["", false], "clear"]);
	env.unmount();
});

test("one stable header host serves file, Git and narrow navigation without duplicate branch controls", () => {
	const env = harness();
	const props = { cwd: "D:/B", onSuspend() {}, onToggleMax() {} };
	const render = () => env.render(env.api.FilePanelBody, props);
	let node = render();
	const host = {};
	find(node, (n) => n.props.className === "dgp-headerHost").props.ref(host);
	node = render();
	const browser = find(node, (n) => n.type === env.api.FileBrowser);
	assert.equal(browser.props.headerHost, host);
	const gitNav = browser.props.pageNavigation;
	assert.equal(gitNav.props.className, "dgp-tab dgp-pageNavGit", "Git navigation has a dedicated button style");
	assert.equal(gitNav.props["aria-pressed"], false);
	assert.ok(gitNav.children.some((child) => child?.type === env.api.IconBranch), "Git navigation displays a branch icon alongside its label");
	assert.match(bundle, /\.dgp-singleHeader \.dgp-pageNavGit\{[^}]*border-bottom:2px solid transparent/, "Git navigation shares the workspace title's underline affordance");
	assert.match(bundle, /\.dgp-singleHeader \.dgp-pageNavGit\[data-active="true"\]\{[^}]*border-bottom-color:var\(--dsw-alias-state-business-primary\)/, "the Git underline identifies the active page");
	const roots = [];
	browser.props.rootNavigationRef.current = (target) => roots.push(target);
	const workspace = () => find(node, (n) => n.props.className === "dgp-titleWrap dgp-workspaceTab");
	const header = find(node, (n) => n.props.className === "dgp-header dgp-singleHeader");
	const pathHost = find(header, (n) => n.props.className === "dgp-headerHost");
	assert.ok(header.children.indexOf(workspace()) < header.children.indexOf(pathHost), "workspace root precedes the portaled path and its trailing action group");
	assert.equal(find(header, (n) => n.type === env.api.ToolbarMenu), undefined, "desktop header cannot insert a menu between workspace root and path host");
	assert.equal(workspace().props["aria-pressed"], true);
	workspace().props.onClick(); assert.deepEqual(roots, [""]);
	assert.equal(find(node, (n) => n.type === "button" && n.children.includes("文件")), undefined);
	clickLabel(gitNav, "Git"); node = render();
	const gitView = find(node, (n) => n.type === env.api.GitView);
	assert.equal(gitView.props.headerHost, host);
	assert.equal(gitView.props.pageNavigation.props["aria-pressed"], true, "the active Git page is announced as pressed");
	assert.equal(workspace().props["aria-pressed"], false);
	workspace().props.onClick(); node = render();
	assert.ok(find(node, (n) => n.type === env.api.FileBrowser));
	assert.deepEqual(roots, [""], "returning from Git switches pages rather than calling an unmounted browser");
	find(node, (n) => n.props.className === "dgp-headerActions").children[0].props.onClick();
	node = render();
	assert.ok(find(node, (n) => n.type === env.api.SettingsView));
	const settingsHeader = find(node, (n) => n.props.className === "dgp-headerHost");
	assert.equal(find(settingsHeader, (n) => n.props.className === "dgp-pageToolbar dgp-settingsToolbar"), undefined, "the settings page title is not duplicated into the header");
	const settingsDivider = find(settingsHeader, (n) => n.props.className === "dgp-toolbarDivider");
	const settingsGitNav = find(settingsHeader, (n) => n.props.className === "dgp-tab dgp-pageNavGit");
	assert.ok(settingsDivider, "settings mode keeps the thin divider before Git navigation");
	const settingsHeaderParts = settingsHeader.children.flatMap((child) => child?.type === "fragment" ? child.children : [child]);
	assert.ok(settingsHeaderParts.indexOf(settingsDivider) < settingsHeaderParts.indexOf(settingsGitNav));
	find(node, (n) => n.props.className === "dgp-headerActions").children[0].props.onClick();
	node = render();
	assert.ok(find(node, (n) => n.type === env.api.FileBrowser));
	env.api.narrowStore.set(true); node = render();
	const menu = find(node, (n) => n.type === env.api.ToolbarMenu);
	assert.ok(menu);
	assert.equal(menu.props.text, "B");
	menu.props.items.find((i) => i.label === "Git").run(); node = render();
	assert.equal(find(node, (n) => n.type === env.api.ToolbarMenu).props.text, "Git");
	menu.props.items.find((i) => i.label === "设置").run(); node = render();
	assert.ok(find(node, (n) => n.type === env.api.SettingsView));
	find(node, (n) => n.type === env.api.ToolbarMenu).props.items[0].run();
	assert.equal(find(render(), (n) => n.type === env.api.FileBrowser).props.headerHost, host, "navigation retains the shared host");
	env.unmount();
});

test("repository information dialog traps keyboard focus and restores it when dismissed", () => {
	const buttons = [], env = harness(undefined, { dialogButtons: buttons });
	let closed = 0, restored = 0, focused = 0, prevented = 0, stopped = 0;
	const trigger = { isConnected: true, focus: () => restored++ };
	env.document.activeElement = trigger;
	buttons.push({ focus() { focused++; env.document.activeElement = this; } });
	const props = { spec: { title: "仓库信息", dismissOnly: true, message: "long identity" }, onClose: () => closed++ };
	const render = () => env.render(env.api.ConfirmDialog, props);
	let node = render();
	assert.equal(focused, 1);
	assert.ok(find(find(node, (n) => n.type === "button"), (n) => n.children?.includes("关闭")));
	node.props.onKeyDown({ key: "Tab", preventDefault: () => prevented++, stopPropagation: () => stopped++ });
	assert.equal(prevented, 1); assert.equal(focused, 2);
	node.props.onKeyDown({ key: "Escape", preventDefault: () => prevented++, stopPropagation: () => stopped++ });
	assert.equal(closed, 1); assert.equal(stopped, 2);
	props.spec = null;
	assert.equal(render(), null); assert.equal(restored, 1);
	env.unmount();
});

test("commit keyboard shortcut respects busy/repository state and preserves failed drafts", async () => {
	const env = harness(), calls = [];
	let success = false;
	const props = { busy: null, hasRepo: true, commitWith: async (all, msg) => { calls.push([all, msg]); return success; } };
	const render = () => env.render(env.api.CommitBox, props);
	const input = () => find(render(), (n) => n.type === "input");
	input().props.onChange({ target: { value: "draft message" } });
	props.busy = "op.fetch";
	input().props.onKeyDown({ key: "Enter", ctrlKey: true, preventDefault() {} }); await tick();
	props.busy = null; props.hasRepo = false;
	input().props.onKeyDown({ key: "Enter", ctrlKey: true, preventDefault() {} }); await tick();
	assert.equal(calls.length, 0);
	props.hasRepo = true;
	input().props.onKeyDown({ key: "Enter", metaKey: true, preventDefault() {} }); await tick();
	assert.deepEqual(calls[0], [true, "draft message"]); assert.equal(input().props.value, "draft message");
	success = true; clickLabel(render(), "提交选中"); await tick();
	assert.deepEqual(calls[1], [false, "draft message"]); assert.equal(input().props.value, "");
	env.unmount();
});

test("commit detail uses the shared header and supports narrow file/back navigation", () => {
	const env = harness(), calls = [];
	env.api.narrowStore.set(true);
	const props = { commitDetail: { hash: "1234567890abcdef", subject: "long commit subject", file: "src/a.js", text: "", files: [{ path: "src/a.js", code: "M" }] },
		onShowFile: (...args) => calls.push(args), onClose: () => calls.push("close") };
	const render = () => env.render(env.api.CommitDetailView, props);
	let node = render();
	assert.equal(find(node, (n) => n.props.className === "dgp-commitHead"), undefined);
	assert.equal(find(node, (n) => n.props.className === "dgp-diffCard"), undefined);
	find(node, (n) => n.props.className === "dgp-row dgp-logRow").props.onClick();
	node = render();
	assert.equal(find(node, (n) => n.props.className === "dgp-commitFilesPane").props.hidden, true);
	const diff = find(node, (n) => n.props.className === "dgp-gitCard dgp-diffCard");
	assert.ok(diff);
	assert.equal(find(diff, (n) => n.type === "button" && n.props.title === "返回"), undefined);
	find(node, (n) => n.type === "button" && n.props.title === "返回").props.onClick({ preventDefault() {}, stopPropagation() {} });
	node = render();
	assert.equal(find(node, (n) => n.props.className === "dgp-commitFilesPane").props.hidden, false);
	assert.deepEqual(calls[0], ["1234567890abcdef", "src/a.js"]);
	find(node, (n) => n.type === "button" && n.props.title === "返回").props.onClick({ preventDefault() {}, stopPropagation() {} });
	assert.equal(calls[1], "close");
	env.unmount();
});
const modern = { phase: "ready", byId: {
	sa: { id: "sa", cwd: "D:/A", retainedBy: {} },
	sb: { id: "sb", cwd: "D:/B", retainedBy: { mainView: 1 } }
} };

test("DSH 0.2 mainView B wins over the first workspace A in every cwd route", () => {
	const { api } = harness();
	api.setServices({ list: { getSnapshot: () => modern } }, { list: { getSnapshot: () => ws } });
	assert.equal(api.workspaceCwdOf(modern, ws), "D:/B");
	assert.equal(api.cwdOf(), "D:/B");
	assert.equal(api.cwdOfSession("sa"), "D:/A");
	assert.equal(api.cwdOfSession("missing"), "");
	const reversed = { ...modern, byId: { ...modern.byId,
		sa: { ...modern.byId.sa, retainedBy: { mainView: 1 } },
		sb: { ...modern.byId.sb, retainedBy: {} }
	} };
	assert.equal(api.workspaceCwdOf(reversed, ws), "D:/A");
});
test("legacy current, missing cwd membership, blank hero and ambiguous handoff", () => {
	const { api } = harness();
	assert.equal(api.workspaceCwdOf({ current: "sb", byId: modern.byId }, ws), "D:/B");
	assert.equal(api.workspaceCwdOf({ current: "sb", byId: {} }, ws), "D:/B");
	assert.equal(api.workspaceCwdOf({ current: undefined, byId: {} }, ws), "D:/A");
	assert.equal(api.workspaceCwdOf({ byId: {} }, ws), "");
	assert.equal(api.workspaceCwdOf({ byId: {} }, { ...ws, items: [ws.items[1]] }), "D:/B");
	assert.equal(api.workspaceCwdOf({ byId: { ...modern.byId, sa: { ...modern.byId.sa, retainedBy: { mainView: 1 } } } }, ws), "");
});
test("overlay opens on B, closes on a workspace switch, and reopens on A", () => {
	const env = harness();
	let snapshot = modern;
	env.api.setServices({ list: { getSnapshot: () => snapshot } }, { list: { getSnapshot: () => ws } });
	env.api.overlayStore.set(true);
	let node = env.render(env.api.FilePanelOverlay);
	assert.equal(find(node, (n) => n.type === env.api.FilePanelBody).props.cwd, "D:/B");
	snapshot = { ...modern, byId: {
		sa: { ...modern.byId.sa, retainedBy: { mainView: 1 } },
		sb: { ...modern.byId.sb, retainedBy: {} }
	} };
	env.render(env.api.FilePanelOverlay);
	assert.equal(env.api.overlayStore.get(), false);
	assert.equal(env.render(env.api.FilePanelOverlay), null);
	env.api.overlayStore.set(true);
	node = env.render(env.api.FilePanelOverlay);
	assert.equal(find(node, (n) => n.type === env.api.FilePanelBody).props.cwd, "D:/A");
	env.unmount();
});
test("folder single-selection stays closed; navigating opens it", () => {
	for (const [opened, expected] of [[false, "IconFolderClose"], [true, "IconFolderOpen"]]) {
		const env = harness();
		const row = env.render(env.api.FileRow, { entry: { type: "dir", name: "src", path: "src" }, selected: true, opened });
		const icon = find(row, (node) => node.props.className?.includes("dgp-fileIcon"));
		assert.equal(icon.children[0].type, env.api[expected]);
		env.unmount();
	}
});
test("4000 files mount one viewport, scroll reaches the final file", () => {
	const env = harness(), items = Array.from({ length: 4000 }, (_, i) => ({ id: i }));
	let rendered = [];
	const props = { items, rowHeight: 32, itemKey: (x) => x.id, renderItem: (x) => { rendered.push(x.id); return `file-${x.id}`; } };
	let node = env.render(env.api.WindowedList, props);
	assert.equal(rendered.length, 27, "4000 entries create only 27 rows in a 600px viewport");
	node.props.onScroll({ currentTarget: { scrollTop: 4000 * 32 - 600, clientHeight: 600 } });
	rendered = [];
	node = env.render(env.api.WindowedList, props);
	assert.equal(rendered.at(-1), 3999);
	assert.ok(rendered.length < 50);
	assert.equal(node.children.at(-1).children[0], "file-3999");
	const bounds = env.api.listWindow(10, 32, 120000, 600);
	assert.ok(bounds.start >= 0 && bounds.start < bounds.end && bounds.end <= 10);
});
test("large change tree virtualizes without losing collapse counts or checkbox behavior", () => {
	const env = harness(), entries = Array.from({ length: 3000 }, (_, i) => ({ path: `src/file-${i}.js`, code: " M" }));
	let toggled;
	const props = { status: { staged: [], unstaged: entries, untracked: [], conflicts: [] }, allPaths: entries.map((e) => e.path), selected: {}, busy: null, onTogglePath: (path) => { toggled = path; } };
	let node = env.render(env.api.ChangeList, props);
	let list = find(node, (n) => n.type === env.api.WindowedList);
	assert.equal(list.props.items.length, 3002);
	const directory = list.props.items.find((item) => item.kind === "dir");
	assert.equal(directory.count, 3000);
	const dirRow = list.props.renderItem(directory);
	const firstFile = list.props.renderItem(list.props.items.find((item) => item.kind === "file"));
	firstFile.props.onTogglePath(firstFile.props.entry.path);
	assert.equal(toggled, entries[0].path);
	dirRow.props.onToggleDir(dirRow.props.dirKey);
	node = env.render(env.api.ChangeList, props);
	list = find(node, (n) => n.type === env.api.WindowedList);
	assert.equal(list.props.items.length, 2);
	assert.equal(list.props.items[1].open, false);
});
test("status paints before slow metadata and is not overwritten by a newer push", async () => {
	const slow = deferred(), calls = [];
	const st = { repo: "D:/B", branch: "main", staged: [], unstaged: [], untracked: [], conflicts: [] };
	const env = harness((method) => { calls.push(method); return method === "status" ? Promise.resolve(st) : slow.promise; });
	env.render(env.api.useGit, "D:/B");
	await tick();
	let git = env.render(env.api.useGit, "D:/B");
	assert.equal(git.status.branch, "main");
	assert.equal(git.busy, null);
	assert.equal(git.log, null);
	const newer = { ...st, branch: "feature" };
	env.push(newer);
	slow.resolve({ lines: [], branches: [] });
	await tick();
	git = env.render(env.api.useGit, "D:/B");
	assert.equal(git.status.branch, "feature");
	assert.deepEqual(calls, ["status", "log", "config", "branches"]);
	env.unmount();
});
test("non-repository status failure skips all metadata work", async () => {
	const calls = [], error = Object.assign(new Error("not a git repository"), { code: "not-a-git-repo" });
	const env = harness((method) => { calls.push(method); return Promise.reject(error); });
	env.render(env.api.useGit, "D:/plain");
	await tick();
	assert.equal(env.render(env.api.useGit, "D:/plain").isRepo, false);
	assert.deepEqual(calls, ["status"]);
	env.unmount();
});
test("same-count branch metadata changes remain visible after a full refresh", async () => {
	let branch = "main";
	const st = { repo: "D:/B", branch: "main", staged: [], unstaged: [], untracked: [], conflicts: [] };
	const env = harness(async (method) => method === "status" ? st : method === "branches" ? { branches: [{ name: branch, current: true }] } : { lines: [] });
	env.render(env.api.useGit, "D:/B");
	await tick();
	let git = env.render(env.api.useGit, "D:/B");
	assert.equal(git.branches[0].name, "main");
	branch = "renamed";
	await git.refresh({ full: true });
	git = env.render(env.api.useGit, "D:/B");
	assert.equal(git.branches[0].name, "renamed");
	env.unmount();
});
test("file browser mounts with one root read; refresh during read queues exactly one follow-up", async () => {
	const first = deferred(), second = deferred(), calls = [];
	const env = harness((method, payload) => { calls.push({ method, payload }); return calls.length === 1 ? first.promise : second.promise; });
	const props = { cwd: "D:/B", status: null, refreshTick: 0 };
	env.render(env.api.FileBrowser, props);
	assert.equal(calls.length, 1);
	first.resolve({ entries: [] });
	await tick();
	env.render(env.api.FileBrowser, props);
	assert.equal(calls.length, 1, "auto-load must not queue another root request");
	env.render(env.api.FileBrowser, { ...props, refreshTick: 1 });
	assert.equal(calls.length, 2);
	env.render(env.api.FileBrowser, { ...props, refreshTick: 2 });
	assert.equal(calls.length, 2);
	second.resolve({ entries: [] });
	await tick();
	assert.equal(calls.length, 3, "explicit refresh must survive an in-flight read");
	env.unmount();
});
test("multi-select toolbar groups selection controls before batch actions", async () => {
	const env = harness(async (method) => method === "list" ? { entries: [{ name: "a.txt", path: "a.txt", type: "file" }] } : {});
	const props = { cwd: "D:/B", status: null, refreshTick: 0 };
	const render = () => env.render(env.api.FileBrowser, props);
	render(); await tick();
	let node = render();
	const multiAction = find(node, (n) => n.type === env.api.ToolbarMenu && n.props.label === "目录操作").props.items[2];
	assert.equal(multiAction.icon, env.api.IconListChecks, "directory-menu multi-select uses the semantic list-checks icon");
	multiAction.run();
	node = render();
	const bar = find(node, (n) => n.props.className === "dgp-multiBar");
	assert.ok(bar, "multi-select mode presents its action toolbar");
	const [selection, actions] = bar.children;
	assert.equal(selection.props.className, "dgp-multiSelection", "selection count and select-all stay together");
	assert.equal(actions.props.className, "dgp-multiBarActions", "batch actions form a separate trailing group");
	const textOf = (button) => button.children.filter((child) => typeof child === "string").join("");
	assert.equal(selection.children[0].props.className, "dgp-multiCount");
	assert.equal(selection.children[0].children.length, 1, "the selected-count summary is plain text, without a redundant checkbox glyph");
	assert.match(bundle, /\.dgp-multiCount\{[^}]*background:none/, "count text has no chip background");
	assert.match(bundle, /\.dgp-multiSelection>\.dgp-lbtn\{[^}]*height:28px/, "select-all button has a compact, bounded background hit area");
	assert.equal(selection.children[1].children[0].type, env.api.IconListChecks, "select-all uses a list-selection glyph rather than a plus");
	assert.equal(textOf(selection.children[1]), "全选");
	const buttons = actions.children.filter((child) => child.type === "button");
	assert.deepEqual(buttons.map(textOf), ["导出 ZIP", "删除所选", "取消"], "batch actions follow export → delete → exit order");
	assert.ok(buttons.every((button) => typeof button.children[0]?.type === "function"), "each action has a Lucide icon");
	assert.ok(actions.children.some((child) => child.props.className === "dgp-multiDivider"), "exit is visually separated from destructive actions");
	assert.match(bundle, /\.dgp-root\[data-narrow="true"\] \.dgp-multiBar\{[^}]*flex-wrap:wrap/, "narrow layouts allow the toolbar to wrap");
	env.unmount();
});

test("shared header orders file context, Git navigation, Git context and file search", async () => {
	const navigation = { type: "button", props: { className: "dgp-tab dgp-pageNavGit" }, children: ["Git"] };
	const fileEnv = harness(async (method) => method === "list" ? { entries: [{ name: "a.txt", path: "a.txt", type: "file" }] } : {});
	const fileProps = { cwd: "D:/B", status: null, refreshTick: 0, pageNavigation: navigation };
	const renderFiles = () => fileEnv.render(fileEnv.api.FileBrowser, fileProps);
	renderFiles(); await tick();
	let fileNode = renderFiles();
	let fileToolbar = find(fileNode, (n) => n.props.className === "dgp-pageToolbar dgp-directoryToolbar");
	let fileContext = find(fileToolbar, (n) => n.props.className === "dgp-directoryContext");
	let divider = find(fileToolbar, (n) => n.props.className === "dgp-toolbarDivider");
	let searchSlot = find(fileToolbar, (n) => n.props.className === "dgp-fileSearchSlot");
	assert.ok(divider && searchSlot, "file toolbar contains a divider and a trailing search slot");
	assert.ok(fileToolbar.children.indexOf(fileContext) < fileToolbar.children.indexOf(divider));
	assert.ok(fileToolbar.children.indexOf(divider) < fileToolbar.children.indexOf(navigation));
	assert.ok(fileToolbar.children.indexOf(navigation) < fileToolbar.children.indexOf(searchSlot));
	find(searchSlot, (n) => n.type === "button" && n.props.title === "搜索当前目录…").props.onClick({ preventDefault() {}, stopPropagation() {} });
	fileNode = renderFiles(); fileToolbar = find(fileNode, (n) => n.props.className === "dgp-pageToolbar dgp-directoryToolbar");
	searchSlot = find(fileToolbar, (n) => n.props.className === "dgp-fileSearchSlot");
	assert.ok(find(searchSlot, (n) => n.props.className === "dgp-search"), "expanded search stays after Git navigation");
	assert.equal(find(fileContext, (n) => n.props.className === "dgp-search"), undefined);
	fileEnv.unmount();

	const gitEnv = harness();
	const git = { cwd: "D:/B", busy: null, readBusy: null, rebase: false, status: { branch: "main", upstream: "origin/main", ahead: 1, behind: 0, staged: [], unstaged: [], untracked: [], conflicts: [] }, allPaths: ["a.txt"], selected: {}, diff: null, log: { lines: [] }, op: null, runOp() {}, setRebase() {}, setDiff() {}, setOp() {}, commitWith() {} };
	const gitNode = gitEnv.render(gitEnv.api.GitView, { git, pageNavigation: navigation });
	const gitToolbar = find(gitNode, (n) => n.props.className === "dgp-pageToolbar dgp-gitToolbar");
	const gitDivider = find(gitToolbar, (n) => n.props.className === "dgp-toolbarDivider");
	const gitContext = find(gitToolbar, (n) => n.props.className === "dgp-gitContext");
	const gitActions = find(gitToolbar, (n) => n.props.className === "dgp-pageActions");
	assert.ok(gitDivider);
	assert.ok(gitToolbar.children.indexOf(gitDivider) < gitToolbar.children.indexOf(navigation));
	assert.ok(gitToolbar.children.indexOf(navigation) < gitToolbar.children.indexOf(gitContext), "branch and change data follow the Git tab");
	assert.ok(gitToolbar.children.indexOf(gitContext) < gitToolbar.children.indexOf(gitActions));
	gitEnv.unmount();
});

test("file browser navigation binds opened icons to the displayed directory, not selection", async () => {
	const env = harness(async (_method, { path }) => ({ entries: path === "" ? [
		{ name: "src", path: "src", type: "dir" }, { name: "other", path: "other", type: "dir" }
	] : [] }));
	const props = { cwd: "D:/B", status: null, refreshTick: 0 };
	env.render(env.api.FileBrowser, props);
	await tick();
	let node = env.render(env.api.FileBrowser, props);
	let list = find(node, (n) => n.type === env.api.WindowedList);
	const src = list.props.items[0], other = list.props.items[1];
	list.props.renderItem(src).props.onSelect("src");
	node = env.render(env.api.FileBrowser, props);
	list = find(node, (n) => n.type === env.api.WindowedList);
	assert.equal(list.props.renderItem(src).props.opened, false);
	list.props.renderItem(src).props.onOpenDir("", "src");
	node = env.render(env.api.FileBrowser, props);
	list = find(node, (n) => n.type === env.api.WindowedList);
	assert.equal(list.props.renderItem(src).props.opened, true);
	assert.equal(list.props.renderItem(other).props.opened, false);
	env.unmount();
});
test("closing the panel drops queued directory work", async () => {
	const pending = deferred();
	let requests = 0;
	const env = harness(() => { requests++; return pending.promise; });
	const props = { cwd: "D:/B", status: null, refreshTick: 0 };
	env.render(env.api.FileBrowser, props);
	env.render(env.api.FileBrowser, { ...props, refreshTick: 1 });
	env.unmount();
	pending.resolve({ entries: [] });
	await tick();
	assert.equal(requests, 1);
});

test("legacy font families migrate with independent default sizes", () => {
	const env = harness(undefined, { initialFonts: JSON.stringify({ ui: "inter", code: "jetbrains" }) });
	const prefs = env.api.getPanelFontPrefs();
	assert.equal(prefs.ui, "inter");
	assert.equal(prefs.code, "cascadiaMono");
	assert.equal(prefs.uiSize, 13);
	assert.equal(prefs.previewSize, 12);
});
test("font sizes persist, restore on reopen, and survive family changes", () => {
	const env = harness(undefined, { panelRoot: true });
	env.api.setPanelFontSizes(16, 10);
	env.api.setPanelFonts("yahei", "consolas");
	assert.equal(env.api.getPanelFontPrefs().uiSize, 16);
	assert.equal(env.api.getPanelFontPrefs().previewSize, 10);
	const restored = harness(undefined, { initialFonts: env.storage.get("dgp.monacoFonts") });
	assert.equal(restored.api.getPanelFontPrefs().uiSize, 16);
	assert.equal(restored.api.getPanelFontPrefs().previewSize, 10);
	assert.equal(restored.api.getPanelFontPrefs().code, "consolas");
	assert.equal(env.rootStyles.get("--dgp-ui-size"), "16px");
	assert.equal(env.rootStyles.get("--dgp-preview-size"), "10px");
});
test("corrupt/out-of-range sizes are normalized and blocked storage still updates the live panel", () => {
	const env = harness(undefined, { initialFonts: '{"uiSize":500,"previewSize":"invalid"}' });
	assert.equal(env.api.getPanelFontPrefs().uiSize, 20);
	assert.equal(env.api.getPanelFontPrefs().previewSize, 12);
	env.api.setPanelFontSizes(-1, 100);
	assert.equal(env.api.getPanelFontPrefs().uiSize, 10);
	assert.equal(env.api.getPanelFontPrefs().previewSize, 24);
	const blocked = harness(undefined, { blockStorage: true, panelRoot: true });
	blocked.api.setPanelFontSizes(18, 9);
	assert.equal(blocked.api.getPanelFontStyle()["--dgp-preview-size"], "9px");
	assert.equal(blocked.rootStyles.get("--dgp-ui-size"), "18px");
});
test("settings expose independent UI and preview size choices and update immediately", () => {
	const env = harness();
	const render = () => env.render(env.api.SettingsView, { onSetMax() {} });
	let node = render();
	const uiControl = find(node, (n) => n.type === env.api.DsSelect && n.props.options.length === 11);
	assert.equal(uiControl.props.value, "13");
	uiControl.props.onChange(16);
	node = render();
	const previewControl = find(node, (n) => n.type === env.api.DsSelect && n.props.options.length === 17);
	assert.equal(previewControl.props.value, "12");
	previewControl.props.onChange(10);
	render();
	assert.equal(env.api.getPanelFontPrefs().uiSize, 16);
	assert.equal(env.api.getPanelFontPrefs().previewSize, 10);
	env.unmount();
});
test("larger UI fonts resize virtual row geometry independently of preview size", () => {
	const env = harness(), items = Array.from({ length: 4000 }, (_, id) => ({ id }));
	const props = { items, rowHeight: 32, itemKey: (x) => x.id, renderItem: (x) => `file-${x.id}` };
	env.api.setPanelFontSizes(20, 9);
	let node = env.render(env.api.WindowedList, props);
	const row = node.children.find((n) => n.props?.className === "dgp-windowRow");
	assert.equal(row.props.style.height, 32 * 20 / 13);
	const endTop = 4000 * row.props.style.height - 600;
	node.props.onScroll({ currentTarget: { scrollTop: endTop, clientHeight: 600 } });
	node = env.render(env.api.WindowedList, props);
	assert.equal(node.children.at(-1).children[0], "file-3999");
});
test("mounted text and diff editors use preview size on create and preference changes", async () => {
	const env = harness(), created = [], updated = [];
	const model = () => ({ dispose() {}, getLanguageId: () => "plaintext", setValue() {} });
	const editor = {
		setModel() {}, getModel: model, getValue: () => "text", dispose() {},
		updateOptions: (options) => updated.push(options)
	};
	env.api.setMonacoForTest({ editor: {
		create: (_host, options) => { created.push(options); return editor; },
		createDiffEditor: (_host, options) => { created.push(options); return editor; },
		createModel: model, remeasureFonts() {}
	} });
	env.api.setPanelFontSizes(18, 10);
	const text = await env.api.mountMonacoEditor({}, { value: "text", path: "a.txt", readOnly: true });
	const diff = await env.api.mountMonacoDiff({}, "diff --git a/a b/a\n--- a/a\n+++ b/a\n@@ -1 +1 @@\n-old\n+new", "a.txt");
	assert.equal(created.length, 2);
	assert.ok(created.every((options) => options.fontSize === 10 && options.lineHeight === 17));
	env.api.setPanelFontSizes(18, 14);
	assert.equal(updated.length, 2);
	assert.ok(updated.every((options) => options.fontSize === 14 && options.lineHeight === 23));
	text.dispose(); diff.dispose();
	env.api.setPanelFontSizes(18, 12);
	assert.equal(updated.length, 2, "disposed editors remove font listeners");
});


function fakeMonaco() {
	const created = [], disposed = [], serialized = [];
	const monaco = {
		languages: { getLanguages: () => [{ id: "javascript", extensions: [".js"] }, { id: "markdown", extensions: [".md"] }] },
		editor: {
			create(host, options) {
				const model = { value: options.value, language: options.language, disposed: false,
					dispose() { this.disposed = true; } };
				const ed = { host, options, model, resets: 0,
					getValue() { serialized.push(model.value.length); return model.value; },
					setValue(value) { model.value = value; this.resets++; },
					getModel: () => model,
					updateOptions(update) { this.options = { ...this.options, ...update }; },
					dispose() { disposed.push(ed); }
				};
				created.push(ed); return ed;
			},
			setModelLanguage(model, language) { model.language = language; },
			remeasureFonts() {}
		}
	};
	return { monaco, created, disposed, serialized };
}
function clickLabel(node, label) {
	const button = find(node, (n) => n.type === "button" && !!find(n, (child) => child.children?.includes(label)));
	assert.ok(button, `button ${label} exists`);
	button.props.onClick({ preventDefault() {}, stopPropagation() {} });
}
async function browserFixture(text, name = "sample.js", extra = {}) {
	const writes = [], fake = fakeMonaco();
	const env = harness(async (method, payload) => {
		if (method === "list") return { entries: [{ path: name, name, type: "file" }] };
		if (method === "read") return { text, size: text.length, truncated: false, binary: false, ...extra };
		if (method === "write") { writes.push(payload); return {}; }
		return {};
	}, { attachEditorHost: true, timers: true, portals: true });
	env.api.setMonacoForTest(fake.monaco);
	const props = { cwd: "D:/B", status: null, refreshTick: 0 };
	const render = () => env.render(env.api.FileBrowser, props);
	render(); await tick();
	const node = render(), list = find(node, (n) => n.type === env.api.WindowedList);
	const open = (path = name) => list.props.renderItem(list.props.items[0]).props.onOpenPreview("", path);
	await open(); render(); await tick(); render();
	return { env, fake, writes, render, open, props };
}

test("preview → edit → cancel/save cycles reuse one model and preserve source", async () => {
	const { env, fake, writes, render } = await browserFixture("const original = 1;");
	assert.equal(fake.created.length, 1);
	const ed = fake.created[0];
	for (let cycle = 0; cycle < 10; cycle++) {
		clickLabel(render(), "编辑"); render(); await tick();
		assert.equal(ed.options.readOnly, false);
		ed.model.value = "const unsaved = 2;";
		const before = fake.serialized.length;
		render();
		assert.equal(fake.serialized.length, before, "parent render does not serialize edits");
		clickLabel(render(), "取消"); render();
		assert.equal(ed.model.value, "const original = 1;", "cancel restores saved text");
	}
	clickLabel(render(), "编辑"); render();
	ed.model.value = "const saved = 3;";
	clickLabel(render(), "保存"); await tick(); render();
	assert.equal(writes[0].content, "const saved = 3;");
	assert.equal(ed.model.value, "const saved = 3;");
	assert.equal(ed.options.readOnly, true);
	assert.equal(fake.created.length, 1, "20 mode transitions and a save create just one editor/model");
	assert.equal(fake.disposed.length, 0);
	env.unmount();
	assert.equal(fake.disposed.length, 1);
	assert.equal(ed.model.disposed, true);
});

test("inline search, directory selection and source mode keep the preview/editor alive", async () => {
	const { env, fake, render } = await browserFixture("const original = 1;");
	let node = render();
	assertDirectoryAnchor(env, node, false);
	let left = find(node, (n) => n.props.className === "dgp-pane dgp-listPane");
	assert.ok(left);
	assert.equal(find(node, (n) => n.props.className === "dgp-searchToolbar"), undefined);
	const search = find(node, (n) => n.type === "button" && n.props.title === "搜索当前目录…");
	assert.ok(search, "search trigger belongs to the single shared toolbar");
	search.props.onClick({ preventDefault() {}, stopPropagation() {} });
	node = render(); left = find(node, (n) => n.props.className === "dgp-pane dgp-listPane");
	assertDirectoryAnchor(env, node, true);
	let input = find(node, (n) => n.props.className === "dgp-search");
	input.props.onChange({ target: { value: "missing-file" } });
	node = render();
	assertDirectoryAnchor(env, node, true);
	assert.ok(find(node, (n) => n.props.className === "dgp-pageToolbar dgp-fileToolbar"));
	let stopped = 0;
	find(node, (n) => n.props.className === "dgp-search").props.onKeyDown({ key: "Escape", preventDefault() {}, stopPropagation: () => stopped++ });
	node = render();
	assert.equal(stopped, 1, "search Escape does not bubble to the panel close handler");
	assert.equal(find(node, (n) => n.props.className === "dgp-search"), undefined);
	assertDirectoryAnchor(env, node, false);
	left = find(node, (n) => n.props.className === "dgp-pane dgp-listPane");
	find(node, (n) => n.type === env.api.ToolbarMenu && n.props.label === "目录操作").props.items[2].run();
	node = render();
	const list = find(node, (n) => n.type === env.api.WindowedList);
	assert.equal(list.props.renderItem(list.props.items[0]).props.checkable, true);
	clickLabel(node, "编辑"); node = render();
	assertDirectoryAnchor(env, node, false);
	find(node, (n) => n.type === "button" && n.props.title === "搜索当前目录…").props.onClick({ preventDefault() {}, stopPropagation() {} });
	node = render();
	assertDirectoryAnchor(env, node, true);
	const head = find(node, (n) => n.props.className === "dgp-pageToolbar dgp-fileToolbar");
	assert.ok(find(head, (n) => n.type === "button" && n.children.includes("保存")));
	assert.ok(find(head, (n) => n.type === "button" && n.children.includes("取消")));
	assert.equal(find(node, (n) => n.props.className === "dgp-editBar"), undefined);
	assert.equal(fake.created.length, 1); assert.equal(fake.disposed.length, 0);
	env.unmount();
});

test("workspace editor and HTML browser opens fall back after DSH path-open failure", async () => {
	const nativeCalls = [], fileOpens = [];
	const env = harness(async (method, payload) => {
		if (method === "list") return { entries: [{ name: "page.html", path: "page.html", type: "file" }] };
		if (method === "read") return { text: "<!doctype html><title>fixture</title>", size: 37, truncated: false, binary: false };
		if (method === "openFile") { fileOpens.push(payload); return { opened: true }; }
		return {};
	}, { apiRpc: async (url, request) => {
		nativeCalls.push({ url, request });
		return { ok: false, error: { code: "gateway/internal", message: "path open failed" } };
	} });
	const props = { cwd: "D:/B", status: null, refreshTick: 0 };
	const render = () => env.render(env.api.FileBrowser, props);
	render(); await tick();
	let node = render();
	const list = find(node, (n) => n.type === env.api.WindowedList);
	await list.props.renderItem(list.props.items[0]).props.onOpenPreview("", "page.html");
	await tick(); node = render();
	const menu = find(node, (n) => n.type === env.api.ToolbarMenu && n.props.label === "文件操作");
	await menu.props.items.find((item) => item.label === "在浏览器打开").run();
	await menu.props.items.find((item) => item.label === "在编辑器中打开").run();
	assert.equal(nativeCalls.length, 2, "both actions try the supported DSH opener first");
	assert.equal(JSON.stringify(fileOpens), JSON.stringify([
		{ repo: "D:/B", path: "page.html" },
		{ repo: "D:/B", path: "page.html" }
	]), "both actions fall back to the workspace-contained associated-file opener");
	assert.equal(find(render(), (n) => n.props.className === "dgp-error"), undefined, "successful native fallback does not surface the original host error");
	env.unmount();
});

test("directory menu and row actions use DSH first, fall back only for native errors and retain the active folder", async () => {
	const native = [], fallback = [];
	let nativeError = null;
	const env = harness(async (method, payload) => {
		if (method === "openDirectory") { fallback.push(payload); return { opened: true }; }
		return { entries: [{ name: "src", path: "src", type: "dir" }] };
	}, { apiRpc: async (url, request) => {
		native.push({ url, request });
		return nativeError ? { ok: false, error: nativeError } : { ok: true, value: { opened: true } };
	} });
	const render = () => env.render(env.api.FileBrowser, { cwd: "D:/B", status: null, refreshTick: 0 });
	const menu = () => find(render(), (n) => n.type === env.api.ToolbarMenu && n.props.label === "目录操作");
	render(); await tick();
	await menu().props.items[0].run();
	assert.equal(native[0].request.payload.args.request.path, "D:/B/");
	assert.equal(fallback.length, 0, "successful DSH opens are never duplicated");
	const list = find(render(), (n) => n.type === env.api.WindowedList);
	const row = list.props.renderItem(list.props.items[0]);
	row.props.onOpenDir("", "src"); render(); await tick();
	nativeError = { code: "gateway/internal", message: "path open failed" };
	await menu().props.items[0].run();
	await row.props.onOpenFolder("src/file.md", false);
	await row.props.onOpenFolder("src", true);
	assert.equal(JSON.stringify(fallback), JSON.stringify(Array(3).fill({ repo: "D:/B", path: "src" })));
	assert.equal(native.at(-1).request.payload.args.request.path, "D:/B/src");
	nativeError = { code: "gateway/bad-request", message: "Path has no verified Host path" };
	await menu().props.items[0].run();
	assert.equal(fallback.length, 3, "invalid host paths cannot trigger fallback");
	nativeError = { code: "gateway/unauthorized", message: "unauthorized" };
	await menu().props.items[0].run();
	assert.equal(fallback.length, 3, "authentication failures cannot trigger fallback");
	assert.ok(find(render(), (n) => n.children?.includes("unauthorized")));
	env.unmount();
});

test("workspace entry returns to root; headerless split lists retain directory navigation", async () => {
	const env = harness(async (_method, { path }) => ({ entries: path === "" ? [{ name: "src", path: "src", type: "dir" }] : path === "src" ? [{ name: "sub", path: "src/sub", type: "dir" }] : [] }));
	const rootNavigationRef = { current: null };
	const props = { cwd: "D:/B", status: null, refreshTick: 0, rootNavigationRef };
	const render = () => env.render(env.api.FileBrowser, props);
	const all = (node, predicate) => {
		if (!node || typeof node !== "object") return [];
		return [...(predicate(node) ? [node] : []), ...(node.children ?? []).flatMap((child) => all(child, predicate))];
	};
	const lists = (node) => all(node, (n) => n.type === env.api.WindowedList);
	render(); await tick(); let node = render();
	assertDirectoryAnchor(env, node, false);
	assert.equal(find(node, (n) => n.props.className?.includes("dgp-crumbRoot")), undefined);
	let list = lists(node)[0];
	list.props.renderItem(list.props.items[0]).props.onOpenDir("", "src"); render(); await tick(); node = render();
	assert.deepEqual(lists(node).map((n) => n.props.key), ["", "src"]);
	assert.ok(find(node, (n) => n.type === "button" && n.props.title === "src"));
	list = lists(node).find((n) => n.props.key === "src");
	list.props.renderItem(list.props.items[0]).props.onOpenDir("src", "src/sub"); render(); await tick(); render(); await tick(); node = render();
	assert.deepEqual(lists(node).map((n) => n.props.key), ["src"]);
	assert.ok(find(node, (n) => n.props.className === "dgp-paneEmpty"), "empty subdirectory retains its pane without a row viewport");
	assert.ok(find(node, (n) => n.type === "button" && n.props.title === "src/sub"));
	assertDirectoryAnchor(env, node, false);
	find(node, (n) => n.type === "button" && n.props.title === "搜索当前目录…").props.onClick({ preventDefault() {}, stopPropagation() {} });
	node = render();
	assertDirectoryAnchor(env, node, true);
	find(node, (n) => n.props.className === "dgp-search").props.onKeyDown({ key: "Escape", preventDefault() {}, stopPropagation() {} });
	node = render();
	assertDirectoryAnchor(env, node, false);
	rootNavigationRef.current(""); node = render();
	assert.equal(lists(node).length, 1);
	env.api.narrowStore.set(true); node = render();
	assertDirectoryAnchor(env, node, false);
	find(node, (n) => n.type === "button" && n.props.title === "搜索当前目录…").props.onClick({ preventDefault() {}, stopPropagation() {} });
	assertDirectoryAnchor(env, render(), true);
	env.unmount(); assert.equal(rootNavigationRef.current, null, "unmount releases the root navigation binding");
});

test("toolbar portals into the shared header while the editor remains in its stable body host", async () => {
	const { env, fake, render, props } = await browserFixture("const original = 1;");
	const editorHost = find(render(), (n) => n.props.className === "dgp-editorHost").props.ref.current;
	props.headerHost = null;
	assert.equal(find(render(), (n) => n.props.className === "dgp-pageToolbar dgp-fileToolbar"), undefined);
	props.headerHost = {};
	let node = render(), port = find(node, (n) => n.type === "portal");
	assert.equal(port.props.host, props.headerHost);
	assert.ok(find(port, (n) => n.props.className === "dgp-pageToolbar dgp-fileToolbar"));
	assert.equal(find(port, (n) => n.props.className === "dgp-editorHost"), undefined);
	assert.equal(find(node, (n) => n.props.className === "dgp-editorHost").props.ref.current, editorHost);
	clickLabel(port, "编辑"); node = render();
	port = find(node, (n) => n.type === "portal");
	assert.ok(find(port, (n) => n.type === "button" && n.children.includes("保存")));
	const search = find(port, (n) => n.type === "button" && n.props.title === "搜索当前目录…");
	search.props.onClick({ preventDefault() {}, stopPropagation() {} });
	node = render();
	assert.ok(find(node, (n) => n.props.className === "dgp-search"));
	assert.ok(find(node, (n) => n.type === "button" && n.children.includes("保存")), "search does not replace edit actions");
	assert.equal(find(node, (n) => n.props.className === "dgp-editorHost").props.ref.current, editorHost);
	assert.equal(fake.created.length, 1); assert.equal(fake.disposed.length, 0);
	env.unmount();
});

test("preview groups directory/navigation apart from file actions; file more preserves copy/download/close", async () => {
	const { env, fake, render, props } = await browserFixture("const original = 1;");
	const navigation = { type: "button", props: { className: "test-navigation" }, children: ["Git"] };
	props.pageNavigation = navigation;
	let node = render();
	const head = find(node, (n) => n.props.className === "dgp-pageToolbar dgp-fileToolbar");
	const context = find(head, (n) => n.props.className === "dgp-fileContext");
	const actions = find(head, (n) => n.props.className === "dgp-pageActions");
	assert.ok(find(context, (n) => n.type === env.api.ToolbarMenu && n.props.label === "目录操作"));
	const searchSlot = find(head, (n) => n.props.className === "dgp-fileSearchSlot");
	assert.ok(find(searchSlot, (n) => n.type === "button" && n.props.title === "搜索当前目录…"));
	assert.equal(find(context, (n) => n.type === "button" && n.props.title === "搜索当前目录…"), undefined);
	const divider = find(head, (n) => n.props.className === "dgp-toolbarDivider");
	assert.ok(head.children.indexOf(context) < head.children.indexOf(divider));
	assert.ok(head.children.indexOf(divider) < head.children.indexOf(navigation));
	assert.ok(head.children.indexOf(navigation) < head.children.indexOf(searchSlot));
	assert.ok(head.children.indexOf(searchSlot) < head.children.indexOf(actions));
	assert.equal(find(actions, (n) => n.props.className === "dgp-directoryActions"), undefined);
	assert.equal(find(actions, (n) => n === navigation), undefined);
	assert.equal(find(head, (n) => n.type === "button" && n.props.title === "关闭预览"), undefined);
	assert.equal(find(head, (n) => n.props.className === "dgp-previewCopy"), undefined);
	const menu = find(actions, (n) => n.type === env.api.ToolbarMenu && n.props.label === "文件操作");
	assert.ok(menu.props.items.some((i) => i?.label === "复制内容"));
	assert.ok(menu.props.items.some((i) => i?.label === "下载"));
	find(searchSlot, (n) => n.type === "button" && n.props.title === "搜索当前目录…").props.onClick({ preventDefault() {}, stopPropagation() {} });
	find(render(), (n) => n.props.className === "dgp-search").props.onChange({ target: { value: "sample" } });
	assert.ok(find(render(), (n) => n.type === env.api.ToolbarMenu && n.props.label === "目录操作"), "filtering keeps directory selection/upload actions outside the input");
	clickLabel(head, "编辑"); node = render();
	assert.ok(find(node, (n) => n.type === "button" && n.children.includes("保存")));
	assert.equal(fake.created.length, 1); assert.equal(fake.disposed.length, 0);
	find(node, (n) => n.type === env.api.ToolbarMenu && n.props.label === "文件操作").props.items.find((i) => i?.label === "关闭预览").run();
	assert.equal(find(render(), (n) => n.props.className === "dgp-previewName"), undefined);
	assert.equal(fake.disposed.length, 1);
	env.unmount();
});

test("narrow preview keeps modes/search/close in file more while save/cancel remain reachable", async () => {
	const { env, render, open } = await browserFixture("<h1>Hello</h1>", "sample.html");
	env.api.narrowStore.set(true);
	await open(); render(); await tick();
	const menu = () => find(render(), (n) => n.type === env.api.ToolbarMenu && n.props.label === "文件操作");
	const labels = menu().props.items.filter(Boolean).map((i) => i.label);
	for (const label of ["预览", "源码", "搜索当前目录…", "关闭预览"]) assert.ok(labels.includes(label));
	menu().props.items.find((i) => i?.label === "源码").run();
	clickLabel(render(), "编辑"); render(); await tick();
	menu().props.items.find((i) => i?.label === "搜索当前目录…").run();
	const node = render();
	assert.ok(find(node, (n) => n.props.className === "dgp-search"));
	assert.equal(find(node, (n) => n.type === env.api.ToolbarMenu && n.props.label === "目录操作"), undefined, "narrow preview does not put directory controls into its filename");
	assert.equal(find(node, (n) => n.props.className === "dgp-contextPath").children[0].props.className, "dgp-previewName");
	assert.ok(find(node, (n) => n.type === "button" && n.children.includes("保存")));
	assert.ok(find(node, (n) => n.type === "button" && n.children.includes("取消")));
	env.unmount();
});

test("editor assets start before a slow file read completes; closing cancels the result", async () => {
	const read = deferred(), fake = fakeMonaco();
	let loads = 0;
	const env = harness(async (method) => method === "read" ? read.promise : { entries: [{ name: "slow.js", path: "slow.js", type: "file" }] });
	env.api.setMonacoForTest(fake.monaco);
	env.api.setMonacoLoaderForTest(async () => { loads++; return fake.monaco; });
	const props = { cwd: "D:/B", status: null, refreshTick: 0 };
	const render = () => env.render(env.api.FileBrowser, props);
	render(); await tick();
	const list = find(render(), (n) => n.type === env.api.WindowedList);
	const pending = list.props.renderItem(list.props.items[0]).props.onOpenPreview("", "slow.js");
	assert.equal(loads, 1, "asset loading overlaps read rather than waiting for it");
	let node = render();
	assert.ok(find(node, (n) => n.props.className === "dgp-previewName" && n.children[0] === "slow.js"));
	assert.equal(find(node, (n) => n.type === "button" && n.children.includes("编辑")), undefined);
	find(node, (n) => n.type === env.api.ToolbarMenu && n.props.label === "文件操作").props.items.find((i) => i?.label === "关闭预览").run(); render();
	read.resolve({ text: "old response", binary: false }); await pending;
	node = render();
	assert.equal(find(node, (n) => n.props.className === "dgp-previewName"), undefined);
	env.unmount();
});

test("cancelled editor initialization never creates a stale model", async () => {
	const pending = deferred(), env = harness(), fake = fakeMonaco();
	env.api.setMonacoForTest(fake.monaco);
	env.api.setMonacoLoaderForTest(() => pending.promise);
	const controller = new AbortController();
	const result = env.api.mountMonacoEditor({}, { value: "a".repeat(512 * 1024), path: "huge.js", signal: controller.signal });
	controller.abort(); pending.resolve(fake.monaco);
	await assert.rejects(result, { name: "AbortError" });
	assert.equal(fake.created.length, 0);
});

test("large source uses a viewport editor; small source stays lightweight", async () => {
	const large = await browserFixture("line\n".repeat(2000), "sample.txt");
	assert.equal(large.fake.created.length, 1);
	assert.equal(large.fake.created[0].options.language, "plaintext");
	assert.equal(large.fake.created[0].options.lineNumbers, "off");
	assert.equal(find(large.render(), (n) => n.type === "pre"), undefined);
	clickLabel(large.render(), "编辑"); large.render();
	assert.equal(large.fake.created.length, 1);
	assert.equal(large.fake.created[0].options.readOnly, false);
	assert.equal(large.fake.created[0].options.quickSuggestions, false);
	assert.equal(large.fake.created[0].options.folding, false);
	assert.equal(large.fake.created[0].options.wordBasedSuggestions, "off");
	large.env.unmount();
	const small = await browserFixture("short source", "sample.txt");
	assert.equal(small.fake.created.length, 0);
	assert.equal(find(small.render(), (n) => n.type === "pre").children[0], "short source");
	small.env.unmount();
});

test("long minified lines skip expensive tokenization and source wrapping; truncated text stays read-only", async () => {
	const { env, fake, render } = await browserFixture("x".repeat(2200), "sample.js", { truncated: true });
	assert.equal(fake.created[0].options.maxTokenizationLineLength, 2000);
	assert.equal(find(render(), (n) => n.type === "button" && n.children.includes("编辑")), undefined);
	clickLabel(render(), "源码"); render();
	assert.equal(fake.created.length, 1);
	assert.equal(fake.created[0].options.wordWrap, "off");
	assert.equal(fake.created[0].model.language, "plaintext");
	assert.match(fake.created[0].model.value, /512KB/);
	env.unmount();
});

test("Monaco warmup works without a search index and is cancelled on panel close", async () => {
	const env = harness(async () => ({ entries: [] }), { timers: true });
	let loads = 0;
	env.api.setMonacoLoaderForTest(async () => { loads++; return {}; });
	env.render(env.api.FileBrowser, { cwd: "D:/B", status: null, refreshTick: 0 });
	assert.equal(env.runTimer(1200), true);
	assert.equal(loads, 1);
	env.unmount();
	const closed = harness(async () => ({ entries: [] }), { timers: true });
	closed.render(closed.api.FileBrowser, { cwd: "D:/B", status: null, refreshTick: 0 });
	closed.unmount();
	assert.equal(closed.runTimer(1200), false);
});

test("Markdown progress appends stable blocks without replacing rendered HTML", async () => {
	const text = ("# Heading\n\nparagraph with **bold**.\n\n").repeat(1200);
	const { env, render, fake } = await browserFixture(text, "sample.md");
	clickLabel(render(), "预览"); render();
	assert.equal(env.runTimer(0), true);
	let node = render(), first = find(node, (n) => n.props.className === "dgp-mdChunk");
	assert.ok(first);
	assert.equal(env.runTimer(0), true);
	node = render();
	const container = find(node, (n) => n.props.className === "dgp-md");
	assert.equal(container.children[0], first, "previous element/HTML identity remains unchanged");
	assert.equal(container.children.length, 2);
	let steps = 2;
	while (env.runTimer(0)) { steps++; render(); assert.ok(steps < 100); }
	const blocks = find(render(), (n) => n.props.className === "dgp-md").children;
	assert.equal(blocks.map((b) => b.props.dangerouslySetInnerHTML.__html).join(""), env.api.renderMarkdown(text));
	assert.equal(fake.created.length, 1, "rendered Markdown creates no editor beyond the initial large source view");
	assert.equal(fake.disposed.length, 1, "leaving source mode releases its editor");
	clickLabel(render(), "源码"); render();
	assert.equal(env.runTimer(0), false);
	env.unmount();
});

test("large Markdown code fences preserve characters with bounded highlight markup", () => {
	const { api } = harness();
	const body = "const value = '<script>';\n".repeat(4000);
	const html = api.renderMarkdown("```js\n" + body + "```");
	assert.equal(html.includes("dgp-tk-"), false);
	assert.equal((html.match(/&lt;script&gt;/g) ?? []).length, 4000);
	assert.ok(html.length < body.length * 2, "large fence avoids per-token DOM spans");
});

test("external and workspace previews share stale-result protection", async () => {
	const external = deferred();
	const env = harness(async (method) => {
		if (method === "readPath") return external.promise;
		if (method === "read") return { text: "workspace", binary: false };
		return { entries: [{ name: "a.txt", path: "a.txt", type: "file" }] };
	});
	const props = { cwd: "D:/B", status: null, refreshTick: 0 }, render = () => env.render(env.api.FileBrowser, props);
	render(); await tick();
	env.api.openReqStore.request("D:/outside/external.txt"); render();
	const list = find(render(), (n) => n.type === env.api.WindowedList);
	await list.props.renderItem(list.props.items[0]).props.onOpenPreview("", "a.txt"); render();
	external.resolve({ text: "external old", binary: false }); await tick();
	assert.equal(find(render(), (n) => n.props.className === "dgp-previewName").children[0], "a.txt");
	assert.equal(find(render(), (n) => n.type === "pre").children[0], "workspace");
	env.unmount();
});


test("rapid file switches discard pending editor mounts and dispose the previous model", async () => {
	const { env, fake, render, open } = await browserFixture("const a = 1;");
	const pending = deferred();
	env.api.setMonacoLoaderForTest(() => pending.promise);
	await open("b.js"); render();
	await open("c.js"); render();
	assert.equal(fake.disposed.length, 1);
	pending.resolve(fake.monaco); await tick(); render();
	assert.equal(fake.created.length, 2, "only the active C editor mounts after shared loader completion");
	assert.equal(find(render(), (n) => n.props.className === "dgp-previewName").children[0], "c.js");
	env.unmount();
	assert.equal(fake.disposed.length, 2);
});

test("a slow save of A cannot leave edit mode or replace content in B", async () => {
	const pending = deferred(), fake = fakeMonaco();
	const env = harness(async (method, payload) => {
		if (method === "list") return { entries: [{ name: "a.js", path: "a.js", type: "file" }] };
		if (method === "read") return { text: payload.path, binary: false };
		if (method === "write") return pending.promise;
	}, { attachEditorHost: true });
	env.api.setMonacoForTest(fake.monaco);
	const props = { cwd: "D:/B", status: null, refreshTick: 0 }, render = () => env.render(env.api.FileBrowser, props);
	render(); await tick();
	const list = find(render(), (n) => n.type === env.api.WindowedList);
	const open = (path) => list.props.renderItem(list.props.items[0]).props.onOpenPreview("", path);
	await open("a.js"); render(); await tick(); render();
	clickLabel(render(), "编辑"); render();
	fake.created[0].model.value = "saved a";
	clickLabel(render(), "保存");
	await open("b.js"); render(); await tick(); render();
	clickLabel(render(), "编辑"); render();
	fake.created[1].model.value = "unsaved b";
	pending.resolve({}); await tick(); render();
	assert.equal(fake.created[1].options.readOnly, false);
	assert.equal(fake.created[1].model.value, "unsaved b");
	env.unmount();
});


test("Monaco worker factories survive core overwrite and point all languages at the refreshed port", async () => {
	const env = harness(undefined, { workerAssets: true });
	const firstBase = "http://127.0.0.1:4001/vendor/monaco/vs";
	env.api.configureMonacoAssets(firstBase);
	env.api.overrideWorkerFactoryForTest(); // editor.main overwrites the pre-load factory
	env.api.configureMonacoAssets(firstBase);
	const first = env.api.getWorkerForTest("json");
	assert.match(await env.workerBlobs.get(first.url).text(), /4001/);
	const nextBase = "http://127.0.0.1:4002/vendor/monaco/vs";
	env.api.configureMonacoAssets(nextBase);
	for (const label of ["json", "css", "scss", "less", "html", "razor", "handlebars", "typescript", "javascript", "editorWorkerService"]) {
		const worker = env.api.getWorkerForTest(label);
		const source = await env.workerBlobs.get(worker.url).text();
		const loaded = [], messages = [];
		vm.runInNewContext(source, { importScripts: (url) => loaded.push(url), postMessage: (message) => messages.push(message.type) });
		assert.equal(loaded.length, 1);
		assert.ok(loaded[0].startsWith(nextBase + "/assets/"));
		const rel = loaded[0].slice(nextBase.length + 1);
		assert.ok(readFileSync(new URL(`../vendor/monaco/vs/${rel}`, import.meta.url)).length > 0, "every selected entry is actually vendored");
		assert.deepEqual(messages, ["vscode-worker-ready"], "matches the shipped worker handshake");
		assert.equal(env.api.getWorkerForTest(label).url, worker.url, "blob URLs are reused per port and worker kind");
	}
	assert.match(await env.workerBlobs.get(first.url).text(), /4001/, "existing worker bootstrap remains valid for its original instance");
	assert.equal(env.workerBlobs.size, 6, "five worker kinds at the new port, one at the old port");
});
