## Issue

On **Dashboard** (`/#/dashboard`), **heading levels** in the main content may skip levels (IBM **heading-order**, WCAG **A**, Issue ID **9015197423**). Confirm heading order is semantically correct.

## Acceptance criteria

* Violation remediated on the affected UI without hiding the control in the manifest only.
* IBM Equal Access re-scan no longer reports Issue ID **9015197423** (or accepted suppression with justification).
* No regression to layout, keyboard use, or authentication on the affected flow.

## Evidence (before fix)

| Attachment | Shows |
| --- | --- |
| `NXENG-941-before-01-context.png` | Dashboard main content (heading order) |
| `NXENG-941-before-02-focused.png` | Heading structure in dashboard content |
| `NXENG-941-before.webm` | Recording: navigate to Dashboard and focus the reported control |
