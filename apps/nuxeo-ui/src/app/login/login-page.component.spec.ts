import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Observable } from 'rxjs';

import type { NuxeoSamlLoginEndpoint } from '@nuxeo-satori/platform/nuxeo-client';

import { AuthService } from '../auth/auth.service';
import { LoginPageComponent } from './login-page.component';

/**
 * Every element under `root`, following open shadow roots — an element focusable inside one
 * still takes focus away from a keyboard user.
 */
function allDescendants(root: Element): Element[] {
  const found: Element[] = [];
  const visit = (node: Element | ShadowRoot) => {
    // Checked on entry, not per child, so a shadow root attached to `root` itself is
    // traversed too — the caller's own element is exactly where a component under test
    // attaches one.
    if (node instanceof Element && node.shadowRoot) {
      visit(node.shadowRoot);
    }
    for (const child of Array.from(node.children)) {
      found.push(child);
      visit(child);
    }
  };
  visit(root);
  return found;
}

/**
 * Whether an element can actually take focus — asked of the browser, by focusing it.
 *
 * Not a selector list. The first version of this guard enumerated
 * `a[href],button,input,…` and the reviewer was right that such a list is permanently
 * incomplete: it missed `area[href]`, `iframe`, `object`, `audio[controls]`,
 * `video[controls]` and `summary`, and it would miss whatever the next HTML revision makes
 * focusable. `@angular/cdk/a11y`'s `InteractivityChecker` has the same gap, being a
 * maintained list rather than a complete one.
 *
 * These specs run in real Chrome, so focus semantics are available directly, and the
 * question `aria-hidden` actually raises — can a keyboard user land on something inside a
 * subtree screen readers cannot see — is exactly what `focus()` answers.
 *
 * Focus moving anywhere off `<body>` counts: an element inside a shadow root reports its
 * host as `document.activeElement`, so comparing against the element itself would read a
 * real focus move as a miss.
 */
function canTakeFocus(element: Element): boolean {
  (document.activeElement as HTMLElement | null)?.blur();
  (element as HTMLElement).focus?.();
  const took = document.activeElement !== null && document.activeElement !== document.body;
  (document.activeElement as HTMLElement | null)?.blur();
  return took;
}

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

  /**
   * NXENG-743 / NXENG-746. The brand link renders the Satori logo lockup, whose two marks are
   * vendor components each drawing an unlabelled `<svg>`. An `<svg>` with no accessible name is
   * announced as an unnamed image — WCAG 2.1 1.1.1 Non-text Content, level A — and nothing in
   * this repo can put an attribute on that `<svg>`, because the markup belongs to
   * `@hylandsoftware/satori-ui/logo`.
   *
   * The assertion is the guarantee rather than the attribute's placement: no graphic inside the
   * brand link reaches assistive technology, and the link still carries the name. A test for
   * `aria-hidden` on one specific element would pass while a newly added third mark went
   * unhidden.
   *
   * It also enforces both preconditions that make `aria-hidden` the right tool here, rather
   * than leaving them as prose in the PR. `aria-hidden` over focusable content is itself a
   * violation, and a vendor release that adds a focusable element inside the lockup would
   * otherwise introduce `aria_hidden_focus_misuse` with every check still green — the repo's
   * runtime axe harness records the login page as unreachable, so nothing else covers it.
   */
  it('hides the decorative brand logo from assistive technology', () => {
    const link = (fixture.nativeElement as HTMLElement).querySelector('a.login-brand');
    expect(link).toBeTruthy();
    expect(link!.getAttribute('aria-label')).toBe('Hyland');
    // The link itself must stay exposed: it is the only thing that conveys "Hyland".
    expect(link!.closest('[aria-hidden="true"]')).toBeNull();

    const graphics = Array.from(link!.querySelectorAll('svg'));
    expect(graphics).toHaveSize(2);
    for (const svg of graphics) {
      expect(svg.closest('[aria-hidden="true"]')).toBeTruthy();
    }

    const hiddenSubtrees = Array.from(link!.querySelectorAll('[aria-hidden="true"]'));
    expect(hiddenSubtrees).toHaveSize(1);
    for (const hidden of hiddenSubtrees) {
      expect(canTakeFocus(hidden)).toBe(false);
      for (const element of allDescendants(hidden)) {
        expect(canTakeFocus(element)).toBe(false);
      }
    }
  });

  /**
   * The negative control for the guard above, committed rather than run once by hand: an
   * assertion nobody has watched fail is not coverage, and the risk it guards against —
   * a vendor release adding focusable content inside the logo lockup — cannot be staged from
   * our own template, because `<sat-logo>` projects only the two mark components.
   *
   * So the focusable elements are injected into the rendered hidden subtree here. Each is one
   * the earlier hand-written selector missed.
   */
  it('detects focusable content that a vendor release could add inside the hidden lockup', () => {
    const link = (fixture.nativeElement as HTMLElement).querySelector('a.login-brand');
    const hidden = link!.querySelector('[aria-hidden="true"]');
    expect(hidden).toBeTruthy();

    for (const html of [
      '<div tabindex="0">focusable div</div>',
      '<iframe title="probe"></iframe>',
      '<video controls></video>',
      '<audio controls></audio>',
      '<details><summary>probe</summary>body</details>',
      '<a href="#probe">probe</a>',
      '<button type="button">probe</button>',
    ]) {
      hidden!.insertAdjacentHTML('beforeend', html);
      const injected = hidden!.lastElementChild!;
      const reached = [injected, ...allDescendants(injected)].some(canTakeFocus);
      expect(reached)
        .withContext(`the guard must see ${html} as focusable`)
        .toBe(true);
      injected.remove();
    }

    // The same, one level deeper: focusable content inside a shadow root attached to the
    // element the walk starts from. An earlier version of `allDescendants` checked only its
    // children's shadow roots, so this case walked straight past.
    const host = document.createElement('div');
    hidden!.append(host);
    host.attachShadow({ mode: 'open' }).innerHTML = '<button type="button">probe</button>';
    expect([host, ...allDescendants(host)].some(canTakeFocus))
      .withContext('the guard must see focusable content inside a shadow root on the host')
      .toBe(true);
    host.remove();
  });

  it('submits username and password together', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));

    component.form.setValue({ username: 'administrator', password: 'Administrator' });
    component.submit();
    await Promise.resolve();

    expect(auth.login).toHaveBeenCalledWith('administrator', 'Administrator', false);
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

    expect(auth.login).toHaveBeenCalledWith('administrator', 'Administrator', false);
  });

  it('reacts to scoped autofill animation names from emulated encapsulation', () => {
    const el = fixture.nativeElement as HTMLElement;
    const usernameInput = el.querySelector('input[formcontrolname="username"]') as HTMLInputElement;
    const passwordInput = el.querySelector('input[formcontrolname="password"]') as HTMLInputElement;
    usernameInput.value = 'administrator';
    passwordInput.value = 'Administrator';

    component.onAutofillAnimation({
      animationName: 'ng-c1234567890_login-autofill-start',
    } as AnimationEvent);
    fixture.detectChanges();

    expect(component.form.getRawValue()).toEqual({
      username: 'administrator',
      password: 'Administrator',
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

    component.form.setValue({ username: 'bad', password: 'bad' });
    component.submit();

    expect(auth.login).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('Invalid username or password.', 'Dismiss', {
      duration: 6000,
    });
    expect(component.submitting()).toBe(false);
  });
});
