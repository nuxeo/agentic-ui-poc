import { defineConfig } from '@playwright/test';

/**
 * Throwaway config for `assertion-reporter.selftest.mjs`. Registers the real reporter —
 * not a copy of it — against `cases.spec.ts`, which fails on purpose in four different ways.
 *
 * `testMatch` names that one file rather than matching an extension. The fixture has to be a
 * `*.spec.ts` for the self-test's mutation to mean anything — see the header of
 * `cases.spec.ts` — and an extension glob would then sweep up any other spec dropped in this
 * directory, which is how a file that fails on purpose ends up in somebody else's run.
 * `retries: 0` so `test.outcome()` is decided by one attempt.
 */
export default defineConfig({
  testDir: __dirname,
  testMatch: ['**/cases.spec.ts'],
  retries: 0,
  workers: 1,
  // Both under `dist/`, which is gitignored: four of these cases fail on purpose and would
  // otherwise leave traces and a report next to the fixtures, ready to be committed.
  outputDir: '../../../../dist/e2e/assertion-reporter-selftest/artifacts',
  reporter: [
    [
      '../../../../apps/nuxeo-ui-e2e/assertion-failure-reporter.ts',
      { outputFile: '../../../../dist/e2e/assertion-reporter-selftest/out.json' },
    ],
  ],
});
