import { DecimalNumberPipe, FileSizePipe, LocalizedDatePipe } from '@alfresco/adf-core';
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
import { NuxeoPrincipalResolver } from '../services/nuxeo-principal-resolver.service';
import { NuxeoAclService } from '../services/nuxeo-acl.service';
import {
  DocumentRouterService,
  DOCUMENT_PROVIDERS,
  USER_RESOLVER_PROVIDERS,
} from '@alfresco/adf-hx-content-services/services';
import { provideDummyFeatureFlags } from '@alfresco/adf-core/feature-flags';

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
  // Principal resolution and ACL mapping. Both are ours rather than upstream bindings, and both are
  // async by necessity: Nuxeo's ACE does not say whether a principal is a user or a group.
  NuxeoPrincipalResolver,
  NuxeoAclService,
  // WORKAROUND(adf-hx): W7 — pipes provided as services, because none carries `providedIn`.
  //
  // adf-core's pipes, which upstream's arrays do **not** cover.
  //
  // adf-core declares these as pipes, so none carries `providedIn`, and `PropertyUtilService`
  // takes all three as constructor *services* to format property values. Missing, the properties
  // sidebar dies with `NG0201: No provider found for _DecimalNumberPipe`, path
  // `DocumentPropertiesService -> PropertyUtilService -> _DecimalNumberPipe`.
  //
  // Worth stating as a rule: **a pipe injected as a service always needs providing.** And note
  // the gap this closes — `provideAdfEnterpriseAdfHxContentServicesServices()` alone is not
  // enough to construct `PropertyUtilService`, because it provides adf-hx's pipes and not
  // adf-core's.
  DecimalNumberPipe,
  LocalizedDatePipe,
  FileSizePipe,
  // WORKAROUND(adf-hx): W8 — upstream's router service hardcodes a route shape this app lacks.
  //
  // adf-hx's own `DocumentRouterService` builds `/{repository}/documents/{id}`, a route
  // structure this application does not have, and its breadcrumb feeds the result straight
  // into `[routerLink]`. It carries no `providedIn`, which makes it an intended substitution
  // point rather than a monkey-patch.
  { provide: DocumentRouterService, useExisting: NuxeoDocumentRouterService },
  // Upstream's **own** provider arrays, rather than the equivalents assembled by hand.
  //
  // `DOCUMENT_PROVIDERS` binds `DOCUMENT_SERVICE` and `DOCUMENT_PROPERTIES_SERVICE` — two
  // abstract tokens — to upstream's own root implementations. `USER_RESOLVER_PROVIDERS` is
  // `[UserResolverPipe, AsyncPipe]`.
  //
  // Both were rediscovered the hard way. `AsyncPipe`, then `UserResolverPipe`, then
  // `DOCUMENT_PROPERTIES_SERVICE`, then `DOCUMENT_SERVICE` were each added in response to a
  // separate `NG0201`, and only then did the exported arrays turn up in
  // `provideAdfEnterpriseAdfHxContentServicesServices()`. Referencing them instead of listing
  // their contents means an addition upstream arrives with the package rather than as another
  // `NG0201`. **Look for an exported provider array before chasing injector errors one at a
  // time.**
  ...DOCUMENT_PROVIDERS,
  ...USER_RESOLVER_PROVIDERS,
  // `HxpPropertiesSidebarComponent` injects adf-core's `FeaturesServiceToken` to choose between
  // two implementations: flag on renders `hxp-metadata-sidebar`, off renders
  // `hxp-properties-sidebar-legacy`. Unprovided it is `NG0201`.
  //
  // The dummy service answers every flag `false`, so the **legacy** panel renders — and that is
  // a decision, not a default we fell into. The legacy panel is display-oriented and splits its
  // properties exactly the way this bridge needs: `TOP_DEFAULT_PROPERTIES` (all `sys_*`) in its
  // default section, and everything **not** `sys_`/`sysfile_blob`/`sysver_`/`sysgov_` in its
  // other section — which is precisely where Nuxeo's `dc_*`, `file_*` and `uid_*` properties
  // land. The `sys_*` and Nuxeo surfaces therefore appear once each rather than twice.
  //
  // DEGRADED(adf-hx): D5 — the editable metadata sidebar cannot be adopted at all.
  //
  // Turning the flag **on** needs one more provider that is deliberately absent here:
  // `HxpMetadataSidebarComponent` requires `HxpMetadataCacheService`, which carries no
  // `providedIn` **and is not exported from adf-hx's `/ui` barrel** — neither it nor the metadata
  // sidebar itself is. With the flag off that component is never instantiated, so the provider
  // is never needed; with it on, satisfying the injector would take a deep import into
  // `ui/lib/components/metadata-sidebar/`, which is not a public path. That is the real cost of
  // switching, and it is upstream's to fix by exporting them.
  ...provideDummyFeatureFlags(),
];

/** Wires Nuxeo-backed HxPR API facades for adf-hx browse POC (Scope A). */
export function provideAdfHxNuxeoBridge(): EnvironmentProviders {
  return makeEnvironmentProviders(ADF_HX_NUXEO_BRIDGE_PROVIDERS);
}
