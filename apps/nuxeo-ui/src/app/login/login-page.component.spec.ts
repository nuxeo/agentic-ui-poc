import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, of, Observable } from 'rxjs';

import type { NuxeoSamlLoginEndpoint } from '@nuxeo-satori/platform/nuxeo-client';

import { AuthService } from '../auth/auth.service';
import { LoginPageComponent } from './login-page.component';
import { testTranslateModule } from '../i18n/translate-testing';

/** Synthetic values for unit tests only — not Nuxeo or dev default credentials. */
const MOCK_LOGIN_USER = 'nxeng-login-spec-user';
const MOCK_LOGIN_SECRET = 'nxeng-login-spec-secret';

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
      imports: [
        testTranslateModule({
          'app.login-page.log-in': 'Log in',
          'app.login-page.sign-in-credentials': 'Sign in credentials',
          'app.login-page.username-required': 'Username (required)',
          'app.login-page.password-required': 'Password (required)',
          'app.login-page.username-is-required': 'Username is required',
          'app.login-page.password-is-required': 'Password is required',
          'app.login-page.copyright-c-1992-2026-hyland-software':
            'Copyright (C) 1992–2026 Hyland Software, Inc.',
          'login.skip-link': 'Skip to sign in',
        }),
        LoginPageComponent,
      ],
      providers: [
        provideRouter([{ path: 'dashboard', component: LoginPageComponent }]),
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();

    await firstValueFrom(TestBed.inject(TranslateService).use('en'));

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('provides a skip link to the sign-in landmark (WCAG 2.4.1)', () => {
    const el = fixture.nativeElement as HTMLElement;
    const skip = el.querySelector('a.login-skip-link');
    expect(skip).toBeTruthy();
    expect(skip?.getAttribute('href')).toBe('#login-main');
    expect(skip?.textContent?.trim()).toContain('Skip to sign in');

    const landmark = el.querySelector('#login-main');
    expect(landmark).toBeTruthy();
    expect(landmark?.getAttribute('tabindex')).toBe('-1');
    expect(landmark?.getAttribute('aria-label')).toBe('Log in');
  });

  it('focuses the username field and cancels navigation when the skip link is activated', () => {
    const el = fixture.nativeElement as HTMLElement;
    const usernameInput = el.querySelector('input[formcontrolname="username"]') as HTMLInputElement;
    const event = new MouseEvent('click', { cancelable: true, bubbles: true });
    const preventSpy = spyOn(event, 'preventDefault').and.callThrough();

    component.skipToSignIn(event);
    fixture.detectChanges();

    expect(preventSpy).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(usernameInput);
  });

  it('does not expose redundant aria-required on password when HTML required is set (NXENG-755)', async () => {
    const passwordInput = fixture.nativeElement.querySelector(
      'input[formcontrolname="password"]',
    ) as HTMLInputElement;

    expect(passwordInput.required).toBe(true);
    expect(passwordInput.getAttribute('aria-required')).toBeNull();

    const strippedAfterMaterialRestore = new Promise<void>((resolve) => {
      const watch = new MutationObserver(() => {
        if (passwordInput.getAttribute('aria-required') === null) {
          watch.disconnect();
          resolve();
        }
      });
      watch.observe(passwordInput, {
        attributes: true,
        attributeFilter: ['aria-required'],
      });
      passwordInput.setAttribute('aria-required', 'true');
    });

    await strippedAfterMaterialRestore;
    expect(passwordInput.getAttribute('aria-required')).toBeNull();
  });

  it('disconnects the password aria-required observer on destroy (NXENG-755)', async () => {
    const passwordInput = fixture.nativeElement.querySelector(
      'input[formcontrolname="password"]',
    ) as HTMLInputElement;

    fixture.destroy();
    passwordInput.setAttribute('aria-required', 'true');
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(passwordInput.getAttribute('aria-required')).toBe('true');
  });

  it('keeps the credential field above siblings when focused (NXENG-749)', () => {
    const secretInput = fixture.nativeElement.querySelector(
      'input[type="password"]',
    ) as HTMLInputElement;
    secretInput.focus();
    fixture.detectChanges();

    const secretField = secretInput.closest('mat-form-field') as HTMLElement;
    const wrapper = secretInput.closest('.mat-mdc-text-field-wrapper') as HTMLElement;
    expect(secretField).toBeTruthy();
    expect(secretField.classList.contains('login-field-password')).toBe(true);
    expect(getComputedStyle(wrapper).overflow).toBe('visible');
    expect(getComputedStyle(secretField).zIndex).toBe('2');
    expect(getComputedStyle(secretField).position).toBe('relative');
    expect(getComputedStyle(secretInput).scrollMarginBlock).not.toBe('0px');
  });

  it('groups username and password in a credentials fieldset (NXENG-752)', () => {
    const el = fixture.nativeElement as HTMLElement;
    const fieldset = el.querySelector('fieldset.login-credentials');
    expect(fieldset).toBeTruthy();
    const legend = fieldset?.querySelector('legend');
    expect(legend?.textContent?.trim()).toBe('Sign in credentials');
    expect(fieldset?.contains(el.querySelector('input[formcontrolname="username"]'))).toBe(true);
    expect(fieldset?.contains(el.querySelector('input[formcontrolname="password"]'))).toBe(true);
    expect(fieldset?.contains(el.querySelector('button.login-submit'))).toBe(false);
  });

  it('shows username required error after empty submit (NXENG-748)', () => {
    component.form.setValue({ username: '', password: '' });
    component.submit();
    fixture.detectChanges();

    const errors = Array.from(fixture.nativeElement.querySelectorAll('mat-error')).map(
      (el) => (el as HTMLElement).textContent?.trim() ?? '',
    );
    expect(errors).toContain('Username is required');
  });

  it('keeps the username outline wrapper from clipping focused input (NXENG-748)', () => {
    const usernameInput = fixture.nativeElement.querySelector(
      'input[formcontrolname="username"]',
    ) as HTMLInputElement;
    usernameInput.focus();
    fixture.detectChanges();

    const wrapper = usernameInput.closest('.mat-mdc-text-field-wrapper') as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(getComputedStyle(wrapper).overflow).toBe('visible');
    expect(getComputedStyle(usernameInput).scrollMarginTop).not.toBe('0px');
  });

  it('exposes a level-one heading for the login page (WCAG 1.3.1)', () => {
    const el = fixture.nativeElement as HTMLElement;
    const heading = el.querySelector('h1.login-title');
    expect(heading).toBeTruthy();
    expect(heading?.textContent?.trim()).toBe('Log in');
  });

  it('uses a decorative img for hero art instead of CSS background-image (NXENG-751)', () => {
    const hero = fixture.nativeElement.querySelector('.login-hero');
    expect(hero).withContext('hero region').not.toBeNull();
    if (!hero) {
      return;
    }
    expect(hero.getAttribute('style')).toBeNull();
    expect(getComputedStyle(hero).backgroundImage).toBe('none');

    const img = hero.querySelector('img.login-hero-image');
    expect(img).withContext('hero image element').not.toBeNull();
    if (!img) {
      return;
    }
    expect(img.getAttribute('alt')).toBe('');
    expect(img.getAttribute('src')).toContain('/images/Login-background.svg');
  });

  it('fills the hero box without expanding it from intrinsic image size (NXENG-751)', () => {
    const hero = fixture.nativeElement.querySelector('.login-hero') as HTMLElement;
    const img = hero.querySelector('.login-hero-image') as HTMLElement;
    expect(getComputedStyle(hero).position).toBe('relative');
    expect(getComputedStyle(img).position).toBe('absolute');
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

  it('names required fields in the label instead of a color-only marker', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Username (required)');
    expect(el.textContent).toContain('Password (required)');
    expect(el.querySelector('.mat-mdc-form-field-required-marker')).toBeNull();
  });

  it('prefixes validation errors with text, not color alone', () => {
    component.form.setValue({ username: '', password: '' });
    component.submit();
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('mat-error') as HTMLElement | null;
    expect(error).withContext('expected a visible mat-error').not.toBeNull();
    expect(error!.textContent?.trim()).toContain('Username is required');
    expect(getComputedStyle(error!, '::before').content).toContain('Error');
  });

  it('submits username and password together', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));

    component.form.setValue({ username: MOCK_LOGIN_USER, password: MOCK_LOGIN_SECRET });
    component.submit();
    await Promise.resolve();

    expect(auth.login).toHaveBeenCalledWith(MOCK_LOGIN_USER, MOCK_LOGIN_SECRET, false);
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
    const submit = (fixture.nativeElement as HTMLElement).querySelector(
      'button.login-submit',
    ) as HTMLButtonElement;
    expect(submit.getAttribute('aria-disabled')).toBe('true');
    expect(submit.disabled).toBe(false);
    expect(submit.tabIndex).toBeGreaterThanOrEqual(0);
  });

  it('enables Log in when username and password are present', () => {
    component.form.setValue({ username: MOCK_LOGIN_USER, password: MOCK_LOGIN_SECRET });
    fixture.detectChanges();

    expect(component.submitDisabled()).toBe(false);
  });

  it('syncs browser-autofilled credentials into the reactive form', () => {
    const el = fixture.nativeElement as HTMLElement;
    const usernameInput = el.querySelector('input[formcontrolname="username"]') as HTMLInputElement;
    const passwordInput = el.querySelector('input[formcontrolname="password"]') as HTMLInputElement;

    component.form.setValue({ username: '', password: '' });
    usernameInput.value = MOCK_LOGIN_USER;
    passwordInput.value = MOCK_LOGIN_SECRET;
    component.onCredentialInput();
    fixture.detectChanges();

    expect(component.form.getRawValue()).toEqual({
      username: MOCK_LOGIN_USER,
      password: MOCK_LOGIN_SECRET,
    });
    expect(component.submitDisabled()).toBe(false);
  });

  it('submits autofilled password even when reactive form was stale', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));

    const el = fixture.nativeElement as HTMLElement;
    const usernameInput = el.querySelector('input[formcontrolname="username"]') as HTMLInputElement;
    const passwordInput = el.querySelector('input[formcontrolname="password"]') as HTMLInputElement;

    component.form.setValue({ username: MOCK_LOGIN_USER, password: '' });
    passwordInput.value = MOCK_LOGIN_SECRET;

    component.submit();
    await Promise.resolve();

    expect(auth.login).toHaveBeenCalledWith(MOCK_LOGIN_USER, MOCK_LOGIN_SECRET, false);
  });

  it('reacts to scoped autofill animation names from emulated encapsulation', () => {
    const el = fixture.nativeElement as HTMLElement;
    const usernameInput = el.querySelector('input[formcontrolname="username"]') as HTMLInputElement;
    const passwordInput = el.querySelector('input[formcontrolname="password"]') as HTMLInputElement;
    usernameInput.value = MOCK_LOGIN_USER;
    passwordInput.value = MOCK_LOGIN_SECRET;

    component.onAutofillAnimation({
      animationName: 'ng-c1234567890_login-autofill-start',
    } as AnimationEvent);
    fixture.detectChanges();

    expect(component.form.getRawValue()).toEqual({
      username: MOCK_LOGIN_USER,
      password: MOCK_LOGIN_SECRET,
    });
  });

  /**
   * NXENG-948 / NXENG-756. Login fields and footer text must live inside a landmark so
   * screen-reader users can navigate by region — WCAG 2.1 1.3.1 (IBM aria_content_in_landmark,
   * issue 3563006691) / axe `region`.
   */
  describe('accessibility', () => {
    it('wraps the login surface in a named main landmark', () => {
      const root = fixture.nativeElement as HTMLElement;
      const main = root.querySelector('main.login-panel');
      expect(main).not.toBeNull();
      expect(main?.getAttribute('id')).toBe('login-main');
      expect(main?.getAttribute('aria-label')).toBe('Log in');
      expect(main?.querySelector('form.login-form')).not.toBeNull();
      expect(main?.querySelector('footer.login-footer')).not.toBeNull();
    });

    it('hides the decorative hero image from assistive technologies', () => {
      const hero = (fixture.nativeElement as HTMLElement).querySelector('.login-hero');
      expect(hero?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('resets submitting and shows snackbar on auth failure', () => {
    const snackBar = fixture.debugElement.injector.get(MatSnackBar);
    spyOn(snackBar, 'open');

    auth.login.and.returnValue(
      new Observable((subscriber) => {
        subscriber.error(new Error('Invalid username or password.'));
      }),
    );

    component.form.setValue({ username: 'bad-user', password: 'bad-secret' });
    component.submit();

    expect(auth.login).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('Invalid username or password.', 'Dismiss', {
      duration: 6000,
    });
    expect(component.submitting()).toBe(false);
  });
});
