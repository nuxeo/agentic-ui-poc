/**
 * The app session this folder injects, and the check that the app actually used it.
 *
 * ## Why injecting it is not enough
 *
 * Every signed-in page here gets two credentials: `httpCredentials` on the browser context, and
 * a copy of `AuthService`'s basic session written into `sessionStorage`. The copy is what gets
 * past the route guard. It is a copy — of the storage key and of the session shape in
 * `apps/nuxeo-ui/src/app/auth/auth.service.ts` — and this folder used to say a drifted copy
 * "cannot fail quietly". It can. When `AuthService` does not recognise the stored session,
 * hydration falls back to `GET /nuxeo/api/v1/me`; `httpCredentials` answers that challenge, and
 * the app signs itself in with a **cookie** session. Every spec then passes, signed in by a
 * route nobody intended, and the copy is dead code nobody notices. Flagged in review on PR #225.
 *
 * ## How adoption is proved
 *
 * Reading the key back and finding `kind: 'basic'` proves nothing: if `AuthService` renamed its
 * key, the app never reads ours and the injected value sits there untouched. So the injected
 * session carries one field the app does not know, `a11yInjected`. A basic session the app
 * accepts is validated against `/me` and re-persisted from its own known fields, which drops
 * the marker. The marker gone, with `kind: 'basic'` and the expected user, can only mean the app
 * read this session and kept it.
 */

/** Mirrors `STORAGE_KEY` in `apps/nuxeo-ui/src/app/auth/auth.service.ts`. */
export const SESSION_KEY = 'agentic_ui_nuxeo_session';
/** Mirrors `SIGNED_OUT_KEY` in the same file. Set by `AuthService.markSignedOut()`. */
export const SIGNED_OUT_KEY = 'agentic_ui_signed_out';
const MARKER = 'a11yInjected';

/**
 * The JSON to store under `SESSION_KEY`. Credentials come from the caller, who reads them from
 * the environment; never hardcoded, never in a URL.
 *
 * @param {string} username
 * @param {string} password
 * @returns {string}
 */
export function injectedSession(username, password) {
  return JSON.stringify({
    kind: 'basic',
    username,
    basic: Buffer.from(`${username}:${password}`).toString('base64'),
    isAdministrator: username.toLowerCase() === 'administrator',
    groups: [],
    [MARKER]: true,
  });
}

/**
 * `null` once the app has adopted the injected session, otherwise why it has not.
 *
 * Polled rather than read once, because hydration is asynchronous and a full reload re-injects
 * the marker until the app has re-validated. Call it after the page has loaded an app route.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} username
 * @param {number} [timeoutMs]
 * @returns {Promise<string | null>}
 */
export async function sessionAdoptionProblem(page, username, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  /** @type {string | null} */
  let problem = null;
  for (;;) {
    problem = await readProblem(page, username);
    if (problem === null || Date.now() >= deadline) return problem;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} username
 * @returns {Promise<string | null>}
 */
async function readProblem(page, username) {
  /** @type {string | null} */
  let raw;
  try {
    raw = await page.evaluate((key) => sessionStorage.getItem(key), SESSION_KEY);
  } catch (err) {
    const first = (err instanceof Error ? err.message : String(err)).split('\n')[0];
    return `could not read sessionStorage on ${page.url()}: ${first}`;
  }
  if (raw === null) {
    return (
      `nothing is stored under ${SESSION_KEY} on ${page.url()}, so the app is signed in by ` +
      'some other route than the injected session, or not at all'
    );
  }
  /** @type {unknown} */
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return `${SESSION_KEY} does not hold JSON`;
  }
  if (parsed === null || typeof parsed !== 'object') {
    return `${SESSION_KEY} holds ${parsed === null ? 'null' : typeof parsed}, not a session object`;
  }
  const stored = /** @type {Record<string, unknown>} */ (parsed);
  if (stored['kind'] !== 'basic') {
    return (
      `the app is signed in with a "${String(stored['kind'])}" session, not the injected basic ` +
      'one — it did not find or did not accept the injected session, and signed in through ' +
      'httpCredentials instead. Compare SESSION_KEY and injectedSession() in session.mjs with ' +
      'STORAGE_KEY and BasicStoredSession in auth.service.ts.'
    );
  }
  if (stored['username'] !== username) {
    return `the stored session is for "${String(stored['username'])}", not ${username}`;
  }
  if (stored[MARKER] === true) {
    return (
      `the injected session is untouched — the app never read ${SESSION_KEY}, or never ` +
      'validated it. Compare SESSION_KEY in session.mjs with STORAGE_KEY in auth.service.ts.'
    );
  }
  return null;
}
