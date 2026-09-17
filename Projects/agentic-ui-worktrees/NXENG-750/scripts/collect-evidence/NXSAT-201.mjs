/**
 * Evidence steps for NXSAT-201
 * "Custom Vocabulary Values Not Available During Document Metadata Assignment
 *  and Label Updates Not Reflected"
 *
 * Run with:
 *   npm run evidence:collect -- NXSAT-201 scripts/collect-evidence/NXSAT-201.mjs
 */

/** @param {import('@playwright/test').Page} page */
export default async function collectEvidence(page, helpers, _outDir) {
  await helpers.login();

  helpers.step('Navigate to Administration → Vocabularies');
  await page.goto(`${helpers.baseUrl}/#/administration/vocabularies`, {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(2000);
  await helpers.screenshot('01-vocabularies-page');

  helpers.step('Select country vocabulary (Web UI reference)');
  const vocabSelect = page.locator('mat-select').first();
  if (await vocabSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
    await vocabSelect.click();
    await page.waitForTimeout(500);
    const countryOption = page.getByRole('option', { name: 'country', exact: true });
    if (await countryOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await countryOption.click();
      await page.waitForTimeout(1500);
    } else {
      await page.keyboard.press('Escape');
    }
  }
  await helpers.screenshot('02-country-vocabulary-table');

  helpers.step('Verify raw i18n labels in Label column');
  const labelCell = page.locator('td.mat-column-label').first();
  if (await labelCell.isVisible({ timeout: 5000 }).catch(() => false)) {
    await helpers.screenshot('03-raw-label-column', labelCell);
  }

  const editBtn = page.getByRole('button', { name: 'Edit entry' }).first();
  if (await editBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    helpers.step('Open Edit Entry dialog — shows vocabulary name in title');
    await editBtn.click();
    await page.waitForTimeout(800);
    await helpers.screenshot('04-edit-entry-dialog');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.waitForTimeout(500);
  }

  helpers.step('Navigate to Browse and open Create dialog');
  await page.goto(`${helpers.baseUrl}/#/browse`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const createBtn = page
    .getByRole('button', { name: /create|import|new/i })
    .or(page.locator('button[aria-label*="Create"]'))
    .first();
  if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await createBtn.click();
    await page.waitForTimeout(1200);
    await helpers.screenshot('05-create-import-dialog');

    const natureField = page.locator('mat-select').filter({ hasText: /nature/i }).first();
    if (await natureField.isVisible({ timeout: 4000 }).catch(() => false)) {
      helpers.step('Open Nature picker — live vocabulary entries');
      await natureField.click();
      await page.waitForTimeout(800);
      await helpers.screenshot('06-nature-picker-options');
      await page.keyboard.press('Escape');
    }

    await page.keyboard.press('Escape');
  }

  helpers.step('Final overview');
  await helpers.screenshot('07-final-state');
}
