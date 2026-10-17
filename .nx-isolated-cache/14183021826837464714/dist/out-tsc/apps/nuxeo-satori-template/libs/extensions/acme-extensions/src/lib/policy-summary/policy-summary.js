import { Component } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * `acme.panel.policySummary`
 *
 * Contributed to the platform **by ID**, behind a lazy import. Nothing in the host
 * imports this class — a manifest or a host route names the ID and
 * `ExtensionOutletComponent` resolves it. That is what leaves the class name free to
 * change without being a breaking change.
 */
export class PolicySummaryComponent {
    static ɵfac = function PolicySummaryComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PolicySummaryComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: PolicySummaryComponent, selectors: [["acme-policy-summary"]], decls: 13, vars: 0, consts: [[1, "acme-policy-summary"], [1, "acme-policy-summary__hint"]], template: function PolicySummaryComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "section", 0)(1, "h2");
            i0.ɵɵtext(2, "PolicySummary");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(3, "p");
            i0.ɵɵtext(4, " Registered as ");
            i0.ɵɵdomElementStart(5, "code");
            i0.ɵɵtext(6, "acme.panel.policySummary");
            i0.ɵɵdomElementEnd();
            i0.ɵɵtext(7, " by ");
            i0.ɵɵdomElementStart(8, "code");
            i0.ɵɵtext(9, "acme-extensions");
            i0.ɵɵdomElementEnd();
            i0.ɵɵtext(10, ", and resolved from the registry \u2014 the host never imported this class. ");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(11, "p", 1);
            i0.ɵɵtext(12, "Replace this with your own content.");
            i0.ɵɵdomElementEnd()();
        } }, styles: ["//[_ngcontent-%COMP%]   Reads[_ngcontent-%COMP%]   CSS[_ngcontent-%COMP%]   custom[_ngcontent-%COMP%]   properties[_ngcontent-%COMP%]   with[_ngcontent-%COMP%]   inline[_ngcontent-%COMP%]   fallbacks[_ngcontent-%COMP%], so[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   panel[_ngcontent-%COMP%]   renders[_ngcontent-%COMP%]   correctly\n//[_ngcontent-%COMP%]   whether[_ngcontent-%COMP%]   or[_ngcontent-%COMP%]   not[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   host[_ngcontent-%COMP%]   application[_ngcontent-%COMP%]   defines[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   theme.\n.acme-policy-summary[_ngcontent-%COMP%] {\n  padding: 1.25rem;\n  border: 1px solid var(--shell-border, #d0d7de);\n  border-radius: 8px;\n\n  h2 {\n    margin: 0 0 0.5rem;\n    font-size: 1.075rem;\n  }\n\n  &__hint {\n    margin: 0.5rem 0 0;\n    color: var(--shell-muted, #656d76);\n    font-size: 0.875rem;\n  }\n\n  code {\n    font-family: ui-monospace, SFMono-Regular, monospace;\n    font-size: 0.9em;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PolicySummaryComponent, [{
        type: Component,
        args: [{ selector: 'acme-policy-summary', standalone: true, template: "<section class=\"acme-policy-summary\">\n  <h2>PolicySummary</h2>\n  <p>\n    Registered as <code>acme.panel.policySummary</code> by <code>acme-extensions</code>, and\n    resolved from the registry \u2014 the host never imported this class.\n  </p>\n  <p class=\"acme-policy-summary__hint\">Replace this with your own content.</p>\n</section>\n", styles: ["// Reads CSS custom properties with inline fallbacks, so the panel renders correctly\n// whether or not the host application defines a theme.\n.acme-policy-summary {\n  padding: 1.25rem;\n  border: 1px solid var(--shell-border, #d0d7de);\n  border-radius: 8px;\n\n  h2 {\n    margin: 0 0 0.5rem;\n    font-size: 1.075rem;\n  }\n\n  &__hint {\n    margin: 0.5rem 0 0;\n    color: var(--shell-muted, #656d76);\n    font-size: 0.875rem;\n  }\n\n  code {\n    font-family: ui-monospace, SFMono-Regular, monospace;\n    font-size: 0.9em;\n  }\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(PolicySummaryComponent, { className: "PolicySummaryComponent", filePath: "libs/extensions/acme-extensions/src/lib/policy-summary/policy-summary.ts", lineNumber: 17 }); })();
