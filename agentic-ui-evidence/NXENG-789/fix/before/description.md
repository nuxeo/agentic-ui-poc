## Issue

On **Document detail** (/#/doc/:uid), Check the keyboard focus indicator is visible when using CSS declaration for 'border' or 'outline' (IBM **style_focus_visible**, WCAG **AA**, Issue ID **299839583**, **Needs review**).

## Acceptance criteria

* Finding confirmed or ruled false positive with brief rationale on the affected UI.
* IBM Equal Access re-scan no longer reports Issue ID **299839583** (or accepted suppression with justification).
* No regression to layout, keyboard use, or authentication on the affected flow.

## Evidence (before fix)

| Attachment | Shows |
| --- | --- |
| `NXENG-789-before-01-context.png` | Document detail header action toolbar |
| `NXENG-789-before-02-focused.png` | Keyboard focus on header action button (style_focus_visible) |
| `NXENG-789-before.webm` | Recording of navigation to the reported surface |
