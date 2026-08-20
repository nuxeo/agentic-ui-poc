# AI Features

## Overview

**There is no AI backend in this repository.** `apps/ai-backend` was removed. AI capability now
ships as [`nuxeo-ai-package`](https://github.com/nuxeo/nuxeo-ai-package), a standalone Java
marketplace bundle installed on the Nuxeo server, which calls the Hyland AI Platform (HAIP) Model
Gateway. There is no `/ai/*` route, no Express service, and nothing listening on port 3000.

The browser reaches AI through the Nuxeo Automation API. Every AI call is a same-origin
`/nuxeo/*` request that goes through the same dev proxy and the same `nuxeoAuthInterceptor` as any
other Nuxeo call, and executes on the server as the signed-in user.

```
libs/shared/ai-client (AiGatewayService)
    │  POST /nuxeo/api/v1/automation/<OperationId>
    │  body: { "params": { … } }
    ▼
Nuxeo Server + nuxeo-ai-package
    ▼
HAIP Model Gateway
```

---

## AI Automation Operations

Source of truth: `libs/shared/ai-client/src/lib/ai-gateway.service.ts`.
Base URL comes from the `AI_BACKEND_URL` injection token, provided as `'/nuxeo'` in
`apps/nuxeo-ui/src/app/app.config.ts`. The token name is a leftover from the Express era; it
holds a Nuxeo origin, not an AI service URL.

| Operation           | Method                | Params                                    | Called from                                       |
| ------------------- | --------------------- | ----------------------------------------- | ------------------------------------------------- |
| `AI.NlToNxql`       | `nlToNxql`            | `query`, `suggestions: false`             | Search page, Admin NXQL page                      |
| `AI.NlToNxql`       | `nlToNxqlSuggestions` | `query`, `suggestions: true`              | Search page autocomplete (400 ms debounce)        |
| `AI.Summarize`      | `summarize`           | `docId`                                   | Document Detail → AI Insights                     |
| `AI.SuggestTags`    | `suggestTags`         | `docId`                                   | Document Detail → AI Insights                     |
| `AI.Classify`       | `classify`            | `docId`                                   | Document Detail → AI Insights                     |
| `AI.Similar`        | `findSimilar`         | `docId`, `limit` (default 5)              | Document Detail → AI Insights                     |
| `AI.Chat`           | `chat`                | `message`, `historyJson`, `docId`, `page` | `AiChatService` → app shell chat drawer           |
| `AI.Sentiment`      | `analyzeSentiment`    | `commentsJson`                            | Document Detail → comment thread                  |
| `AI.Insights`       | `getInsights`         | `userId`                                  | Dashboard AI Insights widget                      |
| `AI.Anomalies`      | `detectAnomalies`     | `timeRange` (default `'24h'`)             | Admin Analytics page, Admin Audit page            |
| `AI.NlPermissions`  | `queryPermissions`    | `query`                                   | **No caller** — client method exists, UI does not |
| `AI.AuditNlFilter`  | `auditNlFilter`       | `query`, `today`                          | Admin Audit page                                  |
| `AI.AuditSummarize` | `auditSummarize`      | `entriesJson`                             | Admin Audit page                                  |

Two shapes worth knowing before you extend this:

- **Nothing streams.** `AI.Chat` is a single `HttpClient.post` returning a complete
  `ChatResponse`. Any documentation describing SSE or token streaming is stale. Streaming is plan
  task A2–A5, not something the current path supports.
- **Structured params are flattened to JSON strings.** `historyJson`, `commentsJson` and
  `entriesJson` exist because Automation parameters are scalars. Preserve that when adding
  operations, or change it deliberately on both sides.

---

## Feature Flag System

AI features are gated behind a feature flag that is **on by default**.
Users can explicitly disable AI features from the UI; that opt-out is persisted to `localStorage`.

```typescript
// Service: libs/shared/ai-client/src/lib/ai-feature-flag.service.ts
readonly aiEnabled = signal<boolean>(this.readFromStorage()); // DEFAULT: on

// In templates
@if (aiFeatureFlag.aiEnabled()) {
  <app-ai-insights-panel />
}
```

The flag is toggled in the app header menu (Settings → AI Features). It is browser-local, so it
is a user preference, not an administrative control — there is no server-side off switch today.

Default-on assumes `nuxeo-ai-package` is installed and HAIP is configured on the target Nuxeo
server. Where it is not, operations return errors and each caller falls back to its own error
state; the UI does not probe for the package.

---

## Configuration

Nothing AI-related is configured in this repository beyond the base URL:

```typescript
// apps/nuxeo-ui/src/app/app.config.ts
{ provide: AI_BACKEND_URL, useValue: '/nuxeo' }
```

HAIP credentials, model selection, prompts and rate limiting all live in `nuxeo-ai-package` on the
Nuxeo server. Never add a model API key to this repo — see `AGENTS/07-security.md`.

---

## Adding or Changing an AI Capability

1. The operation itself is implemented in `nuxeo-ai-package`, in a separate repository. If the
   capability does not exist there yet, that change lands first.
2. Add a method to `libs/shared/ai-client/src/lib/ai-gateway.service.ts` using the `op()` and
   `params()` helpers so the URL and envelope stay consistent.
3. Add the request/response types to `ai.models.ts` and export them from `src/index.ts`.
4. Gate the UI behind `@if (aiFeatureFlag.aiEnabled())`.
5. Update this file, `docs/ai-features.md`, and `AGENTS.md` section 5.

---

## Local Development

No extra process is required. Run the Angular app and point the dev proxy at a Nuxeo server that
has `nuxeo-ai-package` installed:

```bash
npx nx serve nuxeo-ui      # http://localhost:4200
```

`apps/nuxeo-ui/proxy.conf.json` forwards `/nuxeo` to `http://localhost:8080`;
`proxy.conf.beta.json` targets the shared beta cloud instance. AI calls ride that same proxy
entry — there is no separate AI proxy rule.
