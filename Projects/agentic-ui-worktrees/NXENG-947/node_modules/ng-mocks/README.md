# `ng-mocks` stub

This directory is installed **as** `ng-mocks`, through a `file:` dependency in the
root `package.json`. It is not a mock of our own code; it replaces a third-party
test library.

## Why

`@alfresco/adf-hx-content-services@7.20.0-automate.292` imports a test library from
its **shipped** runtime bundle. In `fesm2022/alfresco-adf-hx-content-services-ui.mjs`,
line 79:

```js
import { ngMocks } from 'ng-mocks';
```

It exists to back one helper that leaked out of the package's tests:

```js
const getMockInput = () => ngMocks.find('hxp-search-filter-input').componentInstance;
```

The import is static and at module scope, so any bundler resolving the `/ui` entry
point must resolve `ng-mocks`. `HxpDocumentListComponent` — the first component
Phase 3 adopts — is in that same entry point, so **no adf-hx UI adoption can avoid
it.** `ng-mocks` appears in neither `dependencies` nor `peerDependencies`, so npm
gives no warning.

## What it costs with the real library installed

Measured on this branch, against a `nuxeo-ui` production build:

- ng-mocks' implementation lands in a **1.6 MB** chunk shipped to customers
- that chunk contains **two `eval()` calls**, from ng-mocks' `extendClassicClass`

For an on-premises enterprise product that is a security-review failure rather than
a size annoyance: `eval()` breaks any restrictive CSP and is flagged by SAST.

## What the stub does

`getMockInput` is not reachable from any surface we render, so the import binding
only has to exist. Every stubbed function **throws** if it is ever actually called —
returning `undefined` from something named `find` would convert an upstream mistake
into a mystery at runtime.

## Guard

`scripts/beta-harness/no-test-libs-in-bundle.mjs` runs in the `bundle` gate and fails
if `ngMocks` or an `eval(` from it reaches `dist/`. Deleting this stub without fixing
the underlying cause therefore cannot pass unnoticed.

## This is permanent, not a stopgap

Upstream is **not** going to change this. That was decided rather than assumed, so treat
the stub as an owned, indefinite part of the build rather than something waiting on a
fix. Two consequences:

- It must survive every adf-hx version bump. `npm ci` restores it from the lockfile, and
  the `bundle` gate fails if the real library reappears — but a new adf-hx release could
  import a _different_ test helper, in which case the gate goes red on a new fingerprint
  and this stub needs a matching export rather than replacing.
- The five throwing functions below are the whole contract. Add to them only when a real
  build failure names a missing export; guessing at upstream's future usage would make
  this file a second implementation of `ng-mocks` rather than a stub.

## Removing it

Only relevant if upstream ever does change, which is not expected. If it does:

1. Replace `"ng-mocks": "file:tools/stubs/ng-mocks"` in the root `package.json` with
   the real version, or drop the dependency entirely if the import is gone.
2. Delete this directory.
3. Run the `bundle` gate. It must still pass.

If a real test ever needs genuine `ng-mocks`, this alias will break it — the stub is
repo-wide. Nothing in the repo used `ng-mocks` when the stub was introduced.

## Upstream

It is an upstream packaging defect, and upstream will not be fixing it. This stub is
therefore the resolution, not a workaround pending one. Recorded alongside the other
adf-hx findings in `AGENTS/11-beta-program.md` section 3.
