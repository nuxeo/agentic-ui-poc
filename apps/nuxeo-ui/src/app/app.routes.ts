import { Routes } from '@angular/router';

import { adminGuard } from './auth/admin.guard';
import { authGuard, loginGuard } from './auth/auth.guards';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login-page.component').then((m) => m.LoginPageComponent),
    canActivate: [loginGuard],
  },
  {
    path: '',
    loadComponent: () => import('./shell/app-shell.component').then((m) => m.AppShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard-page.component').then((m) => m.DashboardPageComponent),
      },
      {
        path: 'browse',
        loadChildren: () => import('@agentic-ui/feature-browse').then((m) => m.browseRoutes),
      },
      {
        path: 'recently-viewed',
        loadChildren: () =>
          import('@agentic-ui/feature-document-lists').then((m) => m.recentlyViewedRoutes),
      },
      {
        path: 'search',
        loadChildren: () => import('@agentic-ui/feature-search').then((m) => m.searchRoutes),
      },
      {
        path: 'knowledge-discovery',
        loadChildren: () =>
          import('@agentic-ui/feature-knowledge-discovery').then((m) => m.knowledgeDiscoveryRoutes),
      },
      {
        path: 'expired-queue',
        loadChildren: () =>
          import('@agentic-ui/feature-document-lists').then((m) => m.expiredQueueRoutes),
      },
      {
        path: 'doc',
        loadChildren: () =>
          import('@agentic-ui/feature-document-detail').then((m) => m.documentDetailRoutes),
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('@agentic-ui/feature-assets/asset-search-results').then(
            (m) => m.AssetSearchResultsComponent,
          ),
      },
      {
        path: 'tasks',
        loadChildren: () => import('@agentic-ui/feature-tasks').then((m) => m.tasksRoutes),
      },
      {
        path: 'favorites',
        loadChildren: () =>
          import('@agentic-ui/feature-document-lists').then((m) => m.favoritesRoutes),
      },
      {
        path: 'collections',
        loadChildren: () =>
          import('@agentic-ui/feature-collections').then((m) => m.collectionsRoutes),
      },
      {
        path: 'personal-space',
        loadComponent: () =>
          import('./personal-space/personal-space-page.component').then(
            (m) => m.PersonalSpacePageComponent,
          ),
      },
      {
        path: 'trash',
        loadChildren: () => import('@agentic-ui/feature-trash').then((m) => m.trashRoutes),
      },
      {
        path: 'administration',
        canActivate: [adminGuard],
        loadChildren: () =>
          import('@agentic-ui/feature-administration').then((m) => m.administrationRoutes),
      },
      {
        path: 'settings/nuxeo-drive',
        loadComponent: () =>
          import('./settings/nuxeo-drive/nuxeo-drive-page.component').then(
            (m) => m.NuxeoDrivePageComponent,
          ),
      },
      {
        path: 'settings/profile',
        loadComponent: () =>
          import('./settings/profile/profile-page.component').then((m) => m.ProfilePageComponent),
      },
      {
        path: 'settings/authorized-applications',
        loadComponent: () =>
          import('./settings/authorized-applications/authorized-applications-page.component').then(
            (m) => m.AuthorizedApplicationsPageComponent,
          ),
      },
      {
        path: 'settings/cloud-services',
        loadComponent: () =>
          import('./settings/cloud-services/cloud-services-page.component').then(
            (m) => m.CloudServicesPageComponent,
          ),
      },
      {
        path: 'settings/themes',
        loadComponent: () =>
          import('./settings/themes/themes-page.component').then((m) => m.ThemesPageComponent),
      },
      {
        path: 'page',
        loadChildren: () =>
          import('@agentic-ui/feature-page-viewer').then((m) => m.pageViewerRoutes),
      },
      {
        path: 'page-builder',
        loadChildren: () =>
          import('@agentic-ui/feature-page-builder').then((m) => m.pageBuilderRoutes),
      },
      // The clipboard is drawer-only — it has no page and no server-side state — so a
      // bookmarked /clipboard, like any other unknown path, lands on the dashboard.
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
