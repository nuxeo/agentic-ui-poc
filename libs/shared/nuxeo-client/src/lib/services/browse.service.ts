import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { NuxeoDocument, NuxeoDocumentList } from '../models/document.model';
import { NuxeoApiBase } from './nuxeo-api-base';

@Injectable({ providedIn: 'root' })
export class BrowseService {
  private readonly api = inject(NuxeoApiBase);

  getByPath(nuxeoPath: string): Observable<NuxeoDocument> {
    const safePath = nuxeoPath.replace(/\/+$/, '') || '/';
    return this.api.get<NuxeoDocument>(
      `/nuxeo/api/v1/path${safePath}`,
      undefined,
      { properties: 'dublincore' },
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

    return this.api.get<NuxeoDocumentList>(
      `/nuxeo/api/v1/path${safePath}/@children`,
      params,
      { properties: 'dublincore' },
    );
  }
}
