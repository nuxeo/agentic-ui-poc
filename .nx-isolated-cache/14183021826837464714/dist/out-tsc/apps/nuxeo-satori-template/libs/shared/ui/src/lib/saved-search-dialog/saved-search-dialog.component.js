import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/dialog";
import * as i2 from "@angular/material/button";
function SavedSearchDialogComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 2);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "shared-ui.saved-search-dialog.no-slash"), " ");
} }
export const SAVED_SEARCH_DIALOG_OPTIONS = {
    autoFocus: true,
};
export class SavedSearchDialogComponent {
    dialogRef = inject((MatDialogRef));
    data = inject(MAT_DIALOG_DATA, { optional: true }) ?? {};
    name = signal(this.data.initialValue ?? '', ...(ngDevMode ? [{ debugName: "name" }] : []));
    /**
     * A saved search is a document named after its title, and a document name cannot hold a `/` —
     * the server answers 400. Web UI's save dialog says so the same way (`searchForm.savePopup.error`).
     */
    hasSlash = () => this.name().includes('/');
    canSave = () => this.name().trim().length > 0 && !this.hasSlash();
    onInput(value) {
        this.name.set(value);
    }
    save() {
        if (!this.canSave())
            return;
        this.dialogRef.close(this.name().trim());
    }
    static ɵfac = function SavedSearchDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SavedSearchDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SavedSearchDialogComponent, selectors: [["lib-saved-search-dialog"]], decls: 15, vars: 20, consts: [["mat-dialog-title", ""], ["type", "text", 1, "saved-search-input", 3, "input", "keydown.enter", "value", "placeholder"], ["id", "saved-search-dialog-error", "role", "alert", 1, "saved-search-error"], ["align", "end"], ["mat-stroked-button", "", "type", "button", 3, "click"], ["mat-flat-button", "", "color", "primary", "type", "button", 3, "click", "disabled"]], template: function SavedSearchDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "h2", 0);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content")(4, "input", 1);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵpipe(6, "translate");
            i0.ɵɵlistener("input", function SavedSearchDialogComponent_Template_input_input_4_listener($event) { return ctx.onInput($event.target.value); })("keydown.enter", function SavedSearchDialogComponent_Template_input_keydown_enter_4_listener() { return ctx.save(); });
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(7, SavedSearchDialogComponent_Conditional_7_Template, 3, 3, "p", 2);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "mat-dialog-actions", 3)(9, "button", 4);
            i0.ɵɵlistener("click", function SavedSearchDialogComponent_Template_button_click_9_listener() { return ctx.dialogRef.close(); });
            i0.ɵɵtext(10);
            i0.ɵɵpipe(11, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(12, "button", 5);
            i0.ɵɵlistener("click", function SavedSearchDialogComponent_Template_button_click_12_listener() { return ctx.save(); });
            i0.ɵɵtext(13);
            i0.ɵɵpipe(14, "translate");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(ctx.data.title || i0.ɵɵpipeBind1(2, 10, "ui.saved-search"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("value", ctx.name())("placeholder", ctx.data.placeholder || i0.ɵɵpipeBind1(5, 12, "ui.enter-a-name-for-your-saved"));
            i0.ɵɵattribute("aria-label", ctx.data.title || i0.ɵɵpipeBind1(6, 14, "ui.saved-search"))("aria-invalid", ctx.hasSlash())("aria-describedby", ctx.hasSlash() ? "saved-search-dialog-error" : null);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.hasSlash() ? 7 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 16, "shared-ui.saved-search-dialog.cancel"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.canSave());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(14, 18, "shared-ui.saved-search-dialog.save"), " ");
        } }, dependencies: [MatDialogModule, i1.MatDialogTitle, i1.MatDialogActions, i1.MatDialogContent, MatButtonModule, i2.MatButton, TranslatePipe], styles: ["[_nghost-%COMP%] {\n        display: block;\n        width: min(95vw, clamp(320px, 50vw, 520px));\n        max-width: 95vw;\n      }\n\n      mat-dialog-content[_ngcontent-%COMP%] {\n        padding: 8px clamp(12px, 4vw, 24px) 16px !important;\n        overflow: visible !important;\n      }\n\n      .saved-search-input[_ngcontent-%COMP%] {\n        display: block;\n        width: 100%;\n        min-width: 0;\n        border: 1px solid #d0d5dd;\n        border-radius: 8px;\n        padding: 10px 12px;\n        font: inherit;\n        color: #101828;\n        outline: none;\n        box-sizing: border-box;\n\n        &:focus {\n          border-color: #5c6bc0;\n        }\n      }\n\n      .saved-search-error[_ngcontent-%COMP%] {\n        margin: 6px 0 0;\n        color: var(--mat-sys-error, currentColor);\n        font: var(--mat-sys-body-small, inherit);\n      }\n\n      mat-dialog-actions[_ngcontent-%COMP%] {\n        padding: 16px 24px 20px;\n        flex-wrap: wrap;\n        row-gap: 8px;\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SavedSearchDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-saved-search-dialog', standalone: true, imports: [TranslatePipe, MatDialogModule, MatButtonModule], template: "<h2 mat-dialog-title>{{ data.title || ('ui.saved-search' | translate) }}</h2>\n\n<mat-dialog-content>\n  <input\n    class=\"saved-search-input\"\n    type=\"text\"\n    [attr.aria-label]=\"data.title || ('ui.saved-search' | translate)\"\n    [value]=\"name()\"\n    [attr.aria-invalid]=\"hasSlash()\"\n    [attr.aria-describedby]=\"hasSlash() ? 'saved-search-dialog-error' : null\"\n    [placeholder]=\"data.placeholder || ('ui.enter-a-name-for-your-saved' | translate)\"\n    (input)=\"onInput($any($event.target).value)\"\n    (keydown.enter)=\"save()\"\n  />\n  @if (hasSlash()) {\n    <p class=\"saved-search-error\" id=\"saved-search-dialog-error\" role=\"alert\">\n      {{ 'shared-ui.saved-search-dialog.no-slash' | translate }}\n    </p>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"end\">\n  <button mat-stroked-button type=\"button\" (click)=\"dialogRef.close()\">\n    {{ 'shared-ui.saved-search-dialog.cancel' | translate }}\n  </button>\n  <button mat-flat-button color=\"primary\" type=\"button\" [disabled]=\"!canSave()\" (click)=\"save()\">\n    {{ 'shared-ui.saved-search-dialog.save' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: ["\n      :host {\n        display: block;\n        width: min(95vw, clamp(320px, 50vw, 520px));\n        max-width: 95vw;\n      }\n\n      mat-dialog-content {\n        padding: 8px clamp(12px, 4vw, 24px) 16px !important;\n        overflow: visible !important;\n      }\n\n      .saved-search-input {\n        display: block;\n        width: 100%;\n        min-width: 0;\n        border: 1px solid #d0d5dd;\n        border-radius: 8px;\n        padding: 10px 12px;\n        font: inherit;\n        color: #101828;\n        outline: none;\n        box-sizing: border-box;\n\n        &:focus {\n          border-color: #5c6bc0;\n        }\n      }\n\n      .saved-search-error {\n        margin: 6px 0 0;\n        color: var(--mat-sys-error, currentColor);\n        font: var(--mat-sys-body-small, inherit);\n      }\n\n      mat-dialog-actions {\n        padding: 16px 24px 20px;\n        flex-wrap: wrap;\n        row-gap: 8px;\n      }\n    "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SavedSearchDialogComponent, { className: "SavedSearchDialogComponent", filePath: "libs/shared/ui/src/lib/saved-search-dialog/saved-search-dialog.component.ts", lineNumber: 70 }); })();
