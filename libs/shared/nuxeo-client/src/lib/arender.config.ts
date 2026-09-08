import { InjectionToken } from '@angular/core';

export interface ARenderConfig {
  /**
   * Base URL of the ARender UI as seen by the browser. Per-deployment, and it must be an absolute
   * `https:` origin in production — it is navigated in an `iframe`, so it is a privilege boundary
   * rather than a cosmetic setting.
   */
  viewerOrigin: string;

  /**
   * Base URL of Nuxeo as seen by the ARender containers, used to build `nxfile` URLs. This goes
   * through the nginx auth-proxy sidecar that adds Basic Auth, so it is an internal address and
   * generally not reachable from the browser.
   */
  nuxeoInternalUrl: string;
}

/**
 * ARender annotation viewer configuration, or `null` when ARender is not deployed.
 *
 * **Nullable, and `null` is the default.** `integrations.arender` in the runtime app-config
 * manifest defaults to `null` and no manifest in this repository sets it, so an unconfigured
 * deployment is the normal case, not an edge case. Callers must handle `null`; `ARenderService`
 * does, and degrades to "Annotations are not available".
 *
 * This token used to be typed non-nullable with a factory returning compiled-in
 * `http://localhost:8180` and `http://nuxeo-auth-proxy/nuxeo` defaults. Both were wrong:
 *
 *   - A shipped build with no manifest pointed the annotation viewer at the *user's own*
 *     `localhost:8180`, and `.cursor/rules/security.mdc` prohibits exactly this kind of
 *     hardcoded config default.
 *   - `http://` for a value that is navigated in an iframe is a plaintext privilege boundary
 *     (Sonar `S5332`). Sonar never reported the literals in this file at all, because
 *     `sonar-project.properties` excludes every `*.config.ts` file — so the scanner is blind to
 *     the very filename pattern where hardcoded configuration is most likely to live.
 *
 * There is deliberately no fallback now. A deployment that wants ARender supplies both values in
 * its manifest; anything less is `null`, which matches `bootstrap-config.ts` already refusing half
 * an ARender configuration on the grounds that half is worse than none.
 */
export const ARENDER_CONFIG = new InjectionToken<ARenderConfig | null>('ARENDER_CONFIG', {
  providedIn: 'root',
  factory: () => null,
});
