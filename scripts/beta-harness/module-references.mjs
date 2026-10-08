/**
 * Which packages the repository's source really references — parsed specifiers, never prose.
 *
 * Used by the supply-chain gate's unreferenced-dependency check, and kept in its own module so
 * `module-references.selftest.mjs` can exercise it without running the whole gate.
 *
 * The regex this replaced accepted a backtick as a quote and read comments as code, so a JSDoc
 * line saying ``from `@alfresco/adf-extensions` `` counted as an import and kept the gate green
 * for a package nothing imported.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import ts from 'typescript';

/**
 * Import, export, `require()`, dynamic `import()` and triple-slash type references in a code file.
 * @param {string} text
 */
export function codeSpecifiers(text) {
  const info = ts.preProcessFile(text, true, true);
  return [
    ...info.importedFiles.map((f) => f.fileName),
    ...info.typeReferenceDirectives.map((f) => f.fileName),
  ];
}

/**
 * `@use`, `@forward` and `@import` targets in a stylesheet, with comments stripped first and only
 * at a statement start, so `content: "@import 'x'"` is a string rather than an import.
 * @param {string} text
 */
export function styleSpecifiers(text) {
  const code = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  const statement = /(?:^|[;{}])\s*@(?:use|forward|import)\b([^;]*)/g;
  const target = /url\(\s*(['"]?)([^'")\s]+)\1\s*\)|(['"])([^'"]+)\3/g;
  return [...code.matchAll(statement)].flatMap((s) =>
    [...s[1].matchAll(target)].map((t) => (t[2] ?? t[4]).replace(/^~/, '')),
  );
}

/**
 * Every module specifier under `dirs` of `root`, plus the text of `angular.json`.
 *
 * Build config can name a package without any source importing it — an asset glob or a style
 * entry point is a real reference — so `angular.json` is searched for `node_modules/<dep>`. It is
 * JSON, which has no comments to be fooled by.
 *
 * `package.json` is deliberately NOT included. An earlier version read it, and every dependency
 * then matched its own declaration (`"tslib": "^2.8.1"` contains `"tslib"`), so the check found
 * nothing and every exception looked unnecessary. The file under test cannot also be evidence.
 * @param {string} root
 * @param {string[]} [dirs]
 */
export function collectReferences(root, dirs = ['apps', 'libs', 'tools', 'scripts']) {
  /** @type {Set<string>} */
  const specifiers = new Set();
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      if (/^(node_modules|dist|coverage|\.nx|\.git)$/.test(entry)) continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (/\.(ts|mts|cts|mjs|cjs|js)$/.test(full)) {
        for (const s of codeSpecifiers(readFileSync(full, 'utf8'))) specifiers.add(s);
      } else if (/\.(scss|css)$/.test(full)) {
        for (const s of styleSpecifiers(readFileSync(full, 'utf8'))) specifiers.add(s);
      }
    }
  };
  for (const dir of dirs) {
    const abs = resolve(root, dir);
    if (existsSync(abs)) walk(abs);
  }
  const ngPath = resolve(root, 'angular.json');
  const buildConfig = existsSync(ngPath) ? readFileSync(ngPath, 'utf8') : '';
  return { specifiers, buildConfig };
}

/**
 * Is `dep` a specifier — itself or a subpath — or a `node_modules/` path in the build config?
 * @param {string} dep
 * @param {{ specifiers: Set<string>, buildConfig: string }} refs
 */
export function referenced(dep, refs) {
  for (const s of refs.specifiers) if (s === dep || s.startsWith(`${dep}/`)) return true;
  const q = dep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`node_modules/${q}(?:/|["'])`).test(refs.buildConfig);
}

const DEP = 'fixture-dep';

/**
 * `[name, kind, text, expected]`. Nine of the eleven `false` rows were `true` under the regex this
 * replaced, and three of the `true` rows were `false` under it: it never saw a triple-slash type
 * reference, and `\b@use` cannot match because `\b` needs a word character before the `@`. The
 * `true` rows also keep the parser from passing the `false` ones by finding nothing at all.
 * @type {[string, 'code' | 'style' | 'build', string, boolean][]}
 */
const CONTROLS = [
  ['JSDoc "from `x`"', 'code', `/** Parity with \`mergeObjects\` from \`${DEP}\`. */\n`, false],
  ['JSDoc "from `x/sub`"', 'code', ` * reproduced from \`${DEP}/lib\` branch\n`, false],
  ['line comment import', 'code', `// import { a } from '${DEP}';\nexport const b = 1;\n`, false],
  ['block comment require', 'code', `/* const a = require('${DEP}'); */\n`, false],
  ['string holding an import', 'code', `const s = "import a from '${DEP}'";\n`, false],
  ['template holding an import', 'code', `const s = \`import('${DEP}')\`;\n`, false],
  ['longer package name', 'code', `import a from '${DEP}-extra';\n`, false],
  ['stylesheet line comment', 'style', `// @use '${DEP}';\n.a { color: red; }\n`, false],
  ['stylesheet block comment', 'style', `/* @import '${DEP}/x'; */\n`, false],
  ['stylesheet string', 'style', `.a { content: "@import '${DEP}'"; }\n`, false],
  [
    'build path of a longer name',
    'build',
    `{ "input": "node_modules/${DEP}-extra/assets" }`,
    false,
  ],
  ['named import', 'code', `import { a } from '${DEP}';\n`, true],
  ['subpath side-effect import', 'code', `import '${DEP}/polyfill';\n`, true],
  ['re-export', 'code', `export * from '${DEP}';\n`, true],
  ['require', 'code', `const a = require('${DEP}');\n`, true],
  [
    'mid-file dynamic import',
    'code',
    `const x = 1;\nasync function f() {\n  return import('${DEP}');\n}\n`,
    true,
  ],
  ['triple-slash types', 'code', `/// <reference types="${DEP}" />\n`, true],
  ['stylesheet @use subpath', 'style', `@use '${DEP}/theme' as t;\n`, true],
  ['stylesheet @import with ~', 'style', `.a {}\n@import '~${DEP}/x';\n`, true],
  ['build asset path', 'build', `{ "input": "node_modules/${DEP}/assets" }`, true],
];

/**
 * Run `CONTROLS` and return a description of each one that did not behave as specified.
 * @returns {string[]}
 */
export function selfCheck() {
  const failures = [];
  for (const [name, kind, text, expected] of CONTROLS) {
    const refs = { specifiers: new Set(), buildConfig: '' };
    if (kind === 'code') codeSpecifiers(text).forEach((s) => refs.specifiers.add(s));
    else if (kind === 'style') styleSpecifiers(text).forEach((s) => refs.specifiers.add(s));
    else refs.buildConfig = text;
    const got = referenced(DEP, refs);
    if (got !== expected) failures.push(`${name}: referenced=${got}, expected ${expected}`);
  }
  return failures;
}

export const CONTROL_COUNT = {
  negative: CONTROLS.filter((c) => !c[3]).length,
  positive: CONTROLS.filter((c) => c[3]).length,
};
