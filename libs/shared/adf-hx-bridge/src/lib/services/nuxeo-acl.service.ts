import { Injectable, inject } from '@angular/core';
import type { ACE } from '@hylandsoftware/hxcs-js-client';
import { Observable, combineLatest, map, of } from 'rxjs';

import type { NuxeoAce, NuxeoDocument } from '@nuxeo-satori/platform/nuxeo-client';

import { HX_PERMISSION_FROM_NUXEO } from '../mapping/nuxeo-to-hx-document.mapper';
import { NuxeoPrincipalResolver } from './nuxeo-principal-resolver.service';

/**
 * Nuxeo ACE status -> HxPR `Status`. Same three values, different casing.
 *
 * An unrecognised status maps to `undefined` rather than a default: Nuxeo's set is
 * `effective | pending | archived`, and inventing `EFFECTIVE` for something else would claim an ACE
 * is in force when it may not be.
 */
const HX_STATUS_FROM_NUXEO: Readonly<Record<string, string>> = {
  effective: 'EFFECTIVE',
  pending: 'PENDING',
  archived: 'ARCHIVED',
};

/**
 * Nuxeo's pseudo-principal for "everyone", and upstream's.
 *
 * Blocked inheritance is not a flag in either model: both express it as a **deny-everything ACE
 * for everyone** in the local ACL. Nuxeo writes `username: 'Everyone'`; upstream recognises it
 * only as `user.id === '__Everyone__'` (`isAclInheritanceBlocked`). Without the translation the
 * adopted panel reads inheritance as enabled on a document where Nuxeo has blocked it, and its
 * toggle then writes the opposite of what it shows.
 */
const NUXEO_EVERYONE = 'Everyone';
const HX_EVERYONE_USER_ID = '__Everyone__';

/**
 * The principal an HxPR ACE names, as Nuxeo spells it.
 *
 * `sys_acl` distinguishes `user` from `group`; Nuxeo's write operations take one `user` parameter
 * for both and resolve the name itself, so the distinction is dropped on the way out. Upstream also
 * emits `user` as a bare **string** for the inheritance marker it synthesises in
 * `updateDocumentAcl`, rather than as a `User`, so both shapes are read.
 */
function principalOf(ace: ACE): string | undefined {
  const user: unknown = ace.user;
  if (typeof user === 'string') return user;
  if (user && typeof user === 'object') {
    const { id, username } = user as { id?: string; username?: string };
    return username ?? id;
  }
  return ace.group?.id;
}

/** One Nuxeo local-ACL grant, in the shape `DocumentDetailService.addPermission` takes. */
export interface NuxeoAclGrant {
  principal: string;
  permission: string;
  begin?: string;
  end?: string;
  /**
   * Who granted this ACE, carried through the replay.
   *
   * Without it `DocumentDetailService.addPermission` defaults to the signed-in user, so a save
   * re-stamped every ACE on the document — including ones the saver never touched — with their own
   * name, in the field whose whole purpose is "Granted by". Upstream sends the original creator for
   * rows the user did not edit, so the information is available and was simply being discarded.
   */
  creator?: string;
}

/**
 * The only permissions upstream's permissions panel can represent.
 *
 * Upstream ranks a row against `levels = ['Read', 'ReadWrite', 'Everything']` and keeps it only if
 * it outranks the inherited permission. Anything else scores `indexOf` of `-1`, ties with the
 * inherited `-1`, and is **dropped from the ACL it writes back**. Nine of the twelve values
 * `HX_PERMISSION_FROM_NUXEO` produces are outside this set — `Write`, `ReadVersion`,
 * `WriteVersion`, `CreateChild`, `DeleteChild`, `Delete`, `CreateVersion`, `ManageSecurity`,
 * `ManageLock` — as is any Nuxeo permission we do not map at all.
 *
 * Combined with a clear-then-replay write, that silently deleted those ACEs and returned success.
 * `NuxeoDocumentApi.updateDocumentById` now refuses the write instead; see
 * {@link inexpressibleLocalAces}.
 */
export const HX_EXPRESSIBLE_PERMISSIONS: readonly string[] = ['Read', 'ReadWrite', 'Everything'];

/**
 * The raw Nuxeo ACEs of a document's `local` ACL, without directory resolution.
 *
 * `localAclFor` is the mapped, principal-resolved view the panel renders, and resolving costs one
 * request per unrecognised principal. The pre-write checks below need only the permission, the
 * principal name and the creator, all of which Nuxeo already sends, so they read the payload
 * directly rather than paying for lookups on a code path the user is waiting on.
 */
export function rawLocalAces(doc: NuxeoDocument): readonly NuxeoAce[] {
  const acls = doc.contextParameters?.['acls'];
  if (!Array.isArray(acls)) return [];
  return (acls as Array<{ name?: string; aces?: NuxeoAce[]; ace?: NuxeoAce[] }>)
    .filter((acl) => acl?.name === 'local')
    .flatMap((acl) => acl?.aces ?? acl?.ace ?? []);
}

/**
 * Local ACEs whose permission upstream cannot round-trip, as `principal: permission` strings.
 *
 * A precondition rather than a diff of desired-against-current, deliberately: a principal missing
 * from the desired ACL is equally consistent with the user having deleted it, so absence cannot be
 * read as loss. The permission *value* can — upstream could never have shown these faithfully, so
 * any save of this document drops them whatever the user did.
 *
 * Nuxeo's names are compared against the same set because the three expressible values map to
 * themselves; everything Nuxeo calls something else (`Write`, `AddChildren`, `WriteSecurity`, …)
 * is outside it either way.
 */
export function inexpressibleLocalAces(aces: readonly NuxeoAce[]): readonly string[] {
  const offending: string[] = [];
  for (const ace of aces) {
    // The inheritance marker is a deny, expressed through its own operation rather than as a
    // permission level, so it is not subject to the ranking filter.
    if (ace.granted === false) continue;
    const permission = ace.permission;
    if (!permission || HX_EXPRESSIBLE_PERMISSIONS.includes(permission)) continue;
    // Nuxeo carries a group in `username` too, so there is no separate field to fall back to.
    offending.push(`${ace.username || '(unreadable principal)'}: ${permission}`);
  }
  return offending;
}

/**
 * A document's current local ACL as the Nuxeo writes that would restore it.
 *
 * Used only as the compensator for a failed replay, so it is deliberately lossless about the three
 * things a restore needs — principal, permission and creator — and says nothing about the rest.
 */
export function restorableLocalAcl(aces: readonly NuxeoAce[]): NuxeoLocalAclWrite {
  const grants: NuxeoAclGrant[] = [];
  let blockInheritance = false;

  for (const ace of aces) {
    const principal = ace.username;
    if (!principal || !ace.permission) continue;

    if (ace.granted === false) {
      if (
        (principal === NUXEO_EVERYONE || principal === HX_EVERYONE_USER_ID) &&
        ace.permission === 'Everything'
      ) {
        blockInheritance = true;
      }
      continue;
    }

    grants.push({
      principal,
      permission: ace.permission,
      ...(ace.begin ? { begin: ace.begin } : {}),
      ...(ace.end ? { end: ace.end } : {}),
      ...(ace.creator ? { creator: ace.creator } : {}),
    });
  }

  return { grants, blockInheritance };
}

/** A whole desired local ACL, ready to be written by `NuxeoDocumentApi.updateDocumentById`. */
export interface NuxeoLocalAclWrite {
  grants: readonly NuxeoAclGrant[];
  blockInheritance: boolean;
}

const NUXEO_PERMISSION_FROM_HX: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(HX_PERMISSION_FROM_NUXEO).map(([nuxeo, hx]) => [hx, nuxeo]),
);

/**
 * An HxPR `sys_acl` as the Nuxeo writes that would produce it.
 *
 * Nuxeo has no "replace the ACL" call, so the caller clears the local ACL and replays these. The
 * two halves are separated because Nuxeo expresses them with different operations: grants through
 * `Document.AddPermission`, and the everyone/deny-everything marker through
 * `Document.BlockPermissionInheritance`, which writes that ACE itself.
 *
 * Denies other than the inheritance marker are **dropped**, because Nuxeo's `Document.AddPermission`
 * only grants and upstream's panel cannot express one. A `ReadWrite` deny arriving here would be
 * silently lost, so it is reported rather than guessed at — see `deniedPrincipals`.
 */
export function toNuxeoLocalAclWrite(aces: readonly ACE[]): NuxeoLocalAclWrite & {
  deniedPrincipals: readonly string[];
  unreadableAces: readonly string[];
} {
  const grants: NuxeoAclGrant[] = [];
  const deniedPrincipals: string[] = [];
  const unreadableAces: string[] = [];
  let blockInheritance = false;

  for (const ace of aces) {
    const principal = principalOf(ace);
    if (!principal || !ace.permission) {
      // Reported, not skipped, for the same reason as `deniedPrincipals` one branch below: the
      // caller clears the local ACL before replaying these, so an ACE dropped here is deleted
      // rather than merely not applied. The read path synthesises entries for principals since
      // removed from the directory, so shapes the writer cannot handle do arrive.
      unreadableAces.push(
        `${principal ?? '(no readable principal)'}: ${ace.permission ?? '(no permission)'}`,
      );
      continue;
    }

    if (ace.granted === false) {
      const isInheritanceMarker =
        (principal === HX_EVERYONE_USER_ID || principal === NUXEO_EVERYONE) &&
        ace.permission === 'Everything';
      if (isInheritanceMarker) {
        blockInheritance = true;
      } else {
        deniedPrincipals.push(principal);
      }
      continue;
    }

    grants.push({
      principal,
      permission: NUXEO_PERMISSION_FROM_HX[ace.permission] ?? ace.permission,
      ...(ace.begin ? { begin: ace.begin } : {}),
      ...(ace.end ? { end: ace.end } : {}),
      ...(ace.creator ? { creator: ace.creator } : {}),
    });
  }

  return { grants, blockInheritance, deniedPrincipals, unreadableAces };
}

/**
 * Maps between Nuxeo's ACLs and HxPR's `sys_acl` / `sys_effectiveAcl`.
 *
 * Separate from `nuxeo-to-hx-document.mapper.ts` because the read is **asynchronous and cannot be
 * otherwise**: Nuxeo's ACE names a principal without saying whether it is a user or a group, so each
 * distinct name needs a directory lookup. See `NuxeoPrincipalResolver`.
 *
 * ## What is deliberately lost
 *
 * Nuxeo groups ACEs into **named** ACLs — `local`, `inherited` — and HxPR has no field for the
 * names. The distinction survives as the pair of fields rather than as a label: `sys_acl` is the
 * `local` ACL and `sys_effectiveAcl` is every ACE in force. That is what upstream's permissions
 * panel reads, and it recovers local-versus-inherited from the difference.
 *
 * `id` is dropped — Nuxeo's composite ACE id (`Administrator:Everything:true:Administrator::`) has
 * no HxPR field and encodes information already present in the other columns.
 */
@Injectable()
export class NuxeoAclService {
  private readonly principals = inject(NuxeoPrincipalResolver);

  /**
   * Every ACE across every named Nuxeo ACL, flattened, with principals resolved.
   *
   * Returns `undefined` when the document carries no `acls` context parameter, for the same reason
   * `sys_effectivePermissions` does: a read that did not request the enricher cannot know the ACL,
   * and an empty array would assert that the document has none.
   */
  aclFor(doc: NuxeoDocument): Observable<ACE[] | undefined> {
    return this.acesFrom(doc);
  }

  /**
   * Only the ACEs Nuxeo holds on **this** document, which is HxPR's `sys_acl`.
   *
   * `aclFor` is `sys_effectiveAcl` — every ACE in force, local and inherited together. Upstream's
   * permissions panel needs both and uses the difference: it builds one row per principal from
   * `sys_effectiveAcl`, then calls an ACE local when it also appears in `sys_acl`. Given the
   * flattened set in both fields every ACE looks local, the inherited column empties, and saving
   * rewrites inherited grants as local ones.
   */
  localAclFor(doc: NuxeoDocument): Observable<ACE[] | undefined> {
    return this.acesFrom(doc, 'local');
  }

  /**
   * `undefined` when the document carries no `acls` context parameter, for the same reason
   * `sys_effectivePermissions` does: a read that did not request the enricher cannot know the ACL,
   * and an empty array would assert that the document has none.
   */
  private acesFrom(doc: NuxeoDocument, name?: string): Observable<ACE[] | undefined> {
    const acls = doc.contextParameters?.['acls'];
    if (!Array.isArray(acls)) {
      return of(undefined);
    }

    const aces = (acls as Array<{ name?: string; aces?: NuxeoAce[]; ace?: NuxeoAce[] }>)
      .filter((acl) => name === undefined || acl?.name === name)
      .flatMap(
        (acl) =>
          // Nuxeo's own payload uses `aces`; the `@acl` adapter uses `ace`. Both are accepted
          // because both appear on this instance depending on which endpoint answered.
          acl?.aces ?? acl?.ace ?? [],
      );
    if (aces.length === 0) {
      return of([]);
    }

    return combineLatest(aces.map((ace) => this.toHxAce(ace)));
  }

  private toHxAce(ace: NuxeoAce): Observable<ACE> {
    const base: ACE = {
      permission: HX_PERMISSION_FROM_NUXEO[ace.permission] ?? ace.permission,
      granted: ace.granted,
      // `?? undefined` rather than keeping `null`: HxPR's fields are optional, and `null` would be
      // rendered as a value by anything that only checks for presence.
      creator: ace.creator ?? undefined,
      begin: ace.begin ?? undefined,
      end: ace.end ?? undefined,
      status: HX_STATUS_FROM_NUXEO[ace.status] as ACE['status'],
    };

    if (ace.username === NUXEO_EVERYONE) {
      // Not a directory entry, so there is nothing to resolve — and resolving it would answer
      // `Everyone`, which upstream does not recognise as the inheritance marker.
      return of({ ...base, user: { id: HX_EVERYONE_USER_ID, username: NUXEO_EVERYONE } });
    }

    return this.principals.resolve(ace.username).pipe(
      map((principal) => {
        if (principal.kind === 'group') {
          return { ...base, group: principal.group };
        }
        if (principal.kind === 'user') {
          return { ...base, user: principal.user };
        }
        // Neither a user nor a group — a principal deleted from the directory since the ACE was
        // written. Kept as a user carrying only the name, because dropping the ACE would understate
        // the document's permissions, and the name is genuinely all Nuxeo still knows.
        return { ...base, user: { id: principal.name, username: principal.name } };
      }),
    );
  }
}
