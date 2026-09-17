/**
 * Evidence steps for NXSAT-181
 * "Vocabulary – Add, Edit, and Delete Options Not Available"
 *
 * Run with:
 *   npm run evidence:collect -- NXSAT-181 scripts/collect-evidence/NXSAT-181.mjs
 */

/** @param {import('@playwright/test').Page} page */
export default async function collectEvidence(page, helpers, _outDir) {
  await helpers.login();

  helpers.step('Navigate to Administration → Vocabularies');
  await page.goto(`${helpers.baseUrl}/#/administration/vocabularies`, {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(2000);
  await helpers.screenshot('01-vocabularies-page-with-actions');

  helpers.step('Verify Add Entry button is visible');
  const addBtn = page.getByRole('button', { name: '+ Add Entry' });
  await addBtn.waitFor({ state: 'visible', timeout: 8000 });
  await helpers.screenshot('02-add-entry-button');

  helpers.step('Open Add vocabulary entry dialog');
  await addBtn.click();
  await page.waitForTimeout(800);
  await helpers.screenshot('03-add-entry-dialog');

  helpers.step('Close dialog without saving');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForTimeout(500);

  const editBtn = page.getByRole('button', { name: 'Edit entry' }).first();
  const editVisible = await editBtn.isVisible({ timeout: 5000 }).catch(() => false);
  if (editVisible) {
    helpers.step('Open Edit vocabulary entry dialog');
    await editBtn.click();
    await page.waitForTimeout(800);
    await helpers.screenshot('04-edit-entry-dialog');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.waitForTimeout(500);
  }

  const deleteBtn = page.getByRole('button', { name: 'Delete entry' }).first();
  const deleteVisible = await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false);
  if (deleteVisible) {
    helpers.step('Open Delete confirmation dialog');
    await deleteBtn.click();
    await page.waitForTimeout(800);
    await helpers.screenshot('05-delete-confirmation-dialog');
    await page.getByRole('button', { name: 'Cancel' }).click();
  }

  helpers.step('Final vocabularies page overview');
  await helpers.screenshot('06-final-vocabularies-page');
}
