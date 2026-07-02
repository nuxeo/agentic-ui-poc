import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { vi } from 'vitest';
import { EMPTY, of, throwError } from 'rxjs';
import { BrowseComponent } from './browse';
import {
  BrowseService,
  DocumentDetailService,
  DirectoryService,
  mailSendFailureMessage,
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
  let snackBarOpenSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    snackBarOpenSpy = vi.fn();
    await TestBed.configureTestingModule({
      imports: [BrowseComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter([], withDisabledInitialNavigation()),
        { provide: BrowseService, useValue: mockBrowseService },
        { provide: DocumentDetailService, useValue: mockDocumentDetailService },
        { provide: DirectoryService, useValue: mockDirectoryService },
        { provide: TagService, useValue: mockTagService },
        { provide: MatSnackBar, useValue: { open: snackBarOpenSpy } },
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

  it('sendNotificationEmail shows success snackbar (NXSAT-159)', () => {
    mockDocumentDetailService.sendNotificationEmailForPermission.mockReturnValue(
      of({ uid: 'doc-1' }),
    );
    component.currentDoc.set({
      uid: 'doc-1',
      title: 'File',
      type: 'File',
      path: '/file',
      lastModified: '',
      properties: {},
    });

    component.sendNotificationEmail({
      id: 'ace-1',
      username: 'user-readonly01',
      externalUser: false,
      permission: 'Read',
      granted: true,
      creator: null,
      begin: null,
      end: null,
      status: 'effective',
    });

    expect(mockDocumentDetailService.sendNotificationEmailForPermission).toHaveBeenCalledWith(
      'doc-1',
      'ace-1',
    );
    expect(snackBarOpenSpy).toHaveBeenCalledWith('Notification email sent', 'OK', {
      duration: 3000,
    });
  });

  it('sendNotificationEmail shows SMTP guidance on mail failure (NXSAT-159)', () => {
    mockDocumentDetailService.sendNotificationEmailForPermission.mockReturnValue(
      throwError(() => ({ error: { message: 'An error occurred while sending a mail' } })),
    );
    component.currentDoc.set({
      uid: 'doc-1',
      title: 'File',
      type: 'File',
      path: '/file',
      lastModified: '',
      properties: {},
    });

    component.sendNotificationEmail({
      id: 'ace-1',
      username: 'user-readonly01',
      externalUser: false,
      permission: 'Read',
      granted: true,
      creator: null,
      begin: null,
      end: null,
      status: 'effective',
    });

    expect(snackBarOpenSpy).toHaveBeenCalledWith(mailSendFailureMessage('send'), 'OK', {
      duration: 7000,
    });
  });
});
