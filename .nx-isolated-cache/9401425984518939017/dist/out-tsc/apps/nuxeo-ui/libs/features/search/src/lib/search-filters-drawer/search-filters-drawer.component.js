import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NxsSavedSearchSelectComponent, NxsSearchFiltersComponent, NxsToastService, provideNxsToast, } from '@nuxeo/satori-platform/components';
import { DirectoryService, FOLDERISH_TYPES, SearchAggregationService, } from '@nuxeo/satori-platform/nuxeo-client';
import { SearchQueueComponent } from '../search-queue/search-queue.component';
import { loadFacetLabels } from './facet-labels';
import { askSavedSearchName } from '../search-session/saved-search-dialogs';
import { SEARCH_PAGE_PROVIDER, SearchSession } from '../search-session/search-session';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/divider";
import * as i3 from "@angular/material/icon";
import * as i4 from "@angular/material/tooltip";
function SearchFiltersDrawerComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nxs-search-filters", 6);
    i0.ɵɵlistener("filtersChange", function SearchFiltersDrawerComponent_Conditional_8_Template_nxs_search_filters_filtersChange_0_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onFiltersChange($event)); })("filtersReset", function SearchFiltersDrawerComponent_Conditional_8_Template_nxs_search_filters_filtersReset_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onReset()); })("saveAs", function SearchFiltersDrawerComponent_Conditional_8_Template_nxs_search_filters_saveAs_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.openSaveAsDialog()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("filters", ctx_r1.filters())("aggregations", ctx_r1.aggregations())("optionLabels", ctx_r1.facetLabels());
} }
function SearchFiltersDrawerComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "lib-search-queue", 7);
    i0.ɵɵlistener("switchToFilter", function SearchFiltersDrawerComponent_Conditional_9_Template_lib_search_queue_switchToFilter_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.switchToFilterView()); })("quickFilterToggled", function SearchFiltersDrawerComponent_Conditional_9_Template_lib_search_queue_quickFilterToggled_0_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.toggleQueueQuickFilter($event)); })("itemSelected", function SearchFiltersDrawerComponent_Conditional_9_Template_lib_search_queue_itemSelected_0_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onQueueItemSelected($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("selectedItemId", ctx_r1.selectedDocumentId())("activeFilters", ctx_r1.activeFiltersForQueue());
} }
const QUEUE_QUICK_FILTER_OPTIONS = [
    { labelKey: 'search.filter.option.no-containers', label: 'No Containers', value: 'noFolder' },
    { labelKey: 'search.filter.option.most-recent', label: 'Most Recent', value: 'mostRecent' },
    { labelKey: 'search.filter.option.validated', label: 'Validated', value: 'onlyValidated' },
];
/**
 * The search drawer: the saved searches, the filters and the queue — Web UI's search form.
 *
 * Registered as `app.sidebar.searchFilters`. It composes `nxs-saved-search-select` and
 * `nxs-search-filters` over {@link SearchSession}, which runs the one search the drawer, its queue
 * and the search page share; the drawer sends no search of its own.
 */
export class SearchFiltersDrawerComponent {
    session = inject(SearchSession);
    searchAggregationService = inject(SearchAggregationService);
    directoryService = inject(DirectoryService);
    router = inject(Router);
    activatedRoute = inject(ActivatedRoute);
    dialog = inject(MatDialog);
    translate = inject(TranslateService);
    toast = inject(NxsToastService);
    destroyRef = inject(DestroyRef);
    pageProvider = SEARCH_PAGE_PROVIDER;
    viewMode = signal('filter', ...(ngDevMode ? [{ debugName: "viewMode" }] : []));
    selectedDocumentId = signal('', ...(ngDevMode ? [{ debugName: "selectedDocumentId" }] : []));
    selectedQueueQuickFilters = signal(new Set(), ...(ngDevMode ? [{ debugName: "selectedQueueQuickFilters" }] : []));
    filters = this.session.filters;
    savedSearchId = this.session.savedSearchId;
    savedSearchTitle = this.session.savedSearchTitle;
    savedSearchesVersion = this.session.savedSearchesVersion;
    /** The shared search's state. Subscribing keeps it running while the drawer is open. */
    results = toSignal(this.session.results$);
    aggregations = computed(() => this.results()?.aggregations ?? {}, ...(ngDevMode ? [{ debugName: "aggregations" }] : []));
    /** The nature, subject and coverage labels, in the language the app is shown in. */
    facetLabels = toSignal(this.translate.onLangChange.pipe(map((event) => event.lang), startWith(this.translate.currentLang || this.translate.defaultLang || 'en'), switchMap((lang) => loadFacetLabels(this.directoryService, lang))), { initialValue: {} });
    activeFiltersForQueue = computed(() => {
        const selected = this.selectedQueueQuickFilters();
        return QUEUE_QUICK_FILTER_OPTIONS.map((option) => ({
            label: option.label,
            value: option.value,
            selected: selected.has(option.value),
        }));
    }, ...(ngDevMode ? [{ debugName: "activeFiltersForQueue" }] : []));
    constructor() {
        this.activatedRoute.parent?.params.pipe(takeUntilDestroyed()).subscribe((params) => {
            this.selectedDocumentId.set(params['id'] ?? '');
        });
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd), takeUntilDestroyed())
            .subscribe((event) => {
            const urlParts = event.urlAfterRedirects.split('/');
            const docIndex = urlParts.indexOf('doc');
            this.selectedDocumentId.set(docIndex !== -1 && docIndex + 1 < urlParts.length
                ? urlParts[docIndex + 1].split('?')[0]
                : '');
        });
        this.activatedRoute.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
            this.selectedQueueQuickFilters.set(this.parseQuickFilters(params.get('quickFilters') ?? ''));
        });
    }
    onFiltersChange(filters) {
        this.session.setFilters(filters);
        this.ensureSearchRoute();
    }
    onReset() {
        this.session.closeSavedSearch();
        this.ensureSearchRoute();
    }
    onSavedSearchChosen(choice) {
        this.session
            .openSavedSearch(choice.id, choice.title)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: () => this.ensureSearchRoute(),
            error: () => this.toast.error(this.translate.instant('search.message.failed-to-open-saved-search'), {
                duration: 5000,
            }),
        });
    }
    openSaveAsDialog() {
        askSavedSearchName(this.dialog, this.translate, {
            heading: this.translate.instant('ui.saved-search'),
        })
            .pipe(switchMap((name) => this.session.saveAs(name).pipe(map(() => name))), takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (name) => this.toast.show(this.translate.instant('common.search-saved', { name })),
            error: () => this.toast.error(this.translate.instant('assets.message.failed-to-save-search'), {
                duration: 5000,
            }),
        });
    }
    switchToQueueView() {
        this.viewMode.set('queue');
        // Open the selected document, or the first result, when the queue is entered.
        const items = this.searchAggregationService.items();
        const docId = this.selectedDocumentId();
        const selected = docId ? items.find((item) => item.id === docId) : undefined;
        if (selected) {
            this.navigateToItem(selected);
            return;
        }
        if (items.length > 0)
            this.navigateToItem(items[0]);
    }
    switchToFilterView() {
        this.viewMode.set('filter');
        void this.router.navigate(['/search'], {
            queryParams: { quickFilters: this.toQuickFiltersQueryParam() },
            queryParamsHandling: 'merge',
        });
    }
    onQueueItemSelected(item) {
        this.navigateToItem(item);
    }
    toggleQueueQuickFilter(value) {
        const next = new Set(this.selectedQueueQuickFilters());
        if (next.has(value))
            next.delete(value);
        else
            next.add(value);
        this.selectedQueueQuickFilters.set(next);
        // A different quick filter is a different result set, so the page starts again from the first.
        void this.router.navigate(['/search'], {
            queryParams: { quickFilters: this.toQuickFiltersQueryParam(), page: null },
            queryParamsHandling: 'merge',
        });
    }
    navigateToItem(item) {
        const extras = {
            queryParams: { quickFilters: this.toQuickFiltersQueryParam() },
            queryParamsHandling: 'merge',
        };
        if (item.type === 'Collection') {
            void this.router.navigate(['/collections', item.id], extras);
        }
        else if (FOLDERISH_TYPES.has(item.type) && item.path) {
            void this.router.navigate(['/browse' + item.path], extras);
        }
        else {
            void this.router.navigate(['/doc', item.id], extras);
        }
    }
    /** A change made from another page shows its results on the search page. */
    ensureSearchRoute() {
        if (this.router.url.split('?')[0] !== '/search')
            void this.router.navigateByUrl('/search');
    }
    toQuickFiltersQueryParam() {
        const selected = this.selectedQueueQuickFilters();
        const ordered = QUEUE_QUICK_FILTER_OPTIONS.map((option) => option.value).filter((value) => selected.has(value));
        return ordered.length > 0 ? ordered.join(',') : null;
    }
    parseQuickFilters(value) {
        const allowed = new Set(QUEUE_QUICK_FILTER_OPTIONS.map((option) => option.value));
        return new Set(value
            .split(',')
            .map((item) => item.trim())
            .filter((item) => allowed.has(item)));
    }
    static ɵfac = function SearchFiltersDrawerComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SearchFiltersDrawerComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SearchFiltersDrawerComponent, selectors: [["lib-search-filters-drawer"]], features: [i0.ɵɵProvidersFeature([provideNxsToast()])], decls: 10, vars: 14, consts: [[1, "drawer-header"], [1, "drawer-saved-searches", 3, "selectedChange", "selectedId", "selectedTitle", "pageProvider", "refresh"], ["mat-icon-button", "", "type", "button", 1, "queue-toggle-btn", 3, "click", "matTooltip"], ["aria-hidden", "true"], [1, "drawer-filters", 3, "filters", "aggregations", "optionLabels"], [3, "selectedItemId", "activeFilters"], [1, "drawer-filters", 3, "filtersChange", "filtersReset", "saveAs", "filters", "aggregations", "optionLabels"], [3, "switchToFilter", "quickFilterToggled", "itemSelected", "selectedItemId", "activeFilters"]], template: function SearchFiltersDrawerComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "nxs-saved-search-select", 1);
            i0.ɵɵlistener("selectedChange", function SearchFiltersDrawerComponent_Template_nxs_saved_search_select_selectedChange_1_listener($event) { return ctx.onSavedSearchChosen($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(2, "button", 2);
            i0.ɵɵpipe(3, "translate");
            i0.ɵɵpipe(4, "translate");
            i0.ɵɵlistener("click", function SearchFiltersDrawerComponent_Template_button_click_2_listener() { return ctx.viewMode() === "filter" ? ctx.switchToQueueView() : ctx.switchToFilterView(); });
            i0.ɵɵelementStart(5, "mat-icon", 3);
            i0.ɵɵtext(6);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelement(7, "mat-divider");
            i0.ɵɵconditionalCreate(8, SearchFiltersDrawerComponent_Conditional_8_Template, 1, 3, "nxs-search-filters", 4)(9, SearchFiltersDrawerComponent_Conditional_9_Template, 1, 2, "lib-search-queue", 5);
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵproperty("selectedId", ctx.savedSearchId())("selectedTitle", ctx.savedSearchTitle())("pageProvider", ctx.pageProvider)("refresh", ctx.savedSearchesVersion());
            i0.ɵɵadvance();
            i0.ɵɵclassProp("active", ctx.viewMode() === "queue");
            i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(3, 10, ctx.viewMode() === "filter" ? "search.switch-to-queue-view" : "search.switch-to-filter-view"));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(4, 12, ctx.viewMode() === "filter" ? "search.switch-to-queue-view" : "search.switch-to-filter-view"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(ctx.viewMode() === "filter" ? "view_list" : "filter_list");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.viewMode() === "filter" ? 8 : 9);
        } }, dependencies: [NxsSavedSearchSelectComponent,
            NxsSearchFiltersComponent,
            SearchQueueComponent,
            MatButtonModule, i1.MatIconButton, MatDividerModule, i2.MatDivider, MatIconModule, i3.MatIcon, MatTooltipModule, i4.MatTooltip, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n}\n\n.drawer-header[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  align-items: flex-end;\n  padding: 12px 16px;\n}\n\n.drawer-saved-searches[_ngcontent-%COMP%] {\n  flex: 1;\n}\n\n.queue-toggle-btn[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  margin: 0;\n\n  &.active {\n    background-color: var(--mat-sys-surface-container-high, transparent);\n  }\n}\n\n.drawer-filters[_ngcontent-%COMP%] {\n  flex: 1;\n  min-height: 0;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SearchFiltersDrawerComponent, [{
        type: Component,
        args: [{ selector: 'lib-search-filters-drawer', standalone: true, imports: [
                    NxsSavedSearchSelectComponent,
                    NxsSearchFiltersComponent,
                    SearchQueueComponent,
                    TranslatePipe,
                    MatButtonModule,
                    MatDividerModule,
                    MatIconModule,
                    MatTooltipModule,
                ], providers: [provideNxsToast()], template: "<div class=\"drawer-header\">\n  <nxs-saved-search-select\n    class=\"drawer-saved-searches\"\n    [selectedId]=\"savedSearchId()\"\n    [selectedTitle]=\"savedSearchTitle()\"\n    [pageProvider]=\"pageProvider\"\n    [refresh]=\"savedSearchesVersion()\"\n    (selectedChange)=\"onSavedSearchChosen($event)\"\n  />\n  <button\n    mat-icon-button\n    type=\"button\"\n    class=\"queue-toggle-btn\"\n    [class.active]=\"viewMode() === 'queue'\"\n    [matTooltip]=\"\n      (viewMode() === 'filter' ? 'search.switch-to-queue-view' : 'search.switch-to-filter-view')\n        | translate\n    \"\n    [attr.aria-label]=\"\n      (viewMode() === 'filter' ? 'search.switch-to-queue-view' : 'search.switch-to-filter-view')\n        | translate\n    \"\n    (click)=\"viewMode() === 'filter' ? switchToQueueView() : switchToFilterView()\"\n  >\n    <mat-icon aria-hidden=\"true\">{{\n      viewMode() === 'filter' ? 'view_list' : 'filter_list'\n    }}</mat-icon>\n  </button>\n</div>\n\n<mat-divider />\n\n@if (viewMode() === 'filter') {\n  <nxs-search-filters\n    class=\"drawer-filters\"\n    [filters]=\"filters()\"\n    [aggregations]=\"aggregations()\"\n    [optionLabels]=\"facetLabels()\"\n    (filtersChange)=\"onFiltersChange($event)\"\n    (filtersReset)=\"onReset()\"\n    (saveAs)=\"openSaveAsDialog()\"\n  />\n} @else {\n  <lib-search-queue\n    [selectedItemId]=\"selectedDocumentId()\"\n    [activeFilters]=\"activeFiltersForQueue()\"\n    (switchToFilter)=\"switchToFilterView()\"\n    (quickFilterToggled)=\"toggleQueueQuickFilter($event)\"\n    (itemSelected)=\"onQueueItemSelected($event)\"\n  ></lib-search-queue>\n}\n", styles: [":host {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n}\n\n.drawer-header {\n  display: flex;\n  gap: 8px;\n  align-items: flex-end;\n  padding: 12px 16px;\n}\n\n.drawer-saved-searches {\n  flex: 1;\n}\n\n.queue-toggle-btn {\n  flex-shrink: 0;\n  margin: 0;\n\n  &.active {\n    background-color: var(--mat-sys-surface-container-high, transparent);\n  }\n}\n\n.drawer-filters {\n  flex: 1;\n  min-height: 0;\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SearchFiltersDrawerComponent, { className: "SearchFiltersDrawerComponent", filePath: "libs/features/search/src/lib/search-filters-drawer/search-filters-drawer.component.ts", lineNumber: 64 }); })();
