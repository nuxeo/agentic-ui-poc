import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DescriptorLabelPipe } from '@nuxeo/satori-platform/extensions';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DocumentDetailService, PERMISSION_NOTIFICATION_MAIL_HINT_KEY, isMailSendError, permissionCreateMailFailureMessage, } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { provideSatoriDateAdapter, provideTranslatedDatepickerIntl, } from '@nuxeo/satori-platform/ui';
import { NxsToastService, provideNxsToast } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/dialog";
import * as i3 from "@angular/material/form-field";
import * as i4 from "@angular/material/input";
import * as i5 from "@angular/material/select";
import * as i6 from "@angular/material/button";
import * as i7 from "@angular/material/datepicker";
import * as i8 from "@angular/material/progress-spinner";
const _forTrack0 = ($index, $item) => $item.value;
function ShareExternalDialogComponent_For_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 6);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "descriptorLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opt_r2 = ctx.$implicit;
    i0.ɵɵproperty("value", opt_r2.value);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, opt_r2));
} }
function ShareExternalDialogComponent_Conditional_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 19);
} }
function ShareExternalDialogComponent_Conditional_51_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "permission-dialogs.share-external-dialog.create-and-add-another"), " ");
} }
function ShareExternalDialogComponent_Conditional_53_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 19);
} }
function ShareExternalDialogComponent_Conditional_54_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "permission-dialogs.share-external-dialog.create"), " ");
} }
const PERMISSION_OPTIONS = [
    { value: 'Read', labelKey: 'permission.read', label: 'Read' },
    { value: 'ReadWrite', labelKey: 'permission.read-write', label: 'Edit' },
    { value: 'Everything', labelKey: 'permission.everything', label: 'Manage everything' },
    { value: 'ReadCanCollect', labelKey: 'permission.read-can-collect', label: 'Can collect' },
];
export class ShareExternalDialogComponent {
    dialogRef = inject((MatDialogRef));
    translate = inject(TranslateService);
    data = inject(MAT_DIALOG_DATA);
    detailService = inject(DocumentDetailService);
    toast = inject(NxsToastService);
    destroyRef = inject(DestroyRef);
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    permissionOptions = PERMISSION_OPTIONS;
    mailHintKey = PERMISSION_NOTIFICATION_MAIL_HINT_KEY;
    email = '';
    permission = 'Read';
    beginDate = null;
    endDate = null;
    notifyComment = '';
    addAnother = false;
    createdAny = false;
    cancel() {
        this.dialogRef.close(this.createdAny);
    }
    isValid() {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim()) && !!this.endDate;
    }
    create(andAddAnother) {
        if (!this.isValid() || this.saving())
            return;
        this.addAnother = andAddAnother;
        this.saving.set(true);
        const email = this.email.trim();
        this.detailService
            .addExternalPermissionWithNotification(this.data.documentUid, {
            email,
            permission: this.permission,
            notify: true,
            begin: this.beginDate ? this.formatDate(this.beginDate) : null,
            end: this.endDate ? this.formatDate(this.endDate) : null,
            comment: this.notifyComment.trim() || undefined,
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (result) => {
                this.saving.set(false);
                this.createdAny = true;
                const message = this.successMessage(result.notificationSent, result.notificationErrorKey);
                if (message) {
                    this.toast.show(message, { duration: 7000 });
                }
                if (andAddAnother) {
                    this.resetForm();
                }
                else {
                    this.dialogRef.close(true);
                }
            },
            error: (err) => {
                this.saving.set(false);
                this.toast.error(this.permissionErrorMessage(err), { duration: 7000 });
            },
        });
    }
    successMessage(notificationSent, notificationErrorKey) {
        if (notificationErrorKey) {
            return this.translate.instant(notificationErrorKey);
        }
        if (notificationSent) {
            return this.translate.instant('permission-dialogs.message.permission-added-notification-sent');
        }
        return null;
    }
    permissionErrorMessage(err) {
        if (isMailSendError(err)) {
            return permissionCreateMailFailureMessage((key) => this.translate.instant(key));
        }
        const raw = err?.error?.message?.trim();
        return raw || this.translate.instant('permission-dialogs.message.could-not-share-external');
    }
    resetForm() {
        this.email = '';
        this.permission = 'Read';
        this.beginDate = null;
        this.endDate = null;
        this.notifyComment = '';
    }
    formatDate(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
    static ɵfac = function ShareExternalDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ShareExternalDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ShareExternalDialogComponent, selectors: [["lib-share-external-dialog"]], features: [i0.ɵɵProvidersFeature([provideSatoriDateAdapter(), provideTranslatedDatepickerIntl(), provideNxsToast()])], decls: 55, vars: 43, consts: [["fromPicker", ""], ["toPicker", ""], ["mat-dialog-title", ""], ["appearance", "outline", 1, "full-width"], ["matInput", "", "type", "email", "required", "", 3, "ngModelChange", "placeholder", "ngModel"], [3, "ngModelChange", "ngModel"], [3, "value"], [1, "date-fields"], ["appearance", "outline"], ["matInput", "", 3, "ngModelChange", "matDatepicker", "ngModel"], ["matIconSuffix", "", 3, "for"], ["matInput", "", "required", "", 3, "ngModelChange", "matDatepicker", "ngModel"], [1, "mail-hint"], [1, "notify-section"], ["for", "share-notify-email", 1, "field-label"], ["matInput", "", "id", "share-notify-email", "rows", "2", 3, "ngModelChange", "ngModel", "placeholder"], ["mat-stroked-button", "", "type", "button", 3, "click"], [1, "spacer"], ["mat-flat-button", "", "color", "primary", "type", "button", 1, "create-another-btn", 3, "click", "disabled"], ["diameter", "18"], ["mat-flat-button", "", "color", "primary", "type", "button", 3, "click", "disabled"]], template: function ShareExternalDialogComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "h2", 2);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content")(4, "mat-form-field", 3)(5, "mat-label");
            i0.ɵɵtext(6);
            i0.ɵɵpipe(7, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "input", 4);
            i0.ɵɵpipe(9, "translate");
            i0.ɵɵtwoWayListener("ngModelChange", function ShareExternalDialogComponent_Template_input_ngModelChange_8_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.email, $event) || (ctx.email = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(10, "mat-form-field", 3)(11, "mat-label");
            i0.ɵɵtext(12);
            i0.ɵɵpipe(13, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "mat-select", 5);
            i0.ɵɵtwoWayListener("ngModelChange", function ShareExternalDialogComponent_Template_mat_select_ngModelChange_14_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.permission, $event) || (ctx.permission = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵrepeaterCreate(15, ShareExternalDialogComponent_For_16_Template, 3, 4, "mat-option", 6, _forTrack0);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(17, "div", 7)(18, "mat-form-field", 8)(19, "mat-label");
            i0.ɵɵtext(20);
            i0.ɵɵpipe(21, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(22, "input", 9);
            i0.ɵɵtwoWayListener("ngModelChange", function ShareExternalDialogComponent_Template_input_ngModelChange_22_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.beginDate, $event) || (ctx.beginDate = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(23, "mat-datepicker-toggle", 10)(24, "mat-datepicker", null, 0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(26, "mat-form-field", 8)(27, "mat-label");
            i0.ɵɵtext(28);
            i0.ɵɵpipe(29, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(30, "input", 11);
            i0.ɵɵtwoWayListener("ngModelChange", function ShareExternalDialogComponent_Template_input_ngModelChange_30_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.endDate, $event) || (ctx.endDate = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(31, "mat-datepicker-toggle", 10)(32, "mat-datepicker", null, 1);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(34, "p", 12);
            i0.ɵɵtext(35);
            i0.ɵɵpipe(36, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(37, "div", 13)(38, "label", 14);
            i0.ɵɵtext(39);
            i0.ɵɵpipe(40, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(41, "mat-form-field", 3)(42, "textarea", 15);
            i0.ɵɵpipe(43, "translate");
            i0.ɵɵtwoWayListener("ngModelChange", function ShareExternalDialogComponent_Template_textarea_ngModelChange_42_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.notifyComment, $event) || (ctx.notifyComment = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(44, "mat-dialog-actions")(45, "button", 16);
            i0.ɵɵlistener("click", function ShareExternalDialogComponent_Template_button_click_45_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.cancel()); });
            i0.ɵɵtext(46);
            i0.ɵɵpipe(47, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(48, "span", 17);
            i0.ɵɵelementStart(49, "button", 18);
            i0.ɵɵlistener("click", function ShareExternalDialogComponent_Template_button_click_49_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.create(true)); });
            i0.ɵɵconditionalCreate(50, ShareExternalDialogComponent_Conditional_50_Template, 1, 0, "mat-spinner", 19)(51, ShareExternalDialogComponent_Conditional_51_Template, 2, 3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(52, "button", 20);
            i0.ɵɵlistener("click", function ShareExternalDialogComponent_Template_button_click_52_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.create(false)); });
            i0.ɵɵconditionalCreate(53, ShareExternalDialogComponent_Conditional_53_Template, 1, 0, "mat-spinner", 19)(54, ShareExternalDialogComponent_Conditional_54_Template, 2, 3);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            const fromPicker_r3 = i0.ɵɵreference(25);
            const toPicker_r4 = i0.ɵɵreference(33);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 23, "permissions.share-external-dialog.share-with-external-user"), "\n");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 25, "permissions.share-external-dialog.email"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(9, 27, "common.email-example"));
            i0.ɵɵtwoWayProperty("ngModel", ctx.email);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 29, "permissions.share-external-dialog.right"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.permission);
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.permissionOptions);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(21, 31, "permissions.share-external-dialog.from"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", fromPicker_r3);
            i0.ɵɵtwoWayProperty("ngModel", ctx.beginDate);
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", fromPicker_r3);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(29, 33, "permissions.share-external-dialog.to"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", toPicker_r4);
            i0.ɵɵtwoWayProperty("ngModel", ctx.endDate);
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", toPicker_r4);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(36, 35, ctx.mailHintKey));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(40, 37, "permissions.share-external-dialog.notification-email"));
            i0.ɵɵadvance(3);
            i0.ɵɵtwoWayProperty("ngModel", ctx.notifyComment);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(43, 39, "permissions.share-external-dialog.hi-could-you-comment-on-this"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(47, 41, "permissions.share-external-dialog.cancel"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", !ctx.isValid() || ctx.saving());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.saving() && ctx.addAnother ? 50 : 51);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.isValid() || ctx.saving());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.saving() && !ctx.addAnother ? 53 : 54);
        } }, dependencies: [FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.RequiredValidator, i1.NgModel, MatDialogModule, i2.MatDialogTitle, i2.MatDialogActions, i2.MatDialogContent, MatFormFieldModule, i3.MatFormField, i3.MatLabel, i3.MatSuffix, MatInputModule, i4.MatInput, MatSelectModule, i5.MatSelect, i5.MatOption, MatButtonModule, i6.MatButton, MatDatepickerModule, i7.MatDatepicker, i7.MatDatepickerInput, i7.MatDatepickerToggle, MatProgressSpinnerModule, i8.MatProgressSpinner, DescriptorLabelPipe,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n        display: block;\n        min-width: 480px;\n      }\n\n      mat-dialog-content[_ngcontent-%COMP%] {\n        display: flex;\n        flex-direction: column;\n        gap: 4px;\n        padding-top: 8px !important;\n      }\n\n      .full-width[_ngcontent-%COMP%] {\n        width: 100%;\n      }\n\n      .field-label[_ngcontent-%COMP%] {\n        display: block;\n        font-size: 13px;\n        font-weight: 500;\n        color: #555;\n        margin-bottom: 6px;\n      }\n\n      .date-fields[_ngcontent-%COMP%] {\n        display: flex;\n        gap: 16px;\n\n        mat-form-field {\n          flex: 1;\n        }\n      }\n\n      .notify-section[_ngcontent-%COMP%] {\n        margin-top: 4px;\n      }\n\n      .mail-hint[_ngcontent-%COMP%] {\n        margin: 0 0 8px;\n        font-size: 12px;\n        color: var(--mat-sys-on-surface-variant);\n        line-height: 1.4;\n      }\n\n      mat-dialog-actions[_ngcontent-%COMP%] {\n        display: flex;\n        gap: 8px;\n        padding: 8px 24px 16px;\n      }\n\n      .spacer[_ngcontent-%COMP%] {\n        flex: 1;\n      }\n\n      .create-another-btn[_ngcontent-%COMP%] {\n        background: #3f51b5 !important;\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ShareExternalDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-share-external-dialog', standalone: true, imports: [
                    DescriptorLabelPipe,
                    TranslatePipe,
                    FormsModule,
                    MatDialogModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatSelectModule,
                    MatButtonModule,
                    MatDatepickerModule,
                    MatProgressSpinnerModule,
                ], providers: [provideSatoriDateAdapter(), provideTranslatedDatepickerIntl(), provideNxsToast()], template: "<h2 mat-dialog-title>\n  {{ 'permissions.share-external-dialog.share-with-external-user' | translate }}\n</h2>\n\n<mat-dialog-content>\n  <mat-form-field appearance=\"outline\" class=\"full-width\">\n    <mat-label>{{ 'permissions.share-external-dialog.email' | translate }}</mat-label>\n    <input\n      matInput\n      type=\"email\"\n      [placeholder]=\"'common.email-example' | translate\"\n      [(ngModel)]=\"email\"\n      required\n    />\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" class=\"full-width\">\n    <mat-label>{{ 'permissions.share-external-dialog.right' | translate }}</mat-label>\n    <mat-select [(ngModel)]=\"permission\">\n      @for (opt of permissionOptions; track opt.value) {\n        <mat-option [value]=\"opt.value\">{{ opt | descriptorLabel }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n\n  <div class=\"date-fields\">\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'permissions.share-external-dialog.from' | translate }}</mat-label>\n      <input matInput [matDatepicker]=\"fromPicker\" [(ngModel)]=\"beginDate\" />\n      <mat-datepicker-toggle matIconSuffix [for]=\"fromPicker\" />\n      <mat-datepicker #fromPicker />\n    </mat-form-field>\n\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'permissions.share-external-dialog.to' | translate }}</mat-label>\n      <input matInput [matDatepicker]=\"toPicker\" [(ngModel)]=\"endDate\" required />\n      <mat-datepicker-toggle matIconSuffix [for]=\"toPicker\" />\n      <mat-datepicker #toPicker />\n    </mat-form-field>\n  </div>\n\n  <p class=\"mail-hint\">{{ mailHintKey | translate }}</p>\n\n  <div class=\"notify-section\">\n    <label class=\"field-label\" for=\"share-notify-email\">{{\n      'permissions.share-external-dialog.notification-email' | translate\n    }}</label>\n    <mat-form-field appearance=\"outline\" class=\"full-width\">\n      <textarea\n        matInput\n        id=\"share-notify-email\"\n        [(ngModel)]=\"notifyComment\"\n        rows=\"2\"\n        [placeholder]=\"'permissions.share-external-dialog.hi-could-you-comment-on-this' | translate\"\n      ></textarea>\n    </mat-form-field>\n  </div>\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-stroked-button type=\"button\" (click)=\"cancel()\">\n    {{ 'permissions.share-external-dialog.cancel' | translate }}\n  </button>\n  <span class=\"spacer\"></span>\n  <button\n    mat-flat-button\n    color=\"primary\"\n    type=\"button\"\n    class=\"create-another-btn\"\n    [disabled]=\"!isValid() || saving()\"\n    (click)=\"create(true)\"\n  >\n    @if (saving() && addAnother) {\n      <mat-spinner diameter=\"18\" />\n    } @else {\n      {{ 'permission-dialogs.share-external-dialog.create-and-add-another' | translate }}\n    }\n  </button>\n  <button\n    mat-flat-button\n    color=\"primary\"\n    type=\"button\"\n    [disabled]=\"!isValid() || saving()\"\n    (click)=\"create(false)\"\n  >\n    @if (saving() && !addAnother) {\n      <mat-spinner diameter=\"18\" />\n    } @else {\n      {{ 'permission-dialogs.share-external-dialog.create' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: ["\n      :host {\n        display: block;\n        min-width: 480px;\n      }\n\n      mat-dialog-content {\n        display: flex;\n        flex-direction: column;\n        gap: 4px;\n        padding-top: 8px !important;\n      }\n\n      .full-width {\n        width: 100%;\n      }\n\n      .field-label {\n        display: block;\n        font-size: 13px;\n        font-weight: 500;\n        color: #555;\n        margin-bottom: 6px;\n      }\n\n      .date-fields {\n        display: flex;\n        gap: 16px;\n\n        mat-form-field {\n          flex: 1;\n        }\n      }\n\n      .notify-section {\n        margin-top: 4px;\n      }\n\n      .mail-hint {\n        margin: 0 0 8px;\n        font-size: 12px;\n        color: var(--mat-sys-on-surface-variant);\n        line-height: 1.4;\n      }\n\n      mat-dialog-actions {\n        display: flex;\n        gap: 8px;\n        padding: 8px 24px 16px;\n      }\n\n      .spacer {\n        flex: 1;\n      }\n\n      .create-another-btn {\n        background: #3f51b5 !important;\n      }\n    "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ShareExternalDialogComponent, { className: "ShareExternalDialogComponent", filePath: "libs/shared/permission-dialogs/src/lib/share-external-dialog/share-external-dialog.ts", lineNumber: 116 }); })();
