import { Component, inject, signal } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
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
  type ActionConfig,
  type ActionSlot,
  type ButtonType,
  type ElementBinding,
  type ActionAttributes,
  createDefaultAction,
  ConfigStorageService,
  PlatformRegistryService,
} from '@agentic-ui/shared/nuxeo-studio';

const TOOLTIP_POSITIONS: Array<ElementBinding['tooltipPosition']> = [
  'top',
  'bottom',
  'left',
  'right',
];

const INPUT_OPTIONS = ['[[document]]', '[[selection]]', '[[blob]]'];

@Component({
  selector: 'lib-buttons-page',
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
    KeyValuePipe,
  ],
  templateUrl: './buttons-page.component.html',
  styleUrl: './buttons-page.component.scss',
})
export class ButtonsPageComponent {
  private readonly storage = inject(ConfigStorageService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly platformRegistry = inject(PlatformRegistryService);

  readonly tooltipPositions = TOOLTIP_POSITIONS;
  readonly inputOptions = INPUT_OPTIONS;

  /** All document type names from the platform for filter autocomplete. */
  readonly platformDocTypes = this.platformRegistry.allDocTypes;

  readonly buttonTypeOptions: { value: ButtonType; label: string; description: string }[] = [
    {
      value: 'operation',
      label: 'Button',
      description: 'Configure a button and attach an automation operation, chain or script to it.',
    },
    {
      value: 'custom',
      label: 'Custom button',
      description:
        'Use code to create your custom element and bind it to a button. A typical example is displaying a confirmation dialog that will execute specific logic.',
    },
  ];

  readonly slotOptions: { value: ActionSlot; label: string }[] = [
    { value: 'BLOB_ACTIONS', label: 'Blob Actions' },
    { value: 'COLLECTION_ACTIONS', label: 'Collection Actions' },
    { value: 'DOCUMENT_ACTIONS', label: 'Document Actions' },
    { value: 'DOCUMENT_CREATE_ACTIONS', label: 'Document Create Actions' },
    { value: 'DOCUMENT_MORE_ACTIONS', label: 'Document More Actions' },
    { value: 'FILE_UPLOAD_ACTIONS', label: 'File Upload Actions' },
    { value: 'PUBLISH_PAGES', label: 'Publish Pages' },
    { value: 'RESULTS_ACTIONS', label: 'Results Actions' },
    { value: 'RESULTS_SELECTION_ACTIONS', label: 'Results Selection Actions' },
    { value: 'TRASH_RESULTS_SELECTION_ACTIONS', label: 'Trash Results Selection Actions' },
  ];

  readonly actions = signal<ActionConfig[]>(this.storage.getActions());
  readonly editingAction = signal<ActionConfig | null>(null);
  readonly showFiltersPanel = signal(false);
  readonly customAttrKey = signal('');
  readonly customAttrValue = signal('');
  readonly saving = signal(false);

  createAction(): void {
    this.editingAction.set(createDefaultAction());
    this.showFiltersPanel.set(false);
  }

  createActionWithType(type: ButtonType): void {
    const action = createDefaultAction();
    action.buttonType = type;
    if (type === 'custom') {
      action.binding.element = 'my-custom-button';
    }
    this.editingAction.set(action);
    this.showFiltersPanel.set(false);
  }

  editAction(action: ActionConfig): void {
    this.editingAction.set(JSON.parse(JSON.stringify(action)));
    this.showFiltersPanel.set(false);
  }

  saveAction(): void {
    const editing = this.editingAction();
    if (!editing) return;

    const all = [...this.actions()];
    const idx = all.findIndex((a) => a.id === editing.id);
    if (idx >= 0) {
      all[idx] = editing;
    } else {
      all.push(editing);
    }
    this.actions.set(all);
    this.saving.set(true);
    this.storage.saveActionsAsync(all).subscribe({
      next: () => {
        this.saving.set(false);
        this.editingAction.set(null);
        this.snackBar.open('Action saved to server', 'OK', { duration: 2000 });
      },
      error: (_err) => {
        this.saving.set(false);
        this.snackBar.open('Save failed — cached locally', 'Dismiss', { duration: 4000 });
      },
    });
  }

  get canSave(): boolean {
    const a = this.editingAction();
    if (!a) return false;
    return !!(a.binding.label && a.binding.operation);
  }

  cancelActionEdit(): void {
    this.editingAction.set(null);
  }

  deleteAction(id: string): void {
    const all = this.actions().filter((a) => a.id !== id);
    this.actions.set(all);
    this.storage.saveActionsAsync(all).subscribe({
      next: () => this.snackBar.open('Action deleted', 'OK', { duration: 2000 }),
      error: () => this.snackBar.open('Delete saved locally', 'OK', { duration: 2000 }),
    });
    if (this.editingAction()?.id === id) {
      this.editingAction.set(null);
    }
  }

  toggleAction(action: ActionConfig): void {
    const all = this.actions().map((a) =>
      a.id === action.id ? { ...a, available: !a.available } : a,
    );
    this.actions.set(all);
    this.storage.saveActionsAsync(all).subscribe();
  }

  updateBinding<K extends keyof ElementBinding>(prop: K, value: ElementBinding[K]): void {
    const a = this.editingAction();
    if (!a) return;
    this.editingAction.set({
      ...a,
      binding: { ...a.binding, [prop]: value },
    });
  }

  updateAttribute<K extends keyof ActionAttributes>(prop: K, value: ActionAttributes[K]): void {
    const a = this.editingAction();
    if (!a) return;
    this.editingAction.set({
      ...a,
      attributes: { ...a.attributes, [prop]: value },
    });
  }

  updateTop(prop: string, value: unknown): void {
    const a = this.editingAction();
    if (!a) return;
    this.editingAction.set({ ...a, [prop]: value });
  }

  addCustomAttribute(): void {
    const key = this.customAttrKey().trim();
    const val = this.customAttrValue().trim();
    if (!key) return;

    const a = this.editingAction();
    if (!a) return;

    this.editingAction.set({
      ...a,
      attributes: {
        ...a.attributes,
        custom: { ...a.attributes.custom, [key]: val },
      },
    });
    this.customAttrKey.set('');
    this.customAttrValue.set('');
  }

  removeCustomAttribute(key: string): void {
    const a = this.editingAction();
    if (!a) return;
    const custom = { ...a.attributes.custom };
    delete custom[key];
    this.editingAction.set({
      ...a,
      attributes: { ...a.attributes, custom },
    });
  }

  updateFilter(field: string, value: string): void {
    const a = this.editingAction();
    if (!a) return;
    const arr = value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    this.editingAction.set({
      ...a,
      filters: { ...a.filters, [field]: arr.length > 0 ? arr : undefined },
    });
  }

  getFilterValue(field: string): string {
    const a = this.editingAction();
    if (!a) return '';
    const filters = a.filters as Record<string, string[] | undefined>;
    return (filters[field] ?? []).join(', ');
  }

  updateFilterBool(field: string, value: boolean): void {
    const a = this.editingAction();
    if (!a) return;
    this.editingAction.set({
      ...a,
      filters: { ...a.filters, [field]: value || undefined },
    });
  }

  updateFilterExpression(value: string): void {
    const a = this.editingAction();
    if (!a) return;
    this.editingAction.set({
      ...a,
      filters: { ...a.filters, expression: value || undefined },
    });
  }

  hasActiveFilters(): boolean {
    const a = this.editingAction();
    if (!a) return false;
    const f = a.filters;
    return !!(
      f.docTypes?.length ||
      f.permissions?.length ||
      f.facets?.length ||
      f.excludeFacets?.length ||
      f.states?.length ||
      f.excludeStates?.length ||
      f.schemas?.length ||
      f.groups?.length ||
      f.isAdmin ||
      f.expression
    );
  }
}
