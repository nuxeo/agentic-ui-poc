import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { NUXEO_API_ORIGIN } from '../nuxeo-api.config';
import { NuxeoDocumentList } from '../models/document.model';

@Injectable({ providedIn: 'root' })
export class NuxeoApiBase {
  private readonly http = inject(HttpClient);
  private readonly apiOrigin = inject(NUXEO_API_ORIGIN);

  apiUrl(path: string): string {
    return `${this.apiOrigin.replace(/\/$/, '')}${path}`;
  }

  get<T>(path: string, params?: HttpParams, headers?: Record<string, string>): Observable<T> {
    return this.http.get<T>(this.apiUrl(path), { params, headers });
  }

  post<T>(path: string, body: unknown, headers?: Record<string, string>): Observable<T> {
    return this.http.post<T>(this.apiUrl(path), body, { headers });
  }

  put<T>(path: string, body: unknown, headers?: Record<string, string>): Observable<T> {
    return this.http.put<T>(this.apiUrl(path), body, { headers });
  }

  delete<T>(path: string, headers?: Record<string, string>): Observable<T> {
    return this.http.delete<T>(this.apiUrl(path), { headers });
  }

  nxqlSearch(query: string, pageSize: number): Observable<NuxeoDocumentList> {
    const params = new HttpParams().set('query', query).set('pageSize', pageSize);
    return this.http.get<NuxeoDocumentList>(this.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'), {
      params,
      headers: { properties: 'dublincore' },
    });
  }
}
