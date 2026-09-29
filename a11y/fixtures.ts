import { test as a11yBase } from '@a11y-scout/playwright';
import { expect as expectFn, type Page } from '@playwright/test';
// One definition of each of these, shared with the Node-side diagnostics rather than copied.
// `allowJs` in tsconfig.json exists for these two imports; the alternative was a TypeScript
// copy and a `.mjs` copy of the same list and the same eight-line credential check, which is
// exactly the drift this folder keeps being reviewed for.
import { requireNuxeoCredentials } from './env.mjs';
import { ERROR_STATE_SELECTOR } from './surface.mjs';

export { requireNuxeoCredentials };

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
  // `.first()` for the same reason `surface.mjs` uses it: a host selector that matches more
  // than once is a strict-mode violation, which fails for a reason unrelated to the surface.
  await expectFn(
    page.locator(host).first(),
    `${host} must render before ${label} is scanned`,
  ).toBeVisible();

  await expectFn(
    page.locator(`${host} :is(${ERROR_STATE_SELECTOR})`),
    `${label} is showing an error state — scanning it would measure the error, not the surface`,
  ).toHaveCount(0);

  // The read is wrapped because a poll is allowed to be too early, and this one was: on the
  // dashboard it raced a navigation and threw "Execution context was destroyed", failing the
  // test rather than retrying. A throw inside `expect.poll` is a failure, not a retry, so any
  // transient page state has to be turned into a falsy value the poll can try again on.
  await expectFn
    .poll(
      async () => {
        try {
          return (await page.locator(host).first().innerText()).trim().length;
        } catch {
          return 0;
        }
      },
      { message: `${label} rendered an empty shell, so a clean scan of it would prove nothing` },
    )
    .toBeGreaterThan(0);
}

/**
 * The line every report summary must print about the AI content-quality checks.
 *
 * `provider: haip` is not evidence that they ran, and this was measured rather than imagined:
 * on 2026-09-22 the provider reported READY, the cost meter billed 15 calls, and every
 * content-quality call returned 403 — `aiGenerated` stayed 0 while the header read like a
 * successful AI run. Zero means eleven WCAG criteria (1.1.1, 1.3.3, 2.4.2, 2.4.4, 2.5.3,
 * 3.3.1, 3.3.2 at A; 1.3.5, 2.4.6, 3.1.2, 3.3.3 at AA) were **not measured**, which is not
 * the same as clean.
 *
 * Shared rather than written per suite, because it was written for `journey` alone and the
 * other three kept printing a provider name with no way to tell whether it produced anything.
 */
export function aiFindingsNote(state: {
  findings: ReadonlyArray<{ aiGenerated?: boolean }>;
  meta: { llmProvider: string; llmMockMode: boolean };
}): string {
  const count = state.findings.filter((f) => f.aiGenerated).length;
  if (count > 0) return `${count} (provider ${state.meta.llmProvider})`;
  const why = state.meta.llmMockMode
    ? 'mock mode — no key'
    : `provider ${state.meta.llmProvider} selected but produced nothing; check stderr for LLM errors`;
  return `0 — the 11 AI-judged criteria are UNMEASURED, not clean (${why})`;
}

/** A page that is already past the route guard. */
export const test = a11yBase.extend<{ signedIn: Page }>({
  signedIn: async ({ page }, use) => {
    await installSession(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
