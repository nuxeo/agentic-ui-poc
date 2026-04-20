import { test, expect } from '@playwright/test';
import { loginAsAdmin, clearDesignerStorage, navigateToDesignerPage } from './helpers';

test.describe('Studio Designer — Tabs Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await clearDesignerStorage(page);
    await loginAsAdmin(page);
    await navigateToDesignerPage(page, 'Tabs');
  });

  test('shows empty state when no tabs configured', async ({ page }) => {
    await expect(page.getByText('No custom tabs configured.')).toBeVisible();
  });

  test('can create a new tab', async ({ page }) => {
    await page.getByRole('button', { name: 'New Tab' }).click();
    await expect(page.getByText('Tab Configuration')).toBeVisible();
    await expect(page.locator('.item-editor')).toBeVisible();
  });

  test('identity section has required fields', async ({ page }) => {
    await page.getByRole('button', { name: 'New Tab' }).click();

    const editor = page.locator('.item-editor');
    await expect(editor.locator('.field-label', { hasText: 'Name' })).toBeVisible();
    await expect(editor.locator('.field-label', { hasText: 'Label' })).toBeVisible();
    await expect(editor.locator('.field-label', { hasText: 'Icon' })).toBeVisible();
    await expect(editor.locator('.field-label', { hasText: 'Order' })).toBeVisible();
    await expect(editor.locator('.field-label', { hasText: 'Available' })).toBeVisible();
  });

  test('content section has content mode dropdown', async ({ page }) => {
    await page.getByRole('button', { name: 'New Tab' }).click();

    const contentPanel = page.locator('mat-expansion-panel:has-text("Content")');
    await expect(contentPanel.locator('.field-label', { hasText: 'Content Mode' })).toBeVisible();
  });

  test('activation filters section is available', async ({ page }) => {
    await page.getByRole('button', { name: 'New Tab' }).click();

    const filtersPanel = page.locator('mat-expansion-panel:has-text("Activation Filters")');
    await expect(filtersPanel).toBeVisible();
  });

  test('can save a tab and see it in the list', async ({ page }) => {
    await page.getByRole('button', { name: 'New Tab' }).click();

    const identityPanel = page.locator('mat-expansion-panel:has-text("Identity")');
    await identityPanel.locator('input[placeholder="Unique tab identifier"]').fill('my-tab');
    await identityPanel.locator('input[placeholder="Display label"]').fill('My Custom Tab');

    await page.getByRole('button', { name: 'Save' }).last().click();

    await expect(page.locator('.item-card')).toHaveCount(1);
    await expect(page.locator('.item-label')).toContainText('My Custom Tab');
  });

  test('can toggle tab availability', async ({ page }) => {
    await page.getByRole('button', { name: 'New Tab' }).click();
    const identityPanel = page.locator('mat-expansion-panel:has-text("Identity")');
    await identityPanel.locator('input[placeholder="Unique tab identifier"]').fill('toggle-tab');
    await identityPanel.locator('input[placeholder="Display label"]').fill('Toggle Tab');
    await page.getByRole('button', { name: 'Save' }).last().click();

    const card = page.locator('.item-card');
    await expect(card).not.toHaveClass(/disabled/);

    await card.getByRole('button', { name: 'Toggle' }).click();
    await expect(card).toHaveClass(/disabled/);
  });

  test('can delete a tab', async ({ page }) => {
    await page.getByRole('button', { name: 'New Tab' }).click();
    const identityPanel = page.locator('mat-expansion-panel:has-text("Identity")');
    await identityPanel.locator('input[placeholder="Unique tab identifier"]').fill('del-tab');
    await identityPanel.locator('input[placeholder="Display label"]').fill('Delete Me');
    await page.getByRole('button', { name: 'Save' }).last().click();
    await expect(page.locator('.item-card')).toHaveCount(1);

    await page.locator('.item-card').getByRole('button', { name: 'Delete tab' }).click();
    await expect(page.getByText('No custom tabs configured.')).toBeVisible();
  });

  test('discard button closes editor', async ({ page }) => {
    await page.getByRole('button', { name: 'New Tab' }).click();
    await expect(page.locator('.item-editor')).toBeVisible();
    await page.getByRole('button', { name: 'Discard' }).click();
    await expect(page.locator('.item-editor')).not.toBeVisible();
  });
});
