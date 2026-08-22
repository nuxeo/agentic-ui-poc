import type { Routes } from '@angular/router';

/**
 * Routes the template ships with.
 *
 * Kept as a plain array because routing is not one of the four layers: a fork
 * owns its own route table. The `routes` **slot** exists for the case where a
 * customer extension library needs to contribute a lazily-loaded route without
 * editing this file — see `docs/extension-reference.md`.
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
  { path: '**', redirectTo: 'home' },
];
