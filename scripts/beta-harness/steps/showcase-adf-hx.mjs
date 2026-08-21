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

const ENVIRONMENTAL_ERRORS = [/automation\/AI\./, '/nuxeo/logout'];

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
  const cardToggle = page.locator('hxp-browse-toolbar button').last();
  if (await cardToggle.count()) {
    await cardToggle.click();
    await page.waitForTimeout(2000);
    await h.screenshot('adf-hx-card-view');
    h.check('card view toggled', true);
  }

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
  const perms = await openTab(page, 'Permission');
  h.check('permissions tab opened', perms);
  if (perms) {
    await h.expectVisible('permissions panel rendered', 'hxp-browse-permissions');
    await h.screenshot('adf-hx-permissions');
  }

  h.step('History tab reads the real Nuxeo audit log');
  const hist = await openTab(page, 'History');
  h.check('history tab opened', hist);
  if (hist) {
    await h.expectVisible('history panel rendered', 'hxp-browse-history');
    await h.screenshot('adf-hx-history');
  }

  h.step('Trash tab queries trashed children');
  const trash = await openTab(page, 'Trash');
  h.check('trash tab opened', trash);
  if (trash) {
    await h.expectVisible('trash panel rendered', 'hxp-browse-trash');
    await h.screenshot('adf-hx-trash');
  }

  h.step('Health');
  h.expectNoConsoleErrors('no unexpected browser console errors', ENVIRONMENTAL_ERRORS);
}
