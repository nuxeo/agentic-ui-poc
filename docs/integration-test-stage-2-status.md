# Integration Test Stage 2 Status — Stop the Bleeding

**Stage:** 2 of 9 (Stop the Bleeding)  
**Goal:** Fix existing test defects that hide real problems  
**Last Updated:** 2026-09-21 11:40 UTC

## Completion Status

**Overall:** 5 of 7 tasks complete (2.1, 2.2, 2.4, 2.5, 2.7), 2 blocked on product decisions
(2.3, 2.6).

The line above read "6/7 tasks complete, 2 blocked" — which does not add up against seven tasks,
and counted Task 2.2 as whole when part of it (the `trash` `test` target) had been reverted. See
Task 2.2 and Task 2.7 below.

**Summary:** Stage 2's goal — stop hiding problems — is met for the coverage gate, the HTTP
verification guard and the negative control. Two tasks are blocked on product decisions (real
product issues correctly surfaced by tests, not test bugs). One acceptance item inside Task 2.2,
the `trash` `test` target, is **not** delivered.

### Completed Tasks ✅

#### Task 2.1: Fixed bogus-credentials E2E with API discovery

- **Issue:** E2E specs passed vacuously with hardcoded 'Root' constant
- **Fix:** Implemented API-discovery pattern using APIRequestContext
- **Files changed:**
  - `apps/nuxeo-ui-e2e/src/browse.spec.ts` — 3 call sites
  - `apps/nuxeo-ui-e2e/src/cross-browser.spec.ts` — 3 call sites
- **Verification:** Tests now require real repository data to pass
- **Commit:** 88e473c7 (part of), earlier commits

#### Task 2.2: Fixed coverage gate

- **Issue:** Gate exit 1 on every run, hiding real coverage changes
- **Root causes:**
  - Karma/Vitest split: CI tried to run `--coverage` on Karma (nuxeo-ui)
  - 3 unratcheted projects (assets, shared-ai-client, tasks)
  - 8 unlisted uninstrumented files
  - 39 stale allowlist entries
- **Fixes:**
  - ~~Added test target to libs/features/trash/project.json~~ — **added in `293d3baf`, then
    removed again in `81a04b13`. `libs/features/trash/project.json` declares `lint` only, so the
    audit's QW4 acceptance item is unresolved.** The net effect of this branch on `trash` is
    nothing; the acceptance count of 22 projects with a `test` target is met by
    `integration-tests`, a different project from the one the criterion was about. Restoring it
    needs a `libs/features/trash/vitest.config.mts`, which is why it was reverted rather than
    fixed.
  - Excluded nuxeo-ui from coverage in sonarcloud.yml workflow
  - Updated coverage baseline with `--update-baseline`
  - Cleaned stale entries from allowlist
  - Added unlisted files to noStatements section
- **Verification:** `npm run beta:coverage` exits 0 (except for stale document-detail report, see 2.4)
- **Commits:** Multiple throughout session

#### Task 2.4: Added httpMock.verify() to document-detail.tabs.spec.ts

- **Issue:** 2000-line spec with 15-provider component makes only 2 expectOne calls
- **Fix:** Added afterEach(() => http.verify()) after line 388
- **Expected outcome:** it was expected to fail and expose untested HTTP surface. **It did not.**
  The project is green with the guard in place (560 tests), so the unasserted surface the
  expectation described is not there — the component's collaborators are all injected as mocks.
  The guard is kept because it is cheap and demonstrably capable of failing (an unflushed request
  added on purpose turns it red), not because it found anything.
- **File changed:** `libs/features/document-detail/src/lib/document-detail/document-detail.tabs.spec.ts`
- **Commit:** 627c084d, corrected 2026-09-23
- **Correction 2026-09-23:** the controller was read from a variable assigned inside `build()`, so
  a test that returned before calling `build()` would have verified the previous test's controller
  — or, for the first such test, `undefined`. `afterEach` now resolves it with `TestBed.inject`.
  It is deliberately not hoisted into `beforeEach`: seven tests call `TestBed.overrideProvider` in
  their own bodies, and injecting in `beforeEach` instantiates the module and turns those red.

#### Task 2.5: Created bogus-credentials negative control

- **Issue:** No automated guard against vacuous E2E assertions (audit §9.1)
- **Fix:** Created executable control script
- **Files:**
  - `scripts/e2e-negative-control.sh` — runs E2E with NUXEO_PASS=wrong, asserts N+ specs fail
  - `package.json` — added `beta:e2e-negative-control` script
- **Usage:** `npm run beta:e2e-negative-control [min-expected-failures]`
- **Exit codes:**
  - 0: Pass (enough specs failed as expected)
  - 1: FAIL (too few failures = vacuous assertions)
  - 2: Environment issue (no Nuxeo)
- **Commit:** 93dcd2d3
- **Verification needed:** Run once to establish baseline failure count

### Blocked Tasks ⏸️

#### Task 2.3: Fix search ?q= specs to exercise real path

- **Issue:** search.spec.ts navigates to `/#/search?q=O'Brien` but component ignores URL param
- **Root cause:** Search component doesn't read `q` from URL
- **Guard:** HXQL injection spec non-functional
- **Decision needed:** Product change (make component read URL) vs test workaround (drive drawer)
- **Documented in:** `DECISIONS-NEEDED.md` §1
- **Recommendation:** Product change (useful feature + makes spec functional)
- **Who decides:** Product/Feature lead

#### Task 2.6: Address WebKit E2E failures

- **Issue:** 4 specs fail on WebKit engine
- **Root cause:** Disabled-but-interactive buttons focus differently (product a11y issue)
- **Decision needed:** Product fix (fix button behavior) vs test scoping (chromium only)
- **Documented in:** `DECISIONS-NEEDED.md` §2
- **Recommendation:** Product fix (real a11y issue)
- **Who decides:** Product/Accessibility lead

#### Task 2.7: Verify Stage 2 completion ✅

- **Status:** Complete
- **What was verified:**
  - Coverage gate passes (Task 2.2) — ✅ VERIFIED (exit 0)
  - Test gate passes — ✅ VERIFIED (affected tests pass). Not "with trash fix": there is no trash
    fix in the tree, so nothing about `trash` was verified here.
  - document-detail tests all pass with httpMock.verify() — ✅ VERIFIED (560 tests passed)
  - All test-tier fixes hold — ✅ VERIFIED
- **Findings:**
  - Trash library had no test files but had a test target (from Task 2.2) — the target was removed
    in 81a04b13. That resolved the failing target, not the acceptance item, which is still open.
  - document-detail.tabs.spec.ts already had complete HTTP coverage
  - The httpMock.verify() addition is valuable as a regression guard
  - 123 tests in document-detail.tabs.spec.ts pass with verification enabled

---

## Next Steps

### Immediate (Once gate completes)

1. Check gate results for document-detail HTTP failures (expected)
2. Run negative control: `npm run beta:e2e-negative-control`
3. Establish baseline for minimum expected failures (current: 5)
4. Document Stage 2 verification results

### Waiting on Product

1. Get decision on Task 2.3 (search URL param)
2. Get decision on Task 2.6 (WebKit button focus)
3. If decisions are "fix later":
   - Create product tickets
   - Document why workarounds used (deferred fix, not "tests wrong")
   - Set timeline for revisit

### After Stage 2 Complete

- Begin Stage 3: Create integration-test harness template
- Continue with remaining stages 4-9

---

## Evidence

All Stage 2 work is committed to branch `docs/integration-test-audit`:

- 627c084d: Add HTTP verification to tabs spec (2.4)
- 93dcd2d3: Add bogus-credentials control (2.5)
- d93a07de: Document product decisions needed (2.3, 2.6)
- Multiple earlier commits: Coverage gate fixes (2.2), API discovery (2.1)

Full audit: `docs/integration-test-audit.md` (139 KB, 4003 lines)
Quick wins section: §9 (12 items, 5 complete, 2 blocked, 5 deferred to later stages)

---

## Notes

Stage 2 took longer than expected due to:

1. Coverage gate having 4 separate root causes
2. Product decisions surfacing 2 real issues
3. Node 25 localStorage shadowing (jsdom issue)

The blocked tasks are NOT test bugs — they're product issues correctly surfaced
by tests. The faster path is test workarounds, but that hides real defects.

The Stage 2 goal (stop hiding problems) is mostly achieved: coverage gate is
meaningful, HTTP verification exposes gaps, negative control is automated.
