import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { EMPTY, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AppConfigService } from '@nuxeo-satori/platform/app-config';
import {
  ADMIN_ACCESS_CHECKS,
  BrowseContextService,
  BrowseService,
  CURRENT_USERNAME,
  DirectoryService,
  DocumentDetailService,
  PERMISSION_DENIED_MESSAGE,
  SelectionService,
  TagService,
  type AuditEntry,
  type NuxeoDocument,
} from '@nuxeo-satori/platform/nuxeo-client';

import { BrowseComponent } from './browse';

function doc(overrides: Partial<NuxeoDocument> & Pick<NuxeoDocument, 'uid'>): NuxeoDocument {
  return {
    title: 'Document',
    type: 'File',
    path: '/default-domain/workspaces/ws-1/document',
    lastModified: '2026-01-01T00:00:00.000Z',
    properties: {},
    ...overrides,
  };
}

const folder = doc({
  uid: 'ws-1',
  title: 'Workspace',
  type: 'Workspace',
  path: '/default-domain/workspaces/ws-1',
  facets: ['Folderish'],
  contextParameters: { permissions: ['Read', 'Write', 'AddChildren', 'Remove'] },
});

const emptyAuditLog = {
  entries: [] as AuditEntry[],
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
  getAuditLog: vi.fn((): DetailReturn<'getAuditLog'> => of({ ...emptyAuditLog })),
  trashDocument: vi.fn((_uid: string): DetailReturn<'trashDocument'> => EMPTY),
};

const manifest = signal<{ extensions?: unknown }>({});

/**
 * The filtering, sorting, cell-rendering and folder-navigation state this
 * component owns, and the bulk-delete paths `browse.spec.ts` stops short of.
 */
describe('BrowseComponent — listing state', () => {
  let component: BrowseComponent;
  let fixture: ComponentFixture<BrowseComponent>;
  let snackBar: ReturnType<typeof vi.fn>;
  let dialogOpen: ReturnType<typeof vi.fn>;
  let selection: SelectionService;
  let originalCreate: typeof URL.createObjectURL;
  let originalRevoke: typeof URL.revokeObjectURL;
  let revoked: string[];

  beforeEach(async () => {
    vi.clearAllMocks();
    snackBar = vi.fn();
    dialogOpen = vi.fn(() => ({ afterClosed: () => of(false) }));
    // `vi.clearAllMocks()` clears recorded calls but keeps implementations, and the
    // component issues its first folder request from the constructor — so without
    // this reset each test inherits the previous test's listing.
    browse.getBrowseFolderContents.mockReturnValue(EMPTY);
    browse.getFolderContext.mockReturnValue(EMPTY);
    browse.getByPath.mockReturnValue(EMPTY);
    browse.hasChildCollections.mockReturnValue(of(false));
    detail.getFullDocument.mockReturnValue(EMPTY);
    detail.trashDocument.mockReturnValue(EMPTY);
    detail.fetchThumbnail.mockReturnValue(EMPTY);
    detail.getAuditLog.mockReturnValue(of({ ...emptyAuditLog }));

    revoked = [];
    originalCreate = URL.createObjectURL;
    originalRevoke = URL.revokeObjectURL;
    let counter = 0;
    URL.createObjectURL = vi.fn(() => `blob:mock/${counter++}`);
    URL.revokeObjectURL = vi.fn((url: string) => revoked.push(url));

    manifest.set({});
    await TestBed.configureTestingModule({
      imports: [BrowseComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: '**', children: [] }], withDisabledInitialNavigation()),
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
    selection = TestBed.inject(SelectionService);
    selection.clear();
  });

  afterEach(() => {
    fixture.destroy();
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });

  // ── Filters ──

  it('filters the listing by type, contributor and modified date range', () => {
    component.entries.set([
      doc({
        uid: 'a',
        title: 'Alpha',
        type: 'File',
        lastModified: '2026-01-10T00:00:00.000Z',
        properties: { 'dc:lastContributor': 'jdoe' },
      }),
      doc({
        uid: 'b',
        title: 'Beta',
        type: 'Note',
        lastModified: '2026-03-10T00:00:00.000Z',
        properties: { 'dc:lastContributor': 'asmith' },
      }),
    ]);

    component.filterType.set('Note');
    expect(component.filteredEntries().map((d) => d.uid)).toEqual(['b']);
    component.filterType.set('');

    component.filterContributor.set('JDO');
    expect(component.filteredEntries().map((d) => d.uid)).toEqual(['a']);
    component.filterContributor.set('');

    component.filterModifiedFrom.set(new Date('2026-02-01T00:00:00.000Z'));
    expect(component.filteredEntries().map((d) => d.uid)).toEqual(['b']);

    component.filterModifiedFrom.set(null);
    component.filterModifiedTo.set(new Date('2026-01-10T00:00:00.000Z'));
    expect(component.filteredEntries().map((d) => d.uid)).toEqual(['a']);
  });

  it('excludes an entry with no contributor from a contributor filter', () => {
    component.entries.set([doc({ uid: 'a', title: 'Alpha', properties: {} })]);

    component.filterContributor.set('jdoe');

    expect(component.filteredEntries()).toEqual([]);
  });

  it('clearFilters restores the full listing', () => {
    component.entries.set([
      doc({ uid: 'a', title: 'Alpha', type: 'File' }),
      doc({ uid: 'b', title: 'Beta', type: 'Note' }),
    ]);
    component.filterText.set('alpha');
    component.filterType.set('File');
    component.filterContributor.set('jdoe');
    component.filterModifiedFrom.set(new Date('2026-01-01T00:00:00.000Z'));
    component.filterModifiedTo.set(new Date('2026-12-31T00:00:00.000Z'));
    expect(component.filteredEntries()).toEqual([]);

    component.clearFilters();

    expect(component.filteredEntries().map((d) => d.uid)).toEqual(['a', 'b']);
    expect(component.filterText()).toBe('');
    expect(component.filterType()).toBe('');
    expect(component.filterContributor()).toBe('');
    expect(component.filterModifiedFrom()).toBeNull();
    expect(component.filterModifiedTo()).toBeNull();
  });

  it('distinctTypes lists each type present in the listing once, sorted', () => {
    component.entries.set([
      doc({ uid: 'a', type: 'Note' }),
      doc({ uid: 'b', type: 'File' }),
      doc({ uid: 'c', type: 'Note' }),
    ]);

    expect(component.distinctTypes()).toEqual(['File', 'Note']);
  });

  // ── Sorting ──

  it('sorts the listing by modified date, by contributor and by a computed cell value', () => {
    component.entries.set([
      doc({
        uid: 'a',
        title: 'Alpha',
        lastModified: '2026-03-01T00:00:00.000Z',
        properties: { 'dc:lastContributor': 'zoe', 'dc:creator': 'mallory' },
      }),
      doc({
        uid: 'b',
        title: 'Beta',
        lastModified: '2026-01-01T00:00:00.000Z',
        properties: { 'dc:lastContributor': 'adam', 'dc:creator': 'alice' },
      }),
    ]);

    component.toggleBrowseSort('modified');
    expect(component.filteredEntries().map((d) => d.uid)).toEqual(['b', 'a']);

    component.toggleBrowseSort('lastContributor');
    expect(component.filteredEntries().map((d) => d.uid)).toEqual(['b', 'a']);

    component.toggleBrowseSort('author');
    expect(component.filteredEntries().map((d) => d.uid)).toEqual(['b', 'a']);

    component.toggleBrowseSort('author');
    expect(component.browseSortDir()).toBe('desc');
    expect(component.filteredEntries().map((d) => d.uid)).toEqual(['a', 'b']);
  });

  it('toggleBrowseSort restarts ascending when the sorted column changes', () => {
    component.toggleBrowseSort('title');
    component.toggleBrowseSort('title');
    expect(component.browseSortDir()).toBe('desc');

    component.toggleBrowseSort('modified');

    expect(component.browseSortKey()).toBe('modified');
    expect(component.browseSortDir()).toBe('asc');
  });

  it('leaves entries in server order when no column is sorted', () => {
    component.entries.set([doc({ uid: 'z', title: 'Zebra' }), doc({ uid: 'a', title: 'Alpha' })]);

    expect(component.browseSortKey()).toBe('');
    expect(component.filteredEntries().map((d) => d.uid)).toEqual(['z', 'a']);
  });

  // ── Cell values ──

  it('getCellValue renders every packaged column key and blanks an unknown one', () => {
    const entry = doc({
      uid: 'a',
      title: 'Alpha',
      type: 'Note',
      lastModified: '2026-03-01T00:00:00.000Z',
      properties: {
        'dc:lastContributor': 'jdoe',
        'dc:creator': 'asmith',
        'dc:nature': 'contract',
        'dc:coverage': 'europe',
        'dc:subjects': ['legal', 'finance'],
        'dc:created': '2026-02-01T00:00:00.000Z',
        'uid:major_version': 2,
        'uid:minor_version': 3,
      },
    });

    expect(component.getCellValue(entry, 'title')).toBe('Alpha');
    expect(component.getCellValue(entry, 'type')).toBe('Note');
    expect(component.getCellValue(entry, 'modified')).toBe(
      new Date('2026-03-01T00:00:00.000Z').toLocaleDateString(),
    );
    expect(component.getCellValue(entry, 'lastContributor')).toBe('jdoe');
    expect(component.getCellValue(entry, 'state')).toBe('contract');
    expect(component.getCellValue(entry, 'version')).toBe('2.3');
    expect(component.getCellValue(entry, 'created')).toBe(
      new Date('2026-02-01T00:00:00.000Z').toLocaleDateString(),
    );
    expect(component.getCellValue(entry, 'author')).toBe('asmith');
    expect(component.getCellValue(entry, 'nature')).toBe('contract');
    expect(component.getCellValue(entry, 'coverage')).toBe('europe');
    expect(component.getCellValue(entry, 'subjects')).toBe('legal, finance');
    expect(component.getCellValue(entry, 'flags')).toBe('');
  });

  it('getCellValue blanks every optional column for a document with no properties', () => {
    const bare = doc({ uid: 'a', title: 'Alpha', lastModified: '' });

    for (const key of [
      'modified',
      'lastContributor',
      'state',
      'version',
      'created',
      'author',
      'nature',
      'coverage',
      'subjects',
    ]) {
      expect(component.getCellValue(bare, key)).toBe('');
    }
  });

  it('getCellValue defaults a missing minor version to zero rather than undefined', () => {
    const entry = doc({ uid: 'a', properties: { 'uid:major_version': 1 } });

    expect(component.getCellValue(entry, 'version')).toBe('1.0');
  });

  it('relativeTime describes minutes, hours and days, and blanks an absent date', () => {
    const now = Date.now();

    expect(component.relativeTime('')).toBe('');
    expect(component.relativeTime(new Date(now - 30_000).toISOString())).toBe('just now');
    expect(component.relativeTime(new Date(now - 5 * 60_000).toISOString())).toBe('5 minutes ago');
    expect(component.relativeTime(new Date(now - 3_600_000).toISOString())).toBe('an hour ago');
    expect(component.relativeTime(new Date(now - 5 * 3_600_000).toISOString())).toBe('5 hours ago');
    expect(component.relativeTime(new Date(now - 86_400_000).toISOString())).toBe('a day ago');
    expect(component.relativeTime(new Date(now - 3 * 86_400_000).toISOString())).toBe('3 days ago');
  });

  it('docState falls back to Project when the document declares no nature', () => {
    expect(component.docState()).toBe('Project');

    component.currentDoc.set(doc({ uid: 'ws-1' }));
    expect(component.docState()).toBe('Project');

    component.currentDoc.set(doc({ uid: 'ws-1', properties: { 'dc:nature': 'contract' } }));
    expect(component.docState()).toBe('contract');
  });

  it('docCreator and lastContributor blank out an absent Dublin Core value', () => {
    const bare = doc({ uid: 'a' });

    expect(component.docCreator(bare)).toBe('');
    expect(component.lastContributor(bare)).toBe('');
    expect(component.avatarInitials(component.docCreator(bare))).toBe('?');
  });

  it('docIcon maps the document type to an icon', () => {
    expect(component.docIcon(doc({ uid: 'a', type: 'Folder' }))).toBeTruthy();
    expect(component.docIcon(doc({ uid: 'a', type: 'File' }))).toBeTruthy();
  });

  // ── Folderish predicates ──

  it('treats Favorites and facet-folderish documents as folders, and files as not', () => {
    expect(component.isFolderish(doc({ uid: 'a', type: 'Favorites' }))).toBe(true);
    expect(component.isFolderish(doc({ uid: 'a', type: 'Folder', facets: ['Folderish'] }))).toBe(
      true,
    );
    expect(component.isFolderish(doc({ uid: 'a', type: 'File', facets: [] }))).toBe(false);
  });

  it('isCurrentFolderish follows the browsed document', () => {
    expect(component.isCurrentFolderish()).toBe(false);

    component.currentDoc.set(folder);
    expect(component.isCurrentFolderish()).toBe(true);

    component.currentDoc.set(doc({ uid: 'f', type: 'File', facets: [] }));
    expect(component.isCurrentFolderish()).toBe(false);
  });

  it('canCreateContentHere refuses Favorites, domains and the restricted domain container', () => {
    component.currentDoc.set(folder);
    expect(component.canCreateContentHere()).toBe(true);

    component.currentDoc.set(
      doc({ ...folder, type: 'Favorites', contextParameters: { permissions: ['AddChildren'] } }),
    );
    expect(component.canCreateContentHere()).toBe(false);

    component.currentDoc.set(
      doc({
        uid: 'dom-1',
        type: 'Domain',
        path: '/default-domain',
        facets: ['Folderish'],
        contextParameters: { permissions: ['AddChildren'] },
      }),
    );
    expect(component.canCreateContentHere()).toBe(false);

    component.currentDoc.set(
      doc({
        uid: 'dc',
        type: 'Folder',
        path: '/default-domain',
        facets: ['Folderish'],
        contextParameters: { permissions: ['AddChildren'] },
      }),
    );
    expect(component.canCreateContentHere()).toBe(false);
  });

  it('isRepositoryRootBrowse and isDomainBrowse track the browsed location', () => {
    expect(component.isRepositoryRootBrowse()).toBe(true);
    expect(component.isDomainBrowse()).toBe(false);

    component.browsePath.set('/default-domain');
    component.currentDoc.set(doc({ uid: 'dom-1', type: 'Domain', path: '/default-domain' }));
    expect(component.isRepositoryRootBrowse()).toBe(false);
    expect(component.isDomainBrowse()).toBe(true);
  });

  it('hasCollectionEntries is true only while a collection is visible in the listing', () => {
    component.entries.set([doc({ uid: 'a', type: 'File' })]);
    expect(component.hasCollectionEntries()).toBe(false);

    component.entries.set([doc({ uid: 'c', type: 'Collection' })]);
    expect(component.hasCollectionEntries()).toBe(true);

    component.filterType.set('File');
    expect(component.hasCollectionEntries()).toBe(false);
  });

  it('showHeaderDelete follows the selection when there is one, and the folder otherwise', () => {
    component.currentDoc.set(folder);
    expect(component.showHeaderDelete()).toBe(true);

    component.entries.set([
      doc({ uid: 'a', contextParameters: { permissions: ['Read'] } }),
      doc({ uid: 'b', contextParameters: { permissions: ['Remove'] } }),
    ]);
    selection.selectAll(['a']);
    expect(component.showHeaderDelete()).toBe(false);

    selection.selectAll(['a', 'b']);
    expect(component.showHeaderDelete()).toBe(true);
  });

  it('toggleSelection carries the fetched thumbnail into the selection preview', () => {
    const entry = doc({ uid: 'a', title: 'Alpha', type: 'Note' });
    component.entries.set([entry]);
    detail.fetchThumbnail.mockReturnValue(of(new Blob(['x'])));
    browse.getBrowseFolderContents.mockReturnValue(of({ folder, entries: [entry], totalSize: 1 }));
    browse.getFolderContext.mockReturnValue(of(folder));
    component.loadContent();

    component.toggleSelection('a');

    expect(selection.selectedItems()[0]).toEqual({
      id: 'a',
      name: 'Alpha',
      preview: component.thumbnailMap()['a'],
      type: 'Note',
    });
  });

  it('toggleSelection falls back to the uid for an id that is not in the listing', () => {
    component.toggleSelection('ghost');

    expect(selection.selectedItems()[0]).toEqual({
      id: 'ghost',
      name: 'ghost',
      preview: null,
      type: undefined,
    });
  });

  // ── Navigation ──

  it('resets the tab state and reloads for the folder the router navigated to', async () => {
    browse.getBrowseFolderContents.mockReturnValue(of({ folder, entries: [], totalSize: 0 }));
    browse.getFolderContext.mockReturnValue(of(folder));
    component.loadContent();
    fixture.detectChanges();
    component.activeTabIndex.set(2);
    component.permissionsLoaded.set(true);
    browse.getBrowseFolderContents.mockClear();

    await TestBed.inject(Router).navigateByUrl('/browse/default-domain/workspaces/other');
    fixture.detectChanges();

    expect(component.activeTabIndex()).toBe(0);
    expect(component.permissionsLoaded()).toBe(false);
    expect(component.browsePath()).toBe('/default-domain/workspaces/other');
    expect(browse.getBrowseFolderContents).toHaveBeenCalledWith(
      '/default-domain/workspaces/other',
      50,
    );
  });

  it('ignores a navigation that does not change the browsed folder', async () => {
    browse.getBrowseFolderContents.mockReturnValue(of({ folder, entries: [], totalSize: 0 }));
    browse.getFolderContext.mockReturnValue(of(folder));
    component.loadContent();
    fixture.detectChanges();

    await TestBed.inject(Router).navigateByUrl('/browse/default-domain/workspaces/other');
    fixture.detectChanges();
    const callsAfterFirst = browse.getBrowseFolderContents.mock.calls.length;

    await TestBed.inject(Router).navigateByUrl('/browse/default-domain/workspaces/other');
    fixture.detectChanges();

    expect(browse.getBrowseFolderContents.mock.calls.length).toBe(callsAfterFirst);
  });

  // ── Clipboard paste reconciliation ──

  it('keeps an optimistically pasted row until the server listing includes it', () => {
    const pasted = doc({ uid: 'copy-1', title: 'Copied' });
    browse.getBrowseFolderContents.mockReturnValue(of({ folder, entries: [], totalSize: 0 }));
    browse.getFolderContext.mockReturnValue(of(folder));
    component.loadContent();
    fixture.detectChanges();
    expect(component.currentDoc()?.uid).toBe('ws-1');

    TestBed.inject(BrowseContextService).notifyClipboardPasteComplete({
      targetUid: 'ws-1',
      documents: [pasted],
      action: 'copy',
    });
    fixture.detectChanges();
    expect(component.entries().map((e) => e.uid)).toEqual(['copy-1']);

    component.loadContent();
    expect(component.entries().map((e) => e.uid)).toEqual(['copy-1']);

    browse.getBrowseFolderContents.mockReturnValue(of({ folder, entries: [pasted], totalSize: 1 }));
    component.loadContent();
    expect(component.entries().map((e) => e.uid)).toEqual(['copy-1']);
    expect(component.totalSize()).toBe(1);
  });

  it('does not duplicate a pasted row that the server listing already contains', () => {
    const pasted = doc({ uid: 'copy-1', title: 'Copied' });
    browse.getBrowseFolderContents.mockReturnValue(of({ folder, entries: [pasted], totalSize: 1 }));
    browse.getFolderContext.mockReturnValue(of(folder));
    component.loadContent();
    fixture.detectChanges();

    TestBed.inject(BrowseContextService).notifyClipboardPasteComplete({
      targetUid: 'ws-1',
      documents: [pasted],
      action: 'move',
    });
    fixture.detectChanges();

    expect(component.entries().map((e) => e.uid)).toEqual(['copy-1']);
    expect(component.totalSize()).toBe(1);
  });

  it('ignores a paste that landed in a folder other than the one on screen', () => {
    browse.getBrowseFolderContents.mockReturnValue(of({ folder, entries: [], totalSize: 0 }));
    browse.getFolderContext.mockReturnValue(of(folder));
    component.loadContent();
    fixture.detectChanges();
    expect(component.currentDoc()?.uid).toBe('ws-1');

    TestBed.inject(BrowseContextService).notifyClipboardPasteComplete({
      targetUid: 'some-other-folder',
      documents: [doc({ uid: 'copy-1' })],
      action: 'copy',
    });
    fixture.detectChanges();

    expect(component.entries()).toEqual([]);
  });

  it('reloads the folder from the server a moment after a paste, for eventual consistency', () => {
    vi.useFakeTimers();
    try {
      const pasted = doc({ uid: 'copy-1', title: 'Copied' });
      browse.getBrowseFolderContents.mockReturnValue(of({ folder, entries: [], totalSize: 0 }));
      browse.getFolderContext.mockReturnValue(of(folder));
      component.loadContent();
      fixture.detectChanges();

      TestBed.inject(BrowseContextService).notifyClipboardPasteComplete({
        targetUid: 'ws-1',
        documents: [pasted],
        action: 'copy',
      });
      fixture.detectChanges();
      browse.getBrowseFolderContents.mockClear();
      browse.getBrowseFolderContents.mockReturnValue(
        of({ folder, entries: [pasted], totalSize: 1 }),
      );

      vi.advanceTimersByTime(1499);
      expect(browse.getBrowseFolderContents).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(browse.getBrowseFolderContents).toHaveBeenCalledTimes(1);
      expect(component.entries().map((e) => e.uid)).toEqual(['copy-1']);
      expect(component.totalSize()).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not touch the listing for a paste that produced no documents', () => {
    browse.getBrowseFolderContents.mockReturnValue(of({ folder, entries: [], totalSize: 0 }));
    browse.getFolderContext.mockReturnValue(of(folder));
    component.loadContent();
    fixture.detectChanges();

    TestBed.inject(BrowseContextService).notifyClipboardPasteComplete({
      targetUid: 'ws-1',
      documents: [],
      action: 'copy',
    });
    fixture.detectChanges();

    expect(component.entries()).toEqual([]);
    expect(component.totalSize()).toBe(0);
  });

  it('revokes the previous thumbnails when the folder listing is reloaded', () => {
    const entry = doc({ uid: 'a', title: 'Alpha' });
    detail.fetchThumbnail.mockReturnValue(of(new Blob(['x'])));
    browse.getBrowseFolderContents.mockReturnValue(of({ folder, entries: [entry], totalSize: 1 }));
    browse.getFolderContext.mockReturnValue(of(folder));

    component.loadContent();
    const first = component.thumbnailMap()['a'];
    expect(first).toBeDefined();

    component.loadContent();

    expect(revoked).toEqual(['blob:mock/0']);
    expect(component.thumbnailMap()['a']).not.toBe(first);
  });

  // ── Bulk delete ──

  it('blocks a bulk delete that includes a Collections folder with child collections', () => {
    const collectionsFolder = doc({
      uid: 'cols-1',
      title: 'Collections',
      type: 'Collections',
      contextParameters: { permissions: ['Remove'] },
    });
    const file = doc({ uid: 'f-1', contextParameters: { permissions: ['Remove'] } });
    component.entries.set([collectionsFolder, file]);
    selection.selectAll(['cols-1', 'f-1']);
    browse.hasChildCollections.mockReturnValue(of(true));
    detail.trashDocument.mockReturnValue(of(doc({ uid: 'f-1' })));
    dialogOpen.mockReturnValue({ afterClosed: () => of(true) });

    component.deleteDocument();

    expect(browse.hasChildCollections).toHaveBeenCalledWith('cols-1');
    expect(snackBar).toHaveBeenCalledWith(
      'Remove all collections from this folder before deleting it.',
      'OK',
      { duration: 5000 },
    );
    expect(detail.trashDocument).toHaveBeenCalledTimes(1);
    expect(detail.trashDocument).toHaveBeenCalledWith('f-1');
  });

  it('treats a failed child-collection check as blocking, rather than deleting anyway', () => {
    const collectionsFolder = doc({
      uid: 'cols-1',
      type: 'Collections',
      contextParameters: { permissions: ['Remove'] },
    });
    component.entries.set([collectionsFolder]);
    selection.selectAll(['cols-1']);
    browse.hasChildCollections.mockReturnValue(throwError(() => ({ status: 500 })));
    dialogOpen.mockReturnValue({ afterClosed: () => of(true) });

    component.deleteDocument();

    expect(detail.trashDocument).not.toHaveBeenCalled();
    expect(snackBar).toHaveBeenCalledWith(
      'Remove all collections from this folder before deleting it.',
      'OK',
      { duration: 5000 },
    );
  });

  it('deletes an empty Collections folder in a bulk selection', () => {
    const collectionsFolder = doc({
      uid: 'cols-1',
      type: 'Collections',
      contextParameters: { permissions: ['Remove'] },
    });
    component.entries.set([collectionsFolder]);
    selection.selectAll(['cols-1']);
    browse.hasChildCollections.mockReturnValue(of(false));
    detail.trashDocument.mockReturnValue(of(collectionsFolder));
    dialogOpen.mockReturnValue({ afterClosed: () => of(true) });

    component.deleteDocument();

    expect(detail.trashDocument).toHaveBeenCalledWith('cols-1');
    expect(snackBar).toHaveBeenCalledWith('Moved to trash', 'OK', { duration: 3000 });
  });

  it('skips selected documents the user cannot remove and reports how many', () => {
    component.entries.set([
      doc({ uid: 'a', contextParameters: { permissions: ['Read'] } }),
      doc({ uid: 'b', contextParameters: { permissions: ['Remove'] } }),
    ]);
    selection.selectAll(['a', 'b']);
    detail.trashDocument.mockReturnValue(of(doc({ uid: 'b' })));
    dialogOpen.mockReturnValue({ afterClosed: () => of(true) });

    component.deleteDocument();

    expect(snackBar).toHaveBeenCalledWith('Skipped 1 item(s) without delete permission', 'OK', {
      duration: 5000,
    });
    expect(detail.trashDocument).toHaveBeenCalledTimes(1);
    expect(detail.trashDocument).toHaveBeenCalledWith('b');
  });

  it('reports permission denied when no selected document may be removed', () => {
    component.entries.set([doc({ uid: 'a', contextParameters: { permissions: ['Read'] } })]);
    selection.selectAll(['a']);
    dialogOpen.mockReturnValue({ afterClosed: () => of(true) });

    component.deleteDocument();

    expect(detail.trashDocument).not.toHaveBeenCalled();
    expect(snackBar).toHaveBeenCalledWith(PERMISSION_DENIED_MESSAGE, 'OK', { duration: 4000 });
  });

  it('reports the count that failed when a bulk delete only partly succeeds', () => {
    component.entries.set([
      doc({ uid: 'a', contextParameters: { permissions: ['Remove'] } }),
      doc({ uid: 'b', contextParameters: { permissions: ['Remove'] } }),
    ]);
    selection.selectAll(['a', 'b']);
    detail.trashDocument.mockImplementation((uid: string) =>
      uid === 'a' ? of(doc({ uid: 'a' })) : throwError(() => ({ status: 500 })),
    );
    dialogOpen.mockReturnValue({ afterClosed: () => of(true) });

    component.deleteDocument();

    expect(snackBar).toHaveBeenCalledWith('Moved to trash', 'OK', { duration: 3000 });
    expect(snackBar).toHaveBeenCalledWith('Failed to delete 1 item(s)', 'OK', { duration: 5000 });
  });

  it('reports a wholly failed bulk delete and keeps the selection', () => {
    component.entries.set([doc({ uid: 'a', contextParameters: { permissions: ['Remove'] } })]);
    selection.selectAll(['a']);
    detail.trashDocument.mockReturnValue(throwError(() => ({ status: 500 })));
    dialogOpen.mockReturnValue({ afterClosed: () => of(true) });

    component.deleteDocument();

    expect(snackBar).toHaveBeenCalledWith('Failed to delete', 'OK', { duration: 3000 });
    expect(selection.selectedIds()).toEqual(new Set(['a']));
  });

  it('pluralises the confirmation message for more than one trashed document', () => {
    component.entries.set([
      doc({ uid: 'a', contextParameters: { permissions: ['Remove'] } }),
      doc({ uid: 'b', contextParameters: { permissions: ['Remove'] } }),
    ]);
    selection.selectAll(['a', 'b']);
    detail.trashDocument.mockImplementation((uid: string) => of(doc({ uid })));
    dialogOpen.mockReturnValue({ afterClosed: () => of(true) });

    component.deleteDocument();

    expect(snackBar).toHaveBeenCalledWith('2 documents moved to trash', 'OK', { duration: 3000 });
    expect(selection.selectedIds()).toEqual(new Set());
  });

  it('does not delete anything when the bulk confirmation is dismissed', () => {
    component.entries.set([doc({ uid: 'a', contextParameters: { permissions: ['Remove'] } })]);
    selection.selectAll(['a']);
    dialogOpen.mockReturnValue({ afterClosed: () => of(false) });

    component.deleteDocument();

    expect(detail.trashDocument).not.toHaveBeenCalled();
    expect(snackBar).not.toHaveBeenCalled();
  });

  // ── Single-document delete ──

  it('navigates to the parent folder after trashing the browsed document', () => {
    component.currentDoc.set(folder);
    detail.trashDocument.mockReturnValue(of(folder));
    dialogOpen.mockReturnValue({ afterClosed: () => of(true) });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');
    const treeRefresh = vi.spyOn(TestBed.inject(BrowseContextService), 'requestTreeRefresh');

    component.deleteDocument();

    expect(detail.trashDocument).toHaveBeenCalledWith('ws-1');
    expect(snackBar).toHaveBeenCalledWith('Moved to trash', 'OK', { duration: 3000 });
    expect(treeRefresh).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/browse/default-domain/workspaces');
  });

  it('refuses to trash a browsed document the user cannot remove', () => {
    component.currentDoc.set(doc({ ...folder, contextParameters: { permissions: ['Read'] } }));

    component.deleteDocument();

    expect(dialogOpen).not.toHaveBeenCalled();
    expect(detail.trashDocument).not.toHaveBeenCalled();
    expect(snackBar).toHaveBeenCalledWith(PERMISSION_DENIED_MESSAGE, 'OK', { duration: 4000 });
  });

  it('reports a failed check for child collections instead of deleting the folder', () => {
    component.currentDoc.set(
      doc({
        uid: 'cols-1',
        type: 'Collections',
        path: '/default-domain/workspaces/Collections',
        contextParameters: { permissions: ['Remove'] },
      }),
    );
    component.entries.set([]);
    browse.hasChildCollections.mockReturnValue(throwError(() => ({ status: 500 })));

    component.deleteDocument();

    expect(dialogOpen).not.toHaveBeenCalled();
    expect(snackBar).toHaveBeenCalledWith('Failed to verify folder contents', 'OK', {
      duration: 3000,
    });
  });

  it('does nothing when there is neither a selection nor a browsed document', () => {
    component.deleteDocument();

    expect(dialogOpen).not.toHaveBeenCalled();
    expect(detail.trashDocument).not.toHaveBeenCalled();
  });

  it('reports the skipped count when some selected documents fail to load and none are removable', () => {
    component.entries.set([doc({ uid: 'a', contextParameters: { permissions: ['Read'] } })]);
    selection.selectAll(['a', 'b']);
    detail.getFullDocument.mockReturnValue(throwError(() => ({ status: 404 })));
    dialogOpen.mockReturnValue({ afterClosed: () => of(true) });

    component.deleteDocument();

    expect(snackBar).toHaveBeenCalledWith('Skipped 1 item(s) that could not be loaded', 'OK', {
      duration: 5000,
    });
    expect(snackBar).toHaveBeenCalledWith(PERMISSION_DENIED_MESSAGE, 'OK', { duration: 4000 });
    expect(detail.trashDocument).not.toHaveBeenCalled();
  });

  // ── Collection rows ──

  it('isCollectionEntry recognises a collection row', () => {
    expect(component.isCollectionEntry(doc({ uid: 'c', type: 'Collection' }))).toBe(true);
    expect(component.isCollectionEntry(doc({ uid: 'f', type: 'File' }))).toBe(false);
  });

  it('openEditCollectionDialog refuses a collection the freshly loaded document cannot write', () => {
    const collection = doc({ uid: 'col-1', type: 'Collection' });
    detail.getFullDocument.mockReturnValue(
      of(doc({ ...collection, contextParameters: { permissions: ['Read'] } })),
    );

    component.openEditCollectionDialog(collection);

    expect(dialogOpen).not.toHaveBeenCalled();
    expect(snackBar).toHaveBeenCalledWith(PERMISSION_DENIED_MESSAGE, 'OK', { duration: 4000 });
  });

  it('openEditCollectionDialog reloads the listing after a confirmed edit', () => {
    const collection = doc({ uid: 'col-1', type: 'Collection' });
    detail.getFullDocument.mockReturnValue(
      of(doc({ ...collection, contextParameters: { permissions: ['Write'] } })),
    );
    dialogOpen.mockReturnValue({ afterClosed: () => of(doc({ uid: 'col-1', title: 'Renamed' })) });
    const treeRefresh = vi.spyOn(TestBed.inject(BrowseContextService), 'requestTreeRefresh');
    const load = vi.spyOn(component, 'loadContent');

    component.openEditCollectionDialog(collection);

    expect(treeRefresh).toHaveBeenCalled();
    expect(load).toHaveBeenCalled();
    expect(snackBar).toHaveBeenCalledWith('Collection updated', 'OK', { duration: 3000 });
  });

  it('openEditCollectionDialog reports a non-permission load failure distinctly', () => {
    detail.getFullDocument.mockReturnValue(throwError(() => ({ status: 500 })));

    component.openEditCollectionDialog(doc({ uid: 'col-1', type: 'Collection' }));

    expect(snackBar).toHaveBeenCalledWith('Failed to load collection', 'OK', { duration: 3000 });
  });

  it('deleteCollectionEntry refuses a collection the freshly loaded document cannot remove', () => {
    const collection = doc({ uid: 'col-1', type: 'Collection' });
    detail.getFullDocument.mockReturnValue(
      of(doc({ ...collection, contextParameters: { permissions: ['Read'] } })),
    );

    component.deleteCollectionEntry(collection);

    expect(dialogOpen).not.toHaveBeenCalled();
    expect(detail.trashDocument).not.toHaveBeenCalled();
    expect(snackBar).toHaveBeenCalledWith(PERMISSION_DENIED_MESSAGE, 'OK', { duration: 4000 });
  });

  it('deleteCollectionEntry reports a non-permission trash failure distinctly', () => {
    const collection = doc({ uid: 'col-1', type: 'Collection' });
    detail.getFullDocument.mockReturnValue(
      of(doc({ ...collection, contextParameters: { permissions: ['Remove'] } })),
    );
    detail.trashDocument.mockReturnValue(throwError(() => ({ status: 500 })));
    dialogOpen.mockReturnValue({ afterClosed: () => of(true) });

    component.deleteCollectionEntry(collection);

    expect(snackBar).toHaveBeenCalledWith('Failed to delete collection', 'OK', { duration: 3000 });
  });

  it('deleteCollectionEntry leaves the collection alone when the confirmation is dismissed', () => {
    const collection = doc({ uid: 'col-1', type: 'Collection' });
    detail.getFullDocument.mockReturnValue(
      of(doc({ ...collection, contextParameters: { permissions: ['Remove'] } })),
    );
    dialogOpen.mockReturnValue({ afterClosed: () => of(false) });

    component.deleteCollectionEntry(collection);

    expect(detail.trashDocument).not.toHaveBeenCalled();
  });

  it('deleteCollectionEntry reports a non-permission load failure distinctly', () => {
    detail.getFullDocument.mockReturnValue(throwError(() => ({ status: 500 })));

    component.deleteCollectionEntry(doc({ uid: 'col-1', type: 'Collection' }));

    expect(snackBar).toHaveBeenCalledWith('Failed to load collection', 'OK', { duration: 3000 });
  });
});
