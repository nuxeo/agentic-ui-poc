/**
 * Which packages the repository's source really references — parsed specifiers, never prose.
 *
 * Used by the supply-chain gate's unreferenced-dependency check. Its controls live here too, as
 * `selfCheck()`, and `supply-chain.mjs` runs them on every gate run before trusting the result.
 *
 * The regex this replaced accepted a backtick as a quote and read comments as code, so a JSDoc
 * line saying ``from `@alfresco/adf-extensions` `` counted as an import and kept the gate green
 * for a package nothing imported.
 */
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
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
 * `text` with comments blanked to spaces and string contents to `_`, quotes and newlines kept, so
 * every offset still maps to `text`.
 *
 * A scanner rather than a regex, because neither construct can be found without knowing whether
 * you are inside the other: the `//` in `$marker: "//"` is not a comment, and the `;` and
 * `@import` in `content: "; @import 'x'"` are not a statement. `//` directly after `url(` is a
 * protocol-relative URL, not a comment.
 * @param {string} text
 */
function maskStylesheet(text) {
  let out = '';
  let quote = null;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quote) {
      if (c === '\\' && i + 1 < text.length) {
        out += text[i + 1] === '\n' ? '_\n' : '__';
        i += 1;
      } else if (c === quote || c === '\n') {
        quote = null;
        out += c;
      } else {
        out += '_';
      }
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      out += c;
      continue;
    }
    const block = c === '/' && text[i + 1] === '*';
    const line = c === '/' && text[i + 1] === '/' && !/url\(\s*$/i.test(out);
    if (block || line) {
      const end = block ? text.indexOf('*/', i + 2) : text.indexOf('\n', i);
      const stop = end === -1 ? text.length : block ? end + 2 : end;
      out += text.slice(i, stop).replace(/[^\n]/g, ' ');
      i = stop - 1;
      continue;
    }
    out += c;
  }
  return out;
}

/**
 * `@use`, `@forward` and `@import` targets in a stylesheet — only at a statement start, never in a
 * comment, and never inside a string. Every target of an `@import`, not the first: Sass takes
 * `@import 'a', 'b';` and CSS takes an unquoted `url(...)`. Only the first of a `@use` or
 * `@forward`, whose later strings are configuration: `@use 'theme' with ($label: 'x')`.
 * @param {string} text
 */
export function styleSpecifiers(text) {
  const mask = maskStylesheet(text);
  const statement = /(?:^|[;{}])\s*@(use|forward|import)\b([^;{}]*)/dg;
  const target = /url\(\s*(['"]?)([^'")\s]+)\1\s*\)|(['"])([^'"\n]*)\3/dg;
  const found = [];
  for (const s of mask.matchAll(statement)) {
    const [from, to] = s.indices[2];
    for (const t of mask.slice(from, to).matchAll(target)) {
      const span = t.indices[2] ?? t.indices[4];
      found.push(text.slice(from + span[0], from + span[1]).replace(/^~/, ''));
      if (s[1] !== 'import') break;
    }
  }
  return found;
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
 *
 * Symbolic links are not followed: a tracked `apps/vendor -> ../node_modules` would otherwise
 * make installed packages count as our source and every dependency look referenced.
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
      const stat = lstatSync(full);
      if (stat.isSymbolicLink()) continue;
      if (stat.isDirectory()) {
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
 * `[name, kind, text, expected]`. Ten of the first thirteen `false` rows were `true` under the regex
 * this replaced, and five of the eleven `true` rows were `false` under it: it never saw a triple-slash
 * type reference, and no stylesheet import at the start of a line, because `\b@use` needs a word
 * character before the `@`. The `true` rows also keep the parser from passing the `false` ones by
 * finding nothing at all.
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
  ['statement start inside a string', 'style', `.a { content: "; @import '${DEP}/x';"; }\n`, false],
  ['commented-out import target', 'style', `@import 'a', /* '${DEP}' */ 'b';\n`, false],
  ['@use configuration value', 'style', `@use 'theme' with ($label: '${DEP}');\n`, false],
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
  ['// inside a string is not a comment', 'style', `$marker: "//"; @use '${DEP}/theming';\n`, true],
  ['second target after a url()', 'style', `@import url(//cdn.example/x.css), '${DEP}/y';\n`, true],
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
  failures.push(...symlinkControl());
  return failures;
}

/**
 * On disk, because the walk is the subject: a real file importing `other-dep` must be found, and
 * a symlinked directory full of `fixture-dep` imports must not.
 * @returns {string[]}
 */
function symlinkControl() {
  const root = mkdtempSync(join(tmpdir(), 'module-references-'));
  try {
    mkdirSync(join(root, 'apps'));
    mkdirSync(join(root, 'outside'));
    writeFileSync(join(root, 'apps', 'real.ts'), "import 'other-dep';\n");
    writeFileSync(join(root, 'outside', 'vendor.ts'), `import '${DEP}';\n`);
    symlinkSync(join(root, 'outside'), join(root, 'apps', 'vendor'), 'dir');
    const refs = collectReferences(root, ['apps']);
    if (!referenced('other-dep', refs)) return ['symlink walk: the real file was not read'];
    if (referenced(DEP, refs)) return ['symlink walk: a symlinked directory counted as source'];
    return [];
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

export const CONTROL_COUNT = {
  negative: CONTROLS.filter((c) => !c[3]).length + 1,
  positive: CONTROLS.filter((c) => c[3]).length,
};
