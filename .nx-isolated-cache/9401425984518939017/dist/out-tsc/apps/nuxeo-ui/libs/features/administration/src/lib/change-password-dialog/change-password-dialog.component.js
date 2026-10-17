import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/dialog";
import * as i3 from "@angular/material/button";
import * as i4 from "@angular/material/form-field";
import * as i5 from "@angular/material/input";
export class ChangePasswordDialogComponent {
    dialogRef = inject((MatDialogRef));
    data = inject(MAT_DIALOG_DATA);
    password = '';
    confirm = '';
    canSave() {
        const p = this.password.trim();
        return p.length > 0 && p === this.confirm.trim();
    }
    save() {
        if (!this.canSave())
            return;
        this.dialogRef.close(this.password.trim());
    }
    static ɵfac = function ChangePasswordDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ChangePasswordDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ChangePasswordDialogComponent, selectors: [["lib-change-password-dialog"]], decls: 26, vars: 22, consts: [["mat-dialog-title", ""], [1, "pwd-form"], [1, "pwd-hint"], ["appearance", "outline", 1, "full"], ["matInput", "", "type", "password", "name", "pw1", "required", "", "autocomplete", "new-password", 3, "ngModelChange", "ngModel"], ["matInput", "", "type", "password", "name", "pw2", "required", "", "autocomplete", "new-password", 3, "ngModelChange", "ngModel"], ["align", "end", 1, "pwd-actions"], ["type", "button", "mat-button", "", "mat-dialog-close", ""], ["type", "button", "mat-flat-button", "", "color", "primary", 3, "click", "disabled"]], template: function ChangePasswordDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "h2", 0);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content", 1)(4, "p", 2);
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "translate");
            i0.ɵɵelementStart(7, "strong");
            i0.ɵɵtext(8);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "mat-form-field", 3)(10, "mat-label");
            i0.ɵɵtext(11);
            i0.ɵɵpipe(12, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(13, "input", 4);
            i0.ɵɵtwoWayListener("ngModelChange", function ChangePasswordDialogComponent_Template_input_ngModelChange_13_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.password, $event) || (ctx.password = $event); return $event; });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(14, "mat-form-field", 3)(15, "mat-label");
            i0.ɵɵtext(16);
            i0.ɵɵpipe(17, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(18, "input", 5);
            i0.ɵɵtwoWayListener("ngModelChange", function ChangePasswordDialogComponent_Template_input_ngModelChange_18_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.confirm, $event) || (ctx.confirm = $event); return $event; });
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(19, "mat-dialog-actions", 6)(20, "button", 7);
            i0.ɵɵtext(21);
            i0.ɵɵpipe(22, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(23, "button", 8);
            i0.ɵɵlistener("click", function ChangePasswordDialogComponent_Template_button_click_23_listener() { return ctx.save(); });
            i0.ɵɵtext(24);
            i0.ɵɵpipe(25, "translate");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 10, "admin.change-password-dialog.change-password"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 12, "admin.change-password-dialog.user"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.data.username);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 14, "admin.change-password-dialog.new-password"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.password);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 16, "admin.change-password-dialog.confirm-password"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.confirm);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(22, 18, "admin.change-password-dialog.cancel"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.canSave());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(25, 20, "admin.change-password-dialog.save"), " ");
        } }, dependencies: [FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.RequiredValidator, i1.NgModel, MatDialogModule, i2.MatDialogClose, i2.MatDialogTitle, i2.MatDialogActions, i2.MatDialogContent, MatButtonModule, i3.MatButton, MatFormFieldModule, i4.MatFormField, i4.MatLabel, MatInputModule, i5.MatInput, TranslatePipe], styles: [".pwd-form[_ngcontent-%COMP%] {\n        display: flex;\n        flex-direction: column;\n        gap: 0.5rem;\n        min-width: 320px;\n        padding-top: 0.25rem;\n      }\n      .full[_ngcontent-%COMP%] {\n        width: 100%;\n      }\n      .pwd-hint[_ngcontent-%COMP%] {\n        margin: 0 0 0.25rem;\n        font-size: 0.9rem;\n        color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.65));\n      }\n      .pwd-actions[_ngcontent-%COMP%] {\n        gap: 0.5rem;\n        padding: 0.75rem 1.5rem 1.25rem;\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ChangePasswordDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-change-password-dialog', standalone: true, imports: [
                    TranslatePipe,
                    FormsModule,
                    MatDialogModule,
                    MatButtonModule,
                    MatFormFieldModule,
                    MatInputModule,
                ], template: "<h2 mat-dialog-title>{{ 'admin.change-password-dialog.change-password' | translate }}</h2>\n<mat-dialog-content class=\"pwd-form\">\n  <p class=\"pwd-hint\">\n    {{ 'admin.change-password-dialog.user' | translate }} <strong>{{ data.username }}</strong>\n  </p>\n  <mat-form-field appearance=\"outline\" class=\"full\">\n    <mat-label>{{ 'admin.change-password-dialog.new-password' | translate }}</mat-label>\n    <input\n      matInput\n      type=\"password\"\n      name=\"pw1\"\n      [(ngModel)]=\"password\"\n      required\n      autocomplete=\"new-password\"\n    />\n  </mat-form-field>\n  <mat-form-field appearance=\"outline\" class=\"full\">\n    <mat-label>{{ 'admin.change-password-dialog.confirm-password' | translate }}</mat-label>\n    <input\n      matInput\n      type=\"password\"\n      name=\"pw2\"\n      [(ngModel)]=\"confirm\"\n      required\n      autocomplete=\"new-password\"\n    />\n  </mat-form-field>\n</mat-dialog-content>\n<mat-dialog-actions align=\"end\" class=\"pwd-actions\">\n  <button type=\"button\" mat-button mat-dialog-close>\n    {{ 'admin.change-password-dialog.cancel' | translate }}\n  </button>\n  <button type=\"button\" mat-flat-button color=\"primary\" [disabled]=\"!canSave()\" (click)=\"save()\">\n    {{ 'admin.change-password-dialog.save' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: ["\n      .pwd-form {\n        display: flex;\n        flex-direction: column;\n        gap: 0.5rem;\n        min-width: 320px;\n        padding-top: 0.25rem;\n      }\n      .full {\n        width: 100%;\n      }\n      .pwd-hint {\n        margin: 0 0 0.25rem;\n        font-size: 0.9rem;\n        color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.65));\n      }\n      .pwd-actions {\n        gap: 0.5rem;\n        padding: 0.75rem 1.5rem 1.25rem;\n      }\n    "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ChangePasswordDialogComponent, { className: "ChangePasswordDialogComponent", filePath: "libs/features/administration/src/lib/change-password-dialog/change-password-dialog.component.ts", lineNumber: 49 }); })();
