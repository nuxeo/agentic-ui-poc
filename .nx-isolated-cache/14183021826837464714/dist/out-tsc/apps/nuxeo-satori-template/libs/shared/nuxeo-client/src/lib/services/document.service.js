import { Injectable, inject } from '@angular/core';
import { RECENTLY_EDITED_QUERY, RECENTLY_VIEWED_QUERY, EXPIRED_DOCUMENTS_QUERY, } from '../queries/nxql-queries';
import { NuxeoApiBase } from './nuxeo-api-base';
import * as i0 from "@angular/core";
export class DocumentService {
    api = inject(NuxeoApiBase);
    getRecentlyEdited(pageSize = 10) {
        return this.api.nxqlSearch(RECENTLY_EDITED_QUERY, pageSize);
    }
    getRecentlyViewed(userId, pageSize = 10) {
        const query = RECENTLY_VIEWED_QUERY.replace(/\{user\}/g, userId);
        return this.api.nxqlSearch(query, pageSize);
    }
    getExpiredDocuments(pageSize = 20) {
        const now = new Date()
            .toISOString()
            .replace('T', ' ')
            .replace(/\.\d+Z$/, '');
        const query = EXPIRED_DOCUMENTS_QUERY.replace('{now}', now);
        return this.api.nxqlSearch(query, pageSize);
    }
    getById(docId) {
        return this.api.get(`/nuxeo/api/v1/id/${docId}`);
    }
    static ɵfac = function DocumentService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DocumentService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: DocumentService, factory: DocumentService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DocumentService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
