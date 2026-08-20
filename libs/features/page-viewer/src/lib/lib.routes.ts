import { Routes } from '@angular/router';
import { PageViewerComponent } from './page-viewer/page-viewer.component';

/**
 * Routes for the page viewer feature.
 *
 * Supports:
 * - /:pageId - Renders a specific saved page by ID
 * - / (no ID) - Renders a demo page for testing
 *
 * The pageId parameter is automatically bound to the component's pageId input
 * via withComponentInputBinding() in app.config.ts.
 */
export const pageViewerRoutes: Routes = [
  {
    path: ':pageId',
    component: PageViewerComponent,
  },
  {
    path: '',
    component: PageViewerComponent,
  },
];
