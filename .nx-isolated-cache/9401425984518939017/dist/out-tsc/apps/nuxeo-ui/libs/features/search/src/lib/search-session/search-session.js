import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, map, of, shareReplay, startWith, switchMap, tap, } from 'rxjs';
import { NXS_EMPTY_SEARCH_FILTERS, nxsHasSearchFilters, nxsSameSearchFilters, nxsSavedParamsToClear, nxsSearchFiltersFromParams, nxsSearchFiltersToQuery, nxsSearchFiltersToRecord, nxsSearchFiltersToSavedParams, } from '@nuxeo/satori-platform/components';
import { SearchAggregationService, SearchService, } from '@nuxeo/satori-platform/nuxeo-client';
import * as i0 from "@angular/core";
/** The page provider every search here runs, and every saved search is saved against. */
export const SEARCH_PAGE_PROVIDER = 'default_search';
/** How many results one page of the search holds. */
export const SEARCH_PAGE_SIZE = 40;
const LOADING = {
    status: 'loading',
    items: [],
    aggregations: {},
    totalSize: -1,
    hasNextPage: false,
    error: null,
};
const EMPTY_PAGE_QUERY = { quickFilters: '', sortBy: null, sortOrder: null };
const samePageQuery = (a, b) => a.quickFilters === b.quickFilters && a.sortBy === b.sortBy && a.sortOrder === b.sortOrder;
/**
 * The one search for the current query, and the saved search it came from.
 *
 * The search page, the filters drawer and its queue all show the same results, so they share this
 * rather than each sending the query: one change of the filters is one request. The results carry
 * the server's aggregates, which give the filters their counts, so the drawer sends no request of
 * its own. The request runs while something subscribes to {@link results$}, and is shared by
 * everything that does.
 */
export class SearchSession {
    searchService = inject(SearchService);
    shared = inject(SearchAggregationService);
    /** The filters, kept in `SearchAggregationService.drawerFilters` as before. */
    filters = computed(() => nxsSearchFiltersFromParams(this.shared.drawerFilters()), ...(ngDevMode ? [{ debugName: "filters" }] : []));
    hasFilters = computed(() => nxsHasSearchFilters(this.filters()), ...(ngDevMode ? [{ debugName: "hasFilters" }] : []));
    pageQuery = signal(EMPTY_PAGE_QUERY, ...(ngDevMode ? [{ debugName: "pageQuery", equal: samePageQuery }] : [{ equal: samePageQuery }]));
    attempt = signal(0, ...(ngDevMode ? [{ debugName: "attempt" }] : []));
    pageIndexSignal = signal(0, ...(ngDevMode ? [{ debugName: "pageIndexSignal" }] : []));
    /** The page on screen, from zero. */
    pageIndex = this.pageIndexSignal.asReadonly();
    /** The request the current filters, quick filters, sort and page make. */
    request = computed(() => ({
        ...nxsSearchFiltersToQuery(this.filters(), this.pageQuery()),
        pageIndex: this.pageIndexSignal(),
        pageSize: SEARCH_PAGE_SIZE,
    }), ...(ngDevMode ? [{ debugName: "request" }] : []));
    results$ = combineLatest([
        toObservable(this.request),
        toObservable(this.attempt),
    ]).pipe(switchMap(([request]) => this.searchService.search(request).pipe(map((response) => ({
        status: 'loaded',
        items: response.items,
        aggregations: response.aggregations,
        totalSize: response.totalSize,
        hasNextPage: response.hasNextPage,
        error: null,
    })), catchError((error) => of({
        status: 'failed',
        items: [],
        aggregations: {},
        totalSize: -1,
        hasNextPage: false,
        error,
    })), startWith(LOADING))), tap((state) => {
        if (state.status === 'loading')
            return;
        this.shared.items.set([...state.items]);
        this.shared.aggregations.set(state.aggregations);
    }), shareReplay({ bufferSize: 1, refCount: true }));
    savedSearchId = this.shared.selectedSavedSearchId;
    savedSearchTitle = this.shared.selectedSavedSearchTitle;
    /** Bumped whenever the list of saved searches changes. */
    savedSearchesVersion = this.shared.savedSearchVersion;
    /** The open saved search's filters as the server holds them. */
    savedFilters = signal(null, ...(ngDevMode ? [{ debugName: "savedFilters" }] : []));
    /** The params the open saved search was read with, so Save can clear the old names it carries. */
    loadedParams = {};
    /**
     * Whether the filters differ from the open saved search's — or, with none open, whether any is
     * set. What Web UI calls dirty: it decides whether Save is offered.
     */
    dirty = computed(() => {
        const saved = this.savedFilters();
        if (!this.savedSearchId().trim())
            return this.hasFilters();
        // Still being read: nothing to compare against yet.
        return saved !== null && !nxsSameSearchFilters(saved, this.filters());
    }, ...(ngDevMode ? [{ debugName: "dirty" }] : []));
    /** A change of filters starts again from the first page: the old page may not exist any more. */
    setFilters(filters) {
        if (!nxsSameSearchFilters(this.filters(), filters))
            this.pageIndexSignal.set(0);
        this.shared.drawerFilters.set(nxsSearchFiltersToRecord(filters));
    }
    /** The search page's URL changed: its quick filters and sort are part of the query. */
    setPageQuery(query) {
        this.pageQuery.set(query);
    }
    /** The page the URL or the pager asks for, from zero. */
    setPageIndex(pageIndex) {
        this.pageIndexSignal.set(Math.max(0, Math.floor(pageIndex)));
    }
    /** Runs the current query again. */
    retry() {
        this.attempt.update((attempt) => attempt + 1);
    }
    /** Clears the filters and closes the open saved search. */
    reset() {
        this.closeSavedSearch();
        this.setFilters(NXS_EMPTY_SEARCH_FILTERS);
    }
    /** Forgets the open saved search, keeping the filters. */
    closeSavedSearch() {
        this.savedSearchId.set('');
        this.savedSearchTitle.set('');
        this.savedFilters.set(null);
        this.loadedParams = {};
    }
    /**
     * Opens a saved search: reads its filters from the server and applies them. Fails, leaving the
     * filters as they were and no saved search open, when the search cannot be read.
     */
    openSavedSearch(id, title) {
        this.savedSearchId.set(id);
        this.savedSearchTitle.set(title);
        this.savedFilters.set(null);
        this.loadedParams = {};
        return this.searchService.getSavedSearchById(id).pipe(map((params) => {
            // `getSavedSearchById` answers a failed read with no parameters at all, and a saved
            // search always has some: the server returns every one of its page provider's.
            if (Object.keys(params).length === 0)
                throw new Error(`Saved search ${id} could not be read`);
            return params;
        }), map((params) => {
            // A late answer for a search the user has already left is dropped.
            if (this.savedSearchId() !== id)
                return;
            const filters = nxsSearchFiltersFromParams(params);
            this.loadedParams = params;
            this.savedFilters.set(filters);
            // Opening a search starts it from the first page, even when its filters match the ones on
            // screen, which `setFilters` alone would not reset.
            this.setPageIndex(0);
            this.setFilters(filters);
        }), catchError((error) => {
            if (this.savedSearchId() === id)
                this.closeSavedSearch();
            throw error;
        }));
    }
    /** Saves the filters as a new saved search, and opens it. */
    saveAs(title) {
        const filters = this.filters();
        return this.searchService
            .saveSavedSearch({
            title,
            params: nxsSearchFiltersToSavedParams(filters),
            pageProviderName: SEARCH_PAGE_PROVIDER,
        })
            .pipe(map((saved) => {
            const record = (saved ?? {});
            const id = typeof record['id'] === 'string' ? record['id'] : '';
            this.savedSearchId.set(id);
            this.savedSearchTitle.set(typeof record['title'] === 'string' && record['title'] ? record['title'] : title);
            this.savedFilters.set(id ? filters : null);
            this.shared.markSavedSearchDirty();
        }));
    }
    /** Saves the filters into the open saved search. */
    save() {
        const id = this.savedSearchId().trim();
        if (!id)
            return of(undefined);
        const filters = this.filters();
        const params = {
            ...nxsSavedParamsToClear(this.loadedParams),
            ...nxsSearchFiltersToSavedParams(filters),
        };
        return this.searchService
            .updateSavedSearch(id, {
            title: this.savedSearchTitle(),
            params,
            pageProviderName: SEARCH_PAGE_PROVIDER,
        })
            .pipe(map(() => {
            if (this.savedSearchId() !== id)
                return;
            this.savedFilters.set(filters);
            this.loadedParams = params;
        }));
    }
    /** Renames the open saved search; its stored filters are left as they are. */
    rename(title) {
        const id = this.savedSearchId().trim();
        if (!id)
            return of(undefined);
        return this.searchService.renameSavedSearch(id, title, SEARCH_PAGE_PROVIDER).pipe(map(() => {
            if (this.savedSearchId() === id)
                this.savedSearchTitle.set(title);
            this.shared.markSavedSearchDirty();
        }));
    }
    /** Deletes the open saved search, and clears the filters it had applied. */
    deleteSavedSearch() {
        const id = this.savedSearchId().trim();
        if (!id)
            return of(undefined);
        return this.searchService.deleteSavedSearch(id).pipe(map(() => {
            if (this.savedSearchId() === id)
                this.reset();
            this.shared.markSavedSearchDirty();
        }));
    }
    static ɵfac = function SearchSession_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SearchSession)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: SearchSession, factory: SearchSession.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SearchSession, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
