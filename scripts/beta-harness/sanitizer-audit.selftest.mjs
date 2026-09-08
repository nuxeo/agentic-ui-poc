#!/usr/bin/env node
/**
 * Negative controls for `sanitizer-audit.mjs` — proof that each check can actually fail.
 *
 * `CLAUDE.md`: *a gate is not evidence until you have seen it fail on purpose.* Three gates in
 * this programme were green while the thing they guarded was broken — an evidence check that
 * compared script `src` attributes instead of bundle bytes, a path check that was tautological
 * under the dev base href, and a lockfile gate that matched dependency names but not versions.
 *
 * So rather than capture one red run in a transcript nobody re-reads, this perturbs the tree
 * once per check, asserts the audit goes red *for the expected reason*, and restores. It is
 * repeatable, so it keeps answering the question after the next refactor.
 *
 * Every perturbation is applied in memory and written back from the original bytes in a
 * `finally`, so an interrupted run cannot leave the tree dirty. It still touches real files, so
 * do not run it concurrently with a build.
 *
 * Usage:  node scripts/beta-harness/sanitizer-audit.selftest.mjs
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');
const AUDIT = 'scripts/beta-harness/sanitizer-audit.mjs';
const ALLOWLIST = '.ai/state/sanitizer-allowlist.json';

/** Runs the audit and returns { code, out }. */
function runAudit(extraArgs = []) {
  const r = spawnSync('node', [AUDIT, ...extraArgs], { cwd: ROOT, encoding: 'utf8' });
  return { code: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

const backups = new Map();
function edit(relPath, transform) {
  const abs = join(ROOT, relPath);
  const original = readFileSync(abs, 'utf8');
  if (!backups.has(relPath)) backups.set(relPath, original);
  const next = transform(original);
  if (next === original) throw new Error(`perturbation for ${relPath} changed nothing — the selftest would be vacuous`);
  writeFileSync(abs, next, 'utf8');
}
function restoreAll() {
  for (const [relPath, original] of backups) writeFileSync(join(ROOT, relPath), original, 'utf8');
  backups.clear();
}

const results = [];

/**
 * @param {string} name
 * @param {number|null} check  --only value, or null for the whole audit
 * @param {() => void} perturb
 * @param {string} expect  substring the red output must contain
 */
function control(name, check, perturb, expect) {
  try {
    perturb();
    const { code, out } = runAudit(check === null ? [] : ['--only', String(check)]);
    const red = code !== 0;
    const matched = out.includes(expect);
    results.push({ name, pass: red && matched, red, matched, expect, out });
  } finally {
    restoreAll();
  }
}

// ---- baseline -----------------------------------------------------------------------------------
// Every check must be green on an unperturbed tree, or a "red" below could be pre-existing noise
// rather than the perturbation talking.
//
// Check 4 was red here when this file was written: it reported exactly the five NONE-context sites
// section 2 of the plan predicted in advance, plus the dormant `video[poster]`. Those are now
// fixed, so its baseline is green and the positive control below is what keeps it honest.
{
  const green = [1, 2, 3, 4, 5];
  for (const c of green) {
    const { code, out } = runAudit(['--only', String(c)]);
    results.push({
      name: `baseline: check ${c} is green before perturbation`,
      pass: code === 0,
      red: code !== 0,
      matched: true,
      expect: '(exit 0)',
      out,
    });
  }
}

// ---- check 1: an unregistered bypass -------------------------------------------------------------
control(
  'check 1 catches a bypass with no allowlist entry',
  1,
  () =>
    edit(ALLOWLIST, (s) => {
      const j = JSON.parse(s);
      delete j.sites['libs/features/browse/src/lib/browse/browse.ts'];
      j.budgets.A -= 1; // keep the ratchet quiet so only check 1 is under test
      return JSON.stringify(j, null, 2);
    }),
  'unregistered bypass  libs/features/browse/src/lib/browse/browse.ts',
);

// ---- check 2: a stale allowlist entry ------------------------------------------------------------
control(
  'check 2 catches an allowlist entry whose member has no bypass',
  2,
  () =>
    edit(ALLOWLIST, (s) => {
      const j = JSON.parse(s);
      j.sites['libs/features/browse/src/lib/browse/browse.ts'].push({
        member: 'aMemberThatDoesNotExist',
        category: 'A',
        sonarKey: 'selftest',
        justification: 'selftest perturbation',
      });
      j.budgets.A += 1;
      return JSON.stringify(j, null, 2);
    }),
  'stale allowlist entry  libs/features/browse/src/lib/browse/browse.ts::aMemberThatDoesNotExist',
);

// ---- check 3: a redundant bypass on a locally-minted object URL ----------------------------------
// Removing the allowlist entry exposes the same call to check 3, which is the check that has to
// keep working once PR 5 has deleted these: it is what stops one being reintroduced.
control(
  'check 3 catches an unrecorded bypass on a URL.createObjectURL result',
  3,
  () =>
    edit(ALLOWLIST, (s) => {
      const j = JSON.parse(s);
      delete j.sites['libs/features/browse/src/lib/browse/browse.ts'];
      j.budgets.A -= 1;
      return JSON.stringify(j, null, 2);
    }),
  'redundant bypass  libs/features/browse/src/lib/browse/browse.ts',
);

// ---- check 4: a Safe* value in a NONE context ----------------------------------------------------
// Reintroduce the historical defect: `VideoSource.url` back to `SafeResourceUrl`, which is what
// broke the transcoded-video source list. The binding is `<source [src]="src.url">` where `src` is
// a `@for` loop variable over `videoSources()`, so catching this requires resolving the loop
// variable to the iterated member, the member to `VideoSource[]`, the element type to
// `VideoSource`, and finally the `url` property — the deepest path the resolver walks. If a
// regex over the expression text were enough, this control would be unnecessary.
control(
  'check 4 catches a Safe* type reached through an interface and a @for loop variable',
  4,
  () =>
    edit('libs/shared/ui/src/lib/document-viewer/document-viewer.component.ts', (s) =>
      s.replace(/^(\s*)url: string;$/m, '$1url: SafeResourceUrl;'),
    ),
  'document-viewer.component.html',
);

// And the inverse: with the real types in place, check 4 must be silent on that file. A check that
// fires either way is not keying on the type at all.
{
  const { out } = runAudit(['--only', '4']);
  const quiet = !out.includes('document-viewer.component.html');
  results.push({
    name: 'check 4 is silent once the same binding resolves to string',
    pass: quiet,
    red: !quiet,
    matched: true,
    expect: 'no document-viewer finding while VideoSource.url is string',
    out,
  });
}

// ---- check 5: unpaired trusted HTML --------------------------------------------------------------
control(
  'check 5 catches bypassSecurityTrustHtml with no sanitiser beside it',
  5,
  () =>
    edit('libs/features/document-detail/src/lib/note-editor/note-editor.ts', (s) => {
      // Neutralise the sanitiser call while leaving the bypass in place.
      const out = s.replace(/DOMPurify\.sanitize\(/g, 'passThroughForSelftest(');
      if (out === s) throw new Error('note-editor.ts no longer calls DOMPurify.sanitize — update this control');
      return out;
    }),
  'unpaired trusted HTML  libs/features/document-detail/src/lib/note-editor/note-editor.ts',
);

// ---- the ratchet ---------------------------------------------------------------------------------
control(
  'the ratchet catches a category growing past its budget',
  null,
  () =>
    edit(ALLOWLIST, (s) => {
      const j = JSON.parse(s);
      j.budgets.A -= 1;
      return JSON.stringify(j, null, 2);
    }),
  'category A has 14 entries, budget is 13',
);

// ---- report -------------------------------------------------------------------------------------
console.log('\nsanitizer-audit negative controls\n');
let failed = 0;
for (const r of results) {
  console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${r.name}`);
  if (!r.pass) {
    failed += 1;
    console.log(`        expected: ${r.expect}`);
    console.log(`        went red: ${r.red}   matched: ${r.matched}`);
    console.log(
      r.out
        .split('\n')
        .map((l) => `        | ${l}`)
        .join('\n'),
    );
  }
}
console.log('');
if (failed > 0) {
  console.log(`selftest: FAIL — ${failed} of ${results.length} controls did not behave as expected.`);
  console.log('A check that cannot be made to fail is decoration. Fix the check, not the control.');
  process.exit(1);
}
console.log(`selftest: PASS — ${results.length} controls, every check observed failing on purpose.`);
