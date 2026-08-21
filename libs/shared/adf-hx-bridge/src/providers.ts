/**
 * Secondary entry point: everything in this bridge that touches `@alfresco/adf-hx-*`.
 *
 * Reachable as `@agentic-ui/shared/adf-hx-bridge/providers`, mapped in
 * `tsconfig.base.json`. The pattern matches `@agentic-ui/feature-assets/assets-drawer`
 * and `@agentic-ui/feature-search/search-filters-drawer`, which exist for the same
 * reason.
 *
 * ## Why this file exists
 *
 * `apps/nuxeo-ui/src/app/shell/app-shell.component.ts` and
 * `nav-drawer/nav-drawer.component.ts` import the bridge's main barrel for its
 * `hxp-*` components and path utilities. A barrel is a single module: the moment
 * anything it re-exports imports `@alfresco/adf-hx-content-services`, adf-hx and
 * adf-core become reachable from the shell and land in the **initial** bundle.
 *
 * Measured on this branch, `nuxeo-ui` production initial bundle:
 *
 * | State                                              | Initial   |
 * | -------------------------------------------------- | --------- |
 * | baseline, no adf-hx anywhere                       | 1.70 MB   |
 * | API ports rebound through the main barrel          | 2.65 MB   |
 * | ports plus the document-list swap, via the barrel  | 2.86 MB   |
 * | `maximumError` in `angular.json`                   | 2.00 MB   |
 *
 * Dropping the ports from the barrel's *exports* changed nothing, because the providers
 * file still imported them and the providers file was itself exported. Splitting the
 * entry point is the fix: the shell keeps importing the main barrel, which no longer
 * reaches adf-hx, and the lazily-loaded POC route imports this one.
 *
 * **Nothing eagerly loaded may import from here.** If the initial bundle jumps by ~1 MB
 * after a change, something on the critical path has started to.
 */

export * from './lib/api/nuxeo-version-api';
export * from './lib/api/nuxeo-copy-move-api';
export * from './lib/api/nuxeo-checkin-api';
export * from './lib/api/nuxeo-download-api';
export * from './lib/providers/provide-adf-hx-nuxeo-bridge';
