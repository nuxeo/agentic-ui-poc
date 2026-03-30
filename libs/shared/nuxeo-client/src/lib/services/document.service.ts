import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { NuxeoDocument, NuxeoDocumentList } from '../models/document.model';
import { RECENTLY_EDITED_QUERY, RECENTLY_VIEWED_QUERY } from '../queries/nxql-queries';
import { NuxeoApiBase } from './nuxeo-api-base';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly api = inject(NuxeoApiBase);

  getRecentlyEdited(pageSize = 10): Observable<NuxeoDocumentList> {
    return this.api.nxqlSearch(RECENTLY_EDITED_QUERY, pageSize);
  }

  getRecentlyViewed(userId: string, pageSize = 10): Observable<NuxeoDocumentList> {
    const query = RECENTLY_VIEWED_QUERY.replace(/\{user\}/g, userId);
    return this.api.nxqlSearch(query, pageSize);
  }

  getById(docId: string): Observable<NuxeoDocument> {
    return this.api.get<NuxeoDocument>(`/nuxeo/api/v1/id/${docId}`);
  }
}
