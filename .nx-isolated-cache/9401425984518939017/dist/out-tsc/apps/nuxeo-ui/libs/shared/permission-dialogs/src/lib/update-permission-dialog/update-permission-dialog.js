import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DescriptorLabelPipe } from '@nuxeo/satori-platform/extensions';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { switchMap } from 'rxjs';
import { DocumentDetailService, PERMISSION_NOTIFICATION_MAIL_HINT_KEY, isMailSendError, permissionUpdateMailFailureMessage, } from '@nuxeo/satori-platform/nuxeo-client';
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
import * as i7 from "@angular/material/radio";
import * as i8 from "@angular/material/checkbox";
import * as i9 from "@angular/material/datepicker";
import * as i10 from "@angular/material/progress-spinner";
const _forTrack0 = ($index, $item) => $item.value;
function UpdatePermissionDialogComponent_For_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 5);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "descriptorLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opt_r2 = ctx.$implicit;
    i0.ɵɵproperty("value", opt_r2.value);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, opt_r2));
} }
function UpdatePermissionDialogComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 6)(1, "span", 19);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "mat-radio-group", 20);
    i0.ɵɵtwoWayListener("ngModelChange", function UpdatePermissionDialogComponent_Conditional_11_Template_mat_radio_group_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r3 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r3.timeFrame, $event) || (ctx_r3.timeFrame = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(5, "mat-radio-button", 21);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "mat-radio-button", 22);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 5, "permissions.update-permission-dialog.time-frame"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.timeFrame);
    i0.ɵɵattribute("aria-labelledby", "update-time-frame-label");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 7, "permissions.update-permission-dialog.permanent"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 9, "permissions.update-permission-dialog.date-based"));
} }
function UpdatePermissionDialogComponent_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-checkbox", 23);
    i0.ɵɵtwoWayListener("ngModelChange", function UpdatePermissionDialogComponent_Conditional_29_Template_mat_checkbox_ngModelChange_0_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r3 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r3.sendNotify, $event) || (ctx_r3.sendNotify = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.sendNotify);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "permissions.update-permission-dialog.send-an-email-to-notify-user"), " ");
} }
function UpdatePermissionDialogComponent_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 13);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, ctx_r3.mailHintKey));
} }
function UpdatePermissionDialogComponent_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 14)(1, "label", 24);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "mat-form-field", 3)(5, "textarea", 25);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵtwoWayListener("ngModelChange", function UpdatePermissionDialogComponent_Conditional_31_Template_textarea_ngModelChange_5_listener($event) { i0.ɵɵrestoreView(_r6); const ctx_r3 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r3.notifyComment, $event) || (ctx_r3.notifyComment = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, "permissions.update-permission-dialog.notification-email"));
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.notifyComment);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(6, 5, "permissions.update-permission-dialog.hi-could-you-comment-on-this"));
} }
function UpdatePermissionDialogComponent_Conditional_38_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 18);
} }
function UpdatePermissionDialogComponent_Conditional_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "permission-dialogs.update-permission-dialog.update"), " ");
} }
const PERMISSION_OPTIONS = [
    { value: 'Read', labelKey: 'permission.read', label: 'Read' },
    { value: 'ReadWrite', labelKey: 'permission.read-write', label: 'Edit' },
    { value: 'Everything', labelKey: 'permission.everything', label: 'Manage everything' },
    { value: 'ReadCanCollect', labelKey: 'permission.read-can-collect', label: 'Can collect' },
];
export class UpdatePermissionDialogComponent {
    dialogRef = inject((MatDialogRef));
    translate = inject(TranslateService);
    data = inject(MAT_DIALOG_DATA);
    detailService = inject(DocumentDetailService);
    toast = inject(NxsToastService);
    destroyRef = inject(DestroyRef);
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    permissionOptions = PERMISSION_OPTIONS;
    mailHintKey = PERMISSION_NOTIFICATION_MAIL_HINT_KEY;
    isExternal;
    permission;
    timeFrame;
    beginDate;
    endDate;
    sendNotify = false;
    notifyComment = '';
    constructor() {
        const ace = this.data.ace;
        this.isExternal = this.data.isExternal ?? false;
        this.permission = ace.permission;
        this.timeFrame = ace.begin || ace.end ? 'date-based' : 'permanent';
        this.beginDate = ace.begin ? new Date(ace.begin) : null;
        this.endDate = ace.end ? new Date(ace.end) : null;
    }
    update() {
        if (this.saving())
            return;
        this.saving.set(true);
        if (this.isExternal) {
            this.updateExternal();
        }
        else {
            this.updateLocal();
        }
    }
    updateLocal() {
        this.detailService
            .replacePermissionWithNotification(this.data.documentUid, {
            id: this.data.ace.id,
            username: this.data.ace.username,
            permission: this.permission,
            notify: this.sendNotify,
            comment: this.sendNotify && this.notifyComment.trim() ? this.notifyComment.trim() : null,
            begin: this.timeFrame === 'date-based' && this.beginDate
                ? this.formatDate(this.beginDate)
                : null,
            end: this.timeFrame === 'date-based' && this.endDate ? this.formatDate(this.endDate) : null,
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (result) => {
                this.saving.set(false);
                const message = this.successMessage(result.notificationSent, result.notificationErrorKey);
                if (message) {
                    this.toast.show(message, { duration: 7000 });
                }
                this.dialogRef.close(true);
            },
            error: (err) => {
                this.saving.set(false);
                this.toast.error(this.permissionErrorMessage(err), { duration: 7000 });
            },
        });
    }
    updateExternal() {
        const ace = this.data.ace;
        const email = ace.username.replace(/^transient\//, '');
        this.detailService
            .removePermission(this.data.documentUid, {
            user: ace.username,
            permission: ace.permission,
            acl: 'local',
        })
            .pipe(switchMap(() => this.detailService.addExternalPermissionWithNotification(this.data.documentUid, {
            email,
            permission: this.permission,
            begin: this.beginDate ? this.formatDate(this.beginDate) : null,
            end: this.endDate ? this.formatDate(this.endDate) : null,
            notify: true,
            comment: this.notifyComment.trim() || undefined,
        })), takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (result) => {
                this.saving.set(false);
                const message = this.successMessage(result.notificationSent, result.notificationErrorKey);
                if (message) {
                    this.toast.show(message, { duration: 7000 });
                }
                this.dialogRef.close(true);
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
        if (this.sendNotify && notificationSent) {
            return this.translate.instant('permission-dialogs.message.permission-updated-notification-sent');
        }
        if (this.isExternal && notificationSent) {
            return this.translate.instant('permission-dialogs.message.permission-updated-notification-sent');
        }
        return null;
    }
    permissionErrorMessage(err) {
        if (isMailSendError(err)) {
            return permissionUpdateMailFailureMessage((key) => this.translate.instant(key));
        }
        const raw = err?.error?.message?.trim();
        return raw || this.translate.instant('permission-dialogs.message.could-not-update-permission');
    }
    formatDate(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
    static ɵfac = function UpdatePermissionDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || UpdatePermissionDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: UpdatePermissionDialogComponent, selectors: [["lib-update-permission-dialog"]], features: [i0.ɵɵProvidersFeature([provideSatoriDateAdapter(), provideTranslatedDatepickerIntl(), provideNxsToast()])], decls: 40, vars: 31, consts: [["fromPicker", ""], ["toPicker", ""], ["mat-dialog-title", ""], ["appearance", "outline", 1, "full-width"], [3, "ngModelChange", "ngModel"], [3, "value"], [1, "time-frame-section"], [1, "date-fields"], ["appearance", "outline"], ["matInput", "", 3, "ngModelChange", "matDatepicker", "ngModel", "disabled"], ["matIconSuffix", "", 3, "for"], ["matInput", "", 3, "ngModelChange", "matDatepicker", "ngModel", "disabled", "required"], [1, "notify-checkbox", 3, "ngModel"], [1, "mail-hint"], [1, "notify-section"], ["mat-stroked-button", "", "mat-dialog-close", ""], [1, "spacer"], ["mat-flat-button", "", "color", "primary", 3, "click", "disabled"], ["diameter", "18"], ["id", "update-time-frame-label", 1, "field-label"], [1, "time-frame-radios", 3, "ngModelChange", "ngModel"], ["value", "permanent"], ["value", "date-based"], [1, "notify-checkbox", 3, "ngModelChange", "ngModel"], ["for", "update-notify-email", 1, "field-label"], ["matInput", "", "id", "update-notify-email", "rows", "2", 3, "ngModelChange", "ngModel", "placeholder"]], template: function UpdatePermissionDialogComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "h2", 2);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content")(4, "mat-form-field", 3)(5, "mat-label");
            i0.ɵɵtext(6);
            i0.ɵɵpipe(7, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "mat-select", 4);
            i0.ɵɵtwoWayListener("ngModelChange", function UpdatePermissionDialogComponent_Template_mat_select_ngModelChange_8_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.permission, $event) || (ctx.permission = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵrepeaterCreate(9, UpdatePermissionDialogComponent_For_10_Template, 3, 4, "mat-option", 5, _forTrack0);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(11, UpdatePermissionDialogComponent_Conditional_11_Template, 11, 11, "div", 6);
            i0.ɵɵelementStart(12, "div", 7)(13, "mat-form-field", 8)(14, "mat-label");
            i0.ɵɵtext(15);
            i0.ɵɵpipe(16, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "input", 9);
            i0.ɵɵtwoWayListener("ngModelChange", function UpdatePermissionDialogComponent_Template_input_ngModelChange_17_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.beginDate, $event) || (ctx.beginDate = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(18, "mat-datepicker-toggle", 10)(19, "mat-datepicker", null, 0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(21, "mat-form-field", 8)(22, "mat-label");
            i0.ɵɵtext(23);
            i0.ɵɵpipe(24, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(25, "input", 11);
            i0.ɵɵtwoWayListener("ngModelChange", function UpdatePermissionDialogComponent_Template_input_ngModelChange_25_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.endDate, $event) || (ctx.endDate = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(26, "mat-datepicker-toggle", 10)(27, "mat-datepicker", null, 1);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(29, UpdatePermissionDialogComponent_Conditional_29_Template, 3, 4, "mat-checkbox", 12);
            i0.ɵɵconditionalCreate(30, UpdatePermissionDialogComponent_Conditional_30_Template, 3, 3, "p", 13);
            i0.ɵɵconditionalCreate(31, UpdatePermissionDialogComponent_Conditional_31_Template, 7, 7, "div", 14);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(32, "mat-dialog-actions")(33, "button", 15);
            i0.ɵɵtext(34);
            i0.ɵɵpipe(35, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(36, "span", 16);
            i0.ɵɵelementStart(37, "button", 17);
            i0.ɵɵlistener("click", function UpdatePermissionDialogComponent_Template_button_click_37_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.update()); });
            i0.ɵɵconditionalCreate(38, UpdatePermissionDialogComponent_Conditional_38_Template, 1, 0, "mat-spinner", 18)(39, UpdatePermissionDialogComponent_Conditional_39_Template, 2, 3);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            const fromPicker_r7 = i0.ɵɵreference(20);
            const toPicker_r8 = i0.ɵɵreference(28);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 21, "permissions.update-permission-dialog.update-permission"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 23, "permissions.update-permission-dialog.right"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.permission);
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.permissionOptions);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.isExternal ? 11 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 25, "permissions.update-permission-dialog.from"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", fromPicker_r7);
            i0.ɵɵtwoWayProperty("ngModel", ctx.beginDate);
            i0.ɵɵproperty("disabled", !ctx.isExternal && ctx.timeFrame === "permanent");
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", fromPicker_r7);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 27, "permissions.update-permission-dialog.to"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", toPicker_r8);
            i0.ɵɵtwoWayProperty("ngModel", ctx.endDate);
            i0.ɵɵproperty("disabled", !ctx.isExternal && ctx.timeFrame === "permanent")("required", ctx.isExternal);
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", toPicker_r8);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(!ctx.isExternal ? 29 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.isExternal && ctx.sendNotify ? 30 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.isExternal || ctx.sendNotify ? 31 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(35, 29, "permissions.update-permission-dialog.cancel"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.saving() || ctx.isExternal && !ctx.endDate);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.saving() ? 38 : 39);
        } }, dependencies: [FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.RequiredValidator, i1.NgModel, MatDialogModule, i2.MatDialogClose, i2.MatDialogTitle, i2.MatDialogActions, i2.MatDialogContent, MatFormFieldModule, i3.MatFormField, i3.MatLabel, i3.MatSuffix, MatInputModule, i4.MatInput, MatSelectModule, i5.MatSelect, i5.MatOption, MatButtonModule, i6.MatButton, MatRadioModule, i7.MatRadioGroup, i7.MatRadioButton, MatCheckboxModule, i8.MatCheckbox, MatDatepickerModule, i9.MatDatepicker, i9.MatDatepickerInput, i9.MatDatepickerToggle, MatProgressSpinnerModule, i10.MatProgressSpinner, DescriptorLabelPipe,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n        display: block;\n        min-width: 440px;\n      }\n\n      mat-dialog-content[_ngcontent-%COMP%] {\n        display: flex;\n        flex-direction: column;\n        gap: 4px;\n        padding-top: 8px !important;\n      }\n\n      .full-width[_ngcontent-%COMP%] {\n        width: 100%;\n      }\n\n      .field-label[_ngcontent-%COMP%] {\n        display: block;\n        font-size: 13px;\n        font-weight: 500;\n        color: #555;\n        margin-bottom: 6px;\n      }\n\n      .time-frame-section[_ngcontent-%COMP%] {\n        margin-bottom: 8px;\n      }\n\n      .time-frame-radios[_ngcontent-%COMP%] {\n        display: flex;\n        gap: 24px;\n      }\n\n      .date-fields[_ngcontent-%COMP%] {\n        display: flex;\n        gap: 16px;\n\n        mat-form-field {\n          flex: 1;\n        }\n      }\n\n      .notify-checkbox[_ngcontent-%COMP%] {\n        margin: 4px 0 8px;\n      }\n\n      .mail-hint[_ngcontent-%COMP%] {\n        margin: 0 0 8px;\n        font-size: 12px;\n        color: var(--mat-sys-on-surface-variant);\n        line-height: 1.4;\n      }\n\n      .notify-section[_ngcontent-%COMP%] {\n        margin-top: 4px;\n      }\n\n      mat-dialog-actions[_ngcontent-%COMP%] {\n        display: flex;\n        gap: 8px;\n        padding: 8px 24px 16px;\n      }\n\n      .spacer[_ngcontent-%COMP%] {\n        flex: 1;\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(UpdatePermissionDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-update-permission-dialog', standalone: true, imports: [
                    DescriptorLabelPipe,
                    TranslatePipe,
                    FormsModule,
                    MatDialogModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatSelectModule,
                    MatButtonModule,
                    MatRadioModule,
                    MatCheckboxModule,
                    MatDatepickerModule,
                    MatProgressSpinnerModule,
                ], providers: [provideSatoriDateAdapter(), provideTranslatedDatepickerIntl(), provideNxsToast()], template: "<h2 mat-dialog-title>{{ 'permissions.update-permission-dialog.update-permission' | translate }}</h2>\n\n<mat-dialog-content>\n  <mat-form-field appearance=\"outline\" class=\"full-width\">\n    <mat-label>{{ 'permissions.update-permission-dialog.right' | translate }}</mat-label>\n    <mat-select [(ngModel)]=\"permission\">\n      @for (opt of permissionOptions; track opt.value) {\n        <mat-option [value]=\"opt.value\">{{ opt | descriptorLabel }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n\n  @if (!isExternal) {\n    <div class=\"time-frame-section\">\n      <span class=\"field-label\" id=\"update-time-frame-label\">{{\n        'permissions.update-permission-dialog.time-frame' | translate\n      }}</span>\n      <mat-radio-group\n        [(ngModel)]=\"timeFrame\"\n        class=\"time-frame-radios\"\n        [attr.aria-labelledby]=\"'update-time-frame-label'\"\n      >\n        <mat-radio-button value=\"permanent\">{{\n          'permissions.update-permission-dialog.permanent' | translate\n        }}</mat-radio-button>\n        <mat-radio-button value=\"date-based\">{{\n          'permissions.update-permission-dialog.date-based' | translate\n        }}</mat-radio-button>\n      </mat-radio-group>\n    </div>\n  }\n\n  <div class=\"date-fields\">\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'permissions.update-permission-dialog.from' | translate }}</mat-label>\n      <input\n        matInput\n        [matDatepicker]=\"fromPicker\"\n        [(ngModel)]=\"beginDate\"\n        [disabled]=\"!isExternal && timeFrame === 'permanent'\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"fromPicker\" />\n      <mat-datepicker #fromPicker />\n    </mat-form-field>\n\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'permissions.update-permission-dialog.to' | translate }}</mat-label>\n      <input\n        matInput\n        [matDatepicker]=\"toPicker\"\n        [(ngModel)]=\"endDate\"\n        [disabled]=\"!isExternal && timeFrame === 'permanent'\"\n        [required]=\"isExternal\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"toPicker\" />\n      <mat-datepicker #toPicker />\n    </mat-form-field>\n  </div>\n\n  @if (!isExternal) {\n    <mat-checkbox [(ngModel)]=\"sendNotify\" class=\"notify-checkbox\">\n      {{ 'permissions.update-permission-dialog.send-an-email-to-notify-user' | translate }}\n    </mat-checkbox>\n  }\n\n  @if (!isExternal && sendNotify) {\n    <p class=\"mail-hint\">{{ mailHintKey | translate }}</p>\n  }\n\n  @if (isExternal || sendNotify) {\n    <div class=\"notify-section\">\n      <label class=\"field-label\" for=\"update-notify-email\">{{\n        'permissions.update-permission-dialog.notification-email' | translate\n      }}</label>\n      <mat-form-field appearance=\"outline\" class=\"full-width\">\n        <textarea\n          matInput\n          id=\"update-notify-email\"\n          [(ngModel)]=\"notifyComment\"\n          rows=\"2\"\n          [placeholder]=\"\n            'permissions.update-permission-dialog.hi-could-you-comment-on-this' | translate\n          \"\n        ></textarea>\n      </mat-form-field>\n    </div>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-stroked-button mat-dialog-close>\n    {{ 'permissions.update-permission-dialog.cancel' | translate }}\n  </button>\n  <span class=\"spacer\"></span>\n  <button\n    mat-flat-button\n    color=\"primary\"\n    [disabled]=\"saving() || (isExternal && !endDate)\"\n    (click)=\"update()\"\n  >\n    @if (saving()) {\n      <mat-spinner diameter=\"18\" />\n    } @else {\n      {{ 'permission-dialogs.update-permission-dialog.update' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: ["\n      :host {\n        display: block;\n        min-width: 440px;\n      }\n\n      mat-dialog-content {\n        display: flex;\n        flex-direction: column;\n        gap: 4px;\n        padding-top: 8px !important;\n      }\n\n      .full-width {\n        width: 100%;\n      }\n\n      .field-label {\n        display: block;\n        font-size: 13px;\n        font-weight: 500;\n        color: #555;\n        margin-bottom: 6px;\n      }\n\n      .time-frame-section {\n        margin-bottom: 8px;\n      }\n\n      .time-frame-radios {\n        display: flex;\n        gap: 24px;\n      }\n\n      .date-fields {\n        display: flex;\n        gap: 16px;\n\n        mat-form-field {\n          flex: 1;\n        }\n      }\n\n      .notify-checkbox {\n        margin: 4px 0 8px;\n      }\n\n      .mail-hint {\n        margin: 0 0 8px;\n        font-size: 12px;\n        color: var(--mat-sys-on-surface-variant);\n        line-height: 1.4;\n      }\n\n      .notify-section {\n        margin-top: 4px;\n      }\n\n      mat-dialog-actions {\n        display: flex;\n        gap: 8px;\n        padding: 8px 24px 16px;\n      }\n\n      .spacer {\n        flex: 1;\n      }\n    "] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(UpdatePermissionDialogComponent, { className: "UpdatePermissionDialogComponent", filePath: "libs/shared/permission-dialogs/src/lib/update-permission-dialog/update-permission-dialog.ts", lineNumber: 133 }); })();
