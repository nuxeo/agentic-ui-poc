import { Injectable, inject } from '@angular/core';
import type { Document, DocumentApi, NamedQuery, QueryApi } from '@hylandsoftware/hxcs-js-client';
import { BehaviorSubject, from, Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  DEFAULT_REPOSITORY_ID,
  DOCUMENT_API_TOKEN,
  isHxRootDocument,
  QUERY_API_TOKEN,
  ROOT_DOCUMENT,
} from '../tokens/adf-hx-bridge.tokens';

export interface DocumentFetchOptions {
  limit?: number;
  offset?: number;
  sort?: string[];
}

export interface DocumentFetchResults {
  documents: Document[];
  limit: number;
  offset: number;
  totalCount: number;
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
  private readonly folderishSort = 'sys_isFolderish desc';
  private readonly defaultSort = [this.folderishSort, 'sys_title asc'];

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
      })),
    );
  }
}

export function isHxFolder(document: Document): boolean {
  return document.sys_isFolderish === true && !isHxRootDocument(document);
}
