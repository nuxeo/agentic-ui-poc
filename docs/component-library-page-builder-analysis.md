# A library of ECM and DAM components users compose into their own pages — feasibility

|          |                                                                                                                                                                                         |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status   | Assessment. No code, test or configuration changed.                                                                                                                                     |
| Date     | 2026-08-07                                                                                                                                                                              |
| Branch   | `beta-delivery`                                                                                                                                                                         |
| Assesses | A page/dashboard builder over a catalogue of our own components                                                                                                                         |
| Verdict  | Yes for developer- and admin-authored pages. No for end-user-authored, this window.                                                                                                     |
| Revised  | 2026-08-07 — citations re-verified after A7 stage 3 landed; §3.1 and §5 updated. The second registry §5 recommends is now shipped rather than inferred. No estimate or verdict changed. |

Everything below was read from files on this branch and every claim carries the path it came
from. Where I could not verify something it is marked `UNVERIFIED:` with what would settle it.

**Citations re-verified 2026-08-07**, after A7 stage 3 landed and moved line numbers in several
cited files. All 94 `path:line` references resolve against the working tree; five references into
ADR 001 and two internal section cross-references were stale and are corrected. The revision
changed nothing about the recommendation — worth stating, because the finding most likely to be
challenged (§3.1's prop rule) got _stronger_: the collision it predicts was hit for real by the
form channel and resolved the way §5 proposes.

---

## 1. The answer

**Yes for a developer- or administrator-authored page, and no for an end-user-authored one
inside the Beta window.**

More precisely, three different products are hiding inside the question and they have three
different answers:

| What is being asked for                                                                  | Answer                                          | Why                                                                                                             |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| A page assembled from registry components by a **developer** at build time               | **Already funded.** This is A8's rendered view  | `docs/beta-engineering-plan.md:239` — a recipe's view "is a developer-authored composition of registry widgets" |
| A page defined as **configuration** an administrator edits, rendered at runtime          | **Reachable. 35–60 engineer-days**              | §6, option 2. The mounting machinery transfers; the catalogue and the layout model do not exist                 |
| A page an **end user** composes in a builder UI, saves, and shares                       | **Not in this window. A further 35–55 days**    | §6, option 3. 3–4× the whole of A7, against six Pending tasks                                                   |
| A page containing a **third party's own component**, installed into a running deployment | **No, and not close.** Structural, not schedule | §4.5. No sandbox, no publishable library, and contributed code gets the app injector                            |

The single most useful thing in this document is not any of those numbers. It is §2: this
question is not a new feature idea. It is **open decision 6 on the product overview arriving from
a different direction**, and it should be routed to whoever owns that decision rather than
answered as an engineering estimate.

The three findings that most change the picture, if you read nothing else:

1. **The registry is a general mechanism wrapped around a chat-specific contract.** The mounting
   half transfers almost entirely. The _definition_ half — what a widget declares about itself —
   has no name a palette could show, no configuration schema a form could be generated from, and
   a prop rule that forbids exactly the two things a page tile needs (a title and a query). §3.1.
2. **We own no tiles.** The dashboard's four "widgets" are inline template markup inside a layout
   slot, not components (`apps/nuxeo-ui/src/app/dashboard/dashboard-page.component.html:64-245`).
   The two registered widgets are both pinned to a fixed list of at most 25 uids and cannot
   express "documents matching a query". A catalogue of composable tiles has to be written. §4.1.
3. **The persistence problem is smaller than the brief assumes and the layout problem is
   bigger.** Saved searches are already a shipped, ACL-shared, user-authored artefact stored in
   Nuxeo (§3.2) — there is a pattern to copy. But the 400px design cost is per _component per
   width context_, it was measured twice without compressing, and a builder multiplies the number
   of width contexts. §4.2.

---

## 2. Which product is being asked for — answer this before anything else

The plan has already made this mistake once, in writing, and recorded it:

> **The goal was restated to the one being asked for.** A7 described an agent assembling a
> dashboard from a widget catalogue. The goal is to render the application's own functional
> components inside the chat, chosen by the question. **Those are different products and the plan
> was describing the wrong one.**
> — `docs/beta-engineering-plan.md:369`

"A library of components users compose into their own pages" can mean two unrelated things, and
the difference decides whether this is worth doing at all.

**Dashboard composition** — tiles on a home page: recent documents, a task list, a saved search's
results, a KPI. This is what a "dashboard-builder experience" describes, and it is what everything
below costs.

**Document layout composition** — which fields appear in which order on a document's view and edit
forms, per document type. This is what Nuxeo Studio's layouts actually are, and it is the thing
customers lose on migration:

> After a Studio project is deployed to the Nuxeo server, this UI can read document types, custom
> field definitions, and registered search configurations. What it largely **cannot** read is
> **layouts** — the most visual and most heavily customised part — because they are stored as raw
> Polymer-format HTML.
> — `docs/beta-product-overview.md:144`

> a customer with heavily customised Studio layouts **does not carry them over** — those layouts
> have to be **rebuilt in the new UI**.
> — `docs/beta-product-overview.md:148`

A dashboard builder does not address that sentence at all. If the motivation behind the question
is "reduce the Studio dependency", a dashboard builder is the wrong instrument and would be
answering a need nobody has with a product nobody asked for. If the motivation is "give
administrators a home page they can shape", it is the right instrument and the Studio framing is
a distraction.

**This is a product call and it is the first one.** Everything downstream — the catalogue, the
prop contract, the persistence schema — is different for the two.

### This is open decision 6, restated

Either way, the question already exists in the plan and is already unfunded. The concluded
direction after Studio was ruled out is:

> an **independent designer** that manages its own configurations **stored directly on the Nuxeo
> server**, operating separately from cloud Studio. … **No sync is attempted.**
> — `docs/beta-product-overview.md:146`

> the independent designer **does not exist in the codebase today**: there is **no match for
> "studio" or "designer" anywhere in `apps/` or `libs/`**. … If Beta needs it, that is a **fourth
> workstream to fund**.
> — `docs/beta-product-overview.md:148`

`docs/beta-engineering-plan.md:441` carries the same thing as "Possible Track D — independent
designer, not yet scoped", explicitly with no task and no estimate, "deliberately: it becomes a
track only if leadership decides Beta must include it."

So the honest framing to take back: **a page builder is Track D, or a large part of it.** It is
not a small extension of A7. Presenting it as one would repeat the error the A7 rescope was
written to correct.

---

## 3. What already exists and genuinely transfers

### 3.1 The registry — a general mechanism, a chat-specific contract

This is the question the brief asks to settle directly, so here is the direct answer: **the
mounting half is general and transfers almost unchanged; the declaration half is shaped for the
chat panel and does not.**

**What is genuinely general**, all in `libs/shared/agent-client/src/lib/agent-widget.ts` and
`apps/nuxeo-ui/src/app/shell/ai-chat-panel/agent-widget-host.component.ts`:

- Registration is an Angular multi-provider (`provideAgentWidgets`, `agent-widget.ts:146-157`)
  resolved into an indexed catalogue at first injection (`AgentWidgetCatalogue`, `:167-194`).
  Nothing in the panel names a widget; the host injects the catalogue (`agent-widget-host.component.ts:60`).
  This is a real extension point, not a place extensions are written down, and the code says so
  and is right (`agent-widget.ts:11-24`).
- Duplicate names throw at bootstrap rather than last-one-wins (`agent-widget.ts:176-178`), and
  names must match `/^[a-z][A-Za-z0-9]{0,39}$/` (`:200`). Both are properties a catalogue needs.
- Lazy `load()` per widget, with a mount token so a slow chunk cannot land on top of a newer
  request (`agent-widget-host.component.ts:74`, `:118`, `:123`), a failed `setInput` destroying
  the half-populated component rather than showing it (`:131-136`), and full teardown on destroy
  (`:182-197`). That discipline is exactly what a page mounting eight tiles needs, and it took
  real effort to get right.
- `inputs` translates validated props into component inputs by name rather than spreading them
  (`agent-widget.ts:85-88`). A tile gaining a dangerous input does not become reachable until
  someone writes it into that function. This property is worth keeping verbatim.
- A refusal is reported rather than swallowed, with two distinct notices
  (`agent-widget-host.component.ts:208-211`). A page builder needs precisely this for a tile whose
  component was removed or whose saved props no longer parse — see §4.5.

Call it **70–80% of the mounting problem, already solved and already tested.**

**What is shaped for the chat panel**, and this is the part that decides most of the answer:

1. **A definition declares nothing a palette could render.** `AgentWidgetDefinition`
   (`agent-widget.ts:94-121`) has exactly five members: `name`, `parseProps`, `load`, `inputs`,
   and an optional `selection`. There is no display name, no description, no icon, no category, no
   preferred or minimum size, and no configuration schema. A builder cannot show a palette,
   because there is nothing to show. `name` is `documentCard`, not "Document details".
2. **`parseProps` validates; it does not describe.** It is
   `(props: Record<string, unknown>) => P | null` (`agent-widget.ts:75-77`). Given a payload it
   answers yes or no. It cannot be asked "what may a user set here, and of what type" — which is
   the question a configuration form is generated from. These are inverse problems and one does
   not yield the other. Deriving a form from the current shape is impossible; a second, declared
   schema has to be added beside it, and the two then have to be kept in agreement.
3. **The props rule forbids what a page tile needs.** The rule is absolute and load-bearing:
   props are "identifiers and enums, never content" (`agent-widget.ts:28-32`,
   `docs/generative-ui-widgets.md:131`, `docs/adr/001-agent-runtime.md:326`). It exists because a
   widget's props come from a language model that can be steered by document content an attacker
   wrote. A dashboard tile's props come from a person, and that person legitimately wants to set a
   **title** ("Contracts awaiting my review") and a **query** ("modified this week, type
   Contract"). Both are content. §5 works through what changes when you allow them.

   This is the finding least likely to change, and the one with a shipped answer already: A7
   stage 3 hit the identical collision for a _form's_ props and resolved it with a second registry
   rather than a weakened rule (`libs/shared/agent-client/src/lib/agent-form.ts`). A tile registry
   would be the third instance of that pattern, not a new design. §5.

4. **The request type is keyed to a chat concept.** `AgentWidgetMount` and `AgentWidgetRejection`
   both carry `toolCallId` (`agent-widget.ts:214-234`), and `MAX_WIDGETS_PER_THREAD = 20` bounds a
   _thread_ (`libs/shared/agent-client/src/lib/agent-runtime.service.ts:69`). Mechanical to
   generalise, but it is evidence of what the type was designed around.
5. **`selection` is agent-proposal machinery** (`agent-widget.ts:117-120`) — `offers` reports the
   closed set an agent suggestion may draw from. Meaningless on a page, and harmless: it is
   optional and `documentCard` omits it.

**Verdict on the registry.** It is a component catalogue with a real extension point, and it was
built with more generality than a chat panel strictly needed — the multi-provider decision was
taken specifically so a package outside this repository could contribute
(`docs/adr/001-agent-runtime.md:686-690`). But it is a catalogue of _things the agent may cause to
appear_, not a catalogue of _things a person may configure_. The gap between those is one new
declaration surface (metadata plus a config schema) and one weakened guarantee (content in props).
The first is ordinary work. The second is a security-posture change and belongs to product, not to
engineering. §5.

### 3.2 The persistence precedent the brief did not have — saved searches

The brief states that thread persistence (A6) is unbuilt so there is no existing pattern for
storing user-authored artefacts in Nuxeo to copy. **That is not right, and the correction is
favourable.** Saved searches are exactly that pattern and they ship today:

- CRUD over a Nuxeo-native endpoint:
  `SearchService.saveSavedSearch`, `getSavedSearches`, `getSavedSearchById`, `updateSavedSearch`,
  `deleteSavedSearch`, all against `/nuxeo/api/v1/search/saved` with
  `'entity-type': 'savedSearch'` (`libs/shared/nuxeo-client/src/lib/services/search.service.ts:178-299`).
- And they are **shared by ACL, through the ordinary permissions machinery**.
  `ShareSavedSearchDialogComponent`
  (`libs/shared/ui/src/lib/share-saved-search-dialog/share-saved-search-dialog.component.ts`)
  grants, replaces and revokes ACEs on the saved-search document via `DocumentDetailService`
  (`:379`, `:414`, `:480`), including inheritance blocking (`:278`) and external sharing.

So "a user-authored artefact, stored in Nuxeo, listed, edited, deleted and shared with real
permissions" is not a thing we would be inventing. It is a thing we ship, in a dialog, with a
worked external-sharing path.

**The one thing that does not transfer, and it is the open question.** Saved searches ride a
Nuxeo-native entity type and a dedicated REST endpoint. A saved _page_ has neither. It would be an
ordinary document carrying a custom schema, which means a server-side doctype contribution — an
artefact this repository does not own. That is the same question ADR 001 already defers for
threads:

> The exact document type, schema and workspace path are Phase 2 detail and are deliberately not
> fixed here. This ADR fixes only that threads are Nuxeo documents written as the caller.
> — `docs/adr/001-agent-runtime.md:1286`

**Overlap to name rather than duplicate: a saved page should ride whatever A6 decides.** If A6
settles a doctype-and-workspace convention for threads, saved pages are a second consumer of it at
near-zero marginal cost. If a page builder is scoped before A6 is decided, it will decide that
question for the whole product by accident.

There is also a mild irony worth surfacing: defining a custom doctype is itself something
customers do in Studio today. `UNVERIFIED:` whether a doctype can be contributed by the same
marketplace package that ships this UI, without a Studio project. Confirming this needs someone
who owns the Nuxeo packaging story; it is a real dependency and it is on the critical path for
both A6 and any saved page.

### 3.3 The backend-neutral boundary, and how little it helps here

`content-ports` and `content-adapter-nuxeo` exist and are lint-enforced
(`AGENTS/00-architecture.md:75-130`, `eslint.config.mjs:68-95`). It is genuine work and it matters
for the library story. It does close to nothing for a page builder, and the architecture doc
already says why:

> The five ports total **26 methods**. **Around 12% of our content surface can sit behind the
> shared contract; the rest is Nuxeo-specific and stays direct.**
> — `AGENTS/00-architecture.md:128`

And the largest gap is the one a dashboard needs most:

> **Faceted search stays on the Nuxeo page-provider path and deliberately does not go through
> `SearchPort`.** … `SearchResultPage<T>` … carries `items`, `total`, `hasMore` and `cursor` — and
> no buckets.
> — `AGENTS/00-architecture.md:163-170`

Likewise "thumbnails, `picture:views`, `vid:transcodedVideos`, EXIF/IPTC" have "no representation
in the domain model" (`:153`). **The DAM half of "ECM and DAM components" is entirely outside the
neutral contract**, so a DAM tile is Nuxeo-coupled by construction. That is not an argument against
building one; it is an argument against claiming the catalogue is backend-portable.

---

## 4. What is missing, and roughly what it costs

### 4.1 There is no catalogue of tiles — the dashboard's widgets are markup

The dashboard renders four tiles. They are not components. `WidgetGridComponent` is twelve lines
with one `columns` input (`libs/shared/ui/src/lib/widget-grid/widget-grid.component.ts:9-12`) and
`WidgetContainerComponent` is a titled frame with `title`, `icon`, `iconColor`
(`libs/shared/ui/src/lib/widget-container/widget-container.component.ts:11-15`). Everything inside
them — the Recently Edited table, the Tasks list, Recently Viewed, Favorite Items — is inline
markup in one template
(`apps/nuxeo-ui/src/app/dashboard/dashboard-page.component.html:64-245`), with the data fetched by
`DashboardPageComponent` itself.

The readiness audit made this point about A7 and it applies here with more force:

> **"built on the existing `widget-grid`/`widget-container`" is building on nothing.** … It is a
> CSS grid wrapper. It contributes no registry, no validation, no lifecycle, no widgets.
> — `docs/generative-ui-readiness.md:616`

So the starting catalogue is **two widgets**, and neither is a usable dashboard tile:

- `documentListWidget` takes `docIds` and nothing else
  (`apps/nuxeo-ui/src/app/agent-widgets.ts:42-46`), capped at
  `MAX_WIDGET_DOCUMENT_IDS = 25` (`agent-widget.ts:245`), and it _rejects_ any attempt to choose
  the list kind — `parse({ docIds: [UID], kind: 'favorites' })` returns null, asserted at
  `apps/nuxeo-ui/src/app/agent-widgets.spec.ts:322`. A dashboard tile pinned to 25 hardcoded uids
  is not a dashboard tile.
- `documentCardWidget` takes one `docId` and an optional field enum
  (`libs/shared/ui/src/lib/document-metadata-card/document-metadata-card.agent-widget.ts:36-47`).

The underlying component is more capable than its widget — `DocumentListPageComponent` supports
`recently-viewed`, `expired-queue`, `favorites` and `by-id`
(`libs/features/document-lists/src/lib/document-list-page/document-list-page.component.ts:30`) —
but the widget hardcodes `kind: 'by-id'` in `inputs` (`agent-widgets.ts:56`) precisely because
`by-id` is the one list definition with no write action (`agent-widgets.spec.ts:297-311`). Widening
it for a page is a small change with a real consequence: a `favorites` tile offers an un-favorite
action (`document-list-page.component.ts:321-333`), which is a write from a mounted component. On a
page that is fine — it is the user's own click on their own page, not an agent-caused write — but
the "read-only by construction" property the widget currently enjoys is lost, and the reasoning
that justified it (`agent-widgets.ts:50-54`) has to be rewritten rather than assumed.

**Cost.** The catalogue is the largest uncosted item. The repository has 65 components, 20 of them
in `libs/shared/ui` (counted by `@Component` across `libs`, excluding specs). Most are dialogs,
which do not travel — thirty inject `MatDialogRef` non-optionally
(`docs/generative-ui-readiness.md:189-197`). A credible first dashboard catalogue is perhaps six to
eight tiles. Building each as a new component rather than extracting one is the cheaper path, and
the plan says so twice from evidence:

> **This is now the second time that call was the cheaper one**, which makes it a pattern rather
> than a coincidence
> — `docs/beta-engineering-plan.md:194`

Call it **2–4 engineer-days per tile** including tests, which brackets the two A7 widgets: the
metadata card was written new inside a 7–10 day stage that also built the registry, and the
metadata form came in under its own budget. So **12–32 engineer-days for a six-to-eight tile
catalogue**, before any builder machinery and before the responsive work in §4.4.

### 4.2 Responsive layout — the finding most likely to sink a naive grid builder

The brief is right that this is the risk, and the measured evidence is stronger than the summary
of it.

**What was measured.** 1–2 engineer-days per component for the 400px pass, twice, and it did not
compress:

> **The 400px pass held at 1–2 days per widget and did not compress.** The card needed its own
> container-query breakpoints; nothing from the list's design pass transferred.
> — `docs/beta-engineering-plan.md:177`

> The registry machinery got cheaper per widget; this did not, because it is judgement about one
> component's content rather than plumbing.
> — `docs/generative-ui-widgets.md:213`

**What the judgement actually looked like**, because this is what does not automate. From the
compact modifier on the one list that has one
(`libs/features/document-lists/src/lib/document-list-page/document-list-page.component.scss:188-239`):

- It is a modifier class, not a media query, and the comment explains why: "The constraint is the
  width of the container this instance was put in, not the width of the viewport, and the page and
  the panel can be on screen at the same time" (`:192-195`). A grid builder has exactly this
  property, so every tile needs container-relative sizing rather than viewport breakpoints.
- Columns are dropped rather than wrapped, because the grid's own floor is 776px
  (`:65`, `:197-199`).
- The date column is hand-tuned to 74px: "74px is the rendered width of an ISO date at 11px.
  Anything less truncates every row to `2026-08-…`" (`:221-222`).
- And the finding that generalises worst of all: **adding a fifth element costs an existing one.**
  "A checkbox costs the date its column. At 400px there is room for a tick, an icon, a title and a
  path, and adding a fifth thing takes the title below the width at which two documents in the same
  folder can be told apart." (`:228-232`)

That last one is a product decision about one component at one width. No builder makes it
automatically, and there is one per component per width band.

**What that means for a builder.** The chat panel is a single width — 400px
(`apps/nuxeo-ui/src/app/shell/app-shell.component.scss:219`). A dashboard builder introduces N
widths. The design cost is therefore per **component × width context**, not per component.

The repository has exactly two container queries, both added by A7 —
`@container (max-width: 260px)` on the card and `@container (max-width: 300px)` on the form. Every
other breakpoint is a viewport media query, and the lowest ones are on the login page, the import
dialog and the app shell rather than on any list. The claim in
`docs/beta-engineering-plan.md:216` that "no media query in the repository goes below 900px" is
now stale — there are queries at 400, 600, 640, 700, 720, 768 and 800px — but not in a way that
helps: none of them is on a list or a data grid. The substantive claim behind that sentence still
holds.

**The arithmetic, and the lever that controls it.** Take a catalogue of N tiles and W permitted
width bands, minus the full-width band each tile that also has a page already supports:

| Builder design                   | Extra bands per tile | Design cost for N=8 tiles |
| -------------------------------- | -------------------- | ------------------------- |
| Full width only (a stacked page) | 0                    | ~0 extra days             |
| Half and full                    | 1                    | **8–16 engineer-days**    |
| Third, half and full             | 2                    | **16–32 engineer-days**   |
| Free 12-column resize            | 3–4 realistically    | **24–64 engineer-days**   |

The right-hand column is design judgement of the kind quoted above, and it comes on top of
building the tiles at all (§4.1). At the free-resize end it exceeds the entire measured cost of A7
stages 0–3 (23–32 days, `docs/beta-engineering-plan.md:163`) in CSS alone.

**So the constraint is real, and it is also controllable.** "How many widths may a tile be" looks
like a UX preference and is in fact the largest single cost lever in the whole proposal. A builder
that offers half-width and full-width and nothing else is roughly a quarter the design cost of one
that offers free resizing, and it is the shape I would recommend if this is built. That is a
product call and it should be taken with the cost attached rather than as a design detail. §9.

### 4.3 Saved layouts are a versioning problem — and half of it is already solved

A persisted page is a list of `{ component, props, placement }`. What happens on upgrade:

**Already handled, and better than expected.** The failure modes both have code paths that exist
and are tested:

- **Component removed from the catalogue** → `catalogue.get(name)` misses →
  `reason: 'unknown-widget'` → the user is told "The assistant asked for a view this application
  does not provide." (`agent-widget.ts:370`, `agent-widget-host.component.ts:208-211`). One tile
  shows a notice; the page renders.
- **Prop shape changed** → `parseProps` returns null → `reason: 'invalid-props'` → same, with a
  different sentence. Atomic by design: "One malformed uid rejects the whole request"
  (`agent-widget.ts:36-37`).
- **A contributed parser throws** → treated as a refusal, not a broken page
  (`agent-widget.ts:375-383`).

So a saved page **degrades tile-by-tile and never crashes**, for free, today. That is a genuinely
good starting position and it is not luck — it is the deny-by-default posture the chat registry
was built with, which happens to be exactly right here.

**Not handled at all, and this is the real problem.** Two things:

1. **Adding an optional prop is safe; renaming or removing one is silently breaking.**
   `exactProps` refuses any undeclared key rather than ignoring it
   (`agent-widget.ts:273-283`) — deliberately, so a widget "cannot quietly grow a content prop"
   (`:38-39`). The consequence for saved pages is that old props are rejected rather than
   tolerated. There is no version field on `AgentWidgetDefinition` and no migration hook anywhere
   in `agent-widget.ts`.
2. **Nobody can see it coming.** There is no way to enumerate saved pages and tell a release
   manager "this change breaks 400 customer dashboards" or tell an administrator "three of your
   pages will lose a tile after the upgrade". That needs a catalogue-version concept, a saved-page
   inventory query, and an upgrade report. None exists.

The distinction that matters: the **runtime** failure mode is safe and shipped; the **product**
failure mode — a customer's dashboard quietly loses a tile on a Tuesday — is entirely unaddressed.
It is also the thing that turns a component contract into a compatibility commitment. The moment
customers have saved pages, `AgentWidgetDefinition`'s props become a **public API with a
deprecation policy**, and today it is documented as a contract we may still shape
(`docs/generative-ui-widgets.md` is written as guidance, not as a versioned interface).

**Cost:** version field, migration hook, inventory query and an upgrade report — **8–12
engineer-days**, and it is the item most likely to be cut and most expensive to add late.

### 4.4 Governance is unbuilt, and sharing is nearly free

**Unbuilt.** The feature flag is browser-local: `AiFeatureFlagService` persists
`ai-features-enabled` to `localStorage` (`libs/shared/ai-client/src/lib/ai-feature-flag.service.ts:5`,
`:48-53`) — per browser, not per user, with no administrator control. A9 is Pending
(`docs/beta-engineering-plan.md:435`), and the plan's own framing applies verbatim to pages: that
posture "is defensible for a POC where AI only answers questions. It is not defensible for an
agent that mutates content" (`:243`).

A page builder raises questions A9 does not currently cover: who may create a page, who may
publish one to others, who may set an organisation default, who may retract one, and whether an
administrator can disable the builder entirely. **Overlap to name: this is A9's scope extended, not
a parallel governance system.** Scoping a builder without folding it into A9 would produce two
capability-configuration surfaces.

**Nearly free.** The identity half already exists — `ADMIN_ACCESS_CHECKS` provides
`isAdministrator`, `isPowerUser` and `hasAdministrationAccess`
(`apps/nuxeo-ui/src/app/app.config.ts:79-89`), with an `adminGuard` on the administration route
(`AGENTS/00-architecture.md:329`). And if a page is a Nuxeo document, _sharing_ is free in the same
way threads are: "a thread is owned and ACL-protected by its author with no extra permission model"
(`docs/adr/001-agent-runtime.md:1278`), with the saved-search sharing dialog as the working
precedent (§3.2).

**Cost:** the create/publish/retract/default-page rules, on top of A9 — **10–15 engineer-days**,
mostly product decisions rendered as code rather than hard engineering.

### 4.5 Third-party components — the real ask hidden inside "library"

Two very different problems, and the registry serves exactly one of them.

**A customer's own developer adds a widget to their build. Supported today, with conditions.**
It is one more argument to `provideAgentWidgets(...)` and no change to the panel
(`apps/nuxeo-ui/src/app/agent-widgets.ts:18-20`, `docs/generative-ui-widgets.md:65-72`), and
`documentCardWidget` is the worked example of a definition shipping from a library beside its
component (`document-metadata-card.agent-widget.ts:18-23`). The conditions are real:

- **Publish from a component-free entry point.** Registering through the main
  `@agentic-ui/shared/ui` barrel pulled every component into the initial chunk and overran the 2 MB
  budget by 251 kB (`docs/generative-ui-widgets.md:112-118`). The workaround is in
  `tsconfig.base.json:13-14` — dedicated `agent-widgets` and `agent-forms` entry points.
- **Angular alignment.** We are on `~19.2.0` (`package.json:45-50`). A contributed component
  compiles into the customer's build, so it must match.
- **And there is nothing to install.** `libs/shared/ui` has only `test` and `lint` targets
  (`libs/shared/ui/project.json:11-24`). Across the whole workspace, only `libs/shared/util`,
  `apps/agent-gateway` and `apps/nuxeo-ui` have a `build` target — **no Angular library in this
  repository is buildable or publishable today.** That is task B2, Pending
  (`docs/beta-engineering-plan.md:437`). A customer today cannot consume anything.

So "your developers can add components to the catalogue" is true of the _design_ and false of the
_distribution_, and B2 is the gate.

**A partner ships a component into a running deployment and it appears in a palette. No, and the
reasons are structural.** Three, in order of severity:

1. **There is no sandbox, and the code says so.**
   `outlet.createComponent(componentType, { injector: this.injector })`
   (`agent-widget-host.component.ts:126`) hands a contributed component the _application's_
   injector. It can inject any root-provided service, including every one that writes.
2. **Read-only is a convention, not an enforcement**, stated plainly in the contract:
   > Read-only is the other half of the contract and is not enforceable from here — it is a
   > property of the component. It is stated in `AgentWidgetDefinition`'s documentation and checked
   > by each widget's own tests.
   > — `agent-widget.ts:43-45`
   > Tests are ours to run against code we can see. They are not a control over a third party's build
   > artefact.
3. **The threat model is inverted.** Everything in `agent-widget.ts` defends the application
   against a hostile _props payload_ — a model steered by a poisoned document. Nothing defends it
   against a hostile _definition_. `parseProps`, `load` and `inputs` are all contributed code the
   application calls in-process; only `parseProps` is wrapped in a try/catch, and that is for
   robustness rather than containment (`agent-widget.ts:375-383`). **The registry's security model
   assumes the contributor is trusted.** For first-party and customer-developer contributions that
   is the correct assumption. For a partner marketplace it is not, and no amount of prop validation
   closes it.

Runtime installation would additionally need Module Federation or an equivalent, which is a
architecture decision with build, versioning and CSP consequences well beyond this document.

**Recommendation: say "your developers can build against our library" (B2, real, funded) and do
not say "partners can ship components into your deployment" (unfunded, unbounded, and currently
unsafe).**

---

## 5. Security — what a saved page gets free, and the one new surface it opens

### What is genuinely free

**The strongest property transfers intact.** Props are identifiers, so the _viewer's_ browser
re-fetches every document under the _viewer's_ session, and Nuxeo applies ACLs per read. The list
does this one uid at a time, on purpose:

> Nuxeo applies the caller's ACLs per read, so a uid the caller may not see fails its own request
> and is dropped while the rest of the list still renders
> — `document-list-page.component.ts:266-269`

So **a page shared with someone who cannot see a referenced document shows them fewer rows.** Not
an error, not a leak, not a partially-populated lie. That is the single best thing about building
this on the existing registry, and it is free. `AGENTS/07-security.md:122` states the same property
for the AI path: "Because the operation runs as the caller, an AI feature cannot read documents the
user cannot read."

The `inputs` translation (`agent-widget.ts:85-88`) similarly keeps the blast radius of a component
gaining a new input at zero until someone writes it into the definition.

### The new surface, and it is not the one the brief expected

**Configuration values are content, and content on a shared page is authored by someone other than
the viewer.** This is the genuinely new thing and the registry has no answer for it, because a
widget today has no title at all.

Nuxeo's ACLs protect the _documents_. They do not protect the _author's labels_. A tile titled
"Q4 Redundancy Candidates" leaks its own title to every viewer of a shared page, whether or not a
single row inside it is readable. And the empty state makes it worse rather than better: the list
says "None of these documents could be read."
(`document-list-page.component.ts:86`) — correct and honest in a chat transcript the user asked
for, and on a shared page it confirms to the viewer that documents exist which they may not see.

That is an information leak of a different class from the one the registry defends against, and it
is created by the feature rather than inherited.

**The conformance test that currently forbids it.** This is a concrete collision, not a
hypothetical:

> ```
> expect(value.length)
>   .withContext(`${widget.name} passes a suspiciously long input`)
>   .toBeLessThanOrEqual(64);
> ```
>
> — `apps/nuxeo-ui/src/app/agent-widgets.spec.ts:141-143`, under the comment "a string long enough
> to be prose is content, and content must never reach a component input"

A titled tile fails that test. Someone would have to delete or narrow it, and the guarantee in
`agent-widget.ts:28-32` would go from a property of the registry to a property of some of its
members — which is exactly the demotion the two-registry decision was taken to avoid
(`docs/adr/001-agent-runtime.md:694-695`). The right answer is almost certainly the same one taken
there: **a second registry, or a second declaration channel, for page tiles**, so the chat
registry's rule stays absolute. That is a design decision to take before writing anything, and it
is cheap to take early and expensive to take late.

**This is no longer an inference — it is a shipped precedent.** When the paragraph above was
written, the two-registry split was a decision recorded in ADR 001. A7 stage 3 has since
implemented it, and a page-tile registry would be the _third_ instance of the same pattern rather
than a novel design. What that buys, all of it verifiable:

- **The shape to copy.** `AGENT_FORM_COMPONENTS` is a second closed allowlist with its own token,
  its own parser and its own host, sitting beside `AGENT_WIDGETS` and sharing no code with it
  (`libs/shared/agent-client/src/lib/agent-form.ts`,
  `apps/nuxeo-ui/src/app/shell/ai-chat-panel/agent-form-host.component.ts`). A tile registry is the
  same three pieces again.
- **The cost of the split, measured.** A second registry needed a parallel `*.agent-form.ts`
  convention, a component-free `agent-forms.ts` entry point (`tsconfig.base.json:13-14`) and a
  sibling host — real work, but a small fraction of the estimate in §6, and none of it is the
  security argument.
- **The reason it was worth it, in one sentence.** The form channel's props _necessarily_ carry
  gateway-resolved content — `target.title`, each field's `label`, each field's stored `value` —
  and admitting one such member to the widget registry would have demoted rule 1 there from a
  property of the registry to a property of some of its members
  (`docs/adr/001-agent-runtime.md:694-699`). **A page tile's authored title is the same shape of
  prop as a form field's label.** The argument transfers without modification.
- **A guard that enforces the separation, and it bites.** `render-events.spec.ts` fails if the two
  name-spaces overlap. That is worth knowing precisely because it was found to be weaker than it
  read: it derived the gateway's emitted names by running each renderer over one fixed probe, so a
  renderer returning a form component for a _different_ result shape passed 573 of 573 tests. It
  now scans the source, and there is a test pinning that the scan covers renderer bodies and not
  just the map literal. **A third registry inherits a guard that has already been attacked once
  and hardened.**

The cost of _not_ separating them is also now concrete rather than theoretical. Stage 3's live
verification found two defects invisible to a green suite, both of them about a value's
provenance being unstated: a display-only field showed a model-proposed value with no marker, and
a settled card kept the model's proposed arguments after the user had edited them. Both are the
same failure a shared registry invites at scale — **a value nobody attributes is read as the
system's own.** On a page shared with colleagues, that value is the author's title and the reader
has no way to tell it from a system label.

**What is manageable.** Rendering an authored title is ordinary XSS hygiene and the rules already
exist — Angular template binding, never `innerHTML`, never `bypassSecurityTrust*`
(`AGENTS/07-security.md:53-69`). Add a length cap and it is a solved problem. The leak above is a
_product_ problem, not an escaping problem.

**A query as a configuration value.** If a tile is configured with NXQL, that query runs under the
viewer's session. `NuxeoApiBase.nxqlSearch` passes it as an `HttpParams` value rather than
concatenating it into a path (`libs/shared/nuxeo-client/src/lib/services/nuxeo-api-base.ts:33-43`),
so there is no transport-level injection. What remains is an arbitrary-read primitive within the
viewer's own rights — the same property ADR 001 already accepted for the agent's search tool:

> The model does author the NXQL, which makes this an arbitrary read _within the caller's
> permissions_
> — `docs/adr/001-agent-runtime.md:330`

Marginal risk is low, because the user can already run searches. `UNVERIFIED:` whether a
deliberately expensive NXQL saved into a widely-shared page is a denial-of-service concern against
Nuxeo. Confirming this needs someone who owns Nuxeo query governance; it is worth asking before a
query-shaped prop ships, not after.

**One thing to rule out explicitly.** A tile must not perform a write on the agent's behalf. The
existing rule — a write from a mounted component "leaves the browser carrying the user's Nuxeo
session and never reaches the gateway's approval gate"
(`agent-widget.ts:90-93`) — is about agent-caused writes. A user clicking a button on their own
page is a different thing and is fine. But if a page is ever rendered _inside the chat_, or a tile
is ever mounted from both channels, those two cases merge and the gate is silently absent again.
Keep the channels separate.

---

## 6. The options, honestly

### Option 1 — Do nothing beyond A8. Already funded.

A8 builds a recipe framework where "a recipe's rendered view **is a developer-authored composition
of registry widgets**" (`docs/beta-engineering-plan.md:239`), and it depends only on A7 stages 0–1,
which are complete. If the underlying need is "the compliance officer sees a purpose-built review
list", A8 already delivers it, and the product overview deliberately words the persona that way:

> **That view is defined by the access-review recipe rather than composed on the fly by the
> model** — the distinction is section 3.6, and it is the difference between something Beta ships
> and something Beta defers.
> — `docs/beta-product-overview.md:103`

**Take this option unless someone can name a need it does not meet.** It is the only one with zero
marginal cost.

### Option 2 — Pages as configuration. Developer- or admin-authored, no builder UI.

A page is a declarative document — widget names, props, placement — loaded and rendered at runtime.
This is A8's rendered view generalised from "one recipe's view" to "an arbitrary page", and it is
the increment that makes a builder possible later without committing to one now.

| Work                                                                                   | Days  | Reasoning                                                                                                             |
| -------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------- |
| Page-config schema, layout model and validator                                         | 3–5   | Same shape as `parseProps`; the validator idiom exists (`exactProps`, `parseEnum`, `agent-widget.ts:273-322`)         |
| Page host: mount N widgets into a grid, with teardown                                  | 2–3   | `AgentWidgetHostComponent` is 211 lines and already handles lazy races, input translation and teardown                |
| A tile declaration channel: display name, description, icon, config schema, size hints | 3–5   | New surface (§3.1). Plus ~1 day per existing widget. A separate registry from the chat's, per §5                      |
| Persistence, list, edit, delete, share                                                 | 4–6   | Copies the saved-search pattern (§3.2). **Blocked on the A6 doctype decision**                                        |
| Widening the prop contract for titles and queries, with the security work              | 3–5   | Includes revising `agent-widgets.spec.ts:124-146` and writing down the replacement rule                               |
| Six to eight real tiles, from the dashboard's inline markup                            | 12–32 | §4.1: 2–4 days each, bracketing the two A7 widgets                                                                    |
| Responsive passes, half-and-full-width only                                            | 8–16  | §4.2: 1–2 days per tile per extra width context, measured twice without compressing                                   |
| Live verification, budgeted per increment rather than as a hardening pass              | 3–5   | `docs/beta-engineering-plan.md:179` — three A7 stages running where the unit suite was green and the screen was wrong |

**Total: 38–77 engineer-days.** Call the working figure **45–65** if the tile count is held to six
and the width bands to two. Roughly eight to thirteen weeks of one engineer including review and CI
— comparable to the whole of A7, for a capability nobody has committed to.

### Option 3 — An end-user builder UI on top of option 2.

| Work                                                                         | Days  | Reasoning                                                                                                                                                                       |
| ---------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Palette, add/remove, drag and resize                                         | 10–18 | `@angular/cdk` ~19.2.0 is already a dependency (`package.json:45`) so no new one is needed, but **nothing in `libs` or `apps` uses `cdkDrag` today** — it is unprecedented here |
| A configuration form per tile, generated from the declared schema            | 8–14  | The same problem `document-metadata-form` solved for one fixed field set; generalising it to a schema is the harder version                                                     |
| Versioning, migration hook, saved-page inventory, upgrade report             | 8–12  | §4.3. Nothing exists                                                                                                                                                            |
| Governance: create, publish, share, retract, org defaults — **on top of A9** | 10–15 | §4.4. A9 itself is Pending                                                                                                                                                      |
| Live verification                                                            | 4–6   | Same reasoning as above; a builder has more state than a transcript                                                                                                             |

**Additional: 40–65 engineer-days.** Option 2 + option 3 is **78–142 engineer-days**, sixteen to
twenty-eight weeks of one engineer. Against A7 stages 0–3 at 23–32 days
(`docs/beta-engineering-plan.md:163`), this is **three to four and a half times the whole of A7**,
proposed into a plan where A6, A8, A9, B2, C2 and C3 are all still Pending
(`docs/beta-engineering-plan.md:428-439`), and where the plan already records that "the timeline is
aggressive" with "all three tracks running concurrently" (`:336`).

### The recommendation

**Option 1 now; option 2 only if a named customer need survives §2's scoping question; option 3
not in this window.**

If option 2 is taken, sequence it _after_ A6 settles the doctype and _with_ A9 rather than beside
it, and design the tile declaration as a second registry from the first day (§5) — that decision
costs nothing on day one and is very expensive to retrofit.

---

## 7. Does a page builder change the ADF HX comparison?

**No, and it slightly strengthens the current decision.** Four reasons.

**ADF HX has nothing of the sort, on either roadmap.** A term sweep of
`docs/adf-hx-greenfield-ecm-dam.md`, `docs/adf-hx-vs-nuxeo-satori-decision.md` and
`docs/adf-hx-for-beta-analysis.md` for page builder, dashboard builder, dashlet, layout builder,
widget catalogue, saved layout and composable returns nothing. Their nearest adjacent item is a
_proposed, unbuilt_ `<hxp-content-browser>` developer composite
(`docs/adf-hx-greenfield-ecm-dam.md:192`), and Hyland's own gap list says there is "**no
orchestration layer** — no component combining tree, list, breadcrumb and filters"
(`docs/adf-hx-vs-nuxeo-satori-decision.md:115`). So adoption buys none of this.

**And their library has no DAM at all** — a sweep across all 861 files returns "**zero occurrences
of `thumbnail`**", plus nothing for lightbox, gallery, EXIF, IPTC or watermark
(`docs/adf-hx-vs-nuxeo-satori-decision.md:95-109`). Half of "ECM **and DAM** components" would be
ours to build regardless.

**The gate conditions are untouched.** They are about the abstraction merging, Wave 3 starting, the
nine ADRs moving to Accepted, package installability and adapter ownership
(`docs/adf-hx-for-beta-analysis.md:259`, `docs/adf-hx-vs-nuxeo-satori-decision.md:297`). A page
builder changes none of those inputs.

**The one thing it does change, and it cuts two ways.** A builder makes B2 more valuable — a
catalogue is only interesting if others can extend it, and B2 is the prerequisite (§4.5). It also
_widens_ a risk the plan already names:

> **We may be building a second Hyland content library.** The CSX RFC exists precisely to prevent
> divergent forks.
> — `docs/beta-engineering-plan.md:337`

A layout schema is a much stickier fork than a component set, because **customer data becomes bound
to it**. Saved pages are not something you migrate cheaply. If this is pursued, the schema should
be raised with CSX before it ships, not after — that is a cheap conversation now and an impossible
one once customers have saved pages.

---

## 8. What is safe to say to a customer, and what becomes a commitment we regret

**Safe, because it is true today or funded:**

- "The components are a registry with a documented public contribution contract." True —
  `docs/generative-ui-widgets.md`, two widgets, one of them contributed from a library rather than
  written in the app (`agent-widgets.spec.ts:86-91`).
- "Views in our agentic recipes are assembled from that registry." True once A8 ships; A8 is funded
  and its A7 dependency is complete (`docs/beta-engineering-plan.md:239`).
- "We intend to publish the component library so your developers build against it." B2, funded,
  Pending — say _intend_, and do not date it.
- "A page you share inherits Nuxeo's permissions; someone who cannot see a document does not see
  it." True by construction if built on the registry (§5), and already true of saved searches.

**Unsafe, in descending order of how much it would hurt:**

- **"Your users will be able to build their own dashboards."** Unfunded, 78–142 engineer-days, and
  it is Track D by another name (§2).
- **"Partners can ship components into your deployment."** No sandbox, contributed code gets the
  app injector, nothing is publishable yet (§4.5). This is the one that would be quoted back at us
  in a procurement conversation.
- **"This replaces Studio."** It replaces at most dashboard composition. Studio's layouts are
  document layouts, and conflating the two is the exact error the A7 rescope corrected (§2).
- **"Any of the above, by Beta."** Nothing here has a task, and six plan tasks are already Pending.

**The formulation I would actually use:** _"The component catalogue is designed as an extension
point, and our roadmap is to publish it so your team can build against it and contribute to it.
Runtime page composition by end users is a direction we are evaluating, not a Beta commitment."_
That is defensible against every file cited here.

---

## 9. Decisions that are product calls, not engineering ones

1. **Dashboard composition or document-layout composition?** §2. Answer this first; everything
   downstream differs.
2. **How many widths may a tile be?** Presented as UX, actually the largest cost lever in the
   proposal — roughly 4× between "half and full" and "free resize" (§4.2). Take it with the cost
   attached.
3. **Are third-party components in scope?** §4.5. A yes changes the security model rather than
   extending it.
4. **Does the prop contract admit authored titles and queries?** §5. This weakens a currently
   absolute guarantee and creates a leak class Nuxeo's ACLs do not cover. Product owns the trade;
   engineering owns the mitigation.
5. **Who owns a page — user, group, or organisation? Can an administrator force a default or
   retract one?** §4.4, and it is A9's scope rather than a new one.
6. **Is the compatibility commitment acceptable?** The moment customers save pages, widget props
   become a public API with a deprecation policy (§4.3).

---

## 10. Questions I could not answer

1. **Which layout kinds the Studio Designer Integration status report actually covers.** It is a
   Confluence page linked from `docs/beta-product-overview.md:140`, not in this repository; I
   searched `docs/` and found only the link and the prose about it. This decides §2 and it is the
   most load-bearing unknown here. _Confirmed by:_ reading that page.
2. **Whether a custom doctype for a saved page can be contributed by the same marketplace package
   that ships this UI, without a Studio project.** ADR 001 defers the identical question for
   threads (`docs/adr/001-agent-runtime.md:1286`). _Confirmed by:_ whoever owns A6 and the Nuxeo
   packaging story.
3. **Whether a deliberately expensive NXQL saved into a widely-shared page is a denial-of-service
   concern.** The transport is safe (§5); query governance is not something this repository can
   answer. _Confirmed by:_ Nuxeo platform engineering.
4. **Whether any customer has asked for this.** No persona in `docs/beta-product-overview.md:97-107`
   asks to compose a page. The two personas who "assemble" anything assemble **collections of
   documents**, not views (`:99`, `:101`), and ad-hoc reporting — the closest use case — was moved
   to post-Beta on 7 August specifically because "what it waits on is a capability, not a
   configuration" (`:130-132`). _Confirmed by:_ product, from customer conversations rather than
   from this repository.
5. **Whether Satori offers or plans a dashboard or layout primitive.** Nothing in this repository
   says. Building our own layout model when the design system is about to ship one would be
   avoidable duplication. _Confirmed by:_ the Satori team, via
   `docs/satori-upstream-requests.md`.
6. **Whether the four Pending tasks would actually absorb this.** I did not attempt a schedule; the
   plan's own sequencing (`docs/beta-engineering-plan.md:321-331`) has A8 landing in the last phase
   already, and `:342` warns that is the schedule's main exposure. _Confirmed by:_ whoever holds
   capacity.
