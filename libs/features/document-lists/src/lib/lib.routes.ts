import { Routes } from '@angular/router';

import {
  DocumentListPageComponent,
  type DocumentListKind,
} from './document-list-page/document-list-page.component';

function listRoute(kind: DocumentListKind): Routes[number] {
  return { path: '', component: DocumentListPageComponent, data: { kind } };
}

export const recentlyViewedRoutes: Routes = [listRoute('recently-viewed')];
export const expiredQueueRoutes: Routes = [listRoute('expired-queue')];
export const favoritesRoutes: Routes = [listRoute('favorites')];
