import { test, expect, Page } from '@playwright/test';
import { loginAsAdmin } from './helpers';

async function screenshotBrowse(page: Page, name: string) {
  await page.screenshot({
    path: `e2e/screenshots/browse-${name}.png`,
    fullPage: true,
  });
}

/**
 * Opens the Browse sidebar drawer by clicking the Browse nav icon.
 * The sidebar tree only renders when the Browse drawer panel is active.
 */
async function openBrowseDrawer(page: Page): Promise<void> {
  await page.goto('/#/browse');
  await page.waitForTimeout(1000);

  // Click the Browse nav item to open the drawer panel
  const browseNav = page.locator('sat-platform-nav-list-item', { hasText: 'Browse' });
  await browseNav.click();
  await page.waitForTimeout(2000);
}

test.describe('studio-configs folder must be hidden from Browse', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Browse sidebar tree shows folders but NOT studio-configs', async ({ page }) => {
    await openBrowseDrawer(page);

    // The folder tree should now be visible in the drawer
    const tree = page.locator('.folder-tree');
    await expect(tree).toBeVisible({ timeout: 10000 });

    // Wait for tree labels to populate
    const treeLabels = tree.locator('.tree-label');
    await expect(treeLabels.first()).toBeVisible({ timeout: 10000 });

    // Collect all visible tree node labels
    const allLabels = await treeLabels.allTextContents();
    const trimmed = allLabels.map((l) => l.trim());

    // Root and Domain should be visible
    expect(trimmed.some((l) => l === 'Root' || l === 'Domain')).toBe(true);

    // studio-configs MUST NOT appear
    expect(trimmed).not.toContain('studio-configs');

    // Direct locator check
    const studioNode = tree.locator('.tree-label', { hasText: 'studio-configs' });
    await expect(studioNode).toHaveCount(0);

    await screenshotBrowse(page, 'tree-no-studio-configs');
  });

  test('normal folders like Workspaces are visible, studio-configs is hidden', async ({ page }) => {
    await openBrowseDrawer(page);

    const tree = page.locator('.folder-tree');
    await expect(tree).toBeVisible({ timeout: 10000 });

    // Wait for domain children to load
    await page.waitForTimeout(3000);

    const allLabels = await tree.locator('.tree-label').allTextContents();
    const trimmed = allLabels.map((l) => l.trim());

    // Check that normal folders are present
    const hasNormalFolders = trimmed.some(
      (l) => l === 'Workspaces' || l === 'Sections' || l === 'Templates',
    );
    expect(hasNormalFolders).toBe(true);

    // studio-configs must be filtered out
    expect(trimmed).not.toContain('studio-configs');

    await screenshotBrowse(page, 'tree-hidden-facet-verified');
  });
});
