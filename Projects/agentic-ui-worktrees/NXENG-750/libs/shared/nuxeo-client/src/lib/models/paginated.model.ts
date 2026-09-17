export interface NuxeoPaginatedList<T> {
  entries: T[];
  totalSize: number;
  resultsCount?: number;
  currentPageSize: number;
  currentPageIndex: number;
  numberOfPages: number;
  /**
   * Whether another page exists.
   *
   * The fact to build a pager on. Nuxeo counts only within `resultsCountLimit`, which it sets to
   * the requested `pageSize`, so `resultsCount` is a real total **only when the result set fits on
   * one page** — precisely when paging is unnecessary. This flag is accurate either way.
   */
  isNextPageAvailable?: boolean;
}
