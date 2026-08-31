import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { EMPTY, Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AppConfigService } from '@nuxeo-satori/platform/app-config';
import {
  ADMIN_ACCESS_CHECKS,
  BrowseService,
  CURRENT_USERNAME,
  DirectoryService,
  DocumentDetailService,
  SelectionService,
  TagService,
  mailSendFailureMessage,
  type NuxeoAce,
  type NuxeoAcl,
  type NuxeoDocument,
} from '@nuxeo-satori/platform/nuxeo-client';

import { BrowseComponent } from './browse';

function doc(overrides: Partial<NuxeoDocument> & Pick<NuxeoDocument, 'uid'>): NuxeoDocument {
  return {
    title: 'Workspace',
    type: 'Workspace',
    path: '/default-domain/workspaces/ws-1',
    lastModified: '2026-01-01T00:00:00.000Z',
    properties: {},
    ...overrides,
  };
}

function ace(overrides: Partial<NuxeoAce> & Pick<NuxeoAce, 'id'>): NuxeoAce {
  return {
    username: 'members',
    externalUser: false,
    permission: 'Read',
    granted: true,
    creator: 'Administrator',
    begin: null,
    end: null,
    status: 'effective',
    ...overrides,
  };
}

function withAcls(acls: NuxeoAcl[], permissions: string[] = ['Everything']): NuxeoDocument {
  return doc({ uid: 'ws-1', contextParameters: { acls, permissions } });
}

const emptyAuditLog = {
  entries: [],
  totalSize: 0,
  currentPageSize: 0,
  currentPageIndex: 0,
  numberOfPages: 0,
};

type BrowseReturn<K extends keyof BrowseService> = ReturnType<BrowseService[K]>;
type DetailReturn<K extends keyof DocumentDetailService> = ReturnType<DocumentDetailService[K]>;

const browse = {
  getByPath: vi.fn((): BrowseReturn<'getByPath'> => EMPTY),
  getBrowseFolderContents: vi.fn((): BrowseReturn<'getBrowseFolderContents'> => EMPTY),
  getFolderContext: vi.fn((): BrowseReturn<'getFolderContext'> => EMPTY),
  getChildren: vi.fn((): BrowseReturn<'getChildren'> => EMPTY),
  hasChildCollections: vi.fn((): BrowseReturn<'hasChildCollections'> => of(false)),
  getTrashedChildren: vi.fn((): BrowseReturn<'getTrashedChildren'> => EMPTY),
  restoreDocument: vi.fn((): BrowseReturn<'restoreDocument'> => EMPTY),
  startCsvExport: vi.fn((): BrowseReturn<'startCsvExport'> => EMPTY),
  pollAndDownloadCsv: vi.fn((): BrowseReturn<'pollAndDownloadCsv'> => EMPTY),
};

const detail = {
  getFullDocument: vi.fn((): DetailReturn<'getFullDocument'> => EMPTY),
  getDocumentPermissions: vi.fn((): DetailReturn<'getDocumentPermissions'> => EMPTY),
  fetchThumbnail: vi.fn((): DetailReturn<'fetchThumbnail'> => EMPTY),
  getAuditLog: vi.fn((): DetailReturn<'getAuditLog'> => of(emptyAuditLog)),
  trashDocument: vi.fn((): DetailReturn<'trashDocument'> => EMPTY),
  blockPermissionInheritance: vi.fn((): DetailReturn<'blockPermissionInheritance'> => EMPTY),
  unblockPermissionInheritance: vi.fn((): DetailReturn<'unblockPermissionInheritance'> => EMPTY),
  sendNotificationEmailForPermission: vi.fn(
    (): DetailReturn<'sendNotificationEmailForPermission'> => EMPTY,
  ),
};

const manifest = signal<{ extensions?: unknown }>({});

/**
 * The Permissions tab: what the three ACL lists derive from the document, and
 * each dialog and operation in both branches.
 *
 * `browse.spec.ts` already covers `localAces`, the permissions-tab load and the
 * notification-email pair; those are not repeated here. What was untested was the
 * inherited and external lists, the inheritance toggle, and the four dialogs that
 * only reload permissions when the dialog reports it changed something.
 */
describe('BrowseComponent — permissions tab', () => {
  let component: BrowseComponent;
  let fixture: ComponentFixture<BrowseComponent>;
  let snackBar: ReturnType<typeof vi.fn>;
  let dialogOpen: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    snackBar = vi.fn();
    dialogOpen = vi.fn(() => ({ afterClosed: () => of(undefined) }));
    // `vi.clearAllMocks()` clears recorded calls but keeps implementations, and the
    // component issues its first folder request from the constructor — so without
    // this reset each test inherits the previous test's listing.
    browse.getBrowseFolderContents.mockReturnValue(EMPTY);
    browse.getFolderContext.mockReturnValue(EMPTY);
    detail.getDocumentPermissions.mockReturnValue(EMPTY);
    detail.blockPermissionInheritance.mockReturnValue(EMPTY);
    detail.unblockPermissionInheritance.mockReturnValue(EMPTY);
    detail.sendNotificationEmailForPermission.mockReturnValue(EMPTY);
    detail.getAuditLog.mockReturnValue(of(emptyAuditLog));

    manifest.set({});
    await TestBed.configureTestingModule({
      imports: [BrowseComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([], withDisabledInitialNavigation()),
        { provide: BrowseService, useValue: browse },
        { provide: DocumentDetailService, useValue: detail },
        {
          provide: DirectoryService,
          useValue: { getEventTypes: vi.fn(() => of([])), getEventCategories: vi.fn(() => of([])) },
        },
        { provide: TagService, useValue: { searchTags: vi.fn(() => of([])) } },
        { provide: CURRENT_USERNAME, useValue: () => 'jdoe' },
        {
          provide: ADMIN_ACCESS_CHECKS,
          useValue: {
            isAdministrator: () => false,
            isPowerUser: () => false,
            hasAdministrationAccess: () => false,
          },
        },
        { provide: MatSnackBar, useValue: { open: snackBar } },
        { provide: MatDialog, useValue: { open: dialogOpen } },
        { provide: AppConfigService, useValue: { manifest } },
      ],
    })
      .overrideComponent(BrowseComponent, { set: { imports: [], template: '<div></div>' } })
      .compileComponents();

    fixture = TestBed.createComponent(BrowseComponent);
    component = fixture.componentInstance;
    TestBed.inject(SelectionService).clear();
  });

  afterEach(() => fixture.destroy());

  function dialogData<T>(call = 0): T {
    return (dialogOpen.mock.calls[call][1] as { data: T }).data;
  }

  // ── Derived ACL lists ──

  it('derives the three ACL lists from one document, keeping each to its own entries', () => {
    component.currentDoc.set(
      withAcls([
        {
          name: 'local',
          aces: [
            ace({ id: 'l-1', username: 'members' }),
            ace({ id: 'l-2', username: 'transient/guest@example.com', externalUser: true }),
          ],
        },
        {
          name: 'inherited',
          aces: [
            ace({ id: 'i-1', username: 'administrators', permission: 'Everything' }),
            ace({ id: 'i-2', username: 'revoked', granted: false }),
          ],
        },
      ]),
    );

    expect(component.localAces().map((a) => a.id)).toEqual(['l-1']);
    expect(component.inheritedAces().map((a) => a.id)).toEqual(['i-1']);
    expect(component.externalAces().map((a) => a.id)).toEqual(['l-2']);
    expect(component.isInheritanceBlocked()).toBe(false);
  });

  it('reports inheritance as blocked exactly when no inherited ACL is present', () => {
    component.currentDoc.set(withAcls([{ name: 'local', aces: [] }]));
    expect(component.isInheritanceBlocked()).toBe(true);

    component.currentDoc.set(
      withAcls([
        { name: 'local', aces: [] },
        { name: 'inherited', aces: [] },
      ]),
    );
    expect(component.isInheritanceBlocked()).toBe(false);
  });

  it('yields empty ACL lists and unblocked inheritance before the document has loaded', () => {
    expect(component.localAces()).toEqual([]);
    expect(component.inheritedAces()).toEqual([]);
    expect(component.externalAces()).toEqual([]);
    expect(component.isInheritanceBlocked()).toBe(false);
  });

  it('yields empty ACL lists for a document loaded without the acls enricher', () => {
    component.currentDoc.set(doc({ uid: 'ws-1', contextParameters: {} }));

    expect(component.localAces()).toEqual([]);
    expect(component.inheritedAces()).toEqual([]);
    expect(component.externalAces()).toEqual([]);
    expect(component.isInheritanceBlocked()).toBe(false);
  });

  // ── Loading ──

  it('merges the permissions response into the existing document rather than replacing it', () => {
    component.currentDoc.set(
      doc({ uid: 'ws-1', contextParameters: { favorites: { isFavorite: true } } }),
    );
    detail.getDocumentPermissions.mockReturnValue(
      of(withAcls([{ name: 'local', aces: [ace({ id: 'l-1' })] }])),
    );

    component.onTabChange(1);

    expect(component.currentDoc()?.contextParameters?.['favorites']).toEqual({ isFavorite: true });
    expect(component.localAces().map((a) => a.id)).toEqual(['l-1']);
  });

  it('does not request permissions for a tab opened before any document has loaded', () => {
    component.onTabChange(1);

    expect(detail.getDocumentPermissions).not.toHaveBeenCalled();
    expect(component.permissionsLoaded()).toBe(false);
    expect(component.permissionsLoading()).toBe(false);
  });

  it('surfaces a failed permissions load and clears the loading flag', () => {
    component.currentDoc.set(doc({ uid: 'ws-1' }));
    detail.getDocumentPermissions.mockReturnValue(throwError(() => ({ status: 500 })));

    component.onTabChange(1);

    expect(component.permissionsLoading()).toBe(false);
    expect(component.permissionsLoaded()).toBe(false);
    expect(snackBar).toHaveBeenCalledWith('Failed to load permissions', 'OK', { duration: 4000 });
  });

  it('does not issue a second permissions request while the first is in flight', () => {
    component.currentDoc.set(doc({ uid: 'ws-1' }));
    detail.getDocumentPermissions.mockReturnValue(new Subject<never>());

    component.onTabChange(1);
    component.onTabChange(1);

    expect(detail.getDocumentPermissions).toHaveBeenCalledTimes(1);
    expect(component.permissionsLoading()).toBe(true);
  });

  // ── Add / edit / delete ──

  it('addPermission reloads the ACLs only when the dialog reports a new entry', () => {
    component.currentDoc.set(doc({ uid: 'ws-1' }));
    detail.getDocumentPermissions.mockReturnValue(of(withAcls([{ name: 'local', aces: [] }])));

    dialogOpen.mockReturnValue({ afterClosed: () => of(false) });
    component.addPermission();
    expect(dialogData<{ documentUid: string }>().documentUid).toBe('ws-1');
    expect(detail.getDocumentPermissions).not.toHaveBeenCalled();

    dialogOpen.mockReturnValue({ afterClosed: () => of(true) });
    component.addPermission();
    expect(detail.getDocumentPermissions).toHaveBeenCalledWith('ws-1');
    expect(snackBar).toHaveBeenCalledWith('Permission added', 'OK', { duration: 3000 });
  });

  it('editPermission passes the ACE through and reloads on a confirmed update', () => {
    component.currentDoc.set(doc({ uid: 'ws-1' }));
    detail.getDocumentPermissions.mockReturnValue(of(withAcls([{ name: 'local', aces: [] }])));
    dialogOpen.mockReturnValue({ afterClosed: () => of(true) });
    const target = ace({ id: 'l-1', permission: 'ReadWrite' });

    component.editPermission(target);

    expect(dialogData<{ documentUid: string; ace: NuxeoAce }>()).toEqual({
      documentUid: 'ws-1',
      ace: target,
    });
    expect(detail.getDocumentPermissions).toHaveBeenCalledWith('ws-1');
    expect(snackBar).toHaveBeenCalledWith('Permission updated', 'OK', { duration: 3000 });
  });

  it('deletePermission shows the human-readable permission and timeframe in the confirmation', () => {
    component.currentDoc.set(doc({ uid: 'ws-1' }));
    detail.getDocumentPermissions.mockReturnValue(of(withAcls([{ name: 'local', aces: [] }])));
    dialogOpen.mockReturnValue({ afterClosed: () => of(true) });
    const target = ace({ id: 'l-1', permission: 'ReadWrite', end: '2026-12-31T00:00:00.000Z' });

    component.deletePermission(target);

    const data = dialogData<{ permissionLabel: string; timeFrameLabel: string }>();
    expect(data.permissionLabel).toBe('Edit');
    expect(data.timeFrameLabel).toContain('Until');
    expect(snackBar).toHaveBeenCalledWith('Permission deleted', 'OK', { duration: 3000 });
  });

  it('deletePermission leaves the ACLs alone when the confirmation is dismissed', () => {
    component.currentDoc.set(doc({ uid: 'ws-1' }));
    dialogOpen.mockReturnValue({ afterClosed: () => of(false) });

    component.deletePermission(ace({ id: 'l-1' }));

    expect(detail.getDocumentPermissions).not.toHaveBeenCalled();
    expect(snackBar).not.toHaveBeenCalled();
  });

  it('shareWithExternal reloads the ACLs only when a share was created', () => {
    component.currentDoc.set(doc({ uid: 'ws-1' }));
    detail.getDocumentPermissions.mockReturnValue(of(withAcls([{ name: 'local', aces: [] }])));

    dialogOpen.mockReturnValue({ afterClosed: () => of(undefined) });
    component.shareWithExternal();
    expect(detail.getDocumentPermissions).not.toHaveBeenCalled();

    dialogOpen.mockReturnValue({ afterClosed: () => of(true) });
    component.shareWithExternal();
    expect(snackBar).toHaveBeenCalledWith('Shared with external user', 'OK', { duration: 3000 });
  });

  it('editExternalPermission marks the dialog as external', () => {
    component.currentDoc.set(doc({ uid: 'ws-1' }));
    detail.getDocumentPermissions.mockReturnValue(of(withAcls([{ name: 'local', aces: [] }])));
    dialogOpen.mockReturnValue({ afterClosed: () => of(true) });

    component.editExternalPermission(ace({ id: 'x-1', externalUser: true }));

    expect(dialogData<{ isExternal: boolean }>().isExternal).toBe(true);
    expect(detail.getDocumentPermissions).toHaveBeenCalledWith('ws-1');
  });

  it('opens no permission dialog at all without a browsed document', () => {
    component.addPermission();
    component.editPermission(ace({ id: 'l-1' }));
    component.deletePermission(ace({ id: 'l-1' }));
    component.shareWithExternal();
    component.editExternalPermission(ace({ id: 'l-1' }));
    component.sendNotificationEmail(ace({ id: 'l-1' }));
    component.toggleInheritance();

    expect(dialogOpen).not.toHaveBeenCalled();
    expect(detail.blockPermissionInheritance).not.toHaveBeenCalled();
    expect(detail.sendNotificationEmailForPermission).not.toHaveBeenCalled();
  });

  // ── Inheritance ──

  it('toggleInheritance blocks inheritance when it is currently inherited', () => {
    component.currentDoc.set(
      withAcls([
        { name: 'local', aces: [] },
        { name: 'inherited', aces: [] },
      ]),
    );
    detail.blockPermissionInheritance.mockReturnValue(of(doc({ uid: 'ws-1' })));
    detail.getDocumentPermissions.mockReturnValue(of(withAcls([{ name: 'local', aces: [] }])));

    component.toggleInheritance();

    expect(detail.blockPermissionInheritance).toHaveBeenCalledWith('ws-1');
    expect(detail.unblockPermissionInheritance).not.toHaveBeenCalled();
    expect(component.actionInProgress()).toBeNull();
    expect(component.isInheritanceBlocked()).toBe(true);
    expect(snackBar).toHaveBeenCalledWith('Inheritance blocked', 'OK', { duration: 3000 });
  });

  it('toggleInheritance unblocks inheritance when it is currently blocked', () => {
    component.currentDoc.set(withAcls([{ name: 'local', aces: [] }]));
    detail.unblockPermissionInheritance.mockReturnValue(of(doc({ uid: 'ws-1' })));
    detail.getDocumentPermissions.mockReturnValue(
      of(
        withAcls([
          { name: 'local', aces: [] },
          { name: 'inherited', aces: [] },
        ]),
      ),
    );

    component.toggleInheritance();

    expect(detail.unblockPermissionInheritance).toHaveBeenCalledWith('ws-1');
    expect(component.isInheritanceBlocked()).toBe(false);
    expect(snackBar).toHaveBeenCalledWith('Inheritance unblocked', 'OK', { duration: 3000 });
  });

  it('toggleInheritance releases the in-progress flag when the operation fails', () => {
    component.currentDoc.set(withAcls([{ name: 'local', aces: [] }]));
    detail.unblockPermissionInheritance.mockReturnValue(throwError(() => ({ status: 403 })));

    component.toggleInheritance();

    expect(component.actionInProgress()).toBeNull();
    expect(detail.getDocumentPermissions).not.toHaveBeenCalled();
    expect(component.isInheritanceBlocked()).toBe(true);
    expect(snackBar).toHaveBeenCalledWith('Action failed', 'OK', { duration: 3000 });
  });

  it('toggleInheritance ignores a second press while an operation is running', () => {
    component.currentDoc.set(withAcls([{ name: 'local', aces: [] }]));
    detail.unblockPermissionInheritance.mockReturnValue(new Subject<never>());

    component.toggleInheritance();
    component.toggleInheritance();

    expect(detail.unblockPermissionInheritance).toHaveBeenCalledTimes(1);
    expect(component.actionInProgress()).toBe('inheritance');
  });

  it('sendNotificationEmail ignores a second press while a send is running', () => {
    component.currentDoc.set(doc({ uid: 'ws-1' }));
    detail.sendNotificationEmailForPermission.mockReturnValue(new Subject<never>());

    component.sendNotificationEmail(ace({ id: 'l-1' }));
    component.sendNotificationEmail(ace({ id: 'l-1' }));

    expect(detail.sendNotificationEmailForPermission).toHaveBeenCalledTimes(1);
    expect(component.actionInProgress()).toBe('notify-l-1');
  });

  it('sendNotificationEmail reports a generic failure that is not an SMTP failure', () => {
    component.currentDoc.set(doc({ uid: 'ws-1' }));
    detail.sendNotificationEmailForPermission.mockReturnValue(throwError(() => ({ status: 500 })));

    component.sendNotificationEmail(ace({ id: 'l-1' }));

    expect(component.actionInProgress()).toBeNull();
    expect(snackBar).toHaveBeenCalledWith('Failed to send notification', 'OK', { duration: 7000 });
    expect(snackBar).not.toHaveBeenCalledWith(mailSendFailureMessage('send'), 'OK', {
      duration: 7000,
    });
  });

  // ── ACE presentation ──

  it('permissionIcon distinguishes the four named permissions and locks the rest', () => {
    expect(component.permissionIcon('Everything')).toBe('admin_panel_settings');
    expect(component.permissionIcon('ReadWrite')).toBe('edit');
    expect(component.permissionIcon('Read')).toBe('visibility');
    expect(component.permissionIcon('Write')).toBe('create');
    expect(component.permissionIcon('ReadCanCollect')).toBe('lock');
  });

  it('permissionLabel translates the known permissions and passes anything else through', () => {
    expect(component.permissionLabel('Everything')).toBe('Manage everything');
    expect(component.permissionLabel('ReadWrite')).toBe('Edit');
    expect(component.permissionLabel('ReadRemove')).toBe('Read & Remove');
    expect(component.permissionLabel('AddChildren')).toBe('Add Children');
    expect(component.permissionLabel('ManageWorkflows')).toBe('Manage Workflows');
    expect(component.permissionLabel('ReadCanCollect')).toBe('Can collect');
    expect(component.permissionLabel('CustomFromMarketplace')).toBe('CustomFromMarketplace');
  });

  it('aceTimeFrame covers permanent, open-ended, until-only and bounded ACEs', () => {
    expect(component.aceTimeFrame(ace({ id: 'a' }))).toBe('Permanent');
    expect(component.aceTimeFrame(ace({ id: 'b', end: '2026-12-31T00:00:00.000Z' }))).toMatch(
      /^Until \w{3} \d{2}, 2026$/,
    );
    expect(component.aceTimeFrame(ace({ id: 'c', begin: '2026-07-01T00:00:00.000Z' }))).toMatch(
      /^from \w{3} \d{2}, 2026$/,
    );
    expect(
      component.aceTimeFrame(
        ace({ id: 'd', begin: '2026-07-01T00:00:00.000Z', end: '2026-12-31T00:00:00.000Z' }),
      ),
    ).toMatch(/^from \w{3} \d{2}, 2026 to \w{3} \d{2}, 2026$/);
  });

  it('displayUsername strips the transient prefix from an externally shared principal', () => {
    expect(
      component.displayUsername(ace({ id: 'a', username: 'transient/guest@example.com' })),
    ).toBe('guest@example.com');
    expect(component.displayUsername(ace({ id: 'b', username: 'members' }))).toBe('members');
  });

  it('aceGrantedBy falls back to a dash when the ACE records no creator', () => {
    expect(component.aceGrantedBy(ace({ id: 'a', creator: 'Administrator' }))).toBe(
      'Administrator',
    );
    expect(component.aceGrantedBy(ace({ id: 'b', creator: null }))).toBe('—');
    expect(component.aceGrantedBy(ace({ id: 'c', creator: '' }))).toBe('—');
  });
});
