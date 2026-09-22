import type { A11yFixture, ScanPageOptions } from '@a11y-scout/playwright';
import type { Page, TestInfo, TestType } from '@playwright/test';
import { expect, REPORT_DIR, test } from '../fixtures';
import {
  JOURNEY_SCREENS,
  journeyReportName,
  journeyTag,
  type JourneyScreenId,
} from './journey.screens';

/**
 * WCAG 2.1 AA scan of the **user journey**, one self-contained report per screen.
 *
 * ## What this adds over the suites that already exist
 *
 * `surfaces.a11y.spec.ts` scans seven authenticated routes into ONE consolidated report, and
 * `interaction-states.a11y.spec.ts` scans seven states behind clicks into another. Both group
 * their output by WCAG rule, which answers "which rules does this app fail" but not "how bad
 * is the screen I am about to demo". This file answers the second question: it walks the
 * screens in the order a real user meets them and emits a separate report for each, so a
 * screen can be handed to whoever owns it without them reading around six other screens.
 *
 * Three of the four screens below are scanned here for the first time by anything:
 *
 *   - **login** — no committed script has ever scanned it. It was covered once by an ad-hoc
 *     `a11y-scout scan-url` against a backend-less dev server, which is not the same page:
 *     that run saw the form in its error state.
 *   - **dashboard** — `app.routes.ts` redirects `path: ''` here, so it is the first screen
 *     every signed-in user sees, and it is absent from `SURFACES`.
 *   - **document detail** — the most-used read surface in the product, never scanned.
 *
 * ## Why one Playwright project per screen, rather than four `generateReport()` calls
 *
 * The a11y-scout accumulator is **worker-scoped**, and `finalizeAndEmit` does not clear
 * `pageScans` when it emits — it only flips `reportEmitted`. Calling `generateReport()` once
 * per screen inside a single worker would therefore produce cumulative reports: login, then
 * login+dashboard, then login+dashboard+browse. Each would be labelled with one screen and
 * contain several, which is precisely the kind of self-confirming artifact this repository
 * has been bitten by before.
 *
 * A Playwright project gets its own worker, so `playwright.a11y.config.ts` declares one
 * project per screen and each accumulates and emits independently. `emitScreenReport()`
 * asserts `pagesScanned.length === 1` so that if this assumption ever stops holding — a
 * Playwright change, a fixture change — the run goes red instead of quietly emitting a
 * report that covers more than its title claims.
 *
 * ## Prerequisites
 *
 *   npm install --no-save @playwright/test @axe-core/playwright \
 *     <path>/a11y-scout-0.3.0.tgz <path>/a11y-scout-playwright-0.3.0.tgz
 *   npm run beta:backend && npx nx serve nuxeo-ui
 *
 * Run:
 *   npm run a11y:scan -- journey
 */

/**
 * Scan settings shared by every screen, so no screen is accidentally measured more weakly
 * than its neighbours and a cross-screen comparison stays meaningful.
 *
 * `keyboard` is on everywhere. It is the reason this suite exists — axe cannot detect a
 * keyboard trap or a modal focus leak, and on the column picker alone the keyboard walk
 * produced 42 of 51 findings. `noFocusIndicatorScreenshots` is on for the same reason as in
 * `surfaces.a11y.spec.ts`: tier-2 pixel-diffing costs minutes per screen to upgrade a
 * heuristic that already reports, and nothing here is triaged yet.
 */
const SCREEN_SCAN: ScanPageOptions = {
  level: 'AA',
  failOnBlockers: false,
  keyboard: true,
  noFocusIndicatorScreenshots: true,
};

/**
 * The fixtures a journey test receives, derived from the `test` object rather than restated.
 *
 * Written this way because `Parameters<typeof test>[1]` resolves to `TestDetails` — `test` is
 * overloaded as `(title, body)` and `(title, details, body)` — which typechecks against nothing
 * useful and produces a wall of implicit-`any` errors at each call site.
 */
type JourneyArgs =
  typeof test extends TestType<infer Args, infer WorkerArgs> ? Args & WorkerArgs : never;
type JourneyBody = (args: JourneyArgs, testInfo: TestInfo) => Promise<void> | void;

/** Screens that have actually been given a test below. Checked against `JOURNEY_SCREENS`. */
const declared = new Set<JourneyScreenId>();

/**
 * Declare one screen's test.
 *
 * The only way to add a screen to this file, and it exists to remove a whole class of silent
 * failure. The tag is derived from the same `id` the config derives the project's `grep` from,
 * so the two cannot drift; and the id is a literal union, so a typo is a compile error rather
 * than a project that quietly matches nothing.
 *
 * See `assertEveryScreenDeclared()` for the other half — this guards a *mistyped* screen, that
 * guards a *missing* one.
 */
function journeyTest(id: JourneyScreenId, body: JourneyBody): void {
  const screen = JOURNEY_SCREENS.find((s) => s.id === id);
  if (!screen) {
    throw new Error(`journeyTest called with an id absent from JOURNEY_SCREENS: ${id}`);
  }
  declared.add(id);
  test(`${screen.label} ${journeyTag(id)}`, body);
}

/**
 * Fail collection if a screen is declared in `journey.screens.ts` but has no test here.
 *
 * Called at module scope, so it throws while Playwright is loading the file — which fails
 * *every* project, including a run that filtered down to one screen. That matters because of
 * the behaviour this whole arrangement is built around: Playwright reports "No tests found"
 * only when the entire run is empty, so an unwritten screen's project would otherwise be
 * dropped in silence alongside the screens that do work, and the command would stay green.
 */
function assertEveryScreenDeclared(): void {
  const missing = JOURNEY_SCREENS.filter((s) => !declared.has(s.id)).map((s) => s.id);
  if (missing.length > 0) {
    throw new Error(
      `journey.a11y.spec.ts: ${missing.length} screen(s) declared in journey.screens.ts have ` +
        `no test here: ${missing.join(', ')}. Its Playwright project exists and would match ` +
        `nothing, which Playwright does not report when other projects match — so the screen ` +
        `would silently never be scanned. Add a journeyTest('<id>', …) call, or remove the ` +
        `entry from JOURNEY_SCREENS.`,
    );
  }
}

/**
 * Wait for the nav drawer's folder tree to finish loading before scanning.
 *
 * ## Why this exists — the flake it fixes was hiding a real defect
 *
 * Two document-detail runs minutes apart on unchanged code disagreed:
 *
 *     08:32   button-name x6   + nested-interactive x1, target-size x1   (25 findings)
 *     08:39   button-name x7                                            (24 findings)
 *
 * All three differing findings were on the same element, `.tree-node:nth-child(7) >
 * .tree-toggle` — the last folder to arrive in the drawer. `nav-drawer.component.html`
 * explains it: while `node.loading` is true the toggle contains
 * `<mat-spinner aria-label="Loading">`, and afterwards it contains a `<mat-icon>`, which
 * Angular Material marks `aria-hidden` by default.
 *
 * So the loading spinner **lends the button an accessible name it does not really have**.
 * A scan that catches the tree mid-load does not merely add two spurious findings — it
 * suppresses a genuine `button-name` failure and reports six unnamed toggles where there
 * are seven. The settled state is the truthful one, and it is the worse one.
 *
 * That makes this a correctness fix rather than a flake suppression, which is the only
 * reason to add a wait: waiting to make a number stable is worth nothing if the stable
 * number is the wrong one.
 */
async function waitForNavTreeSettled(page: Page, required: boolean): Promise<void> {
  if (required) {
    await expect(
      page.locator('.tree-node').first(),
      'this screen shows the folder tree, so it must have rendered before the scan starts',
    ).toBeVisible();
  }

  await expect(
    page.locator('.folder-tree .tree-loading'),
    'the folder tree root is still loading',
  ).toHaveCount(0);
  await expect(
    page.locator('.tree-node mat-spinner'),
    'a folder node is still loading, and its spinner would lend its toggle a name it loses ' +
      'once loaded',
  ).toHaveCount(0);

  // Absence of spinners is not the same as "finished": a node can arrive between two
  // renders with no spinner of its own. Require the node count to repeat before scanning.
  let previous = -1;
  await expect
    .poll(
      async () => {
        const current = await page.locator('.tree-node').count();
        const stable = current === previous;
        previous = current;
        return stable;
      },
      {
        message:
          'the folder tree never stopped growing, so any scan of it is a snapshot of ' +
          'a partial tree',
        intervals: [300, 300, 300, 500, 500, 1000],
        timeout: 20_000,
      },
    )
    .toBe(true);
}

/**
 * Emit this screen's report and prove it covers this screen only.
 *
 * The assertion is the load-bearing part. A per-screen report that silently accumulated a
 * previous screen would still be a valid HTML file with plausible numbers in it, and nobody
 * reading it would notice.
 */
async function emitScreenReport(a11y: A11yFixture, reportName: string): Promise<void> {
  const { state, reportPaths } = await a11y.generateReport({
    outDir: REPORT_DIR,
    reportName,
    failOnBlockers: false,
  });

  const { findings } = state;
  const bySource = [...new Set(findings.map((f) => f.source))]
    .map((s) => `${s}=${findings.filter((f) => f.source === s).length}`)
    .join(' ');

  // eslint-disable-next-line no-console
  console.log(
    [
      '',
      `  screen    : ${reportName}`,
      `  page      : ${state.meta.pagesScanned.join(', ')}`,
      `  findings  : ${findings.length} (${bySource})`,
      `  blockers  : ${findings.filter((f) => f.severity === 'blocker').length}`,
      `  rules     : ${[...new Set(findings.map((f) => f.ruleId))].sort().join(', ') || '—'}`,
      `  provider  : ${state.meta.llmProvider}${state.meta.llmMockMode ? ' (MOCK — AI content-quality checks skipped)' : ''}`,
      `  report    : ${reportPaths.html}`,
      '',
    ].join('\n'),
  );

  expect(
    state.meta.pagesScanned.length,
    `"${reportName}" must be a self-contained report covering exactly one screen — ` +
      `got ${state.meta.pagesScanned.length}: ${state.meta.pagesScanned.join(', ')}`,
  ).toBe(1);
}

/**
 * A uid for a document that actually opens in the detail view.
 *
 * Resolved from the repository rather than by clicking a row, because `onRowClick` routes
 * folderish documents to `/browse` and collections to `/collections` — only a non-folderish
 * document reaches `/doc/:uid`. The browse root of a fresh instance shows a single folder,
 * so "click the first row" would land on browse and scan it under the document-detail label.
 *
 * Three constraints on the query, each of which this repository's data violated on the
 * first attempt:
 *
 *   - `FROM File` rather than `FROM Document`. A plain non-folderish query returns
 *     `AdministrativeStatus` records from `/management` first — internal plumbing with no
 *     blob, no thumbnail and no preview, which would scan a near-empty detail view and
 *     report it as the document screen.
 *   - `ecm:mixinType <> 'HiddenInNavigation'` for the same reason: hidden documents are not
 *     a screen any user reaches.
 *   - `ORDER BY dc:created` so repeated runs open the same document and two reports for
 *     this screen are comparable.
 *
 * Credentials are never handled here: the request goes through the app origin, so the
 * `httpCredentials` block in `playwright.config.ts` — itself read from `NUXEO_USER` /
 * `NUXEO_PASS` — authenticates it, and the dev-server proxy forwards it to Nuxeo.
 *
 * The title comes back with the uid so the screen assertion can prove the detail view
 * rendered *that* document rather than an error panel, which is also visible.
 */
async function firstOpenableDocument(page: Page): Promise<{ uid: string; title: string }> {
  const response = await page.request.get('/nuxeo/api/v1/search/lang/NXQL/execute', {
    params: {
      query:
        "SELECT * FROM File WHERE ecm:mixinType <> 'HiddenInNavigation' " +
        'AND ecm:isVersion = 0 AND ecm:isTrashed = 0 ORDER BY dc:created',
      pageSize: 1,
    },
  });

  expect(
    response.ok(),
    `repository query failed with ${response.status()} — document detail cannot be scanned`,
  ).toBeTruthy();

  const body = (await response.json()) as { entries?: Array<{ uid: string; title: string }> };
  const entry = body.entries?.[0];

  // `throw` rather than `expect(...).toBeTruthy()`: the latter does not narrow the type, so it
  // would leave two non-null assertions behind and the failure message below is no weaker.
  if (!entry) {
    throw new Error(
      'the repository holds no File document, so there is nothing to open in the detail view — ' +
        'seed a document before running this screen rather than letting it scan an error panel',
    );
  }

  return { uid: entry.uid, title: entry.title };
}

/**
 * The app's "the user pressed Sign out" marker. Mirrors `SIGNED_OUT_KEY` in `auth.service.ts`;
 * when it is set, `runHydration()` returns a null session without probing the server at all.
 */
const SIGNED_OUT_KEY = 'agentic_ui_signed_out';

/**
 * Screen 1 — the sign-in form.
 *
 * ## Why simply omitting `signedIn` is not enough, and what that cost
 *
 * The obvious approach — don't request the `signedIn` fixture, so no session is injected,
 * so `authGuard` bounces `/` to `/#/login` — does not work here, and the first run of this
 * file failed on exactly that:
 *
 *     Expected pattern: /#\/login/
 *     Received string:  "http://localhost:4200/#/dashboard"
 *
 * With no stored session, `runHydration()` falls through to `tryEstablishCookieSessionOnly()`,
 * which GETs `/nuxeo/api/v1/me`. The base config sets `httpCredentials` for the app origin,
 * so Playwright answers that request's Basic auth challenge automatically, `/me` returns a
 * user, the app builds a cookie session, and the guard lets it through to the dashboard.
 * "No session injected" is therefore not the same as "signed out" — the browser signs itself
 * in on the app's behalf.
 *
 * That failure is the reason this test asserts the URL before scanning. Without it the scan
 * would have run on the dashboard and emitted a report titled `journey-1-login` containing
 * dashboard findings, which is the vacuous pass `phase-6-a11y.mjs` shipped once already.
 *
 * ## The two mechanisms used instead, and what each is for
 *
 *   - `httpCredentials: undefined` on this project (see `playwright.a11y.config.ts`) removes
 *     the automatic Basic auth, so the browser genuinely has no credentials to offer.
 *   - The signed-out marker makes hydration short-circuit before it probes the server at all,
 *     so the screen does not depend on how the server answers an anonymous `/me`.
 *
 * Both are setup, not verification. The `toHaveURL` and `toBeVisible` assertions below are
 * what actually prove the sign-in form is on screen, and they have already been seen to fail.
 */
journeyTest('login', async ({ page, a11y }) => {
  await page.addInitScript((key) => sessionStorage.setItem(key, '1'), SIGNED_OUT_KEY);
  await page.goto('/', { waitUntil: 'networkidle' });

  await expect(page, 'a visit to / without credentials must land on the sign-in form').toHaveURL(
    /#\/login/,
  );
  await expect(page.locator('app-login-page'), 'app-login-page must render').toBeVisible();

  // No drawer on the sign-in page, so this asserts the absence rather than waiting for it.
  await waitForNavTreeSettled(page, false);

  await a11y.scanPage(SCREEN_SCAN);
  await emitScreenReport(a11y, journeyReportName('login'));
});

/**
 * Screen 2 — the dashboard, the landing screen after sign-in.
 *
 * Asserting the host plus real text content: the dashboard has no single piece of repository
 * data that is guaranteed present, so a `toContainText` on a known string would be brittle.
 * A non-empty `main` is the weaker but honest check — it separates "rendered" from "rendered
 * an empty shell", and the distinction is recorded here rather than glossed.
 */
journeyTest('dashboard', async ({ signedIn: page, a11y }) => {
  await page.goto('/#/dashboard', { waitUntil: 'networkidle' });

  await expect(page.locator('app-dashboard-page'), 'app-dashboard-page must render').toBeVisible();
  await expect
    .poll(async () => (await page.locator('main').innerText()).trim().length, {
      message: 'the dashboard rendered an empty shell — scanning it would prove nothing',
    })
    .toBeGreaterThan(0);

  // The drawer renders a folder tree only on browse-family routes, so it is not required
  // here — but if one is mid-load the same name-masking applies, so it is still awaited.
  await waitForNavTreeSettled(page, false);

  await a11y.scanPage(SCREEN_SCAN);
  await emitScreenReport(a11y, journeyReportName('dashboard'));
});

/**
 * Screen 3 — browse, the primary navigation surface.
 *
 * Scanned by `surfaces.a11y.spec.ts` too, deliberately. It is in the journey because a
 * per-screen report for browse is the thing someone owning browse would be handed, and
 * because it is the control: its numbers here should match its slice of the surfaces run,
 * which is a cheap cross-check that the per-screen split did not change what is measured.
 */
journeyTest('browse', async ({ signedIn: page, a11y }) => {
  await page.goto('/#/browse', { waitUntil: 'networkidle' });

  await expect(page.locator('lib-browse'), 'lib-browse must render').toBeVisible();
  await expect(
    page.locator('.browse-row, .doc-card-wrapper').first(),
    'browse must list at least one document, or this scans an empty table',
  ).toBeVisible();
  await waitForNavTreeSettled(page, true);

  await a11y.scanPage(SCREEN_SCAN);
  await emitScreenReport(a11y, journeyReportName('browse'));
});

/**
 * Screen 4 — document detail, opened on a real document.
 */
journeyTest('document-detail', async ({ signedIn: page, a11y }) => {
  // Navigate first so `page.request` inherits the app origin and the dev-server proxy.
  await page.goto('/#/browse', { waitUntil: 'networkidle' });
  const { uid, title } = await firstOpenableDocument(page);

  await page.goto(`/#/doc/${uid}`, { waitUntil: 'networkidle' });

  await expect(
    page.locator('lib-document-detail'),
    'lib-document-detail must render',
  ).toBeVisible();
  await expect(
    page.locator('lib-document-detail'),
    `the detail view must show "${title}" — an error panel is visible too, and would scan clean`,
  ).toContainText(title);
  // Required: the drawer keeps the browse folder tree while a document is open, and this is
  // the screen whose findings were unstable because of it.
  await waitForNavTreeSettled(page, true);

  await a11y.scanPage(SCREEN_SCAN);
  await emitScreenReport(a11y, journeyReportName('document-detail'));
});

// Last, after every declaration. See the function's own note: a screen listed in
// journey.screens.ts with no test here would otherwise be scanned by nothing, silently.
assertEveryScreenDeclared();
