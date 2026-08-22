# adf-hx Browse POC — Architecture

Parallel browse experience that uses Hyland **HxCS / adf-hx** APIs and UI (`hxp-*` components) while production browse (`/#/browse`) stays on Satori + Material.

**Branch:** `feature/adf-hx-browse-poc` · **Ticket:** NXENG-619 Scope A (read-only)

---

## High-level layout

```
apps/nuxeo-ui (shell)
  ├── Platform nav: Browse | Browse (adf-hx POC)
  ├── Nav drawer: hxp-browse-nav-drawer (adf-hx) OR Material tree (production)
  └── Router outlet
        ├── /#/browse/...           → BrowseComponent (production)
        └── /#/browse-adf-hx?path=… → BrowseAdfHxPocComponent (POC)

libs/features/browse/src/lib/browse-adf-hx-poc/
  └── Wires hxp-* UI; owns tab state, filters, panel — no Material/Satori

libs/shared/adf-hx-bridge/
  ├── hxp-* UI components (native HTML, --hxp-* tokens)
  ├── AdfHx* services (Hx Document model)
  └── NuxeoDocumentApi / NuxeoQueryApi (implements HxCS tokens over Nuxeo REST)

libs/shared/nuxeo-client/
  └── BrowseService, DocumentDetailService (used only inside bridge API layer)

Nuxeo Server (/nuxeo/api/v1/…)
```

Production browse and adf-hx browse **do not import each other**. Shared routing helpers live in `libs/shared/nuxeo-client/src/lib/utils/browse-path.utils.ts`.

---

## Data flow

```
BrowseAdfHxPocComponent
  → AdfHxDocumentService          (folder + children, Hx Document)
  → AdfHxBrowseFolderService      (permissions, audit, trash, tags)
  → AdfHxBrowseMediaService       (thumbnails, CSV, ZIP)
  → AdfHxBrowseContextService     (current path, tree refresh)
  → NuxeoDocumentRouterService    (open doc / return to browse)

AdfHxDocumentService
  → DOCUMENT_API_TOKEN → NuxeoDocumentApi → BrowseService / DocumentDetailService
  → QUERY_API_TOKEN    → NuxeoQueryApi    → BrowseService (named queries)

NuxeoDocumentApi
  → mapNuxeoDocumentToHx() → Document (@hylandsoftware/hxcs-js-client)
```

**Rule:** The feature page and `hxp-*` components call **bridge services only**, not `BrowseService` or `DocumentDetailService` directly.

**Providers:** Register `ADF_HX_NUXEO_BRIDGE_PROVIDERS` on the POC page and anywhere the nav drawer loads adf-hx tree state.

---

## Routes and path model

| Route             | Path model                    | Example                                                |
| ----------------- | ----------------------------- | ------------------------------------------------------ |
| Production browse | Path segments after `/browse` | `/#/browse/default-domain/workspaces`                  |
| adf-hx browse     | Query param `path`            | `/#/browse-adf-hx?path=%2Fdefault-domain%2Fworkspaces` |

Helpers (in `@nuxeo-satori/platform/nuxeo-client`):

- `toBrowseRouterUrl(nuxeoPath)` / `toAdfHxBrowseRouterUrl(nuxeoPath)`
- `parseBrowseNuxeoPathFromRouterUrl()` / `parseAdfHxBrowsePathFromRouterUrl()`
- `BROWSE_RETURN_MODE_PARAM` (`browseReturn=adf-hx`) — document detail returns to adf-hx when opened from POC

**Shell path sync:** Clicking **Browse** vs **Browse (adf-hx POC)** in platform nav copies the current folder path across modes (`app-shell.component.ts`).

---

## UI layer (`hxp-*`)

All POC UI lives in `libs/shared/adf-hx-bridge/src/lib/ui/`. No `mat-*`, no `sat-*` in bridge or POC feature code.

| Component                  | Role                                                                      |
| -------------------------- | ------------------------------------------------------------------------- |
| `hxp-folder-header`        | Title, type, header actions (Create, Drive, Edit, Delete, Download, More) |
| `hxp-breadcrumb`           | Folder breadcrumbs                                                        |
| `hxp-domain-hint`          | Domain / repository root guidance                                         |
| `hxp-browse-tabs`          | View · Permissions · History · Trash (native `<button role="tab">`)       |
| `hxp-browse-toolbar`       | Filters, view toggle, CSV export                                          |
| `hxp-document-list`        | List/card views, columns, selection, thumbnails                           |
| `hxp-browse-permissions`   | Permissions tab content                                                   |
| `hxp-browse-history`       | Audit log tab                                                             |
| `hxp-browse-trash`         | Trashed children tab                                                      |
| `hxp-browse-details-panel` | Side panel: Info · Tags · Activity                                        |
| `hxp-browse-nav-drawer`    | Shell drawer wrapper                                                      |
| `hxp-browse-nav-tree`      | Side nav folder tree                                                      |
| `hxp-icon` / `hxp-spinner` | Icons and loading                                                         |

The legacy `hxp-document-tree` (a Material `mat-tree`) and its `AdfHxDocumentTreeDatabaseService`
data source were **deleted in Phase 0**. They were unused, and they were the last thing keeping
`@angular/material` in this library's dependency graph and public surface.

---

## Services

| Service                      | Purpose                                                |
| ---------------------------- | ------------------------------------------------------ |
| `AdfHxDocumentService`       | getByPath/id, children, ancestors; Hx `Document` model |
| `AdfHxBrowseContextService`  | `contextPath` signal, `treeRefreshTick`                |
| `AdfHxBrowseMediaService`    | Thumbnails (blob URLs), CSV export, ZIP download       |
| `AdfHxBrowseFolderService`   | Permissions doc, audit log, trash, tag search          |
| `HxpBrowseNavTreeService`    | Nav tree load, expand, sync to path                    |
| `NuxeoDocumentRouterService` | Navigate to doc (sets `browseReturn=adf-hx`) or folder |

Write methods on `NuxeoDocumentApi` throw _"not implemented in Scope A"_ until Scope B.

---

## Theming

Bridge SCSS uses **`--hxp-*` tokens only** (never `--mat-sys-*`).

App shell maps Satori tokens once in `apps/nuxeo-ui/src/styles/hxp-theme.scss` (imported after `@include sat.theme` in `styles.scss`).

---

## Scope A vs Scope B

| Area                               | Scope A (current)                              | Scope B (future)                          |
| ---------------------------------- | ---------------------------------------------- | ----------------------------------------- |
| View tab                           | List/card, filters, columns, selection, export | —                                         |
| Permissions / History / Trash tabs | Read-only UI + data                            | Write actions (dialogs, ACL mutations)    |
| Header actions                     | Download/CSV work; writes show notice          | Create/Import, Edit, Delete, Share, …     |
| Details panel                      | Info, tags list, activity (read)               | Tag add/remove, edit properties           |
| Document API                       | Read paths implemented                         | create/patch/delete on `NuxeoDocumentApi` |

---

## Key file locations

```
libs/shared/adf-hx-bridge/          ← Bridge library (this doc)
libs/features/browse/src/lib/browse-adf-hx-poc/
apps/nuxeo-ui/src/app/app.routes.ts
apps/nuxeo-ui/src/app/platform-nav-items.ts
apps/nuxeo-ui/src/app/shell/app-shell.component.ts
apps/nuxeo-ui/src/app/shell/nav-drawer/
apps/nuxeo-ui/src/styles/hxp-theme.scss
libs/shared/nuxeo-client/src/lib/utils/browse-path.utils.ts
.cursor/rules/adf-hx-browse-poc.mdc
```

---

## Related docs

- `.cursor/rules/adf-hx-browse-poc.mdc` — agent constraints for POC work
- `AGENTS/01-services.md` — AdfHxBridge service signatures
- `docs/api-integrations.md` — Nuxeo endpoints used by the bridge
- `docs/architecture.md` — monorepo layer rules (one-line POC mention)
