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
 * fetched and hashed on both the default and customised loads and asserted
 * byte-identical, so a difference in the rendered UI can only have come from
 * configuration. That is stronger than editing a source file, which would leave
 * "did the dev server rebuild it?" open.
 *
 * Not every check here is load-bearing. Roughly a third are negative or fallback
 * assertions — `data-app-theme` is non-null, no inline token overrides on the
 * default pass, the default title is unchanged, and both tolerant-failure steps —
 * which would still pass if configuration loading were entirely dead. They are
 * worth keeping as regression guards, but the claim of the phase rests on
 * steps 5-8, where a swapped configuration body has to change observable state.
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

import { createHash } from 'node:crypto';
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

const INSTALL_XML = readFileSync(
  resolve(process.cwd(), 'nuxeo-agentic-ui-package/src/main/resources/install.xml'),
  'utf8',
);
const ASSEMBLY_XML = readFileSync(
  resolve(process.cwd(), 'nuxeo-agentic-ui-package/src/main/assemble/assembly.xml'),
  'utf8',
);

/**
 * Deployment facts about the target server, established by first-hand inspection
 * of the running `nuxeo` container rather than assumed:
 *
 *   $ docker exec nuxeo grep docBase /opt/nuxeo/server/conf/Catalina/localhost/nuxeo.xml
 *     <Context ... docBase="../nxserver/nuxeo.war" ...>
 *   $ docker exec nuxeo ls /opt/nuxeo/server/nxserver/web
 *     root.war
 *
 * So the `/nuxeo` context is served out of `nxserver/nuxeo.war`, and
 * `nxserver/web` is not a docBase at all — a file installed there is never
 * reachable over HTTP. Phase 1 originally installed the bootstrap file into
 * `nxserver/web/nuxeo.war/agentic-ui-config` and it would have 404'd in every
 * real deployment. The checks below exist so that regression cannot recur
 * silently.
 */
const SERVER_HOME = '${env.server.home}';
const TOMCAT_DOC_BASE = `${SERVER_HOME}/nxserver/nuxeo.war`;
/** Production base href of the packaged application. */
const PRODUCTION_BASE_HREF = 'https://server.example/nuxeo/agentic-ui/';
/** Web context path the docBase above is mounted at. */
const CONTEXT_PATH = '/nuxeo';

/**
 * The `todir` of the `install.xml` copy step that installs `${package.root}/config`.
 *
 * @returns {string | null}
 */
function installedConfigDir() {
  const match = INSTALL_XML.match(
    /<copy\s+dir="\$\{package\.root\}\/config"\s+todir="([^"]+)"/,
  );
  return match ? match[1] : null;
}

/**
 * The `todir` of the destructive `overwrite="true"` copy, and the assembly
 * output directories staged beneath its source (`${package.root}/web`).
 */
function destructiveCopy() {
  const match = INSTALL_XML.match(
    /<copy\s+dir="\$\{package\.root\}\/web"\s+todir="([^"]+)"\s+overwrite="true"/,
  );
  const stagedUnderWeb = [...ASSEMBLY_XML.matchAll(/<outputDirectory>([^<]+)<\/outputDirectory>/g)]
    .map((m) => m[1])
    .filter((dir) => dir === '/web' || dir.startsWith('/web/'));
  return { todir: match ? match[1] : null, stagedUnderWeb };
}

/**
 * SHA-256 over the bytes of every `<script src>` the page actually loaded, plus
 * their URLs.
 *
 * The earlier version of this check compared the `src` *attributes*, which in a
 * dev build are the single unhashed `main.js` — so it compared `"main.js"` with
 * `"main.js"` and would have passed after a full rebuild with entirely different
 * bytes. Fetching and hashing the content is what actually makes "no rebuild
 * took place" falsifiable. `page.request` bypasses page routes, so this reads
 * the real bundle rather than an interception fixture.
 *
 * @param {import('@playwright/test').Page} page
 */
async function bundleFingerprint(page) {
  const sources = await page.evaluate(() =>
    [...document.querySelectorAll('script[src]')]
      .map((s) => new URL(s.getAttribute('src') ?? '', document.baseURI).href)
      .sort(),
  );
  const digest = createHash('sha256');
  let bytes = 0;
  for (const src of sources) {
    const response = await page.request.get(src, { headers: { 'cache-control': 'no-cache' } });
    const body = await response.body();
    bytes += body.length;
    digest.update(src);
    digest.update(body);
  }
  return { count: sources.length, bytes, digest: digest.digest('hex') };
}

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
  // The application resolves the configuration URL relative to its own base
  // href. Under production packaging that is `/nuxeo/agentic-ui/`, so the URL is
  // `/nuxeo/agentic-ui-config/bootstrap.json`. Strip the context path and what is
  // left is the path Tomcat looks up under its docBase.
  const productionUrl = new URL('../agentic-ui-config/bootstrap.json', PRODUCTION_BASE_HREF)
    .pathname;
  const servedFrom = `${TOMCAT_DOC_BASE}${productionUrl.slice(CONTEXT_PATH.length)}`;
  const configDir = installedConfigDir();
  h.check(
    'the installer targets the directory the /nuxeo context is actually served from',
    configDir !== null && `${configDir}/bootstrap.json` === servedFrom,
    `install.xml installs into "${configDir}", but ${productionUrl} is served from "${servedFrom}"`,
  );

  const { todir: webCopyTodir, stagedUnderWeb } = destructiveCopy();
  const overwrittenDirs = stagedUnderWeb.map((dir) => `${webCopyTodir}${dir.slice('/web'.length)}`);
  h.check(
    'the installed configuration directory is outside the destructive copy',
    configDir !== null &&
      overwrittenDirs.length > 0 &&
      !overwrittenDirs.some((dir) => configDir === dir || configDir.startsWith(`${dir}/`)),
    `overwrite="true" replaces ${overwrittenDirs.join(', ')}; config installs into "${configDir}"`,
  );

  const defaultBundle = await bundleFingerprint(page);
  h.check(
    'the running bundle could be fingerprinted',
    defaultBundle.count > 0 && defaultBundle.bytes > 0,
    `${defaultBundle.count} scripts, ${defaultBundle.bytes} bytes`,
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
  const customisedBundle = await bundleFingerprint(page);
  h.check(
    'the JavaScript bundle bytes are unchanged — no rebuild took place',
    customisedBundle.count > 0 && customisedBundle.digest === defaultBundle.digest,
    `bundle content hash differed:\n` +
      `  before ${defaultBundle.digest} (${defaultBundle.count} scripts, ${defaultBundle.bytes} bytes)\n` +
      `  after  ${customisedBundle.digest} (${customisedBundle.count} scripts, ${customisedBundle.bytes} bytes)`,
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
