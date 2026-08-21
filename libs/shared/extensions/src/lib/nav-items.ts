import { InjectionToken, computed, inject, type Signal } from '@angular/core';

import { AppExtensionsService } from './app-extensions.service';
import { ExtensionRuleContextService } from './extension-rule-context.service';
import type { ExtensionRule } from './extension-rules';
import { EXTENSION_SLOTS, type ExtensionElement } from './extension-slots';

/**
 * A platform navigation entry, in a shape that owes nothing to Satori.
 *
 * The shell maps this to `SatNavigationItemWithIcon` when it renders. Keeping
 * the descriptor neutral means a customer's manifest and a customer's extension
 * library are written against our vocabulary, not against the nav component we
 * happen to use this quarter.
 */
export interface NavItemDescriptor extends ExtensionElement {
  readonly label: string;
  /** Router path, e.g. `/browse`. */
  readonly path: string;
  /** Icon name understood by the shell's icon set. */
  readonly icon: string;
  /** When true, clicking opens the secondary drawer instead of navigating directly. */
  readonly hasDrawer?: boolean;
  /** Registered rule id gating visibility. */
  readonly rule?: ExtensionRule;
}

/**
 * The navigation the product ships with.
 *
 * This is the same list, in the same order, with the same labels, paths and
 * icons that `apps/nuxeo-ui/src/app/platform-nav-items.ts` held as a compiled
 * `const` before Phase 2 — reproducing today's behaviour exactly is the whole
 * requirement. What changed is that it is now **registered into a slot** rather
 * than imported, so a manifest can reorder it, relabel it, hide entries, gate
 * them behind a rule, or add its own.
 *
 * `order` is explicit and spaced by ten so a customer can insert between two
 * packaged entries without restating the list.
 */
export const PACKAGED_NAV_ITEMS: readonly NavItemDescriptor[] = [
  {
    id: 'app.navbar.knowledgeDiscovery',
    label: 'Knowledge Discovery',
    path: '/knowledge-discovery',
    icon: 'star',
    order: 10,
  },
  {
    id: 'app.navbar.dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'dashboard',
    order: 20,
  },
  {
    id: 'app.navbar.browse',
    label: 'Browse',
    path: '/browse',
    icon: 'folder',
    order: 30,
    hasDrawer: true,
  },
  {
    id: 'app.navbar.browseAdfHx',
    label: 'Browse (adf-hx POC)',
    path: '/browse-adf-hx',
    icon: 'folder_open',
    order: 40,
    hasDrawer: true,
  },
  {
    id: 'app.navbar.recentlyViewed',
    label: 'Recently viewed',
    path: '/recently-viewed',
    icon: 'clock',
    order: 50,
    hasDrawer: true,
  },
  {
    id: 'app.navbar.search',
    label: 'Search filters',
    path: '/search',
    icon: 'search',
    order: 60,
    hasDrawer: true,
  },
  {
    id: 'app.navbar.expiredQueue',
    label: 'Expired Queue',
    path: '/expired-queue',
    icon: 'timer',
    order: 70,
    hasDrawer: true,
  },
  {
    id: 'app.navbar.assets',
    label: 'Assets',
    path: '/documents',
    icon: 'document',
    order: 80,
    hasDrawer: true,
  },
  {
    id: 'app.navbar.tasks',
    label: 'Tasks',
    path: '/tasks',
    icon: 'tasks',
    order: 90,
    hasDrawer: true,
  },
  {
    id: 'app.navbar.favorites',
    label: 'Favorites',
    path: '/favorites',
    icon: 'star',
    order: 100,
    hasDrawer: true,
  },
  {
    id: 'app.navbar.collections',
    label: 'Collections',
    path: '/collections',
    icon: 'bookmark',
    order: 110,
    hasDrawer: true,
  },
  {
    id: 'app.navbar.personalSpace',
    label: 'Personal Space',
    path: '/personal-space',
    icon: 'grid_view',
    order: 120,
    hasDrawer: true,
  },
  {
    id: 'app.navbar.clipboard',
    label: 'Clipboard',
    path: '/clipboard',
    icon: 'notepad',
    order: 130,
    hasDrawer: true,
  },
  {
    id: 'app.navbar.trash',
    label: 'Trash',
    path: '/trash',
    icon: 'trash',
    order: 140,
    hasDrawer: true,
  },
  {
    id: 'app.navbar.administration',
    label: 'Administration',
    path: '/administration',
    icon: 'settings',
    order: 150,
    hasDrawer: true,
  },
];

/**
 * The navigation to render: packaged entries merged with the manifest's, with
 * overrides applied, rules evaluated and order honoured.
 *
 * A **signal** behind a token rather than a compiled array, for two reasons the
 * `const` could not satisfy. The manifest arrives asynchronously in
 * `APP_INITIALIZER`, so an eagerly evaluated array would capture the packaged
 * list; and nav rules such as `app.rules.isAdministrator` depend on the
 * signed-in user, so the answer changes after sign-in.
 */
export const APP_NAV_ITEMS = new InjectionToken<Signal<readonly NavItemDescriptor[]>>(
  'APP_NAV_ITEMS',
  {
    providedIn: 'root',
    factory: () => {
      const extensions = inject(AppExtensionsService);
      const ruleContext = inject(ExtensionRuleContextService);
      extensions.register(EXTENSION_SLOTS.navbar, PACKAGED_NAV_ITEMS);
      return computed(() =>
        extensions.resolve<NavItemDescriptor>(EXTENSION_SLOTS.navbar, ruleContext.context()),
      );
    },
  },
);
