# Decisions Needed — Stage 2 (Stop the Bleeding)

This file tracks integration-test issues that need team or product decisions
before implementation can continue.

## 1. Search ?q= Parameter: Product Change vs Test Workaround

**Context (from audit §9.2, Task 2.3):**
- search.spec.ts:33-45 test the HXQL injection guard by visiting `/#/search?q=O'Brien`
- The search component does NOT currently read the `q` URL parameter
- This makes the injection guard spec non-functional: it navigates to a URL with a query term, but the component ignores it
- The spec passes (doesn't error), but it doesn't exercise the escaping path it was written to guard

**Options:**

### A. Product change (preferred)
Make the search component read `q` from URL query params and pre-fill the search input:
- Pro: Makes direct search links work (useful feature)
- Pro: Makes the guard spec functional as-is
- Pro: URL becomes a shareable artifact
- Con: Requires product change + migration of existing specs that expect empty search

### B. Test workaround
Drive the filters drawer via Playwright API instead:
- Pro: No product change
- Pro: Tests the escaping the long way
- Con: More brittle (depends on drawer structure)
- Con: Doesn't test the URL-based flow at all
- Con: Creates test-only code path divergence

**Recommendation:** Option A (product change). The URL parameter is a useful feature
and the specs were written assuming it would work. The workaround (B) makes the
test suite more complex while leaving a feature gap.

**Decision needed from:** Product/Feature lead

**Blocked tasks:**
- Task 2.3: Fix search ?q= specs to exercise real path

---

## 2. WebKit E2E Failures: Product Fix vs Test Scoping

**Context (from audit §9.3, Task 2.6):**
- 4 specs fail on WebKit engine: cross-browser.spec.ts navigation, focus, and search tests
- Root cause: WebKit focuses disabled-but-interactive buttons differently from Chromium
- This is a product defect (a11y issue), not a test defect
- Tests correctly surface the problem

**Options:**

### A. Product fix (preferred)
Fix the button focus behavior to match Chromium:
- Pro: Fixes real accessibility issue
- Pro: Makes behavior consistent across engines
- Pro: Tests become green on both engines
- Con: Requires product change

### B. Scope tests to chromium only
Mark failing specs with `.only('chromium')` or similar:
- Pro: Makes gate green immediately
- Pro: No product change required
- Con: Hides accessibility issue
- Con: Reduces cross-browser coverage
- Con: "verified on Safari" claim becomes weaker

**Recommendation:** Option A (product fix). The tests are correctly surfacing a
real a11y issue. Scoping them away hides the defect without fixing it.

**Decision needed from:** Product/Accessibility lead

**Blocked tasks:**
- Task 2.6: Address WebKit E2E failures

---

## Notes

Both decisions should be made together since they affect the same gate (E2E).
The faster path is B+B (test workarounds), but it accumulates tech debt and
reduces coverage. The better path is A+A (product fixes), but requires product
investment.

If the decision is "fix later", we should:
1. Create tickets for both product changes
2. Document WHY we're using workarounds (not "tests are wrong", but "deferred product fix")
3. Set a timeline for revisiting

Last updated: 2026-09-21 (Stage 2 implementation)
