import { InjectionToken } from '@angular/core';

/**
 * Base URL for Nuxeo API calls from the browser.
 * Use '' with `proxy.conf.json` during `nx serve` so requests go to `/nuxeo/...`
 * on the dev server and are proxied to http://localhost:8080 (Nuxeo).
 * For production behind a shared host, keep ''.
 * For cross-origin production, set the full origin (and configure CORS on Nuxeo).
 */
export const NUXEO_API_ORIGIN = new InjectionToken<string>('NUXEO_API_ORIGIN', {
  providedIn: 'root',
  factory: () => '',
});

/**
 * The actual Nuxeo server URL as seen by external clients (e.g. Nuxeo Drive desktop app).
 * Unlike NUXEO_API_ORIGIN (which can be '' to use the dev proxy), this must always be the
 * real reachable Nuxeo server URL so desktop apps can connect directly without the proxy.
 * Defaults to window.location.origin + '/nuxeo', which is correct for same-origin deployments.
 * Override in app.config.ts for local dev (Angular dev proxy ≠ Nuxeo server).
 */
export const NUXEO_SERVER_URL = new InjectionToken<string>('NUXEO_SERVER_URL', {
  providedIn: 'root',
  factory: () => `${window.location.origin}/nuxeo`,
});
