import { execFile } from "node:child_process";
import { stat } from "node:fs/promises";
import { win32 } from "node:path";
import { promisify } from "node:util";

const execute = promisify(execFile);

export async function openDesktopFile(target, { signal, platform = process.platform, env = process.env, run = execute } = {}) {
	signal?.throwIfAborted();
	if (!(await stat(target)).isFile()) throw new Error("Target is not a file");
	const command = platform === "win32" ? win32.join(env.SystemRoot || env.WINDIR || "C:\\Windows", "System32", "rundll32.exe")
		: platform === "darwin" ? "/usr/bin/open" : platform === "linux" ? "xdg-open" : null;
	if (!command || (platform === "win32" && !win32.isAbsolute(command))) throw new Error("Native file opener is unavailable");
	const args = platform === "win32" ? ["url.dll,FileProtocolHandler", target] : [target];
	await run(command, args, { signal, shell: false, windowsHide: false, timeout: 10000, maxBuffer: 65536 });
	return { opened: true };
}

/** Open an already containment-checked directory, using argv rather than a shell. */
export async function openDesktopDirectory(target, { signal, platform = process.platform, env = process.env, run = execute } = {}) {
	signal?.throwIfAborted();
	if (!(await stat(target)).isDirectory()) throw new Error("Target is not a directory");
	const command = platform === "win32" ? win32.join(env.SystemRoot || env.WINDIR || "C:\\Windows", "explorer.exe")
		: platform === "darwin" ? "/usr/bin/open" : platform === "linux" ? "xdg-open" : null;
	if (!command || (platform === "win32" && !win32.isAbsolute(command))) throw new Error("Native directory opener is unavailable");
	try {
		await run(command, [target], { signal, shell: false, windowsHide: false, timeout: 10000, maxBuffer: 65536 });
	} catch (error) {
		signal?.throwIfAborted();
		// Explorer returns 1 when it delegates to the running desktop shell.
		if (platform !== "win32" || error?.code !== 1) throw error;
	}
	return { opened: true };
}
