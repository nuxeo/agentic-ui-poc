import { expect, expectSurfaceWithData, test } from './fixtures';
import { request, type APIRequestContext } from '@playwright/test';

/**
 * Document detail — metadata, permissions and the tab surfaces.
 *
 * The document is **discovered** through the app's own proxy rather than hardcoded. A
 * pinned UID makes the spec pass on one machine and fail on every other, and the failure
 * reads as a product defect rather than a fixture problem. Discovery also exercises the
 * proxy and Basic auth before the UI is involved, so an auth failure is attributed to the
 * right place.
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

async function aDocument(): Promise<{ uid: string; title: string }> {
  const response = await api.get('/nuxeo/api/v1/search/lang/NXQL/execute', {
    params: {
      query: "SELECT * FROM Document WHERE ecm:primaryType = 'File' AND ecm:isTrashed = 0",
      pageSize: 1,
    },
    headers: { 'X-NXproperties': '*' },
  });
  expect(response.status(), 'the proxy should answer an authenticated NXQL query').toBe(200);

  const body = await response.json();
  const entry = body.entries?.[0];
  // A failure here is a fixture problem, not a product one, and the message says so.
  expect(
    entry?.uid,
    'no File document exists in this Nuxeo, so document-detail cannot be exercised — ' +
      'import one, or this spec asserts nothing',
  ).toBeTruthy();
  return { uid: entry.uid, title: entry.title };
}

test.describe('document detail', () => {
  test('opens a document and shows its metadata', async ({ signedIn: page }) => {
    const doc = await aDocument();
    await page.goto(`/#/doc/${doc.uid}`, { waitUntil: 'networkidle' });

    // The document's own title, so this cannot pass on a shell that rendered without data.
    await expectSurfaceWithData(page, 'lib-document-detail', doc.title);
    // The repository path, which only the detail fetch supplies.
    await expect(page.locator('lib-document-detail')).toContainText('default-domain');
  });

  test('exposes the tab surfaces the Beta scope covers', async ({ signedIn: page }) => {
    const doc = await aDocument();
    await page.goto(`/#/doc/${doc.uid}`, { waitUntil: 'networkidle' });

    const host = page.locator('lib-document-detail');
    await expect(host).toBeVisible();
    // Named individually: Permissions, History and Publishing are all in the Beta slice,
    // and a tab quietly disappearing is exactly the regression this suite exists to catch.
    for (const tab of ['Permissions', 'History', 'Publishing']) {
      await expect(host, `the ${tab} tab should be present`).toContainText(tab);
    }
  });

  test('an unknown document id does not render a document', async ({ signedIn: page }) => {
    // The negative path. A detail page that renders something for any id is not fetching.
    await page.goto('/#/doc/00000000-0000-0000-0000-000000000000', {
      waitUntil: 'networkidle',
    });

    await expect(page.locator('app-shell')).toBeVisible();
    await expect(page.locator('lib-document-detail')).not.toContainText('default-domain');
  });
});
