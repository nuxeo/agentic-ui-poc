/**
 * Evidence steps for NXSAT-190
 * "Properties Panel — File Name field is redundant for Note documents"
 *
 * Run with:
 *   NUXEO_DOC_UID=5b3fa9d1-9b2c-418e-a491-39890b9b3800 npm run evidence:collect -- NXSAT-190 scripts/collect-evidence/NXSAT-190.mjs
 *
 * Set NUXEO_FILE_DOC_UID to a File document for comparison (optional).
 */

/** @param {import('@playwright/test').Page} page */
export default async function collectEvidence(page, helpers, _outDir) {
  await helpers.login();

  const noteUid = process.env['NUXEO_DOC_UID'] ?? '5b3fa9d1-9b2c-418e-a491-39890b9b3800';
  const fileUid = process.env['NUXEO_FILE_DOC_UID'];

  // ── Note document: File Name should be hidden ─────────────────────────────
  helpers.step(`Navigate to Note document ${noteUid}`);
  await helpers.goToDoc(noteUid);
  await page.waitForTimeout(3000);

  const indexingSection = page.locator('.indexing-title').filter({ hasText: 'Indexing Properties' });
  if (await indexingSection.isVisible({ timeout: 5000 }).catch(() => false)) {
    await indexingSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
  }

  const fileNameLabel = page.locator('.prop-label').filter({ hasText: /^File Name$/ });
  const fileNameVisible = await fileNameLabel.isVisible({ timeout: 2000 }).catch(() => false);
  if (fileNameVisible) {
    console.warn('⚠️  File Name label is still visible on Note document — fix may not be applied.');
  } else {
    console.log('✓ File Name label is hidden on Note document.');
  }

  await helpers.screenshot('note-indexing-properties-no-file-name');

  const titleLabel = page.locator('.prop-label').filter({ hasText: /^Title$/ }).first();
  if (await titleLabel.isVisible({ timeout: 2000 }).catch(() => false)) {
    await titleLabel.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await helpers.screenshot('note-title-and-format-visible');
  }

  // ── File document: File Name should still appear (optional) ────────────────
  if (fileUid) {
    helpers.step(`Navigate to File document ${fileUid}`);
    await helpers.goToDoc(fileUid);
    await page.waitForTimeout(3000);

    const fileNameOnFile = page.locator('.prop-label').filter({ hasText: /^File Name$/ });
    const visible = await fileNameOnFile.isVisible({ timeout: 3000 }).catch(() => false);
    if (visible) {
      await fileNameOnFile.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      console.log('✓ File Name label is visible on File document.');
    } else {
      console.warn('⚠️  File Name label not found on File document.');
    }
    await helpers.screenshot('file-indexing-properties-with-file-name');
  }
}
