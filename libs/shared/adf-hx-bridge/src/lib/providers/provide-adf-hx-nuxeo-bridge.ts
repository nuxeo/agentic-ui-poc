import { EnvironmentProviders, makeEnvironmentProviders, type Provider } from '@angular/core';
import { DOCUMENT_API_TOKEN, QUERY_API_TOKEN } from '../tokens/adf-hx-bridge.tokens';
import { NuxeoDocumentApi } from '../api/nuxeo-document-api';
import { NuxeoQueryApi } from '../api/nuxeo-query-api';
import { AdfHxBrowseFolderService } from '../services/adf-hx-browse-folder.service';
import { AdfHxBrowseMediaService } from '../services/adf-hx-browse-media.service';
import { AdfHxDocumentService } from '../services/adf-hx-document.service';
import { AdfHxDocumentTreeDatabaseService } from '../services/adf-hx-document-tree-database.service';
import { NuxeoDocumentRouterService } from '../services/nuxeo-document-router.service';

/** Provider array for component-level registration. */
export const ADF_HX_NUXEO_BRIDGE_PROVIDERS: Provider[] = [
  { provide: DOCUMENT_API_TOKEN, useClass: NuxeoDocumentApi },
  { provide: QUERY_API_TOKEN, useClass: NuxeoQueryApi },
  NuxeoDocumentApi,
  NuxeoQueryApi,
  AdfHxDocumentService,
  AdfHxBrowseMediaService,
  AdfHxBrowseFolderService,
  AdfHxDocumentTreeDatabaseService,
  NuxeoDocumentRouterService,
];

/** Wires Nuxeo-backed HxPR API facades for adf-hx browse POC (Scope A). */
export function provideAdfHxNuxeoBridge(): EnvironmentProviders {
  return makeEnvironmentProviders(ADF_HX_NUXEO_BRIDGE_PROVIDERS);
}
