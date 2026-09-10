import { InjectionToken } from '@angular/core';

export interface ARenderConfig {
  /**
   * Base URL of the ARender UI as seen by the browser. Per-deployment, and a privilege boundary rather
   * than a cosmetic setting: it is navigated in an `iframe`.
   *
   * Must be an absolute `http(s)` origin with **no query string, no fragment and no userinfo** — both
   * URL builders append parameters to it, and a base carrying its own `?` or `#` absorbs them.
   *
   * **The scheme rule is host-relative, not build-relative.** `http:` is rejected only where it would
   * downgrade the page framing it:
   *
   * | Application served over | `http:` viewerOrigin |
   * | ----------------------- | -------------------- |
   * | `https://…`             | rejected — the real downgrade |
   * | `http://…` (on-prem)    | accepted — nothing to downgrade |
   * | any, dev build          | accepted |
   *
   * An earlier version of this comment said it "must be `https:` in production", which was never what
   * the preview-fallback path did and is not what `ARenderService` does — a consumer following it would
   * have rejected a supported on-prem configuration. See `insecureAllowedForHost`.
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
 * **Nullable, and `null` is the default.** `integrations.arender` in the Layer 0 bootstrap file
 * (`agentic-ui-config/bootstrap.json`, read before authentication — *not* the post-auth runtime
 * manifest, which has no `integrations` key) defaults to `null` and nothing in this repository sets
 * it, so an unconfigured
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
 * its manifest; anything less is `null`.
 *
 * Completeness is enforced **twice, in different layers**, and neither is redundant:
 *
 *   - `bootstrap-config.ts`'s `completeARenderConfig` returns `null` unless the merged result has
 *     both endpoints non-blank, so a half-configured manifest never reaches the token.
 *   - `ARenderService` re-checks, and additionally requires each endpoint to be an absolute http(s)
 *     base with no query, fragment or userinfo — because it builds parameters onto them.
 *
 * An earlier version of this comment claimed `bootstrap-config.ts` already refused half a
 * configuration when it did not: the merge filled the missing half with `''`, producing precisely
 * the object the comment said was impossible. The prose is not the contract; the check is.
 */
export const ARENDER_CONFIG = new InjectionToken<ARenderConfig | null>('ARENDER_CONFIG', {
  providedIn: 'root',
  factory: () => null,
});
