import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { NUXEO_API_ORIGIN } from '@agentic-ui/shared/nuxeo-client';
import { StudioLayoutService } from './studio-layout.service';

describe('StudioLayoutService', () => {
  let service: StudioLayoutService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StudioLayoutService, { provide: NUXEO_API_ORIGIN, useValue: '' }],
    });

    service = TestBed.inject(StudioLayoutService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('fetches layout HTML and returns the string', () => {
    const sampleHtml =
      '<nuxeo-input role="widget" value="{{document.properties.dc:title}}"></nuxeo-input>';

    service.fetchStudioLayout('File', 'edit').subscribe((result) => {
      expect(result).toBe(sampleHtml);
    });

    const req = httpMock.expectOne('/nuxeo/ui/document/file/nuxeo-file-edit-layout.html');
    expect(req.request.responseType).toBe('text');
    req.flush(sampleHtml);
  });

  it('returns null on 404', () => {
    service.fetchStudioLayout('CustomDoc', 'view').subscribe((result) => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne('/nuxeo/ui/document/customdoc/nuxeo-customdoc-view-layout.html');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });

  it('returns null on network error', () => {
    service.fetchStudioLayout('File', 'create').subscribe((result) => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne('/nuxeo/ui/document/file/nuxeo-file-create-layout.html');
    req.error(new ProgressEvent('error'));
  });

  it('returns null for empty HTML response', () => {
    service.fetchStudioLayout('File', 'edit').subscribe((result) => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne('/nuxeo/ui/document/file/nuxeo-file-edit-layout.html');
    req.flush('   ');
  });

  it('caches subsequent calls for the same docType+mode', () => {
    const sampleHtml =
      '<nuxeo-input role="widget" value="{{document.properties.dc:title}}"></nuxeo-input>';

    service.fetchStudioLayout('File', 'edit').subscribe((result) => {
      expect(result).toBe(sampleHtml);
    });

    const req = httpMock.expectOne('/nuxeo/ui/document/file/nuxeo-file-edit-layout.html');
    req.flush(sampleHtml);

    service.fetchStudioLayout('File', 'edit').subscribe((result) => {
      expect(result).toBe(sampleHtml);
    });

    httpMock.expectNone('/nuxeo/ui/document/file/nuxeo-file-edit-layout.html');
  });

  it('clearCache forces a re-fetch', () => {
    const html1 = '<nuxeo-input value="{{document.properties.dc:title}}"></nuxeo-input>';
    const html2 =
      '<nuxeo-textarea value="{{document.properties.dc:description}}"></nuxeo-textarea>';

    service.fetchStudioLayout('File', 'edit').subscribe();
    httpMock.expectOne('/nuxeo/ui/document/file/nuxeo-file-edit-layout.html').flush(html1);

    service.clearCache();

    service.fetchStudioLayout('File', 'edit').subscribe((result) => {
      expect(result).toBe(html2);
    });

    httpMock.expectOne('/nuxeo/ui/document/file/nuxeo-file-edit-layout.html').flush(html2);
  });

  it('hasStudioLayout returns true when layout exists', () => {
    service.hasStudioLayout('File', 'edit').subscribe((result) => {
      expect(result).toBe(true);
    });

    httpMock
      .expectOne('/nuxeo/ui/document/file/nuxeo-file-edit-layout.html')
      .flush('<nuxeo-input></nuxeo-input>');
  });

  it('hasStudioLayout returns false on 404', () => {
    service.hasStudioLayout('File', 'edit').subscribe((result) => {
      expect(result).toBe(false);
    });

    httpMock
      .expectOne('/nuxeo/ui/document/file/nuxeo-file-edit-layout.html')
      .flush('', { status: 404, statusText: 'Not Found' });
  });

  it('lowercases doc type in URL', () => {
    service.fetchStudioLayout('InsuranceClaim', 'metadata').subscribe();

    httpMock.expectOne(
      '/nuxeo/ui/document/insuranceclaim/nuxeo-insuranceclaim-metadata-layout.html',
    );
  });
});
