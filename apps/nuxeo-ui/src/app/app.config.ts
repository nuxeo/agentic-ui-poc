import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, inject } from '@angular/core';
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
import { AI_BACKEND_URL } from '@agentic-ui/shared/ai-client';
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
