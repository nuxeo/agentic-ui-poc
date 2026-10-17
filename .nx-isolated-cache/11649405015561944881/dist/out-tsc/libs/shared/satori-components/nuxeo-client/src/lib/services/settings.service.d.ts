import { Observable } from 'rxjs';
import { AuthorizedApplication, ConnectedAccount } from '../models/oauth2.model';
import * as i0 from "@angular/core";
export interface LocalPermissionRow {
    documentTitle: string;
    documentPath: string | null;
    right: string;
    timeFrame: string;
    grantedBy: string;
}
export interface SynchronizationRootRow {
    id: string;
    title: string;
    path: string;
}
export declare class SettingsService {
    private readonly translate;
    private readonly locale;
    private readonly api;
    getLocalPermissions(username: string, pageSize?: number): Observable<LocalPermissionRow[]>;
    private queryPermissions;
    getConnectedAccounts(): Observable<ConnectedAccount[]>;
    getAuthorizedApplications(): Observable<AuthorizedApplication[]>;
    getSynchronizationRoots(): Observable<SynchronizationRootRow[]>;
    setSynchronizationRoot(rootId: string, enable: boolean): Observable<unknown>;
    private getProviders;
    private getProviderTokens;
    private toConnectedAccount;
    private toAuthorizedApplication;
    changePassword(oldPassword: string, newPassword: string): Observable<void>;
    /** Web UI profile: local ACL rows only (skip inherited ACLs). */
    private extractLocalPermissionRows;
    static ɵfac: i0.ɵɵFactoryDeclaration<SettingsService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<SettingsService>;
}
//# sourceMappingURL=settings.service.d.ts.map