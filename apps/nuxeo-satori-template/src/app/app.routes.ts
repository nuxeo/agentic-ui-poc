import type { Routes } from '@angular/router';

import { ExtensionOutletComponent } from '@nuxeo-satori/platform/extensions';

/**
 * Routes the template ships with.
 *
 * A plain array, because **routing is not one of the four layers** — a fork owns
 * its route table. `docs/extension-reference.md` is explicit that the `routes`
 * slot is declared but that *nothing resolves it*, so a library cannot contribute
 * a route on its own and a host must map the path itself.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./pages/reports/reports-panel').then((m) => m.ReportsPanelComponent),
  },
  {
    /**
     * A route for a component the host cannot import.
     *
     * `libs/extensions/acme-extensions` exports only its provider and its ID list —
     * deliberately, so a host cannot depend on a class name that should be free to
     * change. So the host maps the *path* and `ExtensionOutletComponent` resolves
     * the *component* from the registry by ID, honouring the lazy loader the
     * library registered.
     *
     * `data` reaches the `componentId` input because the template bootstraps with
     * `withComponentInputBinding()`, which binds route data to component inputs.
     *
     * This route exists because the generated library's navbar entry pointed at
     * `/acme-extensions` and **nothing routed there** — it fell through the
     * wildcard back to `/home`. A nav entry that goes nowhere is precisely the
     * "descriptors nothing renders" failure, and the Phase 4 evidence now asserts
     * this path renders the panel.
     */
    path: 'acme-extensions',
    component: ExtensionOutletComponent,
    data: { componentId: 'acme.panel.acmeExtensions' },
  },
  { path: '**', redirectTo: 'home' },
];
