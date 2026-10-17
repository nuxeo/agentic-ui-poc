import { Component, computed, inject } from '@angular/core';
import { AppExtensionsService, ExtensionActionRegistry, ExtensionRuleContextService, } from '@nuxeo/satori-platform/extensions';
import { ACME_EXTENSIONS_EXTENSION_IDS } from '../extensions';
import * as i0 from "@angular/core";
function AcmePanelComponent_Conditional_11_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "p", 1);
    i0.ɵɵtext(1, " Offered but not currently applicable \u2014 ");
    i0.ɵɵdomElementStart(2, "code");
    i0.ɵɵtext(3, "acme.rules.canUseAcme");
    i0.ɵɵdomElementEnd();
    i0.ɵɵtext(4, " evaluates to false. ");
    i0.ɵɵdomElementEnd();
} }
function AcmePanelComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "button", 2);
    i0.ɵɵdomListener("click", function AcmePanelComponent_Conditional_11_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.run()); });
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
    i0.ɵɵconditionalCreate(2, AcmePanelComponent_Conditional_11_Conditional_2_Template, 5, 0, "p", 1);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵdomProperty("disabled", !ctx_r1.enabled());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.actionLabel);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r1.enabled() ? 2 : -1);
} }
function AcmePanelComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "p", 1);
    i0.ɵɵtext(1, " No handler registered under ");
    i0.ɵɵdomElementStart(2, "code");
    i0.ɵɵtext(3, "acme.actions.acmeExtensionsExport");
    i0.ɵɵdomElementEnd();
    i0.ɵɵtext(4, ". ");
    i0.ɵɵdomElementEnd();
} }
/**
 * A component this library owns, contributed to the platform **by ID**.
 *
 * Registered as `acme.panel.acmeExtensions`, so a manifest can place it in a
 * drawer or a tab without an application importing this class. That indirection is
 * the whole point of Layer 2: contributing UI is registration, not wiring.
 *
 * It dispatches its action by ID rather than calling a method, so a manifest can
 * move the affordance elsewhere — or a later release replace the handler — with no
 * change here.
 */
export class AcmePanelComponent {
    actions = inject(ExtensionActionRegistry);
    ruleContext = inject(ExtensionRuleContextService);
    extensions = inject(AppExtensionsService);
    /** `label` is required: a descriptor is also what a menu renders. */
    descriptor = {
        id: ACME_EXTENSIONS_EXTENSION_IDS.actions[0],
        label: 'Export summary',
    };
    actionLabel = this.descriptor.label;
    /** False when no handler is registered — an application/manifest mismatch. */
    handlerRegistered = this.actions.has(this.descriptor.id);
    /**
     * A `computed`, not a field: the rule reads the rule context, which tracks the
     * signed-in user and the current route, so evaluating once at construction
     * would freeze the answer.
     */
    enabled = computed(() => this.extensions.evaluateRule(ACME_EXTENSIONS_EXTENSION_IDS.rules[0], this.ruleContext.context()), ...(ngDevMode ? [{ debugName: "enabled" }] : []));
    run() {
        // Returns false rather than throwing for an unregistered ID, so a manifest
        // naming an action a newer build provides degrades quietly.
        this.actions.execute(this.descriptor, this.ruleContext.context());
    }
    static ɵfac = function AcmePanelComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AcmePanelComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AcmePanelComponent, selectors: [["acme-panel"]], decls: 13, vars: 1, consts: [[1, "acme-panel"], [1, "acme-panel__hint"], ["type", "button", 3, "click", "disabled"]], template: function AcmePanelComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "section", 0)(1, "h2");
            i0.ɵɵtext(2, "AcmeExtensions");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(3, "p");
            i0.ɵɵtext(4, " Contributed by ");
            i0.ɵɵdomElementStart(5, "code");
            i0.ɵɵtext(6, "@agentic-ui/acme-extensions");
            i0.ɵɵdomElementEnd();
            i0.ɵɵtext(7, " and addressable as ");
            i0.ɵɵdomElementStart(8, "code");
            i0.ɵɵtext(9, "acme.panel.acmeExtensions");
            i0.ɵɵdomElementEnd();
            i0.ɵɵtext(10, ". ");
            i0.ɵɵdomElementEnd();
            i0.ɵɵconditionalCreate(11, AcmePanelComponent_Conditional_11_Template, 3, 3)(12, AcmePanelComponent_Conditional_12_Template, 5, 0, "p", 1);
            i0.ɵɵdomElementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(11);
            i0.ɵɵconditional(ctx.handlerRegistered ? 11 : 12);
        } }, styles: ["//[_ngcontent-%COMP%]   Reads[_ngcontent-%COMP%]   CSS[_ngcontent-%COMP%]   custom[_ngcontent-%COMP%]   properties[_ngcontent-%COMP%]   with[_ngcontent-%COMP%]   inline[_ngcontent-%COMP%]   fallbacks[_ngcontent-%COMP%], so[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   panel[_ngcontent-%COMP%]   renders\n//[_ngcontent-%COMP%]   correctly[_ngcontent-%COMP%]   whether[_ngcontent-%COMP%]   or[_ngcontent-%COMP%]   not[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   host[_ngcontent-%COMP%]   application[_ngcontent-%COMP%]   defines[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   theme.\n.acme-panel[_ngcontent-%COMP%] {\n  padding: 1.25rem;\n  border: 1px solid var(--shell-border, #d0d7de);\n  border-radius: 8px;\n\n  h2 {\n    margin: 0 0 0.5rem;\n    font-size: 1.075rem;\n  }\n\n  &__hint {\n    margin: 0.5rem 0 0;\n    color: var(--shell-muted, #656d76);\n    font-size: 0.875rem;\n  }\n\n  button {\n    padding: 0.5rem 1rem;\n    border: 1px solid var(--shell-border, #d0d7de);\n    border-radius: 6px;\n    background: var(--shell-nav-bg, #f6f8fa);\n    font: inherit;\n    cursor: pointer;\n\n    &:disabled {\n      opacity: 0.55;\n      cursor: not-allowed;\n    }\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AcmePanelComponent, [{
        type: Component,
        args: [{ selector: 'acme-panel', standalone: true, template: "<section class=\"acme-panel\">\n  <h2>AcmeExtensions</h2>\n\n  <p>\n    Contributed by <code>@agentic-ui/acme-extensions</code> and addressable as\n    <code>acme.panel.acmeExtensions</code>.\n  </p>\n\n  @if (handlerRegistered) {\n    <button type=\"button\" [disabled]=\"!enabled()\" (click)=\"run()\">{{ actionLabel }}</button>\n    @if (!enabled()) {\n      <p class=\"acme-panel__hint\">\n        Offered but not currently applicable \u2014 <code>acme.rules.canUseAcme</code>\n        evaluates to false.\n      </p>\n    }\n  } @else {\n    <p class=\"acme-panel__hint\">\n      No handler registered under <code>acme.actions.acmeExtensionsExport</code>.\n    </p>\n  }\n</section>\n", styles: ["// Reads CSS custom properties with inline fallbacks, so the panel renders\n// correctly whether or not the host application defines a theme.\n.acme-panel {\n  padding: 1.25rem;\n  border: 1px solid var(--shell-border, #d0d7de);\n  border-radius: 8px;\n\n  h2 {\n    margin: 0 0 0.5rem;\n    font-size: 1.075rem;\n  }\n\n  &__hint {\n    margin: 0.5rem 0 0;\n    color: var(--shell-muted, #656d76);\n    font-size: 0.875rem;\n  }\n\n  button {\n    padding: 0.5rem 1rem;\n    border: 1px solid var(--shell-border, #d0d7de);\n    border-radius: 6px;\n    background: var(--shell-nav-bg, #f6f8fa);\n    font: inherit;\n    cursor: pointer;\n\n    &:disabled {\n      opacity: 0.55;\n      cursor: not-allowed;\n    }\n  }\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AcmePanelComponent, { className: "AcmePanelComponent", filePath: "libs/extensions/acme-extensions/src/lib/panel/acme-panel.ts", lineNumber: 28 }); })();
