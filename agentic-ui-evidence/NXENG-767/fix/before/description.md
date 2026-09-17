## Issue

On **Browse** (`/#/browse/default-domain/workspaces`), an **SVG** has **no accessible name** (IBM **svg_graphics_labelled**, WCAG **A**, Issue ID **29948169**). The SVG element has no accessible name

## Acceptance criteria

* Violation remediated on the affected UI without hiding the control in the manifest only.
* IBM Equal Access re-scan no longer reports Issue ID **29948169** (or accepted suppression with justification).
* No regression to layout, keyboard use, or authentication on the affected flow.

## Evidence (before fix)

| Attachment | Shows |
| --- | --- |
| `NXENG-767-before-01-context.png` | View containing reported SVG |
| `NXENG-767-before-02-focused.png` | Logo / SVG region (accessible name review) |
| `NXENG-767-before.webm` | Recording: navigate to Browse and focus the reported control |
