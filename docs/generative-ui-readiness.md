# Generative UI readiness — can we render our own functional components in the chat?

|          |                                                                       |
| -------- | --------------------------------------------------------------------- |
| Status   | Assessment. No code changed.                                          |
| Date     | 2026-08-07                                                            |
| Branch   | `beta-delivery`                                                       |
| Assesses | Plan task A7, against a sibling team's proof of concept               |
| Verdict  | Read-only half reachable for Beta. Mutating, stateful half not as-is. |
| Cost     | 24–34 engineer-days for stages 0–3. Upload and delete out of scope.   |

The goal being assessed is **extract the functional components from the app's own UI and
render them inside the AI chat, chosen by the question** — the harder version, where the
chat mounts the same interactive, mutating components the pages use, not a set of
chat-specific read-only widgets.

Everything below was read from the code on this branch. Line references are to that state.

---

> ## Read this before you take anything below as an instruction
>
> **This is a point-in-time assessment, not a live specification.** It was written on 7 August 2026
> to size plan task A7 and to argue for a shape. Stages 0, 1 and 2 have since been built, and where
> the implementation and this document differ, **the implementation is the decision and this
> document is the record of what was expected**. It is kept rather than rewritten because the
> reasoning still holds even where the conclusions moved, and because the cost argument was made to
> leadership in these terms.
>
> Three things a reader must not carry away as current:
>
> - **Every line reference is pinned to `beta-delivery` on 7 August 2026 and most have moved.** They
>   are evidence that a claim was checked, not coordinates. Grep for the symbol.
> - **§5 rule 2 and §8's registry map describe a closed union type in shared code.** That is not
>   what was built. Validation is per-widget and the registry is an injectable multi-provider token
>   — corrected in place below, and specified in `generative-ui-widgets.md`.
> - **The cost line above, 24–34 engineer-days, was superseded on the same day** by a walking
>   skeleton that brought stage 1 down from 9–13 days to 7–10 and the total to **23–32**. The
>   current figure lives in `beta-engineering-plan.md`; see §9 below.
>
> Normative statements about the wire contract live in `docs/adr/001-agent-runtime.md`. The
> contributor-facing contract lives in `docs/generative-ui-widgets.md`. Where a fresh reader needs
> only one of the three, it is not this one.

---

## 1. Summary

**The harder version is not reachable for Beta as _the same component instances_.** It is
reachable as _one component used in two places_, provided we do the presentational/container
split first and accept that the write path is rebuilt rather than lifted.

The single biggest obstacle is not Angular, not the 400px panel, and not the dependency
boundary — all three are solved or solvable. It is that **every write-bearing component we
own executes its own write.** Thirty dialog components inject `MatDialogRef`, none of them
optionally, and each one calls a domain service directly from its submit handler:
`EditMetadataDialogComponent.save()` calls `browseService.updateDocument()` at
`libs/features/browse/src/lib/edit-metadata-dialog/edit-metadata-dialog.ts:514`;
`AddPermissionDialogComponent.create()` calls `detailService.addPermissionWithNotification()`
at `libs/shared/ui/src/lib/add-permission-dialog/add-permission-dialog.ts:339`.

Lift one of those into the chat and the write leaves the browser carrying the user's Nuxeo
session and never touches the gateway. The server-enforced approval gate added on
6 August (`apps/agent-gateway/src/tools/tool-registry.ts:96-107`) is not bypassed — it is
simply not on the path. That is the same defect the amendment was written to close,
reintroduced through a different door, and it is the reason "lift the component as-is" is
the most dangerous cheap option on the table.

A7's current description understates the work. See §8.

---

## 2. What the proof of concept actually demonstrates, and what it does not

Five screenshots, read carefully:

| Shot | Shows                                                            | What it proves  | What it does not                                                   |
| ---- | ---------------------------------------------------------------- | --------------- | ------------------------------------------------------------------ |
| 1    | Upload form: location picker, content-type select, Upload button | A form renders  | That it validates, uploads, reports progress, cancels, or retries  |
| 2    | Document list: checkboxes, Title and Modified columns            | A table renders | That its selection reconciles with the application's own selection |
| 3    | A later turn acting on "the selected document"                   | State survives  | Whether via shared state or via a context string                   |

> **Resolved, 7 August 2026.** Screenshot 3's mechanism is now known from source, not inferred:
> it is a context string, not shared state. Their client rebuilds an untyped English
> `role: 'system'` message each turn and their server parses it back with a regular expression;
> `RunAgentInput.state` is `{}` on every turn and `STATE_DELTA` is never emitted or consumed.
> More generally, **their PoC validates none of the AG-UI features our design leans on** — no
> `STATE_DELTA`, no `TOOL_CALL_RESULT`, no `CUSTOM`, no interrupt `outcome`, no `resume`. They use
> `@ag-ui/*` on the client only, at `^0.0.53` with a caret, and their Node service has no
> `@ag-ui/*` dependency at all. Nothing below should be read as inheriting their assurance.
> See [the teardown](csx-generative-ui-teardown.md) §4 and §6.
> | 4 | Metadata form: Title, Content Type, Created, Modified, Creator, Contributor | Fields render | Whether any field is editable — every one could be a disabled input |
> | 5 | The app's own Delete Document confirmation dialog | A dialog opens | Anything about generative UI |

Screenshot 5 is worth naming plainly: a chat message triggering the application's existing
`MatDialog` is not generative UI. It is approximately what our `confirmAction` tool already
does, rendered as a modal instead of a card. It is also the _worse_ interaction of the two —
a modal steals focus from the transcript the decision is about.

None of the five shows a permission error, a validation failure, a user without write
access, a concurrent edit, a 400px viewport, or the same component still working on its
own page. Those are where the cost is.

Screenshot 3 is the most interesting one, and the most encouraging: see §6, where it turns
out we can already do that today.

---

## 3. Inventory: what could be rendered in the chat panel

The panel is `apps/nuxeo-ui/src/app/shell/ai-chat-panel/` inside a
`mat-sidenav` fixed at **400px** (`apps/nuxeo-ui/src/app/shell/app-shell.component.scss:219`).
That number does most of the filtering below.

### Tier A — travels today, given props

| Component                                                                                                | Why it travels                                                               | Caveat                                                                                                             |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `DocumentViewerComponent` (`libs/shared/ui/src/lib/document-viewer/document-viewer.component.ts:99-132`) | 20+ pure `input()`s, no `ActivatedRoute`, no route-derived state             | Its data — blob URLs, picture views, EXIF — is assembled by `DocumentDetailComponent`, so the _props_ are the work |
| `SelectionTopbarComponent` (`selection-topbar.component.ts:28-29`)                                       | `input.required<number>()` plus one array input; presentational              | Designed for a full-width bar                                                                                      |
| `WidgetGridComponent` / `WidgetContainerComponent`                                                       | `widget-grid.component.ts` is 12 lines with a single `columns` input (`:11`) | This is what A7 says the registry builds on. It is an empty shell — see §8                                         |
| `ConfirmDialogComponent` (`confirm-dialog.component.ts:40`)                                              | The only dialog that injects `MAT_DIALOG_DATA` and **not** `MatDialogRef`    | Closes via `mat-dialog-close` in its template, so inline use needs a small template change                         |
| `NoteEditorComponent` (`note-editor.ts:54-55`)                                                           | Two required inputs, no route                                                | Quill; heavy for a 400px column                                                                                    |

That is the whole of Tier A, and none of it is what the proof of concept shows.

### Tier B — needs a presentational/container split

**`AssetSearchResultsComponent`** — `libs/features/assets/src/lib/asset-search-results/asset-search-results.component.ts`,
959 TS + 232 HTML. This is the closest thing we own to screenshot 2: checkbox column,
Title/Modified columns, wired to `SelectionService`. Real blockers:

- `private readonly route = inject(ActivatedRoute)` (`:306`) and the entire data pipeline is
  `this.route.queryParamMap.pipe(switchMap(...))` (`:335-364`). **The component has no way to
  be given a query.** The URL is its only input.
- `toSignal(this.route.queryParamMap, { requireSync: true })` (`:327`) **throws** if the
  injected route does not emit synchronously. In the chat panel the injected `ActivatedRoute`
  is the shell's, not the assets page's.
- It writes to a page-level singleton mid-pipeline: `aggregationService.aggregations.set(...)`
  and `.items.set(...)` (`:344-354`). Mounting it in the chat would silently overwrite the
  facet state of the `/documents` drawer.
- Layout: `gridTemplate` is computed at `:397` from `ALL_COLUMNS` (`:40-52`). The default
  visible set — name 280px, modified 140px, contributor 180px, plus two 40px gutters — is a
  **680px minimum in a 400px panel**. Its media queries stop at 900px
  (`asset-search-results.component.scss:589-610`); nothing below that exists.

**`DocumentListPageComponent`** — `libs/features/document-lists/.../document-list-page.component.ts`,
206 lines, the newest and cleanest list in the repo:

- `kind = input.required<DocumentListKind>()` (`:96`) is route-`data`-bound but is an ordinary
  signal input, so it binds fine under `setInput`. Good.
- But it is **data-source-closed**: `requestFor()` (`:151-162`) knows exactly three list kinds
  and nothing else. An agent cannot hand it arbitrary result rows without a new input.
- It has **no selection at all** — it never touches `SelectionService` — so it cannot produce
  screenshot 2's checkbox list.
- Layout: `grid-template-columns: 48px minmax(240px, 1fr) 120px 180px 140px 48px`
  (`document-list-page.component.scss:65`) is a **776px minimum**.

**`AssetsDrawerComponent`** — 582 lines. Already proven to render outside its own feature: the
shell lazy-loads it into a shell-owned drawer at
`apps/nuxeo-ui/src/app/shell/nav-drawer/nav-drawer.component.ts:370`. But
`toSignal(this.route.queryParamMap, { requireSync: true })` (`:91`) and its
`AssetAggregationService` coupling mean that in a chat panel it would filter _the assets
page_, not the chat's own result set. It is the precedent and the cautionary tale in one file.

**`TasksPageComponent`** — 808 lines. `route.snapshot.paramMap.get('taskId')` inside
`loadTasks()` (`:200`), self-loading `ngOnInit` (`:182`), and it injects `HttpClient`
directly at `:66`, which violates rule 3 of `AGENTS/00-architecture.md`. Two-pane
master/detail layout on top.

### Tier C — rebuild, do not port

**`DocumentDetailComponent`** — 3962 TS + 2021 HTML. Twenty injected services (`:257-279`),
`HttpClient` direct (`:264`), `NuxeoApiBase` direct (`:269`), `route.paramMap.subscribe`
(`:806`) filling `private docUid` (`:315`). Screenshot 4's field set — Title, Content Type,
Created, Last Modified, Creator, Last Contributor — lives inline in that 2021-line template.
There is no extractable metadata sub-component; there is a properties panel woven into a page.

**`BrowseComponent`** — 1548 TS + 986 HTML. Driven by `router.events` and the
`BrowseContextService` page-level singleton (`:444-467`, `:165`). Its checkbox document list
is inline at `browse.html:288-320`.

**`CreateImportDialogComponent`** — 1437 lines, the closest analogue to screenshot 1. It
injects `MatDialogRef` (`:202`) and `MAT_DIALOG_DATA` (`:206`) non-optionally, so it throws a
`NullInjectorError` outside a `MatDialog` context, and it **resizes its own dialog from an
effect**: `dialogRef.updateSize('960px', '680px')` (`:236-239`). It cannot render inline at
all without surgery.

**Every write-bearing dialog.** Thirty components inject `MatDialogRef`; a grep for an
optional injection of it across `libs/` returns nothing. The permission dialogs
(`add-permission-dialog.ts:279-280`, `update-permission-dialog.ts:228-229`,
`delete-permission-dialog.ts:98-99`), the metadata editors
(`edit-metadata-dialog.ts:345-346`, `edit-document-dialog.ts:348-349`,
`edit-collection-dialog.ts:348-349`), versioning, publishing, attachments, user and group
forms, vocabulary entries — all the same shape. `SavedSearchDialogComponent` is the only one
that reads its data with `{ optional: true }` (`saved-search-dialog.component.ts:79`), and it
still requires `MatDialogRef`.

`AddPermissionDialogComponent` additionally uses an inline `template:` (`:57`), so it is not
even conformant to the repo's own external-template rule before we start moving it.

### The blockers, clustered

Ranked by how often they actually appear, rather than by how likely they seemed:

1. **Non-optional `MatDialogRef`** — 30 components. The single most common hard blocker, and
   the cheapest to fix mechanically (`{ optional: true }` plus a close-callback input),
   though fixing it does not address blocker 2.
2. **Self-executing writes** — every dialog with a submit handler. This is the one that
   matters. §7.
3. **`ActivatedRoute` as the only data input** — `asset-search-results:306/327/335`,
   `assets-drawer:85/91`, `search:164`, `collection-detail:100`, `document-detail:258/806`,
   `tasks-page:59/200`, `knowledge-discovery:77`, `admin-user-details:56`,
   `admin-group-details:48`, `search-filters-drawer:62`. Eleven components.
4. **Layout floors well above 400px** — 776px (`document-list-page.scss:65`), 680px
   (`asset-search-results.component.ts:397`), 960×680 (`create-import-dialog:236-239`). No
   media query in the repo goes below 900px.
5. **Writes to page-level singletons from inside a data pipeline** —
   `asset-search-results:344-354` into `AssetAggregationService`; `browse.ts` throughout into
   `BrowseContextService`.
6. **Fetch-on-init from a current-folder context** — `BrowseComponent` via
   `BrowseContextService`; `TasksPageComponent.ngOnInit` (`:182`).

Two of the guesses in the brief did not hold up. `@Input`s typed on a page context are
rare — the repo uses signal inputs with plain types, and `DocumentViewerComponent` is a good
example of props done well. And "components that fetch on `ngOnInit`" is less common than
expected: most fetch from a route-driven `effect` or an RxJS pipeline instead, which is the
same problem wearing better clothes.

---

## 4. One component or two?

Three groups, and the split is not where cost intuition puts it.

**Travels as-is given props.** `DocumentViewerComponent`, `SelectionTopbarComponent`,
`WidgetGrid`/`WidgetContainer`, `ConfirmDialogComponent` with a token shim. Genuinely one
instance in two places, at near-zero cost — and collectively they do not deliver any of the
five screenshots.

**Needs a presentational core plus a page container.** `AssetSearchResultsComponent`,
`DocumentListPageComponent`, `AssetsDrawerComponent`, and the metadata form buried in the
edit dialogs. These end up as one _component_ serving both places, but only after the split;
before it they are one component serving one place.

**Needs rebuilding.** Everything write-bearing, plus `DocumentDetailComponent`,
`BrowseComponent` and `CreateImportDialogComponent`. For the write-bearing ones rebuilding is
not merely the cheap answer, it is the _correct_ one — see §7.

### Refactor shape, example 1: the result list

```
libs/shared/ui/src/lib/document-result-list/          ← new, presentational
  inputs:  rows: DocumentRow[], columns: ColumnKey[], selectable: boolean,
           density: 'comfortable' | 'compact'
  outputs: rowActivated, selectionChanged
  injects: nothing. No ActivatedRoute, no AssetService, no AssetAggregationService,
           no MatDialog, no SelectionService.

libs/features/assets/.../asset-search-results.component.ts   ← stays a container
  keeps route.queryParamMap → AssetService → mapToAssetResult
  keeps the AssetAggregationService writes
  keeps SelectionService
  renders <lib-document-result-list [rows]="assets()" …>
```

The 959-line component splits roughly 200 presentational / 760 container. The TypeScript is
the easy half; the SCSS is not — `gridTemplate` (`:397`) has to become either a container
query or an explicit `density="compact"` two-column mode, and the existing page must not
change visually. **4–6 engineer-days** including tests on both surfaces.

### Refactor shape, example 2: the metadata form

```
libs/shared/ui/src/lib/document-metadata-form/        ← new, presentational
  inputs:  fields: MetadataFieldDef[], values: Record<string, unknown>,
           vocabularies: VocabularyOptions, readonly: boolean, busy: boolean
  outputs: submitted: Record<string, unknown>          ← emits. Never writes.
  injects: nothing.

libs/features/browse/.../edit-metadata-dialog.ts      ← stays a container
  keeps MatDialogRef + MAT_DIALOG_DATA (:345-346)
  keeps the three DirectoryService loads (:388-407)
  keeps browseService.updateDocument (:514)
  renders the form, closes on (submitted)

apps/nuxeo-ui/.../chat-metadata-form-host             ← the chat's container
  renders the same form
  on (submitted), answers the gateway interrupt. Never writes directly.
```

This is the one that pays for itself: two real consumers, and the shape that makes the
approval gate work. **5–7 engineer-days.** The awkward parts are the three `DirectoryService`
calls in the dialog's constructor (`:388-407`), which have to move to the container or behind
an injectable data source, and the `expires` validation, which is entangled with `NgModel`
plus a custom `ErrorStateMatcher` (`:359-361`, `:475-498`).

### Refactor shape, example 3: upload — the one that does not travel

`CreateImportDialogComponent` is 1437 lines, resizes its own dialog from an effect
(`:236-239`), and carries a batch-upload state machine with per-file progress, a CSV import
mode and a location autocomplete. Splitting it is not worth attempting. The chat upload
affordance in screenshot 1 should be **rebuilt** as a small chat-native component over
`DocumentImportService`, deliberately sharing no code with the dialog. That is the honest
"some components do not travel" answer, and upload is the clearest case of it.

---

## 5. What the registry needs to be

### Angular gives us the mechanism, and we already use it

`ViewContainerRef.createComponent(type, { injector })` is in the repo today at
`apps/nuxeo-ui/src/app/shell/nav-drawer/dynamic-drawer.component.ts:71`, with correct
teardown at `:78-83`, fed by lazy `import()` of feature components at
`nav-drawer.component.ts:368-381`. We are on Angular `~19.2.0` (`package.json:48`), so
`ComponentRef.setInput()` and `NgComponentOutlet` with `ngComponentOutletInputs` are both
available. Outputs are read back with `componentRef.instance.<name>.subscribe(...)`, which
works for `EventEmitter` and for `output()`'s `OutputEmitterRef` alike, and must be torn down
with the `ComponentRef`. `DynamicDrawerComponent` destroys correctly but wires no outputs, so
that half is unprecedented here.

`setInput()` throws for a name the component does not declare as an input. That is a useful
second line of defence and not a validation layer — it catches a typo, not an attack.

### The dependency boundary — resolved, with a caveat that matters

The question was whether lazy-loading a feature component into the shell's chat panel breaks
the 4-layer rule now that `depConstraints` are enforced. It does not, and there is working
code to point at.

`eslint.config.mjs:35-43` permits `scope:app → scope:features`. `apps/nuxeo-ui` is
`scope:app` (`apps/nuxeo-ui/project.json`). The shell already imports feature drawers
dynamically (`nav-drawer.component.ts:370-372`), and dynamic `import()` keeps them out of the
initial chunk, so lazy loading is preserved. A chat-panel registry doing exactly what
`loadDrawerComponents()` does is lint-clean and bundle-clean today.

**The caveat is where the registry map lives.** `scope:shared → scope:features` is _not_ in
the allowlist (`eslint.config.mjs:51-55`) and fails lint. So:

- The registry **mechanism** — descriptor types, props validation, the host component, the
  teardown discipline — belongs in `libs/shared/` (a new `libs/shared/generative-ui`, or
  inside `libs/shared/agent-client`).
- The registry **map**, `Record<WidgetName, () => Promise<Type<unknown>>>`, must live in
  `apps/nuxeo-ui`, because it is the only project allowed to name a feature. This mirrors the
  existing content-adapter rule: only the composition root names concrete implementations.

If widgets are extracted into `libs/shared/ui` as §4 proposes, the map stops naming features
at all and the constraint stops biting. That is another argument for the split.

> **What was built instead, and it confirms the caveat rather than removing it.** There is no map.
> Each widget is a self-contained definition handed to `provideAgentWidgets(...)` in
> `apps/nuxeo-ui/src/app/app.config.ts`, and _where the definition may live_ is decided by the same
> lint rule this section derives. `documentListWidget` names `@agentic-ui/feature-document-lists`,
> so it must live in the app (`apps/nuxeo-ui/src/app/agent-widgets.ts`). `documentCardWidget`'s
> component is in `libs/shared/ui`, so the definition ships beside it — and that is the shape an
> external contribution takes. The prediction in the last paragraph held exactly: moving a widget
> into `libs/shared/ui` is what frees its definition from the composition root.
>
> One bundle constraint this section did not anticipate: a definition must be published from an
> entry point that imports no component. Registering `documentCardWidget` through the main
> `@agentic-ui/shared/ui` barrel pulled every component in that library into the initial chunk and
> overran the 2 MB budget by 251 kB. It ships from `libs/shared/ui/src/agent-widgets.ts`.

### What the registry must add, treating props as hostile

Props arrive from a language model that can be steered by document content an attacker
controls. Six rules, in descending order of how much they buy:

1. **Props are identifiers and enums, never content.** A widget takes `docIds: string[]`,
   `columns: ColumnKey[]`, `listKind: 'favorites' | …`. It takes **no** pre-rendered rows, no
   titles, no labels, no URLs, no HTML. The component re-fetches through the ordinary
   services under the caller's session. This single rule does most of the work: it makes a
   fabricated row impossible, makes a link to an attacker's host impossible, and gets ACL
   enforcement for free because Nuxeo re-applies them on the fetch. It also means a widget
   showing a document the user cannot read renders empty rather than renders a lie.
2. **A closed allowlist.** Not a `Type<unknown>` the model names. An unrecognised name renders
   nothing and reports it.

   > **Superseded, and the difference matters.** This rule originally specified the allowlist as a
   > `Record<WidgetName, WidgetDescriptor>` with `WidgetName` a TypeScript union in shared code.
   > **That is not what was built, and it should not be rebuilt.** A union in `libs/shared` cannot
   > be extended by a package outside this repository, which is the whole of the Level 4 claim the
   > registry exists to back; and a single central parser could not express the second widget's
   > props, because a single-object widget with a caller-chosen field list does not fit a shape
   > designed around an array of uids. So validation travels **with** each widget as its own
   > `parseProps`, and the registry is an **injectable Angular multi-provider token**
   > (`AGENT_WIDGETS` / `AGENT_WIDGET_CATALOGUE`,
   > `libs/shared/agent-client/src/lib/agent-widget.ts`).
   >
   > The property this rule was reaching for survives intact, and that is the point: providers are
   > evaluated at bootstrap, so the mountable set is fixed before the first token of the first run
   > streams, and there is no path from anything on the wire to a new entry. "Closed" was never
   > about the type system — it is about when the set stops changing.

3. **Deny by default**, in the shape `apps/agent-gateway/src/tools/mutation-policy.ts:30-31`
   already uses: the omission a developer will actually make must fall on the safe side.
4. **Validate props before `createComponent`, and reject atomically.** A partially populated
   component is worse than none. The gateway has the right idiom for this in
   `apps/agent-gateway/src/tools/args.ts` — `requiredString`, `requiredRecord`,
   `optionalStringArray`, all throwing one `ToolArgumentError`. The browser side needs the
   same thing and does not have it. Reuse the _pattern_, not the module:
   `eslint.config.mjs:63-66` gives `scope:agent-gateway` an empty allowlist, so the gateway
   shares no code with the browser bundle by construction.
5. **No free text reaches anything that can become markup.** Assistant prose is already
   sanitised through `AiMarkdownPipe`; widget props must not reopen that.
6. **Bound the blast radius.** A cap on widgets per turn and per thread, and a cap on
   array-valued props. Without it, a steered model mounts five hundred components.

Outputs travel the other way and need the same discipline: a widget's outputs are handled by
the _host_, which decides what — if anything — to tell the agent. A widget must not be able
to inject arbitrary text into the transcript.

---

## 6. Cross-turn state

### What already works, and it is more than expected

`SelectionService` (`libs/shared/nuxeo-client/src/lib/services/selection.service.ts`) is a
root singleton holding `selectedIds`, `selectedLabels`, `selectedPreviews` and
`selectedTypes` as signals. The agent can already write to it: `selectDocuments` is a
frontend-declared tool (`libs/shared/agent-client/src/lib/agent-tools.ts:67-83`) whose browser
handler calls `selection.selectAll(docIds)`
(`apps/nuxeo-ui/src/app/shell/ai-chat-panel/ai-chat-panel.component.ts:394-401`).

And it is read back into every subsequent run:

```
currentContext()            ai-chat-panel.component.ts:362-371   selectionIds from SelectionService
  → AgentRunContext
  → buildContext()          agent-runtime.service.ts:247-260     Context entry "selectedDocumentIds"
  → contextMessage()        apps/agent-gateway/src/agent/run-agent.ts:268-272   a system message
```

**So "select in turn 1, act on the selection in turn 3" already works today** — via context
injection, not via `STATE_DELTA`. Screenshot 3's "can you download the selected document" is
reachable on the current build.

### What is missing

- **`STATE_DELTA` is never emitted.** A grep across `apps/agent-gateway/src` for
  `STATE_DELTA` / `STATE_SNAPSHOT` returns nothing, in the live gateway _and_ in the demo
  gateway. The client handles all three state callbacks
  (`agent-runtime.service.ts:556-558`) and `sharedState` (`:101`) has **no consumer anywhere**
  outside its own spec file.
- **The capability probe advertises it as working.**
  `apps/agent-gateway/src/http/capabilities.ts:75` declares `sharedState: true`. ADR 001 makes
  the probe normative and requires the surface to work with every optional feature false, so
  this is a false claim in the one document a client is supposed to trust. Fixing it is a
  one-line change and should not wait for A7.

  > **Resolved, twice, and the second resolution is the current one.** The flag was corrected to
  > `false` on 7 August 2026 and returned to `true` the same day, when A7 stage 2 gave the channel
  > something to carry. Line 75 is no longer that declaration. Two things a reader must not carry
  > forward: the `true` is now honest but **narrower than the flag's name** — a `selectDocuments`
  > call emits a `STATE_SNAPSHOT` on `selection.proposed`, and a run that proposes nothing emits no
  > state event at all; and the flag is now pinned to observed behaviour by
  > `apps/agent-gateway/src/http/capabilities.spec.ts`, which fails in both directions and also
  > compares the probe body against the one published in ADR 001. Padding every run with an empty
  > frame to make the flag simpler is what caused stage 2's retraction defect — see ADR 001,
  > "Selection provenance".

- **The channel is empty in both directions.** `AgentRuntimeService.runTurn` passes only
  `tools`, `context` and `resume` (`:227-231`) — it never sends `state` up.
- **Selection is not durable.** `SelectionService` is in-memory; a reload loses it. And the
  asymmetry runs the other way too: `AgentRuntimeService.clear()` (`:174-190`) resets the
  transcript and shared state but leaves the selection standing.
- **Selection has no provenance.** The agent cannot distinguish "the user ticked these" from
  "I selected these last turn", so it cannot say "the three I found, not the one you had
  open".
- **Widget instance state has nowhere to live.** Which row a chat-rendered list has ticked,
  what a chat-rendered form has half-typed — none of it survives a re-render of the
  transcript. Making it survive means keyed state in `sharedState`, which means building the
  `STATE_DELTA` channel for real, on both ends.

> **Where stage 2 left this list.** The first three are closed: the gateway emits a
> `STATE_SNAPSHOT` on `selection.proposed` for a `selectDocuments` call, the browser consumes
> exactly that one path, and the flag is honest. "Selection has no provenance" is closed in a way
> this section did not anticipate and that is worth reading before building on it: the finding
> above — that `selectDocuments` writes straight into `SelectionService` and those ids come back as
> the next turn's context — turned out to be a **security defect rather than a feature**. A model
> could assert a selection, read it back one turn later as the user's, and leave the application's
> selection toolbar and its Delete action armed over documents nobody chose. So the agent now gets
> a separate proposal channel it cannot promote to a selection, and the user's own selection is
> deliberately **never** mirrored into shared state — a server-authored copy of "what the user
> chose" is the same vulnerability in a different coat. ADR 001, "Selection provenance", is
> normative for this.
>
> Two remain open and are stage 3's or later: **selection is not durable** across a reload, and
> **widget instance state has nowhere to live**. Do not solve the second with a per-run state
> snapshot; a run is not a turn, and stage 2 has the scar.

Net: the specific behaviour the proof of concept shows is already available. Anything richer
needs a channel that is currently declared and unbuilt.

---

## 7. Interaction with the approval gate

This is the subtlest question in the brief, so the reasoning is set out in full.

### The gate as built

A write is never executed in the turn the model requests it. The run ends with
`outcome: { type: 'interrupt' }`, one interrupt per write, `id === toolCallId`, arguments
taken from the model's own parsed tool call and never from its prose
(`apps/agent-gateway/src/agent/run-agent.ts:427-465`). Approval must arrive as a `resume`
entry with `payload.approved === true`; the gateway settles pending writes _before_ the model
is called (`:331-388`) and spends each approval against exactly one `toolCallId`
(`ledger.claim`, `:369`). The check itself sits in `ToolRegistry.execute`
(`tool-registry.ts:96-107`), deny-by-default (`mutation-policy.ts:30-31`).

### Why a submitted form is genuinely different

In an approval card, the model authored the arguments and the human authored only a boolean.
That asymmetry is exactly why the ADR insists the card's arguments come from the parsed call
rather than the prose: a "yes" has to attach to a specific, machine-read set of arguments or
it means nothing.

In a submitted form, the human authored the arguments _and_ the intent. There is nothing left
for them to consent to that they did not just type. Raising a card after submission would be
worse than redundant — it trains people to click Approve on cards they have not read, which
degrades the affordance that protects the cases where the model _did_ author the arguments.

### But "the user typed the values" is not "the request is trustworthy"

Three things stay model-influenced even when every visible value is hand-typed:

1. **The target.** The form was mounted with a `docId` the model supplied. A prompt-injected
   model can render a form that looks like it edits the document under discussion and
   actually carries the uid of another one. The user retitles something they never saw.
2. **The field set.** Which properties the form exposes — and therefore which properties the
   submission may write — was chosen by the model.
3. **Hidden fields.** Anything the form carries and does not display is model-authored,
   entirely.

So the correct framing is: **a form submission is not an approval, and it is not an
unapproved write either. It is a human-authored write whose _values_ need no consent and
whose _target and scope_ still do.**

### The design that follows

Rule out the obvious thing first. Do **not** let the chat-rendered form call
`BrowseService.updateDocument()` the way `EditMetadataDialogComponent.save()` does
(`edit-metadata-dialog.ts:514`). It would work, it would be one line, the write would carry
the user's session, Nuxeo would accept it, and the gateway would hold no record of it. Every
write form in the repo is built exactly this way, which is what makes this the default
outcome unless it is designed against.

Instead, bind the form's mount to the tool call that proposed it:

1. The model calls a mutating tool as it does today — `nuxeo.updateMetadata`, say — carrying
   the target `docId` and whatever values it suggests. The gateway gates it exactly as now:
   not executed, run ends on an interrupt, arguments parsed from the call.
2. The interrupt carries a new `metadata.render` naming a registry widget plus its props.
   This is additive and cheap: `interruptArgs()` (`agent-runtime.service.ts:660-671`) already
   tolerates arbitrary metadata, and `INTERRUPT_METADATA_KEYS` (`:42`) is the one-line change
   that keeps `render` out of the card's argument line.
3. The browser, instead of drawing Decline/Approve, mounts the widget seeded with
   `metadata.args`. **The widget is the affordance for answering the interrupt.**
4. On submit, the browser answers _the same interrupt_ with
   `{ status: 'resolved', payload: { approved: true, args: <edited> } }`. On cancel,
   `{ status: 'cancelled' }` — which the gateway already reads as a refusal
   (`run-agent.ts:686-698`) with no new code at all.
5. The gateway settles it in the existing pending-mutation loop. **One change is required and
   it is the whole security question:** the arguments actually executed must be
   `metadata.args` overlaid with the user's submitted values, **restricted to the fields the
   interrupt declared**, with the target taken from the interrupt and never from the payload.

The interrupt is the gateway's own record of what it gated. The payload is a channel the
browser writes but whose _shape_ the model chose. Taking the target and the field allowlist
from the interrupt, and only the values from the payload, is what makes "the user authored
the values" safe without it also meaning "the user authored the target".

Why this shape rather than a workaround:

- It rides the one channel the model provably cannot write to. `resume` is still a field of an
  HTTP body only the browser composes; ADR 001's "no model output can satisfy the gate" holds
  unchanged, with no new argument needed.
- **The second confirmation disappears by construction, not by exception.** There is no card
  because the form _is_ the answer. The user acts once.
- **One approval per write survives.** One interrupt, one form, one submission, one execution,
  `ledger.claim` spends it once. Two proposed forms in a turn produce two forms in one batch,
  exactly as two cards do today.
- ACLs stay where they belong. The write runs server-side through the tool with the caller's
  forwarded headers, so a user without permission gets Nuxeo's 403 mapped to "You do not have
  permission to perform that action in Nuxeo" (`run-agent.ts:294-300`). A browser-side form
  would have had to reimplement that mapping, and would have got it subtly wrong.

Two obligations this design still carries:

- **The form must show its target, resolved by the browser.** Title and path fetched from the
  uid via `DocumentDetailService` — never a label the model supplied. Otherwise problem (1)
  above is relocated rather than solved.
- **Undeclared fields are dropped server-side, by allowlist, silently.** The browser may send
  anything; the gateway decides what is in scope.

One limitation, stated rather than papered over: this covers writes the _model_ proposes. A
user who asks for a form unprompted — "show me the metadata form for this document" — has no
gated tool call to attach to. That case should be explicitly out of scope for Beta. Either the
model calls the tool and inherits the gate, or the user uses the real page. Inventing a second,
ungated path for user-initiated chat forms is precisely how a gate erodes.

---

## 8. Where A7 understates the work

`docs/beta-engineering-plan.md:120-124` reads:

> The agent proposes typed, app-validated widgets rendered through a component registry built
> on the existing `libs/shared/ui/src/lib/widget-grid/` and `widget-container/`. Shared state
> via `STATE_DELTA` lets the agent drive search filters and selection, with the app remaining
> the validator — the agent proposes, the app mounts.

Three corrections:

1. **"built on the existing `widget-grid`/`widget-container`" is building on nothing.**
   `widget-grid.component.ts` is 12 lines with a single `columns` input (`:11`). It is a CSS
   grid wrapper. It contributes no registry, no validation, no lifecycle, no widgets. The
   sentence reads as if a foundation exists; it does not.
2. **"Shared state via `STATE_DELTA`" describes a channel nothing emits.** Zero occurrences in
   the live or demo gateway; `sharedState` has no consumer in the browser; and
   `capabilities.ts:75` advertises it as `true`. Selection _does_ survive turns, but through
   context injection (§6), which is a different mechanism with different properties — it is
   one-way, string-shaped, and rebuilt from scratch each turn.
3. **"the agent proposes, the app mounts" is right about the security model and silent about
   the inventory.** It is exactly the right principle. What the plan does not say is that we
   currently own no mountable widget: the presentational components that a registry would
   mount do not exist yet and have to be extracted (§4), and the write-bearing ones cannot be
   mounted at all without the gate work in §7.

A7 as written reads like a fortnight. Stages 0–3 below are 24–34 engineer-days, and that
excludes upload and delete entirely.

The plan should also record that A7 now has a **dependency on the approval-gate design**
(§7). That was not true when A7 was written, because the gate was a browser affordance; it
became true with the 6 August amendment. A7 cannot ship a submitting form without the
interrupt-merge rule being agreed first, and that is a design conversation, not a coding task.

---

## 9. Staged recommendation

### Stage 0 — corrections. 1 day.

Flip `sharedState` to `false` in `apps/agent-gateway/src/http/capabilities.ts:75`, or emit
`STATE_DELTA`. Correct A7's description in the plan. Neither depends on anything below and
both stop the next person building on a false premise.

### Stage 1 — read-only widget registry. 8–12 days.

| Work                                                                                                | Days |
| --------------------------------------------------------------------------------------------------- | ---- |
| Registry mechanism, descriptor types, props validation, host component with teardown                | 3–4  |
| Registry map plus lazy `import()` in `apps/nuxeo-ui`, modelled on `nav-drawer.component.ts:368-381` | 1    |
| A `CUSTOM` event (`render`) emitted by the gateway, plus schema-validation tests                    | 2    |
| Two read-only widgets in `libs/shared/ui`: compact document list, read-only metadata card           | 3–4  |
| Panel-width design pass — 400px against existing 680–776px floors                                   | 1–2  |

Delivers screenshots 2 and 4 in read-only form. Does not deliver selection, submission,
upload or delete.

### Stage 2 — selection and cross-turn state. 5–7 days.

Wire the chat list to `SelectionService`; add widget-instance state to `sharedState`; actually
emit and consume `STATE_DELTA` in both directions; add selection provenance so the agent can
distinguish its own selection from the user's. Delivers screenshot 3 properly rather than
incidentally.

### Stage 3 — one submitting form. 10–14 days.

`metadata.render` on interrupts; the merge-and-restrict rule in the pending-mutation loop;
browser-side target resolution; and the presentational split of the metadata form (5–7 of
those days). **One form only** — metadata edit. Delivers screenshot 4's editable case,
safely, and establishes the pattern for every later form.

Cannot start before the merge-and-restrict rule in §7 is agreed.

### Stage 4 — explicitly out of scope for Beta.

- **Upload (screenshot 1).** A rebuilt chat-native upload is ~5 days for the happy path and
  considerably more for progress, cancel, retry, multi-file and CSV. The existing dialog does
  not travel.
- **Delete confirmation raising the app's `MatDialog` (screenshot 5).** Reachable, and a worse
  interaction than an inline card. `ConfirmDialogComponent` is the one dialog that could be
  inlined anyway, so if this is wanted it should be inline.
- **Permission dialogs.** Three components, all self-executing writes, all needing the Stage 3
  treatment individually.
- **Anything inside `document-detail`.**

### Total

**Stages 0–3: 24–34 engineer-days**, one engineer, sequential — call it **6–8 weeks**
including review and CI. Stage 1 alone (**9–13 days**) gets a demonstrable, honest, read-only
generative UI, and is the right thing to commit to if the timeline compresses.

> **Superseded the same day, and then measured.** A walking skeleton on 7 August 2026 brought
> stage 1 from 9–13 days to **7–10**, and stages 0–3 from 24–34 to **23–32 engineer-days**, five
> and a half to seven weeks. Do not quote 24–34 or 6–8 weeks: the current figures are in
> `docs/beta-engineering-plan.md`, which is the plan of record.
>
> Stages 1 and 2 were then built, both inside the revised estimates. The estimate this section got
> most wrong is stage 1's second widget, which was expected to resist because the metadata card it
> found was entangled in edit dialogs — a new read-only card was written instead, which sidestepped
> the entanglement entirely. The estimate it got right, and which did **not** compress, is the
> 400px design pass at 1–2 days per component.

---

## 10. What to be sceptical about when this is demonstrated

Questions worth asking of any generative-UI demo, ours included:

- Does the _same_ component still render correctly on its own page, at full width, after the
  split?
- What does the chat-rendered list do for a user who cannot read one of the documents in it?
- What does the form do when Nuxeo returns 403, 409 or a validation error?
  **Answered, and it was wrong first.** The write fails, nothing is saved, and the error
  reaches the model — but the result also carried a note reading "that is the expected
  outcome, not an error … report what was saved and do not offer to change it back",
  because the note was attached unconditionally. So a refused write primed the model to
  claim it had happened. Attribution is now unconditional and reassurance is not; see
  ADR 001, "A failed write is still the user's values".
- What happens to a half-filled form when the user sends the next message?
  **Answered: it is silently declined and discarded, and the gateway is told
  `decidedBy: 'user'`.** Recorded as a decision — with the consequence that the model may
  tell someone they chose not to make a change when they merely changed the subject — in
  ADR 001, "A half-typed form is a decline". Not a defect, but not reviewed until asked.
- Does the chat list's selection agree with the selection topbar on the page behind it?
- Where did the row titles come from — the model's tool result, or a re-fetch under the user's
  session? (Only one of those answers is safe.)
- Is the write visible in the gateway log against a `toolCallId`, with a recorded approval?

A form that renders is roughly ten per cent of a form that ships.
