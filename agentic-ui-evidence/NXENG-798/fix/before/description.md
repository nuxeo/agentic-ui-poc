## Issue

On **Browse** (`/#/browse/default-domain/workspaces`), the **global search** field in the **top header** may rely on **placeholder text** as the only visible label (IBM **input_label_visible**, WCAG **A; A**, Issue ID **1637375356**, **Needs review**). Confirm an accessible name is exposed (e.g. visible label or `aria-label`) that includes the placeholder wording.

## Acceptance criteria

* Finding confirmed or ruled false positive with brief rationale on the affected UI.
* IBM Equal Access re-scan no longer reports Issue ID **1637375356** (or accepted suppression with justification).
* No regression to layout, keyboard use, or authentication on the affected flow.

## Evidence (before fix)

| Attachment | Shows |
| --- | --- |
| `NXENG-798-before-01-context.png` | App shell header with global search field |
| `NXENG-798-before-02-focused.png` | Global search input (placeholder-only visible label) |
| `NXENG-798-before.webm` | Recording: navigate to Browse and focus the reported control |
