import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DocumentDetailService, isPermissionDeniedError, } from '@nuxeo/satori-platform/nuxeo-client';
import { NxsToastService, provideNxsToast } from '../toast/toast.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/dialog";
import * as i4 from "@angular/material/icon";
import * as i5 from "@angular/material/radio";
const _c0 = (a0, a1) => ({ document: a0, version: a1 });
function NxsCreateVersionDialogComponent_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 8);
    i0.ɵɵtext(1, "autorenew");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, "satori-components.create-version-dialog.creating"), " ");
} }
function NxsCreateVersionDialogComponent_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.create-version-dialog.create"), " ");
} }
/**
 * Create a version of a document — Web UI's `nuxeo-document-create-version` dialog.
 *
 * As in Web UI: Minor and Major are offered with the number each would give, Major chosen first,
 * and Create runs `Document.CreateVersion`, which checks the document in at the new version. A toast
 * names the version created; a refusal reads as one. It does not decide who may version — open it
 * only where `canCreateDocumentVersion(doc)` holds, as `nxs-manage-versions` does.
 */
export class NxsCreateVersionDialogComponent {
    data = inject(MAT_DIALOG_DATA);
    dialogRef = inject(MatDialogRef);
    documents = inject(DocumentDetailService);
    translate = inject(TranslateService);
    toast = inject(NxsToastService);
    destroyRef = inject(DestroyRef);
    increment = 'Major';
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    current = `${this.data.major}.${this.data.minor}`;
    nextMinor = `${this.data.major}.${this.data.minor + 1}`;
    nextMajor = `${this.data.major + 1}.0`;
    create() {
        if (this.saving())
            return;
        this.saving.set(true);
        const label = this.increment === 'Major' ? this.nextMajor : this.nextMinor;
        this.documents
            .createVersion(this.data.documentUid, this.increment)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (version) => {
                this.saving.set(false);
                this.toast.show(this.translate.instant('satori-components.create-version-dialog.created', {
                    version: label,
                }));
                this.dialogRef.close(version);
            },
            error: (err) => {
                this.saving.set(false);
                this.toast.error(this.translate.instant(isPermissionDeniedError(err)
                    ? 'satori-components.create-version-dialog.forbidden'
                    : 'satori-components.create-version-dialog.failed'));
            },
        });
    }
    static ɵfac = function NxsCreateVersionDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsCreateVersionDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsCreateVersionDialogComponent, selectors: [["nxs-create-version-dialog"]], features: [i0.ɵɵProvidersFeature([provideNxsToast()])], decls: 24, vars: 24, consts: [["mat-dialog-title", ""], [1, "nxs-create-version-dialog__options", 3, "ngModelChange", "ngModel"], ["value", "Minor", 1, "nxs-create-version-dialog__option"], [1, "nxs-create-version-dialog__number"], ["value", "Major", 1, "nxs-create-version-dialog__option"], ["mat-stroked-button", "", "type", "button", "mat-dialog-close", ""], [1, "nxs-create-version-dialog__spacer"], ["mat-flat-button", "", "type", "button", 1, "nxs-create-version-dialog__create", 3, "click", "disabled"], ["aria-hidden", "true", 1, "nxs-spinning"]], template: function NxsCreateVersionDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "h2", 0);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content")(4, "mat-radio-group", 1);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵtwoWayListener("ngModelChange", function NxsCreateVersionDialogComponent_Template_mat_radio_group_ngModelChange_4_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.increment, $event) || (ctx.increment = $event); return $event; });
            i0.ɵɵelementStart(6, "mat-radio-button", 2)(7, "span", 3);
            i0.ɵɵtext(8);
            i0.ɵɵelementEnd();
            i0.ɵɵtext(9);
            i0.ɵɵpipe(10, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(11, "mat-radio-button", 4)(12, "span", 3);
            i0.ɵɵtext(13);
            i0.ɵɵelementEnd();
            i0.ɵɵtext(14);
            i0.ɵɵpipe(15, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(16, "mat-dialog-actions")(17, "button", 5);
            i0.ɵɵtext(18);
            i0.ɵɵpipe(19, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(20, "span", 6);
            i0.ɵɵelementStart(21, "button", 7);
            i0.ɵɵlistener("click", function NxsCreateVersionDialogComponent_Template_button_click_21_listener() { return ctx.create(); });
            i0.ɵɵconditionalCreate(22, NxsCreateVersionDialogComponent_Conditional_22_Template, 4, 3)(23, NxsCreateVersionDialogComponent_Conditional_23_Template, 2, 3);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(2, 10, "satori-components.create-version-dialog.title", i0.ɵɵpureFunction2(21, _c0, ctx.data.documentTitle, ctx.current)), "\n");
            i0.ɵɵadvance(3);
            i0.ɵɵtwoWayProperty("ngModel", ctx.increment);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(5, 13, "satori-components.create-version-dialog.kind"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(ctx.nextMinor);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(10, 15, "satori-components.create-version-dialog.minor"), " ");
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(ctx.nextMajor);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(15, 17, "satori-components.create-version-dialog.major"), " ");
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(19, 19, "satori-components.create-version-dialog.cancel"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.saving());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.saving() ? 22 : 23);
        } }, dependencies: [FormsModule, i1.NgControlStatus, i1.NgModel, MatButtonModule, i2.MatButton, MatDialogModule, i3.MatDialogClose, i3.MatDialogTitle, i3.MatDialogActions, i3.MatDialogContent, MatIconModule, i4.MatIcon, MatRadioModule, i5.MatRadioGroup, i5.MatRadioButton, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\nh2[mat-dialog-title][_ngcontent-%COMP%] {\n  overflow-wrap: anywhere;\n}\n\n.nxs-create-version-dialog__options[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n\n.nxs-create-version-dialog__option[_ngcontent-%COMP%] {\n  min-height: 48px;\n}\n\n.nxs-create-version-dialog__number[_ngcontent-%COMP%] {\n  display: inline-flex;\n  justify-content: center;\n  min-width: 40px;\n  margin-inline-end: 12px;\n  padding: 4px 10px;\n  border-radius: 4px;\n  background: var(--mat-sys-primary);\n  color: var(--mat-sys-on-primary);\n  font-weight: 600;\n}\n\nmat-dialog-actions[_ngcontent-%COMP%] {\n  gap: 12px;\n}\n\n.nxs-create-version-dialog__spacer[_ngcontent-%COMP%] {\n  flex: 1;\n}\n\n//[_ngcontent-%COMP%]   A[_ngcontent-%COMP%]   spinning[_ngcontent-%COMP%]   icon[_ngcontent-%COMP%], not[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   progress[_ngcontent-%COMP%]   indicator[_ngcontent-%COMP%], inside[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:   a[_ngcontent-%COMP%]   progressbar[_ngcontent-%COMP%]   there[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   an\n//[_ngcontent-%COMP%]   interactive[_ngcontent-%COMP%]   element[_ngcontent-%COMP%]   nested[_ngcontent-%COMP%]   in[_ngcontent-%COMP%]   another[_ngcontent-%COMP%]   (axe nested-interactive)[_ngcontent-%COMP%], and[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   spinner[_ngcontent-%COMP%]   breaks[_ngcontent-%COMP%]   the\n//[_ngcontent-%COMP%]   button's[_ngcontent-%COMP%]   layout[_ngcontent-%COMP%]   (AGENTS/08-bug-patterns.md 15).\n.nxs-spinning[_ngcontent-%COMP%] {\n  animation: nxs-spin 1s linear infinite;\n}\n\n@keyframes _ngcontent-%COMP%_nxs-spin {\n  to {\n    transform: rotate(360deg);\n  }\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsCreateVersionDialogComponent, [{
        type: Component,
        args: [{ selector: 'nxs-create-version-dialog', standalone: true, imports: [
                    FormsModule,
                    MatButtonModule,
                    MatDialogModule,
                    MatIconModule,
                    MatRadioModule,
                    TranslatePipe,
                ], providers: [provideNxsToast()], changeDetection: ChangeDetectionStrategy.OnPush, template: "<h2 mat-dialog-title>\n  {{\n    'satori-components.create-version-dialog.title'\n      | translate: { document: data.documentTitle, version: current }\n  }}\n</h2>\n\n<mat-dialog-content>\n  <mat-radio-group\n    class=\"nxs-create-version-dialog__options\"\n    [(ngModel)]=\"increment\"\n    [attr.aria-label]=\"'satori-components.create-version-dialog.kind' | translate\"\n  >\n    <mat-radio-button value=\"Minor\" class=\"nxs-create-version-dialog__option\">\n      <span class=\"nxs-create-version-dialog__number\">{{ nextMinor }}</span>\n      {{ 'satori-components.create-version-dialog.minor' | translate }}\n    </mat-radio-button>\n    <mat-radio-button value=\"Major\" class=\"nxs-create-version-dialog__option\">\n      <span class=\"nxs-create-version-dialog__number\">{{ nextMajor }}</span>\n      {{ 'satori-components.create-version-dialog.major' | translate }}\n    </mat-radio-button>\n  </mat-radio-group>\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-stroked-button type=\"button\" mat-dialog-close>\n    {{ 'satori-components.create-version-dialog.cancel' | translate }}\n  </button>\n  <span class=\"nxs-create-version-dialog__spacer\"></span>\n  <button\n    mat-flat-button\n    type=\"button\"\n    class=\"nxs-create-version-dialog__create\"\n    [disabled]=\"saving()\"\n    (click)=\"create()\"\n  >\n    @if (saving()) {\n      <mat-icon class=\"nxs-spinning\" aria-hidden=\"true\">autorenew</mat-icon>\n      {{ 'satori-components.create-version-dialog.creating' | translate }}\n    } @else {\n      {{ 'satori-components.create-version-dialog.create' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: [":host {\n  display: block;\n}\n\nh2[mat-dialog-title] {\n  overflow-wrap: anywhere;\n}\n\n.nxs-create-version-dialog__options {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n\n.nxs-create-version-dialog__option {\n  min-height: 48px;\n}\n\n.nxs-create-version-dialog__number {\n  display: inline-flex;\n  justify-content: center;\n  min-width: 40px;\n  margin-inline-end: 12px;\n  padding: 4px 10px;\n  border-radius: 4px;\n  background: var(--mat-sys-primary);\n  color: var(--mat-sys-on-primary);\n  font-weight: 600;\n}\n\nmat-dialog-actions {\n  gap: 12px;\n}\n\n.nxs-create-version-dialog__spacer {\n  flex: 1;\n}\n\n// A spinning icon, not a progress indicator, inside the button: a progressbar there is an\n// interactive element nested in another (axe nested-interactive), and a spinner breaks the\n// button's layout (AGENTS/08-bug-patterns.md 15).\n.nxs-spinning {\n  animation: nxs-spin 1s linear infinite;\n}\n\n@keyframes nxs-spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsCreateVersionDialogComponent, { className: "NxsCreateVersionDialogComponent", filePath: "libs/shared/satori-components/src/lib/create-version-dialog/create-version-dialog.component.ts", lineNumber: 53 }); })();
