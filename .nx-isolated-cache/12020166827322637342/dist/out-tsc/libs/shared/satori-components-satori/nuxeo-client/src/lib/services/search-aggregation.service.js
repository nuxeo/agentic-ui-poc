import { Injectable, signal } from '@angular/core';
import * as i0 from "@angular/core";
export class SearchAggregationService {
    aggregations = signal({}, ...(ngDevMode ? [{ debugName: "aggregations" }] : []));
    items = signal([], ...(ngDevMode ? [{ debugName: "items" }] : []));
    drawerFilters = signal({}, ...(ngDevMode ? [{ debugName: "drawerFilters" }] : []));
    selectedSavedSearchId = signal('', ...(ngDevMode ? [{ debugName: "selectedSavedSearchId" }] : []));
    selectedSavedSearchTitle = signal('', ...(ngDevMode ? [{ debugName: "selectedSavedSearchTitle" }] : []));
    /** Incremented whenever a saved search is created so the drawer can refresh its list. */
    savedSearchVersion = signal(0, ...(ngDevMode ? [{ debugName: "savedSearchVersion" }] : []));
    markSavedSearchDirty() {
        this.savedSearchVersion.update((v) => v + 1);
    }
    static ɵfac = function SearchAggregationService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SearchAggregationService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: SearchAggregationService, factory: SearchAggregationService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SearchAggregationService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
//# sourceMappingURL=search-aggregation.service.js.map