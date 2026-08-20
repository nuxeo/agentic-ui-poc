import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NUXEO_API_ORIGIN } from '@agentic-ui/shared/nuxeo-client';
import {
  ContentError,
  allContentOfFolder,
  childrenOfFolder,
  collectionMembers,
  namedQuery,
  trashedChildrenOfFolder,
  versionsOfDocument,
} from '@agentic-ui/shared/content-ports';

import { NuxeoSearchAdapter } from './nuxeo-search.adapter';

const PAGE = { offset: 0, limit: 20 };

describe('NuxeoSearchAdapter', () => {
  let adapter: NuxeoSearchAdapter;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NUXEO_API_ORIGIN, useValue: '' },
      ],
    });
    adapter = TestBed.inject(NuxeoSearchAdapter);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function captureQuery(): string {
    const request = httpMock.expectOne((r) => r.url.includes('/search/lang/NXQL/execute'));
    const query = request.request.params.get('query') ?? '';
    request.flush({
      entries: [],
      totalSize: 0,
      resultsCount: 0,
      currentPageSize: 0,
      currentPageIndex: 0,
      numberOfPages: 0,
    });
    return query;
  }

  it.each([
    [childrenOfFolder, { parentId: 'p1' }, "ecm:parentId = 'p1' AND ecm:isTrashed = 0"],
    [allContentOfFolder, { parentId: 'p1' }, "ecm:ancestorId = 'p1' AND ecm:isTrashed = 0"],
    [
      versionsOfDocument,
      { documentId: 'd1' },
      "ecm:versionVersionableId = 'd1' AND ecm:isVersion = 1",
    ],
    [trashedChildrenOfFolder, { parentId: 'p1' }, "ecm:parentId = 'p1' AND ecm:isTrashed = 1"],
  ])('compiles the %# named query to NXQL', (key, params, expected) => {
    adapter.runNamedQuery(key as never, params as never, PAGE).subscribe();
    expect(captureQuery()).toBe(`SELECT * FROM Document WHERE ${expected}`);
  });

  it('compiles the collection-members query', () => {
    adapter.runNamedQuery(collectionMembers, { collectionId: 'c1' }, PAGE).subscribe();
    expect(captureQuery()).toContain("collectionMember:collectionIds/* = 'c1'");
  });

  it('rejects a named query the adapter does not implement', () => {
    const unknown = namedQuery<{ parentId: string }, unknown>('not-implemented');
    expect(() => adapter.runNamedQuery(unknown, { parentId: 'p1' }, PAGE)).toThrow(ContentError);
  });

  it('declares only the named queries it actually implements', () => {
    const supported = adapter.capabilities().supportedNamedQueries;
    expect(supported.has(childrenOfFolder.key)).toBe(true);
    expect(supported.has('not-implemented')).toBe(false);
  });

  it('compiles a filter spec and appends a translated sort', () => {
    adapter
      .runFilter(
        { kind: 'eq', field: 'dc:creator', value: 'alice' },
        {
          ...PAGE,
          sort: [{ field: 'modifiedAt', direction: 'desc' }],
        },
      )
      .subscribe();

    expect(captureQuery()).toBe(
      "SELECT * FROM Document WHERE dc:creator = 'alice' ORDER BY dc:modified DESC",
    );
  });

  it('rejects a sort key it cannot translate rather than dropping it', () => {
    expect(() =>
      adapter.runFilter(
        { kind: 'eq', field: 'dc:creator', value: 'alice' },
        {
          ...PAGE,
          sort: [{ field: 'primaryType', direction: 'asc' }],
        },
      ),
    ).toThrow(/cannot sort on 'primaryType'/);
  });

  it('maps a transport failure onto the neutral error taxonomy', () => {
    let captured: ContentError | undefined;
    adapter.runFilter({ kind: 'fullText', query: 'x' }, PAGE).subscribe({
      error: (error: ContentError) => (captured = error),
    });

    httpMock
      .expectOne((r) => r.url.includes('/search/lang/NXQL/execute'))
      .flush('', { status: 403, statusText: 'Forbidden' });

    expect(captured?.kind).toBe('PermissionDenied');
  });
});
