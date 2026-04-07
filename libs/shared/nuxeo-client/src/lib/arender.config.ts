import { InjectionToken } from '@angular/core';

export interface ARenderConfig {
  /**
   * Base URL of the ARender UI as seen by the browser.
   * Default: `http://localhost:8080`
   */
  viewerOrigin: string;

  /**
   * Base URL of Nuxeo as seen by ARender containers (used to build nxfile URLs).
   * This goes through the nginx auth-proxy sidecar that adds Basic Auth.
   * Default: `http://nuxeo-auth-proxy/nuxeo`
   */
  nuxeoInternalUrl: string;
}

export const ARENDER_CONFIG = new InjectionToken<ARenderConfig>('ARENDER_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    viewerOrigin: 'http://localhost:8180',
    nuxeoInternalUrl: 'http://nuxeo-auth-proxy/nuxeo',
  }),
});
