# a11y-scout — runtime accessibility scanning

`npm run a11y:surfaces` runs a11y-scout — an internal Hyland WCAG scanner, distributed as tarballs
rather than published — over the authenticated surfaces, and writes one consolidated
HTML/Markdown/JSON report to `a11y-reports/`.

> **`docs/accessibility.md` is the source of truth** for how accessibility is measured here —
> which layer owns which verdict, the baseline shape, the cadence, and the recorded decisions.
> This page is the tool appendix: what a11y-scout is, how to install it, and how it behaves.
> Read the standard first. To _write_ a new check, see `docs/accessibility-authoring.md`.

Under that standard a11y-scout owns **keyboard traps, focus order and visibility, reflow, and
AI content semantics**. It does not own the axe verdict — `phase-6-a11y.mjs` does. a11y-scout
runs axe too, and its axe findings are an informational cross-check that never fails a run.
Every finding carries a `source` field, so the boundary is a filter rather than a convention.

## What a11y-scout adds that axe cannot

- **Keyboard-trap detection (WCAG 2.1.2)** — walks the page with real `Tab` / `Shift+Tab` /
  `Escape` presses looking for regions focus can enter but not leave. `phase-6-a11y.mjs`
  presses `Tab` exactly once and checks focus left `body`; that is a reachability check, and
  it cannot find a trap.
- **Reflow (WCAG 1.4.10)** — narrow-viewport geometry, invisible to any static rule.
- **Focus order and focus-visible (2.4.3 / 2.4.7)**, including obscured-focus checks.
- **AI content-quality findings** at A/AA — meaningless `alt`, generic link text, vague
  headings, missing `autocomplete`, unmarked language changes. These need a real LLM.

## Installation — the tarballs are not on any registry

Both packages are distributed by hand from the a11y-scout SharePoint folder. `npm install
a11y-scout` returns 404 and always will: the engine is **unscoped**, so it cannot live in
GitHub Packages either, which only serves `@owner/name`.

Download `a11y-scout-0.3.0.tgz` **and** `a11y-scout-playwright-0.3.0.tgz`, then:

```bash
npm install --no-save @playwright/test @axe-core/playwright \
  <path>/a11y-scout-0.3.0.tgz <path>/a11y-scout-playwright-0.3.0.tgz
```

Three things about that command are load-bearing:

- **`--no-save`.** The upstream guide says plain `npm install`, which writes an absolute path
  from your own disk (`file:C:\Users\you\Downloads\…`) into `package.json` and the lockfile.
  That breaks `npm ci` for everyone else and fails the `lockfile` gate.
- **All four in one command.** `npm install --no-save X` prunes anything previously installed
  with `--no-save`, so installing them separately silently removes Playwright.
- **Both tarballs together.** The fixture declares `a11y-scout` as an ordinary dependency;
  install it alone and npm goes looking in the registry for an engine that is not there.

`npm run a11y:surfaces` runs `e2e-preflight.mjs --a11y`, which checks both are importable and
prints this command if either is missing.

## LLM configuration is optional

With no credentials, `npx a11y-scout doctor` reports `Active: mock`. **Mock mode is not
vacuous**: axe, the keyboard walk and reflow all run normally and produce real findings. Only
the AI content-quality checks are skipped — so an empty semantic result means _not measured_,
not _clean_. `state.meta.llmMockMode` records which it was, and the report says so.

Level is pinned to **AA**. At AAA the semantic agent emits stub findings tagged `__mock__`,
which would put noise in the report and prove nothing.

To enable the AI checks, put `HAIP_API_KEY=…` in a local `.env` (never committed). Note that
provider auto-detection picks Bedrock whenever `AWS_PROFILE` is merely _set_, so pin the
provider explicitly rather than relying on the default.

## Why it is a separate Playwright config

`apps/nuxeo-ui-e2e/playwright.a11y.config.ts`, run separately from `beta:e2e`, because the two
suites have different prerequisites. The critical-path suite needs Playwright and a live
stack; this also needs two tarballs no registry can supply. A colleague who has not downloaded
them must lose the accessibility run, not thirteen critical-path specs. The base config's
`testIgnore: '**/*.a11y.spec.ts'` is the other half of that split.

`apps/nuxeo-ui-e2e/package.json` exists only to set `"type": "module"`. a11y-scout is
ESM-only — its `exports` map has `import` and no `require` — and Playwright transpiles specs
to CommonJS by default, which fails with `No "exports" main defined`. Scoping ESM to this one
directory avoids making the whole repository ESM.

## The first baseline

Seven surfaces, chromium, mock mode, **26.8 minutes**, **81 findings**: 23 blocker, 53 severe,
3 major, 1 minor, 1 review.

| Rule                                                               | Count | Can axe see it? |
| ------------------------------------------------------------------ | ----- | --------------- |
| `focus-offscreen`                                                  | 45    | no              |
| `focus-obscured-min`                                               | 13    | no              |
| `color-contrast`                                                   | 8     | yes             |
| `label-content-name-mismatch`                                      | 4     | yes             |
| `landmark-*`, `aria-required-children`, `button-name`, table rules | 11    | yes             |

By the `source` field the split is **59 `keyboard` to 22 `axe`** — the 59 adds
`focus-indicator-missing`, which the table above folds into its final row. **59 of 81 findings
are checks axe cannot perform**, which is the case for running this tool alongside
`phase-6-a11y.mjs` rather than instead of it. The 22 axe findings are the cross-check, and
`docs/accessibility.md` explains why they are not a verdict.

This run's 8 `color-contrast` and 2 `button-name` findings contradict `phase-6-a11y.mjs`,
which records both rules as driven to zero. Both cannot be right, and neither number should be
quoted until it is resolved. Tracked as **The open disagreement** in `docs/accessibility.md`,
which is also where the candidate causes are listed. Do not baseline these until it is
understood.

## It is slow, and that is expected

Measured on this application: **8.8 minutes for `/#/browse`**, ~39s for `/#/search`, 2.5
minutes for `/#/trash`, 3.0 for `/#/tasks`, 4.5 for administration, 4.0 for knowledge
discovery, 3.2 for the adf-hx POC. The cost is the keyboard walk — up to 150 steps per direction, each a
real key press plus a DOM read, against a page where Angular runs change detection on every
one of them. The per-test timeout is 600s for that reason.

Tier-2 focus-indicator screenshots are disabled in the spec (`noFocusIndicatorScreenshots:
true`). They pixel-diff up to 30 clipped screenshots per page to upgrade a style-delta
heuristic to a pixel comparison, and the tier-1 check still reports missing indicators
without them. **`keyboard` and `focusChecks` stay on** — they are the reason this suite
exists, and disabling them to get a fast green would leave a suite measuring only what
`phase-6-a11y.mjs` already measures.

This is why it is opt-in and local, not a PR gate.

## A failing scan fragments the report

The findings accumulator is **worker-scoped**, and Playwright discards a worker process after
a failed test. So one failing surface splits the run into several reports: the dying worker
auto-finalizes what it had, a fresh worker starts empty, and `generateReport()` only ever sees
the pages scanned since the last failure.

The first full run demonstrated it exactly. Eight surfaces, one failure at position five, and
`a11y-reports/` came out with three folders instead of one — two auto-finalized stubs named
after the project (`chromium-<timestamp>`) and a final report covering only the last three
surfaces. `state.meta.pagesScanned` said **3** while the console said seven surfaces passed.

This is why the last test asserts `pagesScanned.length === SURFACES.length`. Without it a
fragmented run reads as a success: every scan test green, a report on disk, and two thirds of
the application silently missing from it. If that assertion fails, do not adjust it — find out
which surface failed and why.

## Nothing fails the run yet

`failOnBlockers` is `false` everywhere. These checks have never run against this application,
so the true count is unknown, and a gate that goes red on its first run for reasons nobody has
triaged is one people learn to ignore — `coverage-gate.mjs` and `scripts/a11y-scan.mjs` both
carry that warning, and this repository has a recorded case of CI red for 16 consecutive runs
over an unowned ceiling.

The sequence is: read the report, triage the findings, fix or baseline them, and only then
turn `failOnBlockers` on.
