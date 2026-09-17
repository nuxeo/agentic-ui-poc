# NXENG-758 — sample Jira fields (not applied)

Pattern aligned with login tickets (e.g. NXENG-749): one surface in the summary, Issue + plain-bullet AC + Evidence table.

---

## Summary (proposed)

`[Browse] [Needs review] Browse (adf-hx POC) sidebar link keyboard focus may not be visible (WCAG 2.4.7 AA)`

---

## Description (proposed)

## Issue

On **Browse** (`/#/browse/default-domain/workspaces`), the **Browse (adf-hx POC)** item in the **left sidebar** may not show a visible keyboard focus indicator (IBM **style_focus_visible**, WCAG **2.4.7** AA, Issue ID **22018174**, **Needs review**). IBM reported the same sidebar link on Dashboard, Document detail, and Browse; confirm the focus outline or border is visible when the link is keyboard-focused.

## Acceptance criteria

* With keyboard focus on the **Browse (adf-hx POC)** sidebar link, the focus indicator is clearly visible (not removed or hidden by CSS on `border`/`outline`).
* Outcome documented: **fix applied** or **no change** with rationale if the finding does not reproduce on re-test.
* IBM Equal Access re-scan no longer reports Issue ID **22018174** (or accepted suppression with justification).
* No regression to shell navigation, routing, or browse content.

## Evidence (before fix)

| Attachment | Shows |
| --- | --- |
| `NXENG-758-before-01-browse-with-shell.png` | Browse workspace with documents loaded; app shell and sidebar visible |
| `NXENG-758-before-02-nav-link-focused.png` | Keyboard focus on **Browse (adf-hx POC)** in the left navigation |
| `NXENG-758-before.webm` | Open browse folder, then focus the sidebar link |

---

## Local evidence (before fix)

Folder: `~/Desktop/agentic-ui-evidence/NXENG-758/fix/before/`

Re-capture: `node scripts/collect-evidence/NXENG-758-before-standalone.mjs` (requires Nuxeo + `nx serve` on :4200).

Capture check: `focused: A aria-label= Browse (adf-hx POC)`; browse folder had document rows at `/#/browse/default-domain/workspaces`.
