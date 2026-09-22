import { test as base, expect, request, type APIRequestContext, type Page } from '@playwright/test';

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

export const E2E_BASE_URL = process.env['E2E_BASE_URL'] ?? 'http://localhost:4200';

/**
 * Nuxeo credentials from the environment, with **no** fallback.
 *
 * `.cursor/rules/security.mdc`: "NEVER use Basic auth with hardcoded fallback defaults". The
 * two copies of `aRootChild` this replaces each carried `?? 'Administrator'` on both the user
 * and the password, which is a working credential pair compiled into the repository.
 *
 * Throwing is the point. A default that happens to be right on a developer's Docker is a
 * default that is silently wrong everywhere else, and the failure it produces there is an
 * unexplained empty listing rather than "you did not set NUXEO_USER".
 */
function nuxeoCredentials(): { username: string; password: string } {
  const username = process.env['NUXEO_USER'];
  const password = process.env['NUXEO_PASS'];
  if (!username || !password) {
    throw new Error(
      'NUXEO_USER and NUXEO_PASS must both be set to run the e2e API helpers.\n' +
        '  There is deliberately no default: a hardcoded Administrator/Administrator pair is a\n' +
        '  credential in the repository, and one that is wrong on every instance but Docker.',
    );
  }
  return { username, password };
}

/**
 * An authenticated request context against the served app, which proxies `/nuxeo` onward.
 *
 * The `Authorization` header is set **explicitly** rather than left to `httpCredentials`, and
 * that is the difference between this helper working and not. Playwright sends
 * `httpCredentials` in response to a `401` challenge; this Nuxeo answers an unauthenticated
 * query with **HTTP 200, `resultsCount: 0` and no `WWW-Authenticate` header at all**, so no
 * challenge is ever issued, the credentials are never sent, and the query runs as Anonymous.
 *
 * Verified directly: the same NXQL that returns two `WorkspaceRoot`s with a Basic header
 * returns `200` with zero entries without one. Both copies of `aRootChild` relied on
 * `httpCredentials`, so even with a valid predicate they would have found nothing — and
 * "200 with no rows" is exactly the shape that makes a repository-data assertion vacuous.
 */
export function newNuxeoApiContext(): Promise<APIRequestContext> {
  const { username, password } = nuxeoCredentials();
  return request.newContext({
    baseURL: E2E_BASE_URL,
    extraHTTPHeaders: {
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
    },
  });
}

/**
 * A child of `/default-domain` that the browse root lists, discovered from the API.
 *
 * Discovering it rather than hardcoding `'Root'` is the point of the helper, and it was right.
 * The query was not: it asked for `ecm:path = '/default-domain' AND ecm:primaryType =
 * 'WorkspaceRoot'`, and no document can satisfy both — `ecm:path =` is exact match,
 * `/default-domain` is a `Domain`, and every `WorkspaceRoot` sits one level below it at
 * `<domain>/workspaces`. It returned zero rows on every instance, so the helper threw and the
 * five specs calling it errored. `STARTSWITH` is the predicate that expresses "below the
 * domain".
 *
 * The depth is then **checked**, not assumed. `STARTSWITH` would also match a `WorkspaceRoot`
 * nested further down, which the browse root does not list — so the helper would hand back a
 * title that is genuinely in the repository and genuinely not on the page, and the spec would
 * fail pointing at the wrong thing.
 */
export async function aRootChild(api: APIRequestContext): Promise<{ uid: string; title: string }> {
  const response = await api.get('/nuxeo/api/v1/search/lang/NXQL/execute', {
    params: {
      query:
        "SELECT * FROM Document WHERE ecm:path STARTSWITH '/default-domain' " +
        "AND ecm:primaryType = 'WorkspaceRoot'",
      pageSize: 20,
    },
    headers: { 'X-NXproperties': '*' },
  });

  if (!response.ok()) throw new Error(`API query failed: ${response.status()}`);

  const body = await response.json();
  const directChildren = (body.entries ?? []).filter((entry: { path?: string }) =>
    /^\/default-domain\/[^/]+$/.test(entry.path ?? ''),
  );

  if (directChildren.length === 0) {
    throw new Error(
      `No WorkspaceRoot directly under /default-domain (the query matched ` +
        `${(body.entries ?? []).length} document(s) at other depths). A stock Nuxeo has one at ` +
        `/default-domain/workspaces; without it the browse-root specs have no repository data ` +
        `to assert and would pass vacuously.`,
    );
  }

  return {
    uid: directChildren[0].uid,
    title: directChildren[0].title,
  };
}
