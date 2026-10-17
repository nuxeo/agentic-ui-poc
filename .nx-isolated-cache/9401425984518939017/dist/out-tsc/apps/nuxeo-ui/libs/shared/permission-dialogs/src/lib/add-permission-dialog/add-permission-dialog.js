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
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
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
import * as i7 from "@angular/material/radio";
import * as i8 from "@angular/material/checkbox";
import * as i9 from "@angular/material/datepicker";
import * as i10 from "@angular/material/icon";
import * as i11 from "@angular/material/progress-spinner";
import * as i12 from "@angular/material/autocomplete";
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.value;
function AddPermissionDialogComponent_For_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 7)(1, "mat-icon", 24);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementStart(4, "span", 25);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const suggestion_r2 = ctx.$implicit;
    i0.ɵɵproperty("value", suggestion_r2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", suggestion_r2.type === "USER_TYPE" ? "person" : "group", " ");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", suggestion_r2.displayLabel, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("(", suggestion_r2.id, ")");
} }
function AddPermissionDialogComponent_For_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 7);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "descriptorLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opt_r3 = ctx.$implicit;
    i0.ɵɵproperty("value", opt_r3.value);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, opt_r3));
} }
function AddPermissionDialogComponent_Conditional_52_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 26);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 27)(4, "label", 28);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "mat-form-field", 4)(8, "textarea", 29);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵtwoWayListener("ngModelChange", function AddPermissionDialogComponent_Conditional_52_Template_textarea_ngModelChange_8_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r4 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r4.notifyComment, $event) || (ctx_r4.notifyComment = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r4 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 4, ctx_r4.mailHintKey));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 6, "permissions.add-permission-dialog.notification-email"));
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r4.notifyComment);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(9, 8, "permissions.add-permission-dialog.hi-could-you-comment-on-this"));
} }
function AddPermissionDialogComponent_Conditional_59_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 22);
} }
function AddPermissionDialogComponent_Conditional_60_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "permission-dialogs.add-permission-dialog.create-and-add-another"), " ");
} }
function AddPermissionDialogComponent_Conditional_62_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 22);
} }
function AddPermissionDialogComponent_Conditional_63_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "permission-dialogs.add-permission-dialog.create"), " ");
} }
const PERMISSION_OPTIONS = [
    { value: 'Read', labelKey: 'permission.read', label: 'Read' },
    { value: 'ReadWrite', labelKey: 'permission.read-write', label: 'Edit' },
    { value: 'Everything', labelKey: 'permission.everything', label: 'Manage everything' },
    { value: 'ReadCanCollect', labelKey: 'permission.read-can-collect', label: 'Can collect' },
];
export class AddPermissionDialogComponent {
    dialogRef = inject((MatDialogRef));
    translate = inject(TranslateService);
    data = inject(MAT_DIALOG_DATA);
    detailService = inject(DocumentDetailService);
    toast = inject(NxsToastService);
    destroyRef = inject(DestroyRef);
    searchSubject = new Subject();
    suggestions = signal([], ...(ngDevMode ? [{ debugName: "suggestions" }] : []));
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    permissionOptions = PERMISSION_OPTIONS;
    mailHintKey = PERMISSION_NOTIFICATION_MAIL_HINT_KEY;
    searchText = '';
    selectedUser = null;
    permission = 'Read';
    timeFrame = 'permanent';
    beginDate = null;
    endDate = null;
    sendNotify = true;
    notifyComment = '';
    addAnother = false;
    constructor() {
        this.searchSubject
            .pipe(debounceTime(300), distinctUntilChanged(), switchMap((term) => term.length >= 1 ? this.detailService.searchUsersGroups(term) : of([])), takeUntilDestroyed())
            .subscribe((results) => this.suggestions.set(results));
    }
    onSearchChange(value) {
        this.searchText = value;
        this.selectedUser = null;
        this.searchSubject.next(value);
    }
    onUserSelected(suggestion) {
        this.selectedUser = suggestion;
        this.searchText = suggestion.displayLabel;
    }
    displayUser(suggestion) {
        if (!suggestion)
            return '';
        if (typeof suggestion === 'string')
            return suggestion;
        return suggestion.displayLabel;
    }
    create(andAddAnother) {
        if (!this.selectedUser || this.saving())
            return;
        this.addAnother = andAddAnother;
        this.saving.set(true);
        this.detailService
            .addPermissionWithNotification(this.data.documentUid, {
            username: this.selectedUser.id,
            permission: this.permission,
            notify: this.sendNotify,
            comment: this.sendNotify && this.notifyComment.trim() ? this.notifyComment.trim() : '',
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
                if (andAddAnother) {
                    if (message) {
                        this.toast.show(message, { duration: 7000 });
                    }
                    this.resetForm();
                }
                else {
                    if (message) {
                        this.toast.show(message, { duration: 7000 });
                    }
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
        if (this.sendNotify && notificationSent) {
            return this.translate.instant('permission-dialogs.message.permission-added-notification-sent');
        }
        if (this.sendNotify) {
            return null;
        }
        return null;
    }
    resetForm() {
        this.searchText = '';
        this.selectedUser = null;
        this.permission = 'Read';
        this.timeFrame = 'permanent';
        this.beginDate = null;
        this.endDate = null;
        this.notifyComment = '';
        this.suggestions.set([]);
    }
    formatDate(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
    permissionErrorMessage(err) {
        if (isMailSendError(err)) {
            return permissionCreateMailFailureMessage((key) => this.translate.instant(key));
        }
        const raw = err?.error?.message?.trim();
        return raw || this.translate.instant('permission-dialogs.message.could-not-add-permission');
    }
    static ɵfac = function AddPermissionDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AddPermissionDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AddPermissionDialogComponent, selectors: [["lib-add-permission-dialog"]], features: [i0.ɵɵProvidersFeature([provideSatoriDateAdapter(), provideTranslatedDatepickerIntl(), provideNxsToast()])], decls: 64, vars: 53, consts: [["userAuto", "matAutocomplete"], ["fromPicker", ""], ["toPicker", ""], ["mat-dialog-title", ""], ["appearance", "outline", 1, "full-width"], ["matInput", "", "required", "", 3, "ngModelChange", "placeholder", "ngModel", "matAutocomplete"], [3, "optionSelected", "displayWith"], [3, "value"], [3, "ngModelChange", "ngModel"], [1, "time-frame-section"], ["id", "time-frame-label", 1, "field-label"], [1, "time-frame-radios", 3, "ngModelChange", "ngModel"], ["value", "permanent"], ["value", "date-based"], [1, "date-fields"], ["appearance", "outline"], ["matInput", "", 3, "ngModelChange", "matDatepicker", "ngModel", "disabled"], ["matIconSuffix", "", 3, "for"], [1, "notify-checkbox", 3, "ngModelChange", "ngModel"], ["mat-stroked-button", "", "mat-dialog-close", ""], [1, "spacer"], ["mat-flat-button", "", "color", "primary", 1, "create-another-btn", 3, "click", "disabled"], ["diameter", "18"], ["mat-flat-button", "", "color", "primary", 3, "click", "disabled"], [1, "suggestion-icon"], [1, "suggestion-id"], [1, "mail-hint"], [1, "notify-section"], ["for", "notify-email", 1, "field-label"], ["matInput", "", "id", "notify-email", "rows", "2", 3, "ngModelChange", "ngModel", "placeholder"]], template: function AddPermissionDialogComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "h2", 3);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content")(4, "mat-form-field", 4)(5, "mat-label");
            i0.ɵɵtext(6);
            i0.ɵɵpipe(7, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "input", 5);
            i0.ɵɵpipe(9, "translate");
            i0.ɵɵlistener("ngModelChange", function AddPermissionDialogComponent_Template_input_ngModelChange_8_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onSearchChange($event)); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "mat-autocomplete", 6, 0);
            i0.ɵɵlistener("optionSelected", function AddPermissionDialogComponent_Template_mat_autocomplete_optionSelected_10_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onUserSelected($event.option.value)); });
            i0.ɵɵrepeaterCreate(12, AddPermissionDialogComponent_For_13_Template, 6, 4, "mat-option", 7, _forTrack0);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(14, "mat-form-field", 4)(15, "mat-label");
            i0.ɵɵtext(16);
            i0.ɵɵpipe(17, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(18, "mat-select", 8);
            i0.ɵɵtwoWayListener("ngModelChange", function AddPermissionDialogComponent_Template_mat_select_ngModelChange_18_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.permission, $event) || (ctx.permission = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵrepeaterCreate(19, AddPermissionDialogComponent_For_20_Template, 3, 4, "mat-option", 7, _forTrack1);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(21, "div", 9)(22, "span", 10);
            i0.ɵɵtext(23);
            i0.ɵɵpipe(24, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(25, "mat-radio-group", 11);
            i0.ɵɵtwoWayListener("ngModelChange", function AddPermissionDialogComponent_Template_mat_radio_group_ngModelChange_25_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.timeFrame, $event) || (ctx.timeFrame = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementStart(26, "mat-radio-button", 12);
            i0.ɵɵtext(27);
            i0.ɵɵpipe(28, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(29, "mat-radio-button", 13);
            i0.ɵɵtext(30);
            i0.ɵɵpipe(31, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(32, "div", 14)(33, "mat-form-field", 15)(34, "mat-label");
            i0.ɵɵtext(35);
            i0.ɵɵpipe(36, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(37, "input", 16);
            i0.ɵɵtwoWayListener("ngModelChange", function AddPermissionDialogComponent_Template_input_ngModelChange_37_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.beginDate, $event) || (ctx.beginDate = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(38, "mat-datepicker-toggle", 17)(39, "mat-datepicker", null, 1);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(41, "mat-form-field", 15)(42, "mat-label");
            i0.ɵɵtext(43);
            i0.ɵɵpipe(44, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(45, "input", 16);
            i0.ɵɵtwoWayListener("ngModelChange", function AddPermissionDialogComponent_Template_input_ngModelChange_45_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.endDate, $event) || (ctx.endDate = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(46, "mat-datepicker-toggle", 17)(47, "mat-datepicker", null, 2);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(49, "mat-checkbox", 18);
            i0.ɵɵtwoWayListener("ngModelChange", function AddPermissionDialogComponent_Template_mat_checkbox_ngModelChange_49_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.sendNotify, $event) || (ctx.sendNotify = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵtext(50);
            i0.ɵɵpipe(51, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(52, AddPermissionDialogComponent_Conditional_52_Template, 10, 10);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(53, "mat-dialog-actions")(54, "button", 19);
            i0.ɵɵtext(55);
            i0.ɵɵpipe(56, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(57, "span", 20);
            i0.ɵɵelementStart(58, "button", 21);
            i0.ɵɵlistener("click", function AddPermissionDialogComponent_Template_button_click_58_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.create(true)); });
            i0.ɵɵconditionalCreate(59, AddPermissionDialogComponent_Conditional_59_Template, 1, 0, "mat-spinner", 22)(60, AddPermissionDialogComponent_Conditional_60_Template, 2, 3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(61, "button", 23);
            i0.ɵɵlistener("click", function AddPermissionDialogComponent_Template_button_click_61_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.create(false)); });
            i0.ɵɵconditionalCreate(62, AddPermissionDialogComponent_Conditional_62_Template, 1, 0, "mat-spinner", 22)(63, AddPermissionDialogComponent_Conditional_63_Template, 2, 3);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            const userAuto_r6 = i0.ɵɵreference(11);
            const fromPicker_r7 = i0.ɵɵreference(40);
            const toPicker_r8 = i0.ɵɵreference(48);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 31, "permissions.add-permission-dialog.add-a-permission"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 33, "permissions.add-permission-dialog.user-group"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(9, 35, "permissions.add-permission-dialog.search-for-users-and-groups"))("ngModel", ctx.searchText)("matAutocomplete", userAuto_r6);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("displayWith", ctx.displayUser);
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.suggestions());
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 37, "permissions.add-permission-dialog.right"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.permission);
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.permissionOptions);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 39, "permissions.add-permission-dialog.time-frame"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.timeFrame);
            i0.ɵɵattribute("aria-labelledby", "time-frame-label");
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(28, 41, "permissions.add-permission-dialog.permanent"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(31, 43, "permissions.add-permission-dialog.date-based"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(36, 45, "permissions.add-permission-dialog.from"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", fromPicker_r7);
            i0.ɵɵtwoWayProperty("ngModel", ctx.beginDate);
            i0.ɵɵproperty("disabled", ctx.timeFrame === "permanent");
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", fromPicker_r7);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(44, 47, "permissions.add-permission-dialog.to"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", toPicker_r8);
            i0.ɵɵtwoWayProperty("ngModel", ctx.endDate);
            i0.ɵɵproperty("disabled", ctx.timeFrame === "permanent");
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", toPicker_r8);
            i0.ɵɵadvance(3);
            i0.ɵɵtwoWayProperty("ngModel", ctx.sendNotify);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(51, 49, "permissions.add-permission-dialog.send-an-email-to-notify-user"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.sendNotify ? 52 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(56, 51, "permissions.add-permission-dialog.cancel"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", !ctx.selectedUser || ctx.saving());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.saving() && ctx.addAnother ? 59 : 60);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.selectedUser || ctx.saving());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.saving() && !ctx.addAnother ? 62 : 63);
        } }, dependencies: [FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.RequiredValidator, i1.NgModel, MatDialogModule, i2.MatDialogClose, i2.MatDialogTitle, i2.MatDialogActions, i2.MatDialogContent, MatFormFieldModule, i3.MatFormField, i3.MatLabel, i3.MatSuffix, MatInputModule, i4.MatInput, MatSelectModule, i5.MatSelect, i5.MatOption, MatButtonModule, i6.MatButton, MatRadioModule, i7.MatRadioGroup, i7.MatRadioButton, MatCheckboxModule, i8.MatCheckbox, MatDatepickerModule, i9.MatDatepicker, i9.MatDatepickerInput, i9.MatDatepickerToggle, MatIconModule, i10.MatIcon, MatProgressSpinnerModule, i11.MatProgressSpinner, MatAutocompleteModule, i12.MatAutocomplete, i12.MatAutocompleteTrigger, DescriptorLabelPipe,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n        display: block;\n        min-width: 480px;\n      }\n\n      mat-dialog-content[_ngcontent-%COMP%] {\n        display: flex;\n        flex-direction: column;\n        gap: 4px;\n        padding-top: 8px !important;\n      }\n\n      .full-width[_ngcontent-%COMP%] {\n        width: 100%;\n      }\n\n      .suggestion-icon[_ngcontent-%COMP%] {\n        font-size: 18px;\n        width: 18px;\n        height: 18px;\n        margin-right: 8px;\n        vertical-align: middle;\n        color: #666;\n      }\n\n      .suggestion-id[_ngcontent-%COMP%] {\n        color: #999;\n        font-size: 12px;\n        margin-left: 4px;\n      }\n\n      .field-label[_ngcontent-%COMP%] {\n        display: block;\n        font-size: 13px;\n        font-weight: 500;\n        color: #555;\n        margin-bottom: 6px;\n      }\n\n      .time-frame-section[_ngcontent-%COMP%] {\n        margin-bottom: 8px;\n      }\n\n      .time-frame-radios[_ngcontent-%COMP%] {\n        display: flex;\n        gap: 24px;\n      }\n\n      .date-fields[_ngcontent-%COMP%] {\n        display: flex;\n        gap: 16px;\n\n        mat-form-field {\n          flex: 1;\n        }\n      }\n\n      .notify-checkbox[_ngcontent-%COMP%] {\n        margin: 4px 0 8px;\n      }\n\n      .mail-hint[_ngcontent-%COMP%] {\n        margin: 0 0 8px;\n        font-size: 12px;\n        color: var(--mat-sys-on-surface-variant);\n        line-height: 1.4;\n      }\n\n      .notify-section[_ngcontent-%COMP%] {\n        margin-top: 4px;\n      }\n\n      mat-dialog-actions[_ngcontent-%COMP%] {\n        display: flex;\n        gap: 8px;\n        padding: 8px 24px 16px;\n      }\n\n      .spacer[_ngcontent-%COMP%] {\n        flex: 1;\n      }\n\n      .create-another-btn[_ngcontent-%COMP%] {\n        background: #3f51b5 !important;\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AddPermissionDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-add-permission-dialog', standalone: true, imports: [
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
                    MatIconModule,
                    MatProgressSpinnerModule,
                    MatAutocompleteModule,
                ], providers: [provideSatoriDateAdapter(), provideTranslatedDatepickerIntl(), provideNxsToast()], template: "<h2 mat-dialog-title>{{ 'permissions.add-permission-dialog.add-a-permission' | translate }}</h2>\n\n<mat-dialog-content>\n  <mat-form-field appearance=\"outline\" class=\"full-width\">\n    <mat-label>{{ 'permissions.add-permission-dialog.user-group' | translate }}</mat-label>\n    <input\n      matInput\n      [placeholder]=\"'permissions.add-permission-dialog.search-for-users-and-groups' | translate\"\n      [ngModel]=\"searchText\"\n      (ngModelChange)=\"onSearchChange($event)\"\n      [matAutocomplete]=\"userAuto\"\n      required\n    />\n    <mat-autocomplete\n      #userAuto=\"matAutocomplete\"\n      (optionSelected)=\"onUserSelected($event.option.value)\"\n      [displayWith]=\"displayUser\"\n    >\n      @for (suggestion of suggestions(); track suggestion.id) {\n        <mat-option [value]=\"suggestion\">\n          <mat-icon class=\"suggestion-icon\">\n            {{ suggestion.type === 'USER_TYPE' ? 'person' : 'group' }}\n          </mat-icon>\n          {{ suggestion.displayLabel }}\n          <span class=\"suggestion-id\">({{ suggestion.id }})</span>\n        </mat-option>\n      }\n    </mat-autocomplete>\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" class=\"full-width\">\n    <mat-label>{{ 'permissions.add-permission-dialog.right' | translate }}</mat-label>\n    <mat-select [(ngModel)]=\"permission\">\n      @for (opt of permissionOptions; track opt.value) {\n        <mat-option [value]=\"opt.value\">{{ opt | descriptorLabel }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n\n  <div class=\"time-frame-section\">\n    <span class=\"field-label\" id=\"time-frame-label\">{{\n      'permissions.add-permission-dialog.time-frame' | translate\n    }}</span>\n    <mat-radio-group\n      [(ngModel)]=\"timeFrame\"\n      class=\"time-frame-radios\"\n      [attr.aria-labelledby]=\"'time-frame-label'\"\n    >\n      <mat-radio-button value=\"permanent\">{{\n        'permissions.add-permission-dialog.permanent' | translate\n      }}</mat-radio-button>\n      <mat-radio-button value=\"date-based\">{{\n        'permissions.add-permission-dialog.date-based' | translate\n      }}</mat-radio-button>\n    </mat-radio-group>\n  </div>\n\n  <div class=\"date-fields\">\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'permissions.add-permission-dialog.from' | translate }}</mat-label>\n      <input\n        matInput\n        [matDatepicker]=\"fromPicker\"\n        [(ngModel)]=\"beginDate\"\n        [disabled]=\"timeFrame === 'permanent'\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"fromPicker\" />\n      <mat-datepicker #fromPicker />\n    </mat-form-field>\n\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'permissions.add-permission-dialog.to' | translate }}</mat-label>\n      <input\n        matInput\n        [matDatepicker]=\"toPicker\"\n        [(ngModel)]=\"endDate\"\n        [disabled]=\"timeFrame === 'permanent'\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"toPicker\" />\n      <mat-datepicker #toPicker />\n    </mat-form-field>\n  </div>\n\n  <mat-checkbox [(ngModel)]=\"sendNotify\" class=\"notify-checkbox\">\n    {{ 'permissions.add-permission-dialog.send-an-email-to-notify-user' | translate }}\n  </mat-checkbox>\n\n  @if (sendNotify) {\n    <p class=\"mail-hint\">{{ mailHintKey | translate }}</p>\n    <div class=\"notify-section\">\n      <label class=\"field-label\" for=\"notify-email\">{{\n        'permissions.add-permission-dialog.notification-email' | translate\n      }}</label>\n      <mat-form-field appearance=\"outline\" class=\"full-width\">\n        <textarea\n          matInput\n          id=\"notify-email\"\n          [(ngModel)]=\"notifyComment\"\n          rows=\"2\"\n          [placeholder]=\"\n            'permissions.add-permission-dialog.hi-could-you-comment-on-this' | translate\n          \"\n        ></textarea>\n      </mat-form-field>\n    </div>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-stroked-button mat-dialog-close>\n    {{ 'permissions.add-permission-dialog.cancel' | translate }}\n  </button>\n  <span class=\"spacer\"></span>\n  <button\n    mat-flat-button\n    color=\"primary\"\n    class=\"create-another-btn\"\n    [disabled]=\"!selectedUser || saving()\"\n    (click)=\"create(true)\"\n  >\n    @if (saving() && addAnother) {\n      <mat-spinner diameter=\"18\" />\n    } @else {\n      {{ 'permission-dialogs.add-permission-dialog.create-and-add-another' | translate }}\n    }\n  </button>\n  <button\n    mat-flat-button\n    color=\"primary\"\n    [disabled]=\"!selectedUser || saving()\"\n    (click)=\"create(false)\"\n  >\n    @if (saving() && !addAnother) {\n      <mat-spinner diameter=\"18\" />\n    } @else {\n      {{ 'permission-dialogs.add-permission-dialog.create' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: ["\n      :host {\n        display: block;\n        min-width: 480px;\n      }\n\n      mat-dialog-content {\n        display: flex;\n        flex-direction: column;\n        gap: 4px;\n        padding-top: 8px !important;\n      }\n\n      .full-width {\n        width: 100%;\n      }\n\n      .suggestion-icon {\n        font-size: 18px;\n        width: 18px;\n        height: 18px;\n        margin-right: 8px;\n        vertical-align: middle;\n        color: #666;\n      }\n\n      .suggestion-id {\n        color: #999;\n        font-size: 12px;\n        margin-left: 4px;\n      }\n\n      .field-label {\n        display: block;\n        font-size: 13px;\n        font-weight: 500;\n        color: #555;\n        margin-bottom: 6px;\n      }\n\n      .time-frame-section {\n        margin-bottom: 8px;\n      }\n\n      .time-frame-radios {\n        display: flex;\n        gap: 24px;\n      }\n\n      .date-fields {\n        display: flex;\n        gap: 16px;\n\n        mat-form-field {\n          flex: 1;\n        }\n      }\n\n      .notify-checkbox {\n        margin: 4px 0 8px;\n      }\n\n      .mail-hint {\n        margin: 0 0 8px;\n        font-size: 12px;\n        color: var(--mat-sys-on-surface-variant);\n        line-height: 1.4;\n      }\n\n      .notify-section {\n        margin-top: 4px;\n      }\n\n      mat-dialog-actions {\n        display: flex;\n        gap: 8px;\n        padding: 8px 24px 16px;\n      }\n\n      .spacer {\n        flex: 1;\n      }\n\n      .create-another-btn {\n        background: #3f51b5 !important;\n      }\n    "] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AddPermissionDialogComponent, { className: "AddPermissionDialogComponent", filePath: "libs/shared/permission-dialogs/src/lib/add-permission-dialog/add-permission-dialog.ts", lineNumber: 154 }); })();
