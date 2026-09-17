## Issue

On **Browse** (`/#/browse/default-domain/workspaces`), Accessible name does not match or contain the visible label text (IBM **label_name_visible**, WCAG **A**, Issue ID **2972081309**).

## Acceptance criteria

* Violation remediated on the affected UI without hiding the control in the manifest only.
* IBM Equal Access re-scan no longer reports Issue ID **2972081309** (or accepted suppression with justification).
* No regression to layout, keyboard use, or authentication on the affected flow.

## Evidence (before fix)

| Attachment | Shows |
| --- | --- |
| `NXENG-894-before-01-context.png` | App shell header with global search field |
| `NXENG-894-before-02-focused.png` | Focused control for label-in-name review |
| `NXENG-894-before.webm` | Recording: navigate to Browse and focus the reported control |
