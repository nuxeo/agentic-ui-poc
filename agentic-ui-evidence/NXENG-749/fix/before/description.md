## Issue

On **Login** (`/#/login`), Password field focus may be obscured (WCAG 2.4.11 AA).

## Acceptance criteria

* Finding confirmed or ruled false positive with brief rationale on the affected UI.
* IBM Equal Access re-scan no longer reports this finding (or accepted suppression with justification).
* No regression to layout, keyboard use, or authentication on the affected flow.

## Evidence (before fix)

| Attachment | Shows |
| --- | --- |
| `NXENG-749-before-01-initial.png` | Initial view on login |
| `NXENG-749-before-02-focused.png` | After keyboard navigation to the reported control |
| `NXENG-749-before.webm` | Short recording of navigation / focus on the surface |
