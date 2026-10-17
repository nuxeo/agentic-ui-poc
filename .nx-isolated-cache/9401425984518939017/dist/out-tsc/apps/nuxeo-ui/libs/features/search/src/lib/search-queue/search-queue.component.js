import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SearchAggregationService, } from '@nuxeo/satori-platform/nuxeo-client';
import { NxsThumbnailComponent, provideNxsThumbnailCache } from '@nuxeo/satori-platform/components';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
const _forTrack0 = ($index, $item) => $item.value;
const _forTrack1 = ($index, $item) => $item.id;
function SearchQueueComponent_For_3_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 4);
    i0.ɵɵlistener("click", function SearchQueueComponent_For_3_Template_button_click_0_listener() { const filter_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.onQuickFilterClick(filter_r2.value)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const filter_r2 = ctx.$implicit;
    i0.ɵɵclassProp("active", filter_r2.selected);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", filter_r2.label, " ");
} }
function SearchQueueComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3)(1, "mat-icon");
    i0.ɵɵtext(2, "search_off");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "search.search-queue.no-search-results"));
} }
function SearchQueueComponent_Conditional_5_For_1_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 6);
    i0.ɵɵlistener("click", function SearchQueueComponent_Conditional_5_For_1_Template_button_click_0_listener() { const item_r5 = i0.ɵɵrestoreView(_r4).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.onItemClick(item_r5)); });
    i0.ɵɵelementStart(1, "div", 7)(2, "nxs-thumbnail", 8)(3, "mat-icon", 9);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(5, "div", 10)(6, "h4", 11);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const item_r5 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("active", item_r5.id === ctx_r2.selectedItemId());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("documentId", item_r5.id)("alt", item_r5.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r5.icon || "description");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(item_r5.title);
} }
function SearchQueueComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, SearchQueueComponent_Conditional_5_For_1_Template, 8, 6, "button", 5, _forTrack1);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(ctx_r2.items());
} }
export class SearchQueueComponent {
    searchAggregationService = inject(SearchAggregationService);
    items = computed(() => this.searchAggregationService.items(), ...(ngDevMode ? [{ debugName: "items" }] : []));
    selectedItemId = input('', ...(ngDevMode ? [{ debugName: "selectedItemId" }] : []));
    activeFilters = input([], ...(ngDevMode ? [{ debugName: "activeFilters" }] : []));
    switchToFilter = output();
    quickFilterToggled = output();
    itemSelected = output();
    onSwitchToFilter() {
        this.switchToFilter.emit();
    }
    onItemClick(item) {
        this.itemSelected.emit(item);
    }
    onQuickFilterClick(value) {
        this.quickFilterToggled.emit(value);
    }
    static ɵfac = function SearchQueueComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SearchQueueComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SearchQueueComponent, selectors: [["lib-search-queue"]], inputs: { selectedItemId: [1, "selectedItemId"], activeFilters: [1, "activeFilters"] }, outputs: { switchToFilter: "switchToFilter", quickFilterToggled: "quickFilterToggled", itemSelected: "itemSelected" }, features: [i0.ɵɵProvidersFeature([provideNxsThumbnailCache()])], decls: 6, vars: 1, consts: [[1, "queue-list"], [1, "queue-filters"], ["mat-stroked-button", "", "type", "button", 1, "quick-filter-btn", 3, "active"], [1, "queue-empty"], ["mat-stroked-button", "", "type", "button", 1, "quick-filter-btn", 3, "click"], ["type", "button", 1, "queue-item", 3, "active"], ["type", "button", 1, "queue-item", 3, "click"], [1, "queue-item-preview"], [1, "queue-item-image", 3, "documentId", "alt"], [1, "queue-item-icon"], [1, "queue-item-content"], [1, "queue-item-title"]], template: function SearchQueueComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1);
            i0.ɵɵrepeaterCreate(2, SearchQueueComponent_For_3_Template, 2, 3, "button", 2, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(4, SearchQueueComponent_Conditional_4_Template, 6, 3, "div", 3)(5, SearchQueueComponent_Conditional_5_Template, 2, 0);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.activeFilters());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.items().length === 0 ? 4 : 5);
        } }, dependencies: [NxsThumbnailComponent, CommonModule, MatButtonModule, i1.MatButton, MatIconModule, i2.MatIcon, TranslatePipe], styles: [".queue-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  overflow-y: auto;\n\n  .queue-filters {\n    flex-shrink: 0;\n    padding: 12px 16px;\n    border-bottom: 1px solid #f0f0f0;\n    display: flex;\n    flex-wrap: wrap;\n    gap: 8px;\n  }\n\n  .queue-empty {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: center;\n    height: 100%;\n    color: #999;\n    gap: 12px;\n\n    mat-icon {\n      font-size: 48px;\n      width: 48px;\n      height: 48px;\n    }\n\n    p {\n      margin: 0;\n      font-size: 14px;\n    }\n  }\n}\n\n.quick-filter-btn[_ngcontent-%COMP%] {\n  border-radius: 16px;\n  font-size: 12px;\n  line-height: 1;\n  height: 30px;\n  padding: 0 12px;\n  color: #666;\n  border-color: #d0d0d0;\n  background: #fff;\n\n  &.active {\n    background-color: #e3f2fd;\n    color: #1976d2;\n    border-color: #90caf9;\n  }\n}\n\n.queue-item[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  padding: 12px 16px;\n  border: none;\n  background: none;\n  border-bottom: 1px solid #f0f0f0;\n  text-align: left;\n  cursor: pointer;\n  transition: background-color 0.2s;\n  font-family: inherit;\n\n  &:hover {\n    background-color: #f9f9f9;\n  }\n\n  &:active {\n    background-color: #f0f0f0;\n  }\n\n  &.active {\n    background-color: #e3f2fd;\n    font-weight: 600;\n  }\n\n  .queue-item-preview {\n    flex-shrink: 0;\n    width: 56px;\n    height: 56px;\n    border-radius: 4px;\n    overflow: hidden;\n    background: #f0f0f0;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n\n    .queue-item-icon {\n      font-size: 32px;\n      width: 32px;\n      height: 32px;\n      color: #999;\n    }\n\n    .queue-item-image {\n      width: 100%;\n      height: 100%;\n      object-fit: cover;\n    }\n  }\n\n  .queue-item-content {\n    flex: 1;\n    min-width: 0;\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n\n    .queue-item-title {\n      margin: 0 0 4px;\n      font-size: 14px;\n      font-weight: 500;\n      color: #333;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n\n    .queue-item-type {\n      margin: 0 0 2px;\n      font-size: 12px;\n      color: #999;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n\n    .queue-item-path {\n      margin: 0;\n      font-size: 11px;\n      color: #bbb;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n\n    .queue-item-collection {\n      margin: 0;\n      font-size: 11px;\n      color: #bbb;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SearchQueueComponent, [{
        type: Component,
        args: [{ selector: 'lib-search-queue', standalone: true, imports: [NxsThumbnailComponent, TranslatePipe, CommonModule, MatButtonModule, MatIconModule], providers: [provideNxsThumbnailCache()], template: "<div class=\"queue-list\">\n  <div class=\"queue-filters\">\n    @for (filter of activeFilters(); track filter.value) {\n      <button\n        mat-stroked-button\n        type=\"button\"\n        class=\"quick-filter-btn\"\n        [class.active]=\"filter.selected\"\n        (click)=\"onQuickFilterClick(filter.value)\"\n      >\n        {{ filter.label }}\n      </button>\n    }\n  </div>\n\n  @if (items().length === 0) {\n    <div class=\"queue-empty\">\n      <mat-icon>search_off</mat-icon>\n      <p>{{ 'search.search-queue.no-search-results' | translate }}</p>\n    </div>\n  } @else {\n    @for (item of items(); track item.id) {\n      <button\n        type=\"button\"\n        class=\"queue-item\"\n        [class.active]=\"item.id === selectedItemId()\"\n        (click)=\"onItemClick(item)\"\n      >\n        <div class=\"queue-item-preview\">\n          <nxs-thumbnail class=\"queue-item-image\" [documentId]=\"item.id\" [alt]=\"item.title\">\n            <mat-icon class=\"queue-item-icon\">{{ item.icon || 'description' }}</mat-icon>\n          </nxs-thumbnail>\n        </div>\n        <div class=\"queue-item-content\">\n          <h4 class=\"queue-item-title\">{{ item.title }}</h4>\n        </div>\n      </button>\n    }\n  }\n</div>\n", styles: [".queue-list {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  overflow-y: auto;\n\n  .queue-filters {\n    flex-shrink: 0;\n    padding: 12px 16px;\n    border-bottom: 1px solid #f0f0f0;\n    display: flex;\n    flex-wrap: wrap;\n    gap: 8px;\n  }\n\n  .queue-empty {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: center;\n    height: 100%;\n    color: #999;\n    gap: 12px;\n\n    mat-icon {\n      font-size: 48px;\n      width: 48px;\n      height: 48px;\n    }\n\n    p {\n      margin: 0;\n      font-size: 14px;\n    }\n  }\n}\n\n.quick-filter-btn {\n  border-radius: 16px;\n  font-size: 12px;\n  line-height: 1;\n  height: 30px;\n  padding: 0 12px;\n  color: #666;\n  border-color: #d0d0d0;\n  background: #fff;\n\n  &.active {\n    background-color: #e3f2fd;\n    color: #1976d2;\n    border-color: #90caf9;\n  }\n}\n\n.queue-item {\n  display: flex;\n  gap: 12px;\n  padding: 12px 16px;\n  border: none;\n  background: none;\n  border-bottom: 1px solid #f0f0f0;\n  text-align: left;\n  cursor: pointer;\n  transition: background-color 0.2s;\n  font-family: inherit;\n\n  &:hover {\n    background-color: #f9f9f9;\n  }\n\n  &:active {\n    background-color: #f0f0f0;\n  }\n\n  &.active {\n    background-color: #e3f2fd;\n    font-weight: 600;\n  }\n\n  .queue-item-preview {\n    flex-shrink: 0;\n    width: 56px;\n    height: 56px;\n    border-radius: 4px;\n    overflow: hidden;\n    background: #f0f0f0;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n\n    .queue-item-icon {\n      font-size: 32px;\n      width: 32px;\n      height: 32px;\n      color: #999;\n    }\n\n    .queue-item-image {\n      width: 100%;\n      height: 100%;\n      object-fit: cover;\n    }\n  }\n\n  .queue-item-content {\n    flex: 1;\n    min-width: 0;\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n\n    .queue-item-title {\n      margin: 0 0 4px;\n      font-size: 14px;\n      font-weight: 500;\n      color: #333;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n\n    .queue-item-type {\n      margin: 0 0 2px;\n      font-size: 12px;\n      color: #999;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n\n    .queue-item-path {\n      margin: 0;\n      font-size: 11px;\n      color: #bbb;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n\n    .queue-item-collection {\n      margin: 0;\n      font-size: 11px;\n      color: #bbb;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n  }\n}\n"] }]
    }], null, { selectedItemId: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectedItemId", required: false }] }], activeFilters: [{ type: i0.Input, args: [{ isSignal: true, alias: "activeFilters", required: false }] }], switchToFilter: [{ type: i0.Output, args: ["switchToFilter"] }], quickFilterToggled: [{ type: i0.Output, args: ["quickFilterToggled"] }], itemSelected: [{ type: i0.Output, args: ["itemSelected"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SearchQueueComponent, { className: "SearchQueueComponent", filePath: "libs/features/search/src/lib/search-queue/search-queue.component.ts", lineNumber: 26 }); })();
