# Extension reference — Layer 1

**Status:** current · **Introduced:** Phase 2 (Beta) · **Audience:** customers, partners and their agents

Everything a manifest can address, by ID. An extension point nobody can discover is not an
extension point, so this file is the contract: if an ID is not listed here, do not depend on it.

Related: [`docs/adf-hx-beta-plan.md`](adf-hx-beta-plan.md) ·
[`AGENTS/11-beta-program.md`](../AGENTS/11-beta-program.md)

---

## 1. Read this first

### IDs are a public contract

Every ID below follows `<owner>.<surface>.<name>` — `app.bulkActions.delete`, `app.rules.canWrite`,
`app.navbar.browse`. Use your own owner prefix for anything you contribute (`acme.navbar.contracts`).
Once published, **renaming one of our IDs is a breaking change** and will only happen in a major
version.

### Hiding an action is not a security control

Layer 1 decides what the UI _offers_. It does not decide what the server _allows_. Nuxeo evaluates
the real permission server-side on every operation, so:

- hiding `app.bulkActions.delete` does not stop a user who has `Remove` from deleting via the REST API;
- showing it does not grant anything — the operation still fails with 403 without the permission;
- an **unregistered rule ID evaluates to `true`**, deliberately, so a typo or a manifest written
  against a newer release cannot silently strip working actions out of the UI. The exception is
  the three user rules in section 4, which fail **closed** — an unknown
  `app.rules.hasAdministrationAccess` must not hand every user the Administration
  entry while the shell is still starting up.

Use Nuxeo ACLs for authorisation. Use the manifest for what the interface presents.

### A manifest cannot rebind a packaged action

Hiding is yours to decide; **rebinding is not**. When a manifest entry reuses a packaged ID it
patches that descriptor — `label`, `icon`, `order`, `rule` and the rest all apply — but an `action`
it supplies is **ignored**:

```json
{ "id": "app.toolbar.addToFavorites", "action": "app.toolbar.delete" }
```

That entry changes nothing. Were it honoured, the user would see a star reading "Add to Favorites"
and delete the document, and the server would authorise it, because it really is that user asking.
The rule in the section above — that the server still checks permissions — is what makes hiding
safe, and it is exactly what does **not** make this safe: the user has `Remove`, so the deletion
succeeds. Presentation and behaviour have to stay attached to each other.

To introduce behaviour, add a descriptor under **your own** ID, where the label and the action are
both yours:

```json
{ "id": "acme.toolbar.archive", "label": "Archive", "action": "acme.actions.archive" }
```

Replacing what a packaged ID _does_ is a Layer 2 operation: register a handler under that ID from
your own library (section 14), where the change is in reviewed, versioned code rather than in a
JSON document any repository writer can edit.

### Where the manifest lives, and how it survives upgrade

The manifest is a Nuxeo document at `/default-domain/config/agentic-ui`, read with the signed-in
user's own session. It is **not** a file inside the packaged web directory, because the marketplace
installer copies that directory with `overwrite="true"` and would destroy it. See the Phase 1 section
of the plan for the ACL model — in short, grant Read broadly and Write narrowly, and block
inheritance on the config folder.

The Layer 1 configuration is the `extensions` key of that document:

```json
{
  "version": 1,
  "extensions": {
    "$name": "acme-customisation",
    "overrides": { "app.navbar.browseAdfHx": { "visible": false } },
    "slots": {
      "navbar": [
        {
          "id": "acme.navbar.contracts",
          "label": "Contracts",
          "path": "/browse/contracts",
          "icon": "folder",
          "order": 35
        }
      ]
    }
  }
}
```

---

## 2. Slots

A slot is a named, ordered list of descriptors. Eight exist for Beta, of which six
carry packaged entries.

| Slot           | What it addresses                         | Status in Beta                                     |
| -------------- | ----------------------------------------- | -------------------------------------------------- |
| `navbar`       | Primary platform navigation entries       | **Populated** — packaged entries in section 3      |
| `bulk-actions` | Actions over a multi-document selection   | **Populated** — packaged entries in section 5      |
| `sidebar`      | Drawer content behind a navbar entry      | Resolves; **no packaged entries** — see section 6  |
| `routes`       | Application routes                        | Resolves; **no packaged entries** — see section 11 |
| `toolbar`      | Document-detail toolbar and overflow menu | **Populated** — 16 packaged actions, section 8     |
| `contextMenu`  | The browse "More actions" menu            | **Populated** — 4 packaged actions, section 10     |
| `tabs`         | Document-detail tab children              | **Populated** — 6 packaged tabs, section 9         |
| `documentList` | Document list columns                     | **Populated** — 12 packaged columns, section 7     |

Read the three states precisely, because they are different promises:

- **Populated** — packaged descriptors exist, the surface renders from them, and
  your `overrides` and `slots` entries change what a user sees.
- **Resolves** — the host asks the registry for this slot, so a descriptor you
  contribute does take effect, but nothing of ours is registered there.
- **Nothing resolves it** — the id is reserved and the registry accepts entries,
  but no code reads them. Contributing to one of these does nothing today.

`rules` was listed as a slot in an earlier version of this document. It is not
one: rules are registered in `ExtensionRuleRegistry` and are referenced by
descriptors, not contributed as descriptors. A manifest writing `slots.rules` was
silently inert, and the constant has been removed rather than left implying
otherwise. See section 4 for how rules are actually addressed.

Deferred to GA and deliberately absent: `content-metadata-presets`, `badges`,
`userProfileSections`, `search` filters, `create`.

### Slots are additive

Slot IDs are plain strings. There is no enum, union or `switch` on slot identity in the registry, so
a ninth slot needs no change to the eight and no new release of the registry —
`libs/shared/extensions/src/lib/extension-slot-registry.service.spec.ts` proves it by registering a
slot the library has never heard of and showing the nine unchanged.

### Fields every descriptor honours

| Field      | Meaning                                                           |
| ---------- | ----------------------------------------------------------------- |
| `id`       | Required. The address. An entry without one is dropped.           |
| `order`    | Ascending. Absent sorts last. Packaged entries are spaced by ten. |
| `disabled` | `true` removes the entry. Upstream ACA semantics.                 |
| `rule`     | A rule ID, or a nested rule reference — see section 4.            |

Action descriptors (`bulk-actions`, and the other action slots when they are
populated) honour four more:

| Field         | Meaning                                                                       |
| ------------- | ----------------------------------------------------------------------------- |
| `label`       | Required. Menu text, and the accessible name of an icon-only control.         |
| `icon`        | Icon name understood by the host's icon set.                                  |
| `tooltip`     | Hover text. Falls back to `label`.                                            |
| `enabledRule` | A rule ID. When it denies, the control renders **disabled** rather than gone. |
| `action`      | Registered handler ID. Defaults to the descriptor `id`.                       |

### Per-ID overrides

`extensions.overrides` is keyed by **descriptor ID, never by slot**, so a slot invented after Beta
ships is hideable, reorderable, relabellable and gateable with no schema change.

| Key       | Effect                                                                         |
| --------- | ------------------------------------------------------------------------------ |
| `visible` | `false` removes the entry.                                                     |
| `order`   | Replaces the packaged order.                                                   |
| `label`   | Replaces the packaged label. For translated strings prefer `labels` (Layer 0). |
| `rule`    | Replaces the packaged rule. **`null` clears it**, ungating the entry.          |

```json
{
  "overrides": {
    "app.navbar.trash": { "visible": false },
    "app.navbar.browse": { "label": "Repository", "order": 5 },
    "app.navbar.administration": { "rule": "app.rules.isAdministrator" }
  }
}
```

---

## 3. `navbar` — the packaged navigation

Registered by `PACKAGED_NAV_ITEMS` in `libs/shared/extensions/src/lib/nav-items.ts`.

| ID                              | Label               | Path                   | Order | Rule                                |
| ------------------------------- | ------------------- | ---------------------- | ----- | ----------------------------------- |
| `app.navbar.knowledgeDiscovery` | Knowledge Discovery | `/knowledge-discovery` | 10    | —                                   |
| `app.navbar.dashboard`          | Dashboard           | `/dashboard`           | 20    | —                                   |
| `app.navbar.browse`             | Browse              | `/browse`              | 30    | —                                   |
| `app.navbar.browseAdfHx`        | Browse (adf-hx POC) | `/browse-adf-hx`       | 40    | —                                   |
| `app.navbar.recentlyViewed`     | Recently viewed     | `/recently-viewed`     | 50    | —                                   |
| `app.navbar.search`             | Search filters      | `/search`              | 60    | —                                   |
| `app.navbar.expiredQueue`       | Expired Queue       | `/expired-queue`       | 70    | —                                   |
| `app.navbar.assets`             | Assets              | `/documents`           | 80    | —                                   |
| `app.navbar.tasks`              | Tasks               | `/tasks`               | 90    | —                                   |
| `app.navbar.favorites`          | Favorites           | `/favorites`           | 100   | —                                   |
| `app.navbar.collections`        | Collections         | `/collections`         | 110   | —                                   |
| `app.navbar.personalSpace`      | Personal Space      | `/personal-space`      | 120   | —                                   |
| `app.navbar.clipboard`          | Clipboard           | `/clipboard`           | 130   | —                                   |
| `app.navbar.trash`              | Trash               | `/trash`               | 140   | —                                   |
| `app.navbar.administration`     | Administration      | `/administration`      | 150   | `app.rules.hasAdministrationAccess` |

**Hiding an entry hides the navigation, not the route.** `{"visible": false}` and a
denying `rule` both remove the entry from the sidebar; neither removes the route,
and a user with the URL still reaches the page. The page keeps its title when
hidden, because the title falls back to the packaged label — a hidden entry
should not turn the page heading into the product name. Removing access is a
Nuxeo ACL or a route guard, not a manifest edit.

`app.navbar.settings` exists as the settings drawer entry and is rendered by the shell rather than
resolved from the slot; it is listed for ID reservation, not as an extension point.

Adding an entry:

```json
{
  "slots": {
    "navbar": [
      {
        "id": "acme.navbar.contracts",
        "label": "Contracts",
        "path": "/browse/default-domain/contracts",
        "icon": "folder",
        "order": 35,
        "hasDrawer": true
      }
    ]
  }
}
```

`hasDrawer: true` opens the secondary drawer. Its content comes from the `sidebar` slot — see
section 6. Without a registered sidebar component the drawer shows a placeholder, which is a
supported state but not a useful one.

---

## 4. `rules` — the registered predicates

Referenced as a bare string (`"app.rules.canWrite"`) or as an object with parameters
(`{ "type": "core.every", "parameters": [...] }`).

### Document rules

Registered by `DOCUMENT_RULE_EVALUATORS`. These wrap the existing pure predicates in
`libs/shared/nuxeo-client/src/lib/utils/document-permissions.ts` — the permission logic is unchanged.

| ID                               | True when                                                         |
| -------------------------------- | ----------------------------------------------------------------- |
| `app.rules.canWrite`             | The user has `Write` or `WriteProperties` on the focused document |
| `app.rules.canRemove`            | The user has `Remove`                                             |
| `app.rules.canAddChildren`       | The user has `AddChildren`                                        |
| `app.rules.canManagePermissions` | The user has `WriteSecurity` or `Everything`                      |
| `app.rules.hasDocument`          | A document is in focus                                            |
| `app.rules.isTrashed`            | The focused document is in the trash                              |
| `app.rules.isNotTrashed`         | A document is in focus and is not in the trash                    |

**Scope, stated plainly.** "The focused document" means the document open on
`/#/doc/:uid`. That page is the only surface that publishes one, and it clears it
when you navigate away, so all seven answer `false` everywhere else. An earlier
version of this document described the first five as functional with no caveat
while nothing populated the context at all, so they answered `false` everywhere.
That is fixed; the remaining limit is which surfaces have a focused document.

### Selection rules

| ID                               | True when                            |
| -------------------------------- | ------------------------------------ |
| `app.rules.hasSelection`         | At least one document is selected    |
| `app.rules.hasSingleSelection`   | Exactly one document is selected     |
| `app.rules.hasMultipleSelection` | More than one document is selected   |
| `app.rules.canWriteSelection`    | Every selected document is writable  |
| `app.rules.canRemoveSelection`   | Every selected document is removable |

The first three read the selection **count**, which the shell publishes, so they
are live and `app.bulkActions.compare` uses one of them today.

**Caveat, unchanged:** the last two are still inert. `SelectionService` tracks
IDs, labels and previews — not documents — so there are no permissions to test
and both answer `false`. Populating them would cost a fetch per selected row.
Do not reference those two yet.

### User rules

These three **fail closed**: if one is referenced before it is registered, it
denies rather than permits.

| ID                                  | True when                       |
| ----------------------------------- | ------------------------------- |
| `app.rules.isAdministrator`         | The user is in `administrators` |
| `app.rules.isPowerUser`             | The user is in `powerusers`     |
| `app.rules.hasAdministrationAccess` | Either of the above             |

`rule: null` in an override still clears the gate, so a customer who genuinely
wants an entry ungated has a Layer 1 route to it. Fail-closed is about the
unknown-ID case, not about making the gate un-overridable.

### Surface-state rules

Registered by `SURFACE_RULE_EVALUATORS`. Where the document rules above read the
document, these read what the open surface has published about its own state —
whether the document is already a favourite, whether an operation is in flight.
They exist so that a **toggle** is two addressable descriptors rather than one
descriptor whose label the component rewrites: `app.toolbar.addToFavorites` and
`app.toolbar.removeFromFavorites` are separate ids gated by opposite rules, so a
manifest can relabel, reorder or hide either half and the label it sets is the
label that renders.

| ID                        | True when                                          |
| ------------------------- | -------------------------------------------------- |
| `app.rules.isFavorite`    | The focused document is in the user's favourites   |
| `app.rules.isLocked`      | The focused document is locked                     |
| `app.rules.isSubscribed`  | The user has notifications on the focused document |
| `app.rules.isInClipboard` | The focused document is in the clipboard           |
| `app.rules.hasVersion`    | The focused document has at least one version      |
| `app.rules.isAiEnabled`   | The AI feature flag is on                          |
| `app.rules.isNote`        | The focused document is a Note                     |
| `app.rules.isNotBusy`     | None of the named operations is in flight          |

Only the positive form of each is registered. The negative half is an ordinary
composite a manifest can write for itself:
`{ "type": "core.not", "parameters": ["app.rules.isFavorite"] }`.

`app.rules.isNotBusy` takes the operation names as parameters, because an
operation name is data rather than contract:
`{ "type": "app.rules.isNotBusy", "parameters": ["trash"] }`. With no parameters
it is vacuously true. The packaged toolbar uses it as an `enabledRule`, so a
control greys out while its own request is in flight instead of disappearing.

**Same caveat as the document rules.** These describe the surface, not the
server. Nuxeo evaluates the real permission on every operation regardless.

### Composites and constants

| ID           | Semantics                                       |
| ------------ | ----------------------------------------------- |
| `core.every` | All nested rules pass. Empty list is `true`.    |
| `core.some`  | Any nested rule passes. Empty list is `false`.  |
| `core.not`   | True when **every** nested rule is false (NOR). |
| `core.true`  | Always `true`.                                  |
| `core.false` | Always `false`.                                 |

```json
{
  "overrides": {
    "app.navbar.trash": {
      "rule": {
        "type": "core.every",
        "parameters": ["app.rules.isAdministrator", "app.rules.hasDocument"]
      }
    }
  }
}
```

A self-referential or mutually recursive composite is broken rather than allowed to overflow the
stack; the cycle evaluates to `true`.

---

## 5. `bulk-actions` — the packaged actions over a selection

Registered by `PACKAGED_BULK_ACTIONS` in
`libs/shared/extensions/src/lib/packaged-actions.ts`, rendered by the selection
topbar that appears when at least one document is selected.

| ID                                | Label               | Icon            | Order | Enabled when                     |
| --------------------------------- | ------------------- | --------------- | ----- | -------------------------------- |
| `app.bulkActions.downloadZip`     | Download All as Zip | `download`      | 10    | always                           |
| `app.bulkActions.addToCollection` | Add to Collection   | `library_add`   | 20    | always                           |
| `app.bulkActions.compare`         | Compare             | `compare`       | 30    | `app.rules.hasMultipleSelection` |
| `app.bulkActions.addToClipboard`  | Add to Clipboard    | `content_paste` | 40    | always                           |
| `app.bulkActions.publish`         | Publish Document    | `publish`       | 50    | always                           |
| `app.bulkActions.delete`          | Delete selected     | `delete`        | 60    | always                           |

None of them carries a `rule`, deliberately: all six are offered whatever the
user may do with the selection, exactly as they were before they became
descriptors. **Nuxeo decides whether the operation succeeds**, server-side, on
every one of them. Adding `app.rules.canRemoveSelection` to Delete would hide it
from everyone, because that rule is still inert — see section 4.

Adding your own:

```json
{
  "slots": {
    "bulk-actions": [
      { "id": "acme.bulkActions.archive", "label": "Archive", "icon": "inventory_2", "order": 15 }
    ]
  }
}
```

The descriptor decides where and when; a registered handler decides what. A
descriptor with no handler renders and is inert rather than throwing, so a
manifest can be written before the Layer 2 library that backs it ships.

```ts
import { ExtensionActionRegistry } from '@nuxeo-satori/platform/extensions';

inject(ExtensionActionRegistry).register({
  'acme.bulkActions.archive': inject(AcmeArchiveActionService),
});
```

Handlers are objects with an `execute(context)` method — the shape adf-hx uses
for its own `*-action.service` classes. Re-registering one of our IDs replaces
the behaviour without forking, and it stays replaced: the packaged surfaces
register their own handlers in a lower-precedence tier, so yours answers whether
it was registered before or after the page that ships the ID, and navigating away
from that page does not withdraw it.

`register()` returns a registration. A handler that closes over a component must
withdraw it — `registration.unregister()` — when that component is destroyed, or
the registry keeps the destroyed component reachable. Withdrawal is per
registration and never by ID alone, because an ID is shared: yours and ours can
both be registered under `app.toolbar.delete` at once.

Section 14 has the full rules, including why your handler outranks ours whatever the
registration order. Prefer it over this paragraph if the two ever disagree.

---

## 6. `sidebar` — drawer components

Two mechanisms share this name, and the distinction matters.

- The IDs in the table below are **component-registry** IDs, not slot
  descriptors. The drawer resolves them by convention: a nav entry
  `app.navbar.<name>` is served by a registered component `app.sidebar.<name>`.
  That is what a manifest-added nav entry picks up with no further wiring.
- The `sidebar` **slot** is consulted first, and has **no packaged entries**.
  Contribute a descriptor there — `{ "id": "acme.navbar.contracts", "componentId":
"app.sidebar.searchFilters" }` — when you want a nav entry served by a component
  whose ID does not follow the convention.

An earlier version of this document listed the slot as "Implemented" and pointed
at the table below, conflating the two.

Components are referenced by ID and must already be compiled in. Contributing a new one is Layer 2.

| Component ID                | Renders                                    |
| --------------------------- | ------------------------------------------ |
| `app.sidebar.assets`        | Asset facet filters                        |
| `app.sidebar.searchFilters` | Search filter panel                        |
| `app.sidebar.trashFilters`  | Trash filter panel                         |
| `app.page.contracts`        | A full-page surface, for the `routes` slot |

`app.page.contracts` is the first component registered for the **`routes`** slot rather than for a
drawer, and it exists because that slot went live with **no component in the product able to serve
it** — live and unusable, which is the "registered surface with no consumer" failure this programme
has been caught by before. Route to it, and give it a nav entry, entirely from a manifest:

```json
{
  "extensions": {
    "slots": {
      "routes": [{ "id": "app.page.contracts", "path": "contracts" }],
      "navbar": [
        { "id": "acme.navbar.contracts", "label": "Contracts", "path": "/contracts", "order": 15 }
      ]
    }
  }
}
```

Several nav entries may point at one page; `inputs` on the route descriptor is how you vary what it
shows. The component itself must be compiled in — **that** part is Layer 2, once. Everything after
it, including moving the page, renaming it and rule-gating it, is Layer 1 and needs no build.

The packaged nav entries with bespoke drawer markup (browse tree, tasks, clipboard, favorites,
collections, recently viewed, expired queue, personal space, settings, administration) are rendered
directly by the shell and are not addressable as sidebar components in Beta.

By convention a nav item `app.navbar.<name>` is served by `app.sidebar.<name>`. A manifest-added nav
item whose ID follows the convention picks up a registered component with no further wiring.

---

## 7. `documentList` — the packaged columns

Twelve columns, registered by the application and resolved by both the production
browse and the adf-hx browse route. So `overrides` and `slots` entries here take
effect on the rendered list.

**Nine of the twelve ship `hiddenByDefault`.** That is not the same as `disabled`:
a hidden column is still offered in the column picker, so a user can switch it on,
whereas a `disabled` column is dropped from the resolved list and disappears from the
picker too. Collapsing the two would make "hide by default" indistinguishable from
"remove", and a manifest could then only ever delete a column, never pre-fold one.

| ID                                 | Label            | Field             | Order | Sortable | Hidden by default |
| ---------------------------------- | ---------------- | ----------------- | ----- | -------- | ----------------- |
| `app.documentList.title`           | Title            | `title`           | 10    | yes      | no                |
| `app.documentList.type`            | Type             | `type`            | 20    | yes      | yes               |
| `app.documentList.modified`        | Modified         | `modified`        | 30    | yes      | no                |
| `app.documentList.lastContributor` | Last Contributor | `lastContributor` | 40    | yes      | no                |
| `app.documentList.state`           | State            | `state`           | 50    | yes      | yes               |
| `app.documentList.version`         | Version          | `version`         | 60    | no       | yes               |
| `app.documentList.created`         | Created          | `created`         | 70    | yes      | yes               |
| `app.documentList.author`          | Author           | `author`          | 80    | yes      | yes               |
| `app.documentList.nature`          | Nature           | `nature`          | 90    | no       | yes               |
| `app.documentList.coverage`        | Coverage         | `coverage`        | 100   | no       | yes               |
| `app.documentList.subjects`        | Subjects         | `subjects`        | 110   | no       | yes               |
| `app.documentList.flags`           | Flags            | `flags`           | 120   | no       | yes               |

Move a column and rename it, without a rebuild:

```json
{
  "extensions": {
    "overrides": {
      "app.documentList.lastContributor": { "label": "Updated by", "order": 5 },
      "app.documentList.modified": { "visible": false }
    }
  }
}
```

**`overrides` honours exactly four keys: `order`, `label`, `rule`, `visible`.** Anything
else in an override is silently dropped — see `applyOverride` in
`extension-slot-registry.service.ts`. This example previously used
`"hiddenByDefault": false` in an `overrides` block, which does nothing at all: the
column stayed hidden and the manifest looked correct. Corrected 2026-08-25 after it
was run against a live instance.

To change `hiddenByDefault`, `disabled`, `sortable` or `field`, contribute the
descriptor through `slots` instead. Re-stating an id in `slots.documentList` merges
over the packaged descriptor:

```json
{
  "extensions": {
    "slots": {
      "documentList": [
        { "id": "app.documentList.author", "hiddenByDefault": false },
        { "id": "app.documentList.state", "disabled": true }
      ]
    }
  }
}
```

Verified behaviour of those two, in the user's own column picker:

- `disabled` removes the column from the picker entirely, so a stored user preference
  cannot resurrect it.
- `hiddenByDefault` only sets the starting state; the column is still offered,
  unchecked, and a user may switch it on. The preference lives in
  `localStorage.browse_column_settings` as a flat array of `field` keys, and `[]`
  means the user switched everything off.

`order` is spaced by ten so an entry can be inserted between two packaged columns
without restating the list.

## 8. `toolbar` — the packaged document-detail actions

Registered by `PACKAGED_DOCUMENT_TOOLBAR_ACTIONS` in
`libs/shared/extensions/src/lib/packaged-actions.ts`, rendered by the header of
`/#/doc/:uid`. Seventeen descriptors, which is more controls than a customer ever
sees at once: the toggles are mutually exclusive pairs, and every entry is gated.

`overflow: true` puts an entry behind the **More actions** menu; the rest are
icon buttons in the header row. `overflow` is a descriptor field like any other,
so `slots.toolbar` can move a packaged action between the two.

| ID                                | Label                 | Icon                   | Order | Overflow | Shown when                              |
| --------------------------------- | --------------------- | ---------------------- | ----- | -------- | --------------------------------------- |
| `app.toolbar.edit`                | Edit                  | `edit`                 | 10    | no       | not trashed, writable and not a Note    |
| `app.toolbar.editProperties`      | Edit properties       | `edit`                 | 10    | no       | not trashed, writable and a Note        |
| `app.toolbar.addToCollection`     | Add to collection     | `library_add`          | 20    | no       | not trashed                             |
| `app.toolbar.delete`              | Delete                | `delete`               | 30    | no       | not trashed and `app.rules.canRemove`   |
| `app.toolbar.lock`                | Lock                  | `lock`                 | 40    | no       | not trashed, writable and not locked    |
| `app.toolbar.unlock`              | Unlock                | `lock_open`            | 40    | no       | not trashed, writable and locked        |
| `app.toolbar.addToFavorites`      | Add to Favorites      | `star_border`          | 50    | yes      | not trashed and not a favourite         |
| `app.toolbar.removeFromFavorites` | Remove from Favorites | `star`                 | 50    | yes      | not trashed and a favourite             |
| `app.toolbar.share`               | Share                 | `share`                | 60    | yes      | not trashed                             |
| `app.toolbar.publish`             | Publish document      | `publish`              | 70    | yes      | not trashed, has a version and writable |
| `app.toolbar.subscribe`           | Notify Me             | `notifications`        | 80    | yes      | not trashed and not subscribed          |
| `app.toolbar.unsubscribe`         | Unsubscribe           | `notifications_active` | 80    | yes      | not trashed and subscribed              |
| `app.toolbar.addToClipboard`      | Add to Clipboard      | `content_paste`        | 90    | yes      | not trashed and not in the clipboard    |
| `app.toolbar.removeFromClipboard` | Remove from Clipboard | `content_paste_off`    | 90    | yes      | not trashed and in the clipboard        |
| `app.toolbar.export`              | Export                | `download`             | 100   | yes      | always                                  |
| `app.toolbar.startProcess`        | Start Process         | `play_circle`          | 110   | yes      | not trashed                             |

`app.toolbar.export` is the one entry with no `rule`, deliberately: it was
outside the trashed-document guard in the markup this replaced, and exporting a
trashed document still works.

The document-specific header controls that are **not** in this table —
attachments, Knowledge Enrichment, the trashed-document restore banner — remain
markup. They are conditional on document shape rather than on user intent, and
extracting them would have changed behaviour rather than made it addressable.

Adding your own works exactly as for `bulk-actions`: a descriptor decides where
and when, a handler registered against the ID decides what, and a descriptor with
no handler renders inert rather than throwing.

```json
{
  "slots": {
    "toolbar": [
      { "id": "acme.toolbar.archive", "label": "Archive", "icon": "inventory_2", "order": 35 }
    ]
  },
  "overrides": {
    "app.toolbar.startProcess": { "visible": false },
    "app.toolbar.share": { "order": 15 }
  }
}
```

Moving `app.toolbar.share` to order 15 reorders it **within the overflow menu**;
`overflow` is what decides which of the two groups it is in.

---

## 9. `tabs` — the packaged document-detail tabs

Registered by `PACKAGED_DOCUMENT_TABS` in
`libs/shared/extensions/src/lib/packaged-tabs.ts`.

| ID                     | Label       | Icon           | Order | Shown when              |
| ---------------------- | ----------- | -------------- | ----- | ----------------------- |
| `app.tabs.view`        | View        | —              | 10    | always                  |
| `app.tabs.annotations` | Annotations | —              | 20    | always                  |
| `app.tabs.permissions` | Permissions | —              | 30    | always                  |
| `app.tabs.history`     | History     | —              | 40    | always                  |
| `app.tabs.publishing`  | Publishing  | —              | 50    | always                  |
| `app.tabs.aiInsights`  | AI Insights | `auto_awesome` | 60    | `app.rules.isAiEnabled` |

Hiding, reordering and relabelling these is a manifest edit. **Their bodies are
not addressable**, and that asymmetry is deliberate and worth stating: the six
packaged bodies are still markup in the host template, matched by ID. Extracting
a thousand-plus lines of tab body into separately registered components would
have been a rewrite, and the point of this slot is to make the tab strip
addressable without one.

A tab you contribute names a registered component instead, through `componentId`,
and is rendered by the same `ExtensionOutletComponent` the sidebar uses. The
component must already be compiled in — contributing one is Layer 2.

```json
{
  "slots": {
    "tabs": [
      {
        "id": "acme.tabs.claims",
        "label": "Claims",
        "icon": "assignment",
        "order": 15,
        "componentId": "acme.components.claimsPanel"
      }
    ]
  }
}
```

`componentId` defaults to the descriptor `id`, so registering the component under
the tab's own ID is enough. A contributed tab with no registered component
renders an empty body rather than throwing, so the manifest can precede the
library.

---

## 10. `contextMenu` — the browse "More actions" menu

Registered by `PACKAGED_BROWSE_CONTEXT_MENU` in
`libs/shared/extensions/src/lib/packaged-actions.ts`, rendered by the browse
header. The actions apply to the folder or document currently open.

| ID                            | Label       | Icon                | Order | Shown when     |
| ----------------------------- | ----------- | ------------------- | ----- | -------------- |
| `app.contextMenu.share`       | Share       | `share`             | 10    | always         |
| `app.contextMenu.subscribe`   | Notify Me   | `notifications`     | 20    | not subscribed |
| `app.contextMenu.unsubscribe` | Unsubscribe | `notifications_off` | 20    | subscribed     |
| `app.contextMenu.export`      | Export      | `ios_share`         | 30    | always         |

**Browse has no per-row menu**, in this build or before it. The slot's
description in the section 2 table used to read "row-level menu on a document
list" while the only menu in `browse.html` was this one, which would have sent a
customer looking for a surface that does not exist. The ID is the contract and
stays; the description was corrected.

---

## 11. `routes` — manifest-contributed routes

Resolves, with no packaged entries: the application's own routes are still
imported directly by `app.routes.ts`, so none of them is addressable by ID. What
this slot does is let a manifest add a route that did not exist at build time,
serving a component registered under Layer 2.

| Field         | Meaning                                                                    |
| ------------- | -------------------------------------------------------------------------- |
| `path`        | Required. Relative router path — see the validation note below this table. |
| `componentId` | Registered component ID. Defaults to the descriptor `id`.                  |
| `inputs`      | Static values bound to the component's inputs via route data.              |

A `path` must be a non-empty string, must not begin with `/`, and must not contain
whitespace, `?` or `#`. An entry failing any of those is dropped and reported on
`AppExtensionsService.invalidRoutes()`, alongside the reason — the rest of the batch
still registers. Angular's own router validation runs only in a development build, so
without this an invalid path threw on a dev server and became a permanently unmatchable
route in production.

```json
{
  "slots": {
    "routes": [
      {
        "id": "acme.routes.reports",
        "path": "reports",
        "componentId": "acme.components.reports",
        "inputs": { "reportSet": "claims" }
      }
    ]
  }
}
```

Contributed routes are appended to the shell's children, so they inherit the
navigation and the authentication guard, and they are re-applied whenever the
manifest changes. A `navbar` entry with `"path": "/reports"` then reaches it.

**A route is not an authorisation boundary.** Adding one exposes a component;
whatever it calls is still gated by Nuxeo server-side, and removing a route does
not protect anything the API would otherwise return.

---

## 12. `$references` — layering your JSON over ours

Semantics are ACA's, implemented by merging through `mergeObjects` from `@alfresco/adf-extensions`
rather than reimplemented, so behaviour matches the upstream documentation.

- Layers apply in the order `$references` lists them. **Later wins.**
- `$`-prefixed keys are **metadata and do not merge** — `$references` from a referenced layer never
  leaks into the result.
- Arrays of objects merge **by `id`**, so a layer patches one entry without restating the list.
- `"<key>.$replace"` replaces instead of merging.
- `$ignoreReferenceList` drops a layer even when it is referenced.
- A layer that cannot be resolved is reported on `AppExtensionsService.missingLayers()`, not silently
  dropped, and the rest of the stack still applies.

```json
{
  "extensions": {
    "$references": ["baseline", "acme"],
    "$layers": {
      "baseline": { "overrides": { "app.navbar.browseAdfHx": { "visible": false } } },
      "acme": { "overrides": { "app.navbar.browse": { "label": "Repository" } } }
    }
  }
}
```

References resolve one level deep. A referenced layer's own `$references` is metadata and is skipped,
so nesting is ignored rather than half-honoured.

---

## 13. What Beta does not yet address

Stated so nobody plans around a capability that is not there.

The first two are a **deliberate Beta boundary**, not an oversight: Layer 1 is additive for
Beta. You can add surfaces and you can hide, reorder or relabel packaged ones. You cannot
replace a shipped route or change what a packaged tab renders. Making either addressable is a
rewrite rather than a refactor, so it is deferred to GA. If you need to replace a shipped page,
that is Layer 2 — see section 14.

- **Tab and toolbar bodies.** The six packaged tab bodies and the document-specific header
  controls listed in section 8 are still markup. The tab strip and the toolbar are addressable;
  what a packaged tab renders is not.

- **The packaged routes.** `app.routes.ts` imports each feature library's `Routes` array
  directly, so no packaged route carries an ID and none can be moved, guarded or removed from a
  manifest. Section 11 covers what the slot does do — add routes that did not exist at build
  time.

  `toolbar`, `tabs`, `contextMenu`, `bulk-actions` and `documentList` were once in this list and
  are **not** any more: all five are Populated per the table in section 2. This bullet named
  document-list columns for weeks after the consumer landed, which is the kind of stale exclusion
  that gets a working capability left out of a demo. The table in section 2 is the authoritative
  statement of slot state and is gated by `npm run beta:reference`; this prose is not.

- **The two selection permission rules**, for the reason given in section 4.
- **An in-app editor** for the manifest. It is edited as a Nuxeo Note.

- **The permissions panel handles three permission levels, not Nuxeo's twelve.** The adopted
  upstream panel represents `Read`, `ReadWrite` and `Everything`, and ranks rows against exactly
  that list. A document whose local ACL holds anything else — `Write`, `AddChildren`,
  `WriteSecurity`, `ReadVersion` and the rest, which workflows and server-side code do set — cannot
  be round-tripped through it.

  Because Nuxeo has no replace-an-ACL operation, saving is a clear followed by a replay, so an ACE
  the panel cannot represent would be **deleted** by a save that reported success. The bridge now
  **refuses the write** on such a document and names the offending entries, rather than losing them.

  That is a guard, not a capability: the panel still cannot edit those documents at all, and their
  permissions must be managed in Nuxeo until upstream can express the full set. Treat a refusal as
  correct behaviour, not a defect.

  **This is not only exotic documents.** Surveyed against a stock instance, 2 of the 12 documents
  carrying a local ACL would be refused, and both are ones Nuxeo creates itself — the `sections`
  root of a domain, which Nuxeo grants `members: CanAskForPublishing` by default, and a document's
  `Comments` container, which the comment service gives `AddChildren` and `RemoveChildren`.

  So the permissions panel is unusable on the Sections root of a stock domain from day one. Saving
  there would have deleted the grant the publishing workflow depends on, so the refusal is doing its
  job — but expect it, and manage those permissions in Nuxeo.

---

## 14. Registering from your own library (Layer 2)

```ts
import {
  AppExtensionsService,
  ExtensionComponentRegistry,
} from '@nuxeo-satori/platform/extensions';

const extensions = inject(AppExtensionsService);
const components = inject(ExtensionComponentRegistry);

extensions.registerRules({
  'acme.rules.isContract': (context) => context.document?.type === 'AcmeContract',
});

components.register({
  'acme.sidebar.contracts': () => import('./contracts-drawer').then((m) => m.ContractsDrawer),
});

extensions.register('navbar', [
  {
    id: 'acme.navbar.contracts',
    label: 'Contracts',
    path: '/contracts',
    icon: 'folder',
    order: 35,
  },
]);
```

Register from an `APP_INITIALIZER`, not a component constructor. Unregistered rules fail open, so a
late registration means a gated entry is briefly visible.

Re-registering one of our IDs replaces it — that is the supported way to override a packaged rule or
component without forking.

### Replacing what a packaged action does

Section 1 explains why a manifest cannot rebind a packaged action. Here is where you can:

```ts
import { ExtensionActionRegistry } from '@nuxeo-satori/platform/extensions';

const actions = inject(ExtensionActionRegistry);

const registration = actions.register({
  'app.toolbar.delete': { execute: (context) => myArchiveFlow(context.document) },
});
```

`register` puts your handler in the **customer tier**, which always answers ahead of ours — timing
does not matter. That guarantee is deliberate: you register from an `APP_INITIALIZER`, while a
packaged surface registers handlers closing over a live component in `ngOnInit`. Ours is therefore
always the _later_ call, so a single last-wins map would have silently outranked every override you
wrote. `registerPackaged` is the tier we use, and it is only consulted when nobody has overridden
the ID.

`register` returns a registration, and `unregister()` on it withdraws **exactly** the handlers that
call added:

```ts
inject(DestroyRef).onDestroy(() => registration.unregister());
```

It is scoped to the call rather than taking a list of IDs because an ID is shared — we register
`app.toolbar.delete` too, and "withdraw the handlers for these IDs" would have deleted yours the
first time the user navigated away from a document. Withdrawing is only necessary if your handler
closes over something with a lifetime, such as a component instance.
