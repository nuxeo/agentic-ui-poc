import { test, expect } from '@playwright/test';
import { throwFromAnotherFile } from './helper';

/**
 * The failure shapes `assertion-failure-reporter.ts` has to tell apart.
 *
 * ## Why this file must be named `*.spec.ts`
 *
 * It used to be `cases.case.ts`, to keep other tooling from picking up a file that fails on
 * purpose. That name quietly disarmed the self-test, and review caught it: the classifier
 * being guarded against admitted a failure when `errorLocation.file` ended in `*.spec.ts`,
 * so against a `*.case.ts` fixture it admitted **nothing**. Restoring the old rule took the
 * counted total to 0, not to 3, and a mutation that lands on zero cannot distinguish "the
 * old rule over-counts" from "the fixture is invisible to it". The one claim the self-test
 * exists to make was the one claim it could not make.
 *
 * So the name is part of the fixture. The old rule now sees these cases exactly as it saw
 * the real suite, and `assertion-reporter.selftest.mjs` documents the mutation that proves
 * it: restore the filename rule and the count goes 1 -> 3.
 *
 * ## Why that is safe here
 *
 * Nothing else reaches `scripts/`. `apps/nuxeo-ui-e2e/playwright.config.ts` has
 * `testDir: './src'`; Vitest's workspace globs only `vite.config`/`vitest.config` files;
 * `spec-typecheck.mjs` discovers `tsconfig.spec.json` under `apps/` and `libs/` only; and
 * `review-guardrails.mjs` walks `apps` and `libs`. The fixture config beside this file
 * matches it by exact name rather than by extension, so a future `*.spec.ts` dropped in this
 * directory does not silently join the run.
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
