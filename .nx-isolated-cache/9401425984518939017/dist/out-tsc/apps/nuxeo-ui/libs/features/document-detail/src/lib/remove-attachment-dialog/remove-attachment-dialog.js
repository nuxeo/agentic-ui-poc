import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
export class RemoveAttachmentDialogComponent {
    dialogRef = inject((MatDialogRef));
    cancel() {
        this.dialogRef.close(false);
    }
    confirm() {
        this.dialogRef.close(true);
    }
    static ɵfac = function RemoveAttachmentDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || RemoveAttachmentDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: RemoveAttachmentDialogComponent, selectors: [["lib-remove-attachment-dialog"]], decls: 14, vars: 12, consts: [[1, "remove-dialog"], [1, "dialog-actions"], [1, "btn-no", 3, "click"], [1, "btn-yes", 3, "click"]], template: function RemoveAttachmentDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "div", 0)(1, "h2");
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(4, "p");
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(7, "div", 1)(8, "button", 2);
            i0.ɵɵdomListener("click", function RemoveAttachmentDialogComponent_Template_button_click_8_listener() { return ctx.cancel(); });
            i0.ɵɵtext(9);
            i0.ɵɵpipe(10, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(11, "button", 3);
            i0.ɵɵdomListener("click", function RemoveAttachmentDialogComponent_Template_button_click_11_listener() { return ctx.confirm(); });
            i0.ɵɵtext(12);
            i0.ɵɵpipe(13, "translate");
            i0.ɵɵdomElementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 4, "document-detail.remove-attachment-dialog.remove-file"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 6, "document-detail.remove-attachment-dialog.do-you-really-want-to-remove"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(10, 8, "document-detail.remove-attachment-dialog.no"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(13, 10, "document-detail.remove-attachment-dialog.yes"), " ");
        } }, dependencies: [MatDialogModule, TranslatePipe], styles: [".remove-dialog[_ngcontent-%COMP%] {\n        padding: 28px 32px;\n        width: min(95vw, 340px);\n        max-width: 95vw;\n        box-sizing: border-box;\n      }\n\n      h2[_ngcontent-%COMP%] {\n        margin: 0 0 16px;\n        font-size: 20px;\n        font-weight: 600;\n        color: #1a1a1a;\n      }\n\n      p[_ngcontent-%COMP%] {\n        margin: 0 0 28px;\n        font-size: 14px;\n        color: #555;\n      }\n\n      .dialog-actions[_ngcontent-%COMP%] {\n        display: flex;\n        justify-content: flex-start;\n        gap: 12px;\n      }\n\n      .btn-no[_ngcontent-%COMP%] {\n        padding: 8px 24px;\n        border: 1px solid #ccc;\n        border-radius: 4px;\n        background: #fff;\n        color: #3f51b5;\n        font-size: 14px;\n        font-weight: 500;\n        cursor: pointer;\n\n        &:hover {\n          background: #f5f5f5;\n        }\n      }\n\n      .btn-yes[_ngcontent-%COMP%] {\n        padding: 8px 24px;\n        border: none;\n        border-radius: 4px;\n        background: #3f51b5;\n        color: #fff;\n        font-size: 14px;\n        font-weight: 500;\n        cursor: pointer;\n\n        &:hover {\n          background: #3949ab;\n        }\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(RemoveAttachmentDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-remove-attachment-dialog', standalone: true, imports: [TranslatePipe, MatDialogModule], template: "<div class=\"remove-dialog\">\n  <h2>{{ 'document-detail.remove-attachment-dialog.remove-file' | translate }}</h2>\n  <p>{{ 'document-detail.remove-attachment-dialog.do-you-really-want-to-remove' | translate }}</p>\n\n  <div class=\"dialog-actions\">\n    <button class=\"btn-no\" (click)=\"cancel()\">\n      {{ 'document-detail.remove-attachment-dialog.no' | translate }}\n    </button>\n    <button class=\"btn-yes\" (click)=\"confirm()\">\n      {{ 'document-detail.remove-attachment-dialog.yes' | translate }}\n    </button>\n  </div>\n</div>\n", styles: ["\n      .remove-dialog {\n        padding: 28px 32px;\n        width: min(95vw, 340px);\n        max-width: 95vw;\n        box-sizing: border-box;\n      }\n\n      h2 {\n        margin: 0 0 16px;\n        font-size: 20px;\n        font-weight: 600;\n        color: #1a1a1a;\n      }\n\n      p {\n        margin: 0 0 28px;\n        font-size: 14px;\n        color: #555;\n      }\n\n      .dialog-actions {\n        display: flex;\n        justify-content: flex-start;\n        gap: 12px;\n      }\n\n      .btn-no {\n        padding: 8px 24px;\n        border: 1px solid #ccc;\n        border-radius: 4px;\n        background: #fff;\n        color: #3f51b5;\n        font-size: 14px;\n        font-weight: 500;\n        cursor: pointer;\n\n        &:hover {\n          background: #f5f5f5;\n        }\n      }\n\n      .btn-yes {\n        padding: 8px 24px;\n        border: none;\n        border-radius: 4px;\n        background: #3f51b5;\n        color: #fff;\n        font-size: 14px;\n        font-weight: 500;\n        cursor: pointer;\n\n        &:hover {\n          background: #3949ab;\n        }\n      }\n    "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(RemoveAttachmentDialogComponent, { className: "RemoveAttachmentDialogComponent", filePath: "libs/features/document-detail/src/lib/remove-attachment-dialog/remove-attachment-dialog.ts", lineNumber: 70 }); })();
