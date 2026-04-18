import { Page } from '@playwright/test';

const STORAGE_KEY = 'agentic_ui_nuxeo_session';

const ADMIN_SESSION = {
  kind: 'basic',
  username: 'Administrator',
  basic: btoa('Administrator:Administrator'),
  isAdministrator: true,
};

const ME_RESPONSE = {
  'entity-type': 'user',
  id: 'Administrator',
  isAdministrator: true,
  properties: {
    username: 'Administrator',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    isAdministrator: true,
  },
};

/**
 * Seeds an admin session into localStorage and mocks API endpoints.
 *
 * Route order matters in Playwright — last registered wins. We register
 * the generic catch-all FIRST, then specific overrides AFTER so they
 * take priority.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.addInitScript(
    ({ key, session }) => {
      localStorage.setItem(key, JSON.stringify(session));
    },
    { key: STORAGE_KEY, session: ADMIN_SESSION },
  );

  // 1. Generic catch-all (registered first = lowest priority)
  await page.route('**/nuxeo/api/v1/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ entries: [] }),
    }),
  );

  // 2. /me endpoint (registered after = higher priority)
  await page.route('**/nuxeo/api/v1/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(ME_RESPONSE),
    }),
  );

  // 3. Config/schema API → 404 so fallback fields kick in (highest priority)
  await page.route('**/nuxeo/api/v1/config/**', (route) =>
    route.fulfill({ status: 404, body: 'Not Found' }),
  );

  // 4. Studio layout fetch → 404 (highest priority for this path)
  await page.route('**/nuxeo/site/api/**', (route) =>
    route.fulfill({ status: 404, body: 'Not Found' }),
  );
}

/**
 * Clears localStorage keys used by the Studio Designer POC
 * so each test starts fresh.
 */
export async function clearDesignerStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.removeItem('nx-studio-actions');
    localStorage.removeItem('nx-studio-layouts');
  });
}
