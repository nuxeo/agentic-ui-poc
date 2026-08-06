# ADF HX for Beta — Practical Feasibility Analysis

> ## ⚠️ Recovery note — this is the condensed published version, not the original
>
> The original in-repository version of this analysis was approximately 90KB and was lost from
> the working tree before it was ever committed to git. It is not recoverable from any branch,
> commit or stash.
>
> What follows is the **condensed version published to Confluence** ([page 4231594491](https://hyland.atlassian.net/wiki/spaces/~71202090f2a61ef96d4f57a5104efe296c1f5b/pages/4231594491)),
> which was shortened to fit Confluence's publishing size limit. It carries every conclusion,
> estimate and blocker, but **not** the supporting detail: the method-by-method port mapping and
> the detailed integration mechanics are gone.
>
> **Do not cite this document as the complete analysis.** The missing detail has deliberately not
> been regenerated — inventing it would produce text that reads like verified findings but is not.
> If that detail is needed, it must be re-derived from the sources listed at the end of this page.

> **Status:** Draft for review
> **Audience:** Engineering, architecture
> **Evidence date:** 6 August 2026 — all GitHub facts re-verified against the live repository on this date
> **Parent:** [ADF HX Content Services vs. a Nuxeo Satori Library — Decision Document](adf-hx-vs-nuxeo-satori-decision.md)

The parent decision document answers _whether_ we should align with Hyland's backend-agnostic content library and _why_. This page answers the engineering questions underneath it: what their components could actually replace, what owning `@hxp/content-adapter-nuxeo` concretely costs, how our Angular app would physically consume the package, and what fits inside the Beta window.

**Where the parent document and this one disagree on a fact, this one is newer and cites its source.** The parent has been corrected accordingly.

---

## 1. Framing: two separate tracks

**ADF HX Content Services and our agentic UI layer are entirely different concerns, and this page is about only one of them.**

- **Track A — the AG-UI agent runtime.** Streaming chat, multi-step tool loops, human-in-the-loop approval, thread persistence, generative UI, recipes. This is ours regardless of any content-library decision. Nothing here changes Track A's scope, sequencing or risk.
- **Track B — the content component library.** Which Angular components render document lists, trees, breadcrumbs, metadata panels, permission dialogs and version history, and where they come from. This is where ADF HX belongs, and it is the entire subject of this page.

There is one touchpoint that is easy to over-read. The ADF HX Assessment contains a section on "agent-driven UI feasibility" — whether _their_ components could be composed by an agent, concluding "feasible in controlled scenarios today". That is a maturity property of their library, relevant only if we adopt their components. It is **not** a capability our agent runtime needs, depends on, or waits for. Our generative-UI registry composes _our_ widgets.

---

## 2. Three findings that change the picture

### 2.1 The abstraction layer and a working Nuxeo adapter already exist — as unmerged draft PRs

This is the largest correction to the earlier analysis, which concluded none of this was built. That was true of `develop` and misleading about the repository.

| PR                                                                                                                  | Contents                                                                                                                                        | State                                           |
| ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| [#18189](https://github.com/Alfresco/hxp-frontend-apps/pull/18189) `feature/CSX-447-content-abstraction-layer`      | `libs/content-abstraction/{domain,ports,contract-tests,dev-harness}` plus separate `libs/content-adapter-hxpr` and `libs/content-adapter-nuxeo` | **Draft**, 434 files, last updated 13 July 2026 |
| [#18232](https://github.com/Alfresco/hxp-frontend-apps/pull/18232) `feature/CSX-447-abstraction-layer-research-poc` | The RFC, five ADRs, the POC plan, six Nx libraries including `nuxeo/data-access`                                                                | **Draft**, 203 files, last updated 13 July 2026 |
| [#18309](https://github.com/Alfresco/hxp-frontend-apps/pull/18309)                                                  | Adds `ADR-009 PrincipalPort` — a sixth port not in the RFC                                                                                      | Open, based on #18189                           |

So: **the ports, the domain model, the contract-test harness, an HxPR adapter and a Nuxeo adapter all exist as working code, none of it is merged, and the branches have not moved in over three weeks** while `develop` receives commits daily.

That cuts both ways. Better news for effort estimation — we have real reference code. Worse news for dependency risk — we would depend on draft branches whose owner has gone quiet.

### 2.2 The published RFC is no longer the design

RFC §4.4 lists eight ports. The code on the branch has five. Their own living ledger (`STATUS.md`, 13 July 2026) says so explicitly: _"The RFC is a point-in-time proposal and is not edited as new ADRs land. This document is the living record."_

| Port              | In RFC §4.4 | In branch code            | Note                                               |
| ----------------- | ----------- | ------------------------- | -------------------------------------------------- |
| `ContentPort`     | Yes         | Yes, named `DocumentPort` | Renamed in the RFC, not in code                    |
| `SearchPort`      | Yes         | Yes                       |                                                    |
| `PermissionsPort` | Yes         | Yes                       | Write model still an open decision                 |
| `UploadPort`      | Yes         | Yes                       | `cancelStaged` / `replaceBlob` proposed, not added |
| `AuthPort`        | Yes         | Yes                       |                                                    |
| `PrincipalPort`   | Yes         | **No**                    | Draft ADR-009 only                                 |
| `DownloadPort`    | Yes         | **No**                    | Proposal is to fold it into `DocumentPort`         |
| `ModelPort`       | Yes         | **No**                    | No decision record, no code                        |

All nine ADRs are status **Proposed**. Seven decisions are open, two on the critical path, and both touch ports we would implement. **Anything designed against the RFC text is designed against a superseded contract.**

### 2.3 The library is developed against Angular 20, not Angular 19

The library declares one peer dependency, `@angular/core: >=19.2.9`. That range is nominal. The HFA monorepo pins what it is actually compiled and tested against:

| Package                          | HFA `develop` | Ours          | Gap                       |
| -------------------------------- | ------------- | ------------- | ------------------------- |
| `@angular/core`                  | 20.3.25       | 19.2.20       | One major version         |
| `@angular/material` / `cdk`      | 20.2.14       | 19.2.19       | One major version         |
| `@hylandsoftware/satori-ui`      | 0.2.0         | 0.1.5         | Breaking under 0.x semver |
| `typescript`                     | 5.8.3         | 5.6.3         | Two minors                |
| `@alfresco/adf-core`             | 9.2.0         | not installed | New dependency tree       |
| `@hylandsoftware/hxcs-js-client` | 2.0.111       | not installed | New dependency tree       |

npm would install the package without complaint, because 19.2.20 satisfies `>=19.2.9` literally. But the compiled Angular partial-declaration format, the Material 20 theming API and Satori 0.2.0's surface are all Angular-20-era. **Adopting the components means adopting an Angular 19 → 20 upgrade as a prerequisite, not a follow-up.** The parent document's earlier "a minor Angular bump is the only version friction" has been corrected.

---

## 3. What ADF HX could achieve for us in Beta

### 3.1 Two absences confirmed first-hand

There is **no upload component or service anywhere in the library** — `UPLOAD_API_TOKEN` is provided but nothing consumes it. And there is **no search-results component**; only filter widgets are exported. The orchestrator that turns filters into a query and renders results still lives in `workspace-hxp`. [PR #18708](https://github.com/Alfresco/hxp-frontend-apps/pull/18708) is actively moving it (commits 5 August 2026) but is unmerged.

### 3.2 Everything is typed on the HxPR SDK

`HxpDocumentListComponent`, the single most valuable component to us, declares `@Input() documents: Document[]` importing `Document` from `@hylandsoftware/hxcs-js-client`. There is no seam.

Rendering our Nuxeo documents through it today means shaping our data into the HxPR SDK's type — precisely the "transport-only adapter / SDK emulation" that RFC §3.2 and ADR-001 evaluated and **explicitly rejected** as a production architecture.

The DI layer closes off the obvious workaround. All twelve API injection tokens are manufactured by one generic factory that instantiates HXCS SDK classes, depends on `@alfresco/adf-core`'s `AuthenticationService` and `AppConfigService`, and throws if config is not loaded. Providing our own token values does not work, because the token _types_ are SDK classes. We would have to build twelve SDK-shaped API classes over Nuxeo — a second, worse adapter with none of the neutrality.

**Only Wave 3 fixes this, and Wave 3 has not started.** Their own ledger calls it "the largest remaining slice".

### 3.3 Feature-by-feature mapping

Our nine feature libraries, measured 6 August 2026 (`.ts` excluding specs, plus `.html`):

| Our feature lib       | LOC        | Components | What ADF HX could replace                                                 | Verdict                  |
| --------------------- | ---------- | ---------- | ------------------------------------------------------------------------- | ------------------------ |
| `browse`              | 5,684      | 6          | Tree, list, breadcrumb, copy/move/delete/download, column management      | **Substantial** (60–70%) |
| `document-detail`     | 8,150      | 10         | Metadata sidebar, properties viewer, permissions dialog, versions, viewer | **Partial** (~35%)       |
| `search`              | 3,374      | 3          | Filter widgets only; no results orchestration until CSX-557 merges        | **Partial**              |
| `collections`         | 2,775      | 6          | Nothing — Nuxeo facet with `Collection.*` operations                      | **None**                 |
| `trash`               | 1,669      | 2          | Nothing — they have delete, not trash-and-restore                         | **None**                 |
| `assets`              | 2,020      | 3          | Nothing — DAM-specific asset and rendition views                          | **None**                 |
| `administration`      | 4,920      | 13         | Nothing — users, groups, vocabularies, workflow models                    | **None**                 |
| `tasks`               | 2,007      | 3          | Nothing — Nuxeo workflow tasks                                            | **None**                 |
| `knowledge-discovery` | 2,068      | 3          | Nothing — CIC Knowledge Discovery / Content Lake                          | **None**                 |
| **Total**             | **32,667** | **49**     |                                                                           |                          |

Even within `browse`, the strongest case, what does not come across: our nav-tree bootstrap logic, creatable-subtype discovery, the CSV export flow, and our signal-based `SelectionService` shared across browse, search, assets and trash. Their library has **no pagination component and no shared selection service** — selection is reimplemented per component.

### 3.4 The honest total

ADF HX is a core-ECM library and nothing more. Confirmed by inspection: no upload, no trash lifecycle, no collections, no tags, no workflow, no administration, no DAM, no AI. Weighted by lines of code, their components could plausibly replace **on the order of a quarter to a third** of `libs/features`, and none of our AI, KD or KE clients. **The part of the product that differentiates it stays ours under every option.**

---

## 4. What owning the Nuxeo adapter actually means

We take as settled that if ADF HX is to work for Nuxeo, we own `@hxp/content-adapter-nuxeo`.

### 4.1 We are not starting from zero

The Nuxeo adapter on #18189 is a working implementation, not a sketch: **16 source files, roughly 1,300 lines, with 11 spec files at roughly 975 lines.** It runs on the official `nuxeo` JS client v4.0.6 — a genuinely public npm package.

It implements `getById`, `getByPath`, `listChildren`, `getRoot`, `createUnderParent`, `update`, `delete`, `move`, `copy`, `getWithBreadcrumb` and `getWithPermissions`, uses `Document.AddPermission` / `RemovePermission`, and runs NXQL through `Repository.Query` against the strongly-consistent core rather than Elasticsearch, deliberately, for read-your-writes.

**Every one of those calls is one our own services already make.** Mapping the port surface against `libs/shared/nuxeo-client`, we can already satisfy **23 of 28 substantive port methods** from existing service methods. That is the strongest single signal here: the shape fits our backend because it was designed against our backend.

Read that ratio carefully, though. It says the data-access work is largely done. It does not say the adapter is 23/28 complete — a port implementation is the call _plus_ translation into the neutral model _plus_ the capability declaration _plus_ contract-test conformance. The existing methods are the cheapest ingredient.

### 4.2 What is genuinely missing

- **Renditions are unimplemented** — `getWithRendition` throws. This is the one place we are _ahead_: we already fetch thumbnails and PDFs as authenticated blobs.
- **Three named queries only.** Our search surface uses page providers with aggregations, saved searches and suggesters.
- **Two filter kinds of thirteen** (`eq`, `fullText`).
- **Config is POC-grade** — accepts a raw `authHeader` or `basicAuth`, directly contrary to `AGENTS/07-security.md`.

### 4.3 Effort estimate

| Work item                                              | Estimate                    |
| ------------------------------------------------------ | --------------------------- |
| Adopt and re-home the existing adapter                 | 1 week                      |
| Renditions                                             | 0.5 week                    |
| Replace POC auth with real auth (SAML cookies)         | 2 weeks                     |
| Upload progress and cancellation                       | 1.5 weeks                   |
| `ModelPort` (contingent on someone defining the shape) | 1.5 weeks                   |
| Named-query catalogue for our real search surface      | 3 weeks                     |
| Filter DSL → NXQL for the remaining eleven kinds       | 1.5 weeks                   |
| Namespace declarations for our schemas                 | 0.5 week + external latency |
| Error taxonomy hardening                               | 0.5 week                    |
| Contract-test harness conformance                      | 2 weeks                     |
| Capability descriptor accuracy and docs                | 0.5 week                    |
| **Sub-total**                                          | **~15.5 engineer-weeks**    |

Then three multipliers: the port surface is not stable (nine ADRs Proposed, seven open decisions — rework allowance **+30–50%**); we do not own the ports package, so every named query and namespace constant is an upstream PR into a repo owned by a team that has descoped Nuxeo; and **the adapter alone delivers nothing** until Wave 3 lands.

**Realistic range: 20–26 engineer-weeks for a production-grade Nuxeo adapter — and that buys an adapter, not a working screen.**

The number to hold onto: **the adapter is not the expensive part of adoption.** Wave 3 and the Angular 20 upgrade are.

---

## 5. Blockers

Ordered by severity. "Mitigation" means something we could actually do.

| #   | Blocker                                                                                                                                                                       | Severity               | Mitigation                                                                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------- |
| B1  | **Component `@Input`s are typed on the HxPR SDK**, and the DI layer closes the loop. All 12 API tokens are 1:1 factories over SDK classes                                     | **Critical**           | None short of Wave 3, which has not started                                                   |
| B2  | **Angular 20 / Material 20 / Satori 0.2.0 wall.** Declared `>=19.2.9` peer range is misleading                                                                                | **Critical**           | Upgrade our stack — worth doing anyway, but a multi-week programme                            |
| B3  | **The abstraction layer is unmerged and stalled.** Both PRs drafts, static since 13 July; all nine ADRs Proposed                                                              | **Critical**           | Contribute to the branches, or pin to a commit                                                |
| B4  | **The published RFC is not the current design.** Three of eight ports have no code                                                                                            | **High**               | Treat `STATUS.md` and branch code as source of truth, not Confluence                          |
| B5  | **Seven open decisions, two on the critical path** — permissions write model and check-in/versioning, both ports we would implement                                           | **High**               | Only ratification unblocks this, and it is CSX's to schedule                                  |
| B6  | **Upload does not exist in the library.** CSX-494 sizes the move at 7–10 weeks with an unresolved fork question                                                               | **High**               | Keep our own upload                                                                           |
| B7  | **No search-results component.** Only filter widgets; orchestrator lives in `workspace-hxp`                                                                                   | **High**               | Watch PR #18708; do not depend on it                                                          |
| B8  | **Package installability from GitHub Packages is unverified.** Our token lacks `read:packages`                                                                                | **High until checked** | Twenty-minute check by anyone with the right scope. **Do this first**                         |
| B16 | **Adopting the components means adopting `@alfresco/adf-core` wholesale** — their DataTable, CardView, Viewer and translation stack. The document list wraps ADF's data table | **High**               | None. This is what the library is, and it is the largest hidden cost in any adoption estimate |
| B9  | **Auth model mismatch.** Their adapter deliberately bypasses the host `HttpClient` interceptor; `AuthPort` presumes bearer tokens; we use SAML session cookies                | **Medium-High**        | Three possible resolutions, one of which changes the port contract                            |
| B10 | **Faceted search and aggregations have no port.** ADR-003 declares them out of scope; they are core to our search                                                             | **Medium-High**        | Stay outside the abstraction, or sponsor an ADR                                               |
| B17 | **The `ui` manifest would not install cleanly** — peer-depends on an internal path alias and on `ng-mocks`; does not declare Satori or `pdfjs-dist` despite needing both      | **Medium-High**        | Upstream fixes, reasonable to ask for                                                         |
| B11 | **We do not own the namespace catalogue.** ADR-005 requires constants in the ports package; the adapter declares only `DC` and `FILE`                                         | **Medium**             | Upstream PRs, one per schema — a permanent tax                                                |
| B12 | **Renditions unimplemented in their Nuxeo adapter**                                                                                                                           | **Medium**             | We already have the calls; ~half a week                                                       |
| B13 | **Satori override collision.** Our seven SCSS override files would silently apply to their components                                                                         | **Medium**             | Beta task B3 already commits to hardening these                                               |
| B15 | **Cross-repo release train on our critical path**, for a product shipped as a Nuxeo marketplace package to OnPrem                                                             | **Medium**             | Version-pin and vendor-lock; makes coupling visible, not absent                               |
| B18 | **We have no i18n pipeline to merge into.** Their 8 locales span three asset directories; our ngx-translate loader is a no-op stub                                            | **Low-Medium**         | Build the pipeline — independently worth doing                                                |
| B14 | **Boundary leaks.** Their document list registers translation namespaces belonging to Workspace                                                                               | **Low-Medium**         | PR #18090 is cleaning this up; cosmetic for us                                                |

---

## 6. The sequencing problem

An adapter needs ports to implement, and the ports do not exist anywhere we can depend on. Four honest options:

1. **Define the ports ourselves from the RFC.** Fast, but drift is now demonstrated rather than hypothetical. Guarantees divergence from what CSX ships.
2. **Copy the port library from the branch.** Strictly better. Small, self-contained, no SDK imports by construction. Drift risk remains but starts smaller and is _measurable_ — we can diff against their branch.
3. **Wait for Wave 1.** Blocked on ratification, which has no date. Waiting is not a plan; it is the absence of one.
4. **Contribute the port library upstream and take the Nuxeo adapter with it.** The only option that fixes the root cause. Entirely outside our control and our Beta timeline.

**Recommendation: Option 2 now, Option 4 in parallel.**

One thing worth noticing: our position is unusually favourable for Option 4. CSX built a Nuxeo adapter specifically to prove their port surface was not accidentally HxPR-shaped, then declared Nuxeo productisation out of scope. **Their architecture's central validation claim depends on a second adapter that nobody is maintaining.** We are the only team that can make that claim durable. That is leverage.

---

## 7. Open questions

None of these are engineering questions we can resolve ourselves.

### For CSX

1. **Is `@alfresco/adf-hx-content-services@0.0.8` published to GitHub Packages**, and can a team outside HFA read the `@alfresco` scope? Cheapest question here and a hard gate on everything else.
2. **What is the plan for PR #18189 and #18232?** Static since 13 July while `develop` moved daily. Scheduled, blocked, or abandoned?
3. **When does the ADR set move from Proposed to Accepted?** Their ledger names ratification as top of the critical path, with no date.
4. **Which of the seven open decisions will change the port surface?** Decisions 1 and 3 both change ports we would implement.
5. **Is Wave 3 funded and scheduled?** Without it the components cannot render Nuxeo data and every other question is academic.
6. **Would CSX accept a Nuxeo adapter contributed and maintained by us inside HFA** — commit rights, review capacity, CI against a Nuxeo instance?
7. **Does the library intend to support cookie-authenticated backends,** or is `AuthPort.getAccessToken()` a fixed bearer-token assumption?
8. **Is `@alfresco/adf-core` intended to remain a hard dependency after Wave 3?** Wave 3 changes the data types but does not obviously remove ADF's data table, card view, viewer and translation infrastructure. If adf-core stays, a backend-agnostic library still imposes a specific UI framework.
9. **Will the `ui` manifest defects be fixed before external consumption?** We are happy to raise the PRs if that is welcome.

### For architecture

10. **Where does `@hxp/content-adapter-nuxeo` live — HFA or our repo?** HFA gets us the boundary lint and the architecture's blessing but puts us on their release train. Our repo inverts both.
11. **Is `ModelPort` a real port?** No ADR, no code, and not among the listed open decisions. If not, our type-and-schema introspection has no home.
12. **Where do faceted search and aggregations go?** ADR-003 declares them out of scope; Nuxeo page-provider aggregates are core to our search.
13. **Does Nuxeo's trash-and-restore lifecycle warrant a port concept,** or does `trash` stay outside the contract permanently?
14. **Should we seek reviewer or approver standing on CSX-447?** We are the second backend the design is validated against and appear nowhere in its reviewer lists.

### For our leadership

15. **Who funds the 20–26 engineer-weeks of adapter work,** and from which track's budget? It is in none of Track A, B or C today.
16. **Do we accept a cross-repo dependency on HFA's release train** for a product shipped as a Nuxeo marketplace package to OnPrem customers?
17. **Is the Angular 19 → 20 upgrade in scope for Beta?** It is a prerequisite for component adoption and is not currently planned. **If the answer is no, component adoption is decided by default.**
18. **Is there a CIC-level expectation that Nuxeo Satori converges on the Satori content surface within a stated timeframe?** A date changes the recommendation; its absence confirms it.
19. **What is the gate for reassessing component adoption?** Suggested: ADRs Accepted, #18189 merged, Wave 3 started, installability confirmed, adapter ownership settled. Any date-based gate without those conditions will be met by a "not yet".

---

## 8. Recommendation for Beta

### Adoptable in the Beta window

- **Shape our abstraction to their real port surface (Beta task B1, re-specified).** Take the port and domain types from #18189 at a **pinned commit** as the target shape, rather than the RFC's text or an invented `satori-content` boundary. Work Track B had already committed to; the only change is aiming at code that exists rather than prose that has drifted. Costs approximately nothing extra.
- **Confirm package installability.** One person with `read:packages`, twenty minutes, week one. A "no" removes several options; a "yes" makes an evaluation spike cheap.
- **Harden the Satori overrides (Beta task B3).** Already planned, independently correct, and a prerequisite for any later adoption.
- **Open the adapter-ownership conversation** with CSX and architecture. Slow to start, no engineering cost, and the only lever on the sequencing problem.
- **Optionally, a time-boxed evaluation spike.** If installability is confirmed, two engineer-weeks standing `HxpDocumentListComponent` up in an isolated Angular 20 harness against our Nuxeo instance would convert several unverified blockers into facts. Ring-fence it; do not let it become adoption by accident.

### Must wait

- **Adopting their components.** Blocked on SDK-typed inputs, the Angular 20 wall, and the unmerged abstraction. Each alone would be a stretch in sixteen weeks; together, with two other tracks running, they are not realistic.
- **Building a productised Nuxeo adapter.** 20–26 engineer-weeks against a surface with nine unratified ADRs, delivering something with no consumer until Wave 3. The work is real and we should expect to do it — but doing it now maximises rework and delivers nothing to Beta.
- **Depending on their upload or search-results page.** Neither is in the library today.

### The one-line version

**For Beta, adopt their contracts, not their components — and take the contracts from their branch rather than their RFC.** Revisit component adoption at a gate defined by ADR ratification, #18189 merging, and Wave 3 starting — not by a date.

---

### Sources

**Confluence:** [ADF HX Assessment & Evolution Report](https://hyland.atlassian.net/wiki/spaces/~61a51e0ad5986c006a1ec880/pages/3987440773) · [CSX-494 Upload feasibility](https://hyland.atlassian.net/wiki/spaces/~61a51e0ad5986c006a1ec880/pages/4002718819) · [CSX-495 Search orchestrator feasibility](https://hyland.atlassian.net/wiki/spaces/~61a51e0ad5986c006a1ec880/pages/4002718871) · [RFC CSX-447](https://hyland.atlassian.net/wiki/spaces/CSX/pages/4192241998) · [ADR-001](https://hyland.atlassian.net/wiki/spaces/CSX/pages/4192112470) · [ADR-002](https://hyland.atlassian.net/wiki/spaces/CSX/pages/4192145207) · [ADR-003](https://hyland.atlassian.net/wiki/spaces/CSX/pages/4192273308) · [ADR-004](https://hyland.atlassian.net/wiki/spaces/CSX/pages/4192306941) · [ADR-005](https://hyland.atlassian.net/wiki/spaces/CSX/pages/4191003989)

`Alfresco/hxp-frontend-apps` (private), read via the GitHub API on 6 August 2026: `develop` root `package.json`, `.npmrc`, the library's `package.json` / `project.json` / `ui/src/index.ts` / `document-list.component.ts`; branch `feature/CSX-447-content-abstraction-layer` for `libs/content-abstraction`, `libs/content-adapter-nuxeo` and `STATUS.md`.

**This repository:** `AGENTS.md`, `AGENTS/00-architecture.md`, `AGENTS/07-security.md`, `libs/features/*`, `libs/shared/nuxeo-client/src/lib/services/*`. (The published version of this page pointed at a full-length copy of this analysis in this repository; that copy is lost — see the recovery note at the top.)
