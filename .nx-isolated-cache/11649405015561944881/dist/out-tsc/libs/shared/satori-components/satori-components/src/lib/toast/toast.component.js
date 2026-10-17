import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarAction, MatSnackBarActions, MatSnackBarLabel, MatSnackBarRef, } from '@angular/material/snack-bar';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
function NxsToastComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 5);
    i0.ɵɵlistener("click", function NxsToastComponent_Conditional_3_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.act()); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx.label, " ");
} }
/**
 * The content of one toast: the message, an optional action and a Dismiss button.
 *
 * Opened by `NxsToastService`, never placed in a template. `MatSnackBar` moves this content into
 * its live region after it opens, so the message is announced with the politeness the service chose.
 */
export class NxsToastComponent {
    data = inject(MAT_SNACK_BAR_DATA);
    ref = inject(MatSnackBarRef);
    act() {
        this.ref.dismissWithAction();
    }
    /**
     * Escape stops here: a snack-bar overlay subscribes to no keydown, so the CDK would hand the event
     * on to a dialog underneath and close it too — losing a form the toast was reporting on.
     */
    dismiss(event) {
        event?.stopPropagation();
        this.ref.dismiss();
    }
    static ɵfac = function NxsToastComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsToastComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsToastComponent, selectors: [["nxs-toast"]], hostAttrs: [1, "nxs-toast"], hostVars: 2, hostBindings: function NxsToastComponent_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("keydown.escape", function NxsToastComponent_keydown_escape_HostBindingHandler($event) { return ctx.dismiss($event); });
        } if (rf & 2) {
            i0.ɵɵclassProp("nxs-toast--error", ctx.data.kind === "error");
        } }, decls: 8, vars: 5, consts: [["matSnackBarLabel", "", 1, "nxs-toast__message"], ["matSnackBarActions", "", 1, "nxs-toast__actions"], ["mat-button", "", "matSnackBarAction", "", "type", "button", 1, "nxs-toast__action"], ["mat-icon-button", "", "type", "button", 1, "nxs-toast__dismiss", 3, "click"], ["aria-hidden", "true"], ["mat-button", "", "matSnackBarAction", "", "type", "button", 1, "nxs-toast__action", 3, "click"]], template: function NxsToastComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵtext(1);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(2, "div", 1);
            i0.ɵɵconditionalCreate(3, NxsToastComponent_Conditional_3_Template, 2, 1, "button", 2);
            i0.ɵɵelementStart(4, "button", 3);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵlistener("click", function NxsToastComponent_Template_button_click_4_listener() { return ctx.dismiss(); });
            i0.ɵɵelementStart(6, "mat-icon", 4);
            i0.ɵɵtext(7, "close");
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            let tmp_1_0;
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(ctx.data.message);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional((tmp_1_0 = ctx.data.action) ? 3 : -1, tmp_1_0);
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(5, 3, "satori-components.toast.dismiss"));
        } }, dependencies: [MatButtonModule, i1.MatButton, i1.MatIconButton, MatIconModule, i2.MatIcon, MatSnackBarAction,
            MatSnackBarActions,
            MatSnackBarLabel,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: flex;\n  align-items: center;\n}\n\n.nxs-toast__message[_ngcontent-%COMP%] {\n  flex: 1 1 auto;\n}\n\n.nxs-toast__actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n\n//[_ngcontent-%COMP%]   Material[_ngcontent-%COMP%]   colours[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   snack-bar's[_ngcontent-%COMP%]   action[_ngcontent-%COMP%]   buttons[_ngcontent-%COMP%]   through[_ngcontent-%COMP%]   `matSnackBarAction`;[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   Dismiss[_ngcontent-%COMP%]   icon\n//[_ngcontent-%COMP%]   takes[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   message's[_ngcontent-%COMP%]   colour[_ngcontent-%COMP%]   so[_ngcontent-%COMP%]   it[_ngcontent-%COMP%]   reads[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   part[_ngcontent-%COMP%]   of[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   toast[_ngcontent-%COMP%]   rather[_ngcontent-%COMP%]   than[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   second[_ngcontent-%COMP%]   action.\n.nxs-toast__dismiss[_ngcontent-%COMP%] {\n  color: var(--mat-snack-bar-supporting-text-color, var(--mat-sys-inverse-on-surface));\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsToastComponent, [{
        type: Component,
        args: [{ selector: 'nxs-toast', standalone: true, imports: [
                    MatButtonModule,
                    MatIconModule,
                    MatSnackBarAction,
                    MatSnackBarActions,
                    MatSnackBarLabel,
                    TranslatePipe,
                ], changeDetection: ChangeDetectionStrategy.OnPush, host: {
                    class: 'nxs-toast',
                    '[class.nxs-toast--error]': "data.kind === 'error'",
                    '(keydown.escape)': 'dismiss($event)',
                }, template: "<div matSnackBarLabel class=\"nxs-toast__message\">{{ data.message }}</div>\n<div matSnackBarActions class=\"nxs-toast__actions\">\n  @if (data.action; as action) {\n    <button mat-button matSnackBarAction type=\"button\" class=\"nxs-toast__action\" (click)=\"act()\">\n      {{ action.label }}\n    </button>\n  }\n  <button\n    mat-icon-button\n    type=\"button\"\n    class=\"nxs-toast__dismiss\"\n    [attr.aria-label]=\"'satori-components.toast.dismiss' | translate\"\n    (click)=\"dismiss()\"\n  >\n    <mat-icon aria-hidden=\"true\">close</mat-icon>\n  </button>\n</div>\n", styles: [":host {\n  display: flex;\n  align-items: center;\n}\n\n.nxs-toast__message {\n  flex: 1 1 auto;\n}\n\n.nxs-toast__actions {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n\n// Material colours the snack-bar's action buttons through `matSnackBarAction`; the Dismiss icon\n// takes the message's colour so it reads as part of the toast rather than as a second action.\n.nxs-toast__dismiss {\n  color: var(--mat-snack-bar-supporting-text-color, var(--mat-sys-inverse-on-surface));\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsToastComponent, { className: "NxsToastComponent", filePath: "libs/shared/satori-components/src/lib/toast/toast.component.ts", lineNumber: 48 }); })();
//# sourceMappingURL=toast.component.js.map