import { test as base, expect, type Page } from '@playwright/test';

/**
 * The session shape `AuthService` writes after a successful sign-in.
 *
 * Injected rather than driven through the sign-in UI, for two reasons. Every spec would
 * otherwise re-test the same form, making the sign-in path the slowest and most repeated
 * assertion in the suite; and the real deployment authenticates through SSO, which cannot
 * be driven here at all. The sign-in form has its own spec — `auth.spec.ts` — so the path
 * is covered once, deliberately, instead of incidentally everywhere.
 */
const SESSION_KEY = 'agentic_ui_nuxeo_session';
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

export const test = base.extend<{ signedIn: Page }>({
  /**
   * A page that is already past the route guard.
   *
   * `addInitScript` rather than `storageState`: Playwright's `storageState` persists
   * cookies and **localStorage** only, and this app keeps its session in `sessionStorage`.
   * A `storageState` fixture would look right, run, and leave every spec signed out — the
   * kind of green that is worse than a red. `addInitScript` runs before page scripts on
   * every navigation in the context, which is what makes it survive the reloads these
   * specs perform.
   */
  signedIn: async ({ page }, use) => {
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

    await use(page);
  },
});

export { expect };

/**
 * Assert the app rendered the surface rather than an error or empty state.
 *
 * `toBeVisible` on the feature component alone is not enough: an authentication failure
 * renders the component with no rows, which is visible and proves nothing. So every
 * critical-path spec asserts a piece of **repository data**, which can only be there if the
 * XHR was authenticated and Nuxeo answered.
 */
export async function expectSurfaceWithData(page: Page, selector: string, text: string | RegExp) {
  const host = page.locator(selector);
  await expect(host, `${selector} should render`).toBeVisible();
  await expect(host, `${selector} should show repository data, not an empty state`).toContainText(
    text,
  );
}
