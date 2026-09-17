## Issue

On **Document detail** (`/#/doc/:uid`), Keyboard focus indicator may not be visible (2.4.7 Focus Visible) (IBM **style_focus_visible**, WCAG **AA**, **Needs review**).

## Acceptance criteria

* Finding confirmed or ruled false positive with brief rationale on the affected UI.
* IBM re-scan no longer reports this finding (or accepted suppression with justification).
* No regression to layout, keyboard use, or authentication on the affected flow.

## Evidence (before fix)

| Attachment | Shows |
| --- | --- |
| `NXENG-873-before-01-context.png` | Document detail header action toolbar |
| `NXENG-873-before-02-focused.png` | Keyboard focus on header action button (style_focus_visible) |
| `NXENG-873-before.webm` | Recording: navigate to Document detail and focus the reported control |
