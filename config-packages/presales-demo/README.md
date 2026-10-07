# Nuxeo Satori presales demo — Nuxeo Satori configuration

The package presales installs on a demo server. On its own it changes nothing visible: Satori keeps
its own branding until a demo URL picks one of two presets — `insurance` (Acme Insurance) or
`logistics` (Globex Logistics) — each with its own title, logo and a relabelled Collections entry.
Generated with `nx g @nuxeo-satori/platform:config-package presales-demo --owner=hyland --presales`
and then edited; install it **only on a demo server**.

A Nuxeo Marketplace package that configures Nuxeo Satori. It contributes two fragments to the
`org.nuxeo.agentic.ui.config` extension point, and the server serves them after Satori's own
defaults at `/nuxeo/agentic-ui-config/bootstrap.json` and `manifest.json`.

Nothing is edited on the server and nothing is stored in the repository: a change reaches a server
only as a new version of this package, built from reviewed source.

| File                                       | What it is                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------ |
| `bundle/agentic-ui-config/bootstrap.json`  | Layer 0 — branding, logo, themes, languages, endpoints, sign-in, presets |
| `bundle/agentic-ui-config/manifest.json`   | Layer 1 — hide, reorder, relabel and gate what the application shows     |
| `bundle/agentic-ui-config/assets/`         | Images a fragment names, such as a logo                                  |
| `bundle/OSGI-INF/presales-demo-config.xml` | The Nuxeo component that contributes the fragments                       |
| `package/package.xml`                      | Package name, version, and the dependency on `nuxeo-agentic-ui`          |
| `schema/`                                  | JSON schemas your editor uses to check the fragments as you type         |

The keys each fragment accepts are documented in `@nuxeo-satori/platform`'s
`extension-reference.md`.

## Change, build, install

```bash
# 1. edit the fragments, and raise the version in package/package.xml
npx nx build presales-demo            # checks the fragments, writes the zip
nuxeoctl mp-install dist/config-packages/presales-demo/presales-demo-<version>.zip   # then restart Nuxeo
```

`nx build` runs `build.mjs`, which refuses — with the file and the reason — a fragment the server
would reject: JSON that does not parse, is not an object, repeats a key, or exceeds 1 MiB. It also
refuses a component that names a missing file, or that does not `<require>` Satori's defaults.

**Raise the version for every change you install.** Nuxeo installs a higher version as an upgrade;
the same version is the package it already has.

The server reads the fragments once, at startup. A change applies after the restart that installing
the package requires, and a browser picks it up on its next load.

## Three things to know

- **Everything in a fragment is public.** The application reads its configuration before anyone
  signs in, so both endpoints are served without authentication. Put no secret, token or internal
  host name in a fragment.
- **Hiding something is not a security control.** A manifest can hide an action; Nuxeo's
  permissions still decide whether a user may perform it.
- **Install it on a Nuxeo Satori that has the configuration service.** `package.xml` depends on
  `nuxeo-agentic-ui` without a minimum version, because no published version yet separates a
  build with the service from one without it. On an older build Nuxeo refuses to start, because
  `org.nuxeo.agentic.ui.config.defaults` does not exist there; remove this package to recover.

## Order, when there is more than one package

Fragments apply in the order Nuxeo registers their components, and a later key wins. This package
is ordered after Satori by two declarations: the dependency in `package.xml` (installation order)
and the `<require>` in the component XML (contribution order). To layer a second package on
this one — a regional variant, say — give it the same two declarations naming **this** package and
component.

A later fragment with the same `name` and layer replaces an earlier one in place;
`<fragment name="…" layer="…" enabled="false" />` removes one.

## Presets

`presales.presetSwitching: true` lets a demo URL choose a preset for that browser only:

```
https://<server>/nuxeo/agentic-ui/?preset=insurance    # Acme Insurance
https://<server>/nuxeo/agentic-ui/?preset=logistics    # Globex Logistics
https://<server>/nuxeo/agentic-ui/?preset=             # clear it
```

A badge in the header shows the preset in force. Nothing changes on the server or for anyone else.
A preset name is up to 64 letters, digits, `.`, `_` and `-`, starting with a letter or a digit.
Turn switching off — or do not install this package — anywhere that is not a demo.

## Remove

```bash
nuxeoctl mp-remove presales-demo      # then restart; Satori's defaults apply again
```
