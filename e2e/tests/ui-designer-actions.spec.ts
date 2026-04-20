import { test, expect } from '@playwright/test';
import { loginAsAdmin, clearDesignerStorage, navigateToDesignerPage } from './helpers';

test.describe('Studio Designer — Custom Actions (Buttons)', () => {
  test.beforeEach(async ({ page }) => {
    await clearDesignerStorage(page);
    await loginAsAdmin(page);
    await navigateToDesignerPage(page, 'Buttons');
  });

  test('admin can navigate to Buttons page', async ({ page }) => {
    await expect(page.getByText('Buttons | How does it work')).toBeVisible();
  });

  test('shows how-it-works section with two button types', async ({ page }) => {
    await expect(page.locator('.button-type-card')).toHaveCount(2);
    await expect(page.getByText('Configure a button and attach an automation')).toBeVisible();
    await expect(page.getByText('Use code to create your custom element')).toBeVisible();
  });

  test('empty state shows helpful message', async ({ page }) => {
    await expect(page.getByText('No custom actions configured yet')).toBeVisible();
  });

  test('clicking "+" button opens editor with default values', async ({ page }) => {
    await page.getByRole('button', { name: 'New Action' }).click();
    await expect(page.locator('.action-editor')).toBeVisible();
    await expect(page.getByText('Identity')).toBeVisible();
    await expect(page.locator('.action-editor mat-slide-toggle')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' }).last()).toBeDisabled();
  });

  test('clicking button type card opens editor with correct type', async ({ page }) => {
    await page.locator('.button-type-card').first().click();
    await expect(page.locator('.action-editor')).toBeVisible();

    const elementInput = page.locator(
      'mat-expansion-panel:has-text("Element Binding") input[placeholder*="nuxeo-operation-button"]',
    );
    await expect(elementInput).toHaveValue('nuxeo-operation-button');
  });

  test('Element Binding section shows all fields', async ({ page }) => {
    await page.getByRole('button', { name: 'New Action' }).click();

    const bindingPanel = page.locator('mat-expansion-panel:has-text("Element Binding")');
    await expect(bindingPanel).toBeVisible();

    for (const label of [
      'Element',
      'icon',
      'tooltip-position',
      'show-label',
      'operation',
      'sync-indexing',
    ]) {
      await expect(
        bindingPanel.locator('.form-row .field-label', { hasText: label }),
      ).toBeVisible();
    }
    await expect(bindingPanel.locator('.form-row > .field-label.required-label')).toBeVisible();
    await expect(
      bindingPanel.locator('.form-row .field-label >> text="tooltip"').first(),
    ).toBeVisible();
    await expect(
      bindingPanel.locator('.form-row .field-label >> text="input"').first(),
    ).toBeVisible();
  });

  test('save enables only after filling label AND operation', async ({ page }) => {
    await page.getByRole('button', { name: 'New Action' }).click();

    const saveBtn = page.getByRole('button', { name: 'Save' }).last();
    await expect(saveBtn).toBeDisabled();

    const bindingPanel = page.locator('mat-expansion-panel:has-text("Element Binding")');
    const labelInput = bindingPanel.locator('.form-row:has-text("label") input').first();
    await labelInput.fill('Test Label');
    await expect(saveBtn).toBeDisabled();

    const operationInput = bindingPanel.locator('.form-row:has-text("operation") input').first();
    await operationInput.fill('Document.Lock');
    await expect(saveBtn).toBeEnabled();
  });

  test('can create and see action in sidebar list', async ({ page }) => {
    await page.getByRole('button', { name: 'New Action' }).click();

    const bindingPanel = page.locator('mat-expansion-panel:has-text("Element Binding")');
    await bindingPanel.locator('.form-row:has-text("label") input').first().fill('Lock Document');
    await bindingPanel
      .locator('.form-row:has-text("operation") input')
      .first()
      .fill('Document.Lock');

    const identityPanel = page.locator('mat-expansion-panel:has-text("Identity")');
    await identityPanel.locator('input[placeholder="Button name"]').fill('LockBtn');

    await page.getByRole('button', { name: 'Save' }).last().click();

    await expect(page.locator('.action-card')).toHaveCount(1);
    await expect(page.locator('.action-label')).toContainText('LockBtn');
    await expect(page.locator('.action-meta')).toContainText('Document.Lock');
  });

  test('can toggle action available/unavailable', async ({ page }) => {
    await page.getByRole('button', { name: 'New Action' }).click();
    const bindingPanel = page.locator('mat-expansion-panel:has-text("Element Binding")');
    await bindingPanel.locator('.form-row:has-text("label") input').first().fill('Test');
    await bindingPanel.locator('.form-row:has-text("operation") input').first().fill('Test.Op');
    await page.getByRole('button', { name: 'Save' }).last().click();

    const card = page.locator('.action-card');
    await expect(card).not.toHaveClass(/disabled/);

    await card.getByRole('button', { name: 'Toggle enabled' }).click();
    await expect(card).toHaveClass(/disabled/);

    await card.getByRole('button', { name: 'Toggle enabled' }).click();
    await expect(card).not.toHaveClass(/disabled/);
  });

  test('can delete an action', async ({ page }) => {
    await page.getByRole('button', { name: 'New Action' }).click();
    const bindingPanel = page.locator('mat-expansion-panel:has-text("Element Binding")');
    await bindingPanel.locator('.form-row:has-text("label") input').first().fill('Test');
    await bindingPanel.locator('.form-row:has-text("operation") input').first().fill('Test.Op');
    await page.getByRole('button', { name: 'Save' }).last().click();
    await expect(page.locator('.action-card')).toHaveCount(1);

    await page.locator('.action-card').getByRole('button', { name: 'Delete action' }).click();
    await expect(page.getByText('No custom actions configured yet')).toBeVisible();
  });

  test('actions persist across page navigations', async ({ page }) => {
    await page.getByRole('button', { name: 'New Action' }).click();
    const bindingPanel = page.locator('mat-expansion-panel:has-text("Element Binding")');
    await bindingPanel.locator('.form-row:has-text("label") input').first().fill('Persistent');
    await bindingPanel.locator('.form-row:has-text("operation") input').first().fill('Persist.Op');
    await page.getByRole('button', { name: 'Save' }).last().click();
    await expect(page.locator('.action-card')).toHaveCount(1);

    await navigateToDesignerPage(page, 'Buttons');
    await page.waitForSelector('.action-card');
    await expect(page.locator('.action-card')).toHaveCount(1);
    await expect(page.locator('.action-meta')).toContainText('Persist.Op');
  });

  test('Attributes section has all Studio Designer fields', async ({ page }) => {
    await page.getByRole('button', { name: 'New Action' }).click();

    const attrPanel = page.locator('mat-expansion-panel:has-text("Attributes")');
    await attrPanel.locator('mat-expansion-panel-header').click();

    for (const label of [
      'params',
      'response',
      'notification',
      'download',
      'event',
      'detail',
      'async',
      'poll-interval',
      'error-label',
    ]) {
      await expect(attrPanel.locator('.form-row .field-label', { hasText: label })).toBeVisible();
    }

    await expect(attrPanel.getByText('ADD ATTRIBUTE')).toBeVisible();
  });

  test('Activation filter section shows filter fields', async ({ page }) => {
    await page.getByRole('button', { name: 'New Action' }).click();

    const filterPanel = page.locator('mat-expansion-panel:has-text("Activation filter")');
    await filterPanel.locator('mat-expansion-panel-header').click();

    for (const label of [
      'Document Types',
      'Required Permissions',
      'Required Facets',
      'Exclude Facets',
      'Document States',
      'Exclude States',
      'Schemas',
      'Groups',
      'Is Administrator',
      'EL Expression',
    ]) {
      await expect(filterPanel.locator('.form-row .field-label', { hasText: label })).toBeVisible();
    }
  });

  test('all slot options are available in dropdown', async ({ page }) => {
    await page.getByRole('button', { name: 'New Action' }).click();

    const slotPanel = page.locator('mat-expansion-panel:has-text("User will access it from")');
    await slotPanel.locator('mat-select').click();

    const panel = page.locator('.mat-mdc-select-panel');
    await expect(panel).toBeVisible();

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

  test('can add and remove custom attributes', async ({ page }) => {
    await page.getByRole('button', { name: 'New Action' }).click();

    const attrPanel = page.locator('mat-expansion-panel:has-text("Attributes")');
    await attrPanel.locator('mat-expansion-panel-header').click();

    await attrPanel.locator('.attr-key-field input').fill('my-custom');
    await attrPanel.locator('.attr-value-field input').fill('hello');
    await attrPanel.getByText('ADD ATTRIBUTE').click();

    await expect(attrPanel.locator('.custom-attr-row', { hasText: 'my-custom' })).toBeVisible();
    await expect(attrPanel.locator('.custom-attr-value', { hasText: 'hello' })).toBeVisible();

    await attrPanel
      .locator('.custom-attr-row')
      .getByRole('button', { name: 'Remove attribute' })
      .click();
    await expect(attrPanel.locator('.custom-attr-row')).toHaveCount(0);
  });

  test('Discard button closes editor', async ({ page }) => {
    await page.getByRole('button', { name: 'New Action' }).click();
    await expect(page.locator('.action-editor')).toBeVisible();

    await page.getByRole('button', { name: 'Discard' }).click();
    await expect(page.locator('.action-editor')).not.toBeVisible();
  });
});
