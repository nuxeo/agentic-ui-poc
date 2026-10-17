import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NuxeoDocumentList } from '../models/document.model';
import * as i0 from "@angular/core";
export declare class NuxeoApiBase {
    private readonly http;
    private readonly apiOrigin;
    apiUrl(path: string): string;
    get<T>(path: string, params?: HttpParams, headers?: Record<string, string>): Observable<T>;
    post<T>(path: string, body: unknown, headers?: Record<string, string>): Observable<T>;
    put<T>(path: string, body: unknown, headers?: Record<string, string>): Observable<T>;
    delete<T>(path: string, headers?: Record<string, string>): Observable<T>;
    nxqlSearch(query: string, pageSize: number, headers?: Record<string, string>): Observable<NuxeoDocumentList>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NuxeoApiBase, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NuxeoApiBase>;
}
//# sourceMappingURL=nuxeo-api-base.d.ts.map