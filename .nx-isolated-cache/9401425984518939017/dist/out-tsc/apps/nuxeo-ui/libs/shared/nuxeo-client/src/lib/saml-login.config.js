import { InjectionToken } from '@angular/core';
/**
 * SAML / OIDC-style login buttons on the Angular login page. Each entry navigates the window to
 * `resolveNuxeoBrowserOrigin() + path` (+ optional `requestedUrl` if enabled).
 */
export const NUXEO_SAML_LOGIN_ENDPOINTS = new InjectionToken('NUXEO_SAML_LOGIN_ENDPOINTS', {
    providedIn: 'root',
    factory: () => [],
});
/**
 * When starting SSO, Nuxeo may accept a post-login URL (e.g. `requestedUrl`). This is the path
 * on the **Angular** site (same host as the SPA), e.g. `/dashboard`.
 */
export const NUXEO_SSO_POST_LOGIN_PATH = new InjectionToken('NUXEO_SSO_POST_LOGIN_PATH', {
    providedIn: 'root',
    factory: () => '/dashboard',
});
/**
 * Query parameter name for return URL after SSO (Nuxeo form login often uses `requestedUrl`).
 * Set to `null` to skip appending (e.g. when the IdP relay state is fixed in Nuxeo only).
 */
export const NUXEO_SSO_RETURN_QUERY_PARAM = new InjectionToken('NUXEO_SSO_RETURN_QUERY_PARAM', {
    providedIn: 'root',
    factory: () => 'requestedUrl',
});
