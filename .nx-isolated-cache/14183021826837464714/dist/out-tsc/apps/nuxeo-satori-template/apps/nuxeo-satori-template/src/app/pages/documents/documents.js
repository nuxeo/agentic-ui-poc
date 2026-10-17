import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { BrowseService, cumulativeNuxeoPathPrefixes, isFolderishDocument, normalizeNuxeoPath, } from '@nuxeo/satori-platform/nuxeo-client';
import { formatBytes, formatTimestamp, mainBlob, stringProperty } from './document-fields';
import * as i0 from "@angular/core";
const _c0 = () => ["/documents"];
const _c1 = a0 => ({ path: a0 });
const _c2 = a0 => ["/documents", a0];
const _forTrack0 = ($index, $item) => $item.path;
const _forTrack1 = ($index, $item) => $item.uid;
function DocumentsComponent_For_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 4);
    i0.ɵɵtext(1, "/");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "a", 5);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const crumb_r1 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction0(3, _c0))("queryParams", i0.ɵɵpureFunction1(4, _c1, crumb_r1.path));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", crumb_r1.label, " ");
} }
function DocumentsComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 2);
    i0.ɵɵtext(1, "Loading from Nuxeo\u2026");
    i0.ɵɵelementEnd();
} }
function DocumentsComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 3);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx);
} }
function DocumentsComponent_Conditional_7_Conditional_10_For_20_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 15);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r2 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction0(3, _c0))("queryParams", i0.ɵɵpureFunction1(4, _c1, row_r2.path));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r2.title);
} }
function DocumentsComponent_Conditional_7_Conditional_10_For_20_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r2 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(2, _c2, row_r2.uid));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r2.title);
} }
function DocumentsComponent_Conditional_7_Conditional_10_For_20_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 17);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r2 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r2.description);
} }
function DocumentsComponent_Conditional_7_Conditional_10_For_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td");
    i0.ɵɵconditionalCreate(2, DocumentsComponent_Conditional_7_Conditional_10_For_20_Conditional_2_Template, 2, 6, "a", 15)(3, DocumentsComponent_Conditional_7_Conditional_10_For_20_Conditional_3_Template, 2, 4, "a", 16);
    i0.ɵɵconditionalCreate(4, DocumentsComponent_Conditional_7_Conditional_10_For_20_Conditional_4_Template, 2, 1, "span", 17);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "td")(6, "span", 9);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "td");
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "td");
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "td", 18);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const row_r2 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(row_r2.folderish ? 2 : 3);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(row_r2.description ? 4 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(row_r2.type);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r2.modified);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r2.creator);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r2.size);
} }
function DocumentsComponent_Conditional_7_Conditional_10_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 10);
    i0.ɵɵtext(1, " Nuxeo has more children than this page requested. Paging is a fork's decision, so the template does not guess at one. ");
    i0.ɵɵelementEnd();
} }
function DocumentsComponent_Conditional_7_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "table", 11)(1, "caption", 12);
    i0.ɵɵtext(2, " Children returned by ");
    i0.ɵɵelementStart(3, "code");
    i0.ɵɵtext(4, "BrowseService.getBrowseFolderContents()");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(5, " \u2014 read live from the Nuxeo REST API. ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "thead")(7, "tr")(8, "th", 13);
    i0.ɵɵtext(9, "Title");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "th", 13);
    i0.ɵɵtext(11, "Type");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "th", 13);
    i0.ɵɵtext(13, "Modified");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "th", 13);
    i0.ɵɵtext(15, "Author");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "th", 14);
    i0.ɵɵtext(17, "Size");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(18, "tbody");
    i0.ɵɵrepeaterCreate(19, DocumentsComponent_Conditional_7_Conditional_10_For_20_Template, 14, 6, "tr", null, _forTrack1);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(21, DocumentsComponent_Conditional_7_Conditional_10_Conditional_21_Template, 2, 0, "p", 10);
} if (rf & 2) {
    const ready_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(19);
    i0.ɵɵrepeater(ready_r3.rows);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ready_r3.hasMore ? 21 : -1);
} }
function DocumentsComponent_Conditional_7_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 10);
    i0.ɵɵtext(1, "This folder is empty.");
    i0.ɵɵelementEnd();
} }
function DocumentsComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "header", 6)(1, "h1", 7);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p", 8)(4, "span", 9);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "code");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "span");
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(10, DocumentsComponent_Conditional_7_Conditional_10_Template, 22, 1)(11, DocumentsComponent_Conditional_7_Conditional_11_Template, 2, 0, "p", 10);
} if (rf & 2) {
    const ready_r3 = ctx;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ready_r3.folder.title);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ready_r3.folder.type);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ready_r3.folder.path);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", ready_r3.rows.length, " item(s)");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ready_r3.rows.length ? 10 : 11);
} }
/**
 * Where browsing starts when no `?path=` is given.
 *
 * A Layer 0 candidate rather than a constant, and deliberately not one yet: the
 * point of the template is to show a customer what to configure, and inventing a
 * `bootstrap.json` key that only this page reads would be inventing surface for
 * the sake of it. A fork that needs it adds the key and reads
 * `AppConfigService.bootstrap()`.
 */
const DEFAULT_ROOT_PATH = '/default-domain/workspaces';
/**
 * The customer's document browser, built on `BrowseService`.
 *
 * This is the page that makes the template a content application rather than a
 * diagnostics harness: `getBrowseFolderContents()` is the same call the product's
 * own browse feature makes, and every row on screen is a document Nuxeo actually
 * returned.
 *
 * ## Why the load is a stream and not a `subscribe`
 *
 * The path is a route input, so it changes without the component being recreated.
 * `toObservable(path) → switchMap` cancels the request for the folder the user
 * just left; a `subscribe` in an `effect` would leave both in flight and let the
 * slower one win, which is how a browse list ends up showing the previous
 * folder's children. `toSignal` owns the subscription, so there is nothing to
 * unsubscribe by hand.
 */
export class DocumentsComponent {
    browse = inject(BrowseService);
    /** Bound from `?path=` by `withComponentInputBinding()`. */
    path = input('', ...(ngDevMode ? [{ debugName: "path" }] : []));
    currentPath = computed(() => normalizeNuxeoPath(this.path() || DEFAULT_ROOT_PATH), ...(ngDevMode ? [{ debugName: "currentPath" }] : []));
    /** See the note in `SearchComponent`: an inline literal picks the wrong `toSignal` overload. */
    static INITIAL = { kind: 'loading' };
    state = toSignal(toObservable(this.currentPath).pipe(switchMap((path) => this.browse.getBrowseFolderContents(path, 100).pipe(map((contents) => ({
        kind: 'ready',
        folder: contents.folder,
        rows: contents.entries.map(toRow),
        hasMore: contents.hasNextPage === true,
    })), catchError((error) => of({ kind: 'error', message: describe(error) })), 
    // Without this the previous folder's rows stay on screen for the whole
    // round trip, which reads as "the click did nothing".
    startWith({ kind: 'loading' })))), { initialValue: DocumentsComponent.INITIAL });
    /**
     * Narrowed views of {@link state}, so the template never needs `$any()`.
     *
     * A discriminated union is the right model for "loading, failed or here", but
     * Angular's template type checker cannot narrow `state().kind` across a
     * `@switch`, so reading `state().message` inside the error branch is an error.
     * Narrowing in TypeScript and exposing the branches keeps the template honest.
     */
    errorMessage = computed(() => {
        const state = this.state();
        return state.kind === 'error' ? state.message : null;
    }, ...(ngDevMode ? [{ debugName: "errorMessage" }] : []));
    loading = computed(() => this.state().kind === 'loading', ...(ngDevMode ? [{ debugName: "loading" }] : []));
    ready = computed(() => {
        const state = this.state();
        return state.kind === 'ready' ? state : null;
    }, ...(ngDevMode ? [{ debugName: "ready" }] : []));
    /** Clickable ancestors, from the repository root down to the open folder. */
    breadcrumbs = computed(() => cumulativeNuxeoPathPrefixes(this.currentPath()).map((prefix) => ({
        path: prefix,
        label: prefix.split('/').filter(Boolean).at(-1) ?? prefix,
    })), ...(ngDevMode ? [{ debugName: "breadcrumbs" }] : []));
    static ɵfac = function DocumentsComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DocumentsComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DocumentsComponent, selectors: [["app-documents"]], inputs: { path: [1, "path"] }, decls: 8, vars: 5, consts: [["aria-label", "Breadcrumb", 1, "docs__crumbs"], [1, "docs__crumb", 3, "routerLink"], ["role", "status", 1, "docs__status"], ["role", "alert", 1, "docs__error"], ["aria-hidden", "true", 1, "docs__crumb-sep"], [1, "docs__crumb", 3, "routerLink", "queryParams"], [1, "docs__header"], [1, "docs__title"], [1, "docs__meta"], [1, "docs__badge"], [1, "docs__status"], [1, "docs__table"], [1, "docs__caption"], ["scope", "col"], ["scope", "col", 1, "docs__cell--right"], [1, "docs__link", 3, "routerLink", "queryParams"], [1, "docs__link", 3, "routerLink"], [1, "docs__row-description"], [1, "docs__cell--right"]], template: function DocumentsComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "nav", 0)(1, "a", 1);
            i0.ɵɵtext(2, "repository");
            i0.ɵɵelementEnd();
            i0.ɵɵrepeaterCreate(3, DocumentsComponent_For_4_Template, 4, 6, null, null, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(5, DocumentsComponent_Conditional_5_Template, 2, 0, "p", 2);
            i0.ɵɵconditionalCreate(6, DocumentsComponent_Conditional_6_Template, 2, 1, "p", 3);
            i0.ɵɵconditionalCreate(7, DocumentsComponent_Conditional_7_Template, 12, 5);
        } if (rf & 2) {
            let tmp_3_0;
            let tmp_4_0;
            i0.ɵɵadvance();
            i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction0(4, _c0));
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.breadcrumbs());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.loading() ? 5 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_3_0 = ctx.errorMessage()) ? 6 : -1, tmp_3_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_4_0 = ctx.ready()) ? 7 : -1, tmp_4_0);
        } }, dependencies: [RouterLink], styles: [".docs__crumbs[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.375rem;\n  margin-bottom: 1rem;\n  font-size: 0.8125rem;\n  font-family: ui-monospace, SFMono-Regular, monospace;\n}\n\n.docs__crumb[_ngcontent-%COMP%] {\n  color: var(--shell-accent, #1f6feb);\n  text-decoration: none;\n\n  &:hover {\n    text-decoration: underline;\n  }\n}\n\n.docs__crumb-sep[_ngcontent-%COMP%] {\n  color: var(--shell-muted, #656d76);\n}\n\n.docs__header[_ngcontent-%COMP%] {\n  margin-bottom: 1.25rem;\n}\n\n.docs__title[_ngcontent-%COMP%] {\n  margin: 0 0 0.375rem;\n  font-size: 1.5rem;\n}\n\n.docs__meta[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.75rem;\n  margin: 0;\n  font-size: 0.8125rem;\n  color: var(--shell-muted, #656d76);\n}\n\n.docs__badge[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 0.0625rem 0.4375rem;\n  border-radius: 999px;\n  font-size: 0.75rem;\n  font-weight: 600;\n  color: var(--shell-fg, #1f2328);\n  background: var(--shell-surface-alt, #eaeef2);\n  border: 1px solid var(--shell-border, #d0d7de);\n}\n\n.docs__table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 0.875rem;\n  background: var(--shell-surface, #ffffff);\n\n  th,\n  td {\n    padding: 0.5rem 0.75rem;\n    text-align: left;\n    vertical-align: top;\n    border-bottom: 1px solid var(--shell-border, #d0d7de);\n  }\n\n  th {\n    font-size: 0.75rem;\n    text-transform: uppercase;\n    letter-spacing: 0.04em;\n    color: var(--shell-muted, #656d76);\n    background: var(--shell-surface-alt, #eaeef2);\n  }\n\n  tbody tr:hover {\n    background: var(--shell-surface-alt, #eaeef2);\n  }\n}\n\n.docs__caption[_ngcontent-%COMP%] {\n  padding-bottom: 0.5rem;\n  text-align: left;\n  font-size: 0.8125rem;\n  color: var(--shell-muted, #656d76);\n}\n\n.docs__cell--right[_ngcontent-%COMP%] {\n  text-align: right;\n}\n\n.docs__link[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: var(--shell-accent, #1f6feb);\n  text-decoration: none;\n\n  &:hover {\n    text-decoration: underline;\n  }\n}\n\n.docs__row-description[_ngcontent-%COMP%] {\n  display: block;\n  margin-top: 0.1875rem;\n  max-width: 60ch;\n  font-size: 0.8125rem;\n  font-weight: 400;\n  color: var(--shell-muted, #656d76);\n}\n\n.docs__status[_ngcontent-%COMP%] {\n  margin: 1rem 0;\n  font-size: 0.875rem;\n  color: var(--shell-muted, #656d76);\n}\n\n.docs__error[_ngcontent-%COMP%] {\n  margin: 1rem 0;\n  padding: 0.625rem 0.75rem;\n  border-radius: 6px;\n  font-size: 0.875rem;\n  background: var(--shell-warn-bg, #fff8c5);\n  border: 1px solid var(--shell-warn-border, #d4a72c);\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DocumentsComponent, [{
        type: Component,
        args: [{ selector: 'app-documents', standalone: true, imports: [RouterLink], template: "<nav class=\"docs__crumbs\" aria-label=\"Breadcrumb\">\n  <a class=\"docs__crumb\" [routerLink]=\"['/documents']\">repository</a>\n  @for (crumb of breadcrumbs(); track crumb.path) {\n    <span class=\"docs__crumb-sep\" aria-hidden=\"true\">/</span>\n    <a class=\"docs__crumb\" [routerLink]=\"['/documents']\" [queryParams]=\"{ path: crumb.path }\">\n      {{ crumb.label }}\n    </a>\n  }\n</nav>\n\n@if (loading()) {\n  <p class=\"docs__status\" role=\"status\">Loading from Nuxeo\u2026</p>\n}\n\n@if (errorMessage(); as message) {\n  <p class=\"docs__error\" role=\"alert\">{{ message }}</p>\n}\n\n@if (ready(); as ready) {\n  <header class=\"docs__header\">\n    <h1 class=\"docs__title\">{{ ready.folder.title }}</h1>\n    <p class=\"docs__meta\">\n      <span class=\"docs__badge\">{{ ready.folder.type }}</span>\n      <code>{{ ready.folder.path }}</code>\n      <span>{{ ready.rows.length }} item(s)</span>\n    </p>\n  </header>\n\n  @if (ready.rows.length) {\n    <table class=\"docs__table\">\n      <caption class=\"docs__caption\">\n        Children returned by\n        <code>BrowseService.getBrowseFolderContents()</code>\n        \u2014 read live from the Nuxeo REST API.\n      </caption>\n      <thead>\n        <tr>\n          <th scope=\"col\">Title</th>\n          <th scope=\"col\">Type</th>\n          <th scope=\"col\">Modified</th>\n          <th scope=\"col\">Author</th>\n          <th scope=\"col\" class=\"docs__cell--right\">Size</th>\n        </tr>\n      </thead>\n      <tbody>\n        @for (row of ready.rows; track row.uid) {\n          <tr>\n            <td>\n              @if (row.folderish) {\n                <a\n                  class=\"docs__link\"\n                  [routerLink]=\"['/documents']\"\n                  [queryParams]=\"{ path: row.path }\"\n                  >{{ row.title }}</a\n                >\n              } @else {\n                <a class=\"docs__link\" [routerLink]=\"['/documents', row.uid]\">{{ row.title }}</a>\n              }\n              @if (row.description) {\n                <span class=\"docs__row-description\">{{ row.description }}</span>\n              }\n            </td>\n            <td>\n              <span class=\"docs__badge\">{{ row.type }}</span>\n            </td>\n            <td>{{ row.modified }}</td>\n            <td>{{ row.creator }}</td>\n            <td class=\"docs__cell--right\">{{ row.size }}</td>\n          </tr>\n        }\n      </tbody>\n    </table>\n\n    @if (ready.hasMore) {\n      <p class=\"docs__status\">\n        Nuxeo has more children than this page requested. Paging is a fork's decision, so the\n        template does not guess at one.\n      </p>\n    }\n  } @else {\n    <p class=\"docs__status\">This folder is empty.</p>\n  }\n}\n", styles: [".docs__crumbs {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.375rem;\n  margin-bottom: 1rem;\n  font-size: 0.8125rem;\n  font-family: ui-monospace, SFMono-Regular, monospace;\n}\n\n.docs__crumb {\n  color: var(--shell-accent, #1f6feb);\n  text-decoration: none;\n\n  &:hover {\n    text-decoration: underline;\n  }\n}\n\n.docs__crumb-sep {\n  color: var(--shell-muted, #656d76);\n}\n\n.docs__header {\n  margin-bottom: 1.25rem;\n}\n\n.docs__title {\n  margin: 0 0 0.375rem;\n  font-size: 1.5rem;\n}\n\n.docs__meta {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.75rem;\n  margin: 0;\n  font-size: 0.8125rem;\n  color: var(--shell-muted, #656d76);\n}\n\n.docs__badge {\n  display: inline-block;\n  padding: 0.0625rem 0.4375rem;\n  border-radius: 999px;\n  font-size: 0.75rem;\n  font-weight: 600;\n  color: var(--shell-fg, #1f2328);\n  background: var(--shell-surface-alt, #eaeef2);\n  border: 1px solid var(--shell-border, #d0d7de);\n}\n\n.docs__table {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 0.875rem;\n  background: var(--shell-surface, #ffffff);\n\n  th,\n  td {\n    padding: 0.5rem 0.75rem;\n    text-align: left;\n    vertical-align: top;\n    border-bottom: 1px solid var(--shell-border, #d0d7de);\n  }\n\n  th {\n    font-size: 0.75rem;\n    text-transform: uppercase;\n    letter-spacing: 0.04em;\n    color: var(--shell-muted, #656d76);\n    background: var(--shell-surface-alt, #eaeef2);\n  }\n\n  tbody tr:hover {\n    background: var(--shell-surface-alt, #eaeef2);\n  }\n}\n\n.docs__caption {\n  padding-bottom: 0.5rem;\n  text-align: left;\n  font-size: 0.8125rem;\n  color: var(--shell-muted, #656d76);\n}\n\n.docs__cell--right {\n  text-align: right;\n}\n\n.docs__link {\n  font-weight: 600;\n  color: var(--shell-accent, #1f6feb);\n  text-decoration: none;\n\n  &:hover {\n    text-decoration: underline;\n  }\n}\n\n.docs__row-description {\n  display: block;\n  margin-top: 0.1875rem;\n  max-width: 60ch;\n  font-size: 0.8125rem;\n  font-weight: 400;\n  color: var(--shell-muted, #656d76);\n}\n\n.docs__status {\n  margin: 1rem 0;\n  font-size: 0.875rem;\n  color: var(--shell-muted, #656d76);\n}\n\n.docs__error {\n  margin: 1rem 0;\n  padding: 0.625rem 0.75rem;\n  border-radius: 6px;\n  font-size: 0.875rem;\n  background: var(--shell-warn-bg, #fff8c5);\n  border: 1px solid var(--shell-warn-border, #d4a72c);\n}\n"] }]
    }], null, { path: [{ type: i0.Input, args: [{ isSignal: true, alias: "path", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DocumentsComponent, { className: "DocumentsComponent", filePath: "apps/nuxeo-satori-template/src/app/pages/documents/documents.ts", lineNumber: 74 }); })();
function toRow(doc) {
    const blob = mainBlob(doc);
    return {
        uid: doc.uid,
        // `dc:title` is the authoritative title; `doc.title` is Nuxeo's own
        // convenience copy and is absent from some page-provider payloads.
        title: stringProperty(doc, 'dc:title') ?? doc.title ?? doc.uid,
        type: doc.type,
        path: doc.path,
        folderish: isFolderishDocument(doc),
        modified: formatTimestamp(stringProperty(doc, 'dc:modified') ?? doc.lastModified),
        creator: stringProperty(doc, 'dc:creator') ?? '—',
        size: formatBytes(blob?.length ?? null),
        description: stringProperty(doc, 'dc:description'),
    };
}
function describe(error) {
    if (error instanceof HttpErrorResponse) {
        if (error.status === 401)
            return 'Nuxeo rejected the session. Sign in again.';
        if (error.status === 403)
            return 'You do not have permission to read this folder.';
        if (error.status === 404)
            return 'That path does not exist in the repository.';
        if (error.status === 0)
            return 'Could not reach Nuxeo.';
        return `Nuxeo answered HTTP ${error.status}.`;
    }
    return error instanceof Error ? error.message : 'Unable to load this folder.';
}
