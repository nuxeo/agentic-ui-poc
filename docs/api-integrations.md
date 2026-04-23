# API Integrations

This document tracks all Nuxeo REST API integrations used in the application. When adding a new API call, append an entry following the format below.

**Base URL:** `/nuxeo` (proxied to `http://localhost:8080` in development via `apps/nuxeo-ui/proxy.conf.json`)

**Authentication:** All `/nuxeo/**` requests are automatically decorated with `Authorization: Basic <credentials>` by the `nuxeoAuthInterceptor` (see `apps/nuxeo-ui/src/app/auth/nuxeo-auth.interceptor.ts`).

---

## 1. Login (Validate Credentials)

| Field           | Value                                                        |
| --------------- | ------------------------------------------------------------ |
| **Service**     | `AuthService` (`apps/nuxeo-ui/src/app/auth/auth.service.ts`) |
| **Method**      | `login(username, password, remember)`                        |
| **HTTP Method** | `GET`                                                        |
| **Endpoint**    | `/nuxeo/api/v1/me`                                           |

**Request Headers:**

| Header          | Value                               |
| --------------- | ----------------------------------- |
| `Authorization` | `Basic <base64(username:password)>` |
| `Accept`        | `application/json`                  |

**Request Payload:** None (GET request).

**Response (200 OK):**

```json
{
  "entity-type": "user",
  "id": "Administrator",
  "properties": {
    "firstName": "",
    "lastName": "",
    "groups": ["administrators"],
    "email": "devnull@nuxeo.com",
    "username": "Administrator"
  },
  "isAdministrator": true,
  "isAnonymous": false
}
```

**Error Handling:**

| Status                | Message shown to user                                      |
| --------------------- | ---------------------------------------------------------- |
| 401 / 403             | "Invalid username or password."                            |
| Other / Network error | "Could not reach Nuxeo. Check the server, proxy, and URL." |

---

## 2. Recently Edited Documents (Dashboard Widget)

| Field           | Value                                                                               |
| --------------- | ----------------------------------------------------------------------------------- |
| **Service**     | `DocumentService` (`libs/shared/nuxeo-client/src/lib/services/document.service.ts`) |
| **Method**      | `getRecentlyEdited(pageSize)`                                                       |
| **HTTP Method** | `GET`                                                                               |
| **Endpoint**    | `/nuxeo/api/v1/search/lang/NXQL/execute`                                            |

**Query Parameters:**

| Parameter  | Value                                                                                                                                                          |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query`    | `SELECT * FROM Document WHERE ecm:mixinType != 'HiddenInNavigation' AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0 ORDER BY dc:modified DESC` |
| `pageSize` | `10` (default)                                                                                                                                                 |

**Request Headers:**

| Header          | Value                                        |
| --------------- | -------------------------------------------- |
| `Authorization` | `Basic <credentials>` (added by interceptor) |
| `properties`    | `dublincore`                                 |

**Request Payload:** None (GET request).

**Response (200 OK):**

```json
{
  "entity-type": "documents",
  "totalSize": 31,
  "currentPageSize": 10,
  "currentPageIndex": 0,
  "numberOfPages": 4,
  "entries": [
    {
      "entity-type": "document",
      "uid": "e5fb3f92-...",
      "title": "lta_merged.pdf",
      "type": "File",
      "path": "/default-domain/workspaces/MyWS/lta_merged.pdf",
      "lastModified": "2026-01-23T07:09:27.760Z",
      "properties": {
        "dc:title": "lta_merged.pdf",
        "dc:modified": "2026-01-23T07:09:27.760Z",
        "dc:lastContributor": "Administrator",
        "dc:creator": "Administrator"
      }
    }
  ]
}
```

**Key response fields used:**

| Field                                        | Usage                                                        |
| -------------------------------------------- | ------------------------------------------------------------ |
| `entries[].title`                            | Document name displayed in the widget                        |
| `entries[].type`                             | Mapped to a Material icon (File, Note, Picture, Video, etc.) |
| `entries[].lastModified`                     | Formatted as medium date in the "Modified" column            |
| `entries[].properties['dc:lastContributor']` | Shown in the "Last Contributor" column                       |

---

## 3. User Tasks (Dashboard Widget)

| Field           | Value                                                                       |
| --------------- | --------------------------------------------------------------------------- |
| **Service**     | `TaskService` (`libs/shared/nuxeo-client/src/lib/services/task.service.ts`) |
| **Method**      | `getUserTasks(userId, pageSize)`                                            |
| **HTTP Method** | `GET`                                                                       |
| **Endpoint**    | `/nuxeo/api/v1/task`                                                        |

**Query Parameters:**

| Parameter  | Value                                                  |
| ---------- | ------------------------------------------------------ |
| `userId`   | Current authenticated username (e.g., `Administrator`) |
| `pageSize` | `10` (default)                                         |

**Request Headers:**

| Header          | Value                                        |
| --------------- | -------------------------------------------- |
| `Authorization` | `Basic <credentials>` (added by interceptor) |

**Request Payload:** None (GET request).

**Response (200 OK):**

```json
{
  "entity-type": "tasks",
  "totalSize": 1,
  "entries": [
    {
      "entity-type": "task",
      "id": "17482830-cc55-...",
      "name": "wf.parallelDocumentReview.chooseParticipants.title",
      "workflowModelName": "ParallelDocumentReview",
      "created": "2026-01-23T05:47:09.086Z",
      "dueDate": "2026-01-24T05:47:09.069Z",
      "state": "opened",
      "targetDocumentIds": [{ "id": "b0f3b31e-..." }],
      "actors": [{ "id": "Administrator" }],
      "taskInfo": {
        "taskActions": [
          { "name": "cancel", "label": "wf.parallelDocumentReview.cancel" },
          { "name": "start_review", "label": "wf.parallelDocumentReview.startReview" }
        ]
      }
    }
  ]
}
```

**Enrichment:** For each task, the target document title is fetched via `GET /nuxeo/api/v1/id/{docId}` and merged as `targetDocTitle`. If the document fetch fails, the task is returned without the title.

**Key response fields used:**

| Field                               | Usage                                            |
| ----------------------------------- | ------------------------------------------------ |
| `entries[].name`                    | Task label (stripped of `wf.<workflow>.` prefix) |
| `entries[].dueDate`                 | Due date column; shown in red if overdue         |
| `entries[].workflowModelName`       | Workflow name (PascalCase split into words)      |
| `entries[].targetDocumentIds[0].id` | Used to fetch the target document title          |
| `targetDocTitle` (enriched)         | Shown below the task name                        |

---

## 4. Recently Viewed Documents (Dashboard Widget)

| Field           | Value                                                                               |
| --------------- | ----------------------------------------------------------------------------------- |
| **Service**     | `DocumentService` (`libs/shared/nuxeo-client/src/lib/services/document.service.ts`) |
| **Method**      | `getRecentlyViewed(userId, pageSize)`                                               |
| **HTTP Method** | `GET`                                                                               |
| **Endpoint**    | `/nuxeo/api/v1/search/lang/NXQL/execute`                                            |

**Query Parameters:**

| Parameter  | Value                                                                                                                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query`    | `SELECT * FROM Document WHERE ecm:mixinType != 'HiddenInNavigation' AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0 AND ecm:primaryType NOT IN ('Root', 'Favorites', 'Collections') AND (dc:creator = '{user}' OR dc:lastContributor = '{user}') ORDER BY dc:modified DESC` |
| `pageSize` | `10` (default)                                                                                                                                                                                                                                                                              |

**Request Headers:**

| Header          | Value                                        |
| --------------- | -------------------------------------------- |
| `Authorization` | `Basic <credentials>` (added by interceptor) |
| `properties`    | `dublincore`                                 |

**Response (200 OK):** Same document list shape as §2.

**Key response fields used:**

| Field                    | Usage                                                        |
| ------------------------ | ------------------------------------------------------------ |
| `entries[].title`        | Document name with type icon                                 |
| `entries[].type`         | Shown as a coloured badge (e.g., "Picture", "Video", "File") |
| `entries[].lastModified` | Shown as relative time in the "Last Viewed" column           |

---

## 5. Favorite Items (Dashboard Widget)

| Field           | Value                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Service**     | `CollectionService` (`libs/shared/nuxeo-client/src/lib/services/collection.service.ts`)                                 |
| **Method**      | `getFavorites(userId, pageSize)`                                                                                        |
| **HTTP Method** | `GET` (two-step)                                                                                                        |
| **Endpoint**    | Step 1: `/nuxeo/api/v1/search/lang/NXQL/execute` — Step 2: `/nuxeo/api/v1/search/pp/default_content_collection/execute` |

**Step 1 — Locate Favorites collection:**

| Parameter  | Value                                                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `query`    | `SELECT * FROM Document WHERE ecm:primaryType = 'Favorites' AND ecm:path STARTSWITH '/default-domain/UserWorkspaces/{user}'` |
| `pageSize` | `1`                                                                                                                          |

**Step 2 — Fetch collection members:**

| Parameter     | Value                                           |
| ------------- | ----------------------------------------------- |
| `queryParams` | UID of the Favorites collection found in step 1 |
| `pageSize`    | `10` (default)                                  |

**Request Headers:**

| Header          | Value                                        |
| --------------- | -------------------------------------------- |
| `Authorization` | `Basic <credentials>` (added by interceptor) |
| `properties`    | `dublincore`                                 |

**Response (200 OK):** Same document list shape as §2.

**Key response fields used:**

| Field                                        | Usage                                             |
| -------------------------------------------- | ------------------------------------------------- |
| `entries[].title`                            | Document name with type icon                      |
| `entries[].lastModified`                     | Formatted as medium date in the "Modified" column |
| `entries[].properties['dc:lastContributor']` | Shown in the "Last Contributor" column            |

**Empty state:** "You haven't starred documents yet."

---

## 6. Browse — Get Document by Path

| Field           | Value                                                                           |
| --------------- | ------------------------------------------------------------------------------- |
| **Service**     | `BrowseService` (`libs/shared/nuxeo-client/src/lib/services/browse.service.ts`) |
| **Method**      | `getByPath(nuxeoPath)`                                                          |
| **HTTP Method** | `GET`                                                                           |
| **Endpoint**    | `/nuxeo/api/v1/path{nuxeoPath}`                                                 |

**Request Headers:**

| Header          | Value                                        |
| --------------- | -------------------------------------------- |
| `Authorization` | `Basic <credentials>` (added by interceptor) |
| `properties`    | `dublincore`                                 |

**Request Payload:** None (GET request).

**Response (200 OK):**

```json
{
  "entity-type": "document",
  "uid": "29687dae-ac11-4627-9bd5-8993338cba2a",
  "title": "Domain",
  "type": "Domain",
  "path": "/default-domain",
  "lastModified": "2026-01-23T07:09:27.760Z",
  "properties": {
    "dc:title": "Domain",
    "dc:lastContributor": "Administrator"
  }
}
```

**Key response fields used:**

| Field   | Usage                                           |
| ------- | ----------------------------------------------- |
| `title` | Shown in breadcrumbs and nav drawer folder tree |
| `type`  | Used to determine folderish status and icon     |
| `path`  | Used for breadcrumb construction and navigation |

---

## 7. Browse — Get Children of a Document

| Field           | Value                                                                           |
| --------------- | ------------------------------------------------------------------------------- |
| **Service**     | `BrowseService` (`libs/shared/nuxeo-client/src/lib/services/browse.service.ts`) |
| **Method**      | `getChildren(nuxeoPath, pageSize, currentPageIndex)`                            |
| **HTTP Method** | `GET`                                                                           |
| **Endpoint**    | `/nuxeo/api/v1/path{nuxeoPath}/@children`                                       |

**Query Parameters:**

| Parameter          | Value          |
| ------------------ | -------------- |
| `pageSize`         | `50` (default) |
| `currentPageIndex` | `0` (default)  |

**Request Headers:**

| Header          | Value                                        |
| --------------- | -------------------------------------------- |
| `Authorization` | `Basic <credentials>` (added by interceptor) |
| `properties`    | `dublincore`                                 |

**Request Payload:** None (GET request).

**Response (200 OK):**

```json
{
  "entity-type": "documents",
  "totalSize": 5,
  "currentPageSize": 5,
  "currentPageIndex": 0,
  "numberOfPages": 1,
  "entries": [
    {
      "entity-type": "document",
      "uid": "e96c9e6d-...",
      "title": "Demo",
      "type": "Folder",
      "path": "/default-domain/Demo",
      "lastModified": "2026-01-09T09:06:53.838Z",
      "properties": {
        "dc:title": "Demo",
        "dc:lastContributor": "Administrator"
      }
    }
  ]
}
```

**Key response fields used:**

| Field                                        | Usage                                                            |
| -------------------------------------------- | ---------------------------------------------------------------- |
| `entries[].title`                            | Document/folder name in browse table and nav drawer tree         |
| `entries[].type`                             | Mapped to icon; determines if row is clickable (folderish types) |
| `entries[].path`                             | Used for navigation URL construction                             |
| `entries[].lastModified`                     | Shown in "Modified" column                                       |
| `entries[].properties['dc:lastContributor']` | Shown in "Last Contributor" column                               |
| `totalSize`                                  | Displayed as item count summary                                  |

**Used by:**

- **Browse page** (`libs/features/browse/src/lib/browse/browse.ts`) — displays folder contents
- **Nav drawer** (`apps/nuxeo-ui/src/app/shell/nav-drawer/nav-drawer.component.ts`) — builds folder tree

---

## 8. Document Detail — Full Document Metadata

| Field           | Value                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------ |
| **Service**     | `DocumentDetailService` (`libs/shared/nuxeo-client/src/lib/services/document-detail.service.ts`) |
| **Method**      | `getFullDocument(uid)`                                                                           |
| **HTTP Method** | `GET`                                                                                            |
| **Endpoint**    | `/nuxeo/api/v1/id/{uid}`                                                                         |

**Request Headers:**

| Header               | Value                                               |
| -------------------- | --------------------------------------------------- |
| `Authorization`      | `Basic <credentials>` (added by interceptor)        |
| `properties`         | `*` (all schemas)                                   |
| `enrichers.document` | `acls,renditions,favorites,subscribedNotifications` |

**Request Payload:** None (GET request).

**Response (200 OK):**

```json
{
  "entity-type": "document",
  "uid": "fc21784c-...",
  "title": "Copy of Copy of Nishanth",
  "type": "File",
  "path": "/default-domain/workspaces/Copy of Copy of Nishanth",
  "lastModified": "2026-01-09T09:06:53.838Z",
  "properties": {
    "dc:title": "Copy of Copy of Nishanth",
    "dc:created": "2025-12-22T08:45:07.967Z",
    "dc:modified": "2026-01-09T09:06:53.838Z",
    "dc:creator": "Administrator",
    "dc:lastContributor": "Administrator",
    "dc:contributors": ["Administrator"],
    "dc:expired": "2026-01-30T18:30:00.000Z",
    "dc:description": null,
    "file:content": {
      "name": "Screenshot.png",
      "mime-type": "image/png",
      "length": "1365461",
      "digest": "eabb036b5a962b6c..."
    },
    "uid:major_version": 0,
    "uid:minor_version": 0,
    "nxtag:tags": []
  },
  "contextParameters": {
    "acls": [
      {
        "name": "inherited",
        "aces": [
          {
            "id": "Administrator:Everything:true:::",
            "username": "Administrator",
            "externalUser": false,
            "permission": "Everything",
            "granted": true,
            "creator": null,
            "begin": null,
            "end": null,
            "status": "effective"
          },
          {
            "id": "members:Read:true:::",
            "username": "members",
            "externalUser": false,
            "permission": "Read",
            "granted": true,
            "creator": null,
            "begin": null,
            "end": null,
            "status": "effective"
          }
        ]
      }
    ]
  }
}
```

**Key response fields used:**

| Field                                                   | Usage                                                                       |
| ------------------------------------------------------- | --------------------------------------------------------------------------- |
| `properties['file:content']['mime-type']`               | Determines viewer type (image vs PDF vs fallback)                           |
| `properties['file:content']['name']`                    | File name shown in viewer footer                                            |
| `properties['file:content']['length']`                  | File size shown in viewer footer                                            |
| `properties['dc:created']` / `dc:modified`              | Shown in properties panel                                                   |
| `properties['dc:creator']` / `dc:contributors`          | Shown in properties panel                                                   |
| `properties['dc:expired']`                              | Expiry date in properties panel                                             |
| `properties['uid:major_version']` / `uid:minor_version` | Version badge                                                               |
| `properties['nxtag:tags']`                              | Tag chips                                                                   |
| `contextParameters.acls[].name`                         | ACL name: `"local"` or `"inherited"` — determines section placement         |
| `contextParameters.acls[].aces[].username`              | User/group name shown in permissions table                                  |
| `contextParameters.acls[].aces[].permission`            | Permission level mapped to label (e.g., "Everything" → "Manage everything") |
| `contextParameters.acls[].aces[].granted`               | Whether permission is granted (only granted entries shown)                  |
| `contextParameters.acls[].aces[].externalUser`          | Separates external user permissions into their own section                  |
| `contextParameters.acls[].aces[].creator`               | Who granted the permission ("Granted by" column)                            |
| `contextParameters.acls[].aces[].begin` / `end`         | Date range for time-limited permissions; null = "Permanent"                 |

---

## 9. Document Detail — Blob Download

| Field           | Value                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------ |
| **Service**     | `DocumentDetailService` (`libs/shared/nuxeo-client/src/lib/services/document-detail.service.ts`) |
| **Method**      | `fetchBlob(uid)`                                                                                 |
| **HTTP Method** | `GET`                                                                                            |
| **Endpoint**    | `/nuxeo/api/v1/id/{uid}/@blob/blobholder:0`                                                      |

**Request Headers:**

| Header          | Value                                        |
| --------------- | -------------------------------------------- |
| `Authorization` | `Basic <credentials>` (added by interceptor) |

**Response:** Raw binary blob (`image/png`, `application/pdf`, etc.)

**Usage:** Fetched via `HttpClient` with `responseType: 'blob'`, converted to an Object URL (`URL.createObjectURL`) for use in `<img>` and `<iframe>` elements. This approach ensures auth credentials are sent via the interceptor, which is not possible with direct `src` attribute binding.

---

## 10. Document Detail — PDF Rendition

| Field           | Value                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------ |
| **Service**     | `DocumentDetailService` (`libs/shared/nuxeo-client/src/lib/services/document-detail.service.ts`) |
| **Method**      | `fetchPdfRendition(uid)`                                                                         |
| **HTTP Method** | `GET`                                                                                            |
| **Endpoint**    | `/nuxeo/api/v1/id/{uid}/@rendition/pdf`                                                          |

**Request Headers:**

| Header          | Value                                        |
| --------------- | -------------------------------------------- |
| `Authorization` | `Basic <credentials>` (added by interceptor) |

**Response:** Raw PDF blob. Used as fallback preview for non-image, non-PDF document types (e.g., Word docs).

---

## 11. Document Detail — Audit Log (History)

| Field           | Value                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------ |
| **Service**     | `DocumentDetailService` (`libs/shared/nuxeo-client/src/lib/services/document-detail.service.ts`) |
| **Method**      | `getAuditLog(uid, pageSize, currentPageIndex)`                                                   |
| **HTTP Method** | `GET`                                                                                            |
| **Endpoint**    | `/nuxeo/api/v1/id/{uid}/@audit`                                                                  |

**Query Parameters:**

| Parameter          | Value          |
| ------------------ | -------------- |
| `pageSize`         | `50` (default) |
| `currentPageIndex` | `0` (default)  |

**Request Headers:**

| Header          | Value                                        |
| --------------- | -------------------------------------------- |
| `Authorization` | `Basic <credentials>` (added by interceptor) |

**Response (200 OK):**

```json
{
  "entity-type": "logEntries",
  "totalSize": 19,
  "currentPageSize": 3,
  "currentPageIndex": 0,
  "numberOfPages": 7,
  "entries": [
    {
      "entity-type": "logEntry",
      "id": 533,
      "category": "eventDocumentCategory",
      "principalName": "Administrator",
      "comment": "Screenshot 2025-11-26 at 4.33.51 PM.png",
      "docLifeCycle": "project",
      "docPath": "/default-domain/workspaces/Narasimha/Nishanth",
      "docType": "File",
      "docUUID": "79c36c72-...",
      "eventId": "download",
      "repositoryId": "default",
      "eventDate": "2026-03-31T06:47:47.472Z",
      "logDate": "2026-03-31T06:47:47.474Z",
      "extended": {
        "blobFilename": "Screenshot 2025-11-26 at 4.33.51 PM.png",
        "downloadReason": "download",
        "clientReason": "view",
        "blobXPath": "file:content"
      }
    }
  ]
}
```

**Key response fields used:**

| Field                        | Usage                                                                 |
| ---------------------------- | --------------------------------------------------------------------- |
| `entries[].eventId`          | Mapped to human-readable action label (e.g., "download" → "Download") |
| `entries[].eventDate`        | Shown in "Date" column                                                |
| `entries[].principalName`    | Shown in "Username" column with avatar initial                        |
| `entries[].category`         | Shown in "Category" column                                            |
| `entries[].comment`          | Shown in "Comment" column                                             |
| `entries[].docLifeCycle`     | Shown in "State" column as badge                                      |
| `totalSize`, `numberOfPages` | Used for server-side pagination                                       |

**Used by:**

- **Document detail page — History tab** (`libs/features/document-detail/src/lib/document-detail/document-detail.ts`)

---

## 12. Directory — Suggest Entries (Event Types & Categories)

| Field           | Value                                                                                 |
| --------------- | ------------------------------------------------------------------------------------- |
| **Service**     | `DirectoryService` (`libs/shared/nuxeo-client/src/lib/services/directory.service.ts`) |
| **Method**      | `getEntries(directoryName)` / `getEventTypes()` / `getEventCategories()`              |
| **HTTP Method** | `POST`                                                                                |
| **Endpoint**    | `/nuxeo/api/v1/automation/Directory.SuggestEntries`                                   |

**Request Payload:**

```json
{
  "params": {
    "directoryName": "eventTypes",
    "dbl10n": false,
    "localize": true,
    "lang": "en",
    "searchTerm": ""
  },
  "context": {}
}
```

The `directoryName` parameter varies:

- `eventTypes` — returns all known audit event types (e.g., "documentCreated", "download")
- `eventCategories` — returns all known audit event categories (e.g., "eventDocumentCategory", "eventWorkflowCategory")

**Request Headers:**

| Header          | Value                                        |
| --------------- | -------------------------------------------- |
| `Authorization` | `Basic <credentials>` (added by interceptor) |
| `Content-Type`  | `application/json`                           |
| `properties`    | `*`                                          |

**Response (200 OK):**

```json
[
  {
    "ordering": 0,
    "obsolete": 0,
    "id": "documentCreated",
    "displayLabel": "Creation",
    "label": "Creation",
    "directoryName": "eventTypes",
    "entity-type": "directoryEntry",
    "computedId": "documentCreated",
    "absoluteLabel": "Creation"
  }
]
```

**Key response fields used:**

| Field          | Usage                                                                                |
| -------------- | ------------------------------------------------------------------------------------ |
| `id`           | Value used for filtering audit entries (matches `eventId` / `category` in audit log) |
| `displayLabel` | Human-readable label shown in filter dropdowns                                       |
| `ordering`     | Sort order for dropdown options                                                      |
| `obsolete`     | Entries with `obsolete: 1` are filtered out                                          |

**Caching:** Results are cached per `directoryName` using `shareReplay` so subsequent calls reuse the same HTTP response.

**Used by:**

- **Document detail page — History tab** (`libs/features/document-detail/src/lib/document-detail/document-detail.ts`) — populates "Performed Actions" and "Event Category" filter dropdowns

---

## 13. Publishing — Get Published Versions (Proxies)

| Field           | Value                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------ |
| **Service**     | `DocumentDetailService` (`libs/shared/nuxeo-client/src/lib/services/document-detail.service.ts`) |
| **Method**      | `getPublishedVersions(uid)`                                                                      |
| **HTTP Method** | `GET`                                                                                            |
| **Endpoint**    | `/nuxeo/api/v1/search/lang/NXQL/execute`                                                         |

**Query Parameters:**

| Parameter  | Value                                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| `query`    | `SELECT * FROM Document WHERE ecm:isProxy = 1 AND ecm:proxyTargetId = '{uid}' AND ecm:isTrashed = 0` |
| `pageSize` | `50`                                                                                                 |

**Request Headers:**

| Header          | Value                                        |
| --------------- | -------------------------------------------- |
| `Authorization` | `Basic <credentials>` (added by interceptor) |
| `properties`    | `dublincore,uid`                             |

**Response (200 OK):** Standard `NuxeoDocumentList` — each entry is a proxy (published copy) of the source document.

**Key response fields used:**

| Field                                                             | Usage                                                  |
| ----------------------------------------------------------------- | ------------------------------------------------------ |
| `entries[].title`                                                 | Published document title                               |
| `entries[].path`                                                  | Location in the section tree (displayed as breadcrumb) |
| `entries[].lastModified`                                          | When the publication was last updated                  |
| `entries[].properties['uid:major_version']` / `uid:minor_version` | Published version number                               |

**Used by:**

- **Document detail page — Publishing tab** — displays list of existing publications

---

## 14. Publishing — Get Section Tree

| Field           | Value                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------ |
| **Service**     | `DocumentDetailService` (`libs/shared/nuxeo-client/src/lib/services/document-detail.service.ts`) |
| **Method**      | `getSectionTree()`                                                                               |
| **HTTP Method** | `GET`                                                                                            |
| **Endpoint**    | `/nuxeo/api/v1/search/lang/NXQL/execute`                                                         |

**Query Parameters:**

| Parameter  | Value                                                                                                                |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| `query`    | `SELECT * FROM Document WHERE ecm:primaryType IN ('SectionRoot', 'Section') AND ecm:isTrashed = 0 ORDER BY ecm:path` |
| `pageSize` | `200`                                                                                                                |

**Request Headers:**

| Header          | Value                                        |
| --------------- | -------------------------------------------- |
| `Authorization` | `Basic <credentials>` (added by interceptor) |
| `properties`    | `dublincore`                                 |

**Response (200 OK):** Standard `NuxeoDocumentList` — flat list of all SectionRoot and Section documents, ordered by path. Reconstructed into a tree client-side using path relationships.

**Key response fields used:**

| Field             | Usage                                            |
| ----------------- | ------------------------------------------------ |
| `entries[].uid`   | Target section ID for publish operation          |
| `entries[].title` | Section name shown in tree picker                |
| `entries[].path`  | Used to build parent-child hierarchy client-side |
| `entries[].type`  | `SectionRoot` vs `Section` — determines icon     |

**Used by:**

- **Document detail page — Publishing tab** — section tree picker for publish target

---

## 15. Publishing — Publish Document to Section

| Field           | Value                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------ |
| **Service**     | `DocumentDetailService` (`libs/shared/nuxeo-client/src/lib/services/document-detail.service.ts`) |
| **Method**      | `publishDocument(uid, targetSectionId)`                                                          |
| **HTTP Method** | `POST`                                                                                           |
| **Endpoint**    | `/nuxeo/api/v1/id/{uid}/@op/Document.PublishToSection`                                           |

**Request Payload:**

```json
{
  "params": {
    "target": "<targetSectionId>",
    "override": "true"
  },
  "context": {}
}
```

**Request Headers:**

| Header          | Value                                        |
| --------------- | -------------------------------------------- |
| `Authorization` | `Basic <credentials>` (added by interceptor) |
| `Content-Type`  | `application/json`                           |

**Response (200 OK):** The published proxy `NuxeoDocument`.

**Usage:** Creates a proxy of the current document version in the target section. If `override` is `"true"`, an existing publication to the same section is replaced. After publishing, the published versions list is refreshed.

**Used by:**

- **Document detail page — Publishing tab** — "Publish" button action

---

## 16. Document Actions — Lock / Unlock

| Field           | Value                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------ |
| **Service**     | `DocumentDetailService` (`libs/shared/nuxeo-client/src/lib/services/document-detail.service.ts`) |
| **Methods**     | `lockDocument(uid)` / `unlockDocument(uid)`                                                      |
| **HTTP Method** | `POST`                                                                                           |
| **Endpoints**   | `/nuxeo/api/v1/id/{uid}/@op/Document.Lock` / `Document.Unlock`                                   |

**Request Payload:**

```json
{ "params": {}, "context": {} }
```

**Response (200 OK):** Updated `NuxeoDocument` entity.

**State Detection:** The document's `lockOwner` and `lockCreated` fields are populated when locked (`null` when unlocked). Enricher request includes `favorites,subscribedNotifications` to get all action states in one call.

**Used by:**

- **Document detail page** — Lock/Unlock toggle in "More actions" menu

---

## 17. Document Actions — Add to / Remove from Favorites

| Field           | Value                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------ |
| **Service**     | `DocumentDetailService` (`libs/shared/nuxeo-client/src/lib/services/document-detail.service.ts`) |
| **Methods**     | `addToFavorites(uid)` / `removeFromFavorites(uid)`                                               |
| **HTTP Method** | `POST`                                                                                           |
| **Endpoints**   | `/nuxeo/api/v1/id/{uid}/@op/Document.AddToFavorites` / `Document.RemoveFromFavorites`            |

**Request Payload:**

```json
{ "params": {}, "context": {} }
```

**Response (200 OK):** Updated `NuxeoDocument` entity (gains `CollectionMember` facet when added).

**State Detection:** Via the `favorites` enricher: `contextParameters.favorites.isFavorite` (`true`/`false`).

**Used by:**

- **Document detail page** — Star/Favorite toggle button in header toolbar

---

## 18. Document Actions — Trash (Delete)

| Field           | Value                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------ |
| **Service**     | `DocumentDetailService` (`libs/shared/nuxeo-client/src/lib/services/document-detail.service.ts`) |
| **Method**      | `trashDocument(uid)`                                                                             |
| **HTTP Method** | `POST`                                                                                           |
| **Endpoint**    | `/nuxeo/api/v1/id/{uid}/@op/Document.Trash`                                                      |

**Request Payload:**

```json
{ "params": {}, "context": {} }
```

**Response (200 OK):** Updated `NuxeoDocument` with `isTrashed: true` and modified path (`.trashed` suffix).

**Used by:**

- **Document detail page** — Delete button in header toolbar. Navigates back after successful trash.

---

## 19. Document Actions — Subscribe / Unsubscribe (Notify Me)

| Field           | Value                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------ |
| **Service**     | `DocumentDetailService` (`libs/shared/nuxeo-client/src/lib/services/document-detail.service.ts`) |
| **Methods**     | `subscribe(uid, notifications)` / `unsubscribe(uid, notifications)`                              |
| **HTTP Method** | `POST`                                                                                           |
| **Endpoints**   | `/nuxeo/api/v1/id/{uid}/@op/Document.Subscribe` / `Document.Unsubscribe`                         |

**Request Payload:**

```json
{ "params": { "notifications": "Creation,Modification" }, "context": {} }
```

**Response (200 OK):** Updated `NuxeoDocument` (gains `Notifiable` facet when subscribed).

**State Detection:** Via the `subscribedNotifications` enricher: `contextParameters.subscribedNotifications` (empty array = not subscribed).

**Used by:**

- **Document detail page** — "Notify Me" / "Unsubscribe" toggle in "More actions" menu

---

## 20. Document Actions — Add to Collection

| Field           | Value                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------ |
| **Service**     | `DocumentDetailService` (`libs/shared/nuxeo-client/src/lib/services/document-detail.service.ts`) |
| **Methods**     | `addToCollection(uid, collectionId)` / `getCollections()`                                        |
| **HTTP Method** | `POST` (add) / `GET` (list)                                                                      |
| **Endpoints**   | `/nuxeo/api/v1/id/{uid}/@op/Document.AddToCollection` / `/nuxeo/api/v1/search/lang/NXQL/execute` |

**Add to Collection Payload:**

```json
{ "params": { "collection": "<collectionId>" }, "context": {} }
```

**Get Collections Query:** `SELECT * FROM Collection WHERE ecm:isTrashed = 0 AND ecm:currentLifeCycleState != 'deleted' ORDER BY dc:title`

**Response (200 OK):** Updated `NuxeoDocument` (add) / `NuxeoDocumentList` of available collections (list).

**Used by:**

- **Document detail page** — "Add to collection" button with collection picker dropdown

---

## 21. Document Actions — Export (Download)

| Field           | Value                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------ |
| **Service**     | `DocumentDetailService` (`libs/shared/nuxeo-client/src/lib/services/document-detail.service.ts`) |
| **Method**      | `exportBlob(uid)`                                                                                |
| **HTTP Method** | `GET`                                                                                            |
| **Endpoint**    | `/nuxeo/api/v1/id/{uid}/@blob/blobholder:0`                                                      |

**Response:** Raw binary blob. Downloaded via a dynamically created `<a>` element with `URL.createObjectURL`.

**Used by:**

- **Document detail page** — "Export" action in "More actions" menu

---

## 22. Document Actions — Clipboard (Client-Side)

| Field       | Value                                            |
| ----------- | ------------------------------------------------ |
| **Storage** | `localStorage` key: `nuxeo_clipboard`            |
| **Format**  | JSON array: `[{ "uid": "...", "title": "..." }]` |

No API call — clipboard is a client-side feature that stores document references in `localStorage`. Documents can be added/removed from the clipboard via the header toolbar bookmark icon or the "More actions" menu.

**Used by:**

- **Document detail page** — Bookmark toggle button and "Add to / Remove from Clipboard" menu item

---

## 23. Document Actions — Share (Copy Link)

No API call — copies the current page URL to the system clipboard using `navigator.clipboard.writeText()`.

**Used by:**

- **Document detail page** — "Share" action in "More actions" menu

---

<!-- TEMPLATE: Copy the block below when adding a new API integration -->

## 22. Knowledge Discovery Query

| Field           | Value                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| **Service**     | `KnowledgeDiscoveryService` (`libs/shared/nuxeo-client/src/lib/services/knowledge-discovery.service.ts`) |
| **Method**      | `query({ query, limit })`                                                                                |
| **HTTP Method** | `POST`                                                                                                   |
| **Endpoint**    | `/nuxeo/api/v1/automation/KnowledgeDiscovery.Query`                                                      |

**Request Payload:**

```json
{
  "params": {
    "query": "What contracts mention renewal clauses?",
    "limit": 10
  },
  "context": {}
}
```

**Headers:**

| Header          | Value                                                                         |
| --------------- | ----------------------------------------------------------------------------- |
| `Authorization` | `Basic <credentials>` or same-origin session via the existing Nuxeo auth flow |
| `Content-Type`  | `application/json`                                                            |
| `properties`    | `dublincore,file,common`                                                      |

**Expected Response (200 OK):**

```json
{
  "answer": "The renewal clause appears in the master services agreement.",
  "responseCompleteness": "Complete",
  "items": [
    {
      "uid": "doc-123",
      "title": "MSA",
      "type": "File",
      "path": "/default-domain/workspaces/msa.pdf"
    }
  ],
  "objectReferences": [
    {
      "objectId": "doc-123",
      "objectTitle": "MSA",
      "references": [
        {
          "referenceId": "section-4",
          "rankScore": 0.98,
          "content": "The agreement includes renewal terms for successive one-year periods."
        }
      ]
    }
  ]
}
```

**Frontend Contract Notes:**

- This repo expects the Nuxeo-side implementation to keep KD credentials and OAuth handling server-side.
- The Angular app consumes a normalized response shaped as `KnowledgeDiscoveryResponse`.
- `items` is optional but recommended when the endpoint can map grounded answers back to Nuxeo documents for reuse in the existing Search results UI.
- `objectReferences` / `sources` should provide grounded citations or excerpts that can be shown even when no `items` are returned.

**Error Handling:**

| Status        | Behavior                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| `404`         | Treat as endpoint not deployed; show Knowledge Discovery unavailable state while keeping normal Search usable |
| `401` / `403` | Show authorization failure message for the KD flow                                                            |
| `5xx`         | Show transient upstream failure message and preserve normal Search results                                    |

<!--
## N. Title

| Field | Value |
| ----- | ----- |
| **Service** | `ServiceName` (`path/to/service.ts`) |
| **Method** | `methodName(params)` |
| **HTTP Method** | `GET` / `POST` / `PUT` / `DELETE` |
| **Endpoint** | `/nuxeo/api/v1/...` |

**Query Parameters / Request Payload:**

| Parameter | Value |
| --------- | ----- |
| `param` | description |

**Response (200 OK):**

```json
{ }
```

**Error Handling:**

| Status | Behavior |
| ------ | -------- |
| ... | ... |
-->
