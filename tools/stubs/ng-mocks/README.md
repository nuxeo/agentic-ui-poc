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

## Removing it

When upstream stops importing a test library from shipped code:

1. Replace `"ng-mocks": "file:tools/stubs/ng-mocks"` in the root `package.json` with
   the real version, or drop the dependency entirely if the import is gone.
2. Delete this directory.
3. Run the `bundle` gate. It must still pass.

If a real test ever needs genuine `ng-mocks`, this alias will break it — the stub is
repo-wide. Nothing in the repo used `ng-mocks` when the stub was introduced.

## Reported upstream

This is an upstream packaging defect and should be fixed there. Track it alongside
the other adf-hx findings in `AGENTS/11-beta-program.md` section 3.
