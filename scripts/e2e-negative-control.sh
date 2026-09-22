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
# Usage:
#   ./scripts/e2e-negative-control.sh [min-expected-failures]
#
# Default: expects at least 5 failures (conservative - should be higher once fixed)
#
# Exit codes:
#   0 - Control passed (enough specs failed, as expected)
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

# Count specs the run reports as not ok. `spec.ok` is false when every attempt failed,
# so a spec that only passed on retry is not counted as a failure here.
ACTUAL_FAILURES=$(node -e '
  const report = require("fs").readFileSync(process.argv[1], "utf8");
  const { suites = [] } = JSON.parse(report);
  let failed = 0;
  const walk = (list) => {
    for (const suite of list) {
      for (const spec of suite.specs ?? []) if (spec.ok === false) failed += 1;
      walk(suite.suites ?? []);
    }
  };
  walk(suites);
  process.stdout.write(String(failed));
' "$RESULTS_FILE")

echo ""
echo "=== Results ==="
echo "Playwright exit code: ${PLAYWRIGHT_EXIT}"
echo "Actual failures: ${ACTUAL_FAILURES}"
echo "Expected minimum: ${MIN_FAILURES}"
echo ""

if [ "$ACTUAL_FAILURES" -ge "$MIN_FAILURES" ]; then
  echo "✅ PASS: Negative control succeeded"
  echo "Specs correctly fail when credentials are wrong"
  echo "This proves they actually check repository data"
  exit 0
else
  echo "❌ FAIL: Negative control FAILED"
  echo "Too few specs failed with wrong credentials"
  echo ""
  echo "This means some specs pass vacuously - they assert constants"
  echo "or never actually verify repository data arrived."
  echo ""
  echo "Fix: Review specs that passed and ensure they use API-discovered"
  echo "values, not hardcoded constants like 'Root'"
  exit 1
fi
