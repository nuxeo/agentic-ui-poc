import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { NUXEO_API_ORIGIN } from '../nuxeo-api.config';
import {
  BLOB_NOT_ATTACHED_ERROR,
  DocumentImportService,
  documentHasMainBlob,
  isBlobHoldingDocType,
} from './document-import.service';

describe('DocumentImportService', () => {
  let service: DocumentImportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NUXEO_API_ORIGIN, useValue: '' },
      ],
    });

    service = TestBed.inject(DocumentImportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('identifies blob-holding document types', () => {
    expect(isBlobHoldingDocType('File')).toBe(true);
    expect(isBlobHoldingDocType('Folder')).toBe(false);
  });

  it('detects main blob on document properties', () => {
    expect(
      documentHasMainBlob({
        uid: '1',
        title: 't',
        type: 'File',
        path: '/a',
        properties: { 'file:content': { name: 'photo.jpg', length: '1024' } },
      }),
    ).toBe(true);
    expect(
      documentHasMainBlob({
        uid: '1',
        title: 't',
        type: 'File',
        path: '/a',
        properties: { 'file:content': null },
      }),
    ).toBe(false);
  });

  it('initializes upload batch via /upload/new/default', async () => {
    const batchId$ = firstValueFrom(service.initUploadBatch());
    const req = httpMock.expectOne('/nuxeo/api/v1/upload/new/default');
    expect(req.request.method).toBe('POST');
    req.flush({ batchId: 'batch-abc' });

    await expect(batchId$).resolves.toBe('batch-abc');
  });

  it('imports a file and attaches blob to created document', async () => {
    const file = new File(['jpeg-bytes'], 'photo.jpg', { type: 'image/jpeg' });
    const import$ = firstValueFrom(service.importFiles('/ws', [file]));

    const initReq = httpMock.expectOne('/nuxeo/api/v1/upload/new/default');
    initReq.flush({ batchId: 'batch-1' });

    const uploadReq = httpMock.expectOne('/nuxeo/api/v1/upload/batch-1/0');
    expect(uploadReq.request.headers.get('X-File-Name')).toBe('photo.jpg');
    uploadReq.flush('');

    const verifyReq = httpMock.expectOne('/nuxeo/api/v1/upload/batch-1/0');
    expect(verifyReq.request.method).toBe('GET');
    verifyReq.flush({ name: 'photo.jpg', size: file.size, uploadType: 'normal' });

    const createReq = httpMock.expectOne('/nuxeo/api/v1/path/ws');
    expect(createReq.request.body.properties['file:content']).toEqual({
      'upload-batch': 'batch-1',
      'upload-fileId': '0',
    });
    createReq.flush({
      uid: 'doc-1',
      title: 'photo',
      type: 'File',
      path: '/ws/photo',
      properties: {
        'dc:title': 'photo',
        'file:content': { name: 'photo.jpg', length: String(file.size), 'mime-type': 'image/jpeg' },
      },
    });

    const docs = await import$;
    expect(docs).toHaveLength(1);
    expect(docs[0].uid).toBe('doc-1');
  });

  it('fails import when created document has no main blob', async () => {
    const file = new File(['x'], 'empty.jpg', { type: 'image/jpeg' });
    const import$ = firstValueFrom(service.importFiles('/ws', [file]));

    httpMock.expectOne('/nuxeo/api/v1/upload/new/default').flush({ batchId: 'batch-2' });
    httpMock.expectOne('/nuxeo/api/v1/upload/batch-2/0').flush('');
    httpMock.expectOne('/nuxeo/api/v1/upload/batch-2/0').flush({ name: 'empty.jpg', size: 1 });
    httpMock.expectOne('/nuxeo/api/v1/path/ws').flush({
      uid: 'doc-2',
      title: 'empty',
      type: 'File',
      path: '/ws/empty',
      properties: { 'dc:title': 'empty', 'file:content': null },
    });

    await expect(import$).rejects.toThrow(BLOB_NOT_ATTACHED_ERROR);
  });
});
