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
/** Backoff between manifest attempts, in milliseconds. Three tries over roughly four seconds. */
const RETRY_DELAYS_MS = [500, 1500, 2000];

/**
 * Fetch the manifest, retrying only a *failed* request.
 *
 * The guard flag used to be set before the fetch resolved, and `loadManifest()` never rejects, so
 * a single transient 500 or timeout left the whole session on packaged defaults with every Layer 0
 * and Layer 1 customisation absent — a quieter version of the defect this file was written to fix.
 *
 * `unavailable` is not retried: a 404 means the deployment has never saved a manifest, and an
 * unparseable document will return the same bytes next time. Retrying either would be a request
 * per attempt for a result that cannot change.
 */
async function loadWithRetry(config: AppConfigService): Promise<void> {
  for (let attempt = 0; ; attempt += 1) {
    await config.loadManifest();
    const outcome = config.diagnostics().manifestAttempt;
    if (outcome !== 'failed' || attempt >= RETRY_DELAYS_MS.length) return;
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
  }
}

export function provideManifestRefresh(): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      // The returned function is invoked outside an injection context, so the
      // effect needs an injector passed explicitly.
      useFactory: (config: AppConfigService, auth: AuthService, injector: Injector) => () => {
        let attemptedForSession = false;

        effect(
          () => {
            if (!auth.isAuthenticated()) {
              // Drop the previous user's manifest rather than only re-arming the guard. Without
              // this, a next user who cannot read the configuration document inherited the whole
              // of the previous one's interface, because a failed fetch keeps the value in force.
              config.resetManifest();
              attemptedForSession = false;
              return;
            }

            if (attemptedForSession) {
              return;
            }

            attemptedForSession = true;
            void loadWithRetry(config);
          },
          { injector },
        );
      },
      deps: [AppConfigService, AuthService, Injector],
      multi: true,
    },
  ];
}
