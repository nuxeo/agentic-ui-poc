import { InjectionToken } from '@angular/core';
/**
 * Feature libraries use this token for administration route guards without
 * importing the app-shell `AuthService`.
 */
export const ADMIN_ACCESS_CHECKS = new InjectionToken('ADMIN_ACCESS_CHECKS', {
    providedIn: 'root',
    factory: () => ({
        isAdministrator: () => false,
        isPowerUser: () => false,
        hasAdministrationAccess: () => false,
    }),
});
//# sourceMappingURL=admin-access.token.js.map