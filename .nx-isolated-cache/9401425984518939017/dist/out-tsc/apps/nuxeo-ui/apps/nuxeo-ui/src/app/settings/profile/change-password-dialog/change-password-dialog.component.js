import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SettingsService } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/dialog";
import * as i3 from "@angular/material/form-field";
import * as i4 from "@angular/material/input";
import * as i5 from "@angular/material/button";
import * as i6 from "@angular/material/icon";
function ChangePasswordDialogComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function ChangePasswordDialogComponent_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "app.change-password-dialog.current-password-is-required"));
} }
function ChangePasswordDialogComponent_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "app.change-password-dialog.new-password-must-be-at-least"));
} }
function ChangePasswordDialogComponent_Conditional_38_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "app.change-password-dialog.passwords-do-not-match"));
} }
function passwordsMatch(control) {
    const newPwd = control.get('newPassword')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return newPwd && confirm && newPwd !== confirm ? { passwordsMismatch: true } : null;
}
export class ChangePasswordDialogComponent {
    dialogRef = inject((MatDialogRef));
    translate = inject(TranslateService);
    settingsService = inject(SettingsService);
    fb = inject(FormBuilder);
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
    showOld = signal(false, ...(ngDevMode ? [{ debugName: "showOld" }] : []));
    showNew = signal(false, ...(ngDevMode ? [{ debugName: "showNew" }] : []));
    showConfirm = signal(false, ...(ngDevMode ? [{ debugName: "showConfirm" }] : []));
    form = this.fb.group({
        oldPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(4)]],
        confirmPassword: ['', Validators.required],
    }, { validators: passwordsMatch });
    save() {
        if (this.form.invalid || this.saving())
            return;
        this.saving.set(true);
        this.error.set(null);
        const oldPassword = this.form.value.oldPassword ?? '';
        const newPassword = this.form.value.newPassword ?? '';
        this.settingsService.changePassword(oldPassword, newPassword).subscribe({
            next: () => this.dialogRef.close(true),
            error: () => {
                this.error.set(this.translate.instant('app.message.failed-to-change-password-please-check-your'));
                this.saving.set(false);
            },
        });
    }
    cancel() {
        this.dialogRef.close(false);
    }
    static ɵfac = function ChangePasswordDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ChangePasswordDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ChangePasswordDialogComponent, selectors: [["app-change-password-dialog"]], decls: 46, vars: 45, consts: [["mat-dialog-title", "", "role", "heading", "aria-level", "2"], [1, "cpd-error"], ["id", "cpd-form", 3, "ngSubmit", "formGroup"], ["appearance", "outline", 1, "cpd-field"], ["matInput", "", "formControlName", "oldPassword", "autocomplete", "current-password", 3, "type"], ["mat-icon-button", "", "matSuffix", "", "type", "button", 3, "click"], ["matInput", "", "formControlName", "newPassword", "autocomplete", "new-password", 3, "type"], ["matInput", "", "formControlName", "confirmPassword", "autocomplete", "new-password", 3, "type"], ["mat-button", "", "type", "button", 3, "click"], ["mat-flat-button", "", "color", "primary", "type", "submit", "form", "cpd-form", 3, "disabled"]], template: function ChangePasswordDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content");
            i0.ɵɵconditionalCreate(4, ChangePasswordDialogComponent_Conditional_4_Template, 2, 1, "p", 1);
            i0.ɵɵelementStart(5, "form", 2);
            i0.ɵɵlistener("ngSubmit", function ChangePasswordDialogComponent_Template_form_ngSubmit_5_listener() { return ctx.save(); });
            i0.ɵɵelementStart(6, "mat-form-field", 3)(7, "mat-label");
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(10, "input", 4);
            i0.ɵɵelementStart(11, "button", 5);
            i0.ɵɵpipe(12, "translate");
            i0.ɵɵpipe(13, "translate");
            i0.ɵɵlistener("click", function ChangePasswordDialogComponent_Template_button_click_11_listener() { return ctx.showOld.set(!ctx.showOld()); });
            i0.ɵɵelementStart(14, "mat-icon");
            i0.ɵɵtext(15);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(16, ChangePasswordDialogComponent_Conditional_16_Template, 3, 3, "mat-error");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "mat-form-field", 3)(18, "mat-label");
            i0.ɵɵtext(19);
            i0.ɵɵpipe(20, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(21, "input", 6);
            i0.ɵɵelementStart(22, "button", 5);
            i0.ɵɵpipe(23, "translate");
            i0.ɵɵpipe(24, "translate");
            i0.ɵɵlistener("click", function ChangePasswordDialogComponent_Template_button_click_22_listener() { return ctx.showNew.set(!ctx.showNew()); });
            i0.ɵɵelementStart(25, "mat-icon");
            i0.ɵɵtext(26);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(27, ChangePasswordDialogComponent_Conditional_27_Template, 3, 3, "mat-error");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(28, "mat-form-field", 3)(29, "mat-label");
            i0.ɵɵtext(30);
            i0.ɵɵpipe(31, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(32, "input", 7);
            i0.ɵɵelementStart(33, "button", 5);
            i0.ɵɵpipe(34, "translate");
            i0.ɵɵpipe(35, "translate");
            i0.ɵɵlistener("click", function ChangePasswordDialogComponent_Template_button_click_33_listener() { return ctx.showConfirm.set(!ctx.showConfirm()); });
            i0.ɵɵelementStart(36, "mat-icon");
            i0.ɵɵtext(37);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(38, ChangePasswordDialogComponent_Conditional_38_Template, 3, 3, "mat-error");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(39, "mat-dialog-actions")(40, "button", 8);
            i0.ɵɵlistener("click", function ChangePasswordDialogComponent_Template_button_click_40_listener() { return ctx.cancel(); });
            i0.ɵɵtext(41);
            i0.ɵɵpipe(42, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(43, "button", 9);
            i0.ɵɵtext(44);
            i0.ɵɵpipe(45, "translate");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            let tmp_7_0;
            let tmp_12_0;
            let tmp_17_0;
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 21, "app.change-password-dialog.change-password"), "\n");
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.error() ? 4 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("formGroup", ctx.form);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 23, "app.change-password-dialog.current-password"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("type", ctx.showOld() ? "text" : "password");
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-label", ctx.showOld() ? i0.ɵɵpipeBind1(12, 25, "settings.hide-password") : i0.ɵɵpipeBind1(13, 27, "settings.show-password"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(ctx.showOld() ? "visibility_off" : "visibility");
            i0.ɵɵadvance();
            i0.ɵɵconditional(((tmp_7_0 = ctx.form.get("oldPassword")) == null ? null : tmp_7_0.invalid) && ((tmp_7_0 = ctx.form.get("oldPassword")) == null ? null : tmp_7_0.touched) ? 16 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 29, "app.change-password-dialog.new-password"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("type", ctx.showNew() ? "text" : "password");
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-label", ctx.showNew() ? i0.ɵɵpipeBind1(23, 31, "settings.hide-password") : i0.ɵɵpipeBind1(24, 33, "settings.show-password"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(ctx.showNew() ? "visibility_off" : "visibility");
            i0.ɵɵadvance();
            i0.ɵɵconditional(((tmp_12_0 = ctx.form.get("newPassword")) == null ? null : tmp_12_0.invalid) && ((tmp_12_0 = ctx.form.get("newPassword")) == null ? null : tmp_12_0.touched) ? 27 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(31, 35, "app.change-password-dialog.confirm-new-password"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("type", ctx.showConfirm() ? "text" : "password");
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-label", ctx.showConfirm() ? i0.ɵɵpipeBind1(34, 37, "settings.hide-password") : i0.ɵɵpipeBind1(35, 39, "settings.show-password"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(ctx.showConfirm() ? "visibility_off" : "visibility");
            i0.ɵɵadvance();
            i0.ɵɵconditional((ctx.form.errors == null ? null : ctx.form.errors["passwordsMismatch"]) && ((tmp_17_0 = ctx.form.get("confirmPassword")) == null ? null : tmp_17_0.touched) ? 38 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(42, 41, "app.change-password-dialog.cancel"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.form.invalid || ctx.saving());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.saving() ? "Saving\u2026" : i0.ɵɵpipeBind1(45, 43, "settings.save-changes"), " ");
        } }, dependencies: [ReactiveFormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.FormGroupDirective, i1.FormControlName, MatDialogModule, i2.MatDialogTitle, i2.MatDialogActions, i2.MatDialogContent, MatFormFieldModule, i3.MatFormField, i3.MatLabel, i3.MatError, i3.MatSuffix, MatInputModule, i4.MatInput, MatButtonModule, i5.MatButton, i5.MatIconButton, MatIconModule, i6.MatIcon, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: contents;\n}\n\n.cpd-error[_ngcontent-%COMP%] {\n  margin: 0 0 1rem;\n  padding: 0.65rem 0.85rem;\n  border-radius: 6px;\n  background: #fff3f2;\n  color: #b42318;\n  font-size: 0.875rem;\n}\n\n.cpd-field[_ngcontent-%COMP%] {\n  display: block;\n  width: calc(100% - 1rem);\n  margin: 0 auto 1.25rem;\n}\n\nmat-dialog-content[_ngcontent-%COMP%] {\n  min-width: 440px;\n  min-height: 320px;\n  padding-top: 1.25rem;\n  padding-bottom: 1.5rem;\n  padding-left: 0.5rem;\n  padding-right: 0.5rem;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  overflow-x: hidden;\n}\n\nform[_ngcontent-%COMP%] {\n  overflow-x: hidden;\n}\n\nmat-dialog-actions[_ngcontent-%COMP%] {\n  justify-content: space-between;\n  padding: 0.75rem 1.5rem 1rem;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ChangePasswordDialogComponent, [{
        type: Component,
        args: [{ selector: 'app-change-password-dialog', standalone: true, imports: [
                    TranslatePipe,
                    ReactiveFormsModule,
                    MatDialogModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatButtonModule,
                    MatIconModule,
                ], template: "<div mat-dialog-title role=\"heading\" aria-level=\"2\">\n  {{ 'app.change-password-dialog.change-password' | translate }}\n</div>\n\n<mat-dialog-content>\n  @if (error()) {\n    <p class=\"cpd-error\">{{ error() }}</p>\n  }\n  <form [formGroup]=\"form\" id=\"cpd-form\" (ngSubmit)=\"save()\">\n    <mat-form-field appearance=\"outline\" class=\"cpd-field\">\n      <mat-label>{{ 'app.change-password-dialog.current-password' | translate }}</mat-label>\n      <input\n        matInput\n        formControlName=\"oldPassword\"\n        [type]=\"showOld() ? 'text' : 'password'\"\n        autocomplete=\"current-password\"\n      />\n      <button\n        mat-icon-button\n        matSuffix\n        type=\"button\"\n        (click)=\"showOld.set(!showOld())\"\n        [attr.aria-label]=\"\n          showOld()\n            ? ('settings.hide-password' | translate)\n            : ('settings.show-password' | translate)\n        \"\n      >\n        <mat-icon>{{ showOld() ? 'visibility_off' : 'visibility' }}</mat-icon>\n      </button>\n      @if (form.get('oldPassword')?.invalid && form.get('oldPassword')?.touched) {\n        <mat-error>{{\n          'app.change-password-dialog.current-password-is-required' | translate\n        }}</mat-error>\n      }\n    </mat-form-field>\n\n    <mat-form-field appearance=\"outline\" class=\"cpd-field\">\n      <mat-label>{{ 'app.change-password-dialog.new-password' | translate }}</mat-label>\n      <input\n        matInput\n        formControlName=\"newPassword\"\n        [type]=\"showNew() ? 'text' : 'password'\"\n        autocomplete=\"new-password\"\n      />\n      <button\n        mat-icon-button\n        matSuffix\n        type=\"button\"\n        (click)=\"showNew.set(!showNew())\"\n        [attr.aria-label]=\"\n          showNew()\n            ? ('settings.hide-password' | translate)\n            : ('settings.show-password' | translate)\n        \"\n      >\n        <mat-icon>{{ showNew() ? 'visibility_off' : 'visibility' }}</mat-icon>\n      </button>\n      @if (form.get('newPassword')?.invalid && form.get('newPassword')?.touched) {\n        <mat-error>{{\n          'app.change-password-dialog.new-password-must-be-at-least' | translate\n        }}</mat-error>\n      }\n    </mat-form-field>\n\n    <mat-form-field appearance=\"outline\" class=\"cpd-field\">\n      <mat-label>{{ 'app.change-password-dialog.confirm-new-password' | translate }}</mat-label>\n      <input\n        matInput\n        formControlName=\"confirmPassword\"\n        [type]=\"showConfirm() ? 'text' : 'password'\"\n        autocomplete=\"new-password\"\n      />\n      <button\n        mat-icon-button\n        matSuffix\n        type=\"button\"\n        (click)=\"showConfirm.set(!showConfirm())\"\n        [attr.aria-label]=\"\n          showConfirm()\n            ? ('settings.hide-password' | translate)\n            : ('settings.show-password' | translate)\n        \"\n      >\n        <mat-icon>{{ showConfirm() ? 'visibility_off' : 'visibility' }}</mat-icon>\n      </button>\n      @if (form.errors?.['passwordsMismatch'] && form.get('confirmPassword')?.touched) {\n        <mat-error>{{ 'app.change-password-dialog.passwords-do-not-match' | translate }}</mat-error>\n      }\n    </mat-form-field>\n  </form>\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-button type=\"button\" (click)=\"cancel()\">\n    {{ 'app.change-password-dialog.cancel' | translate }}\n  </button>\n  <button\n    mat-flat-button\n    color=\"primary\"\n    type=\"submit\"\n    form=\"cpd-form\"\n    [disabled]=\"form.invalid || saving()\"\n  >\n    {{ saving() ? 'Saving\u2026' : ('settings.save-changes' | translate) }}\n  </button>\n</mat-dialog-actions>\n", styles: [":host {\n  display: contents;\n}\n\n.cpd-error {\n  margin: 0 0 1rem;\n  padding: 0.65rem 0.85rem;\n  border-radius: 6px;\n  background: #fff3f2;\n  color: #b42318;\n  font-size: 0.875rem;\n}\n\n.cpd-field {\n  display: block;\n  width: calc(100% - 1rem);\n  margin: 0 auto 1.25rem;\n}\n\nmat-dialog-content {\n  min-width: 440px;\n  min-height: 320px;\n  padding-top: 1.25rem;\n  padding-bottom: 1.5rem;\n  padding-left: 0.5rem;\n  padding-right: 0.5rem;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  overflow-x: hidden;\n}\n\nform {\n  overflow-x: hidden;\n}\n\nmat-dialog-actions {\n  justify-content: space-between;\n  padding: 0.75rem 1.5rem 1rem;\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ChangePasswordDialogComponent, { className: "ChangePasswordDialogComponent", filePath: "apps/nuxeo-ui/src/app/settings/profile/change-password-dialog/change-password-dialog.component.ts", lineNumber: 38 }); })();
