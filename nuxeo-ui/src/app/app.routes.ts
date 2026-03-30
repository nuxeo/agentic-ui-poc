import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./components/login/login').then(m => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./components/shell/shell').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'browser', pathMatch: 'full' },
      { path: 'browser', loadComponent: () => import('./components/browser/browser').then(m => m.BrowserComponent) },
      { path: 'browser/:path', loadComponent: () => import('./components/browser/browser').then(m => m.BrowserComponent) },
      { path: 'search', loadComponent: () => import('./components/search/search').then(m => m.SearchComponent) },
      { path: 'upload', loadComponent: () => import('./components/upload/upload').then(m => m.UploadComponent) },
      { path: 'document/:id', loadComponent: () => import('./components/document-viewer/document-viewer').then(m => m.DocumentViewerComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
