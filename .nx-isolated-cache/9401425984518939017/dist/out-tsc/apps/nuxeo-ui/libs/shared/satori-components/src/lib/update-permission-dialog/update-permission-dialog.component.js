import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal, } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { DateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DocumentDetailService, PERMISSION_NOTIFICATION_MAIL_HINT_KEY, isMailSendError, permissionRightLabel, permissionUpdateMailFailureMessage, } from '@nuxeo/satori-platform/nuxeo-client';
import { nxsDateFromAdapter, nxsDateToAdapter } from '../date-input/adapter-date';
import { provideNxsDateAdapter } from '../date-input/locale-date';
import { failureKey, offeredRights, principalLabel } from '../permission-dialog-support';
import { dateToWrite, dayToDate, toDay } from '../permissions-panel/permissions-model';
import { NxsSpinnerComponent } from '../spinner/spinner.component';
import { NxsToastService, provideNxsToast } from '../toast/toast.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/datepicker";
import * as i2 from "@angular/material/dialog";
import * as i3 from "@angular/material/form-field";
import * as i4 from "@angular/material/input";
import * as i5 from "@angular/material/select";
const _c0 = a0 => ({ principal: a0 });
function NxsUpdatePermissionDialogComponent_For_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 8);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const permission_r2 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("value", permission_r2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.label(permission_r2));
} }
function NxsUpdatePermissionDialogComponent_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 19);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "mat-radio-group", 20);
    i0.ɵɵlistener("change", function NxsUpdatePermissionDialogComponent_Conditional_14_Template_mat_radio_group_change_3_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.dated.set($event.value === "dated")); });
    i0.ɵɵelementStart(4, "mat-radio-button", 21);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "mat-radio-button", 22);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("id", ctx_r2.id + "-time-frame");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 6, "satori-components.permission-dialogs.time-frame"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r2.dated() ? "dated" : "permanent");
    i0.ɵɵattribute("aria-labelledby", ctx_r2.id + "-time-frame");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 8, "satori-components.permission-dialogs.permanent"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 10, "satori-components.permission-dialogs.date-based"));
} }
function NxsUpdatePermissionDialogComponent_Conditional_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 13);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permission-dialogs.end-before-begin"), " ");
} }
function NxsUpdatePermissionDialogComponent_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-checkbox", 23);
    i0.ɵɵlistener("change", function NxsUpdatePermissionDialogComponent_Conditional_33_Template_mat_checkbox_change_0_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.notify.set($event.checked)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("checked", ctx_r2.notify());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "satori-components.permission-dialogs.update.notify"), " ");
} }
function NxsUpdatePermissionDialogComponent_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-form-field", 6)(1, "mat-label");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "textarea", 24, 2);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵlistener("input", function NxsUpdatePermissionDialogComponent_Conditional_34_Template_textarea_input_4_listener() { i0.ɵɵrestoreView(_r6); const commentBox_r7 = i0.ɵɵreference(5); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.comment.set(commentBox_r7.value)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "mat-hint");
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 4, "satori-components.permission-dialogs.comment"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(6, 6, "satori-components.permission-dialogs.comment-placeholder"))("value", ctx_r2.comment());
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 8, ctx_r2.mailHint));
} }
function NxsUpdatePermissionDialogComponent_Conditional_40_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "nxs-spinner", 18);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(1, 1, "satori-components.permission-dialogs.update.saving"));
} }
function NxsUpdatePermissionDialogComponent_Conditional_41_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.permission-dialogs.update.update"), " ");
} }
let nextId = 0;
/**
 * Changes one permission entry's right, time frame or both, as a `MatDialog`:
 * `dialog.open(NxsUpdatePermissionDialogComponent, { data })`.
 *
 * It replaces the entry in one call, as Web UI does, so a failure leaves the entry as it was. An
 * external user's share keeps its required end date and always emails the person again. A date the
 * user did not change is written back as the instant Nuxeo holds, so editing the right alone never
 * moves an entry written from another time zone. It closes with `true` once Nuxeo has saved it.
 */
export class NxsUpdatePermissionDialogComponent {
    dialogRef = inject(MatDialogRef);
    data = inject(MAT_DIALOG_DATA);
    detail = inject(DocumentDetailService);
    translate = inject(TranslateService);
    toast = inject(NxsToastService);
    destroyRef = inject(DestroyRef);
    /** The date fields' adapter, from `provideNxsDateAdapter()`: a host's may not hold JS dates. */
    dateAdapter = inject(DateAdapter);
    ace = this.data.ace;
    id = `nxs-update-permission-dialog-${nextId++}`;
    external = this.ace.externalUser;
    principal = principalLabel(this.ace);
    rights = offeredRights(this.data.permissions, this.ace.permission);
    mailHint = PERMISSION_NOTIFICATION_MAIL_HINT_KEY;
    right = signal(this.ace.permission, ...(ngDevMode ? [{ debugName: "right" }] : []));
    dated = signal(this.external || !!this.ace.begin || !!this.ace.end, ...(ngDevMode ? [{ debugName: "dated" }] : []));
    /** The entry's days, at local midnight. */
    begin = signal(dayToDate(this.ace.begin), ...(ngDevMode ? [{ debugName: "begin" }] : []));
    end = signal(dayToDate(this.ace.end), ...(ngDevMode ? [{ debugName: "end" }] : []));
    /** The same days as the date fields hold them, in their adapter's own representation. */
    beginField = computed(() => nxsDateToAdapter(this.dateAdapter, this.begin()), ...(ngDevMode ? [{ debugName: "beginField" }] : []));
    endField = computed(() => nxsDateToAdapter(this.dateAdapter, this.end()), ...(ngDevMode ? [{ debugName: "endField" }] : []));
    notify = signal(this.external, ...(ngDevMode ? [{ debugName: "notify" }] : []));
    comment = signal('', ...(ngDevMode ? [{ debugName: "comment" }] : []));
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    endBeforeBegin = computed(() => {
        if (!this.dated())
            return false;
        const begin = toDay(this.begin());
        const end = toDay(this.end());
        return !!begin && !!end && end < begin;
    }, ...(ngDevMode ? [{ debugName: "endBeforeBegin" }] : []));
    valid = computed(() => !this.endBeforeBegin() && (!this.external || !!this.end()), ...(ngDevMode ? [{ debugName: "valid" }] : []));
    label(permission) {
        return permissionRightLabel(permission, (key) => this.translate.instant(key));
    }
    /** The day a date field holds, whatever its adapter holds dates as. */
    fieldDay(value) {
        return nxsDateFromAdapter(this.dateAdapter, value);
    }
    update() {
        if (!this.valid() || this.saving())
            return;
        this.saving.set(true);
        const notify = this.notify();
        this.detail
            .replacePermissionWithNotification(this.data.documentUid, {
            id: this.ace.id,
            username: this.ace.username,
            permission: this.right(),
            begin: this.dated() ? dateToWrite(toDay(this.begin()), this.ace.begin) : null,
            end: this.dated() ? dateToWrite(toDay(this.end()), this.ace.end) : null,
            notify,
            comment: notify ? this.comment().trim() || null : null,
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (result) => {
                this.toast.show(this.translate.instant(result.notificationErrorKey ??
                    (result.notificationSent
                        ? 'satori-components.permission-dialogs.update.updated-notified'
                        : 'satori-components.permission-dialogs.update.updated')), { duration: 7000 });
                this.dialogRef.close(true);
            },
            error: (error) => {
                this.saving.set(false);
                this.toast.error(isMailSendError(error)
                    ? permissionUpdateMailFailureMessage((key) => this.translate.instant(key))
                    : this.translate.instant(failureKey(error, 'satori-components.permission-dialogs.error.update')), { duration: 7000 });
            },
        });
    }
    static ɵfac = function NxsUpdatePermissionDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsUpdatePermissionDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsUpdatePermissionDialogComponent, selectors: [["nxs-update-permission-dialog"]], hostAttrs: [1, "nxs-update-permission-dialog"], features: [i0.ɵɵProvidersFeature([provideNxsDateAdapter(), provideNxsToast()])], decls: 42, vars: 38, consts: [["beginPicker", ""], ["endPicker", ""], ["commentBox", ""], ["mat-dialog-title", ""], [1, "nxs-update-permission-dialog__content"], [1, "nxs-update-permission-dialog__principal"], ["appearance", "outline"], [3, "valueChange", "value"], [3, "value"], [1, "nxs-update-permission-dialog__dates"], ["matInput", "", 3, "dateChange", "matDatepicker", "disabled", "value"], ["matIconSuffix", "", 3, "for"], ["matInput", "", 3, "dateChange", "matDatepicker", "required", "disabled", "value"], ["role", "alert", 1, "nxs-update-permission-dialog__error"], [3, "checked"], ["align", "end"], ["mat-button", "", "type", "button", "mat-dialog-close", "", 3, "disabled"], ["mat-flat-button", "", "type", "button", 1, "nxs-update-permission-dialog__update", 3, "click", "disabled"], ["diameter", "18", 3, "label"], [1, "nxs-update-permission-dialog__label", 3, "id"], [1, "nxs-update-permission-dialog__time-frame", 3, "change", "value"], ["value", "permanent"], ["value", "dated"], [3, "change", "checked"], ["matInput", "", "rows", "2", 3, "input", "placeholder", "value"]], template: function NxsUpdatePermissionDialogComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "h2", 3);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content", 4)(4, "p", 5);
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "mat-form-field", 6)(8, "mat-label");
            i0.ɵɵtext(9);
            i0.ɵɵpipe(10, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(11, "mat-select", 7);
            i0.ɵɵlistener("valueChange", function NxsUpdatePermissionDialogComponent_Template_mat_select_valueChange_11_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.right.set($event)); });
            i0.ɵɵrepeaterCreate(12, NxsUpdatePermissionDialogComponent_For_13_Template, 2, 2, "mat-option", 8, i0.ɵɵrepeaterTrackByIdentity);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(14, NxsUpdatePermissionDialogComponent_Conditional_14_Template, 10, 12);
            i0.ɵɵelementStart(15, "div", 9)(16, "mat-form-field", 6)(17, "mat-label");
            i0.ɵɵtext(18);
            i0.ɵɵpipe(19, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(20, "input", 10);
            i0.ɵɵlistener("dateChange", function NxsUpdatePermissionDialogComponent_Template_input_dateChange_20_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.begin.set(ctx.fieldDay($event.value))); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(21, "mat-datepicker-toggle", 11)(22, "mat-datepicker", null, 0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(24, "mat-form-field", 6)(25, "mat-label");
            i0.ɵɵtext(26);
            i0.ɵɵpipe(27, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(28, "input", 12);
            i0.ɵɵlistener("dateChange", function NxsUpdatePermissionDialogComponent_Template_input_dateChange_28_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.end.set(ctx.fieldDay($event.value))); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(29, "mat-datepicker-toggle", 11)(30, "mat-datepicker", null, 1);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(32, NxsUpdatePermissionDialogComponent_Conditional_32_Template, 3, 3, "p", 13);
            i0.ɵɵconditionalCreate(33, NxsUpdatePermissionDialogComponent_Conditional_33_Template, 3, 4, "mat-checkbox", 14);
            i0.ɵɵconditionalCreate(34, NxsUpdatePermissionDialogComponent_Conditional_34_Template, 10, 10, "mat-form-field", 6);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(35, "mat-dialog-actions", 15)(36, "button", 16);
            i0.ɵɵtext(37);
            i0.ɵɵpipe(38, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(39, "button", 17);
            i0.ɵɵlistener("click", function NxsUpdatePermissionDialogComponent_Template_button_click_39_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.update()); });
            i0.ɵɵconditionalCreate(40, NxsUpdatePermissionDialogComponent_Conditional_40_Template, 2, 3, "nxs-spinner", 18)(41, NxsUpdatePermissionDialogComponent_Conditional_41_Template, 2, 3);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            const beginPicker_r8 = i0.ɵɵreference(23);
            const endPicker_r9 = i0.ɵɵreference(31);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 23, "satori-components.permission-dialogs.update.title"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(6, 25, "satori-components.permission-dialogs.update.for", i0.ɵɵpureFunction1(36, _c0, ctx.principal)), " ");
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 28, "satori-components.permission-dialogs.right"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("value", ctx.right());
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.rights);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.external ? 14 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 30, "satori-components.permission-dialogs.from"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", beginPicker_r8)("disabled", !ctx.dated())("value", ctx.beginField());
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", beginPicker_r8);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(27, 32, "satori-components.permission-dialogs.to"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", endPicker_r9)("required", ctx.external)("disabled", !ctx.dated())("value", ctx.endField());
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", endPicker_r9);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.endBeforeBegin() ? 32 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.external ? 33 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.notify() ? 34 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.saving());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(38, 34, "satori-components.permission-dialogs.cancel"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.valid() || ctx.saving());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.saving() ? 40 : 41);
        } }, dependencies: [MatButton,
            MatCheckbox,
            MatDatepickerModule, i1.MatDatepicker, i1.MatDatepickerInput, i1.MatDatepickerToggle, MatDialogModule, i2.MatDialogClose, i2.MatDialogTitle, i2.MatDialogActions, i2.MatDialogContent, MatFormFieldModule, i3.MatFormField, i3.MatLabel, i3.MatHint, i3.MatSuffix, MatInputModule, i4.MatInput, MatRadioButton,
            MatRadioGroup,
            MatSelectModule, i5.MatSelect, i5.MatOption, NxsSpinnerComponent,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  --nxs-update-permission-dialog-muted: var(--mat-sys-on-surface-variant);\n  --nxs-update-permission-dialog-error: var(--mat-sys-error);\n}\n\n.nxs-update-permission-dialog__content[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  width: min(460px, 80vw);\n}\n\n//   Paragraph   margins   are   scoped   to   the   host:   the   theme's   `.mat-typography   p`   outranks   one   class.\n[_nghost-%COMP%]   .nxs-update-permission-dialog__principal[_ngcontent-%COMP%] {\n  margin: 0 0 12px;\n  font-size: 14px;\n  color: var(--nxs-update-permission-dialog-muted);\n}\n\n.nxs-update-permission-dialog__label[_ngcontent-%COMP%] {\n  font-size: 13px;\n  font-weight: 500;\n}\n\n.nxs-update-permission-dialog__time-frame[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 24px;\n  margin-bottom: 8px;\n}\n\n//[_ngcontent-%COMP%]   Side[_ngcontent-%COMP%]   by[_ngcontent-%COMP%]   side[_ngcontent-%COMP%]   while[_ngcontent-%COMP%]   both[_ngcontent-%COMP%]   dates[_ngcontent-%COMP%]   fit,[_ngcontent-%COMP%]   one[_ngcontent-%COMP%]   above[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   other[_ngcontent-%COMP%]   when[_ngcontent-%COMP%]   they[_ngcontent-%COMP%]   do[_ngcontent-%COMP%]   not,[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   at[_ngcontent-%COMP%]   320[_ngcontent-%COMP%]   px:[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   field\n//[_ngcontent-%COMP%]   narrower[_ngcontent-%COMP%]   than[_ngcontent-%COMP%]   its[_ngcontent-%COMP%]   basis[_ngcontent-%COMP%]   cut[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   date[_ngcontent-%COMP%]   off[_ngcontent-%COMP%]   (\"2/1/2031\" showed as \"2/1/2\").[_ngcontent-%COMP%]   The[_ngcontent-%COMP%]   basis[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   full[_ngcontent-%COMP%]   date\n//[_ngcontent-%COMP%]   beside[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   field's[_ngcontent-%COMP%]   padding[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   its[_ngcontent-%COMP%]   datepicker[_ngcontent-%COMP%]   toggle.\n.nxs-update-permission-dialog__dates[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0 16px;\n\n  mat-form-field {\n    flex: 1 1 11rem;\n  }\n}\n\n[_nghost-%COMP%]   .nxs-update-permission-dialog__error[_ngcontent-%COMP%] {\n  margin: -4px 0 8px;\n  font-size: 12px;\n  color: var(--nxs-update-permission-dialog-error);\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsUpdatePermissionDialogComponent, [{
        type: Component,
        args: [{ selector: 'nxs-update-permission-dialog', standalone: true, imports: [
                    MatButton,
                    MatCheckbox,
                    MatDatepickerModule,
                    MatDialogModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatRadioButton,
                    MatRadioGroup,
                    MatSelectModule,
                    NxsSpinnerComponent,
                    TranslatePipe,
                ], providers: [provideNxsDateAdapter(), provideNxsToast()], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-update-permission-dialog' }, template: "<h2 mat-dialog-title>{{ 'satori-components.permission-dialogs.update.title' | translate }}</h2>\n\n<mat-dialog-content class=\"nxs-update-permission-dialog__content\">\n  <p class=\"nxs-update-permission-dialog__principal\">\n    {{ 'satori-components.permission-dialogs.update.for' | translate: { principal } }}\n  </p>\n\n  <mat-form-field appearance=\"outline\">\n    <mat-label>{{ 'satori-components.permission-dialogs.right' | translate }}</mat-label>\n    <mat-select [value]=\"right()\" (valueChange)=\"right.set($event)\">\n      @for (permission of rights; track permission) {\n        <mat-option [value]=\"permission\">{{ label(permission) }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n\n  @if (!external) {\n    <span class=\"nxs-update-permission-dialog__label\" [id]=\"id + '-time-frame'\">{{\n      'satori-components.permission-dialogs.time-frame' | translate\n    }}</span>\n    <mat-radio-group\n      class=\"nxs-update-permission-dialog__time-frame\"\n      [attr.aria-labelledby]=\"id + '-time-frame'\"\n      [value]=\"dated() ? 'dated' : 'permanent'\"\n      (change)=\"dated.set($event.value === 'dated')\"\n    >\n      <mat-radio-button value=\"permanent\">{{\n        'satori-components.permission-dialogs.permanent' | translate\n      }}</mat-radio-button>\n      <mat-radio-button value=\"dated\">{{\n        'satori-components.permission-dialogs.date-based' | translate\n      }}</mat-radio-button>\n    </mat-radio-group>\n  }\n\n  <div class=\"nxs-update-permission-dialog__dates\">\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'satori-components.permission-dialogs.from' | translate }}</mat-label>\n      <input\n        matInput\n        [matDatepicker]=\"beginPicker\"\n        [disabled]=\"!dated()\"\n        [value]=\"beginField()\"\n        (dateChange)=\"begin.set(fieldDay($event.value))\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"beginPicker\" />\n      <mat-datepicker #beginPicker />\n    </mat-form-field>\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'satori-components.permission-dialogs.to' | translate }}</mat-label>\n      <input\n        matInput\n        [matDatepicker]=\"endPicker\"\n        [required]=\"external\"\n        [disabled]=\"!dated()\"\n        [value]=\"endField()\"\n        (dateChange)=\"end.set(fieldDay($event.value))\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"endPicker\" />\n      <mat-datepicker #endPicker />\n    </mat-form-field>\n  </div>\n  @if (endBeforeBegin()) {\n    <p class=\"nxs-update-permission-dialog__error\" role=\"alert\">\n      {{ 'satori-components.permission-dialogs.end-before-begin' | translate }}\n    </p>\n  }\n\n  @if (!external) {\n    <mat-checkbox [checked]=\"notify()\" (change)=\"notify.set($event.checked)\">\n      {{ 'satori-components.permission-dialogs.update.notify' | translate }}\n    </mat-checkbox>\n  }\n  @if (notify()) {\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'satori-components.permission-dialogs.comment' | translate }}</mat-label>\n      <textarea\n        #commentBox\n        matInput\n        rows=\"2\"\n        [placeholder]=\"'satori-components.permission-dialogs.comment-placeholder' | translate\"\n        [value]=\"comment()\"\n        (input)=\"comment.set(commentBox.value)\"\n      ></textarea>\n      <mat-hint>{{ mailHint | translate }}</mat-hint>\n    </mat-form-field>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"end\">\n  <button mat-button type=\"button\" mat-dialog-close [disabled]=\"saving()\">\n    {{ 'satori-components.permission-dialogs.cancel' | translate }}\n  </button>\n  <button\n    mat-flat-button\n    type=\"button\"\n    class=\"nxs-update-permission-dialog__update\"\n    [disabled]=\"!valid() || saving()\"\n    (click)=\"update()\"\n  >\n    @if (saving()) {\n      <nxs-spinner\n        diameter=\"18\"\n        [label]=\"'satori-components.permission-dialogs.update.saving' | translate\"\n      />\n    } @else {\n      {{ 'satori-components.permission-dialogs.update.update' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: [":host {\n  display: block;\n  --nxs-update-permission-dialog-muted: var(--mat-sys-on-surface-variant);\n  --nxs-update-permission-dialog-error: var(--mat-sys-error);\n}\n\n.nxs-update-permission-dialog__content {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  width: min(460px, 80vw);\n}\n\n// Paragraph margins are scoped to the host: the theme's `.mat-typography p` outranks one class.\n:host .nxs-update-permission-dialog__principal {\n  margin: 0 0 12px;\n  font-size: 14px;\n  color: var(--nxs-update-permission-dialog-muted);\n}\n\n.nxs-update-permission-dialog__label {\n  font-size: 13px;\n  font-weight: 500;\n}\n\n.nxs-update-permission-dialog__time-frame {\n  display: flex;\n  gap: 24px;\n  margin-bottom: 8px;\n}\n\n// Side by side while both dates fit, one above the other when they do not, as at 320 px: a field\n// narrower than its basis cut the date off (\"2/1/2031\" showed as \"2/1/2\"). The basis is a full date\n// beside the field's padding and its datepicker toggle.\n.nxs-update-permission-dialog__dates {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0 16px;\n\n  mat-form-field {\n    flex: 1 1 11rem;\n  }\n}\n\n:host .nxs-update-permission-dialog__error {\n  margin: -4px 0 8px;\n  font-size: 12px;\n  color: var(--nxs-update-permission-dialog-error);\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsUpdatePermissionDialogComponent, { className: "NxsUpdatePermissionDialogComponent", filePath: "libs/shared/satori-components/src/lib/update-permission-dialog/update-permission-dialog.component.ts", lineNumber: 82 }); })();
