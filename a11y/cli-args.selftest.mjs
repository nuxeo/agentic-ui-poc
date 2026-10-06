/**
 * Controls for the argument contract in `cli-args.mjs`.
 *
 * Why this file exists: `run.mjs` decides which 20-to-70-minute suite runs and what it
 * reports, and every defect found in it during review on PR #225 was SILENT — a narrowed
 * scan that wrote no report, a `--project` that ran another suite past the wrong preflight,
 * a `--no-report` that reported anyway. None of them failed; they all produced a green run
 * that measured less than it claimed. Those are the cases below.
 *
 * Every expectation about Playwright's own parsing here was confirmed against
 * `playwright test --list` before being written down, not inferred from its source. The ones
 * that are easy to get backwards are marked.
 *
 * Run with `node a11y/run.mjs selftest`. Nothing in CI runs it — see `README.md`.
 */
import {
  alsoExcluding,
  mergeArgs,
  projectsOutOfScope,
  refusedTitleFilter,
  stripFlagOccurrences,
  suppressReportTest,
  valuelessTitleFilter,
  GREP_EXCLUDE_FLAGS,
  REPORT_TEST_TITLE,
  TITLE_FILTER_FLAGS,
} from './cli-args.mjs';

const failures = [];
let passed = 0;

/** @param {string} label @param {unknown} actual @param {unknown} expected */
function equals(label, actual, expected) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a === b) {
    passed += 1;
    return;
  }
  failures.push(`${label}\n      expected ${b}\n      got      ${a}`);
}

const T = REPORT_TEST_TITLE;

// ---------------------------------------------------------------------------------------
// stripFlagOccurrences — every form Playwright's commander accepts.
// ---------------------------------------------------------------------------------------

const values = (extra, flags = TITLE_FILTER_FLAGS) =>
  stripFlagOccurrences(extra, flags).found.map((f) => f.value);

equals('separated value', values(['--grep', 'a']), ['a']);
equals('attached long value', values(['--grep=a']), ['a']);
equals('separated short value', values(['-g', 'a']), ['a']);
// The form the first guard missed entirely, so `states -gcolumn picker` scanned one state
// and wrote no report.
equals('attached short value', values(['-ga']), ['a']);
// Commander takes everything after the two characters verbatim, so this is the pattern
// "=a", which matches no title. Reproduced: `-g=column picker` lists 0 tests.
equals('attached short value keeps a leading =', values(['-g=a']), ['=a']);
equals('a missing value is reported, not dropped', values(['--grep']), [undefined]);
equals('an empty value is reported, not dropped', values(['--grep=']), ['']);
equals('occurrences are returned in order', values(['--grep', 'a', '-G', 'b']), ['a', 'b']);
equals('unrelated arguments are left alone', stripFlagOccurrences(['--headed'], TITLE_FILTER_FLAGS).rest, [
  '--headed',
]);
equals(
  'the flag and its value are both removed from rest',
  stripFlagOccurrences(['--headed', '-G', 'a', '--workers=1'], GREP_EXCLUDE_FLAGS).rest,
  ['--headed', '--workers=1'],
);

// ---------------------------------------------------------------------------------------
// valuelessTitleFilter — a malformed filter must not be silently repaired.
// ---------------------------------------------------------------------------------------

equals('a trailing --grep is refused', valuelessTitleFilter(['--grep']), '--grep');
equals('an empty --grep is refused', valuelessTitleFilter(['--grep', '']), '--grep');
equals('an empty --grep= is refused', valuelessTitleFilter(['--grep=']), '--grep');
equals('a trailing -G is refused', valuelessTitleFilter(['-G']), '-G');
// The one that mattered: --no-report appends a --grep-invert, and a valueless --grep left in
// place swallowed it as its own value.
equals(
  'a valueless --grep alongside --no-report is refused',
  valuelessTitleFilter(['--no-report', '--grep']),
  '--grep',
);
equals('a filter with a value is not refused', valuelessTitleFilter(['--grep', 'a']), undefined);
equals('no filter at all is not refused', valuelessTitleFilter(['--headed']), undefined);

// ---------------------------------------------------------------------------------------
// refusedTitleFilter — any narrowing of a consolidated suite, not just one that looks unsafe.
// ---------------------------------------------------------------------------------------

for (const suite of ['surfaces', 'states', 'modes']) {
  equals(`${suite} refuses --grep`, refusedTitleFilter(suite, ['--grep', 'a']), '--grep');
  equals(`${suite} refuses -G`, refusedTitleFilter(suite, ['-G', 'a']), '-G');
}
// Playwright greps the whole title path, so this anchored pattern does NOT match the real
// title and the report test is dropped. The guard that compared against the bare constant
// matched it and allowed the run.
equals(
  'an anchored pattern that matches only the bare constant is still refused',
  refusedTitleFilter('states', ['--grep', `column picker|^${T}$`]),
  '--grep',
);
// These keep the report test — and it then fails, because the states it asserts were never
// scanned. "Keeps the report test" was never the same as "produces a report".
equals(
  'a filter that keeps the report test is refused too',
  refusedTitleFilter('states', ['--grep', 'consolidated report']),
  '--grep',
);
equals(
  'an exclude that misses the report test is refused too',
  refusedTitleFilter('states', ['--grep-invert', 'column picker']),
  '--grep-invert',
);
equals('--no-report lifts the refusal', refusedTitleFilter('states', ['--grep', 'a', '--no-report']), undefined);
equals('an unfiltered run is not refused', refusedTitleFilter('states', ['--headed']), undefined);
// journey emits a report per screen, so narrowing it still reports.
equals('journey is never refused', refusedTitleFilter('journey', ['--grep', 'a']), undefined);
equals('a diagnostic is never refused', refusedTitleFilter('drift', ['--grep', 'a']), undefined);

// ---------------------------------------------------------------------------------------
// suppressReportTest — --no-report must actually exclude the test, not just claim to.
// ---------------------------------------------------------------------------------------

// `--no-report` itself stays here and is stripped by `mergeArgs`, which is the last hand the
// argv passes through before Playwright sees it. The composition is asserted below.
equals(
  '--no-report appends an exclusion for the report test',
  suppressReportTest('states', ['--no-report']),
  ['--no-report', '--grep-invert', T],
);
equals(
  "the caller's own include survives",
  suppressReportTest('states', ['--no-report', '--grep', 'column picker']),
  ['--no-report', '--grep', 'column picker', '--grep-invert', T],
);
equals(
  "the caller's own exclude is unioned, not discarded",
  suppressReportTest('states', ['--no-report', '-G', 'column picker']),
  ['--no-report', '--grep-invert', `column picker|${T}`],
);
// Repeated greps override rather than combine, so only the last one was ever live.
equals(
  'only the live exclude is unioned',
  suppressReportTest('states', ['--no-report', '-G', 'a', '-G', 'b']),
  ['--no-report', '--grep-invert', `b|${T}`],
);
// What Playwright is actually handed, which is the claim that matters: our exclusion present,
// `--no-report` gone, because Playwright rejects an unknown option.
equals(
  'the two together hand Playwright the exclusion and not our flag',
  mergeArgs(['playwright', 'test'], suppressReportTest('states', ['--no-report', '-G', 'a'])),
  ['playwright', 'test', '--grep-invert', `a|${T}`],
);
equals('without --no-report nothing is appended', suppressReportTest('states', ['--headed']), ['--headed']);
equals('journey is left alone', suppressReportTest('journey', ['--no-report']), ['--no-report']);

// alsoExcluding — the slash form is Playwright's regex literal and must survive as one.
equals('a plain pattern is joined with |', alsoExcluding('a', T), `a|${T}`);
equals('no caller pattern yields the title alone', alsoExcluding(undefined, T), T);
// Flattening this would widen a case-SENSITIVE exclusion into a case-insensitive one and
// drop titles the caller never asked to drop.
equals('a slash form is rebuilt as a slash form', alsoExcluding('/a/', T), `/a|${T}/`);
equals('its flags are preserved', alsoExcluding('/a/i', T), `/a|${T}/i`);
// Alternation binds loosest, so the caller's anchor stays on the caller's branch.
equals('an anchor does not leak across the |', alsoExcluding('^a', T), `^a|${T}`);

// ---------------------------------------------------------------------------------------
// mergeArgs and projectsOutOfScope — which suite actually runs.
// ---------------------------------------------------------------------------------------

const OWN = ['playwright', 'test', '--project=journey-*'];

equals('--no-report never reaches Playwright', mergeArgs(['playwright'], ['--no-report']), ['playwright']);
// Playwright unions repeated --project, so appending the caller's would have run every
// screen when one was asked for.
equals("the caller's --project replaces ours", mergeArgs(OWN, ['--project=journey-01-login']), [
  'playwright',
  'test',
  '--project=journey-01-login',
]);
equals('without one, ours stands', mergeArgs(OWN, ['--headed']), [...OWN, '--headed']);

equals('a screen of this suite is in scope', projectsOutOfScope(OWN, ['--project=journey-01-login']), []);
equals('the wildcard itself is in scope', projectsOutOfScope(OWN, ['--project=journey-*']), []);
// Each command chooses its own preflight, so borrowing another suite's project skipped the
// checks picked for it — `journey --project=surfaces` ran surfaces without the admin check.
equals('another suite is not', projectsOutOfScope(OWN, ['--project=surfaces']), ['surfaces']);
equals(
  'the separated form is checked too',
  projectsOutOfScope(OWN, ['--project', 'surfaces']),
  ['surfaces'],
);
equals(
  'a command with no project of its own constrains nothing',
  projectsOutOfScope(['node', 'a11y/preflight.mjs'], ['--project=anything']),
  [],
);

// ---------------------------------------------------------------------------------------

if (failures.length) {
  console.error(`\na11y cli-args selftest: ${failures.length} FAILED, ${passed} passed\n`);
  for (const f of failures) console.error(`  - ${f}\n`);
  process.exit(1);
}
console.log(`a11y cli-args selftest: ${passed} checks passed`);
