import { Component, DestroyRef, computed, effect, inject, input, output, signal, untracked, } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AssetAggregationService, DocumentDetailService, } from '@nuxeo/satori-platform/nuxeo-client';
import { catchError, of } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/icon";
const _forTrack0 = ($index, $item) => $item.id;
function AssetsQueueComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 1)(1, "mat-icon");
    i0.ɵɵtext(2, "search_off");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "assets.assets-queue.no-asset-results"));
} }
function AssetsQueueComponent_Conditional_2_For_1_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 5);
} if (rf & 2) {
    const item_r2 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl)("alt", item_r2.title);
} }
function AssetsQueueComponent_Conditional_2_For_1_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 6);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r2 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r2.icon || "description");
} }
function AssetsQueueComponent_Conditional_2_For_1_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 3);
    i0.ɵɵlistener("click", function AssetsQueueComponent_Conditional_2_For_1_Template_button_click_0_listener() { const item_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.onItemClick(item_r2)); });
    i0.ɵɵelementStart(1, "div", 4);
    i0.ɵɵconditionalCreate(2, AssetsQueueComponent_Conditional_2_For_1_Conditional_2_Template, 1, 2, "img", 5)(3, AssetsQueueComponent_Conditional_2_For_1_Conditional_3_Template, 2, 1, "mat-icon", 6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 7)(5, "h4", 8);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_12_0;
    const item_r2 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("active", item_r2.id === ctx_r2.selectedItemId());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_12_0 = ctx_r2.thumbnailFor(item_r2.id)) ? 2 : 3, tmp_12_0);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(item_r2.title);
} }
function AssetsQueueComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, AssetsQueueComponent_Conditional_2_For_1_Template, 7, 4, "button", 2, _forTrack0);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(ctx_r2.items());
} }
export class AssetsQueueComponent {
    assetAggregationService = inject(AssetAggregationService);
    detailService = inject(DocumentDetailService);
    destroyRef = inject(DestroyRef);
    objectUrls = new Map();
    inFlight = new Set();
    /**
     * The ids currently in `items()`, maintained by the effect below.
     *
     * Needed because a thumbnail response can arrive after its asset left the results, and the callback
     * has no other way to know that. Without it a late response minted a URL for an item no longer
     * displayed, which then had no render path and no revocation until teardown.
     */
    activeIds = new Set();
    items = computed(() => this.assetAggregationService.items(), ...(ngDevMode ? [{ debugName: "items" }] : []));
    thumbnailMap = signal({}, ...(ngDevMode ? [{ debugName: "thumbnailMap" }] : []));
    selectedItemId = input('', ...(ngDevMode ? [{ debugName: "selectedItemId" }] : []));
    itemSelected = output();
    constructor() {
        effect(() => {
            const queueItems = this.items();
            const thumbnailMap = untracked(() => this.thumbnailMap());
            // Reconcile the ledger with the current results before fetching anything.
            //
            // This effect only ever ADDED. `objectUrls` and `thumbnailMap` kept every id they had ever seen
            // until `onDestroy`, and this component stays mounted across searches — so every prior result's
            // thumbnail blob was retained for the lifetime of the page, growing without bound. The
            // per-id revoke-before-replace below only covers re-fetching the SAME id; it never saw an id
            // that simply stopped being in the results.
            this.activeIds = new Set(queueItems.map((item) => item.id));
            for (const [id, url] of [...this.objectUrls]) {
                if (this.activeIds.has(id))
                    continue;
                URL.revokeObjectURL(url);
                this.objectUrls.delete(id);
            }
            const stale = Object.keys(thumbnailMap).filter((id) => !this.activeIds.has(id));
            if (stale.length > 0) {
                this.thumbnailMap.update((current) => {
                    const next = { ...current };
                    for (const id of stale)
                        delete next[id];
                    return next;
                });
            }
            for (const item of queueItems) {
                if (thumbnailMap[item.id] || this.inFlight.has(item.id))
                    continue;
                this.inFlight.add(item.id);
                this.detailService
                    .fetchThumbnail(item.id)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .pipe(catchError(() => of(null)))
                    .subscribe((blob) => {
                    this.inFlight.delete(item.id);
                    if (!blob)
                        return;
                    // Dropped if this id left the results while the request was in flight: minting here would
                    // add a URL with no render path and no revocation until teardown.
                    if (!this.activeIds.has(item.id))
                        return;
                    const previousUrl = this.objectUrls.get(item.id);
                    if (previousUrl)
                        URL.revokeObjectURL(previousUrl);
                    const url = URL.createObjectURL(blob);
                    this.objectUrls.set(item.id, url);
                    this.thumbnailMap.update((current) => ({
                        ...current,
                        [item.id]: url,
                    }));
                });
            }
        });
        this.destroyRef.onDestroy(() => {
            for (const url of this.objectUrls.values()) {
                URL.revokeObjectURL(url);
            }
            this.objectUrls.clear();
            this.inFlight.clear();
        });
    }
    onItemClick(item) {
        this.itemSelected.emit(item);
    }
    thumbnailFor(id) {
        return this.thumbnailMap()[id] ?? null;
    }
    static ɵfac = function AssetsQueueComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AssetsQueueComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AssetsQueueComponent, selectors: [["lib-assets-queue"]], inputs: { selectedItemId: [1, "selectedItemId"] }, outputs: { itemSelected: "itemSelected" }, decls: 3, vars: 1, consts: [[1, "queue-list"], [1, "queue-empty"], ["type", "button", 1, "queue-item", 3, "active"], ["type", "button", 1, "queue-item", 3, "click"], [1, "queue-item-preview"], [1, "queue-item-image", 3, "src", "alt"], [1, "queue-item-icon"], [1, "queue-item-content"], [1, "queue-item-title"]], template: function AssetsQueueComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵconditionalCreate(1, AssetsQueueComponent_Conditional_1_Template, 6, 3, "div", 1)(2, AssetsQueueComponent_Conditional_2_Template, 2, 0);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.items().length === 0 ? 1 : 2);
        } }, dependencies: [CommonModule, MatIconModule, i1.MatIcon, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  height: 100%;\n}\n\n.queue-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  overflow-y: auto;\n\n  .queue-filters {\n    flex-shrink: 0;\n    padding: 12px 16px;\n    border-bottom: 1px solid #f0f0f0;\n    display: flex;\n    flex-wrap: wrap;\n    gap: 8px;\n  }\n\n  .queue-empty {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: center;\n    height: 100%;\n    color: #999;\n    gap: 12px;\n\n    mat-icon {\n      font-size: 48px;\n      width: 48px;\n      height: 48px;\n    }\n\n    p {\n      margin: 0;\n      font-size: 14px;\n    }\n  }\n}\n\n.quick-filter-btn[_ngcontent-%COMP%] {\n  border-radius: 16px;\n  font-size: 12px;\n  line-height: 1;\n  height: 30px;\n  padding: 0 12px;\n  color: #666;\n  border-color: #d0d0d0;\n  background: #fff;\n\n  &.active {\n    background-color: #e3f2fd;\n    color: #1976d2;\n    border-color: #90caf9;\n  }\n}\n\n.queue-item[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  padding: 12px 16px;\n  border: none;\n  background: none;\n  border-bottom: 1px solid #f0f0f0;\n  text-align: left;\n  cursor: pointer;\n  transition: background-color 0.2s;\n  font-family: inherit;\n\n  &:hover {\n    background-color: #f9f9f9;\n  }\n\n  &:active {\n    background-color: #f0f0f0;\n  }\n\n  &.active {\n    background-color: #e3f2fd;\n    font-weight: 600;\n  }\n\n  .queue-item-preview {\n    flex-shrink: 0;\n    width: 56px;\n    height: 56px;\n    border-radius: 4px;\n    overflow: hidden;\n    background: #f0f0f0;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n\n    .queue-item-icon {\n      font-size: 32px;\n      width: 32px;\n      height: 32px;\n      color: #999;\n    }\n\n    .queue-item-image {\n      width: 100%;\n      height: 100%;\n      object-fit: cover;\n      display: block;\n    }\n  }\n\n  .queue-item-content {\n    flex: 1;\n    min-width: 0;\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n\n    .queue-item-title {\n      margin: 0 0 4px;\n      font-size: 14px;\n      font-weight: 500;\n      color: #333;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n\n    .queue-item-type {\n      margin: 0 0 2px;\n      font-size: 12px;\n      color: #999;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n\n    .queue-item-path {\n      margin: 0;\n      font-size: 11px;\n      color: #bbb;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n\n    .queue-item-collection {\n      margin: 0;\n      font-size: 11px;\n      color: #bbb;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AssetsQueueComponent, [{
        type: Component,
        args: [{ selector: 'lib-assets-queue', standalone: true, imports: [TranslatePipe, CommonModule, MatIconModule], template: "<div class=\"queue-list\">\n  @if (items().length === 0) {\n    <div class=\"queue-empty\">\n      <mat-icon>search_off</mat-icon>\n      <p>{{ 'assets.assets-queue.no-asset-results' | translate }}</p>\n    </div>\n  } @else {\n    @for (item of items(); track item.id) {\n      <button\n        type=\"button\"\n        class=\"queue-item\"\n        [class.active]=\"item.id === selectedItemId()\"\n        (click)=\"onItemClick(item)\"\n      >\n        <div class=\"queue-item-preview\">\n          @if (thumbnailFor(item.id); as preview) {\n            <img [src]=\"preview\" [alt]=\"item.title\" class=\"queue-item-image\" />\n          } @else {\n            <mat-icon class=\"queue-item-icon\">{{ item.icon || 'description' }}</mat-icon>\n          }\n        </div>\n        <div class=\"queue-item-content\">\n          <h4 class=\"queue-item-title\">{{ item.title }}</h4>\n        </div>\n      </button>\n    }\n  }\n</div>\n", styles: [":host {\n  display: block;\n  height: 100%;\n}\n\n.queue-list {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  overflow-y: auto;\n\n  .queue-filters {\n    flex-shrink: 0;\n    padding: 12px 16px;\n    border-bottom: 1px solid #f0f0f0;\n    display: flex;\n    flex-wrap: wrap;\n    gap: 8px;\n  }\n\n  .queue-empty {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: center;\n    height: 100%;\n    color: #999;\n    gap: 12px;\n\n    mat-icon {\n      font-size: 48px;\n      width: 48px;\n      height: 48px;\n    }\n\n    p {\n      margin: 0;\n      font-size: 14px;\n    }\n  }\n}\n\n.quick-filter-btn {\n  border-radius: 16px;\n  font-size: 12px;\n  line-height: 1;\n  height: 30px;\n  padding: 0 12px;\n  color: #666;\n  border-color: #d0d0d0;\n  background: #fff;\n\n  &.active {\n    background-color: #e3f2fd;\n    color: #1976d2;\n    border-color: #90caf9;\n  }\n}\n\n.queue-item {\n  display: flex;\n  gap: 12px;\n  padding: 12px 16px;\n  border: none;\n  background: none;\n  border-bottom: 1px solid #f0f0f0;\n  text-align: left;\n  cursor: pointer;\n  transition: background-color 0.2s;\n  font-family: inherit;\n\n  &:hover {\n    background-color: #f9f9f9;\n  }\n\n  &:active {\n    background-color: #f0f0f0;\n  }\n\n  &.active {\n    background-color: #e3f2fd;\n    font-weight: 600;\n  }\n\n  .queue-item-preview {\n    flex-shrink: 0;\n    width: 56px;\n    height: 56px;\n    border-radius: 4px;\n    overflow: hidden;\n    background: #f0f0f0;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n\n    .queue-item-icon {\n      font-size: 32px;\n      width: 32px;\n      height: 32px;\n      color: #999;\n    }\n\n    .queue-item-image {\n      width: 100%;\n      height: 100%;\n      object-fit: cover;\n      display: block;\n    }\n  }\n\n  .queue-item-content {\n    flex: 1;\n    min-width: 0;\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n\n    .queue-item-title {\n      margin: 0 0 4px;\n      font-size: 14px;\n      font-weight: 500;\n      color: #333;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n\n    .queue-item-type {\n      margin: 0 0 2px;\n      font-size: 12px;\n      color: #999;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n\n    .queue-item-path {\n      margin: 0;\n      font-size: 11px;\n      color: #bbb;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n\n    .queue-item-collection {\n      margin: 0;\n      font-size: 11px;\n      color: #bbb;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n  }\n}\n"] }]
    }], () => [], { selectedItemId: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectedItemId", required: false }] }], itemSelected: [{ type: i0.Output, args: ["itemSelected"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AssetsQueueComponent, { className: "AssetsQueueComponent", filePath: "libs/features/assets/src/lib/assets-queue/assets-queue.component.ts", lineNumber: 30 }); })();
