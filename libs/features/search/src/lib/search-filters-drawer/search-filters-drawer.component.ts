import { Component, computed, effect, inject, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { SearchAggregationService, SearchService } from '@agentic-ui/shared/nuxeo-client';
import type { AggregateResult } from '@agentic-ui/shared/nuxeo-client';

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

  readonly applyFilters = output<string>();

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

      this.modificationDateOptions.set(this.toCountOptions(aggregations.dc_modified_agg, MODIFIED_DATE_LABELS));
      this.availableAuthors.set(this.toCountOptions(this.pickAggregation(aggregations.dc_creator_agg), {}));
      if (!this.collectionsLoaded()) {
        this.availableCollections.set(this.toCountOptions(this.pickAggregation(aggregations.collection_agg, aggregations.dc_coverage_agg), {}));
      }
      this.availableTags.set(this.toCountOptions(this.pickAggregation(aggregations.dc_subjects_agg), {}));
      this.natureOptions.set(this.toCountOptions(aggregations.dc_nature_agg, {}));
      this.subjectsOptions.set(this.toCountOptions(aggregations.dc_subjects_agg, {}));
      this.coverageOptions.set(this.toCountOptions(aggregations.dc_coverage_agg, {}));
      this.sizeOptions.set(this.toSizeOptions(aggregations.common_size_agg));
    });
  }

  onQueryChange(value: string): void {
    this.query.set(value);
    this.applyFilters.emit(this.buildFilterUrl());
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
    this.applyFilters.emit(this.buildFilterUrl());
  }

  isModificationDateSelected(value: string): boolean {
    return this.selectedModificationDates().has(value);
  }

  toggleNature(value: string): void {
    this.selectedNatures.update((current) => this.toggleInSet(current, value));
    this.applyFilters.emit(this.buildFilterUrl());
  }

  isNatureSelected(value: string): boolean {
    return this.selectedNatures().has(value);
  }

  toggleSubject(value: string): void {
    this.selectedSubjects.update((current) => this.toggleInSet(current, value));
    this.applyFilters.emit(this.buildFilterUrl());
  }

  isSubjectSelected(value: string): boolean {
    return this.selectedSubjects().has(value);
  }

  toggleCoverage(value: string): void {
    this.selectedCoverage.update((current) => this.toggleInSet(current, value));
    this.applyFilters.emit(this.buildFilterUrl());
  }

  isCoverageSelected(value: string): boolean {
    return this.selectedCoverage().has(value);
  }

  toggleSize(value: string): void {
    this.selectedSizes.update((current) => this.toggleInSet(current, value));
    this.applyFilters.emit(this.buildFilterUrl());
  }

  isSizeSelected(value: string): boolean {
    return this.selectedSizes().has(value);
  }

  onAuthorChange(value: string): void {
    this.selectedAuthor.set(value);
    this.applyFilters.emit(this.buildFilterUrl());
  }

  onCollectionChange(value: string): void {
    this.selectedCollection.set(value);
    this.applyFilters.emit(this.buildFilterUrl());
  }

  onTagChange(value: string): void {
    this.selectedTag.set(value);
    this.applyFilters.emit(this.buildFilterUrl());
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
    this.onTagChange(value.trim());
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
    if (!term) return [];
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
    return this.modificationDateOptions().filter((option) => option.count > 0);
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
    return this.sizeOptions().filter((option) => option.count > 0);
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

    this.applyFilters.emit('/search');
  }

  private buildFilterUrl(): string {
    const params = new URLSearchParams();
    const q = this.query().trim();
    if (q) {
      params.set('q', q);
    }

    const modificationDates = [...this.selectedModificationDates()];
    if (modificationDates.length > 0) {
      params.set('modifiedDate', modificationDates.join(','));
    }

    const nature = [...this.selectedNatures()];
    if (nature.length > 0) {
      params.set('nature', nature.join(','));
    }

    const subjects = [...this.selectedSubjects()];
    if (subjects.length > 0) {
      params.set('subjects', subjects.join(','));
    }

    const coverage = [...this.selectedCoverage()];
    if (coverage.length > 0) {
      params.set('coverage', coverage.join(','));
    }

    const size = [...this.selectedSizes()];
    if (size.length > 0) {
      params.set('size', size.join(','));
    }

    const author = this.selectedAuthor().trim();
    if (author) {
      params.set('author', author);
    }

    const collection = this.selectedCollection().trim();
    if (collection) {
      params.set('collection', collection);
    }

    const tag = this.selectedTag().trim();
    if (tag) {
      params.set('tag', tag);
    }

    const queryString = params.toString();
    return queryString ? `/search?${queryString}` : '/search';
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

  private toSizeOptions(aggregation: AggregateResult | undefined): CountOption[] {
    if (!aggregation) return [];

    const bucketByKey = new Map(aggregation.buckets.map((b) => [this.normalizeKey(b.key), b]));

    return SIZE_OPTION_DEFS.map((def) => {
      const bucket = def.keys
        .map((key) => bucketByKey.get(this.normalizeKey(key)))
        .find((b): b is { key: string; docCount: number } => !!b);

      return {
        key: def.value,
        value: bucket?.key ?? def.value,
        label: def.label,
        count: bucket?.docCount ?? 0,
      } satisfies CountOption;
    });
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

const MODIFIED_DATE_LABELS: Record<string, string> = {
  last24h: 'Last 24h',
  lastWeek: 'Last week',
  lastMonth: 'Last month',
  lastYear: 'Last year',
  moreThan1YearAgo: 'More than 1 year ago',
};

const SIZE_OPTION_DEFS: Array<{ value: string; label: string; keys: string[] }> = [
  {
    value: 'to_100_kb',
    label: 'Less than 100 KB',
    keys: ['to_100_KB', 'to_100_kb', 'lt_100_kb'],
  },
  {
    value: 'from_100_kb_to_1_mb',
    label: 'Between 100 KB and 1 MB',
    keys: ['from_100_KB_to_1_MB', 'from_100_kb_to_1_mb', '100kb_1mb'],
  },
  {
    value: 'from_1_mb_to_10_mb',
    label: 'Between 1 MB and 10 MB',
    keys: ['from_1_MB_to_10_MB', 'from_1_mb_to_10_mb', '1mb_10mb'],
  },
  {
    value: 'from_10_mb_to_100_mb',
    label: 'Between 10 MB and 100 MB',
    keys: ['from_10_MB_to_100_MB', 'from_10_mb_to_100_mb', '10mb_100mb'],
  },
  {
    value: 'from_100_mb',
    label: 'More than 100 MB',
    keys: ['from_100_MB', 'from_100_mb', 'gt_100_mb'],
  },
];
