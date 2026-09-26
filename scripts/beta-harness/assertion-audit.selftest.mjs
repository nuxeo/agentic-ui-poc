#!/usr/bin/env node
/**
 * Negative controls for `assertion-audit.mjs` — proof that each rule can actually fail.
 *
 * `CLAUDE.md`: *a gate is not evidence until you have seen it fail on purpose.* This audit
 * has now been wrong twice in the same place, both times in the `literal-false` guard
 * exemption, and both times it was caught by someone thinking to try a specific input
 * rather than by anything that runs:
 *
 *   1. The first cut climbed the whole ancestor chain to the top-level `if (declarative)`,
 *      so a deliberate unconditional `check(x, false)` anywhere inside it went green.
 *   2. The second stopped at the first conditional and rejected a *constant* guard — but
 *      `classify` only knew about literals, so `if ({})`, `if ([])`, `if (() => false)`,
 *      `if (function () {})`, `if (class {})` and `` if (`x`) `` all reached the exemption
 *      as ordinary guards. Six spellings of `if (true)` that the rule did not recognise.
 *
 * Unlike `sanitizer-audit.selftest.mjs`, nothing here perturbs a tracked file: the audit
 * accepts explicit paths, so every control is a fixture written to a fresh temp directory
 * and handed to the audit as an argument. The repository is never touched, and the controls
 * can therefore be run concurrently with anything.
 *
 * Usage:  node scripts/beta-harness/assertion-audit.selftest.mjs
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');
const AUDIT = 'scripts/beta-harness/assertion-audit.mjs';

const workdir = mkdtempSync(join(tmpdir(), 'assertion-audit-selftest-'));
process.on('exit', () => rmSync(workdir, { recursive: true, force: true }));

let fixtureSeq = 0;
/** Writes `source` to a fresh file and returns the audit's exit code and output. */
function runAgainst(source) {
  const file = join(workdir, `fixture-${(fixtureSeq += 1)}.mjs`);
  writeFileSync(file, source, 'utf8');
  const r = spawnSync('node', [AUDIT, file], { cwd: ROOT, encoding: 'utf8' });
  return { code: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

const results = [];

/**
 * A control that must make the audit go red, for a named reason.
 *
 * @param {string} name
 * @param {string} source   the fixture the audit is pointed at
 * @param {string} expect   substring the red output must contain
 */
function red(name, source, expect) {
  const { code, out } = runAgainst(source);
  results.push({
    name,
    kind: 'negative',
    pass: code !== 0 && out.includes(expect),
    detail: `exit ${code}; expected output to contain ${JSON.stringify(expect)}`,
    out,
  });
}

/**
 * A control that must leave the audit green — the other half, without which every rule
 * above could be satisfied by a gate that simply reports everything.
 *
 * @param {string} name
 * @param {string} source
 * @param {string} [expect] substring the green output must contain, if the control needs one
 */
function green(name, source, expect) {
  const { code, out } = runAgainst(source);
  results.push({
    name,
    kind: 'silence',
    pass: code === 0 && (expect === undefined || out.includes(expect)),
    detail: `exit ${code}${expect === undefined ? '' : `; expected output to contain ${JSON.stringify(expect)}`}`,
    out,
  });
}

// ---- the rules, each shown red on purpose --------------------------------------------------

red(
  'a check with no condition is reported',
  `export async function run(h) {\n  h.check('no condition');\n}\n`,
  'has no condition, so it always passes',
);

red(
  'a check on a literal true is reported',
  `export async function run(h) {\n  h.check('constant', true, 'why');\n}\n`,
  'asserts the literal `true`',
);

red(
  'a check on an identifier bound to a literal is reported',
  `const ok = true;\nexport async function run(h) {\n  h.check('bound', ok, 'why');\n}\n`,
  'bound to the literal',
);

red(
  'a check comparing an expression to itself is reported',
  `export async function run(h, name) {\n  h.check('self', name === name, 'why');\n}\n`,
  'compares `name` to itself',
);

red(
  'an unconditional literal-false check is reported',
  `export async function run(h) {\n  h.check('unconditional', false, 'why');\n}\n`,
  'asserts a literal falsy value',
);

// ---- the guard exemption, which is where this audit has been wrong twice ---------------------
//
// Each fixture below is `if (<always truthy>) check(name, false)` — an unconditional failure
// report wearing a guard. Every one of them was verified exempt before `classify` learned
// these forms, so every one of them is a hole this file now keeps shut.

const laundered = {
  'an object literal': '{}',
  'an array literal': '[]',
  'an arrow function': '() => false',
  'a function expression': 'function () {}',
  'a class expression': 'class {}',
  'a constant template literal': '`literal`',
  'a literal true': 'true',
  'a negated constant': '!0',
  'a regex literal': '/x/',
  // `new` discards a primitive `return`, so this is an object and the guard cannot be false.
  // Review found it exempt; these last two are the holes that round closed.
  'a constructor call': 'new Date()',
};
for (const [description, guard] of Object.entries(laundered)) {
  red(
    `${description} does not launder an unconditional check(name, false)`,
    `export async function run(h) {\n  if (${guard}) h.check('laundered', false, 'why');\n}\n`,
    'asserts a literal falsy value',
  );
}

// The same laundering one indirection away. Only *literal* initialisers were recorded as
// bindings, so `const guard = {}` read as an unknown value and `if (guard)` passed for a real
// condition. Written out rather than folded into `laundered` above because it needs the
// declaration as well as the guard.
for (const [description, init] of Object.entries({
  'an object literal': '{}',
  'an array literal': '[]',
  'an arrow function': '() => false',
  'a constructor call': 'new Date()',
})) {
  red(
    `a binding to ${description} does not launder an unconditional check either`,
    `export async function run(h) {\n  const guard = ${init};\n  if (guard) h.check('laundered', false, 'why');\n}\n`,
    'asserts a literal falsy value',
  );
}

red(
  'a constant guard in a logical expression does not launder it either',
  `export async function run(h) {\n  ({}) && h.check('laundered', false, 'why');\n}\n`,
  'asserts a literal falsy value',
);

red(
  'a check buried among other statements inside an if is not exempt',
  `export async function run(h) {\n  if (h.declarative) {\n    await h.step('s');\n    h.check('buried', false, 'why');\n  }\n}\n`,
  'asserts a literal falsy value',
);

red(
  'a file the parser cannot read is reported rather than skipped',
  `export async function run(h) { this is not javascript`,
  'could not be parsed',
);

// ---- and the other half: the idiom the exemption exists for must still pass ------------------
//
// Without these, every control above is satisfied by an audit that reports everything — which
// is the "gate nobody can satisfy is one that gets suppressed" failure the exemption was added
// to avoid in the first place.

green(
  'the guarded failure-report idiom stays exempt',
  `export async function run(h, scene) {\n  if (!scene.criterion) h.check('scene names an acceptance criterion', false, 'why');\n}\n`,
  'reached only when: !scene.criterion',
);

// Shadowing and reassignment, which the binding maps cannot resolve because they are keyed by
// identifier text for the whole file. An ambiguous name must classify as UNKNOWN, so the check
// stays exempt — a false rejection here would report a genuinely conditional check as
// unfalsifiable, which is the worse direction of the two errors available.
green(
  'a name declared twice does not let one declaration classify the other',
  `export async function run(h, scene) {\n  const guard = {};\n  if (guard) h.step('s');\n  const inner = () => { const guard = scene.criterion; if (!guard) h.check('real', false, 'why'); };\n  inner();\n}\n`,
  'reached only when: !guard',
);

green(
  'a reassigned name is not classified from its initialiser',
  `export async function run(h, scene) {\n  let guard = {};\n  guard = scene.criterion;\n  if (!guard) h.check('real', false, 'why');\n}\n`,
  'reached only when: !guard',
);

green(
  'a guarded failure report reached through a logical AND stays exempt',
  `export async function run(h, asserted) {\n  !asserted && h.check('scene asserts something', false, 'why');\n}\n`,
  'reached only when: !asserted',
);

green(
  'an interpolating template guard stays exempt, because it can be empty',
  'export async function run(h, term) {\n' +
    '  if (`${term}`) h.check(\'guarded\', false, \'why\');\n' +
    '}\n',
  'reached only when',
);

green(
  'an ordinary falsifiable check is not reported',
  `export async function run(h, res) {\n  h.check('status is 200', res.status === 200, 'why');\n}\n`,
);

// ---- report ----------------------------------------------------------------------------------
// Split by kind for the same reason `sanitizer-audit.selftest.mjs` splits: only the `negative`
// rows are evidence that a rule can fail. The `silence` rows assert green, which is context.
const KIND_LABEL = { negative: 'RED-ON-PURPOSE', silence: 'silence' };

console.log('\nassertion-audit selftest\n');
let failed = 0;
for (const r of results) {
  console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  [${KIND_LABEL[r.kind]}]  ${r.name}`);
  if (!r.pass) {
    failed += 1;
    console.log(`        ${r.detail}`);
    console.log(
      r.out
        .split('\n')
        .map((l) => `        | ${l}`)
        .join('\n'),
    );
  }
}

const tally = (k) => results.filter((r) => r.kind === k).length;
console.log('');
if (failed > 0) {
  console.log(`selftest: FAIL — ${failed} of ${results.length} controls did not behave as expected.`);
  console.log('A rule that cannot be made to fail is decoration. Fix the rule, not the control.');
  process.exit(1);
}
console.log(
  `selftest: PASS — ${tally('negative')} negative control(s) observed red on purpose; ` +
    `${tally('silence')} silence assertion(s) as context. ${results.length} controls total.`,
);
console.log(
  '  Only the negative controls prove a rule can fail. The silence assertions keep the',
);
console.log(
  '  exemption usable, so the audit cannot pass them by reporting everything.',
);
