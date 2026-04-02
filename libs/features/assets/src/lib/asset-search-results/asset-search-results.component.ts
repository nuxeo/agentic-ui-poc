import { Component, computed, inject, signal, DestroyRef } from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { switchMap, map, catchError, of, tap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AssetService, AssetAggregationService, SelectionService, docTypeIcon, type NuxeoDocument, type AssetAggregations } from '@agentic-ui/shared/nuxeo-client';

export type SortDirection = 'asc' | 'desc' | null;
export type ViewMode = 'grid' | 'list';

export interface ColumnDef {
  key: string;
  label: string;
  width: string;
}

const ALL_COLUMNS: ColumnDef[] = [
  { key: 'name',        label: 'Title',            width: '280px' },
  { key: 'type',        label: 'Type',             width: '120px' },
  { key: 'modified',    label: 'Modified',         width: '140px' },
  { key: 'contributor', label: 'Last contributor', width: '180px' },
  { key: 'state',       label: 'State',            width: '120px' },
  { key: 'version',     label: 'Version',          width: '100px' },
  { key: 'created',     label: 'Created',          width: '140px' },
  { key: 'author',      label: 'Author',           width: '150px' },
  { key: 'nature',      label: 'Nature',           width: '140px' },
  { key: 'coverage',    label: 'Coverage',         width: '140px' },
  { key: 'subjects',    label: 'Subjects',         width: '200px' },
  { key: 'flags',       label: 'Flags',            width: '120px' },
];

export interface AssetResult {
  id: string;
  name: string;
  type: string;
  format: string;
  mimeType: string;
  modifiedDate: string;
  lastContributor: string;
  icon: string;
  widthPx?: number;
  heightPx?: number;
  videoDurationSec?: number;
  state?: string;
  version?: string;
  createdDate?: string;
  author?: string;
  nature?: string;
  coverage?: string;
  subjects?: string;
  flags?: string;
}

function buildApiParams(params: ParamMap) {
  const get = (key: string) => params.get(key)?.split(',').filter(Boolean) ?? [];

  // Get primaryTypes from asset-type param - values are now the actual types (Picture, File, etc.)
  const primaryTypeValues = get('asset-type');

  // Get mimeTypes from asset-format param - values are now the full MIME types
  const mimeTypeValues = get('asset-format');

  return {
    primaryTypes: primaryTypeValues,
    mimeTypes: mimeTypeValues,
    widths: get('asset-width'),
    heights: get('asset-height'),
    colorProfiles: get('color-profile'),
    colorDepths: get('color-depth'),
    videoDurations: get('video-duration'),
  };
}

function mapToAssetResult(doc: NuxeoDocument): AssetResult {
  const props = doc.properties;
  const fileContent = props['file:content'] as { 'mime-type'?: string } | null;
  const mime = fileContent?.['mime-type'] ?? '';
  const format = mime.split('/')[1]?.split('+')[0] ?? '';
  const widthPx = Number((props['imd:pixel_xdimension'] as number | string | undefined) ?? NaN);
  const heightPx = Number((props['imd:pixel_ydimension'] as number | string | undefined) ?? NaN);
  const vidInfo = props['vid:info'] as { duration?: number; width?: number; height?: number } | undefined;
  const videoDurationSec = Number((vidInfo?.duration as number | string | undefined) ?? NaN);
  return {
    id: doc.uid,
    name: doc.title,
    type: doc.type,
    format,
    mimeType: mime,
    modifiedDate: doc.lastModified?.slice(0, 10) ?? '',
    lastContributor: (props['dc:lastContributor'] as string) ?? '',
    icon: docTypeIcon(doc.type),
    widthPx: Number.isFinite(widthPx) ? widthPx : (Number.isFinite(Number(vidInfo?.width)) ? Number(vidInfo?.width) : undefined),
    heightPx: Number.isFinite(heightPx) ? heightPx : (Number.isFinite(Number(vidInfo?.height)) ? Number(vidInfo?.height) : undefined),
    videoDurationSec: Number.isFinite(videoDurationSec) ? videoDurationSec : undefined,
    createdDate: ((props['dc:created'] as string) ?? '').slice(0, 10) || undefined,
    author: (props['dc:creator'] as string) ?? undefined,
    nature: (props['dc:nature'] as string) ?? undefined,
    coverage: (props['dc:coverage'] as string) ?? undefined,
    subjects: ((props['dc:subjects'] as string[]) ?? []).join(', ') || undefined,
  };
}

const DIMENSION_BUCKET_KEYS = [
  'to_500_px',
  'from_500_to_1500_px',
  'from_1500_to_2000_px',
  'from_2000_px',
] as const;

function mergeComputedAggregations(
  documents: NuxeoDocument[],
  mappedAssets: AssetResult[],
  apiAggregations: AssetAggregations | undefined,
): AssetAggregations {
  const aggregations: AssetAggregations = { ...(apiAggregations ?? {}) };

  // Fallback for dynamic groups when API aggregations are missing.
  if (!aggregations.system_primaryType_agg) {
    const typeMap = new Map<string, number>();
    documents.forEach((doc) => {
      typeMap.set(doc.type, (typeMap.get(doc.type) ?? 0) + 1);
    });
    aggregations.system_primaryType_agg = {
      buckets: Array.from(typeMap).map(([key, count]) => ({ key, docCount: count })),
    };
  }

  if (!aggregations.system_mimetype_agg) {
    const mimeMap = new Map<string, number>();
    documents.forEach((doc) => {
      const props = doc.properties;
      const fileContent = props['file:content'] as { 'mime-type'?: string } | null;
      const mime = fileContent?.['mime-type'];
      if (mime) {
        mimeMap.set(mime, (mimeMap.get(mime) ?? 0) + 1);
      }
    });
    aggregations.system_mimetype_agg = {
      buckets: Array.from(mimeMap).map(([key, count]) => ({ key, docCount: count })),
    };
  }

  // Always compute width/height buckets from returned assets so filter counts
  // reflect the current result set.
  const widthCounts = new Map<string, number>(DIMENSION_BUCKET_KEYS.map((key) => [key, 0]));
  const heightCounts = new Map<string, number>(DIMENSION_BUCKET_KEYS.map((key) => [key, 0]));

  mappedAssets.forEach((asset) => {
    const widthBucket = DIMENSION_BUCKET_KEYS.find((bucket) => inWidthBucket(asset.widthPx, bucket));
    if (widthBucket) {
      widthCounts.set(widthBucket, (widthCounts.get(widthBucket) ?? 0) + 1);
    }

    const heightBucket = DIMENSION_BUCKET_KEYS.find((bucket) => inHeightBucket(asset.heightPx, bucket));
    if (heightBucket) {
      heightCounts.set(heightBucket, (heightCounts.get(heightBucket) ?? 0) + 1);
    }
  });

  aggregations.asset_width_agg = {
    buckets: DIMENSION_BUCKET_KEYS.map((key) => ({ key, docCount: widthCounts.get(key) ?? 0 })),
  };

  aggregations.asset_height_agg = {
    buckets: DIMENSION_BUCKET_KEYS.map((key) => ({ key, docCount: heightCounts.get(key) ?? 0 })),
  };

  return aggregations;
}

function inWidthBucket(width: number | undefined, bucket: string): boolean {
  if (width === undefined) return false;
  switch (bucket) {
    case 'to_500_px': return width < 500;
    case 'from_500_to_1500_px': return width >= 500 && width <= 1500;
    case 'from_1500_to_2000_px': return width >= 1500 && width <= 2000;
    case 'from_2000_px': return width > 2000;
    default: return false;
  }
}

function inHeightBucket(height: number | undefined, bucket: string): boolean {
  if (height === undefined) return false;
  switch (bucket) {
    case 'to_500_px': return height < 500;
    case 'from_500_to_1500_px': return height >= 500 && height <= 1500;
    case 'from_1500_to_2000_px': return height >= 1500 && height <= 2000;
    case 'from_2000_px': return height > 2000;
    default: return false;
  }
}

function inVideoDurationBucket(durationSec: number | undefined, bucket: string): boolean {
  if (durationSec === undefined) return false;
  switch (bucket) {
    case 'to_30_s': return durationSec < 30;
    case 'from_30_to_180_s': return durationSec >= 30 && durationSec <= 180;
    case 'from_180_to_600_s': return durationSec > 180 && durationSec <= 600;
    case 'from_600_to_1800_s': return durationSec > 600 && durationSec <= 1800;
    case 'from_1800_s': return durationSec > 1800;
    default: return false;
  }
}

@Component({
  selector: 'lib-asset-search-results',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatCheckboxModule, MatProgressSpinnerModule],
  templateUrl: './asset-search-results.component.html',
  styleUrl: './asset-search-results.component.scss',
})
export class AssetSearchResultsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly assetService = inject(AssetService);
  private readonly aggregationService = inject(AssetAggregationService);
  readonly selectionService = inject(SelectionService);
  private readonly queryParams = toSignal(this.route.queryParamMap, { requireSync: true });

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private readonly assets$ = this.route.queryParamMap.pipe(
    tap(() => { this.loading.set(true); this.error.set(null); }),
    switchMap(params =>
      this.assetService.searchAssets(buildApiParams(params)).pipe(
        map(result => {
          const mapped = result.entries.map(mapToAssetResult);
          const aggs = mergeComputedAggregations(result.entries, mapped, result.aggregations);
          this.aggregationService.aggregations.set(aggs);
          return mapped;
        }),
        catchError(() => {
          this.error.set('Failed to load assets.');
          return of<AssetResult[]>([]);
        }),
        tap(() => this.loading.set(false)),
      )
    ),
  );

  readonly assets = toSignal(this.assets$, { initialValue: [] as AssetResult[] });

  readonly viewMode = signal<ViewMode>('list');
  readonly allColumns = ALL_COLUMNS;
  readonly visibleColumnKeys = signal<string[]>(['name', 'modified', 'contributor']);
  readonly sortColumn = signal<string | null>(null);
  readonly sortDirection = signal<SortDirection>(null);

  readonly visibleColumns = computed(() =>
    ALL_COLUMNS.filter(c => this.visibleColumnKeys().includes(c.key))
  );

  readonly gridTemplate = computed(() =>
    [
      '40px',
      ...this.visibleColumns().map((c) => `minmax(${c.width}, 1fr)`),
      '40px',
    ].join(' ')
  );

  openAsset(asset: AssetResult): void {
    void this.router.navigate(['/doc', asset.id]);
  }

  getCellValue(asset: AssetResult, key: string): string {
    switch (key) {
      case 'type':        return asset.type;
      case 'modified':    return asset.modifiedDate;
      case 'contributor': return asset.lastContributor;
      case 'state':       return asset.state ?? '—';
      case 'version':     return asset.version ?? '—';
      case 'created':     return asset.createdDate ?? '—';
      case 'author':      return asset.author ?? '—';
      case 'nature':      return asset.nature ?? '—';
      case 'coverage':    return asset.coverage ?? '—';
      case 'subjects':    return asset.subjects ?? '—';
      case 'flags':       return asset.flags ?? '—';
      default:            return '';
    }
  }

  isAssetSelected(id: string): boolean {
    return this.selectionService.isSelected(id);
  }

  toggleAssetSelection(id: string): void {
    this.selectionService.toggle(id);
  }

  toggleAll(): void {
    if (this.isAllSelected()) {
      this.selectionService.clear();
    } else {
      this.selectionService.selectAll(this.filteredAssets().map(a => a.id));
    }
  }

  deleteSelected(): void {
    this.selectionService.deleteSelected()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate([], { relativeTo: this.route, queryParamsHandling: 'merge' }),
      });
  }

  clearSelection(): void {
    this.selectionService.clear();
  }

  readonly columnPanelOpen = signal(false);
  readonly pendingColumnKeys = signal<string[]>(['name', 'modified', 'contributor']);
  readonly columnsForPanel = ALL_COLUMNS;

  isPendingColumn(key: string): boolean {
    return this.pendingColumnKeys().includes(key);
  }

  togglePendingColumn(key: string): void {
    const current = this.pendingColumnKeys();
    if (current.includes(key)) {
      this.pendingColumnKeys.set(current.filter(k => k !== key));
    } else {
      const ordered = ALL_COLUMNS.map(c => c.key);
      this.pendingColumnKeys.set(ordered.filter(k => [...current, key].includes(k)));
    }
  }

  openColumnPanel(): void {
    this.pendingColumnKeys.set(this.visibleColumnKeys());
    this.columnPanelOpen.set(true);
  }

  closeColumnPanel(): void {
    this.columnPanelOpen.set(false);
  }

  resetColumns(): void {
    this.pendingColumnKeys.set(['name', 'modified', 'contributor']);
  }

  applyColumns(): void {
    this.visibleColumnKeys.set(
      ALL_COLUMNS.map(c => c.key).filter(k => this.pendingColumnKeys().includes(k))
    );
    this.columnPanelOpen.set(false);
  }

  readonly filteredAssets = computed(() => {
    const params = this.queryParams();
    const getSelected = (key: string) => new Set(params.get(key)?.split(',').filter(Boolean) ?? []);

    const selectedTypes = getSelected('asset-type');
    const selectedFormats = getSelected('asset-format');
    const selectedWidths = getSelected('asset-width');
    const selectedHeights = getSelected('asset-height');
    const selectedVideoDurations = getSelected('video-duration');

    return this.assets().filter(asset => {
      if (selectedTypes.size > 0 && !selectedTypes.has(asset.type)) {
        return false;
      }

      if (selectedFormats.size > 0 && !selectedFormats.has(asset.mimeType)) {
        return false;
      }

      if (selectedWidths.size > 0 && !Array.from(selectedWidths).some(bucket => inWidthBucket(asset.widthPx, bucket))) {
        return false;
      }

      if (selectedHeights.size > 0 && !Array.from(selectedHeights).some(bucket => inHeightBucket(asset.heightPx, bucket))) {
        return false;
      }

      if (selectedVideoDurations.size > 0 && !Array.from(selectedVideoDurations).some(bucket => inVideoDurationBucket(asset.videoDurationSec, bucket))) {
        return false;
      }

      return true;
    });
  });

  readonly sortedAssets = computed(() => {
    const assets = [...this.filteredAssets()];
    const col = this.sortColumn();
    const dir = this.sortDirection();
    if (!col || !dir) return assets;
    return assets.sort((a, b) => {
      let aVal = '';
      let bVal = '';
      switch (col) {
        case 'name':        aVal = a.name;            bVal = b.name;            break;
        case 'modified':    aVal = a.modifiedDate;    bVal = b.modifiedDate;    break;
        case 'contributor': aVal = a.lastContributor; bVal = b.lastContributor; break;
      }
      return dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  });

  readonly SORTABLE_COLUMNS = new Set(['name', 'modified', 'contributor']);

  sortBy(col: string): void {
    if (!this.SORTABLE_COLUMNS.has(col)) return;
    if (this.sortColumn() === col) {
      if (this.sortDirection() === 'asc') this.sortDirection.set('desc');
      else if (this.sortDirection() === 'desc') { this.sortColumn.set(null); this.sortDirection.set(null); }
    } else {
      this.sortColumn.set(col);
      this.sortDirection.set('asc');
    }
  }

  readonly resultCount = computed(() => this.filteredAssets().length);
  readonly selectedCount = computed(() => this.selectionService.selectedCount());

  readonly isAllSelected = computed(() => {
    const assets = this.filteredAssets();
    return this.selectionService.isAllSelected(assets.map(a => a.id));
  });

  readonly isIndeterminate = computed(() => {
    const assets = this.filteredAssets();
    return this.selectionService.isIndeterminate(assets.map(a => a.id));
  });

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  exportCsv(): void {
    const headers = ['Title', 'Type', 'Modified', 'Last Contributor', 'State', 'Version', 'Created', 'Author', 'Nature', 'Coverage', 'Subjects', 'Flags'];
    const escape = (value: string): string => `"${value.replaceAll('"', '""')}"`;
    const rows = this.filteredAssets().map((a) => [
      a.name, a.type, a.modifiedDate, a.lastContributor,
      a.state ?? '', a.version ?? '', a.createdDate ?? '',
      a.author ?? '', a.nature ?? '', a.coverage ?? '',
      a.subjects ?? '', a.flags ?? '',
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => escape(cell ?? '')).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'assets.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
