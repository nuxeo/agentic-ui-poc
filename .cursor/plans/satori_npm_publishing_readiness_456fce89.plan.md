---
name: Satori npm publishing readiness
overview: Make `@nuxeo-satori/platform` publishable to the Nuxeo Registry by renaming it to `@nuxeo/satori-platform`, completing its metadata and licensing, proving anonymous consumer installability, and adding a guarded GitHub Actions publish workflow — keeping the package in this monorepo while external consumers install it from npm.
todos:
  - id: rename-scope
    content: 'Rename @nuxeo-satori/platform to @nuxeo/satori-platform: package.json name, tsconfig.base.json aliases (lines 40-44), 281 import specifiers, and the hardcoded strings in check-extension-library.mjs, publishability.mjs, phase-5-harness.mjs, sanitizer-audit.selftest.mjs, build-platform-generators.mjs and the tools/satori-generators templates. Rename tools/satori-generators to @nuxeo/satori-generators (stays private). Regenerate docs/api/platform.api.md and run mirror:agents.'
    status: pending
  - id: verify-fesm-names
    content: Rebuild dist and confirm empirically what ng-packagr flattens the new name to; change publishability.mjs to derive the expected FESM bundle names and the scanner control from pkg.name so the check cannot pass while asserting the old identity. Watch it fail on purpose.
    status: pending
  - id: package-metadata
    content: 'Complete libs/platform/package.json: add license, repository (with directory), homepage, bugs, author, keywords; remove private:true; drop the over-declared @hylandsoftware/satori-ui peer. Review the wildcard export at libs/shared/ui/src/index.ts line 1 and enumerate it.'
    status: pending
  - id: license-and-notices
    content: Add a root LICENSE file and ship it as an ng-package asset; add third-party notices for the production dependency tree; enable deny-licenses in dependency-review.yml and add a production-dependency license check to the gate.
    status: pending
  - id: npmrc-registry
    content: Add @nuxeo:registry=https://packages.nuxeo.com/repository/npm-public/ to the committed .npmrc, with a comment explaining it changes no current resolution (zero @nuxeo deps) and therefore needs no lockfile regeneration.
    status: pending
  - id: nx-targets
    content: Add the missing test and typecheck targets to libs/platform/project.json, and resolve the duplicate inferred eslint:lint / explicit lint pair.
    status: pending
  - id: cleanroom-install
    content: 'Add a clean-room consumer check: npm pack the built library, install the tarball into a temp project with no .npmrc, resolve and typecheck an import of all five entry points, verify .d.ts and source maps, and assert the tarball contains no secrets or unintended files. Wire it into the gate and CI.'
    status: pending
  - id: publish-workflow
    content: 'Add .github/workflows/publish-platform.yml: path-filtered PR validation job with read-only permissions and no publish secrets, plus a workflow_dispatch publish job behind a GitHub Environment approval with dist-tag and dryRun inputs, an npm view pre-flight duplicate check, a --dry-run step before the real publish, and anonymous post-publish verification.'
    status: pending
  - id: changelog-versioning
    content: Add per-package changelog and release-notes support for libs/platform on independent 0.x semver, using platform-v<version> tags so they cannot collide with release.yml's root v<version> tags.
    status: pending
  - id: consumer-docs
    content: Write consumer-facing documentation (install, supported environments, public API, peer deps, configuration, local development, troubleshooting, deprecation) and update docs/publishing-to-nuxeo-registry.md and docs/publish-readiness.md with the verified registry facts, the corrected rename blast radius, and the satori-ui peer finding.
    status: pending
  - id: final-verification
    content: 'Run the full verification sweep: beta:gate (all 22 gates), nx build/lint/test/typecheck, beta:api, beta:publishable, beta:fork, beta:upgrade, the clean-room install, actionlint on the new workflow, and a workflow dryRun. Record evidence and the list of remaining owner-action blockers.'
    status: pending
isProject: false
---

A

# Publishing `@nuxeo/satori-platform` to the Nuxeo Registry

## Phases 1-3: findings (research complete, no code changes yet)

### The package

`libs/platform` builds `@nuxeo-satori/platform@0.1.0` via `@nx/angular:package` (ng-packagr) into `dist/libs/platform`. It is a facade: its own `src/index.ts` exports only `PLATFORM_ENTRY_POINTS` metadata, and its four secondary entry points in [libs/platform/ng-package.json](libs/platform/ng-package.json) point outside the directory at `libs/shared/{app-config,extensions,nuxeo-client,ui}`. It also ships four Nx generators and a guardrail script as assets.

The artifact itself is in good shape and is genuinely gated. `npm run beta:publishable` ([scripts/beta-harness/publishability.mjs](scripts/beta-harness/publishability.mjs)) runs seven checks including a real `npm publish --dry-run`, partial-compilation-mode byte inspection, an AST import-graph scan against declared dependencies, and a `skipLibCheck: false` typecheck of the shipped `.d.ts`. CI runs it unconditionally on every PR. What is missing is not artifact quality; it is identity, licensing, and a pipeline.

### Registry requirements, verified from the official guide

The Confluence page **was accessible**. Requirements taken directly from it:

- Registry is Sonatype Nexus at `https://packages.nuxeo.com/repository/npm-public/`.
- The `@nuxeo` scope is mapped in a **committed** `.npmrc`: `@nuxeo:registry=https://packages.nuxeo.com/repository/npm-public/`.
- Publish auth is `NODE_AUTH_TOKEN`, sourced from the GitHub secret `NPM_PACKAGES_TOKEN`; locally from `~/.npmrc`.
- Publish command: `npm publish --@nuxeo:registry=... --tag SNAPSHOT`. Do **not** add `publishConfig` — `nuxeo-elements` and Web UI both pass the registry on the command line.
- Nexus **rejects re-publishing an existing version** (409); recovery is a version bump or admin deletion of the component.
- Prerelease builds must use a non-`latest` dist-tag so default installs do not resolve them.
- Verify with `npm view @nuxeo/<pkg>@<version> --registry https://packages.nuxeo.com/repository/npm-public/`.
- A manual Nexus web-UI `.tgz` upload exists as a recovery path only; it bypasses all validation.

Verified first-hand against the live registry: `@nuxeo/nuxeo-ui-elements` resolves **anonymously** at `2025.19.0` with dist-tags `latest` / `SNAPSHOT` / `alpha`. `@nuxeo-satori/platform` returns 404 on both Nexus and npmjs.

Still needs confirmation from registry owners: whether this repo is granted `NPM_PACKAGES_TOKEN`, and whether that token's Nexus role allows writes under `@nuxeo/satori-platform` specifically.

### Issues found

Blocking:

1. **No LICENSE file anywhere in the repo**, and no `license` field in [libs/platform/package.json](libs/platform/package.json) or the built artifact. Distributing to customers without one is not viable.
2. **Scope is wrong.** `@nuxeo-satori` is not mapped to the Nuxeo registry and is not an org-owned scope.
3. `"private": true` blocks publish (deliberate today).
4. **`.npmrc` has no `@nuxeo:registry=` line.**
5. **No publish workflow exists.** `release.yml` bumps only the _root_ `package.json`, creates a GitHub Release, and dispatches the Maven marketplace build. It never touches `libs/platform`.

Important:

6. **`@hylandsoftware/satori-ui` is an over-declared peer** — zero imports in all five FESM bundles, and present in the shipped `.d.ts` only inside a doc comment. It is unavailable on npmjs and on Nexus, so leaving it declared would force every customer to hold a GitHub Packages token.
7. Missing metadata: `repository`, `homepage`, `bugs`, `author`, `keywords`.
8. **The `platform` project has no `test` and no `typecheck` target** — only `lint`, `build`, `sync-docs`, `sync-generators`.
9. `libs/shared/ui/src/index.ts` line 1 is `export * from './lib/ui/ui'` — the only wildcard in the public surface, so it is public without being enumerated.
10. No license or SBOM check anywhere; `deny-licenses` is commented out in [.github/workflows/dependency-review.yml](.github/workflows/dependency-review.yml).
11. `CHANGELOG.md` is an empty header, and nothing produces per-package release notes.
12. `declarationMap` + `sourceMap` + `inlineSources` are all on, so the tarball embeds readable TypeScript source for the ~200 files behind the entry points. Defensible for an extensibility platform, but it should be a recorded decision.
13. `dist/libs/platform` on disk is a mixed-timestamp stale build and must not be trusted; rebuild clean.

Note: `docs/publishing-to-nuxeo-registry.md` §5.1 says the rename is "190 import specifiers across ~148 files". Actual measured count is **461 occurrences across 273 tracked files**, of which **281 are real import specifiers**.

## Phase 4: repository strategy — keep it here

**Recommendation: keep the package in this monorepo. External consumers install it from npm; this repo consumes it through `tsconfig.base.json` path aliases to source.**

The deciding evidence is that this library is not a side artifact, it _is_ the application's core. Measured real import counts of its entry points: `libs/features/` 113, `apps/` 64, `libs/shared/` 70, `libs/extensions/` 5. A separate repository would mean `apps/nuxeo-ui` consumes its own service layer from a registry, turning every ordinary feature change into a cross-repo release.

- Development experience: monorepo wins decisively. One `nx serve`, no `npm link`, changes to `libs/shared/nuxeo-client` are visible immediately in 113 call sites.
- Release independence: separate repo wins nominally, but the gap closes because the package version is already decoupled from the app and the publish job will be path-filtered.
- CI/CD complexity: monorepo wins. `nx affected` already scopes work; a split needs two pipelines plus a token for the app to install the library.
- Version management: roughly equal. One package needs no lerna, no changesets.
- Dependency management: monorepo wins. One lockfile, one set of Angular peers; a split risks two Angular versions resolving in the same app.
- Ownership: separate repo wins slightly via `CODEOWNERS` on a whole repo, but `CODEOWNERS` on `libs/platform/**` gets most of it.
- Security: monorepo wins. One `npm audit` surface, one CodeQL setup, one supply-chain gate.
- Testing: monorepo wins. The fork-simulation and upgrade-rehearsal harnesses already compile a real app against `dist/`.
- Consumer experience: identical. Consumers see a tarball on Nexus either way.
- Long-term maintenance: monorepo wins while the API is moving; revisit at GA.
- Migration cost: monorepo is zero; a split is high (extract ~200 files from four `libs/shared` libraries that the app depends on).

Switch to a separate repository only if all three become true: the public API has stabilised enough that the app rarely changes it, a team outside this repo owns the platform, and customers need a release cadence this repo's `main` cannot serve. Risk of staying: unrelated commits touching `libs/shared/**` silently change the published surface — mitigated by the existing `beta:api` snapshot gate, plus path filters and `CODEOWNERS`.

## Phase 5: target design

- Name `@nuxeo/satori-platform`, scope `@nuxeo`, registry `https://packages.nuxeo.com/repository/npm-public/`.
- Versioning: **independent `0.x` semver**, hand-set in `libs/platform/package.json`, decoupled from the root/marketplace version.
- Dist-tags: `alpha` for the first publish, `next` for prereleases off `main`, `latest` only by deliberate `workflow_dispatch` promotion. Never publish an unpromoted build as `latest`.
- Tags: `platform-v<version>`, namespaced so it cannot collide with the root `v<version>` tags `release.yml` already creates.
- No `publishConfig`; registry comes from committed `.npmrc` plus an explicit `--@nuxeo:registry=` flag, matching org convention.
- Immutability: Nexus rejects duplicates; the workflow pre-checks with `npm view` and fails early rather than eating a 409.

## Phases 6-9: implementation

### Rename (largest mechanical step)

`libs/platform/package.json` `name`, the five aliases at [tsconfig.base.json](tsconfig.base.json) lines 40-44, and 281 import specifiers. Then the hardcoded strings that a find-and-replace over `.ts` would miss:

- [libs/platform/guardrails/check-extension-library.mjs](libs/platform/guardrails/check-extension-library.mjs) lines 136-141 (`PUBLISHED` set) and 157 (specifier regex) — this is the only thing enforcing "no deep imports past a published entry point".
- [scripts/beta-harness/publishability.mjs](scripts/beta-harness/publishability.mjs) line 428 (docs regex), and lines 116-120 / 325 (FESM bundle names).
- [scripts/beta-harness/steps/phase-5-harness.mjs](scripts/beta-harness/steps/phase-5-harness.mjs) lines 217-218 and [scripts/beta-harness/sanitizer-audit.selftest.mjs](scripts/beta-harness/sanitizer-audit.selftest.mjs) line 868 — negative-test fixtures that stop being negative if left stale.
- [scripts/build-platform-generators.mjs](scripts/build-platform-generators.mjs) line 165 (the `nx g` help text).
- `tools/satori-generators/**/files/**` templates (the `libs/platform/generators/` copy is gitignored and regenerates).

A trap to verify rather than assume: ng-packagr flattens the package name into the FESM filename, and both `@nuxeo-satori/platform` and `@nuxeo/satori-platform` plausibly flatten to `nuxeo-satori-platform`. If so, the hardcoded names in `publishability.mjs` keep passing **while asserting the old identity**. Derive them from `pkg.name` instead so the check cannot be accidentally vacuous, and confirm against the rebuilt `dist/` either way.

Derived, so needing no edit: `fork-simulation.mjs`, `api-surface.mjs` and `upgrade-rehearsal.mjs` all read `pkg.name` from the built `package.json`. `docs/api/platform.api.md` is generated — regenerate with `npm run beta:api -- --update`, never hand-edit.

No lockfile regeneration is needed: the repo has zero `@nuxeo/*` dependencies, so the new `.npmrc` line changes no resolution.

### Metadata, licensing, packaging

Add `license`, `repository` (with `directory: libs/platform`), `homepage`, `bugs`, `author`, `keywords`; remove `private`; drop the `@hylandsoftware/satori-ui` peer. Add a root `LICENSE` and ship it as an ng-packagr asset. Enable `deny-licenses` in dependency-review and add a production-dependency license check to the gate.

### Proving it installs

The gap `docs/publishing-to-nuxeo-registry.md` §6 admits to: nothing has ever run a real `npm install`. Add a clean-room check that packs the built library, installs the tarball into a temp project **with no `.npmrc`**, resolves all five entry points, typechecks an import of each, and asserts the tarball contains no `.env`, key material, or unexpected files. This is what turns "believed publishable" into "installs anonymously".

### Workflow

New `.github/workflows/publish-platform.yml`, separate from `release.yml`:

- `pull_request` with `paths:` on `libs/platform/**`, `libs/shared/**`, `.npmrc` — runs build, lint, test, typecheck, `beta:publishable`, license check, pack, clean-room install. Never publishes.
- `workflow_dispatch` with `dist-tag` and `dryRun` inputs, plus a GitHub **Environment** for manual approval before the publish step.
- `pull_request` jobs get `permissions: contents: read` and no access to publish secrets; `NPM_PACKAGES_TOKEN` is referenced only in the dispatch job, so a fork PR cannot reach it.
- Pre-flight `npm view <name>@<version>` to fail on an already-published version before attempting the 409.
- `npm publish --dry-run` runs immediately before the real publish, same command, two steps.
- Post-publish verification re-resolves the version from the registry anonymously.

### Verification loop for every phase

`npm run beta:gate` (22 gates, stops at first failure), plus `npx nx build platform`, `npm run beta:api`, `npm run beta:publishable`, `npm run beta:fork`, `npm run beta:upgrade`, the new clean-room install check, and `actionlint` on the workflow. Each new check gets watched failing on purpose before being trusted, per the repo's standing rule.

**Nothing will be published.** The workflow will be validated end to end with `dryRun`, and the real publish left for explicit authorisation.
