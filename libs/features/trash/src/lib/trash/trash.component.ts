import { Component, computed, effect, inject, signal, untracked, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { of, finalize, filter, switchMap, map } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { SatTagModule } from '@hylandsoftware/satori-ui/tag';
import { ConfirmDialogComponent, SavedSearchDialogComponent, SAVED_SEARCH_DIALOG_OPTIONS, ShareSavedSearchDialogComponent, type ConfirmDialogData } from '@agentic-ui/shared/ui';

import {
  TrashService,
  TrashFilterService,
  SelectionService,
  SearchService,
  DocumentDetailService,
  docTypeIcon,
  type NuxeoDocument,
  type NuxeoDocumentList,
} from '@agentic-ui/shared/nuxeo-client';

export type ViewMode = 'grid' | 'table' | 'list';
type SortDirection = 'asc' | 'desc';

interface ColumnDef {
  key: string;
  label: string;
  width: string;
}

const ALL_COLUMNS: ColumnDef[] = [
  { key: 'title', label: 'Title', width: '2fr' },
  { key: 'type', label: 'Type', width: '1fr' },
  { key: 'modified', label: 'Modified', width: '1fr' },
  { key: 'contributor', label: 'Last contributor', width: '1.2fr' },
  { key: 'created', label: 'Created', width: '1fr' },
  { key: 'author', label: 'Author', width: '1fr' },
  { key: 'state', label: 'State', width: '1fr' },
];

const SORT_FIELD_MAP: Record<string, string> = {
  title: 'dc:title',
  type: 'dc:type',
  modified: 'dc:modified',
  contributor: 'dc:lastContributor',
  created: 'dc:created',
  author: 'dc:creator',
  state: 'ecm:currentLifeCycleState',
};

const SORTABLE_COLUMNS = new Set(['title', 'modified', 'contributor', 'created', 'author']);

@Component({
  selector: 'lib-trash',
  standalone: true,
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatMenuModule,
    MatDialogModule,
    SatTagModule,
  ],
  templateUrl: './trash.component.html',
  styleUrl: './trash.component.scss',
})
export class TrashComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly trashService = inject(TrashService);
  private readonly searchService = inject(SearchService);
  private readonly detailService = inject(DocumentDetailService);
  readonly trashFilterService = inject(TrashFilterService);
  readonly selectionService = inject(SelectionService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly documents = signal<NuxeoDocument[]>([]);
  readonly totalResults = signal(0);

  readonly viewMode = signal<ViewMode>('table');
  readonly sortBy = signal<string>('created');
  readonly sortDir = signal<SortDirection>('desc');
  readonly visibleColumnKeys = signal<string[]>(['title', 'type', 'modified', 'contributor']);
  readonly columnPanelOpen = signal(false);
  readonly pendingColumnKeys = signal<string[]>(['title', 'type', 'modified', 'contributor']);

  readonly columnsForPanel = ALL_COLUMNS;
  readonly SORTABLE_COLUMNS = SORTABLE_COLUMNS;

  readonly visibleColumns = computed(() =>
    ALL_COLUMNS.filter((c) => this.visibleColumnKeys().includes(c.key)),
  );

  readonly gridTemplate = computed(() =>
    ['40px', ...this.visibleColumns().map((c) => c.width), '80px'].join(' '),
  );

  readonly resultCount = computed(() => this.documents().length);
  readonly selectedCount = computed(() => this.selectionService.selectedCount());

  readonly isAllSelected = computed(() =>
    this.selectionService.isAllSelected(this.documents().map((d) => d.uid)),
  );

  readonly isIndeterminate = computed(() =>
    this.selectionService.isIndeterminate(this.documents().map((d) => d.uid)),
  );

  readonly actionInProgress = signal<Set<string>>(new Set());
  readonly thumbnailMap = signal<Record<string, SafeUrl>>({});
  readonly saving = signal(false);
  readonly deletingSavedSearch = signal(false);

  constructor() {
    effect(
      () => {
        this.trashFilterService.filters();
        this.sortBy();
        this.sortDir();
        untracked(() => this.search());
      },
      { allowSignalWrites: true },
    );
  }

  search(): void {
    this.loading.set(true);
    this.error.set(null);
    this.trashFilterService.resultsLoading.set(true);
    const f = this.trashFilterService.filters();
    const sortField = SORT_FIELD_MAP[this.sortBy()] ?? 'dc:created';
    this.trashService
      .searchTrash({
        fullText: f.fullText,
        path: f.path,
        author: f.author,
        sizeRanges: f.sizeRanges,
        sortBy: sortField,
        sortOrder: this.sortDir(),
        pageSize: 100,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: NuxeoDocumentList) => {
          const entries = res.entries ?? [];
          this.documents.set(entries);
          this.totalResults.set(res.resultsCount ?? entries.length);
          this.loading.set(false);
          this.trashFilterService.resultsLoading.set(false);
          this.trashFilterService.results.set(
            entries.map((d) => ({ uid: d.uid, title: d.title, type: d.type })),
          );
          this.trashFilterService.totalResults.set(res.resultsCount ?? entries.length);
          this.loadThumbnails(entries);
        },
        error: () => {
          this.error.set('Failed to load trashed documents.');
          this.loading.set(false);
          this.trashFilterService.resultsLoading.set(false);
        },
      });
  }

  docIcon(doc: NuxeoDocument): string {
    return docTypeIcon(doc.type);
  }

  saveAsSearch(): void {
    const dialogRef = this.dialog.open(SavedSearchDialogComponent, {
      ...SAVED_SEARCH_DIALOG_OPTIONS,
      data: {
        title: 'Saved Search',
        placeholder: 'Enter a name for your saved search',
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((name): name is string => !!name?.trim()),
        switchMap((name) => {
          this.saving.set(true);
          return this.trashService.saveSearch(name.trim(), this.buildFilterParams()).pipe(
            finalize(() => this.saving.set(false)),
            catchError(() => {
              this.snackBar.open('Failed to save search.', 'Dismiss', { duration: 5000 });
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        if (!result) return;
        this.trashFilterService.activeSavedFilterUid.set(result.uid);
        this.trashFilterService.activeSavedFilterTitle.set(result.title);
        this.trashFilterService.markSavedSearchDirty();
        this.snackBar.open(`Search "${result.title}" saved.`, 'OK', { duration: 3000 });
      });
  }

  saveSearch(): void {
    const uid = this.trashFilterService.activeSavedFilterUid();
    const title = this.trashFilterService.activeSavedFilterTitle();
    if (!uid || !title) return;

    this.saving.set(true);
    this.trashService
      .updateSearch(uid, title, this.buildFilterParams())
      .pipe(
        finalize(() => this.saving.set(false)),
        catchError(() => {
          this.snackBar.open('Failed to save search.', 'Dismiss', { duration: 5000 });
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        if (!result) return;
        this.trashFilterService.markSavedSearchDirty();
        this.snackBar.open(`Search "${title}" updated.`, 'OK', { duration: 3000 });
      });
  }

  onEditSelectedSavedSearch(): void {
    const uid = this.trashFilterService.activeSavedFilterUid();
    const title = this.trashFilterService.activeSavedFilterTitle();
    if (!uid || !title) return;

    this.dialog
      .open(SavedSearchDialogComponent, {
        ...SAVED_SEARCH_DIALOG_OPTIONS,
        data: {
          title: 'Edit Saved Search',
          placeholder: 'Enter a name for your saved search',
          initialValue: title.trim(),
        },
      })
      .afterClosed()
      .pipe(
        map((newTitle: unknown) => (typeof newTitle === 'string' ? newTitle.trim() : '')),
        filter((trimmedTitle): trimmedTitle is string => !!trimmedTitle),
        switchMap((trimmedTitle) =>
          this.trashService
            .updateSearch(uid, trimmedTitle, this.buildFilterParams())
            .pipe(map(() => trimmedTitle)),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (trimmedTitle) => {
          this.trashFilterService.activeSavedFilterTitle.set(trimmedTitle);
          this.trashFilterService.markSavedSearchDirty();
          this.snackBar.open(`Search "${trimmedTitle}" updated.`, 'OK', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Failed to update search.', 'Dismiss', { duration: 5000 });
        },
      });
  }

  onShareSelectedSavedSearch(): void {
    const id = this.trashFilterService.activeSavedFilterUid()?.trim();
    if (!id) return;

    this.dialog.open(ShareSavedSearchDialogComponent, {
      width: '95vw',
      maxWidth: '1080px',
      data: {
        title: this.trashFilterService.activeSavedFilterTitle()?.trim() || 'Saved Search',
        id,
      },
    });
  }

  onDeleteSelectedSavedSearch(): void {
    const uid = this.trashFilterService.activeSavedFilterUid();
    const title = this.trashFilterService.activeSavedFilterTitle();
    if (!uid || !title || this.deletingSavedSearch()) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Saved Search',
        message: `Delete saved search "${title.trim()}"?`,
        confirmLabel: 'Delete',
      } as ConfirmDialogData,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;

        this.deletingSavedSearch.set(true);
        this.searchService
          .deleteSavedSearch(uid)
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.deletingSavedSearch.set(false)),
          )
          .subscribe({
            next: () => {
              this.trashFilterService.reset();
              this.trashFilterService.markSavedSearchDirty();
              this.snackBar.open(`Search "${title}" deleted.`, 'OK', { duration: 3000 });
            },
            error: () => {
              this.snackBar.open('Failed to delete search.', 'Dismiss', { duration: 5000 });
            },
          });
      });
  }

  private buildFilterParams(): Record<string, unknown> {
    const f = this.trashFilterService.filters();
    const params: Record<string, unknown> = {};
    if (f.fullText) params['ecm_fulltext'] = f.fullText;
    if (f.path && f.path !== '/') params['ecm_path'] = f.path;
    if (f.author) params['dc_creator'] = f.author;
    if (f.sizeRanges.length > 0) params['common_size'] = f.sizeRanges;
    return params;
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  setSortBy(value: string): void {
    this.sortBy.set(value);
    this.search();
  }

  toggleSortDir(): void {
    this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    this.search();
  }

  sortByColumn(key: string): void {
    if (!SORTABLE_COLUMNS.has(key)) return;
    if (this.sortBy() === key) {
      this.toggleSortDir();
    } else {
      this.sortBy.set(key);
      this.sortDir.set('asc');
      this.search();
    }
  }

  openDocument(uid: string): void {
    if (!uid) return;
    void this.router.navigateByUrl(`/doc/${uid}`);
  }

  getCellValue(doc: NuxeoDocument, key: string): string {
    const props = doc.properties ?? {};
    switch (key) {
      case 'title':
        return doc.title ?? (props['dc:title'] as string | undefined) ?? '';
      case 'type':
        return doc.type ?? '';
      case 'modified':
        return (props['dc:modified'] as string | undefined) ?? '';
      case 'contributor':
        return (props['dc:lastContributor'] as string | undefined) ?? '';
      case 'created':
        return (props['dc:created'] as string | undefined) ?? '';
      case 'author':
        return (props['dc:creator'] as string | undefined) ?? '';
      case 'state':
        return doc.state ?? '';
      default:
        return '';
    }
  }

  isSelected(id: string): boolean {
    return this.selectionService.isSelected(id);
  }

  toggleSelection(id: string): void {
    const doc = this.documents().find((d) => d.uid === id);
    this.selectionService.toggle(id, doc?.title ?? id, this.thumbnailMap()[id] ?? null);
  }

  toggleAll(): void {
    if (this.isAllSelected()) {
      this.selectionService.clear();
    } else {
      const docs = this.documents();
      const labels: Record<string, string> = {};
      const previews: Record<string, SafeUrl | null> = {};
      docs.forEach((doc) => {
        labels[doc.uid] = doc.title;
        previews[doc.uid] = this.thumbnailMap()[doc.uid] ?? null;
      });
      this.selectionService.selectAll(
        docs.map((d) => d.uid),
        labels,
        previews,
      );
    }
  }

  restoreSelected(): void {
    const ids = [...this.selectionService.selectedIds()];
    if (ids.length === 0) return;
    const inProgress = new Set(this.actionInProgress());
    ids.forEach((id) => inProgress.add(id));
    this.actionInProgress.set(inProgress);

    let completed = 0;
    for (const uid of ids) {
      this.trashService
        .restoreDocument(uid)
        .pipe(
          finalize(() => {
            this.markInProgress(uid, false);
            completed++;
            if (completed === ids.length) {
              this.selectionService.clear();
              this.snackBar.open(`${ids.length} document(s) restored.`, 'OK', { duration: 3000 });
            }
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: () => this.documents.update((docs) => docs.filter((d) => d.uid !== uid)),
          error: () =>
            this.snackBar.open('Failed to restore a document.', 'Dismiss', { duration: 3000 }),
        });
    }
  }

  deleteSelected(): void {
    const ids = [...this.selectionService.selectedIds()];
    if (ids.length === 0) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Permanently Delete Documents',
        message: `Permanently delete ${ids.length} document(s)? This cannot be undone.`,
        confirmLabel: 'Delete',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      const inProgress = new Set(this.actionInProgress());
      ids.forEach((id) => inProgress.add(id));
      this.actionInProgress.set(inProgress);

      let completed = 0;
      for (const uid of ids) {
        this.trashService
          .permanentlyDelete(uid)
          .pipe(
            finalize(() => {
              this.markInProgress(uid, false);
              completed++;
              if (completed === ids.length) {
                this.selectionService.clear();
                this.snackBar.open(`${ids.length} document(s) permanently deleted.`, 'OK', {
                  duration: 3000,
                });
              }
            }),
            takeUntilDestroyed(this.destroyRef),
          )
          .subscribe({
            next: () => this.documents.update((docs) => docs.filter((d) => d.uid !== uid)),
            error: () =>
              this.snackBar.open('Failed to delete a document.', 'Dismiss', { duration: 3000 }),
          });
      }
    });
  }

  restoreDocument(uid: string, event?: Event): void {
    event?.stopPropagation();
    if (this.actionInProgress().has(uid)) return;
    this.markInProgress(uid, true);
    this.trashService
      .restoreDocument(uid)
      .pipe(
        finalize(() => this.markInProgress(uid, false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Document restored.', 'OK', { duration: 3000 });
          this.documents.update((docs) => docs.filter((d) => d.uid !== uid));
        },
        error: () =>
          this.snackBar.open('Failed to restore document.', 'Dismiss', { duration: 5000 }),
      });
  }

  permanentlyDelete(uid: string, event?: Event): void {
    event?.stopPropagation();
    if (this.actionInProgress().has(uid)) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Permanently Delete Document',
        message: 'Permanently delete this document? This cannot be undone.',
        confirmLabel: 'Delete',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.markInProgress(uid, true);
      this.trashService
        .permanentlyDelete(uid)
        .pipe(
          finalize(() => this.markInProgress(uid, false)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: () => {
            this.snackBar.open('Document permanently deleted.', 'OK', { duration: 3000 });
            this.documents.update((docs) => docs.filter((d) => d.uid !== uid));
          },
          error: () =>
            this.snackBar.open('Failed to delete document.', 'Dismiss', { duration: 5000 }),
        });
    });
  }

  isPendingColumn(key: string): boolean {
    return this.pendingColumnKeys().includes(key);
  }

  togglePendingColumn(key: string): void {
    const current = this.pendingColumnKeys();
    if (current.includes(key)) {
      this.pendingColumnKeys.set(current.filter((k) => k !== key));
    } else {
      const ordered = ALL_COLUMNS.map((c) => c.key);
      this.pendingColumnKeys.set(ordered.filter((k) => [...current, key].includes(k)));
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
    this.pendingColumnKeys.set(['title', 'type', 'modified', 'contributor']);
  }

  applyColumns(): void {
    this.visibleColumnKeys.set(
      ALL_COLUMNS.map((c) => c.key).filter((k) => this.pendingColumnKeys().includes(k)),
    );
    this.columnPanelOpen.set(false);
  }

  exportCsv(): void {
    const escape = (v: string): string => `"${v.replaceAll('"', '""')}"`;
    const headers = ['Title', 'Type', 'Modified', 'Last Contributor', 'Created', 'Author', 'State'];
    const rows = this.documents().map((doc) =>
      [
        this.getCellValue(doc, 'title'),
        this.getCellValue(doc, 'type'),
        this.getCellValue(doc, 'modified'),
        this.getCellValue(doc, 'contributor'),
        this.getCellValue(doc, 'created'),
        this.getCellValue(doc, 'author'),
        this.getCellValue(doc, 'state'),
      ].map((c) => escape(c)),
    );
    const csv = [headers.map((h) => escape(h)), ...rows].map((l) => l.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trash-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  private markInProgress(uid: string, add: boolean): void {
    this.actionInProgress.update((s) => {
      const next = new Set(s);
      if (add) next.add(uid);
      else next.delete(uid);
      return next;
    });
  }

  private loadThumbnails(docs: NuxeoDocument[]): void {
    for (const doc of docs) {
      if (this.thumbnailMap()[doc.uid]) continue;
      this.detailService
        .fetchThumbnail(doc.uid)
        .pipe(catchError(() => of(null)))
        .subscribe((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const safeUrl = this.sanitizer.bypassSecurityTrustUrl(url);
          this.thumbnailMap.update((m) => ({ ...m, [doc.uid]: safeUrl }));
          this.trashFilterService.resultThumbnails.update((m) => ({ ...m, [doc.uid]: safeUrl }));
        });
    }
  }
}
