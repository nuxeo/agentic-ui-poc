import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, output, } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { nxsVisibleText } from '../visible-text';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
const _c0 = ["*"];
function NxsErrorStateComponent_Case_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h1", 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const title_r1 = i0.ɵɵreadContextLet(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(title_r1);
} }
function NxsErrorStateComponent_Case_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h3", 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const title_r1 = i0.ɵɵreadContextLet(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(title_r1);
} }
function NxsErrorStateComponent_Case_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h4", 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const title_r1 = i0.ɵɵreadContextLet(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(title_r1);
} }
function NxsErrorStateComponent_Case_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h5", 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const title_r1 = i0.ɵɵreadContextLet(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(title_r1);
} }
function NxsErrorStateComponent_Case_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h6", 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const title_r1 = i0.ɵɵreadContextLet(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(title_r1);
} }
function NxsErrorStateComponent_Case_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h2", 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const title_r1 = i0.ɵɵreadContextLet(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(title_r1);
} }
function NxsErrorStateComponent_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 5);
    i0.ɵɵlistener("click", function NxsErrorStateComponent_Conditional_14_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.pressRetry()); });
    i0.ɵɵelementStart(1, "mat-icon", 6);
    i0.ɵɵtext(2, "refresh");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "satori-components.error-state.retry"), " ");
} }
const VARIANTS = {
    401: {
        icon: 'lock',
        heading: 'satori-components.error-state.unauthorized.heading',
        message: 'satori-components.error-state.unauthorized.message',
    },
    403: {
        icon: 'block',
        heading: 'satori-components.error-state.forbidden.heading',
        message: 'satori-components.error-state.forbidden.message',
    },
    404: {
        icon: 'search_off',
        heading: 'satori-components.error-state.not-found.heading',
        message: 'satori-components.error-state.not-found.message',
    },
    500: {
        icon: 'error_outline',
        heading: 'satori-components.error-state.server.heading',
        message: 'satori-components.error-state.server.message',
    },
};
/**
 * What a region shows in place of content that failed to load — a listing, a page, a result set.
 *
 * One of four variants chosen by `status`, each with its own icon, heading and explanation; map a
 * failed request onto one with `nxsErrorStatus(error)`. A host that knows what failed ("Failed to
 * load folder contents.") passes it as `heading`, already translated, and the variant's explanation
 * stays underneath it.
 *
 * It is an alert because it replaces a loader the user was waiting on. Retry is offered only for a
 * server error, and only when the host asks for it: retrying a 401, 403 or 404 gets the same answer.
 * Anything else the host offers — "Go back" — is projected.
 *
 * Registered as `nxs.primitives.errorState`, so a customer can replace it by ID; a host rendering it
 * that way passes `retryHandler`, because the outlet binds no outputs.
 */
export class NxsErrorStateComponent {
    /** Which variant: the HTTP status the failure stands for. */
    status = input(500, ...(ngDevMode ? [{ debugName: "status" }] : []));
    /** What failed, already translated. Blank, or only whitespace, shows the variant's own heading. */
    heading = input('', ...(ngDevMode ? [{ debugName: "heading" }] : []));
    /**
     * The heading's level in the page outline, rendered as the native `<h1>`–`<h6>`: one below the
     * heading of the section it replaces, or 1 when it replaces the whole page.
     */
    headingLevel = input(2, ...(ngDevMode ? [{ debugName: "headingLevel" }] : []));
    /** Offer Retry for a server error. Accepts a bare attribute, `retryable`. */
    retryable = input(false, ...(ngDevMode ? [{ debugName: "retryable", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /**
     * Called when Retry is pressed, before `retry` is emitted — for a host that renders the component
     * by ID, where no output can be bound.
     */
    retryHandler = input(null, ...(ngDevMode ? [{ debugName: "retryHandler" }] : []));
    /** Retry was pressed. */
    retry = output();
    variant = computed(() => VARIANTS[this.status()], ...(ngDevMode ? [{ debugName: "variant" }] : []));
    /** The host's heading as a reader gets it: whitespace or zero-width characters alone are none. */
    ownHeading = computed(() => nxsVisibleText(this.heading()), ...(ngDevMode ? [{ debugName: "ownHeading" }] : []));
    canRetry = computed(() => this.retryable() && this.status() === 500, ...(ngDevMode ? [{ debugName: "canRetry" }] : []));
    pressRetry() {
        this.retryHandler()?.();
        this.retry.emit();
    }
    static ɵfac = function NxsErrorStateComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsErrorStateComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsErrorStateComponent, selectors: [["nxs-error-state"]], hostAttrs: ["role", "alert", 1, "nxs-error-state"], hostVars: 1, hostBindings: function NxsErrorStateComponent_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-status", ctx.status());
        } }, inputs: { status: [1, "status"], heading: [1, "heading"], headingLevel: [1, "headingLevel"], retryable: [1, "retryable"], retryHandler: [1, "retryHandler"] }, outputs: { retry: "retry" }, ngContentSelectors: _c0, decls: 16, vars: 9, consts: [["aria-hidden", "true", 1, "nxs-error-state__icon"], [1, "nxs-error-state__heading"], [1, "nxs-error-state__message"], [1, "nxs-error-state__actions"], ["mat-stroked-button", "", "type", "button"], ["mat-stroked-button", "", "type", "button", 3, "click"], ["aria-hidden", "true"]], template: function NxsErrorStateComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵelementStart(0, "mat-icon", 0);
            i0.ɵɵtext(1);
            i0.ɵɵelementEnd();
            i0.ɵɵdeclareLet(2);
            i0.ɵɵpipe(3, "translate");
            i0.ɵɵconditionalCreate(4, NxsErrorStateComponent_Case_4_Template, 2, 1, "h1", 1)(5, NxsErrorStateComponent_Case_5_Template, 2, 1, "h3", 1)(6, NxsErrorStateComponent_Case_6_Template, 2, 1, "h4", 1)(7, NxsErrorStateComponent_Case_7_Template, 2, 1, "h5", 1)(8, NxsErrorStateComponent_Case_8_Template, 2, 1, "h6", 1)(9, NxsErrorStateComponent_Case_9_Template, 2, 1, "h2", 1);
            i0.ɵɵelementStart(10, "p", 2);
            i0.ɵɵtext(11);
            i0.ɵɵpipe(12, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(13, "div", 3);
            i0.ɵɵconditionalCreate(14, NxsErrorStateComponent_Conditional_14_Template, 5, 3, "button", 4);
            i0.ɵɵprojection(15);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_2_0;
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(ctx.variant().icon);
            i0.ɵɵadvance();
            i0.ɵɵstoreLet(ctx.ownHeading() || i0.ɵɵpipeBind1(3, 4, ctx.variant().heading));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional((tmp_2_0 = ctx.headingLevel()) === 1 ? 4 : tmp_2_0 === 3 ? 5 : tmp_2_0 === 4 ? 6 : tmp_2_0 === 5 ? 7 : tmp_2_0 === 6 ? 8 : 9);
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 7, ctx.variant().message));
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.canRetry() ? 14 : -1);
        } }, dependencies: [MatButtonModule, i1.MatButton, MatIconModule, i2.MatIcon, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 8px;\n  padding: 48px 16px;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-error-state__icon[_ngcontent-%COMP%] {\n  width: 48px;\n  height: 48px;\n  font-size: 48px;\n  color: var(--mat-sys-error);\n}\n\n//[_ngcontent-%COMP%]   Doubled[_ngcontent-%COMP%]   to[_ngcontent-%COMP%]   outrank[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   app[_ngcontent-%COMP%]   theme's[_ngcontent-%COMP%]   `html[data-app-theme][_ngcontent-%COMP%]   .mat-typography[_ngcontent-%COMP%]   h1`\u2013`h6`,[_ngcontent-%COMP%]   which[_ngcontent-%COMP%]   would\n//[_ngcontent-%COMP%]   otherwise[_ngcontent-%COMP%]   render[_ngcontent-%COMP%]   this[_ngcontent-%COMP%]   heading[_ngcontent-%COMP%]   at[_ngcontent-%COMP%]   display[_ngcontent-%COMP%]   size.\n.nxs-error-state__heading.nxs-error-state__heading[_ngcontent-%COMP%] {\n  margin: 0;\n  font: var(--mat-sys-title-medium);\n  letter-spacing: normal;\n  color: var(--mat-sys-on-surface);\n}\n\n.nxs-error-state__message[_ngcontent-%COMP%] {\n  max-width: 48ch;\n  margin: 0;\n  font: var(--mat-sys-body-medium);\n}\n\n.nxs-error-state__actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  margin-top: 8px;\n\n  &:empty {\n    display: none;\n  }\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsErrorStateComponent, [{
        type: Component,
        args: [{ selector: 'nxs-error-state', standalone: true, imports: [MatButtonModule, MatIconModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-error-state', role: 'alert', '[attr.data-status]': 'status()' }, template: "<mat-icon class=\"nxs-error-state__icon\" aria-hidden=\"true\">{{ variant().icon }}</mat-icon>\n@let title = ownHeading() || (variant().heading | translate);\n@switch (headingLevel()) {\n  @case (1) {\n    <h1 class=\"nxs-error-state__heading\">{{ title }}</h1>\n  }\n  @case (3) {\n    <h3 class=\"nxs-error-state__heading\">{{ title }}</h3>\n  }\n  @case (4) {\n    <h4 class=\"nxs-error-state__heading\">{{ title }}</h4>\n  }\n  @case (5) {\n    <h5 class=\"nxs-error-state__heading\">{{ title }}</h5>\n  }\n  @case (6) {\n    <h6 class=\"nxs-error-state__heading\">{{ title }}</h6>\n  }\n  @default {\n    <h2 class=\"nxs-error-state__heading\">{{ title }}</h2>\n  }\n}\n<p class=\"nxs-error-state__message\">{{ variant().message | translate }}</p>\n<div class=\"nxs-error-state__actions\">\n  @if (canRetry()) {\n    <button mat-stroked-button type=\"button\" (click)=\"pressRetry()\">\n      <mat-icon aria-hidden=\"true\">refresh</mat-icon>\n      {{ 'satori-components.error-state.retry' | translate }}\n    </button>\n  }\n  <ng-content />\n</div>\n", styles: [":host {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 8px;\n  padding: 48px 16px;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-error-state__icon {\n  width: 48px;\n  height: 48px;\n  font-size: 48px;\n  color: var(--mat-sys-error);\n}\n\n// Doubled to outrank the app theme's `html[data-app-theme] .mat-typography h1`\u2013`h6`, which would\n// otherwise render this heading at display size.\n.nxs-error-state__heading.nxs-error-state__heading {\n  margin: 0;\n  font: var(--mat-sys-title-medium);\n  letter-spacing: normal;\n  color: var(--mat-sys-on-surface);\n}\n\n.nxs-error-state__message {\n  max-width: 48ch;\n  margin: 0;\n  font: var(--mat-sys-body-medium);\n}\n\n.nxs-error-state__actions {\n  display: flex;\n  gap: 8px;\n  margin-top: 8px;\n\n  &:empty {\n    display: none;\n  }\n}\n"] }]
    }], null, { status: [{ type: i0.Input, args: [{ isSignal: true, alias: "status", required: false }] }], heading: [{ type: i0.Input, args: [{ isSignal: true, alias: "heading", required: false }] }], headingLevel: [{ type: i0.Input, args: [{ isSignal: true, alias: "headingLevel", required: false }] }], retryable: [{ type: i0.Input, args: [{ isSignal: true, alias: "retryable", required: false }] }], retryHandler: [{ type: i0.Input, args: [{ isSignal: true, alias: "retryHandler", required: false }] }], retry: [{ type: i0.Output, args: ["retry"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsErrorStateComponent, { className: "NxsErrorStateComponent", filePath: "libs/shared/satori-components/src/lib/error-state/error-state.component.ts", lineNumber: 71 }); })();
//# sourceMappingURL=error-state.component.js.map