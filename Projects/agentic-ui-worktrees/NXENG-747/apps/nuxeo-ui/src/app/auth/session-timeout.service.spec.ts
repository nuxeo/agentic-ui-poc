import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';

import { AuthService } from './auth.service';
import { SESSION_TIMEOUT_CONFIG } from './session-timeout.config';
import { SessionTimeoutService } from './session-timeout.service';

describe('SessionTimeoutService', () => {
  let service: SessionTimeoutService;
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let afterClosed$: Subject<boolean | undefined>;

  const idleTimeoutMs = 5_000;
  const warningBeforeMs = 2_000;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated', 'logout']);
    auth.isAuthenticated.and.returnValue(true);

    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve(true));

    afterClosed$ = new Subject<boolean | undefined>();
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    dialog.open.and.returnValue({
      afterClosed: () => afterClosed$.asObservable(),
      close: () => {
        afterClosed$.next(undefined);
        afterClosed$.complete();
      },
    } as never);

    TestBed.configureTestingModule({
      providers: [
        SessionTimeoutService,
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
        { provide: MatDialog, useValue: dialog },
        {
          provide: SESSION_TIMEOUT_CONFIG,
          useValue: { idleTimeoutMs, warningBeforeMs },
        },
      ],
    });

    service = TestBed.inject(SessionTimeoutService);
  });

  afterEach(() => {
    service.stop();
  });

  it('starts idle tracking when authenticated', () => {
    service.start();
    expect(service).toBeTruthy();
    service.stop();
    expect(auth.logout).not.toHaveBeenCalled();
  });

  it('does not start when the user is not authenticated', fakeAsync(() => {
    auth.isAuthenticated.and.returnValue(false);
    service.start();
    tick(idleTimeoutMs);
    expect(auth.logout).not.toHaveBeenCalled();
  }));

  it('logs out after the full idle period', fakeAsync(() => {
    service.start();
    tick(idleTimeoutMs);
    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { reason: 'session-expired' },
    });
  }));

  it('resets the idle countdown after recordActivity', fakeAsync(() => {
    service.start();
    tick(2_000);
    service.recordActivity();
    tick(4_999);
    expect(auth.logout).not.toHaveBeenCalled();
    tick(1);
    expect(auth.logout).toHaveBeenCalled();
  }));

  it('opens a warning dialog before logout', fakeAsync(() => {
    dialog.open.and.returnValue({
      afterClosed: () => of(true),
      close: () => undefined,
    } as never);

    service.start();
    tick(idleTimeoutMs - warningBeforeMs);
    expect(dialog.open).toHaveBeenCalled();
    tick(warningBeforeMs);
    expect(auth.logout).not.toHaveBeenCalled();
  }));

  it('expires immediately when the server reports an invalid session', () => {
    service.start();
    service.expireDueToServer();
    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { reason: 'session-expired' },
    });
  });

  it('can expire again after a new session starts', () => {
    service.expireDueToServer();
    expect(auth.logout).toHaveBeenCalledTimes(1);

    auth.logout.calls.reset();
    router.navigate.calls.reset();
    auth.isAuthenticated.and.returnValue(true);

    service.start();
    service.expireDueToServer();
    expect(auth.logout).toHaveBeenCalledTimes(1);
  });

  it('logs out after idleTimeoutMs when warningBeforeMs exceeds idleTimeoutMs', fakeAsync(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        SessionTimeoutService,
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
        { provide: MatDialog, useValue: dialog },
        {
          provide: SESSION_TIMEOUT_CONFIG,
          useValue: { idleTimeoutMs: 3_000, warningBeforeMs: 10_000 },
        },
      ],
    });
    service = TestBed.inject(SessionTimeoutService);

    service.start();
    tick(3_000);
    expect(auth.logout).toHaveBeenCalled();
  }));
});
