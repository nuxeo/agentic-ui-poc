// Deliberately does NOT export anything that imports `@alfresco/adf-hx-*`.
//
// The app shell imports this barrel for the `hxp-*` components and the path utilities.
// A barrel is one module, so anything re-exported here that reaches adf-hx puts adf-core
// into the **initial** bundle — measured at +0.95 MB, past the 2 MB budget error. The
// API ports and `provideAdfHxNuxeoBridge` therefore live in
// `@agentic-ui/shared/adf-hx-bridge/providers`, which only the lazily-loaded POC route
// imports. See `src/providers.ts`.

export * from './lib/tokens/adf-hx-bridge.tokens';
export * from './lib/mapping/nuxeo-to-hx-document.mapper';
export * from './lib/mapping/nuxeo-to-hx-version.mapper';
export * from './lib/mapping/nuxeo-to-hx-model.mapper';
export * from './lib/api/nuxeo-document-api';
export * from './lib/api/nuxeo-query-api';
export * from './lib/services/adf-hx-document.service';
export * from './lib/services/adf-hx-browse-context.service';
export * from './lib/services/nuxeo-document-router.service';
export * from './lib/utils/adf-hx-browse-path.utils';
export * from './lib/utils/hxp-browse-cell.utils';
export * from './lib/services/adf-hx-browse-media.service';
export * from './lib/services/adf-hx-browse-folder.service';
export * from './lib/utils/adf-hx-browse-tree.utils';
export * from './lib/utils/hxp-browse-tabs.utils';
export * from './lib/utils/hxp-permission.utils';
export * from './lib/utils/hxp-relative-time.utils';
export * from './lib/ui/hxp-folder-header/hxp-folder-header.component';
export * from './lib/ui/hxp-domain-hint/hxp-domain-hint.component';
export * from './lib/ui/hxp-browse-toolbar/hxp-browse-toolbar.component';
export * from './lib/ui/hxp-browse-nav-drawer/hxp-browse-nav-drawer.component';
export * from './lib/ui/hxp-document-cards/hxp-document-cards.component';
export * from './lib/ui/hxp-column-picker/hxp-column-picker.component';
export * from './lib/ui/hxp-icon/hxp-icon.component';
export * from './lib/ui/hxp-spinner/hxp-spinner.component';
export * from './lib/ui/hxp-browse-tabs/hxp-browse-tabs.component';
export * from './lib/ui/hxp-browse-permissions/hxp-browse-permissions.component';
export * from './lib/ui/hxp-browse-history/hxp-browse-history.component';
export * from './lib/ui/hxp-browse-trash/hxp-browse-trash.component';
export * from './lib/ui/hxp-browse-details-panel/hxp-browse-details-panel.component';
