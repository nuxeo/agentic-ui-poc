import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { catchError, map, of, startWith } from 'rxjs';
import { DocumentDetailService, SearchService, trustObjectUrl, } from '@nuxeo/satori-platform/nuxeo-client';
import { DocumentViewerComponent, ExportDialogComponent, ShareDialogComponent, WidgetContainerComponent, WidgetGridComponent, } from '@nuxeo/satori-platform/ui';
import { formatBytes, formatTimestamp, mainBlob, stringProperty, } from '../documents/document-fields';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.label;
function CaseFileComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 2);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function CaseFileComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 5);
    i0.ɵɵtext(1, "Loading\u2026");
    i0.ɵɵelementEnd();
} }
function CaseFileComponent_Conditional_13_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li")(1, "button", 12);
    i0.ɵɵlistener("click", function CaseFileComponent_Conditional_13_For_2_Template_button_click_1_listener() { const item_r3 = i0.ɵɵrestoreView(_r2).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.select(item_r3)); });
    i0.ɵɵelementStart(2, "span", 13);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 14);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const item_r3 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("case-file__row--on", item_r3.id === ctx_r0.selectedId());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r3.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r3.type);
} }
function CaseFileComponent_Conditional_13_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 5);
    i0.ɵɵtext(1, "No documents.");
    i0.ɵɵelementEnd();
} }
function CaseFileComponent_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 6);
    i0.ɵɵrepeaterCreate(1, CaseFileComponent_Conditional_13_For_2_Template, 6, 4, "li", null, _forTrack0);
    i0.ɵɵconditionalCreate(3, CaseFileComponent_Conditional_13_Conditional_3_Template, 2, 0, "li", 5);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.items());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.items().length === 0 ? 3 : -1);
} }
function CaseFileComponent_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 5);
    i0.ɵɵtext(1, "Select a document.");
    i0.ɵɵelementEnd();
} }
function CaseFileComponent_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 5);
    i0.ɵɵtext(1, "Loading metadata\u2026");
    i0.ɵɵelementEnd();
} }
function CaseFileComponent_Conditional_17_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 15)(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const fact_r4 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(fact_r4.label);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(fact_r4.value);
} }
function CaseFileComponent_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "dl", 8);
    i0.ɵɵrepeaterCreate(1, CaseFileComponent_Conditional_17_For_2_Template, 5, 2, "div", 15, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.facts());
} }
function CaseFileComponent_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 5);
    i0.ɵɵtext(1, "Select a document.");
    i0.ɵɵelementEnd();
} }
function CaseFileComponent_Conditional_20_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 5);
    i0.ɵɵtext(1, " This document has no attachment, so there is nothing to download or preview. ");
    i0.ɵɵelementEnd();
} }
function CaseFileComponent_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 16)(1, "button", 17);
    i0.ɵɵlistener("click", function CaseFileComponent_Conditional_20_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.share()); });
    i0.ɵɵtext(2, "Share");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 17);
    i0.ɵɵlistener("click", function CaseFileComponent_Conditional_20_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.exportDocument()); });
    i0.ɵɵtext(4, "Export\u2026");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 18);
    i0.ɵɵlistener("click", function CaseFileComponent_Conditional_20_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.download()); });
    i0.ɵɵtext(6, "Download");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(7, CaseFileComponent_Conditional_20_Conditional_7_Template, 2, 0, "p", 5);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("disabled", !ctx_r0.hasAttachment());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r0.hasAttachment() ? 7 : -1);
} }
function CaseFileComponent_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 5);
    i0.ɵɵtext(1, "Select a document to preview its content.");
    i0.ɵɵelementEnd();
} }
function CaseFileComponent_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 5);
    i0.ɵɵtext(1, "No attachment on this document.");
    i0.ɵɵelementEnd();
} }
function CaseFileComponent_Conditional_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "lib-document-viewer", 11);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("blobUrl", ctx_r0.blobUrl())("rawBlobUrl", ctx_r0.rawObjectUrl())("blobType", ctx_r0.objectBlobType())("mimeType", ctx_r0.mimeType())("fileName", ctx_r0.fileName())("fileSize", ctx_r0.fileSize())("loading", ctx_r0.previewLoading());
} }
/**
 * A case file — one ECM working surface, assembled only from published platform APIs.
 *
 * This page answers "what can we actually build on this?" with something closer to a real content
 * task than a stat tile. Four things every content application needs, on one screen:
 *
 * | Concern           | Comes from                                                             |
 * | ----------------- | ---------------------------------------------------------------------- |
 * | Finding documents | `SearchService.search()`                                               |
 * | Metadata          | `DocumentDetailService.getFullDocument()` + this template's own readers |
 * | Content preview   | `DocumentViewerComponent`, published by the platform                   |
 * | Actions           | `ShareDialogComponent`, `ExportDialogComponent`, download              |
 *
 * **Every import is a published entry point.** Nothing reaches into `libs/shared/*` or the product
 * application, which is the property that keeps an upgrade a version bump.
 *
 * ## Search results are not documents, and that shape difference is deliberate
 *
 * `search()` answers `SearchResultItem` — a flat row built for a list: `title`, `type`,
 * `modifiedDate`, `lastContributor`. It carries **no `properties` bag and no blob**, so it cannot
 * feed a metadata panel or a preview. Selecting a row therefore fetches the full `NuxeoDocument`
 * with `getFullDocument(id)`. That two-step is what a real ECM UI does, and collapsing it would mean
 * either over-fetching every row or rendering a metadata panel with holes in it.
 *
 * ## The blob lifecycle is the part worth copying
 *
 * A Nuxeo binary must never reach `[src]` as a URL — that request leaves this application's HTTP
 * interceptor behind and answers 401. So the blob is fetched through the service, wrapped in an
 * object URL, and, the half that gets forgotten, **revoked both when the preview is replaced and when
 * the component is destroyed**. `document-detail.ts` sidesteps this by rendering text, and its own
 * comment says a fork previewing binaries has to do the rest. This is that fork.
 */
export class CaseFileComponent {
    search = inject(SearchService);
    documents = inject(DocumentDetailService);
    dialog = inject(MatDialog);
    sanitizer = inject(DomSanitizer);
    destroyRef = inject(DestroyRef);
    /** An inline literal picks the wrong `toSignal` overload — see `SearchComponent`. */
    static INITIAL = { kind: 'loading' };
    listState = toSignal(this.search.search({ pageSize: 40 }).pipe(map((response) => ({ kind: 'ready', items: response.items })), catchError(() => of({ kind: 'error', message: 'Could not reach the repository.' })), startWith({ kind: 'loading' })), { initialValue: CaseFileComponent.INITIAL });
    loading = computed(() => this.listState().kind === 'loading', ...(ngDevMode ? [{ debugName: "loading" }] : []));
    error = computed(() => {
        const state = this.listState();
        return state.kind === 'error' ? state.message : null;
    }, ...(ngDevMode ? [{ debugName: "error" }] : []));
    items = computed(() => {
        const state = this.listState();
        return state.kind === 'ready' ? state.items : [];
    }, ...(ngDevMode ? [{ debugName: "items" }] : []));
    selectedId = signal(null, ...(ngDevMode ? [{ debugName: "selectedId" }] : []));
    /** The full document, fetched on selection. `null` until it arrives. */
    doc = signal(null, ...(ngDevMode ? [{ debugName: "doc" }] : []));
    detailLoading = signal(false, ...(ngDevMode ? [{ debugName: "detailLoading" }] : []));
    // ---- preview -------------------------------------------------------------------------------
    blobUrl = signal(null, ...(ngDevMode ? [{ debugName: "blobUrl" }] : []));
    previewLoading = signal(false, ...(ngDevMode ? [{ debugName: "previewLoading" }] : []));
    /**
     * Held alongside the `SafeResourceUrl` because only the raw string can be revoked — and because
     * the viewer needs it for its `SecurityContext.NONE` bindings (`source[src]`, `audio[src]`,
     * `video[poster]`). Angular never unwraps a `Safe*` value in those, so it would be assigned as
     * its `toString()` and break playback; the wrapped form is still required for `iframe[src]`.
     */
    rawObjectUrl = signal(null, ...(ngDevMode ? [{ debugName: "rawObjectUrl" }] : []));
    /** `Blob.type` of the previewed blob. See `DocumentViewerComponent.blobType`. */
    objectBlobType = signal('', ...(ngDevMode ? [{ debugName: "objectBlobType" }] : []));
    /**
     * Bumped on every selection. `takeUntilDestroyed` cancels on teardown but not on *reselection*, so
     * without this a slow response for a previously selected case file can land after a faster one and
     * overwrite `doc` and the preview with stale content. Each continuation compares the generation it
     * captured against the current one and drops out if it has been superseded.
     */
    selectionGeneration = 0;
    constructor() {
        this.destroyRef.onDestroy(() => this.releaseObjectUrl());
    }
    releaseObjectUrl() {
        this.objectBlobType.set('');
        const raw = this.rawObjectUrl();
        if (raw) {
            URL.revokeObjectURL(raw);
            this.rawObjectUrl.set(null);
        }
    }
    blobOf(doc) {
        return doc ? mainBlob(doc) : null;
    }
    facts = computed(() => {
        const doc = this.doc();
        if (!doc)
            return [];
        const blob = mainBlob(doc);
        return [
            { label: 'Title', value: stringProperty(doc, 'dc:title') ?? doc.title },
            { label: 'Type', value: doc.type },
            { label: 'Created', value: formatTimestamp(stringProperty(doc, 'dc:created')) },
            { label: 'Modified', value: formatTimestamp(doc.lastModified) },
            { label: 'Creator', value: stringProperty(doc, 'dc:creator') ?? '—' },
            { label: 'Contributor', value: stringProperty(doc, 'dc:lastContributor') ?? '—' },
            { label: 'Attachment', value: blob?.name ?? 'None' },
            { label: 'Size', value: blob ? formatBytes(blob.length) : '—' },
            { label: 'Path', value: doc.path },
        ];
    }, ...(ngDevMode ? [{ debugName: "facts" }] : []));
    mimeType = computed(() => this.blobOf(this.doc())?.mimeType ?? '', ...(ngDevMode ? [{ debugName: "mimeType" }] : []));
    fileName = computed(() => this.blobOf(this.doc())?.name ?? '', ...(ngDevMode ? [{ debugName: "fileName" }] : []));
    fileSize = computed(() => {
        const blob = this.blobOf(this.doc());
        return blob ? formatBytes(blob.length) : '';
    }, ...(ngDevMode ? [{ debugName: "fileSize" }] : []));
    hasAttachment = computed(() => this.blobOf(this.doc()) !== null, ...(ngDevMode ? [{ debugName: "hasAttachment" }] : []));
    select(item) {
        const gen = ++this.selectionGeneration;
        this.selectedId.set(item.id);
        // Replacing a preview must release the previous object URL, not only the last one on destroy.
        this.releaseObjectUrl();
        this.blobUrl.set(null);
        this.doc.set(null);
        this.detailLoading.set(true);
        // Reset here too: a selection with no attachment never calls loadPreview, so a spinner left
        // over from the previous selection would never be cleared.
        this.previewLoading.set(false);
        this.documents
            .getFullDocument(item.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (doc) => {
                if (gen !== this.selectionGeneration)
                    return;
                this.doc.set(doc);
                this.detailLoading.set(false);
                if (mainBlob(doc))
                    this.loadPreview(doc, gen);
            },
            error: () => {
                if (gen !== this.selectionGeneration)
                    return;
                this.detailLoading.set(false);
            },
        });
    }
    /** @param gen the `selectionGeneration` captured when this preview was requested */
    loadPreview(doc, gen) {
        this.previewLoading.set(true);
        this.documents
            .fetchBlob(doc.uid)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (data) => {
                // A response for a superseded selection must not install itself over the current preview.
                if (gen !== this.selectionGeneration)
                    return;
                // Release whatever is held before replacing it, or the outgoing URL leaks for the
                // lifetime of the page.
                this.releaseObjectUrl();
                const rawUrl = URL.createObjectURL(data);
                this.rawObjectUrl.set(rawUrl);
                // The served Content-Type, which is what gates the viewer's iframe branches.
                this.objectBlobType.set(data.type);
                this.blobUrl.set(trustObjectUrl(this.sanitizer, rawUrl));
                this.previewLoading.set(false);
            },
            error: () => {
                if (gen !== this.selectionGeneration)
                    return;
                this.previewLoading.set(false);
            },
        });
    }
    // ---- actions -------------------------------------------------------------------------------
    share() {
        const doc = this.doc();
        if (!doc)
            return;
        const data = {
            title: doc.title,
            url: `${location.origin}/case-file?uid=${doc.uid}`,
        };
        this.dialog.open(ShareDialogComponent, { data, width: '520px' });
    }
    exportDocument() {
        const doc = this.doc();
        if (!doc)
            return;
        const data = {
            documentUid: doc.uid,
            documentTitle: doc.title,
            // The dialog owns the interaction; the host owns how bytes are fetched, because the platform's
            // services never build an auth header themselves.
            exportFn: (_type, uid) => this.documents.fetchBlob(uid),
        };
        this.dialog.open(ExportDialogComponent, { data, width: '520px' });
    }
    download() {
        const doc = this.doc();
        const blob = this.blobOf(doc);
        if (!doc || !blob)
            return;
        this.documents
            .fetchBlob(doc.uid)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((data) => {
            const url = URL.createObjectURL(data);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = blob.name ?? doc.title;
            anchor.click();
            // Immediate: the click has already handed the bytes to the browser.
            URL.revokeObjectURL(url);
        });
    }
    static ɵfac = function CaseFileComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CaseFileComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CaseFileComponent, selectors: [["app-case-file"]], decls: 27, vars: 6, consts: [[1, "case-file"], [1, "case-file__head"], ["role", "alert", 1, "case-file__error"], [3, "columns"], ["title", "Documents"], [1, "case-file__muted"], [1, "case-file__list"], ["title", "Metadata"], [1, "case-file__facts"], ["title", "Actions"], [1, "case-file__preview"], [3, "blobUrl", "rawBlobUrl", "blobType", "mimeType", "fileName", "fileSize", "loading"], ["type", "button", 1, "case-file__row", 3, "click"], [1, "case-file__row-title"], [1, "case-file__row-meta"], [1, "case-file__fact"], [1, "case-file__actions"], ["type", "button", 3, "click"], ["type", "button", 3, "click", "disabled"]], template: function CaseFileComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "header", 1)(2, "h1");
            i0.ɵɵtext(3, "Case File");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "p");
            i0.ɵɵtext(5, " Search, metadata, preview and actions on one surface \u2014 built only on ");
            i0.ɵɵelementStart(6, "code");
            i0.ɵɵtext(7, "@nuxeo/satori-platform");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(8, " entry points. ");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(9, CaseFileComponent_Conditional_9_Template, 2, 1, "p", 2);
            i0.ɵɵelementStart(10, "lib-widget-grid", 3)(11, "lib-widget-container", 4);
            i0.ɵɵconditionalCreate(12, CaseFileComponent_Conditional_12_Template, 2, 0, "p", 5)(13, CaseFileComponent_Conditional_13_Template, 4, 1, "ul", 6);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "lib-widget-container", 7);
            i0.ɵɵconditionalCreate(15, CaseFileComponent_Conditional_15_Template, 2, 0, "p", 5)(16, CaseFileComponent_Conditional_16_Template, 2, 0, "p", 5)(17, CaseFileComponent_Conditional_17_Template, 3, 0, "dl", 8);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(18, "lib-widget-container", 9);
            i0.ɵɵconditionalCreate(19, CaseFileComponent_Conditional_19_Template, 2, 0, "p", 5)(20, CaseFileComponent_Conditional_20_Template, 8, 2);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(21, "section", 10)(22, "h2");
            i0.ɵɵtext(23, "Preview");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(24, CaseFileComponent_Conditional_24_Template, 2, 0, "p", 5)(25, CaseFileComponent_Conditional_25_Template, 2, 0, "p", 5)(26, CaseFileComponent_Conditional_26_Template, 1, 7, "lib-document-viewer", 11);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(9);
            i0.ɵɵconditional(ctx.error() ? 9 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("columns", 3);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.loading() ? 12 : 13);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(!ctx.selectedId() ? 15 : ctx.detailLoading() ? 16 : 17);
            i0.ɵɵadvance(4);
            i0.ɵɵconditional(!ctx.doc() ? 19 : 20);
            i0.ɵɵadvance(5);
            i0.ɵɵconditional(!ctx.doc() ? 24 : !ctx.hasAttachment() ? 25 : 26);
        } }, dependencies: [WidgetGridComponent, WidgetContainerComponent, DocumentViewerComponent], styles: ["\n\n\n.case-file[_ngcontent-%COMP%] {\n  padding: 2rem;\n  display: flex;\n  flex-direction: column;\n  gap: 1.5rem;\n}\n\n.case-file__head[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  margin: 0 0 0.25rem;\n  font-size: 1.6rem;\n}\n\n.case-file__head[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--shell-muted, #5a5a6e);\n}\n\n.case-file__error[_ngcontent-%COMP%] {\n  margin: 0;\n  padding: 0.75rem 1rem;\n  border-left: 4px solid var(--shell-error-border, #b3261e);\n  background: var(--shell-error-bg, #fdeceb);\n  color: var(--shell-error-fg, #7a1c17);\n}\n\n.case-file__muted[_ngcontent-%COMP%] {\n  color: var(--shell-muted, #6b6b7b);\n  font-size: 0.9rem;\n  margin: 0.5rem 0 0;\n}\n\n.case-file__list[_ngcontent-%COMP%] {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  max-height: 18rem;\n  overflow-y: auto;\n}\n\n.case-file__row[_ngcontent-%COMP%] {\n  width: 100%;\n  display: flex;\n  flex-direction: column;\n  gap: 0.15rem;\n  padding: 0.55rem 0.6rem;\n  border: 0;\n  border-radius: 6px;\n  background: none;\n  text-align: left;\n  cursor: pointer;\n  font: inherit;\n}\n\n.case-file__row[_ngcontent-%COMP%]:hover {\n  background: var(--shell-surface-alt, #eef0f6);\n}\n\n.case-file__row--on[_ngcontent-%COMP%] {\n  background: var(--shell-nav-active, #e3e9fb);\n  box-shadow: inset 0 0 0 1px var(--shell-accent, #2f6feb);\n}\n\n.case-file__row-title[_ngcontent-%COMP%] {\n  font-weight: 600;\n}\n\n.case-file__row-meta[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: var(--shell-muted, #6b6b7b);\n}\n\n.case-file__facts[_ngcontent-%COMP%] {\n  \n\n\n  margin: 0;\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 0.5rem 1rem;\n}\n\n.case-file__fact[_ngcontent-%COMP%]:last-child {\n  \n\n  grid-column: 1 / -1;\n}\n\n.case-file__fact[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: var(--shell-muted, #6b6b7b);\n}\n\n.case-file__fact[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%] {\n  margin: 0.1rem 0 0;\n  word-break: break-word;\n}\n\n.case-file__actions[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\n.case-file__actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  padding: 0.45rem 0.9rem;\n  border: 1px solid var(--shell-accent, #2f6feb);\n  border-radius: 6px;\n  background: var(--shell-accent, #2f6feb);\n  color: var(--shell-accent-fg, #fff);\n  cursor: pointer;\n  font: inherit;\n}\n\n.case-file__actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:disabled {\n  background: var(--shell-border, #c7c7d1);\n  border-color: var(--shell-border, #c7c7d1);\n  cursor: not-allowed;\n}\n\n.case-file__preview[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0 0 0.6rem;\n  font-size: 1.1rem;\n}\n\n.case-file__preview[_ngcontent-%COMP%]   lib-document-viewer[_ngcontent-%COMP%] {\n  display: block;\n  min-height: 26rem;\n  border: 1px solid var(--shell-border, #dcdce4);\n  border-radius: 8px;\n  overflow: hidden;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CaseFileComponent, [{
        type: Component,
        args: [{ selector: 'app-case-file', standalone: true, imports: [WidgetGridComponent, WidgetContainerComponent, DocumentViewerComponent], template: "<div class=\"case-file\">\n  <header class=\"case-file__head\">\n    <h1>Case File</h1>\n    <p>\n      Search, metadata, preview and actions on one surface \u2014 built only on\n      <code>&#64;nuxeo/satori-platform</code> entry points.\n    </p>\n  </header>\n\n  @if (error()) {\n    <p class=\"case-file__error\" role=\"alert\">{{ error() }}</p>\n  }\n\n  <lib-widget-grid [columns]=\"3\">\n    <!-- 1 \u2014 find. SearchResultItem rows: flat, list-shaped, no properties bag. -->\n    <lib-widget-container title=\"Documents\">\n      @if (loading()) {\n        <p class=\"case-file__muted\">Loading\u2026</p>\n      } @else {\n        <ul class=\"case-file__list\">\n          @for (item of items(); track item.id) {\n            <li>\n              <button\n                type=\"button\"\n                class=\"case-file__row\"\n                [class.case-file__row--on]=\"item.id === selectedId()\"\n                (click)=\"select(item)\"\n              >\n                <span class=\"case-file__row-title\">{{ item.title }}</span>\n                <span class=\"case-file__row-meta\">{{ item.type }}</span>\n              </button>\n            </li>\n          }\n          @if (items().length === 0) {\n            <li class=\"case-file__muted\">No documents.</li>\n          }\n        </ul>\n      }\n    </lib-widget-container>\n\n    <!-- 2 \u2014 metadata. Needs the FULL document, which the list rows do not carry. -->\n    <lib-widget-container title=\"Metadata\">\n      @if (!selectedId()) {\n        <p class=\"case-file__muted\">Select a document.</p>\n      } @else if (detailLoading()) {\n        <p class=\"case-file__muted\">Loading metadata\u2026</p>\n      } @else {\n        <dl class=\"case-file__facts\">\n          @for (fact of facts(); track fact.label) {\n            <div class=\"case-file__fact\">\n              <dt>{{ fact.label }}</dt>\n              <dd>{{ fact.value }}</dd>\n            </div>\n          }\n        </dl>\n      }\n    </lib-widget-container>\n\n    <!-- 3 \u2014 actions. Dialogs the platform publishes; the host supplies how bytes are fetched. -->\n    <lib-widget-container title=\"Actions\">\n      @if (!doc()) {\n        <p class=\"case-file__muted\">Select a document.</p>\n      } @else {\n        <div class=\"case-file__actions\">\n          <button type=\"button\" (click)=\"share()\">Share</button>\n          <button type=\"button\" (click)=\"exportDocument()\">Export\u2026</button>\n          <button type=\"button\" [disabled]=\"!hasAttachment()\" (click)=\"download()\">Download</button>\n        </div>\n        @if (!hasAttachment()) {\n          <p class=\"case-file__muted\">\n            This document has no attachment, so there is nothing to download or preview.\n          </p>\n        }\n      }\n    </lib-widget-container>\n  </lib-widget-grid>\n\n  <!-- 4 \u2014 preview. The blob is fetched through the service and wrapped in an object URL that is\n       revoked on replacement and on destroy. Never bind a Nuxeo URL straight to [src]. -->\n  <section class=\"case-file__preview\">\n    <h2>Preview</h2>\n    @if (!doc()) {\n      <p class=\"case-file__muted\">Select a document to preview its content.</p>\n    } @else if (!hasAttachment()) {\n      <p class=\"case-file__muted\">No attachment on this document.</p>\n    } @else {\n      <lib-document-viewer\n        [blobUrl]=\"blobUrl()\"\n        [rawBlobUrl]=\"rawObjectUrl()\"\n        [blobType]=\"objectBlobType()\"\n        [mimeType]=\"mimeType()\"\n        [fileName]=\"fileName()\"\n        [fileSize]=\"fileSize()\"\n        [loading]=\"previewLoading()\"\n      />\n    }\n  </section>\n</div>\n", styles: ["/* Plain CSS on purpose: the template ships no Angular Material theme, so nothing here may depend\n   on one. The dialogs it opens bring their own. */\n.case-file {\n  padding: 2rem;\n  display: flex;\n  flex-direction: column;\n  gap: 1.5rem;\n}\n\n.case-file__head h1 {\n  margin: 0 0 0.25rem;\n  font-size: 1.6rem;\n}\n\n.case-file__head p {\n  margin: 0;\n  color: var(--shell-muted, #5a5a6e);\n}\n\n.case-file__error {\n  margin: 0;\n  padding: 0.75rem 1rem;\n  border-left: 4px solid var(--shell-error-border, #b3261e);\n  background: var(--shell-error-bg, #fdeceb);\n  color: var(--shell-error-fg, #7a1c17);\n}\n\n.case-file__muted {\n  color: var(--shell-muted, #6b6b7b);\n  font-size: 0.9rem;\n  margin: 0.5rem 0 0;\n}\n\n.case-file__list {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  max-height: 18rem;\n  overflow-y: auto;\n}\n\n.case-file__row {\n  width: 100%;\n  display: flex;\n  flex-direction: column;\n  gap: 0.15rem;\n  padding: 0.55rem 0.6rem;\n  border: 0;\n  border-radius: 6px;\n  background: none;\n  text-align: left;\n  cursor: pointer;\n  font: inherit;\n}\n\n.case-file__row:hover {\n  background: var(--shell-surface-alt, #eef0f6);\n}\n\n.case-file__row--on {\n  background: var(--shell-nav-active, #e3e9fb);\n  box-shadow: inset 0 0 0 1px var(--shell-accent, #2f6feb);\n}\n\n.case-file__row-title {\n  font-weight: 600;\n}\n\n.case-file__row-meta {\n  font-size: 0.78rem;\n  color: var(--shell-muted, #6b6b7b);\n}\n\n.case-file__facts {\n  /* Two columns, because nine facts in one column overflow the card and the last row gets clipped\n     mid-glyph \u2014 which reads as a rendering bug rather than as a full card. */\n  margin: 0;\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 0.5rem 1rem;\n}\n\n.case-file__fact:last-child {\n  /* Path is the long one; let it use the full width rather than wrap awkwardly in a half column. */\n  grid-column: 1 / -1;\n}\n\n.case-file__fact dt {\n  font-size: 0.72rem;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: var(--shell-muted, #6b6b7b);\n}\n\n.case-file__fact dd {\n  margin: 0.1rem 0 0;\n  word-break: break-word;\n}\n\n.case-file__actions {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\n.case-file__actions button {\n  padding: 0.45rem 0.9rem;\n  border: 1px solid var(--shell-accent, #2f6feb);\n  border-radius: 6px;\n  background: var(--shell-accent, #2f6feb);\n  color: var(--shell-accent-fg, #fff);\n  cursor: pointer;\n  font: inherit;\n}\n\n.case-file__actions button:disabled {\n  background: var(--shell-border, #c7c7d1);\n  border-color: var(--shell-border, #c7c7d1);\n  cursor: not-allowed;\n}\n\n.case-file__preview h2 {\n  margin: 0 0 0.6rem;\n  font-size: 1.1rem;\n}\n\n.case-file__preview lib-document-viewer {\n  display: block;\n  min-height: 26rem;\n  border: 1px solid var(--shell-border, #dcdce4);\n  border-radius: 8px;\n  overflow: hidden;\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CaseFileComponent, { className: "CaseFileComponent", filePath: "apps/nuxeo-satori-template/src/app/pages/case-file/case-file.ts", lineNumber: 81 }); })();
