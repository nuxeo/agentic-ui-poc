/**
 * Phase 1 — Layer 0: upgrade-safe configuration.
 *
 * The claim this phase makes is narrow and testable: **configuration alone
 * changes behaviour, with no rebuild**. Everything below exists to make that
 * falsifiable rather than asserted.
 *
 * The method matters. The customised passes do not edit a file and rebuild —
 * a single route handler answers the exact URL the running application fetches,
 * and the body it serves is swapped between passes. The JavaScript bundle is
 * asserted identical across the default and customised loads, so a difference in
 * the rendered UI can only have come from configuration. That is stronger than
 * editing a source file, which would leave "did the dev server rebuild it?" open.
 *
 * Two things learned while first running this, both encoded below:
 *
 * 1. The handler must be installed **before the first navigation** and must
 *    answer with `Cache-Control: no-store`. Registering it later has no effect,
 *    because the browser serves the already-cached `bootstrap.json` without
 *    issuing a request that interception could see. This cost the first run four
 *    false failures.
 * 2. `/#/settings/themes` is in the settings drawer, so the shell header shows
 *    "Themes" rather than falling back to the branded application title. Branding
 *    is therefore asserted on `document.title`, which is unambiguous and is also
 *    the value a customer notices first.
 * 3. The application uses `withHashLocation()`, so navigating between routes is a
 *    same-document fragment change. `page.goto('/#/other')` therefore does *not*
 *    re-bootstrap Angular, the `APP_INITIALIZER` does not re-run, and swapped
 *    configuration is never fetched. Every configuration change below is followed
 *    by an explicit `reloadApp`. This cost the second run six false failures, and
 *    is exactly the kind of thing a screenshot-only capture would have missed.
 *
 * The steps, in order:
 *   1-4. The packaged default reproduces today's behaviour. If adopting
 *        configuration changed anything for a customer who configured nothing,
 *        the phase would be a regression rather than a feature.
 *   5-7. A customised bootstrap file rebrands the product, overrides theme
 *        tokens and adds a whole theme — same bundle, no rebuild.
 *   8.   The runtime manifest, served as a Nuxeo configuration document,
 *        relabels the product.
 *   9-10. Tolerant failure: malformed configuration and an absent configuration
 *        document must both leave a working application. A fresh install is in
 *        the second state, so it is not an edge case.
 *
 * Prerequisites:
 *   docker start nuxeo          (container `nuxeo`, published on 8080)
 *   npx nx serve nuxeo-ui       (separate terminal)
 *
 * Run:
 *   npm run beta:evidence -- phase-1-config
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Console errors this environment always produces.
 *
 * The first two are carried over from `phase-0-baseline.mjs`: the `AI.*`
 * operations come from a marketplace package that is not installed on a plain
 * local Nuxeo, and the app probes `/nuxeo/logout` on boot.
 *
 * The last two are the tolerant path working as designed, and step 9 induces them
 * on purpose. An unconfigured install has neither a configuration file nor a
 * configuration document, and the browser logs a console entry for any 404
 * regardless of whether the application handled it. Suppressing them here hides
 * nothing: steps 7 and 9 assert the present and absent cases separately, and the
 * count of ignored errors is still reported.
 */
const ENVIRONMENTAL_ERRORS = [
  /automation\/AI\./,
  '/nuxeo/logout',
  '/nuxeo/api/v1/path/default-domain/config/agentic-ui',
  '/agentic-ui-config/bootstrap.json',
];

const BOOTSTRAP_ROUTE = '**/agentic-ui-config/bootstrap.json';
const MANIFEST_ROUTE = '**/api/v1/path/default-domain/config/agentic-ui';
const BOOTSTRAP_PATH = '/agentic-ui-config/bootstrap.json';

/** The file the marketplace package installs. Served verbatim for the default passes. */
const PACKAGED_BOOTSTRAP = readFileSync(
  resolve(process.cwd(), 'nuxeo-agentic-ui-package/src/main/config/bootstrap.json'),
  'utf8',
);

/** Values a customer could plausibly want, chosen so each is visible in the UI. */
const CUSTOMISED_BOOTSTRAP = {
  branding: { applicationTitle: 'Acme Content Cloud', documentTitle: 'Acme Content Cloud' },
  defaultThemeId: 'acme',
  themes: [
    {
      id: 'acme',
      label: 'Acme Brand',
      base: 'light',
      preview: {
        sidebar: '#2d0b4e',
        surface: '#f6f2fb',
        header: '#e6dcf5',
        accent: '#7b2ff7',
        tile: '#d9c9f0',
      },
      // Inline custom properties on <html>: this is what makes a rebrand a JSON
      // edit rather than a Sass change and a new bundle.
      tokens: { '--mat-sys-primary': 'rgb(123, 47, 247)', '--agentic-pill-radius': '4px' },
    },
  ],
};

/** Served from the `note:note` property of the Nuxeo configuration document. */
const CUSTOMISED_MANIFEST = {
  version: 1,
  labels: {
    'settings.themes.title': 'Appearance',
    'settings.themes.apply': 'Use this one',
  },
  featureToggles: { 'acme.pilot': true },
};

/**
 * Read the state configuration is supposed to control, from the live DOM.
 *
 * @param {import('@playwright/test').Page} page
 */
function readConfiguredState(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    return {
      themeAttribute: root.getAttribute('data-app-theme'),
      themeId: root.dataset['appThemeId'] ?? null,
      inlinePrimary: root.style.getPropertyValue('--mat-sys-primary').trim(),
      computedPrimary: getComputedStyle(root).getPropertyValue('--mat-sys-primary').trim(),
      pillRadius: root.style.getPropertyValue('--agentic-pill-radius').trim(),
      documentTitle: document.title,
      scriptSet: [...document.querySelectorAll('script[src]')]
        .map((s) => s.getAttribute('src'))
        .sort()
        .join(','),
    };
  });
}

/**
 * Force a full document reload so the `APP_INITIALIZER` re-reads configuration.
 *
 * @param {import('@playwright/test').Page} page
 */
async function reloadApp(page) {
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {ReturnType<import('../helpers.mjs').createHelpers>} h
 */
export default async function run(page, h) {
  /** Mutable bodies for the two configuration URLs, swapped between passes. */
  let bootstrapBody = PACKAGED_BOOTSTRAP;
  /** `null` lets the real Nuxeo answer, which is a 404 on an unconfigured instance. */
  let manifestBody = null;

  // Installed before the first navigation and answering `no-store`, so that
  // every later reload actually re-requests the configuration instead of reusing
  // a cached copy.
  await page.route(BOOTSTRAP_ROUTE, (route) =>
    route.fulfill({
      status: bootstrapBody === null ? 404 : 200,
      contentType: 'application/json',
      headers: { 'cache-control': 'no-store' },
      body: bootstrapBody ?? 'Not Found',
    }),
  );
  await page.route(MANIFEST_ROUTE, (route) =>
    manifestBody === null
      ? route.fallback()
      : route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: { 'cache-control': 'no-store' },
          body: typeof manifestBody === 'string' ? manifestBody : JSON.stringify(manifestBody),
        }),
  );

  // ---------------------------------------------------------------------------
  // The packaged default must change nothing.
  // ---------------------------------------------------------------------------
  h.step('The configuration file is served from outside the application bundle');
  await h.login();
  await h.expectVisible('app shell rendered', 'app-shell');

  // `page.request` is not subject to page routes, so this asks the dev server for
  // the real file rather than the interception fixture.
  const served = await page.request.get(`${h.baseUrl}${BOOTSTRAP_PATH}`);
  h.check(
    'the dev server really serves the sibling configuration path',
    served.status() === 200,
    `HTTP ${served.status()} for ${BOOTSTRAP_PATH}`,
  );
  const baseHref = await page.evaluate(() => document.baseURI);
  h.check(
    'the configured path is a sibling of the bundle, not a child of it',
    new URL('../agentic-ui-config/bootstrap.json', baseHref).pathname === BOOTSTRAP_PATH,
    `resolved ${new URL('../agentic-ui-config/bootstrap.json', baseHref).pathname} from ${baseHref}`,
  );

  const defaults = await readConfiguredState(page);
  h.check(
    'the packaged default theme is applied',
    defaults.themeAttribute !== null,
    `data-app-theme was ${defaults.themeAttribute}`,
  );
  h.check(
    'the default config sets no inline token overrides',
    defaults.inlinePrimary === '' && defaults.pillRadius === '',
    `inline overrides present: primary "${defaults.inlinePrimary}", radius "${defaults.pillRadius}"`,
  );
  h.check(
    'the compiled palette still supplies a primary colour',
    defaults.computedPrimary !== '',
    'computed --mat-sys-primary was empty, so the Sass theme did not apply',
  );
  h.check(
    'the default browser title is unchanged from the current release',
    defaults.documentTitle === 'Nuxeo Platform',
    `document.title was "${defaults.documentTitle}"`,
  );
  await h.screenshot('default-config-shell');

  h.step('Default configuration reproduces production browse unchanged');
  await h.goTo('/#/browse');
  await h.expectVisible('browse page rendered', 'lib-browse');
  await h.expectText('repository content listed', 'lib-browse', 'Default domain');
  await h.screenshot('default-config-production-browse');

  h.step('Default configuration reproduces the adf-hx POC route unchanged');
  await h.goTo('/#/browse-adf-hx');
  await h.expectVisible('POC page rendered', 'lib-browse-adf-hx-poc');
  await h.expectVisible('hxp document list present', 'hxp-document-list');
  await h.expectText('Nuxeo children listed', 'hxp-document-list', 'Default domain');
  await h.screenshot('default-config-adf-hx-browse');

  h.step('Translations resolve rather than leaking raw keys');
  await h.goTo('/#/settings/themes');
  await h.expectVisible('themes page rendered', 'app-themes-page');
  await h.expectText('translated page title rendered', 'app-themes-page', 'Themes');
  const pageText = await page.locator('app-themes-page').innerText();
  h.check(
    'no untranslated keys are visible',
    !pageText.includes('settings.themes.'),
    'a raw translation key reached the DOM',
  );
  const packagedThemeCount = await page.locator('app-themes-page .theme-card').count();
  h.check(
    'the four packaged themes are offered',
    packagedThemeCount === 4,
    `found ${packagedThemeCount} theme cards`,
  );
  await h.screenshot('default-config-themes-page');

  // ---------------------------------------------------------------------------
  // The same bundle, different configuration.
  // ---------------------------------------------------------------------------
  h.step('A customised configuration file rebrands the application, with no rebuild');
  bootstrapBody = JSON.stringify(CUSTOMISED_BOOTSTRAP);
  // Clear the stored preference so the *configured* default is what applies.
  await page.evaluate(() => localStorage.removeItem('agentic_ui_color_theme'));
  await h.goTo('/#/settings/themes');
  await reloadApp(page);

  const customised = await readConfiguredState(page);
  h.check(
    'the JavaScript bundle is unchanged — no rebuild took place',
    customised.scriptSet === defaults.scriptSet && customised.scriptSet !== '',
    `script set differed:\n  before ${defaults.scriptSet}\n  after  ${customised.scriptSet}`,
  );
  h.check(
    'configured branding reaches the browser title',
    customised.documentTitle === 'Acme Content Cloud',
    `document.title was "${customised.documentTitle}"`,
  );
  h.check(
    'the configured theme is selected as the default',
    customised.themeId === 'acme',
    `active theme id was ${customised.themeId}`,
  );
  h.check(
    'the configured theme falls back to its named compiled palette',
    customised.themeAttribute === 'light',
    `data-app-theme was ${customised.themeAttribute}`,
  );
  h.check(
    'the configured token overrides the compiled primary colour',
    customised.inlinePrimary === 'rgb(123, 47, 247)',
    `inline --mat-sys-primary was "${customised.inlinePrimary}"`,
  );
  h.check(
    'a non-colour design token is configurable too',
    customised.pillRadius === '4px',
    `--agentic-pill-radius was "${customised.pillRadius}"`,
  );
  await h.screenshot('customised-config-theme-applied');

  h.step('The configured theme set is open, not the four compiled ones');
  const customisedThemeCount = await page.locator('app-themes-page .theme-card').count();
  h.check(
    'a fifth theme added in JSON appears in the picker',
    customisedThemeCount === 5,
    `found ${customisedThemeCount} theme cards, expected 5`,
  );
  await h.expectText('the configured theme label is rendered', 'app-themes-page', 'Acme Brand');
  await h.screenshot('customised-config-theme-picker');

  h.step('The runtime manifest relabels the product from a Nuxeo document');
  manifestBody = {
    'entity-type': 'document',
    path: '/default-domain/config/agentic-ui',
    properties: { 'note:note': JSON.stringify(CUSTOMISED_MANIFEST) },
  };
  await reloadApp(page);
  await h.expectText('manifest label overrides the shipped string', 'app-themes-page', 'Appearance');
  await h.expectText('manifest label overrides a button', 'app-themes-page', 'Use this one');
  const stillRenders = await page.locator('app-themes-page .theme-card').count();
  h.check(
    'relabelling did not break the page it relabelled',
    stillRenders === 5,
    `found ${stillRenders} theme cards`,
  );
  await h.screenshot('customised-manifest-labels');

  // ---------------------------------------------------------------------------
  // Failure paths.
  // ---------------------------------------------------------------------------
  h.step('A malformed configuration file degrades to the packaged defaults');
  bootstrapBody = '{"branding": {"applicationTitle": ';
  manifestBody = '{"labels": ';
  await h.goTo('/#/browse');
  await reloadApp(page);
  await h.expectVisible('browse page still renders', 'lib-browse');
  await h.expectText('repository content still listed', 'lib-browse', 'Default domain');
  const afterMalformed = await readConfiguredState(page);
  h.check(
    'the packaged theme is restored rather than left half-applied',
    afterMalformed.inlinePrimary === '' && afterMalformed.pillRadius === '',
    `inline overrides survived: primary "${afterMalformed.inlinePrimary}"`,
  );
  h.check(
    'the packaged branding is restored',
    afterMalformed.documentTitle === 'Nuxeo Platform',
    `document.title was "${afterMalformed.documentTitle}"`,
  );
  await h.screenshot('malformed-config-falls-back');

  h.step('An absent configuration file and document leave a working application');
  bootstrapBody = null;
  manifestBody = null;
  await h.goTo('/#/browse-adf-hx');
  await reloadApp(page);
  await h.expectVisible('POC page renders with no configuration at all', 'lib-browse-adf-hx-poc');
  await h.expectText('Nuxeo children still listed', 'hxp-document-list', 'Default domain');
  await h.goTo('/#/settings/themes');
  await reloadApp(page);
  await h.expectText(
    'shipped translations still resolve without a manifest',
    'app-themes-page',
    'Themes',
  );
  const unconfigured = await readConfiguredState(page);
  h.check(
    'the packaged defaults are in force',
    unconfigured.documentTitle === 'Nuxeo Platform' && unconfigured.inlinePrimary === '',
    `title "${unconfigured.documentTitle}", inline primary "${unconfigured.inlinePrimary}"`,
  );
  await h.screenshot('absent-config-still-works');

  h.step('Configuration health');
  h.expectNoConsoleErrors('no unexpected browser console errors', ENVIRONMENTAL_ERRORS);
}
