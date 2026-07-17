/**
 * Evidence for NXSAT-198 — Picture/File create with attachment on Nuxeo Cloud.
 *
 * Validates blob attach when properties GET omits file:content (HEAD @blob fallback).
 *
 * Local UI + beta APIs:
 *   npx nx serve nuxeo-ui --proxy-config apps/nuxeo-ui/proxy.conf.beta.json --port 4201
 *   $env:APP_URL="http://localhost:4201"
 *   $env:NUXEO_USER="satori-admin"; $env:NUXEO_PASS="<pass>"
 *   npm run evidence:collect -- NXSAT-198 scripts/collect-evidence/NXSAT-198.mjs
 */

/** @param {import('@playwright/test').Page} page */
export default async function collectEvidence(page, helpers, _outDir) {
  await helpers.login();

  const browsePath = '/#/browse/default-domain/workspaces/Sample%20Workspace';
  helpers.step('Open Sample Workspace');
  await page.goto(`${helpers.baseUrl}${browsePath}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await helpers.screenshot('01-browse-workspace');

  const apiCalls = [];
  page.on('response', (response) => {
    const url = response.url();
    if (
      url.includes('@emptyWithDefault') ||
      url.includes('/upload') ||
      url.includes('@blob/file:content') ||
      (url.includes('/path/') && response.request().method() === 'POST')
    ) {
      apiCalls.push({
        status: response.status(),
        method: response.request().method(),
        url: url.replace(/.*\/nuxeo/, '/nuxeo').slice(0, 140),
      });
    }
  });

  async function createWithAttachment(docType, titlePrefix, shotPrefix) {
    helpers.step(`Create ${docType} with attachment`);
    await page.goto(`${helpers.baseUrl}${browsePath}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const createImport = page.getByRole('button', { name: /Create\s*\/\s*Import/i });
    await createImport.click();
    await page.waitForTimeout(2000);

    const dialog = page.locator('lib-create-import-dialog');
    await dialog.getByRole('tab', { name: 'Create' }).click().catch(() => {});
    await page.waitForFunction(
      () => document.querySelectorAll('lib-create-import-dialog .doctype-tile').length > 0,
      { timeout: 15000 },
    );

    const typeBtn = dialog.locator('.doctype-grid button.doctype-tile').filter({ hasText: docType });
    await typeBtn.first().click();
    await page.waitForTimeout(1500);
    await helpers.screenshot(`${shotPrefix}-01-form`, dialog);

    const title = `${titlePrefix} ${Date.now()}`;
    const titleInput = dialog.getByLabel(/^Title$/i);
    if (await titleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await titleInput.fill(title);
    }

    await dialog.locator('input[type="file"]').first().setInputFiles({
      name: `${shotPrefix}.png`,
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64',
      ),
    });
    await page.waitForTimeout(6000);
    await helpers.screenshot(`${shotPrefix}-02-file-staged`, dialog);

    const apiBefore = apiCalls.length;
    await dialog.getByRole('button', { name: /^Create$/i }).click();
    await page.waitForTimeout(12000);

    const recent = apiCalls.slice(apiBefore);
    const emptyDefault = recent.some((c) => c.url.includes('@emptyWithDefault'));
    const createPost = recent.find((c) => c.method === 'POST' && c.url.includes('/path/'));
    const blobHead = recent.find(
      (c) => c.method === 'HEAD' && c.url.includes('@blob/file:content'),
    );
    helpers.step(
      `${docType} API: emptyWithDefault=${emptyDefault}, create=${createPost?.status ?? 'missing'}, blobHead=${blobHead?.status ?? 'none'}`,
    );

    const errorText = await dialog.locator('.error-text').textContent().catch(() => '');
    const dialogOpen = await dialog.isVisible({ timeout: 1500 }).catch(() => false);

    if (errorText?.trim()) {
      console.warn(`\n⚠️  ${docType} FAILED: ${errorText.trim()}\n`);
      await helpers.screenshot(`${shotPrefix}-03-FAIL`, dialog);
      return false;
    }
    if (dialogOpen) {
      console.warn(`\n⚠️  ${docType}: dialog still open after create\n`);
      await helpers.screenshot(`${shotPrefix}-03-dialog-open`, dialog);
      return false;
    }

    await helpers.screenshot(`${shotPrefix}-03-success`);
    helpers.step(`${docType} OK: "${title}" created`);
    return true;
  }

  const pictureOk = await createWithAttachment('Picture', 'NXSAT-198 Picture', '02-picture');
  const fileOk = await createWithAttachment('File', 'NXSAT-198 File', '03-file');

  helpers.step('API summary');
  console.log(apiCalls.slice(-12));

  if (!pictureOk || !fileOk) {
    throw new Error(`NXSAT-198 evidence incomplete (Picture=${pictureOk}, File=${fileOk})`);
  }

  await helpers.screenshot('04-final-success');
}
