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
  // sys_acl principal resolution: probes /group/ first for every principal, gets 404 for users
  /HTTP 404 \/nuxeo\/api\/v1\/group\//,
];

/** Where the versions fixture lives. Its own folder, so the list has one row to select. */
const FIXTURE_FOLDER_PATH = '/default-domain/workspaces/kd-versions-evidence';
const FIXTURE_DOC_NAME = 'versioned-file';
const FIXTURE_DOC_TITLE = 'KD Versions Evidence';

/**
 * A document carrying exactly two Nuxeo versions, 0.1 and 0.2.
 *
 * Built through Nuxeo's REST API rather than through the UI: this is *setup*, and driving it
 * through the surface under test would make the fixture and the assertion the same claim.
 * `page.request` inherits the context's `httpCredentials`, which is what authenticates it.
 *
 * The document is deleted and recreated on every run so the version labels are the same every
 * run. Only this folder is touched, and only the document this step created inside it.
 */
async function createVersionedFixture(page, h) {
  const api = `${h.baseUrl}/nuxeo/api/v1`;
  const json = { 'Content-Type': 'application/json' };
  const post = (path, body) =>
    page.request.post(`${api}${path}`, { headers: json, data: body, failOnStatusCode: false });

  // The folder, created if absent. A 409 means it already exists, which is the normal case.
  await post('/path/default-domain/workspaces', {
    'entity-type': 'document',
    name: 'kd-versions-evidence',
    type: 'Folder',
    properties: { 'dc:title': 'KD Versions Evidence' },
  });

  // A clean document each run: a leftover would already be at 0.3 or beyond.
  await page.request.delete(`${api}/path${FIXTURE_FOLDER_PATH}/${FIXTURE_DOC_NAME}`, {
    failOnStatusCode: false,
  });
  const created = await post(`/path${FIXTURE_FOLDER_PATH}`, {
    'entity-type': 'document',
    name: FIXTURE_DOC_NAME,
    type: 'File',
    properties: { 'dc:title': FIXTURE_DOC_TITLE, 'dc:description': 'created by phase-3 evidence' },
  });
  const uid = (await created.json())?.uid;
  h.requirePrecondition(
    'the versions fixture could be created in Nuxeo',
    Boolean(uid),
    `POST ${FIXTURE_FOLDER_PATH} returned ${created.status()} — without a fixture the versions ` +
      'panel has nothing real to render, and an empty panel proves nothing.',
  );

  // Two check-ins, each preceded by an edit so Nuxeo has a change to snapshot.
  for (const comment of ['first evidence version', 'second evidence version']) {
    await post(`/id/${uid}/@op/Document.CheckIn`, {
      params: { version: 'minor', comment },
      context: {},
    });
    await page.request.put(`${api}/id/${uid}`, {
      headers: json,
      data: { 'entity-type': 'document', properties: { 'dc:description': comment } },
      failOnStatusCode: false,
    });
  }

  // Counted through the same operation the `QUERY` port uses, so the fixture's own count and
  // the UI's are read from one source. Deliberately **not** the NXQL search: that path is
  // OpenSearch-backed here and lags a check-in by seconds, which would make this flaky.
  const listed = await post(`/id/${uid}/@op/Document.GetVersions`, { params: {}, context: {} });
  const versionCount = ((await listed.json())?.entries ?? []).length;
  return { uid, versionCount };
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {ReturnType<import('../helpers.mjs').createHelpers>} h
 */
export default async function run(page, h) {
  // ── sys_acl principal lookup monitoring (global for the whole run) ──
  const principalLookups = [];
  page.on('request', (request) => {
    const url = request.url();
    if (/\/nuxeo\/api\/v1\/(group|user)\/[^/?]+$/.test(url)) principalLookups.push(url);
  });

  h.step('Precondition: the dev server serves adf-core\'s translation catalogue');
  // adf-hx components fetch `assets/adf-core/i18n/<lang>.json` at runtime, copied in by an
  // asset glob in `angular.json`. Without it one accessibility label renders as a raw key and
  // the console fills with 404s — asserted as a precondition so the run says so instead of
  // reporting failures that look like broken components. The shipped case is gated separately
  // by `bundle`, which asserts the file is present in `dist/`.
  //
  // This first failed for a reason worth recording: Angular's `development` configuration
  // **replaces** the `assets` array rather than merging with it, and only the top-level
  // `options` array had the adf-core glob. Every dev server ever started on this branch
  // 404ed the catalogue, and this precondition's first message blamed a stale server and
  // told the reader to restart it — which could never have helped.
  const catalogue = await page.request
    .get(`${h.baseUrl}/assets/adf-core/i18n/en.json`, { failOnStatusCode: false })
    .catch(() => null);
  h.requirePrecondition(
    "adf-core's catalogue is served",
    catalogue?.status() === 200,
    `/assets/adf-core/i18n/en.json returned ${catalogue?.status() ?? 'no response'} — the dev ` +
      "server is not serving adf-core's assets. Check that the `development` configuration in " +
      'angular.json still lists the adf-core glob (it replaces the array, it does not merge), ' +
      'then restart: npx nx serve nuxeo-ui',
  );
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

  // No synthetic identifier on the landing screen. The folder header renders
  // `sys_typeLabel ?? sys_primaryType`, and with the synthetic root unlabelled this read
  // "Repository / SysRoot". Asserted on the header alone so a `SysRoot` elsewhere in the page
  // cannot mask it.
  const folderHeaderText = await page
    .locator('hxp-folder-header')
    .first()
    .innerText()
    .catch(() => '');
  h.check(
    'the folder header shows no internal Sys* identifier',
    folderHeaderText.length > 0 && !/\bSys[A-Z]/.test(folderHeaderText),
    `folder header read ${JSON.stringify(folderHeaderText.slice(0, 120))}`,
  );

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

  h.step('Fixed: the column sort reaches the server, and the list pages');
  // Two of the five recorded bridge defects, both previously reported as closed and neither of
  // which was. `(sortingClicked)` went nowhere, so clicking a header reordered only the loaded
  // rows — measured at 37 before and after with no refetch — and the fetch took a hardcoded
  // `limit: 50` with no pager.
  const listRowTitles = () =>
    page.$$eval(
      'hxp-document-list adf-datatable-row:not(.adf-datatable-header)',
      (rows) => rows.map((r) => (r.textContent ?? '').trim().slice(0, 24)).filter(Boolean),
    );

  // Every `@children` request this step causes, so the sort can be proved at the wire rather than
  // inferred from what the rows look like.
  const childrenRequests = [];
  const recordChildren = (request) => {
    if (!request.url().includes('/@children')) return;
    // URL *and* headers: Nuxeo takes the sort as query params and the enrichers as a header, so a
    // check that looks only at the URL cannot see the enricher. The first version of this step did
    // exactly that and reported the enricher missing while it was being sent.
    childrenRequests.push({ url: request.url(), headers: request.headers() });
  };
  page.on('request', recordChildren);

  await h.goTo(`/#/browse-adf-hx?path=${encodeURIComponent('/default-domain/workspaces')}`);
  await page.waitForTimeout(2500);

  const pagerRange = () =>
    page.locator('hxp-browse-pager .hxp-pager__range').first().innerText().catch(() => '');

  h.check('a pager is present', (await page.locator('hxp-browse-pager').count()) > 0);
  const firstPage = await listRowTitles();
  const firstRange = await pagerRange();
  h.check(
    'the pager reports a range, and no total Nuxeo did not give',
    /^\d+–\d+$/.test(firstRange.trim()) || /^\d+–\d+ of \d+$/.test(firstRange.trim()),
    `pager read ${JSON.stringify(firstRange)} — "1–50 of 50" would mean the page length is being ` +
      'reported as the total, which is the defect',
  );

  // Sorting: ask for descending title and require the *server* to have reordered, which shows up
  // as a different first row than the ascending default.
  const titleHeader = page.locator('hxp-document-list .adf-datatable-cell-header-content').first();
  await titleHeader.click();
  await page.waitForTimeout(2500);
  const sortedPage = await listRowTitles();
  h.check(
    'clicking a column header reorders the list',
    sortedPage.length > 0 && JSON.stringify(sortedPage) !== JSON.stringify(firstPage),
    `before ${JSON.stringify(firstPage.slice(0, 3))} after ${JSON.stringify(sortedPage.slice(0, 3))}`,
  );
  // The load-bearing half, and asserted at the wire. adf-core's DataTable *also* sorts the loaded
  // page client-side, so a reordered list on its own does not prove the server was asked — that is
  // exactly what made this defect look fixed. A `sortBy` in a `@children` URL does prove it.
  page.off('request', recordChildren);
  // The permissions enricher, asserted at the wire for the same reason as the sort: the mapped
  // `sys_effectivePermissions` is invisible in the DOM, and without the enricher every row's
  // permission list is `undefined`, which upstream reads as no permission at all.
  h.check(
    'the children request asks Nuxeo for real permissions',
    childrenRequests.some((r) => (r.headers['enrichers.document'] ?? '').includes('permissions')),
    `${childrenRequests.length} @children request(s); last enrichers.document header: ` +
      JSON.stringify(childrenRequests.at(-1)?.headers['enrichers.document'] ?? null),
  );

  const sortedRequests = childrenRequests.filter((r) => r.url.includes('sortBy='));
  h.check(
    'a @children request carried sortBy, so the server did the ordering',
    sortedRequests.length > 0,
    `${childrenRequests.length} @children request(s), none with sortBy: ` +
      JSON.stringify(childrenRequests.slice(-2).map((r) => r.url)),
  );
  h.check(
    'the sort field is a Nuxeo property, not an HxPR key',
    sortedRequests.some((r) => /sortBy=dc(%3A|:)/.test(r.url)),
    `sorted request URLs: ${JSON.stringify(sortedRequests.slice(-2).map((r) => r.url))}`,
  );
  h.check(
    'the sorted list is not empty — an unmappable sortBy makes Nuxeo answer 200 with no entries',
    (await page.locator('hxp-document-list adf-datatable-row').count()) > 1,
  );
  await h.screenshot('sorted-list');

  h.step('Upstream capability: rows are selectable');
  // What the swap *gains*. The hand-written list had its own checkbox column; upstream's
  // DataTable provides multiselect natively, which is why `[multiselect]="true"` is set.
  const rowCheckboxes = page.locator('hxp-document-list adf-datatable-row mat-checkbox');
  const checkboxCount = await rowCheckboxes.count();
  h.check('every row offers a selection checkbox', checkboxCount >= 2, `found ${checkboxCount}`);
  // Actually select one, and assert the checkbox reports itself checked. The first version of
  // this step screenshotted the untouched list, so `row-selection.png` was byte-identical to
  // `document-list.png` — the screenshot audit caught it. A picture of an unselected list is
  // not evidence that selection works.
  await rowCheckboxes.nth(1).click().catch(() => {});
  await page.waitForTimeout(500);
  const selectedCount = await page
    .locator('hxp-document-list adf-datatable-row mat-checkbox.mat-mdc-checkbox-checked')
    .count();
  h.check('clicking a row checkbox selects that row', selectedCount === 1, `${selectedCount} checked`);
  await h.screenshot('row-selection');
  // Cleared again, so the versions step below starts from a known empty selection rather than
  // inheriting this one.
  await rowCheckboxes.nth(1).click().catch(() => {});
  await page.waitForTimeout(300);

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

  h.step('Upstream breadcrumb renders, and its links point at OUR routes');
  // The interesting part is not that it renders. adf-hx's own `DocumentRouterService` builds
  // `/{repository}/documents/{id}`, which this app has no route for, and the breadcrumb feeds
  // that straight into `[routerLink]`. `NuxeoDocumentRouterService` is bound against it, so
  // the assertion is on the hrefs the crumbs actually carry.
  // Two levels deep, deliberately. Upstream's breadcrumb renders **ancestors only** — never
  // the current document — and only links a crumb that is not the last. At the root there is
  // one crumb and at a top-level folder still only one, so neither state has a link and the
  // assertion below would fail for the wrong reason. Two earlier runs of this step did
  // exactly that. `/default-domain/workspaces` gives root + default-domain, so the first is
  // linked.
  await h.goTo('/#/browse-adf-hx?path=%2Fdefault-domain%2Fworkspaces');
  await page.waitForTimeout(2000);
  await h.expectVisible('upstream breadcrumb rendered', 'hxp-ui-breadcrumb');
  const crumbHrefs = await page.$$eval('hxp-breadcrumb a[href]', (as) =>
    as.map((a) => a.getAttribute('href') ?? ''),
  );
  h.check(
    'breadcrumb links target the adf-hx browse route',
    crumbHrefs.length > 0 && crumbHrefs.every((href) => href.includes('browse-adf-hx')),
    `hrefs were ${JSON.stringify(crumbHrefs.slice(0, 4))}`,
  );
  h.check(
    'no link points at upstream\'s /{repository}/documents/ shape',
    !crumbHrefs.some((href) => href.includes('/documents/')),
    `hrefs were ${JSON.stringify(crumbHrefs.slice(0, 4))}`,
  );
  await h.screenshot('upstream-breadcrumb');

  h.step('Rehomed: the column picker is back, and driven by Layer 1');
  // Upstream's DataTable has no picker. Losing it would have been a silent regression, so
  // it moved to the host. Asserting it here is what makes "rehomed" a fact.
  const columnsBtn = page.locator('button[aria-label="Manage columns"]').first();
  h.check('a column-settings control exists', (await columnsBtn.count()) > 0);
  await columnsBtn.click().catch(() => {});
  await page.waitForTimeout(600);
  const pickerText = await page
    .locator('hxp-column-picker [aria-label="Column Settings"]')
    .first()
    .innerText()
    .catch(() => '');
  h.check(
    'the picker offers a column that ships hidden',
    pickerText.includes('Version'),
    `picker text was ${JSON.stringify(pickerText.slice(0, 140))}`,
  );
  h.check(
    'the picker lists every packaged column, not just the visible ones',
    pickerText.includes('Coverage') && pickerText.includes('Subjects'),
    `picker text was ${JSON.stringify(pickerText.slice(0, 200))}`,
  );
  await h.screenshot('column-picker');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  h.step('Rehomed: the card view renders with thumbnails');
  // By accessible name. The toggle is icon-only, so filtering on text finds nothing —
  // the first draft of this step did exactly that and reported zero cards.
  const cardToggle = page.locator('button[aria-label="Card view"]').first();
  h.check('a card-view toggle exists', (await cardToggle.count()) > 0);
  await cardToggle.click().catch(() => {});
  await page.waitForTimeout(1500);
  const cards = page.locator('hxp-document-cards .hxp-doc-card');
  const cardCount = await cards.count();
  h.check('card view renders a card per document', cardCount >= 1, `found ${cardCount}`);
  await h.screenshot('card-view');

  h.step('Upstream document tree mounts in the shell nav drawer');
  // The tree lives in the **app shell's** nav drawer, not the POC page, and only mounts when
  // the route is entered through the platform nav item — the shell owns the drawer state, so
  // a direct `goTo` renders the page without one. Section 3 records that.
  await h.goTo('/#/browse');
  await page.waitForTimeout(1200);
  const navEntry = page.locator('a,button').filter({ hasText: /adf-hx/i }).first();
  h.check('platform nav offers the adf-hx entry', (await navEntry.count()) > 0);
  await navEntry.click().catch(() => {});
  await page.waitForTimeout(3000);
  await h.expectVisible('nav drawer mounted', 'hxp-browse-nav-drawer');
  await h.expectVisible('upstream document tree rendered', 'hxp-document-tree');

  // A tree that renders no nodes is the failure this replaces a working component with, so
  // the node count is the load-bearing assertion rather than the element's presence.
  const treeNodes = await page.$$eval(
    'hxp-browse-nav-drawer hxp-document-tree [role="treeitem"], hxp-browse-nav-drawer hxp-document-tree mat-tree-node',
    (nodes) => nodes.map((n) => (n.textContent ?? '').trim()).filter(Boolean),
  );
  h.check(
    'the tree renders real Nuxeo folders',
    treeNodes.length > 0,
    `found ${treeNodes.length}: ${JSON.stringify(treeNodes.slice(0, 4))}`,
  );
  await h.screenshot('upstream-document-tree');

  h.step('Fixture: a document with two known Nuxeo versions');
  // Built by the step rather than assumed to exist, so the version *labels* below are
  // deterministic. A fixture left over from a previous run would have grown to 0.3, 0.4 …
  // and an assertion loose enough to tolerate that would no longer be asserting the
  // major/minor composition — the one part of the mapping Nuxeo does not answer directly.
  const fixture = await createVersionedFixture(page, h);
  h.check(
    'fixture document has two versions in Nuxeo',
    fixture.versionCount === 2,
    `Document.GetVersions reported ${fixture.versionCount} version(s) for ${fixture.uid}`,
  );

  h.step('Adopted: upstream versions panel over real Nuxeo versions');
  await h.goTo(`/#/browse-adf-hx?path=${encodeURIComponent(FIXTURE_FOLDER_PATH)}`);
  await page.waitForTimeout(2000);

  // The guard first, because it is the difference between a feature and a decoration.
  // Versions belong to a document; the folder being browsed is not one, so with nothing
  // selected the tab must say so rather than render the folder's own "current version".
  //
  // The labels are read and reported rather than matched by an anchored regex. The first
  // draft used `/^Versions$/`, which never matches: Playwright tests a regex against the raw
  // `textContent`, and the template puts the label on its own line. The failure said "a
  // Versions tab exists — false", which reads as a missing tab rather than a bad selector.
  const tabLabels = await page.$$eval('hxp-browse-tabs [role="tab"]', (els) =>
    els.map((el) => (el.textContent ?? '').trim()),
  );
  h.check(
    'a Versions tab exists',
    tabLabels.includes('Versions'),
    `tab strip rendered ${JSON.stringify(tabLabels)}`,
  );
  const tab = (label) =>
    page.locator('hxp-browse-tabs [role="tab"]').filter({ hasText: label }).first();
  const versionsTab = tab('Versions');
  await versionsTab.click();
  await page.waitForTimeout(800);
  const unselectedHint = await page
    .locator('lib-browse-adf-hx-poc .hxp-poc-empty')
    .first()
    .innerText()
    .catch(() => '');
  h.check(
    'with no row selected the tab asks for a selection instead of showing the folder',
    /select a single document/i.test(unselectedHint),
    `tab body read ${JSON.stringify(unselectedHint.slice(0, 120))}`,
  );
  h.check(
    'no versions panel is rendered without a selection',
    (await page.locator('hxp-manage-versions-sidebar').count()) === 0,
  );
  await h.screenshot('versions-no-selection');

  // Now select the fixture row and come back.
  await tab('View').click();
  await page.waitForTimeout(1200);
  const fixtureRow = page
    .locator('hxp-document-list adf-datatable-row')
    .filter({ hasText: FIXTURE_DOC_TITLE })
    .first();
  h.check('the fixture document is listed', (await fixtureRow.count()) > 0, FIXTURE_DOC_TITLE);
  await fixtureRow.locator('mat-checkbox').first().click();
  await page.waitForTimeout(600);
  await versionsTab.click();
  await page.waitForTimeout(2500);

  await h.expectVisible('upstream versions panel rendered', 'hxp-manage-versions-sidebar');

  const versionTitles = await page.$$eval(
    'hxp-manage-versions-sidebar .hxp-version-item .hxp-version-title',
    (els) => els.map((el) => (el.textContent ?? '').trim()).filter(Boolean),
  );
  // Three entries: upstream prepends the live document as "current version", then the two
  // Nuxeo versions. Asserting only "the element rendered" would pass on an empty list, which
  // is exactly how the panel fails when the `QUERY` port cannot answer the HXQL statement.
  h.check(
    'the panel lists the live document plus both Nuxeo versions',
    versionTitles.length === 3,
    `rendered ${versionTitles.length}: ${JSON.stringify(versionTitles)}`,
  );
  h.check(
    'version labels are composed from Nuxeo major/minor, newest first',
    versionTitles.includes('0.2') &&
      versionTitles.includes('0.1') &&
      versionTitles.indexOf('0.2') < versionTitles.indexOf('0.1'),
    `rendered ${JSON.stringify(versionTitles)} — Nuxeo sends no versionLabel and ` +
      'Document.GetVersions answers oldest-first, so both the composition and the order are ' +
      "the bridge's work",
  );

  const panelText = await page
    .locator('hxp-manage-versions-sidebar')
    .first()
    .innerText()
    .catch(() => '');
  h.check(
    'the version creator resolves to a name, not a blank or "undefined"',
    panelText.includes('Administrator') && !panelText.includes('undefined'),
    `panel text was ${JSON.stringify(panelText.slice(0, 240))}`,
  );
  h.check(
    'no untranslated MANAGE_VERSIONS keys are rendered',
    !panelText.includes('MANAGE_VERSIONS.'),
    `panel text was ${JSON.stringify(panelText.slice(0, 240))}`,
  );
  await h.screenshot('versions-panel');

  h.step("Adopted: upstream properties sidebar over the document's real Nuxeo metadata");
  
  // The same fixture and the same selection, so this step asserts the *panel*, not the setup.
  // The row is still selected from the Versions step above.
  await tab('Properties').click();
  await page.waitForTimeout(2500);
  await h.expectVisible('upstream properties sidebar rendered', 'hxp-properties-sidebar');

  const propertyLabels = await page.$$eval(
    'hxp-properties-sidebar adf-card-view-item .adf-property-label, ' +
      'hxp-properties-sidebar .adf-property-label',
    (els) => els.map((el) => (el.textContent ?? '').trim()).filter(Boolean),
  );
  h.check(
    'the panel renders property labels, not raw translation keys',
    propertyLabels.length > 0 && !propertyLabels.some((l) => l.includes('DOCUMENT.PROPERTIES.')),
    `rendered ${propertyLabels.length}: ${JSON.stringify(propertyLabels.slice(0, 12))}`,
  );

  // Upstream renders the *other* properties section with `[expanded]="false"`, so its labels are
  // not in `innerText` until it is opened. The first run of this step read a collapsed panel and
  // reported that Nuxeo's metadata was missing when it was there all along — and the section only
  // renders at all under `*ngIf="otherProperties.length > 0"`, so its mere presence already says
  // the list is non-empty. Both facts are asserted: the header exists, and expanding it shows the
  // values.
  const otherHeader = page
    .locator('hxp-properties-sidebar mat-expansion-panel-header')
    .filter({ hasText: /Other Properties/i })
    .first();
  const otherSectionRendered = (await otherHeader.count()) > 0;
  h.check(
    "the panel renders an 'Other Properties' section, which upstream omits when it is empty",
    otherSectionRendered,
    'no Other Properties header — `*ngIf="otherProperties.length > 0"` means the document ' +
      'contributed no non-sys_ properties at all',
  );
  if (otherSectionRendered) {
    await otherHeader.click().catch(() => {});
    await page.waitForTimeout(1200);
  }

  // `innerText` **plus** every input value, and that distinction cost a round of false greens.
  // adf-core renders each property card as a Material form field, so the *values* live in
  // `input.value` and never appear in `innerText`. Two assertions below read only the text and
  // reported green while the screenshot showed `Created` as `2026-08-22T14:23:05.687Z` and
  // `Creator` as `[object Object]`. Both were real defects in the `sys_*` half of the model.
  const propertiesInputs = await page.$$eval(
    'hxp-properties-sidebar input, hxp-properties-sidebar textarea',
    (els) => els.map((el) => el.value ?? '').filter(Boolean),
  );
  const propertiesText = [
    await page
      .locator('hxp-properties-sidebar')
      .first()
      .innerText()
      .catch(() => ''),
    ...propertiesInputs,
  ].join('\n');

  // The load-bearing one. `Object.keys(document)` drives this list, so a document carrying only
  // `sys_*` would render the default section and nothing else. Seeing the fixture's Nuxeo
  // description proves the `prefix_field` property surface reached the panel.
  h.check(
    "the document's real Nuxeo metadata is shown, not just the sys_* set",
    propertiesText.includes('second evidence version'),
    'expected the fixture\'s dc:description — panel text was ' +
      JSON.stringify(propertiesText.slice(0, 400)),
  );

  // Both remaining checks are **negative** — they assert the absence of something — so each is
  // conjoined with `propertiesText.length > 0`. Without that they pass on an empty string, which
  // is exactly what happened on the first run: the panel failed to construct, `propertiesText`
  // was `''`, and two assertions reported green against nothing.
  const panelRendered = propertiesText.length > 0;

  // A date typed as a date rather than defaulting to string. This is what fails if the MODEL
  // port's schema field keys are not prefixed: `getFieldDefinition` finds nothing, every field
  // becomes FieldType.String, and a date renders as a raw ISO timestamp.
  h.check(
    'dates are typed through the MODEL port, not rendered as raw ISO strings',
    panelRendered && !/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(propertiesText),
    panelRendered
      ? `an ISO timestamp is visible, so the model did not type the field — ${JSON.stringify(
          propertiesText.slice(0, 500),
        )}`
      : 'the panel rendered nothing, so this proves nothing',
  );

  // The other half of the same defect. `sys_creator` is a `User` object, so a field typed as
  // `string` stringifies it. This is what the `sys` pseudo-schema in the MODEL mapper exists to
  // prevent, and it is worth its own check because it fails independently of the date typing.
  h.check(
    'user fields resolve to a name, not "[object Object]"',
    panelRendered && !propertiesText.includes('[object Object]'),
    panelRendered
      ? `a User was stringified — ${JSON.stringify(propertiesText.slice(0, 500))}`
      : 'the panel rendered nothing, so this proves nothing',
  );

  // Read-only by construction: `[editable]="false"` is upstream's own mode, so there should be
  // no edit affordance at all rather than one that refuses.
  const editControls = await page
    .locator('hxp-properties-sidebar button')
    .filter({ hasText: /edit|save/i })
    .count();
  h.check(
    'no edit affordance is offered, because Scope A does not write',
    panelRendered && editControls === 0,
    panelRendered
      ? `found ${editControls} edit/save control(s)`
      : 'the panel rendered nothing, so this proves nothing',
  );

  // The Category field, which was empty until `sys_primaryType` started carrying the Nuxeo
  // doctype name. Upstream renders it as a select whose options come from `Model.primaryTypes`, so
  // a synthetic `SysFile` matched nothing and the field showed blank.
  //
  // Read from the select's own trigger rather than from `propertiesText`, because an empty select
  // and a populated one differ only in that element — the surrounding label is present either way,
  // which is exactly how this went unnoticed the first time.
  const categoryValue = await page
    .locator('hxp-properties-sidebar mat-select .mat-mdc-select-value')
    .first()
    .innerText()
    .catch(() => '');
  h.check(
    'the Category select shows the document’s real Nuxeo doctype',
    categoryValue.trim() === 'File',
    `Category read ${JSON.stringify(categoryValue)} — expected the fixture's Nuxeo type "File". ` +
      'Blank means `sys_primaryType` is not a key in `Model.primaryTypes`.',
  );
  await h.screenshot('properties-panel');
  


  h.step('Health');
  // sys_acl assertions - principal lookups are async and complete after the properties panel renders
  h.check(
    'the bridge probes the directory to classify ACL principals',
    principalLookups.some((url) => /\/group\//.test(url)),
    `${principalLookups.length} principal lookup(s): ${JSON.stringify(principalLookups.slice(0, 4))}`,
  );
  const distinctPrincipals = new Set(principalLookups);
  // Informational: the test loads multiple documents, and each probe tries /group/ then /user/, so
  // 2× the distinct count is expected minimum. The exact ratio depends on how many documents are
  // loaded and whether they share principals.
  h.note(
    `${principalLookups.length} principal lookup(s) for ${distinctPrincipals.size} distinct principal(s) — ` +
    `ratio ${(principalLookups.length / distinctPrincipals.size).toFixed(1)}:1 ` +
    `(2.0:1 means perfect caching with group-then-user probes)`,
  );
  h.expectNoConsoleErrors('no unexpected browser console errors', ENVIRONMENTAL_ERRORS);
  h.note(
    'card view, thumbnails and the error/retry state — rendered by the hand-written ' +
      'component today and not covered here; they must be asserted before it is deleted',
  );
}
