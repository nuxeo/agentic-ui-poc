/**
 * Evidence steps for NXSAT-179
 * "Unable to Select Multiple Files – Bulk Actions Not Functional"
 *
 * Run with:
 *   npm run evidence:collect -- NXSAT-179 scripts/collect-evidence/NXSAT-179.mjs
 */

/** @param {import('@playwright/test').Page} page */
export default async function collectEvidence(page, helpers, _outDir) {
  await helpers.login();

  helpers.step('Navigate to Browse');
  await page.goto(`${helpers.baseUrl}/#/browse`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const browsePaths = [
    '/#/browse/default-domain/workspaces',
    '/#/browse/default-domain/UserWorkspaces',
    '/#/browse/default-domain',
  ];

  let rowCheckboxes = page.locator('.browse-table tbody .cell-checkbox mat-checkbox');
  for (const browsePath of browsePaths) {
    if ((await rowCheckboxes.count()) >= 2) break;

    helpers.step(`Try folder path ${browsePath}`);
    await page.goto(`${helpers.baseUrl}${browsePath}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    rowCheckboxes = page.locator('.browse-table tbody .cell-checkbox mat-checkbox');
  }

  if ((await rowCheckboxes.count()) < 2) {
    const folderRows = page.locator('.browse-table tbody tr.browse-row--folder');
    const folderCount = await folderRows.count();
    for (let i = 0; i < folderCount && (await rowCheckboxes.count()) < 2; i++) {
      helpers.step(`Open folder row ${i + 1}`);
      await folderRows.nth(i).click();
      await page.waitForTimeout(2500);
      rowCheckboxes = page.locator('.browse-table tbody .cell-checkbox mat-checkbox');
    }
  }

  await helpers.screenshot('00-browse-page');

  const checkboxCount = await rowCheckboxes.count();

  if (checkboxCount < 2) {
    console.warn(
      '\n⚠️  Fewer than 2 browse rows found — open a folder with multiple files and re-run.\n',
    );
    await helpers.screenshot('01-insufficient-rows');
    return;
  }

  helpers.step('Select first file via row checkbox');
  await rowCheckboxes.nth(0).click();
  await page.waitForTimeout(800);
  await helpers.screenshot('01-one-selected');

  helpers.step('Select second file via row checkbox');
  await rowCheckboxes.nth(1).click();
  await page.waitForTimeout(800);
  await helpers.screenshot('02-two-selected');

  const topbar = page.locator('lib-selection-topbar');
  if (await topbar.isVisible({ timeout: 5000 }).catch(() => false)) {
    helpers.step('Selection topbar visible with bulk actions');
    await helpers.screenshot('03-selection-topbar', topbar);
  } else {
    helpers.step('⚠️  Selection topbar not visible after selecting rows');
    await helpers.screenshot('03-selection-topbar-missing');
  }

  helpers.step('Select all via header checkbox');
  const selectAll = page.locator('.browse-table thead .col-checkbox mat-checkbox').first();
  if (await selectAll.isVisible({ timeout: 3000 }).catch(() => false)) {
    await selectAll.click();
    await page.waitForTimeout(800);
    await helpers.screenshot('04-select-all');
  }

  helpers.step('Switch to card view and select a file');
  const cardViewBtn = page.locator('button[matTooltip="Card view"]');
  if (await cardViewBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await cardViewBtn.click();
    await page.waitForTimeout(1000);
    const cardCheckbox = page.locator('.doc-card .grid-card-checkbox mat-checkbox').first();
    if (await cardCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cardCheckbox.click();
      await page.waitForTimeout(800);
      await helpers.screenshot('05-card-view-selection');
    }
  }
}
