import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

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
      { properties: '*', 'enrichers.document': 'acls,renditions,favorites,subscribedNotifications' },
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
      `SELECT * FROM Document WHERE ecm:isProxy = 1 ` +
      `AND ecm:proxyTargetId = '${uid}' ` +
      `AND ecm:isTrashed = 0`;
    const params = new HttpParams().set('query', query).set('pageSize', '50');
    return this.http.get<NuxeoDocumentList>(
      this.api.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'),
      { params, headers: { properties: 'dublincore,uid' } },
    );
  }

  getSectionTree(): Observable<NuxeoDocumentList> {
    const query =
      `SELECT * FROM Document WHERE ecm:primaryType IN ('SectionRoot', 'Section') ` +
      `AND ecm:isTrashed = 0 ORDER BY ecm:path`;
    const params = new HttpParams().set('query', query).set('pageSize', '200');
    return this.http.get<NuxeoDocumentList>(
      this.api.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'),
      { params, headers: { properties: 'dublincore' } },
    );
  }

  publishDocument(uid: string, targetSectionId: string): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(
      `/nuxeo/api/v1/id/${uid}/@op/Document.PublishToSection`,
      {
        params: { target: targetSectionId, override: 'true' },
        context: {},
      },
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
    return this.api.post<NuxeoDocument>(
      `/nuxeo/api/v1/id/${uid}/@op/Document.Trash`,
      { params: {}, context: {} },
    );
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
