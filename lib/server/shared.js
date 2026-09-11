/**
 * dsh-files-git — constants shared by the host half (lib/index.js) and the
 * sidecar (lib/server/server.js).
 *
 * Both sides MUST agree on the runtime-file naming and the fingerprint
 * algorithm — they are the singleton contract. Kept in one module so the
 * two processes cannot drift (imported by plain Node ESM on both sides;
 * zero runtime dependencies preserved).
 */
import { homedir } from "node:os";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Stable fingerprint over the RAW spawn config (not a resolved PATH scan):
 * djb2 over the JSON form. Only used to namespace runtime files, so
 * collision-resistance requirements are modest — different configs must
 * (with overwhelming likelihood) map to different files; equal configs
 * must map to the same file.
 *
 * `caps` (upload/export byte caps) participates ONLY when the host passes
 * it — a deployment that never configures caps keeps the legacy fingerprint
 * (and thus the legacy runtime file name) unchanged.
 */
export function configFingerprint(gitPathRaw, defaultRoot, caps) {
	const str = JSON.stringify({
		gitPath: gitPathRaw ?? "",
		defaultRoot: defaultRoot ?? "",
		...(caps ? { caps } : {})
	});
	let h = 5381;
	for (const ch of str) h = ((Math.imul(h, 33) ^ ch.codePointAt(0)) >>> 0);
	return h.toString(16);
}

/**
 * Private per-user base dir for sidecar state (runtime files, exports).
 * NOT the shared temp dir: on multi-user POSIX hosts a world-writable /tmp
 * lets another local user pre-plant symlinks (intercepting the sidecar
 * token or hijacking the export dir). The home dir is user-private on
 * every supported platform; created 0700 (Windows enforces per-user ACLs
 * on the profile dir anyway, the mode there is belt-and-suspenders).
 */
export function runtimeBaseDir() {
	const dir = join(homedir(), ".dsh-files-git");
	try {
		mkdirSync(dir, { recursive: true, mode: 0o700 });
	} catch {
		/* already exists (possibly by another same-user process) */
	}
	return dir;
}

/**
 * Per-config singleton runtime file under the user-private base dir.
 * Namespacing by fingerprint means two DSH instances with DIFFERENT plugin
 * configs each get their own sidecar instead of fighting over one global
 * file (the old naming caused mutual-shutdown churn in that setup).
 */
export function runtimeFilePath(fingerprint) {
	return join(runtimeBaseDir(), `dsh-files-git-service-${fingerprint || "default"}.json`);
}
