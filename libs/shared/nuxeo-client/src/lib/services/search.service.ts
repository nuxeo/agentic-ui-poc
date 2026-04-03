import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import type { NuxeoDocumentList } from '../models/document.model';
import type { AggregateResult } from '../models/asset.model';
import type { SearchAggregations, SearchResponse, SearchResultItem } from '../models/search.model';
import { NuxeoApiBase } from './nuxeo-api-base';
import { docTypeIcon } from '../constants/doc-type-icons';

export interface SearchQueryParams {
  q?: string;
  ecmFulltext?: string;
  quickFilters?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  modifiedDate?: string;
  author?: string;
  collection?: string;
  tag?: string;
  nature?: string;
  subjects?: string;
  coverage?: string;
  size?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface SearchCollectionOption {
  id: string;
  title: string;
  itemCount: number;
}

export interface SavedSearchOption {
  id: string;
  title: string;
  query?: string;
}

export interface SaveSavedSearchParams {
  title: string;
  params: Record<string, string>;
  pageProviderName?: string;
}

export interface GlobalSearchSuggestion {
  id: string;
  displayLabel: string;
  kind: 'document' | 'user' | 'group' | 'other';
  documentUid?: string;
  path?: string;
  prefixedId?: string;
}

interface SearchApiResponse extends NuxeoDocumentList {
  aggregations?: Record<string, { buckets?: Array<{ key?: string; docCount?: number; doc_count?: number }> }>;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly api = inject(NuxeoApiBase);

  private readonly savedSearchHighlight =
    'dc:title.fulltext,ecm:binarytext,dc:description.fulltext,ecm:tag,note:note.fulltext,file:content.name';

  suggest(searchTerm: string, pageSize = 10): Observable<GlobalSearchSuggestion[]> {
    const term = searchTerm.trim();
    if (!term) return of([]);

    return this.api
      .post<unknown>(
        '/nuxeo/api/v1/automation/Search.SuggestersLauncher',
        {
          params: { searchTerm: term },
          context: {},
        },
        {
          'Content-Type': 'application/json',
          properties: '*',
        },
      )
      .pipe(
        map((res) => this.normalizeSuggestions(res).slice(0, pageSize)),
        catchError(() => this.suggestFallback(term, pageSize)),
      );
  }

  private suggestFallback(searchTerm: string, pageSize: number): Observable<GlobalSearchSuggestion[]> {
    const userGroup$ = this.api
      .post<unknown[]>(
        '/nuxeo/api/v1/automation/UserGroup.Suggestion',
        {
          params: { searchTerm, searchType: 'USER_GROUP_TYPE' },
          context: {},
        },
        {
          'Content-Type': 'application/json',
          properties: '*',
        },
      )
      .pipe(
        map((res) =>
          (Array.isArray(res) ? res : [])
            .map((item) => this.mapSuggestion(item))
            .filter((item): item is GlobalSearchSuggestion => item !== null),
        ),
        catchError(() => of<GlobalSearchSuggestion[]>([])),
      );

    const docsParams = new HttpParams()
      .set('query', searchTerm)
      .set('pageSize', pageSize)
      .set('currentPageIndex', 0);

    const docs$ = this.api
      .get<NuxeoDocumentList>('/nuxeo/api/v1/search/pp/default_search/execute', docsParams, {
        properties: 'dublincore',
      })
      .pipe(
        map((res) =>
          res.entries.map((doc) => ({
            id: doc.uid,
            displayLabel: doc.title || doc.uid,
            kind: 'document' as const,
            documentUid: doc.uid,
            path: doc.path,
          })),
        ),
        catchError(() => of<GlobalSearchSuggestion[]>([])),
      );

    return forkJoin([docs$, userGroup$]).pipe(
      map(([docs, usersAndGroups]) => [...docs, ...usersAndGroups].slice(0, pageSize)),
    );
  }

  getUserCollections(): Observable<SearchCollectionOption[]> {
    return this.api
      .post<NuxeoDocumentList>(
        '/nuxeo/api/v1/automation/User.GetCollections',
        { params: { searchTerm: '' }, context: {} },
        { 'Content-Type': 'application/json', properties: 'dublincore,collection' },
      )
      .pipe(
        map((res) =>
          res.entries.map((doc) => {
            const props = doc.properties ?? {};
            const ids = (props['collection:documentIds'] as string[] | undefined) ?? [];
            const title = doc.title ?? (props['dc:title'] as string | undefined) ?? doc.uid;
            return {
              id: doc.uid,
              title,
              itemCount: ids.length,
            } satisfies SearchCollectionOption;
          }),
        ),
      );
  }

  getSavedSearches(pageProvider = 'default_search'): Observable<SavedSearchOption[]> {
    const params = new HttpParams().set('pageProvider', pageProvider);

    return this.api
      .get<{ entries: Array<Record<string, unknown>> }>('/nuxeo/api/v1/search/saved', params, {
        properties: '*',
        'enrichers.document': 'thumbnail,permissions,highlight',
      })
      .pipe(
        map((res) =>
          (res.entries ?? []).map((doc) => {
            // Saved search API returns entries with `id`; document API returns `uid`.
            const id = this.asString(doc['id']) ?? this.asString(doc['uid']) ?? '';
            const title = this.asString(doc['title']) ?? id;
            const props = (doc['properties'] as Record<string, unknown>) ?? {};
            const query = this.firstString(
              props['contentview:query'],
              props['savedsearch:query'],
              props['search:query'],
              doc['query'],
            );

            return { id, title, query } satisfies SavedSearchOption;
          }).filter((item) => item.id.length > 0),
        ),
        catchError(() => of<SavedSearchOption[]>([])),
      );
  }

  getSavedSearchById(id: string): Observable<Record<string, string>> {
    const encodedId = encodeURIComponent(id);
    return this.api
      .get<unknown>(`/nuxeo/api/v1/search/saved/${encodedId}`, new HttpParams(), { properties: '*' })
      .pipe(
        map((res) => this.extractSavedSearchParams(res)),
        catchError(() => of<Record<string, string>>({})),
      );
  }

  private extractSavedSearchParams(res: unknown): Record<string, string> {
    if (!res || typeof res !== 'object') return {};
    const obj = res as Record<string, unknown>;

    // Saved search entity format: top-level params object
    if (obj['params'] && typeof obj['params'] === 'object' && !Array.isArray(obj['params'])) {
      const result: Record<string, string> = {};
      for (const [key, value] of Object.entries(obj['params'] as Record<string, unknown>)) {
        if (key !== 'highlight' && value !== null && value !== undefined) {
          result[key] = String(value);
        }
      }
      return result;
    }

    // Document format: params stored in savedsearch schema namedParams
    const props = (obj['properties'] as Record<string, unknown>) ?? {};
    const namedParams = props['savedsearch:namedParams'];
    if (Array.isArray(namedParams)) {
      const result: Record<string, string> = {};
      for (const entry of namedParams as Array<Record<string, unknown>>) {
        const key = typeof entry['key'] === 'string' ? entry['key'] : null;
        const value = entry['value'];
        if (key && key !== 'highlight' && value !== null && value !== undefined) {
          result[key] = String(value);
        }
      }
      return result;
    }

    return {};
  }

  saveSavedSearch(request: SaveSavedSearchParams): Observable<unknown> {
    const { title, params, pageProviderName = 'default_search' } = request;

    return this.api.post<unknown>(
      '/nuxeo/api/v1/search/saved',
      {
        'entity-type': 'savedSearch',
        pageProviderName,
        params: {
          ...params,
          highlight: this.savedSearchHighlight,
        },
        title,
      },
      {
        'Content-Type': 'application/json',
        accept: 'text/plain, application/json',
        properties: '*',
      },
    );
  }

  updateSavedSearch(id: string, request: SaveSavedSearchParams): Observable<unknown> {
    const encodedId = encodeURIComponent(id);
    const { title, params, pageProviderName = 'default_search' } = request;

    return this.api.put<unknown>(
      `/nuxeo/api/v1/search/saved/${encodedId}`,
      {
        'entity-type': 'savedSearch',
        pageProviderName,
        params: {
          ...params,
          highlight: this.savedSearchHighlight,
        },
        title,
      },
      {
        'Content-Type': 'application/json',
        accept: 'text/plain, application/json',
        properties: '*',
      },
    );
  }

  deleteSavedSearch(id: string): Observable<unknown> {
    const encodedId = encodeURIComponent(id);
    return this.api.delete<unknown>(`/nuxeo/api/v1/search/saved/${encodedId}`);
  }

  search(params: SearchQueryParams): Observable<SearchResponse> {
    const {
      q = '',
      ecmFulltext = '',
      quickFilters = '',
      sortBy = 'dc:created',
      sortOrder = 'desc',
      modifiedDate = '',
      author = '',
      collection = '',
      tag = '',
      nature = '',
      subjects = '',
      coverage = '',
      size = '',
      pageIndex = 0,
      pageSize = 40,
    } = params;

    const parseList = (value: string): string[] =>
      value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);

    let httpParams = new HttpParams()
      .set('currentPageIndex', pageIndex)
      .set('offset', pageIndex * pageSize)
      .set('pageSize', pageSize)
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder)
      .set('quickFilters', quickFilters.trim());

    const modifiedDateValues = parseList(modifiedDate);
    const natureValues = parseList(nature);
    const subjectValues = parseList(subjects);
    const coverageValues = parseList(coverage);
    const sizeValues = parseList(size);

    if (modifiedDateValues.length > 0) {
      httpParams = httpParams.set('dc_modified_agg', JSON.stringify(modifiedDateValues));
    }

    if (author.trim()) {
      httpParams = httpParams.set('dc_creator_agg', JSON.stringify([author.trim()]));
    }

    if (collection.trim()) {
      const selectedCollection = JSON.stringify([collection.trim()]);
      httpParams = httpParams
        .set('collection_agg', selectedCollection)
        .set('dc_coverage_agg', selectedCollection);
    }

    if (natureValues.length > 0) {
      httpParams = httpParams.set('dc_nature_agg', JSON.stringify(natureValues));
    }

    if (coverageValues.length > 0) {
      httpParams = httpParams.set('dc_coverage_agg', JSON.stringify(coverageValues));
    }

    if (sizeValues.length > 0) {
      httpParams = httpParams.set('common_size_agg', JSON.stringify(sizeValues));
    }

    if (subjectValues.length > 0) {
      httpParams = httpParams.set('dc_subjects_agg', JSON.stringify([...new Set(subjectValues)]));
    }

    if (tag.trim()) {
      httpParams = httpParams.set('ecm_tags', JSON.stringify([tag.trim()]));
    }

    if (q.trim()) {
      httpParams = httpParams.set('query', q.trim());
    }

    if (ecmFulltext.trim()) {
      httpParams = httpParams.set('ecm_fulltext', ecmFulltext.trim());
    }

    return this.api
      .get<SearchApiResponse>('/nuxeo/api/v1/search/pp/default_search/execute', httpParams, {
        properties: 'dublincore,file,common',
        'enrichers.document': 'favorites',
      })
      .pipe(
        map((res) => ({
          items: res.entries.map((doc) => {
            const props = doc.properties ?? {};
            const fileContent = props['file:content'] as { 'mime-type'?: string; length?: number | string } | null;
            const tags = (props['dc:subjects'] as string[] | undefined) ?? [];
            const lastContributor = this.asPrincipalName(props['dc:lastContributor']);
            const author = this.asPrincipalName(props['dc:creator']);
            const major = props['uid:major_version'];
            const minor = props['uid:minor_version'];
            const version =
              typeof major === 'number' && typeof minor === 'number'
                ? `${major}.${minor}`
                : undefined;

            return {
              id: doc.uid,
              title: doc.title,
              type: doc.type,
              isFavorite: doc.contextParameters?.favorites?.isFavorite ?? false,
              modifiedDate: doc.lastModified?.slice(0, 10) ?? '',
              sizeInBytes: this.parseSizeInBytes(fileContent?.length),
              lastContributor,
              createdDate: typeof props['dc:created'] === 'string'
                ? (props['dc:created'] as string).slice(0, 10)
                : undefined,
              author,
              authorKey: author.toLowerCase(),
              state: typeof props['ecm:currentLifeCycleState'] === 'string'
                ? (props['ecm:currentLifeCycleState'] as string)
                : undefined,
              version,
              nature: typeof props['dc:nature'] === 'string' ? (props['dc:nature'] as string) : undefined,
              coverage: typeof props['dc:coverage'] === 'string' ? (props['dc:coverage'] as string) : undefined,
              subjects: tags.join(', ') || undefined,
              flags: undefined,
              collection: Array.isArray(props['collection:documentIds'])
                ? (props['collection:documentIds'] as string[]).join(',')
                : ((props['collection:documentIds'] as string) ?? ''),
              collectionKey: Array.isArray(props['collection:documentIds'])
                ? (props['collection:documentIds'] as string[]).join(',').toLowerCase()
                : ((props['collection:documentIds'] as string) ?? '').toLowerCase(),
              tags,
              icon: docTypeIcon(doc.type),
            } satisfies SearchResultItem;
          }),
          aggregations: this.normalizeAggregations(res.aggregations),
        })),
      );
  }

  private asPrincipalName(value: unknown): string {
    if (typeof value === 'string') return value;
    if (!value || typeof value !== 'object') return '';

    const principal = value as {
      name?: string;
      id?: string;
      properties?: { username?: string };
    };

    return principal.name ?? principal.properties?.username ?? principal.id ?? '';
  }

  private parseSizeInBytes(value: unknown): number | undefined {
    if (typeof value === 'number') {
      return Number.isFinite(value) && value >= 0 ? value : undefined;
    }
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
    }
    return undefined;
  }

  private firstString(...values: unknown[]): string | undefined {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) {
        return value;
      }
    }
    return undefined;
  }

  private normalizeAggregations(aggregations?: SearchApiResponse['aggregations']): SearchAggregations {
    const toAggregate = (agg?: { buckets?: Array<{ key?: string; docCount?: number; doc_count?: number }> }): AggregateResult | undefined => {
      if (!agg?.buckets?.length) return undefined;
      return {
        buckets: agg.buckets
          .filter((b): b is { key: string; docCount?: number; doc_count?: number } => typeof b.key === 'string')
          .map((b) => ({
            key: b.key,
            docCount: typeof b.docCount === 'number' ? b.docCount : (b.doc_count ?? 0),
          })),
      };
    };

    return {
      dc_modified_agg: toAggregate(aggregations?.['dc_modified_agg']),
      dc_creator_agg: toAggregate(aggregations?.['dc_creator_agg']),
      collection_agg: toAggregate(aggregations?.['collection_agg']),
      dc_nature_agg: toAggregate(aggregations?.['dc_nature_agg']),
      dc_coverage_agg: toAggregate(aggregations?.['dc_coverage_agg']),
      dc_subjects_agg: toAggregate(aggregations?.['dc_subjects_agg']),
      common_size_agg: toAggregate(aggregations?.['common_size_agg']),
    };
  }

  private normalizeSuggestions(payload: unknown): GlobalSearchSuggestion[] {
    const items = this.extractSuggestionItems(payload);
    const suggestions: GlobalSearchSuggestion[] = [];

    for (const item of items) {
      const mapped = this.mapSuggestion(item);
      if (mapped) suggestions.push(mapped);
    }

    return suggestions;
  }

  private extractSuggestionItems(payload: unknown): unknown[] {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];

    const obj = payload as Record<string, unknown>;

    const directArrayKeys = ['entries', 'results', 'suggestions', 'documents', 'users', 'groups'];
    const arrays = directArrayKeys
      .map((key) => obj[key])
      .filter(Array.isArray)
      .flatMap((value) => value as unknown[]);

    if (arrays.length > 0) return arrays;

    return Object.values(obj)
      .filter(Array.isArray)
      .flatMap((value) => value as unknown[]);
  }

  private mapSuggestion(value: unknown): GlobalSearchSuggestion | null {
    if (!value || typeof value !== 'object') return null;

    const item = value as Record<string, unknown>;
    const properties = (item['properties'] as Record<string, unknown> | undefined) ?? {};

    const typeValue = this.asString(item['type']) ?? this.asString(item['entity-type']) ?? '';
    const id =
      this.asString(item['id']) ??
      this.asString(item['uid']) ??
      this.asString(item['username']) ??
      this.asString(item['groupname']) ??
      this.asString(item['prefixed_id']);

    if (!id) return null;

    const displayLabel =
      this.asString(item['displayLabel']) ??
      this.asString(item['title']) ??
      this.asString(properties['dc:title']) ??
      id;

    const prefixedId = this.asString(item['prefixed_id']);
    const path =
      this.asString(item['path']) ??
      this.asString(properties['ecm:path']) ??
      this.asString(item['url']);
    const typeUpper = typeValue.toUpperCase();
    const isGroup =
      typeUpper.includes('GROUP') ||
      typeof item['groupname'] === 'string' ||
      prefixedId?.startsWith('group:') === true;
    const isUser =
      typeUpper.includes('USER') ||
      typeof item['username'] === 'string' ||
      prefixedId?.startsWith('user:') === true;
    const documentUid = this.asString(item['uid']) ?? (typeUpper.includes('DOCUMENT') ? id : undefined);

    return {
      id,
      displayLabel,
      kind: isGroup ? 'group' : isUser ? 'user' : documentUid ? 'document' : 'other',
      documentUid,
      path,
      prefixedId,
    };
  }

  private asString(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
}
