#!/usr/bin/env node
/**
 * Negative controls for `libs/platform/guardrails/check-extension-library.mjs`, the guardrail we
 * ship to customers.
 *
 * It is run against our own reference library on every gate and CI run, which proves it passes on
 * a good library — never that it can fail on a bad one. These fixtures are customer-shaped
 * libraries in a temp directory, each broken in one way and expected red for that reason, plus
 * good ones expected green. Started with check 6, the component-contribution checks; the older
 * checks' controls are the ones their own doc comments describe as "verified against this script".
 *
 * Usage: node scripts/check-extension-library.selftest.mjs
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const GUARDRAIL = resolve(import.meta.dirname, '../libs/platform/guardrails/check-extension-library.mjs');
const failures = [];
let negative = 0;
let positive = 0;

function run(files) {
  const dir = mkdtempSync(join(tmpdir(), 'customer-guardrail-selftest-'));
  try {
    for (const [path, body] of Object.entries(files)) {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      writeFileSync(join(dir, path), body);
    }
    const result = spawnSync(process.execPath, [GUARDRAIL, dir], { encoding: 'utf8' });
    return { code: result.status, out: `${result.stdout}\n${result.stderr}` };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function expectRed(label, files, reason) {
  negative += 1;
  const { code, out } = run(files);
  if (code === 0) failures.push(`${label}: passed, but the library is broken on purpose.`);
  else if (!reason.test(out)) failures.push(`${label}: failed, not for /${reason.source}/:\n${out}`);
}

function expectGreen(label, files, also) {
  positive += 1;
  const { code, out } = run(files);
  if (code !== 0) failures.push(`${label}: failed on a correct library:\n${out}`);
  else if (also && !also.test(out)) failures.push(`${label}: passed, but without /${also.source}/:\n${out}`);
}

const panel = ({ selector = 'acme-claims', className = 'AcmeClaimsComponent', implementsClause = '' } = {}) =>
  "import { Component } from '@angular/core';\n" +
  `@Component({ selector: '${selector}', standalone: true, templateUrl: './claims.html' })\n` +
  `export class ${className}${implementsClause} {}\n`;

const extensions = (entry) =>
  "import { provideSatoriExtensions } from '@nuxeo-satori/platform/extensions';\n" +
  'export const provideAcme = () =>\n' +
  '  provideSatoriExtensions({\n' +
  "    rules: { 'acme.rules.isLegal': () => false },\n" +
  "    failClosedRules: ['acme.rules.isLegal'],\n" +
  `    components: {\n      ${entry}\n    },\n` +
  '  });\n';

const LAZY = "'acme.panel.claims': () => import('./claims/claims').then((m) => m.AcmeClaimsComponent),";

const library = (overrides = {}) => ({
  'src/index.ts': "export { provideAcme } from './lib/extensions';\n",
  'src/lib/extensions.ts': extensions(LAZY),
  'src/lib/claims/claims.ts': panel(),
  'src/lib/extensions.spec.ts':
    "import { ExtensionComponentRegistry } from '@nuxeo-satori/platform/extensions';\n" +
    "it('registers', () => expect(registry(ExtensionComponentRegistry).has('acme.panel.claims')).toBe(true));\n",
  ...overrides,
});

// ---------------------------------------------------------------- positives ----

expectGreen('a lazily registered, tested, prefixed component', library(), /1 component registration\(s\)/);

expectGreen(
  'an eagerly registered component imported from a relative path',
  library({
    'src/lib/extensions.ts':
      "import { AcmeClaimsComponent } from './claims/claims';\n" +
      extensions("'acme.panel.claims': AcmeClaimsComponent,"),
  }),
  /1 component registration\(s\)/,
);

expectGreen(
  'a component registered under a computed key and named by that key in a spec',
  library({
    'src/lib/extensions.ts':
      "export const IDS = { components: ['acme.panel.claims'] } as const;\n" +
      extensions("[IDS.components[0]]: () => import('./claims/claims').then((m) => m.AcmeClaimsComponent),"),
    'src/lib/extensions.spec.ts':
      "import { ExtensionComponentRegistry } from '@nuxeo-satori/platform/extensions';\n" +
      "it('registers', () => expect(r(ExtensionComponentRegistry).has(IDS.components[0])).toBe(true));\n",
  }),
  /1 component registration\(s\)/,
);

expectGreen(
  'an override of nxs.primitives.tag that implements NxsTagInputs',
  library({
    'src/lib/extensions.ts': extensions(
      "'nxs.primitives.tag': () => import('./claims/claims').then((m) => m.AcmeClaimsComponent),",
    ),
    'src/lib/claims/claims.ts':
      "import type { NxsTagInputs } from '@nuxeo-satori/platform/components';\n" +
      panel({ implementsClause: ' implements NxsTagInputs' }),
    'src/lib/extensions.spec.ts':
      "import { ExtensionComponentRegistry } from '@nuxeo-satori/platform/extensions';\n" +
      "it('overrides', () => expect(r(ExtensionComponentRegistry).peek('nxs.primitives.tag')).toBe(AcmeClaimsComponent));\n",
  }),
);

// ---------------------------------------------------------------- negatives ----

expectRed(
  'a lazy import of a file that does not exist',
  library({
    'src/lib/extensions.ts': extensions(
      "'acme.panel.claims': () => import('./claim/claims').then((m) => m.AcmeClaimsComponent),",
    ),
  }),
  /registers 'acme\.panel\.claims' from '\.\/claim\/claims', which is not a file in this library/,
);

expectRed(
  'a lazy import naming a class the file does not export',
  library({
    'src/lib/extensions.ts': extensions(
      "'acme.panel.claims': () => import('./claims/claims').then((m) => m.AcmeClaimComponent),",
    ),
  }),
  /as `AcmeClaimComponent`, which .*claims\.ts does not export/,
);

expectRed(
  'a registered component no spec names',
  library({
    'src/lib/extensions.spec.ts':
      "import { ExtensionComponentRegistry } from '@nuxeo-satori/platform/extensions';\n" +
      "it('has a registry', () => expect(ExtensionComponentRegistry).toBeDefined());\n",
  }),
  /registers 'acme\.panel\.claims' \(`AcmeClaimsComponent`\), and no spec names it/,
);

expectRed(
  'a component named only in a spec comment',
  library({
    'src/lib/extensions.spec.ts':
      "import { ExtensionComponentRegistry } from '@nuxeo-satori/platform/extensions';\n" +
      "// TODO: assert 'acme.panel.claims' and AcmeClaimsComponent\n" +
      "it('has a registry', () => expect(ExtensionComponentRegistry).toBeDefined());\n",
  }),
  /and no spec names it/,
);

for (const prefix of ['nxs', 'lib', 'sat']) {
  expectRed(
    `a component selector under the platform's \`${prefix}-\` prefix`,
    library({ 'src/lib/claims/claims.ts': panel({ selector: `${prefix}-claims` }) }),
    new RegExp(`declares selector \`${prefix}-claims\`\\. Use your owner prefix, \`acme-\``),
  );
}

expectRed(
  'an override of nxs.primitives.tag that does not implement NxsTagInputs',
  library({
    'src/lib/extensions.ts': extensions(
      "'nxs.primitives.tag': () => import('./claims/claims').then((m) => m.AcmeClaimsComponent),",
    ),
    'src/lib/extensions.spec.ts':
      "import { ExtensionComponentRegistry } from '@nuxeo-satori/platform/extensions';\n" +
      "it('overrides', () => expect(r(ExtensionComponentRegistry).peek('nxs.primitives.tag')).toBe(AcmeClaimsComponent));\n",
  }),
  /overriding a platform primitive, but `AcmeClaimsComponent` does not implement `NxsTagInputs`/,
);

expectRed(
  'an override implementing the wrong primitive contract',
  library({
    'src/lib/extensions.ts': extensions(
      "'nxs.primitives.avatar': () => import('./claims/claims').then((m) => m.AcmeClaimsComponent),",
    ),
    'src/lib/claims/claims.ts': panel({ implementsClause: ' implements NxsTagInputs' }),
    'src/lib/extensions.spec.ts':
      "import { ExtensionComponentRegistry } from '@nuxeo-satori/platform/extensions';\n" +
      "it('overrides', () => expect(r(ExtensionComponentRegistry).peek('nxs.primitives.avatar')).toBe(AcmeClaimsComponent));\n",
  }),
  /does not implement `NxsAvatarInputs`/,
);

expectRed(
  'an override of a primitive the platform does not have',
  library({
    'src/lib/extensions.ts': extensions(
      "'nxs.primitives.chip': () => import('./claims/claims').then((m) => m.AcmeClaimsComponent),",
    ),
    'src/lib/extensions.spec.ts':
      "import { ExtensionComponentRegistry } from '@nuxeo-satori/platform/extensions';\n" +
      "it('overrides', () => expect(r(ExtensionComponentRegistry).has('nxs.primitives.chip')).toBe(true));\n",
  }),
  /the platform has no `nxs\.primitives\.chip` to override/,
);

expectRed(
  'an eager registration whose import names a missing file',
  library({
    'src/lib/extensions.ts':
      "import { AcmeClaimsComponent } from './claims/missing';\n" +
      extensions("'acme.panel.claims': AcmeClaimsComponent,"),
  }),
  /from '\.\/claims\/missing', which is not a file in this library/,
);

// ------------------------------------------------------------------- report ----

console.log(
  `check-extension-library selftest: ${negative + positive} controls — ${negative} negative ` +
    `(a broken library must go red, for the stated reason), ${positive} positive.`,
);
if (failures.length) {
  console.error(`\n${failures.length} control(s) did not behave as required:`);
  for (const f of failures) console.error(`- ${f}\n`);
  process.exit(1);
}
console.log('All controls behaved as required.');
