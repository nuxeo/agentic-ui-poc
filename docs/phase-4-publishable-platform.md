# Phase 4: Layer 2 — Publishable Platform

**Status:** STARTED (foundation laid)  
**Estimated:** 11-16 days with AI support  
**Started:** 2026-08-23

## Goal

Make libraries publishable as npm packages (`@nuxeo-satori/*`) that customers can install and extend.

## Key Deliverables

1. ✅ Libraries build with ng-packagr to `dist/`
2. ⬜ Public API surface declared and gated
3. ⬜ Registration API exposed (setComponents, setEvaluators, setActions)
4. ⬜ Thin forkable app template
5. ⬜ Customer extension library starter

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

Add to `scripts/review-guardrails.mjs`:

```javascript
function checkPublicApiSurface() {
  // Fail if adf-hx types leak into @nuxeo-satori/* public APIs
  // Fail if undocumented exports in public-api.ts
}
```

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

- [x] ng-package.json created for extensions
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
