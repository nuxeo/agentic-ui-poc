#!/usr/bin/env node
/**
 * Reusable evidence runner for agentic-ui-poc bug fixes.
 *
 * Usage:
 *   node scripts/collect-evidence/runner.mjs <ticket-id> <steps-file>
 *
 * Example:
 *   node scripts/collect-evidence/runner.mjs NXSAT-175 scripts/collect-evidence/NXSAT-175.mjs
 *
 * The <steps-file> must export a default async function:
 *   export default async function collectEvidence(page, helpers, outDir) { ... }
 *
 * Output: ~/Desktop/<ticket-id>/  (screenshots + optional video)
 */

import { mkdir } from 'fs/promises';
import { resolve } from 'path';
import { homedir } from 'os';
import { pathToFileURL } from 'url';

// Playwright is a local-only prerequisite, not a tracked dependency of this repo
// (kept out of package.json/package-lock.json so it never affects the CI install).
let chromium;
try {
  ({ chromium } = await import('@playwright/test'));
} catch {
  console.error(
    '\n❌  Playwright is required to collect evidence but is not installed.\n' +
      '   It is intentionally not a tracked dependency. Install it locally:\n\n' +
      '     npm install --no-save @playwright/test\n' +
      '     npx playwright install chromium\n',
  );
  process.exit(1);
}

const [, , ticketId, stepsFile] = process.argv;

if (!ticketId || !stepsFile) {
  console.error('Usage: node runner.mjs <TICKET-ID> <steps-file.mjs>');
  process.exit(1);
}

const outDir = resolve(homedir(), 'Desktop', ticketId);
await mkdir(outDir, { recursive: true });
console.log(`📁  Saving evidence to: ${outDir}`);

const browser = await chromium.launch({
  headless: false,        // show the browser so the team can watch the capture live
  slowMo: 400,            // slow enough to read each step
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: {
    dir: outDir,
    size: { width: 1440, height: 900 },
  },
});

const page = await context.newPage();

/** Shared helpers passed to every steps file */
const helpers = {
  /**
   * Screenshot a named step. File is saved to outDir/<name>.png
   * @param {string} name  - descriptive slug, e.g. "01-state-field-after"
   * @param {import('@playwright/test').Locator} [locator] - optional element to focus before snap
   */
  async screenshot(name, locator) {
    if (locator) {
      await locator.scrollIntoViewIfNeeded().catch(() => {});
    }
    const file = resolve(outDir, `${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log(`  📸  ${name}.png`);
    return file;
  },

  /**
   * Log a step label to stdout so the console mirrors the video.
   * @param {string} msg
   */
  step(msg) {
    console.log(`  ▶  ${msg}`);
  },

  /** Base URL of the running dev server */
  baseUrl: process.env['APP_URL'] ?? 'http://localhost:4200',

  /**
   * Authenticate by injecting the session directly into sessionStorage —
   * the same format the AuthService uses after a successful login.
   *
   * This avoids the Hyland SSO login UI entirely and works for any local
   * Nuxeo instance that accepts Basic auth on /nuxeo/api/v1/me.
   *
   * Credentials come from env (never hardcoded).
   */
  async login() {
    const base = this.baseUrl;
    const user = process.env['NUXEO_USER'] ?? 'Administrator';
    const pass = process.env['NUXEO_PASS'] ?? 'Administrator';

    this.step(`Navigating to ${base} to establish origin`);
    // Navigate to the root so we can write to its sessionStorage
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Compute the Basic token (same as btoa(`${user}:${pass}`) in the browser)
    const basic = Buffer.from(`${user}:${pass}`).toString('base64');

    // Build the session object that AuthService reads from sessionStorage
    const session = {
      kind: 'basic',
      username: user,
      basic,
      isAdministrator: user.toLowerCase() === 'administrator',
      groups: [],
    };

    this.step(`Injecting auth session for ${user} into sessionStorage`);
    await page.evaluate(
      ({ key, value }) => sessionStorage.setItem(key, value),
      { key: 'agentic_ui_nuxeo_session', value: JSON.stringify(session) },
    );

    // Also clear the "signed out" flag so the auth guard doesn't redirect
    await page.evaluate(() => sessionStorage.removeItem('agentic_ui_signed_out'));

    this.step('Session injected — reloading app');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    this.step('Ready');
  },

  /**
   * Navigate directly to a document detail page.
   * @param {string} uid  - Nuxeo document UID
   */
  async goToDoc(uid) {
    await page.goto(`${this.baseUrl}/#/doc/${uid}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
  },
};

// Load the ticket-specific steps file
const stepsUrl = pathToFileURL(resolve(process.cwd(), stepsFile)).href;
const { default: collectEvidence } = await import(stepsUrl);

console.log(`\n🎬  Running evidence collection for ${ticketId}…\n`);
try {
  await collectEvidence(page, helpers, outDir);
  console.log('\n✅  Evidence collection complete.');
} catch (err) {
  console.error('\n❌  Evidence collection failed:', err);
} finally {
  await page.waitForTimeout(1000);
  await context.close(); // flushes the video file
  await browser.close();
  console.log(`\n📂  All files saved to: ${outDir}`);
}
