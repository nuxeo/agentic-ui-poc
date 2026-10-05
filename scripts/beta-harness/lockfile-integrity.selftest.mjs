#!/usr/bin/env node
/**
 * Controls for `lockfile-integrity.mjs` — proof that each half of it can actually fail.
 *
 * `CLAUDE.md`: *a gate is not evidence until you have seen it fail on purpose.* This gate is one
 * of the three the rule was written about, and it has now been wrong in both directions on the
 * same line of code:
 *
 *   - it matched dependency **names** but not versions, so it was green on the very lock that
 *     kept CI red for the whole of Phase 2 (`@oxc-resolver/binding-wasm32-wasi`'s nested
 *     `@emnapi/*` pruned by a bare `npm install` on macOS);
 *   - then the override waiver stripped the **selector** off `"brace-expansion@^5.0.0"` and
 *     waived every `brace-expansion` major, in a tree that holds v1 and v2 copies as well.
 *
 * Both were found in review rather than by the gate, because nothing re-asserted the gate's
 * behaviour. That is what this file is for. The two directions pull against each other — too
 * strict and 24 deliberate security pins look like corruption, too loose and a malformed edge is
 * waived — so the controls come in pairs: for each waiver there is a case that must stay excused
 * and a case that must be reported.
 *
 * Unlike `sanitizer-audit.selftest.mjs`, nothing here perturbs a tracked file. The gate takes
 * `--lock`, so every control is a throwaway lock plus manifest under the OS temp directory, and
 * the two controls that need the real lock copy it there first. There is no dirty-tree recovery
 * path because there is no way for this to leave the tree dirty.
 *
 * Usage:  node scripts/beta-harness/lockfile-integrity.selftest.mjs
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');
const GATE = 'scripts/beta-harness/lockfile-integrity.mjs';
const REAL_LOCK = join(ROOT, 'package-lock.json');
const REAL_MANIFEST = join(ROOT, 'package.json');

const workspace = mkdtempSync(join(tmpdir(), 'lockfile-integrity-selftest-'));
const results = [];

/**
 * Writes a `package.json` + `package-lock.json` pair into its own directory and runs the gate
 * against it. The manifest has to sit beside the lock because that is where the gate reads
 * `overrides` from — npm does not record them in the lock.
 */
function runGate(caseName, manifest, lock) {
  const dir = join(workspace, caseName);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'package.json'), JSON.stringify(manifest, null, 2));
  writeFileSync(join(dir, 'package-lock.json'), JSON.stringify(lock, null, 2));
  const r = spawnSync('node', [GATE, '--lock', join(dir, 'package-lock.json')], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return { code: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

/**
 * @param {string} name
 * @param {'pass' | 'fail'} expected
 * @param {string} because the substring the output must contain — a control that only checks the
 *   exit code cannot tell "red for my reason" from "red for an unrelated one", and this gate has
 *   1835 entries' worth of unrelated reasons available.
 * @param {{ code: number, out: string }} result
 */
function expect(name, expected, because, result) {
  const wanted = expected === 'pass' ? 0 : 1;
  const codeOk = result.code === wanted;
  const textOk = result.out.includes(because);
  const ok = codeOk && textOk;
  results.push({ name, expected, ok });
  const verdict = ok ? 'ok  ' : 'FAIL';
  console.log(`${verdict} ${name} — expected ${expected}, got exit ${result.code}`);
  if (!ok) {
    if (!codeOk) console.log(`       exit ${result.code}, wanted ${wanted}`);
    if (!textOk) console.log(`       output did not contain: ${because}`);
    console.log(
      result.out
        .trimEnd()
        .split('\n')
        .map((l) => `       | ${l}`)
        .join('\n'),
    );
  }
}

/** A minimal lock: one dependent declaring `spec` for `name`, resolved to `resolvedVersion`. */
function lockWithEdge({
  dependent = 'minimatch',
  dependentVersion = '3.1.2',
  name,
  spec,
  resolvedVersion,
  resolvedPath,
}) {
  return {
    name: 'fixture',
    version: '0.0.0',
    lockfileVersion: 3,
    requires: true,
    packages: {
      '': {
        name: 'fixture',
        version: '0.0.0',
        dependencies: { [dependent]: `^${dependentVersion}` },
      },
      [`node_modules/${dependent}`]: { version: dependentVersion, dependencies: { [name]: spec } },
      ...(resolvedVersion === null
        ? {}
        : { [resolvedPath ?? `node_modules/${name}`]: { version: resolvedVersion } }),
    },
  };
}

const V5_OVERRIDE = { 'brace-expansion@^5.0.0': '5.0.12' };

// ---------------------------------------------------------------------------------------------
// 1. Baseline. If the real lock does not pass, every control below is measuring something else.
// ---------------------------------------------------------------------------------------------
{
  const r = spawnSync('node', [GATE], { cwd: ROOT, encoding: 'utf8' });
  expect(
    'real lock passes (baseline — guards against the controls all being vacuous)',
    'pass',
    'lockfile-integrity: pass',
    { code: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` },
  );
}

// ---------------------------------------------------------------------------------------------
// 2. The selector must be honoured. Copilot's fixture on PR #300: a `^5.0.0` override and a
//    `^1.1.7` edge resolving to v2. npm's override does not touch that request, so the gate
//    must not excuse it. Reported `pass` while the waiver was keyed on the bare name.
// ---------------------------------------------------------------------------------------------
expect(
  'out-of-scope major is reported despite a v5 override',
  'fail',
  'requires brace-expansion@^1.1.7',
  runGate(
    'out-of-scope-major',
    { name: 'fixture', version: '0.0.0', overrides: V5_OVERRIDE },
    lockWithEdge({ name: 'brace-expansion', spec: '^1.1.7', resolvedVersion: '2.1.4' }),
  ),
);

// ---------------------------------------------------------------------------------------------
// 3. The mirror of 2, and the reason the waiver checks the *request* as well as the resolved
//    version. Prune a nested v1 copy and the v1 request walks up to the overridden v5 root
//    entry — which is the Phase 2 failure shape. Checking only "does 5.0.12 satisfy ^5.0.0"
//    would excuse it, because it does.
// ---------------------------------------------------------------------------------------------
expect(
  'v1 request resolving to the overridden v5 entry is reported (pruned nested copy)',
  'fail',
  'at 5.0.12, which does not satisfy "^1.1.7"',
  runGate(
    'pruned-nested-copy',
    { name: 'fixture', version: '0.0.0', overrides: V5_OVERRIDE },
    lockWithEdge({ name: 'brace-expansion', spec: '^1.1.7', resolvedVersion: '5.0.12' }),
  ),
);

// ---------------------------------------------------------------------------------------------
// 4/5. The other direction: the deliberate pin must stay excused, and that pass must be the
//      waiver doing it rather than the version check being asleep. 5 is 4 with the override
//      key deleted, so the same lock has to go red.
// ---------------------------------------------------------------------------------------------
const inScopeLock = lockWithEdge({
  dependent: 'nx',
  dependentVersion: '22.7.8',
  name: 'brace-expansion',
  spec: '5.0.8',
  resolvedVersion: '5.0.12',
});
expect(
  'in-scope pin stays excused (deliberate security pin, not corruption)',
  'pass',
  'lockfile-integrity: pass',
  runGate(
    'in-scope-pin',
    { name: 'fixture', version: '0.0.0', overrides: V5_OVERRIDE },
    inScopeLock,
  ),
);
expect(
  'the same in-scope edge is reported once the override key is removed',
  'fail',
  'requires brace-expansion@5.0.8',
  runGate('in-scope-pin-no-override', { name: 'fixture', version: '0.0.0' }, inScopeLock),
);

// ---------------------------------------------------------------------------------------------
// 6. A bare key carries no selector, so it waives the name outright — which is what npm does
//    with it. 24 of the 26 waived edges on the real lock are this shape.
// ---------------------------------------------------------------------------------------------
expect(
  'bare override key still waives the whole name',
  'pass',
  'lockfile-integrity: pass',
  runGate(
    'bare-key',
    { name: 'fixture', version: '0.0.0', overrides: { axios: '1.20.0' } },
    lockWithEdge({
      dependent: 'nx',
      dependentVersion: '22.7.8',
      name: 'axios',
      spec: '1.18.1',
      resolvedVersion: '1.20.0',
    }),
  ),
);

// ---------------------------------------------------------------------------------------------
// 7. A scoped name carries its own leading `@`, so the key has to split on the LAST one. Split
//    on the first and `"@scope/pkg@^2.0.0"` becomes the name `""` with range `scope/pkg@^2.0.0`,
//    and both of these go the wrong way.
// ---------------------------------------------------------------------------------------------
const SCOPED_OVERRIDE = { '@emnapi/core@^2.0.0': '2.1.0' };
expect(
  'scoped name with a selector: in-scope edge stays excused',
  'pass',
  'lockfile-integrity: pass',
  runGate(
    'scoped-in-scope',
    { name: 'fixture', version: '0.0.0', overrides: SCOPED_OVERRIDE },
    lockWithEdge({ name: '@emnapi/core', spec: '2.0.1', resolvedVersion: '2.1.0' }),
  ),
);
expect(
  'scoped name with a selector: out-of-scope edge is reported',
  'fail',
  'requires @emnapi/core@1.11.2',
  runGate(
    'scoped-out-of-scope',
    { name: 'fixture', version: '0.0.0', overrides: SCOPED_OVERRIDE },
    lockWithEdge({ name: '@emnapi/core', spec: '1.11.2', resolvedVersion: '1.11.3' }),
  ),
);

// ---------------------------------------------------------------------------------------------
// 8. The name half of the invariant, which no override touches: an edge whose package is not in
//    the lock at all.
// ---------------------------------------------------------------------------------------------
expect(
  'an edge with no lock entry at all is reported',
  'fail',
  'absent from the lock',
  runGate(
    'absent-entry',
    { name: 'fixture', version: '0.0.0' },
    lockWithEdge({ name: 'brace-expansion', spec: '^1.1.7', resolvedVersion: null }),
  ),
);

// ---------------------------------------------------------------------------------------------
// 9. The Phase 2 failure itself, on the real lock: prune `@oxc-resolver/binding-wasm32-wasi`'s
//    nested `@emnapi/*` entries, as a bare `npm install` on macOS does, and the v1.11.2 pins
//    walk up to the top-level 1.11.3. This is the control that was previously run by hand.
// ---------------------------------------------------------------------------------------------
{
  const lock = JSON.parse(readFileSync(REAL_LOCK, 'utf8'));
  const manifest = JSON.parse(readFileSync(REAL_MANIFEST, 'utf8'));
  const pruned = Object.keys(lock.packages).filter((k) =>
    k.startsWith('node_modules/@oxc-resolver/binding-wasm32-wasi/node_modules/@emnapi/'),
  );
  if (pruned.length === 0) {
    throw new Error(
      'the @emnapi control found nothing to prune — the lock has changed shape, so this control ' +
        'would have passed for the wrong reason',
    );
  }
  for (const key of pruned) delete lock.packages[key];
  expect(
    `Phase 2 regression: pruning ${pruned.length} nested @emnapi entries from the real lock`,
    'fail',
    '@emnapi/',
    runGate('phase2-emnapi-pruned', manifest, lock),
  );
}

// ---------------------------------------------------------------------------------------------
// 10. The real lock's own `brace-expansion@^5.0.0` pin is load-bearing: with the key removed,
//     the real lock goes red on that edge. The pass in control 1 is therefore the selector-scoped
//     waiver excusing it, not the version check failing to look.
// ---------------------------------------------------------------------------------------------
{
  const lock = JSON.parse(readFileSync(REAL_LOCK, 'utf8'));
  const manifest = JSON.parse(readFileSync(REAL_MANIFEST, 'utf8'));
  if (!Object.hasOwn(manifest.overrides ?? {}, 'brace-expansion@^5.0.0')) {
    throw new Error(
      'the real manifest no longer carries a "brace-expansion@^5.0.0" override — this control ' +
        'would have passed for the wrong reason',
    );
  }
  delete manifest.overrides['brace-expansion@^5.0.0'];
  expect(
    'real lock goes red on brace-expansion once its override key is removed',
    'fail',
    'requires brace-expansion@',
    runGate('real-lock-no-brace-override', manifest, lock),
  );
}

rmSync(workspace, { recursive: true, force: true });

const failed = results.filter((r) => !r.ok);
console.log();
if (failed.length === 0) {
  console.log(
    `lockfile-integrity selftest: pass — ${results.length} control(s) behaved as specified.`,
  );
  process.exit(0);
}
console.error(
  `lockfile-integrity selftest: FAIL — ${failed.length} of ${results.length} control(s) did not behave as specified:`,
);
for (const f of failed) console.error(`  - ${f.name} (expected ${f.expected})`);
process.exit(1);
