import { ChangeDetectionStrategy, Component, computed, input, numberAttribute, } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { nxsVisibleText } from '../visible-text';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/progress-spinner";
/**
 * The indeterminate loader for a region waiting on data — a list, a tab, a panel, a dialog body.
 *
 * It is either named or decorative, never neither. With a `label` it is a progressbar carrying that
 * accessible name. Without one it is hidden from assistive technology, so use it bare only where
 * visible text beside it already says what is loading ("Checking Nuxeo Drive…"). A progressbar with
 * no name fails axe's `aria-progressbar-name`.
 *
 * Not for inside a button: a spinner there reflows the label. Rotate the button's icon instead —
 * `AGENTS/08-bug-patterns.md`, pattern 15.
 */
export class NxsSpinnerComponent {
    /** Diameter in pixels. Accepts a static attribute, `diameter="36"`. */
    diameter = input(32, ...(ngDevMode ? [{ debugName: "diameter", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** What is loading, already translated. Blank makes the spinner decorative. */
    label = input('', ...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The accessible name as a reader gets it: whitespace or zero-width characters alone are no name. */
    name = computed(() => nxsVisibleText(this.label()), ...(ngDevMode ? [{ debugName: "name" }] : []));
    static ɵfac = function NxsSpinnerComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsSpinnerComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsSpinnerComponent, selectors: [["nxs-spinner"]], hostAttrs: [1, "nxs-spinner"], inputs: { diameter: [1, "diameter"], label: [1, "label"] }, decls: 1, vars: 3, consts: [["mode", "indeterminate", 3, "diameter"]], template: function NxsSpinnerComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "mat-progress-spinner", 0);
        } if (rf & 2) {
            i0.ɵɵproperty("diameter", ctx.diameter());
            i0.ɵɵattribute("aria-label", ctx.name() || null)("aria-hidden", ctx.name() ? null : "true");
        } }, dependencies: [MatProgressSpinnerModule, i1.MatProgressSpinner], styles: ["[_nghost-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsSpinnerComponent, [{
        type: Component,
        args: [{ selector: 'nxs-spinner', standalone: true, imports: [MatProgressSpinnerModule], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-spinner' }, template: "<mat-progress-spinner\n  mode=\"indeterminate\"\n  [diameter]=\"diameter()\"\n  [attr.aria-label]=\"name() || null\"\n  [attr.aria-hidden]=\"name() ? null : 'true'\"\n/>\n", styles: [":host {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n"] }]
    }], null, { diameter: [{ type: i0.Input, args: [{ isSignal: true, alias: "diameter", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsSpinnerComponent, { className: "NxsSpinnerComponent", filePath: "libs/shared/satori-components/src/lib/spinner/spinner.component.ts", lineNumber: 32 }); })();
