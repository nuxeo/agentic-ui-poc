## What changed and why

NXENG-817 (IBM **922184956**) reports missing keyboard focus on the document viewer **Rotate left** toolbar control. The visible `:focus` outline was already added for all image-toolbar icon buttons in **NXENG-799**; this PR ties the ticket to that rule with an explicit **Rotate left** regression test and documents IBM issue **922184956** in the SCSS comment.

## JIRA ticket

[NXENG-817](https://hyland.atlassian.net/browse/NXENG-817)

## Acceptance criteria

1. **[from ticket]** Rotate left on Document detail Preview shows a visible keyboard focus indicator — verified by `document-viewer-toolbar-focus-ring.spec.ts` (Rotate left case, all themes).
2. **[from ticket]** IBM Equal Access issue **922184956** addressed — verified by standalone `:focus` selector test + 2px/3:1 contrast assertions.
3. **[from ticket]** No layout/keyboard/auth regression — verified by existing NXENG-799 toolbar tests + affected lint/test/build.

## Root cause

Angular Material MDC icon buttons on `.viewer-toolbar` suppress the default focus ring; IBM `style_focus_visible` inspects `:focus` only, so no outline was detected before NXENG-799.

## How to test

- [ ] Open `/#/doc/:uid` on a **Picture** → Preview tab → Tab to **Rotate left** → **2px** visible focus ring on the grey toolbar strip (all themes).
- [ ] `npx nx test nuxeo-ui --no-watch --include=**/document-viewer-toolbar-focus-ring.spec.ts`
