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
export declare const NUXEO_SAML_LOGIN_ENDPOINTS: InjectionToken<NuxeoSamlLoginEndpoint[]>;
/**
 * When starting SSO, Nuxeo may accept a post-login URL (e.g. `requestedUrl`). This is the path
 * on the **Angular** site (same host as the SPA), e.g. `/dashboard`.
 */
export declare const NUXEO_SSO_POST_LOGIN_PATH: InjectionToken<string>;
/**
 * Query parameter name for return URL after SSO (Nuxeo form login often uses `requestedUrl`).
 * Set to `null` to skip appending (e.g. when the IdP relay state is fixed in Nuxeo only).
 */
export declare const NUXEO_SSO_RETURN_QUERY_PARAM: InjectionToken<string | null>;
//# sourceMappingURL=saml-login.config.d.ts.map