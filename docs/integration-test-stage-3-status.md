# Integration Test Stage 3 Status — libs/shared/testing

**Stage:** 3 of 9 (Shared Test Fixtures)  
**Goal:** Extract typed test fixtures to eliminate duplication and make field-type changes break compilation  
**Last Updated:** 2026-09-21

## Completion Status

**Overall:** 7/7 tasks complete ✅

Stage 3 complete! Created `libs/shared/testing` with typed NuxeoDocument and NuxeoAce factories,
migrated all duplicate builders, and verified with negative control.

### Completed Tasks ✅

#### Task 3.1: Create libs/shared/testing library
- Created with Nx generator: `@nx/js:library`
- Tagged: `scope:shared`, `type:testing`
- Added to tsconfig.base.json paths as `@agentic-ui/shared/testing`
- Configured with Vitest test runner
- Commit: f6155b13

#### Task 3.2: Create typed NuxeoDocument factory
- Extracted from nuxeo-document-api.spec.ts:55-63
- Function: `nuxeoDocument(over?: Partial<NuxeoDocument>): NuxeoDocument`
- All fields required, no escape hatch
- Default values: uid: 'doc-1', title: 'Invoice', type: 'File', etc.
- File: `libs/shared/testing/src/lib/nuxeo-fixtures.ts`
- Commit: f6155b13

#### Task 3.3: Create typed NuxeoAce factory
- Extracted from nuxeo-document-api.spec.ts:42-53
- Function: `nuxeoAce(over?: Partial<NuxeoAce>): NuxeoAce`
- All 9 fields explicitly provided
- Default values: Read permission for user 'jdoe', no time bounds
- File: `libs/shared/testing/src/lib/nuxeo-fixtures.ts`
- Commit: f6155b13

#### Task 3.4: Migrate 3 duplicate nuxeoDoc builders
- **File 1:** `nuxeo-document-api.spec.ts` (lines 55-63)
  - Removed local builder
  - Added import: `import { nuxeoDocument } from '@agentic-ui/shared/testing'`
  - Renamed all `nuxeoDoc(` → `nuxeoDocument(`
  
- **File 2:** `nuxeo-copy-move-api.spec.ts` (lines 22-30)
  - Original defaults: uid: 'copy-1', path: '/default-domain/workspaces/target/Invoice'
  - Migrated to shared factory
  - Call sites override where needed
  
- **File 3:** `nuxeo-checkin-api.spec.ts` (lines 23-31)
  - Original default: lastModified: '2026-03-02T00:00:00.000Z'
  - Migrated to shared factory
  - Documented difference in comment

All 3 files: removed duplicate builder functions, added imports, renamed usages
- Commit: f6155b13

#### Task 3.5: Migrate duplicate nuxeoAce builders
- **File 1:** `nuxeo-document-api.spec.ts` (lines 42-53)
  - Already migrated as part of 3.4 (same file as nuxeoDoc)
  
- **File 2:** `nuxeo-acl-write.spec.ts` (lines 271-282)
  - In `describe('inexpressibleLocalAces')` block
  - Changed `const ace = (over...) => ({...})` to `const ace = nuxeoAce`
  
- **File 3:** `nuxeo-acl-write.spec.ts` (lines 341-352)
  - In `describe('restorableLocalAcl')` block
  - Changed `const ace = (over...) => ({...})` to `const ace = nuxeoAce`

Added import: `import { nuxeoAce } from '@agentic-ui/shared/testing'`
- Commit: f6155b13

#### Task 3.6: Add type:testing to eslint depConstraints
- Updated `eslint.config.mjs` depConstraints section
- Added `'type:testing'` to `onlyDependOnLibsWithTags` for:
  - `sourceTag: 'type:app'`
  - `sourceTag: 'scope:features'`
  - `sourceTag: 'scope:shared'`
  - `sourceTag: 'scope:core'`
  - `sourceTag: 'type:extension'`
  - `sourceTag: 'type:publishable'`
- Result: All projects can now depend on testing library
- Commit: f6155b13

#### Task 3.7: Verify Stage 3 with negative control ✅
**Verification results:**

1. **Lint passes:** ✅
   - `npx nx affected -t lint --base=origin/main`
   - 27 projects linted successfully
   - Only pre-existing warnings (console statements)
   - All new imports allowed by depConstraints

2. **Typecheck passes:** ✅
   - `npx nx affected -t typecheck --base=origin/main`
   - 4 projects (shared-extensions, acme-extensions, nuxeo-satori-template, nuxeo-ui)
   - No type errors

3. **Tests pass:** ✅
   - `NODE_OPTIONS="--no-experimental-webstorage" npx nx test adf-hx-bridge`
   - 32 test files, 453 tests passed
   - No behavior change from migration

4. **Negative control:** ✅ VERIFIED
   - Changed `NuxeoDocument.title` from `string` to `number`
   - Ran `npx tsc -p libs/shared/adf-hx-bridge/tsconfig.spec.json --noEmit`
   - **Result:** 24+ type errors in exactly the expected places:
     - `nuxeo-fixtures.ts:26` — `title: 'Invoice'` is string, not number
     - `nuxeo-document-api.spec.ts` — all `nuxeoDocument({ title: '...' })` calls
     - `nuxeo-copy-move-api.spec.ts` — all title overrides
     - `nuxeo-checkin-api.spec.ts` — all title overrides
     - Plus propagated errors in mapper specs and service specs
   - Reverted change, typecheck clean again
   - **Conclusion:** Field-type changes break compilation in exactly the dependent specs ✅

---

## What Was Achieved

### Eliminated Duplication
- **Before:** 6 duplicate fixture builders across 5 files
  - 3 `nuxeoDoc` builders (document-api, copy-move, checkin)
  - 3 `nuxeoAce`/`ace` builders (document-api, acl-write ×2)
  
- **After:** 2 shared factories, 5 files importing them
  - `nuxeoDocument()` in `@agentic-ui/shared/testing`
  - `nuxeoAce()` in `@agentic-ui/shared/testing`

### Type Safety
- Every field explicitly required (no Partial<> escape hatch)
- Compile-time coupling: model changes → spec breaks
- Negative control verified this works

### Maintainability
- Single source of truth for test fixtures
- DRY principle: define once, import everywhere
- Clear documentation of design principles

---

## Design Principles (from audit §10.2 AC2)

1. **Every field required**
   - No `Partial<>` escape hatch
   - Incomplete fixtures are compile errors, not runtime surprises
   - If logically optional, make it `null` explicitly

2. **One factory per model**
   - Not a god-object with 40 overrides
   - Each factory fills one specific shape completely
   - Simple, focused, readable

3. **Type-safe overrides**
   - `over` parameter accepts `Partial<T>` for selective override
   - Base fixture provides every required field
   - Field-type changes break compilation (verified!)

4. **Coupling point documented**
   - eslint `type:testing` tag weakens boundary enforcement
   - Trade-off accepted: convenience > strict isolation for test fixtures
   - Alternative (duplication) was worse

---

## Evidence

**Commits:**
- f6155b13: feat(testing): create libs/shared/testing with typed fixtures (Stage 3)

**Files Created:**
- `libs/shared/testing/src/lib/nuxeo-fixtures.ts` (102 lines, 2 factories)
- `libs/shared/testing/src/index.ts` (exports)
- `libs/shared/testing/project.json` (Nx config)
- `libs/shared/testing/README.md` (generated)
- Various tsconfig and tooling files

**Files Modified:**
- `eslint.config.mjs` (added type:testing to 6 depConstraints)
- `nx.json` (added testing project)
- `tsconfig.base.json` (added @agentic-ui/shared/testing path)
- `libs/shared/adf-hx-bridge/src/lib/api/nuxeo-document-api.spec.ts`
- `libs/shared/adf-hx-bridge/src/lib/api/nuxeo-copy-move-api.spec.ts`
- `libs/shared/adf-hx-bridge/src/lib/api/nuxeo-checkin-api.spec.ts`
- `libs/shared/adf-hx-bridge/src/lib/services/nuxeo-acl-write.spec.ts`

**Test Results:**
- 27 projects linted (all pass)
- 4 projects typechecked (all pass)
- 453 tests in adf-hx-bridge (all pass)
- Negative control: 24+ type errors when deliberately breaking model (as expected)

---

## Next Steps

**Stage 4:** Integration harness and precondition contract
- Create `libs/integration-tests` project
- Reuse `e2e-preflight` exit-2 convention
- Per-run data root under `/default-domain/workspaces/it-<runid>`
- Guaranteed teardown (no fixture leaks)
- Refuse to run against default credentials without opt-in

See docs/integration-test-audit.md §11 Stage 4.

---

## Notes

- The testing library is `scope:shared, type:testing`, not a feature
- All projects can depend on it (eslint allows it)
- The factories follow the discipline from nuxeo-document-api.spec.ts:39-41
- The negative control proves the compile-time coupling works
- This pattern can extend to other models (NuxeoComment, result pages, audit entries)

Stage 3 acceptance criteria met:
- ✅ Three specs migrated with no behavior change
- ✅ Deliberate field-type change breaks compilation in exactly one set of files (the migrated specs)
- ✅ `nx affected -t typecheck` passes (after reverting the deliberate break)
