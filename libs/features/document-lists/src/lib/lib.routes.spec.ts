import { DocumentListPageComponent } from './document-list-page/document-list-page.component';
import { expiredQueueRoutes, favoritesRoutes, recentlyViewedRoutes } from './lib.routes';

describe('document list routes', () => {
  it.each([
    ['recently-viewed', recentlyViewedRoutes],
    ['expired-queue', expiredQueueRoutes],
    ['favorites', favoritesRoutes],
  ])('serves the %s list from the shared page component', (kind, routes) => {
    expect(routes).toEqual([{ path: '', component: DocumentListPageComponent, data: { kind } }]);
  });
});
