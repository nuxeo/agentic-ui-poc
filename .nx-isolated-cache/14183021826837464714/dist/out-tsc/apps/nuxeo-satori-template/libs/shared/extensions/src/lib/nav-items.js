import { InjectionToken, computed, inject } from '@angular/core';
import { AppExtensionsService } from './app-extensions.service';
import { ExtensionRuleContextService } from './extension-rule-context.service';
import { EXTENSION_SLOTS } from './extension-slots';
/**
 * The navigation the product ships with.
 *
 * Phase 2 took the compiled `const` that `apps/nuxeo-ui/src/app/platform-nav-items.ts`
 * held and **registered it into a slot** instead, so a manifest can reorder it, relabel
 * it, hide entries, gate them behind a rule, or add its own. Reproducing the pre-Phase-2
 * navigation exactly was that phase's requirement, and it did.
 *
 * One browse surface is offered, at `/browse`. The adf-hx proof of concept's
 * `app.navbar.browseAdfHx` stood beside it, with this entry disabled, until both its route and
 * its ID were retired. Anything reading this list as "what the user sees" must still filter it,
 * because a manifest can disable or gate any entry — `resolve()` does, `pageTitle` deliberately
 * does not.
 *
 * `order` is explicit and spaced by ten so a customer can insert between two
 * packaged entries without restating the list.
 */
export const PACKAGED_NAV_ITEMS = [
    {
        id: 'app.navbar.knowledgeDiscovery',
        labelKey: 'nav.item.knowledge-discovery',
        label: 'Knowledge Discovery',
        path: '/knowledge-discovery',
        icon: 'star',
        order: 10,
    },
    {
        id: 'app.navbar.dashboard',
        labelKey: 'nav.item.dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'dashboard',
        order: 20,
    },
    {
        id: 'app.navbar.browse',
        labelKey: 'nav.item.browse',
        label: 'Browse',
        path: '/browse',
        icon: 'folder',
        order: 30,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.recentlyViewed',
        labelKey: 'nav.item.recently-viewed',
        label: 'Recently viewed',
        path: '/recently-viewed',
        icon: 'clock',
        order: 50,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.search',
        labelKey: 'nav.item.search-filters',
        label: 'Search filters',
        path: '/search',
        icon: 'search',
        order: 60,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.expiredQueue',
        labelKey: 'nav.item.expired-queue',
        label: 'Expired Queue',
        path: '/expired-queue',
        icon: 'timer',
        order: 70,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.assets',
        labelKey: 'nav.item.assets',
        label: 'Assets',
        path: '/documents',
        icon: 'document',
        order: 80,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.tasks',
        labelKey: 'nav.item.tasks',
        label: 'Tasks',
        path: '/tasks',
        icon: 'tasks',
        order: 90,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.favorites',
        labelKey: 'nav.item.favorites',
        label: 'Favorites',
        path: '/favorites',
        icon: 'star',
        order: 100,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.collections',
        labelKey: 'nav.item.collections',
        label: 'Collections',
        path: '/collections',
        icon: 'bookmark',
        order: 110,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.personalSpace',
        labelKey: 'nav.item.personal-space',
        label: 'Personal Space',
        path: '/personal-space',
        icon: 'grid_view',
        order: 120,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.clipboard',
        labelKey: 'nav.item.clipboard',
        label: 'Clipboard',
        path: '/clipboard',
        icon: 'notepad',
        order: 130,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.trash',
        labelKey: 'nav.item.trash',
        label: 'Trash',
        path: '/trash',
        icon: 'trash',
        order: 140,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.administration',
        labelKey: 'nav.item.administration',
        label: 'Administration',
        path: '/administration',
        icon: 'settings',
        order: 150,
        hasDrawer: true,
        // The only packaged entry carrying a rule. Before Phase 2 this was a
        // hardcoded `item.path === '/administration'` filter in the shell, which a
        // manifest could neither see nor relax.
        rule: 'app.rules.hasAdministrationAccess',
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
export const APP_NAV_ITEMS = new InjectionToken('APP_NAV_ITEMS', {
    providedIn: 'root',
    factory: () => {
        const extensions = inject(AppExtensionsService);
        const ruleContext = inject(ExtensionRuleContextService);
        extensions.register(EXTENSION_SLOTS.navbar, PACKAGED_NAV_ITEMS);
        return computed(() => extensions.resolve(EXTENSION_SLOTS.navbar, ruleContext.context()));
    },
});
