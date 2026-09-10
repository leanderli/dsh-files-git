/**
 * dsh-files-git — constants shared by the host half (lib/index.js) and the
 * sidecar (lib/server/server.js).
 *
 * Both sides MUST agree on the runtime-file naming and the fingerprint
 * algorithm — they are the singleton contract. Kept in one module so the
 * two processes cannot drift (imported by plain Node ESM on both sides;
 * zero runtime dependencies preserved).
 */
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Stable fingerprint over the RAW spawn config (not a resolved PATH scan):
 * djb2 over the JSON form. Only used to namespace runtime files, so
 * collision-resistance requirements are modest — different configs must
 * (with overwhelming likelihood) map to different files; equal configs
 * must map to the same file.
 */
export function configFingerprint(gitPathRaw, defaultRoot) {
	const str = JSON.stringify({ gitPath: gitPathRaw ?? "", defaultRoot: defaultRoot ?? "" });
	let h = 5381;
	for (const ch of str) h = ((Math.imul(h, 33) ^ ch.codePointAt(0)) >>> 0);
	return h.toString(16);
}

/**
 * Per-config singleton runtime file under the user temp dir (per-user
 * isolated on Windows). Namespacing by fingerprint means two DSH instances
 * with DIFFERENT plugin configs each get their own sidecar instead of
 * fighting over one global file (the old naming caused mutual-shutdown
 * churn in that setup).
 */
export function runtimeFilePath(fingerprint) {
	return join(tmpdir(), `dsh-files-git-service-${fingerprint || "default"}.json`);
}
