import { TestBed } from '@angular/core/testing';
import { RedirectCommand, Router, type UrlTree, provideRouter } from '@angular/router';
import { isObservable } from 'rxjs';
import { describe, expect, it, afterEach } from 'vitest';

import { ADMIN_ACCESS_CHECKS, type AdminAccessChecks } from './admin-access.token';
import {
  administrationAccessGuard,
  administrationLandingGuard,
  fullAdministratorGuard,
} from './admin-route.guards';

function runGuard(
  guard: typeof administrationAccessGuard,
  checks: AdminAccessChecks,
): boolean | UrlTree {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: ADMIN_ACCESS_CHECKS, useValue: checks }],
  });
  const result = TestBed.runInInjectionContext(() => guard({} as never, {} as never));

  // Angular's `CanActivateFn` returns `MaybeAsync<GuardResult>`, which now also admits a
  // `RedirectCommand` and an async result. These three guards are synchronous, so the
  // helper narrows rather than casting — a guard that became async would fail here
  // instead of being silently unwrapped into a truthy object.
  if (result instanceof Promise || isObservable(result)) {
    throw new Error('These guards are synchronous; the helper cannot unwrap an async result.');
  }
  if (result instanceof RedirectCommand) {
    throw new Error('These guards return a UrlTree, not a RedirectCommand.');
  }
  return result;
}

describe('administrationAccessGuard', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('allows administrators and powerusers', () => {
    expect(
      runGuard(administrationAccessGuard, {
        isAdministrator: () => true,
        isPowerUser: () => false,
        hasAdministrationAccess: () => true,
      }),
    ).toBe(true);

    TestBed.resetTestingModule();

    expect(
      runGuard(administrationAccessGuard, {
        isAdministrator: () => false,
        isPowerUser: () => true,
        hasAdministrationAccess: () => true,
      }),
    ).toBe(true);
  });

  it('redirects other users to dashboard', () => {
    const result = runGuard(administrationAccessGuard, {
      isAdministrator: () => false,
      isPowerUser: () => false,
      hasAdministrationAccess: () => false,
    });
    expect(TestBed.inject(Router).serializeUrl(result as import('@angular/router').UrlTree)).toBe(
      '/dashboard',
    );
  });
});

describe('administrationLandingGuard', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('redirects administrators to analytics', () => {
    const result = runGuard(administrationLandingGuard, {
      isAdministrator: () => true,
      isPowerUser: () => false,
      hasAdministrationAccess: () => true,
    });
    expect(TestBed.inject(Router).serializeUrl(result as import('@angular/router').UrlTree)).toBe(
      '/administration/analytics',
    );
  });

  it('redirects powerusers to users-groups', () => {
    const result = runGuard(administrationLandingGuard, {
      isAdministrator: () => false,
      isPowerUser: () => true,
      hasAdministrationAccess: () => true,
    });
    expect(TestBed.inject(Router).serializeUrl(result as import('@angular/router').UrlTree)).toBe(
      '/administration/users-groups',
    );
  });

  it('redirects users without administration access to dashboard', () => {
    const result = runGuard(administrationLandingGuard, {
      isAdministrator: () => false,
      isPowerUser: () => false,
      hasAdministrationAccess: () => false,
    });
    expect(TestBed.inject(Router).serializeUrl(result as import('@angular/router').UrlTree)).toBe(
      '/dashboard',
    );
  });
});

describe('fullAdministratorGuard', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('allows administrators', () => {
    expect(
      runGuard(fullAdministratorGuard, {
        isAdministrator: () => true,
        isPowerUser: () => false,
        hasAdministrationAccess: () => true,
      }),
    ).toBe(true);
  });

  it('redirects powerusers away from full-admin routes', () => {
    const result = runGuard(fullAdministratorGuard, {
      isAdministrator: () => false,
      isPowerUser: () => true,
      hasAdministrationAccess: () => true,
    });
    expect(TestBed.inject(Router).serializeUrl(result as import('@angular/router').UrlTree)).toBe(
      '/administration/users-groups',
    );
  });
});
