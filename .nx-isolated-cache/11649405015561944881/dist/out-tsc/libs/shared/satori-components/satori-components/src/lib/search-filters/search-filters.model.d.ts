import type { AggregateResult, SearchQueryParams } from '@nuxeo/satori-platform/nuxeo-client';
/**
 * The values of the search filters: what `nxs-search-filters` edits and a host turns into a query.
 *
 * Each field is one of `default_search`'s parameters. A multi-value field holds the bucket keys the
 * server's aggregate returns, and an empty string or list means "not filtered".
 */
export interface NxsSearchFilters {
    /** Full text, sent as `ecm_fulltext`. */
    readonly fulltext: string;
    /** Modification-date ranges, the `dc_modified_agg` buckets — see {@link NXS_MODIFIED_RANGES}. */
    readonly modified: readonly string[];
    /** Authors' usernames, the `dc_creator_agg` buckets. */
    readonly authors: readonly string[];
    /** Collection ids, sent as `ecm_collections`. */
    readonly collections: readonly string[];
    /** Tag labels, sent as `ecm_tags`. */
    readonly tags: readonly string[];
    /** Nature vocabulary ids, the `dc_nature_agg` buckets. */
    readonly nature: readonly string[];
    /** Subject vocabulary ids, the `dc_subjects_agg` buckets. */
    readonly subjects: readonly string[];
    /** Coverage vocabulary ids, the `dc_coverage_agg` buckets. */
    readonly coverage: readonly string[];
    /** File-size ranges, the `common_size_agg` buckets — see {@link NXS_SIZE_RANGES}. */
    readonly size: readonly string[];
    /**
     * The page provider's `query` parameter. No field edits it; it is kept so a saved search that
     * carries one keeps it when it is loaded and saved again.
     */
    readonly query: string;
}
/** No filter set. */
export declare const NXS_EMPTY_SEARCH_FILTERS: NxsSearchFilters;
/** The `dc_modified_agg` buckets `default_search` defines, in the order they are offered. */
export declare const NXS_MODIFIED_RANGES: readonly ["last24h", "lastWeek", "lastMonth", "lastYear", "priorToLastYear"];
/** The `common_size_agg` buckets `default_search` defines, in the order they are offered. */
export declare const NXS_SIZE_RANGES: readonly ["tiny", "small", "medium", "big", "huge"];
/** One choice in a filter group: a bucket key, and how many results fall in it. */
export interface NxsFacetOption {
    readonly value: string;
    /** Results in the bucket, as the server counted them; `null` when the server sent no bucket. */
    readonly count: number | null;
}
/**
 * Display text for facet choices, by checkbox field and bucket key: the vocabulary label of a nature,
 * subject or coverage id. It changes only what is shown; the filter keeps the key.
 */
export type NxsFacetLabels = Readonly<Partial<Record<string, Readonly<Record<string, string>>>>>;
/**
 * The filters as the record a host keeps them in — `SearchAggregationService.drawerFilters` — with
 * a multi-value field as a JSON array, so a value containing a comma stays one value, and an empty
 * field left out.
 */
export declare function nxsSearchFiltersToRecord(filters: NxsSearchFilters): Record<string, string>;
/**
 * The filters as a saved search's `params`, under `default_search`'s own parameter names — the ones
 * Web UI writes, so either application opens a search the other saved. A multi-value field is a JSON
 * array, which the server stores as a list.
 *
 * Every parameter is written, an empty one as `""` or `[]`, as Web UI writes its whole form: the
 * server merges an update's `params` into the ones it holds, so a filter left out would stay saved.
 * `q`, which no field edits, is written only when set.
 *
 * Not {@link nxsSearchFiltersToRecord}'s names: the server maps a parameter onto the saved search's
 * own fields by name, and refuses `subjects` and `size`, which collide with `dc:subjects` and the
 * removed `common:size`.
 */
export declare function nxsSearchFiltersToSavedParams(filters: NxsSearchFilters): Record<string, string>;
/**
 * The params that clear every fallback key a saved search was read with, to send beside
 * {@link nxsSearchFiltersToSavedParams} when it is saved again.
 *
 * The server merges an update into the stored params, so a search saved under an earlier name
 * (`author: "alice"`) kept that key: with its author removed and saved, it read back from the old key
 * and the author returned. Once saved, the page provider's own key holds the value.
 */
export declare function nxsSavedParamsToClear(loaded: Readonly<Record<string, unknown>> | null | undefined): Record<string, string>;
/** The filters as `SearchService.search`'s parameters, with the page's quick filters and sort. */
export declare function nxsSearchFiltersToQuery(filters: NxsSearchFilters, page?: {
    quickFilters?: string;
    sortBy?: string | null;
    sortOrder?: 'asc' | 'desc' | null;
}): SearchQueryParams;
/**
 * Filters read back from a saved search's parameters, or from the record a host keeps them in.
 *
 * Reads the page-provider keys {@link nxsSearchFiltersToSavedParams} and Web UI write
 * (`dc_modified_agg`, `ecm_collections`, …) and the record keys {@link nxsSearchFiltersToRecord}
 * writes, which earlier saved searches also carry, with or without a `defaults:` prefix. Where both
 * are present the page-provider key wins, as the server applies it. A value may be a string, a
 * comma-separated string, a JSON array in a string, or an array, whose entries may be strings,
 * numbers, or objects with a string `id` or `uid` — the collection entries Web UI keeps; anything else
 * is ignored. The earlier `moreThan1YearAgo` range reads as `priorToLastYear`.
 */
export declare function nxsSearchFiltersFromParams(params: Readonly<Record<string, unknown>> | null | undefined): NxsSearchFilters;
/** Whether any filter is set. */
export declare function nxsHasSearchFilters(filters: NxsSearchFilters): boolean;
/** Whether two sets of filters ask for the same results: the order within a field does not count. */
export declare function nxsSameSearchFilters(a: NxsSearchFilters, b: NxsSearchFilters): boolean;
/**
 * The choices for a range filter: every range, in order, with the server's count for it.
 *
 * Every range is offered whatever the counts, as Web UI's checkbox aggregation does, so a range that
 * is selected but now empty can still be cleared.
 */
export declare function nxsRangeOptions(ranges: readonly string[], aggregation: AggregateResult | undefined): NxsFacetOption[];
/**
 * The choices for a terms filter: the server's buckets with results, then any selected value the
 * server no longer returns, so it can be cleared.
 */
export declare function nxsTermOptions(aggregation: AggregateResult | undefined, selected: readonly string[]): NxsFacetOption[];
//# sourceMappingURL=search-filters.model.d.ts.map