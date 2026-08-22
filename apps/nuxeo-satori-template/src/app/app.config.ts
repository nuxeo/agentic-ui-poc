import { provideHttpClient } from '@angular/common/http';
import {
  type ApplicationConfig,
  DestroyRef,
  Injector,
  effect,
  inject,
  provideAppInitializer,
  provideEnvironmentInitializer,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { filter } from 'rxjs/operators';

import { AppConfigService } from '@nuxeo-satori/platform/app-config';
import { ExtensionRuleContextService } from '@nuxeo-satori/platform/extensions';

import { routes } from './app.routes';
import { provideTemplateExtensions } from './extensions/template-extensions';
import { TemplateSessionService } from './template-session.service';

/**
 * The whole bootstrap. Four things, in an order that matters.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(routes, withComponentInputBinding()),

    // 1. Layer 0. Loads `bootstrap.json` from beside the bundle, then the Layer 1
    //    manifest from Nuxeo. Both halves fall back to packaged defaults rather
    //    than throwing, so an unconfigured deployment still starts — inspect
    //    `AppConfigService.diagnostics()` to see which half fell back and why.
    //    The template's home page renders exactly that.
    provideAppInitializer(async () => {
      await inject(AppConfigService).load();
    }),

    // 2. Layer 2. Registers this fork's slots, rules, components and actions.
    //    An environment initializer, so every id is registered before the first
    //    slot resolves — registering later would leave a window in which a rule
    //    id is unknown, and an unknown rule fails open.
    provideTemplateExtensions(),

    // 3. Keep the rule context live. Not registration, which is why it is
    //    separate: rules read the signed-in user and the current route, and
    //    something has to push that state in.
    provideEnvironmentInitializer(() => {
      const ruleContext = inject(ExtensionRuleContextService);
      const session = inject(TemplateSessionService);
      const router = inject(Router);
      const injector = inject(Injector);
      const destroyRef = inject(DestroyRef);

      effect(
        () => {
          ruleContext.username.set(session.isSignedIn() ? 'template-user' : null);
        },
        { injector },
      );

      // `Router.url` is not a signal, so the URL half has to be pushed on
      // navigation rather than read reactively.
      ruleContext.url.set(router.url.split('?')[0]);
      router.events
        .pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd),
          takeUntilDestroyed(destroyRef),
        )
        .subscribe((event) => ruleContext.url.set(event.urlAfterRedirects.split('?')[0]));
    }),

    // 4. Apply Layer 0 branding to the document title.
    provideAppInitializer(() => {
      const config = inject(AppConfigService);
      document.title = config.bootstrap().branding.documentTitle;
    }),
  ],
};
