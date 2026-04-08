import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ARENDER_CONFIG } from '../arender.config';
import { CURRENT_USERNAME } from '../current-user.token';

@Injectable({ providedIn: 'root' })
export class ARenderService {
  private readonly cfg = inject(ARENDER_CONFIG);
  private readonly currentUsername = inject(CURRENT_USERNAME);

  /**
   * Builds the ARender viewer URL by passing a direct nxfile download URL
   * as the `url` parameter. The nxfile URL points to the nginx auth-proxy
   * sidecar inside Docker so the ARender rendition service can fetch the
   * blob with Basic Auth added automatically.
   *
   * Includes `user` so ARender's `RequestParameterAuthenticationFilter`
   * attributes annotations to the logged-in Nuxeo user.
   */
  getPreviewerUrl(docUid: string, blobXPath = 'file:content'): Observable<string> {
    const nxfileUrl = `${this.cfg.nuxeoInternalUrl}/nxfile/default/${docUid}/${blobXPath}`;
    let viewerUrl = `${this.cfg.viewerOrigin}/?url=${encodeURIComponent(nxfileUrl)}`;
    const user = this.currentUsername();
    if (user) {
      viewerUrl += `&user=${encodeURIComponent(user)}`;
    }
    return of(viewerUrl);
  }

  /**
   * Builds an ARender diff URL for side-by-side document comparison.
   */
  getDiffUrl(leftDocUid: string, rightDocUid: string): Observable<string> {
    const leftUrl = `${this.cfg.nuxeoInternalUrl}/nxfile/default/${leftDocUid}/file:content`;
    const rightUrl = `${this.cfg.nuxeoInternalUrl}/nxfile/default/${rightDocUid}/file:content`;
    let viewerUrl = `${this.cfg.viewerOrigin}/?url=${encodeURIComponent(leftUrl)}&url=${encodeURIComponent(rightUrl)}`;
    const user = this.currentUsername();
    if (user) {
      viewerUrl += `&user=${encodeURIComponent(user)}`;
    }
    return of(viewerUrl);
  }

  /**
   * Checks whether ARender is reachable. Uses `no-cors` fetch to avoid
   * CORS blocks — the promise resolves for any server response and
   * rejects only on a network error (server unreachable).
   */
  isAvailable(): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      fetch(this.cfg.viewerOrigin, { mode: 'no-cors' })
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
