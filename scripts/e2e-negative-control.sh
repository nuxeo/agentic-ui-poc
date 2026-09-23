#!/usr/bin/env bash
set -euo pipefail

# E2E Negative Control: Bogus Credentials Sensitivity
#
# Runs the E2E suite with wrong credentials and asserts that at least N specs fail.
# This prevents the §9.1 class of defect: assertions that pass vacuously because they
# never actually check repository data.
#
# Context from audit §9.1.1: cross-browser.spec.ts:49-52 records that running the suite
# under bad credentials caught two vacuous specs. That negative control existed only as
# a comment. This script makes it executable.
#
# ## Why it counts specs out of results.json rather than grepping the console
#
# The first version forced `--reporter=json` and then grepped stdout for `N failed` — a
# phrase only Playwright's `list` and `line` reporters emit. The JSON reporter never
# prints it, so the `|| echo "0"` fallback fired on every run, `ACTUAL_FAILURES` was
# always 0, and `[ 0 -ge 5 ]` was always false. The script could only ever print FAIL,
# whichever way the run went — a control that always reports failure is as useless as one
# that always reports success, and worse than none, because it gets silenced.
#
# So the reporter is left as the config declares it (`list` for a human, `json` to
# `dist/e2e/results.json`) and the count comes from the file. That does not depend on
# console phrasing, and an absent file is treated as an environment failure rather than
# as zero failures — the same mistake in a different place.
#
# ## Why a bare failure count is not the measurement
#
# `NUXEO_PASS` is read in three places, not one: this suite's `signedIn` fixture, the
# `httpCredentials` in `playwright.config.ts`, and `newNuxeoApiContext()` in `fixtures.ts`.
# So a wrong password does not only make repository-data assertions fail — it also makes
# `aRootChild()` throw `API query failed: 401` before the spec body runs at all.
#
# A spec that died there proves nothing about whether its assertions check anything: it
# would have failed identically if its body were empty. Counting those toward the threshold
# is the same defect as the reporter mismatch above, one level up — a control whose number
# does not measure what its message claims. On the run this script was last verified
# against, 4 of 13 failures were exactly that.
#
# ## Why the filename is not the measurement either
#
# The previous version classified by where the run said the error happened: a failure located
# in a `*.spec.ts` file counted, anything else did not. Review was right that this does not
# hold, and it was measured rather than argued — on Playwright 1.63, `expect(1 + 1).toBe(3)`
# and a promise rejecting with "Timeout 45000ms exceeded" produce error locations that are
# both `*.spec.ts` lines and are indistinguishable by filename. A `page.goto()` timeout is
# thrown from a line the spec wrote, so it counted toward the threshold with no `expect`
# having run at all. A run where the wrong password broke navigation everywhere could
# therefore satisfy a control whose entire purpose is to prove the specs read repository data.
#
# So the fact is emitted rather than inferred. `apps/nuxeo-ui-e2e/assertion-failure-reporter.ts`
# reads `TestStep.category === 'expect'` — which Playwright sets itself and its JSON reporter
# does not serialize — and writes, per failing spec, whether a failing assertion outside any
# hook was the cause. An `expect` that fails in `beforeEach` does not count: it is nested
# under the hook steps and the body never ran.
#
# That keeps the conservatism the filename test was reaching for while dropping its two
# errors. It no longer excludes a genuine repository-data assertion for living in
# `fixtures.ts` — `expectSurfaceWithData()` was in exactly that position — and it no longer
# admits a navigation timeout for being thrown from a spec file.
#
# Both corrections are visible on the runs this version was verified against, chromium,
# against the local stack:
#
#   wrong password    14 failed, 10 at an assertion, 4 never reached one
#   correct password   2 failed,  2 at an assertion, 21 passed
#
# The old classifier scored the same suite 8 and 6. The two runs also show the corrections
# separately: under correct credentials one of the two genuine failures is located in
# `fixtures.ts:69` and the filename test would have discarded it, and
# `scripts/beta-harness/assertion-reporter.selftest.mjs` shows the reverse — restore the
# filename rule and its count of deliberate failures goes from 1 to 3.
#
# NOTE the default threshold below is still 5 against a measured 10. Raising it is a
# judgement about how much drift should be tolerated, not part of this fix.
#
# Usage:
#   ./scripts/e2e-negative-control.sh [min-expected-failures]
#
# Default: expects at least 5 failures (conservative - should be higher once fixed)
#
# Exit codes:
#   0 - Control passed (enough specs failed at their own assertions, as expected)
#   1 - Control FAILED (too few failures = vacuous assertions present)
#   2 - Environment issue (no Nuxeo, preflight failed, no results file)

MIN_FAILURES="${1:-5}"
# Written by the `json` reporter registered in apps/nuxeo-ui-e2e/playwright.config.ts.
RESULTS_FILE="dist/e2e/results.json"
# Written by assertion-failure-reporter.ts, registered beside it. This is what the count
# comes from; RESULTS_FILE is kept only so an absent run is still detected as one.
ASSERTIONS_FILE="dist/e2e/assertion-failures.json"

echo "=== E2E Negative Control: Bogus Credentials ==="
echo "Running E2E suite with NUXEO_PASS=wrong"
echo "Expected: at least ${MIN_FAILURES} specs should fail"
echo ""

# Clear previous results, so a stale file from an earlier run can never be counted.
rm -f "$RESULTS_FILE" "$ASSERTIONS_FILE"

# Run preflight with correct credentials first
if ! node scripts/beta-harness/e2e-preflight.mjs; then
  echo "ERROR: Preflight failed with correct credentials"
  echo "Fix environment before running negative control"
  exit 2
fi

# Run E2E with wrong password
# Use chromium only (faster); a non-zero exit is the expected outcome, not an error.
export NUXEO_PASS="wrong"

set +e
npx playwright test -c apps/nuxeo-ui-e2e/playwright.config.ts \
  --project=chromium 2>&1 | tee /tmp/e2e-negative-control.log
PLAYWRIGHT_EXIT=${PIPESTATUS[0]}
set -e

if [ ! -f "$RESULTS_FILE" ]; then
  echo ""
  echo "ERROR: ${RESULTS_FILE} was not written, so no failure count can be read."
  echo "Playwright exited ${PLAYWRIGHT_EXIT}. Check that the json reporter is still"
  echo "registered in apps/nuxeo-ui-e2e/playwright.config.ts."
  exit 2
fi

# An absent assertions file is an environment failure, never zero. Treating it as zero is
# the same mistake as the `|| echo "0"` fallback that made the first version of this script
# incapable of reporting anything but FAIL.
if [ ! -f "$ASSERTIONS_FILE" ]; then
  echo ""
  echo "ERROR: ${ASSERTIONS_FILE} was not written, so no assertion count can be read."
  echo "Playwright exited ${PLAYWRIGHT_EXIT}. Check that assertion-failure-reporter.ts is"
  echo "still registered in apps/nuxeo-ui-e2e/playwright.config.ts."
  exit 2
fi

# The reporter has already decided, per spec, whether a failing `expect` outside any hook was
# the cause; it counts only specs whose every attempt failed, the same population `spec.ok`
# describes. Nothing here re-derives that from an error location.
CLASSIFIED=$(node -e '
  const { specs = [] } = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
  const row = (s) => ({
    title: s.title,
    where: s.failedAtAssertion ? s.assertion.where : s.errorLocation,
    assertion: s.assertion?.assertion ?? "",
  });
  process.stdout.write(
    JSON.stringify({
      atAssertion: specs.filter((s) => s.failedAtAssertion).map(row),
      beforeAssertion: specs.filter((s) => !s.failedAtAssertion).map(row),
    }),
  );
' "$ASSERTIONS_FILE")

ACTUAL_FAILURES=$(printf "%s" "$CLASSIFIED" | node -e '
  let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => {
    process.stdout.write(String(JSON.parse(s).atAssertion.length));
  });
')
SETUP_FAILURES=$(printf "%s" "$CLASSIFIED" | node -e '
  let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => {
    const { beforeAssertion } = JSON.parse(s);
    process.stdout.write(String(beforeAssertion.length));
  });
')

echo ""
echo "=== Results ==="
echo "Playwright exit code: ${PLAYWRIGHT_EXIT}"
echo "Failures at a spec's own assertion: ${ACTUAL_FAILURES}   (these are what count)"
echo "Failures with no assertion reached: ${SETUP_FAILURES}   (setup, navigation, hooks — excluded)"
echo "Expected minimum: ${MIN_FAILURES}"
echo ""
printf "%s" "$CLASSIFIED" | node -e '
  let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => {
    const { atAssertion, beforeAssertion } = JSON.parse(s);
    const list = (rows) =>
      rows.map((r) => `    ${r.where.padEnd(44)} ${r.assertion.padEnd(26)} ${r.title}`).join("\n");
    // No apostrophes in here: this whole program is a single-quoted shell argument, and one
    // stray "spec+apostrophe+s" closed it early and took the script down with a syntax error.
    if (atAssertion.length) console.log("  Counted — a failing expect() written by the spec itself:\n" + list(atAssertion));
    if (beforeAssertion.length) {
      console.log("\n  Excluded — no assertion ran, so the failure says nothing about what the spec checks:\n" + list(beforeAssertion));
    }
  });
'
echo ""

if [ "$ACTUAL_FAILURES" -ge "$MIN_FAILURES" ]; then
  echo "✅ PASS: Negative control succeeded"
  echo "${ACTUAL_FAILURES} spec(s) failed at an expect() of their own when the credentials were"
  echo "wrong, so those assertions depend on repository data rather than on constants."
  echo ""
  echo "It says nothing about the specs that still PASSED with a wrong password, or about"
  echo "the ${SETUP_FAILURES} that never reached an assertion. Both are gaps, not evidence."
  exit 0
else
  echo "❌ FAIL: Negative control FAILED"
  echo "Only ${ACTUAL_FAILURES} spec(s) failed at an assertion of their own, below the ${MIN_FAILURES} expected."
  echo ""
  if [ "$SETUP_FAILURES" -gt 0 ]; then
    echo "${SETUP_FAILURES} further spec(s) failed without reaching an assertion. Those do not count:"
    echo "a spec that dies in setup or navigation would have failed identically with an empty"
    echo "body, so it demonstrates nothing about what it asserts."
    echo ""
  fi
  echo "Either some specs pass vacuously — asserting constants rather than verifying that"
  echo "repository data arrived — or the run collapsed in setup before it could tell."
  echo ""
  echo "Fix: review the specs that passed and ensure they use API-discovered values, not"
  echo "hardcoded constants like 'Root'. If the setup count is high, fix that first: the"
  echo "control cannot measure anything through a harness that fell over."
  exit 1
fi
