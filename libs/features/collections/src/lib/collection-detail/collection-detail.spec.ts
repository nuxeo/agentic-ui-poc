import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  Router,
  withDisabledInitialNavigation,
} from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  CollectionService,
  DocumentDetailService,
  DirectoryService,
  NuxeoDocument,
} from '@nuxeo-satori/platform/nuxeo-client';

import { CollectionDetailComponent } from './collection-detail';

const mockCollectionService = {
  getById: vi.fn(() => of(null)),
  getCollectionMembers: vi.fn(() => of({ entries: [], totalSize: 0 })),
  addToCollection: vi.fn(() => of(undefined)),
  removeFromCollection: vi.fn(() => of(undefined)),
  delete: vi.fn(() => of(undefined)),
};

const mockDetailService = {
  getFullDocument: vi.fn(() => of(null)),
  fetchThumbnail: vi.fn(() => of(null)),
  lockDocument: vi.fn(() => of(undefined)),
  unlockDocument: vi.fn(() => of(undefined)),
  subscribe: vi.fn(() => of(undefined)),
  unsubscribe: vi.fn(() => of(undefined)),
  trashDocument: vi.fn(() => of(undefined)),
  getAuditLog: vi.fn(() => of({ entries: [], totalSize: 0 })),
  exportDocument: vi.fn(() => of(new Blob())),
};

const mockDirectoryService = {
  getDirectoryEntries: vi.fn(() => of([])),
};

const mockDialog = {
  open: vi.fn(() => ({ afterClosed: () => of(undefined) })),
};

const mockSnackBar = {
  open: vi.fn(),
};

const mockCollection: NuxeoDocument = {
  'entity-type': 'document',
  uid: 'collection-1',
  path: '/default-domain/workspaces/collections/test',
  type: 'Collection',
  state: 'project',
  title: 'Test Collection',
  properties: {
    'dc:title': 'Test Collection',
    'dc:description': 'A test collection',
    'dc:creator': 'admin',
    'dc:created': '2026-08-20T10:00:00.000Z',
    'dc:modified': '2026-08-24T15:30:00.000Z',
    'dc:lastContributor': 'admin',
  },
  facets: [],
  changeToken: '1-0',
  contextParameters: {
    acls: [
      {
        name: 'local',
        aces: [
          {
            username: 'admin',
            permission: 'Everything',
            granted: true,
            creator: 'system',
            begin: null,
            end: null,
            status: 'effective',
            externalUser: false,
          },
        ],
      },
      {
        name: 'inherited',
        aces: [
          {
            username: 'members',
            permission: 'Read',
            granted: true,
            creator: 'system',
            begin: null,
            end: null,
            status: 'effective',
            externalUser: false,
          },
        ],
      },
    ],
  },
};

describe('CollectionDetailComponent', () => {
  let component: CollectionDetailComponent;
  let fixture: ComponentFixture<CollectionDetailComponent>;
  let router: Router;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockCollectionService.getById.mockReturnValue(of(mockCollection));
    mockDetailService.getFullDocument.mockReturnValue(of(mockCollection));
    mockCollectionService.getCollectionMembers.mockReturnValue(of({ entries: [], totalSize: 0 }));

    await TestBed.configureTestingModule({
      imports: [CollectionDetailComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([], withDisabledInitialNavigation()),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ uid: 'collection-1' })),
          },
        },
        { provide: CollectionService, useValue: mockCollectionService },
        { provide: DocumentDetailService, useValue: mockDetailService },
        { provide: DirectoryService, useValue: mockDirectoryService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    })
      .overrideComponent(CollectionDetailComponent, {
        set: { imports: [], template: '<div></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CollectionDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load collection on init', () => {
    expect(mockDetailService.getFullDocument).toHaveBeenCalledWith('collection-1');
  });

  it('should fallback to collectionService if detailService fails', () => {
    mockDetailService.getFullDocument.mockReturnValue(throwError(() => new Error('Not found')));
    mockCollectionService.getById.mockReturnValue(of(mockCollection));

    component['loadCollection']();

    expect(mockCollectionService.getById).toHaveBeenCalledWith('collection-1');
  });

  describe('computed signals', () => {
    it('should compute breadcrumbItems from collection path', () => {
      component.collection.set(mockCollection);
      const items = component.breadcrumbItems();
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]?.href).toContain('/browse');
    });

    it('should return empty array when collection has no path', () => {
      component.collection.set({ ...mockCollection, path: undefined } as any);
      expect(component.breadcrumbItems()).toEqual([]);
    });

    it('should compute localAces', () => {
      component.collection.set(mockCollection);
      const aces = component.localAces();
      expect(aces.length).toBeGreaterThan(0);
      expect(aces[0]?.username).toBe('admin');
    });

    it('should compute inheritedAces', () => {
      component.collection.set(mockCollection);
      const aces = component.inheritedAces();
      expect(aces.length).toBeGreaterThan(0);
      expect(aces[0]?.username).toBe('members');
    });

    it('should compute externalAces', () => {
      const colWithExternal = {
        ...mockCollection,
        contextParameters: {
          acls: [
            {
              name: 'local',
              aces: [
                {
                  username: 'external@example.com',
                  permission: 'Read',
                  granted: true,
                  creator: 'admin',
                  begin: null,
                  end: null,
                  status: 'effective',
                  externalUser: true,
                },
              ],
            },
          ],
        },
      };
      component.collection.set(colWithExternal);
      const aces = component.externalAces();
      expect(aces.length).toBeGreaterThan(0);
      expect(aces[0]?.externalUser).toBe(true);
    });

    it('should detect blocked inheritance', () => {
      const colWithoutInherited = {
        ...mockCollection,
        contextParameters: {
          acls: [{ name: 'local', aces: [] }],
        },
      };
      component.collection.set(colWithoutInherited);
      expect(component.isInheritanceBlocked()).toBe(true);
    });

    it('should detect unblocked inheritance', () => {
      component.collection.set(mockCollection);
      expect(component.isInheritanceBlocked()).toBe(false);
    });

    it('should check if collection is in clipboard', () => {
      component['collectionUid'] = 'collection-1';
      component.clipboardDocs.set([{ uid: 'collection-1', title: 'Test', path: '/' }]);
      expect(component.isInClipboard()).toBe(true);
    });
  });

  describe('onBreadcrumbClick', () => {
    it('should navigate when anchor clicked', () => {
      const navigateSpy = vi.spyOn(router, 'navigateByUrl');
      const mockEvent = {
        target: { closest: () => ({ getAttribute: () => '/browse/test' }) },
        preventDefault: vi.fn(),
      } as any;

      component.onBreadcrumbClick(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith('/browse/test');
    });

    it('should do nothing if no href', () => {
      const navigateSpy = vi.spyOn(router, 'navigateByUrl');
      const mockEvent = {
        target: { closest: () => null },
        preventDefault: vi.fn(),
      } as any;

      component.onBreadcrumbClick(mockEvent);

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('docIcon', () => {
    it('should return icon for document type', () => {
      const doc = { type: 'File' } as NuxeoDocument;
      const icon = component.docIcon(doc);
      expect(icon).toBeTruthy();
      expect(typeof icon).toBe('string');
    });
  });

  describe('lastContributor', () => {
    it('should return last contributor from properties', () => {
      const doc = {
        properties: { 'dc:lastContributor': 'john' },
      } as any;
      expect(component.lastContributor(doc)).toBe('john');
    });

    it('should return empty string when missing', () => {
      const doc = { properties: {} } as any;
      expect(component.lastContributor(doc)).toBe('');
    });
  });

  describe('contributorInitial', () => {
    it('should return first character of last contributor', () => {
      const doc = {
        properties: { 'dc:lastContributor': 'admin' },
      } as any;
      expect(component.contributorInitial(doc)).toBe('A');
    });
  });

  describe('onRowClick', () => {
    it('should navigate to document detail', () => {
      const navigateSpy = vi.spyOn(router, 'navigateByUrl');
      const doc = { uid: 'doc-123', type: 'File' } as NuxeoDocument;

      component.onRowClick(doc);

      expect(navigateSpy).toHaveBeenCalledWith('/doc/doc-123');
    });
  });

  describe('editCollection', () => {
    it('should open edit dialog', () => {
      component.collection.set(mockCollection);
      mockDialog.open.mockReturnValue({ afterClosed: () => of({ title: 'Updated' }) } as any);

      component.editCollection();

      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should do nothing when no collection', () => {
      component.collection.set(null);
      component.editCollection();
      expect(mockDialog.open).not.toHaveBeenCalled();
    });
  });

  describe('toggleLock', () => {
    it('should lock document when not locked', () => {
      component.collection.set(mockCollection);
      component.isLocked.set(false);
      mockDetailService.lockDocument.mockReturnValue(of(undefined));

      component.toggleLock();

      expect(mockDetailService.lockDocument).toHaveBeenCalledWith('collection-1');
    });

    it('should unlock document when locked', () => {
      component.collection.set(mockCollection);
      component.isLocked.set(true);
      mockDetailService.unlockDocument.mockReturnValue(of(undefined));

      component.toggleLock();

      expect(mockDetailService.unlockDocument).toHaveBeenCalledWith('collection-1');
    });

    it('should do nothing when action in progress', () => {
      component.actionInProgress.set('locking');
      component.toggleLock();
      expect(mockDetailService.lockDocument).not.toHaveBeenCalled();
    });
  });

  describe('toggleSubscription', () => {
    it('should subscribe when not subscribed', () => {
      component.collection.set(mockCollection);
      component['collectionUid'] = 'collection-1';
      component.isSubscribed.set(false);
      mockDetailService.subscribe.mockReturnValue(of(undefined));

      component.toggleSubscription();

      expect(mockDetailService.subscribe).toHaveBeenCalledWith('collection-1');
    });

    it('should unsubscribe when subscribed', () => {
      component.collection.set(mockCollection);
      component['collectionUid'] = 'collection-1';
      component.isSubscribed.set(true);
      mockDetailService.unsubscribe.mockReturnValue(of(undefined));

      component.toggleSubscription();

      expect(mockDetailService.unsubscribe).toHaveBeenCalledWith('collection-1');
    });

    it('should do nothing when action in progress', () => {
      component.actionInProgress.set('subscribing');
      component.toggleSubscription();
      expect(mockDetailService.subscribe).not.toHaveBeenCalled();
    });
  });

  describe('deleteCollection', () => {
    it('should delete after confirmation', async () => {
      component.collection.set(mockCollection);
      component['collectionUid'] = 'collection-1';
      component.actionInProgress.set(null);
      mockDialog.open.mockReturnValue({ afterClosed: () => of(true) } as any);
      mockDetailService.trashDocument.mockReturnValue(of(undefined));
      const navigateSpy = vi.spyOn(router, 'navigateByUrl');

      component.deleteCollection();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockDetailService.trashDocument).toHaveBeenCalledWith('collection-1');
      expect(navigateSpy).toHaveBeenCalledWith('/collections');
    });

    it('should not delete when cancelled', () => {
      component.collection.set(mockCollection);
      mockDialog.open.mockReturnValue({ afterClosed: () => of(false) } as any);

      component.deleteCollection();

      expect(mockDetailService.trashDocument).not.toHaveBeenCalled();
    });

    it('should do nothing when action in progress', () => {
      component.actionInProgress.set('deleting');
      component.deleteCollection();
      expect(mockDialog.open).not.toHaveBeenCalled();
    });
  });

  describe('toggleClipboard', () => {
    it('should add to clipboard when not present', () => {
      component.collection.set(mockCollection);
      component['collectionUid'] = 'collection-1';
      component.clipboardDocs.set([]);

      component.toggleClipboard();

      expect(component.clipboardDocs().length).toBe(1);
      expect(component.clipboardDocs()[0]?.uid).toBe('collection-1');
    });

    it('should remove from clipboard when present', () => {
      component.collection.set(mockCollection);
      component['collectionUid'] = 'collection-1';
      component.clipboardDocs.set([{ uid: 'collection-1', title: 'Test', path: '/' }]);

      component.toggleClipboard();

      expect(component.clipboardDocs().length).toBe(0);
    });

    it('should do nothing when no collection', () => {
      component.collection.set(null);
      const initialDocs = component.clipboardDocs();
      component.toggleClipboard();
      expect(component.clipboardDocs()).toEqual(initialDocs);
    });
  });

  describe('exportCollection', () => {
    it('should open export dialog', () => {
      component.collection.set(mockCollection);
      mockDialog.open.mockReturnValue({ afterClosed: () => of(undefined) } as any);

      component.exportCollection();

      expect(mockDialog.open).toHaveBeenCalled();
    });
  });

  describe('loadMembers', () => {
    it('should load collection members', () => {
      component['collectionUid'] = 'collection-1';
      mockCollectionService.getCollectionMembers.mockReturnValue(
        of({
          entries: [
            { uid: 'doc1', title: 'Doc 1', type: 'File' } as NuxeoDocument,
            { uid: 'doc2', title: 'Doc 2', type: 'File' } as NuxeoDocument,
          ],
          totalSize: 2,
        }),
      );

      component.loadMembers();

      expect(mockCollectionService.getCollectionMembers).toHaveBeenCalledWith('collection-1', 50);
      expect(component.members().length).toBe(2);
      expect(component.totalSize()).toBe(2);
    });
  });

  describe('shareCollection', () => {
    it('should open share dialog', () => {
      component.collection.set(mockCollection);
      component.shareCollection();
      expect(mockDialog.open).toHaveBeenCalled();
    });
  });

  describe('permissionLabel', () => {
    it('should return label for known permissions', () => {
      expect(component.permissionLabel('Everything')).toBe('Manage everything');
      expect(component.permissionLabel('ReadWrite')).toBe('Edit');
      expect(component.permissionLabel('Read')).toBe('Read');
    });

    it('should return original permission for unknown permissions', () => {
      expect(component.permissionLabel('UnknownPermission')).toBe('UnknownPermission');
    });
  });

  describe('aceTimeFrame', () => {
    it('should return Permanent when no begin/end', () => {
      const ace = { begin: null, end: null } as any;
      expect(component.aceTimeFrame(ace)).toBe('Permanent');
    });

    it('should format date range when both present', () => {
      const ace = {
        begin: '2026-01-01T00:00:00.000Z',
        end: '2026-12-31T00:00:00.000Z',
      } as any;
      const result = component.aceTimeFrame(ace);
      expect(result).toContain('from');
      expect(result).toContain('to');
    });

    it('should format from date when only begin present', () => {
      const ace = { begin: '2026-01-01T00:00:00.000Z', end: null } as any;
      const result = component.aceTimeFrame(ace);
      expect(result).toContain('from');
    });

    it('should format until date when only end present', () => {
      const ace = { begin: null, end: '2026-12-31T00:00:00.000Z' } as any;
      const result = component.aceTimeFrame(ace);
      expect(result).toContain('Until');
    });
  });

  describe('addPermission', () => {
    it('should open add permission dialog', () => {
      component['collectionUid'] = 'collection-1';
      mockDialog.open.mockReturnValue({ afterClosed: () => of(undefined) } as any);
      component.addPermission();
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should reload collection after adding permission', async () => {
      component['collectionUid'] = 'collection-1';
      mockDialog.open.mockReturnValue({ afterClosed: () => of(true) } as any);
      component.addPermission();

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockDetailService.getFullDocument).toHaveBeenCalled();
    });
  });

  describe('avatarColor', () => {
    it('should have avatarColor function available', () => {
      expect(component.avatarColor).toBeDefined();
      expect(typeof component.avatarColor).toBe('function');
    });
  });
});
