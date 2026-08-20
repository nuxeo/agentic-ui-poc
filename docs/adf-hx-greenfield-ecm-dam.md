# A Greenfield Nuxeo ECM + DAM Application on ADF HX — Feasibility Analysis

> ## ⚠️ Recovery note — this is the condensed published version, not the original
>
> The original in-repository version of this analysis was 722 lines and was lost from the working
> tree before it was ever committed to git. It is not recoverable from any branch, commit or stash.
>
> What follows is the **condensed version published to Confluence** ([page 4230974594](https://hyland.atlassian.net/wiki/spaces/~71202090f2a61ef96d4f57a5104efe296c1f5b/pages/4230974594)),
> written as a decision-relevant summary because the full text exceeded Confluence's publishing
> size limit. It carries the verdict, the effort model and the blocker set, but **not** the
> supporting detail: the complete port-method mapping and the integration mechanics are gone.
>
> **Do not cite this document as the complete analysis.** The missing detail has deliberately not
> been regenerated — inventing it would produce text that reads like verified findings but is not.
> If that detail is needed, it must be re-derived from the evidence sources named in the body.

> **Status:** Draft for review
> **Audience:** Engineering, architecture, leadership
> **Evidence date:** 6 August 2026
> **Parent:** [ADF HX Content Services vs. a Nuxeo Satori Library — Decision Document](adf-hx-vs-nuxeo-satori-decision.md)
> **Sibling:** [ADF HX for Beta — Practical Feasibility Analysis](adf-hx-for-beta-analysis.md)

## What this document is, and what it is not

This answers a **different question** from its sibling. The sibling asks whether the existing Nuxeo Satori codebase should adopt ADF HX components. This asks: **if we started a brand new Nuxeo ECM + DAM application from scratch on ADF HX, what would we get, what would we have to build, and is it a good idea?**

Nothing here proposes migrating, blending or incrementally adopting ADF HX into the existing repository. Those are two separate paths. The existing codebase is used here only as (a) a specification of what a Nuxeo ECM + DAM application must do, and (b) evidence of which Nuxeo call patterns are known to work. **No code migrates in this scenario.**

The agentic / AG-UI layer is a separate concern and is out of scope.

---

## Headline conclusion

> **Do not start a greenfield Nuxeo ECM + DAM application on ADF HX Content Services today.** Adopt its port contracts, offer to own the Nuxeo adapter, and hold the component decision behind an explicit gate.

The library is a competent core-ECM component set for a records-and-documents product on the HxPR backend. **It is not a DAM library — not partially, not in embryo.** The evidence is not an absence of polish; it is an absence of the concept.

The greenfield framing genuinely helps in places, and this analysis is careful to say where. Angular 20 stops being an upgrade project and becomes a starting choice. Satori 0.2.0 stops being a conflict and becomes the version you pick. (Both figures are HFA `develop`'s, observed 7 August 2026 — see the blocker table for why the branch attribution matters.) "Discarding working UI" stops being a cost, because there is nothing to discard. Those three blockers, which dominate the migration analysis, **evaporate**.

But the blockers that matter most get **worse** under greenfield, and that is what decides it. In a migration you keep your own DAM surface and adopt ADF HX only where it helps. In a greenfield build you have no DAM surface, so every DAM capability the library lacks is one you must write from zero, on top of a component library whose data model is not shaped for it, against a Nuxeo adapter whose rendition method throws.

The strategic case for converging on one Hyland content library is real and gets a fair hearing below. It is a case for **engaging with the port surface now** — which costs almost nothing and buys real influence — not for betting a product on the component library in its current state.

---

## The DAM verdict: absent, not immature

This was conducted as an exhaustive term sweep across all 861 files of the library, followed by first-hand reading of every hit.

| DAM capability                      | Verdict                             | Evidence                                                                                                  |
| ----------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Thumbnails                          | **Absent**                          | **Zero occurrences of `thumbnail`** anywhere in the library, in any file type, including translations     |
| Asset grid / gallery / tile view    | **Absent**                          | `grid` matches one SCSS `display: grid`; `tile` one Italian translation string; `gallery`, `masonry` zero |
| Contact sheet / lightbox            | **Absent**                          | Zero occurrences                                                                                          |
| Bulk operations of any kind         | **Absent**                          | `bulk` zero; `batch` matches one tree-loading helper                                                      |
| Image preview beyond generic viewer | **Absent**                          | `image` matches only the mime-type icon map, i18n strings, the file-type filter, and mocks                |
| Video preview / player / scrubbing  | **Absent**                          | same three locations                                                                                      |
| Audio preview / waveform            | **Absent**                          | same three locations                                                                                      |
| Derivatives / format conversion     | **Absent**                          | `derivative`, `transform` zero                                                                            |
| EXIF / IPTC / XMP                   | **Absent**                          | zero occurrences of all three                                                                             |
| Image crop, resize, edit            | **Absent**                          | `crop` matches two build-config entries only                                                              |
| Watermarking                        | **Absent**                          | zero                                                                                                      |
| Rights / licence / expiry / embargo | **Absent**                          | `embargo`, `expiry` zero; `licen` matches only copyright headers                                          |
| Download in multiple formats        | **Absent**                          | fetches the main blob; no format selection                                                                |
| **Renditions**                      | **Present — one kind, one purpose** | see below                                                                                                 |

### The rendition path, read in full

Renditions **do** exist, which corrects an earlier assumption — and it makes the verdict stronger, not weaker.

`RenditionsService` is 35 lines with three methods, all delegating to the HxPR SDK. Its **only consumer in the entire library** is the document viewer, and the logic is: ask ADF's viewer whether it can render this mime type. If **yes**, download the whole original blob and hand it over. If **no**, request `DEFAULT_RENDITION_ID` — defined as the literal string `'pdfPreview'` — poll until ready, and show the PDF.

So the library's entire relationship with renditions is: _when the browser cannot render this file, ask the backend to turn it into a PDF._ That is a correct design for a records-management viewer. For DAM it is the wrong shape at every level. It never asks for a thumbnail, a sized image derivative, or a video proxy. And for any mime type ADF's viewer _does_ support — including JPEG, PNG and MP4 — it **downloads the full-resolution original into a browser blob**. Rendering a 400 MB TIFF or a 4 GB master video through that path is not a performance problem to tune; it is the opposite of what a DAM does.

### The domain shape says the same thing

Two artefacts reveal what product this was written for.

Their `document-retention.config.ts` defines `RecordStatus` with `Incomplete`, `Ready`, `UnderRetention`, `ReachedDisposition`, `OnHold` — and in the same file, `ViewMode = { Cases, Records }`. The library's notion of a "view mode" is cases versus records.

Meanwhile their mime-type icon config enumerates thirty-plus image types including sixteen camera-raw formats — `image/x-raw-canon`, `image/x-raw-hasselblad`, `image/x-raw-red` — and maps **every one to the same outcome: draw the `image` icon**. The library knows what a Hasselblad raw file is. It has nothing to do with it.

Their viewer takes **three inputs**. The viewer in the existing Nuxeo application takes **twenty-three, twelve of them media-specific** (`videoSources`, `storyboard`, `posterUrl`, `pictureInfo`, `pictureViews`, `exifData`, `iptcData`, `videoInfo`, `arenderUrl` and others).

### And their own assessment never mentions an asset

The CSX [Assessment & Evolution Report](https://hyland.atlassian.net/wiki/spaces/~61a51e0ad5986c006a1ec880/pages/3987440773) is a comprehensive self-diagnosis, confident enough to list upload, pagination, scroll tracking and selection helpers as gaps. It **never mentions a rendition, a thumbnail, an asset, or any media type.**

**The correct reading is not "ADF HX has weak DAM support." It is that ADF HX was designed for a records and case-management product on HxPR, and DAM was never in scope.** That is a legitimate design. It simply is not the design a Nuxeo DAM needs — and it is not a gap we could reasonably expect them to close.

---

## What a Nuxeo ECM + DAM application must actually do

Derived from the existing repository read as a specification: **18 Nx projects, 79 components, 34 injectables, 39,213 lines of source TypeScript, 12,898 lines of templates.** The Nuxeo access layer alone is 26 services exposing **208 public methods**, calling **135 distinct REST paths** and **25 Automation operations**.

The requirement splits into four surfaces, and only the first is contested:

| Surface            | Content                                                                                                                                                        | ADF HX coverage              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| **Core ECM**       | Browse, tree, breadcrumb, metadata, versions, permissions, locking, audit, comments, tags, upload, CRUD, search, multi-select                                  | **Substantial**              |
| **DAM**            | Asset grid, thumbnails, picture views, video transcodes and storyboard, EXIF/IPTC, ARender, bulk ZIP download, collections-as-lightboxes, faceted asset search | **None**                     |
| **Nuxeo platform** | Workflow and tasks, vocabularies, trash lifecycle, Nuxeo Drive, saved searches, aggregations, users and groups, administration, favourites, publishing         | **None**                     |
| **CIC / AI**       | Knowledge Discovery, Knowledge Enrichment, Content Lake ingestion, AI client                                                                                   | **None**, under every option |

---

## The Nuxeo adapter in a greenfield context

### Effort: 33–54 engineer-weeks

Roughly **double** the migration-case estimate of 20–26 weeks. The reason is entirely structural: a migration can adopt the adapter for the core-ECM slice and keep its own DAM data layer. A greenfield application cannot — the adapter _is_ the whole data layer, and nothing renders until it exists. It is on the critical path from day one.

| Work item                                                                 | Estimate                 |
| ------------------------------------------------------------------------- | ------------------------ |
| Harden the five existing ports to production grade                        | 5–7 wk                   |
| Filter kinds 2 → 8                                                        | 1.5–2 wk                 |
| Namespaces beyond `dc` and `file` (`picture:`, `vid:`, `uid:`, `common:`) | 1.5–2 wk                 |
| **Renditions on Nuxeo** — needs a port change, gated on a CSX decision    | **4–6 wk**               |
| **Aggregations / facets** — requires changing shared domain types         | **3–5 wk**               |
| Trash lifecycle, locking, check-in, audit, tags, favourites, comments     | 4–6 wk                   |
| Named-query catalogue 3 → ~12                                             | 2–3 wk                   |
| Download port (blobs, pre-signed URLs) — no code anywhere today           | 1.5–2 wk                 |
| Contract-test conformance and cross-adapter equivalence CI                | 2–3 wk                   |
| **Subtotal**                                                              | **25–36 wk**             |
| Port-surface instability allowance, 30–50%                                | 8–18 wk                  |
| **Total**                                                                 | **33–54 engineer-weeks** |

Two things reduce the risk and should be said. The existing repository's 26 services prove every Nuxeo call the adapter needs is reachable and working — no code migrates, but no call pattern has to be discovered either. And the HxPR adapter's hardening is a worked example of what "production grade" means here, which removes most of the specification risk from the first row.

---

## Blockers: which evaporate, which worsen

### Evaporate or invert under greenfield

| Migration-era blocker                                 | Under greenfield                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Angular 19 → 20 upgrade is a project in its own right | **Evaporates, and inverts into an advantage.** A new app starts on Angular 20.3.25, Material 20.2.14, TypeScript 5.8.3 — the versions HFA `develop` builds against as of 7 August 2026. Better alignment than a migration could achieve, at no upgrade cost. Pin against `develop` at bootstrap: other HFA branches lag it, and the generative-UI PoC branch is still on Angular 19.2.20 |
| Satori 0.1.5 → 0.2.0 conflict                         | **Evaporates.** 0.2.0 is simply the version chosen at bootstrap                                                                                                                                                                                                                                                                                                                          |
| Discarding working, tested Nuxeo UI                   | **Evaporates.** There is nothing to discard. The most emotionally weighted objection in the migration case has no force here                                                                                                                                                                                                                                                             |
| Sunk cost in 26 existing services                     | **Inverts into an asset.** 135 proven REST paths and 25 Automation operations de-risk the adapter                                                                                                                                                                                                                                                                                        |
| Two component libraries in one codebase               | **Evaporates at the codebase level.** It reappears at the _organisation_ level, which is why the strategic argument gets stronger under greenfield, not weaker                                                                                                                                                                                                                           |

### Persist or worsen

| #   | Blocker                                                                   | Severity     | Under greenfield                                                                                                                                                                   |
| --- | ------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **DAM is absent from the library**                                        | **Critical** | **Much worse.** A migration keeps its DAM surface; a greenfield app has none and must build all of it on an unsuited foundation                                                    |
| 2   | **Component `@Input`s typed on the HxPR SDK; Wave 3 not started**         | **Critical** | **Worse.** A greenfield app must actively _synthesise fake HxPR entities_ — the SDK emulation ADR-001 rejects — where a migration merely translates at a boundary it needed anyway |
| 3   | **Nuxeo adapter's `getWithRendition` throws; renditions may be descoped** | **Critical** | **Worse.** DAM is the product; renditions are its heart                                                                                                                            |
| 4   | **Abstraction layer unmerged, and now conflicting**                       | **High**     | Same, but on the critical path from day one rather than deferrable                                                                                                                 |
| 5   | **No aggregations or facets anywhere in the stack**                       | **High**     | Worse — asset search without facets is not a DAM                                                                                                                                   |
| 6   | `@alfresco/adf-core` adopted wholesale                                    | **High**     | Worse — every DAM component we write must live inside ADF's conventions rather than the other way round                                                                            |
| 7   | **No upload feature**                                                     | **High**     | Same. CSX size the move at 7–10 weeks with an unresolved sharing question                                                                                                          |
| 8   | **No search-results component or orchestrator**                           | **Medium**   | Same. PR #18708 in flight, draft, unmerged                                                                                                                                         |
| 9   | **Two unreconciled roadmaps**                                             | **Medium**   | Worse — a greenfield adopter has no fallback if the API moves under them                                                                                                           |
| 10  | **Nine ADRs at Proposed; seven open decisions**                           | **Medium**   | Same. Three of the seven — renditions, check-in, download URL — directly gate DAM                                                                                                  |
| 11  | **Package installability unverified**                                     | **Medium**   | Same. Trivially resolvable; obtain `read:packages` and test                                                                                                                        |
| 12  | **HFA release train is not ours**                                         | **Medium**   | Worse — a hard external dependency from day one                                                                                                                                    |
| 13  | **CSX bandwidth**                                                         | **Medium**   | Of the forty most recently merged HFA PRs, the overwhelming majority are AAE and HXIDP work; two are CSX-tagged                                                                    |
| 14  | **Adapter has two of eight filter kinds, two namespaces**                 | **Medium**   | Worse — the missing namespaces are exactly `picture:` and `vid:`                                                                                                                   |

---

## Greenfield on ADF HX versus greenfield on our own components

| Dimension                        | Greenfield on ADF HX                                         | Greenfield on our own components                          |
| -------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------- |
| Core ECM UI                      | Substantially provided                                       | Build, but shaped for our data                            |
| DAM UI                           | Build entirely, inside someone else's conventions            | Build entirely, on our own terms                          |
| Nuxeo platform surface           | Build entirely                                               | Build entirely                                            |
| CIC / AI surface                 | Build entirely                                               | Build entirely                                            |
| Data layer                       | Adapter, 33–54 wk, on critical path                          | Direct Nuxeo services, port-shaped by choice, incremental |
| Type at the component boundary   | HxPR SDK `Document` until Wave 3 (no date)                   | Ours from day one                                         |
| Faceted search                   | Blocked on a shared-domain change                            | Available immediately                                     |
| Renditions                       | Port method throws; CSX inclined to descope                  | Available immediately                                     |
| External dependency risk         | High: ADF, HxPR SDK, Satori, HFA release train, two roadmaps | Low                                                       |
| Strategic alignment              | Strong, if the abstraction lands                             | Weak unless we align contracts deliberately               |
| Time to a demonstrable ECM slice | Slow initially, then fast                                    | Steady                                                    |
| Time to a demonstrable DAM slice | Slow throughout                                              | Fast                                                      |

---

## The two roadmaps are not reconciled

This is a new finding and it matters to anyone betting a product on the library.

There are **two independent improvement plans** for `adf-hx-content-services` with different owners and no cross-reference:

- **Roadmap A** — the Assessment & Evolution Report's six steps: API hygiene, extract breadcrumbs and copy/move, content-list utilities, a search orchestration facade, composition documentation, an optional `<hxp-content-browser>` shell.
- **Roadmap B** — the CSX-447 hexagonal wave plan: ports, adapters, `ContentNode`, contract tests, Waves 0–5.

A full-text search of the RFC, `STATUS.md`, all eight ADRs, the executive summary, both independent critiques and the POC plan returns **zero references** to the assessment, to "composition presets", "agent skills", "API hygiene" or "Tier 1/Tier 2". The assessment in turn never mentions ports, adapters or `ContentNode`.

The collision is live, not theoretical. On **5 August 2026**, roadmap A moved a `search-results.component` _into_ the library typed on SDK `Document`, while roadmap B's Wave 3 will require every such component retyped to `ContentNode`. Neither plan acknowledges the other.

For a greenfield adopter this means the library has two futures with different owners and a genuinely unpredictable near-term API.

---

## Corrections to previously published facts

Four, all verified first-hand:

1. **The filter DSL has eight kinds, not thirteen** — `and`, `or`, `not`, `eq`, `in`, `between`, `startsWith`, `fullText`. The Nuxeo adapter supports two of eight, so the gap is real but smaller than previously stated.
2. **The RFC is not frozen, and the drift runs the opposite way.** There are two RFC artefacts. The in-repo markdown names five ports and never mentions `ContentPort`, `ModelPort` or `PrincipalPort`. The Confluence RFC names eight — and is at **version 88, edited 3 August 2026**, with `ContentPort` having since gained `checkIn` and `restoreVersion`. So the design document is moving _ahead_ of the code while `STATUS.md` declares it frozen. **No single artefact states the current contract.**
3. **Renditions do exist in the library**, contrary to earlier framing — which sharpens rather than softens the DAM verdict, as above.
4. **Both abstraction PRs now report `CONFLICTING`.** `develop` has moved nearly 400 commits ahead since 13 July, and the branch pins the HxPR SDK at 2.0.9 against develop's 2.0.111. **Not parked — decaying.**

---

## Open questions

### For CSX

1. **Is DAM in scope for `adf-hx-content-services`, ever?** The single question that decides everything else here. A "no" is a perfectly respectable answer and would let both sides plan honestly.
2. **What is the resolution of open Decision 2 (renditions), and will `getWithRendition` be implemented on the Nuxeo adapter?** The current recorded recommendation is to descope it even for HxPR.
3. **Will `SearchPort` and `SearchResultPage<T>` gain aggregations?** Without them, faceted asset search has no home in this architecture.
4. **When does Wave 3 start, and is it funded?** No date exists anywhere.
5. **Will the two roadmaps be reconciled, and by whom?** Concretely: will PR #18708's SDK-typed `search-results.component` be retyped under Wave 3, and who has planned that?
6. **What is the fate of PRs #18189 and #18232?** Both draft, both now conflicting.
7. **Would CSX accept an externally owned `content-adapter-nuxeo` inside HFA,** with the commit rights and review capacity that implies?
8. **The Confluence RFC was edited on 3 August while `STATUS.md` declares it frozen. Which is the contract?**

### For architecture

9. **Is "one Hyland content component library" a stated architectural intent with a timeframe, or a direction of travel?**
10. **Is contract-level convergence sufficient alignment, or is component-level convergence expected?** These are separable and priced very differently.
11. **If a Nuxeo product needs DAM and ADF HX will not serve it, where should a Hyland DAM component library live?** Building one inside `adf-hx-content-services` and building one outside it are both defensible; drifting into the second by accident is not.
12. **Does ADR-007's public-API stability policy, still Proposed, cover an external consumer?**

### For our leadership

13. **Is a greenfield application actually on the table**, given a working ECM + DAM application already exists? Everything above assumes yes; if the answer is no, the parent decision document governs instead.
14. **Who funds 33–54 engineer-weeks of adapter work, on the critical path, before any UI is demonstrable?**
15. **Do we accept a hard cross-repo dependency on HFA's release train** for a product shipped as a Nuxeo marketplace package to on-premises customers?
16. **Should we seek reviewer or approver status on RFC CSX-447?** We are the second backend it is designed against and are not currently listed.

---

## What could not be verified

- **The six appendix attachments** on the Assessment & Evolution Report. They are Atlassian media blobs and the available Confluence scopes do not include attachment access. They likely contain the component-by-component inventory behind the "61 components / ~59 services" figures, and are worth obtaining before that section is leaned on heavily.
- **Package installability from GitHub Packages** — our token lacks `read:packages`.
- **Satori 0.2.0's breaking changes** — same token limitation.

---

## Recommendation

**Adopt the contracts. Do not adopt the components. Do not start a greenfield build on this library today.**

What would have to become true before component adoption is reconsiderable:

1. CSX answers **yes** to DAM being in scope — or we accept building the entire DAM surface ourselves, inside ADF's conventions, and price that honestly.
2. **Wave 3 lands**, so component inputs take a neutral type and we are not synthesising fake HxPR entities.
3. `getWithRendition` is implemented on the Nuxeo adapter, with a port method for enumerating available renditions.
4. `SearchPort` gains aggregations, so faceted asset search has a home.
5. **PR #18189 merges** and the nine ADRs move from Proposed to Accepted.
6. **The two roadmaps are reconciled** under a single owner.
7. **Package installability is confirmed.**

Until then the cheap, high-value actions are the ones already in Beta task B4: confirm installability, pin our abstraction to a specific commit on the branch rather than to either RFC, open the adapter-ownership conversation, and seek reviewer standing on CSX-447. Those cost almost nothing and buy influence over a port surface that will otherwise be designed against HxPR alone.
