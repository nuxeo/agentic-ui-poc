import type { Observable } from 'rxjs';
import type { ContentNode } from '../domain/content-node';
import type { PageRequest, SearchResultPage } from '../domain/search';
import type { SearchCapabilities } from './capabilities';
import type { FilterSpec } from './filter-spec';
import type { NamedQueryKey } from './named-queries';

/**
 * The hybrid search surface: named queries are the primary path, the bounded filter
 * DSL is the escape hatch. Callers pre-flight optional named queries against
 * {@link SearchCapabilities.supportedNamedQueries}.
 *
 * Deliberately carries no aggregation or facet surface. Our faceted search does not
 * run through this port — see `AGENTS/00-architecture.md`.
 */
export interface SearchPort {
  runNamedQuery<TParams, TRow>(
    key: NamedQueryKey<TParams, TRow>,
    params: TParams,
    page: PageRequest,
  ): Observable<SearchResultPage<TRow>>;
  runFilter<TRow = ContentNode>(
    spec: FilterSpec<TRow>,
    page: PageRequest,
  ): Observable<SearchResultPage<TRow>>;
  capabilities(): SearchCapabilities;
}
