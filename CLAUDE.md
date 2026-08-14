# CLAUDE.md — Nuxeo Agentic UI Context

Read `AGENTS.md` and all files in the `AGENTS/` directory before starting any task.
They contain the complete codebase knowledge for this Angular 20 + Nx monorepo.

## Quick start

1. Read `AGENTS.md` — architecture summary, service map, where things live
2. Read the specific `AGENTS/` file for your task:
   - Adding a feature? → `AGENTS/04-feature-scaffold.md`
   - Calling a Nuxeo API? → `AGENTS/02-nuxeo-apis.md` + `AGENTS/01-services.md`
   - Writing tests? → `AGENTS/05-test-standards.md`
   - Git/PR work? → `AGENTS/06-git-workflow.md`
   - Security review? → `AGENTS/07-security.md` + `AGENTS/08-bug-patterns.md`

## Non-negotiable conventions

- `standalone: true` on every component — no NgModules
- `inject()` for DI — never constructor parameters
- `signal()` for all mutable state — never BehaviorSubject for UI state
- `takeUntilDestroyed()` on every `.subscribe()` call
- `templateUrl` always — no inline templates
- Never `<img [src]="nuxeoUrl">` — always fetch via service and use blob URL
- Never cross-feature imports — shared logic goes in `libs/shared/`

## Definition of done

Every task must pass: `npx nx affected -t lint` + `build` + `test`
