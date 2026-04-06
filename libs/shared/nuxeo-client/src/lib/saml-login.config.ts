import { InjectionToken } from '@angular/core';

/** One SAML / SSO entry point exposed by your Nuxeo server (path is relative to the Nuxeo origin). */
export interface NuxeoSamlLoginEndpoint {
  id: string;
  label: string;
  /**
   * Path beginning with `/nuxeo/…` that starts the IdP flow when opened in the browser.
   * Replace with the real URLs from your Nuxeo version (inspect stock Web UI or admin docs).
   * Examples (registration ids vary): `/nuxeo/oauth2/authorization/my-azure-registration`
   */
  path: string;
}

/**
 * SAML / OIDC-style login buttons on the Angular login page. Each entry navigates the window to
 * `resolveNuxeoBrowserOrigin() + path` (+ optional `requestedUrl` if enabled).
 */
export const NUXEO_SAML_LOGIN_ENDPOINTS = new InjectionToken<NuxeoSamlLoginEndpoint[]>(
  'NUXEO_SAML_LOGIN_ENDPOINTS',
  {
    providedIn: 'root',
    factory: () => [],
  },
);

/**
 * When starting SSO, Nuxeo may accept a post-login URL (e.g. `requestedUrl`). This is the path
 * on the **Angular** site (same host as the SPA), e.g. `/dashboard`.
 */
export const NUXEO_SSO_POST_LOGIN_PATH = new InjectionToken<string>('NUXEO_SSO_POST_LOGIN_PATH', {
  providedIn: 'root',
  factory: () => '/dashboard',
});

/**
 * Query parameter name for return URL after SSO (Nuxeo form login often uses `requestedUrl`).
 * Set to `null` to skip appending (e.g. when the IdP relay state is fixed in Nuxeo only).
 */
export const NUXEO_SSO_RETURN_QUERY_PARAM = new InjectionToken<string | null>(
  'NUXEO_SSO_RETURN_QUERY_PARAM',
  {
    providedIn: 'root',
    factory: () => 'requestedUrl',
  },
);
