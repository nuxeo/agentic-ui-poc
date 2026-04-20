import { test, expect, Page } from '@playwright/test';
import { loginAsAdmin, clearDesignerStorage, navigateToDesignerPage } from './helpers';

async function screenshotLayouts(page: Page, name: string) {
  await page.screenshot({
    path: `e2e/screenshots/layouts-${name}.png`,
    fullPage: true,
  });
}

test.describe('Studio Designer — Form Layouts', () => {
  test.beforeEach(async ({ page }) => {
    await clearDesignerStorage(page);
    await loginAsAdmin(page);
    await page.goto('/#/studio-designer/layouts');
    await page.waitForSelector('.layouts-shell');
  });

  test('shows Document Types tree and Layout Designer placeholder', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Document Types', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Layout Designer' })).toBeVisible();
    await expect(page.getByText('Select a document type and mode')).toBeVisible();
    await screenshotLayouts(page, '01-initial');
  });

  test('doc type tree shows built-in types', async ({ page }) => {
    await expect(page.getByText('Built-in Document Types')).toBeVisible();
    for (const type of ['File', 'Note', 'Folder', 'Picture']) {
      await expect(page.locator('.doctype-name', { hasText: type }).first()).toBeVisible();
    }
  });

  test('each doc type has mode chips (C/E/V/M/I)', async ({ page }) => {
    const fileRow = page.locator('.tree-doctype', { hasText: 'File' }).first();
    const modeChips = fileRow.locator('..').locator('.mode-chip');
    await expect(modeChips).toHaveCount(5);
  });

  test('clicking a mode chip opens the layout canvas', async ({ page }) => {
    const fileDocType = page.locator('.tree-doctype', { hasText: 'File' }).first();
    const modeChips = fileDocType.locator('..').locator('.mode-chip');
    await modeChips.first().click();
    await page.waitForTimeout(500);

    await expect(page.locator('.canvas-header')).toBeVisible();
    await expect(page.locator('.canvas-header h3')).toContainText('File');
    await expect(page.locator('.canvas-header h3')).toContainText('create');

    await screenshotLayouts(page, '02-file-create-canvas');
  });

  test('field catalog loads for File type', async ({ page }) => {
    const fileDocType = page.locator('.tree-doctype', { hasText: 'File' }).first();
    fileDocType.locator('..').locator('.mode-chip').first().click();
    await page.waitForTimeout(500);

    await expect(page.locator('.catalog-sidebar')).toBeVisible();
    await expect(page.getByText('Field Catalog')).toBeVisible();

    const catalogField = page.locator('.catalog-field');
    await expect(catalogField.first()).toBeVisible({ timeout: 10000 });

    await expect(
      page.locator('.catalog-field-xpath', { hasText: 'dc:title' }).first(),
    ).toBeVisible();
    await expect(
      page.locator('.catalog-field-xpath', { hasText: 'dc:description' }).first(),
    ).toBeVisible();
    await expect(
      page.locator('.catalog-field-xpath', { hasText: 'file:content' }).first(),
    ).toBeVisible();

    await screenshotLayouts(page, '03-field-catalog');
  });

  test('can add fields from catalog to layout', async ({ page }) => {
    const fileDocType = page.locator('.tree-doctype', { hasText: 'File' }).first();
    fileDocType.locator('..').locator('.mode-chip').first().click();
    await page.waitForTimeout(500);
    await page.locator('.catalog-field').first().waitFor({ state: 'visible', timeout: 10000 });

    await page.locator('.catalog-field', { hasText: 'dc:title' }).click();
    await page.locator('.catalog-field', { hasText: 'dc:description' }).click();
    await page.waitForTimeout(300);

    await expect(page.locator('.field-row')).toHaveCount(2);
    await expect(page.locator('.field-xpath', { hasText: 'dc:title' })).toBeVisible();
    await expect(page.locator('.field-xpath', { hasText: 'dc:description' })).toBeVisible();

    await expect(page.locator('.catalog-field.in-layout', { hasText: 'dc:title' })).toBeVisible();

    await screenshotLayouts(page, '04-fields-added');
  });

  test('can remove a field from the layout', async ({ page }) => {
    const fileDocType = page.locator('.tree-doctype', { hasText: 'File' }).first();
    fileDocType.locator('..').locator('.mode-chip').first().click();
    await page.waitForTimeout(500);
    await page.locator('.catalog-field').first().waitFor({ state: 'visible', timeout: 10000 });

    await page.locator('.catalog-field', { hasText: 'dc:title' }).click();
    await page.locator('.catalog-field', { hasText: 'dc:description' }).click();
    await expect(page.locator('.field-row')).toHaveCount(2);

    await page.locator('.field-row').first().getByRole('button', { name: 'Remove' }).click();
    await expect(page.locator('.field-row')).toHaveCount(1);

    await screenshotLayouts(page, '05-field-removed');
  });

  test('can save layout with Save button', async ({ page }) => {
    const fileDocType = page.locator('.tree-doctype', { hasText: 'File' }).first();
    fileDocType.locator('..').locator('.mode-chip').first().click();
    await page.waitForTimeout(500);
    await page.locator('.catalog-field').first().waitFor({ state: 'visible', timeout: 10000 });

    await page.locator('.catalog-field', { hasText: 'dc:title' }).click();
    await page.locator('.catalog-field', { hasText: 'dc:description' }).click();

    await page.locator('.canvas-actions button', { hasText: 'Save' }).click();
    await page.waitForTimeout(500);

    const fileRow = page.locator('.tree-doctype', { hasText: 'File' }).first();
    await expect(fileRow.locator('..').locator('.mode-chip.has-layout').first()).toBeVisible();

    await screenshotLayouts(page, '06-saved');
  });

  test('saved layout persists after navigation', async ({ page }) => {
    const fileDocType = page.locator('.tree-doctype', { hasText: 'File' }).first();
    fileDocType.locator('..').locator('.mode-chip').first().click();
    await page.waitForTimeout(500);
    await page.locator('.catalog-field').first().waitFor({ state: 'visible', timeout: 10000 });

    await page.locator('.catalog-field', { hasText: 'dc:title' }).click();
    await page.locator('.canvas-actions button', { hasText: 'Save' }).click();
    await page.waitForTimeout(300);

    await navigateToDesignerPage(page, 'Buttons');
    await page.waitForTimeout(300);
    await navigateToDesignerPage(page, 'Layouts');
    await page.waitForTimeout(500);

    const fileRow = page.locator('.tree-doctype', { hasText: 'File' }).first();
    await expect(fileRow.locator('..').locator('.mode-chip.has-layout').first()).toBeVisible();

    await screenshotLayouts(page, '07-persisted');
  });

  test('can add a custom document type', async ({ page }) => {
    await page.locator('input[placeholder="e.g. Contract, Invoice"]').fill('Invoice');
    await page.locator('button[aria-label="Add document type"]').click();
    await page.waitForTimeout(500);

    await expect(page.locator('.canvas-header h3')).toContainText('Invoice');
    await expect(page.locator('.canvas-header h3')).toContainText('create');

    await screenshotLayouts(page, '08-custom-doctype');
  });

  test('mode tabs allow switching between layout modes', async ({ page }) => {
    const fileDocType = page.locator('.tree-doctype', { hasText: 'File' }).first();
    fileDocType.locator('..').locator('.mode-chip').first().click();
    await page.waitForTimeout(500);

    await expect(page.locator('.canvas-header h3')).toContainText('create');

    await page.locator('.mode-tab', { hasText: 'edit' }).click();
    await page.waitForTimeout(300);
    await expect(page.locator('.canvas-header h3')).toContainText('edit');

    await page.locator('.mode-tab', { hasText: 'view' }).click();
    await page.waitForTimeout(300);
    await expect(page.locator('.canvas-header h3')).toContainText('view');
  });

  test('clicking a field row shows field properties panel', async ({ page }) => {
    const fileDocType = page.locator('.tree-doctype', { hasText: 'File' }).first();
    fileDocType.locator('..').locator('.mode-chip').first().click();
    await page.waitForTimeout(500);
    await page.locator('.catalog-field').first().waitFor({ state: 'visible', timeout: 10000 });

    await page.locator('.catalog-field', { hasText: 'dc:title' }).click();
    await page.waitForTimeout(200);

    await page.locator('.field-row').first().click();
    await page.waitForTimeout(200);

    await expect(page.getByText('Field Properties')).toBeVisible();
    await expect(page.locator('.prop-label', { hasText: 'XPath' })).toBeVisible();
    await expect(page.locator('.prop-label', { hasText: 'Widget' })).toBeVisible();
    await expect(page.locator('.prop-label', { hasText: 'Required' })).toBeVisible();

    await screenshotLayouts(page, '09-field-properties');
  });

  test('canvas shows empty section message when no fields added', async ({ page }) => {
    const fileDocType = page.locator('.tree-doctype', { hasText: 'File' }).first();
    fileDocType.locator('..').locator('.mode-chip').first().click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Click fields from the catalog to add them here.')).toBeVisible();
  });

  test('Add Section button adds a new section', async ({ page }) => {
    const fileDocType = page.locator('.tree-doctype', { hasText: 'File' }).first();
    fileDocType.locator('..').locator('.mode-chip').first().click();
    await page.waitForTimeout(500);

    const initialSections = await page.locator('.section-container').count();
    await page.getByRole('button', { name: 'Add Section' }).click();
    await expect(page.locator('.section-container')).toHaveCount(initialSections + 1);
  });
});
