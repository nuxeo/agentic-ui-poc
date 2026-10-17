import { type NuxeoDocument } from '@nuxeo/satori-platform/nuxeo-client';
/**
 * The grants the external review asked for (NXSAT-300): Nuxeo's twelve permission levels and the
 * retention pair. Offered after the server's own suggestions for the document type, and checked
 * against the permissions the server defines whenever the read can establish that set.
 */
export declare const NXS_STANDARD_PERMISSIONS: readonly string[];
export type NxsAceStatus = 'effective' | 'pending' | 'archived';
/** One ACE as the panel renders it. */
export interface NxsAceRow {
    /** Nuxeo's ACE id, `user:permission:granted:creator:begin:end`; empty when the server sent none. */
    readonly id: string;
    readonly principal: string;
    /** The principal's display name — a user's full name, a group's label — or empty. */
    readonly principalLabel: string;
    readonly permission: string;
    readonly granted: boolean;
    readonly begin: string | null;
    readonly end: string | null;
    readonly status: NxsAceStatus | null;
    readonly creator: string | null;
    /** The named ACL the entry belongs to — `local`, `inherited`, or one a workflow added. */
    readonly acl: string;
}
/**
 * The permissions the panel can offer, in the order it offers them.
 *
 * Nuxeo exposes two lists and neither is enough alone. `userVisiblePermissions` is the server's
 * curated list for the document type (the `permissionsVisibility` extension point): only `Read`,
 * `ReadWrite` and `Everything` on a stock workspace, plus `CanAskForPublishing` on a section root.
 * The `permissions` enricher lists every permission the server defines **that the caller holds**,
 * so it is the complete set only when the caller holds `Everything` — measured on 2025.26.16: 33
 * of 33 for an `Everything` holder, 9 for a manager holding only `WriteSecurity`.
 */
export interface NxsPermissionCatalogue {
    /** The server's suggestions for this document type, in its order. */
    readonly suggested: readonly string[];
    /** {@link NXS_STANDARD_PERMISSIONS} not already suggested, less any the server lacks. */
    readonly standard: readonly string[];
    /** Every other permission the `permissions` enricher reported, by name. */
    readonly other: readonly string[];
    /** Every permission the server defines, or `null` when the caller's read cannot tell. */
    readonly defined: readonly string[] | null;
}
/** What the panel shows for one document. */
export interface NxsPermissionsSnapshot {
    readonly uid: string;
    readonly title: string;
    readonly canManage: boolean;
    /**
     * The local ACL, less the inheritance marker (shown as {@link inheritanceBlocked}) and less
     * entries for external users, whose sharing flow the host owns.
     */
    readonly local: readonly NxsAceRow[];
    readonly inherited: readonly NxsAceRow[];
    /** Entries from named ACLs other than `local` and `inherited`. Read-only here. */
    readonly otherAcls: readonly NxsAceRow[];
    readonly inheritanceBlocked: boolean;
    readonly catalogue: NxsPermissionCatalogue;
}
/**
 * A change the user has staged. Dates are calendar days, `YYYY-MM-DD`; a replacement writes an
 * unchanged day as its target's original instant (see {@link dateToWrite}).
 */
export type NxsPermissionChange = {
    readonly kind: 'add';
    readonly key: string;
    readonly principal: string;
    readonly permission: string;
    readonly begin: string | null;
    readonly end: string | null;
} | {
    readonly kind: 'replace';
    readonly target: NxsAceRow;
    readonly permission: string;
    readonly begin: string | null;
    readonly end: string | null;
} | {
    readonly kind: 'remove';
    readonly target: NxsAceRow;
};
export type NxsRefusalReason = 'changed-on-server' | 'deny-entry' | 'no-id' | 'no-principal' | 'undefined-permission' | 'invalid-time-frame' | 'not-applied';
/** An entry the panel will not write, or that the server did not apply, and why. */
export interface NxsPermissionRefusal {
    readonly principal: string;
    readonly permission: string;
    readonly reason: NxsRefusalReason;
}
/** The inheritance marker: Nuxeo blocks inheritance with a deny-`Everything` ACE for `Everyone`. */
export declare function isInheritanceMarker(ace: Pick<NxsAceRow, 'principal' | 'permission' | 'granted'>): boolean;
/** Builds the offered permissions from the two server lists. See {@link NxsPermissionCatalogue}. */
export declare function permissionCatalogue(doc: NuxeoDocument): NxsPermissionCatalogue;
/**
 * Reads a document fetched with the `acls`, `permissions` and `userVisiblePermissions` enrichers.
 *
 * Throws when the `acls` context parameter is absent: a read without the enricher cannot know the
 * ACL, and rendering an empty one would tell the user the document has no permissions.
 */
export declare function readSnapshot(doc: NuxeoDocument): NxsPermissionsSnapshot;
/** `[...suggested, ...standard, ...other]`, plus `current` when the catalogue does not hold it. */
export declare function offeredPermissions(catalogue: NxsPermissionCatalogue, current?: string): string[];
/**
 * The staged changes the panel must not write, read against a **fresh** snapshot.
 *
 * Each change addresses one ACE, so an entry the user did not touch is never written and cannot
 * be lost. What remains to refuse is a change that cannot be written faithfully:
 *
 * - `changed-on-server`: its target is no longer in the ACL. Nuxeo answers 200 and changes nothing
 *   for an unknown id, so without this check a save over a stale view reported success.
 * - `deny-entry`: `Document.ReplacePermission` writes a grant, so editing a deny would invert it.
 * - `no-id`, `no-principal`: nothing Nuxeo could address.
 * - `undefined-permission`: a permission this server does not define, known only when the
 *   catalogue is complete; otherwise the server's own 400 decides.
 * - `invalid-time-frame`: an end before its beginning.
 *
 * Refusing is all-or-nothing on purpose: a half-applied batch is harder to reason about than one
 * that did not start.
 */
export declare function refusalsFor(fresh: NxsPermissionsSnapshot, changes: readonly NxsPermissionChange[]): NxsPermissionRefusal[];
/**
 * The applied changes the server's ACL does not show, read after the save.
 *
 * The postflight half of the guarantee: a 200 from Nuxeo is not evidence of a change, because an
 * unknown ACE id is answered with 200 and nothing done.
 */
export declare function unconfirmedChanges(after: NxsPermissionsSnapshot, applied: readonly NxsPermissionChange[]): NxsPermissionRefusal[];
/** A calendar day, `YYYY-MM-DD`, from a date the user picked in their own zone. */
export declare function toDay(date: Date | null): string | null;
/**
 * The calendar day an ACE date names, as a local `Date` for a date picker.
 *
 * An ACE date is midnight in some zone — the browser's when Nuxeo Web UI wrote it, the server's for
 * a day-only write — and Nuxeo returns it in UTC, so a CET midnight reads as 23:00 the day before.
 * The zone is not stored. An instant at midnight in the user's own zone is read as that day, which
 * recovers every entry written from the user's zone, UTC+13 and UTC+14 included. Any other is
 * rounded to the nearest UTC midnight, which recovers the day for a writer anywhere from UTC−11 to
 * UTC+12. Reading the UTC date alone gives the day before east of UTC; `new Date(iso)` alone would
 * be wrong west of UTC instead. Two zones 24 hours apart share their midnights, so between them the
 * day is genuinely ambiguous and the user's own is chosen.
 */
export declare function dayToDate(instant: string | null): Date | null;
/** `instant` as a calendar day, the inverse of {@link dayToDate} for an unchanged date. */
export declare function instantToDay(instant: string | null): string | null;
/**
 * The value to write for an ACE date the user may not have changed: the server's own instant when
 * `day` is still the day it names, otherwise `day`.
 *
 * Writing the day back instead re-anchors it at the server's midnight, which for an entry written
 * from another zone moves it — measured, a CET entry's start moved 23 hours on a permission-only edit.
 */
export declare function dateToWrite(day: string | null, original: string | null): string | null;
//# sourceMappingURL=permissions-model.d.ts.map