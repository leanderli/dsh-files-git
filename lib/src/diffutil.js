		// ── module-level diff helpers (pure, no closure deps) ──────────────────
		// Word-level LCS diff for one +/- line pair: returns segments
		// [{t:"same"|"del"|"add", s}] so the changed words stand out inside
		// the whole-line red/green background.
		const wordSegs = (oldLine, newLine) => {
			const toks = (l) => l.match(/\s+|\S+/g) || [l || " "];
			const a = toks(oldLine), b = toks(newLine);
			const n = a.length, m = b.length;
			if (n > 80 || m > 80) return null; // skip heavy diff on long lines
			const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
			for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
				dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
			const segs = [];
			let i = 0, j = 0;
			while (i < n && j < m) {
				if (a[i] === b[j]) { segs.push({ t: "same", s: a[i] }); i++; j++; }
				else if (dp[i + 1][j] >= dp[i][j + 1]) { segs.push({ t: "del", s: a[i] }); i++; }
				else { segs.push({ t: "add", s: b[j] }); j++; }
			}
			while (i < n) segs.push({ t: "del", s: a[i++] });
			while (j < m) segs.push({ t: "add", s: b[j++] });
			return segs;
		};

		// Parse `git diff` text into colored rows: hunk headers, +/-, file meta.
		// Also counts +/- lines (excluding file headers) and pairs adjacent
		// `-`/`+` lines inside a hunk for word-level highlighting.
		const diffRows = (text) => {
			if (!text) return { rows: [], added: 0, removed: 0 };
			const rows = [];
			let added = 0, removed = 0;
			let delBuf = [], addBuf = [];
			let paired = 0;
			const flush = () => {
				const n = Math.min(delBuf.length, addBuf.length);
				for (let k = 0; k < n; k++) {
					const segs = paired < 1500 ? wordSegs(delBuf[k], addBuf[k]) : null;
					paired++;
					rows.push({ key: `w-${k}`, cls: "dgp-diffDel", text: delBuf[k], segs: segs ? segs.filter((sg) => sg.t !== "add") : null });
					rows.push({ key: `w+${k}`, cls: "dgp-diffAdd", text: addBuf[k], segs: segs ? segs.filter((sg) => sg.t !== "del") : null });
				}
				for (let k = n; k < delBuf.length; k++) rows.push({ key: `wd${k}`, cls: "dgp-diffDel", text: delBuf[k] });
				for (let k = n; k < addBuf.length; k++) rows.push({ key: `wa${k}`, cls: "dgp-diffAdd", text: addBuf[k] });
				delBuf = []; addBuf = [];
			};
			text.split("\n").forEach((line, i) => {
				if (line.startsWith("@@")) { flush(); rows.push({ key: i, cls: "dgp-diffHunk", text: line }); return; }
				if (line.startsWith("diff --git") || line.startsWith("index ") || line.startsWith("--- ") || line.startsWith("+++ ") || line.startsWith("new file") || line.startsWith("deleted file") || line.startsWith("Binary files")) { flush(); rows.push({ key: i, cls: "dgp-diffMeta", text: line }); return; }
				if (line.startsWith("+") && !line.startsWith("+++")) { added++; addBuf.push(line); return; }
				if (line.startsWith("-") && !line.startsWith("---")) { removed++; delBuf.push(line); return; }
				flush(); rows.push({ key: i, cls: "", text: line });
			});
			flush();
			return { rows, added, removed };
		};

		// Shared diff body renderer (stats chips + colored rows + word
		// highlights + truncation note) — used by work diff and commit files.
		const diffBody = (text, truncated) => {
			const parsed = diffRows(text);
			const MAX_DIFF_ROWS = 5000;
			const rows = parsed.rows.length > MAX_DIFF_ROWS ? parsed.rows.slice(0, MAX_DIFF_ROWS) : parsed.rows;
			const cut = parsed.rows.length > MAX_DIFF_ROWS;
			return h(React.Fragment, null,
				h("div", { className: "dgp-diffStats" },
					chip(`+${parsed.added}`, "success"),
					chip(`−${parsed.removed}`, "error")
				),
				rows.map((r) => h("div", { key: r.key, className: "dgp-diffLine" },
					h("span", { className: "dgp-diffSpan" + (r.cls ? " " + r.cls : "") },
						r.segs ? r.segs.map((sg, k) => h("span", { key: k, className: sg.t === "same" ? "dgp-diffWordSame" : sg.t === "add" ? "dgp-diffWordAdd" : "dgp-diffWordDel" }, sg.s)) : r.text
					)
				)),
				(truncated || cut) ? h("div", { className: "dgp-diffLine" }, h("span", { className: "dgp-diffSpan dgp-diffMeta" }, cut ? t("diff.truncatedRows", { count: MAX_DIFF_ROWS }) : t("diff.truncatedText"))) : null
			);
		};
