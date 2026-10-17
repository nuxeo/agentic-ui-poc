import { Observable } from 'rxjs';
import { NuxeoDocumentList } from '../models/document.model';
import { NuxeoUser, NuxeoUserList, NuxeoGroup, NuxeoGroupList } from '../models/user.model';
import * as i0 from "@angular/core";
export declare class UserService {
    private readonly api;
    /** Search users by partial name/username (for participant picker). */
    searchUsers(query: string): Observable<NuxeoUser[]>;
    /**
     * User search with paging (used by Administration). Uses `*` when the query is empty
     * so the server returns a broad list where supported.
     */
    searchUsersPaged(query: string, pageSize?: number, currentPageIndex?: number): Observable<NuxeoUserList>;
    /** Search groups by partial name (for participant picker). */
    searchGroups(query: string): Observable<NuxeoGroup[]>;
    /**
     * Recently created users and groups, newest first (Nuxeo Web UI parity).
     * Uses audit-backed page provider `LATEST_CREATED_USERS_OR_GROUPS_PROVIDER`.
     */
    getRecentlyCreatedUsersAndGroups(pageSize?: number, currentPageIndex?: number): Observable<NuxeoDocumentList>;
    searchGroupsPaged(query: string, pageSize?: number, currentPageIndex?: number): Observable<NuxeoGroupList>;
    /** Get a specific user. */
    getUser(userId: string): Observable<NuxeoUser>;
    getGroup(groupId: string): Observable<NuxeoGroup>;
    createUser(input: {
        username: string;
        firstName: string;
        lastName: string;
        company?: string;
        email: string;
        password?: string;
        groups?: string[];
    }): Observable<NuxeoUser>;
    /** Immediate account creation with an admin-set password (Nuxeo Web UI parity). */
    private createUserWithPassword;
    /**
     * Invitation flow when no password is set — mirrors Nuxeo Web UI `User.Invite` with a
     * user entity input so the invitee receives an email to set their own password.
     */
    private inviteUser;
    private buildUserFromInput;
    updateUser(userId: string, updates: {
        firstName?: string;
        lastName?: string;
        company?: string;
        email?: string;
        password?: string;
        groups?: string[];
    }): Observable<NuxeoUser>;
    deleteUser(userId: string): Observable<void>;
    createGroup(input: {
        groupname: string;
        grouplabel: string;
        memberUsers?: string[];
        memberGroups?: string[];
    }): Observable<NuxeoGroup>;
    updateGroup(groupname: string, updates: {
        grouplabel?: string;
        memberUsers?: string[];
        memberGroups?: string[];
    }): Observable<NuxeoGroup>;
    deleteGroup(groupname: string): Observable<void>;
    static ɵfac: i0.ɵɵFactoryDeclaration<UserService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<UserService>;
}
//# sourceMappingURL=user.service.d.ts.map