import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { NestedTreeControl } from '@angular/cdk/tree';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import {
  ConfigStorageService,
  SchemaRegistryService,
  PlatformRegistryService,
  StudioLayoutService,
  parsePolymerLayout,
  type FieldWidgetConfig,
  type LayoutConfig,
  type LayoutMode,
  type LayoutSection,
  type WidgetType,
  type NuxeoTypeDefinition,
  type NuxeoFieldType,
  LayoutRendererComponent,
} from '@agentic-ui/shared/nuxeo-studio';

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
  'htmleditor',
  'hidden',
];

interface DocTypeNode {
  name: string;
  children?: DocTypeNode[];
  isCategory?: boolean;
}

const ALL_MODES: LayoutMode[] = ['create', 'edit', 'view', 'metadata', 'import'];

@Component({
  selector: 'lib-layouts-page',
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
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatTreeModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatExpansionModule,
    DragDropModule,
    LayoutRendererComponent,
  ],
  templateUrl: './layouts-page.component.html',
  styleUrl: './layouts-page.component.scss',
})
export class LayoutsPageComponent {
  private readonly storage = inject(ConfigStorageService);
  private readonly schemaRegistry = inject(SchemaRegistryService);
  private readonly platformRegistry = inject(PlatformRegistryService);
  private readonly studioLayout = inject(StudioLayoutService);
  private readonly snackBar = inject(MatSnackBar);

  readonly widgetOptions = WIDGET_OPTIONS;
  readonly allModes = ALL_MODES;
  readonly columnOptions: Array<1 | 2 | 3> = [1, 2, 3];

  readonly layouts = signal<LayoutConfig[]>(this.storage.getAllLayoutConfigs());
  readonly editingLayout = signal<LayoutConfig | null>(null);
  readonly availableSchemaFields = signal<FieldWidgetConfig[]>([]);
  readonly showPreview = signal(false);
  readonly selectedFieldIndex = signal<{ section: number; field: number } | null>(null);
  readonly customDocType = signal('');
  readonly saving = signal(false);
  readonly loadingTypes = signal(false);
  readonly selectedCategory = signal<string | null>(null);
  /** Indicates the current layout was loaded from a Studio-deployed HTML file. */
  readonly layoutSource = signal<'custom' | 'studio' | null>(null);
  /** Raw HTML of the Studio-deployed layout (for display/reference). */
  readonly studioHtml = signal<string | null>(null);
  /** Loading indicator when fetching a Studio layout. */
  readonly loadingStudioLayout = signal(false);

  readonly selectedField = computed(() => {
    const sel = this.selectedFieldIndex();
    const layout = this.editingLayout();
    if (!sel || !layout) return null;
    return layout.sections[sel.section]?.fields[sel.field] ?? null;
  });

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

  treeControl = new NestedTreeControl<DocTypeNode>((node) => node.children);
  dataSource = new MatTreeNestedDataSource<DocTypeNode>();

  constructor() {
    this.buildDocTypeTree();
  }

  hasChild = (_: number, node: DocTypeNode) => !!node.children && node.children.length > 0;

  selectCategory(name: string): void {
    this.editingLayout.set(null);
    this.selectedCategory.set(name);
  }

  getCategoryTypes(categoryName: string): string[] {
    const node = this.dataSource.data.find((n) => n.name === categoryName);
    return node?.children?.map((c) => c.name) ?? [];
  }

  /**
   * Build the doc type tree from both platform registry (real Nuxeo types)
   * and any local layout configs that reference types not in the registry.
   */
  private buildDocTypeTree(): void {
    const platformLocal = this.platformRegistry.localDocTypes().map((t) => t.name);
    const platformBuiltIn = this.platformRegistry.builtInDocTypes().map((t) => t.name);

    const allLayouts = this.layouts();
    const layoutDocTypes = new Set(allLayouts.map((l) => l.docType));

    const localSet = new Set([...platformLocal]);
    const builtInSet = new Set(
      platformBuiltIn.length > 0
        ? platformBuiltIn
        : [
            'Document',
            'File',
            'Note',
            'Folder',
            'Workspace',
            'Picture',
            'Video',
            'Audio',
            'Collection',
            'Section',
            'Domain',
            'OrderedFolder',
          ],
    );

    for (const dt of layoutDocTypes) {
      if (!builtInSet.has(dt) && !localSet.has(dt)) {
        localSet.add(dt);
      }
    }

    const tree: DocTypeNode[] = [
      {
        name: 'Local Document Types',
        isCategory: true,
        children: Array.from(localSet)
          .sort()
          .map((t) => ({ name: t })),
      },
      {
        name: 'Built-in Document Types',
        isCategory: true,
        children: Array.from(builtInSet)
          .sort()
          .map((t) => ({ name: t })),
      },
    ];
    this.dataSource.data = tree;
    this.treeControl.dataNodes = tree;
    this.treeControl.expandAll();
  }

  modeHasLayout(docType: string, mode: LayoutMode): boolean {
    return this.layouts().some((l) => l.docType === docType && l.mode === mode);
  }

  modeHasStudioLayout(docType: string, mode: LayoutMode): boolean {
    return this.platformRegistry.hasDeployedLayout(docType, mode);
  }

  /** Returns 'custom' if we have a local config, 'studio' if deployed from Studio, or null. */
  getLayoutSourceForMode(docType: string, mode: LayoutMode): 'custom' | 'studio' | null {
    if (this.layouts().some((l) => l.docType === docType && l.mode === mode)) return 'custom';
    if (this.platformRegistry.hasDeployedLayout(docType, mode)) return 'studio';
    return null;
  }

  selectDocTypeMode(docType: string, mode: LayoutMode): void {
    this.selectedCategory.set(null);
    this.studioHtml.set(null);
    this.showPreview.set(false);
    this.selectedFieldIndex.set(null);

    const existing = this.storage.getLayoutConfig(docType, mode);
    if (existing) {
      this.editingLayout.set(JSON.parse(JSON.stringify(existing)));
      this.layoutSource.set('custom');
      this.loadSchemaFields(docType);
      return;
    }

    this.loadingStudioLayout.set(true);
    this.studioLayout.fetchStudioLayout(docType, mode).subscribe({
      next: (html) => {
        this.loadingStudioLayout.set(false);
        if (html) {
          const parsed = parsePolymerLayout(html, docType, mode);
          if (parsed && parsed.sections.length > 0) {
            this.editingLayout.set(parsed);
            this.layoutSource.set('studio');
            this.studioHtml.set(html);
            this.loadSchemaFields(docType);
            return;
          }
        }
        this.editingLayout.set({
          docType,
          mode,
          sections: [{ label: 'General', fields: [], collapsed: false, columns: 1 }],
        });
        this.layoutSource.set(null);
        this.loadSchemaFields(docType);
      },
      error: () => {
        this.loadingStudioLayout.set(false);
        this.editingLayout.set({
          docType,
          mode,
          sections: [{ label: 'General', fields: [], collapsed: false, columns: 1 }],
        });
        this.layoutSource.set(null);
        this.loadSchemaFields(docType);
      },
    });
  }

  addCustomDocType(): void {
    const dt = this.customDocType().trim();
    if (!dt) return;
    this.customDocType.set('');
    this.selectDocTypeMode(dt, 'create');
    this.refreshTree();
  }

  private refreshTree(): void {
    const allLayouts = this.storage.getAllLayoutConfigs();
    this.layouts.set(allLayouts);
    this.buildDocTypeTree();
  }

  // ── Schema fields ──

  loadSchemaFields(docType: string): void {
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
        this.availableSchemaFields.set(this.getFallbackFields(docType));
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

    return [...dc, ...(typeSpecific[normalized] ?? [])];
  }

  // ── Section management ──

  addSection(): void {
    const layout = this.editingLayout();
    if (!layout) return;
    layout.sections.push({
      label: `Section ${layout.sections.length + 1}`,
      fields: [],
      collapsed: false,
      columns: 1,
    });
    this.editingLayout.set({ ...layout });
  }

  removeSection(idx: number): void {
    const layout = this.editingLayout();
    if (!layout || layout.sections.length <= 1) return;
    layout.sections.splice(idx, 1);
    this.editingLayout.set({ ...layout });
    this.selectedFieldIndex.set(null);
  }

  moveSectionUp(idx: number): void {
    const layout = this.editingLayout();
    if (!layout || idx === 0) return;
    const sections = layout.sections;
    [sections[idx - 1], sections[idx]] = [sections[idx], sections[idx - 1]];
    this.editingLayout.set({ ...layout });
  }

  moveSectionDown(idx: number): void {
    const layout = this.editingLayout();
    if (!layout || idx >= layout.sections.length - 1) return;
    const sections = layout.sections;
    [sections[idx], sections[idx + 1]] = [sections[idx + 1], sections[idx]];
    this.editingLayout.set({ ...layout });
  }

  updateSectionColumns(section: LayoutSection, columns: 1 | 2 | 3): void {
    section.columns = columns;
    const layout = this.editingLayout();
    if (layout) this.editingLayout.set({ ...layout });
  }

  updateSectionLabel(section: LayoutSection, label: string): void {
    section.label = label;
    const layout = this.editingLayout();
    if (layout) this.editingLayout.set({ ...layout });
  }

  toggleSectionCollapsed(section: LayoutSection): void {
    section.collapsed = !section.collapsed;
    const layout = this.editingLayout();
    if (layout) this.editingLayout.set({ ...layout });
  }

  // ── Field management ──

  addFieldToSection(field: FieldWidgetConfig, sectionIdx: number): void {
    const layout = this.editingLayout();
    if (!layout) return;

    const section = layout.sections[sectionIdx];
    if (!section || section.fields.some((f) => f.xpath === field.xpath)) return;

    section.fields.push({ ...field });
    this.editingLayout.set({ ...layout });
  }

  addFieldToLayout(field: FieldWidgetConfig): void {
    this.addFieldToSection(field, 0);
  }

  removeFieldFromLayout(sectionIdx: number, fieldIdx: number): void {
    const layout = this.editingLayout();
    if (!layout) return;

    layout.sections[sectionIdx].fields.splice(fieldIdx, 1);
    this.editingLayout.set({ ...layout });

    const sel = this.selectedFieldIndex();
    if (sel && sel.section === sectionIdx && sel.field === fieldIdx) {
      this.selectedFieldIndex.set(null);
    }
  }

  selectField(sectionIdx: number, fieldIdx: number): void {
    const sel = this.selectedFieldIndex();
    if (sel?.section === sectionIdx && sel?.field === fieldIdx) {
      this.selectedFieldIndex.set(null);
    } else {
      this.selectedFieldIndex.set({ section: sectionIdx, field: fieldIdx });
    }
  }

  isFieldSelected(sectionIdx: number, fieldIdx: number): boolean {
    const sel = this.selectedFieldIndex();
    return sel?.section === sectionIdx && sel?.field === fieldIdx;
  }

  onFieldDrop(event: CdkDragDrop<FieldWidgetConfig[]>, sectionIdx: number): void {
    const layout = this.editingLayout();
    if (!layout) return;

    moveItemInArray(layout.sections[sectionIdx].fields, event.previousIndex, event.currentIndex);
    this.editingLayout.set({ ...layout });
    this.selectedFieldIndex.set(null);
  }

  // ── Field properties panel ──

  updateFieldProp(prop: string, value: unknown): void {
    const sel = this.selectedFieldIndex();
    const layout = this.editingLayout();
    if (!sel || !layout) return;

    const field = layout.sections[sel.section].fields[sel.field] as unknown as Record<
      string,
      unknown
    >;
    field[prop] = value;
    this.editingLayout.set({ ...layout });
  }

  // ── Save / Delete ──

  saveLayout(): void {
    const layout = this.editingLayout();
    if (!layout) return;

    this.saving.set(true);
    this.storage.saveLayoutConfigAsync(layout).subscribe({
      next: () => {
        this.saving.set(false);
        this.layoutSource.set('custom');
        this.refreshTree();
        this.snackBar.open(`Layout saved: ${layout.docType} / ${layout.mode}`, 'OK', {
          duration: 2000,
        });
      },
      error: () => {
        this.saving.set(false);
        this.refreshTree();
        this.snackBar.open('Save failed — cached locally', 'Dismiss', { duration: 4000 });
      },
    });
  }

  deleteLayout(docType: string, mode: LayoutMode): void {
    this.storage.deleteLayoutConfigAsync(docType, mode).subscribe({
      next: () => {
        this.refreshTree();
        this.snackBar.open('Layout deleted', 'OK', { duration: 2000 });
      },
      error: () => {
        this.refreshTree();
        this.snackBar.open('Delete saved locally', 'OK', { duration: 2000 });
      },
    });
    if (this.editingLayout()?.docType === docType && this.editingLayout()?.mode === mode) {
      this.editingLayout.set(null);
    }
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
