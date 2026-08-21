/**
 * Phase 6 — WCAG 2.1 AA baseline for the Beta slice.
 *
 * The Beta quality bar includes WCAG 2.1 AA (`docs/adf-hx-beta-plan.md`, Phase 6)
 * and nothing had ever measured it. This establishes where the slice actually
 * stands, surface by surface, so the gap is a number rather than an assumption.
 *
 * Only `serious` and `critical` impacts fail. `minor` and `moderate` findings are
 * recorded as notes on every step — the debt stays visible in `INDEX.md` without
 * making the capture unpassable, which is what would get it bypassed.
 *
 * The **login surface is not covered here**, and that is a harness limitation rather
 * than a choice: the runner sets `httpCredentials` on the browser context, so the
 * app authenticates before the login page can render. The first draft of this file
 * labelled a step "Login surface" and actually scanned the dashboard — a test defect,
 * caught by the selector assertion failing rather than by the scan. `phase-0-baseline`
 * cannot reach it either; `phase-0-no-backend` is the only file that sees login, and
 * only because authentication fails there.
 *
 * ## The ratchet
 *
 * Four rules are currently violated across the slice, listed in `KNOWN_VIOLATIONS`
 * below with a node count each. They are excluded from the verdict so this capture
 * can go green on "no NEW violation", the same bargain the coverage gate strikes.
 * Every one of them is still printed in `INDEX.md` as a note on the step it occurs
 * in, so the debt cannot quietly disappear. Delete entries as they are fixed; never
 * add one without a reason.
 *
 * Prerequisites:
 *   npm install --no-save @axe-core/playwright
 *   npm run beta:backend
 *   npx nx serve nuxeo-ui
 *
 * Run:
 *   npm run beta:evidence -- phase-6-a11y
 */

/**
 * Rules already violated on 2026-08-21, excluded from the verdict so a *new* failure
 * is distinguishable from the existing gap. Each is a Phase 6 work item.
 *
 * - `button-name`     icon-only buttons with no accessible name. Worst offender is
 *                     `#sat-platform-nav-title-icon`, on every surface; production
 *                     browse adds 10 more, including the Nuxeo Drive upload button.
 * - `color-contrast`  `.header-doc-type`, `.result-count`, `.hxp-breadcrumb__current`
 *                     and two dashboard widget labels below 4.5:1.
 * - `role-img-alt`    contributor avatars and folder-row icons carry `role="img"`
 *                     with no alternative text.
 * - `label`           two Material checkbox inputs in production browse with no label.
 */
const KNOWN_VIOLATIONS = ['button-name', 'color-contrast', 'role-img-alt', 'label'];

/**
 * @param {import('@playwright/test').Page} page
 * @param {ReturnType<import('../helpers.mjs').createHelpers>} h
 */
export default async function run(page, h) {
  h.step('Precondition: a backend is reachable, so data-bearing screens can be scanned');
  const probe = await page.request.get(`${h.baseUrl}/nuxeo/api/v1/me`, { failOnStatusCode: false }).catch(() => null);
  h.requirePrecondition(
    'Nuxeo API answers through the dev proxy',
    probe?.status() === 200,
    `/nuxeo/api/v1/me returned ${probe?.status() ?? 'no response'} — an empty screen scans clean and proves nothing. ` +
      'Run `npm run beta:backend` first.',
  );

  h.step('Landing surface after authentication');
  await page.goto(`${h.baseUrl}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await h.expectVisible('app shell rendered', 'app-shell');
  await h.expectNoA11yViolations('landing: no new WCAG 2.1 AA violations', { ignore: KNOWN_VIOLATIONS });
  await h.screenshot('a11y-landing');
  h.note('the pre-auth login surface — unreachable here because the runner sets httpCredentials');

  h.step('Production browse — the primary authenticated surface');
  await h.login();
  await h.goTo('/#/browse');
  await h.expectVisible('browse page rendered', 'lib-browse');
  await h.expectText('repository content listed', 'lib-browse', 'Default domain');
  await h.expectNoA11yViolations('browse: no new WCAG 2.1 AA violations', { ignore: KNOWN_VIOLATIONS });
  await h.screenshot('a11y-browse');

  h.step('adf-hx POC browse — the surface Phase 3 will replace');
  await h.goTo('/#/browse-adf-hx');
  await h.expectVisible('POC page rendered', 'lib-browse-adf-hx-poc');
  await h.expectVisible('hxp document list present', 'hxp-document-list');
  await h.expectNoA11yViolations('adf-hx browse: no new WCAG 2.1 AA violations', { ignore: KNOWN_VIOLATIONS });
  await h.screenshot('a11y-browse-adf-hx');

  h.step('Keyboard reachability of the primary navigation');
  // Distinct from an axe scan: axe checks markup, this checks that a keyboard user
  // can actually get to the nav. A focusable element behind a pointer-only handler
  // passes every static rule.
  await page.keyboard.press('Tab');
  const firstFocus = await page.evaluate(() => {
    const el = document.activeElement;
    return el ? `${el.tagName.toLowerCase()}${el.getAttribute('aria-label') ? `[${el.getAttribute('aria-label')}]` : ''}` : 'none';
  });
  h.check('Tab moves focus into the page', firstFocus !== 'none' && firstFocus !== 'body', `focus landed on ${firstFocus}`);
  await h.screenshot('a11y-keyboard-focus');

  h.step('Health');
  h.expectNoConsoleErrors('no unexpected browser console errors', [
    /automation\/AI\./,
    '/nuxeo/logout',
    '/nuxeo/api/v1/path/default-domain/config/agentic-ui',
    '/agentic-ui-config/bootstrap.json',
  ]);
}
