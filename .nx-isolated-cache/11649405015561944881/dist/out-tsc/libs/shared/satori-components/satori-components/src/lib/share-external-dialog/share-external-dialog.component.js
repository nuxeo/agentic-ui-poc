import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal, viewChild, } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, merge } from 'rxjs';
import { MatButton } from '@angular/material/button';
import { DateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DocumentDetailService, PERMISSION_NOTIFICATION_MAIL_HINT_KEY, isMailSendError, permissionCreateMailFailureMessage, permissionRightLabel, } from '@nuxeo/satori-platform/nuxeo-client';
import { nxsDateFromAdapter, nxsDateToAdapter } from '../date-input/adapter-date';
import { provideNxsDateAdapter } from '../date-input/locale-date';
import { failureKey, offeredRights } from '../permission-dialog-support';
import { toDay } from '../permissions-panel/permissions-model';
import { NxsSpinnerComponent } from '../spinner/spinner.component';
import { NxsToastService, provideNxsToast } from '../toast/toast.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/datepicker";
import * as i2 from "@angular/material/dialog";
import * as i3 from "@angular/material/form-field";
import * as i4 from "@angular/material/input";
import * as i5 from "@angular/material/select";
const _c0 = ["emailBox"];
function NxsShareExternalDialogComponent_For_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 9);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const permission_r3 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("value", permission_r3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.label(permission_r3));
} }
function NxsShareExternalDialogComponent_Conditional_38_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 14);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permission-dialogs.end-before-begin"), " ");
} }
function NxsShareExternalDialogComponent_Conditional_54_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "nxs-spinner", 19);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(1, 1, "satori-components.permission-dialogs.share.saving"));
} }
function NxsShareExternalDialogComponent_Conditional_55_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.permission-dialogs.share.create-another"), " ");
} }
function NxsShareExternalDialogComponent_Conditional_57_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "nxs-spinner", 19);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(1, 1, "satori-components.permission-dialogs.share.saving"));
} }
function NxsShareExternalDialogComponent_Conditional_58_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.permission-dialogs.share.create"), " ");
} }
/**
 * A local part, then dot-separated domain labels that hold no dot. A domain splits into labels
 * only one way, so a failed match ends in linear time.
 */
const EMAIL = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
/**
 * Shares a document with someone outside the organisation, as a `MatDialog`:
 * `dialog.open(NxsShareExternalDialogComponent, { data })`.
 *
 * As in Web UI, the share needs an end date and always emails the person a link; Nuxeo creates no
 * account for them. **Create and add another** keeps the dialog open for the next person. The
 * dialog closes with `true` when it shared the document with anyone, `false` otherwise.
 */
export class NxsShareExternalDialogComponent {
    dialogRef = inject(MatDialogRef);
    data = inject(MAT_DIALOG_DATA);
    detail = inject(DocumentDetailService);
    translate = inject(TranslateService);
    toast = inject(NxsToastService);
    destroyRef = inject(DestroyRef);
    /** The date fields' adapter, from `provideNxsDateAdapter()`: a host's may not hold JS dates. */
    dateAdapter = inject(DateAdapter);
    rights = offeredRights(this.data.permissions);
    mailHint = PERMISSION_NOTIFICATION_MAIL_HINT_KEY;
    email = signal('', ...(ngDevMode ? [{ debugName: "email" }] : []));
    emailLeft = signal(false, ...(ngDevMode ? [{ debugName: "emailLeft" }] : []));
    right = signal(this.rights[0], ...(ngDevMode ? [{ debugName: "right" }] : []));
    /** The share's days, at local midnight. */
    begin = signal(null, ...(ngDevMode ? [{ debugName: "begin" }] : []));
    end = signal(null, ...(ngDevMode ? [{ debugName: "end" }] : []));
    /** The same days as the date fields hold them, in their adapter's own representation. */
    beginField = computed(() => nxsDateToAdapter(this.dateAdapter, this.begin()), ...(ngDevMode ? [{ debugName: "beginField" }] : []));
    endField = computed(() => nxsDateToAdapter(this.dateAdapter, this.end()), ...(ngDevMode ? [{ debugName: "endField" }] : []));
    comment = signal('', ...(ngDevMode ? [{ debugName: "comment" }] : []));
    /** Which button is saving, so only that one shows the spinner. */
    saving = signal(null, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    shared = false;
    emailValid = computed(() => EMAIL.test(this.email().trim()), ...(ngDevMode ? [{ debugName: "emailValid" }] : []));
    /**
     * Puts the email box in Material's error state once the user has left it invalid, so the input
     * sets `aria-invalid` and points `aria-describedby` at the `mat-error` itself.
     */
    emailError = {
        isErrorState: () => this.emailLeft() && !this.emailValid(),
    };
    emailBox = viewChild.required('emailBox', { read: MatInput });
    endBeforeBegin = computed(() => {
        const begin = toDay(this.begin());
        const end = toDay(this.end());
        return !!begin && !!end && end < begin;
    }, ...(ngDevMode ? [{ debugName: "endBeforeBegin" }] : []));
    valid = computed(() => this.emailValid() && !!this.end() && !this.endBeforeBegin(), ...(ngDevMode ? [{ debugName: "valid" }] : []));
    constructor() {
        // MatInput consults its matcher only for a form control's input; this one has none.
        effect(() => {
            this.emailError.isErrorState(null, null);
            this.emailBox().updateErrorState();
        });
        // Escape and the backdrop must report a share made with "Create and add another" too.
        this.dialogRef.disableClose = true;
        merge(this.dialogRef.backdropClick(), this.dialogRef.keydownEvents().pipe(filter((event) => event.key === 'Escape')))
            .pipe(takeUntilDestroyed())
            .subscribe(() => {
            if (!this.saving())
                this.cancel();
        });
    }
    label(permission) {
        return permissionRightLabel(permission, (key) => this.translate.instant(key));
    }
    /** The day a date field holds, whatever its adapter holds dates as. */
    fieldDay(value) {
        return nxsDateFromAdapter(this.dateAdapter, value);
    }
    cancel() {
        this.dialogRef.close(this.shared);
    }
    create(another) {
        if (!this.valid() || this.saving())
            return;
        this.saving.set(another ? 'another' : 'create');
        const email = this.email().trim();
        this.detail
            .addExternalPermissionWithNotification(this.data.documentUid, {
            email,
            permission: this.right(),
            begin: toDay(this.begin()),
            end: toDay(this.end()),
            notify: true,
            comment: this.comment().trim() || undefined,
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (result) => {
                this.saving.set(null);
                this.shared = true;
                this.toast.show(this.translate.instant(result.notificationErrorKey ?? 'satori-components.permission-dialogs.share.shared', { email }), { duration: 7000 });
                if (another) {
                    this.reset();
                }
                else {
                    this.dialogRef.close(true);
                }
            },
            error: (error) => {
                this.saving.set(null);
                this.toast.error(isMailSendError(error)
                    ? permissionCreateMailFailureMessage((key) => this.translate.instant(key))
                    : this.translate.instant(failureKey(error, 'satori-components.permission-dialogs.error.share')), { duration: 7000 });
            },
        });
    }
    reset() {
        this.email.set('');
        this.emailLeft.set(false);
        this.right.set(this.rights[0]);
        this.begin.set(null);
        this.end.set(null);
        this.comment.set('');
    }
    static ɵfac = function NxsShareExternalDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsShareExternalDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsShareExternalDialogComponent, selectors: [["nxs-share-external-dialog"]], viewQuery: function NxsShareExternalDialogComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.emailBox, _c0, 5, MatInput);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, hostAttrs: [1, "nxs-share-external-dialog"], features: [i0.ɵɵProvidersFeature([provideNxsDateAdapter(), provideNxsToast()])], decls: 59, vars: 49, consts: [["emailBox", ""], ["beginPicker", ""], ["endPicker", ""], ["commentBox", ""], ["mat-dialog-title", ""], [1, "nxs-share-external-dialog__content"], ["appearance", "outline"], ["matInput", "", "type", "email", "autocomplete", "off", "required", "", 3, "input", "blur", "placeholder", "value", "errorStateMatcher"], [3, "valueChange", "value"], [3, "value"], [1, "nxs-share-external-dialog__dates"], ["matInput", "", 3, "dateChange", "matDatepicker", "value"], ["matIconSuffix", "", 3, "for"], ["matInput", "", "required", "", 3, "dateChange", "matDatepicker", "value"], ["role", "alert", 1, "nxs-share-external-dialog__error"], ["matInput", "", "rows", "2", 3, "input", "placeholder", "value"], ["align", "end"], ["mat-button", "", "type", "button", 3, "click", "disabled"], ["mat-stroked-button", "", "type", "button", 1, "nxs-share-external-dialog__another", 3, "click", "disabled"], ["diameter", "18", 3, "label"], ["mat-flat-button", "", "type", "button", 1, "nxs-share-external-dialog__create", 3, "click", "disabled"]], template: function NxsShareExternalDialogComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "h2", 4);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content", 5)(4, "mat-form-field", 6)(5, "mat-label");
            i0.ɵɵtext(6);
            i0.ɵɵpipe(7, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "input", 7, 0);
            i0.ɵɵpipe(10, "translate");
            i0.ɵɵlistener("input", function NxsShareExternalDialogComponent_Template_input_input_8_listener() { i0.ɵɵrestoreView(_r1); const emailBox_r2 = i0.ɵɵreference(9); return i0.ɵɵresetView(ctx.email.set(emailBox_r2.value)); })("blur", function NxsShareExternalDialogComponent_Template_input_blur_8_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.emailLeft.set(true)); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(11, "mat-error");
            i0.ɵɵtext(12);
            i0.ɵɵpipe(13, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(14, "mat-form-field", 6)(15, "mat-label");
            i0.ɵɵtext(16);
            i0.ɵɵpipe(17, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(18, "mat-select", 8);
            i0.ɵɵlistener("valueChange", function NxsShareExternalDialogComponent_Template_mat_select_valueChange_18_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.right.set($event)); });
            i0.ɵɵrepeaterCreate(19, NxsShareExternalDialogComponent_For_20_Template, 2, 2, "mat-option", 9, i0.ɵɵrepeaterTrackByIdentity);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(21, "div", 10)(22, "mat-form-field", 6)(23, "mat-label");
            i0.ɵɵtext(24);
            i0.ɵɵpipe(25, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(26, "input", 11);
            i0.ɵɵlistener("dateChange", function NxsShareExternalDialogComponent_Template_input_dateChange_26_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.begin.set(ctx.fieldDay($event.value))); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(27, "mat-datepicker-toggle", 12)(28, "mat-datepicker", null, 1);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(30, "mat-form-field", 6)(31, "mat-label");
            i0.ɵɵtext(32);
            i0.ɵɵpipe(33, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(34, "input", 13);
            i0.ɵɵlistener("dateChange", function NxsShareExternalDialogComponent_Template_input_dateChange_34_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.end.set(ctx.fieldDay($event.value))); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(35, "mat-datepicker-toggle", 12)(36, "mat-datepicker", null, 2);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(38, NxsShareExternalDialogComponent_Conditional_38_Template, 3, 3, "p", 14);
            i0.ɵɵelementStart(39, "mat-form-field", 6)(40, "mat-label");
            i0.ɵɵtext(41);
            i0.ɵɵpipe(42, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(43, "textarea", 15, 3);
            i0.ɵɵpipe(45, "translate");
            i0.ɵɵlistener("input", function NxsShareExternalDialogComponent_Template_textarea_input_43_listener() { i0.ɵɵrestoreView(_r1); const commentBox_r5 = i0.ɵɵreference(44); return i0.ɵɵresetView(ctx.comment.set(commentBox_r5.value)); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(46, "mat-hint");
            i0.ɵɵtext(47);
            i0.ɵɵpipe(48, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(49, "mat-dialog-actions", 16)(50, "button", 17);
            i0.ɵɵlistener("click", function NxsShareExternalDialogComponent_Template_button_click_50_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.cancel()); });
            i0.ɵɵtext(51);
            i0.ɵɵpipe(52, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(53, "button", 18);
            i0.ɵɵlistener("click", function NxsShareExternalDialogComponent_Template_button_click_53_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.create(true)); });
            i0.ɵɵconditionalCreate(54, NxsShareExternalDialogComponent_Conditional_54_Template, 2, 3, "nxs-spinner", 19)(55, NxsShareExternalDialogComponent_Conditional_55_Template, 2, 3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(56, "button", 20);
            i0.ɵɵlistener("click", function NxsShareExternalDialogComponent_Template_button_click_56_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.create(false)); });
            i0.ɵɵconditionalCreate(57, NxsShareExternalDialogComponent_Conditional_57_Template, 2, 3, "nxs-spinner", 19)(58, NxsShareExternalDialogComponent_Conditional_58_Template, 2, 3);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            const beginPicker_r6 = i0.ɵɵreference(29);
            const endPicker_r7 = i0.ɵɵreference(37);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 27, "satori-components.permission-dialogs.share.title"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 29, "satori-components.permission-dialogs.share.email"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(10, 31, "satori-components.permission-dialogs.share.email-placeholder"))("value", ctx.email())("errorStateMatcher", ctx.emailError);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 33, "satori-components.permission-dialogs.share.email-invalid"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 35, "satori-components.permission-dialogs.right"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("value", ctx.right());
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.rights);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(25, 37, "satori-components.permission-dialogs.from"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", beginPicker_r6)("value", ctx.beginField());
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", beginPicker_r6);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(33, 39, "satori-components.permission-dialogs.to"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", endPicker_r7)("value", ctx.endField());
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", endPicker_r7);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.endBeforeBegin() ? 38 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(42, 41, "satori-components.permission-dialogs.comment"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(45, 43, "satori-components.permission-dialogs.comment-placeholder"))("value", ctx.comment());
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(48, 45, ctx.mailHint));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", !!ctx.saving());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(52, 47, "satori-components.permission-dialogs.cancel"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.valid() || !!ctx.saving());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.saving() === "another" ? 54 : 55);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.valid() || !!ctx.saving());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.saving() === "create" ? 57 : 58);
        } }, dependencies: [MatButton,
            MatDatepickerModule, i1.MatDatepicker, i1.MatDatepickerInput, i1.MatDatepickerToggle, MatDialogModule, i2.MatDialogTitle, i2.MatDialogActions, i2.MatDialogContent, MatFormFieldModule, i3.MatFormField, i3.MatLabel, i3.MatHint, i3.MatError, i3.MatSuffix, MatInputModule, i4.MatInput, MatSelectModule, i5.MatSelect, i5.MatOption, NxsSpinnerComponent,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  --nxs-share-external-dialog-error: var(--mat-sys-error);\n}\n\n.nxs-share-external-dialog__content[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  width: min(480px, 80vw);\n}\n\n//[_ngcontent-%COMP%]   Side[_ngcontent-%COMP%]   by[_ngcontent-%COMP%]   side[_ngcontent-%COMP%]   while[_ngcontent-%COMP%]   both[_ngcontent-%COMP%]   dates[_ngcontent-%COMP%]   fit[_ngcontent-%COMP%], one[_ngcontent-%COMP%]   above[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   other[_ngcontent-%COMP%]   when[_ngcontent-%COMP%]   they[_ngcontent-%COMP%]   do[_ngcontent-%COMP%]   not[_ngcontent-%COMP%], as[_ngcontent-%COMP%]   at[_ngcontent-%COMP%]   320[_ngcontent-%COMP%]   px[_ngcontent-%COMP%]:   a[_ngcontent-%COMP%]   field\n//[_ngcontent-%COMP%]   narrower[_ngcontent-%COMP%]   than[_ngcontent-%COMP%]   its[_ngcontent-%COMP%]   basis[_ngcontent-%COMP%]   cut[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   date[_ngcontent-%COMP%]   off[_ngcontent-%COMP%]   (\"2/1/2031\" showed as \"2/1/2\").[_ngcontent-%COMP%]   The[_ngcontent-%COMP%]   basis[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   full[_ngcontent-%COMP%]   date\n//[_ngcontent-%COMP%]   beside[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   field's[_ngcontent-%COMP%]   padding[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   its[_ngcontent-%COMP%]   datepicker[_ngcontent-%COMP%]   toggle.\n.nxs-share-external-dialog__dates[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0 16px;\n\n  mat-form-field {\n    flex: 1 1 11rem;\n  }\n}\n\n//   Material   gives   content   under   a   title   no   top   padding,   which   clips   the   first   outlined   field's   label.\n[_nghost-%COMP%]   .nxs-share-external-dialog__content[_ngcontent-%COMP%] {\n  padding-top: 8px;\n}\n\n//   Scoped   to   the   host:   the   theme's   `.mat-typography   p`   margin   outranks   a   single   class.\n[_nghost-%COMP%]   .nxs-share-external-dialog__error[_ngcontent-%COMP%] {\n  margin: -4px 0 8px;\n  font-size: 12px;\n  color: var(--nxs-share-external-dialog-error);\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsShareExternalDialogComponent, [{
        type: Component,
        args: [{ selector: 'nxs-share-external-dialog', standalone: true, imports: [
                    MatButton,
                    MatDatepickerModule,
                    MatDialogModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatSelectModule,
                    NxsSpinnerComponent,
                    TranslatePipe,
                ], providers: [provideNxsDateAdapter(), provideNxsToast()], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-share-external-dialog' }, template: "<h2 mat-dialog-title>{{ 'satori-components.permission-dialogs.share.title' | translate }}</h2>\n\n<mat-dialog-content class=\"nxs-share-external-dialog__content\">\n  <mat-form-field appearance=\"outline\">\n    <mat-label>{{ 'satori-components.permission-dialogs.share.email' | translate }}</mat-label>\n    <input\n      #emailBox\n      matInput\n      type=\"email\"\n      autocomplete=\"off\"\n      required\n      [placeholder]=\"'satori-components.permission-dialogs.share.email-placeholder' | translate\"\n      [value]=\"email()\"\n      [errorStateMatcher]=\"emailError\"\n      (input)=\"email.set(emailBox.value)\"\n      (blur)=\"emailLeft.set(true)\"\n    />\n    <mat-error>{{\n      'satori-components.permission-dialogs.share.email-invalid' | translate\n    }}</mat-error>\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\">\n    <mat-label>{{ 'satori-components.permission-dialogs.right' | translate }}</mat-label>\n    <mat-select [value]=\"right()\" (valueChange)=\"right.set($event)\">\n      @for (permission of rights; track permission) {\n        <mat-option [value]=\"permission\">{{ label(permission) }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n\n  <div class=\"nxs-share-external-dialog__dates\">\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'satori-components.permission-dialogs.from' | translate }}</mat-label>\n      <input\n        matInput\n        [matDatepicker]=\"beginPicker\"\n        [value]=\"beginField()\"\n        (dateChange)=\"begin.set(fieldDay($event.value))\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"beginPicker\" />\n      <mat-datepicker #beginPicker />\n    </mat-form-field>\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'satori-components.permission-dialogs.to' | translate }}</mat-label>\n      <input\n        matInput\n        required\n        [matDatepicker]=\"endPicker\"\n        [value]=\"endField()\"\n        (dateChange)=\"end.set(fieldDay($event.value))\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"endPicker\" />\n      <mat-datepicker #endPicker />\n    </mat-form-field>\n  </div>\n  @if (endBeforeBegin()) {\n    <p class=\"nxs-share-external-dialog__error\" role=\"alert\">\n      {{ 'satori-components.permission-dialogs.end-before-begin' | translate }}\n    </p>\n  }\n\n  <mat-form-field appearance=\"outline\">\n    <mat-label>{{ 'satori-components.permission-dialogs.comment' | translate }}</mat-label>\n    <textarea\n      #commentBox\n      matInput\n      rows=\"2\"\n      [placeholder]=\"'satori-components.permission-dialogs.comment-placeholder' | translate\"\n      [value]=\"comment()\"\n      (input)=\"comment.set(commentBox.value)\"\n    ></textarea>\n    <mat-hint>{{ mailHint | translate }}</mat-hint>\n  </mat-form-field>\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"end\">\n  <button mat-button type=\"button\" [disabled]=\"!!saving()\" (click)=\"cancel()\">\n    {{ 'satori-components.permission-dialogs.cancel' | translate }}\n  </button>\n  <button\n    mat-stroked-button\n    type=\"button\"\n    class=\"nxs-share-external-dialog__another\"\n    [disabled]=\"!valid() || !!saving()\"\n    (click)=\"create(true)\"\n  >\n    @if (saving() === 'another') {\n      <nxs-spinner\n        diameter=\"18\"\n        [label]=\"'satori-components.permission-dialogs.share.saving' | translate\"\n      />\n    } @else {\n      {{ 'satori-components.permission-dialogs.share.create-another' | translate }}\n    }\n  </button>\n  <button\n    mat-flat-button\n    type=\"button\"\n    class=\"nxs-share-external-dialog__create\"\n    [disabled]=\"!valid() || !!saving()\"\n    (click)=\"create(false)\"\n  >\n    @if (saving() === 'create') {\n      <nxs-spinner\n        diameter=\"18\"\n        [label]=\"'satori-components.permission-dialogs.share.saving' | translate\"\n      />\n    } @else {\n      {{ 'satori-components.permission-dialogs.share.create' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: [":host {\n  display: block;\n  --nxs-share-external-dialog-error: var(--mat-sys-error);\n}\n\n.nxs-share-external-dialog__content {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  width: min(480px, 80vw);\n}\n\n// Side by side while both dates fit, one above the other when they do not, as at 320 px: a field\n// narrower than its basis cut the date off (\"2/1/2031\" showed as \"2/1/2\"). The basis is a full date\n// beside the field's padding and its datepicker toggle.\n.nxs-share-external-dialog__dates {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0 16px;\n\n  mat-form-field {\n    flex: 1 1 11rem;\n  }\n}\n\n// Material gives content under a title no top padding, which clips the first outlined field's label.\n:host .nxs-share-external-dialog__content {\n  padding-top: 8px;\n}\n\n// Scoped to the host: the theme's `.mat-typography p` margin outranks a single class.\n:host .nxs-share-external-dialog__error {\n  margin: -4px 0 8px;\n  font-size: 12px;\n  color: var(--nxs-share-external-dialog-error);\n}\n"] }]
    }], () => [], { emailBox: [{ type: i0.ViewChild, args: ['emailBox', { ...{ read: MatInput }, isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsShareExternalDialogComponent, { className: "NxsShareExternalDialogComponent", filePath: "libs/shared/satori-components/src/lib/share-external-dialog/share-external-dialog.component.ts", lineNumber: 80 }); })();
//# sourceMappingURL=share-external-dialog.component.js.map