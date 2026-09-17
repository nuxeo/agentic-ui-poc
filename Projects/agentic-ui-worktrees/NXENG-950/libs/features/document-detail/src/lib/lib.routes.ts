import { Route } from '@angular/router';
import { DocumentDetailComponent } from './document-detail/document-detail';

export const documentDetailRoutes: Route[] = [
  { path: ':uid', component: DocumentDetailComponent },
];
