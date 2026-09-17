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
 * `node_modules` chain from the dependent's own path to the root — **and the
 * entry found must actually satisfy the declared version**.
 *
 * The version half is not decoration; it is the whole failure. Name resolution
 * alone passes on the very lock that broke CI: pruning
 * `binding-wasm32-wasi/node_modules/@emnapi/core@1.11.2` leaves the top-level
 * `@emnapi/core@1.11.3` to satisfy the walk by name, while the dependent pins
 * `1.11.2` exactly and `npm ci` refuses with "Missing: @emnapi/core@1.11.2".
 *
 * Version checking is deliberately conservative, because a gate that cries wolf
 * gets switched off: exact pins are compared directly, ranges are checked only
 * when `semver` is resolvable, and anything that is not a plain version or range
 * — `npm:` aliases, `file:`, `git+`, `workspace:`, URLs, dist-tags — is left to
 * the name check alone.
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
import { dirname, resolve } from 'node:path';

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

/**
 * Packages force-resolved by `overrides`.
 *
 * Read from the `package.json` beside the lock, because npm does not record `overrides` in
 * the lockfile — the root `packages[""]` entry omits it, so reading from there silently
 * yielded an empty set and every override still reported as a defect.
 */
const manifestPath = resolve(dirname(lockPath), 'package.json');
let overriddenNames = new Set();
try {
  overriddenNames = collectOverriddenNames(
    JSON.parse(await readFile(manifestPath, 'utf8')).overrides ?? {},
  );
} catch {
  // No manifest beside the lock (a bare fixture): treat nothing as overridden, which is
  // the strict reading rather than the permissive one.
}

/** `semver` ships with npm's own tree; use it when present, never require it. */
let semver = null;
try {
  semver = (await import('semver')).default ?? (await import('semver'));
} catch {
  /* range checking degrades to exact-pin comparison */
}

for (const [path, entry] of Object.entries(entries)) {
  // A `link` entry is a workspace symlink; its real content lives at `resolved`.
  if (entry.link) continue;
  // `devDependencies` as well as `dependencies`, and the omission mattered: the root
  // entry declares 52 dev edges that this gate never resolved. `npm ci` refuses a tree
  // with a pruned devDependency exactly as it refuses a pruned production one, and
  // "npm ci will not refuse this tree on Linux" is the only claim this gate makes. All 52
  // resolve today, so this closes a hole rather than fixing a live break — but the hole
  // is the same shape as the one that kept CI red for the whole of Phase 2.
  //
  // Still excluded, both deliberately:
  //   - `optionalDependencies` — npm legitimately omits an optional package no platform
  //     in the tree needs; demanding them would fail on a correct lock.
  //   - `peerDependencies` — npm permits an unmet peer. Requiring them would report
  //     hundreds of false problems on a tree `npm ci` installs without complaint.
  for (const kind of ['dependencies', 'devDependencies']) {
    for (const [name, spec] of Object.entries(entry[kind] ?? {})) {
      checked += 1;
      const found = resolveFrom(path, name);
      if (!found) {
        problems.push({
          dependent: path || '<root>',
          missing: name,
          spec,
          reason: `absent from the lock (declared in ${kind})`,
        });
        continue;
      }
      const actual = entries[found].version;
      if (actual && !satisfiesSpec(actual, spec) && !isOverridden(name)) {
        problems.push({
          dependent: path || '<root>',
          missing: name,
          spec,
          reason: `resolves to ${found} at ${actual}, which does not satisfy "${spec}" (${kind})`,
        });
      }
    }
  }
}

/**
 * Is this package force-resolved by an `overrides` entry in `package.json`?
 *
 * An override exists precisely to install a version some dependency did not ask for —
 * `main`'s block pins 21 transitive packages to patched releases for CVEs — so the
 * resulting range violation is the override working, not a broken lock. Reporting it as
 * "unresolvable" made 24 deliberate security pins look like corruption, which is how a
 * gate teaches people that its output is noise.
 *
 * Nested override forms (`{ "@angular/build": { "vite": "6.4.3" } }`) are flattened, since
 * the effect on the resolved version is the same.
 *
 * @param {string} name
 */
function isOverridden(name) {
  return overriddenNames.has(name);
}

/** @returns {Set<string>} every package named anywhere in `overrides`, at any nesting */
function collectOverriddenNames(overrides) {
  const names = new Set();
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    for (const [key, value] of Object.entries(node)) {
      // A key is a package name unless it is the `.` self-reference npm allows.
      if (key !== '.') names.add(key);
      if (value && typeof value === 'object') walk(value);
    }
  };
  walk(overrides);
  return names;
}

/**
 * True unless the version demonstrably fails the spec. Unknown spec forms return
 * true so the gate never fails on something it does not understand.
 *
 * @param {string} version
 * @param {string} spec
 */
function satisfiesSpec(version, spec) {
  if (typeof spec !== 'string' || spec === '' || spec === '*' || spec === 'latest') return true;
  // Aliases, filesystem, git, workspace protocols and URLs are out of scope.
  if (/^(npm:|file:|link:|git|https?:|workspace:)/.test(spec)) return true;
  if (semver) {
    if (!semver.validRange(spec)) return true;
    return semver.satisfies(version, spec, { includePrerelease: true });
  }
  // Without semver, only an exact pin can be judged safely.
  return /^\d+\.\d+\.\d+/.test(spec) ? version === spec : true;
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
    if (entries[candidate]) return candidate;
    if (scope === '') return null;
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
for (const { dependent, missing, spec, reason } of problems.slice(0, 25)) {
  console.error(`  ${dependent}\n    requires ${missing}@${spec} — ${reason}`);
}
if (problems.length > 25) console.error(`  ... and ${problems.length - 25} more`);
process.exit(1);
