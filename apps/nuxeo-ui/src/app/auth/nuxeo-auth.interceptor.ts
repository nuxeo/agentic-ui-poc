import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { SessionTimeoutService } from './session-timeout.service';

/**
 * Sends cookies on `/nuxeo/**` requests (SSO after SAML) and attaches Basic when the user logged in with password.
 * Resets idle timeout on successful responses and logs out on HTTP 401 when the session is no longer valid.
 */
export const nuxeoAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const sessionTimeout = inject(SessionTimeoutService);
  if (!req.url.includes('/nuxeo/')) {
    return next(req);
  }
  const basic = auth.basicCredentials();
  let headers = req.headers;
  if (basic) {
    headers = headers.set('Authorization', `Basic ${basic}`);
  }
  // Password login still sends same-origin cookies; stale JSESSIONID is cleared in AuthService
  // before login/hydration. Omit cross-site credentials where the browser honors it.
  const withCredentials = basic ? false : true;
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
