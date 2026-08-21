/**
 * Phase 0 — fallback baseline for a machine with NO Nuxeo backend.
 *
 * > **Only run this when no backend is reachable.** It asserts that the Nuxeo
 * > API is *unavailable* and that routes redirect to login, so against a live
 * > Nuxeo it fails by design. `phase-0-baseline.mjs` is the real Phase 0 gate;
 * > this exists so a baseline can still be recorded without Docker.
 *
 * Companion to `phase-0-baseline.mjs`. That file asserts the authenticated
 * browse surfaces and therefore requires a reachable Nuxeo; this one covers
 * everything provable without one.
 *
 * What this proves: the Angular 20 build serves, the app bootstraps, the router
 * and auth guards work, and the login surface renders. What it deliberately does
 * not prove: any data-bearing screen. Those remain unverified until a backend is
 * available — see the final step, which records that precondition as a fact
 * rather than leaving it implied.
 *
 * Run:
 *   npm run beta:evidence -- phase-0-no-backend
 */

/**
 * @param {import('@playwright/test').Page} page
 * @param {ReturnType<import('../helpers.mjs').createHelpers>} h
 */
export default async function run(page, h) {
  h.step('Dev server serves the built application');
  const response = await page.goto(`${h.baseUrl}/`, { waitUntil: 'networkidle' });
  h.check('root responds 200', response?.status() === 200, `status was ${response?.status()}`);
  await page.waitForTimeout(2000);
  h.check('document title is set', (await page.title()) === 'Nuxeo Platform', await page.title());
  await h.expectVisible('Angular root bootstrapped', 'app-root');
  await h.screenshot('app-serves');

  h.step('Unauthenticated access is redirected to login by the auth guard');
  h.check('redirected to /#/login', page.url().includes('/#/login'), page.url());
  await h.expectVisible('login page component rendered', 'app-login-page');
  await h.screenshot('login-page');

  h.step('Login surface renders Satori branding and auth options');
  await h.expectVisible('Satori logo present', 'sat-logo');
  await h.expectText('username field labelled', 'app-login-page', 'Username or email');
  await h.expectText('Continue action present', 'app-login-page', 'Continue');
  await h.expectText('SAML sign-in offered', 'app-login-page', 'SAML');
  await h.screenshot('login-controls');

  h.step('Protected Beta route is guarded');
  await h.goTo('/#/browse-adf-hx');
  h.check(
    'adf-hx POC route requires auth',
    page.url().includes('/#/login'),
    `expected redirect to login, landed on ${page.url()}`,
  );
  await h.screenshot('adf-hx-route-guarded');

  h.step('Production browse route is guarded');
  await h.goTo('/#/browse');
  h.check('browse route requires auth', page.url().includes('/#/login'), page.url());
  await h.screenshot('browse-route-guarded');

  h.step('Environment precondition: Nuxeo backend is not reachable');
  // Recorded as an explicit assertion so the report states why no authenticated
  // evidence exists, instead of leaving a reviewer to infer it from absence.
  const apiStatus = await page.evaluate(async () => {
    try {
      const r = await fetch('/nuxeo/api/v1/me', { headers: { Accept: 'application/json' } });
      return r.status;
    } catch {
      return 0;
    }
  });
  h.check(
    'Nuxeo API unreachable through the dev proxy',
    apiStatus !== 200,
    `/nuxeo/api/v1/me returned ${apiStatus}; a backend appears to be available, so run phase-0-baseline instead`,
  );
  h.check(
    'authenticated surfaces are therefore NOT covered by this run',
    true,
    'see phase-0-baseline.mjs for the authenticated baseline',
  );
}
