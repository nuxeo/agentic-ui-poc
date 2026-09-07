---
title: Extensibility Contract
parent: Engineering
order: 7
last_reviewed: 2026-08-24
repo_commit: 77265f9
audience: engineering
---

# The Extensibility Contract — four layers

> **Last reviewed:** 2026-08-24 · **Repository:** `77265f9`
> Customer-facing companion: [`docs/extension-reference.md`](../../docs/extension-reference.md),
> which is drift-gated by `npm run beta:reference`.

**The contract is the product.** Everything else in this repository exists to make a
customer able to change the application without editing our source — and to make that
promise checkable rather than aspirational.

---

## 1. The four layers

| Layer                      | What the customer writes                                                    | Build needed           | Survives upgrade                           |
| -------------------------- | --------------------------------------------------------------------------- | ---------------------- | ------------------------------------------ |
| **0 — Configuration**      | JSON + CSS custom properties: theme tokens, branding, languages             | No                     | Yes — `overwrite="false"` in `install.xml` |
| **1 — Declarative wiring** | JSON referencing components, rules, actions and routes **by registered ID** | No                     | Yes — it is a Nuxeo document               |
| **2 — Customer code**      | A TypeScript library against `@nuxeo-satori/platform`                       | Yes, in **their** repo | Yes — npm semver                           |
| **3 — Agent harness**      | Prompts. The generators and guardrails ship inside the package              | Yes, in their repo     | Yes                                        |

Layers 0 and 1 are expected to absorb most customer requests and need no build.

> **This expectation is a design assumption, not a measured fact.** It has not been tested
> against real customer requests. [`docs/adf-hx-beta-plan.md`](../../docs/adf-hx-beta-plan.md)
> flags it as needing validation against The Church and one other account. **Not verified in
> repository.**

Layer 2 exists because a manifest can only rewire what is already compiled in — ACA's own
`extensions.setComponents({...})` registration confirms the same constraint upstream.

---

## 2. Layer 0 — configuration without a rebuild

`bootstrap.json`, fetched before authentication because it carries the Nuxeo server URL.

Live example: [`apps/nuxeo-satori-template/public/agentic-ui-config/bootstrap.json`](../../apps/nuxeo-satori-template/public/agentic-ui-config/bootstrap.json).

| Key                                                 | Purpose                                                                                   |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `nuxeoApiOrigin`                                    | Where the Nuxeo REST API lives                                                            |
| `manifestDocumentPath` / `manifestDocumentProperty` | Where the Layer 1 manifest document is, and which property holds it (default `note:note`) |
| `branding`                                          | Product name, logo                                                                        |
| `themes` / `defaultThemeId`                         | Named token sets applied to `<html>`                                                      |
| `defaultLanguage` / `availableLanguages`            | i18n                                                                                      |

### Why it lives outside the bundle

The marketplace installer copies the web directory with `overwrite="true"`, so
configuration inside the bundle is **destroyed on upgrade**. The config is therefore
installed as a _sibling_ of that tree with `overwrite="false"` — seeded on first install,
preserved on every upgrade after. The full reasoning, including why `nxserver/web` is the
wrong destination (it is not a Tomcat docBase, so anything placed there is never served),
is in [`install.xml`](../../nuxeo-agentic-ui-package/src/main/resources/install.xml).

An earlier version shipped to `nxserver/web/…` and **would have 404'd on every install**.
It was recorded complete before that was caught.

### Theme tokens

`TemplateThemeService` writes `themes[].tokens` onto `<html>` as CSS custom properties.
Colour literals in `.scss` must come from a themed namespace with a fallback —
`--mat-sys-*`, `--kd-*`, or `--shell-*` in the template — enforced by `checkThemeTokens`.

The template ships **no Angular Material on purpose**, so a fork does not have to remove
our design system before adding its own. That is why `--shell-*` is a recognised namespace
rather than a faked one: writing `var(--mat-sys-surface, #fff)` there would satisfy the
gate while the fallback did all the work.

---

## 3. Layer 1 — the manifest

A **Nuxeo document**, not a file in the bundle. Example payload:
[`apps/nuxeo-satori-template/manifest.example.json`](../../apps/nuxeo-satori-template/manifest.example.json).

Choosing a document rather than a file was deliberate: it inherits the repository's
versioning, audit trail, ACLs and per-tenant scoping for free, survives a marketplace
upgrade, and can be edited from the application itself.

```jsonc
{
  "version": 1,
  "labels": {}, // i18n overrides
  "featureToggles": { "acme.reports.betaExport": true },
  "extensions": {
    "overrides": {
      // change a descriptor without restating it
      "template.navbar.reports": { "visible": false },
      "template.navbar.home": { "label": "Dashboard", "order": 5 },
    },
    "slots": {
      // ADD entries; merges with code, does not replace
      "navbar": [
        { "id": "acme.navbar.contracts", "label": "Contracts", "path": "/reports", "order": 35 },
      ],
      "sidebar": [{ "id": "acme.sidebar.reports", "component": "template.sidebar.reports" }],
      "toolbar": [
        {
          "id": "acme.toolbar.exportSummary",
          "action": "template.actions.exportSummary",
          "rule": "template.rules.isSignedIn",
        },
      ],
    },
  },
}
```

**The manifest never names a class.** It names IDs. That indirection is what lets us rename
a component without breaking a customer.

### The manifest is JSON, and nothing type-checks JSON

This is the contract's sharpest edge. Rename a slot in the platform and every manifest
referencing it goes **quietly inert** — the app boots, compiles, and the customer's entry is
simply gone. No compiler sees it.

That is why [`scripts/beta-harness/upgrade-rehearsal.mjs`](../../scripts/beta-harness/upgrade-rehearsal.mjs)
exists and why its slot-existence assertion is the one that earns it its place. Run
`node scripts/beta-harness/upgrade-rehearsal.mjs --break-slot toolbar`: `toolbar` is named
only in the manifest and referenced by no TypeScript, so **the compile stays green** and
only that check goes red.

---

## 4. The eight slots, and what actually reads them

Declared in [`libs/shared/extensions/src/lib/extension-slots.ts`](../../libs/shared/extensions/src/lib/extension-slots.ts).

| Slot           | State                                                            | Evidence                                                                    |
| -------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `navbar`       | **Live** — packaged descriptors + a host that renders them       | 17 documented IDs                                                           |
| `bulk-actions` | **Live** — packaged descriptors + host                           |                                                                             |
| `documentList` | **Live** — 12 packaged columns, resolved by _both_ browse routes | `provide-app-extensions.ts:93`, `browse.ts:373`, `browse-adf-hx-poc.ts:133` |
| `sidebar`      | Resolved, **no packaged descriptor**                             | 3 documented IDs                                                            |
| `routes`       | **Reserved — nothing reads it**                                  |                                                                             |
| `toolbar`      | **Reserved — nothing reads it**                                  |                                                                             |
| `contextMenu`  | **Reserved — nothing reads it**                                  |                                                                             |
| `tabs`         | **Reserved — nothing reads it**                                  |                                                                             |

**Do not describe a reserved ID as an extension point.** Four of eight are reserved. The
manifest example above places entries in `toolbar` and `sidebar`, which is legitimate as
_forward-compatible configuration_ but renders nothing today.

`rules` was **removed** from `EXTENSION_SLOTS`: rules are not descriptors and live in
`ExtensionRuleRegistry`, so `slots.rules` was silently inert.

### Slots are additive by construction

`ExtensionSlotRegistry` keys slots by opaque string with **no enum, union or `switch` on
slot identity**, so a ninth slot requires no change to the eight. Do not introduce a central
slot dispatch — it would undo the property the addressable-surface decision rests on.

---

## 5. The four registries

[`libs/shared/extensions`](../../libs/shared/extensions), 3,101 lines, 9 spec files, 96.04%
line coverage.

| Registry                     | Holds                       | Keyed by               |
| ---------------------------- | --------------------------- | ---------------------- |
| `ExtensionSlotRegistry`      | Descriptors placed in slots | slot id → descriptor[] |
| `ExtensionRuleRegistry`      | Named predicates            | rule id → evaluator    |
| `ExtensionComponentRegistry` | Lazily-resolved components  | component id → loader  |
| `ExtensionActionRegistry`    | Action handlers             | action id → handler    |

### Rules

An evaluator receives `(context, parameters, resolve)`. The context has three
independently populated halves — see [Architecture §8](02-architecture.md#8-state-management)
for why `selection` is deliberately still empty while `selectionCount` is live.

Composites are ordinary registered evaluators, not special cases: `core.every`, `core.some`,
`core.not`, `core.true`, `core.false`. Named after ACA so a manifest written against ACA's
docs works unchanged.

> **`core.not` is NOR, not NAND.** Upstream is `args.every(arg => !evaluator(...))` — every
> nested rule must be false. Phase 2 shipped `!every(evaluator)`, which agrees for one
> argument and diverges from two upwards while the file claimed ACA parity. Corrected, with
> a multi-argument test.

Fail-open, recursion bounds and the security-relevant list: see
[Architecture §9](02-architecture.md#9-error-handling-retry-and-validation).

### Our rule context is deliberately not upstream's

`RuleContext` from `@alfresco/adf-extensions` is typed on Alfresco Content Services domain
objects — `NodeEntry`, `SiteEntry`, `RepositoryInfo` — describing a repository we do not
talk to. Reusing it would put ACS types in the signature every customer rule is written
against. The _shape_ is upstream's; the types are ours. Upstream's domain-neutral helpers
(`mergeObjects`, `mergeArrays`, `filterEnabled`, `sortByOrder`, `getValue`) are used
directly.

---

## 6. Layer 2 — `@nuxeo-satori/platform`

One publishable library, four secondary entry points, 347 kB tarball of 25 files.

| Entry point                           | Wraps                                                                 |
| ------------------------------------- | --------------------------------------------------------------------- |
| `@nuxeo-satori/platform`              | Root — `PLATFORM_ENTRY_POINTS`, shared types                          |
| `@nuxeo-satori/platform/extensions`   | The registries, `provideSatoriExtensions`, `ExtensionOutletComponent` |
| `@nuxeo-satori/platform/app-config`   | Layer 0 loader and tokens                                             |
| `@nuxeo-satori/platform/nuxeo-client` | Services and models                                                   |
| `@nuxeo-satori/platform/ui`           | Shared presentational components                                      |

### One declarative object reaches four registries

[`provideSatoriExtensions()`](../../libs/shared/extensions/src/lib/provide-satori-extensions.ts)
takes a contributor and registers slots, rules, components and actions in a
`provideEnvironmentInitializer`. It uses `runInInjectionContext` rather than a bare call, so
a rule contributed by a **customer library** may `inject()` its own dependencies — a factory
declared in a customer library has no injection context of its own.

```ts
// The whole integration, in a customer's app config:
providers: [/* … */ provideAcmeExtensions()];
```

### Four guards on the package

Each added because something got past the ones before it:

| Gate               | Asserts                                                          | What it caught                                                                                                                                                                   |
| ------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `beta:api`         | The `.d.ts` surface matches a 2,221-line snapshot                | Its first version reported PASS across **27 changed types** (rolled-up `.d.ts` has no `export` prefix); its second recorded `const EXTENSION_SLOTS:` and nothing after the colon |
| `beta:publishable` | A real `npm publish --dry-run`, plus generators and declarations | **The package could not be published at all** for the whole of Phase 4 — compiled in full mode, so ng-packagr wrote a `prepublishOnly` that hard-fails publish                   |
| `beta:fork`        | The template compiles against the **built** declarations         | The platform compiled without `strictNullChecks`, shipping 27 wrongly non-nullable public types                                                                                  |
| `beta:upgrade`     | A Layer 0/1/2 customisation survives a version bump              | The only check that crosses a version boundary                                                                                                                                   |

### `tsconfig.lib.json` is the entire compiler configuration

`@nx/angular:package` given a `tsConfig` option calls
`parseRemappedTsConfigAndMergeDefaults`, which — despite the name — merges eight hardcoded
options and otherwise **replaces** ng-packagr's bundled `conf/tsconfig.ngc.json`. That
bundled file is the only place `compilationMode: partial` is set, and it is where
`strictTemplates` lives. Angular's own default is `FULL`.

Two separate defects came from this, both **configuration absent rather than wrong**, so no
compiler reported either. If you touch
[`libs/platform/tsconfig.lib.json`](../../libs/platform/tsconfig.lib.json), run
`npm run beta:publishable`.

---

## 7. Layer 3 — the harness that ships to customers

Four Nx generators, shipped **inside** the package at its root as a proper plugin:

```bash
npx nx g @nuxeo-satori/platform:extension-library acme-extensions --owner=acme
npx nx g @nuxeo-satori/platform:extension-rule      is-legal-team --library=acme-extensions
npx nx g @nuxeo-satori/platform:extension-action    export-claim  --library=acme-extensions
npx nx g @nuxeo-satori/platform:extension-component claim-summary --library=acme-extensions
```

Plus the guardrail a customer runs in their own CI:

```bash
node node_modules/@nuxeo-satori/platform/guardrails/check-extension-library.mjs libs/<their-library>
```

> Until 2026-08-24 the customer guide told customers to run
> `npx nx g ./tools/satori-generators:…` — a path inside **our** repository — and the
> generators were not in the tarball at all. The first instruction in the shipped guide
> could not be run by its audience. Verified fixed by unpacking the tarball into
> `node_modules` and generating a library from it.

### The five guardrail checks, and what each one caught

| #   | Check                                               | Origin                                                                                                                                                                      |
| --- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Registered IDs carry the library's own owner prefix | An ID is a public contract                                                                                                                                                  |
| 2   | No import reaches past a published entry point      | Deep paths break without being breaking changes                                                                                                                             |
| 3   | A spec asserts **registry state**                   | Three generators once spliced every registration _inside a comment_, reported success, printed the IDs they had "registered" — and lint, typecheck and six specs all passed |
| 4   | Gating rules are declared fail-closed               | An unregistered rule ID permits                                                                                                                                             |
| 5   | No component exported from the barrel               | A host that can import the class depends on a name that should stay free to change                                                                                          |

Three of those five were once satisfiable **without doing the thing they check** — a comment
mentioning a registry counted as an assertion, a dynamic `import()` evaded check 2, and
`export * from './leaky'` evaded check 5. All three probed and closed.

### Assert `false`, not `true`

An **unregistered** rule ID also evaluates to `true`, so a test expecting `true` passes
whether or not registration happened. Only `false` is an answer a genuinely registered
evaluator can give.

---

## 8. Adding an extension point

Use [`.cursor/skills/add-extension-point/SKILL.md`](../../.cursor/skills/add-extension-point/SKILL.md).
The shape:

1. Add the ID to the appropriate registry contribution.
2. Resolve it at the host — a registered descriptor is **not** a placed descriptor.
3. Document it in [`docs/extension-reference.md`](../../docs/extension-reference.md).
4. Run `npm run beta:reference` — it fails if a documented ID is unregistered, if a
   registered ID is undocumented, or if a slot-state claim does not hold.

That gate matched raw source text until 2026-08-24, so a **commented-out** `resolve(...)`
proved a slot live exactly as well as real code. Comments are now stripped before matching.
