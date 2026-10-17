import { ChangeDetectionStrategy, Component, afterRenderEffect, computed, input, output, signal, viewChild, } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
import * as i3 from "@angular/material/progress-bar";
import * as i4 from "@angular/material/tooltip";
const _c0 = ["list"];
const _c1 = (a0, a1) => ({ done: a0, total: a1 });
const _c2 = a0 => ({ count: a0 });
const _c3 = a0 => ({ percent: a0 });
const _c4 = a0 => ({ name: a0 });
const _forTrack0 = ($index, $item) => $item.id;
function NxsUploadQueueComponent_Conditional_0_Conditional_0_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(1, 1, "satori-components.upload-queue.summary-failed", i0.ɵɵpureFunction1(4, _c2, ctx_r0.failedCount())), " ");
} }
function NxsUploadQueueComponent_Conditional_0_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 1);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵconditionalCreate(3, NxsUploadQueueComponent_Conditional_0_Conditional_0_Conditional_3_Template, 2, 6);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(2, 2, "satori-components.upload-queue.summary", i0.ɵɵpureFunction2(5, _c1, ctx_r0.doneCount(), ctx_r0.items().length)), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.failedCount() > 0 ? 3 : -1);
} }
function NxsUploadQueueComponent_Conditional_0_For_4_Case_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " check_circle ");
} }
function NxsUploadQueueComponent_Conditional_0_For_4_Case_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " error_outline ");
} }
function NxsUploadQueueComponent_Conditional_0_For_4_Case_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " description ");
} }
function NxsUploadQueueComponent_Conditional_0_For_4_Case_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const item_r2 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.size(item_r2.file.size), " ");
} }
function NxsUploadQueueComponent_Conditional_0_For_4_Case_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.upload-queue.waiting"), " ");
} }
function NxsUploadQueueComponent_Conditional_0_For_4_Case_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const item_r2 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(1, 1, "satori-components.upload-queue.uploading", i0.ɵɵpureFunction1(4, _c3, item_r2.percent)), " ");
} }
function NxsUploadQueueComponent_Conditional_0_For_4_Case_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.upload-queue.done"), " ");
} }
function NxsUploadQueueComponent_Conditional_0_For_4_Case_13_Case_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.upload-queue.forbidden"), " ");
} }
function NxsUploadQueueComponent_Conditional_0_For_4_Case_13_Case_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.upload-queue.not-found"), " ");
} }
function NxsUploadQueueComponent_Conditional_0_For_4_Case_13_Case_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.upload-queue.failed"), " ");
} }
function NxsUploadQueueComponent_Conditional_0_For_4_Case_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsUploadQueueComponent_Conditional_0_For_4_Case_13_Case_0_Template, 2, 3)(1, NxsUploadQueueComponent_Conditional_0_For_4_Case_13_Case_1_Template, 2, 3)(2, NxsUploadQueueComponent_Conditional_0_For_4_Case_13_Case_2_Template, 2, 3);
} if (rf & 2) {
    let tmp_13_0;
    const item_r2 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵconditional((tmp_13_0 = item_r2.error) === 403 ? 0 : tmp_13_0 === 404 ? 1 : 2);
} }
function NxsUploadQueueComponent_Conditional_0_For_4_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-progress-bar", 8);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const item_r2 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("value", item_r2.percent);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(1, 2, "satori-components.upload-queue.progress", i0.ɵɵpureFunction1(5, _c4, item_r2.file.name)));
} }
function NxsUploadQueueComponent_Conditional_0_For_4_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵdeclareLet(0);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵelementStart(2, "button", 11);
    i0.ɵɵlistener("click", function NxsUploadQueueComponent_Conditional_0_For_4_Conditional_15_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r3); const item_r2 = i0.ɵɵnextContext().$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.retry.emit(item_r2.id)); });
    i0.ɵɵelementStart(3, "mat-icon", 12);
    i0.ɵɵtext(4, "refresh");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r2 = i0.ɵɵnextContext().$implicit;
    const retryLabel_r4 = i0.ɵɵpipeBind2(1, 2, "satori-components.upload-queue.retry", i0.ɵɵpureFunction1(5, _c4, item_r2.file.name));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matTooltip", retryLabel_r4);
    i0.ɵɵattribute("aria-label", retryLabel_r4);
} }
function NxsUploadQueueComponent_Conditional_0_For_4_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵdeclareLet(0);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵelementStart(2, "button", 13);
    i0.ɵɵlistener("click", function NxsUploadQueueComponent_Conditional_0_For_4_Conditional_16_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r5); const item_r2 = i0.ɵɵnextContext().$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.remove.emit(item_r2.id)); });
    i0.ɵɵelementStart(3, "mat-icon", 12);
    i0.ɵɵtext(4, "close");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r2 = i0.ɵɵnextContext().$implicit;
    const removeLabel_r6 = i0.ɵɵpipeBind2(1, 2, "satori-components.upload-queue.remove", i0.ɵɵpureFunction1(5, _c4, item_r2.file.name));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matTooltip", removeLabel_r6);
    i0.ɵɵattribute("aria-label", removeLabel_r6);
} }
function NxsUploadQueueComponent_Conditional_0_For_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 3)(1, "mat-icon", 4);
    i0.ɵɵconditionalCreate(2, NxsUploadQueueComponent_Conditional_0_For_4_Case_2_Template, 1, 0)(3, NxsUploadQueueComponent_Conditional_0_For_4_Case_3_Template, 1, 0)(4, NxsUploadQueueComponent_Conditional_0_For_4_Case_4_Template, 1, 0);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 5)(6, "span", 6);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "span", 7);
    i0.ɵɵconditionalCreate(9, NxsUploadQueueComponent_Conditional_0_For_4_Case_9_Template, 1, 1)(10, NxsUploadQueueComponent_Conditional_0_For_4_Case_10_Template, 2, 3)(11, NxsUploadQueueComponent_Conditional_0_For_4_Case_11_Template, 2, 6)(12, NxsUploadQueueComponent_Conditional_0_For_4_Case_12_Template, 2, 3)(13, NxsUploadQueueComponent_Conditional_0_For_4_Case_13_Template, 3, 1);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(14, NxsUploadQueueComponent_Conditional_0_For_4_Conditional_14_Template, 2, 7, "mat-progress-bar", 8);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(15, NxsUploadQueueComponent_Conditional_0_For_4_Conditional_15_Template, 5, 7, "button", 9);
    i0.ɵɵconditionalCreate(16, NxsUploadQueueComponent_Conditional_0_For_4_Conditional_16_Template, 5, 7, "button", 10);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_13_0;
    let tmp_15_0;
    const item_r2 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵattribute("data-state", item_r2.state);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_13_0 = item_r2.state) === "done" ? 2 : tmp_13_0 === "failed" ? 3 : 4);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(item_r2.file.name);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_15_0 = item_r2.state) === "staged" ? 9 : tmp_15_0 === "waiting" ? 10 : tmp_15_0 === "uploading" ? 11 : tmp_15_0 === "done" ? 12 : tmp_15_0 === "failed" ? 13 : -1);
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(item_r2.state === "uploading" ? 14 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r2.state === "failed" ? 15 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.removable(item_r2) ? 16 : -1);
} }
function NxsUploadQueueComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsUploadQueueComponent_Conditional_0_Conditional_0_Template, 4, 8, "p", 1);
    i0.ɵɵelementStart(1, "ul", 2, 0);
    i0.ɵɵrepeaterCreate(3, NxsUploadQueueComponent_Conditional_0_For_4_Template, 17, 7, "li", 3, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r0.started() ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", ctx_r0.label())("tabindex", ctx_r0.scrolls() ? 0 : null);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r0.items());
} }
/**
 * The files of an upload, each with its own state: chosen, waiting, uploading with its progress,
 * uploaded, or refused with the reason and Retry.
 *
 * Presentational: it draws `items` — usually an `NxsUploadQueue`'s — and reports Remove and Retry;
 * the page runs the upload. The count of files uploaded and refused is announced politely as it
 * changes, so a screen reader follows a long upload without watching each bar.
 */
export class NxsUploadQueueComponent {
    /** The files, in order. */
    items = input.required(...(ngDevMode ? [{ debugName: "items" }] : []));
    /** The list's accessible name, already translated, such as "Files to upload". */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** Remove was pressed on a file that is not uploading: its id. */
    remove = output();
    /** Retry was pressed on a refused file: its id. */
    retry = output();
    doneCount = computed(() => this.items().filter((item) => item.state === 'done').length, ...(ngDevMode ? [{ debugName: "doneCount" }] : []));
    failedCount = computed(() => this.items().filter((item) => item.state === 'failed').length, ...(ngDevMode ? [{ debugName: "failedCount" }] : []));
    started = computed(() => this.items().some((item) => item.state !== 'staged'), ...(ngDevMode ? [{ debugName: "started" }] : []));
    /**
     * Whether the list scrolls. A file waiting or uploading has no button, so a long run can leave
     * nothing in the list to focus; the list then takes focus itself, so the keyboard can scroll it.
     * Measured when the files change and when the list changes size with the same files, as on zoom.
     */
    scrolls = signal(false, ...(ngDevMode ? [{ debugName: "scrolls" }] : []));
    list = viewChild('list', ...(ngDevMode ? [{ debugName: "list" }] : []));
    constructor() {
        afterRenderEffect(() => {
            this.items();
            this.measure();
        });
        afterRenderEffect((onCleanup) => {
            const list = this.list()?.nativeElement;
            if (!list || typeof ResizeObserver === 'undefined')
                return;
            const observer = new ResizeObserver(() => this.measure());
            observer.observe(list);
            onCleanup(() => observer.disconnect());
        });
    }
    size(bytes) {
        if (!Number.isFinite(bytes) || bytes < 0)
            return '';
        if (bytes < 1024)
            return `${bytes} B`;
        const units = ['KB', 'MB', 'GB'];
        let value = bytes / 1024;
        let unit = 0;
        while (value >= 1024 && unit < units.length - 1) {
            value /= 1024;
            unit += 1;
        }
        return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
    }
    removable(item) {
        return item.state === 'staged' || item.state === 'failed' || item.state === 'done';
    }
    measure() {
        const list = this.list()?.nativeElement;
        this.scrolls.set(!!list && list.scrollHeight > list.clientHeight);
    }
    static ɵfac = function NxsUploadQueueComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsUploadQueueComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsUploadQueueComponent, selectors: [["nxs-upload-queue"]], viewQuery: function NxsUploadQueueComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.list, _c0, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, hostAttrs: [1, "nxs-upload-queue"], inputs: { items: [1, "items"], label: [1, "label"] }, outputs: { remove: "remove", retry: "retry" }, decls: 1, vars: 1, consts: [["list", ""], ["aria-live", "polite", "aria-atomic", "true", 1, "nxs-upload-queue__summary"], [1, "nxs-upload-queue__list"], [1, "nxs-upload-queue__item"], ["aria-hidden", "true", 1, "nxs-upload-queue__icon"], [1, "nxs-upload-queue__body"], [1, "nxs-upload-queue__name"], [1, "nxs-upload-queue__status"], ["mode", "determinate", 1, "nxs-upload-queue__bar", 3, "value"], ["mat-icon-button", "", "type", "button", 1, "nxs-upload-queue__retry", 3, "matTooltip"], ["mat-icon-button", "", "type", "button", 1, "nxs-upload-queue__remove", 3, "matTooltip"], ["mat-icon-button", "", "type", "button", 1, "nxs-upload-queue__retry", 3, "click", "matTooltip"], ["aria-hidden", "true"], ["mat-icon-button", "", "type", "button", 1, "nxs-upload-queue__remove", 3, "click", "matTooltip"]], template: function NxsUploadQueueComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, NxsUploadQueueComponent_Conditional_0_Template, 5, 3);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.items().length > 0 ? 0 : -1);
        } }, dependencies: [MatButtonModule, i1.MatIconButton, MatIconModule, i2.MatIcon, MatProgressBarModule, i3.MatProgressBar, MatTooltipModule, i4.MatTooltip, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  font: var(--mat-sys-body-medium);\n  color: var(--mat-sys-on-surface);\n}\n\n.nxs-upload-queue__summary[_ngcontent-%COMP%] {\n  margin: 0 0 8px;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-upload-queue__list[_ngcontent-%COMP%] {\n  max-height: 280px;\n  margin: 0;\n  padding: 0;\n  overflow-y: auto;\n  list-style: none;\n  border: 1px solid var(--mat-sys-outline-variant);\n  border-radius: 8px;\n\n  // IBM Equal Access's style_focus_visible reads `:focus` only, so the ring is also drawn on a\n  // standalone `:focus` (NXSAT-547).\n  &:focus {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: 2px;\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: 2px;\n  }\n}\n\n.nxs-upload-queue__item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 8px 8px 8px 12px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant);\n\n  &:last-child {\n    border-bottom: 0;\n  }\n}\n\n.nxs-upload-queue__icon[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n[data-state='done'][_ngcontent-%COMP%]   .nxs-upload-queue__icon[_ngcontent-%COMP%] {\n  color: var(--mat-sys-primary);\n}\n\n[data-state='failed'][_ngcontent-%COMP%]   .nxs-upload-queue__icon,\n[data-state='failed'][_ngcontent-%COMP%]   .nxs-upload-queue__status[_ngcontent-%COMP%] {\n  color: var(--mat-sys-error);\n}\n\n.nxs-upload-queue__body[_ngcontent-%COMP%] {\n  display: flex;\n  flex: 1;\n  flex-direction: column;\n  gap: 2px;\n  min-width: 0;\n}\n\n.nxs-upload-queue__name[_ngcontent-%COMP%] {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.nxs-upload-queue__status[_ngcontent-%COMP%] {\n  font: var(--mat-sys-body-small);\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-upload-queue__bar[_ngcontent-%COMP%] {\n  margin-top: 4px;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsUploadQueueComponent, [{
        type: Component,
        args: [{ selector: 'nxs-upload-queue', standalone: true, imports: [MatButtonModule, MatIconModule, MatProgressBarModule, MatTooltipModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-upload-queue' }, template: "@if (items().length > 0) {\n  @if (started()) {\n    <p class=\"nxs-upload-queue__summary\" aria-live=\"polite\" aria-atomic=\"true\">\n      {{\n        'satori-components.upload-queue.summary'\n          | translate: { done: doneCount(), total: items().length }\n      }}\n      @if (failedCount() > 0) {\n        {{ 'satori-components.upload-queue.summary-failed' | translate: { count: failedCount() } }}\n      }\n    </p>\n  }\n  <ul\n    #list\n    class=\"nxs-upload-queue__list\"\n    [attr.aria-label]=\"label()\"\n    [attr.tabindex]=\"scrolls() ? 0 : null\"\n  >\n    @for (item of items(); track item.id) {\n      <li class=\"nxs-upload-queue__item\" [attr.data-state]=\"item.state\">\n        <mat-icon class=\"nxs-upload-queue__icon\" aria-hidden=\"true\">\n          @switch (item.state) {\n            @case ('done') {\n              check_circle\n            }\n            @case ('failed') {\n              error_outline\n            }\n            @default {\n              description\n            }\n          }\n        </mat-icon>\n        <div class=\"nxs-upload-queue__body\">\n          <span class=\"nxs-upload-queue__name\">{{ item.file.name }}</span>\n          <span class=\"nxs-upload-queue__status\">\n            @switch (item.state) {\n              @case ('staged') {\n                {{ size(item.file.size) }}\n              }\n              @case ('waiting') {\n                {{ 'satori-components.upload-queue.waiting' | translate }}\n              }\n              @case ('uploading') {\n                {{\n                  'satori-components.upload-queue.uploading' | translate: { percent: item.percent }\n                }}\n              }\n              @case ('done') {\n                {{ 'satori-components.upload-queue.done' | translate }}\n              }\n              @case ('failed') {\n                @switch (item.error) {\n                  @case (403) {\n                    {{ 'satori-components.upload-queue.forbidden' | translate }}\n                  }\n                  @case (404) {\n                    {{ 'satori-components.upload-queue.not-found' | translate }}\n                  }\n                  @default {\n                    {{ 'satori-components.upload-queue.failed' | translate }}\n                  }\n                }\n              }\n            }\n          </span>\n          @if (item.state === 'uploading') {\n            <mat-progress-bar\n              class=\"nxs-upload-queue__bar\"\n              mode=\"determinate\"\n              [value]=\"item.percent\"\n              [attr.aria-label]=\"\n                'satori-components.upload-queue.progress' | translate: { name: item.file.name }\n              \"\n            />\n          }\n        </div>\n        @if (item.state === 'failed') {\n          @let retryLabel =\n            'satori-components.upload-queue.retry' | translate: { name: item.file.name };\n          <button\n            mat-icon-button\n            type=\"button\"\n            class=\"nxs-upload-queue__retry\"\n            [matTooltip]=\"retryLabel\"\n            [attr.aria-label]=\"retryLabel\"\n            (click)=\"retry.emit(item.id)\"\n          >\n            <mat-icon aria-hidden=\"true\">refresh</mat-icon>\n          </button>\n        }\n        @if (removable(item)) {\n          @let removeLabel =\n            'satori-components.upload-queue.remove' | translate: { name: item.file.name };\n          <button\n            mat-icon-button\n            type=\"button\"\n            class=\"nxs-upload-queue__remove\"\n            [matTooltip]=\"removeLabel\"\n            [attr.aria-label]=\"removeLabel\"\n            (click)=\"remove.emit(item.id)\"\n          >\n            <mat-icon aria-hidden=\"true\">close</mat-icon>\n          </button>\n        }\n      </li>\n    }\n  </ul>\n}\n", styles: [":host {\n  display: block;\n  font: var(--mat-sys-body-medium);\n  color: var(--mat-sys-on-surface);\n}\n\n.nxs-upload-queue__summary {\n  margin: 0 0 8px;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-upload-queue__list {\n  max-height: 280px;\n  margin: 0;\n  padding: 0;\n  overflow-y: auto;\n  list-style: none;\n  border: 1px solid var(--mat-sys-outline-variant);\n  border-radius: 8px;\n\n  // IBM Equal Access's style_focus_visible reads `:focus` only, so the ring is also drawn on a\n  // standalone `:focus` (NXSAT-547).\n  &:focus {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: 2px;\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: 2px;\n  }\n}\n\n.nxs-upload-queue__item {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 8px 8px 8px 12px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant);\n\n  &:last-child {\n    border-bottom: 0;\n  }\n}\n\n.nxs-upload-queue__icon {\n  flex-shrink: 0;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n[data-state='done'] .nxs-upload-queue__icon {\n  color: var(--mat-sys-primary);\n}\n\n[data-state='failed'] .nxs-upload-queue__icon,\n[data-state='failed'] .nxs-upload-queue__status {\n  color: var(--mat-sys-error);\n}\n\n.nxs-upload-queue__body {\n  display: flex;\n  flex: 1;\n  flex-direction: column;\n  gap: 2px;\n  min-width: 0;\n}\n\n.nxs-upload-queue__name {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.nxs-upload-queue__status {\n  font: var(--mat-sys-body-small);\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-upload-queue__bar {\n  margin-top: 4px;\n}\n"] }]
    }], () => [], { items: [{ type: i0.Input, args: [{ isSignal: true, alias: "items", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], remove: [{ type: i0.Output, args: ["remove"] }], retry: [{ type: i0.Output, args: ["retry"] }], list: [{ type: i0.ViewChild, args: ['list', { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsUploadQueueComponent, { className: "NxsUploadQueueComponent", filePath: "libs/shared/satori-components/src/lib/upload-queue/upload-queue.component.ts", lineNumber: 37 }); })();
//# sourceMappingURL=upload-queue.component.js.map