import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { NuxeoDocument, NuxeoDocumentList } from '../models/document.model';
import { NuxeoApiBase } from './nuxeo-api-base';

export interface SavedSearch {
  uid: string;
  title: string;
  params: Record<string, unknown>;
}

export interface TrashSearchParams {
  fullText?: string;
  path?: string;
  author?: string;
  sizeRanges?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  pageSize?: number;
  currentPageIndex?: number;
}

@Injectable({ providedIn: 'root' })
export class TrashService {
  private readonly api = inject(NuxeoApiBase);
  private readonly http = inject(HttpClient);

  searchTrash(params: TrashSearchParams = {}): Observable<NuxeoDocumentList> {
    const clauses: string[] = ['ecm:isTrashed = 1', "ecm:mixinType != 'HiddenInNavigation'"];

    if (params.fullText?.trim()) {
      clauses.push(`ecm:fulltext = '${params.fullText.trim()}'`);
    }
    if (params.path?.trim() && params.path !== '/') {
      clauses.push(`ecm:path STARTSWITH '${params.path.trim()}'`);
    }
    if (params.author?.trim()) {
      clauses.push(`dc:creator = '${params.author.trim()}'`);
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

    return this.http.get<NuxeoDocumentList>(
      this.api.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'),
      {
        params: httpParams,
        headers: {
          properties: '*',
          'enrichers.document': 'thumbnail,favorites',
        },
      },
    );
  }

  getPathSuggestions(parentPath: string): Observable<NuxeoDocumentList> {
    const safePath = parentPath.replace(/\/+$/, '') || '/';
    const query =
      `SELECT * FROM Document WHERE ecm:path STARTSWITH '${safePath}' ` +
      `AND ecm:primaryType IN ('Domain', 'WorkspaceRoot', 'Workspace', 'Folder', 'OrderedFolder', 'SectionRoot', 'Section', 'TemplateRoot') ` +
      `AND ecm:isTrashed = 0 AND ecm:mixinType != 'HiddenInNavigation' ` +
      `ORDER BY dc:title`;
    const params = new HttpParams().set('query', query).set('pageSize', 20);
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

  permanentlyDelete(uid: string): Observable<void> {
    return this.http.delete<void>(this.api.apiUrl(`/nuxeo/api/v1/id/${uid}`));
  }

  saveSearch(title: string, params: Record<string, unknown>): Observable<SavedSearch> {
    const body = {
      'entity-type': 'savedSearch',
      title,
      pageProviderName: 'default_trash_search',
      params,
    };
    return this.http
      .post<{
        id: string;
        title: string;
        params: Record<string, unknown>;
      }>(this.api.apiUrl('/nuxeo/api/v1/search/saved'), body, { headers: { 'Content-Type': 'application/json' } })
      .pipe(
        map((res) => ({
          uid: res.id ?? '',
          title: res.title ?? title,
          params: res.params ?? params,
        })),
      );
  }

  updateSearch(
    uid: string,
    title: string,
    params: Record<string, unknown>,
  ): Observable<SavedSearch> {
    const body = {
      'entity-type': 'savedSearch',
      title,
      pageProviderName: 'default_trash_search',
      params,
    };
    return this.http
      .put<{
        id: string;
        title: string;
        params: Record<string, unknown>;
      }>(this.api.apiUrl(`/nuxeo/api/v1/search/saved/${uid}`), body, { headers: { 'Content-Type': 'application/json' } })
      .pipe(
        map((res) => ({
          uid: res.id ?? uid,
          title: res.title ?? title,
          params: res.params ?? params,
        })),
      );
  }

  getSavedSearches(): Observable<SavedSearch[]> {
    const params = new HttpParams().set('pageProvider', 'default_trash_search');
    return this.http
      .get<{
        entries: Array<{
          id: string;
          title: string;
          params: Record<string, unknown>;
          [k: string]: unknown;
        }>;
      }>(this.api.apiUrl('/nuxeo/api/v1/search/saved'), {
        params,
        headers: {
          properties: '*',
          'fetch-document': 'properties',
          'enrichers-document': 'thumbnail, permissions',
        },
      })
      .pipe(
        map((res) =>
          (res.entries ?? []).map((entry) => ({
            uid: entry.id ?? '',
            title: entry.title ?? 'Untitled',
            params: entry.params ?? {},
          })),
        ),
      );
  }

  private sizeRangeToClause(range: string): string {
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
}
