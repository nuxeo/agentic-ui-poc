import { test as a11yBase } from '@a11y-scout/playwright';
import { expect as expectFn, type Page } from '@playwright/test';

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

/**
 * Nuxeo credentials, required rather than defaulted.
 *
 * `.cursor/rules/security.mdc`: no hardcoded credentials, "NEVER use Basic auth with hardcoded
 * fallback defaults", environment only, "with startup validation". This folder previously
 * wrote `?? 'Administrator'`, copying the pattern in `apps/nuxeo-ui-e2e`; that the pattern
 * exists elsewhere is not a defence the rule admits, and review on PR #225 said so.
 *
 * Beyond the rule: against a server that happens to accept `Administrator`, a default silently
 * scans as the wrong identity and the report never mentions it.
 *
 * `env.mjs` holds the same eight lines for the Node-side tooling. One copy per language rather
 * than a cross-language import, which would mean loosening the compiler settings for the whole
 * folder to allow a `.ts` file to import a `.mjs` one.
 */
export function requireNuxeoCredentials(): { username: string; password: string } {
  const username = process.env['NUXEO_USER'];
  const password = process.env['NUXEO_PASS'];

  const missing = [...(username ? [] : ['NUXEO_USER']), ...(password ? [] : ['NUXEO_PASS'])];
  if (missing.length > 0) {
    throw new Error(
      `${missing.join(' and ')} must be set. This folder does not default them: a default ` +
        'would scan as the wrong identity against any server that accepts it, and the report ' +
        'would not say so. Run `npm run a11y:scan -- preflight` for the exact commands.',
    );
  }

  return { username: username as string, password: password as string };
}

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
  const { username, password } = requireNuxeoCredentials();

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

/**
 * Every error-state class the scanned features actually render, collected from their
 * templates rather than invented. There is no shared error component in this application —
 * each feature rolls its own — so this list is the closest thing to one.
 */
const ERROR_STATE_SELECTOR = [
  '.browse-error',
  '.detail-error',
  '.results-error',
  '.task-error',
  '.tab-error',
  '.kd-error',
  '.kd-banner--error',
  '.gd-error',
  '.hxp-poc-error',
  '.cpd-error',
  '.nxql-error',
  '.picker-error',
].join(', ');

/**
 * Assert a surface is worth scanning: rendered, not empty, and not showing an error.
 *
 * ## What this fixes
 *
 * The specs used to assert only that the host component was visible. That is not enough, and
 * this suite documented why itself: `openBrowse()` in `interaction-states.a11y.spec.ts` notes
 * that "an unauthenticated or failed load renders the same component with an error panel,
 * which is visible and would let every scan below report a clean overlay that never opened".
 * The stricter standard existed in this PR and was not applied uniformly — review on PR #225
 * caught the inconsistency.
 *
 * ## What it proves, and what it does not
 *
 * It proves the host rendered, that it has real text rather than an empty shell, and that no
 * **known** error state is visible. It does **not** prove the repository data arrived: a
 * feature that fails silently, with no error class and a plausible empty layout, still passes.
 * Route-specific loaded-state evidence is stronger, and `openBrowse()` uses it where the
 * selector is known — `.browse-row, .doc-card-wrapper`. This is the general check for the
 * surfaces where no such selector has been established, and it is deliberately named for the
 * weaker claim it makes.
 */
export async function expectSurfaceUsable(page: Page, host: string, label: string): Promise<void> {
  await expectFn(
    page.locator(host),
    `${host} must render before ${label} is scanned`,
  ).toBeVisible();

  await expectFn(
    page.locator(`${host} :is(${ERROR_STATE_SELECTOR})`),
    `${label} is showing an error state — scanning it would measure the error, not the surface`,
  ).toHaveCount(0);

  await expectFn
    .poll(async () => (await page.locator(host).innerText()).trim().length, {
      message: `${label} rendered an empty shell, so a clean scan of it would prove nothing`,
    })
    .toBeGreaterThan(0);
}

/** A page that is already past the route guard. */
export const test = a11yBase.extend<{ signedIn: Page }>({
  signedIn: async ({ page }, use) => {
    await installSession(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
