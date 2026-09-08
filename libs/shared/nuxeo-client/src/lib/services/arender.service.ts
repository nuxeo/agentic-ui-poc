import { inject, Injectable, isDevMode } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ARENDER_CONFIG, type ARenderConfig } from '../arender.config';
import { CURRENT_USERNAME } from '../current-user.token';
import { isNavigableOrigin, navigableUrlOrNull } from '../utils/navigable-url';

/**
 * ARender annotation viewer integration.
 *
 * **Every method must answer for an absent configuration.** `ARENDER_CONFIG` is `null` whenever
 * `integrations.arender` is not set in the runtime manifest, which is the default for every
 * deployment in this repository. Before the guards below existed, `null` produced a
 * `TypeError: Cannot read properties of null` in all three methods — and the reason nobody noticed
 * is worth keeping:
 *
 *   - `isAvailable` raised its `TypeError` *inside* an Observable subscriber, so RxJS converted it
 *     to an error notification, and `document-detail`'s `error:` handler set the URL to `null`.
 *     The UI therefore reached "Annotations are not available" — the right outcome, produced by a
 *     swallowed type error rather than by a decision.
 *   - `getPreviewerUrl` threw *synchronously*, which no `error:` handler can catch. It was
 *     unreachable only because `isAvailable` errored first and `switchMap` never ran.
 *
 * So the correct behaviour was one refactor away from an unhandled exception, and `typecheck`
 * could not see it: Angular types `useFactory` as `(...args: any[]) => any`, so a provider handing
 * `null` to a non-nullable token compiles clean.
 */
@Injectable({ providedIn: 'root' })
export class ARenderService {
  private readonly rawCfg = inject(ARENDER_CONFIG);
  private readonly currentUsername = inject(CURRENT_USERNAME);

  /**
   * The configuration, or `null` if it is absent, **incomplete**, or **not safe to navigate**.
   *
   * This is the single choke point for ARender's trust decision, and it fails closed. Three things
   * disqualify a configuration:
   *
   * **1. Absent.** `integrations.arender` defaults to `null`.
   *
   * **2. A blank endpoint** — worse than `null`, because `fetch('')` resolves against the
   * *application's own* origin, so `isAvailable()` would report a viewer as present and
   * `getPreviewerUrl` would build a same-origin `/?url=…` that then gets trusted into an iframe.
   * That state is reachable: `bootstrap-config.ts`'s `mergeIntegrations` carries the comment "Both
   * endpoints are required: half an ARender configuration is worse than none" and does not enforce
   * it — a manifest naming only `viewerOrigin` yields `nuxeoInternalUrl: ''`, because the missing
   * half falls back to `base.arender?.nuxeoInternalUrl ?? ''` and `base.arender` is `null`.
   *
   * **3. A `viewerOrigin` that is not an http(s) origin.** This is the one that matters most.
   * `viewerOrigin` is string-concatenated into a URL which is then bypassed and loaded into an
   * `iframe`, and the manifest it comes from is a *customer-editable* surface. A manifest setting
   * it to `javascript:alert(1)` is complete, non-blank and well-formed — `new URL()` accepts
   * `javascript:` without complaint — so nothing above catches it, and the result is script
   * execution in this application's origin from a configuration value. `https:` is required unless
   * `isDevMode()`, because a plaintext document in an iframe is a downgrade.
   *
   * Enforcing all three here means no caller can build a dangerous URL in the first place; the
   * bypass in `document-detail` validates again before trusting, because defence for a privilege
   * boundary should not rest on one function.
   */
  private get cfg(): ARenderConfig | null {
    const cfg = this.rawCfg;
    if (!cfg) return null;

    // Navigated in an iframe — the load-bearing check.
    if (!isNavigableOrigin(cfg.viewerOrigin, isDevMode())) return null;

    // Not navigated by the browser: this is encoded into the `url=` parameter and fetched by
    // ARender's own server through the auth-proxy sidecar, so it is legitimately plain http. It
    // still has to be a well-formed absolute http(s) URL rather than anything at all.
    if (!navigableUrlOrNull(cfg.nuxeoInternalUrl, { allowInsecure: true })) return null;

    return cfg;
  }

  /**
   * Builds the ARender viewer URL by passing a direct nxfile download URL as the `url` parameter.
   * The nxfile URL points to the nginx auth-proxy sidecar inside Docker so the ARender rendition
   * service can fetch the blob with Basic Auth added automatically.
   *
   * Includes `user` so ARender's `RequestParameterAuthenticationFilter` attributes annotations to
   * the logged-in Nuxeo user.
   *
   * Answers `null` when ARender is not configured — the same value the caller already treats as
   * "no annotation viewer for this document".
   */
  getPreviewerUrl(docUid: string, blobXPath = 'file:content'): Observable<string | null> {
    const cfg = this.cfg;
    if (!cfg) return of(null);

    const nxfileUrl = `${cfg.nuxeoInternalUrl}/nxfile/default/${docUid}/${blobXPath}`;
    return of(this.withUser(`${cfg.viewerOrigin}/?url=${encodeURIComponent(nxfileUrl)}`));
  }

  /**
   * Builds an ARender diff URL for side-by-side document comparison. Answers `null` when ARender
   * is not configured.
   */
  getDiffUrl(leftDocUid: string, rightDocUid: string): Observable<string | null> {
    const cfg = this.cfg;
    if (!cfg) return of(null);

    const leftUrl = `${cfg.nuxeoInternalUrl}/nxfile/default/${leftDocUid}/file:content`;
    const rightUrl = `${cfg.nuxeoInternalUrl}/nxfile/default/${rightDocUid}/file:content`;
    return of(
      this.withUser(
        `${cfg.viewerOrigin}/?url=${encodeURIComponent(leftUrl)}&url=${encodeURIComponent(rightUrl)}`,
      ),
    );
  }

  /**
   * Checks whether ARender is reachable. Uses a `no-cors` fetch to avoid CORS blocks — the promise
   * resolves for any server response and rejects only on a network error (server unreachable).
   *
   * Answers `false` without probing anything when ARender is not configured. Not probing matters:
   * `fetch(undefined)` resolves against the *application's own* origin, which would report a
   * viewer as present when none is deployed.
   */
  isAvailable(): Observable<boolean> {
    const cfg = this.cfg;
    if (!cfg) return of(false);

    return new Observable<boolean>((subscriber) => {
      fetch(cfg.viewerOrigin, { mode: 'no-cors' })
        .then(() => {
          subscriber.next(true);
          subscriber.complete();
        })
        .catch(() => {
          subscriber.next(false);
          subscriber.complete();
        });
    });
  }

  /** Appends the acting user so ARender attributes annotations to them. */
  private withUser(viewerUrl: string): string {
    const user = this.currentUsername();
    return user ? `${viewerUrl}&user=${encodeURIComponent(user)}` : viewerUrl;
  }
}
