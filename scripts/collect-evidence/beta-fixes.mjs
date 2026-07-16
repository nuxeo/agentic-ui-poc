/**
 * Combined evidence for three beta fixes on branch fix/beta-fixes:
 *
 * 1. NXSAT-199 — Domain creation from Dashboard (+) at repository root
 * 2. Clipboard copy/move — browse folder refreshes without page reload
 * 3. NXSAT-151 — Enter on group/member autocomplete selects suggestion (no prefix chip)
 *
 * Run with:
 *   npm run evidence:collect -- beta-fixes scripts/collect-evidence/beta-fixes.mjs
 */

/** @param {import('@playwright/test').Page} page */
export default async function collectEvidence(page, helpers, _outDir) {
  await helpers.login();

  // ═══════════════════════════════════════════════════════════════════════════
  // Fix 1: NXSAT-199 — Domain creation at repository root
  // ═══════════════════════════════════════════════════════════════════════════
  const domainTitle = `Beta Domain ${Date.now()}`;

  helpers.step('Fix 1 (NXSAT-199): Open Dashboard Create / Import');
  await page.goto(`${helpers.baseUrl}/#/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await helpers.screenshot('fix1-00-dashboard');

  const createFab = page.getByRole('button', { name: 'Create or import' });
  if (!(await createFab.isVisible({ timeout: 5000 }).catch(() => false))) {
    console.warn('\n⚠️  Fix 1: Dashboard Create or import button not found.\n');
  } else {
    await createFab.click();
    await page.waitForTimeout(1000);
    const dialog = page.locator('lib-create-import-dialog');
    await helpers.screenshot('fix1-01-create-dialog', dialog);

    const locationInput = dialog.locator('.location-input');
    const locationValue = await locationInput.inputValue().catch(() => '');
    helpers.step(`Fix 1: location field = "${locationValue}"`);
    await helpers.screenshot('fix1-02-location-root', dialog);

    const domainTypeBtn = dialog.locator('.doctype-tile').filter({ hasText: 'Domain' });
    if (await domainTypeBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await domainTypeBtn.first().click();
      await page.waitForTimeout(1200);
      await helpers.screenshot('fix1-03-domain-form', dialog);

      const titleInput = dialog.locator('mat-form-field').filter({ hasText: 'Title' }).locator('input');
      await titleInput.fill(domainTitle);
      await page.waitForTimeout(500);

      const createBtn = dialog.getByRole('button', { name: 'Create' });
      await page.waitForFunction(
        () => {
          const btn = document.querySelector('lib-create-import-dialog button[color="primary"]');
          return btn instanceof HTMLButtonElement && !btn.disabled;
        },
        { timeout: 10000 },
      );
      await createBtn.click();
      await page.waitForTimeout(3500);

      const errorBanner = dialog.locator('.error-text');
      if (await errorBanner.isVisible({ timeout: 2000 }).catch(() => false)) {
        const errorText = (await errorBanner.textContent())?.trim() ?? '';
        console.warn(`\n⚠️  Fix 1 FAILED: ${errorText}\n`);
        await helpers.screenshot('fix1-04-create-error', dialog);
      } else if (await dialog.isVisible({ timeout: 1500 }).catch(() => false)) {
        await helpers.screenshot('fix1-04-dialog-still-open', dialog);
      } else {
        await helpers.screenshot('fix1-04-create-success');
        helpers.step(`Fix 1 OK: domain "${domainTitle}" created`);
      }
      await helpers.screenshot('fix1-05-after-create-navigation');
    } else {
      console.warn('\n⚠️  Fix 1: Domain type not listed at repository root.\n');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Fix 2: Clipboard copy/move — browse listing refreshes in place
  // ═══════════════════════════════════════════════════════════════════════════
  helpers.step('Fix 2 (clipboard): Browse to folder and add items to clipboard');

  const browsePaths = [
    '/#/browse/default-domain/workspaces',
    '/#/browse/default-domain/UserWorkspaces',
    '/#/browse/default-domain',
  ];

  let rowCheckboxes = page.locator('.browse-table tbody .cell-checkbox mat-checkbox');
  let insideFolder = false;

  for (const browsePath of browsePaths) {
    await page.goto(`${helpers.baseUrl}${browsePath}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    const breadcrumb = await page.locator('sat-breadcrumbs').innerText().catch(() => '');
    insideFolder = breadcrumb.length > 0 && !/^Root\s*$/i.test(breadcrumb.trim());
    rowCheckboxes = page.locator('.browse-table tbody .cell-checkbox mat-checkbox');
    if (insideFolder && (await rowCheckboxes.count()) >= 1) break;
  }

  if (!insideFolder || (await rowCheckboxes.count()) < 1) {
    const folderRows = page.locator('.browse-table tbody tr.browse-row--folder');
    for (let depth = 0; depth < 3 && (await rowCheckboxes.count()) < 1; depth++) {
      if ((await folderRows.count()) === 0) break;
      await folderRows.first().click();
      await page.waitForTimeout(2500);
      rowCheckboxes = page.locator('.browse-table tbody .cell-checkbox mat-checkbox');
    }
  }

  const resultCountBefore = await page.locator('.result-count').textContent().catch(() => '');
  await helpers.screenshot('fix2-00-browse-before-copy');

  const selectable = rowCheckboxes;
  if ((await selectable.count()) >= 1) {
    await selectable.nth(0).click();
    await page.waitForTimeout(600);

    const addClipboardBtn = page.locator('button[aria-label="Add to Clipboard"]').first();
    if (await addClipboardBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addClipboardBtn.click();
      await page.waitForTimeout(800);
      await helpers.screenshot('fix2-01-added-to-clipboard');
    }

    const clipboardNav = page
      .locator('sat-platform-nav-list-item')
      .filter({ hasText: 'Clipboard' })
      .first();
    await clipboardNav.click();
    await page.waitForTimeout(1200);
    await helpers.screenshot('fix2-02-clipboard-drawer');

    const copyBtn = page.locator('.clipboard-action-btn').filter({ hasText: 'Copy' }).first();
    if (await copyBtn.isEnabled({ timeout: 5000 }).catch(() => false)) {
      helpers.step('Fix 2: Click Copy into current browse folder');
      await copyBtn.click();
      await page.waitForTimeout(3500);

      const resultCountAfter = await page.locator('.result-count').textContent().catch(() => '');
      await helpers.screenshot('fix2-03-browse-after-copy-no-refresh');

      const beforeNum = parseInt((resultCountBefore ?? '').replace(/\D/g, ''), 10);
      const afterNum = parseInt((resultCountAfter ?? '').replace(/\D/g, ''), 10);
      if (Number.isFinite(beforeNum) && Number.isFinite(afterNum) && afterNum > beforeNum) {
        helpers.step(`Fix 2 OK: result count ${beforeNum} → ${afterNum} without page refresh`);
      } else {
        console.warn(
          `\n⚠️  Fix 2: result count did not increase (${resultCountBefore} → ${resultCountAfter}). Check screenshots.\n`,
        );
      }

      const emptyClipboard = page.locator('.clipboard-panel').filter({ hasText: 'Clipboard is empty' });
      if (await emptyClipboard.isVisible({ timeout: 3000 }).catch(() => false)) {
        await helpers.screenshot('fix2-04-clipboard-cleared');
      }
    } else {
      console.warn('\n⚠️  Fix 2: Copy button disabled — browse to a folderish container first.\n');
      await helpers.screenshot('fix2-copy-disabled');
    }
  } else {
    console.warn('\n⚠️  Fix 2: No browse rows to select.\n');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Fix 3: NXSAT-151 — Enter selects autocomplete suggestion (no prefix chip)
  // ═══════════════════════════════════════════════════════════════════════════
  helpers.step('Fix 3 (NXSAT-151): Create User — Enter picks group suggestion');

  await page.goto(`${helpers.baseUrl}/#/administration/users-groups`, {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(2000);
  await helpers.screenshot('fix3-00-users-groups');

  await page.getByRole('button', { name: 'New' }).click();
  await page.getByRole('menuitem', { name: 'New user' }).click();
  await page.waitForTimeout(800);

  const groupInput = page.locator('input[name="groupSearch"]');
  if (await groupInput.isVisible({ timeout: 8000 }).catch(() => false)) {
    const searchTerms = ['admin', 'power', 'group', 'member'];
    let groupOption = null;
    let usedTerm = '';

    for (const term of searchTerms) {
      await groupInput.fill(term);
      await page.waitForTimeout(1200);
      const option = page.locator('mat-option').first();
      if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
        groupOption = option;
        usedTerm = term;
        break;
      }
    }

    await helpers.screenshot('fix3-01-group-suggestions');

    if (groupOption) {
      helpers.step(`Fix 3: Press Enter with suggestions visible (searched "${usedTerm}")`);
      await groupInput.press('Enter');
      await page.waitForTimeout(800);
      await helpers.screenshot('fix3-02-after-enter-selection');

      const chipText = ((await page.locator('mat-chip-row').last().textContent()) ?? '').trim();
      const typedLower = usedTerm.toLowerCase();
      const chipLower = chipText.toLowerCase();
      const looksConcatenated =
        chipLower.startsWith(typedLower) &&
        chipLower.length > typedLower.length + 2 &&
        chipLower.includes(typedLower + typedLower);

      if (looksConcatenated) {
        console.warn(`\n⚠️  Fix 3 FAILED: concatenated chip "${chipText}"\n`);
      } else if (chipText.length > 0) {
        helpers.step(`Fix 3 OK: Enter selected suggestion — chip "${chipText}"`);
      } else {
        console.warn('\n⚠️  Fix 3: no chip added after Enter.\n');
      }
    } else {
      console.warn('\n⚠️  Fix 3: No group suggestions visible for any search term.\n');
    }

    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const cancelBtn = page.getByRole('button', { name: 'Cancel' });
    if (await cancelBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cancelBtn.click();
    }
  }

  helpers.step('All beta fix evidence steps complete');
  await helpers.screenshot('fix-final-overview');
}
