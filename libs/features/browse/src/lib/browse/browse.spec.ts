import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { vi } from 'vitest';
import { EMPTY, of, throwError } from 'rxjs';
import { BrowseComponent } from './browse';
import {
  BrowseService,
  DocumentDetailService,
  DirectoryService,
  TagService,
} from '@agentic-ui/shared/nuxeo-client';

const mockBrowseService = {
  getByPath: vi.fn(() => throwError(() => new Error('not connected'))),
  getChildren: vi.fn(() => throwError(() => new Error('not connected'))),
  getTrashedChildren: vi.fn(() => EMPTY),
  restoreDocument: vi.fn(() => EMPTY),
  startCsvExport: vi.fn(() => EMPTY),
  pollAndDownloadCsv: vi.fn(() => EMPTY),
};

const mockDocumentDetailService = {
  getFullDocument: vi.fn(() => EMPTY),
  fetchThumbnail: vi.fn(() => EMPTY),
  getAuditLog: vi.fn(() => of({ entries: [], totalSize: 0 })),
  trashDocument: vi.fn(() => EMPTY),
  exportZip: vi.fn(() => EMPTY),
  exportXml: vi.fn(() => EMPTY),
  subscribe: vi.fn(() => EMPTY),
  unsubscribe: vi.fn(() => EMPTY),
  blockPermissionInheritance: vi.fn(() => EMPTY),
  unblockPermissionInheritance: vi.fn(() => EMPTY),
  sendNotificationEmailForPermission: vi.fn(() => EMPTY),
};

const mockDirectoryService = {
  getEventTypes: vi.fn(() => of([])),
  getEventCategories: vi.fn(() => of([])),
};

const mockTagService = {
  searchTags: vi.fn(() => of([])),
  addTag: vi.fn(() => EMPTY),
  removeTag: vi.fn(() => EMPTY),
};

describe('BrowseComponent', () => {
  let component: BrowseComponent;
  let fixture: ComponentFixture<BrowseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowseComponent],
      providers: [
        provideRouter([], withDisabledInitialNavigation()),
        { provide: BrowseService, useValue: mockBrowseService },
        { provide: DocumentDetailService, useValue: mockDocumentDetailService },
        { provide: DirectoryService, useValue: mockDirectoryService },
        { provide: TagService, useValue: mockTagService },
      ],
    })
      // Shallow-render: replace the complex Material/Satori template with a stub.
      // This avoids zone.js-tracked handles from 20+ imported modules that cause
      // the test process to hang in Node 20/Linux CI environments.
      .overrideComponent(BrowseComponent, {
        set: { imports: [], template: '<div></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(BrowseComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
