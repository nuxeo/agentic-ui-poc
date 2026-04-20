import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, inject } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';
import { MAT_FAB_DEFAULT_OPTIONS } from '@angular/material/button';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { provideSatori } from '@hylandsoftware/satori-ui/providers';
import { Observable, firstValueFrom, of } from 'rxjs';

import { CURRENT_USERNAME, NUXEO_SERVER_URL } from '@agentic-ui/shared/nuxeo-client';
import { AI_BACKEND_URL } from '@agentic-ui/shared/ai-client';
import { provideNuxeoWidgets } from '@agentic-ui/shared/nuxeo-widgets';
import {
  ConfigStorageService,
  ThemeEngineService,
  TranslationLoaderService,
  PlatformRegistryService,
} from '@agentic-ui/shared/nuxeo-studio';
import { nuxeoAuthInterceptor } from './auth/nuxeo-auth.interceptor';
import { AuthService } from './auth/auth.service';
import { nuxeoSamlProviders } from './nuxeo-sso.providers';
import { routes } from './app.routes';
import { AppThemeService } from './theme/app-theme.service';

/** `APP_INITIALIZER` values are invoked as `fn()` at startup; the factory must return that `fn`. */
export function initializeAppTheme(theme: AppThemeService) {
  return () => theme.applyStoredOrDefault();
}

export function initializeStudioConfigs(
  storage: ConfigStorageService,
  themeEngine: ThemeEngineService,
  translationLoader: TranslationLoaderService,
  platformRegistry: PlatformRegistryService,
) {
  return () =>
    firstValueFrom(storage.init()).then(() => {
      themeEngine.apply();
      translationLoader.init();
      return firstValueFrom(platformRegistry.loadAll()).catch(() => {
        // Non-critical — designer pages will use fallback data
      });
    });
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
    {
      provide: APP_INITIALIZER,
      useFactory: initializeStudioConfigs,
      deps: [
        ConfigStorageService,
        ThemeEngineService,
        TranslationLoaderService,
        PlatformRegistryService,
      ],
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
    provideNuxeoWidgets(),
    { provide: AI_BACKEND_URL, useValue: '' },
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
