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
export function resolvePaginatedListTotal(
  res: PaginatedListMeta,
  pageSize: number,
  pageIndex: number,
): number {
  const knownTotals = [res.totalSize, res.resultsCount].filter(
    (n): n is number => n !== undefined && n >= 0,
  );
  if (knownTotals.length > 0) {
    return Math.max(...knownTotals);
  }

  const entryCount = res.entries?.length ?? 0;
  const currentPageSize = res.currentPageSize ?? entryCount;

  if (res.numberOfPages !== undefined && res.numberOfPages > 0) {
    if (!res.isNextPageAvailable || pageIndex >= res.numberOfPages - 1) {
      return (res.numberOfPages - 1) * pageSize + currentPageSize;
    }
    return res.numberOfPages * pageSize;
  }

  if (res.isNextPageAvailable) {
    return (pageIndex + 2) * pageSize;
  }

  return pageIndex * pageSize + entryCount;
}
