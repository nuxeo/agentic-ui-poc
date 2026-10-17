import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { map } from 'rxjs';
import { DEFAULT_VOCABULARY_ORDERING, DirectoryService, defaultVocabularyLabel, directoryEntryDisplayLabel, directoryUsesL10nLabel, resolveParentSourceName, vocabularyParentRequired, vocabularySupportsParent, } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/dialog";
import * as i3 from "@angular/material/button";
import * as i4 from "@angular/material/form-field";
import * as i5 from "@angular/material/input";
import * as i6 from "@angular/material/select";
import * as i7 from "@angular/material/slide-toggle";
import * as i8 from "@angular/material/progress-spinner";
const _forTrack0 = ($index, $item) => $item.id;
function VocabularyEntryFormDialogComponent_Conditional_5_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 11);
    i0.ɵɵelement(1, "mat-spinner", 13);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.vocabulary-entry-form-dialog.loading"));
} }
function VocabularyEntryFormDialogComponent_Conditional_5_Conditional_1_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 15);
    i0.ɵɵtext(1, "\u2014");
    i0.ɵɵelementEnd();
} }
function VocabularyEntryFormDialogComponent_Conditional_5_Conditional_1_For_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 15);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const option_r3 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("value", option_r3.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.parentOptionLabel(option_r3));
} }
function VocabularyEntryFormDialogComponent_Conditional_5_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-form-field", 12)(1, "mat-label");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "mat-select", 14);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵtwoWayListener("ngModelChange", function VocabularyEntryFormDialogComponent_Conditional_5_Conditional_1_Template_mat_select_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.parent, $event) || (ctx_r1.parent = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵconditionalCreate(6, VocabularyEntryFormDialogComponent_Conditional_5_Conditional_1_Conditional_6_Template, 2, 0, "mat-option", 15);
    i0.ɵɵrepeaterCreate(7, VocabularyEntryFormDialogComponent_Conditional_5_Conditional_1_For_8_Template, 2, 2, "mat-option", 15, _forTrack0);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 5, "admin.vocabulary-entry-form-dialog.parent"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.parent);
    i0.ɵɵproperty("required", ctx_r1.parentRequired)("placeholder", i0.ɵɵpipeBind1(5, 7, "admin.vocabulary-entry-form-dialog.select-a-parent"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r1.parentRequired ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.parentOptions());
} }
function VocabularyEntryFormDialogComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, VocabularyEntryFormDialogComponent_Conditional_5_Conditional_0_Template, 3, 3, "div", 11)(1, VocabularyEntryFormDialogComponent_Conditional_5_Conditional_1_Template, 9, 9, "mat-form-field", 12);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r1.loadingParents() ? 0 : 1);
} }
export class VocabularyEntryFormDialogComponent {
    dialogRef = inject(MatDialogRef);
    directoryService = inject(DirectoryService);
    destroyRef = inject(DestroyRef);
    data = inject(MAT_DIALOG_DATA);
    showParentField = false;
    parentRequired = false;
    usesL10nLabel = directoryUsesL10nLabel(this.data.directoryName);
    parentOptions = signal([], ...(ngDevMode ? [{ debugName: "parentOptions" }] : []));
    loadingParents = signal(false, ...(ngDevMode ? [{ debugName: "loadingParents" }] : []));
    id = this.data.entry?.id ?? '';
    label = this.data.entry?.label ?? '';
    ordering = this.data.entry?.ordering ?? DEFAULT_VOCABULARY_ORDERING;
    obsolete = this.data.entry?.obsolete ?? false;
    parent = this.data.entry?.parent ?? '';
    suggestedLabel = '';
    ngOnInit() {
        this.showParentField = this.resolveShowParentField();
        if (!this.showParentField)
            return;
        this.loadingParents.set(true);
        const sourceName = resolveParentSourceName(this.data.directoryName, this.data.directoryMeta);
        this.parentRequired = vocabularyParentRequired(this.data.directoryName, this.data.directoryMeta);
        if (!sourceName) {
            this.loadingParents.set(false);
            return;
        }
        if (sourceName === this.data.directoryName) {
            const options = this.sortParentOptions(this.l10nParentOptions(this.data.siblingEntries ?? [], this.data.entry?.id));
            this.parentOptions.set(options);
            this.loadingParents.set(false);
            return;
        }
        this.directoryService
            .getAdminEntries(sourceName)
            .pipe(map((entries) => this.sortParentOptions(entries.filter((entry) => entry.id !== this.data.entry?.id))), takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (options) => {
                this.parentOptions.set(options);
                this.loadingParents.set(false);
            },
            error: () => this.loadingParents.set(false),
        });
    }
    onIdChange() {
        if (this.data.mode !== 'create' || this.usesL10nLabel)
            return;
        const suggested = defaultVocabularyLabel(this.data.directoryName, this.id);
        if (!this.label.trim() || this.label === this.suggestedLabel) {
            this.label = suggested;
            this.suggestedLabel = suggested;
        }
    }
    parentOptionLabel(option) {
        return directoryEntryDisplayLabel(option);
    }
    canSubmit() {
        const trimmedId = this.id.trim();
        if (!trimmedId)
            return false;
        if (this.parentRequired && !this.parent.trim())
            return false;
        if (this.usesL10nLabel && !this.label.trim())
            return false;
        return true;
    }
    submit() {
        if (!this.canSubmit())
            return;
        const trimmedId = this.id.trim();
        const resolvedLabel = this.label.trim() ||
            (this.usesL10nLabel ? '' : defaultVocabularyLabel(this.data.directoryName, trimmedId));
        this.dialogRef.close({
            mode: this.data.mode,
            id: trimmedId,
            label: resolvedLabel,
            ordering: this.ordering,
            obsolete: this.obsolete,
            parent: this.showParentField ? this.parent.trim() : undefined,
        });
    }
    sortParentOptions(options) {
        return [...options].sort((a, b) => directoryEntryDisplayLabel(a).localeCompare(directoryEntryDisplayLabel(b)));
    }
    l10nParentOptions(entries, excludeId) {
        return entries.filter((entry) => entry.id !== excludeId && !entry.parent);
    }
    resolveShowParentField() {
        const { directoryName, directoryMeta, entry, siblingEntries } = this.data;
        const entries = entry ? [entry, ...(siblingEntries ?? [])] : (siblingEntries ?? []);
        return vocabularySupportsParent(directoryName, directoryMeta, entries);
    }
    static ɵfac = function VocabularyEntryFormDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || VocabularyEntryFormDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: VocabularyEntryFormDialogComponent, selectors: [["lib-vocabulary-entry-form-dialog"]], decls: 33, vars: 36, consts: [["mat-dialog-title", "", "role", "heading", "aria-level", "2", 1, "dialog-title"], [1, "form"], ["appearance", "outline", 1, "full"], ["matInput", "", "name", "entryId", "required", "", "autocomplete", "off", 3, "ngModelChange", "ngModel", "disabled"], ["matInput", "", "name", "entryLabel", "autocomplete", "off", 3, "ngModelChange", "ngModel", "required"], [1, "obsolete-row"], ["name", "entryObsolete", 3, "ngModelChange", "ngModel"], ["matInput", "", "name", "entryOrdering", "type", "number", "required", "", 3, "ngModelChange", "ngModel"], ["align", "end", 1, "dialog-actions"], ["type", "button", "mat-button", "", "mat-dialog-close", ""], ["type", "button", "mat-flat-button", "", "color", "primary", 3, "click", "disabled"], [1, "parent-loading"], ["appearance", "outline", 1, "full", "first-field"], ["diameter", "28"], ["name", "entryParent", 3, "ngModelChange", "ngModel", "required", "placeholder"], [3, "value"]], template: function VocabularyEntryFormDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵpipe(3, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "mat-dialog-content", 1);
            i0.ɵɵconditionalCreate(5, VocabularyEntryFormDialogComponent_Conditional_5_Template, 2, 1);
            i0.ɵɵelementStart(6, "mat-form-field", 2)(7, "mat-label");
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "input", 3);
            i0.ɵɵtwoWayListener("ngModelChange", function VocabularyEntryFormDialogComponent_Template_input_ngModelChange_10_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.id, $event) || (ctx.id = $event); return $event; });
            i0.ɵɵlistener("ngModelChange", function VocabularyEntryFormDialogComponent_Template_input_ngModelChange_10_listener() { return ctx.onIdChange(); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(11, "mat-form-field", 2)(12, "mat-label");
            i0.ɵɵtext(13);
            i0.ɵɵpipe(14, "translate");
            i0.ɵɵpipe(15, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(16, "input", 4);
            i0.ɵɵtwoWayListener("ngModelChange", function VocabularyEntryFormDialogComponent_Template_input_ngModelChange_16_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.label, $event) || (ctx.label = $event); return $event; });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(17, "div", 5)(18, "mat-slide-toggle", 6);
            i0.ɵɵtwoWayListener("ngModelChange", function VocabularyEntryFormDialogComponent_Template_mat_slide_toggle_ngModelChange_18_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.obsolete, $event) || (ctx.obsolete = $event); return $event; });
            i0.ɵɵtext(19);
            i0.ɵɵpipe(20, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(21, "mat-form-field", 2)(22, "mat-label");
            i0.ɵɵtext(23);
            i0.ɵɵpipe(24, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(25, "input", 7);
            i0.ɵɵtwoWayListener("ngModelChange", function VocabularyEntryFormDialogComponent_Template_input_ngModelChange_25_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.ordering, $event) || (ctx.ordering = $event); return $event; });
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(26, "mat-dialog-actions", 8)(27, "button", 9);
            i0.ɵɵtext(28);
            i0.ɵɵpipe(29, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(30, "button", 10);
            i0.ɵɵlistener("click", function VocabularyEntryFormDialogComponent_Template_button_click_30_listener() { return ctx.submit(); });
            i0.ɵɵtext(31);
            i0.ɵɵpipe(32, "translate");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate2(" ", ctx.data.mode === "create" ? i0.ɵɵpipeBind1(2, 18, "administration.add-entry") : i0.ɵɵpipeBind1(3, 20, "administration.edit-entry"), " \u2014 ", ctx.data.directoryName, "\n");
            i0.ɵɵadvance(4);
            i0.ɵɵconditional(ctx.showParentField ? 5 : -1);
            i0.ɵɵadvance();
            i0.ɵɵclassProp("first-field", !ctx.showParentField);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 22, "admin.vocabulary-entry-form-dialog.id"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.id);
            i0.ɵɵproperty("disabled", ctx.data.mode === "edit");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.usesL10nLabel ? i0.ɵɵpipeBind1(14, 24, "administration.label-en") : i0.ɵɵpipeBind1(15, 26, "administration.label"));
            i0.ɵɵadvance(3);
            i0.ɵɵtwoWayProperty("ngModel", ctx.label);
            i0.ɵɵproperty("required", ctx.usesL10nLabel || ctx.data.mode === "edit");
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.obsolete);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 28, "admin.vocabulary-entry-form-dialog.obsolete"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 30, "admin.vocabulary-entry-form-dialog.ordering"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.ordering);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(29, 32, "admin.vocabulary-entry-form-dialog.cancel"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.canSubmit() || ctx.loadingParents());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(32, 34, "admin.vocabulary-entry-form-dialog.save"), " ");
        } }, dependencies: [FormsModule, i1.DefaultValueAccessor, i1.NumberValueAccessor, i1.NgControlStatus, i1.RequiredValidator, i1.NgModel, MatDialogModule, i2.MatDialogClose, i2.MatDialogTitle, i2.MatDialogActions, i2.MatDialogContent, MatButtonModule, i3.MatButton, MatFormFieldModule, i4.MatFormField, i4.MatLabel, MatInputModule, i5.MatInput, MatSelectModule, i6.MatSelect, i6.MatOption, MatSlideToggleModule, i7.MatSlideToggle, MatProgressSpinnerModule, i8.MatProgressSpinner, TranslatePipe], styles: ["[_nghost-%COMP%] {\n        display: block;\n      }\n      .dialog-title[_ngcontent-%COMP%] {\n        padding: 0 1.5rem 0.75rem;\n        margin: 0;\n        font-size: 1.25rem;\n        font-weight: 500;\n        line-height: 1.4;\n      }\n      .form[_ngcontent-%COMP%] {\n        display: flex;\n        flex-direction: column;\n        gap: 0.75rem;\n        min-width: 420px;\n        padding-top: 2.75rem;\n        padding-bottom: 0.5rem;\n        overflow-x: hidden;\n      }\n      .first-field[_ngcontent-%COMP%] {\n        margin-top: 0.25rem;\n      }\n      .full[_ngcontent-%COMP%] {\n        width: 100%;\n      }\n      .dialog-actions[_ngcontent-%COMP%] {\n        gap: 0.5rem;\n        padding: 0.75rem 1.5rem 1.25rem;\n      }\n      .obsolete-row[_ngcontent-%COMP%] {\n        margin: 0.15rem 0 0.25rem;\n      }\n      .parent-loading[_ngcontent-%COMP%] {\n        display: flex;\n        justify-content: center;\n        padding: 0.5rem 0;\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(VocabularyEntryFormDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-vocabulary-entry-form-dialog', standalone: true, imports: [
                    TranslatePipe,
                    FormsModule,
                    MatDialogModule,
                    MatButtonModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatSelectModule,
                    MatSlideToggleModule,
                    MatProgressSpinnerModule,
                ], template: "<div mat-dialog-title class=\"dialog-title\" role=\"heading\" aria-level=\"2\">\n  {{\n    data.mode === 'create'\n      ? ('administration.add-entry' | translate)\n      : ('administration.edit-entry' | translate)\n  }}\n  \u2014 {{ data.directoryName }}\n</div>\n<mat-dialog-content class=\"form\">\n  @if (showParentField) {\n    @if (loadingParents()) {\n      <div class=\"parent-loading\">\n        <mat-spinner\n          diameter=\"28\"\n          [attr.aria-label]=\"'admin.vocabulary-entry-form-dialog.loading' | translate\"\n        />\n      </div>\n    } @else {\n      <mat-form-field appearance=\"outline\" class=\"full first-field\">\n        <mat-label>{{ 'admin.vocabulary-entry-form-dialog.parent' | translate }}</mat-label>\n        <mat-select\n          name=\"entryParent\"\n          [(ngModel)]=\"parent\"\n          [required]=\"parentRequired\"\n          [placeholder]=\"'admin.vocabulary-entry-form-dialog.select-a-parent' | translate\"\n        >\n          @if (!parentRequired) {\n            <mat-option [value]=\"\">\u2014</mat-option>\n          }\n          @for (option of parentOptions(); track option.id) {\n            <mat-option [value]=\"option.id\">{{ parentOptionLabel(option) }}</mat-option>\n          }\n        </mat-select>\n      </mat-form-field>\n    }\n  }\n\n  <mat-form-field appearance=\"outline\" class=\"full\" [class.first-field]=\"!showParentField\">\n    <mat-label>{{ 'admin.vocabulary-entry-form-dialog.id' | translate }}</mat-label>\n    <input\n      matInput\n      name=\"entryId\"\n      [(ngModel)]=\"id\"\n      (ngModelChange)=\"onIdChange()\"\n      [disabled]=\"data.mode === 'edit'\"\n      required\n      autocomplete=\"off\"\n    />\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" class=\"full\">\n    <mat-label>{{\n      usesL10nLabel ? ('administration.label-en' | translate) : ('administration.label' | translate)\n    }}</mat-label>\n    <input\n      matInput\n      name=\"entryLabel\"\n      [(ngModel)]=\"label\"\n      [required]=\"usesL10nLabel || data.mode === 'edit'\"\n      autocomplete=\"off\"\n    />\n  </mat-form-field>\n\n  <div class=\"obsolete-row\">\n    <mat-slide-toggle name=\"entryObsolete\" [(ngModel)]=\"obsolete\">{{\n      'admin.vocabulary-entry-form-dialog.obsolete' | translate\n    }}</mat-slide-toggle>\n  </div>\n\n  <mat-form-field appearance=\"outline\" class=\"full\">\n    <mat-label>{{ 'admin.vocabulary-entry-form-dialog.ordering' | translate }}</mat-label>\n    <input matInput name=\"entryOrdering\" type=\"number\" [(ngModel)]=\"ordering\" required />\n  </mat-form-field>\n</mat-dialog-content>\n<mat-dialog-actions align=\"end\" class=\"dialog-actions\">\n  <button type=\"button\" mat-button mat-dialog-close>\n    {{ 'admin.vocabulary-entry-form-dialog.cancel' | translate }}\n  </button>\n  <button\n    type=\"button\"\n    mat-flat-button\n    color=\"primary\"\n    (click)=\"submit()\"\n    [disabled]=\"!canSubmit() || loadingParents()\"\n  >\n    {{ 'admin.vocabulary-entry-form-dialog.save' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: ["\n      :host {\n        display: block;\n      }\n      .dialog-title {\n        padding: 0 1.5rem 0.75rem;\n        margin: 0;\n        font-size: 1.25rem;\n        font-weight: 500;\n        line-height: 1.4;\n      }\n      .form {\n        display: flex;\n        flex-direction: column;\n        gap: 0.75rem;\n        min-width: 420px;\n        padding-top: 2.75rem;\n        padding-bottom: 0.5rem;\n        overflow-x: hidden;\n      }\n      .first-field {\n        margin-top: 0.25rem;\n      }\n      .full {\n        width: 100%;\n      }\n      .dialog-actions {\n        gap: 0.5rem;\n        padding: 0.75rem 1.5rem 1.25rem;\n      }\n      .obsolete-row {\n        margin: 0.15rem 0 0.25rem;\n      }\n      .parent-loading {\n        display: flex;\n        justify-content: center;\n        padding: 0.5rem 0;\n      }\n    "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(VocabularyEntryFormDialogComponent, { className: "VocabularyEntryFormDialogComponent", filePath: "libs/features/administration/src/lib/vocabulary-entry-form-dialog/vocabulary-entry-form-dialog.component.ts", lineNumber: 102 }); })();
