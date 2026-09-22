import { test as a11yBase } from '@a11y-scout/playwright';
import type { Page } from '@playwright/test';

/**
 * The `test` object for the accessibility suite, and the session helper it needs.
 *
 * `@a11y-scout/playwright` exports its own `test`, extended from Playwright's base with an
 * `a11y` fixture and a worker-scoped accumulator. `apps/nuxeo-ui-e2e/src/fixtures.ts` exports
 * a different `test`, extended with `signedIn`. Two `test` objects cannot be imported into one
 * spec, so this file rebases onto a11y-scout's and re-applies `signedIn`.
 *
 * ## Why `installSession` is copied rather than imported
 *
 * `apps/nuxeo-ui-e2e/src/fixtures.ts` has an identical function, and importing it would mean
 * one definition instead of two. It is copied anyway, and the reason is the point of this
 * folder: `a11y/` is development tooling with an expected end date, and every import reaching
 * out of it is another thing to unpick when it is removed. See `../README.md`.
 *
 * The duplication is safe in the way that matters — it cannot fail quietly. If the session
 * shape in `AuthService` changes, authentication stops working and every `expect` in every
 * spec fails on the first assertion. A silent drift would be unacceptable; a loud one is the
 * price of a folder that deletes cleanly.
 */

/**
 * Where consolidated reports are written, relative to the repository root.
 *
 * Inside this folder rather than a11y-scout's default `./a11y-reports` at the root, so that
 * everything the suite produces disappears with `rm -rf a11y/` and `a11y/.gitignore` is the
 * only ignore rule needed. `run.mjs` always spawns from the root, so the relative path is
 * stable regardless of where the command was typed.
 */
export const REPORT_DIR = 'a11y/reports';

/** Mirrors `STORAGE_KEY` in `apps/nuxeo-ui/src/app/auth/auth.service.ts`. */
const SESSION_KEY = 'agentic_ui_nuxeo_session';
/** Mirrors `SIGNED_OUT_KEY` in the same file. Set by `AuthService.markSignedOut()`. */
const SIGNED_OUT_KEY = 'agentic_ui_signed_out';

function sessionFor(username: string, password: string) {
  return {
    kind: 'basic',
    username,
    basic: Buffer.from(`${username}:${password}`).toString('base64'),
    isAdministrator: username.toLowerCase() === 'administrator',
    groups: [] as string[],
  };
}

/**
 * Put the app's session into a page so it is past the route guard.
 *
 * `addInitScript` rather than `storageState`: Playwright's `storageState` persists cookies and
 * **localStorage** only, and this app keeps its session in `sessionStorage`. A `storageState`
 * fixture would look right, run, and leave every spec signed out — the kind of green that is
 * worse than a red. `addInitScript` runs before page scripts on every navigation in the
 * context, which is what makes it survive the reloads these specs perform.
 *
 * Credentials come from the environment. Never hardcoded, never in a URL.
 */
export async function installSession(page: Page): Promise<void> {
  const username = process.env['NUXEO_USER'] ?? 'Administrator';
  const password = process.env['NUXEO_PASS'] ?? 'Administrator';

  await page.addInitScript(
    ({ key, signedOutKey, value }) => {
      sessionStorage.setItem(key, value);
      sessionStorage.removeItem(signedOutKey);
    },
    {
      key: SESSION_KEY,
      signedOutKey: SIGNED_OUT_KEY,
      value: JSON.stringify(sessionFor(username, password)),
    },
  );
}

/** A page that is already past the route guard. */
export const test = a11yBase.extend<{ signedIn: Page }>({
  signedIn: async ({ page }, use) => {
    await installSession(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
