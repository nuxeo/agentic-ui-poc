import { defineConfig } from '@playwright/test';
import base from './playwright.config';
import { JOURNEY_SCREENS, journeyProjectName, journeyTag } from './src/a11y/journey.screens';

/** Every accessibility spec lives here and nowhere else. See the note on layout below. */
const A11Y_DIR = './src/a11y';

/**
 * The one browser config every accessibility project uses.
 *
 * Chromium only. The base config's WebKit project exists to prove cross-browser rendering;
 * running the scan twice would emit a second report with near-identical findings, and axe's
 * rule set is engine-independent. Add a WebKit project here if a WebKit-specific accessibility
 * question ever needs answering.
 *
 * Hoisted so that every project below shares it by reference — a new project cannot be added
 * with a different browser by copy-pasting the wrong line.
 */
const CHROMIUM = base.projects![0].use;

/**
 * The a11y-scout accessibility suite — `src/a11y/*.a11y.spec.ts`.
 *
 * A separate config rather than a project inside `playwright.config.ts`, because the two
 * suites have different prerequisites and different meanings. `beta:e2e` needs Playwright
 * and a live stack; this also needs the two hand-distributed a11y-scout tarballs, and a
 * missing tarball must cost the accessibility run, not the critical-path run. The base
 * config's `testIgnore` is the other half of that split.
 *
 * Everything else — `baseURL`, `httpCredentials`, viewport, trace and video settings — is
 * inherited, so the two suites cannot drift on how they authenticate or what they point at.
 *
 * ## Layout: a directory AND a suffix, deliberately both
 *
 * The accessibility specs sit in their own `src/a11y/` directory and keep the `.a11y.spec.ts`
 * suffix. That is the shape Playwright's own accessibility guidance and the common community
 * layouts converge on, and each half earns its place here:
 *
 *   - the **directory** is what `testDir` selects, which is Playwright's documented mechanism
 *     for suites that live apart ("Each project can use a different directory"), and it is what
 *     `playwright.config.ts` excludes — one path instead of a filename pattern;
 *   - the **suffix** keeps a spec self-describing in a stack trace, a report and a `git log`,
 *     where the directory is easy to miss.
 *
 * Before this they were nine files flat in `src/`, two suites with different prerequisites
 * separated only by a filename.
 */
export default defineConfig({
  ...base,
  testDir: A11Y_DIR,
  testMatch: '**/*.a11y.spec.ts',
  testIgnore: undefined,

  // A scan is not a page load. Each surface runs axe, a keyboard walk of up to 300 real key
  // presses, and reflow geometry, which the inherited 45s budget does not begin to cover —
  // the first run took 2.8 minutes on `trash` and exceeded 240s on `browse`. Sized against
  // measured worst case rather than guessed, and generous on purpose: this is an opt-in
  // local scan, not a PR gate, so a slow pass beats a timeout that reports nothing.
  timeout: 600_000,
  expect: { timeout: 15_000 },

  // The findings accumulator is worker-scoped, so one worker is what produces ONE
  // consolidated report instead of a folder of disconnected ones.
  workers: 1,

  // No retries. A retried scan re-adds the same page to the accumulator, which would
  // double-count its findings in the consolidated report.
  retries: 0,

  // A project per suite, and the split is load-bearing rather than cosmetic. The
  // a11y-scout accumulator is a **worker-scoped** fixture, so spec files that share a worker
  // share one report — and `surfaces.a11y.spec.ts` asserts its report covers exactly its own
  // seven surfaces, which a second file appending to the same accumulator would break. A
  // project gets its own worker, so each suite accumulates and emits independently.
  //
  // They are run separately (`a11y:surfaces` / `a11y:states` / …) because the surfaces scan
  // alone takes 27 minutes; making one command imply all of them would give people a reason
  // not to run any.
  //
  // The suites are grouped the way accessibility suites are usually grouped — by what the
  // scan is looking at rather than by rule. Both lists below are declarations: adding a suite
  // is one entry in SUITES, adding a journey screen is one entry in `journey.screens.ts`.
  projects: [
    // One project per spec file. `use` is applied once here rather than repeated per entry,
    // so a new suite cannot be added with the wrong browser config by copy-paste.
    ...(
      [
        ['surfaces', 'pages, in their default loaded state'],
        ['interaction-states', 'components and overlays, reachable only behind a click'],
        ['display-modes', 'the same pages under dark, forced-colors and reduced-motion'],
      ] as ReadonlyArray<readonly [name: string, covers: string]>
    ).map(([name]) => ({
      name,
      use: CHROMIUM,
      testMatch: `**/${name}.a11y.spec.ts`,
    })),

    // The journey suite — one project per screen, and here the split is not about keeping
    // two suites apart but about the deliverable itself. `journey.a11y.spec.ts` produces a
    // SELF-CONTAINED report per screen, and the accumulator is worker-scoped and is never
    // cleared by `generateReport()`. Four `generateReport()` calls in one worker would emit
    // login, then login+dashboard, then login+dashboard+browse — each labelled with one
    // screen and containing several. A project per screen is what makes each report honest;
    // `emitScreenReport()` asserts `pagesScanned.length === 1` so the day that stops being
    // true is a red run rather than a quietly wrong artifact.
    //
    // Generated from `JOURNEY_SCREENS` rather than written out, because the project name, the
    // `grep` and the test's tag have to agree and nothing used to make them. A project whose
    // grep matches nothing is dropped **silently** when other projects match — measured, not
    // assumed: a fifth project grepping a typo'd tag produced "Total: 4 tests, exit 0". Both
    // sides now derive from one id, and `journey.screens.ts` documents the second guard.
    ...JOURNEY_SCREENS.map((screen) => ({
      name: journeyProjectName(screen.id),
      // Unauthenticated screens drop `httpCredentials`: with them set, Playwright answers the
      // Basic auth challenge on the app's anonymous `/nuxeo/api/v1/me` hydration probe, the
      // app builds a session from the reply, and `authGuard` forwards `/` to the dashboard.
      use: screen.authenticated ? CHROMIUM : { ...CHROMIUM, httpCredentials: undefined },
      testMatch: '**/journey.a11y.spec.ts',
      grep: new RegExp(journeyTag(screen.id)),
    })),
  ],

  reporter: [['list']],
});
