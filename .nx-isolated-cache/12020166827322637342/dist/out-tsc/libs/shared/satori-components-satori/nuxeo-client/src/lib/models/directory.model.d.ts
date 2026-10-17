/** Common directory / vocabulary names when the server does not expose a list endpoint. */
export declare const FALLBACK_DIRECTORY_NAMES: readonly ["continent", "country", "eventTypes", "eventCategories", "l10nsubjects", "l10ncoverage", "nature", "subtopic", "oauth2TokenTypes", "language"];
/** Directories used for audit/system UI — excluded from Administration → Vocabularies. */
export declare const SYSTEM_DIRECTORY_NAMES: Set<string>;
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
export declare const DEFAULT_VOCABULARY_ORDERING = 10000000;
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
export declare function entryPropertiesIncludeParent(keys: readonly string[]): boolean;
/** Case-insensitive catalog lookup. */
export declare function getDirectoryMetadata(catalog: Map<string, DirectoryMetadata>, directoryName: string): DirectoryMetadata | undefined;
/** Build table column ids in Web UI order (parent before id when present). */
export declare function buildVocabularyTableColumns(propertyKeys: readonly string[]): string[];
/** Whether the vocabulary table/dialog should include a parent field/column. */
export declare function vocabularySupportsParent(directoryName: string, metadata: DirectoryMetadata | undefined, entries: readonly Pick<ManagedDirectoryEntry, 'propertyKeys' | 'parent'>[]): boolean;
/** Resolve admin table columns using catalog metadata and loaded entry properties. */
export declare function vocabularyTableColumns(directoryName: string, metadata: DirectoryMetadata | undefined, entries: readonly ManagedDirectoryEntry[]): string[];
export declare function defaultVocabularyLabel(directoryName: string, id: string): string;
/** Whether a directory appears in Administration → Vocabularies (Nuxeo Web UI parity). */
export declare function isManagedDirectory(metadata: Pick<DirectoryMetadata, 'type'>): boolean;
/** Whether a directory name is manageable when catalog metadata is unavailable. */
export declare function isManagedDirectoryName(name: string): boolean;
/** Raw label stored on the directory entry — shown as-is in the admin table (Web UI parity). */
export declare function directoryAdminTableLabel(entry: Pick<ManagedDirectoryEntry, 'label'>): string;
/** Whether a stored directory label value is an unresolved i18n key. */
export declare function isDirectoryI18nKey(value: string | undefined | null): boolean;
/** Formats a vocabulary entry id for picker display (Web UI parity). */
export declare function formatDirectoryEntryId(id: string): string;
/** Human-readable label for directory entries whose label is an i18n key. */
export declare function directoryEntryDisplayLabel(entry: Pick<ManagedDirectoryEntry, 'id' | 'label'>): string;
/**
 * Resolves the label shown in vocabulary pickers (Nuxeo Web UI parity:
 * absoluteLabel → displayLabel → formatted id for i18n keys).
 */
export declare function directoryPickerLabel(entry: Pick<DirectoryEntry, 'id' | 'displayLabel'> & {
    label?: string;
    absoluteLabel?: string;
}): string;
/** Client-side filter/sort for vocabulary picker dropdowns (Nature, etc.). */
export declare function filterDirectoryPickerEntries(entries: DirectoryEntry[], query?: string): DirectoryEntry[];
export declare function directoryUsesL10nLabel(directoryName: string): boolean;
/** Whether vocabulary entries support a parent field (Web UI parity). */
export declare function directoryShowsParentField(directoryName: string, metadata?: DirectoryMetadata): boolean;
/**
 * Directory whose entries populate the parent dropdown.
 * Uses Nuxeo directory registry metadata when available.
 */
export declare function resolveParentSourceName(directoryName: string, metadata?: DirectoryMetadata): string | null;
/** Parent is required when options come from a different vocabulary (e.g. country → continent). */
export declare function vocabularyParentRequired(directoryName: string, metadata?: DirectoryMetadata): boolean;
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
//# sourceMappingURL=directory.model.d.ts.map