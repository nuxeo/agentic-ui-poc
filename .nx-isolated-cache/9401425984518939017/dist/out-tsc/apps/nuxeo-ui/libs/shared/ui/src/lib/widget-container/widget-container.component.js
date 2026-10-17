import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/icon";
const _c0 = [[["", "widgetActions", ""]], "*"];
const _c1 = ["[widgetActions]", "*"];
function WidgetContainerComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵstyleProp("color", ctx_r0.iconColor());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.icon());
} }
export class WidgetContainerComponent {
    title = input.required(...(ngDevMode ? [{ debugName: "title" }] : []));
    icon = input(...(ngDevMode ? [undefined, { debugName: "icon" }] : []));
    iconColor = input('', ...(ngDevMode ? [{ debugName: "iconColor" }] : []));
    /** Level under the shell `<h1>` (2) or under a page section `<h2>` (3). */
    headingLevel = input(2, ...(ngDevMode ? [{ debugName: "headingLevel" }] : []));
    static ɵfac = function WidgetContainerComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || WidgetContainerComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: WidgetContainerComponent, selectors: [["lib-widget-container"]], inputs: { title: [1, "title"], icon: [1, "icon"], iconColor: [1, "iconColor"], headingLevel: [1, "headingLevel"] }, ngContentSelectors: _c1, decls: 8, vars: 4, consts: [[1, "widget"], [1, "widget-header"], [1, "widget-header-icon", 3, "color"], ["role", "heading", 1, "widget-header-title"], ["tabindex", "0", "role", "group", 1, "widget-body"], [1, "widget-header-icon"]], template: function WidgetContainerComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef(_c0);
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1);
            i0.ɵɵconditionalCreate(2, WidgetContainerComponent_Conditional_2_Template, 2, 3, "mat-icon", 2);
            i0.ɵɵelementStart(3, "div", 3);
            i0.ɵɵtext(4);
            i0.ɵɵelementEnd();
            i0.ɵɵprojection(5);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "div", 4);
            i0.ɵɵprojection(7, 1);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.icon() ? 2 : -1);
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-level", ctx.headingLevel());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.title(), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵattribute("aria-label", ctx.title());
        } }, dependencies: [MatIconModule, i1.MatIcon], styles: [".widget[_ngcontent-%COMP%] {\n  background: #ffffff;\n  border: 1px solid #e8eaef;\n  border-radius: 12px;\n  box-shadow:\n    0 1px 4px rgb(0 0 0 / 6%),\n    0 4px 12px rgb(0 0 0 / 4%);\n  display: flex;\n  flex-direction: column;\n  height: 360px;\n  overflow: hidden;\n}\n\n.widget-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 16px 20px 12px;\n  border-bottom: 1px solid #e8eaef;\n  background: #ffffff;\n  flex-shrink: 0;\n}\n\n.widget-header-icon[_ngcontent-%COMP%] {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n}\n\n.widget-header-title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n  flex: 1;\n}\n\n.widget-body[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 0;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(WidgetContainerComponent, [{
        type: Component,
        args: [{ selector: 'lib-widget-container', standalone: true, imports: [MatIconModule], template: "<div class=\"widget\">\n  <div class=\"widget-header\">\n    @if (icon()) {\n      <mat-icon class=\"widget-header-icon\" [style.color]=\"iconColor()\">{{ icon() }}</mat-icon>\n    }\n    <div class=\"widget-header-title\" role=\"heading\" [attr.aria-level]=\"headingLevel()\">\n      {{ title() }}\n    </div>\n    <ng-content select=\"[widgetActions]\" />\n  </div>\n\n  <!--\n    `tabindex=\"0\"` because `.widget-body` sets `overflow-y: auto`: a mouse user can scroll it\n    and a keyboard user could not reach the content that overflowed. That is WCAG 2.1.1, and\n    axe reports it as `scrollable-region-focusable`.\n\n    It carries `role=\"group\"` and the widget's own title as its name, so the resulting tab stop\n    announces *which* widget it belongs to. A bare focusable div would satisfy the rule while\n    announcing nothing, which is the sort of fix that passes an audit and helps no one.\n  -->\n  <div class=\"widget-body\" tabindex=\"0\" role=\"group\" [attr.aria-label]=\"title()\">\n    <ng-content />\n  </div>\n</div>\n", styles: [".widget {\n  background: #ffffff;\n  border: 1px solid #e8eaef;\n  border-radius: 12px;\n  box-shadow:\n    0 1px 4px rgb(0 0 0 / 6%),\n    0 4px 12px rgb(0 0 0 / 4%);\n  display: flex;\n  flex-direction: column;\n  height: 360px;\n  overflow: hidden;\n}\n\n.widget-header {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 16px 20px 12px;\n  border-bottom: 1px solid #e8eaef;\n  background: #ffffff;\n  flex-shrink: 0;\n}\n\n.widget-header-icon {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n}\n\n.widget-header-title {\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n  flex: 1;\n}\n\n.widget-body {\n  flex: 1;\n  overflow-y: auto;\n  padding: 0;\n}\n"] }]
    }], null, { title: [{ type: i0.Input, args: [{ isSignal: true, alias: "title", required: true }] }], icon: [{ type: i0.Input, args: [{ isSignal: true, alias: "icon", required: false }] }], iconColor: [{ type: i0.Input, args: [{ isSignal: true, alias: "iconColor", required: false }] }], headingLevel: [{ type: i0.Input, args: [{ isSignal: true, alias: "headingLevel", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(WidgetContainerComponent, { className: "WidgetContainerComponent", filePath: "libs/shared/ui/src/lib/widget-container/widget-container.component.ts", lineNumber: 11 }); })();
