import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, numberAttribute, output, } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { nxsVisibleText } from '../visible-text';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
import * as i3 from "@angular/material/tooltip";
const _c0 = (a0, a1, a2) => ({ first: a0, last: a1, total: a2 });
const _c1 = (a0, a1) => ({ first: a0, last: a1 });
function NxsPagerComponent_Conditional_0_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.pager.past-end"), " ");
} }
function NxsPagerComponent_Conditional_0_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(1, 1, "satori-components.pager.range-of", i0.ɵɵpureFunction3(4, _c0, ctx_r1.first(), ctx_r1.last(), ctx_r1.knownTotal())), " ");
} }
function NxsPagerComponent_Conditional_0_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(1, 1, "satori-components.pager.range", i0.ɵɵpureFunction2(4, _c1, ctx_r1.first(), ctx_r1.last())), " ");
} }
function NxsPagerComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵdeclareLet(0);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵdeclareLet(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵdeclareLet(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementStart(6, "nav", 0)(7, "span", 1);
    i0.ɵɵconditionalCreate(8, NxsPagerComponent_Conditional_0_Conditional_8_Template, 2, 3)(9, NxsPagerComponent_Conditional_0_Conditional_9_Template, 2, 8)(10, NxsPagerComponent_Conditional_0_Conditional_10_Template, 2, 7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "button", 2);
    i0.ɵɵlistener("click", function NxsPagerComponent_Conditional_0_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.previous()); });
    i0.ɵɵelementStart(12, "mat-icon", 3);
    i0.ɵɵtext(13, "chevron_left");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "button", 4);
    i0.ɵɵlistener("click", function NxsPagerComponent_Conditional_0_Template_button_click_14_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.next()); });
    i0.ɵɵelementStart(15, "mat-icon", 3);
    i0.ɵɵtext(16, "chevron_right");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    const name_r3 = ctx_r1.ownLabel() || i0.ɵɵpipeBind1(1, 8, "satori-components.pager.label");
    const previousLabel_r4 = i0.ɵɵpipeBind1(3, 10, "satori-components.pager.previous");
    const nextLabel_r5 = i0.ɵɵpipeBind1(5, 12, "satori-components.pager.next");
    i0.ɵɵadvance(6);
    i0.ɵɵattribute("aria-label", name_r3);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.itemCount() === 0 ? 8 : ctx_r1.knownTotal() !== null ? 9 : 10);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", !ctx_r1.canPrevious())("matTooltip", previousLabel_r4);
    i0.ɵɵattribute("aria-label", previousLabel_r4);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", !ctx_r1.canNext())("matTooltip", nextLabel_r5);
    i0.ɵɵattribute("aria-label", nextLabel_r5);
} }
/**
 * Previous and Next for a list the server pages, with the range on screen.
 *
 * Next/previous rather than numbered, because Nuxeo knows a listing's total only when it fits on
 * one page: `@children` reports a negative count otherwise, and `isNextPageAvailable` is the only
 * reliable fact. So Next follows `hasNextPage`, Previous follows the page index, and "of N" shows
 * only when `totalSize` is a real, non-negative total.
 *
 * It renders nothing while everything fits on one page — a first page with no next page.
 */
export class NxsPagerComponent {
    /** The page on screen, from zero. */
    pageIndex = input(0, ...(ngDevMode ? [{ debugName: "pageIndex", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** How many items a full page holds. */
    pageSize = input(50, ...(ngDevMode ? [{ debugName: "pageSize", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** How many items the page on screen holds. */
    itemCount = input(0, ...(ngDevMode ? [{ debugName: "itemCount", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** Every item across every page; negative when the server did not count them. */
    totalSize = input(-1, ...(ngDevMode ? [{ debugName: "totalSize", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** Whether the server has another page. */
    hasNextPage = input(false, ...(ngDevMode ? [{ debugName: "hasNextPage", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Disables both buttons while a page loads. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /**
     * The navigation landmark's accessible name, already translated. Blank, or only whitespace or
     * zero-width characters, names it "Pages".
     */
    label = input('', ...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The page index to load: one less or one more than `pageIndex`. */
    pageChange = output();
    visible = computed(() => this.pageIndex() > 0 || this.hasNextPage(), ...(ngDevMode ? [{ debugName: "visible" }] : []));
    first = computed(() => this.itemCount() > 0 ? this.pageIndex() * this.pageSize() + 1 : 0, ...(ngDevMode ? [{ debugName: "first" }] : []));
    last = computed(() => this.pageIndex() * this.pageSize() + this.itemCount(), ...(ngDevMode ? [{ debugName: "last" }] : []));
    knownTotal = computed(() => {
        const total = this.totalSize();
        return Number.isFinite(total) && total >= 0 ? total : null;
    }, ...(ngDevMode ? [{ debugName: "knownTotal" }] : []));
    canPrevious = computed(() => !this.disabled() && this.pageIndex() > 0, ...(ngDevMode ? [{ debugName: "canPrevious" }] : []));
    canNext = computed(() => !this.disabled() && this.hasNextPage(), ...(ngDevMode ? [{ debugName: "canNext" }] : []));
    ownLabel = computed(() => nxsVisibleText(this.label()), ...(ngDevMode ? [{ debugName: "ownLabel" }] : []));
    previous() {
        if (this.canPrevious())
            this.pageChange.emit(this.pageIndex() - 1);
    }
    next() {
        if (this.canNext())
            this.pageChange.emit(this.pageIndex() + 1);
    }
    static ɵfac = function NxsPagerComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsPagerComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsPagerComponent, selectors: [["nxs-pager"]], hostAttrs: [1, "nxs-pager"], inputs: { pageIndex: [1, "pageIndex"], pageSize: [1, "pageSize"], itemCount: [1, "itemCount"], totalSize: [1, "totalSize"], hasNextPage: [1, "hasNextPage"], disabled: [1, "disabled"], label: [1, "label"] }, outputs: { pageChange: "pageChange" }, decls: 1, vars: 1, consts: [[1, "nxs-pager__nav"], ["aria-live", "polite", "aria-atomic", "true", 1, "nxs-pager__range"], ["mat-icon-button", "", "type", "button", 1, "nxs-pager__previous", 3, "click", "disabled", "matTooltip"], ["aria-hidden", "true", 1, "nxs-pager__chevron"], ["mat-icon-button", "", "type", "button", 1, "nxs-pager__next", 3, "click", "disabled", "matTooltip"]], template: function NxsPagerComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, NxsPagerComponent_Conditional_0_Template, 17, 14, "nav", 0);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.visible() ? 0 : -1);
        } }, dependencies: [MatButtonModule, i1.MatIconButton, MatIconModule, i2.MatIcon, MatTooltipModule, i3.MatTooltip, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  font: var(--mat-sys-body-medium);\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-pager__nav[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 4px;\n  padding: 4px 8px;\n}\n\n.nxs-pager__range[_ngcontent-%COMP%] {\n  margin-inline-end: 8px;\n}\n\n//[_ngcontent-%COMP%]   The[_ngcontent-%COMP%]   chevrons[_ngcontent-%COMP%]   point[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   way[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   page[_ngcontent-%COMP%]   turns[_ngcontent-%COMP%], which   reverses   with   the   reading   direction.\n[dir='rtl'][_nghost-%COMP%]   .nxs-pager__chevron[_ngcontent-%COMP%], [dir='rtl']   [_nghost-%COMP%]   .nxs-pager__chevron[_ngcontent-%COMP%] {\n  transform: scaleX(-1);\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsPagerComponent, [{
        type: Component,
        args: [{ selector: 'nxs-pager', standalone: true, imports: [MatButtonModule, MatIconModule, MatTooltipModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-pager' }, template: "@if (visible()) {\n  @let name = ownLabel() || ('satori-components.pager.label' | translate);\n  @let previousLabel = 'satori-components.pager.previous' | translate;\n  @let nextLabel = 'satori-components.pager.next' | translate;\n  <nav class=\"nxs-pager__nav\" [attr.aria-label]=\"name\">\n    <span class=\"nxs-pager__range\" aria-live=\"polite\" aria-atomic=\"true\">\n      @if (itemCount() === 0) {\n        {{ 'satori-components.pager.past-end' | translate }}\n      } @else if (knownTotal() !== null) {\n        {{\n          'satori-components.pager.range-of'\n            | translate: { first: first(), last: last(), total: knownTotal() }\n        }}\n      } @else {\n        {{ 'satori-components.pager.range' | translate: { first: first(), last: last() } }}\n      }\n    </span>\n    <button\n      mat-icon-button\n      type=\"button\"\n      class=\"nxs-pager__previous\"\n      [disabled]=\"!canPrevious()\"\n      [matTooltip]=\"previousLabel\"\n      [attr.aria-label]=\"previousLabel\"\n      (click)=\"previous()\"\n    >\n      <mat-icon class=\"nxs-pager__chevron\" aria-hidden=\"true\">chevron_left</mat-icon>\n    </button>\n    <button\n      mat-icon-button\n      type=\"button\"\n      class=\"nxs-pager__next\"\n      [disabled]=\"!canNext()\"\n      [matTooltip]=\"nextLabel\"\n      [attr.aria-label]=\"nextLabel\"\n      (click)=\"next()\"\n    >\n      <mat-icon class=\"nxs-pager__chevron\" aria-hidden=\"true\">chevron_right</mat-icon>\n    </button>\n  </nav>\n}\n", styles: [":host {\n  display: block;\n  font: var(--mat-sys-body-medium);\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-pager__nav {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 4px;\n  padding: 4px 8px;\n}\n\n.nxs-pager__range {\n  margin-inline-end: 8px;\n}\n\n// The chevrons point the way the page turns, which reverses with the reading direction.\n:host-context([dir='rtl']) .nxs-pager__chevron {\n  transform: scaleX(-1);\n}\n"] }]
    }], null, { pageIndex: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageIndex", required: false }] }], pageSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageSize", required: false }] }], itemCount: [{ type: i0.Input, args: [{ isSignal: true, alias: "itemCount", required: false }] }], totalSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "totalSize", required: false }] }], hasNextPage: [{ type: i0.Input, args: [{ isSignal: true, alias: "hasNextPage", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], pageChange: [{ type: i0.Output, args: ["pageChange"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsPagerComponent, { className: "NxsPagerComponent", filePath: "libs/shared/satori-components/src/lib/pager/pager.component.ts", lineNumber: 36 }); })();
