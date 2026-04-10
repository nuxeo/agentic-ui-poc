# agentic-ui-poc

Nx + **Angular 19** monorepo for the **Agentic AI–Built Nuxeo Angular UI** PoC. PoC charter: [README.charter.md](README.charter.md). Boundaries and aliases: [docs/architecture.md](docs/architecture.md).

The `nuxeo-ui` app uses a root [`angular.json`](angular.json) for `ng build` / `ng serve` / `ng test` (Karma); Nx targets in [`apps/nuxeo-ui/project.json`](apps/nuxeo-ui/project.json) delegate to the Angular CLI (`nx:run-commands`) to avoid an Nx 22 + Angular 19 application-builder schema bug (`visitor is not a function`). Libraries use **Vitest 3** and **Analog 1.14** (aligned with Angular 19).

## Structure

| Path                            | Nx project         | Role                                                         |
| ------------------------------- | ------------------ | ------------------------------------------------------------ |
| `apps/nuxeo-ui`                 | `nuxeo-ui`         | Application shell, top-level routes                          |
| `apps/ai-backend`               | `ai-backend`       | Express AI backend (OpenAI proxy + Nuxeo server-side client) |
| `libs/core`                     | `core`             | Nuxeo API, auth, interceptors (to be implemented)            |
| `libs/shared/ui`                | `ui`               | Shared presentational / Satori-oriented UI                   |
| `libs/shared/util`              | `shared-util`      | Pure TypeScript utilities                                    |
| `libs/features/browse`          | `browse`           | Browse feature (lazy route)                                  |
| `libs/features/search`          | `search`           | Search feature (lazy route)                                  |
| `libs/features/document-detail` | `document-detail`  | Document detail feature (lazy route)                         |
| `libs/shared/ai-client`         | `shared-ai-client` | Angular AI gateway service + chat state + models             |

## Commands

```bash
npm install
npm run dev                   # starts Angular + AI backend in parallel
npx nx serve nuxeo-ui         # http://localhost:4200 (Angular only)
npx nx serve ai-backend       # http://localhost:3000 (AI backend only)
npx nx build nuxeo-ui
npx nx graph                  # dependency graph
npx nx test <project>         # e.g. core, nuxeo-ui, browse
```

## Docs

- [docs/ai-features.md](docs/ai-features.md) — **AI features guide** (NL search, summarization, chat, tagging, anomaly detection, etc.)
- [docs/developer-guide.md](docs/developer-guide.md) — Coding conventions, project patterns, how-to guides
- [docs/api-integrations.md](docs/api-integrations.md) — **Nuxeo API integration registry** (update when adding new APIs)
- [docs/architecture.md](docs/architecture.md) — Layer boundaries, routing, import aliases
- [docs/mvp-v1.md](docs/mvp-v1.md) — MVP checklist (fill in)
- [docs/obstacles-log.md](docs/obstacles-log.md) — PoC friction / human intervention log
