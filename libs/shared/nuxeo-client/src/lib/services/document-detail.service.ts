import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { NuxeoDocument, NuxeoDocumentList } from '../models/document.model';
import { AuditLogList } from '../models/audit.model';
import { NuxeoApiBase } from './nuxeo-api-base';

@Injectable({ providedIn: 'root' })
export class DocumentDetailService {
  private readonly api = inject(NuxeoApiBase);
  private readonly http = inject(HttpClient);

  getFullDocument(uid: string): Observable<NuxeoDocument> {
    return this.api.get<NuxeoDocument>(
      `/nuxeo/api/v1/id/${uid}`,
      undefined,
      { properties: '*', 'enrichers.document': 'acls,renditions,favorites,subscribedNotifications,collections' },
    );
  }

  fetchBlob(uid: string): Observable<Blob> {
    return this.http.get(this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@blob/blobholder:0`), {
      responseType: 'blob',
    });
  }

  fetchPdfRendition(uid: string): Observable<Blob> {
    return this.http.get(this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@rendition/pdf`), {
      responseType: 'blob',
    });
  }

  fetchThumbnail(uid: string): Observable<Blob> {
    return this.http.get(this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@rendition/thumbnail`), {
      responseType: 'blob',
    });
  }

  getAuditLog(uid: string, pageSize = 50, currentPageIndex = 0): Observable<AuditLogList> {
    const params = new HttpParams()
      .set('pageSize', pageSize)
      .set('currentPageIndex', currentPageIndex);
    return this.http.get<AuditLogList>(
      this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@audit`),
      { params },
    );
  }

  getPublishedVersions(uid: string): Observable<NuxeoDocumentList> {
    const query =
      `SELECT * FROM Document WHERE ecm:isProxy = 1 AND ecm:isTrashed = 0 ` +
      `AND (rend:sourceVersionableId = "${uid}" ` +
      `OR ecm:proxyVersionableId = "${uid}")`;
    const params = new HttpParams()
      .set('queryParams', query)
      .set('pageSize', '40')
      .set('sortBy', 'dc:modified,uid:major_version,uid:minor_version')
      .set('sortOrder', 'desc,desc,desc');
    return this.http.get<NuxeoDocumentList>(
      this.api.apiUrl('/nuxeo/api/v1/search/pp/nxql_search/execute'),
      { params, headers: { properties: 'dublincore,common,uid,rendition' } },
    );
  }

  getSectionTree(): Observable<NuxeoDocumentList> {
    const query =
      `SELECT * FROM Document WHERE ecm:primaryType IN ('SectionRoot', 'Section') ` +
      `AND ecm:isTrashed = 0 ORDER BY dc:title`;
    const params = new HttpParams().set('query', query).set('pageSize', '200');
    return this.http.get<NuxeoDocumentList>(
      this.api.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'),
      { params, headers: { properties: 'dublincore' } },
    );
  }

  publishDocument(
    uid: string,
    targetSectionId: string,
    options?: { override?: boolean; renditionName?: string; defaultRendition?: boolean },
  ): Observable<NuxeoDocument> {
    const params: Record<string, unknown> = { target: targetSectionId };
    if (options?.override) params['override'] = 'true';
    if (options?.renditionName) params['renditionName'] = options.renditionName;
    if (options?.defaultRendition) params['defaultRendition'] = true;
    return this.api.post<NuxeoDocument>(
      `/nuxeo/api/v1/id/${uid}/@op/Document.PublishToSection`,
      { params, context: {} },
    );
  }

  unpublishDocument(proxyUid: string): Observable<unknown> {
    return this.http.delete(
      this.api.apiUrl(`/nuxeo/api/v1/id/${proxyUid}`),
    );
  }

  republishDocument(sourceUid: string, targetSectionId: string): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(
      `/nuxeo/api/v1/id/${sourceUid}/@op/Document.PublishToSection`,
      { params: { target: targetSectionId, override: 'true' }, context: {} },
    );
  }

  lockDocument(uid: string): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(
      `/nuxeo/api/v1/id/${uid}/@op/Document.Lock`,
      { params: {}, context: {} },
    );
  }

  unlockDocument(uid: string): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(
      `/nuxeo/api/v1/id/${uid}/@op/Document.Unlock`,
      { params: {}, context: {} },
    );
  }

  addToFavorites(uid: string): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(
      `/nuxeo/api/v1/id/${uid}/@op/Document.AddToFavorites`,
      { params: {}, context: {} },
    );
  }

  removeFromFavorites(uid: string): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(
      `/nuxeo/api/v1/id/${uid}/@op/Document.RemoveFromFavorites`,
      { params: {}, context: {} },
    );
  }

  trashDocument(uid: string): Observable<NuxeoDocument> {
    const input = uid.startsWith('doc:') || uid.startsWith('docs:') ? uid : `docs:${uid}`;
    return this.api.post<NuxeoDocument>(
      '/nuxeo/api/v1/automation/Document.Trash',
      { params: {}, context: {}, input },
    );
  }

  trashDocuments(uids: string[]): Observable<NuxeoDocument[]> {
    if (uids.length === 0) return of([]);
    return forkJoin(uids.map((uid) => this.trashDocument(uid)));
  }

  subscribe(uid: string, notifications = 'Creation,Modification'): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(
      `/nuxeo/api/v1/id/${uid}/@op/Document.Subscribe`,
      { params: { notifications }, context: {} },
    );
  }

  unsubscribe(uid: string, notifications = 'Creation,Modification'): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(
      `/nuxeo/api/v1/id/${uid}/@op/Document.Unsubscribe`,
      { params: { notifications }, context: {} },
    );
  }

  addToCollection(uid: string, collectionId: string): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(
      `/nuxeo/api/v1/id/${uid}/@op/Document.AddToCollection`,
      { params: { collection: collectionId }, context: {} },
    );
  }

  getCollections(): Observable<NuxeoDocumentList> {
    const query =
      `SELECT * FROM Collection WHERE ecm:isTrashed = 0 ` +
      `AND ecm:currentLifeCycleState != 'deleted' ORDER BY dc:title`;
    const params = new HttpParams().set('query', query).set('pageSize', '100');
    return this.http.get<NuxeoDocumentList>(
      this.api.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'),
      { params, headers: { properties: 'dublincore' } },
    );
  }

  exportBlob(uid: string): Observable<Blob> {
    return this.http.get(
      this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@blob/blobholder:0`),
      { responseType: 'blob' },
    );
  }

  exportZip(uid: string, filename = 'export.zip'): Observable<Blob> {
    return this.http.post(
      this.api.apiUrl('/nuxeo/api/v1/automation/Blob.BulkDownload'),
      { params: { filename }, input: `docs:${uid}` },
      { responseType: 'blob' },
    );
  }

  exportXml(uid: string): Observable<Blob> {
    return this.http.get(
      this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@export?adapter=export`),
      { responseType: 'blob' },
    );
  }

  startWorkflow(uid: string, workflowModelName: string): Observable<unknown> {
    return this.api.post<unknown>(
      `/nuxeo/api/v1/id/${uid}/@workflow`,
      { 'entity-type': 'workflow', workflowModelName, attachedDocumentIds: [{ id: uid }] },
    );
  }

  getAvailableWorkflows(uid: string): Observable<{ entries: Array<{ workflowModelName: string; title: string }> }> {
    return this.api.get<{ entries: Array<{ workflowModelName: string; title: string }> }>(
      `/nuxeo/api/v1/id/${uid}/@workflow`,
    );
  }

  createCollection(title: string, description = ''): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(
      `/nuxeo/api/v1/path/default-domain/UserWorkspaces/Administrator`,
      {
        'entity-type': 'document',
        type: 'Collection',
        name: title.replace(/\s+/g, '-').toLowerCase(),
        properties: { 'dc:title': title, 'dc:description': description },
      },
    );
  }

  searchUsersGroups(searchTerm: string): Observable<UserGroupSuggestion[]> {
    return this.api.post<UserGroupSuggestion[]>(
      '/nuxeo/api/v1/automation/UserGroup.Suggestion',
      {
        params: { searchTerm, searchType: 'USER_GROUP_TYPE' },
        context: {},
      },
      { 'Content-Type': 'application/json' },
    );
  }

  addACE(
    uid: string,
    params: {
      user: string;
      permission: string;
      notify?: boolean;
      comment?: string;
      begin?: string;
      end?: string;
    },
  ): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(
      `/nuxeo/api/v1/id/${uid}/@op/Document.AddACE`,
      { params, context: {} },
      { 'Content-Type': 'application/json' },
    );
  }

  blockPermissionInheritance(uid: string): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(
      `/nuxeo/api/v1/id/${uid}/@op/Document.BlockPermissionInheritance`,
      { params: {}, context: {} },
      { 'Content-Type': 'application/json' },
    );
  }

  unblockPermissionInheritance(uid: string): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(
      `/nuxeo/api/v1/id/${uid}/@op/Document.UnblockPermissionInheritance`,
      { params: {}, context: {} },
      { 'Content-Type': 'application/json' },
    );
  }

  replaceACE(
    uid: string,
    params: {
      user: string;
      permission: string;
      overwrite?: boolean;
      notify?: boolean;
      comment?: string;
      begin?: string;
      end?: string;
    },
  ): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(
      `/nuxeo/api/v1/id/${uid}/@op/Document.SetACE`,
      { params: { ...params, overwrite: params.overwrite ?? true }, context: {} },
      { 'Content-Type': 'application/json' },
    );
  }

  addExternalPermission(
    uid: string,
    params: {
      email: string;
      permission: string;
      notify?: boolean;
      comment?: string;
      begin?: string | null;
      end?: string;
    },
  ): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(
      '/nuxeo/api/v1/automation/Document.AddPermission',
      {
        params: {
          email: params.email,
          permission: params.permission,
          begin: params.begin ?? null,
          end: params.end,
          notify: params.notify ?? true,
          comment: params.comment ?? '',
        },
        context: {},
        input: uid,
      },
      { 'Content-Type': 'application/json' },
    );
  }

  sendNotificationEmailForPermission(uid: string, aceId: string): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(
      '/nuxeo/api/v1/automation/Document.SendNotificationEmailForPermission',
      { params: { id: aceId }, context: {}, input: uid },
      { 'Content-Type': 'application/json' },
    );
  }

  removePermission(
    uid: string,
    params: { user: string; permission: string; acl?: string },
  ): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(
      `/nuxeo/api/v1/id/${uid}/@op/Document.RemovePermission`,
      { params: { ...params, acl: params.acl ?? 'local' }, context: {} },
      { 'Content-Type': 'application/json' },
    );
  }

  // ── Attachments ──

  uploadAttachment(uid: string, file: File): Observable<unknown> {
    const params = JSON.stringify({
      params: { document: uid, save: 'true', xpath: 'files:files' },
    });
    const formData = new FormData();
    formData.append('request', new Blob([params], { type: 'application/json' }));
    formData.append('file', file);
    return this.http.post(
      this.api.apiUrl('/nuxeo/api/v1/automation/Blob.AttachOnDocument'),
      formData,
      { responseType: 'blob' },
    );
  }

  removeAttachment(uid: string, index: number): Observable<NuxeoDocument> {
    return this.getFullDocument(uid).pipe(
      switchMap((doc) => {
        const files = (doc.properties['files:files'] as unknown[]) ?? [];
        const updated = files.filter((_, i) => i !== index);
        return this.http.put<NuxeoDocument>(
          this.api.apiUrl(`/nuxeo/api/v1/id/${uid}`),
          { 'entity-type': 'document', uid, properties: { 'files:files': updated } },
          { headers: { 'Content-Type': 'application/json' } },
        );
      }),
    );
  }

  replaceAttachment(uid: string, index: number, file: File): Observable<unknown> {
    const params = JSON.stringify({
      params: { document: uid, save: 'true', xpath: `files:files/${index}/file` },
    });
    const formData = new FormData();
    formData.append('request', new Blob([params], { type: 'application/json' }));
    formData.append('file', file);
    return this.http.post(
      this.api.apiUrl('/nuxeo/api/v1/automation/Blob.AttachOnDocument'),
      formData,
      { responseType: 'blob' },
    );
  }

  // ── Versioning ──

  createVersion(uid: string, increment: 'Major' | 'Minor'): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(
      `/nuxeo/api/v1/id/${uid}/@op/Document.CreateVersion`,
      { params: { increment, saveDocument: true }, context: {} },
      { 'Content-Type': 'application/json' },
    );
  }

  getVersions(uid: string): Observable<NuxeoDocumentList> {
    const query = `SELECT * FROM Document WHERE ecm:versionVersionableId = '${uid}' AND ecm:isVersion = 1 ORDER BY dc:modified DESC`;
    const params = new HttpParams().set('query', query).set('pageSize', '50');
    return this.http.get<NuxeoDocumentList>(
      this.api.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'),
      { params, headers: { properties: '*' } },
    );
  }

  restoreVersion(versionUid: string): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(
      `/nuxeo/api/v1/id/${versionUid}/@op/Document.RestoreVersion`,
      { params: { checkout: true }, context: {} },
      { 'Content-Type': 'application/json' },
    );
  }

  // ── Comments ──

  getComments(uid: string): Observable<NuxeoCommentList> {
    return this.http.get<NuxeoCommentList>(
      this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@comment`),
      { params: new HttpParams().set('pageSize', '100').set('sortBy', 'creationDate').set('sortOrder', 'ASC') },
    );
  }

  getAllComments(uid: string): Observable<NuxeoDocumentList> {
    const query = `SELECT * FROM Comment WHERE ecm:ancestorId = '${uid}' ORDER BY dc:created ASC`;
    const params = new HttpParams().set('query', query).set('pageSize', '200');
    return this.http.get<NuxeoDocumentList>(
      this.api.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'),
      { params, headers: { properties: '*' } },
    );
  }

  createComment(uid: string, text: string): Observable<NuxeoComment> {
    return this.http.post<NuxeoComment>(
      this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@comment`),
      { 'entity-type': 'comment', parentId: uid, text },
    );
  }

  createReply(uid: string, parentCommentId: string, text: string): Observable<NuxeoComment> {
    return this.http.post<NuxeoComment>(
      this.api.apiUrl(`/nuxeo/api/v1/id/${parentCommentId}/@comment`),
      { 'entity-type': 'comment', parentId: parentCommentId, text },
    );
  }

  updateComment(uid: string, commentId: string, text: string): Observable<NuxeoComment> {
    return this.http.put<NuxeoComment>(
      this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@comment/${commentId}`),
      { 'entity-type': 'comment', text },
    );
  }

  deleteComment(uid: string, commentId: string): Observable<void> {
    return this.http.delete<void>(
      this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@comment/${commentId}`),
    );
  }

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
