import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SatLogoModule } from '@hylandsoftware/satori-ui/logo';

import type { NuxeoSamlLoginEndpoint } from '@agentic-ui/shared/nuxeo-client';

import { AuthService } from '../auth/auth.service';

const LAST_USER_KEY = 'agentic_ui_last_username';

type LoginStep = 'username' | 'credentials';

@Component({
  selector: 'app-login-page',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    SatLogoModule,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly submitting = signal(false);
  readonly step = signal<LoginStep>('username');
  /** SSO entry points from `nuxeo-sso.providers.ts` / app config. */
  readonly samlEndpoints = this.auth.samlLoginOptions;

  readonly form = this.fb.nonNullable.group({
    username: [
      typeof localStorage !== 'undefined' ? (localStorage.getItem(LAST_USER_KEY) ?? '') : '',
      Validators.required,
    ],
    password: [''],
    remember: [true],
  });

  /**
   * Right-panel art from `apps/nuxeo-ui/public/images/Login-background.svg`.
   */
  heroBackgroundImage(): string {
    return `url("${this.heroImagePath}")`;
  }

  protected readonly heroImagePath = '/images/Login-background.svg';

  continueFromUsername(): void {
    const ctrl = this.form.controls.username;
    ctrl.markAsTouched();
    if (ctrl.invalid) {
      return;
    }
    this.form.controls.password.setValidators(Validators.required);
    this.form.controls.password.updateValueAndValidity();
    this.step.set('credentials');
  }

  backToUsername(): void {
    this.step.set('username');
    this.form.controls.password.setValue('');
    this.form.controls.password.clearValidators();
    this.form.controls.password.updateValueAndValidity();
    this.form.controls.password.markAsUntouched();
  }

  onFormSubmit(): void {
    if (this.step() === 'username') {
      this.continueFromUsername();
      return;
    }
    this.submit();
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      return;
    }
    this.submitting.set(true);
    const { username, password, remember } = this.form.getRawValue();
    localStorage.setItem(LAST_USER_KEY, username.trim());

    this.auth.login(username, password, remember).subscribe({
      next: () => {
        this.submitting.set(false);
        void this.router.navigateByUrl('/dashboard');
      },
      error: (err: Error) => {
        this.submitting.set(false);
        this.snackBar.open(err.message, 'Dismiss', { duration: 6000 });
      },
    });
  }

  startSamlLogin(endpoint: NuxeoSamlLoginEndpoint): void {
    this.auth.startSamlLogin(endpoint);
  }

  /** Primary button enabled state per step. */
  primaryDisabled(): boolean {
    if (this.submitting()) {
      return true;
    }
    if (this.step() === 'username') {
      return this.form.controls.username.invalid;
    }
    return this.form.invalid;
  }
}
