import { defineConfig } from '@playwright/test';

/**
 * Throwaway config for `assertion-reporter.selftest.mjs`. Registers the real reporter —
 * not a copy of it — against `cases.case.ts`, which fails on purpose in four different ways.
 *
 * `testMatch` is overridden because the cases are deliberately not named `*.spec.ts`; see
 * the header of `cases.case.ts`. `retries: 0` so `test.outcome()` is decided by one attempt.
 */
export default defineConfig({
  testDir: __dirname,
  testMatch: ['**/*.case.ts'],
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
