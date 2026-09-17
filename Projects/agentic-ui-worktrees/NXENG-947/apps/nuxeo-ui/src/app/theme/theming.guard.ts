import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ThemingFeatureFlagService } from './theming-feature-flag.service';

/** Blocks `/settings/themes` outside local development. */
export const themingGuard: CanActivateFn = () => {
  if (inject(ThemingFeatureFlagService).themingEnabled()) {
    return true;
  }
  return inject(Router).createUrlTree(['/dashboard']);
};
