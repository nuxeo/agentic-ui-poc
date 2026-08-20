# AGENTS.md — Nuxeo Agentic UI: Complete Codebase Context

**Read this file at the start of every AI session.**
Full knowledge base: `AGENTS/00-architecture.md` through `AGENTS/10-ai-features.md`

---

## 1. Architecture in 30 Seconds

Angular 19 + Nx monorepo with 4 layers:

```
apps/nuxeo-ui          ← App Shell (routing, auth, global search)
    ↓ lazy-loads
libs/features/*        ← 8 Feature Modules (browse, search, doc-detail, …)
    ↓ imports from     ← NEVER cross-feature imports
libs/shared/*          ← Services, UI components, models, AI client
    ↓ calls
Nuxeo Server           ← Via proxy in dev, same-origin in prod
```

**Critical rules:** Features never import each other · Services in `libs/shared/nuxeo-client/` · All components standalone · All templates external · `inject()` not constructor · `signal()` not BehaviorSubject · `takeUntilDestroyed()` on every subscription

→ Full detail: `AGENTS/00-architecture.md`

---

## 2. Feature Modules

| Route               | Module                                | Main component                 |
| ------------------- | ------------------------------------- | ------------------------------ |
| `/#/browse`         | `@agentic-ui/feature-browse`          | `BrowseComponent`              |
| `/#/search`         | `@agentic-ui/feature-search`          | `SearchComponent`              |
| `/#/doc/:uid`       | `@agentic-ui/feature-document-detail` | `DocumentDetailComponent`      |
| `/#/collections`    | `@agentic-ui/feature-collections`     | `CollectionDetailComponent`    |
| `/#/tasks`          | `@agentic-ui/feature-tasks`           | `TasksPageComponent`           |
| `/#/administration` | `@agentic-ui/feature-administration`  | `AdministrationShellComponent` |
| `/#/documents`      | `@agentic-ui/feature-assets`          | `AssetSearchResultsComponent`  |
| `/#/trash`          | `@agentic-ui/feature-trash`           | `TrashComponent`               |

---

## 3. Key Services (quick reference)

All in `libs/shared/nuxeo-client/src/lib/services/` · Import: `@agentic-ui/shared/nuxeo-client`

| Service                    | Primary use                                                                  |
| -------------------------- | ---------------------------------------------------------------------------- |
| `DocumentDetailService`    | Single-doc ops: fetch, blob, PDF, audit, lock, versions, permissions, export |
| `BrowseService`            | Folder navigation, update doc, copy/move, CSV export                         |
| `SearchAggregationService` | Search state (signals only, no HTTP)                                         |
| `SearchService`            | Search execution, suggestions, saved searches, user collections              |
| `SavedPageService`         | Page-builder pages: list, read, save, update, delete + ACL sharing           |
| `CollectionService`        | Read collections and their members, list favorites, update properties        |
| `TaskService`              | Workflow tasks                                                               |
| `UserService`              | User/group search and management                                             |
| `TagService`               | Add/remove tags + tag suggestions                                            |
| `WorkflowService`          | Workflow model + instance operations                                         |
| `DocumentService`          | Recently edited/viewed, expired docs                                         |
| `DocumentImportService`    | Upload batch, CSV import                                                     |
| `SelectionService`         | Multi-select state (signals)                                                 |
| `DirectoryService`         | Nuxeo vocabulary/directory lookups + entry CRUD                              |
| `NuxeoDriveService`        | Nuxeo Drive URL building + launch                                            |
| `ARenderService`           | ARender previewer and diff URLs                                              |

`CollectionService` cannot create or delete a collection: `createCollection` and the
add/remove-from-favorites toggles are on `DocumentDetailService`.

This table and `AGENTS/01-services.md` are **machine-checked** against the real classes by
`checkServiceMapDocs` in `scripts/review-guardrails.mjs` — class names, method names, method return
types and the operations these descriptions claim. Run `npm run review:guardrails` after changing a
service. See `AGENTS/05-test-standards.md` for what it does and does not verify.

→ Full signatures: `AGENTS/01-services.md`

---

## 4. Most-Used API Endpoints

| Operation         | Method | Endpoint                                     |
| ----------------- | ------ | -------------------------------------------- |
| Fetch document    | GET    | `/nuxeo/api/v1/id/:uid`                      |
| NXQL search       | POST   | `/nuxeo/api/v1/search/lang/NXQL/execute`     |
| Create collection | POST   | `/nuxeo/api/v1/automation/Collection.Create` |
| Get children      | GET    | `/nuxeo/api/v1/id/:uid/@children`            |
| Get thumbnail     | GET    | `/nuxeo/api/v1/id/:uid/@rendition/thumbnail` |
| Get PDF           | GET    | `/nuxeo/api/v1/id/:uid/@rendition/pdf`       |
| Upload            | POST   | `/nuxeo/api/v1/upload`                       |
| Complete task     | PUT    | `/nuxeo/api/v1/task/:taskId`                 |

→ Full reference + enrichers + automation ops: `AGENTS/02-nuxeo-apis.md`

---

## 5. AI Automation Operations

**There is no AI backend in this repository.** AI is served by the standalone
[`nuxeo-ai-package`](https://github.com/nuxeo/nuxeo-ai-package) Java marketplace bundle
installed on the Nuxeo server. The browser reaches it through the Nuxeo Automation API,
so AI calls are ordinary same-origin `/nuxeo/*` requests carrying the user's Nuxeo session.

- **Client:** `AiGatewayService` in `libs/shared/ai-client/src/lib/ai-gateway.service.ts`
- **Base URL:** `AI_BACKEND_URL`, provided as `'/nuxeo'` in `apps/nuxeo-ui/src/app/app.config.ts`
- **Request shape:** `POST <base>/api/v1/automation/<OperationId>` with body `{ "params": { … } }`
- **Feature flag:** on by default — gated by `AiFeatureFlagService`, with an explicit user opt-out

| Operation           | `AiGatewayService` method | Params                                    | Purpose                           |
| ------------------- | ------------------------- | ----------------------------------------- | --------------------------------- |
| `AI.NlToNxql`       | `nlToNxql`                | `query`, `suggestions: false`             | Natural language → NXQL           |
| `AI.NlToNxql`       | `nlToNxqlSuggestions`     | `query`, `suggestions: true`              | Search autocomplete suggestions   |
| `AI.Summarize`      | `summarize`               | `docId`                                   | Document summary                  |
| `AI.SuggestTags`    | `suggestTags`             | `docId`                                   | Tag suggestions                   |
| `AI.Classify`       | `classify`                | `docId`                                   | Document classification           |
| `AI.Similar`        | `findSimilar`             | `docId`, `limit`                          | Related documents                 |
| `AI.Chat`           | `chat`                    | `message`, `historyJson`, `docId`, `page` | Assistant reply (not streaming)   |
| `AI.Sentiment`      | `analyzeSentiment`        | `commentsJson`                            | Comment sentiment + thread digest |
| `AI.Insights`       | `getInsights`             | `userId`                                  | Dashboard KPI cards               |
| `AI.Anomalies`      | `detectAnomalies`         | `timeRange`                               | Audit anomaly detection           |
| `AI.NlPermissions`  | `queryPermissions`        | `query`                                   | Natural language ACL query        |
| `AI.AuditNlFilter`  | `auditNlFilter`           | `query`, `today`                          | Natural language audit filter     |
| `AI.AuditSummarize` | `auditSummarize`          | `entriesJson`                             | Audit trail summary               |

→ Full detail: `AGENTS/10-ai-features.md`

---

## 6. Where Things Live

| I need to...               | Location                                                                                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add a Nuxeo API call       | `libs/shared/nuxeo-client/src/lib/services/<domain>.service.ts`                                                                                            |
| Add a shared dialog        | `libs/shared/ui/src/lib/<dialog-name>/`                                                                                                                    |
| Change a permission dialog | `libs/shared/ui/src/lib/{add,update,delete}-permission-dialog/` and `share-external-dialog/` — shared because `browse` and `document-detail` both use them |
| Add a feature page         | `libs/features/<feature>/src/lib/<feature>/<feature>.ts`                                                                                                   |
| Change routing             | `apps/nuxeo-ui/src/app/app.routes.ts`                                                                                                                      |
| Change navigation          | `apps/nuxeo-ui/src/app/platform-nav-items.ts`                                                                                                              |
| Call a new AI operation    | `libs/shared/ai-client/src/lib/ai-gateway.service.ts` (the operation itself lives in `nuxeo-ai-package`)                                                   |
| Change auth behavior       | `apps/nuxeo-ui/src/app/auth/`                                                                                                                              |
| Add a data model           | `libs/shared/nuxeo-client/src/lib/models/`                                                                                                                 |
| Add a shared component     | `libs/shared/ui/src/lib/`                                                                                                                                  |

---

## 7. Definition of Done for Every Task

- [ ] `npm run review:preflight` passes (guardrails + affected lint, build and test)
- [ ] `npm run test:coverage` passes — no project below its floor in `coverage-thresholds.json`
- [ ] Unit tests written for any new service method
- [ ] `docs/api-integrations.md` updated if a new Nuxeo endpoint was called
- [ ] `docs/ai-features.md` updated if an AI Automation operation call changed
- [ ] `AGENTS/01-services.md` updated if a new service method was added
- [ ] `AGENTS/00-architecture.md` updated if architecture changed
- [ ] PR created on `feature/*` or `fix/*` branch (never commit to `main` directly)

---

## 8. Full Knowledge Base Index

| File                               | Contents                                                        |
| ---------------------------------- | --------------------------------------------------------------- |
| `AGENTS/00-architecture.md`        | 4-layer model, Nx rules, directory map, routing, auth flow      |
| `AGENTS/01-services.md`            | Every service with full method signatures                       |
| `AGENTS/02-nuxeo-apis.md`          | All REST + Automation endpoints, NXQL patterns, enrichers       |
| `AGENTS/03-angular-conventions.md` | Signals, inject(), standalone, subscriptions, blob URLs         |
| `AGENTS/04-feature-scaffold.md`    | Step-by-step guide to add a new feature module or dialog        |
| `AGENTS/05-test-standards.md`      | Test templates, coverage requirements, Vitest patterns          |
| `AGENTS/06-git-workflow.md`        | Branch naming, Conventional Commits, PR process, JIRA linking   |
| `AGENTS/07-security.md`            | Credentials, XSS, auth interceptor, blob lifecycle              |
| `AGENTS/08-bug-patterns.md`        | 10 known anti-patterns with BAD/GOOD examples                   |
| `AGENTS/09-pr-feedback.md`         | How to fetch and resolve GitHub PR review comments              |
| `AGENTS/10-ai-features.md`         | AI Automation operations, nuxeo-ai-package, feature flag system |

---

_If you are using JetBrains AI or another tool that requires manual context loading:_
_type `@AGENTS.md` at the start of your session to load this file, then request the_
_specific `AGENTS/` file(s) relevant to your task._
