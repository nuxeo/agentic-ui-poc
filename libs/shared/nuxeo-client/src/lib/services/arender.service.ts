import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { ARENDER_CONFIG } from '../arender.config';
import { CURRENT_USERNAME } from '../current-user.token';

@Injectable({ providedIn: 'root' })
export class ARenderService {
  private readonly http = inject(HttpClient);
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
   * Checks whether ARender is reachable by fetching its root page.
   */
  isAvailable(): Observable<boolean> {
    return this.http.get(this.cfg.viewerOrigin, { responseType: 'text' }).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }
}
