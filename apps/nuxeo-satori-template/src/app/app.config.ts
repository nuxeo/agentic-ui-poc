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

import { provideAcmeExtensions } from '@agentic-ui/acme-extensions';
import { AppConfigService } from '@nuxeo-satori/platform/app-config';
import { ExtensionRuleContextService } from '@nuxeo-satori/platform/extensions';

import { routes } from './app.routes';
import { provideTemplateExtensions } from './extensions/template-extensions';
import { TemplateSessionService } from './template-session.service';
import { TemplateThemeService } from './template-theme.service';

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
    //
    //    Anything that reads the configuration **once** must be sequenced inside
    //    this initializer, after the await. Angular runs `provideAppInitializer`
    //    functions *concurrently*, so a separate initializer reading
    //    `bootstrap()` races the load and reliably loses: the document title was
    //    a second initializer and rendered the packaged default while the shell
    //    around it showed the configured brand.
    //
    //    Reactive readers do not need this. `TemplateThemeService` applies its
    //    tokens from an `effect` over the same signal, so it simply re-runs when
    //    the load lands — which is why the theme was correct while the title was
    //    not. Prefer the reactive form; sequence here only when a one-shot write
    //    to something outside Angular (like `document.title`) is unavoidable.
    provideAppInitializer(async () => {
      const config = inject(AppConfigService);
      // Constructed before the await so its effect is live for the first paint.
      inject(TemplateThemeService);

      await config.load();

      document.title = config.bootstrap().branding.documentTitle;
    }),

    // 2. Layer 2. Registers this fork's slots, rules, components and actions.
    //    An environment initializer, so every id is registered before the first
    //    slot resolves — registering later would leave a window in which a rule
    //    id is unknown, and an unknown rule fails open.
    provideTemplateExtensions(),

    //    A **generated** extension library, integrated by this one line and
    //    nothing else. It is here so CI keeps proving the Layer 2 contract end to
    //    end: `libs/extensions/acme-extensions` was produced by
    //    `nx g ./tools/satori-generators:extension-library`, and integrating it
    //    required no edit to any platform library, to the shell, or to a manifest.
    //
    //    Delete this line and the import in your fork — it is a demonstration,
    //    not something you need.
    provideAcmeExtensions(),

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
  ],
};
