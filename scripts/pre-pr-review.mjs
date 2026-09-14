#!/usr/bin/env node
/**
 * The mechanisable part of a pre-PR review.
 *
 *   node scripts/pre-pr-review.mjs            # the whole working tree's changed files
 *   node scripts/pre-pr-review.mjs --base <ref>
 *   node scripts/pre-pr-review.mjs --all      # every file, not just the diff
 *
 * ## Why these checks and not others
 *
 * Built from the reviewer findings in docs/pr-review-findings.jsonl, classified by *why* they were
 * missed rather than what they were (see the PR Review analysis page). The distribution said
 * something useful: almost none were logic errors. In every case the author understood the
 * problem and wrote code that solved it, and what went wrong was the gap between what the
 * code does and what the author believed it does — invisible from the inside, because the
 * belief is what produced the code.
 *
 * So the checks worth automating are the ones that **compare two artifacts** rather than
 * inspect one. Three classes are mechanisable that way and are implemented here:
 *
 *   silent-failure    (5 findings) an error path that reports success
 *   broken-reference  (1)          a link or path that does not resolve
 *   false-claim       (4, partly)  docs naming a command or file that does not exist
 *
 * The other classes — `proxy-check` (15), `unenforced-guarantee` (12), `stale-prose` (9) —
 * need judgement and live in `.cursor/skills/pre-pr-review/SKILL.md`. They are the majority,
 * which is worth stating plainly: **a green run here is not a review.** It clears the floor
 * so a reader spends their attention on the three classes a grep cannot see.
 */

import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = resolve(import.meta.dirname, '..');
const argv = process.argv.slice(2);
const arg = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
const base = arg('base') ?? 'origin/main';
const all = argv.includes('--all');

/** @type {{file:string,line:number,rule:string,message:string}[]} */
const findings = [];
const report = (file, line, rule, message) => findings.push({ file, line, rule, message });

function git(args) {
  try {
    return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' });
  } catch {
    return '';
  }
}

/**
 * Only what *this* branch changed.
 *
 * `git diff <base>` reports files that differ in either direction, so once the base moves
 * ahead it lists other people's work too — the first run of this file reported three findings
 * in a file the branch had never touched, which is how a tool earns the reputation of being
 * noise. Diffing from the merge base asks the question that was meant: what did I change?
 */
const mergeBase = git(['merge-base', base, 'HEAD']).trim() || base;
const files = (
  all
    ? git(['ls-files']).split('\n')
    : [
        ...git(['diff', '--name-only', `${mergeBase}..HEAD`, '--']).split('\n'),
        ...git(['diff', '--name-only', '--cached']).split('\n'),
        ...git(['diff', '--name-only']).split('\n'),
      ]
)
  .map((f) => f.trim())
  .filter(Boolean)
  .filter((f) => existsSync(resolve(repoRoot, f)) && statSync(resolve(repoRoot, f)).isFile())
  .filter((f, i, a) => a.indexOf(f) === i);

const read = (f) => readFileSync(resolve(repoRoot, f), 'utf8');
const lineOf = (text, index) => text.slice(0, index).split('\n').length;

/**
 * Blank out the *contents* of string and template literals, keeping every offset.
 *
 * Without this the first version of this file flagged its own documentation: the description
 * of the `silent-failure` class contains the text `.catch(() => {})`, and a regex over raw
 * source cannot tell a code pattern from a sentence about one. A checker that fires on its
 * own prose is a checker people switch off.
 *
 * Comments are deliberately left intact — the rule below reads them to decide whether a
 * swallow was a decision or an oversight.
 */
function maskStrings(text) {
  let out = '';
  let quote = null;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quote) {
      if (c === '\\') {
        out += '  ';
        i += 1;
        continue;
      }
      if (c === quote) {
        quote = null;
        out += c;
        continue;
      }
      out += c === '\n' ? c : ' ';
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      quote = c;
      out += c;
      continue;
    }
    out += c;
  }
  return out;
}

// ---------------------------------------------------------------- silent-failure

/**
 * An error path that reports success.
 *
 * Five findings, and two of them were the *same* flaw in a sibling call that had been fixed
 * one round earlier — a `curl` in an upload helper and a `curl` in the remote-link POST. That
 * is the argument for a grep rather than a habit.
 */
function silentFailure(file) {
  const text = read(file);
  const code = maskStrings(text);

  // Shell and docs only. In JavaScript a `curl …` is inside a string, and the masking above
  // is what stops that being reported — but the command it documents is still worth checking
  // when it appears in a fenced block, which is how the skills ship theirs.
  const curls = /\.(sh|md|mdc)$/.test(file)
    ? [...text.matchAll(/curl\s+(-[A-Za-z-]+\s+|--[a-z-]+(=\S+)?\s+)*[^\n]*/g)]
    : [];
  for (const m of curls) {
    const cmd = m[0];
    const writes = /-X\s*(POST|PUT|PATCH|DELETE)|(^|\s)(-F|--form|-d|--data)\b/.test(cmd);
    const guarded = /--fail\b|--fail-with-body\b|-w\s*['"]?%\{http_code\}|write-out/.test(cmd);
    if (writes && !guarded) {
      report(
        file,
        lineOf(text, m.index),
        'silent-failure',
        'curl writes but cannot fail: `-s` exits 0 on HTTP 4xx/5xx. Add --fail-with-body, or capture %{http_code} and branch on it.',
      );
    }
  }

  // A rejection swallowed whole. An empty handler discards the reason as well as the failure.
  for (const m of code.matchAll(
    /\.catch\(\s*\(\s*\)\s*=>\s*(\{\s*\}|null|undefined|void 0)\s*\)/g,
  )) {
    const line = lineOf(code, m.index);
    const context = text
      .split('\n')
      .slice(Math.max(0, line - 4), line)
      .join('\n');
    // A comment saying why is the difference between a decision and an oversight.
    if (!/\/\/|\/\*/.test(context)) {
      report(
        file,
        line,
        'silent-failure',
        'empty `.catch()` with no comment: the failure and its reason are both discarded. Handle it, or say in a comment why losing it is correct.',
      );
    }
  }
}

// ---------------------------------------------------------------- broken-reference

/** A relative link that does not resolve. One finding, and it shipped in four places at once. */
function brokenReference(file) {
  if (!file.endsWith('.md')) return;
  const text = read(file);
  for (const m of text.matchAll(/\]\((\.\.?\/[^)\s#]+)/g)) {
    const target = resolve(repoRoot, dirname(file), m[1]);
    if (!existsSync(target)) {
      report(file, lineOf(text, m.index), 'broken-reference', `link does not resolve: ${m[1]}`);
    }
  }
}

// ---------------------------------------------------------------- false-claim

/**
 * Docs naming something that does not exist.
 *
 * Partial cover for `false-claim`: it cannot tell whether prose is *true*, but it can tell
 * whether the command it tells you to run is real. Four findings were claims contradicted by
 * the tree, including a PR body citing a file that had never been changed.
 */
let pkgScripts = null;
function falseClaim(file) {
  if (!/\.(md|mdc)$/.test(file)) return;
  const text = read(file);
  pkgScripts ??= Object.keys(JSON.parse(read('package.json')).scripts ?? {});

  for (const m of text.matchAll(/npm run ([a-z0-9:._-]+)/gi)) {
    if (!pkgScripts.includes(m[1])) {
      report(
        file,
        lineOf(text, m.index),
        'false-claim',
        `\`npm run ${m[1]}\` is not a script in package.json`,
      );
    }
  }
  for (const m of text.matchAll(/(?:^|[\s`(])(scripts\/[A-Za-z0-9/._-]+\.(?:mjs|sh|js))/g)) {
    if (!existsSync(resolve(repoRoot, m[1]))) {
      report(
        file,
        lineOf(text, m[1] ? m.index : 0),
        'false-claim',
        `references a file that does not exist: ${m[1]}`,
      );
    }
  }
}

// ---------------------------------------------------------------- run

const CHECKS = [silentFailure, brokenReference, falseClaim];
const scanned = files.filter(
  (f) => /\.(mjs|js|ts|sh|md|mdc)$/.test(f) && !f.startsWith('node_modules/'),
);

for (const f of scanned) {
  for (const check of CHECKS) {
    try {
      check(f);
    } catch (err) {
      report(f, 0, 'internal', `check ${check.name} threw: ${err.message}`);
    }
  }
}

console.log(
  `\npre-PR review — ${scanned.length} changed file(s) ${all ? 'across the whole tree' : `since ${mergeBase.slice(0, 8)}`}\n`,
);

if (findings.length) {
  const byRule = findings.reduce(
    (acc, f) => ({ ...acc, [f.rule]: [...(acc[f.rule] ?? []), f] }),
    {},
  );
  for (const [rule, list] of Object.entries(byRule)) {
    console.log(`  ${rule} — ${list.length}`);
    for (const f of list) console.log(`    ${f.file}:${f.line}\n      ${f.message}`);
    console.log('');
  }
}

console.log(
  findings.length
    ? `FAIL — ${findings.length} finding(s)\n`
    : 'pass — no mechanisable defect found\n',
);
console.log(
  '  This clears the floor; it is not a review. The three largest classes — proxy-check,\n' +
    '  unenforced-guarantee and stale-prose — need judgement, and are the majority of\n' +
    '  everything recorded. Work through\n' +
    '  .cursor/skills/pre-pr-review/SKILL.md before opening the PR.\n',
);

process.exit(findings.length ? 1 : 0);
