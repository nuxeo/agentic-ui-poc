import { InjectionToken } from '@angular/core';

/**
 * Base URL for Nuxeo API calls from the browser.
 * Use '' with `proxy.conf.json` during `nx serve web` so requests go to `/nuxeo/...` on the dev server and are proxied to http://localhost:8180.
 * For production behind a shared host, keep ''.
 * For cross-origin production, set the full origin (and configure CORS on Nuxeo).
 */
export const NUXEO_API_ORIGIN = new InjectionToken<string>('NUXEO_API_ORIGIN', {
  providedIn: 'root',
  factory: () => '',
});
