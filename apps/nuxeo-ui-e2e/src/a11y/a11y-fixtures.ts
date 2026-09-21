import { test as a11yBase } from '@a11y-scout/playwright';
import type { Page } from '@playwright/test';
import { installSession } from '../fixtures';

/**
 * The `test` object for the accessibility suite.
 *
 * `@a11y-scout/playwright` exports its own `test`, extended from Playwright's base with an
 * `a11y` fixture and a worker-scoped accumulator. Our `./fixtures` exports a different
 * `test`, extended with `signedIn`. Two `test` objects cannot be imported into one spec, so
 * this file rebases ours onto theirs and re-applies `signedIn` through the shared
 * `installSession` helper.
 *
 * ## Why the accessibility specs are not simply added to `./fixtures`
 *
 * Rebasing `./fixtures` itself would give every existing spec the `a11y` fixture, and with it
 * a hard dependency on two tarballs that are **not installable from any registry** — they are
 * distributed by hand (see `docs/accessibility-scout.md`). A colleague who has not downloaded them
 * would get `ERR_MODULE_NOT_FOUND` on all thirteen critical-path specs rather than on the
 * accessibility suite alone. The suites are therefore kept on separate configs: `beta:e2e`
 * needs only Playwright, `a11y:surfaces` needs the tarballs too.
 */
export const test = a11yBase.extend<{ signedIn: Page }>({
  signedIn: async ({ page }, use) => {
    await installSession(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
