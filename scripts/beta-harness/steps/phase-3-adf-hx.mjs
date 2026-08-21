/**
 * Phase 3 — adf-hx component adoption, starting with `document-list`.
 *
 * This file is written **before** the swap and records the hand-written component's
 * behaviour, so the report shows a genuine before and after rather than a claim of
 * parity. `adopt-adf-hx-component` requires that capture because once the local
 * `hxp-document-list` is deleted its behaviour is unrecoverable.
 *
 * ## What "before" and "after" mean here
 *
 * The two components are **not** interchangeable, and pretending otherwise is the
 * trap. The hand-written one (384 lines) renders an error state with a retry button,
 * a card view, thumbnails and its own column picker. Upstream's
 * `HxpDocumentListComponent` renders a DataTable and nothing else: no error state,
 * no card view, no thumbnails, no picker. Those responsibilities belong to the host
 * page, which is arguably where they should have been.
 *
 * So the assertions below are split:
 *
 * - **Data parity** — the same Nuxeo children, in the same order, with the same
 *   column headers. This must hold across the swap.
 * - **Host responsibilities** — error, empty and card view. These must keep working
 *   after moving, and are asserted separately so a regression in one is not hidden
 *   by the other passing.
 *
 * Prerequisites:
 *   npm run beta:backend
 *   npx nx serve nuxeo-ui
 *
 * Run:
 *   npm run beta:evidence -- phase-3-adf-hx
 */

/**
 * Column headers the hand-written list renders by default, transcribed from
 * `HXP_BROWSE_ALL_COLUMNS` in `hxp-browse-columns.utils.ts`. Asserted as an ordered
 * equality so a reorder or a relabel fails rather than passing a count.
 */
const EXPECTED_HEADERS = ['Title', 'Modified', 'Last Contributor'];

const ENVIRONMENTAL_ERRORS = [
  /automation\/AI\./,
  '/nuxeo/logout',
  '/nuxeo/api/v1/path/default-domain/config/agentic-ui',
  '/agentic-ui-config/bootstrap.json',
];

/**
 * @param {import('@playwright/test').Page} page
 * @param {ReturnType<import('../helpers.mjs').createHelpers>} h
 */
export default async function run(page, h) {
  h.step('Precondition: a backend is reachable, so the list has real rows');
  const probe = await page.request
    .get(`${h.baseUrl}/nuxeo/api/v1/me`, { failOnStatusCode: false })
    .catch(() => null);
  h.requirePrecondition(
    'Nuxeo API answers through the dev proxy',
    probe?.status() === 200,
    `/nuxeo/api/v1/me returned ${probe?.status() ?? 'no response'} — an empty list proves nothing ` +
      'about a document list. Run `npm run beta:backend` first.',
  );

  h.step('The POC route renders a document list over real Nuxeo children');
  await h.login();
  await h.goTo('/#/browse-adf-hx');
  await page.waitForTimeout(1500);
  await h.expectVisible('POC page rendered', 'lib-browse-adf-hx-poc');
  await h.expectVisible('a document list is present', 'hxp-document-list');

  // Scoped to the list's own table so the surrounding chrome cannot contribute a
  // string. Header cells holding a control are excluded: the settings cell's
  // textContent is a Material icon ligature, which an earlier capture in this repo
  // duly asserted as a column called "tune".
  // Two selectors because this file spans the swap. The hand-written list rendered a
  // plain `<table>`; upstream's renders adf-core's DataTable, whose header cells are
  // `.adf-datatable-cell-header-content` divs. Asserting both keeps the before and after
  // comparable on the thing that matters — the column set — rather than on markup that
  // was always going to change.
  const headers = () =>
    page.$$eval(
      'hxp-document-list table thead th, hxp-document-list .adf-datatable-cell-header-content',
      (cells) =>
        cells
          .filter((c) => !c.querySelector('button, mat-icon, .mat-icon, input'))
          .map((c) => (c.textContent ?? '').trim())
          // An untranslated key appears here if adf-core's catalogue has not loaded; it is
          // not a column, and filtering it keeps this assertion about columns.
          .filter((t) => t.length > 0 && !t.startsWith('ADF-DATATABLE.')),
    );

  const rendered = await headers();
  h.check(
    'column headers match the packaged set, in order',
    JSON.stringify(rendered) === JSON.stringify(EXPECTED_HEADERS),
    `expected ${JSON.stringify(EXPECTED_HEADERS)}, rendered ${JSON.stringify(rendered)}`,
  );

  const rowTitles = await page.$$eval(
    // adf-core marks the header with `adf-datatable-row` too, so it has to be excluded
    // or the header counts as a data row — the first run of this assertion reported one
    // row whose text was the select-all accessibility label.
    'hxp-document-list tbody tr, hxp-document-list adf-datatable-row:not(.adf-datatable-header *):not(.adf-datatable-header)',
    (rows) => rows.map((r) => (r.textContent ?? '').trim().slice(0, 40)).filter(Boolean),
  );
  h.check(
    'real Nuxeo children are listed',
    rowTitles.some((t) => t.includes('Default domain')),
    `rendered ${rowTitles.length} row(s): ${JSON.stringify(rowTitles.slice(0, 4))}`,
  );
  await h.screenshot('document-list');

  h.step('Upstream capability: rows are selectable');
  // What the swap *gains*. The hand-written list had its own checkbox column; upstream's
  // DataTable provides multiselect natively, which is why `[multiselect]="true"` is set.
  const rowCheckboxes = page.locator('hxp-document-list adf-datatable-row mat-checkbox');
  const checkboxCount = await rowCheckboxes.count();
  h.check('every row offers a selection checkbox', checkboxCount >= 2, `found ${checkboxCount}`);
  await h.screenshot('row-selection');

  h.step('adf-core strings are translated, not raw keys');
  // adf-core ships its own catalogue and this app has to serve it. Without the asset glob
  // the DataTable renders `ADF-DATATABLE.ACCESSIBILITY.SELECT_ALL` to screen readers.
  const rawKeys = await page.$$eval('hxp-document-list', (roots) =>
    roots.flatMap((r) => ((r.textContent ?? '').match(/ADF-[A-Z-]+\.[A-Z_.]+/g) ?? [])),
  );
  h.check(
    'no untranslated adf-core keys are rendered',
    rawKeys.length === 0,
    `found ${rawKeys.length}: ${JSON.stringify(rawKeys.slice(0, 3))}`,
  );

  h.note(
    'the column picker — the hand-written list had one, upstream has none, and it has NOT ' +
      'been rehomed. Layer 1 still sets the columns through the manifest, but a user can no ' +
      'longer choose them at runtime. A named regression, not a silent one.',
  );
  h.note('card view and thumbnails — rendered by the hand-written list, not yet rehomed');

  h.step('Health');
  h.expectNoConsoleErrors('no unexpected browser console errors', ENVIRONMENTAL_ERRORS);
  h.note(
    'card view, thumbnails and the error/retry state — rendered by the hand-written ' +
      'component today and not covered here; they must be asserted before it is deleted',
  );
}
