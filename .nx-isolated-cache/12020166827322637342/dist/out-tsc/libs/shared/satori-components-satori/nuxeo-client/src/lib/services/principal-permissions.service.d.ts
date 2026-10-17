import { Observable } from 'rxjs';
import { PrincipalPermissionPage } from '../models/principal-permissions.model';
import * as i0 from "@angular/core";
export declare class PrincipalPermissionsService {
    private readonly admin;
    private readonly documents;
    /**
     * Lists local ACL rows for a user id or group name. Pagination applies to the NXQL document
     * result set; each document may contribute multiple table rows (one per ACE).
     */
    listLocalPermissionRows(logicalPrincipal: string, pageSize: number, currentPageIndex: number): Observable<PrincipalPermissionPage>;
    private safeFetch;
    private fetchPage;
    static ɵfac: i0.ɵɵFactoryDeclaration<PrincipalPermissionsService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<PrincipalPermissionsService>;
}
//# sourceMappingURL=principal-permissions.service.d.ts.map