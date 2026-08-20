export * from './lib/ui/ui';
export { SelectionTopbarComponent } from './lib/selection-topbar/selection-topbar.component';
export {
  DocumentCompareDialogComponent,
  type DocumentCompareDialogData,
} from './lib/document-compare-dialog/document-compare-dialog.component';
export { openDocumentCompareDialog } from './lib/document-compare-dialog/open-document-compare-dialog';
export {
  DOCUMENT_CARD_FIELDS,
  type DocumentCardField,
} from './lib/document-metadata-card/document-card-fields';
export {
  DocumentMetadataCardComponent,
  type DocumentCardEntry,
} from './lib/document-metadata-card/document-metadata-card.component';
// `documentCardWidget` is deliberately absent: it is published from
// `@agentic-ui/shared/ui/agent-widgets`, so registering it costs a few hundred
// bytes rather than this whole barrel. See that file.
export {
  DocumentMetadataFormComponent,
  type MetadataFormRow,
} from './lib/document-metadata-form/document-metadata-form.component';
// `documentMetadataForm` is absent for the same reason `documentCardWidget` is,
// and is published from `@agentic-ui/shared/ui/agent-forms`.
export { WidgetContainerComponent } from './lib/widget-container/widget-container.component';
export { WidgetGridComponent } from './lib/widget-grid/widget-grid.component';
export { PageTileHostComponent } from './lib/page-tile-host/page-tile-host.component';
export {
  ShareDialogComponent,
  type ShareDialogData,
} from './lib/share-dialog/share-dialog.component';
export {
  DocumentViewerComponent,
  type VideoSource,
  type StoryboardItem,
  type PictureInfo,
  type PictureView,
  type ExifData,
  type IptcData,
  type VideoInfo,
} from './lib/document-viewer/document-viewer.component';
export {
  ExportDialogComponent,
  type ExportDialogData,
  type ExportType,
} from './lib/export-dialog/export-dialog.component';
export {
  SavedSearchDialogComponent,
  SAVED_SEARCH_DIALOG_OPTIONS,
  type SavedSearchDialogData,
} from './lib/saved-search-dialog/saved-search-dialog.component';
export {
  ShareSavedSearchDialogComponent,
  type ShareSavedSearchDialogData,
  type PermissionEntry,
} from './lib/share-saved-search-dialog/share-saved-search-dialog.component';
export {
  ShareSavedPageDialogComponent,
  type ShareSavedPageDialogData,
} from './lib/share-saved-page-dialog/share-saved-page-dialog.component';
export {
  ConfirmDialogComponent,
  type ConfirmDialogData,
} from './lib/confirm-dialog/confirm-dialog.component';
// ACL dialogs. They started out in feature-collections and were imported from there by
// feature-browse and feature-document-detail; three features sharing a dialog is what
// libs/shared/ui is for, and the cross-feature import is now a lint error.
export {
  AddPermissionDialogComponent,
  type AddPermissionDialogData,
} from './lib/add-permission-dialog/add-permission-dialog';
export {
  UpdatePermissionDialogComponent,
  type UpdatePermissionDialogData,
} from './lib/update-permission-dialog/update-permission-dialog';
export {
  DeletePermissionDialogComponent,
  type DeletePermissionDialogData,
} from './lib/delete-permission-dialog/delete-permission-dialog';
export {
  ShareExternalDialogComponent,
  type ShareExternalDialogData,
} from './lib/share-external-dialog/share-external-dialog';
export {
  trashDocumentConfirmData,
  trashSelectedDocumentsConfirmData,
} from './lib/confirm-dialog/trash-confirm.utils';
