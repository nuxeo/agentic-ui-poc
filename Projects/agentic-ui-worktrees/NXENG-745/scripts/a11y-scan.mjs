#!/usr/bin/env node
/**
 * Template accessibility scan with a "no new violations" verdict, judged against a baseline.
 *
 * ## Why a baseline, and not "violations in files this change touched"
 *
 * That was the first design and it does not work here. It was measured before being trusted:
 * on `feature/adf-hx-browse-poc` the diff against `main` is **729 files**, so every existing
 * violation counts as "touched" and the gate is red from its first run. A long-lived branch
 * that has effectively rewritten the application makes changed-file scoping meaningless.
 *
 * A gate that is red for reasons nobody intends to fix this week is a gate people learn to
 * ignore — this repository has a documented case of CI being red for 16 consecutive runs over
 * an unowned bundle-size ceiling. So instead: the known violations are recorded in
 * `tools/a11y/baseline.json`, the run is green while it matches, and any violation that is
 * not in the baseline fails it.
 *
 * The baseline is keyed on `path::rule` with a **count**, not on line numbers. Line numbers
 * drift whenever a template is edited above the violation, which would fail the gate for an
 * unrelated edit; the count still catches a second violation of the same rule in the same
 * file, which a bare identity key would mask.
 *
 * ## Reducing the baseline is the point
 *
 * Every run prints the total, so the debt is visible rather than filed away. Fixing a
 * violation without updating the baseline is safe — the gate does not require the entry to be
 * used. Run `--update-baseline` to re-record, and `--all` to ignore the baseline entirely,
 * which is the flag to move the workflow to once it is empty.
 *
 * ## Usage
 *
 *   node scripts/a11y-scan.mjs                    # verdict against the baseline
 *   node scripts/a11y-scan.mjs --all              # verdict on every violation
 *   node scripts/a11y-scan.mjs --update-baseline  # re-record the baseline
 *
 * Exit codes: 0 clean, 1 violations outside the baseline, 2 the scan could not run.
 */
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { ESLint } from 'eslint';

const repoRoot = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const failOnAll = args.includes('--all');
const updateBaseline = args.includes('--update-baseline');

const CONFIG = 'tools/a11y/eslint.a11y.config.mjs';
const TARGETS = ['apps/**/*.html', 'libs/**/*.html'];
const BASELINE = resolve(repoRoot, 'tools/a11y/baseline.json');

let results;
try {
  const eslint = new ESLint({ cwd: repoRoot, overrideConfigFile: CONFIG });
  results = await eslint.lintFiles(TARGETS);
} catch (err) {
  console.error(`a11y-scan: the scan could not run: ${err instanceof Error ? err.message : err}`);
  process.exit(2);
}

/** @type {{path:string,line:number,column:number,rule:string,message:string}[]} */
const findings = [];
for (const file of results) {
  const path = relative(repoRoot, file.filePath);
  for (const m of file.messages) {
    // A template ESLint could not parse is not a template it checked, so this is a hard stop
    // rather than a zero-violation file quietly inflating the clean count.
    if (!m.ruleId) {
      console.error(`a11y-scan: ${path}:${m.line} could not be parsed: ${m.message}`);
      process.exit(2);
    }
    findings.push({
      path,
      line: m.line,
      column: m.column,
      rule: m.ruleId.replace('@angular-eslint/template/', ''),
      message: m.message,
    });
  }
}

/** Collapse findings to `{ "path::rule": count }`. */
const tally = (list) =>
  list.reduce((acc, f) => {
    const key = `${f.path}::${f.rule}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, /** @type {Record<string, number>} */ ({}));

const current = tally(findings);

if (updateBaseline) {
  const sorted = Object.fromEntries(Object.entries(current).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(BASELINE, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(
    `a11y-scan: baseline written with ${Object.keys(sorted).length} entr(y|ies), ` +
      `${findings.length} violation(s) total.`,
  );
  process.exit(0);
}

/** @type {Record<string, number>} */
let baseline = {};
if (!failOnAll) {
  if (!existsSync(BASELINE)) {
    console.error(
      `a11y-scan: ${relative(repoRoot, BASELINE)} is missing. Run ` +
        '`npm run a11y:baseline` to record it, or pass --all to ignore it.',
    );
    process.exit(2);
  }
  try {
    baseline = JSON.parse(readFileSync(BASELINE, 'utf8'));
  } catch (err) {
    console.error(
      `a11y-scan: ${relative(repoRoot, BASELINE)} is not valid JSON: ${err instanceof Error ? err.message : err}`,
    );
    process.exit(2);
  }
}

// A finding is blocking when its (file, rule) pair exceeds what the baseline allows. Where a
// pair is over budget, the surplus occurrences are the ones reported — which occurrence is
// "new" is not knowable, so the last are taken and the count is what carries the meaning.
const allowance = { ...baseline };
const blocking = [];
for (const f of findings) {
  if (failOnAll) {
    blocking.push(f);
    continue;
  }
  const key = `${f.path}::${f.rule}`;
  if (allowance[key] > 0) allowance[key] -= 1;
  else blocking.push(f);
}

const byRule = Object.entries(
  findings.reduce((acc, f) => ((acc[f.rule] = (acc[f.rule] ?? 0) + 1), acc), {}),
).sort((a, b) => b[1] - a[1]);

const baselineTotal = Object.values(baseline).reduce((a, b) => a + b, 0);
const stale = Object.entries(allowance).filter(([, n]) => n > 0);

console.log(`Templates scanned : ${results.length}`);
console.log(`Violations total  : ${findings.length}`);
console.log(
  failOnAll
    ? 'Verdict scope     : every violation (--all)'
    : `Verdict scope     : violations beyond the baseline (${baselineTotal} allowed)`,
);
console.log('');

if (findings.length > 0) {
  console.log('--- all violations by rule ---');
  for (const [rule, n] of byRule) console.log(`${String(n).padStart(5)}  ${rule}`);
  console.log('');
}

if (process.env['GITHUB_ACTIONS'] === 'true') {
  const blockingSet = new Set(blocking);
  for (const f of findings) {
    const level = blockingSet.has(f) ? 'error' : 'warning';
    console.log(
      `::${level} file=${f.path},line=${f.line},col=${f.column},title=a11y ${f.rule}::${f.message}`,
    );
  }
}

if (blocking.length > 0) {
  console.log(`--- ${blocking.length} violation(s) beyond the baseline ---`);
  for (const f of blocking) console.log(`  ${f.path}:${f.line}:${f.column}  ${f.rule}`);
  console.log('');
}

// Baseline entries with nothing left to match mean the violation was fixed. Reported so the
// baseline can shrink; never a failure, because requiring it to be updated in the same commit
// would punish the fix.
if (stale.length > 0) {
  console.log('--- fixed since the baseline was recorded (run `npm run a11y:baseline`) ---');
  for (const [key, n] of stale) console.log(`  ${key} (${n} fewer)`);
  console.log('');
}

if (process.env['GITHUB_STEP_SUMMARY']) {
  const lines = [
    '## Template accessibility',
    '',
    `- Templates scanned: **${results.length}**`,
    `- Violations total: **${findings.length}** (baseline allows ${baselineTotal})`,
    `- Beyond the baseline: **${blocking.length}**`,
    '',
  ];
  if (findings.length > 0) {
    lines.push('| Rule | Count |', '| --- | --- |');
    for (const [rule, n] of byRule) lines.push(`| \`${rule}\` | ${n} |`);
    lines.push('');
  }
  if (blocking.length > 0) {
    lines.push('### Beyond the baseline — these fail the run', '');
    for (const f of blocking) lines.push(`- \`${f.path}:${f.line}\` — ${f.rule}: ${f.message}`);
  } else {
    lines.push('No accessibility violations beyond the recorded baseline.');
  }
  if (stale.length > 0) {
    lines.push('', '### Fixed since the baseline was recorded', '');
    for (const [key, n] of stale) lines.push(`- \`${key}\` (${n} fewer)`);
  }
  appendFileSync(process.env['GITHUB_STEP_SUMMARY'], `${lines.join('\n')}\n`);
}

if (blocking.length > 0) {
  console.error(
    `a11y-scan: FAIL — ${blocking.length} accessibility violation(s) beyond the baseline.`,
  );
  process.exit(1);
}

console.log(
  findings.length > 0
    ? `a11y-scan: PASS — no new violations. ${findings.length} baselined violation(s) remain.`
    : 'a11y-scan: PASS — no violations at all. Switch the workflow to `--all` and delete the baseline.',
);
