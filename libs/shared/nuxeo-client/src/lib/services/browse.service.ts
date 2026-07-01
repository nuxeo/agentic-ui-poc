import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EMPTY, Observable, timer, switchMap, map, of, throwError, expand, reduce } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { NuxeoDocument, NuxeoDocumentList } from '../models/document.model';
import { NuxeoApiBase } from './nuxeo-api-base';
import { parseDocumentSubtypes, sortDocumentSubtypes } from '../utils/parse-document-subtypes';

@Injectable({ providedIn: 'root' })
export class BrowseService {
  private readonly api = inject(NuxeoApiBase);
  private readonly http = inject(HttpClient);

  getByPath(nuxeoPath: string): Observable<NuxeoDocument> {
    const safePath = nuxeoPath.replace(/\/+$/, '') || '/';
    return this.api.get<NuxeoDocument>(`/nuxeo/api/v1/path${safePath}`, undefined, {
      properties: '*',
      'enrichers.document': 'acls,permissions,favorites,subscribedNotifications',
    });
  }

  /** Folder metadata plus allowed child document types (`@subtypes` enricher). */
  getFolderContext(nuxeoPath: string): Observable<NuxeoDocument> {
    const safePath = nuxeoPath.replace(/\/+$/, '') || '/';
    return this.api.get<NuxeoDocument>(`/nuxeo/api/v1/path${safePath}`, undefined, {
      properties: '*',
      'enrichers.document': 'subtypes',
    });
  }

  /**
   * Allowed child document types for `nuxeoPath`, from the Nuxeo `subtypes` enricher.
   * @see https://doc.nuxeo.com/rest-api/1/document-enrichers/#subtypes
   */
  getCreatableSubtypes(nuxeoPath: string): Observable<string[]> {
    return this.getFolderContext(nuxeoPath).pipe(
      map((doc) => sortDocumentSubtypes(parseDocumentSubtypes(doc))),
    );
  }

  getChildren(
    nuxeoPath: string,
    pageSize = 50,
    currentPageIndex = 0,
  ): Observable<NuxeoDocumentList> {
    const safePath = nuxeoPath.replace(/\/+$/, '') || '/';
    const params = new HttpParams()
      .set('pageSize', pageSize)
      .set('currentPageIndex', currentPageIndex);

    return this.api.get<NuxeoDocumentList>(`/nuxeo/api/v1/path${safePath}/@children`, params, {
      properties: '*',
    });
  }

  /**
   * Folder children for the browse tree via Nuxeo's `tree_children` page provider
   * (same query Nuxeo Web UI uses: Folderish, not trashed, not hidden in navigation).
   * Fetches all pages when the provider marks additional pages available.
   */
  getTreeChildren(parentUid: string, pageSize = 50): Observable<NuxeoDocumentList> {
    type TreeChildrenPage = NuxeoDocumentList & { isNextPageAvailable?: boolean };

    const fetchPage = (pageIndex: number) => {
      const params = new HttpParams()
        .set('queryParams', parentUid)
        .set('pageSize', pageSize)
        .set('currentPageIndex', pageIndex);

      return this.api.get<TreeChildrenPage>(
        '/nuxeo/api/v1/search/pp/tree_children/execute',
        params,
        { properties: '*' },
      );
    };

    const emptyList: NuxeoDocumentList = {
      entries: [],
      totalSize: 0,
      currentPageSize: 0,
      currentPageIndex: 0,
      numberOfPages: 1,
    };

    return fetchPage(0).pipe(
      expand((res) => (res.isNextPageAvailable ? fetchPage(res.currentPageIndex + 1) : EMPTY)),
      reduce<TreeChildrenPage, NuxeoDocumentList>((acc, res) => {
        const entries = [...acc.entries, ...(res.entries ?? [])];
        return {
          entries,
          totalSize: res.totalSize ?? entries.length,
          currentPageSize: entries.length,
          currentPageIndex: 0,
          numberOfPages: 1,
        };
      }, emptyList),
    );
  }

  updateDocument(uid: string, properties: Record<string, unknown>): Observable<NuxeoDocument> {
    return this.api.put<NuxeoDocument>(
      `/nuxeo/api/v1/id/${uid}`,
      { 'entity-type': 'document', properties },
      { 'Content-Type': 'application/json', properties: '*' },
    );
  }

  getTrashedChildren(parentUid: string, pageSize = 50): Observable<NuxeoDocumentList> {
    const query =
      `SELECT * FROM Document WHERE ecm:parentId = '${parentUid}' ` +
      `AND ecm:isTrashed = 1 ORDER BY dc:modified DESC`;
    const params = new HttpParams().set('query', query).set('pageSize', pageSize);
    return this.http.get<NuxeoDocumentList>(
      this.api.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'),
      { params, headers: { properties: 'dublincore' } },
    );
  }

  restoreDocument(uid: string): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(`/nuxeo/api/v1/id/${uid}/@op/Document.Untrash`, {
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
  startCsvExport(parentUid: string): Observable<string> {
    const query =
      `SELECT * FROM Document WHERE ecm:parentId = '${parentUid}' ` +
      `AND ecm:mixinType != 'HiddenInNavigation' ` +
      `AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0`;
    return this.http
      .post(
        this.api.apiUrl('/nuxeo/api/v1/automation/Bulk.RunAction/@async'),
        {
          params: { action: 'csvExport', query },
          context: {},
        },
        {
          headers: { 'Content-Type': 'application/json' },
          observe: 'response',
          responseType: 'text',
        },
      )
      .pipe(
        map((resp) => {
          const location = resp.headers.get('Location') ?? '';
          const uuidMatch = location.match(
            /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
          );
          if (uuidMatch) return uuidMatch[1];
          const bodyMatch = (resp.body ?? '').match(
            /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
          );
          if (bodyMatch) return bodyMatch[1];
          throw new Error('Could not extract execution ID from response');
        }),
      );
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
  pollAndDownloadCsv(executionId: string): Observable<Blob> {
    const statusUrl = this.api.apiUrl(
      `/nuxeo/site/api/v1/automation/Bulk.RunAction/@async/${executionId}/status`,
    );
    const resultUrl = this.api.apiUrl(
      `/nuxeo/site/api/v1/automation/Bulk.RunAction/@async/${executionId}`,
    );

    const fetchResult = (): Observable<Blob> =>
      this.http.get<{ url: string }>(resultUrl).pipe(
        switchMap((result) => {
          const blobPath = new URL(result.url).pathname;
          return this.http.get(this.api.apiUrl(blobPath), {
            responseType: 'blob',
          });
        }),
      );

    const poll = (): Observable<Blob> =>
      this.http.get(statusUrl, { observe: 'response', responseType: 'text' }).pipe(
        switchMap((resp) => {
          if (resp.status === 200 && resp.body) {
            try {
              const result = JSON.parse(resp.body) as { url: string };
              const blobPath = new URL(result.url).pathname;
              return this.http.get(this.api.apiUrl(blobPath), {
                responseType: 'blob',
              });
            } catch {
              return of(new Blob([resp.body], { type: 'text/csv' }));
            }
          }
          return timer(1500).pipe(switchMap(() => poll()));
        }),
        catchError((err) => {
          if (err.status === 401 || err.status === 0) {
            return fetchResult();
          }
          return throwError(() => err);
        }),
      );

    return timer(1000).pipe(switchMap(() => poll()));
  }
}
