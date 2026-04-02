import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import type { NuxeoDocumentList } from '../models/document.model';
import type { AggregateResult } from '../models/asset.model';
import type { SearchAggregations, SearchResponse, SearchResultItem } from '../models/search.model';
import { NuxeoApiBase } from './nuxeo-api-base';
import { docTypeIcon } from '../constants/doc-type-icons';

export interface SearchQueryParams {
  q?: string;
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

interface SearchApiResponse extends NuxeoDocumentList {
  aggregations?: Record<string, { buckets?: Array<{ key?: string; docCount?: number; doc_count?: number }> }>;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly api = inject(NuxeoApiBase);

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

  search(params: SearchQueryParams): Observable<SearchResponse> {
    const {
      q = '',
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
}
