import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { of, switchMap } from 'rxjs';
import { FAVORITES_COLLECTION_QUERY } from '../queries/nxql-queries';
import { NuxeoApiBase } from './nuxeo-api-base';
import { withSort } from './browse.service';
import * as i0 from "@angular/core";
export class CollectionService {
    api = inject(NuxeoApiBase);
    http = inject(HttpClient);
    getById(uid) {
        return this.api.get(`/nuxeo/api/v1/id/${uid}`, undefined, {
            properties: 'dublincore',
            'enrichers.document': 'permissions',
            'fetch-document': 'lock',
        });
    }
    getAll(pageSize = 100) {
        const query = `SELECT * FROM Collection WHERE ecm:isTrashed = 0 ` +
            `AND ecm:currentLifeCycleState != 'deleted' ORDER BY dc:modified DESC`;
        return this.api.nxqlSearch(query, pageSize);
    }
    getFavorites(userId, pageSize = 10) {
        const collectionQuery = FAVORITES_COLLECTION_QUERY.replace(/\{user\}/g, userId);
        return this.api.nxqlSearch(collectionQuery, 1).pipe(switchMap((res) => {
            const favCollection = res.entries[0];
            if (!favCollection) {
                return of({
                    entries: [],
                    totalSize: 0,
                    currentPageSize: 0,
                    currentPageIndex: 0,
                    numberOfPages: 0,
                });
            }
            return this.getCollectionMembers(favCollection.uid, pageSize);
        }));
    }
    /**
     * One page of a collection's members, in the order asked for. The page provider counts every
     * member, so `totalSize` is the collection's size on every page.
     */
    getCollectionMembers(collectionUid, pageSize = 50, page) {
        const params = withSort(new HttpParams()
            .set('queryParams', collectionUid)
            .set('pageSize', pageSize)
            .set('currentPageIndex', page?.currentPageIndex ?? 0), page?.sort);
        return this.api.get('/nuxeo/api/v1/search/pp/default_content_collection/execute', params, { properties: 'dublincore' });
    }
    updateProperties(uid, properties) {
        return this.api.put(`/nuxeo/api/v1/id/${uid}`, { 'entity-type': 'document', properties }, { 'Content-Type': 'application/json', properties: 'dublincore' });
    }
    /**
     * Triggers a bulk download of all member documents in a collection,
     * returned as a zip file. Uses the Nuxeo `Blob.BulkDownload` automation.
     */
    bulkDownload(collectionUid, filename = 'export.zip') {
        return this.http.post(this.api.apiUrl('/nuxeo/api/v1/automation/Blob.BulkDownload'), { params: { filename }, input: `docs:${collectionUid}` }, { responseType: 'blob' });
    }
    static ɵfac = function CollectionService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CollectionService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: CollectionService, factory: CollectionService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CollectionService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
//# sourceMappingURL=collection.service.js.map