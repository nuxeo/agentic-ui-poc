import { Observable, Subject } from 'rxjs';
import * as i0 from '@angular/core';
import { InjectionToken, PipeTransform } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl, SafeHtml } from '@angular/platform-browser';

interface NuxeoPaginatedList<T> {
    entries: T[];
    totalSize: number;
    resultsCount?: number;
    currentPageSize: number;
    currentPageIndex: number;
    numberOfPages: number;
    /**
     * Whether another page exists.
     *
     * The fact to build a pager on. For a document's children (`@children`), Nuxeo counts only within
     * `resultsCountLimit`, which it sets to the requested `pageSize`, so `resultsCount` is a real
     * total **only when the result set fits on one page**. That is not true of every provider:
     * `default_search` reports its exact total across pages (measured on 25 matches with page sizes
     * 10, 20 and 40, and on 50 with 40). Check the provider before assuming either. This flag is
     * accurate either way.
     */
    isNextPageAvailable?: boolean;
}

interface NuxeoAce {
    id: string;
    username: string;
    /** The principal's display name, when the read asked for `fetch-acls: extended`. */
    usernameLabel?: string;
    externalUser: boolean;
    permission: string;
    granted: boolean;
    creator: string | null;
    begin: string | null;
    end: string | null;
    status: 'effective' | 'pending' | 'archived';
}
interface NuxeoAcl {
    name: string;
    aces: NuxeoAce[];
}

interface NuxeoDocument {
    uid: string;
    title: string;
    type: string;
    path: string;
    lastModified: string;
    properties: Record<string, unknown>;
    parentRef?: string;
    lockOwner?: string | null;
    lockCreated?: string | null;
    state?: string;
    isTrashed?: boolean;
    isCheckedOut?: boolean;
    /** True on a version snapshot, false on the live document. */
    isVersion?: boolean;
    /** True on a proxy — a published copy or a live proxy — rather than the document itself. */
    isProxy?: boolean;
    /**
     * The **live** document this version was cut from.
     *
     * Not the same as `parentRef`: Nuxeo reports a version's `parentRef` as the live
     * document's *folder*, so `parentRef` alone cannot get you back to the document a
     * version belongs to.
     */
    versionableId?: string;
    isLatestVersion?: boolean;
    isLatestMajorVersion?: boolean;
    facets?: string[];
    contextParameters?: {
        acls?: NuxeoAcl[];
        favorites?: {
            isFavorite: boolean;
        };
        subscribedNotifications?: string[];
        [key: string]: unknown;
    };
}
type NuxeoDocumentList = NuxeoPaginatedList<NuxeoDocument>;

interface AggregateBucket {
    key: string;
    docCount: number;
}
interface AggregateResult {
    buckets: AggregateBucket[];
}
interface AssetAggregations {
    system_primaryType_agg?: AggregateResult;
    system_mimetype_agg?: AggregateResult;
    color_profile_agg?: AggregateResult;
    color_depth_agg?: AggregateResult;
    asset_width_agg?: AggregateResult;
    asset_height_agg?: AggregateResult;
    video_duration_agg?: AggregateResult;
}
interface AssetSearchParams {
    pageIndex?: number;
    pageSize?: number;
    ecmFulltext?: string;
    primaryTypes?: string[];
    mimeTypes?: string[];
    widths?: string[];
    heights?: string[];
    colorProfiles?: string[];
    colorDepths?: string[];
    videoDurations?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
interface AssetSearchResult extends NuxeoPaginatedList<NuxeoDocument> {
    aggregations?: AssetAggregations;
}

/**
 * Nuxeo's content model as its `/config/*` endpoints describe it.
 *
 * Three endpoints, because no single one is complete:
 *
 * - `/config/types` → `{ doctypes, schemas }`. Doctypes carry `parent`, `facets` and the
 *   schema names they use. Its `schemas` map is a **flat** shape and covers only the 48
 *   schemas reachable from a doctype.
 * - `/config/facets` → every facet, with the schemas each contributes. A doctype's `facets`
 *   are names only, so this is the only way to know what a facet adds.
 * - `/config/schemas` → all 98 schemas in a **nested** shape (`{ name, @prefix, fields }`),
 *   including the ones only a facet reaches. This is the superset and the one to use.
 *
 * Measured against the local instance: 60 doctypes, 65 facets, 98 schemas, versus 48 schemas
 * in `/config/types`. Reading schemas from `/config/types` would silently omit fifty of them.
 */
/**
 * A field's type, or a nested definition for a complex one.
 *
 * Nuxeo answers a primitive as a bare string — `'string'`, `'date'`, `'long'`, `'double'`,
 * `'boolean'`, `'blob'`, `'string[]'` — and a complex field as an object carrying its own
 * `fields`, which nest arbitrarily deep.
 */
type NuxeoFieldType = string | NuxeoComplexField;
interface NuxeoComplexField {
    /** `'complex'` or `'complex[]'`. */
    type?: string;
    fields?: Record<string, NuxeoFieldType>;
}
/** One entry of `/config/schemas`. */
interface NuxeoSchemaDefinition {
    name: string;
    /**
     * The property prefix, e.g. `dc` for `dublincore`.
     *
     * **Often empty.** `file`, `uid` and others report `''`, and Nuxeo then addresses their
     * properties by schema *name* — `file:content`, `uid:major_version`. Treat an empty prefix
     * as the schema name rather than as "no prefix".
     */
    '@prefix'?: string;
    fields?: Record<string, NuxeoFieldType>;
}
/** One entry of `/config/types`' `doctypes` map. */
interface NuxeoDoctypeDefinition {
    /** The doctype this one extends, e.g. `Document` for `File`. */
    parent?: string;
    /** Facet names — Nuxeo's mixins. Their schemas come from `/config/facets`. */
    facets?: string[];
    /** Schema names contributed directly by this doctype. */
    schemas?: string[];
}
/** One entry of `/config/facets`. A facet contributing no schema has no `schemas` key at all. */
interface NuxeoFacetDefinition {
    name: string;
    schemas?: NuxeoSchemaDefinition[];
}
/** `/config/types`. Its `schemas` are the flat shape; prefer `/config/schemas`. */
interface NuxeoTypesConfig {
    doctypes?: Record<string, NuxeoDoctypeDefinition>;
    schemas?: Record<string, Record<string, NuxeoFieldType>>;
}
/** The three `/config/*` reads, resolved together. */
interface NuxeoContentModel {
    doctypes: Record<string, NuxeoDoctypeDefinition>;
    facets: NuxeoFacetDefinition[];
    schemas: NuxeoSchemaDefinition[];
}

interface ContentLakeIngestCommand {
    commandId: string;
}
interface ContentLakeIngestStatus {
    commandId: string;
    state: string;
    processed: number;
    total?: number;
    error: boolean;
    errorCount: number;
}
/** A local file that already exists in the target folder and is ingested in Content Lake. */
interface ContentLakeDuplicate {
    fileName: string;
    existingUid: string;
    existingTitle: string;
    existingPath: string;
}
/** Result of probing Content Lake and optionally persisting the local ingest marker. */
interface ContentLakeBackfillResult {
    doc: NuxeoDocument | null;
    presentInContentLake: boolean;
}

interface NuxeoTask {
    id: string;
    name: string;
    directive: string;
    workflowInstanceId: string;
    workflowModelName: string;
    workflowTitle: string;
    created: string;
    dueDate: string;
    state: string;
    nodeName: string;
    targetDocumentIds: {
        id?: string;
        uid?: string;
        title?: string;
        type?: string;
        path?: string;
    }[];
    actors: {
        id: string;
    }[];
    delegatedActors: {
        id: string;
    }[];
    comments: {
        author: string;
        text: string;
        date: string;
    }[];
    variables: Record<string, unknown>;
    taskInfo: {
        taskActions: {
            name: string;
            label: string;
            url?: string;
        }[];
    };
    /** Enriched client-side after fetching the target document */
    targetDocTitle?: string;
}
type NuxeoTaskList = NuxeoPaginatedList<NuxeoTask>;

interface AuditEntry {
    id: number;
    category: string;
    principalName: string;
    comment: string;
    docLifeCycle: string;
    docPath: string;
    docType: string;
    docUUID: string;
    eventId: string;
    repositoryId: string;
    eventDate: string;
    logDate: string;
    extended: Record<string, unknown>;
}
type AuditLogList = NuxeoPaginatedList<AuditEntry>;
/** The columns the `@audit` adapter sorts on. */
type AuditLogSortField = 'eventId' | 'eventDate' | 'principalName' | 'category';
/**
 * What the `@audit` adapter filters and sorts on, server-side — the parameters Web UI's
 * `nuxeo-audit-search` sends. Every field is optional; an absent one does not filter.
 */
interface AuditLogQuery {
    /** The user who performed the action. */
    readonly principalName?: string;
    /** Event IDs, any of which matches — `documentModified`, `documentLocked`. */
    readonly eventIds?: readonly string[];
    /** One event category — `eventDocumentCategory`. */
    readonly eventCategory?: string;
    /** The earliest event, inclusive. */
    readonly startDate?: Date;
    /** The first instant after the last event wanted: the adapter's end is exclusive. */
    readonly endDate?: Date;
    readonly sortBy?: AuditLogSortField;
    readonly sortOrder?: 'asc' | 'desc';
}

/**
 * Label key for an audit activity entry — Web UI uses `extended.clientReason` when present,
 * otherwise `eventId` (see `nuxeo-document-activity._activity()`).
 */
declare function auditActivityLabelKey(entry: AuditEntry): string;
/**
 * Human-readable Activity tab label for an audit entry (Classic Web UI parity).
 */
declare function auditActivityLabel(entry: AuditEntry, eventTypeLabels?: Map<string, string> | Record<string, string>): string;

/** Nuxeo DownloadService REQUEST_QUERY_PARAM_CLIENT_REASON — Web UI parity for audit. */
declare const BLOB_CLIENT_REASON_PARAM = "clientReason";
/** Nuxeo DownloadService REQUEST_HEADER_CLIENT_REASON (query param is equivalent). */
declare const BLOB_CLIENT_REASON_HEADER = "X-Client-Reason";
type BlobClientReason = 'view' | 'download';
interface FetchBlobOptions {
    /** Defaults to `view` (document preview). Use `download` for explicit user downloads. */
    clientReason?: BlobClientReason;
}

/** Common directory / vocabulary names when the server does not expose a list endpoint. */
declare const FALLBACK_DIRECTORY_NAMES: readonly ["continent", "country", "eventTypes", "eventCategories", "l10nsubjects", "l10ncoverage", "nature", "subtopic", "oauth2TokenTypes", "language"];
interface DirectoryEntry {
    id: string;
    label: string;
    displayLabel: string;
    /** Hierarchical label from Directory.SuggestEntries (Web UI parity). */
    absoluteLabel?: string;
    ordering: number;
    obsolete: number;
    directoryName: string;
}
/** Default ordering for new vocabulary entries (Nuxeo Web UI parity). */
declare const DEFAULT_VOCABULARY_ORDERING = 10000000;
interface VocabularyEntryFormValues {
    id: string;
    label: string;
    ordering: number;
    obsolete: boolean;
    parent?: string;
}
/** Directory entry as shown in Administration → Vocabularies. */
interface ManagedDirectoryEntry {
    id: string;
    directoryName: string;
    label: string;
    ordering: number;
    obsolete: boolean;
    parent?: string;
    /** Property keys from the Nuxeo directory entry (Web UI column detection). */
    propertyKeys: string[];
}
interface DirectoryEntryRest {
    id: string;
    directoryName: string;
    properties: Record<string, string | number | boolean | null | undefined>;
}
interface DirectoryEntriesResponse {
    entries: DirectoryEntryRest[];
    currentPageIndex: number;
    isNextPageAvailable: boolean;
}
/** Directory registry entry from GET /nuxeo/api/v1/directory (Web UI vocabulary metadata). */
interface DirectoryMetadata {
    name: string;
    schema?: string;
    idField?: string;
    /** Parent directory name when entries reference another vocabulary (e.g. continent for country). */
    parentDirectory?: string;
    /** Nuxeo directory type; Web UI hides `system` directories from the vocabularies admin page. */
    type?: string;
}
/** Web UI: parent column when the entry schema includes a parent property. */
declare function entryPropertiesIncludeParent(keys: readonly string[]): boolean;
/** Case-insensitive catalog lookup. */
declare function getDirectoryMetadata(catalog: Map<string, DirectoryMetadata>, directoryName: string): DirectoryMetadata | undefined;
/** Build table column ids in Web UI order (parent before id when present). */
declare function buildVocabularyTableColumns(propertyKeys: readonly string[]): string[];
/** Whether the vocabulary table/dialog should include a parent field/column. */
declare function vocabularySupportsParent(directoryName: string, metadata: DirectoryMetadata | undefined, entries: readonly Pick<ManagedDirectoryEntry, 'propertyKeys' | 'parent'>[]): boolean;
/** Resolve admin table columns using catalog metadata and loaded entry properties. */
declare function vocabularyTableColumns(directoryName: string, metadata: DirectoryMetadata | undefined, entries: readonly ManagedDirectoryEntry[]): string[];
declare function defaultVocabularyLabel(directoryName: string, id: string): string;
/** Whether a directory appears in Administration → Vocabularies (Nuxeo Web UI parity). */
declare function isManagedDirectory(metadata: Pick<DirectoryMetadata, 'type'>): boolean;
/** Whether a directory name is manageable when catalog metadata is unavailable. */
declare function isManagedDirectoryName(name: string): boolean;
/** Raw label stored on the directory entry — shown as-is in the admin table (Web UI parity). */
declare function directoryAdminTableLabel(entry: Pick<ManagedDirectoryEntry, 'label'>): string;
/** Whether a stored directory label value is an unresolved i18n key. */
declare function isDirectoryI18nKey(value: string | undefined | null): boolean;
/** Formats a vocabulary entry id for picker display (Web UI parity). */
declare function formatDirectoryEntryId(id: string): string;
/** Human-readable label for directory entries whose label is an i18n key. */
declare function directoryEntryDisplayLabel(entry: Pick<ManagedDirectoryEntry, 'id' | 'label'>): string;
/**
 * Resolves the label shown in vocabulary pickers (Nuxeo Web UI parity:
 * absoluteLabel → displayLabel → formatted id for i18n keys).
 */
declare function directoryPickerLabel(entry: Pick<DirectoryEntry, 'id' | 'displayLabel'> & {
    label?: string;
    absoluteLabel?: string;
}): string;
/** Client-side filter/sort for vocabulary picker dropdowns (Nature, etc.). */
declare function filterDirectoryPickerEntries(entries: DirectoryEntry[], query?: string): DirectoryEntry[];
declare function directoryUsesL10nLabel(directoryName: string): boolean;
/** Whether vocabulary entries support a parent field (Web UI parity). */
declare function directoryShowsParentField(directoryName: string, metadata?: DirectoryMetadata): boolean;
/**
 * Directory whose entries populate the parent dropdown.
 * Uses Nuxeo directory registry metadata when available.
 */
declare function resolveParentSourceName(directoryName: string, metadata?: DirectoryMetadata): string | null;
/** Parent is required when options come from a different vocabulary (e.g. country → continent). */
declare function vocabularyParentRequired(directoryName: string, metadata?: DirectoryMetadata): boolean;
interface L10nDirectoryEntry {
    id: string;
    directoryName: string;
    properties: {
        id: string;
        parent: string;
        ordering: number;
        obsolete: number;
        label_en?: string;
        label_fr?: string;
    };
}

interface SearchAggregations {
    dc_modified_agg?: AggregateResult;
    dc_creator_agg?: AggregateResult;
    collection_agg?: AggregateResult;
    dc_nature_agg?: AggregateResult;
    dc_coverage_agg?: AggregateResult;
    dc_subjects_agg?: AggregateResult;
    common_size_agg?: AggregateResult;
}
interface SearchResponse {
    items: SearchResultItem[];
    aggregations: SearchAggregations;
    /** Every match across every page; negative when the server did not count them. */
    totalSize: number;
    /** Whether the server has a page after this one. */
    hasNextPage: boolean;
}
interface SearchResultItem {
    id: string;
    title: string;
    type: string;
    path?: string;
    isFavorite?: boolean;
    modifiedDate: string;
    sizeInBytes?: number;
    lastContributor: string;
    createdDate?: string;
    author: string;
    authorKey: string;
    state?: string;
    version?: string;
    nature?: string;
    coverage?: string;
    subjects?: string;
    flags?: string;
    collection: string;
    collectionKey: string;
    tags: string[];
    icon: string;
}

interface SearchQueryParams {
    q?: string;
    ecmFulltext?: string;
    quickFilters?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    modifiedDate?: string;
    author?: string;
    collection?: string;
    tag?: string;
    nature?: string;
    subjects?: string;
    coverage?: string;
    size?: string;
    pageIndex?: number;
    pageSize?: number;
}
interface SearchCollectionOption {
    id: string;
    title: string;
    itemCount: number;
}
interface SavedSearchOption {
    id: string;
    title: string;
    query?: string;
}
interface SaveSavedSearchParams {
    title: string;
    params: Record<string, string>;
    pageProviderName?: string;
}
interface GlobalSearchSuggestion {
    id: string;
    displayLabel: string;
    displayLabelHighlights?: Array<{
        text: string;
        matched: boolean;
    }>;
    pathHighlights?: Array<{
        text: string;
        matched: boolean;
    }>;
    kind: 'document' | 'user' | 'group' | 'other';
    documentUid?: string;
    path?: string;
    prefixedId?: string;
}
declare class SearchService {
    private readonly api;
    private readonly tags;
    private readonly savedSearchHighlight;
    suggestFromSuggestersLauncher(searchTerm: string, pageSize?: number): Observable<GlobalSearchSuggestion[]>;
    suggest(searchTerm: string, pageSize?: number): Observable<GlobalSearchSuggestion[]>;
    private suggestFallback;
    getUserCollections(): Observable<SearchCollectionOption[]>;
    /**
     * Picture documents for the note RTE "insert from existing documents" picker.
     * Matches Web UI `nuxeo-document-picker` (`provider="document_picker"`,
     * `schemas="dublincore,file"`, `fulltext_all` param). Falls back to NXQL when the
     * ES-backed page provider is unavailable (`file:content` mapping errors).
     */
    searchDocumentPicker(options?: {
        fulltext?: string;
        pageSize?: number;
        pageIndex?: number;
    }): Observable<NuxeoDocumentList>;
    private normalizePicturePickerList;
    private searchDocumentPickerNxql;
    getSavedSearches(pageProvider?: string): Observable<SavedSearchOption[]>;
    getSavedSearchById(id: string): Observable<Record<string, string>>;
    saveSavedSearch(request: SaveSavedSearchParams): Observable<unknown>;
    updateSavedSearch(id: string, request: SaveSavedSearchParams): Observable<unknown>;
    /**
     * Renames a saved search and leaves its filters as stored. The request carries no `params`, so
     * the server keeps the ones it has — whichever application wrote them.
     */
    renameSavedSearch(id: string, title: string, pageProviderName?: string): Observable<unknown>;
    deleteSavedSearch(id: string): Observable<unknown>;
    search(params: SearchQueryParams): Observable<SearchResponse>;
    /**
     * Tag labels that start with `term`, from `TagService.suggestTags` (Nuxeo's `Tag.Suggestion`) —
     * what Web UI's search form offers in its Tags field. Empty for a blank term, and on failure, so a
     * typeahead stays usable.
     */
    getTagSuggestions(term: string): Observable<string[]>;
    private asPrincipalName;
    private parseSizeInBytes;
    private firstString;
    private normalizeAggregations;
    private normalizeSuggestions;
    private extractSuggestionItems;
    private extractArraysFromContainer;
    private looksLikeSuggestionItem;
    private mapSuggestion;
    private extractHighlightsByField;
    private pickHighlightParts;
    private toHighlightParts;
    private stripTags;
    private asString;
    static ɵfac: i0.ɵɵFactoryDeclaration<SearchService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<SearchService>;
}

interface NuxeoOAuth2ServiceProvider {
    'entity-type': 'nuxeoOAuth2ServiceProvider';
    serviceName: string;
    description?: string | null;
    clientId?: string | null;
    tokenServerURL?: string | null;
    authorizationServerURL?: string | null;
    userAuthorizationURL?: string | null;
    scopes?: string[];
    enabled?: boolean;
}
interface NuxeoOAuth2ServiceProviderList {
    'entity-type': 'nuxeoOAuth2ServiceProviders';
    entries: NuxeoOAuth2ServiceProvider[];
}
interface NuxeoOAuth2Token {
    'entity-type': 'nuxeoOAuth2Token';
    serviceName: string;
    nuxeoLogin: string;
    serviceLogin: string;
    clientId?: string | null;
    isShared: boolean;
    sharedWith?: string[];
    creationDate: string;
}
interface NuxeoOAuth2TokenList {
    'entity-type': 'nuxeoOAuth2Tokens';
    entries: NuxeoOAuth2Token[];
}
interface ConnectedAccount {
    serviceName: string;
    nuxeoLogin: string;
    serviceLogin: string;
    creationDate: string;
    shared: boolean;
}
interface AuthorizedApplication {
    name: string;
    authorizationDate: string;
}

interface NuxeoWorkflowModel {
    'entity-type': 'workflowModel';
    name: string;
    title: string;
    graphResource?: string;
}
interface NuxeoWorkflowModelList {
    'entity-type': 'workflowModels';
    entries: NuxeoWorkflowModel[];
}
interface NuxeoWorkflow {
    'entity-type': 'workflow';
    id: string;
    name: string;
    title: string;
    state: string;
    workflowModelName: string;
    initiator: string;
    attachedDocumentIds: {
        id: string;
    }[];
    variables: Record<string, unknown>;
    graphResource?: string;
}
interface NuxeoWorkflowList {
    'entity-type': 'workflows';
    entries: NuxeoWorkflow[];
}

interface NuxeoUser {
    'entity-type': 'user';
    id: string;
    properties: {
        firstName: string;
        lastName: string;
        username: string;
        email: string;
        groups: string[];
        company?: string;
        /** Set only when creating or changing password (not returned on GET in some setups). */
        password?: string;
    };
    isAdministrator?: boolean;
    isAnonymous?: boolean;
}
interface NuxeoUserList {
    'entity-type': 'users';
    entries: NuxeoUser[];
    totalSize?: number;
    resultsCount?: number;
    currentPageSize?: number;
    currentPageIndex?: number;
    numberOfPages?: number;
    isPaginable?: boolean;
    isNextPageAvailable?: boolean;
}
interface NuxeoGroup {
    'entity-type': 'group';
    groupname: string;
    grouplabel: string;
    memberUsers?: string[];
    memberGroups?: string[];
}
interface NuxeoGroupList {
    'entity-type': 'groups';
    entries: NuxeoGroup[];
    totalSize?: number;
    resultsCount?: number;
    currentPageSize?: number;
    currentPageIndex?: number;
    numberOfPages?: number;
    isPaginable?: boolean;
    isNextPageAvailable?: boolean;
}

/** One row in Administration “Local permissions” tables (user or group principal). */
interface PrincipalPermissionRow {
    documentUid: string;
    documentTitle: string;
    documentPath: string;
    permission: string;
    begin: string | null;
    end: string | null;
    grantedBy: string | null;
    /** Exact ACE username field — required for `Document.RemovePermission`. */
    acePrincipal: string;
}
interface PrincipalPermissionPage {
    rows: PrincipalPermissionRow[];
    totalDocuments: number;
    numberOfPages: number;
    currentPageIndex: number;
    currentPageSize: number;
}

/** OAuth2 provider as returned by Nuxeo REST (shape may vary by version). */
interface NuxeoOAuth2Provider {
    entityType?: string;
    'entity-type'?: string;
    serviceName?: string;
    description?: string;
    enabled?: boolean;
    isEnabled?: boolean;
    [key: string]: unknown;
}

/**
 * Base URL for Nuxeo API calls from the browser.
 * Use '' with `proxy.conf.json` during `nx serve` so requests go to `/nuxeo/...`
 * on the dev server and are proxied to http://localhost:8080 (Nuxeo).
 * For production behind a shared host, keep ''.
 * For cross-origin production, set the full origin (and configure CORS on Nuxeo).
 */
declare const NUXEO_API_ORIGIN: InjectionToken<string>;
/**
 * The actual Nuxeo server URL as seen by external clients (e.g. Nuxeo Drive desktop app).
 * Unlike NUXEO_API_ORIGIN (which can be '' to use the dev proxy), this must always be the
 * real reachable Nuxeo server URL so desktop apps can connect directly without the proxy.
 * Defaults to window.location.origin + '/nuxeo', which is correct for same-origin deployments.
 * Override in app.config.ts for local dev (Angular dev proxy ≠ Nuxeo server).
 */
declare const NUXEO_SERVER_URL: InjectionToken<string>;

/**
 * Injection token to provide the current authenticated username.
 * The app shell provides this value from AuthService so that
 * feature libraries can access the current user without importing AuthService directly.
 */
declare const CURRENT_USERNAME: InjectionToken<() => string | null>;

interface AdminAccessChecks {
    isAdministrator: () => boolean;
    isPowerUser: () => boolean;
    hasAdministrationAccess: () => boolean;
}
/**
 * Feature libraries use this token for administration route guards without
 * importing the app-shell `AuthService`.
 */
declare const ADMIN_ACCESS_CHECKS: InjectionToken<AdminAccessChecks>;

/** Allows administrators and powerusers; others go to dashboard. */
declare const administrationAccessGuard: CanActivateFn;
/** Redirects `/administration` to analytics (admins) or users-groups (powerusers). */
declare const administrationLandingGuard: CanActivateFn;
/** Blocks powerusers from full-administration routes. */
declare const fullAdministratorGuard: CanActivateFn;

/** Nuxeo built-in group granting limited administration access in Web UI. */
declare const NUXEO_POWERUSERS_GROUP = "powerusers";
/** Reads `properties.groups` from Nuxeo `GET /me` (shape varies slightly by version). */
declare function readGroupsFromMe(me: unknown): string[];
/** True when the user belongs to the `powerusers` group (case-insensitive). */
declare function isPowerUserFromGroups(groups: readonly string[]): boolean;

/** One SAML / SSO entry point exposed by your Nuxeo server (path is relative to the Nuxeo origin). */
interface NuxeoSamlLoginEndpoint {
    id: string;
    label: string;
    /**
     * Path beginning with `/nuxeo/…` that starts the IdP flow when opened in the browser.
     * Replace with the real URLs from your Nuxeo version (inspect stock Web UI or admin docs).
     * Examples (registration ids vary): `/nuxeo/oauth2/authorization/my-azure-registration`
     */
    path: string;
}
/**
 * SAML / OIDC-style login buttons on the Angular login page. Each entry navigates the window to
 * `resolveNuxeoBrowserOrigin() + path` (+ optional `requestedUrl` if enabled).
 */
declare const NUXEO_SAML_LOGIN_ENDPOINTS: InjectionToken<NuxeoSamlLoginEndpoint[]>;
/**
 * When starting SSO, Nuxeo may accept a post-login URL (e.g. `requestedUrl`). This is the path
 * on the **Angular** site (same host as the SPA), e.g. `/dashboard`.
 */
declare const NUXEO_SSO_POST_LOGIN_PATH: InjectionToken<string>;
/**
 * Query parameter name for return URL after SSO (Nuxeo form login often uses `requestedUrl`).
 * Set to `null` to skip appending (e.g. when the IdP relay state is fixed in Nuxeo only).
 */
declare const NUXEO_SSO_RETURN_QUERY_PARAM: InjectionToken<string | null>;

declare class NuxeoApiBase {
    private readonly http;
    private readonly apiOrigin;
    apiUrl(path: string): string;
    get<T>(path: string, params?: HttpParams, headers?: Record<string, string>): Observable<T>;
    post<T>(path: string, body: unknown, headers?: Record<string, string>): Observable<T>;
    put<T>(path: string, body: unknown, headers?: Record<string, string>): Observable<T>;
    delete<T>(path: string, headers?: Record<string, string>): Observable<T>;
    nxqlSearch(query: string, pageSize: number, headers?: Record<string, string>): Observable<NuxeoDocumentList>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NuxeoApiBase, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NuxeoApiBase>;
}

declare class AssetService {
    private readonly api;
    searchAssets(params?: AssetSearchParams): Observable<AssetSearchResult>;
    static ɵfac: i0.ɵɵFactoryDeclaration<AssetService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AssetService>;
}

interface AssetQueueItem {
    id: string;
    title: string;
    type: string;
    icon: string;
}
declare class AssetAggregationService {
    readonly aggregations: i0.WritableSignal<AssetAggregations>;
    readonly items: i0.WritableSignal<AssetQueueItem[]>;
    readonly selectedSavedSearchId: i0.WritableSignal<string>;
    readonly selectedSavedSearchTitle: i0.WritableSignal<string>;
    readonly savedSearchVersion: i0.WritableSignal<number>;
    markSavedSearchDirty(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<AssetAggregationService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AssetAggregationService>;
}

declare class DocumentService {
    private readonly api;
    getRecentlyEdited(pageSize?: number): Observable<NuxeoDocumentList>;
    getRecentlyViewed(userId: string, pageSize?: number): Observable<NuxeoDocumentList>;
    getExpiredDocuments(pageSize?: number): Observable<NuxeoDocumentList>;
    getById(docId: string): Observable<NuxeoDocument>;
    static ɵfac: i0.ɵɵFactoryDeclaration<DocumentService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DocumentService>;
}

declare const BLOB_HOLDING_DOC_TYPES: ReadonlySet<string>;
declare function isBlobHoldingDocType(docType: string): boolean;
/** True when Nuxeo returned a non-empty main blob on the document. */
declare function documentHasMainBlob(doc: NuxeoDocument): boolean;
/**
 * True when `file:content` is a persisted blob (not a pending upload-batch reference
 * and not merely a filename placeholder before binary storage completes).
 */
declare function documentHasPersistedMainBlob(doc: NuxeoDocument): boolean;
declare const BLOB_NOT_ATTACHED_ERROR = "File was not attached to the document";
/** True if documents can be created under this document. */
declare function isFolderishDocument(doc: Pick<NuxeoDocument, 'type' | 'facets'> | null): boolean;
/** Browse/nav tree nodes: folderish containers plus User Workspace Favorites. */
declare function isBrowsableNavNode(doc: NuxeoDocument | null): boolean;
declare function sanitizeDocumentName(name: string): string;
/** Web UI `_sanitizeName`: document path segment from title (slashes only). */
declare function sanitizeDocumentCreateName(name: string): string;
/** Server `@emptyWithDefault` payload used to seed document creation (Web UI parity). */
interface NuxeoCreateDocumentTemplate {
    name?: string;
    properties?: Record<string, unknown>;
}
/**
 * Merge user overrides into a server `@emptyWithDefault` template (Nuxeo Web UI create flow).
 * Skips null/empty overrides so server defaults (e.g. Domain schema fields) are preserved.
 */
declare function mergeCreateDocumentBody(template: NuxeoCreateDocumentTemplate, docType: string, nameFallback: string, overrides: Record<string, unknown>): Record<string, unknown>;
/** Default location when no browse context is provided (e.g. Dashboard Add Content). */
declare const DEFAULT_IMPORT_PARENT_PATH = "/";
/** Catalogue key for the hint shown when the chosen location cannot hold new content. */
declare const RESTRICTED_IMPORT_LOCATION_MESSAGE_KEY = "browse.message.restricted-import-location";
/** True when the path is the repository root (Domain creation only). */
declare function isRepositoryRootPath(path: string | null | undefined): boolean;
/** True when generic content cannot be created or imported at this path (domain container). */
declare function isRestrictedImportParentPath(path: string | null | undefined): boolean;
interface CsvImportResult {
    created: NuxeoDocument[];
    skipped: string[];
    errors: string[];
}
/** Options for server-side CSV import via Nuxeo CSV addon (`CSV.Import`). */
interface CsvServerImportOptions {
    path: string;
    file: File;
    /** Email the import report when the server finishes processing. */
    sendReport?: boolean;
    /** Preserve UUID, dates, author, and contributors from the CSV (document import mode). */
    documentMode?: boolean;
    /** Trim whitespace from CSV cell values (server default). */
    trim?: boolean;
}
/** Options for {@link DocumentImportService.importFiles}. */
interface ImportFilesOptions {
    /** When true, run post-upload classification hook after each File document is created. */
    autoClassify?: boolean;
    /** Reports upload/create progress (0–100) for UI progress bars. */
    onProgress?: (progress: ImportProgress) => void;
}
/** One file in bulk import-with-properties (per-file type and Dublin Core metadata). */
interface ImportFileEntry {
    file: File;
    docType: string;
    properties: Record<string, unknown>;
}
/** Infer blob-holding Nuxeo type from file MIME type / extension (Web UI import parity). */
declare function inferBlobDocTypeFromFile(file: File): string;
/** Pick an allowed creatable blob type for import, preferring MIME-based inference. */
declare function resolveImportBlobDocType(file: File, allowedTypes: readonly string[]): string;
declare function titleFromFileName(fileName: string): string;
/** Progress payload for blob upload and document creation flows. */
interface ImportProgress {
    phase: 'uploading' | 'creating';
    /** Overall progress from 0 to 100. */
    percent: number;
    fileIndex?: number;
    fileCount?: number;
}
interface CreateBlobHoldingDocumentOptions {
    onProgress?: (progress: ImportProgress) => void;
}
/** Result of staging a file in an upload batch before document creation (Web UI immediate upload). */
interface StagedBatchFile {
    batchId: string;
    fileIndex: number;
}
interface StageFileInBatchOptions {
    onProgress?: (percent: number) => void;
}
declare class DocumentImportService {
    private readonly http;
    private readonly api;
    /**
     * Default folder when no browse context is passed (e.g. Dashboard).
     * Uses repository root (`/`) so administrators can create domains.
     */
    getDefaultImportParentPath(): Observable<string>;
    /**
     * Bulk CSV import via Nuxeo CSV addon (`POST /automation/CSV.Import`).
     * @see https://doc.nuxeo.com/nxdoc/nuxeo-csv/
     */
    importCsvFile(options: CsvServerImportOptions): Observable<string>;
    /**
     * Start a batch upload session (`POST /api/v1/upload/new/default`).
     * @see https://doc.nuxeo.com/nxdoc/howto-upload-file-nuxeo-using-rest-api/
     */
    initUploadBatch(handler?: string): Observable<string>;
    /** Upload one file into a batch index (0-based). */
    uploadFileToBatch(batchId: string, fileIndex: number, file: File, onUploadPercent?: (percent: number) => void): Observable<void>;
    /**
     * URL to create a document under a folder.
     * Nuxeo expects `POST /api/v1/path{parentPath}` with a JSON body — not `.../@children`
     * (`@children` is for GET listing; POST there can return 405).
     */
    private urlCreateUnderPath;
    /**
     * Empty document model with server defaults for a type under `parentPath`.
     * @see https://doc.nuxeo.com/nxdoc/rest-api-web-adapters/ (`@emptyWithDefault`)
     */
    getEmptyDocumentWithDefaults(parentPath: string, docType: string): Observable<NuxeoCreateDocumentTemplate>;
    /**
     * Create a File document under `parentPath` using an uploaded batch blob.
     * @param batchNoDrop — pass true when more creations will use the same batch (Nuxeo clears the batch after first use unless this header is set).
     */
    createFileFromBatch(parentPath: string, fileName: string, docType: string, properties: Record<string, unknown>, batchId: string, fileIndex: number, batchNoDrop?: boolean): Observable<NuxeoDocument>;
    createChildDocument(parentPath: string, name: string, docType: string, properties: Record<string, unknown>): Observable<NuxeoDocument>;
    /**
     * Create a blob-holding document (File, Audio, Picture, Video) with an uploaded batch file.
     */
    createDocumentWithBlob(parentPath: string, name: string, docType: string, properties: Record<string, unknown>, batchId: string, fileIndex: number): Observable<NuxeoDocument>;
    /**
     * Upload a file to a new batch immediately on selection (Nuxeo Web UI `immediate` upload).
     * Document creation can later reference the returned `batchId` / `fileIndex`.
     */
    stageFileInBatch(file: File, options?: StageFileInBatchOptions): Observable<StagedBatchFile>;
    /**
     * Create a blob-holding document from a file already staged in an upload batch.
     */
    createBlobHoldingDocumentFromBatch(parentPath: string, name: string, docType: string, properties: Record<string, unknown>, batchId: string, fileIndex: number, options?: CreateBlobHoldingDocumentOptions): Observable<NuxeoDocument>;
    /**
     * Create a blob-holding document, preferring a staged batch when still available on the server.
     * Falls back to a fresh upload+create when the batch expired (common after immediate upload UX).
     */
    createBlobHoldingDocumentReliable(parentPath: string, name: string, docType: string, properties: Record<string, unknown>, file: File, stagedBatch?: StagedBatchFile | null, options?: CreateBlobHoldingDocumentOptions): Observable<NuxeoDocument>;
    /**
     * Initialize a batch, upload `file`, and create a blob-holding document with `file:content` set.
     */
    createBlobHoldingDocument(parentPath: string, name: string, docType: string, properties: Record<string, unknown>, file: File, options?: CreateBlobHoldingDocumentOptions): Observable<NuxeoDocument>;
    /** Upload multiple files as File documents (single batch, sequential API calls). */
    importFiles(parentPath: string, files: File[], options?: ImportFilesOptions): Observable<NuxeoDocument[]>;
    /**
     * Bulk import with per-file document type and metadata (Nuxeo Web UI “Import with Properties”).
     */
    importFilesWithProperties(parentPath: string, entries: ImportFileEntry[], options?: ImportFilesOptions): Observable<NuxeoDocument[]>;
    /** Web UI parity: seed blob create from `@emptyWithDefault`, merge user props, attach batch blob. */
    private buildBlobDocumentCreateRequest;
    private isBatchFileAvailable;
    private verifyBatchFileUploaded;
    /**
     * Nuxeo may return create responses without hydrated `file:content` (null, batch refs,
     * or name-only placeholders). Poll until the binary is persisted before returning.
     */
    private withMainBlobValidation;
    private ensurePersistedMainBlob;
    private pollDocumentMainBlob;
    private fetchDocumentMainBlob;
    /**
     * Nuxeo Cloud may omit `file:content` from properties GET even after a successful batch attach.
     * Web UI reads blobs via `@blob`; fall back to HEAD on that endpoint before failing create.
     */
    private enrichDocumentFromBlobEndpointIfNeeded;
    /**
     * Placeholder for post-upload classification (e.g. Nuxeo automation / Document AI).
     * When `enabled` is false, returns the document unchanged.
     */
    private runPostUploadClassificationIfEnabled;
    /**
     * Nuxeo-style CSV (name, type, dc:title, …). Creates trees when `name` uses `/` segments.
     * Rows with `file:content` are skipped (binary import needs server-side Nuxeo CSV).
     */
    importFromCsvText(parentPath: string, csvText: string): Observable<CsvImportResult>;
    static ɵfac: i0.ɵɵFactoryDeclaration<DocumentImportService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DocumentImportService>;
}
/**
 * Strip HTML from Nuxeo CSV import report for plain-text display. Empty when the report carries
 * no text, so the caller can supply its own translated fallback.
 */
declare function summarizeCsvImportReport(report: string): string;

declare class TaskService {
    private readonly api;
    /** Emits whenever tasks are mutated (completed, delegated, reassigned, abandoned). */
    readonly tasksChanged$: Subject<void>;
    /** Notify all subscribers that the task list has changed. */
    notifyTasksChanged(): void;
    /** Fetch headers to resolve task targets and actors. */
    private readonly taskFetchHeaders;
    getUserTasks(userId: string, pageSize?: number): Observable<NuxeoTask[]>;
    /** Get a specific task by ID (with enriched targets & actors). */
    getTask(taskId: string): Observable<NuxeoTask>;
    /** Get tasks for a document. */
    getDocumentTasks(docId: string, userId?: string): Observable<NuxeoTask[]>;
    /**
     * Complete a task by executing an action (e.g., start_review, approve, reject, validate).
     * Variables are task-specific (comment, participants, end_date, etc.).
     */
    completeTask(taskId: string, action: string, variables?: Record<string, unknown>, comment?: string): Observable<NuxeoTask>;
    /** Reassign a task to other actors (replaces current actors). */
    reassignTask(taskId: string, actors: string[], comment?: string): Observable<void>;
    /** Delegate a task to additional actors (keeps original actors). */
    delegateTask(taskId: string, delegatedActors: string[], comment?: string): Observable<void>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TaskService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<TaskService>;
}

interface NavTreeBootstrap {
    root: NuxeoDocument;
    entries: NuxeoDocument[];
}
/** One server-side sort key: a Nuxeo property name such as `dc:title`, and its direction. */
interface BrowseSortEntry {
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
}
/**
 * Which page of a browse listing to fetch, and in which server-side order.
 *
 * Every browse source honours both — ordinary folders through `@children`, `Root` through the
 * `tree_children` page provider, `Domain` through `@children`, and `Favorites` and `Collection`
 * through `default_content_collection` — so a listing never has to sort a page in the browser.
 */
interface BrowsePageRequest {
    currentPageIndex?: number;
    sort?: BrowseSortEntry[];
}
interface BrowseFolderContents {
    folder: NuxeoDocument;
    entries: NuxeoDocument[];
    /**
     * Nuxeo's own count, **negative when it did not count**.
     *
     * Real only when the folder fits on one page — `resultsCountLimit` is the requested `pageSize`.
     * Read `hasNextPage` for pagination rather than deriving a page count from this.
     */
    totalSize: number;
    /** Whether Nuxeo has another page. The only reliable pagination fact when `totalSize` is negative. */
    hasNextPage?: boolean;
    /** Present when a restricted user should land on their only accessible folder. */
    redirectTo?: string;
}
declare class BrowseService {
    private readonly api;
    private readonly http;
    private static readonly ACCESSIBLE_DOMAINS_NXQL;
    private static readonly ACCESSIBLE_NAV_NODES_NXQL;
    getByPath(nuxeoPath: string): Observable<NuxeoDocument>;
    /** Current user's personal workspace (Web UI: `User.GetUserWorkspace` automation). */
    getUserWorkspace(): Observable<NuxeoDocument>;
    /**
     * Repository root for the browse nav tree. Users with domain-only ACLs may receive 403 on
     * `GET /path/` but can still resolve the root uid from an accessible Domain via NXQL.
     */
    getRepositoryRoot(): Observable<NuxeoDocument>;
    /**
     * Loads the browse nav tree root plus top-level folder entries. Handles administrators,
     * domain-scoped users, and read-only users who only have workspace/folder ACLs.
     */
    getNavTreeBootstrap(pageSize?: number): Observable<NavTreeBootstrap>;
    /**
     * Loads the current browse folder and its children. When repository root is not readable,
     * falls back to accessible top-level folders (User Workspaces, domain-scoped ACLs, etc.).
     */
    getBrowseFolderContents(nuxeoPath: string, pageSize?: number, page?: BrowsePageRequest): Observable<BrowseFolderContents>;
    private listBrowseFolderEntries;
    /**
     * Collection / Favorites members, one page at a time (Nuxeo Web UI uses
     * `default_content_collection`, not `@children`).
     *
     * Unlike `@children`, this page provider answers a sort key it cannot use with HTTP 400 rather
     * than an empty page, and it counts every member, so `totalSize` is real on every page.
     */
    getCollectionMembers(collectionUid: string, pageSize?: number, page?: BrowsePageRequest): Observable<NuxeoDocumentList>;
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
    private toBrowseEntryList;
    private resolveRepositoryRootFromDomains;
    private loadNavTreeBootstrapEntries;
    private getAccessibleTopLevelNavNodes;
    private filterTopLevelNavNodes;
    private syntheticRepositoryRoot;
    /** Folder metadata plus allowed child document types (`@subtypes` enricher). */
    getFolderContext(nuxeoPath: string): Observable<NuxeoDocument>;
    /**
     * Allowed child document types for `nuxeoPath`, from the Nuxeo `subtypes` enricher.
     * @see https://doc.nuxeo.com/rest-api/1/document-enrichers/#subtypes
     */
    getCreatableSubtypes(nuxeoPath: string): Observable<string[]>;
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
    getNavTreeChildren(parent: NuxeoDocument, pageSize?: number, page?: BrowsePageRequest): Observable<NuxeoDocumentList>;
    /**
     * Which of these folders contain at least one folder the browse tree would list.
     *
     * One query for a whole tree level, matching the `tree_children` page provider's own filter, so
     * a tree can drop the expand arrow from folders that hold only files. `null` when the answer is
     * incomplete — more matches than one page — so a caller keeps the arrow rather than hiding a
     * branch that exists.
     */
    getFolderIdsWithSubfolders(parentUids: readonly string[]): Observable<ReadonlySet<string> | null>;
    private static readonly SUBFOLDER_PROBE_PAGE_SIZE;
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
    private keepEntries;
    private getTreeChildrenWithPathFallback;
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
    getChildren(nuxeoPath: string, pageSize?: number, currentPageIndex?: number, sort?: BrowseSortEntry[]): Observable<NuxeoDocumentList>;
    /**
     * Folder children for the browse tree via Nuxeo's `tree_children` page provider
     * (same query Nuxeo Web UI uses: Folderish, not trashed, not hidden in navigation).
     * Fetches all pages when the provider marks additional pages available.
     */
    getTreeChildren(parentUid: string, pageSize?: number): Observable<NuxeoDocumentList>;
    /** One page of `tree_children`, in the order asked for: a repository root listed as a folder. */
    private getTreeChildrenPage;
    updateDocument(uid: string, properties: Record<string, unknown>, options?: {
        enrichPermissions?: boolean;
    }): Observable<NuxeoDocument>;
    /** Copy clipboard items into `targetUid` (Web UI: `Document.Copy`). */
    copyDocuments(uids: string[], targetUid: string): Observable<NuxeoDocument[]>;
    /** Move clipboard items into `targetUid` (Web UI: `Document.Move`). */
    moveDocuments(uids: string[], targetUid: string): Observable<NuxeoDocument[]>;
    private runClipboardDocumentsOp;
    private normalizeClipboardOpResult;
    /** True when the Collections folder still has at least one non-trashed child collection. */
    hasChildCollections(collectionsFolderUid: string): Observable<boolean>;
    getTrashedChildren(parentUid: string, pageSize?: number): Observable<NuxeoDocumentList>;
    restoreDocument(uid: string): Observable<NuxeoDocument>;
    /**
     * Triggers an async CSV export via Nuxeo Bulk.RunAction.
     *
     * POST /@async returns 202 with Location header containing the execution ID:
     *   Location: .../Bulk.RunAction/@async/{executionId}/status
     */
    startCsvExport(parentUid: string): Observable<string>;
    /**
     * Polls /@async/{executionId}/status until done, then downloads the CSV.
     *
     * Native flow: GET /status → 202 (running) or 303 (done, redirects).
     * The 303 redirect goes cross-origin (proxy→Nuxeo), so the browser
     * drops the auth header causing a 401. We catch that 401 as the
     * "completed" signal, then fetch the result with a separate
     * authenticated request through the proxy.
     */
    pollAndDownloadCsv(executionId: string): Observable<Blob>;
    static ɵfac: i0.ɵɵFactoryDeclaration<BrowseService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<BrowseService>;
}

declare class CollectionService {
    private readonly api;
    private readonly http;
    getById(uid: string): Observable<NuxeoDocument>;
    getAll(pageSize?: number): Observable<NuxeoDocumentList>;
    getFavorites(userId: string, pageSize?: number): Observable<NuxeoDocumentList>;
    /**
     * One page of a collection's members, in the order asked for. The page provider counts every
     * member, so `totalSize` is the collection's size on every page.
     */
    getCollectionMembers(collectionUid: string, pageSize?: number, page?: BrowsePageRequest): Observable<NuxeoDocumentList>;
    updateProperties(uid: string, properties: Record<string, unknown>): Observable<NuxeoDocument>;
    /**
     * Triggers a bulk download of all member documents in a collection,
     * returned as a zip file. Uses the Nuxeo `Blob.BulkDownload` automation.
     */
    bulkDownload(collectionUid: string, filename?: string): Observable<Blob>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CollectionService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<CollectionService>;
}

/** Clipboard copy/move completed into a browse folder (Web UI: `clipboard-action-performed`). */
interface ClipboardPasteEvent {
    targetUid: string;
    documents: NuxeoDocument[];
    action: 'copy' | 'move';
}
/**
 * Tracks the Nuxeo path that drives the browse nav tree, matching Nuxeo Web UI:
 * folder/workspace navigation updates the path; opening a document keeps the tree
 * aligned to the containing folder (or the folder itself when folderish).
 */
declare class BrowseContextService {
    readonly contextPath: i0.WritableSignal<string>;
    /** Incremented when the browse nav tree should reload (e.g. after domain creation). */
    readonly treeRefreshTick: i0.WritableSignal<number>;
    /** Incremented when the browse main view should reload folder children (e.g. after domain creation). */
    readonly contentRefreshTick: i0.WritableSignal<number>;
    /** Incremented when clipboard copy/move completes so browse can merge API results immediately. */
    readonly clipboardPasteTick: i0.WritableSignal<number>;
    private pendingClipboardPaste;
    /** Ask the browse nav drawer to reload its folder tree on next open (or immediately if open). */
    requestTreeRefresh(): void;
    /** Ask the browse page to reload the current folder listing (e.g. after domain creation). */
    requestContentRefresh(): void;
    /** Record clipboard paste results and refresh browse (optimistic merge + delayed server reload). */
    notifyClipboardPasteComplete(event: ClipboardPasteEvent): void;
    /** Returns the latest clipboard paste payload once per tick (browse consumer). */
    consumeClipboardPasteEvent(): ClipboardPasteEvent | null;
    /** Reset browse navigation context (e.g. on sign-out / user switch). */
    resetContext(): void;
    setFromRouterUrl(routerUrl: string): void;
    setFromDocument(doc: NuxeoDocument): void;
    setFromNuxeoPath(nuxeoPath: string): void;
    private setPath;
    static ɵfac: i0.ɵɵFactoryDeclaration<BrowseContextService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<BrowseContextService>;
}

/**
 * Current browse folder used as the paste target for clipboard Copy/Move (Web UI: `target-document`).
 * Updated by {@link BrowseComponent} while the user is browsing.
 */
declare class ClipboardTargetService {
    readonly target: i0.WritableSignal<NuxeoDocument | null>;
    setTarget(doc: NuxeoDocument | null): void;
    clear(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ClipboardTargetService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ClipboardTargetService>;
}

/** Decode a single URL-encoded browse path segment (e.g. `Domain%201` → `Domain 1`). */
declare function decodeNuxeoPathSegment(segment: string): string;
/** True when the router URL is a browse main-view route. */
declare function isBrowseRouterUrl(routerUrl: string): boolean;
/** Parse the Nuxeo repository path from a router URL (e.g. `/#/browse/default-domain/foo` → `/default-domain/foo`). */
declare function parseBrowseNuxeoPathFromRouterUrl(routerUrl: string): string;
/** Normalize a Nuxeo path for stable comparisons. */
declare function normalizeNuxeoPath(path: string): string;
/** Case-insensitive Nuxeo path equality (Nuxeo may vary segment casing per server). */
declare function nuxeoPathsEqual(a: string, b: string): boolean;
/** Segment-wise path comparison tolerating spaces vs hyphens and casing. */
declare function nuxeoPathSegments(path: string): string[];
declare function nuxeoPathsEqualFlexible(a: string, b: string): boolean;
/** Build an app browse route from a repository path. */
declare function toBrowseRouterUrl(nuxeoPath: string): string;
/** Parent folder path for a document path (e.g. `/a/b/file.pdf` → `/a/b`). */
declare function parentNuxeoFolderPath(docPath: string): string;
/**
 * Nuxeo Web UI browse-tree context: folderish containers use their path;
 * leaf documents highlight their containing folder in the tree.
 */
declare function browseTreeContextPath(doc: NuxeoDocument): string;
/**
 * Cumulative path prefixes for tree expansion, e.g.
 * `/default-domain/workspaces` → [`/default-domain`, `/default-domain/workspaces`].
 */
declare function cumulativeNuxeoPathPrefixes(nuxeoPath: string): string[];
/** First path segment as a folder path (e.g. `/Domain-5/workspaces` → `/Domain-5`). */
declare function topLevelNuxeoFolderPath(nuxeoPath: string): string | null;
/** Prefixes that must be expanded to reveal the active folder (all but the last segment). */
declare function expandableNuxeoPathPrefixes(nuxeoPath: string): string[];
/** True when `path` is under a `UserWorkspaces` segment (personal workspace tree). */
declare function isUserWorkspacePath(nuxeoPath: string): boolean;
/** Owner username from a personal workspace path, e.g. `/…/UserWorkspaces/jdoe/…` → `jdoe`. */
declare function userWorkspaceOwnerFromPath(nuxeoPath: string): string | null;
/** Personal workspace root path, e.g. `/default-domain/UserWorkspaces/jdoe`. */
declare function userWorkspaceRootFromPath(nuxeoPath: string): string | null;
/**
 * Web UI: non-admins viewing another user's personal workspace do not get breadcrumbs.
 * Admins and the workspace owner always see them.
 */
declare function shouldShowUserWorkspaceBreadcrumbs(nuxeoPath: string, currentUsername: string | null, isAdministrator: boolean): boolean;
/** Browse route to open after trashing a document under UserWorkspaces (workspace root). */
declare function userWorkspaceBrowseRouterUrl(nuxeoPath: string): string | null;
/** Fallback browse route after trash: parent folder, else workspace root, else repository root. */
declare function postTrashBrowseRouterUrl(deletedDocPath: string): string;
/** True when the document is a user collection (type or facet; optional create-time type hint). */
declare function isCollectionDocument(doc: Pick<NuxeoDocument, 'type' | 'facets'> | null | undefined, docTypeHint?: string): boolean;
/**
 * Web UI parity: Collection documents open the collection view; folderish containers open
 * browse; everything else opens document detail.
 */
declare function documentNavigationUrl(doc: Pick<NuxeoDocument, 'uid' | 'type' | 'path' | 'facets'>, docTypeHint?: string): string;

/**
 * Triggers HxAI Content Lake ingestion for Nuxeo documents via the
 * `nuxeo-hxai-connector` bulk `ingest` action. The Angular app never calls
 * Content Lake directly — files must exist in Nuxeo first.
 */
declare class ContentLakeIngestService {
    private readonly api;
    private readonly browseService;
    private readonly translate;
    startIngest(documentUids: string[]): Observable<ContentLakeIngestCommand>;
    getStatus(commandId: string): Observable<ContentLakeIngestStatus>;
    waitUntilComplete(commandId: string, pollIntervalMs?: number, maxPollAttempts?: number): Observable<ContentLakeIngestStatus>;
    /**
     * Find repository documents that match selected files (name + blob size) and are
     * already in Content Lake — via local ingest marker or `HylandIngest.CheckDigest`.
     */
    findDuplicates(files: File[], sourceIds?: string[]): Observable<ContentLakeDuplicate[]>;
    private resolveDuplicateForFile;
    private probeFirstContentLakeMatch;
    /**
     * Ask the CIC ingest connector whether the document blob is already present
     * in Content Lake. Tries each `sourceId` in order, then falls back to the
     * server default (`nuxeo.hyland.cic.ingest.default.sourceId`) when set.
     */
    checkIngested(documentUid: string, sourceIds?: string[]): Observable<boolean>;
    /**
     * On document open, probe Content Lake via `HylandIngest.CheckDigest` and
     * backfill the local ingest marker when the blob is already indexed.
     */
    backfillIngestMarkerIfNeeded(doc: NuxeoDocument, sourceIds?: string[]): Observable<ContentLakeBackfillResult>;
    private checkIngestedOnce;
    /** Persist an ingest marker on each document so the UI can skip duplicate ingests. */
    markIngested(documentUids: string[]): Observable<NuxeoDocument[]>;
    private markSingleDocumentIngested;
    private buildIngestQuery;
    private throwIfAutomationException;
    private readCommandId;
    private readCommandIdFromRecord;
    private normalizeStatus;
    private buildStalledIngestMessage;
    private readNumber;
    private readOptionalNumber;
    private isTerminal;
    static ɵfac: i0.ɵɵFactoryDeclaration<ContentLakeIngestService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ContentLakeIngestService>;
}

/** Catalogue key for the hint shown under the notify checkbox in permission dialogs. */
declare const PERMISSION_NOTIFICATION_MAIL_HINT_KEY = "permissions.notification.mail-hint";
/**
 * Resolves a catalogue key. Passed in rather than injected so this module stays free of Angular
 * DI — the same contract as `permissionRightLabel`.
 */
type PermissionMessageTranslate = (key: string) => string;
interface PermissionWithNotificationResult {
    document: NuxeoDocument;
    notificationSent: boolean;
    /**
     * Catalogue key of the message explaining why the notification was not sent. A key rather than
     * text so the service needs no translation dependency; the dialog showing it resolves it.
     */
    notificationErrorKey?: string;
}
/** Nuxeo surfaces SMTP failures with "sending a mail" in the automation error message. */
declare function isMailSendError(err: unknown): boolean;
declare function mailSendFailureKey(context: 'add' | 'update' | 'send'): string;
declare function mailSendFailureMessage(context: 'add' | 'update' | 'send', translate: PermissionMessageTranslate): string;
declare function permissionCreateMailFailureMessage(translate: PermissionMessageTranslate): string;
declare function permissionUpdateMailFailureMessage(translate: PermissionMessageTranslate): string;
/** Permission saved but local ACE id could not be resolved for a follow-up notification send. */
declare function permissionNotificationAceNotFoundKey(context: 'add' | 'update'): string;
declare function permissionNotificationAceNotFoundMessage(context: 'add' | 'update', translate: PermissionMessageTranslate): string;
/** Locates a granted local ACE for a user or group principal after AddPermission. */
declare function findLocalAceForPrincipal(doc: NuxeoDocument, principalId: string): NuxeoAce | undefined;

declare class DocumentDetailService {
    private readonly api;
    private readonly http;
    private readonly currentUsername;
    getFullDocument(uid: string): Observable<NuxeoDocument>;
    getDocumentPermissions(uid: string): Observable<NuxeoDocument>;
    /** Main binary on file:content (Nuxeo Web UI pattern); falls back to blobholder:0. */
    fetchBlob(uid: string, options?: FetchBlobOptions): Observable<Blob>;
    fetchBlobByXpath(uid: string, xpath: string, options?: FetchBlobOptions): Observable<Blob>;
    fetchPdfRendition(uid: string): Observable<Blob>;
    fetchThumbnail(uid: string): Observable<Blob>;
    /**
     * A document's audit entries, one page. `query` filters and sorts on the server, so a filter
     * reaches every entry rather than only the page on screen. Dates go as instants: the adapter
     * reads a bare day as midnight in the server's zone, not the user's.
     */
    getAuditLog(uid: string, pageSize?: number, currentPageIndex?: number, query?: AuditLogQuery): Observable<AuditLogList>;
    getPublishedVersions(uid: string): Observable<NuxeoDocumentList>;
    getSectionTree(): Observable<NuxeoDocumentList>;
    publishDocument(uid: string, targetSectionId: string, options?: {
        override?: boolean;
        renditionName?: string;
        defaultRendition?: boolean;
    }): Observable<NuxeoDocument>;
    unpublishDocument(proxyUid: string): Observable<unknown>;
    republishDocument(sourceUid: string, targetSectionId: string): Observable<NuxeoDocument>;
    lockDocument(uid: string): Observable<NuxeoDocument>;
    unlockDocument(uid: string): Observable<NuxeoDocument>;
    addToFavorites(uid: string): Observable<NuxeoDocument>;
    removeFromFavorites(uid: string): Observable<NuxeoDocument>;
    trashDocument(uid: string): Observable<NuxeoDocument>;
    trashDocuments(uids: string[]): Observable<NuxeoDocument[]>;
    restoreFromTrash(uid: string): Observable<NuxeoDocument>;
    permanentlyDelete(uid: string): Observable<void>;
    subscribe(uid: string, notifications?: string): Observable<NuxeoDocument>;
    unsubscribe(uid: string, notifications?: string): Observable<NuxeoDocument>;
    addToCollection(uid: string, collectionId: string): Observable<NuxeoDocument>;
    getCollections(): Observable<NuxeoDocumentList>;
    exportBlob(uid: string): Observable<Blob>;
    exportZip(uid: string, filename?: string): Observable<Blob>;
    bulkDownload(uids: string[], filename?: string): Observable<Blob>;
    exportXml(uid: string): Observable<Blob>;
    getAvailableWorkflows(uid: string): Observable<{
        entries: Array<{
            workflowModelName: string;
            title: string;
        }>;
    }>;
    /**
     * Returns only the workflows that can actually be started on this document,
     * respecting lifecycle-state filters (e.g. approved docs hide Serial/Parallel review).
     */
    getRunnableWorkflows(uid: string): Observable<NuxeoWorkflowModel[]>;
    createCollection(title: string, description?: string): Observable<NuxeoDocument>;
    searchUsersGroups(searchTerm: string): Observable<UserGroupSuggestion[]>;
    addACE(uid: string, params: {
        user: string;
        permission: string;
        notify?: boolean;
        comment?: string;
        begin?: string;
        end?: string;
    }): Observable<NuxeoDocument>;
    /**
     * Drops a whole named ACL, `local` by default.
     *
     * Nuxeo has no "replace this ACL" operation, so a caller holding a complete desired ACL clears
     * and replays it. That is destructive between the two calls: an ACL cleared by a request whose
     * replay then fails leaves the document relying on inheritance alone. Nuxeo still enforces
     * `WriteSecurity` on both calls, so this cannot grant the caller anything they did not have.
     */
    removeAcl(uid: string, acl?: string): Observable<NuxeoDocument>;
    blockPermissionInheritance(uid: string): Observable<NuxeoDocument>;
    unblockPermissionInheritance(uid: string): Observable<NuxeoDocument>;
    replaceACE(uid: string, params: {
        user: string;
        permission: string;
        overwrite?: boolean;
        notify?: boolean;
        comment?: string;
        begin?: string;
        end?: string;
    }): Observable<NuxeoDocument>;
    replacePermission(uid: string, params: {
        username?: string;
        email?: string | null;
        permission: string;
        begin?: string | null;
        end?: string | null;
        notify?: boolean;
        comment?: string | null;
        id?: string;
    }): Observable<NuxeoDocument>;
    addPermission(uid: string, params: {
        username?: string;
        email?: string;
        permission: string;
        notify?: boolean;
        comment?: string;
        begin?: string | null;
        end?: string | null;
        creator?: string;
    }): Observable<NuxeoDocument>;
    addExternalPermission(uid: string, params: {
        email: string;
        permission: string;
        notify?: boolean;
        comment?: string;
        begin?: string | null;
        end?: string | null;
        creator?: string;
    }): Observable<NuxeoDocument>;
    /**
     * Adds a permission, then sends the notification in a separate call so SMTP
     * failures surface to the UI instead of being swallowed by Document.AddPermission.
     */
    addPermissionWithNotification(uid: string, params: {
        username: string;
        permission: string;
        notify?: boolean;
        comment?: string;
        begin?: string | null;
        end?: string | null;
        creator?: string;
    }): Observable<PermissionWithNotificationResult>;
    /**
     * Replaces a permission, then optionally sends the notification email separately.
     */
    replacePermissionWithNotification(uid: string, params: {
        id: string;
        username: string;
        permission: string;
        notify?: boolean;
        comment?: string | null;
        begin?: string | null;
        end?: string | null;
    }): Observable<PermissionWithNotificationResult>;
    /** Adds an external (email) permission with optional separate notification send. */
    addExternalPermissionWithNotification(uid: string, params: {
        email: string;
        permission: string;
        notify?: boolean;
        comment?: string;
        begin?: string | null;
        end?: string | null;
        creator?: string;
    }): Observable<PermissionWithNotificationResult>;
    /** Nuxeo stores this on the ACE as the "Granted by" audit field. */
    private creatorParam;
    sendNotificationEmailForPermission(uid: string, aceId: string): Observable<NuxeoDocument>;
    private notifyAfterPermissionChange;
    private sendPermissionNotificationResult;
    /**
     * Removes **every** ACE `user` holds in `acl`, whatever `permission` says.
     *
     * `Document.RemovePermission` reads `user` as "all permissions for this user" and has no
     * `permission` parameter, so a principal holding `Read` and `WriteVersion` loses both when
     * either row is deleted. To remove one entry, use {@link removePermissionById}.
     */
    removePermission(uid: string, params: {
        user: string;
        permission: string;
        acl?: string;
    }): Observable<NuxeoDocument>;
    /**
     * Removes exactly one ACE, addressed by its Nuxeo id (`user:permission:granted:creator:begin:end`).
     *
     * Nuxeo answers 200 and changes nothing when no ACE has that id, so a caller that must know the
     * entry is gone re-reads the ACL afterwards.
     */
    removePermissionById(uid: string, aceId: string, acl?: string): Observable<NuxeoDocument>;
    uploadAttachment(uid: string, file: File): Observable<unknown>;
    removeAttachment(uid: string, index: number): Observable<NuxeoDocument>;
    replaceAttachment(uid: string, index: number, file: File): Observable<unknown>;
    removeMainFile(uid: string): Observable<NuxeoDocument>;
    replaceMainFile(uid: string, file: File): Observable<Blob>;
    createVersion(uid: string, increment: 'Major' | 'Minor'): Observable<NuxeoDocument>;
    getVersions(uid: string): Observable<NuxeoDocumentList>;
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
    getVersionsDirect(uid: string): Observable<NuxeoDocument[]>;
    /**
     * Create a version of a live document — Nuxeo's `Document.CheckIn`. Nuxeo takes the increment
     * as `'minor' | 'major'`, which `minor` chooses between.
     */
    checkInDocument(uid: string, minor?: boolean): Observable<NuxeoDocument>;
    /**
     * Replace the live document's content with a version's. `checkout: false` leaves it checked
     * in at that version (`0.1`), as Web UI does; `true` leaves it checked out (`0.2+`), which
     * reads as unversioned changes the user never made.
     */
    restoreVersion(versionUid: string): Observable<NuxeoDocument>;
    getComments(uid: string): Observable<NuxeoCommentList>;
    getAllComments(uid: string): Observable<NuxeoDocumentList>;
    createComment(uid: string, text: string): Observable<NuxeoComment>;
    createReply(uid: string, parentCommentId: string, text: string): Observable<NuxeoComment>;
    updateComment(uid: string, commentId: string, text: string): Observable<NuxeoComment>;
    deleteComment(uid: string, commentId: string): Observable<void>;
    static ɵfac: i0.ɵɵFactoryDeclaration<DocumentDetailService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DocumentDetailService>;
}
interface NuxeoComment {
    id: string;
    parentId: string;
    text: string;
    author: string;
    creationDate: string;
    modificationDate?: string;
    numberOfReplies?: number;
}
interface NuxeoCommentList {
    entries: NuxeoComment[];
    totalSize: number;
    currentPageSize: number;
    currentPageIndex: number;
    numberOfPages: number;
}
interface UserGroupSuggestion {
    id: string;
    displayLabel: string;
    type: 'USER_TYPE' | 'GROUP_TYPE';
    prefixed_id: string;
    username?: string;
    groupname?: string;
    email?: string;
}

declare class DirectoryService {
    private readonly api;
    private catalog$?;
    /** Nuxeo directory registry (name → metadata including parent vocabulary). */
    getDirectoryCatalog(): Observable<Map<string, DirectoryMetadata>>;
    /** Directory names for Administration → Vocabularies (excludes system directories). */
    listDirectoryNames(): Observable<string[]>;
    invalidateDirectoryCatalog(): void;
    private fetchDirectoryCatalog;
    private parseDirectoryCatalog;
    private extractDirectoryCatalogRows;
    /**
     * Loads active directory entries for metadata pickers via Directory.SuggestEntries.
     * Each call queries the server (Nuxeo Web UI parity — no session-wide list cache).
     * `lang` localises the labels; English unless the caller asks for another language.
     */
    getEntries(directoryName: string, lang?: string): Observable<DirectoryEntry[]>;
    /**
     * Loads all directory entries for the admin vocabularies table (includes obsolete entries).
     */
    getAdminEntries(directoryName: string): Observable<ManagedDirectoryEntry[]>;
    createEntry(directoryName: string, values: VocabularyEntryFormValues, metadata?: DirectoryMetadata): Observable<ManagedDirectoryEntry>;
    updateEntry(directoryName: string, entryId: string, values: VocabularyEntryFormValues, metadata?: DirectoryMetadata): Observable<ManagedDirectoryEntry>;
    deleteEntry(directoryName: string, entryId: string): Observable<void>;
    /**
     * Fetches entries from an l10n directory (l10nsubjects, l10ncoverage)
     * using the REST directory API with pagination. Returns only top-level
     * entries (parent === '').
     */
    getL10nEntries(directoryName: string): Observable<L10nDirectoryEntry[]>;
    /**
     * Fetches every entry from an l10n directory, including children, for
     * hierarchical pickers (e.g. grouped coverage / subjects dropdowns).
     */
    getAllL10nEntries(directoryName: string): Observable<L10nDirectoryEntry[]>;
    private fetchL10nEntries;
    getEventTypes(): Observable<DirectoryEntry[]>;
    getEventCategories(): Observable<DirectoryEntry[]>;
    private normalizeAdminEntry;
    private buildEntryProperties;
    static ɵfac: i0.ɵɵFactoryDeclaration<DirectoryService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DirectoryService>;
}

declare class SearchAggregationService {
    readonly aggregations: i0.WritableSignal<SearchAggregations>;
    readonly items: i0.WritableSignal<SearchResultItem[]>;
    readonly drawerFilters: i0.WritableSignal<Record<string, string>>;
    readonly selectedSavedSearchId: i0.WritableSignal<string>;
    readonly selectedSavedSearchTitle: i0.WritableSignal<string>;
    /** Incremented whenever a saved search is created so the drawer can refresh its list. */
    readonly savedSearchVersion: i0.WritableSignal<number>;
    markSavedSearchDirty(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<SearchAggregationService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<SearchAggregationService>;
}

type SelectionPreview = string | null;
declare class SelectionService {
    private readonly documentDetailService;
    readonly selectedIds: i0.WritableSignal<Set<string>>;
    readonly selectedLabels: i0.WritableSignal<Map<string, string>>;
    readonly selectedPreviews: i0.WritableSignal<Map<string, SelectionPreview>>;
    readonly selectedTypes: i0.WritableSignal<Map<string, string>>;
    /** When true, the app shell topbar shows only count + Clear (e.g. note image picker). */
    readonly clearOnlyMode: i0.WritableSignal<boolean>;
    readonly selectedCount: () => number;
    readonly selectedItems: () => {
        id: string;
        name: string;
        preview: string | null;
        type: string | undefined;
    }[];
    toggle(id: string, label?: string, preview?: SelectionPreview, type?: string): void;
    selectAll(ids: string[], labels?: Record<string, string>, previews?: Record<string, SelectionPreview>, types?: Record<string, string>): void;
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
    forgetPreviews(): void;
    isSelected(id: string): boolean;
    isAllSelected(ids: string[]): boolean;
    isIndeterminate(ids: string[]): boolean;
    clear(): void;
    /** Clears selection and exits clear-only topbar mode (logout, session reset). */
    resetUiState(): void;
    setClearOnlyMode(enabled: boolean): void;
    deleteSelected(): Observable<NuxeoDocument[]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<SelectionService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<SelectionService>;
}

declare class WorkflowService {
    private readonly api;
    /** Get all available workflow models (Serial, Parallel, custom). */
    getWorkflowModels(): Observable<NuxeoWorkflowModel[]>;
    /** Start a workflow on a document. */
    startWorkflow(docId: string, workflowModelName: string): Observable<NuxeoWorkflow>;
    /** Get running workflow instances on a document. */
    getDocumentWorkflows(docId: string): Observable<NuxeoWorkflow[]>;
    /** Get workflow instances launched by current user. */
    getMyWorkflows(): Observable<NuxeoWorkflow[]>;
    /** Get a specific workflow instance. */
    getWorkflow(workflowId: string): Observable<NuxeoWorkflow>;
    /** Cancel / abandon a running workflow. */
    cancelWorkflow(workflowInstanceId: string): Observable<void>;
    /** Get the workflow graph (JSON). */
    getWorkflowGraph(workflowInstanceId: string): Observable<unknown>;
    /** Get a specific workflow model by name. */
    getWorkflowModel(modelName: string): Observable<NuxeoWorkflowModel>;
    /** Get the graph of a workflow model. */
    getWorkflowModelGraph(modelName: string): Observable<unknown>;
    static ɵfac: i0.ɵɵFactoryDeclaration<WorkflowService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<WorkflowService>;
}

declare class UserService {
    private readonly api;
    /** Search users by partial name/username (for participant picker). */
    searchUsers(query: string): Observable<NuxeoUser[]>;
    /**
     * User search with paging (used by Administration). Uses `*` when the query is empty
     * so the server returns a broad list where supported.
     */
    searchUsersPaged(query: string, pageSize?: number, currentPageIndex?: number): Observable<NuxeoUserList>;
    /** Search groups by partial name (for participant picker). */
    searchGroups(query: string): Observable<NuxeoGroup[]>;
    /**
     * Recently created users and groups, newest first (Nuxeo Web UI parity).
     * Uses audit-backed page provider `LATEST_CREATED_USERS_OR_GROUPS_PROVIDER`.
     */
    getRecentlyCreatedUsersAndGroups(pageSize?: number, currentPageIndex?: number): Observable<NuxeoDocumentList>;
    searchGroupsPaged(query: string, pageSize?: number, currentPageIndex?: number): Observable<NuxeoGroupList>;
    /** Get a specific user. */
    getUser(userId: string): Observable<NuxeoUser>;
    getGroup(groupId: string): Observable<NuxeoGroup>;
    createUser(input: {
        username: string;
        firstName: string;
        lastName: string;
        company?: string;
        email: string;
        password?: string;
        groups?: string[];
    }): Observable<NuxeoUser>;
    /** Immediate account creation with an admin-set password (Nuxeo Web UI parity). */
    private createUserWithPassword;
    /**
     * Invitation flow when no password is set — mirrors Nuxeo Web UI `User.Invite` with a
     * user entity input so the invitee receives an email to set their own password.
     */
    private inviteUser;
    private buildUserFromInput;
    updateUser(userId: string, updates: {
        firstName?: string;
        lastName?: string;
        company?: string;
        email?: string;
        password?: string;
        groups?: string[];
    }): Observable<NuxeoUser>;
    deleteUser(userId: string): Observable<void>;
    createGroup(input: {
        groupname: string;
        grouplabel: string;
        memberUsers?: string[];
        memberGroups?: string[];
    }): Observable<NuxeoGroup>;
    updateGroup(groupname: string, updates: {
        grouplabel?: string;
        memberUsers?: string[];
        memberGroups?: string[];
    }): Observable<NuxeoGroup>;
    deleteGroup(groupname: string): Observable<void>;
    static ɵfac: i0.ɵɵFactoryDeclaration<UserService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<UserService>;
}

declare class TagService {
    private readonly api;
    private readonly http;
    /**
     * Tags the document and answers with all its tags afterwards. Nuxeo normalises a label — "Q3
     * Report" is stored as `q3report` — so what to show is the label it stored, not the one typed.
     */
    addTag(uid: string, label: string): Observable<string[]>;
    /** Takes the tag off the document and answers with the tags it still has. */
    removeTag(uid: string, label: string): Observable<string[]>;
    searchTags(term: string): Observable<string[]>;
    /**
     * Existing tags matching `term`, as Web UI's tag suggestion lists them: the `Tag.Suggestion`
     * operation. `searchTags` reads a `label_tag_entry` directory, which a stock Nuxeo 2025 answers
     * with 404. An entry with neither a label nor an id is skipped, and an answer that is not a list
     * is no suggestions; a server error reaches the caller.
     */
    suggestTags(term: string): Observable<string[]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TagService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<TagService>;
}

declare class NuxeoDriveService {
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
declare class ARenderService {
    private readonly rawCfg;
    private readonly api;
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
    private get cfg();
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
    private framableOrNull;
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
    getPreviewerUrl(docUid: string, blobXPath?: string): Observable<string | null>;
    /**
     * The side-by-side comparison URL for two documents.
     *
     * Same reasoning as `getPreviewerUrl`: the server appends a second `documentId` and
     * `visualization.multiView.doComparison=true`, neither of which the client can assemble without
     * both digests.
     */
    getDiffUrl(leftDocUid: string, rightDocUid: string): Observable<string | null>;
    /**
     * Checks whether ARender is reachable. Uses a `no-cors` fetch to avoid CORS blocks — the promise
     * resolves for any server response and rejects only on a network error (server unreachable).
     *
     * Answers `false` without probing anything when ARender is not configured. Not probing matters:
     * `fetch(undefined)` resolves against the *application's own* origin, which would report a
     * viewer as present when none is deployed.
     */
    isAvailable(): Observable<boolean>;
    static ɵfac: i0.ɵɵFactoryDeclaration<ARenderService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ARenderService>;
}

interface ARenderConfig {
    /**
     * Base URL of the ARender UI as seen by the browser. Per-deployment, and a privilege boundary rather
     * than a cosmetic setting: it is navigated in an `iframe`.
     *
     * Must be an absolute `http(s)` origin with **no query string, no fragment and no userinfo**. The
     * client no longer appends anything to it: under NEV 2026 this value is the origin allow-list the
     * server-supplied previewer URL is checked against, and that comparison reads `origin`, which
     * discards a query, fragment and userinfo while still reporting a match. A base carrying any of
     * the three is a misconfiguration whose effect would otherwise be invisible.
     *
     * **The scheme rule is host-relative, not build-relative.** `http:` is rejected only where it would
     * downgrade the page framing it:
     *
     * | Application served over | `http:` viewerOrigin |
     * | ----------------------- | -------------------- |
     * | `https://…`             | rejected — the real downgrade |
     * | `http://…` (on-prem)    | accepted — nothing to downgrade |
     * | any, dev build          | accepted |
     *
     * An earlier version of this comment said it "must be `https:` in production", which was never what
     * the preview-fallback path did and is not what `ARenderService` does — a consumer following it would
     * have rejected a supported on-prem configuration. See `insecureAllowedForHost`.
     */
    viewerOrigin: string;
    /**
     * **Vestigial. Nothing reads this, and it is not validated.**
     *
     * It was the base URL of Nuxeo as the ARender containers saw it, used to build `nxfile` URLs
     * through an nginx auth-proxy sidecar that added a shared Basic credential. Under NEV 2026 the
     * connector resolves blobs itself from the `documentId` parameter over OAuth2 as the signed-in
     * user, so the client builds no such URL.
     *
     * Retained because removing it is a breaking change to `AppARenderConfig`, which is published
     * and frozen in `docs/api/platform.api.md`. Deliberately **not** required by
     * `completeARenderConfig` and **not** checked by `ARenderService`: gating a feature on a field
     * nothing consumes can only reject configurations that would have worked.
     */
    nuxeoInternalUrl: string;
}
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
declare const ARENDER_CONFIG: InjectionToken<ARenderConfig | null>;

interface LocalPermissionRow {
    documentTitle: string;
    documentPath: string | null;
    right: string;
    timeFrame: string;
    grantedBy: string;
}
interface SynchronizationRootRow {
    id: string;
    title: string;
    path: string;
}
declare class SettingsService {
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
declare class ContentModelService {
    private readonly api;
    /**
     * `shareReplay({ refCount: false })` so the cache survives every subscriber unsubscribing.
     * With `refCount: true` the panel closing would discard it and the next open would refetch.
     */
    private readonly model$;
    getContentModel(): Observable<NuxeoContentModel>;
    static ɵfac: i0.ɵɵFactoryDeclaration<ContentModelService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ContentModelService>;
}

declare class AdministrationService {
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

declare class PrincipalPermissionsService {
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

interface SavedSearch {
    uid: string;
    title: string;
    params: Record<string, unknown>;
}
interface TrashSearchParams {
    fullText?: string;
    path?: string;
    author?: string;
    sizeRanges?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    pageSize?: number;
    currentPageIndex?: number;
}
declare class TrashService {
    private readonly api;
    private readonly http;
    searchTrash(params?: TrashSearchParams): Observable<NuxeoDocumentList>;
    getPathSuggestions(parentPath: string): Observable<NuxeoDocumentList>;
    restoreDocument(uid: string): Observable<NuxeoDocument>;
    permanentlyDelete(uid: string): Observable<void>;
    saveSearch(title: string, params: Record<string, unknown>): Observable<SavedSearch>;
    updateSearch(uid: string, title: string, params: Record<string, unknown>): Observable<SavedSearch>;
    getSavedSearches(): Observable<SavedSearch[]>;
    private sizeRangeToClause;
    static ɵfac: i0.ɵɵFactoryDeclaration<TrashService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<TrashService>;
}

interface TrashFilters {
    fullText: string;
    path: string;
    author: string;
    sizeRanges: string[];
}
interface TrashResultItem {
    uid: string;
    title: string;
    type: string;
}
type TrashLayoutMode = 'filters' | 'results';
declare class TrashFilterService {
    readonly filters: i0.WritableSignal<TrashFilters>;
    readonly layoutMode: i0.WritableSignal<TrashLayoutMode>;
    readonly results: i0.WritableSignal<TrashResultItem[]>;
    readonly resultThumbnails: i0.WritableSignal<Record<string, string | null>>;
    readonly totalResults: i0.WritableSignal<number>;
    readonly resultsLoading: i0.WritableSignal<boolean>;
    readonly savedSearchVersion: i0.WritableSignal<number>;
    readonly activeSavedFilterUid: i0.WritableSignal<string | null>;
    readonly activeSavedFilterTitle: i0.WritableSignal<string | null>;
    readonly hasSavedFilter: i0.Signal<boolean>;
    reset(): void;
    toggleLayout(): void;
    markSavedSearchDirty(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<TrashFilterService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<TrashFilterService>;
}

declare const DOC_TYPE_ICONS: Record<string, string>;
declare function docTypeIcon(type: string): string;

/** Catalogue keys for the document types the packaged application knows about. */
declare const DOC_TYPE_LABEL_KEYS: Record<string, string>;
/**
 * The display name of a Nuxeo document type.
 *
 * A known type resolves through the catalogue. A type a customer has added has no key, so its
 * own name is shown with the camel case split (`InvoiceRecord` → `Invoice Record`) — it can never
 * render as a raw `doc-type.*` key. The same fallback applies when the catalogue has not loaded
 * and `translate` hands the key back unchanged.
 */
declare function docTypeLabel(type: string, translate: (key: string) => string): string;

/**
 * `{{ doc.type | docTypeLabel }}` — the translated name of a document type, or the type's own name
 * for a custom type the catalogue does not know.
 *
 * Impure for the same reason as `TranslatePipe`: `translate.instant` is not reactive, so a pure
 * pipe would keep the language that was active when it first ran.
 */
declare class DocTypeLabelPipe implements PipeTransform {
    private readonly translate;
    transform(type: string | null | undefined): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<DocTypeLabelPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<DocTypeLabelPipe, "docTypeLabel", true>;
}

/** How far a task's due date is from now, in the units the task views display. */
interface TaskDueDistance {
    /** True when the due date is still ahead. */
    readonly due: boolean;
    /** Whole days when at least one; otherwise whole hours; `under-two-hours` below two. */
    readonly unit: 'days' | 'hours' | 'under-two-hours';
    readonly count: number;
}
/**
 * The distance to a task's due date, floored to whole days, then whole hours.
 *
 * Shared by the Tasks page and the navigation drawer, which word it differently ("Due in 3 days" /
 * "in 3 days") and so each choose their own catalogue key from the result.
 */
declare function taskDueDistance(dueDate: string, now?: number): TaskDueDistance;

/**
 * The avatar colours, as **our own** type.
 *
 * ## Why not just return `SatAvatarCategory`
 *
 * `avatarColor` used to be typed `(name: string) => SatAvatarCategory`, and that shipped
 * two problems in one signature.
 *
 * The first is the rule: a third-party design-system type has no business in our public
 * API, for the same reason `AGENTS/11-beta-program.md` §7 forbids adf-hx types there. A
 * customer writing against `@nuxeo/satori-platform/nuxeo-client` should not have to know
 * that our avatars come from a design system, and we should be free to change that without
 * it being a breaking change for them.
 *
 * The second is worse and was concrete: **the published declarations did not compile.**
 * ng-packagr's rollup dropped the `import` and emitted
 *
 *     declare function avatarColor(name: string): SatAvatarCategory;
 *
 * with `SatAvatarCategory` declared nowhere in the file. Every customer annotating that
 * result got `TS2304: Cannot find name 'SatAvatarCategory'`. `beta:fork` did not catch it
 * because the app template never calls `avatarColor`, and the API snapshot recorded the
 * broken signature as the baseline. `beta:publishable` now typechecks the shipped
 * declarations themselves, which is the check that sees this class of defect.
 *
 * ## Staying compatible, without importing the design system
 *
 * The union must remain exactly upstream's `SatAvatarCategory`, because the values are
 * handed straight to `<sat-avatar [category]>`. The two-way assertion that holds it there is
 * in `apps/nuxeo-ui/src/app/dashboard/dashboard-page.component.ts`, which imports both types
 * and is compiled by every build, CI's included.
 *
 * It is not here because this library's shipped sources may not import a design-system
 * package, not even a type: `libs/shared/satori-components` is allowed to import
 * `@nuxeo/satori-platform/nuxeo-client` (it does not yet), and its guardrail follows imports
 * transitively and would reject any `@hylandsoftware/*` reached through this barrel.
 */
type AvatarColor = 'purple' | 'blue' | 'pink' | 'teal' | 'yellow' | 'green' | 'red' | 'orange';
/**
 * Deterministic color for a username so the same user always gets
 * the same avatar color across the application.
 */
declare function avatarColor(name: string): AvatarColor;

declare const FOLDERISH_TYPES: Set<string>;

declare const NON_CONTENT_DOCUMENT_TYPES: Set<string>;

interface NuxeoSubtypeEntry {
    type: string;
    facets?: string[];
}
/** Preferred display order for common workspace content types. */
declare const WORKSPACE_CONTENT_TYPE_ORDER: readonly ["Audio", "Collection", "File", "Folder", "Note", "OrderedFolder", "Picture", "Video", "Workspace"];
/**
 * Parses allowed child document types from the Nuxeo `subtypes` document enricher.
 * @see https://doc.nuxeo.com/rest-api/1/document-enrichers/#subtypes
 */
declare function parseDocumentSubtypes(doc: NuxeoDocument): string[];
/** Sorts API subtypes with workspace content types first (stable, known order). */
declare function sortDocumentSubtypes(types: string[]): string[];

/** Legacy compound permission that also grants ACL management on some deployments. */
declare const MANAGE_DOCUMENT_PERMISSIONS = "Everything";
declare const WRITE_DOCUMENT = "Write";
/** Nuxeo Web UI uses WriteProperties for note/metadata edit actions. */
declare const WRITE_PROPERTIES = "WriteProperties";
declare const READ_WRITE_DOCUMENT = "ReadWrite";
declare const ADD_CHILDREN = "AddChildren";
declare const REMOVE_DOCUMENT = "Remove";
/**
 * The catalogue KEY for the permission-denied message, not the message.
 *
 * This was the English sentence, exported and used directly at nine call sites, so every one of them
 * rendered English whatever the locale — and no gate could see it, because a bare constant is not a
 * sink. Exporting the key instead means a caller has to resolve it, which is a compile-time nudge
 * toward the resolver rather than a silent literal.
 */
declare const PERMISSION_DENIED_KEY = "common.permission-denied";
declare function hasDocumentPermission(doc: NuxeoDocument | null | undefined, permission: string): boolean;
/** True when the document response includes the `permissions` enricher. */
declare function hasDocumentPermissionsEnricher(doc: NuxeoDocument | null | undefined): boolean;
/** Show write actions when permissions are unknown or Write/WriteProperties is granted. */
declare function canShowWriteDocumentAction(doc: NuxeoDocument | null | undefined): boolean;
/** Show remove actions when permissions are unknown or Remove is granted. */
declare function canShowRemoveDocumentAction(doc: NuxeoDocument | null | undefined): boolean;
/** True when the current user can manage ACL entries on the document. */
declare function canManageDocumentPermissions(doc: NuxeoDocument | null | undefined): boolean;
/** True when the current user can edit content, create versions, lock, etc. */
declare function canWriteDocument(doc: NuxeoDocument | null | undefined): boolean;
/**
 * Web UI's `isTaggable`: the document itself, not a proxy or a version, and the user holds Write.
 * Nuxeo accepts a tag from a reader too, but Web UI does not offer it, and only a user with Write
 * may take a tag off.
 */
declare function canTagDocument(doc: NuxeoDocument | null | undefined): boolean;
/** The permission Nuxeo checks to create, restore and publish versions. */
declare const WRITE_VERSION = "WriteVersion";
/**
 * Nuxeo flags a record with the `isRecord` field of the document JSON — there is no facet for it.
 * The public `NuxeoDocument` model does not declare the field, so it is read here rather than
 * added to that published type.
 */
declare function isRecordDocument(doc: NuxeoDocument | null | undefined): boolean;
/**
 * Web UI's Create Version gate (`nuxeo-document-create-version`): the live document, not a version,
 * a publication or a record, with the `Versionable` facet, and the user holds `WriteVersion`. A
 * publication keeps its source's facet and permissions but has no versions of its own, which is
 * why Web UI shows it no versions control at all.
 */
declare function canCreateDocumentVersion(doc: NuxeoDocument | null | undefined): boolean;
/**
 * Web UI's `isPublishable`: not a proxy, a record or in the trash, the `Publishable` facet, and
 * `WriteVersion`. A version is publishable — `Document.PublishToSection` publishes it as it is.
 * Without an `isTrashed` flag, Web UI reads the `deleted` life-cycle state as the trash.
 */
declare function canPublishDocument(doc: NuxeoDocument | null | undefined): boolean;
/** True when the current user can create child documents in a folder. */
declare function canAddChildren(doc: NuxeoDocument | null | undefined): boolean;
/** True when the current user can trash or permanently delete the document. */
declare function canRemoveDocument(doc: NuxeoDocument | null | undefined): boolean;
/** True when the current user can view document audit/history (Classic Web UI parity). */
declare function canViewDocumentAuditLog(doc: NuxeoDocument | null | undefined): boolean;
/** True when an HTTP error indicates the server rejected the action for lack of permission. */
declare function isPermissionDeniedError(err: unknown): boolean;

interface CompareRow {
    key: string;
    label: string;
    left: string;
    right: string;
    differs: boolean;
}
interface CompareSection {
    id: string;
    label: string;
    fields: CompareRow[];
}
declare function formatCompareDate(value: unknown, locale: string): string;
declare function isCompareIconField(key: string): boolean;
/** Resolve a Nuxeo document icon path (e.g. `/icons/note.gif`) to an API URL. */
declare function resolveNuxeoIconPath(path: string): string;
declare function formatCompareValue(value: unknown): string;
declare function buildDocumentCompareSections(left: NuxeoDocument, right: NuxeoDocument, viewAll: boolean, locale: string): CompareSection[];

/** Auto-provisioned structural containers under a domain — not user-created siblings. */
declare const DOMAIN_STRUCTURAL_ROOT_TYPES: Set<string>;
/** Catalogue key for the notice telling the user where content can be created under a domain. */
declare const DOMAIN_CONTAINER_GUIDANCE_KEY = "browse.message.domain-container-guidance";
declare function isDomainParentType(parentType: string | null | undefined): boolean;
/**
 * Domain-level subtypes from Nuxeo include structural roots; users must navigate into
 * the existing Sections / Templates / Workspaces containers instead.
 */
declare function filterCreatableSubtypesForParent(parentType: string | null | undefined, subtypes: string[]): string[];
/** Allowed child types for a folder document (subtypes enricher + domain filtering). */
declare function resolveCreatableSubtypes(doc: NuxeoDocument): string[];

declare const CLIPBOARD_STORAGE_KEY = "nuxeo_clipboard";
/** Client-side clipboard entry (Web UI stores full documents; we persist uid/title/type). */
interface ClipboardDoc {
    uid: string;
    title: string;
    type?: string;
}
declare function readClipboardDocs(): ClipboardDoc[];
declare function writeClipboardDocs(docs: ClipboardDoc[]): void;
/**
 * Web UI `nuxeo-clipboard.canPaste`: target must be folderish and allow each item type.
 * Items without `type` skip subtype validation (backward compatible with older clipboard data).
 */
declare function canPasteClipboard(items: ClipboardDoc[], target: NuxeoDocument | null | undefined): boolean;

/** Formats ACE begin/end timestamps for permission tables. */
declare function principalPermissionTimeFrameLabel(row: PrincipalPermissionRow, translate: (key: string) => string, locale: string): string;
/** Maps a principal permission row to the profile/settings table shape. */
declare function principalPermissionToLocalRow(row: PrincipalPermissionRow, translate: (key: string) => string, locale: string): LocalPermissionRow;

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
declare function formatAceDateRange(begin: string | null, end: string | null, translate: (key: string, params?: Record<string, unknown>) => string, locale: string): string;

/**
 * Maps a Nuxeo permission identifier to its display label.
 *
 * The document, collection and browse permission tables each carried their own copy of this as a
 * hardcoded English `Record<string, string>`, so all three read `Manage everything` in every
 * locale. `translate` is required for the reason given on `formatPermissionTimeFrame`: a default
 * that returns the English turns every un-updated call site into a silent no-op.
 */
declare function permissionRightLabel(permission: string, translate: (key: string) => string): string;

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
interface NavigableUrlPolicy {
    /**
     * Origins the URL may belong to, e.g. `https://arender.example.com`. Empty and nullish entries
     * are ignored, so an unset `NUXEO_API_ORIGIN` (which is `''`, meaning "use the dev proxy") simply
     * contributes nothing rather than matching everything.
     *
     * Omit to skip the origin check and validate the scheme only.
     */
    readonly allowedOrigins?: readonly (string | null | undefined)[];
    /**
     * Base for resolving a relative candidate. Pass the application origin to treat a
     * root-relative URL as same-origin; that origin must then also appear in `allowedOrigins`.
     */
    readonly base?: string;
    /**
     * Permit `http:`.
     *
     * Pass **`insecureAllowedForHost(isDevMode())`**, not a bare `isDevMode()` and never a constant
     * `true`.
     *
     * A plaintext document in an `iframe` is a downgrade only *relative to the page framing it*. Where the
     * application is itself served over `http:` — an ordinary on-prem deployment — there is nothing to
     * downgrade, and refusing it removes the feature without adding security. That is the policy
     * `ARenderService` and the preview fallback both implement, and `insecureAllowedForHost` is where it
     * lives so the three callers cannot answer the same question differently.
     *
     * This doc previously said to pass `isDevMode()`. That was the advice that silently disabled ARender
     * on every on-prem plaintext deployment — the fourth place in this repository carrying the same wrong
     * claim, after `docs/arender-setup.md`, `ARenderConfig.viewerOrigin` and the PR description.
     */
    readonly allowInsecure?: boolean;
}
/**
 * The candidate if it is safe to navigate under `policy`, otherwise `null`.
 *
 * Returns the **original** string rather than the normalised `href`, so validating a URL never
 * silently changes which bytes get loaded. The check is the product here, not a rewrite.
 */
declare function navigableUrlOrNull(candidate: string | null | undefined, policy?: NavigableUrlPolicy): string | null;
/**
 * The origin of `value`, or `null` if it is not an absolute URL.
 *
 * Note `origin` is the string `'null'` for an opaque origin (`javascript:`, `data:`), which is why
 * callers must not compare origins without also checking the scheme.
 */
declare function originOf(value: string | null | undefined): string | null;
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
declare function isNavigableBaseUrl(value: string | null | undefined, allowInsecure?: boolean): boolean;
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
declare function insecureAllowedForHost(isDevMode: boolean, hostProtocol?: string): boolean;
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
declare function mediaTypeEssence(value: string | null | undefined): string;

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
declare function trustObjectUrl(sanitizer: DomSanitizer, url: string | null | undefined): SafeResourceUrl | null;

/**
 * The only config this helper accepts, as a type rather than as a runtime surprise.
 *
 * The parameter used to be DOMPurify's own `Config`, which types roughly 40 options and permits
 * `ADD_ATTR` to be a predicate. `assertSafeConfig` throws for all but three keys and for any
 * non-array value, so a consumer could write a config that type-checked and then threw at runtime —
 * the compiler actively pointed the wrong way. This type is the guard's contract expressed where the
 * caller can see it, so an unsupported option is a compile error and the runtime check becomes the
 * backstop for untyped callers rather than the only line of defence.
 */
interface TrustedHtmlConfig {
    /** Elements to keep. Active-content tags are rejected — see {@link BLOCKED_TAGS}. */
    ALLOWED_TAGS?: string[];
    /** Attributes to keep. `on*` handlers and `srcdoc` are rejected. */
    ALLOWED_ATTR?: string[];
    /** Attributes to keep *in addition to* DOMPurify's defaults. Same restrictions as ALLOWED_ATTR. */
    ADD_ATTR?: string[];
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
declare function renderTrustedHtml(sanitizer: DomSanitizer, html: string, config?: TrustedHtmlConfig): SafeHtml;

/** Nuxeo may return a plain string or an enriched user/group entity when fetch-acls is set. */
declare function resolveAcePrincipal(value: unknown): string;
type MergeDocumentPermissionsContextOptions = {
    /** When true, empty `permissions`/`acls` arrays are treated as absent (Note PUT merge). */
    treatEmptyEnricherAsAbsent?: boolean;
};
/**
 * Merges context enrichers from a permissions fetch or document update into an existing document.
 * Spreads enrichers from `updated`, then overlays `acls` and `permissions`.
 */
declare function mergeDocumentPermissionsContext(existing: NuxeoDocument, updated: NuxeoDocument, options?: MergeDocumentPermissionsContextOptions): NuxeoDocument;
/** Normalizes ACL username/creator fields to strings for UI and automation calls. */
declare function normalizeDocumentAcls(doc: NuxeoDocument): NuxeoDocument;

/** Nuxeo Note `note:mime_type` values and display labels (matches Nuxeo Web UI). */
declare const NOTE_FORMAT_OPTIONS: readonly [{
    readonly value: "text/html";
    readonly labelKey: "note-format.html";
    readonly label: "HTML";
}, {
    readonly value: "text/plain";
    readonly labelKey: "note-format.plain";
    readonly label: "Text";
}, {
    readonly value: "text/xml";
    readonly labelKey: "note-format.xml";
    readonly label: "XML";
}, {
    readonly value: "text/markdown";
    readonly labelKey: "note-format.markdown";
    readonly label: "Markdown";
}];
type NoteMimeType = (typeof NOTE_FORMAT_OPTIONS)[number]['value'];
/** Default empty body for a new note of the given format. */
declare function defaultNoteContent(mimeType: string): string;
/** Human-readable label for `note:mime_type` (e.g. `text/html` → `HTML`). */
declare function noteFormatLabel(mimeType: string | null | undefined): string;
declare function isHtmlNoteFormat(mimeType: string): boolean;
/**
 * Formats note HTML for the code/source textarea (display only).
 *
 * Nuxeo Web UI toggles source mode on the persisted `note:note` string. Satori uses Quill for
 * the visual editor; `getSemanticHTML()` collapses markup onto one line with `&nbsp;` entities.
 * This helper restores a readable multi-line source view without mutating the saved document.
 */
declare function formatNoteHtmlForSourceView(html: string): string;

/** Allows only absolute http(s) URLs for user-provided links and embeds. */
declare function isSafeHttpUrl(url: string): boolean;
/** Converts note markdown body to HTML for read-only preview (matches Nuxeo Web UI). */
declare function renderNoteMarkdown(text: string): string;
declare function isMarkdownNoteFormat(mimeType: string): boolean;

/** Pagination metadata returned by Nuxeo paginable list endpoints. */
interface PaginatedListMeta {
    totalSize?: number;
    resultsCount?: number;
    entries?: unknown[];
    numberOfPages?: number;
    currentPageSize?: number;
    currentPageIndex?: number;
    isNextPageAvailable?: boolean;
}
/**
 * Resolves the total item count for Material paginator `[length]`.
 * Nuxeo may return `resultsCount` instead of or alongside `totalSize`; when both are
 * present, use the larger value so the paginator never under-counts. When both are absent,
 * derive a usable length from `numberOfPages` or `isNextPageAvailable`.
 */
declare function resolvePaginatedListTotal(res: PaginatedListMeta, pageSize: number, pageIndex: number): number;

/** Web UI note RTE — `nuxeo-document-picker provider="document_picker"`. */
declare const NOTE_DOCUMENT_PICKER_PROVIDER = "document_picker";
/** Web UI `nuxeo-document-picker` / `nuxeo-results-view` request headers. */
declare const NOTE_DOCUMENT_PICKER_HEADERS: {
    readonly properties: "dublincore,file";
    readonly 'enrichers.document': "thumbnail,permissions,highlight";
};
/**
 * NXQL equivalent of the default `document_picker` page provider
 * (Picture facet, not trashed). Used when ES-backed PP fails locally.
 *
 * Quick Search filters by title and main blob file name — `ecm:fulltext` is often
 * disabled in dev Docker while `fulltext_all` on the page provider still works in prod.
 */
declare function buildNoteDocumentPickerNxql(fulltext: string): string;
/** Keep only Picture/image documents with a server-supplied blob URL for `<img src>`. */
declare function filterInsertablePictureDocuments(entries: NuxeoDocumentList['entries'] | undefined): NuxeoDocument[];
/** True when `file:content.data` exists and the blob is an image (Web UI parity). */
declare function hasInsertablePictureBlob(doc: NuxeoDocument): boolean;
declare function normalizeDocumentPickerList(res: PaginatedListMeta & {
    entries?: NuxeoDocumentList['entries'];
}, pageSize: number, pageIndex: number): NuxeoDocumentList;

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
declare function escapeNxqlLiteral(value: string): string;

/** Localized label for an l10n directory entry (defaults to id). */
declare function l10nEntryLabel(entry: L10nDirectoryEntry): string;
/** Resolves a nature vocabulary id to its display label. */
declare function resolveNatureLabel(id: string | null | undefined, entries: DirectoryEntry[]): string;
/**
 * Formats an l10n directory value as `Parent/Child`, matching Nuxeo Web UI
 * (e.g. `Africa/Tanzania` for coverage). Reads the value Web UI stores, `africa/tanzania`, as well
 * as a bare child id.
 */
declare function formatHierarchicalL10nLabel(id: string | null | undefined, entries: L10nDirectoryEntry[]): string;
interface L10nOptionGroup {
    parentLabel: string;
    entries: L10nDirectoryEntry[];
}
/**
 * Groups child l10n directory entries under their parent label for hierarchical
 * mat-optgroup pickers (coverage, subjects).
 */
declare function groupL10nChildrenByParent(entries: L10nDirectoryEntry[], query?: string): L10nOptionGroup[];

/**
 * Validate the date parsed by the field's active adapter, without a second date parser.
 * Non-empty text needs a valid Date: Material turns a failed parse into a null model,
 * which must not be mistaken for an intentional clear or allowed through a save guard.
 */
declare function isExpiresFieldValid(expiresRawText: string, expires: Date | null): boolean;
/** Whether to show the Expires validation message (non-empty invalid input). */
declare function shouldShowExpiresFieldError(expiresRawText: string, expires: Date | null): boolean;
/** Shows Expires validation errors immediately on input (not only after blur). */
declare function createExpiresErrorStateMatcher(isInvalid: () => boolean): {
    isErrorState: () => boolean;
};

/**
 * Nuxeo primary types that the HxAI connector's default `ingestMappings`
 * contribution can send to Content Lake (documents with a main `file:content`
 * blob). Mirrors the Confluence workflow "Ingest a local Nuxeo file document".
 */
declare const CONTENT_LAKE_INGEST_DOCUMENT_TYPES: Set<string>;
/**
 * Machine-readable ingest marker stored on the Nuxeo document after a successful
 * Content Lake ingest. Prefer `dc:source` (rarely auto-filled) and fall back to
 * `dc:rights` for backward compatibility. A property is only written when it is
 * empty or already uses our prefix — PDF metadata often populates `dc:rights`.
 */
declare const CONTENT_LAKE_INGEST_MARKER_PROPERTY = "dc:source";
declare const CONTENT_LAKE_INGEST_MARKER_LEGACY_PROPERTY = "dc:rights";
declare const CONTENT_LAKE_INGEST_MARKER_PROPERTIES: readonly ["dc:source", "dc:rights"];
declare const CONTENT_LAKE_INGEST_MARKER_PREFIX = "agentic-ui:content-lake:";
/** Whether a Nuxeo document can be bulk-ingested into Content Lake for KD. */
declare function supportsContentLakeIngest(doc: NuxeoDocument | null | undefined): boolean;
declare function readBlobDigest(doc: NuxeoDocument): string | null;
declare function buildContentLakeIngestMarker(blobDigest: string): string;
declare function readContentLakeIngestMarker(doc: NuxeoDocument): string | null;
/** True when the document blob digest matches our last successful ingest marker. */
declare function isContentLakeIngestCurrent(doc: NuxeoDocument | null | undefined): boolean;
/** True when the document supports ingest and is not already up to date in Content Lake. */
declare function needsContentLakeIngest(doc: NuxeoDocument | null | undefined): boolean;
/** True when the UI should ask Content Lake whether this blob is already indexed. */
declare function shouldProbeContentLakeIngestStatus(doc: NuxeoDocument): boolean;
/** First Dublin Core field that can store our ingest marker without clobbering user data. */
declare function resolveIngestMarkerWriteProperty(doc: NuxeoDocument): string | null;

declare const RECENTLY_EDITED_QUERY: string;
declare const RECENTLY_VIEWED_QUERY: string;
declare const EXPIRED_DOCUMENTS_QUERY: string;
declare const FAVORITES_COLLECTION_QUERY: string;

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
declare function formatRelativeTime(value: string | number | Date | null | undefined, locale: string, now?: number): string;

export { ADD_CHILDREN, ADMIN_ACCESS_CHECKS, ARENDER_CONFIG, ARenderService, AdministrationService, AssetAggregationService, AssetService, BLOB_CLIENT_REASON_HEADER, BLOB_CLIENT_REASON_PARAM, BLOB_HOLDING_DOC_TYPES, BLOB_NOT_ATTACHED_ERROR, BrowseContextService, BrowseService, CLIPBOARD_STORAGE_KEY, CONTENT_LAKE_INGEST_DOCUMENT_TYPES, CONTENT_LAKE_INGEST_MARKER_LEGACY_PROPERTY, CONTENT_LAKE_INGEST_MARKER_PREFIX, CONTENT_LAKE_INGEST_MARKER_PROPERTIES, CONTENT_LAKE_INGEST_MARKER_PROPERTY, CURRENT_USERNAME, ClipboardTargetService, CollectionService, ContentLakeIngestService, ContentModelService, DEFAULT_IMPORT_PARENT_PATH, DEFAULT_VOCABULARY_ORDERING, DOC_TYPE_ICONS, DOC_TYPE_LABEL_KEYS, DOMAIN_CONTAINER_GUIDANCE_KEY, DOMAIN_STRUCTURAL_ROOT_TYPES, DirectoryService, DocTypeLabelPipe, DocumentDetailService, DocumentImportService, DocumentService, EXPIRED_DOCUMENTS_QUERY, FALLBACK_DIRECTORY_NAMES, FAVORITES_COLLECTION_QUERY, FOLDERISH_TYPES, MANAGE_DOCUMENT_PERMISSIONS, NON_CONTENT_DOCUMENT_TYPES, NOTE_DOCUMENT_PICKER_HEADERS, NOTE_DOCUMENT_PICKER_PROVIDER, NOTE_FORMAT_OPTIONS, NUXEO_API_ORIGIN, NUXEO_POWERUSERS_GROUP, NUXEO_SAML_LOGIN_ENDPOINTS, NUXEO_SERVER_URL, NUXEO_SSO_POST_LOGIN_PATH, NUXEO_SSO_RETURN_QUERY_PARAM, NuxeoApiBase, NuxeoDriveService, PERMISSION_DENIED_KEY, PERMISSION_NOTIFICATION_MAIL_HINT_KEY, PrincipalPermissionsService, READ_WRITE_DOCUMENT, RECENTLY_EDITED_QUERY, RECENTLY_VIEWED_QUERY, REMOVE_DOCUMENT, RESTRICTED_IMPORT_LOCATION_MESSAGE_KEY, SearchAggregationService, SearchService, SelectionService, SettingsService, TagService, TaskService, TrashFilterService, TrashService, UserService, WORKSPACE_CONTENT_TYPE_ORDER, WRITE_DOCUMENT, WRITE_PROPERTIES, WRITE_VERSION, WorkflowService, administrationAccessGuard, administrationLandingGuard, auditActivityLabel, auditActivityLabelKey, avatarColor, browseTreeContextPath, buildContentLakeIngestMarker, buildDocumentCompareSections, buildNoteDocumentPickerNxql, buildVocabularyTableColumns, canAddChildren, canCreateDocumentVersion, canManageDocumentPermissions, canPasteClipboard, canPublishDocument, canRemoveDocument, canShowRemoveDocumentAction, canShowWriteDocumentAction, canTagDocument, canViewDocumentAuditLog, canWriteDocument, createExpiresErrorStateMatcher, cumulativeNuxeoPathPrefixes, decodeNuxeoPathSegment, defaultNoteContent, defaultVocabularyLabel, directoryAdminTableLabel, directoryEntryDisplayLabel, directoryPickerLabel, directoryShowsParentField, directoryUsesL10nLabel, docTypeIcon, docTypeLabel, documentHasMainBlob, documentHasPersistedMainBlob, documentNavigationUrl, entryPropertiesIncludeParent, escapeNxqlLiteral, expandableNuxeoPathPrefixes, filterCreatableSubtypesForParent, filterDirectoryPickerEntries, filterInsertablePictureDocuments, findLocalAceForPrincipal, formatAceDateRange, formatCompareDate, formatCompareValue, formatDirectoryEntryId, formatHierarchicalL10nLabel, formatNoteHtmlForSourceView, formatRelativeTime, fullAdministratorGuard, getDirectoryMetadata, groupL10nChildrenByParent, hasDocumentPermission, hasDocumentPermissionsEnricher, hasInsertablePictureBlob, inferBlobDocTypeFromFile, insecureAllowedForHost, isBlobHoldingDocType, isBrowsableNavNode, isBrowseRouterUrl, isCollectionDocument, isCompareIconField, isContentLakeIngestCurrent, isDirectoryI18nKey, isDomainParentType, isExpiresFieldValid, isFolderishDocument, isHtmlNoteFormat, isMailSendError, isManagedDirectory, isManagedDirectoryName, isMarkdownNoteFormat, isNavigableBaseUrl, isPermissionDeniedError, isPowerUserFromGroups, isRecordDocument, isRepositoryRootPath, isRestrictedImportParentPath, isSafeHttpUrl, isUserWorkspacePath, l10nEntryLabel, mailSendFailureKey, mailSendFailureMessage, mediaTypeEssence, mergeCreateDocumentBody, mergeDocumentPermissionsContext, navigableUrlOrNull, needsContentLakeIngest, normalizeDocumentAcls, normalizeDocumentPickerList, normalizeNuxeoPath, noteFormatLabel, nuxeoPathSegments, nuxeoPathsEqual, nuxeoPathsEqualFlexible, originOf, parentNuxeoFolderPath, parseBrowseNuxeoPathFromRouterUrl, parseDocumentSubtypes, permissionCreateMailFailureMessage, permissionNotificationAceNotFoundKey, permissionNotificationAceNotFoundMessage, permissionRightLabel, permissionUpdateMailFailureMessage, postTrashBrowseRouterUrl, principalPermissionTimeFrameLabel, principalPermissionToLocalRow, readBlobDigest, readClipboardDocs, readContentLakeIngestMarker, readGroupsFromMe, renderNoteMarkdown, renderTrustedHtml, resolveAcePrincipal, resolveCreatableSubtypes, resolveImportBlobDocType, resolveIngestMarkerWriteProperty, resolveNatureLabel, resolveNuxeoIconPath, resolvePaginatedListTotal, resolveParentSourceName, sanitizeDocumentCreateName, sanitizeDocumentName, shouldProbeContentLakeIngestStatus, shouldShowExpiresFieldError, shouldShowUserWorkspaceBreadcrumbs, sortDocumentSubtypes, summarizeCsvImportReport, supportsContentLakeIngest, taskDueDistance, titleFromFileName, toBrowseRouterUrl, topLevelNuxeoFolderPath, trustObjectUrl, userWorkspaceBrowseRouterUrl, userWorkspaceOwnerFromPath, userWorkspaceRootFromPath, vocabularyParentRequired, vocabularySupportsParent, vocabularyTableColumns, writeClipboardDocs };
export type { ARenderConfig, AdminAccessChecks, AggregateBucket, AggregateResult, AssetAggregations, AssetQueueItem, AssetSearchParams, AssetSearchResult, AuditEntry, AuditLogList, AuditLogQuery, AuditLogSortField, AuthorizedApplication, AvatarColor, BlobClientReason, BrowsePageRequest, BrowseSortEntry, ClipboardDoc, ClipboardPasteEvent, CompareRow, CompareSection, ConnectedAccount, ContentLakeBackfillResult, ContentLakeDuplicate, ContentLakeIngestCommand, ContentLakeIngestStatus, CreateBlobHoldingDocumentOptions, CsvImportResult, CsvServerImportOptions, DirectoryEntriesResponse, DirectoryEntry, DirectoryEntryRest, DirectoryMetadata, FetchBlobOptions, GlobalSearchSuggestion, ImportFileEntry, ImportFilesOptions, ImportProgress, L10nDirectoryEntry, L10nOptionGroup, LocalPermissionRow, ManagedDirectoryEntry, NavigableUrlPolicy, NoteMimeType, NuxeoAce, NuxeoAcl, NuxeoComment, NuxeoCommentList, NuxeoComplexField, NuxeoContentModel, NuxeoCreateDocumentTemplate, NuxeoDoctypeDefinition, NuxeoDocument, NuxeoDocumentList, NuxeoFacetDefinition, NuxeoFieldType, NuxeoGroup, NuxeoGroupList, NuxeoOAuth2Provider, NuxeoOAuth2ServiceProvider, NuxeoOAuth2ServiceProviderList, NuxeoOAuth2Token, NuxeoOAuth2TokenList, NuxeoPaginatedList, NuxeoSamlLoginEndpoint, NuxeoSchemaDefinition, NuxeoSubtypeEntry, NuxeoTask, NuxeoTaskList, NuxeoTypesConfig, NuxeoUser, NuxeoUserList, NuxeoWorkflow, NuxeoWorkflowList, NuxeoWorkflowModel, NuxeoWorkflowModelList, PaginatedListMeta, PermissionMessageTranslate, PermissionWithNotificationResult, PrincipalPermissionPage, PrincipalPermissionRow, SavedSearch, SavedSearchOption, SearchAggregations, SearchCollectionOption, SearchQueryParams, SearchResponse, SearchResultItem, StageFileInBatchOptions, StagedBatchFile, SynchronizationRootRow, TaskDueDistance, TrashFilters, TrashLayoutMode, TrashResultItem, TrashSearchParams, TrustedHtmlConfig, UserGroupSuggestion, VocabularyEntryFormValues };
//# sourceMappingURL=index.d.ts.map
