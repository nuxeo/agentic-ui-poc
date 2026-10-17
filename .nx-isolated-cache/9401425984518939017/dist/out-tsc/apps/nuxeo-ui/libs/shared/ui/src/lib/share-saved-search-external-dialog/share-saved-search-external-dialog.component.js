import { Component, inject, signal } from '@angular/core';
import { DescriptorLabelPipe } from '@nuxeo/satori-platform/extensions';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { catchError, of } from 'rxjs';
import { DocumentDetailService } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe } from '@ngx-translate/core';
import { provideTranslatedDatepickerIntl } from '../datepicker-intl/translated-datepicker-intl';
import { provideSatoriDateAdapter } from '../date-adapter/satori-date-adapter';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/dialog";
import * as i3 from "@angular/material/form-field";
import * as i4 from "@angular/material/input";
import * as i5 from "@angular/material/select";
import * as i6 from "@angular/material/button";
import * as i7 from "@angular/material/datepicker";
const _forTrack0 = ($index, $item) => $item.value;
function ShareSavedSearchExternalDialogComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 18);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 19);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "shared-ui.share-saved-search-external-dialog.email"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.email);
} }
function ShareSavedSearchExternalDialogComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-form-field", 3)(1, "mat-label");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "input", 20);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵtwoWayListener("ngModelChange", function ShareSavedSearchExternalDialogComponent_Conditional_5_Template_input_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.email, $event) || (ctx_r1.email = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, "shared-ui.share-saved-search-external-dialog.email-2"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(5, 5, "common.email-example"));
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.email);
} }
function ShareSavedSearchExternalDialogComponent_For_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 5);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "descriptorLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opt_r4 = ctx.$implicit;
    i0.ɵɵproperty("value", opt_r4.value);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, opt_r4));
} }
function ShareSavedSearchExternalDialogComponent_Conditional_42_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 17);
    i0.ɵɵlistener("click", function ShareSavedSearchExternalDialogComponent_Conditional_42_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.create(true)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", !ctx_r1.isValid() || ctx_r1.saving());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "shared-ui.share-saved-search-external-dialog.create-and-add-another"), " ");
} }
const RIGHT_OPTIONS = [
    { value: 'Read', labelKey: 'permission.read', label: 'Read' },
    { value: 'ReadWrite', labelKey: 'permission.read-write', label: 'Edit' },
    { value: 'Everything', labelKey: 'permission.everything', label: 'Manage everything' },
    { value: 'ReadCanCollect', labelKey: 'permission.read-can-collect', label: 'Can collect' },
];
export class ShareSavedSearchExternalDialogComponent {
    dialogRef = inject((MatDialogRef));
    data = inject(MAT_DIALOG_DATA);
    detailService = inject(DocumentDetailService);
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    rightOptions = RIGHT_OPTIONS;
    isEditMode = !!this.data.initialData;
    email = '';
    right = 'Read';
    beginDate = null;
    endDate = null;
    notifyComment = '';
    createdAny = false;
    constructor() {
        if (this.data.initialData) {
            this.email = this.data.initialData.email;
            this.right = this.data.initialData.right || 'Read';
            this.beginDate = this.parseDate(this.data.initialData.begin);
            this.endDate = this.parseDate(this.data.initialData.end);
        }
    }
    cancel() {
        this.dialogRef.close(this.createdAny);
    }
    create(andAddAnother) {
        if (!this.isValid() || this.saving())
            return;
        this.saving.set(true);
        const request = this.isEditMode
            ? this.detailService.replacePermission(this.data.savedSearchId, {
                id: this.data.initialData?.id,
                email: this.email.trim(),
                permission: this.right,
                begin: this.beginDate ? this.formatDate(this.beginDate) : null,
                end: this.endDate ? this.formatDate(this.endDate) : null,
                notify: false,
                comment: this.notifyComment,
            })
            : this.detailService.addPermission(this.data.savedSearchId, {
                email: this.email.trim(),
                permission: this.right,
                begin: this.beginDate ? this.formatDate(this.beginDate) : null,
                end: this.endDate ? this.formatDate(this.endDate) : null,
                notify: false,
                comment: this.notifyComment,
            });
        request
            .pipe(catchError((error) => {
            console.error('Error adding external permission:', error);
            this.saving.set(false);
            return of(null);
        }))
            .subscribe((result) => {
            this.saving.set(false);
            if (!result)
                return;
            this.createdAny = true;
            if (andAddAnother && !this.isEditMode) {
                this.resetForm();
                return;
            }
            this.dialogRef.close(true);
        });
    }
    isValid() {
        const hasEmail = this.isEditMode ? true : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
        const hasToDate = !!this.endDate;
        return hasEmail && hasToDate;
    }
    resetForm() {
        this.email = '';
        this.right = 'Read';
        this.beginDate = null;
        this.endDate = null;
        this.notifyComment = '';
    }
    formatDate(date) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
    parseDate(value) {
        if (!value)
            return null;
        // MM/DD/YYYY
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
            const [mm, dd, yyyy] = value.split('/');
            return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
        }
        // ISO or date-like strings
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    static ɵfac = function ShareSavedSearchExternalDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ShareSavedSearchExternalDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ShareSavedSearchExternalDialogComponent, selectors: [["lib-share-saved-search-external-dialog"]], features: [i0.ɵɵProvidersFeature([provideSatoriDateAdapter(), provideTranslatedDatepickerIntl()])], decls: 47, vars: 37, consts: [["fromPicker", ""], ["toPicker", ""], ["mat-dialog-title", ""], ["appearance", "outline", 1, "full-width"], [3, "ngModelChange", "ngModel"], [3, "value"], [1, "date-fields"], ["appearance", "outline"], ["matInput", "", 3, "ngModelChange", "matDatepicker", "ngModel"], ["matIconSuffix", "", 3, "for"], ["matInput", "", "required", "", 3, "ngModelChange", "matDatepicker", "ngModel"], [1, "notify-section"], ["for", "notify", 1, "field-label"], ["id", "notify", "matInput", "", "rows", "2", 3, "ngModelChange", "ngModel", "placeholder"], ["mat-stroked-button", "", "type", "button", 3, "click"], [1, "spacer"], ["mat-flat-button", "", "color", "primary", 3, "disabled"], ["mat-flat-button", "", "color", "primary", 3, "click", "disabled"], [1, "field-label"], [1, "readonly-value"], ["matInput", "", "type", "email", "required", "", 3, "ngModelChange", "placeholder", "ngModel"]], template: function ShareSavedSearchExternalDialogComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "h2", 2);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content");
            i0.ɵɵconditionalCreate(4, ShareSavedSearchExternalDialogComponent_Conditional_4_Template, 5, 4)(5, ShareSavedSearchExternalDialogComponent_Conditional_5_Template, 6, 7, "mat-form-field", 3);
            i0.ɵɵelementStart(6, "mat-form-field", 3)(7, "mat-label");
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "mat-select", 4);
            i0.ɵɵtwoWayListener("ngModelChange", function ShareSavedSearchExternalDialogComponent_Template_mat_select_ngModelChange_10_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.right, $event) || (ctx.right = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵrepeaterCreate(11, ShareSavedSearchExternalDialogComponent_For_12_Template, 3, 4, "mat-option", 5, _forTrack0);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(13, "div", 6)(14, "mat-form-field", 7)(15, "mat-label");
            i0.ɵɵtext(16);
            i0.ɵɵpipe(17, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(18, "input", 8);
            i0.ɵɵtwoWayListener("ngModelChange", function ShareSavedSearchExternalDialogComponent_Template_input_ngModelChange_18_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.beginDate, $event) || (ctx.beginDate = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(19, "mat-datepicker-toggle", 9)(20, "mat-datepicker", null, 0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(22, "mat-form-field", 7)(23, "mat-label");
            i0.ɵɵtext(24);
            i0.ɵɵpipe(25, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(26, "input", 10);
            i0.ɵɵtwoWayListener("ngModelChange", function ShareSavedSearchExternalDialogComponent_Template_input_ngModelChange_26_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.endDate, $event) || (ctx.endDate = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(27, "mat-datepicker-toggle", 9)(28, "mat-datepicker", null, 1);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(30, "div", 11)(31, "label", 12);
            i0.ɵɵtext(32);
            i0.ɵɵpipe(33, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(34, "mat-form-field", 3)(35, "textarea", 13);
            i0.ɵɵpipe(36, "translate");
            i0.ɵɵtwoWayListener("ngModelChange", function ShareSavedSearchExternalDialogComponent_Template_textarea_ngModelChange_35_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.notifyComment, $event) || (ctx.notifyComment = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(37, "mat-dialog-actions")(38, "button", 14);
            i0.ɵɵlistener("click", function ShareSavedSearchExternalDialogComponent_Template_button_click_38_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.cancel()); });
            i0.ɵɵtext(39);
            i0.ɵɵpipe(40, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(41, "span", 15);
            i0.ɵɵconditionalCreate(42, ShareSavedSearchExternalDialogComponent_Conditional_42_Template, 3, 4, "button", 16);
            i0.ɵɵelementStart(43, "button", 17);
            i0.ɵɵlistener("click", function ShareSavedSearchExternalDialogComponent_Template_button_click_43_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.create(false)); });
            i0.ɵɵtext(44);
            i0.ɵɵpipe(45, "translate");
            i0.ɵɵpipe(46, "translate");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            const fromPicker_r6 = i0.ɵɵreference(21);
            const toPicker_r7 = i0.ɵɵreference(29);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 19, "shared-ui.share-saved-search-external-dialog.share-with-external-user"), "\n");
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.isEditMode ? 4 : 5);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 21, "shared-ui.share-saved-search-external-dialog.right"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.right);
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.rightOptions);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 23, "shared-ui.share-saved-search-external-dialog.from"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", fromPicker_r6);
            i0.ɵɵtwoWayProperty("ngModel", ctx.beginDate);
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", fromPicker_r6);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(25, 25, "shared-ui.share-saved-search-external-dialog.to"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", toPicker_r7);
            i0.ɵɵtwoWayProperty("ngModel", ctx.endDate);
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", toPicker_r7);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(33, 27, "shared-ui.share-saved-search-external-dialog.notification-email"));
            i0.ɵɵadvance(3);
            i0.ɵɵtwoWayProperty("ngModel", ctx.notifyComment);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(36, 29, "shared-ui.share-saved-search-external-dialog.hi-could-you-comment-on-this"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(40, 31, "shared-ui.share-saved-search-external-dialog.cancel"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(!ctx.isEditMode ? 42 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", !ctx.isValid() || ctx.saving());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.isEditMode ? i0.ɵɵpipeBind1(45, 33, "ui.update") : i0.ɵɵpipeBind1(46, 35, "ui.create"), " ");
        } }, dependencies: [FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.RequiredValidator, i1.NgModel, MatDialogModule, i2.MatDialogTitle, i2.MatDialogActions, i2.MatDialogContent, MatFormFieldModule, i3.MatFormField, i3.MatLabel, i3.MatSuffix, MatInputModule, i4.MatInput, MatSelectModule, i5.MatSelect, i5.MatOption, MatButtonModule, i6.MatButton, MatDatepickerModule, i7.MatDatepicker, i7.MatDatepickerInput, i7.MatDatepickerToggle, DescriptorLabelPipe,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  min-width: 560px;\n}\n\nmat-dialog-content[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  padding-top: 8px !important;\n}\n\n.full-width[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n.date-fields[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n}\n\n.date-fields[_ngcontent-%COMP%]   mat-form-field[_ngcontent-%COMP%] {\n  flex: 1;\n}\n\n.notify-section[_ngcontent-%COMP%] {\n  margin-top: 2px;\n}\n\n.field-label[_ngcontent-%COMP%] {\n  display: block;\n  font-size: 14px;\n  font-weight: 500;\n  color: #475467;\n  margin-bottom: 6px;\n}\n\n.readonly-value[_ngcontent-%COMP%] {\n  width: 100%;\n  border: 1px solid #d0d5dd;\n  border-radius: 6px;\n  padding: 10px 12px;\n  font-size: 14px;\n  color: #101828;\n  background: #f9fafb;\n  box-sizing: border-box;\n}\n\nmat-dialog-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 10px;\n  padding: 8px 24px 16px;\n}\n\n.spacer[_ngcontent-%COMP%] {\n  flex: 1;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ShareSavedSearchExternalDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-share-saved-search-external-dialog', standalone: true, imports: [
                    DescriptorLabelPipe,
                    TranslatePipe,
                    FormsModule,
                    MatDialogModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatSelectModule,
                    MatButtonModule,
                    MatDatepickerModule,
                ], providers: [provideSatoriDateAdapter(), provideTranslatedDatepickerIntl()], template: "<h2 mat-dialog-title>\n  {{ 'shared-ui.share-saved-search-external-dialog.share-with-external-user' | translate }}\n</h2>\n\n<mat-dialog-content>\n  @if (isEditMode) {\n    <div class=\"field-label\">\n      {{ 'shared-ui.share-saved-search-external-dialog.email' | translate }}\n    </div>\n    <div class=\"readonly-value\">{{ email }}</div>\n  } @else {\n    <mat-form-field appearance=\"outline\" class=\"full-width\">\n      <mat-label>{{\n        'shared-ui.share-saved-search-external-dialog.email-2' | translate\n      }}</mat-label>\n      <input\n        matInput\n        type=\"email\"\n        [placeholder]=\"'common.email-example' | translate\"\n        [(ngModel)]=\"email\"\n        required\n      />\n    </mat-form-field>\n  }\n\n  <mat-form-field appearance=\"outline\" class=\"full-width\">\n    <mat-label>{{ 'shared-ui.share-saved-search-external-dialog.right' | translate }}</mat-label>\n    <mat-select [(ngModel)]=\"right\">\n      @for (opt of rightOptions; track opt.value) {\n        <mat-option [value]=\"opt.value\">{{ opt | descriptorLabel }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n\n  <div class=\"date-fields\">\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'shared-ui.share-saved-search-external-dialog.from' | translate }}</mat-label>\n      <input matInput [matDatepicker]=\"fromPicker\" [(ngModel)]=\"beginDate\" />\n      <mat-datepicker-toggle matIconSuffix [for]=\"fromPicker\" />\n      <mat-datepicker #fromPicker />\n    </mat-form-field>\n\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'shared-ui.share-saved-search-external-dialog.to' | translate }}</mat-label>\n      <input matInput [matDatepicker]=\"toPicker\" [(ngModel)]=\"endDate\" required />\n      <mat-datepicker-toggle matIconSuffix [for]=\"toPicker\" />\n      <mat-datepicker #toPicker />\n    </mat-form-field>\n  </div>\n\n  <div class=\"notify-section\">\n    <label class=\"field-label\" for=\"notify\">{{\n      'shared-ui.share-saved-search-external-dialog.notification-email' | translate\n    }}</label>\n    <mat-form-field appearance=\"outline\" class=\"full-width\">\n      <textarea\n        id=\"notify\"\n        matInput\n        rows=\"2\"\n        [(ngModel)]=\"notifyComment\"\n        [placeholder]=\"\n          'shared-ui.share-saved-search-external-dialog.hi-could-you-comment-on-this' | translate\n        \"\n      ></textarea>\n    </mat-form-field>\n  </div>\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-stroked-button type=\"button\" (click)=\"cancel()\">\n    {{ 'shared-ui.share-saved-search-external-dialog.cancel' | translate }}\n  </button>\n  <span class=\"spacer\"></span>\n  @if (!isEditMode) {\n    <button\n      mat-flat-button\n      color=\"primary\"\n      [disabled]=\"!isValid() || saving()\"\n      (click)=\"create(true)\"\n    >\n      {{ 'shared-ui.share-saved-search-external-dialog.create-and-add-another' | translate }}\n    </button>\n  }\n  <button\n    mat-flat-button\n    color=\"primary\"\n    [disabled]=\"!isValid() || saving()\"\n    (click)=\"create(false)\"\n  >\n    {{ isEditMode ? ('ui.update' | translate) : ('ui.create' | translate) }}\n  </button>\n</mat-dialog-actions>\n", styles: [":host {\n  display: block;\n  min-width: 560px;\n}\n\nmat-dialog-content {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  padding-top: 8px !important;\n}\n\n.full-width {\n  width: 100%;\n}\n\n.date-fields {\n  display: flex;\n  gap: 12px;\n}\n\n.date-fields mat-form-field {\n  flex: 1;\n}\n\n.notify-section {\n  margin-top: 2px;\n}\n\n.field-label {\n  display: block;\n  font-size: 14px;\n  font-weight: 500;\n  color: #475467;\n  margin-bottom: 6px;\n}\n\n.readonly-value {\n  width: 100%;\n  border: 1px solid #d0d5dd;\n  border-radius: 6px;\n  padding: 10px 12px;\n  font-size: 14px;\n  color: #101828;\n  background: #f9fafb;\n  box-sizing: border-box;\n}\n\nmat-dialog-actions {\n  display: flex;\n  gap: 10px;\n  padding: 8px 24px 16px;\n}\n\n.spacer {\n  flex: 1;\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ShareSavedSearchExternalDialogComponent, { className: "ShareSavedSearchExternalDialogComponent", filePath: "libs/shared/ui/src/lib/share-saved-search-external-dialog/share-saved-search-external-dialog.component.ts", lineNumber: 53 }); })();
