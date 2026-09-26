#!/usr/bin/env node
/**
 * Differential axe harness — settles "The open disagreement" in `docs/accessibility.md`.
 *
 * a11y-scout's first baseline reported 8 `color-contrast` and 2 `button-name` findings.
 * `scripts/beta-harness/steps/phase-6-a11y.mjs` records both rules as driven to zero, with an
 * empty `KNOWN_VIOLATIONS`. Both cannot be right, and under the ownership standard phase-6 owns
 * the axe verdict — so if phase-6 is the one that is wrong, the published conformance number is
 * wrong with it.
 *
 * ## Hypotheses already eliminated without a browser, so this script does not re-test them
 *
 *   1. **Different axe versions.** `npm ls axe-core --all` resolves ONE deduped `axe-core@4.13.0`
 *      for both `@axe-core/playwright@4.13.0` and `a11y-scout@0.3.0`. Identical engine.
 *   2. **a11y-scout's reflow check resizing the viewport.** In `a11y-scout/src/agents/scan-page.ts`
 *      axe runs at line 121, reflow at 271 and the keyboard walk at 279 — axe runs FIRST, before
 *      anything resizes, and `reflow.ts:113` restores the original viewport regardless.
 *
 * ## What is left, and what this script varies
 *
 * Exactly two things differ between the harnesses, and this script isolates the first:
 *
 *   - **Tag set.** phase-6 passes `wcag2a, wcag2aa, wcag21a, wcag21aa`. a11y-scout at AA adds
 *     `wcag22a, wcag22aa, best-practice`. Both variants run here, back to back **in the same page
 *     visit**, so page state is identical and the tag list is the only variable.
 *   - **When each was measured.** phase-6's zero is dated 2026-08-24; the a11y-scout baseline is
 *     from 2026-09-11 against a tree with substantial uncommitted change. A rule that reproduces
 *     here under phase-6's own tags means phase-6's claim has gone stale, not that it was wrong.
 *
 * This is a **diagnostic, not a gate**. It exits 0 whenever it managed to measure, including when
 * it finds violations — the whole point is to report a number, and a diagnostic that fails the
 * build is one people stop running. It exits non-zero only when it could not measure at all,
 * because a scan that silently did not happen must never read as clean.
 *
 * Prerequisites:
 *   npm install --no-save @playwright/test @axe-core/playwright
 *     ^ both in ONE command. `npm install --no-save X` prunes previously --no-save'd packages.
 *   npm run beta:backend && npx nx serve nuxeo-ui
 *
 * Usage:
 *   node a11y/diagnostics/axe-differential.mjs
 *   node a11y/diagnostics/axe-differential.mjs --surface browse --surface tasks
 *   node a11y/diagnostics/axe-differential.mjs --json out.json
 *
 * Exit codes: 0 measured, 2 could not measure.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { requireNuxeoCredentials } from '../env.mjs';

/**
 * This file lives at `a11y/diagnostics/`, so the repository root is two levels up.
 *
 * It was one level when this script sat in `scripts/`, and the move did not update it. The
 * result was silent rather than loud: `resolveScoutReport()` looked under `a11y/a11y-reports`,
 * `existsSync` said no, and the differential compared against an empty baseline while still
 * printing a clean verdict — the exact vacuous pass this diagnostic exists to catch. Caught in
 * review on PR #225.
 */
const repoRoot = resolve(import.meta.dirname, '..', '..');

/** Where the suites write their consolidated reports. Mirrors `REPORT_DIR` in `../fixtures.ts`. */
const REPORTS_DIR = resolve(repoRoot, 'a11y', 'reports');
const args = process.argv.slice(2);
const jsonAt = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
const only = args.reduce((acc, a, i) => (a === '--surface' ? [...acc, args[i + 1]] : acc), []);

const baseUrl = process.env['APP_URL'] ?? 'http://localhost:4200';
// Required, never defaulted - see ../env.mjs for why a default is worse than an error here.
const { username: user, password: pass } = requireNuxeoCredentials();

const SESSION_KEY = 'agentic_ui_nuxeo_session';
const SIGNED_OUT_KEY = 'agentic_ui_signed_out';

/** The surfaces a11y-scout scanned, with the host each one must render before it is scanned. */
const SURFACES = [
  ['browse', '/#/browse', 'lib-browse'],
  ['search', '/#/search', 'lib-search'],
  ['trash', '/#/trash', 'lib-trash'],
  ['tasks', '/#/tasks', 'lib-tasks-page'],
  ['administration', '/#/administration', 'lib-administration-shell'],
  ['knowledge-discovery', '/#/knowledge-discovery', 'lib-knowledge-discovery'],
  ['browse-adf-hx', '/#/browse-adf-hx', 'lib-browse-adf-hx-poc'],
].filter(([label]) => only.length === 0 || only.includes(label));

/** The two tag sets, verbatim from each harness. */
const VARIANTS = {
  'phase-6': ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  'a11y-scout': ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'],
};

/** phase-6 fails only on these impacts; lower ones are recorded but do not block. */
const BLOCKING_IMPACTS = ['serious', 'critical'];

let chromium, AxeBuilder;
try {
  ({ chromium } = await import('@playwright/test'));
  ({ default: AxeBuilder } = await import('@axe-core/playwright'));
} catch (err) {
  console.error(
    `axe-differential: cannot measure — ${err instanceof Error ? err.message : err}\n` +
      '  npm install --no-save @playwright/test @axe-core/playwright',
  );
  process.exit(2);
}

/**
 * Resolve the a11y-scout report to compare against.
 *
 * Deliberately NOT `a11y-reports/latest/`. That directory is a rolling pointer that every
 * a11y-scout run overwrites, including `a11y:scan -- states`, whose findings come from dialogs and
 * overlays on a single route. Comparing this script's per-route axe pass against those would
 * report every interaction-state finding as "did not reproduce" and every route finding as
 * missing — a diff that looks alarming and means nothing. Pinning to the newest *surfaces*
 * report keeps both sides of the comparison the same population.
 */
function resolveScoutReport() {
  const override = process.env['A11Y_SCOUT_REPORT'];
  if (override) return resolve(repoRoot, override);

  if (!existsSync(REPORTS_DIR)) return null;
  const surfaceRuns = readdirSync(REPORTS_DIR)
    .filter((d) => d.startsWith('nuxeo-satori-surfaces-'))
    .sort();
  const newest = surfaceRuns.at(-1);
  return newest ? resolve(REPORTS_DIR, newest, 'report.json') : null;
}

// What a11y-scout claimed, so the reproduction can be judged against it rather than against memory.
/** @type {Map<string, number>} `${surface}::${ruleId}` -> node count */
const claimed = new Map();
const reportPath = resolveScoutReport();
if (reportPath && existsSync(reportPath)) {
  console.log(`axe-differential: comparing against ${relative(repoRoot, reportPath)}\n`);
  try {
    for (const f of JSON.parse(readFileSync(reportPath, 'utf8')).findings ?? []) {
      if (f.source !== 'axe') continue;
      const surface = SURFACES.find(([, route]) => (f.pageUrl ?? '').endsWith(route))?.[0];
      if (!surface) continue;
      const key = `${surface}::${f.ruleId}`;
      claimed.set(key, (claimed.get(key) ?? 0) + 1);
    }
  } catch {
    console.error(`axe-differential: ${reportPath} unreadable, so there is nothing to compare.`);
    process.exit(2);
  }
} else {
  // Exit 2 — "precondition not met" — rather than warning and continuing. The whole output of
  // this script is a comparison, and with an empty baseline every measured finding reports as
  // "not claimed by a11y-scout" while the run still looks successful. That is how a broken
  // path went unnoticed through a directory move; the check now cannot pass without a subject.
  console.error(
    'axe-differential: no nuxeo-satori-surfaces-* report under a11y/reports, so there is\n' +
      '  nothing to compare against. A differential with an empty baseline is not a clean\n' +
      '  result, it is an unmeasured one.\n\n' +
      '    npm run a11y:scan -- surfaces\n\n' +
      '  or point A11Y_SCOUT_REPORT at a report.json.\n',
  );
  process.exit(2);
}

const browser = await chromium.launch({ headless: process.env['A11Y_HEADED'] !== '1' });
// Mirrors `phase-runner.mjs` exactly: same viewport, and Basic auth on the app origin. Both auth
// mechanisms are required — httpCredentials for XHRs, the sessionStorage session for the route
// guard — and helpers.mjs documents what breaks when only one is present.
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  httpCredentials: { username: user, password: pass, origin: baseUrl },
});
const page = await context.newPage();

/** @type {{surface:string, rule:string, impact:string, variant:string, nodes:number, targets:string[]}[]} */
const rows = [];
let measured = 0;

try {
  const probe = await page.request.get(`${baseUrl}/nuxeo/api/v1/me`, { failOnStatusCode: false });
  if (probe.status() !== 200) {
    console.error(
      `axe-differential: cannot measure — ${baseUrl}/nuxeo/api/v1/me returned ${probe.status()}. ` +
        'An empty screen scans clean and proves nothing. Start the backend and the dev server.',
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

  for (const [surface, route, host] of SURFACES) {
    process.stdout.write(`scanning ${surface} `);
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    // The host assertion is the difference between a scan and a clean-looking blank. phase-6 omits
    // it on five of its routes, which is how it has been scanning `/#/collections` — a path with no
    // matching route — and counting the empty result as a pass.
    const rendered = await page
      .locator(host)
      .first()
      .isVisible()
      .catch(() => false);
    if (!rendered) {
      console.log(`- SKIPPED, ${host} did not render (nothing to scan, NOT a pass)`);
      rows.push({ surface, rule: '(did not render)', impact: '-', variant: '-', nodes: 0, targets: [host] });
      continue;
    }

    for (const [variant, tags] of Object.entries(VARIANTS)) {
      const results = await new AxeBuilder({ page }).withTags(tags).analyze();
      for (const v of results.violations) {
        rows.push({
          surface,
          rule: v.id,
          impact: v.impact,
          variant,
          nodes: v.nodes.length,
          targets: v.nodes.slice(0, 4).map((n) => n.target.join(' ')),
        });
      }
      process.stdout.write(`[${variant}: ${results.violations.length}] `);
    }
    measured += 1;
    console.log('');
  }
} finally {
  await context.close();
  await browser.close();
}

// ---------------------------------------------------------------------------------------------

const at = (surface, rule, variant) =>
  rows.find((r) => r.surface === surface && r.rule === rule && r.variant === variant)?.nodes ?? 0;

console.log(`\nSurfaces measured : ${measured} of ${SURFACES.length}`);
console.log(`App               : ${baseUrl}`);
console.log(`axe tag sets      : phase-6 ${VARIANTS['phase-6'].length} tags, a11y-scout ${VARIANTS['a11y-scout'].length} tags\n`);

const ruleKeys = [...new Set(rows.filter((r) => r.variant !== '-').map((r) => `${r.surface}::${r.rule}`))].sort();

console.log('--- every violation, by surface and rule ---');
console.log(`${'surface'.padEnd(21)}${'rule'.padEnd(32)}${'impact'.padEnd(10)}${'ph-6'.padStart(5)}${'scout'.padStart(7)}${'claimed'.padStart(9)}`);
for (const key of ruleKeys) {
  const [surface, rule] = key.split('::');
  const impact = rows.find((r) => r.surface === surface && r.rule === rule)?.impact ?? '?';
  const p6 = at(surface, rule, 'phase-6');
  const sc = at(surface, rule, 'a11y-scout');
  const cl = claimed.get(key) ?? 0;
  const flag = p6 === 0 && sc > 0 ? '  <- tag-set only' : cl > 0 && p6 > 0 ? '  <- reproduces under phase-6 tags' : '';
  console.log(
    `${surface.padEnd(21)}${rule.padEnd(32)}${impact.padEnd(10)}${String(p6).padStart(5)}${String(sc).padStart(7)}${String(cl).padStart(9)}${flag}`,
  );
}

// The verdict phase-6 itself would reach today: serious/critical only, under its own tag set.
const p6Blocking = rows.filter((r) => r.variant === 'phase-6' && BLOCKING_IMPACTS.includes(r.impact));
console.log(`\n--- what phase-6's own verdict would be against the app right now ---`);
if (p6Blocking.length === 0) {
  console.log("  0 serious/critical violations under phase-6's tags — its recorded zero still holds.");
} else {
  console.log(`  ${p6Blocking.length} serious/critical violation(s) under phase-6's OWN tag set:`);
  for (const r of p6Blocking) {
    console.log(`    ${r.surface.padEnd(21)}${r.rule.padEnd(30)}${r.impact.padEnd(10)}${r.nodes} node(s)`);
    for (const t of r.targets) console.log(`        ${t}`);
  }
  console.log(
    '\n  phase-6 records KNOWN_VIOLATIONS as empty and its verdict as unconditional. If this list is\n' +
      '  non-empty, that claim is stale and docs/accessibility.md gap 1 resolves against phase-6.',
  );
}

const disputed = ['color-contrast', 'button-name'];
console.log('\n--- the two disputed rules ---');
for (const rule of disputed) {
  const p6 = rows.filter((r) => r.variant === 'phase-6' && r.rule === rule).reduce((a, r) => a + r.nodes, 0);
  const sc = rows.filter((r) => r.variant === 'a11y-scout' && r.rule === rule).reduce((a, r) => a + r.nodes, 0);
  const cl = [...claimed].filter(([k]) => k.endsWith(`::${rule}`)).reduce((a, [, n]) => a + n, 0);
  console.log(`  ${rule.padEnd(18)} phase-6 tags: ${String(p6).padStart(3)}   scout tags: ${String(sc).padStart(3)}   scout claimed: ${String(cl).padStart(3)}`);
}

if (jsonAt) {
  writeFileSync(resolve(repoRoot, jsonAt), `${JSON.stringify({ baseUrl, measured, rows, claimed: Object.fromEntries(claimed) }, null, 2)}\n`);
  console.log(`\nWrote ${jsonAt}`);
}

if (measured === 0) {
  console.error('\naxe-differential: cannot measure — no surface rendered.');
  process.exit(2);
}
