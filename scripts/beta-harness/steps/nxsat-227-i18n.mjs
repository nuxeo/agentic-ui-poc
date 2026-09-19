/**
 * NXSAT-227 — i18n: the accessible-name fix, and the Layer 0 language key doing something visible.
 *
 * Run:  npm run beta:evidence -- nxsat-227-i18n
 *
 * ## What this file is built to prove, and what it deliberately does not
 *
 * It proves three things:
 *
 *   1. No control anywhere in the shell is named with a raw translation key — read off the
 *      rendered DOM, not off a catalogue file. That is the acceptance criterion, and it is the
 *      one an audit would check.
 *   2. The document tree's folder toggle has a real accessible name. This is the W13 defect: the
 *      catalogue holds `DOCUMENT_TREE.TOGGLE_ARIA-LABEL` and upstream asks for the same key with
 *      a trailing space, so before the alias every toggle was announced as
 *      `DOCUMENT_TREE.TOGGLE_ARIA-LABEL <folder name>`.
 *   3. Setting the Layer 0 `defaultLanguage` key to `fr` renders French chrome after a reload,
 *      with no rebuild. Without this the key is configuration that changes nothing.
 *
 * ## Two traps this file is shaped around
 *
 * **The reload is the assertion.** `withHashLocation()` makes `page.goto('/#/x')` a
 * same-document navigation, so `APP_INITIALIZER` does not re-run and a swapped `defaultLanguage`
 * is never read. A locale check written without `page.reload()` passes on the *English* app and
 * certifies nothing. `AGENTS/11-beta-program.md` §3 records this costing a previous run six
 * false failures. Every language switch below goes through `reloadApp`.
 *
 * **The bootstrap route must be registered before the first navigation and must answer
 * `no-store`.** Registered later, the browser serves the already-cached `bootstrap.json` and the
 * interception is never seen.
 *
 * ## Not covered
 *
 * RTL is out of scope (NXSAT-227 open decision Q3, tracked as DS-2277), so no mirrored layout is
 * asserted. Date, number and currency formatting are untouched — `LOCALE_ID` is not wired to the
 * selected language, so a French UI still renders English-formatted dates. Neither is a gap this
 * capture hides; both are recorded in `docs/i18n-localization-plan.md`.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BOOTSTRAP_ROUTE = '**/agentic-ui-config/bootstrap.json';

/**
 * A locale no catalogue ships, used by the last step to prove the tolerant path.
 *
 * Named once because it appears in three places — the bootstrap swap, the console-error
 * suppression and the step label — and a suppression that drifted from the locale it excuses
 * would silently hide a real missing catalogue.
 */
const UNSHIPPED_LOCALE = 'xx';

/**
 * Console errors this environment produces regardless of the change under test.
 *
 * The manifest 403 is the tolerant path working as designed: this local Nuxeo has no
 * `/default-domain/config/agentic-ui` document, the application falls back to its packaged
 * defaults, and the browser logs an entry for the denied request whether or not the application
 * handled it. `phase-1-config.mjs` asserts the present and absent manifest cases separately and
 * suppresses the same set for the same reason.
 *
 * The AI operations 500 because the `AI.*` marketplace package is not installed here — recorded
 * in `CLAUDE.md` as expected, not a client defect.
 */
const ENVIRONMENTAL_ERRORS = [
  /automation\/AI\./,
  '/nuxeo/logout',
  '/nuxeo/api/v1/path/default-domain/config/agentic-ui',
  // `GET /api/v1/group/Administrator` 404s because `Administrator` is a user, not a group. It
  // appears only once the adf-hx nav drawer is opened, comes from upstream's user resolution,
  // and has nothing to do with translation. Suppressed rather than left to fail a capture it is
  // not about — but it is a real 404 on every drawer open and worth a ticket of its own.
  '/nuxeo/api/v1/group/',
  // The five catalogue 404s that step 7 **induces on purpose** by asking for a locale no
  // catalogue ships. They are the tolerant path working: `AppTranslateLoader` answers each
  // failed folder fetch with `{}` and the app renders English. The browser still logs a console
  // entry for a 404 whether or not the application handled it.
  //
  // Narrowed to this one locale rather than `/i18n/` — a missing `fr.json` must still fail, and
  // a blanket pattern would have hidden exactly the defect this capture exists to catch.
  `/i18n/${UNSHIPPED_LOCALE}.json`,
];

/** The global search box in the header, by class — see `app-shell.component.html`. */
const HEADER_SEARCH_INPUT = 'input.header-search-input';

/** The file the marketplace package installs. Served verbatim for the English pass. */
const PACKAGED_BOOTSTRAP = readFileSync(
  resolve(process.cwd(), 'nuxeo-agentic-ui-package/src/main/config/bootstrap.json'),
  'utf8',
);

/**
 * A raw translation key rendered where a human-readable string belongs.
 *
 * Both our own lowercase dotted keys and upstream's SCREAMING_CASE ones: `nav.refresh` and
 * `DOCUMENT_TREE.TOGGLE_ARIA-LABEL`. Anchored, so a sentence that merely contains a dotted word
 * does not match, and it requires at least two dot-separated segments so a filename like
 * `report.pdf` is not mistaken for a key.
 */
const RAW_KEY = /^[A-Za-z][A-Za-z0-9_-]*(\.[A-Za-z0-9_-]+)+$/;

/** Routes the shell reaches without needing a document id. */
const ROUTES = [
  '/#/browse',
  '/#/search',
  '/#/documents',
  '/#/collections',
  '/#/tasks',
  '/#/trash',
  '/#/settings/themes',
  '/#/browse-adf-hx',
];

/** Forces a full document reload so `APP_INITIALIZER` re-reads configuration. */
async function reloadApp(page) {
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
}

/**
 * Every accessible name and visible label on the page that is a raw translation key.
 *
 * Reads `aria-label`, `title` and the text of leaf elements. Leaf elements only, because an
 * ancestor's `textContent` concatenates its children and would never match an anchored pattern —
 * an earlier DOM-based version of this check passed while the defect was present for exactly
 * that reason, which is recorded in `phase-6-a11y.mjs`.
 */
async function rawKeysOnPage(page) {
  return page.evaluate((source) => {
    const pattern = new RegExp(source);
    const offences = [];

    for (const element of document.querySelectorAll('[aria-label], [title]')) {
      for (const attribute of ['aria-label', 'title']) {
        const value = element.getAttribute(attribute);
        if (value && pattern.test(value.trim())) {
          offences.push(`${element.tagName.toLowerCase()}[${attribute}]="${value.trim()}"`);
        }
      }
    }

    for (const element of document.querySelectorAll('*')) {
      if (element.children.length > 0) continue;
      const text = (element.textContent ?? '').trim();
      if (text && pattern.test(text)) {
        offences.push(`${element.tagName.toLowerCase()} text="${text}"`);
      }
    }

    return [...new Set(offences)];
  }, RAW_KEY.source);
}

/** The bootstrap file with `defaultLanguage` swapped, leaving everything else alone. */
function bootstrapWithLanguage(language) {
  const config = JSON.parse(PACKAGED_BOOTSTRAP);
  config.defaultLanguage = language;
  return JSON.stringify(config, null, 2);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {ReturnType<import('../helpers.mjs').createHelpers>} h
 */
export default async function run(page, h) {
  let bootstrapBody = PACKAGED_BOOTSTRAP;
  /**
   * Every `defaultLanguage` the interception actually served, in order.
   *
   * Instrumentation that earns its place: "the placeholder is French" failing tells you the
   * locale did not apply but not whether the swap reached the browser at all. This separates a
   * broken interception from a broken language switch, and it makes the reload falsifiable —
   * if `page.reload()` were removed, this list would stop growing.
   */
  const servedLanguages = [];

  await page.route(BOOTSTRAP_ROUTE, (route) => {
    servedLanguages.push(JSON.parse(bootstrapBody).defaultLanguage);
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'cache-control': 'no-store' },
      body: bootstrapBody,
    });
  });

  // ---------------------------------------------------------------------------
  h.step('The packaged English application renders no raw translation keys');
  await h.login();
  await h.expectVisible('app shell rendered', 'app-shell');

  const shellKeys = await rawKeysOnPage(page);
  h.check(
    'no raw translation key is rendered on the shell',
    shellKeys.length === 0,
    shellKeys.join('\n      '),
  );
  await h.screenshot('en-shell-no-raw-keys');

  // ---------------------------------------------------------------------------
  h.step('The document tree toggle has a real accessible name, not the raw key');
  // The tree lives in the app shell's nav drawer and only mounts when the route is entered
  // through the platform nav item, because the shell owns the drawer state — a direct `goTo`
  // renders the page with no drawer and therefore no tree. `AGENTS/11-beta-program.md` §3
  // records this, and a first run of this file asserted against zero toggle buttons because it
  // navigated straight to the URL.
  await h.goTo('/#/browse');
  await page.waitForTimeout(1200);
  const navEntry = page
    .locator('a,button')
    .filter({ hasText: /adf-hx/i })
    .first();
  h.check('the platform nav offers the adf-hx entry', (await navEntry.count()) > 0);
  await navEntry.click().catch(() => {});
  await page.waitForTimeout(3000);
  await h.expectVisible('the nav drawer mounted', 'hxp-browse-nav-drawer');
  await h.expectVisible('the upstream document tree rendered', 'hxp-document-tree');

  // Zero toggles would make every name assertion below vacuously true, so the count is asserted
  // before the names are read.
  const toggles = page.locator('hxp-document-tree button[aria-label]');
  const toggleCount = await toggles.count();
  h.check(
    'the document tree rendered at least one folder toggle to inspect',
    toggleCount > 0,
    `found ${toggleCount} toggle button(s) in hxp-document-tree`,
  );

  if (toggleCount > 0) {
    const names = await toggles.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('aria-label') ?? ''),
    );
    const rawNames = names.filter((name) => RAW_KEY.test(name.trim()));
    h.check(
      'no folder toggle is announced with a raw translation key',
      rawNames.length === 0,
      rawNames.join(', '),
    );
    h.check(
      'every folder toggle begins with the translated word, not the key',
      names.every((name) => name.trim().startsWith('Toggle')),
      names.join(' | '),
    );
    h.check(
      'no folder toggle has an empty accessible name',
      names.every((name) => name.trim() !== ''),
      `${names.filter((name) => name.trim() === '').length} empty of ${names.length}`,
    );
  }
  await h.screenshot('en-document-tree-toggle-accessible-name');

  // ---------------------------------------------------------------------------
  h.step('No interactive control in the shell has an empty accessible name');
  // The regression test for finding 4.6: a blank `aria-label` on a control is a control with no
  // accessible name — axe `button-name`, critical — and it is invisible without a screen reader.
  //
  // Scoped to interactive elements, and that scope is the honest one rather than a convenient
  // one. A broad sweep also catches upstream's `<adf-datatable-row aria-label="">`, which is a
  // row and not a control, so it cannot fail `button-name` and is not what 4.6 was about. Those
  // rows belong to the ARIA problems already reported as upstream finding 1.2; failing this
  // capture on them would attribute upstream's debt to this change and make the check unusable
  // on any page rendering a document list.
  const INTERACTIVE = 'button, a, input, select, textarea, [role="button"], [role="link"]';
  const blanks = await page.evaluate((selector) => {
    const offenders = [];
    for (const element of document.querySelectorAll(selector)) {
      if (!element.hasAttribute('aria-label')) continue;
      if ((element.getAttribute('aria-label') ?? '').trim() !== '') continue;
      offenders.push(`${element.tagName.toLowerCase()}.${element.className || '(no class)'}`);
    }
    return offenders;
  }, INTERACTIVE);
  h.check(
    'no interactive control carries an empty aria-label',
    blanks.length === 0,
    blanks.join(', '),
  );
  h.note(
    'Upstream emits `<adf-datatable-row aria-label="">` on document-list rows. Those are not ' +
      'controls, so they cannot fail axe `button-name`; they are part of the DataTable ARIA ' +
      'problems already reported as finding 1.2 in docs/adf-hx-upstream-findings.md, and this ' +
      'step deliberately does not fail on them.',
  );

  // ---------------------------------------------------------------------------
  h.step('Every shell route is free of raw translation keys');
  const offendingRoutes = [];
  for (const route of ROUTES) {
    await h.goTo(route);
    await page.waitForTimeout(1200);
    const found = await rawKeysOnPage(page);
    if (found.length > 0) offendingRoutes.push(`${route}: ${found.join(', ')}`);
  }
  h.check(
    `all ${ROUTES.length} shell routes render no raw translation key`,
    offendingRoutes.length === 0,
    offendingRoutes.join('\n      '),
  );

  // ---------------------------------------------------------------------------
  h.step('Layer 0 defaultLanguage: fr renders French chrome after a reload');
  bootstrapBody = bootstrapWithLanguage('fr');
  // Back to a plain route first: the earlier steps left the adf-hx nav drawer open, and a
  // drawer full of upstream inputs is not what the header assertions are about.
  await h.goTo('/#/browse');
  const servedBeforeFrench = servedLanguages.length;
  await reloadApp(page);
  await h.expectVisible('app shell rendered in French pass', 'app-shell');

  h.check(
    'the reload really re-fetched the configuration, and it said fr',
    servedLanguages.length > servedBeforeFrench &&
      servedLanguages[servedLanguages.length - 1] === 'fr',
    `served so far: ${JSON.stringify(servedLanguages)}`,
  );

  const frenchPlaceholder = await page.locator(HEADER_SEARCH_INPUT).getAttribute('placeholder');
  h.check(
    'the global search placeholder is French',
    frenchPlaceholder === 'Rechercher des documents, des utilisateurs ou des groupes',
    `placeholder was "${frenchPlaceholder}"`,
  );

  const frenchAssistant = await page
    .locator('[aria-label="Assistant IA"]')
    .count()
    .catch(() => 0);
  h.check(
    'the assistant button is announced in French',
    frenchAssistant > 0,
    `found ${frenchAssistant} element(s) with the French accessible name`,
  );

  const frenchKeys = await rawKeysOnPage(page);
  h.check(
    'the French application renders no raw translation key either',
    frenchKeys.length === 0,
    frenchKeys.join('\n      '),
  );
  await h.screenshot('fr-shell-french-chrome');

  // ---------------------------------------------------------------------------
  h.step('French survives an adf-hx surface, which is where it used to silently revert');
  // The regression test for W14, and the gap this capture originally had.
  //
  // adf-core's `TranslationService` reads the locale from its own `UserPreferencesService` and
  // calls `translate.use(...)` on the shared ngx-translate instance when it constructs. So the
  // language chosen from `defaultLanguage` held on the seven ordinary shell routes and reverted
  // to English the moment any adf-hx surface rendered — the `/#/browse-adf-hx` route or the
  // adf-hx nav drawer — with no page reload involved.
  //
  // The earlier version of this file asserted French **only after navigating to `/#/browse`**,
  // which is precisely the navigation that avoids the defect. It passed 25/25 with the bug
  // live. That is why this step drives the adf-hx surfaces explicitly rather than trusting the
  // shell.
  await h.goTo('/#/browse-adf-hx');
  await page.waitForTimeout(3000);
  await h.expectVisible('the adf-hx POC route rendered', 'lib-browse-adf-hx-poc');

  const adfHxRoutePlaceholder = await page.locator(HEADER_SEARCH_INPUT).getAttribute('placeholder');
  h.check(
    'the adf-hx route keeps the configured language',
    adfHxRoutePlaceholder === frenchPlaceholder,
    `shell was "${frenchPlaceholder}", adf-hx route is "${adfHxRoutePlaceholder}"`,
  );

  // Upstream's own catalogue should now resolve in French too — it ships `fr`, and before the
  // fix it was being fetched as `en`. The tree root is upstream's `DOCUMENT_TREE.ROOT`.
  const treeRoot = await page
    .locator('hxp-document-tree')
    .first()
    .innerText()
    .catch(() => '');
  h.check(
    'upstream adf-hx strings resolve in the configured language, not English',
    treeRoot.includes('Accueil'),
    `tree text was ${JSON.stringify(treeRoot.slice(0, 80))} — expected upstream's French root`,
  );
  await h.screenshot('fr-adf-hx-surface-keeps-french');

  // ---------------------------------------------------------------------------
  h.step('German is a second locale, so the switch is not a one-off fixture');
  bootstrapBody = bootstrapWithLanguage('de');
  await reloadApp(page);
  await h.expectVisible('app shell rendered in German pass', 'app-shell');

  const germanPlaceholder = await page.locator(HEADER_SEARCH_INPUT).getAttribute('placeholder');
  h.check(
    'the global search placeholder is German',
    germanPlaceholder === 'Dokumente, Benutzer oder Gruppen suchen',
    `placeholder was "${germanPlaceholder}"`,
  );
  h.check(
    'the German and French placeholders differ, so the catalogue is really being chosen',
    germanPlaceholder !== frenchPlaceholder,
    `fr="${frenchPlaceholder}" de="${germanPlaceholder}"`,
  );
  await h.screenshot('de-shell-german-chrome');

  // ---------------------------------------------------------------------------
  h.step('An unknown locale degrades to English rather than to raw keys');
  // The tolerance claim: a customer who sets a language we ship no catalogue for must get a
  // working application, not a page of keys.
  bootstrapBody = bootstrapWithLanguage(UNSHIPPED_LOCALE);
  await reloadApp(page);
  await h.expectVisible('app shell rendered for an unknown locale', 'app-shell');

  const fallbackKeys = await rawKeysOnPage(page);
  h.check(
    'an unshipped locale renders no raw translation key',
    fallbackKeys.length === 0,
    fallbackKeys.join('\n      '),
  );
  const fallbackPlaceholder = await page.locator(HEADER_SEARCH_INPUT).getAttribute('placeholder');
  h.check(
    'an unshipped locale falls back to the English string',
    fallbackPlaceholder === 'Search documents, users or groups',
    `placeholder was "${fallbackPlaceholder}"`,
  );

  // Strings degrading is only half of tolerant. Angular's date, number and currency pipes throw
  // `NG0701` for a locale with no registered data rather than degrading, so an unshipped locale
  // used to give English text and a broken date in every list — eleven `InvalidPipeArgument`
  // errors on one pass. Strings were fine throughout, which is what made it easy to miss.
  //
  // Asserted here rather than left to the console-error step because that step's suppression
  // list would have been the tempting place to put it, and suppressing it would have hidden a
  // real product defect behind a capture that reported PASS.
  const dateCell = await page
    .locator('lib-browse, lib-browse-adf-hx-poc')
    .first()
    .innerText()
    .catch(() => '');
  h.check(
    'an unshipped locale still renders dates rather than throwing',
    !dateCell.includes('InvalidPipeArgument'),
    `page text contained a pipe error: ${JSON.stringify(dateCell.slice(0, 120))}`,
  );
  await h.screenshot('xx-shell-falls-back-to-english');

  h.note(
    'Read the French and German screenshots as proof of the MECHANISM, not of a localised ' +
      'application. Extraction is scoped to apps/nuxeo-ui shell chrome, so the header search ' +
      'is French while the nav item labels, the document-list column headers and the adf-hx ' +
      'browse toolbar are still English — those strings live in libs/ and are NXSAT-284. ' +
      'Anyone looking at the screenshot will notice; this says so first.',
  );
  h.note(
    'RTL is not exercised: it is out of scope for NXSAT-227 (open decision Q3) and tracked ' +
      'against DS-2277. Nothing here asserts a mirrored layout.',
  );
  h.note(
    'Date, number and currency formatting are not localised. LOCALE_ID is not wired to the ' +
      'selected language, so the French and German passes still render English-formatted dates. ' +
      'Recorded as known debt in docs/i18n-localization-plan.md.',
  );
  h.note(
    'The fr and de catalogues in this run are developer-supplied bootstrap translations, not ' +
      'translation-crew output. Crowdin is the source of truth for every non-English locale ' +
      'once the project exists (slice S6); these prove the mechanism, not the wording.',
  );

  // ---------------------------------------------------------------------------
  h.step('Health');
  bootstrapBody = PACKAGED_BOOTSTRAP;
  await reloadApp(page);
  h.check(
    'the configuration was re-fetched on every language switch',
    servedLanguages.length >= 5,
    `served: ${JSON.stringify(servedLanguages)}`,
  );
  h.expectNoConsoleErrors('no unexpected browser console errors', ENVIRONMENTAL_ERRORS);
}
