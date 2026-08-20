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

The same caution applies to their CSX-588 / CSX-592 generative-UI PoC, examined on 7 August 2026. It uses `@ag-ui/*` on the client only, at `^0.0.53` with a caret; its Node agent service hand-writes nine event types and carries no `@ag-ui/*` dependency at all. It emits no `STATE_DELTA`, no `TOOL_CALL_RESULT`, no `CUSTOM` and no interrupt `outcome`, and its cross-turn state travels as untyped English `role: 'system'` messages parsed back server-side with a regular expression. **It validates none of the AG-UI features Track A's design depends on**, and should not be cited as prior art for them. See [the teardown](csx-generative-ui-teardown.md) §4 and §6.

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

### 2.3 The library is developed against Angular 20 on `develop`, not Angular 19

The library declares one peer dependency, `@angular/core: >=19.2.9`. That range is nominal. **On the HFA `develop` branch, observed 7 August 2026,** the monorepo pins what it is actually compiled and tested against:

| Package                          | HFA `develop` (7 Aug 2026) | Ours          | Gap                       |
| -------------------------------- | -------------------------- | ------------- | ------------------------- |
| `@angular/core`                  | 20.3.25                    | 19.2.20       | One major version         |
| `@angular/material` / `cdk`      | 20.2.14                    | 19.2.19       | One major version         |
| `@hylandsoftware/satori-ui`      | 0.2.0                      | 0.1.5         | Breaking under 0.x semver |
| `typescript`                     | 5.8.3                      | 5.6.3         | Two minors                |
| `@alfresco/adf-core`             | 9.2.0                      | not installed | New dependency tree       |
| `@hylandsoftware/hxcs-js-client` | 2.0.111                    | not installed | New dependency tree       |

npm would install the package without complaint, because 19.2.20 satisfies `>=19.2.9` literally. But the compiled Angular partial-declaration format, the Material 20 theming API and Satori 0.2.0's surface are all Angular-20-era. **Adopting the components means adopting an Angular 19 → 20 upgrade as a prerequisite, not a follow-up.** The parent document's earlier "a minor Angular bump is the only version friction" has been corrected.

#### These are `develop`'s versions; the genUI PoC branch does not share them

> **Correction, 7 August 2026.** The figures above were previously stated without a dated branch attribution. They are correct **for `develop` as of 7 August 2026**. They are not uniform across HFA.
>
> The generative-UI PoC branch `feature/CSX-592-genUI` (head `c02c4e60`, 3 June 2026) is on **Angular 19.2.20 and Material 19.2.19** — our own Angular minor. Its merge base `a4378855`, 29 May 2026, predates HFA's Angular 20 upgrade, and `develop` is 933 commits ahead of it.
>
> **The row above is unchanged in force.** Blocker B2 is about installing and compiling the published library, which comes from `develop`, and it stands exactly as written. The distinction only matters for a separate question: reading and porting the genUI _design_ is not blocked by an Angular version, because nothing about it is installed — it would be reimplemented against our own components. What does constrain that branch is staleness, not versions: 933 commits behind, last commit 3 June 2026, and its PR proposed for closure. Treat it as a design document, not a base. Full evidence: [CSX Generative UI PoC (CSX-588 / CSX-592) — Teardown](csx-generative-ui-teardown.md) §6.

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

| #   | Blocker                                                                                                                                                                                                                                                                 | Severity               | Mitigation                                                                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------- |
| B1  | **Component `@Input`s are typed on the HxPR SDK**, and the DI layer closes the loop. All 12 API tokens are 1:1 factories over SDK classes                                                                                                                               | **Critical**           | None short of Wave 3, which has not started                                                   |
| B2  | **Angular 20 / Material 20 / Satori 0.2.0 wall on `develop`** (7 Aug 2026), which is what the package is published from. Declared `>=19.2.9` peer range is misleading. Applies to consuming the library; see §2.3 for why it does not apply to reading the genUI branch | **Critical**           | Upgrade our stack — worth doing anyway, but a multi-week programme                            |
| B3  | **The abstraction layer is unmerged and stalled.** Both PRs drafts, static since 13 July; all nine ADRs Proposed                                                                                                                                                        | **Critical**           | Contribute to the branches, or pin to a commit                                                |
| B4  | **The published RFC is not the current design.** Three of eight ports have no code                                                                                                                                                                                      | **High**               | Treat `STATUS.md` and branch code as source of truth, not Confluence                          |
| B5  | **Seven open decisions, two on the critical path** — permissions write model and check-in/versioning, both ports we would implement                                                                                                                                     | **High**               | Only ratification unblocks this, and it is CSX's to schedule                                  |
| B6  | **Upload does not exist in the library.** CSX-494 sizes the move at 7–10 weeks with an unresolved fork question                                                                                                                                                         | **High**               | Keep our own upload                                                                           |
| B7  | **No search-results component.** Only filter widgets; orchestrator lives in `workspace-hxp`                                                                                                                                                                             | **High**               | Watch PR #18708; do not depend on it                                                          |
| B8  | **Package installability from GitHub Packages is unverified.** Our token lacks `read:packages`                                                                                                                                                                          | **High until checked** | Twenty-minute check by anyone with the right scope. **Do this first**                         |
| B16 | **Adopting the components means adopting `@alfresco/adf-core` wholesale** — their DataTable, CardView, Viewer and translation stack. The document list wraps ADF's data table                                                                                           | **High**               | None. This is what the library is, and it is the largest hidden cost in any adoption estimate |
| B9  | **Auth model mismatch.** Their adapter deliberately bypasses the host `HttpClient` interceptor; `AuthPort` presumes bearer tokens; we use SAML session cookies                                                                                                          | **Medium-High**        | Three possible resolutions, one of which changes the port contract                            |
| B10 | **Faceted search and aggregations have no port.** ADR-003 declares them out of scope; they are core to our search                                                                                                                                                       | **Medium-High**        | Stay outside the abstraction, or sponsor an ADR                                               |
| B17 | **The `ui` manifest would not install cleanly** — peer-depends on an internal path alias and on `ng-mocks`; does not declare Satori or `pdfjs-dist` despite needing both                                                                                                | **Medium-High**        | Upstream fixes, reasonable to ask for                                                         |
| B11 | **We do not own the namespace catalogue.** ADR-005 requires constants in the ports package; the adapter declares only `DC` and `FILE`                                                                                                                                   | **Medium**             | Upstream PRs, one per schema — a permanent tax                                                |
| B12 | **Renditions unimplemented in their Nuxeo adapter**                                                                                                                                                                                                                     | **Medium**             | We already have the calls; ~half a week                                                       |
| B13 | **Satori override collision.** Our seven SCSS override files would silently apply to their components                                                                                                                                                                   | **Medium**             | Beta task B3 already commits to hardening these                                               |
| B15 | **Cross-repo release train on our critical path**, for a product shipped as a Nuxeo marketplace package to OnPrem                                                                                                                                                       | **Medium**             | Version-pin and vendor-lock; makes coupling visible, not absent                               |
| B18 | **We have no i18n pipeline to merge into.** Their 8 locales span three asset directories; our ngx-translate loader is a no-op stub                                                                                                                                      | **Low-Medium**         | Build the pipeline — independently worth doing                                                |
| B14 | **Boundary leaks.** Their document list registers translation namespaces belonging to Workspace                                                                                                                                                                         | **Low-Medium**         | PR #18090 is cleaning this up; cosmetic for us                                                |

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

---

# Re-verification — 8 August 2026

> **Scope of this section.** One question: can `@alfresco/adf-hx-content-services` be integrated into
> _this_ codebase? Not greenfield, and not the classic ADF that `alfresco-content-app` is built on.
> No source, test or configuration was changed. Every external fact below was re-read from the
> GitHub API or the npm registry on **8 August 2026**; every internal fact carries a path.
>
> **The answer is unchanged: no.** §§A–B say why in a page. The reason to read further is §C —
> what changed on our side, including one finding that contradicts how this repository's own
> documentation reads.

## A. The three blockers, re-checked. All still hold.

Prior conclusion (§5, blockers B1, B2, B16): the library cannot be consumed directly because its
components are typed on the HXCS SDK, `develop` is an Angular major ahead of us, and adoption drags
in `@alfresco/adf-core` wholesale. Re-verified today, all three stand, and none has moved.

| Blocker                            | Status on 8 Aug 2026                                                                                                                                                                                                                                                                                                                                                                             | Evidence                                                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| B1 SDK-typed inputs                | **Unchanged.** `HxpDocumentListComponent` still declares `@Input() documents: Document[]` importing `Document` from `@hylandsoftware/hxcs-js-client`, and still imports `DataColumn` / `DataColumnListComponent` from `@alfresco/adf-core`. **169** files under the library path match the SDK import; **323** repo-wide                                                                         | `libs/adf/enterprise/adf-hx-content-services/ui/src/lib/components/document-list/document-list.component.ts` @ `develop`; GitHub code search |
| B2 Angular wall                    | **Unchanged.** `develop` today: `@angular/core` 20.3.25, `@angular/cdk` / `@angular/material` 20.2.14, `@hylandsoftware/satori-ui` 0.2.0, `typescript` 5.8.3, `@alfresco/adf-core` 9.2.0-31171691470, `hxcs-js-client` 2.0.111. Ours: `~19.2.0`, `~19.2.0`, `^0.1.5`, `~5.6.3`                                                                                                                   | HFA `develop` `package.json`; our `package.json`                                                                                             |
| B3 abstraction unmerged            | **Worse by 26 days.** [#18189](https://github.com/Alfresco/hxp-frontend-apps/pull/18189) and [#18232](https://github.com/Alfresco/hxp-frontend-apps/pull/18232) are still **draft**, still `CONFLICTING` / `DIRTY`, both last updated **13 July 2026**. [#18309](https://github.com/Alfresco/hxp-frontend-apps/pull/18309) is open and mergeable, also static since 13 July                      | `gh pr view`, 8 Aug 2026                                                                                                                     |
| B6/B7 no upload, no search results | **Unchanged.** The public `ui/src/index.ts` is 54 lines and exports document tree, document list, breadcrumb, a tree skeleton loader and a file-type filter tree. No upload, no search-results. [#18708](https://github.com/Alfresco/hxp-frontend-apps/pull/18708) (CSX-557, search orchestrator) is the one genuinely live item — updated 7 Aug 2026, `MERGEABLE` but `BLOCKED`, still unmerged | `ui/src/index.ts` @ `develop`; `gh pr view 18708`                                                                                            |

A term sweep across the library path on `develop` returns **zero** matches for each of `thumbnail`,
`lightbox`, `gallery`, `exif`, `aggregation`, `facet`, `ag-ui` and `generative`. The DAM finding and
the "no facets" finding both survive unchanged, and the library has no agent or generative-UI
surface of any kind.

### The load-bearing facts that are sharper than before

**Installability (B8) is still open — and would not be sufficient even if it cleared.** Two months
after this was named the cheapest unblocking action, it has not been done. Re-checked today:

- **Not on public npm.** `https://registry.npmjs.org/@alfresco/adf-hx-content-services` returns
  **HTTP 404**; `npm view` returns `E404`.
- **GitHub Packages is the registry** — HFA's `.npmrc` on `develop` maps
  `@alfresco:registry=https://npm.pkg.github.com/`. Publishing runs through
  `pnpm mr hxp-lib-packager` (the library's `project.json` `npm-publish` target), an internal
  packager rather than `npm publish`.
- **We still cannot read it.** `gh api orgs/Alfresco/packages?package_type=npm` returns **403 — "You
  need at least `read:packages` scope"**. The available token carries `gist, read:org, repo, workflow`.
- **New, and it changes what "installable" is worth.** The library's own manifest on `develop` is
  `"dependencies": {}` with exactly one peer, `"@angular/core": ">=19.2.9"` — while its source
  imports `@alfresco/adf-core`, `@hylandsoftware/hxcs-js-client` and Satori. **It would install
  cleanly and fail to build.** Resolvability is not usability, and the twenty-minute check everyone
  is waiting on answers the smaller of the two questions. This is prior blocker B17, now confirmed
  against the shipping manifest rather than inferred.

**`AuthPort` against cookie sessions is a stronger finding than "there is no token".** The contract
we pinned is `getAccessToken(): Promise<string>`
(`libs/shared/nuxeo-client/content-ports/src/lib/ports/auth.port.ts`), and RFC §4.3 calls it
"application-driven token supply". What we established since the gaps report is that under Nuxeo's
real deployment the application is **not permitted to observe the credential at all**:

> Nuxeo scopes its session cookie to `Path=/nuxeo`, and the browser sends a cookie only to paths
> inside its `Path`, so the gateway has to be published under `/nuxeo/agent/` — same origin is not
> enough.
> — `docs/beta-demo-runbook.md:1078-1081`

> A password login on `localhost` supplies `Authorization: Basic …` through
> `AGENT_DEV_AUTH_HEADERS`, which masks this class of fault entirely. An SSO or cookie session does
> not — `JSESSIONID` is `HttpOnly`, so there is nothing for the app to lend.
> — `docs/beta-demo-runbook.md:1096-1099`

`HttpOnly` is the operative word. The gaps report (item 1) framed the problem as "there is no value
that means _the transport is already authenticated_", which implied the application could at least
choose what to return. It cannot: the credential is unreadable to JavaScript by design. So
`AuthPort` is not merely awkward on Nuxeo — it is **unsatisfiable in principle** on the topology
Nuxeo ships to customers, and no adapter can fix it from below.

We have now built the alternative twice. `apps/agent-gateway/src/identity/caller-identity.ts:26-27`
forwards `cookie` and `authorization` per request — ambient credential propagation, which is exactly
the `{ kind: 'ambient' }` case gap-report item 1 asks CSX to admit. And the dev Basic-auth path
masked a real defect for weeks, which is the cost of the port's assumption being wrong quietly
rather than loudly.

**CSX-592 — time-sensitive, and the branch is still there, on a fuse.** The 5 August exchange is on
[PR #17239](https://github.com/Alfresco/hxp-frontend-apps/pull/17239) ("CSX-592 Add Content Assistant
chat") verbatim. A stale bot posted on 3 August: _"This PR has been inactive for 60 days. It will be
closed in 30 days if no activity occurs."_ `richardsd` asked _"how should we keep this PR?"_;
`Gabez0r` replied _"I think we can close this."_; `richardsd` then asked _"but we should keep the
branch, right? Or a copy of it?"_ — **and nobody has answered.** The PR timeline carries no event
after 5 August 12:10 UTC.

State as of 8 August 2026:

- PR #17239 is **OPEN**, still draft, 42 commits, base `develop`.
- Branch `feature/CSX-592-genUI` **still exists**, head **`c02c4e6055de7ca511dd4373b441e4bb7eeec6a9`**,
  3 June 2026 — the same head this document already cites.
- The decision to close was taken; the branch-retention question is open; the bot will auto-close
  around **2 September 2026** absent activity.

**Nothing is unrecoverable today, and nothing important would become so.** Closing a PR does not
delete its branch, and a closed PR's commits stay readable from the PR page even after the branch
goes. The durable record of _why_ that PoC is not prior art for Track A is
`docs/csx-generative-ui-teardown.md`, which is in this repository. The head SHA above is the only
insurance worth taking, and it is now recorded twice.

**Maintenance position: actively maintained, on nothing we need.** `develop` takes commits daily
(five most recent all 7 August 2026) and the library itself took ten commits in the last three
weeks. But the CSX-tagged work merged in the last 30 days is memory-leak fixes, tooltip consistency,
a push to 90% unit-test coverage, a Satori breadcrumb migration and e2e work. **The only CSX-447 item
merged in that window is #18320, "Fix RFC/ADR consistency defects flagged in doc review" (13 July) —
a documentation fix.** No Wave has landed. The library's own `package.json` was last modified
19 November 2025 and still reads `0.0.8`.

## B. The direct answers

**1. Can it be added at all?**

- **As a dependency — no.** Three independent hard stops, each sufficient alone: it does not resolve
  for us (404 public, 403 GitHub Packages); its manifest declares no dependencies so it would
  install and not build; and it is an Angular major, a Material major, a Satori 0.x breaking bump
  and two TypeScript minors away from this repository.
- **As selectively vendored components — technically possible, and it costs more than it saves.**
  The only component worth vendoring is `HxpDocumentListComponent`, which is typed on the HXCS SDK
  and is a wrapper over `@alfresco/adf-core`'s DataTable. Vendoring it means vendoring adf-core's
  data table, card view and translation stack, or rewriting the component — at which point you have
  written a document list, which we already have in `libs/features/document-lists` (1,020 lines,
  gated at a 99% coverage floor). Vendoring the single valuable component costs more than the
  component.
- **The one subset that is genuinely cheap was already taken.** Their _contracts_, not their code:
  `content-ports`, pinned to `61eb45bf`. There is nothing further to buy there — and see §C.3 for
  what that purchase is actually worth.

**2. What would it buy us? Nothing we do not have, and the gap has widened.**

Measured against the library's actual public exports — document tree, document list, breadcrumb, a
tree skeleton loader, a file-type filter tree — we own working equivalents in `libs/features/browse`
(6,055 lines) and `libs/features/document-lists`. The only honest non-zero item is **shared
maintenance of core ECM list/tree/breadcrumb behaviour**, and that is realisable only after Wave 3,
an Angular upgrade and a productised adapter. It is a strategic benefit, not a Beta one.

It buys **nothing** for the differentiator (zero occurrences of `ag-ui` or `generative` in the
library: no agent runtime, no tool loop, no approval gate, no widget registry, no page tiles) and
**nothing** for DAM (zero occurrences of `thumbnail`, `lightbox`, `gallery`, `exif`).

**3. What would it break?**

- **Design system.** `apps/nuxeo-ui/src/styles/_satori-overrides.scss` is **284 lines explicitly
  pinned against `@hylandsoftware/satori-ui` 0.1.5**, with every selector prefixed `html` because
  Satori components use `ViewEncapsulation.None` and Angular appends their `<style>` tags to
  `<head>`. ADF HX builds against Satori **0.2.0**, and npm resolves one version per tree — so
  adoption forces the bump and re-derives all 284 lines. Worse, because encapsulation is `None`,
  **our overrides would apply to their components whether we intend it or not.** The hardening work
  did not remove blocker B13; it measured it precisely.
- **Backend divergence.** Components typed on SDK `Document` means SDK emulation, which ADR-001
  rejected. The twelve API tokens are typed as SDK classes, so providing our own values does not
  work.
- **Angular and dependencies.** A 19 → 20 major, Material 20's theming API, TS 5.6 → 5.8,
  `@alfresco/adf-core` 9.2 arriving as a new dependency tree, and a second HTTP stack
  (`hxcs-js-client`) alongside our `HttpClient` and its auth interceptor.
- **Gates.** `coverage-thresholds.json` gates 20 projects, and since the 6 August denominator fix an
  unloaded source file counts as fully uncovered rather than vanishing from the denominator.
  Vendored components that nobody writes specs for **drag their project below its floor and fail CI
  mechanically** — a consequence that did not exist when this analysis was first written. And
  `eslint.config.mjs:64-94` would need a new tag and rule for a third-party UI layer, or ADF HX gets
  imported straight into `scope:features` and the 4-layer model stops meaning anything.
- **The agent runtime, chat panel and widget registry — stated plainly, because it is the part most
  likely to be skipped.** The risk is not that ADF HX breaks the agent. It is that **the registry's
  central safety property cannot survive an ADF HX component**, and the opposition is in the type
  signatures rather than in the integration work.
  - The widget rule is _"props are identifiers, never content"_
    (`libs/shared/agent-client/src/lib/agent-widget.ts:28-32`), and `documentListWidget` passes
    `docIds` so the **viewer's** browser re-reads each uid under the **viewer's** session, letting
    Nuxeo apply ACLs per read (`apps/nuxeo-ui/src/app/agent-widgets.ts:33-46`).
    `HxpDocumentListComponent` takes `documents: Document[]` — **fully materialised content objects**.
    Mounting it from a tool call means the gateway shipping document bodies through a model tool
    result into a component input. That is the exact inversion the registry exists to prevent, and
    it is the component's input signature rather than a configuration choice.
  - `MAX_WIDGET_DOCUMENT_IDS = 25` (`agent-widget.ts:245`) and `exactProps`'s refusal of undeclared
    keys (`:273`) both assume a prop surface we author. Neither is expressible over a third-party
    `@Input` set.
  - `inputs` translates validated props into named inputs rather than spreading them, so a component
    gaining an input does not become agent-reachable until someone writes it in. Mechanically that
    survives — but an ADF HX component gains inputs on **their** release train, so the review that
    gives the property meaning moves to a repository we do not own.
  - **The gateway itself is untouched.** `eslint.config.mjs:64` gives `scope:agent-gateway`
    `onlyDependOnLibsWithTags: []`, and ADF HX is a browser package. That boundary holds.

**4. Effort, in the plan's engineer-day convention.** Quoted only for paths not already refused; all
pre-discovery.

| Work                                                                                   | Days              | Reasoning                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Confirm installability — obtain `read:packages`, resolve, `npm pack`, read the tarball | **0.5–1**         | Still the cheapest unblocking action available, and still not done two months on                                                                                                                                                                                                                     |
| Angular 19 → 20, Material 20, TS 5.8 across the workspace                              | **25–40**         | 13 feature libs + 7 shared libs + 2 apps. Material 20's theming API is the long pole and interacts with the Satori override file. The repo's own precedent for a cross-cutting design change is the 400px pass at 1–2 days per component that did not compress (`docs/beta-engineering-plan.md:177`) |
| Satori 0.1.5 → 0.2.0 and re-derive the overrides                                       | **8–15**          | 284 lines, each block documenting a specific Satori internal; `ViewEncapsulation.None` means failures are visual rather than compile-time and need per-screen verification                                                                                                                           |
| Evaluation spike — one component in an isolated Angular 20 harness against our Nuxeo   | **8–12**          | Only if installability confirms. Ring-fence it; do not let it become adoption by accident                                                                                                                                                                                                            |
| Productised Nuxeo adapter                                                              | **100–130**       | Unchanged from §4.3 (20–26 engineer-weeks), and it still delivers no screen until Wave 3                                                                                                                                                                                                             |
| Replacing `browse` with their components                                               | **Not estimable** | Wave 3 has not started and the post-Wave-3 component contract is unknown. A number here would be invented                                                                                                                                                                                            |

**Total prerequisite before the first ADF HX pixel renders Nuxeo data: 130–190 engineer-days**, gated
on a Wave that has not started — against a Beta plan with A6, A8, A9, B2, C2 and C3 still pending.

**5. What is a product or commercial call, not an engineering one.**

1. **Whether anyone will spend twenty minutes obtaining `read:packages`.** Top-listed as the cheapest
   action since 6 August and still open. It has stopped being a technical question: if nobody will
   spend twenty minutes, nobody will spend 130 days.
2. **Who owns `@hxp/content-adapter-nuxeo`, who funds it, and where it lives.** Unchanged. CSX has
   descoped Nuxeo productisation and we remain the only team who can keep their "proven at N = 2"
   claim true.
3. **Whether the Angular 19 → 20 upgrade is funded.** If not, component adoption is decided by
   default — and it now costs more than in the prior analysis, because the repository has four more
   feature libraries.
4. **Whether `AuthPort` will admit an ambient credential.** Sharper than when the gaps report was
   written: under an `HttpOnly` cookie the application is not permitted to read the credential, so
   this is not a preference between encodings. Either CSX takes gap-report item 1, or Nuxeo is
   permanently outside the contract's auth model.
5. **Whether DAM is ever in scope for their library.** Still unanswered; a "no" permanently caps
   adoption at roughly half of this product.
6. **Whether the CSX-592 branch is retained.** Asked on 5 August, unanswered. Cheap to answer, and
   low value to us — the teardown already lives here.
7. **Whether we say out loud that `content-ports` has no consumer.** See §C.3. This is a
   documentation-honesty call with an audience beyond engineering.

## C. What actually changed — on our side, not theirs

The integration surface grew substantially since 6 August, and every direction it grew in is one ADF
HX does not go.

### C.1 An agent gateway and a three-registry generative-UI layer

- **`apps/agent-gateway`** — 37 non-spec TypeScript files, 7,634 lines, **33 registered tools**
  (`nuxeo.*` document, search, workflow, audit and collection operations; `ai.*` assists; `kd.*` /
  `ke.*` Content Intelligence; and four frontend tools `navigateTo`, `selectDocuments`,
  `applyMetadata`, `confirmAction`). Gated at **95% lines / 95% functions** in
  `coverage-thresholds.json`, the highest floor in the repository.
- **Three registries, not one.** `apps/nuxeo-ui/src/app/app.config.ts` binds
  `provideAgentWidgets(documentListWidget, documentCardWidget)` (`:102`),
  `provideAgentFormComponents(documentMetadataForm)` (`:114`) and
  `providePageTiles(recentlyEditedTile, tasksListTile, favoritesTile)` (`:116`). The page-builder
  analysis §5 predicted a third registry as the correct response to a prop-rule collision; it has
  shipped.
- **`libs/features` is now 13 libraries, ~35,700 lines, 57 components** (recounted 8 Aug), up from
  9 / 32,667 / 49 on 6 August. The new ones — `document-lists`, `dashboard-tiles`, `page-builder`,
  `page-viewer` — are composition and agentic surfaces with **no counterpart in ADF HX at all**.
  **So §3.3's "a quarter to a third replaceable" has gone down, not up:** the denominator grew by
  roughly 3,000 lines in areas the library does not cover.

  `UNVERIFIED:` whether `page-builder`, `page-viewer` and `dashboard-tiles` are complete or
  mid-landing. They postdate the 7 August page-builder analysis that recorded their absence, they
  are untracked by git, and another session may be editing them. _Settled by:_ re-counting once that
  work is committed.

### C.2 Gates that constrain a large third-party dependency

`eslint.config.mjs:64-94` carries real `depConstraints` — `type:port-contract` may depend on no
workspace library, `type:content-adapter` only on the contract and the data-access layer,
`scope:features` / `type:ui` / `type:data-access` may not depend on an adapter at all, and
`scope:agent-gateway` may depend on nothing. `coverage-thresholds.json` gates 20 projects against
honest denominators. Both are new teeth since the original analysis and both bite an adoption, as
described in §B.3.

### C.3 `content-ports` / `content-adapter-nuxeo` — a demonstration, not a seam

Asked to be blunt about whether this boundary is a genuine seam that could receive a different
component layer. It is not, and the evidence is unambiguous.

**Nothing consumes it.** A repository-wide search for `@agentic-ui/shared/content-ports` and
`@agentic-ui/shared/content-adapter-nuxeo` outside those two libraries returns **no matches** — not
in `libs/features`, not in `libs/shared/ui`, not in `apps/nuxeo-ui`. No `DOCUMENT_PORT`,
`SEARCH_PORT`, `PERMISSIONS_PORT`, `UPLOAD_PORT` or `AUTH_PORT` token is injected anywhere in the
product. `provideNuxeoContentAdapter()` is exported
(`libs/shared/nuxeo-client/content-adapter-nuxeo/src/lib/provide-nuxeo-content-adapter.ts:20`) and
**never called**; its only references outside its own library are in `AGENTS/00-architecture.md` and
`docs/csx-447-port-gaps.md`. Every screen still calls `libs/shared/nuxeo-client` directly.

**What that means for this question.** The boundary was built to establish whether a different
component layer could be swapped in. It cannot answer that, because **it has never carried a single
component.** The ports are a conformance artefact and a negotiating position with CSX — which is
what they were commissioned as, and at that they succeeded: they produced the eight evidenced
contract asks in `docs/csx-447-port-gaps.md`, which reading alone would not have produced. But they
are **not** a load-bearing seam that reduces the cost of adopting ADF HX. An adoption would still
build the wiring from scratch, and would additionally discover whatever the ports get wrong the
first time a real component renders through them.

The lint rules are weaker evidence than they appear for the same reason: a `notDependOnLibsWithTags`
rule that nothing violates because nothing imports the target has not been tested by real pressure.

**Reported as a contradiction rather than resolved.** `docs/adf-hx-vs-nuxeo-satori-decision.md:284`
and `AGENTS/00-architecture.md:85-93` describe this boundary in language a reader can reasonably take
as in-service — "feature code injects the port tokens", "only the application composition root may
bind a backend adapter". Both sentences describe the _rule_ accurately and the _traffic_ not at all.
Nothing here says which framing should win; that is §B.5 item 7.

## D. What I could not verify

- `UNVERIFIED:` whether `@alfresco/adf-hx-content-services@0.0.8` is resolvable from GitHub Packages
  by a Hyland identity outside HFA. _Settled by:_ anyone with `read:packages` on the `Alfresco` org
  running `npm view @alfresco/adf-hx-content-services --registry=https://npm.pkg.github.com`. The
  available token carries `gist, read:org, repo, workflow`; the API returns 403 naming the missing
  scope.
- `UNVERIFIED:` whether the published tarball differs from the source on `develop` — specifically
  whether `hxp-lib-packager` rewrites the `"dependencies": {}` manifest at publish time. _Settled
  by:_ `npm pack` on the resolved package. This matters: if the packager injects real dependencies,
  B17 is a source-tree artefact rather than a shipping defect.
- `UNVERIFIED:` whether Wave 3 is funded or scheduled. No Wave work has merged; the only CSX-447
  merge in 30 days is a documentation consistency fix. _Settled by:_ CSX.
- `UNVERIFIED:` whether `feature/CSX-592-genUI` is deleted after the PR auto-closes (~2 September
  2026). _Settled by:_ re-checking the branch ref after closure.
- `UNVERIFIED:` gate behaviour is read from configuration, not observed. `review:preflight` and the
  test suite were deliberately not run for this assessment.

### Sources for this section

`Alfresco/hxp-frontend-apps` (private), read via the GitHub API on **8 August 2026**: `develop` root
`package.json` and `.npmrc`; the library's `package.json`, `project.json`, `ui/src/index.ts` and
`ui/src/lib/components/document-list/document-list.component.ts`; branch ref
`feature/CSX-592-genUI`; PRs [#17239](https://github.com/Alfresco/hxp-frontend-apps/pull/17239),
[#18189](https://github.com/Alfresco/hxp-frontend-apps/pull/18189),
[#18232](https://github.com/Alfresco/hxp-frontend-apps/pull/18232),
[#18309](https://github.com/Alfresco/hxp-frontend-apps/pull/18309) and
[#18708](https://github.com/Alfresco/hxp-frontend-apps/pull/18708) with the #17239 issue timeline;
GitHub code search for `@hylandsoftware/hxcs-js-client` and the DAM/agent term sweep;
`orgs/Alfresco/packages` (403). **npm:** `registry.npmjs.org/@alfresco/adf-hx-content-services` (404).

**This repository, `beta-delivery`:** `package.json`, `eslint.config.mjs`, `coverage-thresholds.json`,
`tsconfig.base.json`, `apps/nuxeo-ui/src/app/app.config.ts`, `apps/nuxeo-ui/src/app/agent-widgets.ts`,
`apps/nuxeo-ui/src/styles/_satori-overrides.scss`,
`apps/agent-gateway/src/{tools,identity}/*`, `libs/shared/agent-client/src/lib/agent-widget.ts`,
`libs/shared/nuxeo-client/content-ports/**`, `libs/shared/nuxeo-client/content-adapter-nuxeo/**`,
`libs/features/*`, `docs/beta-demo-runbook.md`.
