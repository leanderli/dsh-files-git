import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import * as desktop from "../lib/server/desktop.js";
import { openDesktopDirectory } from "../lib/server/desktop.js";

const directory = fileURLToPath(new URL("../", import.meta.url));
const file = fileURLToPath(new URL("../package.json", import.meta.url));

test("Windows associated-file opener uses SystemRoot and preserves the file path as argv", async () => {
	assert.equal(typeof desktop.openDesktopFile, "function", "the sidecar exposes a contained-file opener");
	let call;
	await desktop.openDesktopFile(file, { platform: "win32", env: { SystemRoot: "C:\\WINDOWS", PATH: "" }, run: async (...args) => { call = args; } });
	assert.equal(call[0], "C:\\WINDOWS\\System32\\rundll32.exe");
	assert.deepEqual(call[1], ["url.dll,FileProtocolHandler", file]);
	assert.equal(call[2].shell, false);
});

test("file associated opener rejects directories before launching an application", async () => {
	assert.equal(typeof desktop.openDesktopFile, "function", "the sidecar exposes a contained-file opener");
	let launched = false;
	await assert.rejects(desktop.openDesktopFile(directory, { run: async () => { launched = true; } }), /not a file/);
	assert.equal(launched, false);
});

test("Windows directory handoff uses SystemRoot even when PATH contains no Explorer", async () => {
	let call;
	await openDesktopDirectory(directory, { platform: "win32", env: { SystemRoot: "C:\\WINDOWS", PATH: "" }, run: async (...args) => { call = args; } });
	assert.equal(call[0], "C:\\WINDOWS\\explorer.exe");
	assert.deepEqual(call[1], [directory]);
	assert.equal(call[2].shell, false);
	assert.equal(call[2].windowsHide, false);
});

test("Explorer delegate exit 1 is accepted; genuine failures and cancellation remain final", async () => {
	const fail = (code) => async () => { throw Object.assign(new Error("native failure"), { code }); };
	await openDesktopDirectory(directory, { platform: "win32", run: fail(1) });
	await assert.rejects(openDesktopDirectory(directory, { platform: "win32", run: fail(2) }), /native failure/);
	const controller = new AbortController();
	await assert.rejects(openDesktopDirectory(directory, { platform: "win32", signal: controller.signal, run: async () => { controller.abort(); throw Object.assign(new Error("delegate"), { code: 1 }); } }), { name: "AbortError" });
});

test("directory opening rejects files before launching a program", async () => {
	let launched = false;
	await assert.rejects(openDesktopDirectory(fileURLToPath(new URL("../package.json", import.meta.url)), { run: async () => { launched = true; } }), /not a directory/);
	assert.equal(launched, false);
});

test("macOS and Linux keep directory-opening semantics and do not swallow exit 1", async () => {
	for (const [platform, command] of [["darwin", "/usr/bin/open"], ["linux", "xdg-open"]]) {
		await openDesktopDirectory(directory, { platform, run: async (actual, args) => { assert.equal(actual, command); assert.deepEqual(args, [directory]); } });
		await assert.rejects(openDesktopDirectory(directory, { platform, run: async () => { throw Object.assign(new Error("native failure"), { code: 1 }); } }), /native failure/);
	}
});
