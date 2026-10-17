import { Component, computed, inject, signal, DestroyRef, effect } from '@angular/core';
import { DescriptorLabelPipe } from '@nuxeo/satori-platform/extensions';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, map, catchError, of, tap, finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AssetService, AssetAggregationService, SearchService, SelectionService, DocumentDetailService, docTypeIcon, DocTypeLabelPipe, } from '@nuxeo/satori-platform/nuxeo-client';
import { ConfirmDialogComponent, SavedSearchDialogComponent, ShareSavedSearchDialogComponent, } from '@nuxeo/satori-platform/ui';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/menu";
import * as i3 from "@angular/material/icon";
import * as i4 from "@angular/material/tooltip";
import * as i5 from "@angular/material/checkbox";
import * as i6 from "@angular/material/progress-spinner";
const _c0 = a0 => ({ count: a0 });
const _c1 = a0 => ({ name: a0 });
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.key;
function AssetSearchResultsComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 15);
    i0.ɵɵlistener("click", function AssetSearchResultsComponent_Conditional_2_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.openSaveAsDialog()); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "bookmark_add");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "assets.asset-search-results.save-as"), " ");
} }
function AssetSearchResultsComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 16);
    i0.ɵɵlistener("click", function AssetSearchResultsComponent_Conditional_3_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onSaveSelectedSavedSearch()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "assets.asset-search-results.save"), " ");
} }
function AssetSearchResultsComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 17);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵelementStart(2, "mat-icon");
    i0.ɵɵtext(3, "more_vert");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "mat-menu", null, 0)(6, "button", 18);
    i0.ɵɵlistener("click", function AssetSearchResultsComponent_Conditional_4_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onEditSelectedSavedSearch()); });
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "button", 18);
    i0.ɵɵlistener("click", function AssetSearchResultsComponent_Conditional_4_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onShareSelectedSavedSearch()); });
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "button", 18);
    i0.ɵɵlistener("click", function AssetSearchResultsComponent_Conditional_4_Template_button_click_12_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onDeleteSelectedSavedSearch()); });
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const resultsActionsMenu_r5 = i0.ɵɵreference(5);
    i0.ɵɵproperty("matMenuTriggerFor", resultsActionsMenu_r5);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 5, "assets.asset-search-results.results-actions"));
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(8, 7, "assets.asset-search-results.edit"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 9, "assets.asset-search-results.share"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(14, 11, "assets.asset-search-results.delete"), " ");
} }
function AssetSearchResultsComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 6);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, ctx_r1.resultCount() === 1 ? "common.count.result-one" : "common.count.result-many", i0.ɵɵpureFunction1(4, _c0, ctx_r1.resultCount())));
} }
function AssetSearchResultsComponent_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 10);
    i0.ɵɵelement(1, "mat-spinner", 19);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "assets.asset-search-results.loading"));
} }
function AssetSearchResultsComponent_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 11);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.error());
} }
function AssetSearchResultsComponent_Conditional_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 12);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "assets.asset-search-results.no-documents-match-the-search-criteria"), " ");
} }
function AssetSearchResultsComponent_Conditional_27_For_2_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 25);
} if (rf & 2) {
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl);
} }
function AssetSearchResultsComponent_Conditional_27_For_2_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 26);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const asset_r7 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(asset_r7.icon);
} }
function AssetSearchResultsComponent_Conditional_27_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 21)(1, "div", 22)(2, "mat-checkbox", 23);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function AssetSearchResultsComponent_Conditional_27_For_2_Template_mat_checkbox_click_2_listener($event) { i0.ɵɵrestoreView(_r6); return i0.ɵɵresetView($event.stopPropagation()); })("change", function AssetSearchResultsComponent_Conditional_27_For_2_Template_mat_checkbox_change_2_listener() { const asset_r7 = i0.ɵɵrestoreView(_r6).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.toggleAssetSelection(asset_r7.id)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "div", 24);
    i0.ɵɵconditionalCreate(5, AssetSearchResultsComponent_Conditional_27_For_2_Conditional_5_Template, 1, 1, "img", 25)(6, AssetSearchResultsComponent_Conditional_27_For_2_Conditional_6_Template, 2, 1, "mat-icon", 26);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 27)(8, "div", 28)(9, "button", 29);
    i0.ɵɵlistener("click", function AssetSearchResultsComponent_Conditional_27_For_2_Template_button_click_9_listener($event) { const asset_r7 = i0.ɵɵrestoreView(_r6).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); ctx_r1.openAsset(asset_r7); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "span", 30);
    i0.ɵɵpipe(12, "docTypeLabel");
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "docTypeLabel");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    let tmp_14_0;
    const asset_r7 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("selected", ctx_r1.isAssetSelected(asset_r7.id));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r1.isAssetSelected(asset_r7.id));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(3, 9, "common.select-item", i0.ɵɵpureFunction1(16, _c1, asset_r7.name)));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((tmp_14_0 = ctx_r1.thumbnailMap()[asset_r7.id]) ? 5 : 6, tmp_14_0);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("title", asset_r7.name);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", asset_r7.name, " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(12, 12, asset_r7.type));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 14, asset_r7.type));
} }
function AssetSearchResultsComponent_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 13);
    i0.ɵɵrepeaterCreate(1, AssetSearchResultsComponent_Conditional_27_For_2_Template, 15, 18, "div", 20, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.gridAssets());
} }
function AssetSearchResultsComponent_Conditional_28_Conditional_1_For_8_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-checkbox", 45);
    i0.ɵɵlistener("change", function AssetSearchResultsComponent_Conditional_28_Conditional_1_For_8_Template_mat_checkbox_change_0_listener() { const col_r11 = i0.ɵɵrestoreView(_r10).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.togglePendingColumn(col_r11.key)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "descriptorLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r11 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("checked", ctx_r1.isPendingColumn(col_r11.key));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, col_r11));
} }
function AssetSearchResultsComponent_Conditional_28_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 37);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function AssetSearchResultsComponent_Conditional_28_Conditional_1_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeColumnPanel()); })("keydown.escape", function AssetSearchResultsComponent_Conditional_28_Conditional_1_Template_button_keydown_escape_0_listener() { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeColumnPanel()); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 38)(3, "p", 39);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 40);
    i0.ɵɵrepeaterCreate(7, AssetSearchResultsComponent_Conditional_28_Conditional_1_For_8_Template, 3, 4, "mat-checkbox", 41, _forTrack1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "div", 42)(10, "button", 43);
    i0.ɵɵlistener("click", function AssetSearchResultsComponent_Conditional_28_Conditional_1_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.resetColumns()); });
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "button", 44);
    i0.ɵɵlistener("click", function AssetSearchResultsComponent_Conditional_28_Conditional_1_Template_button_click_13_listener() { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.applyColumns()); });
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 4, "assets.asset-search-results.close-column-picker"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 6, "assets.asset-search-results.column-settings"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.columnsForPanel);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(12, 8, "assets.asset-search-results.reset"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(15, 10, "assets.asset-search-results.done"), " ");
} }
function AssetSearchResultsComponent_Conditional_28_For_6_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 47);
    i0.ɵɵlistener("click", function AssetSearchResultsComponent_Conditional_28_For_6_Conditional_0_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r12); const col_r13 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.sortBy(col_r13.key)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "descriptorLabel");
    i0.ɵɵelementStart(3, "mat-icon", 48);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const col_r13 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("col-name", col_r13.key === "name");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 6, col_r13), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("sort-active", ctx_r1.sortColumn() === col_r13.key);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.sortColumn() === col_r13.key && ctx_r1.sortDirection() === "desc" ? "arrow_downward" : "arrow_upward", " ");
} }
function AssetSearchResultsComponent_Conditional_28_For_6_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "descriptorLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r13 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, col_r13));
} }
function AssetSearchResultsComponent_Conditional_28_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AssetSearchResultsComponent_Conditional_28_For_6_Conditional_0_Template, 5, 8, "button", 46)(1, AssetSearchResultsComponent_Conditional_28_For_6_Conditional_1_Template, 3, 3, "span");
} if (rf & 2) {
    const col_r13 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(ctx_r1.SORTABLE_COLUMNS.has(col_r13.key) ? 0 : 1);
} }
function AssetSearchResultsComponent_Conditional_28_For_14_For_5_Conditional_0_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 51);
} if (rf & 2) {
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl);
} }
function AssetSearchResultsComponent_Conditional_28_For_14_For_5_Conditional_0_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 52);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const asset_r15 = i0.ɵɵnextContext(3).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(asset_r15.icon);
} }
function AssetSearchResultsComponent_Conditional_28_For_14_For_5_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 50);
    i0.ɵɵconditionalCreate(1, AssetSearchResultsComponent_Conditional_28_For_14_For_5_Conditional_0_Conditional_1_Template, 1, 1, "img", 51)(2, AssetSearchResultsComponent_Conditional_28_For_14_For_5_Conditional_0_Conditional_2_Template, 2, 1, "mat-icon", 52);
    i0.ɵɵelementStart(3, "button", 53);
    i0.ɵɵlistener("click", function AssetSearchResultsComponent_Conditional_28_For_14_For_5_Conditional_0_Template_button_click_3_listener($event) { i0.ɵɵrestoreView(_r16); const asset_r15 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); ctx_r1.openAsset(asset_r15); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_22_0;
    const asset_r15 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_22_0 = ctx_r1.thumbnailMap()[asset_r15.id]) ? 1 : 2, tmp_22_0);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("title", asset_r15.name);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", asset_r15.name, " ");
} }
function AssetSearchResultsComponent_Conditional_28_For_14_For_5_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "docTypeLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const asset_r15 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, asset_r15.type));
} }
function AssetSearchResultsComponent_Conditional_28_For_14_For_5_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r17 = i0.ɵɵnextContext().$implicit;
    const asset_r15 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.getCellValue(asset_r15, col_r17.key));
} }
function AssetSearchResultsComponent_Conditional_28_For_14_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AssetSearchResultsComponent_Conditional_28_For_14_For_5_Conditional_0_Template, 5, 3, "span", 50)(1, AssetSearchResultsComponent_Conditional_28_For_14_For_5_Conditional_1_Template, 3, 3, "span")(2, AssetSearchResultsComponent_Conditional_28_For_14_For_5_Conditional_2_Template, 2, 1, "span");
} if (rf & 2) {
    const col_r17 = ctx.$implicit;
    i0.ɵɵconditional(col_r17.key === "name" ? 0 : col_r17.key === "type" ? 1 : 2);
} }
function AssetSearchResultsComponent_Conditional_28_For_14_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 49)(1, "span", 33)(2, "mat-checkbox", 23);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function AssetSearchResultsComponent_Conditional_28_For_14_Template_mat_checkbox_click_2_listener($event) { i0.ɵɵrestoreView(_r14); return i0.ɵɵresetView($event.stopPropagation()); })("change", function AssetSearchResultsComponent_Conditional_28_For_14_Template_mat_checkbox_change_2_listener() { const asset_r15 = i0.ɵɵrestoreView(_r14).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.toggleAssetSelection(asset_r15.id)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵrepeaterCreate(4, AssetSearchResultsComponent_Conditional_28_For_14_For_5_Template, 3, 1, null, null, _forTrack1);
    i0.ɵɵelement(6, "span");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const asset_r15 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵstyleProp("grid-template-columns", ctx_r1.gridTemplate());
    i0.ɵɵclassProp("selected", ctx_r1.isAssetSelected(asset_r15.id));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r1.isAssetSelected(asset_r15.id));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(3, 6, "common.select-item", i0.ɵɵpureFunction1(9, _c1, asset_r15.name)));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.visibleColumns());
} }
function AssetSearchResultsComponent_Conditional_28_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 12);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "assets.asset-search-results.no-documents-match-the-search-criteria"), " ");
} }
function AssetSearchResultsComponent_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 14);
    i0.ɵɵconditionalCreate(1, AssetSearchResultsComponent_Conditional_28_Conditional_1_Template, 16, 12);
    i0.ɵɵelementStart(2, "div", 31)(3, "div", 32);
    i0.ɵɵelement(4, "span", 33);
    i0.ɵɵrepeaterCreate(5, AssetSearchResultsComponent_Conditional_28_For_6_Template, 2, 1, null, null, _forTrack1);
    i0.ɵɵelementStart(7, "span", 34)(8, "button", 35);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵlistener("click", function AssetSearchResultsComponent_Conditional_28_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r8); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.openColumnPanel()); });
    i0.ɵɵelementStart(11, "mat-icon");
    i0.ɵɵtext(12, "tune");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵrepeaterCreate(13, AssetSearchResultsComponent_Conditional_28_For_14_Template, 7, 11, "div", 36, _forTrack0);
    i0.ɵɵconditionalCreate(15, AssetSearchResultsComponent_Conditional_28_Conditional_15_Template, 3, 3, "div", 12);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.columnPanelOpen() ? 1 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵstyleProp("grid-template-columns", ctx_r1.gridTemplate());
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.visibleColumns());
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(9, 6, "assets.asset-search-results.manage-columns"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(10, 8, "assets.asset-search-results.manage-columns"));
    i0.ɵɵadvance(5);
    i0.ɵɵrepeater(ctx_r1.sortedAssets());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r1.loading() && ctx_r1.resultCount() === 0 ? 15 : -1);
} }
const ALL_COLUMNS = [
    { key: 'name', labelKey: 'assets.column.name', label: 'Title', width: '280px' },
    { key: 'type', labelKey: 'assets.column.type', label: 'Type', width: '120px' },
    { key: 'modified', labelKey: 'assets.column.modified', label: 'Modified', width: '140px' },
    {
        key: 'contributor',
        labelKey: 'assets.column.contributor',
        label: 'Last contributor',
        width: '180px',
    },
    { key: 'state', labelKey: 'assets.column.state', label: 'State', width: '120px' },
    { key: 'version', labelKey: 'assets.column.version', label: 'Version', width: '100px' },
    { key: 'created', labelKey: 'assets.column.created', label: 'Created', width: '140px' },
    { key: 'author', labelKey: 'assets.column.author', label: 'Author', width: '150px' },
    { key: 'nature', labelKey: 'assets.column.nature', label: 'Nature', width: '140px' },
    { key: 'coverage', labelKey: 'assets.column.coverage', label: 'Coverage', width: '140px' },
    { key: 'subjects', labelKey: 'assets.column.subjects', label: 'Subjects', width: '200px' },
    { key: 'flags', labelKey: 'assets.column.flags', label: 'Flags', width: '120px' },
];
const GRID_SORT_TO_API_FIELD = {
    name: 'dc:title',
    createdDate: 'dc:created',
    modifiedDate: 'dc:modified',
    lastContributor: 'dc:lastContributor',
    state: 'ecm:currentLifeCycleState',
    nature: 'dc:nature',
    coverage: 'dc:coverage',
};
const API_FIELD_TO_GRID_SORT = Object.fromEntries(Object.entries(GRID_SORT_TO_API_FIELD).map(([ui, api]) => [api, ui]));
function buildApiParams(params) {
    const get = (key) => params.get(key)?.split(',').filter(Boolean) ?? [];
    // Get primaryTypes from asset-type param - values are now the actual types (Picture, File, etc.)
    const primaryTypeValues = get('asset-type');
    // Get mimeTypes from asset-format param - values are now the full MIME types
    const mimeTypeValues = get('asset-format');
    const sortBy = params.get('sortBy') ?? undefined;
    const ecmFulltext = params.get('ecm_fulltext')?.trim() || undefined;
    const sortOrderRaw = params.get('sortOrder');
    const sortOrder = sortOrderRaw === 'asc' || sortOrderRaw === 'desc' ? sortOrderRaw : undefined;
    return {
        primaryTypes: primaryTypeValues,
        mimeTypes: mimeTypeValues,
        widths: get('asset-width'),
        heights: get('asset-height'),
        colorProfiles: get('color-profile'),
        colorDepths: get('color-depth'),
        videoDurations: get('video-duration'),
        ecmFulltext,
        sortBy,
        sortOrder,
    };
}
function mapToAssetResult(doc) {
    const props = doc.properties;
    const fileContent = props['file:content'];
    const mime = fileContent?.['mime-type'] ?? '';
    const format = mime.split('/')[1]?.split('+')[0] ?? '';
    const widthPx = Number(props['imd:pixel_xdimension'] ?? NaN);
    const heightPx = Number(props['imd:pixel_ydimension'] ?? NaN);
    const vidInfo = props['vid:info'];
    const videoDurationSec = Number(vidInfo?.duration ?? NaN);
    return {
        id: doc.uid,
        name: doc.title,
        type: doc.type,
        format,
        mimeType: mime,
        modifiedDate: doc.lastModified?.slice(0, 10) ?? '',
        lastContributor: props['dc:lastContributor'] ?? '',
        icon: docTypeIcon(doc.type),
        widthPx: Number.isFinite(widthPx)
            ? widthPx
            : Number.isFinite(Number(vidInfo?.width))
                ? Number(vidInfo?.width)
                : undefined,
        heightPx: Number.isFinite(heightPx)
            ? heightPx
            : Number.isFinite(Number(vidInfo?.height))
                ? Number(vidInfo?.height)
                : undefined,
        videoDurationSec: Number.isFinite(videoDurationSec) ? videoDurationSec : undefined,
        createdDate: (props['dc:created'] ?? '').slice(0, 10) || undefined,
        author: props['dc:creator'] ?? undefined,
        nature: props['dc:nature'] ?? undefined,
        coverage: props['dc:coverage'] ?? undefined,
        subjects: (props['dc:subjects'] ?? []).join(', ') || undefined,
    };
}
const DIMENSION_BUCKET_KEYS = [
    'to_500_px',
    'from_500_to_1500_px',
    'from_1500_to_2000_px',
    'from_2000_px',
];
function mergeComputedAggregations(documents, mappedAssets, apiAggregations) {
    const aggregations = { ...(apiAggregations ?? {}) };
    // Fallback for dynamic groups when API aggregations are missing.
    if (!aggregations.system_primaryType_agg) {
        const typeMap = new Map();
        documents.forEach((doc) => {
            typeMap.set(doc.type, (typeMap.get(doc.type) ?? 0) + 1);
        });
        aggregations.system_primaryType_agg = {
            buckets: Array.from(typeMap).map(([key, count]) => ({ key, docCount: count })),
        };
    }
    if (!aggregations.system_mimetype_agg) {
        const mimeMap = new Map();
        documents.forEach((doc) => {
            const props = doc.properties;
            const fileContent = props['file:content'];
            const mime = fileContent?.['mime-type'];
            if (mime) {
                mimeMap.set(mime, (mimeMap.get(mime) ?? 0) + 1);
            }
        });
        aggregations.system_mimetype_agg = {
            buckets: Array.from(mimeMap).map(([key, count]) => ({ key, docCount: count })),
        };
    }
    // Always compute width/height buckets from returned assets so filter counts
    // reflect the current result set.
    const widthCounts = new Map(DIMENSION_BUCKET_KEYS.map((key) => [key, 0]));
    const heightCounts = new Map(DIMENSION_BUCKET_KEYS.map((key) => [key, 0]));
    mappedAssets.forEach((asset) => {
        const widthBucket = DIMENSION_BUCKET_KEYS.find((bucket) => inWidthBucket(asset.widthPx, bucket));
        if (widthBucket) {
            widthCounts.set(widthBucket, (widthCounts.get(widthBucket) ?? 0) + 1);
        }
        const heightBucket = DIMENSION_BUCKET_KEYS.find((bucket) => inHeightBucket(asset.heightPx, bucket));
        if (heightBucket) {
            heightCounts.set(heightBucket, (heightCounts.get(heightBucket) ?? 0) + 1);
        }
    });
    aggregations.asset_width_agg = {
        buckets: DIMENSION_BUCKET_KEYS.map((key) => ({ key, docCount: widthCounts.get(key) ?? 0 })),
    };
    aggregations.asset_height_agg = {
        buckets: DIMENSION_BUCKET_KEYS.map((key) => ({ key, docCount: heightCounts.get(key) ?? 0 })),
    };
    return aggregations;
}
function inWidthBucket(width, bucket) {
    if (width === undefined)
        return false;
    switch (bucket) {
        case 'to_500_px':
            return width < 500;
        case 'from_500_to_1500_px':
            return width >= 500 && width <= 1500;
        case 'from_1500_to_2000_px':
            return width >= 1500 && width <= 2000;
        case 'from_2000_px':
            return width > 2000;
        default:
            return false;
    }
}
function inHeightBucket(height, bucket) {
    if (height === undefined)
        return false;
    switch (bucket) {
        case 'to_500_px':
            return height < 500;
        case 'from_500_to_1500_px':
            return height >= 500 && height <= 1500;
        case 'from_1500_to_2000_px':
            return height >= 1500 && height <= 2000;
        case 'from_2000_px':
            return height > 2000;
        default:
            return false;
    }
}
function inVideoDurationBucket(durationSec, bucket) {
    if (durationSec === undefined)
        return false;
    switch (bucket) {
        case 'to_30_s':
            return durationSec < 30;
        case 'from_30_to_180_s':
            return durationSec >= 30 && durationSec <= 180;
        case 'from_180_to_600_s':
            return durationSec > 180 && durationSec <= 600;
        case 'from_600_to_1800_s':
            return durationSec > 600 && durationSec <= 1800;
        case 'from_1800_s':
            return durationSec > 1800;
        default:
            return false;
    }
}
export class AssetSearchResultsComponent {
    translate = inject(TranslateService);
    route = inject(ActivatedRoute);
    router = inject(Router);
    destroyRef = inject(DestroyRef);
    assetService = inject(AssetService);
    aggregationService = inject(AssetAggregationService);
    documentDetailService = inject(DocumentDetailService);
    dialog = inject(MatDialog);
    snackBar = inject(MatSnackBar);
    searchService = inject(SearchService);
    selectionService = inject(SelectionService);
    thumbnailMap = signal({}, ...(ngDevMode ? [{ debugName: "thumbnailMap" }] : []));
    thumbnailGeneration = 0;
    queryParams = toSignal(this.route.queryParamMap, { requireSync: true });
    loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
    selectedSavedSearchId = this.aggregationService.selectedSavedSearchId;
    selectedSavedSearchTitle = this.aggregationService.selectedSavedSearchTitle;
    deletingSavedSearch = signal(false, ...(ngDevMode ? [{ debugName: "deletingSavedSearch" }] : []));
    assets$ = this.route.queryParamMap.pipe(tap(() => {
        this.loading.set(true);
        this.error.set(null);
        this.beginThumbnailBatch();
    }), switchMap((params) => this.assetService.searchAssets(buildApiParams(params)).pipe(map((result) => {
        const mapped = result.entries.map(mapToAssetResult);
        const aggs = mergeComputedAggregations(result.entries, mapped, result.aggregations);
        this.aggregationService.aggregations.set(aggs);
        this.aggregationService.items.set(mapped.map((asset) => ({
            id: asset.id,
            title: asset.name,
            type: asset.type,
            icon: asset.icon,
        })));
        this.loadThumbnails(mapped);
        return mapped;
    }), catchError(() => {
        this.error.set(this.translate.instant('assets.message.failed-to-load-assets'));
        return of([]);
    }), tap(() => this.loading.set(false)))));
    assets = toSignal(this.assets$, { initialValue: [] });
    viewMode = signal('list', ...(ngDevMode ? [{ debugName: "viewMode" }] : []));
    allColumns = ALL_COLUMNS;
    visibleColumnKeys = signal(['name', 'modified', 'contributor'], ...(ngDevMode ? [{ debugName: "visibleColumnKeys" }] : []));
    sortColumn = signal(null, ...(ngDevMode ? [{ debugName: "sortColumn" }] : []));
    sortDirection = signal(null, ...(ngDevMode ? [{ debugName: "sortDirection" }] : []));
    gridGroupBy = signal('createdDate', ...(ngDevMode ? [{ debugName: "gridGroupBy" }] : []));
    gridSortOrder = signal('asc', ...(ngDevMode ? [{ debugName: "gridSortOrder" }] : []));
    constructor() {
        this.destroyRef.onDestroy(() => this.clearThumbnails());
        effect(() => {
            const params = this.queryParams();
            const apiSortBy = params.get('sortBy') ?? 'dc:created';
            const uiSortBy = API_FIELD_TO_GRID_SORT[apiSortBy] ?? 'createdDate';
            const sortOrder = params.get('sortOrder') === 'desc' ? 'desc' : 'asc';
            this.gridGroupBy.set(uiSortBy);
            this.gridSortOrder.set(sortOrder);
        });
    }
    visibleColumns = computed(() => ALL_COLUMNS.filter((c) => this.visibleColumnKeys().includes(c.key)), ...(ngDevMode ? [{ debugName: "visibleColumns" }] : []));
    gridTemplate = computed(() => ['40px', ...this.visibleColumns().map((c) => `minmax(${c.width}, 1fr)`), '40px'].join(' '), ...(ngDevMode ? [{ debugName: "gridTemplate" }] : []));
    openAsset(asset) {
        void this.router.navigate(['/doc', asset.id]);
    }
    getCellValue(asset, key) {
        switch (key) {
            case 'type':
                return asset.type;
            case 'modified':
                return asset.modifiedDate;
            case 'contributor':
                return asset.lastContributor;
            case 'state':
                return asset.state ?? '—';
            case 'version':
                return asset.version ?? '—';
            case 'created':
                return asset.createdDate ?? '—';
            case 'author':
                return asset.author ?? '—';
            case 'nature':
                return asset.nature ?? '—';
            case 'coverage':
                return asset.coverage ?? '—';
            case 'subjects':
                return asset.subjects ?? '—';
            case 'flags':
                return asset.flags ?? '—';
            default:
                return '';
        }
    }
    isAssetSelected(id) {
        return this.selectionService.isSelected(id);
    }
    toggleAssetSelection(id) {
        const asset = this.filteredAssets().find((a) => a.id === id);
        this.selectionService.toggle(id, asset?.name ?? id, this.thumbnailMap()[id] ?? null);
    }
    toggleAll() {
        if (this.isAllSelected()) {
            this.selectionService.clear();
        }
        else {
            const assets = this.filteredAssets();
            const labels = {};
            const previews = {};
            assets.forEach((asset) => {
                labels[asset.id] = asset.name;
                previews[asset.id] = this.thumbnailMap()[asset.id] ?? null;
            });
            this.selectionService.selectAll(assets.map((a) => a.id), labels, previews);
        }
    }
    deleteSelected() {
        this.selectionService
            .deleteSelected()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: () => this.router.navigate([], { relativeTo: this.route, queryParamsHandling: 'merge' }),
        });
    }
    clearSelection() {
        this.selectionService.clear();
    }
    columnPanelOpen = signal(false, ...(ngDevMode ? [{ debugName: "columnPanelOpen" }] : []));
    pendingColumnKeys = signal(['name', 'modified', 'contributor'], ...(ngDevMode ? [{ debugName: "pendingColumnKeys" }] : []));
    columnsForPanel = ALL_COLUMNS;
    isPendingColumn(key) {
        return this.pendingColumnKeys().includes(key);
    }
    togglePendingColumn(key) {
        const current = this.pendingColumnKeys();
        if (current.includes(key)) {
            this.pendingColumnKeys.set(current.filter((k) => k !== key));
        }
        else {
            const ordered = ALL_COLUMNS.map((c) => c.key);
            this.pendingColumnKeys.set(ordered.filter((k) => [...current, key].includes(k)));
        }
    }
    openColumnPanel() {
        this.pendingColumnKeys.set(this.visibleColumnKeys());
        this.columnPanelOpen.set(true);
    }
    closeColumnPanel() {
        this.columnPanelOpen.set(false);
    }
    resetColumns() {
        this.pendingColumnKeys.set(['name', 'modified', 'contributor']);
    }
    applyColumns() {
        this.visibleColumnKeys.set(ALL_COLUMNS.map((c) => c.key).filter((k) => this.pendingColumnKeys().includes(k)));
        this.columnPanelOpen.set(false);
    }
    filteredAssets = computed(() => {
        const params = this.queryParams();
        const getSelected = (key) => new Set(params.get(key)?.split(',').filter(Boolean) ?? []);
        const selectedTypes = getSelected('asset-type');
        const selectedFormats = getSelected('asset-format');
        const selectedWidths = getSelected('asset-width');
        const selectedHeights = getSelected('asset-height');
        const selectedVideoDurations = getSelected('video-duration');
        return this.assets().filter((asset) => {
            if (selectedTypes.size > 0 && !selectedTypes.has(asset.type)) {
                return false;
            }
            if (selectedFormats.size > 0 && !selectedFormats.has(asset.mimeType)) {
                return false;
            }
            if (selectedWidths.size > 0 &&
                !Array.from(selectedWidths).some((bucket) => inWidthBucket(asset.widthPx, bucket))) {
                return false;
            }
            if (selectedHeights.size > 0 &&
                !Array.from(selectedHeights).some((bucket) => inHeightBucket(asset.heightPx, bucket))) {
                return false;
            }
            if (selectedVideoDurations.size > 0 &&
                !Array.from(selectedVideoDurations).some((bucket) => inVideoDurationBucket(asset.videoDurationSec, bucket))) {
                return false;
            }
            return true;
        });
    }, ...(ngDevMode ? [{ debugName: "filteredAssets" }] : []));
    sortedAssets = computed(() => {
        const assets = [...this.filteredAssets()];
        const col = this.sortColumn();
        const dir = this.sortDirection();
        if (!col || !dir)
            return assets;
        return assets.sort((a, b) => {
            let aVal = '';
            let bVal = '';
            switch (col) {
                case 'name':
                    aVal = a.name;
                    bVal = b.name;
                    break;
                case 'modified':
                    aVal = a.modifiedDate;
                    bVal = b.modifiedDate;
                    break;
                case 'contributor':
                    aVal = a.lastContributor;
                    bVal = b.lastContributor;
                    break;
            }
            return dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });
    }, ...(ngDevMode ? [{ debugName: "sortedAssets" }] : []));
    gridAssets = computed(() => {
        const assets = [...this.filteredAssets()];
        const col = this.gridGroupBy();
        const dir = this.gridSortOrder();
        return assets.sort((a, b) => {
            let aVal = '';
            let bVal = '';
            switch (col) {
                case 'name':
                    aVal = a.name;
                    bVal = b.name;
                    break;
                case 'createdDate':
                    aVal = a.createdDate ?? '';
                    bVal = b.createdDate ?? '';
                    break;
                case 'modifiedDate':
                    aVal = a.modifiedDate;
                    bVal = b.modifiedDate;
                    break;
                case 'lastContributor':
                    aVal = a.lastContributor;
                    bVal = b.lastContributor;
                    break;
                case 'state':
                    aVal = a.state ?? '';
                    bVal = b.state ?? '';
                    break;
                case 'nature':
                    aVal = a.nature ?? '';
                    bVal = b.nature ?? '';
                    break;
                case 'coverage':
                    aVal = a.coverage ?? '';
                    bVal = b.coverage ?? '';
                    break;
            }
            return dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });
    }, ...(ngDevMode ? [{ debugName: "gridAssets" }] : []));
    setGridGroupBy(value) {
        this.gridGroupBy.set(value);
        this.gridSortOrder.set('asc');
        const apiFieldName = GRID_SORT_TO_API_FIELD[value] ?? null;
        void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                sortBy: apiFieldName,
                sortOrder: 'asc',
            },
            queryParamsHandling: 'merge',
        });
    }
    setGridSortOrder(direction) {
        this.gridSortOrder.set(direction);
        const apiFieldName = GRID_SORT_TO_API_FIELD[this.gridGroupBy()] ?? null;
        void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                sortBy: apiFieldName,
                sortOrder: direction,
            },
            queryParamsHandling: 'merge',
        });
    }
    SORTABLE_COLUMNS = new Set(['name', 'modified', 'contributor']);
    sortBy(col) {
        if (!this.SORTABLE_COLUMNS.has(col))
            return;
        if (this.sortColumn() === col) {
            if (this.sortDirection() === 'asc')
                this.sortDirection.set('desc');
            else if (this.sortDirection() === 'desc') {
                this.sortColumn.set(null);
                this.sortDirection.set(null);
            }
        }
        else {
            this.sortColumn.set(col);
            this.sortDirection.set('asc');
        }
    }
    resultCount = computed(() => this.filteredAssets().length, ...(ngDevMode ? [{ debugName: "resultCount" }] : []));
    selectedCount = computed(() => this.selectionService.selectedCount(), ...(ngDevMode ? [{ debugName: "selectedCount" }] : []));
    isAllSelected = computed(() => {
        const assets = this.filteredAssets();
        return this.selectionService.isAllSelected(assets.map((a) => a.id));
    }, ...(ngDevMode ? [{ debugName: "isAllSelected" }] : []));
    isIndeterminate = computed(() => {
        const assets = this.filteredAssets();
        return this.selectionService.isIndeterminate(assets.map((a) => a.id));
    }, ...(ngDevMode ? [{ debugName: "isIndeterminate" }] : []));
    setViewMode(mode) {
        this.viewMode.set(mode);
    }
    exportCsv() {
        const headers = [
            'Title',
            'Type',
            'Modified',
            'Last Contributor',
            'State',
            'Version',
            'Created',
            'Author',
            'Nature',
            'Coverage',
            'Subjects',
            'Flags',
        ];
        const escape = (value) => `"${value.replaceAll('"', '""')}"`;
        const rows = this.filteredAssets().map((a) => [
            a.name,
            a.type,
            a.modifiedDate,
            a.lastContributor,
            a.state ?? '',
            a.version ?? '',
            a.createdDate ?? '',
            a.author ?? '',
            a.nature ?? '',
            a.coverage ?? '',
            a.subjects ?? '',
            a.flags ?? '',
        ]);
        const csv = [headers, ...rows]
            .map((r) => r.map((cell) => escape(cell ?? '')).join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'assets.csv';
        anchor.click();
        URL.revokeObjectURL(url);
    }
    openSaveAsDialog() {
        this.dialog
            .open(SavedSearchDialogComponent, {
            data: {
                title: this.translate.instant('ui.saved-search'),
                placeholder: this.translate.instant('saved-search.dialog.name-placeholder'),
            },
        })
            .afterClosed()
            .subscribe((title) => {
            const trimmedTitle = title?.trim();
            if (!trimmedTitle)
                return;
            this.searchService
                .saveSavedSearch({
                title: trimmedTitle,
                params: this.buildSavedSearchParamsFromQuery(),
                pageProviderName: 'assets_search',
            })
                .subscribe({
                next: (saved) => {
                    this.aggregationService.selectedSavedSearchId.set(this.readSavedSearchId(saved));
                    this.aggregationService.selectedSavedSearchTitle.set(this.readSavedSearchTitle(saved) || trimmedTitle);
                    this.aggregationService.markSavedSearchDirty();
                    this.snackBar.open(this.translate.instant('common.search-saved', { name: trimmedTitle }), this.translate.instant('common.ok'), { duration: 3000 });
                },
                error: () => {
                    this.snackBar.open(this.translate.instant('assets.message.failed-to-save-search'), this.translate.instant('common.dismiss'), { duration: 5000 });
                },
            });
        });
    }
    hasSelectedSavedSearch() {
        return this.selectedSavedSearchId().trim().length > 0;
    }
    hasSavableFilters() {
        return Object.keys(this.buildSavedSearchParamsFromQuery()).length > 0;
    }
    onSaveSelectedSavedSearch() {
        const id = this.selectedSavedSearchId().trim();
        if (!id)
            return;
        const currentTitle = this.selectedSavedSearchTitle().trim() || this.translate.instant('ui.saved-search');
        this.searchService
            .updateSavedSearch(id, {
            title: currentTitle,
            params: this.buildSavedSearchParamsFromQuery(),
            pageProviderName: 'assets_search',
        })
            .subscribe({
            next: () => {
                this.aggregationService.selectedSavedSearchTitle.set(currentTitle);
                this.aggregationService.markSavedSearchDirty();
                this.snackBar.open(this.translate.instant('common.search-updated', { name: currentTitle }), this.translate.instant('common.ok'), { duration: 3000 });
            },
            error: () => {
                this.snackBar.open(this.translate.instant('assets.message.failed-to-save-search'), this.translate.instant('common.dismiss'), { duration: 5000 });
            },
        });
    }
    onEditSelectedSavedSearch() {
        const id = this.selectedSavedSearchId().trim();
        if (!id)
            return;
        this.dialog
            .open(SavedSearchDialogComponent, {
            data: {
                title: this.translate.instant('ui.edit-saved-search'),
                placeholder: this.translate.instant('saved-search.dialog.name-placeholder'),
                initialValue: this.selectedSavedSearchTitle(),
            },
        })
            .afterClosed()
            .subscribe((title) => {
            const trimmedTitle = title?.trim();
            if (!trimmedTitle)
                return;
            this.searchService
                .updateSavedSearch(id, {
                title: trimmedTitle,
                params: this.buildSavedSearchParamsFromQuery(),
                pageProviderName: 'assets_search',
            })
                .subscribe({
                next: () => {
                    this.aggregationService.selectedSavedSearchTitle.set(trimmedTitle);
                    this.aggregationService.markSavedSearchDirty();
                    this.snackBar.open(this.translate.instant('common.search-updated', { name: trimmedTitle }), this.translate.instant('common.ok'), {
                        duration: 3000,
                    });
                },
                error: () => {
                    this.snackBar.open(this.translate.instant('assets.message.failed-to-update-search'), this.translate.instant('common.dismiss'), { duration: 5000 });
                },
            });
        });
    }
    onShareSelectedSavedSearch() {
        const id = this.selectedSavedSearchId().trim();
        if (!id)
            return;
        this.dialog.open(ShareSavedSearchDialogComponent, {
            width: '95vw',
            maxWidth: '1080px',
            data: {
                title: this.selectedSavedSearchTitle().trim() || this.translate.instant('ui.saved-search'),
                id,
            },
        });
    }
    onDeleteSelectedSavedSearch() {
        const id = this.selectedSavedSearchId().trim();
        if (!id || this.deletingSavedSearch())
            return;
        const title = this.selectedSavedSearchTitle().trim() || 'this saved search';
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: this.translate.instant('confirm.delete-saved-search'),
                message: this.translate.instant('confirm.delete-saved-search-named', { name: title }),
                confirmLabel: this.translate.instant('confirm.delete'),
            },
        });
        dialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((confirmed) => {
            if (!confirmed)
                return;
            this.deletingSavedSearch.set(true);
            this.searchService
                .deleteSavedSearch(id)
                .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.deletingSavedSearch.set(false)))
                .subscribe({
                next: () => {
                    this.aggregationService.selectedSavedSearchId.set('');
                    this.aggregationService.selectedSavedSearchTitle.set('');
                    this.aggregationService.markSavedSearchDirty();
                    void this.router.navigate(['/documents'], {
                        queryParams: {
                            'asset-type': null,
                            'asset-format': null,
                            'asset-width': null,
                            'asset-height': null,
                            'color-profile': null,
                            'color-depth': null,
                            'video-duration': null,
                            ecm_fulltext: null,
                        },
                    });
                },
                error: (error) => {
                    console.error('Failed to delete saved search.', error);
                },
            });
        });
    }
    buildSavedSearchParamsFromQuery() {
        const params = this.queryParams();
        const keys = [
            'asset-type',
            'asset-format',
            'asset-width',
            'asset-height',
            'color-profile',
            'color-depth',
            'video-duration',
            'ecm_fulltext',
        ];
        const saved = {};
        for (const key of keys) {
            const value = params.get(key)?.trim();
            if (value)
                saved[key] = value;
        }
        return saved;
    }
    readSavedSearchId(saved) {
        if (!saved || typeof saved !== 'object')
            return '';
        const obj = saved;
        return typeof obj['id'] === 'string' ? obj['id'] : '';
    }
    readSavedSearchTitle(saved) {
        if (!saved || typeof saved !== 'object')
            return '';
        const obj = saved;
        return typeof obj['title'] === 'string' ? obj['title'] : '';
    }
    loadThumbnails(assets) {
        // Mint a new generation rather than reading the current one — two overlapping asset searches
        // could otherwise both capture the generation set by one `beginThumbnailBatch()`, letting the
        // first search's late callbacks pass the guard and reappear after the second cleared them.
        const generation = ++this.thumbnailGeneration;
        this.clearThumbnails();
        for (const asset of assets) {
            this.documentDetailService
                .fetchThumbnail(asset.id)
                .pipe(catchError(() => of(null)), takeUntilDestroyed(this.destroyRef))
                .subscribe((blob) => {
                if (!blob || generation !== this.thumbnailGeneration)
                    return;
                const url = URL.createObjectURL(blob);
                this.thumbnailMap.update((m) => {
                    const previous = m[asset.id];
                    if (previous && previous !== url)
                        URL.revokeObjectURL(previous);
                    return {
                        ...m,
                        [asset.id]: url,
                    };
                });
            });
        }
    }
    beginThumbnailBatch() {
        this.thumbnailGeneration += 1;
    }
    clearThumbnails() {
        // Drop the selection layer's copies FIRST. It retains these exact strings and binds them into
        // `<img [src]>` in the shell topbar, and selection survives a new search — so revoking without
        // this leaves selected items pointing at revoked blob URLs. See `SelectionService.forgetPreviews`.
        this.selectionService.forgetPreviews();
        for (const url of Object.values(this.thumbnailMap()))
            if (url)
                URL.revokeObjectURL(url);
        this.thumbnailMap.set({});
    }
    static ɵfac = function AssetSearchResultsComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AssetSearchResultsComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AssetSearchResultsComponent, selectors: [["lib-asset-search-results"]], decls: 29, vars: 33, consts: [["resultsActionsMenu", "matMenu"], [1, "results-page"], [1, "results-top-actions"], ["mat-flat-button", "", "color", "primary", "type", "button", 1, "top-action-btn", "save-as-btn"], ["mat-flat-button", "", "type", "button", 1, "top-action-btn", "save-btn"], [1, "results-toolbar"], [1, "results-count"], [1, "toolbar-actions"], ["mat-icon-button", "", 1, "toolbar-btn", 3, "click", "matTooltip"], [1, "results-content"], [1, "results-loading"], [1, "results-error"], [1, "results-empty"], [1, "asset-grid"], [1, "list-wrapper"], ["mat-flat-button", "", "color", "primary", "type", "button", 1, "top-action-btn", "save-as-btn", 3, "click"], ["mat-flat-button", "", "type", "button", 1, "top-action-btn", "save-btn", 3, "click"], ["mat-icon-button", "", "type", "button", 3, "matMenuTriggerFor"], ["mat-menu-item", "", "type", "button", 3, "click"], ["diameter", "32"], [1, "asset-card", 3, "selected"], [1, "asset-card"], [1, "grid-card-checkbox", "col-hover-select"], [3, "click", "change", "checked"], [1, "asset-card-thumbnail"], ["alt", "", 1, "asset-thumbnail-image", 3, "src"], [1, "asset-icon"], [1, "asset-card-body"], [1, "asset-card-head"], ["type", "button", 1, "asset-card-name", 3, "click", "title"], [1, "asset-type-pill", 3, "title"], [1, "asset-list"], [1, "list-header"], [1, "col-checkbox"], [1, "col-gear"], ["mat-icon-button", "", 1, "gear-btn", 3, "click", "matTooltip"], [1, "list-row", 3, "selected", "grid-template-columns"], ["type", "button", 1, "col-panel-backdrop", 3, "click", "keydown.escape"], [1, "col-panel"], [1, "col-panel-title"], [1, "col-panel-list"], [1, "col-panel-option", 3, "checked"], [1, "col-panel-actions"], ["mat-button", "", 3, "click"], ["mat-flat-button", "", "color", "primary", 3, "click"], [1, "col-panel-option", 3, "change", "checked"], ["type", "button", 1, "col-sortable", 3, "col-name"], ["type", "button", 1, "col-sortable", 3, "click"], [1, "sort-icon"], [1, "list-row"], [1, "col-name"], ["alt", "", 1, "row-thumbnail-image", 3, "src"], [1, "row-icon"], ["type", "button", 1, "row-name-text", 3, "click", "title"]], template: function AssetSearchResultsComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 1)(1, "div", 2);
            i0.ɵɵconditionalCreate(2, AssetSearchResultsComponent_Conditional_2_Template, 5, 3, "button", 3);
            i0.ɵɵconditionalCreate(3, AssetSearchResultsComponent_Conditional_3_Template, 3, 3, "button", 4);
            i0.ɵɵconditionalCreate(4, AssetSearchResultsComponent_Conditional_4_Template, 15, 13);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "div", 5);
            i0.ɵɵconditionalCreate(6, AssetSearchResultsComponent_Conditional_6_Template, 3, 6, "span", 6);
            i0.ɵɵelementStart(7, "div", 7)(8, "button", 8);
            i0.ɵɵpipe(9, "translate");
            i0.ɵɵpipe(10, "translate");
            i0.ɵɵlistener("click", function AssetSearchResultsComponent_Template_button_click_8_listener() { return ctx.exportCsv(); });
            i0.ɵɵelementStart(11, "mat-icon");
            i0.ɵɵtext(12, "download");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(13, "button", 8);
            i0.ɵɵpipe(14, "translate");
            i0.ɵɵpipe(15, "translate");
            i0.ɵɵlistener("click", function AssetSearchResultsComponent_Template_button_click_13_listener() { return ctx.setViewMode("grid"); });
            i0.ɵɵelementStart(16, "mat-icon");
            i0.ɵɵtext(17, "grid_view");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(18, "button", 8);
            i0.ɵɵpipe(19, "translate");
            i0.ɵɵpipe(20, "translate");
            i0.ɵɵlistener("click", function AssetSearchResultsComponent_Template_button_click_18_listener() { return ctx.setViewMode("list"); });
            i0.ɵɵelementStart(21, "mat-icon");
            i0.ɵɵtext(22, "view_list");
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(23, "main", 9);
            i0.ɵɵconditionalCreate(24, AssetSearchResultsComponent_Conditional_24_Template, 3, 3, "div", 10);
            i0.ɵɵconditionalCreate(25, AssetSearchResultsComponent_Conditional_25_Template, 2, 1, "div", 11);
            i0.ɵɵconditionalCreate(26, AssetSearchResultsComponent_Conditional_26_Template, 3, 3, "div", 12);
            i0.ɵɵconditionalCreate(27, AssetSearchResultsComponent_Conditional_27_Template, 3, 0, "div", 13);
            i0.ɵɵconditionalCreate(28, AssetSearchResultsComponent_Conditional_28_Template, 16, 10, "div", 14);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.hasSavableFilters() ? 2 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.hasSelectedSavedSearch() ? 3 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.hasSelectedSavedSearch() ? 4 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.resultCount() > 0 ? 6 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(9, 21, "assets.asset-search-results.export-csv"));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(10, 23, "assets.asset-search-results.export-csv"));
            i0.ɵɵadvance(5);
            i0.ɵɵclassProp("active", ctx.viewMode() === "grid");
            i0.ɵɵproperty("matTooltip", ctx.viewMode() === "list" ? i0.ɵɵpipeBind1(14, 25, "assets.switch-to-grid-view") : "");
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(15, 27, "assets.asset-search-results.grid-view"))("aria-pressed", ctx.viewMode() === "grid");
            i0.ɵɵadvance(5);
            i0.ɵɵclassProp("active", ctx.viewMode() === "list");
            i0.ɵɵproperty("matTooltip", ctx.viewMode() === "grid" ? i0.ɵɵpipeBind1(19, 29, "assets.switch-to-table-view") : "");
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(20, 31, "assets.asset-search-results.table-view"))("aria-pressed", ctx.viewMode() === "list");
            i0.ɵɵadvance(6);
            i0.ɵɵconditional(ctx.loading() ? 24 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.error() ? 25 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.loading() && !ctx.error() && ctx.resultCount() === 0 && ctx.viewMode() === "grid" ? 26 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.loading() && !ctx.error() && ctx.viewMode() === "grid" && ctx.resultCount() > 0 ? 27 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.loading() && !ctx.error() && ctx.viewMode() === "list" ? 28 : -1);
        } }, dependencies: [MatButtonModule, i1.MatButton, i1.MatIconButton, MatMenuModule, i2.MatMenu, i2.MatMenuItem, i2.MatMenuTrigger, MatIconModule, i3.MatIcon, MatTooltipModule, i4.MatTooltip, MatCheckboxModule, i5.MatCheckbox, MatProgressSpinnerModule, i6.MatProgressSpinner, MatSelectModule,
            MatSnackBarModule,
            DocTypeLabelPipe,
            DescriptorLabelPipe,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  height: 100%;\n}\n\n.results-page[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  padding: 16px 24px;\n  box-sizing: border-box;\n}\n\n.results-top-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 8px;\n  flex-shrink: 0;\n}\n\n.top-action-btn[_ngcontent-%COMP%] {\n  min-width: 88px;\n}\n\n.results-top-actions[_ngcontent-%COMP%]   .save-as-btn[_ngcontent-%COMP%] {\n  background: var(--mat-sys-primary, #3f51b5);\n  color: #fff;\n}\n\n.results-top-actions[_ngcontent-%COMP%]   .save-btn[_ngcontent-%COMP%] {\n  background: #43a047;\n  color: #fff;\n}\n\n\n\n.results-toolbar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 16px;\n  flex-shrink: 0;\n}\n\n.results-count[_ngcontent-%COMP%] {\n  font-size: 15px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n}\n\n.toolbar-actions[_ngcontent-%COMP%] {\n  display: flex;\n  margin-left: auto;\n  align-items: center;\n  gap: 4px;\n}\n\n.toolbar-btn[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  width: 36px;\n  height: 36px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-high, #eef0f4);\n  }\n\n  &.active {\n    color: var(--mat-sys-primary, #5c6bc0);\n    background: var(--mat-sys-primary-container, #e8def8);\n    border-radius: 8px;\n  }\n}\n\n\n\n.content-wrapper[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 16px;\n  flex: 1;\n  overflow: hidden;\n}\n\n\n\n.filters-sidebar[_ngcontent-%COMP%] {\n  width: 280px;\n  background: #fafafa;\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  flex-shrink: 0;\n}\n\n.filters-header[_ngcontent-%COMP%] {\n  padding: 12px 16px;\n  border-bottom: 1px solid #e8e8e8;\n  flex-shrink: 0;\n}\n\n.filters-title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 13px;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  color: #999;\n}\n\n.filters-content[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n}\n\n.filter-group[_ngcontent-%COMP%] {\n  border-bottom: 1px solid #f5f5f5;\n}\n\n.filter-btn[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  width: 100%;\n  padding: 10px 16px;\n  background: none;\n  border: none;\n  cursor: pointer;\n  text-align: left;\n  color: #333;\n  font-size: 14px;\n\n  &:hover {\n    background: #f5f5f5;\n  }\n}\n\n.filter-btn-label[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 500;\n}\n\n.filter-btn-icon[_ngcontent-%COMP%] {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: #666;\n  flex-shrink: 0;\n}\n\n.filter-options[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  padding: 8px 0;\n  gap: 0;\n}\n\n.filter-checkbox[_ngcontent-%COMP%] {\n  padding: 0 16px;\n  margin: 4px 0;\n  font-size: 13px;\n  line-height: 1.4;\n  word-break: break-word;\n}\n\n.filter-no-results[_ngcontent-%COMP%] {\n  padding: 8px 16px;\n  font-size: 12px;\n  color: #999;\n  font-style: italic;\n}\n\n\n\n.results-content[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  min-width: 0;\n  min-height: 0;\n}\n\n\n\n.results-loading[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.results-error[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: #d32f2f;\n  font-size: 14px;\n}\n\n.results-empty[_ngcontent-%COMP%] {\n  padding: 32px 16px;\n  text-align: center;\n  color: #888;\n  font-size: 14px;\n}\n\n\n\n.grid-actions-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: flex-start;\n  padding: 12px 0;\n  margin-bottom: 12px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  flex-shrink: 0;\n}\n\n.grid-actions-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.grid-select[_ngcontent-%COMP%] {\n  min-width: 200px;\n  font-size: 14px;\n}\n\n.grid-select-all[_ngcontent-%COMP%] {\n  margin-right: 4px;\n}\n\n.action-btn[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n}\n\n.asset-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));\n  align-content: start;\n  gap: 16px;\n  overflow-y: auto;\n  flex: 1;\n  min-height: 0;\n  padding-bottom: 16px;\n}\n\n.asset-card[_ngcontent-%COMP%] {\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  overflow: hidden;\n  background: #fff;\n  display: flex;\n  flex-direction: column;\n  cursor: pointer;\n  font: inherit;\n  text-align: left;\n  padding: 0;\n  transition:\n    box-shadow 0.15s ease,\n    background-color 0.15s ease;\n  position: relative;\n\n  &:hover {\n    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);\n\n    .grid-card-checkbox {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n\n  &.selected {\n    background: var(--mat-sys-primary-container, #e8def8);\n    border-color: var(--mat-sys-primary, #5c6bc0);\n\n    .grid-card-checkbox {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n}\n\n.grid-card-checkbox[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 8px;\n  left: 8px;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n  z-index: 2;\n}\n\n.asset-card-thumbnail[_ngcontent-%COMP%] {\n  position: relative;\n  height: 120px;\n  width: 100%;\n  background: #f5f5f5;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 8px 8px 0 0;\n  overflow: hidden;\n  flex-shrink: 0;\n}\n\n.asset-card-body[_ngcontent-%COMP%] {\n  padding: 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  min-height: 0;\n  overflow: hidden;\n}\n\n.asset-card-head[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 6px;\n  min-width: 0;\n}\n\n.asset-card-name[_ngcontent-%COMP%] {\n  \n\n\n\n  appearance: none;\n  border: 0;\n  background: none;\n  padding: 0;\n  font: inherit;\n  color: inherit;\n  text-align: left;\n  cursor: pointer;\n  flex: 1;\n  min-width: 0;\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--mat-sys-on-surface);\n  margin: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  width: 100%;\n}\n\n.asset-type-pill[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: 2px 8px;\n  border-radius: 999px;\n  background: var(--mat-sys-surface-container-high, #eef0f4);\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  font-size: 11px;\n  font-weight: 600;\n  line-height: 1;\n  max-width: 120px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.asset-icon[_ngcontent-%COMP%] {\n  font-size: 48px;\n  width: 48px;\n  height: 48px;\n  color: #bdbdbd;\n}\n\n.asset-thumbnail-image[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: contain;\n  display: block;\n  position: absolute;\n  inset: 0;\n}\n\n\n\n.list-wrapper[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  position: relative;\n  overflow: hidden;\n  min-height: 0;\n  padding-bottom: 24px;\n}\n\n.asset-list[_ngcontent-%COMP%] {\n  overflow: auto;\n  min-height: 0;\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  border-radius: 8px;\n\n  &:not(:has(.list-row)) {\n    border: none;\n    border-radius: 0;\n  }\n}\n\n.list-header[_ngcontent-%COMP%] {\n  display: grid;\n  padding: 10px 16px;\n  background: var(--mat-sys-surface-container, #f5f6fa);\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  letter-spacing: 0.4px;\n  position: sticky;\n  top: 0;\n  z-index: 10;\n  isolation: isolate;\n}\n\n.list-row[_ngcontent-%COMP%] {\n  \n\n  position: relative;\n  display: grid;\n  padding: 10px 16px;\n  border: none;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #eceef3);\n  background: none;\n  font: inherit;\n  text-align: left;\n  width: 100%;\n  align-items: center;\n  font-size: 13px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  cursor: pointer;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low, #f8f9fc);\n  }\n\n  &.selected {\n    background: var(--mat-sys-primary-container, #e8def8);\n\n    &:hover {\n      background: var(--mat-sys-surface-container-high, #eef0f4);\n    }\n  }\n}\n.col-name[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n}\n\n.row-icon[_ngcontent-%COMP%] {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  flex-shrink: 0;\n}\n\n.row-thumbnail-image[_ngcontent-%COMP%] {\n  width: 20px;\n  height: 20px;\n  object-fit: cover;\n  border-radius: 4px;\n  flex-shrink: 0;\n}\n\n.row-name-text[_ngcontent-%COMP%] {\n  \n\n\n\n  appearance: none;\n  border: 0;\n  background: none;\n  padding: 0;\n  font: inherit;\n  color: inherit;\n  text-align: left;\n  cursor: pointer;\n  flex: 1;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.col-checkbox[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n\n.col-gear[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n}\n\n.gear-btn[_ngcontent-%COMP%] {\n  width: 32px;\n  height: 32px;\n  line-height: 32px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n\n  &:hover {\n    color: var(--mat-sys-primary, #5c6bc0);\n  }\n}\n\n\n\n.col-panel-backdrop[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  z-index: 99;\n  border: none;\n  background: transparent;\n  padding: 0;\n  cursor: pointer;\n  font: inherit;\n}\n\n.col-panel[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 43px;\n  right: 0;\n  z-index: 100;\n  background: #fff;\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  border-radius: 8px;\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);\n  padding: 14px 16px;\n  min-width: 200px;\n  display: flex;\n  flex-direction: column;\n  max-height: 420px;\n}\n\n.col-panel-list[_ngcontent-%COMP%] {\n  overflow-y: auto;\n  flex: 1;\n  margin-bottom: 2px;\n}\n\n.col-panel-title[_ngcontent-%COMP%] {\n  font-size: 13px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  margin: 0 0 10px;\n  letter-spacing: 0.4px;\n}\n\n.col-panel-option[_ngcontent-%COMP%] {\n  display: flex;\n  margin-bottom: 6px;\n}\n\n.col-panel-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n  margin-top: 12px;\n  padding-top: 10px;\n  border-top: 1px solid var(--mat-sys-outline-variant, #eceef3);\n}\n\n.col-sortable[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  cursor: pointer;\n  user-select: none;\n  white-space: nowrap;\n  border: none;\n  background: none;\n  font: inherit;\n  padding: 0;\n  color: inherit;\n\n  &:hover {\n    color: var(--mat-sys-primary, #5c6bc0);\n\n    .sort-icon {\n      opacity: 1;\n    }\n  }\n}\n\n.sort-icon[_ngcontent-%COMP%] {\n  font-size: 14px;\n  width: 14px;\n  height: 14px;\n  opacity: 0;\n  transition:\n    opacity 0.15s ease,\n    transform 0.15s ease;\n  color: var(--mat-sys-on-surface-variant, #8a8d98);\n\n  &.sort-active {\n    opacity: 1;\n    color: var(--mat-sys-primary, #5c6bc0);\n  }\n}\n\n@media (max-width: 1400px) {\n  .asset-grid[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(4, 1fr);\n  }\n}\n\n@media (max-width: 1200px) {\n  .results-page[_ngcontent-%COMP%] {\n    padding: 14px 16px;\n  }\n\n  .asset-grid[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(3, 1fr);\n    gap: 12px;\n  }\n}\n\n@media (max-width: 900px) {\n  .asset-grid[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(2, 1fr);\n    gap: 10px;\n  }\n}\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.asset-card-name[_ngcontent-%COMP%], \n.row-name-text[_ngcontent-%COMP%] {\n  &::after {\n    content: '';\n    position: absolute;\n    inset: 0;\n    z-index: 0;\n  }\n}\n\n\n\n\n.grid-card-checkbox[_ngcontent-%COMP%], \n.col-checkbox[_ngcontent-%COMP%], \n.grid-card-actions[_ngcontent-%COMP%], \n.col-hover-actions[_ngcontent-%COMP%], \n.col-gear[_ngcontent-%COMP%], \n.action-btn[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 1;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AssetSearchResultsComponent, [{
        type: Component,
        args: [{ selector: 'lib-asset-search-results', standalone: true, imports: [
                    DocTypeLabelPipe,
                    DescriptorLabelPipe,
                    TranslatePipe,
                    MatButtonModule,
                    MatMenuModule,
                    MatIconModule,
                    MatTooltipModule,
                    MatCheckboxModule,
                    MatProgressSpinnerModule,
                    MatSelectModule,
                    MatSnackBarModule,
                ], template: "<div class=\"results-page\">\n  <div class=\"results-top-actions\">\n    @if (hasSavableFilters()) {\n      <button\n        mat-flat-button\n        color=\"primary\"\n        class=\"top-action-btn save-as-btn\"\n        type=\"button\"\n        (click)=\"openSaveAsDialog()\"\n      >\n        <mat-icon>bookmark_add</mat-icon>\n        {{ 'assets.asset-search-results.save-as' | translate }}\n      </button>\n    }\n    @if (hasSelectedSavedSearch()) {\n      <button\n        mat-flat-button\n        class=\"top-action-btn save-btn\"\n        type=\"button\"\n        (click)=\"onSaveSelectedSavedSearch()\"\n      >\n        {{ 'assets.asset-search-results.save' | translate }}\n      </button>\n    }\n    @if (hasSelectedSavedSearch()) {\n      <button\n        mat-icon-button\n        type=\"button\"\n        [matMenuTriggerFor]=\"resultsActionsMenu\"\n        [attr.aria-label]=\"'assets.asset-search-results.results-actions' | translate\"\n      >\n        <mat-icon>more_vert</mat-icon>\n      </button>\n      <mat-menu #resultsActionsMenu=\"matMenu\">\n        <button mat-menu-item type=\"button\" (click)=\"onEditSelectedSavedSearch()\">\n          {{ 'assets.asset-search-results.edit' | translate }}\n        </button>\n        <button mat-menu-item type=\"button\" (click)=\"onShareSelectedSavedSearch()\">\n          {{ 'assets.asset-search-results.share' | translate }}\n        </button>\n        <button mat-menu-item type=\"button\" (click)=\"onDeleteSelectedSavedSearch()\">\n          {{ 'assets.asset-search-results.delete' | translate }}\n        </button>\n      </mat-menu>\n    }\n  </div>\n\n  <!-- Toolbar -->\n  <div class=\"results-toolbar\">\n    @if (resultCount() > 0) {\n      <span class=\"results-count\">{{\n        (resultCount() === 1 ? 'common.count.result-one' : 'common.count.result-many')\n          | translate: { count: resultCount() }\n      }}</span>\n    }\n\n    <div class=\"toolbar-actions\">\n      <button\n        mat-icon-button\n        [matTooltip]=\"'assets.asset-search-results.export-csv' | translate\"\n        [attr.aria-label]=\"'assets.asset-search-results.export-csv' | translate\"\n        (click)=\"exportCsv()\"\n        class=\"toolbar-btn\"\n      >\n        <mat-icon>download</mat-icon>\n      </button>\n\n      <button\n        mat-icon-button\n        [matTooltip]=\"viewMode() === 'list' ? ('assets.switch-to-grid-view' | translate) : ''\"\n        [attr.aria-label]=\"'assets.asset-search-results.grid-view' | translate\"\n        [attr.aria-pressed]=\"viewMode() === 'grid'\"\n        [class.active]=\"viewMode() === 'grid'\"\n        (click)=\"setViewMode('grid')\"\n        class=\"toolbar-btn\"\n      >\n        <mat-icon>grid_view</mat-icon>\n      </button>\n\n      <button\n        mat-icon-button\n        [matTooltip]=\"viewMode() === 'grid' ? ('assets.switch-to-table-view' | translate) : ''\"\n        [attr.aria-label]=\"'assets.asset-search-results.table-view' | translate\"\n        [attr.aria-pressed]=\"viewMode() === 'list'\"\n        [class.active]=\"viewMode() === 'list'\"\n        (click)=\"setViewMode('list')\"\n        class=\"toolbar-btn\"\n      >\n        <mat-icon>view_list</mat-icon>\n      </button>\n    </div>\n  </div>\n\n  <main class=\"results-content\">\n    @if (loading()) {\n      <div class=\"results-loading\">\n        <mat-spinner\n          diameter=\"32\"\n          [attr.aria-label]=\"'assets.asset-search-results.loading' | translate\"\n        />\n      </div>\n    }\n\n    @if (error()) {\n      <div class=\"results-error\">{{ error() }}</div>\n    }\n\n    @if (!loading() && !error() && resultCount() === 0 && viewMode() === 'grid') {\n      <div class=\"results-empty\">\n        {{ 'assets.asset-search-results.no-documents-match-the-search-criteria' | translate }}\n      </div>\n    }\n\n    <!-- Grid View -->\n    @if (!loading() && !error() && viewMode() === 'grid' && resultCount() > 0) {\n      <div class=\"asset-grid\">\n        @for (asset of gridAssets(); track asset.id) {\n          <div class=\"asset-card\" [class.selected]=\"isAssetSelected(asset.id)\">\n            <div class=\"grid-card-checkbox col-hover-select\">\n              <mat-checkbox\n                [checked]=\"isAssetSelected(asset.id)\"\n                [attr.aria-label]=\"'common.select-item' | translate: { name: asset.name }\"\n                (click)=\"$event.stopPropagation()\"\n                (change)=\"toggleAssetSelection(asset.id)\"\n              ></mat-checkbox>\n            </div>\n            <div class=\"asset-card-thumbnail\">\n              @if (thumbnailMap()[asset.id]; as thumb) {\n                <img class=\"asset-thumbnail-image\" [src]=\"thumb\" alt=\"\" />\n              } @else {\n                <mat-icon class=\"asset-icon\">{{ asset.icon }}</mat-icon>\n              }\n            </div>\n            <div class=\"asset-card-body\">\n              <div class=\"asset-card-head\">\n                <button\n                  type=\"button\"\n                  class=\"asset-card-name\"\n                  [title]=\"asset.name\"\n                  (click)=\"openAsset(asset); $event.stopPropagation()\"\n                >\n                  {{ asset.name }}\n                </button>\n                <span class=\"asset-type-pill\" [title]=\"asset.type | docTypeLabel\">{{\n                  asset.type | docTypeLabel\n                }}</span>\n              </div>\n            </div>\n          </div>\n        }\n      </div>\n    }\n\n    <!-- Table View -->\n    @if (!loading() && !error() && viewMode() === 'list') {\n      <div class=\"list-wrapper\">\n        <!-- Column picker panel -->\n        @if (columnPanelOpen()) {\n          <button\n            type=\"button\"\n            class=\"col-panel-backdrop\"\n            [attr.aria-label]=\"'assets.asset-search-results.close-column-picker' | translate\"\n            (click)=\"closeColumnPanel()\"\n            (keydown.escape)=\"closeColumnPanel()\"\n          ></button>\n          <div class=\"col-panel\">\n            <p class=\"col-panel-title\">\n              {{ 'assets.asset-search-results.column-settings' | translate }}\n            </p>\n            <div class=\"col-panel-list\">\n              @for (col of columnsForPanel; track col.key) {\n                <mat-checkbox\n                  class=\"col-panel-option\"\n                  [checked]=\"isPendingColumn(col.key)\"\n                  (change)=\"togglePendingColumn(col.key)\"\n                  >{{ col | descriptorLabel }}</mat-checkbox\n                >\n              }\n            </div>\n            <div class=\"col-panel-actions\">\n              <button mat-button (click)=\"resetColumns()\">\n                {{ 'assets.asset-search-results.reset' | translate }}\n              </button>\n              <button mat-flat-button color=\"primary\" (click)=\"applyColumns()\">\n                {{ 'assets.asset-search-results.done' | translate }}\n              </button>\n            </div>\n          </div>\n        }\n\n        <div class=\"asset-list\">\n          <div class=\"list-header\" [style.grid-template-columns]=\"gridTemplate()\">\n            <span class=\"col-checkbox\"></span>\n            @for (col of visibleColumns(); track col.key) {\n              @if (SORTABLE_COLUMNS.has(col.key)) {\n                <button\n                  type=\"button\"\n                  [class.col-name]=\"col.key === 'name'\"\n                  class=\"col-sortable\"\n                  (click)=\"sortBy(col.key)\"\n                >\n                  {{ col | descriptorLabel }}\n                  <mat-icon class=\"sort-icon\" [class.sort-active]=\"sortColumn() === col.key\">\n                    {{\n                      sortColumn() === col.key && sortDirection() === 'desc'\n                        ? 'arrow_downward'\n                        : 'arrow_upward'\n                    }}\n                  </mat-icon>\n                </button>\n              } @else {\n                <span>{{ col | descriptorLabel }}</span>\n              }\n            }\n            <span class=\"col-gear\">\n              <button\n                mat-icon-button\n                class=\"gear-btn\"\n                [matTooltip]=\"'assets.asset-search-results.manage-columns' | translate\"\n                [attr.aria-label]=\"'assets.asset-search-results.manage-columns' | translate\"\n                (click)=\"openColumnPanel()\"\n              >\n                <mat-icon>tune</mat-icon>\n              </button>\n            </span>\n          </div>\n\n          @for (asset of sortedAssets(); track asset.id) {\n            <div\n              class=\"list-row\"\n              [class.selected]=\"isAssetSelected(asset.id)\"\n              [style.grid-template-columns]=\"gridTemplate()\"\n            >\n              <span class=\"col-checkbox\">\n                <mat-checkbox\n                  [checked]=\"isAssetSelected(asset.id)\"\n                  [attr.aria-label]=\"'common.select-item' | translate: { name: asset.name }\"\n                  (click)=\"$event.stopPropagation()\"\n                  (change)=\"toggleAssetSelection(asset.id)\"\n                ></mat-checkbox>\n              </span>\n              @for (col of visibleColumns(); track col.key) {\n                @if (col.key === 'name') {\n                  <span class=\"col-name\">\n                    @if (thumbnailMap()[asset.id]; as thumb) {\n                      <img class=\"row-thumbnail-image\" [src]=\"thumb\" alt=\"\" />\n                    } @else {\n                      <mat-icon class=\"row-icon\">{{ asset.icon }}</mat-icon>\n                    }\n                    <button\n                      type=\"button\"\n                      class=\"row-name-text\"\n                      [title]=\"asset.name\"\n                      (click)=\"openAsset(asset); $event.stopPropagation()\"\n                    >\n                      {{ asset.name }}\n                    </button>\n                  </span>\n                } @else if (col.key === 'type') {\n                  <span>{{ asset.type | docTypeLabel }}</span>\n                } @else {\n                  <span>{{ getCellValue(asset, col.key) }}</span>\n                }\n              }\n              <span></span>\n            </div>\n          }\n\n          @if (!loading() && resultCount() === 0) {\n            <div class=\"results-empty\">\n              {{ 'assets.asset-search-results.no-documents-match-the-search-criteria' | translate }}\n            </div>\n          }\n        </div>\n      </div>\n    }\n  </main>\n</div>\n", styles: [":host {\n  display: block;\n  height: 100%;\n}\n\n.results-page {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  padding: 16px 24px;\n  box-sizing: border-box;\n}\n\n.results-top-actions {\n  display: flex;\n  justify-content: flex-end;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 8px;\n  flex-shrink: 0;\n}\n\n.top-action-btn {\n  min-width: 88px;\n}\n\n.results-top-actions .save-as-btn {\n  background: var(--mat-sys-primary, #3f51b5);\n  color: #fff;\n}\n\n.results-top-actions .save-btn {\n  background: #43a047;\n  color: #fff;\n}\n\n/* Toolbar */\n.results-toolbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 16px;\n  flex-shrink: 0;\n}\n\n.results-count {\n  font-size: 15px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n}\n\n.toolbar-actions {\n  display: flex;\n  margin-left: auto;\n  align-items: center;\n  gap: 4px;\n}\n\n.toolbar-btn {\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  width: 36px;\n  height: 36px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-high, #eef0f4);\n  }\n\n  &.active {\n    color: var(--mat-sys-primary, #5c6bc0);\n    background: var(--mat-sys-primary-container, #e8def8);\n    border-radius: 8px;\n  }\n}\n\n/* Content Wrapper */\n.content-wrapper {\n  display: flex;\n  gap: 16px;\n  flex: 1;\n  overflow: hidden;\n}\n\n/* Filters Sidebar */\n.filters-sidebar {\n  width: 280px;\n  background: #fafafa;\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  flex-shrink: 0;\n}\n\n.filters-header {\n  padding: 12px 16px;\n  border-bottom: 1px solid #e8e8e8;\n  flex-shrink: 0;\n}\n\n.filters-title {\n  margin: 0;\n  font-size: 13px;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  color: #999;\n}\n\n.filters-content {\n  flex: 1;\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n}\n\n.filter-group {\n  border-bottom: 1px solid #f5f5f5;\n}\n\n.filter-btn {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  width: 100%;\n  padding: 10px 16px;\n  background: none;\n  border: none;\n  cursor: pointer;\n  text-align: left;\n  color: #333;\n  font-size: 14px;\n\n  &:hover {\n    background: #f5f5f5;\n  }\n}\n\n.filter-btn-label {\n  font-size: 14px;\n  font-weight: 500;\n}\n\n.filter-btn-icon {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: #666;\n  flex-shrink: 0;\n}\n\n.filter-options {\n  display: flex;\n  flex-direction: column;\n  padding: 8px 0;\n  gap: 0;\n}\n\n.filter-checkbox {\n  padding: 0 16px;\n  margin: 4px 0;\n  font-size: 13px;\n  line-height: 1.4;\n  word-break: break-word;\n}\n\n.filter-no-results {\n  padding: 8px 16px;\n  font-size: 12px;\n  color: #999;\n  font-style: italic;\n}\n\n/* Results Content */\n.results-content {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  min-width: 0;\n  min-height: 0;\n}\n\n/* Loading / Error */\n.results-loading {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.results-error {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: #d32f2f;\n  font-size: 14px;\n}\n\n.results-empty {\n  padding: 32px 16px;\n  text-align: center;\n  color: #888;\n  font-size: 14px;\n}\n\n/* Grid View */\n.grid-actions-bar {\n  display: flex;\n  align-items: center;\n  justify-content: flex-start;\n  padding: 12px 0;\n  margin-bottom: 12px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  flex-shrink: 0;\n}\n\n.grid-actions-left {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.grid-select {\n  min-width: 200px;\n  font-size: 14px;\n}\n\n.grid-select-all {\n  margin-right: 4px;\n}\n\n.action-btn {\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n}\n\n.asset-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));\n  align-content: start;\n  gap: 16px;\n  overflow-y: auto;\n  flex: 1;\n  min-height: 0;\n  padding-bottom: 16px;\n}\n\n.asset-card {\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  overflow: hidden;\n  background: #fff;\n  display: flex;\n  flex-direction: column;\n  cursor: pointer;\n  font: inherit;\n  text-align: left;\n  padding: 0;\n  transition:\n    box-shadow 0.15s ease,\n    background-color 0.15s ease;\n  position: relative;\n\n  &:hover {\n    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);\n\n    .grid-card-checkbox {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n\n  &.selected {\n    background: var(--mat-sys-primary-container, #e8def8);\n    border-color: var(--mat-sys-primary, #5c6bc0);\n\n    .grid-card-checkbox {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n}\n\n.grid-card-checkbox {\n  position: absolute;\n  top: 8px;\n  left: 8px;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n  z-index: 2;\n}\n\n.asset-card-thumbnail {\n  position: relative;\n  height: 120px;\n  width: 100%;\n  background: #f5f5f5;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 8px 8px 0 0;\n  overflow: hidden;\n  flex-shrink: 0;\n}\n\n.asset-card-body {\n  padding: 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  min-height: 0;\n  overflow: hidden;\n}\n\n.asset-card-head {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 6px;\n  min-width: 0;\n}\n\n.asset-card-name {\n  /* Button reset: this is a `<button>` so a keyboard user can open the document.\n     The row itself is no longer a button \u2014 it wrapped a checkbox and action buttons,\n     which is `nested-interactive` (WCAG 4.1.2). */\n  appearance: none;\n  border: 0;\n  background: none;\n  padding: 0;\n  font: inherit;\n  color: inherit;\n  text-align: left;\n  cursor: pointer;\n  flex: 1;\n  min-width: 0;\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--mat-sys-on-surface);\n  margin: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  width: 100%;\n}\n\n.asset-type-pill {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: 2px 8px;\n  border-radius: 999px;\n  background: var(--mat-sys-surface-container-high, #eef0f4);\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  font-size: 11px;\n  font-weight: 600;\n  line-height: 1;\n  max-width: 120px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.asset-icon {\n  font-size: 48px;\n  width: 48px;\n  height: 48px;\n  color: #bdbdbd;\n}\n\n.asset-thumbnail-image {\n  width: 100%;\n  height: 100%;\n  object-fit: contain;\n  display: block;\n  position: absolute;\n  inset: 0;\n}\n\n/* Table View */\n.list-wrapper {\n  display: flex;\n  flex-direction: column;\n  position: relative;\n  overflow: hidden;\n  min-height: 0;\n  padding-bottom: 24px;\n}\n\n.asset-list {\n  overflow: auto;\n  min-height: 0;\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  border-radius: 8px;\n\n  &:not(:has(.list-row)) {\n    border: none;\n    border-radius: 0;\n  }\n}\n\n.list-header {\n  display: grid;\n  padding: 10px 16px;\n  background: var(--mat-sys-surface-container, #f5f6fa);\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  letter-spacing: 0.4px;\n  position: sticky;\n  top: 0;\n  z-index: 10;\n  isolation: isolate;\n}\n\n.list-row {\n  /* positioning context for the title button's stretched hit area */\n  position: relative;\n  display: grid;\n  padding: 10px 16px;\n  border: none;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #eceef3);\n  background: none;\n  font: inherit;\n  text-align: left;\n  width: 100%;\n  align-items: center;\n  font-size: 13px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  cursor: pointer;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low, #f8f9fc);\n  }\n\n  &.selected {\n    background: var(--mat-sys-primary-container, #e8def8);\n\n    &:hover {\n      background: var(--mat-sys-surface-container-high, #eef0f4);\n    }\n  }\n}\n.col-name {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n}\n\n.row-icon {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  flex-shrink: 0;\n}\n\n.row-thumbnail-image {\n  width: 20px;\n  height: 20px;\n  object-fit: cover;\n  border-radius: 4px;\n  flex-shrink: 0;\n}\n\n.row-name-text {\n  /* Button reset: this is a `<button>` so a keyboard user can open the document.\n     The row itself is no longer a button \u2014 it wrapped a checkbox and action buttons,\n     which is `nested-interactive` (WCAG 4.1.2). */\n  appearance: none;\n  border: 0;\n  background: none;\n  padding: 0;\n  font: inherit;\n  color: inherit;\n  text-align: left;\n  cursor: pointer;\n  flex: 1;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.col-checkbox {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n\n.col-gear {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n}\n\n.gear-btn {\n  width: 32px;\n  height: 32px;\n  line-height: 32px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n\n  &:hover {\n    color: var(--mat-sys-primary, #5c6bc0);\n  }\n}\n\n/* Column picker panel */\n.col-panel-backdrop {\n  position: fixed;\n  inset: 0;\n  z-index: 99;\n  border: none;\n  background: transparent;\n  padding: 0;\n  cursor: pointer;\n  font: inherit;\n}\n\n.col-panel {\n  position: absolute;\n  top: 43px;\n  right: 0;\n  z-index: 100;\n  background: #fff;\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  border-radius: 8px;\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);\n  padding: 14px 16px;\n  min-width: 200px;\n  display: flex;\n  flex-direction: column;\n  max-height: 420px;\n}\n\n.col-panel-list {\n  overflow-y: auto;\n  flex: 1;\n  margin-bottom: 2px;\n}\n\n.col-panel-title {\n  font-size: 13px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  margin: 0 0 10px;\n  letter-spacing: 0.4px;\n}\n\n.col-panel-option {\n  display: flex;\n  margin-bottom: 6px;\n}\n\n.col-panel-actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n  margin-top: 12px;\n  padding-top: 10px;\n  border-top: 1px solid var(--mat-sys-outline-variant, #eceef3);\n}\n\n.col-sortable {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  cursor: pointer;\n  user-select: none;\n  white-space: nowrap;\n  border: none;\n  background: none;\n  font: inherit;\n  padding: 0;\n  color: inherit;\n\n  &:hover {\n    color: var(--mat-sys-primary, #5c6bc0);\n\n    .sort-icon {\n      opacity: 1;\n    }\n  }\n}\n\n.sort-icon {\n  font-size: 14px;\n  width: 14px;\n  height: 14px;\n  opacity: 0;\n  transition:\n    opacity 0.15s ease,\n    transform 0.15s ease;\n  color: var(--mat-sys-on-surface-variant, #8a8d98);\n\n  &.sort-active {\n    opacity: 1;\n    color: var(--mat-sys-primary, #5c6bc0);\n  }\n}\n\n@media (max-width: 1400px) {\n  .asset-grid {\n    grid-template-columns: repeat(4, 1fr);\n  }\n}\n\n@media (max-width: 1200px) {\n  .results-page {\n    padding: 14px 16px;\n  }\n\n  .asset-grid {\n    grid-template-columns: repeat(3, 1fr);\n    gap: 12px;\n  }\n}\n\n@media (max-width: 900px) {\n  .asset-grid {\n    grid-template-columns: repeat(2, 1fr);\n    gap: 10px;\n  }\n}\n\n/*\n  Stretched hit area for the row's single control.\n * ---------------------------------------------\n * These rows used to be `<button>` elements wrapping a checkbox and action buttons, which is\n * `nested-interactive` \u2014 invalid HTML and WCAG 4.1.2, because a control cannot contain a\n * control. The title is now the row's one real control, and this pseudo-element extends its\n * clickable area over the whole row, so clicking anywhere still opens the document.\n *\n * The alternative was a focusable `<div role=\"button\">` with key handlers, which reintroduces\n * exactly the nesting this removes; `@angular-eslint`'s `interactive-supports-focus` and\n * `click-events-have-key-events` reject the middle ground of a click handler on a plain div,\n * and they are right to.\n */\n.asset-card-name,\n.row-name-text {\n  &::after {\n    content: '';\n    position: absolute;\n    inset: 0;\n    z-index: 0;\n  }\n}\n\n/* The controls have to sit above that overlay. `z-index` alone did nothing here: these\n   wrappers were `position: static`, on which `z-index` has no effect. */\n.grid-card-checkbox,\n.col-checkbox,\n.grid-card-actions,\n.col-hover-actions,\n.col-gear,\n.action-btn {\n  position: relative;\n  z-index: 1;\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AssetSearchResultsComponent, { className: "AssetSearchResultsComponent", filePath: "libs/features/assets/src/lib/asset-search-results/asset-search-results.component.ts", lineNumber: 309 }); })();
