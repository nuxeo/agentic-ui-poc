import { HttpClient } from '@angular/common/http';
import { Component, effect, inject, input, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, of } from 'rxjs';
import { NUXEO_API_ORIGIN, resolveNuxeoIconPath } from '@nuxeo/satori-platform/nuxeo-client';
import * as i0 from "@angular/core";
function CompareIconImageComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElement(0, "img", 0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵdomProperty("src", ctx_r0.blobUrl(), i0.ɵɵsanitizeUrl)("alt", ctx_r0.alt() || i0.ɵɵpipeBind1(1, 2, "shared-ui.document-compare-dialog.document-type-icon"));
} }
function CompareIconImageComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span", 1);
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.path());
} }
export class CompareIconImageComponent {
    http = inject(HttpClient);
    apiOrigin = inject(NUXEO_API_ORIGIN);
    path = input('', ...(ngDevMode ? [{ debugName: "path" }] : []));
    alt = input('', ...(ngDevMode ? [{ debugName: "alt" }] : []));
    blobUrl = signal(null, ...(ngDevMode ? [{ debugName: "blobUrl" }] : []));
    activeUrl = null;
    constructor() {
        effect((onCleanup) => {
            const path = this.path();
            this.revokeActiveUrl();
            this.blobUrl.set(null);
            if (!path)
                return;
            const requestUrl = `${this.apiOrigin.replace(/\/$/, '')}${resolveNuxeoIconPath(path)}`;
            const subscription = this.http
                .get(requestUrl, { responseType: 'blob' })
                .pipe(catchError(() => of(null)))
                .subscribe((blob) => {
                if (!blob)
                    return;
                const objectUrl = URL.createObjectURL(blob);
                this.activeUrl = objectUrl;
                this.blobUrl.set(objectUrl);
            });
            onCleanup(() => {
                subscription.unsubscribe();
                this.revokeActiveUrl();
                this.blobUrl.set(null);
            });
        });
    }
    ngOnDestroy() {
        this.revokeActiveUrl();
    }
    revokeActiveUrl() {
        if (!this.activeUrl)
            return;
        URL.revokeObjectURL(this.activeUrl);
        this.activeUrl = null;
    }
    static ɵfac = function CompareIconImageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CompareIconImageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CompareIconImageComponent, selectors: [["lib-compare-icon-image"]], inputs: { path: [1, "path"], alt: [1, "alt"] }, decls: 2, vars: 1, consts: [[1, "compare-icon-image", 3, "src", "alt"], [1, "compare-icon-fallback"]], template: function CompareIconImageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, CompareIconImageComponent_Conditional_0_Template, 2, 4, "img", 0)(1, CompareIconImageComponent_Conditional_1_Template, 2, 1, "span", 1);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.blobUrl() ? 0 : ctx.path() ? 1 : -1);
        } }, dependencies: [TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n}\n\n.compare-icon-image[_ngcontent-%COMP%] {\n  width: 16px;\n  height: 16px;\n  display: block;\n}\n\n.compare-icon-fallback[_ngcontent-%COMP%] {\n  font-size: 13px;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CompareIconImageComponent, [{
        type: Component,
        args: [{ selector: 'lib-compare-icon-image', standalone: true, imports: [TranslatePipe], template: "@if (blobUrl()) {\n  <img\n    [src]=\"blobUrl()!\"\n    [alt]=\"alt() || ('shared-ui.document-compare-dialog.document-type-icon' | translate)\"\n    class=\"compare-icon-image\"\n  />\n} @else if (path()) {\n  <span class=\"compare-icon-fallback\">{{ path() }}</span>\n}\n", styles: [":host {\n  display: inline-flex;\n  align-items: center;\n}\n\n.compare-icon-image {\n  width: 16px;\n  height: 16px;\n  display: block;\n}\n\n.compare-icon-fallback {\n  font-size: 13px;\n}\n"] }]
    }], () => [], { path: [{ type: i0.Input, args: [{ isSignal: true, alias: "path", required: false }] }], alt: [{ type: i0.Input, args: [{ isSignal: true, alias: "alt", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CompareIconImageComponent, { className: "CompareIconImageComponent", filePath: "libs/shared/ui/src/lib/document-compare-dialog/compare-icon-image.component.ts", lineNumber: 14 }); })();
