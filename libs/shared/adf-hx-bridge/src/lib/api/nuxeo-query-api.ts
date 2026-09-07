import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import type { Document, NamedQuery, Query, QueryResult } from '@hylandsoftware/hxcs-js-client';
import { firstValueFrom } from 'rxjs';
import {
  BrowseService,
  DocumentDetailService,
  NuxeoApiBase,
  type NuxeoDocumentList,
} from '@nuxeo-satori/platform/nuxeo-client';
import { DEFAULT_REPOSITORY_ID, isHxRootDocument } from '../tokens/adf-hx-bridge.tokens';
import { mapNuxeoDocumentsToHx } from '../mapping/nuxeo-to-hx-document.mapper';
import { mapNuxeoVersionsToHx } from '../mapping/nuxeo-to-hx-version.mapper';

type AxiosLikeResponse<T> = { data: T };

/**
 * HXQL statement patterns: versions (exact match) and search (parsed).
 *
 * `DocumentVersionsService.getVersionsById` composes versions by template literal, so it is
 * matched whole rather than parsed. That is intentional: HXQL is a query language over the
 * HxPR content model, Nuxeo speaks NXQL over a different one, and a general translator would
 * be a large surface that quietly mistranslates the cases it gets wrong. Recognising the
 * statements upstream actually sends — and refusing the rest by name — fails loudly the day
 * upstream adds a new one, which is the behaviour worth having.
 *
 * Upstream versions query:
 *   SELECT * FROM SysContent WHERE sys_parentId = '<id>' AND sysver_isVersion = 1
 *   ORDER BY sysver_created DESC
 *
 * Upstream search queries (built by filter services):
 *   SELECT * FROM SysContent WHERE <filters> ORDER BY <sort>
 * Where <filters> is one or more of:
 *   - sys_fulltext = 'term*'
 *   - sys_created >= DATE '2024-01-01T00:00:00Z' AND sys_created <= DATE '...'
 *   - sys_primaryType IN ('File','Folder',...)
 *   - sysfile_blob/mimeType IN ('image/png',...)
 */
const HXQL_DOCUMENT_VERSIONS =
  /^\s*SELECT\s+\*\s+FROM\s+SysContent\s+WHERE\s+sys_parentId\s*=\s*'([^']*)'\s+AND\s+sysver_isVersion\s*=\s*1\s+ORDER\s+BY\s+sysver_created\s+DESC\s*$/i;

/**
 * `WHERE` is **optional**, because the search page sends none until the user
 * narrows something: with an empty box and no filters the statement is
 * `SELECT * FROM SysContent ORDER BY sys_modified DESC`. Requiring `WHERE` made
 * that fall through to the refusal branch, so the search page threw on first load
 * — before any interaction.
 */
const HXQL_SEARCH_QUERY =
  /^\s*SELECT\s+\*\s+FROM\s+SysContent(?:\s+WHERE\s+(.*?))?(?:\s+ORDER\s+BY\s+(.*?))?\s*$/i;

/**
 * HxPR sort key -> the Nuxeo property `@children` can order by.
 *
 * Only keys with an exact Nuxeo equivalent are here. Anything else is **refused**, and that is
 * not pedantry: a `sortBy` Nuxeo cannot use answers **HTTP 200 with zero entries** — verified
 * against the local instance with `sortBy=ecm:isFolder`. Forwarding an unmappable key would
 * render an empty list on a folder full of documents, which is the worst failure available here.
 *
 * `sys_isFolderish` is deliberately absent. Nuxeo has no sortable folderish property, so
 * "folders first" cannot be expressed server-side at all. An unmappable key is **dropped**
 * rather than refused — see `toNuxeoSort` for why refusing it emptied the document tree.
 */
const NUXEO_SORT_FIELD: Readonly<Record<string, string>> = {
  sys_title: 'dc:title',
  sys_name: 'dc:title',
  sys_modified: 'dc:modified',
  sys_created: 'dc:created',
  sys_creator: 'dc:creator',
  sys_lastContributor: 'dc:lastContributor',
  sys_lifecycleState: 'ecm:currentLifeCycleState',
  'sys_creator.username': 'dc:creator',
  'sys_lastContributor.username': 'dc:lastContributor',
};

/**
 * Upstream's sort entries are `"<key> <asc|desc>"` strings. Translated, or refused by name.
 */
function toNuxeoSort(sort: readonly string[]): { sortBy: string; sortOrder: 'ASC' | 'DESC' }[] {
  const translated: { sortBy: string; sortOrder: 'ASC' | 'DESC' }[] = [];

  for (const entry of sort) {
    const [key, direction = 'asc'] = entry.trim().split(/\s+/);
    // `Object.hasOwn`, because a bare index read resolves through the prototype chain: a key
    // of `constructor` produced a truthy `Function`, sailed past the check below and was
    // sent to Nuxeo as a `sortBy`. Nuxeo answers an unusable `sortBy` with HTTP 200 and zero
    // entries, which is the exact empty-folder failure this function exists to prevent.
    const sortBy = Object.hasOwn(NUXEO_SORT_FIELD, key) ? NUXEO_SORT_FIELD[key] : undefined;
    const normalized = direction.toLowerCase();

    if (!sortBy || (normalized !== 'asc' && normalized !== 'desc')) {
      // Dropped, not thrown. This used to throw, and the throw caused the precise failure the
      // refusal was written to prevent: upstream's document tree hardcodes
      // `['sys_isFolderish desc', 'sys_title asc']` on every fetch, and
      // `DocumentTreeDatabaseService.getChildren` wraps the call in
      // `catchError(() => of({ documents: [] }))`. So the throw was swallowed and the tree
      // rendered permanently empty, with no error and — the part that made it hard to find —
      // no HTTP request at all. The list worked only because its sort happens to be mappable.
      //
      // Dropping keeps the protection that mattered (an unmappable key is never forwarded to
      // Nuxeo) while letting the mappable remainder through, so the caller gets a folder
      // ordered by title instead of an empty one. `sys_isFolderish` has no Nuxeo equivalent,
      // so "folders first" is simply not expressible server-side and is silently not applied.
      console.warn(
        `Ignoring sort "${entry}": ${
          sortBy ? 'direction must be asc or desc' : 'no Nuxeo property corresponds to that key'
        }. Sortable keys: ${Object.keys(NUXEO_SORT_FIELD).join(', ')}.`,
      );
      continue;
    }

    translated.push({
      sortBy,
      sortOrder: normalized === 'desc' ? ('DESC' as const) : ('ASC' as const),
    });
  }

  return translated;
}

/**
 * HXQL field name -> Nuxeo property path for search translation.
 *
 * Only fields the search filter services actually use are here. Anything else is refused
 * by name so an unrecognized HXQL field fails loudly rather than silently matching nothing.
 */
const HXQL_TO_NUXEO_FIELD: Readonly<Record<string, string>> = {
  sys_fulltext: 'ecm:fulltext',
  sys_created: 'dc:created',
  sys_modified: 'dc:modified',
  sys_primaryType: 'ecm:primaryType',
  sys_name: 'dc:title',
  sys_title: 'dc:title',
  sys_creator: 'dc:creator',
  sys_lastContributor: 'dc:lastContributor',
  'sysfile_blob/mimeType': 'file:content/mime-type',
};

/**
 * Translate an HXQL fragment — a `WHERE` clause or an `ORDER BY` list — to NXQL.
 *
 * Handles what upstream's four filter services actually emit:
 * - `sys_fulltext = 'term*'`                  -> `ecm:fulltext = 'term*'`
 * - `sys_created >= DATE '…'`                 -> `dc:created >= TIMESTAMP '…'`
 * - `sys_primaryType IN ('File','Folder')`    -> `ecm:primaryType IN (…)`
 * - `sysfile_blob/mimeType IN ('image/png')`  -> `file:content/mime-type IN (…)`
 * - `sys_modified DESC`                       -> `dc:modified DESC`
 * - `AND` / `OR` between them, unchanged
 *
 * Anything left carrying an HxPR field name is **refused by name**. A field Nuxeo
 * cannot resolve does not error there — it answers HTTP 200 with zero entries,
 * which is indistinguishable from an empty repository and becomes a bug report
 * about missing documents.
 *
 * Field substitution is deliberately **not** conditioned on what follows the
 * name. An earlier cut required an operator (`=`, `IN`, `>=`) in a lookahead,
 * which silently excluded the `ORDER BY sys_modified DESC` that the search page's
 * own default query ends with — so every search threw, and the message claimed
 * `sys_modified` was unsupported while listing it as supported. Ordering is a
 * position, not an operator.
 */
function translateHxqlToNxql(hxqlFragment: string): string {
  if (!hxqlFragment.trim()) {
    return '';
  }

  // Longest first, so `sysfile_blob/mimeType` is consumed before any shorter key
  // could match part of it.
  const byLengthDescending = Object.keys(HXQL_TO_NUXEO_FIELD).sort((a, b) => b.length - a.length);

  let nxql = hxqlFragment;
  for (const hxqlField of byLengthDescending) {
    const escaped = hxqlField.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&');
    nxql = nxql.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), HXQL_TO_NUXEO_FIELD[hxqlField]);
  }

  // HXQL spells a date literal `DATE '…'`; NXQL spells it `TIMESTAMP '…'`.
  nxql = nxql.replace(/\bDATE\s+'/gi, "TIMESTAMP '");

  // Refuse anything still naming an HxPR field — but read past quoted literals
  // first, or a user searching for the text "sys_id" would be told their own
  // search term is an unsupported field.
  const withoutLiterals = nxql.replace(/'(?:[^'\\]|\\.)*'/g, "''");
  const unmappedField = /\bsys(?:file)?_\w+/.exec(withoutLiterals);
  if (unmappedField) {
    throw new Error(
      `Cannot translate HXQL field "${unmappedField[0]}": no Nuxeo property corresponds to it. ` +
        `Supported HXQL fields: ${Object.keys(HXQL_TO_NUXEO_FIELD).join(', ')}.`,
    );
  }

  return nxql;
}

@Injectable()
export class NuxeoQueryApi {
  private readonly api = inject(NuxeoApiBase);
  private readonly browse = inject(BrowseService);
  private readonly documentDetail = inject(DocumentDetailService);

  /**
   * The free-text HXQL entry point, reached through upstream's `SearchService`.
   *
   * Understands two statement patterns:
   * 1. Document versions (exact match) — see `HXQL_DOCUMENT_VERSIONS`
   * 2. Search queries (parsed and translated) — see `HXQL_SEARCH_QUERY`
   *
   * Anything else throws with the query in the message, so a component that starts issuing
   * HXQL this binding cannot answer says so instead of rendering an empty list as though the
   * repository were empty.
   */
  async getDocumentsByQuery(query: Query = {}): Promise<AxiosLikeResponse<QueryResult>> {
    const statement = query.query ?? '';
    const repositoryId = query.repositoryId ?? DEFAULT_REPOSITORY_ID;
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;
    const sort = query.sort ?? [];

    if (repositoryId !== DEFAULT_REPOSITORY_ID) {
      throw new Error(
        `getDocumentsByQuery cannot target repository "${repositoryId}": this Nuxeo binding ` +
          `serves only "${DEFAULT_REPOSITORY_ID}".`,
      );
    }

    // Try versions query first (exact match)
    const versionsOf = HXQL_DOCUMENT_VERSIONS.exec(statement);
    if (versionsOf) {
      // Versions query embeds its own ORDER BY, so sort must be empty
      if (sort.length > 0) {
        throw new Error(
          `getDocumentsByQuery cannot apply the sort [${sort.join(', ')}]: the versions query ` +
            'embeds its own ordering.',
        );
      }
      return this.queryDocumentVersions(versionsOf[1], repositoryId, limit, offset);
    }

    // Try search query (parsed)
    const searchMatch = HXQL_SEARCH_QUERY.exec(statement);
    if (searchMatch) {
      const whereClause = searchMatch[1]?.trim() ?? '';
      const orderBy = searchMatch[2]?.trim() ?? '';

      return this.querySearch(whereClause, orderBy, repositoryId, limit, offset, sort);
    }

    throw new Error(
      `getDocumentsByQuery does not understand this HXQL statement: ${statement || '(empty)'}. ` +
        'The Nuxeo binding recognises document-versions and search queries.',
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

  /**
   * The named-query entry point.
   *
   * **The `sort` is applied now.** It used to be accepted and silently discarded — one of the five
   * recorded bridge defects, and the one `AGENTS/11-beta-program.md` §3 cites as the pattern to
   * avoid. Discarding it was not only losing a user's column click: `AdfHxDocumentService` sends a
   * default order on *every* children fetch, so no browse listing was ever ordered as intended.
   */
  async getDocumentsByNamedQuery(
    namedQuery: NamedQuery = {},
  ): Promise<AxiosLikeResponse<QueryResult>> {
    const queryName = namedQuery.queryName ?? '';
    const parentId = String(namedQuery.parameters?.['parentId'] ?? '');
    const repositoryId = namedQuery.repositoryId ?? DEFAULT_REPOSITORY_ID;
    const limit = namedQuery.limit ?? 50;
    const offset = namedQuery.offset ?? 0;
    const sort = toNuxeoSort((namedQuery as { sort?: string[] }).sort ?? []);

    if (queryName === 'tree_children') {
      return this.queryTreeChildren(parentId, repositoryId, limit, offset);
    }

    if (queryName === 'advanced_document_content') {
      return this.queryFolderContents(parentId, repositoryId, limit, offset, sort);
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

  /**
   * A folder's children — one **server** page, ordered by the server.
   *
   * `offset` is turned into Nuxeo's `currentPageIndex` rather than used to slice a larger fetch.
   * Slicing was the old shape and it is what made the 50-child ceiling invisible: the page after
   * the first was never requested, so a folder with 200 children silently showed 50.
   */
  private async queryFolderContents(
    parentId: string,
    repositoryId: string,
    limit: number,
    offset: number,
    sort: { sortBy: string; sortOrder: 'ASC' | 'DESC' }[] = [],
  ): Promise<AxiosLikeResponse<QueryResult>> {
    if (isHxRootDocument({ sys_id: parentId })) {
      const bootstrap = await firstValueFrom(this.browse.getNavTreeBootstrap(limit));
      const documents = mapNuxeoDocumentsToHx(bootstrap.entries, repositoryId);
      return this.sliceQueryResult(documents, limit, offset);
    }

    const parentPath = await this.resolvePath(parentId);
    const currentPageIndex = limit > 0 ? Math.floor(offset / limit) : 0;
    const contents = await firstValueFrom(
      this.browse.getBrowseFolderContents(parentPath, limit, { currentPageIndex, sort }),
    );
    const documents = mapNuxeoDocumentsToHx(contents.entries, repositoryId);
    return {
      data: {
        documents,
        limit,
        offset,
        // Nuxeo's own number, negative when it did not count — real only when the folder fits on
        // one page, since `resultsCountLimit` is the requested `pageSize`. It is NOT replaced with
        // `documents.length`: doing that told every caller the page was the whole folder, which is
        // the recorded `totalCount` defect.
        totalCount: contents.totalSize,
        count: documents.length,
        // Not on upstream's `QueryResult`, and the only honest basis for a pager when the total is
        // unknown. `Document` and `QueryResult` both carry an index signature, so it travels.
        hasNextPage: contents.hasNextPage,
      } as QueryResult,
    };
  }

  /**
   * Full-text search over the repository, translating HXQL to NXQL.
   *
   * `ORDER BY` comes from the HXQL statement itself when it carries one, and from
   * the `sort` array otherwise — upstream's `SearchService` populates both, and
   * the statement is the more specific of the two.
   *
   * Not immediately consistent. `/search/lang/NXQL/execute` is OpenSearch-backed
   * on this deployment and lags a write, which is why the versions panel reads
   * `Document.GetVersions` instead. Search is the one surface where that is
   * acceptable: a document missing from a result set for a second is a very
   * different defect from a version missing from the list of versions the user
   * just created.
   */
  private async querySearch(
    hxqlWhere: string,
    hxqlOrderBy: string,
    repositoryId: string,
    limit: number,
    offset: number,
    sort: readonly string[],
  ): Promise<AxiosLikeResponse<QueryResult>> {
    const translatedWhere = translateHxqlToNxql(hxqlWhere);

    let nxqlOrderBy = '';
    if (hxqlOrderBy) {
      nxqlOrderBy = translateHxqlToNxql(hxqlOrderBy);
    } else if (sort.length > 0) {
      nxqlOrderBy = toNuxeoSort(sort)
        .map((entry) => `${entry.sortBy} ${entry.sortOrder}`)
        .join(', ');
    }

    // Without these two, a search returns every *version* of every match and
    // everything in the trash. Upstream's HXQL carries no equivalent — HxPR
    // filters versions with `sysver_isVersion` only when a caller asks — so the
    // hygiene is ours to add, and it is added unconditionally rather than left to
    // whichever filter the user happens to apply.
    const clauses = ['ecm:isVersion = 0', 'ecm:isTrashed = 0'];
    if (translatedWhere) clauses.push(`(${translatedWhere})`);

    const nxqlQuery =
      `SELECT * FROM Document WHERE ${clauses.join(' AND ')}` +
      (nxqlOrderBy ? ` ORDER BY ${nxqlOrderBy}` : '');

    // Call Nuxeo search endpoint
    const currentPageIndex = limit > 0 ? Math.floor(offset / limit) : 0;
    const params = new HttpParams()
      .set('query', nxqlQuery)
      .set('pageSize', limit.toString())
      .set('currentPageIndex', currentPageIndex.toString());

    const response = await firstValueFrom(
      this.api.get<NuxeoDocumentList>('/nuxeo/api/v1/search/lang/NXQL/execute', params, {
        properties: '*',
        'enrichers.document': 'permissions',
      }),
    );

    const documents = mapNuxeoDocumentsToHx(response.entries, repositoryId);

    return {
      data: {
        documents,
        limit,
        offset,
        // Nuxeo's resultsCount is the actual total when available
        totalCount: response.resultsCount ?? -1,
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
