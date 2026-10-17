import { Observable } from 'rxjs';
import { DirectoryEntry, DirectoryMetadata, L10nDirectoryEntry, ManagedDirectoryEntry, VocabularyEntryFormValues } from '../models/directory.model';
import * as i0 from "@angular/core";
export declare class DirectoryService {
    private readonly api;
    private catalog$?;
    /** Nuxeo directory registry (name → metadata including parent vocabulary). */
    getDirectoryCatalog(): Observable<Map<string, DirectoryMetadata>>;
    /** Directory names for Administration → Vocabularies (excludes system directories). */
    listDirectoryNames(): Observable<string[]>;
    invalidateDirectoryCatalog(): void;
    private fetchDirectoryCatalog;
    private parseDirectoryCatalog;
    private extractDirectoryCatalogRows;
    /**
     * Loads active directory entries for metadata pickers via Directory.SuggestEntries.
     * Each call queries the server (Nuxeo Web UI parity — no session-wide list cache).
     * `lang` localises the labels; English unless the caller asks for another language.
     */
    getEntries(directoryName: string, lang?: string): Observable<DirectoryEntry[]>;
    /**
     * Loads all directory entries for the admin vocabularies table (includes obsolete entries).
     */
    getAdminEntries(directoryName: string): Observable<ManagedDirectoryEntry[]>;
    createEntry(directoryName: string, values: VocabularyEntryFormValues, metadata?: DirectoryMetadata): Observable<ManagedDirectoryEntry>;
    updateEntry(directoryName: string, entryId: string, values: VocabularyEntryFormValues, metadata?: DirectoryMetadata): Observable<ManagedDirectoryEntry>;
    deleteEntry(directoryName: string, entryId: string): Observable<void>;
    /**
     * Fetches entries from an l10n directory (l10nsubjects, l10ncoverage)
     * using the REST directory API with pagination. Returns only top-level
     * entries (parent === '').
     */
    getL10nEntries(directoryName: string): Observable<L10nDirectoryEntry[]>;
    /**
     * Fetches every entry from an l10n directory, including children, for
     * hierarchical pickers (e.g. grouped coverage / subjects dropdowns).
     */
    getAllL10nEntries(directoryName: string): Observable<L10nDirectoryEntry[]>;
    private fetchL10nEntries;
    getEventTypes(): Observable<DirectoryEntry[]>;
    getEventCategories(): Observable<DirectoryEntry[]>;
    private normalizeAdminEntry;
    private buildEntryProperties;
    static ɵfac: i0.ɵɵFactoryDeclaration<DirectoryService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DirectoryService>;
}
//# sourceMappingURL=directory.service.d.ts.map