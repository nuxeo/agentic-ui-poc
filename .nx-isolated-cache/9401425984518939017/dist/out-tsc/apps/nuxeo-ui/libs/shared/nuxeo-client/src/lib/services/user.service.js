import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, switchMap } from 'rxjs';
import { NuxeoApiBase } from './nuxeo-api-base';
import * as i0 from "@angular/core";
/** Nuxeo REST header to include group membership on group list/detail responses. */
const GROUP_MEMBERS_FETCH_HEADER = { 'fetch.group': 'memberUsers,memberGroups' };
export class UserService {
    api = inject(NuxeoApiBase);
    /** Search users by partial name/username (for participant picker). */
    searchUsers(query) {
        const params = new HttpParams().set('q', query);
        return this.api
            .get('/nuxeo/api/v1/user/search', params)
            .pipe(map((res) => res.entries));
    }
    /**
     * User search with paging (used by Administration). Uses `*` when the query is empty
     * so the server returns a broad list where supported.
     */
    searchUsersPaged(query, pageSize = 50, currentPageIndex = 0) {
        const q = query.trim() || '*';
        const params = new HttpParams()
            .set('q', q)
            .set('pageSize', String(pageSize))
            .set('currentPageIndex', String(currentPageIndex));
        return this.api.get('/nuxeo/api/v1/user/search', params);
    }
    /** Search groups by partial name (for participant picker). */
    searchGroups(query) {
        const params = new HttpParams().set('q', query);
        return this.api
            .get('/nuxeo/api/v1/group/search', params)
            .pipe(map((res) => res.entries));
    }
    /**
     * Recently created users and groups, newest first (Nuxeo Web UI parity).
     * Uses audit-backed page provider `LATEST_CREATED_USERS_OR_GROUPS_PROVIDER`.
     */
    getRecentlyCreatedUsersAndGroups(pageSize = 50, currentPageIndex = 0) {
        const params = new HttpParams()
            .set('pageSize', String(pageSize))
            .set('currentPageIndex', String(currentPageIndex));
        return this.api.get('/nuxeo/api/v1/search/pp/LATEST_CREATED_USERS_OR_GROUPS_PROVIDER/execute', params, { properties: '*' });
    }
    searchGroupsPaged(query, pageSize = 50, currentPageIndex = 0) {
        const q = query.trim() || '*';
        const params = new HttpParams()
            .set('q', q)
            .set('pageSize', String(pageSize))
            .set('currentPageIndex', String(currentPageIndex));
        return this.api.get('/nuxeo/api/v1/group/search', params, {
            ...GROUP_MEMBERS_FETCH_HEADER,
        });
    }
    /** Get a specific user. */
    getUser(userId) {
        return this.api.get(`/nuxeo/api/v1/user/${encodeURIComponent(userId)}`);
    }
    getGroup(groupId) {
        return this.api.get(`/nuxeo/api/v1/group/${encodeURIComponent(groupId)}`, undefined, { ...GROUP_MEMBERS_FETCH_HEADER });
    }
    createUser(input) {
        const password = input.password?.trim();
        if (password) {
            return this.createUserWithPassword({ ...input, password });
        }
        return this.inviteUser(input);
    }
    /** Immediate account creation with an admin-set password (Nuxeo Web UI parity). */
    createUserWithPassword(input) {
        return this.api.post('/nuxeo/api/v1/user', {
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
    inviteUser(input) {
        return this.api
            .post('/nuxeo/api/v1/automation/User.Invite', {
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
    buildUserFromInput(input) {
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
    updateUser(userId, updates) {
        return this.getUser(userId).pipe(switchMap((existing) => {
            const props = { ...existing.properties };
            if (updates.firstName !== undefined)
                props.firstName = updates.firstName;
            if (updates.lastName !== undefined)
                props.lastName = updates.lastName;
            if (updates.company !== undefined)
                props.company = updates.company;
            if (updates.email !== undefined)
                props.email = updates.email;
            if (updates.groups !== undefined)
                props.groups = updates.groups;
            if (updates.password !== undefined && updates.password.length > 0) {
                props.password = updates.password;
            }
            return this.api.put(`/nuxeo/api/v1/user/${encodeURIComponent(userId)}`, {
                'entity-type': 'user',
                id: existing.id,
                properties: props,
            });
        }));
    }
    deleteUser(userId) {
        return this.api
            .delete(`/nuxeo/api/v1/user/${encodeURIComponent(userId)}`)
            .pipe(map(() => undefined));
    }
    createGroup(input) {
        return this.api.post('/nuxeo/api/v1/group', {
            'entity-type': 'group',
            groupname: input.groupname,
            grouplabel: input.grouplabel,
            memberUsers: input.memberUsers ?? [],
            memberGroups: input.memberGroups ?? [],
        });
    }
    updateGroup(groupname, updates) {
        return this.getGroup(groupname).pipe(switchMap((existing) => this.api.put(`/nuxeo/api/v1/group/${encodeURIComponent(groupname)}`, {
            'entity-type': 'group',
            groupname: existing.groupname,
            grouplabel: updates.grouplabel ?? existing.grouplabel,
            memberUsers: updates.memberUsers ?? existing.memberUsers ?? [],
            memberGroups: updates.memberGroups ?? existing.memberGroups ?? [],
        })));
    }
    deleteGroup(groupname) {
        return this.api
            .delete(`/nuxeo/api/v1/group/${encodeURIComponent(groupname)}`)
            .pipe(map(() => undefined));
    }
    static ɵfac = function UserService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || UserService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: UserService, factory: UserService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(UserService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
