import type { SearchAggregations, SearchResultItem } from '../models/search.model';
import * as i0 from "@angular/core";
export declare class SearchAggregationService {
    readonly aggregations: import("@angular/core").WritableSignal<SearchAggregations>;
    readonly items: import("@angular/core").WritableSignal<SearchResultItem[]>;
    readonly drawerFilters: import("@angular/core").WritableSignal<Record<string, string>>;
    readonly selectedSavedSearchId: import("@angular/core").WritableSignal<string>;
    readonly selectedSavedSearchTitle: import("@angular/core").WritableSignal<string>;
    /** Incremented whenever a saved search is created so the drawer can refresh its list. */
    readonly savedSearchVersion: import("@angular/core").WritableSignal<number>;
    markSavedSearchDirty(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<SearchAggregationService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<SearchAggregationService>;
}
//# sourceMappingURL=search-aggregation.service.d.ts.map