import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { NUXEO_API_ORIGIN } from '../nuxeo-api.config';
import type { NuxeoDocument } from '../models/document.model';
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

  it('getNavTreeChildren uses @children for Domain parents', async () => {
    const domain: NuxeoDocument = {
      uid: 'domain-uid',
      title: 'Domain-1',
      type: 'Domain',
      path: '/domain-1',
      lastModified: '2026-01-01T00:00:00.000Z',
      properties: {},
    };
    const result$ = firstValueFrom(service.getNavTreeChildren(domain));

    const req = httpMock.expectOne(
      (r) => r.url === '/nuxeo/api/v1/path/domain-1/@children' && r.params.get('pageSize') === '50',
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      entries: [
        {
          uid: 'ws-root',
          title: 'Workspaces',
          type: 'WorkspaceRoot',
          path: '/domain-1/workspaces',
          properties: {},
        },
        { uid: 'file-1', title: 'Readme', type: 'File', path: '/domain-1/readme', properties: {} },
      ],
      totalSize: 2,
      currentPageSize: 2,
      currentPageIndex: 0,
      numberOfPages: 1,
    });

    const result = await result$;
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].type).toBe('WorkspaceRoot');
  });

  it('getNavTreeChildren uses tree_children for workspace folders', async () => {
    const workspace: NuxeoDocument = {
      uid: 'ws-uid',
      title: 'Marketing',
      type: 'Workspace',
      path: '/domain-1/workspaces/marketing',
      lastModified: '2026-01-01T00:00:00.000Z',
      properties: {},
    };
    const result$ = firstValueFrom(service.getNavTreeChildren(workspace));

    const req = httpMock.expectOne(
      (r) =>
        r.url === '/nuxeo/api/v1/search/pp/tree_children/execute' &&
        r.params.get('queryParams') === 'ws-uid',
    );
    req.flush({
      entries: [],
      totalSize: 0,
      currentPageSize: 0,
      currentPageIndex: 0,
      numberOfPages: 1,
      isNextPageAvailable: false,
    });

    await result$;
  });
});
