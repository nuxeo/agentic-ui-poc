/**
 * The Nuxeo credentials for the e2e suite, from the environment, with **no** fallback.
 *
 * `.cursor/rules/security.mdc`: "NEVER use Basic auth with hardcoded fallback defaults".
 * Several callers in this directory each carried a `??` fallback on both the user and the
 * password — a working credential pair compiled into the repository.
 *
 * Throwing is the point. A default that happens to be right on a developer's Docker is a
 * default that is silently wrong everywhere else, and the failure it produces there is an
 * unexplained empty listing rather than "you did not set NUXEO_USER".
 *
 * The message names the variables and nothing else. Spelling the discouraged pair out in the
 * prose recreated the very string the rule exists to keep out of source — a credential does not
 * stop being one for being quoted inside its own warning.
 *
 * ## Why this is a module of its own
 *
 * It lived in `fixtures.ts` under a docblock claiming to be "the one place either value is
 * read". That was false, and review caught it: `playwright.config.ts` read both variables with
 * its own fallback pair, and the config cannot import `fixtures.ts` without pulling in
 * `base.extend(...)` and the whole test fixture surface at config-load time. A claim of
 * single-source has to be cheap for every caller to honour, or the next caller writes its own
 * fallback again — which is exactly what had happened.
 */
export function nuxeoCredentials(): { username: string; password: string } {
  const username = process.env['NUXEO_USER'];
  const password = process.env['NUXEO_PASS'];
  if (!username || !password) {
    throw new Error(
      'NUXEO_USER and NUXEO_PASS must both be set to run the e2e suite.\n' +
        '  There is deliberately no default, because a default that suits one instance is wrong\n' +
        '  on every other and embeds a usable credential in the repository.',
    );
  }
  return { username, password };
}
