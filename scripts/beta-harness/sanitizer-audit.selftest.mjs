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
 * Every perturbation is applied in memory and written back from the original bytes in a `finally`,
 * with SIGINT/SIGTERM/SIGHUP and `uncaughtException` handlers covering the paths `finally` does not.
 * **SIGKILL and power loss remain uncatchable**, so the guarantee is "no dirty tree unless the
 * process is killed outright" — not an absolute one. Recovery is `git checkout` on the paths the
 * handler names. It touches real tracked files, so do not run it concurrently with a build.
 *
 * Usage:  node scripts/beta-harness/sanitizer-audit.selftest.mjs
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');
const AUDIT = 'scripts/beta-harness/sanitizer-audit.mjs';
const ALLOWLIST = '.ai/state/sanitizer-allowlist.json';
const VIEWER_TS = 'libs/shared/ui/src/lib/document-viewer/document-viewer.component.ts';

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

// `finally` covers a thrown error but not a signal, and this perturbs real tracked files. Without
// these handlers a Ctrl-C mid-control leaves the tree dirty, and the next reader finds a bypass in
// their working copy that they did not write. SIGKILL and a hard power loss remain uncatchable by
// construction: `git checkout` on the paths named in the failure output is the recovery.
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => {
    const touched = [...backups.keys()];
    restoreAll();
    if (touched.length) {
      console.error(`\nselftest: interrupted by ${signal} — restored ${touched.join(', ')}`);
    }
    process.exit(130);
  });
}
// A throw outside a control's `finally` (e.g. in a perturbation itself) would also skip restoration.
process.on('uncaughtException', (err) => {
  const touched = [...backups.keys()];
  restoreAll();
  if (touched.length) console.error(`selftest: crashed — restored ${touched.join(', ')}`);
  console.error(err);
  process.exit(1);
});

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
    results.push({ name, pass: red && matched, red, matched, expect, out, kind: 'negative' });
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
      kind: 'baseline',
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

// ---- check 1: an extra bypass inside an ALREADY-REGISTERED member ---------------------------------
// The hole this closes was real. Keying the allowlist by `file::member` alone meant a bare
// `entries.has(key)` waved through any number of calls in a member that was already listed.
// `highlightExcerpt` holds three, so a fourth grew genuine debt 31 -> 32 while every number the
// ratchet watches stayed put — the pre-fix gate printed "PASS — 32 bypass call(s), all accounted
// for". Verified by running the old script against this exact perturbation.
control(
  'check 1 catches an extra bypass added to an already-registered member',
  1,
  () =>
    edit(
      'libs/features/knowledge-discovery/src/lib/kd-citation-dialog/kd-citation-dialog.ts',
      (s) => {
        const anchor = `  private highlightExcerpt(text: string, excerpt?: string): SafeHtml {\n`;
        if (!s.includes(anchor)) {
          throw new Error('highlightExcerpt signature changed — update this control');
        }
        return s.replace(
          anchor,
          anchor +
            `    if (text === '__selftest__') {\n` +
            `      return this.sanitizer.bypassSecurityTrustHtml(text);\n` +
            `    }\n`,
        );
      },
    ),
  'bypass count mismatch',
);

// ---- check 1: an entry with no written justification ---------------------------------------------
// The gate's premise is "registered *with a justification*". Keying on `file::member` alone made
// `{ "member": "loadPreview" }` sufficient, so the gate enforced bookkeeping rather than review.
control(
  'check 1 rejects an allowlist entry whose justification is blank',
  1,
  () =>
    edit(ALLOWLIST, (s) => {
      const j = JSON.parse(s);
      j.sites['libs/features/browse/src/lib/browse/browse.ts'][0].justification = '';
      return JSON.stringify(j, null, 2);
    }),
  'no "justification"',
);

// ---- check 1: a justification too short to be one ------------------------------------------------
// A blank check alone is trivially defeated by typing "safe", so there is a length floor.
control(
  'check 1 rejects a placeholder justification below the length floor',
  1,
  () =>
    edit(ALLOWLIST, (s) => {
      const j = JSON.parse(s);
      j.sites['libs/features/browse/src/lib/browse/browse.ts'][0].justification = 'safe';
      return JSON.stringify(j, null, 2);
    }),
  'under the 40 minimum',
);

// ---- check 1: an approved helper is not exempt from registration ---------------------------------
// Being the sanctioned place to hold a bypass is a reason to register it, not to skip registration.
// The exemption previously also skipped call counting and the budget, so a second bypass inside a
// helper would have passed silently. Simulated by pointing APPROVED_HELPERS at a real registered
// member and removing its entry: if the exemption were still in force, check 1 would stay green.
control(
  'check 1 still requires registration for an approved helper member',
  1,
  () => {
    edit(AUDIT, (s) => {
      const marker = `const APPROVED_HELPERS = new Map([`;
      if (!s.includes(marker)) throw new Error('APPROVED_HELPERS shape changed — update this control');
      return s.replace(
        marker,
        marker +
          `\n  ['libs/features/browse/src/lib/browse/browse.ts', 'loadThumbnails'],`,
      );
    });
    edit(ALLOWLIST, (s) => {
      const j = JSON.parse(s);
      delete j.sites['libs/features/browse/src/lib/browse/browse.ts'];
      j.budgets.A -= 1; // keep the ratchet quiet so only check 1 is under test
      return JSON.stringify(j, null, 2);
    });
  },
  'This is an approved helper, which is exactly why it needs an entry',
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

// Specificity: check 4 must stay silent while doing all of its work.
//
// This used to re-run `--only 4` on the unperturbed tree and assert `document-viewer.component.html`
// was absent — which the green baseline above already implies, since exit 0 means no findings at all.
// It could not fail unless the baseline had, so it asserted nothing and inflated the tally.
//
// It now perturbs the tree so the resolver walks its longest path — `@for` loop variable, to the
// iterated member, to `VideoSource[]`, to the element type, to the `url` property, then through an
// alias — and lands on a type that is NOT `Safe*`. A check that fired here would be keying on
// "resolved a type reference" rather than on what the type resolves to, and the alias expansion added
// for the evasions above is exactly the machinery that could get that wrong.
{
  try {
    edit(VIEWER_TS, (s) =>
      s
        .replace(
          'export interface VideoSource {',
          'type PlainMediaUrl = string;\n\nexport interface VideoSource {',
        )
        .replace(/^(\s*)url: string;$/m, '$1url: PlainMediaUrl;'),
    );
    const { code, out } = runAudit(['--only', '4']);
    const quiet = code === 0 && !out.includes('document-viewer.component.html');
    results.push({
      name: 'check 4 stays silent when the alias it expands resolves to a plain string',
      pass: quiet,
      red: !quiet,
      matched: true,
      expect: 'no document-viewer finding while VideoSource.url aliases string',
      out,
      kind: 'specificity',
    });
  } finally {
    restoreAll();
  }
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
  // Finding renamed from "unpaired" to "unsanitised" when check 5 stopped asking whether a sanitiser
  // was *nearby* and started asking whether its result actually reaches the bypass.
  'unsanitised trusted HTML  libs/features/document-detail/src/lib/note-editor/note-editor.ts',
);

// ---- check 4: the evasions review found, each of which used to pass silently ---------------------
//
// The control above proves the resolver can walk a `@for` variable into a same-file interface. It
// cannot prove the resolver understands *types*, and it did not: review demonstrated that
// `type MediaUrl = SafeResourceUrl` reduced to the text `MediaUrl`, which `mentionsSafe` does not
// match. Each control here is one of those evasions, and each was verified red before the fix.

control(
  'check 4 sees through a local type alias',
  4,
  () =>
    edit(VIEWER_TS, (s) =>
      s
        .replace(
          'export interface VideoSource {',
          'type MediaUrl = SafeResourceUrl;\n\nexport interface VideoSource {',
        )
        .replace(
          'readonly posterUrl = input<string | null>(null);',
          'readonly posterUrl = input<MediaUrl | null>(null);',
        ),
    ),
  'document-viewer.component.html',
);

control(
  'check 4 sees through an alias declared in another file',
  4,
  () => {
    // Declared where the component does not — the case that made the per-file shape map a silent
    // pass, and the one ordinary refactoring produces by moving a type into a shared models file.
    edit('libs/shared/nuxeo-client/src/lib/utils/navigable-url.ts', (s) =>
      `export type CrossFileMediaUrl = import('@angular/platform-browser').SafeResourceUrl;\n${s}`,
    );
    edit(VIEWER_TS, (s) =>
      s.replace(
        'readonly posterUrl = input<string | null>(null);',
        'readonly posterUrl = input<CrossFileMediaUrl | null>(null);',
      ),
    );
  },
  'document-viewer.component.html',
);

control(
  'check 4 reports a NONE-context binding whose type it cannot resolve',
  4,
  () =>
    // No type argument and no annotation, so the resolver returns "cannot tell". It must report
    // rather than skip: every documented evasion surfaced as unresolvable, not as benign.
    edit(VIEWER_TS, (s) =>
      s.replace(
        'readonly posterUrl = input<string | null>(null);',
        'readonly posterUrl = input(null as unknown as string | null);',
      ),
    ),
  'unresolvable type in a NONE context',
);

// ---- check 5: a decoy sanitiser must not satisfy the pairing -------------------------------------
control(
  'check 5 rejects a sanitiser whose result never reaches the bypass',
  5,
  () =>
    edit('libs/features/document-detail/src/lib/note-editor/note-editor.ts', (s) => {
      // The DOMPurify call stays — it is the decoy. What changes is that the bypass now receives
      // raw content instead of the sanitised result. The previous check only asked whether the text
      // `DOMPurify.sanitize(` appeared in the member, so it passed on exactly this.
      const out = s.replace(
        'return this.sanitizer.bypassSecurityTrustHtml(clean);',
        'return this.sanitizer.bypassSecurityTrustHtml(this.content() ?? "");',
      );
      if (out === s) {
        throw new Error('note-editor.ts no longer matches the decoy control — update it');
      }
      return out;
    }),
  'unsanitised trusted HTML',
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
  'budget is 13',
);

control(
  'the ratchet cannot be removed by deleting the budgets object',
  null,
  () =>
    // `Object.entries(raw.budgets ?? {})` iterated nothing, so deleting the key turned the ceiling
    // off and the gate stayed green. Removing a ratchet must be louder than lowering it.
    edit(ALLOWLIST, (s) => {
      const j = JSON.parse(s);
      delete j.budgets;
      return JSON.stringify(j, null, 2);
    }),
  "has no 'budgets' object",
);

control(
  'the ratchet rejects a category with no numeric budget',
  null,
  () =>
    edit(ALLOWLIST, (s) => {
      const j = JSON.parse(s);
      delete j.budgets.D;
      return JSON.stringify(j, null, 2);
    }),
  'category D has no numeric budget',
);

// ---- report -------------------------------------------------------------------------------------
// The row kinds are reported separately on purpose. Only `negative` rows are negative controls —
// they perturb the tree and assert the audit goes red for a named reason. `baseline` rows assert
// GREEN, and `specificity` asserts silence; both are necessary context but neither is evidence that
// a check can fail. Collapsing all three into one total reads as "N checks proven able to fail",
// which is the "evidence must assert the claim, not the pulse" failure `CLAUDE.md` warns about —
// and this summary previously did exactly that, reporting 13 as though all 13 were red-on-purpose.
const KIND_LABEL = { negative: 'RED-ON-PURPOSE', baseline: 'baseline (green)', specificity: 'silence' };
console.log('\nsanitizer-audit selftest\n');
let failed = 0;
for (const r of results) {
  console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  [${KIND_LABEL[r.kind]}]  ${r.name}`);
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
const tally = (k) => results.filter((r) => r.kind === k).length;
const negatives = tally('negative');

console.log('');
if (failed > 0) {
  console.log(`selftest: FAIL — ${failed} of ${results.length} assertions did not behave as expected.`);
  console.log('A check that cannot be made to fail is decoration. Fix the check, not the control.');
  process.exit(1);
}
console.log(
  `selftest: PASS — ${negatives} negative control(s) observed red on purpose; ` +
    `${tally('baseline')} green baseline(s) and ${tally('specificity')} silence assertion(s) as context. ` +
    `${results.length} assertions total.`,
);
console.log(
  '  Only the negative controls prove a check can fail. The baselines assert green and are not evidence of that.',
);
