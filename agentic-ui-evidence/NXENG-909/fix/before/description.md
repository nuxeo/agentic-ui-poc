## Issue

On **Browse** (`/#/browse/default-domain/workspaces`), Check the keyboard focus indicator is visible when using CSS declaration for 'border' or 'outline' (IBM **style_focus_visible**, WCAG **AA**, Issue ID **3350142295**, **Needs review**).

## Acceptance criteria

* Finding confirmed or ruled false positive with brief rationale on the affected UI.
* IBM Equal Access re-scan no longer reports Issue ID **3350142295** (or accepted suppression with justification).
* No regression to layout, keyboard use, or authentication on the affected flow.

## Evidence (before fix)

| Attachment | Shows |
| --- | --- |
| `NXENG-909-before-01-context.png` | App shell header with global search |
| `NXENG-909-before-02-focused.png` | Keyboard focus on global search input |
| `NXENG-909-before.webm` | Recording: navigate to Browse and focus the reported control |
