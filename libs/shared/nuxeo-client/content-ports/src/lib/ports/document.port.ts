import type { Observable } from 'rxjs';
import type { ContentNode, ContentNodeDraft, ContentNodePatch } from '../domain/content-node';
import type { Permission } from '../domain/permission';
import type { BreadcrumbStep, RenditionRef, RenditionSpec } from '../domain/rendition';
import type { PageRequest, SearchResultPage } from '../domain/search';
import type { DocumentCapabilities } from './capabilities';
import type { AdditiveEnrichmentKey } from './enrichments';

/**
 * CRUD, lifecycle, and named-capability enrichments over content nodes.
 * Enrichment methods (`getWith…`) have fixed shapes across adapters for caller
 * symmetry; unsupported enrichments raise a typed error, and the capability
 * descriptor lets callers pre-flight.
 */
export interface DocumentPort {
  getById(
    id: string,
    options?: { include?: readonly AdditiveEnrichmentKey[] },
  ): Observable<ContentNode>;
  getByPath(path: string): Observable<ContentNode>;
  listChildren(parentId: string, page: PageRequest): Observable<SearchResultPage<ContentNode>>;
  createUnderParent(parentId: string, draft: ContentNodeDraft): Observable<ContentNode>;
  update(id: string, patch: ContentNodePatch): Observable<ContentNode>;
  delete(id: string): Observable<void>;
  move(id: string, newParentId: string): Observable<ContentNode>;
  copy(id: string, newParentId: string): Observable<ContentNode>;
  getRoot(): Observable<ContentNode>;
  getWithRendition(
    id: string,
    spec: RenditionSpec,
  ): Observable<ContentNode & { rendition: RenditionRef }>;
  getWithBreadcrumb(
    id: string,
  ): Observable<ContentNode & { breadcrumb: readonly BreadcrumbStep[] }>;
  getWithPermissions(id: string): Observable<ContentNode & { permissions: readonly Permission[] }>;
  capabilities(): DocumentCapabilities;
}
