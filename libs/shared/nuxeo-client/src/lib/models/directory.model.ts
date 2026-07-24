/** Common directory / vocabulary names when the server does not expose a list endpoint. */
export const FALLBACK_DIRECTORY_NAMES = [
  'continent',
  'country',
  'eventTypes',
  'eventCategories',
  'l10nsubjects',
  'l10ncoverage',
  'nature',
  'subtopic',
  'oauth2TokenTypes',
  'language',
] as const;

/** Directories used for audit/system UI — excluded from Administration → Vocabularies. */
export const SYSTEM_DIRECTORY_NAMES = new Set([
  'eventTypes',
  'eventCategories',
  'oauth2TokenTypes',
]);

export interface DirectoryEntry {
  id: string;
  label: string;
  displayLabel: string;
  /** Hierarchical label from Directory.SuggestEntries (Web UI parity). */
  absoluteLabel?: string;
  ordering: number;
  obsolete: number;
  directoryName: string;
}

/** Default ordering for new vocabulary entries (Nuxeo Web UI parity). */
export const DEFAULT_VOCABULARY_ORDERING = 10_000_000;

export interface VocabularyEntryFormValues {
  id: string;
  label: string;
  ordering: number;
  obsolete: boolean;
  parent?: string;
}

/** Directory entry as shown in Administration → Vocabularies. */
export interface ManagedDirectoryEntry {
  id: string;
  directoryName: string;
  label: string;
  ordering: number;
  obsolete: boolean;
  parent?: string;
  /** Property keys from the Nuxeo directory entry (Web UI column detection). */
  propertyKeys: string[];
}

export interface DirectoryEntryRest {
  id: string;
  directoryName: string;
  properties: Record<string, string | number | boolean | null | undefined>;
}

export interface DirectoryEntriesResponse {
  entries: DirectoryEntryRest[];
  currentPageIndex: number;
  isNextPageAvailable: boolean;
}

/** Directory registry entry from GET /nuxeo/api/v1/directory (Web UI vocabulary metadata). */
export interface DirectoryMetadata {
  name: string;
  schema?: string;
  idField?: string;
  /** Parent directory name when entries reference another vocabulary (e.g. continent for country). */
  parentDirectory?: string;
  /** Nuxeo directory type; Web UI hides `system` directories from the vocabularies admin page. */
  type?: string;
}

/** Web UI: parent column when the entry schema includes a parent property. */
export function entryPropertiesIncludeParent(keys: readonly string[]): boolean {
  return keys.includes('parent');
}

/** Case-insensitive catalog lookup. */
export function getDirectoryMetadata(
  catalog: Map<string, DirectoryMetadata>,
  directoryName: string,
): DirectoryMetadata | undefined {
  if (!directoryName) return undefined;
  const direct = catalog.get(directoryName);
  if (direct) return direct;
  const lower = directoryName.toLowerCase();
  for (const [name, meta] of catalog) {
    if (name.toLowerCase() === lower) return meta;
  }
  return undefined;
}

/** Build table column ids in Web UI order (parent before id when present). */
export function buildVocabularyTableColumns(propertyKeys: readonly string[]): string[] {
  const keys = new Set(propertyKeys);
  const columns: string[] = [];
  if (keys.has('parent')) columns.push('parent');
  columns.push('id');
  if (keys.has('label') || keys.size === 0 || [...keys].some((key) => key.startsWith('label_'))) {
    columns.push('label');
  }
  // Admin table always exposes these — Nuxeo may omit them from entry property keys.
  columns.push('obsolete', 'ordering', 'actions');
  return columns;
}

/** Whether the vocabulary table/dialog should include a parent field/column. */
export function vocabularySupportsParent(
  directoryName: string,
  metadata: DirectoryMetadata | undefined,
  entries: readonly Pick<ManagedDirectoryEntry, 'propertyKeys' | 'parent'>[],
): boolean {
  if (directoryShowsParentField(directoryName, metadata)) return true;
  return entries.some((entry) => entry.propertyKeys.includes('parent') || !!entry.parent);
}

/** Resolve admin table columns using catalog metadata and loaded entry properties. */
export function vocabularyTableColumns(
  directoryName: string,
  metadata: DirectoryMetadata | undefined,
  entries: readonly ManagedDirectoryEntry[],
): string[] {
  const showParent = vocabularySupportsParent(directoryName, metadata, entries);
  const keys = new Set<string>();
  for (const entry of entries) {
    for (const key of entry.propertyKeys) keys.add(key);
  }
  if (showParent) keys.add('parent');

  if (keys.size > 0) {
    return buildVocabularyTableColumns([...keys]);
  }

  return showParent
    ? ['parent', 'id', 'label', 'obsolete', 'ordering', 'actions']
    : ['id', 'label', 'obsolete', 'ordering', 'actions'];
}

export function defaultVocabularyLabel(directoryName: string, id: string): string {
  const trimmedId = id.trim();
  if (!trimmedId) return '';
  return `label.directories.${directoryName}.${trimmedId}`;
}

/** Whether a directory appears in Administration → Vocabularies (Nuxeo Web UI parity). */
export function isManagedDirectory(metadata: Pick<DirectoryMetadata, 'type'>): boolean {
  return metadata.type?.toLowerCase() !== 'system';
}

/** Whether a directory name is manageable when catalog metadata is unavailable. */
export function isManagedDirectoryName(name: string): boolean {
  return !SYSTEM_DIRECTORY_NAMES.has(name);
}

/** Raw label stored on the directory entry — shown as-is in the admin table (Web UI parity). */
export function directoryAdminTableLabel(entry: Pick<ManagedDirectoryEntry, 'label'>): string {
  return entry.label;
}

/** Whether a stored directory label value is an unresolved i18n key. */
export function isDirectoryI18nKey(value: string | undefined | null): boolean {
  if (!value?.trim()) return false;
  return /^label\.directories\./i.test(value.trim());
}

/** Formats a vocabulary entry id for picker display (Web UI parity). */
export function formatDirectoryEntryId(id: string): string {
  const trimmed = id.trim();
  if (!trimmed) return '';
  if (isDirectoryI18nKey(trimmed)) {
    const segment = trimmed.split('.').pop() ?? trimmed;
    return formatDirectoryEntryId(segment);
  }
  return trimmed
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Human-readable label for directory entries whose label is an i18n key. */
export function directoryEntryDisplayLabel(
  entry: Pick<ManagedDirectoryEntry, 'id' | 'label'>,
): string {
  const label = entry.label?.trim() ?? '';
  if (isDirectoryI18nKey(label)) {
    return formatDirectoryEntryId(entry.id);
  }
  return label || formatDirectoryEntryId(entry.id);
}

/**
 * Resolves the label shown in vocabulary pickers (Nuxeo Web UI parity:
 * absoluteLabel → displayLabel → formatted id for i18n keys).
 */
export function directoryPickerLabel(
  entry: Pick<DirectoryEntry, 'id' | 'label' | 'displayLabel'> & { absoluteLabel?: string },
): string {
  const absolute = entry.absoluteLabel?.trim();
  if (absolute && !isDirectoryI18nKey(absolute)) return absolute;

  const display = entry.displayLabel?.trim();
  if (display && !isDirectoryI18nKey(display)) return display;

  const label = entry.label?.trim();
  if (label && !isDirectoryI18nKey(label)) return label;

  return formatDirectoryEntryId(entry.id);
}

/** Client-side filter/sort for vocabulary picker dropdowns (Nature, etc.). */
export function filterDirectoryPickerEntries(
  entries: DirectoryEntry[],
  query = '',
): DirectoryEntry[] {
  const q = query.trim().toLowerCase();
  return entries
    .filter((entry) => {
      if (!q) return true;
      const label = directoryPickerLabel(entry).toLowerCase();
      return label.includes(q) || entry.id.toLowerCase().includes(q);
    })
    .sort((a, b) => directoryPickerLabel(a).localeCompare(directoryPickerLabel(b)));
}

export function directoryUsesL10nLabel(directoryName: string): boolean {
  return directoryName.toLowerCase().startsWith('l10n');
}

/** Whether vocabulary entries support a parent field (Web UI parity). */
export function directoryShowsParentField(
  directoryName: string,
  metadata?: DirectoryMetadata,
): boolean {
  const schema = metadata?.schema?.toLowerCase();
  if (schema === 'l10nxvocabulary') return true;
  if (schema === 'xvocabulary') {
    return !!(metadata?.parentDirectory && metadata.parentDirectory !== directoryName);
  }
  if (metadata?.parentDirectory && metadata.parentDirectory !== directoryName) {
    return true;
  }
  if (directoryUsesL10nLabel(directoryName)) return true;
  const lower = directoryName.toLowerCase();
  return lower === 'country' || lower === 'subtopic';
}

/**
 * Directory whose entries populate the parent dropdown.
 * Uses Nuxeo directory registry metadata when available.
 */
export function resolveParentSourceName(
  directoryName: string,
  metadata?: DirectoryMetadata,
): string | null {
  if (!directoryShowsParentField(directoryName, metadata)) return null;
  if (metadata?.parentDirectory) return metadata.parentDirectory;
  const lower = directoryName.toLowerCase();
  if (lower === 'country') return 'continent';
  if (lower === 'subtopic') return 'topic';
  if (directoryUsesL10nLabel(directoryName)) return directoryName;
  return null;
}

/** Parent is required when options come from a different vocabulary (e.g. country → continent). */
export function vocabularyParentRequired(
  directoryName: string,
  metadata?: DirectoryMetadata,
): boolean {
  const source = resolveParentSourceName(directoryName, metadata);
  return !!source && source !== directoryName;
}

export interface L10nDirectoryEntry {
  id: string;
  directoryName: string;
  properties: {
    id: string;
    parent: string;
    ordering: number;
    obsolete: number;
    label_en?: string;
    label_fr?: string;
  };
}

export interface L10nDirectoryResponse {
  entries: L10nDirectoryEntry[];
  currentPageIndex: number;
  isNextPageAvailable: boolean;
}
