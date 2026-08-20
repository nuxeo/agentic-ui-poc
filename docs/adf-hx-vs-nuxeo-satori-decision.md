# ADF HX Content Services vs. a Nuxeo Satori Library — Decision Document

> **Status:** Draft for review — pre-decision.
> **Audience:** Product, leadership and architecture review
> **Siblings:** [Nuxeo Satori Agentic Beta — Engineering Plan](https://hyland.atlassian.net/wiki/spaces/~71202090f2a61ef96d4f57a5104efe296c1f5b/pages/4230974026) · **Parent:** [Nuxeo Satori Beta — Product Overview](https://hyland.atlassian.net/wiki/spaces/~71202090f2a61ef96d4f57a5104efe296c1f5b/pages/4231594134)
> **Children:** [ADF HX for Beta — Practical Feasibility Analysis](https://hyland.atlassian.net/wiki/spaces/~71202090f2a61ef96d4f57a5104efe296c1f5b/pages/4231594491) · [A Greenfield Nuxeo ECM + DAM Application on ADF HX](https://hyland.atlassian.net/wiki/spaces/~71202090f2a61ef96d4f57a5104efe296c1f5b/pages/4230974594) · [CSX-447 content ports — consumer report from the Nuxeo Satori team](csx-447-port-gaps.md)

> **Revised three times on 6 August 2026.** Version 1 stated that the abstraction layer and the Nuxeo adapter did not exist, and that a minor Angular bump was the only version friction. Both were wrong. Version 3 added three further corrections: ADF HX has **no DAM surface at all**, which is a first-order finding for an ECM _and DAM_ product; the abstraction branches are not merely parked but **conflicting and decaying**; and the RFC is **being actively edited**, so no artifact authoritatively states the port contract. **Version 4 is the first written after building the thing.** The port contract and a Nuxeo adapter now exist in this repository, pinned to their commit, and §1.1 records what that measurement produced — including one finding, on `AuthPort`, that materially qualifies the RFC's central validation claim. The recommendation is unchanged throughout, but for the first time it rests on code rather than on reading.

> **Version 5 — 7 August 2026, one correction, recommendation unchanged.** The Angular 20.3 / Material 20.2 / Satori 0.2.0 figures in §2 were stated as properties of "the library". They are properties of the **`develop`** branch, and the HFA branch carrying the generative-UI PoC is on Angular 19.2.20 / Material 19.2.19. §2 now draws that distinction. **The conclusion those figures support — that we cannot consume their component library without a major Angular upgrade — is unaffected and stands.** Source: [CSX Generative UI PoC — Teardown](csx-generative-ui-teardown.md) §6.

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

### 1.1 What we learned by building it

Since version 3 we have stopped reading the port contract and built it. Two Nx projects now exist in this repository: `content-ports`, a shape-for-shape copy of their five ports pinned to commit `61eb45bf0e94df3fd3a62e8efd21af8ec535451e`, and `content-adapter-nuxeo`, a working implementation of all five against our production Nuxeo services. That produced three findings that belong at the top of this page rather than in an appendix.

**About 12% of our content surface can sit behind the shared contract.** The five ports declare **26 methods** in total. `libs/shared/nuxeo-client` is **26 services exposing 217 public methods** across 135 REST paths and 25 Automation operations. That is **12.0%**, and it is now the sharpest available answer to the question this whole document exists to inform: how much of this product could a shared content abstraction actually serve?

The honest reading is slightly narrower still. Four of the 26 are `capabilities()` descriptors rather than content operations, `getAccessToken` is unimplementable here (see below) and `getWithRendition` is unimplementable over Nuxeo at all — so **20 methods, about 9%, do real work**. We use 12% as the headline because it is the like-for-like comparison of declared surface against declared surface.

**This does not contradict the "quarter to a third" figure in §4, and the two must not be blended.** They measure different things in different units, and both are still true:

- **12% is a data-layer measurement**, counting API methods. It answers "how much of our Nuxeo access can be expressed in their neutral vocabulary?"
- **A quarter to a third is a UI measurement**, counting lines of code in `libs/features`. It answers "how much of our component code could their components replace?"

The UI figure is larger because a single port method backs a lot of UI. `DocumentPort.listChildren` plus `SearchPort.runNamedQuery` is two methods, and between them they underpin the entire browse experience — tree, list, breadcrumb, pagination — which is a large fraction of `libs/features/browse` by line count. Conversely, the long tail of our data layer (tags, tasks, workflow, vocabularies, audit, Drive, ARender, Content Lake) is many methods each backing comparatively little UI. So the same architecture is simultaneously **well matched to the core ECM browse surface** and **unable to reach most of our API surface**. Both statements are load-bearing, and quoting either one alone misleads.

**Their `AuthPort` cannot represent how this product authenticates, and their own Nuxeo adapter does not use it.** `AuthPort` is `getAccessToken(): Promise<string>` — the application hands the adapter a bearer token per request. We are same-origin with Nuxeo, authenticated by a SAML session cookie in production and by a Basic-auth interceptor in development. There is no token to hand over.

We checked their reference adapter before drawing a conclusion, and the finding survived the check in a stronger form than we expected. Their `NuxeoAuthAdapter` returns a complete `Authorization` header value — `Basic` plus base64 of the `Administrator`/`Administrator` credentials in `DEFAULT_NUXEO_CONFIG` — from a method named `getAccessToken`, and **nothing in their adapter calls it**. Its own comment says the transport builds its own header and "does not depend on this method"; we grepped the package at the pinned commit and confirmed there is no caller. Their POC ran cross-origin against `localhost:8080` with static Basic credentials and Nuxeo's CORS filter opened by hand.

That matters because the RFC's central validation claim is that the ports were proven at N = 2 by building a Nuxeo adapter. For four of the five ports that claim holds up well, and the Nuxeo adapter genuinely did shape the permissions model. For `AuthPort` it does not: the port was never exercised, and the one auth topology Nuxeo actually ships in production — same-origin, cookie-session, credentials attached outside the client library — has no representation in the contract. RFC §5.2's statement that the "Nuxeo adapter wires its own client to the same `AuthPort`" is not true at the pinned commit.

This is a fixable contract gap, not a reason to walk away. But it is the clearest evidence yet that being the second backend in a design is not the same as being designed for, which is the argument for seeking review status on the RFC rather than waiting to consume its output.

**Seven further gaps, and eight in total, are catalogued in [CSX-447 content ports — consumer report from the Nuxeo Satori team](csx-447-port-gaps.md)**, written to be sent to CSX. The largest by product impact is that `SearchResultPage<T>` cannot carry aggregation buckets, which keeps our entire faceted-search and DAM surface off `SearchPort`.

## 2. What ADF HX Content Services is today

`@alfresco/adf-hx-content-services`, version **0.0.8**, lives in the private `Alfresco/hxp-frontend-apps` monorepo (HFA) and is published through their internal packager.

It is a substantial, real library:

- 61 Angular components and directives, around 59 services
- UI covering document list and tree, breadcrumb, document viewer, metadata sidebar, permissions, search filters, version management, and a content-action set (delete, share, copy, move, download, column management)
- Standalone Angular architecture, Storybook documentation, published via Nx
- A spec-to-source ratio of 1.49, which is genuinely good and worth saying plainly

### Version compatibility is worse than the manifest suggests

Its declared peer range is Angular `>=19.2.9`, but that range is misleading. **On the HFA `develop` branch, observed 7 August 2026,** the monorepo builds and tests it against **Angular 20.3.25, Material 20.2.14, Satori UI 0.2.0 and TypeScript 5.8.3**, while we are on Angular 19.2.20, Material 19.2, Satori 0.1.5 and TypeScript 5.6.

npm would install the package without complaint, because our 19.2.20 satisfies `>=19.2.9` literally. But the compiled Angular partial-declaration format, the Material 20 theming API and Satori 0.2.0's component surface are all Angular-20-era. **Consuming the published library implies a major Angular upgrade on our side, not a patch bump.** That conclusion is unchanged and remains the operative one for any adoption decision.

Note that this particular blocker is specific to _our_ codebase. A new application would simply start on Angular 20 and be better aligned than we could ever be — see the greenfield page.

#### The figures above are `develop`'s, and one HFA branch does not share them

> **Correction, 7 August 2026.** Earlier versions of this section stated the Angular 20.3 / Material 20.2 / Satori 0.2.0 figures as a property of "the library" without naming a branch. They are a property of **`develop` as of 7 August 2026** and are correct for it. They are **not** true of every HFA branch, and the exception matters to a decision now in front of us.
>
> The generative-UI PoC branch `feature/CSX-592-genUI` (head `c02c4e60`, 3 June 2026) sits on **Angular 19.2.20 and Material 19.2.19** — the same Angular minor we are on. Its merge base `a4378855` is dated 29 May 2026 and predates HFA's Angular 20 upgrade; `develop` has moved 933 commits ahead since.
>
> **What this changes and what it does not.** It does **not** weaken the conclusion above: we still cannot consume `@alfresco/adf-hx-content-services` as published from `develop` without an Angular 19 → 20 upgrade, and every adoption cost in this document stands. What it removes is a different and narrower barrier — the Angular gap is **not** a reason we cannot _read and port the genUI design_, which is source we would reimplement against our own components rather than a package we would install. Being 933 commits behind makes that branch readable as a design document and unusable as a base to build on, which is a staleness constraint rather than a version one.
>
> The two must not be conflated. "We cannot consume their component library" is true. "The Angular gap blocks us learning from their generative-UI work" is not, and was never the claim this document made. Full evidence: [CSX Generative UI PoC (CSX-588 / CSX-592) — Teardown](csx-generative-ui-teardown.md) §6.

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

The assessment also judges agent-driven composition of their components "feasible in controlled scenarios today". **Read that as a property of their library, not as something our agentic layer depends on.** The AG-UI agent runtime in Track A is a separate concern, unaffected by which content component library we adopt. Their own generative-UI PoC reinforces this rather than qualifying it: examined 7 August 2026, it uses `@ag-ui/*` on the client only, at `^0.0.53` with a caret, and its Node agent service has no `@ag-ui/*` dependency at all — **so it validates none of the AG-UI features Track A depends on.** See [the teardown](csx-generative-ui-teardown.md) §6.

[CSX-494](https://hyland.atlassian.net/wiki/spaces/~61a51e0ad5986c006a1ec880/pages/4002718819) puts moving upload into the library at **7-10 weeks**, with an unresolved question about whether `HxpUploadService` can move at all. [CSX-495](https://hyland.atlassian.net/wiki/spaces/~61a51e0ad5986c006a1ec880/pages/4002718871) scopes the search orchestrator as feasible but Large.

### Two roadmaps, not reconciled

There are **two independent improvement plans** for the library, with different owners and no cross-reference: the Assessment's six steps (API hygiene, extract breadcrumbs and copy/move, content-list utilities, search orchestration facade, composition docs, an optional `<hxp-content-browser>`), and the CSX-447 hexagonal wave plan.

A full-text search of the RFC, the status ledger, all eight ADRs and the POC plan returns **zero references** to the assessment or any of its terms. The assessment never mentions ports or adapters.

The collision is live. On 5 August, the first roadmap moved a `search-results.component` into the library typed on the SDK `Document`, while the second roadmap's Wave 3 requires every such component retyped. Neither plan acknowledges the other. For any adopter, that means an unpredictable near-term API.

## 3. What the RFC would make it

[RFC CSX-447](https://hyland.atlassian.net/wiki/spaces/CSX/pages/4192241998) is a serious, high-quality piece of architecture work. It proposes making the library backend-agnostic through hexagonal ports and adapters, and it is explicit that the result is intended to become "the foundation for the Satori content surface".

The design defines a neutral `ContentNode` domain model and a port surface of `ContentPort`, `SearchPort`, `PermissionsPort`, `UploadPort`, `AuthPort`, `PrincipalPort`, plus `DownloadPort` and `ModelPort`. Adapters are the only code allowed to import a backend SDK, with Nx lint tags enforcing the boundary. Five embedded ADRs cover the pattern, operation-shaped permissions, hybrid search, named-capability enrichments, and the open property bag.

That eight-port surface is the RFC's proposal, not the built artifact — read the drift note below before designing against it.

Critically for us, **the design was validated against Nuxeo**. A POC built both HxPR and Nuxeo adapters, mounted one component on two routes differing only by adapter provider, and met every acceptance criterion including no SDK type appearing outside adapter packages. The POC even found that Nuxeo's wider permission model drove the port design rather than being forced into an HxPR shape. §1.1 qualifies this: it holds for four of the five ports and not for `AuthPort`.

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

Our codebase is 9 feature libraries and 7 shared libraries: 79 components, 34 injectables, and a Nuxeo access layer of **26 services exposing 217 public methods** across 135 REST paths and 25 Automation operations. (Earlier versions of this page said 208; 217 is the count verified against the code on 6 August.)

The overlap with ADF HX is narrower than it first appears.

**Genuinely overlapping** — the core ECM document surface: browse, document list and tree, breadcrumb, metadata, permissions, versions, search filters, content actions.

**Not covered by them at all** — the entire DAM surface (asset grid, thumbnails, picture views, video transcodes and storyboard, EXIF/IPTC, ARender, bulk ZIP download, collections-as-lightboxes, faceted asset search), Knowledge Discovery, Knowledge Enrichment, Content Lake ingestion, the AI assists, the proposed agentic layer, administration, trash lifecycle, collections, workflow, vocabularies and Nuxeo Drive.

Measured by lines of code, their components could plausibly replace **a quarter to a third** of `libs/features`, concentrated in `browse`, with partial coverage of `document-detail` and `search`. **It would not touch the part that makes the product interesting.** See §1.1 for why that figure and the 12% data-layer figure differ, and why quoting either alone is misleading.

### What actually sits behind a port

Now that the ports are built, this is no longer an estimate. Four of the five carry real traffic:

| Port              | Backed by                                                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `DocumentPort`    | `BrowseService` (path, root, update, move, copy), `NuxeoApiBase` (id, children, create, delete), `DocumentDetailService.getDocumentPermissions` |
| `SearchPort`      | `NuxeoApiBase.nxqlSearch` — NXQL only, no page providers                                                                                        |
| `PermissionsPort` | `DocumentDetailService` add/remove permission                                                                                                   |
| `UploadPort`      | `DocumentImportService` batch upload, one file at a time                                                                                        |
| `AuthPort`        | nothing — see §1.1                                                                                                                              |

### What stays direct Nuxeo access, and why

The other ~88% is not a backlog. Each of these is Nuxeo-specific for a structural reason, and no amount of adapter work moves it behind the current contract:

| Area                                                                                                       | Why it cannot sit behind the port                                                                                                            |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Faceted search and aggregations** — the search page, saved searches, DAM asset search                    | `SearchResultPage<T>` has no bucket field, so a mapping would silently drop the facet counts the UI exists to render. Gap 2.                 |
| **The whole DAM surface** — asset grid, `picture:views`, `vid:transcodedVideos`, EXIF/IPTC, contact sheets | No representation in the neutral domain model, and ADF HX has no DAM concepts to map onto.                                                   |
| **Blobs and renditions** — thumbnails, PDF previews, `fetchBlob`                                           | `RenditionRef.url` assumes a directly-fetchable URL; Nuxeo renditions need the session's auth headers. Both reference adapters throw. Gap 4. |
| **Versioning**                                                                                             | No port concept. `versions-of-document` exists as a named query but check-in, check-out and restore do not.                                  |
| **Locking**                                                                                                | No port concept.                                                                                                                             |
| **Publication**                                                                                            | No port concept.                                                                                                                             |
| **Comments, subscriptions, favourites**                                                                    | No port concept.                                                                                                                             |
| **Collections**                                                                                            | Outside the five ports. We declare a local `nuxeo:collection-members` named query for reads; membership writes stay direct. Gap 3.           |
| **Tags**                                                                                                   | Outside the five ports.                                                                                                                      |
| **Tasks and workflow**                                                                                     | Outside the five ports entirely — no process concept exists in the contract.                                                                 |
| **Directories and vocabularies**                                                                           | Outside the five ports.                                                                                                                      |
| **Users and groups**                                                                                       | `PrincipalPort` is in the RFC and has no code at the pinned commit.                                                                          |
| **Trash lifecycle**                                                                                        | We declare a local `nuxeo:trashed-children-of-folder` named query; untrash, purge and trash filters stay direct.                             |
| **Audit**                                                                                                  | No port concept.                                                                                                                             |
| **Administration**                                                                                         | Nuxeo-platform surface with no neutral equivalent.                                                                                           |
| **Nuxeo Drive**                                                                                            | Nuxeo-platform integration.                                                                                                                  |
| **ARender**                                                                                                | Third-party viewer integration.                                                                                                              |
| **Content Lake ingest**                                                                                    | Hyland Content Intelligence surface, outside content management altogether.                                                                  |
| **CSV and bulk import, bulk download and export**                                                          | `UploadPort` models a single file; there is no bulk or job concept. Gap 7 is the single-file case; bulk has no port at all.                  |

Three of these — faceted search, renditions and bulk — are gaps we are asking CSX to close. The rest are genuinely outside the scope of a neutral content contract and we would not expect them to move.

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

The direction is right and we should not build against a shape we know will be superseded. But Option C's blockers are structural rather than schedule-driven: SDK-typed component inputs until Wave 3, an Angular 20 gap against the `develop` branch we would consume from (§2), and no DAM capability at all. None is fixed by working harder, and the last is not fixable by them at all if DAM is outside their scope.

Option B costs essentially nothing beyond work Track B had already committed to, and it converts a future migration from a rewrite into an adapter swap. The important refinement is **where the contracts come from**: pin to the port library on the branch, not to either RFC. Building it (§1.1) confirmed the cost estimate and strengthened the case: alignment was cheap, and it bought us a precise, evidenced set of contract asks we would otherwise not have.

There is also a case for actively pursuing the adapter rather than waiting, and §1.1 has made it stronger. Their POC used Nuxeo specifically to prove the port surface was not accidentally HxPR-shaped, and the resulting adapter is real working source with tests. But we have now built the same adapter against a real deployment and found eight places where the shape does not carry Nuxeo — including one, `AuthPort`, where the POC's conclusion does not hold because the POC did not exercise the port.

Their architecture's central validation claim depends on a second adapter nobody is maintaining, and on that adapter having been tested against a deployment that resembles a customer's. We are the only team who can supply either. **That is the leverage, and the [gaps report](csx-447-port-gaps.md) is how we spend it**: we are prepared to own the Nuxeo adapter, and those eight contract changes are what would make it viable rather than a collection of documented divergences.

## 7. Owning the Nuxeo adapter

We treat it as settled that if ADF HX is to serve Nuxeo, we own the adapter. The question is what that costs and where it lives.

For the **migration case**, 20-26 engineer-weeks to production grade. For a **greenfield application**, 33-54 — roughly double, because a migration can adopt the adapter for core ECM and keep its own DAM data layer, whereas a greenfield app has the adapter as its entire data layer on the critical path from day one.

Their existing adapter is around 1,300 lines with 975 lines of specs, and **every Nuxeo call it makes is one our services already make**. We have since confirmed that by building our own: of the 22 substantive port methods (26 less the four `capabilities()` descriptors), **20 are satisfied from existing service methods**. The two that are not are `getAccessToken`, which has no meaning on a cookie-session deployment, and `getWithRendition`, which no Nuxeo adapter can implement as the contract defines it. This is re-homing and hardening, not a green-field build.

The critical framing: **the adapter is not the expensive part of adoption.** Wave 3 and the Angular 20 upgrade are. Building the adapter before Wave 3 exists produces a component with no consumer.

Open sub-questions: does it live in HFA (their monorepo, their release train, requiring commit rights and review capacity from a team that has descoped the work) or in our repo (easier for us, but then it is not really part of their architecture)? Who funds it? And does owning it buy us a seat in the port-surface design?

## 8. Risks

- **Deciding nothing is itself a decision.** Every sprint we build our own components deepens a second library that may later have to be thrown away.
- **ADF HX has no DAM surface and its owners are not building one.** For an ECM _and DAM_ product this is a permanent gap, not a timing one, and it caps the value of any adoption.
- **The abstraction is not just stalled, it is decaying.** Both PRs are static since 13 July, now conflicting, and nearly 400 `develop` commits behind. All nine ADRs remain at Proposed.
- **There is no authoritative statement of the port contract.** The Confluence RFC is actively edited (v88, 3 August) and has moved ahead of the code; the in-repo RFC disagrees with it; the ledger claims to supersede both. Whatever we align to must be a pinned commit, not a document.
- **The "proven at N = 2" claim is weaker than it reads.** `AuthPort` was never exercised by the Nuxeo POC, and RFC §5.2 describes wiring that does not exist at the pinned commit (§1.1). Four of the five ports do hold up. But the claim should be treated as evidence, not as a guarantee that a port will fit a real Nuxeo deployment, and any further alignment should be verified against code the way §1.1 was.
- **Two unreconciled roadmaps** mean the library's near-term API is genuinely unpredictable.
- **The Angular 20 gap is a project in its own right**, and if it is not funded, component adoption is decided by default. The gap is against `develop`, which is what we would install from; it does not constrain reading other HFA branches (§2).
- **Adopting the components means adopting** `@alfresco/adf-core` wholesale. The largest hidden cost in any adoption estimate.
- **Their release train is not ours.** A v0.0.8 library in a private monorepo becomes a hard external dependency on our critical path.
- **CSX bandwidth.** Of the forty most recently merged HFA PRs, the overwhelming majority are unrelated product work; two are CSX-tagged.
- **Upload and search results are genuinely unresolved on their side**, both with active but unmerged PRs.

## 9. What changes in the Beta plan

One existing task changes and two are added. Nothing is removed, and the critical path does not move.

- **B1 is re-specified — and is now done.** Define interfaces matching the port library on #18189 at a pinned commit — `DocumentPort`, `SearchPort`, `PermissionsPort`, `UploadPort`, `AuthPort` — over their neutral domain model, with Nuxeo REST access confined behind them. Pin to the branch, not either RFC. This shipped as `libs/shared/nuxeo-client/content-ports` and `…/content-adapter-nuxeo`, pinned to `61eb45bf`. Re-check the pin before any further alignment work: the branch may since have been rebased, merged or abandoned.
- **B2 gains a constraint — also done.** Ports and adapter are separate Nx projects with separate entry points, so a future swap is a dependency change rather than a refactor.
- **The boundary is now genuinely enforced, which it previously was not.** Earlier versions of this page and of `AGENTS/00-architecture.md` described the layer boundary as enforced by Nx lint tags. That was aspirational: `@nx/enforce-module-boundaries` carried a single permissive `'*' → ['*']` rule, which constrains nothing. Real `depConstraints` are now in place — `type:port-contract` may depend on no workspace library, `type:content-adapter` may depend only on the contract and the data-access layer, and `scope:features`, `type:ui` and `type:data-access` may not depend on the adapter at all, so only the untagged application composition root can name a backend. Both directions have been verified to fail lint. Note this covers the content-adapter boundary only; the feature-isolation rule is still convention checked in review, not lint.
- **New B4: adapter ownership engagement.** Confirm package installability from GitHub Packages, open the ownership and funding question with CSX and architecture, and record the reassessment gate. The [gaps report](csx-447-port-gaps.md) is the opening artifact for that conversation.

## 10. Open questions for leadership

Detailed engineering questions are in the two child pages. The ones needing a leadership answer:

1. **Is DAM in scope for** `adf-hx-content-services`, ever? This should be asked of CSX directly. A "no" is a perfectly respectable answer and would settle the ceiling on adoption permanently.
2. **Is the Angular 19 to 20 upgrade in Beta scope?** If not, component adoption is decided by default.
3. **What happens to the two conflicting PRs, and is Wave 3 funded?** Without Wave 3 the components stay SDK-typed and cannot render Nuxeo data without the SDK emulation ADR-001 rejects.
4. **Who funds the adapter — 20-26 weeks for migration, 33-54 for greenfield — and where does it live?**
5. **Do we accept a cross-repo dependency on HFA's release train** for a product shipped as a Nuxeo marketplace package to OnPrem customers?
6. **Should we seek review or approver status on RFC CSX-447?** We are the second backend it is designed against and are not currently listed. §1.1 is the argument for saying yes: the `AuthPort` gap was invisible from the RFC and from the POC, and only appeared when someone built the adapter against a deployment that authenticates the way customers do. That is the review capacity we would be contributing.
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
- [CSX-447 content ports — consumer report from the Nuxeo Satori team](csx-447-port-gaps.md) — the eight gaps found by building the adapter
- [CSX Generative UI PoC (CSX-588 / CSX-592) — Teardown](csx-generative-ui-teardown.md) — source for the §2 branch-version correction of 7 August 2026
- [PR #18189 — CSX-447 CSX abstraction layer](https://github.com/Alfresco/hxp-frontend-apps/pull/18189) (draft, conflicting, static since 13 Jul 2026)
- [PR #18232 — CSX-447 abstraction-layer research and POC](https://github.com/Alfresco/hxp-frontend-apps/pull/18232) (draft, conflicting, static since 13 Jul 2026)
- `Alfresco/hxp-frontend-apps`, `libs/adf/enterprise/adf-hx-content-services` (private)
