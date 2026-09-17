# NXSAT-162 — API Evidence (2026-07-14)

Captured against **satori-ui.beta.nuxeocloud.com** for document `e28a9505-b85e-4a0f-a762-fb5060106b45`.

## Which APIs expose group permissions?

There is **no single "group permissions" endpoint**. Group-based access is split across two Nuxeo REST APIs:

### 1. Document ACL API — group ACEs on the document

**Endpoint**

```
GET /nuxeo/api/v1/id/{docUid}
```

**Headers**

| Header | Value | Purpose |
|--------|-------|---------|
| `enrichers-document` | `acls,permissions,userVisiblePermissions` | ACL rows + effective permissions for the **authenticated user** |
| `fetch-acls` | `username,creator,extended` | Resolve group/user principals and extended ACE fields |

**Where group permissions appear**

```json
"contextParameters": {
  "acls": [{
    "name": "local",
    "aces": [{
      "username": "readonly-group",   // ← group principal
      "permission": "Everything",     // ← group-level ACE on this document
      "granted": true
    }]
  }]
}
```

This is the API that shows **`readonly-group → Everything`** on the test document.

**Evidence file:** `03-doc-as-satori-admin.json` (admin view, same ACL for all callers)

---

### 2. Current User API — which groups the user belongs to

**Endpoint**

```
GET /nuxeo/api/v1/me
```

**Where group membership appears**

```json
"properties": {
  "groups": ["members", "readonly-group"]
}
```

This links the user to the group ACE above. Because `user-readonly01` ∈ `readonly-group`, the `readonly-group:Everything` ACE applies.

**Evidence file:** `02-me-user-readonly01.json`

---

### 3. Effective permissions enricher — what the UI gates on (PR #96)

Returned on the **same document GET** as #1, under:

```json
"contextParameters": {
  "permissions": ["Read", "WriteSecurity", "Everything", ...]
}
```

PR #96 checks `WriteSecurity` or `Everything` in this array to show/hide Edit/Delete buttons.

**Evidence file:** `01-doc-as-user-readonly01.json`

For `user-readonly01`, the enricher returns **both** `WriteSecurity` and `Everything` because of the group ACE — even though the user's personal ACE is only `Read`.

---

## Evidence file index

| File | API | Auth user | What it proves |
|------|-----|-----------|----------------|
| `01-doc-as-user-readonly01.json` | `GET /id/{uid}` | user-readonly01 | Effective permissions include `WriteSecurity` + `Everything` |
| `02-me-user-readonly01.json` | `GET /me` | user-readonly01 | User is member of `readonly-group` |
| `03-doc-as-satori-admin.json` | `GET /id/{uid}` | satori-admin | Document has `readonly-group:Everything` local ACE |
| `04-doc-as-randomUser01.json` | `GET /id/{uid}` | randomUser01 | Cross-check: same elevated permissions via group |
| `05-me-randomUser01.json` | `GET /me` | randomUser01 | Also member of `readonly-group` |

---

## Key finding (chain of evidence)

```
03-doc-as-satori-admin.json
  contextParameters.acls[local].aces
    → readonly-group : Everything

02-me-user-readonly01.json
  properties.groups
    → user-readonly01 ∈ readonly-group

01-doc-as-user-readonly01.json
  contextParameters.permissions
    → includes WriteSecurity, Everything
    → PR #96 canManagePermissions() = true → buttons shown (correct)
```

---

## Optional: Group entity API (not needed for this RCA)

To inspect group **members** or group metadata (not document ACLs):

```
GET /nuxeo/api/v1/group/{groupName}
```

Not captured here — document ACL + `/me` is sufficient to explain NXSAT-162.
