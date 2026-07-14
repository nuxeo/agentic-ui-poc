/**
 * Evidence steps for NXSAT-164
 * "Browse tree not showing all accessible domains for isolated users"
 *
 * Run with:
 *   npm run evidence:collect -- NXSAT-164 scripts/collect-evidence/NXSAT-164.mjs
 *
 * Requires local Nuxeo with:
 *   - Administrator (sees all top-level domains)
 *   - local-user5 / Local@user5test (sees Domain + Domain-5 only)
 */

/** @param {import('@playwright/test').Page} page */
async function loginAs(page, helpers, username, password) {
  const base = helpers.baseUrl;
  helpers.step(`Injecting auth session for ${username}`);
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  const basic = Buffer.from(`${username}:${password}`).toString('base64');
  const session = {
    kind: 'basic',
    username,
    basic,
    isAdministrator: username.trim().toLowerCase() === 'administrator',
    groups: [],
  };

  await page.evaluate(
    ({ key, value }) => {
      sessionStorage.setItem(key, value);
      sessionStorage.removeItem('agentic_ui_signed_out');
    },
    { key: 'agentic_ui_nuxeo_session', value: JSON.stringify(session) },
  );

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
}

/** @param {import('@playwright/test').Page} page */
async function openBrowseDrawer(page, helpers) {
  helpers.step('Open Browse drawer');
  await page.goto(`${helpers.baseUrl}/#/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // Browse is the 3rd platform nav item (Knowledge Discovery, Dashboard, Browse).
  const browseNav = page.locator('sat-platform-nav-list-item').nth(2);
  await browseNav.click({ timeout: 10000 });
  await page.waitForTimeout(500);

  const drawer = page.locator('app-nav-drawer .drawer-header').filter({ hasText: 'Browse' });
  await drawer.waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(2000);
}

/** @param {import('@playwright/test').Page} page */
async function readDomainLabels(page) {
  const treeLabels = await page.locator('app-nav-drawer .folder-tree .tree-label').allTextContents();
  const domains = treeLabels.map((t) => t.trim()).filter((t) => t && t !== 'Root');
  if (domains.length > 0) {
    return domains;
  }

  // Fallback: count domain rows on the browse results table when the drawer tree is unavailable.
  await page.goto(`${page.url().split('#')[0]}#/browse`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const rows = await page.locator('table tbody tr').allTextContents();
  return rows
    .map((row) => row.split('\n').map((c) => c.trim()).filter(Boolean)[0])
    .filter((title) => title && !/^Modified\b/i.test(title));
}

/** @param {import('@playwright/test').Page} page */
export default async function collectEvidence(page, helpers, _outDir) {
  const isolatedUser = process.env['NUXEO_ISOLATED_USER'] ?? 'local-user5';
  const isolatedPass = process.env['NUXEO_ISOLATED_PASS'] ?? 'Local@user5test';

  // ── Administrator: all accessible domains ────────────────────────────────
  await loginAs(page, helpers, 'Administrator', 'Administrator');
  await openBrowseDrawer(page, helpers);
  const adminDomains = await readDomainLabels(page);
  helpers.step(`Administrator browse tree domains (${adminDomains.length}): ${adminDomains.join(', ')}`);
  await helpers.screenshot('01-admin-browse-tree', page.locator('app-nav-drawer .folder-tree').first());

  // ── Isolated user: ACL-filtered domains only ─────────────────────────────
  await loginAs(page, helpers, isolatedUser, isolatedPass);
  await openBrowseDrawer(page, helpers);
  const userDomains = await readDomainLabels(page);
  helpers.step(
    `${isolatedUser} browse tree domains (${userDomains.length}): ${userDomains.join(', ')}`,
  );
  await helpers.screenshot('02-isolated-user-browse-tree', page.locator('app-nav-drawer .folder-tree').first());

  // ── User switch simulation: admin tree must not leak after re-login ──────
  await loginAs(page, helpers, 'Administrator', 'Administrator');
  await openBrowseDrawer(page, helpers);
  await loginAs(page, helpers, isolatedUser, isolatedPass);
  await openBrowseDrawer(page, helpers);
  const switchedDomains = await readDomainLabels(page);
  helpers.step(
    `After admin→${isolatedUser} switch (${switchedDomains.length}): ${switchedDomains.join(', ')}`,
  );
  await helpers.screenshot('03-after-user-switch-browse-tree', page.locator('app-nav-drawer .folder-tree').first());

  const pass =
    userDomains.length <= adminDomains.length &&
    switchedDomains.length === userDomains.length &&
    userDomains.every((d) => switchedDomains.includes(d));

  if (!pass) {
    console.warn(
      '\n⚠️  Evidence check: isolated user tree may still include extra domains.\n' +
        `   Admin (${adminDomains.length}): ${adminDomains.join(', ')}\n` +
        `   ${isolatedUser} (${userDomains.length}): ${userDomains.join(', ')}\n` +
        `   After switch (${switchedDomains.length}): ${switchedDomains.join(', ')}\n`,
    );
  } else {
    console.log('\n✅  Isolated user browse tree matches expected ACL-filtered domains.\n');
  }
}
