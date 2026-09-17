/**
 * Evidence steps for NXSAT-180
 * "Cannot add new permissions in Permissions Assigned to External Users"
 *
 * Run with:
 *   NUXEO_DOC_UID=<uid> npm run evidence:collect -- NXSAT-180 scripts/collect-evidence/NXSAT-180.mjs
 */

/** @param {import('@playwright/test').Page} page */
export default async function collectEvidence(page, helpers, _outDir) {
  await helpers.login();

  const docUid = process.env['NUXEO_DOC_UID'];
  if (!docUid) {
    console.warn(
      '\n⚠️  NUXEO_DOC_UID not set — set a document UID with WriteSecurity permission and re-run.\n',
    );
    return;
  }

  helpers.step(`Open document ${docUid}`);
  await helpers.goToDoc(docUid);
  await page.waitForTimeout(2000);
  await helpers.screenshot('01-doc-detail');

  helpers.step('Open Permissions tab');
  const permissionsTab = page.getByRole('tab', { name: 'Permissions' });
  await permissionsTab.waitFor({ state: 'visible', timeout: 30_000 });
  await permissionsTab.click();
  await page.getByText('Permissions Assigned to External Users').waitFor({
    state: 'visible',
    timeout: 30_000,
  });
  await helpers.screenshot('02-permissions-tab');

  helpers.step('Open Share With External User dialog');
  const section = page.locator('section').filter({
    hasText: 'Permissions Assigned to External Users',
  });
  await section.getByRole('button', { name: 'New' }).click();
  const dialog = page.locator('mat-dialog-container');
  await dialog.getByRole('heading', { name: 'Share With External User' }).waitFor();
  await helpers.screenshot('03-share-external-dialog');

  const email = `nxsat180-e2e-${Date.now()}@example.com`;
  helpers.step(`Create external permission for ${email}`);
  await dialog.getByLabel('Email').fill(email);
  await dialog.getByLabel('To').fill('12/31/2027');
  await dialog.locator('textarea').fill('External share — NXSAT-180 evidence');
  await dialog.getByRole('button', { name: 'Create', exact: true }).click();

  const snackbar = page.locator('.mat-mdc-snack-bar-container, .mat-snack-bar-container');
  await snackbar.waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(800);
  await helpers.screenshot('04-create-result');

  helpers.step('Verify external permission appears in table');
  await page.getByText('Permissions Assigned to External Users').waitFor({ state: 'visible' });
  await page.getByText(email).waitFor({ state: 'visible', timeout: 30_000 });
  await helpers.screenshot('05-external-permission-listed');
}
