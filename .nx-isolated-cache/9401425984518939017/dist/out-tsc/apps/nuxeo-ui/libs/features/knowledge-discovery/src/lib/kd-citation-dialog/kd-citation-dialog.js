import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, of, switchMap, map } from 'rxjs';
import { buildIndexedReferences, extractNuxeoDocumentId, findReferenceByIndex, findReferenceByKey, formatReferenceExcerpt, formatReferenceLabel, referenceKey, referencesForObject, } from '@agentic-ui/shared/kd-client';
import { DocumentDetailService, renderTrustedHtml, trustObjectUrl, mediaTypeEssence, } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
import * as i3 from "@angular/material/progress-spinner";
const _c0 = a0 => ({ page: a0 });
function _forTrack0($index, $item) { return this.referenceTrackKey($item); }
function KdCitationDialogComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 6);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.documentPath());
} }
function KdCitationDialogComponent_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 10);
    i0.ɵɵelement(1, "mat-spinner", 13);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 2, "kd.kd-citation-dialog.loading"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 4, "kd.kd-citation-dialog.loading-source-document"));
} }
function KdCitationDialogComponent_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 11)(1, "mat-icon");
    i0.ɵɵtext(2, "error_outline");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.documentError());
} }
function KdCitationDialogComponent_Conditional_18_Case_0_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "iframe", 14);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeResourceUrl)("title", i0.ɵɵpipeBind1(1, 2, "kd.kd-citation-dialog.document-preview"));
} }
function KdCitationDialogComponent_Conditional_18_Case_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, KdCitationDialogComponent_Conditional_18_Case_0_Conditional_0_Template, 2, 4, "iframe", 14);
} if (rf & 2) {
    let tmp_2_0;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional((tmp_2_0 = ctx_r0.previewUrl()) ? 0 : -1, tmp_2_0);
} }
function KdCitationDialogComponent_Conditional_18_Case_1_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 15);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl)("alt", ctx_r0.headerLabel());
} }
function KdCitationDialogComponent_Conditional_18_Case_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, KdCitationDialogComponent_Conditional_18_Case_1_Conditional_0_Template, 1, 2, "img", 15);
} if (rf & 2) {
    let tmp_2_0;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional((tmp_2_0 = ctx_r0.previewUrl()) ? 0 : -1, tmp_2_0);
} }
function KdCitationDialogComponent_Conditional_18_Case_2_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "div", 16);
} if (rf & 2) {
    i0.ɵɵproperty("innerHTML", ctx, i0.ɵɵsanitizeHtml);
} }
function KdCitationDialogComponent_Conditional_18_Case_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, KdCitationDialogComponent_Conditional_18_Case_2_Conditional_0_Template, 1, 1, "div", 16);
} if (rf & 2) {
    let tmp_2_0;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional((tmp_2_0 = ctx_r0.textPreview()) ? 0 : -1, tmp_2_0);
} }
function KdCitationDialogComponent_Conditional_18_Case_3_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 17);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.mimeType());
} }
function KdCitationDialogComponent_Conditional_18_Case_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 10)(1, "mat-icon");
    i0.ɵɵtext(2, "description");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(6, KdCitationDialogComponent_Conditional_18_Case_3_Conditional_6_Template, 2, 1, "span", 17);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 2, "kd.kd-citation-dialog.preview-is-not-available-for-this"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.mimeType() ? 6 : -1);
} }
function KdCitationDialogComponent_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, KdCitationDialogComponent_Conditional_18_Case_0_Template, 1, 1)(1, KdCitationDialogComponent_Conditional_18_Case_1_Template, 1, 1)(2, KdCitationDialogComponent_Conditional_18_Case_2_Template, 1, 1)(3, KdCitationDialogComponent_Conditional_18_Case_3_Template, 7, 4, "div", 10);
} if (rf & 2) {
    let tmp_1_0;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional((tmp_1_0 = ctx_r0.previewMode()) === "pdf" ? 0 : tmp_1_0 === "image" ? 1 : tmp_1_0 === "text" ? 2 : 3);
} }
function KdCitationDialogComponent_Conditional_21_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reference_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("[", reference_r2.index, "]");
} }
function KdCitationDialogComponent_Conditional_21_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reference_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, "common.page-number", i0.ɵɵpureFunction1(4, _c0, reference_r2.pageNumber)));
} }
function KdCitationDialogComponent_Conditional_21_Conditional_9_For_2_Conditional_0_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r4 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("[", item_r4.index, "]");
} }
function KdCitationDialogComponent_Conditional_21_Conditional_9_For_2_Conditional_0_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r4 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, "common.page-number", i0.ɵɵpureFunction1(4, _c0, item_r4.pageNumber)));
} }
function KdCitationDialogComponent_Conditional_21_Conditional_9_For_2_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 25);
    i0.ɵɵlistener("click", function KdCitationDialogComponent_Conditional_21_Conditional_9_For_2_Conditional_0_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const item_r4 = i0.ɵɵnextContext().$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.selectReference(ctx_r0.referenceTrackKey(item_r4))); });
    i0.ɵɵelementStart(1, "header", 19)(2, "span", 20);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 21);
    i0.ɵɵconditionalCreate(5, KdCitationDialogComponent_Conditional_21_Conditional_9_For_2_Conditional_0_Conditional_5_Template, 2, 1, "span");
    i0.ɵɵconditionalCreate(6, KdCitationDialogComponent_Conditional_21_Conditional_9_For_2_Conditional_0_Conditional_6_Template, 3, 6, "span");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "p", 22);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r4 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.referenceLabel(item_r4));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(item_r4.index ? 5 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r4.pageNumber !== undefined ? 6 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.formatExcerpt(item_r4.content), " ");
} }
function KdCitationDialogComponent_Conditional_21_Conditional_9_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, KdCitationDialogComponent_Conditional_21_Conditional_9_For_2_Conditional_0_Template, 9, 4, "button", 24);
} if (rf & 2) {
    const item_r4 = ctx.$implicit;
    const reference_r2 = i0.ɵɵnextContext(2);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r0.referenceTrackKey(item_r4) !== ctx_r0.referenceTrackKey(reference_r2) ? 0 : -1);
} }
function KdCitationDialogComponent_Conditional_21_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 23);
    i0.ɵɵrepeaterCreate(1, KdCitationDialogComponent_Conditional_21_Conditional_9_For_2_Template, 1, 1, null, null, _forTrack0, true);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.documentReferences());
} }
function KdCitationDialogComponent_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 18)(1, "header", 19)(2, "span", 20);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 21);
    i0.ɵɵconditionalCreate(5, KdCitationDialogComponent_Conditional_21_Conditional_5_Template, 2, 1, "span");
    i0.ɵɵconditionalCreate(6, KdCitationDialogComponent_Conditional_21_Conditional_6_Template, 3, 6, "span");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "p", 22);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(9, KdCitationDialogComponent_Conditional_21_Conditional_9_Template, 3, 0, "div", 23);
} if (rf & 2) {
    const reference_r2 = ctx;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.referenceLabel(reference_r2));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(reference_r2.index ? 5 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(reference_r2.pageNumber !== undefined ? 6 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.formatExcerpt(reference_r2.content), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.documentReferences().length > 1 ? 9 : -1);
} }
export class KdCitationDialogComponent {
    dialogRef = inject((MatDialogRef));
    translate = inject(TranslateService);
    /** The active language as a signal, so a `computed` that calls `instant()` recomputes on a switch. */
    currentLang = toSignal(this.translate.onLangChange.pipe(map((event) => event.lang)), { initialValue: this.translate.getCurrentLang() });
    data = inject(MAT_DIALOG_DATA);
    detailService = inject(DocumentDetailService);
    sanitizer = inject(DomSanitizer);
    destroyRef = inject(DestroyRef);
    blobUrls = [];
    references = buildIndexedReferences(this.data.answer);
    activeReferenceKey = signal(this.resolveInitialReferenceKey(this.data.initialIndex), ...(ngDevMode ? [{ debugName: "activeReferenceKey" }] : []));
    loadingDocument = signal(true, ...(ngDevMode ? [{ debugName: "loadingDocument" }] : []));
    documentError = signal(null, ...(ngDevMode ? [{ debugName: "documentError" }] : []));
    documentTitle = signal('', ...(ngDevMode ? [{ debugName: "documentTitle" }] : []));
    documentPath = signal('', ...(ngDevMode ? [{ debugName: "documentPath" }] : []));
    previewMode = signal('unsupported', ...(ngDevMode ? [{ debugName: "previewMode" }] : []));
    previewUrl = signal(null, ...(ngDevMode ? [{ debugName: "previewUrl" }] : []));
    textPreview = signal(null, ...(ngDevMode ? [{ debugName: "textPreview" }] : []));
    mimeType = signal('', ...(ngDevMode ? [{ debugName: "mimeType" }] : []));
    activeReference = computed(() => findReferenceByKey(this.references, this.activeReferenceKey()) ?? null, ...(ngDevMode ? [{ debugName: "activeReference" }] : []));
    documentReferences = computed(() => {
        const reference = this.activeReference();
        return reference ? referencesForObject(this.references, reference.objectId) : [];
    }, ...(ngDevMode ? [{ debugName: "documentReferences" }] : []));
    headerLabel = computed(() => {
        this.currentLang();
        const reference = this.activeReference();
        if (!reference) {
            return this.translate.instant('kd.kd-citation-dialog.reference-document');
        }
        return reference.title || this.documentTitle() || reference.objectId;
    }, ...(ngDevMode ? [{ debugName: "headerLabel" }] : []));
    constructor() {
        this.loadDocumentForActiveReference();
    }
    selectReference(key) {
        if (key === this.activeReferenceKey()) {
            return;
        }
        const previous = this.activeReference();
        const next = findReferenceByKey(this.references, key);
        if (!next) {
            return;
        }
        this.activeReferenceKey.set(key);
        const previousDocumentId = previous ? extractNuxeoDocumentId(previous.objectId) : null;
        const nextDocumentId = extractNuxeoDocumentId(next.objectId);
        if (previousDocumentId &&
            nextDocumentId &&
            previousDocumentId === nextDocumentId &&
            this.previewMode() === 'pdf' &&
            !this.loadingDocument()) {
            this.updatePdfPage(next.pageNumber);
            return;
        }
        this.loadDocumentForActiveReference();
    }
    referenceLabel(reference) {
        return formatReferenceLabel(reference);
    }
    referenceTrackKey(reference) {
        return referenceKey(reference);
    }
    formatExcerpt(content) {
        return (formatReferenceExcerpt(content) ||
            this.translate.instant('kd.kd-citation-dialog.no-excerpt-returned'));
    }
    close() {
        this.dialogRef.close();
    }
    ngOnDestroy() {
        for (const url of this.blobUrls) {
            URL.revokeObjectURL(url);
        }
    }
    resolveInitialReferenceKey(initialIndex) {
        const match = findReferenceByIndex(this.references, initialIndex);
        if (match) {
            return referenceKey(match);
        }
        const first = this.references[0];
        return first ? referenceKey(first) : '';
    }
    loadDocumentForActiveReference() {
        const reference = this.activeReference();
        if (!reference) {
            this.loadingDocument.set(false);
            this.documentError.set(this.translate.instant('kd.message.no-reference-is-available-for-this-citation'));
            return;
        }
        const documentId = extractNuxeoDocumentId(reference.objectId);
        if (!documentId) {
            this.loadingDocument.set(false);
            this.documentError.set(this.translate.instant('kd.message.this-citation-does-not-map-to-a'));
            return;
        }
        this.loadingDocument.set(true);
        this.documentError.set(null);
        this.clearPreview();
        this.detailService
            .getFullDocument(documentId)
            .pipe(takeUntilDestroyed(this.destroyRef), switchMap((document) => this.loadPreview(document, reference)), catchError(() => {
            this.loadingDocument.set(false);
            this.documentError.set(this.translate.instant('kd.message.failed-to-load-the-source-document-from'));
            return of(null);
        }))
            .subscribe();
    }
    loadPreview(document, reference) {
        this.documentTitle.set(this.getDocumentDisplayTitle(document));
        this.documentPath.set(document.path ?? '');
        const fileContent = document.properties?.['file:content'];
        const mime = fileContent?.['mime-type'] ?? '';
        this.mimeType.set(mime);
        if (mime.startsWith('text/') || mime === 'application/json' || mime === 'application/xml') {
            return this.detailService.fetchBlob(document.uid).pipe(switchMap(async (blob) => {
                const text = await blob.text();
                this.textPreview.set(this.highlightExcerpt(text, reference.content));
                this.previewMode.set('text');
                this.loadingDocument.set(false);
            }));
        }
        if (mime.startsWith('image/')) {
            return this.detailService.fetchBlob(document.uid).pipe(switchMap((blob) => {
                this.setBlobPreview(blob, 'image');
                return of(null);
            }));
        }
        if (mime === 'application/pdf') {
            return this.detailService.fetchBlob(document.uid).pipe(switchMap((blob) => {
                this.setBlobPreview(blob, 'pdf', reference.pageNumber);
                return of(null);
            }));
        }
        const renditions = (document.contextParameters?.['renditions'] ?? []);
        if (renditions.some((rendition) => rendition.name === 'pdf')) {
            return this.detailService.fetchPdfRendition(document.uid).pipe(switchMap((blob) => {
                this.setBlobPreview(blob, 'pdf', reference.pageNumber);
                return of(null);
            }), catchError(() => this.detailService.fetchBlob(document.uid).pipe(switchMap((blob) => {
                this.setBlobPreview(blob, mime.startsWith('image/') ? 'image' : 'unsupported');
                return of(null);
            }))));
        }
        return this.detailService.fetchBlob(document.uid).pipe(switchMap((blob) => {
            if (mime.startsWith('image/')) {
                this.setBlobPreview(blob, 'image');
            }
            else {
                this.previewMode.set('unsupported');
                this.loadingDocument.set(false);
            }
            return of(null);
        }));
    }
    setBlobPreview(blob, mode, pageNumber) {
        // The served-type gate, placed here rather than at the two `'pdf'` call sites so a future third
        // caller cannot miss it.
        //
        // `'pdf'` was chosen from document metadata — the recorded mime type, or the presence of a `pdf`
        // rendition — and neither is what the browser consults. It parses a `blob:` document by its
        // `Content-Type`, and a blob URL inherits this origin, so a document recorded as PDF but served as
        // `text/html` executed as script here. Same defect already closed in the attachment preview dialog
        // and `DocumentViewerComponent`; this was the third instance, in a component neither review pass
        // had reached.
        //
        // An absent `Content-Type` also fails this, deliberately: that is the case where the browser would
        // otherwise sniff.
        const effectiveMode = mode === 'pdf' && mediaTypeEssence(blob.type) !== 'application/pdf' ? 'unsupported' : mode;
        const rawUrl = URL.createObjectURL(blob);
        this.blobUrls.push(rawUrl);
        this.previewUrl.set(trustObjectUrl(this.sanitizer, this.buildPreviewUrl(rawUrl, pageNumber)));
        this.previewMode.set(effectiveMode);
        this.loadingDocument.set(false);
    }
    updatePdfPage(pageNumber) {
        const currentUrl = this.blobUrls[this.blobUrls.length - 1];
        if (!currentUrl) {
            return;
        }
        this.previewUrl.set(trustObjectUrl(this.sanitizer, this.buildPreviewUrl(currentUrl, pageNumber)));
    }
    buildPreviewUrl(rawUrl, pageNumber) {
        if (pageNumber !== undefined && pageNumber > 0) {
            return `${rawUrl}#page=${pageNumber}`;
        }
        return rawUrl;
    }
    clearPreview() {
        this.previewUrl.set(null);
        this.textPreview.set(null);
        this.previewMode.set('unsupported');
    }
    /**
     * `<mark>` around the cited excerpt, everything else escaped.
     *
     * Routed through `renderTrustedHtml` rather than bypassing directly, so the only markup that can
     * reach `innerHTML` is what DOMPurify's allow-list permits — `mark` and its `class`. The local
     * `escapeHtml` still runs first and is still what makes the concatenation safe; DOMPurify is a
     * second, independent check rather than a replacement for it. That matters because the safety of
     * this member previously rested entirely on `escapeHtml` covering every interpolated segment,
     * which nothing enforced.
     */
    highlightExcerpt(text, excerpt) {
        const allowMarkOnly = { ALLOWED_TAGS: ['mark'], ALLOWED_ATTR: ['class'] };
        if (!excerpt?.trim()) {
            return renderTrustedHtml(this.sanitizer, this.escapeHtml(text), allowMarkOnly);
        }
        const matchIndex = text.toLowerCase().indexOf(excerpt.toLowerCase());
        if (matchIndex === -1) {
            return renderTrustedHtml(this.sanitizer, this.escapeHtml(text), allowMarkOnly);
        }
        const before = this.escapeHtml(text.slice(0, matchIndex));
        const highlighted = this.escapeHtml(text.slice(matchIndex, matchIndex + excerpt.length));
        const after = this.escapeHtml(text.slice(matchIndex + excerpt.length));
        return renderTrustedHtml(this.sanitizer, `${before}<mark class="kd-citation-dialog__highlight">${highlighted}</mark>${after}`, allowMarkOnly);
    }
    escapeHtml(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    getDocumentDisplayTitle(document) {
        const properties = document.properties ?? {};
        const fileContent = properties['file:content'];
        const fileName = typeof fileContent?.name === 'string' ? fileContent.name : undefined;
        const dcTitle = properties['dc:title'];
        return (fileName ??
            document.title ??
            (typeof dcTitle === 'string' ? dcTitle : undefined) ??
            document.uid ??
            '');
    }
    static ɵfac = function KdCitationDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || KdCitationDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: KdCitationDialogComponent, selectors: [["lib-kd-citation-dialog"]], decls: 22, vars: 13, consts: [[1, "kd-citation-dialog"], [1, "kd-citation-dialog__header"], [1, "kd-citation-dialog__header-copy"], ["aria-hidden", "true", 1, "kd-citation-dialog__brand"], [1, "kd-citation-dialog__header-text"], [1, "kd-citation-dialog__title"], [1, "kd-citation-dialog__path"], ["type", "button", "mat-icon-button", "", 3, "click"], [1, "kd-citation-dialog__body"], [1, "kd-citation-dialog__viewer"], [1, "kd-citation-dialog__state"], [1, "kd-citation-dialog__state", "kd-citation-dialog__state--error"], [1, "kd-citation-dialog__references"], ["diameter", "32"], [1, "kd-citation-dialog__frame", 3, "src", "title"], [1, "kd-citation-dialog__image", 3, "src", "alt"], [1, "kd-citation-dialog__text", 3, "innerHTML"], [1, "kd-citation-dialog__mime"], [1, "kd-citation-dialog__reference", "kd-citation-dialog__reference--active"], [1, "kd-citation-dialog__reference-header"], [1, "kd-citation-dialog__reference-id"], [1, "kd-citation-dialog__reference-meta"], [1, "kd-citation-dialog__reference-content"], [1, "kd-citation-dialog__reference-list"], ["type", "button", 1, "kd-citation-dialog__reference", "kd-citation-dialog__reference--link"], ["type", "button", 1, "kd-citation-dialog__reference", "kd-citation-dialog__reference--link", 3, "click"]], template: function KdCitationDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "header", 1)(2, "div", 2)(3, "mat-icon", 3);
            i0.ɵɵtext(4, "auto_awesome");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "div", 4)(6, "p", 5);
            i0.ɵɵtext(7);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(8, KdCitationDialogComponent_Conditional_8_Template, 2, 1, "p", 6);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "button", 7);
            i0.ɵɵpipe(10, "translate");
            i0.ɵɵlistener("click", function KdCitationDialogComponent_Template_button_click_9_listener() { return ctx.close(); });
            i0.ɵɵelementStart(11, "mat-icon");
            i0.ɵɵtext(12, "close");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(13, "div", 8)(14, "section", 9);
            i0.ɵɵpipe(15, "translate");
            i0.ɵɵconditionalCreate(16, KdCitationDialogComponent_Conditional_16_Template, 6, 6, "div", 10)(17, KdCitationDialogComponent_Conditional_17_Template, 5, 1, "div", 11)(18, KdCitationDialogComponent_Conditional_18_Template, 4, 1);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(19, "aside", 12);
            i0.ɵɵpipe(20, "translate");
            i0.ɵɵconditionalCreate(21, KdCitationDialogComponent_Conditional_21_Template, 10, 5);
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            let tmp_6_0;
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(ctx.headerLabel());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.documentPath() ? 8 : -1);
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(10, 7, "kd.kd-citation-dialog.close-citation-viewer"));
            i0.ɵɵadvance(5);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(15, 9, "kd.kd-citation-dialog.source-document-preview"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.loadingDocument() ? 16 : ctx.documentError() ? 17 : 18);
            i0.ɵɵadvance(3);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(20, 11, "kd.kd-citation-dialog.citation-references"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional((tmp_6_0 = ctx.activeReference()) ? 21 : -1, tmp_6_0);
        } }, dependencies: [MatButtonModule, i1.MatIconButton, MatDialogModule,
            MatIconModule, i2.MatIcon, MatProgressSpinnerModule, i3.MatProgressSpinner, MatTooltipModule,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  width: min(96vw, 1180px);\n}\n\n.kd-citation-dialog[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  max-height: 88vh;\n  background: var(--mat-sys-surface, #fff);\n  border-radius: 12px;\n  overflow: hidden;\n}\n\n.kd-citation-dialog__header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  padding: 12px 16px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #e8eaef);\n  background: var(--mat-sys-surface-container-lowest, #fafbfd);\n}\n\n.kd-citation-dialog__header-copy[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  min-width: 0;\n}\n\n.kd-citation-dialog__brand[_ngcontent-%COMP%] {\n  color: var(--mat-sys-primary, #005cbb);\n}\n\n.kd-citation-dialog__header-text[_ngcontent-%COMP%] {\n  min-width: 0;\n}\n\n.kd-citation-dialog__title[_ngcontent-%COMP%], \n.kd-citation-dialog__path[_ngcontent-%COMP%] {\n  margin: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.kd-citation-dialog__title[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.kd-citation-dialog__path[_ngcontent-%COMP%] {\n  margin-top: 2px;\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n}\n\n.kd-citation-dialog__body[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.85fr);\n  min-height: 520px;\n  max-height: calc(88vh - 64px);\n}\n\n.kd-citation-dialog__viewer[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: stretch;\n  justify-content: center;\n  background: var(--mat-sys-surface-container, #eef1f6);\n  overflow: auto;\n}\n\n.kd-citation-dialog__frame[_ngcontent-%COMP%], \n.kd-citation-dialog__image[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  min-height: 520px;\n  border: 0;\n  object-fit: contain;\n  background: var(--mat-sys-surface, #fff);\n}\n\n.kd-citation-dialog__text[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 24px;\n  white-space: pre-wrap;\n  line-height: 1.55;\n  font-size: 13px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  background: var(--mat-sys-surface, #fff);\n}\n\n.kd-citation-dialog__highlight[_ngcontent-%COMP%] {\n  background: var(--mat-sys-tertiary-fixed-dim, #fff59d);\n  padding: 0 2px;\n}\n\n.kd-citation-dialog__state[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 10px;\n  width: 100%;\n  padding: 32px;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n\n  mat-icon {\n    font-size: 40px;\n    width: 40px;\n    height: 40px;\n  }\n\n  p {\n    margin: 0;\n    font-size: 13px;\n  }\n}\n\n.kd-citation-dialog__state--error[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  color: var(--mat-sys-error, #ba1a1a);\n}\n\n.kd-citation-dialog__mime[_ngcontent-%COMP%] {\n  font-size: 11px;\n  color: var(--mat-sys-outline, #74777f);\n}\n\n.kd-citation-dialog__references[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  padding: 14px;\n  overflow: auto;\n  background: var(--mat-sys-surface-container-low, #f8fafc);\n  border-left: 1px solid var(--mat-sys-outline-variant, #e8eaef);\n}\n\n.kd-citation-dialog__reference[_ngcontent-%COMP%] {\n  border: 1px solid var(--mat-sys-tertiary, #f0d27a);\n  border-radius: 8px;\n  padding: 12px;\n  background: var(--mat-sys-tertiary-container, #fff9e6);\n}\n\n.kd-citation-dialog__reference--link[_ngcontent-%COMP%] {\n  width: 100%;\n  text-align: left;\n  cursor: pointer;\n  font: inherit;\n  color: inherit;\n  transition: background-color 0.15s ease;\n\n  &:hover {\n    background: var(--mat-sys-tertiary-fixed-dim, #fff4cc);\n  }\n}\n\n.kd-citation-dialog__reference-header[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 4px;\n  margin-bottom: 8px;\n  font-size: 11px;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n}\n\n.kd-citation-dialog__reference-id[_ngcontent-%COMP%] {\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  word-break: break-all;\n}\n\n.kd-citation-dialog__reference-meta[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  font-weight: 600;\n}\n\n.kd-citation-dialog__reference-content[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 12.5px;\n  line-height: 1.55;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  display: -webkit-box;\n  -webkit-line-clamp: 8;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}\n\n.kd-citation-dialog__reference-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n@media (max-width: 960px) {\n  .kd-citation-dialog__body[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n    max-height: none;\n  }\n\n  .kd-citation-dialog__references[_ngcontent-%COMP%] {\n    border-left: none;\n    border-top: 1px solid var(--mat-sys-outline-variant, #e8eaef);\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(KdCitationDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-kd-citation-dialog', standalone: true, imports: [
                    TranslatePipe,
                    MatButtonModule,
                    MatDialogModule,
                    MatIconModule,
                    MatProgressSpinnerModule,
                    MatTooltipModule,
                ], template: "<div class=\"kd-citation-dialog\">\n  <header class=\"kd-citation-dialog__header\">\n    <div class=\"kd-citation-dialog__header-copy\">\n      <mat-icon class=\"kd-citation-dialog__brand\" aria-hidden=\"true\">auto_awesome</mat-icon>\n      <div class=\"kd-citation-dialog__header-text\">\n        <p class=\"kd-citation-dialog__title\">{{ headerLabel() }}</p>\n        @if (documentPath()) {\n          <p class=\"kd-citation-dialog__path\">{{ documentPath() }}</p>\n        }\n      </div>\n    </div>\n    <button\n      type=\"button\"\n      mat-icon-button\n      (click)=\"close()\"\n      [attr.aria-label]=\"'kd.kd-citation-dialog.close-citation-viewer' | translate\"\n    >\n      <mat-icon>close</mat-icon>\n    </button>\n  </header>\n\n  <div class=\"kd-citation-dialog__body\">\n    <section\n      class=\"kd-citation-dialog__viewer\"\n      [attr.aria-label]=\"'kd.kd-citation-dialog.source-document-preview' | translate\"\n    >\n      @if (loadingDocument()) {\n        <div class=\"kd-citation-dialog__state\">\n          <mat-spinner\n            diameter=\"32\"\n            [attr.aria-label]=\"'kd.kd-citation-dialog.loading' | translate\"\n          />\n          <p>{{ 'kd.kd-citation-dialog.loading-source-document' | translate }}</p>\n        </div>\n      } @else if (documentError()) {\n        <div class=\"kd-citation-dialog__state kd-citation-dialog__state--error\">\n          <mat-icon>error_outline</mat-icon>\n          <p>{{ documentError() }}</p>\n        </div>\n      } @else {\n        @switch (previewMode()) {\n          @case ('pdf') {\n            @if (previewUrl(); as url) {\n              <iframe\n                [src]=\"url\"\n                class=\"kd-citation-dialog__frame\"\n                [title]=\"'kd.kd-citation-dialog.document-preview' | translate\"\n              ></iframe>\n            }\n          }\n          @case ('image') {\n            @if (previewUrl(); as url) {\n              <img [src]=\"url\" [alt]=\"headerLabel()\" class=\"kd-citation-dialog__image\" />\n            }\n          }\n          @case ('text') {\n            @if (textPreview(); as html) {\n              <div class=\"kd-citation-dialog__text\" [innerHTML]=\"html\"></div>\n            }\n          }\n          @default {\n            <div class=\"kd-citation-dialog__state\">\n              <mat-icon>description</mat-icon>\n              <p>{{ 'kd.kd-citation-dialog.preview-is-not-available-for-this' | translate }}</p>\n              @if (mimeType()) {\n                <span class=\"kd-citation-dialog__mime\">{{ mimeType() }}</span>\n              }\n            </div>\n          }\n        }\n      }\n    </section>\n\n    <aside\n      class=\"kd-citation-dialog__references\"\n      [attr.aria-label]=\"'kd.kd-citation-dialog.citation-references' | translate\"\n    >\n      @if (activeReference(); as reference) {\n        <article class=\"kd-citation-dialog__reference kd-citation-dialog__reference--active\">\n          <header class=\"kd-citation-dialog__reference-header\">\n            <span class=\"kd-citation-dialog__reference-id\">{{ referenceLabel(reference) }}</span>\n            <span class=\"kd-citation-dialog__reference-meta\">\n              @if (reference.index) {\n                <span>[{{ reference.index }}]</span>\n              }\n              @if (reference.pageNumber !== undefined) {\n                <span>{{ 'common.page-number' | translate: { page: reference.pageNumber } }}</span>\n              }\n            </span>\n          </header>\n          <p class=\"kd-citation-dialog__reference-content\">\n            {{ formatExcerpt(reference.content) }}\n          </p>\n        </article>\n\n        @if (documentReferences().length > 1) {\n          <div class=\"kd-citation-dialog__reference-list\">\n            @for (item of documentReferences(); track referenceTrackKey(item)) {\n              @if (referenceTrackKey(item) !== referenceTrackKey(reference)) {\n                <button\n                  type=\"button\"\n                  class=\"kd-citation-dialog__reference kd-citation-dialog__reference--link\"\n                  (click)=\"selectReference(referenceTrackKey(item))\"\n                >\n                  <header class=\"kd-citation-dialog__reference-header\">\n                    <span class=\"kd-citation-dialog__reference-id\">{{ referenceLabel(item) }}</span>\n                    <span class=\"kd-citation-dialog__reference-meta\">\n                      @if (item.index) {\n                        <span>[{{ item.index }}]</span>\n                      }\n                      @if (item.pageNumber !== undefined) {\n                        <span>{{\n                          'common.page-number' | translate: { page: item.pageNumber }\n                        }}</span>\n                      }\n                    </span>\n                  </header>\n                  <p class=\"kd-citation-dialog__reference-content\">\n                    {{ formatExcerpt(item.content) }}\n                  </p>\n                </button>\n              }\n            }\n          </div>\n        }\n      }\n    </aside>\n  </div>\n</div>\n", styles: [":host {\n  display: block;\n  width: min(96vw, 1180px);\n}\n\n.kd-citation-dialog {\n  display: flex;\n  flex-direction: column;\n  max-height: 88vh;\n  background: var(--mat-sys-surface, #fff);\n  border-radius: 12px;\n  overflow: hidden;\n}\n\n.kd-citation-dialog__header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  padding: 12px 16px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #e8eaef);\n  background: var(--mat-sys-surface-container-lowest, #fafbfd);\n}\n\n.kd-citation-dialog__header-copy {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  min-width: 0;\n}\n\n.kd-citation-dialog__brand {\n  color: var(--mat-sys-primary, #005cbb);\n}\n\n.kd-citation-dialog__header-text {\n  min-width: 0;\n}\n\n.kd-citation-dialog__title,\n.kd-citation-dialog__path {\n  margin: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.kd-citation-dialog__title {\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.kd-citation-dialog__path {\n  margin-top: 2px;\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n}\n\n.kd-citation-dialog__body {\n  display: grid;\n  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.85fr);\n  min-height: 520px;\n  max-height: calc(88vh - 64px);\n}\n\n.kd-citation-dialog__viewer {\n  display: flex;\n  align-items: stretch;\n  justify-content: center;\n  background: var(--mat-sys-surface-container, #eef1f6);\n  overflow: auto;\n}\n\n.kd-citation-dialog__frame,\n.kd-citation-dialog__image {\n  width: 100%;\n  height: 100%;\n  min-height: 520px;\n  border: 0;\n  object-fit: contain;\n  background: var(--mat-sys-surface, #fff);\n}\n\n.kd-citation-dialog__text {\n  width: 100%;\n  padding: 24px;\n  white-space: pre-wrap;\n  line-height: 1.55;\n  font-size: 13px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  background: var(--mat-sys-surface, #fff);\n}\n\n.kd-citation-dialog__highlight {\n  background: var(--mat-sys-tertiary-fixed-dim, #fff59d);\n  padding: 0 2px;\n}\n\n.kd-citation-dialog__state {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 10px;\n  width: 100%;\n  padding: 32px;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n\n  mat-icon {\n    font-size: 40px;\n    width: 40px;\n    height: 40px;\n  }\n\n  p {\n    margin: 0;\n    font-size: 13px;\n  }\n}\n\n.kd-citation-dialog__state--error mat-icon {\n  color: var(--mat-sys-error, #ba1a1a);\n}\n\n.kd-citation-dialog__mime {\n  font-size: 11px;\n  color: var(--mat-sys-outline, #74777f);\n}\n\n.kd-citation-dialog__references {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  padding: 14px;\n  overflow: auto;\n  background: var(--mat-sys-surface-container-low, #f8fafc);\n  border-left: 1px solid var(--mat-sys-outline-variant, #e8eaef);\n}\n\n.kd-citation-dialog__reference {\n  border: 1px solid var(--mat-sys-tertiary, #f0d27a);\n  border-radius: 8px;\n  padding: 12px;\n  background: var(--mat-sys-tertiary-container, #fff9e6);\n}\n\n.kd-citation-dialog__reference--link {\n  width: 100%;\n  text-align: left;\n  cursor: pointer;\n  font: inherit;\n  color: inherit;\n  transition: background-color 0.15s ease;\n\n  &:hover {\n    background: var(--mat-sys-tertiary-fixed-dim, #fff4cc);\n  }\n}\n\n.kd-citation-dialog__reference-header {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 4px;\n  margin-bottom: 8px;\n  font-size: 11px;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n}\n\n.kd-citation-dialog__reference-id {\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  word-break: break-all;\n}\n\n.kd-citation-dialog__reference-meta {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  font-weight: 600;\n}\n\n.kd-citation-dialog__reference-content {\n  margin: 0;\n  font-size: 12.5px;\n  line-height: 1.55;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  display: -webkit-box;\n  -webkit-line-clamp: 8;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}\n\n.kd-citation-dialog__reference-list {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n@media (max-width: 960px) {\n  .kd-citation-dialog__body {\n    grid-template-columns: 1fr;\n    max-height: none;\n  }\n\n  .kd-citation-dialog__references {\n    border-left: none;\n    border-top: 1px solid var(--mat-sys-outline-variant, #e8eaef);\n  }\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(KdCitationDialogComponent, { className: "KdCitationDialogComponent", filePath: "libs/features/knowledge-discovery/src/lib/kd-citation-dialog/kd-citation-dialog.ts", lineNumber: 53 }); })();
