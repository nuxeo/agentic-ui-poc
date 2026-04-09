import { Component, computed, inject, signal, DestroyRef } from '@angular/core';
import { toSignal, toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  switchMap,
  catchError,
  of,
  tap,
  map,
  combineLatest,
  finalize,
  Subject,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SavedSearchDialogComponent, ShareSavedSearchDialogComponent } from '@agentic-ui/shared/ui';
import {
  SearchService,
  SearchAggregationService,
  SelectionService,
  DocumentDetailService,
  NON_CONTENT_DOCUMENT_TYPES,
  NuxeoApiBase,
  type SearchResultItem,
  type SearchResponse,
  type SearchQueryParams,
} from '@agentic-ui/shared/nuxeo-client';
import { AiGatewayService, AiFeatureFlagService } from '@agentic-ui/shared/ai-client';

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
    MatMenuModule,
    MatAutocompleteModule,
    FormsModule,
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class SearchComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly searchService = inject(SearchService);
  private readonly searchAggregationService = inject(SearchAggregationService);
  private readonly documentDetailService = inject(DocumentDetailService);
  private readonly nuxeoApi = inject(NuxeoApiBase);
  private readonly aiGateway = inject(AiGatewayService);
  readonly featureFlags = inject(AiFeatureFlagService);
  readonly selectionService = inject(SelectionService);

  readonly thumbnailMap = signal<Record<string, SafeUrl>>({});

  // AI Search state
  readonly aiSearchMode = signal(false);
  readonly aiQuery = signal('');
  readonly aiLoading = signal(false);
  readonly aiGeneratedNxql = signal('');
  readonly aiExplanation = signal('');
  readonly aiSuggestions = signal<string[]>([]);
  readonly showNxqlPanel = signal(false);
  readonly aiError = signal<string | null>(null);
  readonly aiResults = signal<SearchResultItem[]>([]);
  readonly aiSearchExecuted = signal(false);
  private readonly aiSuggestSubject = new Subject<string>();

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
  readonly selectedSavedSearchId = this.searchAggregationService.selectedSavedSearchId;
  readonly selectedSavedSearchTitle = this.searchAggregationService.selectedSavedSearchTitle;

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
        ecmFulltext?: string;
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
      const ecmFulltext = (drawerFilters['ecm_fulltext'] ?? '').trim();
      const modifiedDate = (drawerFilters['modifiedDate'] ?? '').trim();
      const author = (drawerFilters['author'] ?? '').trim();
      const collection = (drawerFilters['collection'] ?? '').trim();
      const tag = (drawerFilters['tag'] ?? '').trim();
      const nature = (drawerFilters['nature'] ?? '').trim();
      const subjects = (drawerFilters['subjects'] ?? '').trim();
      const coverage = (drawerFilters['coverage'] ?? '').trim();
      const size = (drawerFilters['size'] ?? '').trim();

      if (q) request.q = q;
      if (ecmFulltext) request.ecmFulltext = ecmFulltext;
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

  readonly filteredResults = computed(() => {
    const source =
      this.aiSearchMode() && this.aiSearchExecuted() ? this.aiResults() : this.results();
    return source.map(mapToView);
  });

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
    const row = this.displayResults().find((r) => r.id === id);
    this.selectionService.toggle(id, row?.name ?? id, this.thumbnailMap()[id] ?? null);
  }

  toggleAll(): void {
    if (this.isAllSelected()) {
      this.selectionService.clear();
    } else {
      const rows = this.displayResults();
      const labels: Record<string, string> = {};
      const previews: Record<string, SafeUrl | null> = {};
      rows.forEach((row) => {
        labels[row.id] = row.name;
        previews[row.id] = this.thumbnailMap()[row.id] ?? null;
      });
      this.selectionService.selectAll(
        rows.map((r) => r.id),
        labels,
        previews,
      );
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
    if (!id) return;

    const row = this.displayResults().find((r) => r.id === id);
    if (row && !this.isDownloadableType(row.type)) {
      return;
    }

    this.documentDetailService
      .fetchBlob(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const objectUrl = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = objectUrl;
          anchor.download = this.buildDownloadFileName(name, blob.type);
          anchor.click();
          URL.revokeObjectURL(objectUrl);
        },
        error: (err) => {
          this.snackBar.open(
            this.getApiErrorMessage(err, 'Failed to download document.'),
            'Dismiss',
            {
              duration: 5000,
            },
          );
        },
      });
  }

  isDownloadableType(type: string): boolean {
    const normalized = type.trim().toLowerCase();
    return normalized.length > 0 && !NON_CONTENT_DOCUMENT_TYPES.has(normalized);
  }

  private buildDownloadFileName(name: string, mimeType: string): string {
    const trimmed = name.trim() || 'document';
    // Keep existing extension if present.
    if (/\.[a-z0-9]+$/i.test(trimmed)) return trimmed;

    const extensionByMime: Record<string, string> = {
      'application/pdf': 'pdf',
      'text/plain': 'txt',
      'text/csv': 'csv',
      'application/json': 'json',
      'application/xml': 'xml',
      'text/xml': 'xml',
      'application/zip': 'zip',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.ms-powerpoint': 'ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'video/mp4': 'mp4',
      'audio/mpeg': 'mp3',
    };

    const ext = extensionByMime[mimeType.toLowerCase()];
    return ext ? `${trimmed}.${ext}` : trimmed;
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

  openSaveAsDialog(): void {
    this.dialog
      .open(SavedSearchDialogComponent, {
        data: {
          title: 'Saved Search',
          placeholder: 'Enter a name for your saved search',
        },
      })
      .afterClosed()
      .subscribe((title) => {
        const trimmedTitle = title?.trim();
        if (!trimmedTitle) return;

        this.searchService
          .saveSavedSearch({
            title: trimmedTitle,
            params: this.buildSavedSearchParamsFromFilters(),
            pageProviderName: 'default_search',
          })
          .subscribe({
            next: (saved) => {
              this.searchAggregationService.selectedSavedSearchId.set(
                this.readSavedSearchId(saved),
              );
              this.searchAggregationService.selectedSavedSearchTitle.set(
                this.readSavedSearchTitle(saved) || trimmedTitle,
              );
              this.searchAggregationService.markSavedSearchDirty();
            },
          });
      });
  }

  hasSelectedSavedSearch(): boolean {
    return this.selectedSavedSearchId().trim().length > 0;
  }

  hasSavableFilters(): boolean {
    return Object.keys(this.buildSavedSearchParamsFromFilters()).length > 0;
  }

  onSaveSelectedSavedSearch(): void {
    const id = this.selectedSavedSearchId().trim();
    if (!id) return;

    const currentTitle = this.selectedSavedSearchTitle().trim() || 'Saved Search';
    this.searchService
      .updateSavedSearch(id, {
        title: currentTitle,
        params: this.buildSavedSearchParamsFromFilters(),
        pageProviderName: 'default_search',
      })
      .subscribe({
        next: () => {
          this.searchAggregationService.selectedSavedSearchTitle.set(currentTitle);
          this.searchAggregationService.markSavedSearchDirty();
        },
      });
  }

  onEditSelectedSavedSearch(): void {
    const id = this.selectedSavedSearchId().trim();
    if (!id) return;

    this.dialog
      .open(SavedSearchDialogComponent, {
        data: {
          title: 'Edit Saved Search',
          placeholder: 'Enter a name for your saved search',
          initialValue: this.selectedSavedSearchTitle(),
        },
      })
      .afterClosed()
      .subscribe((title) => {
        const trimmedTitle = title?.trim();
        if (!trimmedTitle) return;

        this.searchService
          .updateSavedSearch(id, {
            title: trimmedTitle,
            params: this.buildSavedSearchParamsFromFilters(),
            pageProviderName: 'default_search',
          })
          .subscribe({
            next: () => {
              this.searchAggregationService.selectedSavedSearchTitle.set(trimmedTitle);
              this.searchAggregationService.markSavedSearchDirty();
            },
          });
      });
  }

  onShareSelectedSavedSearch(): void {
    const id = this.selectedSavedSearchId().trim();
    if (!id) return;

    this.dialog.open(ShareSavedSearchDialogComponent, {
      width: '80vw',
      maxWidth: '80vw',
      height: '80vh',
      data: {
        title: this.selectedSavedSearchTitle().trim() || 'Saved Search',
        id,
      },
    });
  }

  onDeleteSelectedSavedSearch(): void {
    const id = this.selectedSavedSearchId().trim();
    if (!id) return;

    const title = this.selectedSavedSearchTitle().trim() || 'this saved search';
    if (!window.confirm(`Delete saved search "${title}"?`)) return;

    this.searchService.deleteSavedSearch(id).subscribe({
      next: () => {
        this.searchAggregationService.selectedSavedSearchId.set('');
        this.searchAggregationService.selectedSavedSearchTitle.set('');
        this.searchAggregationService.drawerFilters.set({});
        this.searchAggregationService.markSavedSearchDirty();
      },
    });
  }

  private buildSavedSearchParamsFromFilters(): Record<string, string> {
    const drawerFilters = this.searchAggregationService.drawerFilters();
    const saved: Record<string, string> = {};

    for (const [key, value] of Object.entries(drawerFilters)) {
      const trimmed = value.trim();
      if (trimmed) saved[key] = trimmed;
    }

    return saved;
  }

  private readSavedSearchId(saved: unknown): string {
    if (!saved || typeof saved !== 'object') return '';
    const obj = saved as Record<string, unknown>;
    return typeof obj['id'] === 'string' ? obj['id'] : '';
  }

  private readSavedSearchTitle(saved: unknown): string {
    if (!saved || typeof saved !== 'object') return '';
    const obj = saved as Record<string, unknown>;
    return typeof obj['title'] === 'string' ? obj['title'] : '';
  }

  constructor() {
    this.aiSuggestSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((q) => {
          if (q.length < 3) return of({ suggestions: [] as string[] });
          return this.aiGateway
            .nlToNxqlSuggestions(q)
            .pipe(catchError(() => of({ suggestions: [] as string[] })));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => this.aiSuggestions.set(res.suggestions));
  }

  toggleAiSearch(): void {
    this.aiSearchMode.update((v) => !v);
    if (!this.aiSearchMode()) {
      this.aiQuery.set('');
      this.aiGeneratedNxql.set('');
      this.aiExplanation.set('');
      this.aiSuggestions.set([]);
      this.aiError.set(null);
      this.showNxqlPanel.set(false);
      this.aiResults.set([]);
      this.aiSearchExecuted.set(false);
    }
  }

  onAiQueryInput(value: string): void {
    this.aiQuery.set(value);
    this.aiSuggestSubject.next(value);
  }

  selectAiSuggestion(suggestion: string): void {
    this.aiQuery.set(suggestion);
    this.aiSuggestions.set([]);
    this.executeAiSearch();
  }

  executeAiSearch(): void {
    const query = this.aiQuery().trim();
    if (!query) return;

    this.aiLoading.set(true);
    this.aiError.set(null);
    this.aiGeneratedNxql.set('');
    this.aiExplanation.set('');

    this.aiGateway
      .nlToNxql(query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.aiGeneratedNxql.set(res.nxql);
          this.aiExplanation.set(res.explanation);
          this.showNxqlPanel.set(true);
          this.runNxqlQuery(res.nxql);
        },
        error: (err) => {
          this.aiError.set(err?.error?.error ?? 'AI search failed. Try again.');
          this.aiLoading.set(false);
        },
      });
  }

  private runNxqlQuery(nxql: string): void {
    this.loading.set(true);
    this.nuxeoApi
      .nxqlSearch(nxql, 40, {
        properties: 'dublincore,file,common',
        'enrichers.document': 'favorites',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          const items: SearchResultItem[] = (result.entries ?? []).map((doc) => ({
            id: doc.uid,
            title: doc.title,
            type: doc.type,
            modifiedDate: doc.lastModified ?? '',
            lastContributor: String(doc.properties?.['dc:lastContributor'] ?? ''),
            state: doc.state ?? '',
            version: String(doc.properties?.['uid:major_version'] ?? ''),
            createdDate: String(doc.properties?.['dc:created'] ?? ''),
            author: String(doc.properties?.['dc:creator'] ?? ''),
            authorKey: String(doc.properties?.['dc:creator'] ?? ''),
            nature: String(doc.properties?.['dc:nature'] ?? ''),
            coverage: String(doc.properties?.['dc:coverage'] ?? ''),
            subjects: ((doc.properties?.['dc:subjects'] as string[]) ?? []).join(', '),
            collection: '',
            collectionKey: '',
            tags: [],
            flags: '',
            icon: 'description',
            isFavorite: doc.contextParameters?.favorites?.isFavorite ?? false,
          }));
          this.aiResults.set(items);
          this.aiSearchExecuted.set(true);
          this.loading.set(false);
          this.aiLoading.set(false);
          this.loadThumbnails(items);
        },
        error: () => {
          this.aiError.set('NXQL query execution failed. The generated query may be invalid.');
          this.loading.set(false);
          this.aiLoading.set(false);
        },
      });
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
