import { CanActivateFn } from '@angular/router';
/** Allows administrators and powerusers; others go to dashboard. */
export declare const administrationAccessGuard: CanActivateFn;
/** Redirects `/administration` to analytics (admins) or users-groups (powerusers). */
export declare const administrationLandingGuard: CanActivateFn;
/** Blocks powerusers from full-administration routes. */
export declare const fullAdministratorGuard: CanActivateFn;
//# sourceMappingURL=admin-route.guards.d.ts.map