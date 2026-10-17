import { Injectable, computed, signal } from '@angular/core';
import * as i0 from "@angular/core";
const EMPTY_FILTERS = { fullText: '', path: '/', author: '', sizeRanges: [] };
export class TrashFilterService {
    filters = signal({ ...EMPTY_FILTERS }, ...(ngDevMode ? [{ debugName: "filters", equal: () => false }] : [{ equal: () => false }]));
    layoutMode = signal('filters', ...(ngDevMode ? [{ debugName: "layoutMode" }] : []));
    results = signal([], ...(ngDevMode ? [{ debugName: "results" }] : []));
    resultThumbnails = signal({}, ...(ngDevMode ? [{ debugName: "resultThumbnails" }] : []));
    totalResults = signal(0, ...(ngDevMode ? [{ debugName: "totalResults" }] : []));
    resultsLoading = signal(false, ...(ngDevMode ? [{ debugName: "resultsLoading" }] : []));
    savedSearchVersion = signal(0, ...(ngDevMode ? [{ debugName: "savedSearchVersion" }] : []));
    activeSavedFilterUid = signal(null, ...(ngDevMode ? [{ debugName: "activeSavedFilterUid" }] : []));
    activeSavedFilterTitle = signal(null, ...(ngDevMode ? [{ debugName: "activeSavedFilterTitle" }] : []));
    hasSavedFilter = computed(() => this.activeSavedFilterUid() !== null, ...(ngDevMode ? [{ debugName: "hasSavedFilter" }] : []));
    reset() {
        this.filters.set({ ...EMPTY_FILTERS });
        this.activeSavedFilterUid.set(null);
        this.activeSavedFilterTitle.set(null);
    }
    toggleLayout() {
        this.layoutMode.update((m) => (m === 'filters' ? 'results' : 'filters'));
    }
    markSavedSearchDirty() {
        this.savedSearchVersion.update((v) => v + 1);
    }
    static ɵfac = function TrashFilterService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TrashFilterService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: TrashFilterService, factory: TrashFilterService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(TrashFilterService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
//# sourceMappingURL=trash-filter.service.js.map