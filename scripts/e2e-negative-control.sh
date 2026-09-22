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
# So failures are classified by where the run says the error happened. Only a failure
# located in a `*.spec.ts` file counts: that is a line the spec itself wrote, reached
# because the spec got far enough to check something. Everything else — fixtures, hooks,
# shared helpers — is reported separately and excluded.
#
# The classification is deliberately conservative in the direction that can only make the
# threshold harder to meet. `expectSurfaceWithData()` lives in `fixtures.ts`, so a failure
# inside it is excluded even though it is a genuine repository-data assertion. Under-counting
# cannot manufacture a pass; over-counting is how this control became meaningless the first
# time.
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

echo "=== E2E Negative Control: Bogus Credentials ==="
echo "Running E2E suite with NUXEO_PASS=wrong"
echo "Expected: at least ${MIN_FAILURES} specs should fail"
echo ""

# Clear previous results, so a stale file from an earlier run can never be counted.
rm -f "$RESULTS_FILE"

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

# Classify the specs the run reports as not ok. `spec.ok` is false when every attempt
# failed, so a spec that only passed on retry is not counted as a failure here.
#
# The location is read from the FINAL attempt: a retry can fail somewhere else than the
# first try did, and the final attempt is the one `spec.ok` reflects.
CLASSIFIED=$(node -e '
  const report = require("fs").readFileSync(process.argv[1], "utf8");
  const { suites = [] } = JSON.parse(report);
  const atAssertion = [];
  const beforeAssertion = [];

  const walk = (list) => {
    for (const suite of list) {
      for (const spec of suite.specs ?? []) {
        if (spec.ok !== false) continue;
        const attempts = (spec.tests ?? []).flatMap((t) => t.results ?? []);
        const last = attempts[attempts.length - 1];
        const location = last?.errorLocation ?? last?.errors?.[0]?.location ?? null;
        const file = location?.file ?? "";
        const where = location ? `${file.split("/").pop()}:${location.line}` : "unknown";
        const row = { title: spec.title, where };
        if (/\.spec\.ts$/.test(file)) atAssertion.push(row);
        else beforeAssertion.push(row);
      }
      walk(suite.suites ?? []);
    }
  };
  walk(suites);

  process.stdout.write(JSON.stringify({ atAssertion, beforeAssertion }));
' "$RESULTS_FILE")

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
echo "Failures before the spec body:      ${SETUP_FAILURES}   (fixtures/hooks — excluded)"
echo "Expected minimum: ${MIN_FAILURES}"
echo ""
printf "%s" "$CLASSIFIED" | node -e '
  let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => {
    const { atAssertion, beforeAssertion } = JSON.parse(s);
    const list = (rows) => rows.map((r) => `    ${r.where.padEnd(32)} ${r.title}`).join("\n");
    if (atAssertion.length) console.log("  Counted — failed at a line the spec wrote:\n" + list(atAssertion));
    if (beforeAssertion.length) {
      console.log("\n  Excluded — failed outside any spec file, so the body never ran its checks:\n" + list(beforeAssertion));
    }
  });
'
echo ""

if [ "$ACTUAL_FAILURES" -ge "$MIN_FAILURES" ]; then
  echo "✅ PASS: Negative control succeeded"
  echo "${ACTUAL_FAILURES} spec(s) failed at their own assertions when the credentials were wrong,"
  echo "so those assertions depend on repository data rather than on constants."
  echo ""
  echo "It says nothing about the specs that still PASSED with a wrong password, or about"
  echo "the ${SETUP_FAILURES} that never reached their body. Both are gaps, not evidence."
  exit 0
else
  echo "❌ FAIL: Negative control FAILED"
  echo "Only ${ACTUAL_FAILURES} spec(s) failed at an assertion of their own, below the ${MIN_FAILURES} expected."
  echo ""
  if [ "$SETUP_FAILURES" -gt 0 ]; then
    echo "${SETUP_FAILURES} further spec(s) failed before their body ran. Those do not count: a spec"
    echo "that dies in a fixture would have failed identically with an empty body, so it"
    echo "demonstrates nothing about what it asserts."
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
