import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from './auth.service';

/**
 * Attaches Nuxeo Basic credentials to same-origin `/nuxeo/**` requests.
 */
export const nuxeoAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const basic = auth.basicCredentials();
  if (!basic || !req.url.includes('/nuxeo/')) {
    return next(req);
  }
  return next(
    req.clone({
      setHeaders: { Authorization: `Basic ${basic}` },
    }),
  );
};
