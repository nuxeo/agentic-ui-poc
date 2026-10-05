#!/usr/bin/env node
/**
 * Slice 0 of the full i18n extraction: move inline `template:` and `styles:` blocks into
 * sibling `.html` and `.scss` files.
 *
 * ## Why this is an i18n change
 *
 * Twenty components hold their markup in template literals. Three things follow, and only the
 * last is obvious:
 *
 *   - `checkNoHardcodedUiText` reads `.html` files, so roughly **116 user-facing strings inside
 *     those literals are invisible to it**. They are mostly dialogs — confirm prompts, permission
 *     forms, publish and version dialogs — which is exactly where the prose lives.
 *   - The extraction codemod would need a second code path to reach them, parsing TypeScript to
 *     find markup. One code path over real `.html` is less to get wrong.
 *   - `CLAUDE.md` has required `templateUrl` all along, so this is a standing violation rather
 *     than a new rule invented for this work.
 *
 * ## Safety
 *
 * Every template was checked first for `${}` interpolation and escaped backticks — a template
 * literal containing either cannot move to `.html` without changing meaning. **All twenty are
 * plain literals**, so the move is verbatim: the bytes between the backticks are written to the
 * file unchanged apart from indentation stripping and a trailing newline.
 *
 * `styles:` moves too. The theme-token guardrail already special-cases inline style blocks and
 * its failure message says moving them to a sibling file "is the convention and is also what
 * makes the rest of the tooling able to see it".
 *
 * Idempotent: a component already using `templateUrl` is skipped.
 *
 * Usage:
 *   node tools/i18n/inline-to-files.mjs --dry-run
 *   node tools/i18n/inline-to-files.mjs
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const dryRun = process.argv.includes('--dry-run');
const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();

/**
 * The contents of a `key: \`…\`` or `key: [\`…\`]` template literal.
 *
 * Hand-scanned rather than regexed, because a template contains backticks' worst enemy —
 * arbitrary HTML with quotes, braces and newlines — and a lazy regex would stop at the first
 * apparent terminator. Escapes are honoured so `\\\`` inside a literal does not end it.
 *
 * @returns {{ text: string, start: number, end: number, bracketed: boolean } | null}
 */
function literalBlock(body, key) {
  const opener = new RegExp(`(^|\\s)${key}\\s*:\\s*(\\[\\s*)?\``, 'm');
  const match = opener.exec(body);
  if (!match) return null;

  const bracketed = Boolean(match[2]);
  let cursor = match.index + match[0].length;

  /** Scans forward from `from` to the backtick that closes the literal starting there. */
  const closingBacktick = (from) => {
    let i = from;
    while (i < body.length) {
      if (body[i] === '\\') {
        i += 2;
        continue;
      }
      if (body[i] === '`') return i;
      i += 1;
    }
    return -1;
  };

  // A `styles: [...]` array may hold MORE THAN ONE literal, and two components do. Taking only
  // the first left the second orphaned in the decorator and broke both files with
  // `Parsing error: Property assignment expected` — found by lint, not by reading the diff.
  // Every literal in the array is collected and concatenated into one stylesheet, which is what
  // Angular does with them anyway.
  const parts = [];
  let i = closingBacktick(cursor);
  if (i === -1) return null;
  parts.push(body.slice(cursor, i));

  if (bracketed) {
    for (;;) {
      let probe = i + 1;
      while (probe < body.length && /[\s,]/.test(body[probe])) probe += 1;
      if (body[probe] !== '`') break;
      cursor = probe + 1;
      const next = closingBacktick(cursor);
      if (next === -1) break;
      parts.push(body.slice(cursor, next));
      i = next;
    }
  }

  // Consume whatever closes the property, so the whole thing can be replaced in one go.
  //
  // The order is not fixed. Prettier formats a single-element styles array as
  //
  //     styles: [
  //       `…`,
  //     ],
  //
  // so after the closing backtick comes a comma, then the `]`, then another comma — and an
  // earlier version of this looked for the `]` first, consumed the comma instead, and left a
  // stray `],` behind that broke three files with `Parsing error: Property assignment
  // expected`. Accepting the punctuation in any order costs nothing and removes the ordering
  // assumption entirely.
  let end = i + 1;
  const skipSpace = () => {
    while (end < body.length && /\s/.test(body[end])) end += 1;
  };
  if (bracketed) {
    skipSpace();
    if (body[end] === ',') end += 1;
    skipSpace();
    if (body[end] === ']') end += 1;
  }
  if (body[end] === ',') end += 1;

  return {
    text: parts.join('\n\n'),
    start: match.index + (match[1] ? match[1].length : 0),
    end,
    bracketed,
  };
}

/** Strips the common leading indentation a template literal picks up from its nesting. */
function dedent(text) {
  const lines = text.replace(/^\n/, '').replace(/\s+$/, '').split('\n');
  const indents = lines.filter((line) => line.trim()).map((line) => line.match(/^ */)[0].length);
  const common = indents.length ? Math.min(...indents) : 0;
  return `${lines.map((line) => line.slice(common)).join('\n')}\n`;
}

const tracked = execFileSync('git', ['ls-files', '*.ts'], { cwd: repoRoot, encoding: 'utf8' })
  .split('\n')
  .filter((file) => /^(apps|libs)\//.test(file) && !file.includes('.spec.'));

let moved = 0;
const report = [];

for (const file of tracked) {
  const path = join(repoRoot, file);
  let body = readFileSync(path, 'utf8');
  if (!/template:\s*`/.test(body)) continue;

  const stem = basename(file, '.ts');
  const dir = dirname(path);
  const changes = [];

  for (const [key, extension, property] of [
    ['template', 'html', 'templateUrl'],
    ['styles', 'scss', 'styleUrl'],
  ]) {
    const block = literalBlock(body, key);
    if (!block) continue;
    if (block.text.includes('${') || block.text.includes('\\`')) {
      report.push(`SKIP ${file}: ${key} contains interpolation or an escaped backtick`);
      continue;
    }

    const target = join(dir, `${stem}.${extension}`);
    if (existsSync(target)) {
      report.push(`SKIP ${file}: ${basename(target)} already exists`);
      continue;
    }

    if (!dryRun) writeFileSync(target, dedent(block.text));
    body = `${body.slice(0, block.start)}${property}: './${stem}.${extension}',${body.slice(block.end)}`;
    changes.push(`${key} -> ${basename(target)}`);
  }

  if (changes.length) {
    if (!dryRun) writeFileSync(path, body);
    moved += 1;
    report.push(`${file}\n    ${changes.join('\n    ')}`);
  }
}

console.log(report.join('\n'));
console.log(`\n${dryRun ? '[dry run] ' : ''}${moved} component(s) moved to sibling files.`);
