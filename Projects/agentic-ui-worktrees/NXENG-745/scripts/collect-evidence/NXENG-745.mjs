/**
 * NXENG-745 — Login skip navigation (WCAG 2.4.1 Bypass Blocks).
 */

export const summary =
  'Login exposes a keyboard-focusable skip link that bypasses the logo to the sign-in form';

/** Login evidence must not send Nuxeo httpCredentials or hydration signs in before the form renders. */
export const skipHttpCredentials = true;

export const scenes = [
  {
    act: 1,
    title: 'Open the login page logged out',
    intent: 'A keyboard user arriving at sign-in without an existing session',
    criterion: 'AC-3',
    async run(page, h) {
      await page.context().clearCookies();
      await page.addInitScript(() => {
        sessionStorage.setItem('agentic_ui_signed_out', '1');
        sessionStorage.removeItem('agentic_ui_nuxeo_session');
        localStorage.removeItem('agentic_ui_nuxeo_session');
      });
      await page.goto(`${h.baseUrl}/#/login`, { waitUntil: 'load', timeout: 90000 });
      await page.waitForTimeout(2500);
      await h.expectVisible('username field renders', 'input[formcontrolname="username"]');
      await h.expectVisible('Hyland logo link still present', 'a.login-brand');
      await h.shot('login-layout', { highlight: 'a.login-brand', label: 'Brand link (repeated content)' });
    },
  },
  {
    act: 2,
    title: 'Tab from the document start',
    intent: 'The first focusable control should bypass repeated chrome to sign-in',
    criterion: 'AC-1',
    async run(page, h) {
      const skip = page.locator('a.login-skip-link, a[href="#login-main"]');
      const count = await skip.count();
      h.check('skip link exists for WCAG 2.4.1', count === 1, `found ${count} skip link(s)`);

      await page.keyboard.press('Tab');
      await page.waitForTimeout(400);
      const focusedHref = await page.evaluate(() => {
        const el = document.activeElement;
        return el instanceof HTMLAnchorElement ? el.getAttribute('href') : el?.tagName ?? 'none';
      });
      h.check(
        'first Tab focuses the skip link',
        focusedHref === '#login-main',
        `active element href/tag: ${focusedHref}`,
      );
      await h.shot('first-tab-focus', { highlight: 'a.login-brand', label: 'First Tab target (brand if no skip)' });
    },
  },
  {
    act: 3,
    title: 'Sign-in landmark and skip target',
    intent: 'The form is addressable as the main sign-in block',
    criterion: 'AC-1',
    async run(page, h) {
      const main = page.locator('#login-main');
      h.check('sign-in landmark is present', (await main.count()) === 1, 'missing #login-main');
      if ((await main.count()) === 1) {
        await page.locator('a[href="#login-main"]').click();
        await page.waitForTimeout(200);
        const activeId = await page.evaluate(() => document.activeElement?.id ?? '');
        h.check('skip target receives focus', activeId === 'login-main', `active id: ${activeId}`);
      }
      await h.shot('sign-in-landmark', {
        highlight: 'input[formcontrolname="username"]',
        label: 'Username field',
      });
    },
  },
];
