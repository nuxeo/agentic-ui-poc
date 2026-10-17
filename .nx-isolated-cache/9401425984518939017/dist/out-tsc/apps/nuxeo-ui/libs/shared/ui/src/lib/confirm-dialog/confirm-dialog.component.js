import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/dialog";
import * as i2 from "@angular/material/button";
export class ConfirmDialogComponent {
    data = inject(MAT_DIALOG_DATA);
    static ɵfac = function ConfirmDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ConfirmDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ConfirmDialogComponent, selectors: [["lib-confirm-dialog"]], decls: 11, vars: 9, consts: [["mat-dialog-title", ""], [1, "msg"], ["align", "end", 1, "actions"], ["type", "button", "mat-button", "", "mat-dialog-close", ""], ["type", "button", "mat-flat-button", "", "color", "warn", 3, "mat-dialog-close"]], template: function ConfirmDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "h2", 0);
            i0.ɵɵtext(1);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(2, "mat-dialog-content", 1);
            i0.ɵɵtext(3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "mat-dialog-actions", 2)(5, "button", 3);
            i0.ɵɵtext(6);
            i0.ɵɵpipe(7, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "button", 4);
            i0.ɵɵtext(9);
            i0.ɵɵpipe(10, "translate");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(ctx.data.title);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.data.message);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(7, 5, "shared-ui.confirm-dialog.cancel"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("mat-dialog-close", true);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.data.confirmLabel ?? i0.ɵɵpipeBind1(10, 7, "ui.confirm"), " ");
        } }, dependencies: [MatDialogModule, i1.MatDialogClose, i1.MatDialogTitle, i1.MatDialogActions, i1.MatDialogContent, MatButtonModule, i2.MatButton, TranslatePipe], styles: [".msg[_ngcontent-%COMP%] {\n        padding-top: 0.35rem;\n        max-width: 28rem;\n        line-height: 1.5;\n      }\n      .actions[_ngcontent-%COMP%] {\n        gap: 0.5rem;\n        padding: 0.75rem 1.5rem 1.25rem;\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ConfirmDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-confirm-dialog', standalone: true, imports: [TranslatePipe, MatDialogModule, MatButtonModule], template: "<h2 mat-dialog-title>{{ data.title }}</h2>\n<mat-dialog-content class=\"msg\">{{ data.message }}</mat-dialog-content>\n<mat-dialog-actions align=\"end\" class=\"actions\">\n  <button type=\"button\" mat-button mat-dialog-close>\n    {{ 'shared-ui.confirm-dialog.cancel' | translate }}\n  </button>\n  <button type=\"button\" mat-flat-button color=\"warn\" [mat-dialog-close]=\"true\">\n    {{ data.confirmLabel ?? ('ui.confirm' | translate) }}\n  </button>\n</mat-dialog-actions>\n", styles: ["\n      .msg {\n        padding-top: 0.35rem;\n        max-width: 28rem;\n        line-height: 1.5;\n      }\n      .actions {\n        gap: 0.5rem;\n        padding: 0.75rem 1.5rem 1.25rem;\n      }\n    "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ConfirmDialogComponent, { className: "ConfirmDialogComponent", filePath: "libs/shared/ui/src/lib/confirm-dialog/confirm-dialog.component.ts", lineNumber: 31 }); })();
