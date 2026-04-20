import { test, expect } from '@playwright/test';
import { loginAsAdmin, clearDesignerStorage, navigateToDesignerPage } from './helpers';

test.describe('Studio Designer — Translations', () => {
  test.beforeEach(async ({ page }) => {
    await clearDesignerStorage(page);
    await loginAsAdmin(page);
    await navigateToDesignerPage(page, 'Translations');
  });

  test('displays Translations page', async ({ page }) => {
    await expect(page.getByText('Translations').first()).toBeVisible();
  });

  test('shows locale chips for adding locales', async ({ page }) => {
    await expect(page.locator('.locale-chip').first()).toBeVisible();
    await expect(page.locator('.locale-chip', { hasText: 'en' })).toBeVisible();
    await expect(page.locator('.locale-chip', { hasText: 'fr' })).toBeVisible();
  });

  test('shows "Select or add a locale" message when no locale selected', async ({ page }) => {
    await expect(page.getByText('Select or add a locale to manage translations.')).toBeVisible();
  });

  test('clicking a locale chip adds it and shows the editor', async ({ page }) => {
    await page.locator('.locale-chip', { hasText: 'en' }).click();
    await expect(page.locator('.entries-editor')).toBeVisible();
    await expect(page.locator('.locale-card')).toHaveCount(1);
    await expect(page.locator('.locale-code')).toContainText('en');
  });

  test('can add a translation entry', async ({ page }) => {
    await page.locator('.locale-chip', { hasText: 'en' }).click();

    await page.locator('input[placeholder="e.g. app.title"]').fill('app.title');
    await page.locator('.value-field input').fill('My Application');
    await page.getByRole('button', { name: 'Add entry' }).click();

    await expect(page.locator('.entry-row')).toHaveCount(1);
    await expect(page.locator('.entry-key')).toContainText('app.title');
  });

  test('can remove a translation entry', async ({ page }) => {
    await page.locator('.locale-chip', { hasText: 'en' }).click();

    await page.locator('input[placeholder="e.g. app.title"]').fill('temp.key');
    await page.locator('.value-field input').fill('temp');
    await page.getByRole('button', { name: 'Add entry' }).click();
    await expect(page.locator('.entry-row')).toHaveCount(1);

    await page.locator('.entry-row').getByRole('button', { name: 'Remove entry' }).click();
    await expect(page.locator('.entry-row')).toHaveCount(0);
  });

  test('can remove a locale', async ({ page }) => {
    await page.locator('.locale-chip', { hasText: 'en' }).click();
    await expect(page.locator('.locale-card')).toHaveCount(1);

    await page.locator('.locale-card').getByRole('button', { name: 'Remove' }).click();
    await expect(page.locator('.locale-card')).toHaveCount(0);
    await expect(page.getByText('Select or add a locale to manage translations.')).toBeVisible();
  });

  test('can add multiple locales', async ({ page }) => {
    await page.locator('.locale-chip', { hasText: 'en' }).click();
    await page.locator('.locale-chip', { hasText: 'fr' }).click();
    await expect(page.locator('.locale-card')).toHaveCount(2);
  });

  test('filter input filters entries', async ({ page }) => {
    await page.locator('.locale-chip', { hasText: 'en' }).click();

    await page.locator('input[placeholder="e.g. app.title"]').fill('app.title');
    await page.locator('.value-field input').fill('Title');
    await page.getByRole('button', { name: 'Add entry' }).click();

    await page.locator('input[placeholder="e.g. app.title"]').fill('nav.home');
    await page.locator('.value-field input').fill('Home');
    await page.getByRole('button', { name: 'Add entry' }).click();

    await expect(page.locator('.entry-row')).toHaveCount(2);

    await page.locator('input[placeholder="Filter keys..."]').fill('nav');
    await expect(page.locator('.entry-row')).toHaveCount(1);
    await expect(page.locator('.entry-key')).toContainText('nav.home');
  });
});
