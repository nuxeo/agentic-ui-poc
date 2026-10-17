import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of } from 'rxjs';
import { NUXEO_SERVER_URL } from '../nuxeo-api.config';
import { CURRENT_USERNAME } from '../current-user.token';
import { NuxeoApiBase } from './nuxeo-api-base';
import * as i0 from "@angular/core";
export class NuxeoDriveService {
    api = inject(NuxeoApiBase);
    http = inject(HttpClient);
    serverUrl = inject(NUXEO_SERVER_URL);
    currentUsername = inject(CURRENT_USERNAME);
    get baseUrl() {
        return this.serverUrl;
    }
    get username() {
        return this.currentUsername() ?? 'Administrator';
    }
    /**
     * Checks whether Nuxeo Drive has a registered token (i.e. is installed
     * and has been connected at least once). This mirrors the native Nuxeo
     * Web UI approach: GET /api/v1/token?application=Nuxeo Drive
     */
    hasDriveToken() {
        return this.http
            .get(this.api.apiUrl('/nuxeo/api/v1/token'), { params: { application: 'Nuxeo Drive' } })
            .pipe(map((res) => (res.entries?.length ?? 0) > 0), catchError(() => of(false)));
    }
    buildEditUrl(docUid, blobUrl, filename) {
        const parts = blobUrl.split('/nxfile/');
        // Strip query string (?changeToken=...) so it does not become a query string on the nxdrive:// URL
        const nxfilePart = parts.length > 1 ? parts[1].split('?')[0] : '';
        const downloadUrl = nxfilePart ? `nxfile/${nxfilePart}` : '';
        return [
            'nxdrive://edit',
            this.baseUrl.replace('://', '/'),
            'user',
            this.username,
            'repo',
            'default',
            'nxdocid',
            docUid,
            'filename',
            encodeURIComponent(filename),
            ...(downloadUrl ? ['downloadUrl', downloadUrl] : []),
        ].join('/');
    }
    buildDirectTransferUrl(docPath) {
        return [
            'nxdrive://direct-transfer',
            this.baseUrl.replace('://', '/'),
            docPath.startsWith('/') ? docPath.slice(1) : docPath,
        ].join('/');
    }
    openDriveUrl(url) {
        // Use a hidden anchor click so the OS protocol handler (Nuxeo Drive) is triggered
        // without navigating the current tab away from the app. window.open(_top) causes
        // ERR_UNKNOWN_URL_SCHEME in Chrome for custom protocol schemes.
        const a = document.createElement('a');
        a.href = url;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => document.body.removeChild(a), 500);
    }
    static ɵfac = function NuxeoDriveService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NuxeoDriveService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: NuxeoDriveService, factory: NuxeoDriveService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NuxeoDriveService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
//# sourceMappingURL=nuxeo-drive.service.js.map