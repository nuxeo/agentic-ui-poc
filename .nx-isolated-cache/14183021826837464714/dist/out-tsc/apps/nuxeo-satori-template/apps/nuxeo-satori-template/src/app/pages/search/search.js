import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, map, of, startWith, switchMap } from 'rxjs';
import { SearchService } from '@nuxeo/satori-platform/nuxeo-client';
import { formatBytes, formatTimestamp } from '../documents/document-fields';
import * as i0 from "@angular/core";
const _c0 = a0 => ["/documents", a0];
const _forTrack0 = ($index, $item) => $item.uid;
function SearchComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 5);
    i0.ɵɵtext(1, "Searching\u2026");
    i0.ɵɵelementEnd();
} }
function SearchComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 6);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx);
} }
function SearchComponent_Conditional_13_Conditional_4_For_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td")(2, "a", 11);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "td")(5, "span", 12);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "td")(8, "code", 13);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(10, "td");
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "td", 14);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const row_r1 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(6, _c0, row_r1.uid));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r1.title);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(row_r1.type);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(row_r1.path);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r1.modified);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r1.size);
} }
function SearchComponent_Conditional_13_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "table", 8)(1, "thead")(2, "tr")(3, "th", 9);
    i0.ɵɵtext(4, "Title");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "th", 9);
    i0.ɵɵtext(6, "Type");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "th", 9);
    i0.ɵɵtext(8, "Location");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "th", 9);
    i0.ɵɵtext(10, "Modified");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "th", 10);
    i0.ɵɵtext(12, "Size");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(13, "tbody");
    i0.ɵɵrepeaterCreate(14, SearchComponent_Conditional_13_Conditional_4_For_15_Template, 14, 8, "tr", null, _forTrack0);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const results_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(14);
    i0.ɵɵrepeater(results_r2.rows);
} }
function SearchComponent_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 7);
    i0.ɵɵtext(1);
    i0.ɵɵelementStart(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(4, SearchComponent_Conditional_13_Conditional_4_Template, 16, 0, "table", 8);
} if (rf & 2) {
    const results_r2 = ctx;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", results_r2.rows.length, " result(s) for ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(results_r2.term);
    i0.ɵɵadvance();
    i0.ɵɵconditional(results_r2.rows.length ? 4 : -1);
} }
/** Below this, a query matches most of the repository and tells the user nothing. */
const MINIMUM_TERM_LENGTH = 2;
/**
 * Full-text search over the repository, through `SearchService`.
 *
 * It calls the `default_search` page provider — the same one the product's own
 * search screen uses — rather than assembling NXQL here. That matters for a
 * customer: the provider is configured **on the Nuxeo server**, so an
 * administrator can change what is searchable without this application being
 * rebuilt, and the results already carry the aggregations a fork would need to
 * add facets.
 */
export class SearchComponent {
    search = inject(SearchService);
    term = signal('', ...(ngDevMode ? [{ debugName: "term" }] : []));
    /**
     * A named constant, not an inline `{ kind: 'idle' }`.
     *
     * `toSignal` has an overload for a source that may not have emitted, and an
     * inline literal makes TypeScript pick it — so the signal came back as
     * `SearchState | undefined` and every narrowing below failed to compile. Giving
     * the initial value the union's type pins the right overload.
     */
    static INITIAL = { kind: 'idle' };
    state = toSignal(toObservable(this.term).pipe(
    // Typing is not a search. Without this every keystroke is a round trip and
    // the results flicker between prefixes of the word being typed.
    debounceTime(250), switchMap((raw) => {
        const term = raw.trim();
        if (term.length < MINIMUM_TERM_LENGTH)
            return of({ kind: 'idle' });
        return this.search.search({ ecmFulltext: term, pageSize: 25 }).pipe(map((response) => ({
            kind: 'results',
            term,
            rows: response.items.map(toRow),
        })), catchError((error) => of({ kind: 'error', message: describe(error) })), startWith({ kind: 'searching' }));
    })), { initialValue: SearchComponent.INITIAL });
    searching = computed(() => this.state().kind === 'searching', ...(ngDevMode ? [{ debugName: "searching" }] : []));
    errorMessage = computed(() => {
        const state = this.state();
        return state.kind === 'error' ? state.message : null;
    }, ...(ngDevMode ? [{ debugName: "errorMessage" }] : []));
    results = computed(() => {
        const state = this.state();
        return state.kind === 'results' ? state : null;
    }, ...(ngDevMode ? [{ debugName: "results" }] : []));
    onTerm(event) {
        this.term.set(event.target.value);
    }
    static ɵfac = function SearchComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SearchComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SearchComponent, selectors: [["app-search"]], decls: 14, vars: 4, consts: [[1, "search__title"], [1, "search__lede"], [1, "search__field"], [1, "search__label"], ["type", "search", "name", "q", "placeholder", "e.g. hurricane", "autocomplete", "off", 1, "search__input", 3, "input", "value"], ["role", "status", 1, "search__status"], ["role", "alert", 1, "search__error"], [1, "search__status"], [1, "search__table"], ["scope", "col"], ["scope", "col", 1, "search__cell--right"], [1, "search__link", 3, "routerLink"], [1, "search__badge"], [1, "search__path"], [1, "search__cell--right"]], template: function SearchComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "h1", 0);
            i0.ɵɵtext(1, "Search");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(2, "p", 1);
            i0.ɵɵtext(3, " Full-text search across the repository via the ");
            i0.ɵɵelementStart(4, "code");
            i0.ɵɵtext(5, "default_search");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(6, " page provider. The index is Nuxeo's own \u2014 nothing is filtered in the browser.\n");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "label", 2)(8, "span", 3);
            i0.ɵɵtext(9, "Find documents");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "input", 4);
            i0.ɵɵlistener("input", function SearchComponent_Template_input_input_10_listener($event) { return ctx.onTerm($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(11, SearchComponent_Conditional_11_Template, 2, 0, "p", 5);
            i0.ɵɵconditionalCreate(12, SearchComponent_Conditional_12_Template, 2, 1, "p", 6);
            i0.ɵɵconditionalCreate(13, SearchComponent_Conditional_13_Template, 5, 3);
        } if (rf & 2) {
            let tmp_2_0;
            let tmp_3_0;
            i0.ɵɵadvance(10);
            i0.ɵɵproperty("value", ctx.term());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.searching() ? 11 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_2_0 = ctx.errorMessage()) ? 12 : -1, tmp_2_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_3_0 = ctx.results()) ? 13 : -1, tmp_3_0);
        } }, dependencies: [RouterLink], styles: [".search__title[_ngcontent-%COMP%] {\n  margin: 0 0 0.5rem;\n  font-size: 1.5rem;\n}\n\n.search__lede[_ngcontent-%COMP%] {\n  margin: 0 0 1.5rem;\n  max-width: 70ch;\n  color: var(--shell-muted, #656d76);\n}\n\n.search__field[_ngcontent-%COMP%] {\n  display: block;\n  max-width: 32rem;\n  margin-bottom: 1.5rem;\n}\n\n.search__label[_ngcontent-%COMP%] {\n  display: block;\n  margin-bottom: 0.375rem;\n  font-size: 0.875rem;\n  font-weight: 600;\n}\n\n.search__input[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 0.5rem 0.75rem;\n  font: inherit;\n  color: var(--shell-fg, #1f2328);\n  background: var(--shell-surface, #ffffff);\n  border: 1px solid var(--shell-border, #d0d7de);\n  border-radius: 6px;\n}\n\n.search__table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 0.875rem;\n  background: var(--shell-surface, #ffffff);\n\n  th,\n  td {\n    padding: 0.5rem 0.75rem;\n    text-align: left;\n    vertical-align: top;\n    border-bottom: 1px solid var(--shell-border, #d0d7de);\n  }\n\n  th {\n    font-size: 0.75rem;\n    text-transform: uppercase;\n    letter-spacing: 0.04em;\n    color: var(--shell-muted, #656d76);\n    background: var(--shell-surface-alt, #eaeef2);\n  }\n\n  tbody tr:hover {\n    background: var(--shell-surface-alt, #eaeef2);\n  }\n}\n\n.search__cell--right[_ngcontent-%COMP%] {\n  text-align: right;\n}\n\n.search__link[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: var(--shell-accent, #1f6feb);\n  text-decoration: none;\n\n  &:hover {\n    text-decoration: underline;\n  }\n}\n\n.search__path[_ngcontent-%COMP%] {\n  font-size: 0.78125rem;\n  color: var(--shell-muted, #656d76);\n  overflow-wrap: anywhere;\n}\n\n.search__badge[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 0.0625rem 0.4375rem;\n  border-radius: 999px;\n  font-size: 0.75rem;\n  font-weight: 600;\n  color: var(--shell-fg, #1f2328);\n  background: var(--shell-surface-alt, #eaeef2);\n  border: 1px solid var(--shell-border, #d0d7de);\n}\n\n.search__status[_ngcontent-%COMP%] {\n  margin: 1rem 0;\n  font-size: 0.875rem;\n  color: var(--shell-muted, #656d76);\n}\n\n.search__error[_ngcontent-%COMP%] {\n  margin: 1rem 0;\n  padding: 0.625rem 0.75rem;\n  border-radius: 6px;\n  font-size: 0.875rem;\n  background: var(--shell-warn-bg, #fff8c5);\n  border: 1px solid var(--shell-warn-border, #d4a72c);\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SearchComponent, [{
        type: Component,
        args: [{ selector: 'app-search', standalone: true, imports: [RouterLink], template: "<h1 class=\"search__title\">Search</h1>\n<p class=\"search__lede\">\n  Full-text search across the repository via the <code>default_search</code> page provider. The\n  index is Nuxeo's own \u2014 nothing is filtered in the browser.\n</p>\n\n<label class=\"search__field\">\n  <span class=\"search__label\">Find documents</span>\n  <input\n    class=\"search__input\"\n    type=\"search\"\n    name=\"q\"\n    placeholder=\"e.g. hurricane\"\n    autocomplete=\"off\"\n    [value]=\"term()\"\n    (input)=\"onTerm($event)\"\n  />\n</label>\n\n@if (searching()) {\n  <p class=\"search__status\" role=\"status\">Searching\u2026</p>\n}\n\n@if (errorMessage(); as message) {\n  <p class=\"search__error\" role=\"alert\">{{ message }}</p>\n}\n\n@if (results(); as results) {\n  <p class=\"search__status\">\n    {{ results.rows.length }} result(s) for <strong>{{ results.term }}</strong>\n  </p>\n\n  @if (results.rows.length) {\n    <table class=\"search__table\">\n      <thead>\n        <tr>\n          <th scope=\"col\">Title</th>\n          <th scope=\"col\">Type</th>\n          <th scope=\"col\">Location</th>\n          <th scope=\"col\">Modified</th>\n          <th scope=\"col\" class=\"search__cell--right\">Size</th>\n        </tr>\n      </thead>\n      <tbody>\n        @for (row of results.rows; track row.uid) {\n          <tr>\n            <td>\n              <a class=\"search__link\" [routerLink]=\"['/documents', row.uid]\">{{ row.title }}</a>\n            </td>\n            <td>\n              <span class=\"search__badge\">{{ row.type }}</span>\n            </td>\n            <td>\n              <code class=\"search__path\">{{ row.path }}</code>\n            </td>\n            <td>{{ row.modified }}</td>\n            <td class=\"search__cell--right\">{{ row.size }}</td>\n          </tr>\n        }\n      </tbody>\n    </table>\n  }\n}\n", styles: [".search__title {\n  margin: 0 0 0.5rem;\n  font-size: 1.5rem;\n}\n\n.search__lede {\n  margin: 0 0 1.5rem;\n  max-width: 70ch;\n  color: var(--shell-muted, #656d76);\n}\n\n.search__field {\n  display: block;\n  max-width: 32rem;\n  margin-bottom: 1.5rem;\n}\n\n.search__label {\n  display: block;\n  margin-bottom: 0.375rem;\n  font-size: 0.875rem;\n  font-weight: 600;\n}\n\n.search__input {\n  width: 100%;\n  padding: 0.5rem 0.75rem;\n  font: inherit;\n  color: var(--shell-fg, #1f2328);\n  background: var(--shell-surface, #ffffff);\n  border: 1px solid var(--shell-border, #d0d7de);\n  border-radius: 6px;\n}\n\n.search__table {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 0.875rem;\n  background: var(--shell-surface, #ffffff);\n\n  th,\n  td {\n    padding: 0.5rem 0.75rem;\n    text-align: left;\n    vertical-align: top;\n    border-bottom: 1px solid var(--shell-border, #d0d7de);\n  }\n\n  th {\n    font-size: 0.75rem;\n    text-transform: uppercase;\n    letter-spacing: 0.04em;\n    color: var(--shell-muted, #656d76);\n    background: var(--shell-surface-alt, #eaeef2);\n  }\n\n  tbody tr:hover {\n    background: var(--shell-surface-alt, #eaeef2);\n  }\n}\n\n.search__cell--right {\n  text-align: right;\n}\n\n.search__link {\n  font-weight: 600;\n  color: var(--shell-accent, #1f6feb);\n  text-decoration: none;\n\n  &:hover {\n    text-decoration: underline;\n  }\n}\n\n.search__path {\n  font-size: 0.78125rem;\n  color: var(--shell-muted, #656d76);\n  overflow-wrap: anywhere;\n}\n\n.search__badge {\n  display: inline-block;\n  padding: 0.0625rem 0.4375rem;\n  border-radius: 999px;\n  font-size: 0.75rem;\n  font-weight: 600;\n  color: var(--shell-fg, #1f2328);\n  background: var(--shell-surface-alt, #eaeef2);\n  border: 1px solid var(--shell-border, #d0d7de);\n}\n\n.search__status {\n  margin: 1rem 0;\n  font-size: 0.875rem;\n  color: var(--shell-muted, #656d76);\n}\n\n.search__error {\n  margin: 1rem 0;\n  padding: 0.625rem 0.75rem;\n  border-radius: 6px;\n  font-size: 0.875rem;\n  background: var(--shell-warn-bg, #fff8c5);\n  border: 1px solid var(--shell-warn-border, #d4a72c);\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SearchComponent, { className: "SearchComponent", filePath: "apps/nuxeo-satori-template/src/app/pages/search/search.ts", lineNumber: 47 }); })();
function toRow(item) {
    return {
        uid: item.id,
        title: item.title,
        type: item.type,
        path: item.path ?? '—',
        author: item.author || '—',
        modified: formatTimestamp(item.modifiedDate),
        size: formatBytes(item.sizeInBytes ?? null),
    };
}
function describe(error) {
    if (error instanceof HttpErrorResponse) {
        if (error.status === 401)
            return 'Nuxeo rejected the session. Sign in again.';
        if (error.status === 0)
            return 'Could not reach Nuxeo.';
        return `Nuxeo answered HTTP ${error.status}.`;
    }
    return error instanceof Error ? error.message : 'Search failed.';
}
