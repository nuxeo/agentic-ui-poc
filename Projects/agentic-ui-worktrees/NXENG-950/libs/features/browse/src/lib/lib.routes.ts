import { Route } from '@angular/router';
import { BrowseComponent } from './browse/browse';

export const browseRoutes: Route[] = [
  { path: '**', component: BrowseComponent },
];
