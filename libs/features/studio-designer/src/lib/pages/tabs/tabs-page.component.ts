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

import {
  type TabConfig,
  type LayoutMode,
  createDefaultTab,
  ConfigStorageService,
  PlatformRegistryService,
} from '@agentic-ui/shared/nuxeo-studio';

@Component({
  selector: 'lib-tabs-page',
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
  ],
  templateUrl: './tabs-page.component.html',
  styleUrl: './tabs-page.component.scss',
})
export class TabsPageComponent {
  private readonly storage = inject(ConfigStorageService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly platformRegistry = inject(PlatformRegistryService);

  /** All document type names from the platform for filter suggestions. */
  readonly platformDocTypes = this.platformRegistry.allDocTypes;

  readonly contentModes: Array<{ value: LayoutMode | 'custom'; label: string }> = [
    { value: 'view', label: 'View Layout' },
    { value: 'edit', label: 'Edit Layout' },
    { value: 'metadata', label: 'Metadata Layout' },
    { value: 'custom', label: 'Custom Element' },
  ];

  readonly tabs = signal<TabConfig[]>(this.storage.getTabs());
  readonly editingTab = signal<TabConfig | null>(null);
  readonly saving = signal(false);

  createTab(): void {
    this.editingTab.set(createDefaultTab());
  }

  editTab(tab: TabConfig): void {
    this.editingTab.set(JSON.parse(JSON.stringify(tab)));
  }

  saveTab(): void {
    const editing = this.editingTab();
    if (!editing) return;

    const all = [...this.tabs()];
    const idx = all.findIndex((t) => t.id === editing.id);
    if (idx >= 0) {
      all[idx] = editing;
    } else {
      all.push(editing);
    }
    this.tabs.set(all);
    this.saving.set(true);
    this.storage.saveTabsAsync(all).subscribe({
      next: () => {
        this.saving.set(false);
        this.editingTab.set(null);
        this.snackBar.open('Tab saved to server', 'OK', { duration: 2000 });
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open('Save failed — cached locally', 'Dismiss', { duration: 4000 });
      },
    });
  }

  get canSave(): boolean {
    const t = this.editingTab();
    if (!t) return false;
    return !!(t.label && t.name);
  }

  cancelEdit(): void {
    this.editingTab.set(null);
  }

  deleteTab(id: string): void {
    const all = this.tabs().filter((t) => t.id !== id);
    this.tabs.set(all);
    this.storage.saveTabsAsync(all).subscribe({
      next: () => this.snackBar.open('Tab deleted', 'OK', { duration: 2000 }),
      error: () => this.snackBar.open('Delete saved locally', 'OK', { duration: 2000 }),
    });
    if (this.editingTab()?.id === id) {
      this.editingTab.set(null);
    }
  }

  toggleTab(tab: TabConfig): void {
    const all = this.tabs().map((t) => (t.id === tab.id ? { ...t, available: !t.available } : t));
    this.tabs.set(all);
    this.storage.saveTabsAsync(all).subscribe();
  }

  updateTop(prop: string, value: unknown): void {
    const t = this.editingTab();
    if (!t) return;
    this.editingTab.set({ ...t, [prop]: value });
  }

  updateFilter(field: string, value: string): void {
    const t = this.editingTab();
    if (!t) return;
    const arr = value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    this.editingTab.set({
      ...t,
      filters: { ...t.filters, [field]: arr.length > 0 ? arr : undefined },
    });
  }

  getFilterValue(field: string): string {
    const t = this.editingTab();
    if (!t) return '';
    const filters = t.filters as Record<string, string[] | undefined>;
    return (filters[field] ?? []).join(', ');
  }
}
