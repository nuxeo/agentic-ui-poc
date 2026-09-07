import { expect, test } from '@playwright/test';

/**
 * The route guards, tested **without** the `signedIn` fixture.
 *
 * Every other spec injects a session, which is the right trade — driving the form in each
 * one would make sign-in the slowest and most repeated assertion in the suite. But that
 * leaves the guards themselves untested, and an unguarded app is a security defect rather
 * than a cosmetic one. So they are covered here, once, on purpose. `test` comes from
 * Playwright directly because the fixture's whole job is to defeat what this file asserts.
 *
 * ## Why "an unauthenticated visitor is redirected" is NOT asserted here
 *
 * It was, in the first version, and it failed — for a reason worth recording rather than
 * patching around.
 *
 * The local Nuxeo has **anonymous authentication enabled**: `GET /nuxeo/api/v1/me` with no
 * credentials at all returns HTTP 200 and `{ id: 'Anonymous' }`, both through the dev proxy
 * and directly on :8080. With no stored session, `AuthService.runHydration()` falls through
 * to `tryEstablishCookieSessionOnly()`, which probes `/me` — the intentional SSO-detection
 * path, because an SSO cookie is how a real deployment signs a user in without a form. The
 * server says "you are Anonymous", the app believes it, and `isAuthenticated()` is true.
 *
 * So the app behaved correctly and `authGuard` is sound; the *environment* makes an
 * unauthenticated visitor unobservable. Removing `httpCredentials` did not help, because the
 * credentials were never what made `/me` succeed. Asserting a redirect that this server can
 * never produce would be a permanently red test, and skipping it would be coverage that is
 * not there.
 *
 * What is asserted instead are the two guard behaviours that *are* observable, and both are
 * real:
 *
 *   1. an explicitly signed-out visitor IS redirected — `runHydration()` short-circuits on
 *      the sign-out flag and clears state, so this exercises the guard's redirect for real;
 *   2. Anonymous is NOT granted administration access — the privilege boundary, which
 *      matters more here precisely because anonymous access is enabled.
 */
const SIGNED_OUT_KEY = 'agentic_ui_signed_out';

// Declared before the describe block: `test.use` applies to the file, and Playwright warns
// if it appears after the tests it is meant to configure.
test.use({ httpCredentials: undefined });

test.describe('authentication and authorisation', () => {
  test('an explicitly signed-out visitor is redirected to sign-in', async ({ page }) => {
    // The flag `AuthService.markSignedOut()` writes. `runHydration()` checks it before
    // anything else, sets state to null and clears storage — so the guard must redirect.
    await page.addInitScript((key) => sessionStorage.setItem(key, '1'), SIGNED_OUT_KEY);

    await page.goto('/#/browse', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    expect(page.url(), 'a signed-out visitor should be sent to /login').toMatch(/#\/login/);
    await expect(page.locator('lib-browse')).toHaveCount(0);
  });

  test('the sign-in surface renders', async ({ page }) => {
    await page.addInitScript((key) => sessionStorage.setItem(key, '1'), SIGNED_OUT_KEY);
    await page.goto('/#/login', { waitUntil: 'networkidle' });

    // A form that cannot be submitted is not a sign-in page, so assert the control exists
    // rather than only that some text appeared.
    await expect(page.locator('button, input[type="submit"]').first()).toBeVisible();
  });

  test('an anonymous visitor is not granted administration access', async ({ page }) => {
    /**
     * The privilege boundary. `adminGuard` admits only `hasAdministrationAccess()` and sends
     * everyone else to `/dashboard`. With anonymous auth enabled server-side, an unauthenticated
     * visitor reaches the app as `Anonymous` — so this is the assertion that keeps that from
     * meaning "reaches administration".
     *
     * `httpCredentials` off, or the Administrator credentials in the config would grant exactly
     * the access this test exists to deny.
     */
    await page.goto('/#/administration', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    expect(page.url(), 'Anonymous should be redirected off /administration').not.toMatch(
      /#\/administration/,
    );
  });
});
