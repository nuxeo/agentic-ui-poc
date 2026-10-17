import { AssetAggregations } from '../models/asset.model';
import * as i0 from "@angular/core";
export interface AssetQueueItem {
    id: string;
    title: string;
    type: string;
    icon: string;
}
export declare class AssetAggregationService {
    readonly aggregations: import("@angular/core").WritableSignal<AssetAggregations>;
    readonly items: import("@angular/core").WritableSignal<AssetQueueItem[]>;
    readonly selectedSavedSearchId: import("@angular/core").WritableSignal<string>;
    readonly selectedSavedSearchTitle: import("@angular/core").WritableSignal<string>;
    readonly savedSearchVersion: import("@angular/core").WritableSignal<number>;
    markSavedSearchDirty(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<AssetAggregationService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AssetAggregationService>;
}
//# sourceMappingURL=asset-aggregation.service.d.ts.map