import { Component, computed, inject } from '@angular/core';
import { AppConfigService } from '@nuxeo/satori-platform/app-config';
import { AppExtensionsService } from '@nuxeo/satori-platform/extensions';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item[0];
function HomeComponent_For_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const fragment_r1 = ctx.$implicit;
    const ɵ$index_31_r2 = ctx.$index;
    const ɵ$count_31_r3 = ctx.$count;
    i0.ɵɵtextInterpolate2(" ", fragment_r1.component, "", ɵ$index_31_r2 === ɵ$count_31_r3 - 1 ? "" : ", ", " ");
} }
function HomeComponent_ForEmpty_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " none ");
} }
function HomeComponent_For_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const fragment_r4 = ctx.$implicit;
    const ɵ$index_40_r5 = ctx.$index;
    const ɵ$count_40_r6 = ctx.$count;
    i0.ɵɵtextInterpolate2(" ", fragment_r4.component, "", ɵ$index_40_r5 === ɵ$count_40_r6 - 1 ? "" : ", ", " ");
} }
function HomeComponent_ForEmpty_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " none ");
} }
function HomeComponent_Conditional_28_For_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "li");
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const message_r7 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(message_r7);
} }
function HomeComponent_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "p", 3);
    i0.ɵɵtext(1, "Fallbacks that happened, in order:");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(2, "ul", 4);
    i0.ɵɵrepeaterCreate(3, HomeComponent_Conditional_28_For_4_Template, 2, 1, "li", null, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r7 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r7.diagnostics().messages);
} }
function HomeComponent_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "p", 3);
    i0.ɵɵtext(1, "Both halves loaded without falling back.");
    i0.ɵɵdomElementEnd();
} }
function HomeComponent_For_36_For_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "li")(1, "code");
    i0.ɵɵtext(2);
    i0.ɵɵdomElementEnd()();
} if (rf & 2) {
    const id_r9 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(id_r9);
} }
function HomeComponent_For_36_ForEmpty_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "li", 3);
    i0.ɵɵtext(1, "none");
    i0.ɵɵdomElementEnd();
} }
function HomeComponent_For_36_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "h3", 5);
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(2, "ul", 6);
    i0.ɵɵrepeaterCreate(3, HomeComponent_For_36_For_4_Template, 3, 1, "li", null, i0.ɵɵrepeaterTrackByIdentity, false, HomeComponent_For_36_ForEmpty_5_Template, 2, 0, "li", 3);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const group_r10 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(group_r10[0]);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(group_r10[1]);
} }
/**
 * A diagnostics page, which is the most useful thing a template's landing page
 * can be: it shows a fork what its own configuration actually resolved to.
 *
 * `inventory()` is the same call `docs/extension-reference.md` is generated from,
 * so a customer can see every id their build registered — including their own —
 * without reading our source.
 */
export class HomeComponent {
    config = inject(AppConfigService);
    extensions = inject(AppExtensionsService);
    branding = computed(() => this.config.bootstrap().branding, ...(ngDevMode ? [{ debugName: "branding" }] : []));
    /**
     * Where each half of the configuration came from, and why it fell back.
     *
     * Worth surfacing in a template: a fork that has not deployed `bootstrap.json`
     * yet gets the packaged defaults silently, and "why is my branding not
     * applying" is otherwise invisible.
     */
    diagnostics = this.config.diagnostics;
    /** Every registered id, grouped by slot, plus the rule evaluator ids. */
    inventory = computed(() => Object.entries(this.extensions.inventory()), ...(ngDevMode ? [{ debugName: "inventory" }] : []));
    static ɵfac = function HomeComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HomeComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HomeComponent, selectors: [["app-home"]], decls: 37, vars: 6, consts: [[1, "home__lede"], [1, "home__panel"], [1, "home__facts"], [1, "home__hint"], [1, "home__messages"], [1, "home__group"], [1, "home__ids"]], template: function HomeComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "h1");
            i0.ɵɵtext(1);
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(2, "p", 0);
            i0.ɵɵtext(3, " A fork of this template. Everything below was resolved at runtime from Layer 0 configuration and the Layer 1 manifest \u2014 none of it is compiled in.\n");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(4, "section", 1)(5, "h2");
            i0.ɵɵtext(6, "Configuration sources");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(7, "dl", 2)(8, "dt");
            i0.ɵɵtext(9, "Bootstrap");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(10, "dd");
            i0.ɵɵtext(11);
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(12, "dt");
            i0.ɵɵtext(13, "Manifest");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(14, "dd");
            i0.ɵɵtext(15);
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(16, "dt");
            i0.ɵɵtext(17, "Bootstrap packages");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(18, "dd");
            i0.ɵɵrepeaterCreate(19, HomeComponent_For_20_Template, 1, 2, null, null, i0.ɵɵrepeaterTrackByIndex, false, HomeComponent_ForEmpty_21_Template, 1, 0);
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(22, "dt");
            i0.ɵɵtext(23, "Manifest packages");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(24, "dd");
            i0.ɵɵrepeaterCreate(25, HomeComponent_For_26_Template, 1, 2, null, null, i0.ɵɵrepeaterTrackByIndex, false, HomeComponent_ForEmpty_27_Template, 1, 0);
            i0.ɵɵdomElementEnd()();
            i0.ɵɵconditionalCreate(28, HomeComponent_Conditional_28_Template, 5, 0)(29, HomeComponent_Conditional_29_Template, 2, 0, "p", 3);
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(30, "section", 1)(31, "h2");
            i0.ɵɵtext(32, "Registered extension IDs");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(33, "p", 3);
            i0.ɵɵtext(34, " Every ID this build registered, including the template's own. A manifest may address any of them. ");
            i0.ɵɵdomElementEnd();
            i0.ɵɵrepeaterCreate(35, HomeComponent_For_36_Template, 6, 2, null, null, _forTrack0);
            i0.ɵɵdomElementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(ctx.branding().applicationTitle);
            i0.ɵɵadvance(10);
            i0.ɵɵtextInterpolate(ctx.diagnostics().bootstrapSource);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(ctx.diagnostics().manifestSource);
            i0.ɵɵadvance(4);
            i0.ɵɵrepeater(ctx.diagnostics().bootstrapFragments);
            i0.ɵɵadvance(6);
            i0.ɵɵrepeater(ctx.diagnostics().manifestFragments);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.diagnostics().messages.length ? 28 : 29);
            i0.ɵɵadvance(7);
            i0.ɵɵrepeater(ctx.inventory());
        } }, styles: ["h1[_ngcontent-%COMP%] {\n  margin: 0 0 0.5rem;\n  font-size: 1.5rem;\n}\n\n.home__lede[_ngcontent-%COMP%] {\n  margin: 0 0 2rem;\n  max-width: 60ch;\n  color: var(--shell-muted, #656d76);\n}\n\n.home__panel[_ngcontent-%COMP%] {\n  margin-bottom: 2rem;\n  padding: 1.25rem;\n  border: 1px solid var(--shell-border, #d0d7de);\n  border-radius: 8px;\n\n  h2 {\n    margin: 0 0 0.75rem;\n    font-size: 1.075rem;\n  }\n}\n\n.home__facts[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: max-content 1fr;\n  gap: 0.25rem 1rem;\n  margin: 0 0 1rem;\n\n  dt {\n    font-weight: 600;\n  }\n\n  dd {\n    margin: 0;\n  }\n}\n\n.home__hint[_ngcontent-%COMP%] {\n  margin: 0.5rem 0;\n  color: var(--shell-muted, #656d76);\n  font-size: 0.875rem;\n}\n\n.home__group[_ngcontent-%COMP%] {\n  margin: 1rem 0 0.25rem;\n  font-size: 0.875rem;\n  font-family: ui-monospace, SFMono-Regular, monospace;\n  color: var(--shell-muted, #656d76);\n}\n\n.home__ids[_ngcontent-%COMP%], \n.home__messages[_ngcontent-%COMP%] {\n  margin: 0;\n  padding-left: 1.25rem;\n  font-size: 0.875rem;\n\n  li {\n    margin: 0.125rem 0;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HomeComponent, [{
        type: Component,
        args: [{ selector: 'app-home', standalone: true, template: "<h1>{{ branding().applicationTitle }}</h1>\n\n<p class=\"home__lede\">\n  A fork of this template. Everything below was resolved at runtime from Layer 0 configuration and\n  the Layer 1 manifest \u2014 none of it is compiled in.\n</p>\n\n<section class=\"home__panel\">\n  <h2>Configuration sources</h2>\n  <dl class=\"home__facts\">\n    <dt>Bootstrap</dt>\n    <dd>{{ diagnostics().bootstrapSource }}</dd>\n    <dt>Manifest</dt>\n    <dd>{{ diagnostics().manifestSource }}</dd>\n    <dt>Bootstrap packages</dt>\n    <dd>\n      @for (fragment of diagnostics().bootstrapFragments; track $index) {\n        {{ fragment.component }}{{ $last ? '' : ', ' }}\n      } @empty {\n        none\n      }\n    </dd>\n    <dt>Manifest packages</dt>\n    <dd>\n      @for (fragment of diagnostics().manifestFragments; track $index) {\n        {{ fragment.component }}{{ $last ? '' : ', ' }}\n      } @empty {\n        none\n      }\n    </dd>\n  </dl>\n\n  @if (diagnostics().messages.length) {\n    <p class=\"home__hint\">Fallbacks that happened, in order:</p>\n    <ul class=\"home__messages\">\n      @for (message of diagnostics().messages; track $index) {\n        <li>{{ message }}</li>\n      }\n    </ul>\n  } @else {\n    <p class=\"home__hint\">Both halves loaded without falling back.</p>\n  }\n</section>\n\n<section class=\"home__panel\">\n  <h2>Registered extension IDs</h2>\n  <p class=\"home__hint\">\n    Every ID this build registered, including the template's own. A manifest may address any of\n    them.\n  </p>\n\n  @for (group of inventory(); track group[0]) {\n    <h3 class=\"home__group\">{{ group[0] }}</h3>\n    <ul class=\"home__ids\">\n      @for (id of group[1]; track id) {\n        <li>\n          <code>{{ id }}</code>\n        </li>\n      } @empty {\n        <li class=\"home__hint\">none</li>\n      }\n    </ul>\n  }\n</section>\n", styles: ["h1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.5rem;\n}\n\n.home__lede {\n  margin: 0 0 2rem;\n  max-width: 60ch;\n  color: var(--shell-muted, #656d76);\n}\n\n.home__panel {\n  margin-bottom: 2rem;\n  padding: 1.25rem;\n  border: 1px solid var(--shell-border, #d0d7de);\n  border-radius: 8px;\n\n  h2 {\n    margin: 0 0 0.75rem;\n    font-size: 1.075rem;\n  }\n}\n\n.home__facts {\n  display: grid;\n  grid-template-columns: max-content 1fr;\n  gap: 0.25rem 1rem;\n  margin: 0 0 1rem;\n\n  dt {\n    font-weight: 600;\n  }\n\n  dd {\n    margin: 0;\n  }\n}\n\n.home__hint {\n  margin: 0.5rem 0;\n  color: var(--shell-muted, #656d76);\n  font-size: 0.875rem;\n}\n\n.home__group {\n  margin: 1rem 0 0.25rem;\n  font-size: 0.875rem;\n  font-family: ui-monospace, SFMono-Regular, monospace;\n  color: var(--shell-muted, #656d76);\n}\n\n.home__ids,\n.home__messages {\n  margin: 0;\n  padding-left: 1.25rem;\n  font-size: 0.875rem;\n\n  li {\n    margin: 0.125rem 0;\n  }\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HomeComponent, { className: "HomeComponent", filePath: "apps/nuxeo-satori-template/src/app/pages/home/home.ts", lineNumber: 20 }); })();
