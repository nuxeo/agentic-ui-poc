import { Observable } from 'rxjs';
import type { NuxeoDocument } from '../models/document.model';
import * as i0 from "@angular/core";
type SelectionPreview = string | null;
export declare class SelectionService {
    private readonly documentDetailService;
    readonly selectedIds: import("@angular/core").WritableSignal<Set<string>>;
    readonly selectedLabels: import("@angular/core").WritableSignal<Map<string, string>>;
    readonly selectedPreviews: import("@angular/core").WritableSignal<Map<string, SelectionPreview>>;
    readonly selectedTypes: import("@angular/core").WritableSignal<Map<string, string>>;
    /** When true, the app shell topbar shows only count + Clear (e.g. note image picker). */
    readonly clearOnlyMode: import("@angular/core").WritableSignal<boolean>;
    readonly selectedCount: () => number;
    readonly selectedItems: () => {
        id: string;
        name: string;
        preview: string | null;
        type: string | undefined;
    }[];
    toggle(id: string, label?: string, preview?: SelectionPreview, type?: string): void;
    selectAll(ids: string[], labels?: Record<string, string>, previews?: Record<string, SelectionPreview>, types?: Record<string, string>): void;
    /**
     * Forgets the retained preview URLs, keeping the selection itself intact.
     *
     * Callers hand `toggle`/`selectAll` an object URL they own, and this service keeps the string —
     * so when the owner revokes that URL, this copy becomes a dangling reference and the selection
     * topbar renders `<img [src]>` against a revoked `blob:`, i.e. a broken image beside a still-selected
     * item. Selection is global and survives a new search, so the two lifetimes genuinely differ.
     *
     * Fixing the object-URL leak is what exposed this: before, nothing was ever revoked, so the stale
     * copy stayed loadable by accident. Owners now call this immediately before revoking a batch, which
     * degrades the popup to its placeholder rather than showing a broken image.
     *
     * This is the conservative half of the fix. The complete one is for this service to own preview
     * lifetime — hold the blobs, or refetch on demand — so a selection keeps its thumbnails across a
     * search. That is a design change to a shared service and is deliberately not bundled here.
     */
    forgetPreviews(): void;
    isSelected(id: string): boolean;
    isAllSelected(ids: string[]): boolean;
    isIndeterminate(ids: string[]): boolean;
    clear(): void;
    /** Clears selection and exits clear-only topbar mode (logout, session reset). */
    resetUiState(): void;
    setClearOnlyMode(enabled: boolean): void;
    deleteSelected(): Observable<NuxeoDocument[]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<SelectionService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<SelectionService>;
}
export {};
//# sourceMappingURL=selection.service.d.ts.map