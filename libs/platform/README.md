# `@nuxeo-satori/platform`

The customer-facing package. Installable via npm (once published), ships the Layer 0/1/2
extensibility contract, the Nuxeo client, shared UI components, and bootstrap config.

## Entry points

| Import specifier                      | What it is                                                |
| ------------------------------------- | --------------------------------------------------------- |
| `@nuxeo-satori/platform`              | Package metadata and entry point list                     |
| `@nuxeo-satori/platform/extensions`   | Layer 1/2 — slots, rules, actions, component registration |
| `@nuxeo-satori/platform/app-config`   | Layer 0 — bootstrap config and runtime manifest           |
| `@nuxeo-satori/platform/nuxeo-client` | Nuxeo REST services and document models                   |
| `@nuxeo-satori/platform/ui`           | Shared components and dialogs                             |

Sub-entry points are deliberate: importing the extension contract does not drag the Nuxeo
client or Angular Material in with it.

## Structure

```
libs/platform/
  package.json          ← package metadata, peers, private: true
  ng-package.json       ← primary entry point
  src/
    index.ts            ← PLATFORM_ENTRY_POINTS export
  extensions/           ← secondary entry point
    ng-package.json
  app-config/
    ng-package.json
  nuxeo-client/
    ng-package.json
  ui/
    ng-package.json
```

**The sources are not here.** Each secondary entry point's `ng-package.json` points its
`entryFile` at the existing `libs/shared/*/src/index.ts` sources. ng-packagr accepts this
— proven by probe before use — so the 200+ files in `libs/shared/{extensions, app-config,
nuxeo-client, ui}` did not need to be moved.

## Building

```bash
npx nx build platform
# produces: dist/libs/platform/
#   - package.json with exports map
#   - fesm2022/*.mjs bundles (one per entry point)
#   - *.d.ts declarations
```

## Installation and use

Not published yet (`private: true` until `@nuxeo-satori` scope ownership is confirmed).
Installable from a **tarball** or **local path** today:

```bash
npm pack ./dist/libs/platform --pack-destination /tmp
npm install /tmp/nuxeo-satori-platform-0.1.0.tgz
```

Once installed:

```ts
import { PLATFORM_ENTRY_POINTS } from '@nuxeo-satori/platform';
import {
  provideSatoriExtensions,
  EXTENSION_SLOTS,
  type SatoriExtensionContributions,
} from '@nuxeo-satori/platform/extensions';
import { AppConfigService } from '@nuxeo-satori/platform/app-config';
import { docTypeIcon } from '@nuxeo-satori/platform/nuxeo-client';
import { ConfirmDialogComponent } from '@nuxeo-satori/platform/ui';

const contributions: SatoriExtensionContributions = {
  slots: { [EXTENSION_SLOTS.toolbar]: [{ id: 'acme.export', order: 10 }] },
  rules: { 'acme.rules.isPilot': () => true },
  components: { 'acme.sidebar.reports': () => import('./reports').then((m) => m.Reports) },
  actions: { 'acme.actions.export': { execute: (ctx) => console.log(ctx) } },
};

export const appConfig = {
  providers: [provideSatoriExtensions(contributions)],
};
```

## API surface gate

The published surface is pinned at [`docs/api/platform.api.md`](../../docs/api/platform.api.md).
A change to an export — added, removed, or reshaped — fails the gate, so it cannot happen
by accident:

```bash
npm run beta:api              # check (non-zero on drift)
npm run beta:api -- --update  # regenerate snapshot
```

Automated: `npm run beta:gate` includes it after `build`.

## Packaging decision

**One versioned package** with sub-entry points, not four independent packages. The
distribution model in [`docs/adf-hx-beta-plan.md`](../../docs/adf-hx-beta-plan.md) promises
"an npm version bump for the platform" — singular. Four packages make that four bumps and
a cross-compatibility matrix. This shape also matches `@alfresco/adf-hx-content-services`,
which this codebase already consumes.

## Publish readiness

- [x] Builds to `dist/`
- [x] All 5 entry points resolve through the exports map
- [x] Installable from tarball
- [x] Typechecks from installed `.d.ts` (verified via probe, not assumed)
- [x] API surface pinned and gated
- [ ] **Publish blocked:** `private: true` until `@nuxeo-satori` scope confirmed (risk R10)
