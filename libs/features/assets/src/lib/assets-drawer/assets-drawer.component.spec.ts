import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  Router,
  convertToParamMap,
} from '@angular/router';
import { BehaviorSubject, EMPTY, Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import {
  AssetAggregationService,
  SearchService,
  type AssetQueueItem,
} from '@agentic-ui/shared/nuxeo-client';

import { AssetsDrawerComponent } from './assets-drawer.component';

const mockSearchService = {
  getSavedSearches: vi.fn(() => of([])),
  getSavedSearchById: vi.fn(() => EMPTY),
  saveSavedSearch: vi.fn(() => EMPTY),
};

function queueItem(id: string): AssetQueueItem {
  return { id, title: `Asset ${id}`, type: 'File', icon: 'description' };
}

describe('AssetsDrawerComponent', () => {
  let component: AssetsDrawerComponent;
  let fixture: ComponentFixture<AssetsDrawerComponent>;
  let aggregationService: AssetAggregationService;
  let queryParams$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let routerEvents$: Subject<NavigationEnd | NavigationStart>;
  let navigate: ReturnType<typeof vi.fn>;
  let snackBarOpen: ReturnType<typeof vi.fn>;
  let dialogOpen: ReturnType<typeof vi.fn>;

  async function createComponent(params: Record<string, string> = {}, url = '/documents') {
    queryParams$ = new BehaviorSubject(convertToParamMap(params));
    routerEvents$ = new Subject();
    navigate = vi.fn().mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [AssetsDrawerComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        { provide: SearchService, useValue: mockSearchService },
        { provide: MatSnackBar, useValue: { open: snackBarOpen } },
        { provide: MatDialog, useValue: { open: dialogOpen } },
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParams$.asObservable() } },
        { provide: Router, useValue: { url, events: routerEvents$.asObservable(), navigate } },
      ],
    })
      // Shallow-render: the real template pulls in seven Material modules plus the queue
      // child, whose zone-tracked handles hang the runner.
      .overrideComponent(AssetsDrawerComponent, {
        set: { imports: [], template: '<div></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AssetsDrawerComponent);
    component = fixture.componentInstance;
    aggregationService = TestBed.inject(AssetAggregationService);
    fixture.detectChanges();
  }

  beforeEach(() => {
    vi.clearAllMocks();
    snackBarOpen = vi.fn();
    dialogOpen = vi.fn(() => ({ afterClosed: () => of(undefined) }));
    mockSearchService.getSavedSearches.mockReturnValue(of([]));
    mockSearchService.getSavedSearchById.mockReturnValue(EMPTY);
    mockSearchService.saveSavedSearch.mockReturnValue(EMPTY);
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('creates with the asset-type group expanded and the filter view active', async () => {
    await createComponent();

    expect(component.viewMode()).toBe('filter');
    expect(component.isExpanded('asset-type')).toBe(true);
    expect(component.isExpanded('asset-format')).toBe(false);
  });

  describe('filter groups', () => {
    it('marks static options selected from the URL', async () => {
      await createComponent({ 'asset-width': 'to_500_px,from_2000_px' });

      const width = component.filterGroups().find((g) => g.id === 'asset-width');
      expect(width?.options.filter((o) => o.selected).map((o) => o.value)).toEqual([
        'to_500_px',
        'from_2000_px',
      ]);
    });

    it('builds dynamic options from the aggregation buckets', async () => {
      await createComponent({ 'asset-type': 'Picture' });
      aggregationService.aggregations.set({
        system_primaryType_agg: {
          buckets: [
            { key: 'Picture', docCount: 3 },
            { key: 'File', docCount: 1 },
          ],
        },
      });
      fixture.detectChanges();

      const type = component.filterGroups().find((g) => g.id === 'asset-type');
      expect(type?.options).toEqual([
        { label: 'Picture', value: 'Picture', selected: true, aggKey: 'Picture' },
        { label: 'File', value: 'File', selected: false, aggKey: 'File' },
      ]);
    });

    it('normalises bare format extensions into mime types', async () => {
      await createComponent({ 'asset-format': 'image/jpeg' });
      aggregationService.aggregations.set({
        system_mimetype_agg: {
          buckets: [
            { key: 'jpg', docCount: 2 },
            { key: 'application/vnd.custom', docCount: 1 },
          ],
        },
      });
      fixture.detectChanges();

      const format = component.filterGroups().find((g) => g.id === 'asset-format');
      expect(format?.options).toEqual([
        { label: 'image/jpeg', value: 'image/jpeg', selected: true, aggKey: 'jpg' },
        {
          label: 'application/vnd.custom',
          value: 'application/vnd.custom',
          selected: false,
          aggKey: 'application/vnd.custom',
        },
      ]);
    });

    it('mirrors the fulltext term from the URL', async () => {
      await createComponent({ ecm_fulltext: 'invoice' });

      expect(component.secondarySearchInput()).toBe('invoice');
      expect(component.hasActiveFilters()).toBe(true);
    });

    it('reports no active filters for an empty URL', async () => {
      await createComponent();

      expect(component.hasActiveFilters()).toBe(false);
    });

    it('toggles a group open and closed', async () => {
      await createComponent();

      component.toggleFilter('asset-format');
      expect(component.isExpanded('asset-format')).toBe(true);

      component.toggleFilter('asset-format');
      expect(component.isExpanded('asset-format')).toBe(false);
    });

    it('navigates with the new selection when auto-search is on', async () => {
      await createComponent();
      aggregationService.aggregations.set({
        system_primaryType_agg: { buckets: [{ key: 'Picture', docCount: 3 }] },
      });
      fixture.detectChanges();

      component.toggleOption('asset-type', 'Picture');

      expect(navigate).toHaveBeenCalledWith(['/documents'], {
        queryParams: { 'asset-type': 'Picture' },
      });
    });

    it('holds the selection locally when auto-search is off', async () => {
      await createComponent({ 'asset-width': 'to_500_px' });
      component.autoSearch.set(false);

      component.toggleOption('asset-width', 'from_2000_px');

      expect(navigate).not.toHaveBeenCalled();
      component.applySearch();
      expect(navigate).toHaveBeenCalledWith(['/documents'], {
        queryParams: { 'asset-width': 'to_500_px,from_2000_px' },
      });
    });

    it('leaves other groups untouched when toggling', async () => {
      await createComponent({ 'asset-width': 'to_500_px' });

      component.toggleOption('asset-height', 'to_500_px');

      expect(navigate).toHaveBeenCalledWith(['/documents'], {
        queryParams: { 'asset-width': 'to_500_px', 'asset-height': 'to_500_px' },
      });
    });

    it('clears every filter and the saved-search selection on reset', async () => {
      await createComponent({ 'asset-width': 'to_500_px', ecm_fulltext: 'invoice' });
      aggregationService.selectedSavedSearchId.set('s1');
      aggregationService.selectedSavedSearchTitle.set('Mine');

      component.resetFilters();

      expect(component.secondarySearchInput()).toBe('');
      expect(component.selectedSavedSearch()).toBe('');
      expect(aggregationService.selectedSavedSearchId()).toBe('');
      expect(navigate).toHaveBeenCalledWith(['/documents'], {
        queryParams: {
          ecm_fulltext: null,
          'asset-type': null,
          'asset-format': null,
          'asset-width': null,
          'asset-height': null,
          'color-profile': null,
          'color-depth': null,
          'video-duration': null,
        },
      });
    });
  });

  describe('bucket counts', () => {
    it('returns an empty string without an aggregation key', async () => {
      await createComponent();

      expect(component.getCountText('asset-type')).toBe('');
    });

    it('returns an empty string for a group with no aggregation field', async () => {
      await createComponent();

      expect(component.getCountText('mystery', 'to_500_px')).toBe('');
    });

    it('renders the bucket count', async () => {
      await createComponent();
      aggregationService.aggregations.set({
        asset_width_agg: { buckets: [{ key: 'to_500_px', docCount: 4 }] },
      });

      expect(component.getCountText('asset-width', 'to_500_px')).toBe(' (4)');
    });

    it('renders a zero for dimension groups with no bucket', async () => {
      await createComponent();
      aggregationService.aggregations.set({ asset_width_agg: { buckets: [] } });

      expect(component.getCountText('asset-width', 'to_500_px')).toBe(' (0)');
    });

    it('renders a zero for dimension groups with no aggregation at all', async () => {
      await createComponent();

      expect(component.getCountText('video-duration', 'to_30_s')).toBe(' (0)');
    });

    it('renders nothing for dynamic groups with no bucket', async () => {
      await createComponent();
      aggregationService.aggregations.set({ system_primaryType_agg: { buckets: [] } });

      expect(component.getCountText('asset-type', 'Picture')).toBe('');
    });
  });

  describe('view switching', () => {
    it('navigates to the selected document when switching to the queue', async () => {
      await createComponent({ 'asset-width': 'to_500_px' }, '/doc/abc?x=1');
      aggregationService.items.set([queueItem('abc'), queueItem('def')]);

      component.switchToQueueView();

      expect(component.viewMode()).toBe('queue');
      expect(navigate).toHaveBeenCalledWith(['/doc', 'abc'], {
        queryParams: { 'asset-width': 'to_500_px' },
      });
    });

    it('falls back to the first queue item when nothing is selected', async () => {
      await createComponent();
      aggregationService.items.set([queueItem('def')]);

      component.switchToQueueView();

      expect(navigate).toHaveBeenCalledWith(['/doc', 'def'], { queryParams: {} });
    });

    it('falls back to the first queue item when the selection is not in the results', async () => {
      await createComponent({}, '/doc/ghost');
      aggregationService.items.set([queueItem('def')]);

      component.switchToQueueView();

      expect(navigate).toHaveBeenCalledWith(['/doc', 'def'], { queryParams: {} });
    });

    it('does not navigate when the queue is empty', async () => {
      await createComponent();

      component.switchToQueueView();

      expect(component.viewMode()).toBe('queue');
      expect(navigate).not.toHaveBeenCalled();
    });

    it('returns to the results list when switching back to filters', async () => {
      await createComponent({ 'asset-width': 'to_500_px' });
      component.viewMode.set('queue');

      component.switchToFilterView();

      expect(component.viewMode()).toBe('filter');
      expect(navigate).toHaveBeenCalledWith(['/documents'], {
        queryParams: { 'asset-width': 'to_500_px' },
      });
    });

    it('opens the document for a queue selection', async () => {
      await createComponent();

      component.onQueueItemSelected(queueItem('abc'));

      expect(navigate).toHaveBeenCalledWith(['/doc', 'abc'], { queryParams: {} });
    });

    it('tracks the selected document across navigation', async () => {
      await createComponent({}, '/documents');
      expect(component.selectedDocumentId()).toBe('');

      routerEvents$.next(new NavigationEnd(1, '/doc/abc', '/doc/abc?view=grid'));
      expect(component.selectedDocumentId()).toBe('abc');

      routerEvents$.next(new NavigationEnd(2, '/documents', '/documents'));
      expect(component.selectedDocumentId()).toBe('');
    });

    it('ignores navigation events other than NavigationEnd', async () => {
      await createComponent({}, '/doc/abc');

      routerEvents$.next(new NavigationStart(3, '/documents'));

      expect(component.selectedDocumentId()).toBe('abc');
    });

    it('ignores a trailing /doc with no id', async () => {
      await createComponent({}, '/doc');

      expect(component.selectedDocumentId()).toBe('');
    });
  });

  describe('secondary search', () => {
    it('pushes the term into the URL', async () => {
      await createComponent();

      component.onSecondarySearchInput('  invoice  ');
      component.onSecondarySearchEnter();

      expect(navigate).toHaveBeenCalledWith(['/documents'], {
        queryParams: { ecm_fulltext: 'invoice' },
        queryParamsHandling: 'merge',
      });
    });

    it('clears the term from the URL', async () => {
      await createComponent({ ecm_fulltext: 'invoice' });

      component.onSecondarySearchClear();

      expect(component.secondarySearchInput()).toBe('');
      expect(navigate).toHaveBeenCalledWith(['/documents'], {
        queryParams: { ecm_fulltext: null },
        queryParamsHandling: 'merge',
      });
    });
  });

  describe('saved searches', () => {
    it('loads the list once on focus', async () => {
      mockSearchService.getSavedSearches.mockReturnValue(
        of([{ id: 's1', title: 'Pictures', query: 'q' }]),
      );
      await createComponent();

      component.onFilterSearchFocus();
      component.onFilterSearchFocus();

      expect(component.filterSearchOpen()).toBe(true);
      expect(mockSearchService.getSavedSearches).toHaveBeenCalledTimes(1);
      expect(mockSearchService.getSavedSearches).toHaveBeenCalledWith('assets_search');
      expect(component.availableSavedSearches()).toEqual([
        { key: 's1', value: 's1', label: 'Pictures', query: 'q' },
      ]);
      expect(component.savedSearchesLoaded()).toBe(true);
      expect(component.savedSearchesLoading()).toBe(false);
    });

    it('clears the loading flag when the list fails to load', async () => {
      mockSearchService.getSavedSearches.mockReturnValue(throwError(() => new Error('nope')));
      await createComponent();

      component.onFilterSearchFocus();

      expect(component.savedSearchesLoading()).toBe(false);
      expect(component.savedSearchesLoaded()).toBe(false);
    });

    it('does not start a second request while one is in flight', async () => {
      mockSearchService.getSavedSearches.mockReturnValue(EMPTY);
      await createComponent();

      component.onFilterSearchFocus();
      component.onFilterSearchFocus();

      expect(mockSearchService.getSavedSearches).toHaveBeenCalledTimes(1);
    });

    it('reloads the list when another view marks it dirty', async () => {
      await createComponent();

      aggregationService.markSavedSearchDirty();
      fixture.detectChanges();

      expect(mockSearchService.getSavedSearches).toHaveBeenCalledTimes(1);
    });

    it('filters the dropdown case-insensitively', async () => {
      mockSearchService.getSavedSearches.mockReturnValue(
        of([
          { id: 's1', title: 'Pictures' },
          { id: 's2', title: 'Videos' },
        ]),
      );
      await createComponent();
      component.onFilterSearchFocus();

      expect(component.filteredSavedSearches().length).toBe(2);

      component.savedSearchFilter.set('  pic ');
      expect(component.filteredSavedSearches().map((o) => o.label)).toEqual(['Pictures']);
    });

    it('closes the dropdown after a short delay', async () => {
      vi.useFakeTimers();
      await createComponent();
      component.filterSearchOpen.set(true);

      component.closeFilterSearchDropdown();
      expect(component.filterSearchOpen()).toBe(true);

      vi.advanceTimersByTime(120);
      expect(component.filterSearchOpen()).toBe(false);
      vi.useRealTimers();
    });

    it('applies the selected saved search and normalises its params', async () => {
      mockSearchService.getSavedSearchById.mockReturnValue(
        of({
          'asset-type': '["Picture","File"]',
          asset_width_agg: 'to_500_px , from_2000_px',
          ecmFulltext: 'invoice',
        }),
      );
      await createComponent();

      component.selectFilterOption({ key: 's1', value: 's1', label: 'Pictures' });

      expect(component.filterSearchInput()).toBe('Pictures');
      expect(component.selectedSavedSearch()).toBe('s1');
      expect(component.filterSearchOpen()).toBe(false);
      expect(aggregationService.selectedSavedSearchId()).toBe('s1');
      expect(aggregationService.selectedSavedSearchTitle()).toBe('Pictures');
      expect(navigate).toHaveBeenCalledWith(['/documents'], {
        queryParams: {
          'asset-type': 'Picture,File',
          'asset-format': null,
          'asset-width': 'to_500_px,from_2000_px',
          'asset-height': null,
          'color-profile': null,
          'color-depth': null,
          'video-duration': null,
          ecm_fulltext: 'invoice',
        },
      });
    });

    it('ignores malformed JSON and non-array values in saved params', async () => {
      mockSearchService.getSavedSearchById.mockReturnValue(
        of({ 'asset-type': '{not json', 'asset-width': '"scalar"' }),
      );
      await createComponent();

      component.selectFilterOption({ key: 's1', value: 's1', label: 'Pictures' });

      expect(navigate).toHaveBeenCalledWith(['/documents'], {
        queryParams: expect.objectContaining({
          'asset-type': '{not json',
          'asset-width': '"scalar"',
          ecm_fulltext: null,
        }),
      });
    });

    it('treats an empty saved search as a full reset', async () => {
      mockSearchService.getSavedSearchById.mockReturnValue(of({ 'asset-type': '   ' }));
      await createComponent();

      component.selectFilterOption({ key: 's1', value: 's1', label: 'Pictures' });

      expect(navigate).toHaveBeenCalledWith(['/documents'], {
        queryParams: expect.objectContaining({ 'asset-type': null, ecm_fulltext: null }),
      });
    });

    it('mirrors an externally selected saved search into the input', async () => {
      await createComponent();

      aggregationService.selectedSavedSearchId.set('s9');
      aggregationService.selectedSavedSearchTitle.set('  From results  ');
      fixture.detectChanges();

      expect(component.selectedSavedSearch()).toBe('s9');
      expect(component.filterSearchInput()).toBe('From results');
    });

    it('clears the input when the external selection is dropped', async () => {
      await createComponent();
      aggregationService.selectedSavedSearchId.set('s9');
      fixture.detectChanges();

      aggregationService.selectedSavedSearchId.set('');
      fixture.detectChanges();

      expect(component.selectedSavedSearch()).toBe('');
      expect(component.filterSearchInput()).toBe('');
      expect(component.filterSearchOpen()).toBe(false);
    });

    it('saves the current filters under a new name', async () => {
      await createComponent({ 'asset-width': 'to_500_px' });
      dialogOpen.mockReturnValue({ afterClosed: () => of('  Wide  ') });
      mockSearchService.saveSavedSearch.mockReturnValue(of({ id: 's1' }));
      component.onSecondarySearchInput('invoice');

      component.openSaveAsDialog();

      expect(mockSearchService.saveSavedSearch).toHaveBeenCalledWith({
        title: 'Wide',
        params: { 'asset-width': 'to_500_px', ecm_fulltext: 'invoice' },
        pageProviderName: 'assets_search',
      });
      expect(snackBarOpen).toHaveBeenCalledWith(
        'Search "Wide" saved.',
        'OK',
        expect.objectContaining({ duration: 3000 }),
      );
    });

    it('ignores a blank name', async () => {
      await createComponent();
      dialogOpen.mockReturnValue({ afterClosed: () => of('   ') });

      component.openSaveAsDialog();

      expect(mockSearchService.saveSavedSearch).not.toHaveBeenCalled();
    });

    it('warns when saving fails', async () => {
      await createComponent();
      dialogOpen.mockReturnValue({ afterClosed: () => of('Wide') });
      mockSearchService.saveSavedSearch.mockReturnValue(throwError(() => new Error('nope')));

      component.openSaveAsDialog();

      expect(snackBarOpen).toHaveBeenCalledWith(
        'Failed to save search.',
        'Dismiss',
        expect.objectContaining({ duration: 5000 }),
      );
    });
  });
});
