import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppConfigService } from '@nuxeo/satori-platform/app-config';
import { TemplateSessionService } from '../../template-session.service';
import * as i0 from "@angular/core";
function SignInComponent_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "p", 8);
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
/**
 * Sign in to Nuxeo.
 *
 * The shell renders this instead of the router outlet while there is no session,
 * so no page has to defend itself against an unauthenticated request. A fork on
 * SSO deletes this component and redirects instead — nothing in
 * `@nuxeo/satori-platform` knows it exists.
 *
 * The credential is never a default, a placeholder or a compiled-in value: it is
 * typed by the person signing in and handed straight to
 * `TemplateSessionService`.
 */
export class SignInComponent {
    session = inject(TemplateSessionService);
    config = inject(AppConfigService);
    destroyRef = inject(DestroyRef);
    username = signal('', ...(ngDevMode ? [{ debugName: "username" }] : []));
    password = signal('', ...(ngDevMode ? [{ debugName: "password" }] : []));
    pending = signal(false, ...(ngDevMode ? [{ debugName: "pending" }] : []));
    error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
    applicationTitle = () => this.config.bootstrap().branding.applicationTitle;
    onUsername(event) {
        this.username.set(event.target.value);
    }
    onPassword(event) {
        this.password.set(event.target.value);
    }
    submit(event) {
        event.preventDefault();
        if (this.pending())
            return;
        this.error.set(null);
        this.pending.set(true);
        this.session
            .signIn(this.username().trim(), this.password())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: () => this.pending.set(false),
            error: (error) => {
                this.pending.set(false);
                this.error.set(describeSignInFailure(error));
            },
        });
    }
    static ɵfac = function SignInComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SignInComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SignInComponent, selectors: [["app-sign-in"]], decls: 22, vars: 6, consts: [[1, "sign-in"], [1, "sign-in__title"], [1, "sign-in__lede"], [1, "sign-in__form", 3, "submit"], [1, "sign-in__field"], ["name", "username", "type", "text", "autocomplete", "username", 3, "input", "value"], ["name", "password", "type", "password", "autocomplete", "current-password", 3, "input", "value"], ["type", "submit", 1, "sign-in__submit", 3, "disabled"], ["role", "alert", 1, "sign-in__error"], [1, "sign-in__note"]], template: function SignInComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "section", 0)(1, "h1", 1);
            i0.ɵɵtext(2);
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(3, "p", 2);
            i0.ɵɵtext(4, "Sign in with your Nuxeo account to browse the repository.");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(5, "form", 3);
            i0.ɵɵdomListener("submit", function SignInComponent_Template_form_submit_5_listener($event) { return ctx.submit($event); });
            i0.ɵɵdomElementStart(6, "label", 4)(7, "span");
            i0.ɵɵtext(8, "Username");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(9, "input", 5);
            i0.ɵɵdomListener("input", function SignInComponent_Template_input_input_9_listener($event) { return ctx.onUsername($event); });
            i0.ɵɵdomElementEnd()();
            i0.ɵɵdomElementStart(10, "label", 4)(11, "span");
            i0.ɵɵtext(12, "Password");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(13, "input", 6);
            i0.ɵɵdomListener("input", function SignInComponent_Template_input_input_13_listener($event) { return ctx.onPassword($event); });
            i0.ɵɵdomElementEnd()();
            i0.ɵɵdomElementStart(14, "button", 7);
            i0.ɵɵtext(15);
            i0.ɵɵdomElementEnd()();
            i0.ɵɵconditionalCreate(16, SignInComponent_Conditional_16_Template, 2, 1, "p", 8);
            i0.ɵɵdomElementStart(17, "p", 9);
            i0.ɵɵtext(18, " Authenticated against ");
            i0.ɵɵdomElementStart(19, "code");
            i0.ɵɵtext(20, "GET /nuxeo/api/v1/me");
            i0.ɵɵdomElementEnd();
            i0.ɵɵtext(21, ". Every later request is signed by this application's own HTTP interceptor \u2014 the platform's services never build an auth header themselves. ");
            i0.ɵɵdomElementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.applicationTitle());
            i0.ɵɵadvance(7);
            i0.ɵɵdomProperty("value", ctx.username());
            i0.ɵɵadvance(4);
            i0.ɵɵdomProperty("value", ctx.password());
            i0.ɵɵadvance();
            i0.ɵɵdomProperty("disabled", ctx.pending());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.pending() ? "Signing in\u2026" : "Sign in", " ");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.error() ? 16 : -1);
        } }, styles: [".sign-in[_ngcontent-%COMP%] {\n  max-width: 26rem;\n  margin: 4rem auto;\n  padding: 2rem;\n  border: 1px solid var(--shell-border, #d0d7de);\n  border-radius: 10px;\n  background: var(--shell-surface, #ffffff);\n}\n\n.sign-in__title[_ngcontent-%COMP%] {\n  margin: 0 0 0.25rem;\n  font-size: 1.375rem;\n}\n\n.sign-in__lede[_ngcontent-%COMP%] {\n  margin: 0 0 1.5rem;\n  color: var(--shell-muted, #656d76);\n  font-size: 0.9375rem;\n}\n\n.sign-in__form[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\n\n.sign-in__field[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.375rem;\n  font-size: 0.875rem;\n  font-weight: 600;\n\n  input {\n    padding: 0.5rem 0.625rem;\n    font: inherit;\n    font-weight: 400;\n    color: var(--shell-fg, #1f2328);\n    background: var(--shell-surface, #ffffff);\n    border: 1px solid var(--shell-border, #d0d7de);\n    border-radius: 6px;\n  }\n}\n\n.sign-in__submit[_ngcontent-%COMP%] {\n  padding: 0.5rem 1rem;\n  font: inherit;\n  font-weight: 600;\n  cursor: pointer;\n  color: var(--shell-accent-fg, #ffffff);\n  background: var(--shell-accent, #1f6feb);\n  border: 1px solid var(--shell-accent, #1f6feb);\n  border-radius: 6px;\n\n  &:disabled {\n    cursor: progress;\n    opacity: 0.7;\n  }\n}\n\n.sign-in__error[_ngcontent-%COMP%] {\n  margin: 1rem 0 0;\n  padding: 0.625rem 0.75rem;\n  border-radius: 6px;\n  font-size: 0.875rem;\n  background: var(--shell-warn-bg, #fff8c5);\n  border: 1px solid var(--shell-warn-border, #d4a72c);\n}\n\n.sign-in__note[_ngcontent-%COMP%] {\n  margin: 1.5rem 0 0;\n  font-size: 0.8125rem;\n  line-height: 1.5;\n  color: var(--shell-muted, #656d76);\n\n  code {\n    font-size: 0.78125rem;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SignInComponent, [{
        type: Component,
        args: [{ selector: 'app-sign-in', standalone: true, template: "<section class=\"sign-in\">\n  <h1 class=\"sign-in__title\">{{ applicationTitle() }}</h1>\n  <p class=\"sign-in__lede\">Sign in with your Nuxeo account to browse the repository.</p>\n\n  <form class=\"sign-in__form\" (submit)=\"submit($event)\">\n    <label class=\"sign-in__field\">\n      <span>Username</span>\n      <input\n        name=\"username\"\n        type=\"text\"\n        autocomplete=\"username\"\n        [value]=\"username()\"\n        (input)=\"onUsername($event)\"\n      />\n    </label>\n\n    <label class=\"sign-in__field\">\n      <span>Password</span>\n      <input\n        name=\"password\"\n        type=\"password\"\n        autocomplete=\"current-password\"\n        [value]=\"password()\"\n        (input)=\"onPassword($event)\"\n      />\n    </label>\n\n    <button class=\"sign-in__submit\" type=\"submit\" [disabled]=\"pending()\">\n      {{ pending() ? 'Signing in\u2026' : 'Sign in' }}\n    </button>\n  </form>\n\n  @if (error()) {\n    <p class=\"sign-in__error\" role=\"alert\">{{ error() }}</p>\n  }\n\n  <p class=\"sign-in__note\">\n    Authenticated against <code>GET /nuxeo/api/v1/me</code>. Every later request is signed by this\n    application's own HTTP interceptor \u2014 the platform's services never build an auth header\n    themselves.\n  </p>\n</section>\n", styles: [".sign-in {\n  max-width: 26rem;\n  margin: 4rem auto;\n  padding: 2rem;\n  border: 1px solid var(--shell-border, #d0d7de);\n  border-radius: 10px;\n  background: var(--shell-surface, #ffffff);\n}\n\n.sign-in__title {\n  margin: 0 0 0.25rem;\n  font-size: 1.375rem;\n}\n\n.sign-in__lede {\n  margin: 0 0 1.5rem;\n  color: var(--shell-muted, #656d76);\n  font-size: 0.9375rem;\n}\n\n.sign-in__form {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\n\n.sign-in__field {\n  display: flex;\n  flex-direction: column;\n  gap: 0.375rem;\n  font-size: 0.875rem;\n  font-weight: 600;\n\n  input {\n    padding: 0.5rem 0.625rem;\n    font: inherit;\n    font-weight: 400;\n    color: var(--shell-fg, #1f2328);\n    background: var(--shell-surface, #ffffff);\n    border: 1px solid var(--shell-border, #d0d7de);\n    border-radius: 6px;\n  }\n}\n\n.sign-in__submit {\n  padding: 0.5rem 1rem;\n  font: inherit;\n  font-weight: 600;\n  cursor: pointer;\n  color: var(--shell-accent-fg, #ffffff);\n  background: var(--shell-accent, #1f6feb);\n  border: 1px solid var(--shell-accent, #1f6feb);\n  border-radius: 6px;\n\n  &:disabled {\n    cursor: progress;\n    opacity: 0.7;\n  }\n}\n\n.sign-in__error {\n  margin: 1rem 0 0;\n  padding: 0.625rem 0.75rem;\n  border-radius: 6px;\n  font-size: 0.875rem;\n  background: var(--shell-warn-bg, #fff8c5);\n  border: 1px solid var(--shell-warn-border, #d4a72c);\n}\n\n.sign-in__note {\n  margin: 1.5rem 0 0;\n  font-size: 0.8125rem;\n  line-height: 1.5;\n  color: var(--shell-muted, #656d76);\n\n  code {\n    font-size: 0.78125rem;\n  }\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SignInComponent, { className: "SignInComponent", filePath: "apps/nuxeo-satori-template/src/app/pages/sign-in/sign-in.ts", lineNumber: 27 }); })();
/**
 * Distinguish the three failures that look identical to a user but need
 * different action: wrong credential, no server, and everything else.
 */
function describeSignInFailure(error) {
    if (error instanceof HttpErrorResponse) {
        if (error.status === 401)
            return 'Nuxeo rejected that username and password.';
        if (error.status === 0) {
            return 'Could not reach Nuxeo. Check that the server is running and that this application is served through its proxy.';
        }
        return `Nuxeo answered HTTP ${error.status}.`;
    }
    return 'Sign-in failed.';
}
