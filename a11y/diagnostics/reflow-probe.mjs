#!/usr/bin/env node
/**
 * Negative control for a11y-scout's reflow scanner (WCAG 1.4.10).
 *
 * ## Why this exists
 *
 * Reflow is one of the three capabilities a11y-scout was adopted for, and across every report
 * on disk — 81 findings over seven routes, 71 over seven interaction states, 12 on login — it
 * has produced **zero** findings. That is either a clean bill of health or a scanner that
 * cannot fail, and this repository's rule is that the two are indistinguishable until you have
 * watched the check go red on purpose.
 *
 * ## What the scanner actually does, and why zero is plausible
 *
 * `node_modules/a11y-scout/src/scanners/reflow.ts` resizes to 320×256, reads
 * `documentElement.scrollWidth`, and — this is the part that matters here — attributes the
 * overflow. An element that overflows is ignored if it is inside one of:
 *
 *     table, pre, svg, [role="img"], [role="application"]
 *
 * which WCAG 1.4.10 exempts as "content that by usage requires two-dimensional layout". A
 * violation is reported only when at least one overflowing element sits OUTSIDE all of those.
 *
 * This application renders its primary surfaces as `mat-table`, which emits a real `<table>`.
 * So a zero is exactly what a correct scanner should return here, and the interesting question
 * is not "is the app clean" but "would this scanner notice if it were not".
 *
 * ## What this prints
 *
 * Per route: the 320px `scrollWidth`, whether anything overflows, and if so whether every
 * offender is inside an exempt subtree. The last column is the scanner's verdict reproduced
 * independently. A route that overflows via a NON-exempt element and was still reported clean
 * by a11y-scout would mean the scanner is broken.
 *
 * Run:  node a11y/diagnostics/reflow-probe.mjs
 */

import { nuxeoBasicAuthHeader, requireNuxeoCredentials, resolveBaseUrl } from '../env.mjs';
import { surfaceUnusableReason } from '../surface.mjs';

const REFLOW_WIDTH = 320;
const REFLOW_HEIGHT = 256;
const TOLERANCE = 4;
const EXEMPT = ['table', 'pre', 'svg', '[role="img"]', '[role="application"]'];

// One resolver for every command in this folder — see `resolveBaseUrl` for why there used to
// be two and what that broke. This file read `A11Y_BASE_URL` at one point, a third name that
// nothing else honoured, so the documented override silently did nothing here.
const baseUrl = resolveBaseUrl();
// Required, never defaulted — see `../env.mjs` for why a default is worse than an error here.
const { username: user, password: pass } = requireNuxeoCredentials();

/**
 * Refuse to measure a backend that is not answering.
 *
 * `run.mjs` skips the shared preflight for the diagnostics, on the grounds that a 20-second
 * answer should not wait on a document query. That reasoning holds for the other two, which
 * assert something about the page they load — but this one measures *geometry*, and an error
 * panel has perfectly good geometry. A route whose data failed to load would be measured as a
 * clean layout and reported as `fits`. Flagged in review on PR #225.
 *
 * Cheap enough to always run: one request, and it is the difference between measuring the app
 * and measuring its error state.
 */
async function requireBackend() {
  const url = new URL('/nuxeo/api/v1/me', baseUrl);
  try {
    const res = await fetch(url, {
      headers: { Authorization: nuxeoBasicAuthHeader() },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.status !== 200) {
      console.error(
        `reflow-probe: Nuxeo answered ${res.status} at ${url}. Every route would render an\n` +
          '  error panel, and an error panel has a perfectly measurable layout — the probe\n' +
          '  would report "fits" for surfaces it never saw.\n',
      );
      process.exit(2);
    }
  } catch (error) {
    console.error(
      `reflow-probe: could not reach Nuxeo through ${baseUrl}: ` +
        `${error instanceof Error ? error.message : String(error)}\n\n` +
        '    npm run beta:backend && npx nx serve nuxeo-ui\n',
    );
    process.exit(2);
  }
}

await requireBackend();

/** Same seven surfaces `surfaces.a11y.spec.ts` scans, so the comparison is like for like. */
const ROUTES = [
  ['browse', '/#/browse', 'lib-browse'],
  ['search', '/#/search', 'lib-search'],
  ['trash', '/#/trash', 'lib-trash'],
  ['tasks', '/#/tasks', 'lib-tasks-page'],
  ['administration', '/#/administration', 'lib-administration-shell'],
  ['knowledge-discovery', '/#/knowledge-discovery', 'lib-knowledge-discovery'],
  ['browse-adf-hx', '/#/browse-adf-hx', 'lib-browse-adf-hx-poc'],
];

let chromium;
try {
  ({ chromium } = await import('@playwright/test'));
} catch (err) {
  console.error(
    `reflow-probe: cannot measure — ${err instanceof Error ? err.message : err}\n` +
      '  npm install --no-save @playwright/test @axe-core/playwright',
  );
  process.exit(2);
}

const browser = await chromium.launch({ headless: process.env['A11Y_HEADED'] !== '1' });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  httpCredentials: { username: user, password: pass, origin: baseUrl },
});
// The route guard reads sessionStorage, and `httpCredentials` alone only satisfies the XHRs.
// Both mechanisms are required — see `apps/nuxeo-ui-e2e/src/fixtures.ts`.
await context.addInitScript(
  ({ key, value }) => {
    sessionStorage.setItem(key, value);
    sessionStorage.removeItem('agentic_ui_signed_out');
  },
  {
    key: 'agentic_ui_nuxeo_session',
    value: JSON.stringify({
      kind: 'basic',
      username: user,
      basic: Buffer.from(`${user}:${pass}`).toString('base64'),
      isAdministrator: user.toLowerCase() === 'administrator',
      groups: [],
    }),
  },
);

/**
 * Measure horizontal overflow at the narrow viewport and classify it.
 *
 * Extracted so the route loop and the negative control run **the same code**. They did not
 * before: the control only checked that injecting a 900px div raised `scrollWidth`, which
 * exercises none of the exempt/non-exempt attribution that actually decides `VIOLATION`. A
 * broken classification path — the part most likely to break, and the part that had already
 * been wrong once with the truncation bug — would still have printed `detection path: WORKS`.
 * A control that cannot fail for the reason the tool fails is decoration. Flagged in review
 * on PR #225.
 *
 * @param {import('@playwright/test').Page} p
 */
async function measureReflow(p) {
  const m = await p.evaluate(
    ({ width, exempt, tol }) => {
      const root = document.documentElement;
      const sw = root.scrollWidth;
      const offenders = [];
      const exemptSel = exempt.join(',');
      for (const el of Array.from(root.querySelectorAll('*'))) {
        const r = el.getBoundingClientRect();
        if (r.right <= width + tol) continue;
        const sel = el.id
          ? `#${el.id}`
          : `${el.tagName.toLowerCase()}${
              (el.getAttribute('class') || '').split(/\s+/).filter(Boolean)[0]
                ? '.' + (el.getAttribute('class') || '').split(/\s+/).filter(Boolean)[0]
                : ''
            }`;
        offenders.push({ sel, exempt: !!el.closest(exemptSel), right: Math.round(r.right) });
      }

      // Classify BEFORE truncating, and count in the page rather than outside it.
      //
      // This previously returned `offenders.slice(0, 200)` and the caller filtered for
      // non-exempt afterwards. On a page with more than 200 overflowing elements — which the
      // exemption list exists precisely because this app has — a single non-exempt offender
      // in DOM position 201 was discarded, `nonExempt.length` came out 0, and the verdict
      // printed `exempt` instead of `VIOLATION`. A diagnostic that under-reports the thing it
      // exists to find is worse than no diagnostic.
      //
      // The cap now applies only to the sample carried out for display.
      const nonExempt = offenders.filter((o) => !o.exempt);
      return {
        scrollWidth: sw,
        total: offenders.length,
        nonExemptCount: nonExempt.length,
        firstNonExempt: nonExempt[0]?.sel,
        sample: nonExempt.slice(0, 20),
      };
    },
    { width: REFLOW_WIDTH, exempt: EXEMPT, tol: TOLERANCE },
  );

  const overflows = m.scrollWidth > REFLOW_WIDTH + TOLERANCE;
  return {
    ...m,
    overflows,
    verdict: overflows && m.nonExemptCount > 0 ? 'VIOLATION' : overflows ? 'exempt' : 'fits',
  };
}

const page = await context.newPage();
const rows = [];
let couldNotMeasure = 0;

for (const [label, route, host] of ROUTES) {
  try {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle', timeout: 45_000 });

    // Waiting for the host is not enough, and the `/me` preflight does not cover this: it
    // proves the backend is reachable, not that THIS route's data request succeeded. A route
    // whose data failed renders the same host with an error panel inside it, and an error
    // panel is the one layout guaranteed not to overflow — it would be measured as `fits`.
    const unusable = await surfaceUnusableReason(page, host, label);
    if (unusable) {
      couldNotMeasure += 1;
      rows.push({ label, error: unusable });
      continue;
    }

    await page.setViewportSize({ width: REFLOW_WIDTH, height: REFLOW_HEIGHT });
    await page.addStyleTag({
      content: `*, *::before, *::after { transition: none !important; animation: none !important; }`,
    });
    await page.waitForTimeout(400);

    const m = await measureReflow(page);
    rows.push({
      label,
      scrollWidth: m.scrollWidth,
      overflows: m.overflows,
      total: m.total,
      nonExempt: m.nonExemptCount,
      firstNonExempt: m.firstNonExempt,
      verdict: m.verdict,
    });
  } catch (err) {
    couldNotMeasure += 1;
    rows.push({
      label,
      error: err instanceof Error ? err.message.split('\n')[0] : String(err),
    });
  }
}

await browser.close();

console.log(`\nreflow probe @ ${REFLOW_WIDTH}x${REFLOW_HEIGHT} — ${baseUrl}\n`);
console.log(
  `  ${'route'.padEnd(22)}${'scrollW'.padStart(8)}${'overflowing'.padStart(13)}${'non-exempt'.padStart(12)}  verdict`,
);
console.log(`  ${'-'.repeat(70)}`);
for (const r of rows) {
  if (r.error) {
    console.log(`  ${r.label.padEnd(22)}${'—'.padStart(8)}${''.padStart(13)}${''.padStart(12)}  could not measure: ${r.error}`);
    continue;
  }
  console.log(
    `  ${r.label.padEnd(22)}${String(r.scrollWidth).padStart(8)}${String(r.total).padStart(13)}${String(r.nonExempt).padStart(12)}  ${r.verdict}` +
      (r.firstNonExempt ? `  (${r.firstNonExempt})` : ''),
  );
}

const violations = rows.filter((r) => r.verdict === 'VIOLATION');
const exempted = rows.filter((r) => r.verdict === 'exempt');
const fits = rows.filter((r) => r.verdict === 'fits');
console.log(
  [
    '',
    `  ${violations.length} route(s) overflow via a NON-exempt element — a11y-scout should report these`,
    `  ${exempted.length} route(s) overflow only inside exempt subtrees (table/pre/svg) — correctly silent`,
    `  ${fits.length} route(s) do not scroll horizontally at all (scrollWidth <= ${REFLOW_WIDTH + TOLERANCE})`,
    '',
    // Said explicitly because the two middle columns invite the opposite reading. Hundreds of
    // elements have a bounding rect extending past 320px on every route, yet `scrollWidth` is
    // exactly 320: they are clipped by an ancestor that hides overflow — the closed
    // `mat-sidenav` drawer — so they never contribute to the document's scroll extent. Clipped
    // content is not a 1.4.10 failure, and the scanner returns early on `scrollWidth` before it
    // ever attributes an offender. The "non-exempt" column therefore says nothing about
    // conformance here; it is printed to make that early return visible rather than assumed.
    '  Note: the overflow columns count elements whose bounding rect exceeds 320px. On every',
    '  route those are clipped by the closed mat-sidenav drawer, so scrollWidth stays at 320 and',
    '  the scanner returns a pass before attribution runs. Clipped content is not a 1.4.10 fail.',
    '',
    violations.length > 0
      ? '  a11y-scout reported ZERO reflow findings. Any VIOLATION above is a scanner defect.'
      : '  Consistent with a11y-scout reporting zero — but a zero that was never seen to be a',
    violations.length > 0 ? '' : '  non-zero proves nothing. Re-run with --negative-control.',
    '',
  ]
    .filter((l) => l !== '')
    .join('\n') + '\n',
);

/**
 * Negative control: inject a 900px-wide, non-exempt element and confirm the verdict flips.
 *
 * What this proves and what it does not. It exercises the same algorithm the scanner runs —
 * resize, read `scrollWidth`, attribute the first offender outside `EXEMPT_SELECTORS` — and
 * shows that path reaching VIOLATION on this application. It does **not** execute a11y-scout's
 * own binary, so it validates the logic this probe reproduces rather than the package. That is
 * the honest limit of a control written outside the tool.
 */
if (process.argv.includes('--negative-control')) {
  const browser2 = await chromium.launch({ headless: process.env['A11Y_HEADED'] !== '1' });
  const ctx2 = await browser2.newContext({
    viewport: { width: REFLOW_WIDTH, height: REFLOW_HEIGHT },
    httpCredentials: { username: user, password: pass, origin: baseUrl },
  });
  const p2 = await ctx2.newPage();
  await p2.goto(`${baseUrl}/#/browse`, { waitUntil: 'networkidle', timeout: 45_000 });

  // Same check as the measurement loop. A control run against an error panel would still
  // "prove" the detection path works, but it would prove it on a page nobody is measuring.
  const controlUnusable = await surfaceUnusableReason(p2, 'lib-browse', 'negative control');
  if (controlUnusable) {
    console.error(`\nreflow-probe: cannot run the negative control — ${controlUnusable}\n`);
    await ctx2.close();
    await browser2.close();
    process.exit(2);
  }

  // Both measurements go through `measureReflow`, the function the route loop uses, so the
  // control exercises the exempt/non-exempt attribution rather than only `scrollWidth`.
  const before = await measureReflow(p2);
  await p2.evaluate(() => {
    const d = document.createElement('div');
    d.id = 'reflow-negative-control';
    d.style.cssText = 'width:900px;height:8px;background:red';
    document.body.appendChild(d);
  });
  await p2.waitForTimeout(200);
  const after = await measureReflow(p2);
  await browser2.close();

  // The claim is the VERDICT flipped to VIOLATION, not merely that a number grew. An injected
  // 900px div is non-exempt by construction, so if classification is broken the verdict comes
  // back `exempt` while `scrollWidth` still rises — which the old check would have called a
  // working detection path.
  const fired = after.verdict === 'VIOLATION' && before.verdict !== 'VIOLATION';
  console.log(
    [
      '  negative control — a 900px non-exempt div appended to /#/browse',
      `    before : scrollWidth ${before.scrollWidth}, non-exempt ${before.nonExemptCount}  ->  ${before.verdict}`,
      `    after  : scrollWidth ${after.scrollWidth}, non-exempt ${after.nonExemptCount}  ->  ${after.verdict}`,
      `    detection path     : ${fired ? 'WORKS — verdict flipped to VIOLATION through the real classification path' : 'DID NOT FIRE — the zero above is not trustworthy'}`,
      '',
    ].join('\n'),
  );
  if (!fired) process.exit(1);
}

// 0 measured, 2 could not measure. Findings do not fail the run — this is a diagnostic, and a
// diagnostic that turns the build red is one people stop running.
// ANY unmeasured route is exit 2, not just all of them.
//
// This used to be `couldNotMeasure === rows.length`, so six measured routes and one that
// never rendered exited 0 and read as a clean seven-route pass. The authoring guide states
// the contract this file is meant to follow — "it must ALWAYS return 2 rather than 0 when it
// could not measure, because a scan that silently did not happen must never read as clean" —
// and a partial run is exactly that. The surface checks added in 4c288808d made partial runs
// more likely, which is how this surfaced. Flagged in review on PR #225.
if (couldNotMeasure > 0) {
  console.error(
    `\nreflow-probe: ${couldNotMeasure} of ${rows.length} route(s) could not be measured, so this\n` +
      '  is an incomplete result rather than a clean one. See the rows marked with an error above.\n',
  );
  process.exit(2);
}
process.exit(0);
