import { test, expect } from '@playwright/test';
import { loginAsAdmin, clearDesignerStorage } from './helpers';

test.describe('UI Designer — Form Layouts', () => {
  test.beforeEach(async ({ page }) => {
    await clearDesignerStorage(page);
    await loginAsAdmin(page);
    await page.goto('/#/administration/ui-designer');
    await page.waitForSelector('h1');
    await page.getByRole('tab', { name: 'Form Layouts' }).click();
  });

  test('shows Document Form Designer heading', async ({ page }) => {
    await expect(page.getByText('Document Form Designer')).toBeVisible();
  });

  test('Design Layout button is disabled without doc type', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Design Layout' })).toBeDisabled();
  });

  test('entering a doc type enables Design Layout and opens canvas', async ({ page }) => {
    await page.locator('input[placeholder*="File, Note"]').fill('File');
    await expect(page.getByRole('button', { name: 'Design Layout' })).toBeEnabled();

    await page.getByRole('button', { name: 'Design Layout' }).click();

    await expect(page.locator('.canvas-header h3')).toContainText('File');
    await expect(page.locator('.canvas-header h3')).toContainText('create');
    await expect(page.getByText('Drag fields from the catalog')).toBeVisible();
  });

  test('fallback fields load in the catalog for File type', async ({ page }) => {
    await page.locator('input[placeholder*="File, Note"]').fill('File');
    await page.getByRole('button', { name: 'Design Layout' }).click();

    const catalogField = page.locator('.catalog-field');
    await expect(catalogField.first()).toBeVisible({ timeout: 10000 });

    // Check that known fields are present (text matching within catalog-field elements)
    await expect(page.locator('.catalog-field >> text=dc:title')).toBeVisible();
    await expect(page.locator('.catalog-field >> text=dc:description')).toBeVisible();
    await expect(page.locator('.catalog-field >> text=file:content')).toBeVisible();
  });

  test('can add fields from catalog to layout', async ({ page }) => {
    await page.locator('input[placeholder*="File, Note"]').fill('File');
    await page.getByRole('button', { name: 'Design Layout' }).click();
    await page.locator('.catalog-field').first().waitFor({ state: 'visible', timeout: 10000 });

    await page.locator('.catalog-field', { hasText: 'dc:title' }).click();
    await page.locator('.catalog-field', { hasText: 'dc:description' }).click();

    await expect(page.locator('.field-row')).toHaveCount(2);
    await expect(page.getByText('Drag fields from the catalog')).not.toBeVisible();

    // Added field marked in catalog
    await expect(page.locator('.catalog-field.in-layout', { hasText: 'dc:title' })).toBeVisible();
  });

  test('can remove a field from the layout', async ({ page }) => {
    await page.locator('input[placeholder*="File, Note"]').fill('File');
    await page.getByRole('button', { name: 'Design Layout' }).click();
    await page.locator('.catalog-field').first().waitFor({ state: 'visible', timeout: 10000 });

    await page.locator('.catalog-field', { hasText: 'dc:title' }).click();
    await page.locator('.catalog-field', { hasText: 'dc:description' }).click();
    await expect(page.locator('.field-row')).toHaveCount(2);

    await page.locator('.field-row').first().getByRole('button', { name: 'Remove field' }).click();
    await expect(page.locator('.field-row')).toHaveCount(1);
  });

  test('can save layout and see it in configured list', async ({ page }) => {
    await page.locator('input[placeholder*="File, Note"]').fill('File');
    await page.getByRole('button', { name: 'Design Layout' }).click();
    await page.locator('.catalog-field').first().waitFor({ state: 'visible', timeout: 10000 });

    await page.locator('.catalog-field', { hasText: 'dc:title' }).click();
    await page.locator('.catalog-field', { hasText: 'dc:description' }).click();

    await page.locator('.canvas-actions button', { hasText: 'Save' }).click();

    const chip = page.locator('.layout-chip');
    await expect(chip).toHaveCount(1);
    await expect(chip).toContainText('File');
    await expect(chip).toContainText('create');
    await expect(chip).toContainText('2 fields');
  });

  test('saved layout persists after reload', async ({ page }) => {
    await page.locator('input[placeholder*="File, Note"]').fill('File');
    await page.getByRole('button', { name: 'Design Layout' }).click();
    await page.locator('.catalog-field').first().waitFor({ state: 'visible', timeout: 10000 });

    await page.locator('.catalog-field', { hasText: 'dc:title' }).click();
    await page.locator('.canvas-actions button', { hasText: 'Save' }).click();

    // Navigate away and back (avoids initScript re-clearing localStorage)
    await page.goto('/#/administration/ui-designer');
    await page.waitForSelector('h1');
    await page.getByRole('tab', { name: 'Form Layouts' }).click();

    await expect(page.locator('.layout-chip')).toHaveCount(1);
    await expect(page.locator('.layout-chip')).toContainText('File');
  });

  test('can delete a saved layout', async ({ page }) => {
    await page.locator('input[placeholder*="File, Note"]').fill('Note');
    await page.getByRole('button', { name: 'Design Layout' }).click();
    await page.locator('.catalog-field').first().waitFor({ state: 'visible', timeout: 10000 });

    await page.locator('.catalog-field', { hasText: 'dc:title' }).click();
    await page.locator('.canvas-actions button', { hasText: 'Save' }).click();
    await expect(page.locator('.layout-chip')).toHaveCount(1);

    await page.locator('.layout-chip').getByRole('button', { name: 'Delete layout' }).click();
    await expect(page.locator('.layout-chip')).toHaveCount(0);
  });

  test('layout mode dropdown has all options', async ({ page }) => {
    const modeSelect = page
      .locator('mat-form-field', { hasText: 'Layout Mode' })
      .locator('mat-select');
    await modeSelect.click();

    const panel = page.locator('.mat-mdc-select-panel');
    for (const mode of ['create', 'edit', 'view', 'metadata', 'import']) {
      await expect(panel.locator('mat-option', { hasText: mode })).toBeVisible();
    }
  });
});
