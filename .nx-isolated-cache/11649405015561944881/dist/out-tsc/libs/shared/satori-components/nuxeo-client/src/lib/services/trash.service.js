import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { escapeNxqlLiteral } from '../utils/nxql.utils';
import { NuxeoApiBase } from './nuxeo-api-base';
import * as i0 from "@angular/core";
export class TrashService {
    api = inject(NuxeoApiBase);
    http = inject(HttpClient);
    searchTrash(params = {}) {
        const clauses = ['ecm:isTrashed = 1', "ecm:mixinType != 'HiddenInNavigation'"];
        if (params.fullText?.trim()) {
            clauses.push(`ecm:fulltext = '${escapeNxqlLiteral(params.fullText.trim())}'`);
        }
        if (params.path?.trim() && params.path !== '/') {
            clauses.push(`ecm:path STARTSWITH '${escapeNxqlLiteral(params.path.trim())}'`);
        }
        if (params.author?.trim()) {
            clauses.push(`dc:creator = '${escapeNxqlLiteral(params.author.trim())}'`);
        }
        if (params.sizeRanges?.length) {
            const sizeClauses = params.sizeRanges.map((r) => this.sizeRangeToClause(r)).filter(Boolean);
            if (sizeClauses.length) {
                clauses.push(`(${sizeClauses.join(' OR ')})`);
            }
        }
        const sortField = params.sortBy ?? 'dc:created';
        const sortOrder = params.sortOrder ?? 'DESC';
        const query = `SELECT * FROM Document WHERE ${clauses.join(' AND ')} ORDER BY ${sortField} ${sortOrder}`;
        const httpParams = new HttpParams()
            .set('query', query)
            .set('pageSize', params.pageSize ?? 50)
            .set('currentPageIndex', params.currentPageIndex ?? 0);
        return this.http.get(this.api.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'), {
            params: httpParams,
            headers: {
                properties: '*',
                'enrichers.document': 'thumbnail,favorites',
            },
        });
    }
    getPathSuggestions(parentPath) {
        const safePath = escapeNxqlLiteral(parentPath.replace(/\/+$/, '') || '/');
        const query = `SELECT * FROM Document WHERE ecm:path STARTSWITH '${safePath}' ` +
            `AND ecm:primaryType IN ('Domain', 'WorkspaceRoot', 'Workspace', 'Folder', 'OrderedFolder', 'SectionRoot', 'Section', 'TemplateRoot') ` +
            `AND ecm:isTrashed = 0 AND ecm:mixinType != 'HiddenInNavigation' ` +
            `ORDER BY dc:title`;
        const params = new HttpParams().set('query', query).set('pageSize', 20);
        return this.http.get(this.api.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'), { params, headers: { properties: 'dublincore' } });
    }
    restoreDocument(uid) {
        return this.api.post(`/nuxeo/api/v1/id/${uid}/@op/Document.Untrash`, {
            params: {},
            context: {},
        });
    }
    permanentlyDelete(uid) {
        return this.http.delete(this.api.apiUrl(`/nuxeo/api/v1/id/${uid}`));
    }
    saveSearch(title, params) {
        const body = {
            'entity-type': 'savedSearch',
            title,
            pageProviderName: 'default_trash_search',
            params,
        };
        return this.http
            .post(this.api.apiUrl('/nuxeo/api/v1/search/saved'), body, {
            headers: { 'Content-Type': 'application/json' },
        })
            .pipe(map((res) => ({
            uid: res.id ?? '',
            title: res.title ?? title,
            params: res.params ?? params,
        })));
    }
    updateSearch(uid, title, params) {
        const body = {
            'entity-type': 'savedSearch',
            title,
            pageProviderName: 'default_trash_search',
            params,
        };
        return this.http
            .put(this.api.apiUrl(`/nuxeo/api/v1/search/saved/${uid}`), body, {
            headers: { 'Content-Type': 'application/json' },
        })
            .pipe(map((res) => ({
            uid: res.id ?? uid,
            title: res.title ?? title,
            params: res.params ?? params,
        })));
    }
    getSavedSearches() {
        const params = new HttpParams().set('pageProvider', 'default_trash_search');
        return this.http
            .get(this.api.apiUrl('/nuxeo/api/v1/search/saved'), {
            params,
            headers: {
                properties: '*',
                'fetch-document': 'properties',
                'enrichers-document': 'thumbnail, permissions',
            },
        })
            .pipe(map((res) => (res.entries ?? []).map((entry) => ({
            uid: entry.id ?? '',
            title: entry.title ?? 'Untitled',
            params: entry.params ?? {},
        }))));
    }
    sizeRangeToClause(range) {
        switch (range) {
            case 'tiny':
                return 'file:content/length < 102400';
            case 'small':
                return '(file:content/length >= 102400 AND file:content/length < 1048576)';
            case 'medium':
                return '(file:content/length >= 1048576 AND file:content/length < 10485760)';
            case 'large':
                return '(file:content/length >= 10485760 AND file:content/length < 104857600)';
            case 'huge':
                return 'file:content/length >= 104857600';
            default:
                return '';
        }
    }
    static ɵfac = function TrashService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TrashService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: TrashService, factory: TrashService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(TrashService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
//# sourceMappingURL=trash.service.js.map