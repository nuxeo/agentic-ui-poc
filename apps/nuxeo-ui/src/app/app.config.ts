import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, inject } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { MAT_FAB_DEFAULT_OPTIONS } from '@angular/material/button';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { provideSatori } from '@hylandsoftware/satori-ui/providers';
import { Observable, of } from 'rxjs';

import { CURRENT_USERNAME } from '@agentic-ui/shared/nuxeo-client';
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
    provideRouter(routes, withComponentInputBinding()),
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
    { provide: AI_BACKEND_URL, useValue: '' },
  ],
};
