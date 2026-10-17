import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
export class UiComponent {
    static ɵfac = function UiComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || UiComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: UiComponent, selectors: [["lib-ui"]], decls: 3, vars: 3, template: function UiComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "p");
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵdomElementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "shared-ui.ui.ui-works"));
        } }, dependencies: [TranslatePipe], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(UiComponent, [{
        type: Component,
        args: [{ selector: 'lib-ui', imports: [TranslatePipe], template: "<p>{{ 'shared-ui.ui.ui-works' | translate }}</p>\n" }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(UiComponent, { className: "UiComponent", filePath: "libs/shared/ui/src/lib/ui/ui.ts", lineNumber: 10 }); })();
