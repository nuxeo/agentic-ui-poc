# AI Features

## Overview

AI features are currently powered by **Nuxeo Automation Operations** backed by the
Hyland AI Platform (HAIP) Java package. These operations are exposed via the standard
Nuxeo REST API at `/nuxeo/api/v1/automation/<OperationId>`.

The Angular frontend calls these operations via `AiGatewayService`, which wraps all
requests in the Nuxeo Automation envelope format: `{ "params": { ...params } }`.

**Architecture Note:** A standalone Node.js/Express AI backend formerly lived at
`apps/ai-backend/` and has been moved to a separate repository. That backend can be
used as an alternative deployment option, but the current implementation uses Nuxeo
Automation Operations directly.

---

## AI Automation Operations

All operations: `POST /nuxeo/api/v1/automation/<OperationId>`

| Operation ID        | Purpose                                | Input params                                            |
| ------------------- | -------------------------------------- | ------------------------------------------------------- |
| `AI.NlToNxql`       | Convert natural language to NXQL query | `{ query: string, suggestions: boolean }`               |
| `AI.Summarize`      | Generate document summary              | `{ docId: string }`                                     |
| `AI.SuggestTags`    | Suggest tags for a document            | `{ docId: string }`                                     |
| `AI.Classify`       | Classify document type/category        | `{ docId: string }`                                     |
| `AI.Similar`        | Find similar documents (NXQL)          | `{ docId: string, limit: number }`                      |
| `AI.Chat`           | RAG streaming chat                     | `{ message: string, historyJson: string, docId, page }` |
| `AI.Insights`       | Dashboard KPI cards                    | `{ userId: string }`                                    |
| `AI.Anomalies`      | Audit log anomaly detection            | `{ timeRange: string }`                                 |
| `AI.Sentiment`      | Comment sentiment analysis             | `{ commentsJson: string }`                              |
| `AI.NlPermissions`  | Natural language ACL query             | `{ query: string }`                                     |
| `AI.AuditNlFilter`  | Natural language audit filtering       | `{ query: string, today: string }`                      |
| `AI.AuditSummarize` | Audit log summarization                | `{ entriesJson: string }`                               |

---

## Feature Flag System

AI features are gated behind a feature flag that is **on by default** for the Agentic UI PoC.
Users can explicitly disable AI features from the UI; that opt-out is persisted in localStorage.

Default-on relies on valid HAIP configuration in the Nuxeo server. Keep the UI gate in place,
never hardcode HAIP credentials, and route all model calls through Nuxeo automation operations.

```typescript
// Service: libs/shared/ai-client/src/lib/ai-feature-flag.service.ts
readonly aiEnabled = signal(this.readFromStorage()); // DEFAULT: on

// In templates
@if (aiFeatureFlag.aiEnabled()) {
  <app-ai-insights-panel />
}
```

The flag is toggled in the app header menu (Settings → AI Features).

---

## Angular AI Gateway Service

```typescript
// Service: libs/shared/ai-client/src/lib/ai-gateway.service.ts
// Import: @agentic-ui/shared/ai-client
// Configuration: AI_BACKEND_URL = '/nuxeo' (see apps/nuxeo-ui/src/app/app.config.ts)

nlToNxql(query: string): Observable<NlToNxqlResponse>
nlToNxqlSuggestions(query: string): Observable<NlToNxqlSuggestionsResponse>
summarize(docId: string): Observable<SummarizeResponse>
suggestTags(docId: string): Observable<SuggestTagsResponse>
classify(docId: string): Observable<ClassifyResponse>
findSimilar(docId: string, limit?: number): Observable<SimilarResponse>
chat(request: ChatRequest): Observable<ChatResponse>
analyzeSentiment(comments: Array<{ id: string; text: string }>): Observable<SentimentResponse>
getInsights(userId: string): Observable<InsightsResponse>
detectAnomalies(timeRange?: string): Observable<AnomaliesResponse>
queryPermissions(query: string): Observable<NlPermissionsResponse>
auditNlFilter(query: string): Observable<AuditFilterResponse>
auditSummarize(entries: unknown[]): Observable<AuditSummaryResponse>
```

All methods call `/nuxeo/api/v1/automation/AI.<OperationName>` with params wrapped in the
Nuxeo Automation envelope: `{ "params": { ...params } }`.

---

## HAIP Configuration (Server-Side)

HAIP credentials are configured on the Nuxeo server via `nuxeo.conf` or environment variables.
The frontend never sees or handles these credentials — all AI calls are authenticated via the
existing Nuxeo session cookie (production) or Basic Auth interceptor (development).

```properties
# Example nuxeo.conf entries (server-side only)
haip.api.key=<secret>
haip.base.url=https://haip.hyland.com
haip.environment.id=<env-id>
haip.user.id=<user-id>
```

---

## Adding a New AI Operation

1. **Server-side:** Implement the Java automation operation in the Hyland HAIP package
2. **Frontend:** Add a method to `libs/shared/ai-client/src/lib/ai-gateway.service.ts`
3. **UI:** Gate the feature behind `@if (aiFeatureFlag.aiEnabled())`
4. **Docs:** Update this file (`AGENTS/10-ai-features.md`) and `docs/ai-features.md`
5. **Types:** Add TypeScript interfaces to `libs/shared/ai-client/src/lib/ai.models.ts`

Example:

```typescript
// In ai-gateway.service.ts
myNewOperation(docId: string, param: string): Observable<MyResponse> {
  return this.http.post<MyResponse>(
    this.op('AI.MyNewOperation'),
    this.params({ docId, param })
  );
}
```

---

## Local Development Setup

```bash
# 1. Ensure your Nuxeo server is running with HAIP package installed
# 2. Configure HAIP credentials in nuxeo.conf (server-side)
# 3. Run the Angular app
npx nx serve nuxeo-ui
```

The Angular dev proxy forwards `/nuxeo/*` requests to `http://localhost:8080` (see `apps/nuxeo-ui/proxy.conf.json`).

---

## Alternative: Standalone AI Backend

A standalone Node.js/Express AI backend (formerly at `apps/ai-backend/`) exists in a
separate repository and can be used as an alternative deployment option. To use it:

1. Update `AI_BACKEND_URL` provider in `apps/nuxeo-ui/src/app/app.config.ts` to point to the AI backend
2. Modify `AiGatewayService` to call `/ai/*` endpoints instead of `/nuxeo/api/v1/automation/AI.*`
3. Add `/ai/*` proxy configuration to `apps/nuxeo-ui/proxy.conf.json` for development
