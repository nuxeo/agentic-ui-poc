# AI Features

This document describes the AI capabilities integrated into the Nuxeo Angular UI.

**There is no AI backend in this repository.** The `apps/ai-backend` Express service described by
earlier revisions of this document was removed. AI now ships as
[`nuxeo-ai-package`](https://github.com/nuxeo/nuxeo-ai-package), a standalone Java marketplace
bundle installed on the Nuxeo server, which calls the Hyland AI Platform (HAIP) Model Gateway.
The Angular app reaches it through the Nuxeo Automation API.

Knowledge Enrichment follows the same pattern against a different bundle: the Hyland Content
Intelligence Connector (CIC).

## Architecture

```
AI features
┌──────────────┐                          ┌──────────────────────┐        ┌──────────┐
│  nuxeo-ui    │  POST /nuxeo/api/v1/     │  Nuxeo Server        │───────▶│  HAIP    │
│  :4200       │  automation/AI.*         │  + nuxeo-ai-package  │        │  Gateway │
│  libs/shared │─────────────────────────▶│  :8080               │        └──────────┘
│  /ai-client  │  { "params": { … } }     └──────────────────────┘
└──────────────┘

Knowledge Enrichment
┌──────────────┐          ┌──────────────────┐        ┌────────────────┐
│  nuxeo-ui    │─────────▶│  Nuxeo Server    │───────▶│  CIC / Context │
│  libs/shared │ multipart│  automation ops  │        │  API           │
│  /ke-client  │ blob     │  HylandKE.*      │        └────────────────┘
└──────────────┘          └──────────────────┘
```

**Key design decisions:**

- **No model credentials in the browser or in this repo.** The HAIP key is configured on the Nuxeo
  server as part of `nuxeo-ai-package`.
- **AI requests are ordinary Nuxeo requests.** They go through `HttpClient`, so
  `nuxeoAuthInterceptor` attaches auth and the same `/nuxeo` dev-proxy entry serves them. There is
  no `/ai/*` proxy rule and no second process to start.
- **Operations execute as the signed-in user**, so repository ACLs apply to AI results without the
  UI doing anything.
- **Nothing streams.** `AI.Chat` is a single request/response call. Streaming, tool loops and
  durable threads are the subject of the agent-runtime work, not this path.

## Quick Start

```bash
npx nx serve nuxeo-ui      # http://localhost:4200
```

That is the whole setup. The dev proxy (`apps/nuxeo-ui/proxy.conf.json`) forwards `/nuxeo` to
`http://localhost:8080`; `proxy.conf.beta.json` targets the shared beta cloud instance. AI features
work as soon as the target Nuxeo server has `nuxeo-ai-package` installed and HAIP configured.

To check that the package is present on a server, list the operation:

```bash
curl -u <user>:<pass> http://localhost:8080/nuxeo/api/v1/automation/AI.Chat
```

## Client Reference

All calls are made by `AiGatewayService`
(`libs/shared/ai-client/src/lib/ai-gateway.service.ts`), which builds
`POST <AI_BACKEND_URL>/api/v1/automation/<OperationId>` with a `{ "params": { … } }` body.
`AI_BACKEND_URL` is provided as `'/nuxeo'` in `apps/nuxeo-ui/src/app/app.config.ts` — the token
name is a leftover from the Express era and holds a Nuxeo origin, not an AI service URL.

## Features

### 1. Natural Language Search

**Location:** Search page (toggle "AI Search" button)

Converts plain English queries into valid NXQL and executes them against Nuxeo.

- Type a query like "PDFs uploaded last week by Administrator"
- The system generates and displays the NXQL query
- Results appear in the standard grid/table/list views
- Autocomplete suggestions appear as you type (400 ms debounce, minimum 3 characters)

**Also available in:** Admin > NXQL Search page as a "Generate NXQL" input that populates the query editor.

| Component  | File                                                           |
| ---------- | -------------------------------------------------------------- |
| Search UI  | `libs/features/search/src/lib/search/search.ts`                |
| Admin NXQL | `libs/features/administration/src/lib/admin-nxql-search-page/` |

**Operation:** `AI.NlToNxql`

```json
POST /nuxeo/api/v1/automation/AI.NlToNxql
{ "params": { "query": "all PDFs modified this month", "suggestions": false } }
→ { "nxql": "SELECT * FROM Document WHERE ...", "explanation": "..." }
```

With `"suggestions": true` the same operation returns `{ "suggestions": string[] }` for autocomplete.

---

### 2. Document Summarization

**Location:** Document Detail > AI Insights tab > Document Summary

Generates a structured summary of a document from its blob content and metadata.

| Component          | File                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| Document Detail UI | `libs/features/document-detail/src/lib/document-detail/document-detail.ts` |

**Operation:** `AI.Summarize`

```json
{ "params": { "docId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" } }
→ { "summary": "...", "keyPoints": ["...", "..."], "wordCount": 1234 }
```

---

### 3. AI Tag Suggestions

**Location:** Document Detail > AI Insights tab > Suggested Tags

Recommends tags with confidence scores. Clicking a tag chip applies it immediately via
`TagService.addTag`.

| Component          | File                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| Document Detail UI | `libs/features/document-detail/src/lib/document-detail/document-detail.ts` |

**Operation:** `AI.SuggestTags`

```json
{ "params": { "docId": "..." } }
→ { "tags": [{ "label": "contract", "confidence": 0.95 }, ...] }
```

---

### 4. Document Classification

**Location:** Document Detail > AI Insights tab > Classification & Metadata

Suggests description, nature category, subjects, and a recommended workflow with reasoning.

| Component          | File                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| Document Detail UI | `libs/features/document-detail/src/lib/document-detail/document-detail.ts` |

**Operation:** `AI.Classify`

```json
{ "params": { "docId": "..." } }
→ { "description": "...", "nature": "report", "subjects": ["finance"],
    "suggestedType": "File", "confidence": 0.85,
    "suggestedWorkflow": "SerialDocumentReview", "workflowReason": "..." }
```

---

### 5. Similar Documents

**Location:** Document Detail > AI Insights tab > Related Documents

Finds documents related to the current one, scored by relevance. Results show title, path and
score, and navigate to the document on click.

| Component          | File                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| Document Detail UI | `libs/features/document-detail/src/lib/document-detail/document-detail.ts` |

**Operation:** `AI.Similar`

```json
{ "params": { "docId": "...", "limit": 5 } }
→ { "documents": [{ "uid": "...", "title": "...", "path": "...", "type": "File", "score": 0.87 }] }
```

---

### 6. AI Chat Assistant

**Location:** App header sparkle icon (top-right) opens a chat drawer

A context-aware assistant that answers questions about documents, searches the repository, and
provides workflow guidance. It knows which document or page you are viewing and shows source
document citations as clickable chips.

The reply arrives in one response — there is no token streaming. Conversation history lives in an
in-memory signal and is lost on reload.

| Component          | File                                                 |
| ------------------ | ---------------------------------------------------- |
| Chat drawer UI     | `apps/nuxeo-ui/src/app/shell/app-shell.component.ts` |
| Chat state service | `libs/shared/ai-client/src/lib/ai-chat.service.ts`   |

**Operation:** `AI.Chat`

```json
{ "params": { "message": "What documents were modified today?",
              "historyJson": "[{\"role\":\"user\",\"content\":\"...\"}]",
              "docId": "", "page": "/search" } }
→ { "reply": "...", "sources": [{ "uid": "...", "title": "...", "path": "..." }] }
```

`history` is JSON-stringified into `historyJson` because Automation parameters are scalars.

---

### 7. Dashboard AI Insights

**Location:** Dashboard page > AI Insights widget

Generates personalized, actionable insights from the user's pending tasks, recent documents and
repository activity. Loads automatically when the dashboard opens. Each insight has an icon, a
priority level (high / medium / low) and a link.

| Component    | File                                                          |
| ------------ | ------------------------------------------------------------- |
| Dashboard UI | `apps/nuxeo-ui/src/app/dashboard/dashboard-page.component.ts` |

**Operation:** `AI.Insights`

```json
{ "params": { "userId": "Administrator" } }
→ { "insights": [{ "text": "...", "icon": "task", "link": "/tasks", "priority": "high" }] }
```

---

### 8. Audit Anomaly Detection

**Location:** Admin > Analytics > AI Audit Anomalies tab, and Admin > Audit

Analyzes recent audit events for unusual patterns such as bulk deletions, permission escalations
or mass downloads. Select a time range, scan, and read the summary plus per-anomaly severity cards.

| Component    | File                                                         |
| ------------ | ------------------------------------------------------------ |
| Analytics UI | `libs/features/administration/src/lib/admin-analytics-page/` |
| Audit UI     | `libs/features/administration/src/lib/admin-audit-page/`     |

**Operation:** `AI.Anomalies`

```json
{ "params": { "timeRange": "24h" } }
→ { "anomalies": [{ "description": "...", "severity": "high", "events": [...], "timestamp": "..." }],
    "summary": "..." }
```

---

### 9. Natural Language Audit Filtering and Summary

**Location:** Admin > Audit

Two further operations back the audit page: a natural language filter over audit entries, and a
summary of the entries currently in view.

| Component | File                                                     |
| --------- | -------------------------------------------------------- |
| Audit UI  | `libs/features/administration/src/lib/admin-audit-page/` |

**Operations:** `AI.AuditNlFilter`, `AI.AuditSummarize`

```json
{ "params": { "query": "deletions by admins last week", "today": "2026-08-06" } }
{ "params": { "entriesJson": "[ … audit entries … ]" } }
```

---

### 10. Comment Sentiment Analysis

**Location:** Document Detail > comment thread > "Analyze sentiment"

Classifies the sentiment of each comment and produces a thread summary. Sentiment is rendered
inline on each comment.

| Component          | File                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| Document Detail UI | `libs/features/document-detail/src/lib/document-detail/document-detail.ts` |

**Operation:** `AI.Sentiment`

```json
{ "params": { "commentsJson": "[{\"id\":\"c1\",\"text\":\"Looks great!\"}]" } }
→ { "sentiments": [{ "id": "c1", "sentiment": "positive", "summary": "..." }],
    "threadSummary": "..." }
```

---

### 11. Natural Language Permission Queries — client only, no UI

`AiGatewayService.queryPermissions()` exists and calls `AI.NlPermissions`, but nothing in the
application calls it. Treat it as an unwired capability rather than a shipped feature.

**Operation:** `AI.NlPermissions`

```json
{ "params": { "query": "Who can edit documents in /default-domain/workspaces/Legal?" } }
→ { "answer": "...", "results": [{ "principal": "jdoe", "permission": "ReadWrite", "path": "/..." }] }
```

---

### 12. Knowledge Enrichment

**Location:** Document Detail > document preview header (top-right KE action buttons)

Knowledge Enrichment runs through the Hyland Content Intelligence Connector installed on Nuxeo. It
is a separate bundle from `nuxeo-ai-package`.

- PDF actions: classify document, extract named entities, summarize document
- Image action: describe image and extract image entities
- Results are persisted back into Nuxeo metadata and refreshed in the properties panel

| Component / Service   | File                                                                       |
| --------------------- | -------------------------------------------------------------------------- |
| Document Detail UI    | `libs/features/document-detail/src/lib/document-detail/document-detail.ts` |
| KE shared client      | `libs/shared/ke-client/src/lib/ke-client.service.ts`                       |
| KE config + models    | `libs/shared/ke-client/src/lib/`                                           |
| Nuxeo/CIC setup guide | `docs/knowledge-enrichment.md`                                             |

**API:** `POST /nuxeo/site/automation/HylandKnowledgeEnrichment.Enrich`

The client first downloads the current blob from Nuxeo, then posts a multipart automation request:

```json
{
  "params": {
    "actions": "text-classification",
    "sourceId": "document-uuid",
    "classes": "[\"Contract\",\"Invoice\",\"Legal\",\"Technical\"]"
  }
}
```

The normalized result contains Context API outputs such as:

```json
{
  "textClassification": { "isSuccess": true, "result": "Contract" },
  "textSummary": { "isSuccess": true, "result": "Short summary..." },
  "namedEntityText": {
    "isSuccess": true,
    "result": { "ORGANIZATION": ["Hyland"] }
  }
}
```

**Metadata mapping:**

- `text-classification` -> `dc:nature`
- `named-entity-recognition-text` -> `nxtag:tags`
- `text-summarization` -> `dc:description`
- `image-description` + `named-entity-recognition-image` -> `dc:description`, `nxtag:tags`

---

## Project Structure

Everything AI-related in this repository is client-side:

```
libs/shared/ai-client/              # Angular library for AI integration
  src/
    index.ts                        # Public API barrel
    lib/
      ai.config.ts                  # AI_BACKEND_URL InjectionToken (holds a Nuxeo origin)
      ai-gateway.service.ts         # Automation operation client for every AI.* operation
      ai-chat.service.ts            # Signal-based chat conversation state
      ai-feature-flag.service.ts    # localStorage-backed on/off flag, default on
      ai.models.ts                  # Request/response interfaces
libs/shared/ke-client/              # Angular library for KE via Nuxeo CIC
  src/
    index.ts                        # Public API barrel
    lib/
      ke.config.ts                  # KE_CIC_OPERATIONS InjectionToken
      ke-client.service.ts          # Multipart browser -> Nuxeo -> CIC client
      ke.models.ts                  # Context API request/response models
```

The operations themselves live in the
[`nuxeo-ai-package`](https://github.com/nuxeo/nuxeo-ai-package) repository.

## Models Used

Model selection is made inside `nuxeo-ai-package` and is not visible from this repository. Do not
document model names here — they will drift silently. Check the AI package's configuration for the
server you are targeting.

## Configuration

This repository configures exactly one AI-related value:

| Value            | Where                                 | Default    |
| ---------------- | ------------------------------------- | ---------- |
| `AI_BACKEND_URL` | `apps/nuxeo-ui/src/app/app.config.ts` | `'/nuxeo'` |

HAIP credentials, prompts, model choice and rate limiting are all server-side configuration of
`nuxeo-ai-package`.

## Deployment

Nothing extra to deploy. The Angular app is served same-origin with Nuxeo in production, so
`/nuxeo/api/v1/automation/AI.*` resolves without a reverse-proxy rule, a container, or CORS
configuration. The only deployment requirement is that `nuxeo-ai-package` is installed on the
target Nuxeo server; where it is not, AI calls fail and each feature surfaces its own error state.
