import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ActivatedRoute,
  Router,
  convertToParamMap,
  provideRouter,
  withDisabledInitialNavigation,
} from '@angular/router';
import { BehaviorSubject, EMPTY, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import {
  AssetAggregationService,
  AssetService,
  DocumentDetailService,
  SearchService,
  SelectionService,
  type NuxeoDocument,
} from '@agentic-ui/shared/nuxeo-client';

import { AssetSearchResultsComponent, type AssetResult } from './asset-search-results.component';

function doc(
  uid: string,
  properties: Record<string, unknown> = {},
  overrides: Partial<NuxeoDocument> = {},
): NuxeoDocument {
  return {
    uid,
    title: `Asset ${uid}`,
    type: 'File',
    path: `/default-domain/workspaces/${uid}`,
    lastModified: '2026-05-04T10:00:00.000Z',
    properties,
    ...overrides,
  };
}

const mockAssetService = { searchAssets: vi.fn(() => EMPTY) };
const mockDetailService = { fetchThumbnail: vi.fn(() => EMPTY) };
const mockSearchService = {
  saveSavedSearch: vi.fn(() => EMPTY),
  updateSavedSearch: vi.fn(() => EMPTY),
  deleteSavedSearch: vi.fn(() => EMPTY),
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

describe('AssetSearchResultsComponent', () => {
  let component: AssetSearchResultsComponent;
  let fixture: ComponentFixture<AssetSearchResultsComponent>;
  let queryParams$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let aggregationService: AssetAggregationService;
  let snackBarOpen: ReturnType<typeof vi.fn>;
  let dialogOpen: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;

  // jsdom ships no object-URL implementation, and the component revokes thumbnail URLs
  // during teardown, so both halves are stubbed for the whole suite.
  beforeAll(() => {
    createObjectURL = vi.fn(() => 'blob:asset');
    revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURL, configurable: true });
  });

  afterAll(() => {
    delete (URL as unknown as Record<string, unknown>)['createObjectURL'];
    delete (URL as unknown as Record<string, unknown>)['revokeObjectURL'];
  });

  async function createComponent(params: Record<string, string> = {}) {
    queryParams$ = new BehaviorSubject(convertToParamMap(params));

    await TestBed.configureTestingModule({
      imports: [AssetSearchResultsComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter([], withDisabledInitialNavigation()),
        { provide: AssetService, useValue: mockAssetService },
        { provide: DocumentDetailService, useValue: mockDetailService },
        { provide: SearchService, useValue: mockSearchService },
        { provide: SelectionService, useValue: mockSelectionService },
        { provide: MatSnackBar, useValue: { open: snackBarOpen } },
        { provide: MatDialog, useValue: { open: dialogOpen } },
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParams$.asObservable() } },
      ],
    })
      // Shallow-render: the real template pulls in eight Material modules whose
      // zone-tracked handles hang the runner. Component logic is what we assert on.
      .overrideComponent(AssetSearchResultsComponent, {
        set: { imports: [], template: '<div></div>' },
      })
      .compileComponents();

    navigate = vi.fn().mockResolvedValue(true);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockImplementation(navigate);

    fixture = TestBed.createComponent(AssetSearchResultsComponent);
    component = fixture.componentInstance;
    aggregationService = TestBed.inject(AssetAggregationService);
    fixture.detectChanges();
  }

  beforeEach(() => {
    vi.clearAllMocks();
    snackBarOpen = vi.fn();
    dialogOpen = vi.fn(() => ({ afterClosed: () => of(undefined) }));
    mockAssetService.searchAssets.mockReturnValue(of({ entries: [] }));
    mockDetailService.fetchThumbnail.mockReturnValue(EMPTY);
    mockSearchService.saveSavedSearch.mockReturnValue(EMPTY);
    mockSearchService.updateSavedSearch.mockReturnValue(EMPTY);
    mockSearchService.deleteSavedSearch.mockReturnValue(EMPTY);
    mockSelectionService.isAllSelected.mockReturnValue(false);
    mockSelectionService.isIndeterminate.mockReturnValue(false);
    mockSelectionService.isSelected.mockReturnValue(false);
    mockSelectionService.selectedCount.mockReturnValue(0);
    mockSelectionService.selectedIds.mockReturnValue(new Set<string>());
    mockSelectionService.deleteSelected.mockReturnValue(of([]));
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('creates', async () => {
    await createComponent();
    expect(component).toBeTruthy();
  });

  describe('loading assets', () => {
    it('maps entries, clears loading and mirrors the queue items', async () => {
      mockAssetService.searchAssets.mockReturnValue(
        of({
          entries: [
            doc(
              'a',
              {
                'file:content': { 'mime-type': 'image/jpeg' },
                'dc:lastContributor': 'alice',
                'dc:created': '2026-01-02T00:00:00.000Z',
                'dc:creator': 'bob',
                'dc:nature': 'article',
                'dc:coverage': 'europe',
                'dc:subjects': ['tax', 'legal'],
                'uid:major_version': 2,
                'uid:minor_version': 1,
              },
              { state: 'project' },
            ),
          ],
        }),
      );

      await createComponent();

      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
      const [asset] = component.assets();
      expect(asset).toMatchObject({
        id: 'a',
        name: 'Asset a',
        type: 'File',
        format: 'jpeg',
        mimeType: 'image/jpeg',
        modifiedDate: '2026-05-04',
        lastContributor: 'alice',
        createdDate: '2026-01-02',
        author: 'bob',
        nature: 'article',
        coverage: 'europe',
        subjects: 'tax, legal',
        state: 'project',
        version: '2.1',
      });
      expect(aggregationService.items()).toEqual([
        { id: 'a', title: 'Asset a', type: 'File', icon: asset.icon },
      ]);
    });

    it('leaves version undefined when the document carries none', async () => {
      mockAssetService.searchAssets.mockReturnValue(of({ entries: [doc('a')] }));

      await createComponent();

      expect(component.assets()[0].version).toBeUndefined();
      expect(component.getCellValue(component.assets()[0], 'version')).toBe('—');
    });

    it('defaults a missing minor version to zero', async () => {
      mockAssetService.searchAssets.mockReturnValue(
        of({ entries: [doc('a', { 'uid:major_version': 3 })] }),
      );

      await createComponent();

      expect(component.assets()[0].version).toBe('3.0');
    });

    it('strips a structured mime suffix when deriving the format', async () => {
      mockAssetService.searchAssets.mockReturnValue(
        of({ entries: [doc('a', { 'file:content': { 'mime-type': 'image/svg+xml' } })] }),
      );

      await createComponent();

      expect(component.assets()[0].format).toBe('svg');
    });

    it('reads pixel dimensions from image metadata', async () => {
      mockAssetService.searchAssets.mockReturnValue(
        of({
          entries: [doc('a', { 'imd:pixel_xdimension': 800, 'imd:pixel_ydimension': '600' })],
        }),
      );

      await createComponent();

      expect(component.assets()[0].widthPx).toBe(800);
      expect(component.assets()[0].heightPx).toBe(600);
    });

    it('falls back to video metadata for dimensions and duration', async () => {
      mockAssetService.searchAssets.mockReturnValue(
        of({ entries: [doc('a', { 'vid:info': { width: 1920, height: 1080, duration: 42 } })] }),
      );

      await createComponent();

      expect(component.assets()[0]).toMatchObject({
        widthPx: 1920,
        heightPx: 1080,
        videoDurationSec: 42,
      });
    });

    it('leaves dimensions undefined when no metadata is present', async () => {
      mockAssetService.searchAssets.mockReturnValue(of({ entries: [doc('a')] }));

      await createComponent();

      expect(component.assets()[0].widthPx).toBeUndefined();
      expect(component.assets()[0].heightPx).toBeUndefined();
      expect(component.assets()[0].videoDurationSec).toBeUndefined();
    });

    it('sets an error message and stops loading when the search fails', async () => {
      mockAssetService.searchAssets.mockReturnValue(throwError(() => new Error('boom')));

      await createComponent();

      expect(component.error()).toBe('Failed to load assets.');
      expect(component.loading()).toBe(false);
      expect(component.assets()).toEqual([]);
    });

    it('translates query params into API search params', async () => {
      await createComponent({
        'asset-type': 'Picture,File',
        'asset-format': 'image/png',
        'asset-width': 'to_500_px',
        'asset-height': 'from_2000_px',
        'color-profile': 'RGB',
        'color-depth': '8',
        'video-duration': 'to_30_s',
        ecm_fulltext: '  invoice  ',
        sortBy: 'dc:title',
        sortOrder: 'desc',
      });

      expect(mockAssetService.searchAssets).toHaveBeenCalledWith({
        primaryTypes: ['Picture', 'File'],
        mimeTypes: ['image/png'],
        widths: ['to_500_px'],
        heights: ['from_2000_px'],
        colorProfiles: ['RGB'],
        colorDepths: ['8'],
        videoDurations: ['to_30_s'],
        ecmFulltext: 'invoice',
        sortBy: 'dc:title',
        sortOrder: 'desc',
      });
    });

    it('drops an unrecognised sort order rather than forwarding it', async () => {
      await createComponent({ sortOrder: 'sideways' });

      expect(mockAssetService.searchAssets).toHaveBeenCalledWith(
        expect.objectContaining({ sortOrder: undefined }),
      );
    });

    it('treats a whitespace-only fulltext as absent', async () => {
      await createComponent({ ecm_fulltext: '   ' });

      expect(mockAssetService.searchAssets).toHaveBeenCalledWith(
        expect.objectContaining({ ecmFulltext: undefined }),
      );
    });

    it('re-searches when the query params change', async () => {
      await createComponent();
      mockAssetService.searchAssets.mockClear();

      queryParams$.next(convertToParamMap({ 'asset-type': 'Picture' }));

      expect(mockAssetService.searchAssets).toHaveBeenCalledWith(
        expect.objectContaining({ primaryTypes: ['Picture'] }),
      );
    });
  });

  describe('aggregations', () => {
    it('computes primary-type and mime buckets when the API returns none', async () => {
      mockAssetService.searchAssets.mockReturnValue(
        of({
          entries: [
            doc('a', { 'file:content': { 'mime-type': 'image/png' } }),
            doc('b', { 'file:content': { 'mime-type': 'image/png' } }, { type: 'Picture' }),
            doc('c'),
          ],
        }),
      );

      await createComponent();

      expect(aggregationService.aggregations().system_primaryType_agg?.buckets).toEqual([
        { key: 'File', docCount: 2 },
        { key: 'Picture', docCount: 1 },
      ]);
      expect(aggregationService.aggregations().system_mimetype_agg?.buckets).toEqual([
        { key: 'image/png', docCount: 2 },
      ]);
    });

    it('keeps API-provided type and mime buckets untouched', async () => {
      mockAssetService.searchAssets.mockReturnValue(
        of({
          entries: [doc('a')],
          aggregations: {
            system_primaryType_agg: { buckets: [{ key: 'Video', docCount: 9 }] },
            system_mimetype_agg: { buckets: [{ key: 'video/mp4', docCount: 9 }] },
          },
        }),
      );

      await createComponent();

      expect(aggregationService.aggregations().system_primaryType_agg?.buckets).toEqual([
        { key: 'Video', docCount: 9 },
      ]);
      expect(aggregationService.aggregations().system_mimetype_agg?.buckets).toEqual([
        { key: 'video/mp4', docCount: 9 },
      ]);
    });

    it('always recomputes width and height buckets from the result set', async () => {
      mockAssetService.searchAssets.mockReturnValue(
        of({
          entries: [
            doc('a', { 'imd:pixel_xdimension': 100, 'imd:pixel_ydimension': 100 }),
            doc('b', { 'imd:pixel_xdimension': 800, 'imd:pixel_ydimension': 1800 }),
            doc('c', { 'imd:pixel_xdimension': 1800, 'imd:pixel_ydimension': 2500 }),
            doc('d', { 'imd:pixel_xdimension': 3000, 'imd:pixel_ydimension': 1600 }),
          ],
          aggregations: { asset_width_agg: { buckets: [{ key: 'stale', docCount: 99 }] } },
        }),
      );

      await createComponent();

      expect(aggregationService.aggregations().asset_width_agg?.buckets).toEqual([
        { key: 'to_500_px', docCount: 1 },
        { key: 'from_500_to_1500_px', docCount: 1 },
        { key: 'from_1500_to_2000_px', docCount: 1 },
        { key: 'from_2000_px', docCount: 1 },
      ]);
      expect(aggregationService.aggregations().asset_height_agg?.buckets).toEqual([
        { key: 'to_500_px', docCount: 1 },
        { key: 'from_500_to_1500_px', docCount: 0 },
        { key: 'from_1500_to_2000_px', docCount: 2 },
        { key: 'from_2000_px', docCount: 1 },
      ]);
    });
  });

  describe('client-side filtering', () => {
    const entries = [
      doc(
        'img',
        {
          'file:content': { 'mime-type': 'image/png' },
          'imd:pixel_xdimension': 400,
          'imd:pixel_ydimension': 400,
        },
        { type: 'Picture' },
      ),
      doc(
        'vid',
        { 'file:content': { 'mime-type': 'video/mp4' }, 'vid:info': { duration: 20 } },
        { type: 'Video' },
      ),
    ];

    it('keeps everything when no filters are applied', async () => {
      mockAssetService.searchAssets.mockReturnValue(of({ entries }));

      await createComponent();

      expect(component.filteredAssets().length).toBe(2);
      expect(component.resultCount()).toBe(2);
    });

    it('filters by primary type', async () => {
      mockAssetService.searchAssets.mockReturnValue(of({ entries }));

      await createComponent({ 'asset-type': 'Picture' });

      expect(component.filteredAssets().map((a) => a.id)).toEqual(['img']);
    });

    it('filters by mime type', async () => {
      mockAssetService.searchAssets.mockReturnValue(of({ entries }));

      await createComponent({ 'asset-format': 'video/mp4' });

      expect(component.filteredAssets().map((a) => a.id)).toEqual(['vid']);
    });

    it('filters by width bucket', async () => {
      mockAssetService.searchAssets.mockReturnValue(of({ entries }));

      await createComponent({ 'asset-width': 'to_500_px' });

      expect(component.filteredAssets().map((a) => a.id)).toEqual(['img']);
    });

    it('filters by height bucket', async () => {
      mockAssetService.searchAssets.mockReturnValue(of({ entries }));

      await createComponent({ 'asset-height': 'from_2000_px' });

      expect(component.filteredAssets()).toEqual([]);
    });

    it('filters by video duration bucket', async () => {
      mockAssetService.searchAssets.mockReturnValue(of({ entries }));

      await createComponent({ 'video-duration': 'to_30_s' });

      expect(component.filteredAssets().map((a) => a.id)).toEqual(['vid']);
    });

    it.each([
      ['from_30_to_180_s', 60],
      ['from_180_to_600_s', 300],
      ['from_600_to_1800_s', 1200],
      ['from_1800_s', 3600],
    ])('matches the %s duration bucket', async (bucket, duration) => {
      mockAssetService.searchAssets.mockReturnValue(
        of({ entries: [doc('v', { 'vid:info': { duration } })] }),
      );

      await createComponent({ 'video-duration': bucket as string });

      expect(component.filteredAssets().length).toBe(1);
    });

    it('excludes assets with no duration from a duration filter', async () => {
      mockAssetService.searchAssets.mockReturnValue(of({ entries: [doc('a')] }));

      await createComponent({ 'video-duration': 'to_30_s' });

      expect(component.filteredAssets()).toEqual([]);
    });

    it('matches nothing for an unrecognised bucket key', async () => {
      mockAssetService.searchAssets.mockReturnValue(of({ entries }));

      await createComponent({ 'asset-width': 'not_a_bucket' });

      expect(component.filteredAssets()).toEqual([]);
    });
  });

  describe('sorting', () => {
    beforeEach(() => {
      mockAssetService.searchAssets.mockReturnValue(
        of({
          entries: [
            doc(
              'b',
              { 'dc:lastContributor': 'zoe', 'dc:created': '2026-02-01T00:00:00.000Z' },
              { title: 'Beta', lastModified: '2026-02-01T00:00:00.000Z' },
            ),
            doc(
              'a',
              { 'dc:lastContributor': 'amy', 'dc:created': '2026-01-01T00:00:00.000Z' },
              { title: 'Alpha', lastModified: '2026-01-01T00:00:00.000Z' },
            ),
          ],
        }),
      );
    });

    it('leaves sortedAssets unsorted until a column is chosen', async () => {
      await createComponent();

      expect(component.sortedAssets().map((a) => a.id)).toEqual(['b', 'a']);
    });

    it('cycles a column ascending, descending, then off', async () => {
      await createComponent();

      component.sortBy('name');
      expect(component.sortDirection()).toBe('asc');
      expect(component.sortedAssets().map((a) => a.name)).toEqual(['Alpha', 'Beta']);

      component.sortBy('name');
      expect(component.sortDirection()).toBe('desc');
      expect(component.sortedAssets().map((a) => a.name)).toEqual(['Beta', 'Alpha']);

      component.sortBy('name');
      expect(component.sortColumn()).toBeNull();
      expect(component.sortDirection()).toBeNull();
    });

    it('ignores non-sortable columns', async () => {
      await createComponent();

      component.sortBy('nature');

      expect(component.sortColumn()).toBeNull();
    });

    it('restarts at ascending when switching column', async () => {
      await createComponent();
      component.sortBy('name');
      component.sortBy('name');

      component.sortBy('modified');

      expect(component.sortColumn()).toBe('modified');
      expect(component.sortDirection()).toBe('asc');
    });

    it('sorts by the modified and contributor columns', async () => {
      await createComponent();

      component.sortBy('modified');
      expect(component.sortedAssets().map((a) => a.id)).toEqual(['a', 'b']);

      component.sortBy('contributor');
      expect(component.sortedAssets().map((a) => a.lastContributor)).toEqual(['amy', 'zoe']);
    });

    it('groups the grid by created date by default', async () => {
      await createComponent();

      expect(component.gridAssets().map((a) => a.id)).toEqual(['a', 'b']);
    });

    it.each(['name', 'modifiedDate', 'lastContributor', 'state', 'nature', 'coverage'])(
      'sorts the grid by %s',
      async (key) => {
        await createComponent();

        component.gridGroupBy.set(key);

        expect(component.gridAssets().length).toBe(2);
      },
    );

    it('honours a descending grid order', async () => {
      await createComponent();
      component.gridGroupBy.set('name');
      component.gridSortOrder.set('desc');

      expect(component.gridAssets().map((a) => a.name)).toEqual(['Beta', 'Alpha']);
    });

    it('pushes the mapped API field into the URL when grouping changes', async () => {
      await createComponent();

      component.setGridGroupBy('lastContributor');

      expect(component.gridSortOrder()).toBe('asc');
      expect(navigate).toHaveBeenCalledWith(
        [],
        expect.objectContaining({
          queryParams: { sortBy: 'dc:lastContributor', sortOrder: 'asc' },
          queryParamsHandling: 'merge',
        }),
      );
    });

    it('clears sortBy for a grouping key with no API field', async () => {
      await createComponent();

      component.setGridGroupBy('mystery');

      expect(navigate).toHaveBeenCalledWith(
        [],
        expect.objectContaining({ queryParams: { sortBy: null, sortOrder: 'asc' } }),
      );
    });

    it('keeps the current field when only the direction changes', async () => {
      await createComponent();
      component.gridGroupBy.set('name');

      component.setGridSortOrder('desc');

      expect(navigate).toHaveBeenCalledWith(
        [],
        expect.objectContaining({ queryParams: { sortBy: 'dc:title', sortOrder: 'desc' } }),
      );
    });

    it('hydrates the grid controls from the URL sort params', async () => {
      await createComponent({ sortBy: 'dc:modified', sortOrder: 'desc' });

      expect(component.gridGroupBy()).toBe('modifiedDate');
      expect(component.gridSortOrder()).toBe('desc');
    });

    it('defaults the grid controls when the URL carries no sort', async () => {
      await createComponent();

      expect(component.gridGroupBy()).toBe('createdDate');
      expect(component.gridSortOrder()).toBe('asc');
    });

    it('falls back to createdDate for an unknown API sort field', async () => {
      await createComponent({ sortBy: 'dc:mystery' });

      expect(component.gridGroupBy()).toBe('createdDate');
    });
  });

  describe('columns', () => {
    beforeEach(() => createComponent());

    it('exposes the default three columns', () => {
      expect(component.visibleColumns().map((c) => c.key)).toEqual([
        'name',
        'modified',
        'contributor',
      ]);
    });

    it('no longer offers a Flags column that has no data source', () => {
      expect(component.allColumns.map((c) => c.key)).not.toContain('flags');
    });

    it('brackets the visible columns with checkbox and action tracks', () => {
      component.visibleColumnKeys.set(['name']);

      expect(component.gridTemplate()).toBe('40px minmax(280px, 1fr) 40px');
    });

    it('adds pending columns in declaration order and removes them on repeat', () => {
      component.pendingColumnKeys.set(['modified']);

      component.togglePendingColumn('name');
      expect(component.pendingColumnKeys()).toEqual(['name', 'modified']);

      component.togglePendingColumn('name');
      expect(component.pendingColumnKeys()).toEqual(['modified']);
    });

    it('reports pending membership', () => {
      expect(component.isPendingColumn('name')).toBe(true);
      expect(component.isPendingColumn('state')).toBe(false);
    });

    it('seeds the panel from the visible selection', () => {
      component.visibleColumnKeys.set(['name', 'state']);

      component.openColumnPanel();

      expect(component.columnPanelOpen()).toBe(true);
      expect(component.pendingColumnKeys()).toEqual(['name', 'state']);
    });

    it('commits pending columns in declaration order and closes the panel', () => {
      component.pendingColumnKeys.set(['state', 'name']);

      component.applyColumns();

      expect(component.visibleColumnKeys()).toEqual(['name', 'state']);
      expect(component.columnPanelOpen()).toBe(false);
    });

    it('closes the panel without committing', () => {
      component.columnPanelOpen.set(true);

      component.closeColumnPanel();

      expect(component.columnPanelOpen()).toBe(false);
    });

    it('resets to the default columns', () => {
      component.pendingColumnKeys.set([]);

      component.resetColumns();

      expect(component.pendingColumnKeys()).toEqual(['name', 'modified', 'contributor']);
    });
  });

  describe('getCellValue', () => {
    beforeEach(async () => {
      mockAssetService.searchAssets.mockReturnValue(
        of({
          entries: [
            doc(
              'a',
              {
                'dc:lastContributor': 'alice',
                'dc:created': '2026-01-02T00:00:00.000Z',
                'dc:creator': 'bob',
                'dc:nature': 'article',
                'dc:coverage': 'europe',
                'dc:subjects': ['tax'],
                'uid:major_version': 1,
              },
              { state: 'project' },
            ),
          ],
        }),
      );
      await createComponent();
    });

    it.each([
      ['type', 'File'],
      ['modified', '2026-05-04'],
      ['contributor', 'alice'],
      ['state', 'project'],
      ['version', '1.0'],
      ['created', '2026-01-02'],
      ['author', 'bob'],
      ['nature', 'article'],
      ['coverage', 'europe'],
      ['subjects', 'tax'],
      ['name', ''],
      ['unknown', ''],
    ])('maps the %s column', (key, expected) => {
      expect(component.getCellValue(component.assets()[0], key)).toBe(expected);
    });

    it('renders an em dash for optional fields that are absent', () => {
      const bare: AssetResult = { ...component.assets()[0], state: undefined, nature: undefined };

      expect(component.getCellValue(bare, 'state')).toBe('—');
      expect(component.getCellValue(bare, 'nature')).toBe('—');
    });
  });

  describe('selection', () => {
    beforeEach(async () => {
      mockAssetService.searchAssets.mockReturnValue(of({ entries: [doc('a'), doc('b')] }));
      await createComponent();
    });

    it('passes the asset name as the selection label', () => {
      component.toggleAssetSelection('a');

      expect(mockSelectionService.toggle).toHaveBeenCalledWith('a', 'Asset a', null);
    });

    it('falls back to the id for an unknown asset', () => {
      component.toggleAssetSelection('ghost');

      expect(mockSelectionService.toggle).toHaveBeenCalledWith('ghost', 'ghost', null);
    });

    it('selects everything visible with labels and previews', () => {
      component.toggleAll();

      expect(mockSelectionService.selectAll).toHaveBeenCalledWith(
        ['a', 'b'],
        { a: 'Asset a', b: 'Asset b' },
        { a: null, b: null },
      );
    });

    it('clears when everything is already selected', () => {
      mockSelectionService.isAllSelected.mockReturnValue(true);

      component.toggleAll();

      expect(mockSelectionService.clear).toHaveBeenCalled();
    });

    it('delegates selection queries to the service', () => {
      mockSelectionService.isSelected.mockReturnValue(true);
      mockSelectionService.isIndeterminate.mockReturnValue(true);
      mockSelectionService.selectedCount.mockReturnValue(3);

      expect(component.isAssetSelected('a')).toBe(true);
      expect(component.isIndeterminate()).toBe(true);
      expect(component.selectedCount()).toBe(3);
    });

    it('clears the selection', () => {
      component.clearSelection();

      expect(mockSelectionService.clear).toHaveBeenCalled();
    });

    it('refreshes the current route after deleting', () => {
      component.deleteSelected();

      expect(mockSelectionService.deleteSelected).toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith(
        [],
        expect.objectContaining({ queryParamsHandling: 'merge' }),
      );
    });
  });

  describe('thumbnails', () => {
    it('stores a sanitized blob URL per asset', async () => {
      mockDetailService.fetchThumbnail.mockReturnValue(of(new Blob(['x'])));
      mockAssetService.searchAssets.mockReturnValue(of({ entries: [doc('a')] }));

      await createComponent();

      expect(mockDetailService.fetchThumbnail).toHaveBeenCalledWith('a');
      expect(component.thumbnailMap()['a']).toBeTruthy();
    });

    it('ignores a thumbnail that fails to load', async () => {
      mockDetailService.fetchThumbnail.mockReturnValue(throwError(() => new Error('404')));
      mockAssetService.searchAssets.mockReturnValue(of({ entries: [doc('a')] }));

      await createComponent();

      expect(component.thumbnailMap()['a']).toBeUndefined();
    });

    it('revokes every thumbnail object URL on destroy', async () => {
      mockDetailService.fetchThumbnail.mockReturnValue(of(new Blob(['x'])));
      mockAssetService.searchAssets.mockReturnValue(of({ entries: [doc('a'), doc('b')] }));

      await createComponent();
      revokeObjectURL.mockClear();
      fixture.destroy();

      expect(revokeObjectURL).toHaveBeenCalledTimes(2);
    });
  });

  describe('view mode and CSV export', () => {
    it('stores the view mode', async () => {
      await createComponent();

      component.setViewMode('grid');

      expect(component.viewMode()).toBe('grid');
    });

    it('writes a quoted CSV without a Flags column and revokes the URL', async () => {
      mockAssetService.searchAssets.mockReturnValue(
        of({ entries: [doc('a', { 'dc:creator': 'bob' }, { title: 'Say "hi"' })] }),
      );
      await createComponent();

      const clickSpy = vi.fn();
      const createElement = vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: clickSpy,
      } as unknown as HTMLAnchorElement);

      component.exportCsv();

      const blob = createObjectURL.mock.calls.at(-1)?.[0] as Blob;
      const text = await blob.text();
      expect(text.split('\n')[0]).toBe(
        '"Title","Type","Modified","Last Contributor","State","Version","Created","Author","Nature","Coverage","Subjects"',
      );
      expect(text).toContain('"Say ""hi"""');
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:asset');

      createElement.mockRestore();
    });
  });

  describe('saved searches', () => {
    beforeEach(() => createComponent({ 'asset-type': 'Picture', ecm_fulltext: 'invoice' }));

    it('persists the current filters when saving a new search', () => {
      dialogOpen.mockReturnValue({ afterClosed: () => of('  My search  ') });
      mockSearchService.saveSavedSearch.mockReturnValue(of({ id: 's1', title: 'My search' }));

      component.openSaveAsDialog();

      expect(mockSearchService.saveSavedSearch).toHaveBeenCalledWith({
        title: 'My search',
        params: { 'asset-type': 'Picture', ecm_fulltext: 'invoice' },
        pageProviderName: 'assets_search',
      });
      expect(aggregationService.selectedSavedSearchId()).toBe('s1');
      expect(aggregationService.selectedSavedSearchTitle()).toBe('My search');
      expect(aggregationService.savedSearchVersion()).toBe(1);
    });

    it('falls back to the typed title when the response omits one', () => {
      dialogOpen.mockReturnValue({ afterClosed: () => of('Typed') });
      mockSearchService.saveSavedSearch.mockReturnValue(of({ id: 's1' }));

      component.openSaveAsDialog();

      expect(aggregationService.selectedSavedSearchTitle()).toBe('Typed');
    });

    it('tolerates a non-object save response', () => {
      dialogOpen.mockReturnValue({ afterClosed: () => of('Typed') });
      mockSearchService.saveSavedSearch.mockReturnValue(of(null));

      component.openSaveAsDialog();

      expect(aggregationService.selectedSavedSearchId()).toBe('');
      expect(aggregationService.selectedSavedSearchTitle()).toBe('Typed');
    });

    it('ignores a blank title', () => {
      dialogOpen.mockReturnValue({ afterClosed: () => of('   ') });

      component.openSaveAsDialog();

      expect(mockSearchService.saveSavedSearch).not.toHaveBeenCalled();
    });

    it('warns when saving fails', () => {
      dialogOpen.mockReturnValue({ afterClosed: () => of('My search') });
      mockSearchService.saveSavedSearch.mockReturnValue(throwError(() => new Error('nope')));

      component.openSaveAsDialog();

      expect(snackBarOpen).toHaveBeenCalledWith(
        'Failed to save search.',
        'Dismiss',
        expect.anything(),
      );
    });

    it('reports whether a saved search is selected and whether filters are savable', () => {
      expect(component.hasSelectedSavedSearch()).toBe(false);
      expect(component.hasSavableFilters()).toBe(true);

      aggregationService.selectedSavedSearchId.set('s1');
      expect(component.hasSelectedSavedSearch()).toBe(true);
    });

    it('updates the active saved search in place', () => {
      aggregationService.selectedSavedSearchId.set('s1');
      aggregationService.selectedSavedSearchTitle.set('Mine');
      mockSearchService.updateSavedSearch.mockReturnValue(of({}));

      component.onSaveSelectedSavedSearch();

      expect(mockSearchService.updateSavedSearch).toHaveBeenCalledWith('s1', {
        title: 'Mine',
        params: { 'asset-type': 'Picture', ecm_fulltext: 'invoice' },
        pageProviderName: 'assets_search',
      });
    });

    it('defaults a blank title when updating', () => {
      aggregationService.selectedSavedSearchId.set('s1');
      aggregationService.selectedSavedSearchTitle.set('  ');
      mockSearchService.updateSavedSearch.mockReturnValue(of({}));

      component.onSaveSelectedSavedSearch();

      expect(mockSearchService.updateSavedSearch).toHaveBeenCalledWith(
        's1',
        expect.objectContaining({ title: 'Saved Search' }),
      );
    });

    it('requires a selection before updating', () => {
      component.onSaveSelectedSavedSearch();

      expect(mockSearchService.updateSavedSearch).not.toHaveBeenCalled();
    });

    it('warns when updating fails', () => {
      aggregationService.selectedSavedSearchId.set('s1');
      aggregationService.selectedSavedSearchTitle.set('Mine');
      mockSearchService.updateSavedSearch.mockReturnValue(throwError(() => new Error('nope')));

      component.onSaveSelectedSavedSearch();

      expect(snackBarOpen).toHaveBeenCalledWith(
        'Failed to save search.',
        'Dismiss',
        expect.anything(),
      );
    });

    it('renames a saved search', () => {
      aggregationService.selectedSavedSearchId.set('s1');
      aggregationService.selectedSavedSearchTitle.set('Old');
      dialogOpen.mockReturnValue({ afterClosed: () => of('  New  ') });
      mockSearchService.updateSavedSearch.mockReturnValue(of({}));

      component.onEditSelectedSavedSearch();

      expect(aggregationService.selectedSavedSearchTitle()).toBe('New');
    });

    it('requires a selection before renaming', () => {
      component.onEditSelectedSavedSearch();

      expect(dialogOpen).not.toHaveBeenCalled();
    });

    it('ignores a blank rename', () => {
      aggregationService.selectedSavedSearchId.set('s1');
      dialogOpen.mockReturnValue({ afterClosed: () => of('  ') });

      component.onEditSelectedSavedSearch();

      expect(mockSearchService.updateSavedSearch).not.toHaveBeenCalled();
    });

    it('warns when renaming fails', () => {
      aggregationService.selectedSavedSearchId.set('s1');
      dialogOpen.mockReturnValue({ afterClosed: () => of('New') });
      mockSearchService.updateSavedSearch.mockReturnValue(throwError(() => new Error('nope')));

      component.onEditSelectedSavedSearch();

      expect(snackBarOpen).toHaveBeenCalledWith(
        'Failed to update search.',
        'Dismiss',
        expect.anything(),
      );
    });

    it('opens the share dialog with the selected search', () => {
      aggregationService.selectedSavedSearchId.set('s1');
      aggregationService.selectedSavedSearchTitle.set('  Mine  ');

      component.onShareSelectedSavedSearch();

      expect(dialogOpen).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ data: { title: 'Mine', id: 's1' } }),
      );
    });

    it('defaults a blank title when sharing', () => {
      aggregationService.selectedSavedSearchId.set('s1');
      aggregationService.selectedSavedSearchTitle.set('');

      component.onShareSelectedSavedSearch();

      expect(dialogOpen).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ data: { title: 'Saved Search', id: 's1' } }),
      );
    });

    it('requires a selection before sharing', () => {
      component.onShareSelectedSavedSearch();

      expect(dialogOpen).not.toHaveBeenCalled();
    });

    it('clears the filters once a delete is confirmed', () => {
      aggregationService.selectedSavedSearchId.set('s1');
      aggregationService.selectedSavedSearchTitle.set('Mine');
      dialogOpen.mockReturnValue({ afterClosed: () => of(true) });
      mockSearchService.deleteSavedSearch.mockReturnValue(of(undefined));

      component.onDeleteSelectedSavedSearch();

      expect(mockSearchService.deleteSavedSearch).toHaveBeenCalledWith('s1');
      expect(aggregationService.selectedSavedSearchId()).toBe('');
      expect(component.deletingSavedSearch()).toBe(false);
      expect(navigate).toHaveBeenCalledWith(
        ['/documents'],
        expect.objectContaining({
          queryParams: expect.objectContaining({ 'asset-type': null, ecm_fulltext: null }),
        }),
      );
    });

    it('respects a cancelled delete dialog', () => {
      aggregationService.selectedSavedSearchId.set('s1');
      dialogOpen.mockReturnValue({ afterClosed: () => of(false) });

      component.onDeleteSelectedSavedSearch();

      expect(mockSearchService.deleteSavedSearch).not.toHaveBeenCalled();
    });

    it('requires a selection before deleting', () => {
      component.onDeleteSelectedSavedSearch();

      expect(dialogOpen).not.toHaveBeenCalled();
    });

    it('is a no-op while a delete is already in flight', () => {
      aggregationService.selectedSavedSearchId.set('s1');
      component.deletingSavedSearch.set(true);

      component.onDeleteSelectedSavedSearch();

      expect(dialogOpen).not.toHaveBeenCalled();
    });

    it('logs and resets the flag when deleting fails', () => {
      aggregationService.selectedSavedSearchId.set('s1');
      dialogOpen.mockReturnValue({ afterClosed: () => of(true) });
      mockSearchService.deleteSavedSearch.mockReturnValue(throwError(() => new Error('nope')));
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      component.onDeleteSelectedSavedSearch();

      expect(consoleError).toHaveBeenCalled();
      expect(component.deletingSavedSearch()).toBe(false);
      expect(aggregationService.selectedSavedSearchId()).toBe('s1');

      consoleError.mockRestore();
    });
  });

  describe('navigation', () => {
    it('routes to the document detail page', async () => {
      await createComponent();

      component.openAsset({ id: 'a' } as AssetResult);

      expect(navigate).toHaveBeenCalledWith(['/doc', 'a']);
    });
  });
});
