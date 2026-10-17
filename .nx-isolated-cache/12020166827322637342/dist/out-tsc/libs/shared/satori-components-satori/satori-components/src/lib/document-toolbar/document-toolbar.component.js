import { CdkAriaLive } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
import * as i3 from "@angular/material/menu";
import * as i4 from "@angular/material/tooltip";
const _c0 = ["*"];
const _forTrack0 = ($index, $item) => $item.id;
function NxsDocumentToolbarComponent_For_4_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 7);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "mat-icon", 8);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const action_r2 = i0.ɵɵnextContext().$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.nameOf(action_r2));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(action_r2.icon);
} }
function NxsDocumentToolbarComponent_For_4_Conditional_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 7);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(". ", ctx);
} }
function NxsDocumentToolbarComponent_For_4_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 9);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(2, NxsDocumentToolbarComponent_For_4_Conditional_2_Conditional_2_Template, 2, 1, "span", 7);
} if (rf & 2) {
    let tmp_13_0;
    const action_r2 = i0.ɵɵnextContext().$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(action_r2.label);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_13_0 = ctx_r2.extraOf(action_r2)) ? 2 : -1, tmp_13_0);
} }
function NxsDocumentToolbarComponent_For_4_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 6);
    i0.ɵɵlistener("click", function NxsDocumentToolbarComponent_For_4_Template_button_click_0_listener() { const action_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.run(action_r2)); });
    i0.ɵɵconditionalCreate(1, NxsDocumentToolbarComponent_For_4_Conditional_1_Template, 4, 2)(2, NxsDocumentToolbarComponent_For_4_Conditional_2_Template, 3, 2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const action_r2 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("nxs-document-toolbar__action--active", action_r2.active);
    i0.ɵɵproperty("matTooltip", ctx_r2.tooltipOf(action_r2))("disabled", !!action_r2.disabled);
    i0.ɵɵattribute("data-action-id", action_r2.id);
    i0.ɵɵadvance();
    i0.ɵɵconditional(action_r2.icon ? 1 : 2);
} }
function NxsDocumentToolbarComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 3);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵelementStart(2, "span", 7);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "mat-icon", 8);
    i0.ɵɵtext(6, "more_vert");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    const moreMenu_r4 = i0.ɵɵreference(7);
    i0.ɵɵproperty("matMenuTriggerFor", moreMenu_r4)("matTooltip", ctx_r2.ownMoreLabel() || i0.ɵɵpipeBind1(1, 3, "satori-components.document-toolbar.more-actions"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r2.ownMoreLabel() || i0.ɵɵpipeBind1(4, 5, "satori-components.document-toolbar.more-actions"));
} }
function NxsDocumentToolbarComponent_For_9_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 8);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const action_r6 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(action_r6.icon);
} }
function NxsDocumentToolbarComponent_For_9_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 10);
    i0.ɵɵlistener("click", function NxsDocumentToolbarComponent_For_9_Template_button_click_0_listener() { const action_r6 = i0.ɵɵrestoreView(_r5).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.run(action_r6)); });
    i0.ɵɵconditionalCreate(1, NxsDocumentToolbarComponent_For_9_Conditional_1_Template, 2, 1, "mat-icon", 8);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const action_r6 = ctx.$implicit;
    i0.ɵɵproperty("disabled", !!action_r6.disabled)("matTooltip", action_r6.tooltip ?? "")("matTooltipDisabled", !action_r6.tooltip);
    i0.ɵɵattribute("data-action-id", action_r6.id);
    i0.ɵɵadvance();
    i0.ɵɵconditional(action_r6.icon ? 1 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(action_r6.label);
} }
/**
 * The action row of a document page — Web UI's `nuxeo-actions-menu` in the document header.
 *
 * Presentational: the host resolves its slot's descriptors (labels translated, rules and enabled
 * rules evaluated, tooltips chosen) and runs the action `selected` names, so the library takes no
 * dependency on the extensions barrel. Inline entries are icon buttons that stay focusable while
 * disabled, so their tooltip — "Locked by Jane on 3 May" — is reachable from the keyboard; the rest
 * sit behind one "More actions" button. Content projected into it renders before the actions.
 */
export class NxsDocumentToolbarComponent {
    /** Every entry, in display order; `overflow` decides which group each one is in. */
    actions = input.required(...(ngDevMode ? [{ debugName: "actions" }] : []));
    /**
     * The group's accessible name, already translated. Blank falls back to the library's own
     * "Document actions".
     */
    label = input('', ...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The menu button's accessible name and tooltip. Blank falls back to "More actions". */
    moreLabel = input('', ...(ngDevMode ? [{ debugName: "moreLabel" }] : []));
    /** The entry the user ran. Never a disabled one. */
    selected = output();
    inline = computed(() => this.actions().filter((action) => !action.overflow), ...(ngDevMode ? [{ debugName: "inline" }] : []));
    overflow = computed(() => this.actions().filter((action) => action.overflow), ...(ngDevMode ? [{ debugName: "overflow" }] : []));
    ownLabel = computed(() => this.label().trim(), ...(ngDevMode ? [{ debugName: "ownLabel" }] : []));
    ownMoreLabel = computed(() => this.moreLabel().trim(), ...(ngDevMode ? [{ debugName: "ownMoreLabel" }] : []));
    /** A tooltip only when there is one to show: Material renders an empty one as a blank bubble. */
    tooltipOf(action) {
        return (action.tooltip ?? '').trim() || action.label;
    }
    /** What the tooltip adds to the label, if anything — "Locked by Jane on 3 May" on Unlock. */
    extraOf(action) {
        const tip = (action.tooltip ?? '').trim();
        return tip && tip !== action.label ? tip : '';
    }
    /**
     * An icon button's accessible name: its label, then what its tooltip adds, so a keyboard or
     * screen-reader user hears the lock owner a mouse user reads.
     */
    nameOf(action) {
        const extra = this.extraOf(action);
        return extra ? `${action.label}. ${extra}` : action.label;
    }
    /**
     * Inline buttons are `disabledInteractive`, so a click on a disabled one still arrives here and
     * is refused here.
     */
    run(action) {
        if (action.disabled)
            return;
        this.selected.emit(action);
    }
    static ɵfac = function NxsDocumentToolbarComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsDocumentToolbarComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsDocumentToolbarComponent, selectors: [["nxs-document-toolbar"]], hostAttrs: [1, "nxs-document-toolbar"], inputs: { actions: [1, "actions"], label: [1, "label"], moreLabel: [1, "moreLabel"] }, outputs: { selected: "selected" }, ngContentSelectors: _c0, decls: 10, vars: 4, consts: [["moreMenu", "matMenu"], ["role", "group", 1, "nxs-document-toolbar__group"], ["mat-icon-button", "", "type", "button", "disabledInteractive", "", 1, "nxs-document-toolbar__action", 3, "nxs-document-toolbar__action--active", "matTooltip", "disabled"], ["mat-icon-button", "", "type", "button", 1, "nxs-document-toolbar__more", 3, "matMenuTriggerFor", "matTooltip"], [1, "nxs-document-toolbar__menu"], ["mat-menu-item", "", "type", "button", "matTooltipPosition", "left", 3, "disabled", "matTooltip", "matTooltipDisabled"], ["mat-icon-button", "", "type", "button", "disabledInteractive", "", 1, "nxs-document-toolbar__action", 3, "click", "matTooltip", "disabled"], ["cdkAriaLive", "off", 1, "cdk-visually-hidden"], ["aria-hidden", "true"], [1, "nxs-document-toolbar__text"], ["mat-menu-item", "", "type", "button", "matTooltipPosition", "left", 3, "click", "disabled", "matTooltip", "matTooltipDisabled"]], template: function NxsDocumentToolbarComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵelementStart(0, "div", 1);
            i0.ɵɵpipe(1, "translate");
            i0.ɵɵprojection(2);
            i0.ɵɵrepeaterCreate(3, NxsDocumentToolbarComponent_For_4_Template, 3, 6, "button", 2, _forTrack0);
            i0.ɵɵconditionalCreate(5, NxsDocumentToolbarComponent_Conditional_5_Template, 7, 7, "button", 3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "mat-menu", 4, 0);
            i0.ɵɵrepeaterCreate(8, NxsDocumentToolbarComponent_For_9_Template, 4, 6, "button", 5, _forTrack0);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵattribute("aria-label", ctx.ownLabel() || i0.ɵɵpipeBind1(1, 2, "satori-components.document-toolbar.label"));
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.inline());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.overflow().length > 0 ? 5 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.overflow());
        } }, dependencies: [CdkAriaLive,
            MatButtonModule, i1.MatIconButton, MatIconModule, i2.MatIcon, MatMenuModule, i3.MatMenu, i3.MatMenuItem, i3.MatMenuTrigger, MatTooltipModule, i4.MatTooltip, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  --nxs-document-toolbar-active: var(--mat-sys-primary);\n  display: inline-flex;\n  flex-shrink: 0;\n}\n\n.nxs-document-toolbar__group[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.nxs-document-toolbar__action[_ngcontent-%COMP%], \n.nxs-document-toolbar__more[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface-variant);\n}\n\n//[_ngcontent-%COMP%]   Never[_ngcontent-%COMP%]   on[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   disabled[_ngcontent-%COMP%]   control[_ngcontent-%COMP%], so[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   highlight[_ngcontent-%COMP%]   does[_ngcontent-%COMP%]   not[_ngcontent-%COMP%]   read[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   \"you[_ngcontent-%COMP%]   can[_ngcontent-%COMP%]   press[_ngcontent-%COMP%]   this\".\n.nxs-document-toolbar__action--active[_ngcontent-%COMP%]:not(.mat-mdc-button-disabled) {\n  color: var(--nxs-document-toolbar-active);\n}\n\n.nxs-document-toolbar__text[_ngcontent-%COMP%] {\n  font-size: 12px;\n  font-weight: 500;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsDocumentToolbarComponent, [{
        type: Component,
        args: [{ selector: 'nxs-document-toolbar', standalone: true, imports: [
                    CdkAriaLive,
                    MatButtonModule,
                    MatIconModule,
                    MatMenuModule,
                    MatTooltipModule,
                    TranslatePipe,
                ], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-document-toolbar' }, template: "<div\n  class=\"nxs-document-toolbar__group\"\n  role=\"group\"\n  [attr.aria-label]=\"ownLabel() || ('satori-components.document-toolbar.label' | translate)\"\n>\n  <ng-content />\n\n  @for (action of inline(); track action.id) {\n    <!-- The name is text, not aria-label: an icon ligature beside an aria-label reads as a\n         visible label the name does not contain (WCAG 2.5.3, IBM label_name_visible). -->\n    <button\n      mat-icon-button\n      type=\"button\"\n      class=\"nxs-document-toolbar__action\"\n      [class.nxs-document-toolbar__action--active]=\"action.active\"\n      [attr.data-action-id]=\"action.id\"\n      [matTooltip]=\"tooltipOf(action)\"\n      [disabled]=\"!!action.disabled\"\n      disabledInteractive\n      (click)=\"run(action)\"\n    >\n      @if (action.icon) {\n        <span class=\"cdk-visually-hidden\" cdkAriaLive=\"off\">{{ nameOf(action) }}</span>\n        <mat-icon aria-hidden=\"true\">{{ action.icon }}</mat-icon>\n      } @else {\n        <span class=\"nxs-document-toolbar__text\">{{ action.label }}</span>\n        @if (extraOf(action); as extra) {\n          <span class=\"cdk-visually-hidden\" cdkAriaLive=\"off\">. {{ extra }}</span>\n        }\n      }\n    </button>\n  }\n\n  @if (overflow().length > 0) {\n    <button\n      mat-icon-button\n      type=\"button\"\n      class=\"nxs-document-toolbar__more\"\n      [matMenuTriggerFor]=\"moreMenu\"\n      [matTooltip]=\"\n        ownMoreLabel() || ('satori-components.document-toolbar.more-actions' | translate)\n      \"\n    >\n      <span class=\"cdk-visually-hidden\" cdkAriaLive=\"off\">{{\n        ownMoreLabel() || ('satori-components.document-toolbar.more-actions' | translate)\n      }}</span>\n      <mat-icon aria-hidden=\"true\">more_vert</mat-icon>\n    </button>\n  }\n</div>\n\n<mat-menu #moreMenu=\"matMenu\" class=\"nxs-document-toolbar__menu\">\n  @for (action of overflow(); track action.id) {\n    <button\n      mat-menu-item\n      type=\"button\"\n      [attr.data-action-id]=\"action.id\"\n      [disabled]=\"!!action.disabled\"\n      [matTooltip]=\"action.tooltip ?? ''\"\n      [matTooltipDisabled]=\"!action.tooltip\"\n      matTooltipPosition=\"left\"\n      (click)=\"run(action)\"\n    >\n      @if (action.icon) {\n        <mat-icon aria-hidden=\"true\">{{ action.icon }}</mat-icon>\n      }\n      <span>{{ action.label }}</span>\n    </button>\n  }\n</mat-menu>\n", styles: [":host {\n  --nxs-document-toolbar-active: var(--mat-sys-primary);\n  display: inline-flex;\n  flex-shrink: 0;\n}\n\n.nxs-document-toolbar__group {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.nxs-document-toolbar__action,\n.nxs-document-toolbar__more {\n  color: var(--mat-sys-on-surface-variant);\n}\n\n// Never on a disabled control, so the highlight does not read as \"you can press this\".\n.nxs-document-toolbar__action--active:not(.mat-mdc-button-disabled) {\n  color: var(--nxs-document-toolbar-active);\n}\n\n.nxs-document-toolbar__text {\n  font-size: 12px;\n  font-weight: 500;\n}\n"] }]
    }], null, { actions: [{ type: i0.Input, args: [{ isSignal: true, alias: "actions", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], moreLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "moreLabel", required: false }] }], selected: [{ type: i0.Output, args: ["selected"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsDocumentToolbarComponent, { className: "NxsDocumentToolbarComponent", filePath: "libs/shared/satori-components/src/lib/document-toolbar/document-toolbar.component.ts", lineNumber: 55 }); })();
//# sourceMappingURL=document-toolbar.component.js.map