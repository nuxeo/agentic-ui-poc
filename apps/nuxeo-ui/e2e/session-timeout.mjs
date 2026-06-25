/**
 * Manual QA script for NXSAT-157 session timeout.
 * Run: node apps/nuxeo-ui/e2e/session-timeout.mjs
 * Requires: nx serve nuxeo-ui (4200) and Nuxeo (8080)
 */
import { chromium } from 'playwright';

const BASE = process.env.AGENTIC_UI_BASE_URL ?? 'http://localhost:4200';
const user = process.env.NUXEO_TEST_USER ?? 'Administrator';
const pass = process.env.NUXEO_TEST_PASSWORD ?? 'Administrator';
const DEBUG_TIMEOUT_MS = '8000';

async function login(page) {
  await page.goto(`${BASE}/#/login`);
  await page.getByLabel('Username or email').fill(user);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Password').fill(pass);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForURL(/#\/dashboard/, { timeout: 20_000 });
}

async function testSessionExpiredSnackbar(page) {
  await page.goto(`${BASE}/#/login?reason=session-expired`);
  const snackbar = page.locator('.mat-mdc-snack-bar-container');
  await snackbar.waitFor({ timeout: 10_000 });
  const text = await snackbar.textContent();
  if (!text?.includes('Your session has expired')) {
    throw new Error(`Expected session-expired snackbar, got: ${text}`);
  }
  console.log('PASS: session-expired snackbar on login page');
}

async function testIdleWarningAndStaySignedIn(browser) {
  const context = await browser.newContext();
  await context.addInitScript((timeoutMs) => {
    sessionStorage.setItem('agentic_ui_debug_idle_timeout_ms', timeoutMs);
  }, DEBUG_TIMEOUT_MS);
  const page = await context.newPage();

  await login(page);
  await page.waitForTimeout(5_500);
  await page.getByRole('heading', { name: 'Session expiring' }).waitFor({ timeout: 5_000 });
  await page.getByRole('button', { name: 'Stay signed in' }).click();
  await page.waitForTimeout(1_000);
  if (!page.url().includes('#/dashboard')) {
    throw new Error('Expected to remain on dashboard after staying signed in');
  }
  console.log('PASS: idle warning dialog and stay signed in');
  await context.close();
}

async function testIdleLogout(browser) {
  const context = await browser.newContext();
  await context.addInitScript((timeoutMs) => {
    sessionStorage.setItem('agentic_ui_debug_idle_timeout_ms', timeoutMs);
  }, DEBUG_TIMEOUT_MS);
  const page = await context.newPage();

  await login(page);
  await page.waitForURL(/#\/login(\?.*)?$/, { timeout: 15_000 });
  const snackbar = page.locator('.mat-mdc-snack-bar-container');
  await snackbar.waitFor({ timeout: 10_000 });
  const text = await snackbar.textContent();
  if (!text?.includes('Your session has expired')) {
    throw new Error(`Expected session-expired snackbar after idle logout, got: ${text}`);
  }
  console.log('PASS: idle timeout logout and redirect to login');
  await context.close();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await testSessionExpiredSnackbar(page);
    await testIdleWarningAndStaySignedIn(browser);
    await testIdleLogout(browser);
    console.log('\nAll session timeout application checks passed.');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('\nSession timeout application test failed:', error);
  process.exit(1);
});
