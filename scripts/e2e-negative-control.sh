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
# Usage:
#   ./scripts/e2e-negative-control.sh [min-expected-failures]
#
# Default: expects at least 5 failures (conservative - should be higher once fixed)
#
# Exit codes:
#   0 - Control passed (enough specs failed, as expected)
#   1 - Control FAILED (too few failures = vacuous assertions present)
#   2 - Environment issue (no Nuxeo, preflight failed)

MIN_FAILURES="${1:-5}"
RESULTS_FILE="dist/e2e/negative-control-results.json"

echo "=== E2E Negative Control: Bogus Credentials ==="
echo "Running E2E suite with NUXEO_PASS=wrong"
echo "Expected: at least ${MIN_FAILURES} specs should fail"
echo ""

# Clear previous results
rm -f "$RESULTS_FILE"

# Run preflight with correct credentials first
if ! node scripts/beta-harness/e2e-preflight.mjs; then
  echo "ERROR: Preflight failed with correct credentials"
  echo "Fix environment before running negative control"
  exit 2
fi

# Run E2E with wrong password
# Use chromium only (faster), continue-on-error to capture results
export NUXEO_PASS="wrong"

if npx playwright test -c apps/nuxeo-ui-e2e/playwright.config.ts \
  --project=chromium \
  --reporter=json 2>&1 | tee /tmp/e2e-negative-control.log; then
  # Suite passed - this is BAD (means assertions are vacuous)
  ACTUAL_FAILURES=0
else
  # Suite failed - this is EXPECTED
  # Extract failure count from output
  ACTUAL_FAILURES=$(grep -oE '[0-9]+ failed' /tmp/e2e-negative-control.log | head -1 | grep -oE '[0-9]+' || echo "0")
fi

echo ""
echo "=== Results ==="
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
