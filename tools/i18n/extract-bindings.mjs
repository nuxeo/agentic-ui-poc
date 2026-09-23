#!/usr/bin/env node
/**
 * Extract prose string literals that live INSIDE Angular binding expressions.
 *
 * `extract.mjs` reads text nodes and plain attribute values. It cannot see
 * `[attr.aria-label]="open() ? 'Collapse' : 'Expand'"`, because to that scanner the attribute
 * value is one expression, not two pieces of English. 122 strings sat in that blind spot and
 * every static check called the file done — they were found by rendering the app under the
 * `zz` pseudo-locale and looking for words that had not been accented, which is the only
 * method that can see a string no catalogue supplies.
 *
 * Literals adjacent to `+` are REPORTED, NOT REWRITTEN. `'Remove ' + tag` is a sentence built
 * from a fragment and a value, and INFO-144 forbids it: the fragment gives a translator no
 * sentence to translate and no way to move the value, which in German or Japanese does not
 * belong where English puts it. The fix is one parameterised string, `'Remove {{ name }}'`,
 * and choosing that wording is an authoring decision rather than a substitution.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const I18N = join(root, 'apps/nuxeo-ui/public/i18n');
const apply = process.argv.includes('--apply');

// Property bindings and interpolations only. An EVENT binding — `(click)="x.set('Hi')"` — is
// a statement, and Angular rejects a pipe in one: `Cannot have a pipe in an action expression`.
// Those need `translate.instant()` in the component, which is a move of the logic and not a
// substitution, so they are reported rather than rewritten.
const BINDING = /\[[\w.$-]+\]="([^"]*)"|\{\{([^}]*)\}\}/g;
// No apostrophe in the body. With one, the class could span the closing quote of one literal
// and the opening quote of the next, so `x ? 'Actual size' : 'Fit to viewer'` matched as a
// single literal reading `Actual size' : 'Fit to viewer` — it rewrote both branches of every
// ternary into one pipe and produced NG5002 on eight files. An apostrophe inside an Angular
// single-quoted string has to be escaped anyway, so excluding it costs nothing.
const LITERAL = /'([A-Z][A-Za-z0-9 ,.&()/?!:-]{2,})'/g;

const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .split('-')
    .slice(0, 6)
    .join('-');

/** `libs/features/search/src/lib/x/y.html` → `search`; `apps/nuxeo-ui/...` → `shell`. */
function namespaceOf(file) {
  const feature = /^libs\/features\/([^/]+)\//.exec(file);
  if (feature) return feature[1];
  const shared = /^libs\/shared\/([^/]+)\//.exec(file);
  if (shared) return shared[1];
  if (file.startsWith('apps/nuxeo-ui/src/app/dashboard')) return 'dashboard';
  if (file.startsWith('apps/nuxeo-ui/src/app/settings')) return 'settings';
  if (file.startsWith('apps/nuxeo-ui')) return 'shell';
  return 'app';
}

const files = execFileSync('git', ['ls-files', '*.html'], { cwd: root, encoding: 'utf8' })
  .split('\n')
  .filter((f) => f.startsWith('apps/') || f.startsWith('libs/'))
  .filter((f) => !f.startsWith('apps/nuxeo-satori-template'));

const catalogue = JSON.parse(readFileSync(join(I18N, 'en.json'), 'utf8'));
const context = JSON.parse(readFileSync(join(I18N, 'en.context.json'), 'utf8'));
const setKey = (dotted, value) => {
  const parts = dotted.split('.');
  let node = catalogue;
  for (const part of parts.slice(0, -1)) node = node[part] ??= {};
  node[parts.at(-1)] = value;
};

let rewritten = 0;
const concatenations = [];
const eventBindings = [];

for (const file of files) {
  const path = join(root, file);
  const before = readFileSync(path, 'utf8');
  const ns = namespaceOf(file);

  for (const m of before.matchAll(/\(\w+\)="([^"]*)"/g)) {
    for (const lm of m[1].matchAll(LITERAL)) eventBindings.push({ file, text: lm[1] });
  }

  const after = before.replace(BINDING, (whole, attrExpr, interpExpr) => {
    const expr = attrExpr ?? interpExpr;
    if (expr === undefined) return whole;

    const patched = expr.replace(LITERAL, (lit, text, offset) => {
      // already a key being piped, or a lookup rather than prose
      if (/\|\s*translate/.test(expr.slice(offset, offset + lit.length + 16))) return lit;
      if (!text.includes(' ') && text.includes('.')) return lit;

      const neighbourhood = expr.slice(Math.max(0, offset - 3), offset + lit.length + 3);
      if (/\+/.test(neighbourhood)) {
        concatenations.push({ file, text });
        return lit;
      }

      const key = `${ns}.${slug(text)}`;
      setKey(key, text);
      context[key] ??=
        `Rendered from an Angular binding in ${file.split('/').at(-1)} — usually one branch of a ` +
        `two-state control, so its opposite is a sibling key. Keep it as short as the English.`;
      rewritten += 1;
      return `('${key}' | translate)`;
    });

    if (patched === expr) return whole;
    return attrExpr !== undefined ? whole.replace(expr, patched) : `{{${patched}}}`;
  });

  if (after !== before && apply) writeFileSync(path, after);
}

if (apply) {
  writeFileSync(join(I18N, 'en.json'), `${JSON.stringify(catalogue, null, 2)}\n`);
  writeFileSync(join(I18N, 'en.context.json'), `${JSON.stringify(context, null, 2)}\n`);
}

console.log(`${rewritten} literal(s) ${apply ? 'rewritten' : 'would be rewritten'}`);
console.log(`${concatenations.length} concatenation(s) left for a human:`);
for (const { file, text } of concatenations) console.log(`  ${file.split('/').at(-1)}  '${text}'`);
console.log(`${eventBindings.length} literal(s) inside event bindings, also for a human:`);
for (const { file, text } of eventBindings) console.log(`  ${file.split('/').at(-1)}  '${text}'`);
