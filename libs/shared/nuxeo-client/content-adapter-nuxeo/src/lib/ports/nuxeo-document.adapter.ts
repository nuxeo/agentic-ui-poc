import { Injectable, inject } from '@angular/core';
import {
  BrowseService,
  DocumentDetailService,
  NuxeoApiBase,
  type NuxeoDocument,
  type NuxeoDocumentList,
} from '@agentic-ui/shared/nuxeo-client';
import {
  ContentError,
  type BreadcrumbStep,
  type ContentNode,
  type ContentNodeDraft,
  type ContentNodePatch,
  type DocumentCapabilities,
  type DocumentPort,
  type NamespacedProperty,
  type PageRequest,
  type Permission,
  type RenditionRef,
  type RenditionSpec,
  type SearchResultPage,
} from '@agentic-ui/shared/content-ports';
import { HttpParams } from '@angular/common/http';
import { map, type Observable, throwError } from 'rxjs';
import { nuxeoDocumentCapabilities } from '../capabilities';
import { toContentNode, toResultPage } from '../mapping/content-node.mapper';
import { mapNuxeoError } from '../mapping/error.mapper';
import { toPermissions } from '../mapping/permission.mapper';

const ID_PATH = '/nuxeo/api/v1/id';

/** Flattens neutral namespaced properties back into Nuxeo's `schema:field` bag. */
function toNuxeoProperties(
  properties: readonly NamespacedProperty[] | undefined,
): Record<string, unknown> {
  const bag: Record<string, unknown> = {};
  for (const property of properties ?? []) {
    bag[`${property.namespace}:${property.key}`] = property.value;
  }
  return bag;
}

/**
 * The Nuxeo {@link DocumentPort}: CRUD and lifecycle over content nodes.
 *
 * Everything reachable through this class is backend-neutral. Nuxeo-specific
 * document behaviour that the port cannot express — renditions and blobs, versioning,
 * locking, publication, comments, tags, workflow — deliberately stays on
 * `DocumentDetailService` and is listed in `AGENTS/00-architecture.md`.
 */
@Injectable({ providedIn: 'root' })
export class NuxeoDocumentAdapter implements DocumentPort {
  private readonly api = inject(NuxeoApiBase);
  private readonly browse = inject(BrowseService);
  private readonly detail = inject(DocumentDetailService);

  getById(id: string): Observable<ContentNode> {
    return this.api
      .get<NuxeoDocument>(`${ID_PATH}/${encodeURIComponent(id)}`, undefined, { properties: '*' })
      .pipe(mapNuxeoError(), map(toContentNode));
  }

  getByPath(path: string): Observable<ContentNode> {
    return this.browse.getByPath(path).pipe(mapNuxeoError(), map(toContentNode));
  }

  listChildren(parentId: string, page: PageRequest): Observable<SearchResultPage<ContentNode>> {
    const params = new HttpParams()
      .set('pageSize', page.limit)
      .set('currentPageIndex', pageIndex(page));
    return this.api
      .get<NuxeoDocumentList>(`${ID_PATH}/${encodeURIComponent(parentId)}/@children`, params, {
        properties: '*',
      })
      .pipe(
        mapNuxeoError(),
        map((list) => toResultPage(list, page)),
      );
  }

  createUnderParent(parentId: string, draft: ContentNodeDraft): Observable<ContentNode> {
    return this.api
      .post<NuxeoDocument>(`${ID_PATH}/${encodeURIComponent(parentId)}`, {
        'entity-type': 'document',
        name: draft.name,
        type: draft.primaryType,
        properties: { 'dc:title': draft.name, ...toNuxeoProperties(draft.properties) },
      })
      .pipe(mapNuxeoError(), map(toContentNode));
  }

  update(id: string, patch: ContentNodePatch): Observable<ContentNode> {
    const properties = toNuxeoProperties(patch.properties);
    if (patch.name !== undefined) {
      properties['dc:title'] = patch.name;
    }
    return this.browse.updateDocument(id, properties).pipe(mapNuxeoError(), map(toContentNode));
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${ID_PATH}/${encodeURIComponent(id)}`).pipe(mapNuxeoError());
  }

  move(id: string, newParentId: string): Observable<ContentNode> {
    return this.browse
      .moveDocuments([id], newParentId)
      .pipe(mapNuxeoError(), map(firstOrThrow), map(toContentNode));
  }

  copy(id: string, newParentId: string): Observable<ContentNode> {
    return this.browse
      .copyDocuments([id], newParentId)
      .pipe(mapNuxeoError(), map(firstOrThrow), map(toContentNode));
  }

  getRoot(): Observable<ContentNode> {
    return this.browse.getRepositoryRoot().pipe(mapNuxeoError(), map(toContentNode));
  }

  /**
   * Not served through the port. Nuxeo renditions are not directly fetchable URLs —
   * they need the session's auth headers — so they cannot be expressed as a
   * `RenditionRef.url`. The reference Nuxeo adapter rejects this call for the same
   * reason. Callers use `DocumentDetailService.fetchThumbnail` / `fetchPdfRendition`,
   * which return blobs.
   */
  getWithRendition(
    _id: string,
    spec: RenditionSpec,
  ): Observable<ContentNode & { rendition: RenditionRef }> {
    return throwError(
      () =>
        new ContentError(
          'UnsupportedEnrichment',
          `nuxeo adapter does not serve renditions through the port (requested kind: ${spec.kind})`,
        ),
    );
  }

  getWithBreadcrumb(
    id: string,
  ): Observable<ContentNode & { breadcrumb: readonly BreadcrumbStep[] }> {
    return this.api
      .get<NuxeoDocument>(`${ID_PATH}/${encodeURIComponent(id)}`, undefined, {
        properties: '*',
        'enrichers-document': 'breadcrumb',
      })
      .pipe(
        mapNuxeoError(),
        map((doc) => ({ ...toContentNode(doc), breadcrumb: toBreadcrumb(doc) })),
      );
  }

  getWithPermissions(id: string): Observable<ContentNode & { permissions: readonly Permission[] }> {
    return this.detail.getDocumentPermissions(id).pipe(
      mapNuxeoError(),
      map((doc) => ({
        ...toContentNode(doc),
        permissions: toPermissions(doc.contextParameters?.acls),
      })),
    );
  }

  capabilities(): DocumentCapabilities {
    return nuxeoDocumentCapabilities;
  }
}

function pageIndex(page: PageRequest): number {
  return page.limit > 0 ? Math.floor(page.offset / page.limit) : 0;
}

function firstOrThrow(docs: readonly NuxeoDocument[]): NuxeoDocument {
  const first = docs[0];
  if (!first) {
    throw new ContentError('Terminal', 'nuxeo returned no document for the operation');
  }
  return first;
}

function toBreadcrumb(doc: NuxeoDocument): readonly BreadcrumbStep[] {
  const breadcrumb = doc.contextParameters?.['breadcrumb'] as NuxeoDocumentList | undefined;
  return (breadcrumb?.entries ?? []).map((entry) => ({
    id: entry.uid,
    name: entry.title,
    isFolderish: entry.facets?.includes('Folderish') ?? false,
  }));
}
