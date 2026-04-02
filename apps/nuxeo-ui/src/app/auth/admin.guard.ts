import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

import { AuthService } from './auth.service';

/** Allows access only when Nuxeo reports `isAdministrator` on `/me`. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdministrator()) {
    return true;
  }
  void router.navigateByUrl('/dashboard');
  return false;
};
