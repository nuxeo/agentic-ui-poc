import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app';
import { appConfig } from './app.config';
import { AuthService } from './auth/auth.service';

describe('AppComponent', () => {
  const authMock = {
    isAuthenticated: signal(true),
    username: signal('test.user'),
    basicCredentials: () => 'dGVzdA==',
    logout: jasmine.createSpy('logout'),
  } as unknown as AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: appConfig.providers,
    })
      .overrideProvider(AuthService, { useValue: authMock })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the root router outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });
});
