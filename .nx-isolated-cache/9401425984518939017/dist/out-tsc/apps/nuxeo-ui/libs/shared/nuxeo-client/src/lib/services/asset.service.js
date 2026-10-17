import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { NuxeoApiBase } from './nuxeo-api-base';
import * as i0 from "@angular/core";
export class AssetService {
    api = inject(NuxeoApiBase);
    searchAssets(params = {}) {
        const { pageIndex = 0, pageSize = 40, ecmFulltext, primaryTypes = [], mimeTypes = [], widths = [], heights = [], colorProfiles = [], colorDepths = [], videoDurations = [], sortBy, sortOrder, } = params;
        let httpParams = new HttpParams()
            .set('currentPageIndex', pageIndex)
            .set('offset', pageIndex * pageSize)
            .set('pageSize', pageSize);
        const addAggParam = (key, values) => {
            if (values.length > 0) {
                httpParams = httpParams.set(key, JSON.stringify(values));
            }
        };
        addAggParam('system_primaryType_agg', primaryTypes);
        addAggParam('system_mimetype_agg', mimeTypes);
        addAggParam('asset_width_agg', widths);
        addAggParam('asset_height_agg', heights);
        addAggParam('color_profile_agg', colorProfiles);
        addAggParam('color_depth_agg', colorDepths);
        addAggParam('video_duration_agg', videoDurations);
        if (sortBy) {
            httpParams = httpParams.set('sortBy', sortBy);
        }
        if (sortOrder) {
            httpParams = httpParams.set('sortOrder', sortOrder);
        }
        const fulltext = ecmFulltext?.trim();
        if (fulltext) {
            httpParams = httpParams.set('ecm_fulltext', fulltext);
        }
        return this.api.get('/nuxeo/api/v1/search/pp/assets_search/execute', httpParams, { properties: '*' });
    }
    static ɵfac = function AssetService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AssetService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: AssetService, factory: AssetService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AssetService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
