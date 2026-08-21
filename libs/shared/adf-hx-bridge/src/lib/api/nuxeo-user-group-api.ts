import { Injectable, inject } from '@angular/core';
import type { Group, User } from '@hylandsoftware/hxcs-js-client';
import { firstValueFrom } from 'rxjs';

import { UserService, type NuxeoGroup, type NuxeoUser } from '@agentic-ui/shared/nuxeo-client';

import type { AxiosLikeResponse } from './nuxeo-version-api';

/** Nuxeo user -> HxPR `User`. Nuxeo nests the names under `properties`; HxPR flattens them. */
function mapUser(nuxeo: NuxeoUser): User {
  return {
    id: nuxeo.id,
    username: nuxeo.properties?.username ?? nuxeo.id,
    firstName: nuxeo.properties?.firstName,
    lastName: nuxeo.properties?.lastName,
    email: nuxeo.properties?.email,
  };
}

/**
 * Nuxeo group -> HxPR `Group`.
 *
 * `name` takes Nuxeo's `grouplabel` — the display name — because that is what upstream
 * renders. `groupname`, the identifier, goes to `id`. Getting these the wrong way round
 * shows internal ids in a permissions dialog.
 */
function mapGroup(nuxeo: NuxeoGroup): Group {
  return { id: nuxeo.groupname, name: nuxeo.grouplabel || nuxeo.groupname };
}

/**
 * The `USER` API port, backed by Nuxeo's `/user` endpoints.
 *
 * `UserService` already had `getUser` and `searchUsers`, so this is a mapping layer and
 * nothing more.
 */
@Injectable()
export class NuxeoUserApi {
  private readonly users = inject(UserService);

  async getUserById(userId: string): Promise<AxiosLikeResponse<User>> {
    if (!userId) throw new Error('getUserById requires a user id');
    return { data: mapUser(await firstValueFrom(this.users.getUser(userId))) };
  }

  async searchUsersByName(name: string): Promise<AxiosLikeResponse<User[]>> {
    // Nuxeo's user search requires a term; an empty query returns the whole directory,
    // which is a different and much more expensive request than the caller asked for.
    if (!name) throw new Error('searchUsersByName requires a search term');
    const found = await firstValueFrom(this.users.searchUsers(name));
    return { data: found.map(mapUser) };
  }
}

/** The `GROUP` API port, backed by Nuxeo's `/group` endpoints. */
@Injectable()
export class NuxeoGroupApi {
  private readonly users = inject(UserService);

  async getGroupById(groupId: string): Promise<AxiosLikeResponse<Group>> {
    if (!groupId) throw new Error('getGroupById requires a group id');
    return { data: mapGroup(await firstValueFrom(this.users.getGroup(groupId))) };
  }

  async searchGroups(name: string): Promise<AxiosLikeResponse<Group[]>> {
    if (!name) throw new Error('searchGroups requires a search term');
    const found = await firstValueFrom(this.users.searchGroups(name));
    return { data: found.map(mapGroup) };
  }
}
