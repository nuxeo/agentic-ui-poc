import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ADMIN_ACCESS_CHECKS } from './admin-access.token';
/** Allows administrators and powerusers; others go to dashboard. */
export const administrationAccessGuard = () => {
    const access = inject(ADMIN_ACCESS_CHECKS);
    const router = inject(Router);
    if (access.hasAdministrationAccess()) {
        return true;
    }
    return router.createUrlTree(['/dashboard']);
};
/** Redirects `/administration` to analytics (admins) or users-groups (powerusers). */
export const administrationLandingGuard = () => {
    const access = inject(ADMIN_ACCESS_CHECKS);
    const router = inject(Router);
    if (!access.hasAdministrationAccess()) {
        return router.createUrlTree(['/dashboard']);
    }
    const target = access.isAdministrator() ? 'analytics' : 'users-groups';
    return router.createUrlTree(['/administration', target]);
};
/** Blocks powerusers from full-administration routes. */
export const fullAdministratorGuard = () => {
    const access = inject(ADMIN_ACCESS_CHECKS);
    const router = inject(Router);
    if (access.isAdministrator()) {
        return true;
    }
    if (access.isPowerUser()) {
        return router.createUrlTree(['/administration/users-groups']);
    }
    return router.createUrlTree(['/dashboard']);
};
