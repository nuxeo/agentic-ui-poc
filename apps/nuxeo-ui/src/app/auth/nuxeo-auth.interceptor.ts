import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { SessionTimeoutService } from './session-timeout.service';
import { AUTH_TOKEN_HEADER } from './share-token.util';

/** True when the request targets the Nuxeo REST API (relative or same-origin absolute paths). */
function isNuxeoApiRequest(url: string): boolean {
  if (url.startsWith('/nuxeo/')) {
    return true;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      return new URL(url).pathname.startsWith('/nuxeo/');
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Sends cookies on `/nuxeo/**` requests (SSO after SAML) and attaches Basic when the user logged in with password.
 * Resets idle timeout on successful responses and logs out on HTTP 401 when the session is no longer valid.
 */
export const nuxeoAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const sessionTimeout = inject(SessionTimeoutService);
  if (!isNuxeoApiRequest(req.url)) {
    return next(req);
  }
  const basic = auth.basicCredentials();
  const shareToken = auth.shareAuthToken();
  let headers = req.headers;
  if (basic) {
    headers = headers.set('Authorization', `Basic ${basic}`);
  } else if (shareToken && !auth.isAuthenticated()) {
    headers = headers.set(AUTH_TOKEN_HEADER, shareToken);
  }
  return next(req.clone({ headers, withCredentials: true })).pipe(
    tap((event) => {
      if (event instanceof HttpResponse && auth.isAuthenticated()) {
        sessionTimeout.recordActivity();
      }
    }),
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && auth.isAuthenticated()) {
        sessionTimeout.expireDueToServer();
      }
      return throwError(() => err);
    }),
  );
};
