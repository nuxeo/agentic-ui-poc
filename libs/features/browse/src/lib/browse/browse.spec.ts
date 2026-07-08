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
  NuxeoAce,
  NuxeoDocument,
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
  getDocumentPermissions: vi.fn(() => EMPTY),
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
    vi.clearAllMocks();
    mockDocumentDetailService.getDocumentPermissions.mockReturnValue(EMPTY);
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

  it('aceTimeFrame shows date-based label when ACL has begin and end', () => {
    const ace: NuxeoAce = {
      id: 'ace-1',
      username: 'members',
      externalUser: false,
      permission: 'Read',
      granted: true,
      creator: 'Administrator',
      begin: '2026-07-01T00:00:00.000Z',
      end: '2026-12-31T23:59:59.000Z',
      status: 'effective',
    };

    expect(component.aceTimeFrame(ace)).not.toBe('Permanent');
    expect(component.aceTimeFrame(ace)).toContain('from');
    expect(component.aceTimeFrame(ace)).toContain('to');
  });

  it('localAces reflects persisted date-based permissions after reload', () => {
    const doc = {
      uid: 'root-uid',
      title: 'Root',
      type: 'Root',
      path: '/',
      lastModified: '2026-07-01T00:00:00.000Z',
      properties: {},
      contextParameters: {
        acls: [
          {
            name: 'local',
            aces: [
              {
                id: 'ace-1',
                username: 'members',
                externalUser: false,
                permission: 'Read',
                granted: true,
                creator: 'Administrator',
                begin: '2026-07-01T00:00:00.000Z',
                end: '2026-12-31T23:59:59.000Z',
                status: 'effective',
              },
              {
                id: 'ace-2',
                username: 'administrators',
                externalUser: false,
                permission: 'Everything',
                granted: true,
                creator: 'Administrator',
                begin: null,
                end: null,
                status: 'effective',
              },
            ],
          },
        ],
      },
    } as NuxeoDocument;

    component.currentDoc.set(doc);

    expect(component.localAces()).toHaveLength(2);
    expect(component.aceTimeFrame(component.localAces()[0])).not.toBe('Permanent');
    expect(component.aceTimeFrame(component.localAces()[1])).toBe('Permanent');
  });

  it('localAces excludes external and non-granted ACEs', () => {
    const doc = {
      uid: 'root-uid',
      title: 'Root',
      type: 'Root',
      path: '/',
      lastModified: '2026-07-01T00:00:00.000Z',
      properties: {},
      contextParameters: {
        acls: [
          {
            name: 'local',
            aces: [
              {
                id: 'ace-1',
                username: 'members',
                externalUser: false,
                permission: 'Read',
                granted: true,
                creator: 'Administrator',
                begin: null,
                end: null,
                status: 'effective',
              },
              {
                id: 'ace-2',
                username: 'transient/guest@example.com',
                externalUser: true,
                permission: 'Read',
                granted: true,
                creator: 'Administrator',
                begin: null,
                end: null,
                status: 'effective',
              },
              {
                id: 'ace-3',
                username: 'revoked',
                externalUser: false,
                permission: 'Read',
                granted: false,
                creator: 'Administrator',
                begin: null,
                end: null,
                status: 'archived',
              },
            ],
          },
        ],
      },
    } as NuxeoDocument;

    component.currentDoc.set(doc);

    expect(component.localAces()).toHaveLength(1);
    expect(component.localAces()[0].username).toBe('members');
  });

  it('canManageCurrentPermissions is false for read-only users (NXSAT-162)', () => {
    component.currentDoc.set({
      uid: 'doc-1',
      title: 'File',
      type: 'File',
      path: '/file',
      lastModified: '',
      properties: {},
      contextParameters: { permissions: ['Read'] },
    } as NuxeoDocument);

    expect(component.canManageCurrentPermissions()).toBe(false);
  });

  it('onTabChange loads permissions via getDocumentPermissions', () => {
    const permissionsDoc = {
      uid: 'root-uid',
      contextParameters: {
        acls: [{ name: 'local', aces: [] }],
      },
    } as NuxeoDocument;
    mockDocumentDetailService.getDocumentPermissions.mockReturnValue(of(permissionsDoc));

    component.currentDoc.set({
      uid: 'root-uid',
      title: 'Root',
      type: 'Root',
      path: '/',
      lastModified: '2026-07-01T00:00:00.000Z',
      properties: {},
      contextParameters: { favorites: { isFavorite: false } },
    } as NuxeoDocument);

    component.onTabChange(1);

    expect(mockDocumentDetailService.getDocumentPermissions).toHaveBeenCalledWith('root-uid');
    expect(component.permissionsLoaded()).toBe(true);
    expect(component.permissionsLoading()).toBe(false);
    expect(component.currentDoc()?.contextParameters?.['favorites']).toEqual({ isFavorite: false });
    expect(component.currentDoc()?.contextParameters?.['acls']).toEqual([
      { name: 'local', aces: [] },
    ]);
  });

  it('retries permissions load after a failed fetch when the tab is reopened', () => {
    mockDocumentDetailService.getDocumentPermissions
      .mockReturnValueOnce(throwError(() => new Error('network error')))
      .mockReturnValueOnce(
        of({
          uid: 'root-uid',
          contextParameters: { acls: [{ name: 'local', aces: [] }] },
        } as NuxeoDocument),
      );

    component.currentDoc.set({
      uid: 'root-uid',
      title: 'Root',
      type: 'Root',
      path: '/',
      lastModified: '2026-07-01T00:00:00.000Z',
      properties: {},
      contextParameters: {},
    } as NuxeoDocument);

    component.onTabChange(1);
    component.onTabChange(0);
    component.onTabChange(1);

    expect(mockDocumentDetailService.getDocumentPermissions).toHaveBeenCalledTimes(2);
    expect(component.permissionsLoaded()).toBe(true);
    expect(component.permissionsLoading()).toBe(false);
  });
});
