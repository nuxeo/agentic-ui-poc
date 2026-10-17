import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, from, map, of, startWith, switchMap } from 'rxjs';
import { DocumentDetailService, parentNuxeoFolderPath, } from '@nuxeo/satori-platform/nuxeo-client';
import { formatBytes, formatTimestamp, mainBlob, stringProperty } from './document-fields';
import * as i0 from "@angular/core";
const _c0 = () => ["/documents"];
const _c1 = a0 => ({ path: a0 });
const _forTrack0 = ($index, $item) => $item.label;
function DocumentDetailComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 0);
    i0.ɵɵtext(1, "Loading document from Nuxeo\u2026");
    i0.ɵɵelementEnd();
} }
function DocumentDetailComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx);
} }
function DocumentDetailComponent_Conditional_2_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 3);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const parent_r1 = ctx;
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction0(3, _c0))("queryParams", i0.ɵɵpureFunction1(4, _c1, parent_r1));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" \u2190 ", parent_r1, " ");
} }
function DocumentDetailComponent_Conditional_2_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 6);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx);
} }
function DocumentDetailComponent_Conditional_2_For_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "dt");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "dd");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const fact_r2 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(fact_r2.label);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(fact_r2.value);
} }
function DocumentDetailComponent_Conditional_2_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 7)(1, "h2");
    i0.ɵɵtext(2, "Note content");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "pre", 10);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx);
} }
function DocumentDetailComponent_Conditional_2_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 7)(1, "h2");
    i0.ɵɵtext(2, "File content");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p", 8);
    i0.ɵɵtext(4, " Downloaded as a blob through ");
    i0.ɵɵelementStart(5, "code");
    i0.ɵɵtext(6, "DocumentDetailService.fetchBlob()");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(7, ", so it carries this application's authentication. ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "pre", 10);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(9);
    i0.ɵɵtextInterpolate(ctx);
} }
function DocumentDetailComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "nav", 2);
    i0.ɵɵconditionalCreate(1, DocumentDetailComponent_Conditional_2_Conditional_1_Template, 2, 6, "a", 3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "header", 4)(3, "h1", 5);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, DocumentDetailComponent_Conditional_2_Conditional_5_Template, 2, 1, "p", 6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "section", 7)(7, "h2");
    i0.ɵɵtext(8, "Metadata");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "p", 8);
    i0.ɵɵtext(10, " Every row below came from ");
    i0.ɵɵelementStart(11, "code");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(13, " with ");
    i0.ɵɵelementStart(14, "code");
    i0.ɵɵtext(15, "properties: *");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(16, ". ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "dl", 9);
    i0.ɵɵrepeaterCreate(18, DocumentDetailComponent_Conditional_2_For_19_Template, 4, 2, null, null, _forTrack0);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(20, DocumentDetailComponent_Conditional_2_Conditional_20_Template, 5, 1, "section", 7);
    i0.ɵɵconditionalCreate(21, DocumentDetailComponent_Conditional_2_Conditional_21_Template, 10, 1, "section", 7);
} if (rf & 2) {
    let tmp_2_0;
    let tmp_4_0;
    let tmp_7_0;
    let tmp_8_0;
    const doc_r3 = ctx;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_2_0 = ctx_r3.parentPath()) ? 1 : -1, tmp_2_0);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(doc_r3.title);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_4_0 = ctx_r3.description()) ? 5 : -1, tmp_4_0);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate1("GET /nuxeo/api/v1/id/", doc_r3.uid);
    i0.ɵɵadvance(6);
    i0.ɵɵrepeater(ctx_r3.facts());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_7_0 = ctx_r3.noteContent()) ? 20 : -1, tmp_7_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_8_0 = ctx_r3.preview()) ? 21 : -1, tmp_8_0);
} }
/**
 * One document, its metadata, and its actual content.
 *
 * The content preview is the part worth pointing at: it fetches the **blob**
 * through `DocumentDetailService.fetchBlob()` and reads it as text. That is the
 * only correct way to get a Nuxeo binary into a page — a `<img [src]>` or a bare
 * `fetch()` would bypass this application's auth interceptor and 401. Because it
 * renders the text rather than a URL, there is no object URL to revoke; a fork
 * previewing images must create one **and** revoke it on destroy.
 */
export class DocumentDetailComponent {
    documents = inject(DocumentDetailService);
    /** Bound from the `:uid` route parameter by `withComponentInputBinding()`. */
    uid = input.required(...(ngDevMode ? [{ debugName: "uid" }] : []));
    /** See the note in `SearchComponent`: an inline literal picks the wrong `toSignal` overload. */
    static INITIAL = { kind: 'loading' };
    state = toSignal(toObservable(this.uid).pipe(switchMap((uid) => this.documents.getFullDocument(uid).pipe(map((doc) => ({ kind: 'ready', doc })), catchError((error) => of({ kind: 'error', message: describe(error) })), startWith({ kind: 'loading' })))), { initialValue: DocumentDetailComponent.INITIAL });
    loading = computed(() => this.state().kind === 'loading', ...(ngDevMode ? [{ debugName: "loading" }] : []));
    errorMessage = computed(() => {
        const state = this.state();
        return state.kind === 'error' ? state.message : null;
    }, ...(ngDevMode ? [{ debugName: "errorMessage" }] : []));
    doc = computed(() => {
        const state = this.state();
        return state.kind === 'ready' ? state.doc : null;
    }, ...(ngDevMode ? [{ debugName: "doc" }] : []));
    parentPath = computed(() => {
        const doc = this.doc();
        return doc ? parentNuxeoFolderPath(doc.path) : null;
    }, ...(ngDevMode ? [{ debugName: "parentPath" }] : []));
    /** Dublin Core and lifecycle facts, skipping anything Nuxeo did not return. */
    facts = computed(() => {
        const doc = this.doc();
        if (!doc)
            return [];
        const blob = mainBlob(doc);
        const candidates = [
            { label: 'Type', value: doc.type },
            { label: 'Path', value: doc.path },
            { label: 'UID', value: doc.uid },
            { label: 'Lifecycle state', value: doc.state ?? '—' },
            { label: 'Created', value: formatTimestamp(stringProperty(doc, 'dc:created')) },
            {
                label: 'Modified',
                value: formatTimestamp(stringProperty(doc, 'dc:modified') ?? doc.lastModified),
            },
            { label: 'Author', value: stringProperty(doc, 'dc:creator') ?? '—' },
            {
                label: 'Last contributor',
                value: stringProperty(doc, 'dc:lastContributor') ?? '—',
            },
            nullable('Source', stringProperty(doc, 'dc:source')),
            nullable('Rights', stringProperty(doc, 'dc:rights')),
            nullable('File name', blob?.name ?? null),
            nullable('MIME type', blob?.mimeType ?? null),
            blob ? { label: 'Size', value: formatBytes(blob.length) } : null,
        ];
        return candidates.filter((fact) => fact !== null);
    }, ...(ngDevMode ? [{ debugName: "facts" }] : []));
    description = computed(() => {
        const doc = this.doc();
        return doc ? stringProperty(doc, 'dc:description') : null;
    }, ...(ngDevMode ? [{ debugName: "description" }] : []));
    /** A `Note`'s body lives in a property, not a blob. */
    noteContent = computed(() => {
        const doc = this.doc();
        return doc ? stringProperty(doc, 'note:note') : null;
    }, ...(ngDevMode ? [{ debugName: "noteContent" }] : []));
    /**
     * The blob's text, for the text/* documents this repository holds.
     *
     * Keyed on the uid rather than on `doc()` so switching documents cancels the
     * previous download instead of racing it.
     */
    preview = toSignal(toObservable(computed(() => this.textBlobUid())).pipe(switchMap((uid) => {
        if (!uid)
            return of(null);
        return this.documents.fetchBlob(uid).pipe(switchMap((blob) => from(blob.text())), map((text) => (text.length > 4000 ? `${text.slice(0, 4000)}\n…` : text)), catchError(() => of(null)), startWith(null));
    })), { initialValue: null });
    textBlobUid() {
        const doc = this.doc();
        if (!doc)
            return null;
        const blob = mainBlob(doc);
        if (!blob?.mimeType?.startsWith('text/'))
            return null;
        return doc.uid;
    }
    static ɵfac = function DocumentDetailComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DocumentDetailComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DocumentDetailComponent, selectors: [["app-document-detail"]], inputs: { uid: [1, "uid"] }, decls: 3, vars: 3, consts: [["role", "status", 1, "detail__status"], ["role", "alert", 1, "detail__error"], ["aria-label", "Breadcrumb", 1, "detail__crumbs"], [1, "detail__crumb", 3, "routerLink", "queryParams"], [1, "detail__header"], [1, "detail__title"], [1, "detail__description"], [1, "detail__panel"], [1, "detail__hint"], [1, "detail__facts"], [1, "detail__content"]], template: function DocumentDetailComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, DocumentDetailComponent_Conditional_0_Template, 2, 0, "p", 0);
            i0.ɵɵconditionalCreate(1, DocumentDetailComponent_Conditional_1_Template, 2, 1, "p", 1);
            i0.ɵɵconditionalCreate(2, DocumentDetailComponent_Conditional_2_Template, 22, 6);
        } if (rf & 2) {
            let tmp_1_0;
            let tmp_2_0;
            i0.ɵɵconditional(ctx.loading() ? 0 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_1_0 = ctx.errorMessage()) ? 1 : -1, tmp_1_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_2_0 = ctx.doc()) ? 2 : -1, tmp_2_0);
        } }, dependencies: [RouterLink], styles: [".detail__crumbs[_ngcontent-%COMP%] {\n  margin-bottom: 1rem;\n  font-size: 0.8125rem;\n  font-family: ui-monospace, SFMono-Regular, monospace;\n}\n\n.detail__crumb[_ngcontent-%COMP%] {\n  color: var(--shell-accent, #1f6feb);\n  text-decoration: none;\n\n  &:hover {\n    text-decoration: underline;\n  }\n}\n\n.detail__header[_ngcontent-%COMP%] {\n  margin-bottom: 1.5rem;\n}\n\n.detail__title[_ngcontent-%COMP%] {\n  margin: 0 0 0.5rem;\n  font-size: 1.5rem;\n}\n\n.detail__description[_ngcontent-%COMP%] {\n  margin: 0;\n  max-width: 70ch;\n  color: var(--shell-muted, #656d76);\n}\n\n.detail__panel[_ngcontent-%COMP%] {\n  margin-bottom: 1.5rem;\n  padding: 1.25rem;\n  border: 1px solid var(--shell-border, #d0d7de);\n  border-radius: 8px;\n  background: var(--shell-surface, #ffffff);\n\n  h2 {\n    margin: 0 0 0.5rem;\n    font-size: 1.0625rem;\n  }\n}\n\n.detail__hint[_ngcontent-%COMP%] {\n  margin: 0 0 1rem;\n  font-size: 0.8125rem;\n  color: var(--shell-muted, #656d76);\n}\n\n.detail__facts[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 12rem 1fr;\n  gap: 0.375rem 1rem;\n  margin: 0;\n  font-size: 0.875rem;\n\n  dt {\n    font-weight: 600;\n    color: var(--shell-muted, #656d76);\n  }\n\n  dd {\n    margin: 0;\n    overflow-wrap: anywhere;\n  }\n}\n\n.detail__content[_ngcontent-%COMP%] {\n  margin: 0;\n  padding: 0.875rem 1rem;\n  max-height: 22rem;\n  overflow: auto;\n  border-radius: 6px;\n  font-size: 0.8125rem;\n  line-height: 1.55;\n  white-space: pre-wrap;\n  background: var(--shell-surface-alt, #eaeef2);\n  border: 1px solid var(--shell-border, #d0d7de);\n}\n\n.detail__status[_ngcontent-%COMP%] {\n  margin: 1rem 0;\n  font-size: 0.875rem;\n  color: var(--shell-muted, #656d76);\n}\n\n.detail__error[_ngcontent-%COMP%] {\n  margin: 1rem 0;\n  padding: 0.625rem 0.75rem;\n  border-radius: 6px;\n  font-size: 0.875rem;\n  background: var(--shell-warn-bg, #fff8c5);\n  border: 1px solid var(--shell-warn-border, #d4a72c);\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DocumentDetailComponent, [{
        type: Component,
        args: [{ selector: 'app-document-detail', standalone: true, imports: [RouterLink], template: "@if (loading()) {\n  <p class=\"detail__status\" role=\"status\">Loading document from Nuxeo\u2026</p>\n}\n\n@if (errorMessage(); as message) {\n  <p class=\"detail__error\" role=\"alert\">{{ message }}</p>\n}\n\n@if (doc(); as doc) {\n  <nav class=\"detail__crumbs\" aria-label=\"Breadcrumb\">\n    @if (parentPath(); as parent) {\n      <a class=\"detail__crumb\" [routerLink]=\"['/documents']\" [queryParams]=\"{ path: parent }\">\n        \u2190 {{ parent }}\n      </a>\n    }\n  </nav>\n\n  <header class=\"detail__header\">\n    <h1 class=\"detail__title\">{{ doc.title }}</h1>\n    @if (description(); as description) {\n      <p class=\"detail__description\">{{ description }}</p>\n    }\n  </header>\n\n  <section class=\"detail__panel\">\n    <h2>Metadata</h2>\n    <p class=\"detail__hint\">\n      Every row below came from <code>GET /nuxeo/api/v1/id/{{ doc.uid }}</code> with\n      <code>properties: *</code>.\n    </p>\n    <dl class=\"detail__facts\">\n      @for (fact of facts(); track fact.label) {\n        <dt>{{ fact.label }}</dt>\n        <dd>{{ fact.value }}</dd>\n      }\n    </dl>\n  </section>\n\n  @if (noteContent(); as note) {\n    <section class=\"detail__panel\">\n      <h2>Note content</h2>\n      <pre class=\"detail__content\">{{ note }}</pre>\n    </section>\n  }\n\n  @if (preview(); as preview) {\n    <section class=\"detail__panel\">\n      <h2>File content</h2>\n      <p class=\"detail__hint\">\n        Downloaded as a blob through <code>DocumentDetailService.fetchBlob()</code>, so it carries\n        this application's authentication.\n      </p>\n      <pre class=\"detail__content\">{{ preview }}</pre>\n    </section>\n  }\n}\n", styles: [".detail__crumbs {\n  margin-bottom: 1rem;\n  font-size: 0.8125rem;\n  font-family: ui-monospace, SFMono-Regular, monospace;\n}\n\n.detail__crumb {\n  color: var(--shell-accent, #1f6feb);\n  text-decoration: none;\n\n  &:hover {\n    text-decoration: underline;\n  }\n}\n\n.detail__header {\n  margin-bottom: 1.5rem;\n}\n\n.detail__title {\n  margin: 0 0 0.5rem;\n  font-size: 1.5rem;\n}\n\n.detail__description {\n  margin: 0;\n  max-width: 70ch;\n  color: var(--shell-muted, #656d76);\n}\n\n.detail__panel {\n  margin-bottom: 1.5rem;\n  padding: 1.25rem;\n  border: 1px solid var(--shell-border, #d0d7de);\n  border-radius: 8px;\n  background: var(--shell-surface, #ffffff);\n\n  h2 {\n    margin: 0 0 0.5rem;\n    font-size: 1.0625rem;\n  }\n}\n\n.detail__hint {\n  margin: 0 0 1rem;\n  font-size: 0.8125rem;\n  color: var(--shell-muted, #656d76);\n}\n\n.detail__facts {\n  display: grid;\n  grid-template-columns: 12rem 1fr;\n  gap: 0.375rem 1rem;\n  margin: 0;\n  font-size: 0.875rem;\n\n  dt {\n    font-weight: 600;\n    color: var(--shell-muted, #656d76);\n  }\n\n  dd {\n    margin: 0;\n    overflow-wrap: anywhere;\n  }\n}\n\n.detail__content {\n  margin: 0;\n  padding: 0.875rem 1rem;\n  max-height: 22rem;\n  overflow: auto;\n  border-radius: 6px;\n  font-size: 0.8125rem;\n  line-height: 1.55;\n  white-space: pre-wrap;\n  background: var(--shell-surface-alt, #eaeef2);\n  border: 1px solid var(--shell-border, #d0d7de);\n}\n\n.detail__status {\n  margin: 1rem 0;\n  font-size: 0.875rem;\n  color: var(--shell-muted, #656d76);\n}\n\n.detail__error {\n  margin: 1rem 0;\n  padding: 0.625rem 0.75rem;\n  border-radius: 6px;\n  font-size: 0.875rem;\n  background: var(--shell-warn-bg, #fff8c5);\n  border: 1px solid var(--shell-warn-border, #d4a72c);\n}\n"] }]
    }], null, { uid: [{ type: i0.Input, args: [{ isSignal: true, alias: "uid", required: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DocumentDetailComponent, { className: "DocumentDetailComponent", filePath: "apps/nuxeo-satori-template/src/app/pages/documents/document-detail.ts", lineNumber: 42 }); })();
function nullable(label, value) {
    return value === null ? null : { label, value };
}
function describe(error) {
    if (error instanceof HttpErrorResponse) {
        if (error.status === 401)
            return 'Nuxeo rejected the session. Sign in again.';
        if (error.status === 403)
            return 'You do not have permission to read this document.';
        if (error.status === 404)
            return 'That document no longer exists.';
        if (error.status === 0)
            return 'Could not reach Nuxeo.';
        return `Nuxeo answered HTTP ${error.status}.`;
    }
    return error instanceof Error ? error.message : 'Unable to load this document.';
}
