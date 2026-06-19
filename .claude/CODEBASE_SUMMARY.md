# Codebase Summary — Nuxeo Agentic UI PoC

**Generated:** 2026-06-19  
**For:** First-time Claude Code users working on this project

---

## 🎯 What This Project Is

A modern **Angular 19 UI** for **Nuxeo Content Services Platform**, built as an **Nx monorepo** with AI-powered features.

**Key stats:**

- 9 feature modules (Browse, Search, Document Detail, Collections, Tasks, Administration, Assets, Trash, Knowledge Discovery)
- 22 Nuxeo API services
- 11 AI automation operations
- 2,000+ lines of agent documentation
- 100% standalone components, signals-based state management

---

## 🏗️ Architecture (4 Layers)

```text
apps/nuxeo-ui                    ← App shell (routing, auth, header)
    ↓ lazy-loads
libs/features/*                  ← 9 feature modules (NEVER import from each other)
    ↓ imports from
libs/shared/*                    ← Services, UI components, AI/KD/KE clients
    ↓ HTTP calls to
Nuxeo Server (port 8080)         ← REST API + Automation Operations
```

**Boundary enforcement:** Nx lint will fail if features cross-import.

---

## 📁 Key Directories

| Path                        | Purpose                                     |
| --------------------------- | ------------------------------------------- |
| `apps/nuxeo-ui/`            | Main Angular SPA (routing, auth, dashboard) |
| `libs/features/`            | 9 lazy-loaded feature modules               |
| `libs/shared/nuxeo-client/` | 22 Nuxeo REST API services                  |
| `libs/shared/ai-client/`    | AI automation gateway + feature flag        |
| `libs/shared/kd-client/`    | Knowledge Discovery client (Nuxeo CIC)      |
| `libs/shared/ke-client/`    | Knowledge Enrichment client (Nuxeo CIC)     |
| `libs/shared/ui/`           | Reusable Satori UI components               |
| `AGENTS/`                   | Complete agent documentation (11 files)     |

---

## 🤖 AI Features (Nuxeo Automation Operations)

**Backend:** Server-side Java operations in Nuxeo (Hyland HAIP package)  
**Frontend:** `AiGatewayService` in `libs/shared/ai-client/`
**Configuration:** `AI_BACKEND_URL = '/nuxeo'` (see `apps/nuxeo-ui/src/app/app.config.ts`)

**Note:** A standalone Node.js/Express AI backend exists in a separate repository as an
alternative deployment option, but the current implementation uses Nuxeo Automation Operations.

**Available operations:**

- `AI.NlToNxql` — Natural language → NXQL search
- `AI.Summarize` — Document summarization
- `AI.SuggestTags` — AI tag suggestions
- `AI.Classify` — Document classification
- `AI.Chat` — RAG chat with document context
- `AI.Insights` — Dashboard KPI cards
- `AI.Anomalies` — Audit log anomaly detection
- `AI.Sentiment` — Comment sentiment analysis
- `AI.Similar` — Similar documents
- `AI.NlPermissions` — Natural language ACL queries
- `AI.AuditNlFilter` — Natural language audit filtering
- `AI.AuditSummarize` — Audit log summarization

**Feature flag:** ON by default (user opt-out in UI settings)

---

## 🛠️ Development Commands

```bash
# Start dev server (with Nuxeo proxy)
npm run dev                      # or: npx nx serve nuxeo-ui

# Lint affected projects
npx nx affected -t lint

# Build affected projects
npx nx affected -t build

# Run tests
npx nx test <project-name>

# View dependency graph
npx nx graph
```

**Proxy config:** `apps/nuxeo-ui/proxy.conf.json` forwards `/nuxeo/*` to `http://localhost:8080`

---

## ✅ Non-Negotiable Conventions

1. **`standalone: true`** on every component — no NgModules
2. **`inject()`** for DI — never constructor parameters
3. **`signal()`** for all mutable state — never BehaviorSubject for UI state
4. **`takeUntilDestroyed()`** on every `.subscribe()` call
5. **`templateUrl`** always — no inline templates
6. **Never `<img [src]="nuxeoUrl">`** — always fetch via service and use blob URL
7. **Never cross-feature imports** — shared logic goes in `libs/shared/`

---

## 📚 Documentation Structure

**Start here:** `CLAUDE.md` → `AGENTS.md`

**Then read the relevant AGENTS/ file:**

| File                        | When to read                                 |
| --------------------------- | -------------------------------------------- |
| `00-architecture.md`        | First time working on project                |
| `01-services.md`            | Adding/modifying Nuxeo API calls             |
| `02-nuxeo-apis.md`          | Understanding Nuxeo REST endpoints           |
| `03-angular-conventions.md` | Writing Angular code (signals, inject, etc.) |
| `04-feature-scaffold.md`    | Adding a new feature module                  |
| `05-test-standards.md`      | Writing tests                                |
| `06-git-workflow.md`        | Creating PRs, commit messages                |
| `07-security.md`            | Security review, auth, XSS prevention        |
| `08-bug-patterns.md`        | Common anti-patterns to avoid                |
| `09-pr-feedback.md`         | Resolving GitHub PR comments                 |
| `10-ai-features.md`         | Adding AI operations                         |

---

## 🔍 Key Findings from Audit

**✅ Accurate documentation:**

- All 11 AGENTS/ files exist and match the index
- All 9 feature modules exist and are correctly routed
- All 22 services exist in `libs/shared/nuxeo-client/src/lib/services/`
- Angular conventions are correctly documented

**✨ Updates made (2026-06-19):**

- ✅ Clarified AI architecture (uses Nuxeo Automation Operations, not separate backend)
- ✅ Verified current implementation: `AI_BACKEND_URL = '/nuxeo'` → calls `/nuxeo/api/v1/automation/AI.*`
- ✅ Documented alternative standalone Node.js backend option (separate repo)
- ✅ Added Knowledge Discovery feature to routing table
- ✅ Corrected service count (23 → 22)
- ✅ Enhanced CLAUDE.md with project summary
- ✅ Added comprehensive AI operation documentation (12 operations)

**📊 Documentation stats:**

- Total lines: ~2,054
- Files: 11 core + 2 index files
- Coverage: Architecture, services, APIs, conventions, testing, security, git workflow

---

## 🚀 Getting Started Checklist

- [ ] Read `CLAUDE.md`
- [ ] Read `AGENTS.md`
- [ ] Read `AGENTS/00-architecture.md`
- [ ] Read `AGENTS/03-angular-conventions.md`
- [ ] Skim the other AGENTS/ files to know what's available
- [ ] Run `npm install` and `npm run dev`
- [ ] Verify the app loads at `http://localhost:4200`
- [ ] Try running `npx nx affected -t lint` to verify setup

---

## 🎓 Best Practices for Claude Code

1. **Always read the relevant AGENTS/ file before starting a task**
2. **Run lint/build/test before creating a PR** (`npx nx affected -t lint`)
3. **Never skip documentation updates** (update AGENTS/ files when adding features)
4. **Use the proxy** (never hardcode `http://localhost:8080` in services)
5. **Gate AI features** (always check `aiFeatureFlag.aiEnabled()` in templates)
6. **Follow the 4-layer model** (respect feature boundaries, no cross-imports)
7. **Write external templates** (no inline templates, ever)
8. **Use signals** (no BehaviorSubject for UI state)

---

**Need help?** Start with `AGENTS.md` — it has the full index and quick reference tables.
