import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { nxsVisibleText } from '../visible-text';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/icon";
/**
 * One icon, by its Material Icons ligature (`folder`, `description`, `collections_bookmark`).
 *
 * Decorative unless given a `label`: an icon beside text that already says the same thing is
 * hidden from assistive technology, and an icon that stands alone is an image with that name.
 *
 * Sized by `--nxs-icon-size` (24px by default) and coloured by `color`, both inherited, so a host
 * sets them on the element or on any ancestor — including through `nxs-doc-type-icon`.
 */
export class NxsIconComponent {
    /** The Material Icons ligature. */
    name = input.required(...(ngDevMode ? [{ debugName: "name" }] : []));
    /** What the icon means, already translated. Blank makes it decorative. */
    label = input('', ...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The accessible name as a reader gets it: whitespace or zero-width characters alone are no name. */
    accessibleName = computed(() => nxsVisibleText(this.label()), ...(ngDevMode ? [{ debugName: "accessibleName" }] : []));
    static ɵfac = function NxsIconComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsIconComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsIconComponent, selectors: [["nxs-icon"]], hostAttrs: [1, "nxs-icon"], inputs: { name: [1, "name"], label: [1, "label"] }, decls: 2, vars: 4, template: function NxsIconComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "mat-icon");
            i0.ɵɵtext(1);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵattribute("aria-hidden", ctx.accessibleName() ? null : "true")("aria-label", ctx.accessibleName() || null)("role", ctx.accessibleName() ? "img" : null);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(ctx.name());
        } }, dependencies: [MatIconModule, i1.MatIcon], styles: ["[_nghost-%COMP%] {\n  display: inline-flex;\n  flex-shrink: 0;\n  width: var(--nxs-icon-size, 24px);\n  height: var(--nxs-icon-size, 24px);\n}\n\nmat-icon[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  font-size: var(--nxs-icon-size, 24px);\n  line-height: 1;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsIconComponent, [{
        type: Component,
        args: [{ selector: 'nxs-icon', standalone: true, imports: [MatIconModule], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-icon' }, template: "<mat-icon\n  [attr.aria-hidden]=\"accessibleName() ? null : 'true'\"\n  [attr.aria-label]=\"accessibleName() || null\"\n  [attr.role]=\"accessibleName() ? 'img' : null\"\n  >{{ name() }}</mat-icon\n>\n", styles: [":host {\n  display: inline-flex;\n  flex-shrink: 0;\n  width: var(--nxs-icon-size, 24px);\n  height: var(--nxs-icon-size, 24px);\n}\n\nmat-icon {\n  width: 100%;\n  height: 100%;\n  font-size: var(--nxs-icon-size, 24px);\n  line-height: 1;\n}\n"] }]
    }], null, { name: [{ type: i0.Input, args: [{ isSignal: true, alias: "name", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsIconComponent, { className: "NxsIconComponent", filePath: "libs/shared/satori-components/src/lib/icon/icon.component.ts", lineNumber: 24 }); })();
