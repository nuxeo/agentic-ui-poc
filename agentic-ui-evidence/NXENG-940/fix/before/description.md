## Issue

On **Dashboard** (`/#/dashboard`), **text contrast** may be below WCAG AA minimum (IBM **color-contrast**, WCAG **AA**, Issue ID **9044252072**, **Needs review**). Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds — axe-core could not determine compliance automatically due to complex backgrounds, images, or dynamic content.

## Acceptance criteria

* Finding confirmed or ruled false positive with brief rationale on the affected UI.
* IBM Equal Access re-scan no longer reports Issue ID **9044252072** (or accepted suppression with justification).
* No regression to layout, keyboard use, or authentication on the affected flow.

## Evidence (before fix)

| Attachment | Shows |
| --- | --- |
| `NXENG-940-before-01-context.png` | Dashboard main content (contrast review) |
| `NXENG-940-before-02-focused.png` | Reported text region on dashboard |
| `NXENG-940-before.webm` | Recording: navigate to Dashboard and focus the reported control |
