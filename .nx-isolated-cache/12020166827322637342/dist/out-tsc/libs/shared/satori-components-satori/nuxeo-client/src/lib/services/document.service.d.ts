import { Observable } from 'rxjs';
import { NuxeoDocument, NuxeoDocumentList } from '../models/document.model';
import * as i0 from "@angular/core";
export declare class DocumentService {
    private readonly api;
    getRecentlyEdited(pageSize?: number): Observable<NuxeoDocumentList>;
    getRecentlyViewed(userId: string, pageSize?: number): Observable<NuxeoDocumentList>;
    getExpiredDocuments(pageSize?: number): Observable<NuxeoDocumentList>;
    getById(docId: string): Observable<NuxeoDocument>;
    static ɵfac: i0.ɵɵFactoryDeclaration<DocumentService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DocumentService>;
}
//# sourceMappingURL=document.service.d.ts.map