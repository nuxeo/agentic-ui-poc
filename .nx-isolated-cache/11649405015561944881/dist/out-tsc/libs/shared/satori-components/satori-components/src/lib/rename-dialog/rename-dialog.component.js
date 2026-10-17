import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal, } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { BrowseService } from '@nuxeo/satori-platform/nuxeo-client';
import { nxsErrorStatus } from '../error-state/error-status';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/dialog";
import * as i4 from "@angular/material/form-field";
import * as i5 from "@angular/material/input";
function NxsRenameDialogComponent_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.rename-dialog.required"));
} }
function NxsRenameDialogComponent_Conditional_11_Case_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.rename-dialog.forbidden"), " ");
} }
function NxsRenameDialogComponent_Conditional_11_Case_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.rename-dialog.locked"), " ");
} }
function NxsRenameDialogComponent_Conditional_11_Case_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.rename-dialog.not-found"), " ");
} }
function NxsRenameDialogComponent_Conditional_11_Case_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.rename-dialog.failed"), " ");
} }
function NxsRenameDialogComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 4);
    i0.ɵɵconditionalCreate(1, NxsRenameDialogComponent_Conditional_11_Case_1_Template, 2, 3)(2, NxsRenameDialogComponent_Conditional_11_Case_2_Template, 2, 3)(3, NxsRenameDialogComponent_Conditional_11_Case_3_Template, 2, 3)(4, NxsRenameDialogComponent_Conditional_11_Case_4_Template, 2, 3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_2_0;
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_2_0 = ctx) === 403 ? 1 : tmp_2_0 === 409 ? 2 : tmp_2_0 === 404 ? 3 : 4);
} }
/**
 * Renames a document, as a `MatDialog`: `dialog.open(NxsRenameDialogComponent, { data })`.
 *
 * Renaming is a change of the document's title, `dc:title`, as in Nuxeo Web UI; the name in its
 * path does not change, so links to it keep working. The dialog writes the title itself and closes
 * with the updated document. A refusal stays in the dialog with the reason — no permission, or the
 * document locked by someone else — so the user can cancel or try again; nothing is lost.
 */
export class NxsRenameDialogComponent {
    dialogRef = inject(MatDialogRef);
    browse = inject(BrowseService);
    destroyRef = inject(DestroyRef);
    data = inject(MAT_DIALOG_DATA);
    title = signal(this.data.title ?? '', ...(ngDevMode ? [{ debugName: "title" }] : []));
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    failure = signal(null, ...(ngDevMode ? [{ debugName: "failure" }] : []));
    trimmed = computed(() => this.title().trim(), ...(ngDevMode ? [{ debugName: "trimmed" }] : []));
    unchanged = computed(() => this.trimmed() === (this.data.title ?? '').trim(), ...(ngDevMode ? [{ debugName: "unchanged" }] : []));
    canSave = computed(() => !this.saving() && this.trimmed().length > 0 && !this.unchanged(), ...(ngDevMode ? [{ debugName: "canSave" }] : []));
    save() {
        if (!this.canSave())
            return;
        this.saving.set(true);
        this.failure.set(null);
        this.browse
            .updateDocument(this.data.documentId, { 'dc:title': this.trimmed() })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (doc) => this.dialogRef.close(doc),
            error: (error) => {
                this.saving.set(false);
                const status = error?.status;
                this.failure.set(status === 409 ? 409 : nxsErrorStatus(error));
            },
        });
    }
    cancel() {
        this.dialogRef.close();
    }
    static ɵfac = function NxsRenameDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsRenameDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsRenameDialogComponent, selectors: [["nxs-rename-dialog"]], hostAttrs: [1, "nxs-rename-dialog"], decls: 19, vars: 17, consts: [["mat-dialog-title", ""], [1, "nxs-rename-dialog__form", 3, "ngSubmit"], ["appearance", "outline", 1, "nxs-rename-dialog__field"], ["matInput", "", "name", "title", "required", "", "cdkFocusInitial", "", 3, "ngModelChange", "ngModel", "disabled"], ["role", "alert", 1, "nxs-rename-dialog__failure"], ["align", "end"], ["mat-button", "", "type", "button", 3, "click"], ["mat-flat-button", "", "type", "submit", 3, "disabled"]], template: function NxsRenameDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "h2", 0);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "form", 1);
            i0.ɵɵlistener("ngSubmit", function NxsRenameDialogComponent_Template_form_ngSubmit_3_listener() { return ctx.save(); });
            i0.ɵɵelementStart(4, "mat-dialog-content")(5, "mat-form-field", 2)(6, "mat-label");
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "input", 3);
            i0.ɵɵlistener("ngModelChange", function NxsRenameDialogComponent_Template_input_ngModelChange_9_listener($event) { return ctx.title.set($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(10, NxsRenameDialogComponent_Conditional_10_Template, 3, 3, "mat-error");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(11, NxsRenameDialogComponent_Conditional_11_Template, 5, 1, "p", 4);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(12, "mat-dialog-actions", 5)(13, "button", 6);
            i0.ɵɵlistener("click", function NxsRenameDialogComponent_Template_button_click_13_listener() { return ctx.cancel(); });
            i0.ɵɵtext(14);
            i0.ɵɵpipe(15, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(16, "button", 7);
            i0.ɵɵtext(17);
            i0.ɵɵpipe(18, "translate");
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            let tmp_5_0;
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 9, "satori-components.rename-dialog.title"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 11, "satori-components.rename-dialog.label"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.title())("disabled", ctx.saving());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.trimmed().length === 0 ? 10 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_5_0 = ctx.failure()) ? 11 : -1, tmp_5_0);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(15, 13, "satori-components.rename-dialog.cancel"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.canSave());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(18, 15, "satori-components.rename-dialog.save"), " ");
        } }, dependencies: [FormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.RequiredValidator, i1.NgModel, i1.NgForm, MatButtonModule, i2.MatButton, MatDialogModule, i3.MatDialogTitle, i3.MatDialogActions, i3.MatDialogContent, MatFormFieldModule, i4.MatFormField, i4.MatLabel, i4.MatError, MatInputModule, i5.MatInput, TranslatePipe], styles: ["//[_ngcontent-%COMP%]   As[_ngcontent-%COMP%]   wide[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   field[_ngcontent-%COMP%]   needs[_ngcontent-%COMP%], and[_ngcontent-%COMP%]   never[_ngcontent-%COMP%]   wider[_ngcontent-%COMP%]   than[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   pane[_ngcontent-%COMP%]   MatDialog[_ngcontent-%COMP%]   gives[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   dialog[_ngcontent-%COMP%]:   below[_ngcontent-%COMP%]   600[_ngcontent-%COMP%]   px\n//[_ngcontent-%COMP%]   that[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   `100vw[_ngcontent-%COMP%]   -[_ngcontent-%COMP%]   32px`[_ngcontent-%COMP%], narrower[_ngcontent-%COMP%]   than[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   `95vw`[_ngcontent-%COMP%]   this[_ngcontent-%COMP%]   once[_ngcontent-%COMP%]   was[_ngcontent-%COMP%], which   scrolled   sideways   at   320   px.\n[_nghost-%COMP%] {\n  display: block;\n  width: 440px;\n  max-width: 100%;\n}\n\n.nxs-rename-dialog__field[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n.nxs-rename-dialog__failure[_ngcontent-%COMP%] {\n  margin: 0;\n  font: var(--mat-sys-body-medium);\n  color: var(--mat-sys-error);\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsRenameDialogComponent, [{
        type: Component,
        args: [{ selector: 'nxs-rename-dialog', standalone: true, imports: [
                    FormsModule,
                    MatButtonModule,
                    MatDialogModule,
                    MatFormFieldModule,
                    MatInputModule,
                    TranslatePipe,
                ], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-rename-dialog' }, template: "<h2 mat-dialog-title>{{ 'satori-components.rename-dialog.title' | translate }}</h2>\n<form class=\"nxs-rename-dialog__form\" (ngSubmit)=\"save()\">\n  <mat-dialog-content>\n    <mat-form-field class=\"nxs-rename-dialog__field\" appearance=\"outline\">\n      <mat-label>{{ 'satori-components.rename-dialog.label' | translate }}</mat-label>\n      <input\n        matInput\n        name=\"title\"\n        required\n        cdkFocusInitial\n        [ngModel]=\"title()\"\n        (ngModelChange)=\"title.set($event)\"\n        [disabled]=\"saving()\"\n      />\n      @if (trimmed().length === 0) {\n        <mat-error>{{ 'satori-components.rename-dialog.required' | translate }}</mat-error>\n      }\n    </mat-form-field>\n    @if (failure(); as status) {\n      <p class=\"nxs-rename-dialog__failure\" role=\"alert\">\n        @switch (status) {\n          @case (403) {\n            {{ 'satori-components.rename-dialog.forbidden' | translate }}\n          }\n          @case (409) {\n            {{ 'satori-components.rename-dialog.locked' | translate }}\n          }\n          @case (404) {\n            {{ 'satori-components.rename-dialog.not-found' | translate }}\n          }\n          @default {\n            {{ 'satori-components.rename-dialog.failed' | translate }}\n          }\n        }\n      </p>\n    }\n  </mat-dialog-content>\n  <mat-dialog-actions align=\"end\">\n    <button mat-button type=\"button\" (click)=\"cancel()\">\n      {{ 'satori-components.rename-dialog.cancel' | translate }}\n    </button>\n    <button mat-flat-button type=\"submit\" [disabled]=\"!canSave()\">\n      {{ 'satori-components.rename-dialog.save' | translate }}\n    </button>\n  </mat-dialog-actions>\n</form>\n", styles: ["// As wide as the field needs, and never wider than the pane MatDialog gives the dialog: below 600 px\n// that is `100vw - 32px`, narrower than the `95vw` this once was, which scrolled sideways at 320 px.\n:host {\n  display: block;\n  width: 440px;\n  max-width: 100%;\n}\n\n.nxs-rename-dialog__field {\n  width: 100%;\n}\n\n.nxs-rename-dialog__failure {\n  margin: 0;\n  font: var(--mat-sys-body-medium);\n  color: var(--mat-sys-error);\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsRenameDialogComponent, { className: "NxsRenameDialogComponent", filePath: "libs/shared/satori-components/src/lib/rename-dialog/rename-dialog.component.ts", lineNumber: 52 }); })();
//# sourceMappingURL=rename-dialog.component.js.map