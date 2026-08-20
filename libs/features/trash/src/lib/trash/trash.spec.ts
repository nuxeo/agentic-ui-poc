import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { Router, provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import {
  DocumentDetailService,
  SearchService,
  SelectionService,
  TrashFilterService,
  TrashService,
  type NuxeoDocument,
} from '@agentic-ui/shared/nuxeo-client';

import { TrashComponent } from './trash.component';

function doc(uid: string, overrides: Partial<NuxeoDocument> = {}): NuxeoDocument {
  return {
    uid,
    title: `Doc ${uid}`,
    type: 'File',
    path: `/default-domain/workspaces/${uid}`,
    lastModified: '2026-01-01T00:00:00.000Z',
    properties: {},
    ...overrides,
  };
}

const mockTrashService = {
  searchTrash: vi.fn(() => EMPTY),
  restoreDocument: vi.fn(() => EMPTY),
  permanentlyDelete: vi.fn(() => EMPTY),
  saveSearch: vi.fn(() => EMPTY),
  updateSearch: vi.fn(() => EMPTY),
  getSavedSearches: vi.fn(() => of([])),
  getPathSuggestions: vi.fn(() => EMPTY),
};

const mockSearchService = {
  deleteSavedSearch: vi.fn(() => EMPTY),
};

const mockDetailService = {
  fetchThumbnail: vi.fn(() => EMPTY),
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
};

describe('TrashComponent', () => {
  let component: TrashComponent;
  let fixture: ComponentFixture<TrashComponent>;
  let filterService: TrashFilterService;
  let snackBarOpen: ReturnType<typeof vi.fn>;
  let dialogOpen: ReturnType<typeof vi.fn>;
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;

  // jsdom ships no object-URL implementation, so both halves are stubbed for the whole
  // suite — the component's destroy hook revokes URLs after each test's fixture teardown.
  beforeAll(() => {
    createObjectURL = vi.fn(() => 'blob:csv');
    revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURL,
      configurable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURL,
      configurable: true,
    });
  });

  afterAll(() => {
    delete (URL as unknown as Record<string, unknown>)['createObjectURL'];
    delete (URL as unknown as Record<string, unknown>)['revokeObjectURL'];
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    snackBarOpen = vi.fn();
    dialogOpen = vi.fn(() => ({ afterClosed: () => of(false) }));
    mockTrashService.searchTrash.mockReturnValue(EMPTY);
    mockTrashService.getSavedSearches.mockReturnValue(of([]));
    mockSelectionService.selectedIds.mockReturnValue(new Set<string>());
    mockSelectionService.isAllSelected.mockReturnValue(false);

    await TestBed.configureTestingModule({
      imports: [TrashComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter([], withDisabledInitialNavigation()),
        { provide: TrashService, useValue: mockTrashService },
        { provide: SearchService, useValue: mockSearchService },
        { provide: DocumentDetailService, useValue: mockDetailService },
        { provide: SelectionService, useValue: mockSelectionService },
        { provide: MatSnackBar, useValue: { open: snackBarOpen } },
        { provide: MatDialog, useValue: { open: dialogOpen } },
      ],
    })
      // Shallow-render: the real template pulls in 11 Material/Satori modules whose
      // zone-tracked handles hang the runner. Component logic is what we assert on.
      .overrideComponent(TrashComponent, { set: { imports: [], template: '<div></div>' } })
      .compileComponents();

    fixture = TestBed.createComponent(TrashComponent);
    component = fixture.componentInstance;
    filterService = TestBed.inject(TrashFilterService);
  });

  afterEach(() => {
    fixture.destroy();
    TestBed.inject(TrashFilterService).reset();
  });

  it('creates', () => {
    expect(component).toBeTruthy();
  });

  describe('search', () => {
    it('populates documents, total and the drawer mirror on success', () => {
      mockTrashService.searchTrash.mockReturnValue(
        of({ entries: [doc('a'), doc('b')], resultsCount: 7 }),
      );

      component.search();

      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
      expect(component.documents().length).toBe(2);
      expect(component.totalResults()).toBe(7);
      expect(filterService.results()).toEqual([
        { uid: 'a', title: 'Doc a', type: 'File' },
        { uid: 'b', title: 'Doc b', type: 'File' },
      ]);
      expect(filterService.totalResults()).toBe(7);
      expect(filterService.resultsLoading()).toBe(false);
    });

    it('falls back to entry length when resultsCount is absent', () => {
      mockTrashService.searchTrash.mockReturnValue(of({ entries: [doc('a')] }));

      component.search();

      expect(component.totalResults()).toBe(1);
    });

    it('tolerates a response with no entries array', () => {
      mockTrashService.searchTrash.mockReturnValue(of({}));

      component.search();

      expect(component.documents()).toEqual([]);
      expect(component.totalResults()).toBe(0);
    });

    it('sets the error message and clears both loading flags on failure', () => {
      mockTrashService.searchTrash.mockReturnValue(throwError(() => new Error('boom')));

      component.search();

      expect(component.error()).toBe('Failed to load trashed documents.');
      expect(component.loading()).toBe(false);
      expect(filterService.resultsLoading()).toBe(false);
    });

    it('maps the sort column to an NXQL field and passes the active filters through', () => {
      filterService.filters.set({
        fullText: 'invoice',
        path: '/default-domain',
        author: 'jdoe',
        sizeRanges: ['tiny'],
      });
      component.sortBy.set('author');
      component.sortDir.set('asc');
      mockTrashService.searchTrash.mockClear();

      component.search();

      expect(mockTrashService.searchTrash).toHaveBeenCalledWith(
        expect.objectContaining({
          fullText: 'invoice',
          path: '/default-domain',
          author: 'jdoe',
          sizeRanges: ['tiny'],
          sortBy: 'dc:creator',
          sortOrder: 'asc',
        }),
      );
    });

    it('falls back to dc:created for an unknown sort key', () => {
      component.sortBy.set('not-a-column');
      mockTrashService.searchTrash.mockClear();

      component.search();

      expect(mockTrashService.searchTrash).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: 'dc:created' }),
      );
    });
  });

  describe('sorting', () => {
    it('setSortBy stores the key', () => {
      component.setSortBy('title');
      expect(component.sortBy()).toBe('title');
    });

    it('toggleSortDir flips direction', () => {
      component.sortDir.set('desc');
      component.toggleSortDir();
      expect(component.sortDir()).toBe('asc');
      component.toggleSortDir();
      expect(component.sortDir()).toBe('desc');
    });

    it('sortByColumn ignores non-sortable columns', () => {
      component.sortBy.set('created');
      component.sortByColumn('state');
      expect(component.sortBy()).toBe('created');
    });

    it('sortByColumn switches column and resets direction to ascending', () => {
      component.sortBy.set('created');
      component.sortDir.set('desc');

      component.sortByColumn('title');

      expect(component.sortBy()).toBe('title');
      expect(component.sortDir()).toBe('asc');
    });

    it('sortByColumn on the active column toggles direction', () => {
      component.sortBy.set('title');
      component.sortDir.set('asc');

      component.sortByColumn('title');

      expect(component.sortDir()).toBe('desc');
    });

    it('issues exactly one search per sort change', () => {
      mockTrashService.searchTrash.mockReturnValue(of({ entries: [] }));
      // Flush the constructor effect so only the interaction is measured.
      fixture.detectChanges();
      mockTrashService.searchTrash.mockClear();

      component.sortByColumn('title');
      fixture.detectChanges();

      expect(mockTrashService.searchTrash).toHaveBeenCalledTimes(1);
    });
  });

  describe('columns', () => {
    it('visibleColumns follows visibleColumnKeys in declaration order', () => {
      component.visibleColumnKeys.set(['contributor', 'title']);
      expect(component.visibleColumns().map((c) => c.key)).toEqual(['title', 'contributor']);
    });

    it('gridTemplate brackets the visible columns with checkbox and action tracks', () => {
      component.visibleColumnKeys.set(['title']);
      expect(component.gridTemplate()).toBe('40px 2fr 80px');
    });

    it('togglePendingColumn adds in declaration order and removes on second call', () => {
      component.pendingColumnKeys.set(['modified']);

      component.togglePendingColumn('title');
      expect(component.pendingColumnKeys()).toEqual(['title', 'modified']);

      component.togglePendingColumn('title');
      expect(component.pendingColumnKeys()).toEqual(['modified']);
    });

    it('openColumnPanel seeds the pending selection from the visible one', () => {
      component.visibleColumnKeys.set(['title', 'state']);
      component.openColumnPanel();

      expect(component.columnPanelOpen()).toBe(true);
      expect(component.pendingColumnKeys()).toEqual(['title', 'state']);
    });

    it('applyColumns commits the pending selection and closes the panel', () => {
      component.columnPanelOpen.set(true);
      component.pendingColumnKeys.set(['state', 'title']);

      component.applyColumns();

      expect(component.visibleColumnKeys()).toEqual(['title', 'state']);
      expect(component.columnPanelOpen()).toBe(false);
    });

    it('closeColumnPanel discards without committing', () => {
      component.visibleColumnKeys.set(['title']);
      component.pendingColumnKeys.set(['title', 'author']);

      component.closeColumnPanel();

      expect(component.columnPanelOpen()).toBe(false);
      expect(component.visibleColumnKeys()).toEqual(['title']);
    });

    it('resetColumns restores the default four', () => {
      component.pendingColumnKeys.set([]);
      component.resetColumns();
      expect(component.pendingColumnKeys()).toEqual(['title', 'type', 'modified', 'contributor']);
    });

    it('isPendingColumn reflects membership', () => {
      component.pendingColumnKeys.set(['title']);
      expect(component.isPendingColumn('title')).toBe(true);
      expect(component.isPendingColumn('author')).toBe(false);
    });
  });

  describe('getCellValue', () => {
    const subject = doc('x', {
      title: 'Report',
      type: 'Note',
      state: 'deleted',
      properties: {
        'dc:modified': '2026-02-02',
        'dc:created': '2026-01-01',
        'dc:creator': 'alice',
        'dc:lastContributor': 'bob',
      },
    });

    it.each([
      ['title', 'Report'],
      ['type', 'Note'],
      ['modified', '2026-02-02'],
      ['created', '2026-01-01'],
      ['author', 'alice'],
      ['contributor', 'bob'],
      ['state', 'deleted'],
      ['unknown-key', ''],
    ])('maps %s', (key, expected) => {
      expect(component.getCellValue(subject, key)).toBe(expected);
    });

    it('falls back to dc:title when the document has no title', () => {
      const untitled = {
        ...doc('y'),
        title: undefined as unknown as string,
        properties: { 'dc:title': 'From properties' },
      };
      expect(component.getCellValue(untitled, 'title')).toBe('From properties');
    });

    it('returns empty strings when properties is missing entirely', () => {
      const bare = { ...doc('z'), properties: undefined as unknown as Record<string, unknown> };
      expect(component.getCellValue(bare, 'author')).toBe('');
    });
  });

  describe('selection', () => {
    it('toggleSelection passes the document title as the label', () => {
      component.documents.set([doc('a', { title: 'Alpha' })]);

      component.toggleSelection('a');

      expect(mockSelectionService.toggle).toHaveBeenCalledWith('a', 'Alpha', null);
    });

    it('toggleSelection falls back to the uid for an unknown document', () => {
      component.documents.set([]);

      component.toggleSelection('ghost');

      expect(mockSelectionService.toggle).toHaveBeenCalledWith('ghost', 'ghost', null);
    });

    it('toggleAll selects every visible document with labels', () => {
      component.documents.set([doc('a', { title: 'Alpha' }), doc('b', { title: 'Beta' })]);
      mockSelectionService.isAllSelected.mockReturnValue(false);

      component.toggleAll();

      expect(mockSelectionService.selectAll).toHaveBeenCalledWith(
        ['a', 'b'],
        { a: 'Alpha', b: 'Beta' },
        { a: null, b: null },
      );
    });

    it('toggleAll clears when everything is already selected', () => {
      mockSelectionService.isAllSelected.mockReturnValue(true);

      component.toggleAll();

      expect(mockSelectionService.clear).toHaveBeenCalled();
      expect(mockSelectionService.selectAll).not.toHaveBeenCalled();
    });

    it('isSelected delegates to the selection service', () => {
      mockSelectionService.isSelected.mockReturnValue(true);
      expect(component.isSelected('a')).toBe(true);
    });
  });

  describe('restore', () => {
    it('drops the row, clears the selection and reports once for a batch', () => {
      mockSelectionService.selectedIds.mockReturnValue(new Set(['a', 'b']));
      component.documents.set([doc('a'), doc('b'), doc('c')]);
      mockTrashService.restoreDocument.mockReturnValue(of(doc('a')));

      component.restoreSelected();

      expect(mockTrashService.restoreDocument).toHaveBeenCalledTimes(2);
      expect(component.documents().map((d) => d.uid)).toEqual(['c']);
      expect(mockSelectionService.clear).toHaveBeenCalledTimes(1);
      expect(snackBarOpen).toHaveBeenCalledWith('2 document(s) restored.', 'OK', expect.anything());
      expect(component.actionInProgress().size).toBe(0);
    });

    it('does nothing when the selection is empty', () => {
      mockSelectionService.selectedIds.mockReturnValue(new Set<string>());

      component.restoreSelected();

      expect(mockTrashService.restoreDocument).not.toHaveBeenCalled();
    });

    it('warns and keeps the row when a batch restore fails', () => {
      mockSelectionService.selectedIds.mockReturnValue(new Set(['a']));
      component.documents.set([doc('a')]);
      mockTrashService.restoreDocument.mockReturnValue(throwError(() => new Error('nope')));

      component.restoreSelected();

      expect(component.documents().map((d) => d.uid)).toEqual(['a']);
      expect(snackBarOpen).toHaveBeenCalledWith(
        'Failed to restore a document.',
        'Dismiss',
        expect.anything(),
      );
    });

    it('restoreDocument removes the single row and stops the event bubbling', () => {
      component.documents.set([doc('a'), doc('b')]);
      mockTrashService.restoreDocument.mockReturnValue(of(doc('a')));
      const event = { stopPropagation: vi.fn() } as unknown as Event;

      component.restoreDocument('a', event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.documents().map((d) => d.uid)).toEqual(['b']);
      expect(component.actionInProgress().has('a')).toBe(false);
    });

    it('restoreDocument is a no-op while the same uid is already in flight', () => {
      component.actionInProgress.set(new Set(['a']));

      component.restoreDocument('a');

      expect(mockTrashService.restoreDocument).not.toHaveBeenCalled();
    });

    it('restoreDocument surfaces a failure without dropping the row', () => {
      component.documents.set([doc('a')]);
      mockTrashService.restoreDocument.mockReturnValue(throwError(() => new Error('nope')));

      component.restoreDocument('a');

      expect(component.documents().length).toBe(1);
      expect(snackBarOpen).toHaveBeenCalledWith(
        'Failed to restore document.',
        'Dismiss',
        expect.anything(),
      );
    });
  });

  describe('permanent delete', () => {
    it('requires confirmation before deleting the selection', () => {
      mockSelectionService.selectedIds.mockReturnValue(new Set(['a']));
      component.documents.set([doc('a')]);
      dialogOpen.mockReturnValue({ afterClosed: () => of(false) });

      component.deleteSelected();

      expect(mockTrashService.permanentlyDelete).not.toHaveBeenCalled();
      expect(component.documents().length).toBe(1);
    });

    it('deletes the selection once confirmed and reports the batch total', () => {
      mockSelectionService.selectedIds.mockReturnValue(new Set(['a', 'b']));
      component.documents.set([doc('a'), doc('b'), doc('c')]);
      dialogOpen.mockReturnValue({ afterClosed: () => of(true) });
      mockTrashService.permanentlyDelete.mockReturnValue(of(undefined));

      component.deleteSelected();

      expect(component.documents().map((d) => d.uid)).toEqual(['c']);
      expect(snackBarOpen).toHaveBeenCalledWith(
        '2 document(s) permanently deleted.',
        'OK',
        expect.anything(),
      );
    });

    it('does nothing when the selection is empty', () => {
      mockSelectionService.selectedIds.mockReturnValue(new Set<string>());

      component.deleteSelected();

      expect(dialogOpen).not.toHaveBeenCalled();
    });

    it('permanentlyDelete removes the row after confirmation', () => {
      component.documents.set([doc('a'), doc('b')]);
      dialogOpen.mockReturnValue({ afterClosed: () => of(true) });
      mockTrashService.permanentlyDelete.mockReturnValue(of(undefined));

      component.permanentlyDelete('a');

      expect(component.documents().map((d) => d.uid)).toEqual(['b']);
    });

    it('permanentlyDelete respects a cancelled dialog', () => {
      component.documents.set([doc('a')]);
      dialogOpen.mockReturnValue({ afterClosed: () => of(false) });

      component.permanentlyDelete('a');

      expect(mockTrashService.permanentlyDelete).not.toHaveBeenCalled();
    });

    it('permanentlyDelete is a no-op while the uid is in flight', () => {
      component.actionInProgress.set(new Set(['a']));

      component.permanentlyDelete('a');

      expect(dialogOpen).not.toHaveBeenCalled();
    });

    it('permanentlyDelete reports a failure', () => {
      component.documents.set([doc('a')]);
      dialogOpen.mockReturnValue({ afterClosed: () => of(true) });
      mockTrashService.permanentlyDelete.mockReturnValue(throwError(() => new Error('nope')));

      component.permanentlyDelete('a');

      expect(component.documents().length).toBe(1);
      expect(snackBarOpen).toHaveBeenCalledWith(
        'Failed to delete document.',
        'Dismiss',
        expect.anything(),
      );
    });
  });

  describe('saved searches', () => {
    it('saveAsSearch persists the active filters and records the new uid', () => {
      filterService.filters.set({
        fullText: 'draft',
        path: '/default-domain',
        author: 'alice',
        sizeRanges: ['small'],
      });
      dialogOpen.mockReturnValue({ afterClosed: () => of('  My search  ') });
      mockTrashService.saveSearch.mockReturnValue(
        of({ uid: 's1', title: 'My search', params: {} }),
      );

      component.saveAsSearch();

      expect(mockTrashService.saveSearch).toHaveBeenCalledWith('My search', {
        ecm_fulltext: 'draft',
        ecm_path: '/default-domain',
        dc_creator: 'alice',
        common_size: ['small'],
      });
      expect(filterService.activeSavedFilterUid()).toBe('s1');
      expect(filterService.activeSavedFilterTitle()).toBe('My search');
      expect(component.saving()).toBe(false);
    });

    it('saveAsSearch omits the root path and empty filters from the params', () => {
      filterService.filters.set({ fullText: '', path: '/', author: '', sizeRanges: [] });
      dialogOpen.mockReturnValue({ afterClosed: () => of('Everything') });
      mockTrashService.saveSearch.mockReturnValue(
        of({ uid: 's2', title: 'Everything', params: {} }),
      );

      component.saveAsSearch();

      expect(mockTrashService.saveSearch).toHaveBeenCalledWith('Everything', {});
    });

    it('saveAsSearch ignores a blank name', () => {
      dialogOpen.mockReturnValue({ afterClosed: () => of('   ') });

      component.saveAsSearch();

      expect(mockTrashService.saveSearch).not.toHaveBeenCalled();
    });

    it('saveAsSearch resets the saving flag and warns when the request fails', () => {
      dialogOpen.mockReturnValue({ afterClosed: () => of('My search') });
      mockTrashService.saveSearch.mockReturnValue(throwError(() => new Error('nope')));

      component.saveAsSearch();

      expect(component.saving()).toBe(false);
      expect(snackBarOpen).toHaveBeenCalledWith(
        'Failed to save search.',
        'Dismiss',
        expect.anything(),
      );
      expect(filterService.activeSavedFilterUid()).toBeNull();
    });

    it('saveSearch requires an active saved filter', () => {
      filterService.activeSavedFilterUid.set(null);

      component.saveSearch();

      expect(mockTrashService.updateSearch).not.toHaveBeenCalled();
    });

    it('saveSearch updates the active saved filter in place', () => {
      filterService.activeSavedFilterUid.set('s1');
      filterService.activeSavedFilterTitle.set('Mine');
      mockTrashService.updateSearch.mockReturnValue(of({ uid: 's1', title: 'Mine', params: {} }));
      const before = filterService.savedSearchVersion();

      component.saveSearch();

      expect(mockTrashService.updateSearch).toHaveBeenCalledWith('s1', 'Mine', {});
      expect(filterService.savedSearchVersion()).toBe(before + 1);
      expect(component.saving()).toBe(false);
    });

    it('saveSearch warns on failure', () => {
      filterService.activeSavedFilterUid.set('s1');
      filterService.activeSavedFilterTitle.set('Mine');
      mockTrashService.updateSearch.mockReturnValue(throwError(() => new Error('nope')));

      component.saveSearch();

      expect(component.saving()).toBe(false);
      expect(snackBarOpen).toHaveBeenCalledWith(
        'Failed to save search.',
        'Dismiss',
        expect.anything(),
      );
    });

    it('onEditSelectedSavedSearch renames the saved filter', () => {
      filterService.activeSavedFilterUid.set('s1');
      filterService.activeSavedFilterTitle.set('Old');
      dialogOpen.mockReturnValue({ afterClosed: () => of('  New name  ') });
      mockTrashService.updateSearch.mockReturnValue(
        of({ uid: 's1', title: 'New name', params: {} }),
      );

      component.onEditSelectedSavedSearch();

      expect(mockTrashService.updateSearch).toHaveBeenCalledWith('s1', 'New name', {});
      expect(filterService.activeSavedFilterTitle()).toBe('New name');
    });

    it('onEditSelectedSavedSearch ignores a non-string dialog result', () => {
      filterService.activeSavedFilterUid.set('s1');
      filterService.activeSavedFilterTitle.set('Old');
      dialogOpen.mockReturnValue({ afterClosed: () => of(undefined) });

      component.onEditSelectedSavedSearch();

      expect(mockTrashService.updateSearch).not.toHaveBeenCalled();
      expect(filterService.activeSavedFilterTitle()).toBe('Old');
    });

    it('onEditSelectedSavedSearch requires an active saved filter', () => {
      filterService.activeSavedFilterUid.set(null);

      component.onEditSelectedSavedSearch();

      expect(dialogOpen).not.toHaveBeenCalled();
    });

    it('onEditSelectedSavedSearch warns when the update fails', () => {
      filterService.activeSavedFilterUid.set('s1');
      filterService.activeSavedFilterTitle.set('Old');
      dialogOpen.mockReturnValue({ afterClosed: () => of('New') });
      mockTrashService.updateSearch.mockReturnValue(throwError(() => new Error('nope')));

      component.onEditSelectedSavedSearch();

      expect(snackBarOpen).toHaveBeenCalledWith(
        'Failed to update search.',
        'Dismiss',
        expect.anything(),
      );
    });

    it('onShareSelectedSavedSearch opens the share dialog with the saved title', () => {
      filterService.activeSavedFilterUid.set('s1');
      filterService.activeSavedFilterTitle.set('  Mine  ');

      component.onShareSelectedSavedSearch();

      expect(dialogOpen).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ data: { title: 'Mine', id: 's1' } }),
      );
    });

    it('onShareSelectedSavedSearch defaults the title when it is blank', () => {
      filterService.activeSavedFilterUid.set('s1');
      filterService.activeSavedFilterTitle.set('   ');

      component.onShareSelectedSavedSearch();

      expect(dialogOpen).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ data: { title: 'Saved Search', id: 's1' } }),
      );
    });

    it('onShareSelectedSavedSearch requires an active saved filter', () => {
      filterService.activeSavedFilterUid.set(null);

      component.onShareSelectedSavedSearch();

      expect(dialogOpen).not.toHaveBeenCalled();
    });

    it('onDeleteSelectedSavedSearch resets the filter state once confirmed', () => {
      filterService.activeSavedFilterUid.set('s1');
      filterService.activeSavedFilterTitle.set('Mine');
      dialogOpen.mockReturnValue({ afterClosed: () => of(true) });
      mockSearchService.deleteSavedSearch.mockReturnValue(of(undefined));

      component.onDeleteSelectedSavedSearch();

      expect(mockSearchService.deleteSavedSearch).toHaveBeenCalledWith('s1');
      expect(filterService.activeSavedFilterUid()).toBeNull();
      expect(component.deletingSavedSearch()).toBe(false);
    });

    it('onDeleteSelectedSavedSearch respects a cancelled dialog', () => {
      filterService.activeSavedFilterUid.set('s1');
      filterService.activeSavedFilterTitle.set('Mine');
      dialogOpen.mockReturnValue({ afterClosed: () => of(false) });

      component.onDeleteSelectedSavedSearch();

      expect(mockSearchService.deleteSavedSearch).not.toHaveBeenCalled();
      expect(filterService.activeSavedFilterUid()).toBe('s1');
    });

    it('onDeleteSelectedSavedSearch keeps the filter and warns on failure', () => {
      filterService.activeSavedFilterUid.set('s1');
      filterService.activeSavedFilterTitle.set('Mine');
      dialogOpen.mockReturnValue({ afterClosed: () => of(true) });
      mockSearchService.deleteSavedSearch.mockReturnValue(throwError(() => new Error('nope')));

      component.onDeleteSelectedSavedSearch();

      expect(component.deletingSavedSearch()).toBe(false);
      expect(filterService.activeSavedFilterUid()).toBe('s1');
      expect(snackBarOpen).toHaveBeenCalledWith(
        'Failed to delete search.',
        'Dismiss',
        expect.anything(),
      );
    });

    it('onDeleteSelectedSavedSearch is a no-op while a delete is in flight', () => {
      filterService.activeSavedFilterUid.set('s1');
      filterService.activeSavedFilterTitle.set('Mine');
      component.deletingSavedSearch.set(true);

      component.onDeleteSelectedSavedSearch();

      expect(dialogOpen).not.toHaveBeenCalled();
    });
  });

  describe('thumbnails', () => {
    it('publishes fetched thumbnails to both the local map and the drawer mirror', () => {
      mockDetailService.fetchThumbnail.mockReturnValue(of(new Blob(['x'])));
      mockTrashService.searchTrash.mockReturnValue(of({ entries: [doc('a')] }));

      component.search();

      expect(mockDetailService.fetchThumbnail).toHaveBeenCalledWith('a');
      expect(component.thumbnailMap()['a']).toBeTruthy();
      expect(filterService.resultThumbnails()['a']).toBeTruthy();
    });

    it('skips documents whose thumbnail is already cached', () => {
      mockDetailService.fetchThumbnail.mockReturnValue(of(new Blob(['x'])));
      mockTrashService.searchTrash.mockReturnValue(of({ entries: [doc('a')] }));

      component.search();
      mockDetailService.fetchThumbnail.mockClear();
      component.search();

      expect(mockDetailService.fetchThumbnail).not.toHaveBeenCalled();
    });

    it('ignores a thumbnail that fails to load', () => {
      mockDetailService.fetchThumbnail.mockReturnValue(throwError(() => new Error('404')));
      mockTrashService.searchTrash.mockReturnValue(of({ entries: [doc('a')] }));

      component.search();

      expect(component.thumbnailMap()['a']).toBeUndefined();
    });

    it('revokes every thumbnail object URL on destroy', () => {
      mockDetailService.fetchThumbnail.mockReturnValue(of(new Blob(['x'])));
      mockTrashService.searchTrash.mockReturnValue(of({ entries: [doc('a'), doc('b')] }));

      component.search();
      revokeObjectURL.mockClear();
      fixture.destroy();

      expect(revokeObjectURL).toHaveBeenCalledTimes(2);
    });
  });

  describe('misc', () => {
    it('setViewMode stores the mode', () => {
      component.setViewMode('grid');
      expect(component.viewMode()).toBe('grid');
    });

    it('docIcon resolves an icon for the document type', () => {
      expect(component.docIcon(doc('a', { type: 'Folder' }))).toBeTruthy();
    });

    it('openDocument navigates to the detail route', () => {
      const router = TestBed.inject(Router);
      const spy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

      component.openDocument('abc');

      expect(spy).toHaveBeenCalledWith('/doc/abc');
    });

    it('openDocument ignores a blank uid', () => {
      const router = TestBed.inject(Router);
      const spy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

      component.openDocument('');

      expect(spy).not.toHaveBeenCalled();
    });

    it('resultCount tracks the loaded documents', () => {
      component.documents.set([doc('a'), doc('b')]);
      expect(component.resultCount()).toBe(2);
    });

    it('exportCsv builds a CSV blob, downloads it and revokes the object URL', async () => {
      component.documents.set([doc('a', { title: 'He said "hi"', type: 'File' })]);
      const clickSpy = vi.fn();
      const createElement = vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: clickSpy,
      } as unknown as HTMLAnchorElement);

      component.exportCsv();

      const blob = createObjectURL.mock.calls[0][0] as Blob;
      expect(blob.type).toBe('text/csv;charset=utf-8;');
      // Every cell is quoted and embedded quotes are doubled per RFC 4180.
      expect(await blob.text()).toContain('"He said ""hi"""');
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:csv');

      createElement.mockRestore();
    });
  });
});
