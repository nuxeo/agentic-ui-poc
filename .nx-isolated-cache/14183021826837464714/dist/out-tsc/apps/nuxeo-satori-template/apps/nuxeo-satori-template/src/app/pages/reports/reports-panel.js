import { Component, computed, inject } from '@angular/core';
import { AppExtensionsService, ExtensionActionRegistry, ExtensionRuleContextService, } from '@nuxeo/satori-platform/extensions';
import * as i0 from "@angular/core";
function ReportsPanelComponent_Conditional_26_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "p")(1, "code");
    i0.ɵɵtext(2);
    i0.ɵɵdomElementEnd();
    i0.ɵɵtext(3, " has a registered handler. The button dispatches by ID \u2014 it does not call a method on this component. ");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(4, "button", 3);
    i0.ɵɵdomListener("click", function ReportsPanelComponent_Conditional_26_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.runExport()); });
    i0.ɵɵtext(5);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(6, "p", 2);
    i0.ɵɵtext(7, "Writes to the browser console.");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.actionId);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.actionLabel, " ");
} }
function ReportsPanelComponent_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "p", 2);
    i0.ɵɵtext(1, " No handler registered under ");
    i0.ɵɵdomElementStart(2, "code");
    i0.ɵɵtext(3);
    i0.ɵɵdomElementEnd();
    i0.ɵɵtext(4, ". Dispatching would be inert rather than an error. ");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.actionId);
} }
/**
 * A customer-owned component, reachable two ways at once.
 *
 * It is a **route** (`/reports`) and it is registered in the component registry
 * under `template.sidebar.reports`, so a manifest can also place it in a drawer
 * without this file or the route table changing. That dual reachability is the
 * point of Layer 2: contributing a component is registration, not wiring.
 *
 * It also fires a registered **action** by id rather than calling a method, which
 * is what lets a manifest move the affordance elsewhere — or a later release
 * replace the handler — with no change here.
 */
export class ReportsPanelComponent {
    actions = inject(ExtensionActionRegistry);
    ruleContext = inject(ExtensionRuleContextService);
    extensions = inject(AppExtensionsService);
    /**
     * The descriptor naming the handler. `label` is required — a descriptor is
     * also what a menu renders, so it always has an accessible name.
     */
    descriptor = {
        id: 'template.actions.exportSummary',
        label: 'Export summary',
    };
    actionId = this.descriptor.id;
    actionLabel = this.descriptor.label;
    /** False when nothing is registered under the id — a build/manifest mismatch. */
    handlerRegistered = this.actions.has(this.descriptor.id);
    /**
     * A `computed`, not a field: the rule closes over the session and the rule
     * context tracks the current route, so evaluating once at construction would
     * freeze the answer.
     */
    signedIn = computed(() => this.extensions.evaluateRule('template.rules.isSignedIn', this.ruleContext.context()), ...(ngDevMode ? [{ debugName: "signedIn" }] : []));
    runExport() {
        // Returns false rather than throwing when the id is unregistered, so a
        // manifest naming an action a newer build provides degrades quietly.
        this.actions.execute(this.descriptor, this.ruleContext.context());
    }
    static ɵfac = function ReportsPanelComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ReportsPanelComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ReportsPanelComponent, selectors: [["app-reports-panel"]], decls: 28, vars: 2, consts: [[1, "reports__lede"], [1, "reports__panel"], [1, "reports__hint"], ["type", "button", 1, "reports__button", 3, "click"]], template: function ReportsPanelComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "h1");
            i0.ɵɵtext(1, "Reports");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(2, "p", 0);
            i0.ɵɵtext(3, " A component this fork owns. It is reachable as the ");
            i0.ɵɵdomElementStart(4, "code");
            i0.ɵɵtext(5, "/reports");
            i0.ɵɵdomElementEnd();
            i0.ɵɵtext(6, " route ");
            i0.ɵɵdomElementStart(7, "em");
            i0.ɵɵtext(8, "and");
            i0.ɵɵdomElementEnd();
            i0.ɵɵtext(9, " as ");
            i0.ɵɵdomElementStart(10, "code");
            i0.ɵɵtext(11, "template.sidebar.reports");
            i0.ɵɵdomElementEnd();
            i0.ɵɵtext(12, " in the component registry, so a manifest can place it in a drawer without editing the route table.\n");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(13, "section", 1)(14, "h2");
            i0.ɵɵtext(15, "Rule evaluation");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(16, "p")(17, "code");
            i0.ɵɵtext(18, "template.rules.isSignedIn");
            i0.ɵɵdomElementEnd();
            i0.ɵɵtext(19, " currently evaluates to ");
            i0.ɵɵdomElementStart(20, "strong");
            i0.ɵɵtext(21);
            i0.ɵɵdomElementEnd();
            i0.ɵɵtext(22, ". It is declared fail-closed, so an unregistered build denies rather than permits. ");
            i0.ɵɵdomElementEnd()();
            i0.ɵɵdomElementStart(23, "section", 1)(24, "h2");
            i0.ɵɵtext(25, "Action dispatch");
            i0.ɵɵdomElementEnd();
            i0.ɵɵconditionalCreate(26, ReportsPanelComponent_Conditional_26_Template, 8, 2)(27, ReportsPanelComponent_Conditional_27_Template, 5, 1, "p", 2);
            i0.ɵɵdomElementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(21);
            i0.ɵɵtextInterpolate(ctx.signedIn());
            i0.ɵɵadvance(5);
            i0.ɵɵconditional(ctx.handlerRegistered ? 26 : 27);
        } }, styles: ["h1[_ngcontent-%COMP%] {\n  margin: 0 0 0.5rem;\n  font-size: 1.5rem;\n}\n\n.reports__lede[_ngcontent-%COMP%] {\n  margin: 0 0 2rem;\n  max-width: 65ch;\n  color: var(--shell-muted, #656d76);\n}\n\n.reports__panel[_ngcontent-%COMP%] {\n  margin-bottom: 1.5rem;\n  padding: 1.25rem;\n  border: 1px solid var(--shell-border, #d0d7de);\n  border-radius: 8px;\n\n  h2 {\n    margin: 0 0 0.75rem;\n    font-size: 1.075rem;\n  }\n\n  p {\n    margin: 0 0 0.5rem;\n  }\n}\n\n.reports__button[_ngcontent-%COMP%] {\n  padding: 0.5rem 1rem;\n  border: 1px solid var(--shell-border, #d0d7de);\n  border-radius: 6px;\n  background: var(--shell-nav-bg, #f6f8fa);\n  font: inherit;\n  cursor: pointer;\n\n  &:hover {\n    background: var(--shell-nav-hover, #eaeef2);\n  }\n}\n\n.reports__hint[_ngcontent-%COMP%] {\n  color: var(--shell-muted, #656d76);\n  font-size: 0.875rem;\n}\n\ncode[_ngcontent-%COMP%] {\n  font-family: ui-monospace, SFMono-Regular, monospace;\n  font-size: 0.9em;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ReportsPanelComponent, [{
        type: Component,
        args: [{ selector: 'app-reports-panel', standalone: true, template: "<h1>Reports</h1>\n\n<p class=\"reports__lede\">\n  A component this fork owns. It is reachable as the <code>/reports</code> route <em>and</em> as\n  <code>template.sidebar.reports</code> in the component registry, so a manifest can place it in a\n  drawer without editing the route table.\n</p>\n\n<section class=\"reports__panel\">\n  <h2>Rule evaluation</h2>\n  <p>\n    <code>template.rules.isSignedIn</code> currently evaluates to <strong>{{ signedIn() }}</strong\n    >. It is declared fail-closed, so an unregistered build denies rather than permits.\n  </p>\n</section>\n\n<section class=\"reports__panel\">\n  <h2>Action dispatch</h2>\n  @if (handlerRegistered) {\n    <p>\n      <code>{{ actionId }}</code> has a registered handler. The button dispatches by ID \u2014 it does\n      not call a method on this component.\n    </p>\n    <button type=\"button\" class=\"reports__button\" (click)=\"runExport()\">\n      {{ actionLabel }}\n    </button>\n    <p class=\"reports__hint\">Writes to the browser console.</p>\n  } @else {\n    <p class=\"reports__hint\">\n      No handler registered under <code>{{ actionId }}</code\n      >. Dispatching would be inert rather than an error.\n    </p>\n  }\n</section>\n", styles: ["h1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.5rem;\n}\n\n.reports__lede {\n  margin: 0 0 2rem;\n  max-width: 65ch;\n  color: var(--shell-muted, #656d76);\n}\n\n.reports__panel {\n  margin-bottom: 1.5rem;\n  padding: 1.25rem;\n  border: 1px solid var(--shell-border, #d0d7de);\n  border-radius: 8px;\n\n  h2 {\n    margin: 0 0 0.75rem;\n    font-size: 1.075rem;\n  }\n\n  p {\n    margin: 0 0 0.5rem;\n  }\n}\n\n.reports__button {\n  padding: 0.5rem 1rem;\n  border: 1px solid var(--shell-border, #d0d7de);\n  border-radius: 6px;\n  background: var(--shell-nav-bg, #f6f8fa);\n  font: inherit;\n  cursor: pointer;\n\n  &:hover {\n    background: var(--shell-nav-hover, #eaeef2);\n  }\n}\n\n.reports__hint {\n  color: var(--shell-muted, #656d76);\n  font-size: 0.875rem;\n}\n\ncode {\n  font-family: ui-monospace, SFMono-Regular, monospace;\n  font-size: 0.9em;\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ReportsPanelComponent, { className: "ReportsPanelComponent", filePath: "apps/nuxeo-satori-template/src/app/pages/reports/reports-panel.ts", lineNumber: 27 }); })();
