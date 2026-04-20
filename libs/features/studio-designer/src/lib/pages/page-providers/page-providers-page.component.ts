import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import {
  type SearchConfig,
  type SearchFieldConfig,
  type ResultColumnConfig,
  type WidgetType,
  createDefaultSearch,
  ConfigStorageService,
  PlatformRegistryService,
} from '@agentic-ui/shared/nuxeo-studio';

const WIDGET_OPTIONS: WidgetType[] = [
  'text',
  'number',
  'date',
  'checkbox',
  'directory',
  'select',
  'usergroup',
  'tag',
];

const OPERATORS = ['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'IN', 'BETWEEN', 'FULLTEXT'];

@Component({
  selector: 'lib-page-providers-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatDividerModule,
    DragDropModule,
  ],
  templateUrl: './page-providers-page.component.html',
  styleUrl: './page-providers-page.component.scss',
})
export class PageProvidersPageComponent {
  private readonly storage = inject(ConfigStorageService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly platformRegistry = inject(PlatformRegistryService);

  readonly widgetOptions = WIDGET_OPTIONS;
  readonly operators = OPERATORS;

  readonly searches = signal<SearchConfig[]>(this.storage.getSearches());
  readonly editingSearch = signal<SearchConfig | null>(null);
  readonly saving = signal(false);

  /** Platform-registered page providers for reference/linking. */
  readonly platformPageProviders = this.platformRegistry.pageProviders;
  /** All document type names from the platform. */
  readonly platformDocTypes = this.platformRegistry.allDocTypes;

  createSearch(): void {
    this.editingSearch.set(createDefaultSearch());
  }

  editSearch(search: SearchConfig): void {
    this.editingSearch.set(JSON.parse(JSON.stringify(search)));
  }

  saveSearch(): void {
    const editing = this.editingSearch();
    if (!editing) return;

    const all = [...this.searches()];
    const idx = all.findIndex((s) => s.id === editing.id);
    if (idx >= 0) {
      all[idx] = editing;
    } else {
      all.push(editing);
    }
    this.searches.set(all);
    this.saving.set(true);
    this.storage.saveSearchesAsync(all).subscribe({
      next: () => {
        this.saving.set(false);
        this.editingSearch.set(null);
        this.snackBar.open('Search config saved to server', 'OK', { duration: 2000 });
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open('Save failed — cached locally', 'Dismiss', { duration: 4000 });
      },
    });
  }

  get canSave(): boolean {
    const s = this.editingSearch();
    if (!s) return false;
    return !!(s.name && s.label);
  }

  cancelEdit(): void {
    this.editingSearch.set(null);
  }

  deleteSearch(id: string): void {
    const all = this.searches().filter((s) => s.id !== id);
    this.searches.set(all);
    this.storage.saveSearchesAsync(all).subscribe({
      next: () => this.snackBar.open('Search config deleted', 'OK', { duration: 2000 }),
      error: () => this.snackBar.open('Delete saved locally', 'OK', { duration: 2000 }),
    });
    if (this.editingSearch()?.id === id) {
      this.editingSearch.set(null);
    }
  }

  toggleSearch(search: SearchConfig): void {
    const all = this.searches().map((s) =>
      s.id === search.id ? { ...s, available: !s.available } : s,
    );
    this.searches.set(all);
    this.storage.saveSearchesAsync(all).subscribe();
  }

  updateTop(prop: string, value: unknown): void {
    const s = this.editingSearch();
    if (!s) return;
    this.editingSearch.set({ ...s, [prop]: value });
  }

  addSearchField(): void {
    const s = this.editingSearch();
    if (!s) return;
    const field: SearchFieldConfig = {
      xpath: '',
      label: '',
      widget: 'text',
      operator: '=',
    };
    this.editingSearch.set({ ...s, searchFields: [...s.searchFields, field] });
  }

  removeSearchField(idx: number): void {
    const s = this.editingSearch();
    if (!s) return;
    const fields = [...s.searchFields];
    fields.splice(idx, 1);
    this.editingSearch.set({ ...s, searchFields: fields });
  }

  updateSearchField(idx: number, prop: string, value: unknown): void {
    const s = this.editingSearch();
    if (!s) return;
    const fields = [...s.searchFields];
    fields[idx] = { ...fields[idx], [prop]: value };
    this.editingSearch.set({ ...s, searchFields: fields });
  }

  addResultColumn(): void {
    const s = this.editingSearch();
    if (!s) return;
    const col: ResultColumnConfig = {
      xpath: '',
      label: '',
      sortable: false,
    };
    this.editingSearch.set({ ...s, resultColumns: [...s.resultColumns, col] });
  }

  removeResultColumn(idx: number): void {
    const s = this.editingSearch();
    if (!s) return;
    const cols = [...s.resultColumns];
    cols.splice(idx, 1);
    this.editingSearch.set({ ...s, resultColumns: cols });
  }

  updateResultColumn(idx: number, prop: string, value: unknown): void {
    const s = this.editingSearch();
    if (!s) return;
    const cols = [...s.resultColumns];
    cols[idx] = { ...cols[idx], [prop]: value };
    this.editingSearch.set({ ...s, resultColumns: cols });
  }

  onFieldDrop(event: CdkDragDrop<SearchFieldConfig[]>): void {
    const s = this.editingSearch();
    if (!s) return;
    const fields = [...s.searchFields];
    moveItemInArray(fields, event.previousIndex, event.currentIndex);
    this.editingSearch.set({ ...s, searchFields: fields });
  }

  onColumnDrop(event: CdkDragDrop<ResultColumnConfig[]>): void {
    const s = this.editingSearch();
    if (!s) return;
    const cols = [...s.resultColumns];
    moveItemInArray(cols, event.previousIndex, event.currentIndex);
    this.editingSearch.set({ ...s, resultColumns: cols });
  }
}
