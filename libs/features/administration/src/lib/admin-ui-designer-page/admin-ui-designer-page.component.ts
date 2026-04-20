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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import {
  type ActionConfig,
  type ActionSlot,
  type ButtonType,
  type ElementBinding,
  type ActionAttributes,
  createDefaultAction,
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

const TOOLTIP_POSITIONS: Array<ElementBinding['tooltipPosition']> = [
  'top',
  'bottom',
  'left',
  'right',
];

const INPUT_OPTIONS = ['[[document]]', '[[selection]]', '[[blob]]'];

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
    MatSlideToggleModule,
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

  readonly tooltipPositions = TOOLTIP_POSITIONS;
  readonly inputOptions = INPUT_OPTIONS;
  readonly widgetOptions = WIDGET_OPTIONS;

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

  readonly modeOptions: LayoutMode[] = ['create', 'edit', 'view', 'metadata', 'import'];

  // ── Actions tab ──

  readonly actions = signal<ActionConfig[]>(this.storage.getActions());
  readonly editingAction = signal<ActionConfig | null>(null);
  readonly showFiltersPanel = signal(false);
  readonly customAttrKey = signal('');
  readonly customAttrValue = signal('');

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
    this.storage.saveActions(all);
    this.editingAction.set(null);
    this.snackBar.open('Action saved', 'OK', { duration: 2000 });
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
    this.storage.saveActions(all);
    if (this.editingAction()?.id === id) {
      this.editingAction.set(null);
    }
    this.snackBar.open('Action deleted', 'OK', { duration: 2000 });
  }

  toggleAction(action: ActionConfig): void {
    const all = this.actions().map((a) =>
      a.id === action.id ? { ...a, available: !a.available } : a,
    );
    this.actions.set(all);
    this.storage.saveActions(all);
  }

  // Binding field updaters
  updateBinding<K extends keyof ElementBinding>(prop: K, value: ElementBinding[K]): void {
    const a = this.editingAction();
    if (!a) return;
    this.editingAction.set({
      ...a,
      binding: { ...a.binding, [prop]: value },
    });
  }

  // Attribute field updaters
  updateAttribute<K extends keyof ActionAttributes>(prop: K, value: ActionAttributes[K]): void {
    const a = this.editingAction();
    if (!a) return;
    this.editingAction.set({
      ...a,
      attributes: { ...a.attributes, [prop]: value },
    });
  }

  // Top-level field updaters
  updateTop(prop: string, value: unknown): void {
    const a = this.editingAction();
    if (!a) return;
    this.editingAction.set({ ...a, [prop]: value });
  }

  // Custom attribute management
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

  // Filter updaters
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
        const fallback = this.getFallbackFields(docType);
        this.availableSchemaFields.set(fallback);
      },
    });
  }

  private getFallbackFields(docType: string): FieldWidgetConfig[] {
    const dc: FieldWidgetConfig[] = [
      { xpath: 'dc:title', widget: 'text', label: 'Title', required: true },
      { xpath: 'dc:description', widget: 'textarea', label: 'Description' },
      { xpath: 'dc:nature', widget: 'directory', label: 'Nature', directory: 'nature' },
      {
        xpath: 'dc:subjects',
        widget: 'directory',
        label: 'Subjects',
        directory: 'l10nsubjects',
        multiple: true,
      },
      { xpath: 'dc:coverage', widget: 'directory', label: 'Coverage', directory: 'l10ncoverage' },
      { xpath: 'dc:expired', widget: 'date', label: 'Expires' },
      { xpath: 'dc:creator', widget: 'text', label: 'Creator', readOnly: true },
      { xpath: 'dc:created', widget: 'date', label: 'Created', readOnly: true },
      { xpath: 'dc:modified', widget: 'date', label: 'Modified', readOnly: true },
      { xpath: 'dc:lastContributor', widget: 'text', label: 'Last Contributor', readOnly: true },
      { xpath: 'dc:contributors', widget: 'tag', label: 'Contributors', readOnly: true },
    ];

    const normalized = docType.toLowerCase();
    const typeSpecific: Record<string, FieldWidgetConfig[]> = {
      file: [{ xpath: 'file:content', widget: 'blob', label: 'File' }],
      note: [
        { xpath: 'note:note', widget: 'htmleditor', label: 'Content' },
        { xpath: 'note:mime_type', widget: 'text', label: 'MIME Type', readOnly: true },
      ],
      picture: [
        { xpath: 'file:content', widget: 'blob', label: 'Image' },
        { xpath: 'imd:pixel_xdimension', widget: 'number', label: 'Width', readOnly: true },
        { xpath: 'imd:pixel_ydimension', widget: 'number', label: 'Height', readOnly: true },
      ],
      video: [
        { xpath: 'file:content', widget: 'blob', label: 'Video' },
        { xpath: 'vid:duration', widget: 'number', label: 'Duration', readOnly: true },
      ],
      folder: [],
      workspace: [],
    };

    const extra = typeSpecific[normalized] ?? [];
    return [...dc, ...extra];
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
