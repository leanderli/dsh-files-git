		// ── Lucide UI icons (lucide-static v0.552.0, ISC license) ────────────────
		// All icons are 24×24 stroke SVGs rendered with currentColor — color and
		// opacity keep coming from the existing CSS rules, only the glyph shapes
		// changed. Exported names are unchanged from the previous DSH inline set.
		const svg = (...kids) => ({ size = 16, className, style }) =>
			h("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", xmlns: "http://www.w3.org/2000/svg", className, style, "aria-hidden": "true" }, ...kids);
		const lp = (d) => h("path", { d });
		const IconFolderOpen = svg(lp("m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"));
		const IconFolderClose = svg(lp("M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"), lp("M2 10h20"));
		const IconBranch = svg(h("line", { x1: "6", x2: "6", y1: "3", y2: "15" }), h("circle", { cx: "18", cy: "6", r: "3" }), h("circle", { cx: "6", cy: "18", r: "3" }), lp("M18 9a9 9 0 0 1-9 9"));
		const IconBranchOp = IconBranch;
		const IconClose = svg(lp("M18 6 6 18"), lp("m6 6 12 12"));
		const IconRefresh = svg(lp("M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"), lp("M21 3v5h-5"), lp("M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"), lp("M8 16H3v5"));
		const IconChevronRight = svg(lp("m9 18 6-6-6-6"));
		const IconChevronDown = svg(lp("m6 9 6 6 6-6"));
		const IconChevronUp = svg(lp("m18 15-6-6-6 6"));
		const IconChevronLeft = svg(lp("m15 18-6-6 6-6"));
		const IconCheck = svg(lp("M20 6 9 17l-5-5"));
		const IconCheckOk = IconCheck;
		const IconCopy = svg(h("rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }), lp("M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"));
		const IconCode = svg(lp("m16 18 6-6-6-6"), lp("m8 6-6 6 6 6"));
		const IconData = svg(h("ellipse", { cx: "12", cy: "5", rx: "9", ry: "3" }), lp("M3 5V19A9 3 0 0 0 21 19V5"), lp("M3 12A9 3 0 0 0 21 12"));
		const IconListPen = svg(lp("m18.226 5.226-2.52-2.52A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-.351"), lp("M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"), lp("M8 18h1"));
		const IconPaperclip = svg(lp("m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"));
		const IconGlobe = svg(h("circle", { cx: "12", cy: "12", r: "10" }), lp("M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"), lp("M2 12h20"));
		const IconSearch = svg(lp("m21 21-4.34-4.34"), h("circle", { cx: "11", cy: "11", r: "8" }));
		const IconMaximize = svg(lp("M8 3H5a2 2 0 0 0-2 2v3"), lp("M21 8V5a2 2 0 0 0-2-2h-3"), lp("M3 16v3a2 2 0 0 0 2 2h3"), lp("M16 21h3a2 2 0 0 0 2-2v-3"));
		const IconSend = svg(lp("m5 12 7-7 7 7"), lp("M12 19V5"));
		// Warning triangle (lucide "triangle-alert"): danger confirmations and hard
		// reset keep the warning-triangle semantics (circle-alert read too soft).
		const IconWarning = svg(lp("m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 20h16a2 2 0 0 0 1.73-3"), lp("M12 9v4"), lp("M12 17h.01"));
		const IconLoading = svg(lp("M21 12a9 9 0 1 1-6.219-8.56"));
		const IconPlus = svg(lp("M5 12h14"), lp("M12 5v14"));
		const IconEdit = svg(lp("M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"), lp("M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"));
		const IconDownload = svg(lp("M12 15V3"), lp("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"), lp("m7 10 5 5 5-5"));
		const IconSettings = svg(lp("M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"), h("circle", { cx: "12", cy: "12", r: "3" }));
		const IconEllipsis = svg(h("circle", { cx: "12", cy: "12", r: "1" }), h("circle", { cx: "19", cy: "12", r: "1" }), h("circle", { cx: "5", cy: "12", r: "1" }));
		const IconArrowLeft = svg(lp("m12 19-7-7 7-7"), lp("M19 12H5"));
		const IconArrowDown = svg(lp("M12 5v14"), lp("m19 12-7 7-7-7"));
		const IconEye = svg(lp("M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"), h("circle", { cx: "12", cy: "12", r: "3" }));
		const IconExternalLink = svg(lp("M15 3h6v6"), lp("M10 14 21 3"), lp("M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"));
		const IconSave = svg(lp("M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"), lp("M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"), lp("M7 3v4a1 1 0 0 0 1 1h7"));
		const IconAtSign = svg(h("circle", { cx: "12", cy: "12", r: "4" }), lp("M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"));
		const IconTrash = svg(lp("M10 11v6"), lp("M14 11v6"), lp("M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"), lp("M3 6h18"), lp("M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"));
		const IconRightUp = svg(lp("M7 7h10v10"), lp("M7 17 17 7"));
