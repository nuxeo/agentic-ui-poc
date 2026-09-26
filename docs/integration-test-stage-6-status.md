# Integration Test Stage 6 Status — Write Paths and Destructive Operations

**Completed:** 2026-09-21  
**Re-verified:** 2026-09-23, after the isolation assertion was found vacuous — 9 of 9 passing  
**Branch:** `docs/integration-test-audit`  
**Status:** ✅ **COMPLETE AND VERIFIED**

> The status above was first written against a run in which the data-root isolation assertion
> could not fail; see "Guaranteed Cleanup" below. It stands now because the assertion was
> repaired and the stage re-run, not because the original evidence was reread more kindly.

---

## Summary

Implemented comprehensive integration tests for write paths and destructive operations. All 9 tests pass with live Nuxeo. Demonstrates the harness works for write operations, not just reads.

---

## Tests Implemented

### Trash Operations (3 tests) ✅

**Test:** `can trash a document`

- Creates File document
- Trashes via `Document.Trash` automation
- Verifies `isTrashed=true` via follow-up API query
- **Status:** ✅ PASSING

**Test:** `trashed documents do not appear in regular queries`

- Creates and trashes a document
- Queries for non-trashed documents in data root
- Verifies trashed document excluded from results
- **Status:** ✅ PASSING

**Test:** `can restore a trashed document`

- Creates document, trashes it
- Verifies `isTrashed=true`
- Restores via `Document.Untrash` automation
- Verifies `isTrashed=false` via follow-up query
- **Status:** ✅ PASSING

### Permanent Delete (2 tests) ✅

**Test:** `can permanently delete a document`

- Creates document
- Permanently deletes via `DELETE /nuxeo/api/v1/id/{uid}`
- Expects 204 No Content
- Verifies 404 on subsequent query
- **Status:** ✅ PASSING

**Test:** `delete is truly permanent - document cannot be restored`

- Creates and deletes document
- Attempts to restore via `Document.Untrash`
- Expects 404 (cannot restore deleted document)
- **Status:** ✅ PASSING

### Update Operations (2 tests) ✅

**Test:** `can update document properties`

- Creates document with initial properties
- Updates via `PUT` with new title and description
- Verifies changes via follow-up query
- **Status:** ✅ PASSING

**Test:** `can move a document to a different location`

- Creates source and target folders
- Creates document in source folder
- Moves via `Document.Move` automation
- Verifies new path via follow-up query
- Verifies old path no longer in path
- **Status:** ✅ PASSING

### Bulk Operations (1 test) ✅

**Test:** `can delete multiple documents in one operation`

- Creates 3 documents
- Bulk deletes via `Document.Delete` automation with comma-separated UIDs
- Verifies all 3 return 404 on subsequent queries
- **Status:** ✅ PASSING

### Data Root Isolation (1 test) ✅

**Test:** `destructive operations are isolated to data root only`

- Counts documents outside data root (before)
- Performs destructive operation inside data root
- Counts again (after)
- Verifies count unchanged outside data root
- **Status:** ✅ PASSING

---

## Key Learnings

### 1. Nuxeo Trash Operations Require Automation

**Cannot just set `isTrashed` property:**

```typescript
// ❌ Does NOT work - Nuxeo ignores this
await fetch(`/nuxeo/api/v1/id/${uid}`, {
  method: 'PUT',
  body: JSON.stringify({ isTrashed: true }),
});
```

**Must use automation operations:**

```typescript
// ✅ Correct - trash a document
await fetch(`/nuxeo/api/v1/automation/Document.Trash`, {
  method: 'POST',
  body: JSON.stringify({ input: `doc:${uid}` }),
});

// ✅ Correct - restore a document
await fetch(`/nuxeo/api/v1/automation/Document.Untrash`, {
  method: 'POST',
  body: JSON.stringify({ input: `doc:${uid}` }),
});
```

### 2. All Operations Verified with Follow-up API Queries

Every test follows the pattern:

1. Perform operation (trash, delete, update, move)
2. Verify via follow-up API query (not UI assertion)
3. Assert on the queried result

**Example:**

```typescript
// Perform operation
await fetch(`/nuxeo/api/v1/automation/Document.Trash`, { ... });

// Verify with follow-up query
const verifyRes = await fetch(`/nuxeo/api/v1/id/${uid}`);
const doc = await verifyRes.json();

// Assert on queried result
expect(doc.isTrashed).toBe(true);
```

### 3. Each Operation Creates Its Own Fixture

No shared state between tests. Each test:

- Creates its own document(s)
- Performs operation
- Cleanup happens automatically via harness

### 4. Guaranteed Cleanup Works for Destructive Operations

The harness's `afterAll` cleanup runs even when tests delete documents. Current verified run,
2026-09-23, `write-operations.integration.spec.ts`, 9 of 9 passing:

```
[integration-harness] Created data root: /default-domain/workspaces/it-20260923-112307-59df
[write-ops] Isolation verified: 970 docs outside root before, 970 after
[integration-harness] Deleted data root: /default-domain/workspaces/it-20260923-112307-59df (confirmed absent)
```

Even though tests deleted 5+ documents, the harness still cleaned up the data root — and the
cleanup is now _verified_ rather than requested: it re-reads the path after the `DELETE` and
throws if it is still readable.

> **The run previously quoted here was invalid evidence and is kept only as a record of the
> defect.** It read:
>
> ```
> [write-ops] Isolation verified: 0 docs outside root before, 0 after
> ```
>
> Both figures were zero because the query behind them was not NXQL. `ecm:path NOT STARTSWITH`
> made Nuxeo answer HTTP 400 with an exception body carrying neither `resultsCount` nor
> `entries`, and the spec's `?? 0` fallbacks turned the rejection into `expect(0).toBe(0)`.
> It reported "0 docs outside root" against a repository holding hundreds of File documents,
> and would have passed just as well if the harness had deleted `/default-domain` wholesale —
> the precise outcome the test exists to detect. Reading "0 before, 0 after" as isolation
> working was reading a broken query as a clean result.
>
> The spec now uses `NOT (ecm:path STARTSWITH …)`, asserts the HTTP status, requires
> `resultsCount` to be a number, and requires the before-count to be greater than zero, so an
> empty or rejected result fails instead of passing. The 970 above is what that assertion is
> worth: a real baseline that a wrongly-scoped delete would move.

---

## Acceptance Criteria (from audit §11 Stage 6)

All criteria met:

✅ **Every operation verified by follow-up API query** (not UI assertion)

- Trash → query isTrashed
- Delete → expect 404
- Update → query properties
- Move → query path
- All operations verified via fetch, not UI

✅ **Each operation creates its own fixture and tears it down**

- Every test creates new document(s)
- No shared state
- Harness cleanup guaranteed

✅ **Destructive operations isolated in data root (cleanup verified)**

- All tests run in `/default-domain/workspaces/it-<runid>`
- Isolation test verifies no impact outside data root
- `deleteDataRoot` re-reads the data root after the `DELETE` and **throws** unless it is
  gone, so a leaked workspace fails the run

  This line previously read "cleanup logs confirm data root deleted", and that was not a
  verification: every path through `deleteDataRoot` was a `console.warn`, so the run stayed
  green whatever happened and the log was the only record. A `DELETE` answering 2xx is also
  not the same as the workspace being absent, which is why the check is a re-read rather
  than a status code.

---

## Test Output

```
✓ Write Operations Integration Tests > Trash Operations > can trash a document (35ms)
✓ Write Operations Integration Tests > Trash Operations > trashed documents do not appear in regular queries (10ms)
✓ Write Operations Integration Tests > Trash Operations > can restore a trashed document (24ms)
✓ Write Operations Integration Tests > Permanent Delete > can permanently delete a document (14ms)
✓ Write Operations Integration Tests > Permanent Delete > delete is truly permanent - document cannot be restored (10ms)
✓ Write Operations Integration Tests > Update Operations > can update document properties (9ms)
✓ Write Operations Integration Tests > Update Operations > can move a document to a different location (13ms)
✓ Write Operations Integration Tests > Bulk Operations > can delete multiple documents in one operation (18ms)
✓ Write Operations Integration Tests > Data Root Isolation > destructive operations are isolated to data root only (6ms)

Test Files  1 passed (1)
     Tests  9 passed (9)
  Start at  12:46:40
  Duration  151ms
```

**All 9 tests passing ✅**

Captured 2026-09-21. The Data Root Isolation line in it is true but was not yet meaningful —
its assertion could not fail at the time. Re-run 2026-09-23 with the repaired query, still
9 of 9, and the isolation figure is now a real 970; see "Guaranteed Cleanup" above.

---

## Coverage

### Implemented in Stage 6 ✅

- ✅ **Trash/restore/permanent-delete** — 5 tests total
  - Document.Trash automation
  - Document.Untrash automation
  - DELETE for permanent removal
  - Query verification
  - Irreversibility verification

- ✅ **Update operations** — 2 tests
  - Property updates (title, description)
  - Document.Move automation

- ✅ **Bulk actions** — 1 test
  - Document.Delete automation with multiple UIDs

- ✅ **Data root isolation** — 1 test
  - Verifies destructive operations don't affect wider repository

### Deferred (Complex, Lower Priority)

- ⏳ **Upload** — `uploadFileToBatch` end to end
  - Requires file handling (Blob, FormData)
  - Requires batch creation
  - More complex than other write operations
  - **Recommendation:** Implement when upload feature development starts

- ⏳ **Download** — simpler than upload but lower priority
  - Can be verified with fetch + blob handling
  - **Recommendation:** Implement alongside upload

---

## Integration with Existing Infrastructure

### Harness Integration ✅

Uses the same harness as Stage 4 (example tests) and Stage 5 (SearchService tests):

```typescript
import { setupIntegrationHarness, createTestDocument } from './integration-harness';

const harness = setupIntegrationHarness();
```

`setupIntegrationHarness` takes no `allowDefaultCredentials` option any more, and this example
used to pass one. Copying it verbatim now fails type-checking, which is the visible half of the
problem; the invisible half was worse. A per-suite `allowDefaultCredentials: true` meant every
suite silently opted itself out of the credentials guard, so the check never fired for anyone.

The guard it opted out of has since been replaced outright, because moving the opt-in to
invocation time fixed its reachability without fixing what it measured: it compared the
credentials against the Docker default, so a real production pair was recorded as _satisfying_
it. The run-safety gate is now a host allowlist, denying by default, read from the environment
only, with `localhost` named like anything else:

```bash
export INTEGRATION_ALLOWED_HOSTS=localhost:8080
npm run beta:integration
```

### Follows Established Patterns ✅

- Per-run data root
- Precondition checks
- Guaranteed cleanup
- Type-safe fixtures (uses `createTestDocument` helper)

### Demonstrates Write Path Pattern ✅

Other services can follow this pattern:

1. Create fixture with `createTestDocument`
2. Perform write operation
3. Verify with follow-up API query
4. Assert on result
5. Cleanup automatic

---

## Nuxeo Automation Operations Used

### Document.Trash

```json
POST /nuxeo/api/v1/automation/Document.Trash
{
  "input": "doc:<uid>"
}
```

Returns: 200 with trashed document

### Document.Untrash

```json
POST /nuxeo/api/v1/automation/Document.Untrash
{
  "input": "doc:<uid>"
}
```

Returns: 200 with restored document

### Document.Delete

```json
POST /nuxeo/api/v1/automation/Document.Delete
{
  "input": "docs:<uid1>,<uid2>,<uid3>"
}
```

Returns: 200 (documents permanently deleted)

### Document.Move

```json
POST /nuxeo/api/v1/automation/Document.Move
{
  "input": "doc:<uid>",
  "params": {
    "target": "<targetFolderUid>"
  }
}
```

Returns: 200 with moved document

---

## Comparison to Other Stages

| Stage                   | Tests | Status             | Notes                          |
| ----------------------- | ----- | ------------------ | ------------------------------ |
| Stage 4 (Harness)       | 5     | 4/5 passing        | 1 expected failure (index lag) |
| Stage 5 (SearchService) | 19    | Written            | Pending TestBed setup          |
| **Stage 6 (Write Ops)** | **9** | **9/9 passing ✅** | **All working**                |

Stage 6 is the first stage with 100% of tests passing and verified.

---

## File Created

**`libs/integration-tests/src/lib/write-operations.integration.spec.ts`**

- 426 lines
- 9 tests across 5 describe blocks
- Comprehensive coverage of write paths

---

## Next Steps

### Immediate

1. **Stage 7: RBAC and Guards** (P1, Large)
   - Auth guards integration tests
   - principal-permissions.service.ts
   - ACL read/write with inherited-vs-local ACLs
   - **Blocker:** Need non-administrator fixture user

2. **Stage 5 completion:** Configure Angular TestBed for vitest
   - Enables SearchService test execution
   - 19 tests already written, just need environment setup

### Short-term

3. **Stage 8: Feature Workflows** (P1, Large)
   - Collections membership
   - Document-detail write paths
   - Notes, CSV export
   - Trash component
   - AiFeatureFlagService opt-out

4. **Upload/Download** (deferred from Stage 6)
   - Implement when upload feature development starts
   - Complex file handling

### Long-term

5. **Stage 9: Fold in Orphans** (P2, Medium)
   - Promote session-timeout.mjs, clipboard-move-scenarios.mjs
   - Convert note-document-scenarios.mjs
   - Bring 13 evidence steps under scheduled run

---

## Recommendations

1. **Use this pattern for all write operations**
   - Automation operations (not direct property updates)
   - Follow-up API verification
   - Per-test fixtures

2. **Document automation operations**
   - Create reference doc for commonly-used operations
   - Examples: Document.Trash, Document.Move, Document.Delete
   - Parameters and expected responses

3. **Expand bulk operation tests**
   - Bulk trash (not just delete)
   - Bulk move
   - Bulk property updates

4. **Add negative tests**
   - Try to trash already-trashed document
   - Try to move to non-existent folder
   - Try to delete document without permissions

---

## References

- **Audit:** `docs/integration-test-audit.md` §11 Stage 6
- **Implementation:** `libs/integration-tests/src/lib/write-operations.integration.spec.ts`
- **Harness:** `libs/integration-tests/src/lib/integration-harness.ts`
- **Nuxeo Automation API:** https://doc.nuxeo.com/nxdoc/automation/

---

## Conclusion

**Stage 6: COMPLETE AND VERIFIED ✅**

All 9 write operation tests pass with live Nuxeo. The integration test harness works perfectly for destructive operations with guaranteed cleanup. Pattern established for future write path tests.

**Key Achievement:** First stage with 100% tests passing and verified. Demonstrates the harness is production-ready for write operations.

---

**Last Updated:** 2026-09-21  
**Status:** ✅ Complete, all tests passing, ready for Stage 7
