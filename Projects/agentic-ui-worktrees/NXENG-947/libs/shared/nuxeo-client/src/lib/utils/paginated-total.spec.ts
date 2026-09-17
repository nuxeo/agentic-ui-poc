import { describe, expect, it } from 'vitest';

import { resolvePaginatedListTotal } from './paginated-total';

describe('resolvePaginatedListTotal', () => {
  const pageSize = 5;

  it('prefers totalSize when present', () => {
    expect(
      resolvePaginatedListTotal({ totalSize: 14, entries: [{}, {}, {}, {}, {}] }, pageSize, 0),
    ).toBe(14);
  });

  it('falls back to resultsCount when totalSize is absent', () => {
    expect(
      resolvePaginatedListTotal({ resultsCount: 14, entries: [{}, {}, {}, {}, {}] }, pageSize, 0),
    ).toBe(14);
  });

  it('uses the larger value when totalSize and resultsCount disagree', () => {
    expect(
      resolvePaginatedListTotal(
        { totalSize: 5, resultsCount: 14, entries: [{}, {}, {}, {}, {}] },
        pageSize,
        0,
      ),
    ).toBe(14);
    expect(
      resolvePaginatedListTotal(
        { totalSize: 14, resultsCount: 5, entries: [{}, {}, {}, {}, {}] },
        pageSize,
        0,
      ),
    ).toBe(14);
  });

  it('uses numberOfPages on the last page when metadata is partial', () => {
    expect(
      resolvePaginatedListTotal(
        {
          entries: [{}, {}, {}, {}],
          numberOfPages: 3,
          currentPageSize: 4,
          isNextPageAvailable: false,
        },
        pageSize,
        2,
      ),
    ).toBe(14);
  });

  it('enables next page when only isNextPageAvailable is set (NXSAT-155 regression)', () => {
    expect(
      resolvePaginatedListTotal(
        {
          entries: [{}, {}, {}, {}, {}],
          isNextPageAvailable: true,
        },
        pageSize,
        0,
      ),
    ).toBe(10);
  });

  it('returns exact count on final page without total metadata', () => {
    expect(
      resolvePaginatedListTotal(
        {
          entries: [{}, {}, {}, {}],
          isNextPageAvailable: false,
        },
        pageSize,
        2,
      ),
    ).toBe(14);
  });

  it('falls back to current page entry count when no pagination metadata exists', () => {
    expect(resolvePaginatedListTotal({ entries: [{}, {}, {}] }, pageSize, 0)).toBe(3);
  });
});
