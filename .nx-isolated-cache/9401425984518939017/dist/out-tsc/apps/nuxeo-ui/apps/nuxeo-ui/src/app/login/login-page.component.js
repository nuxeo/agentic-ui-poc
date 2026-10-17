import { ChangeDetectorRef, Component, computed, ElementRef, inject, signal, } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SatLogoModule } from '@hylandsoftware/satori-ui/logo';
import { AppConfigService } from '@nuxeo/satori-platform/app-config';
import { observeStripRedundantMatInputAriaRequired } from '@nuxeo/satori-platform/ui';
import { AuthService, SignInError } from '../auth/auth.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/form-field";
import * as i4 from "@angular/material/input";
import * as i5 from "@angular/material/progress-spinner";
import * as i6 from "@hylandsoftware/satori-ui/logo";
const _forTrack0 = ($index, $item) => $item.id;
function LoginPageComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 5);
} if (rf & 2) {
    i0.ɵɵproperty("src", ctx.url, i0.ɵɵsanitizeUrl);
} }
function LoginPageComponent_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "sat-logo", 6);
    i0.ɵɵelement(1, "sat-h-mark-logo")(2, "sat-word-mark-logo");
    i0.ɵɵelementEnd();
} }
function LoginPageComponent_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "app.login-page.username-is-required"));
} }
function LoginPageComponent_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "app.login-page.password-is-required"));
} }
function LoginPageComponent_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 17);
} }
function LoginPageComponent_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "app.login-page.log-in"), " ");
} }
function LoginPageComponent_Conditional_35_For_8_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 26);
    i0.ɵɵlistener("click", function LoginPageComponent_Conditional_35_For_8_Template_button_click_0_listener() { const ep_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.startSamlLogin(ep_r2)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ep_r2 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ep_r2.label, " ");
} }
function LoginPageComponent_Conditional_35_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 21);
    i0.ɵɵelement(1, "span", 22);
    i0.ɵɵelementStart(2, "span", 23);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(5, "span", 22);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 24);
    i0.ɵɵrepeaterCreate(7, LoginPageComponent_Conditional_35_For_8_Template, 2, 1, "button", 25, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 1, "app.login-page.or"));
    i0.ɵɵadvance(4);
    i0.ɵɵrepeater(ctx_r2.samlEndpoints());
} }
const LAST_USER_KEY = 'agentic_ui_last_username';
export class LoginPageComponent {
    fb = inject(FormBuilder);
    translate = inject(TranslateService);
    auth = inject(AuthService);
    router = inject(Router);
    route = inject(ActivatedRoute);
    snackBar = inject(MatSnackBar);
    host = inject((ElementRef));
    cdr = inject(ChangeDetectorRef);
    appConfig = inject(AppConfigService);
    /** Layer 0 `branding.logo`; `null` keeps the Satori lockup. */
    brandLogo = this.appConfig.brandingLogo;
    /** Accessible name of the brand link when a logo replaces the lockup. */
    brandLabel = computed(() => this.brandLogo()?.alt || this.appConfig.bootstrap().branding.applicationTitle, ...(ngDevMode ? [{ debugName: "brandLabel" }] : []));
    autofillSyncTimeouts = [];
    usernameAriaRequiredObserver = null;
    passwordAriaRequiredObserver = null;
    submitting = signal(false, ...(ngDevMode ? [{ debugName: "submitting" }] : []));
    /** SSO entry points from `nuxeo-sso.providers.ts` / app config. */
    samlEndpoints = this.auth.samlLoginOptions;
    form = this.fb.nonNullable.group({
        username: [
            typeof localStorage !== 'undefined' ? (localStorage.getItem(LAST_USER_KEY) ?? '') : '',
            Validators.required,
        ],
        password: ['', Validators.required],
    });
    constructor() {
        this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
            if (params.get('reason') === 'session-expired') {
                this.snackBar.open(this.translate.instant('app.message.your-session-has-expired-please-sign-in'), this.translate.instant('common.dismiss'), {
                    duration: 8000,
                });
            }
        });
    }
    ngAfterViewInit() {
        // Password managers often autofill after first paint without updating reactive form state.
        this.scheduleAutofillSync();
        this.watchUsernameRequiredAccessibility();
        this.watchPasswordRequiredAccessibility();
    }
    /**
  
     * `withHashLocation()` treats `#login-main` as the router URL; focus the first sign-in
  
     * control without changing the hash (WCAG 2.4.1 skip navigation).
  
     */
    skipToSignIn(event) {
        event.preventDefault();
        const usernameInput = this.host.nativeElement.querySelector('input[formcontrolname="username"]');
        usernameInput?.focus();
    }
    ngOnDestroy() {
        this.usernameAriaRequiredObserver?.disconnect();
        this.usernameAriaRequiredObserver = null;
        this.passwordAriaRequiredObserver?.disconnect();
        this.passwordAriaRequiredObserver = null;
        for (const timeoutId of this.autofillSyncTimeouts) {
            clearTimeout(timeoutId);
        }
    }
    /** NXENG-753: keep native required, drop MatInput's duplicate aria-required on username. */
    watchUsernameRequiredAccessibility() {
        this.usernameAriaRequiredObserver?.disconnect();
        this.usernameAriaRequiredObserver = observeStripRedundantMatInputAriaRequired(this.getCredentialInputs().usernameInput);
    }
    /** NXENG-755: keep native required, drop MatInput's duplicate aria-required on password. */
    watchPasswordRequiredAccessibility() {
        this.passwordAriaRequiredObserver?.disconnect();
        this.passwordAriaRequiredObserver = observeStripRedundantMatInputAriaRequired(this.getCredentialInputs().passwordInput);
    }
    scheduleAutofillSync() {
        for (const delayMs of [0, 100, 300, 800, 1500]) {
            const timeoutId = setTimeout(() => {
                this.syncAutofillFromDom();
                this.cdr.markForCheck();
            }, delayMs);
            this.autofillSyncTimeouts.push(timeoutId);
        }
    }
    /** Keeps reactive form values aligned when the browser autofills credentials. */
    onCredentialInput() {
        this.syncAutofillFromDom();
        this.cdr.markForCheck();
    }
    onAutofillAnimation(event) {
        if (event.animationName.endsWith('login-autofill-start')) {
            this.syncAutofillFromDom();
            this.cdr.markForCheck();
        }
    }
    getCredentialInputs() {
        return {
            usernameInput: this.host.nativeElement.querySelector('input[formcontrolname="username"]'),
            passwordInput: this.host.nativeElement.querySelector('input[formcontrolname="password"]'),
        };
    }
    /** Browsers may paint autofill without exposing input.value to JavaScript yet. */
    isBrowserAutofilled(input) {
        try {
            return input.matches(':-webkit-autofill') || input.matches(':autofill');
        }
        catch {
            return false;
        }
    }
    syncAutofillFromDom() {
        const { usernameInput, passwordInput } = this.getCredentialInputs();
        if (!usernameInput || !passwordInput) {
            return;
        }
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        if (username && username !== this.form.controls.username.value) {
            this.form.controls.username.setValue(username);
        }
        if (password && password !== this.form.controls.password.value) {
            this.form.controls.password.setValue(password);
        }
    }
    /**
     * Right-panel art from `apps/nuxeo-ui/public/images/Login-background.svg`. Relative, so it
     * resolves against `<base href>`: the Marketplace package serves the app from
     * `/nuxeo/agentic-ui/`, where a root-absolute path 404s.
     */
    heroImagePath = 'images/Login-background.svg';
    submit() {
        this.syncAutofillFromDom();
        const { username, password } = this.readCredentials();
        this.form.controls.username.setValue(username);
        this.form.controls.password.setValue(password);
        if (!username || !password || this.submitting()) {
            this.form.markAllAsTouched();
            return;
        }
        this.submitting.set(true);
        localStorage.setItem(LAST_USER_KEY, username);
        // Web UI uses a server cookie session; do not persist credentials in localStorage.
        this.auth.login(username, password, false).subscribe({
            next: () => {
                this.submitting.set(false);
                void this.router.navigateByUrl('/dashboard');
            },
            error: (err) => {
                this.submitting.set(false);
                const message = err instanceof SignInError ? this.translate.instant(err.messageKey) : err.message;
                this.snackBar.open(message, this.translate.instant('common.dismiss'), {
                    duration: 6000,
                });
            },
        });
    }
    startSamlLogin(endpoint) {
        this.auth.startSamlLogin(endpoint);
    }
    submitDisabled() {
        if (this.submitting()) {
            return true;
        }
        return !this.hasValidCredentials();
    }
    hasValidCredentials() {
        const { username, password } = this.readCredentials();
        if (!username) {
            return false;
        }
        if (password) {
            return true;
        }
        const { passwordInput } = this.getCredentialInputs();
        return passwordInput !== null && this.isBrowserAutofilled(passwordInput);
    }
    readCredentials() {
        const fromForm = this.form.getRawValue();
        const { usernameInput, passwordInput } = this.getCredentialInputs();
        return {
            username: (fromForm.username || usernameInput?.value || '').trim(),
            password: fromForm.password || passwordInput?.value || '',
        };
    }
    static ɵfac = function LoginPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || LoginPageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: LoginPageComponent, selectors: [["app-login-page"]], decls: 41, vars: 32, consts: [[1, "login-page"], ["mat-raised-button", "", "href", "#login-main", 1, "login-skip-link", 3, "click"], ["id", "login-main", "tabindex", "-1", 1, "login-panel"], [1, "login-panel-inner"], ["routerLink", "/login", 1, "login-brand"], ["alt", "", "crossorigin", "anonymous", 1, "login-brand-logo", 3, "src"], ["direction", "horizontal", "aria-hidden", "true"], ["id", "login-page-heading", 1, "cdk-visually-hidden"], ["aria-labelledby", "login-page-heading", 1, "login-form", 3, "ngSubmit", "formGroup"], [1, "login-credentials"], [1, "cdk-visually-hidden"], ["appearance", "outline", "subscriptSizing", "dynamic", "hideRequiredMarker", "", 1, "login-field-full", "login-field-username"], ["matInput", "", "formControlName", "username", "autocomplete", "username", 3, "input", "change", "animationstart"], ["appearance", "outline", "subscriptSizing", "dynamic", "hideRequiredMarker", "", 1, "login-field-full", "login-field-password"], ["matInput", "", "type", "password", "formControlName", "password", "autocomplete", "current-password", 3, "input", "change", "animationstart"], [1, "login-actions-row", "login-actions-row--single"], ["mat-flat-button", "", "color", "primary", "type", "submit", "disabledInteractive", "", 1, "login-submit", 3, "disabled"], ["diameter", "20"], [1, "login-footer"], ["role", "presentation", "aria-hidden", "true", 1, "login-hero"], ["alt", "", 1, "login-hero-image", 3, "src"], [1, "login-or"], [1, "login-or-line"], [1, "login-or-text"], [1, "login-sso"], ["type", "button", "mat-stroked-button", "", 1, "login-sso-btn"], ["type", "button", "mat-stroked-button", "", 1, "login-sso-btn", 3, "click"]], template: function LoginPageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "a", 1);
            i0.ɵɵlistener("click", function LoginPageComponent_Template_a_click_1_listener($event) { return ctx.skipToSignIn($event); });
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "main", 2);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵelementStart(6, "div", 3)(7, "a", 4);
            i0.ɵɵpipe(8, "translate");
            i0.ɵɵconditionalCreate(9, LoginPageComponent_Conditional_9_Template, 1, 1, "img", 5)(10, LoginPageComponent_Conditional_10_Template, 3, 0, "sat-logo", 6);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(11, "h1", 7);
            i0.ɵɵtext(12);
            i0.ɵɵpipe(13, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "form", 8);
            i0.ɵɵlistener("ngSubmit", function LoginPageComponent_Template_form_ngSubmit_14_listener() { return ctx.submit(); });
            i0.ɵɵelementStart(15, "fieldset", 9)(16, "legend", 10);
            i0.ɵɵtext(17);
            i0.ɵɵpipe(18, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(19, "mat-form-field", 11)(20, "mat-label");
            i0.ɵɵtext(21);
            i0.ɵɵpipe(22, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(23, "input", 12);
            i0.ɵɵlistener("input", function LoginPageComponent_Template_input_input_23_listener() { return ctx.onCredentialInput(); })("change", function LoginPageComponent_Template_input_change_23_listener() { return ctx.onCredentialInput(); })("animationstart", function LoginPageComponent_Template_input_animationstart_23_listener($event) { return ctx.onAutofillAnimation($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(24, LoginPageComponent_Conditional_24_Template, 3, 3, "mat-error");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(25, "mat-form-field", 13)(26, "mat-label");
            i0.ɵɵtext(27);
            i0.ɵɵpipe(28, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(29, "input", 14);
            i0.ɵɵlistener("input", function LoginPageComponent_Template_input_input_29_listener() { return ctx.onCredentialInput(); })("change", function LoginPageComponent_Template_input_change_29_listener() { return ctx.onCredentialInput(); })("animationstart", function LoginPageComponent_Template_input_animationstart_29_listener($event) { return ctx.onAutofillAnimation($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(30, LoginPageComponent_Conditional_30_Template, 3, 3, "mat-error");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(31, "div", 15)(32, "button", 16);
            i0.ɵɵconditionalCreate(33, LoginPageComponent_Conditional_33_Template, 1, 0, "mat-spinner", 17)(34, LoginPageComponent_Conditional_34_Template, 2, 3);
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(35, LoginPageComponent_Conditional_35_Template, 9, 3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(36, "footer", 18);
            i0.ɵɵtext(37);
            i0.ɵɵpipe(38, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(39, "div", 19);
            i0.ɵɵelement(40, "img", 20);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            let tmp_3_0;
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 16, "login.skip-link"));
            i0.ɵɵadvance(2);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(5, 18, "app.login-page.log-in"));
            i0.ɵɵadvance(3);
            i0.ɵɵattribute("aria-label", ctx.brandLogo() ? ctx.brandLabel() : i0.ɵɵpipeBind1(8, 20, "app.login-page.hyland"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional((tmp_3_0 = ctx.brandLogo()) ? 9 : 10, tmp_3_0);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(13, 22, "app.login-page.log-in"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("formGroup", ctx.form);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(18, 24, "app.login-page.sign-in-credentials"), " ");
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(22, 26, "app.login-page.username-required"));
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.form.controls.username.hasError("required") && ctx.form.controls.username.touched ? 24 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(28, 28, "app.login-page.password-required"));
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.form.controls.password.hasError("required") && ctx.form.controls.password.touched ? 30 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.submitDisabled());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.submitting() ? 33 : 34);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.samlEndpoints().length > 0 ? 35 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(38, 30, "app.login-page.copyright-c-1992-2026-hyland-software"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("src", ctx.heroImagePath, i0.ɵɵsanitizeUrl);
        } }, dependencies: [RouterLink,
            ReactiveFormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.FormGroupDirective, i1.FormControlName, MatButtonModule, i2.MatButton, MatFormFieldModule, i3.MatFormField, i3.MatLabel, i3.MatError, MatInputModule, i4.MatInput, MatProgressSpinnerModule, i5.MatProgressSpinner, MatSnackBarModule,
            TranslateModule,
            SatLogoModule, i6.SatLogo, i6.SatHMarkLogo, i6.SatWordMarkLogo, TranslatePipe], styles: ["\n\n[_nghost-%COMP%] {\n  display: block;\n  min-height: 100vh;\n}\n\n.login-page[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  min-height: 100vh;\n  width: 100%;\n}\n\n\n\n.login-skip-link[_ngcontent-%COMP%] {\n  position: absolute;\n  top: -100%;\n  left: -100%;\n  z-index: 2000;\n  opacity: 0;\n\n  &:focus-visible {\n    position: fixed;\n    top: 24px;\n    left: 24px;\n    opacity: 1;\n  }\n}\n\n.login-panel[_ngcontent-%COMP%] {\n  flex: 1 1 56%;\n  min-width: 0;\n  max-width: 720px;\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n  align-items: center;\n  padding: clamp(2rem, 5vh, 3.5rem) clamp(1.5rem, 6vw, 4rem) clamp(1.5rem, 4vh, 2.5rem);\n  box-sizing: border-box;\n  background: var(--mat-sys-surface, #fff);\n}\n\n.login-panel-inner[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 400px;\n  display: flex;\n  flex-direction: column;\n  gap: 1.25rem;\n  margin-top: auto;\n  margin-bottom: auto;\n  overflow: visible;\n}\n\n.login-brand[_ngcontent-%COMP%] {\n  display: block;\n  align-self: flex-start;\n  margin-bottom: 0.25rem;\n  text-decoration: none;\n  color: inherit;\n}\n\n.login-brand-logo[_ngcontent-%COMP%] {\n  display: block;\n  height: 48px;\n  width: auto;\n  max-width: 240px;\n  object-fit: contain;\n}\n\n.login-form[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n  overflow: visible;\n\n  \n\n  ::ng-deep mat-form-field.login-field-full {\n    overflow: visible;\n\n    &.mat-focused {\n      position: relative;\n      z-index: 2;\n    }\n\n    .mat-mdc-text-field-wrapper {\n      overflow: visible;\n    }\n\n    .mat-mdc-form-field-infix {\n      overflow: visible;\n    }\n\n    input.mat-mdc-input-element {\n      scroll-margin-block: 1.5rem;\n    }\n  }\n}\n\n\n\n.login-credentials[_ngcontent-%COMP%] {\n  border: 0;\n  margin: 0;\n  padding: 0;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 0.375rem;\n}\n\n.login-field-full[_ngcontent-%COMP%] {\n  width: 100%;\n  margin-top: 0.125rem;\n}\n\n\n\n.login-field-username[_ngcontent-%COMP%] {\n  overflow: visible;\n\n  ::ng-deep .mat-mdc-text-field-wrapper,\n  ::ng-deep .mat-mdc-form-field-infix {\n    overflow: visible;\n  }\n\n  ::ng-deep input.mat-mdc-input-element {\n    scroll-margin: 0.5rem;\n  }\n}\n\n\n\n.login-field-full.mat-form-field-invalid[_ngcontent-%COMP%]   .mat-mdc-form-field-error[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 0.25rem;\n  font-weight: 500;\n}\n\n.login-field-full.mat-form-field-invalid[_ngcontent-%COMP%]   .mat-mdc-form-field-error[_ngcontent-%COMP%]::before {\n  content: 'Error:';\n  flex-shrink: 0;\n}\n\n.login-field-full[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:-webkit-autofill {\n  animation-name: _ngcontent-%COMP%_login-autofill-start;\n  animation-duration: 0.01s;\n}\n\n@keyframes _ngcontent-%COMP%_login-autofill-start {\n  from {\n  }\n  to {\n  }\n}\n\n.login-actions-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n  margin-top: 0.25rem;\n}\n\n.login-actions-row--single[_ngcontent-%COMP%] {\n  justify-content: flex-end;\n  margin-top: 0.75rem;\n}\n\n.login-submit[_ngcontent-%COMP%] {\n  min-width: 7.5rem;\n  padding-inline: 1.5rem;\n  border-radius: 9999px;\n  font-weight: 500;\n}\n\n\n\n.login-brand[_ngcontent-%COMP%]:focus-visible, \n.login-sso-btn[_ngcontent-%COMP%]:focus-visible {\n  outline: 2px solid var(--mat-sys-primary, #1565c0);\n  outline-offset: 3px;\n}\n\n//[_ngcontent-%COMP%]   disabledInteractive[_ngcontent-%COMP%]   keeps[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   control[_ngcontent-%COMP%]   focusable[_ngcontent-%COMP%]; Material[_ngcontent-%COMP%]   otherwise[_ngcontent-%COMP%]   hides[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   focus[_ngcontent-%COMP%]   ring.\n.login-submit[_ngcontent-%COMP%]:focus-visible {\n  outline: 2px solid var(--mat-sys-primary, #1565c0);\n  outline-offset: 2px;\n  box-shadow: 0 0 0 4px color-mix(in srgb, var(--mat-sys-primary, #1565c0) 28%, transparent);\n}\n\n.login-submit[_ngcontent-%COMP%]   mat-spinner[_ngcontent-%COMP%] {\n  display: inline-block;\n  vertical-align: middle;\n}\n\n.login-or[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 1rem;\n  margin: 1.25rem 0 0.75rem;\n}\n\n.login-or-line[_ngcontent-%COMP%] {\n  flex: 1;\n  height: 0;\n  border-top: 1px solid var(--mat-sys-outline-variant, #c8c5d3);\n}\n\n.login-or-text[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-weight: 600;\n  letter-spacing: 0.04em;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n}\n\n.login-sso[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.875rem;\n}\n\n.login-sso-btn[_ngcontent-%COMP%] {\n  width: 100%;\n  min-height: 48px;\n  border-radius: 9999px;\n  font-weight: 500;\n  font-size: 0.9375rem;\n}\n\n.login-footer[_ngcontent-%COMP%] {\n  margin: 2rem 0 0;\n  padding-top: 0.5rem;\n  font-size: 0.6875rem;\n  line-height: 1.4;\n  color: var(--mat-sys-on-surface-variant, #757575);\n  text-align: center;\n  width: 100%;\n  max-width: 400px;\n}\n\n.login-hero[_ngcontent-%COMP%] {\n  flex: 1 1 44%;\n  min-width: min(100%, 320px);\n  min-height: 320px;\n  background-color: var(--mat-sys-surface, #fff);\n  overflow: hidden;\n  position: relative;\n}\n\n.login-hero-image[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n  object-position: center center;\n}\n\n\n\n\n\n\n@media (forced-colors: active) {\n  .login-panel[_ngcontent-%COMP%] {\n    background: Canvas;\n    color: CanvasText;\n    border-inline-end: 1px solid CanvasText;\n  }\n\n  .login-or-line[_ngcontent-%COMP%] {\n    border-top-color: CanvasText;\n  }\n\n  .login-brand[_ngcontent-%COMP%]:focus-visible, \n   .login-sso-btn[_ngcontent-%COMP%]:focus-visible, \n   .login-submit[_ngcontent-%COMP%]:focus-visible {\n    outline: 2px solid Highlight;\n    outline-offset: 2px;\n    box-shadow: none;\n  }\n\n  .login-hero-image[_ngcontent-%COMP%] {\n    opacity: 0;\n  }\n}\n\n@media (max-width: 900px) {\n  .login-page[_ngcontent-%COMP%] {\n    flex-direction: column;\n  }\n\n  .login-panel[_ngcontent-%COMP%] {\n    max-width: none;\n    flex: 1 1 auto;\n  }\n\n  .login-hero[_ngcontent-%COMP%] {\n    flex: 0 0 auto;\n    width: 100%;\n    min-height: 220px;\n    order: -1;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(LoginPageComponent, [{
        type: Component,
        args: [{ selector: 'app-login-page', imports: [
                    TranslatePipe,
                    RouterLink,
                    ReactiveFormsModule,
                    MatButtonModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatProgressSpinnerModule,
                    MatSnackBarModule,
                    TranslateModule,
                    SatLogoModule,
                ], template: "<div class=\"login-page\">\n  <a class=\"login-skip-link\" mat-raised-button href=\"#login-main\" (click)=\"skipToSignIn($event)\">{{\n    'login.skip-link' | translate\n  }}</a>\n  <main\n    id=\"login-main\"\n    tabindex=\"-1\"\n    class=\"login-panel\"\n    [attr.aria-label]=\"'app.login-page.log-in' | translate\"\n  >\n    <div class=\"login-panel-inner\">\n      <a\n        routerLink=\"/login\"\n        class=\"login-brand\"\n        [attr.aria-label]=\"brandLogo() ? brandLabel() : ('app.login-page.hyland' | translate)\"\n      >\n        <!--\n          The lockup is decorative: this link already carries the name \"Hyland\". Each mark is a\n          vendor component whose <svg> we cannot label from here, so the whole lockup is hidden\n          from assistive technology instead \u2014 otherwise both SVGs are announced as unnamed\n          images (WCAG 1.1.1, NXENG-743 / NXENG-746). A configured logo is decorative for the\n          same reason: the link is named from branding instead. crossorigin=\"anonymous\": a remote\n          logo that redirects to a Nuxeo URL must not carry the session cookie there.\n        -->\n        @if (brandLogo(); as logo) {\n          <img class=\"login-brand-logo\" [src]=\"logo.url\" alt=\"\" crossorigin=\"anonymous\" />\n        } @else {\n          <sat-logo direction=\"horizontal\" aria-hidden=\"true\">\n            <sat-h-mark-logo />\n            <sat-word-mark-logo />\n          </sat-logo>\n        }\n      </a>\n\n      <h1 id=\"login-page-heading\" class=\"cdk-visually-hidden\">\n        {{ 'app.login-page.log-in' | translate }}\n      </h1>\n\n      <form\n        class=\"login-form\"\n        aria-labelledby=\"login-page-heading\"\n        [formGroup]=\"form\"\n        (ngSubmit)=\"submit()\"\n      >\n        <fieldset class=\"login-credentials\">\n          <legend class=\"cdk-visually-hidden\">\n            {{ 'app.login-page.sign-in-credentials' | translate }}\n          </legend>\n          <mat-form-field\n            appearance=\"outline\"\n            subscriptSizing=\"dynamic\"\n            class=\"login-field-full login-field-username\"\n            hideRequiredMarker\n          >\n            <mat-label>{{ 'app.login-page.username-required' | translate }}</mat-label>\n            <input\n              matInput\n              formControlName=\"username\"\n              autocomplete=\"username\"\n              (input)=\"onCredentialInput()\"\n              (change)=\"onCredentialInput()\"\n              (animationstart)=\"onAutofillAnimation($event)\"\n            />\n            @if (form.controls.username.hasError('required') && form.controls.username.touched) {\n              <mat-error>{{ 'app.login-page.username-is-required' | translate }}</mat-error>\n            }\n          </mat-form-field>\n\n          <mat-form-field\n            appearance=\"outline\"\n            subscriptSizing=\"dynamic\"\n            class=\"login-field-full login-field-password\"\n            hideRequiredMarker\n          >\n            <mat-label>{{ 'app.login-page.password-required' | translate }}</mat-label>\n            <input\n              matInput\n              type=\"password\"\n              formControlName=\"password\"\n              autocomplete=\"current-password\"\n              (input)=\"onCredentialInput()\"\n              (change)=\"onCredentialInput()\"\n              (animationstart)=\"onAutofillAnimation($event)\"\n            />\n            @if (form.controls.password.hasError('required') && form.controls.password.touched) {\n              <mat-error>{{ 'app.login-page.password-is-required' | translate }}</mat-error>\n            }\n          </mat-form-field>\n        </fieldset>\n\n        <div class=\"login-actions-row login-actions-row--single\">\n          <button\n            mat-flat-button\n            color=\"primary\"\n            type=\"submit\"\n            class=\"login-submit\"\n            disabledInteractive\n            [disabled]=\"submitDisabled()\"\n          >\n            @if (submitting()) {\n              <mat-spinner diameter=\"20\" />\n            } @else {\n              {{ 'app.login-page.log-in' | translate }}\n            }\n          </button>\n        </div>\n      </form>\n\n      @if (samlEndpoints().length > 0) {\n        <div class=\"login-or\">\n          <span class=\"login-or-line\"></span>\n          <span class=\"login-or-text\">{{ 'app.login-page.or' | translate }}</span>\n          <span class=\"login-or-line\"></span>\n        </div>\n\n        <div class=\"login-sso\">\n          @for (ep of samlEndpoints(); track ep.id) {\n            <button\n              type=\"button\"\n              mat-stroked-button\n              class=\"login-sso-btn\"\n              (click)=\"startSamlLogin(ep)\"\n            >\n              {{ ep.label }}\n            </button>\n          }\n        </div>\n      }\n    </div>\n\n    <footer class=\"login-footer\">\n      {{ 'app.login-page.copyright-c-1992-2026-hyland-software' | translate }}\n    </footer>\n  </main>\n\n  <div class=\"login-hero\" role=\"presentation\" aria-hidden=\"true\">\n    <!-- Decorative hero: img avoids CSS background-image for HC review; SCSS hides it in forced-colors (NXENG-751). -->\n    <img class=\"login-hero-image\" [src]=\"heroImagePath\" alt=\"\" />\n  </div>\n</div>\n", styles: ["/* Login layout aligned to Hyland Figma: white form column ~56%, SVG hero ~44%. */\n:host {\n  display: block;\n  min-height: 100vh;\n}\n\n.login-page {\n  position: relative;\n  display: flex;\n  min-height: 100vh;\n  width: 100%;\n}\n\n/* WCAG 2.4.1 \u2014 same off-screen-until-focused pattern as sat-skip-to-content (NXENG-745). */\n.login-skip-link {\n  position: absolute;\n  top: -100%;\n  left: -100%;\n  z-index: 2000;\n  opacity: 0;\n\n  &:focus-visible {\n    position: fixed;\n    top: 24px;\n    left: 24px;\n    opacity: 1;\n  }\n}\n\n.login-panel {\n  flex: 1 1 56%;\n  min-width: 0;\n  max-width: 720px;\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n  align-items: center;\n  padding: clamp(2rem, 5vh, 3.5rem) clamp(1.5rem, 6vw, 4rem) clamp(1.5rem, 4vh, 2.5rem);\n  box-sizing: border-box;\n  background: var(--mat-sys-surface, #fff);\n}\n\n.login-panel-inner {\n  width: 100%;\n  max-width: 400px;\n  display: flex;\n  flex-direction: column;\n  gap: 1.25rem;\n  margin-top: auto;\n  margin-bottom: auto;\n  overflow: visible;\n}\n\n.login-brand {\n  display: block;\n  align-self: flex-start;\n  margin-bottom: 0.25rem;\n  text-decoration: none;\n  color: inherit;\n}\n\n.login-brand-logo {\n  display: block;\n  height: 48px;\n  width: auto;\n  max-width: 240px;\n  object-fit: contain;\n}\n\n.login-form {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n  overflow: visible;\n\n  /* WCAG 2.4.11 \u2014 password focus must stay above the username field (IBM element_tabbable_unobscured). */\n  ::ng-deep mat-form-field.login-field-full {\n    overflow: visible;\n\n    &.mat-focused {\n      position: relative;\n      z-index: 2;\n    }\n\n    .mat-mdc-text-field-wrapper {\n      overflow: visible;\n    }\n\n    .mat-mdc-form-field-infix {\n      overflow: visible;\n    }\n\n    input.mat-mdc-input-element {\n      scroll-margin-block: 1.5rem;\n    }\n  }\n}\n\n/* WCAG 1.3.1 \u2014 group related credential inputs (IBM input_fields_grouped). */\n.login-credentials {\n  border: 0;\n  margin: 0;\n  padding: 0;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 0.375rem;\n}\n\n.login-field-full {\n  width: 100%;\n  margin-top: 0.125rem;\n}\n\n/* WCAG 2.4.11 \u2014 username focus must stay visible (IBM element_tabbable_unobscured). */\n.login-field-username {\n  overflow: visible;\n\n  ::ng-deep .mat-mdc-text-field-wrapper,\n  ::ng-deep .mat-mdc-form-field-infix {\n    overflow: visible;\n  }\n\n  ::ng-deep input.mat-mdc-input-element {\n    scroll-margin: 0.5rem;\n  }\n}\n\n/* WCAG 1.4.1: invalid state is not conveyed by outline color alone. */\n.login-field-full.mat-form-field-invalid .mat-mdc-form-field-error {\n  display: flex;\n  align-items: flex-start;\n  gap: 0.25rem;\n  font-weight: 500;\n}\n\n.login-field-full.mat-form-field-invalid .mat-mdc-form-field-error::before {\n  content: 'Error:';\n  flex-shrink: 0;\n}\n\n.login-field-full input:-webkit-autofill {\n  animation-name: login-autofill-start;\n  animation-duration: 0.01s;\n}\n\n@keyframes login-autofill-start {\n  from {\n  }\n  to {\n  }\n}\n\n.login-actions-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n  margin-top: 0.25rem;\n}\n\n.login-actions-row--single {\n  justify-content: flex-end;\n  margin-top: 0.75rem;\n}\n\n.login-submit {\n  min-width: 7.5rem;\n  padding-inline: 1.5rem;\n  border-radius: 9999px;\n  font-weight: 500;\n}\n\n/* WCAG 2.4.7: Material flat buttons suppress the default focus ring. */\n.login-brand:focus-visible,\n.login-sso-btn:focus-visible {\n  outline: 2px solid var(--mat-sys-primary, #1565c0);\n  outline-offset: 3px;\n}\n\n// disabledInteractive keeps the control focusable; Material otherwise hides the focus ring.\n.login-submit:focus-visible {\n  outline: 2px solid var(--mat-sys-primary, #1565c0);\n  outline-offset: 2px;\n  box-shadow: 0 0 0 4px color-mix(in srgb, var(--mat-sys-primary, #1565c0) 28%, transparent);\n}\n\n.login-submit mat-spinner {\n  display: inline-block;\n  vertical-align: middle;\n}\n\n.login-or {\n  display: flex;\n  align-items: center;\n  gap: 1rem;\n  margin: 1.25rem 0 0.75rem;\n}\n\n.login-or-line {\n  flex: 1;\n  height: 0;\n  border-top: 1px solid var(--mat-sys-outline-variant, #c8c5d3);\n}\n\n.login-or-text {\n  font-size: 0.75rem;\n  font-weight: 600;\n  letter-spacing: 0.04em;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n}\n\n.login-sso {\n  display: flex;\n  flex-direction: column;\n  gap: 0.875rem;\n}\n\n.login-sso-btn {\n  width: 100%;\n  min-height: 48px;\n  border-radius: 9999px;\n  font-weight: 500;\n  font-size: 0.9375rem;\n}\n\n.login-footer {\n  margin: 2rem 0 0;\n  padding-top: 0.5rem;\n  font-size: 0.6875rem;\n  line-height: 1.4;\n  color: var(--mat-sys-on-surface-variant, #757575);\n  text-align: center;\n  width: 100%;\n  max-width: 400px;\n}\n\n.login-hero {\n  flex: 1 1 44%;\n  min-width: min(100%, 320px);\n  min-height: 320px;\n  background-color: var(--mat-sys-surface, #fff);\n  overflow: hidden;\n  position: relative;\n}\n\n.login-hero-image {\n  position: absolute;\n  inset: 0;\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n  object-position: center center;\n}\n\n/*\n * Windows high contrast / forced-colors: system palette replaces author colours and drops\n * decorative backgrounds. Keep structure, field boundaries, and focus visible (NXENG-751).\n */\n@media (forced-colors: active) {\n  .login-panel {\n    background: Canvas;\n    color: CanvasText;\n    border-inline-end: 1px solid CanvasText;\n  }\n\n  .login-or-line {\n    border-top-color: CanvasText;\n  }\n\n  .login-brand:focus-visible,\n  .login-sso-btn:focus-visible,\n  .login-submit:focus-visible {\n    outline: 2px solid Highlight;\n    outline-offset: 2px;\n    box-shadow: none;\n  }\n\n  .login-hero-image {\n    opacity: 0;\n  }\n}\n\n@media (max-width: 900px) {\n  .login-page {\n    flex-direction: column;\n  }\n\n  .login-panel {\n    max-width: none;\n    flex: 1 1 auto;\n  }\n\n  .login-hero {\n    flex: 0 0 auto;\n    width: 100%;\n    min-height: 220px;\n    order: -1;\n  }\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(LoginPageComponent, { className: "LoginPageComponent", filePath: "apps/nuxeo-ui/src/app/login/login-page.component.ts", lineNumber: 71 }); })();
