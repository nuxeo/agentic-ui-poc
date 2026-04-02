import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { SearchAggregationService, SearchService } from '@agentic-ui/shared/nuxeo-client';
import type { AggregateResult } from '@agentic-ui/shared/nuxeo-client';
import type { SearchResultItem } from '@agentic-ui/shared/nuxeo-client';

interface CountOption {
  key: string;
  label: string;
  value: string;
  count: number;
}

@Component({
  selector: 'lib-search-filters-drawer',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatCheckboxModule, MatDividerModule],
  templateUrl: './search-filters-drawer.component.html',
  styleUrl: './search-filters-drawer.component.scss',
})
export class SearchFiltersDrawerComponent {
  private readonly searchAggregationService = inject(SearchAggregationService);
  private readonly searchService = inject(SearchService);
  private readonly router = inject(Router);

  readonly query = signal('');
  readonly expandedFilters = signal<Set<string>>(new Set(['modification-date']));

  readonly modificationDateOptions = signal<CountOption[]>([]);
  readonly selectedModificationDates = signal<Set<string>>(new Set());

  readonly natureOptions = signal<CountOption[]>([]);
  readonly selectedNatures = signal<Set<string>>(new Set());

  readonly subjectsOptions = signal<CountOption[]>([]);
  readonly selectedSubjects = signal<Set<string>>(new Set());

  readonly coverageOptions = signal<CountOption[]>([]);
  readonly selectedCoverage = signal<Set<string>>(new Set());

  readonly sizeOptions = signal<CountOption[]>([]);
  readonly selectedSizes = signal<Set<string>>(new Set());

  readonly availableAuthors = signal<CountOption[]>([]);
  readonly selectedAuthor = signal('');
  readonly authorInput = signal('');
  readonly authorOpen = signal(false);

  readonly availableCollections = signal<CountOption[]>([]);
  readonly selectedCollection = signal('');
  readonly collectionInput = signal('');
  readonly collectionOpen = signal(false);
  readonly collectionsLoading = signal(false);
  readonly collectionsLoaded = signal(false);

  readonly availableTags = signal<CountOption[]>([]);
  readonly selectedTag = signal('');
  readonly tagInput = signal('');
  readonly tagOpen = signal(false);

  readonly hasActiveFilters = computed(() =>
    this.query().trim().length > 0 ||
    this.selectedModificationDates().size > 0 ||
    this.selectedNatures().size > 0 ||
    this.selectedSubjects().size > 0 ||
    this.selectedCoverage().size > 0 ||
    this.selectedSizes().size > 0 ||
    this.selectedAuthor().trim().length > 0 ||
    this.selectedCollection().trim().length > 0 ||
    this.selectedTag().trim().length > 0,
  );

  constructor() {
    effect(() => {
      const aggregations = this.searchAggregationService.aggregations();
      const items = this.searchAggregationService.items();

      this.modificationDateOptions.set(this.toModifiedDateOptionsFromResults(items));
      this.availableAuthors.set(this.toAuthorOptionsFromResults(items));
      if (!this.collectionsLoaded()) {
        this.availableCollections.set(this.toCountOptions(this.pickAggregation(aggregations.collection_agg, aggregations.dc_coverage_agg), {}));
      }
      this.availableTags.set(this.toTagsOptionsFromResults(items));
      this.natureOptions.set(this.toFieldOptionsFromResults(items, (item) => item.nature));
      this.subjectsOptions.set(this.toSubjectsOptionsFromResults(items));
      this.coverageOptions.set(this.toFieldOptionsFromResults(items, (item) => item.coverage));
      this.sizeOptions.set(this.toSizeOptionsFromResults(items));
    });
  }

  onQueryChange(value: string): void {
    this.query.set(value);
    this.updateDrawerFilters();
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

  toggleModificationDate(value: string): void {
    this.selectedModificationDates.update((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
    this.updateDrawerFilters();
  }

  isModificationDateSelected(value: string): boolean {
    return this.selectedModificationDates().has(value);
  }

  toggleNature(value: string): void {
    this.selectedNatures.update((current) => this.toggleInSet(current, value));
    this.updateDrawerFilters();
  }

  isNatureSelected(value: string): boolean {
    return this.selectedNatures().has(value);
  }

  toggleSubject(value: string): void {
    this.selectedSubjects.update((current) => this.toggleInSet(current, value));
    this.updateDrawerFilters();
  }

  isSubjectSelected(value: string): boolean {
    return this.selectedSubjects().has(value);
  }

  toggleCoverage(value: string): void {
    this.selectedCoverage.update((current) => this.toggleInSet(current, value));
    this.updateDrawerFilters();
  }

  isCoverageSelected(value: string): boolean {
    return this.selectedCoverage().has(value);
  }

  toggleSize(value: string): void {
    this.selectedSizes.update((current) => this.toggleInSet(current, value));
    this.updateDrawerFilters();
  }

  isSizeSelected(value: string): boolean {
    return this.selectedSizes().has(value);
  }

  onAuthorChange(value: string): void {
    this.selectedAuthor.set(value);
    this.updateDrawerFilters();
  }

  onCollectionChange(value: string): void {
    this.selectedCollection.set(value);
    this.updateDrawerFilters();
  }

  onTagChange(value: string): void {
    this.selectedTag.set(value);
    this.updateDrawerFilters();
  }

  onAuthorInput(value: string): void {
    this.authorInput.set(value);
    this.authorOpen.set(true);
    if (!value.trim() && this.selectedAuthor()) {
      this.onAuthorChange('');
    }
  }

  onCollectionInput(value: string): void {
    this.collectionInput.set(value);
    this.collectionOpen.set(true);
    if (!value.trim() && this.selectedCollection()) {
      this.onCollectionChange('');
    }
  }

  onCollectionFocus(): void {
    this.collectionOpen.set(true);
    this.loadCollectionsFromApi();
  }

  onTagInput(value: string): void {
    this.tagInput.set(value);
    this.tagOpen.set(true);
    if (!value.trim() && this.selectedTag()) {
      this.onTagChange('');
    }
  }

  selectAuthor(option: CountOption): void {
    this.authorInput.set(option.label);
    this.authorOpen.set(false);
    this.onAuthorChange(option.value);
  }

  selectCollection(option: CountOption): void {
    this.collectionInput.set(option.label);
    this.collectionOpen.set(false);
    this.onCollectionChange(option.value);
  }

  selectTag(option: CountOption): void {
    this.tagInput.set(option.label);
    this.tagOpen.set(false);
    this.onTagChange(option.value);
  }

  closeAuthorDropdown(): void {
    setTimeout(() => this.authorOpen.set(false), 120);
  }

  closeCollectionDropdown(): void {
    setTimeout(() => this.collectionOpen.set(false), 120);
  }

  closeTagDropdown(): void {
    setTimeout(() => this.tagOpen.set(false), 120);
  }

  filteredAuthors(): CountOption[] {
    const term = this.authorInput().trim().toLowerCase();
    if (!term) return this.availableAuthorsWithData();
    return this.availableAuthorsWithData().filter((o) =>
      o.label.toLowerCase().includes(term) || o.value.toLowerCase().includes(term),
    );
  }

  filteredCollections(): CountOption[] {
    const term = this.collectionInput().trim().toLowerCase();
    if (!term) return this.availableCollectionsWithData();
    return this.availableCollectionsWithData().filter((o) =>
      o.label.toLowerCase().includes(term) || o.value.toLowerCase().includes(term),
    );
  }

  filteredTags(): CountOption[] {
    const term = this.tagInput().trim().toLowerCase();
    if (!term) return [];
    return this.availableTagsWithData().filter((o) =>
      o.label.toLowerCase().includes(term) || o.value.toLowerCase().includes(term),
    );
  }

  availableModificationDateWithData(): CountOption[] {
    return this.modificationDateOptions();
  }

  availableNatureWithData(): CountOption[] {
    return this.natureOptions().filter((option) => option.count > 0);
  }

  availableSubjectsWithData(): CountOption[] {
    return this.subjectsOptions().filter((option) => option.count > 0);
  }

  availableCoverageWithData(): CountOption[] {
    return this.coverageOptions().filter((option) => option.count > 0);
  }

  availableSizesWithData(): CountOption[] {
    return this.sizeOptions();
  }

  availableAuthorsWithData(): CountOption[] {
    return this.availableAuthors().filter((option) => option.count > 0);
  }

  availableCollectionsWithData(): CountOption[] {
    if (this.collectionsLoaded()) {
      return this.availableCollections();
    }
    return this.availableCollections().filter((option) => option.count > 0);
  }

  availableTagsWithData(): CountOption[] {
    return this.availableTags().filter((option) => option.count > 0);
  }

  getCountText(count: number): string {
    return ` (${count})`;
  }

  resetFilters(): void {
    this.query.set('');
    this.selectedModificationDates.set(new Set());
    this.selectedNatures.set(new Set());
    this.selectedSubjects.set(new Set());
    this.selectedCoverage.set(new Set());
    this.selectedSizes.set(new Set());
    this.selectedAuthor.set('');
    this.authorInput.set('');
    this.authorOpen.set(false);
    this.selectedCollection.set('');
    this.collectionInput.set('');
    this.collectionOpen.set(false);
    this.selectedTag.set('');
    this.tagInput.set('');
    this.tagOpen.set(false);

    this.updateDrawerFilters();
  }

  private updateDrawerFilters(): void {
    this.ensureSearchRoute();
    this.searchAggregationService.drawerFilters.set(this.buildFilters());
  }

  private ensureSearchRoute(): void {
    const currentPath = this.router.url.split('?')[0];
    if (currentPath !== '/search') {
      void this.router.navigateByUrl('/search');
    }
  }

  private buildFilters(): Record<string, string> {
    const filters: Record<string, string> = {};

    const q = this.query().trim();
    if (q) filters['q'] = q;

    const modificationDates = [...this.selectedModificationDates()];
    if (modificationDates.length > 0) filters['modifiedDate'] = modificationDates.join(',');

    const nature = [...this.selectedNatures()];
    if (nature.length > 0) filters['nature'] = nature.join(',');

    const subjects = [...this.selectedSubjects()];
    if (subjects.length > 0) filters['subjects'] = subjects.join(',');

    const coverage = [...this.selectedCoverage()];
    if (coverage.length > 0) filters['coverage'] = coverage.join(',');

    const size = [...this.selectedSizes()];
    if (size.length > 0) filters['size'] = size.join(',');

    const author = this.selectedAuthor().trim();
    if (author) filters['author'] = author;

    const collection = this.selectedCollection().trim();
    if (collection) filters['collection'] = collection;

    const tag = this.selectedTag().trim();
    if (tag) filters['tag'] = tag;

    return filters;
  }

  private pickAggregation(...candidates: Array<AggregateResult | undefined>): AggregateResult | undefined {
    return candidates.find((agg) => (agg?.buckets?.length ?? 0) > 0);
  }

  private toCountOptions(aggregation: AggregateResult | undefined, labelMap: Record<string, string>): CountOption[] {
    return (aggregation?.buckets ?? [])
      .map((bucket) => {
        const key = bucket.key;
        return {
          key,
          value: key,
          label: labelMap[key] ?? this.humanize(key),
          count: bucket.docCount,
        } satisfies CountOption;
      })
      .filter((option) => option.count > 0);
  }

  private toModifiedDateOptionsFromResults(items: SearchResultItem[]): CountOption[] {
    if (items.length === 0) return [];

    const nowMs = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const counts = {
      last24h: 0,
      lastWeek: 0,
      lastMonth: 0,
      lastYear: 0,
      moreThan1YearAgo: 0,
    } as Record<ModifiedDateId, number>;

    for (const item of items) {
      const modifiedMs = this.parseModifiedDate(item.modifiedDate);
      if (!Number.isFinite(modifiedMs)) continue;

      const diffMs = Math.max(0, nowMs - modifiedMs);

      if (diffMs <= dayMs) {
        counts.last24h += 1;
      } else if (diffMs <= 7 * dayMs) {
        counts.lastWeek += 1;
      } else if (diffMs <= 30 * dayMs) {
        counts.lastMonth += 1;
      } else if (diffMs <= 365 * dayMs) {
        counts.lastYear += 1;
      } else {
        counts.moreThan1YearAgo += 1;
      }
    }

    return MODIFIED_DATE_OPTION_DEFS.map((option) => ({
      key: option.id,
      value: option.id,
      label: option.label,
      count: counts[option.id],
    }));
  }

  private toAuthorOptionsFromResults(items: SearchResultItem[]): CountOption[] {
    if (items.length === 0) return [];

    const byAuthor = new Map<string, { value: string; count: number }>();

    for (const item of items) {
      const value = (item.author ?? '').trim();
      if (!value) continue;

      const key = value.toLowerCase();
      const existing = byAuthor.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        byAuthor.set(key, { value, count: 1 });
      }
    }

    return [...byAuthor.entries()]
      .map(([key, info]) => ({
        key,
        value: info.value,
        label: info.value,
        count: info.count,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.label.localeCompare(b.label);
      });
  }

  private toFieldOptionsFromResults(
    items: SearchResultItem[],
    pickValue: (item: SearchResultItem) => string | undefined,
  ): CountOption[] {
    if (items.length === 0) return [];

    const byKey = new Map<string, { value: string; count: number }>();

    for (const item of items) {
      const value = (pickValue(item) ?? '').trim();
      if (!value) continue;

      const key = value.toLowerCase();
      const existing = byKey.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        byKey.set(key, { value, count: 1 });
      }
    }

    return [...byKey.entries()]
      .map(([key, info]) => ({
        key,
        value: info.value,
        label: info.value,
        count: info.count,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.label.localeCompare(b.label);
      });
  }

  private toSubjectsOptionsFromResults(items: SearchResultItem[]): CountOption[] {
    if (items.length === 0) return [];

    const byKey = new Map<string, { value: string; count: number }>();

    for (const item of items) {
      const rawValues = [
        ...(item.tags ?? []),
        ...((item.subjects ?? '')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)),
      ];

      for (const rawValue of rawValues) {
        const value = rawValue.trim();
        if (!value) continue;

        const key = value.toLowerCase();
        const existing = byKey.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          byKey.set(key, { value, count: 1 });
        }
      }
    }

    return [...byKey.entries()]
      .map(([key, info]) => ({
        key,
        value: info.value,
        label: info.value,
        count: info.count,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.label.localeCompare(b.label);
      });
  }

  private toTagsOptionsFromResults(items: SearchResultItem[]): CountOption[] {
    if (items.length === 0) return [];

    const byKey = new Map<string, { value: string; count: number }>();

    for (const item of items) {
      for (const rawTag of item.tags ?? []) {
        const value = rawTag.trim();
        if (!value) continue;

        const key = value.toLowerCase();
        const existing = byKey.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          byKey.set(key, { value, count: 1 });
        }
      }
    }

    return [...byKey.entries()]
      .map(([key, info]) => ({
        key,
        value: info.value,
        label: info.value,
        count: info.count,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.label.localeCompare(b.label);
      });
  }

  private parseModifiedDate(value: string): number {
    if (!value) return NaN;

    // Prefer ISO-like formats from API (e.g. 2026-04-02 or 2026-04-02T12:34:56Z).
    const isoMs = Date.parse(value);
    if (Number.isFinite(isoMs)) return isoMs;

    // Fallback: try YYYY-MM-DD extracted prefix.
    const prefix = value.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(prefix)) {
      const ms = Date.parse(`${prefix}T00:00:00`);
      if (Number.isFinite(ms)) return ms;
    }

    return NaN;
  }

  private toSizeOptionsFromResults(items: SearchResultItem[]): CountOption[] {
    if (items.length === 0) return [];

    const oneKb = 1024;
    const oneMb = 1024 * 1024;

    const counts = {
      tiny: 0,
      small: 0,
      medium: 0,
      big: 0,
      huge: 0,
    } as Record<SizeBucketId, number>;

    for (const item of items) {
      const sizeInBytes = item.sizeInBytes;
      if (!Number.isFinite(sizeInBytes) || sizeInBytes === undefined || sizeInBytes < 0) continue;

      if (sizeInBytes < 100 * oneKb) {
        counts.tiny += 1;
      } else if (sizeInBytes < oneMb) {
        counts.small += 1;
      } else if (sizeInBytes < 10 * oneMb) {
        counts.medium += 1;
      } else if (sizeInBytes < 100 * oneMb) {
        counts.big += 1;
      } else {
        counts.huge += 1;
      }
    }

    return SIZE_OPTION_DEFS.map((def) => ({
      key: def.value,
      value: def.value,
      label: def.label,
      count: counts[def.value],
    }));
  }

  private normalizeKey(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private loadCollectionsFromApi(): void {
    if (this.collectionsLoaded() || this.collectionsLoading()) return;

    this.collectionsLoading.set(true);
    this.searchService.getUserCollections().subscribe({
      next: (collections) => {
        this.availableCollections.set(
          collections.map((collection) => ({
            key: collection.id,
            value: collection.id,
            label: collection.title,
            count: collection.itemCount,
          })),
        );
        this.collectionsLoaded.set(true);
        this.collectionsLoading.set(false);
      },
      error: () => {
        this.collectionsLoading.set(false);
      },
    });
  }

  private toggleInSet(set: Set<string>, value: string): Set<string> {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  }

  private humanize(value: string): string {
    return value
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

type ModifiedDateId = 'last24h' | 'lastWeek' | 'lastMonth' | 'lastYear' | 'moreThan1YearAgo';
type SizeBucketId = 'tiny' | 'small' | 'medium' | 'big' | 'huge';

const MODIFIED_DATE_OPTION_DEFS: Array<{ id: ModifiedDateId; label: string }> = [
  { id: 'last24h', label: 'Last 24h' },
  { id: 'lastWeek', label: 'Last week' },
  { id: 'lastMonth', label: 'Last month' },
  { id: 'lastYear', label: 'Last year' },
  { id: 'moreThan1YearAgo', label: 'More than a year ago' },
];

const SIZE_OPTION_DEFS: Array<{ value: SizeBucketId; label: string }> = [
  {
    value: 'tiny',
    label: 'Less than 100 KB',
  },
  {
    value: 'small',
    label: 'Between 100 KB and 1 MB',
  },
  {
    value: 'medium',
    label: 'Between 1 MB and 10 MB',
  },
  {
    value: 'big',
    label: 'Between 10 MB and 100 MB',
  },
  {
    value: 'huge',
    label: 'More than 100 MB',
  },
];
