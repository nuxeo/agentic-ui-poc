/**
 * Evidence steps for NXSAT-192
 * "Hierarchical vocabulary dropdowns (Coverage & Subjects) only show top-level
 *  entries — child-level drill-down is missing"
 *
 * Verifies that the Coverage and Subjects dropdowns in document/metadata edit mode
 * expose child-level entries grouped under their parent (e.g. Africa/Tanzania,
 * Art/Cinema), matching the classic Nuxeo Web UI.
 *
 * Run with:
 *   NUXEO_DOC_UID=<doc-uid> npm run evidence:collect -- NXSAT-192 scripts/collect-evidence/NXSAT-192.mjs
 *
 * The document should live in a folder/workspace so the Edit dialog is available.
 */

/** @param {import('@playwright/test').Page} page */
export default async function collectEvidence(page, helpers, _outDir) {
  await helpers.login();

  const uid = process.env['NUXEO_DOC_UID'];
  if (!uid) {
    console.warn(
      '\n⚠️  NUXEO_DOC_UID not set — skipping document-specific evidence steps.\n' +
        '   Set it to a document UID (in a folder you can edit) and re-run.\n',
    );
    return;
  }

  helpers.step(`Navigate to document ${uid}`);
  await helpers.goToDoc(uid);
  await page.waitForTimeout(3000);

  // Open the Edit dialog (pencil in the document-detail header).
  helpers.step('Open the Edit dialog');
  const editButton = page.locator('button[aria-label="Edit"], button[matTooltip="Edit"]').first();
  await editButton.click();
  await page.waitForTimeout(1500);
  await helpers.screenshot('edit-dialog-open');

  // ── Subjects: grouped children under parent categories ────────────────────
  helpers.step('Open Subjects dropdown — expect parent categories with child entries');
  const subjects = page.locator('mat-select').filter({ hasText: /Subjects|Select a value/ }).first();
  // Fall back to label association if the filter is ambiguous.
  const subjectsField = page
    .locator('mat-form-field', { has: page.getByText('Subjects', { exact: true }) })
    .locator('mat-select');
  const subjectsSelect = (await subjectsField.count()) ? subjectsField.first() : subjects;
  await subjectsSelect.click();
  await page.waitForTimeout(1000);

  const subjectGroups = page.locator('.mat-mdc-optgroup');
  const subjectGroupCount = await subjectGroups.count();
  if (subjectGroupCount > 0) {
    console.log(`✓ Subjects dropdown shows ${subjectGroupCount} parent group(s) with children.`);
  } else {
    console.warn('⚠️  No optgroups found in Subjects dropdown — fix may not be applied.');
  }
  await helpers.screenshot('subjects-grouped-children');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // ── Coverage: grouped children (continent → country) ──────────────────────
  helpers.step('Open Coverage dropdown — expect continents with country children');
  const coverageField = page
    .locator('mat-form-field', { has: page.getByText('Coverage', { exact: true }) })
    .locator('mat-select');
  await coverageField.first().click();
  await page.waitForTimeout(1000);

  const coverageGroups = page.locator('.mat-mdc-optgroup');
  const coverageGroupCount = await coverageGroups.count();
  if (coverageGroupCount > 0) {
    console.log(`✓ Coverage dropdown shows ${coverageGroupCount} continent group(s) with countries.`);
  } else {
    console.warn('⚠️  No optgroups found in Coverage dropdown — fix may not be applied.');
  }
  await helpers.screenshot('coverage-grouped-children');

  // Pick a child entry to prove the Parent/Child selection + trigger label.
  const firstChild = coverageGroups.first().locator('mat-option').first();
  if (await firstChild.isVisible({ timeout: 2000 }).catch(() => false)) {
    await firstChild.click();
    await page.waitForTimeout(500);
    await helpers.screenshot('coverage-child-selected-parent-child-label');
  }
}
