import type { NuxeoDocument } from '../models/document.model';

export interface CompareFieldDef {
  key: string;
  label: string;
  read: (doc: NuxeoDocument) => unknown;
  format?: (value: unknown) => string;
}

export interface CompareSectionDef {
  id: string;
  label: string;
  fields: CompareFieldDef[];
}

export interface CompareRow {
  key: string;
  label: string;
  left: string;
  right: string;
  differs: boolean;
}

export interface CompareSection {
  id: string;
  label: string;
  fields: CompareRow[];
}

const prop = (name: string) => (doc: NuxeoDocument) => doc.properties[name];

/** Sections whose fields are always shown in the default (diff) view. */
const ALWAYS_VISIBLE_SECTIONS = new Set(['uid', 'common']);

const UID_COMPARE_FIELDS: CompareFieldDef[] = [
  { key: 'uid', label: 'uid', read: (doc) => doc.uid },
  { key: 'uid:major_version', label: 'major_version', read: prop('uid:major_version') },
  { key: 'uid:minor_version', label: 'minor_version', read: prop('uid:minor_version') },
];

const COMMON_COMPARE_FIELDS: CompareFieldDef[] = [
  { key: 'common:icon-expanded', label: 'icon-expanded', read: prop('common:icon-expanded') },
  { key: 'common:icon', label: 'icon', read: prop('common:icon') },
];

/** Default compare view — uid/common always visible; dublincore diffs only. */
const DIFF_COMPARE_SECTIONS: CompareSectionDef[] = [
  {
    id: 'uid',
    label: 'uid',
    fields: UID_COMPARE_FIELDS,
  },
  {
    id: 'common',
    label: 'common',
    fields: COMMON_COMPARE_FIELDS,
  },
  {
    id: 'dublincore',
    label: 'dublincore',
    fields: [
      { key: 'dc:coverage', label: 'coverage', read: prop('dc:coverage') },
      {
        key: 'dc:modified',
        label: 'modified',
        read: (doc) => doc.properties['dc:modified'] ?? doc.lastModified,
        format: formatCompareDate,
      },
      { key: 'dc:expired', label: 'expired', read: prop('dc:expired'), format: formatCompareDate },
      { key: 'dc:created', label: 'created', read: prop('dc:created'), format: formatCompareDate },
      {
        key: 'dc:title',
        label: 'title',
        read: (doc) => doc.properties['dc:title'] ?? doc.title,
      },
      { key: 'dc:nature', label: 'nature', read: prop('dc:nature') },
      {
        key: 'dc:subjects',
        label: 'subjects',
        read: prop('dc:subjects'),
        format: formatCompareSubjects,
      },
    ],
  },
];

/** View all data — full Web UI schema field list. */
const FULL_COMPARE_SECTIONS: CompareSectionDef[] = [
  {
    id: 'uid',
    label: 'uid',
    fields: UID_COMPARE_FIELDS,
  },
  {
    id: 'common',
    label: 'common',
    fields: COMMON_COMPARE_FIELDS,
  },
  {
    id: 'dublincore',
    label: 'dublincore',
    fields: [
      { key: 'dc:description', label: 'description', read: prop('dc:description') },
      { key: 'dc:language', label: 'language', read: prop('dc:language') },
      { key: 'dc:coverage', label: 'coverage', read: prop('dc:coverage') },
      { key: 'dc:valid', label: 'valid', read: prop('dc:valid'), format: formatCompareDate },
      { key: 'dc:creator', label: 'creator', read: prop('dc:creator'), format: formatCompareUser },
      {
        key: 'dc:modified',
        label: 'modified',
        read: (doc) => doc.properties['dc:modified'] ?? doc.lastModified,
        format: formatCompareDate,
      },
      {
        key: 'dc:lastContributor',
        label: 'lastContributor',
        read: prop('dc:lastContributor'),
        format: formatCompareUser,
      },
      { key: 'dc:rights', label: 'rights', read: prop('dc:rights') },
      { key: 'dc:expired', label: 'expired', read: prop('dc:expired'), format: formatCompareDate },
      { key: 'dc:format', label: 'format', read: prop('dc:format') },
      { key: 'dc:created', label: 'created', read: prop('dc:created'), format: formatCompareDate },
      {
        key: 'dc:title',
        label: 'title',
        read: (doc) => doc.properties['dc:title'] ?? doc.title,
      },
      { key: 'dc:issued', label: 'issued', read: prop('dc:issued'), format: formatCompareDate },
      { key: 'dc:nature', label: 'nature', read: prop('dc:nature') },
      {
        key: 'dc:subjects',
        label: 'subjects',
        read: prop('dc:subjects'),
        format: formatCompareSubjects,
      },
      {
        key: 'dc:contributors',
        label: 'contributors',
        read: prop('dc:contributors'),
        format: formatCompareUserList,
      },
      { key: 'dc:source', label: 'source', read: prop('dc:source') },
      { key: 'dc:publisher', label: 'publisher', read: prop('dc:publisher') },
    ],
  },
  {
    id: 'relatedtext',
    label: 'relatedtext',
    fields: [
      {
        key: 'relatedtext:relatedtextresources',
        label: 'relatedtextresources',
        read: prop('relatedtext:relatedtextresources'),
      },
    ],
  },
  {
    id: 'facetedTag',
    label: 'facetedTag',
    fields: [
      {
        key: 'facetedTag:tags',
        label: 'tags',
        read: (doc) => doc.properties['facetedTag:tags'] ?? doc.properties['nxtag:tags'],
        format: formatCompareTags,
      },
    ],
  },
];

export function formatCompareDate(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatCompareUser(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>;
    if (typeof record['properties'] === 'object' && record['properties'] !== null) {
      const props = record['properties'] as Record<string, unknown>;
      if (typeof props['username'] === 'string') return props['username'];
      if (typeof props['firstName'] === 'string' || typeof props['lastName'] === 'string') {
        return [props['firstName'], props['lastName']].filter(Boolean).join(' ').trim();
      }
    }
    if (typeof record['username'] === 'string') return record['username'];
    if (typeof record['id'] === 'string') return record['id'];
  }
  return formatCompareValue(value);
}

export function formatCompareUserList(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (!Array.isArray(value)) return formatCompareUser(value);
  return value
    .map((item) => formatCompareUser(item))
    .filter(Boolean)
    .join(', ');
}

export function formatCompareSubjects(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (!Array.isArray(value)) return formatCompareValue(value);
  return value
    .map((item, index) => {
      if (typeof item === 'string') return `${index}: ${item}`;
      if (item && typeof item === 'object' && 'label' in item) {
        return `${index}: ${String((item as { label: string }).label)}`;
      }
      return `${index}: ${String(item)}`;
    })
    .join('\n');
}

export function formatCompareTags(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (!Array.isArray(value)) return formatCompareValue(value);
  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && 'label' in item) {
        return String((item as { label: string }).label);
      }
      return String(item);
    })
    .join(', ');
}

export function isCompareIconField(key: string): boolean {
  return key === 'common:icon' || key === 'common:icon-expanded';
}

/** Resolve a Nuxeo document icon path (e.g. `/icons/note.gif`) to an API URL. */
export function resolveNuxeoIconPath(path: string): string {
  if (!path) return '';
  if (path.startsWith('/nuxeo/')) return path;
  if (path.startsWith('/icons/')) return `/nuxeo${path}`;
  if (path.startsWith('icons/')) return `/nuxeo/${path}`;
  return path;
}

export function formatCompareValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'label' in item) {
          return String((item as { label: string }).label);
        }
        return String(item);
      })
      .join(', ');
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function formatFieldValue(field: CompareFieldDef, doc: NuxeoDocument): string {
  const raw = field.read(doc);
  return field.format ? field.format(raw) : formatCompareValue(raw);
}

function buildSectionsFromDefs(
  sectionDefs: CompareSectionDef[],
  left: NuxeoDocument,
  right: NuxeoDocument,
  viewAll: boolean,
): CompareSection[] {
  return sectionDefs
    .map((section) => ({
      id: section.id,
      label: section.label,
      fields: section.fields
        .map((field) => {
          const leftValue = formatFieldValue(field, left);
          const rightValue = formatFieldValue(field, right);
          const differs = leftValue !== rightValue;
          return {
            key: field.key,
            label: field.label,
            left: leftValue,
            right: rightValue,
            differs,
          };
        })
        .filter((row) => viewAll || ALWAYS_VISIBLE_SECTIONS.has(section.id) || row.differs),
    }))
    .filter(
      (section) => viewAll || ALWAYS_VISIBLE_SECTIONS.has(section.id) || section.fields.length > 0,
    );
}

export function buildDocumentCompareSections(
  left: NuxeoDocument,
  right: NuxeoDocument,
  viewAll: boolean,
): CompareSection[] {
  const sectionDefs = viewAll ? FULL_COMPARE_SECTIONS : DIFF_COMPARE_SECTIONS;
  return buildSectionsFromDefs(sectionDefs, left, right, viewAll);
}

/** @deprecated Use buildDocumentCompareSections */
export function buildDocumentCompareRows(
  left: NuxeoDocument,
  right: NuxeoDocument,
  viewAll: boolean,
): CompareRow[] {
  return buildDocumentCompareSections(left, right, viewAll).flatMap((section) => section.fields);
}
