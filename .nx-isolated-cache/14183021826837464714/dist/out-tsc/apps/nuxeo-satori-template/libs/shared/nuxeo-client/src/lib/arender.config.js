import { InjectionToken } from '@angular/core';
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
 * There is deliberately no fallback now. A deployment that wants ARender supplies `viewerOrigin` in
 * its manifest; anything less is `null`.
 *
 * **`viewerOrigin` is the only required value.** `nuxeoInternalUrl` is vestigial (see above) and is
 * neither required nor validated — gating on a field nothing consumes can only reject
 * configurations that would have worked.
 *
 * `viewerOrigin` is enforced **twice, in different layers**, and neither is redundant:
 *
 *   - `bootstrap-config.ts`'s `completeARenderConfig` returns `null` unless the merged result has a
 *     non-blank `viewerOrigin`, so a manifest without one never reaches the token.
 *   - `ARenderService` re-checks, and additionally requires it to be an absolute http(s) base with
 *     no query, fragment or userinfo — because it is navigated in an iframe and serves as the
 *     origin allow-list for the URL Nuxeo returns.
 *
 * An earlier version of this comment claimed `bootstrap-config.ts` already refused half a
 * configuration when it did not: the merge filled the missing half with `''`, producing precisely
 * the object the comment said was impossible. The prose is not the contract; the check is.
 */
export const ARENDER_CONFIG = new InjectionToken('ARENDER_CONFIG', {
    providedIn: 'root',
    factory: () => null,
});
