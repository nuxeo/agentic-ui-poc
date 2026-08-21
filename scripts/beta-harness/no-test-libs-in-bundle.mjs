#!/usr/bin/env node
/**
 * Assert that no test-only library, and no `eval()`, reaches the production bundle.
 *
 * Phase 3's spike measured what happens when `@alfresco/adf-core` and
 * `@alfresco/adf-hx-content-services` are installed as published: adf-hx imports
 * `ng-mocks` — a test-mocking library — from its **shipped** `/ui` runtime bundle, so
 * ng-mocks' implementation landed in a 1.6 MB customer-facing chunk carrying two
 * `eval()` calls. For an on-premises enterprise product that fails CSP and every SAST
 * review. `tools/stubs/ng-mocks/` replaces it; this is the check that the replacement
 * is actually working.
 *
 * It reads the built bytes rather than `package.json`, because the question is not
 * what we declared, it is what a customer receives. A stub that stops working, an
 * `npm install` that quietly restores the real library, or a new upstream version
 * that imports a different test helper all show up here and nowhere else.
 *
 * `eval` is matched as a call — `eval(` — rather than as a word, so the string "eval"
 * inside an unrelated identifier or a sourcemap comment does not fail the gate.
 *
 * Usage:
 *   node scripts/beta-harness/no-test-libs-in-bundle.mjs [dist-dir]
 *
 * Exit 1 if a banned symbol is present, or if there is no build to inspect — a check
 * that inspected nothing is not a pass.
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..', '..');
const distDir = resolve(process.cwd(), process.argv[2] ?? 'dist/nuxeo-ui/browser');

/**
 * Each pattern is a substring rather than a regex where a substring suffices: these
 * run over multi-megabyte bundles and a careless regex is measurably slow.
 */
const BANNED = [
  {
    id: 'ng-mocks',
    // Implementation fingerprints, **not** the package name. Matching `ngMocks` or
    // `ng-mocks` fails on our own stub, which legitimately names the library it
    // replaces in its error messages — the first version of this gate did exactly
    // that and reported the remedy as the disease. These three strings appear only
    // in the real library's compiled output.
    needles: ['extendClassicClass', '_ng_mocks_universe__', 'MockMiddleware'],
    why:
      'ng-mocks is a test-mocking library. adf-hx imports it from its shipped /ui bundle; ' +
      'tools/stubs/ng-mocks/ is meant to keep it out of the build.',
    fix: 'Check that package.json still has "ng-mocks": "file:tools/stubs/ng-mocks" and re-run npm ci.',
  },
  {
    id: 'eval',
    needles: ['eval('],
    why:
      'eval() in shipped code breaks a restrictive CSP and is flagged by SAST. The known ' +
      "source is ng-mocks' extendClassicClass, pulled in through adf-hx.",
    fix: 'Find which dependency contributed it before relaxing this check.',
  },
];

if (!existsSync(distDir)) {
  console.error(
    `no-test-libs-in-bundle: no build at ${relative(repoRoot, distDir) || distDir}.\n` +
      'Build first — `npx nx build nuxeo-ui` — because this gate reads the built bytes.\n' +
      'Refusing to report a pass on a bundle that was never inspected.',
  );
  process.exit(1);
}

/**
 * Strings that appear only in the **upstream** packages, used to tell "adf-hx is in
 * this bundle" from "it is not".
 *
 * Deliberately not the `hxp-document-list` selector: the POC hand-wrote a component
 * with that exact selector, so matching it reported adf-hx as present in a bundle
 * that contained none — the first version of this check did, and silently turned the
 * vacuity warning off. `adf-datatable` comes from adf-core's DataTable and
 * `adf-enterprise-adf-hx` from the published providers file; neither occurs anywhere
 * in this repo's own source.
 */
const UPSTREAM_MARKERS = ['adf-datatable', 'adf-enterprise-adf-hx'];

/** @type {{ pattern: string, file: string, count: number, why: string, fix: string }[]} */
const hits = [];
let filesScanned = 0;
let bytesScanned = 0;
/** Whether adf-hx code is present at all — see the vacuity note in the report. */
let sawAdfHx = false;

for await (const file of walk(distDir)) {
  // `.js` only: a `.map` legitimately contains the original identifiers of anything
  // that was tree-shaken, so scanning sourcemaps produces false positives.
  if (!file.endsWith('.js')) continue;
  filesScanned += 1;
  const body = await readFile(file, 'utf8');
  bytesScanned += body.length;
  if (!sawAdfHx && UPSTREAM_MARKERS.some((m) => body.includes(m))) sawAdfHx = true;
  for (const banned of BANNED) {
    for (const needle of banned.needles) {
      const count = countOccurrences(body, needle);
      if (count > 0) {
        hits.push({
          pattern: needle,
          file: relative(distDir, file),
          count,
          why: banned.why,
          fix: banned.fix,
        });
      }
    }
  }
}

if (filesScanned === 0) {
  console.error(`no-test-libs-in-bundle: ${distDir} contains no .js files. Nothing was checked.`);
  process.exit(1);
}

console.log(
  `\nno-test-libs-in-bundle: scanned ${filesScanned} bundle file(s), ` +
    `${(bytesScanned / 1048576).toFixed(2)} MB\n`,
);

if (hits.length === 0) {
  console.log(`no-test-libs-in-bundle: pass — none of ${BANNED.map((b) => b.id).join(', ')} reached the bundle.`);
  // A green here means nothing unless adf-hx is actually in the bundle: the banned
  // symbols arrive *through* it. Until an adoption lands, this passes trivially, and
  // saying so is the difference between a gate and a decoration.
  if (!sawAdfHx) {
    console.log(
      '\n  VACUOUS: no adf-hx code was found in this bundle, so nothing could have\n' +
        '  carried a banned symbol into it. This run does not demonstrate that the\n' +
        '  ng-mocks stub works — it demonstrates that adf-hx is not yet adopted.\n' +
        '  It becomes load-bearing when a component imports @alfresco/adf-hx-content-services.',
    );
  }
  process.exit(0);
}

for (const hit of hits) {
  console.log(`  [FAIL] "${hit.pattern}" x${hit.count} in ${hit.file}`);
  console.log(`         ${hit.why}`);
  console.log(`         ${hit.fix}`);
}
console.log(`\nno-test-libs-in-bundle: FAIL — ${hits.length} banned symbol occurrence group(s) in the bundle.`);
process.exit(1);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if ((await stat(full)).isFile()) yield full;
  }
}

/** @param {string} haystack @param {string} needle */
function countOccurrences(haystack, needle) {
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}
