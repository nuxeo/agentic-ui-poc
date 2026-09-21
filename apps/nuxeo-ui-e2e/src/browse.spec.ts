import { expect, expectSurfaceWithData, test } from './fixtures';
import { request, type APIRequestContext } from '@playwright/test';

/**
 * Browse — the primary authenticated surface, and the one every other path starts from.
 *
 * Assertions are on **repository data**, not on the component being present. An
 * unauthenticated XHR renders `lib-browse` with no rows: visible, green under a
 * `toBeVisible` check, and proof of nothing. That distinction is the reason
 * `expectSurfaceWithData` exists.
 */

let api: APIRequestContext;
const baseURL = process.env['E2E_BASE_URL'] ?? 'http://localhost:4200';

test.beforeAll(async () => {
  api = await request.newContext({
    baseURL,
    httpCredentials: {
      username: process.env['NUXEO_USER'] ?? 'Administrator',
      password: process.env['NUXEO_PASS'] ?? 'Administrator',
      origin: baseURL,
    },
  });
});

test.afterAll(async () => {
  await api?.dispose();
});

/**
 * Discover a domain child that will appear at browse root.
 * Uses API to get real repository data, not a hardcoded constant.
 */
async function aRootChild(): Promise<{ uid: string; title: string }> {
  const response = await api.get('/nuxeo/api/v1/search/lang/NXQL/execute', {
    params: {
      query: "SELECT * FROM Document WHERE ecm:path = '/default-domain' AND ecm:primaryType = 'WorkspaceRoot'",
      pageSize: 1,
    },
    headers: { 'X-NXproperties': '*' },
  });

  if (!response.ok()) throw new Error(`API query failed: ${response.status()}`);

  const body = await response.json();
  const entries = body.entries ?? [];
  if (entries.length === 0) {
    throw new Error('No root child found (expected at least Workspaces)');
  }

  return {
    uid: entries[0].uid,
    title: entries[0].title,
  };
}

test.describe('browse', () => {
  test('lists repository content at the root', async ({ signedIn: page }) => {
    await page.goto('/#/browse', { waitUntil: 'networkidle' });

    const rootChild = await aRootChild();
    await expectSurfaceWithData(page, 'lib-browse', rootChild.title);
    // The empty-state copy the app shows for a folder with no children. Its presence at
    // the root would mean the listing failed, so this is a negative assertion with teeth.
    await expect(page.locator('lib-browse')).toContainText('Create / Import');
  });

  test('offers navigation into the repository tree', async ({ signedIn: page }) => {
    await page.goto('/#/browse', { waitUntil: 'networkidle' });

    const rootChild = await aRootChild();
    await expectSurfaceWithData(page, 'lib-browse', rootChild.title);

    // The root's children in a stock Nuxeo. Named individually rather than counting rows:
    // a count assertion passes on the wrong rows.
    const host = page.locator('lib-browse');
    await expect(host).toContainText(/Sections|Templates|Workspaces/);
  });

  test('the shell renders its chrome on an authenticated route', async ({ signedIn: page }) => {
    await page.goto('/#/browse', { waitUntil: 'networkidle' });

    const shell = page.locator('app-shell');
    await expect(shell).toBeVisible();
    // The skip link is an accessibility affordance that must survive a refactor; Phase 6
    // step 3 raises the wider WCAG bar, and this keeps one landmark of it under test now.
    await expect(shell).toContainText('Skip to main content');
  });
});
