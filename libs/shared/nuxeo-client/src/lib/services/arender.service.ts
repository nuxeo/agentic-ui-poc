import { inject, Injectable, isDevMode } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ARENDER_CONFIG, type ARenderConfig } from '../arender.config';
import { CURRENT_USERNAME } from '../current-user.token';
import { isNavigableBaseUrl } from '../utils/navigable-url';

/**
 * ARender annotation viewer integration.
 *
 * **Every method must answer for an absent configuration.** `ARENDER_CONFIG` is `null` whenever
 * `integrations.arender` is not set in the Layer 0 bootstrap file, which is the default for every
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
   *
   * This check is now **defence in depth for direct providers**, not a patch over the layer below.
   * It was written when `bootstrap-config.ts`'s `mergeIntegrations` carried the comment "Both
   * endpoints are required: half an ARender configuration is worse than none" without enforcing it,
   * so a bootstrap file naming only `viewerOrigin` produced `nuxeoInternalUrl: ''`. That was fixed
   * in this same change: `completeARenderConfig` returns `null` unless the merged result has both
   * endpoints non-blank, so the bootstrap path can no longer deliver this state. Anything providing
   * `ARENDER_CONFIG` directly — a test, or a custom provider in an app config — still can, which is
   * why the guard stays. Describing it as compensating for the bootstrap layer would be describing
   * code that no longer runs.
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

    // Navigated in an iframe — the load-bearing check. `isNavigableBaseUrl`, not
    // a bare origin check: both URL builders below add parameters to this value, and a base
    // carrying its own query or fragment silently absorbs them so no top-level `url` parameter
    // survives. See that function for the three cases it rejects and why.
    if (!isNavigableBaseUrl(cfg.viewerOrigin, isDevMode())) return null;

    // Not navigated by the browser: this is encoded into the `url=` parameter and fetched by
    // ARender's own server through the auth-proxy sidecar, so it is legitimately plain http. It is
    // still a base that gets a path appended, so it carries the same no-query/no-fragment
    // requirement — a `#` here would truncate the nxfile path ARender is asked to fetch.
    //
    // `isNavigableBaseUrl` rejects a *bare* `?` or `#` as well as a populated one, which it did not
    // until review found the gap: `new URL('http://proxy/nuxeo?').search` is `''`, so that value
    // satisfied a check whose entire purpose was to establish that appending to it is safe.
    if (!isNavigableBaseUrl(cfg.nuxeoInternalUrl, true)) return null;

    return cfg;
  }

  /**
   * `<nuxeoInternalUrl>/nxfile/default/<uid>/<xpath>`, resolved rather than concatenated.
   *
   * Concatenation was a second instance of the defect `buildViewerUrl` was already written to
   * avoid, and it survived because `isNavigableBaseUrl` was accepting a base it should not have:
   * `http://proxy/nuxeo?` + `/nxfile/default/uid/file:content` is a URL whose path is only
   * `/nuxeo`, with the nxfile path demoted to a query string, so ARender fetches the Nuxeo root
   * instead of the blob and reports no error. With `#` the suffix becomes a fragment and is never
   * sent at all.
   *
   * The validator now rejects those bases, and this resolves structurally so the *shape* of the
   * bug is unavailable rather than merely unreachable — two independent guards, as elsewhere in
   * this file, because one function should not be the only thing between a customer-editable
   * manifest and a wrong fetch.
   *
   * `uid` is encoded; `xpath` is not, because `file:content` must keep its colon and Nuxeo's
   * nxfile route expects the raw xpath.
   */
  private buildNxfileUrl(base: string, docUid: string, blobXPath: string): string {
    // A trailing slash is required or `new URL()` resolves the relative path against the base's
    // *parent*, turning `http://proxy/nuxeo` into `http://proxy/nxfile/…`.
    const withSlash = base.endsWith('/') ? base : `${base}/`;
    return new URL(`nxfile/default/${encodeURIComponent(docUid)}/${blobXPath}`, withSlash).toString();
  }

  /**
   * `base` with `url` parameters and the acting user attached.
   *
   * Built with `URL`/`searchParams` rather than string concatenation. Concatenation was the defect:
   * `${viewerOrigin}/?url=${encodeURIComponent(...)}` assumes `viewerOrigin` has no query and no
   * fragment of its own, and produced a URL with no top-level `url` parameter whenever it did.
   * `searchParams.append` is also what makes the two-document diff case correct — `url` legitimately
   * appears twice, which a `set`-based or hand-built approach gets wrong.
   */
  private buildViewerUrl(base: string, nxfileUrls: string[]): string {
    const url = new URL(base);
    // Preserve the trailing slash the string-concatenation version always produced. It wrote
    // `${viewerOrigin}/?url=…`, so a configured prefix of `https://host/arender` yielded
    // `/arender/?url=…`; `new URL()` alone would yield `/arender?url=…`, and those are distinct
    // routes on the viewer. Moving to `URL`/`searchParams` was meant to fix parameter placement,
    // not to silently repoint a path-prefixed deployment.
    if (!url.pathname.endsWith('/')) url.pathname = `${url.pathname}/`;
    for (const nxfileUrl of nxfileUrls) {
      url.searchParams.append('url', nxfileUrl);
    }
    const user = this.currentUsername();
    if (user) {
      url.searchParams.set('user', user);
    }
    return url.toString();
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

    const nxfileUrl = this.buildNxfileUrl(cfg.nuxeoInternalUrl, docUid, blobXPath);
    return of(this.buildViewerUrl(cfg.viewerOrigin, [nxfileUrl]));
  }

  /**
   * Builds an ARender diff URL for side-by-side document comparison. Answers `null` when ARender
   * is not configured.
   */
  getDiffUrl(leftDocUid: string, rightDocUid: string): Observable<string | null> {
    const cfg = this.cfg;
    if (!cfg) return of(null);

    const leftUrl = this.buildNxfileUrl(cfg.nuxeoInternalUrl, leftDocUid, 'file:content');
    const rightUrl = this.buildNxfileUrl(cfg.nuxeoInternalUrl, rightDocUid, 'file:content');
    return of(this.buildViewerUrl(cfg.viewerOrigin, [leftUrl, rightUrl]));
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
}
