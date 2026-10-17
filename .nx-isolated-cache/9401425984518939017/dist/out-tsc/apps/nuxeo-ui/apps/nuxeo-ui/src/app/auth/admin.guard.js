import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';
/** Allows administrators and powerusers after session hydration; others go to dashboard. */
export const adminGuard = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return auth
        .ensureHydrated()
        .pipe(map(() => (auth.hasAdministrationAccess() ? true : router.createUrlTree(['/dashboard']))));
};
