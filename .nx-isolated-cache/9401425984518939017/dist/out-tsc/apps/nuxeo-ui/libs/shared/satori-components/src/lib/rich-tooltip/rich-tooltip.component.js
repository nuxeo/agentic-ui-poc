import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterRenderEffect, inject, input, signal, viewChild, } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
const _c0 = ["trigger"];
const _c1 = ["panel"];
function NxsRichTooltipComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6, 1)(2, "p", 7);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 8);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵstyleProp("translate", ctx_r1.shift() || null, "px");
    i0.ɵɵproperty("id", ctx_r1.panelId);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.heading());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.content());
} }
let nextId = 0;
/** The least gap, in px, the open panel keeps from either side of the viewport. */
const VIEWPORT_MARGIN = 8;
/** How long, in ms, the pointer rests or focus stays on the button before the panel opens: Satori's `showDelay`. */
const SHOW_DELAY = 200;
/** How long, in ms, the panel stays after the pointer leaves, so it can come back: Satori's `hideDelay`. */
const HIDE_DELAY = 1500;
/**
 * An icon button that opens a titled explanation — the Material implementation of
 * `nxs.primitives.richTooltip`.
 *
 * It opens as Satori's does: when the pointer rests on the button or keyboard focus reaches it.
 * Unlike Satori's, a click also opens it, because a touch screen has neither: a tap toggles the
 * panel, and a click keeps open a panel the pointer opened. Escape, wherever focus is, or focus
 * moving out of the component, closes it at once; the pointer leaving closes a panel the pointer
 * opened, after a delay long enough to reach the panel.
 *
 * Focus stays on the button, as it does on Satori's, and the panel opens inside a live region so a
 * screen reader announces it. It is not a dialog: a dialog takes focus when it opens.
 *
 * The panel opens under the button from its inline-start edge, is never wider than the viewport,
 * and moves sideways when it would cross either side of it, in either direction.
 */
export class NxsRichTooltipComponent {
    /** The panel's title, already translated. */
    heading = input.required(...(ngDevMode ? [{ debugName: "heading" }] : []));
    /** The explanation under the title, already translated. Plain text. */
    content = input.required(...(ngDevMode ? [{ debugName: "content" }] : []));
    /** The trigger button's accessible name, already translated. The button shows only an icon. */
    triggerLabel = input.required(...(ngDevMode ? [{ debugName: "triggerLabel" }] : []));
    /** The trigger's Material Icons ligature. */
    icon = input('info', ...(ngDevMode ? [{ debugName: "icon" }] : []));
    open = signal(false, ...(ngDevMode ? [{ debugName: "open" }] : []));
    panelId = `nxs-rich-tooltip-${nextId++}`;
    /** How far, in px, the open panel is moved sideways to stay inside the viewport. */
    shift = signal(0, ...(ngDevMode ? [{ debugName: "shift" }] : []));
    host = inject(ElementRef);
    trigger = viewChild.required('trigger', {
        read: (ElementRef),
    });
    panel = viewChild('panel', ...(ngDevMode ? [{ debugName: "panel", read: (ElementRef) }] : [{ read: (ElementRef) }]));
    /** What opened the panel while it is open; `null` while it is closed. */
    opener = null;
    /** What will open the panel once `SHOW_DELAY` has passed. */
    pending = null;
    showTimer;
    hideTimer;
    /** A pointer is pressing the button, so the focus it gives is the click's to handle. */
    pressing = false;
    constructor() {
        afterRenderEffect((onCleanup) => {
            if (!this.open())
                return;
            this.place();
            const view = this.host.nativeElement.ownerDocument.defaultView;
            const replace = () => this.place();
            view?.addEventListener('resize', replace);
            onCleanup(() => view?.removeEventListener('resize', replace));
        });
        inject(DestroyRef).onDestroy(() => {
            clearTimeout(this.showTimer);
            clearTimeout(this.hideTimer);
        });
    }
    /** A pointer rests on the button or the panel. A touch has no hover; its tap is a click. */
    onPointerEnter(event) {
        if (event.pointerType === 'touch')
            return;
        clearTimeout(this.hideTimer);
        if (!this.open())
            this.openSoon('hover');
    }
    onPointerLeave(event) {
        if (event.pointerType === 'touch')
            return;
        if (this.pending === 'hover')
            this.cancelOpening();
        if (this.opener !== 'hover')
            return;
        clearTimeout(this.hideTimer);
        this.hideTimer = setTimeout(() => this.close(), HIDE_DELAY);
    }
    onPointerDown() {
        this.pressing = true;
    }
    /**
     * Any press ends here, anywhere in the document: one that becomes a scroll (`pointercancel`) or is
     * released off the button never clicks, and would otherwise leave the next keyboard focus ignored.
     * A mouse focuses the button when it goes down, so its focus has passed by now; a tap's comes
     * after this, with its click a moment later, which cancels the opening the focus starts.
     */
    onPressEnd() {
        this.pressing = false;
    }
    /** Keyboard focus opens the panel. The focus a press gives is left to its click. */
    onFocus() {
        if (this.pressing)
            return;
        if (!this.open()) {
            this.openSoon('focus');
        }
        else if (this.opener === 'hover') {
            clearTimeout(this.hideTimer);
            this.opener = 'focus';
        }
    }
    /**
     * A click, a tap, Enter or Space. A click on a panel the pointer opened keeps it open once the
     * pointer leaves; otherwise activating the button opens or closes the panel.
     */
    onClick() {
        this.pressing = false;
        this.cancelOpening();
        if (this.open() && this.opener !== 'hover')
            this.close();
        else
            this.show('click');
    }
    /**
     * Escape closes the panel, or stops it opening, wherever focus is: a panel the pointer opened
     * must close while focus is on another control (WCAG 1.4.13). Focus inside the component goes
     * back to the button; focus anywhere else stays where it is.
     */
    onEscape() {
        this.cancelOpening();
        if (!this.open())
            return;
        const host = this.host.nativeElement;
        const focusInside = host.contains(host.ownerDocument.activeElement);
        this.close();
        if (focusInside)
            this.trigger().nativeElement.focus();
    }
    onFocusOut(event) {
        const next = event.relatedTarget;
        if (next instanceof Node && this.host.nativeElement.contains(next))
            return;
        this.pressing = false;
        this.cancelOpening();
        this.close();
    }
    /** Opens after `SHOW_DELAY`, unless it opens or is cancelled first. Focus outranks hover. */
    openSoon(opener) {
        if (this.pending) {
            if (opener === 'focus')
                this.pending = opener;
            return;
        }
        this.pending = opener;
        this.showTimer = setTimeout(() => {
            const pending = this.pending;
            this.pending = null;
            if (pending)
                this.show(pending);
        }, SHOW_DELAY);
    }
    cancelOpening() {
        clearTimeout(this.showTimer);
        this.pending = null;
    }
    show(opener) {
        clearTimeout(this.hideTimer);
        this.opener = opener;
        this.open.set(true);
    }
    close() {
        clearTimeout(this.hideTimer);
        this.opener = null;
        this.open.set(false);
    }
    /** Measured from the host, so the shift already applied does not feed into the next one. */
    place() {
        const panel = this.panel()?.nativeElement;
        if (!panel)
            return;
        const host = this.host.nativeElement;
        const anchor = host.getBoundingClientRect();
        const width = panel.offsetWidth;
        const viewport = host.ownerDocument.documentElement.clientWidth;
        const rtl = getComputedStyle(host).direction === 'rtl';
        const left = rtl ? anchor.right - width : anchor.left;
        const furthest = Math.max(VIEWPORT_MARGIN, viewport - VIEWPORT_MARGIN - width);
        const placed = Math.min(Math.max(left, VIEWPORT_MARGIN), furthest);
        this.shift.set(Math.round(placed - left));
    }
    static ɵfac = function NxsRichTooltipComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsRichTooltipComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsRichTooltipComponent, selectors: [["nxs-rich-tooltip"]], viewQuery: function NxsRichTooltipComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.trigger, _c0, 5, ElementRef);
            i0.ɵɵviewQuerySignal(ctx.panel, _c1, 5, ElementRef);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance(2);
        } }, hostAttrs: [1, "nxs-rich-tooltip"], hostBindings: function NxsRichTooltipComponent_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("keydown.escape", function NxsRichTooltipComponent_keydown_escape_HostBindingHandler() { return ctx.onEscape(); }, i0.ɵɵresolveDocument)("pointerup", function NxsRichTooltipComponent_pointerup_HostBindingHandler() { return ctx.onPressEnd(); }, i0.ɵɵresolveDocument)("pointercancel", function NxsRichTooltipComponent_pointercancel_HostBindingHandler() { return ctx.onPressEnd(); }, i0.ɵɵresolveDocument)("focusout", function NxsRichTooltipComponent_focusout_HostBindingHandler($event) { return ctx.onFocusOut($event); })("pointerenter", function NxsRichTooltipComponent_pointerenter_HostBindingHandler($event) { return ctx.onPointerEnter($event); })("pointerleave", function NxsRichTooltipComponent_pointerleave_HostBindingHandler($event) { return ctx.onPointerLeave($event); });
        } }, inputs: { heading: [1, "heading"], content: [1, "content"], triggerLabel: [1, "triggerLabel"], icon: [1, "icon"] }, decls: 6, vars: 5, consts: [["trigger", ""], ["panel", ""], ["mat-icon-button", "", "type", "button", 1, "nxs-rich-tooltip__trigger", 3, "pointerdown", "focus", "click"], ["aria-hidden", "true"], ["role", "status", 1, "nxs-rich-tooltip__live"], [1, "nxs-rich-tooltip__panel", 3, "id", "translate"], [1, "nxs-rich-tooltip__panel", 3, "id"], [1, "nxs-rich-tooltip__heading"], [1, "nxs-rich-tooltip__content"]], template: function NxsRichTooltipComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "button", 2, 0);
            i0.ɵɵlistener("pointerdown", function NxsRichTooltipComponent_Template_button_pointerdown_0_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onPointerDown()); })("focus", function NxsRichTooltipComponent_Template_button_focus_0_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onFocus()); })("click", function NxsRichTooltipComponent_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onClick()); });
            i0.ɵɵelementStart(2, "mat-icon", 3);
            i0.ɵɵtext(3);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(4, "div", 4);
            i0.ɵɵconditionalCreate(5, NxsRichTooltipComponent_Conditional_5_Template, 6, 5, "div", 5);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵattribute("aria-label", ctx.triggerLabel())("aria-expanded", ctx.open())("aria-controls", ctx.panelId);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.icon());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.open() ? 5 : -1);
        } }, dependencies: [MatButtonModule, i1.MatIconButton, MatIconModule, i2.MatIcon], styles: ["[_nghost-%COMP%] {\n  position: relative;\n  display: inline-block;\n}\n\n.nxs-rich-tooltip__panel[_ngcontent-%COMP%] {\n  position: absolute;\n  inset-block-start: 100%;\n  inset-inline-start: 0;\n  z-index: 10;\n  box-sizing: border-box;\n  inline-size: max-content;\n  // Twice the component's VIEWPORT_MARGIN, so the panel fits between both margins.\n  max-inline-size: min(320px, 100vw - 16px);\n  padding: 12px 16px;\n  overflow-wrap: anywhere;\n  border-radius: 8px;\n  background: var(--mat-sys-surface-container);\n  color: var(--mat-sys-on-surface-variant);\n  box-shadow: var(--mat-sys-level2);\n}\n\n.nxs-rich-tooltip__heading[_ngcontent-%COMP%] {\n  margin: 0 0 4px;\n  font: var(--mat-sys-title-small);\n  color: var(--mat-sys-on-surface);\n}\n\n.nxs-rich-tooltip__content[_ngcontent-%COMP%] {\n  margin: 0;\n  font: var(--mat-sys-body-medium);\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsRichTooltipComponent, [{
        type: Component,
        args: [{ selector: 'nxs-rich-tooltip', standalone: true, imports: [MatButtonModule, MatIconModule], changeDetection: ChangeDetectionStrategy.OnPush, host: {
                    class: 'nxs-rich-tooltip',
                    '(document:keydown.escape)': 'onEscape()',
                    '(document:pointerup)': 'onPressEnd()',
                    '(document:pointercancel)': 'onPressEnd()',
                    '(focusout)': 'onFocusOut($event)',
                    '(pointerenter)': 'onPointerEnter($event)',
                    '(pointerleave)': 'onPointerLeave($event)',
                }, template: "<button\n  #trigger\n  mat-icon-button\n  type=\"button\"\n  class=\"nxs-rich-tooltip__trigger\"\n  [attr.aria-label]=\"triggerLabel()\"\n  [attr.aria-expanded]=\"open()\"\n  [attr.aria-controls]=\"panelId\"\n  (pointerdown)=\"onPointerDown()\"\n  (focus)=\"onFocus()\"\n  (click)=\"onClick()\"\n>\n  <mat-icon aria-hidden=\"true\">{{ icon() }}</mat-icon>\n</button>\n<div class=\"nxs-rich-tooltip__live\" role=\"status\">\n  @if (open()) {\n    <div\n      #panel\n      class=\"nxs-rich-tooltip__panel\"\n      [id]=\"panelId\"\n      [style.translate.px]=\"shift() || null\"\n    >\n      <p class=\"nxs-rich-tooltip__heading\">{{ heading() }}</p>\n      <p class=\"nxs-rich-tooltip__content\">{{ content() }}</p>\n    </div>\n  }\n</div>\n", styles: [":host {\n  position: relative;\n  display: inline-block;\n}\n\n.nxs-rich-tooltip__panel {\n  position: absolute;\n  inset-block-start: 100%;\n  inset-inline-start: 0;\n  z-index: 10;\n  box-sizing: border-box;\n  inline-size: max-content;\n  // Twice the component's VIEWPORT_MARGIN, so the panel fits between both margins.\n  max-inline-size: min(320px, 100vw - 16px);\n  padding: 12px 16px;\n  overflow-wrap: anywhere;\n  border-radius: 8px;\n  background: var(--mat-sys-surface-container);\n  color: var(--mat-sys-on-surface-variant);\n  box-shadow: var(--mat-sys-level2);\n}\n\n.nxs-rich-tooltip__heading {\n  margin: 0 0 4px;\n  font: var(--mat-sys-title-small);\n  color: var(--mat-sys-on-surface);\n}\n\n.nxs-rich-tooltip__content {\n  margin: 0;\n  font: var(--mat-sys-body-medium);\n}\n"] }]
    }], () => [], { heading: [{ type: i0.Input, args: [{ isSignal: true, alias: "heading", required: true }] }], content: [{ type: i0.Input, args: [{ isSignal: true, alias: "content", required: true }] }], triggerLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "triggerLabel", required: true }] }], icon: [{ type: i0.Input, args: [{ isSignal: true, alias: "icon", required: false }] }], trigger: [{ type: i0.ViewChild, args: ['trigger', { ...{
                        read: (ElementRef),
                    }, isSignal: true }] }], panel: [{ type: i0.ViewChild, args: ['panel', { ...{ read: (ElementRef) }, isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsRichTooltipComponent, { className: "NxsRichTooltipComponent", filePath: "libs/shared/satori-components/src/lib/rich-tooltip/rich-tooltip.component.ts", lineNumber: 64 }); })();
