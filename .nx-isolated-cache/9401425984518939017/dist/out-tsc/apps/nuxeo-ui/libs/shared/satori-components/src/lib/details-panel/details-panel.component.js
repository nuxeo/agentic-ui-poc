import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, model, output, viewChildren, } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
const _c0 = ["tabButton"];
const _c1 = ["*"];
const _forTrack0 = ($index, $item) => $item.id;
function NxsDetailsPanelComponent_For_9_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 8, 0);
    i0.ɵɵlistener("click", function NxsDetailsPanelComponent_For_9_Template_button_click_0_listener() { const tab_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.select(tab_r2)); })("keydown", function NxsDetailsPanelComponent_For_9_Template_button_keydown_0_listener($event) { const ɵ$index_14_r4 = i0.ɵɵrestoreView(_r1).$index; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.onKeydown($event, ɵ$index_14_r4)); });
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tab_r2 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("nxs-details-panel__tab--active", tab_r2.id === ctx_r2.activeId());
    i0.ɵɵproperty("id", ctx_r2.tabId(tab_r2.id))("tabIndex", tab_r2.id === ctx_r2.activeId() ? 0 : -1);
    i0.ɵɵattribute("data-tab-id", tab_r2.id)("aria-selected", tab_r2.id === ctx_r2.activeId())("aria-controls", ctx_r2.panelId);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", tab_r2.label, " ");
} }
let nextId = 0;
/**
 * The side panel of a document page — Web UI's `nuxeo-document-page` side pane, with its
 * Comments and Activity tabs, here with Properties beside them.
 *
 * It owns the frame: a header naming the document with a close button, a strip of ARIA tabs, and
 * one tab panel holding whatever the host projects for the selected view. Which views exist (Web
 * UI offers Comments only on a `Commentable` document) and what each shows are the host's.
 */
export class NxsDetailsPanelComponent {
    element = inject(ElementRef);
    uid = `nxs-details-panel-${nextId++}`;
    tabButtons = viewChildren('tabButton', ...(ngDevMode ? [{ debugName: "tabButtons" }] : []));
    /** The header text — usually the document's title or file name. */
    heading = input('', ...(ngDevMode ? [{ debugName: "heading" }] : []));
    /** The panel's accessible name, already translated. Blank falls back to `heading`. */
    label = input('', ...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The views, in order. */
    tabs = input.required(...(ngDevMode ? [{ debugName: "tabs" }] : []));
    /** The selected view's ID. Two-way; one that is not in `tabs` selects the first. */
    selected = model('', ...(ngDevMode ? [{ debugName: "selected" }] : []));
    /** The close button's accessible name. Blank falls back to "Close details". */
    closeLabel = input('', ...(ngDevMode ? [{ debugName: "closeLabel" }] : []));
    /** The close button was pressed. The host decides what closing means. */
    closed = output();
    regionLabel = computed(() => this.label().trim() || this.heading().trim() || null, ...(ngDevMode ? [{ debugName: "regionLabel" }] : []));
    ownCloseLabel = computed(() => this.closeLabel().trim(), ...(ngDevMode ? [{ debugName: "ownCloseLabel" }] : []));
    activeId = computed(() => {
        const tabs = this.tabs();
        return tabs.some((tab) => tab.id === this.selected()) ? this.selected() : (tabs[0]?.id ?? '');
    }, ...(ngDevMode ? [{ debugName: "activeId" }] : []));
    panelId = `${this.uid}-panel`;
    tabId(id) {
        return `${this.uid}-tab-${id}`;
    }
    select(tab) {
        this.selected.set(tab.id);
    }
    /** The ARIA tabs pattern: arrows move and select (automatic activation), Home and End jump. */
    onKeydown(event, index) {
        const tabs = this.tabs();
        const last = tabs.length - 1;
        const rtl = getComputedStyle(this.element.nativeElement).direction === 'rtl';
        const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
        const back = rtl ? 'ArrowRight' : 'ArrowLeft';
        const target = event.key === forward
            ? index === last
                ? 0
                : index + 1
            : event.key === back
                ? index === 0
                    ? last
                    : index - 1
                : event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                        ? last
                        : null;
        if (target === null || !tabs[target])
            return;
        event.preventDefault();
        this.select(tabs[target]);
        this.tabButtons()[target]?.nativeElement.focus();
    }
    static ɵfac = function NxsDetailsPanelComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsDetailsPanelComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsDetailsPanelComponent, selectors: [["nxs-details-panel"]], viewQuery: function NxsDetailsPanelComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.tabButtons, _c0, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, hostAttrs: ["role", "complementary", 1, "nxs-details-panel"], hostVars: 1, hostBindings: function NxsDetailsPanelComponent_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("aria-label", ctx.regionLabel());
        } }, inputs: { heading: [1, "heading"], label: [1, "label"], tabs: [1, "tabs"], selected: [1, "selected"], closeLabel: [1, "closeLabel"] }, outputs: { selected: "selectedChange", closed: "closed" }, ngContentSelectors: _c1, decls: 12, vars: 6, consts: [["tabButton", ""], [1, "nxs-details-panel__header"], [1, "nxs-details-panel__title"], ["mat-icon-button", "", "type", "button", 1, "nxs-details-panel__close", 3, "click"], ["aria-hidden", "true"], ["role", "tablist", 1, "nxs-details-panel__tabs"], ["type", "button", "role", "tab", 1, "nxs-details-panel__tab", 3, "nxs-details-panel__tab--active", "id", "tabIndex"], ["role", "tabpanel", "tabindex", "0", 1, "nxs-details-panel__body", 3, "id"], ["type", "button", "role", "tab", 1, "nxs-details-panel__tab", 3, "click", "keydown", "id", "tabIndex"]], template: function NxsDetailsPanelComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵelementStart(0, "div", 1)(1, "span", 2);
            i0.ɵɵtext(2);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "button", 3);
            i0.ɵɵpipe(4, "translate");
            i0.ɵɵlistener("click", function NxsDetailsPanelComponent_Template_button_click_3_listener() { return ctx.closed.emit(); });
            i0.ɵɵelementStart(5, "mat-icon", 4);
            i0.ɵɵtext(6, "close");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(7, "div", 5);
            i0.ɵɵrepeaterCreate(8, NxsDetailsPanelComponent_For_9_Template, 3, 8, "button", 6, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "div", 7);
            i0.ɵɵprojection(11);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.heading());
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-label", ctx.ownCloseLabel() || i0.ɵɵpipeBind1(4, 4, "satori-components.details-panel.close"));
            i0.ɵɵadvance(5);
            i0.ɵɵrepeater(ctx.tabs());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("id", ctx.panelId);
            i0.ɵɵattribute("aria-labelledby", ctx.activeId() ? ctx.tabId(ctx.activeId()) : null);
        } }, dependencies: [MatButtonModule, i1.MatIconButton, MatIconModule, i2.MatIcon, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  --nxs-details-panel-surface: var(--mat-sys-surface);\n  --nxs-details-panel-text: var(--mat-sys-on-surface);\n  --nxs-details-panel-divider: var(--mat-sys-outline-variant);\n  --nxs-details-panel-muted: var(--mat-sys-on-surface-variant);\n  --nxs-details-panel-accent: var(--mat-sys-primary);\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n  overflow: hidden;\n  background: var(--nxs-details-panel-surface);\n}\n\n.nxs-details-panel__header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  padding: 12px 8px 12px 16px;\n  border-bottom: 1px solid var(--nxs-details-panel-divider);\n  flex-shrink: 0;\n}\n\n.nxs-details-panel__title[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--nxs-details-panel-text);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n//[_ngcontent-%COMP%]   IBM[_ngcontent-%COMP%]   Equal[_ngcontent-%COMP%]   Access[_ngcontent-%COMP%]   `style_focus_visible`[_ngcontent-%COMP%]   reads[_ngcontent-%COMP%]   `[_ngcontent-%COMP%]:focus`   only[_ngcontent-%COMP%], so[_ngcontent-%COMP%]   each[_ngcontent-%COMP%]   ring[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   standalone[_ngcontent-%COMP%]   `[_ngcontent-%COMP%]:focus`\n//   rule[_ngcontent-%COMP%]   rather[_ngcontent-%COMP%]   than[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   list[_ngcontent-%COMP%]   with[_ngcontent-%COMP%]   `[_ngcontent-%COMP%]:focus-visible`.   Inset[_ngcontent-%COMP%], so[_ngcontent-%COMP%]   it[_ngcontent-%COMP%]   stays[_ngcontent-%COMP%]   inside[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   panel.\n.nxs-details-panel__close[_ngcontent-%COMP%]:focus {\n  outline: 2px solid var(--nxs-details-panel-muted);\n  outline-offset: -2px;\n}\n\n.nxs-details-panel__tabs[_ngcontent-%COMP%] {\n  display: flex;\n  border-bottom: 1px solid var(--nxs-details-panel-divider);\n  flex-shrink: 0;\n}\n\n.nxs-details-panel__tab[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 10px 16px;\n  border: none;\n  background: none;\n  font: inherit;\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--nxs-details-panel-muted);\n  cursor: pointer;\n  text-align: center;\n  position: relative;\n\n  &:hover {\n    color: var(--nxs-details-panel-text);\n  }\n\n  &--active {\n    color: var(--nxs-details-panel-accent);\n\n    &::after {\n      content: '';\n      position: absolute;\n      bottom: 0;\n      left: 0;\n      right: 0;\n      height: 2px;\n      background: var(--nxs-details-panel-accent);\n    }\n  }\n}\n\n.nxs-details-panel__tab[_ngcontent-%COMP%]:focus {\n  outline: 2px solid var(--nxs-details-panel-muted);\n  outline-offset: -2px;\n}\n\n.nxs-details-panel__body[_ngcontent-%COMP%] {\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n  padding: 16px;\n}\n\n.nxs-details-panel__body[_ngcontent-%COMP%]:focus {\n  outline: 2px solid var(--nxs-details-panel-muted);\n  outline-offset: -2px;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsDetailsPanelComponent, [{
        type: Component,
        args: [{ selector: 'nxs-details-panel', standalone: true, imports: [MatButtonModule, MatIconModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-details-panel', '[attr.aria-label]': 'regionLabel()', role: 'complementary' }, template: "<div class=\"nxs-details-panel__header\">\n  <span class=\"nxs-details-panel__title\">{{ heading() }}</span>\n  <button\n    mat-icon-button\n    type=\"button\"\n    class=\"nxs-details-panel__close\"\n    [attr.aria-label]=\"ownCloseLabel() || ('satori-components.details-panel.close' | translate)\"\n    (click)=\"closed.emit()\"\n  >\n    <mat-icon aria-hidden=\"true\">close</mat-icon>\n  </button>\n</div>\n\n<div class=\"nxs-details-panel__tabs\" role=\"tablist\">\n  @for (tab of tabs(); track tab.id; let i = $index) {\n    <button\n      #tabButton\n      type=\"button\"\n      role=\"tab\"\n      class=\"nxs-details-panel__tab\"\n      [class.nxs-details-panel__tab--active]=\"tab.id === activeId()\"\n      [id]=\"tabId(tab.id)\"\n      [attr.data-tab-id]=\"tab.id\"\n      [attr.aria-selected]=\"tab.id === activeId()\"\n      [attr.aria-controls]=\"panelId\"\n      [tabIndex]=\"tab.id === activeId() ? 0 : -1\"\n      (click)=\"select(tab)\"\n      (keydown)=\"onKeydown($event, i)\"\n    >\n      {{ tab.label }}\n    </button>\n  }\n</div>\n\n<div\n  class=\"nxs-details-panel__body\"\n  role=\"tabpanel\"\n  tabindex=\"0\"\n  [id]=\"panelId\"\n  [attr.aria-labelledby]=\"activeId() ? tabId(activeId()) : null\"\n>\n  <ng-content />\n</div>\n", styles: [":host {\n  --nxs-details-panel-surface: var(--mat-sys-surface);\n  --nxs-details-panel-text: var(--mat-sys-on-surface);\n  --nxs-details-panel-divider: var(--mat-sys-outline-variant);\n  --nxs-details-panel-muted: var(--mat-sys-on-surface-variant);\n  --nxs-details-panel-accent: var(--mat-sys-primary);\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n  overflow: hidden;\n  background: var(--nxs-details-panel-surface);\n}\n\n.nxs-details-panel__header {\n  display: flex;\n  align-items: center;\n  padding: 12px 8px 12px 16px;\n  border-bottom: 1px solid var(--nxs-details-panel-divider);\n  flex-shrink: 0;\n}\n\n.nxs-details-panel__title {\n  flex: 1;\n  min-width: 0;\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--nxs-details-panel-text);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n// IBM Equal Access `style_focus_visible` reads `:focus` only, so each ring is a standalone `:focus`\n// rule rather than a list with `:focus-visible`. Inset, so it stays inside the panel.\n.nxs-details-panel__close:focus {\n  outline: 2px solid var(--nxs-details-panel-muted);\n  outline-offset: -2px;\n}\n\n.nxs-details-panel__tabs {\n  display: flex;\n  border-bottom: 1px solid var(--nxs-details-panel-divider);\n  flex-shrink: 0;\n}\n\n.nxs-details-panel__tab {\n  flex: 1;\n  padding: 10px 16px;\n  border: none;\n  background: none;\n  font: inherit;\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--nxs-details-panel-muted);\n  cursor: pointer;\n  text-align: center;\n  position: relative;\n\n  &:hover {\n    color: var(--nxs-details-panel-text);\n  }\n\n  &--active {\n    color: var(--nxs-details-panel-accent);\n\n    &::after {\n      content: '';\n      position: absolute;\n      bottom: 0;\n      left: 0;\n      right: 0;\n      height: 2px;\n      background: var(--nxs-details-panel-accent);\n    }\n  }\n}\n\n.nxs-details-panel__tab:focus {\n  outline: 2px solid var(--nxs-details-panel-muted);\n  outline-offset: -2px;\n}\n\n.nxs-details-panel__body {\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n  padding: 16px;\n}\n\n.nxs-details-panel__body:focus {\n  outline: 2px solid var(--nxs-details-panel-muted);\n  outline-offset: -2px;\n}\n"] }]
    }], null, { tabButtons: [{ type: i0.ViewChildren, args: ['tabButton', { isSignal: true }] }], heading: [{ type: i0.Input, args: [{ isSignal: true, alias: "heading", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], tabs: [{ type: i0.Input, args: [{ isSignal: true, alias: "tabs", required: true }] }], selected: [{ type: i0.Input, args: [{ isSignal: true, alias: "selected", required: false }] }, { type: i0.Output, args: ["selectedChange"] }], closeLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "closeLabel", required: false }] }], closed: [{ type: i0.Output, args: ["closed"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsDetailsPanelComponent, { className: "NxsDetailsPanelComponent", filePath: "libs/shared/satori-components/src/lib/details-panel/details-panel.component.ts", lineNumber: 42 }); })();
