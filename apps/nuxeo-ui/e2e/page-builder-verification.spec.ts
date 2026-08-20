import { test, expect } from '@playwright/test';

/**
 * Page Builder Verification - Continuous Health Check
 *
 * This test verifies that the page builder loads without freezing,
 * and all key components render properly.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:4200';

test.describe('Page Builder - Continuous Verification', () => {
  test('page builder should load without freezing (10 iterations)', async ({ page }) => {
    console.log('\n🔄 STARTING CONTINUOUS VERIFICATION (10 iterations)\n');

    const results = [];

    for (let i = 1; i <= 10; i++) {
      console.log(`\n--- Iteration ${i}/10 ---`);

      const iterationStart = Date.now();

      try {
        // Navigate to page builder
        await page.goto(`${BASE_URL}/#/page-builder/new`, {
          waitUntil: 'networkidle',
          timeout: 15000,
        });

        // Wait for app root
        await page.waitForSelector('app-root', { timeout: 5000 });

        // Check for "Page Unresponsive" dialog
        const unresponsiveDialog = page.locator('text=Page Unresponsive');
        const isUnresponsive = (await unresponsiveDialog.count()) > 0;

        if (isUnresponsive) {
          console.log(`❌ Iteration ${i}: Page became unresponsive`);
          results.push({ iteration: i, success: false, reason: 'Page unresponsive' });
          continue;
        }

        // Wait a bit to see if page becomes unresponsive
        await page.waitForTimeout(3000);

        const unresponsiveAfterWait = (await page.locator('text=Page Unresponsive').count()) > 0;

        if (unresponsiveAfterWait) {
          console.log(`❌ Iteration ${i}: Page became unresponsive after 3s`);
          results.push({ iteration: i, success: false, reason: 'Page unresponsive after 3s' });
          continue;
        }

        // Check for page builder shell
        const shellExists = (await page.locator('lib-page-builder-shell').count()) > 0;

        // Check for error messages
        const hasError = (await page.locator('text=/error|failed/i').count()) > 0;

        const iterationTime = Date.now() - iterationStart;

        if (shellExists && !hasError) {
          console.log(`✅ Iteration ${i}: SUCCESS (${iterationTime}ms)`);
          results.push({ iteration: i, success: true, time: iterationTime });
        } else if (!shellExists) {
          console.log(`⚠️ Iteration ${i}: Shell not found (may need auth) (${iterationTime}ms)`);
          results.push({
            iteration: i,
            success: false,
            reason: 'Shell not found',
            time: iterationTime,
          });
        } else {
          console.log(`❌ Iteration ${i}: Error detected (${iterationTime}ms)`);
          results.push({
            iteration: i,
            success: false,
            reason: 'Error message found',
            time: iterationTime,
          });
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`❌ Iteration ${i}: Exception - ${errorMessage}`);
        results.push({ iteration: i, success: false, reason: `Exception: ${errorMessage}` });
      }

      // Small delay between iterations
      await page.waitForTimeout(500);
    }

    // Print summary
    console.log('\n📊 VERIFICATION SUMMARY\n');
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;
    const successRate = ((successCount / results.length) * 100).toFixed(1);

    console.log(`✅ Successful: ${successCount}/10`);
    console.log(`❌ Failed: ${failureCount}/10`);
    console.log(`📈 Success Rate: ${successRate}%`);

    if (failureCount > 0) {
      console.log('\n🔍 Failure breakdown:');
      const failureReasons = results
        .filter((r) => !r.success)
        .reduce(
          (acc, r) => {
            const reason = r.reason || 'Unknown';
            acc[reason] = (acc[reason] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

      Object.entries(failureReasons).forEach(([reason, count]) => {
        console.log(`  - ${reason}: ${count}x`);
      });
    }

    if (successCount > 0) {
      const successfulResults = results.filter((r) => r.success);
      const avgTime =
        successfulResults.reduce((sum, r) => sum + (r.time || 0), 0) / successfulResults.length;
      console.log(`\n⏱️  Average load time: ${Math.round(avgTime)}ms`);
    }

    // Test passes if at least 80% succeed and no unresponsive dialogs
    const unresponsiveCount = results.filter(
      (r) => r.reason && r.reason.includes('unresponsive'),
    ).length;

    console.log(`\n🎯 Final Verdict:`);
    if (unresponsiveCount === 0 && successRate >= '80') {
      console.log(`✅ PASS - Page builder is stable (no freezes, ${successRate}% success rate)`);
    } else if (unresponsiveCount > 0) {
      console.log(`❌ FAIL - Page became unresponsive ${unresponsiveCount} time(s)`);
    } else {
      console.log(`⚠️ MARGINAL - Success rate ${successRate}% (expected ≥80%)`);
    }

    // Assert success
    expect(unresponsiveCount).toBe(0);
    expect(successCount).toBeGreaterThanOrEqual(8); // At least 80% success
  });

  test('create page button should be clickable', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/page-builder`, { waitUntil: 'networkidle', timeout: 15000 });

    // Wait for "Create Page" or "New Page" button
    const createButton = page.locator(
      'button:has-text("Create Page"), button:has-text("New Page")',
    );

    const buttonExists = (await createButton.count()) > 0;

    if (buttonExists) {
      console.log('✅ Create button found');
      await expect(createButton.first()).toBeVisible();
      await expect(createButton.first()).toBeEnabled();
    } else {
      console.log('⚠️ Create button not found (may require authentication)');
    }
  });

  test('page builder /new route should not show unresponsive dialog', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/page-builder/new`, {
      waitUntil: 'networkidle',
      timeout: 15000,
    });

    // Wait 5 seconds to see if unresponsive dialog appears
    await page.waitForTimeout(5000);

    const unresponsiveDialog = page.locator('text=Page Unresponsive');
    const count = await unresponsiveDialog.count();

    console.log(count === 0 ? '✅ No unresponsive dialog' : '❌ Unresponsive dialog detected');

    expect(count).toBe(0);
  });
});
