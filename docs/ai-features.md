# AI Features

This document describes the AI capabilities integrated into the Nuxeo Angular UI. All AI features are powered by OpenAI's GPT-4o / GPT-4o-mini models through a dedicated Express backend that acts as a secure proxy.

## Architecture

```
Browser (Angular)          AI Backend (Express)         External
┌──────────────┐          ┌──────────────────┐        ┌──────────┐
│  nuxeo-ui    │──/ai/*──▶│  apps/ai-backend  │──────▶│  OpenAI  │
│  :4200       │          │  :3000            │        │  API     │
│              │          │                   │──────▶│          │
│  libs/shared │          │  services/        │       └──────────┘
│  /ai-client  │          │  nuxeo.service.ts │
└──────────────┘          └────────┬──────────┘
                                   │
                          ┌────────▼──────────┐
                          │  Nuxeo Server     │
                          │  :8080            │
                          └───────────────────┘
```

**Key design decisions:**

- The OpenAI API key never reaches the browser. All LLM calls go through `apps/ai-backend`.
- The Angular dev server proxies `/ai/*` to `localhost:3000` via `proxy.conf.json`.
- The backend also makes server-side Nuxeo REST API calls (document content, metadata, audit logs) to build context for the LLM.

## Quick Start

```bash
# 1. Set your OpenAI API key in apps/ai-backend/.env
#    OPENAI_API_KEY=sk-proj-...
#    NUXEO_URL=http://localhost:8080
#    NUXEO_AUTH=Administrator:Administrator
#    PORT=3000

# 2. Start both Angular app and AI backend in one command
npm run dev

# 3. Or start them separately
npx nx serve ai-backend    # http://localhost:3000
npx nx serve nuxeo-ui      # http://localhost:4200
```

Verify the backend is running: `curl http://localhost:3000/ai/health`

## Features

### 1. Natural Language Search

**Location:** Search page (toggle "AI Search" button)

Converts plain English queries into valid NXQL and executes them against Nuxeo.

- Type a query like "PDFs uploaded last week by Administrator"
- The system generates and displays the NXQL query
- Results appear in the standard grid/table/list views
- Autocomplete suggestions appear as you type (debounced, uses gpt-4o-mini)

**Also available in:** Admin > NXQL Search page as a "Generate NXQL" input that populates the query editor.

| Component           | File                                                           |
| ------------------- | -------------------------------------------------------------- |
| Search UI           | `libs/features/search/src/lib/search/search.ts`                |
| Admin NXQL          | `libs/features/administration/src/lib/admin-nxql-search-page/` |
| Backend route       | `apps/ai-backend/src/routes/nl-to-nxql.route.ts`               |
| NXQL schema context | `apps/ai-backend/src/context/nxql-schema.ts`                   |

**API:** `POST /ai/nl-to-nxql`

```json
{ "query": "all PDFs modified this month", "suggestions": false }
→ { "nxql": "SELECT * FROM Document WHERE ...", "explanation": "..." }
```

---

### 2. Document Summarization

**Location:** Document Detail > AI Insights tab > Document Summary

Generates a structured summary of any document by reading its blob content and metadata.

- Click "Generate" to create a summary
- Returns a paragraph summary + bullet-point key points
- Handles text and JSON blobs; reports binary content gracefully

| Component          | File                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| Document Detail UI | `libs/features/document-detail/src/lib/document-detail/document-detail.ts` |
| Backend route      | `apps/ai-backend/src/routes/summarize.route.ts`                            |

**API:** `POST /ai/summarize`

```json
{ "docId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" }
→ { "summary": "...", "keyPoints": ["...", "..."], "wordCount": 1234 }
```

---

### 3. AI Tag Suggestions

**Location:** Document Detail > AI Insights tab > Suggested Tags

Analyzes document content and metadata to recommend relevant tags with confidence scores.

- Click "Suggest Tags" to generate recommendations
- Each tag shows a confidence percentage
- Click a tag chip to apply it to the document immediately (uses `TagService.addTag`)

| Component          | File                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| Document Detail UI | `libs/features/document-detail/src/lib/document-detail/document-detail.ts` |
| Backend route      | `apps/ai-backend/src/routes/suggest-tags.route.ts`                         |

**API:** `POST /ai/suggest-tags`

```json
{ "docId": "..." }
→ { "tags": [{ "label": "contract", "confidence": 0.95 }, ...] }
```

---

### 4. Document Classification

**Location:** Document Detail > AI Insights tab > Classification & Metadata

Classifies document content and suggests metadata values including description, nature, subjects, and workflow recommendation.

- Click "Classify" to analyze
- Displays suggested description, nature category, subjects, and recommended workflow with reasoning

| Component          | File                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| Document Detail UI | `libs/features/document-detail/src/lib/document-detail/document-detail.ts` |
| Backend route      | `apps/ai-backend/src/routes/classify.route.ts`                             |

**API:** `POST /ai/classify`

```json
{ "docId": "..." }
→ { "description": "...", "nature": "report", "subjects": ["finance"],
    "suggestedType": "File", "confidence": 0.85,
    "suggestedWorkflow": "SerialDocumentReview", "workflowReason": "..." }
```

---

### 5. Similar Documents

**Location:** Document Detail > AI Insights tab > Related Documents

Finds documents related to the current one using a combination of LLM-generated search queries and OpenAI text embeddings with cosine similarity scoring.

- Click "Find Similar" to discover related documents
- Results show title, path, and relevance score
- Click any result to navigate to that document

| Component          | File                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| Document Detail UI | `libs/features/document-detail/src/lib/document-detail/document-detail.ts` |
| Backend route      | `apps/ai-backend/src/routes/similar.route.ts`                              |

**API:** `POST /ai/similar`

```json
{ "docId": "...", "limit": 5 }
→ { "documents": [{ "uid": "...", "title": "...", "path": "...", "type": "File", "score": 0.87 }] }
```

---

### 6. AI Chat Assistant

**Location:** App header sparkle icon (top-right) opens a chat drawer

A context-aware conversational assistant that can answer questions about documents, search the repository, and provide workflow guidance.

- Uses RAG (Retrieval-Augmented Generation): detects search intent, queries Nuxeo, and includes results as context
- Context-aware: knows which document/page you are currently viewing
- Shows source document citations as clickable chips
- Welcome screen with starter suggestion prompts

| Component          | File                                                 |
| ------------------ | ---------------------------------------------------- |
| Chat drawer UI     | `apps/nuxeo-ui/src/app/shell/app-shell.component.ts` |
| Chat state service | `libs/shared/ai-client/src/lib/ai-chat.service.ts`   |
| Backend route      | `apps/ai-backend/src/routes/chat.route.ts`           |
| RAG pipeline       | `apps/ai-backend/src/services/rag.service.ts`        |

**API:** `POST /ai/chat`

```json
{ "message": "What documents were modified today?",
  "history": [...],
  "context": { "docId": "...", "page": "/search" } }
→ { "reply": "...", "sources": [{ "uid": "...", "title": "...", "path": "..." }] }
```

---

### 7. Dashboard AI Insights

**Location:** Dashboard page > AI Insights widget

Generates personalized, actionable insights based on the user's pending tasks, recent documents, and repository activity.

- Loads automatically when the dashboard opens
- Each insight has an icon, priority level, and a link to the relevant page
- Priority levels: high (red), medium (orange), low (green)

| Component     | File                                                          |
| ------------- | ------------------------------------------------------------- |
| Dashboard UI  | `apps/nuxeo-ui/src/app/dashboard/dashboard-page.component.ts` |
| Backend route | `apps/ai-backend/src/routes/insights.route.ts`                |

**API:** `POST /ai/insights`

```json
{ "userId": "Administrator" }
→ { "insights": [{ "text": "...", "icon": "task", "link": "/tasks", "priority": "high" }] }
```

---

### 8. Audit Anomaly Detection

**Location:** Admin > Analytics > AI Audit Anomalies tab

Analyzes recent audit events using AI to detect unusual patterns such as bulk deletions, permission escalations, or mass downloads.

- Select a time range (24h, 7d, 30d)
- Click "Scan for Anomalies"
- Displays a summary assessment and individual anomaly cards with severity levels

| Component     | File                                                         |
| ------------- | ------------------------------------------------------------ |
| Analytics UI  | `libs/features/administration/src/lib/admin-analytics-page/` |
| Backend route | `apps/ai-backend/src/routes/anomalies.route.ts`              |

**API:** `POST /ai/anomalies`

```json
{ "timeRange": "24h" }
→ { "anomalies": [{ "description": "...", "severity": "high", "events": [...], "timestamp": "..." }],
    "summary": "..." }
```

---

### 9. Comment Sentiment Analysis

**Location:** Available via API (UI integration pending)

Analyzes comment threads on documents to determine sentiment and provide a discussion summary.

| Component     | File                                            |
| ------------- | ----------------------------------------------- |
| Backend route | `apps/ai-backend/src/routes/sentiment.route.ts` |

**API:** `POST /ai/sentiment`

```json
{ "comments": [{ "id": "c1", "text": "Looks great!" }] }
→ { "sentiments": [{ "id": "c1", "sentiment": "positive", "summary": "..." }],
    "threadSummary": "..." }
```

---

### 10. Natural Language Permission Queries

**Location:** Available via API (UI integration pending)

Answers natural language questions about document permissions by querying Nuxeo ACLs.

| Component     | File                                                 |
| ------------- | ---------------------------------------------------- |
| Backend route | `apps/ai-backend/src/routes/nl-permissions.route.ts` |

**API:** `POST /ai/nl-permissions`

```json
{ "query": "Who can edit documents in /default-domain/workspaces/Legal?" }
→ { "answer": "...", "results": [{ "principal": "jdoe", "permission": "ReadWrite", "path": "/..." }] }
```

---

## Project Structure

```
apps/ai-backend/                    # Express.js AI backend
  src/
    main.ts                         # Server entry point, mounts all routes under /ai
    config.ts                       # Environment config + OpenAI client singleton
    middleware/
      error-handler.ts              # Global error handler (rate limits, quotas)
    services/
      openai.service.ts             # Chat completions, streaming, embeddings wrapper
      nuxeo.service.ts              # Server-side Nuxeo REST client (fetch + Basic Auth)
      rag.service.ts                # RAG pipeline: intent detection + context retrieval + generation
    context/
      nxql-schema.ts                # Nuxeo document types, fields, and NXQL grammar reference
      system-prompts.ts             # Tuned system prompts for each feature
    routes/
      health.route.ts               # GET  /ai/health
      nl-to-nxql.route.ts           # POST /ai/nl-to-nxql
      summarize.route.ts            # POST /ai/summarize
      chat.route.ts                 # POST /ai/chat
      suggest-tags.route.ts         # POST /ai/suggest-tags
      classify.route.ts             # POST /ai/classify
      similar.route.ts              # POST /ai/similar
      anomalies.route.ts            # POST /ai/anomalies
      sentiment.route.ts            # POST /ai/sentiment
      insights.route.ts             # POST /ai/insights
      nl-permissions.route.ts       # POST /ai/nl-permissions
  .env                              # Environment variables (not committed)
  project.json                      # Nx project config
  tsconfig.json

libs/shared/ai-client/              # Angular library for AI integration
  src/
    index.ts                        # Public API barrel
    lib/
      ai.config.ts                  # AI_BACKEND_URL InjectionToken
      ai-gateway.service.ts         # HTTP service with methods for all AI endpoints
      ai-chat.service.ts            # Signal-based chat conversation state
      ai.models.ts                  # TypeScript interfaces for all request/response types
```

## Models Used

| Feature            | Model                                | Reason                                              |
| ------------------ | ------------------------------------ | --------------------------------------------------- |
| NL-to-NXQL         | gpt-4o                               | Needs strong reasoning for query generation         |
| Search suggestions | gpt-4o-mini                          | Fast autocomplete, low cost                         |
| Summarization      | gpt-4o                               | Long-context document handling                      |
| Tag suggestions    | gpt-4o-mini                          | Simple classification task                          |
| Classification     | gpt-4o-mini                          | Metadata suggestion                                 |
| Similar documents  | text-embedding-3-small + gpt-4o-mini | Embeddings for similarity, LLM for query generation |
| Chat (RAG)         | gpt-4o                               | Complex multi-step reasoning                        |
| Sentiment          | gpt-4o-mini                          | Simple sentiment classification                     |
| Insights           | gpt-4o-mini                          | Lightweight summary generation                      |
| Anomaly detection  | gpt-4o                               | Security analysis needs strong reasoning            |
| NL permissions     | gpt-4o                               | Complex ACL interpretation                          |

## Environment Variables

| Variable         | Default                       | Description                                  |
| ---------------- | ----------------------------- | -------------------------------------------- |
| `OPENAI_API_KEY` | (required)                    | Your OpenAI API key                          |
| `NUXEO_URL`      | `http://localhost:8080`       | Nuxeo server URL                             |
| `NUXEO_AUTH`     | `Administrator:Administrator` | Nuxeo Basic Auth credentials (user:password) |
| `PORT`           | `3000`                        | AI backend port                              |

## Cloud Deployment

In production, the Angular dev server proxy does not exist. You need one of:

1. **Reverse proxy** (Nginx, ALB, Cloud LB) that routes `/ai/*` to the Node.js backend and `/*` to the static Angular build.
2. **Single container** where the Express backend also serves the Angular static files from `dist/nuxeo-ui/`.
3. **Separate origins** with `AI_BACKEND_URL` set to the backend's public URL and CORS enabled (already configured).

The `OPENAI_API_KEY` should be injected via your cloud's secrets management (AWS Secrets Manager, GCP Secret Manager, etc.) rather than a `.env` file.
