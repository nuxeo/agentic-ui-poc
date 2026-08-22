#!/usr/bin/env node
/**
 * Public API surface gate for `@nuxeo-satori/platform`.
 *
 * ## Why this exists
 *
 * Phase 4's promise to customers is that an upgrade is a version bump, not a
 * merge. That is only true if the published surface cannot change by accident.
 * Nothing else in this repo can see such a change: `lint`, `test`, `build` and
 * `typecheck` are all perfectly happy when a library gains, loses or reshapes an
 * export, because every in-repo caller is updated in the same commit. The break
 * lands on the customer, one release later.
 *
 * So this reads the **built** `.d.ts` files — the bytes a customer actually
 * installs, not the source — and compares the surface against a checked-in
 * snapshot at `docs/api/platform.api.md`.
 *
 * ## Why not @microsoft/api-extractor
 *
 * Three reasons, in order of weight. It is another dependency on a lockfile that
 * has already cost this programme a phase. It wants a single rolled-up entry
 * point, and this package deliberately ships five. And it is markedly harder to
 * break on purpose, which is the bar every gate here has to clear —
 * `AGENTS/11-beta-program.md` is explicit that a gate nobody has watched go red
 * is not evidence. A small script over the emitted declarations is auditable in
 * one sitting.
 *
 * ## What it deliberately does not check
 *
 * It records exported **names, kinds and type signatures** per entry point. It
 * does not parse Angular decorator metadata, so a change to a component's
 * selector or input alias is invisible to it, and it does not diff JSDoc. It is a
 * shape gate, not a semantic-compatibility oracle. That limit is stated here so
 * that a green run is not read as "this release is backwards compatible".
 *
 * Usage:
 *   node scripts/beta-harness/api-surface.mjs            # check, non-zero on drift
 *   node scripts/beta-harness/api-surface.mjs --update   # rewrite the snapshot
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');
const DIST = join(ROOT, 'dist', 'libs', 'platform');
const SNAPSHOT = join(ROOT, 'docs', 'api', 'platform.api.md');
const update = process.argv.includes('--update');

function fail(message) {
  console.error(`\napi-surface: FAIL\n\n${message}\n`);
  process.exit(1);
}

if (!existsSync(DIST)) {
  fail(
    `${DIST} does not exist, so there is no built surface to inspect.\n` +
      'Run `npx nx build platform` first. This gate reads the artifact a customer\n' +
      'installs, deliberately, rather than the source it was built from.',
  );
}

const pkgPath = join(DIST, 'package.json');
if (!existsSync(pkgPath)) fail(`${pkgPath} is missing; the build did not complete.`);
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

/**
 * Entry point subpath -> its `types` file, taken from the generated `exports` map.
 *
 * Read from `exports` rather than by globbing for `index.d.ts`, because the
 * exports map is what actually decides whether a customer can reach an entry
 * point. A declaration file nothing exports is not part of the surface, and an
 * exports entry pointing at a missing file is a broken package — which is exactly
 * how `ng-packagr-lite` shipped four unresolvable subpaths.
 */
function entryPoints() {
  const found = [];
  for (const [subpath, conditions] of Object.entries(pkg.exports ?? {})) {
    if (subpath === './package.json') continue;
    const types = typeof conditions === 'object' ? conditions.types : undefined;
    if (!types) continue;
    const file = join(DIST, types);
    if (!existsSync(file)) {
      fail(
        `The exports map advertises "${subpath}" with types "${types}", but that file does\n` +
          'not exist. A customer importing that subpath gets an unresolvable module.',
      );
    }
    found.push({ subpath, types, file });
  }
  return found.sort((a, b) => a.subpath.localeCompare(b.subpath));
}

/** Follow `export * from './x'` so re-exported declarations are not invisible. */
function collectDeclarationFiles(entryFile, seen = new Set()) {
  if (seen.has(entryFile) || !existsSync(entryFile)) return seen;
  seen.add(entryFile);
  const text = readFileSync(entryFile, 'utf8');
  for (const match of text.matchAll(/export\s+(?:\*|\{[^}]*\})\s*(?:as\s+\w+\s*)?from\s*['"](\.[^'"]+)['"]/g)) {
    const target = resolve(join(entryFile, '..'), match[1]);
    for (const candidate of [`${target}.d.ts`, join(target, 'index.d.ts')]) {
      if (existsSync(candidate)) {
        collectDeclarationFiles(candidate, seen);
        break;
      }
    }
  }
  return seen;
}

/**
 * Exported symbols from a set of declaration files, as `kind name signature`.
 *
 * Regex over `.d.ts` rather than the TypeScript compiler API. Emitted
 * declarations are a far narrower language than source — no expressions, no
 * inference, one declaration per `export` — and the alternative is asking the gate
 * to depend on the compiler's own resolution, which is the thing being audited.
 */
function surfaceOf(files) {
  const symbols = new Map();
  const unrecognised = [];

  for (const file of [...files].sort()) {
    const text = readFileSync(file, 'utf8');

    for (const m of text.matchAll(
      /^export\s+declare\s+(abstract class|class|interface|function|const|let|var|enum|type|namespace)\s+([A-Za-z_$][\w$]*)(.*)$/gm,
    )) {
      const [, kind, name, rest] = m;
      symbols.set(name, `${kind} ${name}${normalise(rest)}`);
    }
    for (const m of text.matchAll(/^export\s+(type|interface)\s+([A-Za-z_$][\w$]*)(.*)$/gm)) {
      const [, kind, name, rest] = m;
      symbols.set(name, `${kind} ${name}${normalise(rest)}`);
    }
    // `export { A, B as C }` and `export type { T }`. The `type` modifier sits
    // between `export` and the brace, which an earlier cut of this regex did not
    // allow — so `export type { PlatformEntryPoint };` was **silently omitted**
    // from the snapshot, and its removal would not have been caught. A gate that
    // quietly under-reports the surface is worse than no gate.
    for (const m of text.matchAll(/^export\s+(?:type\s+)?\{([^}]*)\}\s*;?\s*$/gm)) {
      for (const clause of m[1].split(',')) {
        const parts = clause
          .trim()
          .replace(/^type\s+/, '')
          .split(/\s+as\s+/);
        const name = (parts[1] ?? parts[0])?.trim();
        if (name && !symbols.has(name)) symbols.set(name, `reexport ${name}`);
      }
    }

    // Self-audit. Any `export` statement this function did not classify is
    // recorded and fails the run, so a declaration form nobody anticipated
    // surfaces as a loud gap rather than a missing line in the snapshot.
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      // `export` as a *word*, not a prefix. Without the boundary, class methods
      // named `exportZip` and `exportXml` were reported as unrecognised exports.
      if (!/^export\b/.test(trimmed)) continue;
      if (/^export\s+(\*|(?:type\s+)?\{)/.test(trimmed)) continue;
      if (
        /^export\s+declare\s+(abstract class|class|interface|function|const|let|var|enum|type|namespace)\s/.test(
          trimmed,
        )
      )
        continue;
      if (/^export\s+(type|interface)\s/.test(trimmed)) continue;
      if (/^export\s+default\s/.test(trimmed)) continue;
      unrecognised.push(`${file.replace(`${ROOT}/`, '')}: ${trimmed}`);
    }
  }

  if (unrecognised.length) {
    fail(
      'This gate did not recognise the following `export` statement(s) in the built\n' +
        'declarations, so it cannot claim to have captured the whole surface. Teach\n' +
        '`surfaceOf()` about them before trusting a green run.\n\n' +
        unrecognised
          .slice(0, 20)
          .map((u) => `  ${u}`)
          .join('\n'),
    );
  }

  return [...symbols.values()].sort();
}

/** Collapse whitespace so reformatting is not reported as an API change. */
function normalise(fragment) {
  return fragment.replace(/\s+/g, ' ').replace(/\s*\{\s*$/, '').trimEnd();
}

const entries = entryPoints();
if (entries.length === 0) fail('The exports map advertises no typed entry points.');

const lines = [
  '<!-- GENERATED by scripts/beta-harness/api-surface.mjs. Do not edit by hand. -->',
  '',
  `# ${pkg.name} — public API surface`,
  '',
  'Regenerate with `npm run beta:api -- --update`, and **review the diff**: every',
  'line here is something a customer can import, so a removal or a signature change',
  'is a breaking change and needs a major version.',
  '',
  'Names, kinds and signatures only. Angular decorator metadata — a component',
  'selector, an input alias — is **not** covered, so a green check is not a promise',
  'of backwards compatibility.',
  '',
];

for (const entry of entries) {
  const importPath = entry.subpath === '.' ? pkg.name : `${pkg.name}${entry.subpath.slice(1)}`;
  const symbols = surfaceOf(collectDeclarationFiles(entry.file));
  lines.push(`## ${importPath}`, '', `${symbols.length} exported symbol(s).`, '', '```ts');
  lines.push(...symbols);
  lines.push('```', '');
}

const generated = `${lines.join('\n').trimEnd()}\n`;

if (update) {
  writeFileSync(SNAPSHOT, generated);
  const total = entries.length;
  console.log(`api-surface: snapshot written — ${total} entry point(s) -> ${SNAPSHOT}`);
  process.exit(0);
}

if (!existsSync(SNAPSHOT)) {
  fail(
    `${SNAPSHOT} does not exist. Create it with:\n\n  npm run beta:api -- --update\n\n` +
      'and commit it, so a later change to the published surface shows up as a diff.',
  );
}

const committed = readFileSync(SNAPSHOT, 'utf8');
if (committed === generated) {
  const counts = entries.map((e) => e.subpath).join(', ');
  console.log(`api-surface: pass — published surface matches the snapshot (${counts}).`);
  process.exit(0);
}

const committedLines = committed.split('\n');
const generatedLines = generated.split('\n');
const added = generatedLines.filter((l) => l.trim() && !committedLines.includes(l));
const removed = committedLines.filter((l) => l.trim() && !generatedLines.includes(l));

const detail = [
  'The published API surface no longer matches docs/api/platform.api.md.',
  '',
  'This is not automatically wrong — but it is a customer-visible change, so it has',
  'to be a decision rather than a side effect. A removed or reshaped export is a',
  'breaking change and needs a major version.',
];
if (removed.length) {
  detail.push('', `REMOVED or CHANGED (${removed.length}):`, ...removed.slice(0, 25).map((l) => `  - ${l}`));
  if (removed.length > 25) detail.push(`  … and ${removed.length - 25} more`);
}
if (added.length) {
  detail.push('', `ADDED (${added.length}):`, ...added.slice(0, 25).map((l) => `  + ${l}`));
  if (added.length > 25) detail.push(`  … and ${added.length - 25} more`);
}
detail.push('', 'If the change is intended:', '', '  npm run beta:api -- --update', '');
fail(detail.join('\n'));
