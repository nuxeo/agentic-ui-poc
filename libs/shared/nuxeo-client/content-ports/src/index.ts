/**
 * Backend-neutral content ports.
 *
 * PROVENANCE — this contract is a *copy of a shape*, pinned to a commit. It is not a
 * dependency and must not become one.
 *
 *   repo:   Alfresco/hxp-frontend-apps (private)
 *   branch: feature/CSX-447-content-abstraction-layer
 *   commit: 61eb45bf0e94df3fd3a62e8efd21af8ec535451e  (2026-07-13)
 *   paths:  libs/content-abstraction/{domain,ports}/external/src
 *   PR:     #18189
 *
 * Why pinned rather than depended upon: at the pinned commit that branch is
 * conflicting and several hundred commits behind `develop`, so it is not
 * installable and may never merge in this shape. No artifact authoritatively
 * states the contract — the Confluence RFC lists eight ports and is moving ahead
 * of the code, the in-repo RFC lists five, and the code has five. The code at a
 * recorded SHA is therefore the only reproducible reference.
 *
 * Divergences from the pinned source are deliberate and are marked `DIVERGENCE`
 * at their definition. Everything else is shape-for-shape identical so that a
 * future swap is an adapter change.
 */

export type {
  ContentNode,
  ContentNodeDraft,
  ContentNodePatch,
  ContentNodeRef,
  ContentType,
  NamespacedProperty,
} from './lib/domain/content-node';
export type { NamespaceRef, PrincipalRef } from './lib/domain/refs';
export {
  ContentError,
  TransientError,
  isContentError,
  type ContentErrorKind,
} from './lib/domain/errors';
export type { NewPermission, Permission, PermissionName } from './lib/domain/permission';
export type { BreadcrumbStep, RenditionRef, RenditionSpec } from './lib/domain/rendition';
export type { PageRequest, SearchResultPage, SortDirection, SortSpec } from './lib/domain/search';
export type { UploadHandle, UploadOptions, UploadPhase, UploadProgress } from './lib/domain/upload';

export type { AuthPort } from './lib/ports/auth.port';
export type { DocumentPort } from './lib/ports/document.port';
export type { PermissionsPort } from './lib/ports/permissions.port';
export type { SearchPort } from './lib/ports/search.port';
export type { UploadPort } from './lib/ports/upload.port';

export type {
  DocumentCapabilities,
  NamespaceDescriptor,
  NamespaceSchema,
  PermissionsCapabilities,
  RenditionKind,
  SearchCapabilities,
  UploadCapabilities,
} from './lib/ports/capabilities';
export type { AdditiveEnrichmentKey } from './lib/ports/enrichments';
export type { FieldRef, FilterKind, FilterSpec, ScalarValue } from './lib/ports/filter-spec';
export {
  allContentOfFolder,
  childrenOfFolder,
  collectionMembers,
  namedQuery,
  trashedChildrenOfFolder,
  versionsOfDocument,
  type NamedQueryKey,
} from './lib/ports/named-queries';
export { DC, FILE, SYS, SYSFILE, SYSGOV, SYSRENDITION, SYSVER } from './lib/ports/namespaces';
export {
  AUTH_PORT,
  DOCUMENT_PORT,
  PERMISSIONS_PORT,
  SEARCH_PORT,
  UPLOAD_PORT,
} from './lib/ports/tokens';
