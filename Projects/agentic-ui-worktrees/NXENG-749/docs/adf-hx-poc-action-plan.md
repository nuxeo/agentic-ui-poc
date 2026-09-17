# adf-hx Browse POC — Action Plan

> **Superseded.** The current plan of record is
> [`docs/adf-hx-beta-plan.md`](adf-hx-beta-plan.md), which adds the four-layer extensibility
> contract and corrects the dependency facts below. This document is kept for history only —
> in particular, its claim that adf-hx is at "v0.0.8" and that package access is unresolved was
> disproved on 20 August 2026.

**Tickets:** [NXENG-619](https://hyland.atlassian.net/browse/NXENG-619) (Discovery) under [NXENG-615](https://hyland.atlassian.net/browse/NXENG-615) (Epic)
**Branch:** `feature/adf-hx-browse-poc` at `ac68db4` · 3 commits ahead of `main`, 0 behind
**Status:** Draft for review · 20 August 2026

This plan is the "action plan to fix the gap" that NXENG-615 asks for as an outcome, including the
two timeline scenarios (one engineer focused, one engineer with AI support). It is written to be
published as the NXENG-619 Confluence page once reviewed.

---

## 1. Position today

The branch delivers a working read-only browse at `/#/browse-adf-hx`, running in parallel with
production browse, backed by a new `libs/shared/adf-hx-bridge` library: thirteen hand-written
`hxp-*` components plus facades that implement the HxCS `DocumentApi` and `QueryApi` interfaces
over Nuxeo REST.

Three facts shape everything below.

1. **No adf-hx component is consumed.** All 22 imports from `@hylandsoftware/hxcs-js-client` are
   TypeScript `import type`. The package contributes type shapes only. The branch validates the
   _port contract_; it does not test _component reuse_.
2. **8 of the 30 capabilities** in the NXENG-619 minimum list are fully working. Every write path is
   a stub showing a Scope A notice. Versions, locking, comments, search, workflow, aggregations,
   users and groups, administration and publishing have no code.
3. **Nothing has been CI-validated.** CI triggers only on PRs to `main` and pushes to `main`, and no
   PR exists. The branch also carries the Angular 19 → 20, Vite 5 → 6 and TypeScript 5.6 → 5.8
   upgrade for the whole monorepo, while `main` is still on Angular 19.

Full capability breakdown and the seven code-level defects: see the analysis canvas referenced in
the NXENG-619 comment thread.

---

## 2. The decision that gates the plan

NXENG-619 asks to compare two paths. Only one has been explored.

| Path                                              | Question it answers                                  | Explored?                                                                  |
| ------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------- |
| Path 1 — make the agentic POC a component library | Can our own components be packaged and reused?       | No                                                                         |
| Path 2 — adapt adf-hx to Nuxeo APIs               | What does it cost to consume real adf-hx components? | **No** — the branch reimplements the look instead of consuming the library |
| (What was actually built)                         | Can Nuxeo REST satisfy the HxCS port contracts?      | Yes, for reads                                                             |

**Decision required before Phase 3 starts:** does NXENG-619 still need a literal adf-hx spike, or is
the contract-only result sufficient to close the discovery? This is a conversation with Renan
Almeida, and it determines whether Phases 3 and 4 are worth funding on this codebase.

The prior written analysis (`docs/adf-hx-greenfield-ecm-dam.md` on `origin/beta-delivery`) already
recommended "adopt the contracts, do not adopt the components." The branch is consistent with that
recommendation, which is an argument for closing the discovery — but it is a decision to take
explicitly, not by omission.

---

## 3. Phase plan

### Phase 0 — Restore the ability to verify (blocking, do first)

Nothing on this branch can be trusted until the install matches it.

| #   | Task                             | Detail                                                                                                                                                                                                                                                                                                      |
| --- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1 | Reinstall dependencies           | `export SATORI_GH_READONLY_TOKEN=<token>` then `npm ci`. Current `node_modules` dates from 7 August and still holds Angular 19.2.20 / Satori 0.1.5, so it predates this branch's own upgrade.                                                                                                               |
| 0.2 | Re-run the gates                 | `npx nx affected -t lint build test --base=main`. Treat the current `Cannot find module '@hylandsoftware/hxcs-js-client'` build error and the `__decorate is not defined` test error as unverified until this reruns.                                                                                       |
| 0.3 | Fix whatever is genuinely broken | If the bridge specs still fail to collect, compare `libs/shared/adf-hx-bridge/tsconfig.spec.json` with `libs/shared/nuxeo-client/tsconfig.spec.json` — the latter sets `importHelpers: false` and `useDefineForClassFields: false`, which the bridge omits, and the base config sets `importHelpers: true`. |
| 0.4 | Delete the legacy Material tree  | Remove `libs/shared/adf-hx-bridge/src/lib/ui/hxp-document-tree/` and its barrel export. It is unused, and the Material imports it keeps in the library's public surface are a stated merge blocker in `.cursor/rules/adf-hx-browse-poc.mdc`.                                                                |
| 0.5 | Open a draft PR to `main`        | The only way to get CI to run. Title it as a POC and state in the body that it carries the monorepo Angular 20 upgrade, so reviewers scope it correctly.                                                                                                                                                    |

**Exit gate:** CI green on the draft PR, with lint, build and test all passing on a clean install.

### Phase 1 — Produce the missing decision inputs

| #   | Task                         | Detail                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.1 | adf-hx installability spike  | Obtain a token with `read:packages`, install `adf-hx-content-services` from GitHub Packages, and render exactly one real component against a minimal Nuxeo-backed adapter. This is the only way to price Path 2, and it settles the open installability question the feasibility analysis could not answer. Timebox it: if the package will not install, that result is itself the answer. |
| 1.2 | Reconcile the Angular target | The NXENG-619 comment asks for Angular 21; this branch landed on 20, and HFA `develop` was on 20.3.25 in August. Read the published peer range of the adf-hx package and decide whether the upgrade already done is sufficient.                                                                                                                                                            |
| 1.3 | Scope Path 1 honestly        | Path 1 (packaging our own components as a library) has had no analysis at all. At minimum, inventory what would have to move out of `libs/features/*` into a shareable library and what its public API would be.                                                                                                                                                                           |

**Exit gate:** a written answer to "can we consume adf-hx, at what Angular version, and at what cost",
plus a comparable sketch for Path 1.

### Phase 2 — Write the deliverable

NXENG-619's stated outcome is a Confluence page. It does not exist, and
`scripts/generate-adf-hx-effort-doc.ps1` is a zero-byte file.

The page needs four sections: the two-path timeline comparison, the component-by-component check
against the minimum capability list, the proposed `nuxeo-satori-placeholder` library structure, and
the two staffing timelines. Sections two and four can be lifted from this plan and the analysis
canvas; sections one and three depend on Phase 1.

**Exit gate:** page published and linked from NXENG-619; the empty generator script deleted or filled in.

### Phase 3 — Harden what exists (only if this codebase continues)

| #   | Task                                               | Why it is not optional                                                                                                                                                                                                                                                   |
| --- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 3.1 | Derive real effective permissions in the mapper    | `sys_effectivePermissions` is currently hardcoded to `['Browse','Read','ReadWrite','Everything']` for every document. The visible UI is not wrong today because gating reads the Nuxeo permissions enricher separately — but the contract the POC exists to validate is. |
| 3.2 | Honour sort, preserve the server total, add paging | `NuxeoQueryApi` ignores `namedQuery.sort` and overwrites `totalCount` with the current page length. Combined with the fixed 50-child page and no pager, child 51 onwards is unreachable and client-side sort over 50 rows is misleading.                                 |
| 3.3 | Namespace the column-settings storage key          | Both implementations write `browse_column_settings`, so each silently overwrites the other's layout.                                                                                                                                                                     |
| 3.4 | Remove request amplification                       | Use the Nuxeo ancestors enricher instead of one `getByPath` per breadcrumb segment; use a folderish/`hasChildren` signal instead of pre-fetching every sibling's children to draw chevrons; cap thumbnail concurrency.                                                   |
| 3.5 | Tests to the epic's bar                            | 11 test cases exist. All seven services (including the ~430-line nav tree service), all thirteen components and the POC page are untested, and there are no error-path tests. Add at least one Playwright path over `/#/browse-adf-hx`.                                  |

**Exit gate:** the five items closed, coverage reported, and the epic's quality checklist assessed
rather than assumed.

### Phase 4 — Scope B writes (conditional on the Phase 1 decision)

CRUD, upload and import, ACL editing, tag mutation, trash restore and purge. Note the cost driver:
the POC forbids Material and Satori, so every dialog production browse already has must be
rebuilt as an `hxp-*` component. `AdfHxBrowseFolderService.restoreDocument` is already implemented
with no call site, so trash restore is the cheapest starting point.

Do not start this before the Phase 1 decision. Building writes into a bridge that may be replaced is
the most expensive way to be wrong.

---

## 4. Timelines

Working days for one engineer, excluding the Phase 1 decision wait. Phase 4 is quoted separately
because it is conditional.

| Phase                            | One engineer, focused | One engineer with AI support | Notes on the difference                                                                                                                                                        |
| -------------------------------- | --------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0 — Restore verification         | 2–3 d                 | 1–2 d                        | Mostly install, CI and config work. AI helps little; the wall-clock cost is dependency resolution and CI turnaround.                                                           |
| 1 — Decision inputs              | 8–12 d                | 5–8 d                        | Dominated by the adf-hx spike, where the cost is peer-dependency and adapter debugging against an unfamiliar library. AI accelerates scaffolding, not integration archaeology. |
| 2 — Write the deliverable        | 4–6 d                 | 2–3 d                        | Strong AI fit: the capability table and comparison structure are already largely derived.                                                                                      |
| 3 — Harden                       | 12–18 d               | 7–11 d                       | The five defects are 5–7 d either way; the test backlog is where AI pays off, with the caveat below.                                                                           |
| **Subtotal (0–3)**               | **26–39 d**           | **15–24 d**                  | ≈ 5–8 weeks focused, ≈ 3–5 weeks with AI support.                                                                                                                              |
| 4 — Scope B writes (conditional) | 20–28 d               | 12–18 d                      | Cost driver is rebuilding every dialog as `hxp-*`, since Material and Satori are excluded.                                                                                     |

**A caveat this branch is direct evidence for.** The existing POC was AI-built (the commits carry
`Co-authored-by: Cursor`) and produced 18.4k lines quickly. It also produced seven code-level
defects, 11 tests for 2,949 lines of bridge source, and a branch that had never been compiled by CI.
The AI-supported column above is credible for output volume, but only if the plan keeps the
verification work it displaces — which is why Phase 0 is first and why Phase 3.5 is sized
generously. Do not read the right-hand column as the same work done faster; read it as the same work
with the cost moved from authoring to review.

---

## 5. Risks

| Risk                                                                   | Impact                                                                                                       | Mitigation                                                                     |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| The adf-hx package cannot be installed                                 | Path 2 cannot be priced at all                                                                               | Timebox 1.1 to two days; treat failure as a publishable finding                |
| This branch carries the monorepo Angular 20 upgrade                    | Review scope far exceeds a POC; conflicts grow while `main` stays on 19 with Dependabot opening 19.2.x bumps | Consider splitting the upgrade into its own PR ahead of the POC                |
| Angular 21 requirement lands                                           | Phase 1.2 becomes a second upgrade project                                                                   | Resolve 1.2 before committing to Phase 3                                       |
| Two adf-hx roadmaps remain unreconciled (per the feasibility analysis) | Any component-level adoption targets a moving API                                                            | Keep the dependency at contract level until CSX reconciles them                |
| Selection state is shared with production browse                       | The production Satori bulk topbar overlays the POC route, so the POC is not as isolated as it appears        | Decide whether that is acceptable for the POC or needs its own selection scope |

---

## 6. Definition of done

Repository gates, per `AGENTS.md` section 7:

- [ ] `npx nx affected -t lint` passes
- [ ] `npx nx affected -t build` passes
- [ ] `npx nx affected -t test` passes
- [ ] `docs/api-integrations.md` updated for endpoints the bridge calls
- [ ] `AGENTS/01-services.md` updated for bridge service signatures
- [ ] PR opened against `main` from `feature/adf-hx-browse-poc`

Epic gates, per NXENG-615's quality checklist — currently unassessed on this branch and needed for
Beta, not for closing the discovery:

- [ ] SAST and SCA scans with no high or critical findings
- [ ] Unit test coverage above 90%
- [ ] Integration tests over the key browse workflows
- [ ] E2E coverage of the critical paths
- [ ] WCAG 2.1 Level AA
- [ ] Verified on Chrome and Safari at minimum

Discovery gates, per NXENG-619:

- [ ] Two-path timeline comparison published
- [ ] Component-by-component capability comparison published
- [ ] `nuxeo-satori-placeholder` library structure proposed
- [ ] Both staffing timelines stated
