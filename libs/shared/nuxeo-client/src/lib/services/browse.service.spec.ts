import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { NUXEO_API_ORIGIN } from '../nuxeo-api.config';
import { BrowseService } from './browse.service';

describe('BrowseService', () => {
  let service: BrowseService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NUXEO_API_ORIGIN, useValue: '' },
      ],
    });

    service = TestBed.inject(BrowseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getTreeChildren calls tree_children page provider with parent uid', async () => {
    const parentUid = '00000000-0000-0000-0000-000000000001';
    const result$ = firstValueFrom(service.getTreeChildren(parentUid));

    const req = httpMock.expectOne(
      (r) =>
        r.url === '/nuxeo/api/v1/search/pp/tree_children/execute' &&
        r.params.get('queryParams') === parentUid &&
        r.params.get('pageSize') === '50' &&
        r.params.get('currentPageIndex') === '0',
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('properties')).toBe('*');
    req.flush({
      entries: [
        { uid: 'domain-1', title: 'Domain', type: 'Domain', path: '/domain', properties: {} },
      ],
      totalSize: 1,
      currentPageSize: 1,
      currentPageIndex: 0,
      numberOfPages: 1,
      isNextPageAvailable: false,
    });

    const result = await result$;
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].uid).toBe('domain-1');
  });

  it('getTreeChildren fetches additional pages when isNextPageAvailable is true', async () => {
    const parentUid = 'root-uid';
    const result$ = firstValueFrom(service.getTreeChildren(parentUid, 2));

    const page0 = httpMock.expectOne(
      (r) => r.url.includes('/tree_children/execute') && r.params.get('currentPageIndex') === '0',
    );
    page0.flush({
      entries: [
        { uid: 'd1', title: 'Domain', type: 'Domain', path: '/domain', properties: {} },
        { uid: 'd2', title: 'Domain-1', type: 'Domain', path: '/domain-1', properties: {} },
      ],
      totalSize: 3,
      currentPageSize: 2,
      currentPageIndex: 0,
      numberOfPages: 2,
      isNextPageAvailable: true,
    });

    const page1 = httpMock.expectOne(
      (r) => r.url.includes('/tree_children/execute') && r.params.get('currentPageIndex') === '1',
    );
    page1.flush({
      entries: [
        { uid: 'd3', title: 'Domain-2', type: 'Domain', path: '/domain-2', properties: {} },
      ],
      totalSize: 3,
      currentPageSize: 1,
      currentPageIndex: 1,
      numberOfPages: 2,
      isNextPageAvailable: false,
    });

    const result = await result$;
    expect(result.entries.map((e) => e.uid)).toEqual(['d1', 'd2', 'd3']);
    expect(result.totalSize).toBe(3);
  });
});
