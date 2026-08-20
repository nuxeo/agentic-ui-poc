// Tile definitions are deliberately absent here. This library is lazy-loaded, so
// anything the startup registration imports statically lands in the initial
// bundle; the definitions therefore live in `apps/nuxeo-ui/src/app/page-tiles.ts`
// and reach the components below through a dynamic import of this barrel.
export { recentlyViewedRoutes, expiredQueueRoutes, favoritesRoutes } from './lib/lib.routes';
export {
  DocumentListPageComponent,
  type DocumentListDensity,
  type DocumentListKind,
  type DocumentListRow,
} from './lib/document-list-page/document-list-page.component';
export {
  TasksListTileComponent,
  type TasksListTileConfig,
} from './lib/tasks-list-tile/tasks-list-tile.component';
export {
  FavoritesTileComponent,
  type FavoritesRow,
} from './lib/favorites-tile/favorites-tile.component';
