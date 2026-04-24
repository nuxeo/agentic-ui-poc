# Nuxeo AI Operations — HAIP Marketplace Package

Deploys AI-powered Automation Operations into Nuxeo using the **Hyland AI Platform (HAIP)** as the LLM backend. No Node.js server, no Docker, no extra infrastructure — just install the `.zip` and configure your HAIP key.

---

## What's included

| Operation           | What it does                                                          |
| ------------------- | --------------------------------------------------------------------- |
| `AI.Summarize`      | Summarizes a document's content                                       |
| `AI.Insights`       | Generates personalised dashboard insights for the current user        |
| `AI.SuggestTags`    | Suggests tags based on document content                               |
| `AI.Classify`       | Classifies doc type, nature, subjects, and suggests a workflow        |
| `AI.NlToNxql`       | Converts natural language to NXQL (or returns search suggestions)     |
| `AI.Sentiment`      | Analyses comment sentiment on a document                              |
| `AI.Chat`           | RAG-backed conversational assistant with live Nuxeo repository access |
| `AI.Similar`        | Finds similar documents using AI-generated NXQL                       |
| `AI.Anomalies`      | Detects anomalies in audit logs                                       |
| `AI.NlPermissions`  | Answers natural language questions about document permissions         |
| `AI.AuditNlFilter`  | Converts natural language to audit filter parameters                  |
| `AI.AuditSummarize` | Generates an executive summary of audit log entries                   |

All operations are callable via the standard Nuxeo Automation REST API:

```
POST /nuxeo/api/v1/automation/AI.Summarize
Authorization: Basic ...
Content-Type: application/json

{ "params": { "docId": "<uid>" } }
```

---

## Prerequisites

- Java 11+
- Maven 3.8+
- Nuxeo LTS 2021.x or 2023.x
- A valid HAIP API key (`sk-...`)

---

## Build

```bash
cd apps/nuxeo-ai-package
mvn clean package -DskipTests
```

The Marketplace ZIP is produced at:

```
nuxeo-ai-package/target/nuxeo-ai-operations-1.0.0.zip
```

---

## Install

### Option A — Nuxeo Admin Center (recommended)

1. Log into Nuxeo as Administrator
2. Go to **Admin → Update Center → Local packages**
3. Upload `nuxeo-ai-operations-1.0.0.zip`
4. Click **Install**

### Option B — nuxeoctl CLI

```bash
./bin/nuxeoctl mp-install /path/to/nuxeo-ai-operations-1.0.0.zip
```

---

## Configure

Add to `nuxeo.conf` (no restart needed if using hot-reload, otherwise restart Nuxeo):

```properties
# Required
haip.api.key=sk-ib1KwoJKNk1e3ETQrMMOVw

# Optional overrides (these are the defaults)
haip.base.url=https://ai-platform-public.api.ai.dev.app.hyland.com
haip.model=anthropic.claude-3-5-sonnet-20241022-v2:0
haip.model.fast=amazon.nova-micro-v1:0
haip.environment.id=
```

---

## Angular UI

The Angular UI (`apps/nuxeo-ui`) is already updated to call the Java operations via:

```
/nuxeo/api/v1/automation/AI.*
```

`AI_BACKEND_URL` is set to `/nuxeo` in `app.config.ts`. All calls go through the existing `/nuxeo` proxy — no additional proxy config needed.

---

## Project structure

```
apps/nuxeo-ai-package/
├── pom.xml                          ← Parent POM (build both modules)
├── nuxeo-ai-core/                   ← The OSGi bundle (JAR)
│   ├── pom.xml
│   └── src/main/java/com/hyland/nuxeo/ai/
│       ├── client/HaipClient.java   ← HTTP calls to HAIP
│       ├── prompts/SystemPrompts.java
│       └── operations/              ← 12 Automation Operations
└── nuxeo-ai-package/                ← Marketplace ZIP builder
    ├── pom.xml
    └── src/main/resources/
        ├── package.xml
        └── install.xml
```

---

## Nuxeo version compatibility

Update `<nuxeo.version>` in the parent `pom.xml` to match your server:

| Nuxeo Server | `nuxeo.version` |
| ------------ | --------------- |
| LTS 2023     | `2023.x`        |
| LTS 2021     | `2021.x`        |
