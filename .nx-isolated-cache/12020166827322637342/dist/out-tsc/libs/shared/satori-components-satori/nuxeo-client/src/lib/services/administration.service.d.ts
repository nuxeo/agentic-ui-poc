import { Observable } from 'rxjs';
import { AuditLogList } from '../models/audit.model';
import { NuxeoDocumentList } from '../models/document.model';
import { NuxeoOAuth2Provider } from '../models/oauth.model';
import * as i0 from "@angular/core";
/** Common directory / vocabulary names when the server does not expose a list endpoint. */
export { FALLBACK_DIRECTORY_NAMES } from '../models/directory.model';
export declare class AdministrationService {
    private readonly api;
    private readonly http;
    /**
     * NXQL search with paging and optional extra headers (e.g. file schema for size).
     */
    nxqlSearch(query: string, pageSize: number, currentPageIndex?: number, headers?: Record<string, string>): Observable<NuxeoDocumentList>;
    /** Total documents matching the query (uses list metadata). */
    getNxqlTotalSize(query: string): Observable<number>;
    /**
     * Repository-wide audit via automation. Falls back to domain document audit if unavailable.
     */
    searchAuditLogs(params: {
        pageSize: number;
        currentPageIndex: number;
        principalName?: string;
        from?: string | null;
        to?: string | null;
        eventIds?: string[];
        category?: string;
    }): Observable<AuditLogList>;
    /**
     * Fallback: fetch audit from multiple well-known documents, merge, deduplicate,
     * apply client-side filters, and paginate.
     */
    private auditFallback;
    private normalizeAuditResponse;
    /**
     * `Audit.QueryWithPageProvider` reports the match count as `resultsCount` and omits `totalSize`,
     * which is the field the audit page reads. Left unmapped, the pager takes the page length as the
     * total and offers one page over 10,000 entries.
     */
    private withTotalSize;
    listOAuth2Providers(): Observable<NuxeoOAuth2Provider[]>;
    /**
     * Tries to discover directory names from the Nuxeo registry; falls back to {@link FALLBACK_DIRECTORY_NAMES}.
     */
    listDirectoryNames(): Observable<string[]>;
    getDefaultDomainPath(): Observable<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<AdministrationService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AdministrationService>;
}
//# sourceMappingURL=administration.service.d.ts.map