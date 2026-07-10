import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { NUXEO_API_ORIGIN } from '../nuxeo-api.config';
import { DirectoryService } from './directory.service';

describe('DirectoryService', () => {
  let service: DirectoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NUXEO_API_ORIGIN, useValue: '' },
      ],
    });

    service = TestBed.inject(DirectoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('creates a vocabulary entry via REST POST /directory/{name}/', async () => {
    const values = {
      id: 'contract',
      label: 'Contract',
      ordering: 10_000_000,
      obsolete: false,
    };

    const entry$ = firstValueFrom(service.createEntry('nature', values));
    const req = httpMock.expectOne('/nuxeo/api/v1/directory/nature/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      'entity-type': 'directoryEntry',
      directoryName: 'nature',
      properties: {
        id: 'contract',
        label: 'Contract',
        ordering: 10_000_000,
        obsolete: 0,
      },
    });
    req.flush({
      id: 'contract',
      directoryName: 'nature',
      properties: { id: 'contract', label: 'Contract', ordering: 10_000_000, obsolete: 0 },
    });

    const entry = await entry$;
    expect(entry.id).toBe('contract');
    expect(entry.label).toBe('Contract');
  });

  it('creates an l10n vocabulary entry with label_en and parent', async () => {
    const values = {
      id: 'topic-a',
      label: 'Topic A',
      ordering: 10_000_000,
      obsolete: false,
      parent: '',
    };

    const entry$ = firstValueFrom(service.createEntry('l10nsubjects', values));
    const req = httpMock.expectOne('/nuxeo/api/v1/directory/l10nsubjects/');
    expect(req.request.body).toEqual({
      'entity-type': 'directoryEntry',
      directoryName: 'l10nsubjects',
      properties: {
        id: 'topic-a',
        ordering: 10_000_000,
        obsolete: 0,
        label_en: 'Topic A',
        parent: '',
      },
    });
    req.flush({
      id: 'topic-a',
      directoryName: 'l10nsubjects',
      properties: {
        id: 'topic-a',
        label_en: 'Topic A',
        ordering: 10_000_000,
        obsolete: 0,
        parent: '',
      },
    });

    const entry = await entry$;
    expect(entry.label).toBe('Topic A');
  });

  it('updates a vocabulary entry via REST PUT /directory/{name}/{id}', async () => {
    const values = {
      id: 'contract',
      label: 'Updated Contract',
      ordering: 20,
      obsolete: true,
    };

    const entry$ = firstValueFrom(service.updateEntry('nature', 'contract', values));
    const req = httpMock.expectOne('/nuxeo/api/v1/directory/nature/contract');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      'entity-type': 'directoryEntry',
      directoryName: 'nature',
      id: 'contract',
      properties: {
        id: 'contract',
        label: 'Updated Contract',
        ordering: 20,
        obsolete: 1,
      },
    });
    req.flush({
      id: 'contract',
      directoryName: 'nature',
      properties: { id: 'contract', label: 'Updated Contract', ordering: 20, obsolete: 1 },
    });

    const entry = await entry$;
    expect(entry.obsolete).toBe(true);
  });

  it('deletes a vocabulary entry via REST DELETE /directory/{name}/{id}', async () => {
    const result$ = firstValueFrom(service.deleteEntry('nature', 'contract'));
    const req = httpMock.expectOne('/nuxeo/api/v1/directory/nature/contract');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    await expect(result$).resolves.toBeUndefined();
  });

  it('loads admin entries with pagination from REST GET /directory/{name}', async () => {
    const entries$ = firstValueFrom(service.getAdminEntries('nature'));

    const page0 = httpMock.expectOne(
      (r) => r.url === '/nuxeo/api/v1/directory/nature' && r.params.get('currentPageIndex') === '0',
    );
    page0.flush({
      entries: [
        {
          id: 'a',
          directoryName: 'nature',
          properties: { id: 'a', label: 'Alpha', ordering: 1, obsolete: 0 },
        },
      ],
      currentPageIndex: 0,
      isNextPageAvailable: true,
    });

    const page1 = httpMock.expectOne(
      (r) => r.url === '/nuxeo/api/v1/directory/nature' && r.params.get('currentPageIndex') === '1',
    );
    page1.flush({
      entries: [
        {
          id: 'b',
          directoryName: 'nature',
          properties: { id: 'b', label: 'Beta', ordering: 2, obsolete: 1 },
        },
      ],
      currentPageIndex: 1,
      isNextPageAvailable: false,
    });

    const entries = await entries$;
    expect(entries).toHaveLength(2);
    expect(entries[0].label).toBe('Alpha');
    expect(entries[1].obsolete).toBe(true);
  });
});
