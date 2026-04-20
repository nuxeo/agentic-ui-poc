import { test, expect } from '@playwright/test';
import { loginAsAdmin, clearDesignerStorage, navigateToDesignerPage } from './helpers';

test.describe('Studio Designer — Drawer Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await clearDesignerStorage(page);
    await loginAsAdmin(page);
    await navigateToDesignerPage(page, 'Drawer');
  });

  test('shows empty state when no drawer items configured', async ({ page }) => {
    await expect(page.getByText('No custom drawer items configured.')).toBeVisible();
  });

  test('can create a new drawer item', async ({ page }) => {
    await page.getByRole('button', { name: 'New Drawer Item' }).click();
    await expect(page.getByRole('heading', { name: 'Drawer Item', exact: true })).toBeVisible();
    await expect(page.locator('.item-editor')).toBeVisible();
  });

  test('identity section has required fields', async ({ page }) => {
    await page.getByRole('button', { name: 'New Drawer Item' }).click();

    const editor = page.locator('.item-editor');
    await expect(editor.locator('.field-label', { hasText: 'Name' })).toBeVisible();
    await expect(editor.locator('.field-label', { hasText: 'Label' })).toBeVisible();
    await expect(editor.locator('.field-label', { hasText: 'Icon' })).toBeVisible();
    await expect(editor.locator('.field-label', { hasText: 'Order' })).toBeVisible();
    await expect(editor.locator('.field-label', { hasText: 'Available' })).toBeVisible();
  });

  test('navigation section has route and custom element fields', async ({ page }) => {
    await page.getByRole('button', { name: 'New Drawer Item' }).click();

    const navPanel = page.locator('mat-expansion-panel:has-text("Navigation")');
    await expect(navPanel.locator('.field-label', { hasText: 'Route Path' })).toBeVisible();
    await expect(navPanel.locator('.field-label', { hasText: 'Custom Element' })).toBeVisible();
  });

  test('can save a drawer item and see it in the list', async ({ page }) => {
    await page.getByRole('button', { name: 'New Drawer Item' }).click();

    const identityPanel = page.locator('mat-expansion-panel:has-text("Identity")');
    await identityPanel.locator('input[placeholder="Unique identifier"]').fill('reports');
    await identityPanel.locator('input[placeholder="Display label"]').fill('Reports');

    await page.getByRole('button', { name: 'Save' }).last().click();

    await expect(page.locator('.item-card')).toHaveCount(1);
    await expect(page.locator('.item-label')).toContainText('Reports');
  });

  test('can toggle drawer item availability', async ({ page }) => {
    await page.getByRole('button', { name: 'New Drawer Item' }).click();
    const identityPanel = page.locator('mat-expansion-panel:has-text("Identity")');
    await identityPanel.locator('input[placeholder="Unique identifier"]').fill('toggle-item');
    await identityPanel.locator('input[placeholder="Display label"]').fill('Toggle Item');
    await page.getByRole('button', { name: 'Save' }).last().click();

    const card = page.locator('.item-card');
    await expect(card).not.toHaveClass(/disabled/);

    await card.getByRole('button', { name: 'Toggle' }).click();
    await expect(card).toHaveClass(/disabled/);
  });

  test('can delete a drawer item', async ({ page }) => {
    await page.getByRole('button', { name: 'New Drawer Item' }).click();
    const identityPanel = page.locator('mat-expansion-panel:has-text("Identity")');
    await identityPanel.locator('input[placeholder="Unique identifier"]').fill('del-item');
    await identityPanel.locator('input[placeholder="Display label"]').fill('Delete Me');
    await page.getByRole('button', { name: 'Save' }).last().click();
    await expect(page.locator('.item-card')).toHaveCount(1);

    await page.locator('.item-card').getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('No custom drawer items configured.')).toBeVisible();
  });
});
