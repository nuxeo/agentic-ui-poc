import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { vi } from 'vitest';
import { EMPTY, of, throwError } from 'rxjs';
import { BrowseComponent } from './browse';
import {
  BrowseService,
  BrowseContextService,
  DocumentDetailService,
  DirectoryService,
  mailSendFailureMessage,
  NuxeoAce,
  NuxeoDocument,
  SelectionService,
  TagService,
  CURRENT_USERNAME,
  ADMIN_ACCESS_CHECKS,
} from '@agentic-ui/shared/nuxeo-client';
import { trashSelectedDocumentsConfirmData } from '@agentic-ui/shared/ui';

const mockBrowseService = {
  getByPath: vi.fn(() => throwError(() => new Error('not connected'))),
  getBrowseFolderContents: vi.fn(() => throwError(() => new Error('not connected'))),
  getFolderContext: vi.fn(() => throwError(() => new Error('not connected'))),
  getChildren: vi.fn(() => throwError(() => new Error('not connected'))),
  hasChildCollections: vi.fn(() => of(false)),
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

const mockSelectionService = {
  selectedIds: vi.fn(() => new Set<string>()),
  selectedCount: vi.fn(() => 0),
  isSelected: vi.fn(() => false),
  isAllSelected: vi.fn(() => false),
  isIndeterminate: vi.fn(() => false),
  toggle: vi.fn(),
  selectAll: vi.fn(),
  clear: vi.fn(),
  deleteSelected: vi.fn(() => of([])),
};

describe('BrowseComponent', () => {
  let component: BrowseComponent;
  let fixture: ComponentFixture<BrowseComponent>;
  let snackBarOpenSpy: ReturnType<typeof vi.fn>;
  let dialogOpenSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    snackBarOpenSpy = vi.fn();
    dialogOpenSpy = vi.fn(() => ({ afterClosed: () => of(false) }));
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
        { provide: SelectionService, useValue: mockSelectionService },
        { provide: CURRENT_USERNAME, useValue: () => 'jdoe' },
        {
          provide: ADMIN_ACCESS_CHECKS,
          useValue: {
            isAdministrator: () => false,
            isPowerUser: () => false,
            hasAdministrationAccess: () => false,
          },
        },
        { provide: MatSnackBar, useValue: { open: snackBarOpenSpy } },
        { provide: MatDialog, useValue: { open: dialogOpenSpy } },
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

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requestContentRefresh reloads folder contents after clipboard copy/move', () => {
    const browseContext = TestBed.inject(BrowseContextService);
    const folder: NuxeoDocument = {
      uid: 'ws-1',
      title: 'Workspace',
      type: 'Workspace',
      path: '/default-domain/workspaces/ws-1',
      lastModified: '',
      properties: {},
      contextParameters: { permissions: ['AddChildren'] },
    };
    mockBrowseService.getBrowseFolderContents.mockReturnValue(
      of({ folder, entries: [], totalSize: 0 }),
    );
    mockBrowseService.getFolderContext.mockReturnValue(of(folder));

    fixture.detectChanges();
    const callsAfterInit = mockBrowseService.getBrowseFolderContents.mock.calls.length;
    expect(callsAfterInit).toBeGreaterThan(0);

    browseContext.requestContentRefresh();
    fixture.detectChanges();

    expect(mockBrowseService.getBrowseFolderContents.mock.calls.length).toBeGreaterThan(
      callsAfterInit,
    );
  });

  it('notifyClipboardPasteComplete merges pasted documents into current folder listing', () => {
    const browseContext = TestBed.inject(BrowseContextService);
    const folder: NuxeoDocument = {
      uid: 'folder-1',
      title: 'Target Folder',
      type: 'Folder',
      path: '/default-domain/workspaces/folder-1',
      lastModified: '',
      properties: {},
      contextParameters: { permissions: ['AddChildren'] },
    };
    mockBrowseService.getBrowseFolderContents.mockReturnValue(
      of({ folder, entries: [], totalSize: 0 }),
    );
    mockBrowseService.getFolderContext.mockReturnValue(of(folder));

    fixture.detectChanges();
    component.currentDoc.set(folder);
    component.entries.set([]);
    component.totalSize.set(0);

    const pasted: NuxeoDocument = {
      uid: 'copy-1',
      title: 'Copied File',
      type: 'File',
      path: '/default-domain/workspaces/folder-1/copied-file',
      lastModified: '',
      properties: {},
    };

    browseContext.notifyClipboardPasteComplete({
      targetUid: 'folder-1',
      documents: [pasted],
      action: 'copy',
    });
    fixture.detectChanges();

    expect(component.entries().some((entry) => entry.uid === 'copy-1')).toBe(true);
    expect(component.totalSize()).toBe(1);
  });

  it('toggleSelection delegates to SelectionService with doc title (NXSAT-179)', () => {
    const doc: NuxeoDocument = {
      uid: 'doc-1',
      title: 'Quarterly Report',
      type: 'File',
      path: '/workspaces/quarterly-report',
      lastModified: '',
      properties: {},
    };
    component.entries.set([doc]);

    component.toggleSelection('doc-1');

    expect(mockSelectionService.toggle).toHaveBeenCalledWith(
      'doc-1',
      'Quarterly Report',
      null,
      'File',
    );
  });

  it('selectionAriaLabel includes document title for checkbox accessibility', () => {
    const doc: NuxeoDocument = {
      uid: 'doc-1',
      title: 'Quarterly Report',
      type: 'File',
      path: '/workspaces/quarterly-report',
      lastModified: '',
      properties: {},
    };

    expect(component.selectionAriaLabel(doc)).toBe('Select Quarterly Report');
  });

  it('openEditDialog refreshes browse tree after metadata update (NXSAT-164)', () => {
    const browseContext = TestBed.inject(BrowseContextService);
    const refreshSpy = vi.spyOn(browseContext, 'requestTreeRefresh');
    const updated: NuxeoDocument = {
      uid: 'domain-1',
      title: 'Domain Renamed',
      type: 'Domain',
      path: '/default-domain',
      lastModified: '',
      properties: {},
    };
    dialogOpenSpy.mockReturnValue({ afterClosed: () => of(updated) });
    component.currentDoc.set({
      uid: 'domain-1',
      title: 'Domain',
      type: 'Domain',
      path: '/default-domain',
      lastModified: '',
      properties: {},
      contextParameters: { permissions: ['Write'] },
    } as NuxeoDocument);

    component.openEditDialog();

    expect(refreshSpy).toHaveBeenCalled();
  });

  it('breadcrumbs use document title for the current folder segment', () => {
    component.currentDoc.set({
      uid: 'domain-2',
      title: 'Renamed Domain',
      type: 'Domain',
      path: '/Domain 2',
      lastModified: '',
      properties: {},
    });

    expect(component.breadcrumbs()).toEqual([
      { label: 'Root', href: '/browse' },
      { label: 'Renamed Domain' },
    ]);
  });

  it('breadcrumbs do not throw when a path segment contains a literal percent sign', () => {
    component.currentDoc.set({
      uid: 'folder-1',
      title: 'Current Folder',
      type: 'Folder',
      path: '/100% done',
      lastModified: '',
      properties: {},
    });

    expect(() => component.breadcrumbs()).not.toThrow();
    expect(component.breadcrumbs()).toEqual([
      { label: 'Root', href: '/browse' },
      { label: 'Current Folder' },
    ]);
  });

  it('hides breadcrumbs for non-admins viewing another user personal workspace (NXSAT-204)', () => {
    component.currentDoc.set({
      uid: 'ws-other',
      title: 'alice workspace',
      type: 'Workspace',
      path: '/default-domain/UserWorkspaces/alice',
      lastModified: '',
      properties: {},
    });

    expect(component.showBreadcrumbs()).toBe(false);
  });

  it('shows breadcrumbs for non-admins in their own personal workspace (NXSAT-204)', () => {
    component.currentDoc.set({
      uid: 'ws-self',
      title: 'jdoe workspace',
      type: 'Workspace',
      path: '/default-domain/UserWorkspaces/jdoe',
      lastModified: '',
      properties: {},
    });

    expect(component.showBreadcrumbs()).toBe(true);
  });

  it('blocks deleting a Collections folder that still has child collections (NXSAT-204)', () => {
    component.currentDoc.set({
      uid: 'cols-root',
      title: 'Collections',
      type: 'Collections',
      path: '/default-domain/UserWorkspaces/jdoe/Collections',
      lastModified: '',
      properties: {},
      contextParameters: { permissions: ['Everything'] },
    } as NuxeoDocument);
    component.entries.set([
      {
        uid: 'col-1',
        title: 'My Collection',
        type: 'Collection',
        path: '/default-domain/UserWorkspaces/jdoe/Collections/my-collection',
        lastModified: '',
        properties: {},
      },
    ]);

    component.deleteDocument();

    expect(dialogOpenSpy).not.toHaveBeenCalled();
    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      'Remove all collections from this folder before deleting it.',
      'OK',
      { duration: 5000 },
    );
  });

  it('blocks deleting a Collections folder when collections exist but are filtered out of the view', () => {
    component.currentDoc.set({
      uid: 'cols-root',
      title: 'Collections',
      type: 'Collections',
      path: '/default-domain/UserWorkspaces/jdoe/Collections',
      lastModified: '',
      properties: {},
      contextParameters: { permissions: ['Everything'] },
    } as NuxeoDocument);
    component.entries.set([
      {
        uid: 'col-1',
        title: 'My Collection',
        type: 'Collection',
        path: '/default-domain/UserWorkspaces/jdoe/Collections/my-collection',
        lastModified: '',
        properties: {},
      },
    ]);
    component.filterType.set('Folder');

    component.deleteDocument();

    expect(dialogOpenSpy).not.toHaveBeenCalled();
    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      'Remove all collections from this folder before deleting it.',
      'OK',
      { duration: 5000 },
    );
  });

  it('allows deleting a Collections folder when only non-collection children are listed', () => {
    component.currentDoc.set({
      uid: 'cols-root',
      title: 'Collections',
      type: 'Collections',
      path: '/default-domain/UserWorkspaces/jdoe/Collections',
      lastModified: '',
      properties: {},
      contextParameters: { permissions: ['Remove'] },
    } as NuxeoDocument);
    component.entries.set([
      {
        uid: 'folder-1',
        title: 'Notes',
        type: 'Folder',
        path: '/default-domain/UserWorkspaces/jdoe/Collections/notes',
        lastModified: '',
        properties: {},
      },
    ]);

    component.deleteDocument();

    expect(mockBrowseService.hasChildCollections).toHaveBeenCalledWith('cols-root');
    expect(dialogOpenSpy).toHaveBeenCalled();
  });

  it('blocks deleting a Collections folder when child collections exist only on the server (NXSAT-204)', () => {
    mockBrowseService.hasChildCollections.mockReturnValueOnce(of(true));
    component.currentDoc.set({
      uid: 'cols-root',
      title: 'Collections',
      type: 'Collections',
      path: '/default-domain/UserWorkspaces/jdoe/Collections',
      lastModified: '',
      properties: {},
      contextParameters: { permissions: ['Everything'] },
    } as NuxeoDocument);
    component.entries.set([]);

    component.deleteDocument();

    expect(mockBrowseService.hasChildCollections).toHaveBeenCalledWith('cols-root');
    expect(dialogOpenSpy).not.toHaveBeenCalled();
    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      'Remove all collections from this folder before deleting it.',
      'OK',
      { duration: 5000 },
    );
  });

  it('onRowClick opens collection view for Collection documents (Web UI parity)', () => {
    const navigateSpy = vi.spyOn(component['router'], 'navigateByUrl');
    component.onRowClick({
      uid: 'col-1',
      title: 'My Collection',
      type: 'Collection',
      path: '/default-domain/UserWorkspaces/jdoe/Collections/my-collection',
      lastModified: '',
      properties: {},
    });

    expect(navigateSpy).toHaveBeenCalledWith('/collections/col-1');
  });

  it('openEditDialog opens Edit Collection dialog when a single collection is selected', () => {
    const collection: NuxeoDocument = {
      uid: 'col-1',
      title: 'My Collection',
      type: 'Collection',
      path: '/default-domain/UserWorkspaces/jdoe/Collections/my-collection',
      lastModified: '',
      properties: {},
    };
    mockSelectionService.selectedIds.mockReturnValue(new Set(['col-1']));
    mockSelectionService.selectedCount.mockReturnValue(1);
    component.entries.set([collection]);
    mockDocumentDetailService.getFullDocument.mockReturnValue(
      of({
        ...collection,
        contextParameters: { permissions: ['WriteProperties'] },
      } as NuxeoDocument),
    );
    dialogOpenSpy.mockReturnValue({ afterClosed: () => of(undefined) });

    component.openEditDialog();

    expect(mockDocumentDetailService.getFullDocument).toHaveBeenCalledWith('col-1');
    expect(dialogOpenSpy).toHaveBeenCalled();
  });

  it('deleteCollectionEntry trashes the collection after confirmation', () => {
    const collection: NuxeoDocument = {
      uid: 'col-2',
      title: 'Archive',
      type: 'Collection',
      path: '/default-domain/UserWorkspaces/jdoe/Collections/archive',
      lastModified: '',
      properties: {},
    };
    mockDocumentDetailService.getFullDocument.mockReturnValue(
      of({
        ...collection,
        contextParameters: { permissions: ['Remove'] },
      } as NuxeoDocument),
    );
    mockDocumentDetailService.trashDocument.mockReturnValue(of({ uid: 'col-2' } as NuxeoDocument));
    dialogOpenSpy.mockReturnValue({ afterClosed: () => of(true) });
    const refreshSpy = vi.spyOn(TestBed.inject(BrowseContextService), 'requestTreeRefresh');
    const loadSpy = vi.spyOn(component, 'loadContent');

    component.deleteCollectionEntry(collection);

    expect(mockDocumentDetailService.trashDocument).toHaveBeenCalledWith('col-2');
    expect(refreshSpy).toHaveBeenCalled();
    expect(loadSpy).toHaveBeenCalled();
    expect(mockSelectionService.clear).toHaveBeenCalled();
  });

  it('deleteDocument confirms bulk trash for selected children, not the browsed folder', () => {
    mockSelectionService.selectedCount.mockReturnValue(3);
    mockSelectionService.selectedIds.mockReturnValue(new Set(['doc-1', 'doc-2', 'doc-3']));
    mockDocumentDetailService.getFullDocument.mockImplementation((uid: string) =>
      of({
        uid,
        title: uid,
        type: 'File',
        path: `/workspaces/${uid}`,
        lastModified: '',
        properties: {},
        contextParameters: { permissions: ['Remove'] },
      } as NuxeoDocument),
    );
    component.currentDoc.set({
      uid: 'folder-1',
      title: 'Akshitha',
      type: 'Workspace',
      path: '/workspaces/Akshitha',
      lastModified: '',
      properties: {},
      contextParameters: { permissions: ['Everything'] },
    } as NuxeoDocument);

    component.deleteDocument();

    expect(dialogOpenSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: trashSelectedDocumentsConfirmData(3),
      }),
    );
    expect(mockDocumentDetailService.trashDocument).not.toHaveBeenCalled();
  });

  it('deleteSelectedDocuments reuses listed entries that already include permissions', () => {
    mockSelectionService.selectedCount.mockReturnValue(1);
    mockSelectionService.selectedIds.mockReturnValue(new Set(['doc-1']));
    component.entries.set([
      {
        uid: 'doc-1',
        title: 'File',
        type: 'File',
        path: '/workspaces/doc-1',
        lastModified: '',
        properties: {},
        contextParameters: { permissions: ['Remove'] },
      } as NuxeoDocument,
    ]);
    mockDocumentDetailService.getFullDocument.mockClear();
    mockDocumentDetailService.trashDocument.mockReturnValue(of({ uid: 'doc-1' } as NuxeoDocument));
    dialogOpenSpy.mockReturnValue({ afterClosed: () => of(true) });

    component.deleteDocument();

    expect(mockDocumentDetailService.getFullDocument).not.toHaveBeenCalled();
    expect(mockDocumentDetailService.trashDocument).toHaveBeenCalledWith('doc-1');
  });

  it('deleteSelectedDocuments reports items that could not be loaded', () => {
    mockSelectionService.selectedCount.mockReturnValue(2);
    mockSelectionService.selectedIds.mockReturnValue(new Set(['doc-1', 'doc-2']));
    component.entries.set([
      {
        uid: 'doc-1',
        title: 'File 1',
        type: 'File',
        path: '/workspaces/doc-1',
        lastModified: '',
        properties: {},
        contextParameters: { permissions: ['Remove'] },
      } as NuxeoDocument,
    ]);
    mockDocumentDetailService.getFullDocument.mockImplementation((uid: string) =>
      uid === 'doc-2' ? throwError(() => new Error('not found')) : EMPTY,
    );
    mockDocumentDetailService.trashDocument.mockReturnValue(of({ uid: 'doc-1' } as NuxeoDocument));
    dialogOpenSpy.mockReturnValue({ afterClosed: () => of(true) });

    component.deleteDocument();

    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      'Skipped 1 item(s) that could not be loaded',
      'OK',
      { duration: 5000 },
    );
    expect(mockDocumentDetailService.trashDocument).toHaveBeenCalledWith('doc-1');
    expect(snackBarOpenSpy).toHaveBeenCalledWith('Moved to trash', 'OK', { duration: 3000 });
  });

  it('deleteSelectedDocuments blocks when all selected documents fail to load', () => {
    mockSelectionService.selectedCount.mockReturnValue(2);
    mockSelectionService.selectedIds.mockReturnValue(new Set(['doc-1', 'doc-2']));
    component.entries.set([]);
    mockDocumentDetailService.getFullDocument.mockReturnValue(
      throwError(() => new Error('not found')),
    );
    dialogOpenSpy.mockReturnValue({ afterClosed: () => of(true) });

    component.deleteDocument();

    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      'Failed to load selected documents for deletion',
      'OK',
      { duration: 5000 },
    );
    expect(mockDocumentDetailService.trashDocument).not.toHaveBeenCalled();
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
