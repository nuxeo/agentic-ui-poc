import { expect, expectSurfaceUsable, REPORT_DIR, test } from '../fixtures';

/**
 * WCAG 2.1 AA scan of the authenticated surfaces, through `@a11y-scout/playwright`.
 *
 * ## What this adds over `scripts/beta-harness/steps/phase-6-a11y.mjs`
 *
 * The phase-6 capture already runs axe over these routes and is the gate that says the Beta
 * bar is met. This suite is **not** a replacement for it and does not duplicate its verdict.
 * What a11y-scout brings that axe alone cannot:
 *
 *   - **Keyboard-trap detection (WCAG 2.1.2)** — real `Tab` / `Shift+Tab` / `Escape` walks
 *     looking for regions focus can enter but not leave. Phase 6 presses `Tab` exactly once
 *     and checks focus left `body`; that is a reachability check, not a trap check.
 *   - **Reflow (WCAG 1.4.10)** — narrow-viewport geometry, which no static rule can see.
 *   - **Focus-order and focus-visible checks (2.4.3 / 2.4.7)**, including a pixel-level
 *     focus-indicator comparison.
 *   - **AI content-quality findings** at A/AA — meaningless `alt`, generic link text, vague
 *     headings, missing `autocomplete`, unmarked language changes. These need a real LLM
 *     provider; see the mock-mode note below.
 *
 * ## Mock mode is the default, and it is not vacuous — but it is partial
 *
 * With no `HAIP_API_KEY` and no AWS profile, `a11y-scout doctor` reports `Active: mock`. In
 * that mode axe, keyboard and reflow still run and produce real deterministic findings, so
 * the checks listed above minus the AI ones are genuine. The **AI content-quality findings
 * are skipped entirely**, so an empty semantic result here means "not measured", not "clean".
 * Level is pinned to AA for the same reason: at AAA the semantic agent emits stub findings
 * tagged `__mock__`, which would put noise in the report and prove nothing.
 *
 * ## Why nothing here fails the run yet
 *
 * `failOnBlockers` is `false` on every call. These checks have never run against this
 * application, so the true count is unknown, and a gate that goes red on its first run for
 * reasons nobody has triaged is one people learn to ignore — `coverage-gate.mjs` and
 * `scripts/a11y-scan.mjs` both carry the same warning, and this repository has a recorded
 * case of CI being red for 16 consecutive runs over an unowned ceiling. Read the report,
 * triage, fix or baseline, and only then turn this red.
 *
 * Prerequisites — the two tarballs are hand-distributed, not on any registry:
 *   npm install --no-save @playwright/test @axe-core/playwright \
 *     <path>/a11y-scout-0.3.0.tgz <path>/a11y-scout-playwright-0.3.0.tgz
 *   npm run beta:backend && npx nx serve nuxeo-ui
 *
 * Run:
 *   npm run a11y:scan -- surfaces
 */

/** Route, and the component that must be on screen before the route is worth scanning. */
const SURFACES: ReadonlyArray<readonly [label: string, route: string, host: string]> = [
  ['browse', '/#/browse', 'lib-browse'],
  ['search', '/#/search', 'lib-search'],
  ['trash', '/#/trash', 'lib-trash'],
  ['tasks', '/#/tasks', 'lib-tasks-page'],
  // `/#/collections` is deliberately absent. `collectionsRoutes` declares exactly one route,
  // `:uid`, so the bare path matches nothing and the surface never renders — the first run of
  // this file failed on it, which is the render guard below doing its job.
  //
  // Worth knowing: `phase-6-a11y.mjs` scans `/#/collections` in its secondary-surfaces loop
  // and asserts no selector there, so it has been scanning a non-rendering route and counting
  // the clean result as a pass. Scanning a real collection needs a uid from the repository,
  // which is a fixture this suite does not have yet.
  ['administration', '/#/administration', 'lib-administration-shell'],
  ['knowledge discovery', '/#/knowledge-discovery', 'lib-knowledge-discovery'],
  ['adf-hx browse POC', '/#/browse-adf-hx', 'lib-browse-adf-hx-poc'],
];

test.describe('accessibility: authenticated surfaces', () => {
  for (const [label, route, host] of SURFACES) {
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

      await a11y.scanPage({
        level: 'AA',
        failOnBlockers: false,
        // Tier-2 of the focus-indicator check (WCAG 2.4.7) focuses up to 30 candidates and
        // pixel-diffs a clipped screenshot of each. Off here, and only here: on `browse` the
        // scan took 4.1 minutes and blew a 240s budget, and the tier-1 style-delta check that
        // remains still reports missing indicators. Paying minutes per surface to upgrade a
        // heuristic to a pixel diff is not worth it while nothing is triaged yet.
        //
        // What is NOT disabled: `keyboard` (2.1.2 trap detection) and `focusChecks` (2.4.3 /
        // 2.4.7 tier-1) both stay on. They are the reason this suite exists at all — axe
        // cannot do either — so turning them off to get a fast green would leave a suite that
        // measures only what phase-6-a11y.mjs already measures.
        noFocusIndicatorScreenshots: true,
      });
    });
  }

  // Last, and deliberately a test rather than `afterAll`: the accumulator is worker-scoped,
  // so this emits ONE consolidated report covering every surface above, and being a test is
  // what lets a11y-scout attach the HTML to the Playwright report.
  test('emits the consolidated report', async ({ a11y }) => {
    const { state, reportPaths } = await a11y.generateReport({
      outDir: REPORT_DIR,
      reportName: 'nuxeo-satori-surfaces',
      failOnBlockers: false,
    });

    // eslint-disable-next-line no-console
    console.log(
      [
        '',
        `  pages scanned : ${state.meta.pagesScanned.length}`,
        `  findings      : ${state.findings.length}`,
        `  LLM provider  : ${state.meta.llmProvider}${state.meta.llmMockMode ? ' (MOCK — AI content-quality checks were skipped)' : ''}`,
        `  LLM cost      : $${state.cost.totalUsd.toFixed(4)}`,
        `  report        : ${reportPaths.html}`,
        '',
      ].join('\n'),
    );

    // The report is the deliverable, so assert it covers what this file claims to scan
    // rather than merely that a file was written.
    expect(
      state.meta.pagesScanned.length,
      'the consolidated report must cover every surface in SURFACES',
    ).toBe(SURFACES.length);
  });
});
