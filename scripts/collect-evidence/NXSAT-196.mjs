/**
 * NXSAT-196 — Upload attachment disappears after saving a Note.
 *
 * Intercepts the note PUT response and injects `permissions: []` to simulate
 * the beta Nuxeo behaviour that triggers NXSAT-196.
 *
 * Run:
 *   NUXEO_DOC_UID=<note-uid> node scripts/collect-evidence/runner.mjs NXSAT-196-before scripts/collect-evidence/NXSAT-196.mjs
 *   NUXEO_DOC_UID=<note-uid> node scripts/collect-evidence/runner.mjs NXSAT-196-after  scripts/collect-evidence/NXSAT-196.mjs
 */

/** @param {import('@playwright/test').Page} page @param {string} docUid */
async function installEmptyPermissionsInterceptor(page, docUid) {
  const putPattern = `**/nuxeo/api/v1/id/${docUid}`;
  await page.route(putPattern, async (route) => {
    const request = route.request();
    if (request.method() !== 'PUT') {
      await route.continue();
      return;
    }

    const response = await route.fetch();
    let body;
    try {
      body = await response.json();
    } catch {
      await route.fulfill({ response });
      return;
    }

    body.contextParameters = {
      ...(body.contextParameters ?? {}),
      permissions: [],
    };

    const headers = { ...response.headers() };
    delete headers['content-length'];
    delete headers['content-encoding'];

    await route.fulfill({
      status: response.status(),
      headers,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}

/** @param {import('@playwright/test').Page} page */
export default async function collectEvidence(page, helpers, _outDir) {
  const docUid = process.env['NUXEO_DOC_UID'];
  if (!docUid) {
    console.warn('\n⚠️  Set NUXEO_DOC_UID to a Note document UID and re-run.\n');
    return;
  }

  helpers.step('Install PUT interceptor — simulate empty permissions array from Nuxeo');
  await installEmptyPermissionsInterceptor(page, docUid);

  await helpers.login();

  helpers.step(`Open Note document ${docUid}`);
  await helpers.goToDoc(docUid);
  await page.getByRole('tab', { name: 'View' }).waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(2000);

  helpers.step('Ensure Properties sub-tab is active');
  const propertiesTab = page.locator('.sub-tab').filter({ hasText: 'Properties' }).first();
  if (await propertiesTab.isVisible({ timeout: 5000 }).catch(() => false)) {
    await propertiesTab.click();
    await page.waitForTimeout(600);
  }

  helpers.step('Scroll to Attachments section — before save');
  await scrollToAttachments(page);
  const uploadBefore = page.locator('.upload-attachment-zone .upload-link');
  const uploadVisibleBefore = await uploadBefore.isVisible({ timeout: 5000 }).catch(() => false);
  console.log(`     Upload attachment visible before save: ${uploadVisibleBefore}`);
  await helpers.screenshot('01-before-save-attachments-panel');

  helpers.step('Edit note content');
  const quillEditor = page.locator('.note-quill-editor .ql-editor');
  const plainEditor = page.locator('.note-text-surface, .note-plain-editor').first();
  if (await quillEditor.isVisible({ timeout: 5000 }).catch(() => false)) {
    await quillEditor.click();
    await page.keyboard.press('Control+End');
    await page.keyboard.type(` NXSAT-196 evidence ${Date.now()}`, { delay: 20 });
  } else if (await plainEditor.isVisible({ timeout: 3000 }).catch(() => false)) {
    await plainEditor.click();
    await page.keyboard.type(` NXSAT-196 evidence ${Date.now()}`, { delay: 20 });
  } else {
    console.warn('     Note editor not found — continuing to save if button exists');
  }
  await helpers.screenshot('02-note-edited');

  helpers.step('Save note (PUT response will carry permissions: [])');
  const saveBtn = page.locator('.note-footer').getByRole('button', { name: 'Save' });
  if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await saveBtn.click();
    const snack = page.locator('.mat-mdc-snack-bar-container');
    await snack.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => undefined);
    await page.waitForTimeout(1200);
  } else {
    console.warn('     Save button not visible — note may be read-only');
  }
  await helpers.screenshot('03-after-save-snackbar');

  helpers.step('Scroll to Attachments section — after save');
  await scrollToAttachments(page);
  const uploadAfter = page.locator('.upload-attachment-zone .upload-link');
  const uploadVisibleAfter = await uploadAfter.isVisible({ timeout: 5000 }).catch(() => false);
  console.log(`     Upload attachment visible after save: ${uploadVisibleAfter}`);
  await helpers.screenshot('04-after-save-attachments-panel');

  if (uploadVisibleBefore && !uploadVisibleAfter) {
    console.log('\n❌  BUG REPRODUCED: Upload attachment disappeared after save.\n');
  } else if (uploadVisibleBefore && uploadVisibleAfter) {
    console.log('\n✅  FIX VERIFIED: Upload attachment still visible after save.\n');
  } else if (!uploadVisibleBefore) {
    console.warn('\n⚠️  Upload attachment was not visible before save — check permissions or panel scroll.\n');
  }
}

/** @param {import('@playwright/test').Page} page */
async function scrollToAttachments(page) {
  const attachmentsTitle = page.locator('.section-title').filter({ hasText: 'Attachments' }).first();
  if (await attachmentsTitle.isVisible({ timeout: 8000 }).catch(() => false)) {
    await attachmentsTitle.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    return;
  }
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach((el) => {
      if (el.scrollHeight > el.clientHeight + 20) {
        el.scrollTop = el.scrollHeight;
      }
    });
  });
  await page.waitForTimeout(500);
}
