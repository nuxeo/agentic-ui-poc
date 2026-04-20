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
  type DrawerItemConfig,
  createDefaultDrawerItem,
  ConfigStorageService,
  PlatformRegistryService,
} from '@agentic-ui/shared/nuxeo-studio';

@Component({
  selector: 'lib-drawer-page',
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
  templateUrl: './drawer-page.component.html',
  styleUrl: './drawer-page.component.scss',
})
export class DrawerPageComponent {
  private readonly storage = inject(ConfigStorageService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly platformRegistry = inject(PlatformRegistryService);

  /** All document type names from the platform for filter suggestions. */
  readonly platformDocTypes = this.platformRegistry.allDocTypes;

  readonly items = signal<DrawerItemConfig[]>(this.storage.getDrawerItems());
  readonly editingItem = signal<DrawerItemConfig | null>(null);
  readonly saving = signal(false);

  createItem(): void {
    this.editingItem.set(createDefaultDrawerItem());
  }

  editItem(item: DrawerItemConfig): void {
    this.editingItem.set(JSON.parse(JSON.stringify(item)));
  }

  saveItem(): void {
    const editing = this.editingItem();
    if (!editing) return;

    const all = [...this.items()];
    const idx = all.findIndex((i) => i.id === editing.id);
    if (idx >= 0) {
      all[idx] = editing;
    } else {
      all.push(editing);
    }
    this.items.set(all);
    this.saving.set(true);
    this.storage.saveDrawerItemsAsync(all).subscribe({
      next: () => {
        this.saving.set(false);
        this.editingItem.set(null);
        this.snackBar.open('Drawer item saved to server', 'OK', { duration: 2000 });
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open('Save failed — cached locally', 'Dismiss', { duration: 4000 });
      },
    });
  }

  get canSave(): boolean {
    const i = this.editingItem();
    if (!i) return false;
    return !!(i.label && i.name);
  }

  cancelEdit(): void {
    this.editingItem.set(null);
  }

  deleteItem(id: string): void {
    const all = this.items().filter((i) => i.id !== id);
    this.items.set(all);
    this.storage.saveDrawerItemsAsync(all).subscribe({
      next: () => this.snackBar.open('Drawer item deleted', 'OK', { duration: 2000 }),
      error: () => this.snackBar.open('Delete saved locally', 'OK', { duration: 2000 }),
    });
    if (this.editingItem()?.id === id) {
      this.editingItem.set(null);
    }
  }

  toggleItem(item: DrawerItemConfig): void {
    const all = this.items().map((i) => (i.id === item.id ? { ...i, available: !i.available } : i));
    this.items.set(all);
    this.storage.saveDrawerItemsAsync(all).subscribe();
  }

  updateTop(prop: string, value: unknown): void {
    const i = this.editingItem();
    if (!i) return;
    this.editingItem.set({ ...i, [prop]: value });
  }

  updateFilter(field: string, value: string): void {
    const i = this.editingItem();
    if (!i) return;
    const arr = value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    this.editingItem.set({
      ...i,
      filters: { ...i.filters, [field]: arr.length > 0 ? arr : undefined },
    });
  }

  getFilterValue(field: string): string {
    const i = this.editingItem();
    if (!i) return '';
    const filters = i.filters as Record<string, string[] | undefined>;
    return (filters[field] ?? []).join(', ');
  }
}
