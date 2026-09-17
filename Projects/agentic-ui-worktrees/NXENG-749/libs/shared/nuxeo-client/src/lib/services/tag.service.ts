import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { NuxeoApiBase } from './nuxeo-api-base';

export interface TagEntry {
  label: string;
}

@Injectable({ providedIn: 'root' })
export class TagService {
  private readonly api = inject(NuxeoApiBase);
  private readonly http = inject(HttpClient);

  addTag(uid: string, label: string): Observable<unknown> {
    return this.api.post(`/nuxeo/api/v1/id/${uid}/@op/Services.TagDocument`, {
      params: { tags: label },
      context: {},
    });
  }

  removeTag(uid: string, label: string): Observable<unknown> {
    return this.api.post(`/nuxeo/api/v1/id/${uid}/@op/Services.UntagDocument`, {
      params: { tags: label },
      context: {},
    });
  }

  searchTags(term: string): Observable<string[]> {
    const params = new HttpParams().set('pageSize', '20').set('currentPageIndex', '0');
    return this.http
      .get<{
        entries: Array<{ properties: { label: string } }>;
      }>(this.api.apiUrl('/nuxeo/api/v1/directory/label_tag_entry'), { params })
      .pipe(
        map((res) =>
          res.entries
            .map((e) => e.properties.label)
            .filter((l) => l.toLowerCase().includes(term.toLowerCase())),
        ),
      );
  }
}
