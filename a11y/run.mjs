#!/usr/bin/env node
/**
 * The single entry point for everything in this folder.
 *
 * `package.json` at the repository root carries exactly one line for this folder —
 * `"a11y:scan": "node a11y/run.mjs"` — and every suite and diagnostic is a subcommand here
 * rather than a script of its own. That is the whole reason this file exists: the
 * `package.json` part of removing this folder is one line, not hunting seven npm entries.
 * (Removal also edits `docs/accessibility.md`; `README.md` has the full list.)
 *
 * The pre-existing `a11y`, `a11y:all` and `a11y:baseline` scripts are NOT ours. They drive
 * `scripts/a11y-scan.mjs`, the static template scan, which is CI-gated and permanent.
 *
 * Usage:
 *   npm run a11y:scan -- <command>
 */

import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const requireFromHere = createRequire(import.meta.url);
const ROOT = resolve(HERE, '..');
const CONFIG = 'a11y/playwright.config.ts';

/**
 * Every runnable thing in this folder.
 *
 * `preflight` is a boolean rather than always-on: the diagnostics check their own
 * preconditions and print their own guidance, and making them wait on a Nuxeo document query
 * would slow a 20-second answer down for no gain.
 *
 * `needsAdmin` is `true` for a suite that visits `/#/administration` and measures whatever it
 * lands on, and `'full'` for one that asserts the administrator's landing tab itself.
 */
const COMMANDS = {
  surfaces: {
    describe: 'Seven routes in their default loaded state (~27 min)',
    preflight: true,
    // Scans /#/administration, so the identity must be allowed past adminGuard.
    needsAdmin: true,
    argv: ['playwright', 'test', '-c', CONFIG, '--project=surfaces'],
  },
  states: {
    describe: 'Dialogs, CDK overlays, tabs and card view behind a click (~25 min)',
    preflight: true,
    argv: ['playwright', 'test', '-c', CONFIG, '--project=interaction-states'],
  },
  modes: {
    describe: 'Dark theme, forced colors and reduced motion (~20 min)',
    preflight: true,
    needsAdmin: true,
    argv: ['playwright', 'test', '-c', CONFIG, '--project=display-modes'],
  },
  journey: {
    describe: 'Fifteen screens, from sign-in to administration — one report per screen (~70 min)',
    preflight: true,
    // Its last screen asserts the analytics tab /#/administration lands an administrator on,
    // which fullAdministratorGuard closes to powerusers — so a full administrator, not just
    // administration access. Checked per command, not per project, so a run narrowed to one
    // screen needs it too.
    needsAdmin: 'full',
    // A wildcard, so adding a screen to journey.screens.ts needs no change here.
    argv: ['playwright', 'test', '-c', CONFIG, '--project=journey-*'],
  },
  diff: {
    describe: 'Diagnostic: axe under two rule configurations, diffed',
    preflight: false,
    argv: ['node', 'a11y/diagnostics/axe-differential.mjs'],
  },
  reflow: {
    describe: 'Diagnostic: 320px horizontal overflow, measured independently with the nav drawer closed',
    preflight: false,
    argv: ['node', 'a11y/diagnostics/reflow-probe.mjs', '--negative-control'],
  },
  routes: {
    describe: 'Diagnostic: every scanned route renders its feature host, not an error state',
    preflight: false,
    argv: ['node', 'a11y/diagnostics/route-render-check.mjs'],
  },
  drift: {
    describe: 'Diagnostic: the error-state class lists still match the templates',
    preflight: false,
    argv: ['node', 'a11y/diagnostics/error-class-drift.mjs'],
  },
  /**
   * Type-check this folder.
   *
   * A subcommand because **no repository gate can run it**, and that is not an oversight to
   * be fixed here: this TypeScript imports `@playwright/test` and the two a11y-scout
   * packages, all installed `--no-save` and absent in CI, so `tsc` there would fail on
   * missing modules rather than on our types. `spec-typecheck.mjs` also only discovers
   * configs under `apps/` and `libs/`, and Playwright's own runner transpiles specs through
   * esbuild without checking them.
   *
   * So the compile-time guarantees this folder claims — a mistyped screen id or interaction
   * state being a build error — hold only when somebody runs this. Flagged in review on
   * PR #225; documented in README.md rather than quietly left implied.
   */
  typecheck: {
    describe: 'Type-check the specs and fixtures (CI cannot — see README)',
    preflight: false,
    argv: ['tsc', '-p', 'a11y/tsconfig.json', '--noEmit'],
    // Installed `--no-save`. Without them tsc fails on missing modules — a precondition, not a
    // type error — so their absence is checked first and reported as 2.
    requires: ['@playwright/test', 'a11y-scout', '@a11y-scout/playwright'],
    // With those present, tsc's 2 is "type errors found", and 2 here means "could not measure".
    statusMap: { 2: 1 },
  },
  preflight: {
    describe: 'Check the stack and the untracked installs, change nothing',
    preflight: false,
    argv: ['node', 'a11y/preflight.mjs'],
  },
};

/**
 * Commands that do not scan anything, and so do not depend on the error-state lists.
 *
 * Everything else runs the drift check first. It reads eighty files and takes under a second,
 * and the alternative is a diagnostic that only runs when somebody remembers it — which is
 * how the list it guards came to be missing twenty classes in the first place.
 */
const SKIP_DRIFT = new Set(['drift', 'preflight', 'typecheck']);

function usage() {
  const width = Math.max(...Object.keys(COMMANDS).map((k) => k.length));
  console.log('\nRuntime accessibility scanning. See a11y/README.md.\n');
  console.log('  npm run a11y:scan -- <command>\n');
  for (const [name, c] of Object.entries(COMMANDS)) {
    console.log(`    ${name.padEnd(width)}  ${c.describe}`);
  }
  console.log('\n  Extra arguments are passed through, e.g.:');
  console.log('    npm run a11y:scan -- journey --project=journey-01-login --headed');
  console.log('    npm run a11y:scan -- states --headed\n');
  console.log('  surfaces, states and modes emit one consolidated report from a test of their');
  console.log('  own, so a --grep/-g/--grep-invert/-G that excludes it is refused — it would scan');
  console.log('  and report nothing. Pass --no-report to say so, which excludes it for real.');
  console.log('  journey emits one report per screen, so narrowing it with --project is safe.\n');
}

/**
 * Merge the command's own argv with whatever the caller appended.
 *
 * `--project` needs special handling and this was found the hard way: Playwright treats
 * repeated `--project` flags as a UNION, so `journey --project=journey-01-login` ran the
 * wildcard AND the named screen — every screen, when one was asked for. A caller naming a project
 * is narrowing, never widening, so their flag replaces ours rather than joining it.
 *
 * `--no-report` is ours and is dropped here: Playwright would reject it as an unknown option.
 */
function mergeArgs(own, extra) {
  const theirs = extra.filter((a) => a !== NO_REPORT);
  const callerPickedProject = theirs.some((a) => a === '--project' || a.startsWith('--project='));
  if (!callerPickedProject) return [...own, ...theirs];

  const withoutOurProject = own.filter((a) => !a.startsWith('--project'));
  return [...withoutOurProject, ...theirs];
}

/** Every `--project` value in an argv, in both `--project=x` and `--project x` forms. */
function projectsIn(argv) {
  return argv.flatMap((a, i) =>
    a.startsWith('--project=') ? [a.slice('--project='.length)] : a === '--project' ? [argv[i + 1] ?? ''] : [],
  );
}

/**
 * The caller's `--project` values that fall outside this command's own scope.
 *
 * `mergeArgs` REPLACES the command's project with the caller's, on the assumption that a
 * caller is narrowing. Nothing enforced that. `states --project=journey-01-login` ran the login
 * suite under the `states` command, and `journey --project=surfaces` ran the surfaces suite
 * past a preflight that had not checked administration access, because that check is chosen
 * per command. Flagged in review on PR #225.
 *
 * A caller value is in scope when the command's own project pattern (`surfaces`, or a wildcard
 * such as `journey-*`) matches it as text — so `journey --project=journey-01-login` and
 * `journey --project=journey-*` are accepted, and anything else is refused.
 *
 * @param {string[]} own    the command's argv
 * @param {string[]} extra  what the caller appended
 * @returns {string[]}
 */
function projectsOutOfScope(own, extra) {
  const ownPatterns = projectsIn(own);
  if (ownPatterns.length === 0) return [];
  const matchers = ownPatterns.map(
    (p) => new RegExp(`^${p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`),
  );
  return projectsIn(extra).filter((value) => !matchers.some((m) => m.test(value)));
}

/**
 * The title of the test that writes the consolidated report, in the three suites that emit
 * one. `journey` is absent on purpose: each of its screens emits its own report inside its own
 * test, so narrowing that suite still produces the report for what ran.
 */
const REPORT_TEST_TITLE = 'emits the consolidated report';
const CONSOLIDATED_REPORT_SUITES = new Set(['surfaces', 'states', 'modes']);
/** Ours, not Playwright's — `mergeArgs` removes it, so it must never reach the runner. */
const NO_REPORT = '--no-report';

/** Playwright's include and exclude grep flags, long form and short alias alike. */
const GREP_INCLUDE_FLAGS = ['--grep', '-g'];
const GREP_EXCLUDE_FLAGS = ['--grep-invert', '-G'];

/**
 * A grep pattern written as a regex literal, `/body/flags`.
 *
 * Only `g` and `i`, because that is the character class `forceRegExp` uses — `/foo/m` is not
 * the literal form to Playwright, it is the pattern `/foo/m` compiled as text.
 */
const SLASH_FORM = /^\/(.*)\/([gi]*)$/;

/**
 * Pull the value Playwright would act on for any of `flags` out of `extra`, returning what is
 * left alongside what was found.
 *
 * One parser shared by `grepWouldDropTheReport` (which only reads `value`) and
 * `suppressReportTest` (which needs `rest` too, to rebuild the arg list around its own
 * `--grep-invert`). Two copies of this parsing drifted apart once already — flagged in
 * review on PR #225 as "duplicated almost verbatim" — so there is one now.
 *
 * Every form Playwright's commander accepts, confirmed against `playwright test --list`
 * rather than assumed, because the first version of this guard missed two of them:
 *
 * - `--grep value` and `-g value`
 * - `--grep=value` — long flags only
 * - `-gvalue` — the attached short form. Commander takes everything after the two characters
 *   verbatim, so `-g=value` is the pattern `=value`, matching nothing. Reproduced: `-g=column
 *   picker` lists 0 tests, where `-gcolumn picker` lists 1.
 *
 * `value` is the LAST occurrence, not all of them. Repeated greps override rather than
 * combine: `-G "column picker" -G "<report title>"` drops the report test and `-G "<report
 * title>" -G "column picker"` keeps it, so only the final one is live. The comment here used
 * to say Playwright intersected them, and the guard refused runs Playwright would have run.
 *
 * An absent (`--grep-invert` last, with nothing after it) or empty (`--grep-invert=`) value is
 * no value: Playwright skips a falsy pattern entirely rather than treating it as the
 * everything-matching empty regex — `--grep-invert ""` lists all 8 tests, not 0.
 *
 * @param {string[]} extra
 * @param {string[]} flags  one long form and its short alias, e.g. `['--grep', '-g']`
 * @returns {{ rest: string[], value: string | undefined }}
 */
function stripFlagOccurrences(extra, flags) {
  const rest = [];
  const values = [];
  for (let i = 0; i < extra.length; i++) {
    const arg = extra[i];
    if (flags.includes(arg)) {
      const value = extra[i + 1];
      if (value !== undefined) values.push(value);
      i++;
      continue;
    }
    const longFlag = flags.find((f) => f.startsWith('--') && arg.startsWith(`${f}=`));
    if (longFlag) {
      values.push(arg.slice(longFlag.length + 1));
      continue;
    }
    const shortFlag = flags.find((f) => !f.startsWith('--') && arg.startsWith(f) && arg !== f);
    if (shortFlag) {
      values.push(arg.slice(shortFlag.length));
      continue;
    }
    rest.push(arg);
  }
  const live = values.filter((v) => v !== '');
  return { rest, value: live.at(-1) };
}

/** The value Playwright would act on for any of `flags`, or `undefined` if there is none. */
function liveFlagValue(extra, flags) {
  return stripFlagOccurrences(extra, flags).value;
}

/**
 * Refuse a `--grep`/`-g`/`--grep-invert`/`-G` that would filter out the report test.
 *
 * `--grep` applies to every test title, including the one that calls `generateReport()`. So
 * `states --grep "column picker"` scanned one state, passed, and wrote **no report** — the
 * suite's actual deliverable — while reading like a successful run. This was a documented
 * example in `usage()`. Flagged in review on PR #225.
 *
 * Widening the pattern to include the report test is not the fix either: that test asserts
 * every declared state recorded a scan, so it would fail a deliberately narrowed run.
 *
 * Refused rather than warned, and exit 1 rather than 2: it is a usage error, and a warning
 * printed before a 25-minute scan is a warning nobody is still watching for. Watching one
 * state is still a real need, so `--no-report` is the way to say so out loud — the flag itself
 * never reaches Playwright, but `suppressReportTest` turns it into an exclusion that does.
 * `--grep` with the `journey` command is untouched and remains the way to scan one screen and
 * still get a report.
 *
 * @param {string} name   the command
 * @param {string[]} extra  what the caller appended
 * @returns {boolean}
 */
function grepWouldDropTheReport(name, extra) {
  if (!CONSOLIDATED_REPORT_SUITES.has(name)) return false;
  if (extra.includes(NO_REPORT)) return false;
  const include = liveFlagValue(extra, GREP_INCLUDE_FLAGS);
  const exclude = liveFlagValue(extra, GREP_EXCLUDE_FLAGS);
  // A `--grep`/`-g` that does not keep the report test drops it; the two flags are applied
  // together, so an exclude that matches it removes it even when the include kept it.
  if (include !== undefined && !playwrightMatches(include, REPORT_TEST_TITLE)) return true;
  return exclude !== undefined && playwrightMatches(exclude, REPORT_TEST_TITLE);
}

/**
 * Actually exclude the report test when the caller asked for `--no-report`, instead of only
 * warning about it. Before this, `--no-report` told `mergeArgs` to strip itself and nothing
 * else, so `states --no-report` still ran and wrote the report it claimed to skip.
 *
 * Playwright applies `--grep` and `--grep-invert` together — a test must match the include
 * pattern AND not match the exclude one — so adding our own exclusion is additive, not a
 * replacement: a caller's own `--grep-invert`/`-G` is unioned with the report test's title
 * rather than discarded. Flagged in review on PR #225.
 *
 * `journey` is exempt: it is not in `CONSOLIDATED_REPORT_SUITES`, so this returns `extra`
 * unchanged for it, since each of its screens emits its own report.
 *
 * @param {string} name   the command
 * @param {string[]} extra  what the caller appended
 * @returns {string[]}
 */
function suppressReportTest(name, extra) {
  if (!CONSOLIDATED_REPORT_SUITES.has(name)) return extra;
  if (!extra.includes(NO_REPORT)) return extra;
  const { rest, value: theirs } = stripFlagOccurrences(extra, GREP_EXCLUDE_FLAGS);
  return [...rest, '--grep-invert', alsoExcluding(theirs, REPORT_TEST_TITLE)];
}

/**
 * One `--grep-invert` pattern that excludes `title` as well as whatever the caller excluded.
 *
 * It has to be one, because a repeated `--grep-invert` overrides rather than unions — so
 * appending ours would have silently discarded theirs.
 *
 * A plain `|` join is enough to keep both sides intact — alternation binds loosest, so an
 * exclude of `^a` stays anchored to its own branch and does not anchor ours.
 *
 * The slash form is rebuilt AS a slash form, carrying the caller's own flags, rather than
 * flattened into the default case-insensitive compile: flattening `/Column Picker/` would
 * have widened their exclusion to titles they never asked to drop. Keeping their flags
 * leaves our branch case-SENSITIVE too, which is exact here and only here — `title` is a
 * literal copied from the `test()` call, not a pattern.
 */
function alsoExcluding(theirs, title) {
  if (theirs === undefined) return title;
  const literal = theirs.match(SLASH_FORM);
  return literal ? `/${literal[1]}|${title}/${literal[2]}` : `${theirs}|${title}`;
}

/**
 * Does `pattern` match `title` the way Playwright would?
 *
 * A copy of `forceRegExp` in `playwright/lib/util.js`, which is how a `--grep` string becomes
 * a RegExp: a pattern written as `/body/flags` is taken literally, flags and all, and
 * anything else is compiled case-INsensitively. Approximating it with a flat
 * `new RegExp(pattern, 'i')` got both halves of the slash form wrong, in both directions —
 * `--grep-invert "/<report title>/"` really does drop the report test and was let through,
 * and `--grep "/consolidated/i"` really does keep it and was refused. Both reproduced
 * against `playwright test --list` before this was changed.
 *
 * An unparseable pattern is Playwright's error to report, not ours, so it is treated as
 * matching: this guard exists to refuse a silently reportless run, not to validate regexes.
 */
function playwrightMatches(pattern, title) {
  const literal = pattern.match(SLASH_FORM);
  try {
    // A fresh RegExp each call, so the `g` Playwright adds carries no `lastIndex` between them.
    return literal ? new RegExp(literal[1], literal[2]).test(title) : new RegExp(pattern, 'gi').test(title);
  } catch {
    return true;
  }
}

const [command, ...passthrough] = process.argv.slice(2);

if (!command || command === '--help' || command === '-h') {
  usage();
  process.exit(command ? 0 : 1);
}

// Own properties only: `COMMANDS` is a plain object, so `constructor` or `toString` would
// otherwise resolve to an inherited function and crash below instead of reading as unknown.
// Flagged in review on PR #225.
const entry = Object.hasOwn(COMMANDS, command) ? COMMANDS[command] : undefined;
if (!entry) {
  console.error(`\nUnknown command: ${command}`);
  usage();
  process.exit(1);
}

// Before the drift check and preflight, so a mistaken invocation is refused in a second
// rather than after a Nuxeo query. Exit 1: this is a usage error, not an environment one.
const outOfScope = projectsOutOfScope(entry.argv, passthrough);
if (outOfScope.length > 0) {
  console.error(
    `\n--project ${outOfScope.map((p) => `"${p}"`).join(', ')} is outside the "${command}" command, ` +
      `which runs ${projectsIn(entry.argv).join(', ')}.\n` +
      'Each command has its own preflight, so running another suite under it would skip the\n' +
      'checks chosen for that suite. Use that suite\'s own command instead.\n',
  );
  process.exit(1);
}

if (grepWouldDropTheReport(command, passthrough)) {
  console.error(
    `\n--grep would filter out "${REPORT_TEST_TITLE}", so "${command}" would scan and then\n` +
      "write no report — and the report is this suite's deliverable, not a by-product.\n\n" +
      `Run "${command}" whole, or add ${NO_REPORT} to say you are watching one state and do not\n` +
      'want one. To scan a single screen and still get a report, use the journey command,\n' +
      'whose screens each emit their own.\n',
  );
  process.exit(1);
}

if (passthrough.includes(NO_REPORT)) {
  if (CONSOLIDATED_REPORT_SUITES.has(command)) {
    console.warn(
      `\n${NO_REPORT}: this run writes no consolidated report. It is a look, not a measurement.\n`,
    );
  } else {
    // journey emits one report per screen rather than a consolidated one, so there is
    // nothing here for --no-report to suppress. Flagged in review on PR #225.
    console.warn(
      `\n${NO_REPORT}: "${command}" has no consolidated report to suppress — each of its\n` +
        'screens still writes its own.\n',
    );
  }
}

/** The package whose `bin` provides each non-`node` command above. */
const BIN_PACKAGE = { playwright: '@playwright/test', tsc: 'typescript' };

/**
 * The JavaScript file behind a package's bin, run with this Node rather than through `npx`.
 *
 * `npx` on Windows is `npx.cmd`, which Node will only spawn through a shell, and `cmd` then
 * re-parses the caller's arguments: `--grep "a b"` arrived as two arguments and found no tests,
 * and `--grep=a|b` ran `b` as a command. No shell, no re-parsing.
 *
 * @param {string} name
 * @returns {string}
 */
function binEntry(name) {
  const pkg = BIN_PACKAGE[/** @type {keyof typeof BIN_PACKAGE} */ (name)];
  if (!pkg) throw new Error(`run.mjs: no package is declared for the "${name}" command`);
  const manifestPath = requireFromHere.resolve(`${pkg}/package.json`);
  const { bin } = requireFromHere(manifestPath);
  const rel = typeof bin === 'string' ? bin : bin?.[name];
  if (!rel) throw new Error(`run.mjs: ${pkg} declares no "${name}" bin`);
  return resolve(dirname(manifestPath), rel);
}

// Run from the repository root so the relative paths above resolve and, more importantly, so
// a11y-scout's report `outDir` lands where this folder's .gitignore covers it.
const run = (argv) => {
  let script;
  try {
    script = argv[0] === 'node' ? argv[1] : binEntry(argv[0]);
  } catch (err) {
    console.error(
      `\n${err instanceof Error ? err.message : String(err)}\n` +
        (argv[0] === 'playwright'
          ? 'It is installed --no-save; `node a11y/run.mjs preflight` prints the install command.\n'
          : ''),
    );
    process.exit(2);
  }
  const result = spawnSync(process.execPath, [script, ...argv.slice(argv[0] === 'node' ? 2 : 1)], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  // A process that never started, or was killed, measured nothing: 2, never the 1 of a finding.
  if (result.error || result.status === null) {
    console.error(
      `\nrun.mjs: ${script} ${result.error ? `could not be started: ${result.error.message}` : `was killed by ${result.signal}`}\n`,
    );
    process.exit(2);
  }
  return result;
};

const missing = (entry.requires ?? []).filter((pkg) => {
  try {
    import.meta.resolve(pkg);
    return false;
  } catch {
    return true;
  }
});
if (missing.length > 0) {
  console.error(
    `\n"${command}" needs ${missing.join(', ')}, which ${missing.length === 1 ? 'is' : 'are'} not installed.\n` +
      'They are installed --no-save; `node a11y/run.mjs preflight` prints the install command.\n',
  );
  process.exit(2);
}

if (!SKIP_DRIFT.has(command)) {
  const drift = run(['node', 'a11y/diagnostics/error-class-drift.mjs']);
  if (drift.status !== 0) {
    console.error(
      '\nRefusing to scan: a surface showing an unclassified error state would be measured\n' +
        'as if it had loaded. Fix a11y/surface.mjs first.\n',
    );
    process.exit(drift.status);
  }
}

if (entry.preflight) {
  const adminFlag =
    entry.needsAdmin === 'full' ? ['--needs-full-admin'] : entry.needsAdmin ? ['--needs-admin'] : [];
  const pre = run(['node', 'a11y/preflight.mjs', ...adminFlag]);
  // 2 is "precondition not met" — propagate it rather than flattening to 1, so a caller can
  // tell a broken environment from a failing scan.
  if (pre.status !== 0) process.exit(pre.status);
}

const result = run(mergeArgs(entry.argv, suppressReportTest(command, passthrough)));
process.exit(entry.statusMap?.[result.status] ?? result.status);
