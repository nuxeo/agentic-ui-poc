---
title: Deployment & Troubleshooting
parent: Engineering
order: 13
last_reviewed: 2026-08-24
repo_commit: 77265f9
audience: engineering
---

# Deployment & Troubleshooting

> **Last reviewed:** 2026-08-24 · **Repository:** `77265f9`
> Packaging detail: [`NUXEO_MARKETPLACE_GUIDE.md`](https://github.com/nuxeo/agentic-ui-poc/blob/feature/adf-hx-browse-poc/NUXEO_MARKETPLACE_GUIDE.md)

---

## 1. What ships

Three artifacts:

| Artifact                     | Built by                           | Contains                                                                                                              |
| ---------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Marketplace package**      | Maven — `nuxeo-agentic-ui-package` | The built Angular app, the OSGi bundle, and the seed config                                                           |
| **`nuxeo-agentic-core`**     | Maven                              | 189 lines of Java/OSGi: an `AgenticNotificationDocumentIdCodec`, an auth-config fragment, a login start-page fragment |
| **`@nuxeo-satori/platform`** | `nx build platform`                | The npm package customers depend on. 347 kB, 25 files, 4 entry points. **`private: true` — not yet published**        |

`pom.xml` is a Maven parent over three modules: `apps/nuxeo-ui`, `nuxeo-agentic-core`,
`nuxeo-agentic-ui-package`.

```bash
npx nx build nuxeo-ui --configuration=production
mvn package                       # produces the marketplace ZIP
npx nx build platform             # produces dist/libs/platform
```

CI: `build-marketplace.yml` (3 jobs) on push and PR; `release.yml` on manual dispatch.

---

## 2. `install.xml` — the most consequential 20 lines in the repository

```xml
<install>
  <update file="${package.root}/install/bundles" todir="${env.bundles}" />
  <copy dir="${package.root}/web" todir="${env.server.home}/nxserver" overwrite="true" />
  <copy dir="${package.root}/config"
        todir="${env.server.home}/nxserver/nuxeo.war/agentic-ui-config"
        overwrite="false" />
</install>
```

Three steps, and the third is the whole Layer 0 upgrade-safety guarantee.

### Why the destination is what it is

The `nuxeo` context declares `docBase="../nxserver/nuxeo.war"`, so a request for
`/nuxeo/agentic-ui-config/bootstrap.json` resolves to
`nxserver/nuxeo.war/agentic-ui-config/bootstrap.json`.

**`nxserver/web` holds only `root.war` and is not a docBase — anything placed there is never
served.** An earlier version of this shipped `nxserver/web/…` and **would have 404'd on every
install**. It was recorded complete before that was caught, which is why `beta:state` now exists.

### Why `overwrite="false"`

The second copy step stages `${package.root}/web` (containing only `nuxeo.war/agentic-ui/**`) with
`overwrite="true"` — so **configuration inside that tree would be destroyed on every upgrade**.
`nuxeo.war/agentic-ui-config` is a _sibling_ of that tree and absent from the copy's source, and
`overwrite="false"` leaves an existing deployed file untouched.

Net effect: **defaults are seeded on first install, and customer edits survive every upgrade after
it.** That is the mechanism behind the product's central promise.

> **Changing `install.xml` or marketplace packaging is a hard stop** in the phase skill — escalate
> rather than attempt it. The reasoning above is why.

---

## 3. Local development stack

| Component          | How                                                                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Nuxeo + OpenSearch | Docker, container `nuxeo`, port 8080. See [`docs/opensearch-setup.md`](https://github.com/nuxeo/agentic-ui-poc/blob/feature/adf-hx-browse-poc/docs/opensearch-setup.md)                                                        |
| Server-side config | [`nuxeo-conf/`](https://github.com/nuxeo/agentic-ui-poc/blob/feature/adf-hx-browse-poc/nuxeo-conf) — read its README                                                                                                           |
| The app            | `npx nx serve nuxeo-ui` → `:4200`, proxying `/nuxeo` → `:8080`                                                                                                                                                                 |
| ARender            | `docker compose -f arender-docker-compose.yml up -d`. nginx auth proxy + UI + document-service-broker. [`docs/arender-setup.md`](https://github.com/nuxeo/agentic-ui-poc/blob/feature/adf-hx-browse-poc/docs/arender-setup.md) |
| Mailpit            | `docker compose -f mailpit-docker-compose.yml up -d` — local SMTP for permission notifications                                                                                                                                 |

Verify with `npm run beta:backend`.

---

## 4. Configuration reference

| Setting                     | Lives in                                                              | Changed by                           |
| --------------------------- | --------------------------------------------------------------------- | ------------------------------------ |
| Nuxeo API origin            | `bootstrap.json` → `nuxeoApiOrigin`                                   | Customer, no rebuild                 |
| Layer 1 manifest location   | `bootstrap.json` → `manifestDocumentPath`, `manifestDocumentProperty` | Customer                             |
| Branding, themes, languages | `bootstrap.json`                                                      | Customer                             |
| Feature toggles             | The manifest document → `featureToggles`                              | Customer                             |
| AI backend URL              | `AI_BACKEND_URL` token                                                | Deployment                           |
| Bundle budgets              | `angular.json`                                                        | Engineering                          |
| Total payload ceiling       | `ci.yml` → `NUXEO_UI_BUNDLE_SIZE_LIMIT_BYTES` = **6 MiB**             | Engineering, with recorded reasoning |

---

## 5. Troubleshooting

### Build and install

| Symptom                                                     | Cause                                                                          | Fix                                                                      |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `E404` on `@alfresco/*`                                     | Token missing or lacks `read:packages` on the **Alfresco** org                 | It needs both orgs, not just Hyland                                      |
| `npm ci` fails on CI, green locally                         | A bare `npm install` on macOS pruned Linux-only optional entries               | Restore a known-good lock, merge only new entries, run the lockfile gate |
| CI fetches from the wrong registry after an `.npmrc` change | `npm ci` installs from each entry's `resolved` URL and **ignores** the mapping | Regenerate the lock                                                      |
| `bootstrap.json` 404s after install                         | Wrong destination — not a Tomcat docBase                                       | It must be under `nxserver/nuxeo.war/`. See §2                           |
| Customer config lost on upgrade                             | Config inside the `overwrite="true"` tree                                      | It must be a sibling, with `overwrite="false"`                           |
| Marketplace build fails                                     | Java/Maven version                                                             | Java 17+, Maven 3.9+                                                     |

### Runtime

| Symptom                                         | Cause                                                                                                         | Fix                                                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `NG0201: No provider for …`                     | An upstream `providedIn: 'root'` service resolving a port from the root injector                              | Provide the port in the **root** injector. See the comment at `app.config.ts:37`                     |
| Raw i18n keys — `MANAGE_VERSIONS.DIALOG.TITLE`  | A seeded catalogue folder whose file is not shipped. The loader catches the 404 and returns `{}` **silently** | `npm run beta:bundle` — asserts required assets present **and non-empty**                            |
| Empty lists; intermittent 403 on `/nuxeo/api`   | XHRs unauthenticated                                                                                          | Session satisfies the _guard_; `httpCredentials` authenticates _requests_. Both needed               |
| HTTP 500 from `AI.*`                            | The AI backend is a **separate package not in this repo**                                                     | Expected. Install it, or accept the 500                                                              |
| Broken image, or an internal API URL in the DOM | `<img [src]>` bound to a Nuxeo URL — bypasses the interceptor entirely                                        | Fetch the blob via a service, use a blob URL, revoke on destroy                                      |
| Memory growth over a session                    | An un-revoked blob URL                                                                                        | Track the raw URL at creation — a `SafeUrl` cannot be read back — and revoke on destroy and on reset |
| A nav entry lands on the wrong page             | A registered path with **no route** — it falls through the wildcard                                           | The host must map the path; `ExtensionOutletComponent` resolves the component by ID                  |
| A manifest entry silently does nothing          | The slot is **reserved** (`routes`, `toolbar`, `contextMenu`, `tabs`) or was renamed                          | Check the slot list. `beta:upgrade` catches the rename class                                         |
| Preview fails for rich formats                  | ARender not running                                                                                           | Start the compose stack                                                                              |
| Permission emails not arriving                  | No SMTP locally                                                                                               | Start Mailpit                                                                                        |
| A rule permits when it should deny              | Unregistered rule IDs **fail open** by design                                                                 | Add it to `failClosedRules` if it gates a surface                                                    |

### Diagnosis limits, stated honestly

There is **no APM, structured logging, metrics export or error reporting**. In a customer
environment you have: the browser console, Nuxeo's server logs, and whatever the user tells you.
That is the largest operational gap in the product — see
[Scalability & Operations](../10-leadership/06-scalability-and-operations.md).

---

## 6. Publishing the platform package

Deliberately deferred. `private: true` is the last thing standing between a mistyped
`npm publish` and a public release of an unfinished package.

- Scope and registry are **decided**: `@nuxeo/satori-platform` on
  `https://packages.nuxeo.com/repository/npm-public/` — the registry `nuxeo-elements` already
  publishes to.
- Runbook: [`docs/publishing-to-nuxeo-registry.md`](https://github.com/nuxeo/agentic-ui-poc/blob/feature/adf-hx-browse-poc/docs/publishing-to-nuxeo-registry.md)
- Readiness and what is deliberately not done: [`docs/publish-readiness.md`](https://github.com/nuxeo/agentic-ui-poc/blob/feature/adf-hx-browse-poc/docs/publish-readiness.md)

Before publishing, `npm run beta:publishable` must pass. It runs a real `npm publish --dry-run`,
which is **the only check that executes `prepublishOnly`** — and for the whole of Phase 4 the
package could not be published at all because it was compiled in full compilation mode, while six
other gates were green.

---

## 7. Rollback

**Not verified in repository.** Marketplace package rollback is presumably Nuxeo's standard
mechanism, but nothing here tests it and no runbook exists. The _upgrade_ path is tested on every
build by `beta:upgrade`; the rollback path is not.

Worth establishing before a customer goes live, alongside the observability gap.
