import { APP_INITIALIZER, Injector, type Provider, effect } from '@angular/core';
import { AppConfigService } from '@nuxeo-satori/platform/app-config';

import { AuthService } from '../auth/auth.service';

/**
 * Re-fetch the Layer 1 manifest once a session exists.
 *
 * `AppConfigService.load()` runs as an `APP_INITIALIZER`, which is before the
 * user has authenticated. The manifest lives in a Nuxeo document, so that first
 * request is answered with a 403 and the service falls back to the packaged
 * default. Nothing retried it, so a customer's manifest did not apply until the
 * page happened to be reloaded while a session was already stored — on a user's
 * first sign-in, every Layer 0 and Layer 1 customisation was silently absent.
 *
 * The re-fetch is enough on its own because the consumers are reactive:
 * `AppExtensionsService` resolves its slots, rules, columns and actions through
 * a `computed` over `AppConfigService.manifest`, so setting that signal
 * propagates to the navbar, the drawer and every action without a reload.
 *
 * Fetching on each transition into the authenticated state, rather than only
 * when the startup attempt failed, also picks up a manifest edited since the
 * last sign-in.
 */
export function provideManifestRefresh(): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      // The returned function is invoked outside an injection context, so the
      // effect needs an injector passed explicitly.
      useFactory: (config: AppConfigService, auth: AuthService, injector: Injector) => () => {
        let loadedForSession = false;

        effect(
          () => {
            if (!auth.isAuthenticated()) {
              // Allow the next sign-in to fetch again.
              loadedForSession = false;
              return;
            }

            if (loadedForSession) {
              return;
            }

            loadedForSession = true;
            void config.loadManifest();
          },
          { injector },
        );
      },
      deps: [AppConfigService, AuthService, Injector],
      multi: true,
    },
  ];
}
