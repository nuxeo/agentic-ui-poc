import { Routes } from '@angular/router';
import { PageBuilderShellComponent } from './page-builder-shell/page-builder-shell.component';

/**
 * Page builder routes.
 *
 * - '' → list saved pages
 * - 'new' → blank editor for creating a new page
 * - ':pageId' → load and edit an existing page
 *
 * The shell component handles all three modes internally, switching between
 * list view and editor view based on the route.
 */
export const pageBuilderRoutes: Routes = [
  {
    path: '',
    component: PageBuilderShellComponent,
  },
  {
    path: 'new',
    component: PageBuilderShellComponent,
  },
  {
    path: ':pageId',
    component: PageBuilderShellComponent,
  },
];
