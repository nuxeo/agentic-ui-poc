## Issue

On **Browse** (`/#/browse/default-domain/workspaces`), the **Browse (adf-hx POC)** item in the **left sidebar** may not show a visible keyboard focus indicator (IBM **style_focus_visible**, WCAG **AA**, Issue ID **317808202**, **Needs review**). IBM reported the same sidebar link on Dashboard, Document detail, and Browse; confirm the focus outline or border is visible when the link is keyboard-focused.

## Acceptance criteria

* Finding confirmed or ruled false positive with brief rationale on the affected UI.
* IBM Equal Access re-scan no longer reports Issue ID **317808202** (or accepted suppression with justification).
* No regression to layout, keyboard use, or authentication on the affected flow.

## Evidence (before fix)

| Attachment | Shows |
| --- | --- |
| `NXENG-791-before-01-browse-with-shell.png` | Browse with app shell sidebar |
| `NXENG-791-before-02-nav-link-focused.png` | Keyboard focus on sidebar Browse nav link |
| `NXENG-791-before.webm` | Recording: navigate to Browse and focus the reported control |
