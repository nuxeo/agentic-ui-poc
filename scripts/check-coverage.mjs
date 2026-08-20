#!/usr/bin/env node
/**
 * Runs Vitest coverage for the requested projects and enforces the per-project
 * floors in coverage-thresholds.json.
 *
 *   node scripts/check-coverage.mjs                       # every gated project
 *   node scripts/check-coverage.mjs --projects=browse,ui  # only these (unknown names ignored)
 *
 * CI passes the affected project list, so unaffected projects are skipped.
 *
 * Coverage is produced by invoking Vitest directly in each project root rather than
 * through Nx: the Nx CLI rejects the repeated `--coverage.*` flags this needs, and the
 * flags have to be identical on every run for the recorded floors to be comparable.
 *
 * ---------------------------------------------------------------------------------------
 * THE DENOMINATOR DEFECT THIS REPLACED
 *
 * v8 only instruments files a test run actually loads. A source file no spec imports was
 * reported with a line total of *zero* — so instead of counting as uncovered it vanished
 * from the denominator entirely. Reported coverage was therefore the coverage of the
 * subset of each project that specs happened to touch, presented as the whole, and the
 * incentive was inverted: the first engineer to write a spec that loaded a large untested
 * file added its lines to the denominator, made measured coverage fall, and breached the
 * floor. collections scored 34% of its real 1302 lines but reported ~80%, because its
 * 766-line collection-detail.ts contributed 0/0.
 *
 * Two things are needed to make the numbers honest, and neither is obvious:
 *
 *  1. `--coverage.include`. Without it the report contains only files the run loaded, so
 *     untested files are absent rather than uncovered.
 *  2. `--coverage.ignoreEmptyLines` must be *present*. This is a Vitest quirk, verified
 *     against 3.0.9: with the flag absent, an unloaded file is reported as 0/0 and still
 *     vanishes even though `include` matched it; with the flag supplied, the same file
 *     reports its full line count, all uncovered. The *value* is immaterial — `true` and
 *     `false` behave identically — it is defining the option at all that changes the
 *     provider's path for untested files. `false` is passed because that is the intent
 *     this script actually depends on.
 *
 * Because point 2 rests on a quirk that an upgrade could quietly normalise,
 * `assertHonestDenominators` fails the run if any measured file is ever back to a zero
 * line total. That guard, not the flag, is what makes this safe to rely on.
 *
 * Totals are then summed from per-file numbers over the file list this script enumerates
 * itself, rather than read from the report's own `total`, so the denominator is fixed by
 * what is on disk instead of by what the provider chose to include.
 *
 * SEMANTICS OF THE RESULTING NUMBER. Supplying the flag also switches counting from
 * executable lines to physical source lines, for every file alike: edit-collection-dialog
 * reads 445/538 rather than 91/180. So these percentages are "share of source lines
 * exercised", and comments and blank lines inside a covered region count as covered. That
 * is uniform across files and needs no parsing or heuristics, and the floors are baselined
 * against the same measurement, so it remains a valid ratchet — but it is not the same
 * quantity as executable-line coverage and should not be compared against numbers from a
 * tool that reports that.
 * ---------------------------------------------------------------------------------------
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const manifest = JSON.parse(readFileSync(join(repoRoot, 'coverage-thresholds.json'), 'utf8'));

/**
 * WHAT COUNTS AS A SOURCE FILE
 *
 * Everything under a project's `src` that ships. Four exclusions, each narrow on purpose,
 * because a broad exclusion is how a coverage gate starts lying:
 *
 *  - `*.spec.ts` / `*.test.ts` and `test-setup.ts` — the tests themselves.
 *  - `**\/testing/**` — test doubles and fakes, which exist only to serve specs.
 *  - barrels (`index.ts`) — re-export lists with nothing to cover. Enforced rather than
 *    assumed: `assertBarrelsHaveNoLogic` fails the run if one grows runtime code.
 *  - type-only modules — files whose TypeScript emit is empty (interfaces, type aliases,
 *    `declare`). No statement survives compilation, so there is no behaviour there to
 *    cover and no test anyone could write would ever cover those lines. Counting them
 *    would deflate every project by a fixed amount nobody can ever pay off, which is the
 *    strict-direction failure: a floor that cannot be improved stops being a target.
 *
 * Note what is *not* excluded. Not `models/**` or `types/**` by directory, even though
 * that would be the obvious shortcut — `models/directory.model.ts` in nuxeo-client is 7KB
 * of real logic with its own spec, and nothing stops the next one being the same. The
 * type-only test is applied per file, from the compiler's own output, so a file rejoins
 * measurement the moment someone adds a `const` to it. Nor `.d.ts` (none exist; one
 * appearing would be caught as type-only anyway) nor `.stories.*` (no Storybook here, and
 * a rule for files that do not exist is a rule nobody maintains). `.html`/`.scss` are not
 * line-countable by v8 and are outside `include` entirely.
 */
const SOURCE_INCLUDE = 'src/**/*.ts';
const SOURCE_EXCLUDES = [
  'src/**/*.spec.ts',
  'src/**/*.test.ts',
  'src/test-setup.ts',
  'src/**/testing/**',
  'src/index.ts',
  'src/**/index.ts',
];

const COVERAGE_FLAGS = [
  '--coverage',
  '--coverage.enabled=true',
  `--coverage.include=${SOURCE_INCLUDE}`,
  ...SOURCE_EXCLUDES.map((glob) => `--coverage.exclude=${glob}`),
  // Must be present, whatever the value — see point 2 in the header. Omitting it makes
  // every unloaded file report 0/0 and drop out of the denominator.
  '--coverage.ignoreEmptyLines=false',
  '--coverage.reporter=json-summary',
];

/**
 * `lines` is enforced. `functions` is measured and printed but not enforced, and that is a
 * deliberate limit of this fix rather than an oversight: v8's empty report credits an
 * unloaded file with exactly **one** function however large it is — an untested 766-line
 * component with forty methods reports one. Lines can be corrected from the file itself
 * because a physical line count needs no instrumentation; a function count cannot. So a
 * function floor would still carry the inverted incentive: the first spec to load that
 * component adds its forty mostly-uncovered methods to the denominator and drives the
 * percentage down. Gating it would re-create, in the functions column, exactly the defect
 * this script was rewritten to remove. The recorded values are kept as observations so the
 * information is not lost and the gate is one line away from returning if the provider
 * gains real static function discovery.
 */
const GATED_METRICS = ['lines'];
const REPORTED_METRICS = ['lines', 'functions'];

function parseArgs(argv) {
  let scoped = false;
  const requested = new Set();
  for (const arg of argv.slice(2)) {
    if (!arg.startsWith('--projects=')) continue;
    // An explicit but empty --projects= means "nothing is affected", which must not fall
    // back to measuring the whole workspace.
    scoped = true;
    for (const name of arg.slice('--projects='.length).split(/[\s,]+/)) {
      if (name) requested.add(name);
    }
  }
  return { scoped, requested };
}

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist') continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, acc);
    else acc.push(path);
  }
  return acc;
}

/** True when the file's TypeScript emit is empty — see the exclusion notes above. */
function isTypeOnlyModule(path) {
  const emitted = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return (
    emitted
      .replace(/export\s*\{\s*\};?/g, '')
      .replace(/['"]use strict['"];?/g, '')
      .trim() === ''
  );
}

/**
 * The measured file set: the denominator this gate stands on. Enumerated here rather than
 * taken from the coverage report, because the report is what cannot be trusted to list
 * every file.
 */
function listSourceFiles(projectDir) {
  return walk(join(projectDir, 'src'))
    .filter((path) => path.endsWith('.ts'))
    .filter((path) => {
      const rel = relative(join(projectDir, 'src'), path).split(sep).join('/');
      if (rel.endsWith('.spec.ts') || rel.endsWith('.test.ts')) return false;
      if (rel === 'test-setup.ts') return false;
      if (rel.split('/').includes('testing')) return false;
      if (rel === 'index.ts' || rel.endsWith('/index.ts')) return false;
      return true;
    })
    .sort();
}

function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

/**
 * Barrels are excluded because a re-export list has nothing to cover. That holds only while
 * it stays a re-export list, so prove it instead of trusting it.
 */
function assertBarrelsHaveNoLogic(name, projectDir, fail) {
  const barrels = walk(join(projectDir, 'src')).filter((path) => path.endsWith(`${sep}index.ts`));
  for (const barrel of barrels) {
    const logic = stripComments(readFileSync(barrel, 'utf8')).match(
      /\b(?:function|class|enum|const|let|var)\b|=>/,
    );
    if (logic) {
      fail(
        `${name}: ${relative(repoRoot, barrel)} is excluded from coverage as a barrel but ` +
          `contains runtime code (\`${logic[0]}\`). Move it into a measured file — otherwise ` +
          `the gate measures less than it claims to.`,
      );
    }
  }
}

/**
 * Guards the fix itself. Every measured file must be present in the report with a non-zero
 * line total; a file that is missing, or present with zero instrumented lines, is a file
 * that has left the denominator — which is the defect this script was rewritten to remove.
 */
function assertHonestDenominators(name, measured, summary, fail) {
  for (const path of measured) {
    const rel = relative(repoRoot, path);
    const entry = summary[path];
    if (!entry) {
      fail(
        `${name}: ${rel} is a measured source file but is absent from the coverage report, ` +
          `so it counts for nothing. Check SOURCE_INCLUDE / SOURCE_EXCLUDES in this script.`,
      );
      continue;
    }
    if (entry.lines.total === 0) {
      fail(
        `${name}: ${rel} reports a zero line total, so it contributes nothing to the ` +
          `denominator. An unmeasured file must count as uncovered, never disappear — ` +
          `check that --coverage.ignoreEmptyLines is still being passed at all (see the ` +
          `header of this script; its presence, not its value, is what matters).`,
      );
    }
  }
}

const { scoped, requested } = parseArgs(process.argv);
const gated = Object.entries(manifest.projects).filter(([name]) => !scoped || requested.has(name));

if (gated.length === 0) {
  console.log('No gated projects in scope — nothing to check.');
  process.exit(0);
}

const workDir = mkdtempSync(join(tmpdir(), 'coverage-gate-'));
const results = [];
const structuralFailures = [];
let hardFailure = false;
const fail = (message) => structuralFailures.push(message);

try {
  for (const [name, config] of gated) {
    const projectDir = join(repoRoot, config.root);
    if (!existsSync(join(projectDir, 'vite.config.mts'))) {
      console.error(`${name}: no vite.config.mts at ${config.root}`);
      hardFailure = true;
      continue;
    }

    const reportDir = join(workDir, name);
    process.stdout.write(`Measuring ${name}… `);
    try {
      execFileSync(
        'npx',
        ['vitest', 'run', ...COVERAGE_FLAGS, `--coverage.reportsDirectory=${reportDir}`],
        { cwd: projectDir, stdio: ['ignore', 'ignore', 'pipe'], encoding: 'utf8' },
      );
    } catch (error) {
      console.log('FAILED');
      console.error(error.stderr?.trim() || error.message);
      hardFailure = true;
      continue;
    }

    const summaryPath = join(reportDir, 'coverage-summary.json');
    if (!existsSync(summaryPath)) {
      console.log('FAILED');
      console.error(`${name}: vitest produced no coverage summary`);
      hardFailure = true;
      continue;
    }
    const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));

    const sourceFiles = listSourceFiles(projectDir);
    const typeOnly = sourceFiles.filter(isTypeOnlyModule);
    const measured = sourceFiles.filter((path) => !typeOnly.includes(path));

    assertBarrelsHaveNoLogic(name, projectDir, fail);
    assertHonestDenominators(name, measured, summary, fail);

    const row = { name, metrics: {}, typeOnly, unreached: [] };
    for (const metric of REPORTED_METRICS) {
      let covered = 0;
      let total = 0;
      for (const path of measured) {
        covered += summary[path]?.[metric]?.covered ?? 0;
        total += summary[path]?.[metric]?.total ?? 0;
      }
      row.metrics[metric] = {
        covered,
        total,
        // No measured code at all counts as 0, so a suite that quietly loses its source
        // trips the gate instead of sailing through on a vacuous 100%.
        actual: total === 0 ? 0 : (covered / total) * 100,
        floor: config[metric] ?? 0,
        gated: GATED_METRICS.includes(metric),
      };
    }
    // A file with no covered line was never loaded by any spec. Worth naming: these are
    // where the honest denominator differs most from what the gate used to report.
    row.unreached = measured.filter((path) => (summary[path]?.lines.covered ?? 0) === 0);
    results.push(row);
    console.log('done');
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

console.log('');
console.log('project'.padEnd(22) + REPORTED_METRICS.map((m) => `${m} (floor)`.padEnd(24)).join(''));

const breaches = [];
for (const { name, metrics } of results) {
  let line = name.padEnd(22);
  for (const metric of REPORTED_METRICS) {
    const { actual, floor, covered, total, gated: isGated } = metrics[metric];
    const breached = isGated && actual < floor;
    if (breached) breaches.push({ name, metric, actual, floor });
    const label = isGated ? `(${floor}%)` : `(${floor}% not gated)`;
    line += `${breached ? 'FAIL ' : ''}${actual.toFixed(2)}% ${label}`.padEnd(24);
    if (process.env.COVERAGE_VERBOSE) line += `[${covered}/${total}] `;
  }
  console.log(line);
}

const unreached = results.filter((row) => row.unreached.length > 0);
if (unreached.length > 0) {
  console.log('\nSource files no spec loads. Every line of these counts as uncovered above —');
  console.log('this is what the old gate hid by dropping them from the denominator:');
  for (const { name, unreached: files } of unreached) {
    console.log(`  ${name} (${files.length})`);
    for (const path of files) console.log(`    ${relative(repoRoot, path)}`);
  }
}

if (structuralFailures.length > 0) {
  console.error('\nThe coverage measurement itself is not trustworthy:');
  for (const message of structuralFailures) console.error(`  ${message}`);
  process.exit(1);
}

if (breaches.length > 0) {
  console.error('\nCoverage dropped below the recorded floor:');
  for (const { name, metric, actual, floor } of breaches) {
    console.error(`  ${name} ${metric}: ${actual.toFixed(2)}% < ${floor}%`);
  }
  console.error('\nAdd tests for the code you changed. Do not lower the floor.');
  process.exit(1);
}

if (hardFailure) process.exit(1);

const raisable = results.flatMap(({ name, metrics }) =>
  GATED_METRICS.filter(
    (m) => metrics[m].total > 0 && metrics[m].actual - metrics[m].floor >= 5,
  ).map(
    (m) => `  ${name} ${m}: floor ${metrics[m].floor}% → ${Math.floor(metrics[m].actual) - 1}%`,
  ),
);
if (raisable.length > 0) {
  console.log('\nRatchet available — coverage now exceeds these floors by 5+ points:');
  console.log(raisable.join('\n'));
}

console.log('\nCoverage gate passed.');
