import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { DescriptorLabelPipe } from '@nuxeo/satori-platform/extensions';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AssetAggregationService, SearchService, } from '@nuxeo/satori-platform/nuxeo-client';
import { SavedSearchDialogComponent } from '@nuxeo/satori-platform/ui';
import { AssetsQueueComponent } from '../assets-queue/assets-queue.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/icon";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/checkbox";
import * as i4 from "@angular/material/divider";
import * as i5 from "@angular/material/slide-toggle";
import * as i6 from "@angular/material/tooltip";
const _forTrack0 = ($index, $item) => $item.key;
const _forTrack1 = ($index, $item) => $item.id;
const _forTrack2 = ($index, $item) => $item.value;
function AssetsDrawerComponent_Conditional_10_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 9);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "assets.assets-drawer.loading-saved-searches"), " ");
} }
function AssetsDrawerComponent_Conditional_10_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 9);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "assets.assets-drawer.no-saved-searches"), " ");
} }
function AssetsDrawerComponent_Conditional_10_Conditional_3_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 9);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "assets.assets-drawer.no-matching-saved-searches"), " ");
} }
function AssetsDrawerComponent_Conditional_10_Conditional_3_Conditional_4_For_1_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 13);
    i0.ɵɵlistener("mousedown", function AssetsDrawerComponent_Conditional_10_Conditional_3_Conditional_4_For_1_Template_button_mousedown_0_listener() { const option_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.selectFilterOption(option_r4)); });
    i0.ɵɵelementStart(1, "mat-icon", 14);
    i0.ɵɵtext(2, "bookmark");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const option_r4 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", option_r4.label, " ");
} }
function AssetsDrawerComponent_Conditional_10_Conditional_3_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, AssetsDrawerComponent_Conditional_10_Conditional_3_Conditional_4_For_1_Template, 4, 1, "button", 12, _forTrack0);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵrepeater(ctx_r1.filteredSavedSearches());
} }
function AssetsDrawerComponent_Conditional_10_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 10)(1, "input", 11);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("input", function AssetsDrawerComponent_Conditional_10_Conditional_3_Template_input_input_1_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.savedSearchFilter.set($event.target.value)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(3, AssetsDrawerComponent_Conditional_10_Conditional_3_Conditional_3_Template, 3, 3, "div", 9)(4, AssetsDrawerComponent_Conditional_10_Conditional_3_Conditional_4_Template, 2, 0);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(2, 3, "assets.assets-drawer.search"))("value", ctx_r1.savedSearchFilter());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.filteredSavedSearches().length === 0 ? 3 : 4);
} }
function AssetsDrawerComponent_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6);
    i0.ɵɵconditionalCreate(1, AssetsDrawerComponent_Conditional_10_Conditional_1_Template, 3, 3, "div", 9)(2, AssetsDrawerComponent_Conditional_10_Conditional_2_Template, 3, 3, "div", 9)(3, AssetsDrawerComponent_Conditional_10_Conditional_3_Template, 5, 5);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.savedSearchesLoading() ? 1 : ctx_r1.availableSavedSearches().length === 0 ? 2 : 3);
} }
function AssetsDrawerComponent_Conditional_19_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 30);
    i0.ɵɵlistener("click", function AssetsDrawerComponent_Conditional_19_Conditional_11_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onSecondarySearchClear()); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "close");
    i0.ɵɵelementEnd()();
} }
function AssetsDrawerComponent_Conditional_19_For_13_Conditional_7_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 35);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "assets.assets-drawer.no-available-results"));
} }
function AssetsDrawerComponent_Conditional_19_For_13_Conditional_7_Conditional_2_For_1_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-checkbox", 37);
    i0.ɵɵlistener("change", function AssetsDrawerComponent_Conditional_19_For_13_Conditional_7_Conditional_2_For_1_Template_mat_checkbox_change_0_listener() { const option_r10 = i0.ɵɵrestoreView(_r9).$implicit; const group_r8 = i0.ɵɵnextContext(3).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.toggleOption(group_r8.id, option_r10.value)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "descriptorLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const option_r10 = ctx.$implicit;
    const group_r8 = i0.ɵɵnextContext(3).$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("checked", option_r10.selected);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" ", i0.ɵɵpipeBind1(2, 3, option_r10), "", ctx_r1.getCountText(group_r8.id, option_r10.aggKey), " ");
} }
function AssetsDrawerComponent_Conditional_19_For_13_Conditional_7_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, AssetsDrawerComponent_Conditional_19_For_13_Conditional_7_Conditional_2_For_1_Template, 3, 5, "mat-checkbox", 36, _forTrack2);
} if (rf & 2) {
    const group_r8 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵrepeater(group_r8.options);
} }
function AssetsDrawerComponent_Conditional_19_For_13_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 34);
    i0.ɵɵconditionalCreate(1, AssetsDrawerComponent_Conditional_19_For_13_Conditional_7_Conditional_1_Template, 3, 3, "span", 35)(2, AssetsDrawerComponent_Conditional_19_For_13_Conditional_7_Conditional_2_Template, 2, 0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const group_r8 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.dynamicGroups.has(group_r8.id) && group_r8.options.length === 0 ? 1 : 2);
} }
function AssetsDrawerComponent_Conditional_19_For_13_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 17)(1, "button", 31);
    i0.ɵɵlistener("click", function AssetsDrawerComponent_Conditional_19_For_13_Template_button_click_1_listener() { const group_r8 = i0.ɵɵrestoreView(_r7).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.toggleFilter(group_r8.id)); });
    i0.ɵɵelementStart(2, "span", 32);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "descriptorLabel");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "mat-icon", 33);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(7, AssetsDrawerComponent_Conditional_19_For_13_Conditional_7_Template, 3, 1, "div", 34);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const group_r8 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 3, group_r8));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.isExpanded(group_r8.id) ? "expand_less" : "expand_more", " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isExpanded(group_r8.id) ? 7 : -1);
} }
function AssetsDrawerComponent_Conditional_19_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 38);
    i0.ɵɵlistener("click", function AssetsDrawerComponent_Conditional_19_Conditional_28_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r11); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.applySearch()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "assets.assets-drawer.search-2"), " ");
} }
function AssetsDrawerComponent_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 15)(1, "p", 16);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 17)(5, "p", 18);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 19)(9, "input", 20);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵlistener("input", function AssetsDrawerComponent_Conditional_19_Template_input_input_9_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onSecondarySearchInput($event.target.value)); })("keydown.enter", function AssetsDrawerComponent_Conditional_19_Template_input_keydown_enter_9_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onSecondarySearchEnter()); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(11, AssetsDrawerComponent_Conditional_19_Conditional_11_Template, 3, 0, "button", 21);
    i0.ɵɵelementEnd()();
    i0.ɵɵrepeaterCreate(12, AssetsDrawerComponent_Conditional_19_For_13_Template, 8, 5, "div", 17, _forTrack1);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(14, "mat-divider");
    i0.ɵɵelementStart(15, "div", 22)(16, "div", 23)(17, "span", 24);
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "mat-slide-toggle", 25);
    i0.ɵɵlistener("change", function AssetsDrawerComponent_Conditional_19_Template_mat_slide_toggle_change_20_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.autoSearch.set($event.checked)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "div", 26)(22, "button", 27);
    i0.ɵɵlistener("click", function AssetsDrawerComponent_Conditional_19_Template_button_click_22_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.resetFilters()); });
    i0.ɵɵtext(23);
    i0.ɵɵpipe(24, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "button", 28);
    i0.ɵɵlistener("click", function AssetsDrawerComponent_Conditional_19_Template_button_click_25_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.openSaveAsDialog()); });
    i0.ɵɵtext(26);
    i0.ɵɵpipe(27, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(28, AssetsDrawerComponent_Conditional_19_Conditional_28_Template, 3, 3, "button", 29);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 11, "assets.assets-drawer.filters"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 13, "assets.assets-drawer.full-text"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(10, 15, "assets.assets-drawer.search-for-something"))("value", ctx_r1.secondarySearchInput());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.secondarySearchInput().trim() ? 11 : -1);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.filterGroups());
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 17, "assets.assets-drawer.auto-search"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r1.autoSearch());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(24, 19, "assets.assets-drawer.reset"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r1.hasActiveFilters());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(27, 21, "assets.assets-drawer.save-as"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r1.autoSearch() ? 28 : -1);
} }
function AssetsDrawerComponent_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "lib-assets-queue", 39);
    i0.ɵɵlistener("itemSelected", function AssetsDrawerComponent_Conditional_20_Template_lib_assets_queue_itemSelected_0_listener($event) { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onQueueItemSelected($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("selectedItemId", ctx_r1.selectedDocumentId());
} }
const DYNAMIC_GROUPS = new Set(['asset-type', 'asset-format', 'color-profile', 'color-depth']);
function toMimeType(value) {
    if (value.includes('/'))
        return value;
    const normalized = value.toLowerCase();
    const map = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        tiff: 'image/tiff',
        tif: 'image/tiff',
        svg: 'image/svg+xml',
        mp4: 'video/mp4',
        mov: 'video/quicktime',
        mp3: 'audio/mpeg',
        pdf: 'application/pdf',
        zip: 'application/zip',
    };
    return map[normalized] ?? value;
}
export class AssetsDrawerComponent {
    translate = inject(TranslateService);
    route = inject(ActivatedRoute);
    router = inject(Router);
    dialog = inject(MatDialog);
    snackBar = inject(MatSnackBar);
    aggregationService = inject(AssetAggregationService);
    searchService = inject(SearchService);
    queryParams = toSignal(this.route.queryParamMap, { requireSync: true });
    dynamicGroups = DYNAMIC_GROUPS;
    viewMode = signal(this.loadViewModeFromStorage(), ...(ngDevMode ? [{ debugName: "viewMode" }] : []));
    selectedDocumentId = signal('', ...(ngDevMode ? [{ debugName: "selectedDocumentId" }] : []));
    filterSearchInput = signal('', ...(ngDevMode ? [{ debugName: "filterSearchInput" }] : []));
    savedSearchFilter = signal('', ...(ngDevMode ? [{ debugName: "savedSearchFilter" }] : []));
    filterSearchOpen = signal(false, ...(ngDevMode ? [{ debugName: "filterSearchOpen" }] : []));
    availableSavedSearches = signal([], ...(ngDevMode ? [{ debugName: "availableSavedSearches" }] : []));
    selectedSavedSearch = signal('', ...(ngDevMode ? [{ debugName: "selectedSavedSearch" }] : []));
    savedSearchesLoading = signal(false, ...(ngDevMode ? [{ debugName: "savedSearchesLoading" }] : []));
    savedSearchesLoaded = signal(false, ...(ngDevMode ? [{ debugName: "savedSearchesLoaded" }] : []));
    secondarySearchInput = signal('', ...(ngDevMode ? [{ debugName: "secondarySearchInput" }] : []));
    GROUP_AGG_KEY = {
        'asset-type': 'system_primaryType_agg',
        'asset-format': 'system_mimetype_agg',
        'asset-width': 'asset_width_agg',
        'asset-height': 'asset_height_agg',
        'color-profile': 'color_profile_agg',
        'color-depth': 'color_depth_agg',
        'video-duration': 'video_duration_agg',
    };
    ALWAYS_SHOW_ZERO = new Set(['asset-width', 'asset-height', 'video-duration']);
    hasActiveFilters = computed(() => this.secondarySearchInput().trim().length > 0 ||
        this.filterGroups().some((group) => group.options.some((option) => option.selected)), ...(ngDevMode ? [{ debugName: "hasActiveFilters" }] : []));
    filteredSavedSearches = computed(() => {
        const term = this.savedSearchFilter().trim().toLowerCase();
        if (!term)
            return this.availableSavedSearches();
        return this.availableSavedSearches().filter((option) => option.label.toLowerCase().includes(term));
    }, ...(ngDevMode ? [{ debugName: "filteredSavedSearches" }] : []));
    getCountText(groupId, aggKey) {
        if (!aggKey)
            return '';
        const aggField = this.GROUP_AGG_KEY[groupId];
        if (!aggField)
            return '';
        const agg = this.aggregationService.aggregations()[aggField];
        if (!agg)
            return this.ALWAYS_SHOW_ZERO.has(groupId) ? ' (0)' : '';
        const bucket = agg.buckets.find((b) => b.key === aggKey);
        const count = bucket?.docCount ?? (this.ALWAYS_SHOW_ZERO.has(groupId) ? 0 : null);
        return count !== null ? ` (${count})` : '';
    }
    expandedFilters = signal(new Set(), ...(ngDevMode ? [{ debugName: "expandedFilters" }] : []));
    filterGroups = signal([
        { id: 'asset-type', labelKey: 'assets.filter.asset-type', label: 'Asset Type', options: [] },
        {
            id: 'asset-format',
            labelKey: 'assets.filter.asset-format',
            label: 'Asset Format',
            options: [],
        },
        {
            id: 'asset-width',
            labelKey: 'assets.filter.asset-width',
            label: 'Asset Width',
            options: [
                {
                    labelKey: 'assets.filter.option.less-than-500-px',
                    label: 'Less than 500 px',
                    value: 'to_500_px',
                    selected: false,
                    aggKey: 'to_500_px',
                },
                {
                    labelKey: 'assets.filter.option.between-500-px-and-1500-px',
                    label: 'Between 500 px and 1500 px',
                    value: 'from_500_to_1500_px',
                    selected: false,
                    aggKey: 'from_500_to_1500_px',
                },
                {
                    labelKey: 'assets.filter.option.between-1500-px-and-2000-px',
                    label: 'Between 1500 px and 2000 px',
                    value: 'from_1500_to_2000_px',
                    selected: false,
                    aggKey: 'from_1500_to_2000_px',
                },
                {
                    labelKey: 'assets.filter.option.more-than-2000-px',
                    label: 'More than 2000 px',
                    value: 'from_2000_px',
                    selected: false,
                    aggKey: 'from_2000_px',
                },
            ],
        },
        {
            id: 'asset-height',
            labelKey: 'assets.filter.asset-height',
            label: 'Asset Height',
            options: [
                {
                    labelKey: 'assets.filter.option.less-than-500-px',
                    label: 'Less than 500 px',
                    value: 'to_500_px',
                    selected: false,
                    aggKey: 'to_500_px',
                },
                {
                    labelKey: 'assets.filter.option.between-500-px-and-1500-px',
                    label: 'Between 500 px and 1500 px',
                    value: 'from_500_to_1500_px',
                    selected: false,
                    aggKey: 'from_500_to_1500_px',
                },
                {
                    labelKey: 'assets.filter.option.between-1500-px-and-2000-px',
                    label: 'Between 1500 px and 2000 px',
                    value: 'from_1500_to_2000_px',
                    selected: false,
                    aggKey: 'from_1500_to_2000_px',
                },
                {
                    labelKey: 'assets.filter.option.more-than-2000-px',
                    label: 'More than 2000 px',
                    value: 'from_2000_px',
                    selected: false,
                    aggKey: 'from_2000_px',
                },
            ],
        },
        {
            id: 'color-profile',
            labelKey: 'assets.filter.color-profile',
            label: 'Color Profile',
            options: [],
        },
        {
            id: 'color-depth',
            labelKey: 'assets.filter.color-depth',
            label: 'Color Depth per Channel',
            options: [],
        },
        {
            id: 'video-duration',
            labelKey: 'assets.filter.video-duration',
            label: 'Video Duration',
            options: [
                {
                    labelKey: 'assets.filter.option.less-than-30-s',
                    label: 'Less than 30 s',
                    value: 'to_30_s',
                    selected: false,
                    aggKey: 'to_30_s',
                },
                {
                    labelKey: 'assets.filter.option.between-30-s-and-180-s',
                    label: 'Between 30 s and 180 s',
                    value: 'from_30_to_180_s',
                    selected: false,
                    aggKey: 'from_30_to_180_s',
                },
                {
                    labelKey: 'assets.filter.option.between-180-s-and-600-s',
                    label: 'Between 180 s and 600 s',
                    value: 'from_180_to_600_s',
                    selected: false,
                    aggKey: 'from_180_to_600_s',
                },
                {
                    labelKey: 'assets.filter.option.between-600-s-and-1800-s',
                    label: 'Between 600 s and 1800 s',
                    value: 'from_600_to_1800_s',
                    selected: false,
                    aggKey: 'from_600_to_1800_s',
                },
                {
                    labelKey: 'assets.filter.option.more-than-1800-s',
                    label: 'More than 1800 s',
                    value: 'from_1800_s',
                    selected: false,
                    aggKey: 'from_1800_s',
                },
            ],
        },
    ], ...(ngDevMode ? [{ debugName: "filterGroups" }] : []));
    autoSearch = signal(true, ...(ngDevMode ? [{ debugName: "autoSearch" }] : []));
    constructor() {
        this.expandedFilters.set(new Set(['asset-type']));
        effect(() => {
            const version = this.aggregationService.savedSearchVersion();
            if (version === 0)
                return;
            untracked(() => {
                this.savedSearchesLoaded.set(false);
                this.loadSavedSearchesFromApi();
            });
        });
        effect(() => {
            const savedSearchId = this.aggregationService.selectedSavedSearchId().trim();
            const savedSearchTitle = this.aggregationService.selectedSavedSearchTitle().trim();
            if (savedSearchId) {
                this.selectedSavedSearch.set(savedSearchId);
                this.filterSearchInput.set(savedSearchTitle);
                return;
            }
            this.selectedSavedSearch.set('');
            this.filterSearchInput.set('');
            this.savedSearchFilter.set('');
            this.filterSearchOpen.set(false);
        });
        this.syncSelectedDocumentFromUrl(this.router.url);
        this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
            if (!(event instanceof NavigationEnd))
                return;
            this.syncSelectedDocumentFromUrl(event.urlAfterRedirects);
        });
        effect(() => {
            const params = this.queryParams();
            const getSelected = (id) => new Set(params.get(id)?.split(',').filter(Boolean) ?? []);
            const fulltext = params.get('ecm_fulltext') ?? '';
            this.secondarySearchInput.set(fulltext);
            const aggs = this.aggregationService.aggregations();
            this.filterGroups.update((groups) => groups.map((g) => {
                const selectedFromUrl = getSelected(g.id);
                if (!DYNAMIC_GROUPS.has(g.id)) {
                    return {
                        ...g,
                        options: g.options.map((o) => ({
                            ...o,
                            selected: selectedFromUrl.has(o.value),
                        })),
                    };
                }
                const aggField = this.GROUP_AGG_KEY[g.id];
                const buckets = aggs[aggField]?.buckets ?? [];
                const options = buckets.map((b) => {
                    const label = g.id === 'asset-format' ? toMimeType(b.key) : b.key;
                    const value = g.id === 'asset-format' ? toMimeType(b.key) : b.key;
                    return { label, value, selected: selectedFromUrl.has(value), aggKey: b.key };
                });
                return { ...g, options };
            }));
        });
        effect(() => {
            localStorage.setItem('assets_drawer_view_mode', this.viewMode());
        });
    }
    switchToQueueView() {
        this.viewMode.set('queue');
        const items = this.aggregationService.items();
        const docId = this.selectedDocumentId();
        const selectedInResults = !!docId && items.some((item) => item.id === docId);
        if (selectedInResults) {
            void this.router.navigate(['/doc', docId], {
                queryParams: this.buildFilterQueryParams(),
            });
            return;
        }
        if (items.length > 0) {
            void this.router.navigate(['/doc', items[0].id], {
                queryParams: this.buildFilterQueryParams(),
            });
        }
    }
    switchToFilterView() {
        this.viewMode.set('filter');
        void this.router.navigate(['/documents'], {
            queryParams: this.buildFilterQueryParams(),
        });
    }
    onQueueItemSelected(item) {
        void this.router.navigate(['/doc', item.id], {
            queryParams: this.buildFilterQueryParams(),
        });
    }
    onFilterSearchFocus() {
        this.filterSearchOpen.set(true);
        this.loadSavedSearchesFromApi();
    }
    closeFilterSearchDropdown() {
        setTimeout(() => this.filterSearchOpen.set(false), 120);
    }
    selectFilterOption(option) {
        this.filterSearchInput.set(option.label);
        this.savedSearchFilter.set('');
        this.selectedSavedSearch.set(option.value);
        this.filterSearchOpen.set(false);
        this.aggregationService.selectedSavedSearchId.set(option.value);
        this.aggregationService.selectedSavedSearchTitle.set(option.label);
        this.searchService.getSavedSearchById(option.value).subscribe({
            next: (params) => {
                this.applySavedSearchParams(params);
            },
        });
    }
    onSecondarySearchInput(value) {
        this.secondarySearchInput.set(value);
    }
    onSecondarySearchEnter() {
        const value = this.secondarySearchInput().trim();
        void this.router.navigate(['/documents'], {
            queryParams: {
                ecm_fulltext: value ? value : null,
            },
            queryParamsHandling: 'merge',
        });
    }
    onSecondarySearchClear() {
        this.secondarySearchInput.set('');
        this.onSecondarySearchEnter();
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
                params: this.buildSavedSearchParams(),
                pageProviderName: 'assets_search',
            })
                .subscribe({
                next: () => {
                    this.savedSearchesLoaded.set(false);
                    this.loadSavedSearchesFromApi();
                    this.snackBar.open(this.translate.instant('common.search-saved', { name: trimmedTitle }), this.translate.instant('common.ok'), { duration: 3000 });
                },
                error: () => {
                    this.snackBar.open(this.translate.instant('assets.message.failed-to-save-search'), this.translate.instant('common.dismiss'), { duration: 5000 });
                },
            });
        });
    }
    isExpanded(id) {
        return this.expandedFilters().has(id);
    }
    toggleFilter(id) {
        this.expandedFilters.update((set) => {
            const next = new Set(set);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    }
    resetFilters() {
        this.secondarySearchInput.set('');
        this.filterGroups.update((groups) => groups.map((g) => ({ ...g, options: g.options.map((o) => ({ ...o, selected: false })) })));
        this.filterSearchInput.set('');
        this.savedSearchFilter.set('');
        this.selectedSavedSearch.set('');
        this.aggregationService.selectedSavedSearchId.set('');
        this.aggregationService.selectedSavedSearchTitle.set('');
        const clearedParams = { ecm_fulltext: null };
        for (const group of this.filterGroups()) {
            clearedParams[group.id] = null;
        }
        void this.router.navigate(['/documents'], {
            queryParams: clearedParams,
        });
    }
    applySearch() {
        void this.router.navigate(['/documents'], {
            queryParams: this.buildFilterQueryParams(),
        });
    }
    buildFilterQueryParams() {
        const queryParams = {};
        for (const group of this.filterGroups()) {
            const selected = group.options.filter((o) => o.selected).map((o) => o.value);
            if (selected.length > 0) {
                queryParams[group.id] = selected.join(',');
            }
        }
        return queryParams;
    }
    buildSavedSearchParams() {
        const params = this.buildFilterQueryParams();
        const ecmFulltext = this.secondarySearchInput().trim();
        if (ecmFulltext) {
            params['ecm_fulltext'] = ecmFulltext;
        }
        return params;
    }
    toggleOption(groupId, value) {
        this.filterGroups.update((groups) => groups.map((g) => g.id === groupId
            ? {
                ...g,
                options: g.options.map((o) => o.value === value ? { ...o, selected: !o.selected } : o),
            }
            : g));
        if (this.autoSearch()) {
            void this.router.navigate(['/documents'], {
                queryParams: this.buildFilterQueryParams(),
            });
        }
    }
    applySavedSearchParams(params) {
        const get = (key) => params[key]?.trim() ?? '';
        const parseJsonArray = (raw) => {
            if (!raw)
                return null;
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    return parsed
                        .map(String)
                        .map((v) => v.trim())
                        .filter(Boolean);
                }
            }
            catch {
                // not JSON
            }
            return null;
        };
        const getValues = (...keys) => {
            for (const key of keys) {
                const raw = get(key);
                if (!raw)
                    continue;
                const parsed = parseJsonArray(raw);
                if (parsed && parsed.length > 0)
                    return parsed;
                const split = raw
                    .split(',')
                    .map((v) => v.trim())
                    .filter(Boolean);
                if (split.length > 0)
                    return split;
            }
            return [];
        };
        const firstValue = (...keys) => getValues(...keys)[0] ?? '';
        const queryParams = {};
        for (const group of this.filterGroups()) {
            const keys = DYNAMIC_GROUPS.has(group.id)
                ? [group.id]
                : [group.id, this.GROUP_AGG_KEY[group.id] ?? ''];
            const values = getValues(...keys);
            queryParams[group.id] = values.length > 0 ? values.join(',') : null;
        }
        const ecmFulltext = firstValue('ecm_fulltext', 'ecmFulltext');
        queryParams['ecm_fulltext'] = ecmFulltext || null;
        // Navigate with normalized saved params and clear missing filters to avoid stale state.
        void this.router.navigate(['/documents'], { queryParams });
    }
    syncSelectedDocumentFromUrl(url) {
        const urlParts = url.split('/');
        const docIndex = urlParts.indexOf('doc');
        if (docIndex !== -1 && docIndex + 1 < urlParts.length) {
            this.selectedDocumentId.set(urlParts[docIndex + 1].split('?')[0]);
            return;
        }
        this.selectedDocumentId.set('');
    }
    loadViewModeFromStorage() {
        return 'filter';
    }
    loadSavedSearchesFromApi() {
        if (this.savedSearchesLoaded() || this.savedSearchesLoading())
            return;
        this.savedSearchesLoading.set(true);
        this.searchService.getSavedSearches('assets_search').subscribe({
            next: (items) => {
                this.availableSavedSearches.set(items.map((item) => this.toSavedSearchOption(item)));
                this.savedSearchesLoaded.set(true);
                this.savedSearchesLoading.set(false);
            },
            error: () => {
                this.savedSearchesLoading.set(false);
            },
        });
    }
    toSavedSearchOption(item) {
        return {
            key: item.id,
            value: item.id,
            label: item.title,
            query: item.query,
        };
    }
    static ɵfac = function AssetsDrawerComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AssetsDrawerComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AssetsDrawerComponent, selectors: [["lib-assets-drawer"]], decls: 21, vars: 23, consts: [[1, "drawer-header-actions"], [1, "drawer-search-row-primary"], [1, "saved-filters-dropdown", 3, "blur"], ["type", "button", 1, "saved-filters-trigger", 3, "click", "focus"], [1, "saved-filters-label"], [1, "saved-filters-arrow"], [1, "saved-filters-panel"], ["mat-icon-button", "", "type", "button", 1, "queue-toggle-btn", 3, "click", "matTooltip"], [3, "selectedItemId"], [1, "saved-filters-empty"], [1, "saved-filters-search"], ["type", "text", 1, "saved-filters-search-input", 3, "input", "placeholder", "value"], ["type", "button", 1, "saved-filters-option"], ["type", "button", 1, "saved-filters-option", 3, "mousedown"], [1, "saved-filter-icon"], [1, "filters-section"], [1, "filters-heading"], [1, "filter-group"], [1, "filter-title"], [1, "filter-input-wrap"], ["type", "text", 1, "filter-input", 3, "input", "keydown.enter", "placeholder", "value"], ["type", "button", 1, "clear-btn"], [1, "drawer-footer"], [1, "footer-toggle-row"], [1, "footer-toggle-label"], ["color", "primary", 3, "change", "checked"], [1, "footer-actions"], ["mat-stroked-button", "", "type", "button", 1, "footer-btn", "reset-btn", 3, "click"], ["mat-flat-button", "", "color", "primary", "type", "button", 1, "footer-btn", "save-as-btn", 3, "click", "disabled"], ["mat-flat-button", "", "color", "primary", "type", "button", 1, "footer-btn", "search-btn"], ["type", "button", 1, "clear-btn", 3, "click"], ["type", "button", 1, "filter-btn", 3, "click"], [1, "filter-btn-label"], [1, "filter-btn-icon"], [1, "filter-options"], [1, "filter-no-results"], [1, "filter-checkbox", 3, "checked"], [1, "filter-checkbox", 3, "change", "checked"], ["mat-flat-button", "", "color", "primary", "type", "button", 1, "footer-btn", "search-btn", 3, "click"], [3, "itemSelected", "selectedItemId"]], template: function AssetsDrawerComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "div", 2);
            i0.ɵɵlistener("blur", function AssetsDrawerComponent_Template_div_blur_2_listener() { return ctx.closeFilterSearchDropdown(); });
            i0.ɵɵelementStart(3, "button", 3);
            i0.ɵɵpipe(4, "translate");
            i0.ɵɵlistener("click", function AssetsDrawerComponent_Template_button_click_3_listener() { return ctx.onFilterSearchFocus(); })("focus", function AssetsDrawerComponent_Template_button_focus_3_listener() { return ctx.onFilterSearchFocus(); });
            i0.ɵɵelementStart(5, "span", 4);
            i0.ɵɵtext(6);
            i0.ɵɵpipe(7, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "mat-icon", 5);
            i0.ɵɵtext(9, "arrow_drop_down");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(10, AssetsDrawerComponent_Conditional_10_Template, 4, 1, "div", 6);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(11, "button", 7);
            i0.ɵɵpipe(12, "translate");
            i0.ɵɵpipe(13, "translate");
            i0.ɵɵpipe(14, "translate");
            i0.ɵɵpipe(15, "translate");
            i0.ɵɵlistener("click", function AssetsDrawerComponent_Template_button_click_11_listener() { return ctx.viewMode() === "filter" ? ctx.switchToQueueView() : ctx.switchToFilterView(); });
            i0.ɵɵelementStart(16, "mat-icon");
            i0.ɵɵtext(17);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelement(18, "mat-divider");
            i0.ɵɵconditionalCreate(19, AssetsDrawerComponent_Conditional_19_Template, 29, 23);
            i0.ɵɵconditionalCreate(20, AssetsDrawerComponent_Conditional_20_Template, 1, 1, "lib-assets-queue", 8);
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵattribute("aria-expanded", ctx.filterSearchOpen())("aria-label", ctx.filterSearchInput() || i0.ɵɵpipeBind1(4, 11, "assets.saved-searches"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.filterSearchInput() || i0.ɵɵpipeBind1(7, 13, "assets.search-filters"));
            i0.ɵɵadvance(4);
            i0.ɵɵconditional(ctx.filterSearchOpen() ? 10 : -1);
            i0.ɵɵadvance();
            i0.ɵɵclassProp("active", ctx.viewMode() === "queue");
            i0.ɵɵproperty("matTooltip", ctx.viewMode() === "filter" ? i0.ɵɵpipeBind1(12, 15, "assets.switch-to-queue-view") : i0.ɵɵpipeBind1(13, 17, "assets.switch-to-filter-view"));
            i0.ɵɵattribute("aria-label", ctx.viewMode() === "filter" ? i0.ɵɵpipeBind1(14, 19, "assets.switch-to-queue-view") : i0.ɵɵpipeBind1(15, 21, "assets.switch-to-filter-view"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(ctx.viewMode() === "filter" ? "view_list" : "filter_list");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.viewMode() === "filter" ? 19 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.viewMode() === "queue" ? 20 : -1);
        } }, dependencies: [MatIconModule, i1.MatIcon, MatButtonModule, i2.MatButton, i2.MatIconButton, MatCheckboxModule, i3.MatCheckbox, MatDividerModule, i4.MatDivider, MatSlideToggleModule, i5.MatSlideToggle, MatSnackBarModule,
            MatTooltipModule, i6.MatTooltip, AssetsQueueComponent,
            DescriptorLabelPipe,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n}\n\n.drawer-header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  padding: 12px 16px;\n}\n\n.drawer-search-row-primary[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  align-items: center;\n}\n\n.saved-filters-dropdown[_ngcontent-%COMP%] {\n  position: relative;\n  flex: 1;\n}\n\n.saved-filters-trigger[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  background: none;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n  padding: 6px 8px;\n  cursor: pointer;\n  font: inherit;\n  font-size: 13px;\n  color: #333;\n  width: 100%;\n\n  &:hover {\n    border-color: #999;\n  }\n}\n\n.saved-filters-label[_ngcontent-%COMP%] {\n  flex: 1;\n  text-align: left;\n}\n\n.saved-filters-arrow[_ngcontent-%COMP%] {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: #666;\n}\n\n.saved-filters-panel[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: calc(100% + 2px);\n  background: #fff;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);\n  z-index: 20;\n  max-height: 200px;\n  overflow-y: auto;\n}\n\n.saved-filters-empty[_ngcontent-%COMP%] {\n  padding: 10px 12px;\n  font-size: 13px;\n  color: #999;\n}\n\n.saved-filters-search[_ngcontent-%COMP%] {\n  padding: 6px 8px;\n  border-bottom: 1px solid #eee;\n}\n\n.saved-filters-search-input[_ngcontent-%COMP%] {\n  width: 100%;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  padding: 4px 8px;\n  font-size: 13px;\n  outline: none;\n\n  &:focus {\n    border-color: #3f51b5;\n  }\n}\n\n.saved-filters-option[_ngcontent-%COMP%] {\n  width: 100%;\n  text-align: left;\n  border: none;\n  background: #fff;\n  padding: 8px 12px;\n  font-size: 13px;\n  cursor: pointer;\n  color: #333;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n\n  &:hover {\n    background: #e3f2fd;\n    color: #1565c0;\n  }\n}\n\n.saved-filters-default[_ngcontent-%COMP%] {\n  border-bottom: 1px solid #eee;\n}\n\n.saved-filter-icon[_ngcontent-%COMP%] {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: #888;\n}\n\n.drawer-search-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  align-items: center;\n}\n\n.drawer-search[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 12px;\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  background: #fafafa;\n}\n.typeahead-input-wrap[_ngcontent-%COMP%] {\n  position: relative;\n  border-bottom: 1px solid #4c4b67;\n}\n\n.typeahead-input[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  width: 100%;\n  border: none;\n  background: transparent;\n  font-size: 14px;\n  font-family: inherit;\n  line-height: 1.2;\n  color: #4c4b67;\n  padding: 0 28px 8px 0;\n  outline: none;\n  text-align: left;\n  cursor: pointer;\n\n  &::placeholder {\n    color: #4f6382;\n    opacity: 1;\n  }\n}\n\n.typeahead-arrow[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 0;\n  top: 50%;\n  transform: translateY(calc(-50% - 4px));\n  color: #4c4b67;\n  pointer-events: none;\n}\n\n.typeahead-panel[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: calc(100% + 2px);\n  background: #fff;\n  border-radius: 0 0 4px 4px;\n  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.24);\n  z-index: 20;\n  max-height: 220px;\n  overflow-y: auto;\n}\n\n.typeahead-hint[_ngcontent-%COMP%] {\n  padding: 10px 12px;\n  color: #4c4b67;\n  font-size: 15px;\n}\n\n.typeahead-option[_ngcontent-%COMP%] {\n  width: 100%;\n  text-align: left;\n  border: none;\n  background: #fff;\n  color: #333;\n  padding: 10px 12px;\n  font-size: 13px;\n  cursor: pointer;\n\n  &:hover {\n    background: #f5f5f5;\n  }\n}\n\n.drawer-search-primary[_ngcontent-%COMP%] {\n  flex: 1;\n}\n\n.drawer-search-secondary[_ngcontent-%COMP%] {\n  flex: 1;\n}\n\n.queue-toggle-btn[_ngcontent-%COMP%] {\n  margin: 0;\n  flex-shrink: 0;\n\n  &.active {\n    background-color: #f0f0f0;\n  }\n}\n\n.saved-search-menu-btn[_ngcontent-%COMP%] {\n  margin: 0;\n  flex-shrink: 0;\n}\n\n.search-icon[_ngcontent-%COMP%] {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: #999;\n}\n\n.search-input[_ngcontent-%COMP%] {\n  border: none;\n  outline: none;\n  background: transparent;\n  font-size: 14px;\n  width: 100%;\n  color: #333;\n\n  &::placeholder {\n    color: #aaa;\n  }\n}\n\n.filters-section[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 8px 0;\n}\n\n.filters-heading[_ngcontent-%COMP%] {\n  font-size: 11px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  color: #999;\n  padding: 4px 16px 8px;\n  margin: 0;\n}\n\n.filter-group[_ngcontent-%COMP%] {\n  border-bottom: 1px solid #f5f5f5;\n  padding: 10px 16px 12px;\n}\n\n.filter-title[_ngcontent-%COMP%] {\n  margin: 0 0 8px;\n  font-size: 13px;\n  font-weight: 600;\n  color: #333;\n}\n\n.filter-input-wrap[_ngcontent-%COMP%] {\n  position: relative;\n}\n\n.filter-input[_ngcontent-%COMP%] {\n  width: 100%;\n  border: none;\n  border-bottom: 1px solid #4c4b67;\n  background: transparent;\n  font-size: 14px;\n  color: #333;\n  padding: 0 28px 8px 0;\n  outline: none;\n  box-sizing: border-box;\n\n  &::placeholder {\n    color: #aaa;\n  }\n\n  &:focus {\n    border-bottom-color: #3f51b5;\n  }\n}\n\n.clear-btn[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 0;\n  bottom: 4px;\n  border: none;\n  background: none;\n  cursor: pointer;\n  padding: 0;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n    color: #999;\n  }\n}\n\n.filter-btn[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  width: 100%;\n  padding: 2px 0 4px;\n  background: none;\n  border: none;\n  cursor: pointer;\n  text-align: left;\n  color: #333;\n\n  &:hover {\n    background: #f5f5f5;\n  }\n}\n\n.filter-btn-label[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 500;\n}\n\n.filter-btn-icon[_ngcontent-%COMP%] {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: #666;\n  flex-shrink: 0;\n}\n\n.filter-options[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  padding: 4px 0 0;\n  gap: 4px;\n}\n\n.filter-checkbox[_ngcontent-%COMP%] {\n  display: block;\n}\n\n.filter-no-results[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: #aaa;\n  padding: 4px 0;\n  display: block;\n}\n\n.drawer-footer[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  padding: 12px 16px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n.footer-toggle-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.footer-toggle-label[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: #444;\n  font-weight: 500;\n}\n\n.footer-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n}\n\n.footer-btn[_ngcontent-%COMP%] {\n  flex: 1;\n}\n\n.reset-btn[_ngcontent-%COMP%] {\n  flex: 1;\n}\n\n.save-as-btn[_ngcontent-%COMP%] {\n  background: var(--mat-sys-primary, #3f51b5);\n  color: #fff;\n}\n\n.search-btn[_ngcontent-%COMP%] {\n  flex: 1;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AssetsDrawerComponent, [{
        type: Component,
        args: [{ selector: 'lib-assets-drawer', standalone: true, imports: [
                    DescriptorLabelPipe,
                    TranslatePipe,
                    MatIconModule,
                    MatButtonModule,
                    MatCheckboxModule,
                    MatDividerModule,
                    MatSlideToggleModule,
                    MatSnackBarModule,
                    MatTooltipModule,
                    AssetsQueueComponent,
                ], template: "<div class=\"drawer-header-actions\">\n  <div class=\"drawer-search-row-primary\">\n    <div class=\"saved-filters-dropdown\" (blur)=\"closeFilterSearchDropdown()\">\n      <button\n        class=\"saved-filters-trigger\"\n        type=\"button\"\n        [attr.aria-expanded]=\"filterSearchOpen()\"\n        [attr.aria-label]=\"filterSearchInput() || ('assets.saved-searches' | translate)\"\n        (click)=\"onFilterSearchFocus()\"\n        (focus)=\"onFilterSearchFocus()\"\n      >\n        <span class=\"saved-filters-label\">{{\n          filterSearchInput() || ('assets.search-filters' | translate)\n        }}</span>\n        <mat-icon class=\"saved-filters-arrow\">arrow_drop_down</mat-icon>\n      </button>\n\n      @if (filterSearchOpen()) {\n        <div class=\"saved-filters-panel\">\n          @if (savedSearchesLoading()) {\n            <div class=\"saved-filters-empty\">\n              {{ 'assets.assets-drawer.loading-saved-searches' | translate }}\n            </div>\n          } @else if (availableSavedSearches().length === 0) {\n            <div class=\"saved-filters-empty\">\n              {{ 'assets.assets-drawer.no-saved-searches' | translate }}\n            </div>\n          } @else {\n            <div class=\"saved-filters-search\">\n              <input\n                class=\"saved-filters-search-input\"\n                type=\"text\"\n                [placeholder]=\"'assets.assets-drawer.search' | translate\"\n                [value]=\"savedSearchFilter()\"\n                (input)=\"savedSearchFilter.set($any($event.target).value)\"\n              />\n            </div>\n            @if (filteredSavedSearches().length === 0) {\n              <div class=\"saved-filters-empty\">\n                {{ 'assets.assets-drawer.no-matching-saved-searches' | translate }}\n              </div>\n            } @else {\n              @for (option of filteredSavedSearches(); track option.key) {\n                <button\n                  class=\"saved-filters-option\"\n                  type=\"button\"\n                  (mousedown)=\"selectFilterOption(option)\"\n                >\n                  <mat-icon class=\"saved-filter-icon\">bookmark</mat-icon>\n                  {{ option.label }}\n                </button>\n              }\n            }\n          }\n        </div>\n      }\n    </div>\n\n    <button\n      mat-icon-button\n      [matTooltip]=\"\n        viewMode() === 'filter'\n          ? ('assets.switch-to-queue-view' | translate)\n          : ('assets.switch-to-filter-view' | translate)\n      \"\n      [attr.aria-label]=\"\n        viewMode() === 'filter'\n          ? ('assets.switch-to-queue-view' | translate)\n          : ('assets.switch-to-filter-view' | translate)\n      \"\n      (click)=\"viewMode() === 'filter' ? switchToQueueView() : switchToFilterView()\"\n      type=\"button\"\n      class=\"queue-toggle-btn\"\n      [class.active]=\"viewMode() === 'queue'\"\n    >\n      <mat-icon>{{ viewMode() === 'filter' ? 'view_list' : 'filter_list' }}</mat-icon>\n    </button>\n  </div>\n</div>\n\n<mat-divider />\n\n@if (viewMode() === 'filter') {\n  <div class=\"filters-section\">\n    <p class=\"filters-heading\">{{ 'assets.assets-drawer.filters' | translate }}</p>\n\n    <div class=\"filter-group\">\n      <p class=\"filter-title\">{{ 'assets.assets-drawer.full-text' | translate }}</p>\n      <div class=\"filter-input-wrap\">\n        <input\n          class=\"filter-input\"\n          type=\"text\"\n          [placeholder]=\"'assets.assets-drawer.search-for-something' | translate\"\n          [value]=\"secondarySearchInput()\"\n          (input)=\"onSecondarySearchInput($any($event.target).value)\"\n          (keydown.enter)=\"onSecondarySearchEnter()\"\n        />\n        @if (secondarySearchInput().trim()) {\n          <button class=\"clear-btn\" type=\"button\" (click)=\"onSecondarySearchClear()\">\n            <mat-icon>close</mat-icon>\n          </button>\n        }\n      </div>\n    </div>\n\n    @for (group of filterGroups(); track group.id) {\n      <div class=\"filter-group\">\n        <button class=\"filter-btn\" type=\"button\" (click)=\"toggleFilter(group.id)\">\n          <span class=\"filter-btn-label\">{{ group | descriptorLabel }}</span>\n          <mat-icon class=\"filter-btn-icon\">\n            {{ isExpanded(group.id) ? 'expand_less' : 'expand_more' }}\n          </mat-icon>\n        </button>\n\n        @if (isExpanded(group.id)) {\n          <div class=\"filter-options\">\n            @if (dynamicGroups.has(group.id) && group.options.length === 0) {\n              <span class=\"filter-no-results\">{{\n                'assets.assets-drawer.no-available-results' | translate\n              }}</span>\n            } @else {\n              @for (option of group.options; track option.value) {\n                <mat-checkbox\n                  [checked]=\"option.selected\"\n                  (change)=\"toggleOption(group.id, option.value)\"\n                  class=\"filter-checkbox\"\n                >\n                  {{ option | descriptorLabel }}{{ getCountText(group.id, option.aggKey) }}\n                </mat-checkbox>\n              }\n            }\n          </div>\n        }\n      </div>\n    }\n  </div>\n\n  <mat-divider />\n\n  <div class=\"drawer-footer\">\n    <div class=\"footer-toggle-row\">\n      <span class=\"footer-toggle-label\">{{ 'assets.assets-drawer.auto-search' | translate }}</span>\n      <mat-slide-toggle\n        [checked]=\"autoSearch()\"\n        (change)=\"autoSearch.set($event.checked)\"\n        color=\"primary\"\n      />\n    </div>\n\n    <div class=\"footer-actions\">\n      <button\n        mat-stroked-button\n        class=\"footer-btn reset-btn\"\n        type=\"button\"\n        (click)=\"resetFilters()\"\n      >\n        {{ 'assets.assets-drawer.reset' | translate }}\n      </button>\n      <button\n        mat-flat-button\n        color=\"primary\"\n        class=\"footer-btn save-as-btn\"\n        type=\"button\"\n        [disabled]=\"!hasActiveFilters()\"\n        (click)=\"openSaveAsDialog()\"\n      >\n        {{ 'assets.assets-drawer.save-as' | translate }}\n      </button>\n      @if (!autoSearch()) {\n        <button\n          mat-flat-button\n          color=\"primary\"\n          class=\"footer-btn search-btn\"\n          type=\"button\"\n          (click)=\"applySearch()\"\n        >\n          {{ 'assets.assets-drawer.search-2' | translate }}\n        </button>\n      }\n    </div>\n  </div>\n}\n\n@if (viewMode() === 'queue') {\n  <lib-assets-queue\n    [selectedItemId]=\"selectedDocumentId()\"\n    (itemSelected)=\"onQueueItemSelected($event)\"\n  ></lib-assets-queue>\n}\n", styles: [":host {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n}\n\n.drawer-header-actions {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  padding: 12px 16px;\n}\n\n.drawer-search-row-primary {\n  display: flex;\n  gap: 8px;\n  align-items: center;\n}\n\n.saved-filters-dropdown {\n  position: relative;\n  flex: 1;\n}\n\n.saved-filters-trigger {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  background: none;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n  padding: 6px 8px;\n  cursor: pointer;\n  font: inherit;\n  font-size: 13px;\n  color: #333;\n  width: 100%;\n\n  &:hover {\n    border-color: #999;\n  }\n}\n\n.saved-filters-label {\n  flex: 1;\n  text-align: left;\n}\n\n.saved-filters-arrow {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: #666;\n}\n\n.saved-filters-panel {\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: calc(100% + 2px);\n  background: #fff;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);\n  z-index: 20;\n  max-height: 200px;\n  overflow-y: auto;\n}\n\n.saved-filters-empty {\n  padding: 10px 12px;\n  font-size: 13px;\n  color: #999;\n}\n\n.saved-filters-search {\n  padding: 6px 8px;\n  border-bottom: 1px solid #eee;\n}\n\n.saved-filters-search-input {\n  width: 100%;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  padding: 4px 8px;\n  font-size: 13px;\n  outline: none;\n\n  &:focus {\n    border-color: #3f51b5;\n  }\n}\n\n.saved-filters-option {\n  width: 100%;\n  text-align: left;\n  border: none;\n  background: #fff;\n  padding: 8px 12px;\n  font-size: 13px;\n  cursor: pointer;\n  color: #333;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n\n  &:hover {\n    background: #e3f2fd;\n    color: #1565c0;\n  }\n}\n\n.saved-filters-default {\n  border-bottom: 1px solid #eee;\n}\n\n.saved-filter-icon {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: #888;\n}\n\n.drawer-search-row {\n  display: flex;\n  gap: 8px;\n  align-items: center;\n}\n\n.drawer-search {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 12px;\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  background: #fafafa;\n}\n.typeahead-input-wrap {\n  position: relative;\n  border-bottom: 1px solid #4c4b67;\n}\n\n.typeahead-input {\n  display: flex;\n  align-items: center;\n  width: 100%;\n  border: none;\n  background: transparent;\n  font-size: 14px;\n  font-family: inherit;\n  line-height: 1.2;\n  color: #4c4b67;\n  padding: 0 28px 8px 0;\n  outline: none;\n  text-align: left;\n  cursor: pointer;\n\n  &::placeholder {\n    color: #4f6382;\n    opacity: 1;\n  }\n}\n\n.typeahead-arrow {\n  position: absolute;\n  right: 0;\n  top: 50%;\n  transform: translateY(calc(-50% - 4px));\n  color: #4c4b67;\n  pointer-events: none;\n}\n\n.typeahead-panel {\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: calc(100% + 2px);\n  background: #fff;\n  border-radius: 0 0 4px 4px;\n  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.24);\n  z-index: 20;\n  max-height: 220px;\n  overflow-y: auto;\n}\n\n.typeahead-hint {\n  padding: 10px 12px;\n  color: #4c4b67;\n  font-size: 15px;\n}\n\n.typeahead-option {\n  width: 100%;\n  text-align: left;\n  border: none;\n  background: #fff;\n  color: #333;\n  padding: 10px 12px;\n  font-size: 13px;\n  cursor: pointer;\n\n  &:hover {\n    background: #f5f5f5;\n  }\n}\n\n.drawer-search-primary {\n  flex: 1;\n}\n\n.drawer-search-secondary {\n  flex: 1;\n}\n\n.queue-toggle-btn {\n  margin: 0;\n  flex-shrink: 0;\n\n  &.active {\n    background-color: #f0f0f0;\n  }\n}\n\n.saved-search-menu-btn {\n  margin: 0;\n  flex-shrink: 0;\n}\n\n.search-icon {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: #999;\n}\n\n.search-input {\n  border: none;\n  outline: none;\n  background: transparent;\n  font-size: 14px;\n  width: 100%;\n  color: #333;\n\n  &::placeholder {\n    color: #aaa;\n  }\n}\n\n.filters-section {\n  flex: 1;\n  overflow-y: auto;\n  padding: 8px 0;\n}\n\n.filters-heading {\n  font-size: 11px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  color: #999;\n  padding: 4px 16px 8px;\n  margin: 0;\n}\n\n.filter-group {\n  border-bottom: 1px solid #f5f5f5;\n  padding: 10px 16px 12px;\n}\n\n.filter-title {\n  margin: 0 0 8px;\n  font-size: 13px;\n  font-weight: 600;\n  color: #333;\n}\n\n.filter-input-wrap {\n  position: relative;\n}\n\n.filter-input {\n  width: 100%;\n  border: none;\n  border-bottom: 1px solid #4c4b67;\n  background: transparent;\n  font-size: 14px;\n  color: #333;\n  padding: 0 28px 8px 0;\n  outline: none;\n  box-sizing: border-box;\n\n  &::placeholder {\n    color: #aaa;\n  }\n\n  &:focus {\n    border-bottom-color: #3f51b5;\n  }\n}\n\n.clear-btn {\n  position: absolute;\n  right: 0;\n  bottom: 4px;\n  border: none;\n  background: none;\n  cursor: pointer;\n  padding: 0;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n    color: #999;\n  }\n}\n\n.filter-btn {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  width: 100%;\n  padding: 2px 0 4px;\n  background: none;\n  border: none;\n  cursor: pointer;\n  text-align: left;\n  color: #333;\n\n  &:hover {\n    background: #f5f5f5;\n  }\n}\n\n.filter-btn-label {\n  font-size: 14px;\n  font-weight: 500;\n}\n\n.filter-btn-icon {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: #666;\n  flex-shrink: 0;\n}\n\n.filter-options {\n  display: flex;\n  flex-direction: column;\n  padding: 4px 0 0;\n  gap: 4px;\n}\n\n.filter-checkbox {\n  display: block;\n}\n\n.filter-no-results {\n  font-size: 12px;\n  color: #aaa;\n  padding: 4px 0;\n  display: block;\n}\n\n.drawer-footer {\n  flex-shrink: 0;\n  padding: 12px 16px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n.footer-toggle-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.footer-toggle-label {\n  font-size: 13px;\n  color: #444;\n  font-weight: 500;\n}\n\n.footer-actions {\n  display: flex;\n  gap: 8px;\n}\n\n.footer-btn {\n  flex: 1;\n}\n\n.reset-btn {\n  flex: 1;\n}\n\n.save-as-btn {\n  background: var(--mat-sys-primary, #3f51b5);\n  color: #fff;\n}\n\n.search-btn {\n  flex: 1;\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AssetsDrawerComponent, { className: "AssetsDrawerComponent", filePath: "libs/features/assets/src/lib/assets-drawer/assets-drawer.component.ts", lineNumber: 91 }); })();
