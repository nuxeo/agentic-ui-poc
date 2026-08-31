# Permissions: the upstream panel, and the decision that deferred it

**Superseded:** 2026-08-31 — the deferral recorded here on 2026-08-23 was **reversed**.
`PermissionsManagementPanelComponent` from `@alfresco/adf-hx-content-services/ui` is adopted, and
the hand-written `HxpBrowsePermissionsComponent` it replaced is deleted.

The original decision is kept below rather than deleted, because the reason it was wrong is the
useful part.

---

## What ships now

**Component:** `PermissionsManagementPanelComponent`, upstream, unmodified
**Renders at:** `libs/features/browse/src/lib/browse-adf-hx-poc/browse-adf-hx-poc.html`, the
`permissions` tab of the `/#/browse-adf-hx` route
**Test:** `libs/features/browse/src/lib/browse-adf-hx-poc/upstream-permissions-panel.spec.ts`

It reads and it writes. Reads come from Nuxeo's `acls` enricher; writes go back through
`Document.RemoveACL`, `Document.AddPermission` and `Document.BlockPermissionInheritance`.

### The read: two ACL fields, not one

The panel builds one row per principal from `sys_effectiveAcl`, then calls an ACE **local** only if
the same ACE also appears in `sys_acl` — matching on principal, permission, `granted`, `creator`,
`begin`, `end` and `status`. So the two fields have to be populated separately:

| HxPR field         | Nuxeo source               |
| ------------------ | -------------------------- |
| `sys_acl`          | the `local` named ACL only |
| `sys_effectiveAcl` | every named ACL, flattened |

`NuxeoAclService.localAclFor` and `.aclFor` respectively; `NuxeoDocumentApi.withAcl` sets both.
Filling only `sys_acl` — which is what the port did while the panel was deferred — renders a
plausible table in which every inherited grant appears local, and a save then writes them back as
local ones. With only `sys_effectiveAcl` unset the panel renders **no rows at all**.

Blocked inheritance is not a flag in either model. Nuxeo writes a deny-everything ACE for
`Everyone` into the local ACL and drops the `inherited` ACL from the payload; upstream recognises
the same marker only as `user.id === '__Everyone__'`. `NuxeoAclService` translates the name, and
short-circuits the directory lookup for it, since `Everyone` is not a directory entry.

### The write: clear, replay, block

Nuxeo has **no operation that replaces an ACL**. `NuxeoDocumentApi.updateDocumentById` therefore
clears the local ACL and replays the grants the panel kept:

1. `Document.RemoveACL` with `acl: local`
2. one `Document.AddPermission` per grant
3. `Document.BlockPermissionInheritance`, last, if the panel turned inheritance off — Nuxeo appends
   to the ACL, and a deny ahead of a grant would shadow it

Three consequences worth knowing before relying on it:

- **The window between step 1 and step 2 is real.** A failure part-way leaves the document on its
  inherited permissions until the caller retries. Nuxeo checks `WriteSecurity` on each call, so a
  user without it gets a 403 on the first and nothing is lost.
- **`creator`, `begin` and `end` survive only as far as `AddPermission` supports them.** Upstream
  stamps an edited ACE's `creator` with the current user; Nuxeo's operation takes `begin`/`end` but
  assigns `creator` itself.
- **A deny ACE other than the inheritance marker cannot be written.** `AddPermission` only grants.
  Rather than dropping such an ACE silently, the port throws and names the principals — see
  `toNuxeoLocalAclWrite`, which returns them as `deniedPrincipals`.

`updateDocumentById` accepts `{ sys_acl }` and nothing else, because `{ sys_acl }` is exactly what
upstream's only caller (`PermissionsDataAccessService.updateDocument`) sends. A general property
patch would be a claim Nuxeo's ACL operations cannot honour, so anything else is refused by name.

### The port that was missing

Ten of the twelve API ports the panel needs already existed. One thing did not, and it is not an
API port at all: `IDENTITY_USER_SERVICE_TOKEN`. Upstream ships **no** implementation and does not
include it in `provideAdfEnterpriseAdfHxContentServicesServices()` — it is an intended substitution
point for the host's identity provider. `PermissionsParserService` takes it non-optionally, so the
panel fails `NG0201` without it. `NuxeoIdentityUserService` answers it from `CURRENT_USERNAME` and
`UserService`.

`DocumentDetailService.removeAcl` was added for step 1 above; `addPermission` and
`blockPermissionInheritance` were already there.

### Permissions are enforced by Nuxeo, not by this panel

Every operation above is checked server-side against `WriteSecurity`. The panel renders what the
current user can see and sends what they ask for; hiding a control here — in a manifest or
anywhere else — is not a security control.

---

## The original decision, 2026-08-23, and why it was wrong

> Adopting the upstream panel would replace a working read-only tab with one whose edits fail.
> Every add/edit/delete action would throw. […] Not blocked on missing data — blocked on write
> policy.

Two things in that reasoning did not hold.

**The blocker was stated as a policy and was actually an unexplored capability.** The record said
writes were "GA scope, not Beta", but the concrete obstacle it cited was that
`updateDocumentById` threw. Nobody had checked whether Nuxeo could back it. Nuxeo has had
`Document.AddPermission`, `Document.RemoveACL` and `Document.BlockPermissionInheritance` throughout;
the only genuinely missing piece was a replace-an-ACL semantic, and clear-then-replay covers it with
the caveats listed above. A "policy" that rests on an unverified technical claim is a technical
question wearing a decision's clothes.

**"Both approaches valid" was not true.** The record noted that the permissions tab read Nuxeo ACLs
directly while `sys_acl` was populated separately for upstream components, and treated that as two
equivalent routes. It was one working route and one that looked like it worked: `sys_acl` carried
every ACE flattened together, which is wrong for any upstream consumer that distinguishes local from
inherited — and the permissions panel is exactly that consumer. The defect was invisible for as long
as nothing consumed the field.

The component count in the original — "8 of 8 delivered", with the hand-written component listed as
the eighth — is the shape this programme has been warned about twice: a locally written lookalike
counted as an adoption. There are now seven adopted upstream components and no hand-written
permissions table.

## References

- ACL mapping: `libs/shared/adf-hx-bridge/src/lib/services/nuxeo-acl.service.ts`
- Document port: `libs/shared/adf-hx-bridge/src/lib/api/nuxeo-document-api.ts`
- Identity port: `libs/shared/adf-hx-bridge/src/lib/services/nuxeo-identity-user.service.ts`
- Nuxeo ACL operations: `AGENTS/02-nuxeo-apis.md`
