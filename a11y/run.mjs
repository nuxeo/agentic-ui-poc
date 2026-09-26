#!/usr/bin/env node
/**
 * The single entry point for everything in this folder.
 *
 * `package.json` at the repository root carries exactly one line for accessibility —
 * `"a11y:scan": "node a11y/run.mjs"` — and every suite and diagnostic is a subcommand here
 * rather than a script of its own. That is the whole reason this file exists: removing this
 * folder should be `rm -rf a11y/` plus deleting one line, not hunting seven npm entries.
 *
 * The pre-existing `a11y`, `a11y:all` and `a11y:baseline` scripts are NOT ours. They drive
 * `scripts/a11y-scan.mjs`, the static template scan, which is CI-gated and permanent.
 *
 * Usage:
 *   npm run a11y:scan -- <command>
 */

import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const CONFIG = 'a11y/playwright.config.ts';

/**
 * Every runnable thing in this folder.
 *
 * `preflight` is a boolean rather than always-on: the diagnostics check their own
 * preconditions and print their own guidance, and making them wait on a Nuxeo document query
 * would slow a 20-second answer down for no gain.
 */
const COMMANDS = {
  surfaces: {
    describe: 'Seven routes in their default loaded state (~27 min)',
    preflight: true,
    argv: ['playwright', 'test', '-c', CONFIG, '--project=surfaces'],
  },
  states: {
    describe: 'Dialogs, CDK overlays, tabs and card view behind a click (~20 min)',
    preflight: true,
    argv: ['playwright', 'test', '-c', CONFIG, '--project=interaction-states'],
  },
  modes: {
    describe: 'Dark theme, forced colors and reduced motion (~20 min)',
    preflight: true,
    argv: ['playwright', 'test', '-c', CONFIG, '--project=display-modes'],
  },
  journey: {
    describe: 'Login, dashboard, browse, document detail — one report per screen (~15 min)',
    preflight: true,
    // A wildcard, so adding a screen to journey.screens.ts needs no change here.
    argv: ['playwright', 'test', '-c', CONFIG, '--project=journey-*'],
  },
  diff: {
    describe: 'Diagnostic: axe under two rule configurations, diffed',
    preflight: false,
    argv: ['node', 'a11y/diagnostics/axe-differential.mjs'],
  },
  reflow: {
    describe: 'Diagnostic: 320px horizontal overflow, measured independently',
    preflight: false,
    argv: ['node', 'a11y/diagnostics/reflow-probe.mjs', '--negative-control'],
  },
  routes: {
    describe: 'Diagnostic: every scanned route actually renders its feature host',
    preflight: false,
    argv: ['node', 'a11y/diagnostics/route-render-check.mjs'],
  },
  preflight: {
    describe: 'Check the stack and the untracked installs, change nothing',
    preflight: false,
    argv: ['node', 'a11y/preflight.mjs'],
  },
};

function usage() {
  const width = Math.max(...Object.keys(COMMANDS).map((k) => k.length));
  console.log('\nRuntime accessibility scanning. See a11y/README.md.\n');
  console.log('  npm run a11y:scan -- <command>\n');
  for (const [name, c] of Object.entries(COMMANDS)) {
    console.log(`    ${name.padEnd(width)}  ${c.describe}`);
  }
  console.log('\n  Extra arguments are passed through, e.g.:');
  console.log('    npm run a11y:scan -- journey --project=journey-1-login --headed');
  console.log('    npm run a11y:scan -- states --headed --grep "column picker"\n');
}

/**
 * Merge the command's own argv with whatever the caller appended.
 *
 * `--project` needs special handling and this was found the hard way: Playwright treats
 * repeated `--project` flags as a UNION, so `journey --project=journey-1-login` ran the
 * wildcard AND the named screen — all four, when one was asked for. A caller naming a project
 * is narrowing, never widening, so their flag replaces ours rather than joining it.
 */
function mergeArgs(own, extra) {
  const callerPickedProject = extra.some((a) => a === '--project' || a.startsWith('--project='));
  if (!callerPickedProject) return [...own, ...extra];

  const withoutOurProject = own.filter((a) => !a.startsWith('--project'));
  return [...withoutOurProject, ...extra];
}

const [command, ...passthrough] = process.argv.slice(2);

if (!command || command === '--help' || command === '-h') {
  usage();
  process.exit(command ? 0 : 1);
}

const entry = COMMANDS[command];
if (!entry) {
  console.error(`\nUnknown command: ${command}`);
  usage();
  process.exit(1);
}

// Run from the repository root so the relative paths above resolve and, more importantly, so
// a11y-scout's report `outDir` lands where this folder's .gitignore covers it.
const run = (argv) =>
  spawnSync(argv[0] === 'node' ? process.execPath : 'npx', argv[0] === 'node' ? argv.slice(1) : argv, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

if (entry.preflight) {
  const pre = run(['node', 'a11y/preflight.mjs']);
  // 2 is "precondition not met" — propagate it rather than flattening to 1, so a caller can
  // tell a broken environment from a failing scan.
  if (pre.status !== 0) process.exit(pre.status ?? 2);
}

const result = run(mergeArgs(entry.argv, passthrough));
process.exit(result.status ?? 1);
