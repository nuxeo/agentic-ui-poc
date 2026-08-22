# Beta delivery record

**What this file is for:** presenting what has been built, with enough detail to answer
"what changed, why, and how do we know". It is the narrative record. Keep it current —
if a change is worth a commit, it is worth a line here.

**How it relates to the other documents**, because there are already several and they have
contradicted each other before:

| File                           | Role                                                             | Authority               |
| ------------------------------ | ---------------------------------------------------------------- | ----------------------- |
| `AGENTS/11-beta-program.md` §3 | terse _verified facts_, for agents mid-task                      | **highest** on any fact |
| `.ai/state/phases.json`        | machine-checkable phase status, verified by `npm run beta:state` | **highest** on status   |
| `docs/adf-hx-beta-plan.md`     | the plan of record: scope, phases, timelines                     | highest on _intent_     |
| **this file**                  | the narrative: what was done, why, with numbers and evidence     | highest on _history_    |

If this file disagrees with §3 or `phases.json` on a fact, **they win and this is stale**.
Nine cross-document contradictions accumulated earlier in this programme — including two
reviews disagreeing about whether CI had ever run — so the precedence above is deliberate.

Last updated: 2026-08-21.

Updating this file is **step 10 of the `beta-phase` skill**, not an optional courtesy.

---

## 1. Where the programme stands

| Phase                                   | Status                                                 | Evidence                 |
| --------------------------------------- | ------------------------------------------------------ | ------------------------ |
| 0 — Unblock and verify                  | **complete**                                           | `phase-0-baseline` 14/14 |
| 1 — Layer 0: upgrade-safe configuration | **complete**, with one caveat below                    | `phase-1-config` 39/39   |
| 2 — Layer 1: extension registry         | **complete**, carry-forward named                      | `phase-2-registry` 46/46 |
| 3 — adf-hx adoption                     | **in progress** — 12 ports bound, 5 components adopted | `phase-3-adf-hx` 43/43   |
| 4 — Layer 2: publishable platform       | not started                                            | —                        |
| 5 — Layer 3: agent harness              | partial (the harness below exists)                     | —                        |
| 6 — Beta quality bar                    | partial — coverage and a11y now _measured_             | `phase-6-a11y` 12/12     |

Branch `feature/adf-hx-browse-poc`, 49 commits ahead of `main`, **draft PR #145**. CI is
green on both the `push` and `pull_request` paths.

**Phase 1's caveat:** it is recorded complete, but i18n extraction covers only three
templates. That is real remaining work sitting inside a closed phase, and it should be
reopened rather than quietly carried.

---

## 2. What was built — the product

### Layer 0: configuration without a rebuild

- Bootstrap config on a **non-overwriting** install path. The marketplace installer copies
  the web directory with `overwrite="true"`, so anything inside it is destroyed on upgrade.
  The path is `nxserver/nuxeo.war/agentic-ui-config` — a sibling of the bundle, outside the
  destructive copy. Phase 1 originally shipped `nxserver/web/…`, which **would have 404'd
  in every deployment**; corrected after independent review.
- Runtime manifest as a **Nuxeo document** at `/default-domain/config/agentic-ui`, so it
  inherits Nuxeo versioning, ACLs and per-tenant scoping. Eleven `InjectionToken` factories
  resolve from it. Every load path is tolerant: a missing file, absent document, 403 or
  malformed JSON falls back to packaged defaults that reproduce the pre-Phase-1 values
  exactly.
- Theme blocks are token-driven, and the `!important` override block that would have fought
  customer CSS is gone.
- Manifest `labels` layer over the translation catalogue, so **relabelling the product is a
  manifest edit**.

### Layer 1: the addressable surface

`libs/shared/extensions`, wrapping `@alfresco/adf-extensions`. Eight slots, keyed by opaque
string with no enum or `switch` on slot identity — so a ninth slot needs no change to the
eight.

Live and rendering: **navbar**, **sidebar**, **bulk actions** (six), **documentList
columns** (twelve). Each entry is hideable, reorderable, relabellable and rule-gateable
from JSON alone.

Still reserved and read by nothing: `routes`, `toolbar`, `contextMenu`, `tabs`. **Do not
describe those as extension points.**

Rules are registered evaluators over the existing document predicates. Two behaviours worth
knowing:

- An **unregistered rule id fails open** — a manifest naming a rule this build lacks leaves
  the entry visible, because Layer 1 visibility is not an authorisation boundary and failing
  closed would let a typo strip working actions out of the UI.
- Except for `SECURITY_RELEVANT_RULE_IDS`, which fail **closed**. That list is declared
  rather than attached at registration, because the unsafe window is precisely the one
  before registration happens: without it, a consumer resolving the navbar early saw an
  unknown id and got `true`, which **would have offered Administration to every user**.

### Phase 3: real adf-hx components

- **Dependency pin set**: 9 packages, every version exact. adf-core declares **all sixteen**
  of its peer ranges as unbounded `>=`, so a plain install floats
  `@angular/material-date-fns-adapter` to the Angular 22 line and the build dies with
  `Unsupported enum value`. Two pins deliberately differ from adf-core's suggestion:
  `@mat-datetimepicker/core@16.0.1` (its major track is offset from Angular's) and
  `pdfjs-dist@6.2.108` (4.x downgrades a shared native package).
- **All twelve API ports bound** to upstream's tokens, with the bridge's local clone tokens
  deleted. **Eleven do real work.** Only `UPLOAD` refuses wholesale, because its Nuxeo
  equivalent is a different protocol rather than a different endpoint. `MODEL` reads for real
  over `/config/types`, `/config/facets` and `/config/schemas`; only its **write** half still
  refuses, and that half is unimplementable rather than unimplemented — Nuxeo exposes no REST
  path for writing the content model at all.
- **The real `HxpDocumentListComponent` renders** on `/#/browse-adf-hx` over live Nuxeo, and
  its `[schema]` is fed from Layer 1's `PACKAGED_BROWSE_COLUMNS` — so **a customer's
  manifest edit drives Alfresco's own DataTable**, with no second column list.
- The hand-written `hxp-document-list` is **deleted**, after its four extra capabilities were
  rehomed: the column picker (`hxp-column-picker`, driven by the Layer 1 descriptors), the
  card view with thumbnails (`hxp-document-cards`), the empty state and the error/retry path.
- **The real `HxpBreadcrumbComponent` is adopted** and the hand-written one deleted. Same
  selector and same `[document]` input, so the swap itself was one line — but upstream's
  `DocumentRouterService` builds `/{repository}/documents/{id}`, a route this application does
  not have, and its breadcrumb feeds that straight into `[routerLink]`. That service carries no
  `providedIn`, which makes it an intended substitution point:
  `NuxeoDocumentRouterService` is bound against it and the capture asserts every crumb link
  targets `browse-adf-hx` and none targets upstream's shape.
- **The real `HxpDocumentTreeComponent` is adopted** in the app shell's nav drawer, and the
  hand-written `hxp-browse-nav-tree` plus its state service are deleted. It needed
  `DocumentTreeDatabaseService` provided — no `providedIn` again — and the host now handles a
  selected `Document` where ours emitted a path string. Measured cost to the initial bundle:
  **+80 kB** (3.15 → 3.23 MB), which is why it went in directly rather than behind
  `ExtensionOutletComponent`; the measurement decided that, not a preference.
- **`nuxeo-ui` now has a `typecheck` target.** Two real type errors escaped
  `nx affected -t typecheck` during Phase 3 because the app had none; the gap is closed and
  proven by reintroducing one of them.
- **`sys_primaryType` carries the Nuxeo doctype name**, with `SysRoot` kept only for the
  synthetic repository root. It had been a synthetic `SysFolder`/`SysFile`, and that was a mistake
  of ours alone: `sys_primaryType` is the **key into `Model.primaryTypes`**, and the `MODEL` port
  fills that with Nuxeo's sixty doctypes because it is the only registry Nuxeo has. A field has to
  agree with the registry it indexes.
  - One visible symptom and three latent ones: the properties panel's **Category select rendered
    empty**; `extractCustomSchemaFields` would find **no custom schema fields** for the metadata
    sidebar; `getSubtypes` silently fell back to all sixty types; and the document-category
    **search filter** emits `sys_primaryType IN ('…')` as HXQL, which would have queried a type
    name Nuxeo has never heard of. Two of those land on components still to be adopted.
  - Safe because **nothing compares it against `SysFolder`/`SysFile`** — folderishness travels on
    `sys_isFolderish` and `sys_mixinTypes`, and all four of our own readers were already written
    as `sys_typeLabel ?? sys_primaryType`, so their fallback merely stopped being wrong.
    `isRoot()` still works, because `SysRoot` survives for the one node that genuinely is not a
    Nuxeo document.
- **The POC landing screen no longer reads "Repository / SysRoot".** The folder header renders
  `sys_typeLabel ?? sys_primaryType` and the synthetic root carried no label — the same class of
  defect, an internal identifier reaching a user, found in the same screenshot. Both fixes have an
  assertion, and both were **watched fail on purpose** by reverting them.
- **The real `ManageVersionsSidebarComponent` is adopted**, in a new **Versions** tab. This is
  the first adoption that **adds** a capability rather than replacing one of ours — the POC had
  no version history at all — and the first thing to drive the `VERSION` and `QUERY` ports
  through the UI rather than through unit tests.
  - It needed a `QUERY` method the bridge had never implemented: `getDocumentsByQuery`, the
    free-text **HXQL** entry point upstream's `SearchService` uses. HXQL queries the HxPR
    content model; Nuxeo speaks NXQL over a different one. Rather than write a translator, the
    port recognises the one statement upstream actually sends — its versions query — **whole**,
    and refuses anything else **by name**. An unrecognised query answering with an empty result
    set is indistinguishable from an empty repository, which is how it becomes a bug report
    about missing documents.
  - Versions are read through **`Document.GetVersions`**, not the NXQL search. Measured on the
    local instance: immediately after two check-ins the NXQL path — OpenSearch-backed here —
    returned **one** of the two versions, and both only once the index caught up. A panel that
    reloads on check-in would have shown the user a list missing the version they just made.
  - Nuxeo sends **no `versionLabel`**, so `sysver_title` is composed from `uid:major_version`
    and `uid:minor_version`. And a version's `sys_parentId` is overridden to Nuxeo's
    `versionableId`, because Nuxeo reports a version's `parentRef` as the live document's
    _folder_ while upstream follows `sys_parentId` to reload the live _document_.
  - The tab acts on the row **selected** in View, not on the folder being browsed, and says so
    when nothing is selected. Bound to the folder it would have looked like a working feature:
    upstream always prepends a "current version" entry, so a folder with no versions still
    renders one row.
  - Deliberately still missing: **`sysver_description`**, upstream's version comment. Nuxeo
    keeps the check-in comment in the audit log, not on the version document. Mapping
    `dc:description` into it would show the _document's_ description as if it were the
    version's, so it is left unset and the panel omits the line.

**Four defects this adoption exposed**, none of them in the versions panel and all of them
pre-existing:

| Defect                                                                  | Effect                                                                                                              | Cause                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Angular's `development` config **replaces** `assets`, it does not merge | **every dev server on this branch 404ed adf-core's catalogue**, while production shipped it correctly               | only the base array carried the glob                                                                                                                                                                                                                                 |
| adf-hx's own i18n catalogues were never served                          | the versions panel rendered `MANAGE_VERSIONS.DIALOG.TITLE` as its heading                                           | adf-hx _does_ register them, via `provideTranslations` in each component's `providers` — but registration happens at component construction, long after the language loaded, and our loader's `init` is a no-op. The registration landed; the strings never arrived. |
| adf-hx's icon set was never served                                      | `Folder.svg` and `Folder_open.svg` 404ed on every tree render                                                       | no asset glob                                                                                                                                                                                                                                                        |
| `NG0201: No provider found for _AsyncPipe`                              | any component rendering a user name threw **while rendering** — the panel appeared with a heading and an empty body | adf-hx's `UserResolverPipe` calls `inject(AsyncPipe)`, and `AsyncPipe` has no `providedIn`                                                                                                                                                                           |

A fifth was a mapping decision of ours that upstream turned into a visible bug: user names
rendered as **`undefined undefined`**. Upstream's `UserResolverService.getFullName` is
`` `${firstName} ${lastName}` `` with no guard, and our mapper deliberately left both unset on
the grounds that Nuxeo carries only a username and a guessed name is worse than an honest one.
The reasoning was right about not guessing and wrong about the consequence. The username now
fills `firstName` with `lastName` empty, which composes to the username itself — and that also
fixes Nuxeo's own `Administrator`, whose `firstName` and `lastName` are both empty strings.

The first of those took a session to find because the symptom was blamed on a stale dev server
and the fix was "restart it", which could never have worked. There is now a **review guardrail**
that fails when any build configuration overrides `assets` and omits a base entry, and the
**bundle gate** asserts all three catalogues and one adf-hx icon actually ship. Both were
watched fail on purpose.

---

## 3. What was built — the harness

Nine gates, cheapest first. **Every one has been watched fail on purpose**, because a gate
nobody has seen go red is not evidence.

| Gate                                    | Catches                                                               |
| --------------------------------------- | --------------------------------------------------------------------- |
| `node`                                  | a wrong Node major, whose red is indistinguishable from a code defect |
| `lockfile`                              | a lock `npm ci` will refuse on Linux                                  |
| `guardrails`                            | style and architecture violations, **and hardcoded credentials**      |
| `assertions`                            | evidence assertions that **cannot fail**                              |
| `lint` / `test` / `build` / `typecheck` | the application                                                       |
| `bundle`                                | what a customer actually receives                                     |

Plus three checks deliberately outside the pipeline: `beta:coverage` (needs a measurement
run), `beta:state` (evidence lives outside the repo, so it is local-only), `beta:backend`
(starts containers).

Three of those gates exist because something got through:

- **`node`** — an agent on Node 25 saw `clipboard.utils.spec.ts` throw `SecurityError` and
  reported a _product defect_. Node 25 defines a `localStorage` that throws and shadows
  jsdom's. "Fixing" the spec would have damaged working code.
- **`assertions`** — Phase 1 shipped a defect past two checks that "certified properties they
  could not observe". One compared `"main.js"` to `"main.js"`; the review's own words were
  that it "could not fail — and notably it did not catch defect 1, which is precisely the
  failure it appeared to guard".
- **`bundle`** — Phase 3's spike found adf-hx importing `ng-mocks`, a **test-mocking
  library**, from its shipped runtime bundle. With the real library installed it reached a
  1.6 MB customer-facing chunk carrying two `eval()` calls.

Two refinements the harness earned on itself during Phase 3. A completed phase now cites a
**specific** manifest rather than `latest`: a stale local dev server turned Phase 0's newest
capture red and invalidated a `complete` claim that was never in doubt. And captures that
depend on the adf-core asset glob assert it as a **precondition**, so a dev server started
before that glob aborts with `precondition-not-met` instead of reporting failures that look
like broken components.

**`beta:state`** is the anti-false-completion control: a phase may claim `complete` only if
its cited manifest exists and says `pass`. It has already refused a sign-off of mine — adding
the ninth gate invalidated three phases' re-gate citations until they were re-gated.

**Independent validation** is specified in `AGENTS/12-review-agents.md`, with thin adapters
for both toolchains (`.cursor/skills/audit-evidence/`, `.claude/agents/`). Its mechanical
half is `beta:audit` and `beta:state`. **Its human half has never been run** for Phase 1 or
Phase 2.

---

## 4. Decisions taken

Settled. Do not re-open without new information.

| Decision                                                   | Rationale                                                                                                                                                                                    |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`ng-mocks` stays stubbed, indefinitely**                 | Upstream will not change the shipped `/ui` bundle. `tools/stubs/ng-mocks/` is the resolution, not a workaround pending one. The `bundle` gate fails if the real library returns.             |
| **`angular-oauth2-oidc` and `cropperjs` are kept**, unused | They cause no issue today. `pdfjs-dist` tree-shakes out entirely; these two do not.                                                                                                          |
| **The adf-hx initial-bundle cost is accepted**             | See §5. Unavoidable, not a preference.                                                                                                                                                       |
| **API ports live in the root injector**                    | Eleven upstream services are `providedIn: 'root'` and resolve the tokens from root. Scoping them to the lazy POC route means shadowing all eleven, and the list grows per component adopted. |
| **`UPLOAD` bound but refusing** (and `MODEL`'s write half) | An unbound token stops eleven root services constructing at all. Bound, a component constructs and fails at the point of use with a message naming the operation.                            |
| **The POC route stays at `/#/browse-adf-hx`**              | Production `/#/browse` is untouched until parity is agreed.                                                                                                                                  |

---

## 5. Numbers, for the leadership conversation

**These have not been presented yet and should be.**

### Initial bundle

|                     | Downloaded before the app starts       |
| ------------------- | -------------------------------------- |
| before adf-hx       | 1.70 MB                                |
| with adf-hx adopted | **3.49 MB**                            |
| increase            | **+1.79 MB once, then browser-cached** |

Movement since first measured: 3.15 MB with the document list, +80 kB for the tree, +10 kB for
the versions panel, **+250 kB for the properties panel**. Each component has been measured on
adoption rather than estimated.

**`maximumError` was raised again, 3.5 → 4.0 MB.** The properties panel left **10 kB** of
headroom, so the next component adopted would have failed the build for an unrelated reason.
Raised deliberately and recorded here rather than discovered in CI. The panels sit in an eager
1.2 MB chunk — verified by reading the built bundle — which is the root-injector consequence
above, not a new boundary break.

Unavoidable rather than chosen — see the root-injector decision above. Practically:
unnoticeable on an office network, a second or two on a first load over a slow link. The
budget was raised deliberately (`maximumWarning` 1.5 → 2.5 MB, `maximumError` 2.0 → 3.5 MB)
rather than quietly. If the figure is ever refused, the options are trimming existing weight
out of the startup bundle (real work, uncertain payoff) or not adopting adf-hx, which
abandons the premise of the Beta.

### Unit test coverage, measured for the first time

Against the Beta bar of **90%**:

| Project                                                   | Lines | Short by  |
| --------------------------------------------------------- | ----- | --------- |
| `search`                                                  | 22.8% | 67.2pp    |
| `document-detail`                                         | 29.8% | 60.2pp    |
| `browse`                                                  | 56.7% | 33.3pp    |
| `adf-hx-bridge`                                           | 65.6% | 24.4pp    |
| `ui`                                                      | 68.2% | 21.8pp    |
| `shared-ke-client`                                        | 70.9% | 19.2pp    |
| `nuxeo-client`                                            | 78.4% | 11.6pp    |
| `collections`                                             | 81.7% | 8.3pp     |
| `shared-kd-client`                                        | 88.1% | 1.9pp     |
| `shared-extensions`                                       | 96.0% | **meets** |
| `assets`, `core`, `drawers`, `shared-app-config`, `tasks` | 100%  | **meets** |

A **ratchet** gate stops these worsening; closing the gap is Phase 6 and it is large.
`nuxeo-ui` is excluded — its Karma builder takes a different coverage flag — and says so on
every run.

### Accessibility, measured for the first time

WCAG 2.1 AA is **not met**. Four rules violated across every surface:

| Rule             | Impact   | Where                                                       |
| ---------------- | -------- | ----------------------------------------------------------- |
| `button-name`    | critical | 11 nodes, incl. the platform nav title icon on every screen |
| `label`          | critical | two Material checkboxes in production browse                |
| `color-contrast` | serious  | `.header-doc-type`, `.result-count`, breadcrumb current     |
| `role-img-alt`   | serious  | contributor avatars, folder-row icons                       |

Also ratcheted, so a **new** violation fails while the existing gap is visible.

### Security

Production `npm audit`: **1 low** (`quill` XSS), 0 high, 0 critical — unchanged by adding
nine dependencies. `eval()` occurrences in the shipped bundle: **0** (was 2 before the
`ng-mocks` stub).

---

## 6. Known gaps, all named

Nothing here is a surprise later.

1. ~~**`lastContributor` has no HxPR equivalent.**~~ **Wrong, and fixed** — see §7. It is
   `sys_lastContributor`, a `User`; our mapper simply never populated it. Three standard
   fields were being dropped and are now mapped: `sys_lastContributor`, `sys_creator`,
   `sys_lifecycleState`. The residual limitation is narrow: Nuxeo carries a **username**
   only, so the column shows `jdoe` rather than `Jane Doe`. A display name would need a
   `/user/{id}` call per distinct contributor. **Open question for the team** — is a username
   acceptable, or is a display name required? The answer is now cheaper than first thought:
   upstream's `UserService.resolveUser` already performs exactly that lookup and **caches it
   per id**, so passing a username string where upstream expects one gets a real display name
   for one request per distinct user. That path is live in the versions panel today.
2. **`sys_effectivePermissions` is hardcoded** to a minimal set for every document — the last
   of five recorded bridge defects. The other four are closed, most recently the
   `browse_column_settings` localStorage key that the POC and production browse shared, so
   choosing columns on either surface silently overwrote the other.
3. **Three components remain**: permissions, document-viewer, search. Document list,
   breadcrumb, tree, manage-versions and the **properties panel** are done.
   The `MODEL` blocker is closed: the read side is implemented and the panel renders a document's
   real Nuxeo metadata with correct types.
   One named gap inside the adopted panel:
   - **The newer, editable metadata sidebar is not adopted.** It sits behind adf-hx's
     `CIC_WORKSPACE_NEW_METADATA_PANEL` flag; the flag is off, so the read-oriented legacy panel
     renders. Turning it on needs `HxpMetadataCacheService`, which has no `providedIn` **and is
     not exported from adf-hx's `/ui` barrel** — neither it nor the metadata sidebar itself is.
     That is upstream's to fix by exporting them.
4. **`UPLOAD` refuses**, and so does `MODEL`'s **write** half. The `MODEL` read side is done;
   the write side has no Nuxeo REST endpoint to call at all, so it is unimplementable rather
   than unimplemented. Mapping `UPLOAD` is real work, not a rename.
   **`getDocumentsByQuery` understands one HXQL statement** — upstream's document-versions
   query — and refuses every other by name. Adopting adf-hx **search** will need more.
5. **`getRenditions` is not a discovery call** — it returns a fixed `thumbnail, pdf` pair,
   because Nuxeo exposes no rendition-enumeration endpoint through this bridge.
6. **`routes`, `toolbar`, `contextMenu`, `tabs` slots are reserved and unread.**
7. **i18n covers three templates.** Inside a phase recorded complete.
8. ~~**`nuxeo-ui` has no `typecheck` target.**~~ **Closed** — added and proven by
   reintroducing the exact typo that escaped twice.
9. **The marketplace package has never been built, installed and upgraded on a real server**,
   so risk R7 stays Medium. That is the Phase 6 upgrade rehearsal.
10. **Independent validation has never run** for Phase 1 or Phase 2, and the multi-model
    review gate has never run at all.
11. **The versions context menu is unexercised.** Restore, delete and edit-a-version render in
    the panel's menu, but the capture asserts the _list_, not the menu.
    `NuxeoVersionApi.restoreVersion` is unit-tested and has never been driven from the UI.

---

## 7. Corrections made to the record

Kept because a record that hides its own errors is not one.

| Claim                                                                                                                      | Correction                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "CI has never run on this branch"                                                                                          | Wrong. `ci.yml` triggers on `push` as well as `pull_request`; it had run and passed repeatedly. Two phase reviews disagreed and the _other_ one was right.                                                                   |
| "`SATORI_GH_READONLY_TOKEN` was never set"                                                                                 | Wrong. A repository secret since 2026-08-03.                                                                                                                                                                                 |
| "`phase-0-no-backend` is an abandoned red"                                                                                 | Wrong. Its nine failures were one precondition mismatch — Nuxeo was up and that file requires it down.                                                                                                                       |
| "adf-hx is v0.0.8" (still in the plan)                                                                                     | Stale. 648 published versions; `latest` is `7.20.0-automate.292`.                                                                                                                                                            |
| "adf-hx pulls in a large new dependency surface"                                                                           | Half right. Twelve of the fifteen packages it imports were already installed; the sprawl comes from adf-core's peers.                                                                                                        |
| Risk R7 downgraded to Low                                                                                                  | Withdrawn. It was downgraded on the strength of an install path that would have 404'd.                                                                                                                                       |
| "the dev server predates the adf-core asset glob — restart it"                                                             | Wrong, and it sent the reader after a fix that could never work. Angular's `development` configuration **replaces** `assets`; only the base array had the glob, so no restart would ever have helped. Now guarded by a gate. |
| "a Nuxeo username should map to a `User` with no first/last name, because a guessed name is worse than an honest username" | Right about not guessing, wrong about the consequence. Upstream renders `${firstName} ${lastName}` with no guard, so unset fields rendered the literal `undefined undefined`.                                                |
| "`VersionContextMenuActionsService` has no `providedIn`"                                                                   | Wrong. It **is** `providedIn: 'root'`, and its five action-service tokens are already in `CONTEXT_MENU_ACTIONS_PROVIDERS`, so it needed no provider at all.                                                                  |

---

## 8. Keeping this file honest

Update it when: a phase changes status, a decision is taken, a number moves, a gap opens or
closes, or a claim is corrected. Prefer adding a row to rewriting a section — the history is
the point.

Do not restate §3's facts here in different words. Link to them.
