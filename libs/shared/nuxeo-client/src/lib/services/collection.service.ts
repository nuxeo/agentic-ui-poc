import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';

import { NuxeoDocumentList } from '../models/document.model';
import { FAVORITES_COLLECTION_QUERY } from '../queries/nxql-queries';
import { NuxeoApiBase } from './nuxeo-api-base';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private readonly api = inject(NuxeoApiBase);

  getFavorites(userId: string, pageSize = 10): Observable<NuxeoDocumentList> {
    const collectionQuery = FAVORITES_COLLECTION_QUERY.replace(/\{user\}/g, userId);

    return this.api.nxqlSearch(collectionQuery, 1).pipe(
      switchMap((res) => {
        const favCollection = res.entries[0];
        if (!favCollection) {
          return of({
            entries: [],
            totalSize: 0,
            currentPageSize: 0,
            currentPageIndex: 0,
            numberOfPages: 0,
          } satisfies NuxeoDocumentList);
        }
        return this.getCollectionMembers(favCollection.uid, pageSize);
      }),
    );
  }

  getCollectionMembers(collectionUid: string, pageSize = 10): Observable<NuxeoDocumentList> {
    const params = new HttpParams()
      .set('queryParams', collectionUid)
      .set('pageSize', pageSize);

    return this.api.get<NuxeoDocumentList>(
      '/nuxeo/api/v1/search/pp/default_content_collection/execute',
      params,
      { properties: 'dublincore' },
    );
  }
}
