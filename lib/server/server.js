#!/usr/bin/env node
/**
 * dsh-files-git — standalone git service (the sidecar).
 *
 * Runs as its OWN Node process (spawned by the plugin host half, or by hand),
 * so git execution and file IO never touch the DSH main process: its event
 * loop can no longer park panel responses, and git processes live in a clean
 * process group of our own. Zero runtime dependencies — Node builtins only.
 *
 * Protocol (loopback only, bearer-token fenced):
 *
 *   GET  /health          → { ok: true, version, pid }
 *   POST /shutdown        → { ok: true }   (graceful exit)
 *   GET  /events?repo=<abs> → SSE status push (event: status, same shape as
 *                             the status RPC value; fs.watch debounced + 10s
 *                             safety poll; ≤4 concurrent streams)
 *   POST /git/<endpoint>  → RpcResult { ok: true, value } | { ok: false, error }
 *
 * CORS is echoed for loopback origins only (browser courtesy for direct
 * mode); the token remains the real fence.
 *   endpoints (payload → result, identical semantics to the former in-host
 *   dispatch — see the endpoint table at the bottom of this header):
 *     status diff log show commit push pull fetch config branches checkout
 *     merge update rename revert reset stage unstage untrack gitignore
 *     list stat search read readPath readBlob write
 *
 * Lifecycle:
 *   - Singleton via a runtime file `{tmpdir}/dsh-files-git-service.json`
 *     { pid, port, token, version, fingerprint, startedAt }. On boot: if a
 *     same-version / same-config instance is healthy, exit(0) (the spawner
 *     reuses it); otherwise ask the old instance to shut down and take over.
 *   - `fingerprint` pins the spawn config (gitPath/defaultRoot): a config
 *     change makes hosts consider the running instance stale and rotate it.
 *   - Idle self-exit after 30 minutes without any request; SIGINT/SIGTERM and
 *     a requested /shutdown also clean up the runtime file.
 *   - Version comes from the plugin's package.json: a plugin upgrade rotates
 *     the service on the next RPC.
 *
 * Security model (carried over from the in-host era, unchanged semantics):
 *   - binds 127.0.0.1 only; every request must carry the runtime-file token
 *     (`Authorization: Bearer …`, constant-time compare);
 *   - git runs via argv arrays (no shell → no injection), GIT_TERMINAL_PROMPT=0;
 *   - workspace-relative file access is containment-checked (resolve +
 *     realpath, `..` / absolute / symlink escapes rejected);
 *   - readPath/write-abs/readBlob-abs stay deliberately unconstrained — same
 *     trust model as before (the browser only echoes paths it just read).
 *
 * Endpoint reference:
 *   status  { repo? }                       → branch/ahead/behind + change lists
 *   diff    { repo?, staged?, path? }       → raw unified diff text (capped)
 *   log     { repo?, count? }               → commits as structured entries
 *   show    { repo?, target, path? }        → one commit's files or one file patch
 *   commit  { repo?, message, paths?, all?, amend? } → add (optional) + commit
 *   push    { repo?, force? }               → push (with -u when no upstream)
 *   pull    { repo?, rebase? }              → pull (optionally --rebase)
 *   fetch   { repo? }                       → fetch --prune
 *   config  { repo? }                       → user.name / user.email / remote url
 *   branches { repo? }                      → all local/remote branches
 *   checkout { repo?, branch, create?, start? } → git checkout / checkout -b
 *   merge   { repo?, branch }               → merge branch into current
 *   update  { repo?, branch }               → fast-forward branch from upstream
 *   rename  { repo?, branch, name }         → git branch -m
 *   revert  { repo?, target }               → revert commit (new commit)
 *   reset   { repo?, target, mode? }        → git reset --soft|mixed|hard
 *   stage   { repo?, path }                 → git add -- path
 *   unstage { repo?, path }                 → git restore --staged -- path
 *   untrack { repo?, path }                 → git rm --cached -r -- path
 *   gitignore { repo?, path }               → append path to .gitignore
 *   list    { repo?, path? }                → one directory level (relative paths)
 *   stat    { repo?, path }                 → path kind probe (file/dir/other)
 *   search  { repo? }                       → workspace file index (ls-files)
 *   read    { repo?, path, maxBytes? }      → text file content (binary/truncation flagged)
 *   readPath { repo?, path, maxBytes? }     → absolute-path read (not workspace-constrained)
 *   readBlob { repo?, path | abs }          → base64 binary read for media preview
 *   write   { repo?, path|abs, content }    → save text back (relative or absolute)
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, statSync, unlinkSync, watch, writeFileSync } from "node:fs";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { configFingerprint, runtimeFilePath } from "./shared.js";

/** Plugin version this service ships with (rotates the process on upgrade). */
let SERVICE_VERSION = "0";
try {
	SERVICE_VERSION = String(JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")).version ?? "0");
} catch {
	/* broken install: fall back to a constant so a healthy old instance wins */
}

/** Singleton/heartbeat file for THIS instance's config — set in main() once
 * the spawn args (and thus the fingerprint) are known. Per-fingerprint
 * naming lets different-config DSH instances coexist (one sidecar each)
 * instead of fighting over a single global file. */
let runtimeFile = "";

/** Exit after this much inactivity so orphans (DSH crashed) don't linger. */
const IDLE_EXIT_MS = 30 * 60 * 1000;

/** Per-request concurrency cap — mirrors the former host-side busy gate. */
const MAX_CONCURRENT_RPCS = 12;

const STATUS_TIMEOUT_MS = 15000;
const MUTATION_TIMEOUT_MS = 180000;

/** Cap one command's captured output (diff can be huge). */
const MAX_OUTPUT_BYTES = 512 * 1024;

/** Request body cap (write carries up to 512KB text; JSON escaping inflates). */
const MAX_BODY_BYTES = 8 * 1024 * 1024;

// ── spawn config (passed through by the host half) ──────────────────────────

function parseArgv(argv) {
	const out = {};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--gitPath") out.gitPath = argv[++i] ?? "";
		else if (a.startsWith("--gitPath=")) out.gitPath = a.slice("--gitPath=".length);
		else if (a === "--defaultRoot") out.defaultRoot = argv[++i] ?? "";
		else if (a.startsWith("--defaultRoot=")) out.defaultRoot = a.slice("--defaultRoot=".length);
	}
	return out;
}

/** Resolve the git executable. An explicit config wins; otherwise scan PATH
 * for `git.exe`, skipping `.git-ai` shim directories so the panel drives
 * plain git semantics (a wrapper could inject prompts or alter behavior). */
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

// ── diagnostics (service process writes its own log; never breaks an RPC) ───

function svcLog(line) {
	try {
		const dir = join(process.env.DSH_HOME || tmpdir(), "logs");
		mkdirSync(dir, { recursive: true });
		appendFileSync(join(dir, "files-git-service.log"), `${new Date().toISOString()} ${line}\n`, "utf8");
	} catch {
		/* diagnostics must never break the service */
	}
}

// ── git plumbing (ported verbatim from the former in-host dispatch) ─────────

/**
 * Kill a spawned git command AND its whole process tree. On Windows a bare
 * child.kill() only terminates the direct git.exe — its helpers (git-remote-*,
 * git index-pack, sh, credential wrappers…) survive, keep the repo's locks
 * (.git/index.lock etc.) and make every LATER git command block on them. That
 * orphan accumulation is what turns an occasional hang into "the panel loads
 * forever and gets worse the longer you use it". taskkill /T /F nukes the tree.
 */
function killTree(child) {
	if (!child || typeof child.pid !== "number") return;
	try {
		if (process.platform === "win32") {
			spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
		} else {
			child.kill("SIGKILL");
		}
	} catch {
		/* already gone */
	}
}

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
			// Tree-kill: without it, orphaned git helpers on Windows keep the
			// repo locked and every subsequent command hangs a little longer
			// ("用着用着面板全部在加载中"). taskkill /T /F covers the tree.
			killTree(child);
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

/** List one directory level under the workspace root. `signal` (the client
 * request's abort controller) is honored so a request the browser already
 * gave up on stops spending service CPU / disk I/O instead of running to
 * completion. */
async function listDirectory(root, rel, signal) {
	if (signal?.aborted) return fail("aborted", "请求已取消");
	const resolved = resolveUnder(root, rel);
	if (!resolved.ok) return resolved;
	const target = resolved.target;
	try {
		if (!(await stat(target)).isDirectory()) return fail("invalid-path", `不是目录：${rel || "(根)"}`);
		if (signal?.aborted) return fail("aborted", "请求已取消");
		const dirents = await readdir(target, { withFileTypes: true });
		if (signal?.aborted) return fail("aborted", "请求已取消");
		// Cap huge directories so one listing never floods the response.
		const MAX_ENTRIES = 4000;
		const capped = dirents.slice(0, MAX_ENTRIES);
		// Parallel stat keeps the service event loop free — a big directory must
		// not stall other RPCs (status polling etc.) behind synchronous stats.
		const entries = (await Promise.all(capped.map(async (dirent) => {
			if (signal?.aborted) return null;
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
		}))).filter(Boolean);
		if (signal?.aborted) return fail("aborted", "请求已取消");
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
function readFileUnder(root, rel, maxBytes, signal) {
	if (signal?.aborted) return fail("aborted", "请求已取消");
	const resolved = resolveUnder(root, rel);
	if (!resolved.ok) return resolved;
	const target = resolved.target;
	try {
		const stat = statSync(target);
		if (!stat.isFile()) return fail("invalid-path", `不是文件：${rel}`);
		if (signal?.aborted) return fail("aborted", "请求已取消");
		const cap = Math.max(1024, Math.min(MAX_OUTPUT_BYTES, Number(maxBytes) || MAX_OUTPUT_BYTES));
		const buffer = readFileSync(target);
		if (signal?.aborted) return fail("aborted", "请求已取消");
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
function readPathAbs(target, maxBytes, signal) {
	if (signal?.aborted) return fail("aborted", "请求已取消");
	try {
		const st = statSync(target);
		if (!st.isFile()) return fail("invalid-path", `不是文件：${target}`);
		if (signal?.aborted) return fail("aborted", "请求已取消");
		const cap = Math.max(1024, Math.min(MAX_OUTPUT_BYTES, Number(maxBytes) || MAX_OUTPUT_BYTES));
		const buffer = readFileSync(target);
		if (signal?.aborted) return fail("aborted", "请求已取消");
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
function readBlobFile(repo, payload, signal) {
	if (signal?.aborted) return fail("aborted", "请求已取消");
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
		if (signal?.aborted) return fail("aborted", "请求已取消");
		const buffer = readFileSync(target);
		if (signal?.aborted) return fail("aborted", "请求已取消");
		return ok({ base64: buffer.toString("base64"), size: buffer.length });
	} catch (error) {
		return fail("invalid-path", `无法读取文件 ${target}：${String(error?.message ?? error)}`);
	}
}

/**
 * Wrap a git run and fold a non-git-repo failure into a friendly error.
 * `options.lockFree` prepends the `--no-optional-locks` global option for
 * READ-ONLY commands (status/diff/log/show/config/branches/search): without
 * it each git call opportunistically refreshes the index under a lock, so
 * the panel's own concurrent RPCs serialize behind each other's refreshes
 * (the same reason VS Code passes this flag to every read-only git call).
 */
async function gitRun(gitPath, repo, args, options) {
	const argv = options?.lockFree === true ? ["--no-optional-locks", ...args] : args;
	for (let attempt = 0; attempt < 2; attempt++) {
		const result = await runGit(gitPath, repo, argv, options);
		if (result.code === 0) return ok({ code: result.code, stdout: result.stdout, stderr: result.stderr });
		// Windows 偶发：git 进程启动即崩溃，退出码 3221225794 (0xC0000142,
		// STATUS_DLL_INIT_FAILED，常见于大量 git 进程并发时 DLL 初始化失败)。
		// 进程崩溃（无 stderr/stdout 输出、退出码为负或该固定码）时自动重试一次。
		const crashed = result.code === 3221225794 || result.code === -1073741718 || (result.code < 0 && !result.stderr.trim() && !result.stdout.trim());
		if (attempt === 0 && crashed) {
			svcLog(`git crash (code=${result.code}) retried once: ${args.join(" ")}`);
			continue;
		}
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
			// `--untracked-files=all` lists every untracked file inside the
			// SAME process / single lock acquisition. It replaces the old
			// two-step dance (porcelain status, then a second full-workspace
			// `ls-files --others` whenever an untracked directory appeared)
			// — one spawn, one lock, no repeated whole-workspace walk on the
			// 5s poll of large workspaces.
			const result = await gitRun(gitPath, repo, ["status", "--porcelain=v1", "-b", "--untracked-files=all"], { signal, lockFree: true });
			if (!result.ok) return result;
			return ok({ repo, ...parseStatus(result.value.stdout) });
		}
		case "diff": {
			const args = ["diff", "--no-color"];
			if (payload.staged === true) args.push("--cached");
			if (typeof payload.path === "string" && payload.path.trim() !== "") args.push("--", payload.path.trim());
			const result = await gitRun(gitPath, repo, args, { signal, lockFree: true });
			if (!result.ok) return result;
			const text = result.value.stdout;
			return ok({
				text,
				truncated: text.length >= MAX_OUTPUT_BYTES
			});
		}
		case "log": {
			const count = Math.max(1, Math.min(100, Number(payload.count) || 25));
			// Structured entries: short + full hash, author name / email,
			// author date (local timezone), decorations and subject, joined
			// by \x1f — a control byte that cannot occur inside these
			// placeholders, so field splitting is exact and nothing needs
			// escaping. All values are rendered as TEXT on the client.
			const SEP = "\x1f";
			const result = await gitRun(gitPath, repo, [
				"log", "-n", String(count),
				"--date=format-local:%Y-%m-%d %H:%M",
				`--pretty=format:%h${SEP}%H${SEP}%an${SEP}%ae${SEP}%ad${SEP}%d${SEP}%s`
			], { signal, lockFree: true });
			if (!result.ok) return result;
			const lines = result.value.stdout.split(/\r?\n/).filter(Boolean).map((row) => {
				const [h, hash, name, email, date, refs, subject] = row.split(SEP);
				return { h, hash, name: name || "", email: email || "", date: date || "", refs: (refs || "").trim(), subject: subject || "" };
			}).filter((e) => e.h && e.hash);
			return ok({ lines });
		}
		case "show": {
			// One commit. Without `path`: the commit's changed-file list
			// (--name-status). With `path`: that single file's patch text.
			const target = typeof payload.target === "string" ? payload.target.trim() : "";
			if (!target) return fail("git-error", "未指定要查看的提交");
			if (typeof payload.path === "string" && payload.path.trim() !== "") {
				const result = await gitRun(gitPath, repo, ["show", "--no-color", "--format=", target, "--", payload.path.trim()], { signal, lockFree: true });
				if (!result.ok) return result;
				const text = result.value.stdout;
				return ok({ text, truncated: text.length >= MAX_OUTPUT_BYTES, files: [] });
			}
			const result = await gitRun(gitPath, repo, ["show", "--name-status", "--format=", target], { signal, lockFree: true });
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
			// Only the branch/upstream line matters here — `-uno` skips the
			// whole untracked walk (the change lists come from the status RPC).
			const statusResult = await gitRun(gitPath, repo, ["status", "--porcelain=v1", "-b", "--untracked-files=no"], { signal, lockFree: true });
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
				const result = await gitRun(gitPath, repo, ["config", "--get", key], { signal, lockFree: true });
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
			const result = await gitRun(gitPath, repo, ["for-each-ref", "--format=%(HEAD)|%(refname:short)|%(upstream:short)|%(objectname:short)", "refs/heads", "refs/remotes"], { signal, lockFree: true });
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
			const result = await listDirectory(repo, typeof payload.path === "string" ? payload.path : "", signal);
			if (!result.ok) return result;
			// Best-effort annotation: mark entries excluded by .gitignore so the
			// browser can dim them. One cheap query — `--directory` collapses
			// whole ignored trees (node_modules) into a single output line, and
			// `--others` keeps tracked files out even if they match a pattern.
			try {
				const ig = await runGit(gitPath, repo, ["ls-files", "--others", "--ignored", "--exclude-standard", "--directory"], { signal });
				if (ig.code === 0 && ig.stdout.trim() !== "") {
					const ignoredPaths = ig.stdout.split("\n").map((s) => s.replace(/\r$/, "").replace(/\/$/, "")).filter(Boolean);
					const isIgnored = (p) => ignoredPaths.some((d) => p === d || p.startsWith(d + "/"));
					for (const e of result.value.entries) if (isIgnored(e.path)) e.ignored = true;
				}
			} catch {
				/* annotation is cosmetic — never fail the listing for it */
			}
			return result;
		}
		case "stat": {
			// Probe a path's kind WITHOUT reading it. The browser half uses this
			// to decide whether a workspace.openPath click is a file (preview in
			// the panel) or a directory (keep the system "open in folder"
			// behavior). The path is an absolute host path and may belong to a
			// different workspace — only a type is returned, never content.
			if (signal?.aborted) return fail("aborted", "请求已取消");
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
			const result = await gitRun(gitPath, repo, ["ls-files", "--cached", "--others", "--exclude-standard"], { signal, lockFree: true });
			if (!result.ok) return result;
			const files = result.value.stdout.split(/\r?\n/).filter(Boolean).slice(0, 5000);
			return ok({ files });
		}
		case "read": {
			const rel = typeof payload.path === "string" && payload.path !== "" ? payload.path : "";
			if (!rel) return fail("invalid-path", "未指定文件路径");
			return readFileUnder(repo, rel, payload.maxBytes, signal);
		}
		case "readPath": {
			// Absolute-path read (NOT workspace-constrained) for previewing
			// produced files that live outside the current workspace.
			const target = typeof payload.path === "string" && payload.path.trim() !== "" ? payload.path.trim() : "";
			if (!target) return fail("invalid-path", "未指定路径");
			return readPathAbs(target, payload.maxBytes, signal);
		}
		case "readBlob": {
			// Binary (base64) read for media preview: images, PDFs, sandboxed
			// HTML. Same dual-branch trust model as `write` (path = workspace
			// relative + containment-checked; abs = outside-workspace absolute).
			return readBlobFile(repo, payload, signal);
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

// ── runtime file (singleton contract between hosts and services) ────────────

function readRuntimeFile() {
	try {
		const parsed = JSON.parse(readFileSync(runtimeFile, "utf8"));
		if (parsed && typeof parsed.port === "number" && typeof parsed.token === "string") return parsed;
	} catch {
		/* missing/corrupt: treat as no instance */
	}
	return null;
}

function writeRuntimeFileAtomic(entry) {
	const tmp = `${runtimeFile}.${process.pid}.tmp`;
	try {
		writeFileSync(tmp, JSON.stringify(entry), "utf8");
		// Atomic on POSIX; on Windows renameSync also replaces an existing
		// destination file. The window is microseconds and the file is tiny.
		try {
			unlinkSync(runtimeFile);
		} catch {
			/* first run: nothing to replace */
		}
		renameSync(tmp, runtimeFile);
	} catch (error) {
		unlinkSafe(tmp);
		svcLog(`runtime file write failed: ${String(error?.message ?? error)}`);
		throw error;
	}
}

function unlinkSafe(path) {
	try { unlinkSync(path); } catch { /* nothing to clean */ }
}

/**
 * Remove the runtime file only if it is still OURS (token match) — a successor
 * instance may already have taken over by the time we exit.
 */
function removeRuntimeFileIfOurs(token) {
	try {
		const current = readRuntimeFile();
		if (current && current.token === token) unlinkSync(runtimeFile);
	} catch {
		/* best effort */
	}
}

// ── auth ─────────────────────────────────────────────────────────────────────

/** Constant-time bearer-token check (hash both sides so lengths can't leak). */
function tokenMatches(presented, expected) {
	if (typeof presented !== "string" || presented === "") return false;
	const a = createHash("sha256").update(presented).digest();
	const b = createHash("sha256").update(expected).digest();
	return timingSafeEqual(a, b);
}

function bearerTokenOf(req) {
	const header = req.headers.authorization ?? "";
	const m = /^Bearer\s+(.+)$/i.exec(header);
	return m ? m[1].trim() : "";
}

// ── outbound probes (used at boot against a possibly-running instance) ──────

async function fetchJson(url, token, method, timeoutMs) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetch(url, {
			method: method ?? "GET",
			headers: token ? { authorization: `Bearer ${token}` } : {},
			signal: controller.signal
		});
		return { status: res.status, data: await res.json().catch(() => null) };
	} finally {
		clearTimeout(timer);
	}
}

async function instanceHealthy(entry, timeoutMs) {
	try {
		const { status, data } = await fetchJson(`http://127.0.0.1:${entry.port}/health`, entry.token, "GET", timeoutMs);
		return status === 200 && data?.ok === true && data?.version === SERVICE_VERSION;
	} catch {
		return false;
	}
}

async function requestShutdown(entry) {
	try {
		await fetchJson(`http://127.0.0.1:${entry.port}/shutdown`, entry.token, "POST", 1500);
		// Give the old instance a beat to release its state before we write.
		await new Promise((r) => setTimeout(r, 250));
	} catch {
		/* stale instance: proceed regardless */
	}
}

// ── HTTP server ──────────────────────────────────────────────────────────────

let serverState = null; // { token, closing }
let activeRequests = 0;
let idleTimer = null;

function armIdleTimer() {
	if (idleTimer) clearTimeout(idleTimer);
	idleTimer = setTimeout(() => shutdown("idle"), IDLE_EXIT_MS);
	// Don't hold the process open for the timer alone; the listening socket
	// is what keeps us alive, and an unref'd timer still fires while we run.
	idleTimer.unref?.();
}

function sendJson(res, status, body) {
	if (res.headersSent || res.writableEnded) return;
	const payload = JSON.stringify(body);
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"content-length": Buffer.byteLength(payload),
		"cache-control": "no-store"
	});
	res.end(payload);
}

// ── static vendor assets (Monaco editor) ─────────────────────────────────────
// GET /vendor/<path> serves the plugin's read-only `vendor/` directory (the
// locally vendored monaco `min/vs` tree). Lives BEFORE the token gate: the
// AMD loader and blob workers cannot attach Authorization headers, and these
// are immutable public editor assets — the fence stays the 127.0.0.1 bind.
// Traversal is fenced by resolving inside VENDOR_ROOT only.

const VENDOR_ROOT = fileURLToPath(new URL("../../vendor", import.meta.url));

const VENDOR_MIME = new Map([
	["js", "text/javascript; charset=utf-8"],
	["mjs", "text/javascript; charset=utf-8"],
	["css", "text/css; charset=utf-8"],
	["json", "application/json; charset=utf-8"],
	["ttf", "font/ttf"],
	["woff", "font/woff"],
	["woff2", "font/woff2"],
	["svg", "image/svg+xml"]
]);

async function handleVendor(req, res, url) {
	if (req.method !== "GET") {
		sendJson(res, 405, { error: "method-not-allowed" });
		return;
	}
	let rel;
	try {
		rel = decodeURIComponent(url.pathname.slice("/vendor/".length));
	} catch {
		sendJson(res, 400, { error: "bad-path" });
		return;
	}
	const abs = resolve(VENDOR_ROOT, rel);
	if (!abs.startsWith(VENDOR_ROOT + sep)) {
		sendJson(res, 403, { error: "forbidden" });
		return;
	}
	let buf;
	try {
		buf = await readFile(abs);
	} catch {
		sendJson(res, 404, { error: "not-found" });
		return;
	}
	const dot = abs.lastIndexOf(".");
	const ext = dot === -1 ? "" : abs.slice(dot + 1).toLowerCase();
	res.writeHead(200, {
		"content-type": VENDOR_MIME.get(ext) ?? "application/octet-stream",
		"cache-control": "public, max-age=86400"
	});
	res.end(buf);
}

// ── CORS (direct-browser mode) ───────────────────────────────────────────────
// The panel may call this service straight from the DSH web origin (Phase 2
// direct mode), so browsers will enforce CORS. We echo ONLY loopback origins
// — CORS is a browser-side courtesy here, the bearer token is the real fence;
// a LAN-served WebUI gets no ACAO and the panel falls back to the DSH proxy
// path (whose loopback fence rejects, exactly as before direct mode existed).

function loopbackOrigin(origin) {
	if (typeof origin !== "string" || origin === "") return null;
	try {
		const u = new URL(origin);
		if (u.protocol !== "http:" && u.protocol !== "https:") return null;
		const h = u.hostname;
		if (h === "127.0.0.1" || h === "localhost" || h === "::1" || h === "[::1]") return origin;
	} catch {
		/* malformed origin */
	}
	return null;
}

function applyCors(req, res) {
	const origin = loopbackOrigin(req.headers.origin);
	if (origin) {
		res.setHeader("access-control-allow-origin", origin);
		res.setHeader("vary", "origin");
	}
	return origin;
}

// ── SSE status push ──────────────────────────────────────────────────────────
// GET /events?repo=<abs> — one stream per repo. Pushes `status` events with
// the same shape as the status RPC value whenever the working tree changes
// (fs.watch, debounced) plus a 10s safety poll for watchers that miss events
// (network drives). Streams keep the service alive (each write re-arms the
// idle timer) and are capped so one panel cannot pin unbounded watchers.

const MAX_EVENT_STREAMS = 4;
let activeStreams = 0;

function handleEvents(req, res, url, config) {
	if (activeStreams >= MAX_EVENT_STREAMS) {
		sendJson(res, 503, { error: "too-many-streams" });
		return;
	}
	const repoRes = resolveRepo({ repo: url.searchParams.get("repo") ?? "" }, "");
	if (!repoRes.ok) {
		sendJson(res, 400, { error: repoRes.error.code, message: repoRes.error.message });
		return;
	}
	const repo = repoRes.repo;

	activeStreams++;
	res.writeHead(200, {
		"content-type": "text/event-stream; charset=utf-8",
		"cache-control": "no-store",
		connection: "keep-alive",
		"x-accel-buffering": "no"
	});
	try { res.write(": connected\n\n"); } catch { /* closed mid-handshake */ }

	let closed = false;
	const cleanups = [];
	const cleanup = () => {
		if (closed) return;
		closed = true;
		for (const fn of cleanups.splice(0)) {
			try { fn(); } catch { /* idempotent */ }
		}
		activeStreams--;
	};
	res.on("close", cleanup);
	req.on("error", cleanup);

	const write = (chunk) => {
		if (closed) return false;
		try {
			res.write(chunk);
			armIdleTimer(); // stream activity counts as service activity
			return true;
		} catch {
			return false;
		}
	};
	const send = (event, data) => write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

	// Serialized status pushes: watch + safety poll can fire together; while
	// one `git status` runs, further triggers coalesce into a single follow-up
	// (same pattern as the panel's refresh serialization). The stream's abort
	// signal kills an in-flight status when the client disconnects.
	const streamAbort = new AbortController();
	cleanups.push(() => streamAbort.abort());
	let pushing = false;
	let queued = false;
	const pushStatus = async () => {
		const result = await gitRun(config.gitPath, repo, ["status", "--porcelain=v1", "-b", "--untracked-files=all"], { lockFree: true, timeoutMs: STATUS_TIMEOUT_MS, signal: streamAbort.signal });
		if (closed) return;
		if (!result.ok) {
			send("status", { repo, error: { code: result.error?.code ?? "git-error", message: result.error?.message ?? "git error" } });
			return;
		}
		send("status", { repo, ...parseStatus(result.value.stdout) });
	};
	const requestPush = () => {
		if (pushing) { queued = true; return; }
		pushing = true;
		pushStatus().finally(() => {
			pushing = false;
			if (queued && !closed) {
				queued = false;
				requestPush();
			}
		});
	};

	void requestPush(); // initial snapshot — covers the panel's first paint

	// Watch the whole working tree; debounce bursts (branch switches touch
	// hundreds of files — one push after the storm, not hundreds).
	let debounce = null;
	try {
		const watcher = watch(repo, { recursive: true }, () => {
			if (debounce) clearTimeout(debounce);
			debounce = setTimeout(() => { debounce = null; requestPush(); }, 250);
		});
		watcher.on("error", () => {
			try { watcher.close(); } catch { /* already closed */ }
		});
		cleanups.push(() => {
			try { watcher.close(); } catch { /* already closed */ }
		});
	} catch {
		/* recursive watch unsupported here → the safety poll covers it */
	}
	cleanups.push(() => {
		if (debounce) clearTimeout(debounce);
	});
	// Safety net: fs.watch misses events on some filesystems; one cheap
	// lock-free status per 10s keeps the panel honest regardless.
	const safety = setInterval(() => requestPush(), 10000);
	cleanups.push(() => clearInterval(safety));
	// Heartbeat: keeps proxies/intermediaries from reaping an idle stream and
	// lets the browser notice a dead peer on its next write.
	const hb = setInterval(() => write(`: hb ${Date.now()}\n\n`), 20000);
	cleanups.push(() => clearInterval(hb));
}

function readBody(req, cap) {
	return new Promise((resolveBody) => {
		const chunks = [];
		let size = 0;
		let done = false;
		const finish = (value) => {
			if (done) return;
			done = true;
			resolveBody(value);
		};
		req.on("data", (chunk) => {
			if (done) return; // over-cap already decided — stop collecting
			size += chunk.length;
			if (size > cap) {
				finish({ body: null, tooLarge: true });
				return;
			}
			chunks.push(chunk);
		});
		req.on("end", () => finish({ body: Buffer.concat(chunks), tooLarge: false }));
		req.on("error", () => finish({ body: null, tooLarge: false }));
	});
}

async function handleRequest(req, res, config) {
	armIdleTimer();
	applyCors(req, res); // every response (incl. 401/404) carries CORS for direct mode
	if (req.method === "OPTIONS") {
		// Preflight: OPTIONS never carries custom headers, so it cannot be
		// token-authenticated — it only advertises what a token-authed request
		// may send. The real request is still fenced by the bearer token.
		res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
		res.setHeader("access-control-allow-headers", "authorization, content-type");
		res.setHeader("access-control-max-age", "600");
		// Future-proofing: Chrome's Private Network Access will require this
		// on preflights for requests into the local network. Harmless today.
		res.setHeader("access-control-allow-private-network", "true");
		res.writeHead(204);
		res.end();
		return;
	}
	const url = new URL(req.url, "http://127.0.0.1");

	// Static vendor assets come before the token gate (loader/workers cannot
	// send Authorization headers); see handleVendor for the threat model.
	if (req.method === "GET" && url.pathname.startsWith("/vendor/")) {
		await handleVendor(req, res, url);
		return;
	}

	if (!tokenMatches(bearerTokenOf(req), serverState.token)) {
		sendJson(res, 401, { error: "unauthorized" });
		return;
	}

	if (req.method === "GET" && url.pathname === "/health") {
		sendJson(res, 200, { ok: true, version: SERVICE_VERSION, pid: process.pid });
		return;
	}
	if (req.method === "GET" && url.pathname === "/events") {
		handleEvents(req, res, url, config);
		return;
	}
	if (req.method === "POST" && url.pathname === "/shutdown") {
		sendJson(res, 200, { ok: true });
		setTimeout(() => shutdown("requested"), 120);
		return;
	}

	const match = /^\/git\/([A-Za-z][A-Za-z0-9_-]*)$/.exec(url.pathname);
	if (req.method !== "POST" || !match) {
		sendJson(res, 404, { error: "not-found" });
		return;
	}
	const endpoint = match[1];

	readBody(req, MAX_BODY_BYTES).then(({ body, tooLarge }) => {
		if (tooLarge) {
			// Answer before tearing the upload down, so the client sees a
			// readable 413 instead of a bare connection reset.
			sendJson(res, 413, { error: "payload-too-large" });
			const t = setTimeout(() => { try { req.destroy(); } catch { /* gone */ } }, 100);
			t.unref?.();
			return;
		}
		if (body === null) return; // aborted mid-read — socket already gone
		let payload;
		try {
			payload = body.length === 0 ? {} : JSON.parse(body.toString("utf8"));
		} catch {
			sendJson(res, 400, { error: "bad-json" });
			return;
		}
		if (typeof payload !== "object" || payload === null || Array.isArray(payload)) payload = {};

		if (activeRequests >= MAX_CONCURRENT_RPCS) {
			svcLog(`${endpoint} BUSY (active=${activeRequests})`);
			sendJson(res, 200, fail("busy", "服务器繁忙，请稍后重试"));
			return;
		}
		activeRequests++;
		// Abort fan-out: when the proxy (or the browser behind it) gives up on
		// this request, kill the underlying git process / stop the file walk.
		const controller = new AbortController();
		const drop = () => controller.abort();
		res.on("close", () => {
			if (!res.writableEnded) drop();
		});
		const started = Date.now();
		dispatch(endpoint, payload, { gitPath: config.gitPath, defaultRoot: config.defaultRoot, signal: controller.signal })
			.then((result) => {
				if (controller.signal.aborted && result?.error?.code !== "aborted") {
					// The caller is gone; don't bother shipping the payload.
					sendJson(res, 200, fail("aborted", "请求已取消"));
					return;
				}
				sendJson(res, 200, result);
			})
			.catch((error) => {
				svcLog(`${endpoint} ERROR after ${Date.now() - started}ms: ${String(error?.message ?? error).slice(0, 300)}`);
				sendJson(res, 200, fail("git-error", String(error?.message ?? error)));
			})
			.finally(() => {
				activeRequests--;
				armIdleTimer();
			});
	});
}

function shutdown(reason) {
	if (serverState?.closing) return;
	if (serverState) serverState.closing = true;
	svcLog(`shutting down (${reason}, pid ${process.pid})`);
	if (idleTimer) clearTimeout(idleTimer);
	try { serverState?.server?.close(); } catch { /* already closed */ }
	if (serverState?.token) removeRuntimeFileIfOurs(serverState.token);
	// Let an in-flight /shutdown response flush, then leave. Long git
	// mutations were already tree-killed via per-request aborts on close.
	setTimeout(() => process.exit(0), 150);
}

// ── boot ─────────────────────────────────────────────────────────────────────

let currentConfig = { gitPath: "git", defaultRoot: "", fingerprint: "" };

async function main() {
	process.on("SIGINT", () => shutdown("signal"));
	process.on("SIGTERM", () => shutdown("signal"));
	process.on("exit", () => {
		if (serverState?.token) removeRuntimeFileIfOurs(serverState.token);
	});

	const args = parseArgv(process.argv.slice(2));
	const fingerprint = configFingerprint(args.gitPath, args.defaultRoot);
	runtimeFile = runtimeFilePath(fingerprint);

	const existing = readRuntimeFile();
	if (existing) {
		const sameShape = existing.version === SERVICE_VERSION && existing.fingerprint === fingerprint;
		if (sameShape && (await instanceHealthy(existing, 900))) {
			svcLog(`instance already serving (pid ${existing.pid}, port ${existing.port}, v${SERVICE_VERSION}) — exiting`);
			process.exit(0);
		}
		// Stale, foreign version, or config drift: ask it to step aside.
		await requestShutdown(existing);
	}

	currentConfig = {
		gitPath: resolveGitPath(args.gitPath),
		defaultRoot: typeof args.defaultRoot === "string" ? args.defaultRoot : "",
		fingerprint
	};

	const server = createServer((req, res) => handleRequest(req, res, currentConfig));
	server.on("error", (error) => {
		svcLog(`listen failed: ${String(error?.message ?? error)}`);
		process.exit(1);
	});
	server.listen(0, "127.0.0.1", () => {
		const address = server.address();
		const port = typeof address === "object" && address ? address.port : 0;
		if (!port) {
			svcLog("listen returned no port — exiting");
			process.exit(1);
		}
		const token = randomBytes(32).toString("hex");
		serverState = { token, server, closing: false };
		try {
			writeRuntimeFileAtomic({
				pid: process.pid,
				port,
				token,
				version: SERVICE_VERSION,
				fingerprint,
				startedAt: Date.now()
			});
		} catch (error) {
			svcLog(`runtime file write failed: ${String(error?.message ?? error)} — exiting`);
			process.exit(1);
		}
		svcLog(`listening on 127.0.0.1:${port} (pid ${process.pid}, v${SERVICE_VERSION}, git=${currentConfig.gitPath})`);
		armIdleTimer();
	});
}

main().catch((error) => {
	svcLog(`fatal: ${String(error?.stack ?? error)}`);
	process.exit(1);
});
