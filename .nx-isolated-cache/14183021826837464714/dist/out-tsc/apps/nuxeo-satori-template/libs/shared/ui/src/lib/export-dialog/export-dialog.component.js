import { Component, inject, signal } from '@angular/core';
import { DescriptorLabelPipe } from '@nuxeo/satori-platform/extensions';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/dialog";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/icon";
import * as i4 from "@angular/material/progress-spinner";
const _forTrack0 = ($index, $item) => $item.type;
function ExportDialogComponent_For_5_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 6);
} }
function ExportDialogComponent_For_5_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 3);
    i0.ɵɵlistener("click", function ExportDialogComponent_For_5_Template_button_click_0_listener() { const option_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.onExport(option_r2.type)); });
    i0.ɵɵelementStart(1, "mat-icon", 4);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 5);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "descriptorLabel");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(6, ExportDialogComponent_For_5_Conditional_6_Template, 1, 0, "mat-spinner", 6);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const option_r2 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r2.exporting());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(option_r2.icon);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 4, option_r2));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.exporting() === option_r2.type ? 6 : -1);
} }
export class ExportDialogComponent {
    dialogRef = inject((MatDialogRef));
    data = inject(MAT_DIALOG_DATA);
    exporting = signal(null, ...(ngDevMode ? [{ debugName: "exporting" }] : []));
    options = [
        { type: 'thumbnail', labelKey: 'rendition.thumbnail', label: 'Thumbnail', icon: 'image' },
        { type: 'pdf', labelKey: 'rendition.pdf', label: 'PDF', icon: 'picture_as_pdf' },
        { type: 'zip', labelKey: 'rendition.zip', label: 'ZIP Export', icon: 'folder_zip' },
        { type: 'xml', labelKey: 'rendition.xml', label: 'XML Export', icon: 'code' },
    ];
    onExport(type) {
        if (this.exporting())
            return;
        this.exporting.set(type);
        const extMap = {
            thumbnail: 'png',
            pdf: 'pdf',
            zip: 'zip',
            xml: 'xml',
        };
        const ext = extMap[type];
        const filename = `${this.data.documentTitle}.${ext}`;
        this.data.exportFn(type, this.data.documentUid).subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
                this.exporting.set(null);
                this.dialogRef.close(true);
            },
            error: () => {
                this.exporting.set(null);
            },
        });
    }
    static ɵfac = function ExportDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ExportDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ExportDialogComponent, selectors: [["lib-export-dialog"]], decls: 10, vars: 7, consts: [["mat-dialog-title", ""], [1, "export-option", 3, "disabled"], ["mat-stroked-button", "", "mat-dialog-close", "", 3, "disabled"], [1, "export-option", 3, "click", "disabled"], [1, "export-option-icon"], [1, "export-option-label"], ["diameter", "18", 1, "export-spinner"]], template: function ExportDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "h2", 0);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content");
            i0.ɵɵrepeaterCreate(4, ExportDialogComponent_For_5_Template, 7, 6, "button", 1, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "mat-dialog-actions")(7, "button", 2);
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "translate");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 3, "shared-ui.export-dialog.export"));
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.options);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", !!ctx.exporting());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(9, 5, "shared-ui.export-dialog.cancel"), " ");
        } }, dependencies: [MatDialogModule, i1.MatDialogClose, i1.MatDialogTitle, i1.MatDialogActions, i1.MatDialogContent, MatButtonModule, i2.MatButton, MatIconModule, i3.MatIcon, MatProgressSpinnerModule, i4.MatProgressSpinner, DescriptorLabelPipe,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n        display: block;\n        min-width: 400px;\n      }\n\n      mat-dialog-content[_ngcontent-%COMP%] {\n        display: flex;\n        flex-direction: column;\n        gap: 4px;\n        padding: 16px 24px !important;\n      }\n\n      .export-option[_ngcontent-%COMP%] {\n        display: flex;\n        align-items: center;\n        gap: 16px;\n        padding: 14px 16px;\n        border: none;\n        background: none;\n        cursor: pointer;\n        border-radius: 6px;\n        transition: background 0.15s;\n        width: 100%;\n        text-align: left;\n\n        &:hover:not(:disabled) {\n          background: var(--mat-sys-surface-container-low);\n        }\n\n        &:disabled {\n          opacity: 0.6;\n          cursor: default;\n        }\n      }\n\n      .export-option-icon[_ngcontent-%COMP%] {\n        font-size: 22px;\n        width: 22px;\n        height: 22px;\n        color: var(--mat-sys-on-surface-variant);\n      }\n\n      .export-option-label[_ngcontent-%COMP%] {\n        font-size: 14px;\n        color: var(--mat-sys-primary);\n        font-weight: 500;\n      }\n\n      .export-spinner[_ngcontent-%COMP%] {\n        margin-left: auto;\n      }\n\n      mat-dialog-actions[_ngcontent-%COMP%] {\n        padding: 8px 24px 16px;\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ExportDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-export-dialog', standalone: true, imports: [
                    DescriptorLabelPipe,
                    TranslatePipe,
                    MatDialogModule,
                    MatButtonModule,
                    MatIconModule,
                    MatProgressSpinnerModule,
                ], template: "<h2 mat-dialog-title>{{ 'shared-ui.export-dialog.export' | translate }}</h2>\n\n<mat-dialog-content>\n  @for (option of options; track option.type) {\n    <button class=\"export-option\" [disabled]=\"exporting()\" (click)=\"onExport(option.type)\">\n      <mat-icon class=\"export-option-icon\">{{ option.icon }}</mat-icon>\n      <span class=\"export-option-label\">{{ option | descriptorLabel }}</span>\n      @if (exporting() === option.type) {\n        <mat-spinner diameter=\"18\" class=\"export-spinner\" />\n      }\n    </button>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-stroked-button mat-dialog-close [disabled]=\"!!exporting()\">\n    {{ 'shared-ui.export-dialog.cancel' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: ["\n      :host {\n        display: block;\n        min-width: 400px;\n      }\n\n      mat-dialog-content {\n        display: flex;\n        flex-direction: column;\n        gap: 4px;\n        padding: 16px 24px !important;\n      }\n\n      .export-option {\n        display: flex;\n        align-items: center;\n        gap: 16px;\n        padding: 14px 16px;\n        border: none;\n        background: none;\n        cursor: pointer;\n        border-radius: 6px;\n        transition: background 0.15s;\n        width: 100%;\n        text-align: left;\n\n        &:hover:not(:disabled) {\n          background: var(--mat-sys-surface-container-low);\n        }\n\n        &:disabled {\n          opacity: 0.6;\n          cursor: default;\n        }\n      }\n\n      .export-option-icon {\n        font-size: 22px;\n        width: 22px;\n        height: 22px;\n        color: var(--mat-sys-on-surface-variant);\n      }\n\n      .export-option-label {\n        font-size: 14px;\n        color: var(--mat-sys-primary);\n        font-weight: 500;\n      }\n\n      .export-spinner {\n        margin-left: auto;\n      }\n\n      mat-dialog-actions {\n        padding: 8px 24px 16px;\n      }\n    "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ExportDialogComponent, { className: "ExportDialogComponent", filePath: "libs/shared/ui/src/lib/export-dialog/export-dialog.component.ts", lineNumber: 98 }); })();
