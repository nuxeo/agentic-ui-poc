import { makeEnvironmentProviders, type EnvironmentProviders, type Provider } from '@angular/core';
import {
  AUTH_PORT,
  DOCUMENT_PORT,
  PERMISSIONS_PORT,
  SEARCH_PORT,
  UPLOAD_PORT,
} from '@agentic-ui/shared/content-ports';
import { NuxeoAuthAdapter } from './ports/nuxeo-auth.adapter';
import { NuxeoDocumentAdapter } from './ports/nuxeo-document.adapter';
import { NuxeoPermissionsAdapter } from './ports/nuxeo-permissions.adapter';
import { NuxeoSearchAdapter } from './ports/nuxeo-search.adapter';
import { NuxeoUploadAdapter } from './ports/nuxeo-upload.adapter';

/**
 * Binds every content port to its Nuxeo implementation. This function is the whole
 * substitution boundary: swapping backends means calling a different
 * `provide…ContentAdapter()` in `app.config.ts`, not editing callers.
 */
export function provideNuxeoContentAdapter(): EnvironmentProviders {
  const providers: Provider[] = [
    { provide: DOCUMENT_PORT, useExisting: NuxeoDocumentAdapter },
    { provide: SEARCH_PORT, useExisting: NuxeoSearchAdapter },
    { provide: PERMISSIONS_PORT, useExisting: NuxeoPermissionsAdapter },
    { provide: UPLOAD_PORT, useExisting: NuxeoUploadAdapter },
    { provide: AUTH_PORT, useExisting: NuxeoAuthAdapter },
  ];
  return makeEnvironmentProviders(providers);
}
