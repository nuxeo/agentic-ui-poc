#!/usr/bin/env node
/**
 * Re-derive the error-state classes from the templates and fail when the lists have drifted.
 *
 * ## Why this exists
 *
 * `ERROR_STATE_SELECTOR` is what stops every scan and diagnostic in this folder from
 * measuring an error panel and reporting it as a clean surface. It was written by hand, its
 * comment claimed it had been collected from the templates, and it was missing twenty
 * classes. One of them was `.widget-error`, which the dashboard renders in four places: a
 * dashboard whose widgets had all failed showed four error messages, matched nothing in the
 * list, had plenty of text, and passed `expectSurfaceUsable` cleanly. Found in review on
 * PR #225, not by anything here.
 *
 * A hand-maintained list of classes that live in someone else's templates does not stay
 * correct. The only durable fix is to derive it, and the only way to derive it without a
 * shared error component to key on is to sweep for the name and require every match to have
 * been classified — either as a surface failure or as a documented exception.
 *
 * So the check is not "are these classes still present". It is **"has anything appeared that
 * nobody has judged"**. That is the question whose answer went stale.
 *
 * ## What it cannot do
 *
 * It matches on the string `error` (and `failed`/`failure`). A feature that names its error
 * panel `.load-problem` is invisible to it, and no sweep can fix that. It narrows the gap to
 * the naming convention this codebase actually follows; it does not close it.
 *
 * Exits 1, not 2: a drifted list is a code change in this repository, not an environment
 * problem, so the caller should fix the list rather than the machine. It takes no arguments,
 * and an invocation with any exits 2 before checking anything (see `../cli.mjs`).
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseCliOrExit } from '../cli.mjs';
import { ERROR_STATE_CLASSES, NOT_A_SURFACE_ERROR } from '../surface.mjs';

parseCliOrExit('error-class-drift', {});

const repoRoot = resolve(import.meta.dirname, '..', '..');

/**
 * Only the application this folder scans.
 *
 * `apps/nuxeo-satori-template` is a separate reference app on its own routes, reachable from
 * no journey here, and it has error classes of its own. Sweeping it would demand
 * classifications for surfaces nothing measures.
 */
const TEMPLATE_GLOBS = ['apps/nuxeo-ui/**/*.html', 'libs/features/**/*.html', 'libs/shared/**/*.html'];

const LOOKS_LIKE_ERROR = /error|failed|failure/i;

/** Static `class="a b c"` and Angular's `[class.name]="expr"`, which the static form misses. */
function classesIn(source) {
  const found = new Set();
  for (const m of source.matchAll(/class\s*=\s*"([^"]*)"/g)) {
    for (const cls of m[1].split(/\s+/)) {
      // Interpolated names (`class="x-{{ y }}"`) cannot be resolved statically; skip rather
      // than demand a classification for a string that is not a class.
      if (cls && !cls.includes('{') && !cls.includes('(')) found.add(cls);
    }
  }
  for (const m of source.matchAll(/\[class\.([a-zA-Z0-9_-]+)\]/g)) found.add(m[1]);
  return found;
}

const files = execFileSync('git', ['ls-files', ...TEMPLATE_GLOBS], {
  cwd: repoRoot,
  encoding: 'utf8',
})
  .split('\n')
  .filter(Boolean);

if (files.length === 0) {
  console.error('error-class drift: git ls-files matched no templates — the globs are wrong.');
  process.exit(1);
}

/** class -> the files that render it. */
const inTemplates = new Map();
for (const file of files) {
  for (const cls of classesIn(readFileSync(resolve(repoRoot, file), 'utf8'))) {
    if (!LOOKS_LIKE_ERROR.test(cls)) continue;
    if (!inTemplates.has(cls)) inTemplates.set(cls, []);
    inTemplates.get(cls).push(file);
  }
}

const classified = new Set([...ERROR_STATE_CLASSES, ...Object.keys(NOT_A_SURFACE_ERROR)]);

const unclassified = [...inTemplates.keys()].filter((c) => !classified.has(c)).sort();

/**
 * The other direction: a class listed here that no template renders any more.
 *
 * Reported as drift rather than ignored. A stale entry is harmless to a scan but it is
 * evidence the list is not being maintained against the templates, and it makes the next
 * person trust a list that has quietly stopped describing the application.
 */
const orphaned = [...classified].filter((c) => !inTemplates.has(c)).sort();

console.log(
  `error-class drift: ${files.length} templates, ${inTemplates.size} error-ish classes, ` +
    `${ERROR_STATE_CLASSES.length} treated as surface failures, ` +
    `${Object.keys(NOT_A_SURFACE_ERROR).length} documented exceptions`,
);

if (unclassified.length === 0 && orphaned.length === 0) {
  console.log('  lists match the templates');
  process.exit(0);
}

if (unclassified.length > 0) {
  console.error(
    `\n${unclassified.length} class(es) appear in a template but in neither list.\n` +
      'Until one of them claims it, a surface showing it scans as clean.\n',
  );
  for (const cls of unclassified) {
    console.error(`  .${cls}`);
    for (const f of inTemplates.get(cls)) console.error(`      ${f}`);
  }
  console.error(
    '\nAdd each to ERROR_STATE_CLASSES in a11y/surface.mjs if it means the surface failed\n' +
      'to load, or to NOT_A_SURFACE_ERROR with the reason it does not.\n',
  );
}

if (orphaned.length > 0) {
  console.error(`\n${orphaned.length} classified class(es) are in no template any more:\n`);
  for (const cls of orphaned) console.error(`  .${cls}`);
  console.error('\nRemove them from a11y/surface.mjs.\n');
}

process.exit(1);
