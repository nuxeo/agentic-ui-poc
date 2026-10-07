import { LayoutFile } from './layout-file';
import {
  DocumentTypeDefinition,
  DocumentTypeSchema,
  LayoutField,
  LayoutFieldType,
  LayoutMode,
  ResolvedLayout,
} from './layout.model';

/**
 * Schemas a generated layout leaves out: the Properties panel's own rows and the viewers already
 * present them. Without this list a File would grow a section for `uid` and `files`, and a
 * Picture one for `picture:views`, a list of blob-bearing records. A layout file may still name
 * any of their fields.
 */
export const PRESENTED_SCHEMAS: ReadonlySet<string> = new Set([
  'common',
  'dublincore',
  'uid',
  'file',
  'files',
  'note',
  'facetedTag',
  'relatedtext',
  'picture',
  'image_metadata',
  'iptc',
  'video',
  'audio',
]);

/** Translation keys a manifest `labels` entry can set to rename a generated label. */
export const fieldLabelKey = (xpath: string): string => `layout.field.${xpath}`;
export const schemaLabelKey = (schema: string): string => `layout.schema.${schema}`;

/** `billedAmount` → `Billed amount`, `payers_case` → `Payers case`, `memberID` → `Member ID`. */
export function humanize(name: string): string {
  const words = name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])(?=[A-Z][a-z])/g, '$1 ')
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .map((word) => (word.length > 1 && word === word.toUpperCase() ? word : word.toLowerCase()));
  const text = words.join(' ');
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : name;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function directoryOf(constraints: unknown): string | undefined {
  if (!Array.isArray(constraints)) return undefined;
  for (const constraint of constraints) {
    if (!isRecord(constraint) || constraint['name'] !== 'directoryResolver') continue;
    const parameters = constraint['parameters'];
    const directory = isRecord(parameters) ? parameters['directory'] : undefined;
    if (typeof directory === 'string' && directory) return directory;
  }
  return undefined;
}

/** A field as Nuxeo answers it: a bare type string, or an object when constraints or sub-fields apply. */
function readFieldType(raw: unknown): LayoutFieldType | null {
  if (typeof raw === 'string') return { type: raw };
  if (!isRecord(raw) || typeof raw['type'] !== 'string') return null;
  const directory = directoryOf(raw['constraints']) ?? directoryOf(raw['itemConstraints']);
  const fields = isRecord(raw['fields']) ? readFields(raw['fields']) : undefined;
  return {
    type: raw['type'],
    ...(directory ? { directory } : {}),
    ...(fields ? { fields } : {}),
  };
}

function readFields(raw: Record<string, unknown>): Record<string, LayoutFieldType> {
  const fields: Record<string, LayoutFieldType> = {};
  for (const [name, value] of Object.entries(raw)) {
    const field = readFieldType(value);
    if (field) fields[name] = field;
  }
  return fields;
}

/**
 * A `/config/types/<type>` response, read with `fetch-schema: fields`.
 *
 * Nuxeo reports `@prefix` only when a schema has one; `file`, `uid` and `files` have none and are
 * addressed by schema name (`file:content`), so a missing prefix becomes the schema name.
 */
export function readDocumentType(raw: unknown, name: string): DocumentTypeDefinition | null {
  if (!isRecord(raw) || !Array.isArray(raw['schemas'])) return null;
  const schemas: DocumentTypeSchema[] = raw['schemas'].filter(isRecord).flatMap((schema) => {
    const schemaName = schema['name'];
    if (typeof schemaName !== 'string' || !schemaName) return [];
    const prefix = schema['@prefix'] ?? schema['prefix'];
    return [
      {
        name: schemaName,
        prefix: typeof prefix === 'string' && prefix ? prefix : schemaName,
        fields: isRecord(schema['fields']) ? readFields(schema['fields']) : {},
      },
    ];
  });
  return { name, schemas };
}

const byName = (a: string, b: string) => a.localeCompare(b);

/** No layout file for this type and mode: one section per schema the panel does not already present. */
export function generateLayout(type: DocumentTypeDefinition, mode: LayoutMode): ResolvedLayout {
  const sections = type.schemas
    .filter((schema) => !PRESENTED_SCHEMAS.has(schema.name))
    .sort((a, b) => byName(a.name, b.name))
    .map((schema) => ({
      id: schema.name,
      label: { keys: [schemaLabelKey(schema.name)], fallback: humanize(schema.name) },
      fields: Object.keys(schema.fields)
        .sort(byName)
        .map((name) => field(`${schema.prefix}:${name}`, name, schema.fields[name])),
    }))
    .filter((section) => section.fields.length > 0);
  return { type: type.name, mode, source: 'generated', display: 'sections', sections };
}

function field(
  xpath: string,
  name: string,
  definition: LayoutFieldType,
  literal?: string,
  labelKey?: string,
): LayoutField {
  return {
    xpath,
    definition,
    label: {
      ...(literal ? { literal } : {}),
      keys: [...(labelKey ? [labelKey] : []), fieldLabelKey(xpath)],
      fallback: humanize(name),
    },
  };
}

/**
 * A contributed file, in place of the generated layout. A field the type does not have is
 * skipped and reported, and the rest of the file still applies.
 */
export function applyLayoutFile(
  type: DocumentTypeDefinition,
  mode: LayoutMode,
  file: LayoutFile,
): { readonly layout: ResolvedLayout; readonly skipped: readonly string[] } {
  const known = new Map<string, { name: string; definition: LayoutFieldType }>();
  for (const schema of type.schemas) {
    for (const [name, definition] of Object.entries(schema.fields)) {
      known.set(`${schema.prefix}:${name}`, { name, definition });
    }
  }
  const skipped: string[] = [];
  const sections = file.sections.map((section) => ({
    id: section.id,
    label: {
      ...(section.label ? { literal: section.label } : {}),
      keys: section.labelKey ? [section.labelKey] : [],
      fallback: null,
    },
    fields: section.fields.flatMap((entry) => {
      const match = known.get(entry.field);
      if (!match) {
        skipped.push(entry.field);
        return [];
      }
      return [field(entry.field, match.name, match.definition, entry.label, entry.labelKey)];
    }),
  }));
  return {
    layout: { type: type.name, mode, source: 'contributed', display: file.display, sections },
    skipped,
  };
}
