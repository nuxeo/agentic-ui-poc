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
];
/** Directories used for audit/system UI — excluded from Administration → Vocabularies. */
export const SYSTEM_DIRECTORY_NAMES = new Set([
    'eventTypes',
    'eventCategories',
    'oauth2TokenTypes',
]);
/** Default ordering for new vocabulary entries (Nuxeo Web UI parity). */
export const DEFAULT_VOCABULARY_ORDERING = 10_000_000;
/** Web UI: parent column when the entry schema includes a parent property. */
export function entryPropertiesIncludeParent(keys) {
    return keys.includes('parent');
}
/** Case-insensitive catalog lookup. */
export function getDirectoryMetadata(catalog, directoryName) {
    if (!directoryName)
        return undefined;
    const direct = catalog.get(directoryName);
    if (direct)
        return direct;
    const lower = directoryName.toLowerCase();
    for (const [name, meta] of catalog) {
        if (name.toLowerCase() === lower)
            return meta;
    }
    return undefined;
}
/** Build table column ids in Web UI order (parent before id when present). */
export function buildVocabularyTableColumns(propertyKeys) {
    const keys = new Set(propertyKeys);
    const columns = [];
    if (keys.has('parent'))
        columns.push('parent');
    columns.push('id');
    if (keys.has('label') || keys.size === 0 || [...keys].some((key) => key.startsWith('label_'))) {
        columns.push('label');
    }
    // Admin table always exposes these — Nuxeo may omit them from entry property keys.
    columns.push('obsolete', 'ordering', 'actions');
    return columns;
}
/** Whether the vocabulary table/dialog should include a parent field/column. */
export function vocabularySupportsParent(directoryName, metadata, entries) {
    if (directoryShowsParentField(directoryName, metadata))
        return true;
    return entries.some((entry) => entry.propertyKeys.includes('parent') || !!entry.parent);
}
/** Resolve admin table columns using catalog metadata and loaded entry properties. */
export function vocabularyTableColumns(directoryName, metadata, entries) {
    const showParent = vocabularySupportsParent(directoryName, metadata, entries);
    const keys = new Set();
    for (const entry of entries) {
        for (const key of entry.propertyKeys)
            keys.add(key);
    }
    if (showParent)
        keys.add('parent');
    if (keys.size > 0) {
        return buildVocabularyTableColumns([...keys]);
    }
    return showParent
        ? ['parent', 'id', 'label', 'obsolete', 'ordering', 'actions']
        : ['id', 'label', 'obsolete', 'ordering', 'actions'];
}
export function defaultVocabularyLabel(directoryName, id) {
    const trimmedId = id.trim();
    if (!trimmedId)
        return '';
    return `label.directories.${directoryName}.${trimmedId}`;
}
/** Whether a directory appears in Administration → Vocabularies (Nuxeo Web UI parity). */
export function isManagedDirectory(metadata) {
    return metadata.type?.toLowerCase() !== 'system';
}
/** Whether a directory name is manageable when catalog metadata is unavailable. */
export function isManagedDirectoryName(name) {
    return !SYSTEM_DIRECTORY_NAMES.has(name);
}
/** Raw label stored on the directory entry — shown as-is in the admin table (Web UI parity). */
export function directoryAdminTableLabel(entry) {
    return entry.label;
}
/** Whether a stored directory label value is an unresolved i18n key. */
export function isDirectoryI18nKey(value) {
    if (!value?.trim())
        return false;
    return /^label\.directories\./i.test(value.trim());
}
/** Formats a vocabulary entry id for picker display (Web UI parity). */
export function formatDirectoryEntryId(id) {
    const trimmed = id.trim();
    if (!trimmed)
        return '';
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
export function directoryEntryDisplayLabel(entry) {
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
// `label` is optional because a `SuggestEntries` payload omits it, which the body has
// always tolerated via `entry.label?.trim()`. Requiring it here made the signature
// stricter than both the implementation and the server, and rejected a legitimate
// caller; no gate typechecked the spec that proved it.
entry) {
    const absolute = entry.absoluteLabel?.trim();
    if (absolute && !isDirectoryI18nKey(absolute))
        return absolute;
    const display = entry.displayLabel?.trim();
    if (display && !isDirectoryI18nKey(display))
        return display;
    const label = entry.label?.trim();
    if (label && !isDirectoryI18nKey(label))
        return label;
    return formatDirectoryEntryId(entry.id);
}
/** Client-side filter/sort for vocabulary picker dropdowns (Nature, etc.). */
export function filterDirectoryPickerEntries(entries, query = '') {
    const q = query.trim().toLowerCase();
    return entries
        .filter((entry) => {
        if (!q)
            return true;
        const label = directoryPickerLabel(entry).toLowerCase();
        return label.includes(q) || entry.id.toLowerCase().includes(q);
    })
        .sort((a, b) => directoryPickerLabel(a).localeCompare(directoryPickerLabel(b)));
}
export function directoryUsesL10nLabel(directoryName) {
    return directoryName.toLowerCase().startsWith('l10n');
}
/** Whether vocabulary entries support a parent field (Web UI parity). */
export function directoryShowsParentField(directoryName, metadata) {
    const schema = metadata?.schema?.toLowerCase();
    if (schema === 'l10nxvocabulary')
        return true;
    if (schema === 'xvocabulary') {
        return !!(metadata?.parentDirectory && metadata.parentDirectory !== directoryName);
    }
    if (metadata?.parentDirectory && metadata.parentDirectory !== directoryName) {
        return true;
    }
    if (directoryUsesL10nLabel(directoryName))
        return true;
    const lower = directoryName.toLowerCase();
    return lower === 'country' || lower === 'subtopic';
}
/**
 * Directory whose entries populate the parent dropdown.
 * Uses Nuxeo directory registry metadata when available.
 */
export function resolveParentSourceName(directoryName, metadata) {
    if (!directoryShowsParentField(directoryName, metadata))
        return null;
    if (metadata?.parentDirectory)
        return metadata.parentDirectory;
    const lower = directoryName.toLowerCase();
    if (lower === 'country')
        return 'continent';
    if (lower === 'subtopic')
        return 'topic';
    if (directoryUsesL10nLabel(directoryName))
        return directoryName;
    return null;
}
/** Parent is required when options come from a different vocabulary (e.g. country → continent). */
export function vocabularyParentRequired(directoryName, metadata) {
    const source = resolveParentSourceName(directoryName, metadata);
    return !!source && source !== directoryName;
}
//# sourceMappingURL=directory.model.js.map