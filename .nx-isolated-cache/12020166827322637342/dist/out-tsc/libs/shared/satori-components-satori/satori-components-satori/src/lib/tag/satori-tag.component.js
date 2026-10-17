import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SatCategoryTag } from '@hylandsoftware/satori-ui/tag';
import * as i0 from "@angular/core";
/** `nxs.primitives.tag` on Satori's `sat-category-tag`. */
export class NxsSatoriTagComponent {
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    color = input('gray', ...(ngDevMode ? [{ debugName: "color" }] : []));
    static ɵfac = function NxsSatoriTagComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsSatoriTagComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsSatoriTagComponent, selectors: [["nxs-satori-tag"]], hostAttrs: [1, "nxs-satori-tag", 2, "display", "inline-flex"], inputs: { label: [1, "label"], color: [1, "color"] }, decls: 2, vars: 2, consts: [[3, "category"]], template: function NxsSatoriTagComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "sat-category-tag", 0);
            i0.ɵɵtext(1);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵproperty("category", ctx.color());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(ctx.label());
        } }, dependencies: [SatCategoryTag], encapsulation: 2, changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsSatoriTagComponent, [{
        type: Component,
        args: [{ selector: 'nxs-satori-tag', standalone: true, imports: [SatCategoryTag], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-satori-tag', style: 'display: inline-flex' }, template: "<sat-category-tag [category]=\"color()\">{{ label() }}</sat-category-tag>\n" }]
    }], null, { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], color: [{ type: i0.Input, args: [{ isSignal: true, alias: "color", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsSatoriTagComponent, { className: "NxsSatoriTagComponent", filePath: "libs/shared/satori-components-satori/src/lib/tag/satori-tag.component.ts", lineNumber: 14 }); })();
//# sourceMappingURL=satori-tag.component.js.map