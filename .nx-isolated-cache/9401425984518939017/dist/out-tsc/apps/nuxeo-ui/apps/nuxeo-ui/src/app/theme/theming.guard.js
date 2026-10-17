import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ThemingFeatureFlagService } from './theming-feature-flag.service';
/** Blocks `/settings/themes` outside local development. */
export const themingGuard = () => {
    if (inject(ThemingFeatureFlagService).themingEnabled()) {
        return true;
    }
    return inject(Router).createUrlTree(['/dashboard']);
};
