import * as i0 from "@angular/core";
export interface TrashFilters {
    fullText: string;
    path: string;
    author: string;
    sizeRanges: string[];
}
export interface TrashResultItem {
    uid: string;
    title: string;
    type: string;
}
export type TrashLayoutMode = 'filters' | 'results';
export declare class TrashFilterService {
    readonly filters: import("@angular/core").WritableSignal<TrashFilters>;
    readonly layoutMode: import("@angular/core").WritableSignal<TrashLayoutMode>;
    readonly results: import("@angular/core").WritableSignal<TrashResultItem[]>;
    readonly resultThumbnails: import("@angular/core").WritableSignal<Record<string, string | null>>;
    readonly totalResults: import("@angular/core").WritableSignal<number>;
    readonly resultsLoading: import("@angular/core").WritableSignal<boolean>;
    readonly savedSearchVersion: import("@angular/core").WritableSignal<number>;
    readonly activeSavedFilterUid: import("@angular/core").WritableSignal<string | null>;
    readonly activeSavedFilterTitle: import("@angular/core").WritableSignal<string | null>;
    readonly hasSavedFilter: import("@angular/core").Signal<boolean>;
    reset(): void;
    toggleLayout(): void;
    markSavedSearchDirty(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<TrashFilterService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<TrashFilterService>;
}
//# sourceMappingURL=trash-filter.service.d.ts.map