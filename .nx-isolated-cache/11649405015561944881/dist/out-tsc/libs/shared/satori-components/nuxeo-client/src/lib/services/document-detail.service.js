import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin, of, map, catchError, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CURRENT_USERNAME } from '../current-user.token';
import { findLocalAceForPrincipal, isMailSendError, mailSendFailureKey, permissionNotificationAceNotFoundKey, } from '../utils/permission-notification';
import { NuxeoApiBase } from './nuxeo-api-base';
import { normalizeDocumentAcls } from '../utils/ace-principal';
import { BLOB_CLIENT_REASON_PARAM } from '../utils/blob-client-reason';
import * as i0 from "@angular/core";
export class DocumentDetailService {
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
            .pipe(map((doc) => normalizeDocumentAcls(doc)));
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
            .pipe(catchError(() => this.http.get(blobHolderUrl, blobOptions)));
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
        return forkJoin(uids.map((uid) => this.trashDocument(uid).pipe(catchError(() => of(null))))).pipe(map((results) => results.filter((r) => r !== null)));
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
            .pipe(map((doc) => {
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
        return this.getDocumentPermissions(uid).pipe(catchError(() => of(null)), switchMap((permDoc) => {
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
        return this.sendNotificationEmailForPermission(uid, aceId).pipe(map((updated) => ({ document: updated, notificationSent: true })), catchError((err) => {
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
            .pipe(map((res) => res.entries ?? []));
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
    static ɵfac = function DocumentDetailService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DocumentDetailService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: DocumentDetailService, factory: DocumentDetailService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DocumentDetailService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
//# sourceMappingURL=document-detail.service.js.map