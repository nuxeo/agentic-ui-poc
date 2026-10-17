import { Observable } from 'rxjs';
import { NuxeoDocument, NuxeoDocumentList } from '../models/document.model';
import { type BrowsePageRequest } from './browse.service';
import * as i0 from "@angular/core";
export declare class CollectionService {
    private readonly api;
    private readonly http;
    getById(uid: string): Observable<NuxeoDocument>;
    getAll(pageSize?: number): Observable<NuxeoDocumentList>;
    getFavorites(userId: string, pageSize?: number): Observable<NuxeoDocumentList>;
    /**
     * One page of a collection's members, in the order asked for. The page provider counts every
     * member, so `totalSize` is the collection's size on every page.
     */
    getCollectionMembers(collectionUid: string, pageSize?: number, page?: BrowsePageRequest): Observable<NuxeoDocumentList>;
    updateProperties(uid: string, properties: Record<string, unknown>): Observable<NuxeoDocument>;
    /**
     * Triggers a bulk download of all member documents in a collection,
     * returned as a zip file. Uses the Nuxeo `Blob.BulkDownload` automation.
     */
    bulkDownload(collectionUid: string, filename?: string): Observable<Blob>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CollectionService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<CollectionService>;
}
//# sourceMappingURL=collection.service.d.ts.map