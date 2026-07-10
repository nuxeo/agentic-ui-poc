import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';

import { NUXEO_API_ORIGIN } from '../nuxeo-api.config';
import {
  BLOB_NOT_ATTACHED_ERROR,
  DEFAULT_IMPORT_PARENT_PATH,
  DOMAIN_CONTAINER_PATH,
  DocumentImportService,
  documentHasMainBlob,
  documentHasPersistedMainBlob,
  isBlobHoldingDocType,
  isRepositoryRootPath,
  isRestrictedImportParentPath,
  normalizeImportParentPath,
  summarizeCsvImportReport,
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

  it('defaults import parent path to repository root', async () => {
    await expect(firstValueFrom(service.getDefaultImportParentPath())).resolves.toBe('/');
    expect(DEFAULT_IMPORT_PARENT_PATH).toBe('/');
  });

  it('classifies repository root vs restricted domain container paths', () => {
    expect(isRepositoryRootPath('/')).toBe(true);
    expect(isRepositoryRootPath('//')).toBe(true);
    expect(isRepositoryRootPath('/workspaces/demo')).toBe(false);
    expect(isRestrictedImportParentPath('/')).toBe(false);
    expect(isRestrictedImportParentPath(DOMAIN_CONTAINER_PATH)).toBe(true);
    expect(isRestrictedImportParentPath('/default-domain/')).toBe(true);
    expect(normalizeImportParentPath('/workspaces/demo/')).toBe('/workspaces/demo');
  });

  it('imports CSV via CSV.Import automation', async () => {
    const csv = new File(['name,type\na,File'], 'docs.csv', { type: 'text/csv' });
    const report$ = firstValueFrom(
      service.importCsvFile({
        path: '/default-domain/workspaces/demo',
        file: csv,
        sendReport: true,
        documentMode: false,
      }),
    );

    const req = httpMock.expectOne('/nuxeo/api/v1/automation/CSV.Import');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    const form = req.request.body as FormData;
    const requestJson = JSON.parse(await (form.get('request') as Blob).text());
    expect(requestJson.params).toEqual({
      path: '/default-domain/workspaces/demo',
      sendReport: true,
      documentMode: false,
      trim: true,
    });
    expect(form.get('file')).toBe(csv);
    req.flush('<p>Import completed</p>');

    await expect(report$).resolves.toBe('<p>Import completed</p>');
  });

  it('normalizes path and passes documentMode/trim to CSV.Import', async () => {
    const csv = new File(['name,type\na,File'], 'docs.csv', { type: 'text/csv' });
    const report$ = firstValueFrom(
      service.importCsvFile({
        path: '/default-domain/workspaces/demo/',
        file: csv,
        sendReport: false,
        documentMode: true,
        trim: false,
      }),
    );

    const req = httpMock.expectOne('/nuxeo/api/v1/automation/CSV.Import');
    const form = req.request.body as FormData;
    const requestJson = JSON.parse(await (form.get('request') as Blob).text());
    expect(requestJson.params).toEqual({
      path: '/default-domain/workspaces/demo',
      sendReport: false,
      documentMode: true,
      trim: false,
    });
    req.flush('done');

    await expect(report$).resolves.toBe('done');
  });

  it('surfaces CSV.Import HTTP errors', async () => {
    const csv = new File(['name,type\na,File'], 'docs.csv', { type: 'text/csv' });
    const report$ = firstValueFrom(
      service.importCsvFile({
        path: '/default-domain/workspaces/demo',
        file: csv,
      }),
    );

    const req = httpMock.expectOne('/nuxeo/api/v1/automation/CSV.Import');
    req.flush('Not found', { status: 404, statusText: 'Not Found' });

    await expect(report$).rejects.toMatchObject({ status: 404 });
  });

  it('summarizeCsvImportReport strips HTML and falls back to default text', () => {
    expect(summarizeCsvImportReport('<p>Imported <b>3</b> documents</p>')).toBe(
      'Imported 3 documents',
    );
    expect(
      summarizeCsvImportReport('<p>Imported 2 documents</p><br/>Skipped 1 row<br/>Errors: 0'),
    ).toBe('Imported 2 documents\n\nSkipped 1 row\nErrors: 0');
    expect(summarizeCsvImportReport('Row one<br/>Row two')).toBe('Row one\nRow two');
    expect(summarizeCsvImportReport('   ')).toBe('CSV import completed.');
  });

  it('importFromCsvText creates documents from valid rows', async () => {
    const csv = [
      'name,type,dc:title',
      'folder-a,Folder,Folder A',
      'folder-a/doc-a,File,Doc A',
    ].join('\n');

    const result$ = firstValueFrom(
      service.importFromCsvText('/default-domain/workspaces/demo', csv),
    );

    const folderReq = httpMock.expectOne('/nuxeo/api/v1/path/default-domain/workspaces/demo');
    folderReq.flush({
      uid: 'folder-a',
      title: 'Folder A',
      type: 'Folder',
      path: '/default-domain/workspaces/demo/folder-a',
      properties: { 'dc:title': 'Folder A' },
    });

    const fileReq = httpMock.expectOne(
      '/nuxeo/api/v1/path/default-domain/workspaces/demo/folder-a',
    );
    fileReq.flush({
      uid: 'doc-a',
      title: 'Doc A',
      type: 'File',
      path: '/default-domain/workspaces/demo/folder-a/doc-a',
      properties: { 'dc:title': 'Doc A' },
    });

    const result = await result$;
    expect(result.created).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
  });

  it('importFromCsvText rejects CSV without name/type columns', async () => {
    const result = await firstValueFrom(
      service.importFromCsvText('/ws', 'title,description\nA,Desc'),
    );
    expect(result.created).toHaveLength(0);
    expect(result.errors[0]).toContain('name');
    httpMock.expectNone('/nuxeo/api/v1/path/ws');
  });

  it('importFromCsvText skips rows with file:content', async () => {
    const csv = ['name,type,file:content', 'doc,File,binary.pdf'].join('\n');
    const result = await firstValueFrom(service.importFromCsvText('/ws', csv));
    expect(result.created).toHaveLength(0);
    expect(result.skipped[0]).toContain('file:content');
    httpMock.expectNone('/nuxeo/api/v1/path/ws');
  });

  it('importFromCsvText reports missing parent paths', async () => {
    const csv = ['name,type', 'orphan/doc,File'].join('\n');
    const result = await firstValueFrom(service.importFromCsvText('/ws', csv));
    expect(result.created).toHaveLength(0);
    expect(result.errors[0]).toContain('orphan/doc');
    httpMock.expectNone('/nuxeo/api/v1/path/ws');
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
      documentHasPersistedMainBlob({
        uid: '1',
        title: 't',
        type: 'File',
        path: '/a',
        properties: { 'file:content': { name: 'photo.jpg' } },
      }),
    ).toBe(false);
    expect(
      documentHasPersistedMainBlob({
        uid: '1',
        title: 't',
        type: 'File',
        path: '/a',
        properties: { 'file:content': { name: '', 'mime-type': 'image/jpeg' } },
      }),
    ).toBe(false);
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
    vi.useFakeTimers();
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

    const nullDoc = {
      uid: 'doc-2',
      title: 'empty',
      type: 'File',
      path: '/ws/empty',
      properties: { 'dc:title': 'empty', 'file:content': null },
    };

    const rejection = expect(import$).rejects.toThrow(BLOB_NOT_ATTACHED_ERROR);
    for (let i = 0; i < 13; i++) {
      await Promise.resolve();
      const refetchReq = httpMock.expectOne('/nuxeo/api/v1/id/doc-2');
      expect(refetchReq.request.headers.get('properties')).toBe('file:content');
      refetchReq.flush(nullDoc);
      await vi.advanceTimersByTimeAsync(300);
    }

    const trashReq = httpMock.expectOne('/nuxeo/api/v1/automation/Document.Trash');
    expect(trashReq.request.body).toEqual({
      params: {},
      context: {},
      input: 'doc:doc-2',
    });
    trashReq.flush({ uid: 'doc-2', title: 'empty', type: 'File', path: '/ws/empty' });

    await rejection;
    vi.useRealTimers();
  });

  it('succeeds when create response omits blob but re-fetch has file:content', async () => {
    const file = new File(['jpeg-bytes'], 'cat.jpg', { type: 'image/jpeg' });
    const import$ = firstValueFrom(service.importFiles('/ws', [file]));

    httpMock.expectOne('/nuxeo/api/v1/upload/new/default').flush({ batchId: 'batch-5' });
    httpMock.expectOne('/nuxeo/api/v1/upload/batch-5/0').flush('');
    httpMock
      .expectOne('/nuxeo/api/v1/upload/batch-5/0')
      .flush({ name: 'cat.jpg', size: file.size });
    httpMock.expectOne('/nuxeo/api/v1/path/ws').flush({
      uid: 'doc-5',
      title: 'cat',
      type: 'File',
      path: '/ws/cat',
      properties: { 'dc:title': 'cat', 'file:content': null },
    });

    const refetchReq = httpMock.expectOne('/nuxeo/api/v1/id/doc-5');
    expect(refetchReq.request.headers.get('properties')).toBe('file:content');
    refetchReq.flush({
      uid: 'doc-5',
      title: 'cat',
      type: 'File',
      path: '/ws/cat',
      properties: {
        'dc:title': 'cat',
        'file:content': { name: 'cat.jpg', length: String(file.size), 'mime-type': 'image/jpeg' },
      },
    });

    const docs = await import$;
    expect(docs).toHaveLength(1);
    expect(docs[0].properties?.['file:content']).toEqual({
      name: 'cat.jpg',
      length: String(file.size),
      'mime-type': 'image/jpeg',
    });
  });

  it('succeeds when create response only has upload-batch reference', async () => {
    const file = new File(['bytes'], 'photo.jpg', { type: 'image/jpeg' });
    const create$ = firstValueFrom(
      service.createBlobHoldingDocument('/ws', 'photo', 'Picture', { 'dc:title': 'photo' }, file),
    );

    httpMock.expectOne('/nuxeo/api/v1/upload/new/default').flush({ batchId: 'batch-6' });
    httpMock.expectOne('/nuxeo/api/v1/upload/batch-6/0').flush('');
    httpMock
      .expectOne('/nuxeo/api/v1/upload/batch-6/0')
      .flush({ name: 'photo.jpg', size: file.size });
    httpMock.expectOne('/nuxeo/api/v1/path/ws').flush({
      uid: 'doc-6',
      title: 'photo',
      type: 'Picture',
      path: '/ws/photo',
      properties: {
        'dc:title': 'photo',
        'file:content': { 'upload-batch': 'batch-6', 'upload-fileId': '0' },
      },
    });

    const refetchReq = httpMock.expectOne('/nuxeo/api/v1/id/doc-6');
    refetchReq.flush({
      uid: 'doc-6',
      title: 'photo',
      type: 'Picture',
      path: '/ws/photo',
      properties: {
        'dc:title': 'photo',
        'file:content': { name: 'photo.jpg', length: String(file.size), digest: 'abc123' },
      },
    });

    const doc = await create$;
    expect(doc.uid).toBe('doc-6');
    expect(documentHasMainBlob(doc)).toBe(true);
  });

  it('accepts zero-byte batch uploads during verification', async () => {
    const file = new File([], 'empty.txt', { type: 'text/plain' });
    const import$ = firstValueFrom(service.importFiles('/ws', [file]));

    httpMock.expectOne('/nuxeo/api/v1/upload/new/default').flush({ batchId: 'batch-3' });
    httpMock.expectOne('/nuxeo/api/v1/upload/batch-3/0').flush('');
    httpMock.expectOne('/nuxeo/api/v1/upload/batch-3/0').flush({ name: 'empty.txt', size: 0 });
    httpMock.expectOne('/nuxeo/api/v1/path/ws').flush({
      uid: 'doc-3',
      title: 'empty',
      type: 'File',
      path: '/ws/empty',
      properties: {
        'dc:title': 'empty',
        'file:content': { name: 'empty.txt', length: '0', 'mime-type': 'text/plain' },
      },
    });

    const docs = await import$;
    expect(docs).toHaveLength(1);
  });

  it('sanitizes unsafe characters in X-File-Name header', async () => {
    const file = new File(['x'], 'bad\r\nname.jpg', { type: 'image/jpeg' });
    const import$ = firstValueFrom(service.importFiles('/ws', [file]));

    httpMock.expectOne('/nuxeo/api/v1/upload/new/default').flush({ batchId: 'batch-4' });
    const uploadReq = httpMock.expectOne('/nuxeo/api/v1/upload/batch-4/0');
    expect(uploadReq.request.headers.get('X-File-Name')).toBe('badname.jpg');
    uploadReq.flush('');
    httpMock.expectOne('/nuxeo/api/v1/upload/batch-4/0').flush({ name: 'badname.jpg', size: 1 });
    httpMock.expectOne('/nuxeo/api/v1/path/ws').flush({
      uid: 'doc-4',
      title: 'badname',
      type: 'File',
      path: '/ws/badname',
      properties: {
        'dc:title': 'badname',
        'file:content': { name: 'badname.jpg', length: '1' },
      },
    });

    await import$;
  });

  it('creates a blob-holding document from a staged batch', async () => {
    const create$ = firstValueFrom(
      service.createBlobHoldingDocumentFromBatch(
        '/ws',
        'photo',
        'Picture',
        { 'dc:title': 'photo' },
        'batch-staged',
        0,
      ),
    );

    const createReq = httpMock.expectOne('/nuxeo/api/v1/path/ws');
    expect(createReq.request.body.properties['file:content']).toEqual({
      'upload-batch': 'batch-staged',
      'upload-fileId': '0',
    });
    createReq.flush({
      uid: 'doc-staged',
      title: 'photo',
      type: 'Picture',
      path: '/ws/photo',
      properties: {
        'dc:title': 'photo',
        'file:content': { name: 'photo.jpg', length: '1024', digest: 'abc' },
      },
    });

    const doc = await create$;
    expect(doc.uid).toBe('doc-staged');
  });

  it('stages a file in a batch on selection (Web UI immediate upload)', async () => {
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });
    const progress: number[] = [];
    const stage$ = firstValueFrom(
      service.stageFileInBatch(file, { onProgress: (pct) => progress.push(pct) }),
    );

    httpMock.expectOne('/nuxeo/api/v1/upload/new/default').flush({ batchId: 'batch-stage' });
    httpMock.expectOne('/nuxeo/api/v1/upload/batch-stage/0').flush('');
    httpMock
      .expectOne('/nuxeo/api/v1/upload/batch-stage/0')
      .flush({ name: 'photo.jpg', size: file.size });

    const staged = await stage$;
    expect(staged).toEqual({ batchId: 'batch-stage', fileIndex: 0 });
    expect(progress.length).toBeGreaterThan(0);
    expect(progress[progress.length - 1]).toBe(100);
  });
});
