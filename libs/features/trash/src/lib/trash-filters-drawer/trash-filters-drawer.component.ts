import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { catchError, filter, finalize, switchMap } from 'rxjs/operators';

import { SaveSearchDialogComponent } from '../save-search-dialog/save-search-dialog.component';

import {
  TrashFilterService,
  TrashService,
  DocumentDetailService,
  docTypeIcon,
  type NuxeoDocument,
  type UserGroupSuggestion,
  type SavedSearch,
} from '@agentic-ui/shared/nuxeo-client';

interface SizeOption {
  key: string;
  value: string;
  label: string;
  count: number;
}

interface AuthorOption {
  id: string;
  label: string;
  count: number;
}

const SIZE_LABELS: Record<string, string> = {
  tiny: 'Less than 100 KB',
  small: 'Between 100 KB and 1 MB',
  medium: 'Between 1 MB and 10 MB',
  large: 'Between 10 MB and 100 MB',
  huge: 'More than 100 MB',
};

@Component({
  selector: 'lib-trash-filters-drawer',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './trash-filters-drawer.component.html',
  styleUrl: './trash-filters-drawer.component.scss',
})
export class TrashFiltersDrawerComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  readonly trashFilterService = inject(TrashFilterService);
  private readonly trashService = inject(TrashService);
  private readonly detailService = inject(DocumentDetailService);

  readonly sizeOptions = signal<SizeOption[]>([]);
  readonly authorOptions = signal<AuthorOption[]>([]);

  readonly fullText = signal('');
  readonly pathInput = signal('/');
  readonly authorInput = signal('');
  readonly selectedSizes = signal<Set<string>>(new Set());

  readonly pathOpen = signal(false);
  readonly pathSuggestions = signal<NuxeoDocument[]>([]);
  readonly pathLoading = signal(false);

  readonly authorOpen = signal(false);
  readonly authorSuggestions = signal<UserGroupSuggestion[]>([]);

  readonly sizeExpanded = signal(true);

  readonly savedFilterDropdownOpen = signal(false);
  readonly savedFilterSearch = signal('');
  readonly savedFilters = signal<SavedSearch[]>([]);
  readonly saving = signal(false);

  readonly filteredSavedFilters = computed(() => {
    const q = this.savedFilterSearch().toLowerCase();
    return this.savedFilters().filter((f) => f.title.toLowerCase().includes(q));
  });

  readonly hasActiveFilters = computed(() => {
    const f = this.trashFilterService.filters();
    return f.fullText !== '' || f.path !== '/' || f.author !== '' || f.sizeRanges.length > 0;
  });

  ngOnInit(): void {
    this.ensureTrashRoute();
    this.loadAggregatedCounts();
    this.loadSavedSearches();
  }

  private loadSavedSearches(): void {
    this.trashService
      .getSavedSearches()
      .pipe(catchError(() => of([] as SavedSearch[])))
      .subscribe((results) => this.savedFilters.set(results));
  }

  private loadAggregatedCounts(): void {
    this.trashService
      .searchTrash({ pageSize: 200 })
      .pipe(catchError(() => of({ entries: [] as NuxeoDocument[] })))
      .subscribe((res) => {
        const entries = (res as { entries: NuxeoDocument[] }).entries ?? [];
        this.computeSizeCounts(entries);
        this.computeAuthorCounts(entries);
      });
  }

  private computeSizeCounts(entries: NuxeoDocument[]): void {
    const counts: Record<string, number> = { tiny: 0, small: 0, medium: 0, large: 0, huge: 0 };
    for (const doc of entries) {
      const fileContent = doc.properties?.['file:content'] as { length?: number } | null;
      const size = fileContent?.length ?? 0;
      if (size < 102400) counts['tiny']++;
      else if (size < 1048576) counts['small']++;
      else if (size < 10485760) counts['medium']++;
      else if (size < 104857600) counts['large']++;
      else counts['huge']++;
    }
    this.sizeOptions.set(
      Object.entries(SIZE_LABELS).map(([key, label]) => ({
        key,
        value: key,
        label,
        count: counts[key] ?? 0,
      })),
    );
  }

  private computeAuthorCounts(entries: NuxeoDocument[]): void {
    const map = new Map<string, number>();
    for (const doc of entries) {
      const creator = (doc.properties?.['dc:creator'] as string) ?? '';
      if (creator) {
        map.set(creator, (map.get(creator) ?? 0) + 1);
      }
    }
    this.authorOptions.set(
      Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([id, count]) => ({ id, label: id, count })),
    );
  }

  toggleLayout(): void {
    this.trashFilterService.toggleLayout();
  }

  docIcon(type: string): string {
    return docTypeIcon(type);
  }

  openDocument(uid: string): void {
    void this.router.navigateByUrl(`/doc/${uid}`);
  }

  toggleSavedFilterDropdown(): void {
    this.savedFilterDropdownOpen.update((v) => !v);
  }

  closeSavedFilterDropdown(): void {
    setTimeout(() => this.savedFilterDropdownOpen.set(false), 200);
  }

  selectSavedFilter(filter: SavedSearch): void {
    this.savedFilterDropdownOpen.set(false);
    this.trashFilterService.activeSavedFilterUid.set(filter.uid);
    this.trashFilterService.activeSavedFilterTitle.set(filter.title);

    const p = filter.params ?? {};

    const fullText = this.extractParam(p, 'ecm_fulltext', '');
    const path = this.extractParam(p, 'ecm_path', '/') || '/';
    const author = this.extractParam(p, 'dc_creator', '');
    const sizeRaw = this.extractParamArray(p, 'common_size');

    this.fullText.set(fullText);
    this.pathInput.set(path);
    this.authorInput.set(author);
    this.selectedSizes.set(new Set(sizeRaw));

    this.trashFilterService.filters.set({
      fullText,
      path,
      author,
      sizeRanges: sizeRaw,
    });
    this.ensureTrashRoute();
  }

  private extractParam(params: Record<string, unknown>, key: string, fallback: string): string {
    for (const prefix of ['', 'defaults:']) {
      const val = params[`${prefix}${key}`];
      if (typeof val === 'string' && val.trim()) return val.trim();
    }
    return fallback;
  }

  private extractParamArray(params: Record<string, unknown>, key: string): string[] {
    for (const prefix of ['', 'defaults:']) {
      const val = params[`${prefix}${key}`];
      if (Array.isArray(val)) return val as string[];
    }
    return [];
  }

  onFullTextChange(value: string): void {
    this.fullText.set(value);
    this.updateFilters();
  }

  onFullTextClear(): void {
    this.fullText.set('');
    this.updateFilters();
  }

  onPathInput(value: string): void {
    this.pathInput.set(value);
    if (value.length >= 1) {
      this.pathLoading.set(true);
      this.trashService
        .getPathSuggestions(value)
        .pipe(catchError(() => of({ entries: [] as NuxeoDocument[] })))
        .subscribe((res) => {
          this.pathSuggestions.set(res.entries);
          this.pathLoading.set(false);
          this.pathOpen.set(true);
        });
    } else {
      this.pathSuggestions.set([]);
    }
  }

  onPathFocus(): void {
    const current = this.pathInput() || '/';
    this.onPathInput(current);
  }

  selectPath(doc: NuxeoDocument): void {
    this.pathInput.set(doc.path + '/');
    this.pathOpen.set(false);
    this.updateFilters();
    setTimeout(() => this.onPathInput(doc.path + '/'), 100);
  }

  closePathDropdown(): void {
    setTimeout(() => this.pathOpen.set(false), 200);
  }

  onPathKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.pathOpen.set(false);
      this.updateFilters();
    }
  }

  readonly filteredAuthorOptions = computed(() => {
    const q = this.authorInput().toLowerCase();
    if (!q) return this.authorOptions();
    return this.authorOptions().filter((a) => a.label.toLowerCase().includes(q));
  });

  onAuthorFocus(): void {
    this.authorOpen.set(true);
  }

  onAuthorInput(value: string): void {
    this.authorInput.set(value);
    this.authorOpen.set(true);
  }

  selectAuthorOption(option: AuthorOption): void {
    this.authorInput.set(option.id);
    this.authorOpen.set(false);
    this.updateFilters();
  }

  selectAuthor(suggestion: UserGroupSuggestion): void {
    this.authorInput.set(suggestion.id);
    this.authorOpen.set(false);
    this.updateFilters();
  }

  closeAuthorDropdown(): void {
    setTimeout(() => {
      this.authorOpen.set(false);
      this.updateFilters();
    }, 200);
  }

  isSizeSelected(value: string): boolean {
    return this.selectedSizes().has(value);
  }

  toggleSize(value: string): void {
    const next = new Set(this.selectedSizes());
    if (next.has(value)) next.delete(value);
    else next.add(value);
    this.selectedSizes.set(next);
    this.updateFilters();
  }

  toggleSizeExpanded(): void {
    this.sizeExpanded.update((v) => !v);
  }

  saveCurrentSearch(): void {
    const dialogRef = this.dialog.open(SaveSearchDialogComponent, {
      width: '480px',
      autoFocus: true,
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
      )
      .subscribe((result) => {
        if (!result) return;
        this.trashFilterService.activeSavedFilterUid.set(result.uid);
        this.trashFilterService.activeSavedFilterTitle.set(result.title);
        this.snackBar.open(`Search "${result.title}" saved.`, 'OK', { duration: 3000 });
        this.loadSavedSearches();
      });
  }

  private buildFilterParams(): Record<string, unknown> {
    const params: Record<string, unknown> = {};
    if (this.fullText()) params['ecm_fulltext'] = this.fullText();
    if (this.pathInput() && this.pathInput() !== '/') params['ecm_path'] = this.pathInput();
    if (this.authorInput()) params['dc_creator'] = this.authorInput();
    const sizes = [...this.selectedSizes()];
    if (sizes.length > 0) params['common_size'] = sizes;
    return params;
  }

  saveExistingSearch(): void {
    const uid = this.trashFilterService.activeSavedFilterUid();
    const title = this.trashFilterService.activeSavedFilterTitle();
    if (!uid || !title) return;

    this.saving.set(true);
    const params = this.buildFilterParams();

    this.trashService
      .updateSearch(uid, title, params)
      .pipe(
        finalize(() => this.saving.set(false)),
        catchError(() => {
          this.snackBar.open('Failed to save search.', 'Dismiss', { duration: 5000 });
          return of(null);
        }),
      )
      .subscribe((result) => {
        if (!result) return;
        this.snackBar.open(`Search "${title}" saved.`, 'OK', { duration: 3000 });
        this.loadSavedSearches();
      });
  }

  resetFilters(): void {
    this.fullText.set('');
    this.pathInput.set('/');
    this.authorInput.set('');
    this.selectedSizes.set(new Set());
    this.trashFilterService.reset();
    this.ensureTrashRoute();
  }

  private updateFilters(): void {
    this.trashFilterService.filters.set({
      fullText: this.fullText(),
      path: this.pathInput() || '/',
      author: this.authorInput(),
      sizeRanges: [...this.selectedSizes()],
    });
    this.ensureTrashRoute();
  }

  private ensureTrashRoute(): void {
    if (!this.router.url.startsWith('/trash')) {
      void this.router.navigateByUrl('/trash');
    }
  }
}
