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
export const ADMIN_ACCESS_CHECKS = new InjectionToken<AdminAccessChecks>('ADMIN_ACCESS_CHECKS', {
  providedIn: 'root',
  factory: () => ({
    isAdministrator: () => false,
    isPowerUser: () => false,
    hasAdministrationAccess: () => false,
  }),
});
