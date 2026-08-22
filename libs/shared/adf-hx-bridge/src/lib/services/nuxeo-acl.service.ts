import { Injectable, inject } from '@angular/core';
import type { ACE } from '@hylandsoftware/hxcs-js-client';
import { Observable, combineLatest, map, of } from 'rxjs';

import type { NuxeoAce, NuxeoDocument } from '@agentic-ui/shared/nuxeo-client';

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
 * Builds HxPR's `sys_acl` from Nuxeo's ACLs.
 *
 * Separate from `nuxeo-to-hx-document.mapper.ts` because it is **asynchronous and cannot be
 * otherwise**: Nuxeo's ACE names a principal without saying whether it is a user or a group, so each
 * distinct name needs a directory lookup. See `NuxeoPrincipalResolver`.
 *
 * ## What is deliberately lost, and what is not
 *
 * Nuxeo groups ACEs into **named** ACLs — `local`, `inherited` — and HxPR's `sys_acl` is a flat
 * `ACE[]` with no equivalent. The names are therefore dropped, and that is a real reduction: a
 * consumer of `sys_acl` alone cannot tell an inherited grant from a local one.
 *
 * It is not hidden. `AdfHxBrowseFolderService` and the POC's own permissions tab read Nuxeo's ACLs
 * directly and *do* distinguish local, inherited and external, which is why that tab was kept rather
 * than replaced. `sys_acl` exists for upstream components that ask for it.
 *
 * `id` is dropped too — Nuxeo's composite ACE id (`Administrator:Everything:true:Administrator::`)
 * has no HxPR field and encodes information already present in the other columns.
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
    const acls = doc.contextParameters?.['acls'];
    if (!Array.isArray(acls)) {
      return of(undefined);
    }

    const aces = acls.flatMap(
      (acl: { aces?: NuxeoAce[]; ace?: NuxeoAce[] }) =>
        // Nuxeo's own payload uses `aces`; the `@acl` adapter uses `ace`. Both are accepted because
        // both appear on this instance depending on which endpoint answered.
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
