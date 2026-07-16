/**
 * Evidence steps for NXSAT-197
 * "Activity tab shows downloaded instead of viewed — audit event label mismatch"
 *
 * Run with a File or Picture document that has file:content:
 *   NUXEO_DOC_UID=<uid> npm run evidence:collect -- NXSAT-197 scripts/collect-evidence/NXSAT-197.mjs
 *
 * Expected after fix:
 * - Opening the document (preview load) → Activity shows "viewed the document"
 * - Explicit download → Activity shows "downloaded the document"
 */

/** @param {import('@playwright/test').Page} page */
export default async function collectEvidence(page, helpers, _outDir) {
  await helpers.login();

  const docUid = process.env['NUXEO_DOC_UID'];
  if (!docUid) {
    console.warn(
      '\n⚠️  NUXEO_DOC_UID not set — skipping document-specific evidence steps.\n' +
        '   Set it to a File/Picture UID with file:content and re-run.\n',
    );
    return;
  }

  helpers.step(`Open document ${docUid} (preview fetch should log clientReason=view)`);
  await helpers.goToDoc(docUid);
  await page.waitForTimeout(4000);
  await helpers.screenshot('01-doc-opened-preview-loading');

  const currentUrl = page.url();
  if (!currentUrl.includes('#/doc')) {
    console.warn(`\n⚠️  Expected doc detail route but got: ${currentUrl}`);
    return;
  }

  helpers.step('Open right panel Activity sub-tab');
  const activityTab = page.getByRole('button', { name: 'Activity', exact: true });
  await activityTab.scrollIntoViewIfNeeded().catch(() => undefined);
  const activityVisible = await activityTab.isVisible({ timeout: 8000 }).catch(() => false);
  if (!activityVisible) {
    console.warn('\n⚠️  Activity sub-tab not found — capture current page.');
    await helpers.screenshot('02-activity-tab-missing');
    return;
  }

  await activityTab.click();
  await page.waitForTimeout(2500);

  const viewedLabel = page.locator('.activity-action').filter({ hasText: /viewed the document/i });
  const downloadedLabel = page.locator('.activity-action').filter({ hasText: /downloaded the document/i });

  if (await viewedLabel.first().isVisible({ timeout: 5000 }).catch(() => false)) {
    helpers.step('Activity shows "viewed the document" after opening doc (fix verified)');
    await helpers.screenshot('02-activity-viewed-label', page.locator('.activity-panel'));
  } else if (await downloadedLabel.first().isVisible({ timeout: 2000 }).catch(() => false)) {
    helpers.step('Activity still shows "downloaded" — fix may not be applied or audit not refreshed');
    await helpers.screenshot('02-activity-still-downloaded', page.locator('.activity-panel'));
  } else {
    helpers.step('Activity panel state (no view/download label matched yet)');
    await helpers.screenshot('02-activity-panel-state', page.locator('.activity-panel'));
  }

  helpers.step('Click explicit Download and re-check Activity');
  const downloadBtn = page.locator('button[aria-label="Download"]').first();
  if (await downloadBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    await downloadBtn.click();
    await page.waitForTimeout(6000);
    // Switch away and back to force Activity reload after audit indexing
    await page.getByRole('button', { name: 'Properties', exact: true }).click();
    await page.waitForTimeout(500);
    await activityTab.click();
    await page.waitForTimeout(2000);

    if (await downloadedLabel.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      helpers.step('Activity shows "downloaded the document" after explicit download');
      await helpers.screenshot('03-activity-downloaded-label', page.locator('.activity-panel'));
    } else {
      helpers.step('Download clicked — capture Activity panel state');
      await helpers.screenshot('03-activity-after-download', page.locator('.activity-panel'));
    }
  } else {
    helpers.step('Download button not found — skipping download step');
    await helpers.screenshot('03-download-button-missing');
  }
}
