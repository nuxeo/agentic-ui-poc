#!/usr/bin/env node
/**
 * Rebase every per-project `lcov.info` onto the repository root and merge them into one file.
 *
 * ## The two problems this solves, both of which report as "0.0% coverage"
 *
 * 1. **Paths.** Each project's Vitest `root` is its own directory, so its lcov records source
 *    files as `SF:src/lib/thing.ts`. SonarCloud analyses from the repository root, where that
 *    resolves to `<repoRoot>/src/lib/thing.ts` — a path that does not exist. Coverage for a
 *    file Sonar cannot locate is not an error; it is silently dropped. Since
 *    `reportsDirectory` mirrors the project root (`coverage/libs/shared/ui` for
 *    `libs/shared/ui`), the correct prefix is recoverable from the report's own location.
 *
 * 2. **Discovery.** `sonar.javascript.lcov.reportPaths` was set to `coverage/**​/lcov.info`.
 *    Rather than depend on how the scanner expands a recursive glob, this writes a single
 *    `coverage/lcov.info` and the properties file names that one path explicitly.
 *
 * Both were live at once, which is why the first configuration reported 0.0% against a 90%
 * threshold rather than a low-but-real number. A 0 that means "nothing was read" and a 0 that
 * means "nothing is covered" are indistinguishable in the quality gate, which is what made
 * this worth a dedicated script rather than a longer glob.
 *
 * Idempotent: a record already prefixed with its project root is left alone, so running twice
 * does not double the prefix.
 *
 * Usage:
 *   node scripts/lcov-merge.mjs            # writes coverage/lcov.info
 *
 * Exit codes: 0 wrote a merged report, 1 no per-project reports were found.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');
const coverageRoot = resolve(repoRoot, 'coverage');
const OUT = resolve(coverageRoot, 'lcov.info');

/** Every `lcov.info` under `coverage/`, excluding the merged output itself. */
function findReports(dir) {
  /** @type {string[]} */
  const found = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) found.push(...findReports(p));
    else if (e.name === 'lcov.info' && resolve(p) !== OUT) found.push(p);
  }
  return found;
}

const reports = findReports(coverageRoot);

if (reports.length === 0) {
  console.error(
    'lcov-merge: no per-project lcov.info found under `coverage/`.\n' +
      '  Run the tests with coverage first:\n' +
      '    npx nx run-many -t test --coverage\n' +
      '  If they did run, check that the project\'s vite.config.mts lists `lcov` in\n' +
      '  `test.coverage.reporter` — the Vitest defaults do NOT include it, and neither\n' +
      '  `--coverageReporters=lcov` nor `--coverage.reporter=lcov` is passed through by the\n' +
      '  Nx executor.',
  );
  process.exit(1);
}

const merged = [];
let rebased = 0;
let alreadyRooted = 0;

for (const report of reports) {
  // `coverage/libs/shared/ui/lcov.info` -> `libs/shared/ui`
  const projectRoot = relative(coverageRoot, resolve(report, '..'));
  const text = readFileSync(report, 'utf8');

  for (const line of text.split('\n')) {
    if (!line.startsWith('SF:')) {
      merged.push(line);
      continue;
    }
    const file = line.slice(3).trim();
    // Absolute, or already repo-root-relative for this project: leave as is.
    if (file.startsWith('/') || (projectRoot && file.startsWith(`${projectRoot}/`))) {
      alreadyRooted++;
      merged.push(`SF:${file}`);
      continue;
    }
    rebased++;
    merged.push(`SF:${projectRoot ? `${projectRoot}/${file}` : file}`);
  }
}

writeFileSync(OUT, `${merged.join('\n').replace(/\n+$/, '')}\n`);

// Assert the output actually points at files that exist. A merged report full of paths Sonar
// cannot resolve is the exact failure this script exists to prevent, so it is checked here
// rather than inferred from a green scan.
const sfPaths = merged.filter((l) => l.startsWith('SF:')).map((l) => l.slice(3).trim());
const missing = sfPaths.filter((p) => {
  try {
    return !statSync(resolve(repoRoot, p)).isFile();
  } catch {
    return true;
  }
});

console.log(`lcov-merge: merged ${reports.length} report(s) -> ${relative(repoRoot, OUT)}`);
console.log(`  source records: ${sfPaths.length} (${rebased} rebased, ${alreadyRooted} already rooted)`);

if (missing.length > 0) {
  const sample = missing.slice(0, 5).join('\n    ');
  console.error(
    `lcov-merge: FAIL — ${missing.length} of ${sfPaths.length} source path(s) do not exist ` +
      `relative to the repository root. SonarCloud would silently drop these and report 0% ` +
      `coverage.\n    ${sample}`,
  );
  process.exit(1);
}

console.log('  all source paths resolve from the repository root.');
