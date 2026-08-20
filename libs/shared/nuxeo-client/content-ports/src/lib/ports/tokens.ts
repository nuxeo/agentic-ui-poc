import { InjectionToken } from '@angular/core';
import type { AuthPort } from './auth.port';
import type { DocumentPort } from './document.port';
import type { PermissionsPort } from './permissions.port';
import type { SearchPort } from './search.port';
import type { UploadPort } from './upload.port';

/**
 * The neutral port tokens — the substitution boundary. A `provide…ContentAdapter()`
 * bundle points these tokens at one backend's implementations. Callers inject the
 * token, never a concrete adapter class.
 */
export const DOCUMENT_PORT = new InjectionToken<DocumentPort>('content-ports.DocumentPort');
export const SEARCH_PORT = new InjectionToken<SearchPort>('content-ports.SearchPort');
export const PERMISSIONS_PORT = new InjectionToken<PermissionsPort>(
  'content-ports.PermissionsPort',
);
export const UPLOAD_PORT = new InjectionToken<UploadPort>('content-ports.UploadPort');
export const AUTH_PORT = new InjectionToken<AuthPort>('content-ports.AuthPort');
