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
 * ## Three states, not two
 *
 * A project is **measured**, or it is **unmeasurable** — a coverage report that measures
 * nothing. The distinction is the whole point of the 2026-08-24 fix: `0/0` statements scored
 * as `100%`, so `assets` and `tasks`, which have no spec files at all, were recorded in the
 * baseline as meeting the Beta bar. That inflated count reached the plan, the delivery record
 * and a leadership page as "5 of 17 projects meet 90%" when the true figure was 3.
 *
 * Unmeasurable is neither a pass nor a fail: it is *untested*. A baseline entry for one
 * **fails** this gate, because the entry is itself the defect.
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
/**
 * Below this many statements, a coverage percentage carries no information about quality.
 * `libs/core` is an untouched Nx scaffold — one placeholder component, an empty template and
 * the generated `should create` spec — and scores a perfectly truthful 100% over 7
 * statements. The figure is not wrong; it is just not evidence of anything.
 *
 * The number is a judgement call, so it does **not** exclude a project from the count. It
 * only makes the gate say which of its own passes are thin, next to the count it reports.
 */
const THIN_STATEMENTS = 20;

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
    [
      'nx',
      'run-many',
      '-t',
      'test',
      `--projects=${vitest.map((p) => p.name).join(',')}`,
      '--coverage.enabled=true',
    ],
    { stdio: 'inherit', env: { ...process.env, ...webstorageOptOut() } },
  );
  if (r.status !== 0) {
    console.error(
      '\ncoverage-gate: tests failed, so coverage numbers would be meaningless. Fix the tests first.',
    );
    process.exit(1);
  }
}

/**
 * Projects that emitted a coverage report carrying no usable measurement — see
 * `collect()`. Populated by `collect()`, so it must be declared before the call.
 */
const vacuous = [];

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

/**
 * Percentage fell, but strictly more statements are covered than before — the denominator
 * grew because previously uninstrumented code entered the measurement. Reported prominently
 * and not failed; see the classification in the loop below.
 */
const expanded = [];

/** Measured this run but absent from the baseline, so nothing ratchets them. */
const unratcheted = [];

for (const m of measured) {
  const was = baseline.projects?.[m.project];
  const delta = was === undefined ? null : round(m.lines - was.lines);
  rows.push({ ...m, was: was?.lines ?? null, delta, target: round(TARGET - m.lines) });
  if (was === undefined) {
    // A `continue` alone is how a new project escaped the ratchet silently: it was
    // printed as `new` in the table and then excluded from every check, so its coverage
    // could fall to zero on the next commit without a word. `permission-dialogs` was in
    // exactly that state — 93.84%, entirely unguarded — from the moment it was created.
    unratcheted.push(m.project);
    continue;
  }
  if (delta < -TOLERANCE) {
    // A percentage drop has two very different causes, and failing both punishes the wrong one.
    //
    //   (a) tests were deleted or weakened            -> fewer statements covered  -> REGRESSION
    //   (b) an uninstrumented file entered the report -> more  statements covered  -> not one
    //
    // In (b) nothing that was tested became untested; the denominator grew because code that
    // was invisible is now measured. `collections` was exactly this: adding the first spec for
    // `collection-detail.ts` covered 64.6% of its 635 statements, took covered statements from
    // ~105 to ~515, and the *reported* figure fell from 81.67% to 62.12%.
    //
    // Failing that would make the gate punish honest measurement and reward leaving files
    // uninstrumented — the precise hole `findUninstrumented()` was just added to close. So the
    // absolute count decides, and only when the baseline actually recorded one.
    const haveCounts =
      typeof was.sCovered === 'number' &&
      typeof was.sTotal === 'number' &&
      typeof m.sCovered === 'number';
    const expandedHonestly = haveCounts && m.sCovered > was.sCovered && m.sTotal > was.sTotal;
    if (expandedHonestly) {
      expanded.push({
        project: m.project,
        was: was.lines,
        now: m.lines,
        delta,
        wasTotal: was.sTotal,
        nowTotal: m.sTotal,
        wasCovered: was.sCovered,
        nowCovered: m.sCovered,
      });
    } else {
      regressions.push({ project: m.project, was: was.lines, now: m.lines, delta });
    }
  } else if (delta > TOLERANCE)
    rises.push({ project: m.project, was: was.lines, now: m.lines, delta });
}

/**
 * Baseline entries with no coverage report this run, split by **why**.
 *
 * These were one undifferentiated list, reported as "outside the affected set" — which is
 * usually true and is not a failure. But it also absorbed entries for projects that no
 * longer exist, and those never come back: `drawers` was deleted on 2026-08-24 and its
 * baseline entry would have printed "not measured, unchanged" on every run forever, a
 * permanent line of reassurance about a library that is gone. Worse, its recorded 100% was
 * meaningless — it was an empty barrel with `passWithNoTests`.
 *
 * A baseline naming a project the workspace does not have is stale data in the file this
 * gate's authority rests on, so it fails.
 */
const projectNames = new Set(projects.map((p) => p.name));
const baselineNames = Object.keys(baseline.projects ?? {});
const vacuousNames = new Set(vacuous.map((v) => v.project));
const unmeasured = baselineNames.filter(
  (p) =>
    !measured.some((m) => m.project === p) &&
    projectNames.has(p) &&
    // Not "outside the affected set" — these DID run, and produced nothing to measure.
    // Reporting them as unmeasured-but-unchanged is how the false 100% stayed invisible.
    !vacuousNames.has(p),
);
const orphaned = baselineNames.filter((p) => !projectNames.has(p));

/**
 * The defect this check exists for: a project with nothing measurable that nevertheless
 * carries a percentage in the baseline. Every such entry is a claim the gate cannot support,
 * and each one inflates the "projects meeting the Beta bar" count that leadership reads.
 *
 * It fails rather than warns because the file is this gate's entire authority. A warning
 * would have left the same three false 100%s in place, which is exactly what happened for
 * as long as they sat there unnoticed.
 */
const falseCredit = vacuous.filter((v) => baselineNames.includes(v.project));

/**
 * Uninstrumented source files, checked against a dated allowlist.
 *
 * See `findUninstrumented()` for what this catches and why the percentage alone could not.
 * The allowlist is dated on purpose: an undated exception is indistinguishable from an
 * oversight six weeks later, and this repository has already had gates whose exceptions
 * outlived their reasons.
 *
 * Three failure modes, all blocking:
 *   1. a file is uninstrumented and not in the allowlist  — new untested code
 *   2. a file is uninstrumented and its entry has expired — accepted debt, now due
 *   3. the allowlist names a file that is now instrumented or gone — stale entry, so the
 *      file is deleted from the list rather than left as false reassurance
 */
const uninstrumentedAllowlistPath = resolve(
  repoRoot,
  '.ai/state/coverage-uninstrumented-allowlist.json',
);
const uninstrumentedAllowlist = existsSync(uninstrumentedAllowlistPath)
  ? JSON.parse(await readFile(uninstrumentedAllowlistPath, 'utf8')).files ?? {}
  : {};
const todayArg = argv[argv.indexOf('--today') + 1];
const today =
  argv.includes('--today') && todayArg ? todayArg : new Date().toISOString().slice(0, 10);

const uninstrumentedAll = measured.flatMap((m) =>
  (m.uninstrumented ?? []).map((file) => ({ project: m.project, file })),
);
const unlisted = [];
const expired = [];
for (const { project, file } of uninstrumentedAll) {
  const entry = uninstrumentedAllowlist[file];
  if (!entry) {
    unlisted.push({ project, file });
    continue;
  }
  if (!entry.until || entry.until < today) {
    expired.push({ project, file, until: entry.until ?? '(none)' });
  }
}
const uninstrumentedNow = new Set(uninstrumentedAll.map((u) => u.file));
const staleAllowlist = Object.keys(uninstrumentedAllowlist).filter(
  (f) => !uninstrumentedNow.has(f),
);

if (updateBaseline) {
  const merged = { ...baseline.projects };
  for (const m of measured) merged[m.project] = entryFor(m);
  // Orphans are pruned here as well as reported. Without this, `--update-baseline`
  // preserved an entry for a deleted project indefinitely — the one command a
  // maintainer would reach for to fix the complaint could not fix it.
  for (const p of orphaned) delete merged[p];
  // Same reasoning for vacuous entries: the command a maintainer reaches for to fix the
  // complaint has to be able to fix it, or the gate is telling them to hand-edit the file
  // it is asking them to trust.
  for (const v of vacuous) delete merged[v.project];
  await write(
    Object.entries(merged).map(([project, v]) => ({ project, ...v })),
    `updated from ${measured.length} project(s)` +
      (orphaned.length
        ? `, pruned ${orphaned.length} orphaned entr(ies): ${orphaned.join(', ')}`
        : '') +
      (vacuous.length
        ? `, pruned ${vacuous.length} unmeasurable entr(ies): ${vacuous.map((v) => v.project).join(', ')}`
        : ''),
  );
  process.exit(0);
}

report();
/**
 * Every blocking category, in one place.
 *
 * The uninstrumented checks were added to `report()` and to the FAIL banner but not here, so
 * they printed "coverage-gate: FAIL" and then exited 0 — and with `--json`, emitted
 * `ok: false` alongside a zero exit. CI reads the exit code, so the gate would have announced
 * a failure and been recorded as a pass.
 *
 * It was missed because the first negative controls appeared to work: they ran while
 * `collections` still carried its stale baseline, so a regression was already forcing exit 1
 * and every control inherited it. The controls were confirming a failure they had not caused.
 * That is the specific way a control can lie, and the fix is to re-run them from a green
 * starting state — which is how this surfaced.
 */
process.exit(
  regressions.length ||
    orphaned.length ||
    unratcheted.length ||
    falseCredit.length ||
    unlisted.length ||
    expired.length ||
    staleAllowlist.length
    ? 1
    : 0,
);

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
    if (s.files === 0) continue;
    const specs = await countSpecs(p.root);
    const uninstrumented = await findUninstrumented(p.root, data);
    // Two ways to produce a number that is not coverage. Both are separated out here rather
    // than filtered away, so the gate can name them instead of silently shrinking its scope.
    if (s.sTotal === 0) {
      vacuous.push({ project: p.name, files: s.files, specs, why: 'zero measurable statements' });
      continue;
    }
    if (specs === 0) {
      vacuous.push({
        project: p.name,
        files: s.files,
        specs,
        why: `${s.sTotal} statement(s) but no spec files`,
      });
      continue;
    }
    out.push({ project: p.name, specs, uninstrumented, ...s });
  }
  return out.sort((a, b) => a.project.localeCompare(b.project));
}

/**
 * Source files that exist on disk but appear nowhere in the project's coverage report.
 *
 * ## The hole this closes
 *
 * v8 only instruments a file some test actually imports. A source file no spec reaches is
 * therefore not reported as 0% — it is **absent from the denominator entirely**, so it cannot
 * drag the percentage down. Untested code is invisible rather than failing, which is the
 * inverse of what a coverage gate is for.
 *
 * This is the same defect family as the `0/0 = 100%` bug (N5) fixed earlier in Phase 6. That
 * one caught a project with *nothing* measurable; this one catches a project with *something*
 * measurable that quietly omits the rest of itself.
 *
 * ## What it actually found
 *
 * 25 files across four projects, and two of the findings are load-bearing:
 *
 * - **`adf-hx-bridge` reported 65.61% with 18 of its 49 files outside the measurement**,
 *   including nine `nuxeo-*-api.ts` ports. Eight of those nine have **no spec reference
 *   anywhere in the repo**. The ports are Phase 3's entire deliverable, and the coverage
 *   figure for the library that holds them never included them.
 * - **`collections` reported 81.67%** while `collection-detail.ts` — 635 statements, its
 *   largest file — was absent. The number was also inherited: it was measured over the four
 *   permission dialogs that have since moved to `libs/shared/permission-dialogs`, and
 *   reconciles to the digit (633 statements, 81.67%) against that old file set. Adding a spec
 *   for `collection-detail.ts` put 635 statements into the denominator for the first time and
 *   the reported figure *fell*, which the ratchet then called a regression. It was not one.
 *   The measurement had become honest.
 *
 * @param {string} root project root, repo-relative
 * @param {Record<string, unknown>} data the parsed `coverage-final.json`
 * @returns {Promise<string[]>} repo-relative paths, sorted
 */
async function findUninstrumented(root, data) {
  const abs = resolve(repoRoot, root);
  if (!existsSync(abs)) return [];
  // Report keys are absolute paths already, but resolve anyway: a relative key would
  // otherwise never match and flag every file in the project.
  const reported = new Set(Object.keys(data).map((f) => resolve(repoRoot, f)));
  const missing = [];
  for await (const f of walk(abs, ['node_modules', 'dist', 'coverage', '.nx'])) {
    if (!f.endsWith('.ts')) continue;
    // Specs, type-only declarations and the test harness carry no shippable statements.
    if (/\.spec\.ts$|\.d\.ts$|(^|\/)test-setup\.ts$/.test(f)) continue;
    if (!reported.has(f)) missing.push(relative(repoRoot, f));
  }
  return missing.sort();
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
    const root = relative(repoRoot, resolve(file, '..'));
    const name = j.name ?? root;
    if (t.executor === '@nx/vitest:test' && t.options?.reportsDirectory) {
      found.push({ name, root, kind: 'vitest', reportsDirectory: t.options.reportsDirectory });
    } else {
      found.push({ name, root, kind: 'other' });
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
  // `t === 0 -> 100` is defensible for branches and functions: a file with no branches
  // really is fully branch-covered, and that is what istanbul's own summary reports.
  //
  // It is NOT defensible for statements, and the previous version applied it there too.
  // `tasks` and `assets` emit reports with files but *zero* statements, so 0/0 scored 100
  // and both were recorded in the baseline as meeting the 90% Beta bar. That number reached
  // the plan, the delivery record and a leadership page as "5 of 17 projects meet 90%",
  // when the true count was 3. A gate that reports full coverage for a project with no
  // measurable code does not overstate by a rounding error — it inverts the answer.
  //
  // So statement/line coverage of nothing is `null` — *unmeasurable*, a third state
  // distinct from both pass and fail — and `sTotal` is returned so the caller can say why.
  const pct = (c, t) => (t === 0 ? 100 : round((c / t) * 100));
  const stmts = sTotal === 0 ? null : round((sCovered / sTotal) * 100);
  return {
    files,
    sTotal,
    // Returned so the ratchet can compare absolute counts, not only percentages. A
    // percentage alone cannot tell "tests were deleted" from "a previously uninstrumented
    // file entered the denominator" — see the comparability check in the main flow.
    sCovered,
    statements: stmts,
    branches: pct(bCovered, bTotal),
    functions: pct(fCovered, fTotal),
    lines: stmts,
  };
}

/**
 * Count `*.spec.ts` under a project root.
 *
 * Zero statements is not the only way to be vacuous. `core` reports 100% from **7**
 * statements and **no spec files at all** — incidental execution during module import,
 * not coverage. A project with no specs has not been tested, whatever the percentage
 * says, so it must not be counted towards the Beta bar either.
 * @param {string} root
 */
async function countSpecs(root) {
  const abs = resolve(repoRoot, root);
  if (!existsSync(abs)) return 0;
  let n = 0;
  for await (const f of walk(abs, ['node_modules', 'dist', 'coverage', '.nx'])) {
    if (/\.spec\.ts$/.test(f)) n += 1;
  }
  return n;
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

/**
 * The shape of one baseline entry.
 *
 * Extracted because it was written out in **two** places — here and in the `--update-baseline`
 * merge — and they drifted the moment absolute counts were added: the merge kept building
 * percentage-only objects, `write()` read `m.sTotal` as `undefined`, and `JSON.stringify`
 * dropped the key. The baseline then looked correctly updated while silently omitting the very
 * field the update was for. One definition, so the two cannot disagree again.
 *
 * `sTotal`/`sCovered` are the absolute counts. Recording percentages alone is what let
 * `collections` carry 81.67% — earned over 633 statements belonging to four permission dialogs
 * that have since moved to `libs/shared/permission-dialogs` — into a project whose current
 * contents measure 829. That figure reconciles to the digit against the old file set and to
 * nothing at all against the new one, and the gate could not tell, because it never stored the
 * size of what it measured.
 */
function entryFor(m) {
  return {
    lines: m.lines,
    statements: m.statements,
    branches: m.branches,
    functions: m.functions,
    sTotal: m.sTotal,
    sCovered: m.sCovered,
  };
}

async function write(list, why) {
  const projects = {};
  for (const m of list) {
    projects[m.project] = entryFor(m);
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
    console.log(
      `  ${p.padEnd(28)} ${String(v.lines).padStart(6)}%  ${gap > 0 ? `${gap}pp short of ${TARGET}%` : `meets ${TARGET}%`}`,
    );
  }
}

function report() {
  if (asJson) {
    console.log(
      JSON.stringify(
        {
          // `ok` must agree with the exit code, so every blocking category belongs in it.
          // The uninstrumented checks were reported to a human and omitted here first, which
          // would have let an evidence manifest record a clean pass while the gate had failed.
          ok:
            regressions.length === 0 &&
            orphaned.length === 0 &&
            unratcheted.length === 0 &&
            falseCredit.length === 0 &&
            unlisted.length === 0 &&
            expired.length === 0 &&
            staleAllowlist.length === 0,
          target: TARGET,
          rows,
          meetingTarget: rows.filter((r) => r.target <= 0).map((r) => r.project),
          regressions,
          rises,
          // A percentage drop that is not a regression: the denominator grew because
          // uninstrumented files entered the measurement. Recorded so the drop is explicable
          // to anyone reading the evidence later rather than looking like a silent loosening.
          expanded,
          unmeasured,
          orphaned,
          unratcheted,
          vacuous,
          falseCredit,
          uninstrumented: {
            total: uninstrumentedAll.length,
            allowed: uninstrumentedAll.length - unlisted.length - expired.length,
            unlisted,
            expired,
            staleAllowlist,
          },
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log(`\nCoverage ratchet — ${rows.length} project(s) measured, Beta target ${TARGET}%\n`);
  // `stmts` and `specs` are shown because a percentage without its denominator is what made
  // this gate wrong in the first place. `core` reports a truthful 100% over **7** statements
  // from one generated "should create" spec; printed as a bare `100%` it reads identically to
  // `shared-app-config`'s 100% over 428. The column is the difference between the two.
  console.log(
    `  ${'project'.padEnd(28)} ${'lines'.padStart(7)} ${'was'.padStart(7)} ${'delta'.padStart(7)} ${'stmts'.padStart(6)} ${'specs'.padStart(5)}   gap to ${TARGET}%`,
  );
  for (const r of rows) {
    const was = r.was === null ? '  new' : `${r.was}%`;
    const delta = r.delta === null ? '    -' : `${r.delta > 0 ? '+' : ''}${r.delta}`;
    console.log(
      `  ${r.project.padEnd(28)} ${`${r.lines}%`.padStart(7)} ${was.padStart(7)} ${delta.padStart(7)} ` +
        `${String(r.sTotal ?? '-').padStart(6)} ${String(r.specs ?? '-').padStart(5)}   ` +
        `${r.target > 0 ? `${r.target}pp short` : 'met'}`,
    );
  }

  // The headline number, printed rather than left to be counted by hand. "5 of 17 meet 90%"
  // reached three documents because nothing ever stated the figure the gate itself supported.
  const meeting = rows.filter((r) => r.target <= 0);
  const thin = meeting.filter((r) => r.sTotal < THIN_STATEMENTS);
  console.log(
    `\n  ${meeting.length} of ${rows.length} measured project(s) meet ${TARGET}%` +
      (meeting.length ? `: ${meeting.map((r) => r.project).join(', ')}` : ''),
  );
  if (thin.length) {
    // Reported, not excluded. Dropping these from the count would be a second arbitrary
    // rule to argue about; naming them lets the reader apply their own judgement.
    console.log(
      `  Of those, ${thin.length} clear${thin.length === 1 ? 's' : ''} the bar over fewer than ` +
        `${THIN_STATEMENTS} statements — ${thin.map((r) => `${r.project} (${r.sTotal})`).join(', ')}.\n` +
        `  Truthful, but it says nothing about quality. Substantively covered: ` +
        `${meeting.length - thin.length}.`,
    );
  }
  if (vacuous.length) {
    console.log(
      `  ${vacuous.length} further project(s) produced a report with nothing measurable —` +
        ' excluded from that count, listed below.',
    );
  }

  if (unmeasured.length) {
    console.log(`\n  Not measured this run (outside the affected set): ${unmeasured.join(', ')}`);
    console.log('  Their baseline entries are unchanged; this run says nothing about them.');
  }

  if (vacuous.length) {
    console.log('\n  Unmeasurable — a report was produced, but it measures nothing:');
    for (const v of vacuous) {
      console.log(
        `    ${v.project.padEnd(26)} ${v.files} file(s), ${v.specs} spec file(s) — ${v.why}`,
      );
    }
    console.log(
      '    These previously scored 100% (0/0 statements) and were recorded as meeting the\n' +
        '    Beta bar. They are neither passing nor failing: they are untested.',
    );
  }

  if (orphaned.length) {
    console.log(`\n  Baseline names ${orphaned.length} project(s) this workspace does not have:`);
    for (const p of orphaned) console.log(`    ${p}`);
  }

  if (unratcheted.length) {
    console.log(`\n  Measured but absent from the baseline, so nothing guards them:`);
    for (const p of unratcheted) console.log(`    ${p}`);
  }

  if (rises.length) {
    console.log('\n  Improved — run --update-baseline to lock these in:');
    for (const r of rises) console.log(`    ${r.project}  ${r.was}% -> ${r.now}%  (+${r.delta}pp)`);
  }

  if (expanded.length) {
    console.log(
      '\n  Percentage fell but coverage did not — the denominator grew as uninstrumented\n' +
        '  files entered the measurement. Not a regression:',
    );
    for (const e of expanded) {
      console.log(
        `    ${e.project}  ${e.was}% -> ${e.now}%  (${e.delta}pp)  ` +
          `covered ${e.wasCovered} -> ${e.nowCovered} of ${e.wasTotal} -> ${e.nowTotal} statements`,
      );
    }
    console.log(
      '    Strictly more statements are covered than before, so nothing that was tested\n' +
        '    became untested. Run --update-baseline to record the honest figure.',
    );
  }

  if (uninstrumentedAll.length) {
    const allowed = uninstrumentedAll.length - unlisted.length - expired.length;
    console.log(
      `\n  Uninstrumented — ${uninstrumentedAll.length} source file(s) in no coverage report at all:`,
    );
    const byProject = {};
    for (const u of uninstrumentedAll) (byProject[u.project] ??= []).push(u.file);
    for (const [project, files] of Object.entries(byProject)) {
      console.log(`    ${project} (${files.length})`);
    }
    console.log(
      '    v8 only instruments a file some test imports, so these are absent from the\n' +
        '    denominator rather than reported as 0% — untested code is invisible here, not\n' +
        `    failing. ${allowed} dated/unexpired, ${unlisted.length} unlisted, ${expired.length} expired.`,
    );
  }

  if (staleAllowlist.length) {
    console.log(
      `\n  Stale allowlist — ${staleAllowlist.length} entr(ies) name a file that is now covered or gone:`,
    );
    for (const f of staleAllowlist) console.log(`    ${f}`);
  }

  console.log('');
  if (
    orphaned.length ||
    unratcheted.length ||
    falseCredit.length ||
    unlisted.length ||
    expired.length ||
    staleAllowlist.length
  ) {
    const parts = [];
    if (orphaned.length) parts.push(`${orphaned.length} orphaned baseline entr(ies)`);
    if (unratcheted.length) parts.push(`${unratcheted.length} unratcheted project(s)`);
    if (falseCredit.length) parts.push(`${falseCredit.length} unmeasurable baseline entr(ies)`);
    if (unlisted.length) parts.push(`${unlisted.length} unlisted uninstrumented file(s)`);
    if (expired.length) parts.push(`${expired.length} expired uninstrumented entr(ies)`);
    if (staleAllowlist.length) parts.push(`${staleAllowlist.length} stale allowlist entr(ies)`);
    console.log(`coverage-gate: FAIL — ${parts.join(', ')}.`);
    if (falseCredit.length) {
      const names = falseCredit.map((v) => v.project);
      console.log(
        `\n  ${names.join(', ')} carr${names.length === 1 ? 'ies' : 'y'} a recorded percentage in\n` +
          '  .ai/state/coverage-baseline.json but ha' +
          (names.length === 1 ? 's' : 've') +
          ' nothing measurable. Remove the\n' +
          '  entr' +
          (names.length === 1 ? 'y' : 'ies') +
          ' with --update-baseline, or write the tests that make the number real.\n' +
          '  A recorded 100% here is not a harmless placeholder: it is counted as meeting the\n' +
          `  ${TARGET}% Beta bar, and that inflated count has already reached the plan, the\n` +
          '  delivery record and a leadership page.',
      );
    }
    if (orphaned.length) {
      console.log(
        `\n  Remove ${orphaned.join(', ')} from .ai/state/coverage-baseline.json.\n` +
          '  A baseline entry for a project that no longer exists prints "not measured,\n' +
          '  unchanged" on every run forever — a permanent line of reassurance about\n' +
          "  nothing. This gate's authority rests on that file being true.",
      );
    }
    if (unratcheted.length) {
      console.log(
        `\n  Add ${unratcheted.join(', ')} with --update-baseline. Until then they are\n` +
          '  printed as `new` and excluded from every check, so their coverage could fall\n' +
          '  to zero without this gate saying a word.',
      );
    }
    if (unlisted.length) {
      console.log(
        `\n  ${unlisted.length} source file(s) are in no coverage report and not in\n` +
          '  .ai/state/coverage-uninstrumented-allowlist.json:',
      );
      for (const u of unlisted) console.log(`    ${u.project}  ${u.file}`);
      console.log(
        '\n  Write a spec, or add a dated entry saying why not. Do not leave it unlisted:\n' +
          '  a file no test imports is omitted from the denominator, so it cannot lower the\n' +
          '  percentage. That is how adf-hx-bridge reported 65.61% with eight untested API\n' +
          "  ports — Phase 3's deliverable — outside the measurement entirely.",
      );
    }
    if (expired.length) {
      console.log(`\n  ${expired.length} uninstrumented file(s) whose acceptance has expired:`);
      for (const e of expired) console.log(`    ${e.file}  (until ${e.until})`);
      console.log(
        '\n  The date has passed. Write the spec, or move the date and say why in the entry —\n' +
          '  deliberately, as a decision someone can be held to, not as a quiet edit.',
      );
    }
    if (staleAllowlist.length) {
      console.log(
        `\n  Remove ${staleAllowlist.length} stale entr(ies) from the uninstrumented allowlist —\n` +
          '  those files are now instrumented or deleted. An exception that outlives the problem\n' +
          '  it described is false reassurance, and it makes the remaining entries look reviewed\n' +
          '  when they have not been.',
      );
    }
    return;
  }
  if (regressions.length) {
    console.log(`coverage-gate: FAIL — ${regressions.length} project(s) lost coverage:`);
    for (const r of regressions)
      console.log(`  ${r.project}  ${r.was}% -> ${r.now}%  (${r.delta}pp)`);
    console.log(
      '\n  Add the missing tests. Do not run --update-baseline to make this pass —\n' +
        '  that is the same move as weakening a test, one file further away.',
    );
  } else {
    console.log(`coverage-gate: pass — no project regressed by more than ${TOLERANCE}pp.`);
    const worst = [...rows].sort((a, b) => b.target - a.target)[0];
    if (worst && worst.target > 0) {
      console.log(
        `  Furthest from the Beta bar: ${worst.project} at ${worst.lines}% (${worst.target}pp short of ${TARGET}%).`,
      );
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
  return {
    NODE_OPTIONS: [process.env['NODE_OPTIONS'], '--no-experimental-webstorage']
      .filter(Boolean)
      .join(' '),
  };
}
