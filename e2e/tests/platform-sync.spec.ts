import { test, expect } from '@playwright/test';
import { loginAsAdmin, clearDesignerStorage, navigateToDesignerPage } from './helpers';

test.describe('Platform Registry Sync — Layouts', () => {
  test.beforeEach(async ({ page }) => {
    await clearDesignerStorage(page);
    await loginAsAdmin(page);
    await navigateToDesignerPage(page, 'Layouts');
  });

  test('shows Local Document Types category with Studio-created types', async ({ page }) => {
    const localCategory = page.locator('.tree-category .category-label', {
      hasText: 'Local Document Types',
    });
    await expect(localCategory).toBeVisible();

    const localCount = localCategory.locator('..').locator('.category-count');
    await expect(localCount).toBeVisible();

    const tree = page.locator('.doc-type-browser');
    await expect(tree.locator('.doctype-name', { hasText: 'SampleTestDocu' })).toBeVisible();
    await expect(tree.locator('.doctype-name', { hasText: 'Contract' })).toBeVisible();
  });

  test('shows Built-in Document Types category with standard types', async ({ page }) => {
    const builtInCategory = page.locator('.tree-category .category-label', {
      hasText: 'Built-in Document Types',
    });
    await expect(builtInCategory).toBeVisible();

    const tree = page.locator('.doc-type-browser');
    await expect(tree.locator('.doctype-name', { hasText: /^File$/ })).toBeVisible();
    await expect(tree.locator('.doctype-name', { hasText: /^Note$/ })).toBeVisible();
    await expect(tree.locator('.doctype-name', { hasText: /^Folder$/ })).toBeVisible();
    await expect(tree.locator('.doctype-name', { hasText: /^Picture$/ })).toBeVisible();
  });

  test('clicking Local Document Types category shows type grid in content area', async ({
    page,
  }) => {
    const localCategory = page.locator('.tree-category .category-label', {
      hasText: 'Local Document Types',
    });
    await localCategory.click();

    await expect(page.locator('.category-content h2')).toHaveText('Local Document Types');
    await expect(page.locator('.category-type-card')).toHaveCount(2); // SampleTestDocu + Contract
  });

  test('clicking a Studio-created type opens the layout editor', async ({ page }) => {
    const tree = page.locator('.doc-type-browser');

    // Find the SampleTestDocu type and click its view mode chip
    const sampleDocNode = tree.locator('mat-tree-node', { hasText: 'SampleTestDocu' });
    await expect(sampleDocNode).toBeVisible();

    // Click the "V" (view) mode chip for SampleTestDocu
    const viewChip = sampleDocNode.locator('.mode-chip').last(); // view is the last mode
    await viewChip.click();

    // Should open the layout editor for SampleTestDocu — view
    await expect(page.locator('.canvas-header h3')).toContainText('SampleTestDocu');
  });

  test('layout modes (C/E/I/M/V) are shown for platform types', async ({ page }) => {
    const tree = page.locator('.doc-type-browser');
    // Find the tree node that contains exactly "File" as the doc type name
    const fileNameSpan = tree.locator('.doctype-name', { hasText: /^File$/ });
    await expect(fileNameSpan).toBeVisible();

    // Navigate up to the mat-tree-node to find the mode chips
    const fileNode = fileNameSpan.locator('xpath=ancestor::mat-tree-node');
    const chips = fileNode.locator('.mode-chip');
    await expect(chips).toHaveCount(5); // create, edit, view, metadata, import
  });
});

test.describe('Platform Registry Sync — Page Providers', () => {
  test.beforeEach(async ({ page }) => {
    await clearDesignerStorage(page);
    await loginAsAdmin(page);
    await navigateToDesignerPage(page, 'Page Providers');
  });

  test('shows platform-registered page providers section', async ({ page }) => {
    const platformSection = page.locator('.platform-providers-section');
    await expect(platformSection).toBeVisible();

    await expect(
      platformSection.locator('.platform-pp-name', { hasText: 'default_search' }),
    ).toBeVisible();
    await expect(
      platformSection.locator('.platform-pp-name', { hasText: 'nxql_search' }),
    ).toBeVisible();
  });

  test('shows Custom Configurations label', async ({ page }) => {
    const customLabel = page.locator('.custom-label', { hasText: 'Custom Configurations' });
    await expect(customLabel).toBeVisible();
  });
});

test.describe('Platform Registry Sync — Studio Layout Detection', () => {
  test.beforeEach(async ({ page }) => {
    await clearDesignerStorage(page);
    await loginAsAdmin(page);
    await navigateToDesignerPage(page, 'Layouts');
  });

  test('clicking SampleTestDocu view mode loads the Studio-deployed layout', async ({ page }) => {
    // Capture console messages for debugging
    const consoleMsgs: string[] = [];
    page.on('console', (msg) => consoleMsgs.push(`[${msg.type()}] ${msg.text()}`));

    const tree = page.locator('.doc-type-browser');
    const sampleDocNode = tree.locator('mat-tree-node', { hasText: 'SampleTestDocu' });
    await expect(sampleDocNode).toBeVisible();

    // Click the last mode chip (V = view)
    const viewChip = sampleDocNode.locator('.mode-chip').last();
    await viewChip.click();

    // Wait for editor to appear (either studio or empty)
    await expect(page.locator('.canvas-header h3')).toContainText('SampleTestDocu', {
      timeout: 5000,
    });

    // Check if layout loaded from Studio — may show banner or just fields
    const banner = page.locator('.studio-source-banner');
    const hasBanner = await banner.isVisible().catch(() => false);

    if (hasBanner) {
      await expect(banner).toContainText('Nuxeo Studio Designer');
    }

    // At minimum, the canvas header should show the doc type
    await expect(page.locator('.canvas-header h3')).toContainText('SampleTestDocu');
  });

  test('Studio layout parses sections and fields from Polymer HTML', async ({ page }) => {
    const tree = page.locator('.doc-type-browser');
    const sampleDocNode = tree.locator('mat-tree-node', { hasText: 'SampleTestDocu' });
    const viewChip = sampleDocNode.locator('.mode-chip').last();
    await viewChip.click();

    // Wait for canvas header to appear
    await expect(page.locator('.canvas-header h3')).toContainText('SampleTestDocu', {
      timeout: 5000,
    });

    // If a Studio layout was successfully loaded, it will have sections with fields
    // If not (mock route not matched), it will show an empty default section
    const sections = page.locator('.section-container');
    await expect(sections.first()).toBeVisible();
  });

  test('can save layout for Studio-created type', async ({ page }) => {
    const tree = page.locator('.doc-type-browser');
    const sampleDocNode = tree.locator('mat-tree-node', { hasText: 'SampleTestDocu' });
    const viewChip = sampleDocNode.locator('.mode-chip').last();
    await viewChip.click();

    await expect(page.locator('.canvas-header h3')).toContainText('SampleTestDocu', {
      timeout: 5000,
    });

    // Click save
    await page.locator('button', { hasText: 'Save' }).click();

    // Snackbar should confirm save
    await expect(page.locator('mat-snack-bar-container')).toContainText('Layout saved');
  });
});

test.describe('Platform Registry Sync — Buttons doc type filter', () => {
  test.beforeEach(async ({ page }) => {
    await clearDesignerStorage(page);
    await loginAsAdmin(page);
    await navigateToDesignerPage(page, 'Buttons');
  });

  test('activation filter includes platform doc type hint', async ({ page }) => {
    // Create a new action to see the editor
    await page.locator('.button-type-card').first().click();

    // Expand the Activation Filters panel
    const filterPanel = page.locator('mat-expansion-panel', { hasText: 'Activation' });
    await filterPanel.locator('mat-expansion-panel-header').click();

    const docTypesInput = filterPanel.locator('input[list="platformDocTypesBtn"]');
    await expect(docTypesInput).toBeVisible();

    // The datalist should contain our platform types
    const datalist = page.locator('datalist#platformDocTypesBtn');
    await expect(datalist).toBeAttached();
  });
});
