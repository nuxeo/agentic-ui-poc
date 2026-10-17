import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';
export const authGuard = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return auth
        .ensureHydrated()
        .pipe(map(() => (auth.isAuthenticated() ? true : router.createUrlTree(['/login']))));
};
export const loginGuard = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return auth
        .ensureHydrated()
        .pipe(map(() => (!auth.isAuthenticated() ? true : router.createUrlTree(['/dashboard']))));
};
