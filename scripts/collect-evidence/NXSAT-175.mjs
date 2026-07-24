/**
 * Evidence steps for NXSAT-175
 * "Incorrect State Mapping & Missing Metadata/Controls for File and Note"
 *
 * Run with:
 *   node scripts/collect-evidence/runner.mjs NXSAT-175 scripts/collect-evidence/NXSAT-175.mjs
 *
 * Set NUXEO_DOC_UID to a File document UID in your local Nuxeo, e.g.:
 *   NUXEO_DOC_UID=<uid> node scripts/collect-evidence/runner.mjs NXSAT-175 …
 *
 * If NUXEO_DOC_UID is not set, the script navigates to the Browse page so you
 * can at least capture the duplicate clipboard and general UI state.
 */

/** @param {import('@playwright/test').Page} page */
export default async function collectEvidence(page, helpers, _outDir) {
  await helpers.login();

  const docUid = process.env['NUXEO_DOC_UID'];

  // ── Browse page (general smoke) ──────────────────────────────────────────
  helpers.step('Navigate to Browse');
  await page.goto(`${helpers.baseUrl}/#/browse`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await helpers.screenshot('00-browse-page');

  if (!docUid) {
    console.warn(
      '\n⚠️  NUXEO_DOC_UID not set — skipping document-specific evidence steps.\n' +
      '   Set it to a File document UID and re-run to capture all 7 fixes.\n',
    );
    return;
  }

  // ── Navigate to the target document ──────────────────────────────────────
  helpers.step(`Navigate to document ${docUid}`);
  await helpers.goToDoc(docUid);

  // Wait for the document detail page to stabilise
  await page.waitForTimeout(3000);
  // Take a screenshot to confirm what's visible (helpful for debugging)
  await helpers.screenshot('00b-doc-detail-loaded');

  // Guard: if we got redirected to login again, bail with a helpful message
  const currentUrl = page.url();
  if (!currentUrl.includes('#/doc')) {
    console.warn(`\n⚠️  Expected doc detail route but got: ${currentUrl}`);
    console.warn('   The Nuxeo session may not be authenticated. Check the 00b screenshot.');
    return;
  }

  // ── FIX 6: More menu matches Web UI (clipboard in menu, not on toolbar) ───
  helpers.step('Fix 6: Open the ⋮ More actions menu — Add to Clipboard in menu');
  const moreBtn = page.locator('button[aria-label="More actions"]').first();
  const moreBtnVisible = await moreBtn.isVisible({ timeout: 5000 }).catch(() => false);
  if (moreBtnVisible) {
    await moreBtn.click();
    await page.waitForTimeout(600);
    await helpers.screenshot('fix6-more-menu-with-clipboard');
    await page.keyboard.press('Escape');
  } else {
    helpers.step('⚠️  More actions button not found — skipping fix6 screenshot');
  }

  // ── Video storyboard (Fix 2b) ─────────────────────────────────────────────
  helpers.step('Fix 2b: Video storyboard thumbnails below player');
  const storyboard = page.locator('.viewer-storyboard');
  if (await storyboard.isVisible({ timeout: 4000 }).catch(() => false)) {
    await storyboard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await helpers.screenshot('fix2b-video-storyboard', storyboard);
  } else {
    await helpers.screenshot('fix2b-video-storyboard-missing');
  }

  // ── Properties panel — State field (Fix 1) ───────────────────────────────
  helpers.step('Fix 1: Properties panel — State row shows lifecycle state, not dc:nature');
  const propertiesPanel = page.locator('aside, .properties-panel, .detail-sidebar').first();
  await helpers.screenshot('fix1-state-field', propertiesPanel);

  // ── Properties panel — Tags (Fix 4) ───────────────────────────────────────
  helpers.step('Fix 4: Tags field — chips inside fill input with dropdown');
  const tagsField = page.locator('.tags-suggestion-field, .tags-readonly').first();
  if (await tagsField.isVisible({ timeout: 4000 }).catch(() => false)) {
    await tagsField.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await helpers.screenshot('fix4-tags-always-visible', tagsField);
  } else {
    await helpers.screenshot('fix4-tags-always-visible');
  }

  // ── Viewer footer — File Controls (Fix 3) beside Download ────────────────
  helpers.step('Fix 3: Viewer footer — Replace / Remove beside Download');
  const viewerFooter = page.locator('.viewer-footer-actions');
  if (await viewerFooter.isVisible({ timeout: 4000 }).catch(() => false)) {
    await viewerFooter.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await helpers.screenshot('fix3-file-controls', viewerFooter);
  } else {
    await helpers.screenshot('fix3-file-controls');
  }

  // ── Properties panel — Nature / Coverage / Subjects (Fix 7) ─────────────
  helpers.step('Fix 7: Nature, Coverage and Subjects rows in Indexing Properties');
  // Scroll the Nature label into view by finding it in the DOM
  const natureLabel = page.locator('.prop-label, span').filter({ hasText: /^Nature$/ }).first();
  const natureVisible = await natureLabel.isVisible({ timeout: 3000 }).catch(() => false);
  if (natureVisible) {
    await natureLabel.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
  } else {
    // Fallback: scroll every scrollable element to the bottom
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach((el) => {
        if (el.scrollHeight > el.clientHeight + 20) {
          el.scrollTop = el.scrollHeight;
        }
      });
    });
    await page.waitForTimeout(400);
  }
  await helpers.screenshot('fix7-nature-coverage-subjects');

  // ── Image/PDF toolbar — Actual Size button not clipped (Fix 5) ───────────
  const toolbar = page.locator('.viewer-toolbar');
  if (await toolbar.isVisible({ timeout: 2000 }).catch(() => false)) {
    helpers.step('Fix 5: Viewer toolbar — Actual Size button fully visible');
    await helpers.screenshot('fix5-toolbar-actual-size', toolbar);
  }

  // ── Full properties panel — final overview ────────────────────────────────
  helpers.step('Final: Full properties panel overview');
  await helpers.screenshot('final-properties-panel-overview', propertiesPanel);
}
