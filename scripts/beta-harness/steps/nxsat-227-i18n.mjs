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

  await page.route(BOOTSTRAP_ROUTE, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'cache-control': 'no-store' },
      body: bootstrapBody,
    }),
  );

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
  // The tree is the shell's nav drawer, so it is already mounted. Its toggles only exist once a
  // folder with children has loaded, which is why this asserts the count first: zero toggles
  // would make the name assertion vacuously true.
  await h.goTo('/#/browse');
  await page.waitForTimeout(2000);

  const toggles = page.locator('hxp-document-tree button[mat-icon-button][aria-label]');
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
  h.step('No control anywhere in the shell has an empty accessible name');
  // The regression test for finding 4.6: a blank `aria-label` is a control with no accessible
  // name, axe `button-name` critical, and it is invisible without a screen reader.
  const blanks = await page.evaluate(() =>
    [...document.querySelectorAll('[aria-label]')]
      .filter((element) => (element.getAttribute('aria-label') ?? '').trim() === '')
      .map((element) => element.tagName.toLowerCase()),
  );
  h.check('no element carries an empty aria-label', blanks.length === 0, blanks.join(', '));

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
  await reloadApp(page);
  await h.expectVisible('app shell rendered in French pass', 'app-shell');

  const frenchPlaceholder = await page
    .locator('input[placeholder]')
    .first()
    .getAttribute('placeholder');
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
  h.step('German is a second locale, so the switch is not a one-off fixture');
  bootstrapBody = bootstrapWithLanguage('de');
  await reloadApp(page);
  await h.expectVisible('app shell rendered in German pass', 'app-shell');

  const germanPlaceholder = await page
    .locator('input[placeholder]')
    .first()
    .getAttribute('placeholder');
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
  bootstrapBody = bootstrapWithLanguage('xx');
  await reloadApp(page);
  await h.expectVisible('app shell rendered for an unknown locale', 'app-shell');

  const fallbackKeys = await rawKeysOnPage(page);
  h.check(
    'an unshipped locale renders no raw translation key',
    fallbackKeys.length === 0,
    fallbackKeys.join('\n      '),
  );
  const fallbackPlaceholder = await page
    .locator('input[placeholder]')
    .first()
    .getAttribute('placeholder');
  h.check(
    'an unshipped locale falls back to the English string',
    fallbackPlaceholder === 'Search documents, users or groups',
    `placeholder was "${fallbackPlaceholder}"`,
  );
  await h.screenshot('xx-shell-falls-back-to-english');

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
  h.expectNoConsoleErrors();
}
