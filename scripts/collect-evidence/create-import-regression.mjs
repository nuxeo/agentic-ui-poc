/**
 * Create / Import regression — all document types + bulk import (NXSAT-198 guard).
 *
 * Validates that non-blob creates and bulk import still work after cloud blob HEAD fallback.
 *
 * Local UI + beta APIs:
 *   npx nx serve nuxeo-ui --proxy-config apps/nuxeo-ui/proxy.conf.beta.json --port 4201
 *   $env:APP_URL="http://localhost:4201"
 *   $env:NUXEO_USER="satori-admin"; $env:NUXEO_PASS="<pass>"
 *   npm run evidence:collect -- create-import-regression scripts/collect-evidence/create-import-regression.mjs
 */

const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const TINY_TXT = Buffer.from('NXSAT-198 regression import file\n', 'utf8');

/** @param {import('@playwright/test').Page} page */
export default async function collectEvidence(page, helpers, _outDir) {
  await helpers.login();

  const browsePath = '/#/browse/default-domain/workspaces/Sample%20Workspace';
  const results = [];

  function record(name, ok, detail = '') {
    results.push({ name, ok, detail });
    const mark = ok ? 'PASS' : 'FAIL';
    helpers.step(`${mark}: ${name}${detail ? ` — ${detail}` : ''}`);
  }

  helpers.step('Open Sample Workspace');
  await page.goto(`${helpers.baseUrl}${browsePath}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await helpers.screenshot('00-browse-workspace');

  async function openCreateDialog() {
    await page.goto(`${helpers.baseUrl}${browsePath}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const createImport = page.getByRole('button', { name: /Create\s*\/\s*Import/i });
    await createImport.click();
    await page.waitForTimeout(1500);
    const dialog = page.locator('lib-create-import-dialog');
    await dialog.getByRole('tab', { name: 'Create' }).click().catch(() => {});
    await page.waitForFunction(
      () => document.querySelectorAll('lib-create-import-dialog .doctype-tile').length > 0,
      { timeout: 15000 },
    );
    return dialog;
  }

  async function selectDocType(dialog, docType) {
    const typeBtn = dialog.locator('.doctype-grid button.doctype-tile').filter({ hasText: docType });
    if ((await typeBtn.count()) === 0) {
      return false;
    }
    await typeBtn.first().click();
    await page.waitForTimeout(1200);
    return true;
  }

  async function fillTitle(dialog, title) {
    const titleInput = dialog.getByLabel(/^Title$/i);
    if (await titleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await titleInput.fill(title);
    }
  }

  async function submitCreate(dialog) {
    await dialog.getByRole('button', { name: /^Create$/i }).click();
    await page.waitForTimeout(10000);
  }

  async function createOutcome(dialog, label) {
    const errorText = (await dialog.locator('.error-text').textContent().catch(() => ''))?.trim() ?? '';
    const dialogOpen = await dialog.isVisible({ timeout: 1500 }).catch(() => false);
    if (errorText) {
      await helpers.screenshot(`${label}-fail`, dialog);
      return { ok: false, detail: errorText };
    }
    if (dialogOpen) {
      await helpers.screenshot(`${label}-dialog-open`, dialog);
      return { ok: false, detail: 'dialog still open' };
    }
    await helpers.screenshot(`${label}-success`);
    return { ok: true, detail: '' };
  }

  async function createSimpleType(docType, shotPrefix) {
    helpers.step(`Create ${docType} (no blob)`);
    const dialog = await openCreateDialog();
    const available = await selectDocType(dialog, docType);
    if (!available) {
      record(`${docType} create`, false, 'type not listed');
      await page.keyboard.press('Escape');
      return;
    }
    await helpers.screenshot(`${shotPrefix}-form`, dialog);
    const title = `Reg ${docType} ${Date.now()}`;
    await fillTitle(dialog, title);
    // Note defaults to HTML format — no need to change Format field.
    await submitCreate(dialog);
    const outcome = await createOutcome(dialog, shotPrefix);
    record(`${docType} create`, outcome.ok, outcome.detail || title);
  }

  async function createWithAttachment(docType, shotPrefix) {
    helpers.step(`Create ${docType} with attachment`);
    const dialog = await openCreateDialog();
    const available = await selectDocType(dialog, docType);
    if (!available) {
      record(`${docType} create + blob`, false, 'type not listed');
      await page.keyboard.press('Escape');
      return;
    }
    await helpers.screenshot(`${shotPrefix}-form`, dialog);
    const title = `Reg ${docType} ${Date.now()}`;
    await fillTitle(dialog, title);
    await dialog.locator('input[type="file"]').first().setInputFiles({
      name: `${shotPrefix}.png`,
      mimeType: 'image/png',
      buffer: TINY_PNG,
    });
    await page.waitForTimeout(6000);
    await helpers.screenshot(`${shotPrefix}-staged`, dialog);
    await submitCreate(dialog);
    const outcome = await createOutcome(dialog, shotPrefix);
    record(`${docType} create + blob`, outcome.ok, outcome.detail || title);
  }

  async function bulkImportWithProperties() {
    helpers.step('Bulk import — Add Properties (2 files)');
    await page.goto(`${helpers.baseUrl}${browsePath}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const createImport = page.getByRole('button', { name: /Create\s*\/\s*Import/i });
    await createImport.click();
    await page.waitForTimeout(1500);
    const dialog = page.locator('lib-create-import-dialog');
    await dialog.getByRole('tab', { name: 'Import' }).click();
    await page.waitForTimeout(800);

    const fileInput = dialog.locator('input[type="file"]').first();
    await fileInput.setInputFiles([
      { name: 'reg-bulk-a.png', mimeType: 'image/png', buffer: TINY_PNG },
      { name: 'reg-bulk-b.txt', mimeType: 'text/plain', buffer: TINY_TXT },
    ]);
    await page.waitForTimeout(2000);
    await helpers.screenshot('bulk-01-staged', dialog);

    await dialog.getByRole('button', { name: 'Add Properties' }).click();
    await page.waitForTimeout(1500);
    await helpers.screenshot('bulk-02-properties', dialog);

    const titleA = `Reg Bulk A ${Date.now()}`;
    await fillTitle(dialog, titleA);
    await dialog.getByRole('button', { name: 'Edit Next' }).click();
    await page.waitForTimeout(800);
    const titleB = `Reg Bulk B ${Date.now()}`;
    await fillTitle(dialog, titleB);
    await page.waitForTimeout(500);
    await helpers.screenshot('bulk-03-second-file', dialog);

    await dialog.getByRole('button', { name: /^Create$/i }).click();
    await page.waitForTimeout(20000);

    const errorText =
      (await dialog.locator('.error-text').textContent().catch(() => ''))?.trim() ??
      (await dialog.locator('.import-error').textContent().catch(() => ''))?.trim() ??
      '';
    const dialogOpen = await dialog.isVisible({ timeout: 1500 }).catch(() => false);
    if (errorText) {
      await helpers.screenshot('bulk-fail', dialog);
      record('Bulk import (Add Properties)', false, errorText);
      return;
    }
    if (dialogOpen) {
      await helpers.screenshot('bulk-dialog-open', dialog);
      record('Bulk import (Add Properties)', false, 'dialog still open');
      return;
    }
    await helpers.screenshot('bulk-success');
    record('Bulk import (Add Properties)', true, `${titleA}, ${titleB}`);
  }

  async function csvImportFolderNote() {
    helpers.step('CSV import — Folder + Note rows');
    await page.goto(`${helpers.baseUrl}${browsePath}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const createImport = page.getByRole('button', { name: /Create\s*\/\s*Import/i });
    await createImport.click();
    await page.waitForTimeout(1500);
    const dialog = page.locator('lib-create-import-dialog');
    await dialog.getByRole('tab', { name: 'CSV' }).click();
    await page.waitForTimeout(800);

    const stamp = Date.now();
    const csv = [
      'name,type,dc:title',
      `reg-csv-folder-${stamp},Folder,Reg CSV Folder ${stamp}`,
      `reg-csv-folder-${stamp}/reg-csv-note-${stamp},Note,Reg CSV Note ${stamp}`,
    ].join('\n');

    await dialog.locator('input[type="file"]').first().setInputFiles({
      name: 'regression-import.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csv, 'utf8'),
    });
    await page.waitForTimeout(1000);
    await helpers.screenshot('csv-01-staged', dialog);

    await dialog.getByRole('button', { name: /^Import$/i }).click();
    await page.waitForTimeout(15000);

    const errorText = (await dialog.locator('.error-text').textContent().catch(() => ''))?.trim() ?? '';
    const importError =
      (await dialog.locator('.import-error').textContent().catch(() => ''))?.trim() ?? '';
    const combined = errorText || importError;
    const dialogOpen = await dialog.isVisible({ timeout: 1500 }).catch(() => false);

    if (combined && /csv addon|not available/i.test(combined)) {
      await helpers.screenshot('csv-skipped', dialog);
      record('CSV import (Folder + Note)', true, 'skipped — CSV addon not on server');
      await page.keyboard.press('Escape').catch(() => {});
      return;
    }
    if (combined && !/imported|created|success/i.test(combined)) {
      await helpers.screenshot('csv-fail', dialog);
      record('CSV import (Folder + Note)', false, combined.slice(0, 120));
      return;
    }
    if (dialogOpen && combined) {
      await helpers.screenshot('csv-dialog', dialog);
    }
    await helpers.screenshot('csv-done');
    record('CSV import (Folder + Note)', true, `folder reg-csv-folder-${stamp}`);
  }

  // Non-blob creates (unaffected by blob HEAD fallback)
  await createSimpleType('Folder', '01-folder');
  await createSimpleType('Ordered Folder', '02-ordered-folder');
  await createSimpleType('Note', '03-note');

  // Blob-holding creates (uses withMainBlobValidation + HEAD fallback on cloud)
  await createWithAttachment('File', '04-file');
  await createWithAttachment('Picture', '05-picture');

  // Bulk flows
  await bulkImportWithProperties();
  await csvImportFolderNote();

  helpers.step('Regression summary');
  const failed = results.filter((r) => !r.ok);
  console.log('\n--- Results ---');
  for (const r of results) {
    console.log(`  ${r.ok ? '✓' : '✗'} ${r.name}${r.detail ? `: ${r.detail}` : ''}`);
  }
  console.log(`--- ${results.length - failed.length}/${results.length} passed ---\n`);

  if (failed.length > 0) {
    throw new Error(
      `Create/import regression failed: ${failed.map((f) => f.name).join(', ')}`,
    );
  }

  await helpers.screenshot('99-all-pass');
}
