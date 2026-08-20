import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
  inject,
  isDevMode,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';
import { MAT_FAB_DEFAULT_OPTIONS } from '@angular/material/button';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { provideSatori } from '@hylandsoftware/satori-ui/providers';
import { Observable, of } from 'rxjs';

import {
  CURRENT_USERNAME,
  ADMIN_ACCESS_CHECKS,
  NUXEO_SERVER_URL,
} from '@agentic-ui/shared/nuxeo-client';
import { AI_BACKEND_URL, AiFeatureFlagService } from '@agentic-ui/shared/ai-client';
import {
  AGENT_DEV_AUTH_HEADERS,
  provideAgentFormComponents,
  provideAgentWidgets,
  providePageTiles,
} from '@agentic-ui/shared/agent-client';
import { documentCardWidget } from '@agentic-ui/shared/ui/agent-widgets';
import { documentMetadataForm } from '@agentic-ui/shared/ui/agent-forms';
import { documentListWidget } from './agent-widgets';
import { recentlyEditedTile } from '@agentic-ui/feature-dashboard-tiles';
import { tasksListTile, favoritesTile } from './page-tiles';
import { nuxeoAuthInterceptor } from './auth/nuxeo-auth.interceptor';
import { AuthService } from './auth/auth.service';
import { nuxeoSamlProviders } from './nuxeo-sso.providers';
import { routes } from './app.routes';
import { AppThemeService } from './theme/app-theme.service';

/** `APP_INITIALIZER` values are invoked as `fn()` at startup; the factory must return that `fn`. */
export function initializeAppTheme(theme: AppThemeService) {
  return () => theme.applyStoredOrDefault();
}

class AppTranslateLoader implements TranslateLoader {
  getTranslation(_lang: string): Observable<Record<string, string>> {
    return of({
      'sat.platform-nav.expand': '',
      'sat.platform-nav.collapse': '',
    });
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    ...nuxeoSamlProviders,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppTheme,
      deps: [AppThemeService],
      multi: true,
    },
    provideAnimations(),
    provideHttpClient(withInterceptors([nuxeoAuthInterceptor])),
    provideRouter(routes, withComponentInputBinding(), withHashLocation()),
    provideSatori(),
    {
      provide: MAT_FAB_DEFAULT_OPTIONS,
      useValue: { color: 'primary' },
    },
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useClass: AppTranslateLoader },
      }),
    ),
    {
      provide: CURRENT_USERNAME,
      useFactory: () => {
        const auth = inject(AuthService);
        return () => auth.username();
      },
    },
    {
      provide: ADMIN_ACCESS_CHECKS,
      useFactory: () => {
        const auth = inject(AuthService);
        return {
          isAdministrator: () => auth.isAdministrator(),
          isPowerUser: () => auth.isPowerUser(),
          hasAdministrationAccess: () => auth.hasAdministrationAccess(),
        };
      },
    },
    // AI operations served by the Java nuxeo-ai-package via Nuxeo Automation API
    { provide: AI_BACKEND_URL, useValue: '/nuxeo' },
    // Generative UI: every component the agent may cause to mount in the chat.
    // This call is the whole allowlist — nothing in the chat panel names a
    // widget — and it is the extension point a customer library plugs into.
    // `documentListWidget` has to live in this app because it names a feature
    // library and only `scope:app` may; `documentCardWidget` ships from
    // `libs/shared/ui` beside its component, which is the contributed shape.
    // See `docs/generative-ui-widgets.md`.
    provideAgentWidgets(documentListWidget, documentCardWidget),
    // Generative UI, the other channel: components that may *answer* a gated
    // write by submitting the form its tool declared. A separate call and a
    // separate token from the widgets above, which is the decision ADR 001
    // records rather than an implementation convenience — a widget's props are
    // identifiers and enums and never content, and a form's necessarily carry
    // gateway-resolved content, so one registry cannot state a single prop rule
    // for both. See `libs/shared/agent-client/src/lib/agent-form.ts`.
    //
    // A form component still never writes: it emits what the user typed, the
    // panel answers the interrupt, and the gateway performs the write behind the
    // approval gate it was already behind.
    provideAgentFormComponents(documentMetadataForm),
    // Page builder tiles: dashboard widgets that can be arranged on custom pages
    providePageTiles(recentlyEditedTile, tasksListTile, favoritesTile),
    {
      // The agent gateway's `HttpAgent` calls `fetch` directly and so never passes through
      // `nuxeoAuthInterceptor`. Cookie and SSO sessions need nothing from this: the run
      // goes to `/nuxeo/agent/run`, inside the session cookie's `Path`, so `JSESSIONID`
      // rides along by itself. This covers only the password login used on
      // `localhost:4200`, where the app holds Basic credentials and `fetch` has no
      // interceptor to attach them. Dev builds only.
      //
      // A supplement to the cookie, never a substitute: leaning on it to carry every
      // caller is what hid the missing `/nuxeo` prefix, because it works for exactly the
      // session type developers use and no other.
      provide: AGENT_DEV_AUTH_HEADERS,
      useFactory: () => {
        if (!isDevMode()) return () => ({});
        const auth = inject(AuthService);
        return () => {
          const basic = auth.basicCredentials();
          return basic ? { Authorization: `Basic ${basic}` } : {};
        };
      },
    },
    {
      // One capability probe, before the first paint, so the chat surface never flips
      // between the agent and Automation paths mid-conversation. Never rejects: a missing
      // gateway is a supported deployment, not a startup failure.
      provide: APP_INITIALIZER,
      useFactory: (flags: AiFeatureFlagService) => () => flags.probeAgentRuntime(),
      deps: [AiFeatureFlagService],
      multi: true,
    },
    {
      // Nuxeo Drive connects directly to the Nuxeo server (bypassing the Angular dev proxy).
      // When served via the Angular dev server (:4200), use the real Nuxeo URL (:8080).
      // In production (same-origin deployment), window.location.origin is the Nuxeo server.
      provide: NUXEO_SERVER_URL,
      useFactory: () => {
        const isDevProxy = window.location.port === '4200';
        return isDevProxy ? 'http://localhost:8080/nuxeo' : `${window.location.origin}/nuxeo`;
      },
    },
  ],
};
