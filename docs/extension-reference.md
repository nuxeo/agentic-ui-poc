# Extension reference — Layer 1

**Status:** current · **Introduced:** Phase 2 (Beta) · **Audience:** customers, partners and their agents

Everything a manifest can address, by ID. An extension point nobody can discover is not an
extension point, so this file is the contract: if an ID is not listed here, do not depend on it.

Related: [`docs/adf-hx-beta-plan.md`](adf-hx-beta-plan.md) ·
[`AGENTS/11-beta-program.md`](../AGENTS/11-beta-program.md)

---

## 1. Read this first

### IDs are a public contract

Every ID below follows `<owner>.<surface>.<name>` — `app.toolbar.delete`, `app.rules.canWrite`,
`app.navbar.browse`. Use your own owner prefix for anything you contribute (`acme.navbar.contracts`).
Once published, **renaming one of our IDs is a breaking change** and will only happen in a major
version.

### Hiding an action is not a security control

Layer 1 decides what the UI _offers_. It does not decide what the server _allows_. Nuxeo evaluates
the real permission server-side on every operation, so:

- hiding `app.toolbar.delete` does not stop a user who has `Remove` from deleting via the REST API;
- showing it does not grant anything — the operation still fails with 403 without the permission;
- an **unregistered rule ID evaluates to `true`**, deliberately, so a typo or a manifest written
  against a newer release cannot silently strip working actions out of the UI. The exception is
  the three user rules in section 4, which fail **closed** — an unknown
  `app.rules.hasAdministrationAccess` must not hand every user the Administration
  entry while the shell is still starting up.

Use Nuxeo ACLs for authorisation. Use the manifest for what the interface presents.

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

A slot is a named, ordered list of descriptors. Eight exist for Beta, of which two
carry packaged entries.

| Slot           | What it addresses                       | Status in Beta                                    |
| -------------- | --------------------------------------- | ------------------------------------------------- |
| `navbar`       | Primary platform navigation entries     | **Populated** — packaged entries in section 3     |
| `bulk-actions` | Actions over a multi-document selection | **Populated** — packaged entries in section 5     |
| `sidebar`      | Drawer content behind a navbar entry    | Resolves; **no packaged entries** — see section 6 |
| `routes`       | Application routes                      | Declared; **nothing resolves it** — see section 8 |
| `toolbar`      | Document-detail and browse toolbar      | Declared; **nothing resolves it** — see section 8 |
| `contextMenu`  | Row-level menu on a document list       | Declared; **nothing resolves it**                 |
| `tabs`         | Document-detail tab children            | Declared; **nothing resolves it**                 |
| `documentList` | Document list columns                   | Declared; **nothing resolves it**                 |

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
import { ExtensionActionRegistry } from '@agentic-ui/shared/extensions';

inject(ExtensionActionRegistry).register({
  'acme.bulkActions.archive': inject(AcmeArchiveActionService),
});
```

Handlers are objects with an `execute(context)` method — the shape adf-hx uses
for its own `*-action.service` classes. Re-registering one of our IDs replaces
the behaviour without forking. A handler that closes over a component must be
withdrawn with `unregister()` when that component is destroyed.

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

| Component ID                | Renders             |
| --------------------------- | ------------------- |
| `app.sidebar.assets`        | Asset facet filters |
| `app.sidebar.searchFilters` | Search filter panel |
| `app.sidebar.trashFilters`  | Trash filter panel  |

The packaged nav entries with bespoke drawer markup (browse tree, tasks, clipboard, favorites,
collections, recently viewed, expired queue, personal space, settings, administration) are rendered
directly by the shell and are not addressable as sidebar components in Beta.

By convention a nav item `app.navbar.<name>` is served by `app.sidebar.<name>`. A manifest-added nav
item whose ID follows the convention picks up a registered component with no further wiring.

---

## 7. `$references` — layering your JSON over ours

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

## 8. What Beta does not yet address

Stated so nobody plans around a capability that is not there.

- **Toolbar, overflow menu, tabs, context menu and document-list columns.** `bulk-actions` is done —
  see section 5 — but `document-detail.html` still holds its toolbar, its seven-item overflow menu
  and its five tab children in markup, and browse still holds its row menu and column set in markup.
  Those four slot IDs are reserved and the registry accepts entries, but **no code reads them**, so
  contributing to one has no effect. A manifest cannot yet hide, reorder or gate a toolbar action.
- **The two selection permission rules**, for the reason given in section 4.
- **Route contributions.** Feature libraries export `Routes` arrays, but `app.routes.ts` still
  imports them directly.
- **An in-app editor** for the manifest. It is edited as a Nuxeo Note.

---

## 9. Registering from your own library (Layer 2)

```ts
import { AppExtensionsService, ExtensionComponentRegistry } from '@agentic-ui/shared/extensions';

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
