# Out-of-Scope Projects - Coverage Improvement Plan

**Date:** 2026-09-22  
**Goal:** Bring tasks, acme-extensions, and administration to 90%+ coverage

---

## Executive Summary

**Total Effort Required:** 688 statements across 3 projects  
**Estimated Time:** 35-69 hours  
**Current Status:** All test suites passing (no blockers)

---

## Project Breakdown

### 1. acme-extensions: 53.47% → 90% 🟢 EASIEST

**Current:** 54/101 statements (53.47%)  
**Target:** 91/101 statements (90%)  
**Gap:** 37 statements (36.53pp)  
**Estimated Effort:** 2-4 hours

**Test Status:** ✅ 2 test files, 9 tests passing

#### Coverage Gaps:

| File                            | Current | Gap      | Lines Uncovered    | Has Test File? |
| ------------------------------- | ------- | -------- | ------------------ | -------------- |
| **acme-panel.ts**               | 0%      | 61 stmts | 1-61 (entire file) | ❌ No          |
| **retention-policy-summary.ts** | 0%      | 17 stmts | 1-17 (entire file) | ❌ No          |
| **rules.service.ts**            | 47.82%  | 12 stmts | 36-41, 72-77       | ❌ No          |
| **extensions.ts**               | 95.55%  | 2 stmts  | 106, 108           | ✅ Yes         |

#### Recommended Approach:

**Quick Win (gets to ~80%):**

- Add tests to existing `extensions.spec.ts` for lines 106, 108 (2 statements)
- Add `rules.service.spec.ts` for lines 36-41, 72-77 (12 statements)
- **Result:** 14 statements = +14pp → ~67%

**Full Coverage (gets to 90%+):**

- Create `acme-panel.spec.ts` - test component lifecycle, action dispatch, enabled computed
- **Note:** acme-panel is example code showing extension system usage
- Testing it validates the extension system integration patterns
- **Estimated:** 15-20 tests needed

**Priority:** 🟢 **Start Here** - smallest gap, example code (less critical if incomplete)

---

### 2. administration: 60.39% → 90% 🟡 MEDIUM

**Current:** 651/1078 statements (60.39%)  
**Target:** 971/1078 statements (90%)  
**Gap:** 320 statements (29.61pp)  
**Estimated Effort:** 15-20 hours

**Test Status:** ✅ 3 test files, 25 tests passing

#### Current Test Coverage:

```
Total statements: 1078
Covered: 651
Tests: 25 passing
Test files: 3
```

#### Complexity:

- **10 unmeasured files** (1911 lines total)
- Administration features are complex with many integration paths
- Likely needs tests for:
  - User management UI
  - Group management
  - Permission configuration
  - System settings

#### Recommended Approach:

1. **Run coverage analysis** to identify specific gaps

   ```bash
   NODE_OPTIONS="--no-experimental-webstorage" npx nx test administration --coverage.enabled=true --run
   ```

2. **Prioritize high-value paths:**
   - User CRUD operations
   - Group management
   - Permission updates
   - Settings validation

3. **Create missing test files** for unmeasured components

**Priority:** 🟡 **Second** - out of Beta scope but substantial infrastructure

---

### 3. tasks: 43.12% → 90% 🔴 HARDEST

**Current:** 304/705 statements (43.12%)  
**Target:** 635/705 statements (90%)  
**Gap:** 331 statements (46.88pp)  
**Estimated Effort:** 18-30 hours

**Test Status:** ✅ 1 test file, 7 tests passing

#### Current Test Coverage:

```
Total statements: 705
Covered: 304
Tests: 7 passing (very thin coverage)
Test files: 1
```

#### Complexity:

- Workflow/task features are complex
- Integration with Nuxeo workflow engine
- Many state transitions and edge cases
- Currently only 1 test file with 7 tests (clearly insufficient)

#### Recommended Approach:

1. **Audit existing structure:**
   - Identify all task-related components
   - Map workflow states and transitions
   - Document integration points with Nuxeo

2. **Create comprehensive test suite:**
   - Task creation/update/deletion
   - State transitions
   - Assignment logic
   - Due date handling
   - Task completion flows

3. **Focus on critical paths first:**
   - Task lifecycle management
   - User interactions
   - Error handling

**Priority:** 🔴 **Last** - largest gap, most complex, out of Beta scope

---

## Consolidated Effort Estimate

### If Done Sequentially:

| Project             | Effort      | Cumulative  |
| ------------------- | ----------- | ----------- |
| **acme-extensions** | 2-4 hours   | 2-4 hours   |
| **administration**  | 15-20 hours | 17-24 hours |
| **tasks**           | 18-30 hours | 35-54 hours |

### Parallel Work (3 developers):

- **Timeline:** 2-3 weeks (if parallelized)
- **Developer 1:** acme-extensions (done in 1 day)
- **Developer 2:** administration (1.5-2 weeks)
- **Developer 3:** tasks (2-3 weeks)

---

## Impact on Consolidated Coverage

### Current State:

- **Overall (all 19 projects):** 88.80%
- **In-Scope (Beta, 13 projects):** 94.13%

### After Completing These 3 Projects:

**Additional statements covered:** 688  
**New overall coverage:** ~91.74% (+2.94pp)

### Calculation:

```
Current: 20,790 / 23,411 = 88.80%
After: (20,790 + 688) / 23,411 = 21,478 / 23,411 = 91.74%
```

**Note:** This still wouldn't hit 95% overall because of shared-ai-client (15.98%) which depends on external AI backend.

---

## Recommendations

### Option 1: Complete All Three (Comprehensive)

**Pros:**

- Brings overall coverage to 91.74%
- Tests important functionality (even if out of Beta)
- Validates extension system (acme-extensions)

**Cons:**

- Significant time investment (35-54 hours)
- Out of Beta scope (not blocking product release)
- Tasks/administration are complex domains

**Recommendation:** Only if time permits after completing in-scope work

### Option 2: Start with acme-extensions Only (Pragmatic)

**Pros:**

- Quick win (2-4 hours)
- Example code that customers reference
- Validates extension patterns
- +2.94pp improvement to 56.41% → 90%+

**Cons:**

- Doesn't significantly improve overall coverage (only +0.16pp)
- Leaves administration and tasks uncovered

**Recommendation:** ✅ **Do this** - validates customer-facing example code

### Option 3: Skip All Three (Current State)

**Pros:**

- Focus remains on in-scope Beta work
- In-scope coverage is already 94.13%

**Cons:**

- Overall coverage stuck at 88.80%
- Example code (acme-extensions) remains untested

**Recommendation:** ❌ **Not recommended** - at least test acme-extensions

---

## Next Steps

### Immediate (If Approved):

1. **Start with acme-extensions** (2-4 hours)

   ```bash
   # Update task #13 to in_progress
   # Create acme-panel.spec.ts
   # Add tests to rules.service.spec.ts
   # Complete lines 106, 108 in extensions.spec.ts
   ```

2. **Validate acme-extensions reaches 90%**

   ```bash
   NODE_OPTIONS="--no-experimental-webstorage" npx nx test acme-extensions --coverage.enabled=true
   ```

3. **Update baseline and commit**

### Then Decide:

- **Continue to administration?** (15-20 hours)
- **Continue to tasks?** (18-30 hours)
- **Or stop here and move to Phase 2 in-scope work?**

---

## Dependencies & Prerequisites

### All Projects:

- ✅ NODE_OPTIONS localStorage workaround (already discovered)
- ✅ All test suites currently passing
- ✅ Coverage gate infrastructure working

### No Blockers:

- No failing tests
- No infrastructure issues
- Ready to start immediately

---

## Quality Standards

**Same standards as in-scope work:**

- ✅ Follow project test conventions
- ✅ Proper mocking and DI
- ✅ Test real behavior, not implementation
- ✅ Cover success and error paths
- ✅ No superficial assertions
- ✅ No production code modifications
- ✅ Maintain test quality over coverage percentage

---

## Conclusion

**Recommended Path:**

1. ✅ **Complete acme-extensions** (2-4 hours) - validates customer example code
2. 🤔 **Reassess** - evaluate time budget and priorities
3. ⏸️ **Consider administration/tasks** - only if time permits and adds value

**Key Insight:**  
The in-scope (Beta) coverage is already at **94.13%** - very close to the 95% target. Bringing these out-of-scope projects to 90% is worthwhile but not critical for the Beta program success.

**Best ROI:** Focus on closing the final gap in in-scope projects (document-detail, nuxeo-client) first, then tackle acme-extensions as a bonus.

---

**Prepared by:** Claude Sonnet 4.5  
**Session:** coverage-improvement-95pct worktree  
**Status:** Ready to proceed if approved
