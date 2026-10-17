import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
function ReplaceAttachmentDialogComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span", 3);
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx.name);
} }
function ReplaceAttachmentDialogComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span", 4);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "document-detail.replace-attachment-dialog.upload-main-file"));
} }
export class ReplaceAttachmentDialogComponent {
    dialogRef = inject((MatDialogRef));
    data = inject(MAT_DIALOG_DATA);
    selectedFile = signal(null, ...(ngDevMode ? [{ debugName: "selectedFile" }] : []));
    onFileSelected(event) {
        const input = event.target;
        if (input.files?.[0]) {
            this.selectedFile.set(input.files[0]);
        }
    }
    onDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('dragover');
    }
    onDragLeave(event) {
        event.currentTarget.classList.remove('dragover');
    }
    onDrop(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('dragover');
        const file = event.dataTransfer?.files?.[0];
        if (file) {
            this.selectedFile.set(file);
        }
    }
    cancel() {
        this.dialogRef.close(null);
    }
    confirm() {
        this.dialogRef.close(this.selectedFile());
    }
    static ɵfac = function ReplaceAttachmentDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ReplaceAttachmentDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ReplaceAttachmentDialogComponent, selectors: [["lib-replace-attachment-dialog"]], decls: 16, vars: 13, consts: [["fileInput", ""], [1, "replace-dialog"], [1, "upload-zone", 3, "dragover", "dragleave", "drop"], [1, "file-chosen"], [1, "upload-link"], ["type", "file", "hidden", "", 3, "change"], [1, "dialog-actions"], [1, "btn-cancel", 3, "click"], [1, "btn-replace", 3, "click", "disabled"]], template: function ReplaceAttachmentDialogComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵdomElementStart(0, "div", 1)(1, "h2");
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(4, "label", 2);
            i0.ɵɵdomListener("dragover", function ReplaceAttachmentDialogComponent_Template_label_dragover_4_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onDragOver($event)); })("dragleave", function ReplaceAttachmentDialogComponent_Template_label_dragleave_4_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onDragLeave($event)); })("drop", function ReplaceAttachmentDialogComponent_Template_label_drop_4_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onDrop($event)); });
            i0.ɵɵconditionalCreate(5, ReplaceAttachmentDialogComponent_Conditional_5_Template, 2, 1, "span", 3)(6, ReplaceAttachmentDialogComponent_Conditional_6_Template, 3, 3, "span", 4);
            i0.ɵɵdomElementStart(7, "input", 5, 0);
            i0.ɵɵdomListener("change", function ReplaceAttachmentDialogComponent_Template_input_change_7_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onFileSelected($event)); });
            i0.ɵɵdomElementEnd()();
            i0.ɵɵdomElementStart(9, "div", 6)(10, "button", 7);
            i0.ɵɵdomListener("click", function ReplaceAttachmentDialogComponent_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.cancel()); });
            i0.ɵɵtext(11);
            i0.ɵɵpipe(12, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(13, "button", 8);
            i0.ɵɵdomListener("click", function ReplaceAttachmentDialogComponent_Template_button_click_13_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.confirm()); });
            i0.ɵɵtext(14);
            i0.ɵɵpipe(15, "translate");
            i0.ɵɵdomElementEnd()()();
        } if (rf & 2) {
            let tmp_3_0;
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 7, "document-detail.replace-attachment-dialog.replace-file"));
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("has-file", ctx.selectedFile());
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_3_0 = ctx.selectedFile()) ? 5 : 6, tmp_3_0);
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(12, 9, "document-detail.replace-attachment-dialog.cancel"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵdomProperty("disabled", !ctx.selectedFile());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(15, 11, "document-detail.replace-attachment-dialog.replace"), " ");
        } }, dependencies: [MatDialogModule, TranslatePipe], styles: [".replace-dialog[_ngcontent-%COMP%] {\n        padding: 28px 32px;\n        width: min(95vw, 400px);\n        max-width: 95vw;\n        box-sizing: border-box;\n      }\n\n      h2[_ngcontent-%COMP%] {\n        margin: 0 0 24px;\n        font-size: 20px;\n        font-weight: 600;\n        color: var(--mat-sys-on-surface);\n      }\n\n      .upload-zone[_ngcontent-%COMP%] {\n        display: block;\n        border: 2px dashed var(--mat-sys-outline-variant);\n        border-radius: 6px;\n        padding: 32px 16px;\n        text-align: center;\n        cursor: pointer;\n        transition:\n          border-color 0.15s,\n          background 0.15s;\n        margin-bottom: 24px;\n\n        &:hover,\n        &.dragover {\n          border-color: var(--mat-sys-primary);\n          background: var(--mat-sys-primary-container);\n        }\n\n        &.has-file {\n          border-color: var(--mat-sys-primary);\n          background: var(--mat-sys-primary-container);\n        }\n      }\n\n      .upload-link[_ngcontent-%COMP%] {\n        font-size: 14px;\n        color: var(--mat-sys-primary);\n        text-decoration: underline;\n        cursor: pointer;\n      }\n\n      .file-chosen[_ngcontent-%COMP%] {\n        font-size: 14px;\n        color: var(--mat-sys-on-surface);\n        font-weight: 500;\n      }\n\n      .dialog-actions[_ngcontent-%COMP%] {\n        display: flex;\n        justify-content: flex-start;\n        gap: 12px;\n      }\n\n      .btn-cancel[_ngcontent-%COMP%] {\n        padding: 8px 24px;\n        border: 1px solid #ccc;\n        border-radius: 4px;\n        background: #fff;\n        color: #3f51b5;\n        font-size: 14px;\n        font-weight: 500;\n        cursor: pointer;\n\n        &:hover {\n          background: #f5f5f5;\n        }\n      }\n\n      .btn-replace[_ngcontent-%COMP%] {\n        padding: 8px 24px;\n        border: none;\n        border-radius: 4px;\n        background: #3f51b5;\n        color: #fff;\n        font-size: 14px;\n        font-weight: 500;\n        cursor: pointer;\n\n        &:disabled {\n          background: #c5cae9;\n          cursor: not-allowed;\n        }\n\n        &:not(:disabled):hover {\n          background: #3949ab;\n        }\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ReplaceAttachmentDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-replace-attachment-dialog', standalone: true, imports: [TranslatePipe, MatDialogModule], template: "<div class=\"replace-dialog\">\n  <h2>{{ 'document-detail.replace-attachment-dialog.replace-file' | translate }}</h2>\n\n  <label\n    class=\"upload-zone\"\n    [class.has-file]=\"selectedFile()\"\n    (dragover)=\"onDragOver($event)\"\n    (dragleave)=\"onDragLeave($event)\"\n    (drop)=\"onDrop($event)\"\n  >\n    @if (selectedFile(); as file) {\n      <span class=\"file-chosen\">{{ file.name }}</span>\n    } @else {\n      <span class=\"upload-link\">{{\n        'document-detail.replace-attachment-dialog.upload-main-file' | translate\n      }}</span>\n    }\n    <input #fileInput type=\"file\" hidden (change)=\"onFileSelected($event)\" />\n  </label>\n\n  <div class=\"dialog-actions\">\n    <button class=\"btn-cancel\" (click)=\"cancel()\">\n      {{ 'document-detail.replace-attachment-dialog.cancel' | translate }}\n    </button>\n    <button class=\"btn-replace\" [disabled]=\"!selectedFile()\" (click)=\"confirm()\">\n      {{ 'document-detail.replace-attachment-dialog.replace' | translate }}\n    </button>\n  </div>\n</div>\n", styles: ["\n      .replace-dialog {\n        padding: 28px 32px;\n        width: min(95vw, 400px);\n        max-width: 95vw;\n        box-sizing: border-box;\n      }\n\n      h2 {\n        margin: 0 0 24px;\n        font-size: 20px;\n        font-weight: 600;\n        color: var(--mat-sys-on-surface);\n      }\n\n      .upload-zone {\n        display: block;\n        border: 2px dashed var(--mat-sys-outline-variant);\n        border-radius: 6px;\n        padding: 32px 16px;\n        text-align: center;\n        cursor: pointer;\n        transition:\n          border-color 0.15s,\n          background 0.15s;\n        margin-bottom: 24px;\n\n        &:hover,\n        &.dragover {\n          border-color: var(--mat-sys-primary);\n          background: var(--mat-sys-primary-container);\n        }\n\n        &.has-file {\n          border-color: var(--mat-sys-primary);\n          background: var(--mat-sys-primary-container);\n        }\n      }\n\n      .upload-link {\n        font-size: 14px;\n        color: var(--mat-sys-primary);\n        text-decoration: underline;\n        cursor: pointer;\n      }\n\n      .file-chosen {\n        font-size: 14px;\n        color: var(--mat-sys-on-surface);\n        font-weight: 500;\n      }\n\n      .dialog-actions {\n        display: flex;\n        justify-content: flex-start;\n        gap: 12px;\n      }\n\n      .btn-cancel {\n        padding: 8px 24px;\n        border: 1px solid #ccc;\n        border-radius: 4px;\n        background: #fff;\n        color: #3f51b5;\n        font-size: 14px;\n        font-weight: 500;\n        cursor: pointer;\n\n        &:hover {\n          background: #f5f5f5;\n        }\n      }\n\n      .btn-replace {\n        padding: 8px 24px;\n        border: none;\n        border-radius: 4px;\n        background: #3f51b5;\n        color: #fff;\n        font-size: 14px;\n        font-weight: 500;\n        cursor: pointer;\n\n        &:disabled {\n          background: #c5cae9;\n          cursor: not-allowed;\n        }\n\n        &:not(:disabled):hover {\n          background: #3949ab;\n        }\n      }\n    "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ReplaceAttachmentDialogComponent, { className: "ReplaceAttachmentDialogComponent", filePath: "libs/features/document-detail/src/lib/replace-attachment-dialog/replace-attachment-dialog.ts", lineNumber: 110 }); })();
