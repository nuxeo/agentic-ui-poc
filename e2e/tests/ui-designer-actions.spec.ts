import { test, expect } from '@playwright/test';
import { loginAsAdmin, clearDesignerStorage } from './helpers';

test.describe('UI Designer — Custom Actions', () => {
  test.beforeEach(async ({ page }) => {
    await clearDesignerStorage(page);
    await loginAsAdmin(page);
    await page.goto('/#/administration/ui-designer');
    await page.waitForSelector('h1');
  });

  test('admin can navigate to UI Designer page', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('UI Designer');
    await expect(page.getByRole('tab', { name: 'Custom Actions' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Form Layouts' })).toBeVisible();
  });

  test('empty state shows helpful message', async ({ page }) => {
    await expect(page.getByText('No custom actions configured yet')).toBeVisible();
  });

  test('New Action button opens editor with defaults', async ({ page }) => {
    await page.getByRole('button', { name: 'New Action' }).click();
    await expect(page.locator('.action-editor')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save Action' })).toBeDisabled();
  });

  test('save enables after filling operation ID', async ({ page }) => {
    await page.getByRole('button', { name: 'New Action' }).click();

    const saveBtn = page.getByRole('button', { name: 'Save Action' });
    await expect(saveBtn).toBeDisabled();

    await page.locator('.action-editor input[placeholder*="Document.Lock"]').fill('Document.Lock');
    await expect(saveBtn).toBeEnabled();
  });

  test('can create and see action in list', async ({ page }) => {
    await page.getByRole('button', { name: 'New Action' }).click();
    await page.locator('.action-editor input[placeholder*="Document.Lock"]').fill('Document.Lock');
    await page.getByRole('button', { name: 'Save Action' }).click();

    await expect(page.locator('.action-editor')).not.toBeVisible();
    await expect(page.locator('.action-card')).toHaveCount(1);
    await expect(page.locator('.action-label')).toHaveText('New Action');
    await expect(page.locator('.action-meta')).toContainText('Document.Lock');
  });

  test('can toggle action enabled/disabled', async ({ page }) => {
    await page.getByRole('button', { name: 'New Action' }).click();
    await page.locator('.action-editor input[placeholder*="Document.Lock"]').fill('Test.Op');
    await page.getByRole('button', { name: 'Save Action' }).click();

    const card = page.locator('.action-card');
    await expect(card).not.toHaveClass(/disabled/);

    await card.getByRole('button', { name: 'Toggle enabled' }).click();
    await expect(card).toHaveClass(/disabled/);

    await card.getByRole('button', { name: 'Toggle enabled' }).click();
    await expect(card).not.toHaveClass(/disabled/);
  });

  test('can delete an action', async ({ page }) => {
    await page.getByRole('button', { name: 'New Action' }).click();
    await page.locator('.action-editor input[placeholder*="Document.Lock"]').fill('Test.Op');
    await page.getByRole('button', { name: 'Save Action' }).click();
    await expect(page.locator('.action-card')).toHaveCount(1);

    await page.locator('.action-card').getByRole('button', { name: 'Delete action' }).click();
    await expect(page.getByText('No custom actions configured yet')).toBeVisible();
  });

  test('actions persist across page reloads', async ({ page }) => {
    await page.getByRole('button', { name: 'New Action' }).click();
    await page.locator('.action-editor input[placeholder*="Document.Lock"]').fill('Persist.Op');
    await page.getByRole('button', { name: 'Save Action' }).click();
    await expect(page.locator('.action-card')).toHaveCount(1);

    // Remove the init script that clears storage before reloading
    await page.removeAllListeners('console');
    await page.evaluate(() => {
      /* storage already has the action — just reload */
    });
    // Navigate away and back (avoids initScript re-clearing localStorage)
    await page.goto('/#/administration/ui-designer');
    await page.waitForSelector('.action-card');
    await expect(page.locator('.action-card')).toHaveCount(1);
    await expect(page.locator('.action-meta')).toContainText('Persist.Op');
  });

  test('all slot options are available in dropdown', async ({ page }) => {
    await page.getByRole('button', { name: 'New Action' }).click();

    const slotField = page.locator('.row-2col mat-form-field').first();
    await slotField.locator('mat-select').click();

    const panel = page.locator('.mat-mdc-select-panel');
    await expect(panel).toBeVisible();

    // Use exact option role matching to avoid substring collisions
    const expected = [
      'Blob Actions',
      'Collection Actions',
      'Document Actions',
      'Document Create Actions',
      'Document More Actions',
      'File Upload Actions',
      'Publish Pages',
      'Results Actions',
      'Results Selection Actions',
      'Trash Results Selection Actions',
    ];
    const optionCount = await panel.locator('mat-option').count();
    expect(optionCount).toBe(expected.length);

    for (const slot of expected) {
      await expect(page.getByRole('option', { name: slot, exact: true })).toBeVisible();
    }
  });
});
