import { Observable } from 'rxjs';
import * as i0 from "@angular/core";
export declare class NuxeoDriveService {
    private readonly api;
    private readonly http;
    private readonly serverUrl;
    private readonly currentUsername;
    private get baseUrl();
    private get username();
    /**
     * Checks whether Nuxeo Drive has a registered token (i.e. is installed
     * and has been connected at least once). This mirrors the native Nuxeo
     * Web UI approach: GET /api/v1/token?application=Nuxeo Drive
     */
    hasDriveToken(): Observable<boolean>;
    buildEditUrl(docUid: string, blobUrl: string, filename: string): string;
    buildDirectTransferUrl(docPath: string): string;
    openDriveUrl(url: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NuxeoDriveService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NuxeoDriveService>;
}
//# sourceMappingURL=nuxeo-drive.service.d.ts.map