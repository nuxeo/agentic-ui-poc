/**
 * Stub for `ng-mocks`, installed in its place via a `file:` dependency.
 *
 * `@alfresco/adf-hx-content-services@7.20.0-automate.292` imports this test library
 * from its **shipped** `/ui` runtime bundle:
 *
 *   import { ngMocks } from 'ng-mocks';        // fesm2022/…-ui.mjs line 79
 *
 * It backs one test helper that leaked into the published package:
 *
 *   const getMockInput = () => ngMocks.find('hxp-search-filter-input').componentInstance;
 *
 * `HxpDocumentListComponent` is in the same entry point, so no adf-hx UI adoption can
 * avoid the import. With the real library installed, ng-mocks' implementation lands in
 * the production bundle — measured at a 1.6 MB chunk containing two `eval()` calls,
 * which fails CSP and every SAST review for an on-premises enterprise product.
 *
 * `getMockInput` is never reachable from any surface we render, so the binding only has
 * to exist. It throws if it is ever actually called, because silently returning
 * `undefined` from something named `find` would turn an upstream mistake into a
 * mystery at runtime.
 *
 * Remove this stub and restore the real dependency when upstream stops importing a
 * test library from shipped code. `scripts/beta-harness/no-test-libs-in-bundle.mjs`
 * fails the build if `ngMocks` or its `eval()` ever reach `dist/`, so deleting the
 * stub without fixing the cause cannot pass unnoticed.
 */

const refuse = (name) => () => {
  throw new Error(
    `ng-mocks is stubbed in this repository and ${name}() is not available. ` +
      'It exists only because @alfresco/adf-hx-content-services imports ng-mocks from its ' +
      'shipped runtime bundle. If you need the real library for a test, see tools/stubs/ng-mocks/README.md.',
  );
};

export const ngMocks = {
  find: refuse('ngMocks.find'),
  findInstance: refuse('ngMocks.findInstance'),
  get: refuse('ngMocks.get'),
  guts: refuse('ngMocks.guts'),
  reset: refuse('ngMocks.reset'),
  stub: refuse('ngMocks.stub'),
};

export const MockService = refuse('MockService');
export const MockProvider = refuse('MockProvider');
export const MockBuilder = refuse('MockBuilder');
export const MockRender = refuse('MockRender');

export default { ngMocks, MockService, MockProvider, MockBuilder, MockRender };
