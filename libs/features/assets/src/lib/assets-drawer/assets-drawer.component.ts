import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
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

const DYNAMIC_GROUPS = new Set(['asset-type', 'asset-format', 'color-profile', 'color-depth']);

function toMimeType(value: string): string {
  if (value.includes('/')) return value;

  const normalized = value.toLowerCase();
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    tiff: 'image/tiff',
    tif: 'image/tiff',
    svg: 'image/svg+xml',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    mp3: 'audio/mpeg',
    pdf: 'application/pdf',
    zip: 'application/zip',
  };

  return map[normalized] ?? value;
}

@Component({
  selector: 'lib-assets-drawer',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatCheckboxModule, MatDividerModule, MatSlideToggleModule],
  templateUrl: './assets-drawer.component.html',
  styleUrl: './assets-drawer.component.scss',
})
export class AssetsDrawerComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly aggregationService = inject(AssetAggregationService);
  private readonly queryParams = toSignal(this.route.queryParamMap, { requireSync: true });

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
        { label: 'Between 500 px and 1500 px',  value: 'from_500_to_1500_px',  selected: false, aggKey: 'from_500_to_1500_px' },
        { label: 'Between 1500 px and 2000 px', value: 'from_1500_to_2000_px', selected: false, aggKey: 'from_1500_to_2000_px' },
        { label: 'More than 2000 px',           value: 'from_2000_px',         selected: false, aggKey: 'from_2000_px' },
      ],
    },
    {
      id: 'asset-height', label: 'Asset Height',
      options: [
        { label: 'Less than 500 px',            value: 'to_500_px',            selected: false, aggKey: 'to_500_px' },
        { label: 'Between 500 px and 1500 px',  value: 'from_500_to_1500_px',  selected: false, aggKey: 'from_500_to_1500_px' },
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
    this.expandedFilters.set(new Set(['asset-type']));

    effect(() => {
      const params = this.queryParams();
      const getSelected = (id: string) => new Set(params.get(id)?.split(',').filter(Boolean) ?? []);
      const aggs = this.aggregationService.aggregations();
      this.filterGroups.update(groups =>
        groups.map(g => {
          const selectedFromUrl = getSelected(g.id);

          if (!DYNAMIC_GROUPS.has(g.id)) {
            return {
              ...g,
              options: g.options.map(o => ({
                ...o,
                selected: selectedFromUrl.has(o.value),
              })),
            };
          }

          const aggField = this.GROUP_AGG_KEY[g.id];
          const buckets = aggs[aggField]?.buckets ?? [];

          const options: FilterOption[] = buckets.map(b => {
            const label = g.id === 'asset-format' ? toMimeType(b.key) : b.key;
            const value = g.id === 'asset-format' ? toMimeType(b.key) : b.key;
            return { label, value, selected: selectedFromUrl.has(value), aggKey: b.key };
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
      void this.router.navigate(['/documents']);
    }
  }

  applySearch(): void {
    void this.router.navigate(['/documents'], {
      queryParams: this.buildFilterQueryParams(),
    });
  }

  private buildFilterQueryParams(): Record<string, string> {
    const queryParams: Record<string, string> = {};
    for (const group of this.filterGroups()) {
      const selected = group.options.filter((o) => o.selected).map((o) => o.value);
      if (selected.length > 0) {
        queryParams[group.id] = selected.join(',');
      }
    }
    return queryParams;
  }

  buildFilterUrl(): string {
    const params = new URLSearchParams();
    for (const group of this.filterGroups()) {
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
      void this.router.navigate(['/documents'], {
        queryParams: this.buildFilterQueryParams(),
      });
    }
  }
}
