import { InjectionToken } from '@angular/core';
export interface AdminAccessChecks {
    isAdministrator: () => boolean;
    isPowerUser: () => boolean;
    hasAdministrationAccess: () => boolean;
}
/**
 * Feature libraries use this token for administration route guards without
 * importing the app-shell `AuthService`.
 */
export declare const ADMIN_ACCESS_CHECKS: InjectionToken<AdminAccessChecks>;
//# sourceMappingURL=admin-access.token.d.ts.map