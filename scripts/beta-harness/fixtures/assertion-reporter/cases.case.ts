import { test, expect } from '@playwright/test';
import { throwFromAnotherFile } from './helper';

/**
 * The failure shapes `assertion-failure-reporter.ts` has to tell apart.
 *
 * Named `*.case.ts`, not `*.spec.ts`, so nothing else in the repository picks them up:
 * `apps/nuxeo-ui-e2e/playwright.config.ts` has `testDir: './src'`, Vitest's workspace globs
 * only `vite.config`/`vitest.config` files, and `spec-typecheck.mjs` looks for `*.spec.ts`.
 * These are meant to fail, and a suite that runs them by accident goes red for no reason.
 *
 * No browser is used: the distinction under test is about where an error came from, not
 * about a page. `assertion-reporter.selftest.mjs` runs this file and asserts the counts.
 */

test('counts: a failing expect in the test body', async () => {
  expect(1 + 1, 'a real assertion failure').toBe(3);
});

test('excluded: throws from a helper in another file', async () => {
  throwFromAnotherFile();
});

test('excluded: rejects on a line the spec wrote, with no expect run', async () => {
  // The shape review identified, and the one the old filename test could not catch: the
  // error location is this spec file, but nothing was asserted. A `page.goto()` timeout
  // under wrong credentials lands here.
  await new Promise((_resolve, reject) => reject(new Error('Timeout 45000ms exceeded.')));
});

test.describe('hook failures', () => {
  test.beforeEach(async () => {
    expect(1, 'an assertion inside beforeEach').toBe(2);
  });

  test('excluded: the assertion that failed was in a hook, so the body never ran', async () => {
    expect(true).toBe(true);
  });
});

test('passes, so it is not in the report at all', async () => {
  expect(true).toBe(true);
});
