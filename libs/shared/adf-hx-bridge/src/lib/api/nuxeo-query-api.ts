import { Injectable, inject } from '@angular/core';
import type { Document, NamedQuery, Query, QueryResult } from '@hylandsoftware/hxcs-js-client';
import { firstValueFrom } from 'rxjs';
import { BrowseService, DocumentDetailService } from '@agentic-ui/shared/nuxeo-client';
import { DEFAULT_REPOSITORY_ID, isHxRootDocument } from '../tokens/adf-hx-bridge.tokens';
import { mapNuxeoDocumentsToHx } from '../mapping/nuxeo-to-hx-document.mapper';
import { mapNuxeoVersionsToHx } from '../mapping/nuxeo-to-hx-version.mapper';

type AxiosLikeResponse<T> = { data: T };

/**
 * The one HXQL statement adf-hx builds and hands to `QUERY`.
 *
 * `DocumentVersionsService.getVersionsById` composes it by template literal, so this matches
 * it whole rather than parsing HXQL. That is intentional: HXQL is a query language over the
 * HxPR content model, Nuxeo speaks NXQL over a different one, and a general translator would
 * be a large surface that quietly mistranslates the cases it gets wrong. Recognising the
 * statements upstream actually sends — and refusing the rest by name — fails loudly the day
 * upstream adds a new one, which is the behaviour worth having.
 *
 * Upstream's exact text:
 *   SELECT * FROM SysContent WHERE sys_parentId = '<id>' AND sysver_isVersion = 1
 *   ORDER BY sysver_created DESC
 */
const HXQL_DOCUMENT_VERSIONS =
  /^\s*SELECT\s+\*\s+FROM\s+SysContent\s+WHERE\s+sys_parentId\s*=\s*'([^']*)'\s+AND\s+sysver_isVersion\s*=\s*1\s+ORDER\s+BY\s+sysver_created\s+DESC\s*$/i;

@Injectable()
export class NuxeoQueryApi {
  private readonly browse = inject(BrowseService);
  private readonly documentDetail = inject(DocumentDetailService);

  /**
   * The free-text HXQL entry point, reached through upstream's `SearchService`.
   *
   * Only the versions statement is understood — see `HXQL_DOCUMENT_VERSIONS`. Anything else
   * throws with the query in the message, so a component that starts issuing HXQL this
   * binding cannot answer says so instead of rendering an empty list as though the repository
   * were empty.
   */
  async getDocumentsByQuery(query: Query = {}): Promise<AxiosLikeResponse<QueryResult>> {
    const statement = query.query ?? '';
    const repositoryId = query.repositoryId ?? DEFAULT_REPOSITORY_ID;
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;

    if (repositoryId !== DEFAULT_REPOSITORY_ID) {
      throw new Error(
        `getDocumentsByQuery cannot target repository "${repositoryId}": this Nuxeo binding ` +
          `serves only "${DEFAULT_REPOSITORY_ID}".`,
      );
    }

    // Refused rather than dropped. `SearchService` always sends a `sort` array, empty when the
    // caller gave none; a non-empty one asks for an ordering this method does not apply, and
    // silently ignoring it is the recorded defect `getDocumentsByNamedQuery` still has.
    if (query.sort && query.sort.length > 0) {
      throw new Error(
        `getDocumentsByQuery cannot apply the sort [${query.sort.join(', ')}]: the ordering ` +
          'comes from the query statement itself.',
      );
    }

    const versionsOf = HXQL_DOCUMENT_VERSIONS.exec(statement);
    if (versionsOf) {
      return this.queryDocumentVersions(versionsOf[1], repositoryId, limit, offset);
    }

    throw new Error(
      `getDocumentsByQuery does not understand this HXQL statement: ${statement || '(empty)'}. ` +
        'The Nuxeo binding recognises only the document-versions query.',
    );
  }

  /**
   * A live document's versions, newest first.
   *
   * The ordering is applied here rather than assumed: `Document.GetVersions` answers
   * oldest-first, and the statement asks for `sysver_created DESC`.
   */
  private async queryDocumentVersions(
    liveDocumentId: string,
    repositoryId: string,
    limit: number,
    offset: number,
  ): Promise<AxiosLikeResponse<QueryResult>> {
    if (!liveDocumentId) {
      throw new Error('getDocumentsByQuery: the versions query carried no document id.');
    }

    const nuxeoVersions = await firstValueFrom(
      this.documentDetail.getVersionsDirect(liveDocumentId),
    );
    const documents = mapNuxeoVersionsToHx(nuxeoVersions, repositoryId).sort((a, b) =>
      (b.sysver_created ?? '').localeCompare(a.sysver_created ?? ''),
    );
    return this.sliceQueryResult(documents, limit, offset);
  }

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
