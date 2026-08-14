import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, expect, it, afterEach, beforeEach } from 'vitest';
import { NuxeoQueryApi } from './nuxeo-query-api';
import { ROOT_DOCUMENT } from '../tokens/adf-hx-bridge.tokens';

describe('NuxeoQueryApi', () => {
  let api: NuxeoQueryApi;
  let httpMock: HttpTestingController;

  afterEach(() => {
    httpMock.verify();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NuxeoQueryApi],
    });
    api = TestBed.inject(NuxeoQueryApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('maps tree_children at repository root to nav bootstrap entries', async () => {
    const pending = api.getDocumentsByNamedQuery({
      queryName: 'tree_children',
      parameters: { parentId: ROOT_DOCUMENT.sys_id },
      limit: 50,
      offset: 0,
    });

    const rootReq = httpMock.expectOne((r) => r.url.includes('/nuxeo/api/v1/path/'));
    rootReq.flush({
      uid: 'root-uid',
      title: 'Root',
      type: 'Root',
      path: '/',
      lastModified: '2026-01-01T00:00:00.000Z',
      properties: {},
    });

    const treeReq = httpMock.expectOne((r) =>
      r.url.includes('/nuxeo/api/v1/search/pp/tree_children/execute'),
    );
    treeReq.flush({
      entries: [
        {
          uid: 'domain-1',
          title: 'Default Domain',
          type: 'Domain',
          path: '/default-domain',
          lastModified: '2026-01-01T00:00:00.000Z',
          properties: {},
        },
      ],
      totalSize: 1,
    });

    const response = await pending;
    expect(response.data.documents).toHaveLength(1);
    expect(response.data.documents?.[0]?.sys_title).toBe('Default Domain');
    expect(response.data.documents?.[0]?.sys_isFolderish).toBe(true);
  });
});
