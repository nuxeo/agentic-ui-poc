/**
 * Showcase capture — what adf-hx looks like inside the agentic UI.
 *
 * Not a phase gate. This produces presentation-quality screenshots for the RFC,
 * Confluence and stakeholder walkthroughs, paired with the production browse
 * screen so the two UI stacks can be compared side by side.
 *
 * Run:
 *   npm run beta:evidence -- showcase-adf-hx
 */

/**
 * The last entry is Phase 1's tolerant path working as designed: an
 * unconfigured instance has no configuration document, and the browser logs the
 * 404 regardless of the application handling it. `phase-1-config.mjs` asserts the
 * present and absent cases separately.
 */
const ENVIRONMENTAL_ERRORS = [
  /automation\/AI\./,
  '/nuxeo/logout',
  '/nuxeo/api/v1/path/default-domain/config/agentic-ui',
];

/**
 * Click a tab in the adf-hx tab strip by visible label.
 * @param {import('@playwright/test').Page} page
 * @param {string} label
 */
async function openTab(page, label) {
  const tab = page.locator('hxp-browse-tabs button').filter({ hasText: new RegExp(label, 'i') }).first();
  if ((await tab.count()) === 0) return false;
  await tab.click();
  await page.waitForTimeout(2500);
  return true;
}

/**
 * Open a tab and assert its panel rendered.
 *
 * Both checks are recorded unconditionally. Guarding the panel assertion behind
 * the tab-opened result would let a missing tab record one failure where two
 * expectations went unmet, understating the damage.
 *
 * @param {import('@playwright/test').Page} page
 * @param {ReturnType<import('../helpers.mjs').createHelpers>} h
 * @param {string} label tab label to click
 * @param {string} name human name used in check titles
 * @param {string} panel selector for the panel the tab should render
 */
async function openTabAndAssert(page, h, label, name, panel) {
  const opened = await openTab(page, label);
  h.check(`${name} tab opened`, opened);
  const rendered = await page.locator(panel).first().isVisible().catch(() => false);
  h.check(`${name} panel rendered`, rendered, `${panel} was not visible`);
  if (rendered) {
    await h.screenshot(`adf-hx-${name}`);
  }
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {ReturnType<import('../helpers.mjs').createHelpers>} h
 */
export default async function run(page, h) {
  h.step('Agentic UI — production browse, built on Satori and Angular Material');
  await h.login();
  await h.goTo('/#/browse/default-domain');
  await h.expectVisible('production browse rendered', 'lib-browse');
  await h.expectText('folder content listed', 'lib-browse', 'Workspaces');
  await h.screenshot('agentic-ui-production-browse');

  h.step('adf-hx POC — the same folder through hxp components');
  await h.goTo('/#/browse-adf-hx?path=%2Fdefault-domain');
  await h.expectVisible('POC page rendered', 'lib-browse-adf-hx-poc');
  await h.expectText('same folder, different stack', 'hxp-document-list', 'Workspaces');
  await h.expectText('templates listed too', 'hxp-document-list', 'Templates');
  await h.screenshot('adf-hx-browse-list');

  h.step('adf-hx card view');
  const cardToggle = page.locator('hxp-browse-toolbar button[aria-label="Card view"]');
  h.check('the card-view toggle is present in the toolbar', (await cardToggle.count()) === 1);
  const rowsBefore = await page.locator('hxp-document-list .hxp-browse-table tbody tr').count();
  await cardToggle.click();
  await page.waitForTimeout(2000);
  const rowsAfter = await page.locator('hxp-document-list .hxp-browse-table tbody tr').count();
  const cards = await page.locator('hxp-document-list .hxp-card-grid .hxp-doc-card-wrapper').count();
  h.check(
    'the toggle really switches the list from a table to a card grid',
    rowsBefore > 0 && rowsAfter === 0 && cards === rowsBefore,
    `table rows ${rowsBefore} before / ${rowsAfter} after, ${cards} cards rendered`,
  );
  await h.expectText('the same folder content is still listed', 'hxp-document-list', 'Workspaces');
  await h.screenshot('adf-hx-card-view');

  h.step('adf-hx folder header and toolbar');
  await h.goTo('/#/browse-adf-hx?path=%2Fdefault-domain');
  await h.expectVisible('folder header', 'hxp-folder-header');
  await h.screenshot('adf-hx-folder-header', page.locator('hxp-folder-header'));
  const toolbar = page.locator('hxp-browse-toolbar');
  h.check('toolbar present', (await toolbar.count()) > 0);
  if (await toolbar.count()) {
    await h.screenshot('adf-hx-toolbar', toolbar);
  }

  h.step('adf-hx navigation drawer and folder tree');
  await h.goTo('/#/browse');
  const navEntry = page.locator('a,button').filter({ hasText: /adf-hx/i }).first();
  h.check('platform nav entry present', (await navEntry.count()) > 0);
  await navEntry.click();
  await page.waitForTimeout(3500);
  await h.expectVisible('nav drawer mounted', 'hxp-browse-nav-drawer');
  await h.screenshot('adf-hx-nav-drawer');

  h.step('adf-hx tab strip — View, Permissions, History, Trash');
  await h.expectVisible('tab strip present', 'hxp-browse-tabs');
  await h.screenshot('adf-hx-tabs', page.locator('hxp-browse-tabs'));

  h.step('Permissions tab reads real Nuxeo ACLs');
  await openTabAndAssert(page, h, 'Permission', 'permissions', 'hxp-browse-permissions');

  h.step('History tab reads the real Nuxeo audit log');
  await openTabAndAssert(page, h, 'History', 'history', 'hxp-browse-history');

  h.step('Trash tab queries trashed children');
  await openTabAndAssert(page, h, 'Trash', 'trash', 'hxp-browse-trash');

  h.step('Health');
  h.expectNoConsoleErrors('no unexpected browser console errors', ENVIRONMENTAL_ERRORS);
}
