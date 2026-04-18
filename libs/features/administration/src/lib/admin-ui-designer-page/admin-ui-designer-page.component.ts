import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import {
  type ActionConfig,
  type ActionSlot,
  ConfigStorageService,
  SchemaRegistryService,
  type FieldWidgetConfig,
  type LayoutConfig,
  type LayoutMode,
  type WidgetType,
  type NuxeoTypeDefinition,
  type NuxeoFieldType,
  LayoutRendererComponent,
} from '@agentic-ui/shared/nuxeo-studio';

const ICON_OPTIONS = [
  'play_arrow',
  'send',
  'download',
  'upload',
  'print',
  'share',
  'delete',
  'archive',
  'verified',
  'approval',
  'check_circle',
  'cancel',
  'refresh',
  'mail',
  'notifications',
  'star',
  'bookmark',
  'flag',
  'label',
  'lock',
  'lock_open',
  'visibility',
  'edit',
  'content_copy',
  'link',
];

const WIDGET_OPTIONS: WidgetType[] = [
  'text',
  'textarea',
  'number',
  'checkbox',
  'toggle',
  'date',
  'directory',
  'select',
  'radio',
  'usergroup',
  'blob',
  'tag',
];

@Component({
  selector: 'lib-admin-ui-designer-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatCardModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatExpansionModule,
    DragDropModule,
    LayoutRendererComponent,
  ],
  templateUrl: './admin-ui-designer-page.component.html',
  styleUrl: './admin-ui-designer-page.component.scss',
})
export class AdminUiDesignerPageComponent {
  private readonly storage = inject(ConfigStorageService);
  private readonly schemaRegistry = inject(SchemaRegistryService);
  private readonly snackBar = inject(MatSnackBar);

  readonly iconOptions = ICON_OPTIONS;
  readonly widgetOptions = WIDGET_OPTIONS;
  readonly slotOptions: ActionSlot[] = ['DOCUMENT_ACTIONS', 'DOCUMENT_MORE_ACTIONS'];
  readonly modeOptions: LayoutMode[] = ['create', 'edit', 'view', 'metadata', 'import'];

  // ── Actions tab ──

  readonly actions = signal<ActionConfig[]>(this.storage.getActions());
  readonly editingAction = signal<ActionConfig | null>(null);
  readonly docTypeFilter = signal<string>('');

  createAction(): void {
    const action: ActionConfig = {
      id: crypto.randomUUID(),
      label: 'New Action',
      icon: 'play_arrow',
      operationId: '',
      slot: 'DOCUMENT_ACTIONS',
      order: (this.actions().length + 1) * 10,
      filters: {},
      enabled: true,
    };
    this.editingAction.set(action);
  }

  editAction(action: ActionConfig): void {
    this.editingAction.set({ ...action, filters: { ...action.filters } });
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
    this.storage.saveActions(all);
    this.editingAction.set(null);
    this.snackBar.open('Action saved', 'OK', { duration: 2000 });
  }

  updateEditingAction(prop: string, value: unknown): void {
    const editing = this.editingAction();
    if (!editing) return;
    this.editingAction.set({ ...editing, [prop]: value });
  }

  cancelActionEdit(): void {
    this.editingAction.set(null);
  }

  deleteAction(id: string): void {
    const all = this.actions().filter((a) => a.id !== id);
    this.actions.set(all);
    this.storage.saveActions(all);
    if (this.editingAction()?.id === id) {
      this.editingAction.set(null);
    }
    this.snackBar.open('Action deleted', 'OK', { duration: 2000 });
  }

  toggleAction(action: ActionConfig): void {
    const all = this.actions().map((a) => (a.id === action.id ? { ...a, enabled: !a.enabled } : a));
    this.actions.set(all);
    this.storage.saveActions(all);
  }

  updateEditingFilter(field: string, value: string): void {
    const editing = this.editingAction();
    if (!editing) return;
    const arr = value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    this.editingAction.set({
      ...editing,
      filters: { ...editing.filters, [field]: arr.length > 0 ? arr : undefined },
    });
  }

  getFilterValue(field: string): string {
    const editing = this.editingAction();
    if (!editing) return '';
    const filters = editing.filters as Record<string, string[] | undefined>;
    return (filters[field] ?? []).join(', ');
  }

  // ── Layouts tab ──

  readonly layouts = signal<LayoutConfig[]>(this.storage.getAllLayoutConfigs());
  readonly selectedDocType = signal<string>('');
  readonly selectedMode = signal<LayoutMode>('create');
  readonly editingLayout = signal<LayoutConfig | null>(null);
  readonly availableSchemaFields = signal<FieldWidgetConfig[]>([]);
  readonly showPreview = signal(false);

  readonly previewDoc = computed(() => {
    const layout = this.editingLayout();
    if (!layout) return null;
    return {
      'entity-type': 'document',
      uid: 'preview',
      type: layout.docType,
      title: 'Preview Document',
      path: '/preview',
      lastModified: new Date().toISOString(),
      properties: {},
    };
  });

  loadSchemaFields(): void {
    const docType = this.selectedDocType();
    if (!docType) return;

    this.schemaRegistry.getType(docType).subscribe({
      next: (typeDef: NuxeoTypeDefinition) => {
        const fields: FieldWidgetConfig[] = typeDef.fields.map((f) => ({
          xpath: f.xpath,
          widget: this.inferWidgetFromFieldType(f.type),
          label: this.xpathToLabel(f.name),
        }));
        this.availableSchemaFields.set(fields.sort((a, b) => a.xpath.localeCompare(b.xpath)));
      },
      error: () => {
        this.availableSchemaFields.set([]);
      },
    });
  }

  startLayoutDesign(): void {
    const docType = this.selectedDocType();
    const mode = this.selectedMode();
    if (!docType) return;

    const existing = this.storage.getLayoutConfig(docType, mode);
    if (existing) {
      this.editingLayout.set(JSON.parse(JSON.stringify(existing)));
    } else {
      this.editingLayout.set({
        docType,
        mode,
        sections: [{ label: 'General', fields: [], collapsed: false, columns: 1 }],
      });
    }

    this.loadSchemaFields();
    this.showPreview.set(false);
  }

  addFieldToLayout(field: FieldWidgetConfig): void {
    const layout = this.editingLayout();
    if (!layout || layout.sections.length === 0) return;

    const section = layout.sections[0];
    if (section.fields.some((f) => f.xpath === field.xpath)) return;

    section.fields.push({ ...field });
    this.editingLayout.set({ ...layout });
  }

  removeFieldFromLayout(sectionIdx: number, fieldIdx: number): void {
    const layout = this.editingLayout();
    if (!layout) return;

    layout.sections[sectionIdx].fields.splice(fieldIdx, 1);
    this.editingLayout.set({ ...layout });
  }

  onFieldDrop(event: CdkDragDrop<FieldWidgetConfig[]>, sectionIdx: number): void {
    const layout = this.editingLayout();
    if (!layout) return;

    moveItemInArray(layout.sections[sectionIdx].fields, event.previousIndex, event.currentIndex);
    this.editingLayout.set({ ...layout });
  }

  updateFieldProp(sectionIdx: number, fieldIdx: number, prop: string, value: unknown): void {
    const layout = this.editingLayout();
    if (!layout) return;

    const field = layout.sections[sectionIdx].fields[fieldIdx] as unknown as Record<
      string,
      unknown
    >;
    field[prop] = value;
    this.editingLayout.set({ ...layout });
  }

  saveLayout(): void {
    const layout = this.editingLayout();
    if (!layout) return;

    this.storage.saveLayoutConfig(layout);
    this.layouts.set(this.storage.getAllLayoutConfigs());
    this.snackBar.open(`Layout saved: ${layout.docType} / ${layout.mode}`, 'OK', {
      duration: 2000,
    });
  }

  deleteLayout(docType: string, mode: LayoutMode): void {
    this.storage.deleteLayoutConfig(docType, mode);
    this.layouts.set(this.storage.getAllLayoutConfigs());
    if (this.editingLayout()?.docType === docType && this.editingLayout()?.mode === mode) {
      this.editingLayout.set(null);
    }
    this.snackBar.open('Layout deleted', 'OK', { duration: 2000 });
  }

  isFieldInLayout(xpath: string): boolean {
    const layout = this.editingLayout();
    if (!layout) return false;
    return layout.sections.some((s) => s.fields.some((f) => f.xpath === xpath));
  }

  private inferWidgetFromFieldType(type: NuxeoFieldType): WidgetType {
    if (type === 'string') return 'text';
    if (type === 'integer' || type === 'long' || type === 'double' || type === 'float')
      return 'number';
    if (type === 'boolean') return 'checkbox';
    if (type === 'date') return 'date';
    if (type === 'blob') return 'blob';
    if (type === 'string[]') return 'tag';
    if (type === 'complex') return 'text';
    return 'text';
  }

  private xpathToLabel(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^\s+/, '')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
