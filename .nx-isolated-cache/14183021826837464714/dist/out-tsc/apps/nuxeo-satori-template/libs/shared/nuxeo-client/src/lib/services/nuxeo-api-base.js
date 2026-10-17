import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { NUXEO_API_ORIGIN } from '../nuxeo-api.config';
import * as i0 from "@angular/core";
export class NuxeoApiBase {
    http = inject(HttpClient);
    apiOrigin = inject(NUXEO_API_ORIGIN);
    apiUrl(path) {
        return `${this.apiOrigin.replace(/\/$/, '')}${path}`;
    }
    get(path, params, headers) {
        return this.http.get(this.apiUrl(path), { params, headers });
    }
    post(path, body, headers) {
        return this.http.post(this.apiUrl(path), body, { headers });
    }
    put(path, body, headers) {
        return this.http.put(this.apiUrl(path), body, { headers });
    }
    delete(path, headers) {
        return this.http.delete(this.apiUrl(path), { headers });
    }
    nxqlSearch(query, pageSize, headers = { properties: 'dublincore' }) {
        const params = new HttpParams().set('query', query).set('pageSize', pageSize);
        return this.http.get(this.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'), {
            params,
            headers,
        });
    }
    static ɵfac = function NuxeoApiBase_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NuxeoApiBase)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: NuxeoApiBase, factory: NuxeoApiBase.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NuxeoApiBase, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
