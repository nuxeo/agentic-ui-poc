import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { SessionTimeoutService } from './session-timeout.service';
import { AUTH_TOKEN_HEADER } from './share-token.util';

/** True when the request targets the Nuxeo REST API (relative or same-origin absolute paths). */
function isNuxeoApiRequest(url: string): boolean {
  const pathname = nuxeoRequestPathname(url);
  return pathname !== null && pathname.startsWith('/nuxeo/');
}

function nuxeoRequestPathname(url: string): string | null {
  if (url.startsWith('/')) {
    return url.split('?')[0]?.split('#')[0] ?? url;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      return new URL(url).pathname;
    } catch {
      return null;
    }
  }
  return null;
}

function isNuxeoLogoutRequest(url: string): boolean {
  return nuxeoRequestPathname(url) === '/nuxeo/logout';
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
  // Password login still sends same-origin cookies; stale JSESSIONID is cleared in AuthService
  // before login/hydration via /nuxeo/logout, which must keep withCredentials enabled.
  const isLogout = isNuxeoLogoutRequest(req.url);
  const withCredentials = isLogout ? true : basic ? false : true;
  return next(req.clone({ headers, withCredentials })).pipe(
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
