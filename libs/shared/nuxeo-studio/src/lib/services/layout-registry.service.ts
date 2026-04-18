import { Injectable, inject } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';

import { SchemaRegistryService } from './schema-registry.service';
import { LayoutBlockRegistryService } from './layout-block-registry.service';
import { StudioLayoutService } from './studio-layout.service';
import { NuxeoFieldDef } from '../models/schema.model';
import {
  FieldValidator,
  FieldWidgetConfig,
  LayoutConfig,
  LayoutMode,
  LayoutSection,
  layoutKey,
} from '../models/layout.model';
import { DEFAULT_WIDGET_MAP } from '../models/widget.model';
import { xpathToLabel } from '../utils/xpath.util';
import { parsePolymerLayout } from '../utils/polymer-layout-parser';

/**
 * Schemas to skip when auto-generating layouts (internal/system schemas
 * that should not appear in user-facing forms).
 */
const HIDDEN_SCHEMAS = new Set([
  'common',
  'uid',
  'collectionMember',
  'thumbnail',
  'relatedtext',
  'publishing',
]);

/** Fields within visible schemas that should still be hidden. */
const HIDDEN_FIELDS = new Set([
  'dc:creator',
  'dc:lastContributor',
  'dc:contributors',
  'dc:created',
  'dc:modified',
]);

/** Fields shown in the simplified import layout. */
const IMPORT_FIELDS = new Set([
  'dc:title',
  'dc:description',
  'dc:nature',
  'dc:subjects',
  'dc:coverage',
]);

/** Fields that get special ordering when auto-generated. */
const PRIORITY_FIELDS: string[] = [
  'dc:title',
  'dc:description',
  'dc:nature',
  'dc:subjects',
  'dc:coverage',
  'dc:expired',
];

/**
 * Resolves the layout configuration for a given document type and mode.
 *
 * Resolution order:
 *   1. Explicit layout registered via `registerLayout()`
 *   2. Studio Designer Polymer layout (fetched + parsed from server)
 *   3. Auto-generated layout from schema introspection (fallback)
 */
@Injectable({ providedIn: 'root' })
export class LayoutRegistryService {
  private readonly schemaRegistry = inject(SchemaRegistryService);
  private readonly blockRegistry = inject(LayoutBlockRegistryService);
  private readonly studioService = inject(StudioLayoutService);

  /** Explicitly registered layout configurations. */
  private readonly layouts = new Map<string, LayoutConfig>();

  // ----- Registration -----

  /** Register an explicit layout for a document type + mode. */
  registerLayout(config: LayoutConfig): void {
    this.layouts.set(layoutKey(config.docType, config.mode), config);
  }

  /** Register multiple layouts at once. */
  registerLayouts(configs: LayoutConfig[]): void {
    for (const config of configs) {
      this.registerLayout(config);
    }
  }

  /** Remove an explicit layout registration. */
  removeLayout(docType: string, mode: LayoutMode): void {
    this.layouts.delete(layoutKey(docType, mode));
  }

  /** Check if an explicit layout exists. */
  hasExplicitLayout(docType: string, mode: LayoutMode): boolean {
    return this.layouts.has(layoutKey(docType, mode));
  }

  // ----- Resolution -----

  /**
   * Resolve the layout for a document type and mode.
   *
   * Resolution order:
   *   1. Explicit layout registered via `registerLayout()` — immediate return
   *   2. Studio Designer Polymer layout fetched from the Nuxeo server — parsed into LayoutConfig
   *   3. Auto-generated layout from schema introspection — fallback
   *
   * Block references in sections are resolved (inlined) before returning.
   */
  resolveLayout(docType: string, mode: LayoutMode): Observable<LayoutConfig> {
    const key = layoutKey(docType, mode);
    const explicit = this.layouts.get(key);
    if (explicit) return of(this.resolveBlocks(explicit));

    return this.studioService.fetchStudioLayout(docType, mode).pipe(
      switchMap((html) => {
        if (html !== null) {
          const parsed = parsePolymerLayout(html, docType, mode);
          if (parsed !== null && parsed.sections.length > 0) {
            return of(this.resolveBlocks(parsed));
          }
        }
        return this.autoGenerateLayout(docType, mode).pipe(
          map((layout) => this.resolveBlocks(layout)),
        );
      }),
    );
  }

  /**
   * Inline layout block references into each section's field list.
   */
  private resolveBlocks(config: LayoutConfig): LayoutConfig {
    const sections = config.sections.map((section) => {
      if (!section.blocks || section.blocks.length === 0) return section;

      const blockFields: FieldWidgetConfig[] = [];
      for (const ref of section.blocks) {
        const resolved = this.blockRegistry.resolveFields(ref.blockName);
        if (resolved.length === 0) {
          console.warn(`[LayoutRegistry] Block "${ref.blockName}" not found`);
        }
        blockFields.push(...resolved);
      }

      return {
        ...section,
        fields: [...blockFields, ...section.fields],
      };
    });

    return { ...config, sections };
  }

  // ----- Auto-generation -----

  /**
   * Auto-generate a layout from schema introspection.
   * Groups fields by schema into collapsible sections.
   */
  private autoGenerateLayout(docType: string, mode: LayoutMode): Observable<LayoutConfig> {
    return this.schemaRegistry
      .getFieldsForType(docType)
      .pipe(map((fields) => this.buildAutoLayout(docType, mode, fields)));
  }

  private buildAutoLayout(
    docType: string,
    mode: LayoutMode,
    allFields: NuxeoFieldDef[],
  ): LayoutConfig {
    // `metadata` mode renders system fields in read-only; shows everything
    const isMetadata = mode === 'metadata';
    const isImport = mode === 'import';

    // Filter out hidden schemas and fields (metadata shows system fields)
    const visibleFields = isMetadata
      ? allFields.filter((f) => !HIDDEN_SCHEMAS.has(f.schemaPrefix))
      : allFields.filter((f) => !HIDDEN_SCHEMAS.has(f.schemaPrefix) && !HIDDEN_FIELDS.has(f.xpath));

    // In create and import modes, filter out system-managed fields
    const fields =
      mode === 'create' || isImport
        ? visibleFields.filter((f) => !this.isSystemManagedField(f))
        : visibleFields;

    // Import mode: only include key fields (title, description, nature, file)
    const finalFields = isImport
      ? fields.filter((f) => IMPORT_FIELDS.has(f.xpath) || f.type === 'blob')
      : fields;

    // Group by schema prefix
    const schemaGroups = new Map<string, NuxeoFieldDef[]>();
    for (const field of finalFields) {
      const prefix = field.schemaPrefix || 'other';
      const group = schemaGroups.get(prefix);
      if (group) {
        group.push(field);
      } else {
        schemaGroups.set(prefix, [field]);
      }
    }

    // Build sections, with Dublin Core first and priority-sorted
    const sections: LayoutSection[] = [];
    const dcFields = schemaGroups.get('dc');
    if (dcFields) {
      sections.push(this.buildSection('General', dcFields, mode, true));
      schemaGroups.delete('dc');
    }

    // File schema gets its own section
    const fileFields = schemaGroups.get('file');
    if (fileFields) {
      sections.push(this.buildSection('File', fileFields, mode, false));
      schemaGroups.delete('file');
    }

    const filesFields = schemaGroups.get('files');
    if (filesFields) {
      sections.push(this.buildSection('Attachments', filesFields, mode, false));
      schemaGroups.delete('files');
    }

    // Remaining custom schemas
    for (const [prefix, schemaFields] of schemaGroups) {
      const label = this.schemaLabel(prefix);
      sections.push(this.buildSection(label, schemaFields, mode, false));
    }

    // In metadata mode, add a System Information section with audit fields
    if (isMetadata) {
      const systemFields = allFields.filter((f) => HIDDEN_FIELDS.has(f.xpath));
      if (systemFields.length > 0) {
        const systemSection = this.buildSection('System', systemFields, 'view', false);
        systemSection.collapsed = true;
        sections.push(systemSection);
      }
    }

    return { docType, mode, sections };
  }

  private buildSection(
    label: string,
    fields: NuxeoFieldDef[],
    mode: LayoutMode,
    prioritySort: boolean,
  ): LayoutSection {
    const sorted = [...fields];

    if (prioritySort) {
      sorted.sort((a, b) => {
        const aIdx = PRIORITY_FIELDS.indexOf(a.xpath);
        const bIdx = PRIORITY_FIELDS.indexOf(b.xpath);
        if (aIdx >= 0 && bIdx >= 0) return aIdx - bIdx;
        if (aIdx >= 0) return -1;
        if (bIdx >= 0) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    return {
      label,
      collapsed: false,
      columns: 1,
      fields: sorted.map((f) => this.fieldToWidgetConfig(f, mode)),
    };
  }

  private fieldToWidgetConfig(field: NuxeoFieldDef, mode: LayoutMode): FieldWidgetConfig {
    const widget = DEFAULT_WIDGET_MAP[field.type] ?? 'text';
    const required = field.constraints.some((c) => c.name === 'NotNullConstraint');

    const config: FieldWidgetConfig = {
      xpath: field.xpath,
      widget,
      label: xpathToLabel(field.xpath),
      required,
      readOnly: mode === 'view' || mode === 'metadata',
      multiple: field.type.endsWith('[]'),
    };

    // Detect directory-backed fields
    const directoryConstraint = field.constraints.find((c) => c.name === 'directoryResolver');
    if (directoryConstraint) {
      config.widget = 'directory';
      config.directory = directoryConstraint.parameters['directory'] as string;
    }

    // Detect well-known directory fields by convention
    if (field.xpath === 'dc:nature') {
      config.widget = 'directory';
      config.directory = 'nature';
    } else if (field.xpath === 'dc:subjects') {
      config.widget = 'directory';
      config.directory = 'l10nsubjects';
      config.multiple = true;
    } else if (field.xpath === 'dc:coverage') {
      config.widget = 'directory';
      config.directory = 'l10ncoverage';
    }

    // Number constraints
    const minConstraint = field.constraints.find((c) => c.name === 'NumericIntervalConstraint');
    if (minConstraint) {
      config.min = minConstraint.parameters['Minimum'] as number;
      config.max = minConstraint.parameters['Maximum'] as number;
    }

    // String length constraints
    const lengthConstraint = field.constraints.find((c) => c.name === 'LengthConstraint');
    if (lengthConstraint) {
      config.maxLength = lengthConstraint.parameters['Length'] as number;
    }

    // Pattern constraint → regex validator
    const patternConstraint = field.constraints.find((c) => c.name === 'PatternConstraint');
    if (patternConstraint) {
      const validators: FieldValidator[] = config.validators ?? [];
      validators.push({
        type: 'pattern',
        pattern: patternConstraint.parameters['Pattern'] as string,
        message: `Value must match pattern: ${patternConstraint.parameters['Pattern']}`,
      });
      config.validators = validators;
    }

    // Complex sub-fields
    if (field.fields && field.fields.length > 0) {
      config.fields = field.fields.map((sf) => this.fieldToWidgetConfig(sf, mode));
    }

    return config;
  }

  /**
   * Fields managed by the server that shouldn't appear in create forms.
   */
  private isSystemManagedField(field: NuxeoFieldDef): boolean {
    const systemFields = new Set([
      'dc:creator',
      'dc:lastContributor',
      'dc:contributors',
      'dc:created',
      'dc:modified',
      'uid:uid',
      'uid:major_version',
      'uid:minor_version',
    ]);
    return systemFields.has(field.xpath);
  }

  /** Capitalize schema prefix for display. */
  private schemaLabel(prefix: string): string {
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }
}
