import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, catchError, expand, map, of, reduce, shareReplay } from 'rxjs';
import { NuxeoApiBase } from './nuxeo-api-base';
import { DEFAULT_VOCABULARY_ORDERING, FALLBACK_DIRECTORY_NAMES, directoryPickerLabel, directoryUsesL10nLabel, isManagedDirectory, isManagedDirectoryName, resolveParentSourceName, } from '../models/directory.model';
import * as i0 from "@angular/core";
export class DirectoryService {
    api = inject(NuxeoApiBase);
    catalog$;
    /** Nuxeo directory registry (name → metadata including parent vocabulary). */
    getDirectoryCatalog() {
        if (!this.catalog$) {
            this.catalog$ = this.fetchDirectoryCatalog().pipe(shareReplay({ bufferSize: 1, refCount: false }));
        }
        return this.catalog$;
    }
    /** Directory names for Administration → Vocabularies (excludes system directories). */
    listDirectoryNames() {
        return this.getDirectoryCatalog().pipe(map((catalog) => {
            const names = [...catalog.values()]
                .filter(isManagedDirectory)
                .map((meta) => meta.name)
                .sort((a, b) => a.localeCompare(b));
            return names.length ? names : [...FALLBACK_DIRECTORY_NAMES].filter(isManagedDirectoryName);
        }));
    }
    invalidateDirectoryCatalog() {
        this.catalog$ = undefined;
    }
    fetchDirectoryCatalog() {
        return this.api.get('/nuxeo/api/v1/directory').pipe(map((res) => this.parseDirectoryCatalog(res)), catchError(() => {
            this.catalog$ = undefined;
            return of(new Map());
        }));
    }
    parseDirectoryCatalog(res) {
        const rows = this.extractDirectoryCatalogRows(res);
        const catalog = new Map();
        for (const row of rows) {
            const name = row.name;
            if (!name)
                continue;
            catalog.set(name, {
                name,
                schema: row.schema,
                idField: row.idField,
                parentDirectory: row.parent || row.parentDirectory || undefined,
                type: row.type,
            });
        }
        return catalog;
    }
    extractDirectoryCatalogRows(res) {
        if (Array.isArray(res))
            return res;
        if (res.entries?.length)
            return res.entries;
        if (res.directories?.length)
            return res.directories;
        return [];
    }
    /**
     * Loads active directory entries for metadata pickers via Directory.SuggestEntries.
     * Each call queries the server (Nuxeo Web UI parity — no session-wide list cache).
     * `lang` localises the labels; English unless the caller asks for another language.
     */
    getEntries(directoryName, lang = 'en') {
        return this.api
            .post('/nuxeo/api/v1/automation/Directory.SuggestEntries', {
            params: {
                directoryName,
                contains: true,
                dbl10n: false,
                localize: true,
                lang,
                searchTerm: '',
            },
            context: {},
        }, { 'Content-Type': 'application/json', properties: '*' })
            .pipe(map((entries) => entries
            .filter((e) => !e.obsolete)
            .map((entry) => ({
            ...entry,
            displayLabel: directoryPickerLabel(entry),
        }))
            .sort((a, b) => a.ordering - b.ordering)));
    }
    /**
     * Loads all directory entries for the admin vocabularies table (includes obsolete entries).
     */
    getAdminEntries(directoryName) {
        const fetchPage = (pageIndex) => {
            const params = new HttpParams()
                .set('pageSize', '50')
                .set('currentPageIndex', String(pageIndex));
            return this.api.get(`/nuxeo/api/v1/directory/${encodeURIComponent(directoryName)}`, params);
        };
        return fetchPage(0).pipe(expand((res) => (res.isNextPageAvailable ? fetchPage(res.currentPageIndex + 1) : EMPTY)), reduce((acc, res) => acc.concat(res.entries ?? []), []), map((entries) => entries
            .map((entry) => this.normalizeAdminEntry(directoryName, entry))
            .sort((a, b) => a.ordering - b.ordering || a.label.localeCompare(b.label))));
    }
    createEntry(directoryName, values, metadata) {
        const body = {
            'entity-type': 'directoryEntry',
            directoryName,
            properties: this.buildEntryProperties(directoryName, values, metadata),
        };
        return this.api
            .post(`/nuxeo/api/v1/directory/${encodeURIComponent(directoryName)}/`, body, { 'Content-Type': 'application/json' })
            .pipe(map((entry) => this.normalizeAdminEntry(directoryName, entry)));
    }
    updateEntry(directoryName, entryId, values, metadata) {
        const body = {
            'entity-type': 'directoryEntry',
            directoryName,
            id: entryId,
            properties: this.buildEntryProperties(directoryName, values, metadata),
        };
        return this.api
            .put(`/nuxeo/api/v1/directory/${encodeURIComponent(directoryName)}/${encodeURIComponent(entryId)}`, body, { 'Content-Type': 'application/json' })
            .pipe(map((entry) => this.normalizeAdminEntry(directoryName, entry)));
    }
    deleteEntry(directoryName, entryId) {
        return this.api
            .delete(`/nuxeo/api/v1/directory/${encodeURIComponent(directoryName)}/${encodeURIComponent(entryId)}`)
            .pipe(map(() => undefined));
    }
    /**
     * Fetches entries from an l10n directory (l10nsubjects, l10ncoverage)
     * using the REST directory API with pagination. Returns only top-level
     * entries (parent === '').
     */
    getL10nEntries(directoryName) {
        return this.fetchL10nEntries(directoryName, 'top-level');
    }
    /**
     * Fetches every entry from an l10n directory, including children, for
     * hierarchical pickers (e.g. grouped coverage / subjects dropdowns).
     */
    getAllL10nEntries(directoryName) {
        return this.fetchL10nEntries(directoryName, 'all');
    }
    fetchL10nEntries(directoryName, scope) {
        const fetchPage = (pageIndex) => {
            const params = new HttpParams().set('pageSize', 50).set('currentPageIndex', pageIndex);
            return this.api.get(`/nuxeo/api/v1/directory/${directoryName}`, params);
        };
        return fetchPage(0).pipe(expand((res) => (res.isNextPageAvailable ? fetchPage(res.currentPageIndex + 1) : EMPTY)), reduce((acc, res) => acc.concat(res.entries), []), map((entries) => entries
            .filter((e) => {
            if (e.properties.obsolete)
                return false;
            return scope === 'all' || !e.properties.parent;
        })
            .sort((a, b) => (a.properties.label_en ?? a.id).localeCompare(b.properties.label_en ?? b.id))));
    }
    getEventTypes() {
        return this.getEntries('eventTypes');
    }
    getEventCategories() {
        return this.getEntries('eventCategories');
    }
    normalizeAdminEntry(directoryName, entry) {
        const properties = entry.properties ?? {};
        const propertyKeys = Object.keys(properties);
        const l10n = directoryUsesL10nLabel(directoryName);
        const parentValue = properties['parent'];
        const parent = parentValue !== undefined && parentValue !== null && String(parentValue) !== ''
            ? String(parentValue)
            : undefined;
        return {
            id: entry.id ?? String(properties['id'] ?? ''),
            directoryName,
            label: l10n
                ? String(properties['label_en'] ?? properties['label'] ?? entry.id)
                : String(properties['label'] ?? entry.id),
            ordering: Number(properties['ordering'] ?? DEFAULT_VOCABULARY_ORDERING),
            obsolete: Number(properties['obsolete'] ?? 0) === 1,
            parent,
            propertyKeys,
        };
    }
    buildEntryProperties(directoryName, values, metadata) {
        const properties = {
            id: values.id.trim(),
            ordering: values.ordering,
            obsolete: values.obsolete ? 1 : 0,
        };
        if (directoryUsesL10nLabel(directoryName)) {
            properties['label_en'] = values.label.trim();
        }
        else {
            properties['label'] = values.label.trim();
        }
        if (resolveParentSourceName(directoryName, metadata) || values.parent !== undefined) {
            properties['parent'] = values.parent?.trim() ?? '';
        }
        return properties;
    }
    static ɵfac = function DirectoryService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DirectoryService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: DirectoryService, factory: DirectoryService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DirectoryService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
//# sourceMappingURL=directory.service.js.map