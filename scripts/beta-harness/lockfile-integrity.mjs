#!/usr/bin/env node
/**
 * Lockfile integrity gate.
 *
 * ## Why this exists
 *
 * Phase 2's local gates were green for its entire duration while CI was red. A
 * bare `npm install` on macOS pruned optional platform entries the Linux runner
 * needs — `@oxc-resolver/binding-wasm32-wasi`'s nested `@emnapi/core` and
 * `@emnapi/runtime` — and `npm ci` on Linux then refused the whole tree. None of
 * `guardrails`, `lint`, `test` or `build` reads `package-lock.json`, so nothing
 * local could see it.
 *
 * ## Why not just `npm ci --dry-run`
 *
 * Because it would not have caught this. `npm ci` only demands the entries the
 * *current* platform resolves, so on macOS the pruned Linux-only subtree is
 * never looked at and the dry run passes. The gate has to be
 * platform-independent to be worth having, so it checks the invariant directly
 * rather than asking npm to check it for the wrong platform.
 *
 * ## The invariant
 *
 * For every package entry in the lock, each of its non-optional `dependencies`
 * must be resolvable within the lock by Node's own lookup — walk up the
 * `node_modules` chain from the dependent's own path to the root. That is
 * exactly what `npm ci` verifies before it installs, and exactly what the
 * pruning broke.
 *
 * `optionalDependencies` are deliberately not required: npm legitimately omits
 * an optional package that no platform in the tree needs, and demanding them
 * would make this gate cry wolf on every lockfile.
 *
 * Usage:
 *   node scripts/beta-harness/lockfile-integrity.mjs [--lock <path>]
 *
 * Exit code is 1 if any dependency is unresolvable.
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const lockIndex = args.indexOf('--lock');
const lockPath = resolve(lockIndex >= 0 ? args[lockIndex + 1] : 'package-lock.json');

/** @type {{ lockfileVersion?: number, packages?: Record<string, any> }} */
let lock;
try {
  lock = JSON.parse(await readFile(lockPath, 'utf8'));
} catch (error) {
  console.error(`lockfile-integrity: cannot read ${lockPath}\n  ${error.message}`);
  process.exit(1);
}

if (!lock.packages) {
  console.error(
    `lockfile-integrity: ${lockPath} has no "packages" map — lockfileVersion ${lock.lockfileVersion ?? '?'} is too old to verify.`,
  );
  process.exit(1);
}

const entries = lock.packages;
const problems = [];
let checked = 0;

for (const [path, entry] of Object.entries(entries)) {
  // A `link` entry is a workspace symlink; its real content lives at `resolved`.
  if (entry.link) continue;
  for (const name of Object.keys(entry.dependencies ?? {})) {
    checked += 1;
    if (!resolveFrom(path, name)) {
      problems.push({ dependent: path || '<root>', missing: name });
    }
  }
}

/**
 * Node's resolution, applied to lock paths: try the dependent's own
 * `node_modules`, then each ancestor's, then the root.
 *
 * @param {string} dependentPath
 * @param {string} name
 */
function resolveFrom(dependentPath, name) {
  let scope = dependentPath;
  for (;;) {
    const candidate = scope === '' ? `node_modules/${name}` : `${scope}/node_modules/${name}`;
    if (entries[candidate]) return true;
    if (scope === '') return false;
    scope = enclosingPackagePath(scope);
  }
}

/**
 * The package directory that contains `path`'s own `node_modules`.
 *
 * `node_modules/a/node_modules/b` is enclosed by `node_modules/a`; a top-level
 * package, scoped or not, is enclosed by the root. Anything outside a
 * `node_modules` tree is a workspace, which also resolves from the root.
 *
 * @param {string} path
 */
function enclosingPackagePath(path) {
  const segments = path.split('/');
  const last = segments.lastIndexOf('node_modules');
  return last <= 0 ? '' : segments.slice(0, last).join('/');
}

if (problems.length === 0) {
  console.log(
    `lockfile-integrity: pass — ${checked} dependency edge(s) across ${Object.keys(entries).length} lock entries all resolve.`,
  );
  process.exit(0);
}

console.error(`lockfile-integrity: FAIL — ${problems.length} unresolvable dependency edge(s).`);
console.error(
  'The lockfile is missing entries that `npm ci` requires. This is what a bare\n' +
    '`npm install` on macOS does to optional platform subtrees. Do not "fix" it with\n' +
    'another bare install — restore a known-good lock and merge the new entries in.\n',
);
for (const { dependent, missing } of problems.slice(0, 25)) {
  console.error(`  ${dependent}\n    requires ${missing}, which is absent from the lock`);
}
if (problems.length > 25) console.error(`  ... and ${problems.length - 25} more`);
process.exit(1);
