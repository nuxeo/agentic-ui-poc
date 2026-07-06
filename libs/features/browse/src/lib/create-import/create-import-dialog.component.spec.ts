import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { vi } from 'vitest';

import {
  BrowseService,
  DirectoryService,
  DocumentImportService,
  type NuxeoDocument,
} from '@agentic-ui/shared/nuxeo-client';
import { CreateImportDialogComponent } from './create-import-dialog.component';

const PARENT_PATH = '/default-domain/workspaces/ws';

const mockDialogRef = {
  close: vi.fn(),
  updateSize: vi.fn(),
};

const mockImportService = {
  getDefaultImportParentPath: vi.fn(() => of(PARENT_PATH)),
  stageFileInBatch: vi.fn(),
  createBlobHoldingDocumentFromBatch: vi.fn(),
  createBlobHoldingDocument: vi.fn(),
  createChildDocument: vi.fn(),
  importFiles: vi.fn(),
};

const mockBrowseService = {
  getFolderContext: vi.fn(() =>
    of({
      uid: 'ws-1',
      title: 'Workspace',
      type: 'Workspace',
      path: PARENT_PATH,
      lastModified: '',
      properties: {},
      contextParameters: { subtypes: ['File', 'Picture', 'Note'] },
    }),
  ),
  getChildren: vi.fn(() => of({ entries: [], totalSize: 0 })),
};

const mockDirectoryService = {
  getEntries: vi.fn(() => of([])),
  getAllL10nEntries: vi.fn(() => of([])),
};

function pictureType() {
  return { type: 'Picture', label: 'Picture', icon: 'image' };
}

function jpegFile(name = 'photo.jpg') {
  return new File(['jpeg-bytes'], name, { type: 'image/jpeg' });
}

async function flushAsync(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('CreateImportDialogComponent (NXSAT-173)', () => {
  let component: CreateImportDialogComponent;
  let fixture: ComponentFixture<CreateImportDialogComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [CreateImportDialogComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { parentPath: PARENT_PATH } },
        { provide: DocumentImportService, useValue: mockImportService },
        { provide: BrowseService, useValue: mockBrowseService },
        { provide: DirectoryService, useValue: mockDirectoryService },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    })
      .overrideComponent(CreateImportDialogComponent, {
        set: { imports: [], template: '<div></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CreateImportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await flushAsync();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('clearNature and clearCoverage remove selected vocabulary values', () => {
    component.nature = 'application-form';
    component.coverage = 'africa-algeria';

    component.clearNature();
    component.clearCoverage();

    expect(component.nature).toBeNull();
    expect(component.coverage).toBeNull();
  });

  it('rejects invalid expiry input while typing', () => {
    component.onExpiresInput({ target: { value: '99/99/9999' } } as unknown as Event);

    expect(component.isExpiresValid()).toBe(false);
  });

  it('allows empty expiry and in-progress mm/dd/yyyy input', () => {
    expect(component.isExpiresValid()).toBe(true);

    component.onExpiresInput({ target: { value: '01/15/' } } as unknown as Event);
    expect(component.isExpiresValid()).toBe(true);
  });

  it('reports pending upload before batch staging completes', async () => {
    mockImportService.stageFileInBatch.mockReturnValue(
      timer(20).pipe(map(() => ({ batchId: 'batch-1', fileIndex: 0 }))),
    );

    component.startCreateFromType(pictureType());
    component.docTitle = 'Photo';
    component.onMainFileInputChange({
      target: { files: [jpegFile()], value: '' },
    } as unknown as Event);

    expect(component.mainFileUploadPending()).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(component.mainFileUploadPending()).toBe(false);
  });

  it('stages main file on selection and completes upload progress', async () => {
    mockImportService.stageFileInBatch.mockImplementation((_file, options) => {
      options?.onProgress?.(42);
      options?.onProgress?.(100);
      return of({ batchId: 'batch-1', fileIndex: 0 });
    });

    component.startCreateFromType(pictureType());
    const file = jpegFile();
    component.onMainFileInputChange({
      target: { files: [file], value: '' },
    } as unknown as Event);

    await flushAsync();

    expect(mockImportService.stageFileInBatch).toHaveBeenCalledWith(file, expect.any(Object));
    expect(component.mainFile()).toBe(file);
    expect(component.mainFileUploadComplete()).toBe(true);
    expect(component.mainFileUploadPercent()).toBe(100);
  });

  it('sets contentError when immediate file upload fails', async () => {
    mockImportService.stageFileInBatch.mockReturnValue(
      throwError(() => ({ message: 'Upload failed' })),
    );

    component.startCreateFromType(pictureType());
    component.onMainFileInputChange({
      target: { files: [jpegFile()], value: '' },
    } as unknown as Event);

    await flushAsync();

    expect(component.contentError()).toBe('Upload failed');
    expect(component.error()).toBeNull();
    expect(component.mainFile()).toBeNull();
  });

  it('clearMainFile resets staged upload state', async () => {
    mockImportService.stageFileInBatch.mockReturnValue(of({ batchId: 'batch-1', fileIndex: 0 }));

    component.startCreateFromType(pictureType());
    component.onMainFileInputChange({
      target: { files: [jpegFile()], value: '' },
    } as unknown as Event);
    await flushAsync();

    component.clearMainFile();

    expect(component.mainFile()).toBeNull();
    expect(component.mainFileUploadComplete()).toBe(false);
    expect(component.mainFileUploadPercent()).toBe(0);
  });

  it('createDocument uses staged batch when upload already completed', async () => {
    const created: NuxeoDocument = {
      uid: 'doc-1',
      title: 'Photo',
      type: 'Picture',
      path: `${PARENT_PATH}/photo`,
      lastModified: '',
      properties: {},
    };

    mockImportService.stageFileInBatch.mockReturnValue(of({ batchId: 'batch-1', fileIndex: 0 }));
    mockImportService.createBlobHoldingDocumentFromBatch.mockReturnValue(of(created));

    component.startCreateFromType(pictureType());
    component.docTitle = 'Photo';
    component.onMainFileInputChange({
      target: { files: [jpegFile()], value: '' },
    } as unknown as Event);
    await flushAsync();

    component.createDocument();
    await flushAsync();

    expect(mockImportService.createBlobHoldingDocumentFromBatch).toHaveBeenCalled();
    expect(mockImportService.createBlobHoldingDocument).not.toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith(
      expect.objectContaining({ navigateToUid: 'doc-1', refreshed: true }),
    );
  });

  it('routes blob create failures to contentError instead of dialog error', async () => {
    mockImportService.stageFileInBatch.mockReturnValue(of({ batchId: 'batch-1', fileIndex: 0 }));
    mockImportService.createBlobHoldingDocumentFromBatch.mockReturnValue(
      throwError(() => ({ message: 'File was not attached to the document' })),
    );

    component.startCreateFromType(pictureType());
    component.docTitle = 'Photo';
    component.onMainFileInputChange({
      target: { files: [jpegFile()], value: '' },
    } as unknown as Event);
    await flushAsync();

    component.createDocument();
    await flushAsync();

    expect(component.contentError()).toBe('File was not attached to the document');
    expect(component.error()).toBeNull();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('runUpload routes failures to importError instead of dialog error', async () => {
    mockImportService.importFiles.mockReturnValue(throwError(() => ({ message: 'Upload failed' })));

    component.uploadFiles.set([jpegFile('import.pdf')]);
    component.runUpload();
    await flushAsync();

    expect(component.importError()).toBe('Upload failed');
    expect(component.error()).toBeNull();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });
});
