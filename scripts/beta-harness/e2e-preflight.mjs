#!/usr/bin/env node
/**
 * Refuse to run the E2E suite against a stack that is not there.
 *
 * Playwright's own behaviour when the dev server is absent is a wall of navigation
 * timeouts, which reads as thirteen product failures. The real message — "nothing was
 * serving" — is nowhere in it. Worse is the other direction: a suite pointed at a live app
 * with an **empty** Nuxeo passes every render assertion and proves nothing, which is the
 * vacuous-pass shape this repository has been caught by repeatedly.
 *
 * So three preconditions, each with the specific fix, and **exit 2** rather than 1 — the
 * `precondition-not-met` convention `phase-runner.mjs` established: fix the environment,
 * do not iterate on the code.
 *
 * Usage:
 *   node scripts/beta-harness/e2e-preflight.mjs
 */

const BASE = process.env['E2E_BASE_URL'] ?? 'http://localhost:4200';
const USER = process.env['NUXEO_USER'] ?? 'Administrator';
const PASS = process.env['NUXEO_PASS'] ?? 'Administrator';
const auth = `Basic ${Buffer.from(`${USER}:${PASS}`).toString('base64')}`;

const problems = [];
const ok = [];

/** 1. Playwright, which is deliberately not a tracked dependency. */
try {
  await import('@playwright/test');
  ok.push('@playwright/test is importable');
} catch {
  problems.push(
    '`@playwright/test` is not installed. It is intentionally not a tracked dependency,\n' +
      '  so CI installs stay unaffected by a browser download:\n\n' +
      '    npm install --no-save @playwright/test\n' +
      '    npx playwright install chromium',
  );
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
      '  Without this every spec fails as a navigation timeout, which reads as thirteen\n' +
      '  product defects rather than one missing server.',
  );
}

/**
 * 3. Nuxeo, through the app's own proxy, **with documents in it**.
 *
 * Reached via the proxy rather than :8080 directly, because the proxy is what the specs
 * use — testing :8080 would pass while a broken `proxy.conf.json` failed every spec.
 *
 * The document count is the load-bearing part. Every critical-path spec asserts repository
 * data, so an empty repository is not a pass, it is an untested run.
 */
if (appStatus !== null) {
  try {
    const url = new URL('/nuxeo/api/v1/search/lang/NXQL/execute', BASE);
    url.searchParams.set(
      'query',
      "SELECT * FROM Document WHERE ecm:primaryType = 'File' AND ecm:isTrashed = 0",
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
      const count = body.resultsCount ?? body.entries?.length ?? 0;
      if (count > 0) {
        ok.push(`Nuxeo has ${count} File document(s) the specs can assert against`);
      } else {
        problems.push(
          'Nuxeo is reachable but holds no File documents.\n' +
            '  Every critical-path spec asserts repository data, so an empty repository is not\n' +
            '  a pass — it is a run that tested nothing. Import a document first.',
        );
      }
    }
  } catch (error) {
    problems.push(
      `Could not query Nuxeo through the proxy: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

if (problems.length) {
  console.error(`\ne2e-preflight: PRECONDITION NOT MET — ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`- ${p}\n`);
  if (ok.length) console.error(`  Satisfied: ${ok.join('; ')}\n`);
  // 2, not 1: fix the environment, do not iterate on the code.
  process.exit(2);
}

console.log('e2e-preflight: pass — the stack is ready');
for (const o of ok) console.log(`  - ${o}`);
