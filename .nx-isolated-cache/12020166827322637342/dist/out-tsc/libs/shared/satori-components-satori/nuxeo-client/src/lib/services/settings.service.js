import { Injectable, LOCALE_ID, inject } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import { NuxeoApiBase } from './nuxeo-api-base';
import { matchesPrincipal } from '../utils/principal-match.utils';
import { formatPermissionTimeFrame } from '../utils/permission-timeframe.utils';
import { TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
export class SettingsService {
    translate = inject(TranslateService);
    locale = inject(LOCALE_ID);
    api = inject(NuxeoApiBase);
    getLocalPermissions(username, pageSize = 25) {
        return this.queryPermissions(username, pageSize);
    }
    queryPermissions(principal, pageSize) {
        const safePrincipal = principal.replace(/'/g, "''");
        const nxql = `SELECT * FROM Document WHERE ecm:mixinType != "HiddenInNavigation" ` +
            `AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0 ` +
            `AND ecm:acl/*1/name = 'local' AND (` +
            `ecm:acl/*1/principal = '${safePrincipal}' OR ` +
            `ecm:acl/*1/principal = 'user:${safePrincipal}' OR ` +
            `ecm:acl/*1/principal = 'group:${safePrincipal}'` +
            `)`;
        return this.api
            .post('/nuxeo/api/v1/automation/Repository.Query', {
            params: { query: nxql, page: 0, pageSize },
            context: {},
        }, {
            'X-NXContext-Category': 'acls',
            'X-NXRepository': 'default',
            'enrichers-document': 'acls',
            properties: '*',
        })
            .pipe(map((res) => {
            const rows = [];
            for (const doc of res.entries ?? []) {
                rows.push(...this.extractLocalPermissionRows(doc, principal));
            }
            return rows;
        }));
    }
    getConnectedAccounts() {
        return forkJoin({
            providers: this.getProviders(),
            tokens: this.getProviderTokens(),
        }).pipe(map(({ providers, tokens }) => {
            const providersByName = new Map(providers.entries.map((provider) => [provider.serviceName, provider]));
            return tokens.entries.map((token) => this.toConnectedAccount(token, providersByName));
        }));
    }
    getAuthorizedApplications() {
        return this.api
            .get('/nuxeo/api/v1/oauth2/token/client', undefined, {
            properties: '*',
        })
            .pipe(map((tokens) => tokens.entries.map((token) => this.toAuthorizedApplication(token))));
    }
    getSynchronizationRoots() {
        return this.api
            .post('/nuxeo/api/v1/automation/NuxeoDrive.GetRoots', {
            params: {},
            context: {},
        }, {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-NXRepository': 'default',
            properties: '*',
        })
            .pipe(map((response) => (response.entries ?? []).map((entry) => ({
            id: entry.uid?.trim() || entry.id?.trim() || '',
            title: entry.title?.trim() || '—',
            path: entry.path?.trim() || '—',
        }))));
    }
    setSynchronizationRoot(rootId, enable) {
        return this.api.post('/nuxeo/api/v1/automation/NuxeoDrive.SetSynchronization', {
            params: { enable },
            context: {},
            input: rootId,
        }, {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-NXRepository': 'default',
            properties: '*',
        });
    }
    getProviders() {
        return this.api.get('/nuxeo/api/v1/oauth2/provider/', undefined, {
            properties: '*',
        });
    }
    getProviderTokens() {
        return this.api.get('/nuxeo/api/v1/oauth2/token/provider', undefined, {
            properties: '*',
        });
    }
    toConnectedAccount(token, providersByName) {
        const provider = providersByName.get(token.serviceName);
        return {
            serviceName: provider?.serviceName ?? token.serviceName,
            nuxeoLogin: token.nuxeoLogin,
            serviceLogin: token.serviceLogin,
            creationDate: token.creationDate,
            shared: token.isShared,
        };
    }
    toAuthorizedApplication(token) {
        return {
            name: token.clientId ?? token.serviceName,
            authorizationDate: token.creationDate,
        };
    }
    changePassword(oldPassword, newPassword) {
        return this.api.put('/nuxeo/api/v1/me/changepassword', { oldPassword, newPassword });
    }
    /** Web UI profile: local ACL rows only (skip inherited ACLs). */
    extractLocalPermissionRows(doc, logicalPrincipal) {
        const localAcl = (doc.contextParameters?.acls ?? []).find((acl) => acl.name === 'local');
        if (!localAcl?.aces?.length) {
            return [];
        }
        const trimmedPath = doc.path?.trim() || null;
        const trimmedTitle = doc.title?.trim();
        const title = trimmedTitle || trimmedPath || doc.uid;
        const documentPath = trimmedTitle ? trimmedPath : null;
        const rows = [];
        for (const ace of localAcl.aces) {
            if (!ace.granted)
                continue;
            if (ace.status === 'archived')
                continue;
            if (!matchesPrincipal(ace.username, logicalPrincipal))
                continue;
            rows.push({
                documentTitle: title,
                documentPath,
                right: ace.permission,
                timeFrame: formatPermissionTimeFrame(ace.begin, ace.end, (key) => this.translate.instant(key), this.locale),
                grantedBy: ace.creator || '—',
            });
        }
        return rows;
    }
    static ɵfac = function SettingsService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SettingsService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: SettingsService, factory: SettingsService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SettingsService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
//# sourceMappingURL=settings.service.js.map