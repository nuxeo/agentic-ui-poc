# AI Features

## Overview

AI features are powered by a Node.js/Express backend at `apps/ai-backend/` which calls
the Hyland AI Platform (HAIP) Model Gateway — an OpenAI-compatible API.

In development, the backend runs on port 3000. In production, it is deployed as a Docker
container alongside the Nuxeo server.

---

## AI Backend Routes

All routes: `POST /ai/<endpoint>` (except health check)

| Route                     | Purpose                                | Notes                                                |
| ------------------------- | -------------------------------------- | ---------------------------------------------------- |
| `POST /ai/nl-to-nxql`     | Convert natural language to NXQL query | Input: `{ query: string }`                           |
| `POST /ai/summarize`      | Generate document summary              | Input: `{ content: string, title: string }`          |
| `POST /ai/suggest-tags`   | Suggest tags for a document            | Input: `{ content: string, existingTags: string[] }` |
| `POST /ai/classify`       | Classify document type/category        | Input: `{ content: string, title: string }`          |
| `POST /ai/similar`        | Find similar documents (NXQL)          | Input: `{ docUid: string }`                          |
| `POST /ai/chat`           | RAG streaming chat                     | Input: `{ messages: ChatMessage[], docUid: string }` |
| `POST /ai/insights`       | Dashboard KPI cards                    | Input: `{ recentDocs: NuxeoDocument[] }`             |
| `POST /ai/anomalies`      | Audit log anomaly detection            | Input: `{ auditEvents: AuditEvent[] }`               |
| `POST /ai/sentiment`      | Document sentiment analysis            | Input: `{ content: string }`                         |
| `POST /ai/nl-permissions` | Natural language ACL query             | Input: `{ query: string, docUid: string }`           |
| `GET /ai/health`          | Health check                           | Returns `{ status: 'ok' }`                           |

---

## Feature Flag System

AI features are gated behind a feature flag that is **off by default** to prevent unexpected
API charges.

```typescript
// Service: libs/shared/ai-client/src/lib/ai-feature-flag.service.ts
readonly aiEnabled = signal(false); // DEFAULT: off

// In templates
@if (aiFeatureFlag.aiEnabled()) {
  <app-ai-insights-panel />
}
```

The flag is toggled in the app header menu (Settings → AI Features).

---

## Angular AI Client

```typescript
// Service: libs/shared/ai-client/src/lib/ai.service.ts
// Import: @agentic-ui/shared/ai-client

summarize(content: string, title: string): Observable<string>
suggestTags(content: string, existingTags: string[]): Observable<string[]>
classify(content: string, title: string): Observable<string>
nlToNxql(query: string): Observable<string>
getInsights(recentDocs: NuxeoDocument[]): Observable<AiInsight[]>
detectAnomalies(auditEvents: AuditEvent[]): Observable<AiAnomaly[]>
```

---

## HAIP Configuration (`apps/ai-backend/src/config.ts`)

```typescript
export const config = {
  haipApiKey: process.env['HAIP_API_KEY'] ?? '',
  haipBaseUrl: process.env['HAIP_BASE_URL'] ?? '',
  haipEnvironmentId: process.env['HAIP_ENVIRONMENT_ID'] ?? '',
  haipUserId: process.env['HAIP_USER_ID'] ?? '',
  nuxeoAuth: process.env['NUXEO_AUTH'] ?? '',
  nuxeoBaseUrl: process.env['NUXEO_BASE_URL'] ?? 'http://localhost:8080',
  aiBackendPort: parseInt(process.env['PORT'] ?? '3000', 10),
};
```

All values validated at startup — if required values are missing, the process exits with a clear error message.

---

## Adding a New AI Endpoint

1. Create `apps/ai-backend/src/routes/<name>.route.ts`
2. Register in `apps/ai-backend/src/main.ts`
3. Add a method to `libs/shared/ai-client/src/lib/ai.service.ts`
4. Gate the UI behind `@if (aiFeatureFlag.aiEnabled())`
5. Update this file (`AGENTS/10-ai-features.md`) and `docs/ai-features.md`

---

## Local Development Setup

```bash
# 1. Copy the example env file
cp apps/ai-backend/.env.example apps/ai-backend/.env

# 2. Fill in real values (HAIP_API_KEY, NUXEO_AUTH, etc.)

# 3. Run the AI backend
npx nx serve ai-backend

# 4. Run the Angular app (separate terminal)
npx nx serve nuxeo-ui
```

The Angular dev proxy forwards `/ai/*` requests to `http://localhost:3000`.
