import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, viewChild, } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DocumentLayoutFormComponent, readValidationFailure, } from '@agentic-ui/shared/document-layouts';
import { BrowseService } from '@nuxeo/satori-platform/nuxeo-client';
import { provideSatoriDateAdapter, provideTranslatedDatepickerIntl, } from '@nuxeo/satori-platform/ui';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/dialog";
import * as i3 from "@angular/material/icon";
import * as i4 from "@angular/material/progress-spinner";
function EditDocumentDialogComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 1)(1, "mat-icon", 7);
    i0.ɵɵtext(2, "error");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx);
} }
function EditDocumentDialogComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 6);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "document-detail.edit-document-dialog.saving"));
} }
function EditDocumentDialogComponent_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "document-detail.edit-document-dialog.save"), " ");
} }
/**
 * Edits a document's properties: its type's edit layout — contributed, or generated from its
 * schemas and its dynamic facets' — or the form a `documentEdit` entry contributes.
 *
 * Save sends only what changed, and closes without a request when nothing did. Nuxeo's
 * constraint messages go on the fields they name; anything else is reported in the dialog,
 * which stays open with the user's input intact.
 */
export class EditDocumentDialogComponent {
    dialogRef = inject((MatDialogRef));
    data = inject(MAT_DIALOG_DATA);
    browseService = inject(BrowseService);
    translate = inject(TranslateService);
    destroyRef = inject(DestroyRef);
    form = viewChild(DocumentLayoutFormComponent, ...(ngDevMode ? [{ debugName: "form" }] : []));
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    /** Why the last save failed, when no field could say so. */
    saveError = signal(null, ...(ngDevMode ? [{ debugName: "saveError" }] : []));
    save() {
        const form = this.form();
        if (this.saving() || !form?.ready())
            return;
        this.saveError.set(null);
        if (!form.validate())
            return;
        const changes = form.changedProperties();
        if (Object.keys(changes).length === 0) {
            this.dialogRef.close();
            return;
        }
        this.saving.set(true);
        this.browseService
            .updateDocument(this.data.document.uid, changes)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (updated) => {
                this.saving.set(false);
                this.dialogRef.close(updated);
            },
            error: (failure) => {
                this.saving.set(false);
                this.saveError.set(this.failureMessage(form, failure));
            },
        });
    }
    failureMessage(form, failure) {
        const errors = readValidationFailure(failure, this.translate.instant('document-detail.edit-document-dialog.not-accepted'));
        if (errors) {
            const unplaced = form.showServerErrors(errors);
            return unplaced.length ? unplaced.join(' ') : null;
        }
        const forbidden = failure instanceof HttpErrorResponse && failure.status === 403;
        return this.translate.instant(forbidden
            ? 'document-detail.edit-document-dialog.save-forbidden'
            : 'document-detail.edit-document-dialog.save-failed');
    }
    static ɵfac = function EditDocumentDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || EditDocumentDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: EditDocumentDialogComponent, selectors: [["lib-edit-document-dialog"]], viewQuery: function EditDocumentDialogComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.form, DocumentLayoutFormComponent, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, features: [i0.ɵɵProvidersFeature([provideTranslatedDatepickerIntl(), provideSatoriDateAdapter()])], decls: 14, vars: 13, consts: [["mat-dialog-title", ""], ["role", "alert", 1, "edit-document-dialog__error"], ["mode", "edit", 3, "document", "disabled", "headingLevel"], ["mat-stroked-button", "", "mat-dialog-close", "", 3, "disabled"], [1, "edit-document-dialog__spacer"], ["mat-flat-button", "", "color", "primary", 3, "click", "disabled"], ["diameter", "18"], ["aria-hidden", "true"]], template: function EditDocumentDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "h2", 0);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content");
            i0.ɵɵconditionalCreate(4, EditDocumentDialogComponent_Conditional_4_Template, 5, 1, "div", 1);
            i0.ɵɵelement(5, "lib-document-layout-form", 2);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "mat-dialog-actions")(7, "button", 3);
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(10, "span", 4);
            i0.ɵɵelementStart(11, "button", 5);
            i0.ɵɵlistener("click", function EditDocumentDialogComponent_Template_button_click_11_listener() { return ctx.save(); });
            i0.ɵɵconditionalCreate(12, EditDocumentDialogComponent_Conditional_12_Template, 2, 3, "mat-spinner", 6)(13, EditDocumentDialogComponent_Conditional_13_Template, 2, 3);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            let tmp_1_0;
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 9, "document-detail.edit-document-dialog.edit-document"));
            i0.ɵɵadvance(3);
            i0.ɵɵconditional((tmp_1_0 = ctx.saveError()) ? 4 : -1, tmp_1_0);
            i0.ɵɵadvance();
            i0.ɵɵproperty("document", ctx.data.document)("disabled", ctx.saving())("headingLevel", 3);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.saving());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(9, 11, "document-detail.edit-document-dialog.cancel"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.saving());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.saving() ? 12 : 13);
        } }, dependencies: [DocumentLayoutFormComponent,
            MatButtonModule, i1.MatButton, MatDialogModule, i2.MatDialogClose, i2.MatDialogTitle, i2.MatDialogActions, i2.MatDialogContent, MatIconModule, i3.MatIcon, MatProgressSpinnerModule, i4.MatProgressSpinner, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\nmat-dialog-content[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  padding-top: 12px !important;\n}\n\n.edit-document-dialog__error[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 8px;\n  padding: 12px 16px;\n  border-radius: 8px;\n  background: var(--mat-sys-error-container);\n  color: var(--mat-sys-on-error-container);\n}\n\nmat-dialog-actions[_ngcontent-%COMP%] {\n  display: flex;\n  padding: 8px 24px 16px;\n}\n\n.edit-document-dialog__spacer[_ngcontent-%COMP%] {\n  flex: 1;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(EditDocumentDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-edit-document-dialog', standalone: true, imports: [
                    DocumentLayoutFormComponent,
                    MatButtonModule,
                    MatDialogModule,
                    MatIconModule,
                    MatProgressSpinnerModule,
                    TranslatePipe,
                ], providers: [provideTranslatedDatepickerIntl(), provideSatoriDateAdapter()], changeDetection: ChangeDetectionStrategy.OnPush, template: "<h2 mat-dialog-title>{{ 'document-detail.edit-document-dialog.edit-document' | translate }}</h2>\n\n<mat-dialog-content>\n  @if (saveError(); as message) {\n    <div class=\"edit-document-dialog__error\" role=\"alert\">\n      <mat-icon aria-hidden=\"true\">error</mat-icon>\n      <span>{{ message }}</span>\n    </div>\n  }\n  <lib-document-layout-form\n    mode=\"edit\"\n    [document]=\"data.document\"\n    [disabled]=\"saving()\"\n    [headingLevel]=\"3\"\n  />\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-stroked-button mat-dialog-close [disabled]=\"saving()\">\n    {{ 'document-detail.edit-document-dialog.cancel' | translate }}\n  </button>\n  <span class=\"edit-document-dialog__spacer\"></span>\n  <button mat-flat-button color=\"primary\" [disabled]=\"saving()\" (click)=\"save()\">\n    @if (saving()) {\n      <mat-spinner\n        diameter=\"18\"\n        [attr.aria-label]=\"'document-detail.edit-document-dialog.saving' | translate\"\n      />\n    } @else {\n      {{ 'document-detail.edit-document-dialog.save' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: [":host {\n  display: block;\n}\n\nmat-dialog-content {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  padding-top: 12px !important;\n}\n\n.edit-document-dialog__error {\n  display: flex;\n  align-items: flex-start;\n  gap: 8px;\n  padding: 12px 16px;\n  border-radius: 8px;\n  background: var(--mat-sys-error-container);\n  color: var(--mat-sys-on-error-container);\n}\n\nmat-dialog-actions {\n  display: flex;\n  padding: 8px 24px 16px;\n}\n\n.edit-document-dialog__spacer {\n  flex: 1;\n}\n"] }]
    }], null, { form: [{ type: i0.ViewChild, args: [i0.forwardRef(() => DocumentLayoutFormComponent), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(EditDocumentDialogComponent, { className: "EditDocumentDialogComponent", filePath: "libs/features/document-detail/src/lib/edit-document-dialog/edit-document-dialog.ts", lineNumber: 55 }); })();
