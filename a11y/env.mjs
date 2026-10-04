/**
 * Nuxeo credentials for the Node-side tooling in this folder — preflight and the diagnostics.
 *
 * `.cursor/rules/security.mdc` is explicit: no hardcoded credentials, "NEVER use Basic auth
 * with hardcoded fallback defaults", and sensitive config comes from environment variables
 * "with startup validation". This folder previously wrote `process.env.NUXEO_USER ??
 * 'Administrator'` in five places, copying the pattern already in `apps/nuxeo-ui-e2e`. That
 * the pattern exists elsewhere is not a defence the rule admits, and it was flagged in review
 * on PR #225.
 *
 * A default is worse than an error here for a reason beyond the rule: against a server that
 * happens to accept `Administrator`, the fallback silently scans as the wrong identity, and
 * the report says nothing about it.
 *
 * `fixtures.ts` imports these directly; the folder sets `allowJs` and `checkJs` so a `.ts`
 * module can consume a `.mjs` one and still be type-checked. This comment used to describe a
 * per-language copy in `fixtures.ts` and argue for keeping it, which was true before that
 * compiler change and has been wrong since — it was directing maintainers to preserve a
 * duplication that no longer exists. Flagged in review on PR #225.
 */

/**
 * Where the application is served, for every command in this folder.
 *
 * One resolver because there used to be two, and they disagreed: the Playwright config and
 * the preflight read `E2E_BASE_URL` while all three diagnostics read `APP_URL`. Since
 * `a11y:scan` is a single entry point, setting either documented override sent some
 * subcommands at the requested deployment and left the others silently on localhost — so a
 * `surfaces` run and a `reflow` run could describe two different applications while being
 * compared to each other. Flagged in review on PR #225.
 *
 * `E2E_BASE_URL` is the primary name, matching `apps/nuxeo-ui-e2e/playwright.config.ts` so
 * both suites answer to one variable. `APP_URL` stays accepted because the diagnostics and
 * the authoring guide have documented it.
 */
export function resolveBaseUrl() {
  return process.env['E2E_BASE_URL'] ?? process.env['APP_URL'] ?? 'http://localhost:4200';
}

/**
 * @returns {{ username: string, password: string }}
 * @throws if either variable is unset or empty.
 */
export function requireNuxeoCredentials() {
  const username = process.env['NUXEO_USER'];
  const password = process.env['NUXEO_PASS'];

  // `if (!username || !password)` rather than a count of a `missing` array, so the compiler
  // narrows both to `string` on the way out. With `checkJs` on, the array form returned
  // `string | undefined` and the JSDoc `@returns` was quietly a lie — caught by turning
  // `checkJs` on to share this function with the TypeScript side.
  if (!username || !password) {
    const missing = [
      ...(username ? [] : ['NUXEO_USER']),
      ...(password ? [] : ['NUXEO_PASS']),
    ];
    throw new Error(
      `${missing.join(' and ')} must be set. This folder does not default them: a default ` +
        'would scan as the wrong identity against any server that accepts it, and the report ' +
        'would not say so.\n\n' +
        '    $env:NUXEO_USER = "<user>"; $env:NUXEO_PASS = "<password>"   # PowerShell\n' +
        '    export NUXEO_USER=<user> NUXEO_PASS=<password>               # bash',
    );
  }

  return { username, password };
}

/** The Basic auth header the diagnostics send to the app origin. */
export function nuxeoBasicAuthHeader() {
  const { username, password } = requireNuxeoCredentials();
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

/**
 * Would the app let this identity into `/#/administration`?
 *
 * Every suite and diagnostic that scans the seven surfaces visits that route, and `adminGuard`
 * redirects anyone without administration access to the dashboard. The preflight used to
 * accept any account that could read one document, so a valid ordinary account got "the stack
 * is ready" followed by a guaranteed failure on that route — or, in a diagnostic, a dashboard
 * measured under the administration label. Flagged in review on PR #225.
 *
 * Mirrors `AuthService.hasAdministrationAccess` in `apps/nuxeo-ui/src/app/auth/auth.service.ts`
 * and `isPowerUserFromGroups` in `libs/shared/nuxeo-client/src/lib/auth/user-groups.util.ts`,
 * which a `.mjs` script cannot import. If either changes, change this with it.
 *
 * @param {unknown} me        the body of `GET /nuxeo/api/v1/me`
 * @param {string}  username  the identity the scan runs as
 */
export function hasAdministrationAccess(me, username) {
  const { isAdministrator, isPowerUser } = administrationRoles(me, username);
  return isAdministrator || isPowerUser;
}

/**
 * Would the app let this identity into `/#/administration/analytics`, the tab
 * `/#/administration` lands an administrator on?
 *
 * Narrower than `hasAdministrationAccess`. `fullAdministratorGuard` in
 * `libs/shared/nuxeo-client/src/lib/auth/admin-route.guards.ts` admits only administrators, and
 * `administrationLandingGuard` sends a powerusers member to `users-groups` instead. Only a
 * caller that asserts the analytics tab itself needs this.
 *
 * @param {unknown} me        the body of `GET /nuxeo/api/v1/me`
 * @param {string}  username  the identity the scan runs as
 */
export function isFullAdministrator(me, username) {
  return administrationRoles(me, username).isAdministrator;
}

/**
 * `AuthService.isAdministrator` and `AuthService.isPowerUser`, from `/me`.
 *
 * @param {unknown} me
 * @param {string}  username
 */
function administrationRoles(me, username) {
  /** Nuxeo returns this flag as a boolean, a string or 1 depending on version. */
  const truthy = (/** @type {unknown} */ v) => v === true || v === 'true' || v === 1;
  // `unknown` all the way down: this is an untrusted response body, and `any` here would switch
  // `checkJs` off for exactly the lines that parse it. `Array.isArray` narrows to `any[]`, so
  // `groups` is annotated back to `unknown[]` to keep the `typeof g` check below load-bearing.
  const asRecord = (/** @type {unknown} */ v) =>
    v !== null && typeof v === 'object' ? /** @type {Record<string, unknown>} */ (v) : {};
  const o = asRecord(me);
  const props = asRecord(o['properties']);
  /** @type {unknown[]} */
  const groups = Array.isArray(props['groups']) ? props['groups'] : [];

  const isAdministrator =
    truthy(o['isAdministrator']) ||
    truthy(props['isAdministrator']) ||
    username.trim().toLowerCase() === 'administrator';
  const isPowerUser = groups.some((g) => typeof g === 'string' && g.trim().toLowerCase() === 'powerusers');
  return { isAdministrator, isPowerUser };
}
