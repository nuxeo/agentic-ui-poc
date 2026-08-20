import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NUXEO_API_ORIGIN, type NuxeoDocument } from '@agentic-ui/shared/nuxeo-client';
import { DC, type ContentError } from '@agentic-ui/shared/content-ports';

import { NuxeoDocumentAdapter } from './nuxeo-document.adapter';

const DOC: NuxeoDocument = {
  uid: 'uid-1',
  title: 'Report',
  type: 'File',
  path: '/default-domain/report',
  lastModified: '2026-02-01T10:00:00.000Z',
  properties: { 'dc:title': 'Report', 'dc:creator': 'alice' },
};

describe('NuxeoDocumentAdapter', () => {
  let adapter: NuxeoDocumentAdapter;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NUXEO_API_ORIGIN, useValue: '' },
      ],
    });
    adapter = TestBed.inject(NuxeoDocumentAdapter);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('fetches a document by id and returns a neutral node', () => {
    let name: string | undefined;
    adapter.getById('uid-1').subscribe((node) => (name = node.name));

    const request = httpMock.expectOne((r) => r.url.endsWith('/nuxeo/api/v1/id/uid-1'));
    expect(request.request.method).toBe('GET');
    request.flush(DOC);

    expect(name).toBe('Report');
  });

  it('creates a child from a neutral draft, flattening namespaced properties', () => {
    adapter
      .createUnderParent('parent-1', {
        name: 'New Folder',
        primaryType: 'Folder',
        properties: [{ namespace: DC, key: 'description', value: 'notes' }],
      })
      .subscribe();

    const request = httpMock.expectOne((r) => r.url.endsWith('/nuxeo/api/v1/id/parent-1'));
    expect(request.request.body).toMatchObject({
      'entity-type': 'document',
      name: 'New Folder',
      type: 'Folder',
      properties: { 'dc:title': 'New Folder', 'dc:description': 'notes' },
    });
    request.flush(DOC);
  });

  it('pages children through offset-to-page-index translation', () => {
    adapter.listChildren('parent-1', { offset: 40, limit: 20 }).subscribe();

    const request = httpMock.expectOne((r) => r.url.includes('/@children'));
    expect(request.request.params.get('currentPageIndex')).toBe('2');
    expect(request.request.params.get('pageSize')).toBe('20');
    request.flush({
      entries: [DOC],
      totalSize: 1,
      resultsCount: 1,
      currentPageSize: 1,
      currentPageIndex: 2,
      numberOfPages: 3,
    });
  });

  it('rejects getWithRendition because Nuxeo renditions need authenticated fetches', () => {
    let captured: ContentError | undefined;
    adapter.getWithRendition('uid-1', { kind: 'thumbnail' }).subscribe({
      error: (error: ContentError) => (captured = error),
    });

    expect(captured?.kind).toBe('UnsupportedEnrichment');
    expect(adapter.capabilities().enrichments.rendition.supportedKinds).toEqual([]);
  });

  it('maps a 404 onto NotFound rather than leaking the HTTP status', () => {
    let captured: ContentError | undefined;
    adapter.getById('missing').subscribe({ error: (error: ContentError) => (captured = error) });

    httpMock
      .expectOne((r) => r.url.endsWith('/nuxeo/api/v1/id/missing'))
      .flush('', { status: 404, statusText: 'Not Found' });

    expect(captured?.kind).toBe('NotFound');
  });

  it('reads a breadcrumb through the Nuxeo enricher', () => {
    let steps: readonly { id: string }[] = [];
    adapter.getWithBreadcrumb('uid-1').subscribe((node) => (steps = node.breadcrumb));

    const request = httpMock.expectOne((r) => r.url.endsWith('/nuxeo/api/v1/id/uid-1'));
    expect(request.request.headers.get('enrichers-document')).toBe('breadcrumb');
    request.flush({
      ...DOC,
      contextParameters: {
        breadcrumb: { entries: [{ ...DOC, uid: 'root', title: 'Domain', facets: ['Folderish'] }] },
      },
    });

    expect(steps).toEqual([{ id: 'root', name: 'Domain', isFolderish: true }]);
  });
});
