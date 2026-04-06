import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth
    .ensureHydrated()
    .pipe(map(() => (auth.isAuthenticated() ? true : router.createUrlTree(['/login']))));
};

export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth
    .ensureHydrated()
    .pipe(map(() => (!auth.isAuthenticated() ? true : router.createUrlTree(['/dashboard']))));
};
