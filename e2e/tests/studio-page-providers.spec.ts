import { test, expect } from '@playwright/test';
import { loginAsAdmin, clearDesignerStorage, navigateToDesignerPage } from './helpers';

test.describe('Studio Designer — Page Providers', () => {
  test.beforeEach(async ({ page }) => {
    await clearDesignerStorage(page);
    await loginAsAdmin(page);
    await navigateToDesignerPage(page, 'Page Providers');
  });

  test('shows empty state when no search configurations exist', async ({ page }) => {
    await expect(page.getByText('No custom search configurations.')).toBeVisible();
  });

  test('can create a new page provider', async ({ page }) => {
    await page.getByRole('button', { name: 'New Search Config' }).click();
    await expect(page.getByRole('heading', { name: 'Page Provider', exact: true })).toBeVisible();
    await expect(page.locator('.item-editor')).toBeVisible();
  });

  test('identity section has name, label, icon, and available fields', async ({ page }) => {
    await page.getByRole('button', { name: 'New Search Config' }).click();

    const identityPanel = page.locator('mat-expansion-panel:has-text("Identity")');
    await expect(identityPanel.locator('.field-label', { hasText: 'Name' })).toBeVisible();
    await expect(identityPanel.locator('.field-label', { hasText: 'Label' })).toBeVisible();
    await expect(identityPanel.locator('.field-label', { hasText: 'Icon' })).toBeVisible();
    await expect(identityPanel.locator('.field-label', { hasText: 'Available' })).toBeVisible();
  });

  test('query section has NXQL pattern, sort, and page size fields', async ({ page }) => {
    await page.getByRole('button', { name: 'New Search Config' }).click();

    const queryPanel = page.locator('mat-expansion-panel:has-text("Query")');
    await expect(queryPanel.locator('.field-label', { hasText: 'NXQL Pattern' })).toBeVisible();
    await expect(queryPanel.locator('.field-label', { hasText: 'Default Sort' })).toBeVisible();
    await expect(queryPanel.locator('.field-label', { hasText: 'Sort Order' })).toBeVisible();
    await expect(queryPanel.locator('.field-label', { hasText: 'Page Size' })).toBeVisible();
  });

  test('search form fields section has Add button', async ({ page }) => {
    await page.getByRole('button', { name: 'New Search Config' }).click();

    await expect(page.getByText('Add Search Field')).toBeVisible();
  });

  test('result columns section has Add button', async ({ page }) => {
    await page.getByRole('button', { name: 'New Search Config' }).click();

    await expect(page.getByText('Add Column')).toBeVisible();
  });

  test('can add a search field', async ({ page }) => {
    await page.getByRole('button', { name: 'New Search Config' }).click();

    await page.getByText('Add Search Field').click();
    await expect(page.locator('.draggable-row').first()).toBeVisible();
  });

  test('can add a result column', async ({ page }) => {
    await page.getByRole('button', { name: 'New Search Config' }).click();

    await page.getByText('Add Column').click();
    const resultPanel = page.locator('mat-expansion-panel:has-text("Result Columns")');
    await expect(resultPanel.locator('.draggable-row').first()).toBeVisible();
  });

  test('can save a search config and see it in the list', async ({ page }) => {
    await page.getByRole('button', { name: 'New Search Config' }).click();

    const identityPanel = page.locator('mat-expansion-panel:has-text("Identity")');
    await identityPanel.locator('input[placeholder="Unique provider name"]').fill('my-provider');
    await identityPanel.locator('input[placeholder="Display label"]').fill('My Provider');

    await page.getByRole('button', { name: 'Save' }).last().click();

    await expect(page.locator('.item-card')).toHaveCount(1);
    await expect(page.locator('.item-label')).toContainText('My Provider');
  });

  test('can delete a search config', async ({ page }) => {
    await page.getByRole('button', { name: 'New Search Config' }).click();
    const identityPanel = page.locator('mat-expansion-panel:has-text("Identity")');
    await identityPanel.locator('input[placeholder="Unique provider name"]').fill('del-prov');
    await identityPanel.locator('input[placeholder="Display label"]').fill('Delete Me');
    await page.getByRole('button', { name: 'Save' }).last().click();
    await expect(page.locator('.item-card')).toHaveCount(1);

    await page.locator('.item-card').getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('No custom search configurations.')).toBeVisible();
  });
});
