/**
 * NXSAT-194 — Login page Web UI parity + autofill-safe submit button.
 *
 * Run:
 *   NUXEO_USER=<user> NUXEO_PASS=<pass> npm run evidence:collect -- NXSAT-194 scripts/collect-evidence/NXSAT-194.mjs
 *
 * Requires: npx nx serve nuxeo-ui + local Nuxeo reachable for post-login screenshot.
 */

/** @param {import('@playwright/test').Page} page */
export default async function collectEvidence(page, helpers, _outDir) {
  const base = helpers.baseUrl;
  const user = process.env['NUXEO_USER'];
  const pass = process.env['NUXEO_PASS'];
  if (!user || !pass) {
    throw new Error('Set NUXEO_USER and NUXEO_PASS before collecting login evidence.');
  }

  helpers.step('Open login page (clear any prior session)');
  await page.context().clearCookies();
  await page.goto(`${base}/#/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.removeItem('agentic_ui_nuxeo_session');
    localStorage.removeItem('agentic_ui_last_username');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.getByLabel('Username', { exact: true }).waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForTimeout(1500);
  await helpers.screenshot('01-login-web-ui-parity');

  const bodyText = await page.locator('.login-panel-inner').innerText();
  const removed = ['Forgot Password?', 'Remember Me', 'Azure SAML', 'Okta SAML'];
  for (const label of removed) {
    if (bodyText.includes(label)) {
      console.warn(`  ⚠️  Expected "${label}" to be absent on login page`);
    }
  }

  helpers.step('Single-step form: Username + Password + Log in');
  const username = page.getByLabel('Username', { exact: true });
  const password = page.getByLabel('Password', { exact: true });
  const submit = page.getByRole('button', { name: 'Log in' });

  await username.fill(user);
  await password.fill(pass);
  await page.waitForTimeout(800);

  const disabled = await submit.isDisabled();
  if (disabled) {
    console.warn('  ⚠️  Log in button still disabled after filling credentials');
  }
  await helpers.screenshot('02-credentials-filled-button-state');

  helpers.step('Submit login');
  await submit.click();
  await page.waitForURL(/#\/(dashboard|browse)/, { timeout: 20000 });
  await page.waitForTimeout(2000);
  await helpers.screenshot('03-after-successful-login');
}
