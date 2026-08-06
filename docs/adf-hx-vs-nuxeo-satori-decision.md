# ADF HX Content Services vs. a Nuxeo Satori Library — Decision Document

> **Status:** Draft for review — pre-decision.
> **Audience:** Product, leadership and architecture review
> **Siblings:** [Nuxeo Satori Agentic Beta — Engineering Plan](https://hyland.atlassian.net/wiki/spaces/~71202090f2a61ef96d4f57a5104efe296c1f5b/pages/4230974026) · **Parent:** [Nuxeo Satori Beta — Product Overview](https://hyland.atlassian.net/wiki/spaces/~71202090f2a61ef96d4f57a5104efe296c1f5b/pages/4231594134)
> **Children:** [ADF HX for Beta — Practical Feasibility Analysis](https://hyland.atlassian.net/wiki/spaces/~71202090f2a61ef96d4f57a5104efe296c1f5b/pages/4231594491) · [A Greenfield Nuxeo ECM + DAM Application on ADF HX](https://hyland.atlassian.net/wiki/spaces/~71202090f2a61ef96d4f57a5104efe296c1f5b/pages/4230974594)

> **Revised twice on 6 August 2026.** Version 1 stated that the abstraction layer and the Nuxeo adapter did not exist, and that a minor Angular bump was the only version friction. Both were wrong. Version 3 adds three further corrections: ADF HX has **no DAM surface at all**, which is a first-order finding for an ECM _and DAM_ product; the abstraction branches are not merely parked but **conflicting and decaying**; and the RFC is **being actively edited**, so no artifact authoritatively states the port contract. The recommendation is unchanged throughout, but the reasoning is now much stronger.

---

## 1. The decision

Track B of the Beta plan proposes extracting our `libs/` into a publishable Nuxeo Satori component library, shaped behind a `satori-content`-style abstraction.

There is an alternative: adopt Hyland's existing `@alfresco/adf-hx-content-services` library and the backend-agnostic architecture being designed around it, rather than building our own.

This document establishes what that alternative actually is today, what it would cost, and what we recommend.

The short version: the strategic direction is right and we should align to it now at the contract level, but the thing we would need to depend on is decaying on unmerged draft branches and nobody owns carrying it to production. Adopting the components today would import HxPR coupling into a Nuxeo product, because their `@Input`s are still typed on the HxPR SDK. And the library has no DAM capability at all, which caps what it could ever do for us.

### Two questions, two child pages

These are separate paths and must not be blended:

- **Can this codebase adopt ADF HX?** — [ADF HX for Beta — Practical Feasibility Analysis](adf-hx-for-beta-analysis.md). Component-by-component mapping against our features, adapter effort for the migration case, eighteen catalogued blockers.
- **Should a brand new application be built on ADF HX?** — [A Greenfield Nuxeo ECM + DAM Application on ADF HX](adf-hx-greenfield-ecm-dam.md). Assumes nothing migrates. Several blockers evaporate under that framing, and the decisive ones get worse.

Where any of the three disagree on a fact, the more recent page cites its source and wins.

## 2. What ADF HX Content Services is today

`@alfresco/adf-hx-content-services`, version **0.0.8**, lives in the private `Alfresco/hxp-frontend-apps` monorepo (HFA) and is published through their internal packager.

It is a substantial, real library:

- 61 Angular components and directives, around 59 services
- UI covering document list and tree, breadcrumb, document viewer, metadata sidebar, permissions, search filters, version management, and a content-action set (delete, share, copy, move, download, column management)
- Standalone Angular architecture, Storybook documentation, published via Nx
- A spec-to-source ratio of 1.49, which is genuinely good and worth saying plainly

### Version compatibility is worse than the manifest suggests

Its declared peer range is Angular `>=19.2.9`, but that range is misleading. The HFA monorepo builds and tests it against **Angular 20.3.25, Material 20.2.14, Satori UI 0.2.0 and TypeScript 5.8.3**, while we are on Angular 19.2, Material 19.2, Satori 0.1.5 and TypeScript 5.6.

npm would install the package without complaint, because our 19.2.20 satisfies `>=19.2.9` literally. But the compiled Angular partial-declaration format, the Material 20 theming API and Satori 0.2.0's component surface are all Angular-20-era. **Consuming it implies a major Angular upgrade on our side, not a patch bump.**

Note that this particular blocker is specific to _our_ codebase. A new application would simply start on Angular 20 and be better aligned than we could ever be — see the greenfield page.

### The central fact: it is an HxPR library

It is wired directly to the HXCS SDK. A repo-wide search returns **317 files importing** `@hylandsoftware/hxcs-js-client`. SDK types appear as `@Input` on UI components, and there is no internal boundary between what the library exposes and what HxPR happens to provide.

The most valuable component to us, `HxpDocumentListComponent`, declares `@Input() documents: Document[]` where `Document` is the HxPR SDK type. Rendering Nuxeo data through it today means SDK emulation — the approach RFC §3.2 and ADR-001 explicitly evaluated and rejected. Only Wave 3 changes this, and Wave 3 has not started; their own ledger calls it "the largest remaining slice".

Adoption also means taking `@alfresco/adf-core` wholesale — its data table, card view, viewer, translation and app-config machinery. Their document list is a wrapper over ADF's data table. This is the largest hidden cost in any adoption estimate.

### It has no DAM surface at all

This is a first-order finding and it was under-examined in earlier versions of this document.

A term sweep across all 861 files of the library returns **zero occurrences of** `thumbnail` — in any file type, including translations. Also zero for `lightbox`, `gallery`, `masonry`, `contactSheet`, `exif`, `iptc`, `xmp`, `watermark`, `embargo` and any bulk operation. There is no asset grid, no tile or gallery view, no contact sheet, no derivative or format handling, and no technical-metadata support. `image`, `video` and `audio` appear only in a mime-type icon map, some translation strings, and a file-type search filter.

Renditions do exist as a service, but they point away from DAM. The only consumer is the viewer, and it uses them for exactly one purpose: when ADF's viewer cannot handle a mime type, request `DEFAULT_RENDITION_ID` — the literal string `'pdfPreview'`. For types ADF _can_ render, including JPEG, PNG and MP4, it downloads the **full-resolution original** into a browser blob. A library built with DAM in view reaches for thumbnails first.

Two further artifacts confirm the intended domain. Their retention config defines `ViewMode = { Cases, Records }` — the library's notion of a view mode is cases versus records. And their mime-type config enumerates sixteen camera-raw formats, including `image/x-raw-hasselblad`, and maps every one to the same outcome: draw the `image` icon. The library knows what a Hasselblad raw file is and has nothing to do with it.

Their viewer takes **three inputs**. Ours takes **twenty-three, twelve of them media-specific**.

The owning team's own comprehensive self-assessment never mentions an asset, a rendition or a thumbnail, while being confident enough to list upload, pagination, scroll tracking and selection helpers as gaps.

**DAM is not absent because the library is immature. It is absent because DAM is not in their conception of the domain.** Since Nuxeo Satori is an ECM _and DAM_ product, this is a permanent gap rather than a timing one, and it caps the ceiling on what adopting their components could ever save us.

### Other known gaps, per Hyland's own assessment

The [ADF HX Content Services Library Assessment](https://hyland.atlassian.net/wiki/spaces/~61a51e0ad5986c006a1ec880/pages/3987440773) (1 April 2026) is candid about maturity, and its structural critique holds up well against the code four months on:

- No orchestration layer — no component combining tree, list, breadcrumb and filters
- **Upload is not in the library at all** — the token exists; nothing consumes it
- **No search-results component** — only filter widgets; the orchestrator still lives in their application
- **No aggregation or facet support anywhere**, which is worse than the report implies
- Missing pagination and selection utilities
- Exactly 12 API tokens must be configured before use
- Components are predominantly "smart", communicating through shared services rather than explicit bindings

The assessment also judges agent-driven composition of their components "feasible in controlled scenarios today". **Read that as a property of their library, not as something our agentic layer depends on.** The AG-UI agent runtime in Track A is a separate concern, unaffected by which content component library we adopt.

[CSX-494](https://hyland.atlassian.net/wiki/spaces/~61a51e0ad5986c006a1ec880/pages/4002718819) puts moving upload into the library at **7-10 weeks**, with an unresolved question about whether `HxpUploadService` can move at all. [CSX-495](https://hyland.atlassian.net/wiki/spaces/~61a51e0ad5986c006a1ec880/pages/4002718871) scopes the search orchestrator as feasible but Large.

### Two roadmaps, not reconciled

There are **two independent improvement plans** for the library, with different owners and no cross-reference: the Assessment's six steps (API hygiene, extract breadcrumbs and copy/move, content-list utilities, search orchestration facade, composition docs, an optional `<hxp-content-browser>`), and the CSX-447 hexagonal wave plan.

A full-text search of the RFC, the status ledger, all eight ADRs and the POC plan returns **zero references** to the assessment or any of its terms. The assessment never mentions ports or adapters.

The collision is live. On 5 August, the first roadmap moved a `search-results.component` into the library typed on the SDK `Document`, while the second roadmap's Wave 3 requires every such component retyped. Neither plan acknowledges the other. For any adopter, that means an unpredictable near-term API.

## 3. What the RFC would make it

[RFC CSX-447](https://hyland.atlassian.net/wiki/spaces/CSX/pages/4192241998) is a serious, high-quality piece of architecture work. It proposes making the library backend-agnostic through hexagonal ports and adapters, and it is explicit that the result is intended to become "the foundation for the Satori content surface".

The design defines a neutral `ContentNode` domain model and a port surface of `ContentPort`, `SearchPort`, `PermissionsPort`, `UploadPort`, `AuthPort`, `PrincipalPort`, plus `DownloadPort` and `ModelPort`. Adapters are the only code allowed to import a backend SDK, with Nx lint tags enforcing the boundary. Five embedded ADRs cover the pattern, operation-shaped permissions, hybrid search, named-capability enrichments, and the open property bag.

That eight-port surface is the RFC's proposal, not the built artifact — read the drift note below before designing against it.

Critically for us, **the design was validated against Nuxeo**. A POC built both HxPR and Nuxeo adapters, mounted one component on two routes differing only by adapter provider, and met every acceptance criterion including no SDK type appearing outside adapter packages. The POC even found that Nuxeo's wider permission model drove the port design rather than being forced into an HxPR shape.

### It is built — but unmerged, conflicting, and decaying

Version 1 of this page said none of this existed. That was wrong. It was true of `develop` and false of the repository.

The abstraction layer and a working Nuxeo adapter both exist, on two open draft pull requests:

- [#18189 CSX-447 CSX abstraction layer](https://github.com/Alfresco/hxp-frontend-apps/pull/18189) — 434 files, containing `libs/content-abstraction`, `libs/content-adapter-hxpr` and `libs/content-adapter-nuxeo`
- [#18232 CSX-447 Preliminary abstraction-layer research and POC](https://github.com/Alfresco/hxp-frontend-apps/pull/18232) — 203 files

Both were last updated **13 July 2026**. Since then `develop` has moved nearly 400 commits ahead, and **both PRs now report a conflicting merge state**. The branch also pins the HxPR SDK at 2.0.9 against develop's 2.0.111. So this is not merely parked — it is decaying, and the longer it sits the more expensive the rebase becomes.

Two consequences follow. First, a Nuxeo adapter already exists as working source with tests — roughly 1,300 lines with 975 lines of specs — which materially reduces the cost of owning one. The shape is proven against our backend rather than hypothetical.

Second, and more awkwardly, **no single artifact states the current contract.** The branch code has five ports (`auth`, `document`, `permissions`, `search`, `upload`), with `ContentPort` still named `DocumentPort` and `DownloadPort`, `ModelPort` and `PrincipalPort` having no code at all. The in-repo markdown RFC also names five. But the Confluence RFC names eight — and it is at **version 88, last edited 3 August 2026**, so it is being actively developed and has moved _ahead_ of the code, even as the team's own status ledger declares itself the frozen living record and the RFC a point-in-time proposal.

The design document and the implementation are drifting apart in both directions, with neither authoritative. Building against either in isolation is a guess. This is why the plan pins to a specific commit rather than to a document.

What remains accurate is the governance position: all nine ADRs are status Proposed with seven open decisions, Waves 0 through 4 have not landed on `develop`, and Nuxeo adapter **productization** is explicitly out of scope in RFC §2.4 and §7. CSX has not declined to build the adapter — they have built one and declined to productize it.

## 4. Where we stand

Our codebase is 9 feature libraries and 7 shared libraries: 79 components, 34 injectables, and a Nuxeo access layer of 26 services exposing 208 public methods across 135 REST paths and 25 Automation operations.

The overlap with ADF HX is narrower than it first appears.

**Genuinely overlapping** — the core ECM document surface: browse, document list and tree, breadcrumb, metadata, permissions, versions, search filters, content actions.

**Not covered by them at all** — the entire DAM surface (asset grid, thumbnails, picture views, video transcodes and storyboard, EXIF/IPTC, ARender, bulk ZIP download, collections-as-lightboxes, faceted asset search), Knowledge Discovery, Knowledge Enrichment, Content Lake ingestion, the AI assists, the proposed agentic layer, administration, trash lifecycle, collections, workflow, vocabularies and Nuxeo Drive.

Measured by lines of code, their components could plausibly replace **a quarter to a third** of `libs/features`, concentrated in `browse`, with partial coverage of `document-detail` and `search`. **It would not touch the part that makes the product interesting.**

## 5. Options

### Option A — Stay the course, build our own library

Proceed with Track B as written. Fastest to Beta and fully under our control, but it means Hyland maintains two content component libraries — precisely the divergent fork the RFC exists to prevent — and it risks a later mandate to migrate anyway, after we have paid to build and stabilise our own.

### Option B — Contract alignment now, adoption deferred

Keep building our own components, but shape our abstraction boundary to their real port surface rather than a vague `satori-content` guess. Take the contracts from the port library on [#18189](https://github.com/Alfresco/hxp-frontend-apps/pull/18189) at a **pinned commit** — `DocumentPort`, `SearchPort`, `PermissionsPort`, `UploadPort`, `AuthPort` — not from either RFC artifact, since neither matches the code. Nuxeo REST access is confined to adapter-shaped code behind them.

Cost is close to zero, because Track B task B1 already commits to defining an abstraction boundary. This just replaces an invented shape with the real one. If the abstraction lands, our migration becomes an adapter swap. If it stays parked, we have lost nothing and gained a cleaner architecture.

### Option C — Full adoption now

Consume their components, productize `@hxp/content-adapter-nuxeo`, and replace our feature UI.

Maximum strategic alignment, and the only option that stops us maintaining a second library. But it stacks dependencies that are each individually unresolved: an abstraction layer on a conflicting draft PR, ADRs at Proposed, no upload, no search results, no aggregations, a major Angular upgrade, and `adf-core` adopted wholesale.

Two are decisive. Their component `@Input`s are still typed on the HxPR SDK, so rendering Nuxeo data through them today means the SDK emulation ADR-001 rejected; only Wave 3 fixes that and Wave 3 has not started. And **the library has no DAM surface**, so roughly the whole DAM half of the product stays ours regardless.

### Option D — Staged: Option B now, with a decision gate

Do Option B for Beta. Simultaneously open the adapter-ownership question and the fate of the two stalled PRs with CSX and architecture. Reassess component adoption at a defined gate.

## 6. Recommendation

**Option D.** Adopt their contracts now, defer their components to a gate.

The direction is right and we should not build against a shape we know will be superseded. But Option C's blockers are structural rather than schedule-driven: SDK-typed component inputs until Wave 3, an Angular 20 gap, and no DAM capability at all. None is fixed by working harder, and the last is not fixable by them at all if DAM is outside their scope.

Option B costs essentially nothing beyond work Track B had already committed to, and it converts a future migration from a rewrite into an adapter swap. The important refinement is **where the contracts come from**: pin to the port library on the branch, not to either RFC.

There is also a case for actively pursuing the adapter rather than waiting. Their POC used Nuxeo specifically to prove the port surface was not accidentally HxPR-shaped, and the resulting adapter is real working source with tests. Their architecture's central validation claim depends on a second adapter nobody is maintaining. We are the only team who can make that claim durable, and that is leverage.

## 7. Owning the Nuxeo adapter

We treat it as settled that if ADF HX is to serve Nuxeo, we own the adapter. The question is what that costs and where it lives.

For the **migration case**, 20-26 engineer-weeks to production grade. For a **greenfield application**, 33-54 — roughly double, because a migration can adopt the adapter for core ECM and keep its own DAM data layer, whereas a greenfield app has the adapter as its entire data layer on the critical path from day one.

Their existing adapter is around 1,300 lines with 975 lines of specs, and **every Nuxeo call it makes is one our services already make** — 23 of 28 substantive port methods are satisfiable from existing service methods. This is re-homing and hardening, not a green-field build.

The critical framing: **the adapter is not the expensive part of adoption.** Wave 3 and the Angular 20 upgrade are. Building the adapter before Wave 3 exists produces a component with no consumer.

Open sub-questions: does it live in HFA (their monorepo, their release train, requiring commit rights and review capacity from a team that has descoped the work) or in our repo (easier for us, but then it is not really part of their architecture)? Who funds it? And does owning it buy us a seat in the port-surface design?

## 8. Risks

- **Deciding nothing is itself a decision.** Every sprint we build our own components deepens a second library that may later have to be thrown away.
- **ADF HX has no DAM surface and its owners are not building one.** For an ECM _and DAM_ product this is a permanent gap, not a timing one, and it caps the value of any adoption.
- **The abstraction is not just stalled, it is decaying.** Both PRs are static since 13 July, now conflicting, and nearly 400 `develop` commits behind. All nine ADRs remain at Proposed.
- **There is no authoritative statement of the port contract.** The Confluence RFC is actively edited (v88, 3 August) and has moved ahead of the code; the in-repo RFC disagrees with it; the ledger claims to supersede both. Whatever we align to must be a pinned commit, not a document.
- **Two unreconciled roadmaps** mean the library's near-term API is genuinely unpredictable.
- **The Angular 20 gap is a project in its own right**, and if it is not funded, component adoption is decided by default.
- **Adopting the components means adopting** `@alfresco/adf-core` wholesale. The largest hidden cost in any adoption estimate.
- **Their release train is not ours.** A v0.0.8 library in a private monorepo becomes a hard external dependency on our critical path.
- **CSX bandwidth.** Of the forty most recently merged HFA PRs, the overwhelming majority are unrelated product work; two are CSX-tagged.
- **Upload and search results are genuinely unresolved on their side**, both with active but unmerged PRs.

## 9. What changes in the Beta plan

One existing task changes and two are added. Nothing is removed, and the critical path does not move.

- **B1 is re-specified.** Define interfaces matching the port library on #18189 at a pinned commit — `DocumentPort`, `SearchPort`, `PermissionsPort`, `UploadPort`, `AuthPort` — over their neutral domain model, with Nuxeo REST access confined behind them and Nx lint tags enforcing the boundary. Pin to the branch, not either RFC. Same effort, better target. Re-check the pin when the task starts: the branch may have been rebased, merged or abandoned.
- **B2 gains a constraint.** Keep ports and adapter in separate entry points, so a future swap is a dependency change rather than a refactor.
- **New B4: adapter ownership engagement.** Confirm package installability from GitHub Packages, open the ownership and funding question with CSX and architecture, and record the reassessment gate.

## 10. Open questions for leadership

Detailed engineering questions are in the two child pages. The ones needing a leadership answer:

1. **Is DAM in scope for** `adf-hx-content-services`, ever? This should be asked of CSX directly. A "no" is a perfectly respectable answer and would settle the ceiling on adoption permanently.
2. **Is the Angular 19 to 20 upgrade in Beta scope?** If not, component adoption is decided by default.
3. **What happens to the two conflicting PRs, and is Wave 3 funded?** Without Wave 3 the components stay SDK-typed and cannot render Nuxeo data without the SDK emulation ADR-001 rejects.
4. **Who funds the adapter — 20-26 weeks for migration, 33-54 for greenfield — and where does it live?**
5. **Do we accept a cross-repo dependency on HFA's release train** for a product shipped as a Nuxeo marketplace package to OnPrem customers?
6. **Should we seek review or approver status on RFC CSX-447?** We are the second backend it is designed against and are not currently listed.
7. **What is the gate for reassessing component adoption** — abstraction merged, Wave 3 funded, ADRs accepted, roadmaps reconciled, adapter owned? Any date-based gate without those conditions will be met with "not yet".
8. **Is there an expectation from CIC leadership** that Nuxeo Satori converges on the Satori content surface within a stated timeframe? That would change the recommendation from Option D toward Option C.
9. **If a Nuxeo product needs DAM and ADF HX will not serve it, where should a Hyland DAM component library live?** Building one inside their library and building one outside it are both defensible; drifting into the second by accident is not.

---

### References

- [ADF HX Content Services Library — Assessment & Evolution Report](https://hyland.atlassian.net/wiki/spaces/~61a51e0ad5986c006a1ec880/pages/3987440773)
- [CSX-494: Feasibility — Moving the Upload Feature](https://hyland.atlassian.net/wiki/spaces/~61a51e0ad5986c006a1ec880/pages/4002718819)
- [CSX-495: Feasibility — Moving the Search Orchestrator](https://hyland.atlassian.net/wiki/spaces/~61a51e0ad5986c006a1ec880/pages/4002718871)
- [RFC - Backend-Agnostic Content Component Library and Workspace (CSX-447)](https://hyland.atlassian.net/wiki/spaces/CSX/pages/4192241998) — version 88, edited 3 August 2026
- [ADR-001 Adopt Hexagonal Ports & Adapters](https://hyland.atlassian.net/wiki/spaces/CSX/pages/4192112470)
- [Towards a backend agnostic satori-content library](https://hyland.atlassian.net/wiki/spaces/CSX/pages/4040786492)
- [Value Proposition: satori-content Library](https://hyland.atlassian.net/wiki/spaces/~rpaterson/pages/4211639817)
- [PR #18189 — CSX-447 CSX abstraction layer](https://github.com/Alfresco/hxp-frontend-apps/pull/18189) (draft, conflicting, static since 13 Jul 2026)
- [PR #18232 — CSX-447 abstraction-layer research and POC](https://github.com/Alfresco/hxp-frontend-apps/pull/18232) (draft, conflicting, static since 13 Jul 2026)
- `Alfresco/hxp-frontend-apps`, `libs/adf/enterprise/adf-hx-content-services` (private)
