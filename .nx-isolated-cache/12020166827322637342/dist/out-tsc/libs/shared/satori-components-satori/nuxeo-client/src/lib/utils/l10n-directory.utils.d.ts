import { type DirectoryEntry, type L10nDirectoryEntry } from '../models/directory.model';
/** Localized label for an l10n directory entry (defaults to id). */
export declare function l10nEntryLabel(entry: L10nDirectoryEntry): string;
/** Resolves a nature vocabulary id to its display label. */
export declare function resolveNatureLabel(id: string | null | undefined, entries: DirectoryEntry[]): string;
/**
 * Formats an l10n directory value as `Parent/Child`, matching Nuxeo Web UI
 * (e.g. `Africa/Tanzania` for coverage). Reads the value Web UI stores, `africa/tanzania`, as well
 * as a bare child id.
 */
export declare function formatHierarchicalL10nLabel(id: string | null | undefined, entries: L10nDirectoryEntry[]): string;
export interface L10nOptionGroup {
    parentLabel: string;
    entries: L10nDirectoryEntry[];
}
/**
 * Groups child l10n directory entries under their parent label for hierarchical
 * mat-optgroup pickers (coverage, subjects).
 */
export declare function groupL10nChildrenByParent(entries: L10nDirectoryEntry[], query?: string): L10nOptionGroup[];
//# sourceMappingURL=l10n-directory.utils.d.ts.map