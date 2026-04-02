import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

import { AuthService } from './auth.service';

/** Allows access only when `AuthService.isAdministrator` reports admin rights; otherwise redirects to `/dashboard`. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdministrator()) {
    return true;
  }
  return router.createUrlTree(['/dashboard']);
};
