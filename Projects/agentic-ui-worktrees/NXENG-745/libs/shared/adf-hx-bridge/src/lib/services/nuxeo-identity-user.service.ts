import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type {
  IIdentityUserService,
  IdentityUserModel,
} from '@alfresco/adf-hx-content-services/services';

import { CURRENT_USERNAME, UserService } from '@nuxeo-satori/platform/nuxeo-client';

/**
 * adf-hx's `IDENTITY_USER_SERVICE_TOKEN`, answered from the Nuxeo session.
 *
 * Upstream ships no implementation and does not include the token in
 * `provideAdfEnterpriseAdfHxContentServicesServices()` — it is an intended substitution point for
 * whichever identity provider the host uses. Unprovided, `PermissionsParserService` cannot be
 * constructed, which takes the whole permissions panel with it.
 *
 * `getCurrentUserInfo` is **synchronous by upstream's contract**, so it can only report what the app
 * already knows: `CURRENT_USERNAME`, which the shell binds to `AuthService`. Nuxeo's `/user/{id}`
 * would give first and last names but only over HTTP, and the one caller that matters here —
 * `permissionsManagementRowsToAcl` — reads `id` alone, to stamp an edited ACE's creator.
 *
 * `search` is asynchronous and does reach Nuxeo. It is not on the permissions path; upstream calls
 * it from its own search filter surfaces.
 */
@Injectable()
export class NuxeoIdentityUserService implements IIdentityUserService {
  private readonly currentUsername = inject(CURRENT_USERNAME);
  private readonly users = inject(UserService);

  getCurrentUserInfo(): IdentityUserModel {
    // Empty rather than a placeholder when there is no session. Upstream writes this into an ACE's
    // `creator`, and a fabricated name there would misattribute a permission change.
    const username = this.currentUsername() ?? '';
    return { id: username, username };
  }

  async search(name?: string): Promise<IdentityUserModel[]> {
    if (!name) {
      return [];
    }
    const found = await firstValueFrom(this.users.searchUsers(name));
    return found.map((user) => ({
      id: user.id,
      username: user.properties.username,
      firstName: user.properties.firstName,
      lastName: user.properties.lastName,
      email: user.properties.email,
    }));
  }
}
