import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import {
  type DashboardConfig,
  type DashboardWidgetConfig,
  type DashboardWidgetType,
  createDefaultDashboard,
  ConfigStorageService,
} from '@agentic-ui/shared/nuxeo-studio';

const WIDGET_TYPES: { value: DashboardWidgetType; label: string; icon: string }[] = [
  { value: 'recent-documents', label: 'Recently Updated', icon: 'update' },
  { value: 'tasks', label: 'Pending Tasks', icon: 'assignment' },
  { value: 'favorites', label: 'Favorites', icon: 'star' },
  { value: 'collections', label: 'Collections', icon: 'library_books' },
  { value: 'saved-searches', label: 'Saved Searches', icon: 'saved_search' },
  { value: 'analytics', label: 'Analytics', icon: 'analytics' },
  { value: 'custom', label: 'Custom Widget', icon: 'widgets' },
];

@Component({
  selector: 'lib-dashboard-designer-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatSlideToggleModule,
    DragDropModule,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardDesignerPageComponent {
  private readonly storage = inject(ConfigStorageService);
  private readonly snackBar = inject(MatSnackBar);

  readonly widgetTypes = WIDGET_TYPES;
  readonly dashboard = signal<DashboardConfig>(
    this.storage.getDashboard() ?? createDefaultDashboard(),
  );
  readonly selectedWidget = signal<DashboardWidgetConfig | null>(null);
  readonly saving = signal(false);

  save(): void {
    this.saving.set(true);
    this.storage.saveDashboardAsync(this.dashboard()).subscribe({
      next: () => {
        this.saving.set(false);
        this.snackBar.open('Dashboard saved to server', 'OK', { duration: 2000 });
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open('Save failed — cached locally', 'Dismiss', { duration: 4000 });
      },
    });
  }

  resetToDefault(): void {
    const def = createDefaultDashboard();
    this.dashboard.set(def);
    this.saving.set(true);
    this.storage.saveDashboardAsync(def).subscribe({
      next: () => {
        this.saving.set(false);
        this.selectedWidget.set(null);
        this.snackBar.open('Dashboard reset to defaults', 'OK', { duration: 2000 });
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open('Reset saved locally', 'OK', { duration: 2000 });
      },
    });
  }

  updateColumns(columns: number): void {
    this.dashboard.update((d) => ({ ...d, columns }));
  }

  addWidget(type: DashboardWidgetType): void {
    const wt = WIDGET_TYPES.find((w) => w.value === type);
    const widget: DashboardWidgetConfig = {
      id: crypto.randomUUID(),
      type,
      label: wt?.label ?? type,
      icon: wt?.icon ?? 'widgets',
      row: 0,
      col: 0,
      width: 1,
      height: 1,
      properties: {},
      available: true,
    };
    this.dashboard.update((d) => ({
      ...d,
      widgets: [...d.widgets, widget],
    }));
    this.selectedWidget.set(widget);
  }

  removeWidget(id: string): void {
    this.dashboard.update((d) => ({
      ...d,
      widgets: d.widgets.filter((w) => w.id !== id),
    }));
    if (this.selectedWidget()?.id === id) {
      this.selectedWidget.set(null);
    }
  }

  selectWidget(widget: DashboardWidgetConfig): void {
    this.selectedWidget.set(this.selectedWidget()?.id === widget.id ? null : widget);
  }

  updateWidgetProp(id: string, prop: string, value: unknown): void {
    this.dashboard.update((d) => ({
      ...d,
      widgets: d.widgets.map((w) => (w.id === id ? { ...w, [prop]: value } : w)),
    }));
    const sel = this.selectedWidget();
    if (sel?.id === id) {
      this.selectedWidget.set({ ...sel, [prop]: value } as DashboardWidgetConfig);
    }
  }

  toggleWidget(id: string): void {
    this.dashboard.update((d) => ({
      ...d,
      widgets: d.widgets.map((w) => (w.id === id ? { ...w, available: !w.available } : w)),
    }));
  }

  onWidgetDrop(event: CdkDragDrop<DashboardWidgetConfig[]>): void {
    this.dashboard.update((d) => {
      const widgets = [...d.widgets];
      moveItemInArray(widgets, event.previousIndex, event.currentIndex);
      return { ...d, widgets };
    });
  }
}
