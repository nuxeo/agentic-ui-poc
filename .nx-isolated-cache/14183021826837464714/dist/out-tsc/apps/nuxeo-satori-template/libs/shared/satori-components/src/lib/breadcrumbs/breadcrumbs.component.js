import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, afterRenderEffect, computed, inject, input, signal, } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { nxsVisibleText } from '../visible-text';
import { breadcrumbsToFold } from './breadcrumb-fit';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
import * as i3 from "@angular/material/menu";
import * as i4 from "@angular/material/tooltip";
const _forTrack0 = ($index, $item) => $item.kind === "item" ? $item.index : -1;
function NxsBreadcrumbsComponent_For_3_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵelementStart(2, "li", 5)(3, "button", 9)(4, "mat-icon", 10);
    i0.ɵɵtext(5, "more_horiz");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "mat-icon", 11);
    i0.ɵɵtext(7, "chevron_right");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const hiddenMenu_r1 = i0.ɵɵreference(5);
    const more_r2 = i0.ɵɵpipeBind1(1, 3, "satori-components.breadcrumbs.show-more");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("matMenuTriggerFor", hiddenMenu_r1)("matTooltip", more_r2);
    i0.ɵɵattribute("aria-label", more_r2);
} }
function NxsBreadcrumbsComponent_For_3_Conditional_1_Case_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 12);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    const entry_r4 = ctx_r2.$implicit;
    const ɵ$index_5_r5 = ctx_r2.$index;
    const ɵ$count_5_r6 = ctx_r2.$count;
    i0.ɵɵproperty("routerLink", entry_r4.item.routerLink)("queryParams", entry_r4.item.queryParams);
    i0.ɵɵattribute("title", ɵ$index_5_r5 === ɵ$count_5_r6 - 1 || entry_r4.index === 0 ? entry_r4.item.label : null);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(entry_r4.item.label);
} }
function NxsBreadcrumbsComponent_For_3_Conditional_1_Case_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 13);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    const entry_r4 = ctx_r2.$implicit;
    const ɵ$index_5_r5 = ctx_r2.$index;
    const ɵ$count_5_r6 = ctx_r2.$count;
    i0.ɵɵproperty("href", entry_r4.item.href, i0.ɵɵsanitizeUrl);
    i0.ɵɵattribute("title", ɵ$index_5_r5 === ɵ$count_5_r6 - 1 || entry_r4.index === 0 ? entry_r4.item.label : null);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(entry_r4.item.label);
} }
function NxsBreadcrumbsComponent_For_3_Conditional_1_Case_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 14);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    const entry_r4 = ctx_r2.$implicit;
    const ɵ$index_5_r5 = ctx_r2.$index;
    const ɵ$count_5_r6 = ctx_r2.$count;
    i0.ɵɵattribute("aria-current", ɵ$index_5_r5 === ɵ$count_5_r6 - 1 ? "page" : null)("title", ɵ$index_5_r5 === ɵ$count_5_r6 - 1 || entry_r4.index === 0 ? entry_r4.item.label : null);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(entry_r4.item.label);
} }
function NxsBreadcrumbsComponent_For_3_Conditional_1_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 11);
    i0.ɵɵtext(1, "chevron_right");
    i0.ɵɵelementEnd();
} }
function NxsBreadcrumbsComponent_For_3_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 4);
    i0.ɵɵconditionalCreate(1, NxsBreadcrumbsComponent_For_3_Conditional_1_Case_1_Template, 2, 4, "a", 12)(2, NxsBreadcrumbsComponent_For_3_Conditional_1_Case_2_Template, 2, 3, "a", 13)(3, NxsBreadcrumbsComponent_For_3_Conditional_1_Case_3_Template, 2, 3, "span", 14);
    i0.ɵɵconditionalCreate(4, NxsBreadcrumbsComponent_For_3_Conditional_1_Conditional_4_Template, 2, 0, "mat-icon", 11);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_15_0;
    const ctx_r2 = i0.ɵɵnextContext();
    const entry_r4 = ctx_r2.$implicit;
    const ɵ$index_5_r5 = ctx_r2.$index;
    const ɵ$count_5_r6 = ctx_r2.$count;
    const ctx_r6 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("nxs-breadcrumbs__item--first", entry_r4.index === 0 && !(ɵ$index_5_r5 === ɵ$count_5_r6 - 1))("nxs-breadcrumbs__item--last", ɵ$index_5_r5 === ɵ$count_5_r6 - 1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_15_0 = ctx_r6.linkKind(entry_r4.item)) === "router" ? 1 : tmp_15_0 === "href" ? 2 : 3);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(!(ɵ$index_5_r5 === ɵ$count_5_r6 - 1) ? 4 : -1);
} }
function NxsBreadcrumbsComponent_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsBreadcrumbsComponent_For_3_Conditional_0_Template, 8, 5, "li", 5)(1, NxsBreadcrumbsComponent_For_3_Conditional_1_Template, 5, 6, "li", 8);
} if (rf & 2) {
    const entry_r4 = ctx.$implicit;
    i0.ɵɵconditional(entry_r4.kind === "overflow" ? 0 : 1);
} }
function NxsBreadcrumbsComponent_For_7_Case_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 15);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r8 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("routerLink", item_r8.routerLink)("queryParams", item_r8.queryParams);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r8.label);
} }
function NxsBreadcrumbsComponent_For_7_Case_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r8 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("href", item_r8.href, i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r8.label);
} }
function NxsBreadcrumbsComponent_For_7_Case_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 17);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r8 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r8.label);
} }
function NxsBreadcrumbsComponent_For_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsBreadcrumbsComponent_For_7_Case_0_Template, 2, 3, "a", 15)(1, NxsBreadcrumbsComponent_For_7_Case_1_Template, 2, 2, "a", 16)(2, NxsBreadcrumbsComponent_For_7_Case_2_Template, 2, 1, "button", 17);
} if (rf & 2) {
    let tmp_11_0;
    const item_r8 = ctx.$implicit;
    const ctx_r6 = i0.ɵɵnextContext();
    i0.ɵɵconditional((tmp_11_0 = ctx_r6.linkKind(item_r8)) === "router" ? 0 : tmp_11_0 === "href" ? 1 : 2);
} }
function NxsBreadcrumbsComponent_For_10_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 7);
    i0.ɵɵtext(1, "chevron_right");
    i0.ɵɵelementEnd();
} }
function NxsBreadcrumbsComponent_For_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 4)(1, "span", 14);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, NxsBreadcrumbsComponent_For_10_Conditional_3_Template, 2, 0, "mat-icon", 7);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r9 = ctx.$implicit;
    const ɵ$index_55_r10 = ctx.$index;
    const ɵ$count_55_r11 = ctx.$count;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r9.label);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!(ɵ$index_55_r10 === ɵ$count_55_r11 - 1) ? 3 : -1);
} }
/**
 * A breadcrumb trail — the Material implementation of `nxs.primitives.breadcrumbs`.
 *
 * It stays on one line. When the trail is wider than its box, the items after the first fold into
 * a "…" menu, furthest from the current page first, as Satori's do. The first stays while it fits
 * beside the "…" and the current page; in a box too narrow for that it folds too. The current page
 * always stays, its label cut short rather than hidden. A router item needs the host to provide
 * the router, as `routerLink` always does.
 */
export class NxsBreadcrumbsComponent {
    /**
     * The trail, outermost first. An item with `routerLink` navigates in the app, one with `href` is a
     * plain link, and one with neither is text — the current page, when it is the last.
     */
    items = input.required(...(ngDevMode ? [{ debugName: "items" }] : []));
    /**
     * The navigation landmark's accessible name, already translated, such as "Breadcrumbs". Blank, or
     * only whitespace or zero-width characters, leaves the landmark unnamed rather than named " ".
     */
    label = input('', ...(ngDevMode ? [{ debugName: "label" }] : []));
    name = computed(() => nxsVisibleText(this.label()), ...(ngDevMode ? [{ debugName: "name" }] : []));
    host = inject(ElementRef);
    destroyRef = inject(DestroyRef);
    /** The items folded into the "…" menu, as last measured. */
    fold = signal({ start: 1, count: 0 }, ...(ngDevMode ? [{ debugName: "fold", equal: (a, b) => a.start === b.start && a.count === b.count }] : [{ equal: (a, b) => a.start === b.start && a.count === b.count }]));
    hiddenItems = computed(() => {
        const items = this.items();
        const { start, count } = this.foldFor(items.length);
        return items.slice(start, start + count);
    }, ...(ngDevMode ? [{ debugName: "hiddenItems" }] : []));
    entries = computed(() => {
        const items = this.items();
        const { start, count } = this.foldFor(items.length);
        const entries = items.map((item, index) => ({ kind: 'item', item, index }));
        if (count === 0)
            return entries;
        return [...entries.slice(0, start), { kind: 'overflow' }, ...entries.slice(start + count)];
    }, ...(ngDevMode ? [{ debugName: "entries" }] : []));
    constructor() {
        // Measured from a hidden copy of the whole trail, so a width that grows back unfolds items
        // without first having to show them to find out whether they fit.
        afterRenderEffect({
            earlyRead: () => {
                this.items();
                return this.measure();
            },
            write: (fold) => this.fold.set(fold()),
        });
        // The box changing width, and the trail's own width changing once a web font arrives.
        afterNextRender(() => {
            const remeasure = () => this.fold.set(this.measure());
            const fonts = this.host.nativeElement.ownerDocument.fonts;
            fonts?.addEventListener('loadingdone', remeasure);
            this.destroyRef.onDestroy(() => fonts?.removeEventListener('loadingdone', remeasure));
            if (typeof ResizeObserver === 'undefined')
                return;
            const observer = new ResizeObserver(remeasure);
            observer.observe(this.host.nativeElement);
            this.destroyRef.onDestroy(() => observer.disconnect());
        });
    }
    linkKind(item) {
        if (item.routerLink !== undefined)
            return 'router';
        if (item.href !== undefined)
            return 'href';
        return 'text';
    }
    /** The last measurement, kept within a trail that may have shortened since. */
    foldFor(length) {
        const { start, count } = this.fold();
        if (length <= 2)
            return { start: 1, count: 0 };
        return { start, count: Math.min(count, length - 1 - start) };
    }
    measure() {
        const host = this.host.nativeElement;
        const measured = host.querySelector('.nxs-breadcrumbs__measure');
        if (!measured)
            return { start: 1, count: 0 };
        // The gap between items is part of what each one costs, except after the last.
        const gap = parseFloat(getComputedStyle(measured).columnGap) || 0;
        const width = (element) => element?.getBoundingClientRect().width ?? 0;
        const elements = [
            ...measured.querySelectorAll(':scope > .nxs-breadcrumbs__item:not(.nxs-breadcrumbs__overflow-item)'),
        ];
        const items = elements.map((item, index) => width(item) + (index < elements.length - 1 ? gap : 0));
        const overflow = width(measured.querySelector(':scope > .nxs-breadcrumbs__overflow-item')) + gap;
        // The stylesheet cuts the last label no shorter than 4em.
        const last = elements.at(-1);
        const lastMinimum = last ? 4 * parseFloat(getComputedStyle(last).fontSize) : Number.NaN;
        return breadcrumbsToFold(items, overflow, host.clientWidth, lastMinimum);
    }
    static ɵfac = function NxsBreadcrumbsComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsBreadcrumbsComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsBreadcrumbsComponent, selectors: [["nxs-breadcrumbs"]], hostAttrs: [1, "nxs-breadcrumbs"], inputs: { items: [1, "items"], label: [1, "label"] }, decls: 15, vars: 1, consts: [["hiddenMenu", "matMenu"], [1, "nxs-breadcrumbs__nav"], [1, "nxs-breadcrumbs__list"], ["aria-hidden", "true", 1, "nxs-breadcrumbs__list", "nxs-breadcrumbs__measure"], [1, "nxs-breadcrumbs__item"], [1, "nxs-breadcrumbs__item", "nxs-breadcrumbs__overflow-item"], [1, "nxs-breadcrumbs__overflow-measure"], [1, "nxs-breadcrumbs__separator"], [1, "nxs-breadcrumbs__item", 3, "nxs-breadcrumbs__item--first", "nxs-breadcrumbs__item--last"], ["mat-icon-button", "", "type", "button", 1, "nxs-breadcrumbs__overflow", 3, "matMenuTriggerFor", "matTooltip"], ["aria-hidden", "true"], ["aria-hidden", "true", 1, "nxs-breadcrumbs__separator"], [1, "nxs-breadcrumbs__link", 3, "routerLink", "queryParams"], [1, "nxs-breadcrumbs__link", 3, "href"], [1, "nxs-breadcrumbs__text"], ["mat-menu-item", "", 3, "routerLink", "queryParams"], ["mat-menu-item", "", 3, "href"], ["mat-menu-item", "", "type", "button", "disabled", ""]], template: function NxsBreadcrumbsComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "nav", 1)(1, "ol", 2);
            i0.ɵɵrepeaterCreate(2, NxsBreadcrumbsComponent_For_3_Template, 2, 1, null, null, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "mat-menu", null, 0);
            i0.ɵɵrepeaterCreate(6, NxsBreadcrumbsComponent_For_7_Template, 3, 1, null, null, i0.ɵɵrepeaterTrackByIndex);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(8, "ol", 3);
            i0.ɵɵrepeaterCreate(9, NxsBreadcrumbsComponent_For_10_Template, 4, 2, "li", 4, i0.ɵɵrepeaterTrackByIndex);
            i0.ɵɵelementStart(11, "li", 5);
            i0.ɵɵelement(12, "span", 6);
            i0.ɵɵelementStart(13, "mat-icon", 7);
            i0.ɵɵtext(14, "chevron_right");
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵattribute("aria-label", ctx.name() || null);
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.entries());
            i0.ɵɵadvance(4);
            i0.ɵɵrepeater(ctx.hiddenItems());
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.items());
        } }, dependencies: [MatButtonModule, i1.MatIconButton, MatIconModule, i2.MatIcon, MatMenuModule, i3.MatMenu, i3.MatMenuItem, i3.MatMenuTrigger, MatTooltipModule, i4.MatTooltip, RouterLink,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  position: relative;\n  display: block;\n  min-width: 0;\n  overflow: hidden;\n  font: var(--mat-sys-body-medium);\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-breadcrumbs__list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: nowrap;\n  align-items: center;\n  gap: 4px;\n  min-width: 0;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.nxs-breadcrumbs__item[_ngcontent-%COMP%] {\n  display: inline-flex;\n  flex: 0 0 auto;\n  align-items: center;\n  gap: 4px;\n  min-width: 0;\n  white-space: nowrap;\n}\n\n//[_ngcontent-%COMP%]   When[_ngcontent-%COMP%]   nothing[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   left[_ngcontent-%COMP%]   to[_ngcontent-%COMP%]   fold[_ngcontent-%COMP%], the[_ngcontent-%COMP%]   first[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   last[_ngcontent-%COMP%]   labels[_ngcontent-%COMP%]   are[_ngcontent-%COMP%]   cut[_ngcontent-%COMP%]   short.[_ngcontent-%COMP%]   The[_ngcontent-%COMP%]   last[_ngcontent-%COMP%]   keeps[_ngcontent-%COMP%]   4em[_ngcontent-%COMP%], \n//[_ngcontent-%COMP%]   which[_ngcontent-%COMP%]   `measure()`[_ngcontent-%COMP%]   counts[_ngcontent-%COMP%]   on[_ngcontent-%COMP%], so[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   current[_ngcontent-%COMP%]   page[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   never[_ngcontent-%COMP%]   hidden.\n.nxs-breadcrumbs__item--first[_ngcontent-%COMP%], \n.nxs-breadcrumbs__item--last[_ngcontent-%COMP%] {\n  flex: 0 1 auto;\n  overflow: hidden;\n\n  .nxs-breadcrumbs__link,\n  .nxs-breadcrumbs__text {\n    min-width: 0;\n    overflow: hidden;\n    text-overflow: ellipsis;\n  }\n}\n\n.nxs-breadcrumbs__item--last[_ngcontent-%COMP%] {\n  min-width: min(100%, 4em);\n}\n\n.nxs-breadcrumbs__link[_ngcontent-%COMP%] {\n  color: var(--mat-sys-primary);\n  text-decoration: underline;\n}\n\n.nxs-breadcrumbs__text[aria-current='page'][_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface);\n}\n\n.nxs-breadcrumbs__separator[_ngcontent-%COMP%] {\n  flex: 0 0 auto;\n  width: 18px;\n  height: 18px;\n  font-size: 18px;\n  color: var(--mat-sys-outline);\n}\n\n[dir='rtl'][_nghost-%COMP%]   .nxs-breadcrumbs__separator[_ngcontent-%COMP%], [dir='rtl']   [_nghost-%COMP%]   .nxs-breadcrumbs__separator[_ngcontent-%COMP%] {\n  transform: scaleX(-1);\n}\n\n.nxs-breadcrumbs__overflow[_ngcontent-%COMP%] {\n  --mat-icon-button-state-layer-size: 28px;\n\n  width: 28px;\n  height: 28px;\n  padding: 2px;\n}\n\n.nxs-breadcrumbs__overflow-measure[_ngcontent-%COMP%] {\n  display: inline-block;\n  width: 28px;\n}\n\n//[_ngcontent-%COMP%]   In[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   flow[_ngcontent-%COMP%]   with[_ngcontent-%COMP%]   no[_ngcontent-%COMP%]   height[_ngcontent-%COMP%], so[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   box[_ngcontent-%COMP%]   sized[_ngcontent-%COMP%]   by[_ngcontent-%COMP%]   its[_ngcontent-%COMP%]   content[_ngcontent-%COMP%]   still[_ngcontent-%COMP%]   prefers[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   whole[_ngcontent-%COMP%]   unfolded[_ngcontent-%COMP%]   trail\n//[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   folding[_ngcontent-%COMP%]   never[_ngcontent-%COMP%]   takes[_ngcontent-%COMP%]   away[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   room[_ngcontent-%COMP%]   it[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   measured[_ngcontent-%COMP%]   against.[_ngcontent-%COMP%]   It[_ngcontent-%COMP%]   wraps[_ngcontent-%COMP%], so[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   narrowest[_ngcontent-%COMP%]   such[_ngcontent-%COMP%]   a\n//[_ngcontent-%COMP%]   box[_ngcontent-%COMP%]   can[_ngcontent-%COMP%]   be[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   its[_ngcontent-%COMP%]   widest[_ngcontent-%COMP%]   item[_ngcontent-%COMP%], not[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   whole[_ngcontent-%COMP%]   trail.\n.nxs-breadcrumbs__measure[_ngcontent-%COMP%] {\n  flex-wrap: wrap;\n  height: 0;\n  overflow: hidden;\n  visibility: hidden;\n  pointer-events: none;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsBreadcrumbsComponent, [{
        type: Component,
        args: [{ selector: 'nxs-breadcrumbs', standalone: true, imports: [
                    MatButtonModule,
                    MatIconModule,
                    MatMenuModule,
                    MatTooltipModule,
                    RouterLink,
                    TranslatePipe,
                ], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-breadcrumbs' }, template: "<nav class=\"nxs-breadcrumbs__nav\" [attr.aria-label]=\"name() || null\">\n  <ol class=\"nxs-breadcrumbs__list\">\n    @for (entry of entries(); track entry.kind === 'item' ? entry.index : -1; let last = $last) {\n      @if (entry.kind === 'overflow') {\n        @let more = 'satori-components.breadcrumbs.show-more' | translate;\n        <li class=\"nxs-breadcrumbs__item nxs-breadcrumbs__overflow-item\">\n          <button\n            mat-icon-button\n            type=\"button\"\n            class=\"nxs-breadcrumbs__overflow\"\n            [matMenuTriggerFor]=\"hiddenMenu\"\n            [matTooltip]=\"more\"\n            [attr.aria-label]=\"more\"\n          >\n            <mat-icon aria-hidden=\"true\">more_horiz</mat-icon>\n          </button>\n          <mat-icon class=\"nxs-breadcrumbs__separator\" aria-hidden=\"true\">chevron_right</mat-icon>\n        </li>\n      } @else {\n        <li\n          class=\"nxs-breadcrumbs__item\"\n          [class.nxs-breadcrumbs__item--first]=\"entry.index === 0 && !last\"\n          [class.nxs-breadcrumbs__item--last]=\"last\"\n        >\n          @switch (linkKind(entry.item)) {\n            @case ('router') {\n              <a\n                class=\"nxs-breadcrumbs__link\"\n                [routerLink]=\"entry.item.routerLink\"\n                [queryParams]=\"entry.item.queryParams\"\n                [attr.title]=\"last || entry.index === 0 ? entry.item.label : null\"\n                >{{ entry.item.label }}</a\n              >\n            }\n            @case ('href') {\n              <a\n                class=\"nxs-breadcrumbs__link\"\n                [href]=\"entry.item.href\"\n                [attr.title]=\"last || entry.index === 0 ? entry.item.label : null\"\n                >{{ entry.item.label }}</a\n              >\n            }\n            @default {\n              <span\n                class=\"nxs-breadcrumbs__text\"\n                [attr.aria-current]=\"last ? 'page' : null\"\n                [attr.title]=\"last || entry.index === 0 ? entry.item.label : null\"\n                >{{ entry.item.label }}</span\n              >\n            }\n          }\n          @if (!last) {\n            <mat-icon class=\"nxs-breadcrumbs__separator\" aria-hidden=\"true\">chevron_right</mat-icon>\n          }\n        </li>\n      }\n    }\n  </ol>\n  <mat-menu #hiddenMenu=\"matMenu\">\n    @for (item of hiddenItems(); track $index) {\n      @switch (linkKind(item)) {\n        @case ('router') {\n          <a mat-menu-item [routerLink]=\"item.routerLink\" [queryParams]=\"item.queryParams\">{{\n            item.label\n          }}</a>\n        }\n        @case ('href') {\n          <a mat-menu-item [href]=\"item.href\">{{ item.label }}</a>\n        }\n        @default {\n          <button mat-menu-item type=\"button\" disabled>{{ item.label }}</button>\n        }\n      }\n    }\n  </mat-menu>\n</nav>\n<!-- The whole trail at its natural width, for measuring only. -->\n<ol class=\"nxs-breadcrumbs__list nxs-breadcrumbs__measure\" aria-hidden=\"true\">\n  @for (item of items(); track $index; let last = $last) {\n    <li class=\"nxs-breadcrumbs__item\">\n      <span class=\"nxs-breadcrumbs__text\">{{ item.label }}</span>\n      @if (!last) {\n        <mat-icon class=\"nxs-breadcrumbs__separator\">chevron_right</mat-icon>\n      }\n    </li>\n  }\n  <li class=\"nxs-breadcrumbs__item nxs-breadcrumbs__overflow-item\">\n    <span class=\"nxs-breadcrumbs__overflow-measure\"></span>\n    <mat-icon class=\"nxs-breadcrumbs__separator\">chevron_right</mat-icon>\n  </li>\n</ol>\n", styles: [":host {\n  position: relative;\n  display: block;\n  min-width: 0;\n  overflow: hidden;\n  font: var(--mat-sys-body-medium);\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-breadcrumbs__list {\n  display: flex;\n  flex-wrap: nowrap;\n  align-items: center;\n  gap: 4px;\n  min-width: 0;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.nxs-breadcrumbs__item {\n  display: inline-flex;\n  flex: 0 0 auto;\n  align-items: center;\n  gap: 4px;\n  min-width: 0;\n  white-space: nowrap;\n}\n\n// When nothing is left to fold, the first and the last labels are cut short. The last keeps 4em,\n// which `measure()` counts on, so the current page is never hidden.\n.nxs-breadcrumbs__item--first,\n.nxs-breadcrumbs__item--last {\n  flex: 0 1 auto;\n  overflow: hidden;\n\n  .nxs-breadcrumbs__link,\n  .nxs-breadcrumbs__text {\n    min-width: 0;\n    overflow: hidden;\n    text-overflow: ellipsis;\n  }\n}\n\n.nxs-breadcrumbs__item--last {\n  min-width: min(100%, 4em);\n}\n\n.nxs-breadcrumbs__link {\n  color: var(--mat-sys-primary);\n  text-decoration: underline;\n}\n\n.nxs-breadcrumbs__text[aria-current='page'] {\n  color: var(--mat-sys-on-surface);\n}\n\n.nxs-breadcrumbs__separator {\n  flex: 0 0 auto;\n  width: 18px;\n  height: 18px;\n  font-size: 18px;\n  color: var(--mat-sys-outline);\n}\n\n:host-context([dir='rtl']) .nxs-breadcrumbs__separator {\n  transform: scaleX(-1);\n}\n\n.nxs-breadcrumbs__overflow {\n  --mat-icon-button-state-layer-size: 28px;\n\n  width: 28px;\n  height: 28px;\n  padding: 2px;\n}\n\n.nxs-breadcrumbs__overflow-measure {\n  display: inline-block;\n  width: 28px;\n}\n\n// In the flow with no height, so a box sized by its content still prefers the whole unfolded trail\n// and folding never takes away the room it is measured against. It wraps, so the narrowest such a\n// box can be is its widest item, not the whole trail.\n.nxs-breadcrumbs__measure {\n  flex-wrap: wrap;\n  height: 0;\n  overflow: hidden;\n  visibility: hidden;\n  pointer-events: none;\n}\n"] }]
    }], () => [], { items: [{ type: i0.Input, args: [{ isSignal: true, alias: "items", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsBreadcrumbsComponent, { className: "NxsBreadcrumbsComponent", filePath: "libs/shared/satori-components/src/lib/breadcrumbs/breadcrumbs.component.ts", lineNumber: 54 }); })();
