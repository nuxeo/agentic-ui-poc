/**
 * Evidence steps for NXSAT-178
 * "History tab should show audit log to read-only users (Classic Web UI parity)"
 *
 * Run with a read-only user that has Read access to the target document:
 *   NUXEO_USER=user-readonly NUXEO_PASS=<pass> NUXEO_DOC_UID=<uid> \
 *     npm run evidence:collect -- NXSAT-178 scripts/collect-evidence/NXSAT-178.mjs
 */

/** @param {import('@playwright/test').Page} page */
export default async function collectEvidence(page, helpers, _outDir) {
  await helpers.login();

  const docUid = process.env['NUXEO_DOC_UID'];
  if (!docUid) {
    console.warn(
      '\n⚠️  NUXEO_DOC_UID not set — skipping document History tab evidence.\n' +
        '   Set NUXEO_DOC_UID to a document the read-only user can open.\n',
    );
    return;
  }

  helpers.step(`Navigate to document ${docUid}`);
  await helpers.goToDoc(docUid);
  await page.waitForTimeout(2500);
  await helpers.screenshot('00-doc-detail-loaded');

  const currentUrl = page.url();
  if (!currentUrl.includes('#/doc')) {
    console.warn(`\n⚠️  Expected doc detail route but got: ${currentUrl}`);
    return;
  }

  helpers.step('Open History tab');
  const historyTab = page.locator('.mat-mdc-tab').filter({ hasText: /^History$/ }).first();
  const historyTabVisible = await historyTab.isVisible({ timeout: 8000 }).catch(() => false);
  if (!historyTabVisible) {
    console.warn('\n⚠️  History tab not found — capture current page state.');
    await helpers.screenshot('01-history-tab-missing');
    return;
  }

  await historyTab.click();
  await page.waitForTimeout(2500);

  const historyTable = page.locator('.history-table tbody tr');
  const emptyState = page.locator('.history-empty');
  const rowCount = await historyTable.count();
  const emptyVisible = await emptyState.isVisible({ timeout: 2000 }).catch(() => false);

  if (rowCount > 0) {
    helpers.step(`History tab shows ${rowCount} audit entries (expected after fix)`);
    await helpers.screenshot('01-history-tab-with-entries', page.locator('.history-container'));
  } else if (emptyVisible) {
    helpers.step('History tab shows empty state — fix may not be applied or doc has no audit');
    await helpers.screenshot('01-history-tab-empty', page.locator('.history-container'));
  } else {
    helpers.step('History tab still loading or unknown state');
    await helpers.screenshot('01-history-tab-state', page.locator('.history-container'));
  }
}
