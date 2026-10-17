import { Injectable, inject } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AdministrationService } from './administration.service';
import { DocumentDetailService } from './document-detail.service';
import { matchesPrincipal } from '../utils/principal-match.utils';
import * as i0 from "@angular/core";
function escapeNxqlString(s) {
    return s.replace(/'/g, "''");
}
function extractLocalRows(doc, logicalPrincipal) {
    const acls = doc.contextParameters?.acls;
    if (!acls?.length)
        return [];
    const local = acls.find((a) => a.name === 'local');
    if (!local?.aces?.length)
        return [];
    const rows = [];
    for (const ace of local.aces) {
        if (!ace.granted)
            continue;
        if (ace.status === 'archived')
            continue;
        if (!matchesPrincipal(ace.username, logicalPrincipal))
            continue;
        rows.push({
            documentUid: doc.uid,
            documentTitle: doc.title || String(doc.properties?.['dc:title'] ?? doc.uid),
            documentPath: doc.path,
            permission: ace.permission,
            begin: ace.begin,
            end: ace.end,
            grantedBy: ace.creator,
            acePrincipal: ace.username,
        });
    }
    return rows;
}
const emptyPage = {
    rows: [],
    totalDocuments: 0,
    numberOfPages: 0,
    currentPageIndex: 0,
    currentPageSize: 0,
};
export class PrincipalPermissionsService {
    admin = inject(AdministrationService);
    documents = inject(DocumentDetailService);
    /**
     * Lists local ACL rows for a user id or group name. Pagination applies to the NXQL document
     * result set; each document may contribute multiple table rows (one per ACE).
     */
    listLocalPermissionRows(logicalPrincipal, pageSize, currentPageIndex) {
        const e = escapeNxqlString(logicalPrincipal);
        const strict = `SELECT * FROM Document WHERE ecm:acl/*1/principal = '${e}' AND ecm:acl/*1/name = 'local'`;
        const withUserPrefix = `SELECT * FROM Document WHERE ecm:acl/*1/principal = 'user:${e}' AND ecm:acl/*1/name = 'local'`;
        const withGroupPrefix = `SELECT * FROM Document WHERE ecm:acl/*1/principal = 'group:${e}' AND ecm:acl/*1/name = 'local'`;
        const loose = `SELECT * FROM Document WHERE ecm:acl/*/principal = '${e}'`;
        const pickNext = (r) => r === null || r.totalDocuments === 0;
        return this.safeFetch(strict, logicalPrincipal, pageSize, currentPageIndex).pipe(switchMap((r) => {
            if (!pickNext(r))
                return of(r);
            return this.safeFetch(withUserPrefix, logicalPrincipal, pageSize, currentPageIndex);
        }), switchMap((r) => {
            if (!pickNext(r))
                return of(r);
            return this.safeFetch(withGroupPrefix, logicalPrincipal, pageSize, currentPageIndex);
        }), switchMap((r) => {
            if (!pickNext(r))
                return of(r);
            return this.safeFetch(loose, logicalPrincipal, pageSize, currentPageIndex);
        }), map((r) => r ?? emptyPage), catchError(() => of(emptyPage)));
    }
    safeFetch(query, logicalPrincipal, pageSize, currentPageIndex) {
        return this.fetchPage(query, logicalPrincipal, pageSize, currentPageIndex).pipe(catchError(() => of(null)));
    }
    fetchPage(query, logicalPrincipal, pageSize, currentPageIndex) {
        return this.admin.nxqlSearch(query, pageSize, currentPageIndex, { properties: '*' }).pipe(switchMap((list) => {
            const entries = list.entries ?? [];
            const base = {
                rows: [],
                totalDocuments: list.totalSize ?? 0,
                numberOfPages: list.numberOfPages ?? 0,
                currentPageIndex: list.currentPageIndex ?? 0,
                currentPageSize: list.currentPageSize ?? entries.length,
            };
            if (entries.length === 0)
                return of(base);
            return forkJoin(entries.map((entry) => this.documents.getFullDocument(entry.uid))).pipe(map((docs) => {
                const rows = [];
                for (const doc of docs) {
                    rows.push(...extractLocalRows(doc, logicalPrincipal));
                }
                return { ...base, rows };
            }));
        }));
    }
    static ɵfac = function PrincipalPermissionsService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PrincipalPermissionsService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: PrincipalPermissionsService, factory: PrincipalPermissionsService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PrincipalPermissionsService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
//# sourceMappingURL=principal-permissions.service.js.map