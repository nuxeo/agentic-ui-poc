import { Component, effect, inject, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AssetAggregationService } from '@agentic-ui/shared/nuxeo-client';
import type { AssetAggregations } from '@agentic-ui/shared/nuxeo-client';

export interface FilterOption {
  label: string;
  value: string;
  selected: boolean;
  aggKey?: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

const TYPE_BUCKET_MAP: Record<string, { label: string; value: string }> = {
  Picture:   { label: 'Image',     value: 'picture' },
  Video:     { label: 'Video',     value: 'video' },
  Audio:     { label: 'Audio',     value: 'audio' },
  File:      { label: 'Document',  value: 'file' },
  Note:      { label: 'Note',      value: 'note' },
  Folder:    { label: 'Folder',    value: 'folder' },
  Workspace: { label: 'Workspace', value: 'workspace' },
};

const FORMAT_BUCKET_MAP: Record<string, { label: string; value: string }> = {
  'image/jpeg':       { label: 'JPEG', value: 'jpeg' },
  'image/png':        { label: 'PNG',  value: 'png' },
  'image/gif':        { label: 'GIF',  value: 'gif' },
  'image/tiff':       { label: 'TIFF', value: 'tiff' },
  'image/svg+xml':    { label: 'SVG',  value: 'svg' },
  'video/mp4':        { label: 'MP4',  value: 'mp4' },
  'video/quicktime':  { label: 'MOV',  value: 'mov' },
  'audio/mpeg':       { label: 'MP3',  value: 'mp3' },
  'application/pdf':  { label: 'PDF',  value: 'pdf' },
  'application/zip':  { label: 'ZIP',  value: 'zip' },
};

const DYNAMIC_GROUPS = new Set(['asset-type', 'asset-format', 'color-profile', 'color-depth']);

const COLOR_PROFILE_BUCKET_MAP: Record<string, { label: string; value: string }> = {};

const COLOR_DEPTH_BUCKET_MAP: Record<string, { label: string; value: string }> = {
  '8':  { label: '8-bit',  value: '8bit' },
  '10': { label: '10-bit', value: '10bit' },
  '12': { label: '12-bit', value: '12bit' },
  '16': { label: '16-bit', value: '16bit' },
  '32': { label: '32-bit', value: '32bit' },
};

const VIDEO_DURATION_BUCKET_MAP: Record<string, { label: string; value: string }> = {
  'to_30_s':            { label: 'Less than 30 s',           value: 'to_30_s' },
  'from_30_to_180_s':   { label: 'Between 30 s and 180 s',   value: 'from_30_to_180_s' },
  'from_180_to_600_s':  { label: 'Between 180 s and 600 s',  value: 'from_180_to_600_s' },
  'from_600_to_1800_s': { label: 'Between 600 s and 1800 s', value: 'from_600_to_1800_s' },
  'from_1800_s':        { label: 'More than 1800 s',         value: 'from_1800_s' },
};

@Component({
  selector: 'app-assets-drawer',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatCheckboxModule, MatDividerModule, MatListModule, MatSlideToggleModule],
  templateUrl: './assets-drawer.component.html',
  styleUrl: './assets-drawer.component.scss',
})
export class AssetsDrawerComponent {
  private readonly aggregationService = inject(AssetAggregationService);

  readonly itemSelected = output<string>();
  readonly applyFilters = output<string>();
  readonly dynamicGroups = DYNAMIC_GROUPS;

  private readonly GROUP_AGG_KEY: Record<string, keyof AssetAggregations> = {
    'asset-type':     'system_primaryType_agg',
    'asset-format':   'system_mimetype_agg',
    'asset-width':    'asset_width_agg',
    'asset-height':   'asset_height_agg',
    'color-profile':  'color_profile_agg',
    'color-depth':    'color_depth_agg',
    'video-duration': 'video_duration_agg',
  };

  private readonly ALWAYS_SHOW_ZERO = new Set(['asset-width', 'asset-height', 'video-duration']);

  getCountText(groupId: string, aggKey?: string): string {
    if (!aggKey) return '';
    const aggField = this.GROUP_AGG_KEY[groupId];
    if (!aggField) return '';
    const agg = this.aggregationService.aggregations()[aggField];
    if (!agg) return this.ALWAYS_SHOW_ZERO.has(groupId) ? ' (0)' : '';
    const bucket = agg.buckets.find(b => b.key === aggKey);
    const count = bucket?.docCount ?? (this.ALWAYS_SHOW_ZERO.has(groupId) ? 0 : null);
    return count !== null ? ` (${count})` : '';
  }

  readonly expandedFilters = signal<Set<string>>(new Set());

  readonly filterGroups = signal<FilterGroup[]>([
    { id: 'asset-type',   label: 'Asset Type',              options: [] },
    { id: 'asset-format', label: 'Asset Format',            options: [] },
    {
      id: 'asset-width', label: 'Asset Width',
      options: [
        { label: 'Less than 500 px',            value: 'to_500_px',            selected: false, aggKey: 'to_500_px' },
        { label: 'Between 500 px and 1000 px',  value: 'from_500_to_1000_px',  selected: false, aggKey: 'from_500_to_1000_px' },
        { label: 'Between 1500 px and 2000 px', value: 'from_1500_to_2000_px', selected: false, aggKey: 'from_1500_to_2000_px' },
        { label: 'More than 2000 px',           value: 'from_2000_px',         selected: false, aggKey: 'from_2000_px' },
      ],
    },
    {
      id: 'asset-height', label: 'Asset Height',
      options: [
        { label: 'Less than 500 px',            value: 'to_500_px',            selected: false, aggKey: 'to_500_px' },
        { label: 'Between 500 px and 1000 px',  value: 'from_500_to_1000_px',  selected: false, aggKey: 'from_500_to_1000_px' },
        { label: 'Between 1500 px and 2000 px', value: 'from_1500_to_2000_px', selected: false, aggKey: 'from_1500_to_2000_px' },
        { label: 'More than 2000 px',           value: 'from_2000_px',         selected: false, aggKey: 'from_2000_px' },
      ],
    },
    { id: 'color-profile', label: 'Color Profile',          options: [] },
    { id: 'color-depth',   label: 'Color Depth per Channel', options: [] },
    {
      id: 'video-duration', label: 'Video Duration',
      options: [
        { label: 'Less than 30 s',           value: 'to_30_s',            selected: false, aggKey: 'to_30_s' },
        { label: 'Between 30 s and 180 s',   value: 'from_30_to_180_s',   selected: false, aggKey: 'from_30_to_180_s' },
        { label: 'Between 180 s and 600 s',  value: 'from_180_to_600_s',  selected: false, aggKey: 'from_180_to_600_s' },
        { label: 'Between 600 s and 1800 s', value: 'from_600_to_1800_s', selected: false, aggKey: 'from_600_to_1800_s' },
        { label: 'More than 1800 s',         value: 'from_1800_s',        selected: false, aggKey: 'from_1800_s' },
      ],
    },
  ]);

  readonly autoSearch = signal(true);

  constructor() {
    effect(() => {
      const aggs = this.aggregationService.aggregations();
      this.filterGroups.update(groups =>
        groups.map(g => {
          if (!DYNAMIC_GROUPS.has(g.id)) return g;

          const aggField = this.GROUP_AGG_KEY[g.id];
          const buckets = aggs[aggField]?.buckets ?? [];
          const currentSelected = new Set(g.options.filter(o => o.selected).map(o => o.value));
          const bucketMap =
            g.id === 'asset-type'    ? TYPE_BUCKET_MAP :
            g.id === 'asset-format'  ? FORMAT_BUCKET_MAP :
            g.id === 'color-profile' ? COLOR_PROFILE_BUCKET_MAP :
                                       COLOR_DEPTH_BUCKET_MAP;

          const options: FilterOption[] = buckets.map(b => {
            const mapped = bucketMap[b.key];
            const label = mapped?.label ?? b.key;
            const value = mapped?.value ?? b.key.toLowerCase().replace(/[^a-z0-9]/g, '-');
            return { label, value, selected: currentSelected.has(value), aggKey: b.key };
          });

          return { ...g, options };
        })
      );
    });
  }

  isExpanded(id: string): boolean {
    return this.expandedFilters().has(id);
  }

  toggleFilter(id: string): void {
    this.expandedFilters.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  resetFilters(): void {
    this.filterGroups.update((groups) =>
      groups.map((g) => ({ ...g, options: g.options.map((o) => ({ ...o, selected: false })) })),
    );
    if (this.autoSearch()) {
      this.applyFilters.emit('/documents');
    }
  }

  applySearch(): void {
    this.applyFilters.emit(this.buildFilterUrl());
  }

  buildFilterUrl(): string {
    const params = new URLSearchParams();
    for (const group of this.filterGroups()) {
      if (group.id === 'asset-type') continue;
      const selected = group.options.filter((o) => o.selected).map((o) => o.value);
      if (selected.length > 0) {
        params.set(group.id, selected.join(','));
      }
    }
    const qs = params.toString();
    return qs ? `/documents?${qs}` : '/documents';
  }

  toggleOption(groupId: string, value: string): void {
    this.filterGroups.update((groups) =>
      groups.map((g) =>
        g.id === groupId
          ? { ...g, options: g.options.map((o) => o.value === value ? { ...o, selected: !o.selected } : o) }
          : g,
      ),
    );
    if (this.autoSearch()) {
      this.applyFilters.emit(this.buildFilterUrl());
    }
  }
}
