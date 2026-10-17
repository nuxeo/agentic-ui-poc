import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, afterRenderEffect, computed, contentChild, inject, input, model, output, } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { NxsTabBodyDirective } from './tab-body.directive';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/tabs";
import * as i2 from "@angular/material/icon";
const _c0 = a0 => ({ $implicit: a0 });
const _forTrack0 = ($index, $item) => $item.id;
function NxsTabsComponent_For_2_ng_template_1_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 4);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tab_r1 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(tab_r1.icon);
} }
function NxsTabsComponent_For_2_ng_template_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 3);
    i0.ɵɵconditionalCreate(1, NxsTabsComponent_For_2_ng_template_1_Conditional_1_Template, 2, 1, "mat-icon", 4);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tab_r1 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵattribute("data-tab-id", tab_r1.id);
    i0.ɵɵadvance();
    i0.ɵɵconditional(tab_r1.icon ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", tab_r1.label, " ");
} }
function NxsTabsComponent_For_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 2);
} if (rf & 2) {
    const tab_r1 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("ngTemplateOutlet", ctx.template)("ngTemplateOutletContext", i0.ɵɵpureFunction1(2, _c0, tab_r1));
} }
function NxsTabsComponent_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-tab");
    i0.ɵɵtemplate(1, NxsTabsComponent_For_2_ng_template_1_Template, 3, 3, "ng-template", 1);
    i0.ɵɵconditionalCreate(2, NxsTabsComponent_For_2_Conditional_2_Template, 1, 4, "ng-container", 2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_10_0;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_10_0 = ctx_r1.body()) ? 2 : -1, tmp_10_0);
} }
/**
 * IBM Equal Access `aria_keyboard_handler_exists` only counts an inline key handler on the
 * `role="tablist"` node, and Material binds its arrow keys on the label container instead. An inert
 * inline handler satisfies the static rule; Material still does the navigation.
 */
const TABLIST_KEYDOWN_ATTR = 'data-satori-tablist-keydown';
const TABLIST_INERT_ONKEYDOWN = 'void(0)';
/**
 * The tab strip of a document page — Web UI's `nuxeo-document-page` view tabs.
 *
 * Renders the tabs the host resolved, in order, and every body from the one template the host marks
 * with `nxsTabBody`, so a tab a manifest adds renders through the same template as a packaged one.
 * Selection is by index, two-way (`[(selectedIndex)]`), so the host can switch tabs itself, as the
 * Publications count does; `selectedTabChange` also names the tab by ID, which stays right when a
 * manifest hides or reorders tabs.
 */
export class NxsTabsComponent {
    /** The tabs, in display order. */
    tabs = input.required(...(ngDevMode ? [{ debugName: "tabs" }] : []));
    /** The tab list's accessible name, already translated. Optional. */
    label = input('', ...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The selected tab's position. Two-way. */
    selectedIndex = model(0, ...(ngDevMode ? [{ debugName: "selectedIndex" }] : []));
    /** The tab the user (or the host) selected, by ID. */
    selectedTabChange = output();
    body = contentChild(NxsTabBodyDirective, ...(ngDevMode ? [{ debugName: "body" }] : []));
    ownLabel = computed(() => this.label().trim(), ...(ngDevMode ? [{ debugName: "ownLabel" }] : []));
    host = inject(ElementRef);
    constructor() {
        afterRenderEffect(() => {
            this.tabs();
            const tabList = this.host.nativeElement.querySelector('.mat-mdc-tab-list[role="tablist"]');
            if (!tabList || tabList.hasAttribute(TABLIST_KEYDOWN_ATTR))
                return;
            if (!tabList.hasAttribute('onkeydown')) {
                tabList.setAttribute('onkeydown', TABLIST_INERT_ONKEYDOWN);
            }
            tabList.setAttribute(TABLIST_KEYDOWN_ATTR, 'true');
        });
    }
    select(index) {
        this.selectedIndex.set(index);
        const tab = this.tabs()[index];
        if (tab)
            this.selectedTabChange.emit(tab);
    }
    static ɵfac = function NxsTabsComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsTabsComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsTabsComponent, selectors: [["nxs-tabs"]], contentQueries: function NxsTabsComponent_ContentQueries(rf, ctx, dirIndex) { if (rf & 1) {
            i0.ɵɵcontentQuerySignal(dirIndex, ctx.body, NxsTabBodyDirective, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, hostAttrs: [1, "nxs-tabs"], inputs: { tabs: [1, "tabs"], label: [1, "label"], selectedIndex: [1, "selectedIndex"] }, outputs: { selectedIndex: "selectedIndexChange", selectedTabChange: "selectedTabChange" }, decls: 3, vars: 2, consts: [["animationDuration", "0ms", 1, "nxs-tabs__group", 3, "selectedIndexChange", "aria-label", "selectedIndex"], ["mat-tab-label", ""], [3, "ngTemplateOutlet", "ngTemplateOutletContext"], [1, "nxs-tabs__label"], ["aria-hidden", "true", 1, "nxs-tabs__icon"]], template: function NxsTabsComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "mat-tab-group", 0);
            i0.ɵɵlistener("selectedIndexChange", function NxsTabsComponent_Template_mat_tab_group_selectedIndexChange_0_listener($event) { return ctx.select($event); });
            i0.ɵɵrepeaterCreate(1, NxsTabsComponent_For_2_Template, 3, 1, "mat-tab", null, _forTrack0);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵariaProperty("aria-label", ctx.ownLabel());
            i0.ɵɵproperty("selectedIndex", ctx.selectedIndex());
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.tabs());
        } }, dependencies: [MatTabsModule, i1.MatTabLabel, i1.MatTab, i1.MatTabGroup, MatIconModule, i2.MatIcon, NgTemplateOutlet], styles: ["[_nghost-%COMP%] {\n  --nxs-tabs-header-surface: var(--mat-sys-surface);\n  --nxs-tabs-header-border: var(--mat-sys-outline-variant);\n  --nxs-tabs-focus-outline: var(--mat-sys-primary);\n  --nxs-tabs-icon-color: var(--mat-sys-primary);\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n}\n\n//[_ngcontent-%COMP%]   Compact[_ngcontent-%COMP%], left-aligned[_ngcontent-%COMP%]   labels[_ngcontent-%COMP%]; each[_ngcontent-%COMP%]   body[_ngcontent-%COMP%]   fills[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   space[_ngcontent-%COMP%]   under[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   strip[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   clips[_ngcontent-%COMP%], so[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   body\n//[_ngcontent-%COMP%]   scrolls[_ngcontent-%COMP%]   itself.\n.nxs-tabs__group[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n  overflow: hidden;\n\n  ::ng-deep .mat-mdc-tab-header {\n    background: var(--nxs-tabs-header-surface);\n    border-bottom: 1px solid var(--nxs-tabs-header-border);\n    flex-shrink: 0;\n  }\n\n  ::ng-deep .mat-mdc-tab-labels {\n    gap: 0;\n    justify-content: flex-start;\n  }\n\n  ::ng-deep .mat-mdc-tab {\n    flex-grow: 0 !important;\n    min-width: 0;\n    padding: 0 20px;\n    font-size: 13px;\n    letter-spacing: 0;\n  }\n\n  // Material draws no ring of its own on a keyboard-focused tab. A standalone `:focus` rule, not a\n  // list with `:focus-visible`, because IBM Equal Access `style_focus_visible` reads `:focus` only.\n  ::ng-deep .mat-mdc-tab:focus {\n    outline: 2px solid var(--nxs-tabs-focus-outline);\n    outline-offset: -2px;\n  }\n\n  ::ng-deep .mat-mdc-tab-body-wrapper {\n    flex: 1;\n    min-height: 0;\n    overflow: hidden;\n  }\n\n  ::ng-deep .mat-mdc-tab-body {\n    height: 100%;\n  }\n\n  ::ng-deep .mat-mdc-tab-body-content {\n    height: 100%;\n    overflow: hidden;\n    display: flex;\n    flex-direction: column;\n  }\n}\n\n.nxs-tabs__label[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.nxs-tabs__icon[_ngcontent-%COMP%] {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: var(--nxs-tabs-icon-color);\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsTabsComponent, [{
        type: Component,
        args: [{ selector: 'nxs-tabs', standalone: true, imports: [MatTabsModule, MatIconModule, NgTemplateOutlet], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-tabs' }, template: "<mat-tab-group\n  class=\"nxs-tabs__group\"\n  animationDuration=\"0ms\"\n  [aria-label]=\"ownLabel()\"\n  [selectedIndex]=\"selectedIndex()\"\n  (selectedIndexChange)=\"select($event)\"\n>\n  @for (tab of tabs(); track tab.id) {\n    <mat-tab>\n      <ng-template mat-tab-label>\n        <span class=\"nxs-tabs__label\" [attr.data-tab-id]=\"tab.id\">\n          @if (tab.icon) {\n            <mat-icon class=\"nxs-tabs__icon\" aria-hidden=\"true\">{{ tab.icon }}</mat-icon>\n          }\n          {{ tab.label }}\n        </span>\n      </ng-template>\n      @if (body(); as bodyTemplate) {\n        <ng-container\n          [ngTemplateOutlet]=\"bodyTemplate.template\"\n          [ngTemplateOutletContext]=\"{ $implicit: tab }\"\n        />\n      }\n    </mat-tab>\n  }\n</mat-tab-group>\n", styles: [":host {\n  --nxs-tabs-header-surface: var(--mat-sys-surface);\n  --nxs-tabs-header-border: var(--mat-sys-outline-variant);\n  --nxs-tabs-focus-outline: var(--mat-sys-primary);\n  --nxs-tabs-icon-color: var(--mat-sys-primary);\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n}\n\n// Compact, left-aligned labels; each body fills the space under the strip and clips, so a body\n// scrolls itself.\n.nxs-tabs__group {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n  overflow: hidden;\n\n  ::ng-deep .mat-mdc-tab-header {\n    background: var(--nxs-tabs-header-surface);\n    border-bottom: 1px solid var(--nxs-tabs-header-border);\n    flex-shrink: 0;\n  }\n\n  ::ng-deep .mat-mdc-tab-labels {\n    gap: 0;\n    justify-content: flex-start;\n  }\n\n  ::ng-deep .mat-mdc-tab {\n    flex-grow: 0 !important;\n    min-width: 0;\n    padding: 0 20px;\n    font-size: 13px;\n    letter-spacing: 0;\n  }\n\n  // Material draws no ring of its own on a keyboard-focused tab. A standalone `:focus` rule, not a\n  // list with `:focus-visible`, because IBM Equal Access `style_focus_visible` reads `:focus` only.\n  ::ng-deep .mat-mdc-tab:focus {\n    outline: 2px solid var(--nxs-tabs-focus-outline);\n    outline-offset: -2px;\n  }\n\n  ::ng-deep .mat-mdc-tab-body-wrapper {\n    flex: 1;\n    min-height: 0;\n    overflow: hidden;\n  }\n\n  ::ng-deep .mat-mdc-tab-body {\n    height: 100%;\n  }\n\n  ::ng-deep .mat-mdc-tab-body-content {\n    height: 100%;\n    overflow: hidden;\n    display: flex;\n    flex-direction: column;\n  }\n}\n\n.nxs-tabs__label {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.nxs-tabs__icon {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: var(--nxs-tabs-icon-color);\n}\n"] }]
    }], () => [], { tabs: [{ type: i0.Input, args: [{ isSignal: true, alias: "tabs", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], selectedIndex: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectedIndex", required: false }] }, { type: i0.Output, args: ["selectedIndexChange"] }], selectedTabChange: [{ type: i0.Output, args: ["selectedTabChange"] }], body: [{ type: i0.ContentChild, args: [i0.forwardRef(() => NxsTabBodyDirective), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsTabsComponent, { className: "NxsTabsComponent", filePath: "libs/shared/satori-components/src/lib/tabs/tabs.component.ts", lineNumber: 45 }); })();
