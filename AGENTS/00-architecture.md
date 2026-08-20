# Architecture — Nuxeo Agentic UI

## Stack

| Layer                | Technology                                                     |
| -------------------- | -------------------------------------------------------------- |
| Frontend framework   | Angular 19 (standalone components, signals)                    |
| Monorepo tool        | Nx 22                                                          |
| UI component library | Satori (Hyland design system) + Angular Material               |
| State management     | Angular Signals — no NgRx, no BehaviorSubject for UI state     |
| HTTP                 | Angular HttpClient via `NuxeoApiBase` wrapper                  |
| Auth                 | SAML SSO in production; Basic Auth interceptor in development  |
| Backend (AI)         | `nuxeo-ai-package` — separate Java marketplace bundle on Nuxeo |
| AI provider          | Hyland HAIP Model Gateway (OpenAI-compatible API)              |
| Document platform    | Nuxeo Content Services Platform                                |

---

## 4-Layer Model

```
apps/nuxeo-ui                    ← App Shell (routing, auth, global search, header)
    ↓ lazy-loads
libs/features/*                  ← Feature Modules (browse, search, document-detail, …)
    ↓ imports from               ← NEVER import from sibling features
libs/shared/*                    ← Shared Libraries (services, UI components, models)
    ↓ HTTP calls via
Nuxeo Server                     ← via Angular dev proxy (:8080) in dev; same-origin in prod
```

### Critical Boundary Rules

1. **Features NEVER import from other features.** `libs/features/browse` cannot import from `libs/features/search`. Shared state goes in `libs/shared/`. This is why the `AddPermission`, `UpdatePermission`, `DeletePermission` and `ShareExternal` dialogs live in `libs/shared/ui` and not in `libs/features/collections` where they started — `browse` and `document-detail` both use them.
2. **Services ALWAYS live in `libs/shared/nuxeo-client/src/lib/services/`**. Feature components never own services.
3. **Components NEVER inject `NuxeoApiBase` directly.** They inject domain services (e.g. `DocumentDetailService`).
4. **Every component is `standalone: true`.** No NgModules exist anywhere.
5. **Every template is external.** Use `templateUrl`, never inline `template`.

**What is actually machine-enforced:** only the content-port / adapter boundary, through
`@nx/enforce-module-boundaries` — see "Boundary enforcement" below. Rules 1 through 5 are
conventions checked in review. Until 6 August 2026 this heading read "enforced by Nx lint",
which was not true of any of them: `depConstraints` held a single permissive
`'*' → ['*']` rule, which constrains nothing. Do not assume lint will catch a violation of
rules 1 to 5.

---

## Where AI Lives

This repository contains **no AI server**. `apps/ai-backend` was removed; the capability now
ships as [`nuxeo-ai-package`](https://github.com/nuxeo/nuxeo-ai-package), a standalone Java
marketplace bundle installed on the Nuxeo server. It exposes Automation operations
(`AI.Chat`, `AI.Summarize`, `AI.Classify`, `AI.NlToNxql`, …) and owns the HAIP credentials.

```
libs/shared/ai-client            ← AiGatewayService: POST /nuxeo/api/v1/automation/<OperationId>
    ↓ same-origin HTTP, Nuxeo session auth via nuxeoAuthInterceptor
Nuxeo Server + nuxeo-ai-package  ← executes the operation
    ↓
HAIP Model Gateway               ← credentials live server-side, never in the browser
```

Two consequences for anyone changing AI behaviour here:

- There is no `/ai/*` route and no port 3000. AI requests are ordinary `/nuxeo/*` requests,
  so they go through the same auth interceptor and dev proxy as every other Nuxeo call.
- Adding or changing an operation's behaviour is a change to `nuxeo-ai-package`, not to this
  repo. The only thing this repo owns is the call shape in `AiGatewayService` and the UI.

Knowledge Discovery (`libs/shared/kd-client`) and Knowledge Enrichment (`libs/shared/ke-client`)
follow the same pattern against the Hyland Content Intelligence Connector's operations.

---

## Where Content Access Lives

Nuxeo REST sits behind a backend-neutral port contract, so that replacing the content
backend becomes an adapter change rather than a rewrite of every caller.

```
libs/shared/nuxeo-client/content-ports/          ← @agentic-ui/shared/content-ports
    neutral domain model + 5 port interfaces + DI tokens. No workspace dependencies.
        ↑ implemented by
libs/shared/nuxeo-client/content-adapter-nuxeo/  ← @agentic-ui/shared/content-adapter-nuxeo
    NuxeoDocumentAdapter, NuxeoSearchAdapter, … + provideNuxeoContentAdapter()
        ↓ delegates to
libs/shared/nuxeo-client/src/                    ← @agentic-ui/shared/nuxeo-client
    the 26 existing Nuxeo services (unchanged)
```

Feature code injects a token (`DOCUMENT_PORT`, `SEARCH_PORT`, …), never an adapter class.
Only the application composition root names a backend, by calling
`provideNuxeoContentAdapter()`.

### Provenance — the contract is pinned, not depended upon

The port shapes are copied from `Alfresco/hxp-frontend-apps` (private), branch
`feature/CSX-447-content-abstraction-layer`, at commit
**`61eb45bf0e94df3fd3a62e8efd21af8ec535451e`** (2026-07-13, PR #18189), under
`libs/content-abstraction/{domain,ports}/external/src`. A reference Nuxeo adapter
lives on the same branch at `libs/content-adapter-nuxeo`.

It is pinned rather than installed because **no artifact authoritatively states the
contract**. The Confluence RFC names eight ports and is being edited faster than the
code; the in-repo RFC names five; the code has five. That branch is also conflicting
and several hundred commits behind `develop`, so it is not installable and may never
merge in this shape. A recorded SHA is the only reproducible reference. Do not add
`@hxp/*` packages to `package.json`.

The five ports as they actually exist at that commit:

| Port              | Methods                                                                                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AuthPort`        | `getAccessToken`                                                                                                                                                              |
| `DocumentPort`    | `getById` `getByPath` `listChildren` `createUnderParent` `update` `delete` `move` `copy` `getRoot` `getWithRendition` `getWithBreadcrumb` `getWithPermissions` `capabilities` |
| `SearchPort`      | `runNamedQuery` `runFilter` `capabilities`                                                                                                                                    |
| `PermissionsPort` | `list` `grant` `revoke` `capabilities`                                                                                                                                        |
| `UploadPort`      | `begin` `progress` `attach` `cancel` `capabilities`                                                                                                                           |

Note it is `DocumentPort`, not `ContentPort`; and `DownloadPort`, `ModelPort` and
`PrincipalPort` from the RFC have no code at all. `src/lib/ports-surface.spec.ts` in
the adapter library fails if an adapter drifts from this list.

### What sits behind a port, and what does not

`libs/shared/nuxeo-client` is **26 services and 217 public methods** over 135 REST paths
and 25 Automation operations. The five ports total **26 methods**. **Around 12% of our
content surface can sit behind the shared contract; the rest is Nuxeo-specific and stays
direct.** That ratio is the honest measure of how much of this product a shared content
abstraction could serve today.

The narrower reading: four of the 26 are `capabilities()` descriptors, `getAccessToken` is
unimplementable here and `getWithRendition` is unimplementable over Nuxeo, so 20 methods
(~9%) do real work. Do not confuse this with the separate claim that their **components**
could replace a quarter to a third of `libs/features` — that is a line-of-UI-code
measurement, not an API-method one. See §1.1 of `docs/adf-hx-vs-nuxeo-satori-decision.md`.

Behind a port:

| Port              | Backed by                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `DocumentPort`    | `BrowseService` (path/root/update/move/copy), `NuxeoApiBase` (id, children, create, delete), `DocumentDetailService.getDocumentPermissions` |
| `SearchPort`      | `NuxeoApiBase.nxqlSearch` — NXQL only                                                                                                       |
| `PermissionsPort` | `DocumentDetailService` add/remove permission                                                                                               |
| `UploadPort`      | `DocumentImportService` batch upload, single file                                                                                           |
| `AuthPort`        | nothing — see the divergence below                                                                                                          |

Staying direct Nuxeo access, with the reason:

| Area                                                                                                                         | Why it cannot sit behind the port                                                       |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Faceted search and aggregations** — `AssetService`, `SearchService`, `SearchAggregationService`, `AssetAggregationService` | `SearchResultPage<T>` has no aggregation field. See below.                              |
| **DAM surface** — thumbnails, `picture:views`, `vid:transcodedVideos`, EXIF/IPTC                                             | No representation in the domain model; renditions are unsupported at the port.          |
| **Blobs and renditions** — `fetchBlob`, `fetchPdfRendition`, `fetchThumbnail`                                                | `RenditionRef.url` assumes a directly-fetchable URL; Nuxeo needs authenticated fetches. |
| **Versioning, locking, publication, subscriptions, favorites, comments**                                                     | No port concept exists for any of them.                                                 |
| **Collections, tags, tasks, workflow, directories/vocabularies, users/groups**                                               | Outside the five ports entirely.                                                        |
| **Trash, audit, administration, Nuxeo Drive, ARender, Content Lake ingest**                                                  | Nuxeo-platform features with no neutral equivalent.                                     |
| **CSV and bulk import, bulk download/export**                                                                                | `UploadPort` models one file at a time.                                                 |
| **UI state services** — `SelectionService`, `BrowseContextService`, `TrashFilterService`, `ClipboardTargetService`           | Signal state, not backend access. Nothing to abstract.                                  |

### Where faceted search lives, and why

**Faceted search stays on the Nuxeo page-provider path and deliberately does not go
through `SearchPort`.**

`SearchPort` exposes `runNamedQuery` and `runFilter`, and both return
`SearchResultPage<T>`, which carries `items`, `total`, `hasMore` and `cursor` — and no
buckets. Aggregations are bidirectional: the UI sends selected facet values as
`*_agg` request parameters _and_ renders the bucket counts that come back. The filter
DSL can express the outbound half (`in` over a field), but the return type cannot carry
the inbound half at all. Mapping our faceted search onto this port would therefore
silently drop the facet counts that the search and DAM drawers exist to display.

Bending our search to fit would mean giving up server-defined page providers
(`assets_search`, `default_search`), their contributed aggregates and sorts, and the
saved-search feature built on them. So the split is:

- Neutral, NXQL-shaped queries → `SearchPort`.
- Faceted, page-provider-shaped queries → `AssetService` / `SearchService`, direct.

This is the single largest gap between our product and the shared contract, and the
one worth raising in the port-surface design conversation.

### Where the port shape does not fit Nuxeo

Places the upstream contract and Nuxeo genuinely disagree. Each is marked
`DIVERGENCE` or `MISFIT` at the relevant definition in code. All eight are written up for
CSX in `docs/csx-447-port-gaps.md`, verified against the pinned commit.

1. **`AuthPort` assumes bearer tokens and cannot represent a cookie session.**
   `getAccessToken(): Promise<string>` expects the application to hand the adapter a
   token per request. This app is same-origin with Nuxeo and uses a SAML session cookie
   in production, and `nuxeoAuthInterceptor` with Basic auth in development. There is no
   token to hand over, and credentials are attached by the interceptor rather than the
   adapter. `NuxeoAuthAdapter` rejects with `Unauthenticated` rather than fabricating one.
   **Verified upstream:** their reference `NuxeoAuthAdapter` returns an `Authorization`
   header value (`Basic` + base64 of the `Administrator`/`Administrator` default) from a
   method named `getAccessToken`, and nothing in their adapter calls it — the transport
   builds its own header from `NUXEO_CONFIG`. Their POC therefore never exercised this
   port, and RFC §5.2's claim that the Nuxeo adapter "wires its own client to the same
   `AuthPort`" is not true at the pinned commit.
2. **`PermissionsPort.revoke` takes an id the contract never promises will round-trip.**
   `Document.RemovePermission` does accept an ACE `id` (its params are `acl`, `id`,
   `user`), so revoking by id is expressible — but the contract never says
   `Permission.id` is a durable backend handle. Their mapper synthesises
   `` `${principal}:${permission}` `` when the enricher omits an id, and `grant()` always
   returns that synthetic form, so grant-then-revoke silently matches no ACE. Revoking by
   `user` is the only alternative and removes **every** ACE for that principal on the ACL.
   Our adapter reads the ACL back to resolve the id, costing a round-trip per revoke.
3. **`PermissionsPort.grant` cannot express a deny ACE.** Nuxeo stores them, and
   `Permission.granted` can represent one, but `Document.AddPermission` only ever writes
   a grant. Our adapter rejects `granted: false` instead of writing the opposite.
   **Verified upstream:** theirs does not — `toAddPermissionParams` never reads
   `ace.granted`, while `nuxeoPermissionsCapabilities` declares `honours.deny: true`. A
   caller that pre-flights the descriptor and asks for a deny gets a grant.
   `blockInheritance` has the same defect: declared honoured, hard-coded `false`, and
   absent from `NewPermission`.
4. **`UploadPort.begin` is synchronous** — it returns a handle, not an observable — while
   opening a Nuxeo upload batch is a network call. The batch id therefore arrives on the
   handle asynchronously. Our `attach` waits for staging; theirs throws `Conflict` if
   staging has not finished, so the two adapters disagree on the same call sequence.
5. **`getWithRendition` cannot work over Nuxeo.** `RenditionRef.url` assumes a
   directly-fetchable URL; Nuxeo rendition URLs need the session's auth headers, so they
   must be fetched as blobs. The upstream reference adapter throws `UnsupportedEnrichment`
   here for the same reason and reports `rendition: { supportedKinds: [] }`.
6. **The named-query catalogue is a hand-maintained list of three in the shared ports
   package.** Adding a query upstream means a PR against a private repository. Our two
   extra keys are declared locally with a `nuxeo:` prefix and reported through
   `SearchCapabilities.supportedNamedQueries`, but this does not scale to a product with
   dozens of page providers, and it is the structural cause of the faceted-search gap.
   The escape hatch is narrow too: their adapter declares only `eq` and `fullText` of the
   eight `FilterKind` values.
7. **`Permission.effective` is a boolean; Nuxeo's ACE status is tri-state**
   (`effective`/`pending`/`archived`), so "not yet effective" and "expired" collapse
   together. Our adapter preserves the distinction in the free-text `source` field because
   the neutral shape has nowhere else to put it.
8. **`SearchResultPage<T>` cannot carry aggregation buckets.** Aggregations are
   bidirectional and the contract expresses only the outbound half — see "Where faceted
   search lives" above. This is the largest of the eight by product impact.

### Boundary enforcement (Nx lint tags)

**This is the only layer boundary in the repo that lint actually enforces.** The tags are
in each `project.json`; the constraints are in the root `eslint.config.mjs` under
`@nx/enforce-module-boundaries`. Violations fail `nx lint`, so this boundary is enforced by
the build rather than by review. Before 6 August 2026 `depConstraints` held only a
permissive `'*' → ['*']` rule and nothing was enforced, despite the docs claiming
otherwise.

| Project                 | Tags                                   |
| ----------------------- | -------------------------------------- |
| `content-ports`         | `scope:shared`, `type:port-contract`   |
| `content-adapter-nuxeo` | `scope:shared`, `type:content-adapter` |
| `nuxeo-client`          | `scope:shared`, `type:data-access`     |

- `type:port-contract` may depend on **no** workspace library. If the contract ever
  imports one it has stopped being backend-neutral.
- `type:content-adapter` may depend only on `type:port-contract` and
  `type:data-access`.
- `scope:features`, `type:ui` and `type:data-access` may **not** depend on
  `type:content-adapter`. Only the untagged application composition root can, which is
  what keeps the backend swappable.

Both directions are covered by tests: a feature importing the adapter and the contract
importing `nuxeo-client` each fail lint. Note `libs/features/administration` currently has
empty tags, so it is not covered by the `scope:features` rule.

---

## Directory Map

```
apps/
  nuxeo-ui/                      ← Main Angular SPA
    src/app/
      auth/                      ← Guards, interceptors, SAML providers
      dashboard/                 ← DashboardPageComponent
      login/                     ← LoginPageComponent
      shell/                     ← AppShellComponent (header, global search)
      settings/                  ← Profile, Nuxeo Drive, Cloud Services pages
      app.config.ts              ← Providers, router config
      app.routes.ts              ← Top-level lazy routes

libs/
  features/
    browse/                      ← /browse — folder tree + document list
    search/                      ← /search — full-text + faceted search
    document-detail/             ← /doc/:uid — document viewer + tabs
    collections/                 ← /collections — collection management
    tasks/                       ← /tasks — workflow tasks
    administration/              ← /administration — admin console
    assets/                      ← /documents — DAM asset search
    trash/                       ← /trash — trash management
  shared/
    nuxeo-client/                ← All Nuxeo API services + models + config
      src/lib/
        services/                ← 26 services (see AGENTS/01-services.md)
        models/                  ← TypeScript interfaces for Nuxeo objects
      content-ports/             ← @agentic-ui/shared/content-ports — neutral contract
        src/lib/domain/          ← ContentNode, Permission, SearchResultPage, errors
        src/lib/ports/           ← the 5 port interfaces, capabilities, DI tokens
      content-adapter-nuxeo/     ← @agentic-ui/shared/content-adapter-nuxeo — Nuxeo impl
        src/lib/ports/           ← one adapter per port
        src/lib/mapping/         ← Nuxeo wire shape ↔ neutral domain
    ui/                          ← Reusable UI components (widgets, viewer, permission
                                   and sharing dialogs, confirm/export dialogs)
    ai-client/                   ← AI feature flag service + AI Automation operation client
    kd-client/                   ← Knowledge Discovery client via Nuxeo CIC automation
    ke-client/                   ← Knowledge Enrichment client via Nuxeo CIC automation
```

---

## Routing

All routes use `HashLocationStrategy` (`/#/path`). This ensures Nuxeo/Tomcat serves `index.html` for all deep links without 404s.

| Path                | Component                    | Auth       |
| ------------------- | ---------------------------- | ---------- |
| `/#/login`          | LoginPageComponent           | Public     |
| `/#/dashboard`      | DashboardPageComponent       | Required   |
| `/#/browse`         | BrowseComponent              | Required   |
| `/#/search`         | SearchComponent              | Required   |
| `/#/doc/:uid`       | DocumentDetailComponent      | Required   |
| `/#/documents`      | AssetSearchResultsComponent  | Required   |
| `/#/tasks`          | TasksPageComponent           | Required   |
| `/#/collections`    | CollectionDetailComponent    | Required   |
| `/#/trash`          | TrashComponent               | Required   |
| `/#/administration` | AdministrationShellComponent | Admin only |

---

## Authentication Flow

**Development (`:4200`):**

- `NuxeoAuthInterceptor` adds `Authorization: Basic <base64>` to all `/nuxeo/*` requests
- Credentials from `environment.ts`

**Production (same-origin with Nuxeo):**

- SAML SSO via `NuxeoSSOProviders`
- Session cookie handles authentication

**Auth Guards:**

- `authGuard` — redirects to `/login` if not authenticated
- `loginGuard` — redirects to `/dashboard` if already authenticated
- `adminGuard` — 403 if user is not in `administrators` group

---

## Key Conventions

- Dependency injection: `inject()` function, never constructor parameters
- State: `signal()` for all mutable state, `computed()` for derived values, `effect()` for side effects
- Subscriptions: always use `takeUntilDestroyed()` — never manual `unsubscribe()`
- Blob URLs: always `URL.revokeObjectURL()` in `ngOnDestroy` for every `createObjectURL`
- Authenticated content: always use `HttpClient` (via services) — never `<img [src]="nuxeoUrl">`
- Imports: `@agentic-ui/shared/nuxeo-client`, `@agentic-ui/shared/ui`, `@agentic-ui/shared/ai-client`, `@agentic-ui/shared/kd-client`, `@agentic-ui/shared/ke-client`
- Content ports: inject a token from `@agentic-ui/shared/content-ports` for backend-neutral
  reads and writes; never import `@agentic-ui/shared/content-adapter-nuxeo` outside the app
  composition root. Nuxeo-specific behaviour still goes through the domain services.
