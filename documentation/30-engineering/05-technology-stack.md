---
title: Technology Stack
parent: Engineering
order: 5
last_reviewed: 2026-08-24
repo_commit: 77265f9
audience: engineering
---

# Technology Stack

> **Last reviewed:** 2026-08-24 · **Repository:** `77265f9`
> Source: `package.json`, `pom.xml`, `nx.json`, `angular.json`. Where a choice has a recorded
> rationale, it is cited; where the rationale is not recorded, that is said.

---

## The matrix

| Technology                               | Version                             | Purpose                                                | Where used                                       | Why chosen                                                                                                                                                                                               |
| ---------------------------------------- | ----------------------------------- | ------------------------------------------------------ | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Angular**                              | ~20.3                               | Application framework                                  | Everywhere                                       | RFC positions the ageing Polymer Web UI as the problem; Angular is `adf-hx`'s framework, so sharing components requires it                                                                               |
| **TypeScript**                           | via Angular                         | Language                                               | Everywhere                                       | Type safety is load-bearing — the `api-surface` gate exists to police public _types_                                                                                                                     |
| **Nx**                                   | 22.6.3                              | Monorepo, task graph, affected calculation, generators | Workspace                                        | 26 projects with enforced boundaries and `affected` builds; generators are also the customer-facing Layer 3 mechanism                                                                                    |
| **RxJS**                                 | ~7.8                                | Async HTTP                                             | Services                                         | Angular's `HttpClient` is Observable-based                                                                                                                                                               |
| **Angular signals**                      | 20.x                                | UI state                                               | Components                                       | Convention: `signal()` for mutable UI state, **never** `BehaviorSubject`. No global store                                                                                                                |
| **`@alfresco/adf-hx-content-services`**  | **7.20.0-automate.292** (exact pin) | Real content components + 12 overridable API ports     | `adf-hx-bridge`, browse, search                  | **The strategic dependency.** Shares component investment with Alfresco. All 12 ports are overridable injection tokens — verified in the published artifact, and the mechanism the whole plan depends on |
| **`@alfresco/adf-core`**                 | 9.0.0                               | adf-hx's runtime dependency                            | Transitively                                     | Not chosen — arrives with adf-hx. **Eager**, costing +1.15 MB initial bundle                                                                                                                             |
| **`@alfresco/adf-extensions`**           | 9.0.0                               | Domain-neutral extension helpers                       | `libs/shared/extensions`                         | Only its neutral parts (`mergeObjects`, `mergeArrays`, `filterEnabled`, `sortByOrder`, `getValue`). Its `RuleContext` is **deliberately not used** — it is typed on Alfresco Content Services objects    |
| **`@hylandsoftware/satori-ui`**          | ^0.2.0                              | Hyland design system                                   | `nuxeo-ui` only                                  | First-party design system. **Deliberately absent from the customer template** so a fork brings its own                                                                                                   |
| **`@hylandsoftware/hxcs-js-client`**     | 2.0.111                             | HxCS contracts                                         | `adf-hx-bridge`                                  | The contracts the bridge implements. Largely `import type`                                                                                                                                               |
| **Angular Material**                     | ~20.2                               | UI components                                          | `nuxeo-ui`, feature libs                         | adf-hx imports 48 Material sites itself, so it is unavoidable. Not in the template                                                                                                                       |
| **`@ngx-translate/core`**                | ^17                                 | i18n                                                   | App + libs                                       | adf-core and adf-hx use it, so catalogues must layer onto the same loader                                                                                                                                |
| **Vitest**                               | via `@nx/vitest`                    | Unit tests                                             | 19 projects                                      | Fast. **Caveat: strips types through esbuild, so a green `test` is not type safety**                                                                                                                     |
| **Playwright**                           | untracked, `--no-save`              | E2E + evidence capture                                 | `nuxeo-ui-e2e`, `scripts/beta-harness`           | **Deliberately not a tracked dependency** so CI installs are not burdened with a browser download                                                                                                        |
| **`@axe-core/playwright`**               | untracked                           | WCAG scanning                                          | `phase-6-a11y`                                   | Same reason. Absence is a **failed check**, never a silent skip                                                                                                                                          |
| **ESLint + `@nx/eslint-plugin`**         | 9.x                                 | Lint + **module boundaries**                           | Workspace                                        | `enforce-module-boundaries` with real `depConstraints` is what makes the layer model enforceable                                                                                                         |
| **Prettier**                             | 3.x                                 | Formatting                                             | Workspace                                        | `docs/api/platform.api.md` is in `.prettierignore` — Prettier reformats fenced blocks and silently corrupted the snapshot                                                                                |
| **Husky + lint-staged**                  |                                     | Pre-commit                                             | Workspace                                        | ESLint `--fix` on `.ts`, Prettier on the rest                                                                                                                                                            |
| **ng-packagr** via `@nx/angular:package` |                                     | Builds the publishable package                         | `libs/platform`                                  | **`ng-packagr-lite` was tried and rejected** — it skips FESM bundling and produced 4 unresolvable subpaths                                                                                               |
| **Quill**                                | ^2.0.3                              | Rich-text notes                                        | `note-editor`                                    | Note authoring. Current `npm audit`: **1 low (XSS)**                                                                                                                                                     |
| **DOMPurify**                            | ^3.3.3                              | HTML sanitisation                                      | Notes, comments                                  | XSS defence where user HTML is rendered                                                                                                                                                                  |
| **`pdfjs-dist`**                         | 6.2.108                             | PDF rendering                                          | Preview                                          | Arrives with the adf-core peer set (RFC R5)                                                                                                                                                              |
| **`cropperjs`**                          | 1.6.2                               | Image cropping                                         | Assets                                           |                                                                                                                                                                                                          |
| **`date-fns`** + Material adapter        | 2.30                                | Dates                                                  | Forms                                            | adf-hx imports `date-fns`                                                                                                                                                                                |
| **`angular-oauth2-oidc`**                | 19.0.0                              | OAuth/OIDC                                             | Auth                                             | SSO support                                                                                                                                                                                              |
| **`@mat-datetimepicker/core`**           | 16.0.1                              | Date-time picker                                       | Forms                                            | Arrives with the adf-core peer set (RFC R5)                                                                                                                                                              |
| **`minimatch`**                          | 10.2.6                              | Glob matching                                          |                                                  |                                                                                                                                                                                                          |
| **`dotenv`**                             | ^17.4.1                             | Env loading                                            | Scripts                                          |                                                                                                                                                                                                          |
| **`cors`**                               | ^2.8.6                              |                                                        | —                                                | See "unused" below                                                                                                                                                                                       |
| **`tslib`, `zone.js`**                   |                                     | Angular runtime                                        | Everywhere                                       | Required                                                                                                                                                                                                 |
| **Java + Maven**                         | 17+, 3.9+                           | Marketplace package + OSGi bundle                      | `nuxeo-agentic-core`, `nuxeo-agentic-ui-package` | The deliverable is a Nuxeo marketplace package                                                                                                                                                           |
| **Docker Compose**                       |                                     | ARender, Mailpit                                       | Local dev                                        | Document viewer and local SMTP                                                                                                                                                                           |
| **Nuxeo Server + OpenSearch**            | local, `:8080`                      | The backend                                            | —                                                | The product this is a UI for                                                                                                                                                                             |
| **ARender**                              | `${ARENDER_VERSION}`                | Rich document viewing                                  | Preview                                          | Licensed Arondor component                                                                                                                                                                               |
| **Mailpit**                              | v1.22.3                             | Local SMTP capture                                     | Permission notifications                         | Test email without a real relay                                                                                                                                                                          |
| **GitHub Actions**                       |                                     | CI + 7 automation workflows                            | `.github/workflows`                              |                                                                                                                                                                                                          |
| **Node.js**                              | **20.x, pinned**                    | Runtime                                                | Everything                                       | **Not optional** — Node 22+ shadows jsdom's `localStorage` and breaks specs on correct code                                                                                                              |

---

## Two unused production dependencies

`openai@^6.33.0` and `express@^5.2.1` are declared in `dependencies` and **imported nowhere** in
`apps`, `libs`, `scripts` or `tools`:

```bash
grep -rln "from 'openai'\|require('openai')" apps libs scripts tools    # → nothing
grep -rln "from 'express'\|require('express')" apps libs scripts tools  # → nothing
```

`cors` appears to be in the same category. They add weight to a **gated** lockfile and surface to
`npm audit` for no benefit. Removing them is trivial and should happen.

**Why this matters beyond tidiness:** `openai` in `dependencies` is the single most likely cause
of someone concluding this product makes direct LLM calls. It does not — see
[Runtime AI Features](10-runtime-ai-features.md).

---

## The adf-hx dependency, in detail

The strategic dependency, and the riskiest. Established first-hand (RFC §14):

| Fact                                   | Value                                                        |
| -------------------------------------- | ------------------------------------------------------------ |
| Published versions                     | 648                                                          |
| `latest` dist-tag                      | `7.20.0-automate.292` — **itself a prerelease**, 19 Jan 2026 |
| `beta` dist-tag                        | `7.21.0-automate.86`, 19 Jun 2026                            |
| Last true stable                       | `7.19.5`, 21 Aug 2025 — **Angular 15 baseline**              |
| Declared peers                         | **1** (`@angular/core >= 19.2.9`)                            |
| Packages actually imported             | **13**                                                       |
| Test artifacts in the published bundle | **Yes** — `ng-mocks`, and `api/index.d.ts` exports a mock    |

Consequences carried in this repository:

- **Pin exact versions, never a dist-tag.** A hard stop in the phase skill.
- **We maintain the true peer set ourselves**, because upstream does not declare it. A missing pin
  surfaces as a _build_ error, not a dependency error.
- **`tools/stubs/ng-mocks`** replaces the real `ng-mocks` because adf-hx imports a test library
  from its shipped runtime bundle — which put its implementation and **two `eval()` calls** into a
  customer-facing chunk. Guarded by `npm run beta:bundle`, now reporting 0 `eval()`.
- **`@alfresco/js-api` is a devDependency**, not a runtime one: it is a mandatory peer but a
  **types-only** import — the runtime `.mjs` never references it. That keeps a 7 MB Alfresco REST
  client out of a Nuxeo product.

---

## Registry configuration

[`.npmrc`](https://github.com/nuxeo/agentic-ui-poc/blob/feature/adf-hx-browse-poc/.npmrc) maps
**both** `@alfresco` and `@hylandsoftware` to GitHub Packages. All four Alfresco packages we need
download from there — verified twice by fetching the tarballs with only that mapping present.

Two rules:

- **Do not repoint `@alfresco` at public npm.** `adf-hx-content-services` is
  GitHub-Packages-exclusive. `adf-extensions`, `adf-core` and `js-api` _are_ also on public npm,
  which makes a two-registry split look necessary. It is not.
- **`.npmrc` does not decide where CI fetches from — `package-lock.json` does.** `npm ci` installs
  from each entry's `resolved` URL and ignores the registry mapping. Change a scope's registry and
  you must regenerate the lock, or any claim about token scope is untested.

`SATORI_GH_READONLY_TOKEN` needs `read:packages` on the **Alfresco** org as well as Hyland,
because `@alfresco/adf-extensions` is a production dependency.

---

## Deliberate absences

| Not used                              | Why                                                                                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| NgRx / Redux                          | Signals + `providedIn: 'root'` services. No global store, by convention                                                                  |
| NgModules                             | `standalone: true` everywhere                                                                                                            |
| A CSS framework                       | Design system + theme tokens                                                                                                             |
| A general Markdown→Confluence library | The publisher is a small explicit converter — adding a package to a **gated** lockfile to handle syntax we do not use is the wrong trade |
| An agent framework / MCP server       | There is no agent runtime here. See [Skills, Agents & Generators](09-skills-agents-generators.md)                                        |
| Client-side caching                   | None. Every action hits Nuxeo — a known gap                                                                                              |
| APM / structured logging / metrics    | **None.** The largest operational gap                                                                                                    |
