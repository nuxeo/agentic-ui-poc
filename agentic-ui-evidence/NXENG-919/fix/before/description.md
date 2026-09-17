## Issue

On **Dashboard** (`/#/dashboard`), Accessible name does not match or contain the visible label text (IBM **label_name_visible**, WCAG **A**, Issue ID **3716899689**).

## Acceptance criteria

* Violation remediated on the affected UI without hiding the control in the manifest only.
* IBM Equal Access re-scan no longer reports Issue ID **3716899689** (or accepted suppression with justification).
* No regression to layout, keyboard use, or authentication on the affected flow.

## Evidence (before fix)

| Attachment | Shows |
| --- | --- |
| `NXENG-919-before-01-context.png` | App shell header with global search field |
| `NXENG-919-before-02-focused.png` | Focused control for label-in-name review |
| `NXENG-919-before.webm` | Recording: navigate to Dashboard and focus the reported control |
