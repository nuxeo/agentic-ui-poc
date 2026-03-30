export interface NuxeoPaginatedList<T> {
  entries: T[];
  totalSize: number;
  currentPageSize: number;
  currentPageIndex: number;
  numberOfPages: number;
}
