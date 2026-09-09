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
const NOTE_EDITOR = 'libs/features/document-detail/src/lib/note-editor/note-editor.ts';

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

// ---- check 1: a bypass reached through element access rather than property access -----------------
// `sanitizer['bypassSecurityTrustHtml'](x)` is an `ElementAccessExpression`. Every place that looked
// for a bypass tested `ts.isPropertyAccessExpression` only, so the bracketed spelling — ordinary
// TypeScript compiling to the same property read — was invisible to registration, to the declared
// call count, to the category budget and to checks 3 and 5. Verified against the pre-fix script
// against this exact perturbation: it printed "PASS — 31 bypass call(s), all accounted for".
control(
  'check 1 catches a bypass written with element access instead of property access',
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
            `      return this.sanitizer['bypassSecurityTrustHtml'](text);\n` +
            `    }\n`,
        );
      },
    ),
  'bypass count mismatch',
);

// ---- check 1 and 5: destructuring by ASSIGNMENT rather than declaration --------------------------
// `const { bypassSecurityTrustHtml: trust } = sanitizer` is a declaration and its left side is a
// binding pattern. `({ bypassSecurityTrustHtml: trust } = sanitizer)` is an assignment, and
// TypeScript parses that left side as an object *literal* — a `PropertyAssignment`, not a
// `BindingElement`. So the collector saw no binding element, no property access and no element
// access on the sanitizer, and the `trust(raw)` afterwards is an ordinary identifier call.
//
// Verified against 5fe82d4: an unsanitised HTML bypass written this way left the audit at
// "PASS — 31 bypass call(s), all accounted for" — outside checks 1 and 5 and outside the budget.
control(
  'check 1 catches a bypass destructured by assignment rather than declaration',
  1,
  () =>
    edit(NOTE_EDITOR, (s) => {
      const anchor = '    return this.sanitizer.bypassSecurityTrustHtml(clean);';
      if (!s.includes(anchor)) throw new Error('note-editor.ts markdownHtml changed — update this control');
      return s.replace(
        anchor,
        `    let trust!: (v: string) => SafeHtml;\n` +
          `    ({ bypassSecurityTrustHtml: trust } = this.sanitizer);\n` +
          `    if (raw === '__selftest__') {\n` +
          `      return trust(raw);\n` +
          `    }\n` +
          anchor,
      );
    }),
  'bypass count mismatch',
);

control(
  'check 5 reports a bypass destructured by assignment as indirect, so it is checked and not merely counted',
  5,
  // Being counted is not being checked. Once the function is in a local there is no argument at the
  // read site for the provenance walk to follow, which is what check 5's indirect finding is for —
  // and it only fires because the assignment form is now recorded as a bypass at all.
  () =>
    edit(NOTE_EDITOR, (s) =>
      s.replace(
        '    return this.sanitizer.bypassSecurityTrustHtml(clean);',
        `    let trust!: (v: string) => SafeHtml;\n` +
          `    ({ bypassSecurityTrustHtml: trust } = this.sanitizer);\n` +
          `    if (raw === '__selftest__') {\n` +
          `      return trust(raw);\n` +
          `    }\n` +
          '    return this.sanitizer.bypassSecurityTrustHtml(clean);',
      ),
    ),
  'indirect trusted HTML',
);

// Specificity for the two controls above, and the reason the collector asks for the assignment's
// right-hand side rather than merely recognising the property name.
//
// An `ObjectLiteralExpression` is a destructuring pattern only when it is the target of an
// assignment. In an ordinary expression position it is a value, and
// `{ bypassSecurityTrustHtml: (v) => v }` there names no bypass at all — treating it as one would
// invent a phantom call, push the member past its declared `calls`, and make the count wrong in the
// direction that produces false failures rather than silent passes. Both directions matter: a gate
// that cries wolf gets switched off, which is how the silent passes come back.
{
  try {
    edit(NOTE_EDITOR, (s) => {
      const anchor = '    return this.sanitizer.bypassSecurityTrustHtml(clean);';
      if (!s.includes(anchor)) throw new Error('note-editor.ts markdownHtml changed — update this control');
      return s.replace(
        anchor,
        '    const notAPattern = { bypassSecurityTrustHtml: (v: string) => v };\n' +
          '    void notAPattern;\n' +
          anchor,
      );
    });
    const { code, out } = runAudit(['--only', '1']);
    const quiet = code === 0;
    results.push({
      name: 'check 1 stays silent for an object literal used as a value rather than as a pattern',
      pass: quiet,
      red: !quiet,
      matched: true,
      expect: 'no finding for a non-pattern object literal that names the member',
      out,
      kind: 'specificity',
    });
  } finally {
    restoreAll();
  }
}

// ---- check 1: two bypasses sharing one source line -----------------------------------------------
// The collector deduplicated by `${line}:${name}`, so two calls to the same member written on one
// line counted as one. That is not cosmetic: the count is compared against the entry's declared
// `calls`, summed into the category budget, and ratcheted per member against the merge base, so a
// bypass hidden on an existing line evaded all three at once.
//
// This adds a FOURTH `bypassSecurityTrustHtml` to `highlightExcerpt`, whose entry declares 3, on the
// line that already holds one. Verified against 2f860a1: `--only 1` printed
// "PASS — 31 bypass call(s), all accounted for" — the total unchanged with four bypasses in a member
// declared to hold three. Deduplication is by AST node position now, so formatting cannot merge two.
control(
  'check 1 counts two bypasses written on the same source line as two',
  1,
  () =>
    edit('libs/features/knowledge-discovery/src/lib/kd-citation-dialog/kd-citation-dialog.ts', (s) => {
      const anchor =
        '      return this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(text));\n    }\n\n    const matchIndex';
      if (!s.includes(anchor)) throw new Error('highlightExcerpt changed shape — update this control');
      return s.replace(
        anchor,
        '      return this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(text)) ?? this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(text));\n    }\n\n    const matchIndex',
      );
    }),
  'bypass count mismatch',
);

// ---- check 1: element access whose index is a constant rather than a literal ---------------------
// The control above covers the literal spelling. `accessedMemberName` deliberately stopped there,
// on the stated grounds that resolving a computed index "would be the syntactic guessing this file
// has been burned by" and that nothing was silently admitted because "check 5's indirect-reference
// finding still fires on the reference that produced `name`".
//
// The first is backwards — asking `getTypeAtLocation` for a string-literal type is the compiler
// answering, which is what closed the alias class in check 4 — and the second is simply not true:
// `M` is a string, not a reference to the member, so there is no indirect read for check 5 to see.
// Verified against the pre-fix script with raw markdown handed to it: checks 1, 3 and 5 each
// printed "PASS — 31 bypass call(s), all accounted for".
control(
  'check 1 catches a bypass whose element-access index is a string constant',
  1,
  () =>
    edit(NOTE_EDITOR, (s) => {
      const anchor = '    return this.sanitizer.bypassSecurityTrustHtml(clean);';
      if (!s.includes(anchor)) throw new Error('note-editor.ts markdownHtml changed — update this control');
      return s.replace(
        anchor,
        `    const BYPASS_KEY = 'bypassSecurityTrustHtml';\n` +
          `    if (raw === '__selftest__') {\n` +
          `      return this.sanitizer[BYPASS_KEY](raw);\n` +
          `    }\n` +
          anchor,
      );
    }),
  'bypass count mismatch',
);

control(
  'check 5 checks the pairing of a bypass whose index is a string constant',
  5,
  // Being counted is not being checked, and this is the half that matters: the argument is `raw`,
  // the user-authored markdown, not the DOMPurify output. A bypass check 5 cannot see is stored XSS
  // with the gate green.
  () =>
    edit(NOTE_EDITOR, (s) =>
      s.replace(
        '    return this.sanitizer.bypassSecurityTrustHtml(clean);',
        `    const BYPASS_KEY = 'bypassSecurityTrustHtml';\n` +
          `    if (raw === '__selftest__') {\n` +
          `      return this.sanitizer[BYPASS_KEY](raw);\n` +
          `    }\n` +
          '    return this.sanitizer.bypassSecurityTrustHtml(clean);',
      ),
    ),
  'unsanitised trusted HTML',
);

// ---- check 1: element access whose member cannot be named at all ---------------------------------
// Resolving a constant index covers `as const` and an explicit literal type, but `let` widens to
// `string`, so there is no literal type for the checker to return — and no separate property read
// for check 5's indirect finding to see either. "It would not compile" is not a defence available
// here: `createTypeProgram` loads `tsconfig.base.json`, which sets neither `strict` nor
// `noImplicitAny` (the libraries turn `strict` on in their own tsconfigs), so indexing
// `DomSanitizer` with a `string` is an error to `nx build` and not an error to this audit's checker.
//
// So the object's type is the backstop: an element access on a `DomSanitizer` whose member does not
// resolve is reported, because a member this cannot name cannot be registered, categorised,
// budgeted or paired.
control(
  'check 1 reports a DomSanitizer element access whose member it cannot name',
  1,
  () =>
    edit(NOTE_EDITOR, (s) => {
      const anchor = '    return this.sanitizer.bypassSecurityTrustHtml(clean);';
      if (!s.includes(anchor)) throw new Error('note-editor.ts markdownHtml changed — update this control');
      return s.replace(
        anchor,
        `    let key = 'bypassSecurityTrustHtml';\n` +
          `    if (raw === '__selftest__') {\n` +
          `      return this.sanitizer[key](raw);\n` +
          `    }\n` +
          anchor,
      );
    }),
  'unnameable DomSanitizer member',
);

// ---- check 1: computed destructuring, the same evasion one syntax along -------------------------
// Element access and destructuring each had their own copy of the key-naming logic, and only the
// element-access one was taught to resolve a constant. So closing `sanitizer[key](raw)` left
// `const key = 'bypassSecurityTrustHtml' as const; const { [key]: trust } = sanitizer; trust(raw)`
// wide open — verified: checks 1 and 5 both printed "PASS — 31 bypass call(s), all accounted for".
// One shared `keyExpressionName` now answers for both, so the next spelling cannot be closed in one
// place and left open in the other.
control(
  'check 1 counts a bypass destructured under a computed constant key',
  1,
  () =>
    edit(NOTE_EDITOR, (s) => {
      const anchor = '    return this.sanitizer.bypassSecurityTrustHtml(clean);';
      if (!s.includes(anchor)) throw new Error('note-editor.ts markdownHtml changed — update this control');
      return s.replace(
        anchor,
        `    const key = 'bypassSecurityTrustHtml' as const;\n` +
          `    const { [key]: trust } = this.sanitizer;\n` +
          `    if (raw === '__selftest__') {\n` +
          `      return trust(raw);\n` +
          `    }\n` +
          anchor,
      );
    }),
  'bypass count mismatch',
);

control(
  'check 1 reports a DomSanitizer destructuring whose computed key it cannot name',
  1,
  // `let` widens to `string`, so there is no literal type to resolve and no member name to record.
  // The local it binds could be any member of the sanitizer, so it reports rather than assuming.
  () =>
    edit(NOTE_EDITOR, (s) =>
      s.replace(
        '    return this.sanitizer.bypassSecurityTrustHtml(clean);',
        `    let key = 'bypassSecurityTrustHtml';\n` +
          `    const { [key]: trust } = this.sanitizer;\n` +
          `    if (raw === '__selftest__') {\n` +
          `      return trust(raw);\n` +
          `    }\n` +
          '    return this.sanitizer.bypassSecurityTrustHtml(clean);',
      ),
    ),
  'unnameable DomSanitizer member',
);

// ---- check 4: a same-named member on another class in the file ----------------------------------
// Check 4 used to resolve a template expression against "whichever class in the file resolves the
// path first". One valid file defeats that: declare a class ahead of the component with a same-named
// member of a plain type, and the component's own `SafeResourceUrl` member is never consulted.
// Verified red before the fix — the audit printed PASS on a live defect.
control(
  'check 4 resolves against the component that owns the template, not another class in the file',
  4,
  () => {
    edit(VIEWER_TS, (s) => {
      const next = s.replace(
        'readonly posterUrl = input<string | null>(null);',
        'readonly posterUrl = input<SafeResourceUrl | null>(null);',
      );
      if (next === s) throw new Error('document-viewer posterUrl changed — update this control');
      // Declared BEFORE the component, so a first-match-wins resolver reaches it first.
      return next.replace(
        'export interface VideoSource {',
        'export class PosterDecoy {\n  readonly posterUrl = (): string | null => null;\n}\n\nexport interface VideoSource {',
      );
    });
  },
  'Safe* value in a NONE context',
);

// ---- check 1: destructuring under a quoted property name ----------------------------------------
// `{ bypassSecurityTrustHtml }` carries no `propertyName`, so matching the bound name was right for
// it. `{ 'bypassSecurityTrustHtml': trust }` does carry one, and the identifier-only test fell
// through to the bound name — reading the local alias `trust`, which matches nothing. Verified
// against the pre-fix script: "PASS — 31 bypass call(s), all accounted for".
control(
  'check 1 catches a bypass destructured under a quoted property name',
  1,
  () =>
    edit(NOTE_EDITOR, (s) =>
      s.replace(
        '    return this.sanitizer.bypassSecurityTrustHtml(clean);',
        `    const { 'bypassSecurityTrustHtml': trust } = this.sanitizer;\n` +
          '    void trust;\n' +
          '    return this.sanitizer.bypassSecurityTrustHtml(clean);',
      ),
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
  // The specific finding, not just the file name. `[4] unresolvable type in a NONE context`
  // names the file too, so a file-name expectation is satisfied whether check 4 *resolved* the
  // type or *gave up* on it — and this control claims the former. Review caught one sibling
  // control passing through the fail-closed path for exactly that reason; the weakness was in all
  // of them, so all of them now name the finding they mean.
  'Safe* value in a NONE context',
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
  // The specific finding, not just the file name. `[4] unresolvable type in a NONE context`
  // names the file too, so a file-name expectation is satisfied whether check 4 *resolved* the
  // type or *gave up* on it — and this control claims the former. Review caught one sibling
  // control passing through the fail-closed path for exactly that reason; the weakness was in all
  // of them, so all of them now name the finding they mean.
  'Safe* value in a NONE context',
);

control(
  'check 4 sees through an alias imported from another file',
  4,
  () => {
    // A type declared where the component is not, reached by a real import — which is what ordinary
    // refactoring produces when a type moves into a shared models file. This is resolved through the
    // checker now, so the import has to be genuine; a bare name that does not resolve is a different
    // case, covered below.
    //
    // The alias must also be RE-EXPORTED from the package barrel. Without that step this control was
    // passing for the wrong reason: `@nuxeo-satori/platform/nuxeo-client` maps to `src/index.ts`,
    // whose export list is explicit, so the import resolved to the error type, check 4 fell back to
    // its `unresolvable type in a NONE context` finding, and that finding names the same file — which
    // satisfied a bare `document-viewer.component.html` expectation. The control therefore proved the
    // fail-closed default (already covered by its own control) and said nothing about alias
    // resolution, which is the thing it exists to assert.
    edit('libs/shared/nuxeo-client/src/lib/utils/navigable-url.ts', (s) =>
      `${s}\nexport type CrossFileMediaUrl = import('@angular/platform-browser').SafeResourceUrl;\n`,
    );
    edit('libs/shared/nuxeo-client/src/index.ts', (s) => {
      const anchor = "} from './lib/utils/navigable-url';";
      if (!s.includes(anchor)) throw new Error('navigable-url barrel export changed — update this control');
      return s.replace(anchor, `  type CrossFileMediaUrl,\n${anchor}`);
    });
    edit(VIEWER_TS, (s) =>
      s
        .replace(
          "import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';",
          "import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';\nimport type { CrossFileMediaUrl } from '@nuxeo-satori/platform/nuxeo-client';",
        )
        .replace(
          'readonly posterUrl = input<string | null>(null);',
          'readonly posterUrl = input<CrossFileMediaUrl | null>(null);',
        ),
    );
  },
  // The SPECIFIC finding, not merely the file name. `unresolvable type` would also name this file,
  // and accepting that is exactly how the control came to assert nothing.
  "[4] Safe* value in a NONE context  libs/shared/ui/src/lib/document-viewer/document-viewer.component.html",
);

control(
  'check 4 sees a NONE-context binding written with Angular bind- syntax',
  4,
  () =>
    // `bind-src="…"` is the canonical form `[src]="…"` desugars to, so it reaches the identical
    // `SecurityContext.NONE` property — but the scanner was a regex asking for the bracket spelling
    // and did not match it. `<audio bind-src="blobUrl()">` therefore bound a `SafeResourceUrl` into
    // a NONE context while check 4 stayed green; verified against the pre-fix script, which reported
    // no finding for this file. The scanner now uses Angular's own `parseTemplate`, so the two
    // spellings are indistinguishable to it by construction rather than by a wider alternation.
    edit('libs/shared/ui/src/lib/document-viewer/document-viewer.component.html', (s) => {
      const out = s.replace(
        '<audio [src]="rawBlobUrl()" controls class="viewer-audio"></audio>',
        '<audio bind-src="blobUrl()" controls class="viewer-audio"></audio>',
      );
      if (out === s) throw new Error('the audio binding changed shape — update this control');
      return out;
    }),
  'Safe* value in a NONE context',
);

// ---- check 4: template discovery must not depend on how the decorator is spelled ---------------
//
// Template discovery tested `decoratorExpr.expression.getText(sf) !== 'Component'`, so it was
// fail-open on every spelling but one. `import { Component as NgComponent } from '@angular/core';
// @NgComponent({ … })` is ordinary TypeScript and produced no template entry at all — check 4 had
// nothing to report on, and returned `PASS` on a `SafeResourceUrl` bound to `video[poster]`.
// `@ngCore.Component({ … })` was invisible the same way.
//
// Resolving the identifier to Angular's own `Component` through the checker closes those two and
// leaves the same shape of hole one step out, which the third control here is for: a decorator that
// merely *refers* to `Component` resolves to the referrer, not to Angular. So discovery does not
// establish the decorator's identity at all — `template`/`templateUrl` inside a decorator argument
// is the evidence, and any decorator qualifies. There is then no import to rename to switch the
// check off.
//
// Each control retypes `posterUrl` to `SafeResourceUrl` — a real defect, as the plain `[poster]`
// control already establishes — and changes only how the decorator is written.
const decoratorSpelling = (rewrite) => {
  edit(VIEWER_TS, (s) => {
    const retyped = s.replace(
      'readonly posterUrl = input<string | null>(null);',
      'readonly posterUrl = input<SafeResourceUrl | null>(null);',
    );
    if (retyped === s) throw new Error('document-viewer posterUrl changed — update these controls');
    const out = rewrite(retyped);
    if (out === retyped) throw new Error('decorator rewrite matched nothing — update these controls');
    return out;
  });
};

/** Renames the `Component` import to `NgComponent`, leaving the decorator site to the caller. */
const aliasCoreComponentImport = (s) =>
  s.replace(/import \{([^}]*)\} from '@angular\/core';/, (whole, names) =>
    whole.replace(names, names.replace('Component,', 'Component as NgComponent,')),
  );

control(
  'check 4 finds a template behind an aliased Component decorator',
  4,
  () =>
    decoratorSpelling((s) => aliasCoreComponentImport(s).replace('@Component({', '@NgComponent({')),
  'Safe* value in a NONE context',
);

control(
  'check 4 finds a template behind a namespaced Component decorator',
  4,
  () =>
    decoratorSpelling((s) =>
      s
        .replace("import {\n  Component,", "import * as ngCore from '@angular/core';\nimport {\n  Component,")
        .replace('@Component({', '@ngCore.Component({'),
    ),
  'Safe* value in a NONE context',
);

control(
  'check 4 finds a template behind a decorator that only refers to Component',
  4,
  // The case symbol resolution does not reach: `Wrapped` resolves to the local `const`, not to
  // Angular, so an identity check would skip the template. Discovery does not ask.
  () =>
    decoratorSpelling((s) =>
      aliasCoreComponentImport(s).replace(
        '@Component({',
        'const Wrapped = NgComponent;\n\n@Wrapped({',
      ),
    ),
  'Safe* value in a NONE context',
);

control(
  'check 4 reports a template Angular itself cannot parse',
  4,
  () =>
    // A template that will not parse yields no bindings, which is indistinguishable from a template
    // with none. Reported rather than skipped, for the same reason an unresolvable type is: the check
    // must not be silent precisely where it can see least.
    edit('libs/shared/ui/src/lib/document-viewer/document-viewer.component.html', (s) =>
      s.replace('<audio [src]="rawBlobUrl()"', '@if (true) {\n<audio [src]="rawBlobUrl()"'),
    ),
  'unparsable template',
);

control(
  'check 4 reports a NONE-context binding whose type it cannot resolve',
  4,
  () =>
    // `any` is the checker declining to answer, not an answer. Treating it as a resolution would
    // reinstate the silent pass: `any` is not `Safe*`, so the binding would sail through. An
    // unresolvable alias produces the error type and lands here too.
    edit(VIEWER_TS, (s) =>
      s.replace(
        'readonly posterUrl = input<string | null>(null);',
        'readonly posterUrl = input<any>(null);',
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

// ---- check 5: the ways review showed the provenance walk could still be fooled ------------------

control(
  'check 5 rejects a function that is merely NAMED like a sanitiser',
  5,
  () =>
    // Matching the final callee name accepted any `sanitize()`. An identity function of that name
    // satisfied the guard while doing nothing — the decoy problem one level down.
    edit(NOTE_EDITOR, (s) =>
      s.replace(
        'return this.sanitizer.bypassSecurityTrustHtml(clean);',
        'const sanitize = (v: string) => v;\n    return this.sanitizer.bypassSecurityTrustHtml(sanitize(this.content() ?? ""));',
      ),
    ),
  'unsanitised trusted HTML',
);

control(
  'check 5 rejects raw text spliced into a sanitised string by a transform argument',
  5,
  () =>
    // `escaped.replace(/x/, raw)` was accepted purely because the receiver was sanitised, even though
    // the replacement is attacker-controlled.
    edit(NOTE_EDITOR, (s) =>
      s.replace(
        'return this.sanitizer.bypassSecurityTrustHtml(clean);',
        'return this.sanitizer.bypassSecurityTrustHtml(clean.replace("x", this.content() ?? ""));',
      ),
    ),
  'unsanitised trusted HTML',
);

control(
  'check 5 rejects an HTML bypass taken by reference rather than called',
  5,
  () =>
    // Indirect bypasses became visible to check 1, so they are registered and budgeted — but the
    // provenance walk has no argument to follow at a reference site, so being counted is not being
    // checked.
    edit(NOTE_EDITOR, (s) =>
      s.replace(
        'return this.sanitizer.bypassSecurityTrustHtml(clean);',
        'const trust = this.sanitizer.bypassSecurityTrustHtml.bind(this.sanitizer);\n    return trust(clean);',
      ),
    ),
  'indirect trusted HTML',
);

control(
  'check 4 sees through a LOWERCASE type alias',
  4,
  () =>
    // Alias expansion scanned only capitalised identifiers. TypeScript permits a lowercase type name,
    // so this evaded the whole mechanism added for the capitalised case.
    edit(VIEWER_TS, (s) =>
      s
        .replace(
          'export interface VideoSource {',
          'type mediaUrl = SafeResourceUrl;\n\nexport interface VideoSource {',
        )
        .replace(
          'readonly posterUrl = input<string | null>(null);',
          'readonly posterUrl = input<mediaUrl | null>(null);',
        ),
    ),
  // The specific finding, not just the file name. `[4] unresolvable type in a NONE context`
  // names the file too, so a file-name expectation is satisfied whether check 4 *resolved* the
  // type or *gave up* on it — and this control claims the former. Review caught one sibling
  // control passing through the fail-closed path for exactly that reason; the weakness was in all
  // of them, so all of them now name the finding they mean.
  'Safe* value in a NONE context',
);

control(
  'check 5 lapses a registered sanitiser once its body is edited',
  5,
  () =>
    // The one hole a reviewed-registry design leaves: identity alone would keep accepting a helper
    // that has since been edited into a no-op. Each entry is pinned to a hash of the declaration it
    // was reviewed as, so any change to what the code does lapses the registration until someone
    // re-reviews and re-pins. Whitespace is normalised first, so reformatting does not.
    edit('libs/features/knowledge-discovery/src/lib/kd-citation-dialog/kd-citation-dialog.ts', (s) => {
      const out = s.replace(
        /private escapeHtml\(value: string\): string \{/,
        'private escapeHtml(value: string): string {\n    if (value === "") return value;',
      );
      if (out === s) throw new Error('kd-citation-dialog escapeHtml signature changed — update control');
      return out;
    }),
  'unsanitised trusted HTML',
);

control(
  'check 5 rejects a locally-declared renderTrustedHtml that is not the real one',
  5,
  () =>
    // Identity by callee text accepted anything named right. The real helper arrives by import; a
    // local function of the same name is by construction not it.
    edit(NOTE_EDITOR, (s) =>
      s.replace(
        'return this.sanitizer.bypassSecurityTrustHtml(clean);',
        'const renderTrustedHtml = (v: string) => v;\n    return this.sanitizer.bypassSecurityTrustHtml(renderTrustedHtml(this.content() ?? ""));',
      ),
    ),
  'unsanitised trusted HTML',
);

// ---- check 5: the two fail-open paths in the provenance walk ------------------------------------
//
// Both were silent on this repository before the fix, and both hand attacker-authored markdown to
// `bypassSecurityTrustHtml` with the gate printing "PASS — 31 bypass call(s), all accounted for".
control(
  'check 5 rejects raw text appended by a compound assignment',
  5,
  // `sanitizerReaches` collected only `EqualsToken` assignments as sources of a variable, so
  // `clean += raw` was not a source at all: the walk saw the sanitised initialiser, never the
  // appended value. Every assignment operator is recorded now, and `+=` puts its right-hand side in
  // the independent set, which is the same treatment `clean = clean + raw` already received.
  () =>
    edit(NOTE_EDITOR, (s) => {
      const before = `    const clean = DOMPurify.sanitize(raw, { ADD_ATTR: ['target', 'rel'] });\n` +
        '    return this.sanitizer.bypassSecurityTrustHtml(clean);';
      if (!s.includes(before)) throw new Error('note-editor markdownHtml changed — update this control');
      return s.replace(
        before,
        `    let clean = DOMPurify.sanitize(raw, { ADD_ATTR: ['target', 'rel'] });\n` +
          '    clean += raw;\n' +
          '    return this.sanitizer.bypassSecurityTrustHtml(clean);',
      );
    }),
  'unsanitised trusted HTML',
);

control(
  'check 5 does not let a same-named shadow vouch for an unsanitised parameter',
  5,
  // Sources were gathered by identifier **text** across the whole member, so any same-named
  // declaration counted. A parameter contributes no source at all, so for `trustShadowed(clean)` the
  // inner `const clean = DOMPurify.sanitize(...)` — in a branch that never runs, and whose value
  // never reaches the bypass — was the *only* source collected, and "every source is sanitised" was
  // satisfied by a value that is not the one being trusted. Sources are matched by checker symbol
  // now, so the two `clean`s are different bindings and the parameter has no source: nothing to
  // trace, nothing proven, reported.
  () =>
    edit(NOTE_EDITOR, (s) => {
      const before = `  readonly markdownHtml = computed(() => {\n` +
        '    if (!this.isMarkdown()) return null;\n' +
        "    const raw = renderNoteMarkdown(this.content() ?? '');\n" +
        `    const clean = DOMPurify.sanitize(raw, { ADD_ATTR: ['target', 'rel'] });\n` +
        '    return this.sanitizer.bypassSecurityTrustHtml(clean);\n' +
        '  });';
      if (!s.includes(before)) throw new Error('note-editor markdownHtml changed — update this control');
      return s.replace(
        before,
        `  readonly markdownHtml = computed(() => {\n` +
          '    if (!this.isMarkdown()) return null;\n' +
          "    const raw = renderNoteMarkdown(this.content() ?? '');\n" +
          '    return this.trustShadowed(raw);\n' +
          '  });\n' +
          '\n' +
          '  private trustShadowed(clean: string): SafeHtml {\n' +
          "    if (clean === '__never__') {\n" +
          `      const clean = DOMPurify.sanitize('x', { ADD_ATTR: ['target', 'rel'] });\n` +
          '      void clean;\n' +
          '    }\n' +
          '    return this.sanitizer.bypassSecurityTrustHtml(clean);\n' +
          '  }',
      );
    }),
  'unsanitised trusted HTML',
);

// ---- check 1: the reviewed-sanitiser registry must carry its own review ------------------------
//
// The `sanitisers` list is the entire basis on which check 5 admits anything, and the written
// rationale is the control — five rounds established that "this function escapes HTML" cannot be
// proven from syntax. Bypass entries have enforced a trimmed 40-character floor since the gate was
// written. This list only tested `typeof justification === 'string'`, so `""` satisfied it, while the
// comment at the call site asserted that unexplained entries were dropped.
//
// Verified before the fix on the working tree: blanking `kd-citation-dialog::escapeHtml`'s
// justification, and separately reducing it to `"safe"`, left checks 1 *and* 5 green with the helper
// still admitted as a sanitiser.
const sanitiserEntry = (mutate) =>
  edit(ALLOWLIST, (s) => {
    const j = JSON.parse(s);
    if (!Array.isArray(j.sanitisers) || j.sanitisers.length === 0) {
      throw new Error('the sanitisers registry is empty — update these controls');
    }
    mutate(j.sanitisers[0]);
    return JSON.stringify(j, null, 2);
  });

control(
  'check 1 rejects a sanitiser registry entry whose justification is blank',
  1,
  () => sanitiserEntry((entry) => { entry.justification = ''; }),
  'no "justification"',
);

control(
  'check 1 rejects a sanitiser registry justification below the length floor',
  1,
  // A blank check alone is defeated by typing "safe", which is the same floor bypass entries have.
  () => sanitiserEntry((entry) => { entry.justification = 'safe'; }),
  'under the 40 minimum',
);

control(
  'check 1 rejects a sanitiser registry entry with no pinned sha',
  1,
  // Without the hash, registration could not lapse when the helper is edited into a no-op — which is
  // the one hole a reviewed-list design otherwise leaves, and the reason the pin exists at all.
  () => sanitiserEntry((entry) => { delete entry.sha; }),
  'no "sha"',
);

control(
  'check 5 stops admitting a helper whose registry entry is unusable',
  5,
  // Reporting at the registry is not enough on its own: the entry must also be *dropped*, or the
  // helper would keep vouching for the bypass while check 1 complained about the paperwork.
  () => sanitiserEntry((entry) => { entry.justification = ''; }),
  'unsanitised trusted HTML',
);

// ---- check 4: the template value, not just the template syntax ---------------------------------
//
// `templatesFor` accepted only a literal `template`/`templateUrl`. Angular's compiler statically
// evaluates more than that, so an ordinary refactor removed a component from the audit entirely:
// moving the template to a module constant returned check 4 to `PASS` on a `SafeResourceUrl` bound
// to `video[poster]` — the gate silent on a live defect because of *where the string was written*.
//
// The value is resolved through the checker as a string-literal type, which covers a `const`, an
// `as const`, and an imported or re-exported constant. What it cannot resolve is reported, so a
// template it could not read is never mistaken for a component that has none.
const constantTemplate = (declaration) =>
  edit(VIEWER_TS, (s) => {
    const retyped = s.replace(
      'readonly posterUrl = input<string | null>(null);',
      'readonly posterUrl = input<SafeResourceUrl | null>(null);',
    );
    if (retyped === s) throw new Error('document-viewer posterUrl changed — update these controls');
    const withConst = retyped.replace('@Component({', `${declaration}\n\n@Component({`);
    const referenced = withConst.replace(
      "templateUrl: './document-viewer.component.html',",
      'template: VIEWER_TEMPLATE,',
    );
    if (referenced === withConst) {
      throw new Error('document-viewer templateUrl changed — update these controls');
    }
    return referenced;
  });

const POSTER_TEMPLATE = `'<video [poster]="posterUrl()"></video>'`;

control(
  'check 4 reads a template referenced through a constant',
  4,
  () => constantTemplate(`const VIEWER_TEMPLATE = ${POSTER_TEMPLATE};`),
  'Safe* value in a NONE context',
);

control(
  'check 4 reads a template referenced through an as-const constant',
  4,
  () => constantTemplate(`const VIEWER_TEMPLATE = ${POSTER_TEMPLATE} as const;`),
  'Safe* value in a NONE context',
);

control(
  'check 4 reports a template value it cannot resolve to a string',
  4,
  // `let` widens to `string`, so there is no literal type to read. Reported, not skipped — the same
  // fail-closed stance as an unresolvable binding type or an unparsable template.
  () => constantTemplate(`let VIEWER_TEMPLATE = ${POSTER_TEMPLATE};`),
  'unreadable template value',
);

// ---- the ratchet ---------------------------------------------------------------------------------
control(
  'the ratchet rejects headroom left behind by a removal',
  null,
  () =>
    // Under-budget used to be a note. That left the slack for a later change to reintroduce a bypass
    // into without raising any budget — the ratchet slipping rather than holding.
    edit(ALLOWLIST, (s) => {
      const j = JSON.parse(s);
      j.budgets.A += 1;
      return JSON.stringify(j, null, 2);
    }),
  'but its budget is still',
);

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
