import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { NUXEO_API_ORIGIN } from '../nuxeo-api.config';
import { ContentLakeIngestService } from './content-lake-ingest.service';

describe('ContentLakeIngestService', () => {
  let service: ContentLakeIngestService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NUXEO_API_ORIGIN, useValue: '' },
      ],
    });

    service = TestBed.inject(ContentLakeIngestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('starts a bulk ingest for one document', async () => {
    const command$ = firstValueFrom(service.startIngest(['doc-uuid-1']));
    const req = httpMock.expectOne('/nuxeo/api/v1/automation/Bulk.RunAction');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      params: {
        action: 'ingest',
        query: "SELECT * FROM Document WHERE ecm:uuid = 'doc-uuid-1'",
      },
      context: {},
    });
    req.flush({ commandId: 'bulk-123' });

    await expect(command$).resolves.toEqual({ commandId: 'bulk-123' });
  });

  it('reads commandId from Nuxeo automation bulkStatus value wrapper', async () => {
    const command$ = firstValueFrom(service.startIngest(['doc-uuid-1']));
    const req = httpMock.expectOne('/nuxeo/api/v1/automation/Bulk.RunAction');
    req.flush({
      'entity-type': 'bulkStatus',
      value: {
        'entity-type': 'bulkStatus',
        commandId: 'bulk-456',
        state: 'SCHEDULED',
      },
    });

    await expect(command$).resolves.toEqual({ commandId: 'bulk-456' });
  });

  it('surfaces Nuxeo automation exceptions from bulk ingest', async () => {
    const command$ = firstValueFrom(service.startIngest(['doc-uuid-1']));
    const req = httpMock.expectOne('/nuxeo/api/v1/automation/Bulk.RunAction');
    req.flush({
      'entity-type': 'exception',
      status: 400,
      message: 'Unknown bulk action: ingest',
    });

    await expect(command$).rejects.toThrow('Unknown bulk action: ingest');
  });

  it('reads bulk status', async () => {
    const status$ = firstValueFrom(service.getStatus('bulk-123'));
    const req = httpMock.expectOne('/nuxeo/api/v1/bulk/bulk-123');
    req.flush({ state: 'COMPLETED', processed: 1, error: false, errorCount: 0 });

    await expect(status$).resolves.toEqual({
      commandId: 'bulk-123',
      state: 'COMPLETED',
      processed: 1,
      error: false,
      errorCount: 0,
    });
  });

  it('waitUntilComplete resolves on a terminal status', async () => {
    const status$ = firstValueFrom(service.waitUntilComplete('bulk-123'));
    const req = httpMock.expectOne('/nuxeo/api/v1/bulk/bulk-123');
    req.flush({ state: 'COMPLETED', processed: 1, error: false, errorCount: 0 });

    await expect(status$).resolves.toEqual({
      commandId: 'bulk-123',
      state: 'COMPLETED',
      processed: 1,
      error: false,
      errorCount: 0,
    });
  });
});
