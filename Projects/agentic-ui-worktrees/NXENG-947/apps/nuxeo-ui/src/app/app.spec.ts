import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { appConfig } from './app.config';
import { AuthService } from './auth/auth.service';

describe('App', () => {
  const authMock = {
    isAuthenticated: signal(true),
    username: signal('test.user'),
    basicCredentials: () => 'dGVzdA==',
    // `undefined` rather than an empty body: `no-empty-function` is right to flag a
    // silent no-op, and this stub genuinely returns nothing.
    logout: () => undefined,
  } as unknown as AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: appConfig.providers,
    })
      .overrideProvider(AuthService, { useValue: authMock })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the root router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });
});
