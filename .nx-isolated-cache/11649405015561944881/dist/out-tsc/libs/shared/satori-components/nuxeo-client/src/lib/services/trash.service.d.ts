import { Observable } from 'rxjs';
import { NuxeoDocument, NuxeoDocumentList } from '../models/document.model';
import * as i0 from "@angular/core";
export interface SavedSearch {
    uid: string;
    title: string;
    params: Record<string, unknown>;
}
export interface TrashSearchParams {
    fullText?: string;
    path?: string;
    author?: string;
    sizeRanges?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    pageSize?: number;
    currentPageIndex?: number;
}
export declare class TrashService {
    private readonly api;
    private readonly http;
    searchTrash(params?: TrashSearchParams): Observable<NuxeoDocumentList>;
    getPathSuggestions(parentPath: string): Observable<NuxeoDocumentList>;
    restoreDocument(uid: string): Observable<NuxeoDocument>;
    permanentlyDelete(uid: string): Observable<void>;
    saveSearch(title: string, params: Record<string, unknown>): Observable<SavedSearch>;
    updateSearch(uid: string, title: string, params: Record<string, unknown>): Observable<SavedSearch>;
    getSavedSearches(): Observable<SavedSearch[]>;
    private sizeRangeToClause;
    static ɵfac: i0.ɵɵFactoryDeclaration<TrashService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<TrashService>;
}
//# sourceMappingURL=trash.service.d.ts.map