import { Route } from '@angular/router';
import { StudioDesignerShellComponent } from './shell/studio-designer-shell.component';

export const studioDesignerRoutes: Route[] = [
  {
    path: '',
    component: StudioDesignerShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'layouts' },
      {
        path: 'layouts',
        loadComponent: () =>
          import('./pages/layouts/layouts-page.component').then((m) => m.LayoutsPageComponent),
      },
      {
        path: 'buttons',
        loadComponent: () =>
          import('./pages/buttons/buttons-page.component').then((m) => m.ButtonsPageComponent),
      },
      {
        path: 'tabs',
        loadComponent: () =>
          import('./pages/tabs/tabs-page.component').then((m) => m.TabsPageComponent),
      },
      {
        path: 'drawer',
        loadComponent: () =>
          import('./pages/drawer/drawer-page.component').then((m) => m.DrawerPageComponent),
      },
      {
        path: 'page-providers',
        loadComponent: () =>
          import('./pages/page-providers/page-providers-page.component').then(
            (m) => m.PageProvidersPageComponent,
          ),
      },
      {
        path: 'themes',
        loadComponent: () =>
          import('./pages/themes/themes-page.component').then((m) => m.ThemesPageComponent),
      },
      {
        path: 'translations',
        loadComponent: () =>
          import('./pages/translations/translations-page.component').then(
            (m) => m.TranslationsPageComponent,
          ),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard-page.component').then(
            (m) => m.DashboardDesignerPageComponent,
          ),
      },
    ],
  },
];
