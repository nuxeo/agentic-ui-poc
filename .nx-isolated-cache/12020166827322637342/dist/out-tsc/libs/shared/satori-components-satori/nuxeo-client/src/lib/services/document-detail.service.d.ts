import { Observable } from 'rxjs';
import { type PermissionWithNotificationResult } from '../utils/permission-notification';
import { NuxeoDocument, NuxeoDocumentList } from '../models/document.model';
import { NuxeoWorkflowModel } from '../models/workflow.model';
import type { AuditLogList, AuditLogQuery } from '../models/audit.model';
import { type FetchBlobOptions } from '../utils/blob-client-reason';
import * as i0 from "@angular/core";
export declare class DocumentDetailService {
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
export interface NuxeoComment {
    id: string;
    parentId: string;
    text: string;
    author: string;
    creationDate: string;
    modificationDate?: string;
    numberOfReplies?: number;
}
export interface NuxeoCommentList {
    entries: NuxeoComment[];
    totalSize: number;
    currentPageSize: number;
    currentPageIndex: number;
    numberOfPages: number;
}
export interface UserGroupSuggestion {
    id: string;
    displayLabel: string;
    type: 'USER_TYPE' | 'GROUP_TYPE';
    prefixed_id: string;
    username?: string;
    groupname?: string;
    email?: string;
}
//# sourceMappingURL=document-detail.service.d.ts.map