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
  const headers = () =>
    page.$$eval('hxp-document-list table thead th, hxp-document-list adf-datatable th', (cells) =>
      cells
        .filter((c) => !c.querySelector('button, mat-icon, .mat-icon, input'))
        .map((c) => (c.textContent ?? '').trim())
        .filter((t) => t.length > 0),
    );

  const rendered = await headers();
  h.check(
    'column headers match the packaged set, in order',
    JSON.stringify(rendered) === JSON.stringify(EXPECTED_HEADERS),
    `expected ${JSON.stringify(EXPECTED_HEADERS)}, rendered ${JSON.stringify(rendered)}`,
  );

  const rowTitles = await page.$$eval(
    'hxp-document-list tbody tr, hxp-document-list adf-datatable tbody tr',
    (rows) => rows.map((r) => (r.textContent ?? '').trim().slice(0, 40)).filter(Boolean),
  );
  h.check(
    'real Nuxeo children are listed',
    rowTitles.some((t) => t.includes('Default domain')),
    `rendered ${rowTitles.length} row(s): ${JSON.stringify(rowTitles.slice(0, 4))}`,
  );
  await h.screenshot('document-list');

  h.step('Host responsibility: the column picker is reachable and lists every column');
  // Load-bearing for the swap: upstream's component has no picker, so if this stops
  // working after the swap the capability was lost rather than moved.
  // By accessible name, not by text: the trigger is icon-only, so its textContent is
  // the icon ligature. An aria-label is what a keyboard or screen-reader user has, and
  // asserting on it means the control has one.
  const settings = page.locator('hxp-document-list button[aria-label="Manage columns"]').first();
  const settingsCount = await settings.count();
  h.check('a column-settings control exists', settingsCount > 0, `found ${settingsCount}`);
  if (settingsCount > 0) {
    await settings.click().catch(() => {});
    await page.waitForTimeout(600);
    const panelText = await page
      .locator('.hxp-col-panel, [aria-label="Column Settings"]')
      .first()
      .innerText()
      .catch(() => '');
    h.check(
      'the picker offers a column that is hidden by default',
      panelText.includes('Version'),
      `picker text was ${JSON.stringify(panelText.slice(0, 120))}`,
    );
    await h.screenshot('column-picker');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }

  h.step('Health');
  h.expectNoConsoleErrors('no unexpected browser console errors', ENVIRONMENTAL_ERRORS);
  h.note(
    'card view, thumbnails and the error/retry state — rendered by the hand-written ' +
      'component today and not covered here; they must be asserted before it is deleted',
  );
}
