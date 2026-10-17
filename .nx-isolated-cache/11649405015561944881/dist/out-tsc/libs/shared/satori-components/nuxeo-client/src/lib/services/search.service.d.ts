import { Observable } from 'rxjs';
import type { NuxeoDocumentList } from '../models/document.model';
import type { SearchResponse } from '../models/search.model';
import * as i0 from "@angular/core";
export interface SearchQueryParams {
    q?: string;
    ecmFulltext?: string;
    quickFilters?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    modifiedDate?: string;
    author?: string;
    collection?: string;
    tag?: string;
    nature?: string;
    subjects?: string;
    coverage?: string;
    size?: string;
    pageIndex?: number;
    pageSize?: number;
}
export interface SearchCollectionOption {
    id: string;
    title: string;
    itemCount: number;
}
export interface SavedSearchOption {
    id: string;
    title: string;
    query?: string;
}
export interface SaveSavedSearchParams {
    title: string;
    params: Record<string, string>;
    pageProviderName?: string;
}
export interface GlobalSearchSuggestion {
    id: string;
    displayLabel: string;
    displayLabelHighlights?: Array<{
        text: string;
        matched: boolean;
    }>;
    pathHighlights?: Array<{
        text: string;
        matched: boolean;
    }>;
    kind: 'document' | 'user' | 'group' | 'other';
    documentUid?: string;
    path?: string;
    prefixedId?: string;
}
export declare class SearchService {
    private readonly api;
    private readonly tags;
    private readonly savedSearchHighlight;
    suggestFromSuggestersLauncher(searchTerm: string, pageSize?: number): Observable<GlobalSearchSuggestion[]>;
    suggest(searchTerm: string, pageSize?: number): Observable<GlobalSearchSuggestion[]>;
    private suggestFallback;
    getUserCollections(): Observable<SearchCollectionOption[]>;
    /**
     * Picture documents for the note RTE "insert from existing documents" picker.
     * Matches Web UI `nuxeo-document-picker` (`provider="document_picker"`,
     * `schemas="dublincore,file"`, `fulltext_all` param). Falls back to NXQL when the
     * ES-backed page provider is unavailable (`file:content` mapping errors).
     */
    searchDocumentPicker(options?: {
        fulltext?: string;
        pageSize?: number;
        pageIndex?: number;
    }): Observable<NuxeoDocumentList>;
    private normalizePicturePickerList;
    private searchDocumentPickerNxql;
    getSavedSearches(pageProvider?: string): Observable<SavedSearchOption[]>;
    getSavedSearchById(id: string): Observable<Record<string, string>>;
    saveSavedSearch(request: SaveSavedSearchParams): Observable<unknown>;
    updateSavedSearch(id: string, request: SaveSavedSearchParams): Observable<unknown>;
    /**
     * Renames a saved search and leaves its filters as stored. The request carries no `params`, so
     * the server keeps the ones it has — whichever application wrote them.
     */
    renameSavedSearch(id: string, title: string, pageProviderName?: string): Observable<unknown>;
    deleteSavedSearch(id: string): Observable<unknown>;
    search(params: SearchQueryParams): Observable<SearchResponse>;
    /**
     * Tag labels that start with `term`, from `TagService.suggestTags` (Nuxeo's `Tag.Suggestion`) —
     * what Web UI's search form offers in its Tags field. Empty for a blank term, and on failure, so a
     * typeahead stays usable.
     */
    getTagSuggestions(term: string): Observable<string[]>;
    private asPrincipalName;
    private parseSizeInBytes;
    private firstString;
    private normalizeAggregations;
    private normalizeSuggestions;
    private extractSuggestionItems;
    private extractArraysFromContainer;
    private looksLikeSuggestionItem;
    private mapSuggestion;
    private extractHighlightsByField;
    private pickHighlightParts;
    private toHighlightParts;
    private stripTags;
    private asString;
    static ɵfac: i0.ɵɵFactoryDeclaration<SearchService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<SearchService>;
}
//# sourceMappingURL=search.service.d.ts.map