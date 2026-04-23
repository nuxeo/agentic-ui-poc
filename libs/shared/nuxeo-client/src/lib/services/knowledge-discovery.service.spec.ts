import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { NUXEO_API_ORIGIN } from '../nuxeo-api.config';
import { KnowledgeDiscoveryService } from './knowledge-discovery.service';

describe('KnowledgeDiscoveryService', () => {
  let service: KnowledgeDiscoveryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NUXEO_API_ORIGIN, useValue: '' },
      ],
    });

    service = TestBed.inject(KnowledgeDiscoveryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should post to the Knowledge Discovery automation endpoint and normalize the response', () => {
    service.query({ query: 'renewal clauses', limit: 3 }).subscribe((response) => {
      expect(response.answer).toContain('renewal');
      expect(response.status).toBe('Complete');
      expect(response.items).toHaveLength(1);
      expect(response.items[0]?.id).toBe('doc-123');
      expect(response.sources[0]?.objectId).toBe('doc-123');
      expect(response.sources[0]?.excerpt).toContain('renewal terms');
    });

    const req = httpMock.expectOne('/nuxeo/api/v1/automation/KnowledgeDiscovery.Query');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.params.query).toBe('renewal clauses');
    expect(req.request.body.params.limit).toBe(3);

    req.flush({
      answer: 'The renewal clause appears in the master services agreement.',
      responseCompleteness: 'Complete',
      items: [
        {
          uid: 'doc-123',
          title: 'MSA',
          type: 'File',
          path: '/default-domain/workspaces/msa.pdf',
          modifiedDate: '2026-04-22T10:00:00.000Z',
          author: 'Administrator',
          lastContributor: 'Administrator',
        },
      ],
      objectReferences: [
        {
          objectId: 'doc-123',
          objectTitle: 'MSA',
          path: '/default-domain/workspaces/msa.pdf',
          references: [
            {
              referenceId: 'section-4',
              rankScore: 0.98,
              content: 'The agreement includes renewal terms for successive one-year periods.',
            },
          ],
        },
      ],
    });
  });

  it('should propagate server errors', () => {
    service.query({ query: 'renewal clauses' }).subscribe({
      next: () => fail('expected request to fail'),
      error: (err) => expect(err.status).toBe(404),
    });

    const req = httpMock.expectOne('/nuxeo/api/v1/automation/KnowledgeDiscovery.Query');
    req.flush('Missing endpoint', { status: 404, statusText: 'Not Found' });
  });
});
