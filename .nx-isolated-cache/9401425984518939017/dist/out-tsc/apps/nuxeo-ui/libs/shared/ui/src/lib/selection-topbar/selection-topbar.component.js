import { Component, HostListener, ViewChild, computed, effect, inject, input, output, signal, } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppExtensionsService, DescriptorLabelPipe, EXTENSION_SLOTS, ExtensionActionRegistry, ExtensionRuleContextService, } from '@nuxeo/satori-platform/extensions';
import { TranslatePipe } from '@ngx-translate/core';
import { NxsThumbnailComponent, provideNxsThumbnailCache } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
import * as i3 from "@angular/material/tooltip";
const _c0 = ["selectionPopupPanel"];
const _c1 = a0 => ({ count: a0 });
const _forTrack0 = ($index, $item) => $item.id;
function SelectionTopbarComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 5);
    i0.ɵɵlistener("click", function SelectionTopbarComponent_Conditional_5_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.openSelectionPopup()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "shared-ui.selection-topbar.display-selection"), " ");
} }
function SelectionTopbarComponent_Conditional_9_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 8);
    i0.ɵɵpipe(1, "descriptorLabel");
    i0.ɵɵpipe(2, "descriptorLabel");
    i0.ɵɵlistener("click", function SelectionTopbarComponent_Conditional_9_For_2_Template_button_click_0_listener() { const action_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.run(action_r4)); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const action_r4 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("matTooltip", action_r4.tooltip ?? i0.ɵɵpipeBind1(1, 5, action_r4))("disabled", !ctx_r1.isEnabled(action_r4));
    i0.ɵɵattribute("data-action-id", action_r4.id)("aria-label", i0.ɵɵpipeBind1(2, 7, action_r4));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(action_r4.icon);
} }
function SelectionTopbarComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6);
    i0.ɵɵrepeaterCreate(1, SelectionTopbarComponent_Conditional_9_For_2_Template, 5, 9, "button", 7, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.bulkActions());
} }
function SelectionTopbarComponent_Conditional_10_For_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 15)(1, "nxs-thumbnail", 16);
    i0.ɵɵelement(2, "span", 17);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 18);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r6 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("documentId", item_r6.id);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(item_r6.name);
} }
function SelectionTopbarComponent_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 9);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function SelectionTopbarComponent_Conditional_10_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeSelectionPopup()); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 10, 0)(4, "div", 11)(5, "span", 12);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "button", 13);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵlistener("click", function SelectionTopbarComponent_Conditional_10_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeSelectionPopup()); });
    i0.ɵɵelementStart(10, "mat-icon");
    i0.ɵɵtext(11, "close");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(12, "div", 14);
    i0.ɵɵrepeaterCreate(13, SelectionTopbarComponent_Conditional_10_For_14_Template, 5, 2, "div", 15, _forTrack0);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 3, "shared-ui.selection-topbar.close-selected-items-popup"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 5, "shared-ui.selection-topbar.selected-items"));
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(9, 7, "shared-ui.selection-topbar.close"));
    i0.ɵɵadvance(5);
    i0.ɵɵrepeater(ctx_r1.selectedItems());
} }
export class SelectionTopbarComponent {
    selectionPopupPanel;
    lastFocusedElement = null;
    selectedCount = input.required(...(ngDevMode ? [{ debugName: "selectedCount" }] : []));
    /**
     * The selected documents. The popup draws each preview itself from `id`, so a `preview` URL
     * whose owner has since revoked it cannot break the popup; the field is kept for existing callers.
     */
    selectedItems = input([], ...(ngDevMode ? [{ debugName: "selectedItems" }] : []));
    /** Collapses the bar to its label and Clear button — no bulk actions, no popup. */
    clearOnly = input(false, ...(ngDevMode ? [{ debugName: "clearOnly" }] : []));
    /** Chrome, not an action: clearing the selection dismisses the bar itself. */
    cleared = output();
    selectionPopupOpen = signal(false, ...(ngDevMode ? [{ debugName: "selectionPopupOpen" }] : []));
    closePopupInClearOnlyMode = effect(() => {
        if (this.clearOnly()) {
            this.selectionPopupOpen.set(false);
        }
    }, ...(ngDevMode ? [{ debugName: "closePopupInClearOnlyMode" }] : []));
    extensions = inject(AppExtensionsService);
    actions = inject(ExtensionActionRegistry);
    ruleContext = inject(ExtensionRuleContextService);
    /**
     * The bulk actions to offer, resolved from the registry.
     *
     * There is no `@Output()` per action any more. Each of the six used to be a
     * fixed button here, a named output, and a handler threaded through the app
     * shell — three files across two projects to add one action. A registration
     * now does it, and the shell owns the behaviour as an action service.
     */
    bulkActions = computed(() => this.extensions.resolve(EXTENSION_SLOTS['bulk-actions'], this.ruleContext.context()), ...(ngDevMode ? [{ debugName: "bulkActions" }] : []));
    /** `enabledRule` renders the control disabled rather than hiding it. */
    isEnabled(action) {
        return this.extensions.evaluateRule(action.enabledRule, this.ruleContext.context());
    }
    run(action) {
        this.actions.execute(action, this.ruleContext.context());
    }
    openSelectionPopup() {
        this.lastFocusedElement = document.activeElement;
        this.selectionPopupOpen.set(true);
        queueMicrotask(() => {
            this.selectionPopupPanel?.nativeElement.focus();
        });
    }
    closeSelectionPopup() {
        this.selectionPopupOpen.set(false);
        const elementToFocus = this.lastFocusedElement;
        this.lastFocusedElement = null;
        if (elementToFocus) {
            queueMicrotask(() => elementToFocus.focus());
        }
    }
    onEscape() {
        if (this.selectionPopupOpen()) {
            this.closeSelectionPopup();
        }
    }
    static ɵfac = function SelectionTopbarComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SelectionTopbarComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SelectionTopbarComponent, selectors: [["lib-selection-topbar"]], viewQuery: function SelectionTopbarComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuery(_c0, 5);
        } if (rf & 2) {
            let _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.selectionPopupPanel = _t.first);
        } }, hostBindings: function SelectionTopbarComponent_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("keydown.escape", function SelectionTopbarComponent_keydown_escape_HostBindingHandler() { return ctx.onEscape(); }, i0.ɵɵresolveDocument);
        } }, inputs: { selectedCount: [1, "selectedCount"], selectedItems: [1, "selectedItems"], clearOnly: [1, "clearOnly"] }, outputs: { cleared: "cleared" }, features: [i0.ɵɵProvidersFeature([provideNxsThumbnailCache()])], decls: 11, vars: 14, consts: [["selectionPopupPanel", ""], [1, "selection-topbar"], [1, "topbar-left"], [1, "selected-label"], ["mat-button", "", "type", "button", 1, "clear-btn"], ["mat-button", "", "type", "button", 1, "clear-btn", 3, "click"], [1, "topbar-actions"], ["mat-icon-button", "", "type", "button", "matTooltipPosition", "below", "matTooltipClass", "selection-topbar-tooltip mat-tooltip-multiline", 1, "topbar-icon-btn", 3, "matTooltip", "disabled"], ["mat-icon-button", "", "type", "button", "matTooltipPosition", "below", "matTooltipClass", "selection-topbar-tooltip mat-tooltip-multiline", 1, "topbar-icon-btn", 3, "click", "matTooltip", "disabled"], ["type", "button", 1, "selection-popup-backdrop", 3, "click"], ["role", "dialog", "aria-modal", "true", "aria-labelledby", "selection-popup-title", "tabindex", "-1", 1, "selection-popup"], [1, "selection-popup-header"], ["id", "selection-popup-title", 1, "selection-popup-title"], ["mat-icon-button", "", "type", "button", 1, "selection-popup-close", 3, "click"], [1, "selection-popup-body"], [1, "selection-item"], [1, "selection-item-preview", 3, "documentId"], [1, "selection-item-preview", "selection-item-preview--placeholder"], [1, "selection-item-name"]], template: function SelectionTopbarComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 1)(1, "div", 2)(2, "span", 3);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(5, SelectionTopbarComponent_Conditional_5_Template, 3, 3, "button", 4);
            i0.ɵɵelementStart(6, "button", 5);
            i0.ɵɵlistener("click", function SelectionTopbarComponent_Template_button_click_6_listener() { return ctx.cleared.emit(); });
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(9, SelectionTopbarComponent_Conditional_9_Template, 3, 0, "div", 6);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(10, SelectionTopbarComponent_Conditional_10_Template, 15, 9);
        } if (rf & 2) {
            i0.ɵɵclassProp("selection-topbar--clear-only", ctx.clearOnly());
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(4, 7, ctx.selectedCount() === 1 ? "common.count.all-selected-one" : "common.count.all-selected-many", i0.ɵɵpureFunction1(12, _c1, ctx.selectedCount())));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.clearOnly() ? 5 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(8, 10, "shared-ui.selection-topbar.clear"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.clearOnly() ? 9 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.clearOnly() && ctx.selectionPopupOpen() ? 10 : -1);
        } }, dependencies: [NxsThumbnailComponent,
            MatButtonModule, i1.MatButton, i1.MatIconButton, MatIconModule, i2.MatIcon, MatTooltipModule, i3.MatTooltip, DescriptorLabelPipe,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  flex-shrink: 0;\n}\n\n.selection-topbar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 0 16px 0 calc(var(--sat-platform-nav-width, 56px) + 16px);\n  height: 48px;\n  background: var(--mat-sys-primary, #1a73e8);\n  color: #fff;\n  border-radius: 4px 4px 0 0;\n  margin-bottom: 0;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18);\n}\n\n.topbar-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n}\n\n.selected-label[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 600;\n  white-space: nowrap;\n}\n\n.clear-btn[_ngcontent-%COMP%] {\n  color: #fff;\n  font-size: 13px;\n  font-weight: 500;\n  padding: 0 8px;\n  min-width: unset;\n  line-height: 32px;\n  height: 32px;\n  border-radius: 4px;\n  text-decoration: underline;\n\n  &:hover {\n    background: rgba(255, 255, 255, 0.15);\n  }\n}\n\n.topbar-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.topbar-icon-btn[_ngcontent-%COMP%] {\n  color: #fff;\n  width: 36px;\n  height: 36px;\n\n  &:hover:not(:disabled) {\n    background: rgba(255, 255, 255, 0.15);\n  }\n\n  &:disabled {\n    color: var(--mat-sys-on-primary, #fff);\n    opacity: 0.45;\n  }\n}\n\n.selection-popup-backdrop[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.35);\n  z-index: 1000;\n  border: none;\n  cursor: pointer;\n  font: inherit;\n  padding: 0;\n}\n\n.selection-popup[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  z-index: 1001;\n  width: min(560px, 100%);\n  max-height: min(70vh, 560px);\n  background: #fff;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  border-radius: 10px;\n  box-shadow: 0 14px 38px rgba(0, 0, 0, 0.22);\n  display: flex;\n  flex-direction: column;\n}\n\n.selection-popup-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 12px 12px 12px 16px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n}\n\n.selection-popup-title[_ngcontent-%COMP%] {\n  font-size: 16px;\n  font-weight: 600;\n}\n\n.selection-popup-close[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n}\n\n.selection-popup-body[_ngcontent-%COMP%] {\n  padding: 8px 16px 16px;\n  overflow: auto;\n}\n\n.selection-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  font-size: 14px;\n  padding: 8px 0;\n  word-break: break-word;\n}\n\n.selection-item-preview[_ngcontent-%COMP%] {\n  width: 24px;\n  height: 24px;\n  border-radius: 4px;\n  object-fit: cover;\n  flex-shrink: 0;\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  background: #f5f6fa;\n}\n\n.selection-item-preview--placeholder[_ngcontent-%COMP%] {\n  display: inline-block;\n}\n\n.selection-item-name[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SelectionTopbarComponent, [{
        type: Component,
        args: [{ selector: 'lib-selection-topbar', standalone: true, imports: [
                    DescriptorLabelPipe,
                    NxsThumbnailComponent,
                    TranslatePipe,
                    MatButtonModule,
                    MatIconModule,
                    MatTooltipModule,
                ], providers: [provideNxsThumbnailCache()], template: "<div class=\"selection-topbar\" [class.selection-topbar--clear-only]=\"clearOnly()\">\n  <div class=\"topbar-left\">\n    <span class=\"selected-label\">{{\n      (selectedCount() === 1 ? 'common.count.all-selected-one' : 'common.count.all-selected-many')\n        | translate: { count: selectedCount() }\n    }}</span>\n    @if (!clearOnly()) {\n      <button mat-button type=\"button\" class=\"clear-btn\" (click)=\"openSelectionPopup()\">\n        {{ 'shared-ui.selection-topbar.display-selection' | translate }}\n      </button>\n    }\n    <button mat-button type=\"button\" class=\"clear-btn\" (click)=\"cleared.emit()\">\n      {{ 'shared-ui.selection-topbar.clear' | translate }}\n    </button>\n  </div>\n\n  @if (!clearOnly()) {\n    <div class=\"topbar-actions\">\n      @for (action of bulkActions(); track action.id) {\n        <button\n          mat-icon-button\n          type=\"button\"\n          class=\"topbar-icon-btn\"\n          [attr.data-action-id]=\"action.id\"\n          [matTooltip]=\"action.tooltip ?? (action | descriptorLabel)\"\n          matTooltipPosition=\"below\"\n          matTooltipClass=\"selection-topbar-tooltip mat-tooltip-multiline\"\n          [attr.aria-label]=\"action | descriptorLabel\"\n          [disabled]=\"!isEnabled(action)\"\n          (click)=\"run(action)\"\n        >\n          <mat-icon>{{ action.icon }}</mat-icon>\n        </button>\n      }\n    </div>\n  }\n</div>\n\n@if (!clearOnly() && selectionPopupOpen()) {\n  <button\n    type=\"button\"\n    class=\"selection-popup-backdrop\"\n    [attr.aria-label]=\"'shared-ui.selection-topbar.close-selected-items-popup' | translate\"\n    (click)=\"closeSelectionPopup()\"\n  ></button>\n  <div\n    #selectionPopupPanel\n    class=\"selection-popup\"\n    role=\"dialog\"\n    aria-modal=\"true\"\n    aria-labelledby=\"selection-popup-title\"\n    tabindex=\"-1\"\n  >\n    <div class=\"selection-popup-header\">\n      <span id=\"selection-popup-title\" class=\"selection-popup-title\">{{\n        'shared-ui.selection-topbar.selected-items' | translate\n      }}</span>\n      <button\n        mat-icon-button\n        type=\"button\"\n        [attr.aria-label]=\"'shared-ui.selection-topbar.close' | translate\"\n        class=\"selection-popup-close\"\n        (click)=\"closeSelectionPopup()\"\n      >\n        <mat-icon>close</mat-icon>\n      </button>\n    </div>\n\n    <div class=\"selection-popup-body\">\n      @for (item of selectedItems(); track item.id) {\n        <div class=\"selection-item\">\n          <nxs-thumbnail class=\"selection-item-preview\" [documentId]=\"item.id\">\n            <span class=\"selection-item-preview selection-item-preview--placeholder\"></span>\n          </nxs-thumbnail>\n          <span class=\"selection-item-name\">{{ item.name }}</span>\n        </div>\n      }\n    </div>\n  </div>\n}\n", styles: [":host {\n  display: block;\n  flex-shrink: 0;\n}\n\n.selection-topbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 0 16px 0 calc(var(--sat-platform-nav-width, 56px) + 16px);\n  height: 48px;\n  background: var(--mat-sys-primary, #1a73e8);\n  color: #fff;\n  border-radius: 4px 4px 0 0;\n  margin-bottom: 0;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18);\n}\n\n.topbar-left {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n}\n\n.selected-label {\n  font-size: 14px;\n  font-weight: 600;\n  white-space: nowrap;\n}\n\n.clear-btn {\n  color: #fff;\n  font-size: 13px;\n  font-weight: 500;\n  padding: 0 8px;\n  min-width: unset;\n  line-height: 32px;\n  height: 32px;\n  border-radius: 4px;\n  text-decoration: underline;\n\n  &:hover {\n    background: rgba(255, 255, 255, 0.15);\n  }\n}\n\n.topbar-actions {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.topbar-icon-btn {\n  color: #fff;\n  width: 36px;\n  height: 36px;\n\n  &:hover:not(:disabled) {\n    background: rgba(255, 255, 255, 0.15);\n  }\n\n  &:disabled {\n    color: var(--mat-sys-on-primary, #fff);\n    opacity: 0.45;\n  }\n}\n\n.selection-popup-backdrop {\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.35);\n  z-index: 1000;\n  border: none;\n  cursor: pointer;\n  font: inherit;\n  padding: 0;\n}\n\n.selection-popup {\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  z-index: 1001;\n  width: min(560px, 100%);\n  max-height: min(70vh, 560px);\n  background: #fff;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  border-radius: 10px;\n  box-shadow: 0 14px 38px rgba(0, 0, 0, 0.22);\n  display: flex;\n  flex-direction: column;\n}\n\n.selection-popup-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 12px 12px 12px 16px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n}\n\n.selection-popup-title {\n  font-size: 16px;\n  font-weight: 600;\n}\n\n.selection-popup-close {\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n}\n\n.selection-popup-body {\n  padding: 8px 16px 16px;\n  overflow: auto;\n}\n\n.selection-item {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  font-size: 14px;\n  padding: 8px 0;\n  word-break: break-word;\n}\n\n.selection-item-preview {\n  width: 24px;\n  height: 24px;\n  border-radius: 4px;\n  object-fit: cover;\n  flex-shrink: 0;\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  background: #f5f6fa;\n}\n\n.selection-item-preview--placeholder {\n  display: inline-block;\n}\n\n.selection-item-name {\n  flex: 1;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n"] }]
    }], null, { selectionPopupPanel: [{
            type: ViewChild,
            args: ['selectionPopupPanel']
        }], selectedCount: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectedCount", required: true }] }], selectedItems: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectedItems", required: false }] }], clearOnly: [{ type: i0.Input, args: [{ isSignal: true, alias: "clearOnly", required: false }] }], cleared: [{ type: i0.Output, args: ["cleared"] }], onEscape: [{
            type: HostListener,
            args: ['document:keydown.escape']
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SelectionTopbarComponent, { className: "SelectionTopbarComponent", filePath: "libs/shared/ui/src/lib/selection-topbar/selection-topbar.component.ts", lineNumber: 43 }); })();
