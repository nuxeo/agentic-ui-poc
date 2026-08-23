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
 *   --gates <list>   comma separated subset of: node,lockfile,guardrails,lint,test,build,typecheck
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
  // Gate zero, and the cheapest of all: is this runtime one whose results mean
  // anything? An agent on the wrong Node major gets a red that is indistinguishable
  // from a code defect, and the obvious response — edit the failing spec — damages
  // working code. That happened. This gate makes it impossible to happen silently.
  {
    id: 'node',
    label: 'Node runtime preflight',
    cmd: 'node',
    argv: ['scripts/beta-harness/node-version.mjs'],
    // The warning text is the whole point, so surface it even when the gate passes.
    echoOnPass: true,
  },
  // Next because it is the next cheapest and because Phase 2 proved it is the one
  // failure none of the others can see: nothing downstream reads the lockfile,
  // so a lock that `npm ci` will refuse on Linux leaves every local gate green.
  {
    id: 'lockfile',
    label: 'Lockfile integrity',
    cmd: 'node',
    argv: ['scripts/beta-harness/lockfile-integrity.mjs'],
  },
  { id: 'guardrails', label: 'Review guardrails', cmd: 'node', argv: ['scripts/review-guardrails.mjs', '--base', base] },
  // Static, so it belongs with the cheap gates — and it guards the one thing the
  // other six structurally cannot. Lint, test, build and typecheck all check the
  // *application*; nothing checked whether the *evidence* was capable of failing.
  // Phase 1 shipped a defect past two checks that "certified properties they could
  // not observe", one of which was tautological and missed the very failure it
  // appeared to guard.
  {
    id: 'assertions',
    label: 'Evidence assertion audit',
    cmd: 'node',
    argv: ['scripts/beta-harness/assertion-audit.mjs'],
  },
  { id: 'lint', label: 'Affected lint', cmd: 'npx', argv: ['nx', 'affected', '-t', 'lint', `--base=${base}`] },
  { id: 'test', label: 'Affected tests', cmd: 'npx', argv: ['nx', 'affected', '-t', 'test', `--base=${base}`] },
  { id: 'build', label: 'Affected build', cmd: 'npx', argv: ['nx', 'affected', '-t', 'build', `--base=${base}`] },
  // Libraries have no `build` target — Nx's module-boundary rule forbids a
  // buildable library from importing a non-buildable one, and nothing in
  // `libs/` is buildable until Phase 4 gives them ng-packagr. `typecheck` runs
  // the Angular compiler over a library on its own, so a change confined to one
  // is checked directly rather than only wherever `nuxeo-ui` happens to use it.
  { id: 'typecheck', label: 'Affected typecheck', cmd: 'npx', argv: ['nx', 'affected', '-t', 'typecheck', `--base=${base}`] },
  // Last, because it reads the artifact `build` produces. It asks the only question
  // the other gates cannot: what does a customer actually receive? Phase 3's spike
  // found adf-hx importing a test library from its shipped runtime bundle, which put
  // ng-mocks' implementation and two `eval()` calls into a customer-facing chunk.
  {
    id: 'bundle',
    label: 'Bundle contents',
    cmd: 'node',
    argv: ['scripts/beta-harness/no-test-libs-in-bundle.mjs'],
    // It reports VACUOUS when adf-hx is not in the bundle; that has to be visible.
    echoOnPass: true,
  },
  // Phase 4 gate: the publishable platform's API surface must match its snapshot.
  // Runs after `build` because it reads dist/libs/platform/*.d.ts — the bytes a
  // customer actually installs, not the source. A library can gain or lose an
  // export without lint/test/build/typecheck noticing, because every in-repo
  // caller is updated in the same commit; the break lands on the customer.
  {
    id: 'api-surface',
    label: 'API surface',
    cmd: 'node',
    argv: ['scripts/beta-harness/api-surface.mjs'],
  },
  // Compiles the template against the **built** declarations instead of the source
  // tree, which is the only gate that sees the resolution a customer actually gets.
  // It is what found the platform package being compiled without `strictNullChecks`,
  // shipping 27 wrongly non-nullable types while every other gate was green.
  {
    id: 'fork-simulation',
    label: 'Fork simulation',
    cmd: 'node',
    argv: ['scripts/beta-harness/fork-simulation.mjs'],
  },
  // Phase 5 gate: the customer-facing extension reference must agree with the code.
  // It is the only document whose audience is customers, and nothing checked it. When
  // first measured it was wrong in both directions — it claimed `documentList` had
  // nothing resolving it while both browse routes resolve twelve registered columns,
  // and it used an ID that exists only in spec files as its security example.
  {
    id: 'reference-drift',
    label: 'Extension reference drift',
    cmd: 'node',
    argv: ['scripts/beta-harness/extension-reference-drift.mjs'],
  },
  // Phase 5 gate: the guardrail we ship to customers, run against the reference
  // extension library in this repo. A tool we hand customers and never run ourselves
  // is a tool we would discover was broken from a customer's CI log.
  {
    id: 'customer-guardrails',
    label: 'Customer extension guardrails',
    cmd: 'node',
    argv: [
      'libs/platform/guardrails/check-extension-library.mjs',
      'libs/extensions/acme-extensions',
    ],
  },
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

const notRequested = ALL_GATES.filter((g) => !selected.includes(g)).map((g) => g.id);

console.log(`\nBeta verification gate — ${phase}`);
console.log(`  base   ${base}`);
console.log(`  gates  ${selected.map((g) => g.id).join(' -> ')}  (${selected.length} of ${ALL_GATES.length})`);
if (notRequested.length) {
  console.log(`  NOT REQUESTED  ${notRequested.join(', ')} — this run cannot speak for them`);
}
console.log('');

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

  if (passed && gate.echoOnPass && output.trim()) {
    for (const line of output.trimEnd().split('\n')) console.log(`       ${line}`);
    console.log('');
  }

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
const full = notRequested.length === 0;

/**
 * `pass` and `pass-partial` are deliberately different strings.
 *
 * Two reports in the evidence corpus read `"verdict": "pass"` while having run a
 * single gate — `skipped` was empty because the other five were never *selected*,
 * not skipped — so nothing distinguished them from a full green except counting
 * `results` by hand. The skills tell an agent to quote the verdict line verbatim;
 * making the verdict itself carry the coverage means a partial run cannot be
 * quoted as if it were complete.
 */
const verdict = !allPassed ? 'fail' : full ? 'pass' : 'pass-partial';

const report = {
  phase,
  verdict,
  base,
  ranAt: new Date().toISOString(),
  gates: {
    available: ALL_GATES.map((g) => g.id),
    requested: selected.map((g) => g.id),
    ran: results.map((r) => r.id),
    // Selected but never reached, because an earlier gate failed.
    skipped,
    // Never asked for. This run says nothing at all about these.
    notRequested,
    coverage: full ? 'full' : 'partial',
  },
  results,
  skipped,
};

const outDir = resolve(EVIDENCE_ROOT, 'beta', 'gates');
await mkdir(outDir, { recursive: true });
const stamp = report.ranAt.replace(/[:.]/g, '-').slice(0, 19);
const reportPath = resolve(outDir, `${stamp}-${phase}.json`);
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log('');
if (allPassed && full) {
  console.log(`verdict  PASS — all ${ALL_GATES.length} gates green`);
} else if (allPassed) {
  console.log(`verdict  PASS (PARTIAL) — ${results.length} of ${ALL_GATES.length} gates green`);
  console.log(`         NOT RUN: ${notRequested.join(', ')}`);
  console.log('         A partial run is a fast inner loop, not a phase gate. Do not sign off on this.');
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
