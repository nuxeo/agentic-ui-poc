import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
  TranslateLoader,
  TranslateModule,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { provideSatori } from '@hylandsoftware/satori-ui/providers';

import { nuxeoAuthInterceptor } from './auth/nuxeo-auth.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptors([nuxeoAuthInterceptor])),
    provideRouter(routes, withComponentInputBinding()),
    provideSatori(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader },
      }),
    ),
  ],
};
