import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from './auth.service';

/**
 * Sends cookies on `/nuxeo/**` requests (SSO after SAML) and attaches Basic when the user logged in with password.
 */
export const nuxeoAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  if (!req.url.includes('/nuxeo/')) {
    return next(req);
  }
  const basic = auth.basicCredentials();
  let headers = req.headers;
  if (basic) {
    headers = headers.set('Authorization', `Basic ${basic}`);
  }
  return next(req.clone({ headers, withCredentials: true }));
};
