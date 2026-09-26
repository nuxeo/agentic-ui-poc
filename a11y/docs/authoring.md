# Writing accessibility checks — Playwright + a11y-scout against this app

Three pages, three jobs. `docs/accessibility.md` is the **standard** — which layer owns which
verdict. `a11y/docs/a11y-scout.md` is the **tool** — what a11y-scout is and how to install it. This
page is the **authoring guide**: how to point Playwright at this application and write a script
that finds an accessibility issue nobody has found yet.

Read the standard first. A check that duplicates an existing layer's verdict is a defect here,
not a contribution.

---

## 0. Where the file goes

Everything lives under `a11y/`, and nothing outside it is modified. That is not tidiness — it
is what makes the folder removable in one command. See `../README.md`.

```
a11y/
  run.mjs                           the only entry point; suites and diagnostics are subcommands
  preflight.mjs                     refuses to scan a stack that is not there
  playwright.config.ts              testDir: './specs'
  fixtures.ts                       test object, installSession, expectSurfaceUsable, REPORT_DIR
  env.mjs                           required Nuxeo credentials for the Node-side tooling
  package.json  tsconfig.json  .gitignore
  specs/
    journey.screens.ts              single source: screen id -> project name, tag, report name
    surfaces.a11y.spec.ts           pages, default state
    interaction-states.a11y.spec.ts components and overlays, behind a click
    display-modes.a11y.spec.ts      dark / forced-colors / reduced-motion
    journey.a11y.spec.ts            workflows, one self-contained report per screen
  diagnostics/
    axe-differential.mjs
    reflow-probe.mjs
    route-render-check.mjs
  docs/          authoring.md (this file) · a11y-scout.md
  reports/  artifacts/              gitignored output
```

`apps/nuxeo-ui-e2e/` is the **critical-path** suite and is byte-identical to main. It needs no
`testIgnore` for us, because nothing of ours is under its `testDir`.

Three rules, and each is enforced by something rather than by goodwill:

1. **An accessibility spec goes in `a11y/specs/` and carries the `.a11y.spec.ts` suffix.**
   `testDir: './specs'` is what collects it, so a spec anywhere else simply never runs — and
   `a11y:scan` would report a green suite that silently skipped it. The suffix is redundant to
   the tooling and kept anyway, so a spec is self-describing in a stack trace and a report.
2. **Group by what the scan looks at, not by WCAG rule** — pages, states, modes, workflows. The
   reports already group by rule; a directory that did the same would answer a question you can
   already answer.
3. **A standalone diagnostic goes in `a11y/diagnostics/` and gets a subcommand in `run.mjs`.**
   The repo-wide convention is that a script has an entry point; here the entry point is the
   dispatcher rather than its own `package.json` line, so that removing the folder is still a
   one-line change at the root.

### The four extension points, and what each costs

| To add                           | Edit                                                         | Guard if you get it wrong                                             |
| -------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------- |
| A **route** to the surfaces scan | one row in `SURFACES`                                        | the spec asserts `pagesScanned.length === SURFACES.length`            |
| An **interaction state**         | one `test()` using `enterState()`                            | `enterState()` throws if the trigger or the resulting state is absent |
| A **journey screen**             | one entry in `journey.screens.ts` + one `journeyTest()` call | compile error on a bad id; collection error on a missing test         |
| A whole **new suite**            | a spec file + one entry in the config's suite list           | — (see below)                                                         |

Nothing else needs touching. In particular **`package.json` does not**: `a11y:scan -- journey` selects
projects with a `journey-*` wildcard, so a fifth screen is picked up without a script change.

### Why a journey screen is defined in one place

A screen's identity used to be written three times — a tag in the test title, a `grep` in the
config, and a project name — with nothing tying them together. That is a **silent** failure.
Measured, not assumed: a fifth project grepping a typo'd tag produced

```
Total: 4 tests in 1 file        exit: 0
```

Playwright reports "No tests found" only when the _whole run_ is empty. One project matching
nothing, next to projects that match, is dropped without a word — so the screen would never be
scanned and the command would stay green.

`journey.screens.ts` is now the single source for all three, and both ways of getting it wrong
are loud. Each was verified by breaking it on purpose:

```
journeyTest('logn', …)          → error TS2345: Argument of type '"logn"' is not assignable
                                   to parameter of type '"browse" | "login" | …'

id in JOURNEY_SCREENS, no test  → Error: 1 screen(s) declared in journey.screens.ts have no
                                   test here: search …                          exit: 1
```

The second throws at module scope, so it fails _every_ project rather than only the one that
was filtered out — which is the point, since the filtered-out one is exactly what nobody sees.

### Adding a new suite

A new suite is a spec file plus one entry in the config's suite list. One project per
consolidated report, because the a11y-scout accumulator is worker-scoped — two spec files
sharing a worker share a report. The `use` block is applied once for all projects, so a new
suite cannot pick up the wrong browser config by copy-paste.

This is the one extension point with no automatic guard: a spec file added without a project
is simply never run. Keep suites few and named after what they scan, and the gap stays visible.

---

## 1. Pick the integration style

Three styles exist in this repository and they are deliberately different. Pick by what you are
trying to do, not by what you copied last.

| You want to                                               | Style                                           | Start from                                    |
| --------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------- |
| Find new keyboard / focus / reflow issues across surfaces | **Playwright Test runner + a11y-scout fixture** | `a11y/specs/surfaces.a11y.spec.ts`            |
| Answer one targeted question fast ("does X reproduce?")   | **Standalone Playwright library script**        | `a11y/diagnostics/axe-differential.mjs`       |
| Add a conformance case to the Beta gate                   | **Beta harness evidence step**                  | `scripts/beta-harness/steps/phase-6-a11y.mjs` |

The difference that matters: the **test runner** gives you fixtures, retries, parallelism and
the a11y-scout accumulator, at the cost of a config and a worker model you have to respect. The
**library** gives you a plain Node script you can run and reason about in one file. Neither is
better; the diagnostics in §4 exist as library scripts precisely because a 20-second answer
should not require a test runner.

## 2. The two things every script must do

Skip either and your script will produce confident, meaningless green.

### 2a. Authenticate with _both_ mechanisms

`httpCredentials` alone lets XHRs through but does not satisfy the app's route guard. The
sessionStorage session alone renders pages but leaves `/nuxeo/api` calls returning intermittent
403s. `helpers.mjs` documents this and both are required:

```js
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  httpCredentials: { username: user, password: pass, origin: baseUrl },
});

await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(800);
await page.evaluate(
  ({ key, value, signedOutKey }) => {
    sessionStorage.setItem(key, value);
    sessionStorage.removeItem(signedOutKey);
  },
  {
    key: 'agentic_ui_nuxeo_session',
    signedOutKey: 'agentic_ui_signed_out',
    value: JSON.stringify({
      kind: 'basic',
      username: user,
      basic: Buffer.from(`${user}:${pass}`).toString('base64'),
      isAdministrator: user.toLowerCase() === 'administrator',
      groups: [],
    }),
  },
);
await page.reload({ waitUntil: 'networkidle' });
```

In a **spec**, do not hand-roll this — the `signedIn` fixture already does it, and
`fixtures.ts` rebases it onto a11y-scout's `test` so both are available in one spec:

```23:28:a11y/fixtures.ts
export const test = a11yBase.extend<{ signedIn: Page }>({
  signedIn: async ({ page }, use) => {
    await installSession(page);
    await use(page);
  },
});
```

Credentials come from `NUXEO_USER` / `NUXEO_PASS` and are **required, not defaulted**.
`requireNuxeoCredentials()` in `../fixtures.ts` throws when either is unset, and `../env.mjs`
does the same for the Node-side tooling, so a run fails at load rather than scanning as a
guessed identity. Do not reintroduce a `?? 'Administrator'` fallback: besides the security
rule, a default silently authenticates as the wrong user against any server that accepts it,
and nothing in the report says so.

### 2b. Assert the surface rendered before you scan it

**An empty screen scans clean.** This is the single most expensive mistake in this repository's
accessibility tooling and it has landed three times: a step labelled "Login surface" that
scanned the dashboard, a "card view" step that scanned the table view, and `/#/collections`,
which has no matching route and has been counting its empty result as a pass for weeks.

**A visible host is not enough, and this guide used to stop there.** A failed load renders the
same host component with an error panel inside it, which is visible — so `toBeVisible()` on the
host passes and the scan measures the error state under the surface's name. Use
`expectSurfaceUsable()`, which adds absence of the known error classes and non-empty content:

```70:80:a11y/specs/surfaces.a11y.spec.ts
    test(`scans ${label}`, async ({ signedIn: page, a11y }) => {
      await page.goto(route, { waitUntil: 'networkidle' });

      // A surface that did not render scans clean, and a clean scan of nothing is the
      // vacuous pass this repository keeps getting caught by — `phase-6-a11y.mjs` shipped
      // a step labelled "Login surface" that actually scanned the dashboard.
      //
      // `expectSurfaceUsable` rather than a bare `toBeVisible` on the host: a failed load
      // renders the same host with an error panel, which is visible. See its own comment for
      // what it proves and what it still does not.
      await expectSurfaceUsable(page, host, label);
```

Be clear on its limit: it proves the surface rendered, is not in a known error state, and is
not an empty shell. It does **not** prove repository data arrived. Where a route-specific
success selector is known, assert that instead — `openBrowse()` in
`interaction-states.a11y.spec.ts` waits for `.browse-row, .doc-card-wrapper`, which only exist
when the folder request succeeded.

Run `npm run a11y:scan -- routes` before authoring anything new — it tells you which routes currently
render, so you do not spend an afternoon scanning a dead one.

## 3. Style A — an a11y-scout spec

Import from `../fixtures`, never from `@a11y-scout/playwright` or `./fixtures` directly;
two `test` objects cannot coexist in one spec.

```ts
import { expect, test } from '../fixtures';

test('scans the upload dialog', async ({ signedIn: page, a11y }) => {
  await page.goto('/#/browse', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Upload' }).click();
  await expect(page.locator('mat-dialog-container')).toBeVisible();

  await a11y.scanPage({ level: 'AA', failOnBlockers: false, noFocusIndicatorScreenshots: true });
});
```

### The `scanPage` options that actually matter

| Option                        | Default    | When to change it                                                                                             |
| ----------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| `level`                       | —          | Pin to `'AA'`. At AAA the semantic agent emits `__mock__` stubs in mock mode                                  |
| `failOnBlockers`              | **`true`** | Set `false` until findings are triaged, per the standard                                                      |
| `noFocusIndicatorScreenshots` | `false`    | Set `true`. Tier-2 pixel-diffs up to 30 clipped screenshots per page; tier-1 still reports missing indicators |
| `keyboard` / `focusChecks`    | on         | **Leave on.** Turning them off leaves a suite measuring only what phase-6 already measures                    |
| `include` / `exclude`         | —          | Scope axe to a subtree — useful for a dialog                                                                  |
| `extraWaitMs`                 | —          | Lazy widgets that `networkidle` does not catch                                                                |

The first `scanPage` call in a worker **locks** `level`, `maxCostUsd`, `aiFix` and the LLM
provider. Later calls inherit them and warn on conflict.

### The worker accumulator, and the trap in it

Findings accumulate **per worker**, not per test. That is what lets many tests produce one
report — and it is why a failing test fragments the output: Playwright discards a worker after a
failure, the dying worker auto-finalizes what it had, and a fresh worker starts empty.

The first full run demonstrated it exactly: eight surfaces, one failure at position five, three
report folders instead of one, and `pagesScanned` reading **3** while the console said seven
surfaces passed. So always finish with a coverage assertion:

```ts
test('emits the consolidated report', async ({ a11y }) => {
  const { state } = await a11y.generateReport({ reportName: 'my-scan', failOnBlockers: false });
  expect(state.meta.pagesScanned.length, 'the report must cover every surface').toBe(
    SURFACES.length,
  );
});
```

Make it a `test`, not `afterAll` — that is what lets a11y-scout attach the HTML to the Playwright
report. If that assertion fails, find the surface that failed; do not adjust the number.

## 4. Style B — a standalone diagnostic script

For targeted questions. Copy this skeleton into `a11y/diagnostics/<question>.mjs`:

```js
#!/usr/bin/env node
/** One paragraph: the question this answers, and why it needed its own script. */
import { requireNuxeoCredentials } from '../env.mjs';

const baseUrl = process.env['APP_URL'] ?? 'http://localhost:4200';
// Required, never defaulted — a fallback scans as the wrong identity and says nothing.
const { username: user, password: pass } = requireNuxeoCredentials();

let chromium;
try {
  ({ chromium } = await import('@playwright/test'));
} catch (err) {
  console.error('cannot measure — npm install --no-save @playwright/test');
  process.exit(2);
}

const browser = await chromium.launch({ headless: process.env['A11Y_HEADED'] !== '1' });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  httpCredentials: { username: user, password: pass, origin: baseUrl },
});
const page = await context.newPage();

try {
  // Backend precondition FIRST — an empty screen scans clean and proves nothing.
  const probe = await page.request.get(`${baseUrl}/nuxeo/api/v1/me`, { failOnStatusCode: false });
  if (probe.status() !== 200) {
    console.error(`cannot measure — /nuxeo/api/v1/me returned ${probe.status()}`);
    process.exit(2);
  }
  // ... sign in (§2a), navigate, assert the host (§2b), measure ...
} finally {
  await context.close();
  await browser.close();
}
```

**Exit-code convention, and it is not arbitrary:** `0` measured, `1` the thing being guarded is
wrong, `2` could not measure. A diagnostic should return `0` even when it finds violations — one
that turns the build red is one people stop running. It returns non-zero for _findings_ only if
it is a gate. It must **always** return `2` rather than `0` when it could not measure, because a
scan that silently did not happen must never read as clean.

Then add it as a **subcommand in `../run.mjs`**, not as a script in the root `package.json`:

```js
  <name>: {
    describe: 'Diagnostic: the question it answers',
    preflight: false,
    argv: ['node', 'a11y/diagnostics/<question>.mjs'],
  },
```

The root `package.json` carries exactly one accessibility line, `a11y:scan`, so that removing
this folder is one deletion rather than seven. A diagnostic added to `package.json` instead
becomes an orphaned root script the moment `a11y/` is deleted. See `../README.md`.

`preflight: false` is the default for diagnostics, on the grounds that a twenty-second answer
should not wait on a document query — but it means the script owns its own preconditions. If
it measures anything that an error state can satisfy, check the backend yourself;
`reflow-probe.mjs` does, because an error panel has perfectly measurable geometry.

## 5. Finding _new_ issues — drive state, do not just visit routes

This is the part that actually matters, and it is where nearly all undiscovered issues live.

The evidence is unambiguous. When `phase-6-a11y.mjs` widened from three surfaces to fifteen
cases, the count went from four rule classes to **seven**, with 77 violating nodes — and three
of the extra classes were only visible in states a single visit per route never reaches. A
contrast failure at 3.54:1 on `.card-type` was invisible until someone clicked "Card view".

Likewise, six of a11y-scout's eight `color-contrast` findings do not reproduce under a plain
navigate-and-wait. They are on date-range and select controls, so something opened a panel that
a bare `goto` does not.

### States nothing currently scans

Each of these is a place to point a new script:

- **Dialogs** — upload, share, permissions, collection edit, compare, note image picker
- **The upload flow** and its progress states
- **Dark mode**
- **Error and empty states** — no results, no permission, backend 500
- **Loading states** — spinners had 101 unnamed instances repo-wide, found only because knowledge
  discovery happened to be rendering one at scan time
- **Expanded/collapsed** trees, filter panels, column pickers
- **The login surface**, which no capture can reach today: the runner sets `httpCredentials`, so
  the app authenticates before login can render

### Reaching a state without lying about it

The danger is a click that silently does nothing, leaving a step labelled "card view" scanning
the table view and passing. Never use a bare `.click()` on something that might be absent:

```342:351:scripts/beta-harness/steps/phase-6-a11y.mjs
async function clickIfPresent(page, selector) {
  const el = page.locator(selector).first();
  if ((await el.count()) === 0) {
    console.warn(`  phase-6-a11y: ${selector} not present; the state it opens was NOT scanned`);
    return false;
  }
  await el.click();
  await page.waitForTimeout(1600);
  return true;
}
```

Then **assert the state was reached** before scanning — `h.check('the column picker was actually
opened', columnPanel, …)`. A helper that returns `false` and a caller that ignores it is the
same vacuous pass in a different costume.

### State survives navigation

View mode is held in a service, so it persists across `goto`. After a card-view step the
column-picker button is not rendered at all, and the next step will scan card view again while
claiming to scan the column panel. Reset explicitly — click "List view" first — rather than
assuming a fresh route means a fresh state.

## 6. Traps, each one already paid for

| Trap                          | What happens                                                                   | Fix                                                              |
| ----------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `npm install --no-save X`     | **Prunes** anything previously `--no-save`'d, silently removing Playwright     | Install all packages in ONE command                              |
| Plain `npm install <tarball>` | Writes `file:C:\Users\you\…` into the lockfile, breaking `npm ci` for everyone | Always `--no-save`                                               |
| a11y-scout is ESM-only        | `No "exports" main defined` — Playwright transpiles specs to CJS               | `a11y/package.json` sets `"type": "module"` for this folder only |
| Hash routing                  | `goto('/#/x')` is **same-document**, so `APP_INITIALIZER` never re-runs        | Use a real `page.reload()` when asserting reloaded-app behaviour |
| Keyboard walk is slow         | Up to 150 steps per direction; browse takes 8.8 minutes                        | Per-test timeout is 600s in `a11y/playwright.config.ts`          |
| A failing test                | Fragments the worker-scoped report                                             | Assert `pagesScanned.length`                                     |
| Dev proxy                     | `proxy.conf.json` is **not** hot-reloaded                                      | Restart `nx serve` after editing it                              |
| Node 22+                      | A built-in `localStorage` shadows jsdom's                                      | Node is pinned to 20 in `.nvmrc`                                 |

## 7. Before you commit a new check

1. **Does an existing layer already own this?** If yes, extend it instead. Duplicate verdicts are
   how the axe disagreement happened.
2. **Negative-control it.** Introduce the defect deliberately, watch the check go red, remove it.
   A check never observed to fail is not evidence — and a check that passed _while the defect was
   present_ has happened here, in the first version of phase-6's `aria-label` step.
3. **Does it assert the deliverable, or the app's pulse?** "A report was written" is a pulse.
   "The report covers all seven surfaces" is the deliverable.
4. **Is any exclusion scoped to one surface and does it cite an owner?** Never a global rule id.
5. **Update `docs/accessibility.md`** if the ownership table changed.
