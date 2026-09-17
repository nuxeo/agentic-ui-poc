/**
 * Evidence steps for NXSAT-199
 * Domain creation from Dashboard Add Content at repository root
 *
 * Run with:
 *   npm run evidence:collect -- NXSAT-199 scripts/collect-evidence/NXSAT-199.mjs
 */

/** @param {import('@playwright/test').Page} page */
export default async function collectEvidence(page, helpers, _outDir) {
  await helpers.login();

  const domainTitle = `NXSAT-199 Domain ${Date.now()}`;

  helpers.step('Open Dashboard');
  await page.goto(`${helpers.baseUrl}/#/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await helpers.screenshot('00-dashboard');

  helpers.step('Open Create / Import from Dashboard (+)');
  const createFab = page.getByRole('button', { name: 'Create or import' });
  if (!(await createFab.isVisible({ timeout: 5000 }).catch(() => false))) {
    console.warn('\n⚠️  Dashboard Create or import button not found.\n');
    return;
  }
  await createFab.click();
  await page.waitForTimeout(1000);

  const dialog = page.locator('lib-create-import-dialog');
  await helpers.screenshot('01-create-dialog-open', dialog);

  helpers.step('Verify location defaults to repository root');
  const locationInput = dialog.locator('.location-input');
  const locationValue = await locationInput.inputValue().catch(() => '');
  if (locationValue !== '/') {
    console.warn(`\n⚠️  Expected location "/" but got "${locationValue}".\n`);
  }
  await helpers.screenshot('02-location-repository-root', dialog);

  helpers.step('Select Domain document type');
  const domainTypeBtn = dialog.locator('.doctype-tile').filter({ hasText: 'Domain' });
  if (!(await domainTypeBtn.first().isVisible({ timeout: 5000 }).catch(() => false))) {
    console.warn('\n⚠️  Domain type not listed — user may lack permission at repository root.\n');
    await helpers.screenshot('02-domain-type-missing', dialog);
    return;
  }
  await domainTypeBtn.first().click();
  await page.waitForTimeout(1200);
  await helpers.screenshot('03-domain-form', dialog);

  helpers.step(`Fill title "${domainTitle}" and create`);
  const titleInput = dialog.locator('mat-form-field').filter({ hasText: 'Title' }).locator('input');
  await titleInput.waitFor({ state: 'visible', timeout: 5000 });
  await titleInput.fill(domainTitle);
  await page.waitForTimeout(500);

  const createBtn = dialog.getByRole('button', { name: 'Create' });
  await createBtn.waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForFunction(
    () => {
      const btn = document.querySelector('lib-create-import-dialog button[color="primary"]');
      return btn instanceof HTMLButtonElement && !btn.disabled;
    },
    { timeout: 10000 },
  );
  await createBtn.click();
  await page.waitForTimeout(3000);

  const errorBanner = dialog.locator('.error-text');
  const hasError = await errorBanner.isVisible({ timeout: 2000 }).catch(() => false);
  if (hasError) {
    const errorText = (await errorBanner.textContent())?.trim() ?? '';
    console.warn(`\n⚠️  Create failed with error: ${errorText}\n`);
    await helpers.screenshot('04-create-failed-error-banner', dialog);
    return;
  }

  const dialogStillOpen = await dialog.isVisible({ timeout: 1500 }).catch(() => false);
  if (dialogStillOpen) {
    await helpers.screenshot('04-create-dialog-still-open', dialog);
  } else {
    await helpers.screenshot('04-create-success-dialog-closed');
  }

  helpers.step('Confirm navigation after successful domain create');
  await page.waitForTimeout(2000);
  await helpers.screenshot('05-after-create-navigation');
}
