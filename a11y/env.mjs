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
 * The TypeScript side has its own copy in `fixtures.ts` — one per language rather than a
 * cross-language import, because a `.ts` file cannot import a `.mjs` one without loosening
 * the compiler settings for the whole folder. Both are eight lines and both throw.
 */

/**
 * @returns {{ username: string, password: string }}
 * @throws if either variable is unset or empty.
 */
export function requireNuxeoCredentials() {
  const username = process.env['NUXEO_USER'];
  const password = process.env['NUXEO_PASS'];

  const missing = [
    ...(username ? [] : ['NUXEO_USER']),
    ...(password ? [] : ['NUXEO_PASS']),
  ];
  if (missing.length > 0) {
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
