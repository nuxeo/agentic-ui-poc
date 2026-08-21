import {
  APP_INITIALIZER,
  DestroyRef,
  Injector,
  type Provider,
  type Type,
  effect,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import {
  AppExtensionsService,
  EXTENSION_SLOTS,
  ExtensionActionRegistry,
  ExtensionComponentRegistry,
  ExtensionRuleContextService,
  PACKAGED_BROWSE_COLUMNS,
  PACKAGED_BULK_ACTIONS,
  type ExtensionActionHandler,
} from '@agentic-ui/shared/extensions';
import { SelectionService } from '@agentic-ui/shared/nuxeo-client';

import { AuthService } from '../auth/auth.service';

type BulkActionModule = typeof import('./bulk-action.services');

/**
 * A handler that loads its action service on first use.
 *
 * This provider runs eagerly in `APP_INITIALIZER`, and the action services pull
 * in dialogs from `@agentic-ui/shared/ui`. Importing them statically moved
 * ~440 kB of dialog code out of the lazily-loaded shell chunk and into the
 * initial bundle, which the build budget correctly refused. Deferring the import
 * to the click keeps the registration eager — so the descriptors are always
 * addressable — while the code stays where it was.
 */
function bulkHandler(injector: Injector, name: keyof BulkActionModule): ExtensionActionHandler {
  return {
    execute: (context) => {
      void import('./bulk-action.services')
        // The keyed lookup widens to a union of the six service classes, which
        // `Injector.get` cannot narrow; they all satisfy the handler interface.
        .then((module) =>
          injector.get(module[name] as Type<ExtensionActionHandler>).execute(context),
        )
        .catch((error) => console.error(`Failed to load bulk action ${name}`, error));
    },
  };
}

/**
 * Register the application's Layer 1 contributions and keep the rule context live.
 *
 * Runs as an `APP_INITIALIZER` so that every ID is registered **before** the
 * first component resolves a slot. Registering from a component constructor
 * instead would leave a window in which a rule id is unknown, and unknown rules
 * fail open — the Administration nav entry would flash for a non-administrator.
 *
 * `ExtensionRuleContextService.selection` is still not populated.
 * `SelectionService` tracks ids, labels and previews — not documents — so the
 * permission rules over a selection have nothing to read, and filling the list
 * with approximations would make `app.rules.canRemoveSelection` look
 * implemented while always answering `false`. `selectionCount` **is** populated,
 * because the cardinality is knowable from the ids alone, which is what makes
 * `app.rules.hasSelection` and `app.rules.hasMultipleSelection` genuinely live.
 *
 * `.document` is populated by whichever surface owns a focused document —
 * `DocumentDetailComponent` — rather than here, and cleared when it is destroyed.
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
        const actions = inject(ExtensionActionRegistry);
        const selection = inject(SelectionService);
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

        // The bulk-action surface: descriptors say where and when, handlers say
        // what. Adding a seventh action is these two registrations and nothing
        // else — no output on the topbar, no method on the shell.
        extensions.register(EXTENSION_SLOTS['bulk-actions'], PACKAGED_BULK_ACTIONS);

        // Browse document-list columns. Registered here rather than in the browse
        // library for the same reason as the bulk actions: eagerly, before any
        // component resolves the slot, so a manifest override is in force on the
        // first render instead of after a reflow.
        extensions.register(EXTENSION_SLOTS.documentList, PACKAGED_BROWSE_COLUMNS);
        actions.register({
          'app.bulkActions.downloadZip': bulkHandler(injector, 'BulkDownloadZipActionService'),
          'app.bulkActions.addToCollection': bulkHandler(
            injector,
            'BulkAddToCollectionActionService',
          ),
          'app.bulkActions.compare': bulkHandler(injector, 'BulkCompareActionService'),
          'app.bulkActions.addToClipboard': bulkHandler(
            injector,
            'BulkAddToClipboardActionService',
          ),
          'app.bulkActions.publish': bulkHandler(injector, 'BulkPublishActionService'),
          'app.bulkActions.delete': bulkHandler(injector, 'BulkDeleteActionService'),
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
              ruleContext.selectionCount.set(selection.selectedCount());
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
