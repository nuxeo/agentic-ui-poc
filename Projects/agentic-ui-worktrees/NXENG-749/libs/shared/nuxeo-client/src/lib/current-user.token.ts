import { InjectionToken } from '@angular/core';

/**
 * Injection token to provide the current authenticated username.
 * The app shell provides this value from AuthService so that
 * feature libraries can access the current user without importing AuthService directly.
 */
export const CURRENT_USERNAME = new InjectionToken<() => string | null>(
  'CURRENT_USERNAME',
  {
    providedIn: 'root',
    factory: () => () => null,
  },
);
