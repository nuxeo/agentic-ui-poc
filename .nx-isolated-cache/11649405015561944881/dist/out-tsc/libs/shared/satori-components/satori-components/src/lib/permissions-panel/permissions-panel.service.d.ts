import { Observable } from 'rxjs';
import { type UserGroupSuggestion } from '@nuxeo/satori-platform/nuxeo-client';
import { type NxsPermissionChange, type NxsPermissionRefusal, type NxsPermissionsSnapshot } from './permissions-model';
import * as i0 from "@angular/core";
/** How a save ended. Every outcome that could read it carries the server's ACL afterwards. */
export type NxsSaveOutcome = 
/** Nothing was written, because the read before the first write failed. */
{
    readonly kind: 'unread';
    readonly error: unknown;
}
/** Every change was written and the re-read shows each one. */
 | {
    readonly kind: 'saved';
    readonly count: number;
    readonly snapshot: NxsPermissionsSnapshot;
}
/** Nothing was written, because these changes cannot be written faithfully. */
 | {
    readonly kind: 'refused';
    readonly refusals: readonly NxsPermissionRefusal[];
    readonly snapshot: NxsPermissionsSnapshot;
}
/**
 * The server rejected a change. `applied` counts the earlier changes the re-read confirms, and
 * `unconfirmed` names those it answered 200 but does not show. With no re-read neither is known,
 * so `applied` counts the 200s and `unconfirmed` is empty.
 */
 | {
    readonly kind: 'failed';
    readonly applied: number;
    readonly unconfirmed: readonly NxsPermissionRefusal[];
    readonly total: number;
    readonly change: NxsPermissionChange;
    readonly error: unknown;
    readonly snapshot: NxsPermissionsSnapshot | null;
}
/** The server answered 200, but the re-read does not show these changes. */
 | {
    readonly kind: 'unconfirmed';
    readonly refusals: readonly NxsPermissionRefusal[];
    readonly snapshot: NxsPermissionsSnapshot;
}
/** Every write was answered, but the re-read failed, so nothing is confirmed either way. */
 | {
    readonly kind: 'unverified';
    readonly count: number;
    readonly error: unknown;
};
/**
 * Reads and writes one document's local ACL for `nxs-permissions-panel`, one ACE at a time.
 *
 * Provided by the panel, not by root, so each panel owns its instance. Every call goes through
 * `DocumentDetailService`, which carries authentication through the interceptor.
 */
export declare class NxsPermissionsService {
    private readonly documents;
    load(uid: string): Observable<NxsPermissionsSnapshot>;
    /**
     * Writes `changes`, refusing the whole batch first if any of them cannot be written faithfully.
     *
     * The ACL is read again before the first write rather than trusted from the panel's view, so a
     * target someone else changed meanwhile is refused instead of silently skipped by Nuxeo; if that
     * read fails, nothing is sent. Writes run in order and stop at the first server refusal. The ACL
     * is re-read afterwards, both to show the user what the server now holds and to confirm each
     * write actually took.
     */
    save(uid: string, changes: readonly NxsPermissionChange[]): Observable<NxsSaveOutcome>;
    /**
     * Blocks or unblocks inheritance, then re-reads. Emits `null` when the write succeeded and only
     * the re-read failed, so a caller does not report a change that happened as one that did not.
     */
    setInheritanceBlocked(uid: string, blocked: boolean): Observable<NxsPermissionsSnapshot | null>;
    searchPrincipals(term: string): Observable<UserGroupSuggestion[]>;
    private apply;
    private write;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsPermissionsService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NxsPermissionsService>;
}
//# sourceMappingURL=permissions-panel.service.d.ts.map