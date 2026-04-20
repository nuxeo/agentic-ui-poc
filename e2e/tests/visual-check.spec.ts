import { test, expect } from '@playwright/test';
import { loginAsAdmin, clearDesignerStorage } from './helpers';

/**
 * Visual verification suite — captures screenshots and asserts
 * that every Studio Designer page renders without errors.
 *
 * Run after any UI change:
 *   npx playwright test --config=e2e/playwright.config.ts e2e/tests/visual-check.spec.ts
 */

const PAGES: {
  name: string;
  label: string;
  mustSee: string[];
}[] = [
  {
    name: 'layouts',
    label: 'Layouts',
    mustSee: ['Document Types', 'Layout Designer'],
  },
  {
    name: 'buttons',
    label: 'Buttons',
    mustSee: ['Buttons | How does it work'],
  },
  {
    name: 'tabs',
    label: 'Tabs',
    mustSee: ['Tabs'],
  },
  {
    name: 'drawer',
    label: 'Drawer',
    mustSee: ['Drawer Items'],
  },
  {
    name: 'page-providers',
    label: 'Page Providers',
    mustSee: ['Page Providers'],
  },
  {
    name: 'themes',
    label: 'Themes',
    mustSee: ['Themes', 'How does it work'],
  },
  {
    name: 'translations',
    label: 'Translations',
    mustSee: ['Translations', 'Locales'],
  },
  {
    name: 'dashboard',
    label: 'Dashboard',
    mustSee: ['Dashboard Configuration', 'Add Widget'],
  },
];

test.describe('Visual Verification — Studio Designer', () => {
  for (const p of PAGES) {
    test(`${p.name}: renders without errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('pageerror', (err) => {
        consoleErrors.push(`PAGE ERROR: ${err.message}`);
      });

      await clearDesignerStorage(page);
      await loginAsAdmin(page);
      await page.goto(`/#/studio-designer/${p.name}`);
      await page.waitForTimeout(2000);

      // Screenshot
      await page.screenshot({
        path: `e2e/screenshots/${p.name}.png`,
        fullPage: true,
      });

      // Assert no console errors
      const criticalErrors = consoleErrors.filter(
        (e) => !e.includes('favicon') && !e.includes('404'),
      );
      expect(criticalErrors, `Console errors on ${p.name} page`).toEqual([]);

      // Assert key content is visible
      for (const text of p.mustSee) {
        await expect(
          page.getByText(text, { exact: false }).first(),
          `"${text}" should be visible on ${p.name} page`,
        ).toBeVisible({ timeout: 5000 });
      }

      // Assert Studio Designer sidebar is present
      await expect(page.locator('.studio-sidebar')).toBeVisible();
      await expect(page.locator('.studio-content')).toBeVisible();
    });
  }

  test('platform nav: Studio Designer icon renders', async ({ page }) => {
    await clearDesignerStorage(page);
    await loginAsAdmin(page);
    await page.goto('/#/studio-designer/layouts');
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: 'e2e/screenshots/platform-nav.png',
      fullPage: true,
    });

    // The platform nav sidebar should have the Studio Designer entry
    const navLink = page.locator('sat-platform-nav-list-item', { hasText: 'Studio Designer' });
    await expect(navLink).toBeVisible();
  });
});
