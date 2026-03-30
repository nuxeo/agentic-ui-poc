import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;

  if (token && req.url.startsWith(environment.nuxeoUrl)) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Basic ${token}` },
    });
    return next(cloned);
  }
  return next(req);
};
