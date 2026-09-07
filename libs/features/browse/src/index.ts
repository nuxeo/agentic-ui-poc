export * from './lib/lib.routes';

export * from './lib/browse/browse';
// `BrowseAdfHxPocComponent` is NOT exported here. It imports `@alfresco/adf-hx-content-services`,
// and a barrel is one module — exporting it made adf-hx reachable from every consumer of this
// feature, production browse included. It lives in `@agentic-ui/feature-browse/adf-hx-poc`.
export {
  CreateImportDialogComponent,
  type CreateImportDialogData,
  type CreateImportDialogResult,
} from './lib/create-import/create-import-dialog.component';
