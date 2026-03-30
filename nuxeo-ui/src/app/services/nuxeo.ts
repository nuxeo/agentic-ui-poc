import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NuxeoDocument {
  uid: string;
  path: string;
  type: string;
  title: string;
  lastModified: string;
  properties: Record<string, unknown>;
  facets?: string[];
}

export interface NuxeoList {
  'entity-type': string;
  totalSize: number;
  entries: NuxeoDocument[];
}

@Injectable({ providedIn: 'root' })
export class NuxeoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.nuxeoUrl}/api/v1`;

  getChildren(parentPath: string = '/'): Observable<NuxeoList> {
    return this.http.get<NuxeoList>(
      `${this.base}/path${parentPath}/@children`,
    );
  }

  getDocument(path: string): Observable<NuxeoDocument> {
    return this.http.get<NuxeoDocument>(`${this.base}/path${path}`);
  }

  search(query: string, pageSize = 20, currentPage = 0): Observable<NuxeoList> {
    const sanitized = query.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const params = new HttpParams()
      .set('query', `SELECT * FROM Document WHERE ecm:fulltext = '${sanitized}' AND ecm:isVersion = 0 AND ecm:isTrashed = 0`)
      .set('pageSize', pageSize)
      .set('currentPageIndex', currentPage);
    return this.http.get<NuxeoList>(`${this.base}/query`, { params });
  }

  uploadDocument(parentPath: string, file: File): Observable<NuxeoDocument> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<NuxeoDocument>(
      `${this.base}/upload`,
      formData,
    );
  }

  createDocument(parentPath: string, type: string, title: string): Observable<NuxeoDocument> {
    const body = {
      'entity-type': 'document',
      type,
      name: title,
      properties: { 'dc:title': title },
    };
    return this.http.post<NuxeoDocument>(`${this.base}/path${parentPath}`, body);
  }

  deleteDocument(docId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/id/${docId}`);
  }

  getDownloadUrl(doc: NuxeoDocument): string {
    return `${this.base}/id/${doc.uid}/@blob/file:content`;
  }
}
