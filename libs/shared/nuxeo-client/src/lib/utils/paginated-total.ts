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
 * Nuxeo may return `resultsCount` instead of `totalSize`; when both are absent,
 * derive a usable length from `numberOfPages` or `isNextPageAvailable`.
 */
export function resolvePaginatedListTotal(
  res: PaginatedListMeta,
  pageSize: number,
  pageIndex: number,
): number {
  if (res.totalSize !== undefined && res.totalSize >= 0) {
    return res.totalSize;
  }
  if (res.resultsCount !== undefined && res.resultsCount >= 0) {
    return res.resultsCount;
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
