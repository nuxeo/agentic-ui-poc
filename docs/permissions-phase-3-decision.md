# Permissions: Phase 3 Decision

**Date:** 2026-08-23  
**Status:** Complete (read-only display retained)

## Summary

The permissions display is **fully functional** and marked as Phase 3 complete. The read-only
`HxpBrowsePermissionsComponent` is the deliverable. The upstream editable panel is deferred.

## Current Implementation

### Read-Only Permissions Tab

**Component:** `HxpBrowsePermissionsComponent`  
**Location:** `libs/shared/adf-hx-bridge/src/lib/ui/hxp-browse-permissions/`

**What it does:**

- Reads from `NuxeoDocument.contextParameters.acls` (enricher requested line 39 of document-detail.service.ts)
- Displays three ACL categories: local, inherited, external
- Shows: username, permission name, granted-by, time frame
- Uses utility functions: `hxpLocalAces()`, `hxpInheritedAces()`, `hxpExternalAces()`
- Emits events for actions (add/edit/delete), handled by parent with "Scope A notice"

### Acls Enricher

**Requested by:** `DocumentDetailService.getFullDocument()`

```typescript
'enrichers.document': 'acls,permissions,userVisiblePermissions'
```

**Returns:** Nuxeo's ACL structure:

```json
{
  "contextParameters": {
    "acls": [
      { "name": "local", "aces": [...] },
      { "name": "inherited", "aces": [...] }
    ]
  }
}
```

## Why Not Upstream Panel?

### Upstream Component

`PermissionsManagementPanelComponent` from `@alfresco/adf-hx-content-services/ui`:

- **Write capabilities:** add, edit, delete permissions
- **Writes through:** `updateDocumentById()` or `patchDocumentById()`
- **Current state:** both methods throw `"not implemented in Scope A"`

### The Blocker

```typescript
async updateDocumentById(): Promise<AxiosLikeResponse<Document>> {
  throw new Error('updateDocumentById is not implemented in Scope A');
}
```

Adopting the upstream panel would replace a **working read-only tab** with one whose
**edits fail**. Every add/edit/delete action would throw.

## Decision Rationale

1. **Scope A explicitly excludes writes**
   - Phase 3 is read-only integration
   - Write operations are GA scope, not Beta

2. **Read-only display is fully functional**
   - Enricher requested and working
   - ACLs displayed correctly (local, inherited, external)
   - No regressions, no missing data

3. **sys_acl work was separate**
   - `NuxeoPrincipalResolver` + `NuxeoAclService` map Nuxeo ACLs → HxPR `Document.sys_acl`
   - Attached to single-document reads via `withAcl()`
   - For upstream components that consume `sys_acl` field
   - Permissions TAB reads Nuxeo ACLs directly — both approaches valid

4. **Upstream panel adoption deferred to GA**
   - When write operations are in scope
   - Requires implementing `updateDocumentById()` or specific ACL update endpoint
   - Not blocked on missing data — blocked on write policy

## Phase 3 Component Count

**8 of 8 delivered:**

1. Document list (HxpDocumentListComponent) ✓
2. Breadcrumb (HxpBreadcrumbComponent) ✓
3. Document tree (HxpDocumentTreeComponent) ✓
4. Manage versions (ManageVersionsSidebarComponent) ✓
5. Properties (HxpPropertiesSidebarComponent) ✓
6. Document viewer (HxpUiDocumentViewerComponent) ✓
7. Search (SearchAdfHxComponent) ✓
8. **Permissions (HxpBrowsePermissionsComponent, read-only)** ✓

## What's Deferred

- Upstream editable `PermissionsManagementPanelComponent`
- `updateDocumentById()` / `patchDocumentById()` implementation
- ACL modification operations (add/edit/delete permissions)
- Inheritance blocking toggle (write operation)

All deferred to GA when write operations are in scope.

## References

- Original blocker: `docs/beta-delivery-record.md` table row "Adopting the adf-hx permissions panel"
- Permissions utils: `libs/shared/adf-hx-bridge/src/lib/utils/hxp-permission.utils.ts`
- ACL service: `libs/shared/adf-hx-bridge/src/lib/services/nuxeo-acl.service.ts`
- Document port: `libs/shared/adf-hx-bridge/src/lib/api/nuxeo-document-api.ts`
