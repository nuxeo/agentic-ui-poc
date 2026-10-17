import * as i0 from '@angular/core';
import { InjectionToken, inject, Injectable, signal, isDevMode, LOCALE_ID, computed, Pipe } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { of, defer, concat, throwError, timer, from, Subject, map as map$1, switchMap as switchMap$1, catchError as catchError$1, forkJoin, expand, EMPTY, reduce, shareReplay, Observable } from 'rxjs';
import { map, tap, filter, switchMap, toArray, catchError, concatMap, finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import DOMPurify from 'dompurify';

/** Mirrors nuxeo-web-ui `activity.*` i18n keys used by `nuxeo-document-activity._activity()`. */
const ACTIVITY_LABELS = {
    view: 'viewed the document',
    download: 'downloaded the document',
    documentCreated: 'created the document',
    documentModified: 'updated the document',
    documentMoved: 'moved the document',
    documentRemoved: 'removed the document',
    documentLocked: 'locked the document',
    documentUnlocked: 'unlocked the document',
    documentSecurityUpdated: 'updated security settings',
    lifecycle_transition_event: 'changed document state',
    loginSuccess: 'logged in',
    addedToCollection: 'added to collection',
    removedFromCollection: 'removed from collection',
    documentPublished: 'published the document',
    documentProxyPublished: 'published the document',
    'workflow.start': 'started a review',
    'workflow.complete': 'completed a review',
    documentCheckedIn: 'checked in the document',
    documentCheckedOut: 'checked out the document',
    documentRestored: 'restored the document',
    'activity.deleted': 'activity.deleted',
};
/**
 * Label key for an audit activity entry — Web UI uses `extended.clientReason` when present,
 * otherwise `eventId` (see `nuxeo-document-activity._activity()`).
 */
function auditActivityLabelKey(entry) {
    const clientReason = entry.extended?.['clientReason'];
    if (typeof clientReason === 'string' && clientReason.length > 0) {
        return clientReason;
    }
    return entry.eventId;
}
function directoryEventLabel(labels, key) {
    if (labels instanceof Map) {
        return labels.get(key);
    }
    return Object.hasOwn(labels, key) ? labels[key] : undefined;
}
/**
 * Human-readable Activity tab label for an audit entry (Classic Web UI parity).
 */
function auditActivityLabel(entry, eventTypeLabels) {
    const key = auditActivityLabelKey(entry);
    // `Object.hasOwn` guard, not a bare lookup: an eventId of `constructor` or `toString` would
    // otherwise resolve up the prototype chain and return a function where a string is declared.
    const builtIn = Object.hasOwn(ACTIVITY_LABELS, key) ? ACTIVITY_LABELS[key] : undefined;
    if (builtIn) {
        return builtIn;
    }
    const fromDirectory = eventTypeLabels ? directoryEventLabel(eventTypeLabels, key) : undefined;
    if (fromDirectory) {
        return fromDirectory;
    }
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

/** Nuxeo DownloadService REQUEST_QUERY_PARAM_CLIENT_REASON — Web UI parity for audit. */
const BLOB_CLIENT_REASON_PARAM = 'clientReason';
/** Nuxeo DownloadService REQUEST_HEADER_CLIENT_REASON (query param is equivalent). */
const BLOB_CLIENT_REASON_HEADER = 'X-Client-Reason';

/** Common directory / vocabulary names when the server does not expose a list endpoint. */
const FALLBACK_DIRECTORY_NAMES = [
    'continent',
    'country',
    'eventTypes',
    'eventCategories',
    'l10nsubjects',
    'l10ncoverage',
    'nature',
    'subtopic',
    'oauth2TokenTypes',
    'language',
];
/** Directories used for audit/system UI — excluded from Administration → Vocabularies. */
const SYSTEM_DIRECTORY_NAMES = new Set([
    'eventTypes',
    'eventCategories',
    'oauth2TokenTypes',
]);
/** Default ordering for new vocabulary entries (Nuxeo Web UI parity). */
const DEFAULT_VOCABULARY_ORDERING = 10_000_000;
/** Web UI: parent column when the entry schema includes a parent property. */
function entryPropertiesIncludeParent(keys) {
    return keys.includes('parent');
}
/** Case-insensitive catalog lookup. */
function getDirectoryMetadata(catalog, directoryName) {
    if (!directoryName)
        return undefined;
    const direct = catalog.get(directoryName);
    if (direct)
        return direct;
    const lower = directoryName.toLowerCase();
    for (const [name, meta] of catalog) {
        if (name.toLowerCase() === lower)
            return meta;
    }
    return undefined;
}
/** Build table column ids in Web UI order (parent before id when present). */
function buildVocabularyTableColumns(propertyKeys) {
    const keys = new Set(propertyKeys);
    const columns = [];
    if (keys.has('parent'))
        columns.push('parent');
    columns.push('id');
    if (keys.has('label') || keys.size === 0 || [...keys].some((key) => key.startsWith('label_'))) {
        columns.push('label');
    }
    // Admin table always exposes these — Nuxeo may omit them from entry property keys.
    columns.push('obsolete', 'ordering', 'actions');
    return columns;
}
/** Whether the vocabulary table/dialog should include a parent field/column. */
function vocabularySupportsParent(directoryName, metadata, entries) {
    if (directoryShowsParentField(directoryName, metadata))
        return true;
    return entries.some((entry) => entry.propertyKeys.includes('parent') || !!entry.parent);
}
/** Resolve admin table columns using catalog metadata and loaded entry properties. */
function vocabularyTableColumns(directoryName, metadata, entries) {
    const showParent = vocabularySupportsParent(directoryName, metadata, entries);
    const keys = new Set();
    for (const entry of entries) {
        for (const key of entry.propertyKeys)
            keys.add(key);
    }
    if (showParent)
        keys.add('parent');
    if (keys.size > 0) {
        return buildVocabularyTableColumns([...keys]);
    }
    return showParent
        ? ['parent', 'id', 'label', 'obsolete', 'ordering', 'actions']
        : ['id', 'label', 'obsolete', 'ordering', 'actions'];
}
function defaultVocabularyLabel(directoryName, id) {
    const trimmedId = id.trim();
    if (!trimmedId)
        return '';
    return `label.directories.${directoryName}.${trimmedId}`;
}
/** Whether a directory appears in Administration → Vocabularies (Nuxeo Web UI parity). */
function isManagedDirectory(metadata) {
    return metadata.type?.toLowerCase() !== 'system';
}
/** Whether a directory name is manageable when catalog metadata is unavailable. */
function isManagedDirectoryName(name) {
    return !SYSTEM_DIRECTORY_NAMES.has(name);
}
/** Raw label stored on the directory entry — shown as-is in the admin table (Web UI parity). */
function directoryAdminTableLabel(entry) {
    return entry.label;
}
/** Whether a stored directory label value is an unresolved i18n key. */
function isDirectoryI18nKey(value) {
    if (!value?.trim())
        return false;
    return /^label\.directories\./i.test(value.trim());
}
/** Formats a vocabulary entry id for picker display (Web UI parity). */
function formatDirectoryEntryId(id) {
    const trimmed = id.trim();
    if (!trimmed)
        return '';
    if (isDirectoryI18nKey(trimmed)) {
        const segment = trimmed.split('.').pop() ?? trimmed;
        return formatDirectoryEntryId(segment);
    }
    return trimmed
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}
/** Human-readable label for directory entries whose label is an i18n key. */
function directoryEntryDisplayLabel(entry) {
    const label = entry.label?.trim() ?? '';
    if (isDirectoryI18nKey(label)) {
        return formatDirectoryEntryId(entry.id);
    }
    return label || formatDirectoryEntryId(entry.id);
}
/**
 * Resolves the label shown in vocabulary pickers (Nuxeo Web UI parity:
 * absoluteLabel → displayLabel → formatted id for i18n keys).
 */
function directoryPickerLabel(
// `label` is optional because a `SuggestEntries` payload omits it, which the body has
// always tolerated via `entry.label?.trim()`. Requiring it here made the signature
// stricter than both the implementation and the server, and rejected a legitimate
// caller; no gate typechecked the spec that proved it.
entry) {
    const absolute = entry.absoluteLabel?.trim();
    if (absolute && !isDirectoryI18nKey(absolute))
        return absolute;
    const display = entry.displayLabel?.trim();
    if (display && !isDirectoryI18nKey(display))
        return display;
    const label = entry.label?.trim();
    if (label && !isDirectoryI18nKey(label))
        return label;
    return formatDirectoryEntryId(entry.id);
}
/** Client-side filter/sort for vocabulary picker dropdowns (Nature, etc.). */
function filterDirectoryPickerEntries(entries, query = '') {
    const q = query.trim().toLowerCase();
    return entries
        .filter((entry) => {
        if (!q)
            return true;
        const label = directoryPickerLabel(entry).toLowerCase();
        return label.includes(q) || entry.id.toLowerCase().includes(q);
    })
        .sort((a, b) => directoryPickerLabel(a).localeCompare(directoryPickerLabel(b)));
}
function directoryUsesL10nLabel(directoryName) {
    return directoryName.toLowerCase().startsWith('l10n');
}
/** Whether vocabulary entries support a parent field (Web UI parity). */
function directoryShowsParentField(directoryName, metadata) {
    const schema = metadata?.schema?.toLowerCase();
    if (schema === 'l10nxvocabulary')
        return true;
    if (schema === 'xvocabulary') {
        return !!(metadata?.parentDirectory && metadata.parentDirectory !== directoryName);
    }
    if (metadata?.parentDirectory && metadata.parentDirectory !== directoryName) {
        return true;
    }
    if (directoryUsesL10nLabel(directoryName))
        return true;
    const lower = directoryName.toLowerCase();
    return lower === 'country' || lower === 'subtopic';
}
/**
 * Directory whose entries populate the parent dropdown.
 * Uses Nuxeo directory registry metadata when available.
 */
function resolveParentSourceName(directoryName, metadata) {
    if (!directoryShowsParentField(directoryName, metadata))
        return null;
    if (metadata?.parentDirectory)
        return metadata.parentDirectory;
    const lower = directoryName.toLowerCase();
    if (lower === 'country')
        return 'continent';
    if (lower === 'subtopic')
        return 'topic';
    if (directoryUsesL10nLabel(directoryName))
        return directoryName;
    return null;
}
/** Parent is required when options come from a different vocabulary (e.g. country → continent). */
function vocabularyParentRequired(directoryName, metadata) {
    const source = resolveParentSourceName(directoryName, metadata);
    return !!source && source !== directoryName;
}

/**
 * Base URL for Nuxeo API calls from the browser.
 * Use '' with `proxy.conf.json` during `nx serve` so requests go to `/nuxeo/...`
 * on the dev server and are proxied to http://localhost:8080 (Nuxeo).
 * For production behind a shared host, keep ''.
 * For cross-origin production, set the full origin (and configure CORS on Nuxeo).
 */
const NUXEO_API_ORIGIN = new InjectionToken('NUXEO_API_ORIGIN', {
    providedIn: 'root',
    factory: () => '',
});
/**
 * The actual Nuxeo server URL as seen by external clients (e.g. Nuxeo Drive desktop app).
 * Unlike NUXEO_API_ORIGIN (which can be '' to use the dev proxy), this must always be the
 * real reachable Nuxeo server URL so desktop apps can connect directly without the proxy.
 * Defaults to window.location.origin + '/nuxeo', which is correct for same-origin deployments.
 * Override in app.config.ts for local dev (Angular dev proxy ≠ Nuxeo server).
 */
const NUXEO_SERVER_URL = new InjectionToken('NUXEO_SERVER_URL', {
    providedIn: 'root',
    factory: () => `${window.location.origin}/nuxeo`,
});

/**
 * Injection token to provide the current authenticated username.
 * The app shell provides this value from AuthService so that
 * feature libraries can access the current user without importing AuthService directly.
 */
const CURRENT_USERNAME = new InjectionToken('CURRENT_USERNAME', {
    providedIn: 'root',
    factory: () => () => null,
});

/**
 * Feature libraries use this token for administration route guards without
 * importing the app-shell `AuthService`.
 */
const ADMIN_ACCESS_CHECKS = new InjectionToken('ADMIN_ACCESS_CHECKS', {
    providedIn: 'root',
    factory: () => ({
        isAdministrator: () => false,
        isPowerUser: () => false,
        hasAdministrationAccess: () => false,
    }),
});

/** Allows administrators and powerusers; others go to dashboard. */
const administrationAccessGuard = () => {
    const access = inject(ADMIN_ACCESS_CHECKS);
    const router = inject(Router);
    if (access.hasAdministrationAccess()) {
        return true;
    }
    return router.createUrlTree(['/dashboard']);
};
/** Redirects `/administration` to analytics (admins) or users-groups (powerusers). */
const administrationLandingGuard = () => {
    const access = inject(ADMIN_ACCESS_CHECKS);
    const router = inject(Router);
    if (!access.hasAdministrationAccess()) {
        return router.createUrlTree(['/dashboard']);
    }
    const target = access.isAdministrator() ? 'analytics' : 'users-groups';
    return router.createUrlTree(['/administration', target]);
};
/** Blocks powerusers from full-administration routes. */
const fullAdministratorGuard = () => {
    const access = inject(ADMIN_ACCESS_CHECKS);
    const router = inject(Router);
    if (access.isAdministrator()) {
        return true;
    }
    if (access.isPowerUser()) {
        return router.createUrlTree(['/administration/users-groups']);
    }
    return router.createUrlTree(['/dashboard']);
};

/** Nuxeo built-in group granting limited administration access in Web UI. */
const NUXEO_POWERUSERS_GROUP = 'powerusers';
/** Reads `properties.groups` from Nuxeo `GET /me` (shape varies slightly by version). */
function readGroupsFromMe(me) {
    if (!me || typeof me !== 'object')
        return [];
    const props = me['properties'];
    if (!props || typeof props !== 'object')
        return [];
    const groups = props['groups'];
    if (!Array.isArray(groups))
        return [];
    return groups.filter((g) => typeof g === 'string');
}
/** True when the user belongs to the `powerusers` group (case-insensitive). */
function isPowerUserFromGroups(groups) {
    return groups.some((g) => g.trim().toLowerCase() === NUXEO_POWERUSERS_GROUP);
}

/**
 * SAML / OIDC-style login buttons on the Angular login page. Each entry navigates the window to
 * `resolveNuxeoBrowserOrigin() + path` (+ optional `requestedUrl` if enabled).
 */
const NUXEO_SAML_LOGIN_ENDPOINTS = new InjectionToken('NUXEO_SAML_LOGIN_ENDPOINTS', {
    providedIn: 'root',
    factory: () => [],
});
/**
 * When starting SSO, Nuxeo may accept a post-login URL (e.g. `requestedUrl`). This is the path
 * on the **Angular** site (same host as the SPA), e.g. `/dashboard`.
 */
const NUXEO_SSO_POST_LOGIN_PATH = new InjectionToken('NUXEO_SSO_POST_LOGIN_PATH', {
    providedIn: 'root',
    factory: () => '/dashboard',
});
/**
 * Query parameter name for return URL after SSO (Nuxeo form login often uses `requestedUrl`).
 * Set to `null` to skip appending (e.g. when the IdP relay state is fixed in Nuxeo only).
 */
const NUXEO_SSO_RETURN_QUERY_PARAM = new InjectionToken('NUXEO_SSO_RETURN_QUERY_PARAM', {
    providedIn: 'root',
    factory: () => 'requestedUrl',
});

class NuxeoApiBase {
    http = inject(HttpClient);
    apiOrigin = inject(NUXEO_API_ORIGIN);
    apiUrl(path) {
        return `${this.apiOrigin.replace(/\/$/, '')}${path}`;
    }
    get(path, params, headers) {
        return this.http.get(this.apiUrl(path), { params, headers });
    }
    post(path, body, headers) {
        return this.http.post(this.apiUrl(path), body, { headers });
    }
    put(path, body, headers) {
        return this.http.put(this.apiUrl(path), body, { headers });
    }
    delete(path, headers) {
        return this.http.delete(this.apiUrl(path), { headers });
    }
    nxqlSearch(query, pageSize, headers = { properties: 'dublincore' }) {
        const params = new HttpParams().set('query', query).set('pageSize', pageSize);
        return this.http.get(this.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'), {
            params,
            headers,
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NuxeoApiBase, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NuxeoApiBase, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NuxeoApiBase, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class AssetService {
    api = inject(NuxeoApiBase);
    searchAssets(params = {}) {
        const { pageIndex = 0, pageSize = 40, ecmFulltext, primaryTypes = [], mimeTypes = [], widths = [], heights = [], colorProfiles = [], colorDepths = [], videoDurations = [], sortBy, sortOrder, } = params;
        let httpParams = new HttpParams()
            .set('currentPageIndex', pageIndex)
            .set('offset', pageIndex * pageSize)
            .set('pageSize', pageSize);
        const addAggParam = (key, values) => {
            if (values.length > 0) {
                httpParams = httpParams.set(key, JSON.stringify(values));
            }
        };
        addAggParam('system_primaryType_agg', primaryTypes);
        addAggParam('system_mimetype_agg', mimeTypes);
        addAggParam('asset_width_agg', widths);
        addAggParam('asset_height_agg', heights);
        addAggParam('color_profile_agg', colorProfiles);
        addAggParam('color_depth_agg', colorDepths);
        addAggParam('video_duration_agg', videoDurations);
        if (sortBy) {
            httpParams = httpParams.set('sortBy', sortBy);
        }
        if (sortOrder) {
            httpParams = httpParams.set('sortOrder', sortOrder);
        }
        const fulltext = ecmFulltext?.trim();
        if (fulltext) {
            httpParams = httpParams.set('ecm_fulltext', fulltext);
        }
        return this.api.get('/nuxeo/api/v1/search/pp/assets_search/execute', httpParams, { properties: '*' });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: AssetService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: AssetService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: AssetService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class AssetAggregationService {
    aggregations = signal({}, ...(ngDevMode ? [{ debugName: "aggregations" }] : []));
    items = signal([], ...(ngDevMode ? [{ debugName: "items" }] : []));
    selectedSavedSearchId = signal('', ...(ngDevMode ? [{ debugName: "selectedSavedSearchId" }] : []));
    selectedSavedSearchTitle = signal('', ...(ngDevMode ? [{ debugName: "selectedSavedSearchTitle" }] : []));
    savedSearchVersion = signal(0, ...(ngDevMode ? [{ debugName: "savedSearchVersion" }] : []));
    markSavedSearchDirty() {
        this.savedSearchVersion.update((v) => v + 1);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: AssetAggregationService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: AssetAggregationService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: AssetAggregationService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

const RECENTLY_EDITED_QUERY = [
    'SELECT * FROM Document',
    "WHERE ecm:mixinType != 'HiddenInNavigation'",
    'AND ecm:isProxy = 0',
    'AND ecm:isVersion = 0',
    'AND ecm:isTrashed = 0',
    'ORDER BY dc:modified DESC',
].join(' ');
const RECENTLY_VIEWED_QUERY = [
    'SELECT * FROM Document',
    "WHERE ecm:mixinType != 'HiddenInNavigation'",
    'AND ecm:isProxy = 0',
    'AND ecm:isVersion = 0',
    'AND ecm:isTrashed = 0',
    "AND ecm:primaryType NOT IN ('Root', 'Favorites', 'Collections')",
    "AND (dc:creator = '{user}' OR dc:lastContributor = '{user}')",
    'ORDER BY dc:modified DESC',
].join(' ');
const EXPIRED_DOCUMENTS_QUERY = [
    'SELECT * FROM Document',
    "WHERE ecm:mixinType != 'HiddenInNavigation'",
    'AND ecm:isProxy = 0',
    'AND ecm:isVersion = 0',
    'AND ecm:isTrashed = 0',
    "AND dc:expired < TIMESTAMP '{now}'",
    'ORDER BY dc:expired DESC',
].join(' ');
const FAVORITES_COLLECTION_QUERY = [
    'SELECT * FROM Document',
    "WHERE ecm:primaryType = 'Favorites'",
    "AND ecm:path STARTSWITH '/default-domain/UserWorkspaces/{user}'",
].join(' ');

class DocumentService {
    api = inject(NuxeoApiBase);
    getRecentlyEdited(pageSize = 10) {
        return this.api.nxqlSearch(RECENTLY_EDITED_QUERY, pageSize);
    }
    getRecentlyViewed(userId, pageSize = 10) {
        const query = RECENTLY_VIEWED_QUERY.replace(/\{user\}/g, userId);
        return this.api.nxqlSearch(query, pageSize);
    }
    getExpiredDocuments(pageSize = 20) {
        const now = new Date()
            .toISOString()
            .replace('T', ' ')
            .replace(/\.\d+Z$/, '');
        const query = EXPIRED_DOCUMENTS_QUERY.replace('{now}', now);
        return this.api.nxqlSearch(query, pageSize);
    }
    getById(docId) {
        return this.api.get(`/nuxeo/api/v1/id/${docId}`);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DocumentService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DocumentService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DocumentService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

const FOLDERISH_TYPES$1 = new Set([
    'Domain',
    'Folder',
    'OrderedFolder',
    'Workspace',
    'WorkspaceRoot',
    'SectionRoot',
    'Section',
    'TemplateRoot',
    'Collection',
    'Collections',
]);
/** Document types whose create/import flow must attach a main blob (`file:content`). */
const BLOB_HOLDING_DOC_TYPES_INTERNAL = new Set(['File', 'Audio', 'Picture', 'Video']);
const BLOB_HOLDING_DOC_TYPES = BLOB_HOLDING_DOC_TYPES_INTERNAL;
function isBlobHoldingDocType(docType) {
    return BLOB_HOLDING_DOC_TYPES.has(docType);
}
/** True when Nuxeo returned a non-empty main blob on the document. */
function documentHasMainBlob(doc) {
    const fc = doc.properties?.['file:content'];
    if (!fc || typeof fc !== 'object')
        return false;
    const blob = fc;
    const length = blob['length'];
    if (length !== null && length !== undefined && Number(length) > 0)
        return true;
    const name = blob['name'];
    if (typeof name === 'string' && name.length > 0)
        return true;
    const digest = blob['digest'];
    return typeof digest === 'string' && digest.length > 0;
}
/**
 * True when `file:content` is a persisted blob (not a pending upload-batch reference
 * and not merely a filename placeholder before binary storage completes).
 */
function documentHasPersistedMainBlob(doc) {
    const fc = doc.properties?.['file:content'];
    if (!fc || typeof fc !== 'object')
        return false;
    const blob = fc;
    if (blob['upload-batch'])
        return false;
    const digest = blob['digest'];
    if (typeof digest === 'string' && digest.length > 0)
        return true;
    if (blob['data'])
        return true;
    const lengthRaw = blob['length'];
    if (lengthRaw !== null && lengthRaw !== undefined && lengthRaw !== '') {
        const length = Number(lengthRaw);
        if (Number.isFinite(length)) {
            if (length > 0)
                return true;
            if (length === 0 && (blob['mime-type'] || blob['data']))
                return true;
        }
    }
    const mime = blob['mime-type'];
    const name = blob['name'];
    return typeof mime === 'string' && mime.length > 0 && typeof name === 'string' && name.length > 0;
}
const BLOB_NOT_ATTACHED_ERROR = 'File was not attached to the document';
/** Poll interval / cap when waiting for Nuxeo to persist `file:content` after create. */
const MAIN_BLOB_POLL_INTERVAL_MS = 500;
const MAIN_BLOB_POLL_MAX_ATTEMPTS = 30;
/** True if documents can be created under this document. */
function isFolderishDocument(doc) {
    if (!doc)
        return false;
    if (doc.facets?.includes('Folderish'))
        return true;
    return FOLDERISH_TYPES$1.has(doc.type);
}
/** Browse/nav tree nodes: folderish containers plus User Workspace Favorites. */
function isBrowsableNavNode(doc) {
    if (!doc)
        return false;
    return doc.type === 'Favorites' || isFolderishDocument(doc);
}
function sanitizeDocumentName(name) {
    const cleaned = name
        .replace(/[\\/:*?"<>|]/g, '-')
        .replace(/\s+/g, ' ')
        .trim();
    return cleaned.slice(0, 200) || 'untitled';
}
/** Web UI `_sanitizeName`: document path segment from title (slashes only). */
function sanitizeDocumentCreateName(name) {
    return name.replace(/[\\/]/g, '-');
}
function isMeaningfulCreatePropertyValue(value) {
    if (value === null || value === undefined) {
        return false;
    }
    if (typeof value === 'string' && value.trim() === '') {
        return false;
    }
    if (Array.isArray(value) && value.length === 0) {
        return false;
    }
    return true;
}
/** REST path prefix for creating a child under `parentPath`. */
function nuxeoDocumentPathEndpoint(parentPath) {
    const safePath = normalizeImportParentPath(parentPath);
    return safePath === '/' ? '/nuxeo/api/v1/path/' : `/nuxeo/api/v1/path${safePath}`;
}
/**
 * Merge user overrides into a server `@emptyWithDefault` template (Nuxeo Web UI create flow).
 * Skips null/empty overrides so server defaults (e.g. Domain schema fields) are preserved.
 */
function mergeCreateDocumentBody(template, docType, nameFallback, overrides) {
    const mergedProps = { ...(template.properties ?? {}) };
    for (const [key, value] of Object.entries(overrides)) {
        if (isMeaningfulCreatePropertyValue(value)) {
            mergedProps[key] = value;
        }
    }
    const title = typeof overrides['dc:title'] === 'string' && overrides['dc:title'].trim()
        ? overrides['dc:title'].trim()
        : nameFallback.trim();
    const resolvedName = (template.name && String(template.name).trim()) ||
        sanitizeDocumentCreateName(title || 'untitled');
    return {
        'entity-type': 'document',
        name: resolvedName,
        type: docType,
        properties: mergedProps,
    };
}
/** Default location when no browse context is provided (e.g. Dashboard Add Content). */
const DEFAULT_IMPORT_PARENT_PATH = '/';
/** Auto-provisioned domain container — not a user content-creation target. */
const DOMAIN_CONTAINER_PATH = '/default-domain';
/** Catalogue key for the hint shown when the chosen location cannot hold new content. */
const RESTRICTED_IMPORT_LOCATION_MESSAGE_KEY = 'browse.message.restricted-import-location';
function normalizeImportParentPath(path) {
    const trimmed = path.trim();
    if (!trimmed)
        return '/';
    const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return withLeading.replace(/\/+$/, '') || '/';
}
/** True when the path is the repository root (Domain creation only). */
function isRepositoryRootPath(path) {
    if (!path?.trim())
        return false;
    return normalizeImportParentPath(path) === '/';
}
/** True when generic content cannot be created or imported at this path (domain container). */
function isRestrictedImportParentPath(path) {
    if (!path?.trim())
        return true;
    return normalizeImportParentPath(path) === DOMAIN_CONTAINER_PATH;
}
const IMAGE_EXTENSIONS = new Set([
    'png',
    'jpg',
    'jpeg',
    'gif',
    'webp',
    'bmp',
    'svg',
    'tif',
    'tiff',
    'heic',
    'heif',
]);
const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'avi', 'webm', 'mkv', 'm4v', 'wmv']);
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma']);
/** Infer blob-holding Nuxeo type from file MIME type / extension (Web UI import parity). */
function inferBlobDocTypeFromFile(file) {
    const mime = file.type.toLowerCase();
    const ext = file.name.includes('.') ? (file.name.split('.').pop()?.toLowerCase() ?? '') : '';
    if (mime.startsWith('image/') || IMAGE_EXTENSIONS.has(ext)) {
        return 'Picture';
    }
    if (mime.startsWith('video/') || VIDEO_EXTENSIONS.has(ext)) {
        return 'Video';
    }
    if (mime.startsWith('audio/') || AUDIO_EXTENSIONS.has(ext)) {
        return 'Audio';
    }
    return 'File';
}
/** Pick an allowed creatable blob type for import, preferring MIME-based inference. */
function resolveImportBlobDocType(file, allowedTypes) {
    const inferred = inferBlobDocTypeFromFile(file);
    if (allowedTypes.includes(inferred)) {
        return inferred;
    }
    if (allowedTypes.includes('File')) {
        return 'File';
    }
    return allowedTypes.find((t) => isBlobHoldingDocType(t)) ?? 'File';
}
function titleFromFileName(fileName) {
    const dot = fileName.lastIndexOf('.');
    return dot > 0 ? fileName.slice(0, dot) : fileName;
}
class DocumentImportService {
    http = inject(HttpClient);
    api = inject(NuxeoApiBase);
    /**
     * Default folder when no browse context is passed (e.g. Dashboard).
     * Uses repository root (`/`) so administrators can create domains.
     */
    getDefaultImportParentPath() {
        return of(DEFAULT_IMPORT_PARENT_PATH);
    }
    /**
     * Bulk CSV import via Nuxeo CSV addon (`POST /automation/CSV.Import`).
     * @see https://doc.nuxeo.com/nxdoc/nuxeo-csv/
     */
    importCsvFile(options) {
        const path = normalizeImportParentPath(options.path);
        const request = JSON.stringify({
            params: {
                path,
                sendReport: options.sendReport === true,
                documentMode: options.documentMode === true,
                trim: options.trim !== false,
            },
            context: {},
        });
        const formData = new FormData();
        formData.append('request', new Blob([request], { type: 'application/json' }));
        formData.append('file', options.file);
        return this.http.post(this.api.apiUrl('/nuxeo/api/v1/automation/CSV.Import'), formData, {
            responseType: 'text',
        });
    }
    /**
     * Start a batch upload session (`POST /api/v1/upload/new/default`).
     * @see https://doc.nuxeo.com/nxdoc/howto-upload-file-nuxeo-using-rest-api/
     */
    initUploadBatch(handler = 'default') {
        return this.http
            .post(this.api.apiUrl(`/nuxeo/api/v1/upload/new/${encodeURIComponent(handler)}`), null, { observe: 'response' })
            .pipe(map((resp) => readBatchIdFromInitResponse(resp)));
    }
    /** Upload one file into a batch index (0-based). */
    uploadFileToBatch(batchId, fileIndex, file, onUploadPercent) {
        const headers = {
            'Content-Type': 'application/octet-stream',
            'X-File-Name': sanitizeHttpHeaderValue(file.name),
        };
        if (file.type) {
            headers['X-File-Type'] = file.type;
        }
        return this.http
            .post(this.api.apiUrl(`/nuxeo/api/v1/upload/${encodeURIComponent(batchId)}/${fileIndex}`), file, {
            headers: new HttpHeaders(headers),
            responseType: 'text',
            reportProgress: true,
            observe: 'events',
        })
            .pipe(tap((event) => {
            if (event.type === HttpEventType.UploadProgress) {
                const total = event.total && event.total > 0 ? event.total : file.size;
                const percent = total > 0 ? Math.min(100, Math.round((event.loaded * 100) / total)) : 0;
                onUploadPercent?.(percent);
                return;
            }
            if (event.type === HttpEventType.Response) {
                onUploadPercent?.(100);
            }
        }), filter((event) => event.type === HttpEventType.Response), map(() => undefined));
    }
    /**
     * URL to create a document under a folder.
     * Nuxeo expects `POST /api/v1/path{parentPath}` with a JSON body — not `.../@children`
     * (`@children` is for GET listing; POST there can return 405).
     */
    urlCreateUnderPath(parentPath) {
        return this.api.apiUrl(nuxeoDocumentPathEndpoint(parentPath));
    }
    /**
     * Empty document model with server defaults for a type under `parentPath`.
     * @see https://doc.nuxeo.com/nxdoc/rest-api-web-adapters/ (`@emptyWithDefault`)
     */
    getEmptyDocumentWithDefaults(parentPath, docType) {
        const base = nuxeoDocumentPathEndpoint(parentPath).replace(/\/$/, '');
        const params = new HttpParams().set('type', docType);
        return this.api
            .get(`${base}/@emptyWithDefault`, params, {
            properties: '*',
            'fetch-document': 'properties',
        })
            .pipe(map((doc) => ({ name: doc.name, properties: doc.properties })));
    }
    /**
     * Create a File document under `parentPath` using an uploaded batch blob.
     * @param batchNoDrop — pass true when more creations will use the same batch (Nuxeo clears the batch after first use unless this header is set).
     */
    createFileFromBatch(parentPath, fileName, docType, properties, batchId, fileIndex, batchNoDrop = false) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        if (batchNoDrop) {
            headers = headers.set('X-Batch-No-Drop', 'true');
        }
        return this.buildBlobDocumentCreateRequest(parentPath, docType, sanitizeDocumentName(fileName), properties, batchId, fileIndex).pipe(switchMap((body) => this.withMainBlobValidation(this.http.post(this.urlCreateUnderPath(parentPath), body, { headers }))));
    }
    createChildDocument(parentPath, name, docType, properties) {
        return this.getEmptyDocumentWithDefaults(parentPath, docType).pipe(map((template) => mergeCreateDocumentBody(template, docType, name, properties)), switchMap((body) => this.http.post(this.urlCreateUnderPath(parentPath), body, {
            headers: { 'Content-Type': 'application/json' },
        })));
    }
    /**
     * Create a blob-holding document (File, Audio, Picture, Video) with an uploaded batch file.
     */
    createDocumentWithBlob(parentPath, name, docType, properties, batchId, fileIndex) {
        return this.buildBlobDocumentCreateRequest(parentPath, docType, name, properties, batchId, fileIndex).pipe(switchMap((body) => this.withMainBlobValidation(this.http.post(this.urlCreateUnderPath(parentPath), body, {
            headers: { 'Content-Type': 'application/json' },
        }))));
    }
    /**
     * Upload a file to a new batch immediately on selection (Nuxeo Web UI `immediate` upload).
     * Document creation can later reference the returned `batchId` / `fileIndex`.
     */
    stageFileInBatch(file, options) {
        const report = options?.onProgress;
        return this.initUploadBatch().pipe(switchMap((batchId) => this.uploadFileToBatch(batchId, 0, file, report).pipe(switchMap(() => this.verifyBatchFileUploaded(batchId, 0)), map(() => ({ batchId, fileIndex: 0 })))));
    }
    /**
     * Create a blob-holding document from a file already staged in an upload batch.
     */
    createBlobHoldingDocumentFromBatch(parentPath, name, docType, properties, batchId, fileIndex, options) {
        const report = options?.onProgress;
        report?.({ phase: 'creating', percent: 90 });
        return this.createDocumentWithBlob(parentPath, name, docType, properties, batchId, fileIndex).pipe(tap(() => report?.({ phase: 'creating', percent: 100 })));
    }
    /**
     * Create a blob-holding document, preferring a staged batch when still available on the server.
     * Falls back to a fresh upload+create when the batch expired (common after immediate upload UX).
     */
    createBlobHoldingDocumentReliable(parentPath, name, docType, properties, file, stagedBatch, options) {
        if (!stagedBatch) {
            return this.createBlobHoldingDocument(parentPath, name, docType, properties, file, options);
        }
        return this.isBatchFileAvailable(stagedBatch.batchId, stagedBatch.fileIndex).pipe(switchMap((available) => available
            ? this.createBlobHoldingDocumentFromBatch(parentPath, name, docType, properties, stagedBatch.batchId, stagedBatch.fileIndex, options)
            : this.createBlobHoldingDocument(parentPath, name, docType, properties, file, options)));
    }
    /**
     * Initialize a batch, upload `file`, and create a blob-holding document with `file:content` set.
     */
    createBlobHoldingDocument(parentPath, name, docType, properties, file, options) {
        const report = options?.onProgress;
        return defer(() => {
            report?.({ phase: 'uploading', percent: 0 });
            return this.initUploadBatch();
        }).pipe(switchMap((batchId) => this.uploadFileToBatch(batchId, 0, file, (uploadPct) => {
            report?.({ phase: 'uploading', percent: Math.round(uploadPct * 0.85) });
        }).pipe(switchMap(() => {
            report?.({ phase: 'creating', percent: 90 });
            return this.verifyBatchFileUploaded(batchId, 0);
        }), switchMap(() => {
            report?.({ phase: 'creating', percent: 95 });
            return this.createDocumentWithBlob(parentPath, name, docType, properties, batchId, 0);
        }), tap(() => report?.({ phase: 'creating', percent: 100 })))));
    }
    /** Upload multiple files as File documents (single batch, sequential API calls). */
    importFiles(parentPath, files, options) {
        const entries = files.map((file) => ({
            file,
            docType: 'File',
            properties: { 'dc:title': titleFromFileName(file.name) },
        }));
        return this.importFilesWithProperties(parentPath, entries, options);
    }
    /**
     * Bulk import with per-file document type and metadata (Nuxeo Web UI “Import with Properties”).
     */
    importFilesWithProperties(parentPath, entries, options) {
        if (entries.length === 0)
            return of([]);
        const autoClassify = options?.autoClassify === true;
        const report = options?.onProgress;
        const fileCount = entries.length;
        return this.initUploadBatch().pipe(switchMap((batchId) => {
            const last = entries.length - 1;
            const steps = entries.map((entry, index) => {
                const segment = 100 / fileCount;
                const segmentStart = index * segment;
                const { file, docType, properties } = entry;
                const title = properties['dc:title'] || titleFromFileName(file.name);
                const createProperties = {
                    ...properties,
                    'dc:title': title,
                };
                return this.uploadFileToBatch(batchId, index, file, (uploadPct) => {
                    if (!report)
                        return;
                    report({
                        phase: 'uploading',
                        percent: Math.round(segmentStart + (uploadPct / 100) * segment * 0.85),
                        fileIndex: index,
                        fileCount,
                    });
                }).pipe(switchMap(() => {
                    report?.({
                        phase: 'creating',
                        percent: Math.round(segmentStart + segment * 0.88),
                        fileIndex: index,
                        fileCount,
                    });
                    return this.verifyBatchFileUploaded(batchId, index);
                }), switchMap(() => this.createFileFromBatch(parentPath, file.name, docType, createProperties, batchId, index, index < last).pipe(tap(() => report?.({
                    phase: 'creating',
                    percent: index === last ? 100 : Math.round((index + 1) * segment),
                    fileIndex: index,
                    fileCount,
                })), switchMap((doc) => this.runPostUploadClassificationIfEnabled(doc, autoClassify)))));
            });
            return concat(...steps).pipe(toArray());
        }));
    }
    /** Web UI parity: seed blob create from `@emptyWithDefault`, merge user props, attach batch blob. */
    buildBlobDocumentCreateRequest(parentPath, docType, nameFallback, properties, batchId, fileIndex) {
        const propertiesWithBlob = {
            ...properties,
            'file:content': {
                'upload-batch': batchId,
                'upload-fileId': String(fileIndex),
            },
        };
        return this.getEmptyDocumentWithDefaults(parentPath, docType).pipe(map((template) => mergeCreateDocumentBody(template, docType, nameFallback, propertiesWithBlob)));
    }
    isBatchFileAvailable(batchId, fileIndex) {
        return this.verifyBatchFileUploaded(batchId, fileIndex).pipe(map(() => true), catchError((err) => {
            if (err instanceof HttpErrorResponse && (err.status === 404 || err.status === 410)) {
                return of(false);
            }
            return throwError(() => err);
        }));
    }
    verifyBatchFileUploaded(batchId, fileIndex) {
        return this.http
            .get(this.api.apiUrl(`/nuxeo/api/v1/upload/${encodeURIComponent(batchId)}/${fileIndex}`))
            .pipe(map((info) => {
            if (!info || typeof info !== 'object') {
                throw new Error('Upload verification failed: batch file not found');
            }
            const record = info;
            const size = record['size'] ?? record['uploadedSize'];
            if (size !== null && size !== undefined) {
                const numericSize = Number(size);
                if (Number.isFinite(numericSize) && numericSize >= 0) {
                    return undefined;
                }
            }
            const name = record['name'];
            if (typeof name === 'string' && name.length > 0) {
                return undefined;
            }
            throw new Error('Upload verification failed: batch file metadata missing');
        }));
    }
    /**
     * Nuxeo may return create responses without hydrated `file:content` (null, batch refs,
     * or name-only placeholders). Poll until the binary is persisted before returning.
     */
    withMainBlobValidation(create$) {
        return create$.pipe(switchMap((doc) => this.ensurePersistedMainBlob(doc)));
    }
    ensurePersistedMainBlob(doc) {
        if (documentHasPersistedMainBlob(doc)) {
            return of(doc);
        }
        return this.pollDocumentMainBlob(doc.uid, 0);
    }
    pollDocumentMainBlob(uid, attempt) {
        return this.fetchDocumentMainBlob(uid).pipe(switchMap((refetched) => {
            if (documentHasPersistedMainBlob(refetched)) {
                return of(refetched);
            }
            if (attempt >= MAIN_BLOB_POLL_MAX_ATTEMPTS) {
                if (documentHasMainBlob(refetched)) {
                    return of(refetched);
                }
                return throwError(() => new Error(BLOB_NOT_ATTACHED_ERROR));
            }
            return timer(MAIN_BLOB_POLL_INTERVAL_MS).pipe(switchMap(() => this.pollDocumentMainBlob(uid, attempt + 1)));
        }));
    }
    fetchDocumentMainBlob(uid) {
        return this.api
            .get(`/nuxeo/api/v1/id/${uid}`, undefined, {
            properties: 'file:content',
        })
            .pipe(switchMap((doc) => this.enrichDocumentFromBlobEndpointIfNeeded(doc)));
    }
    /**
     * Nuxeo Cloud may omit `file:content` from properties GET even after a successful batch attach.
     * Web UI reads blobs via `@blob`; fall back to HEAD on that endpoint before failing create.
     */
    enrichDocumentFromBlobEndpointIfNeeded(doc) {
        if (documentHasPersistedMainBlob(doc) || documentHasMainBlob(doc)) {
            return of(doc);
        }
        const props = doc.properties ?? {};
        if ('file:content' in props) {
            return of(doc);
        }
        return this.http
            .head(this.api.apiUrl(`/nuxeo/api/v1/id/${doc.uid}/@blob/file:content`), {
            observe: 'response',
        })
            .pipe(map((resp) => {
            if (!resp.ok) {
                return doc;
            }
            const lengthHeader = resp.headers.get('Content-Length');
            const mimeHeader = resp.headers.get('Content-Type') ?? 'application/octet-stream';
            const disposition = resp.headers.get('Content-Disposition') ?? '';
            const nameMatch = /filename="?([^";]+)"?/i.exec(disposition);
            const blobMeta = {
                name: nameMatch?.[1] ?? 'file',
                'mime-type': mimeHeader.split(';')[0]?.trim() || 'application/octet-stream',
            };
            const length = lengthHeader !== null ? Number(lengthHeader) : NaN;
            blobMeta['length'] = Number.isFinite(length) && length >= 0 ? String(length) : '1';
            return {
                ...doc,
                properties: {
                    ...(doc.properties ?? {}),
                    'file:content': blobMeta,
                },
            };
        }), catchError(() => of(doc)));
    }
    /**
     * Placeholder for post-upload classification (e.g. Nuxeo automation / Document AI).
     * When `enabled` is false, returns the document unchanged.
     */
    runPostUploadClassificationIfEnabled(doc, enabled) {
        if (!enabled)
            return of(doc);
        return of(doc);
    }
    /**
     * Nuxeo-style CSV (name, type, dc:title, …). Creates trees when `name` uses `/` segments.
     * Rows with `file:content` are skipped (binary import needs server-side Nuxeo CSV).
     */
    importFromCsvText(parentPath, csvText) {
        const table = parseCsvTable(csvText);
        if (table.length < 2) {
            return of({ created: [], skipped: [], errors: ['CSV has no data rows'] });
        }
        const headers = table[0].map((h) => h.trim());
        const lower = headers.map((h) => h.toLowerCase());
        const nameIdx = lower.indexOf('name');
        const typeIdx = lower.indexOf('type');
        if (nameIdx < 0 || typeIdx < 0) {
            return of({
                created: [],
                skipped: [],
                errors: ['CSV must include columns "name" and "type" (header row).'],
            });
        }
        const rows = [];
        const skipped = [];
        for (let r = 1; r < table.length; r++) {
            const cells = table[r];
            if (cells.every((c) => !String(c).trim()))
                continue;
            let skipRow = false;
            const relPath = String(cells[nameIdx] ?? '').trim();
            const docType = String(cells[typeIdx] ?? '').trim();
            if (!relPath || !docType) {
                skipped.push(`Row ${r + 1}: missing name or type`);
                continue;
            }
            const props = {};
            for (let c = 0; c < headers.length; c++) {
                if (c === nameIdx || c === typeIdx)
                    continue;
                const key = headers[c];
                if (!key)
                    continue;
                const val = String(cells[c] ?? '').trim();
                if (key.toLowerCase() === 'file:content' && val) {
                    skipped.push(`${relPath}: file:content — use Upload or server CSV`);
                    skipRow = true;
                    break;
                }
                if (val !== '')
                    props[key] = val;
            }
            if (skipRow)
                continue;
            rows.push({ relPath, docType, props });
        }
        rows.sort((a, b) => a.relPath.split('/').length - b.relPath.split('/').length);
        const pathMap = new Map();
        pathMap.set('', parentPath.replace(/\/+$/, '') || '/');
        return from(rows).pipe(concatMap((row) => {
            const parts = row.relPath.split('/').filter(Boolean);
            const localName = parts[parts.length - 1];
            const parentRel = parts.slice(0, -1).join('/');
            const parentAbs = pathMap.get(parentRel);
            if (!parentAbs) {
                return of({
                    fail: `No parent path for "${row.relPath}" — check CSV order and parent rows`,
                });
            }
            const title = row.props['dc:title'] || localName;
            const props = { ...row.props, 'dc:title': title };
            if (row.docType === 'Note' && props['note:note'] === undefined) {
                props['note:note'] = '<p></p>';
            }
            return this.createChildDocument(parentAbs, localName, row.docType, props).pipe(tap((doc) => pathMap.set(row.relPath, doc.path)), map((doc) => ({ ok: doc })), catchError((err) => of({
                fail: `${row.relPath}: ${err?.error?.message ?? err?.message ?? 'Create failed'}`,
            })));
        }), toArray(), map((results) => {
            const created = [];
            const errors = [];
            for (const res of results) {
                if ('ok' in res && res.ok)
                    created.push(res.ok);
                else if ('fail' in res && res.fail)
                    errors.push(res.fail);
            }
            return { created, skipped, errors };
        }));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DocumentImportService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DocumentImportService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DocumentImportService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
/**
 * Strip HTML from Nuxeo CSV import report for plain-text display. Empty when the report carries
 * no text, so the caller can supply its own translated fallback.
 */
function summarizeCsvImportReport(report) {
    const text = report
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .split('\n')
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    return text;
}
/** Strip control characters unsafe for HTTP header values (e.g. CR/LF injection). */
function sanitizeHttpHeaderValue(value) {
    const cleaned = value
        .split('')
        .filter((char) => {
        const code = char.charCodeAt(0);
        return code >= 32 && code !== 127;
    })
        .join('')
        .trim();
    return cleaned || 'untitled';
}
function readBatchIdFromInitResponse(resp) {
    const fromHeader = resp.headers.get('X-Batch-Id') ?? resp.headers.get('Batch-Id');
    if (fromHeader?.trim())
        return fromHeader.trim();
    const body = resp.body;
    if (body && typeof body === 'object') {
        const record = body;
        const id = record['batchId'] ??
            record['batch-id'] ??
            record['uploadBatchId'];
        if (id)
            return id;
    }
    throw new Error('Could not read upload batch id from response');
}
/** RFC 4180–friendly: quoted fields may contain commas and newlines. */
function parseCsvTable(text) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    let rowHasCharacters = false;
    const pushField = () => {
        currentRow.push(currentField.trim());
        currentField = '';
    };
    const pushRow = () => {
        pushField();
        if (rowHasCharacters) {
            rows.push(currentRow);
        }
        currentRow = [];
        rowHasCharacters = false;
    };
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            rowHasCharacters = true;
            if (inQuotes && text[i + 1] === '"') {
                currentField += '"';
                i++;
            }
            else {
                inQuotes = !inQuotes;
            }
            continue;
        }
        if (char === ',' && !inQuotes) {
            rowHasCharacters = true;
            pushField();
            continue;
        }
        if ((char === '\n' || char === '\r') && !inQuotes) {
            pushRow();
            if (char === '\r' && text[i + 1] === '\n') {
                i++;
            }
            continue;
        }
        currentField += char;
        rowHasCharacters = true;
    }
    if (rowHasCharacters || currentField.length > 0 || currentRow.length > 0) {
        pushRow();
    }
    return rows;
}

class TaskService {
    api = inject(NuxeoApiBase);
    /** Emits whenever tasks are mutated (completed, delegated, reassigned, abandoned). */
    tasksChanged$ = new Subject();
    /** Notify all subscribers that the task list has changed. */
    notifyTasksChanged() {
        this.tasksChanged$.next();
    }
    /** Fetch headers to resolve task targets and actors. */
    taskFetchHeaders = {
        'X-NXfetch.task': 'targetDocumentIds,actors',
    };
    getUserTasks(userId, pageSize = 10) {
        const params = new HttpParams().set('userId', userId).set('pageSize', pageSize);
        return this.api.get('/nuxeo/api/v1/task', params, this.taskFetchHeaders).pipe(map$1((res) => res.entries), switchMap$1((tasks) => {
            if (tasks.length === 0)
                return of([]);
            const enriched$ = tasks.map((task) => {
                const targetRef = task.targetDocumentIds?.[0];
                // Enriched response has uid+title, plain response has id
                if (targetRef?.title) {
                    return of({ ...task, targetDocTitle: targetRef.title });
                }
                const docId = targetRef?.uid || targetRef?.id;
                if (!docId)
                    return of(task);
                return this.api.get(`/nuxeo/api/v1/id/${docId}`).pipe(map$1((doc) => ({ ...task, targetDocTitle: doc.title })), catchError$1(() => of(task)));
            });
            return forkJoin(enriched$);
        }));
    }
    /** Get a specific task by ID (with enriched targets & actors). */
    getTask(taskId) {
        return this.api.get(`/nuxeo/api/v1/task/${taskId}`, undefined, this.taskFetchHeaders);
    }
    /** Get tasks for a document. */
    getDocumentTasks(docId, userId) {
        let params = new HttpParams();
        if (userId)
            params = params.set('userId', userId);
        return this.api
            .get(`/nuxeo/api/v1/id/${docId}/@task`, params, this.taskFetchHeaders)
            .pipe(map$1((res) => res.entries));
    }
    /**
     * Complete a task by executing an action (e.g., start_review, approve, reject, validate).
     * Variables are task-specific (comment, participants, end_date, etc.).
     */
    completeTask(taskId, action, variables = {}, comment) {
        const body = {
            'entity-type': 'task',
            id: taskId,
            variables,
        };
        if (comment !== undefined) {
            body['comment'] = comment;
        }
        return this.api.put(`/nuxeo/api/v1/task/${taskId}/${action}`, body);
    }
    /** Reassign a task to other actors (replaces current actors). */
    reassignTask(taskId, actors, comment) {
        const body = {
            'entity-type': 'task',
            id: taskId,
            actors,
        };
        if (comment)
            body['comment'] = comment;
        return this.api.put(`/nuxeo/api/v1/task/${taskId}/reassign`, body);
    }
    /** Delegate a task to additional actors (keeps original actors). */
    delegateTask(taskId, delegatedActors, comment) {
        const body = {
            'entity-type': 'task',
            id: taskId,
            delegatedActors,
        };
        if (comment)
            body['comment'] = comment;
        return this.api.put(`/nuxeo/api/v1/task/${taskId}/delegate`, body);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: TaskService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: TaskService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: TaskService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/** Preferred display order for common workspace content types. */
const WORKSPACE_CONTENT_TYPE_ORDER = [
    'Audio',
    'Collection',
    'File',
    'Folder',
    'Note',
    'OrderedFolder',
    'Picture',
    'Video',
    'Workspace',
];
const WORKSPACE_CONTENT_TYPE_SET = new Set(WORKSPACE_CONTENT_TYPE_ORDER);
/**
 * Parses allowed child document types from the Nuxeo `subtypes` document enricher.
 * @see https://doc.nuxeo.com/rest-api/1/document-enrichers/#subtypes
 */
function parseDocumentSubtypes(doc) {
    const raw = doc.contextParameters?.['subtypes'];
    if (!Array.isArray(raw) || raw.length === 0) {
        return [];
    }
    const types = [];
    for (const item of raw) {
        if (typeof item === 'string') {
            const trimmed = item.trim();
            if (trimmed)
                types.push(trimmed);
            continue;
        }
        if (item && typeof item === 'object') {
            const type = item.type;
            if (typeof type === 'string' && type.trim()) {
                types.push(type.trim());
            }
        }
    }
    return [...new Set(types)];
}
/** Sorts API subtypes with workspace content types first (stable, known order). */
function sortDocumentSubtypes(types) {
    const known = WORKSPACE_CONTENT_TYPE_ORDER.filter((t) => types.includes(t));
    const rest = types.filter((t) => !WORKSPACE_CONTENT_TYPE_SET.has(t));
    return [...known, ...rest];
}

/** Auto-provisioned structural containers under a domain — not user-created siblings. */
const DOMAIN_STRUCTURAL_ROOT_TYPES = new Set([
    'SectionRoot',
    'WorkspaceRoot',
    'TemplateRoot',
]);
/** Catalogue key for the notice telling the user where content can be created under a domain. */
const DOMAIN_CONTAINER_GUIDANCE_KEY = 'browse.message.domain-container-guidance';
function isDomainParentType(parentType) {
    return parentType === 'Domain';
}
/**
 * Domain-level subtypes from Nuxeo include structural roots; users must navigate into
 * the existing Sections / Templates / Workspaces containers instead.
 */
function filterCreatableSubtypesForParent(parentType, subtypes) {
    if (!isDomainParentType(parentType)) {
        return subtypes;
    }
    return subtypes.filter((type) => !DOMAIN_STRUCTURAL_ROOT_TYPES.has(type));
}
/** Allowed child types for a folder document (subtypes enricher + domain filtering). */
function resolveCreatableSubtypes(doc) {
    return sortDocumentSubtypes(filterCreatableSubtypesForParent(doc.type, parseDocumentSubtypes(doc)));
}

/** Decode a single URL-encoded browse path segment (e.g. `Domain%201` → `Domain 1`). */
function decodeNuxeoPathSegment(segment) {
    try {
        return decodeURIComponent(segment);
    }
    catch {
        return segment;
    }
}
/** True when the router URL is a browse main-view route. */
function isBrowseRouterUrl(routerUrl) {
    const withoutQuery = routerUrl.split('?')[0];
    const path = (withoutQuery.includes('#') ? withoutQuery.split('#').pop() : withoutQuery) ?? '/';
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return normalized === '/browse' || normalized.startsWith('/browse/');
}
/** Parse the Nuxeo repository path from a router URL (e.g. `/#/browse/default-domain/foo` → `/default-domain/foo`). */
function parseBrowseNuxeoPathFromRouterUrl(routerUrl) {
    const withoutQuery = routerUrl.split('?')[0];
    const path = (withoutQuery.includes('#') ? withoutQuery.split('#').pop() : withoutQuery) ?? '/';
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const prefix = '/browse';
    if (normalized === prefix || normalized === `${prefix}/`)
        return '/';
    if (!normalized.startsWith(`${prefix}/`))
        return '/';
    const remainder = normalized.slice(prefix.length);
    const decoded = remainder
        .split('/')
        .filter(Boolean)
        .map((segment) => decodeNuxeoPathSegment(segment))
        .join('/');
    return decoded ? `/${decoded}` : '/';
}
/** Normalize a Nuxeo path for stable comparisons. */
function normalizeNuxeoPath(path) {
    const trimmed = path.trim();
    if (!trimmed || trimmed === '/')
        return '/';
    const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return withLeading.replace(/\/+$/, '') || '/';
}
/** Case-insensitive Nuxeo path equality (Nuxeo may vary segment casing per server). */
function nuxeoPathsEqual(a, b) {
    return normalizeNuxeoPath(a).toLowerCase() === normalizeNuxeoPath(b).toLowerCase();
}
/** Slugify a single path segment for flexible matching (`Domain 1` ≈ `domain-1`). */
function slugifyNuxeoPathSegment(segment) {
    return decodeNuxeoPathSegment(segment).trim().toLowerCase().replace(/\s+/g, '-');
}
/** Segment-wise path comparison tolerating spaces vs hyphens and casing. */
function nuxeoPathSegments(path) {
    return normalizeNuxeoPath(path).split('/').filter(Boolean).map(slugifyNuxeoPathSegment);
}
function nuxeoPathsEqualFlexible(a, b) {
    const left = nuxeoPathSegments(a);
    const right = nuxeoPathSegments(b);
    if (left.length !== right.length)
        return false;
    return left.every((segment, index) => segment === right[index]);
}
/** Build an app browse route from a repository path. */
function toBrowseRouterUrl(nuxeoPath) {
    const normalized = normalizeNuxeoPath(nuxeoPath);
    if (normalized === '/')
        return '/browse';
    const encodedPath = normalized
        .split('/')
        .filter(Boolean)
        .map((segment) => encodeURIComponent(segment))
        .join('/');
    return `/browse/${encodedPath}`;
}
/** Parent folder path for a document path (e.g. `/a/b/file.pdf` → `/a/b`). */
function parentNuxeoFolderPath(docPath) {
    const normalized = normalizeNuxeoPath(docPath);
    if (normalized === '/')
        return '/';
    const parts = normalized.split('/').filter(Boolean);
    parts.pop();
    return parts.length ? `/${parts.join('/')}` : '/';
}
/**
 * Nuxeo Web UI browse-tree context: folderish containers use their path;
 * leaf documents highlight their containing folder in the tree.
 */
function browseTreeContextPath(doc) {
    if (doc.type === 'Root') {
        return normalizeNuxeoPath(doc.path);
    }
    if (isFolderishDocument(doc) && doc.type !== 'Collection') {
        return normalizeNuxeoPath(doc.path);
    }
    return parentNuxeoFolderPath(doc.path);
}
/**
 * Cumulative path prefixes for tree expansion, e.g.
 * `/default-domain/workspaces` → [`/default-domain`, `/default-domain/workspaces`].
 */
function cumulativeNuxeoPathPrefixes(nuxeoPath) {
    const normalized = normalizeNuxeoPath(nuxeoPath);
    if (normalized === '/')
        return [];
    const parts = normalized.split('/').filter(Boolean);
    const prefixes = [];
    let accumulated = '';
    for (const part of parts) {
        accumulated += `/${part}`;
        prefixes.push(accumulated);
    }
    return prefixes;
}
/** First path segment as a folder path (e.g. `/Domain-5/workspaces` → `/Domain-5`). */
function topLevelNuxeoFolderPath(nuxeoPath) {
    const normalized = normalizeNuxeoPath(nuxeoPath);
    if (normalized === '/')
        return null;
    const parts = normalized.split('/').filter(Boolean);
    return parts.length > 0 ? `/${parts[0]}` : null;
}
/** Prefixes that must be expanded to reveal the active folder (all but the last segment). */
function expandableNuxeoPathPrefixes(nuxeoPath) {
    const prefixes = cumulativeNuxeoPathPrefixes(nuxeoPath);
    return prefixes.slice(0, -1);
}
/** True when `path` is under a `UserWorkspaces` segment (personal workspace tree). */
function isUserWorkspacePath(nuxeoPath) {
    return nuxeoPathSegments(nuxeoPath).includes('userworkspaces');
}
/** Owner username from a personal workspace path, e.g. `/…/UserWorkspaces/jdoe/…` → `jdoe`. */
function userWorkspaceOwnerFromPath(nuxeoPath) {
    const segments = normalizeNuxeoPath(nuxeoPath).split('/').filter(Boolean);
    const uwIndex = segments.findIndex((segment) => slugifyNuxeoPathSegment(segment) === 'userworkspaces');
    if (uwIndex === -1 || uwIndex + 1 >= segments.length)
        return null;
    return decodeNuxeoPathSegment(segments[uwIndex + 1]);
}
/** Personal workspace root path, e.g. `/default-domain/UserWorkspaces/jdoe`. */
function userWorkspaceRootFromPath(nuxeoPath) {
    const segments = normalizeNuxeoPath(nuxeoPath).split('/').filter(Boolean);
    const uwIndex = segments.findIndex((segment) => slugifyNuxeoPathSegment(segment) === 'userworkspaces');
    if (uwIndex === -1 || uwIndex + 1 >= segments.length)
        return null;
    return `/${segments.slice(0, uwIndex + 2).join('/')}`;
}
/**
 * Web UI: non-admins viewing another user's personal workspace do not get breadcrumbs.
 * Admins and the workspace owner always see them.
 */
function shouldShowUserWorkspaceBreadcrumbs(nuxeoPath, currentUsername, isAdministrator) {
    if (!isUserWorkspacePath(nuxeoPath))
        return true;
    if (isAdministrator)
        return true;
    const owner = userWorkspaceOwnerFromPath(nuxeoPath);
    if (!owner || !currentUsername)
        return false;
    return slugifyNuxeoPathSegment(owner) === slugifyNuxeoPathSegment(currentUsername);
}
/** Browse route to open after trashing a document under UserWorkspaces (workspace root). */
function userWorkspaceBrowseRouterUrl(nuxeoPath) {
    const root = userWorkspaceRootFromPath(nuxeoPath);
    return root ? toBrowseRouterUrl(root) : null;
}
/** Fallback browse route after trash: parent folder, else workspace root, else repository root. */
function postTrashBrowseRouterUrl(deletedDocPath) {
    const parentPath = parentNuxeoFolderPath(deletedDocPath);
    if (parentPath !== '/') {
        return toBrowseRouterUrl(parentPath);
    }
    const workspaceUrl = userWorkspaceBrowseRouterUrl(deletedDocPath);
    if (workspaceUrl)
        return workspaceUrl;
    return '/browse';
}
/** True when the document is a user collection (type or facet; optional create-time type hint). */
function isCollectionDocument(doc, docTypeHint) {
    if (docTypeHint === 'Collection')
        return true;
    if (!doc)
        return false;
    return doc.type === 'Collection' || doc.facets?.includes('Collection') === true;
}
/**
 * Web UI parity: Collection documents open the collection view; folderish containers open
 * browse; everything else opens document detail.
 */
function documentNavigationUrl(doc, docTypeHint) {
    if (isCollectionDocument(doc, docTypeHint)) {
        return `/collections/${doc.uid}`;
    }
    if (doc.type === 'Favorites' || isFolderishDocument(doc)) {
        return toBrowseRouterUrl(doc.path);
    }
    return `/doc/${doc.uid}`;
}

/**
 * Escape a value for interpolation into a single-quoted NXQL literal.
 *
 * Returns the escaped body **without** the surrounding quotes, so a caller composes
 * `'${escapeNxqlLiteral(term)}'` and stays in control of wildcards.
 *
 * ## Backslash, not a doubled quote
 *
 * This used to return `''` for a quote. Nuxeo does not accept that — checked against
 * the local server rather than inferred from the grammar:
 *
 * ```
 * dc:title = 'O''Brien'  → HTTP 400  Syntax error: Invalid token <Brien> at offset 49
 * dc:title = 'O\'Brien'  → HTTP 200
 * ```
 *
 * A doubled quote still contained an injected payload, because the payload ends up
 * inside a string token rather than becoming operators — but it turned every
 * legitimate apostrophe into a failed search. Backslash is the escape the parser
 * implements.
 *
 * ## What it does not cover: property names
 *
 * Only literals are escaped, and the server will not catch a wrong property name for you:
 * **a property Nuxeo does not know answers HTTP 200 with zero entries** — `dc:nosuchfield = 'x'`
 * is not an error, here or in a `sortBy` (see `BrowseService.getChildren`), so a misspelt name
 * reads as an empty repository. Name properties from a list that has been run against the
 * server. Two that are easy to get wrong: a blob's MIME type is `file:content/mime-type`, and a
 * date literal is `TIMESTAMP '…'`, not `DATE '…'`.
 *
 * ## Order matters
 *
 * The backslash is escaped **first**. Doing it the other way round — `'` → `\'` then
 * `\` → `\\` — double-escapes the backslash just introduced, turning `\'` into `\\'`:
 * a literal backslash followed by an *unescaped* quote, which reopens the hole this
 * function exists to close.
 */
function escapeNxqlLiteral(value) {
    return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/** True for Domain documents attached directly under the repository root. */
function isTopLevelDomain(doc) {
    if (!doc || doc.type !== 'Domain') {
        return false;
    }
    const path = (doc.path ?? '').replace(/\/+$/, '');
    const segments = path.split('/').filter(Boolean);
    // Path depth is stable across environments (local Docker uses a non-null root uid).
    if (segments.length === 1) {
        return true;
    }
    // Null-UUID parent sentinel used on some Nuxeo deployments (not universal).
    return doc.parentRef === NULL_REPOSITORY_ROOT_UID;
}
/** Parent-ref sentinel for top-level domains on deployments that use the null UUID root. */
const NULL_REPOSITORY_ROOT_UID = '00000000-0000-0000-0000-000000000000';
/**
 * Adds Nuxeo's `sortBy` and `sortOrder` to a page request: comma-separated lists of the same
 * length, which `@children` and every page provider read the same way.
 */
function withSort(params, sort) {
    if (!sort?.length)
        return params;
    return params
        .set('sortBy', sort.map((entry) => entry.sortBy).join(','))
        .set('sortOrder', sort.map((entry) => entry.sortOrder).join(','));
}
/** A property's value to sort by; `dc:title` and `dc:modified` also have a top-level field. */
function sortValue(doc, property) {
    const value = doc.properties?.[property];
    if (value !== undefined && value !== null)
        return String(value);
    if (property === 'dc:title')
        return doc.title ?? '';
    if (property === 'dc:modified')
        return doc.lastModified ?? '';
    return '';
}
/**
 * One page of a list that was read whole, in the order asked for. The repository-root fallback
 * reads every accessible top-level folder at once, so its page and sort are applied here; the
 * server pages and sorts every other listing.
 */
function pageOfFullList(entries, pageSize, page) {
    const sorted = [...entries];
    for (const { sortBy, sortOrder } of [...(page?.sort ?? [])].reverse()) {
        const direction = sortOrder === 'DESC' ? -1 : 1;
        sorted.sort((a, b) => direction *
            sortValue(a, sortBy).localeCompare(sortValue(b, sortBy), undefined, {
                numeric: true,
                sensitivity: 'base',
            }));
    }
    const start = Math.max(0, page?.currentPageIndex ?? 0) * pageSize;
    return {
        entries: sorted.slice(start, start + pageSize),
        totalSize: entries.length,
        hasNextPage: start + pageSize < entries.length,
    };
}
class BrowseService {
    api = inject(NuxeoApiBase);
    http = inject(HttpClient);
    static ACCESSIBLE_DOMAINS_NXQL = 'SELECT * FROM Domain WHERE ecm:isTrashed = 0 ORDER BY dc:title';
    static ACCESSIBLE_NAV_NODES_NXQL = [
        'SELECT * FROM Document',
        "WHERE ecm:mixinType != 'HiddenInNavigation'",
        'AND ecm:isTrashed = 0',
        "AND ecm:primaryType IN ('Domain', 'Workspace', 'Folder', 'OrderedFolder')",
        'ORDER BY ecm:path',
    ].join(' ');
    getByPath(nuxeoPath) {
        const safePath = nuxeoPath.replace(/\/+$/, '') || '/';
        return this.api.get(`/nuxeo/api/v1/path${safePath}`, undefined, {
            properties: '*',
            'enrichers.document': 'acls,permissions,favorites,subscribedNotifications',
        });
    }
    /** Current user's personal workspace (Web UI: `User.GetUserWorkspace` automation). */
    getUserWorkspace() {
        return this.api.post('/nuxeo/api/v1/automation/User.GetUserWorkspace', {
            params: {},
            context: {},
        });
    }
    /**
     * Repository root for the browse nav tree. Users with domain-only ACLs may receive 403 on
     * `GET /path/` but can still resolve the root uid from an accessible Domain via NXQL.
     */
    getRepositoryRoot() {
        return this.getByPath('/').pipe(catchError(() => this.resolveRepositoryRootFromDomains()));
    }
    /**
     * Loads the browse nav tree root plus top-level folder entries. Handles administrators,
     * domain-scoped users, and read-only users who only have workspace/folder ACLs.
     */
    getNavTreeBootstrap(pageSize = 50) {
        return this.getRepositoryRoot().pipe(catchError(() => of(this.syntheticRepositoryRoot())), switchMap$1((root) => this.loadNavTreeBootstrapEntries(root, pageSize)), catchError(() => this.getAccessibleTopLevelNavNodes(pageSize).pipe(map$1((entries) => ({
            root: this.syntheticRepositoryRoot(entries),
            entries,
        })))));
    }
    /**
     * Loads the current browse folder and its children. When repository root is not readable,
     * falls back to accessible top-level folders (User Workspaces, domain-scoped ACLs, etc.).
     */
    getBrowseFolderContents(nuxeoPath, pageSize = 50, page) {
        const safePath = nuxeoPath.replace(/\/+$/, '') || '/';
        return this.getByPath(safePath).pipe(switchMap$1((folder) => this.listBrowseFolderEntries(folder, safePath, pageSize, page).pipe(
        // Spread rather than destructure: picking named fields is what dropped `hasNextPage`
        // on its way out, so the pager saw `undefined` and never offered a next page.
        map$1((page) => ({ folder, ...page })))), catchError((error) => {
            // Nuxeo's own error, so a caller can tell "may not read this" (403) from "not there" (404)
            // from a failure; a replacement Error carried no status.
            if (safePath !== '/') {
                return throwError(() => error);
            }
            return this.getNavTreeBootstrap(pageSize).pipe(map$1(({ root, entries }) => ({
                folder: root,
                ...pageOfFullList(entries, pageSize, page),
                redirectTo: entries.length === 1 ? entries[0].path : undefined,
            })));
        }));
    }
    listBrowseFolderEntries(folder, safePath, pageSize, page) {
        // Each branch is asked for one page in the server's order. `Root`, `Domain`, `Favorites` and
        // `Collection` used to take only a page size, so a listing could never reach past its first
        // page there, and a sort the caller asked for was dropped without a word. A domain lists every
        // child through `@children`, as Nuxeo Web UI's domain view does: keeping only its folders after
        // the server had paged them left pages short, or empty, wherever files came first.
        if (folder.type === 'Root') {
            return this.getNavTreeChildren(folder, pageSize, page ?? {}).pipe(map$1((list) => this.toBrowseEntryList(list)));
        }
        if (folder.type === 'Favorites' || folder.type === 'Collection') {
            return this.getCollectionMembers(folder.uid, pageSize, page).pipe(map$1((list) => this.toBrowseEntryList(list)));
        }
        return this.getChildren(safePath, pageSize, page?.currentPageIndex ?? 0, page?.sort).pipe(map$1((list) => this.toBrowseEntryList(list)));
    }
    /**
     * Collection / Favorites members, one page at a time (Nuxeo Web UI uses
     * `default_content_collection`, not `@children`).
     *
     * Unlike `@children`, this page provider answers a sort key it cannot use with HTTP 400 rather
     * than an empty page, and it counts every member, so `totalSize` is real on every page.
     */
    getCollectionMembers(collectionUid, pageSize = 50, page) {
        const params = withSort(new HttpParams()
            .set('queryParams', collectionUid)
            .set('pageSize', pageSize)
            .set('currentPageIndex', page?.currentPageIndex ?? 0), page?.sort);
        return this.api.get('/nuxeo/api/v1/search/pp/default_content_collection/execute', params, 
        // `permissions`, as `getChildren` asks for, so a row's actions read its own permissions.
        { properties: '*', 'enrichers.document': 'permissions' });
    }
    /**
     * Nuxeo's own pagination facts, not a substitute for them.
     *
     * Nuxeo sets `resultsCountLimit` to the **requested `pageSize`** and counts only within it. So
     * `resultsCount` is a real total exactly when the whole folder fits on one page, and `-2`
     * otherwise — measured on the local instance: `pageSize=39` over 39 children answered `39`;
     * `pageSize=20` over the same folder answered `-2`.
     *
     * **The total is therefore known only when there is nothing to page**, which is why the pager is
     * next/previous rather than numbered. `isNextPageAvailable` is accurate in both cases.
     *
     * Replacing an unknown total with the page length is the recorded `totalCount` defect: it makes a
     * paged list look complete.
     */
    toBrowseEntryList(list) {
        const reported = list.totalSize ?? list.resultsCount;
        return {
            entries: list.entries ?? [],
            // Negative means Nuxeo declined to count. Passed through as-is so a caller can tell
            // "unknown" from "zero"; `-1` and `-2` are Nuxeo's own conventions.
            totalSize: typeof reported === 'number' ? reported : -2,
            hasNextPage: list.isNextPageAvailable,
        };
    }
    resolveRepositoryRootFromDomains() {
        return this.api.nxqlSearch(BrowseService.ACCESSIBLE_DOMAINS_NXQL, 50, { properties: '*' }).pipe(switchMap$1((list) => {
            const topLevelDomain = (list.entries ?? []).find((entry) => isTopLevelDomain(entry));
            if (!topLevelDomain?.parentRef) {
                return throwError(() => new Error('Unable to resolve repository root for browse tree'));
            }
            return of({
                uid: topLevelDomain.parentRef,
                title: 'Root',
                type: 'Root',
                path: '/',
                lastModified: topLevelDomain.lastModified ?? '',
                properties: {},
            });
        }));
    }
    loadNavTreeBootstrapEntries(root, pageSize) {
        return this.getNavTreeChildren(root, pageSize).pipe(map$1((list) => list.entries ?? []), switchMap$1((entries) => entries.length > 0
            ? of({ root, entries })
            : this.getAccessibleTopLevelNavNodes(pageSize).pipe(map$1((fallback) => ({ root, entries: fallback })))));
    }
    getAccessibleTopLevelNavNodes(pageSize) {
        return this.api
            .nxqlSearch(BrowseService.ACCESSIBLE_NAV_NODES_NXQL, pageSize, { properties: '*' })
            .pipe(map$1((list) => this.filterTopLevelNavNodes(list.entries ?? [])));
    }
    filterTopLevelNavNodes(entries) {
        const folderish = entries.filter((doc) => isBrowsableNavNode(doc));
        const accessible = new Set(folderish.map((doc) => doc.uid));
        return folderish.filter((doc) => !doc.parentRef || !accessible.has(doc.parentRef));
    }
    syntheticRepositoryRoot(entries = []) {
        const topLevel = entries.find((entry) => isTopLevelDomain(entry));
        const rootUid = topLevel?.parentRef ?? entries.find((entry) => entry.parentRef)?.parentRef ?? 'virtual-root';
        return {
            uid: rootUid,
            title: 'Root',
            type: 'Root',
            path: '/',
            lastModified: '',
            properties: {},
        };
    }
    /** Folder metadata plus allowed child document types (`@subtypes` enricher). */
    getFolderContext(nuxeoPath) {
        const safePath = nuxeoPath.replace(/\/+$/, '') || '/';
        return this.api.get(`/nuxeo/api/v1/path${safePath}`, undefined, {
            properties: '*',
            'enrichers.document': 'subtypes',
        });
    }
    /**
     * Allowed child document types for `nuxeoPath`, from the Nuxeo `subtypes` enricher.
     * @see https://doc.nuxeo.com/rest-api/1/document-enrichers/#subtypes
     */
    getCreatableSubtypes(nuxeoPath) {
        return this.getFolderContext(nuxeoPath).pipe(map$1((doc) => resolveCreatableSubtypes(doc)));
    }
    /**
     * Folder children for the nav drawer tree. Repository root uses `tree_children`
     * so every accessible domain is listed; domains use `@children` so structural
     * containers (SectionRoot / TemplateRoot / WorkspaceRoot) are always listed.
     *
     * Without `page`, a repository root lists every page, as a tree level does. With `page`, the
     * root answers that one page in the order it asks for, as a listing does. A domain's level is its
     * folders on the first page of `@children`, whatever `page` says: a listing pages a domain
     * through `getBrowseFolderContents`, which keeps its files too.
     */
    getNavTreeChildren(parent, pageSize = 50, page) {
        if (parent.type === 'Root') {
            return page
                ? this.getTreeChildrenPage(parent.uid, pageSize, page)
                : this.getTreeChildren(parent.uid, pageSize);
        }
        if (parent.type === 'Domain') {
            const safePath = parent.path?.replace(/\/+$/, '') ?? '';
            return this.getChildren(safePath, pageSize).pipe(map$1((list) => this.keepEntries(list, (doc) => isFolderishDocument(doc))));
        }
        // User workspaces expose Favorites (type Favorites) via @children; tree_children omits it
        // once a Collections folder exists (NXSAT-204).
        if (parent.type === 'Workspace' && isUserWorkspacePath(parent.path ?? '')) {
            const safePath = parent.path?.replace(/\/+$/, '') ?? '';
            return this.getChildren(safePath, pageSize).pipe(map$1((list) => this.keepEntries(list, (doc) => isBrowsableNavNode(doc))));
        }
        return this.getTreeChildrenWithPathFallback(parent, pageSize);
    }
    /**
     * Which of these folders contain at least one folder the browse tree would list.
     *
     * One query for a whole tree level, matching the `tree_children` page provider's own filter, so
     * a tree can drop the expand arrow from folders that hold only files. `null` when the answer is
     * incomplete — more matches than one page — so a caller keeps the arrow rather than hiding a
     * branch that exists.
     */
    getFolderIdsWithSubfolders(parentUids) {
        if (parentUids.length === 0) {
            return of(new Set());
        }
        const ids = parentUids.map((uid) => `'${escapeNxqlLiteral(uid)}'`).join(', ');
        const query = `SELECT * FROM Document WHERE ecm:parentId IN (${ids}) ` +
            `AND ecm:mixinType = 'Folderish' AND ecm:mixinType != 'HiddenInNavigation' ` +
            `AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0`;
        return this.api
            .nxqlSearch(query, BrowseService.SUBFOLDER_PROBE_PAGE_SIZE, { properties: 'dublincore' })
            .pipe(map$1((list) => list.isNextPageAvailable
            ? null
            : new Set((list.entries ?? []).map((doc) => doc.parentRef ?? '').filter(Boolean))));
    }
    static SUBFOLDER_PROBE_PAGE_SIZE = 1000;
    /**
     * Filters a page of children and keeps its counts consistent with what is kept.
     *
     * Nuxeo's `totalSize` and `resultsCount` count every child, so passing them through beside a
     * filtered list showed "1–3 of 5" over three rows. The filtered length is the total only when
     * this page was the whole folder; beyond that the kept count of later pages is unknown.
     *
     * Nuxeo reports a count it declined to compute as a negative number, so a negative or missing
     * count stays unknown even without a next page, rather than passing as a complete total.
     */
    keepEntries(list, keep) {
        const entries = (list.entries ?? []).filter(keep);
        const hasNextPage = list.isNextPageAvailable === true;
        const counted = (count) => typeof count === 'number' && count >= 0;
        const complete = !hasNextPage && counted(list.totalSize) && counted(list.resultsCount);
        const total = complete ? entries.length : -2;
        return { ...list, entries, totalSize: total, resultsCount: total };
    }
    getTreeChildrenWithPathFallback(parent, pageSize) {
        return this.getTreeChildren(parent.uid, pageSize).pipe(switchMap$1((list) => {
            if ((list.entries?.length ?? 0) > 0) {
                return of(list);
            }
            const safePath = parent.path?.replace(/\/+$/, '') ?? '';
            if (!safePath || safePath === '/') {
                return of(list);
            }
            return this.getChildren(safePath, pageSize).pipe(map$1((children) => ({
                ...children,
                entries: (children.entries ?? []).filter((doc) => isBrowsableNavNode(doc)),
            })), catchError(() => of(list)));
        }));
    }
    /**
     * A folder's children, one page at a time, optionally ordered by the server.
     *
     * `sortBy` takes Nuxeo property names — `dc:title`, `dc:modified` — and accepts several,
     * comma-separated, with a matching `sortOrder` list. Verified against the local instance.
     *
     * **A property Nuxeo cannot sort by returns HTTP 200 with zero entries**, not an error, which
     * is indistinguishable from an empty folder: `sortBy=ecm:isFolder` empties a folder of fifty
     * children. Nuxeo has no sortable folderish property, so "folders first" cannot be asked of the
     * server at all; `ecm:currentLifeCycleState` does sort. Callers must therefore validate the
     * field before calling, as browse does against its `SORT_FIELDS`, rather than forward a key
     * they cannot vouch for and render an empty list.
     */
    getChildren(nuxeoPath, pageSize = 50, currentPageIndex = 0, sort) {
        const safePath = nuxeoPath.replace(/\/+$/, '');
        const params = withSort(new HttpParams().set('pageSize', pageSize).set('currentPageIndex', currentPageIndex), sort);
        return this.api.get(`/nuxeo/api/v1/path${safePath}/@children`, params, {
            properties: '*',
            // `permissions` only — not the full enricher set `getFullDocument` asks for, which would
            // multiply the payload of every row. Without it a row carries no
            // `contextParameters.permissions`, and `hasDocumentPermission` reads that as no permission at
            // all, so row-level actions would disappear. Asking is cheaper than the alternatives:
            // guessing, or hardcoding.
            'enrichers.document': 'permissions',
        });
    }
    /**
     * Folder children for the browse tree via Nuxeo's `tree_children` page provider
     * (same query Nuxeo Web UI uses: Folderish, not trashed, not hidden in navigation).
     * Fetches all pages when the provider marks additional pages available.
     */
    getTreeChildren(parentUid, pageSize = 50) {
        const fetchPage = (pageIndex) => {
            const params = new HttpParams()
                .set('queryParams', parentUid)
                .set('pageSize', pageSize)
                .set('currentPageIndex', pageIndex);
            return this.api.get('/nuxeo/api/v1/search/pp/tree_children/execute', params, { properties: '*' });
        };
        const emptyList = {
            entries: [],
            totalSize: 0,
            currentPageSize: 0,
            currentPageIndex: 0,
            numberOfPages: 1,
        };
        return fetchPage(0).pipe(expand((res) => (res.isNextPageAvailable ? fetchPage(res.currentPageIndex + 1) : EMPTY)), reduce((acc, res) => {
            const entries = [...acc.entries, ...(res.entries ?? [])];
            return {
                entries,
                totalSize: res.totalSize ?? entries.length,
                currentPageSize: entries.length,
                currentPageIndex: 0,
                numberOfPages: 1,
            };
        }, emptyList));
    }
    /** One page of `tree_children`, in the order asked for: a repository root listed as a folder. */
    getTreeChildrenPage(parentUid, pageSize, page) {
        const params = withSort(new HttpParams()
            .set('queryParams', parentUid)
            .set('pageSize', pageSize)
            .set('currentPageIndex', page.currentPageIndex ?? 0), page.sort);
        return this.api.get('/nuxeo/api/v1/search/pp/tree_children/execute', params, { properties: '*' });
    }
    updateDocument(uid, properties, options) {
        const headers = {
            'Content-Type': 'application/json',
            properties: '*',
        };
        if (options?.enrichPermissions) {
            headers['enrichers.document'] = 'permissions';
        }
        return this.api.put(`/nuxeo/api/v1/id/${uid}`, { 'entity-type': 'document', properties }, headers);
    }
    /** Copy clipboard items into `targetUid` (Web UI: `Document.Copy`). */
    copyDocuments(uids, targetUid) {
        return this.runClipboardDocumentsOp('Document.Copy', uids, targetUid);
    }
    /** Move clipboard items into `targetUid` (Web UI: `Document.Move`). */
    moveDocuments(uids, targetUid) {
        return this.runClipboardDocumentsOp('Document.Move', uids, targetUid);
    }
    runClipboardDocumentsOp(operation, uids, targetUid) {
        if (uids.length === 0) {
            return of([]);
        }
        if (uids.length === 1) {
            return this.api
                .post(`/nuxeo/api/v1/automation/${operation}`, {
                params: { target: targetUid },
                context: {},
                input: `doc:${uids[0]}`,
            })
                .pipe(map$1((res) => this.normalizeClipboardOpResult(res)));
        }
        const input = `docs:${uids.join(',')}`;
        return this.api
            .post(`/nuxeo/api/v1/automation/${operation}`, {
            params: { target: targetUid },
            context: {},
            input,
        })
            .pipe(map$1((res) => this.normalizeClipboardOpResult(res)), catchError(() => forkJoin(uids.map((uid) => this.api
            .post(`/nuxeo/api/v1/automation/${operation}`, {
            params: { target: targetUid },
            context: {},
            input: `doc:${uid}`,
        })
            .pipe(catchError(() => of(null))))).pipe(map$1((results) => results.filter((doc) => doc !== null)), switchMap$1((results) => results.length === 0
            ? throwError(() => new Error('All clipboard documents failed'))
            : of(results)))));
    }
    normalizeClipboardOpResult(res) {
        if (res && typeof res === 'object' && 'entries' in res && Array.isArray(res.entries)) {
            return res.entries;
        }
        if (res && typeof res === 'object' && 'uid' in res) {
            return [res];
        }
        return [];
    }
    /** True when the Collections folder still has at least one non-trashed child collection. */
    hasChildCollections(collectionsFolderUid) {
        const parentId = escapeNxqlLiteral(collectionsFolderUid);
        const query = `SELECT * FROM Document WHERE ecm:parentId = '${parentId}' ` +
            `AND ecm:primaryType = 'Collection' AND ecm:isTrashed = 0 AND ecm:isVersion = 0`;
        return this.api
            .nxqlSearch(query, 1)
            .pipe(map$1((list) => (list.entries?.length ?? 0) > 0 || (list.totalSize ?? 0) > 0));
    }
    getTrashedChildren(parentUid, pageSize = 50) {
        const query = `SELECT * FROM Document WHERE ecm:parentId = '${parentUid}' ` +
            `AND ecm:isTrashed = 1 ORDER BY dc:modified DESC`;
        const params = new HttpParams().set('query', query).set('pageSize', pageSize);
        return this.http.get(this.api.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'), { params, headers: { properties: 'dublincore' } });
    }
    restoreDocument(uid) {
        return this.api.post(`/nuxeo/api/v1/id/${uid}/@op/Document.Untrash`, {
            params: {},
            context: {},
        });
    }
    /**
     * Triggers an async CSV export via Nuxeo Bulk.RunAction.
     *
     * POST /@async returns 202 with Location header containing the execution ID:
     *   Location: .../Bulk.RunAction/@async/{executionId}/status
     */
    startCsvExport(parentUid) {
        const query = `SELECT * FROM Document WHERE ecm:parentId = '${parentUid}' ` +
            `AND ecm:mixinType != 'HiddenInNavigation' ` +
            `AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0`;
        return this.http
            .post(this.api.apiUrl('/nuxeo/api/v1/automation/Bulk.RunAction/@async'), {
            params: { action: 'csvExport', query },
            context: {},
        }, {
            headers: { 'Content-Type': 'application/json' },
            observe: 'response',
            responseType: 'text',
        })
            .pipe(map$1((resp) => {
            const location = resp.headers.get('Location') ?? '';
            const uuidMatch = location.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
            if (uuidMatch)
                return uuidMatch[1];
            const bodyMatch = (resp.body ?? '').match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
            if (bodyMatch)
                return bodyMatch[1];
            throw new Error('Could not extract execution ID from response');
        }));
    }
    /**
     * Polls /@async/{executionId}/status until done, then downloads the CSV.
     *
     * Native flow: GET /status → 202 (running) or 303 (done, redirects).
     * The 303 redirect goes cross-origin (proxy→Nuxeo), so the browser
     * drops the auth header causing a 401. We catch that 401 as the
     * "completed" signal, then fetch the result with a separate
     * authenticated request through the proxy.
     */
    pollAndDownloadCsv(executionId) {
        const statusUrl = this.api.apiUrl(`/nuxeo/site/api/v1/automation/Bulk.RunAction/@async/${executionId}/status`);
        const resultUrl = this.api.apiUrl(`/nuxeo/site/api/v1/automation/Bulk.RunAction/@async/${executionId}`);
        const fetchResult = () => this.http.get(resultUrl).pipe(switchMap$1((result) => {
            const blobPath = new URL(result.url).pathname;
            return this.http.get(this.api.apiUrl(blobPath), {
                responseType: 'blob',
            });
        }));
        const poll = () => this.http.get(statusUrl, { observe: 'response', responseType: 'text' }).pipe(switchMap$1((resp) => {
            if (resp.status === 200 && resp.body) {
                try {
                    const result = JSON.parse(resp.body);
                    const blobPath = new URL(result.url).pathname;
                    return this.http.get(this.api.apiUrl(blobPath), {
                        responseType: 'blob',
                    });
                }
                catch {
                    return of(new Blob([resp.body], { type: 'text/csv' }));
                }
            }
            return timer(1500).pipe(switchMap$1(() => poll()));
        }), catchError((err) => {
            if (err.status === 401 || err.status === 0) {
                return fetchResult();
            }
            return throwError(() => err);
        }));
        return timer(1000).pipe(switchMap$1(() => poll()));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: BrowseService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: BrowseService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: BrowseService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class CollectionService {
    api = inject(NuxeoApiBase);
    http = inject(HttpClient);
    getById(uid) {
        return this.api.get(`/nuxeo/api/v1/id/${uid}`, undefined, {
            properties: 'dublincore',
            'enrichers.document': 'permissions',
            'fetch-document': 'lock',
        });
    }
    getAll(pageSize = 100) {
        const query = `SELECT * FROM Collection WHERE ecm:isTrashed = 0 ` +
            `AND ecm:currentLifeCycleState != 'deleted' ORDER BY dc:modified DESC`;
        return this.api.nxqlSearch(query, pageSize);
    }
    getFavorites(userId, pageSize = 10) {
        const collectionQuery = FAVORITES_COLLECTION_QUERY.replace(/\{user\}/g, userId);
        return this.api.nxqlSearch(collectionQuery, 1).pipe(switchMap$1((res) => {
            const favCollection = res.entries[0];
            if (!favCollection) {
                return of({
                    entries: [],
                    totalSize: 0,
                    currentPageSize: 0,
                    currentPageIndex: 0,
                    numberOfPages: 0,
                });
            }
            return this.getCollectionMembers(favCollection.uid, pageSize);
        }));
    }
    /**
     * One page of a collection's members, in the order asked for. The page provider counts every
     * member, so `totalSize` is the collection's size on every page.
     */
    getCollectionMembers(collectionUid, pageSize = 50, page) {
        const params = withSort(new HttpParams()
            .set('queryParams', collectionUid)
            .set('pageSize', pageSize)
            .set('currentPageIndex', page?.currentPageIndex ?? 0), page?.sort);
        return this.api.get('/nuxeo/api/v1/search/pp/default_content_collection/execute', params, { properties: 'dublincore' });
    }
    updateProperties(uid, properties) {
        return this.api.put(`/nuxeo/api/v1/id/${uid}`, { 'entity-type': 'document', properties }, { 'Content-Type': 'application/json', properties: 'dublincore' });
    }
    /**
     * Triggers a bulk download of all member documents in a collection,
     * returned as a zip file. Uses the Nuxeo `Blob.BulkDownload` automation.
     */
    bulkDownload(collectionUid, filename = 'export.zip') {
        return this.http.post(this.api.apiUrl('/nuxeo/api/v1/automation/Blob.BulkDownload'), { params: { filename }, input: `docs:${collectionUid}` }, { responseType: 'blob' });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: CollectionService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: CollectionService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: CollectionService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/**
 * Tracks the Nuxeo path that drives the browse nav tree, matching Nuxeo Web UI:
 * folder/workspace navigation updates the path; opening a document keeps the tree
 * aligned to the containing folder (or the folder itself when folderish).
 */
class BrowseContextService {
    contextPath = signal('/', ...(ngDevMode ? [{ debugName: "contextPath" }] : []));
    /** Incremented when the browse nav tree should reload (e.g. after domain creation). */
    treeRefreshTick = signal(0, ...(ngDevMode ? [{ debugName: "treeRefreshTick" }] : []));
    /** Incremented when the browse main view should reload folder children (e.g. after domain creation). */
    contentRefreshTick = signal(0, ...(ngDevMode ? [{ debugName: "contentRefreshTick" }] : []));
    /** Incremented when clipboard copy/move completes so browse can merge API results immediately. */
    clipboardPasteTick = signal(0, ...(ngDevMode ? [{ debugName: "clipboardPasteTick" }] : []));
    pendingClipboardPaste = null;
    /** Ask the browse nav drawer to reload its folder tree on next open (or immediately if open). */
    requestTreeRefresh() {
        this.treeRefreshTick.update((tick) => tick + 1);
    }
    /** Ask the browse page to reload the current folder listing (e.g. after domain creation). */
    requestContentRefresh() {
        this.contentRefreshTick.update((tick) => tick + 1);
    }
    /** Record clipboard paste results and refresh browse (optimistic merge + delayed server reload). */
    notifyClipboardPasteComplete(event) {
        this.pendingClipboardPaste = event;
        this.clipboardPasteTick.update((tick) => tick + 1);
    }
    /** Returns the latest clipboard paste payload once per tick (browse consumer). */
    consumeClipboardPasteEvent() {
        const event = this.pendingClipboardPaste;
        this.pendingClipboardPaste = null;
        return event;
    }
    /** Reset browse navigation context (e.g. on sign-out / user switch). */
    resetContext() {
        this.contextPath.set('/');
        this.treeRefreshTick.set(0);
        this.contentRefreshTick.set(0);
        this.clipboardPasteTick.set(0);
        this.pendingClipboardPaste = null;
    }
    setFromRouterUrl(routerUrl) {
        this.setPath(parseBrowseNuxeoPathFromRouterUrl(routerUrl));
    }
    setFromDocument(doc) {
        this.setPath(browseTreeContextPath(doc));
    }
    setFromNuxeoPath(nuxeoPath) {
        this.setPath(nuxeoPath);
    }
    setPath(path) {
        const normalized = normalizeNuxeoPath(path);
        if (!nuxeoPathsEqualFlexible(this.contextPath(), normalized)) {
            this.contextPath.set(normalized);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: BrowseContextService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: BrowseContextService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: BrowseContextService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/**
 * Current browse folder used as the paste target for clipboard Copy/Move (Web UI: `target-document`).
 * Updated by {@link BrowseComponent} while the user is browsing.
 */
class ClipboardTargetService {
    target = signal(null, ...(ngDevMode ? [{ debugName: "target" }] : []));
    setTarget(doc) {
        this.target.set(doc);
    }
    clear() {
        this.target.set(null);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ClipboardTargetService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ClipboardTargetService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ClipboardTargetService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

// Lowercase Nuxeo primary types that represent containers/non-downloadable documents.
const NON_CONTENT_DOCUMENT_TYPES = new Set([
    'favorites',
    'domain',
    'workspace',
    'workspaceroot',
    'folder',
    'orderedfolder',
    'sectionroot',
    'section',
    'collection',
    'collections',
    'templateroot',
]);

/**
 * Nuxeo primary types that the HxAI connector's default `ingestMappings`
 * contribution can send to Content Lake (documents with a main `file:content`
 * blob). Mirrors the Confluence workflow "Ingest a local Nuxeo file document".
 */
const CONTENT_LAKE_INGEST_DOCUMENT_TYPES = new Set(['File', 'Picture', 'Video', 'Audio']);
/**
 * Machine-readable ingest marker stored on the Nuxeo document after a successful
 * Content Lake ingest. Prefer `dc:source` (rarely auto-filled) and fall back to
 * `dc:rights` for backward compatibility. A property is only written when it is
 * empty or already uses our prefix — PDF metadata often populates `dc:rights`.
 */
const CONTENT_LAKE_INGEST_MARKER_PROPERTY = 'dc:source';
const CONTENT_LAKE_INGEST_MARKER_LEGACY_PROPERTY = 'dc:rights';
const CONTENT_LAKE_INGEST_MARKER_PROPERTIES = [
    CONTENT_LAKE_INGEST_MARKER_PROPERTY,
    CONTENT_LAKE_INGEST_MARKER_LEGACY_PROPERTY,
];
const CONTENT_LAKE_INGEST_MARKER_PREFIX = 'agentic-ui:content-lake:';
function hasIngestibleMainBlob(doc) {
    const fileContent = doc.properties['file:content'];
    if (!fileContent || typeof fileContent !== 'object') {
        return false;
    }
    const name = fileContent['name'];
    const length = Number(fileContent['length'] ?? 0);
    const data = fileContent['data'];
    const blobUrl = fileContent['blobUrl'];
    return ((typeof name === 'string' && name.trim().length > 0) ||
        length > 0 ||
        (typeof data === 'string' && data.length > 0) ||
        (typeof blobUrl === 'string' && blobUrl.length > 0));
}
/** Whether a Nuxeo document can be bulk-ingested into Content Lake for KD. */
function supportsContentLakeIngest(doc) {
    if (!doc || doc.isTrashed) {
        return false;
    }
    const primaryType = doc.type?.trim();
    if (!primaryType || NON_CONTENT_DOCUMENT_TYPES.has(primaryType.toLowerCase())) {
        return false;
    }
    if (!CONTENT_LAKE_INGEST_DOCUMENT_TYPES.has(primaryType)) {
        return false;
    }
    return hasIngestibleMainBlob(doc);
}
function readBlobDigest(doc) {
    const fileContent = doc.properties['file:content'];
    const digest = fileContent?.['digest'];
    return typeof digest === 'string' && digest.trim().length > 0 ? digest.trim() : null;
}
function readMainBlobName(doc) {
    const fileContent = doc.properties['file:content'];
    const name = fileContent?.['name'];
    return typeof name === 'string' && name.trim().length > 0 ? name.trim() : null;
}
function readMainBlobLength(doc) {
    const fileContent = doc.properties['file:content'];
    return Number(fileContent?.['length'] ?? 0);
}
function buildContentLakeIngestMarker(blobDigest) {
    return `${CONTENT_LAKE_INGEST_MARKER_PREFIX}${blobDigest}`;
}
function readContentLakeIngestMarker(doc) {
    for (const property of CONTENT_LAKE_INGEST_MARKER_PROPERTIES) {
        const value = doc.properties[property];
        if (typeof value !== 'string' || !value.startsWith(CONTENT_LAKE_INGEST_MARKER_PREFIX)) {
            continue;
        }
        const digest = value.slice(CONTENT_LAKE_INGEST_MARKER_PREFIX.length).trim();
        if (digest.length > 0) {
            return digest;
        }
    }
    return null;
}
/** True when the document blob digest matches our last successful ingest marker. */
function isContentLakeIngestCurrent(doc) {
    if (!doc) {
        return false;
    }
    const digest = readBlobDigest(doc);
    const marker = readContentLakeIngestMarker(doc);
    return !!digest && digest === marker;
}
/** True when the document supports ingest and is not already up to date in Content Lake. */
function needsContentLakeIngest(doc) {
    return supportsContentLakeIngest(doc) && !isContentLakeIngestCurrent(doc);
}
/** True when the UI should ask Content Lake whether this blob is already indexed. */
function shouldProbeContentLakeIngestStatus(doc) {
    return needsContentLakeIngest(doc);
}
/** True when we should probe Content Lake and backfill the ingest marker on document open. */
function shouldBackfillContentLakeIngestMarker(doc) {
    return shouldProbeContentLakeIngestStatus(doc) && canWriteContentLakeIngestMarker(doc);
}
/**
 * Interpret the JSON payload returned by `HylandIngest.CheckDigest`. The
 * connector documents several possible shapes; we treat any explicit positive
 * signal as ingested and fail closed otherwise.
 */
function parseContentLakeIngestCheckResult(body) {
    const json = unwrapAutomationJsonPayload(body);
    if (!json || typeof json !== 'object') {
        return false;
    }
    const record = json;
    const responseCode = record['responseCode'];
    if (typeof responseCode === 'number' && (responseCode < 200 || responseCode >= 300)) {
        return false;
    }
    const nestedResponse = record['response'];
    if (nestedResponse !== undefined) {
        const fromResponse = parseContentLakeIngestCheckResult(nestedResponse);
        if (fromResponse) {
            return true;
        }
        if (nestedResponse && typeof nestedResponse === 'object') {
            const responseRecord = nestedResponse;
            if (responseRecord['exists'] === false || responseRecord['ingested'] === false) {
                return false;
            }
        }
    }
    const nestedResult = record['result'];
    if (nestedResult !== undefined && parseContentLakeIngestCheckResult(nestedResult)) {
        return true;
    }
    for (const key of [
        'ingested',
        'isIngested',
        'exists',
        'digestMatch',
        'digestMatches',
        'found',
        'match',
    ]) {
        if (record[key] === true) {
            return true;
        }
        if (record[key] === false) {
            return false;
        }
    }
    const status = String(record['status'] ?? record['state'] ?? '').toUpperCase();
    if (['INGESTED', 'INDEXED', 'PRESENT', 'FOUND', 'SUCCESS', 'UP_TO_DATE'].includes(status)) {
        return true;
    }
    if (['NOT_INGESTED', 'NOT_FOUND', 'MISSING', 'ABSENT'].includes(status)) {
        return false;
    }
    return false;
}
function unwrapAutomationJsonPayload(body) {
    if (body === null || body === undefined) {
        return null;
    }
    if (typeof body === 'string') {
        return parseJsonString(body);
    }
    if (typeof body !== 'object') {
        return null;
    }
    const record = body;
    const nested = record['value'];
    if (nested !== undefined) {
        const fromValue = unwrapAutomationJsonPayload(nested);
        if (fromValue !== null) {
            return fromValue;
        }
    }
    if (record['entity-type'] === 'blob') {
        const data = record['data'];
        if (typeof data === 'string' && data.length > 0) {
            try {
                const decoded = atob(data);
                return parseJsonString(decoded);
            }
            catch {
                return null;
            }
        }
    }
    return record;
}
function parseJsonString(value) {
    const trimmed = value.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
        return null;
    }
    try {
        return JSON.parse(trimmed);
    }
    catch {
        return null;
    }
}
function isIngestMarkerPropertyWritable(value) {
    return (value === null ||
        value === undefined ||
        value === '' ||
        (typeof value === 'string' && value.startsWith(CONTENT_LAKE_INGEST_MARKER_PREFIX)));
}
/** First Dublin Core field that can store our ingest marker without clobbering user data. */
function resolveIngestMarkerWriteProperty(doc) {
    for (const property of CONTENT_LAKE_INGEST_MARKER_PROPERTIES) {
        if (isIngestMarkerPropertyWritable(doc.properties[property])) {
            return property;
        }
    }
    return null;
}
function canWriteContentLakeIngestMarker(doc) {
    return resolveIngestMarkerWriteProperty(doc) !== null;
}
function escapeNxqlStringLiteral(value) {
    return value.replace(/'/g, "''");
}
/** NXQL to find ingestible documents anywhere in the repository with matching blob name and size. */
function buildContentLakeDuplicateSearchQuery(files) {
    const ingestTypes = [...CONTENT_LAKE_INGEST_DOCUMENT_TYPES].map((type) => `'${type}'`).join(', ');
    const fileClauses = files.map((file) => `(file:content/name = '${escapeNxqlStringLiteral(file.name)}' AND file:content/length = ${file.size})`);
    return [
        'SELECT * FROM Document',
        'WHERE ecm:isVersion = 0',
        'AND ecm:isTrashed = 0',
        `AND ecm:primaryType IN (${ingestTypes})`,
        `AND (${fileClauses.join(' OR ')})`,
    ].join(' ');
}
/** Repository documents whose main blob matches the selected file name and byte length. */
function findRepositoryBlobMatches(file, documents) {
    return documents.filter((doc) => readMainBlobName(doc) === file.name && readMainBlobLength(doc) === file.size);
}
/** Match selected files to repository documents with the same blob name and size. */
function findContentLakeDuplicateCandidates(files, repositoryMatches) {
    const candidates = [];
    for (const file of files) {
        const existing = findRepositoryBlobMatches(file, repositoryMatches)[0];
        if (!existing) {
            continue;
        }
        candidates.push({
            fileName: file.name,
            existingUid: existing.uid,
            existingTitle: existing.title,
            existingPath: existing.path,
            markedIngested: isContentLakeIngestCurrent(existing),
        });
    }
    return candidates;
}
/** Match selected files to folder children that are already ingested (local marker only). */
function findContentLakeDuplicates(files, folderChildren) {
    return findContentLakeDuplicateCandidates(files, folderChildren)
        .filter((candidate) => candidate.markedIngested)
        .map(({ markedIngested: _markedIngested, ...duplicate }) => duplicate);
}

const TERMINAL_BULK_STATES = new Set(['COMPLETED', 'ABORTED', 'COMPLETED_WITH_ERROR']);
const CONTENT_LAKE_INGEST_POLL_MAX_ATTEMPTS = 60;
/**
 * Triggers HxAI Content Lake ingestion for Nuxeo documents via the
 * `nuxeo-hxai-connector` bulk `ingest` action. The Angular app never calls
 * Content Lake directly — files must exist in Nuxeo first.
 */
class ContentLakeIngestService {
    api = inject(NuxeoApiBase);
    browseService = inject(BrowseService);
    // Its error messages reach the screen through `err.message` in two components, and the stalled
    // one is composed from status fields only this service holds, so they are resolved here.
    translate = inject(TranslateService);
    startIngest(documentUids) {
        if (documentUids.length === 0) {
            return throwError(() => new Error('At least one document id is required to ingest.'));
        }
        const query = this.buildIngestQuery(documentUids);
        return this.api
            .post('/nuxeo/api/v1/automation/Bulk.RunAction', {
            params: { action: 'ingest', query },
            context: {},
        })
            .pipe(map$1((body) => {
            this.throwIfAutomationException(body);
            const commandId = this.readCommandId(body);
            if (!commandId) {
                throw new Error(this.translate.instant('shared.content-lake.no-command-id'));
            }
            return { commandId };
        }));
    }
    getStatus(commandId) {
        return this.api
            .get(`/nuxeo/api/v1/bulk/${encodeURIComponent(commandId)}`)
            .pipe(map$1((body) => this.normalizeStatus(commandId, body)));
    }
    waitUntilComplete(commandId, pollIntervalMs = 2000, maxPollAttempts = CONTENT_LAKE_INGEST_POLL_MAX_ATTEMPTS) {
        const poll = (attempt) => this.getStatus(commandId).pipe(switchMap$1((status) => {
            if (this.isTerminal(status)) {
                return of(status);
            }
            if (attempt >= maxPollAttempts) {
                return throwError(() => new Error(this.buildStalledIngestMessage(status)));
            }
            return timer(pollIntervalMs).pipe(switchMap$1(() => poll(attempt + 1)));
        }));
        return poll(0);
    }
    /**
     * Find repository documents that match selected files (name + blob size) and are
     * already in Content Lake — via local ingest marker or `HylandIngest.CheckDigest`.
     */
    findDuplicates(files, sourceIds) {
        if (files.length === 0) {
            return of([]);
        }
        const query = buildContentLakeDuplicateSearchQuery(files);
        const pageSize = Math.min(500, Math.max(files.length * 5, files.length));
        return this.api.nxqlSearch(query, pageSize, { properties: '*' }).pipe(catchError$1(() => of({
            entries: [],
            totalSize: 0,
            currentPageSize: 0,
            currentPageIndex: 0,
            numberOfPages: 0,
        })), switchMap$1((list) => forkJoin(files.map((file) => this.resolveDuplicateForFile(file, list.entries ?? [], sourceIds))).pipe(map$1((results) => results.filter((result) => result !== null)))));
    }
    resolveDuplicateForFile(file, documents, sourceIds) {
        const matches = [...findRepositoryBlobMatches(file, documents)].sort((left, right) => {
            const leftMarked = isContentLakeIngestCurrent(left) ? 1 : 0;
            const rightMarked = isContentLakeIngestCurrent(right) ? 1 : 0;
            return rightMarked - leftMarked;
        });
        return this.probeFirstContentLakeMatch(matches, sourceIds).pipe(map$1((doc) => doc
            ? {
                fileName: file.name,
                existingUid: doc.uid,
                existingTitle: doc.title,
                existingPath: doc.path,
            }
            : null));
    }
    probeFirstContentLakeMatch(documents, sourceIds, index = 0) {
        if (index >= documents.length) {
            return of(null);
        }
        const doc = documents[index];
        if (isContentLakeIngestCurrent(doc)) {
            return of(doc);
        }
        return this.checkIngested(doc.uid, sourceIds).pipe(switchMap$1((ingested) => ingested ? of(doc) : this.probeFirstContentLakeMatch(documents, sourceIds, index + 1)));
    }
    /**
     * Ask the CIC ingest connector whether the document blob is already present
     * in Content Lake. Tries each `sourceId` in order, then falls back to the
     * server default (`nuxeo.hyland.cic.ingest.default.sourceId`) when set.
     */
    checkIngested(documentUid, sourceIds) {
        const uniqueSourceIds = [
            ...new Set((sourceIds ?? []).map((id) => id.trim()).filter((id) => id.length > 0)),
        ];
        // HylandIngest.CheckDigest requires a sourceId param — omitting it returns HTTP 500.
        // When KD agents expose no ids, pass "" so Nuxeo can apply
        // nuxeo.hyland.cic.ingest.default.sourceId.
        const candidates = uniqueSourceIds.length > 0 ? uniqueSourceIds : [''];
        const tryAt = (index) => {
            if (index >= candidates.length) {
                return of(false);
            }
            return this.checkIngestedOnce(documentUid, candidates[index]).pipe(switchMap$1((ingested) => (ingested ? of(true) : tryAt(index + 1))), catchError$1(() => tryAt(index + 1)));
        };
        return tryAt(0);
    }
    /**
     * On document open, probe Content Lake via `HylandIngest.CheckDigest` and
     * backfill the local ingest marker when the blob is already indexed.
     */
    backfillIngestMarkerIfNeeded(doc, sourceIds) {
        if (!shouldProbeContentLakeIngestStatus(doc)) {
            return of({
                doc: null,
                presentInContentLake: isContentLakeIngestCurrent(doc),
            });
        }
        return this.checkIngested(doc.uid, sourceIds).pipe(switchMap$1((ingested) => {
            if (!ingested) {
                return of({ doc: null, presentInContentLake: false });
            }
            if (!resolveIngestMarkerWriteProperty(doc)) {
                return of({ doc: null, presentInContentLake: true });
            }
            return this.markIngested([doc.uid]).pipe(map$1((docs) => ({
                doc: docs[0] ?? null,
                presentInContentLake: true,
            })));
        }), catchError$1(() => of({ doc: null, presentInContentLake: false })));
    }
    checkIngestedOnce(documentUid, sourceId) {
        const params = {
            xpath: 'file:content',
            sourceId,
        };
        return this.api
            .post('/nuxeo/api/v1/automation/HylandIngest.CheckDigest', {
            params,
            context: {},
            input: documentUid,
        })
            .pipe(map$1((body) => parseContentLakeIngestCheckResult(body)));
    }
    /** Persist an ingest marker on each document so the UI can skip duplicate ingests. */
    markIngested(documentUids) {
        if (documentUids.length === 0) {
            return of([]);
        }
        return forkJoin(documentUids.map((uid) => this.markSingleDocumentIngested(uid))).pipe(map$1((docs) => docs.filter((doc) => doc !== null)));
    }
    markSingleDocumentIngested(uid) {
        return this.api
            .get(`/nuxeo/api/v1/id/${uid}`, undefined, { properties: '*' })
            .pipe(switchMap$1((doc) => {
            const digest = readBlobDigest(doc);
            const writeProperty = resolveIngestMarkerWriteProperty(doc);
            if (!digest || !writeProperty) {
                return of(null);
            }
            return this.browseService.updateDocument(uid, {
                [writeProperty]: buildContentLakeIngestMarker(digest),
            });
        }));
    }
    buildIngestQuery(documentUids) {
        const escaped = documentUids.map((uid) => `'${uid.replace(/'/g, "''")}'`);
        if (escaped.length === 1) {
            return `SELECT * FROM Document WHERE ecm:uuid = ${escaped[0]}`;
        }
        return `SELECT * FROM Document WHERE ecm:uuid IN (${escaped.join(', ')})`;
    }
    throwIfAutomationException(body) {
        if (!body || typeof body !== 'object') {
            return;
        }
        const record = body;
        if (record['entity-type'] !== 'exception') {
            return;
        }
        const message = typeof record['message'] === 'string' && record['message'].trim().length > 0
            ? record['message'].trim()
            : this.translate.instant('shared.content-lake.bulk-ingest-failed');
        throw new Error(message);
    }
    readCommandId(body) {
        if (typeof body === 'string' && body.trim().length > 0) {
            return body.trim();
        }
        if (!body || typeof body !== 'object') {
            return null;
        }
        const record = body;
        const nested = record['value'];
        if (nested && typeof nested === 'object') {
            const fromNested = this.readCommandIdFromRecord(nested);
            if (fromNested) {
                return fromNested;
            }
        }
        return this.readCommandIdFromRecord(record);
    }
    readCommandIdFromRecord(record) {
        const candidates = [record['commandId'], record['id'], record['command-id']];
        for (const candidate of candidates) {
            if (typeof candidate === 'string' && candidate.trim().length > 0) {
                return candidate.trim();
            }
        }
        return null;
    }
    normalizeStatus(commandId, body) {
        const state = String(body['state'] ?? body['status'] ?? 'UNKNOWN').toUpperCase();
        const total = this.readOptionalNumber(body['total']);
        return {
            commandId,
            state,
            processed: this.readNumber(body['processed']),
            ...(total === undefined ? {} : { total }),
            error: body['error'] === true,
            errorCount: this.readNumber(body['errorCount'] ?? body['error-count']),
        };
    }
    buildStalledIngestMessage(status) {
        const params = {
            commandId: status.commandId,
            state: status.state,
            processed: status.processed,
            total: status.total,
        };
        return this.translate.instant(status.total === undefined
            ? 'shared.content-lake.ingest-stalled-unknown-total'
            : 'shared.content-lake.ingest-stalled', params);
    }
    readNumber(value) {
        return typeof value === 'number' && Number.isFinite(value) ? value : 0;
    }
    readOptionalNumber(value) {
        return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
    }
    isTerminal(status) {
        return TERMINAL_BULK_STATES.has(status.state.toUpperCase());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ContentLakeIngestService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ContentLakeIngestService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ContentLakeIngestService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/** Catalogue key for the hint shown under the notify checkbox in permission dialogs. */
const PERMISSION_NOTIFICATION_MAIL_HINT_KEY = 'permissions.notification.mail-hint';
/** Nuxeo surfaces SMTP failures with "sending a mail" in the automation error message. */
function isMailSendError(err) {
    const raw = err?.error?.message ??
        err?.message ??
        '';
    return raw.toLowerCase().includes('sending a mail');
}
function mailSendFailureKey(context) {
    return context === 'add'
        ? 'permissions.notification.mail-send-failed-add'
        : context === 'update'
            ? 'permissions.notification.mail-send-failed-update'
            : 'permissions.notification.mail-send-failed-send';
}
function mailSendFailureMessage(context, translate) {
    return translate(mailSendFailureKey(context));
}
function permissionCreateMailFailureMessage(translate) {
    return translate('permissions.notification.create-mail-failed');
}
function permissionUpdateMailFailureMessage(translate) {
    return translate('permissions.notification.update-mail-failed');
}
/** Permission saved but local ACE id could not be resolved for a follow-up notification send. */
function permissionNotificationAceNotFoundKey(context) {
    return context === 'add'
        ? 'permissions.notification.ace-not-found-add'
        : 'permissions.notification.ace-not-found-update';
}
function permissionNotificationAceNotFoundMessage(context, translate) {
    return translate(permissionNotificationAceNotFoundKey(context));
}
/** Locates a granted local ACE for a user or group principal after AddPermission. */
function findLocalAceForPrincipal(doc, principalId) {
    const localAcl = doc.contextParameters?.['acls']?.find((acl) => acl.name === 'local');
    if (!localAcl?.aces?.length) {
        return undefined;
    }
    const matches = localAcl.aces.filter((ace) => ace.granted && ace.username === principalId);
    if (!matches.length) {
        return undefined;
    }
    return matches[matches.length - 1];
}

/** Nuxeo may return a plain string or an enriched user/group entity when fetch-acls is set. */
function resolveAcePrincipal(value) {
    if (typeof value === 'string')
        return value;
    if (!value || typeof value !== 'object')
        return '';
    const entity = value;
    return (entity.properties?.username ??
        entity.properties?.groupname ??
        entity.groupname ??
        entity.id ??
        entity.name ??
        entity.grouplabel ??
        '');
}
/**
 * The display name of an extended ACE principal (`fetch-acls: extended`): a user's first and last
 * name, or a group's label. Empty when the server sent only the id, or no name beyond it.
 */
function resolveAcePrincipalLabel(value) {
    if (!value || typeof value !== 'object')
        return '';
    const entity = value;
    const text = (v) => (typeof v === 'string' ? v.trim() : '');
    const person = [text(entity.properties?.firstName), text(entity.properties?.lastName)]
        .filter(Boolean)
        .join(' ');
    return person || text(entity.grouplabel) || text(entity.properties?.grouplabel);
}
/**
 * Prefer a non-empty enricher value from `updated`; fall back to `existing`.
 * Empty arrays are treated as absent so a PUT without enrichers (or with
 * `permissions: []`) does not wipe known permissions — including masking a
 * genuine server-side revocation until the next full fetch.
 */
function preferEnricherValue(updated, existing) {
    if (Array.isArray(updated)) {
        return updated.length > 0 ? updated : existing;
    }
    return updated ?? existing;
}
function mergeEnricherValue(updated, existing, treatEmptyAsAbsent) {
    if (treatEmptyAsAbsent) {
        return preferEnricherValue(updated, existing);
    }
    return updated !== undefined ? updated : existing;
}
/**
 * Merges context enrichers from a permissions fetch or document update into an existing document.
 * Spreads enrichers from `updated`, then overlays `acls` and `permissions`.
 */
function mergeDocumentPermissionsContext(existing, updated, options) {
    const treatEmptyAsAbsent = options?.treatEmptyEnricherAsAbsent ?? false;
    const normalized = normalizeDocumentAcls(updated);
    return {
        ...existing,
        contextParameters: {
            ...existing.contextParameters,
            ...normalized.contextParameters,
            acls: mergeEnricherValue(normalized.contextParameters?.['acls'], existing.contextParameters?.['acls'], treatEmptyAsAbsent),
            permissions: mergeEnricherValue(normalized.contextParameters?.['permissions'], existing.contextParameters?.['permissions'], treatEmptyAsAbsent),
        },
    };
}
/** Normalizes ACL username/creator fields to strings for UI and automation calls. */
function normalizeDocumentAcls(doc) {
    const acls = doc.contextParameters?.['acls'];
    if (!acls?.length)
        return doc;
    const normalizedAcls = acls.map((acl) => ({
        ...acl,
        aces: acl.aces.map((ace) => {
            const label = resolveAcePrincipalLabel(ace.username);
            return {
                ...ace,
                username: resolveAcePrincipal(ace.username),
                ...(label ? { usernameLabel: label } : {}),
                creator: ace.creator ? resolveAcePrincipal(ace.creator) : null,
            };
        }),
    }));
    return {
        ...doc,
        contextParameters: {
            ...doc.contextParameters,
            acls: normalizedAcls,
        },
    };
}

class DocumentDetailService {
    api = inject(NuxeoApiBase);
    http = inject(HttpClient);
    currentUsername = inject(CURRENT_USERNAME);
    getFullDocument(uid) {
        return this.api.get(`/nuxeo/api/v1/id/${uid}`, undefined, {
            properties: '*',
            'enrichers.document': 'acls,permissions,renditions,favorites,subscribedNotifications,collections,preview,thumbnail',
            // Nuxeo omits `lockOwner` / `lockCreated` unless asked, so a locked document reads as unlocked.
            'fetch-document': 'lock',
        });
    }
    getDocumentPermissions(uid) {
        return this.api
            .get(`/nuxeo/api/v1/id/${uid}`, undefined, {
            properties: '*',
            'enrichers.document': 'acls,permissions,userVisiblePermissions',
            'fetch-acls': 'username,creator,extended',
            depth: 'children',
            time: String(Date.now()),
        })
            .pipe(map$1((doc) => normalizeDocumentAcls(doc)));
    }
    /** Main binary on file:content (Nuxeo Web UI pattern); falls back to blobholder:0. */
    fetchBlob(uid, options) {
        const clientReason = options?.clientReason ?? 'view';
        const params = new HttpParams().set(BLOB_CLIENT_REASON_PARAM, clientReason);
        const fileContentUrl = this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@blob/file:content`);
        const blobHolderUrl = this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@blob/blobholder:0`);
        const blobOptions = { responseType: 'blob', params };
        return this.http
            .get(fileContentUrl, blobOptions)
            .pipe(catchError$1(() => this.http.get(blobHolderUrl, blobOptions)));
    }
    fetchBlobByXpath(uid, xpath, options) {
        const clientReason = options?.clientReason ?? 'view';
        const params = new HttpParams().set(BLOB_CLIENT_REASON_PARAM, clientReason);
        return this.http.get(this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@blob/${xpath}`), {
            responseType: 'blob',
            params,
        });
    }
    fetchPdfRendition(uid) {
        return this.http.get(this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@rendition/pdf`), {
            responseType: 'blob',
        });
    }
    fetchThumbnail(uid) {
        return this.http.get(this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@rendition/thumbnail`), {
            responseType: 'blob',
        });
    }
    /**
     * A document's audit entries, one page. `query` filters and sorts on the server, so a filter
     * reaches every entry rather than only the page on screen. Dates go as instants: the adapter
     * reads a bare day as midnight in the server's zone, not the user's.
     */
    getAuditLog(uid, pageSize = 50, currentPageIndex = 0, query = {}) {
        let params = new HttpParams()
            .set('pageSize', pageSize)
            .set('currentPageIndex', currentPageIndex);
        const principal = query.principalName?.trim();
        if (principal)
            params = params.set('principalName', principal);
        for (const eventId of query.eventIds ?? [])
            params = params.append('eventId', eventId);
        if (query.eventCategory)
            params = params.set('eventCategory', query.eventCategory);
        if (query.startDate)
            params = params.set('startEventDate', query.startDate.toISOString());
        if (query.endDate)
            params = params.set('endEventDate', query.endDate.toISOString());
        if (query.sortBy) {
            params = params.set('sortBy', query.sortBy).set('sortOrder', query.sortOrder ?? 'desc');
        }
        return this.http.get(this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@audit`), {
            params,
        });
    }
    getPublishedVersions(uid) {
        const query = `SELECT * FROM Document WHERE ecm:isProxy = 1 AND ecm:isTrashed = 0 ` +
            `AND (rend:sourceVersionableId = "${uid}" ` +
            `OR ecm:proxyVersionableId = "${uid}")`;
        const params = new HttpParams()
            .set('queryParams', query)
            .set('pageSize', '40')
            .set('sortBy', 'dc:modified,uid:major_version,uid:minor_version')
            .set('sortOrder', 'desc,desc,desc');
        return this.http.get(this.api.apiUrl('/nuxeo/api/v1/search/pp/nxql_search/execute'), {
            params,
            headers: {
                properties: 'dublincore,common,uid,rendition',
                'enrichers.document': 'permissions',
            },
        });
    }
    getSectionTree() {
        const query = `SELECT * FROM Document WHERE ecm:primaryType IN ('SectionRoot', 'Section') ` +
            `AND ecm:isTrashed = 0 ORDER BY dc:title`;
        const params = new HttpParams().set('query', query).set('pageSize', '200');
        return this.http.get(this.api.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'), { params, headers: { properties: 'dublincore' } });
    }
    publishDocument(uid, targetSectionId, options) {
        const params = { target: targetSectionId };
        if (options?.override)
            params['override'] = 'true';
        if (options?.renditionName)
            params['renditionName'] = options.renditionName;
        if (options?.defaultRendition)
            params['defaultRendition'] = true;
        return this.api.post(`/nuxeo/api/v1/id/${uid}/@op/Document.PublishToSection`, {
            params,
            context: {},
        });
    }
    unpublishDocument(proxyUid) {
        return this.http.delete(this.api.apiUrl(`/nuxeo/api/v1/id/${proxyUid}`));
    }
    republishDocument(sourceUid, targetSectionId) {
        return this.api.post(`/nuxeo/api/v1/id/${sourceUid}/@op/Document.PublishToSection`, { params: { target: targetSectionId, override: 'true' }, context: {} });
    }
    lockDocument(uid) {
        return this.api.post(`/nuxeo/api/v1/id/${uid}/@op/Document.Lock`, { params: {}, context: {} }, { 'fetch-document': 'lock' });
    }
    unlockDocument(uid) {
        return this.api.post(`/nuxeo/api/v1/id/${uid}/@op/Document.Unlock`, { params: {}, context: {} }, { 'fetch-document': 'lock' });
    }
    addToFavorites(uid) {
        return this.api.post('/nuxeo/api/v1/automation/Document.AddToFavorites', {
            params: {},
            context: {},
            input: uid,
        });
    }
    removeFromFavorites(uid) {
        return this.api.post('/nuxeo/api/v1/automation/Document.RemoveFromFavorites', {
            params: {},
            context: {},
            input: uid,
        });
    }
    trashDocument(uid) {
        const input = uid.startsWith('doc:') ? uid : `doc:${uid}`;
        return this.api.post('/nuxeo/api/v1/automation/Document.Trash', {
            params: {},
            context: {},
            input,
        });
    }
    trashDocuments(uids) {
        if (uids.length === 0)
            return of([]);
        return forkJoin(uids.map((uid) => this.trashDocument(uid).pipe(catchError$1(() => of(null))))).pipe(map$1((results) => results.filter((r) => r !== null)));
    }
    restoreFromTrash(uid) {
        return this.api.post(`/nuxeo/api/v1/id/${uid}/@op/Document.Untrash`, {
            params: {},
            context: {},
        });
    }
    permanentlyDelete(uid) {
        return this.api.delete(`/nuxeo/api/v1/id/${uid}`);
    }
    subscribe(uid, notifications = 'Creation,Modification') {
        return this.api.post(`/nuxeo/api/v1/id/${uid}/@op/Document.Subscribe`, {
            params: { notifications },
            context: {},
        });
    }
    unsubscribe(uid, notifications = 'Creation,Modification') {
        return this.api.post(`/nuxeo/api/v1/id/${uid}/@op/Document.Unsubscribe`, {
            params: { notifications },
            context: {},
        });
    }
    addToCollection(uid, collectionId) {
        return this.api.post(`/nuxeo/api/v1/id/${uid}/@op/Document.AddToCollection`, {
            params: { collection: collectionId },
            context: {},
        });
    }
    getCollections() {
        const query = `SELECT * FROM Collection WHERE ecm:isTrashed = 0 ` +
            `AND ecm:currentLifeCycleState != 'deleted' ORDER BY dc:title`;
        const params = new HttpParams().set('query', query).set('pageSize', '100');
        return this.http.get(this.api.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'), { params, headers: { properties: 'dublincore' } });
    }
    exportBlob(uid) {
        return this.http.get(this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@blob/blobholder:0`), {
            responseType: 'blob',
        });
    }
    exportZip(uid, filename = 'export.zip') {
        return this.http.post(this.api.apiUrl('/nuxeo/api/v1/automation/Blob.BulkDownload'), { params: { filename }, input: `docs:${uid}` }, { responseType: 'blob' });
    }
    bulkDownload(uids, filename = 'export.zip') {
        const input = `docs:${uids.join(',')}`;
        return this.http.post(this.api.apiUrl('/nuxeo/api/v1/automation/Blob.BulkDownload'), { params: { filename }, input }, { responseType: 'blob' });
    }
    exportXml(uid) {
        return this.http.get(this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@export?adapter=export`), {
            responseType: 'blob',
        });
    }
    getAvailableWorkflows(uid) {
        return this.api.get(`/nuxeo/api/v1/id/${uid}/@workflow`);
    }
    /**
     * Returns only the workflows that can actually be started on this document,
     * respecting lifecycle-state filters (e.g. approved docs hide Serial/Parallel review).
     */
    getRunnableWorkflows(uid) {
        return this.api
            .get(`/nuxeo/api/v1/id/${uid}`, undefined, {
            'enrichers.document': 'runnableWorkflows',
        })
            .pipe(map$1((doc) => {
            const entries = (doc.contextParameters?.['runnableWorkflows'] ?? []);
            return entries.map((e) => ({
                'entity-type': 'workflowModel',
                name: e.workflowModelName ?? e.name,
                title: e.title,
            }));
        }));
    }
    createCollection(title, description = '') {
        return this.api.post('/nuxeo/api/v1/automation/Collection.Create', {
            params: { name: title, description },
            context: {},
        });
    }
    searchUsersGroups(searchTerm) {
        return this.api.post('/nuxeo/api/v1/automation/UserGroup.Suggestion', {
            params: { searchTerm, searchType: 'USER_GROUP_TYPE' },
            context: {},
        }, { 'Content-Type': 'application/json' });
    }
    addACE(uid, params) {
        return this.api.post(`/nuxeo/api/v1/id/${uid}/@op/Document.AddACE`, { params, context: {} }, { 'Content-Type': 'application/json' });
    }
    /**
     * Drops a whole named ACL, `local` by default.
     *
     * Nuxeo has no "replace this ACL" operation, so a caller holding a complete desired ACL clears
     * and replays it. That is destructive between the two calls: an ACL cleared by a request whose
     * replay then fails leaves the document relying on inheritance alone. Nuxeo still enforces
     * `WriteSecurity` on both calls, so this cannot grant the caller anything they did not have.
     */
    removeAcl(uid, acl = 'local') {
        return this.api.post(`/nuxeo/api/v1/id/${uid}/@op/Document.RemoveACL`, { params: { acl }, context: {} }, { 'Content-Type': 'application/json' });
    }
    blockPermissionInheritance(uid) {
        return this.api.post(`/nuxeo/api/v1/id/${uid}/@op/Document.BlockPermissionInheritance`, { params: {}, context: {} }, { 'Content-Type': 'application/json' });
    }
    unblockPermissionInheritance(uid) {
        return this.api.post(`/nuxeo/api/v1/id/${uid}/@op/Document.UnblockPermissionInheritance`, { params: {}, context: {} }, { 'Content-Type': 'application/json' });
    }
    replaceACE(uid, params) {
        return this.api.post(`/nuxeo/api/v1/id/${uid}/@op/Document.SetACE`, { params: { ...params, overwrite: params.overwrite ?? true }, context: {} }, { 'Content-Type': 'application/json' });
    }
    replacePermission(uid, params) {
        return this.api.post('/nuxeo/api/v1/automation/Document.ReplacePermission', {
            params: {
                users: [],
                ...params,
            },
            context: {},
            input: uid,
        }, { 'Content-Type': 'application/json' });
    }
    addPermission(uid, params) {
        return this.api.post('/nuxeo/api/v1/automation/Document.AddPermission', {
            params: {
                ...(params.username ? { username: params.username } : {}),
                ...(params.email ? { email: params.email } : {}),
                permission: params.permission,
                begin: params.begin ?? null,
                end: params.end ?? null,
                notify: params.notify ?? false,
                comment: params.comment ?? '',
                ...this.creatorParam(params.creator),
            },
            context: {},
            input: uid,
        }, { 'Content-Type': 'application/json' });
    }
    addExternalPermission(uid, params) {
        return this.addPermission(uid, {
            email: params.email,
            permission: params.permission,
            begin: params.begin,
            end: params.end ?? null,
            comment: params.comment ?? '',
            notify: params.notify ?? false,
            creator: params.creator,
        });
    }
    /**
     * Adds a permission, then sends the notification in a separate call so SMTP
     * failures surface to the UI instead of being swallowed by Document.AddPermission.
     */
    addPermissionWithNotification(uid, params) {
        const notify = params.notify === true;
        return this.addPermission(uid, {
            username: params.username,
            permission: params.permission,
            begin: params.begin,
            end: params.end,
            comment: params.comment ?? '',
            notify: false,
            creator: params.creator,
        }).pipe(switchMap((document) => notify
            ? this.notifyAfterPermissionChange(uid, document, params.username, 'add')
            : of({ document, notificationSent: false })));
    }
    /**
     * Replaces a permission, then optionally sends the notification email separately.
     */
    replacePermissionWithNotification(uid, params) {
        const notify = params.notify === true;
        return this.replacePermission(uid, {
            id: params.id,
            username: params.username,
            permission: params.permission,
            begin: params.begin,
            end: params.end,
            comment: params.comment,
            notify: false,
        }).pipe(switchMap((document) => notify
            ? this.notifyAfterPermissionChange(uid, document, params.username, 'update')
            : of({ document, notificationSent: false })));
    }
    /** Adds an external (email) permission with optional separate notification send. */
    addExternalPermissionWithNotification(uid, params) {
        const notify = params.notify !== false;
        const principalId = `transient/${params.email.trim()}`;
        return this.addPermission(uid, {
            email: params.email.trim(),
            permission: params.permission,
            begin: params.begin,
            end: params.end ?? null,
            comment: params.comment ?? '',
            notify: false,
            creator: params.creator,
        }).pipe(switchMap((document) => notify
            ? this.notifyAfterPermissionChange(uid, document, principalId, 'add')
            : of({ document, notificationSent: false })));
    }
    /** Nuxeo stores this on the ACE as the "Granted by" audit field. */
    creatorParam(override) {
        const creator = override?.trim() || this.currentUsername()?.trim();
        return creator ? { creator } : {};
    }
    sendNotificationEmailForPermission(uid, aceId) {
        return this.api.post('/nuxeo/api/v1/automation/Document.SendNotificationEmailForPermission', { params: { id: aceId }, context: {}, input: uid }, { 'Content-Type': 'application/json' });
    }
    notifyAfterPermissionChange(uid, document, principalId, context) {
        const ace = findLocalAceForPrincipal(document, principalId);
        if (ace?.id) {
            return this.sendPermissionNotificationResult(uid, ace.id, document, context);
        }
        return this.getDocumentPermissions(uid).pipe(catchError$1(() => of(null)), switchMap((permDoc) => {
            if (!permDoc) {
                return of({
                    document,
                    notificationSent: false,
                    notificationErrorKey: permissionNotificationAceNotFoundKey(context),
                });
            }
            const resolvedAce = findLocalAceForPrincipal(permDoc, principalId);
            if (!resolvedAce?.id) {
                return of({
                    document,
                    notificationSent: false,
                    notificationErrorKey: permissionNotificationAceNotFoundKey(context),
                });
            }
            return this.sendPermissionNotificationResult(uid, resolvedAce.id, document, context);
        }));
    }
    sendPermissionNotificationResult(uid, aceId, document, context) {
        return this.sendNotificationEmailForPermission(uid, aceId).pipe(map$1((updated) => ({ document: updated, notificationSent: true })), catchError$1((err) => {
            if (isMailSendError(err)) {
                return of({
                    document,
                    notificationSent: false,
                    notificationErrorKey: mailSendFailureKey(context),
                });
            }
            return throwError(() => err);
        }));
    }
    /**
     * Removes **every** ACE `user` holds in `acl`, whatever `permission` says.
     *
     * `Document.RemovePermission` reads `user` as "all permissions for this user" and has no
     * `permission` parameter, so a principal holding `Read` and `WriteVersion` loses both when
     * either row is deleted. To remove one entry, use {@link removePermissionById}.
     */
    removePermission(uid, params) {
        return this.api.post(`/nuxeo/api/v1/id/${uid}/@op/Document.RemovePermission`, { params: { ...params, acl: params.acl ?? 'local' }, context: {} }, { 'Content-Type': 'application/json' });
    }
    /**
     * Removes exactly one ACE, addressed by its Nuxeo id (`user:permission:granted:creator:begin:end`).
     *
     * Nuxeo answers 200 and changes nothing when no ACE has that id, so a caller that must know the
     * entry is gone re-reads the ACL afterwards.
     */
    removePermissionById(uid, aceId, acl = 'local') {
        return this.api.post(`/nuxeo/api/v1/id/${uid}/@op/Document.RemovePermission`, { params: { id: aceId, acl }, context: {} }, { 'Content-Type': 'application/json' });
    }
    // ── Attachments ──
    uploadAttachment(uid, file) {
        const params = JSON.stringify({
            params: { document: uid, save: 'true', xpath: 'files:files' },
        });
        const formData = new FormData();
        formData.append('request', new Blob([params], { type: 'application/json' }));
        formData.append('file', file);
        return this.http.post(this.api.apiUrl('/nuxeo/api/v1/automation/Blob.AttachOnDocument'), formData, { responseType: 'blob' });
    }
    removeAttachment(uid, index) {
        return this.getFullDocument(uid).pipe(switchMap((doc) => {
            const files = doc.properties['files:files'] ?? [];
            const updated = files.filter((_, i) => i !== index);
            return this.http.put(this.api.apiUrl(`/nuxeo/api/v1/id/${uid}`), { 'entity-type': 'document', uid, properties: { 'files:files': updated } }, { headers: { 'Content-Type': 'application/json' } });
        }));
    }
    replaceAttachment(uid, index, file) {
        const params = JSON.stringify({
            params: { document: uid, save: 'true', xpath: `files:files/${index}/file` },
        });
        const formData = new FormData();
        formData.append('request', new Blob([params], { type: 'application/json' }));
        formData.append('file', file);
        return this.http.post(this.api.apiUrl('/nuxeo/api/v1/automation/Blob.AttachOnDocument'), formData, { responseType: 'blob' });
    }
    removeMainFile(uid) {
        return this.http.put(this.api.apiUrl(`/nuxeo/api/v1/id/${uid}`), { 'entity-type': 'document', uid, properties: { 'file:content': null } }, { headers: { 'Content-Type': 'application/json' } });
    }
    replaceMainFile(uid, file) {
        const params = JSON.stringify({
            params: { document: uid, save: 'true', xpath: 'file:content' },
        });
        const formData = new FormData();
        formData.append('request', new Blob([params], { type: 'application/json' }));
        formData.append('file', file);
        return this.http.post(this.api.apiUrl('/nuxeo/api/v1/automation/Blob.AttachOnDocument'), formData, { responseType: 'blob' });
    }
    // ── Versioning ──
    createVersion(uid, increment) {
        return this.api.post(`/nuxeo/api/v1/id/${uid}/@op/Document.CreateVersion`, { params: { increment, saveDocument: true }, context: {} }, { 'Content-Type': 'application/json' });
    }
    getVersions(uid) {
        const query = `SELECT * FROM Document WHERE ecm:versionVersionableId = '${uid}' AND ecm:isVersion = 1 ORDER BY dc:modified DESC`;
        const params = new HttpParams().set('query', query).set('pageSize', '50');
        return this.http.get(this.api.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'), { params, headers: { properties: '*' } });
    }
    /**
     * A document's versions, read straight from the repository rather than the search index.
     *
     * `getVersions` above goes through `/search/lang/NXQL/execute`, which on this deployment is
     * OpenSearch-backed and therefore **eventually** consistent. Measured on the local
     * instance: immediately after two `Document.CheckIn` calls the NXQL query returned one of
     * the two versions, and both only after the index caught up. A versions panel that reloads
     * on check-in would show the user a list missing the version they just created.
     *
     * `Document.GetVersions` reads the repository directly and returned both immediately. It answers
     * **oldest first** — `0.1`, `0.2`, … `0.12`, checked against the local instance — so a caller
     * showing the newest first sorts, as `nxs-manage-versions` does. The operation answers with a
     * bare `{"entity-type":"documents","entries":[...]}` — no `totalSize`, no page index — so this
     * returns the entries rather than pretending to be a `NuxeoPaginatedList`.
     *
     * `getVersions` is deliberately left alone: `document-detail` and the bulk-action services
     * already depend on its paginated shape.
     */
    getVersionsDirect(uid) {
        return this.api
            .post(`/nuxeo/api/v1/id/${uid}/@op/Document.GetVersions`, { params: {}, context: {} }, { 'Content-Type': 'application/json', properties: '*' })
            .pipe(map$1((res) => res.entries ?? []));
    }
    /**
     * Create a version of a live document — Nuxeo's `Document.CheckIn`. Nuxeo takes the increment
     * as `'minor' | 'major'`, which `minor` chooses between.
     */
    checkInDocument(uid, minor = true) {
        return this.api.post(`/nuxeo/api/v1/id/${uid}/@op/Document.CheckIn`, { params: { version: minor ? 'minor' : 'major' }, context: {} }, { 'Content-Type': 'application/json' });
    }
    /**
     * Replace the live document's content with a version's. `checkout: false` leaves it checked
     * in at that version (`0.1`), as Web UI does; `true` leaves it checked out (`0.2+`), which
     * reads as unversioned changes the user never made.
     */
    restoreVersion(versionUid) {
        return this.api.post(`/nuxeo/api/v1/id/${versionUid}/@op/Document.RestoreVersion`, { params: { checkout: false }, context: {} }, { 'Content-Type': 'application/json' });
    }
    // ── Comments ──
    getComments(uid) {
        return this.http.get(this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@comment`), {
            params: new HttpParams()
                .set('pageSize', '100')
                .set('sortBy', 'creationDate')
                .set('sortOrder', 'ASC'),
        });
    }
    getAllComments(uid) {
        const query = `SELECT * FROM Comment WHERE ecm:ancestorId = '${uid}' ORDER BY dc:created ASC`;
        const params = new HttpParams().set('query', query).set('pageSize', '200');
        return this.http.get(this.api.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'), { params, headers: { properties: '*' } });
    }
    createComment(uid, text) {
        return this.http.post(this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@comment`), {
            'entity-type': 'comment',
            parentId: uid,
            text,
        });
    }
    createReply(uid, parentCommentId, text) {
        return this.http.post(this.api.apiUrl(`/nuxeo/api/v1/id/${parentCommentId}/@comment`), { 'entity-type': 'comment', parentId: parentCommentId, text });
    }
    updateComment(uid, commentId, text) {
        return this.http.put(this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@comment/${commentId}`), { 'entity-type': 'comment', text });
    }
    deleteComment(uid, commentId) {
        return this.http.delete(this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@comment/${commentId}`));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DocumentDetailService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DocumentDetailService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DocumentDetailService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class DirectoryService {
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
        return this.getDirectoryCatalog().pipe(map$1((catalog) => {
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
        return this.api.get('/nuxeo/api/v1/directory').pipe(map$1((res) => this.parseDirectoryCatalog(res)), catchError$1(() => {
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
            .pipe(map$1((entries) => entries
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
        return fetchPage(0).pipe(expand((res) => (res.isNextPageAvailable ? fetchPage(res.currentPageIndex + 1) : EMPTY)), reduce((acc, res) => acc.concat(res.entries ?? []), []), map$1((entries) => entries
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
            .pipe(map$1((entry) => this.normalizeAdminEntry(directoryName, entry)));
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
            .pipe(map$1((entry) => this.normalizeAdminEntry(directoryName, entry)));
    }
    deleteEntry(directoryName, entryId) {
        return this.api
            .delete(`/nuxeo/api/v1/directory/${encodeURIComponent(directoryName)}/${encodeURIComponent(entryId)}`)
            .pipe(map$1(() => undefined));
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
        return fetchPage(0).pipe(expand((res) => (res.isNextPageAvailable ? fetchPage(res.currentPageIndex + 1) : EMPTY)), reduce((acc, res) => acc.concat(res.entries), []), map$1((entries) => entries
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DirectoryService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DirectoryService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DirectoryService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class TagService {
    api = inject(NuxeoApiBase);
    http = inject(HttpClient);
    /**
     * Tags the document and answers with all its tags afterwards. Nuxeo normalises a label — "Q3
     * Report" is stored as `q3report` — so what to show is the label it stored, not the one typed.
     */
    addTag(uid, label) {
        return this.api
            .post(`/nuxeo/api/v1/id/${uid}/@op/Services.TagDocument`, { params: { tags: label }, context: {} }, TAGS_SCHEMA)
            .pipe(map$1(tagLabels));
    }
    /** Takes the tag off the document and answers with the tags it still has. */
    removeTag(uid, label) {
        return this.api
            .post(`/nuxeo/api/v1/id/${uid}/@op/Services.UntagDocument`, { params: { tags: label }, context: {} }, TAGS_SCHEMA)
            .pipe(map$1(tagLabels));
    }
    searchTags(term) {
        const params = new HttpParams().set('pageSize', '20').set('currentPageIndex', '0');
        return this.http
            .get(this.api.apiUrl('/nuxeo/api/v1/directory/label_tag_entry'), { params })
            .pipe(map$1((res) => res.entries
            .map((e) => e.properties.label)
            .filter((l) => l.toLowerCase().includes(term.toLowerCase()))));
    }
    /**
     * Existing tags matching `term`, as Web UI's tag suggestion lists them: the `Tag.Suggestion`
     * operation. `searchTags` reads a `label_tag_entry` directory, which a stock Nuxeo 2025 answers
     * with 404. An entry with neither a label nor an id is skipped, and an answer that is not a list
     * is no suggestions; a server error reaches the caller.
     */
    suggestTags(term) {
        return this.api
            .post('/nuxeo/api/v1/automation/Tag.Suggestion', { params: { searchTerm: term }, context: {} }, { 'Content-Type': 'application/json' })
            .pipe(map$1((answer) => Array.isArray(answer) ? answer.map(suggestionLabel).filter((label) => label !== '') : []));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: TagService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: TagService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: TagService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
/** A `Tag.Suggestion` entry's label, or its id when it has none; empty when it has neither. */
function suggestionLabel(entry) {
    if (typeof entry !== 'object' || entry === null)
        return '';
    const label = 'displayLabel' in entry ? entry.displayLabel : undefined;
    const id = 'id' in entry ? entry.id : undefined;
    return (typeof label === 'string' && label) || (typeof id === 'string' ? id : '');
}
/** Asks for the schema holding `nxtag:tags`, which the operations' answer otherwise leaves out. */
const TAGS_SCHEMA = { properties: 'facetedTag' };
const tagLabels = (doc) => {
    const tags = doc?.properties?.['nxtag:tags'];
    return Array.isArray(tags)
        ? tags
            .map((tag) => typeof tag === 'string' ? tag : (tag?.label ?? ''))
            .filter(Boolean)
        : [];
};

const DOC_TYPE_ICONS = {
    File: 'description',
    Note: 'sticky_note_2',
    Picture: 'image',
    Video: 'videocam',
    Audio: 'audiotrack',
    Folder: 'folder',
    OrderedFolder: 'folder',
    Workspace: 'workspaces',
    WorkspaceRoot: 'source',
    Domain: 'public',
    Collection: 'collections_bookmark',
    SectionRoot: 'library_books',
    Section: 'library_books',
    TemplateRoot: 'dashboard_customize',
};
function docTypeIcon(type) {
    return DOC_TYPE_ICONS[type] ?? 'insert_drive_file';
}

/**
 * Resolves the total item count for Material paginator `[length]`.
 * Nuxeo may return `resultsCount` instead of or alongside `totalSize`; when both are
 * present, use the larger value so the paginator never under-counts. When both are absent,
 * derive a usable length from `numberOfPages` or `isNextPageAvailable`.
 */
function resolvePaginatedListTotal(res, pageSize, pageIndex) {
    const knownTotals = [res.totalSize, res.resultsCount].filter((n) => n !== undefined && n >= 0);
    if (knownTotals.length > 0) {
        return Math.max(...knownTotals);
    }
    const entryCount = res.entries?.length ?? 0;
    const currentPageSize = res.currentPageSize ?? entryCount;
    if (res.numberOfPages !== undefined && res.numberOfPages > 0) {
        if (!res.isNextPageAvailable || pageIndex >= res.numberOfPages - 1) {
            return (res.numberOfPages - 1) * pageSize + currentPageSize;
        }
        return res.numberOfPages * pageSize;
    }
    if (res.isNextPageAvailable) {
        return (pageIndex + 2) * pageSize;
    }
    return pageIndex * pageSize + entryCount;
}

/** Web UI note RTE — `nuxeo-document-picker provider="document_picker"`. */
const NOTE_DOCUMENT_PICKER_PROVIDER = 'document_picker';
/** Web UI `nuxeo-document-picker` / `nuxeo-results-view` request headers. */
const NOTE_DOCUMENT_PICKER_HEADERS = {
    properties: 'dublincore,file',
    'enrichers.document': 'thumbnail,permissions,highlight',
};
/**
 * NXQL equivalent of the default `document_picker` page provider
 * (Picture facet, not trashed). Used when ES-backed PP fails locally.
 *
 * Quick Search filters by title and main blob file name — `ecm:fulltext` is often
 * disabled in dev Docker while `fulltext_all` on the page provider still works in prod.
 */
function buildNoteDocumentPickerNxql(fulltext) {
    let query = "SELECT * FROM Document WHERE ecm:mixinType != 'HiddenInNavigation' " +
        "AND ecm:primaryType = 'Picture' AND ecm:isTrashed = 0";
    const term = fulltext.trim();
    if (term) {
        const escaped = escapeNxqlLiteral(term);
        query += ` AND (dc:title LIKE '%${escaped}%' OR file:content/name LIKE '%${escaped}%')`;
    }
    return query;
}
/** Keep only Picture/image documents with a server-supplied blob URL for `<img src>`. */
function filterInsertablePictureDocuments(entries) {
    return (entries ?? []).filter(hasInsertablePictureBlob);
}
/** True when `file:content.data` exists and the blob is an image (Web UI parity). */
function hasInsertablePictureBlob(doc) {
    const fileContent = doc.properties?.['file:content'];
    if (!fileContent || typeof fileContent !== 'object')
        return false;
    const record = fileContent;
    const data = record['data'];
    if (typeof data !== 'string' || data.length === 0)
        return false;
    if (doc.type === 'Picture')
        return true;
    const mime = record['mime-type'] ?? record['mimeType'];
    return typeof mime === 'string' && mime.startsWith('image/');
}
function normalizeDocumentPickerList(res, pageSize, pageIndex) {
    const entries = res.entries ?? [];
    return {
        entries,
        totalSize: resolvePaginatedListTotal(res, pageSize, pageIndex),
        resultsCount: res.resultsCount,
        currentPageSize: res.currentPageSize ?? entries.length,
        currentPageIndex: res.currentPageIndex ?? pageIndex,
        numberOfPages: res.numberOfPages ?? 1,
    };
}

/**
 * Modification-date ranges under an earlier name, mapped to the bucket `default_search` defines.
 * Saved searches written before the rename still carry `moreThan1YearAgo`, which the server does
 * not know and would ignore — returning every document instead of the old ones.
 */
const MODIFIED_RANGE_ALIASES = {
    moreThan1YearAgo: 'priorToLastYear',
};
class SearchService {
    api = inject(NuxeoApiBase);
    tags = inject(TagService);
    savedSearchHighlight = 'dc:title.fulltext,ecm:binarytext,dc:description.fulltext,ecm:tag,note:note.fulltext,file:content.name';
    suggestFromSuggestersLauncher(searchTerm, pageSize = 10) {
        const term = searchTerm.trim();
        if (!term)
            return of([]);
        return this.api
            .post('/nuxeo/api/v1/automation/Search.SuggestersLauncher', {
            params: { searchTerm: term },
            context: {},
        }, {
            'Content-Type': 'application/json',
            properties: '*',
        })
            .pipe(map$1((res) => this.normalizeSuggestions(res).slice(0, pageSize)), catchError$1(() => of([])));
    }
    suggest(searchTerm, pageSize = 10) {
        const term = searchTerm.trim();
        if (!term)
            return of([]);
        return this.suggestFromSuggestersLauncher(term, pageSize);
    }
    suggestFallback(searchTerm, pageSize) {
        const userGroup$ = this.api
            .post('/nuxeo/api/v1/automation/UserGroup.Suggestion', {
            params: { searchTerm, searchType: 'USER_GROUP_TYPE' },
            context: {},
        }, {
            'Content-Type': 'application/json',
            properties: '*',
        })
            .pipe(map$1((res) => (Array.isArray(res) ? res : [])
            .map((item) => this.mapSuggestion(item))
            .filter((item) => item !== null)), catchError$1(() => of([])));
        const docsParams = new HttpParams()
            .set('query', searchTerm)
            .set('pageSize', pageSize)
            .set('currentPageIndex', 0);
        const docs$ = this.api
            .get('/nuxeo/api/v1/search/pp/default_search/execute', docsParams, {
            properties: 'dublincore',
        })
            .pipe(map$1((res) => res.entries.map((doc) => ({
            id: doc.uid,
            displayLabel: doc.title || doc.uid,
            kind: 'document',
            documentUid: doc.uid,
            path: doc.path,
        }))), catchError$1(() => of([])));
        return forkJoin([docs$, userGroup$]).pipe(map$1(([docs, usersAndGroups]) => [...docs, ...usersAndGroups].slice(0, pageSize)));
    }
    getUserCollections() {
        return this.api
            .post('/nuxeo/api/v1/automation/User.GetCollections', { params: { searchTerm: '' }, context: {} }, { 'Content-Type': 'application/json', properties: 'dublincore,collection' })
            .pipe(map$1((res) => res.entries.map((doc) => {
            const props = doc.properties ?? {};
            const ids = props['collection:documentIds'] ?? [];
            const title = doc.title ?? props['dc:title'] ?? doc.uid;
            return {
                id: doc.uid,
                title,
                itemCount: ids.length,
            };
        })));
    }
    /**
     * Picture documents for the note RTE "insert from existing documents" picker.
     * Matches Web UI `nuxeo-document-picker` (`provider="document_picker"`,
     * `schemas="dublincore,file"`, `fulltext_all` param). Falls back to NXQL when the
     * ES-backed page provider is unavailable (`file:content` mapping errors).
     */
    searchDocumentPicker(options = {}) {
        const { fulltext = '', pageSize = 40, pageIndex = 0 } = options;
        const params = new HttpParams()
            .set('pageSize', pageSize)
            .set('currentPageIndex', pageIndex)
            .set('fulltext_all', fulltext.trim());
        return this.api
            .get(`/nuxeo/api/v1/search/pp/${NOTE_DOCUMENT_PICKER_PROVIDER}/execute`, params, { ...NOTE_DOCUMENT_PICKER_HEADERS })
            .pipe(map$1((res) => this.normalizePicturePickerList(res, pageSize, pageIndex)), catchError$1(() => this.searchDocumentPickerNxql(fulltext, pageSize, pageIndex)));
    }
    normalizePicturePickerList(res, pageSize, pageIndex) {
        const list = normalizeDocumentPickerList(res, pageSize, pageIndex);
        const entries = filterInsertablePictureDocuments(list.entries);
        return { ...list, entries };
    }
    searchDocumentPickerNxql(fulltext, pageSize, pageIndex) {
        const params = new HttpParams()
            .set('query', buildNoteDocumentPickerNxql(fulltext))
            .set('pageSize', pageSize)
            .set('currentPageIndex', pageIndex);
        return this.api
            .get('/nuxeo/api/v1/search/lang/NXQL/execute', params, {
            properties: 'dublincore,file',
            'enrichers.document': 'thumbnail',
        })
            .pipe(map$1((res) => this.normalizePicturePickerList(res, pageSize, pageIndex)));
    }
    getSavedSearches(pageProvider = 'default_search') {
        const params = new HttpParams().set('pageProvider', pageProvider);
        return this.api
            .get('/nuxeo/api/v1/search/saved', params, {
            properties: '*',
            'enrichers.document': 'thumbnail,permissions,highlight',
        })
            .pipe(map$1((res) => (res.entries ?? [])
            .map((doc) => {
            // Saved search API returns entries with `id`; document API returns `uid`.
            const id = this.asString(doc['id']) ?? this.asString(doc['uid']) ?? '';
            const title = this.asString(doc['title']) ?? id;
            const props = doc['properties'] ?? {};
            const query = this.firstString(props['contentview:query'], props['savedsearch:query'], props['search:query'], doc['query']);
            return { id, title, query };
        })
            .filter((item) => item.id.length > 0)), catchError$1(() => of([])));
    }
    getSavedSearchById(id) {
        const encodedId = encodeURIComponent(id);
        return this.api
            .get(`/nuxeo/api/v1/search/saved/${encodedId}`, undefined, {
            properties: '*',
            'enrichers.document': 'thumbnail,permissions,highlight',
        })
            .pipe(map$1((saved) => {
            const props = saved['properties'] ?? {};
            const paramsRecord = saved['params'];
            if (paramsRecord && typeof paramsRecord === 'object') {
                const result = {};
                for (const [key, value] of Object.entries(paramsRecord)) {
                    if (key !== 'highlight' && value !== null && value !== undefined) {
                        // A list as JSON, not `String(list)`, which joins on commas and so splits a value
                        // that contains one. An empty list stays an empty string, as it always read.
                        result[key] = Array.isArray(value)
                            ? value.length > 0
                                ? JSON.stringify(value)
                                : ''
                            : String(value);
                    }
                }
                return result;
            }
            const namedParams = props['savedsearch:namedParams'];
            if (Array.isArray(namedParams)) {
                const result = {};
                for (const entry of namedParams) {
                    const key = typeof entry['key'] === 'string' ? entry['key'] : null;
                    const value = entry['value'];
                    if (key && key !== 'highlight' && value !== null && value !== undefined) {
                        result[key] = String(value);
                    }
                }
                return result;
            }
            return {};
        }), catchError$1(() => of({})));
    }
    saveSavedSearch(request) {
        const { title, params, pageProviderName = 'default_search' } = request;
        return this.api.post('/nuxeo/api/v1/search/saved', {
            'entity-type': 'savedSearch',
            pageProviderName,
            params: {
                ...params,
                highlight: this.savedSearchHighlight,
            },
            title,
        }, {
            'Content-Type': 'application/json',
            accept: 'text/plain, application/json',
            properties: '*',
        });
    }
    updateSavedSearch(id, request) {
        const encodedId = encodeURIComponent(id);
        const { title, params, pageProviderName = 'default_search' } = request;
        return this.api.put(`/nuxeo/api/v1/search/saved/${encodedId}`, {
            'entity-type': 'savedSearch',
            pageProviderName,
            params: {
                ...params,
                highlight: this.savedSearchHighlight,
            },
            title,
        }, {
            'Content-Type': 'application/json',
            accept: 'text/plain, application/json',
            properties: '*',
        });
    }
    /**
     * Renames a saved search and leaves its filters as stored. The request carries no `params`, so
     * the server keeps the ones it has — whichever application wrote them.
     */
    renameSavedSearch(id, title, pageProviderName = 'default_search') {
        return this.api.put(`/nuxeo/api/v1/search/saved/${encodeURIComponent(id)}`, { 'entity-type': 'savedSearch', pageProviderName, title }, { 'Content-Type': 'application/json', accept: 'text/plain, application/json' });
    }
    deleteSavedSearch(id) {
        const encodedId = encodeURIComponent(id);
        return this.api.delete(`/nuxeo/api/v1/search/saved/${encodedId}`);
    }
    search(params) {
        const { q = '', ecmFulltext = '', quickFilters = '', sortBy = 'dc:created', sortOrder = 'desc', modifiedDate = '', author = '', collection = '', tag = '', nature = '', subjects = '', coverage = '', size = '', pageIndex = 0, pageSize = 40, } = params;
        // A list is a JSON array, which keeps a value containing a comma whole, or comma-separated.
        const parseList = (value) => {
            const text = value.trim();
            if (text.startsWith('[')) {
                try {
                    const parsed = JSON.parse(text);
                    if (Array.isArray(parsed)) {
                        return parsed
                            .filter((entry) => typeof entry === 'string')
                            .map((v) => v.trim())
                            .filter(Boolean);
                    }
                }
                catch {
                    // Not JSON: read it as comma-separated below.
                }
            }
            return text
                .split(',')
                .map((v) => v.trim())
                .filter(Boolean);
        };
        let httpParams = new HttpParams()
            .set('currentPageIndex', pageIndex)
            .set('offset', pageIndex * pageSize)
            .set('pageSize', pageSize)
            .set('sortBy', sortBy)
            .set('sortOrder', sortOrder)
            .set('quickFilters', quickFilters.trim());
        const modifiedDateValues = [
            ...new Set(parseList(modifiedDate).map((value) => MODIFIED_RANGE_ALIASES[value] ?? value)),
        ];
        // One author, collection or tag as before, or several as a JSON array — never split on commas,
        // which a username or a tag label may contain.
        const parseValues = (value) => value.trim().startsWith('[') ? parseList(value) : value.trim() ? [value.trim()] : [];
        const authorValues = [...new Set(parseValues(author))];
        const collectionValues = [...new Set(parseValues(collection))];
        const tagValues = [...new Set(parseValues(tag))];
        const natureValues = parseList(nature);
        const subjectValues = parseList(subjects);
        const coverageValues = parseList(coverage);
        const sizeValues = parseList(size);
        if (modifiedDateValues.length > 0) {
            httpParams = httpParams.set('dc_modified_agg', JSON.stringify(modifiedDateValues));
        }
        if (authorValues.length > 0) {
            httpParams = httpParams.set('dc_creator_agg', JSON.stringify(authorValues));
        }
        // `ecm_collections` is the parameter `default_search` filters collection membership on, as
        // Web UI's search form sends it. It has no aggregate, so there is no `collection_agg` bucket.
        if (collectionValues.length > 0) {
            httpParams = httpParams.set('ecm_collections', JSON.stringify(collectionValues));
        }
        if (natureValues.length > 0) {
            httpParams = httpParams.set('dc_nature_agg', JSON.stringify(natureValues));
        }
        if (coverageValues.length > 0) {
            httpParams = httpParams.set('dc_coverage_agg', JSON.stringify(coverageValues));
        }
        if (sizeValues.length > 0) {
            httpParams = httpParams.set('common_size_agg', JSON.stringify(sizeValues));
        }
        if (subjectValues.length > 0) {
            httpParams = httpParams.set('dc_subjects_agg', JSON.stringify([...new Set(subjectValues)]));
        }
        if (tagValues.length > 0) {
            httpParams = httpParams.set('ecm_tags', JSON.stringify(tagValues));
        }
        if (q.trim()) {
            httpParams = httpParams.set('query', q.trim());
        }
        // Dashes become spaces, as Web UI's `formatFulltext` does: Nuxeo reads `-word` as an exclusion.
        const fulltext = ecmFulltext.replace(/-/g, ' ').trim();
        if (fulltext) {
            httpParams = httpParams.set('ecm_fulltext', fulltext);
        }
        return this.api
            .get('/nuxeo/api/v1/search/pp/default_search/execute', httpParams, {
            properties: 'dublincore,file,common',
            'enrichers.document': 'favorites',
        })
            .pipe(map$1((res) => ({
            items: res.entries.map((doc) => {
                const props = doc.properties ?? {};
                const fileContent = props['file:content'];
                const tags = props['dc:subjects'] ?? [];
                const lastContributor = this.asPrincipalName(props['dc:lastContributor']);
                const author = this.asPrincipalName(props['dc:creator']);
                const major = props['uid:major_version'];
                const minor = props['uid:minor_version'];
                const version = typeof major === 'number' && typeof minor === 'number'
                    ? `${major}.${minor}`
                    : undefined;
                return {
                    id: doc.uid,
                    title: doc.title,
                    type: doc.type,
                    path: doc.path,
                    isFavorite: doc.contextParameters?.favorites?.isFavorite ?? false,
                    modifiedDate: doc.lastModified?.slice(0, 10) ?? '',
                    sizeInBytes: this.parseSizeInBytes(fileContent?.length),
                    lastContributor,
                    createdDate: typeof props['dc:created'] === 'string'
                        ? props['dc:created'].slice(0, 10)
                        : undefined,
                    author,
                    authorKey: author.toLowerCase(),
                    state: typeof props['ecm:currentLifeCycleState'] === 'string'
                        ? props['ecm:currentLifeCycleState']
                        : undefined,
                    version,
                    nature: typeof props['dc:nature'] === 'string' ? props['dc:nature'] : undefined,
                    coverage: typeof props['dc:coverage'] === 'string'
                        ? props['dc:coverage']
                        : undefined,
                    subjects: tags.join(', ') || undefined,
                    flags: undefined,
                    collection: Array.isArray(props['collection:documentIds'])
                        ? props['collection:documentIds'].join(',')
                        : (props['collection:documentIds'] ?? ''),
                    collectionKey: Array.isArray(props['collection:documentIds'])
                        ? props['collection:documentIds'].join(',').toLowerCase()
                        : (props['collection:documentIds'] ?? '').toLowerCase(),
                    tags,
                    icon: docTypeIcon(doc.type),
                };
            }),
            aggregations: this.normalizeAggregations(res.aggregations),
            totalSize: typeof res.resultsCount === 'number' ? res.resultsCount : (res.totalSize ?? -1),
            hasNextPage: res.isNextPageAvailable === true,
        })));
    }
    /**
     * Tag labels that start with `term`, from `TagService.suggestTags` (Nuxeo's `Tag.Suggestion`) —
     * what Web UI's search form offers in its Tags field. Empty for a blank term, and on failure, so a
     * typeahead stays usable.
     */
    getTagSuggestions(term) {
        const searchTerm = term.trim();
        if (!searchTerm)
            return of([]);
        return this.tags.suggestTags(searchTerm).pipe(catchError$1(() => of([])));
    }
    asPrincipalName(value) {
        if (typeof value === 'string')
            return value;
        if (!value || typeof value !== 'object')
            return '';
        const principal = value;
        return principal.name ?? principal.properties?.username ?? principal.id ?? '';
    }
    parseSizeInBytes(value) {
        if (typeof value === 'number') {
            return Number.isFinite(value) && value >= 0 ? value : undefined;
        }
        if (typeof value === 'string') {
            const parsed = Number(value);
            return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
        }
        return undefined;
    }
    firstString(...values) {
        for (const value of values) {
            if (typeof value === 'string' && value.trim()) {
                return value;
            }
        }
        return undefined;
    }
    normalizeAggregations(aggregations) {
        const toAggregate = (agg) => {
            if (!agg?.buckets?.length)
                return undefined;
            return {
                buckets: agg.buckets
                    .filter((b) => typeof b.key === 'string')
                    .map((b) => ({
                    key: b.key,
                    docCount: typeof b.docCount === 'number' ? b.docCount : (b.doc_count ?? 0),
                })),
            };
        };
        return {
            dc_modified_agg: toAggregate(aggregations?.['dc_modified_agg']),
            dc_creator_agg: toAggregate(aggregations?.['dc_creator_agg']),
            collection_agg: toAggregate(aggregations?.['collection_agg']),
            dc_nature_agg: toAggregate(aggregations?.['dc_nature_agg']),
            dc_coverage_agg: toAggregate(aggregations?.['dc_coverage_agg']),
            dc_subjects_agg: toAggregate(aggregations?.['dc_subjects_agg']),
            common_size_agg: toAggregate(aggregations?.['common_size_agg']),
        };
    }
    normalizeSuggestions(payload) {
        const items = this.extractSuggestionItems(payload);
        const suggestions = [];
        for (const item of items) {
            const mapped = this.mapSuggestion(item);
            if (mapped)
                suggestions.push(mapped);
        }
        return suggestions;
    }
    extractSuggestionItems(payload) {
        if (Array.isArray(payload)) {
            const directItems = payload.filter((item) => this.looksLikeSuggestionItem(item));
            if (directItems.length > 0) {
                return directItems;
            }
            const nestedItems = payload
                .filter((item) => !!item && typeof item === 'object')
                .flatMap((item) => this.extractArraysFromContainer(item));
            return nestedItems;
        }
        if (!payload || typeof payload !== 'object')
            return [];
        const obj = payload;
        const arrays = this.extractArraysFromContainer(obj);
        if (arrays.length > 0)
            return arrays;
        return Object.values(obj)
            .filter(Array.isArray)
            .flatMap((value) => value);
    }
    extractArraysFromContainer(container) {
        const directArrayKeys = ['entries', 'results', 'suggestions', 'documents', 'users', 'groups'];
        return directArrayKeys
            .map((key) => container[key])
            .filter(Array.isArray)
            .flatMap((value) => value);
    }
    looksLikeSuggestionItem(value) {
        if (!value || typeof value !== 'object')
            return false;
        const item = value;
        return (typeof item['id'] === 'string' ||
            typeof item['uid'] === 'string' ||
            typeof item['username'] === 'string' ||
            typeof item['groupname'] === 'string' ||
            typeof item['prefixed_id'] === 'string');
    }
    mapSuggestion(value) {
        if (!value || typeof value !== 'object')
            return null;
        const item = value;
        const properties = item['properties'] ?? {};
        const typeValue = this.asString(item['type']) ?? this.asString(item['entity-type']) ?? '';
        const id = this.asString(item['id']) ??
            this.asString(item['uid']) ??
            this.asString(item['username']) ??
            this.asString(item['groupname']) ??
            this.asString(item['prefixed_id']);
        if (!id)
            return null;
        const displayLabel = this.asString(item['displayLabel']) ??
            this.asString(item['title']) ??
            this.asString(properties['dc:title']) ??
            id;
        const highlightsByField = this.extractHighlightsByField(item);
        const displayLabelHighlights = this.pickHighlightParts(highlightsByField, [
            'dc:title',
            'file:content.name',
            'displayLabel',
            'label',
            'username',
            'groupname',
        ]) ?? undefined;
        const pathHighlights = this.pickHighlightParts(highlightsByField, ['ecm:path', 'path', 'url']) ?? undefined;
        const prefixedId = this.asString(item['prefixed_id']);
        const path = this.asString(item['path']) ??
            this.asString(properties['ecm:path']) ??
            this.asString(item['url']);
        const typeUpper = typeValue.toUpperCase();
        const isGroup = typeUpper.includes('GROUP') ||
            typeof item['groupname'] === 'string' ||
            prefixedId?.startsWith('group:') === true;
        const isUser = typeUpper.includes('USER') ||
            typeof item['username'] === 'string' ||
            prefixedId?.startsWith('user:') === true;
        const documentUid = this.asString(item['uid']) ?? (typeUpper.includes('DOCUMENT') ? id : undefined);
        return {
            id,
            displayLabel,
            displayLabelHighlights,
            kind: isGroup ? 'group' : isUser ? 'user' : documentUid ? 'document' : 'other',
            documentUid,
            path,
            pathHighlights,
            prefixedId,
        };
    }
    extractHighlightsByField(item) {
        const map = new Map();
        const rawHighlights = item['highlights'];
        if (Array.isArray(rawHighlights)) {
            for (const entry of rawHighlights) {
                if (!entry || typeof entry !== 'object')
                    continue;
                const obj = entry;
                const field = this.asString(obj['field']);
                const segments = Array.isArray(obj['segments'])
                    ? obj['segments']
                        .filter((segment) => typeof segment === 'string')
                        .map((segment) => segment.trim())
                        .filter(Boolean)
                    : [];
                if (!field || segments.length === 0)
                    continue;
                map.set(field, segments);
            }
            return map;
        }
        if (rawHighlights && typeof rawHighlights === 'object') {
            const obj = rawHighlights;
            for (const [field, value] of Object.entries(obj)) {
                if (!field)
                    continue;
                const segments = Array.isArray(value)
                    ? value
                        .filter((segment) => typeof segment === 'string')
                        .map((segment) => segment.trim())
                        .filter(Boolean)
                    : [];
                if (segments.length === 0)
                    continue;
                map.set(field, segments);
            }
        }
        return map;
    }
    pickHighlightParts(highlightsByField, candidateFields) {
        for (const field of candidateFields) {
            const segments = highlightsByField.get(field);
            if (!segments || segments.length === 0)
                continue;
            const parts = this.toHighlightParts(segments.join(' '));
            if (parts.length > 0)
                return parts;
        }
        return null;
    }
    toHighlightParts(input) {
        const html = input.trim();
        if (!html)
            return [];
        const parts = [];
        const re = /<em>(.*?)<\/em>/gi;
        let lastIndex = 0;
        let match = null;
        while ((match = re.exec(html)) !== null) {
            const start = match.index;
            const end = re.lastIndex;
            if (start > lastIndex) {
                const plain = this.stripTags(html.slice(lastIndex, start));
                if (plain)
                    parts.push({ text: plain, matched: false });
            }
            const highlighted = this.stripTags(match[1] ?? '');
            if (highlighted)
                parts.push({ text: highlighted, matched: true });
            lastIndex = end;
        }
        if (lastIndex < html.length) {
            const plain = this.stripTags(html.slice(lastIndex));
            if (plain)
                parts.push({ text: plain, matched: false });
        }
        if (parts.length === 0) {
            const plain = this.stripTags(html);
            return plain ? [{ text: plain, matched: false }] : [];
        }
        return parts;
    }
    stripTags(value) {
        if (!value) {
            return '';
        }
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(value, 'text/html');
            return doc.body.textContent ?? '';
        }
        catch {
            // Fallback to the original value if DOMParser is unavailable or parsing fails.
            return value;
        }
    }
    asString(value) {
        if (typeof value !== 'string')
            return undefined;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: SearchService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: SearchService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: SearchService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class SearchAggregationService {
    aggregations = signal({}, ...(ngDevMode ? [{ debugName: "aggregations" }] : []));
    items = signal([], ...(ngDevMode ? [{ debugName: "items" }] : []));
    drawerFilters = signal({}, ...(ngDevMode ? [{ debugName: "drawerFilters" }] : []));
    selectedSavedSearchId = signal('', ...(ngDevMode ? [{ debugName: "selectedSavedSearchId" }] : []));
    selectedSavedSearchTitle = signal('', ...(ngDevMode ? [{ debugName: "selectedSavedSearchTitle" }] : []));
    /** Incremented whenever a saved search is created so the drawer can refresh its list. */
    savedSearchVersion = signal(0, ...(ngDevMode ? [{ debugName: "savedSearchVersion" }] : []));
    markSavedSearchDirty() {
        this.savedSearchVersion.update((v) => v + 1);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: SearchAggregationService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: SearchAggregationService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: SearchAggregationService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class SelectionService {
    documentDetailService = inject(DocumentDetailService);
    selectedIds = signal(new Set(), ...(ngDevMode ? [{ debugName: "selectedIds" }] : []));
    selectedLabels = signal(new Map(), ...(ngDevMode ? [{ debugName: "selectedLabels" }] : []));
    selectedPreviews = signal(new Map(), ...(ngDevMode ? [{ debugName: "selectedPreviews" }] : []));
    selectedTypes = signal(new Map(), ...(ngDevMode ? [{ debugName: "selectedTypes" }] : []));
    /** When true, the app shell topbar shows only count + Clear (e.g. note image picker). */
    clearOnlyMode = signal(false, ...(ngDevMode ? [{ debugName: "clearOnlyMode" }] : []));
    selectedCount = () => this.selectedIds().size;
    selectedItems = () => [...this.selectedIds()].map((id) => ({
        id,
        name: this.selectedLabels().get(id) ?? id,
        preview: this.selectedPreviews().get(id) ?? null,
        type: this.selectedTypes().get(id),
    }));
    toggle(id, label, preview, type) {
        this.selectedIds.update((current) => {
            const next = new Set(current);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
        this.selectedLabels.update((current) => {
            const next = new Map(current);
            if (this.selectedIds().has(id)) {
                next.set(id, label?.trim() || next.get(id) || id);
            }
            else {
                next.delete(id);
            }
            return next;
        });
        this.selectedPreviews.update((current) => {
            const next = new Map(current);
            if (this.selectedIds().has(id)) {
                next.set(id, preview ?? next.get(id) ?? null);
            }
            else {
                next.delete(id);
            }
            return next;
        });
        this.selectedTypes.update((current) => {
            const next = new Map(current);
            if (this.selectedIds().has(id)) {
                if (type)
                    next.set(id, type);
                else
                    next.delete(id);
            }
            else {
                next.delete(id);
            }
            return next;
        });
    }
    selectAll(ids, labels, previews, types) {
        this.selectedIds.set(new Set(ids));
        this.selectedLabels.update((current) => {
            const next = new Map();
            ids.forEach((id) => {
                next.set(id, labels?.[id]?.trim() || current.get(id) || id);
            });
            return next;
        });
        this.selectedPreviews.update((current) => {
            const next = new Map();
            ids.forEach((id) => {
                next.set(id, previews?.[id] ?? current.get(id) ?? null);
            });
            return next;
        });
        this.selectedTypes.update((current) => {
            const next = new Map();
            ids.forEach((id) => {
                const docType = types?.[id] ?? current.get(id);
                if (docType)
                    next.set(id, docType);
            });
            return next;
        });
    }
    /**
     * Forgets the retained preview URLs, keeping the selection itself intact.
     *
     * Callers hand `toggle`/`selectAll` an object URL they own, and this service keeps the string —
     * so when the owner revokes that URL, this copy becomes a dangling reference and the selection
     * topbar renders `<img [src]>` against a revoked `blob:`, i.e. a broken image beside a still-selected
     * item. Selection is global and survives a new search, so the two lifetimes genuinely differ.
     *
     * Fixing the object-URL leak is what exposed this: before, nothing was ever revoked, so the stale
     * copy stayed loadable by accident. Owners now call this immediately before revoking a batch, which
     * degrades the popup to its placeholder rather than showing a broken image.
     *
     * This is the conservative half of the fix. The complete one is for this service to own preview
     * lifetime — hold the blobs, or refetch on demand — so a selection keeps its thumbnails across a
     * search. That is a design change to a shared service and is deliberately not bundled here.
     */
    forgetPreviews() {
        this.selectedPreviews.update((current) => {
            const next = new Map();
            for (const id of current.keys())
                next.set(id, null);
            return next;
        });
    }
    isSelected(id) {
        return this.selectedIds().has(id);
    }
    isAllSelected(ids) {
        return ids.length > 0 && ids.every((id) => this.selectedIds().has(id));
    }
    isIndeterminate(ids) {
        return ids.some((id) => this.selectedIds().has(id)) && !this.isAllSelected(ids);
    }
    clear() {
        this.selectedIds.set(new Set());
        this.selectedLabels.set(new Map());
        this.selectedPreviews.set(new Map());
        this.selectedTypes.set(new Map());
    }
    /** Clears selection and exits clear-only topbar mode (logout, session reset). */
    resetUiState() {
        this.clear();
        this.clearOnlyMode.set(false);
    }
    setClearOnlyMode(enabled) {
        this.clearOnlyMode.set(enabled);
    }
    deleteSelected() {
        const ids = [...this.selectedIds()];
        return this.documentDetailService.trashDocuments(ids).pipe(finalize(() => this.clear()));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: SelectionService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: SelectionService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: SelectionService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class WorkflowService {
    api = inject(NuxeoApiBase);
    /** Get all available workflow models (Serial, Parallel, custom). */
    getWorkflowModels() {
        return this.api
            .get('/nuxeo/api/v1/workflowModel')
            .pipe(map$1((res) => res.entries));
    }
    /** Start a workflow on a document. */
    startWorkflow(docId, workflowModelName) {
        return this.api.post(`/nuxeo/api/v1/id/${docId}/@workflow`, {
            'entity-type': 'workflow',
            workflowModelName,
            attachedDocumentIds: [docId],
        });
    }
    /** Get running workflow instances on a document. */
    getDocumentWorkflows(docId) {
        return this.api
            .get(`/nuxeo/api/v1/id/${docId}/@workflow`)
            .pipe(map$1((res) => res.entries));
    }
    /** Get workflow instances launched by current user. */
    getMyWorkflows() {
        return this.api
            .get('/nuxeo/api/v1/workflow')
            .pipe(map$1((res) => res.entries));
    }
    /** Get a specific workflow instance. */
    getWorkflow(workflowId) {
        return this.api.get(`/nuxeo/api/v1/workflow/${workflowId}`);
    }
    /** Cancel / abandon a running workflow. */
    cancelWorkflow(workflowInstanceId) {
        return this.api.delete(`/nuxeo/api/v1/workflow/${workflowInstanceId}`);
    }
    /** Get the workflow graph (JSON). */
    getWorkflowGraph(workflowInstanceId) {
        return this.api.get(`/nuxeo/api/v1/workflow/${workflowInstanceId}/graph`);
    }
    /** Get a specific workflow model by name. */
    getWorkflowModel(modelName) {
        return this.api.get(`/nuxeo/api/v1/workflowModel/${modelName}`);
    }
    /** Get the graph of a workflow model. */
    getWorkflowModelGraph(modelName) {
        return this.api.get(`/nuxeo/api/v1/workflowModel/${modelName}/graph`);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: WorkflowService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: WorkflowService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: WorkflowService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/** Nuxeo REST header to include group membership on group list/detail responses. */
const GROUP_MEMBERS_FETCH_HEADER = { 'fetch.group': 'memberUsers,memberGroups' };
class UserService {
    api = inject(NuxeoApiBase);
    /** Search users by partial name/username (for participant picker). */
    searchUsers(query) {
        const params = new HttpParams().set('q', query);
        return this.api
            .get('/nuxeo/api/v1/user/search', params)
            .pipe(map$1((res) => res.entries));
    }
    /**
     * User search with paging (used by Administration). Uses `*` when the query is empty
     * so the server returns a broad list where supported.
     */
    searchUsersPaged(query, pageSize = 50, currentPageIndex = 0) {
        const q = query.trim() || '*';
        const params = new HttpParams()
            .set('q', q)
            .set('pageSize', String(pageSize))
            .set('currentPageIndex', String(currentPageIndex));
        return this.api.get('/nuxeo/api/v1/user/search', params);
    }
    /** Search groups by partial name (for participant picker). */
    searchGroups(query) {
        const params = new HttpParams().set('q', query);
        return this.api
            .get('/nuxeo/api/v1/group/search', params)
            .pipe(map$1((res) => res.entries));
    }
    /**
     * Recently created users and groups, newest first (Nuxeo Web UI parity).
     * Uses audit-backed page provider `LATEST_CREATED_USERS_OR_GROUPS_PROVIDER`.
     */
    getRecentlyCreatedUsersAndGroups(pageSize = 50, currentPageIndex = 0) {
        const params = new HttpParams()
            .set('pageSize', String(pageSize))
            .set('currentPageIndex', String(currentPageIndex));
        return this.api.get('/nuxeo/api/v1/search/pp/LATEST_CREATED_USERS_OR_GROUPS_PROVIDER/execute', params, { properties: '*' });
    }
    searchGroupsPaged(query, pageSize = 50, currentPageIndex = 0) {
        const q = query.trim() || '*';
        const params = new HttpParams()
            .set('q', q)
            .set('pageSize', String(pageSize))
            .set('currentPageIndex', String(currentPageIndex));
        return this.api.get('/nuxeo/api/v1/group/search', params, {
            ...GROUP_MEMBERS_FETCH_HEADER,
        });
    }
    /** Get a specific user. */
    getUser(userId) {
        return this.api.get(`/nuxeo/api/v1/user/${encodeURIComponent(userId)}`);
    }
    getGroup(groupId) {
        return this.api.get(`/nuxeo/api/v1/group/${encodeURIComponent(groupId)}`, undefined, { ...GROUP_MEMBERS_FETCH_HEADER });
    }
    createUser(input) {
        const password = input.password?.trim();
        if (password) {
            return this.createUserWithPassword({ ...input, password });
        }
        return this.inviteUser(input);
    }
    /** Immediate account creation with an admin-set password (Nuxeo Web UI parity). */
    createUserWithPassword(input) {
        return this.api.post('/nuxeo/api/v1/user', {
            'entity-type': 'user',
            id: input.username,
            properties: {
                username: input.username,
                firstName: input.firstName,
                lastName: input.lastName,
                company: input.company ?? '',
                email: input.email,
                password: input.password,
                groups: input.groups ?? [],
            },
        });
    }
    /**
     * Invitation flow when no password is set — mirrors Nuxeo Web UI `User.Invite` with a
     * user entity input so the invitee receives an email to set their own password.
     */
    inviteUser(input) {
        return this.api
            .post('/nuxeo/api/v1/automation/User.Invite', {
            input: {
                'entity-type': 'user',
                id: '',
                properties: {
                    username: input.username,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    company: input.company ?? '',
                    email: input.email,
                    groups: input.groups ?? [],
                },
            },
            params: {},
            context: {},
        })
            .pipe(map$1(() => this.buildUserFromInput(input)));
    }
    buildUserFromInput(input) {
        return {
            'entity-type': 'user',
            id: input.username,
            properties: {
                username: input.username,
                firstName: input.firstName,
                lastName: input.lastName,
                company: input.company ?? '',
                email: input.email,
                groups: input.groups ?? [],
            },
        };
    }
    updateUser(userId, updates) {
        return this.getUser(userId).pipe(switchMap$1((existing) => {
            const props = { ...existing.properties };
            if (updates.firstName !== undefined)
                props.firstName = updates.firstName;
            if (updates.lastName !== undefined)
                props.lastName = updates.lastName;
            if (updates.company !== undefined)
                props.company = updates.company;
            if (updates.email !== undefined)
                props.email = updates.email;
            if (updates.groups !== undefined)
                props.groups = updates.groups;
            if (updates.password !== undefined && updates.password.length > 0) {
                props.password = updates.password;
            }
            return this.api.put(`/nuxeo/api/v1/user/${encodeURIComponent(userId)}`, {
                'entity-type': 'user',
                id: existing.id,
                properties: props,
            });
        }));
    }
    deleteUser(userId) {
        return this.api
            .delete(`/nuxeo/api/v1/user/${encodeURIComponent(userId)}`)
            .pipe(map$1(() => undefined));
    }
    createGroup(input) {
        return this.api.post('/nuxeo/api/v1/group', {
            'entity-type': 'group',
            groupname: input.groupname,
            grouplabel: input.grouplabel,
            memberUsers: input.memberUsers ?? [],
            memberGroups: input.memberGroups ?? [],
        });
    }
    updateGroup(groupname, updates) {
        return this.getGroup(groupname).pipe(switchMap$1((existing) => this.api.put(`/nuxeo/api/v1/group/${encodeURIComponent(groupname)}`, {
            'entity-type': 'group',
            groupname: existing.groupname,
            grouplabel: updates.grouplabel ?? existing.grouplabel,
            memberUsers: updates.memberUsers ?? existing.memberUsers ?? [],
            memberGroups: updates.memberGroups ?? existing.memberGroups ?? [],
        })));
    }
    deleteGroup(groupname) {
        return this.api
            .delete(`/nuxeo/api/v1/group/${encodeURIComponent(groupname)}`)
            .pipe(map$1(() => undefined));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: UserService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: UserService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: UserService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class NuxeoDriveService {
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
            .pipe(map$1((res) => (res.entries?.length ?? 0) > 0), catchError$1(() => of(false)));
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NuxeoDriveService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NuxeoDriveService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NuxeoDriveService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/**
 * ARender annotation viewer configuration, or `null` when ARender is not deployed.
 *
 * **Nullable, and `null` is the default.** `integrations.arender` in the Layer 0 bootstrap file
 * (`agentic-ui-config/bootstrap.json`, read before authentication — *not* the post-auth runtime
 * manifest, which has no `integrations` key) defaults to `null` and nothing in this repository sets
 * it, so an unconfigured
 * deployment is the normal case, not an edge case. Callers must handle `null`; `ARenderService`
 * does, and degrades to "Annotations are not available".
 *
 * This token used to be typed non-nullable with a factory returning compiled-in
 * `http://localhost:8180` and `http://nuxeo-auth-proxy/nuxeo` defaults. Both were wrong:
 *
 *   - A shipped build with no manifest pointed the annotation viewer at the *user's own*
 *     `localhost:8180`, and `.cursor/rules/security.mdc` prohibits exactly this kind of
 *     hardcoded config default.
 *   - `http://` for a value that is navigated in an iframe is a plaintext privilege boundary
 *     (Sonar `S5332`). Sonar never reported the literals in this file at all, because
 *     `sonar-project.properties` excludes every `*.config.ts` file — so the scanner is blind to
 *     the very filename pattern where hardcoded configuration is most likely to live.
 *
 * There is deliberately no fallback now. A deployment that wants ARender supplies `viewerOrigin` in
 * its manifest; anything less is `null`.
 *
 * **`viewerOrigin` is the only required value.** `nuxeoInternalUrl` is vestigial (see above) and is
 * neither required nor validated — gating on a field nothing consumes can only reject
 * configurations that would have worked.
 *
 * `viewerOrigin` is enforced **twice, in different layers**, and neither is redundant:
 *
 *   - `bootstrap-config.ts`'s `completeARenderConfig` returns `null` unless the merged result has a
 *     non-blank `viewerOrigin`, so a manifest without one never reaches the token.
 *   - `ARenderService` re-checks, and additionally requires it to be an absolute http(s) base with
 *     no query, fragment or userinfo — because it is navigated in an iframe and serves as the
 *     origin allow-list for the URL Nuxeo returns.
 *
 * An earlier version of this comment claimed `bootstrap-config.ts` already refused half a
 * configuration when it did not: the merge filled the missing half with `''`, producing precisely
 * the object the comment said was impossible. The prose is not the contract; the check is.
 */
const ARENDER_CONFIG = new InjectionToken('ARENDER_CONFIG', {
    providedIn: 'root',
    factory: () => null,
});

/**
 * Validation for URLs that will be **navigated** — loaded into an `iframe`, or otherwise handed to
 * the browser as a document to fetch and render.
 *
 * ## Why this exists
 *
 * `DomSanitizer.bypassSecurityTrustResourceUrl` is unavoidable for `iframe[src]`: Angular's
 * `RESOURCE_URL` sanitizer throws on a raw string, so there is no "just don't bypass it" option.
 * The bypass is therefore only as safe as the string handed to it, and two of ours do not originate
 * in our own code:
 *
 *   - the ARender viewer origin, from the **customer-editable** Layer 0 bootstrap file;
 *   - the Nuxeo `preview` URL, from a **server** REST response.
 *
 * A manifest setting `viewerOrigin` to `javascript:alert(1)` is a complete, non-blank, perfectly
 * well-formed value that a completeness check waves through, and `new URL('javascript:alert(1)')`
 * does **not** throw — `javascript:` is a valid URL scheme. Bypassed and put in an `iframe`, it
 * executes in this application's origin. Turning a configuration value into script execution is a
 * privilege escalation, and `.cursor/rules/beta-program.mdc` makes that manifest a customer surface,
 * so the boundary is real rather than theoretical.
 *
 * ## What it checks, and why origin comparison rather than string prefixes
 *
 * Everything is resolved with `new URL(candidate, base)` and compared by `origin`. That is
 * deliberate: the obvious `candidate.startsWith('/')` test for "same origin" accepts `//evil.com/x`,
 * which is protocol-relative and resolves to a *different* origin. Resolving against a base and
 * comparing origins gets that right without a special case, and gets `/\evil.com` right too.
 *
 * A rejected URL returns `null`. Every caller already treats `null` as "no preview available" and
 * renders a placeholder, so failing closed costs a feature rather than breaking a page.
 */
/**
 * The only schemes that may be navigated.
 *
 * `javascript:` and `data:` are the attack. `blob:` is excluded because a blob URL that arrives
 * from configuration or a server response was not minted by this document — the legitimate case is
 * an object URL created locally and bound directly, never one that travelled through a manifest or
 * a REST payload. `file:` has no meaning in a web origin.
 */
const NAVIGABLE_SCHEMES = new Set(['https:', 'http:']);
/**
 * The candidate if it is safe to navigate under `policy`, otherwise `null`.
 *
 * Returns the **original** string rather than the normalised `href`, so validating a URL never
 * silently changes which bytes get loaded. The check is the product here, not a rewrite.
 */
function navigableUrlOrNull(candidate, policy = {}) {
    if (typeof candidate !== 'string' || candidate.trim() === '')
        return null;
    // Reject anything the URL parser would silently rewrite, because this function returns the
    // ORIGINAL string. The WHATWG parser strips tabs, CR and LF anywhere in a URL and trims leading
    // and trailing C0/space, so `https://ok.example/\r\nX-Injected: 1` validates as
    // `https://ok.example/X-Injected:%201` while the value handed back still carries the raw CRLF.
    // The browser normalises again when it navigates, so this is not an injection into the iframe —
    // but validator and consumer disagreeing about which bytes were approved is precisely the gap a
    // validator exists to close, and any consumer that logs the string or hands it to a non-URL parser
    // sees the control characters. Rejecting is cheap; no legitimate endpoint contains them.
    // Checked by code point rather than with a regex: a character class spelling these out literally
    // trips `no-control-regex`, and the intent reads more plainly this way.
    //
    // Iterated with `for...of`, which walks code points. An indexed loop calling `codePointAt(i)`
    // does not: `length` and `i += 1` are both in UTF-16 code units, so an astral character is
    // visited twice — once whole, then again as its trailing surrogate. `https://ok.example/😀x`
    // yields `2f 1f600 de00 78` that way, versus `2f 1f600 78` here. No value tested for is a
    // surrogate, so neither form rejects differently today; the earlier version simply did not
    // avoid the code-unit trap its comment claimed to, which mattered only for a future reader
    // widening the range. Fixed rather than re-explained.
    for (const character of candidate) {
        const code = character.codePointAt(0);
        if (code !== undefined && (code <= 0x20 || code === 0x7f))
            return null;
    }
    let parsed;
    try {
        // A relative candidate needs a base; without one this throws and we reject, which is correct
        // for a caller that did not say what relative should mean.
        parsed = policy.base ? new URL(candidate, policy.base) : new URL(candidate);
    }
    catch {
        return null;
    }
    if (!NAVIGABLE_SCHEMES.has(parsed.protocol))
        return null;
    if (parsed.protocol === 'http:' && !policy.allowInsecure)
        return null;
    // Userinfo, rejected here and not only in `isNavigableBaseUrl`.
    //
    // `origin` excludes credentials: `new URL('https://user:pass@app.example/x').origin` is exactly
    // `'https://app.example'`, so the `allowedOrigins` check below cannot see them and a
    // credential-bearing URL passed a same-origin policy. This function returns the ORIGINAL string, so
    // what reached the iframe still carried `user:pass@` — written into `document.referrer` and history,
    // and the classic look-alike-host trick, since the part before `@` reads like the destination.
    //
    // `isNavigableBaseUrl` already rejected this, which meant the base validator was safe while the
    // general validator guarding both Category C bypasses was not. The repository rule is credentials
    // from the environment only, never in a URL.
    if (parsed.username !== '' || parsed.password !== '')
        return null;
    if (policy.allowedOrigins) {
        const allowed = policy.allowedOrigins
            .map((origin) => originOf(origin))
            .filter((origin) => origin !== null);
        // An allow-list that resolves to nothing must reject everything. Treating "no usable entries"
        // as "allow all" would turn a misconfiguration into an open redirect.
        if (!allowed.includes(parsed.origin))
            return null;
    }
    return candidate;
}
/**
 * The origin of `value`, or `null` if it is not an absolute URL.
 *
 * Note `origin` is the string `'null'` for an opaque origin (`javascript:`, `data:`), which is why
 * callers must not compare origins without also checking the scheme.
 */
function originOf(value) {
    if (typeof value !== 'string' || value.trim() === '')
        return null;
    try {
        const origin = new URL(value).origin;
        return origin === 'null' ? null : origin;
    }
    catch {
        return null;
    }
}
/**
 * Whether `value` is usable as the **base** of a URL this code will build parameters onto:
 * absolute, http(s), `https:` unless insecure is permitted, and carrying no query, fragment or
 * userinfo. A path is allowed — a viewer legitimately lives at `https://host/arender`.
 *
 * The last three exclusions are the point, and each is a defect this rejects rather than a
 * theoretical tidiness rule:
 *
 *   - **Query.** A caller appending `?url=…` to `https://host/app?tenant=x` produces
 *     `…?tenant=x/?url=…`, where the whole suffix is part of `tenant`'s *value*. There is no
 *     top-level `url` parameter, so the viewer receives no document.
 *   - **Fragment.** Everything after `#` stays in the browser and is never sent, so
 *     `https://host#frag` swallows the parameter entirely.
 *   - **A bare delimiter**, which is why the test is on the raw text and not on `parsed.search`
 *     and `parsed.hash`. `new URL('http://proxy/nuxeo?').search` is `''` and `.hash` is `''`, so a
 *     value ending in `?` or `#` passed a check whose whole purpose is to establish that appending
 *     to it is safe — and appending to it is exactly what breaks: `http://proxy/nuxeo?` plus
 *     `/nxfile/default/<uid>/file:content` is a URL whose path is only `/nuxeo`, with the nxfile
 *     path demoted to a query string. `#` is worse: the suffix becomes a fragment and never
 *     reaches the server at all. Both are silent — ARender fetches the wrong resource rather than
 *     failing. Rejecting the raw characters covers the non-empty cases too, since a base carrying
 *     a real query or fragment must contain the delimiter that introduces it. A percent-encoded
 *     `%3F` or `%23` is not a delimiter and is unaffected.
 *   - **Userinfo.** `https://user:pass@host` embeds a credential in a URL that gets navigated in
 *     an iframe and written into `document.referrer` and history. It is also the classic
 *     look-alike host trick, since the part before `@` reads like the destination.
 *
 * Callers that build parameters onto this base must still use `URL`/`searchParams` rather than
 * string concatenation; this check makes that safe, it does not make it unnecessary.
 */
function isNavigableBaseUrl(value, allowInsecure = false) {
    if (navigableUrlOrNull(value, { allowInsecure }) === null)
        return false;
    const raw = value;
    // The raw text, not `parsed.search`/`parsed.hash` — see the note on a bare delimiter above.
    if (raw.includes('?') || raw.includes('#'))
        return false;
    let parsed;
    try {
        parsed = new URL(raw);
    }
    catch {
        return false;
    }
    // Redundant since `navigableUrlOrNull` now rejects userinfo too, and kept deliberately: this file's
    // stated idiom is two independent checks for a privilege boundary, and a base URL is appended to
    // before navigation. Whichever runs first, the answer is the same.
    return parsed.username === '' && parsed.password === '';
}
/**
 * Whether a plaintext `http:` destination is acceptable given where this document is served from.
 *
 * `true` in dev mode, or when the application itself is on `http:`.
 *
 * ## Why this is a shared function rather than an inline expression
 *
 * An iframe is only a downgrade *relative to its host document*. Where the host is already plaintext
 * — an ordinary on-prem deployment — there is nothing to downgrade, and refusing `http:` there does
 * not add security, it silently removes the feature.
 *
 * That reasoning was written out at the preview-fallback site and applied only there. The two ARender
 * sites kept passing a bare `isDevMode()`, so ARender was silently disabled for exactly the
 * deployments the reasoning was about, while the repository documented the opposite policy. One
 * function means the next caller cannot get a different answer to the same question.
 *
 * This is **not** a licence for `http:` generally. It says "no worse than the host", which is why the
 * ARender viewer origin still gets `isNavigableBaseUrl` and the preview fallback still gets an origin
 * allow-list. Neither of those is replaced by this.
 */
function insecureAllowedForHost(isDevMode, 
// Injectable, and defaulted rather than read inline, so the policy can be tested without mutating
// `window.location` — jsdom refuses to redefine `protocol`, which is how a test for this ends up
// asserting nothing. Callers pass nothing and get the real host.
hostProtocol = typeof window === 'undefined' ? '' : (window.location?.protocol ?? '')) {
    return isDevMode || hostProtocol === 'http:';
}
/**
 * A media type without its parameters, lowercased — e.g. `TEXT/HTML; charset=utf-8` -> `text/html`.
 *
 * Shared because it guards three separate security decisions, and a normalisation that differs
 * between them is a bypass. A media type is case-insensitive and may carry parameters, so an equality
 * test or allow-list lookup written against the raw string is defeated by `TEXT/HTML` or
 * `application/pdf; version=1.7`.
 *
 * Used wherever a *served* `Content-Type` is compared before a `blob:` URL reaches an iframe — the
 * attachment preview dialog, `DocumentViewerComponent`, and the citation dialog. Those iframes are
 * same-origin with the application, so admitting an HTML-served blob is script execution in our
 * origin; see `PREVIEWABLE_TEXT_TYPES` for the full reasoning.
 */
function mediaTypeEssence(value) {
    return (value ?? '').split(';', 1)[0].trim().toLowerCase();
}

/**
 * ARender annotation viewer integration.
 *
 * **Every method must answer for an absent configuration.** `ARENDER_CONFIG` is `null` whenever
 * `integrations.arender` is not set in the Layer 0 bootstrap file, which is the default for every
 * deployment in this repository. Before the guards below existed, `null` produced a
 * `TypeError: Cannot read properties of null` in all three methods — and the reason nobody noticed
 * is worth keeping:
 *
 *   - `isAvailable` raised its `TypeError` *inside* an Observable subscriber, so RxJS converted it
 *     to an error notification, and `document-detail`'s `error:` handler set the URL to `null`.
 *     The UI therefore reached "Annotations are not available" — the right outcome, produced by a
 *     swallowed type error rather than by a decision.
 *   - `getPreviewerUrl` threw *synchronously*, which no `error:` handler can catch. It was
 *     unreachable only because `isAvailable` errored first and `switchMap` never ran.
 *
 * So the correct behaviour was one refactor away from an unhandled exception, and `typecheck`
 * could not see it: Angular types `useFactory` as `(...args: any[]) => any`, so a provider handing
 * `null` to a non-nullable token compiles clean.
 */
class ARenderService {
    rawCfg = inject(ARENDER_CONFIG);
    api = inject(NuxeoApiBase);
    /**
     * The configuration, or `null` if `viewerOrigin` is absent, blank, or **not safe to navigate**.
     *
     * This is the single choke point for ARender's trust decision, and it fails closed. Under NEV
     * 2026 only one field is load-bearing, so only one is checked. Three things disqualify a
     * configuration:
     *
     * **1. Absent.** `integrations.arender` defaults to `null`.
     *
     * **2. A blank `viewerOrigin`** — worse than `null`, because `fetch('')` resolves against the
     * *application's own* origin, so `isAvailable()` would report a viewer as present. It would also
     * allow-list this application's own origin in `framableOrNull`, which is the more dangerous half:
     * a same-origin URL in the response body would then be framed and trusted.
     *
     * **3. A `viewerOrigin` that is not an http(s) origin.** This is the one that matters most.
     * `viewerOrigin` is the allow-list deciding which origin may be bypassed and loaded into an
     * `iframe`, and the manifest it comes from is a *customer-editable* surface. A manifest setting
     * it to `javascript:alert(1)` is complete, non-blank and well-formed — `new URL()` accepts
     * `javascript:` without complaint — so nothing above catches it, and the result is script
     * execution in this application's origin from a configuration value. `https:` is required unless
     * `isDevMode()`, because a plaintext document in an iframe is a downgrade.
     *
     * Enforcing these here means no caller can reach a dangerous origin in the first place;
     * `framableOrNull` then checks the URL the server returns against this same origin, and the
     * bypass in `document-detail` validates once more before trusting, because defence for a
     * privilege boundary should not rest on one function.
     */
    get cfg() {
        const cfg = this.rawCfg;
        if (!cfg)
            return null;
        // Navigated in an iframe, and now also the origin allow-list for the URL the server returns
        // (see `framableOrNull`). `isNavigableBaseUrl` rather than a bare origin check: a value
        // carrying its own query, fragment or userinfo is a misconfiguration whether or not this code
        // still appends to it, and `origin` would silently discard all three while reporting a match.
        // `insecureAllowedForHost`, not a bare `isDevMode()`. An iframe is a downgrade only relative to
        // its host document, so refusing `http:` when the application is itself served over `http:` — an
        // ordinary on-prem deployment — silently disabled ARender for exactly those deployments without
        // making anything safer. The preview-fallback path in `document-detail` already reasoned this out
        // and applied it only there; this site kept the stricter check, so the repository documented one
        // policy and implemented another.
        if (!isNavigableBaseUrl(cfg.viewerOrigin, insecureAllowedForHost(isDevMode())))
            return null;
        // `nuxeoInternalUrl` is deliberately **not** checked. It is vestigial under NEV 2026: it
        // addressed the ARender 2023 stack, where the client encoded an nxfile URL for the nginx
        // sidecar to fetch with a shared Basic credential. NEV's connector resolves blobs itself from
        // `documentId` over OAuth2, so nothing here reads it.
        //
        // An earlier version of this change kept validating it, which review correctly called out as a
        // trap: a deployment that had retired the sidecar would have to keep a dummy valid URL or the
        // whole integration silently disabled itself. Validating a field nothing consumes can only
        // reject configurations that would have worked. The field itself stays because removing it is a
        // breaking change to the published `AppARenderConfig`.
        return cfg;
    }
    /**
     * The server-built previewer URL if it is safe to frame, otherwise `null`.
     *
     * This is the new point of trust, and it is stricter than what it replaces. The URL no longer
     * comes from configuration this code concatenated — it arrives in an **HTTP response body** and
     * is then bypassed into an `iframe`, so it is attacker-controlled the moment the Nuxeo server is.
     *
     * `allowedOrigins: [viewerOrigin]` is therefore load-bearing rather than belt-and-braces. The
     * previous implementation validated only the scheme, and
     * `docs/sonarcloud-security-remediation-plan.md` records that missing origin check as an
     * accepted residual risk on the Category C bypass. Since `viewerOrigin` is no longer needed to
     * *build* anything, it can pay for itself as the allow-list instead, which closes that gap.
     *
     * Note `origin` discards any path: a `viewerOrigin` of `https://host/arender` allow-lists the
     * whole of `https://host`, not just `/arender`. `isNavigableBaseUrl` in `cfg` already refuses a
     * query, fragment or userinfo on that value, so the widening is limited to the path — acceptable,
     * because a viewer sharing a host with something untrusted is not a deployment we support.
     */
    framableOrNull(url, cfg) {
        return navigableUrlOrNull(url, {
            allowInsecure: insecureAllowedForHost(isDevMode()),
            allowedOrigins: [cfg.viewerOrigin],
        });
    }
    /**
     * The previewer URL for one document, from the `nuxeo-arender` addon.
     *
     * Asks Nuxeo rather than building the URL here, because **the client cannot build it.** NEV's
     * `BlobNuxeoURLParser.canParse` claims a request only when it carries a `documentId` parameter,
     * whose value is `<repository>,<uid>,<xpath>,<digest>` — and the blob digest is not something a
     * browser can compute. Concatenating `?url=<nxfile-url>` instead, as this method used to, is the
     * 2023 generic-ARender contract: NEV 2026 leaves it unparsed and renders
     * "An error occured / Could not open document".
     *
     * The viewer host comes from the server too, via `arender.server.previewer.host` in `nuxeo.conf`.
     * That retires `nuxeoInternalUrl` and the nginx sidecar that used to inject a **single shared**
     * Basic credential on every user's behalf: NEV fetches blobs itself over OAuth2 as the signed-in
     * user, so Nuxeo's per-user ACLs finally apply to the viewer.
     *
     * Answers `null` when ARender is unconfigured, when the operation fails, or when the URL it
     * returns is not framable — all of which the caller already treats as "no annotation viewer for
     * this document".
     */
    getPreviewerUrl(docUid, blobXPath = 'file:content') {
        const cfg = this.cfg;
        if (!cfg)
            return of(null);
        return this.api
            .post('/nuxeo/api/v1/automation/Document.ARenderGetPreviewerUrl', { input: docUid, params: { blobXPath } })
            .pipe(map$1((response) => this.framableOrNull(response?.previewerUrl, cfg)), 
        // The addon is absent on any server without the `nuxeo-arender` package, which answers 404
        // rather than an empty body. That is a deployment state, not a defect, and it must degrade
        // to "Annotations are not available" exactly as an unconfigured integration does.
        catchError$1(() => of(null)));
    }
    /**
     * The side-by-side comparison URL for two documents.
     *
     * Same reasoning as `getPreviewerUrl`: the server appends a second `documentId` and
     * `visualization.multiView.doComparison=true`, neither of which the client can assemble without
     * both digests.
     */
    getDiffUrl(leftDocUid, rightDocUid) {
        const cfg = this.cfg;
        if (!cfg)
            return of(null);
        return this.api
            .post('/nuxeo/api/v1/automation/Document.ARenderGetDiffUrl', {
            params: { leftDocId: leftDocUid, rightDocId: rightDocUid },
        })
            .pipe(map$1((response) => this.framableOrNull(response?.previewerUrl, cfg)), catchError$1(() => of(null)));
    }
    /**
     * Checks whether ARender is reachable. Uses a `no-cors` fetch to avoid CORS blocks — the promise
     * resolves for any server response and rejects only on a network error (server unreachable).
     *
     * Answers `false` without probing anything when ARender is not configured. Not probing matters:
     * `fetch(undefined)` resolves against the *application's own* origin, which would report a
     * viewer as present when none is deployed.
     */
    isAvailable() {
        const cfg = this.cfg;
        if (!cfg)
            return of(false);
        return new Observable((subscriber) => {
            fetch(cfg.viewerOrigin, { mode: 'no-cors' })
                .then(() => {
                subscriber.next(true);
                subscriber.complete();
            })
                .catch(() => {
                subscriber.next(false);
                subscriber.complete();
            });
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ARenderService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ARenderService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ARenderService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/** True when an ACE principal matches a logical user or group id (with optional prefixes). */
function matchesPrincipal(aceUsername, logicalPrincipal) {
    if (aceUsername === logicalPrincipal)
        return true;
    if (aceUsername === `user:${logicalPrincipal}`)
        return true;
    if (aceUsername === `group:${logicalPrincipal}`)
        return true;
    return aceUsername.replace(/^(user:|group:)/, '') === logicalPrincipal;
}

/** Formats ACE begin/end timestamps for permission tables. */
function formatPermissionTimeFrame(begin, end, 
// A free function has no injector, so the caller passes the resolver. REQUIRED, not defaulted.
//
// The default used to be `() => 'Permanent'`, which ignores the key and returns that literal for
// whatever it is asked — and its comment said this "keeps the English so a caller that has not
// been updated still reads sensibly". Three callers were never updated, so three permission
// tables rendered `Permanent` in every locale. That rationalisation is the same one that let
// `toDataColumns`, `hxpRelativeTime` and `trash-confirm.utils` ship untranslated: a default
// producing the untranslated answer turns every forgotten call site into a silent no-op, where a
// required parameter turns it into a compile error.
translate, 
// Required for the same reason `translate` is: the Intl date methods, called with no locale
// argument, read the host's locale rather than the one the user picked in the app, so the two
// disagree whenever they differ. A default here would reintroduce exactly that silent mismatch.
//
// Deliberately describes the call rather than spelling it out: `docs/i18n-status.md` and
// `CHANGELOG.md` both advertise a grep for the argument-less form that "must stay empty", and a
// comment containing that expression is a hit, which makes the advertised check unusable.
locale) {
    if (!begin && !end) {
        return translate('permissions.time-frame.permanent');
    }
    const beginLabel = begin ? formatAceInstant(begin, locale) : '—';
    const endLabel = end ? formatAceInstant(end, locale) : '—';
    return `${beginLabel} – ${endLabel}`;
}
/**
 * `timeZone: 'UTC'` is load-bearing, not tidiness.
 *
 * The permission dialogs emit these boundaries as a date-only `YYYY-MM-DD` built from the
 * picker's **local** calendar date (`add-permission-dialog.ts`, `update-permission-dialog.ts`,
 * `share-external-dialog.ts` all do `${y}-${m}-${day}`). `new Date('2026-07-01')` parses that as
 * UTC midnight, so formatting it in a host zone west of UTC renders the day before: a user in Los
 * Angeles picks 1 July, saves, and the table reads 30 June. Formatting in UTC makes the calendar
 * date the user chose round-trip, and the locale still decides the ordering and the month name.
 *
 * `formatCompareDate` in `document-compare.utils.ts` already did this; these two did not, which is
 * the inconsistency rather than the rule.
 */
function formatAceInstant(iso, locale) {
    return new Date(iso).toLocaleString(locale, { timeZone: 'UTC' });
}
/**
 * Formats an ACE date range for the permissions tab of a document, collection or browse page.
 *
 * Those three pages each carried their own copy of this, and all three copies made the same two
 * mistakes: a hardcoded `'en-US'`, and English connectives built by interpolation — `Until ${x}`,
 * `from ${x}`, `to ${y}`. The interpolation is the worse of the two, because no catalogue entry
 * exists for a string assembled at runtime, so no translation could have reached it. The
 * `permissions.time-frame.*` keys this uses were already in `en.json` and already REUSED —
 * `share-saved-search-dialog.component.ts` resolves all four in its own `toTimeFrameLabel`, with
 * the identical four-shape branching. So this is the fourth copy of that shape selection, not the
 * first consumer of a dormant catalogue path.
 *
 * That dialog must NOT be converted to call this function, and the reason is two lines above its
 * copy: `parseTimeFrame` splits a stored label on `' - '`, the `range` key's own separator, so the
 * dialog round-trips its own output. It passes `begin`/`end` through unformatted on purpose.
 * Formatting them here would produce `Jul 01, 2026`, which that parser cannot read back.
 *
 * Distinct keys per shape rather than joining parts: a language that puts the preposition after the
 * date, or inflects it, cannot be served by concatenating `from` and `to` fragments.
 */
function formatAceDateRange(begin, end, translate, locale) {
    if (!begin && !end) {
        return translate('permissions.time-frame.permanent');
    }
    // `timeZone: 'UTC'` for the reason given on `formatAceInstant` above: these are calendar dates
    // the user picked, not instants, and formatting them in the host zone moves the day west of UTC.
    const fmt = (iso) => new Date(iso).toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    });
    if (begin && end) {
        return translate('permissions.time-frame.range', { begin: fmt(begin), end: fmt(end) });
    }
    if (end) {
        return translate('permissions.time-frame.until', { end: fmt(end) });
    }
    return translate('permissions.time-frame.from', { begin: fmt(begin) });
}

class SettingsService {
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
            .pipe(map$1((res) => {
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
        }).pipe(map$1(({ providers, tokens }) => {
            const providersByName = new Map(providers.entries.map((provider) => [provider.serviceName, provider]));
            return tokens.entries.map((token) => this.toConnectedAccount(token, providersByName));
        }));
    }
    getAuthorizedApplications() {
        return this.api
            .get('/nuxeo/api/v1/oauth2/token/client', undefined, {
            properties: '*',
        })
            .pipe(map$1((tokens) => tokens.entries.map((token) => this.toAuthorizedApplication(token))));
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
            .pipe(map$1((response) => (response.entries ?? []).map((entry) => ({
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: SettingsService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: SettingsService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: SettingsService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/**
 * Nuxeo's content model, read from `/config/types`, `/config/facets` and `/config/schemas`.
 *
 * The model is **server-side configuration**, not data: it changes only when a package is
 * installed or a studio project deployed, never in response to anything a user does. So the
 * three reads are cached for the lifetime of the application rather than re-fetched. That is
 * not an optimisation — `MODEL` is consumed by an upstream service that builds its observable
 * in a constructor, and re-fetching on every subscription would issue three requests per
 * metadata panel open.
 *
 * Read-only on purpose. Nuxeo does not expose a write path for the content model over REST at
 * all, so there is no `set` counterpart to omit.
 */
class ContentModelService {
    api = inject(NuxeoApiBase);
    /**
     * `shareReplay({ refCount: false })` so the cache survives every subscriber unsubscribing.
     * With `refCount: true` the panel closing would discard it and the next open would refetch.
     */
    model$ = forkJoin({
        types: this.api.get('/nuxeo/api/v1/config/types'),
        facets: this.api.get('/nuxeo/api/v1/config/facets'),
        schemas: this.api.get('/nuxeo/api/v1/config/schemas'),
    }).pipe(map$1(({ types, facets, schemas }) => ({
        doctypes: types?.doctypes ?? {},
        // Defensive rather than decorative: these three endpoints are unauthenticated-adjacent
        // config reads that a locked-down instance can answer with an empty body, and an
        // undefined here becomes a crash inside upstream's `DocumentModel` rather than an empty
        // property list.
        facets: Array.isArray(facets) ? facets : [],
        schemas: Array.isArray(schemas) ? schemas : [],
    })), shareReplay({ bufferSize: 1, refCount: false }));
    getContentModel() {
        return this.model$;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ContentModelService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ContentModelService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ContentModelService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class AdministrationService {
    api = inject(NuxeoApiBase);
    http = inject(HttpClient);
    /**
     * NXQL search with paging and optional extra headers (e.g. file schema for size).
     */
    nxqlSearch(query, pageSize, currentPageIndex = 0, headers = { properties: 'dublincore,file' }) {
        const params = new HttpParams()
            .set('query', query)
            .set('pageSize', String(pageSize))
            .set('currentPageIndex', String(currentPageIndex));
        return this.http.get(this.api.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'), {
            params,
            headers,
        });
    }
    /** Total documents matching the query (uses list metadata). */
    getNxqlTotalSize(query) {
        return this.nxqlSearch(query, 1, 0).pipe(map$1((r) => r.totalSize ?? r.entries?.length ?? 0));
    }
    /**
     * Repository-wide audit via automation. Falls back to domain document audit if unavailable.
     */
    searchAuditLogs(params) {
        const named = {};
        if (params.principalName)
            named['principalName'] = params.principalName;
        if (params.from)
            named['startDate'] = params.from;
        if (params.to)
            named['endDate'] = params.to;
        if (params.eventIds?.length)
            named['eventIds'] = params.eventIds;
        if (params.category)
            named['eventCategory'] = params.category;
        // `AUDIT_SEARCH` is not registered on Nuxeo: the server answers 500 with "Could not resolve
        // page provider with name 'AUDIT_SEARCH'", so every call here fell straight through to
        // `auditFallback`, which only sees eleven documents. `AUDIT_BROWSER` resolves and covers the
        // whole repository.
        //
        // It does not honour `namedParameters` in any spelling — plain, `auditParams:`-prefixed and
        // `defaults:`-prefixed were each measured returning the full unfiltered page for a bogus
        // principal, a bogus event id and a future start date. Sending filters to it would answer 200
        // with every row while the UI showed the filter applied, which is a worse failure than the 500
        // it replaces. So a filtered query stays on the fallback, which filters client-side and is
        // what has actually served this page all along. `sortBy`, `sortOrder` and paging are honoured,
        // which is what makes the unfiltered path worth taking.
        if (Object.keys(named).length > 0) {
            return this.auditFallback(params, named);
        }
        const automationParams = {
            providerName: 'AUDIT_BROWSER',
            currentPageIndex: params.currentPageIndex,
            pageSize: params.pageSize,
            sortBy: 'eventDate',
            sortOrder: 'desc',
        };
        return this.http
            .post(this.api.apiUrl('/nuxeo/api/v1/automation/Audit.QueryWithPageProvider'), { params: automationParams, context: {} }, { headers: { 'Content-Type': 'application/json' } })
            .pipe(map$1((raw) => this.normalizeAuditResponse(raw)), catchError$1(() => this.auditFallback(params, named)));
    }
    /**
     * Fallback: fetch audit from multiple well-known documents, merge, deduplicate,
     * apply client-side filters, and paginate.
     */
    auditFallback(params, _named) {
        const batchSize = 500;
        return this.http.get(this.api.apiUrl('/nuxeo/api/v1/path/default-domain')).pipe(switchMap$1((doc) => {
            const domainUid = doc.uid;
            const auditUrl = (uid) => this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@audit`);
            const auditParams = new HttpParams()
                .set('pageSize', String(batchSize))
                .set('currentPageIndex', '0');
            return forkJoin([
                this.http
                    .get(auditUrl(domainUid), { params: auditParams })
                    .pipe(catchError$1(() => of({ entries: [] }))),
                this.nxqlSearch("SELECT * FROM Document WHERE ecm:mixinType != 'HiddenInNavigation' AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0 ORDER BY dc:modified DESC", 10, 0).pipe(switchMap$1((docs) => {
                    const uids = (docs.entries ?? []).map((d) => d.uid).filter(Boolean);
                    if (!uids.length)
                        return of([]);
                    return forkJoin(uids.map((uid) => this.http
                        .get(auditUrl(uid), { params: auditParams })
                        .pipe(catchError$1(() => of({ entries: [] })))));
                }), catchError$1(() => of([]))),
            ]);
        }), map$1(([domainRaw, docRawList]) => {
            const domainEntries = this.normalizeAuditResponse(domainRaw).entries ?? [];
            const docEntries = docRawList.flatMap((raw) => this.normalizeAuditResponse(raw).entries ?? []);
            const seen = new Set();
            const merged = [];
            for (const e of [...docEntries, ...domainEntries]) {
                if (!seen.has(e.id)) {
                    seen.add(e.id);
                    merged.push(e);
                }
            }
            let filtered = merged;
            if (params.principalName) {
                const p = params.principalName.toLowerCase();
                filtered = filtered.filter((e) => e.principalName?.toLowerCase().includes(p));
            }
            if (params.eventIds?.length) {
                const ids = new Set(params.eventIds);
                filtered = filtered.filter((e) => ids.has(e.eventId));
            }
            if (params.category) {
                filtered = filtered.filter((e) => e.category === params.category);
            }
            if (params.from) {
                const fromMs = new Date(params.from).getTime();
                filtered = filtered.filter((e) => new Date(e.eventDate).getTime() >= fromMs);
            }
            if (params.to) {
                const toMs = new Date(params.to).getTime();
                filtered = filtered.filter((e) => new Date(e.eventDate).getTime() <= toMs);
            }
            filtered.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
            const start = params.currentPageIndex * params.pageSize;
            const page = filtered.slice(start, start + params.pageSize);
            return {
                entries: page,
                totalSize: filtered.length,
                currentPageSize: page.length,
                currentPageIndex: params.currentPageIndex,
                numberOfPages: Math.ceil(filtered.length / params.pageSize),
            };
        }), catchError$1(() => of({
            entries: [],
            totalSize: 0,
            currentPageSize: 0,
            currentPageIndex: 0,
            numberOfPages: 0,
        })));
    }
    normalizeAuditResponse(raw) {
        if (raw && typeof raw === 'object' && 'entries' in raw) {
            return this.withTotalSize(raw);
        }
        if (raw && typeof raw === 'object' && 'value' in raw) {
            const v = raw.value;
            if (v && typeof v === 'object' && 'entries' in v) {
                return this.withTotalSize(v);
            }
        }
        return {
            entries: [],
            totalSize: 0,
            currentPageSize: 0,
            currentPageIndex: 0,
            numberOfPages: 0,
        };
    }
    /**
     * `Audit.QueryWithPageProvider` reports the match count as `resultsCount` and omits `totalSize`,
     * which is the field the audit page reads. Left unmapped, the pager takes the page length as the
     * total and offers one page over 10,000 entries.
     */
    withTotalSize(list) {
        if (typeof list.totalSize === 'number') {
            return list;
        }
        return { ...list, totalSize: list.resultsCount ?? list.entries?.length ?? 0 };
    }
    listOAuth2Providers() {
        return this.http
            .get(this.api.apiUrl('/nuxeo/api/v1/oauth2/provider'))
            .pipe(map$1((res) => (Array.isArray(res) ? res : (res.entries ?? []))), catchError$1(() => of([])));
    }
    /**
     * Tries to discover directory names from the Nuxeo registry; falls back to {@link FALLBACK_DIRECTORY_NAMES}.
     */
    listDirectoryNames() {
        return this.http
            .get(this.api.apiUrl('/nuxeo/api/v1/directory'))
            .pipe(map$1((res) => {
            if (Array.isArray(res)) {
                const names = res
                    .map((row) => (typeof row === 'string' ? row : row.name))
                    .filter((name) => !!name);
                if (names.length)
                    return names;
            }
            if (!Array.isArray(res) && res.entries?.length) {
                return res.entries.map((e) => e.name).filter(Boolean);
            }
            if (!Array.isArray(res) && res.directoryNames?.length)
                return res.directoryNames;
            return [...FALLBACK_DIRECTORY_NAMES];
        }), catchError$1(() => of([...FALLBACK_DIRECTORY_NAMES])));
    }
    getDefaultDomainPath() {
        return this.http
            .get(this.api.apiUrl('/nuxeo/api/v1/path/default-domain'))
            .pipe(map$1((d) => d.path ?? '/default-domain'));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: AdministrationService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: AdministrationService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: AdministrationService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

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
class PrincipalPermissionsService {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: PrincipalPermissionsService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: PrincipalPermissionsService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: PrincipalPermissionsService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class TrashService {
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
            .pipe(map$1((res) => ({
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
            .pipe(map$1((res) => ({
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
            .pipe(map$1((res) => (res.entries ?? []).map((entry) => ({
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: TrashService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: TrashService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: TrashService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

const EMPTY_FILTERS = { fullText: '', path: '/', author: '', sizeRanges: [] };
class TrashFilterService {
    filters = signal({ ...EMPTY_FILTERS }, ...(ngDevMode ? [{ debugName: "filters", equal: () => false }] : [{ equal: () => false }]));
    layoutMode = signal('filters', ...(ngDevMode ? [{ debugName: "layoutMode" }] : []));
    results = signal([], ...(ngDevMode ? [{ debugName: "results" }] : []));
    resultThumbnails = signal({}, ...(ngDevMode ? [{ debugName: "resultThumbnails" }] : []));
    totalResults = signal(0, ...(ngDevMode ? [{ debugName: "totalResults" }] : []));
    resultsLoading = signal(false, ...(ngDevMode ? [{ debugName: "resultsLoading" }] : []));
    savedSearchVersion = signal(0, ...(ngDevMode ? [{ debugName: "savedSearchVersion" }] : []));
    activeSavedFilterUid = signal(null, ...(ngDevMode ? [{ debugName: "activeSavedFilterUid" }] : []));
    activeSavedFilterTitle = signal(null, ...(ngDevMode ? [{ debugName: "activeSavedFilterTitle" }] : []));
    hasSavedFilter = computed(() => this.activeSavedFilterUid() !== null, ...(ngDevMode ? [{ debugName: "hasSavedFilter" }] : []));
    reset() {
        this.filters.set({ ...EMPTY_FILTERS });
        this.activeSavedFilterUid.set(null);
        this.activeSavedFilterTitle.set(null);
    }
    toggleLayout() {
        this.layoutMode.update((m) => (m === 'filters' ? 'results' : 'filters'));
    }
    markSavedSearchDirty() {
        this.savedSearchVersion.update((v) => v + 1);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: TrashFilterService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: TrashFilterService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: TrashFilterService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/** Catalogue keys for the document types the packaged application knows about. */
const DOC_TYPE_LABEL_KEYS = {
    Audio: 'doc-type.audio',
    Collection: 'doc-type.collection',
    File: 'doc-type.file',
    Folder: 'doc-type.folder',
    Note: 'doc-type.note',
    OrderedFolder: 'doc-type.ordered-folder',
    Picture: 'doc-type.picture',
    Video: 'doc-type.video',
    Workspace: 'doc-type.workspace',
    Section: 'doc-type.section',
    SectionRoot: 'doc-type.section-root',
    TemplateRoot: 'doc-type.template-root',
    Domain: 'doc-type.domain',
    WorkspaceRoot: 'doc-type.workspace-root',
    Root: 'doc-type.root',
};
/**
 * The display name of a Nuxeo document type.
 *
 * A known type resolves through the catalogue. A type a customer has added has no key, so its
 * own name is shown with the camel case split (`InvoiceRecord` → `Invoice Record`) — it can never
 * render as a raw `doc-type.*` key. The same fallback applies when the catalogue has not loaded
 * and `translate` hands the key back unchanged.
 */
function docTypeLabel(type, translate) {
    const key = DOC_TYPE_LABEL_KEYS[type];
    if (key) {
        const resolved = translate(key);
        if (resolved && resolved !== key)
            return resolved;
    }
    return type.replace(/([a-z])([A-Z])/g, '$1 $2');
}

/**
 * `{{ doc.type | docTypeLabel }}` — the translated name of a document type, or the type's own name
 * for a custom type the catalogue does not know.
 *
 * Impure for the same reason as `TranslatePipe`: `translate.instant` is not reactive, so a pure
 * pipe would keep the language that was active when it first ran.
 */
class DocTypeLabelPipe {
    translate = inject(TranslateService);
    transform(type) {
        if (!type)
            return '';
        return docTypeLabel(type, (key) => this.translate.instant(key));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DocTypeLabelPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "20.3.33", ngImport: i0, type: DocTypeLabelPipe, isStandalone: true, name: "docTypeLabel", pure: false });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DocTypeLabelPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'docTypeLabel',
                    standalone: true,
                    pure: false,
                }]
        }] });

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
/**
 * The distance to a task's due date, floored to whole days, then whole hours.
 *
 * Shared by the Tasks page and the navigation drawer, which word it differently ("Due in 3 days" /
 * "in 3 days") and so each choose their own catalogue key from the result.
 */
function taskDueDistance(dueDate, now = Date.now()) {
    const diff = new Date(dueDate).getTime() - now;
    const absDiff = Math.abs(diff);
    const days = Math.floor(absDiff / DAY_MS);
    const hours = Math.floor(absDiff / HOUR_MS);
    const due = diff > 0;
    if (days >= 1)
        return { due, unit: 'days', count: days };
    if (hours <= 1)
        return { due, unit: 'under-two-hours', count: hours };
    return { due, unit: 'hours', count: hours };
}

const AVATAR_PALETTE = [
    'purple',
    'blue',
    'pink',
    'teal',
    'yellow',
    'green',
    'red',
    'orange',
];
/**
 * Deterministic color for a username so the same user always gets
 * the same avatar color across the application.
 */
function avatarColor(name) {
    if (!name)
        return 'blue';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

const FOLDERISH_TYPES = new Set([
    'Domain',
    'Folder',
    'OrderedFolder',
    'Workspace',
    'WorkspaceRoot',
    'SectionRoot',
    'Section',
    'TemplateRoot',
]);

/** Nuxeo permission to add/edit/delete document ACL entries (Nuxeo Web UI pattern). */
const WRITE_SECURITY = 'WriteSecurity';
/** Legacy compound permission that also grants ACL management on some deployments. */
const MANAGE_DOCUMENT_PERMISSIONS = 'Everything';
/** Atomic permissions returned by the Nuxeo `permissions` document enricher. */
const READ_DOCUMENT = 'Read';
const WRITE_DOCUMENT = 'Write';
/** Nuxeo Web UI uses WriteProperties for note/metadata edit actions. */
const WRITE_PROPERTIES = 'WriteProperties';
const READ_WRITE_DOCUMENT = 'ReadWrite';
const ADD_CHILDREN = 'AddChildren';
const REMOVE_DOCUMENT = 'Remove';
/**
 * The catalogue KEY for the permission-denied message, not the message.
 *
 * This was the English sentence, exported and used directly at nine call sites, so every one of them
 * rendered English whatever the locale — and no gate could see it, because a bare constant is not a
 * sink. Exporting the key instead means a caller has to resolve it, which is a compile-time nudge
 * toward the resolver rather than a silent literal.
 */
const PERMISSION_DENIED_KEY = 'common.permission-denied';
function hasDocumentPermission(doc, permission) {
    const permissions = doc?.contextParameters?.['permissions'];
    return Array.isArray(permissions) && permissions.includes(permission);
}
/** True when the document response includes the `permissions` enricher. */
function hasDocumentPermissionsEnricher(doc) {
    return Array.isArray(doc?.contextParameters?.['permissions']);
}
/** Show write actions when permissions are unknown or Write/WriteProperties is granted. */
function canShowWriteDocumentAction(doc) {
    if (!doc)
        return false;
    if (!hasDocumentPermissionsEnricher(doc))
        return true;
    return canWriteDocument(doc);
}
/** Show remove actions when permissions are unknown or Remove is granted. */
function canShowRemoveDocumentAction(doc) {
    if (!doc)
        return false;
    if (!hasDocumentPermissionsEnricher(doc))
        return true;
    return canRemoveDocument(doc);
}
/** True when the current user can manage ACL entries on the document. */
function canManageDocumentPermissions(doc) {
    return (hasDocumentPermission(doc, WRITE_SECURITY) ||
        hasDocumentPermission(doc, MANAGE_DOCUMENT_PERMISSIONS));
}
/** True when the current user can edit content, create versions, lock, etc. */
function canWriteDocument(doc) {
    return hasDocumentPermission(doc, WRITE_DOCUMENT) || hasDocumentPermission(doc, WRITE_PROPERTIES);
}
/**
 * Web UI's `isTaggable`: the document itself, not a proxy or a version, and the user holds Write.
 * Nuxeo accepts a tag from a reader too, but Web UI does not offer it, and only a user with Write
 * may take a tag off.
 */
function canTagDocument(doc) {
    return !!doc && !doc.isProxy && !doc.isVersion && hasDocumentPermission(doc, WRITE_DOCUMENT);
}
/** The permission Nuxeo checks to create, restore and publish versions. */
const WRITE_VERSION = 'WriteVersion';
/**
 * Nuxeo flags a record with the `isRecord` field of the document JSON — there is no facet for it.
 * The public `NuxeoDocument` model does not declare the field, so it is read here rather than
 * added to that published type.
 */
function isRecordDocument(doc) {
    return (doc?.isRecord === true);
}
/**
 * Web UI's Create Version gate (`nuxeo-document-create-version`): the live document, not a version,
 * a publication or a record, with the `Versionable` facet, and the user holds `WriteVersion`. A
 * publication keeps its source's facet and permissions but has no versions of its own, which is
 * why Web UI shows it no versions control at all.
 */
function canCreateDocumentVersion(doc) {
    return (!!doc &&
        !doc.isVersion &&
        !doc.isProxy &&
        !isRecordDocument(doc) &&
        (doc.facets ?? []).includes('Versionable') &&
        hasDocumentPermission(doc, WRITE_VERSION));
}
/**
 * Web UI's `isPublishable`: not a proxy, a record or in the trash, the `Publishable` facet, and
 * `WriteVersion`. A version is publishable — `Document.PublishToSection` publishes it as it is.
 * Without an `isTrashed` flag, Web UI reads the `deleted` life-cycle state as the trash.
 */
function canPublishDocument(doc) {
    return (!!doc &&
        !doc.isProxy &&
        !isRecordDocument(doc) &&
        !(doc.isTrashed ?? doc.state === 'deleted') &&
        (doc.facets ?? []).includes('Publishable') &&
        hasDocumentPermission(doc, WRITE_VERSION));
}
/** True when the current user can create child documents in a folder. */
function canAddChildren(doc) {
    return hasDocumentPermission(doc, ADD_CHILDREN);
}
/** True when the current user can trash or permanently delete the document. */
function canRemoveDocument(doc) {
    return hasDocumentPermission(doc, REMOVE_DOCUMENT);
}
/** True when the current user can view document audit/history (Classic Web UI parity). */
function canViewDocumentAuditLog(doc) {
    return hasDocumentPermission(doc, READ_DOCUMENT);
}
/** True when an HTTP error indicates the server rejected the action for lack of permission. */
function isPermissionDeniedError(err) {
    const status = err?.status;
    return status === 401 || status === 403;
}

const prop = (name) => (doc) => doc.properties[name];
/** Sections whose fields are always shown in the default (diff) view. */
const ALWAYS_VISIBLE_SECTIONS = new Set(['uid', 'common']);
const UID_COMPARE_FIELDS = [
    { key: 'uid', label: 'uid', read: (doc) => doc.uid },
    { key: 'uid:major_version', label: 'major_version', read: prop('uid:major_version') },
    { key: 'uid:minor_version', label: 'minor_version', read: prop('uid:minor_version') },
];
const COMMON_COMPARE_FIELDS = [
    { key: 'common:icon-expanded', label: 'icon-expanded', read: prop('common:icon-expanded') },
    { key: 'common:icon', label: 'icon', read: prop('common:icon') },
];
/** Default compare view — uid/common always visible; dublincore diffs only. */
const DIFF_COMPARE_SECTIONS = [
    {
        id: 'uid',
        label: 'uid',
        fields: UID_COMPARE_FIELDS,
    },
    {
        id: 'common',
        label: 'common',
        fields: COMMON_COMPARE_FIELDS,
    },
    {
        id: 'dublincore',
        label: 'dublincore',
        fields: [
            { key: 'dc:coverage', label: 'coverage', read: prop('dc:coverage') },
            {
                key: 'dc:modified',
                label: 'modified',
                read: (doc) => doc.properties['dc:modified'] ?? doc.lastModified,
                format: formatCompareDate,
            },
            { key: 'dc:expired', label: 'expired', read: prop('dc:expired'), format: formatCompareDate },
            { key: 'dc:created', label: 'created', read: prop('dc:created'), format: formatCompareDate },
            {
                key: 'dc:title',
                label: 'title',
                read: (doc) => doc.properties['dc:title'] ?? doc.title,
            },
            { key: 'dc:nature', label: 'nature', read: prop('dc:nature') },
            {
                key: 'dc:subjects',
                label: 'subjects',
                read: prop('dc:subjects'),
                format: formatCompareSubjects,
            },
        ],
    },
];
/** View all data — full Web UI schema field list. */
const FULL_COMPARE_SECTIONS = [
    {
        id: 'uid',
        label: 'uid',
        fields: UID_COMPARE_FIELDS,
    },
    {
        id: 'common',
        label: 'common',
        fields: COMMON_COMPARE_FIELDS,
    },
    {
        id: 'dublincore',
        label: 'dublincore',
        fields: [
            { key: 'dc:description', label: 'description', read: prop('dc:description') },
            { key: 'dc:language', label: 'language', read: prop('dc:language') },
            { key: 'dc:coverage', label: 'coverage', read: prop('dc:coverage') },
            { key: 'dc:valid', label: 'valid', read: prop('dc:valid'), format: formatCompareDate },
            { key: 'dc:creator', label: 'creator', read: prop('dc:creator'), format: formatCompareUser },
            {
                key: 'dc:modified',
                label: 'modified',
                read: (doc) => doc.properties['dc:modified'] ?? doc.lastModified,
                format: formatCompareDate,
            },
            {
                key: 'dc:lastContributor',
                label: 'lastContributor',
                read: prop('dc:lastContributor'),
                format: formatCompareUser,
            },
            { key: 'dc:rights', label: 'rights', read: prop('dc:rights') },
            { key: 'dc:expired', label: 'expired', read: prop('dc:expired'), format: formatCompareDate },
            { key: 'dc:format', label: 'format', read: prop('dc:format') },
            { key: 'dc:created', label: 'created', read: prop('dc:created'), format: formatCompareDate },
            {
                key: 'dc:title',
                label: 'title',
                read: (doc) => doc.properties['dc:title'] ?? doc.title,
            },
            { key: 'dc:issued', label: 'issued', read: prop('dc:issued'), format: formatCompareDate },
            { key: 'dc:nature', label: 'nature', read: prop('dc:nature') },
            {
                key: 'dc:subjects',
                label: 'subjects',
                read: prop('dc:subjects'),
                format: formatCompareSubjects,
            },
            {
                key: 'dc:contributors',
                label: 'contributors',
                read: prop('dc:contributors'),
                format: formatCompareUserList,
            },
            { key: 'dc:source', label: 'source', read: prop('dc:source') },
            { key: 'dc:publisher', label: 'publisher', read: prop('dc:publisher') },
        ],
    },
    {
        id: 'relatedtext',
        label: 'relatedtext',
        fields: [
            {
                key: 'relatedtext:relatedtextresources',
                label: 'relatedtextresources',
                read: prop('relatedtext:relatedtextresources'),
            },
        ],
    },
    {
        id: 'facetedTag',
        label: 'facetedTag',
        fields: [
            {
                key: 'facetedTag:tags',
                label: 'tags',
                read: (doc) => doc.properties['facetedTag:tags'] ?? doc.properties['nxtag:tags'],
                format: formatCompareTags,
            },
        ],
    },
];
function formatCompareDate(value, locale) {
    if (value === null || value === undefined || value === '')
        return '';
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime()))
        return String(value);
    return date.toLocaleDateString(locale, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    });
}
function formatCompareUser(value) {
    if (value === null || value === undefined || value === '')
        return '';
    if (typeof value === 'string')
        return value;
    if (typeof value === 'object' && value !== null) {
        const record = value;
        if (typeof record['properties'] === 'object' && record['properties'] !== null) {
            const props = record['properties'];
            if (typeof props['username'] === 'string')
                return props['username'];
            if (typeof props['firstName'] === 'string' || typeof props['lastName'] === 'string') {
                return [props['firstName'], props['lastName']].filter(Boolean).join(' ').trim();
            }
        }
        if (typeof record['username'] === 'string')
            return record['username'];
        if (typeof record['id'] === 'string')
            return record['id'];
    }
    return formatCompareValue(value);
}
function formatCompareUserList(value) {
    if (value === null || value === undefined || value === '')
        return '';
    if (!Array.isArray(value))
        return formatCompareUser(value);
    return value
        .map((item) => formatCompareUser(item))
        .filter(Boolean)
        .join(', ');
}
function formatCompareSubjects(value) {
    if (value === null || value === undefined || value === '')
        return '';
    if (!Array.isArray(value))
        return formatCompareValue(value);
    return value
        .map((item, index) => {
        if (typeof item === 'string')
            return `${index}: ${item}`;
        if (item && typeof item === 'object' && 'label' in item) {
            return `${index}: ${String(item.label)}`;
        }
        return `${index}: ${String(item)}`;
    })
        .join('\n');
}
function formatCompareTags(value) {
    if (value === null || value === undefined || value === '')
        return '';
    if (!Array.isArray(value))
        return formatCompareValue(value);
    return value
        .map((item) => {
        if (typeof item === 'string')
            return item;
        if (item && typeof item === 'object' && 'label' in item) {
            return String(item.label);
        }
        return String(item);
    })
        .join(', ');
}
function isCompareIconField(key) {
    return key === 'common:icon' || key === 'common:icon-expanded';
}
/** Resolve a Nuxeo document icon path (e.g. `/icons/note.gif`) to an API URL. */
function resolveNuxeoIconPath(path) {
    if (!path)
        return '';
    if (path.startsWith('/nuxeo/'))
        return path;
    if (path.startsWith('/icons/'))
        return `/nuxeo${path}`;
    if (path.startsWith('icons/'))
        return `/nuxeo/${path}`;
    return path;
}
function formatCompareValue(value) {
    if (value === null || value === undefined || value === '')
        return '';
    if (Array.isArray(value)) {
        return value
            .map((item) => {
            if (typeof item === 'string')
                return item;
            if (item && typeof item === 'object' && 'label' in item) {
                return String(item.label);
            }
            return String(item);
        })
            .join(', ');
    }
    if (typeof value === 'object')
        return JSON.stringify(value);
    return String(value);
}
function formatFieldValue(field, doc, locale) {
    const raw = field.read(doc);
    return field.format ? field.format(raw, locale) : formatCompareValue(raw);
}
function buildSectionsFromDefs(sectionDefs, left, right, viewAll, locale) {
    return sectionDefs
        .map((section) => ({
        id: section.id,
        label: section.label,
        fields: section.fields
            .map((field) => {
            const leftValue = formatFieldValue(field, left, locale);
            const rightValue = formatFieldValue(field, right, locale);
            const differs = leftValue !== rightValue;
            return {
                key: field.key,
                label: field.label,
                left: leftValue,
                right: rightValue,
                differs,
            };
        })
            .filter((row) => viewAll || ALWAYS_VISIBLE_SECTIONS.has(section.id) || row.differs),
    }))
        .filter((section) => viewAll || ALWAYS_VISIBLE_SECTIONS.has(section.id) || section.fields.length > 0);
}
function buildDocumentCompareSections(left, right, viewAll, locale) {
    const sectionDefs = viewAll ? FULL_COMPARE_SECTIONS : DIFF_COMPARE_SECTIONS;
    return buildSectionsFromDefs(sectionDefs, left, right, viewAll, locale);
}

const CLIPBOARD_STORAGE_KEY = 'nuxeo_clipboard';
function readClipboardDocs() {
    try {
        const parsed = JSON.parse(localStorage.getItem(CLIPBOARD_STORAGE_KEY) ?? '[]');
        return Array.isArray(parsed)
            ? parsed.filter((item) => typeof item === 'object' &&
                item !== null &&
                typeof item.uid === 'string' &&
                typeof item.title === 'string' &&
                (item.type === undefined ||
                    typeof item.type === 'string'))
            : [];
    }
    catch {
        return [];
    }
}
function writeClipboardDocs(docs) {
    try {
        localStorage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify(docs));
    }
    catch {
        // Storage can be unavailable in restricted browser contexts and test runners.
    }
}
/**
 * Web UI `nuxeo-clipboard.canPaste`: target must be folderish and allow each item type.
 * Items without `type` skip subtype validation (backward compatible with older clipboard data).
 */
function canPasteClipboard(items, target) {
    if (!items.length || !target || !isFolderishDocument(target)) {
        return false;
    }
    const allowedTypes = parseDocumentSubtypes(target);
    if (allowedTypes.length === 0) {
        return true;
    }
    return items.every((item) => !item.type || allowedTypes.includes(item.type));
}

/** Formats ACE begin/end timestamps for permission tables. */
function principalPermissionTimeFrameLabel(row, translate, locale) {
    return formatPermissionTimeFrame(row.begin, row.end, translate, locale);
}
/** Maps a principal permission row to the profile/settings table shape. */
function principalPermissionToLocalRow(row, translate, locale) {
    return {
        documentTitle: row.documentTitle,
        documentPath: row.documentPath,
        right: row.permission,
        timeFrame: principalPermissionTimeFrameLabel(row, translate, locale),
        grantedBy: row.grantedBy ?? '—',
    };
}

/**
 * The Nuxeo permissions this application ships a label for.
 *
 * An allowlist rather than a bare `translate('permissions.right.' + name)` because Nuxeo
 * permissions are open-ended: a marketplace package can define its own, and the server sends the
 * identifier whether or not we know it. Handing an unknown identifier to ngx-translate returns
 * the key itself, so a custom permission would render as `permissions.right.CustomFromMarketplace`
 * in the table. Checking membership first keeps the existing behaviour — unknown permissions show
 * their raw Nuxeo name, which is at least meaningful to an administrator.
 */
const LABELLED_PERMISSIONS = new Set([
    'Everything',
    'ReadWrite',
    'Read',
    'Write',
    'ReadVersion',
    'WriteVersion',
    'Version',
    'ReadRemove',
    'AddChildren',
    'RemoveChildren',
    'Remove',
    'WriteSecurity',
    'Unlock',
    'SetRetention',
    'UnsetRetention',
    'ManageWorkflows',
    'ReadCanCollect',
    'CanAskForPublishing',
    // The atomic permissions Web UI labels too (label.security.permission.*).
    'Browse',
    'ReadChildren',
    'ReadLifeCycle',
    'ReadProperties',
    'ReadSecurity',
    'WriteLifeCycle',
    'WriteProperties',
    'ManageLegalHold',
    'ManageRecord',
]);
/**
 * Maps a Nuxeo permission identifier to its display label.
 *
 * The document, collection and browse permission tables each carried their own copy of this as a
 * hardcoded English `Record<string, string>`, so all three read `Manage everything` in every
 * locale. `translate` is required for the reason given on `formatPermissionTimeFrame`: a default
 * that returns the English turns every un-updated call site into a silent no-op.
 */
function permissionRightLabel(permission, translate) {
    return LABELLED_PERMISSIONS.has(permission)
        ? translate(`permissions.right.${permission}`)
        : permission;
}

/**
 * Wraps a locally-minted object URL with `bypassSecurityTrustResourceUrl` after validating it is
 * actually an object URL.
 *
 * ## Why this exists
 *
 * `URL.createObjectURL(blob)` returns a `blob:` URL that is safe to load — the blob was fetched by
 * this code and the URL points into this document's own object store — but Angular's `RESOURCE_URL`
 * sanitizer throws on a raw string. So the bypass is unavoidable, and consolidating the 7 inline
 * calls that do exactly this makes two things true:
 *
 *   1. The justification lives in one place rather than scattered across 7 docstrings.
 *   2. `scripts/beta-harness/sanitizer-audit.mjs` can enforce that every object-URL bypass goes
 *      through here, so a new inline one is rejected by the gate rather than discovered in review.
 *
 * ## What it checks
 *
 * That `url` is a `blob:` URL. Anything else — including a blank string, a relative path, or
 * another scheme — is rejected and returns `null`, which every caller already treats as "no preview
 * available". Provenance is a caller precondition: the helper cannot prove a `blob:` URL was minted
 * by this document.
 *
 * `DomSanitizer` is passed in rather than injected so this can be a pure function, making it easier
 * to test and reason about. The helper does not own the sanitizer instance.
 *
 * ## Lifecycle note
 *
 * This only *wraps* the URL; it does not manage its lifecycle. The caller that minted the object
 * URL is responsible for calling `URL.revokeObjectURL()` when the blob is no longer needed, which
 * for a component means in `ngOnDestroy` or tied to `DestroyRef`. See
 * `scripts/review-guardrails.mjs` for the pairing check that enforces this.
 */
function trustObjectUrl(sanitizer, url) {
    if (typeof url !== 'string' || url.trim() === '')
        return null;
    // Scheme guard only. Provenance is caller-owned: pass only object URLs from
    // `URL.createObjectURL(blob)` in this document.
    if (!url.startsWith('blob:'))
        return null;
    return sanitizer.bypassSecurityTrustResourceUrl(url);
}

const ALLOWED_CONFIG_KEYS = new Set(['ALLOWED_TAGS', 'ALLOWED_ATTR', 'ADD_ATTR']);
const BLOCKED_TAGS = new Set([
    'script',
    'iframe',
    'object',
    'embed',
    'style',
    'link',
    'meta',
    'base',
]);
const BLOCKED_ATTRS = new Set(['srcdoc']);
/**
 * Rejects any config this helper is not prepared to reason about.
 *
 * Every accepted key must be an array of strings, and the type check **fails closed**. The first
 * version of this guard did not: each test began `Array.isArray(values) &&`, so a value of any other
 * shape was reported as "nothing blocked found" and waved through. `ADD_ATTR` is typed
 * `string[] | ((attributeName, tagName) => boolean)` in DOMPurify 3.4, so `{ ADD_ATTR: () => true }`
 * skipped every check and re-admitted executable attributes. That was not theoretical — rendered
 * through this helper it produced `<p onclick="alert(1)">x</p>` in the DOM, wrapped as `SafeHtml`.
 *
 * Hence the shape check comes first and throws, rather than being folded into the value scan where a
 * non-array can only ever look like an absence of evidence.
 */
function assertSafeConfig(config) {
    if (!config)
        return;
    const cfg = config;
    for (const [key, value] of Object.entries(cfg)) {
        if (!ALLOWED_CONFIG_KEYS.has(key)) {
            throw new Error(`renderTrustedHtml: unsupported DOMPurify config key "${key}"`);
        }
        // An explicitly-undefined key is the same as an absent one, so a caller may write
        // `{ ALLOWED_TAGS: condition ? [...] : undefined }` without tripping the shape check.
        if (value === undefined)
            continue;
        if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
            throw new Error(`renderTrustedHtml: "${key}" must be an array of strings`);
        }
        const normalized = value.map((entry) => entry.toLowerCase());
        if (key === 'ALLOWED_TAGS' && normalized.some((entry) => BLOCKED_TAGS.has(entry))) {
            throw new Error('renderTrustedHtml: active-content tags are not allowed');
        }
        if ((key === 'ALLOWED_ATTR' || key === 'ADD_ATTR') &&
            normalized.some((entry) => entry.startsWith('on') || BLOCKED_ATTRS.has(entry))) {
            throw new Error('renderTrustedHtml: executable attributes are not allowed');
        }
    }
}
/**
 * Wraps HTML with `bypassSecurityTrustHtml` after sanitizing it through DOMPurify.
 *
 * ## Why this exists
 *
 * Angular accepts raw strings for `[innerHTML]` and applies its own HTML sanitizer. This helper
 * keeps the repository's reviewed DOMPurify output together with the audited bypass, so the 8
 * formerly inline sanitize-then-bypass sites share one implementation and one security rationale.
 * Consolidating them makes two things true:
 *
 *   1. The justification ("safe as a PAIRING") lives in one place.
 *   2. `scripts/beta-harness/sanitizer-audit.mjs` can enforce that every innerHTML bypass goes
 *      through here, so a new unpaired one is rejected by the gate.
 *
 * ## What it does
 *
 * Runs `DOMPurify.sanitize(html, config)` and wraps the result. The config is caller-supplied so
 * each site can declare its allow-list: note editor needs `<strong> <em>`, AI markdown needs
 * `<ol> <ul> <li>`, citation highlighting needs `<mark>`. A missing config uses DOMPurify's default
 * (secure but restrictive — strips `<iframe>`, `<script>`, `on*` handlers, `javascript:` URLs).
 *
 * `DomSanitizer` is passed in rather than injected so this can be a pure function.
 *
 * Only a narrow config subset is accepted (`ALLOWED_TAGS`, `ALLOWED_ATTR`, `ADD_ATTR`), and active
 * content is rejected (`script`/`iframe` tags, `on*`/`srcdoc` attributes).
 */
function renderTrustedHtml(sanitizer, html, config) {
    assertSafeConfig(config);
    const clean = DOMPurify.sanitize(html, config);
    return sanitizer.bypassSecurityTrustHtml(clean);
}

/** Nuxeo Note `note:mime_type` values and display labels (matches Nuxeo Web UI). */
const NOTE_FORMAT_OPTIONS = [
    { value: 'text/html', labelKey: 'note-format.html', label: 'HTML' },
    { value: 'text/plain', labelKey: 'note-format.plain', label: 'Text' },
    { value: 'text/xml', labelKey: 'note-format.xml', label: 'XML' },
    { value: 'text/markdown', labelKey: 'note-format.markdown', label: 'Markdown' },
];
const NOTE_FORMAT_LABELS = new Map(NOTE_FORMAT_OPTIONS.map((opt) => [opt.value, opt.label]));
/** Default empty body for a new note of the given format. */
function defaultNoteContent(mimeType) {
    return mimeType === 'text/html' ? '<p></p>' : '';
}
/** Human-readable label for `note:mime_type` (e.g. `text/html` → `HTML`). */
function noteFormatLabel(mimeType) {
    if (!mimeType)
        return 'HTML';
    return NOTE_FORMAT_LABELS.get(mimeType) ?? mimeType;
}
function isHtmlNoteFormat(mimeType) {
    return mimeType === 'text/html';
}
/**
 * Formats note HTML for the code/source textarea (display only).
 *
 * Nuxeo Web UI toggles source mode on the persisted `note:note` string. Satori uses Quill for
 * the visual editor; `getSemanticHTML()` collapses markup onto one line with `&nbsp;` entities.
 * This helper restores a readable multi-line source view without mutating the saved document.
 */
function formatNoteHtmlForSourceView(html) {
    if (!html)
        return '';
    const normalized = html.replace(/\r\n/g, '\n').replace(/&nbsp;/gi, ' ');
    return normalized.replace(/>\s*</g, '>\n<').trim();
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
/** Allows only absolute http(s) URLs for user-provided links and embeds. */
function isSafeHttpUrl(url) {
    try {
        const parsed = new URL(url.trim());
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    }
    catch {
        return false;
    }
}
/** Converts note markdown body to HTML for read-only preview (matches Nuxeo Web UI). */
function renderNoteMarkdown(text) {
    const escaped = escapeHtml(text);
    return escaped
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, href) => {
        if (!isSafeHttpUrl(href))
            return match;
        return `<a href="${escapeHtml(href.trim())}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    })
        .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
        .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(?!<[hubloa])(.+)$/gm, '<p>$1</p>')
        .replace(/<p><\/p>/g, '');
}
function isMarkdownNoteFormat(mimeType) {
    return mimeType === 'text/markdown';
}

/** Localized label for an l10n directory entry (defaults to id). */
function l10nEntryLabel(entry) {
    return entry.properties.label_en ?? entry.id;
}
/** Resolves a nature vocabulary id to its display label. */
function resolveNatureLabel(id, entries) {
    if (!id)
        return '';
    const match = entries.find((e) => e.id === id);
    return match ? directoryPickerLabel(match) : id;
}
/**
 * Formats an l10n directory value as `Parent/Child`, matching Nuxeo Web UI
 * (e.g. `Africa/Tanzania` for coverage). Reads the value Web UI stores, `africa/tanzania`, as well
 * as a bare child id.
 */
function formatHierarchicalL10nLabel(id, entries) {
    if (!id)
        return '';
    const byId = new Map(entries.map((e) => [e.id, e]));
    const entry = byId.get(id) ?? childOfPath(id, byId);
    if (!entry)
        return id;
    const childLabel = l10nEntryLabel(entry);
    const parentId = entry.properties.parent;
    if (!parentId)
        return childLabel;
    const parent = byId.get(parentId);
    const parentLabel = parent ? l10nEntryLabel(parent) : parentId;
    return `${parentLabel}/${childLabel}`;
}
/**
 * Groups child l10n directory entries under their parent label for hierarchical
 * mat-optgroup pickers (coverage, subjects).
 */
function groupL10nChildrenByParent(entries, query = '') {
    if (!entries.length)
        return [];
    const parentLabels = new Map(entries.map((e) => [e.id, l10nEntryLabel(e)]));
    const q = query.trim().toLowerCase();
    const filtered = entries.filter((e) => {
        if (e.properties.obsolete)
            return false;
        if (!e.properties.parent)
            return false;
        if (!q)
            return true;
        const label = l10nEntryLabel(e).toLowerCase();
        const parentLabel = (parentLabels.get(e.properties.parent) ?? '').toLowerCase();
        return label.includes(q) || e.id.toLowerCase().includes(q) || parentLabel.includes(q);
    });
    const groups = new Map();
    for (const entry of filtered) {
        const parent = entry.properties.parent;
        const list = groups.get(parent) ?? [];
        list.push(entry);
        groups.set(parent, list);
    }
    return [...groups.entries()]
        .map(([parentId, groupEntries]) => ({
        parentLabel: parentLabels.get(parentId) ?? parentId,
        entries: groupEntries.sort((a, b) => (a.properties.ordering ?? 0) - (b.properties.ordering ?? 0)),
    }))
        .sort((a, b) => a.parentLabel.localeCompare(b.parentLabel));
}
/** The entry `parent/child` names: the child, when its parent is the one the path says. */
function childOfPath(id, byId) {
    const slash = id.lastIndexOf('/');
    if (slash <= 0)
        return undefined;
    const child = byId.get(id.slice(slash + 1));
    return child && child.properties.parent === id.slice(0, slash) ? child : undefined;
}

/**
 * Validate the date parsed by the field's active adapter, without a second date parser.
 * Non-empty text needs a valid Date: Material turns a failed parse into a null model,
 * which must not be mistaken for an intentional clear or allowed through a save guard.
 */
function isExpiresFieldValid(expiresRawText, expires) {
    if (expires)
        return !Number.isNaN(expires.getTime());
    return expiresRawText.trim().length === 0;
}
/** Whether to show the Expires validation message (non-empty invalid input). */
function shouldShowExpiresFieldError(expiresRawText, expires) {
    return !isExpiresFieldValid(expiresRawText, expires);
}
/** Shows Expires validation errors immediately on input (not only after blur). */
function createExpiresErrorStateMatcher(isInvalid) {
    return {
        isErrorState: () => isInvalid(),
    };
}

/**
 * "3 days ago", in whatever language the page is in.
 *
 * Five copies of this logic were hand-rolled across the application, each building the phrase
 * by concatenation — `` `${days} days ago` `` — and each therefore untranslatable and wrong
 * outside English twice over.
 *
 * The obvious fix is a catalogue key per unit. It is the wrong one. English has two plural
 * forms, so `1 day` / `2 days` looks like the whole problem; Polish has three and Arabic six,
 * and a translator handed `{{ count }} days ago` cannot express any of them. Getting that
 * right means CLDR plural rules, which is a table nobody should be maintaining here.
 *
 * `Intl.RelativeTimeFormat` is that table, shipped in the browser. It knows the plural rules
 * for every locale, it knows that French writes "il y a 3 jours" with the preposition first,
 * and with `numeric: 'auto'` it produces "yesterday" rather than "1 day ago" where the
 * language has a word for it. Nothing needs translating, so nothing can be mistranslated, and
 * it is correct in locales this product has never shipped.
 *
 * The locale is passed in rather than read from a global: it must follow the app's Layer 0
 * `defaultLanguage`, not the browser's, or the page renders in one language and its timestamps
 * in another.
 */
/** Thresholds in ascending order, so the first match is the coarsest sensible unit. */
const UNITS = [
    [60_000, 1_000, 'second'],
    [3_600_000, 60_000, 'minute'],
    [86_400_000, 3_600_000, 'hour'],
    [2_592_000_000, 86_400_000, 'day'],
    [31_536_000_000, 2_592_000_000, 'month'],
    [Number.POSITIVE_INFINITY, 31_536_000_000, 'year'],
];
/** The coarsest unit, used when nothing else matches. */
const YEARS = UNITS[UNITS.length - 1];
/** Below this, every language would rather say "now" than "in 4 seconds". */
const JUST_NOW_MS = 45_000;
function formatRelativeTime(value, locale, now = Date.now()) {
    if (value === null || value === undefined || value === '')
        return '';
    const then = value instanceof Date ? value.getTime() : new Date(value).getTime();
    if (Number.isNaN(then))
        return '';
    const elapsed = now - then;
    const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    // `RelativeTimeFormat` has no "now", so the smallest unit stands in for it. Passing 0 seconds
    // with `numeric: 'auto'` is what produces "now" / "maintenant" rather than "0 seconds ago".
    if (Math.abs(elapsed) < JUST_NOW_MS)
        return format.format(0, 'second');
    // The last entry's limit is Infinity, so a match is guaranteed — but saying so with `!`
    // would be an assertion where a default is available.
    const [, perUnit, unit] = UNITS.find(([limit]) => Math.abs(elapsed) < limit) ?? YEARS;
    // Rounded on the MAGNITUDE, then signed — not `Math.round(elapsed / perUnit)`.
    //
    // `Math.round` breaks ties towards +∞, so it is asymmetric across zero: `Math.round(1.5)` is 2
    // and `Math.round(-1.5)` is -1. Two instants the same distance either side of now therefore
    // rendered with different magnitudes — 90 seconds ago was "2 minutes ago" while 90 seconds
    // ahead was "in 1 minute". Rounding the absolute value first makes the two symmetric, which is
    // what a reader expects of a relative time.
    const magnitude = Math.round(Math.abs(elapsed) / perUnit);
    // Negative is the past, which is the opposite sign from `elapsed`.
    return format.format(elapsed > 0 ? -magnitude : magnitude, unit);
}

/**
 * Generated bundle index. Do not edit.
 */

export { ADD_CHILDREN, ADMIN_ACCESS_CHECKS, ARENDER_CONFIG, ARenderService, AdministrationService, AssetAggregationService, AssetService, BLOB_CLIENT_REASON_HEADER, BLOB_CLIENT_REASON_PARAM, BLOB_HOLDING_DOC_TYPES, BLOB_NOT_ATTACHED_ERROR, BrowseContextService, BrowseService, CLIPBOARD_STORAGE_KEY, CONTENT_LAKE_INGEST_DOCUMENT_TYPES, CONTENT_LAKE_INGEST_MARKER_LEGACY_PROPERTY, CONTENT_LAKE_INGEST_MARKER_PREFIX, CONTENT_LAKE_INGEST_MARKER_PROPERTIES, CONTENT_LAKE_INGEST_MARKER_PROPERTY, CURRENT_USERNAME, ClipboardTargetService, CollectionService, ContentLakeIngestService, ContentModelService, DEFAULT_IMPORT_PARENT_PATH, DEFAULT_VOCABULARY_ORDERING, DOC_TYPE_ICONS, DOC_TYPE_LABEL_KEYS, DOMAIN_CONTAINER_GUIDANCE_KEY, DOMAIN_STRUCTURAL_ROOT_TYPES, DirectoryService, DocTypeLabelPipe, DocumentDetailService, DocumentImportService, DocumentService, EXPIRED_DOCUMENTS_QUERY, FALLBACK_DIRECTORY_NAMES, FAVORITES_COLLECTION_QUERY, FOLDERISH_TYPES, MANAGE_DOCUMENT_PERMISSIONS, NON_CONTENT_DOCUMENT_TYPES, NOTE_DOCUMENT_PICKER_HEADERS, NOTE_DOCUMENT_PICKER_PROVIDER, NOTE_FORMAT_OPTIONS, NUXEO_API_ORIGIN, NUXEO_POWERUSERS_GROUP, NUXEO_SAML_LOGIN_ENDPOINTS, NUXEO_SERVER_URL, NUXEO_SSO_POST_LOGIN_PATH, NUXEO_SSO_RETURN_QUERY_PARAM, NuxeoApiBase, NuxeoDriveService, PERMISSION_DENIED_KEY, PERMISSION_NOTIFICATION_MAIL_HINT_KEY, PrincipalPermissionsService, READ_WRITE_DOCUMENT, RECENTLY_EDITED_QUERY, RECENTLY_VIEWED_QUERY, REMOVE_DOCUMENT, RESTRICTED_IMPORT_LOCATION_MESSAGE_KEY, SearchAggregationService, SearchService, SelectionService, SettingsService, TagService, TaskService, TrashFilterService, TrashService, UserService, WORKSPACE_CONTENT_TYPE_ORDER, WRITE_DOCUMENT, WRITE_PROPERTIES, WRITE_VERSION, WorkflowService, administrationAccessGuard, administrationLandingGuard, auditActivityLabel, auditActivityLabelKey, avatarColor, browseTreeContextPath, buildContentLakeIngestMarker, buildDocumentCompareSections, buildNoteDocumentPickerNxql, buildVocabularyTableColumns, canAddChildren, canCreateDocumentVersion, canManageDocumentPermissions, canPasteClipboard, canPublishDocument, canRemoveDocument, canShowRemoveDocumentAction, canShowWriteDocumentAction, canTagDocument, canViewDocumentAuditLog, canWriteDocument, createExpiresErrorStateMatcher, cumulativeNuxeoPathPrefixes, decodeNuxeoPathSegment, defaultNoteContent, defaultVocabularyLabel, directoryAdminTableLabel, directoryEntryDisplayLabel, directoryPickerLabel, directoryShowsParentField, directoryUsesL10nLabel, docTypeIcon, docTypeLabel, documentHasMainBlob, documentHasPersistedMainBlob, documentNavigationUrl, entryPropertiesIncludeParent, escapeNxqlLiteral, expandableNuxeoPathPrefixes, filterCreatableSubtypesForParent, filterDirectoryPickerEntries, filterInsertablePictureDocuments, findLocalAceForPrincipal, formatAceDateRange, formatCompareDate, formatCompareValue, formatDirectoryEntryId, formatHierarchicalL10nLabel, formatNoteHtmlForSourceView, formatRelativeTime, fullAdministratorGuard, getDirectoryMetadata, groupL10nChildrenByParent, hasDocumentPermission, hasDocumentPermissionsEnricher, hasInsertablePictureBlob, inferBlobDocTypeFromFile, insecureAllowedForHost, isBlobHoldingDocType, isBrowsableNavNode, isBrowseRouterUrl, isCollectionDocument, isCompareIconField, isContentLakeIngestCurrent, isDirectoryI18nKey, isDomainParentType, isExpiresFieldValid, isFolderishDocument, isHtmlNoteFormat, isMailSendError, isManagedDirectory, isManagedDirectoryName, isMarkdownNoteFormat, isNavigableBaseUrl, isPermissionDeniedError, isPowerUserFromGroups, isRecordDocument, isRepositoryRootPath, isRestrictedImportParentPath, isSafeHttpUrl, isUserWorkspacePath, l10nEntryLabel, mailSendFailureKey, mailSendFailureMessage, mediaTypeEssence, mergeCreateDocumentBody, mergeDocumentPermissionsContext, navigableUrlOrNull, needsContentLakeIngest, normalizeDocumentAcls, normalizeDocumentPickerList, normalizeNuxeoPath, noteFormatLabel, nuxeoPathSegments, nuxeoPathsEqual, nuxeoPathsEqualFlexible, originOf, parentNuxeoFolderPath, parseBrowseNuxeoPathFromRouterUrl, parseDocumentSubtypes, permissionCreateMailFailureMessage, permissionNotificationAceNotFoundKey, permissionNotificationAceNotFoundMessage, permissionRightLabel, permissionUpdateMailFailureMessage, postTrashBrowseRouterUrl, principalPermissionTimeFrameLabel, principalPermissionToLocalRow, readBlobDigest, readClipboardDocs, readContentLakeIngestMarker, readGroupsFromMe, renderNoteMarkdown, renderTrustedHtml, resolveAcePrincipal, resolveCreatableSubtypes, resolveImportBlobDocType, resolveIngestMarkerWriteProperty, resolveNatureLabel, resolveNuxeoIconPath, resolvePaginatedListTotal, resolveParentSourceName, sanitizeDocumentCreateName, sanitizeDocumentName, shouldProbeContentLakeIngestStatus, shouldShowExpiresFieldError, shouldShowUserWorkspaceBreadcrumbs, sortDocumentSubtypes, summarizeCsvImportReport, supportsContentLakeIngest, taskDueDistance, titleFromFileName, toBrowseRouterUrl, topLevelNuxeoFolderPath, trustObjectUrl, userWorkspaceBrowseRouterUrl, userWorkspaceOwnerFromPath, userWorkspaceRootFromPath, vocabularyParentRequired, vocabularySupportsParent, vocabularyTableColumns, writeClipboardDocs };
//# sourceMappingURL=nuxeo-satori-platform-nuxeo-client.mjs.map
