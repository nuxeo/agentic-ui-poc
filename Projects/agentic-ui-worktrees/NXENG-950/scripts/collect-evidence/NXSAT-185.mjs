/**
 * Evidence steps for NXSAT-185
 * Bulk import with properties (Web UI parity) + bulk delete confirmation fix
 *
 * Run with:
 *   npm run evidence:collect -- NXSAT-185 scripts/collect-evidence/NXSAT-185.mjs
 */

import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, 'fixtures');
const importFiles = [
  resolve(fixturesDir, 'evidence-import-a.png'),
  resolve(fixturesDir, 'evidence-import-b.png'),
  resolve(fixturesDir, 'evidence-import-c.png'),
];

/** @param {import('@playwright/test').Page} page */
export default async function collectEvidence(page, helpers, _outDir) {
  await helpers.login();

  // ── Find a folder with create/import permission ───────────────────────────
  helpers.step('Navigate to Browse and open a workspace folder');
  const browsePaths = [
    '/#/browse/default-domain/workspaces',
    '/#/browse/default-domain/UserWorkspaces',
    '/#/browse/default-domain',
  ];

  let createBtn = page.getByRole('button', { name: 'Create / Import' });
  for (const browsePath of browsePaths) {
    if (await createBtn.isVisible({ timeout: 2000 }).catch(() => false)) break;
    await page.goto(`${helpers.baseUrl}${browsePath}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    createBtn = page.getByRole('button', { name: 'Create / Import' });
  }

  // Drill into first folderish row if Create is disabled at domain level
  if (!(await createBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
    const folderRow = page.locator('.browse-table tbody tr.browse-row--folder').first();
    if (await folderRow.isVisible({ timeout: 3000 }).catch(() => false)) {
      await folderRow.click();
      await page.waitForTimeout(2500);
      createBtn = page.getByRole('button', { name: 'Create / Import' });
    }
  }

  await helpers.screenshot('00-browse-folder');

  if (!(await createBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
    console.warn('\n⚠️  Create / Import not available — open a workspace folder and re-run.\n');
    return;
  }

  // ── Import tab: stage files ───────────────────────────────────────────────
  helpers.step('Open Create / Import dialog and stage three files');
  await createBtn.click();
  await page.waitForTimeout(1000);

  const dialog = page.locator('lib-create-import-dialog');
  await dialog.getByRole('tab', { name: 'Import' }).click();
  await page.waitForTimeout(500);

  const fileInput = dialog.locator('input.dropzone-file-input');
  await fileInput.setInputFiles(importFiles);
  await page.waitForTimeout(1200);
  await helpers.screenshot('01-import-files-staged', dialog);

  // ── Add Properties wizard ─────────────────────────────────────────────────
  helpers.step('Open Add Properties wizard');
  await dialog.getByRole('button', { name: 'Add Properties' }).click();
  await page.waitForTimeout(1500);
  await helpers.screenshot('02-properties-wizard-type-only', dialog);

  helpers.step('Select Picture type to reveal metadata fields (if not already inferred)');
  const typeSelect = dialog.locator('.import-properties-form mat-select').first();
  const typeTrigger = typeSelect.locator('.mat-mdc-select-value-text');
  const currentType = (await typeTrigger.textContent().catch(() => ''))?.trim() ?? '';
  if (!currentType || currentType === 'Select a value') {
    await typeSelect.click();
    await page.waitForTimeout(500);
    const pictureOption = page.locator('mat-option').filter({ hasText: /^Picture$/ });
    if (await pictureOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      await pictureOption.click();
    } else {
      await page.locator('mat-option').first().click();
    }
    await page.waitForTimeout(800);
  }
  await helpers.screenshot('03-metadata-fields-visible', dialog);

  helpers.step('Set shared description and apply to all');
  const descriptionInput = dialog.locator('mat-label', { hasText: 'Description' }).locator('..').locator('input');
  if (await descriptionInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await descriptionInput.fill('Shared import description');
  }
  const titleInput = dialog.locator('mat-label', { hasText: 'Title' }).locator('..').locator('input');
  if (await titleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await titleInput.fill('Custom first title');
  }
  await page.waitForTimeout(500);

  const applyToAll = dialog.getByRole('button', { name: 'Apply To All' });
  if (await applyToAll.isEnabled({ timeout: 3000 }).catch(() => false)) {
    await applyToAll.click();
    await page.waitForTimeout(1200);
    await helpers.screenshot('04-apply-to-all-per-file-titles', dialog);
  } else {
    await helpers.screenshot('04-apply-to-all-disabled');
  }

  helpers.step('Cancel closes entire dialog');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForTimeout(800);
  const dialogVisible = await dialog.isVisible({ timeout: 1000 }).catch(() => false);
  if (!dialogVisible) {
    await helpers.screenshot('05-cancel-closed-dialog');
  } else {
    await helpers.screenshot('05-cancel-still-open');
  }

  // ── Bulk delete confirmation (multi-select) ───────────────────────────────
  helpers.step('Bulk delete: select multiple files and open delete confirmation');
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(500);

  let rowCheckboxes = page.locator('.browse-table tbody .cell-checkbox mat-checkbox');
  if ((await rowCheckboxes.count()) < 2) {
    const folderRows = page.locator('.browse-table tbody tr.browse-row--folder');
    if ((await folderRows.count()) > 0) {
      await folderRows.first().click();
      await page.waitForTimeout(2000);
      rowCheckboxes = page.locator('.browse-table tbody .cell-checkbox mat-checkbox');
    }
  }

  if ((await rowCheckboxes.count()) >= 2) {
    await rowCheckboxes.nth(0).click();
    await page.waitForTimeout(600);
    await rowCheckboxes.nth(1).click();
    await page.waitForTimeout(800);
    await helpers.screenshot('06-two-files-selected');

    const deleteBtn = page.locator('lib-selection-topbar button[aria-label="Delete selected"]');
    if (await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await deleteBtn.click();
      await page.waitForTimeout(800);
      const confirmDialog = page.locator('lib-confirm-dialog, h2[mat-dialog-title]');
      await helpers.screenshot('07-bulk-delete-confirmation', confirmDialog);
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(400);
      await page.locator('lib-selection-topbar button', { hasText: 'Clear' }).click().catch(() => {});
    }
  } else {
    console.warn('\n⚠️  Fewer than 2 browse rows for bulk-delete evidence.\n');
    await helpers.screenshot('06-insufficient-rows-for-delete');
  }
}
