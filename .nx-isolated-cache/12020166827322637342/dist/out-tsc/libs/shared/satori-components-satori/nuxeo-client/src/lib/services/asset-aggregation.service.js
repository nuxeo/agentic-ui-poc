import { Injectable, signal } from '@angular/core';
import * as i0 from "@angular/core";
export class AssetAggregationService {
    aggregations = signal({}, ...(ngDevMode ? [{ debugName: "aggregations" }] : []));
    items = signal([], ...(ngDevMode ? [{ debugName: "items" }] : []));
    selectedSavedSearchId = signal('', ...(ngDevMode ? [{ debugName: "selectedSavedSearchId" }] : []));
    selectedSavedSearchTitle = signal('', ...(ngDevMode ? [{ debugName: "selectedSavedSearchTitle" }] : []));
    savedSearchVersion = signal(0, ...(ngDevMode ? [{ debugName: "savedSearchVersion" }] : []));
    markSavedSearchDirty() {
        this.savedSearchVersion.update((v) => v + 1);
    }
    static ɵfac = function AssetAggregationService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AssetAggregationService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: AssetAggregationService, factory: AssetAggregationService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AssetAggregationService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
//# sourceMappingURL=asset-aggregation.service.js.map