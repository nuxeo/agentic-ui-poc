/** Pagination metadata returned by Nuxeo paginable list endpoints. */
export interface PaginatedListMeta {
    totalSize?: number;
    resultsCount?: number;
    entries?: unknown[];
    numberOfPages?: number;
    currentPageSize?: number;
    currentPageIndex?: number;
    isNextPageAvailable?: boolean;
}
/**
 * Resolves the total item count for Material paginator `[length]`.
 * Nuxeo may return `resultsCount` instead of or alongside `totalSize`; when both are
 * present, use the larger value so the paginator never under-counts. When both are absent,
 * derive a usable length from `numberOfPages` or `isNextPageAvailable`.
 */
export declare function resolvePaginatedListTotal(res: PaginatedListMeta, pageSize: number, pageIndex: number): number;
//# sourceMappingURL=paginated-total.d.ts.map