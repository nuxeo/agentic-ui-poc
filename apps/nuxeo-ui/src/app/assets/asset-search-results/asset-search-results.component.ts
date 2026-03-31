import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap, map, catchError, of, tap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AssetService, AssetAggregationService } from '@agentic-ui/shared/nuxeo-client';
import type { NuxeoDocument, AssetSearchResult } from '@agentic-ui/shared/nuxeo-client';

export type SortDirection = 'asc' | 'desc' | null;
export type ViewMode = 'grid' | 'list';

export interface ColumnDef {
  key: string;
  label: string;
  width: string;
}

const ALL_COLUMNS: ColumnDef[] = [
  { key: 'name',        label: 'Title',            width: '2fr' },
  { key: 'type',        label: 'Type',             width: '1fr' },
  { key: 'modified',    label: 'Modified',         width: '1fr' },
  { key: 'contributor', label: 'Last contributor', width: '1.2fr' },
  { key: 'state',       label: 'State',            width: '1fr' },
  { key: 'version',     label: 'Version',          width: '0.8fr' },
  { key: 'created',     label: 'Created',          width: '1fr' },
  { key: 'author',      label: 'Author',           width: '1fr' },
  { key: 'nature',      label: 'Nature',           width: '1fr' },
  { key: 'coverage',    label: 'Coverage',         width: '1fr' },
  { key: 'subjects',    label: 'Subjects',         width: '1fr' },
  { key: 'flags',       label: 'Flags',            width: '1fr' },
];

export interface AssetResult {
  id: string;
  name: string;
  type: string;
  format: string;
  modifiedDate: string;
  lastContributor: string;
  icon: string;
  state?: string;
  version?: string;
  createdDate?: string;
  author?: string;
  nature?: string;
  coverage?: string;
  subjects?: string;
  flags?: string;
}

const MIME_TYPE_MAP: Record<string, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  tiff: 'image/tiff',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  pdf: 'application/pdf',
  svg: 'image/svg+xml',
  mp3: 'audio/mpeg',
  zip: 'application/zip',
};

const DOC_TYPE_ICON_MAP: Record<string, string> = {
  Picture: 'image',
  Video: 'videocam',
  Audio: 'audiotrack',
  File: 'description',
  Note: 'sticky_note_2',
  Folder: 'folder',
  Workspace: 'workspaces',
};

function buildApiParams(params: ParamMap) {
  const get = (key: string) => params.get(key)?.split(',').filter(Boolean) ?? [];
  return {
    primaryTypes: [],
    mimeTypes: get('asset-format').map(f => MIME_TYPE_MAP[f] ?? f),
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
  return {
    id: doc.uid,
    name: doc.title,
    type: doc.type,
    format,
    modifiedDate: doc.lastModified?.slice(0, 10) ?? '',
    lastContributor: (props['dc:lastContributor'] as string) ?? '',
    icon: DOC_TYPE_ICON_MAP[doc.type] ?? 'description',
    createdDate: ((props['dc:created'] as string) ?? '').slice(0, 10) || undefined,
    author: (props['dc:creator'] as string) ?? undefined,
    nature: (props['dc:nature'] as string) ?? undefined,
    coverage: (props['dc:coverage'] as string) ?? undefined,
    subjects: ((props['dc:subjects'] as string[]) ?? []).join(', ') || undefined,
  };
}

@Component({
  selector: 'app-asset-search-results',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatCheckboxModule, MatProgressSpinnerModule],
  templateUrl: './asset-search-results.component.html',
  styleUrl: './asset-search-results.component.scss',
})
export class AssetSearchResultsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly assetService = inject(AssetService);
  private readonly aggregationService = inject(AssetAggregationService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private readonly assets$ = this.route.queryParamMap.pipe(
    tap(() => { this.loading.set(true); this.error.set(null); }),
    switchMap(params =>
      this.assetService.searchAssets(buildApiParams(params)).pipe(
        tap((result: AssetSearchResult) => this.aggregationService.aggregations.set(result.aggregations ?? {})),
        map(result => result.entries.map(mapToAssetResult)),
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
    ['40px', ...this.visibleColumns().map(c => c.width), '40px'].join(' ')
  );

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

  readonly selectedAssetIds = signal<Set<string>>(new Set());

  isAssetSelected(id: string): boolean {
    return this.selectedAssetIds().has(id);
  }

  toggleAssetSelection(id: string): void {
    const current = new Set(this.selectedAssetIds());
    if (current.has(id)) current.delete(id);
    else current.add(id);
    this.selectedAssetIds.set(current);
  }

  toggleAll(): void {
    if (this.isAllSelected()) {
      this.selectedAssetIds.set(new Set());
    } else {
      this.selectedAssetIds.set(new Set(this.filteredAssets().map(a => a.id)));
    }
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

  readonly filteredAssets = computed(() => this.assets());

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

  readonly isAllSelected = computed(() => {
    const assets = this.filteredAssets();
    return assets.length > 0 && assets.every(a => this.selectedAssetIds().has(a.id));
  });

  readonly isIndeterminate = computed(() => {
    const assets = this.filteredAssets();
    return assets.some(a => this.selectedAssetIds().has(a.id)) && !this.isAllSelected();
  });

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  exportCsv(): void {
    const headers = ['Title', 'Type', 'Modified', 'Last Contributor', 'State', 'Version', 'Created', 'Author', 'Nature', 'Coverage', 'Subjects', 'Flags'];
    const rows = this.filteredAssets().map((a) => [
      a.name, a.type, a.modifiedDate, a.lastContributor,
      a.state ?? '', a.version ?? '', a.createdDate ?? '',
      a.author ?? '', a.nature ?? '', a.coverage ?? '',
      a.subjects ?? '', a.flags ?? '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'assets.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
