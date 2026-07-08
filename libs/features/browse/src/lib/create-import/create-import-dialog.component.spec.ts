import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
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

const folderDoc: NuxeoDocument = {
  uid: 'ws-1',
  title: 'Demo',
  type: 'Workspace',
  path: '/default-domain/workspaces/demo',
  lastModified: '2026-01-01T00:00:00.000Z',
  properties: {},
  contextParameters: { subtypes: ['File', 'Folder'] },
};

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
  importFiles: vi.fn(() => of([])),
  importCsvFile: vi.fn(() => of('<p>Imported 2 documents</p>')),
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

  it('allows partial expiry input even when datepicker parse would fail', () => {
    component.onExpiresInput({ target: { value: '01/15/' } } as unknown as Event);
    component.expiresNgModel = {
      errors: { matDatepickerParse: { text: '01/15/' } },
      invalid: true,
      control: { markAsDirty: vi.fn(), updateValueAndValidity: vi.fn() },
    } as unknown as typeof component.expiresNgModel;

    expect(component.isExpiresValid()).toBe(true);
  });

  it('validates complete mm/dd/yyyy dates deterministically', () => {
    component.onExpiresInput({ target: { value: '02/29/2024' } } as unknown as Event);
    expect(component.isExpiresValid()).toBe(true);

    component.onExpiresInput({ target: { value: '02/29/2023' } } as unknown as Event);
    expect(component.isExpiresValid()).toBe(false);

    component.onExpiresInput({ target: { value: '02/31/2024' } } as unknown as Event);
    expect(component.isExpiresValid()).toBe(false);
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

describe('CreateImportDialogComponent CSV', () => {
  let fixture: ComponentFixture<CreateImportDialogComponent>;
  let component: CreateImportDialogComponent;

  async function createDialog(data: { parentPath?: string } = {}): Promise<void> {
    vi.clearAllMocks();
    mockImportService.getDefaultImportParentPath.mockReturnValue(of('/'));
    mockImportService.importCsvFile.mockReturnValue(of('<p>Imported 2 documents</p>'));
    mockBrowseService.getFolderContext.mockReturnValue(of(folderDoc));
    mockBrowseService.getChildren.mockReturnValue(of({ entries: [] }));

    await TestBed.configureTestingModule({
      imports: [CreateImportDialogComponent, NoopAnimationsModule],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: DocumentImportService, useValue: mockImportService },
        { provide: BrowseService, useValue: mockBrowseService },
        { provide: DirectoryService, useValue: mockDirectoryService },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateImportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await Promise.resolve();
  }

  it('defaults to repository root when opened without browse context', async () => {
    await createDialog();
    expect(mockImportService.getDefaultImportParentPath).toHaveBeenCalled();
    expect(component.parentPath()).toBe('/');
  });

  it('uses browse parent path when provided', async () => {
    await createDialog({ parentPath: '/default-domain/workspaces/demo' });
    expect(component.parentPath()).toBe('/default-domain/workspaces/demo');
    expect(mockImportService.getDefaultImportParentPath).not.toHaveBeenCalled();
  });

  it('allows CSV import at repository root but blocks file import', async () => {
    await createDialog();
    expect(component.isAtRepositoryRoot()).toBe(true);
    expect(component.csvImportRestricted()).toBe(false);
    expect(component.importRestricted()).toBe(true);
  });

  it('blocks CSV import on the domain container path', async () => {
    await createDialog({ parentPath: '/default-domain' });
    expect(component.csvImportRestricted()).toBe(true);
    expect(component.importRestricted()).toBe(true);
  });

  it('allows file and CSV import inside a workspace', async () => {
    await createDialog({ parentPath: '/default-domain/workspaces/demo' });
    expect(component.csvImportRestricted()).toBe(false);
    expect(component.importRestricted()).toBe(false);
  });

  it('switches to CSV tab and shows Web UI options', async () => {
    await createDialog({ parentPath: '/default-domain/workspaces/demo' });
    component.setActiveTab('csv');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Click to select a csv file or drag it to upload.');
    expect(el.textContent).toContain('Receive the import report by email.');
    expect(el.textContent).toContain('Apply Date, Author and Dublin Core properties.');
  });

  it('clears CSV file when switching to import tab', async () => {
    await createDialog({ parentPath: '/default-domain/workspaces/demo' });
    component.csvFile.set(new File(['name,type'], 'docs.csv', { type: 'text/csv' }));
    component.setActiveTab('import');
    expect(component.csvFile()).toBeNull();
  });

  it('clears upload files when switching to CSV tab', async () => {
    await createDialog({ parentPath: '/default-domain/workspaces/demo' });
    component.uploadFiles.set([new File(['x'], 'a.txt')]);
    component.setActiveTab('csv');
    expect(component.uploadFiles()).toEqual([]);
  });

  it('selects CSV via file input', async () => {
    await createDialog({ parentPath: '/default-domain/workspaces/demo' });
    component.setActiveTab('csv');
    const file = new File(['name,type'], 'docs.csv', { type: 'text/csv' });
    component.onCsvInputChange({ target: { files: [file], value: '' } } as unknown as Event);
    expect(component.csvFile()?.name).toBe('docs.csv');
  });

  it('selects CSV via drag and drop', async () => {
    await createDialog({ parentPath: '/default-domain/workspaces/demo' });
    const file = new File(['name,type'], 'docs.csv', { type: 'text/csv' });
    component.onCsvDrop({
      preventDefault: vi.fn(),
      dataTransfer: { files: [file] },
    } as unknown as DragEvent);
    expect(component.csvFile()?.name).toBe('docs.csv');
  });

  it('rejects non-CSV files from file input', async () => {
    await createDialog({ parentPath: '/default-domain/workspaces/demo' });
    component.onCsvInputChange({
      target: { files: [new File(['x'], 'notes.txt')], value: '' },
    } as unknown as Event);
    expect(component.csvFile()).toBeNull();
    expect(component.error()).toBe('Please select a .csv file.');
  });

  it('rejects non-CSV files from drag and drop', async () => {
    await createDialog({ parentPath: '/default-domain/workspaces/demo' });
    component.onCsvDrop({
      preventDefault: vi.fn(),
      dataTransfer: { files: [new File(['x'], 'notes.txt')] },
    } as unknown as DragEvent);
    expect(component.csvFile()).toBeNull();
    expect(component.error()).toBe('Please select a .csv file.');
  });

  it('runCsvImport calls CSV.Import with toggle values', async () => {
    await createDialog({ parentPath: '/default-domain/workspaces/demo' });
    const file = new File(['name,type'], 'docs.csv', { type: 'text/csv' });
    component.csvFile.set(file);
    component.csvSendReport.set(true);
    component.csvDocumentMode.set(true);

    component.runCsvImport();
    await Promise.resolve();

    expect(mockImportService.importCsvFile).toHaveBeenCalledWith({
      path: '/default-domain/workspaces/demo',
      file,
      sendReport: true,
      documentMode: true,
    });
    expect(component.view()).toBe('success');
    expect(component.successMessage()).toContain('Imported 2 documents');
    expect(component.csvFile()).toBeNull();
  });

  it('does not run CSV import when location is restricted', async () => {
    await createDialog({ parentPath: '/default-domain' });
    component.csvFile.set(new File(['name,type'], 'docs.csv', { type: 'text/csv' }));
    component.runCsvImport();
    await Promise.resolve();
    expect(mockImportService.importCsvFile).not.toHaveBeenCalled();
  });

  it('shows addon message when CSV.Import returns 404', async () => {
    await createDialog({ parentPath: '/default-domain/workspaces/demo' });
    mockImportService.importCsvFile.mockReturnValueOnce(
      throwError(() => ({ status: 404, message: 'Not Found' })),
    );
    component.csvFile.set(new File(['name,type'], 'docs.csv', { type: 'text/csv' }));

    component.runCsvImport();
    await Promise.resolve();

    expect(component.error()).toContain('Nuxeo CSV addon');
    expect(component.view()).toBe('main');
  });

  it('surfaces generic CSV import failures', async () => {
    await createDialog({ parentPath: '/default-domain/workspaces/demo' });
    mockImportService.importCsvFile.mockReturnValueOnce(
      throwError(() => ({ message: 'Invalid CSV format' })),
    );
    component.csvFile.set(new File(['bad'], 'docs.csv', { type: 'text/csv' }));

    component.runCsvImport();
    await Promise.resolve();

    expect(component.error()).toBe('Invalid CSV format');
  });
});
