# Beta demo runbook — Nuxeo Satori

**Every claim in this file was executed against a live instance on 2026-08-25.** Nothing is
inferred from documentation. Where something could not be verified it says so; where a doc said
one thing and the running system did another, the running system wins and the doc was corrected.

Read Part 0 and Part 6 before anything else. Part 6 is the list of things that do not work — it
is the more useful half of this document, because the failure mode of a demo like this is
confidently showing something that is not there.

---

## Part 0 — Pre-flight, 30 minutes before

Run these in order. Every one has an expected output; if you get something else, stop and fix it
before continuing.

### 0.1 Docker and Nuxeo

Nuxeo is **not** in this repo — it is two containers managed outside it. On 2026-08-25 both were
stopped and the Docker daemon was off, which would have ended the demo at the first click.

```bash
open -a Docker                      # wait for the daemon; ~10s
docker start nuxeo-opensearch       # OpenSearch first, Nuxeo depends on it
sleep 15
docker start nuxeo
```

Wait for readiness, then confirm:

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080/nuxeo/runningstatus   # → 200
```

> The daemon dropped out once mid-restart during rehearsal. If `docker start` reports a socket
> error, re-run `open -a Docker`, wait, and try again. Do not assume it came up.

### 0.2 The app

```bash
curl -s -o /dev/null -w '4200: %{http_code}\n' http://localhost:4200                      # → 200
curl -s -o /dev/null -w 'proxy: %{http_code}\n' -u Administrator:Administrator \
  http://localhost:4200/nuxeo/api/v1/path/default-domain                                  # → 200
curl -s -o /dev/null -w 'bootstrap: %{http_code}\n' \
  http://localhost:4200/agentic-ui-config/bootstrap.json                                  # → 200
```

### 0.3 The customer-extension app — a **separate** app on a **separate** port

The customer extension is **not loaded by the product app.** See F0 in Part 6. If you are showing
Layer 2 you must start a second server yourself — **nothing is listening on :4310 by default:**

```bash
npx nx serve nuxeo-satori-template --port 4310    # --port is required; it defaults to 4200
```

```bash
curl -s -o /dev/null -w '4310: %{http_code}\n' http://localhost:4310                      # → 200
```

### 0.4 Clear stored state that silently overrides the manifest

In devtools console on `http://localhost:4200`:

```js
localStorage.removeItem('browse_column_settings'); // user column picks beat the manifest
localStorage.removeItem('agentic_ui_color_theme'); // a stored theme beats defaultThemeId
```

### 0.5 Warm the slow routes

First load of the adf-hx route fetches a lazy ~1.3 MB chunk and takes about **4 seconds**. Visit
each of these once, then return to the dashboard:

- `http://localhost:4200/#/browse`
- `http://localhost:4200/#/browse-adf-hx?path=%2Fdefault-domain`
- `http://localhost:4200/#/search-adf-hx`

### 0.6 Create the manifest document

Every customisation beat needs it, and on a clean instance it **does not exist**. The phase
harness scripts do not create it — they intercept the HTTP call in the browser, so there was no
procedure to reuse. This one was built and verified end to end.

```bash
curl -s -u Administrator:Administrator -X POST \
  http://localhost:8080/nuxeo/api/v1/path/default-domain/config \
  -H 'Content-Type: application/json' \
  -d '{"entity-type":"document","name":"agentic-ui","type":"Note",
       "properties":{"dc:title":"agentic-ui","note:mime_type":"text/plain",
                     "note:note":"{\"version\":1}"}}' \
  -w '\nHTTP %{http_code}\n'          # → 201
```

Save this as `/tmp/apply-manifest.sh` and `chmod +x` it. You will use it for every beat:

```bash
#!/usr/bin/env bash
set -euo pipefail
python3 - "$1" > /tmp/.envelope.json <<'PY'
import json,sys
print(json.dumps({"entity-type":"document",
  "properties":{"note:note":json.dumps(json.load(open(sys.argv[1])))}}))
PY
curl -s -u Administrator:Administrator -X PUT \
  http://localhost:8080/nuxeo/api/v1/path/default-domain/config/agentic-ui \
  -H 'Content-Type: application/json' -d @/tmp/.envelope.json \
  -o /dev/null -w 'applied: HTTP %{http_code}\n'    # → 200
```

`note:note` holds a **JSON string**, not nested JSON. Writing an object there makes the parser
return `null` and you silently get the packaged UI. The script does the double-encoding for you.

**After every manifest change you must hard-reload (⌘⇧R).** `withHashLocation()` means hash
navigation is same-document, so `APP_INITIALIZER` never re-runs and the old value survives. This
was verified by watching a label fail to change on a hash nav. Measured on a warm dev server:
nav updates 245 ms after reload, the browse table 273 ms.

---

## Part 1 — What is adf-hx, and what is ours

This is the question you will be asked first, and the answer is easy to get backwards. An
`hxp-*` tag says **nothing** about who wrote the component: **six** are upstream's and
**fourteen** are ours, sharing the prefix.

> `libs/shared/adf-hx-bridge/ARCHITECTURE.md` had this inverted until 2026-08-25 — it listed
> `hxp-document-list` and `hxp-breadcrumb` as ours, and listed two things that do not exist. It
> is corrected now, but if you have read an older copy, re-read it.

The reliable test is the import. Our POC feature code aliases every upstream component as
`Upstream*` on import — see `browse-adf-hx-poc.ts:60-66`.

### Real adf-hx (from `@alfresco/adf-hx-content-services/ui`)

| Selector                      | Where                                              |
| ----------------------------- | -------------------------------------------------- |
| `hxp-document-list`           | browse POC, adf-hx search                          |
| `hxp-breadcrumb`              | browse POC                                         |
| `hxp-properties-sidebar`      | browse POC, Properties tab                         |
| `hxp-ui-document-viewer`      | browse POC                                         |
| `hxp-manage-versions-sidebar` | browse POC, Versions tab                           |
| `hxp-document-tree`           | nav drawer, wrapped by our `hxp-browse-nav-drawer` |

### Ours — 14 components in `libs/shared/adf-hx-bridge/src/lib/ui/`

`hxp-folder-header`, `hxp-domain-hint`, `hxp-browse-tabs`, `hxp-browse-toolbar`,
`hxp-browse-pager`, `hxp-column-picker`, `hxp-document-cards`, `hxp-browse-permissions`,
`hxp-browse-history`, `hxp-browse-trash`, `hxp-browse-details-panel`, `hxp-browse-nav-drawer`,
`hxp-icon`, `hxp-spinner`.

**Permissions, History and Trash are ours**, reading real Nuxeo ACL, audit and trash APIs. Do not
attribute them to adf-hx.

### Dependency versions (from the lockfile)

| Package                             | Version             |
| ----------------------------------- | ------------------- |
| `@alfresco/adf-hx-content-services` | 7.20.0-automate.292 |
| `@alfresco/adf-core`                | 9.0.0               |
| `@alfresco/adf-extensions`          | 9.0.0               |
| `@hylandsoftware/hxcs-js-client`    | 2.0.111             |
| `@hylandsoftware/satori-ui`         | 0.2.0               |

### The side-by-side, and how to show it

All routes need `/#/` — the app uses hash routing.

| Show                          | URL                                             | Point at                                                                                         |
| ----------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Ours** (baseline)           | `/#/browse/default-domain`                      | Material chrome, file-type icons, `Root › Domain` breadcrumb                                     |
| **adf-hx**                    | `/#/browse-adf-hx?path=%2Fdefault-domain`       | **The table** — that is upstream's `hxp-document-list`, driven by our Layer 1 column descriptors |
| **Properties** (best surface) | same URL → **tick a row checkbox** → Properties | Real Nuxeo data: Title, Category, Created, Creator, Path                                         |
| **Versions**                  | same → Versions                                 | "Current Version / Created By Administrator / …"                                                 |

**Tick the checkbox, do not click the row.** A row click leaves both sidebars saying _"Select a
single document in the View tab."_ This one detail is the difference between your strongest beat
and an empty panel.

The wrapping rule — _adf-hx types never appear in our public API_ — is **enforced, not just
documented**: `scripts/review-guardrails.mjs` fails the build if an `@alfresco/adf-hx-`* import is
reachable from a library's public barrel. `@alfresco/adf-extensions` is a deliberate exception and
is a declared peer dependency, so customers do install that one.

---

## Part 2 — How they are packaged separately

Two independent artefacts, and a clean support boundary.

### 1. The npm library — what customers code against

`@nuxeo-satori/platform`, five entry points: `.`, `/app-config`, `/extensions`, `/nuxeo-client`,
`/ui`. The built package also ships `AGENTS.md`, `extension-reference.md`, four Nx generators and
the guardrail script.

**Say "publishable", not "published".** Nothing is on any registry — that is a deliberate later
step. `private: true` remains in the built `package.json` as an intentional tripwire; the
publishability check _fails_ if it is missing. Verified: `nx build platform` exit 0,
`npm publish --dry-run` succeeds, and the template app compiles against the built types.

**On the name:** the package in the repo today is `@nuxeo-satori/platform`, and that is the form
the guardrail prints on screen in Beat 10 when it lists the published entry points. A rename to
`@nuxeo/satori-platform` on `packages.nuxeo.com` is written up in
`docs/publishing-to-nuxeo-registry.md` §5.1, but **no rename decision was verified** — treat it as
a documented intention, not a fact. Safest phrasing: _"it is not published yet; the final package
name is part of that step."_ Saying a different name from the one Beat 10 prints will read as a
contradiction.

### 2. The Nuxeo marketplace package

`nuxeo-agentic-ui-package/` — a Maven module producing an addon ZIP: the OSGi bundle, the built
Angular app into `/web/nuxeo.war/agentic-ui`, and Layer 0 config into `/config`.

The interesting engineering detail, and it is worth reading aloud from
`nuxeo-agentic-ui-package/src/main/resources/install.xml`:

- the app bundle is copied with `overwrite="true"` — replaced on every upgrade;
- the config directory is copied **separately**, to a **sibling** path, with `overwrite="false"`.

So a customer's branding file is seeded on first install and **left untouched on every upgrade
after it**. Configuration was deliberately put where the installer cannot reach it. That is a
real decision with a stated failure mode, not a diagram.

> **Unverified:** nobody ran Maven. Do **not** claim the marketplace ZIP builds or installs. Only
> the Angular half was built (`nx build nuxeo-ui --configuration=production`, exit 0, 7.7 MB).

### The support boundary

|                           |                                                                                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Customer depends on       | `@nuxeo-satori/platform` + peers: Angular 20.3, Material/CDK 20.2, `@alfresco/adf-extensions ^9`, `@hylandsoftware/satori-ui ^0.2`, `rxjs ^7.8`                                                              |
| Customer **cannot** reach | `libs/shared/adf-hx-bridge` is **internal** — not published, no build target, absent from the package. All twelve API ports, the Nuxeo↔Hx mappers and all fourteen of our `hxp-`* components are unreachable |

**The line for leadership:** adf-hx is an implementation detail of the product, not part of the
customer contract. Customers get the Layer 0/1/2 extensibility surface and are insulated from
adf-hx entirely — except `@alfresco/adf-extensions`, which they install as a peer.

---

## Part 3 — The four customer journeys

| Journey                                                     | Layer                | Needs a build?   | Where it runs |
| ----------------------------------------------------------- | -------------------- | ---------------- | ------------- |
| Rebrand the shipped app                                     | 0 (file)             | **No**           | `:4200`       |
| Reconfigure the shipped app — labels, nav, columns, actions | 0/1 (Nuxeo document) | **No**           | `:4200`       |
| Add their own features to the shipped app                   | 2 (their library)    | Yes, their build | `:4310`       |
| Build a UI from scratch on our platform                     | 2                    | Yes, their build | `:4310`       |

**There are two Layer 0 stores and conflating them is the most likely thing to trip you up:**

|                      | Lives in                                              | Holds                                                               |
| -------------------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| **bootstrap**        | a **file**, `agentic-ui-config/bootstrap.json`        | branding, themes, SSO, session, integrations                        |
| **runtime manifest** | a **Nuxeo Note**, `/default-domain/config/agentic-ui` | `labels`, `featureToggles`, and the whole Layer 1 `extensions` tree |

`runtime-manifest.ts` has no `branding` or `themes` key. **Branding is not a manifest edit.**

---

## Part 4 — The demo script

Timings are measured on a warm dev server.

### Beat 1 — The product as shipped (2 min)

`/#/browse/default-domain`. Real repository, 113 documents. This is the baseline; everything after
it is customisation without forking.

### Beat 2 — adf-hx vs ours (4 min)

Follow the table in Part 1. Open `/#/browse` and `/#/browse-adf-hx?path=%2Fdefault-domain` in two
tabs and switch between them. Tick a checkbox, show Properties, then Versions.

Do not scroll the Properties panel far — below the fold it exposes raw uppercase property keys
(`CONTRIBUTORS`, `IS_WEB_CONTAINER`).

### Beat 3 — Rebrand, no rebuild (3 min)

Edit `nuxeo-agentic-ui-package/src/main/config/bootstrap.json`:

```json
{
  "branding": {
    "applicationTitle": "Acme Content Cloud",
    "documentTitle": "Acme Content Cloud"
  },
  "defaultThemeId": "acme",
  "themes": [
    {
      "id": "acme",
      "label": "Acme Brand",
      "base": "light",
      "preview": {
        "sidebar": "#2d0b4e",
        "surface": "#f6f2fb",
        "header": "#e6dcf5",
        "accent": "#7b2ff7",
        "tile": "#d9c9f0"
      },
      "tokens": { "--mat-sys-primary": "rgb(123, 47, 247)", "--agentic-pill-radius": "4px" }
    }
  ]
}
```

Hard-reload, open `/#/settings/themes`. The audience sees the **browser tab title** change, a
fifth theme card "Acme Brand", and the purple accent applied.

**Demo** `documentTitle`**, not** `applicationTitle` — see F2. And say "product name and colour",
never "logo" — see F1.

The strongest version of this beat: point out that the JavaScript bundle is byte-identical before
and after. It was verified by hashing `main-*.js` across a rebrand — `sha256` unchanged.

Reset: `git checkout -- nuxeo-agentic-ui-package/src/main/config/bootstrap.json`

### Beat 4 — Relabel the product (2 min)

```json
{
  "version": 1,
  "labels": {
    "settings.themes.title": "Appearance",
    "settings.themes.apply": "Use this one"
  }
}
```

`./apply-manifest.sh that.json`, hard-reload, open `/#/settings/themes`. Heading becomes
"Appearance", button "Use this one". The manifest layers **last** over the shipped catalogue, so
the customer always wins.

`labels` **cannot** relabel navigation — see F5.

### Beat 5 — Nav: hide one, add one, and the security question (4 min)

```json
{
  "version": 1,
  "extensions": {
    "$name": "acme-demo",
    "overrides": { "app.navbar.browseAdfHx": { "visible": false } },
    "slots": {
      "navbar": [
        {
          "id": "acme.navbar.contracts",
          "label": "Contracts",
          "path": "/browse",
          "icon": "folder",
          "order": 35
        }
      ]
    }
  }
}
```

"Browse (adf-hx POC)" disappears; "Contracts" appears between Browse and where it was. `order` is
spaced by ten, so 35 lands exactly between 30 and 40. Verified live: 15 entries, `acme.navbar.contracts`
at index 3, directly between `app.navbar.browse` and `app.navbar.recentlyViewed`.

> **Expand the nav rail before this beat.** It is collapsed by default, so labels are hidden by CSS
> and a new entry shows only as an icon — measured: every item's `innerText` is empty while
> `textContent` reads correctly. Expand or hover so the audience can read "Contracts".

**Then type** `/#/browse-adf-hx` **in the address bar. The page still loads.** Do this deliberately.
It is your honest answer to _"so I can hide admin actions from users?"_ — **no.** Hiding is
presentation; Nuxeo's server-side ACLs are authorisation. Volunteering this earns more trust than
being caught by it.

### Beat 5a — Custom page for a nav entry (5 min, optional)

**This beat shows creating a custom page with widgets for the Contracts entry.** Skip this if time is
tight; Beats 5-7 already demonstrate the extensibility story.

**1. Create the component:**

```bash
cat > apps/nuxeo-ui/src/app/features/contracts/contracts-page.component.ts <<'TS'
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contracts-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 2rem;">
      <h1>Contracts Dashboard</h1>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 2rem;">
        <div style="padding: 1.5rem; border: 1px solid #ddd; border-radius: 8px;">
          <h3>Active Contracts</h3>
          <p style="font-size: 2rem; margin: 1rem 0;">24</p>
          <p style="color: #666;">Updated 2 hours ago</p>
        </div>
        <div style="padding: 1.5rem; border: 1px solid #ddd; border-radius: 8px;">
          <h3>Expiring Soon</h3>
          <p style="font-size: 2rem; margin: 1rem 0; color: #f57c00;">3</p>
          <p style="color: #666;">Next 30 days</p>
        </div>
        <div style="padding: 1.5rem; border: 1px solid #ddd; border-radius: 8px;">
          <h3>Total Value</h3>
          <p style="font-size: 2rem; margin: 1rem 0;">$2.4M</p>
          <p style="color: #666;">Current quarter</p>
        </div>
      </div>
      <div style="margin-top: 2rem; padding: 1.5rem; border: 1px solid #ddd; border-radius: 8px;">
        <h3>Recent Activity</h3>
        <ul>
          <li style="padding: 0.5rem 0;">Contract ABC-123 renewed - 2 days ago</li>
          <li style="padding: 0.5rem 0;">Contract XYZ-789 pending review - 3 days ago</li>
          <li style="padding: 0.5rem 0;">Contract DEF-456 signed - 1 week ago</li>
        </ul>
      </div>
    </div>
  `
})
export class ContractsPageComponent {}
TS
```

**2. Add the route** in `apps/nuxeo-ui/src/app/app.routes.ts`:

```typescript
// Add this import at the top
import { ContractsPageComponent } from './features/contracts/contracts-page.component';

// Add this route in the routes array (after the browse routes)
{
  path: 'contracts',
  component: ContractsPageComponent,
  canActivate: [authGuard]
},
```

**3. Update the manifest** to point to the custom route:

```json
{
  "version": 1,
  "extensions": {
    "$name": "acme-demo",
    "overrides": { "app.navbar.browseAdfHx": { "visible": false } },
    "slots": {
      "navbar": [
        {
          "id": "acme.navbar.contracts",
          "label": "Contracts",
          "path": "/contracts",
          "icon": "folder",
          "order": 35
        }
      ]
    }
  }
}
```

Apply: `./apply-manifest.sh /tmp/beat5a.json`, hard-reload, click **Contracts** in the nav.

**The audience sees** a custom dashboard with stat tiles (Active: 24, Expiring: 3, Total: $2.4M) and
recent activity. This demonstrates that **manifest-driven nav entries can point to custom code**
without forking — the component is added to the product app, and the manifest wires it up.

**Clean up after the beat** (if you showed it):

```bash
rm apps/nuxeo-ui/src/app/features/contracts/contracts-page.component.ts
# Revert the route addition in app.routes.ts
git checkout -- apps/nuxeo-ui/src/app/app.routes.ts
```

### Beat 6 — Columns (3 min)

```json
{
  "version": 1,
  "extensions": {
    "overrides": {
      "app.documentList.lastContributor": { "label": "Updated by", "order": 5 },
      "app.documentList.modified": { "visible": false }
    }
  }
}
```

`/#/browse` headers go from `Title, Modified, Last Contributor` to `Updated by, Title`. The same
relabel also lands inside upstream's `hxp-document-list` on `/#/browse-adf-hx` — one manifest,
both stacks.

For the picker contrast, use `slots` (**not** `overrides` — see F4):

```json
{
  "version": 1,
  "extensions": {
    "slots": {
      "documentList": [
        { "id": "app.documentList.state", "disabled": true },
        { "id": "app.documentList.version", "hiddenByDefault": true }
      ]
    }
  }
}
```

Click "Manage columns": **State is absent entirely; Version is offered, unchecked.** `disabled`
takes it away from the user; `hiddenByDefault` only sets the starting state.

### Beat 7 — Bulk actions and rules (4 min)

```json
{
  "version": 1,
  "extensions": {
    "overrides": { "app.bulkActions.publish": { "visible": false } },
    "slots": {
      "bulk-actions": [
        {
          "id": "acme.bulkActions.archive",
          "label": "Archive",
          "icon": "inventory_2",
          "order": 15
        },
        {
          "id": "acme.bulkActions.merge",
          "label": "Merge selected",
          "icon": "merge",
          "order": 25,
          "rule": "app.rules.hasMultipleSelection"
        },
        {
          "id": "acme.bulkActions.review",
          "label": "Send for review",
          "icon": "rate_review",
          "order": 26,
          "enabledRule": "app.rules.hasMultipleSelection"
        }
      ]
    }
  }
}
```

On `/#/browse`, wait ~2.5 s for the table, then select rows.

- **Two rows:** Archive present, Publish gone, Merge present, Send-for-review enabled.
- **One row:** Merge **disappears**; Send-for-review is **present but greyed**.

That contrast is the beat: `rule` removes, `enabledRule` disables. Same declarative gate, two
different user experiences, no code.

### Beat 8 — Upgrade safety (3 min)

```bash
npm run beta:upgrade                          # exit 0, ~4s warm
npm run beta:upgrade -- --break-slot toolbar  # exit 1
```

The passing run reports _"all 3 manifest-named slot(s) still exist in the upgraded package"_ and
_"all 21 customer file(s) byte-identical"_. The broken run reports _"The manifest names 1 slot(s)
the upgraded package no longer has: toolbar."_

Run the failing form **second**. The tool prints its own justification: a pass means nothing until
you have watched it fail.

### Beat 9 — A customer's own code (6 min) — **on** `:4310`

1. `http://localhost:4310/` signed out — sidebar reads **"Acme Insurance"**, and only
   **"Diagnostics"** is in the nav. The other four entries are rule-gated **fail-closed**, so they
   are genuinely absent rather than greyed.
2. Sign in `Administrator` / `Administrator`. Nav becomes
   `Documents, Search, Diagnostics, Reports, AcmeExtensions`.
3. **"AcmeExtensions" is the customer's** — contributed by `libs/extensions/acme-extensions`,
   ordered last via `order: 500`, gated on `acme.rules.canUseAcme`.
4. Click it → `/acme-extensions`. The panel renders. **The host never imports this class:**
   the route maps only a path, and `ExtensionOutletComponent` resolves the component by **ID**
   from the registry, honouring the library's lazy import.
5. Click **"Export summary"** with devtools open — it dispatches by ID through
   `ExtensionActionRegistry` rather than calling a method, which is why a manifest can move the
   affordance without touching the panel.
6. Open `/home` — the **Diagnostics page** is the strongest single screen in this track. It lists
   live config sources, the fallback chain, and every registered extension ID, with `acme.rules.*`
   sitting alongside the platform's `app.rules.*`.

"Zero edits to our libraries" is verified: every non-relative import across all six source files
is `@angular/*` or `@nuxeo-satori/platform/extensions`. One published entry point. 291 lines.

### Beat 10 — The guardrail that makes it safe (3 min)

```bash
npm run beta:customer-guardrails
# → pass — libs/extensions/acme-extensions (owner `acme`), 6 source file(s), 2 spec file(s)
```

This is gate 17 of 17, and it ships **inside** the customer package. Then show it failing — a copy
with a deep import into internals gives:

```
- src/lib/rules.service.ts imports `@nuxeo-satori/platform/extensions/internal/rule-registry`,
  which is not a published entry point.
    A deep path into internals will break without that being a breaking change.
```

Three more real failures are available: exporting a component from the barrel, deleting
`failClosedRules`, and specs that name no registry. All exit 1.

The honest framing: `eslint.config.mjs` says in its own comment that the Nx tag constraint
**cannot** enforce entry-point discipline, because path aliases make a supported import and a raw
internal one the same graph edge. This script is what actually enforces it.

### Beat 11 — From scratch (4 min)

`apps/nuxeo-satori-template` is a complete working Nuxeo UI — browse, document detail, search,
sign-in, theming, diagnostics — in **1,401 lines of TypeScript** plus ~1,000 of template/style,
built **only** on published entry points. Zero imports from `libs/shared/`*, `libs/features/*` or
the product app. It ships no Angular Material at all. Production build: 402 kB initial.

```bash
npx nx build nuxeo-satori-template     # exit 0
```

### Beat 12 — The generators (3 min, optional)

Four Nx generators ship in the package. Verified end to end in an isolated worktree:

```bash
npx nx g ./tools/satori-generators:extension-library contoso-extensions --owner=contoso
npx nx g ./tools/satori-generators:extension-rule      is-underwriter --library=contoso-extensions
npx nx g ./tools/satori-generators:extension-action    export-policy  --library=contoso-extensions
npx nx g ./tools/satori-generators:extension-component claim-summary  --library=contoso-extensions
```

The generated library then passed `check-extension-library`, `nx test` (6 tests), `nx typecheck`
and `nx lint` from scratch. The library generator's console output tells you it is **"TWO STEPS,
not one"** and hands you the route, because a nav entry alone would fall through the wildcard.

**Be honest if asked:** the three contribution generators write registrations but **no specs**.

---

## Part 5 — Questions you will be asked

**"Can I hide actions from users I don't trust?"**
No. Manifest visibility is presentation. Nuxeo's server-side permissions are the authorisation
boundary, and they still apply. Demonstrate it — Beat 5.

**"Does my customisation survive your upgrades?"**
Yes, and by two different deliberate mechanisms. The Nuxeo document is outside the filesystem the
installer touches. The branding file is installed to a sibling directory with `overwrite="false"`
precisely because the app directory is copied with `overwrite="true"`. Then show Beat 8.

**"Can I change the logo?"**
Not today. Product name and theme colours, yes. There is no logo or favicon key. Say so plainly.

**"Is this adf-hx or your own UI?"**
Both, deliberately. Six upstream components render real adf-hx surfaces; the surrounding chrome is
ours. Use the Part 1 table.

**"Can I install it from npm today?"**
No. It is publishable and verified by dry run; the first publish is a deliberate later step, and the
final package name is part of that step. Today's name in the repo is `@nuxeo-satori/platform` — the
same form the guardrail prints in Beat 10.

**"How big is the bundle?"**
3.56 MB initial against a 4 MB build-failure budget — 0.44 MB of headroom. adf-core registers
eleven root services, so it is eager: every user pays it, including users who never open the
adf-hx route. This is a known constraint, not a surprise.

**"What about ng-mocks in the runtime bundle?"**
adf-hx's shipped bundle imports a test library containing two `eval()` calls. It is replaced with
a stub that throws if called. Expect this question from a security reviewer; the answer is that it
is neutralised, not tolerated.

**"Can I edit metadata in the adf-hx panel?"**
No. Upstream does not export the cache service its metadata sidebar needs, so the read-only
properties panel renders instead.

---

## Part 6 — Do NOT demo these

| #       | What                                                                                     | Why                                                                                                                                                                                                                                                                                                              |
| ------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F0**  | **The customer extension on** `:4200`                                                    | `nuxeo-ui` never registers `acme.`*. No manifest can add it — Layer 1 only addresses IDs that code registered. Layer 2 lives on `:4310`.                                                                                                                                                                         |
| **F1**  | **A logo change**                                                                        | `AppBrandingConfig` has only `applicationTitle` and `documentTitle`. No logo, favicon or image key exists. Not achievable at Layer 0 or 1.                                                                                                                                                                       |
| **F2**  | `applicationTitle` **in the header**                                                     | The route label wins. With the brand set, `/#/browse` still reads "Browse". It only surfaces on a route no nav entry matches. Demo `documentTitle` — the browser tab — which changes everywhere.                                                                                                                 |
| **F3**  | **Branding via the Nuxeo document**                                                      | Two separate stores. Branding is the `bootstrap.json` file.                                                                                                                                                                                                                                                      |
| **F4**  | `overrides` **with** `hiddenByDefault` **/** `sortable` **/** `field`                    | Silently dropped; `overrides` honours only `order`, `label`, `rule`, `visible`. Use `slots.documentList`. The doc example was wrong and is now fixed.                                                                                                                                                            |
| **F5**  | `labels` **to rename nav entries**                                                       | Nav labels are literal strings on descriptors. Use `overrides.<id>.label`.                                                                                                                                                                                                                                       |
| **F6**  | `toolbar`**,** `contextMenu`**,** `tabs`**,** `routes` **slots**                         | Reserved and inert. Verified in-browser with marker labels: nothing renders, and `/#/zzz-marker` creates no route.                                                                                                                                                                                               |
| **F7**  | `app.rules.canWriteSelection` **/** `canRemoveSelection`                                 | Still inert, always `false`, so they hide whatever you gate on them.                                                                                                                                                                                                                                             |
| **F8**  | `npm run beta:evidence -- showcase-adf-hx` **live**                                      | It **fails** (21/22). Three of ten screenshots are byte-identical duplicates, and steps 8-10 photograph the repository root, so panels captioned "reads real Nuxeo ACLs" show "no local permissions" and "No audit entries found." Use only `02-agentic-ui-production-browse.png` + `03-adf-hx-browse-list.png`. |
| **F9**  | `/#/search-adf-hx` **with an empty box**                                                 | Shows repository plumbing: personal workspaces, `My Favorites`, rows titled `1783067622304`. Type a term first. Use `test 01` (5 results), **not** `Domain` (104 of 137 — looks broken). It also has **no nav entry**; bookmark the URL.                                                                         |
| **F10** | `acme.panel.policySummary`**,** `acme.actions.exportClaim`**,** `acme.rules.isLegalTeam` | Registered but never placed. Nothing renders them.                                                                                                                                                                                                                                                               |
| **F11** | **A statically served production build past sign-in**                                    | Stock Docker Nuxeo sends no CORS headers, so a static bundle cannot authenticate. Use `nx serve`. The rebrand _is_ demoable statically, because brand and tab title render pre-sign-in.                                                                                                                          |
| **F12** | **Layer 1 on the template app**                                                          | `/default-domain/config/satori-template` exists but its `note:note` is **empty** — deliberately, so the "before" state is honest. `manifest.example.json` will not be visible unless someone pastes it in first. There is no one-command way.                                                                    |
| **F13** | **"The marketplace package builds"**                                                     | Unverified. Nobody ran Maven.                                                                                                                                                                                                                                                                                    |

### Cosmetic things a sharp audience will notice

- The nav entry literally reads **"Browse (adf-hx POC)"** — a customer sees "POC" in a Beta.
- The POC filter row is visibly unstyled: native `dd/mm/yyyy` date inputs, a bare `Columns`
  button. **Those are ours, not upstream's** — do not blame adf-hx.
- The POC list has no file-type icons; production browse does.
- Upstream's breadcrumb under-reports: "Home" at `/default-domain`, where production shows
  `Root › Domain`.
- `HTTP 500 /nuxeo/api/v1/automation/AI.Insights` on the dashboard — the AI marketplace package
  is not installed. Expected.
- A `403` on first load — the anonymous startup manifest fetch. Expected.
- `HTTP 404 /nuxeo/api/v1/group/Administrator` on the Permissions tab — Administrator is a user,
  not a group.

---

## Part 7 — Reset

**Between beats** — return to inert without deleting:

```bash
echo '{"version":1}' > /tmp/inert.json && ./apply-manifest.sh /tmp/inert.json
```

**Branding:**

```bash
git checkout -- nuxeo-agentic-ui-package/src/main/config/bootstrap.json
```

**Full reset to a clean, unconfigured instance:**

```bash
curl -s -u Administrator:Administrator -X DELETE \
  http://localhost:8080/nuxeo/api/v1/path/default-domain/config/agentic-ui \
  -o /dev/null -w 'HTTP %{http_code}\n'          # → 204, then GET → 404
```

The full cycle DELETE → 404 → POST → 201 was verified: no trashed leftovers, no path conflict.

**Browser state:** clear `localStorage.browse_column_settings` and
`localStorage.agentic_ui_color_theme`.

---

## Part 8 — Timing and risk

| Risk                                            | Mitigation                                                                              |
| ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| Docker/Nuxeo not running                        | Part 0.1. This was the actual state found during rehearsal.                             |
| Manifest document missing                       | Part 0.6. Also the actual state found.                                                  |
| Manifest edit appears not to work               | You did not hard-reload. Hash navigation does not re-read it.                           |
| First adf-hx load takes ~4 s                    | Warm it — Part 0.5.                                                                     |
| Clicking a checkbox too early selects nothing   | `/#/browse` needs ~2.5 s before the table is interactive.                               |
| `/#/doc/:uid` never settles                     | AI polling keeps the network busy. Do not wait for it.                                  |
| Stored column/theme prefs override the manifest | Part 0.4.                                                                               |
| Two nav entries sharing a `path`                | Drawer resolution matches by path; the first wins. Give every demo entry a unique path. |

**Suggested order if you have 30 minutes:** Beats 1, 2, 3, 5, 7, 9, 10 — the product, the
provenance, a no-rebuild rebrand, declarative nav with the honest security answer, rules, the
customer's own code, and the guardrail. Beats 4, 6, 8, 11, 12 are the depth reserve.
