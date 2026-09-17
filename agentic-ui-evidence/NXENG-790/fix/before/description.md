## Issue

On **Document detail** (/#/doc/:uid), Text contrast of 3.54 with its background is less than the WCAG AA minimum requirements for text of size 11px and weight of 400 (IBM **text_contrast_sufficient**, WCAG **AA**, Issue ID **300762098**).

## Acceptance criteria

* Violation remediated on the affected UI.
* IBM Equal Access re-scan no longer reports Issue ID **300762098** (or accepted suppression with justification).
* No regression to layout, keyboard use, or authentication on the affected flow.

## Evidence (before fix)

| Attachment | Shows |
| --- | --- |
| `NXENG-790-before-01-context.png` | Document detail Preview tab / viewer |
| `NXENG-790-before-02-focused.png` | File size label in viewer (contrast finding) |
| `NXENG-790-before.webm` | Recording of navigation to the reported surface |
