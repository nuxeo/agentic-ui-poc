#!/usr/bin/env node
/**
 * Beta phase verification gate.
 *
 * Runs the repository's quality gates in the cheapest-first order and writes a
 * structured report. Designed to be run repeatedly by an agent until it is
 * green, so it optimises for one thing: telling you the *next* actionable
 * failure without making you read a wall of output.
 *
 * Usage:
 *   node scripts/beta-harness/verify-gate.mjs [options]
 *
 * Options:
 *   --phase <id>     label the report, e.g. phase-3-document-list
 *   --gates <list>   comma separated subset of: lockfile,guardrails,lint,test,build,typecheck
 *   --base <ref>     git base for affected calculation (default origin/main)
 *   --tail <n>       lines of failing output to show (default 40)
 *
 * Examples:
 *   node scripts/beta-harness/verify-gate.mjs --gates guardrails,lint
 *   node scripts/beta-harness/verify-gate.mjs --phase phase-1-config --base main
 *
 * Exit code is 1 if any gate failed.
 */

import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { EVIDENCE_ROOT } from '../collect-evidence/evidence-path.mjs';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const a = process.argv[i];
  if (a.startsWith('--')) {
    const [k, inline] = a.slice(2).split('=', 2);
    args.set(k, inline ?? (process.argv[i + 1]?.startsWith('--') ? true : process.argv[++i]));
  }
}

const phase = args.get('phase') ?? 'adhoc';
const base = args.get('base') ?? process.env['NX_BASE'] ?? 'origin/main';
const tail = Number(args.get('tail') ?? 40);

/**
 * Ordered cheapest-first. Stopping at the first failure is deliberate: a lint
 * error usually explains the test failure that would follow, and running the
 * full set on a known-broken tree wastes minutes per iteration.
 */
const ALL_GATES = [
  // First because it is the cheapest and because Phase 2 proved it is the one
  // failure the other four cannot see: nothing downstream reads the lockfile,
  // so a lock that `npm ci` will refuse on Linux leaves every local gate green.
  {
    id: 'lockfile',
    label: 'Lockfile integrity',
    cmd: 'node',
    argv: ['scripts/beta-harness/lockfile-integrity.mjs'],
  },
  { id: 'guardrails', label: 'Review guardrails', cmd: 'node', argv: ['scripts/review-guardrails.mjs', '--base', base] },
  { id: 'lint', label: 'Affected lint', cmd: 'npx', argv: ['nx', 'affected', '-t', 'lint', `--base=${base}`] },
  { id: 'test', label: 'Affected tests', cmd: 'npx', argv: ['nx', 'affected', '-t', 'test', `--base=${base}`] },
  { id: 'build', label: 'Affected build', cmd: 'npx', argv: ['nx', 'affected', '-t', 'build', `--base=${base}`] },
  // Libraries have no `build` target — Nx's module-boundary rule forbids a
  // buildable library from importing a non-buildable one, and nothing in
  // `libs/` is buildable until Phase 4 gives them ng-packagr. `typecheck` runs
  // the Angular compiler over a library on its own, so a change confined to one
  // is checked directly rather than only wherever `nuxeo-ui` happens to use it.
  { id: 'typecheck', label: 'Affected typecheck', cmd: 'npx', argv: ['nx', 'affected', '-t', 'typecheck', `--base=${base}`] },
];

const requested = args.get('gates');
const selected =
  typeof requested === 'string'
    ? requested
        .split(',')
        .map((s) => s.trim())
        .map((id) => {
          const g = ALL_GATES.find((x) => x.id === id);
          if (!g) {
            console.error(`Unknown gate "${id}". Valid: ${ALL_GATES.map((x) => x.id).join(', ')}`);
            process.exit(2);
          }
          return g;
        })
    : ALL_GATES;

console.log(`\nBeta verification gate — ${phase}`);
console.log(`  base   ${base}`);
console.log(`  gates  ${selected.map((g) => g.id).join(' -> ')}\n`);

const results = [];
let firstFailure = null;

for (const gate of selected) {
  process.stdout.write(`[run ] ${gate.label} ... `);
  const started = Date.now();
  const proc = spawnSync(gate.cmd, gate.argv, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: {
      ...process.env,
      FORCE_COLOR: '0',
      NO_COLOR: '1',
      ...webstorageOptOut(),
    },
  });
  const ms = Date.now() - started;
  const output = `${proc.stdout ?? ''}${proc.stderr ?? ''}`;
  const passed = proc.status === 0;

  console.log(`${passed ? 'pass' : 'FAIL'} (${(ms / 1000).toFixed(1)}s)`);

  results.push({
    id: gate.id,
    label: gate.label,
    passed,
    exitCode: proc.status,
    durationMs: ms,
    command: `${gate.cmd} ${gate.argv.join(' ')}`,
    outputTail: lastLines(output, tail),
  });

  if (!passed) {
    firstFailure = results.at(-1);
    break;
  }
}

const allPassed = results.every((r) => r.passed);
const skipped = selected.slice(results.length).map((g) => g.id);

const report = {
  phase,
  verdict: allPassed ? 'pass' : 'fail',
  base,
  ranAt: new Date().toISOString(),
  results,
  skipped,
};

const outDir = resolve(EVIDENCE_ROOT, 'beta', 'gates');
await mkdir(outDir, { recursive: true });
const stamp = report.ranAt.replace(/[:.]/g, '-').slice(0, 19);
const reportPath = resolve(outDir, `${stamp}-${phase}.json`);
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log('');
if (allPassed) {
  console.log(`verdict  PASS — ${results.length} gate(s) green`);
} else {
  console.log(`verdict  FAIL — first failing gate: ${firstFailure.id}`);
  if (skipped.length) {
    console.log(`skipped  ${skipped.join(', ')} (not run because an earlier gate failed)`);
  }
  console.log(`\ncommand  ${firstFailure.command}`);
  console.log(`--- last ${tail} lines ---`);
  console.log(firstFailure.outputTail);
  console.log('--- end ---');
}
console.log(`\nreport   ${reportPath}`);

process.exit(allPassed ? 0 : 1);

/**
 * Node 22 added a built-in `localStorage` that requires `--localstorage-file` and
 * shadows jsdom's, so any spec touching it throws `SecurityError`. Opting out
 * restores jsdom's implementation.
 *
 * The flag does not exist before Node 22, where passing it makes Node refuse to
 * start — so it is added only when the running major actually supports it. The
 * repo pins Node 20 in `.nvmrc`, which is why CI never needs this.
 *
 * @returns {{ NODE_OPTIONS?: string }}
 */
function webstorageOptOut() {
  const major = Number(process.versions.node.split('.')[0]);
  if (major < 22) return {};
  return {
    NODE_OPTIONS: [process.env['NODE_OPTIONS'], '--no-experimental-webstorage']
      .filter(Boolean)
      .join(' '),
  };
}

/**
 * @param {string} text
 * @param {number} n
 */
function lastLines(text, n) {
  const lines = text.split('\n').filter((l) => l.trim() !== '');
  return lines.slice(-n).join('\n');
}
