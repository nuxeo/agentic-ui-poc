/**
 * Is this surface worth measuring? — the Node-side twin of `expectSurfaceUsable` in
 * `fixtures.ts`.
 *
 * The diagnostics used to wait only for the feature host to become visible. That is not
 * enough, and the reason is specific rather than theoretical: a failed load renders the *same
 * host* with an error panel inside it, so the host is visible and the check passes. The
 * `/nuxeo/api/v1/me` preflight does not close the gap either — it proves credentials and the
 * backend are reachable, not that this route's data request succeeded.
 *
 * What that produced, per diagnostic:
 *
 *   - `reflow-probe.mjs` measured the geometry of an error panel and reported `fits`. An
 *     error panel has a perfectly well-behaved layout; it is the one thing guaranteed not to
 *     overflow.
 *   - `axe-differential.mjs` ran both tag sets against an error DOM and recorded the route as
 *     measured, so a rule that only fires on real content read as "did not reproduce".
 *
 * Both are false-clean, which is the failure mode this whole folder exists to avoid. Flagged
 * in review on PR #225.
 *
 * Duplicated from `fixtures.ts` rather than imported, for the same reason `env.mjs` is: a
 * `.ts` module cannot be imported from `.mjs` without loosening the compiler settings for the
 * folder. Both lists are short and both fail loudly.
 */

/**
 * Every error-state class the scanned features actually render, collected from their
 * templates. There is no shared error component in this application — each feature rolls its
 * own — so this list is the closest thing to one. Keep in step with `ERROR_STATE_SELECTOR` in
 * `fixtures.ts`.
 */
export const ERROR_STATE_SELECTOR = [
  '.browse-error',
  '.detail-error',
  '.results-error',
  '.task-error',
  '.tab-error',
  '.kd-error',
  '.kd-banner--error',
  '.gd-error',
  '.hxp-poc-error',
  '.cpd-error',
  '.nxql-error',
  '.picker-error',
].join(', ');

/**
 * Wait for a surface to be worth measuring, or explain why it is not.
 *
 * Proves the host rendered, that no known error state is inside it, and that it has real text
 * rather than being an empty shell. It does **not** prove repository data arrived: a feature
 * that fails silently, with no error class and a plausible empty layout, still passes. Named
 * for the weaker claim it makes.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} host    the feature component selector, e.g. `lib-browse`
 * @param {string} label   how this surface is named in the output
 * @param {number} [timeoutMs]
 * @returns {Promise<string|null>} null when usable, otherwise the reason it is not
 */
export async function surfaceUnusableReason(page, host, label, timeoutMs = 20_000) {
  try {
    await page.locator(host).first().waitFor({ state: 'visible', timeout: timeoutMs });
  } catch {
    return `${label}: ${host} never became visible`;
  }

  const errors = await page.locator(`${host} :is(${ERROR_STATE_SELECTOR})`).count();
  if (errors > 0) {
    return `${label}: showing an error state — measuring it would measure the error, not the surface`;
  }

  const text = (await page.locator(host).first().innerText()).trim();
  if (text.length === 0) {
    return `${label}: rendered an empty shell, so a clean measurement of it would prove nothing`;
  }

  return null;
}
