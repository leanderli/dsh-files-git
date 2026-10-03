# Editor theme and code font fix

## Goal

Make the selected Monaco theme and code font take effect in file previews and editing, including after DSH restarts.

## Findings

- The vendored Monaco `editor.main` bundle registers only JSON, CSS, HTML, and TypeScript language contributions. The preview picks languages from `monaco.languages.getLanguages()`, so files such as `pom.xml` fall back to `plaintext` and show no syntax colors.
- The code-font choices JetBrains Mono, Fira Code, and Source Code Pro are not installed in the current Windows font set. Their fallback stacks collapse to Cascadia Code/Consolas, making several selections appear identical.
- Theme/font preferences are persisted in local storage and passed to Monaco; keep that behavior while making the chosen options visibly distinct and ensuring the editor listens for preference changes.

## Plan

1. [x] Load Monaco's vendored basic-language contribution before resolving preview languages.
2. [x] Offer distinct locally available code-font choices, preserve compatibility with saved legacy font IDs, and apply font changes to mounted Monaco editors.
3. [x] Rebuild the generated client bundle and run syntax/diff checks; inspect the final source and generated bundle for parity.

## Verification

- `npm run build` — passed.
- `node --check lib/client.js` — passed.
- `git diff --check` — passed.
- Runtime visual verification requires opening DSH and selecting a non-default theme/font; this workspace has no attached DSH browser session.
