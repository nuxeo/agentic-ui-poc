import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
// Shared rather than local: see the note on the helper — one normalisation for three checks.
import { mediaTypeEssence } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/icon";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/tooltip";
function AttachmentPreviewDialogComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 11);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵstyleProp("transform", "scale(" + ctx_r0.zoom() + ")");
    i0.ɵɵproperty("src", ctx_r0.data.blobUrl, i0.ɵɵsanitizeUrl)("alt", ctx_r0.data.name);
} }
function AttachmentPreviewDialogComponent_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "iframe", 6);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("src", ctx_r0.data.blobUrl, i0.ɵɵsanitizeResourceUrl)("title", ctx_r0.data.name);
} }
function AttachmentPreviewDialogComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "video", 7);
    i0.ɵɵelement(1, "source", 12);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("src", ctx_r0.data.rawUrl)("type", ctx_r0.sourceType);
} }
function AttachmentPreviewDialogComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "audio", 8);
    i0.ɵɵelement(1, "source", 12);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("src", ctx_r0.data.rawUrl)("type", ctx_r0.sourceType);
} }
function AttachmentPreviewDialogComponent_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "iframe", 6);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("src", ctx_r0.data.blobUrl, i0.ɵɵsanitizeResourceUrl)("title", ctx_r0.data.name);
} }
function AttachmentPreviewDialogComponent_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 9)(1, "mat-icon", 13);
    i0.ɵɵtext(2, "insert_drive_file");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 14);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 2, "document-detail.attachment-preview-dialog.preview-not-available-for-this-file"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.data.mimeType);
} }
function AttachmentPreviewDialogComponent_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 10)(1, "button", 15);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function AttachmentPreviewDialogComponent_Conditional_15_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.zoomIn()); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "zoom_in");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "button", 15);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵlistener("click", function AttachmentPreviewDialogComponent_Conditional_15_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.zoomReset()); });
    i0.ɵɵelementStart(7, "mat-icon");
    i0.ɵɵtext(8, "crop_free");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "button", 15);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵlistener("click", function AttachmentPreviewDialogComponent_Conditional_15_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.zoomOut()); });
    i0.ɵɵelementStart(11, "mat-icon");
    i0.ɵɵtext(12, "zoom_out");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "button", 15);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵlistener("click", function AttachmentPreviewDialogComponent_Conditional_15_Template_button_click_13_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.rotateLeft()); });
    i0.ɵɵelementStart(15, "mat-icon");
    i0.ɵɵtext(16, "rotate_left");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(17, "button", 15);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵlistener("click", function AttachmentPreviewDialogComponent_Conditional_15_Template_button_click_17_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.rotateRight()); });
    i0.ɵɵelementStart(19, "mat-icon");
    i0.ɵɵtext(20, "rotate_right");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(2, 5, "document-detail.attachment-preview-dialog.zoom-in"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(6, 7, "document-detail.attachment-preview-dialog.fit-to-screen"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(10, 9, "document-detail.attachment-preview-dialog.zoom-out"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(14, 11, "document-detail.attachment-preview-dialog.rotate-left"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(18, 13, "document-detail.attachment-preview-dialog.rotate-right"));
} }
/**
 * The text types rendered in the preview iframe — an allow-list, not a `text/*` prefix test.
 *
 * The prefix test was a live stored-XSS hole. `text/html` satisfies `startsWith('text/')`, and the
 * iframe loads a `blob:` URL, which **inherits the creating page's origin**. So previewing an
 * uploaded `.html` attachment executed its scripts under our origin, with `document.cookie`,
 * `localStorage` and `window.parent` all reachable. Anyone who could attach a file to a document
 * could run script against every user who previewed it.
 *
 * This is the same lesson `navigable-url.ts` records for schemes, one layer up: enumerating what is
 * safe is a filter, and testing a prefix is not. Adding a `text/html` special case would leave
 * `text/xsl`, `application/xhtml+xml` and the next active text type nobody thought of.
 *
 * **XML is not on this list, and that is not an oversight.** `text/xml` and `application/xml` are
 * parsed as markup, so a generic XML document is an execution vector twice over: namespaced content
 * runs (`<svg:svg><svg:script>`), and an `<?xml-stylesheet type="text/xsl" href="…"?>` instruction
 * pulls in XSLT that can emit scripted HTML. Rejecting `image/svg+xml` while admitting `text/xml`
 * closed the front door and left the side one open. Only formats the browser will not parse as
 * markup remain.
 *
 * Consequence: HTML and XML attachments now fall through to "Preview not available". Restoring
 * either safely means a sandboxed iframe (`sandbox` without `allow-same-origin`, so the document
 * gets an opaque origin) or decoding to text and escaping it. Neither is done here — closing the
 * hole and adding a feature are separate changes.
 *
 * **The metadata/served-type mismatch, now closed.** An earlier version of this note recorded the
 * mismatch as an unfixable residual risk: `isText` read the document metadata while the browser
 * parses by the served `Content-Type`, so `text/plain` metadata on an HTML-served blob still reached
 * the iframe. Calling that unanswerable was wrong — the caller holds the `Blob`, so its `type` can
 * simply be passed in. Both the declared type and {@link AttachmentPreviewData.blobType} must now be
 * on this list, which also fails closed when the server sends no `Content-Type` at all (`blob.type`
 * is `''`, which is not on the list, so no sniffing opportunity).
 *
 * A CSP `frame-src`/`sandbox` policy is still the structural control and is still absent — the same
 * gap the ARender iframe records. This check reduces what reaches the iframe; it does not replace a
 * header.
 */
const PREVIEWABLE_TEXT_TYPES = new Set(['text/plain', 'text/csv', 'application/json']);
export class AttachmentPreviewDialogComponent {
    dialogRef = inject((MatDialogRef));
    data = inject(MAT_DIALOG_DATA);
    zoom = signal(1, ...(ngDevMode ? [{ debugName: "zoom" }] : []));
    rotation = 0;
    get isImage() {
        return this.data.mimeType.startsWith('image/');
    }
    /**
     * Both the declared and the served type must be PDF, because this is an iframe branch.
     *
     * A document recorded as `application/pdf` but served as `text/html` would otherwise render as
     * scripted HTML in a same-origin blob iframe. An absent `Content-Type` (`blob.type === ''`) also
     * fails this, which is deliberate: it is the case where the browser would otherwise sniff.
     */
    get isPdf() {
        return (mediaTypeEssence(this.data.mimeType) === 'application/pdf' &&
            mediaTypeEssence(this.data.blobType) === 'application/pdf');
    }
    get isVideo() {
        return this.data.mimeType.startsWith('video/');
    }
    get isAudio() {
        return this.data.mimeType.startsWith('audio/');
    }
    /**
     * The `type` hint for `<source>`: the served type when we have one, metadata otherwise.
     *
     * `type` is a hint the browser uses to decide whether to even attempt a source — per spec it skips a
     * source whose declared type it does not support. So advertising the *document metadata* type while
     * the blob is something else can make it skip a perfectly playable source, which is the same
     * metadata/served disagreement that motivated `blobType`, showing up in the attribute rather than the
     * URL. Fixing `rawUrl` alone left this half.
     *
     * Falls back to `mimeType` when the server sent no `Content-Type`, rather than emitting `type=""` —
     * an empty declared type is not a supported type, so it would make the browser skip the source
     * outright, which is worse than a possibly-wrong hint.
     */
    get sourceType() {
        return this.data.blobType || this.data.mimeType;
    }
    /**
     * See {@link PREVIEWABLE_TEXT_TYPES} — an allow-list, because `text/html` is executable.
     *
     * Both the declared and the served type must be on it. Checking only the declared one left the
     * mismatch open: `text/plain` metadata on an HTML-served blob reached the iframe and parsed.
     */
    get isText() {
        return (PREVIEWABLE_TEXT_TYPES.has(mediaTypeEssence(this.data.mimeType)) &&
            PREVIEWABLE_TEXT_TYPES.has(mediaTypeEssence(this.data.blobType)));
    }
    zoomIn() {
        this.zoom.update((z) => Math.min(z + 0.25, 5));
    }
    zoomOut() {
        this.zoom.update((z) => Math.max(z - 0.25, 0.25));
    }
    zoomReset() {
        this.zoom.set(1);
        this.rotation = 0;
    }
    rotateLeft() {
        this.rotation -= 90;
    }
    rotateRight() {
        this.rotation += 90;
    }
    close() {
        this.dialogRef.close();
    }
    ngOnDestroy() {
        // Only revoke what this dialog owns — `previewMainBlob` shares the document viewer's URL.
        if (this.data.ownsRawUrl)
            URL.revokeObjectURL(this.data.rawUrl);
    }
    static ɵfac = function AttachmentPreviewDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AttachmentPreviewDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AttachmentPreviewDialogComponent, selectors: [["lib-attachment-preview-dialog"]], decls: 16, vars: 6, consts: [[1, "preview-viewer"], [1, "viewer-header"], [1, "viewer-filename"], [1, "viewer-close", 3, "click", "matTooltip"], [1, "viewer-body"], [1, "viewer-img", 3, "src", "alt", "transform"], [1, "viewer-frame", 3, "src", "title"], ["controls", "", 1, "viewer-video"], ["controls", "", 1, "viewer-audio"], [1, "viewer-unsupported"], [1, "viewer-toolbar"], [1, "viewer-img", 3, "src", "alt"], [3, "src", "type"], [1, "unsupported-icon"], [1, "mime-label"], ["mat-icon-button", "", 3, "click", "matTooltip"]], template: function AttachmentPreviewDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "span", 2);
            i0.ɵɵtext(3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "button", 3);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵlistener("click", function AttachmentPreviewDialogComponent_Template_button_click_4_listener() { return ctx.close(); });
            i0.ɵɵelementStart(6, "mat-icon");
            i0.ɵɵtext(7, "close");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(8, "div", 4);
            i0.ɵɵconditionalCreate(9, AttachmentPreviewDialogComponent_Conditional_9_Template, 1, 4, "img", 5)(10, AttachmentPreviewDialogComponent_Conditional_10_Template, 1, 2, "iframe", 6)(11, AttachmentPreviewDialogComponent_Conditional_11_Template, 2, 2, "video", 7)(12, AttachmentPreviewDialogComponent_Conditional_12_Template, 2, 2, "audio", 8)(13, AttachmentPreviewDialogComponent_Conditional_13_Template, 1, 2, "iframe", 6)(14, AttachmentPreviewDialogComponent_Conditional_14_Template, 8, 4, "div", 9);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(15, AttachmentPreviewDialogComponent_Conditional_15_Template, 21, 15, "div", 10);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.data.name);
            i0.ɵɵadvance();
            i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(5, 4, "document-detail.attachment-preview-dialog.close"));
            i0.ɵɵadvance(5);
            i0.ɵɵconditional(ctx.isImage ? 9 : ctx.isPdf ? 10 : ctx.isVideo ? 11 : ctx.isAudio ? 12 : ctx.isText ? 13 : 14);
            i0.ɵɵadvance(6);
            i0.ɵɵconditional(ctx.isImage ? 15 : -1);
        } }, dependencies: [MatDialogModule, MatIconModule, i1.MatIcon, MatButtonModule, i2.MatIconButton, MatTooltipModule, i3.MatTooltip, TranslatePipe], styles: ["[_nghost-%COMP%] {\n        display: block;\n        width: min(90vw, 1200px);\n      }\n\n      .preview-viewer[_ngcontent-%COMP%] {\n        display: flex;\n        flex-direction: column;\n        height: 85vh;\n        background: #f5f5f5;\n      }\n\n      .viewer-header[_ngcontent-%COMP%] {\n        display: flex;\n        align-items: center;\n        justify-content: space-between;\n        padding: 8px 16px;\n        background: #37474f;\n        color: #fff;\n        min-height: 44px;\n      }\n\n      .viewer-filename[_ngcontent-%COMP%] {\n        font-size: 14px;\n        font-weight: 500;\n        overflow: hidden;\n        text-overflow: ellipsis;\n        white-space: nowrap;\n        flex: 1;\n        margin-right: 12px;\n      }\n\n      .viewer-close[_ngcontent-%COMP%] {\n        border: none;\n        background: none;\n        color: #fff;\n        cursor: pointer;\n        padding: 4px;\n        display: flex;\n        align-items: center;\n        border-radius: 50%;\n\n        &:hover {\n          background: rgba(255, 255, 255, 0.15);\n        }\n\n        mat-icon {\n          font-size: 20px;\n          width: 20px;\n          height: 20px;\n        }\n      }\n\n      .viewer-body[_ngcontent-%COMP%] {\n        flex: 1;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        overflow: auto;\n        background: #e8e8e8;\n        padding: 24px;\n      }\n\n      .viewer-img[_ngcontent-%COMP%] {\n        max-width: 100%;\n        max-height: 100%;\n        object-fit: contain;\n        transition: transform 0.2s ease;\n        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);\n      }\n\n      .viewer-frame[_ngcontent-%COMP%] {\n        width: 100%;\n        height: 100%;\n        border: none;\n        background: #fff;\n      }\n\n      .viewer-video[_ngcontent-%COMP%] {\n        max-width: 100%;\n        max-height: 100%;\n      }\n\n      .viewer-audio[_ngcontent-%COMP%] {\n        width: 80%;\n        max-width: 500px;\n      }\n\n      .viewer-unsupported[_ngcontent-%COMP%] {\n        text-align: center;\n        color: #666;\n        padding: 48px 24px;\n      }\n\n      .unsupported-icon[_ngcontent-%COMP%] {\n        font-size: 64px !important;\n        width: 64px !important;\n        height: 64px !important;\n        color: #999;\n        margin-bottom: 16px;\n      }\n\n      .viewer-unsupported[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n        margin: 4px 0;\n        font-size: 14px;\n      }\n\n      .mime-label[_ngcontent-%COMP%] {\n        color: #aaa;\n        font-size: 12px !important;\n      }\n\n      .viewer-toolbar[_ngcontent-%COMP%] {\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        gap: 4px;\n        padding: 8px 0;\n        background: #37474f;\n\n        button {\n          color: #fff;\n\n          &:hover {\n            background: rgba(255, 255, 255, 0.15);\n          }\n        }\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AttachmentPreviewDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-attachment-preview-dialog', standalone: true, imports: [TranslatePipe, MatDialogModule, MatIconModule, MatButtonModule, MatTooltipModule], template: "<div class=\"preview-viewer\">\n  <div class=\"viewer-header\">\n    <span class=\"viewer-filename\">{{ data.name }}</span>\n    <button\n      class=\"viewer-close\"\n      (click)=\"close()\"\n      [matTooltip]=\"'document-detail.attachment-preview-dialog.close' | translate\"\n    >\n      <mat-icon>close</mat-icon>\n    </button>\n  </div>\n\n  <div class=\"viewer-body\">\n    @if (isImage) {\n      <img\n        [src]=\"data.blobUrl\"\n        [alt]=\"data.name\"\n        class=\"viewer-img\"\n        [style.transform]=\"'scale(' + zoom() + ')'\"\n      />\n    } @else if (isPdf) {\n      <!-- `title` is the iframe's accessible name; without it a screen reader announces only \"frame\". -->\n      <iframe [src]=\"data.blobUrl\" [title]=\"data.name\" class=\"viewer-frame\"></iframe>\n    } @else if (isVideo) {\n      <video controls class=\"viewer-video\">\n        <!--\n          data.rawUrl, not data.blobUrl: source[src] is SecurityContext.NONE, so no sanitizer\n          runs, the SafeResourceUrl is never unwrapped, and toString() writes\n          \"SafeValue must use [property]=binding: \u2026\" into src. Video and audio attachment\n          previews were broken exactly that way.\n        -->\n        <source [src]=\"data.rawUrl\" [type]=\"sourceType\" />\n      </video>\n    } @else if (isAudio) {\n      <audio controls class=\"viewer-audio\">\n        <source [src]=\"data.rawUrl\" [type]=\"sourceType\" />\n      </audio>\n    } @else if (isText) {\n      <iframe [src]=\"data.blobUrl\" [title]=\"data.name\" class=\"viewer-frame\"></iframe>\n    } @else {\n      <div class=\"viewer-unsupported\">\n        <mat-icon class=\"unsupported-icon\">insert_drive_file</mat-icon>\n        <p>\n          {{\n            'document-detail.attachment-preview-dialog.preview-not-available-for-this-file'\n              | translate\n          }}\n        </p>\n        <p class=\"mime-label\">{{ data.mimeType }}</p>\n      </div>\n    }\n  </div>\n\n  @if (isImage) {\n    <div class=\"viewer-toolbar\">\n      <button\n        mat-icon-button\n        [matTooltip]=\"'document-detail.attachment-preview-dialog.zoom-in' | translate\"\n        (click)=\"zoomIn()\"\n      >\n        <mat-icon>zoom_in</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        [matTooltip]=\"'document-detail.attachment-preview-dialog.fit-to-screen' | translate\"\n        (click)=\"zoomReset()\"\n      >\n        <mat-icon>crop_free</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        [matTooltip]=\"'document-detail.attachment-preview-dialog.zoom-out' | translate\"\n        (click)=\"zoomOut()\"\n      >\n        <mat-icon>zoom_out</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        [matTooltip]=\"'document-detail.attachment-preview-dialog.rotate-left' | translate\"\n        (click)=\"rotateLeft()\"\n      >\n        <mat-icon>rotate_left</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        [matTooltip]=\"'document-detail.attachment-preview-dialog.rotate-right' | translate\"\n        (click)=\"rotateRight()\"\n      >\n        <mat-icon>rotate_right</mat-icon>\n      </button>\n    </div>\n  }\n</div>\n", styles: ["\n      :host {\n        display: block;\n        width: min(90vw, 1200px);\n      }\n\n      .preview-viewer {\n        display: flex;\n        flex-direction: column;\n        height: 85vh;\n        background: #f5f5f5;\n      }\n\n      .viewer-header {\n        display: flex;\n        align-items: center;\n        justify-content: space-between;\n        padding: 8px 16px;\n        background: #37474f;\n        color: #fff;\n        min-height: 44px;\n      }\n\n      .viewer-filename {\n        font-size: 14px;\n        font-weight: 500;\n        overflow: hidden;\n        text-overflow: ellipsis;\n        white-space: nowrap;\n        flex: 1;\n        margin-right: 12px;\n      }\n\n      .viewer-close {\n        border: none;\n        background: none;\n        color: #fff;\n        cursor: pointer;\n        padding: 4px;\n        display: flex;\n        align-items: center;\n        border-radius: 50%;\n\n        &:hover {\n          background: rgba(255, 255, 255, 0.15);\n        }\n\n        mat-icon {\n          font-size: 20px;\n          width: 20px;\n          height: 20px;\n        }\n      }\n\n      .viewer-body {\n        flex: 1;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        overflow: auto;\n        background: #e8e8e8;\n        padding: 24px;\n      }\n\n      .viewer-img {\n        max-width: 100%;\n        max-height: 100%;\n        object-fit: contain;\n        transition: transform 0.2s ease;\n        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);\n      }\n\n      .viewer-frame {\n        width: 100%;\n        height: 100%;\n        border: none;\n        background: #fff;\n      }\n\n      .viewer-video {\n        max-width: 100%;\n        max-height: 100%;\n      }\n\n      .viewer-audio {\n        width: 80%;\n        max-width: 500px;\n      }\n\n      .viewer-unsupported {\n        text-align: center;\n        color: #666;\n        padding: 48px 24px;\n      }\n\n      .unsupported-icon {\n        font-size: 64px !important;\n        width: 64px !important;\n        height: 64px !important;\n        color: #999;\n        margin-bottom: 16px;\n      }\n\n      .viewer-unsupported p {\n        margin: 4px 0;\n        font-size: 14px;\n      }\n\n      .mime-label {\n        color: #aaa;\n        font-size: 12px !important;\n      }\n\n      .viewer-toolbar {\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        gap: 4px;\n        padding: 8px 0;\n        background: #37474f;\n\n        button {\n          color: #fff;\n\n          &:hover {\n            background: rgba(255, 255, 255, 0.15);\n          }\n        }\n      }\n    "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AttachmentPreviewDialogComponent, { className: "AttachmentPreviewDialogComponent", filePath: "libs/features/document-detail/src/lib/attachment-preview-dialog/attachment-preview-dialog.ts", lineNumber: 221 }); })();
