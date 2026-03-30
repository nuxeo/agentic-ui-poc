# API Integrations

This document tracks all Nuxeo REST API integrations used in the application. When adding a new API call, append an entry following the format below.

**Base URL:** `/nuxeo` (proxied to `http://localhost:8180` in development via `apps/nuxeo-ui/proxy.conf.json`)

**Authentication:** All `/nuxeo/**` requests are automatically decorated with `Authorization: Basic <credentials>` by the `nuxeoAuthInterceptor` (see `apps/nuxeo-ui/src/app/auth/nuxeo-auth.interceptor.ts`).

---

## 1. Login (Validate Credentials)

| Field | Value |
| ----- | ----- |
| **Service** | `AuthService` (`apps/nuxeo-ui/src/app/auth/auth.service.ts`) |
| **Method** | `login(username, password, remember)` |
| **HTTP Method** | `GET` |
| **Endpoint** | `/nuxeo/api/v1/me` |

**Request Headers:**

| Header | Value |
| ------ | ----- |
| `Authorization` | `Basic <base64(username:password)>` |
| `Accept` | `application/json` |

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

| Status | Message shown to user |
| ------ | --------------------- |
| 401 / 403 | "Invalid username or password." |
| Other / Network error | "Could not reach Nuxeo. Check the server, proxy, and URL." |

---

## 2. Recently Edited Documents (Dashboard Widget)

| Field | Value |
| ----- | ----- |
| **Service** | `NuxeoDocumentService` (`apps/nuxeo-ui/src/app/services/nuxeo-document.service.ts`) |
| **Method** | `getRecentlyEdited(pageSize)` |
| **HTTP Method** | `GET` |
| **Endpoint** | `/nuxeo/api/v1/search/lang/NXQL/execute` |

**Query Parameters:**

| Parameter | Value |
| --------- | ----- |
| `query` | `SELECT * FROM Document WHERE ecm:mixinType != 'HiddenInNavigation' AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0 ORDER BY dc:modified DESC` |
| `pageSize` | `10` (default) |

**Request Headers:**

| Header | Value |
| ------ | ----- |
| `Authorization` | `Basic <credentials>` (added by interceptor) |
| `properties` | `dublincore` |

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

| Field | Usage |
| ----- | ----- |
| `entries[].title` | Document name displayed in the widget |
| `entries[].type` | Mapped to a Material icon (File, Note, Picture, Video, etc.) |
| `entries[].lastModified` | Formatted as medium date in the "Modified" column |
| `entries[].properties['dc:lastContributor']` | Shown in the "Last Contributor" column |

---

## 3. User Tasks (Dashboard Widget)

| Field | Value |
| ----- | ----- |
| **Service** | `NuxeoDocumentService` (`apps/nuxeo-ui/src/app/services/nuxeo-document.service.ts`) |
| **Method** | `getUserTasks(userId, pageSize)` |
| **HTTP Method** | `GET` |
| **Endpoint** | `/nuxeo/api/v1/task` |

**Query Parameters:**

| Parameter | Value |
| --------- | ----- |
| `userId` | Current authenticated username (e.g., `Administrator`) |
| `pageSize` | `10` (default) |

**Request Headers:**

| Header | Value |
| ------ | ----- |
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

| Field | Usage |
| ----- | ----- |
| `entries[].name` | Task label (stripped of `wf.<workflow>.` prefix) |
| `entries[].dueDate` | Due date column; shown in red if overdue |
| `entries[].workflowModelName` | Workflow name (PascalCase split into words) |
| `entries[].targetDocumentIds[0].id` | Used to fetch the target document title |
| `targetDocTitle` (enriched) | Shown below the task name |

---

## 4. Recently Viewed Documents (Dashboard Widget)

| Field | Value |
| ----- | ----- |
| **Service** | `NuxeoDocumentService` (`apps/nuxeo-ui/src/app/services/nuxeo-document.service.ts`) |
| **Method** | `getRecentlyViewed(userId, pageSize)` |
| **HTTP Method** | `GET` |
| **Endpoint** | `/nuxeo/api/v1/search/lang/NXQL/execute` |

**Query Parameters:**

| Parameter | Value |
| --------- | ----- |
| `query` | `SELECT * FROM Document WHERE ecm:mixinType != 'HiddenInNavigation' AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0 AND ecm:primaryType NOT IN ('Root', 'Favorites', 'Collections') AND (dc:creator = '{user}' OR dc:lastContributor = '{user}') ORDER BY dc:modified DESC` |
| `pageSize` | `10` (default) |

**Request Headers:**

| Header | Value |
| ------ | ----- |
| `Authorization` | `Basic <credentials>` (added by interceptor) |
| `properties` | `dublincore` |

**Response (200 OK):** Same document list shape as §2.

**Key response fields used:**

| Field | Usage |
| ----- | ----- |
| `entries[].title` | Document name with type icon |
| `entries[].type` | Shown as a coloured badge (e.g., "Picture", "Video", "File") |
| `entries[].lastModified` | Shown as relative time in the "Last Viewed" column |

---

## 5. Favorite Items (Dashboard Widget)

| Field | Value |
| ----- | ----- |
| **Service** | `NuxeoDocumentService` (`apps/nuxeo-ui/src/app/services/nuxeo-document.service.ts`) |
| **Method** | `getFavorites(userId, pageSize)` |
| **HTTP Method** | `GET` (two-step) |
| **Endpoint** | Step 1: `/nuxeo/api/v1/search/lang/NXQL/execute` — Step 2: `/nuxeo/api/v1/search/pp/default_content_collection/execute` |

**Step 1 — Locate Favorites collection:**

| Parameter | Value |
| --------- | ----- |
| `query` | `SELECT * FROM Document WHERE ecm:primaryType = 'Favorites' AND ecm:path STARTSWITH '/default-domain/UserWorkspaces/{user}'` |
| `pageSize` | `1` |

**Step 2 — Fetch collection members:**

| Parameter | Value |
| --------- | ----- |
| `queryParams` | UID of the Favorites collection found in step 1 |
| `pageSize` | `10` (default) |

**Request Headers:**

| Header | Value |
| ------ | ----- |
| `Authorization` | `Basic <credentials>` (added by interceptor) |
| `properties` | `dublincore` |

**Response (200 OK):** Same document list shape as §2.

**Key response fields used:**

| Field | Usage |
| ----- | ----- |
| `entries[].title` | Document name with type icon |
| `entries[].lastModified` | Formatted as medium date in the "Modified" column |
| `entries[].properties['dc:lastContributor']` | Shown in the "Last Contributor" column |

**Empty state:** "You haven't starred documents yet."

---

<!-- TEMPLATE: Copy the block below when adding a new API integration -->
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
