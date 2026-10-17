import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { nxsVisibleText } from '../visible-text';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
import * as i3 from "@angular/material/menu";
import * as i4 from "@angular/material/tooltip";
const _forTrack0 = ($index, $item) => $item.id;
function NxsActionMenuComponent_Conditional_0_For_8_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 2);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const action_r2 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(action_r2.icon);
} }
function NxsActionMenuComponent_Conditional_0_For_8_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 4);
    i0.ɵɵlistener("click", function NxsActionMenuComponent_Conditional_0_For_8_Template_button_click_0_listener() { const action_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.selected.emit(action_r2)); });
    i0.ɵɵconditionalCreate(1, NxsActionMenuComponent_Conditional_0_For_8_Conditional_1_Template, 2, 1, "mat-icon", 2);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const action_r2 = ctx.$implicit;
    i0.ɵɵproperty("disabled", action_r2.disabled ?? false);
    i0.ɵɵattribute("data-action-id", action_r2.id);
    i0.ɵɵadvance();
    i0.ɵɵconditional(action_r2.icon ? 1 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(action_r2.label);
} }
function NxsActionMenuComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵelementStart(2, "button", 1)(3, "mat-icon", 2);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "mat-menu", null, 0);
    i0.ɵɵrepeaterCreate(7, NxsActionMenuComponent_Conditional_0_For_8_Template, 4, 4, "button", 3, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const menu_r4 = i0.ɵɵreference(6);
    const ctx_r2 = i0.ɵɵnextContext();
    const name_r5 = ctx_r2.ownLabel() || i0.ɵɵpipeBind1(1, 4, "satori-components.action-menu.more-actions");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matMenuTriggerFor", menu_r4)("matTooltip", name_r5);
    i0.ɵɵattribute("aria-label", name_r5);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.icon());
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.actions());
} }
/**
 * An icon button that opens a menu of actions — the renderer for an action slot such as
 * `contextMenu`.
 *
 * Presentational: the host resolves its slot's descriptors into entries (labels translated, enabled
 * rules evaluated) and runs the action `selected` names, so the library takes no dependency on the
 * extensions barrel. With no entries it renders nothing; a trigger that opens an empty menu is a
 * control that does nothing.
 */
export class NxsActionMenuComponent {
    /** The entries, in display order. */
    actions = input.required(...(ngDevMode ? [{ debugName: "actions" }] : []));
    /**
     * The trigger's accessible name and tooltip, already translated — "More actions". A blank one is
     * the caller's mistake, and it falls back to the library's own "More actions" rather than hiding
     * the entries or leaving an icon button with no name.
     */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The trigger's Material icon ligature. */
    icon = input('more_vert', ...(ngDevMode ? [{ debugName: "icon" }] : []));
    /** The entry the user chose. Never a disabled one. */
    selected = output();
    /** The label as a reader gets it: whitespace or zero-width characters alone are no name. */
    ownLabel = computed(() => nxsVisibleText(this.label()), ...(ngDevMode ? [{ debugName: "ownLabel" }] : []));
    static ɵfac = function NxsActionMenuComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsActionMenuComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsActionMenuComponent, selectors: [["nxs-action-menu"]], hostAttrs: [1, "nxs-action-menu"], inputs: { actions: [1, "actions"], label: [1, "label"], icon: [1, "icon"] }, outputs: { selected: "selected" }, decls: 1, vars: 1, consts: [["menu", "matMenu"], ["mat-icon-button", "", "type", "button", 1, "nxs-action-menu__trigger", 3, "matMenuTriggerFor", "matTooltip"], ["aria-hidden", "true"], ["mat-menu-item", "", "type", "button", 3, "disabled"], ["mat-menu-item", "", "type", "button", 3, "click", "disabled"]], template: function NxsActionMenuComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, NxsActionMenuComponent_Conditional_0_Template, 9, 6);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.actions().length > 0 ? 0 : -1);
        } }, dependencies: [MatButtonModule, i1.MatIconButton, MatIconModule, i2.MatIcon, MatMenuModule, i3.MatMenu, i3.MatMenuItem, i3.MatMenuTrigger, MatTooltipModule, i4.MatTooltip, TranslatePipe], encapsulation: 2, changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsActionMenuComponent, [{
        type: Component,
        args: [{ selector: 'nxs-action-menu', standalone: true, imports: [MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-action-menu' }, template: "@if (actions().length > 0) {\n  @let name = ownLabel() || ('satori-components.action-menu.more-actions' | translate);\n  <button\n    mat-icon-button\n    type=\"button\"\n    class=\"nxs-action-menu__trigger\"\n    [matMenuTriggerFor]=\"menu\"\n    [matTooltip]=\"name\"\n    [attr.aria-label]=\"name\"\n  >\n    <mat-icon aria-hidden=\"true\">{{ icon() }}</mat-icon>\n  </button>\n  <mat-menu #menu=\"matMenu\">\n    @for (action of actions(); track action.id) {\n      <button\n        mat-menu-item\n        type=\"button\"\n        [attr.data-action-id]=\"action.id\"\n        [disabled]=\"action.disabled ?? false\"\n        (click)=\"selected.emit(action)\"\n      >\n        @if (action.icon) {\n          <mat-icon aria-hidden=\"true\">{{ action.icon }}</mat-icon>\n        }\n        <span>{{ action.label }}</span>\n      </button>\n    }\n  </mat-menu>\n}\n" }]
    }], null, { actions: [{ type: i0.Input, args: [{ isSignal: true, alias: "actions", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], icon: [{ type: i0.Input, args: [{ isSignal: true, alias: "icon", required: false }] }], selected: [{ type: i0.Output, args: ["selected"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsActionMenuComponent, { className: "NxsActionMenuComponent", filePath: "libs/shared/satori-components/src/lib/action-menu/action-menu.component.ts", lineNumber: 39 }); })();
//# sourceMappingURL=action-menu.component.js.map