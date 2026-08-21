#!/usr/bin/env node
/**
 * Coverage ratchet gate.
 *
 * The Beta quality bar is >90% unit coverage. Nothing here is near that — the
 * adf-hx bridge has 11 tests for 2,949 lines — so a gate set at 90% would be red
 * on every run from now until Phase 6, and a gate that cannot pass gets bypassed
 * and then ignored. That is worse than no gate.
 *
 * So this ratchets instead. It records where each project is today and fails when
 * a project goes **backwards**. Coverage can only improve, and the report says how
 * far each project still is from the 90% target, so the debt stays visible rather
 * than becoming a number nobody looks at until Phase 6.
 *
 * It summarises `coverage-final.json`, which the default Vitest reporters already
 * write, rather than requiring `json-summary` — Nx swallows `--coverage.reporter`,
 * and adding it to seventeen vite configs to satisfy one script is the wrong trade.
 *
 * Usage:
 *   node scripts/beta-harness/coverage-gate.mjs                    # check the ratchet
 *   node scripts/beta-harness/coverage-gate.mjs --update-baseline  # re-record after a rise
 *   node scripts/beta-harness/coverage-gate.mjs --run              # run the tests first
 *   node scripts/beta-harness/coverage-gate.mjs --json
 *
 * Exit 1 if any project's line coverage dropped by more than the tolerance, or if
 * --update-baseline is needed and has not been given.
 */

import { spawnSync } from 'node:child_process';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..', '..');
const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const updateBaseline = argv.includes('--update-baseline');
const runTests = argv.includes('--run');

const baselinePath = resolve(repoRoot, '.ai/state/coverage-baseline.json');
const coverageRoot = resolve(repoRoot, 'coverage');

/** The Beta quality bar from `docs/adf-hx-beta-plan.md`, Phase 6. */
const TARGET = 90;
/**
 * Slack in percentage points. Line coverage moves a little when a file is added
 * without its spec in the same commit, and failing a gate on 0.3pp of noise trains
 * people to bypass it. Anything larger is a real regression.
 */
const TOLERANCE = 0.5;

const projects = await discoverProjects();
const vitest = projects.filter((p) => p.kind === 'vitest');
const other = projects.filter((p) => p.kind !== 'vitest');

if (runTests) {
  if (vitest.length === 0) {
    console.error('coverage-gate: no Vitest projects found, so there is nothing to measure.');
    process.exit(1);
  }
  console.log(`Running ${vitest.length} Vitest project(s) with coverage…`);
  if (other.length) {
    // Stated, not silently dropped: a gate that quietly skips a project reads as
    // "everything is covered" when it is not.
    console.log(
      `  Excluded, no v8 coverage available: ${other.map((p) => p.name).join(', ')}\n` +
        `  (Karma's builder takes --code-coverage, not --coverage.enabled, and fails on the latter.)`,
    );
  }
  console.log('');
  // `--coverage.enabled=true`, not `--coverage`: Nx sees the latter twice and errors
  // with `Expected a single value for option "--coverage "`.
  const r = spawnSync(
    'npx',
    ['nx', 'run-many', '-t', 'test', `--projects=${vitest.map((p) => p.name).join(',')}`, '--coverage.enabled=true'],
    { stdio: 'inherit', env: { ...process.env, ...webstorageOptOut() } },
  );
  if (r.status !== 0) {
    console.error('\ncoverage-gate: tests failed, so coverage numbers would be meaningless. Fix the tests first.');
    process.exit(1);
  }
}

const measured = await collect();

if (measured.length === 0) {
  console.error(
    'coverage-gate: no coverage reports found under `coverage/`.\n' +
      'Run it with --run, or run the tests with --coverage.enabled=true first.\n' +
      'Refusing to report a pass on a measurement that did not happen.',
  );
  process.exit(1);
}

const baseline = existsSync(baselinePath) ? JSON.parse(await readFile(baselinePath, 'utf8')) : null;

if (!baseline) {
  if (!updateBaseline) {
    console.error(
      `coverage-gate: no baseline at ${relative(repoRoot, baselinePath)}.\n` +
        'Record one with --update-baseline, then commit it. Until then there is nothing to ratchet against.',
    );
    process.exit(1);
  }
  await write(measured, 'initial baseline');
  process.exit(0);
}

const rows = [];
const regressions = [];
const rises = [];

for (const m of measured) {
  const was = baseline.projects?.[m.project];
  const delta = was === undefined ? null : round(m.lines - was.lines);
  rows.push({ ...m, was: was?.lines ?? null, delta, target: round(TARGET - m.lines) });
  if (was === undefined) continue;
  if (delta < -TOLERANCE) regressions.push({ project: m.project, was: was.lines, now: m.lines, delta });
  else if (delta > TOLERANCE) rises.push({ project: m.project, was: was.lines, now: m.lines, delta });
}

// Projects in the baseline that produced no report this run. Not a failure — the
// affected set is usually a subset — but silently dropping them would let coverage
// vanish unnoticed.
const unmeasured = Object.keys(baseline.projects ?? {}).filter((p) => !measured.some((m) => m.project === p));

if (updateBaseline) {
  const merged = { ...baseline.projects };
  for (const m of measured) merged[m.project] = { lines: m.lines, statements: m.statements, branches: m.branches, functions: m.functions };
  await write(
    Object.entries(merged).map(([project, v]) => ({ project, ...v })),
    `updated from ${measured.length} project(s)`,
  );
  process.exit(0);
}

report();
process.exit(regressions.length ? 1 : 0);

/* ---------- collection ---------- */

/**
 * Walk `coverage/` for `coverage-final.json` files and summarise each.
 * @returns {Promise<{ project: string, lines: number, statements: number, branches: number, functions: number, files: number }[]>}
 */
async function collect() {
  if (!existsSync(coverageRoot)) return [];
  const out = [];
  for (const p of vitest) {
    // Keyed off the target's own `reportsDirectory`, so the baseline uses real Nx
    // project names rather than a directory basename guessed from the path.
    const file = resolve(repoRoot, p.reportsDirectory, 'coverage-final.json');
    if (!existsSync(file)) continue;
    let data;
    try {
      data = JSON.parse(await readFile(file, 'utf8'));
    } catch {
      continue;
    }
    const s = summarise(data);
    if (s.files > 0) out.push({ project: p.name, ...s });
  }
  return out.sort((a, b) => a.project.localeCompare(b.project));
}

/**
 * Read every `project.json` and classify its `test` target. Reading from disk beats
 * shelling out to `nx show project` eighteen times.
 * @returns {Promise<{ name: string, kind: 'vitest'|'other', reportsDirectory?: string }[]>}
 */
async function discoverProjects() {
  const found = [];
  for await (const file of walk(repoRoot, ['node_modules', 'dist', '.git', 'coverage', '.nx'])) {
    if (!file.endsWith('/project.json')) continue;
    let j;
    try {
      j = JSON.parse(await readFile(file, 'utf8'));
    } catch {
      continue;
    }
    const t = j.targets?.test;
    if (!t) continue;
    const name = j.name ?? relative(repoRoot, resolve(file, '..'));
    if (t.executor === '@nx/vitest:test' && t.options?.reportsDirectory) {
      found.push({ name, kind: 'vitest', reportsDirectory: t.options.reportsDirectory });
    } else {
      found.push({ name, kind: 'other' });
    }
  }
  return found.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Vitest's v8 provider writes istanbul-shaped data: `s`/`b`/`f` are hit counts
 * keyed by entries in `statementMap`/`branchMap`/`fnMap`. Line coverage is derived
 * from statements, which is what istanbul's own summary does for v8 data.
 * @param {Record<string, any>} data
 */
function summarise(data) {
  let sTotal = 0,
    sCovered = 0,
    bTotal = 0,
    bCovered = 0,
    fTotal = 0,
    fCovered = 0,
    files = 0;
  for (const entry of Object.values(data)) {
    files += 1;
    for (const hits of Object.values(entry.s ?? {})) {
      sTotal += 1;
      if (hits > 0) sCovered += 1;
    }
    for (const arr of Object.values(entry.b ?? {})) {
      for (const hits of arr ?? []) {
        bTotal += 1;
        if (hits > 0) bCovered += 1;
      }
    }
    for (const hits of Object.values(entry.f ?? {})) {
      fTotal += 1;
      if (hits > 0) fCovered += 1;
    }
  }
  const pct = (c, t) => (t === 0 ? 100 : round((c / t) * 100));
  return {
    files,
    statements: pct(sCovered, sTotal),
    branches: pct(bCovered, bTotal),
    functions: pct(fCovered, fTotal),
    lines: pct(sCovered, sTotal),
  };
}

async function* walk(dir, skip = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (skip.includes(entry.name)) continue;
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full, skip);
    else yield full;
  }
}

/* ---------- output ---------- */

async function write(list, why) {
  const projects = {};
  for (const m of list) {
    projects[m.project] = {
      lines: m.lines,
      statements: m.statements,
      branches: m.branches,
      functions: m.functions,
    };
  }
  await mkdir(resolve(repoRoot, '.ai/state'), { recursive: true });
  const body = {
    $comment: [
      'Coverage ratchet baseline. `npm run beta:coverage` fails if a project drops below',
      'its entry here by more than 0.5pp. Raise these by writing tests, never by editing',
      'the file to match a regression.',
      `Beta target is ${TARGET}% (docs/adf-hx-beta-plan.md, Phase 6).`,
    ],
    target: TARGET,
    tolerance: TOLERANCE,
    projects,
  };
  await writeFile(baselinePath, `${JSON.stringify(body, null, 2)}\n`, 'utf8');
  console.log(`coverage-gate: baseline written (${why}) -> ${relative(repoRoot, baselinePath)}`);
  for (const [p, v] of Object.entries(projects).sort()) {
    const gap = round(TARGET - v.lines);
    console.log(`  ${p.padEnd(28)} ${String(v.lines).padStart(6)}%  ${gap > 0 ? `${gap}pp short of ${TARGET}%` : `meets ${TARGET}%`}`);
  }
}

function report() {
  if (asJson) {
    console.log(JSON.stringify({ ok: regressions.length === 0, target: TARGET, rows, regressions, rises, unmeasured }, null, 2));
    return;
  }

  console.log(`\nCoverage ratchet — ${rows.length} project(s) measured, Beta target ${TARGET}%\n`);
  console.log(`  ${'project'.padEnd(28)} ${'lines'.padStart(7)} ${'was'.padStart(7)} ${'delta'.padStart(7)}   gap to ${TARGET}%`);
  for (const r of rows) {
    const was = r.was === null ? '  new' : `${r.was}%`;
    const delta = r.delta === null ? '    -' : `${r.delta > 0 ? '+' : ''}${r.delta}`;
    console.log(
      `  ${r.project.padEnd(28)} ${`${r.lines}%`.padStart(7)} ${was.padStart(7)} ${delta.padStart(7)}   ${r.target > 0 ? `${r.target}pp short` : 'met'}`,
    );
  }

  if (unmeasured.length) {
    console.log(`\n  Not measured this run (outside the affected set): ${unmeasured.join(', ')}`);
    console.log('  Their baseline entries are unchanged; this run says nothing about them.');
  }

  if (rises.length) {
    console.log('\n  Improved — run --update-baseline to lock these in:');
    for (const r of rises) console.log(`    ${r.project}  ${r.was}% -> ${r.now}%  (+${r.delta}pp)`);
  }

  console.log('');
  if (regressions.length) {
    console.log(`coverage-gate: FAIL — ${regressions.length} project(s) lost coverage:`);
    for (const r of regressions) console.log(`  ${r.project}  ${r.was}% -> ${r.now}%  (${r.delta}pp)`);
    console.log(
      '\n  Add the missing tests. Do not run --update-baseline to make this pass —\n' +
        '  that is the same move as weakening a test, one file further away.',
    );
  } else {
    console.log(`coverage-gate: pass — no project regressed by more than ${TOLERANCE}pp.`);
    const worst = [...rows].sort((a, b) => b.target - a.target)[0];
    if (worst && worst.target > 0) {
      console.log(`  Furthest from the Beta bar: ${worst.project} at ${worst.lines}% (${worst.target}pp short of ${TARGET}%).`);
    }
  }
}

function round(n) {
  return Math.round(n * 100) / 100;
}

/** Node 22+ shadows jsdom's localStorage; see scripts/beta-harness/node-version.mjs. */
function webstorageOptOut() {
  const major = Number(process.versions.node.split('.')[0]);
  if (major < 22) return {};
  return { NODE_OPTIONS: [process.env['NODE_OPTIONS'], '--no-experimental-webstorage'].filter(Boolean).join(' ') };
}
