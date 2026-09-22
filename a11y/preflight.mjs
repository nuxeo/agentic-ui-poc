#!/usr/bin/env node
/**
 * Refuse to run an accessibility scan against a stack that is not there.
 *
 * A scan of a page that did not render is clean, fast and worthless — the vacuous pass this
 * repository has been caught by repeatedly. Playwright's own behaviour when the dev server is
 * absent is a wall of navigation timeouts, which reads as product failures rather than as
 * "nothing was serving".
 *
 * Deliberately a sibling of `scripts/beta-harness/e2e-preflight.mjs` rather than a flag on it.
 * The critical-path suite needs Playwright and a live stack; this needs both a11y-scout
 * tarballs as well, and a missing tarball must cost the accessibility run and nothing else.
 * Keeping it here is also what lets `a11y/` be deleted without editing a shared script.
 *
 * Exits **2**, not 1 — the `precondition-not-met` convention `phase-runner.mjs` established:
 * fix the environment, do not iterate on the code.
 */

import { nuxeoBasicAuthHeader } from './env.mjs';

const BASE = process.env['E2E_BASE_URL'] ?? 'http://localhost:4200';

const problems = [];
const ok = [];

/**
 * Credentials first, because this is the "startup validation" the security rule asks for and
 * because every later check depends on them. Reported as a problem rather than thrown, so one
 * run lists everything that is wrong instead of one thing at a time.
 */
let auth = null;
try {
  auth = nuxeoBasicAuthHeader();
  ok.push('NUXEO_USER and NUXEO_PASS are set');
} catch (error) {
  problems.push(error instanceof Error ? error.message : String(error));
}

const INSTALL = [
  '    npm install --no-save @playwright/test @axe-core/playwright \\',
  '      <path>/a11y-scout-0.3.0.tgz <path>/a11y-scout-playwright-0.3.0.tgz',
  '',
  '  All packages in ONE command: `npm install --no-save X` prunes anything previously',
  '  installed with --no-save, so installing them separately removes the first.',
].join('\n');

/** 1. Playwright and the two hand-distributed a11y-scout packages. */
let playwright = null;
for (const pkg of ['@playwright/test', '@a11y-scout/playwright', 'a11y-scout']) {
  try {
    const mod = await import(pkg);
    if (pkg === '@playwright/test') playwright = mod;
    ok.push(`${pkg} is importable`);
  } catch {
    problems.push(
      `\`${pkg}\` is not installed. None of these are tracked dependencies — the a11y-scout\n` +
        '  packages are distributed by hand and resolve from no registry, and Playwright is\n' +
        '  kept untracked so CI installs stay unaffected by a browser download.\n\n' +
        INSTALL,
    );
  }
}

/**
 * 1b. Chromium, checked by launching rather than by looking for a directory.
 *
 * A partially extracted download leaves the path in place and fails at launch, and "the folder
 * exists" is not the claim being made. Chromium only: this suite runs no WebKit project.
 */
if (playwright) {
  try {
    const browser = await playwright.chromium.launch();
    const v = browser.version();
    await browser.close();
    ok.push(`chromium launches (${v})`);
  } catch (err) {
    const first = (err instanceof Error ? err.message : String(err)).split('\n')[0];
    problems.push(`\`chromium\` will not launch: ${first}\n\n    npx playwright install chromium`);
  }
}

/** 2. The app, served. */
let appStatus = null;
try {
  const res = await fetch(BASE, { redirect: 'manual', signal: AbortSignal.timeout(5000) });
  appStatus = res.status;
  if (res.status >= 200 && res.status < 400) ok.push(`the app answers at ${BASE} (${res.status})`);
  else problems.push(`${BASE} answered ${res.status}, so the app is not serving normally.`);
} catch {
  problems.push(
    `Nothing is serving at ${BASE}.\n\n` +
      '    npx nx serve nuxeo-ui\n\n' +
      '  Without this every scan fails as a navigation timeout, which reads as a broken suite\n' +
      '  rather than one missing server.',
  );
}

/**
 * 3. Nuxeo, through the app's own proxy, with documents in it.
 *
 * Reached via the proxy rather than :8080 directly, because the proxy is what the specs use —
 * testing :8080 would pass while a broken `proxy.conf.json` failed every scan.
 *
 * The document count is load-bearing twice over here. Surfaces and interaction states scan
 * lists and dialogs that are empty without content, and `journey.a11y.spec.ts` resolves a real
 * `File` uid to open the document-detail screen at all.
 */
if (appStatus !== null && auth) {
  try {
    const url = new URL('/nuxeo/api/v1/search/lang/NXQL/execute', BASE);
    url.searchParams.set(
      'query',
      "SELECT * FROM File WHERE ecm:mixinType <> 'HiddenInNavigation' AND ecm:isTrashed = 0",
    );
    url.searchParams.set('pageSize', '1');
    const res = await fetch(url, {
      headers: { Authorization: auth, 'X-NXproperties': '*' },
      signal: AbortSignal.timeout(15000),
    });
    if (res.status !== 200) {
      problems.push(
        `Nuxeo answered ${res.status} through the dev proxy at ${BASE}/nuxeo/api/v1/…\n` +
          '  Check the container is up (`docker ps`) and NUXEO_USER / NUXEO_PASS are right.',
      );
    } else {
      const body = await res.json();
      // Existence comes from the returned entries, not from `resultsCount`.
      //
      // `resultsCount` is not a plain count: Nuxeo returns negative sentinels for "unknown"
      // — notably with an elasticsearch page provider — and `resultsCount ?? entries.length`
      // selects the sentinel, because -2 is neither null nor undefined. A populated
      // repository then reads as empty and every scan is refused. Flagged in review on
      // PR #225; it does not reproduce on this instance, which returns a real count, but the
      // ordering is wrong regardless and `entries` answers the question being asked.
      const returned = Array.isArray(body.entries) ? body.entries.length : 0;
      if (returned > 0) {
        const total = typeof body.resultsCount === 'number' && body.resultsCount >= 0
          ? `${body.resultsCount} File document(s)`
          : 'File documents (exact count not reported by this page provider)';
        ok.push(`Nuxeo has ${total} to scan against`);
      } else {
        problems.push(
          'Nuxeo is reachable but returned no File documents.\n' +
            '  A scan of an empty list is clean and proves nothing, and the document-detail\n' +
            '  screen cannot be reached at all. Import a document first.',
        );
      }
    }
  } catch (error) {
    problems.push(
      `Could not query Nuxeo through the proxy: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * 4. The LLM provider — reported, never enforced.
 *
 * Without `HAIP_API_KEY` a11y-scout runs in mock mode, where axe, the keyboard walk and reflow
 * all still produce real findings but the AI content-quality checks are **skipped entirely**.
 * That covers eleven WCAG criteria (1.1.1, 1.3.3, 2.4.2, 2.4.4, 2.5.3, 3.3.1, 3.3.2 at A;
 * 1.3.5, 2.4.6, 3.1.2, 3.3.3 at AA), so an empty semantic result means "not measured", not
 * "clean". Saying so up front is the difference between a partial scan and a misread one.
 */
ok.push(
  process.env['HAIP_API_KEY']
    ? 'HAIP_API_KEY is set — AI content-quality checks will be ATTEMPTED. A key is not proof ' +
        'they ran: on 2026-09-22 the provider reported READY, billed 15 calls, and every ' +
        'content-quality call still returned 403. Check `aiGenerated` in the report; 0 means ' +
        'unmeasured, not clean.'
    : 'HAIP_API_KEY is NOT set — scan runs in mock mode, AI content-quality checks skipped ' +
        '(11 WCAG criteria unmeasured, not clean)',
);

if (problems.length) {
  console.error(`\na11y preflight: PRECONDITION NOT MET — ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`- ${p}\n`);
  if (ok.length) console.error(`  Satisfied: ${ok.join('; ')}\n`);
  process.exit(2);
}

console.log('a11y preflight: pass — the stack is ready');
for (const o of ok) console.log(`  - ${o}`);
