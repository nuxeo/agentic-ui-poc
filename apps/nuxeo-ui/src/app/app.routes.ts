import { Routes } from '@angular/router';

import { authGuard, loginGuard } from './auth/auth.guards';

const placeholder = () =>
  import('./placeholder-page.component').then((m) => m.PlaceholderPageComponent);

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login-page.component').then((m) => m.LoginPageComponent),
    canActivate: [loginGuard],
  },
  {
    path: '',
    loadComponent: () =>
      import('./shell/app-shell.component').then((m) => m.AppShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard-page.component').then(
            (m) => m.DashboardPageComponent,
          ),
      },
      {
        path: 'browse',
        loadChildren: () =>
          import('@agentic-ui/feature-browse').then((m) => m.browseRoutes),
      },
      {
        path: 'recently-viewed',
        loadComponent: placeholder,
      },
      {
        path: 'search',
        loadChildren: () =>
          import('@agentic-ui/feature-search').then((m) => m.searchRoutes),
      },
      {
        path: 'expired-queue',
        loadComponent: placeholder,
      },
      {
        path: 'doc',
        loadChildren: () =>
          import('@agentic-ui/feature-document-detail').then(
            (m) => m.documentDetailRoutes,
          ),
      },
      {
        path: 'documents',
        loadComponent: placeholder,
      },
      {
        path: 'tasks',
        loadComponent: placeholder,
      },
      {
        path: 'favorites',
        loadComponent: placeholder,
      },
      {
        path: 'collections',
        loadChildren: () =>
          import('@agentic-ui/feature-collections').then(
            (m) => m.collectionsRoutes,
          ),
      },
      {
        path: 'personal-space',
        loadComponent: placeholder,
      },
      {
        path: 'clipboard',
        loadComponent: placeholder,
      },
      {
        path: 'trash',
        loadComponent: placeholder,
      },
    ],
  },
];
