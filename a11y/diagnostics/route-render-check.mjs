#!/usr/bin/env node
/**
 * Route render probe — the negative control for every route an accessibility scan visits.
 *
 * An empty screen scans clean. That is the single most dangerous failure mode in this repository's
 * accessibility tooling, because it produces a **green result that means nothing**, and it has
 * already happened three times:
 *
 *   - `phase-6-a11y.mjs` shipped a step labelled "Login surface" that actually scanned the
 *     dashboard, caught only because a selector assertion failed;
 *   - the same file's "browse cards" step scanned the table view, because the view mode is held in
 *     a service and survived navigation;
 *   - and it still scans `/#/collections`, which has **no matching route** — `collectionsRoutes`
 *     declares exactly one path, `:uid`, so the bare path renders nothing and the clean result is
 *     counted as a pass. That is `docs/accessibility.md` gap 5.
 *
 * Two of those were found by a selector assertion. The third was never caught because that step has
 * no selector assertion. This script is that assertion, applied uniformly to every route rather
 * than to whichever ones somebody remembered.
 *
 * It runs no axe and needs no scanner, so it is seconds rather than minutes and can be run before
 * any scan to establish that the scan will have something to look at.
 *
 * Prerequisites:
 *   npm install --no-save @playwright/test
 *   npm run beta:backend && npx nx serve nuxeo-ui
 *
 * Usage:
 *   node a11y/diagnostics/route-render-check.mjs
 *
 * Exit codes: 0 every route rendered, 1 at least one rendered nothing, 2 could not measure.
 */
const baseUrl = process.env['APP_URL'] ?? 'http://localhost:4200';
const user = process.env['NUXEO_USER'] ?? 'Administrator';
const pass = process.env['NUXEO_PASS'] ?? 'Administrator';

const SESSION_KEY = 'agentic_ui_nuxeo_session';
const SIGNED_OUT_KEY = 'agentic_ui_signed_out';

/**
 * Every route `phase-6-a11y.mjs` scans, with the feature host it must render.
 *
 * `/#/collections` is listed with the host it *would* need. It is expected to fail, and that
 * expectation is the point — a probe whose every row passes on the day it is written has not been
 * shown to be capable of failing.
 */
const ROUTES = [
  ['landing', '/', 'app-shell'],
  ['browse', '/#/browse', 'lib-browse'],
  ['search', '/#/search', 'lib-search'],
  ['trash', '/#/trash', 'lib-trash'],
  ['tasks', '/#/tasks', 'lib-tasks-page'],
  ['collections', '/#/collections', 'lib-collection-detail'],
  ['administration', '/#/administration', 'lib-administration-shell'],
  ['knowledge-discovery', '/#/knowledge-discovery', 'lib-knowledge-discovery'],
  ['browse-adf-hx', '/#/browse-adf-hx', 'lib-browse-adf-hx-poc'],
];

let chromium;
try {
  ({ chromium } = await import('@playwright/test'));
} catch (err) {
  console.error(
    `route-render-check: cannot measure — ${err instanceof Error ? err.message : err}\n` +
      '  npm install --no-save @playwright/test',
  );
  process.exit(2);
}

const browser = await chromium.launch({ headless: process.env['A11Y_HEADED'] !== '1' });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  httpCredentials: { username: user, password: pass, origin: baseUrl },
});
const page = await context.newPage();

/** @type {{label:string, route:string, host:string, hostPresent:boolean, textLen:number}[]} */
const results = [];

try {
  const probe = await page.request.get(`${baseUrl}/nuxeo/api/v1/me`, { failOnStatusCode: false });
  if (probe.status() !== 200) {
    console.error(
      `route-render-check: cannot measure — ${baseUrl}/nuxeo/api/v1/me returned ${probe.status()}.`,
    );
    process.exit(2);
  }

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await page.evaluate(
    ({ key, value, signedOutKey }) => {
      sessionStorage.setItem(key, value);
      sessionStorage.removeItem(signedOutKey);
    },
    {
      key: SESSION_KEY,
      signedOutKey: SIGNED_OUT_KEY,
      value: JSON.stringify({
        kind: 'basic',
        username: user,
        basic: Buffer.from(`${user}:${pass}`).toString('base64'),
        isAdministrator: user.toLowerCase() === 'administrator',
        groups: [],
      }),
    },
  );
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  for (const [label, route, host] of ROUTES) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    const hostPresent = await page
      .locator(host)
      .first()
      .isVisible()
      .catch(() => false);

    // Text length of whatever the router actually rendered, as a second, host-independent signal.
    // A route that matches nothing leaves the outlet empty, so this collapses to roughly the
    // chrome's own text while a real surface is an order of magnitude larger.
    const textLen = await page
      .evaluate(() => (document.querySelector('main, [role="main"]') ?? document.body).innerText.trim().length)
      .catch(() => 0);

    results.push({ label, route, host, hostPresent, textLen });
  }
} finally {
  await context.close();
  await browser.close();
}

console.log(`App: ${baseUrl}\n`);
console.log(`${'route'.padEnd(24)}${'expected host'.padEnd(28)}${'rendered'.padEnd(10)}${'main text'.padStart(10)}`);
for (const r of results) {
  console.log(
    `${r.route.padEnd(24)}${r.host.padEnd(28)}${(r.hostPresent ? 'yes' : 'NO').padEnd(10)}${String(r.textLen).padStart(10)}`,
  );
}

const dead = results.filter((r) => !r.hostPresent);
if (dead.length > 0) {
  console.log(
    `\n--- ${dead.length} route(s) rendered nothing an accessibility scan could meaningfully check ---`,
  );
  for (const r of dead) {
    console.log(`  ${r.route} — ${r.host} absent, main region holds ${r.textLen} characters`);
  }
  console.log(
    '\nA scan of these routes returns clean because there is nothing on them, not because they are\n' +
      'accessible. Either fix the route, or remove it from the scan — do not leave it counting as a pass.',
  );
  process.exit(1);
}

console.log('\nroute-render-check: PASS — every scanned route rendered its feature host.');
