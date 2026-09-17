/**
 * Evidence steps for NXSAT-184
 * "Comment – Edit and Delete Options Not Available for Replies"
 *
 * Run with:
 *   NUXEO_DOC_UID=<uid> npm run evidence:collect -- NXSAT-184 scripts/collect-evidence/NXSAT-184.mjs
 */

/** @param {import('@playwright/test').Page} page */
export default async function collectEvidence(page, helpers, _outDir) {
  await helpers.login();

  const docUid = process.env['NUXEO_DOC_UID'];
  if (!docUid) {
    console.warn(
      '\n⚠️  NUXEO_DOC_UID not set — skipping document-specific evidence steps.\n' +
        '   Set it to a document with comments/replies and re-run.\n',
    );
    return;
  }

  helpers.step(`Navigate to document ${docUid}`);
  await helpers.goToDoc(docUid);
  await page.waitForTimeout(3000);
  await helpers.screenshot('00-doc-detail-loaded');

  helpers.step('Open Comments tab');
  const commentsTab = page
    .locator('button, [role="tab"]')
    .filter({ hasText: /^Comments$/ })
    .first();
  if (await commentsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
    await commentsTab.click();
    await page.waitForTimeout(1500);
  }
  await helpers.screenshot('01-comments-tab');

  helpers.step('Reply card — open ⋮ menu (Edit / Delete should be visible)');
  const replyMenuBtn = page.locator('.reply-card .comment-menu-btn').first();
  if (await replyMenuBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await replyMenuBtn.click();
    await page.waitForTimeout(600);
    await helpers.screenshot('02-reply-edit-delete-menu');
    await page.keyboard.press('Escape');
  } else {
    helpers.step('⚠️  No reply menu found — add a reply first, then re-run');
    await helpers.screenshot('02-no-replies-yet');
  }

  helpers.step('Final: Comments panel overview');
  const commentsPanel = page.locator('.comments-panel').first();
  await helpers.screenshot('final-comments-panel', commentsPanel);
}
