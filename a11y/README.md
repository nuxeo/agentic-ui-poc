# Runtime accessibility scanning

Playwright driving the real application through **a11y-scout**, which does what no static rule
and no axe run can: presses keys. Tab and Shift+Tab walks looking for traps and focus leaks,
viewport resizes to 320px for reflow geometry, focus-indicator comparison, and — with an LLM
key — content-quality judgement on alt text, link purpose and headings.

This is **development tooling with an expected end date**, and the folder is laid out to be
removed cleanly. See [Removing this](#removing-this).

```bash
npm run a11y:scan -- --help
```

## What is here

```
a11y/
  run.mjs              the only entry point; every suite and diagnostic is a subcommand
  preflight.mjs        refuses to scan a stack that is not there
  playwright.config.ts self-contained; does not extend the critical-path config
  fixtures.ts          the a11y-scout test object plus installSession
  package.json         "type": "module", because a11y-scout is ESM-only
  tsconfig.json
  specs/
    journey.screens.ts        single source for screen id -> project name, tag, report name
    surfaces.a11y.spec.ts     pages, default loaded state
    interaction-states.a11y.spec.ts  components and overlays, behind a click
    display-modes.a11y.spec.ts       dark, forced-colors, reduced-motion
    journey.a11y.spec.ts      workflows, one self-contained report per screen
  diagnostics/
    axe-differential.mjs      axe under two rule configurations, diffed
    reflow-probe.mjs          320px overflow measured independently of the scanner
    route-render-check.mjs    every scanned route renders its feature host
  docs/
    authoring.md              how to write a new check
    a11y-scout.md             what the tool is and how to install it
  reports/                    gitignored output
  artifacts/                  gitignored traces and videos
```

The suites are grouped by **what the scan looks at** — pages, components, display modes,
workflows — not by WCAG rule, because the reports already group by rule.

## Prerequisites

The a11y-scout tarballs are hand-distributed and resolve from no registry, and Playwright is
kept untracked so CI installs are unaffected by a browser download. Install all of them in
**one command** — `npm install --no-save X` prunes anything previously installed with
`--no-save`, so separate installs remove each other:

```bash
npm install --no-save @playwright/test @axe-core/playwright \
  <path>/a11y-scout-0.3.0.tgz <path>/a11y-scout-playwright-0.3.0.tgz
npx playwright install chromium

npm run beta:backend && npx nx serve nuxeo-ui
```

`npm run a11y:scan -- preflight` checks all of it and changes nothing.

Because everything is `--no-save`, **`package-lock.json` is untouched by this folder** — there
is no dependency to unwind when it is removed.

### The LLM key is optional, and its absence is not neutral

Without `HAIP_API_KEY`, a11y-scout runs in mock mode. Axe, the keyboard walk and reflow all
still produce real findings, but the AI content-quality checks are **skipped entirely** —
eleven WCAG criteria (1.1.1, 1.3.3, 2.4.2, 2.4.4, 2.5.3, 3.3.1, 3.3.2 at A; 1.3.5, 2.4.6,
3.1.2, 3.3.3 at AA). An empty semantic result means _not measured_, not _clean_. The preflight
prints which mode you are in for exactly that reason.

## Running it

```bash
npm run a11y:scan -- journey      # ~15 min, one report per screen
npm run a11y:scan -- surfaces     # ~27 min
npm run a11y:scan -- states       # ~20 min
npm run a11y:scan -- modes        # ~20 min

npm run a11y:scan -- reflow       # diagnostics, seconds to a minute
npm run a11y:scan -- routes
npm run a11y:scan -- diff
```

Extra arguments pass through, so a single screen with a visible browser is:

```bash
npm run a11y:scan -- journey --project=journey-1-login --headed
```

Reports land in `reports/<name>-<timestamp>/` as `report.html`, `.md` and `.json`. The HTML is
self-contained — screenshots inlined — so it can be sent to whoever owns the screen.

## Nothing here gates anything

`failOnBlockers` is `false` everywhere. None of these findings are triaged, and a gate that
goes red on its first run for reasons nobody owns is one people learn to ignore —
`coverage-gate.mjs` carries the same warning and this repository has a recorded case of CI
being red for sixteen consecutive runs over an unowned ceiling.

It also cannot run in CI today, for a reason that is about the backend rather than about
speed: the scan needs a live Nuxeo through the dev proxy, and this repository has no compose
file and no `packages.nuxeo.com` credentials. `.github/workflows/a11y.yml` records what would
change that. A second blocker is ours: a runner doing `npm ci` cannot resolve the a11y-scout
tarballs from any registry.

## Related, and deliberately not here

`docs/accessibility.md` is the **standard** — which of the four layers owns which verdict. It
stays in `docs/` because two of those layers, the static template scan (`npm run a11y`) and
the phase-6 axe gate, are permanent and CI-gated. Deleting this folder must not delete the
documentation for things that are not going anywhere.

## Removing this

Nothing under `apps/` or `libs/` was modified to support this folder, and the lockfile is
untouched. Removal is:

```bash
rm -rf a11y/
```

then:

1. delete the `"a11y:scan"` line from the root `package.json`;
2. delete the accessibility line from the Definition of Done in `AGENTS.md`;
3. in `docs/accessibility.md`, remove the a11y-scout layer from the ownership table and the
   sections describing its findings — **edit, do not delete**: that file also documents the
   two layers that remain.

Leave the `a11y`, `a11y:all` and `a11y:baseline` scripts alone. They drive
`scripts/a11y-scan.mjs`, the static template scan, which predates this folder and is gated in
CI.

One deliberate duplication to know about if you are unpicking it: `installSession()` in
`fixtures.ts` is a copy of the same function in `apps/nuxeo-ui-e2e/src/fixtures.ts`. Sharing it
would have meant one definition but also one more thread to cut. The copy cannot fail quietly
— a changed session shape breaks authentication and every assertion goes red.
