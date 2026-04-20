import { test, expect, Page } from '@playwright/test';
import { loginAsAdmin, clearDesignerStorage, navigateToDesignerPage } from './helpers';

async function screenshotDashboard(page: Page, name: string) {
  await page.screenshot({
    path: `e2e/screenshots/dashboard-${name}.png`,
    fullPage: true,
  });
}

test.describe('Studio Designer — Dashboard Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await clearDesignerStorage(page);
    await loginAsAdmin(page);
    await navigateToDesignerPage(page, 'Dashboard');
  });

  test('renders the dashboard configuration page with all sections visible', async ({ page }) => {
    await expect(page.getByText('Dashboard Configuration')).toBeVisible();
    await expect(page.locator('.widget-palette')).toBeVisible();
    await expect(page.locator('.grid-preview')).toBeVisible();
    await expect(page.getByText('Add Widget')).toBeVisible();
    await expect(page.getByText('Dashboard Layout')).toBeVisible();
    await expect(page.getByText('Grid Columns')).toBeVisible();
    await expect(
      page.locator('.header-actions').getByRole('button', { name: 'Save' }),
    ).toBeVisible();
    await expect(
      page.locator('.header-actions').getByRole('button', { name: 'Reset' }),
    ).toBeVisible();

    await screenshotDashboard(page, '01-initial-load');
  });

  test('widget palette contains all 7 widget types', async ({ page }) => {
    const palette = page.locator('.widget-palette');
    const expectedWidgets = [
      'Recently Updated',
      'Pending Tasks',
      'Favorites',
      'Collections',
      'Saved Searches',
      'Analytics',
      'Custom Widget',
    ];

    for (const name of expectedWidgets) {
      await expect(palette.locator('.palette-item', { hasText: name })).toBeVisible();
    }

    const paletteItems = palette.locator('.palette-item');
    await expect(paletteItems).toHaveCount(expectedWidgets.length);
  });

  test('default state shows exactly 4 pre-configured widgets', async ({ page }) => {
    const tiles = page.locator('.widget-tile');
    await expect(tiles).toHaveCount(4);

    await expect(tiles.nth(0).locator('.widget-label')).toContainText('Recently Updated');
    await expect(tiles.nth(1).locator('.widget-label')).toContainText('Pending Tasks');
    await expect(tiles.nth(2).locator('.widget-label')).toContainText('Favorites');
    await expect(tiles.nth(3).locator('.widget-label')).toContainText('Collections');

    await screenshotDashboard(page, '02-default-widgets');
  });

  test('adding a widget from palette shows it in the grid immediately', async ({ page }) => {
    const tiles = page.locator('.widget-tile');
    await expect(tiles).toHaveCount(4);
    await screenshotDashboard(page, '03-before-add');

    await page.locator('.palette-item', { hasText: 'Analytics' }).click();
    await page.waitForTimeout(300);

    await expect(tiles).toHaveCount(5);
    const newTile = tiles.nth(4);
    await expect(newTile.locator('.widget-label')).toContainText('Analytics');
    await expect(newTile.locator('.widget-type-badge')).toContainText('analytics');
    await expect(newTile).toBeVisible();

    await screenshotDashboard(page, '03-after-add-analytics');
  });

  test('added widget persists after save and page reload', async ({ page }) => {
    await page.locator('.palette-item', { hasText: 'Analytics' }).click();
    await expect(page.locator('.widget-tile')).toHaveCount(5);

    await page.locator('.header-actions').getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);
    await screenshotDashboard(page, '04-after-save');

    await page.reload();
    await page.waitForSelector('.dashboard-designer');
    await expect(page.locator('.widget-tile')).toHaveCount(5);
    await expect(page.locator('.widget-tile').nth(4).locator('.widget-label')).toContainText(
      'Analytics',
    );

    await screenshotDashboard(page, '04-after-reload');
  });

  test('added widget persists after navigating away and back', async ({ page }) => {
    await page.locator('.palette-item', { hasText: 'Saved Searches' }).click();
    await expect(page.locator('.widget-tile')).toHaveCount(5);

    await page.locator('.header-actions').getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);

    await navigateToDesignerPage(page, 'Layouts');
    await page.waitForTimeout(500);
    await navigateToDesignerPage(page, 'Dashboard');
    await page.waitForTimeout(500);

    await expect(page.locator('.widget-tile')).toHaveCount(5);
    const labels = await page.locator('.widget-tile .widget-label').allTextContents();
    expect(labels).toContain('Saved Searches');

    await screenshotDashboard(page, '05-persist-after-nav');
  });

  test('removing a widget removes it from the grid immediately', async ({ page }) => {
    const initialCount = await page.locator('.widget-tile').count();
    const firstLabel = await page
      .locator('.widget-tile')
      .first()
      .locator('.widget-label')
      .textContent();

    await screenshotDashboard(page, '06-before-remove');

    await page.locator('.widget-tile').first().locator('button[mattooltip="Remove"]').click();
    await page.waitForTimeout(300);

    await expect(page.locator('.widget-tile')).toHaveCount(initialCount - 1);

    const remainingLabels = await page.locator('.widget-tile .widget-label').allTextContents();
    expect(remainingLabels).not.toContain(firstLabel);

    await screenshotDashboard(page, '06-after-remove');
  });

  test('toggling widget visibility shows disabled state', async ({ page }) => {
    const tile = page.locator('.widget-tile').first();
    await expect(tile).not.toHaveClass(/disabled/);

    await tile.locator('button[mattooltip="Toggle"]').click();
    await page.waitForTimeout(200);

    await expect(tile).toHaveClass(/disabled/);
    await screenshotDashboard(page, '07-toggled-disabled');

    await tile.locator('button[mattooltip="Toggle"]').click();
    await page.waitForTimeout(200);
    await expect(tile).not.toHaveClass(/disabled/);
  });

  test('clicking a widget shows properties panel with correct fields', async ({ page }) => {
    await page.locator('.widget-tile').first().click();
    await page.waitForTimeout(200);

    const props = page.locator('.widget-properties');
    await expect(props).toBeVisible();
    await expect(page.getByText('Widget Properties')).toBeVisible();

    await expect(props.locator('.field-label', { hasText: 'Label' })).toBeVisible();
    await expect(props.locator('.field-label', { hasText: 'Icon' })).toBeVisible();
    await expect(props.locator('.field-label', { hasText: 'Type' })).toBeVisible();
    await expect(props.locator('.field-label', { hasText: 'Width' })).toBeVisible();
    await expect(props.locator('.field-label', { hasText: 'Available' })).toBeVisible();

    await screenshotDashboard(page, '08-properties-panel');
  });

  test('editing widget label in properties updates the grid tile', async ({ page }) => {
    await page.locator('.widget-tile').first().click();
    await page.waitForTimeout(200);

    const labelInput = page.locator('.widget-properties mat-form-field').first().locator('input');
    await labelInput.clear();
    await labelInput.fill('My Custom Label');
    await page.waitForTimeout(300);

    const firstTileLabel = page.locator('.widget-tile').first().locator('.widget-label');
    await expect(firstTileLabel).toContainText('My Custom Label');

    await screenshotDashboard(page, '09-edited-label');
  });

  test('reset restores default 4 widgets after adding extras', async ({ page }) => {
    await page.locator('.palette-item', { hasText: 'Analytics' }).click();
    await page.locator('.palette-item', { hasText: 'Saved Searches' }).click();
    await page.locator('.palette-item', { hasText: 'Custom Widget' }).click();
    await expect(page.locator('.widget-tile')).toHaveCount(7);

    await screenshotDashboard(page, '10-before-reset');

    await page.locator('.header-actions').getByRole('button', { name: 'Reset' }).click();
    await page.waitForTimeout(300);

    await expect(page.locator('.widget-tile')).toHaveCount(4);
    await screenshotDashboard(page, '10-after-reset');
  });

  test('removing all widgets shows empty state message', async ({ page }) => {
    const count = await page.locator('.widget-tile').count();
    for (let i = 0; i < count; i++) {
      await page.locator('.widget-tile').first().locator('button[mattooltip="Remove"]').click();
      await page.waitForTimeout(200);
    }

    await expect(page.locator('.widget-tile')).toHaveCount(0);
    await expect(
      page.getByText('No widgets configured. Add widgets from the palette.'),
    ).toBeVisible();
    await screenshotDashboard(page, '11-empty-state');
  });

  test('adding a widget after clearing all shows it correctly', async ({ page }) => {
    const count = await page.locator('.widget-tile').count();
    for (let i = 0; i < count; i++) {
      await page.locator('.widget-tile').first().locator('button[mattooltip="Remove"]').click();
      await page.waitForTimeout(200);
    }
    await expect(page.locator('.widget-tile')).toHaveCount(0);

    await page.locator('.palette-item', { hasText: 'Favorites' }).click();
    await page.waitForTimeout(300);

    await expect(page.locator('.widget-tile')).toHaveCount(1);
    await expect(page.locator('.widget-tile .widget-label')).toContainText('Favorites');
    await screenshotDashboard(page, '12-add-after-empty');
  });

  test('grid columns selector changes layout', async ({ page }) => {
    await screenshotDashboard(page, '13-columns-3');

    await page.locator('.grid-config mat-select').click();
    await page.locator('mat-option', { hasText: '4 Columns' }).click();
    await page.waitForTimeout(300);

    await screenshotDashboard(page, '13-columns-4');

    await page.locator('.grid-config mat-select').click();
    await page.locator('mat-option', { hasText: '2 Columns' }).click();
    await page.waitForTimeout(300);

    await screenshotDashboard(page, '13-columns-2');
  });

  test('full workflow: add widget, configure, save, verify persistence', async ({ page }) => {
    await page.locator('.palette-item', { hasText: 'Analytics' }).click();
    await page.waitForTimeout(300);
    await expect(page.locator('.widget-tile')).toHaveCount(5);

    // Adding from palette auto-selects the widget — properties panel should already be open
    await expect(page.locator('.widget-properties')).toBeVisible();

    const labelInput = page.locator('.widget-properties mat-form-field').first().locator('input');
    await labelInput.clear();
    await labelInput.fill('Sales Analytics');
    await page.waitForTimeout(300);

    await screenshotDashboard(page, '14-workflow-configured');

    await page.locator('.header-actions').getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);

    await page.reload();
    await page.waitForSelector('.dashboard-designer');

    await expect(page.locator('.widget-tile')).toHaveCount(5);
    const allLabels = await page.locator('.widget-tile .widget-label').allTextContents();
    expect(allLabels).toContain('Sales Analytics');

    await screenshotDashboard(page, '14-workflow-persisted');
  });
});
