import { Injectable, inject } from '@angular/core';
import { NuxeoApiBase } from '@agentic-ui/shared/nuxeo-client';
import {
  ContentError,
  allContentOfFolder,
  childrenOfFolder,
  collectionMembers,
  trashedChildrenOfFolder,
  versionsOfDocument,
  type ContentNode,
  type FilterSpec,
  type NamedQueryKey,
  type PageRequest,
  type SearchCapabilities,
  type SearchPort,
  type SearchResultPage,
} from '@agentic-ui/shared/content-ports';
import { map, type Observable } from 'rxjs';
import { nuxeoSearchCapabilities } from '../capabilities';
import { toResultPage } from '../mapping/content-node.mapper';
import { mapNuxeoError } from '../mapping/error.mapper';
import { toNxqlWhere } from '../mapping/filter.mapper';

const NOT_TRASHED = 'ecm:isTrashed = 0';

function quote(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

/**
 * The Nuxeo {@link SearchPort}. Both named queries and the bounded filter DSL compile
 * to NXQL and run through the repository search endpoint.
 *
 * This port carries no aggregation surface, so the product's faceted search does not
 * run through it — that stays on the Nuxeo page-provider path in `AssetService` and
 * `SearchService`. See `AGENTS/00-architecture.md`.
 */
@Injectable({ providedIn: 'root' })
export class NuxeoSearchAdapter implements SearchPort {
  private readonly api = inject(NuxeoApiBase);

  runNamedQuery<TParams, TRow>(
    key: NamedQueryKey<TParams, TRow>,
    params: TParams,
    page: PageRequest,
  ): Observable<SearchResultPage<TRow>> {
    return this.execute(toNamedWhere(key, params), page) as Observable<SearchResultPage<TRow>>;
  }

  runFilter<TRow = ContentNode>(
    spec: FilterSpec<TRow>,
    page: PageRequest,
  ): Observable<SearchResultPage<TRow>> {
    return this.execute(toNxqlWhere(spec), page) as Observable<SearchResultPage<TRow>>;
  }

  capabilities(): SearchCapabilities {
    return nuxeoSearchCapabilities;
  }

  private execute(
    whereClause: string,
    page: PageRequest,
  ): Observable<SearchResultPage<ContentNode>> {
    const query = `SELECT * FROM Document WHERE ${whereClause}${orderBy(page)}`;
    return this.api.nxqlSearch(query, page.limit).pipe(
      mapNuxeoError(),
      map((list) => toResultPage(list, page)),
    );
  }
}

/**
 * `PageRequest.sort` is neutral, but NXQL needs real column names. Only the sort keys
 * the neutral core can express are accepted; anything else is rejected rather than
 * silently dropped, so a caller never believes it got a sorted page when it did not.
 */
const SORTABLE: Readonly<Record<string, string>> = {
  name: 'dc:title',
  modifiedAt: 'dc:modified',
  createdAt: 'dc:created',
};

function orderBy(page: PageRequest): string {
  if (!page.sort?.length) {
    return '';
  }
  const clauses = page.sort.map((sort) => {
    const column = SORTABLE[sort.field];
    if (!column) {
      throw new ContentError('UnsupportedField', `cannot sort on '${sort.field}'`);
    }
    return `${column} ${sort.direction === 'desc' ? 'DESC' : 'ASC'}`;
  });
  return ` ORDER BY ${clauses.join(', ')}`;
}

function toNamedWhere<TParams, TRow>(key: NamedQueryKey<TParams, TRow>, params: TParams): string {
  const record = (params ?? {}) as {
    parentId?: string;
    documentId?: string;
    collectionId?: string;
  };

  switch (key.key) {
    case childrenOfFolder.key:
      return `ecm:parentId = ${quote(record.parentId ?? '')} AND ${NOT_TRASHED}`;
    case allContentOfFolder.key:
      return `ecm:ancestorId = ${quote(record.parentId ?? '')} AND ${NOT_TRASHED}`;
    case versionsOfDocument.key:
      return `ecm:versionVersionableId = ${quote(record.documentId ?? '')} AND ecm:isVersion = 1`;
    case trashedChildrenOfFolder.key:
      return `ecm:parentId = ${quote(record.parentId ?? '')} AND ecm:isTrashed = 1`;
    case collectionMembers.key:
      return `collectionMember:collectionIds/* = ${quote(record.collectionId ?? '')} AND ${NOT_TRASHED}`;
    default:
      throw new ContentError(
        'UnsupportedFilter',
        `nuxeo adapter does not implement named query '${key.key}'`,
      );
  }
}
