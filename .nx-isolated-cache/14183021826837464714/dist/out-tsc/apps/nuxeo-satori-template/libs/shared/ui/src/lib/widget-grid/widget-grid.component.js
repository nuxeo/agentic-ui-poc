import { Component, input } from '@angular/core';
import * as i0 from "@angular/core";
const _c0 = ["*"];
export class WidgetGridComponent {
    /** Number of columns in the grid (default 2 for half-width widgets). */
    columns = input(2, ...(ngDevMode ? [{ debugName: "columns" }] : []));
    static ɵfac = function WidgetGridComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || WidgetGridComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: WidgetGridComponent, selectors: [["lib-widget-grid"]], inputs: { columns: [1, "columns"] }, ngContentSelectors: _c0, decls: 2, vars: 2, consts: [[1, "widget-grid"]], template: function WidgetGridComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵdomElementStart(0, "div", 0);
            i0.ɵɵprojection(1);
            i0.ɵɵdomElementEnd();
        } if (rf & 2) {
            i0.ɵɵstyleProp("grid-template-columns", "repeat(" + ctx.columns() + ", 1fr)");
        } }, styles: [".widget-grid[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 24px;\n  padding: 24px 28px;\n}\n\n@media (max-width: 900px) {\n  .widget-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr !important;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(WidgetGridComponent, [{
        type: Component,
        args: [{ selector: 'lib-widget-grid', standalone: true, template: "<div class=\"widget-grid\" [style.grid-template-columns]=\"'repeat(' + columns() + ', 1fr)'\">\n  <ng-content />\n</div>\n", styles: [".widget-grid {\n  display: grid;\n  gap: 24px;\n  padding: 24px 28px;\n}\n\n@media (max-width: 900px) {\n  .widget-grid {\n    grid-template-columns: 1fr !important;\n  }\n}\n"] }]
    }], null, { columns: [{ type: i0.Input, args: [{ isSignal: true, alias: "columns", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(WidgetGridComponent, { className: "WidgetGridComponent", filePath: "libs/shared/ui/src/lib/widget-grid/widget-grid.component.ts", lineNumber: 9 }); })();
