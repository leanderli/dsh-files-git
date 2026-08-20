/**
 * dsh-files-git — host half.
 *
 * Registers the loopback-trusted `/git-api` RPC channel (through the shared
 * `connection` channel registry, so the standard browser trust fence applies)
 * and serves two feature families for the Web file panel:
 *
 *  - git operations in the current session's workspace directory, and
 *  - read-only file browsing of that same directory (list / read, confined
 *    to the workspace root by a resolve + realpath containment check).
 *
 * The browser half talks to these endpoints with the standard
 * client-request envelope:
 *
 *   POST /git-api/<endpoint>  { type: "client-request", rpcId, method: <endpoint>, payload }
 *
 * Endpoints:
 *   status  { repo? }                       → branch/ahead/behind + change lists
 *   diff    { repo?, staged?, path? }       → raw unified diff text (capped)
 *   log     { repo?, count? }               → recent `--oneline` commits
 *   commit  { repo?, message, paths?, all?, amend? } → add (optional) + commit
 *   push    { repo?, force? }               → push (with -u when no upstream)
 *   pull    { repo?, rebase? }              → pull (optionally --rebase)
 *   fetch   { repo? }                       → fetch --prune
 *   config  { repo? }                       → user.name / user.email / remote url
 *   branches { repo? }                      → all local/remote branches (current/upstream/sha)
 *   checkout { repo?, branch, create?, start? } → git checkout / checkout -b
 *   merge   { repo?, branch }               → merge branch into current
 *   update  { repo?, branch }               → fast-forward branch from its upstream
 *   rename  { repo?, branch, name }         → git branch -m
 *   stage   { repo?, path }                 → git add -- path (file or directory)
 *   unstage { repo?, path }                 → git restore --staged -- path
 *   untrack { repo?, path }                 → git rm --cached -r -- path (untrack, keep on disk)
 *   gitignore { repo?, path }               → append path to .gitignore
 *   list    { repo?, path? }                → one directory level (relative paths)
 *   read    { repo?, path, maxBytes? }      → text file content (binary/truncation flagged)
 *   readPath { repo?, path, maxBytes? }     → absolute-path read (not workspace-constrained)
 *   readBlob { repo?, path | abs }          → base64 binary read for media preview (image/pdf/html)
 *   write   { repo?, path|abs, content }    → save text back (workspace-relative or absolute)
 *
 * The plugin has zero runtime dependencies (Node builtins only), so it can be
 * installed into a profile without network access.
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { readdir, stat, writeFile } from "node:fs/promises";
import { isAbsolute, join, resolve, sep } from "node:path";

const name = "files-git";

/** Required services: the shared channel registry (node half of dsh-client-connection) and the HTTP route registry (its register() reads owner.webServer). */
const inject = ["connection", "webServer"];

/** RPC channel prefix (single path segment; the connection service asserts the pattern). */
const CHANNEL = "/git-api";

const STATUS_TIMEOUT_MS = 30000;
const MUTATION_TIMEOUT_MS = 180000;

/** Cap one command's captured output (diff can be huge). */
const MAX_OUTPUT_BYTES = 512 * 1024;

function fail(code, message) {
	return { ok: false, error: { code, message } };
}

function ok(value) {
	return { ok: true, value };
}

/**
 * Run one git command in `repo` without a shell (argv is never string-joined,
 * so paths and messages cannot inject shell syntax). Returns
 * { code, stdout, stderr } — never throws for a non-zero exit.
 */
function runGit(gitPath, repo, args, { timeoutMs = STATUS_TIMEOUT_MS, signal } = {}) {
	return new Promise((resolve) => {
		let child;
		try {
			child = spawn(gitPath, ["-C", repo, ...args], {
				env: {
					...process.env,
					// Fast-fail instead of hanging on terminal credential prompts.
					GIT_TERMINAL_PROMPT: "0",
					LC_ALL: "C"
				},
				windowsHide: true,
				stdio: ["ignore", "pipe", "pipe"]
			});
		} catch (error) {
			resolve({ code: -1, stdout: "", stderr: String(error) });
			return;
		}
		let stdout = "";
		let stderr = "";
		let settled = false;
		const finish = (code) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			signal?.removeEventListener("abort", onAbort);
			resolve({ code, stdout, stderr });
		};
		const onAbort = () => {
			try {
				child.kill();
			} catch {
				/* already gone */
			}
		};
		const timer = setTimeout(onAbort, timeoutMs);
		signal?.addEventListener("abort", onAbort, { once: true });
		child.stdout.on("data", (d) => {
			if (stdout.length < MAX_OUTPUT_BYTES) stdout += d;
		});
		child.stderr.on("data", (d) => {
			if (stderr.length < MAX_OUTPUT_BYTES) stderr += d;
		});
		child.on("error", (error) => {
			stderr += `\n${String(error?.message ?? error)}`;
			finish(-1);
		});
		child.on("close", (code) => finish(code ?? -1));
	});
}

/**
 * Resolve the git executable. An explicit config wins; otherwise scan PATH for
 * `git.exe`, skipping `.git-ai` shim directories so the panel drives plain git
 * semantics (a wrapper could inject prompts or alter behavior).
 */
function resolveGitPath(configured) {
	if (typeof configured === "string" && configured.trim() !== "") return configured.trim();
	const pathDirs = (process.env.PATH ?? "").split(";").filter(Boolean);
	for (const dir of pathDirs) {
		if (/\.git-ai/i.test(dir)) continue;
		const candidate = join(dir, "git.exe");
		try {
			if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
		} catch {
			/* keep scanning */
		}
	}
	return "git";
}

/** Resolve + validate the repository directory from payload or config default. */
function resolveRepo(payload, defaultRoot) {
	let repo = typeof payload?.repo === "string" && payload.repo.trim() !== "" ? payload.repo.trim() : defaultRoot;
	if (!repo) return fail("invalid-repo", "未指定仓库路径：请在面板顶部输入仓库目录");
	if (!isAbsolute(repo)) return fail("invalid-repo", `仓库路径必须是绝对路径：${repo}`);
	try {
		if (!existsSync(repo)) return fail("invalid-repo", `路径不存在：${repo}`);
		if (!statSync(repo).isDirectory()) return fail("invalid-repo", `路径不是目录：${repo}`);
	} catch (error) {
		return fail("invalid-repo", `无法访问路径 ${repo}：${String(error?.message ?? error)}`);
	}
	return { ok: true, repo };
}

/**
 * Resolve a client-supplied relative path (forward slashes) inside `root` and
 * verify containment: both the lexical resolve AND the realpath must stay
 * under the workspace root, so symlink escapes and `..` traversal fail.
 * @returns {ok:true, target, rel} | fail result
 */
function resolveUnder(root, rel) {
	if (typeof rel !== "string" || rel === "") rel = "";
	if (rel.includes("\0")) return fail("invalid-path", "非法路径");
	const base = resolve(root);
	const target = resolve(base, rel.replace(/\//g, sep));
	if (target !== base && !target.startsWith(base + sep)) {
		return fail("invalid-path", "路径超出工作区范围");
	}
	let baseReal;
	let targetReal;
	try {
		baseReal = realpathSync(base);
		targetReal = realpathSync(target);
	} catch (error) {
		return fail("invalid-path", `无法访问路径：${String(error?.message ?? error)}`);
	}
	if (targetReal !== baseReal && !targetReal.startsWith(baseReal + sep)) {
		return fail("invalid-path", "路径超出工作区范围（符号链接）");
	}
	return { ok: true, target, rel };
}

/** Format a file size for the browser. */
function formatSize(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** List one directory level under the workspace root. */
async function listDirectory(root, rel) {
	const resolved = resolveUnder(root, rel);
	if (!resolved.ok) return resolved;
	const target = resolved.target;
	try {
		if (!(await stat(target)).isDirectory()) return fail("invalid-path", `不是目录：${rel || "(根)"}`);
		const dirents = await readdir(target, { withFileTypes: true });
		// Cap huge directories so one listing never floods the response.
		const MAX_ENTRIES = 4000;
		const capped = dirents.slice(0, MAX_ENTRIES);
		// Parallel stat keeps the host event loop free — a big directory must
		// not stall other RPCs (status polling etc.) behind synchronous stats.
		const entries = await Promise.all(capped.map(async (dirent) => {
			const name = dirent.name;
			const childRel = rel === "" ? name : `${rel}/${name}`;
			let type = "file";
			let size = null;
			try {
				if (dirent.isDirectory()) type = "dir";
				else if (dirent.isFile()) {
					size = (await stat(join(target, name))).size;
				}
				// symlinks (isSymbolicLink) are surfaced as files; reading them is
				// blocked by the realpath containment check.
			} catch {
				/* unreadable entry: still list it as a file without size */
			}
			return { name, path: childRel, type, size };
		}));
		entries.sort((a, b) => {
			if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
			return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
		});
		return ok({ entries, truncated: dirents.length > MAX_ENTRIES });
	} catch (error) {
		return fail("invalid-path", `无法读取目录 ${rel || "(根)"}：${String(error?.message ?? error)}`);
	}
}

/** Read a text file under the workspace root (binary / truncation flagged). */
function readFileUnder(root, rel, maxBytes) {
	const resolved = resolveUnder(root, rel);
	if (!resolved.ok) return resolved;
	const target = resolved.target;
	try {
		const stat = statSync(target);
		if (!stat.isFile()) return fail("invalid-path", `不是文件：${rel}`);
		const cap = Math.max(1024, Math.min(MAX_OUTPUT_BYTES, Number(maxBytes) || MAX_OUTPUT_BYTES));
		const buffer = readFileSync(target);
		const sample = buffer.subarray(0, Math.min(8192, buffer.length));
		if (sample.includes(0)) {
			return ok({ text: "", binary: true, truncated: false, size: buffer.length });
		}
		const text = buffer.subarray(0, cap).toString("utf8");
		return ok({
			text,
			binary: false,
			truncated: buffer.length > cap,
			size: buffer.length
		});
	} catch (error) {
		return fail("invalid-path", `无法读取文件 ${rel}：${String(error?.message ?? error)}`);
	}
}

/**
 * Read a text file by ABSOLUTE path — deliberately NOT workspace-constrained,
 * so produced files from other workspaces can be previewed. Read-only and
 * size-capped; binary detection mirrors readFileUnder. The browser half only
 * calls this after the (also unconstrained, read-only) stat probe confirmed
 * the path is a file.
 */
function readPathAbs(target, maxBytes) {
	try {
		const st = statSync(target);
		if (!st.isFile()) return fail("invalid-path", `不是文件：${target}`);
		const cap = Math.max(1024, Math.min(MAX_OUTPUT_BYTES, Number(maxBytes) || MAX_OUTPUT_BYTES));
		const buffer = readFileSync(target);
		const sample = buffer.subarray(0, Math.min(8192, buffer.length));
		if (sample.includes(0)) {
			return ok({ text: "", binary: true, truncated: false, size: buffer.length });
		}
		const text = buffer.subarray(0, cap).toString("utf8");
		return ok({
			text,
			binary: false,
			truncated: buffer.length > cap,
			size: buffer.length
		});
	} catch (error) {
		return fail("invalid-path", `无法读取文件 ${target}：${String(error?.message ?? error)}`);
	}
}

/** Size cap for one binary preview payload (images / PDFs), base64 transported. */
const MAX_BLOB_BYTES = 20 * 1024 * 1024;

/**
 * Read a binary file as base64 for in-panel media preview (images, PDFs,
 * sandboxed HTML). Two branches mirroring `write`: `path` is a
 * workspace-relative path (containment-checked by resolveUnder); `abs` is an
 * absolute path outside the workspace with the same trust model as
 * readPath/write-abs (the browser only sends paths it has just previewed).
 * The mime type is decided by the browser half from the file extension.
 */
function readBlobFile(repo, payload) {
	const abs = typeof payload.abs === "string" && payload.abs.trim() !== "" ? payload.abs.trim() : "";
	let target;
	if (abs) {
		if (abs.includes("\0")) return fail("invalid-path", "非法路径");
		target = abs;
	} else {
		const rel = typeof payload.path === "string" && payload.path !== "" ? payload.path : "";
		if (!rel) return fail("invalid-path", "未指定文件路径");
		const resolved = resolveUnder(repo, rel);
		if (!resolved.ok) return resolved;
		target = resolved.target;
	}
	try {
		const st = statSync(target);
		if (!st.isFile()) return fail("invalid-path", `不是文件：${target}`);
		if (st.size > MAX_BLOB_BYTES) {
			return fail("too-large", `文件超过 20MB 媒体预览上限（当前 ${(st.size / 1024 / 1024).toFixed(1)}MB）`);
		}
		const buffer = readFileSync(target);
		return ok({ base64: buffer.toString("base64"), size: buffer.length });
	} catch (error) {
		return fail("invalid-path", `无法读取文件 ${target}：${String(error?.message ?? error)}`);
	}
}

/** Wrap a git run and fold a non-git-repo failure into a friendly error. */
async function gitRun(gitPath, repo, args, options) {
	for (let attempt = 0; attempt < 2; attempt++) {
		const result = await runGit(gitPath, repo, args, options);
		if (result.code === 0) return ok({ code: result.code, stdout: result.stdout, stderr: result.stderr });
		// Windows 偶发：git 进程启动即崩溃，退出码 3221225794 (0xC0000142,
		// STATUS_DLL_INIT_FAILED，常见于大量 git 进程并发时 DLL 初始化失败)。
		// 进程崩溃（无 stderr/stdout 输出、退出码为负或该固定码）时自动重试一次。
		const crashed = result.code === 3221225794 || result.code === -1073741718 || (result.code < 0 && !result.stderr.trim() && !result.stdout.trim());
		if (attempt === 0 && crashed) continue;
		const message = (result.stderr || result.stdout || "").trim();
		if (/not a git repository/i.test(message)) {
			return fail("not-a-git-repo", `${repo} 不是 Git 仓库（或未初始化）`);
		}
		return fail("git-error", message || `git 退出码 ${result.code}`);
	}
	return fail("git-error", "git 进程反复启动失败");
}

/** Parse `git status --porcelain=v1 -b` into structured change lists. */
function parseStatus(text) {
	const lines = text.split(/\r?\n/);
	const head = lines.find((line) => line.startsWith("## ")) ?? "";
	let branch = "HEAD";
	let upstream = null;
	let ahead = 0;
	let behind = 0;
	if (head.length > 3) {
		const rest = head.slice(3);
		const dot3 = rest.indexOf("...");
		let bracket = "";
		if (dot3 !== -1) {
			branch = rest.slice(0, dot3);
			const tail = rest.slice(dot3 + 3);
			const sp = tail.indexOf(" ");
			if (sp === -1) upstream = tail;
			else {
				upstream = tail.slice(0, sp);
				bracket = tail.slice(sp + 1);
			}
		} else {
			const sp = rest.indexOf(" ");
			if (sp === -1) branch = rest;
			else {
				branch = rest.slice(0, sp);
				bracket = rest.slice(sp + 1);
			}
		}
		const aheadMatch = /ahead (\d+)/.exec(bracket);
		const behindMatch = /behind (\d+)/.exec(bracket);
		ahead = aheadMatch ? Number(aheadMatch[1]) : 0;
		behind = behindMatch ? Number(behindMatch[1]) : 0;
	}
	const staged = [];
	const unstaged = [];
	const untracked = [];
	const conflicts = [];
	for (const line of lines) {
		if (line.startsWith("## ") || line.trim() === "") continue;
		const code = line.slice(0, 2);
		let path = line.slice(3);
		if (code[0] === "R" || code[0] === "C") {
			const arrow = path.indexOf(" -> ");
			if (arrow !== -1) path = `${path.slice(0, arrow)} -> ${path.slice(arrow + 4)}`;
		}
		const entry = { code, path };
		const isConflict =
			code[0] === "U" ||
			code[1] === "U" ||
			(code[0] === code[1] && (code[0] === "A" || code[0] === "D"));
		if (isConflict) conflicts.push(entry);
		else if (code === "??") untracked.push({ code, path });
		else if (code[0] !== " " && code[0] !== "?" && code[0] !== "!") staged.push(entry);
		else if (code[1] !== " " && code[1] !== "?" && code[1] !== "!") unstaged.push(entry);
	}
	return {
		branch,
		upstream,
		ahead,
		behind,
		detached: branch === "HEAD",
		staged,
		unstaged,
		untracked,
		conflicts
	};
}

/** Dispatch one RPC endpoint. Every branch returns an RpcResult. */
async function dispatch(endpoint, payload, env) {
	const { gitPath, defaultRoot, signal } = env;
	const repoRes = resolveRepo(payload, defaultRoot);
	if (!repoRes.ok) return repoRes;
	const repo = repoRes.repo;

	switch (endpoint) {
		case "status": {
			const result = await gitRun(gitPath, repo, ["status", "--porcelain=v1", "-b"], { signal });
			if (!result.ok) return result;
			const parsed = parseStatus(result.value.stdout);
			// `git status --porcelain` collapses an untracked directory to a
			// single `?? dir/` entry; expand it via `ls-files --others` so the
			// change list shows the real files (dir-tree friendly, each file
			// readable/diffable). Only runs when a collapsed dir entry exists.
			if (parsed.untracked.some((e) => /[\\/]$/.test(e.path))) {
				const ls = await gitRun(gitPath, repo, ["ls-files", "--others", "--exclude-standard"], { signal });
				if (ls.ok) {
					const files = ls.value.stdout.split(/\r?\n/).filter(Boolean);
					if (files.length > 0) parsed.untracked = files.map((p) => ({ code: "??", path: p }));
				}
			}
			return ok({ repo, ...parsed });
		}
		case "diff": {
			const args = ["diff", "--no-color"];
			if (payload.staged === true) args.push("--cached");
			if (typeof payload.path === "string" && payload.path.trim() !== "") args.push("--", payload.path.trim());
			const result = await gitRun(gitPath, repo, args, { signal });
			if (!result.ok) return result;
			const text = result.value.stdout;
			return ok({
				text,
				truncated: text.length >= MAX_OUTPUT_BYTES
			});
		}
		case "log": {
			const count = Math.max(1, Math.min(100, Number(payload.count) || 25));
			const result = await gitRun(gitPath, repo, ["log", "--oneline", "--decorate", "-n", String(count)], { signal });
			if (!result.ok) return result;
			return ok({
				lines: result.value.stdout.split(/\r?\n/).filter(Boolean)
			});
		}
		case "show": {
			// One commit. Without `path`: the commit's changed-file list
			// (--name-status). With `path`: that single file's patch text.
			const target = typeof payload.target === "string" ? payload.target.trim() : "";
			if (!target) return fail("git-error", "未指定要查看的提交");
			if (typeof payload.path === "string" && payload.path.trim() !== "") {
				const result = await gitRun(gitPath, repo, ["show", "--no-color", "--format=", target, "--", payload.path.trim()], { signal });
				if (!result.ok) return result;
				const text = result.value.stdout;
				return ok({ text, truncated: text.length >= MAX_OUTPUT_BYTES, files: [] });
			}
			const result = await gitRun(gitPath, repo, ["show", "--name-status", "--format=", target], { signal });
			if (!result.ok) return result;
			const files = result.value.stdout.split(/\r?\n/).filter(Boolean).map((line) => {
				const parts = line.split("\t");
				const code = parts[0] || "M";
				const path = parts[parts.length - 1] || "";   // rename rows: last field = new path
				return { code: code[0], path };
			}).filter((f) => f.path !== "");
			return ok({ text: "", truncated: false, files });
		}
		case "commit": {
			const message = typeof payload.message === "string" ? payload.message.trim() : "";
			if (!message) return fail("git-error", "提交信息不能为空");
			const steps = [];
			if (payload.all === true) {
				steps.push(["add", "-A"]);
			} else if (Array.isArray(payload.paths) && payload.paths.length > 0) {
				steps.push(["add", "--", ...payload.paths.map(String)]);
			}
			for (const args of steps) {
				const add = await gitRun(gitPath, repo, args, { signal, timeoutMs: MUTATION_TIMEOUT_MS });
				if (!add.ok) return add;
			}
			const commitArgs = ["commit", "-m", message];
			if (payload.amend === true) commitArgs.push("--amend");
			const commit = await gitRun(gitPath, repo, commitArgs, { signal, timeoutMs: MUTATION_TIMEOUT_MS });
			if (!commit.ok) return commit;
			return ok({ output: (commit.value.stdout || commit.value.stderr).trim() });
		}
		case "push": {
			// Determine whether the current branch has an upstream.
			const statusResult = await gitRun(gitPath, repo, ["status", "--porcelain=v1", "-b"], { signal });
			if (!statusResult.ok) return statusResult;
			const parsed = parseStatus(statusResult.value.stdout);
			const args = ["push"];
			if (payload.force === true) args.push("--force-with-lease");
			if (!parsed.upstream && parsed.branch !== "HEAD") {
				args.push("-u", "origin", parsed.branch);
			}
			const push = await gitRun(gitPath, repo, args, { signal, timeoutMs: MUTATION_TIMEOUT_MS });
			if (!push.ok) return push;
			return ok({ output: (push.value.stdout || push.value.stderr).trim() });
		}
		case "pull": {
			const args = ["pull"];
			if (payload.rebase === true) args.push("--rebase");
			const pull = await gitRun(gitPath, repo, args, { signal, timeoutMs: MUTATION_TIMEOUT_MS });
			if (!pull.ok) return pull;
			return ok({ output: (pull.value.stdout || pull.value.stderr).trim() });
		}
		case "fetch": {
			const fetch = await gitRun(gitPath, repo, ["fetch", "--prune"], { signal, timeoutMs: MUTATION_TIMEOUT_MS });
			if (!fetch.ok) return fetch;
			return ok({ output: (fetch.value.stdout || fetch.value.stderr).trim() });
		}
		case "config": {
			const get = async (key) => {
				const result = await gitRun(gitPath, repo, ["config", "--get", key], { signal });
				return result.ok ? result.value.stdout.trim() : "";
			};
			const [nameValue, email, remote] = await Promise.all([
				get("user.name"),
				get("user.email"),
				get("remote.origin.url")
			]);
			return ok({ name: nameValue, email, remote });
		}
		case "branches": {
			// All local + remote branches with current/upstream/sha. Parsed from
			// for-each-ref so names containing spaces survive (no whitespace split).
			const result = await gitRun(gitPath, repo, ["for-each-ref", "--format=%(HEAD)|%(refname:short)|%(upstream:short)|%(objectname:short)", "refs/heads", "refs/remotes"], { signal });
			if (!result.ok) return result;
			const branches = result.value.stdout.split(/\r?\n/).filter(Boolean).map((line) => {
				const [marker, name, upstream, sha] = line.split("|");
				return {
					name,
					current: marker === "*",
					remote: name.startsWith("origin/"),
					upstream: upstream || null,
					sha: (sha || "").slice(0, 7)
				};
			});
			return ok({ branches });
		}
		case "checkout": {
			const branch = typeof payload.branch === "string" ? payload.branch.trim() : "";
			if (!branch) return fail("git-error", "未指定分支");
			const args = ["checkout"];
			if (payload.create === true) {
				args.push("-b", branch);
				if (typeof payload.start === "string" && payload.start.trim() !== "") args.push(payload.start.trim());
			} else {
				args.push(branch);
			}
			const result = await gitRun(gitPath, repo, args, { signal, timeoutMs: MUTATION_TIMEOUT_MS });
			if (!result.ok) return result;
			return ok({ output: (result.value.stdout || result.value.stderr).trim() });
		}
		case "merge": {
			const branch = typeof payload.branch === "string" ? payload.branch.trim() : "";
			if (!branch) return fail("git-error", "未指定要合并的分支");
			const result = await gitRun(gitPath, repo, ["merge", "--no-edit", branch], { signal, timeoutMs: MUTATION_TIMEOUT_MS });
			if (!result.ok) return result;
			return ok({ output: (result.value.stdout || result.value.stderr).trim() });
		}
		case "update": {
			// Fast-forward the branch from its upstream (no merge commit).
			const branch = typeof payload.branch === "string" ? payload.branch.trim() : "";
			if (!branch) return fail("git-error", "未指定分支");
			const remoteName = branch.startsWith("origin/") ? branch.slice("origin/".length) : branch;
			const result = await gitRun(gitPath, repo, ["fetch", "origin", `${remoteName}:${remoteName}`], { signal, timeoutMs: MUTATION_TIMEOUT_MS });
			if (!result.ok) return result;
			return ok({ output: (result.value.stdout || result.value.stderr).trim() || `已将 ${branch} 更新到远端最新` });
		}
		case "rename": {
			const branch = typeof payload.branch === "string" ? payload.branch.trim() : "";
			const name = typeof payload.name === "string" ? payload.name.trim() : "";
			if (!branch) return fail("git-error", "未指定要重命名的分支");
			if (!name) return fail("git-error", "未指定新分支名");
			const result = await gitRun(gitPath, repo, ["branch", "-m", branch, name], { signal, timeoutMs: MUTATION_TIMEOUT_MS });
			if (!result.ok) return result;
			return ok({ output: (result.value.stdout || result.value.stderr).trim() || `已重命名 ${branch} → ${name}` });
		}
		case "revert": {
			// Create a new commit undoing the given commit (safe, keeps history).
			const target = typeof payload.target === "string" ? payload.target.trim() : "";
			if (!target) return fail("git-error", "未指定要回滚的提交");
			const result = await gitRun(gitPath, repo, ["revert", "--no-edit", target], { signal, timeoutMs: MUTATION_TIMEOUT_MS });
			if (!result.ok) return result;
			return ok({ output: (result.value.stdout || result.value.stderr).trim() || `已回滚提交 ${target}` });
		}
		case "reset": {
			// Move HEAD (and optionally the index/working tree) to a commit.
			const target = typeof payload.target === "string" && payload.target.trim() !== "" ? payload.target.trim() : "HEAD";
			const mode = typeof payload.mode === "string" && ["soft", "mixed", "hard"].includes(payload.mode) ? payload.mode : "mixed";
			const result = await gitRun(gitPath, repo, ["reset", `--${mode}`, target], { signal, timeoutMs: MUTATION_TIMEOUT_MS });
			if (!result.ok) return result;
			return ok({ output: (result.value.stdout || result.value.stderr).trim() || `已重置到 ${target}（--${mode}）` });
		}
		case "stage": {
			const path = typeof payload.path === "string" ? payload.path : "";
			if (!path) return fail("git-error", "未指定文件路径");
			const result = await gitRun(gitPath, repo, ["add", "--", path], { signal, timeoutMs: MUTATION_TIMEOUT_MS });
			if (!result.ok) return result;
			return ok({ output: (result.value.stdout || result.value.stderr).trim() });
		}
		case "unstage": {
			const path = typeof payload.path === "string" ? payload.path : "";
			if (!path) return fail("git-error", "未指定文件路径");
			const result = await gitRun(gitPath, repo, ["restore", "--staged", "--", path], { signal, timeoutMs: MUTATION_TIMEOUT_MS });
			if (!result.ok) return result;
			return ok({ output: (result.value.stdout || result.value.stderr).trim() });
		}
		case "untrack": {
			// Remove tracked files from the index while keeping them on disk
			// (git rm --cached). Accepts a directory: every tracked file below
			// it leaves the index and becomes untracked.
			const path = typeof payload.path === "string" ? payload.path : "";
			if (!path) return fail("git-error", "未指定文件路径");
			const result = await gitRun(gitPath, repo, ["rm", "--cached", "-r", "--", path], { signal, timeoutMs: MUTATION_TIMEOUT_MS });
			if (!result.ok) return result;
			return ok({ output: (result.value.stdout || result.value.stderr).trim() });
		}
		case "gitignore": {
			const path = typeof payload.path === "string" ? payload.path : "";
			if (!path) return fail("git-error", "未指定文件路径");
			const giFile = join(repo, ".gitignore");
			let content = "";
			try { if (existsSync(giFile)) content = readFileSync(giFile, "utf8"); } catch { /* fresh file */ }
			const entry = path.replace(/[\\/]+$/, "");
			if (content.split(/\r?\n/).some((l) => l.trim() === entry)) {
				return ok({ output: `${entry} 已在 .gitignore 中` });
			}
			if (content !== "" && !content.endsWith("\n")) content += "\n";
			content += entry + "\n";
			try {
				writeFileSync(giFile, content, "utf8");
			} catch (error) {
				return fail("git-error", `无法写入 .gitignore：${String(error?.message ?? error)}`);
			}
			return ok({ output: `已将 ${entry} 加入 .gitignore` });
		}
		case "list": {
			return await listDirectory(repo, typeof payload.path === "string" ? payload.path : "");
		}
		case "stat": {
			// Probe a path's kind WITHOUT reading it. The browser half uses this
			// to decide whether a workspace.openPath click is a file (preview in
			// the panel) or a directory (keep the system "open in folder"
			// behavior). The path is an absolute host path and may belong to a
			// different workspace — only a type is returned, never content.
			const target = typeof payload.path === "string" && payload.path.trim() !== "" ? payload.path.trim() : "";
			if (!target) return fail("invalid-path", "未指定路径");
			try {
				const st = await stat(target);
				return ok({ type: st.isDirectory() ? "dir" : st.isFile() ? "file" : "other" });
			} catch (error) {
				return fail("not-found", `无法访问路径：${String(error?.message ?? error)}`);
			}
		}
		case "search": {
			// Whole-workspace file index for the file-tab search box:
			// tracked + untracked-but-not-ignored files (node_modules etc. stay out).
			const result = await gitRun(gitPath, repo, ["ls-files", "--cached", "--others", "--exclude-standard"], { signal });
			if (!result.ok) return result;
			const files = result.value.stdout.split(/\r?\n/).filter(Boolean).slice(0, 5000);
			return ok({ files });
		}
		case "read": {
			const rel = typeof payload.path === "string" && payload.path !== "" ? payload.path : "";
			if (!rel) return fail("invalid-path", "未指定文件路径");
			return readFileUnder(repo, rel, payload.maxBytes);
		}
		case "readPath": {
			// Absolute-path read (NOT workspace-constrained) for previewing
			// produced files that live outside the current workspace.
			const target = typeof payload.path === "string" && payload.path.trim() !== "" ? payload.path.trim() : "";
			if (!target) return fail("invalid-path", "未指定路径");
			return readPathAbs(target, payload.maxBytes);
		}
		case "readBlob": {
			// Binary (base64) read for media preview: images, PDFs, sandboxed
			// HTML. Same dual-branch trust model as `write` (path = workspace
			// relative + containment-checked; abs = outside-workspace absolute).
			return readBlobFile(repo, payload);
		}
		case "write": {
			// Save an edited file back to disk. `path` is a workspace-relative
			// path (containment-checked); `abs` is an absolute path for files
			// outside the workspace (same trust model as readPath — the browser
			// only sends it for files it previewed via readPath, i.e. an actual
			// file that was readable a moment ago). Text only, size-capped.
			const content = typeof payload.content === "string" ? payload.content : "";
			if (content.length > MAX_OUTPUT_BYTES) return fail("invalid-path", "文件过大（超过 512KB 编辑上限）");
			const abs = typeof payload.abs === "string" && payload.abs.trim() !== "" ? payload.abs.trim() : "";
			if (abs) {
				if (abs.includes("\0")) return fail("invalid-path", "非法路径");
				try {
					const st = await stat(abs);
					if (!st.isFile()) return fail("invalid-path", `不是文件：${abs}`);
					await writeFile(abs, content, "utf8");
					return ok({ size: Buffer.byteLength(content, "utf8") });
				} catch (error) {
					return fail("invalid-path", `无法写入文件 ${abs}：${String(error?.message ?? error)}`);
				}
			}
			const rel = typeof payload.path === "string" && payload.path !== "" ? payload.path : "";
			if (!rel) return fail("invalid-path", "未指定文件路径");
			const resolved = resolveUnder(repo, rel);
			if (!resolved.ok) return resolved;
			try {
				const st = await stat(resolved.target);
				if (!st.isFile()) return fail("invalid-path", `不是文件：${rel}`);
				await writeFile(resolved.target, content, "utf8");
				return ok({ size: Buffer.byteLength(content, "utf8") });
			} catch (error) {
				return fail("invalid-path", `无法写入文件 ${rel}：${String(error?.message ?? error)}`);
			}
		}
		default:
			return fail("bad-request", `未知操作：${endpoint}`);
	}
}

/**
 * Plugin body: register the channel. `config` comes from the `files-git` row's
 * `config` in cordis.patch.yml (gitPath / defaultRoot); no schema is declared
 * so the package stays dependency-free.
 */
function apply(ctx, config) {
	const cfg = config ?? {};
	const gitPath = resolveGitPath(cfg.gitPath);
	const defaultRoot = typeof cfg.defaultRoot === "string" ? cfg.defaultRoot : "";
	ctx.connection.register(
		ctx,
		CHANNEL,
		async (endpoint, payload, signal) => {
			try {
				return await dispatch(endpoint, payload ?? {}, { gitPath, defaultRoot, signal });
			} catch (error) {
				ctx.logger.warn(`files-git: ${endpoint} failed:`, error);
				return fail("git-error", String(error?.message ?? error));
			}
		},
		{ authority: "loopback" }
	);
}

export { apply, inject, name };
