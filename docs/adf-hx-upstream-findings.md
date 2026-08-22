# adf-hx / adf-core findings

**Audience: the adf-hx team.** This document is written to be sent as-is. Everything in it is
reproducible against published packages, with a version, a path and a reproduction.

**Versions under test**

| Package                             | Version                       |
| ----------------------------------- | ----------------------------- |
| `@alfresco/adf-hx-content-services` | `7.20.0-automate.292`         |
| `@alfresco/adf-core`                | `9.0.0`                       |
| `@alfresco/adf-extensions`          | `9.0.0`                       |
| `@hylandsoftware/hxcs-js-client`    | `2.0.111`                     |
| Host application                    | Angular `20.3.x`, Nx `22.6.3` |

**Context.** We are adopting adf-hx components over a **Nuxeo** back end by implementing the twelve
`*_API_TOKEN` ports against Nuxeo's REST API, rather than against HxPR. Eleven of the twelve are
implemented. Five components render against live data: document list, breadcrumb, document tree,
manage-versions and the properties sidebar. So these findings come from working code, not from
reading the source.

**Deliberately excluded.** Problems caused by _our_ environment are not listed here — a Node 25
`localStorage` global, a macOS lockfile pruning platform-optional entries, and Angular replacing
rather than merging an `assets` array in a build configuration. None is adf-hx's fault and including
them would weaken what follows. They are recorded internally in
`docs/adf-hx-workarounds.md` and `AGENTS/11-beta-program.md` §3.

Ordered by severity. Severity 1 is a shipped-to-customers problem.

---

## Severity 1 — ships to customers

### 1.1 `ng-mocks`, a test-mocking library, is imported from the shipped `/ui` runtime bundle

**Package:** `@alfresco/adf-hx-content-services@7.20.0-automate.292`
**File:** `ui/fesm2022/alfresco-adf-hx-content-services-ui.mjs` (and the `services` entry point)

`ng-mocks` is a **test** library. It is imported by the runtime bundle, so it is resolved, bundled
and served to end users. It contains two `eval()` calls, which is a problem in its own right for any
customer running a Content-Security-Policy without `unsafe-eval`.

**Reproduce**

```bash
npm i @alfresco/adf-hx-content-services@7.20.0-automate.292
grep -o "from 'ng-mocks'" node_modules/@alfresco/adf-hx-content-services/fesm2022/*.mjs
# then build any app that imports a component from @alfresco/adf-hx-content-services/ui
grep -c "eval(" dist/<app>/browser/*.js
```

**Measured in our build:** `ng-mocks` reached a **1.6 MB** customer-facing chunk, and `eval()`
appeared twice in the shipped output.

**Impact.** Bundle size, CSP incompatibility, and a supply-chain surface that has no business in a
production dependency tree.

**Our mitigation, which should not be necessary.** We replaced `ng-mocks` with a local `file:` stub
that satisfies the import and throws if anything actually calls it. `eval()` occurrences in the
shipped bundle went to **0**. We have documented that stub as _permanent_, because we cannot assume
this is fixed.

**Ask:** move `ng-mocks` to `devDependencies` and remove the runtime import. If a component
genuinely needs a mock at runtime, it should be behind a separate entry point that production code
does not reach.

---

## Severity 2 — dependency and contract problems that break a clean install

### 2.1 All sixteen `@alfresco/adf-core` peer dependencies are declared as unbounded `>=`

**Package:** `@alfresco/adf-core@9.0.0`
**File:** `package.json`, `peerDependencies`

Every peer is `>=x`, with no upper bound. On a clean install the resolver floats them to their
latest majors, which for us meant `@angular/material-date-fns-adapter` resolving onto the Angular 22
line against an Angular 20 application.

**Reproduce**

```bash
npm i @alfresco/adf-core@9.0.0            # fresh tree, no lockfile
npx ng build
# → Unsupported enum value
```

**Our mitigation.** Nine exact pins. Two of them deliberately differ from adf-core's own suggested
versions — `@mat-datetimepicker/core@16.0.1`, whose major track is offset from Angular's, and
`pdfjs-dist@6.2.108`, because 4.x downgrades a shared native package.

**Ask:** bound the peer ranges. `>=` with no ceiling is equivalent to declaring no constraint.

### 2.2 Fifteen packages are imported but only one is declared as a peer

**Package:** `@alfresco/adf-hx-content-services@7.20.0-automate.292`

The bundles import fifteen third-party packages. One appears in `peerDependencies`. A consumer
therefore discovers the remaining fourteen at build or runtime, one failure at a time, instead of
from the manifest.

**Reproduce:** compare the `import ... from '<bare specifier>'` set in
`fesm2022/*.mjs` against `peerDependencies` in `package.json`.

**Ask:** declare what is imported.

### 2.3 `TranslationService` does not use the `TranslateLoader` interface it is given

**Package:** `@alfresco/adf-core@9.0.0`
**Symbol:** `TranslationService`, reading `translate.currentLoader`

`TranslationService` takes ngx-translate's `currentLoader` and calls five methods on it that are
**not on the `TranslateLoader` interface**: `setDefaultLang`, `providerRegistered`,
`registerProvider`, `getFullTranslationJSON` and `init`.

A host that provides a conforming `TranslateLoader` — the documented ngx-translate contract — dies
on the first adf-hx component with:

```
TypeError: this.customLoader.setDefaultLang is not a function
```

**Reproduce:** provide any class implementing only `TranslateLoader.getTranslation()` as
`{ provide: TranslateLoader, useClass: … }`, then render any adf-hx component.

**Why this is more than an inconvenience.** There are three ways out and each costs something:
replace the host loader with adf-core's (loses any host-specific catalogue layering), extend
adf-core's (puts `@alfresco/adf-core` on an import chain from the app's root config, which moved our
**initial** bundle from 1.71 MB to 2.86 MB), or duck-type the five methods without importing
adf-core. We took the third. It is an undocumented contract, so an adf-core upgrade adding a method
breaks us with the same `TypeError` on a different name.

**Ask:** either use `TranslateLoader` as declared, or publish the extended contract as an exported
interface so it can be implemented deliberately.

### 2.4 Packages are compiled against Angular 19.2.18 and consumed by Angular 20 hosts

**Packages:** both, per the `ngDeclareComponent` metadata in the fesm bundles
(`version: "19.2.18"`).

We consume them from Angular 20.3.x. It works, but it means partial-compilation output is being
linked by a newer compiler than it was produced by, and diagnostics like `NG0912` component-ID
collisions appear in our test runs from upstream's own components.

**Reproduce:** `grep -o 'version: "19\.2\.18"' node_modules/@alfresco/adf-hx-content-services/fesm2022/*.mjs | head`

**Ask:** state the supported Angular range explicitly, and publish builds for it.

---

## Severity 3 — architecture choices that constrain every host

### 3.1 Eleven `providedIn: 'root'` services force the entire port set into the root injector

**Package:** `@alfresco/adf-hx-content-services@7.20.0-automate.292`
**Symbols:** `DocumentService`, `SearchService`, `DocumentVersionsService`, `UserService`,
`UserResolverService`, `RenditionsService`, `DocumentModelService`, `HxpNotificationService`,
`MetadataSidebarService`, `VersionContextMenuActionsService`, `DocumentPropertiesService`

Each is `providedIn: 'root'` and injects one or more `*_API_TOKEN`. Angular resolves a root-provided
service from the **root** injector, so the tokens must be provided there too — even when every
component using them is behind a lazily-loaded route.

**Consequence, measured.** Our initial bundle went **1.70 MB → 3.49 MB**. We raised the Angular
budget twice, 2.0 → 3.5 → 4.0 MB. The panels sit in a single eager 1.2 MB chunk; we verified this by
reading the built output, not by inference.

**Reproduce:** provide the API tokens at component level only, on a lazily-loaded route, and render
`HxpDocumentListComponent`:

```
NG0201: No provider found for InjectionToken DOCUMENT_API_TOKEN
```

**Ask:** drop `providedIn: 'root'` from the services that consume ports, or accept the tokens
optionally, so a host can scope adf-hx to the routes that use it. This is the single largest cost of
adoption for us and it is not recoverable at the host level.

### 3.2 `DocumentModelService` calls `getModel()` from its constructor

**Package:** `@alfresco/adf-hx-content-services@7.20.0-automate.292`
**Symbol:** `DocumentModelService`, `constructor` → `this.model$ = this.getModel()`

The constructor eagerly invokes `modelApi.getModel()`. Two consequences for a host:

1. The model is fetched on **injection**, not on use. Any component behind
   `DOCUMENT_PROPERTIES_SERVICE` triggers it whether or not it reads a property.
2. If the port rejects — which any port must be able to do — the rejected promise exists with
   nothing subscribed to it, so the browser logs an **unhandled promise rejection** before the user
   has done anything.

**Reproduce:** bind `MODEL_API_TOKEN` to an implementation whose `getModel()` rejects, inject
`DocumentModelService`, and observe the console. The service constructs successfully; the rejection
is unhandled until something subscribes.

**Ask:** make `model$` lazy (`defer`), so the fetch happens on first subscription.

### 3.3 Six services carry no `providedIn` and are not documented as requiring a provider

**Package:** `@alfresco/adf-hx-content-services@7.20.0-automate.292`
**Symbols:** `DocumentTreeDatabaseService`, `VersionContextMenuActionsService` (its five handler
tokens), `HxpMetadataCacheService`, `DocumentRouterService`, plus adf-core's `DecimalNumberPipe`,
`LocalizedDatePipe`, `FileSizePipe` and `UserResolverPipe` injected as **services**.

Each surfaces as an `NG0201` at the point of use. We found them one at a time, over several
sessions, and only afterwards discovered that `DOCUMENT_PROVIDERS` and `USER_RESOLVER_PROVIDERS`
are exported and cover some of them.

**Note a gap in that provider function.** `provideAdfEnterpriseAdfHxContentServicesServices()`
provides adf-hx's pipes but **not adf-core's**, so `PropertyUtilService` still cannot construct
after calling it:

```
NG0201: No provider found for _DecimalNumberPipe.
Path: DocumentPropertiesService -> PropertyUtilService -> _DecimalNumberPipe
```

**Reproduce:** call `provideAdfEnterpriseAdfHxContentServicesServices()` and render
`hxp-properties-sidebar`.

**Ask:** either mark them `providedIn: 'root'`, or make one exported provider array sufficient and
say so in the README. A component's required providers should be discoverable from its documentation
rather than from its stack traces.

### 3.4 `DocumentRouterService` hardcodes a route shape

**Package:** `@alfresco/adf-hx-content-services@7.20.0-automate.292`
**Symbol:** `DocumentRouterService`

It builds `/{repository}/documents/{id}` and the breadcrumb feeds the result straight into
`[routerLink]`. A host with different routes gets links to a route that does not exist.

That it carries no `providedIn` suggests substitution is intended, which is how we treat it — but
this is inference, not documentation.

**Reproduce:** render `hxp-breadcrumb` in an app without a `/{repository}/documents/:id` route and
inspect the crumb `href`s.

**Ask:** document it as the intended extension point, or take the URL builder as an injectable
function.

### 3.5 `[contextMenuActions]="false"` does not prevent the handlers from being constructed

**Package:** `@alfresco/adf-hx-content-services@7.20.0-automate.292`
**Symbol:** `HxpDocumentListComponent`, input `contextMenuActions`

Setting it `false` suppresses the menu, but the action handler services are still injected, so a
host must provide `DOWNLOAD_API_TOKEN` and the other handler dependencies for a list that shows no
context menu at all.

**Reproduce:** render `hxp-document-list` with `[contextMenuActions]="false"` and no
`DOWNLOAD_API_TOKEN`.

**Ask:** make the handler injection lazy, or optional when the input is `false`.

---

## Severity 4 — release hygiene and behaviour worth documenting

### 4.1 No stable release in twelve months

`@alfresco/adf-hx-content-services` has 648 published versions; `latest` is
`7.20.0-automate.292` — a pre-release tag. Every consumer is therefore pinned to a pre-release, and
our own rules forbid pinning a dist-tag, so we pin the exact build.

**Ask:** cut a stable release, or state the support expectation for the `automate` line.

### 4.2 Runtime assets are not copied by installing the package, and this is undocumented

Four asset trees are fetched at runtime and none arrives with the install:

| Fetched at runtime                                                  | Source in the package                                          |
| ------------------------------------------------------------------- | -------------------------------------------------------------- |
| `assets/adf-core/i18n/<lang>.json`                                  | `@alfresco/adf-core/bundles/assets/adf-core`                   |
| `assets/adf-enterprise-adf-hx-content-services-ui/i18n/<lang>.json` | `.../ui/assets/adf-enterprise-adf-hx-content-services-ui/i18n` |
| `assets/adf-enterprise-adf-hx-content-services-services/i18n/…`     | `.../services/assets/…`                                        |
| `assets/images/*.svg`, `assets/search-icons/*.svg`                  | `.../icons/assets`                                             |

Missing them, components render raw translation keys — the versions panel's heading rendered
`MANAGE_VERSIONS.DIALOG.TITLE` — and 404 their icons.

**Additionally:** components register their own catalogues through `provideTranslations` in each
component's `providers`, so registration happens at **component construction** — long after the
language has been loaded. The registration lands and the strings never arrive. We had to seed the
catalogues at bootstrap instead.

**Reproduce:** install the packages, render any adf-hx component, and watch the network tab 404
`assets/…/i18n/en.json`.

**Ask:** ship an `ng-add`/asset schematic, and register translation providers at bootstrap rather
than at component construction.

### 4.3 The breadcrumb renders ancestors only, and links only non-last crumbs

**Symbol:** `HxpBreadcrumbComponent`

It never renders the current document, and the last crumb is not a link. At the repository root, and
at a top-level folder, there is therefore exactly one crumb and **no link at all**. Two of our
evidence captures failed on this before we understood it.

Not a defect — but it is not documented, and it makes "the breadcrumb renders links" untestable
without navigating two levels deep.

**Ask:** document the behaviour.

### 4.4 `CheckInApi` also declares a copy operation

**Package:** `@hylandsoftware/hxcs-js-client@2.0.111` / the `CHECKIN_API_TOKEN` contract

The check-in API surface includes a copy method, so a host implementing `CHECKIN` has to implement
something that belongs to `COPY`. Two ports overlap for no evident reason.

**Ask:** separate them, or document why they are coupled.

### 4.5 `@alfresco/adf-extensions@9.0.0` has typecheck and peer problems

Consuming it from an Angular 20 host required working around both its declared peer range and its
emitted types. We wrap it rather than expose it, so the detail is contained on our side — but a
consumer expecting it to typecheck cleanly against Angular 20 will not find that.

**Ask:** confirm the supported Angular range and publish types that check against it.

---

## What we would most like fixed, in order

1. **`ng-mocks` out of the runtime bundle** (1.1). It is the only finding here that ships to
   customers.
2. **Bounded peer ranges** (2.1) and **declared imports** (2.2). Together they are the difference
   between a clean install working and not.
3. **Ports resolvable outside the root injector** (3.1). This is worth 1.79 MB of initial bundle to
   us and no host can fix it.
4. **A sufficient exported provider array, documented** (3.3). Cheap to do, and it removes an entire
   class of onboarding failure.
