/**
 * Evidence steps for NXSAT-193
 * Rich Text Editor toolbar for HTML Note documents
 *
 * Run with:
 *   NUXEO_DOC_UID=<html-note-uid> npm run evidence:collect -- NXSAT-193 scripts/collect-evidence/NXSAT-193.mjs
 */

/** @param {import('@playwright/test').Page} page */
export default async function collectEvidence(page, helpers, _outDir) {
  await helpers.login();

  const noteUid = process.env['NUXEO_DOC_UID'];
  if (!noteUid) {
    console.warn(
      '\n⚠️  NUXEO_DOC_UID not set — skipping document-specific evidence steps.\n' +
        '   Set it to an HTML Note document UID and re-run.\n',
    );
    return;
  }

  helpers.step(`Navigate to HTML Note ${noteUid}`);
  await helpers.goToDoc(noteUid);
  await page.waitForTimeout(2500);

  const toolbar = page.locator('.note-quill-toolbar');
  await toolbar.waitFor({ state: 'visible', timeout: 15000 });
  await helpers.screenshot('01-note-rte-toolbar');

  helpers.step('Apply bold formatting');
  await toolbar.locator('.ql-bold').click();
  await page.keyboard.type('Bold text ');
  await helpers.screenshot('02-bold-applied');

  helpers.step('Open video embed prompt at cursor');
  await page.locator('.note-quill-editor .ql-editor').click();
  await page.keyboard.press('Enter');
  await toolbar.locator('.ql-video').click();
  await page.waitForTimeout(600);
  const videoTooltip = page.locator('.ql-tooltip[data-mode="video"]');
  if (await videoTooltip.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('✓ Video embed prompt visible.');
    await helpers.screenshot('03-video-embed-at-cursor');
  } else {
    console.warn('⚠️  Video embed prompt not visible.');
  }

  helpers.step('Toggle HTML source view');
  await page.locator('.source-toggle').click();
  await page.waitForTimeout(500);
  await helpers.screenshot('04-html-source-mode');

  helpers.step('Return to visual editor');
  await page.locator('.source-toggle').click();
  await page.waitForTimeout(800);
  await helpers.screenshot('05-visual-editor-restored');

  helpers.step('Open insert-from-documents picker');
  await toolbar.locator('.note-quill-image-from-docs').click();
  const picker = page.locator('.note-image-picker-dialog, [role="dialog"]');
  if (await picker.first().isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('✓ Image picker dialog opened.');
    await helpers.screenshot('06-image-picker-dialog');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  } else {
    console.warn('⚠️  Image picker dialog did not open.');
  }

  console.log('✓ NXSAT-193 toolbar evidence capture complete.');
}
