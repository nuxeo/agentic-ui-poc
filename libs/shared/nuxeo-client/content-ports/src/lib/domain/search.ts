/** Sort direction for a single sort key. */
export type SortDirection = 'asc' | 'desc';

/** One ordering clause: a field reference plus a direction. */
export interface SortSpec {
  readonly field: string;
  readonly direction: SortDirection;
}

/**
 * A backend-neutral page request. Offset paging is the common denominator across
 * backends; cursor paging, where an adapter supports it, is expressed through the
 * opaque {@link SearchResultPage.cursor} rather than a distinct request type.
 */
export interface PageRequest {
  readonly offset: number;
  readonly limit: number;
  readonly sort?: readonly SortSpec[];
  /** Opaque cursor from a prior page; adapters that do offset paging ignore it. */
  readonly cursor?: string;
}

/**
 * A single page of results. `total` is optional because not every backend returns
 * an exact count; callers MUST treat its absence as "unknown", never as zero.
 *
 * This shape carries no aggregation or facet buckets. That is a property of the
 * upstream contract, not an omission here — see the faceted-search note in
 * `AGENTS/00-architecture.md`.
 */
export interface SearchResultPage<T> {
  readonly items: readonly T[];
  readonly total?: number;
  readonly hasMore: boolean;
  /** Opaque cursor for the next page, when the adapter does cursor paging. */
  readonly cursor?: string;
}
