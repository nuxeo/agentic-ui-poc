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
  console.log('    npm run a11y:scan -- states --headed --grep "column picker"\n');
}

/**
 * Merge the command's own argv with whatever the caller appended.
 *
 * `--project` needs special handling and this was found the hard way: Playwright treats
 * repeated `--project` flags as a UNION, so `journey --project=journey-01-login` ran the
 * wildcard AND the named screen — every screen, when one was asked for. A caller naming a project
 * is narrowing, never widening, so their flag replaces ours rather than joining it.
 */
function mergeArgs(own, extra) {
  const callerPickedProject = extra.some((a) => a === '--project' || a.startsWith('--project='));
  if (!callerPickedProject) return [...own, ...extra];

  const withoutOurProject = own.filter((a) => !a.startsWith('--project'));
  return [...withoutOurProject, ...extra];
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

const result = run(mergeArgs(entry.argv, passthrough));
process.exit(entry.statusMap?.[result.status] ?? result.status);
