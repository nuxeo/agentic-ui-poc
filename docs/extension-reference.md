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
  against a newer release cannot silently strip working actions out of the UI.

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

A slot is a named, ordered list of descriptors. Nine are implemented for Beta.

| Slot           | What it addresses                       | Status in Beta                                    |
| -------------- | --------------------------------------- | ------------------------------------------------- |
| `navbar`       | Primary platform navigation entries     | **Implemented** — packaged entries in section 3   |
| `sidebar`      | Drawer content behind a navbar entry    | **Implemented** — components in section 5         |
| `routes`       | Application routes                      | Declared; contributions land with the action work |
| `toolbar`      | Document-detail and browse toolbar      | Declared; **not yet populated** — see section 7   |
| `contextMenu`  | Row-level menu on a document list       | Declared; **not yet populated**                   |
| `bulk-actions` | Actions over a multi-document selection | Declared; **not yet populated**                   |
| `tabs`         | Document-detail tab children            | Declared; **not yet populated**                   |
| `rules`        | Named predicates, section 4             | **Implemented**                                   |
| `documentList` | Document list columns                   | Declared; **not yet populated**                   |

Deferred to GA and deliberately absent: `content-metadata-presets`, `badges`,
`userProfileSections`, `search` filters, `create`.

### Slots are additive

Slot IDs are plain strings. There is no enum, union or `switch` on slot identity in the registry, so
a tenth slot needs no change to the nine and no new release of the registry —
`libs/shared/extensions/src/lib/extension-slot-registry.service.spec.ts` proves it by registering a
slot the library has never heard of and showing the nine unchanged.

### Fields every descriptor honours

| Field      | Meaning                                                           |
| ---------- | ----------------------------------------------------------------- |
| `id`       | Required. The address. An entry without one is dropped.           |
| `order`    | Ascending. Absent sorts last. Packaged entries are spaced by ten. |
| `disabled` | `true` removes the entry. Upstream ACA semantics.                 |
| `rule`     | A rule ID, or a nested rule reference — see section 4.            |

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
section 5. Without a registered sidebar component the drawer shows a placeholder, which is a
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

### Selection rules

| ID                             | True when                            |
| ------------------------------ | ------------------------------------ |
| `app.rules.hasSelection`       | At least one document is selected    |
| `app.rules.hasSingleSelection` | Exactly one document is selected     |
| `app.rules.canWriteSelection`  | Every selected document is writable  |
| `app.rules.canRemoveSelection` | Every selected document is removable |

**Caveat, stated plainly:** the selection half of the rule context is not yet populated. Nothing in
the shell owns a list of selected _documents_ — `SelectionService` tracks IDs — so these four rules
currently evaluate against an empty selection and answer `false`. They become live with the action
registry. Do not reference them yet.

### User rules

| ID                                  | True when                       |
| ----------------------------------- | ------------------------------- |
| `app.rules.isAdministrator`         | The user is in `administrators` |
| `app.rules.isPowerUser`             | The user is in `powerusers`     |
| `app.rules.hasAdministrationAccess` | Either of the above             |

### Composites and constants

| ID           | Semantics                                      |
| ------------ | ---------------------------------------------- |
| `core.every` | All nested rules pass. Empty list is `true`.   |
| `core.some`  | Any nested rule passes. Empty list is `false`. |
| `core.not`   | Negates the conjunction of its nested rules.   |
| `core.true`  | Always `true`.                                 |
| `core.false` | Always `false`.                                |

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

## 5. `sidebar` — drawer components

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

## 6. `$references` — layering your JSON over ours

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

## 7. What Beta does not yet address

Stated so nobody plans around a capability that is not there.

- **Toolbar, overflow menu, tabs, context menu, bulk actions and document-list columns.** The slots
  exist and resolve, but nothing is registered into them yet: `document-detail.html` and
  `selection-topbar.component.html` still hold their actions in markup. Until that refactor lands, a
  manifest cannot hide, reorder or gate a toolbar action.
- **The selection rules**, for the reason given in section 4.
- **Route contributions.** Feature libraries export `Routes` arrays, but `app.routes.ts` still
  imports them directly.
- **An in-app editor** for the manifest. It is edited as a Nuxeo Note.

---

## 8. Registering from your own library (Layer 2)

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
