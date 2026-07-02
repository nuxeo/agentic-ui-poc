/**
 * Live browser QA for NXSAT-159 permission notification flows.
 *
 * Run (headed, watch the browser):
 *   $env:NUXEO_TEST_USER="Administrator"
 *   $env:NUXEO_TEST_PASSWORD="Administrator"
 *   node apps/nuxeo-ui/e2e/permission-notification.mjs
 *
 * Requires: nx serve nuxeo-ui (:4200) and Nuxeo (:8080)
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.AGENTIC_UI_BASE_URL ?? 'http://localhost:4200';
const NUXEO = process.env.NUXEO_BASE_URL ?? 'http://localhost:8080/nuxeo';
const user = process.env.NUXEO_TEST_USER ?? 'Administrator';
const pass = process.env.NUXEO_TEST_PASSWORD ?? 'Administrator';
const HEADED = process.env.AGENTIC_UI_HEADED !== '0';
const SLOW_MO = Number(process.env.AGENTIC_UI_SLOW_MO ?? (HEADED ? 600 : 0));
const DOC_UID =
  process.env.NUXEO_TEST_DOC_UID ?? '609dffbe-7fab-4213-a743-b685a3eb0019';
const SHOT_DIR = path.join(__dirname, 'screenshots', 'nxsat-159');

const results = [];

function log(step, status, detail = '') {
  const line = `[${status}] ${step}${detail ? ` — ${detail}` : ''}`;
  console.log(line);
  results.push({ step, status, detail });
}

async function shot(page, name) {
  await mkdir(SHOT_DIR, { recursive: true });
  const file = path.join(SHOT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function nuxeoFetch(pathname, init = {}) {
  const auth = Buffer.from(`${user}:${pass}`).toString('base64');
  const res = await fetch(`${NUXEO}${pathname}`, {
    ...init,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${pathname} → ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function suggestPrincipal(term) {
  const data = await nuxeoFetch('/api/v1/automation/UserGroup.Suggestion', {
    method: 'POST',
    body: JSON.stringify({
      params: { searchTerm: term, searchType: 'USER_GROUP_TYPE' },
      context: {},
    }),
  });
  return Array.isArray(data) ? data : [];
}

async function login(page) {
  await page.goto(`${BASE}/#/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  const username = page.locator('input[autocomplete="username"]');
  await username.waitFor({ state: 'visible', timeout: 60_000 });
  await username.fill(user);
  await page.getByRole('button', { name: 'Continue' }).click();
  const password = page.locator('input[autocomplete="current-password"]');
  await password.waitFor({ state: 'visible', timeout: 20_000 });
  await password.fill(pass);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForURL(/#\/(dashboard|browse|doc)/, { timeout: 60_000 });
}

async function ensurePermissionsTab(page) {
  const tab = page.getByRole('tab', { name: 'Permissions' });
  await tab.waitFor({ state: 'visible', timeout: 30_000 });
  await tab.click();
  await page.getByText('Permissions defined locally').waitFor({ state: 'visible', timeout: 30_000 });
}

async function openPermissionsTab(page, contextLabel) {
  await page.goto(`${BASE}/#/doc/${DOC_UID}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await ensurePermissionsTab(page);
  await shot(page, `${contextLabel}-01-permissions-tab`);
}

async function waitForSnackbar(page, pattern, timeout = 15_000) {
  const snack = page.locator('.mat-mdc-snack-bar-container');
  await snack.waitFor({ timeout });
  const text = (await snack.textContent()) ?? '';
  if (!pattern.test(text)) {
    throw new Error(`Snackbar mismatch. Expected ${pattern}, got: ${text}`);
  }
  return text.trim();
}

async function dismissSnackbar(page) {
  const snack = page.locator('.mat-mdc-snack-bar-container');
  if (await snack.isVisible().catch(() => false)) {
    const action = snack.getByRole('button', { name: /Dismiss|OK/i });
    if (await action.isVisible().catch(() => false)) {
      await action.click();
    }
    await snack.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
  }
}

async function openAddPermissionDialog(page) {
  const section = page.locator('section').filter({ hasText: 'Permissions defined locally' });
  await section.getByRole('button', { name: 'New' }).click();
  await page.getByRole('heading', { name: 'Add a Permission' }).waitFor();
}

async function pickPrincipal(page, searchTerm) {
  const suggestions = await suggestPrincipal(searchTerm);
  if (!suggestions.length) {
    throw new Error(`No principal found for search "${searchTerm}"`);
  }
  const pick = suggestions[0];
  const dialog = page.locator('mat-dialog-container');
  await dialog.getByLabel('User / Group').fill(pick.displayLabel ?? pick.id);
  await page.locator('mat-option').first().waitFor({ timeout: 10_000 });
  await page.locator('mat-option').first().click();
  return pick.id;
}

async function scenarioMailHint(page) {
  const step = '1. SMTP mail hint in Add Permission dialog';
  try {
    await openAddPermissionDialog(page);
    const hint = page.locator('mat-dialog-container .mail-hint');
    await hint.waitFor();
    const text = await hint.textContent();
    if (!text?.includes('SMTP')) {
      throw new Error(`Hint missing SMTP text: ${text}`);
    }
    await shot(page, '02-add-permission-smtp-hint');
    await page.getByRole('button', { name: 'Cancel' }).click();
    log(step, 'PASS', text.trim().slice(0, 80));
  } catch (err) {
    await shot(page, '02-add-permission-smtp-hint-FAIL');
    log(step, 'FAIL', err.message);
    throw err;
  }
}

async function scenarioAddWithNotify(page, principalTerm, notify, screenshotPrefix) {
  const step = notify
    ? '2. Add permission with notify ON'
    : '3. Add permission with notify OFF';
  try {
    await openAddPermissionDialog(page);
    await pickPrincipal(page, principalTerm);
    const dialog = page.locator('mat-dialog-container');
    const checkbox = dialog.getByRole('checkbox', { name: /Send an email/i });
    const checked = await checkbox.isChecked();
    if (notify !== checked) {
      await checkbox.click();
    }
    if (notify) {
      await dialog.locator('textarea').fill('NXSAT-159 e2e notification comment');
    }
    await dialog.getByRole('button', { name: 'Create', exact: true }).click();
    if (notify) {
      const text = await waitForSnackbar(page, /notification sent|could not be sent/i);
      await shot(page, screenshotPrefix);
      await dismissSnackbar(page);
      await page.locator('mat-dialog-container').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => undefined);
      await ensurePermissionsTab(page);
      log(step, 'PASS', text.replace(/\s+/g, ' ').trim());
    } else {
      await page.locator('mat-dialog-container').waitFor({ state: 'hidden', timeout: 15_000 });
      await page.waitForTimeout(500);
      const snackVisible = await page
        .locator('.mat-mdc-snack-bar-container')
        .isVisible()
        .catch(() => false);
      await shot(page, screenshotPrefix);
      if (snackVisible) {
        const text = await page.locator('.mat-mdc-snack-bar-container').textContent();
        if (text?.includes('notification sent')) {
          throw new Error('Unexpected notification snackbar when notify is off');
        }
      }
      await ensurePermissionsTab(page);
      log(step, 'PASS', 'Dialog closed without notification-sent snackbar');
    }
  } catch (err) {
    await shot(page, `${screenshotPrefix}-FAIL`);
    log(step, 'FAIL', err.message);
    throw err;
  }
}

async function scenarioCreateAndAddAnother(page) {
  const step = '4. Create and add another';
  try {
    await openAddPermissionDialog(page);
    await pickPrincipal(page, 'power');
    const dialog = page.locator('mat-dialog-container');
    await dialog.getByRole('button', { name: 'Create And Add Another' }).click();
    const text = await waitForSnackbar(page, /notification sent|could not be sent/i);
    await shot(page, '05-create-and-add-another');
    await dismissSnackbar(page);
    await page.getByRole('heading', { name: 'Add a Permission' }).waitFor();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await ensurePermissionsTab(page);
    log(step, 'PASS', text.replace(/\s+/g, ' ').trim());
  } catch (err) {
    await shot(page, '05-create-and-add-another-FAIL');
    log(step, 'FAIL', err.message);
    throw err;
  }
}

async function scenarioUpdatePermission(page) {
  const step = '5. Update local permission with notify';
  try {
    const section = page.locator('section').filter({ hasText: 'Permissions defined locally' });
    await section.locator('button[aria-label="Edit permission"], button[matTooltip="Edit"]').first().click();
    const dialog = page.locator('mat-dialog-container');
    await dialog.getByRole('heading', { name: 'Update Permission' }).waitFor();
    const notify = dialog.getByRole('checkbox', { name: /Send an email/i });
    if (!(await notify.isChecked())) {
      await notify.click();
    }
    await dialog.locator('textarea').fill('Updated access — NXSAT-159 e2e');
    await dialog.getByRole('button', { name: 'Update' }).click();
    const text = await waitForSnackbar(page, /updated|could not be sent/i);
    await shot(page, '06-update-permission');
    await dismissSnackbar(page);
    await ensurePermissionsTab(page);
    log(step, 'PASS', text.replace(/\s+/g, ' ').trim());
  } catch (err) {
    await shot(page, '06-update-permission-FAIL');
    log(step, 'FAIL', err.message);
    throw err;
  }
}

async function scenarioShareExternal(page) {
  const step = '6. Share with external user + SMTP hint';
  try {
    const section = page.locator('section').filter({
      hasText: 'Permissions Assigned to External Users',
    });
    await section.getByRole('button', { name: 'New' }).click();
    const dialog = page.locator('mat-dialog-container');
    await dialog.getByRole('heading', { name: 'Share With External User' }).waitFor();
    const hint = dialog.locator('.mail-hint');
    const hintText = await hint.textContent();
    if (!hintText?.includes('SMTP')) {
      throw new Error('External share dialog missing SMTP hint');
    }
    const email = `nxsat159-e2e-${Date.now()}@example.com`;
    await dialog.getByLabel('Email').fill(email);
    await dialog.getByLabel('To').fill('12/31/2027');
    await dialog.locator('textarea').fill('External share — NXSAT-159 e2e');
    await shot(page, '07-share-external-dialog');
    await dialog.getByRole('button', { name: 'Create', exact: true }).click();
    const text = await waitForSnackbar(page, /notification sent|could not be sent/i);
    await shot(page, '08-share-external-result');
    await dismissSnackbar(page);
    await ensurePermissionsTab(page);
    log(step, 'PASS', `${text.replace(/\s+/g, ' ').trim()} (${email})`);
    return email;
  } catch (err) {
    await shot(page, '07-share-external-FAIL');
    log(step, 'FAIL', err.message);
    throw err;
  }
}

async function scenarioResendExternal(page, contextLabel) {
  const step = `7. Resend notification (${contextLabel})`;
  try {
    const section = page.locator('section').filter({
      hasText: 'Permissions Assigned to External Users',
    });
    const emailBtn = section.locator('button[matTooltip="Send notification email"]').first();
    await emailBtn.waitFor({ timeout: 10_000 });
    await emailBtn.click();
    const text = await waitForSnackbar(page, /Notification email sent|could not be sent/i);
    await shot(page, `09-resend-${contextLabel}`);
    await dismissSnackbar(page);
    log(step, 'PASS', text);
  } catch (err) {
    await shot(page, `09-resend-${contextLabel}-FAIL`);
    log(step, 'FAIL', err.message);
    throw err;
  }
}

async function scenarioBrowsePermissions(page) {
  const step = '8. Browse view — Permissions tab';
  try {
    await page.goto(`${BASE}/#/browse/default-domain/workspaces/Akshitha`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await page.getByText('Nuxeo Knowledge Discovery', { exact: false }).first().waitFor({
      state: 'visible',
      timeout: 30_000,
    });
    await page.getByText('Nuxeo Knowledge Discovery', { exact: false }).first().click();
    await page.waitForTimeout(2000);
    await page.getByRole('tab', { name: 'Permissions' }).click();
    await page.getByText('Permissions defined locally').waitFor({ timeout: 30_000 });
    await shot(page, '10-browse-permissions-tab');
    log(step, 'PASS', 'Browse permissions tab loaded');
  } catch (err) {
    await shot(page, '10-browse-permissions-FAIL');
    log(step, 'FAIL', err.message);
    throw err;
  }
}

async function writeReport() {
  const reportPath = path.join(SHOT_DIR, 'report.json');
  await writeFile(reportPath, JSON.stringify({ results, docUid: DOC_UID, baseUrl: BASE }, null, 2));
  console.log(`\nScreenshots: ${SHOT_DIR}`);
  console.log(`Report: ${reportPath}`);
}

async function main() {
  await mkdir(SHOT_DIR, { recursive: true });
  console.log(`\nNXSAT-159 permission notification — live browser QA`);
  console.log(`UI: ${BASE}  |  Nuxeo: ${NUXEO}  |  Doc: ${DOC_UID}`);
  console.log(`Mode: ${HEADED ? 'HEADED (watch the browser)' : 'headless'}\n`);

  const browser = await chromium.launch({ headless: !HEADED, slowMo: SLOW_MO });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await login(page);
    log('Login', 'PASS', user);
    await shot(page, '00-dashboard');

    await openPermissionsTab(page, 'doc-detail');
    await scenarioMailHint(page);
    await scenarioAddWithNotify(page, 'member', true, '03-add-notify-on');
    await scenarioAddWithNotify(page, 'admin', false, '04-add-notify-off');
    await scenarioCreateAndAddAnother(page);
    await scenarioUpdatePermission(page);
    await scenarioShareExternal(page);
    await scenarioResendExternal(page, 'doc-detail');
    await scenarioBrowsePermissions(page);
    await scenarioResendExternal(page, 'browse');

    const failed = results.filter((r) => r.status === 'FAIL');
    await writeReport();
    if (failed.length) {
      console.error(`\n${failed.length} scenario(s) failed.`);
      process.exit(1);
    }
    console.log('\nAll NXSAT-159 browser scenarios passed.');
    if (HEADED) {
      console.log('Browser stays open 8s so you can inspect the final state…');
      await page.waitForTimeout(8000);
    }
  } catch (error) {
    await shot(page, 'FAIL-final-state').catch(() => undefined);
    await writeReport();
    console.error('\nRun aborted:', error.message);
    if (HEADED) {
      await page.waitForTimeout(8000);
    }
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
