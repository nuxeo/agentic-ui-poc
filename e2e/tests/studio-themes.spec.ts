import { test, expect, Page } from '@playwright/test';
import { loginAsAdmin, clearDesignerStorage, navigateToDesignerPage } from './helpers';

async function screenshotThemes(page: Page, name: string) {
  await page.screenshot({
    path: `e2e/screenshots/themes-${name}.png`,
    fullPage: true,
  });
}

test.describe('Studio Designer — Themes', () => {
  test.beforeEach(async ({ page }) => {
    await clearDesignerStorage(page);
    await loginAsAdmin(page);
    await navigateToDesignerPage(page, 'Themes');
  });

  test('displays Themes list page with header and info banner', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Themes' })).toBeVisible();
    await expect(page.getByText('How does it work')).toBeVisible();
    await expect(page.getByText('Create new UI themes')).toBeVisible();
    await screenshotThemes(page, '01-list-page');
  });

  test('shows built-in base themes: default, dark, light, kawaii', async ({ page }) => {
    await expect(page.locator('.theme-name', { hasText: 'defaultTheme' })).toBeVisible();
    await expect(page.locator('.theme-name', { hasText: 'darkTheme' })).toBeVisible();
    await expect(page.locator('.theme-name', { hasText: 'lightTheme' })).toBeVisible();
    await expect(page.locator('.theme-name', { hasText: 'kawaiiTheme' })).toBeVisible();
  });

  test('built-in themes do NOT have CUSTOM badge', async ({ page }) => {
    await expect(page.locator('.custom-badge')).toHaveCount(0);
  });

  test('Only Custom toggle filters out built-in themes', async ({ page }) => {
    await expect(page.locator('.theme-row')).toHaveCount(4);
    await page.getByRole('button', { name: 'Only Custom' }).click();
    await page.waitForTimeout(300);
    await expect(page.locator('.theme-row')).toHaveCount(0);
    await expect(page.getByText('No themes match your filter.')).toBeVisible();
  });

  test('filter input narrows the theme list', async ({ page }) => {
    await page.locator('.filter-field input').fill('dark');
    await page.waitForTimeout(300);
    await expect(page.locator('.theme-row')).toHaveCount(1);
    await expect(page.locator('.theme-name', { hasText: 'darkTheme' })).toBeVisible();
  });

  test('+ FAB opens New Theme dialog', async ({ page }) => {
    await page.locator('.add-theme-fab').click();
    await page.waitForTimeout(300);
    await expect(page.getByRole('heading', { name: 'New Theme' })).toBeVisible();
    await expect(page.locator('mat-select')).toBeVisible();
    await screenshotThemes(page, '02-new-dialog');
  });

  test('New Theme dialog has Start From dropdown with all base themes', async ({ page }) => {
    await page.locator('.add-theme-fab').click();
    await page.waitForTimeout(300);
    await page.locator('mat-select').click();
    const panel = page.locator('.mat-mdc-select-panel');
    await expect(panel.locator('mat-option', { hasText: 'default' })).toBeVisible();
    await expect(panel.locator('mat-option', { hasText: 'dark' })).toBeVisible();
    await expect(panel.locator('mat-option', { hasText: 'light' })).toBeVisible();
    await expect(panel.locator('mat-option', { hasText: 'kawaii' })).toBeVisible();
  });

  test('can create a custom theme and see it in the list', async ({ page }) => {
    await page.locator('.add-theme-fab').click();
    await page.waitForTimeout(300);

    await page.locator('input[placeholder="My Custom Theme"]').fill('TestTheme');
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(500);

    // Should navigate to editor
    await expect(page.locator('.editor-breadcrumb')).toBeVisible();
    await expect(page.locator('.breadcrumb-current')).toContainText('TestTheme');

    // Go back to list
    await page.locator('.editor-breadcrumb button').first().click();
    await page.waitForTimeout(300);

    // Custom theme should appear with CUSTOM badge
    await expect(page.locator('.theme-row', { hasText: 'TestTheme' })).toBeVisible();
    await expect(page.locator('.custom-badge')).toHaveCount(1);
    await screenshotThemes(page, '03-custom-theme-in-list');
  });

  test('theme editor shows categorized CSS variables', async ({ page }) => {
    await page.locator('.add-theme-fab').click();
    await page.waitForTimeout(300);
    await page.locator('input[placeholder="My Custom Theme"]').fill('EditorTest');
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(500);

    await expect(page.locator('.variable-editor')).toBeVisible();

    const categories = [
      'Nuxeo Branding colors',
      'App Header',
      'App Sidebar & Drawers',
      'App Quick Search',
      'Tags & Pills',
      'Boxes, Tables & Listings',
    ];
    for (const cat of categories) {
      await expect(page.locator('.cat-label', { hasText: cat })).toBeVisible();
    }

    await expect(page.locator('.var-name', { hasText: '--nuxeo-primary-color' })).toBeVisible();

    await screenshotThemes(page, '04-editor-variables');
  });

  test('theme editor has metadata panel with name, default, logo', async ({ page }) => {
    await page.locator('.add-theme-fab').click();
    await page.waitForTimeout(300);
    await page.locator('input[placeholder="My Custom Theme"]').fill('MetaTest');
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(500);

    await expect(page.locator('.metadata-panel')).toBeVisible();
    await expect(page.locator('.meta-label', { hasText: 'Name' })).toBeVisible();
    await expect(page.getByText('Set this theme as default')).toBeVisible();
    await expect(page.locator('.meta-label', { hasText: 'Logo' })).toBeVisible();
    await expect(page.locator('.meta-label', { hasText: 'Background' })).toBeVisible();
    await expect(page.locator('.meta-label', { hasText: 'Screenshot' })).toBeVisible();
    await expect(page.locator('.meta-label', { hasText: 'Resources' })).toBeVisible();

    await screenshotThemes(page, '05-editor-metadata');
  });

  test('Save and Discard buttons are present in editor', async ({ page }) => {
    await page.locator('.add-theme-fab').click();
    await page.waitForTimeout(300);
    await page.locator('input[placeholder="My Custom Theme"]').fill('BtnTest');
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(500);

    await expect(
      page.locator('.editor-actions').getByRole('button', { name: 'Save' }),
    ).toBeVisible();
    await expect(
      page.locator('.editor-actions').getByRole('button', { name: 'Discard' }),
    ).toBeVisible();
  });

  test('editing a variable value updates the editor', async ({ page }) => {
    await page.locator('.add-theme-fab').click();
    await page.waitForTimeout(300);
    await page.locator('input[placeholder="My Custom Theme"]').fill('VarEdit');
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(500);

    const primaryInput = page
      .locator('.var-row', { hasText: '--nuxeo-primary-color' })
      .locator('.var-value-input');
    await primaryInput.clear();
    await primaryInput.fill('#ff0000');
    await page.waitForTimeout(200);

    await expect(primaryInput).toHaveValue('#ff0000');
  });

  test('custom theme persists after save and navigation', async ({ page }) => {
    await page.locator('.add-theme-fab').click();
    await page.waitForTimeout(300);
    await page.locator('input[placeholder="My Custom Theme"]').fill('PersistTest');
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(500);

    await page.locator('.editor-actions').getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(300);

    await page.locator('.editor-breadcrumb button').first().click();
    await page.waitForTimeout(300);

    await navigateToDesignerPage(page, 'Buttons');
    await page.waitForTimeout(300);
    await navigateToDesignerPage(page, 'Themes');
    await page.waitForTimeout(500);

    await expect(page.locator('.theme-row', { hasText: 'PersistTest' })).toBeVisible();
    await screenshotThemes(page, '06-persisted');
  });

  test('can delete a custom theme', async ({ page }) => {
    await page.locator('.add-theme-fab').click();
    await page.waitForTimeout(300);
    await page.locator('input[placeholder="My Custom Theme"]').fill('DeleteMe');
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(500);
    await page.locator('.editor-actions').getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(300);
    await page.locator('.editor-breadcrumb button').first().click();
    await page.waitForTimeout(300);

    await expect(page.locator('.theme-row', { hasText: 'DeleteMe' })).toBeVisible();

    await page
      .locator('.theme-row', { hasText: 'DeleteMe' })
      .locator('button[mattooltip="Delete"]')
      .click();
    await page.waitForTimeout(300);

    await expect(page.locator('.theme-row', { hasText: 'DeleteMe' })).not.toBeVisible();
  });
});
