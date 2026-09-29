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
 * This module is the single definition of both lists below; `fixtures.ts` imports them, which
 * is why the folder sets `allowJs`. It is `.mjs` rather than `.ts` so the diagnostics, which
 * are plain Node scripts and never see the TypeScript compiler, can import it too.
 */

/**
 * Every class that means "this surface failed to load".
 *
 * There is no shared error component in this application — each feature rolls its own — so
 * this list is the closest thing to one, and it is maintained by sweeping the templates
 * rather than by memory. That distinction is not pedantic: the list was written by hand from
 * the features that had already been scanned, the comment above it claimed it had been
 * collected from the templates, and it was missing twenty classes. `.widget-error` was found
 * in review on PR #225 — the dashboard renders it in four places, so a dashboard whose
 * widgets had all failed rendered plenty of text, tripped no selector here, and would have
 * been scanned and reported as a clean surface.
 *
 * `diagnostics/error-class-drift.mjs` now re-derives this from the templates and fails when
 * either list has drifted, so the next feature cannot reopen the same hole quietly.
 */
export const ERROR_STATE_CLASSES = [
  // Feature surfaces.
  'browse-error',
  'detail-error',
  'results-error',
  'task-error',
  'tab-error',
  'kd-error',
  'kd-banner--error',
  'kd-citation-dialog__state--error',
  'kd-content-lake-upload__error',
  'gd-error',
  'ud-error',
  'ug-error',
  'hxp-poc-error',
  'hxp-search-page__error',
  'nxql-error',
  'picker-error',
  'compare-error',
  'cpd-error',
  // App-shell pages, which have no feature library but are scanned the same way.
  'widget-error',
  'personal-space-page__error',
  'authorized-applications-page__state--error',
  'connected-accounts-page__state--error',
  // Not a panel of its own: every error panel above puts this icon inside itself. Kept as a
  // second, independent marker so a future panel whose wrapper class is missed here is still
  // caught by the icon it almost certainly renders.
  'error-icon',
];

export const ERROR_STATE_SELECTOR = ERROR_STATE_CLASSES.map((c) => `.${c}`).join(', ');

/**
 * Classes that match `error` but must **not** refuse a surface, and why.
 *
 * This list exists so that "not in `ERROR_STATE_CLASSES`" can mean "nobody has looked at it
 * yet". Without it the drift check could only be silenced by adding a class to the selector,
 * which would trade false-clean scans for false refusals — the failure mode where the suite
 * reports nothing because it declines to measure anything.
 *
 * Two kinds qualify. An **ancillary feature** failing leaves the surface itself rendered and
 * worth scanning. A **data state** describes the content, not the load.
 */
export const NOT_A_SURFACE_ERROR = {
  'ai-error': 'AI: the search page rendered; its AI panel did not.',
  'ai-error-banner': 'AI: document detail rendered; its AI panel did not.',
  'ai-chat-error': 'AI: the shell rendered; the chat drawer did not.',
  'ke-status-banner--error': 'Data state: knowledge-enrichment status of this document.',
  'kd-status-chip--error': 'Data state: status of one answer in the KD list.',
  'import-error': 'Validation inside the create-import dialog, not a load failure.',
  'import-error--staged': 'Validation inside the create-import dialog, not a load failure.',
  'types-error': 'Validation inside the create-import dialog, not a load failure.',
  'error-text': 'Validation inside the create-import dialog, not a load failure.',
  error:
    'Nav-drawer tree (`.tree-empty.error`). Out of reach anyway — every check here is scoped ' +
    'to a feature host and the drawer is a sibling of the router outlet — and a bare `.error` ' +
    'is too broad to add safely.',
};

/**
 * The three AI entries are the load-bearing ones. The AI backend is a separate marketplace
 * package that is **absent by default** (`CLAUDE.md` §5: its absence means HTTP 500, which is
 * expected, not a client defect). Treating those banners as surface failures would refuse
 * search, document detail and every shell-level scan on any environment without that package
 * — which is most of them, including this one. The suite would then report no findings, and
 * "no findings" is indistinguishable from "clean" at a glance.
 */

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
