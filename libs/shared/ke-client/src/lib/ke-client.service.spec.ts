import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { NUXEO_API_ORIGIN } from '@agentic-ui/shared/nuxeo-client';

import { DEFAULT_KE_CIC_OPERATIONS, KE_CIC_OPERATIONS } from './ke.config';
import { KeClientService, KeEnrichmentError } from './ke-client.service';

describe('KeClientService', () => {
  let service: KeClientService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NUXEO_API_ORIGIN, useValue: '' },
        { provide: KE_CIC_OPERATIONS, useValue: DEFAULT_KE_CIC_OPERATIONS },
      ],
    });

    service = TestBed.inject(KeClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function expectEnrichRequest() {
    const req = httpMock.expectOne(
      `/nuxeo/site/automation/${encodeURIComponent(DEFAULT_KE_CIC_OPERATIONS.enrich)}`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    return req;
  }

  it('posts multipart form data to the KE enrich operation', async () => {
    const blob = new Blob(['hello world'], { type: 'text/plain' });
    const result$ = firstValueFrom(
      service.enrich(blob, {
        actions: ['text-summarization'],
        sourceId: 'doc-1',
        maxWordCount: 100,
      }),
    );

    const req = expectEnrichRequest();
    const requestBody = req.request.body as FormData;
    const requestBlob = requestBody.get('request');
    const inputBlob = requestBody.get('input');

    expect(requestBlob).toBeTruthy();
    expect(inputBlob).toBeTruthy();
    expect(inputBlob).toBeInstanceOf(File);
    req.flush(
      JSON.stringify({
        id: 'job-1',
        status: 'Complete',
        inProgress: false,
        results: [
          {
            objectKey: 'documents/doc-1.pdf',
            textSummary: { isSuccess: true, result: 'Summary text' },
          },
        ],
      }),
    );

    const result = await result$;
    expect(result.requestId).toBe('job-1');
    expect(result.objectKey).toBe('documents/doc-1.pdf');
    expect(result.textSummary?.result).toBe('Summary text');
  });

  it('parses named entity outputs from the Context API result payload', async () => {
    const result$ = firstValueFrom(
      service.enrich(new Blob(['img'], { type: 'image/png' }), {
        actions: ['named-entity-recognition-image'],
      }),
    );

    const req = expectEnrichRequest();
    req.flush(
      JSON.stringify({
        inProgress: false,
        results: [
          {
            namedEntityImage: {
              isSuccess: true,
              result: {
                ORGANIZATION: ['Hyland', 'Hyland'],
                LOCATION: ['Cleveland'],
              },
            },
          },
        ],
      }),
    );

    const result = await result$;
    expect(result.namedEntityImage?.result).toEqual({
      ORGANIZATION: ['Hyland'],
      LOCATION: ['Cleveland'],
    });
  });

  it('serializes classification classes as a comma-separated list', async () => {
    const result$ = firstValueFrom(
      service.enrich(new Blob(['test'], { type: 'application/pdf' }), {
        actions: ['text-classification'],
        classes: ['Contract', 'Invoice', 'Legal'],
      }),
    );

    const req = expectEnrichRequest();
    const requestBody = req.request.body as FormData;
    const requestBlob = requestBody.get('request');
    expect(requestBlob).toBeInstanceOf(Blob);

    const requestJson = JSON.parse(await (requestBlob as Blob).text()) as {
      params: { classes?: string };
    };
    expect(requestJson.params.classes).toBe('Contract, Invoice, Legal');

    const inputBlob = requestBody.get('input');
    expect(inputBlob).toBeInstanceOf(File);
    expect((inputBlob as File).name).toBe('knowledge-enrichment-input.pdf');

    req.flush(
      JSON.stringify({
        inProgress: false,
        results: [{ textClassification: { isSuccess: true, result: 'Invoice' } }],
      }),
    );

    const result = await result$;
    expect(result.textClassification?.result).toBe('Invoice');
  });

  it('unwraps the generic connector response envelope when present', async () => {
    const result$ = firstValueFrom(
      service.enrich(new Blob(['test'], { type: 'text/plain' }), {
        actions: ['text-classification'],
      }),
    );

    const req = expectEnrichRequest();
    req.flush(
      JSON.stringify({
        responseCode: 200,
        responseMessage: 'OK',
        response: {
          inProgress: false,
          results: [
            {
              textClassification: { isSuccess: true, result: 'Contract' },
            },
          ],
        },
      }),
    );

    const result = await result$;
    expect(result.textClassification?.result).toBe('Contract');
  });

  it('surfaces connector errors as KeEnrichmentError', async () => {
    const result$ = firstValueFrom(
      service.enrich(new Blob(['test'], { type: 'text/plain' }), {
        actions: ['text-classification'],
      }),
    );

    const req = expectEnrichRequest();
    req.flush(
      JSON.stringify({
        responseCode: 500,
        responseMessage: 'No authentication info for calling the Enrichment service.',
        response: {},
      }),
    );

    await expect(result$).rejects.toBeInstanceOf(KeEnrichmentError);
    await expect(result$).rejects.toThrow(/No authentication info/);
  });
});
