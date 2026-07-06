import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import {
  BrowseService,
  DirectoryService,
  DocumentImportService,
  type NuxeoDocument,
} from '@agentic-ui/shared/nuxeo-client';

import { CreateImportDialogComponent } from './create-import-dialog.component';

const folderDoc: NuxeoDocument = {
  uid: 'ws-1',
  title: 'Demo',
  type: 'Workspace',
  path: '/default-domain/workspaces/demo',
  lastModified: '2026-01-01T00:00:00.000Z',
  properties: {},
  contextParameters: { subtypes: ['File', 'Folder'] },
};

const mockImportService = {
  getDefaultImportParentPath: vi.fn(() => of('/')),
  importCsvFile: vi.fn(() => of('<p>Imported 2 documents</p>')),
  importFiles: vi.fn(() => of([])),
};

const mockBrowseService = {
  getFolderContext: vi.fn(() => of(folderDoc)),
  getChildren: vi.fn(() => of({ entries: [] })),
};

const mockDirectoryService = {
  getEntries: vi.fn(() => of([])),
  getAllL10nEntries: vi.fn(() => of([])),
};

const mockDialogRef = {
  close: vi.fn(),
  updateSize: vi.fn(),
};

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
