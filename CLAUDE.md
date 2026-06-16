# CLAUDE.md — Nuxeo Agentic UI Context

Read `AGENTS.md` and all files in the `AGENTS/` directory before starting any task.
They contain the complete codebase knowledge for this Angular 19 + Nx monorepo.

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

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
