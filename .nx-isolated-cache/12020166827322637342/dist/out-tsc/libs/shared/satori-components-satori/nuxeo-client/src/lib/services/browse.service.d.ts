import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NuxeoDocument, NuxeoDocumentList } from '../models/document.model';
import * as i0 from "@angular/core";
export interface NavTreeBootstrap {
    root: NuxeoDocument;
    entries: NuxeoDocument[];
}
/** One server-side sort key: a Nuxeo property name such as `dc:title`, and its direction. */
export interface BrowseSortEntry {
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
export interface BrowsePageRequest {
    currentPageIndex?: number;
    sort?: BrowseSortEntry[];
}
export interface BrowseFolderContents {
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
/**
 * Adds Nuxeo's `sortBy` and `sortOrder` to a page request: comma-separated lists of the same
 * length, which `@children` and every page provider read the same way.
 */
export declare function withSort(params: HttpParams, sort?: readonly BrowseSortEntry[]): HttpParams;
export declare class BrowseService {
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
//# sourceMappingURL=browse.service.d.ts.map