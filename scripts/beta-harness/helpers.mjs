/**
 * Page helpers shared by the Beta phase evidence harness.
 *
 * The `screenshot`, `step`, `login`, `goToDoc` and `baseUrl` members are a
 * deliberate superset of the contract in `scripts/collect-evidence/runner.mjs`,
 * so existing ticket steps files can be reused verbatim by the phase runner.
 *
 * The additions are the verification members — `check`, `expectVisible`,
 * `expectText`, `expectNoConsoleErrors`. A capture that records whatever
 * happened to be on screen proves nothing; every phase step must assert
 * something before it photographs it.
 */

import { resolve } from 'node:path';

const DEFAULT_BASE_URL = 'http://localhost:4200';
const SESSION_KEY = 'agentic_ui_nuxeo_session';
const SIGNED_OUT_KEY = 'agentic_ui_signed_out';

/**
 * @typedef {object} StepRecord
 * @property {number} index
 * @property {string} label
 * @property {string[]} screenshots
 * @property {{ name: string, passed: boolean, detail?: string }[]} checks
 */

/**
 * Build the helpers object handed to a steps file.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} outDir absolute directory for screenshots
 * @param {object} recorder
 * @param {StepRecord[]} recorder.steps accumulating step records
 * @param {string[]} recorder.consoleErrors captured browser console errors
 */
export function createHelpers(page, outDir, recorder) {
  let current = null;

  function ensureStep() {
    if (!current) {
      current = { index: recorder.steps.length + 1, label: 'unlabelled', screenshots: [], checks: [] };
      recorder.steps.push(current);
    }
    return current;
  }

  return {
    baseUrl: process.env['APP_URL'] ?? DEFAULT_BASE_URL,

    /**
     * Open a new named step. Everything captured or asserted afterwards is
     * attributed to it, so the manifest reads as a narrative.
     * @param {string} msg
     */
    step(msg) {
      current = { index: recorder.steps.length + 1, label: msg, screenshots: [], checks: [] };
      recorder.steps.push(current);
      console.log(`\n[step ${current.index}] ${msg}`);
    },

    /**
     * Capture a screenshot into the phase output directory.
     * @param {string} name descriptive slug, e.g. "browse-tree-expanded"
     * @param {import('@playwright/test').Locator} [locator] scrolled into view first
     * @returns {Promise<string>} absolute file path
     */
    async screenshot(name, locator) {
      const s = ensureStep();
      const slug = `${String(s.index).padStart(2, '0')}-${name}`;
      if (locator) {
        await locator.scrollIntoViewIfNeeded().catch(() => {});
      }
      const file = resolve(outDir, `${slug}.png`);
      await page.screenshot({ path: file, fullPage: false });
      s.screenshots.push(`${slug}.png`);
      console.log(`  [shot] ${slug}.png`);
      return file;
    },

    /**
     * Record a named pass/fail assertion against the current step.
     * Never throws — the run continues so that the evidence set stays complete
     * and every failure is visible in one report rather than only the first.
     * @param {string} name
     * @param {boolean} condition
     * @param {string} [detail] shown in the report when the check fails
     */
    check(name, condition, detail) {
      const s = ensureStep();
      const passed = Boolean(condition);
      s.checks.push({ name, passed, ...(detail && !passed ? { detail } : {}) });
      console.log(`  [${passed ? 'pass' : 'FAIL'}] ${name}${passed || !detail ? '' : ` - ${detail}`}`);
      return passed;
    },

    /**
     * Assert a selector becomes visible, then record the result.
     * @param {string} name
     * @param {string} selector
     * @param {number} [timeout]
     */
    async expectVisible(name, selector, timeout = 10_000) {
      try {
        await page.locator(selector).first().waitFor({ state: 'visible', timeout });
        return this.check(name, true);
      } catch {
        return this.check(name, false, `selector not visible within ${timeout}ms: ${selector}`);
      }
    },

    /**
     * Assert that a selector's text contains an expected substring.
     * @param {string} name
     * @param {string} selector
     * @param {string} expected
     */
    async expectText(name, selector, expected) {
      try {
        const actual = (await page.locator(selector).first().innerText({ timeout: 10_000 })).trim();
        return this.check(name, actual.includes(expected), `expected "${expected}" in "${actual}"`);
      } catch {
        return this.check(name, false, `could not read text of ${selector}`);
      }
    },

    /**
     * Assert nothing was logged to the browser console as an error during the
     * run so far. Catches the class of regression a screenshot cannot show.
     *
     * `ignore` exists for errors that are genuinely environmental — a service
     * the local instance does not provide, for example. Every ignored error is
     * still counted and reported, so suppressions stay visible rather than
     * quietly hiding a regression.
     *
     * @param {string} [name]
     * @param {(string|RegExp)[]} [ignore] patterns matched against the error text
     */
    expectNoConsoleErrors(name = 'no browser console errors', ignore = []) {
      const matches = (text) =>
        ignore.some((p) => (typeof p === 'string' ? text.includes(p) : p.test(text)));
      const all = recorder.consoleErrors;
      const ignored = all.filter(matches);
      const unexpected = all.filter((e) => !matches(e));
      if (ignored.length) {
        console.log(`  [note] ${ignored.length} console error(s) ignored by pattern`);
      }
      const suffix = ignored.length ? ` (${ignored.length} ignored by pattern)` : '';
      return this.check(
        name,
        unexpected.length === 0,
        `${unexpected.length} unexpected error(s)${suffix}: ${unexpected.slice(0, 3).join(' | ')}`,
      );
    },

    /**
     * Navigate to an app route, e.g. `/#/browse-adf-hx?path=%2Fdefault-domain`.
     * @param {string} route
     */
    async goTo(route) {
      const url = route.startsWith('http') ? route : `${this.baseUrl}${route}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1200);
    },

    /**
     * Navigate directly to a document detail page.
     * @param {string} uid Nuxeo document UID
     */
    async goToDoc(uid) {
      await this.goTo(`/#/doc/${uid}`);
    },

    /**
     * Authenticate by injecting the session `AuthService` writes after a
     * successful login, avoiding the SSO UI. Credentials come from the
     * environment and are never hardcoded.
     *
     * This satisfies the **route guard** only. XHRs are authenticated by the
     * browser context's `httpCredentials`, set in the runner — without that,
     * `/nuxeo/api` calls intermittently return 403 even though pages render.
     * Both mechanisms are required.
     */
    async login() {
      const user = process.env['NUXEO_USER'] ?? 'Administrator';
      const pass = process.env['NUXEO_PASS'] ?? 'Administrator';

      await page.goto(this.baseUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);

      const session = {
        kind: 'basic',
        username: user,
        basic: Buffer.from(`${user}:${pass}`).toString('base64'),
        isAdministrator: user.toLowerCase() === 'administrator',
        groups: [],
      };

      await page.evaluate(
        ({ key, value, signedOutKey }) => {
          sessionStorage.setItem(key, value);
          sessionStorage.removeItem(signedOutKey);
        },
        { key: SESSION_KEY, value: JSON.stringify(session), signedOutKey: SIGNED_OUT_KEY },
      );

      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(1200);
    },
  };
}
