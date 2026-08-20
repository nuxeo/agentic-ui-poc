import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4200';

test('DRAG AND DROP DEBUG - Find the real issue', async ({ page }) => {
  console.log('\n🔍 DEBUGGING DRAG-AND-DROP\n');

  // Navigate
  await page.goto(`${BASE_URL}/#/page-builder/new`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Take screenshot of initial state
  await page.screenshot({ path: '/tmp/page-builder-initial.png', fullPage: true });
  console.log('📸 Screenshot saved: /tmp/page-builder-initial.png');

  // Check for palette
  const palette = page.locator('lib-page-palette');
  const paletteExists = (await palette.count()) > 0;
  console.log(`Palette exists: ${paletteExists}`);

  // Check for tiles
  const tiles = page.locator('.tile-card');
  const tileCount = await tiles.count();
  console.log(`Tile count: ${tileCount}`);

  if (tileCount === 0) {
    console.log('❌ NO TILES FOUND - This is the problem!');
    const bodyText = await page.locator('body').textContent();
    console.log('Body contains "no page tiles":', bodyText?.includes('no page tiles'));
    return;
  }

  // Check if tiles are draggable
  const firstTile = tiles.first();
  const hasCdkDrag = await firstTile.evaluate((el) => el.hasAttribute('cdkdrag'));
  console.log(`First tile has cdkDrag: ${hasCdkDrag}`);

  // Check for grid editor
  const gridEditor = page.locator('lib-page-grid-editor');
  const gridExists = (await gridEditor.count()) > 0;
  console.log(`Grid editor exists: ${gridExists}`);

  // Check for drop list
  const dropList = page.locator('[cdkdroplist]');
  const dropListCount = await dropList.count();
  console.log(`Drop lists found: ${dropListCount}`);

  // Check for drop list group
  const dropListGroup = page.locator('[cdkdroplistgroup]');
  const groupCount = await dropListGroup.count();
  console.log(`Drop list groups found: ${groupCount}`);

  // Try to get bounding boxes
  const tileBox = await firstTile.boundingBox();
  console.log(`Tile position:`, tileBox);

  if (gridExists) {
    const gridBox = await gridEditor.boundingBox();
    console.log(`Grid position:`, gridBox);
  }

  // Attempt drag
  console.log('\n🎯 ATTEMPTING DRAG...\n');

  try {
    const gridContainer = page.locator('.grid-container').first();
    const gridBox = await gridContainer.boundingBox();

    if (tileBox && gridBox) {
      // Drag from tile to grid center
      await page.mouse.move(tileBox.x + tileBox.width / 2, tileBox.y + tileBox.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(500);

      await page.mouse.move(gridBox.x + 200, gridBox.y + 200, { steps: 10 });
      await page.waitForTimeout(500);

      await page.screenshot({ path: '/tmp/page-builder-dragging.png', fullPage: true });
      console.log('📸 Screenshot during drag: /tmp/page-builder-dragging.png');

      await page.mouse.up();
      await page.waitForTimeout(1000);

      await page.screenshot({ path: '/tmp/page-builder-after-drop.png', fullPage: true });
      console.log('📸 Screenshot after drop: /tmp/page-builder-after-drop.png');

      // Check if tile appeared in grid
      const gridTiles = page.locator('.grid-tile');
      const gridTileCount = await gridTiles.count();
      console.log(`\n✅ Grid tiles after drop: ${gridTileCount}`);

      if (gridTileCount === 0) {
        console.log('❌ DROP FAILED - Tile did not appear in grid!');

        // Check console errors
        page.on('console', (msg) => console.log('BROWSER:', msg.text()));
        page.on('pageerror', (err) => console.log('ERROR:', err.message));
      } else {
        console.log('✅ SUCCESS - Tile appeared in grid!');
      }
    }
  } catch (error) {
    console.log('❌ ERROR during drag:', error);
  }
});
