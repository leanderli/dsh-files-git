# Git log commit-detail layout

## Goal

Align the changed-files and commit-diff columns in the commit detail view. Move the changed-files heading outside its rounded list card so both column headings share a top line and both content areas begin at the same vertical position.

## Findings

- `CommitDetailView` currently renders “Changed files” inside the left `.dgp-gitCard`, adding the card's top padding before its heading.
- The right `.dgp-diffCard` is transparent and renders its heading directly at the top of the column, so the heading and content baselines are offset.

## Plan

1. [x] Wrap the left heading and file-list card in a column layout; move only the heading outside the card.
2. [x] Match the heading-to-content spacing with the right diff pane, including the narrow single-column view.
3. [x] Rebuild `lib/client.js`; run syntax and diff checks; inspect the generated markup/styles.

## Verification

- `npm run build` — passed.
- `node --check lib/client.js` — passed.
- `git diff --check` — passed.
- Runtime screenshot comparison at wide and narrow widths is preferred; no DSH browser session is attached to this task.
