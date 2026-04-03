import { Component, computed, inject, signal, DestroyRef } from '@angular/core';
import { toSignal, toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, catchError, of, tap, map, combineLatest, finalize } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  SearchService,
  SearchAggregationService,
  SelectionService,
  DocumentDetailService,
  type SearchResultItem,
  type SearchResponse,
  type SearchQueryParams,
} from '@agentic-ui/shared/nuxeo-client';

export type SortDirection = 'asc' | 'desc' | null;
export type ViewMode = 'grid' | 'table' | 'list';

interface ColumnDef {
  key: string;
  label: string;
  width: string;
}

interface QuickFilterOption {
  label: string;
  value: string;
}

const ALL_COLUMNS: ColumnDef[] = [
  { key: 'name', label: 'Title', width: '2fr' },
  { key: 'type', label: 'Type', width: '1fr' },
  { key: 'modified', label: 'Modified', width: '1fr' },
  { key: 'contributor', label: 'Last contributor', width: '1.2fr' },
  { key: 'state', label: 'State', width: '1fr' },
  { key: 'version', label: 'Version', width: '0.8fr' },
  { key: 'created', label: 'Created', width: '1fr' },
  { key: 'author', label: 'Author', width: '1fr' },
  { key: 'nature', label: 'Nature', width: '1fr' },
  { key: 'coverage', label: 'Coverage', width: '1fr' },
  { key: 'subjects', label: 'Subjects', width: '1fr' },
  { key: 'flags', label: 'Flags', width: '1fr' },
];

const QUICK_FILTER_OPTIONS: QuickFilterOption[] = [
  { label: 'No Containers', value: 'noFolder' },
  { label: 'Most Recent', value: 'mostRecent' },
  { label: 'Validated', value: 'onlyValidated' },
];

// Map display column keys to API field names
const COLUMN_TO_API_FIELD: Record<string, string> = {
  title: 'dc:title',
  name: 'dc:title',
  type: 'dc:type',
  modified: 'dc:modified',
  contributor: 'dc:lastContributor',
  state: 'ecm:currentLifeCycleState',
  version: 'dc:version',
  created: 'dc:created',
  author: 'dc:creator',
  nature: 'dc:nature',
  coverage: 'dc:coverage',
  subjects: 'dc:subjects',
  flags: 'dc:flag',
};

// Reverse map: API field names back to display column keys
const API_FIELD_TO_COLUMN: Record<string, string> = Object.fromEntries(
  Object.entries(COLUMN_TO_API_FIELD)
    .filter(([key]) => key !== 'title') // prefer 'name' over 'title' for dc:title
    .map(([key, value]) => [value, key]),
);

interface SearchResultViewModel {
  id: string;
  name: string;
  imageUrl: string;
  type: string;
  modifiedDate: string;
  lastContributor: string;
  state?: string;
  version?: string;
  createdDate?: string;
  author: string;
  nature?: string;
  coverage?: string;
  subjects?: string;
  flags?: string;
  icon: string;
}

function mapToView(item: SearchResultItem): SearchResultViewModel {
  return {
    id: item.id,
    name: item.title,
    imageUrl: '/images/Login-background.svg',
    type: item.type,
    modifiedDate: item.modifiedDate,
    lastContributor: item.lastContributor,
    state: item.state,
    version: item.version,
    createdDate: item.createdDate,
    author: item.author,
    nature: item.nature,
    coverage: item.coverage,
    subjects: item.subjects ?? item.tags.join(', '),
    flags: item.flags,
    icon: item.icon,
  };
}

@Component({
  selector: 'lib-search',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class SearchComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly searchService = inject(SearchService);
  private readonly searchAggregationService = inject(SearchAggregationService);
  private readonly documentDetailService = inject(DocumentDetailService);
  readonly selectionService = inject(SelectionService);

  readonly thumbnailMap = signal<Record<string, SafeUrl>>({});

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly quickFilterOptions = QUICK_FILTER_OPTIONS;
  readonly selectedQuickFilters = signal<Set<string>>(new Set());
  readonly gridGroupBy = signal<string>('created');
  readonly gridSortOrder = signal<SortDirection>('asc');
  readonly viewMode = signal<ViewMode>('table');
  readonly visibleColumnKeys = signal<string[]>(['name', 'modified', 'contributor']);
  readonly columnPanelOpen = signal(false);
  readonly pendingColumnKeys = signal<string[]>(['name', 'modified', 'contributor']);
  readonly columnsForPanel = ALL_COLUMNS;
  readonly sortColumn = signal<string | null>(null);
  readonly sortDirection = signal<SortDirection>(null);
  readonly favoriteIds = signal<Set<string>>(new Set());
  readonly favoritePendingIds = signal<Set<string>>(new Set());

  private readonly results$ = combineLatest([
    this.route.queryParamMap,
    toObservable(this.searchAggregationService.drawerFilters),
  ]).pipe(
    tap(() => {
      this.loading.set(true);
      this.error.set(null);
    }),
    switchMap(([params, drawerFilters]) => {
      const quickFilters = params.get('quickFilters') ?? '';
      this.selectedQuickFilters.set(this.parseQuickFilters(quickFilters));

      // Update sort from query params only if they exist
      const querySortBy = params.get('sortBy');
      const querySortOrderRaw = params.get('sortOrder');
      const querySortOrder: 'asc' | 'desc' | null =
        querySortOrderRaw === 'asc' || querySortOrderRaw === 'desc' ? querySortOrderRaw : null;

      // Map API field name back to UI column key for in-memory sorting/indicators
      const uiSortColumn = querySortBy ? (API_FIELD_TO_COLUMN[querySortBy] ?? querySortBy) : null;
      this.sortColumn.set(uiSortColumn);
      this.sortDirection.set(querySortOrder);

      // Sync grid sort UI from query params so grid view stays in sync with table view
      if (uiSortColumn) {
        this.gridGroupBy.set(uiSortColumn);
      }
      if (querySortOrder) {
        this.gridSortOrder.set(querySortOrder);
      }

      const request: {
        q?: string;
        quickFilters?: string;
        sortBy?: string | null;
        sortOrder?: ('asc' | 'desc') | null;
        modifiedDate?: string;
        author?: string;
        collection?: string;
        tag?: string;
        nature?: string;
        subjects?: string;
        coverage?: string;
        size?: string;
      } = {};

      // Sort and quick filters still come from URL params
      if (quickFilters.trim()) request.quickFilters = quickFilters;
      if (querySortBy) request.sortBy = querySortBy;
      if (querySortOrder) request.sortOrder = querySortOrder;

      // All drawer filters come from the shared service signal (not URL)
      const q = (drawerFilters['q'] ?? '').trim();
      const modifiedDate = (drawerFilters['modifiedDate'] ?? '').trim();
      const author = (drawerFilters['author'] ?? '').trim();
      const collection = (drawerFilters['collection'] ?? '').trim();
      const tag = (drawerFilters['tag'] ?? '').trim();
      const nature = (drawerFilters['nature'] ?? '').trim();
      const subjects = (drawerFilters['subjects'] ?? '').trim();
      const coverage = (drawerFilters['coverage'] ?? '').trim();
      const size = (drawerFilters['size'] ?? '').trim();

      if (q) request.q = q;
      if (modifiedDate) request.modifiedDate = modifiedDate;
      if (author) request.author = author;
      if (collection) request.collection = collection;
      if (tag) request.tag = tag;
      if (nature) request.nature = nature;
      if (subjects) request.subjects = subjects;
      if (coverage) request.coverage = coverage;
      if (size) request.size = size;

      return this.searchService.search(request as SearchQueryParams).pipe(
        tap((response: SearchResponse) => {
          if (this.searchAggregationService?.aggregations?.set) {
            this.searchAggregationService.aggregations.set(response.aggregations);
          }
          if (this.searchAggregationService?.items?.set) {
            this.searchAggregationService.items.set(response.items);
          }
          this.favoriteIds.set(
            new Set(response.items.filter((item) => item.isFavorite).map((item) => item.id)),
          );
        }),
        map((response) => response.items),
        tap((items) => {
          this.loading.set(false);
          this.loadThumbnails(items);
        }),
        catchError(() => {
          this.searchAggregationService.aggregations.set({});
          this.searchAggregationService.items.set([]);
          this.error.set('Failed to load search results.');
          this.loading.set(false);
          return of<SearchResultItem[]>([]);
        }),
      );
    }),
  );

  readonly results = toSignal(this.results$, { initialValue: [] as SearchResultItem[] });

  readonly visibleColumns = computed(() =>
    ALL_COLUMNS.filter((c) => this.visibleColumnKeys().includes(c.key)),
  );

  readonly gridTemplate = computed(() =>
    ['40px', ...this.visibleColumns().map((c) => c.width), '40px'].join(' '),
  );

  readonly filteredResults = computed(() => this.results().map(mapToView));

  readonly displayResults = computed(() => this.filteredResults());

  readonly sortedResults = computed(() => {
    const rows = [...this.displayResults()];
    const col = this.sortColumn();
    const dir = this.sortDirection();
    if (!col || !dir) return rows;
    return rows.sort((a, b) => {
      const aVal = this.getCellValue(a, col).toLowerCase();
      const bVal = this.getCellValue(b, col).toLowerCase();
      return dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  });

  readonly resultCount = computed(() => this.displayResults().length);
  readonly selectedCount = computed(() => this.selectionService.selectedCount());
  readonly SORTABLE_COLUMNS = new Set(['name', 'modified', 'contributor', 'author', 'created']);

  readonly isAllSelected = computed(() => {
    const rows = this.displayResults();
    return this.selectionService.isAllSelected(rows.map((r) => r.id));
  });

  readonly isIndeterminate = computed(() => {
    const rows = this.displayResults();
    return this.selectionService.isIndeterminate(rows.map((r) => r.id));
  });

  isQuickFilterSelected(value: string): boolean {
    return this.selectedQuickFilters().has(value);
  }

  toggleQuickFilter(value: string): void {
    const next = new Set(this.selectedQuickFilters());
    if (next.has(value)) next.delete(value);
    else next.add(value);

    this.selectedQuickFilters.set(next);

    const orderedSelected = QUICK_FILTER_OPTIONS.map((filter) => filter.value).filter(
      (filterValue) => next.has(filterValue),
    );

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { quickFilters: orderedSelected.length > 0 ? orderedSelected.join(',') : null },
      queryParamsHandling: 'merge',
    });
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  openDocument(uid: string): void {
    if (!uid) return;
    void this.router.navigateByUrl(`/doc/${uid}`);
  }

  isSelected(id: string): boolean {
    return this.selectionService.isSelected(id);
  }

  toggleSelection(id: string): void {
    this.selectionService.toggle(id);
  }

  toggleAll(): void {
    if (this.isAllSelected()) {
      this.selectionService.clear();
    } else {
      this.selectionService.selectAll(this.displayResults().map((r) => r.id));
    }
  }

  deleteSelected(): void {
    this.selectionService
      .deleteSelected()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () =>
          this.router.navigate([], { relativeTo: this.route, queryParamsHandling: 'merge' }),
      });
  }

  clearSelection(): void {
    this.selectionService.clear();
  }

  isPendingColumn(key: string): boolean {
    return this.pendingColumnKeys().includes(key);
  }

  togglePendingColumn(key: string): void {
    const current = this.pendingColumnKeys();
    if (current.includes(key)) {
      this.pendingColumnKeys.set(current.filter((k) => k !== key));
      return;
    }

    const ordered = ALL_COLUMNS.map((c) => c.key);
    this.pendingColumnKeys.set(ordered.filter((k) => [...current, key].includes(k)));
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
      ALL_COLUMNS.map((c) => c.key).filter((k) => this.pendingColumnKeys().includes(k)),
    );
    this.columnPanelOpen.set(false);
  }

  sortBy(col: string): void {
    if (!this.SORTABLE_COLUMNS.has(col)) return;

    let newSortColumn: string | null = col;
    let newSortDirection: SortDirection = 'asc';

    if (this.sortColumn() === col) {
      if (this.sortDirection() === 'asc') {
        newSortDirection = 'desc';
      } else if (this.sortDirection() === 'desc') {
        newSortColumn = null;
        newSortDirection = null;
      }
    }

    this.sortColumn.set(newSortColumn);
    this.sortDirection.set(newSortDirection);

    // Map the display column key to API field name
    const apiFieldName = newSortColumn ? COLUMN_TO_API_FIELD[newSortColumn] : null;

    // Update route query parameters to trigger API call
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sortBy: apiFieldName || null,
        sortOrder: newSortDirection || null,
      },
      queryParamsHandling: 'merge',
    });
  }

  getCellValue(row: SearchResultViewModel, key: string): string {
    switch (key) {
      case 'name':
        return row.name;
      case 'type':
        return row.type;
      case 'modified':
        return row.modifiedDate;
      case 'contributor':
        return row.lastContributor;
      case 'author':
        return row.author;
      case 'state':
        return row.state ?? '—';
      case 'version':
        return row.version ?? '—';
      case 'created':
        return row.createdDate ?? '—';
      case 'nature':
        return row.nature ?? '—';
      case 'coverage':
        return row.coverage ?? '—';
      case 'subjects':
        return row.subjects ?? '—';
      case 'flags':
        return row.flags ?? '—';
      default:
        return '';
    }
  }

  exportCsv(): void {
    const headers = [
      'Title',
      'Type',
      'Modified',
      'Last Contributor',
      'State',
      'Version',
      'Created',
      'Author',
      'Nature',
      'Coverage',
      'Subjects',
      'Flags',
    ];
    const escape = (value: string): string => `"${value.replaceAll('"', '""')}"`;
    const rows = this.sortedResults().map((row) => [
      row.name,
      row.type,
      row.modifiedDate,
      row.lastContributor,
      row.state ?? '—',
      row.version ?? '—',
      row.createdDate ?? '—',
      row.author,
      row.nature ?? '—',
      row.coverage ?? '—',
      row.subjects ?? '—',
      row.flags ?? '—',
    ]);

    const csv = [headers, ...rows]
      .map((line) => line.map((cell) => escape(cell ?? '')).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'search-results.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;
    img.src = '/images/Login-background.svg';
  }

  toggleFavorite(id: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!id || this.favoritePendingIds().has(id)) return;

    const isCurrentlyFavorite = this.favoriteIds().has(id);
    this.favoritePendingIds.update((current) => new Set(current).add(id));

    const op = isCurrentlyFavorite
      ? this.documentDetailService.removeFromFavorites(id)
      : this.documentDetailService.addToFavorites(id);

    op.pipe(
      finalize(() => {
        this.favoritePendingIds.update((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => {
        this.favoriteIds.update((current) => {
          const next = new Set(current);
          if (isCurrentlyFavorite) next.delete(id);
          else next.add(id);
          return next;
        });
        window.dispatchEvent(new Event('favorites-changed'));
      },
      error: (err) => {
        this.snackBar.open(this.getApiErrorMessage(err, 'Failed to update favorites.'), 'Dismiss', {
          duration: 5000,
        });
      },
    });
  }

  private getApiErrorMessage(err: unknown, fallback: string): string {
    if (typeof err === 'string' && err.trim().length > 0) return err;

    const maybeObj = err as { error?: { message?: string }; message?: string } | null;
    const apiMessage = maybeObj?.error?.message;
    if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) return apiMessage;

    const defaultMessage = maybeObj?.message;
    if (typeof defaultMessage === 'string' && defaultMessage.trim().length > 0)
      return defaultMessage;

    return fallback;
  }

  isFavorited(id: string): boolean {
    return this.favoriteIds().has(id);
  }

  downloadDocument(id: string, name: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    console.warn('Document download is not yet implemented for document:', id, name);
  }

  setGridGroupBy(value: string): void {
    this.gridGroupBy.set(value);

    // Dropdown-triggered sorting should default to ascending.
    this.gridSortOrder.set('asc');

    const apiFieldName = COLUMN_TO_API_FIELD[value] ?? null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sortBy: apiFieldName,
        sortOrder: 'asc',
      },
      queryParamsHandling: 'merge',
    });
  }

  setGridSortOrder(direction: SortDirection): void {
    const effectiveDirection: 'asc' | 'desc' = direction === 'asc' ? 'asc' : 'desc';
    this.gridSortOrder.set(effectiveDirection);

    const apiFieldName = COLUMN_TO_API_FIELD[this.gridGroupBy()] ?? null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sortBy: apiFieldName,
        sortOrder: effectiveDirection,
      },
      queryParamsHandling: 'merge',
    });
  }

  private parseQuickFilters(value: string): Set<string> {
    const allowed = new Set(QUICK_FILTER_OPTIONS.map((f) => f.value));
    return new Set(
      value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => allowed.has(v)),
    );
  }

  private loadThumbnails(items: SearchResultItem[]): void {
    for (const item of items) {
      if (this.thumbnailMap()[item.id]) continue;
      this.documentDetailService
        .fetchThumbnail(item.id)
        .pipe(catchError(() => of(null)))
        .subscribe((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          this.thumbnailMap.update((m) => ({
            ...m,
            [item.id]: this.sanitizer.bypassSecurityTrustUrl(url),
          }));
        });
    }
  }
}
