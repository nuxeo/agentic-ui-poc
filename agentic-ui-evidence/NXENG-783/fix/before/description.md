## Issue

On **Browse** (`/#/browse/default-domain/workspaces`), Confirm the element should be tabbable and if so, it becomes visible when it has keyboard focus (IBM **element_tabbable_visible**, WCAG **AA**, Issue ID **602695796**, **Needs review**).

## Acceptance criteria

* Finding confirmed or ruled false positive with brief rationale on the affected UI.
* IBM Equal Access re-scan no longer reports Issue ID **602695796** (or accepted suppression with justification).
* No regression to layout, keyboard use, or authentication on the affected flow.

## Evidence (before fix)

| Attachment | Shows |
| --- | --- |
| `NXENG-783-before-01-context.png` | Surface for element_tabbable_visible |
| `NXENG-783-before-02-focused.png` | Reported element region |
| `NXENG-783-before.webm` | Recording: navigate to Browse and focus the reported control |
