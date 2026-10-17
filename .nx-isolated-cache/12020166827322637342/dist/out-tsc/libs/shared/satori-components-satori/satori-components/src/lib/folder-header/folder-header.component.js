import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NxsDocTypeIconComponent } from '../doc-type-icon/doc-type-icon.component';
import * as i0 from "@angular/core";
const _c0 = [[["", "nxsFolderHeaderDetail", ""]], "*"];
const _c1 = ["[nxsFolderHeaderDetail]", "*"];
function NxsFolderHeaderComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "nxs-doc-type-icon", 1);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("type", ctx_r0.documentType());
} }
function NxsFolderHeaderComponent_Conditional_3_Case_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h2", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.heading());
} }
function NxsFolderHeaderComponent_Conditional_3_Case_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h3", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.heading());
} }
function NxsFolderHeaderComponent_Conditional_3_Case_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h4", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.heading());
} }
function NxsFolderHeaderComponent_Conditional_3_Case_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h5", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.heading());
} }
function NxsFolderHeaderComponent_Conditional_3_Case_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h6", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.heading());
} }
function NxsFolderHeaderComponent_Conditional_3_Case_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h1", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.heading());
} }
function NxsFolderHeaderComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsFolderHeaderComponent_Conditional_3_Case_0_Template, 2, 1, "h2", 5)(1, NxsFolderHeaderComponent_Conditional_3_Case_1_Template, 2, 1, "h3", 5)(2, NxsFolderHeaderComponent_Conditional_3_Case_2_Template, 2, 1, "h4", 5)(3, NxsFolderHeaderComponent_Conditional_3_Case_3_Template, 2, 1, "h5", 5)(4, NxsFolderHeaderComponent_Conditional_3_Case_4_Template, 2, 1, "h6", 5)(5, NxsFolderHeaderComponent_Conditional_3_Case_5_Template, 2, 1, "h1", 5);
} if (rf & 2) {
    let tmp_1_0;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional((tmp_1_0 = ctx_r0.headingLevel()) === 2 ? 0 : tmp_1_0 === 3 ? 1 : tmp_1_0 === 4 ? 2 : tmp_1_0 === 5 ? 3 : tmp_1_0 === 6 ? 4 : 5);
} }
function NxsFolderHeaderComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 3);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.subheading());
} }
/**
 * The header above a container's contents: its type icon, its title as the page heading, an
 * optional second line, and the container's actions on the right.
 *
 * The actions are the host's, projected as they are, so a host keeps its own buttons, menus and
 * their handlers. Anything marked `nxsFolderHeaderDetail` — a breadcrumb trail, say — is
 * projected under the title instead. On a narrow screen the actions drop below the title.
 *
 * The title is the page's level-one heading unless `headingLevel` says otherwise; omit it (blank)
 * while the container is loading rather than announce an empty heading.
 */
export class NxsFolderHeaderComponent {
    /** The container's title. Blank renders no heading. */
    heading = input('', ...(ngDevMode ? [{ debugName: "heading" }] : []));
    /**
     * The title's level in the page outline, rendered as the native `<h1>`–`<h6>`. The header is
     * usually the page's own heading, so level one; lower it where the header sits inside a section
     * that already has one.
     */
    // Annotated rather than inferred, as `nxs-empty-state`'s is, to keep the published API snapshot
    // stable.
    headingLevel = input(1, ...(ngDevMode ? [{ debugName: "headingLevel" }] : []));
    /** A second line under the title — usually the type's name — already translated. */
    subheading = input('', ...(ngDevMode ? [{ debugName: "subheading" }] : []));
    /** The container's Nuxeo type, which picks the icon. Blank renders no icon. */
    documentType = input('', ...(ngDevMode ? [{ debugName: "documentType" }] : []));
    static ɵfac = function NxsFolderHeaderComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsFolderHeaderComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsFolderHeaderComponent, selectors: [["nxs-folder-header"]], hostAttrs: [1, "nxs-folder-header"], inputs: { heading: [1, "heading"], headingLevel: [1, "headingLevel"], subheading: [1, "subheading"], documentType: [1, "documentType"] }, ngContentSelectors: _c1, decls: 8, vars: 3, consts: [[1, "nxs-folder-header__lead"], [1, "nxs-folder-header__icon", 3, "type"], [1, "nxs-folder-header__text"], [1, "nxs-folder-header__subheading"], [1, "nxs-folder-header__actions"], [1, "nxs-folder-header__heading"]], template: function NxsFolderHeaderComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef(_c0);
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵconditionalCreate(1, NxsFolderHeaderComponent_Conditional_1_Template, 1, 1, "nxs-doc-type-icon", 1);
            i0.ɵɵelementStart(2, "div", 2);
            i0.ɵɵconditionalCreate(3, NxsFolderHeaderComponent_Conditional_3_Template, 6, 1);
            i0.ɵɵconditionalCreate(4, NxsFolderHeaderComponent_Conditional_4_Template, 2, 1, "span", 3);
            i0.ɵɵprojection(5);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(6, "div", 4);
            i0.ɵɵprojection(7, 1);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.documentType() ? 1 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.heading() ? 3 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.subheading() ? 4 : -1);
        } }, dependencies: [NxsDocTypeIconComponent], styles: ["[_nghost-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  min-width: 0;\n}\n\n.nxs-folder-header__lead[_ngcontent-%COMP%] {\n  display: flex;\n  flex: 1;\n  align-items: center;\n  gap: 12px;\n  min-width: 0;\n}\n\n.nxs-folder-header__icon[_ngcontent-%COMP%] {\n  --nxs-icon-size: 28px;\n  color: var(--mat-sys-primary);\n}\n\n.nxs-folder-header__text[_ngcontent-%COMP%] {\n  display: flex;\n  flex: 1;\n  flex-direction: column;\n  min-width: 0;\n}\n\n//[_ngcontent-%COMP%]   A[_ngcontent-%COMP%]   host[_ngcontent-%COMP%]   whose[_ngcontent-%COMP%]   header[_ngcontent-%COMP%]   sits[_ngcontent-%COMP%]   in[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   denser[_ngcontent-%COMP%]   layout[_ngcontent-%COMP%]   can[_ngcontent-%COMP%]   set[_ngcontent-%COMP%]   `--nxs-folder-header-heading-size`.\n//[_ngcontent-%COMP%]   Doubled[_ngcontent-%COMP%]   so[_ngcontent-%COMP%]   it[_ngcontent-%COMP%]   outranks[_ngcontent-%COMP%]   Material's[_ngcontent-%COMP%]   typography[_ngcontent-%COMP%]   hierarchy,[_ngcontent-%COMP%]   `html[data-app-theme][_ngcontent-%COMP%]   .mat-typography[_ngcontent-%COMP%]   h1`\n//[_ngcontent-%COMP%]   (0-2-2),[_ngcontent-%COMP%]   whose[_ngcontent-%COMP%]   `font`,[_ngcontent-%COMP%]   `letter-spacing`[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   `margin`[_ngcontent-%COMP%]   would[_ngcontent-%COMP%]   otherwise[_ngcontent-%COMP%]   restyle[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   heading.\n.nxs-folder-header__heading.nxs-folder-header__heading[_ngcontent-%COMP%] {\n  margin: 0;\n  overflow: hidden;\n  font: inherit;\n  font-size: var(--nxs-folder-header-heading-size, 18px);\n  font-weight: 600;\n  letter-spacing: inherit;\n  color: var(--mat-sys-on-surface);\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.nxs-folder-header__subheading[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-folder-header__actions[_ngcontent-%COMP%] {\n  display: flex;\n  flex-shrink: 0;\n  align-items: center;\n}\n\n@media (max-width: 600px) {\n  [_nghost-%COMP%] {\n    flex-direction: column;\n    align-items: flex-start;\n    gap: 8px;\n  }\n\n  .nxs-folder-header__actions[_ngcontent-%COMP%] {\n    align-self: flex-end;\n  }\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsFolderHeaderComponent, [{
        type: Component,
        args: [{ selector: 'nxs-folder-header', standalone: true, imports: [NxsDocTypeIconComponent], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-folder-header' }, template: "<div class=\"nxs-folder-header__lead\">\n  @if (documentType()) {\n    <nxs-doc-type-icon class=\"nxs-folder-header__icon\" [type]=\"documentType()\" />\n  }\n  <div class=\"nxs-folder-header__text\">\n    @if (heading()) {\n      @switch (headingLevel()) {\n        @case (2) {\n          <h2 class=\"nxs-folder-header__heading\">{{ heading() }}</h2>\n        }\n        @case (3) {\n          <h3 class=\"nxs-folder-header__heading\">{{ heading() }}</h3>\n        }\n        @case (4) {\n          <h4 class=\"nxs-folder-header__heading\">{{ heading() }}</h4>\n        }\n        @case (5) {\n          <h5 class=\"nxs-folder-header__heading\">{{ heading() }}</h5>\n        }\n        @case (6) {\n          <h6 class=\"nxs-folder-header__heading\">{{ heading() }}</h6>\n        }\n        @default {\n          <h1 class=\"nxs-folder-header__heading\">{{ heading() }}</h1>\n        }\n      }\n    }\n    @if (subheading()) {\n      <span class=\"nxs-folder-header__subheading\">{{ subheading() }}</span>\n    }\n    <ng-content select=\"[nxsFolderHeaderDetail]\" />\n  </div>\n</div>\n<div class=\"nxs-folder-header__actions\">\n  <ng-content />\n</div>\n", styles: [":host {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  min-width: 0;\n}\n\n.nxs-folder-header__lead {\n  display: flex;\n  flex: 1;\n  align-items: center;\n  gap: 12px;\n  min-width: 0;\n}\n\n.nxs-folder-header__icon {\n  --nxs-icon-size: 28px;\n  color: var(--mat-sys-primary);\n}\n\n.nxs-folder-header__text {\n  display: flex;\n  flex: 1;\n  flex-direction: column;\n  min-width: 0;\n}\n\n// A host whose header sits in a denser layout can set `--nxs-folder-header-heading-size`.\n// Doubled so it outranks Material's typography hierarchy, `html[data-app-theme] .mat-typography h1`\n// (0-2-2), whose `font`, `letter-spacing` and `margin` would otherwise restyle the heading.\n.nxs-folder-header__heading.nxs-folder-header__heading {\n  margin: 0;\n  overflow: hidden;\n  font: inherit;\n  font-size: var(--nxs-folder-header-heading-size, 18px);\n  font-weight: 600;\n  letter-spacing: inherit;\n  color: var(--mat-sys-on-surface);\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.nxs-folder-header__subheading {\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-folder-header__actions {\n  display: flex;\n  flex-shrink: 0;\n  align-items: center;\n}\n\n@media (max-width: 600px) {\n  :host {\n    flex-direction: column;\n    align-items: flex-start;\n    gap: 8px;\n  }\n\n  .nxs-folder-header__actions {\n    align-self: flex-end;\n  }\n}\n"] }]
    }], null, { heading: [{ type: i0.Input, args: [{ isSignal: true, alias: "heading", required: false }] }], headingLevel: [{ type: i0.Input, args: [{ isSignal: true, alias: "headingLevel", required: false }] }], subheading: [{ type: i0.Input, args: [{ isSignal: true, alias: "subheading", required: false }] }], documentType: [{ type: i0.Input, args: [{ isSignal: true, alias: "documentType", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsFolderHeaderComponent, { className: "NxsFolderHeaderComponent", filePath: "libs/shared/satori-components/src/lib/folder-header/folder-header.component.ts", lineNumber: 26 }); })();
//# sourceMappingURL=folder-header.component.js.map