import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';

import { NuxeoDocumentList } from '../models/document.model';
import { NuxeoUser, NuxeoUserList, NuxeoGroup, NuxeoGroupList } from '../models/user.model';
import { NuxeoApiBase } from './nuxeo-api-base';

/** Nuxeo REST header to include group membership on group list/detail responses. */
const GROUP_MEMBERS_FETCH_HEADER = { 'fetch.group': 'memberUsers,memberGroups' } as const;

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

  /**
   * User search with paging (used by Administration). Uses `*` when the query is empty
   * so the server returns a broad list where supported.
   */
  searchUsersPaged(query: string, pageSize = 50, currentPageIndex = 0): Observable<NuxeoUserList> {
    const q = query.trim() || '*';
    const params = new HttpParams()
      .set('q', q)
      .set('pageSize', String(pageSize))
      .set('currentPageIndex', String(currentPageIndex));
    return this.api.get<NuxeoUserList>('/nuxeo/api/v1/user/search', params);
  }

  /** Search groups by partial name (for participant picker). */
  searchGroups(query: string): Observable<NuxeoGroup[]> {
    const params = new HttpParams().set('q', query);
    return this.api
      .get<NuxeoGroupList>('/nuxeo/api/v1/group/search', params)
      .pipe(map((res) => res.entries));
  }

  /**
   * Recently created users and groups, newest first (Nuxeo Web UI parity).
   * Uses audit-backed page provider `LATEST_CREATED_USERS_OR_GROUPS_PROVIDER`.
   */
  getRecentlyCreatedUsersAndGroups(
    pageSize = 50,
    currentPageIndex = 0,
  ): Observable<NuxeoDocumentList> {
    const params = new HttpParams()
      .set('pageSize', String(pageSize))
      .set('currentPageIndex', String(currentPageIndex));
    return this.api.get<NuxeoDocumentList>(
      '/nuxeo/api/v1/search/pp/LATEST_CREATED_USERS_OR_GROUPS_PROVIDER/execute',
      params,
      { properties: '*' },
    );
  }

  searchGroupsPaged(
    query: string,
    pageSize = 50,
    currentPageIndex = 0,
  ): Observable<NuxeoGroupList> {
    const q = query.trim() || '*';
    const params = new HttpParams()
      .set('q', q)
      .set('pageSize', String(pageSize))
      .set('currentPageIndex', String(currentPageIndex));
    return this.api.get<NuxeoGroupList>('/nuxeo/api/v1/group/search', params, {
      ...GROUP_MEMBERS_FETCH_HEADER,
    });
  }

  /** Get a specific user. */
  getUser(userId: string): Observable<NuxeoUser> {
    return this.api.get<NuxeoUser>(`/nuxeo/api/v1/user/${encodeURIComponent(userId)}`);
  }

  getGroup(groupId: string): Observable<NuxeoGroup> {
    return this.api.get<NuxeoGroup>(
      `/nuxeo/api/v1/group/${encodeURIComponent(groupId)}`,
      undefined,
      { ...GROUP_MEMBERS_FETCH_HEADER },
    );
  }

  createUser(input: {
    username: string;
    firstName: string;
    lastName: string;
    company?: string;
    email: string;
    password?: string;
    groups?: string[];
  }): Observable<NuxeoUser> {
    const password = input.password?.trim();
    if (password) {
      return this.createUserWithPassword({ ...input, password });
    }
    return this.inviteUser(input);
  }

  /** Immediate account creation with an admin-set password (Nuxeo Web UI parity). */
  private createUserWithPassword(input: {
    username: string;
    firstName: string;
    lastName: string;
    company?: string;
    email: string;
    password: string;
    groups?: string[];
  }): Observable<NuxeoUser> {
    return this.api.post<NuxeoUser>('/nuxeo/api/v1/user', {
      'entity-type': 'user',
      id: input.username,
      properties: {
        username: input.username,
        firstName: input.firstName,
        lastName: input.lastName,
        company: input.company ?? '',
        email: input.email,
        password: input.password,
        groups: input.groups ?? [],
      },
    });
  }

  /**
   * Invitation flow when no password is set — mirrors Nuxeo Web UI `User.Invite` with a
   * user entity input so the invitee receives an email to set their own password.
   */
  private inviteUser(input: {
    username: string;
    firstName: string;
    lastName: string;
    company?: string;
    email: string;
    groups?: string[];
  }): Observable<NuxeoUser> {
    return this.api
      .post<string>('/nuxeo/api/v1/automation/User.Invite', {
        input: {
          'entity-type': 'user',
          id: '',
          properties: {
            username: input.username,
            firstName: input.firstName,
            lastName: input.lastName,
            company: input.company ?? '',
            email: input.email,
            groups: input.groups ?? [],
          },
        },
        params: {},
        context: {},
      })
      .pipe(map(() => this.buildUserFromInput(input)));
  }

  private buildUserFromInput(input: {
    username: string;
    firstName: string;
    lastName: string;
    company?: string;
    email: string;
    groups?: string[];
  }): NuxeoUser {
    return {
      'entity-type': 'user',
      id: input.username,
      properties: {
        username: input.username,
        firstName: input.firstName,
        lastName: input.lastName,
        company: input.company ?? '',
        email: input.email,
        groups: input.groups ?? [],
      },
    };
  }

  updateUser(
    userId: string,
    updates: {
      firstName?: string;
      lastName?: string;
      company?: string;
      email?: string;
      password?: string;
      groups?: string[];
    },
  ): Observable<NuxeoUser> {
    return this.getUser(userId).pipe(
      switchMap((existing) => {
        const props = { ...existing.properties };
        if (updates.firstName !== undefined) props.firstName = updates.firstName;
        if (updates.lastName !== undefined) props.lastName = updates.lastName;
        if (updates.company !== undefined) props.company = updates.company;
        if (updates.email !== undefined) props.email = updates.email;
        if (updates.groups !== undefined) props.groups = updates.groups;
        if (updates.password !== undefined && updates.password.length > 0) {
          props.password = updates.password;
        }
        return this.api.put<NuxeoUser>(`/nuxeo/api/v1/user/${encodeURIComponent(userId)}`, {
          'entity-type': 'user',
          id: existing.id,
          properties: props,
        });
      }),
    );
  }

  deleteUser(userId: string): Observable<void> {
    return this.api
      .delete<unknown>(`/nuxeo/api/v1/user/${encodeURIComponent(userId)}`)
      .pipe(map(() => undefined));
  }

  createGroup(input: {
    groupname: string;
    grouplabel: string;
    memberUsers?: string[];
    memberGroups?: string[];
  }): Observable<NuxeoGroup> {
    return this.api.post<NuxeoGroup>('/nuxeo/api/v1/group', {
      'entity-type': 'group',
      groupname: input.groupname,
      grouplabel: input.grouplabel,
      memberUsers: input.memberUsers ?? [],
      memberGroups: input.memberGroups ?? [],
    });
  }

  updateGroup(
    groupname: string,
    updates: { grouplabel?: string; memberUsers?: string[]; memberGroups?: string[] },
  ): Observable<NuxeoGroup> {
    return this.getGroup(groupname).pipe(
      switchMap((existing) =>
        this.api.put<NuxeoGroup>(`/nuxeo/api/v1/group/${encodeURIComponent(groupname)}`, {
          'entity-type': 'group',
          groupname: existing.groupname,
          grouplabel: updates.grouplabel ?? existing.grouplabel,
          memberUsers: updates.memberUsers ?? existing.memberUsers ?? [],
          memberGroups: updates.memberGroups ?? existing.memberGroups ?? [],
        }),
      ),
    );
  }

  deleteGroup(groupname: string): Observable<void> {
    return this.api
      .delete<unknown>(`/nuxeo/api/v1/group/${encodeURIComponent(groupname)}`)
      .pipe(map(() => undefined));
  }
}
