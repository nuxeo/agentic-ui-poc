import { canManageDocumentPermissions, resolveAcePrincipal, } from '@nuxeo/satori-platform/nuxeo-client';
/**
 * The grants the external review asked for (NXSAT-300): Nuxeo's twelve permission levels and the
 * retention pair. Offered after the server's own suggestions for the document type, and checked
 * against the permissions the server defines whenever the read can establish that set.
 */
export const NXS_STANDARD_PERMISSIONS = [
    'Read',
    'ReadWrite',
    'Everything',
    'Write',
    'ReadVersion',
    'WriteVersion',
    'AddChildren',
    'RemoveChildren',
    'Remove',
    'Version',
    'WriteSecurity',
    'Unlock',
    'SetRetention',
    'UnsetRetention',
];
/** Nuxeo's pseudo-principal for "everyone", which the inheritance-blocking deny names. */
const EVERYONE = 'Everyone';
/** The inheritance marker: Nuxeo blocks inheritance with a deny-`Everything` ACE for `Everyone`. */
export function isInheritanceMarker(ace) {
    return ace.principal === EVERYONE && ace.permission === 'Everything' && !ace.granted;
}
/** The ACE list of one named ACL. The enricher sends `aces`; the `@acl` adapter sends `ace`. */
function acesOf(acl) {
    return acl.aces ?? acl.ace ?? [];
}
function toRow(ace, acl) {
    const status = ace.status;
    return {
        id: typeof ace.id === 'string' ? ace.id : '',
        principal: resolveAcePrincipal(ace.username),
        principalLabel: typeof ace.usernameLabel === 'string' ? ace.usernameLabel : '',
        permission: typeof ace.permission === 'string' ? ace.permission : '',
        granted: ace.granted !== false,
        begin: ace.begin ?? null,
        end: ace.end ?? null,
        status: status === 'effective' || status === 'pending' || status === 'archived' ? status : null,
        creator: ace.creator ? resolveAcePrincipal(ace.creator) || null : null,
        acl,
    };
}
function strings(value) {
    return Array.isArray(value) ? value.filter((v) => typeof v === 'string' && !!v) : [];
}
function unique(values) {
    return [...new Set(values)];
}
/** Builds the offered permissions from the two server lists. See {@link NxsPermissionCatalogue}. */
export function permissionCatalogue(doc) {
    const held = unique(strings(doc.contextParameters?.['permissions']));
    const defined = held.includes('Everything') ? held : null;
    const isDefined = (p) => defined === null || defined.includes(p);
    const suggested = unique(strings(doc.contextParameters?.['userVisiblePermissions'])).filter(isDefined);
    const standard = NXS_STANDARD_PERMISSIONS.filter((p) => !suggested.includes(p) && isDefined(p));
    const other = held
        .filter((p) => !suggested.includes(p) && !standard.includes(p))
        .sort((a, b) => a.localeCompare(b));
    return { suggested, standard, other, defined };
}
/**
 * Reads a document fetched with the `acls`, `permissions` and `userVisiblePermissions` enrichers.
 *
 * Throws when the `acls` context parameter is absent: a read without the enricher cannot know the
 * ACL, and rendering an empty one would tell the user the document has no permissions.
 */
export function readSnapshot(doc) {
    const acls = doc.contextParameters?.['acls'];
    if (!Array.isArray(acls)) {
        throw new Error(`The read of ${doc.uid} carried no ACLs`);
    }
    const local = [];
    const inherited = [];
    const otherAcls = [];
    let inheritanceBlocked = false;
    for (const acl of acls) {
        const name = acl?.name ?? '';
        for (const ace of acesOf(acl ?? {})) {
            // External sharing is listed by the host tab, from every ACL.
            if (ace.externalUser)
                continue;
            const row = toRow(ace, name);
            if (name === 'local') {
                // Blocked inheritance is not a flag in Nuxeo: it is this deny, which
                // `Document.BlockPermissionInheritance` writes and `Unblock…` removes. A document with no
                // `inherited` ACL is not necessarily blocked — the repository root has none.
                if (isInheritanceMarker(row))
                    inheritanceBlocked = true;
                else
                    local.push(row);
            }
            else if (name === 'inherited') {
                inherited.push(row);
            }
            else {
                otherAcls.push(row);
            }
        }
    }
    return {
        uid: doc.uid,
        title: doc.title ?? '',
        // A version's `permissions` enricher repeats the live document's while the server refuses to
        // modify it, so the enricher alone would offer editing on every version.
        canManage: doc.isVersion !== true && canManageDocumentPermissions(doc),
        local,
        inherited,
        otherAcls,
        inheritanceBlocked,
        catalogue: permissionCatalogue(doc),
    };
}
/** `[...suggested, ...standard, ...other]`, plus `current` when the catalogue does not hold it. */
export function offeredPermissions(catalogue, current) {
    const all = [...catalogue.suggested, ...catalogue.standard, ...catalogue.other];
    return current && !all.includes(current) ? [...all, current] : all;
}
function invalidTimeFrame(begin, end) {
    return !!begin && !!end && begin > end;
}
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
export function refusalsFor(fresh, changes) {
    const refusals = [];
    const present = new Set(fresh.local.map((row) => row.id).filter(Boolean));
    const defined = fresh.catalogue.defined;
    const refuse = (principal, permission, reason) => refusals.push({ principal, permission, reason });
    for (const change of changes) {
        if (change.kind === 'add') {
            if (!change.principal.trim())
                refuse('', change.permission, 'no-principal');
            else if (defined && !defined.includes(change.permission)) {
                refuse(change.principal, change.permission, 'undefined-permission');
            }
            else if (invalidTimeFrame(change.begin, change.end)) {
                refuse(change.principal, change.permission, 'invalid-time-frame');
            }
            continue;
        }
        const { target } = change;
        if (!target.id)
            refuse(target.principal, target.permission, 'no-id');
        else if (!target.principal)
            refuse('', target.permission, 'no-principal');
        else if (!present.has(target.id)) {
            refuse(target.principal, target.permission, 'changed-on-server');
        }
        else if (change.kind === 'replace') {
            if (!target.granted)
                refuse(target.principal, target.permission, 'deny-entry');
            else if (defined && !defined.includes(change.permission)) {
                refuse(target.principal, change.permission, 'undefined-permission');
            }
            else if (invalidTimeFrame(change.begin, change.end)) {
                refuse(target.principal, change.permission, 'invalid-time-frame');
            }
        }
    }
    return refusals;
}
/**
 * Whether an ACE date and a calendar day name the same day, by the reading the table shows.
 *
 * Nuxeo stores the day as midnight in the server's zone, so a server east or west of UTC returns
 * an instant hours either side of UTC midnight, and comparing the ISO prefix would call a correctly
 * applied change unconfirmed on such a server. A tolerance either side would confirm a change to
 * the next day that the table still shows as the old one.
 */
function sameDay(instant, day) {
    if (!instant || !day)
        return !instant && !day;
    return instantToDay(instant) === day;
}
function holds(rows, principal, permission, begin, end) {
    return rows.some((row) => row.granted &&
        row.principal === principal &&
        row.permission === permission &&
        sameDay(row.begin, begin) &&
        sameDay(row.end, end));
}
/**
 * The applied changes the server's ACL does not show, read after the save.
 *
 * The postflight half of the guarantee: a 200 from Nuxeo is not evidence of a change, because an
 * unknown ACE id is answered with 200 and nothing done.
 */
export function unconfirmedChanges(after, applied) {
    const ids = new Set(after.local.map((row) => row.id));
    const missing = [];
    for (const change of applied) {
        const confirmed = change.kind === 'add'
            ? holds(after.local, change.principal, change.permission, change.begin, change.end)
            : change.kind === 'remove'
                ? !ids.has(change.target.id)
                : !ids.has(change.target.id) &&
                    holds(after.local, change.target.principal, change.permission, change.begin, change.end);
        if (!confirmed) {
            const principal = change.kind === 'add' ? change.principal : change.target.principal;
            const permission = change.kind === 'remove' ? change.target.permission : change.permission;
            missing.push({ principal, permission, reason: 'not-applied' });
        }
    }
    return missing;
}
/** A calendar day, `YYYY-MM-DD`, from a date the user picked in their own zone. */
export function toDay(date) {
    if (!date || Number.isNaN(date.getTime()))
        return null;
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${m}-${d}`;
}
const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;
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
export function dayToDate(instant) {
    if (!instant)
        return null;
    const parsed = Date.parse(instant);
    if (Number.isNaN(parsed))
        return null;
    const wallClock = parsed - new Date(parsed).getTimezoneOffset() * MINUTE;
    const day = new Date(wallClock % DAY === 0 ? wallClock : parsed + DAY / 2);
    return new Date(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate());
}
/** `instant` as a calendar day, the inverse of {@link dayToDate} for an unchanged date. */
export function instantToDay(instant) {
    return toDay(dayToDate(instant));
}
/**
 * The value to write for an ACE date the user may not have changed: the server's own instant when
 * `day` is still the day it names, otherwise `day`.
 *
 * Writing the day back instead re-anchors it at the server's midnight, which for an entry written
 * from another zone moves it — measured, a CET entry's start moved 23 hours on a permission-only edit.
 */
export function dateToWrite(day, original) {
    return day && original && instantToDay(original) === day ? original : day;
}
//# sourceMappingURL=permissions-model.js.map