import { Injectable, inject } from '@angular/core';
import { catchError, concatMap, from, map, of, switchMap, toArray } from 'rxjs';
import { DocumentDetailService, } from '@nuxeo/satori-platform/nuxeo-client';
import { dateToWrite, readSnapshot, refusalsFor, unconfirmedChanges, } from './permissions-model';
import * as i0 from "@angular/core";
/**
 * Reads and writes one document's local ACL for `nxs-permissions-panel`, one ACE at a time.
 *
 * Provided by the panel, not by root, so each panel owns its instance. Every call goes through
 * `DocumentDetailService`, which carries authentication through the interceptor.
 */
export class NxsPermissionsService {
    documents = inject(DocumentDetailService);
    load(uid) {
        return this.documents
            .getDocumentPermissions(uid)
            .pipe(map((doc) => readSnapshot(doc)));
    }
    /**
     * Writes `changes`, refusing the whole batch first if any of them cannot be written faithfully.
     *
     * The ACL is read again before the first write rather than trusted from the panel's view, so a
     * target someone else changed meanwhile is refused instead of silently skipped by Nuxeo; if that
     * read fails, nothing is sent. Writes run in order and stop at the first server refusal. The ACL
     * is re-read afterwards, both to show the user what the server now holds and to confirm each
     * write actually took.
     */
    save(uid, changes) {
        return this.load(uid).pipe(map((fresh) => ({ fresh, error: null })), catchError((error) => of({ fresh: null, error })), switchMap(({ fresh, error }) => {
            if (!fresh)
                return of({ kind: 'unread', error });
            const refusals = refusalsFor(fresh, changes);
            if (refusals.length > 0) {
                return of({ kind: 'refused', refusals, snapshot: fresh });
            }
            return this.apply(uid, changes);
        }));
    }
    /**
     * Blocks or unblocks inheritance, then re-reads. Emits `null` when the write succeeded and only
     * the re-read failed, so a caller does not report a change that happened as one that did not.
     */
    setInheritanceBlocked(uid, blocked) {
        const write = blocked
            ? this.documents.blockPermissionInheritance(uid)
            : this.documents.unblockPermissionInheritance(uid);
        return write.pipe(switchMap(() => this.load(uid).pipe(catchError(() => of(null)))));
    }
    searchPrincipals(term) {
        return this.documents.searchUsersGroups(term);
    }
    apply(uid, changes) {
        let applied = 0;
        return from(changes).pipe(concatMap((change) => this.write(uid, change).pipe(map(() => {
            applied += 1;
            return change;
        }), catchError((error) => {
            throw new WriteFailure(change, error);
        }))), toArray(), switchMap(() => this.load(uid).pipe(map((after) => ({ after, error: null })), catchError((error) => of({ after: null, error })))), map(({ after, error }) => {
            if (!after)
                return { kind: 'unverified', count: changes.length, error };
            const missing = unconfirmedChanges(after, changes);
            return missing.length > 0
                ? { kind: 'unconfirmed', refusals: missing, snapshot: after }
                : { kind: 'saved', count: changes.length, snapshot: after };
        }), catchError((caught) => {
            if (!(caught instanceof WriteFailure))
                throw caught;
            // Re-read so the table shows what the server holds after a partial save. A failed re-read
            // is reported as an unknown state rather than masking the write failure that caused it.
            return this.load(uid).pipe(catchError(() => of(null)), map((snapshot) => {
                const unconfirmed = snapshot
                    ? unconfirmedChanges(snapshot, changes.slice(0, applied))
                    : [];
                return {
                    kind: 'failed',
                    applied: applied - unconfirmed.length,
                    unconfirmed,
                    total: changes.length,
                    change: caught.change,
                    error: caught.cause,
                    snapshot,
                };
            }));
        }));
    }
    write(uid, change) {
        switch (change.kind) {
            case 'add':
                return this.documents.addPermission(uid, {
                    username: change.principal,
                    permission: change.permission,
                    begin: change.begin,
                    end: change.end,
                    notify: false,
                });
            case 'replace':
                return this.documents.replacePermission(uid, {
                    id: change.target.id,
                    username: change.target.principal,
                    permission: change.permission,
                    begin: dateToWrite(change.begin, change.target.begin),
                    end: dateToWrite(change.end, change.target.end),
                    notify: false,
                });
            case 'remove':
                return this.documents.removePermissionById(uid, change.target.id);
        }
    }
    static ɵfac = function NxsPermissionsService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsPermissionsService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: NxsPermissionsService, factory: NxsPermissionsService.ɵfac });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsPermissionsService, [{
        type: Injectable
    }], null, null); })();
/** A write the server rejected, carrying the change so the outcome can name it. */
class WriteFailure extends Error {
    change;
    cause;
    constructor(change, cause) {
        super('A permission write was rejected');
        this.change = change;
        this.cause = cause;
    }
}
