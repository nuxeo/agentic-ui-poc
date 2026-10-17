import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal, } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { DocumentDetailService } from '@nuxeo/satori-platform/nuxeo-client';
import { NxsThumbnailCache } from './thumbnail-cache';
import * as i0 from "@angular/core";
const _c0 = ["*"];
function NxsThumbnailComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "img", 1);
    i0.ɵɵdomListener("error", function NxsThumbnailComponent_Conditional_0_Template_img_error_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.broken()); });
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵdomProperty("src", ctx, i0.ɵɵsanitizeUrl)("alt", ctx_r1.alt());
} }
function NxsThumbnailComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵprojection(0);
} }
/**
 * A document's thumbnail rendition, fetched through the authenticated client and shown from a blob
 * URL that no caller creates or revokes.
 *
 * Under a page that lists `provideNxsThumbnailCache()`, the page's `NxsThumbnailCache` owns the URL:
 * thumbnails of one document share it, a view switch reuses it, requests are bounded, and it is
 * revoked once nothing shows it and with the page. Without one, this component owns it and revokes
 * it when the document changes and when it is destroyed.
 *
 * Until the image arrives — and when there is none, the request fails or the bytes do not decode —
 * the projected content shows instead, usually the document-type icon. While it shows, the host
 * has no box of its own (`display: contents`), so the fallback lays out exactly as it would without
 * this wrapper. Size the thumbnail with a class on the host; the image fills it and takes the host's
 * `object-fit` and `border-radius`. Do not set `display` on the host.
 *
 * Decorative by default, like Web UI's `nuxeo-document-thumbnail`: a blank `alt` hides it from
 * assistive technology, because the title beside it already names the document.
 */
export class NxsThumbnailComponent {
    /** The document whose `thumbnail` rendition to show. */
    documentId = input.required(...(ngDevMode ? [{ debugName: "documentId" }] : []));
    /** The image's text alternative, already translated. Blank marks it decorative. */
    alt = input('', ...(ngDevMode ? [{ debugName: "alt" }] : []));
    url = signal(null, ...(ngDevMode ? [{ debugName: "url" }] : []));
    documents = inject(DocumentDetailService);
    cache = inject(NxsThumbnailCache, { optional: true });
    /** Whether `url` is this component's to revoke — it is not when a page cache lent it. */
    owned = false;
    constructor() {
        toObservable(this.documentId)
            .pipe(
        // Cleared before the next request rather than when it answers, so a changed document never
        // shows the previous one's image, even for the length of a request.
        tap(() => this.clear()), switchMap((id) => this.load(id)), takeUntilDestroyed())
            .subscribe((url) => this.url.set(url));
        inject(DestroyRef).onDestroy(() => this.clear());
    }
    load(documentId) {
        if (!documentId)
            return of(null);
        return this.cache ? this.cache.lend(documentId) : this.own(documentId);
    }
    /** The bytes arrived but are not an image the browser can draw. */
    broken() {
        const url = this.url();
        if (url && !this.owned)
            this.cache?.discard(this.documentId(), url);
        this.clear();
    }
    own(documentId) {
        return this.documents.fetchThumbnail(documentId).pipe(catchError(() => of(null)), map((blob) => {
            if (!blob || blob.size === 0)
                return null;
            this.owned = true;
            return URL.createObjectURL(blob);
        }));
    }
    clear() {
        const url = this.url();
        if (url && this.owned)
            URL.revokeObjectURL(url);
        this.owned = false;
        this.url.set(null);
    }
    static ɵfac = function NxsThumbnailComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsThumbnailComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsThumbnailComponent, selectors: [["nxs-thumbnail"]], hostAttrs: [1, "nxs-thumbnail"], hostVars: 2, hostBindings: function NxsThumbnailComponent_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵclassProp("nxs-thumbnail--empty", ctx.url() === null);
        } }, inputs: { documentId: [1, "documentId"], alt: [1, "alt"] }, ngContentSelectors: _c0, decls: 2, vars: 1, consts: [[1, "nxs-thumbnail__image", 3, "src", "alt"], [1, "nxs-thumbnail__image", 3, "error", "src", "alt"]], template: function NxsThumbnailComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵconditionalCreate(0, NxsThumbnailComponent_Conditional_0_Template, 1, 2, "img", 0)(1, NxsThumbnailComponent_Conditional_1_Template, 1, 0);
        } if (rf & 2) {
            let tmp_0_0;
            i0.ɵɵconditional((tmp_0_0 = ctx.url()) ? 0 : 1, tmp_0_0);
        } }, styles: ["[_nghost-%COMP%] {\n  display: block;\n  overflow: hidden;\n}\n\n//[_ngcontent-%COMP%]   No[_ngcontent-%COMP%]   box[_ngcontent-%COMP%]   while[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   fallback[_ngcontent-%COMP%]   shows[_ngcontent-%COMP%], so[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   caller's[_ngcontent-%COMP%]   icon[_ngcontent-%COMP%]   lays[_ngcontent-%COMP%]   out[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   if[_ngcontent-%COMP%]   this[_ngcontent-%COMP%]   wrapper[_ngcontent-%COMP%]   were[_ngcontent-%COMP%]   absent[_ngcontent-%COMP%]   and\n//[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   caller's[_ngcontent-%COMP%]   sizing[_ngcontent-%COMP%]   class[_ngcontent-%COMP%], meant[_ngcontent-%COMP%]   for[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   image[_ngcontent-%COMP%], does   not   frame   the   icon   too.\n.nxs-thumbnail--empty[_nghost-%COMP%] {\n  display: contents;\n}\n\n.nxs-thumbnail__image[_ngcontent-%COMP%] {\n  display: block;\n  width: 100%;\n  height: 100%;\n  object-fit: inherit;\n  border-radius: inherit;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsThumbnailComponent, [{
        type: Component,
        args: [{ selector: 'nxs-thumbnail', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, host: {
                    class: 'nxs-thumbnail',
                    '[class.nxs-thumbnail--empty]': 'url() === null',
                }, template: "@if (url(); as src) {\n  <img class=\"nxs-thumbnail__image\" [src]=\"src\" [alt]=\"alt()\" (error)=\"broken()\" />\n} @else {\n  <ng-content />\n}\n", styles: [":host {\n  display: block;\n  overflow: hidden;\n}\n\n// No box while the fallback shows, so the caller's icon lays out as if this wrapper were absent and\n// the caller's sizing class, meant for the image, does not frame the icon too.\n:host(.nxs-thumbnail--empty) {\n  display: contents;\n}\n\n.nxs-thumbnail__image {\n  display: block;\n  width: 100%;\n  height: 100%;\n  object-fit: inherit;\n  border-radius: inherit;\n}\n"] }]
    }], () => [], { documentId: [{ type: i0.Input, args: [{ isSignal: true, alias: "documentId", required: true }] }], alt: [{ type: i0.Input, args: [{ isSignal: true, alias: "alt", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsThumbnailComponent, { className: "NxsThumbnailComponent", filePath: "libs/shared/satori-components/src/lib/thumbnail/thumbnail.component.ts", lineNumber: 45 }); })();
//# sourceMappingURL=thumbnail.component.js.map