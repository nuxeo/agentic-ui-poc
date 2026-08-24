#!/usr/bin/env node
/**
 * Asserts that `@nuxeo-satori/platform` **can actually be published**.
 *
 * ## Why this gate exists
 *
 * Phase 4's central claim to customers is that an upgrade is an `npm version` bump. For
 * the whole of that phase the package could not be published at all:
 *
 *     ERROR: Trying to publish a package that has been compiled in full compilation mode.
 *     This is not allowed.
 *
 * ng-packagr writes that as a `prepublishOnly` script into the built `package.json`
 * whenever the entry point was compiled in anything other than partial mode, so
 * `npm publish` hard-fails on the customer's very first install path — while `lint`,
 * `test`, `build`, `typecheck`, `api-surface` and `fork-simulation` were all green,
 * because none of them runs a publish.
 *
 * The cause is worth stating because it has now produced two separate defects.
 * `@nx/angular:package` given a `tsConfig` option calls
 * `parseRemappedTsConfigAndMergeDefaults`, which — despite the name — merges only eight
 * hardcoded options and otherwise **replaces** ng-packagr's bundled
 * `conf/tsconfig.ngc.json`. That bundled file is the only place `compilationMode:
 * partial` is set, and it is also where `strictTemplates` lives. Angular's own default
 * is `FULL`. The first defect from this was 27 wrongly non-nullable public types
 * (missing `strict`); the second was an unpublishable package (missing
 * `compilationMode`). Both were configuration absent rather than configuration wrong,
 * which is the kind no type checker reports.
 *
 * ## What is load-bearing here
 *
 * Check 3 is the real one: it runs `npm publish --dry-run`, which is the only thing that
 * executes `prepublishOnly`. Checks 1, 2, 4 and 5 are cheap corroborations that name the
 * specific failure when 3 goes red, and cover things a dry run does not look at.
 *
 * Verified to fail on purpose: re-adding the full-mode `prepublishOnly` to the built
 * `package.json` turns checks 1 and 3 red, and reverting `compilationMode` in
 * `libs/platform/tsconfig.lib.json` turns 1, 2 and 3 red together.
 *
 * ## Safety
 *
 * Nothing here can publish. The dry run happens in a throwaway copy under the OS temp
 * directory, `--dry-run` makes no registry request, and the copy is the only place
 * `private: true` is stripped — the built package keeps it, so a stray real `npm publish`
 * in `dist/` is still refused by npm.
 */

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const DIST = resolve('dist/libs/platform');

const failures = [];
const notes = [];
const fail = (m) => failures.push(m);

if (!existsSync(DIST)) {
  console.error(
    `publishability: dist/libs/platform does not exist.\n` +
      `  Run \`npx nx build platform\` first — this gate reads the built bytes, not the source.`,
  );
  process.exit(2);
}

const pkgPath = join(DIST, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

// ------------------------------------------- 1. the full-mode tripwire is absent ----

if (pkg.scripts?.prepublishOnly) {
  fail(
    'The built package.json carries a `prepublishOnly` script:\n' +
      `    ${pkg.scripts.prepublishOnly.slice(0, 120)}...\n` +
      '    ng-packagr writes this ONLY for a non-partial build. Set\n' +
      '    `angularCompilerOptions.compilationMode: "partial"` in libs/platform/tsconfig.lib.json.',
  );
} else {
  notes.push('no `prepublishOnly` tripwire in the built package.json');
}

// -------------------------------- 2. the shipped bytes are partial-mode bytes ----

/**
 * Checked against the emitted JavaScript rather than the tsconfig, because the tsconfig
 * is the input we already got wrong. `ɵɵngDeclareComponent` is what a *library* emits
 * for the consuming application's linker to lower; `ɵɵdefineComponent` is the final form
 * and pins the output to one Angular version.
 */
const fesm = [
  'nuxeo-satori-platform.mjs',
  'nuxeo-satori-platform-app-config.mjs',
  'nuxeo-satori-platform-extensions.mjs',
  'nuxeo-satori-platform-nuxeo-client.mjs',
  'nuxeo-satori-platform-ui.mjs',
];

let declared = 0;
for (const name of fesm) {
  const file = join(DIST, 'fesm2022', name);
  if (!existsSync(file)) {
    fail(`Expected bundle is missing: fesm2022/${name}`);
    continue;
  }
  const text = readFileSync(file, 'utf8');
  const partial = (text.match(/ɵɵngDeclare/g) ?? []).length;
  const full = (text.match(/ɵɵdefine(Component|Directive|Injectable|Pipe|NgModule)/g) ?? []).length;
  declared += partial;

  if (full > 0) {
    fail(
      `fesm2022/${name} contains ${full} fully-compiled definition(s) (ɵɵdefine*).\n` +
        "    A published library must emit ɵɵngDeclare* so the consumer's linker lowers it\n" +
        "    against the consumer's Angular version.",
    );
  }
}

if (declared === 0) {
  fail(
    'No `ɵɵngDeclare*` calls in any bundle.\n' +
      '    Check 2 would then pass vacuously for an empty package, so it is a failure:\n' +
      '    the platform ships components, services and pipes and must declare them.',
  );
} else {
  notes.push(`${declared} ɵɵngDeclare* declarations across ${fesm.length} bundles, 0 ɵɵdefine*`);
}

// -------------------------------------------- 3. npm publish --dry-run succeeds ----

const staging = mkdtempSync(join(tmpdir(), 'satori-publishability-'));
const copy = join(staging, 'platform');
try {
  cpSync(DIST, copy, { recursive: true });

  // Stripped in the COPY only. `private: true` stays in dist so an accidental real
  // publish is refused; npm refuses a dry run of a private package too, which would
  // make this check unfalsifiable rather than passing.
  const copied = JSON.parse(readFileSync(join(copy, 'package.json'), 'utf8'));
  if (copied.private !== true) {
    fail(
      'The built package.json is not `private: true`.\n' +
        '    It is the last thing standing between a mistyped `npm publish` and a public\n' +
        '    release of an unfinished package. Publishing is a deliberate, later step —\n' +
        '    see docs/publishing-to-nuxeo-registry.md.',
    );
  }
  delete copied.private;
  writeFileSync(join(copy, 'package.json'), JSON.stringify(copied, null, 2));

  try {
    execFileSync('npm', ['publish', '--dry-run', '--registry=https://registry.npmjs.org'], {
      cwd: copy,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    notes.push('`npm publish --dry-run` succeeded on a copy of the built package');
  } catch (error) {
    const output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
    fail(
      '`npm publish --dry-run` failed on the built package. This is the load-bearing\n' +
        '    check: it is the only one that runs the `prepublishOnly` lifecycle script.\n\n' +
        output
          .split('\n')
          .filter((l) => l.trim())
          .slice(-12)
          .map((l) => `      ${l}`)
          .join('\n'),
    );
  }

  // -------------------------------- 4. every declared subpath resolves in the copy ----

  /**
   * `ng-packagr-lite` once produced a package whose four secondary entry points were all
   * unresolvable — the `exports` map named files it had not written. Resolved from the
   * temp copy so this reads the tree as unpacked, not as built in place.
   */
  for (const [subpath, conditions] of Object.entries(pkg.exports ?? {})) {
    for (const [condition, target] of Object.entries(conditions)) {
      if (typeof target !== 'string') continue;
      if (!existsSync(join(copy, target))) {
        fail(
          `exports["${subpath}"].${condition} points at \`${target}\`, which is not in the package.\n` +
            '    A customer importing that subpath gets ERR_MODULE_NOT_FOUND.',
        );
      }
    }
  }
  notes.push(`${Object.keys(pkg.exports ?? {}).length} export subpaths resolve to present files`);

  // ------------------------------ 5. the package ships what its docs tell customers to run ----

  /**
   * `AGENTS.md` instructs customers to run the guardrail script out of
   * `node_modules/@nuxeo-satori/platform/guardrails/`. It was absent from the tarball for
   * the whole of Phase 4 — a documented step that could not be followed. Derived from the
   * docs rather than hardcoded, so a new instruction is covered without editing this file.
   */
  const docs = ['README.md', 'AGENTS.md', 'extension-reference.md'].filter((d) =>
    existsSync(join(copy, d)),
  );
  const advertised = new Set();
  for (const doc of docs) {
    const text = readFileSync(join(copy, doc), 'utf8');
    for (const m of text.matchAll(/node_modules\/@nuxeo-satori\/platform\/([\w./-]+)/g)) {
      advertised.add(m[1]);
    }
  }
  for (const path of advertised) {
    if (!existsSync(join(copy, path))) {
      fail(
        `The docs tell customers to use \`node_modules/@nuxeo-satori/platform/${path}\`,\n` +
          '    which is not in the package. Add it to `assets` in libs/platform/ng-package.json.',
      );
    }
  }
  // ---------------------------------- 6. the Nx generators resolve from the package ----

  /**
   * Layer 3 is "the differentiator" per the plan, and the generators that make it real were
   * not in the tarball at all. `AGENTS.md` section 2 told customers to run
   * `npx nx g ./tools/satori-generators:extension-library` — a path inside *our* repository
   * — so the first instruction in the shipped guide could not be run by its audience.
   *
   * Asserted from `package.json`'s `generators` field outward, the way Nx resolves a
   * plugin, so this fails if the manifest is missing, malformed, or names a factory or
   * schema that was not shipped. A factory path has no extension in the manifest, exactly
   * as Nx `require()`s it.
   */
  const manifestPath = pkg.generators;
  if (typeof manifestPath !== 'string') {
    fail(
      'package.json has no `generators` field, so Nx cannot see this package as a plugin\n' +
        '    and `nx g @nuxeo-satori/platform:…` fails with "Cannot find generator".',
    );
  } else if (!existsSync(join(copy, manifestPath))) {
    fail(`package.json points at \`${manifestPath}\`, which is not in the package.`);
  } else {
    let generators = {};
    try {
      generators = JSON.parse(readFileSync(join(copy, manifestPath), 'utf8')).generators ?? {};
    } catch (error) {
      fail(`${manifestPath} is not valid JSON (${error.message}).`);
    }
    const names = Object.keys(generators);
    if (names.length === 0) {
      fail(
        `${manifestPath} declares no generators, so check 6 asserted nothing. The package is\n` +
          '    meant to ship four: extension-library, -rule, -action and -component.',
      );
    }
    for (const [name, generator] of Object.entries(generators)) {
      // Nx requires the factory without an extension; the compiled file is `.js`.
      if (!existsSync(join(copy, `${generator.factory}.js`))) {
        fail(
          `generator \`${name}\` names factory \`${generator.factory}\`, which is not in the\n` +
            '    package. `nx g` reports "Cannot find module" at the point a customer runs it.',
        );
      }
      if (generator.schema && !existsSync(join(copy, generator.schema))) {
        fail(`generator \`${name}\` names schema \`${generator.schema}\`, which is not shipped.`);
      }
    }
    if (names.length > 0) {
      notes.push(`${names.length} Nx generator(s) resolve from the package: ${names.join(', ')}`);
    }
  }

  if (advertised.size === 0) {
    fail(
      `None of the ${docs.length} shipped doc(s) reference a \`node_modules/@nuxeo-satori/platform/…\`\n` +
        '    path, so check 5 asserted nothing. If the guardrail instruction was removed,\n' +
        '    remove this check deliberately rather than letting it pass empty.',
    );
  } else {
    notes.push(`${advertised.size} doc-advertised path(s) present in the package`);
  }
} finally {
  rmSync(staging, { recursive: true, force: true });
}

// ------------------------------------------------------------------------ report ----

if (failures.length) {
  console.error(`\npublishability: FAIL — ${failures.length} problem(s) in ${DIST}\n`);
  for (const f of failures) console.error(`- ${f}\n`);
  process.exit(1);
}

console.log(`publishability: pass — @nuxeo-satori/platform@${pkg.version} is publishable`);
for (const n of notes) console.log(`  - ${n}`);
