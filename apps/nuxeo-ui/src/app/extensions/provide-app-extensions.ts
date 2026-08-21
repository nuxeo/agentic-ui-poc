import {
  APP_INITIALIZER,
  DestroyRef,
  Injector,
  type Provider,
  effect,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import {
  AppExtensionsService,
  ExtensionComponentRegistry,
  ExtensionRuleContextService,
} from '@agentic-ui/shared/extensions';

import { AuthService } from '../auth/auth.service';

/**
 * Register the application's Layer 1 contributions and keep the rule context live.
 *
 * Runs as an `APP_INITIALIZER` so that every ID is registered **before** the
 * first component resolves a slot. Registering from a component constructor
 * instead would leave a window in which a rule id is unknown, and unknown rules
 * fail open — the Administration nav entry would flash for a non-administrator.
 *
 * `ExtensionRuleContextService.document` and `.selection` are deliberately not
 * populated here. Nothing in the shell owns a focused document, and
 * `SelectionService` tracks ids rather than documents, so a rule over a
 * selection has no data to read until the action registry lands and supplies it.
 * Populating them with approximations would make `app.rules.canRemoveSelection`
 * look implemented while always answering `false`.
 */
export function provideAppExtensions(): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const extensions = inject(AppExtensionsService);
        const components = inject(ExtensionComponentRegistry);
        const ruleContext = inject(ExtensionRuleContextService);
        const auth = inject(AuthService);
        const router = inject(Router);
        const injector = inject(Injector);
        const destroyRef = inject(DestroyRef);

        // Rules that need shell-owned state. These are exactly the shape a
        // customer's Layer 2 library registers, so the mechanism documented in
        // docs/extension-reference.md is the one the product itself uses.
        extensions.registerRules({
          'app.rules.hasAdministrationAccess': () => auth.hasAdministrationAccess(),
          'app.rules.isPowerUser': () => auth.isPowerUser(),
        });

        // Drawer panels that live in lazy-loaded feature libraries, so a
        // manifest can place one without the shell statically importing it.
        components.register({
          'app.sidebar.assets': () =>
            import('@agentic-ui/feature-assets/assets-drawer').then((m) => m.AssetsDrawerComponent),
          'app.sidebar.searchFilters': () =>
            import('@agentic-ui/feature-search').then((m) => m.SearchFiltersDrawerComponent),
          'app.sidebar.trashFilters': () =>
            import('@agentic-ui/feature-trash').then((m) => m.TrashFiltersDrawerComponent),
        });

        return () => {
          effect(
            () => {
              ruleContext.username.set(auth.username());
              ruleContext.isAdministrator.set(auth.isAdministrator());
            },
            { injector },
          );

          // `Router.url` is not a signal, so the URL half of the context has to
          // be pushed on navigation rather than read reactively.
          ruleContext.url.set(router.url.split('?')[0]);
          router.events
            .pipe(
              filter((event): event is NavigationEnd => event instanceof NavigationEnd),
              takeUntilDestroyed(destroyRef),
            )
            .subscribe((event) => ruleContext.url.set(event.urlAfterRedirects.split('?')[0]));
        };
      },
    },
  ];
}
