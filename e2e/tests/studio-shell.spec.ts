import { test, expect } from '@playwright/test';
import { loginAsAdmin, clearDesignerStorage } from './helpers';

test.describe('Studio Designer — Shell & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await clearDesignerStorage(page);
    await loginAsAdmin(page);
    await page.goto('/#/studio-designer');
    await page.waitForSelector('.studio-sidebar');
  });

  test('displays Studio Designer shell with sidebar', async ({ page }) => {
    await expect(page.locator('.studio-title')).toHaveText('Studio Designer');
    await expect(page.locator('.studio-sidebar')).toBeVisible();
  });

  test('sidebar has all navigation items', async ({ page }) => {
    const navItems = [
      'Layouts',
      'Buttons',
      'Tabs',
      'Drawer',
      'Page Providers',
      'Themes',
      'Translations',
      'Dashboard',
    ];
    for (const label of navItems) {
      await expect(
        page.locator('.studio-sidebar a span[matlistitemtitle]', { hasText: label }),
      ).toBeVisible();
    }
  });

  test('defaults to Layouts page', async ({ page }) => {
    await expect(page).toHaveURL(/studio-designer\/layouts/);
  });

  test('can navigate to each page via sidebar', async ({ page }) => {
    const pages = [
      { label: 'Buttons', urlSegment: 'buttons' },
      { label: 'Tabs', urlSegment: 'tabs' },
      { label: 'Drawer', urlSegment: 'drawer' },
      { label: 'Page Providers', urlSegment: 'page-providers' },
      { label: 'Themes', urlSegment: 'themes' },
      { label: 'Translations', urlSegment: 'translations' },
      { label: 'Dashboard', urlSegment: 'dashboard' },
    ];
    for (const p of pages) {
      await page.locator('.studio-sidebar a span[matlistitemtitle]', { hasText: p.label }).click();
      await expect(page).toHaveURL(new RegExp(`studio-designer/${p.urlSegment}`));
    }
  });
});
