import { AsyncPipe } from '@angular/common';
import { EnvironmentProviders, makeEnvironmentProviders, type Provider } from '@angular/core';
// The **upstream** tokens, not local clones. The bridge used to declare its own
// `DOCUMENT_API_TOKEN` and `QUERY_API_TOKEN` with the same description strings; Angular
// resolves by identity, so those satisfied our own services while being invisible to
// every adf-hx component. The clones are deleted — there is one DI graph now.
import {
  GROUP_API_TOKEN,
  MODEL_API_TOKEN,
  RENDITIONS_API_TOKEN,
  UPLOAD_API_TOKEN,
  USER_API_TOKEN,
  CHECKIN_API_TOKEN,
  COPY_API_TOKEN,
  DOCUMENT_API_TOKEN,
  DOWNLOAD_API_TOKEN,
  MOVE_API_TOKEN,
  QUERY_API_TOKEN,
  VERSION_API_TOKEN,
} from '@alfresco/adf-hx-content-services/api';
import { NuxeoDocumentApi } from '../api/nuxeo-document-api';
import { NuxeoQueryApi } from '../api/nuxeo-query-api';
import { NuxeoVersionApi } from '../api/nuxeo-version-api';
import { NuxeoCopyApi, NuxeoMoveApi } from '../api/nuxeo-copy-move-api';
import { NuxeoCheckInApi } from '../api/nuxeo-checkin-api';
import { NuxeoDownloadApi } from '../api/nuxeo-download-api';
import { NuxeoGroupApi, NuxeoUserApi } from '../api/nuxeo-user-group-api';
import { NuxeoRenditionsApi } from '../api/nuxeo-renditions-api';
import { NuxeoModelApi } from '../api/nuxeo-model-api';
import { NuxeoUploadApi } from '../api/nuxeo-unmapped-api';
import { AdfHxBrowseFolderService } from '../services/adf-hx-browse-folder.service';
import { AdfHxBrowseMediaService } from '../services/adf-hx-browse-media.service';
import { AdfHxDocumentService } from '../services/adf-hx-document.service';
import { NuxeoDocumentRouterService } from '../services/nuxeo-document-router.service';
import { DocumentRouterService } from '@alfresco/adf-hx-content-services/services';

/**
 * Provider array for component-level registration.
 *
 * **All twelve** adf-hx API ports are bound here. That set was not chosen — it was
 * discovered, one `NG0201` at a time, by following what upstream actually requires.
 * `DOCUMENT`, `QUERY` and `VERSION` are `DocumentService`'s own constructor tokens; `COPY`,
 * `MOVE` and `CHECKIN` arrive three levels down through its `SingleItemCopyService`,
 * `SingleItemMoveService` and `CreateDocumentVersionService`; `DOWNLOAD` comes from the
 * context-menu handlers; `USER`, `GROUP` and `RENDITIONS` from the panels. Every link is
 * non-optional, so this is the minimum that lets any component reach `DocumentCacheService`
 * at all.
 *
 * Two of the twelve — `UPLOAD` and `MODEL` — are bound to implementations that **refuse**
 * every call, because their Nuxeo equivalent is a different protocol rather than a different
 * endpoint. See `nuxeo-unmapped-api.ts`. `MODEL` refusing is what blocks the metadata sidebar
 * and the properties viewer: `DocumentModelService` calls `getModel()` from its constructor,
 * so anything injecting it fails to construct rather than degrading.
 */
export const ADF_HX_NUXEO_BRIDGE_PROVIDERS: Provider[] = [
  { provide: DOCUMENT_API_TOKEN, useClass: NuxeoDocumentApi },
  { provide: QUERY_API_TOKEN, useClass: NuxeoQueryApi },
  { provide: VERSION_API_TOKEN, useClass: NuxeoVersionApi },
  { provide: COPY_API_TOKEN, useClass: NuxeoCopyApi },
  { provide: MOVE_API_TOKEN, useClass: NuxeoMoveApi },
  { provide: CHECKIN_API_TOKEN, useClass: NuxeoCheckInApi },
  { provide: DOWNLOAD_API_TOKEN, useClass: NuxeoDownloadApi },
  { provide: USER_API_TOKEN, useClass: NuxeoUserApi },
  { provide: GROUP_API_TOKEN, useClass: NuxeoGroupApi },
  { provide: RENDITIONS_API_TOKEN, useClass: NuxeoRenditionsApi },
  // `UPLOAD` is bound although its Nuxeo equivalent is a different protocol, not a different
  // endpoint. Eleven upstream services inject their tokens at construction, so leaving it
  // unbound stops those services — and every component touching them — constructing at all.
  // Bound, a component constructs and fails at the point of use with a message naming the
  // operation. See `nuxeo-unmapped-api.ts`.
  { provide: UPLOAD_API_TOKEN, useClass: NuxeoUploadApi },
  // `MODEL` reads for real now, over `/config/types`, `/config/facets` and `/config/schemas`.
  // Only its write half still refuses, because Nuxeo exposes no REST path for it at all.
  { provide: MODEL_API_TOKEN, useClass: NuxeoModelApi },
  NuxeoDocumentApi,
  NuxeoQueryApi,
  NuxeoVersionApi,
  NuxeoCopyApi,
  NuxeoMoveApi,
  NuxeoCheckInApi,
  NuxeoDownloadApi,
  NuxeoUserApi,
  NuxeoGroupApi,
  NuxeoRenditionsApi,
  NuxeoUploadApi,
  NuxeoModelApi,
  AdfHxDocumentService,
  AdfHxBrowseMediaService,
  AdfHxBrowseFolderService,
  NuxeoDocumentRouterService,
  // Not a Nuxeo binding — an upstream requirement with no other home.
  //
  // adf-hx's `UserResolverPipe` (`hxpUserResolverPipe`) calls `inject(AsyncPipe)` in its
  // constructor, and `AsyncPipe` carries no `providedIn`, so it has to be provided by the
  // host. Without it every component rendering a user name — the versions panel, and anything
  // else reaching that pipe — throws `NG0201: No provider found for _AsyncPipe` while
  // rendering. That failure is quiet in the worst way: the component's shell renders, its
  // *content* does not, so the panel appears with a heading and an empty body.
  AsyncPipe,
  // adf-hx's own `DocumentRouterService` builds `/{repository}/documents/{id}`, a route
  // structure this application does not have, and its breadcrumb feeds the result straight
  // into `[routerLink]`. It carries no `providedIn`, which makes it an intended substitution
  // point rather than a monkey-patch.
  { provide: DocumentRouterService, useExisting: NuxeoDocumentRouterService },
];

/** Wires Nuxeo-backed HxPR API facades for adf-hx browse POC (Scope A). */
export function provideAdfHxNuxeoBridge(): EnvironmentProviders {
  return makeEnvironmentProviders(ADF_HX_NUXEO_BRIDGE_PROVIDERS);
}
