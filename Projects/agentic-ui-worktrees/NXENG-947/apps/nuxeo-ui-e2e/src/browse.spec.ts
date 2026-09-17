import { expect, expectSurfaceWithData, test } from './fixtures';

/**
 * Browse — the primary authenticated surface, and the one every other path starts from.
 *
 * Assertions are on **repository data**, not on the component being present. An
 * unauthenticated XHR renders `lib-browse` with no rows: visible, green under a
 * `toBeVisible` check, and proof of nothing. That distinction is the reason
 * `expectSurfaceWithData` exists.
 */
test.describe('browse', () => {
  test('lists repository content at the root', async ({ signedIn: page }) => {
    await page.goto('/#/browse', { waitUntil: 'networkidle' });

    await expectSurfaceWithData(page, 'lib-browse', 'Root');
    // The empty-state copy the app shows for a folder with no children. Its presence at
    // the root would mean the listing failed, so this is a negative assertion with teeth.
    await expect(page.locator('lib-browse')).toContainText('Create / Import');
  });

  test('offers navigation into the repository tree', async ({ signedIn: page }) => {
    await page.goto('/#/browse', { waitUntil: 'networkidle' });
    await expectSurfaceWithData(page, 'lib-browse', 'Root');

    // The root's children in a stock Nuxeo. Named individually rather than counting rows:
    // a count assertion passes on the wrong rows.
    const host = page.locator('lib-browse');
    await expect(host).toContainText(/Sections|Templates|Workspaces/);
  });

  test('the shell renders its chrome on an authenticated route', async ({ signedIn: page }) => {
    await page.goto('/#/browse', { waitUntil: 'networkidle' });

    const shell = page.locator('app-shell');
    await expect(shell).toBeVisible();
    // The skip link is an accessibility affordance that must survive a refactor; Phase 6
    // step 3 raises the wider WCAG bar, and this keeps one landmark of it under test now.
    await expect(shell).toContainText('Skip to main content');
  });
});
