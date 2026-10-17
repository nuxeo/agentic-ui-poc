import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
/** PoC placeholder for routes not yet backed by feature libraries. */
export class PlaceholderPageComponent {
    static ɵfac = function PlaceholderPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PlaceholderPageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: PlaceholderPageComponent, selectors: [["ng-component"]], decls: 4, vars: 3, consts: [[1, "placeholder"]], template: function PlaceholderPageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "div", 0)(1, "p");
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "translate");
            i0.ɵɵdomElementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "app.placeholder-page.coming-soon"));
        } }, dependencies: [TranslatePipe], styles: [".placeholder[_ngcontent-%COMP%] {\n        padding: 1.5rem;\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PlaceholderPageComponent, [{
        type: Component,
        args: [{ standalone: true, imports: [TranslatePipe], template: "<div class=\"placeholder\">\n  <p>{{ 'app.placeholder-page.coming-soon' | translate }}</p>\n</div>\n", styles: ["\n      .placeholder {\n        padding: 1.5rem;\n      }\n    "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(PlaceholderPageComponent, { className: "PlaceholderPageComponent", filePath: "apps/nuxeo-ui/src/app/placeholder-page.component.ts", lineNumber: 17 }); })();
