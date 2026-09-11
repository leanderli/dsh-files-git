/**
 * dsh-files-git — minimal zero-dependency ZIP writer (sidecar only).
 *
 * Writes a PKZIP (ZIP32) archive streaming disk→disk: ONE outer pipeline
 * drains an async generator (headers → entry data → central directory →
 * EOCD) into the output file, so there is a single destination stream that
 * is ended exactly once — per-entry file pumps run their own sub-pipelines
 * that stop at a Transform, never touching the file stream. Peak memory
 * stays at one small chunk regardless of archive size.
 *
 * Format notes (APPNOTE.TXT):
 *   - Every FILE entry uses the data-descriptor form: the local header
 *     carries flag bit 3 (sizes/CRC follow the data) plus bit 11 (UTF-8
 *     names), and a 16-byte descriptor is appended after the entry data.
 *     This lets us stream without knowing sizes up front; the central
 *     directory at the end carries the real values, which is what every
 *     extractor actually reads.
 *   - DIRECTORY entries are written explicitly (name + "/", zero size) so
 *     empty folders survive the round trip.
 *   - Entries whose extension is already a compressed format are STOREd
 *     (method 0) instead of double-deflating.
 *   - No ZIP64: the caller caps the archive (entry count ≤ 0xFFFF, sizes
 *     < 4GiB) — writeZip defensively throws beyond those wire limits.
 *
 * The caller owns validation of entry paths (workspace containment); this
 * module still sanitizes names defensively (`..` segments, backslashes,
 * control characters) so a bug upstream cannot mint a traversal archive.
 */
import { createReadStream, createWriteStream } from "node:fs";
import { createDeflateRaw } from "node:zlib";
import { PassThrough, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

/** Extensions stored verbatim (already compressed; deflate buys ~nothing). */
const STORE_EXTS = new Set([
	"zip", "jar", "war", "ear", "7z", "gz", "bz2", "xz", "zst", "lz4", "br",
	"jpg", "jpeg", "png", "gif", "webp", "avif", "ico", "bmp",
	"mp3", "mp4", "m4a", "m4v", "mov", "avi", "mkv", "webm", "flac", "ogg",
	"woff", "woff2", "ttf", "otf", "eot",
	"pdf", "docx", "xlsx", "pptx", "apk", "ipa", "dmg", "iso"
]);

const CRC_TABLE = (() => {
	const table = new Int32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
		table[n] = c;
	}
	return table;
})();

/** Incremental CRC-32 (zlib-compatible): pass the previous result back in. */
function crc32Update(buf, crc) {
	let c = crc ^ 0xFFFFFFFF;
	for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
	return (c ^ 0xFFFFFFFF) >>> 0;
}

function extOf(name) {
	const base = name.slice(name.lastIndexOf("/") + 1);
	const dot = base.lastIndexOf(".");
	return dot === -1 ? "" : base.slice(dot + 1).toLowerCase();
}

/** MS-DOS date/time words (local time, 2-second granularity). */
function dosTime(mtimeMs) {
	const d = new Date(mtimeMs);
	const year = Math.max(0, Math.min(127, d.getFullYear() - 1980));
	return {
		time: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
		date: (year << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
	};
}

/** Defensive entry-name sanitizer: forward slashes, no traversal segments. */
function sanitizeName(name) {
	const clean = String(name)
		.replace(/\\/g, "/")
		.split("/")
		.filter((seg) => seg !== "" && seg !== "." && seg !== "..")
		.join("/");
	if (clean === "" || /[\x00-\x1f]/.test(clean)) throw new Error(`zip: invalid entry name: ${String(name).slice(0, 80)}`);
	if (Buffer.byteLength(clean, "utf8") > 0xFFFF) throw new Error(`zip: entry name too long: ${clean.slice(0, 80)}`);
	return clean;
}

function u32(v) { return v >>> 0; }

/**
 * Write one archive to `outPath`.
 *
 * @param {string} outPath destination file (created/truncated).
 * @param {Array<{path: string, type: "file"|"dir", mtimeMs?: number, open?: () => import("node:fs").ReadStream}>} entries
 *   Ordered entries. Files must provide `open()` returning a FRESH read
 *   stream (invoked exactly once, when the entry is reached).
 * @param {{signal?: AbortSignal}} [options]
 * @returns {Promise<{count: number, bytes: number}>} entries written and
 *   final archive size in bytes.
 */
export async function writeZip(outPath, entries, { signal } = {}) {
	// 0600: archives live in the user-private export dir and may carry
	// workspace content — no reason for other local users to read them.
	const out = createWriteStream(outPath, { mode: 0o600 });
	let result = { count: 0, bytes: 0 };

	async function* zipStream() {
		let offset = 0; // bytes yielded so far == the next header's offset
		const central = [];
		const push = (buf) => { offset += buf.length; return buf; };

		for (const entry of entries) {
			if (signal?.aborted) throw new Error("aborted");
			// ZIP32 wire limit: every local-header offset is a uint32. The
			// caller's 2GB default makes this unreachable, but a raised
			// --maxExportBytes must fail loudly, not emit a corrupt archive.
			if (offset > 0xFFFFFFFF) throw new Error("zip: archive exceeds the ZIP32 4GiB limit");
			const name = sanitizeName(entry.path);
			const isDir = entry.type !== "file";
			const { time, date } = dosTime(entry.mtimeMs ?? Date.now());
			const zipName = isDir && !name.endsWith("/") ? `${name}/` : name;
			const nameBuf = Buffer.from(zipName, "utf8");
			const entryOffset = offset;

			if (isDir) {
				const header = Buffer.alloc(30);
				header.writeUInt32LE(0x04034b50, 0);
				header.writeUInt16LE(20, 4);          // version needed
				header.writeUInt16LE(0x0800, 6);      // flags: UTF-8
				header.writeUInt16LE(0, 8);           // method: store
				header.writeUInt16LE(time, 10);
				header.writeUInt16LE(date, 12);
				header.writeUInt32LE(0, 14);          // crc
				header.writeUInt32LE(0, 18);          // csize
				header.writeUInt32LE(0, 22);          // usize
				header.writeUInt16LE(nameBuf.length, 26);
				header.writeUInt16LE(0, 28);          // extra len
				yield push(header);
				yield push(nameBuf);
				central.push({ nameBuf, flags: 0x0800, method: 0, time, date, crc: 0, csize: 0, usize: 0, offset: entryOffset });
				continue;
			}

			if (typeof entry.open !== "function") throw new Error(`zip: file entry without open(): ${name}`);
			const store = STORE_EXTS.has(extOf(name));
			const method = store ? 0 : 8;
			// Data-descriptor form: sizes/CRC ride AFTER the data (flag bit 3).
			const header = Buffer.alloc(30);
			header.writeUInt32LE(0x04034b50, 0);
			header.writeUInt16LE(20, 4);
			header.writeUInt16LE(0x0800 | 0x0008, 6);
			header.writeUInt16LE(method, 8);
			header.writeUInt16LE(time, 10);
			header.writeUInt16LE(date, 12);
			header.writeUInt32LE(0, 14);
			header.writeUInt32LE(0, 18);
			header.writeUInt32LE(0, 22);
			header.writeUInt16LE(nameBuf.length, 26);
			header.writeUInt16LE(0, 28);
			yield push(header);
			yield push(nameBuf);

			const crcRef = { crc: 0, usize: 0 };
			const counter = new Transform({
				transform(chunk, _enc, cb) {
					crcRef.crc = crc32Update(chunk, crcRef.crc);
					crcRef.usize += chunk.length;
					cb(null, chunk);
				}
			});
			const comp = store ? new PassThrough() : createDeflateRaw();
			// Sub-pipeline: file → CRC/size counter → compressor. It ENDS the
			// compressor (never the output file); the compressed bytes are
			// consumed here and yielded into the single outer pipeline.
			const rs = entry.open();
			const pumping = pipeline(rs, counter, comp).then(() => null, (error) => ({ error }));
			let csize = 0;
			try {
				for await (const chunk of comp) {
					if (signal?.aborted) throw new Error("aborted");
					csize += chunk.length;
					yield push(chunk);
				}
			} catch (error) {
				const settled = await pumping;
				throw settled?.error ?? error;
			}
			const settled = await pumping;
			if (settled?.error) throw settled.error;
			if (crcRef.usize > 0xFFFFFFFF || csize > 0xFFFFFFFF) {
				throw new Error(`zip: entry too large for ZIP32: ${name}`);
			}
			const dd = Buffer.alloc(16);
			dd.writeUInt32LE(0x08074b50, 0);
			dd.writeUInt32LE(u32(crcRef.crc), 4);
			dd.writeUInt32LE(u32(csize), 8);
			dd.writeUInt32LE(u32(crcRef.usize), 12);
			yield push(dd);
			central.push({ nameBuf, flags: 0x0800 | 0x0008, method, time, date, crc: u32(crcRef.crc), csize: u32(csize), usize: u32(crcRef.usize), offset: entryOffset });
		}

		if (signal?.aborted) throw new Error("aborted");
		if (offset > 0xFFFFFFFF) throw new Error("zip: archive exceeds the ZIP32 4GiB limit");
		if (central.length > 0xFFFF) throw new Error(`zip: too many entries for ZIP32 (${central.length})`);

		// ── central directory ────────────────────────────────────────────────
		const cdOffset = offset;
		for (const e of central) {
			const rec = Buffer.alloc(46);
			rec.writeUInt32LE(0x02014b50, 0);
			rec.writeUInt16LE(20, 4);             // version made by
			rec.writeUInt16LE(20, 6);             // version needed
			rec.writeUInt16LE(e.flags, 8);
			rec.writeUInt16LE(e.method, 10);
			rec.writeUInt16LE(e.time, 12);
			rec.writeUInt16LE(e.date, 14);
			rec.writeUInt32LE(u32(e.crc), 16);
			rec.writeUInt32LE(u32(e.csize), 20);
			rec.writeUInt32LE(u32(e.usize), 24);
			rec.writeUInt16LE(e.nameBuf.length, 28);
			rec.writeUInt16LE(0, 30);             // extra len
			rec.writeUInt16LE(0, 32);             // comment len
			rec.writeUInt16LE(0, 34);             // disk start
			rec.writeUInt16LE(0, 36);             // internal attrs
			rec.writeUInt32LE(0, 38);             // external attrs
			rec.writeUInt32LE(u32(e.offset), 42);
			yield push(rec);
			yield push(e.nameBuf);
		}
		const cdSize = offset - cdOffset;

		// ── end-of-central-directory ─────────────────────────────────────────
		const eocd = Buffer.alloc(22);
		eocd.writeUInt32LE(0x06054b50, 0);
		eocd.writeUInt16LE(0, 4);
		eocd.writeUInt16LE(0, 6);
		eocd.writeUInt16LE(central.length, 8);
		eocd.writeUInt16LE(central.length, 10);
		eocd.writeUInt32LE(u32(cdSize), 12);
		eocd.writeUInt32LE(u32(cdOffset), 16);
		eocd.writeUInt16LE(0, 20);
		yield push(eocd);

		result = { count: central.length, bytes: offset };
	}

	try {
		await pipeline(zipStream, out);
		return result;
	} catch (error) {
		try { out.destroy(); } catch { /* already gone */ }
		throw error;
	}
}
