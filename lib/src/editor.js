		// ── CodeMirror 6 editor (lazy-loaded from CDN, zero bundle weight) ───────
		// The editing feature must not bloat the single-file bundle, so the
		// editor core + language packs are imported on demand from a CDN at
		// first "编辑" click. Two CDNs are tried in order (esm.sh, jsdelivr) so
		// a blocked mirror still works; the language pack is fetched per file
		// extension. Failure is reported to the caller, never thrown blindly.
		const CM_PKGS = {
			state: "@codemirror/state@6",
			view: "@codemirror/view@6",
			commands: "@codemirror/commands@6",
			language: "@codemirror/language@6",
			search: "@codemirror/search@6",
			autocomplete: "@codemirror/autocomplete@6",
			"theme-one-dark": "@codemirror/theme-one-dark@6",
			"lang-javascript": "@codemirror/lang-javascript@6",
			"lang-json": "@codemirror/lang-json@6",
			"lang-markdown": "@codemirror/lang-markdown@6",
			"lang-python": "@codemirror/lang-python@6",
			"lang-java": "@codemirror/lang-java@6",
			"lang-go": "@codemirror/lang-go@6",
			"lang-rust": "@codemirror/lang-rust@6",
			"lang-cpp": "@codemirror/lang-cpp@6",
			"lang-php": "@codemirror/lang-php@6",
			"lang-sql": "@codemirror/lang-sql@6",
			"lang-yaml": "@codemirror/lang-yaml@6",
			"lang-css": "@codemirror/lang-css@6",
			"lang-sass": "@codemirror/lang-sass@6",
			"lang-less": "@codemirror/lang-less@6",
			"lang-html": "@codemirror/lang-html@6",
			"lang-xml": "@codemirror/lang-xml@6"
		};
		const CM_CDNS = [
			(pkg) => `https://esm.sh/${pkg}`,
			(pkg) => `https://cdn.jsdelivr.net/npm/${pkg}/+esm`
		];
		const cmPkgCache = new Map();
		async function cmImport(pkg) {
			if (cmPkgCache.has(pkg)) return cmPkgCache.get(pkg);
			const spec = CM_PKGS[pkg];
			const promise = (async () => {
				if (!spec) throw new Error(t("editor.unknownPkg", { pkg }));
				let lastErr;
				for (const build of CM_CDNS) {
					try { return await import(build(spec)); }
					catch (err) { lastErr = err; }
				}
				throw lastErr || new Error(t("editor.loadFailed", { spec }));
			})();
			// A transient CDN failure must not poison the cache forever: drop the
			// rejected promise so the next "编辑" click retries the load.
			cmPkgCache.set(pkg, promise);
			promise.catch(() => { if (cmPkgCache.get(pkg) === promise) cmPkgCache.delete(pkg); });
			return promise;
		}
		// CodeMirror language extension factory per file extension (best effort;
		// unknown extensions simply get no highlighting).
		const CM_LANG_FOR_EXT = {
			js: "javascript", jsx: "javascript", mjs: "javascript", cjs: "javascript", ts: "javascript", tsx: "javascript", vue: "javascript",
			json: "json", jsonc: "json",
			md: "markdown", markdown: "markdown",
			py: "python",
			java: "java", kt: "java",
			go: "go",
			rs: "rust",
			c: "cpp", h: "cpp", cc: "cpp", cpp: "cpp", cxx: "cpp", hpp: "cpp",
			php: "php",
			rb: "javascript",   // Ruby has no official lang pack; fall back to JS highlighting
			sql: "sql",
			yaml: "yaml", yml: "yaml",
			css: "css", scss: "sass", sass: "sass", less: "less",
			html: "html", htm: "html",
			xml: "xml"
		};
		const CM_LANG_FACTORY = {
			javascript: "javascript", json: "json", markdown: "markdown", python: "python",
			java: "java", go: "go", rust: "rust", cpp: "cpp", php: "php",
			sql: "sql", yaml: "yaml", css: "css", sass: "sass", less: "less", html: "html", xml: "xml"
		};
		async function cmLangExtension(ext) {
			const name = CM_LANG_FOR_EXT[ext];
			if (!name) return null;
			try {
				const mod = await cmImport(`lang-${name}`);
				const factory = mod[CM_LANG_FACTORY[name]];
				return typeof factory === "function" ? factory() : null;
			} catch { return null; }
		}
		// One shared core bundle (state/view/commands/language/search/autocomplete),
		// fetched once per page load.
		let cmCorePromise = null;
		function cmCore() {
			if (!cmCorePromise) {
				cmCorePromise = Promise.all([
					cmImport("state"), cmImport("view"), cmImport("commands"),
					cmImport("language"), cmImport("search"), cmImport("autocomplete")
				]).then(([state, view, commands, language, search, autocomplete]) => ({
					state, view, commands, language, search, autocomplete
				}));
			}
			return cmCorePromise;
		}
		/**
		 * Create a CodeMirror editor inside `hostEl`. opts: { doc, ext, dark,
		 * onChange }. Returns the EditorView. The one-dark theme is applied for
		 * dsh's dark mode; the default light theme otherwise.
		 */
		async function cmCreateEditor(hostEl, opts) {
			const { state, view, commands, language, search, autocomplete } = await cmCore();
			const langExt = await cmLangExtension(opts.ext || "");
			const themeExt = opts.dark ? (await cmImport("theme-one-dark")).oneDark : [];
			const viewInst = new view.EditorView({
				state: state.EditorState.create({
					doc: opts.doc || "",
					extensions: [
						view.lineNumbers(),
						view.highlightActiveLineGutter(),
						view.highlightActiveLine(),
						view.drawSelection(),
						view.dropCursor(),
						language.indentUnit.of("  "),
						language.bracketMatching(),
						language.syntaxHighlighting(language.defaultHighlightStyle, { fallback: true }),
						commands.history(),
						search.highlightSelectionMatches(),
						autocomplete.autocompletion(),
						...(langExt ? [langExt] : []),
						view.keymap.of([
							...commands.defaultKeymap,
							...commands.historyKeymap,
							...search.searchKeymap,
							...autocomplete.completionKeymap,
							commands.indentWithTab
						]),
						...themeExt,
						view.EditorView.updateListener.of((u) => {
							if (u.docChanged && typeof opts.onChange === "function") opts.onChange(u.state.doc.toString());
						})
					]
				}),
				parent: hostEl
			});
			return viewInst;
		}
