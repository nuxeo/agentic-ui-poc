import { Injectable, inject } from '@angular/core';
import type { Document, DocumentApi, NamedQuery, QueryApi } from '@hylandsoftware/hxcs-js-client';
import { BehaviorSubject, from, Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  DEFAULT_REPOSITORY_ID,
  isHxRootDocument,
  ROOT_DOCUMENT,
} from '../tokens/adf-hx-bridge.tokens';
import { DOCUMENT_API_TOKEN, QUERY_API_TOKEN } from '@alfresco/adf-hx-content-services/api';

export interface DocumentFetchOptions {
  limit?: number;
  offset?: number;
  sort?: string[];
}

export interface DocumentFetchResults {
  documents: Document[];
  limit: number;
  offset: number;
  /**
   * Nuxeo's count, **negative when it declined to count** (`-2` from the `@children` page
   * provider). Not a total in every case — use `hasNextPage` to drive a pager.
   */
  totalCount: number;
  /** Whether the server has another page. */
  hasNextPage?: boolean;
}

export interface DocumentUpdateInfo {
  document?: Document;
  updatedProperties: Map<string, unknown>;
}

@Injectable()
export class AdfHxDocumentService {
  private readonly documentApi = inject<DocumentApi>(DOCUMENT_API_TOKEN);
  private readonly queryApi = inject<QueryApi>(QUERY_API_TOKEN);

  readonly documentLoaded$ = new BehaviorSubject<Document | undefined>(undefined);
  readonly documentCreated$ = new Subject<Document>();
  readonly documentDeleted$ = new Subject<string>();
  readonly documentCopied$ = new Subject<Document | undefined>();
  readonly documentMoved$ = new Subject<Document | undefined>();
  readonly clearDocumentSelection$ = new Subject<void>();
  readonly documentRequestReload$ = new Subject<void>();
  readonly documentUpdated$ = new BehaviorSubject<DocumentUpdateInfo>({
    updatedProperties: new Map(),
  });
  readonly documentRestored$ = new Subject<Document>();

  private repositoryId = DEFAULT_REPOSITORY_ID;
  /**
   * The default order for a children fetch.
   *
   * It used to be `['sys_isFolderish desc', 'sys_title asc']` — folders first, then by title. The
   * folderish key is **gone**, because Nuxeo has no sortable folderish property and so cannot
   * express it: `NuxeoQueryApi` now refuses a key it cannot map rather than forwarding one that
   * Nuxeo answers with HTTP 200 and zero entries.
   *
   * Nothing regressed by removing it. The sort was being **discarded entirely** by the `QUERY`
   * port, so folders-first was never actually applied to any listing — `sys_title asc` is the
   * first ordering this bridge has ever really had.
   */
  private readonly defaultSort = ['sys_title asc'];

  setCurrentRepository(repositoryId: string): void {
    this.repositoryId = repositoryId;
  }

  getDocumentById(
    documentId: string,
    repositoryId: string = this.repositoryId,
  ): Observable<Document> {
    return from(this.documentApi.getDocumentById(documentId, repositoryId)).pipe(
      map((res) => res.data),
    );
  }

  getDocumentByPath(path: string, repositoryId: string = this.repositoryId): Observable<Document> {
    return from(this.documentApi.getDocumentByPath(path, repositoryId)).pipe(
      map((res) => res.data),
    );
  }

  getAncestors(
    documentId: string,
    repositoryId: string = this.repositoryId,
  ): Observable<Document[]> {
    if (documentId === ROOT_DOCUMENT.sys_id) {
      return of([{ ...ROOT_DOCUMENT }]);
    }

    return from(this.documentApi.getDocumentAncestors(documentId, repositoryId)).pipe(
      map((res) =>
        res.data?.ancestors && Array.isArray(res.data.ancestors) ? res.data.ancestors : [],
      ),
      map((ancestors) => [{ ...ROOT_DOCUMENT }, ...ancestors]),
    );
  }

  getAllChildren(
    parentId: string,
    options?: DocumentFetchOptions,
    repositoryId: string = this.repositoryId,
  ): Observable<DocumentFetchResults> {
    return this.getChildrenByNamedQuery(
      'advanced_document_content',
      parentId,
      options,
      repositoryId,
    );
  }

  getFolderChildren(
    parentId: string,
    repositoryId: string = this.repositoryId,
    options?: DocumentFetchOptions,
  ): Observable<DocumentFetchResults> {
    return this.getChildrenByNamedQuery('tree_children', parentId, options, repositoryId);
  }

  notifyDocumentLoaded(document: Document): void {
    this.documentLoaded$.next(document);
  }

  clearSelectionDocumentList(): void {
    this.clearDocumentSelection$.next();
  }

  requestReload(): void {
    this.documentRequestReload$.next();
  }

  private getChildrenByNamedQuery(
    queryName: string,
    parentId: string,
    options?: DocumentFetchOptions,
    repositoryId: string = this.repositoryId,
  ): Observable<DocumentFetchResults> {
    const query: NamedQuery = {
      queryName,
      parameters: { parentId },
      sort: options?.sort?.length ? options.sort : this.defaultSort,
      limit: options?.limit ?? 10000,
      offset: options?.offset ?? 0,
      repositoryId,
    };

    return from(this.queryApi.getDocumentsByNamedQuery(query)).pipe(
      map(({ data }) => ({
        documents: data.documents ?? [],
        limit: data.limit ?? 0,
        offset: data.offset ?? 0,
        totalCount: data.totalCount ?? 0,
        hasNextPage: (data as { hasNextPage?: boolean }).hasNextPage,
      })),
    );
  }
}

// `isHxFolder` moved to `../utils/hxp-document.predicates`. It is a pure predicate that needs no
// adf-hx import, and living here made this whole file — and therefore `@alfresco/*` — reachable
// from the bridge's public barrel through `nuxeo-document-router.service.ts`.
