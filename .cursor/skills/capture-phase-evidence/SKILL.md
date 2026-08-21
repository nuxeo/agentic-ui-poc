---
name: capture-phase-evidence
description: Capture verified image evidence for a step or phase of agentic-ui-poc using the Playwright phase harness — write an assertion-bearing steps file, run it against the dev server, and produce a screenshot report (manifest.json plus INDEX.md with inlined images) that exits non-zero if any check fails. Use when asked to capture evidence, take before/after screenshots, prove a change works, produce artifacts for a PR or Confluence page, or record a Beta phase outcome.
---

# Capture phase evidence

Evidence exists to let a reviewer disbelieve you and be proved wrong. A folder of
screenshots does not do that; screenshots tied to assertions do.

Harness: `scripts/beta-harness/` (see its README). For single-JIRA-ticket bug
work use `npm run evidence:collect` instead — same helper contract, ticket-shaped
output.

## Prerequisites

```bash
node -e "require.resolve('@playwright/test')" 2>/dev/null && echo available || echo missing
# if missing (deliberately untracked, so CI installs stay unaffected):
npm install --no-save @playwright/test && npx playwright install chromium

npx nx serve nuxeo-ui    # separate terminal, must be running
```

## 1. Write the steps file

Copy `scripts/beta-harness/steps/_template.mjs` to
`scripts/beta-harness/steps/<phase-id>.mjs`.

```js
export default async function run(page, h) {
  h.step('Document list shows the Modified By column');
  await h.login();
  await h.goTo('/#/browse-adf-hx');
  await h.expectVisible('document list rendered', 'hxp-document-list');
  await h.expectText('Modified By column present', 'hxp-document-list', 'Modified By');
  await h.screenshot('document-list-columns');

  h.step('Health');
  h.expectNoConsoleErrors();
}
```

Helpers: `step`, `screenshot`, `check`, `expectVisible`, `expectText`,
`expectNoConsoleErrors`, `goTo`, `goToDoc`, `login`, `baseUrl`.

## 2. Four rules that make a capture count

1. **Every step records at least one check.** The runner fails a run with zero
   checks on purpose.
2. **Assert the claim, not the pulse.** "`hxp-document-list` is visible" proves
   the app booted. "The first row is a folder and the Version column reads 1.0"
   proves the phase delivered something.
3. **Capture the failure paths too.** If the phase adds an error state, drive it
   and photograph it. Reviewers ask about those first.
4. **Finish with `expectNoConsoleErrors()`.** It catches the regressions a
   screenshot cannot show.

## 3. Run

```bash
npm run beta:evidence -- <phase-id>
```

Output in `$AGENTIC_UI_EVIDENCE_DIR/beta/<phase-id>/<timestamp>/`:

- `NN-*.png` numbered by step
- `*.webm` video of the run
- `manifest.json` — steps, checks, environment, verdict
- `INDEX.md` — narrative report with images inlined, ready to paste into a PR

Exit code 0 means every check passed. Non-zero means the phase is not done —
treat it exactly like a failing test.

Useful variables: `EVIDENCE_HEADLESS=1` for CI-style runs, `EVIDENCE_SLOWMO=600`
to make a recording easier to follow, `NUXEO_DOC_UID` for doc-specific steps.

## 4. Report it

Give the user the `INDEX.md` path and **inline the key screenshots** in your
response using their absolute paths, so they can see the result without opening
files. Quote the verdict line verbatim.

## Common problems

| Symptom                                   | Cause                                                                                                    |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `ERR_CONNECTION_REFUSED`                  | Dev server not running.                                                                                  |
| Login appears to work but pages are empty | Nuxeo unreachable through the proxy; check `proxy.conf` and that Nuxeo is up.                            |
| Every check fails on selectors            | Component selectors changed. Verify with `grep -rh "selector: '" libs/shared/adf-hx-bridge/src/lib/ui/`. |
| Verdict `fail` with 0 checks              | The steps file captured screenshots but asserted nothing. Add checks.                                    |
| Screenshots blank at the top of the run   | Add a short wait after `login()`; the shell needs a beat to hydrate.                                     |

## Never

- Never commit evidence output into the repo — it lives outside the tree.
- Never hardcode credentials in a steps file; they come from the environment.
- Never present a capture from a previous run as evidence for a new change.
