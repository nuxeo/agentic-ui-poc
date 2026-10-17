import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NxsToastService, provideNxsToast } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/dialog";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/icon";
const _c0 = a0 => ({ name: a0 });
export class ShareDialogComponent {
    data = inject(MAT_DIALOG_DATA);
    dialogRef = inject((MatDialogRef));
    translate = inject(TranslateService);
    toast = inject(NxsToastService);
    copyLink() {
        navigator.clipboard.writeText(this.data.url).then(() => this.toast.show(this.translate.instant('shared-ui.message.link-copied-to-clipboard')), () => this.toast.error(this.translate.instant('shared-ui.message.failed-to-copy-link')));
    }
    static ɵfac = function ShareDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ShareDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ShareDialogComponent, selectors: [["lib-share-dialog"]], features: [i0.ɵɵProvidersFeature([provideNxsToast()])], decls: 19, vars: 19, consts: [["linkInput", ""], ["mat-dialog-title", ""], [1, "share-subtitle"], [1, "share-link-row"], ["readonly", "", 1, "share-link-input", 3, "value"], ["mat-icon-button", "", 1, "copy-btn", 3, "click"], ["mat-flat-button", "", "color", "primary", "mat-dialog-close", ""]], template: function ShareDialogComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "h2", 1);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content")(4, "p", 2);
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "div", 3);
            i0.ɵɵelement(8, "input", 4, 0);
            i0.ɵɵpipe(10, "translate");
            i0.ɵɵelementStart(11, "button", 5);
            i0.ɵɵpipe(12, "translate");
            i0.ɵɵlistener("click", function ShareDialogComponent_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.copyLink()); });
            i0.ɵɵelementStart(13, "mat-icon");
            i0.ɵɵtext(14, "link");
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(15, "mat-dialog-actions")(16, "button", 6);
            i0.ɵɵtext(17);
            i0.ɵɵpipe(18, "translate");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 6, "shared-ui.share-dialog.share-the-document"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(6, 8, "shared-ui.share-dialog.internal-access-link-to", i0.ɵɵpureFunction1(17, _c0, ctx.data.title)), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("value", ctx.data.url);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(10, 11, "shared-ui.share-dialog.share-link"));
            i0.ɵɵadvance(3);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(12, 13, "shared-ui.share-dialog.copy-link"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(18, 15, "shared-ui.share-dialog.close"), " ");
        } }, dependencies: [MatDialogModule, i1.MatDialogClose, i1.MatDialogTitle, i1.MatDialogActions, i1.MatDialogContent, MatButtonModule, i2.MatButton, i2.MatIconButton, MatIconModule, i3.MatIcon, TranslatePipe], styles: ["[_nghost-%COMP%] {\n        display: block;\n        min-width: 420px;\n      }\n\n      .share-subtitle[_ngcontent-%COMP%] {\n        margin: 0 0 16px;\n        font-size: 14px;\n        color: #555;\n      }\n\n      .share-link-row[_ngcontent-%COMP%] {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        border: 1px solid #e0e0e0;\n        border-radius: 6px;\n        padding: 4px 4px 4px 12px;\n        background: #fafafa;\n      }\n\n      .share-link-input[_ngcontent-%COMP%] {\n        flex: 1;\n        border: none;\n        background: transparent;\n        font-size: 13px;\n        color: var(--mat-sys-on-surface);\n        outline: none;\n        min-width: 0;\n        font-family: inherit;\n      }\n\n      .copy-btn[_ngcontent-%COMP%] {\n        flex-shrink: 0;\n        color: var(--mat-sys-primary);\n      }\n\n      mat-dialog-actions[_ngcontent-%COMP%] {\n        padding: 8px 24px 16px;\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ShareDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-share-dialog', standalone: true, imports: [TranslatePipe, MatDialogModule, MatButtonModule, MatIconModule], providers: [provideNxsToast()], template: "<h2 mat-dialog-title>{{ 'shared-ui.share-dialog.share-the-document' | translate }}</h2>\n\n<mat-dialog-content>\n  <p class=\"share-subtitle\">\n    {{ 'shared-ui.share-dialog.internal-access-link-to' | translate: { name: data.title } }}\n  </p>\n  <div class=\"share-link-row\">\n    <input\n      class=\"share-link-input\"\n      readonly\n      [value]=\"data.url\"\n      #linkInput\n      [attr.aria-label]=\"'shared-ui.share-dialog.share-link' | translate\"\n    />\n    <button\n      mat-icon-button\n      class=\"copy-btn\"\n      (click)=\"copyLink()\"\n      [attr.aria-label]=\"'shared-ui.share-dialog.copy-link' | translate\"\n    >\n      <mat-icon>link</mat-icon>\n    </button>\n  </div>\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-flat-button color=\"primary\" mat-dialog-close>\n    {{ 'shared-ui.share-dialog.close' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: ["\n      :host {\n        display: block;\n        min-width: 420px;\n      }\n\n      .share-subtitle {\n        margin: 0 0 16px;\n        font-size: 14px;\n        color: #555;\n      }\n\n      .share-link-row {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        border: 1px solid #e0e0e0;\n        border-radius: 6px;\n        padding: 4px 4px 4px 12px;\n        background: #fafafa;\n      }\n\n      .share-link-input {\n        flex: 1;\n        border: none;\n        background: transparent;\n        font-size: 13px;\n        color: var(--mat-sys-on-surface);\n        outline: none;\n        min-width: 0;\n        font-family: inherit;\n      }\n\n      .copy-btn {\n        flex-shrink: 0;\n        color: var(--mat-sys-primary);\n      }\n\n      mat-dialog-actions {\n        padding: 8px 24px 16px;\n      }\n    "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ShareDialogComponent, { className: "ShareDialogComponent", filePath: "libs/shared/ui/src/lib/share-dialog/share-dialog.component.ts", lineNumber: 64 }); })();
