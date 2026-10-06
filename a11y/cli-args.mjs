/**
 * The argument contract for `run.mjs` — everything it decides about an argv before it spawns
 * anything.
 *
 * Separate from `run.mjs` so it can be imported and asserted. It could not be before: that
 * file dispatches on import, so a test could only reach this logic by spawning it, and the
 * cases worth covering are the ones where a wrong answer is silent — a narrowed scan that
 * writes no report, or a `--project` that runs another suite past the wrong preflight.
 * `cli-args.selftest.mjs` covers them; `run.mjs selftest` runs it. Nothing in CI does, for
 * the same reason nothing type-checks this folder — see `README.md`. Flagged in review on
 * PR #225.
 *
 * Pure: no I/O, no `process.exit`. `run.mjs` owns the messages and the exit codes, because
 * what a bad argv should COST is a dispatcher decision, and this file only says what it is.
 */

/**
 * The title of the test that writes the consolidated report, in the three suites that emit
 * one. `journey` is absent on purpose: each of its screens emits its own report inside its own
 * test, so narrowing that suite still produces the report for what ran.
 */
export const REPORT_TEST_TITLE = 'emits the consolidated report';
export const CONSOLIDATED_REPORT_SUITES = new Set(['surfaces', 'states', 'modes']);

/**
 * Suites that emit a report per screen instead of one consolidated one.
 *
 * Separate from "everything that is not consolidated", which also contains the diagnostics,
 * `typecheck` and `preflight` — none of which write a report at all, and so cannot be told
 * not to.
 */
export const PER_SCREEN_REPORT_SUITES = new Set(['journey']);

/** Ours, not Playwright's — `mergeArgs` removes it, so it must never reach the runner. */
export const NO_REPORT = '--no-report';

/** Playwright's include and exclude grep flags, long form and short alias alike. */
export const GREP_INCLUDE_FLAGS = ['--grep', '-g'];
export const GREP_EXCLUDE_FLAGS = ['--grep-invert', '-G'];
/** Every flag that filters tests by title. */
export const TITLE_FILTER_FLAGS = [...GREP_INCLUDE_FLAGS, ...GREP_EXCLUDE_FLAGS];

/**
 * A grep pattern written as a regex literal, `/body/flags`.
 *
 * Only `g` and `i`, because that is the character class `forceRegExp` uses — `/foo/m` is not
 * the literal form to Playwright, it is the pattern `/foo/m` compiled as text.
 */
const SLASH_FORM = /^\/(.*)\/([gi]*)$/;

/**
 * Merge the command's own argv with whatever the caller appended.
 *
 * `--project` needs special handling and this was found the hard way: Playwright treats
 * repeated `--project` flags as a UNION, so `journey --project=journey-01-login` ran the
 * wildcard AND the named screen — every screen, when one was asked for. A caller naming a project
 * is narrowing, never widening, so their flag replaces ours rather than joining it.
 *
 * `--no-report` is ours and is dropped here: Playwright would reject it as an unknown option.
 */
export function mergeArgs(own, extra) {
  const theirs = extra.filter((a) => a !== NO_REPORT);
  const callerPickedProject = theirs.some((a) => a === '--project' || a.startsWith('--project='));
  if (!callerPickedProject) return [...own, ...theirs];

  const withoutOurProject = own.filter((a) => !a.startsWith('--project'));
  return [...withoutOurProject, ...theirs];
}

/** Every `--project` value in an argv, in both `--project=x` and `--project x` forms. */
export function projectsIn(argv) {
  return argv.flatMap((a, i) =>
    a.startsWith('--project=')
      ? [a.slice('--project='.length)]
      : a === '--project'
        ? [argv[i + 1] ?? '']
        : [],
  );
}

/**
 * The caller's `--project` values that fall outside this command's own scope.
 *
 * `mergeArgs` REPLACES the command's project with the caller's, on the assumption that a
 * caller is narrowing. Nothing enforced that. `states --project=journey-01-login` ran the login
 * suite under the `states` command, and `journey --project=surfaces` ran the surfaces suite
 * past a preflight that had not checked administration access, because that check is chosen
 * per command. Flagged in review on PR #225.
 *
 * A caller value is in scope when the command's own project pattern (`surfaces`, or a wildcard
 * such as `journey-*`) matches it as text — so `journey --project=journey-01-login` and
 * `journey --project=journey-*` are accepted, and anything else is refused.
 *
 * @param {string[]} own    the command's argv
 * @param {string[]} extra  what the caller appended
 * @returns {string[]}
 */
export function projectsOutOfScope(own, extra) {
  const ownPatterns = projectsIn(own);
  if (ownPatterns.length === 0) return [];
  const matchers = ownPatterns.map(
    (p) => new RegExp(`^${p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`),
  );
  return projectsIn(extra).filter((value) => !matchers.some((m) => m.test(value)));
}

/**
 * Pull the value Playwright would act on for any of `flags` out of `extra`, returning what is
 * left alongside what was found.
 *
 * One parser shared by `refusedTitleFilter` and `valuelessTitleFilter` (which read `found`)
 * and `suppressReportTest` (which needs `rest` too, to rebuild the arg list around its own
 * `--grep-invert`). Two copies of this parsing drifted apart once already — flagged in
 * review on PR #225 as "duplicated almost verbatim" — so there is one now.
 *
 * Every form Playwright's commander accepts, confirmed against `playwright test --list`
 * rather than assumed, because the first version of this guard missed two of them:
 *
 * - `--grep value` and `-g value`
 * - `--grep=value` — long flags only
 * - `-gvalue` — the attached short form. Commander takes everything after the two characters
 *   verbatim, so `-g=value` is the pattern `=value`, matching nothing. Reproduced: `-g=column
 *   picker` lists 0 tests, where `-gcolumn picker` lists 1.
 *
 * Occurrences are returned in order. The LAST is the live one: repeated greps override rather
 * than combine — `-G "column picker" -G "<report title>"` drops the report test and `-G
 * "<report title>" -G "column picker"` keeps it. The comment here used to say Playwright
 * intersected them, and the guard refused runs Playwright would have run.
 *
 * A value may be `undefined` (`--grep-invert` last, with nothing after it) or `''`
 * (`--grep-invert=`). Both are reported rather than quietly dropped: dropping a valueless
 * flag deleted a malformed invocation Playwright would have rejected, and for an include it
 * was worse — `--no-report --grep` left `--grep` in `rest`, where it swallowed the
 * `--grep-invert` this file appends as its value. Flagged in review on PR #225.
 *
 * @param {string[]} extra
 * @param {string[]} flags  one long form and its short alias, e.g. `['--grep', '-g']`
 * @returns {{ rest: string[], found: { flag: string, value: string | undefined }[] }}
 */
export function stripFlagOccurrences(extra, flags) {
  const rest = [];
  const found = [];
  for (let i = 0; i < extra.length; i++) {
    const arg = extra[i];
    if (flags.includes(arg)) {
      found.push({ flag: arg, value: extra[i + 1] });
      i++;
      continue;
    }
    const longFlag = flags.find((f) => f.startsWith('--') && arg.startsWith(`${f}=`));
    if (longFlag) {
      found.push({ flag: longFlag, value: arg.slice(longFlag.length + 1) });
      continue;
    }
    const shortFlag = flags.find((f) => !f.startsWith('--') && arg.startsWith(f) && arg !== f);
    if (shortFlag) {
      found.push({ flag: shortFlag, value: arg.slice(shortFlag.length) });
      continue;
    }
    rest.push(arg);
  }
  return { rest, found };
}

/**
 * The first title-filter flag the caller passed without a usable pattern, or `undefined`.
 *
 * A missing value is a malformed command line: Playwright's own parser rejects it, and this
 * file must not silently repair it. An empty one (`--grep ""`, typically an unset shell
 * variable) Playwright accepts and then ignores, which is worse than an error — the run
 * reads as filtered and scans everything.
 */
export function valuelessTitleFilter(extra) {
  return stripFlagOccurrences(extra, TITLE_FILTER_FLAGS).found.find(
    ({ value }) => value === undefined || value === '',
  )?.flag;
}

/**
 * The title-filter flag to refuse on a suite whose deliverable is one consolidated report.
 *
 * `--grep` applies to every test title, including the one that calls `generateReport()`. So
 * `states --grep "column picker"` scanned one state, passed, and wrote **no report** — the
 * suite's actual deliverable — while reading like a successful run. This was a documented
 * example in `usage()`. Flagged in review on PR #225.
 *
 * **Any** title filter is refused, rather than only one computed to drop the report test.
 * There is no narrowing of these three suites that leaves a passing report behind, so there
 * is nothing to let through: the report test asserts that every state in `INTERACTION_STATES`
 * recorded a scan slice, so a filter either removes that test (no report, silently) or keeps
 * it and fails it (no report, loudly). `--no-report` is the way to say which you meant.
 *
 * This replaced a guard that compared each pattern against `REPORT_TEST_TITLE` with a copy of
 * Playwright's `forceRegExp`. It was wrong for a reason no amount of regex fidelity fixes:
 * Playwright greps `test._grepTitleWithTags()`, the whole title path and tags joined by
 * spaces, not the leaf title. An anchored pattern matched the bare constant and not the real
 * title, so `states --grep "column picker|^emits the consolidated report$"` was allowed and
 * then wrote no report. Reproduced before and after. Flagged in review on PR #225; matching
 * titles at all was the defect, so the matching is gone rather than corrected.
 *
 * `--grep` with the `journey` command is untouched and remains the way to scan one screen and
 * still get a report, because each of its screens emits its own.
 *
 * @param {string} name   the command
 * @param {string[]} extra  what the caller appended
 * @returns {string | undefined} the offending flag
 */
export function refusedTitleFilter(name, extra) {
  if (!CONSOLIDATED_REPORT_SUITES.has(name)) return undefined;
  if (extra.includes(NO_REPORT)) return undefined;
  return stripFlagOccurrences(extra, TITLE_FILTER_FLAGS).found[0]?.flag;
}

/**
 * Actually exclude the report test when the caller asked for `--no-report`, instead of only
 * warning about it. Before this, `--no-report` told `mergeArgs` to strip itself and nothing
 * else, so `states --no-report` still ran and wrote the report it claimed to skip.
 *
 * Playwright applies `--grep` and `--grep-invert` together — a test must match the include
 * pattern AND not match the exclude one — so adding our own exclusion is additive, not a
 * replacement: a caller's own `--grep-invert`/`-G` is unioned with the report test's title
 * rather than discarded. Flagged in review on PR #225.
 *
 * `journey` is exempt: it is not in `CONSOLIDATED_REPORT_SUITES`, so this returns `extra`
 * unchanged for it, since each of its screens emits its own report.
 *
 * @param {string} name   the command
 * @param {string[]} extra  what the caller appended
 * @returns {string[]}
 */
export function suppressReportTest(name, extra) {
  if (!CONSOLIDATED_REPORT_SUITES.has(name)) return extra;
  if (!extra.includes(NO_REPORT)) return extra;
  const { rest, found } = stripFlagOccurrences(extra, GREP_EXCLUDE_FLAGS);
  // The LAST occurrence, because repeated greps override rather than combine: `-G a -G b`
  // drops only what `b` matches, so `a` is already dead and unioning it would revive it.
  // Verified against `playwright test --list`, both orders.
  const theirs = found.at(-1)?.value;
  return [...rest, '--grep-invert', alsoExcluding(theirs, REPORT_TEST_TITLE)];
}

/**
 * One `--grep-invert` pattern that excludes `title` as well as whatever the caller excluded.
 *
 * It has to be one, because a repeated `--grep-invert` overrides rather than unions — so
 * appending ours would have silently discarded theirs.
 *
 * A plain `|` join is enough to keep both sides intact — alternation binds loosest, so an
 * exclude of `^a` stays anchored to its own branch and does not anchor ours.
 *
 * The slash form is rebuilt AS a slash form, carrying the caller's own flags, rather than
 * flattened into the default case-insensitive compile: flattening `/Column Picker/` would
 * have widened their exclusion to titles they never asked to drop. Keeping their flags
 * leaves our branch case-SENSITIVE too, which is exact here and only here — `title` is a
 * literal copied from the `test()` call, not a pattern.
 */
export function alsoExcluding(theirs, title) {
  if (theirs === undefined) return title;
  const literal = theirs.match(SLASH_FORM);
  return literal ? `/${literal[1]}|${title}/${literal[2]}` : `${theirs}|${title}`;
}
