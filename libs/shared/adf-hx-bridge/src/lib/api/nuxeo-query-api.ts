import { Injectable, inject } from '@angular/core';
import type { Document, NamedQuery, QueryResult } from '@hylandsoftware/hxcs-js-client';
import { firstValueFrom } from 'rxjs';
import { BrowseService, DocumentDetailService } from '@agentic-ui/shared/nuxeo-client';
import { DEFAULT_REPOSITORY_ID, isHxRootDocument } from '../tokens/adf-hx-bridge.tokens';
import { mapNuxeoDocumentsToHx } from '../mapping/nuxeo-to-hx-document.mapper';

type AxiosLikeResponse<T> = { data: T };

@Injectable()
export class NuxeoQueryApi {
  private readonly browse = inject(BrowseService);
  private readonly documentDetail = inject(DocumentDetailService);

  async getDocumentsByNamedQuery(
    namedQuery: NamedQuery = {},
  ): Promise<AxiosLikeResponse<QueryResult>> {
    const queryName = namedQuery.queryName ?? '';
    const parentId = String(namedQuery.parameters?.['parentId'] ?? '');
    const repositoryId = namedQuery.repositoryId ?? DEFAULT_REPOSITORY_ID;
    const limit = namedQuery.limit ?? 50;
    const offset = namedQuery.offset ?? 0;

    if (queryName === 'tree_children') {
      return this.queryTreeChildren(parentId, repositoryId, limit, offset);
    }

    if (queryName === 'advanced_document_content') {
      return this.queryFolderContents(parentId, repositoryId, limit, offset);
    }

    return {
      data: {
        documents: [],
        limit,
        offset,
        totalCount: 0,
        count: 0,
      },
    };
  }

  private async queryTreeChildren(
    parentId: string,
    repositoryId: string,
    limit: number,
    offset: number,
  ): Promise<AxiosLikeResponse<QueryResult>> {
    if (isHxRootDocument({ sys_id: parentId })) {
      const bootstrap = await firstValueFrom(this.browse.getNavTreeBootstrap(limit));
      const documents = mapNuxeoDocumentsToHx(bootstrap.entries, repositoryId);
      return this.sliceQueryResult(documents, limit, offset);
    }

    const parent = await firstValueFrom(this.documentDetail.getFullDocument(parentId));
    const children = await firstValueFrom(this.browse.getNavTreeChildren(parent, limit));
    const documents = mapNuxeoDocumentsToHx(children.entries ?? [], repositoryId);
    return this.sliceQueryResult(documents, limit, offset);
  }

  private async queryFolderContents(
    parentId: string,
    repositoryId: string,
    limit: number,
    offset: number,
  ): Promise<AxiosLikeResponse<QueryResult>> {
    if (isHxRootDocument({ sys_id: parentId })) {
      const bootstrap = await firstValueFrom(this.browse.getNavTreeBootstrap(limit));
      const documents = mapNuxeoDocumentsToHx(bootstrap.entries, repositoryId);
      return this.sliceQueryResult(documents, limit, offset);
    }

    const parentPath = await this.resolvePath(parentId);
    const contents = await firstValueFrom(this.browse.getBrowseFolderContents(parentPath, limit));
    const documents = mapNuxeoDocumentsToHx(contents.entries, repositoryId);
    return {
      data: {
        documents: documents.slice(offset, offset + limit),
        limit,
        offset,
        totalCount: contents.totalSize,
        count: documents.length,
      },
    };
  }

  private sliceQueryResult(
    documents: Document[],
    limit: number,
    offset: number,
  ): AxiosLikeResponse<QueryResult> {
    const page = documents.slice(offset, offset + limit);
    return {
      data: {
        documents: page,
        limit,
        offset,
        totalCount: documents.length,
        count: page.length,
      },
    };
  }

  private async resolvePath(documentId: string): Promise<string> {
    if (documentId.startsWith('/')) {
      return documentId;
    }

    if (isHxRootDocument({ sys_id: documentId })) {
      return '/';
    }

    const nuxeo = await firstValueFrom(this.documentDetail.getFullDocument(documentId));
    return nuxeo.path.replace(/\/+$/, '') || '/';
  }
}
