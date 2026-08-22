import { Injectable, inject } from '@angular/core';
import type { Group, User } from '@hylandsoftware/hxcs-js-client';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

import { UserService } from '@agentic-ui/shared/nuxeo-client';

/**
 * What a Nuxeo principal name turned out to be.
 *
 * `kind: 'unknown'` is a real outcome, not an error case: an ACE can name a principal that has
 * since been deleted from the directory, and Nuxeo keeps the ACE.
 */
export type ResolvedPrincipal =
  | { kind: 'user'; user: User }
  | { kind: 'group'; group: Group }
  | { kind: 'unknown'; name: string };

/**
 * Resolves a Nuxeo principal name to a user or a group, once per name.
 *
 * ## Why this has to exist
 *
 * Nuxeo's ACE carries **users and groups in the same `username` field, with no type marker**.
 * Verified against real ACLs on the local instance, where `administrators` and `members` sit beside
 * `Administrator` in exactly the same shape. HxPR's `ACE` has separate `user` and `group` fields, so
 * a faithful `sys_acl` cannot be produced without asking the directory which one a name is.
 *
 * That makes principal resolution **asynchronous**, which is why it is a service and not part of
 * `nuxeo-to-hx-document.mapper.ts`. A synchronous mapper cannot do it, and guessing — putting every
 * principal in `user` because that is the field Nuxeo's key is called — would mislabel every group
 * in the permissions panel.
 *
 * ## How the type is determined
 *
 * `/group/{name}` answers 200 for a group and 404 for a user; `/user/{name}` is the mirror.
 * Measured: `Administrator` → user 200 / group 404, `administrators` → user 404 / group 200,
 * `members` → user 404 / group 200, a nonexistent name → 404 from both. So the pair is a clean
 * discriminator, and the group probe goes first because a group ACE is the ambiguous case worth
 * settling.
 *
 * ## Why the cache matters more than it looks
 *
 * A document's ACL commonly names the same handful of principals many times over — the fixture's
 * inherited ACL repeats `Administrator` three times in four entries. Without a cache, mapping one
 * document's ACL would issue a request per entry. `shareReplay({ refCount: false })` keeps the
 * result for the application's lifetime, because directory membership does not change in response
 * to anything this UI does.
 *
 * The same lookup also answers the **display-name** question recorded as gap D4: a resolved user
 * carries `firstName`/`lastName` and a resolved group carries Nuxeo's `grouplabel`. Anything that
 * wants a name rather than an identifier can use this rather than a second mechanism.
 */
@Injectable()
export class NuxeoPrincipalResolver {
  private readonly users = inject(UserService);
  private readonly cache = new Map<string, Observable<ResolvedPrincipal>>();

  resolve(name: string): Observable<ResolvedPrincipal> {
    if (!name) {
      return of({ kind: 'unknown', name });
    }

    const cached = this.cache.get(name);
    if (cached) {
      return cached;
    }

    const resolved = this.users.getGroup(name).pipe(
      map((group): ResolvedPrincipal => ({
        kind: 'group',
        group: {
          id: group.groupname,
          // `grouplabel` is the display name; `groupname` is the identifier. Reversing these
          // shows internal ids in a permissions dialog.
          name: group.grouplabel || group.groupname,
        },
      })),
      // Not a group, so try a user. A failure here is not swallowed into a plausible value: it
      // resolves to `unknown`, which callers render as the bare name.
      catchError(() =>
        this.users.getUser(name).pipe(
          map((user): ResolvedPrincipal => {
            const username = user.properties?.username ?? user.id;
            const first = user.properties?.firstName;
            const last = user.properties?.lastName;
            return {
              kind: 'user',
              user: {
                id: user.id,
                username,
                // Same fallback as `NuxeoUserApi`, and for the same reason: upstream composes
                // `${firstName} ${lastName}` with no guard, and Nuxeo's own `Administrator` has
                // both set to the empty string.
                firstName: first || username,
                lastName: last ?? '',
                email: user.properties?.email,
              },
            };
          }),
          catchError(() => of<ResolvedPrincipal>({ kind: 'unknown', name })),
        ),
      ),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.cache.set(name, resolved);
    return resolved;
  }
}
