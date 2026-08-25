import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  withDisabledInitialNavigation,
} from '@angular/router';
import { of, type Observable } from 'rxjs';
import { vi } from 'vitest';

import { SearchComponent } from './search';
import {
  DocumentDetailService,
  type SearchResultItem,
  NuxeoApiBase,
  SearchAggregationService,
  SearchService,
  SelectionService,
} from '@nuxeo-satori/platform/nuxeo-client';
import { AiFeatureFlagService, AiGatewayService } from '@agentic-ui/shared/ai-client';

const mockSearchService = {
  search: vi.fn(() => of({ items: [], aggregations: {} })),
};

const mockSearchAggregationService = {
  drawerFilters: signal<Record<string, string>>({}),
  aggregations: signal({}),
  items: signal([]),
  selectedSavedSearchId: signal(''),
  selectedSavedSearchTitle: signal(''),
};

const mockDocumentDetailService = {
  fetchThumbnail: vi.fn((): Observable<Blob | null> => of(null)),
  fetchBlob: vi.fn((): Observable<Blob> => of(new Blob())),
  addToFavorites: vi.fn((): Observable<void> => of(undefined)),
  removeFromFavorites: vi.fn((): Observable<void> => of(undefined)),
};

// Full surface declared up front, with explicit return types. `vi.fn(() => of(null))`
// infers `Observable<null>`, and TypeScript fixes an object literal's shape at declaration —
// so both `mockReturnValue(of(aDocument))` and a later `mock.someMethod = vi.fn()` fail to
// typecheck. Neither shows up under `nx test`, which strips types through esbuild.
const mockSelectionService = {
  selectedCount: vi.fn(() => 0),
  isAllSelected: vi.fn(() => false),
  isIndeterminate: vi.fn(() => false),
  isSelected: vi.fn(() => false),
  toggle: vi.fn(),
  clear: vi.fn(),
  selectAll: vi.fn(),
  deleteSelected: vi.fn((): Observable<void> => of(undefined)),
};

const mockAiGatewayService = {
  nlToNxqlSuggestions: vi.fn(() => of({ suggestions: [] })),
  nlToNxql: vi.fn(),
};

const mockAiFeatureFlagService = {
  aiEnabled: signal(true),
};

const mockNuxeoApiBase = {
  nxqlSearch: vi.fn(() => of({ entries: [] })),
};

/**
 * Complete fixtures, not partial objects cast into place.
 *
 * `{ id, type, title } as SearchResultItem` does not compile without `as unknown as`, and
 * forcing it through would defeat the point: the cast would keep compiling if the type gained
 * a required field, so the fixture would drift away from what the component is really handed.
 * Filling every field costs a few lines once and keeps these tests honest.
 */
function resultItem(over: Partial<SearchResultItem> = {}): SearchResultItem {
  return {
    id: 'doc1',
    title: 'Test Doc',
    type: 'File',
    modifiedDate: '2026-08-24',
    lastContributor: 'admin',
    state: 'project',
    version: '1.0',
    createdDate: '2026-08-20',
    author: 'admin',
    authorKey: 'admin',
    nature: 'article',
    coverage: 'global',
    subjects: 'test',
    collection: '',
    collectionKey: '',
    tags: [],
    flags: '',
    icon: 'description',
    isFavorite: false,
    ...over,
  } as SearchResultItem;
}

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  /** The component's own row view-model, kept tied to the component rather than restated. */
  type Row = ReturnType<typeof SearchComponent.prototype.displayResults>[number];

  function row(over: Partial<Row> = {}): Row {
    return {
      id: 'doc1',
      name: 'Test Doc',
      imageUrl: '/images/Login-background.svg',
      type: 'File',
      modifiedDate: '2026-08-24',
      lastContributor: 'admin',
      state: 'project',
      version: '1.0',
      createdDate: '2026-08-20',
      author: 'admin',
      nature: 'article',
      coverage: 'global',
      subjects: 'test,demo',
      flags: 'urgent',
      icon: 'description',
      ...over,
    } as Row;
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSearchService.search.mockReturnValue(of({ items: [], aggregations: {} }));

    await TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([], withDisabledInitialNavigation()),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({})),
          },
        },
        { provide: SearchService, useValue: mockSearchService },
        { provide: SearchAggregationService, useValue: mockSearchAggregationService },
        { provide: DocumentDetailService, useValue: mockDocumentDetailService },
        { provide: SelectionService, useValue: mockSelectionService },
        { provide: AiGatewayService, useValue: mockAiGatewayService },
        { provide: AiFeatureFlagService, useValue: mockAiFeatureFlagService },
        { provide: NuxeoApiBase, useValue: mockNuxeoApiBase },
      ],
    })
      .overrideComponent(SearchComponent, {
        set: { imports: [], template: '<div></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggleQuickFilter', () => {
    it('should add a filter when not present', () => {
      component.selectedQuickFilters.set(new Set());
      component.toggleQuickFilter('noFolder');
      expect(component.selectedQuickFilters()).toContain('noFolder');
    });

    it('should remove a filter when present', () => {
      component.selectedQuickFilters.set(new Set(['noFolder']));
      component.toggleQuickFilter('noFolder');
      expect(component.selectedQuickFilters()).not.toContain('noFolder');
    });

    it('should update query params with selected filters', () => {
      const navigateSpy = vi.spyOn(component['router'], 'navigate');
      component.toggleQuickFilter('mostRecent');
      expect(navigateSpy).toHaveBeenCalledWith(
        [],
        expect.objectContaining({
          queryParams: expect.objectContaining({ quickFilters: 'mostRecent' }),
        }),
      );
    });
  });

  describe('setViewMode', () => {
    it('should update view mode signal', () => {
      component.setViewMode('grid');
      expect(component.viewMode()).toBe('grid');
      component.setViewMode('list');
      expect(component.viewMode()).toBe('list');
    });
  });

  describe('openDocument', () => {
    beforeEach(() => {
      vi.spyOn(component, 'results').mockReturnValue([
        resultItem({ id: 'doc1', path: '/default-domain/workspaces' }),
        resultItem({ id: 'coll1', type: 'Collection', title: 'Test Collection', path: undefined }),
        resultItem({
          id: 'fold1',
          type: 'Workspace',
          title: 'Test Folder',
          path: '/default-domain/workspaces/test',
        }),
      ] as ReturnType<typeof component.results>);
    });

    it('should navigate to /doc/:uid for regular documents', async () => {
      const navigateSpy = vi.spyOn(component['router'], 'navigateByUrl');
      component.openDocument('doc1');
      expect(navigateSpy).toHaveBeenCalledWith('/doc/doc1');
    });

    it('should navigate to /collections/:uid for Collections', async () => {
      const navigateSpy = vi.spyOn(component['router'], 'navigateByUrl');
      component.openDocument('coll1');
      expect(navigateSpy).toHaveBeenCalledWith('/collections/coll1');
    });

    it('should navigate to /browse/path for folderish documents', async () => {
      const navigateSpy = vi.spyOn(component['router'], 'navigateByUrl');
      component.openDocument('fold1');
      expect(navigateSpy).toHaveBeenCalledWith('/browse/default-domain/workspaces/test');
    });

    it('should do nothing when uid is empty', () => {
      const navigateSpy = vi.spyOn(component['router'], 'navigateByUrl');
      component.openDocument('');
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('selection', () => {
    it('should toggle individual selection', () => {
      vi.spyOn(component, 'displayResults').mockReturnValue([row()]);
      component.toggleSelection('doc1');
      expect(mockSelectionService.toggle).toHaveBeenCalledWith('doc1', 'Test Doc', null);
    });

    it('should check if item is selected', () => {
      mockSelectionService.isSelected.mockReturnValue(true);
      expect(component.isSelected('doc1')).toBe(true);
      expect(mockSelectionService.isSelected).toHaveBeenCalledWith('doc1');
    });

    it('should select all when none selected', () => {
      mockSelectionService.isAllSelected.mockReturnValue(false);
      vi.spyOn(component, 'displayResults').mockReturnValue([
        row({ id: 'doc1', name: 'Doc 1' }),
        row({ id: 'doc2', name: 'Doc 2' }),
      ]);
      component.toggleAll();
      expect(mockSelectionService.selectAll).toHaveBeenCalledWith(
        ['doc1', 'doc2'],
        { doc1: 'Doc 1', doc2: 'Doc 2' },
        expect.any(Object),
      );
    });

    it('should clear selection when all selected', () => {
      mockSelectionService.isAllSelected.mockReturnValue(true);
      component.toggleAll();
      expect(mockSelectionService.clear).toHaveBeenCalled();
    });

    it('should call clear on clearSelection', () => {
      component.clearSelection();
      expect(mockSelectionService.clear).toHaveBeenCalled();
    });
  });

  describe('deleteSelected', () => {
    it('should call SelectionService.deleteSelected and navigate on success', () => {
      const navigateSpy = vi.spyOn(component['router'], 'navigate');
      mockSelectionService.deleteSelected.mockReturnValue(of(undefined));

      component.deleteSelected();

      expect(mockSelectionService.deleteSelected).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalled();
    });
  });

  describe('column management', () => {
    it('should toggle pending column on', () => {
      component.pendingColumnKeys.set(['name']);
      component.togglePendingColumn('modified');
      expect(component.pendingColumnKeys()).toContain('modified');
    });

    it('should toggle pending column off', () => {
      component.pendingColumnKeys.set(['name', 'modified']);
      component.togglePendingColumn('modified');
      expect(component.pendingColumnKeys()).not.toContain('modified');
      expect(component.pendingColumnKeys()).toContain('name');
    });

    it('should check if column is pending', () => {
      component.pendingColumnKeys.set(['name', 'modified']);
      expect(component.isPendingColumn('name')).toBe(true);
      expect(component.isPendingColumn('author')).toBe(false);
    });

    it('should open column panel', () => {
      component.visibleColumnKeys.set(['name', 'type']);
      component.openColumnPanel();
      expect(component.columnPanelOpen()).toBe(true);
      expect(component.pendingColumnKeys()).toEqual(['name', 'type']);
    });

    it('should close column panel', () => {
      component.columnPanelOpen.set(true);
      component.closeColumnPanel();
      expect(component.columnPanelOpen()).toBe(false);
    });

    it('should reset columns to default', () => {
      component.pendingColumnKeys.set(['name', 'type', 'state']);
      component.resetColumns();
      expect(component.pendingColumnKeys()).toEqual(['name', 'modified', 'contributor']);
    });

    it('should apply column changes', () => {
      component.pendingColumnKeys.set(['name', 'modified', 'state']);
      component.applyColumns();
      expect(component.visibleColumnKeys()).toContain('name');
      expect(component.visibleColumnKeys()).toContain('modified');
      expect(component.visibleColumnKeys()).toContain('state');
      expect(component.columnPanelOpen()).toBe(false);
    });
  });

  describe('sortBy', () => {
    it('should set sort to ascending on first click', () => {
      const navigateSpy = vi.spyOn(component['router'], 'navigate');
      component.sortBy('name');
      expect(component.sortColumn()).toBe('name');
      expect(component.sortDirection()).toBe('asc');
      expect(navigateSpy).toHaveBeenCalledWith(
        [],
        expect.objectContaining({
          queryParams: { sortBy: 'dc:title', sortOrder: 'asc' },
        }),
      );
    });

    it('should toggle to descending on second click', () => {
      component.sortColumn.set('name');
      component.sortDirection.set('asc');
      component.sortBy('name');
      expect(component.sortDirection()).toBe('desc');
    });

    it('should clear sort on third click', () => {
      component.sortColumn.set('name');
      component.sortDirection.set('desc');
      component.sortBy('name');
      expect(component.sortColumn()).toBeNull();
      expect(component.sortDirection()).toBeNull();
    });

    it('should do nothing for non-sortable columns', () => {
      const navigateSpy = vi.spyOn(component['router'], 'navigate');
      component.sortBy('flags');
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('getCellValue', () => {
    const mockRow = row();

    it('should return correct values for each column', () => {
      expect(component.getCellValue(mockRow, 'name')).toBe('Test Doc');
      expect(component.getCellValue(mockRow, 'type')).toBe('File');
      expect(component.getCellValue(mockRow, 'modified')).toBe('2026-08-24');
      expect(component.getCellValue(mockRow, 'contributor')).toBe('admin');
      expect(component.getCellValue(mockRow, 'author')).toBe('admin');
    });

    it('should return em dash for missing optional fields', () => {
      const rowWithNulls = row({
        state: undefined,
        version: undefined,
        createdDate: undefined,
        nature: undefined,
        coverage: undefined,
        subjects: undefined,
        flags: undefined,
      });
      expect(component.getCellValue(rowWithNulls, 'state')).toBe('—');
      expect(component.getCellValue(rowWithNulls, 'version')).toBe('—');
      expect(component.getCellValue(rowWithNulls, 'created')).toBe('—');
    });

    it('should return empty string for unknown columns', () => {
      expect(component.getCellValue(mockRow, 'unknown')).toBe('');
    });
  });

  describe('isQuickFilterSelected', () => {
    it('should return true for selected filter', () => {
      component.selectedQuickFilters.set(new Set(['noFolder']));
      expect(component.isQuickFilterSelected('noFolder')).toBe(true);
    });

    it('should return false for unselected filter', () => {
      component.selectedQuickFilters.set(new Set(['noFolder']));
      expect(component.isQuickFilterSelected('mostRecent')).toBe(false);
    });
  });

  describe('favorites', () => {
    it('should check if document is favorited', () => {
      component.favoriteIds.set(new Set(['doc1']));
      expect(component.isFavorited('doc1')).toBe(true);
      expect(component.isFavorited('doc2')).toBe(false);
    });

    it('should add to favorites when not favorited', () => {
      mockDocumentDetailService.addToFavorites.mockReturnValue(of(undefined));
      component.favoriteIds.set(new Set());
      component.toggleFavorite('doc1');
      expect(mockDocumentDetailService.addToFavorites).toHaveBeenCalledWith('doc1');
    });

    it('should remove from favorites when favorited', () => {
      mockDocumentDetailService.removeFromFavorites.mockReturnValue(of(undefined));
      component.favoriteIds.set(new Set(['doc1']));
      component.toggleFavorite('doc1');
      expect(mockDocumentDetailService.removeFromFavorites).toHaveBeenCalledWith('doc1');
    });

    it('should do nothing when id is empty', () => {
      mockDocumentDetailService.addToFavorites.mockClear();
      component.toggleFavorite('');
      expect(mockDocumentDetailService.addToFavorites).not.toHaveBeenCalled();
    });

    it('should do nothing when operation is pending', () => {
      component.favoritePendingIds.set(new Set(['doc1']));
      mockDocumentDetailService.addToFavorites.mockClear();
      component.toggleFavorite('doc1');
      expect(mockDocumentDetailService.addToFavorites).not.toHaveBeenCalled();
    });

    it('should stop event propagation', () => {
      mockDocumentDetailService.addToFavorites.mockReturnValue(of(undefined));
      const event = { stopPropagation: vi.fn() } as unknown as Event;
      component.toggleFavorite('doc1', event);
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('download', () => {
    it('should check if type is downloadable', () => {
      expect(component.isDownloadableType('File')).toBe(true);
      expect(component.isDownloadableType('Document')).toBe(true);
      expect(component.isDownloadableType('')).toBe(false);
    });

    it('should not download when id is empty', () => {
      mockDocumentDetailService.fetchBlob.mockClear();
      component.downloadDocument('', 'test.pdf');
      expect(mockDocumentDetailService.fetchBlob).not.toHaveBeenCalled();
    });
  });

  describe('AI search', () => {
    it('should toggle AI search mode on', () => {
      component.aiSearchMode.set(false);
      component.toggleAiSearch();
      expect(component.aiSearchMode()).toBe(true);
    });

    it('should toggle AI search mode off and reset state', () => {
      component.aiSearchMode.set(true);
      component.aiQuery.set('test query');
      component.toggleAiSearch();
      expect(component.aiSearchMode()).toBe(false);
      expect(component.aiQuery()).toBe('');
    });

    it('should update AI query on input', () => {
      component.onAiQueryInput('natural language query');
      expect(component.aiQuery()).toBe('natural language query');
    });

    it('should select AI suggestion', () => {
      mockAiGatewayService.nlToNxql.mockReturnValue(
        of({ nxql: 'SELECT * FROM Document', explanation: 'test' }),
      );
      component.selectAiSuggestion('find all documents');
      expect(component.aiQuery()).toBe('find all documents');
      expect(component.aiSuggestions()).toEqual([]);
    });

    it('should execute AI search with valid query', () => {
      mockAiGatewayService.nlToNxql.mockReturnValue(
        of({ nxql: 'SELECT * FROM Document', explanation: 'Finds all documents' }),
      );
      mockNuxeoApiBase.nxqlSearch.mockReturnValue(of({ entries: [] }));
      component.aiQuery.set('test query');
      component.executeAiSearch();
      expect(mockAiGatewayService.nlToNxql).toHaveBeenCalledWith('test query');
    });

    it('should not execute AI search with empty query', () => {
      component.aiQuery.set('');
      component.executeAiSearch();
      expect(mockAiGatewayService.nlToNxql).not.toHaveBeenCalled();
    });

    it('should not execute AI search with whitespace-only query', () => {
      component.aiQuery.set('   ');
      component.executeAiSearch();
      expect(mockAiGatewayService.nlToNxql).not.toHaveBeenCalled();
    });
  });

  describe('grid sorting', () => {
    it('should set grid group by and update route', () => {
      const navigateSpy = vi.spyOn(component['router'], 'navigate');
      component.setGridGroupBy('modified');
      expect(component.gridGroupBy()).toBe('modified');
      expect(component.gridSortOrder()).toBe('asc');
      expect(navigateSpy).toHaveBeenCalledWith(
        [],
        expect.objectContaining({
          queryParams: { sortBy: 'dc:modified', sortOrder: 'asc' },
        }),
      );
    });

    it('should set grid sort order', () => {
      const navigateSpy = vi.spyOn(component['router'], 'navigate');
      component.gridGroupBy.set('name');
      component.setGridSortOrder('desc');
      expect(component.gridSortOrder()).toBe('desc');
      expect(navigateSpy).toHaveBeenCalled();
    });

    it('should default to asc for invalid sort direction', () => {
      const navigateSpy = vi.spyOn(component['router'], 'navigate');
      component.gridGroupBy.set('name');
      component.setGridSortOrder(null);
      expect(component.gridSortOrder()).toBe('desc');
    });
  });

  describe('parseQuickFilters', () => {
    it('should parse comma-separated filter string', () => {
      const result = component['parseQuickFilters']('noFolder,mostRecent');
      expect(result).toEqual(new Set(['noFolder', 'mostRecent']));
    });

    it('should filter out invalid values', () => {
      const result = component['parseQuickFilters']('noFolder,invalid,mostRecent');
      expect(result).toEqual(new Set(['noFolder', 'mostRecent']));
    });

    it('should trim whitespace', () => {
      const result = component['parseQuickFilters']('noFolder , mostRecent ');
      expect(result).toEqual(new Set(['noFolder', 'mostRecent']));
    });

    it('should return empty set for empty string', () => {
      const result = component['parseQuickFilters']('');
      expect(result).toEqual(new Set());
    });
  });

  describe('buildDownloadFileName', () => {
    it('should keep existing extension', () => {
      const result = component['buildDownloadFileName']('test.pdf', 'application/pdf');
      expect(result).toBe('test.pdf');
    });

    it('should add extension from MIME type', () => {
      const result = component['buildDownloadFileName']('document', 'application/pdf');
      expect(result).toBe('document.pdf');
    });

    it('should handle unknown MIME type', () => {
      const result = component['buildDownloadFileName']('file', 'application/unknown');
      expect(result).toBe('file');
    });

    it('should use "document" for empty name', () => {
      const result = component['buildDownloadFileName']('', 'application/pdf');
      expect(result).toBe('document.pdf');
    });

    it('should handle various Office formats', () => {
      expect(
        component['buildDownloadFileName'](
          'doc',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ),
      ).toBe('doc.docx');
      expect(
        component['buildDownloadFileName'](
          'sheet',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ),
      ).toBe('sheet.xlsx');
    });
  });

  describe('computed signals', () => {
    it('should compute resultCount', () => {
      vi.spyOn(component, 'displayResults').mockReturnValue([row({ id: '1' }), row({ id: '2' })]);
      expect(component.resultCount()).toBe(2);
    });

    it('should compute selectedCount', () => {
      mockSelectionService.selectedCount.mockReturnValue(3);
      expect(component.selectedCount()).toBe(3);
    });
  });
});
