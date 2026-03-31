import { Route } from '@angular/router';
import { CollectionDetailComponent } from './collection-detail/collection-detail';

export const collectionsRoutes: Route[] = [
  { path: ':uid', component: CollectionDetailComponent },
];
