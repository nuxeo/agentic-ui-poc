/**
 * Strict argument parsing for every Node script in this folder.
 *
 * Each script used to read `process.argv` by hand, and each accepted invocations it could not
 * honour without saying so. `axe-differential --json --surface browse` took `--surface` as the
 * output path; `--surfac browse` was ignored and every surface was scanned; a misspelt
 * `--negative-control` silently skipped the control that makes the reflow probe's numbers mean
 * anything; and the diagnostics that take no arguments at all accepted any. Flagged in review
 * on PR #225.
 *
 * `util.parseArgs` in strict mode refuses unknown options, positionals, a missing value, and a
 * value that looks like another option. A refused invocation exits **2** — nothing was
 * measured — before any browser launches or request is sent, never 0 or the 1 of a finding.
 */

import { parseArgs } from 'node:util';

/**
 * @template {import('node:util').ParseArgsConfig['options']} Options
 * @param {string} tool     the script's name, so the message says who refused
 * @param {Options} options the accepted options; `{}` for a script that takes none
 */
export function parseCliOrExit(tool, options) {
  try {
    return parseArgs({
      args: process.argv.slice(2),
      options,
      strict: true,
      allowPositionals: false,
    }).values;
  } catch (err) {
    const accepted = Object.entries(options ?? {}).map(
      ([name, o]) =>
        `--${name}${o.type === 'string' ? ' <value>' : ''}${o.multiple ? ' (repeatable)' : ''}`,
    );
    console.error(
      `${tool}: ${err instanceof Error ? err.message : String(err)}\n` +
        `  Accepted: ${accepted.length > 0 ? accepted.join(', ') : 'no arguments'}. Nothing was run.`,
    );
    process.exit(2);
  }
}
