import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { NUXEO_API_ORIGIN } from '../nuxeo-api.config';

export interface NuxeoDocument {
  uid: string;
  title: string;
  type: string;
  path: string;
  lastModified: string;
  properties: Record<string, unknown>;
}

export interface NuxeoDocumentList {
  entries: NuxeoDocument[];
  totalSize: number;
  currentPageSize: number;
  currentPageIndex: number;
  numberOfPages: number;
}

export interface NuxeoTask {
  id: string;
  name: string;
  directive: string;
  workflowModelName: string;
  workflowTitle: string;
  created: string;
  dueDate: string;
  state: string;
  targetDocumentIds: { id: string }[];
  actors: { id: string }[];
  taskInfo: {
    taskActions: { name: string; label: string }[];
  };
  targetDocTitle?: string;
}

export interface NuxeoTaskList {
  entries: NuxeoTask[];
  totalSize: number;
  currentPageSize: number;
  currentPageIndex: number;
  numberOfPages: number;
}

const RECENTLY_EDITED_QUERY = [
  "SELECT * FROM Document",
  "WHERE ecm:mixinType != 'HiddenInNavigation'",
  "AND ecm:isProxy = 0",
  "AND ecm:isVersion = 0",
  "AND ecm:isTrashed = 0",
  "ORDER BY dc:modified DESC",
].join(' ');

const RECENTLY_VIEWED_QUERY = [
  "SELECT * FROM Document",
  "WHERE ecm:mixinType != 'HiddenInNavigation'",
  "AND ecm:isProxy = 0",
  "AND ecm:isVersion = 0",
  "AND ecm:isTrashed = 0",
  "AND ecm:primaryType NOT IN ('Root', 'Favorites', 'Collections')",
  "AND (dc:creator = '{user}' OR dc:lastContributor = '{user}')",
  "ORDER BY dc:modified DESC",
].join(' ');

const FAVORITES_COLLECTION_QUERY = [
  "SELECT * FROM Document",
  "WHERE ecm:primaryType = 'Favorites'",
  "AND ecm:path STARTSWITH '/default-domain/UserWorkspaces/{user}'",
].join(' ');

@Injectable({ providedIn: 'root' })
export class NuxeoDocumentService {
  private readonly http = inject(HttpClient);
  private readonly apiOrigin = inject(NUXEO_API_ORIGIN);

  private apiUrl(path: string): string {
    return `${this.apiOrigin.replace(/\/$/, '')}${path}`;
  }

  private nxqlSearch(query: string, pageSize: number): Observable<NuxeoDocumentList> {
    const params = new HttpParams().set('query', query).set('pageSize', pageSize);
    return this.http.get<NuxeoDocumentList>(
      this.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'),
      { params, headers: { properties: 'dublincore' } },
    );
  }

  getRecentlyEdited(pageSize = 10): Observable<NuxeoDocumentList> {
    return this.nxqlSearch(RECENTLY_EDITED_QUERY, pageSize);
  }

  getRecentlyViewed(userId: string, pageSize = 10): Observable<NuxeoDocumentList> {
    const query = RECENTLY_VIEWED_QUERY.replace(/\{user\}/g, userId);
    return this.nxqlSearch(query, pageSize);
  }

  getFavorites(userId: string, pageSize = 10): Observable<NuxeoDocumentList> {
    const collectionQuery = FAVORITES_COLLECTION_QUERY.replace(/\{user\}/g, userId);

    return this.nxqlSearch(collectionQuery, 1).pipe(
      switchMap((res) => {
        const favCollection = res.entries[0];
        if (!favCollection) return of({ entries: [], totalSize: 0 } as unknown as NuxeoDocumentList);

        const params = new HttpParams()
          .set('queryParams', favCollection.uid)
          .set('pageSize', pageSize);
        return this.http.get<NuxeoDocumentList>(
          this.apiUrl('/nuxeo/api/v1/search/pp/default_content_collection/execute'),
          { params, headers: { properties: 'dublincore' } },
        );
      }),
    );
  }

  getUserTasks(userId: string, pageSize = 10): Observable<NuxeoTask[]> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('pageSize', pageSize);

    return this.http
      .get<NuxeoTaskList>(this.apiUrl('/nuxeo/api/v1/task'), { params })
      .pipe(
        map((res) => res.entries),
        switchMap((tasks) => {
          if (tasks.length === 0) return of([] as NuxeoTask[]);

          const enriched$ = tasks.map((task) => {
            const docId = task.targetDocumentIds?.[0]?.id;
            if (!docId) return of(task);

            return this.http
              .get<NuxeoDocument>(this.apiUrl(`/nuxeo/api/v1/id/${docId}`))
              .pipe(
                map((doc) => ({ ...task, targetDocTitle: doc.title })),
                catchError(() => of(task)),
              );
          });

          return forkJoin(enriched$);
        }),
      );
  }
}
