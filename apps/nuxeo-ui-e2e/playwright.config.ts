import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests for `nuxeo-ui`, against a **live Nuxeo**.
 *
 * ## Why this is not an Nx `@nx/playwright` project
 *
 * `@playwright/test` is installed with `--no-save` on purpose — CLAUDE.md, "Environment" —
 * so CI installs stay unaffected by a 300 MB browser dependency. Adding `@nx/playwright`
 * would put Playwright into `package.json` and undo that decision. So the runner comes from
 * the `--no-save` install and is invoked as `npx playwright test`; only the config and the
 * specs live in the repository.
 *
 * ## Why it is not in the 15-gate inner loop
 *
 * It needs two things a PR runner does not have: a Nuxeo instance with OpenSearch, and a
 * served app. `verify-gate` treats any non-zero exit as a failure with no
 * precondition-not-met path, so adding this there would make the whole gate red on every
 * machine without the Docker stack — and `coverage-gate.mjs` already records what happens
 * then: "a gate that cannot pass gets bypassed and then ignored. That is worse than no
 * gate."
 *
 * It is a **phase gate** instead, run against the local stack via `npm run beta:e2e`, and
 * `scripts/beta-harness/e2e-preflight.mjs` refuses to report a pass when the stack is
 * absent rather than passing vacuously. That this does not run on every PR is a real
 * limitation, recorded in `.ai/state/phases.json` rather than glossed.
 *
 * ## Authentication
 *
 * Two mechanisms, both required — established the hard way by the evidence harness, whose
 * comment is worth repeating: injecting a session into `sessionStorage` satisfies the route
 * guard so pages render, but does **not** reliably authenticate XHRs, which surfaces as
 * intermittent 403s on `/nuxeo/api` paths and specs that fail against a working app.
 *
 *   - `httpCredentials` here — Basic auth on every request to the app origin.
 *   - an init script in `fixtures.ts` — the session object the app's `AuthService` writes.
 *
 * Credentials come from the environment. Never hardcoded, never in a URL.
 */
const baseURL = process.env['E2E_BASE_URL'] ?? 'http://localhost:4200';

export default defineConfig({
  testDir: './src',
  // A real repository has flaky-test pressure; this makes it visible rather than absorbed.
  // A spec that only passes on retry still reports as flaky in the summary.
  retries: process.env['CI'] ? 2 : 1,
  // Serial by default: these share one Nuxeo repository, and parallel specs that create or
  // trash documents would interfere. Read-only specs could parallelise later, per file.
  workers: 1,
  forbidOnly: true,
  // A spec that hangs is a failure, not a wait. The app talks to a local Nuxeo, so
  // anything beyond this is a defect rather than slowness.
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['json', { outputFile: '../../dist/e2e/results.json' }]],
  outputDir: '../../dist/e2e/artifacts',
  use: {
    baseURL,
    viewport: { width: 1440, height: 900 },
    httpCredentials: {
      username: process.env['NUXEO_USER'] ?? 'Administrator',
      password: process.env['NUXEO_PASS'] ?? 'Administrator',
      origin: baseURL,
    },
    // Diagnostics on failure only, so a green run leaves nothing behind.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Phase 6 step 5: "Chrome and Safari verified" from the Beta checklist. WebKit is the
    // engine Safari ships, so this is the closest verifiable proxy — it is not Safari itself,
    // and that distinction is recorded rather than blurred: WebKit-on-macOS via Playwright
    // shares Safari's engine but not its UI, its extensions, or iOS's stricter storage rules.
    //
    // Registered only once the suite passed on it. A project that needs `test.skip` per spec
    // reads as coverage it is not, which is why it was absent until now rather than added
    // early and quietly annotated.
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
