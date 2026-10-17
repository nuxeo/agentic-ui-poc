import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/dialog";
import * as i2 from "@angular/material/button";
const _c0 = a0 => ({ minutes: a0 });
export class SessionExpiryWarningDialogComponent {
    data = inject(MAT_DIALOG_DATA);
    static ɵfac = function SessionExpiryWarningDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SessionExpiryWarningDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SessionExpiryWarningDialogComponent, selectors: [["app-session-expiry-warning-dialog"]], decls: 13, vars: 17, consts: [["mat-dialog-title", ""], [1, "session-expiry-warning-dialog__message"], ["align", "end", 1, "session-expiry-warning-dialog__actions"], ["type", "button", "mat-button", "", 3, "mat-dialog-close"], ["type", "button", "mat-flat-button", "", "color", "primary", 3, "mat-dialog-close"]], template: function SessionExpiryWarningDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "h2", 0);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content", 1);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "mat-dialog-actions", 2)(7, "button", 3);
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "button", 4);
            i0.ɵɵtext(11);
            i0.ɵɵpipe(12, "translate");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 6, "app.session-expiry-warning-dialog.session-expiring"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(5, 8, ctx.data.warningMinutes === 1 ? "app.session-expiry-warning-dialog.expiry-message-one" : "app.session-expiry-warning-dialog.expiry-message-many", i0.ɵɵpureFunction1(15, _c0, ctx.data.warningMinutes)), "\n");
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("mat-dialog-close", false);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(9, 11, "app.session-expiry-warning-dialog.sign-out"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("mat-dialog-close", true);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(12, 13, "app.session-expiry-warning-dialog.stay-signed-in"), " ");
        } }, dependencies: [MatDialogModule, i1.MatDialogClose, i1.MatDialogTitle, i1.MatDialogActions, i1.MatDialogContent, MatButtonModule, i2.MatButton, TranslatePipe], styles: [".session-expiry-warning-dialog__message[_ngcontent-%COMP%] {\n  padding-top: 0.35rem;\n  max-width: 28rem;\n  line-height: 1.5;\n}\n\n.session-expiry-warning-dialog__actions[_ngcontent-%COMP%] {\n  gap: 0.5rem;\n  padding: 0.75rem 1.5rem 1.25rem;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SessionExpiryWarningDialogComponent, [{
        type: Component,
        args: [{ selector: 'app-session-expiry-warning-dialog', standalone: true, imports: [TranslatePipe, MatDialogModule, MatButtonModule], template: "<h2 mat-dialog-title>{{ 'app.session-expiry-warning-dialog.session-expiring' | translate }}</h2>\n<mat-dialog-content class=\"session-expiry-warning-dialog__message\">\n  {{\n    (data.warningMinutes === 1\n      ? 'app.session-expiry-warning-dialog.expiry-message-one'\n      : 'app.session-expiry-warning-dialog.expiry-message-many'\n    ) | translate: { minutes: data.warningMinutes }\n  }}\n</mat-dialog-content>\n<mat-dialog-actions align=\"end\" class=\"session-expiry-warning-dialog__actions\">\n  <button type=\"button\" mat-button [mat-dialog-close]=\"false\">\n    {{ 'app.session-expiry-warning-dialog.sign-out' | translate }}\n  </button>\n  <button type=\"button\" mat-flat-button color=\"primary\" [mat-dialog-close]=\"true\">\n    {{ 'app.session-expiry-warning-dialog.stay-signed-in' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: [".session-expiry-warning-dialog__message {\n  padding-top: 0.35rem;\n  max-width: 28rem;\n  line-height: 1.5;\n}\n\n.session-expiry-warning-dialog__actions {\n  gap: 0.5rem;\n  padding: 0.75rem 1.5rem 1.25rem;\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SessionExpiryWarningDialogComponent, { className: "SessionExpiryWarningDialogComponent", filePath: "apps/nuxeo-ui/src/app/auth/session-expiry-warning-dialog.component.ts", lineNumber: 17 }); })();
