import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/icon";
const _c0 = ["*"];
function NxsEmptyStateComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 0);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.icon());
} }
function NxsEmptyStateComponent_Case_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h1", 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.heading());
} }
function NxsEmptyStateComponent_Case_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h3", 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.heading());
} }
function NxsEmptyStateComponent_Case_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h4", 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.heading());
} }
function NxsEmptyStateComponent_Case_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h5", 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.heading());
} }
function NxsEmptyStateComponent_Case_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h6", 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.heading());
} }
function NxsEmptyStateComponent_Case_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h2", 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.heading());
} }
function NxsEmptyStateComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 2);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.message());
} }
/**
 * The "nothing here" state for a list, panel or result set.
 *
 * Text arrives already translated — the library ships no catalogue of its own — so a caller
 * binds `[heading]="'browse.empty' | translate"`. Actions are projected, so a "Create" or
 * "Clear filters" button stays the caller's, wired to the caller's action.
 */
export class NxsEmptyStateComponent {
    /** What is empty, in one line. */
    heading = input.required(...(ngDevMode ? [{ debugName: "heading" }] : []));
    /**
     * The heading's level in the page outline, rendered as the native `<h1>`–`<h6>`. Set it to fit
     * where the component sits — one below the heading of the section it empties — so heading
     * navigation stays in order.
     */
    // Annotated rather than inferred: an inferred union is declared in the compiler's type order,
    // which moves with unrelated code and would change the published API snapshot each time.
    headingLevel = input(2, ...(ngDevMode ? [{ debugName: "headingLevel" }] : []));
    /** An optional second line — usually what to do next. Not rendered when blank. */
    message = input('', ...(ngDevMode ? [{ debugName: "message" }] : []));
    /** An optional Material icon ligature. Decorative, so hidden from assistive technology. */
    icon = input('', ...(ngDevMode ? [{ debugName: "icon" }] : []));
    static ɵfac = function NxsEmptyStateComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsEmptyStateComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsEmptyStateComponent, selectors: [["nxs-empty-state"]], hostAttrs: ["role", "status", 1, "nxs-empty-state"], inputs: { heading: [1, "heading"], headingLevel: [1, "headingLevel"], message: [1, "message"], icon: [1, "icon"] }, ngContentSelectors: _c0, decls: 10, vars: 3, consts: [["aria-hidden", "true", 1, "nxs-empty-state__icon"], [1, "nxs-empty-state__heading"], [1, "nxs-empty-state__message"], [1, "nxs-empty-state__actions"]], template: function NxsEmptyStateComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵconditionalCreate(0, NxsEmptyStateComponent_Conditional_0_Template, 2, 1, "mat-icon", 0);
            i0.ɵɵconditionalCreate(1, NxsEmptyStateComponent_Case_1_Template, 2, 1, "h1", 1)(2, NxsEmptyStateComponent_Case_2_Template, 2, 1, "h3", 1)(3, NxsEmptyStateComponent_Case_3_Template, 2, 1, "h4", 1)(4, NxsEmptyStateComponent_Case_4_Template, 2, 1, "h5", 1)(5, NxsEmptyStateComponent_Case_5_Template, 2, 1, "h6", 1)(6, NxsEmptyStateComponent_Case_6_Template, 2, 1, "h2", 1);
            i0.ɵɵconditionalCreate(7, NxsEmptyStateComponent_Conditional_7_Template, 2, 1, "p", 2);
            i0.ɵɵelementStart(8, "div", 3);
            i0.ɵɵprojection(9);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_1_0;
            i0.ɵɵconditional(ctx.icon() ? 0 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_1_0 = ctx.headingLevel()) === 1 ? 1 : tmp_1_0 === 3 ? 2 : tmp_1_0 === 4 ? 3 : tmp_1_0 === 5 ? 4 : tmp_1_0 === 6 ? 5 : 6);
            i0.ɵɵadvance(6);
            i0.ɵɵconditional(ctx.message() ? 7 : -1);
        } }, dependencies: [MatIconModule, i1.MatIcon], styles: ["[_nghost-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 8px;\n  padding: 32px 16px;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-empty-state__icon[_ngcontent-%COMP%] {\n  width: 48px;\n  height: 48px;\n  font-size: 48px;\n  color: var(--mat-sys-outline);\n}\n\n//[_ngcontent-%COMP%]   Doubled[_ngcontent-%COMP%]   to[_ngcontent-%COMP%]   outrank[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   app[_ngcontent-%COMP%]   theme's[_ngcontent-%COMP%]   `html[data-app-theme][_ngcontent-%COMP%]   .mat-typography[_ngcontent-%COMP%]   h1`\u2013`h6`,[_ngcontent-%COMP%]   which[_ngcontent-%COMP%]   would\n//[_ngcontent-%COMP%]   otherwise[_ngcontent-%COMP%]   render[_ngcontent-%COMP%]   this[_ngcontent-%COMP%]   heading[_ngcontent-%COMP%]   at[_ngcontent-%COMP%]   display[_ngcontent-%COMP%]   size[_ngcontent-%COMP%]   \u2014[_ngcontent-%COMP%]   45px[_ngcontent-%COMP%]   against[_ngcontent-%COMP%]   title-medium's[_ngcontent-%COMP%]   16px[_ngcontent-%COMP%], measured.\n.nxs-empty-state__heading.nxs-empty-state__heading[_ngcontent-%COMP%] {\n  margin: 0;\n  font: var(--mat-sys-title-medium);\n  letter-spacing: normal;\n  color: var(--mat-sys-on-surface);\n}\n\n.nxs-empty-state__message[_ngcontent-%COMP%] {\n  margin: 0;\n  font: var(--mat-sys-body-medium);\n}\n\n.nxs-empty-state__actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  margin-top: 8px;\n\n  &:empty {\n    display: none;\n  }\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsEmptyStateComponent, [{
        type: Component,
        args: [{ selector: 'nxs-empty-state', standalone: true, imports: [MatIconModule], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-empty-state', role: 'status' }, template: "@if (icon()) {\n  <mat-icon class=\"nxs-empty-state__icon\" aria-hidden=\"true\">{{ icon() }}</mat-icon>\n}\n@switch (headingLevel()) {\n  @case (1) {\n    <h1 class=\"nxs-empty-state__heading\">{{ heading() }}</h1>\n  }\n  @case (3) {\n    <h3 class=\"nxs-empty-state__heading\">{{ heading() }}</h3>\n  }\n  @case (4) {\n    <h4 class=\"nxs-empty-state__heading\">{{ heading() }}</h4>\n  }\n  @case (5) {\n    <h5 class=\"nxs-empty-state__heading\">{{ heading() }}</h5>\n  }\n  @case (6) {\n    <h6 class=\"nxs-empty-state__heading\">{{ heading() }}</h6>\n  }\n  @default {\n    <h2 class=\"nxs-empty-state__heading\">{{ heading() }}</h2>\n  }\n}\n@if (message()) {\n  <p class=\"nxs-empty-state__message\">{{ message() }}</p>\n}\n<div class=\"nxs-empty-state__actions\">\n  <ng-content />\n</div>\n", styles: [":host {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 8px;\n  padding: 32px 16px;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-empty-state__icon {\n  width: 48px;\n  height: 48px;\n  font-size: 48px;\n  color: var(--mat-sys-outline);\n}\n\n// Doubled to outrank the app theme's `html[data-app-theme] .mat-typography h1`\u2013`h6`, which would\n// otherwise render this heading at display size \u2014 45px against title-medium's 16px, measured.\n.nxs-empty-state__heading.nxs-empty-state__heading {\n  margin: 0;\n  font: var(--mat-sys-title-medium);\n  letter-spacing: normal;\n  color: var(--mat-sys-on-surface);\n}\n\n.nxs-empty-state__message {\n  margin: 0;\n  font: var(--mat-sys-body-medium);\n}\n\n.nxs-empty-state__actions {\n  display: flex;\n  gap: 8px;\n  margin-top: 8px;\n\n  &:empty {\n    display: none;\n  }\n}\n"] }]
    }], null, { heading: [{ type: i0.Input, args: [{ isSignal: true, alias: "heading", required: true }] }], headingLevel: [{ type: i0.Input, args: [{ isSignal: true, alias: "headingLevel", required: false }] }], message: [{ type: i0.Input, args: [{ isSignal: true, alias: "message", required: false }] }], icon: [{ type: i0.Input, args: [{ isSignal: true, alias: "icon", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsEmptyStateComponent, { className: "NxsEmptyStateComponent", filePath: "libs/shared/satori-components/src/lib/empty-state/empty-state.component.ts", lineNumber: 22 }); })();
