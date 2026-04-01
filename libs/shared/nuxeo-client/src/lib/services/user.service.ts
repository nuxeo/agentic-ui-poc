import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { NuxeoUser, NuxeoUserList, NuxeoGroup, NuxeoGroupList } from '../models/user.model';
import { NuxeoApiBase } from './nuxeo-api-base';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(NuxeoApiBase);

  /** Search users by partial name/username (for participant picker). */
  searchUsers(query: string): Observable<NuxeoUser[]> {
    const params = new HttpParams().set('q', query);
    return this.api
      .get<NuxeoUserList>('/nuxeo/api/v1/user/search', params)
      .pipe(map((res) => res.entries));
  }

  /** Search groups by partial name (for participant picker). */
  searchGroups(query: string): Observable<NuxeoGroup[]> {
    const params = new HttpParams().set('q', query);
    return this.api
      .get<NuxeoGroupList>('/nuxeo/api/v1/group/search', params)
      .pipe(map((res) => res.entries));
  }

  /** Get a specific user. */
  getUser(userId: string): Observable<NuxeoUser> {
    return this.api.get<NuxeoUser>(`/nuxeo/api/v1/user/${userId}`);
  }
}
