import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Observable } from 'rxjs';

import type { NuxeoSamlLoginEndpoint } from '@agentic-ui/shared/nuxeo-client';

import { AuthService } from '../auth/auth.service';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let fixture: ComponentFixture<LoginPageComponent>;
  let component: LoginPageComponent;
  let auth: jasmine.SpyObj<Pick<AuthService, 'login' | 'startSamlLogin' | 'samlLoginOptions'>>;
  const samlEndpoint: NuxeoSamlLoginEndpoint = {
    id: 'azure',
    label: 'Azure SAML',
    path: '/nuxeo/login/azure',
  };

  beforeEach(async () => {
    auth = jasmine.createSpyObj('AuthService', ['login', 'startSamlLogin']);
    auth.login.and.returnValue(of(undefined));
    Object.defineProperty(auth, 'samlLoginOptions', {
      get: () => signal([]),
    });

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideRouter([{ path: 'dashboard', component: LoginPageComponent }]),
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows username and password on one form (Web UI parity)', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('input[formcontrolname="username"]')).toBeTruthy();
    expect(el.querySelector('input[formcontrolname="password"]')).toBeTruthy();
    expect(el.textContent).not.toContain('Forgot Password?');
    expect(el.textContent).not.toContain('Remember Me');
    expect(el.textContent).not.toContain('Azure SAML');
    expect(el.textContent).not.toContain('Okta SAML');
    expect(el.textContent).toContain('Log in');
  });

  it('submits username and password together', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));

    component.form.setValue({ username: 'administrator', password: 'Administrator' });
    component.submit();
    await Promise.resolve();

    expect(auth.login).toHaveBeenCalledWith('administrator', 'Administrator', true);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('does not submit when fields are empty', () => {
    component.form.setValue({ username: '', password: '' });
    component.submit();

    expect(auth.login).not.toHaveBeenCalled();
  });

  it('starts SAML login for external providers', () => {
    component.startSamlLogin(samlEndpoint);
    expect(auth.startSamlLogin).toHaveBeenCalledWith(samlEndpoint);
  });

  it('disables Log in when required fields are empty', () => {
    component.form.setValue({ username: '', password: '' });
    fixture.detectChanges();

    expect(component.submitDisabled()).toBe(true);
  });

  it('enables Log in when username and password are present', () => {
    component.form.setValue({ username: 'administrator', password: 'Administrator' });
    fixture.detectChanges();

    expect(component.submitDisabled()).toBe(false);
  });

  it('syncs browser-autofilled credentials into the reactive form', () => {
    const el = fixture.nativeElement as HTMLElement;
    const usernameInput = el.querySelector('input[formcontrolname="username"]') as HTMLInputElement;
    const passwordInput = el.querySelector('input[formcontrolname="password"]') as HTMLInputElement;

    component.form.setValue({ username: '', password: '' });
    usernameInput.value = 'administrator';
    passwordInput.value = 'Administrator';
    component.onCredentialInput();
    fixture.detectChanges();

    expect(component.form.getRawValue()).toEqual({
      username: 'administrator',
      password: 'Administrator',
    });
    expect(component.submitDisabled()).toBe(false);
  });

  it('submits autofilled password even when reactive form was stale', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));

    const el = fixture.nativeElement as HTMLElement;
    const usernameInput = el.querySelector('input[formcontrolname="username"]') as HTMLInputElement;
    const passwordInput = el.querySelector('input[formcontrolname="password"]') as HTMLInputElement;

    component.form.setValue({ username: 'administrator', password: '' });
    passwordInput.value = 'Administrator';

    component.submit();
    await Promise.resolve();

    expect(auth.login).toHaveBeenCalledWith('administrator', 'Administrator', true);
  });

  it('resets submitting and shows snackbar on auth failure', () => {
    const snackBar = fixture.debugElement.injector.get(MatSnackBar);
    spyOn(snackBar, 'open');

    auth.login.and.returnValue(
      new Observable((subscriber) => {
        subscriber.error(new Error('Invalid username or password.'));
      }),
    );

    component.form.setValue({ username: 'bad', password: 'bad' });
    component.submit();

    expect(auth.login).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('Invalid username or password.', 'Dismiss', {
      duration: 6000,
    });
    expect(component.submitting()).toBe(false);
  });
});
