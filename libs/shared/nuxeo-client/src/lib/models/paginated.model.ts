export interface NuxeoPaginatedList<T> {
  entries: T[];
  totalSize: number;
  resultsCount?: number;
  currentPageSize: number;
  currentPageIndex: number;
  numberOfPages: number;
}
