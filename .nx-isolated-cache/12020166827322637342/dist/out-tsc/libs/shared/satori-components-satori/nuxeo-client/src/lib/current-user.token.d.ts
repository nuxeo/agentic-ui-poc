import { InjectionToken } from '@angular/core';
/**
 * Injection token to provide the current authenticated username.
 * The app shell provides this value from AuthService so that
 * feature libraries can access the current user without importing AuthService directly.
 */
export declare const CURRENT_USERNAME: InjectionToken<() => string | null>;
//# sourceMappingURL=current-user.token.d.ts.map