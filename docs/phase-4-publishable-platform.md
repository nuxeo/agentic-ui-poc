# Phase 4: Layer 2 — Publishable Platform

**Status:** IN PROGRESS — the registration API is delivered; the **build is not**  
**Estimated:** 11-16 days with AI support  
**Started:** 2026-08-23 · **Last updated:** 2026-08-23

## Goal

Make libraries publishable as npm packages (`@nuxeo-satori/*`) that customers can install and extend.

## Key Deliverables

| #   | Deliverable                                                             | Status                                                                      |
| --- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | Libraries build to `dist/` as installable packages                      | **not started** — see the blocker below                                     |
| 2   | Public API surface declared and pinned against accidental change        | **not started**                                                             |
| 3   | Registration API — our `setComponents` / `setEvaluators` / `setActions` | **done** — `provideSatoriExtensions()`, 8 specs, and the app itself uses it |
| 4   | Thin forkable app template                                              | **not started**                                                             |
| 5   | Customer extension library starter                                      | **not started**                                                             |

### Correcting the first version of this file

Its checklist marked deliverable 1 **done** on the strength of an `ng-package.json`
existing. That was wrong twice over: a config file is not a build, and
**`ng-packagr` is not installed at all** — the file even referenced a
`node_modules/ng-packagr/ng-package.schema.json` that is not on disk. Nothing
built, and nothing could have. Recorded here rather than quietly fixed, because
"documented as done, never ran" is the exact failure this programme keeps paying
for.

### The blocker on deliverable 1

`@nx/angular:ng-packagr-lite` is the right executor and is present, but it
resolves `ng-packagr` at runtime and that package is **absent** from
`package.json` and from `node_modules`. `@nx/js:tsc` — the executor
`shared-util` uses — is not a substitute: this library ships a component with a
`templateUrl`, so it needs the Angular compiler, and `tsc` alone produces no
package metadata, no FESM bundle and no entry points.

Adding it is a `package-lock.json` change, which is the single most expensive
operation in this repo: a bare `npm install` on macOS prunes optional platform
entries Linux needs and `npm ci` then refuses the whole tree — that broke CI for
the length of Phase 2. So it is a deliberate, isolated change with the
`lockfile` gate run before and after, not a side effect of a feature commit.

## Delivered: the registration API

`provideSatoriExtensions()` in `@agentic-ui/shared/extensions` — one declarative
object reaching all four registries, applied in an **environment initializer** so
every id is registered before the first slot resolves.

```ts
provideSatoriExtensions({
  slots: { toolbar: [{ id: 'acme.toolbar.export', order: 10 }] },
  rules: { 'acme.rules.isPilot': () => true },
  failClosedRules: ['acme.rules.isPilot'],
  components: { 'acme.sidebar.reports': () => import('./reports').then((m) => m.Reports) },
  actions: { 'acme.actions.export': { execute: (ctx) => void ctx } },
});
```

Four properties worth knowing, each pinned by a spec:

- **The factory form gets an injection context.** `provideSatoriExtensions(() => ({...}))`
  may `inject()`, which is not optional in practice — two of the application's
  own rules close over `AuthService` and all six bulk handlers close over an
  `Injector`.
- **Later wins per id** for rules, components and actions, which is how a
  customer layer overrides a packaged one without forking it.
- **Slot descriptors accumulate**, so a customer adding a toolbar button cannot
  silently delete the packaged ones. Hiding and reordering stay a manifest edit.
- **Returns `EnvironmentProviders`**, so it cannot be listed in a component's
  `providers`, where it would run too late to mean anything.

**The application uses it.** `apps/nuxeo-ui/src/app/extensions/provide-app-extensions.ts`
was rewritten to contribute through this function instead of injecting the four
registries by hand, so the documented customer path is the one the product
exercises on every boot. Its live rule-context wiring stays a separate
`APP_INITIALIZER`, because pushing shell state into a signal is not registration.

**Watched fail on purpose.** With all five registration paths sabotaged, 6 of the
8 specs went red. One of the two that stayed green was a genuine false green —
it asserted a rule evaluated `true`, and an _unregistered_ rule also evaluates
`true` because unknown rules fail open, so it passed whether or not the factory
had ever run. It now asserts `false`, which only a registered evaluator can
return, and it goes red under the same sabotage.

## Libraries to Publish

### Priority 1: Customer-Facing

**@nuxeo-satori/extensions** (`libs/shared/extensions`)

- Extension registry, slots, rule evaluation
- **Status:** ng-package.json created, build target needed
- **Public API:** `ExtensionSlotRegistry`, `ExtensionRuleRegistry`, `filterEnabled`, `sortByOrder`
- **Registration:** `registerComponent()`, `registerEvaluator()`, `registerAction()`

**@nuxeo-satori/app-config** (`libs/shared/app-config`)

- Bootstrap config, runtime manifest loading
- **Status:** Not started
- **Public API:** `AppConfigService`, config models, manifest schema

**@nuxeo-satori/ui** (`libs/shared/ui`)

- Shared UI components (dialogs, utilities)
- **Status:** Not started
- **Public API:** Standalone components, dialog services

### Priority 2: Supporting

**@nuxeo-satori/nuxeo-client** (`libs/shared/nuxeo-client`)

- Nuxeo API services
- **Decision needed:** Expose as extension point or keep internal?

**@nuxeo-satori/adf-hx-bridge** (`libs/shared/adf-hx-bridge`)

- adf-hx integration layer
- **Public API:** Providers only (`ADF_HX_NUXEO_BRIDGE_PROVIDERS`)
- **Internal:** All implementation details

## Next Steps

### 1. Complete extensions Library Build

```bash
# Add to libs/shared/extensions/project.json
{
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/libs/shared/extensions"],
      "options": {
        "project": "libs/shared/extensions/ng-package.json"
      }
    }
  }
}
```

### 2. Define Public API Surface

Create `libs/shared/extensions/src/public-api.ts`:

```typescript
// Extension registry
export * from './lib/registry/extension-slot-registry';
export * from './lib/registry/extension-rule-registry';
export * from './lib/registry/extension-action-registry';

// Utilities (from adf-extensions)
export { filterEnabled, sortByOrder } from './lib/utils/extension.utils';

// Types
export type { ExtensionSlot, ExtensionRule, ExtensionAction } from './lib/models';

// Registration API (NEW)
export { registerComponent, registerEvaluator, registerAction } from './lib/api/registration';
```

### 3. Create Registration API

**File:** `libs/shared/extensions/src/lib/api/registration.ts`

```typescript
import { Type } from '@angular/core';
import { ExtensionSlotRegistry } from '../registry/extension-slot-registry';
import { ExtensionRuleRegistry } from '../registry/extension-rule-registry';

export interface ComponentRegistration {
  id: string;
  loader: () => Promise<Type<unknown>>;
}

export interface EvaluatorRegistration {
  id: string;
  evaluator: (context: unknown) => boolean;
}

export interface ActionRegistration {
  id: string;
  handler: {
    execute: (context: unknown) => void | Promise<void>;
  };
}

export function registerComponent(registration: ComponentRegistration): void {
  // Implementation: add to ExtensionSlotRegistry
}

export function registerEvaluator(registration: EvaluatorRegistration): void {
  // Implementation: add to ExtensionRuleRegistry
}

export function registerAction(registration: ActionRegistration): void {
  // Implementation: add to action registry
}
```

### 4. Add API Extractor

```bash
npm install --save-dev @microsoft/api-extractor
```

Create `libs/shared/extensions/api-extractor.json`:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json",
  "mainEntryPointFilePath": "<projectFolder>/dist/index.d.ts",
  "apiReport": {
    "enabled": true,
    "reportFolder": "<projectFolder>/../../api-reports"
  },
  "docModel": {
    "enabled": false
  },
  "dtsRollup": {
    "enabled": true
  }
}
```

### 5. Create App Template

**File:** `apps/nuxeo-satori-template/`

- Minimal shell (routes, config, theme)
- Layer 0 config examples
- Layer 1 manifest examples
- README: how to fork and customize

### 6. Create Extension Starter

**File:** `tools/generators/extension-library/`

- Nx generator: `nx g @nuxeo-satori/generators:extension-library my-extensions`
- Generates: library scaffold, example component, example rule, example action
- README: how to build and integrate

## API Surface Rules

### MUST

- All types in public API must be documented (TSDoc)
- Breaking changes require major version bump
- adf-hx types NEVER in public signatures

### GATE

`checkNoAdfHxInPublicApi()` in `scripts/review-guardrails.mjs` **already enforces
the adf-hx half**, delivered in Phase 3 — the first version of this file listed it
as outstanding work, which was wrong. What is still missing is different: a
**pinned surface**, so that an accidental export addition or signature change
fails rather than shipping. That is deliverable 2.

## Package Naming

**Scope:** `@nuxeo-satori`  
**Rationale:** Plan proposes this scope (R10 notes ownership unconfirmed)

**Libraries:**

- `@nuxeo-satori/extensions`
- `@nuxeo-satori/app-config`
- `@nuxeo-satori/ui`
- `@nuxeo-satori/nuxeo-client` (if exposed)

**Template:**

- `@nuxeo-satori/app-template`

**Generators:**

- `@nuxeo-satori/generators`

## Customer Extension Example

**Goal:** Reference customer extension exercising Layers 0-2 (Phase 6 requirement).

**Creates:**

1. Custom nav item (Layer 1)
2. Rule-gated action (Layer 1)
3. Custom component (Layer 2)
4. Rebrand (Layer 0)

**Zero edits to our libraries** - proves the contract works.

## Success Criteria

- [x] Registration API delivered, spec'd, and used by the application
- [ ] `ng-packagr` added to `package.json` (deliberate, isolated lockfile change)
- [ ] `nx build shared-extensions` produces dist/
- [ ] package.json has `publishConfig`
- [ ] API extractor generates .api.md baseline
- [ ] Gate fails on adf-hx type leak
- [ ] Customer can: `npm install @nuxeo-satori/extensions`
- [ ] Customer can: call `registerComponent()` from their code
- [ ] Template app forks and builds
- [ ] Extension starter generates working library
- [ ] Reference extension builds and integrates with zero library edits

## References

- Plan: `docs/adf-hx-beta-plan.md` Phase 4 section
- ACA equivalent: `@alfresco/adf-extensions` with `setComponents()`, `setEvaluators()`
- Current registry: `libs/shared/extensions/src/lib/registry/`
