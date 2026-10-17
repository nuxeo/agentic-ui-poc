import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { docTypeIcon } from '@nuxeo/satori-platform/nuxeo-client';
import { NxsIconComponent } from '../icon/icon.component';
import * as i0 from "@angular/core";
/**
 * The icon for a Nuxeo document type — `Folder`, `File`, `Picture`, `Collection` …
 *
 * The type-to-icon table is `docTypeIcon()` in `nuxeo-client`, so a type added there gets its
 * icon everywhere this is used, and an unknown type gets the generic file icon rather than
 * nothing. Decorative unless given a `label`, because it almost always sits beside the type's
 * name or the document's title.
 */
export class NxsDocTypeIconComponent {
    /** The document's type, as Nuxeo names it. */
    type = input.required(...(ngDevMode ? [{ debugName: "type" }] : []));
    /** What the icon means, already translated. Blank makes it decorative. */
    label = input('', ...(ngDevMode ? [{ debugName: "label" }] : []));
    icon = computed(() => docTypeIcon(this.type()), ...(ngDevMode ? [{ debugName: "icon" }] : []));
    static ɵfac = function NxsDocTypeIconComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsDocTypeIconComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsDocTypeIconComponent, selectors: [["nxs-doc-type-icon"]], hostAttrs: [1, "nxs-doc-type-icon"], inputs: { type: [1, "type"], label: [1, "label"] }, decls: 1, vars: 2, consts: [[3, "name", "label"]], template: function NxsDocTypeIconComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "nxs-icon", 0);
        } if (rf & 2) {
            i0.ɵɵproperty("name", ctx.icon())("label", ctx.label());
        } }, dependencies: [NxsIconComponent], styles: ["[_nghost-%COMP%] {\n  display: inline-flex;\n  flex-shrink: 0;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsDocTypeIconComponent, [{
        type: Component,
        args: [{ selector: 'nxs-doc-type-icon', standalone: true, imports: [NxsIconComponent], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-doc-type-icon' }, template: "<nxs-icon [name]=\"icon()\" [label]=\"label()\" />\n", styles: [":host {\n  display: inline-flex;\n  flex-shrink: 0;\n}\n"] }]
    }], null, { type: [{ type: i0.Input, args: [{ isSignal: true, alias: "type", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsDocTypeIconComponent, { className: "NxsDocTypeIconComponent", filePath: "libs/shared/satori-components/src/lib/doc-type-icon/doc-type-icon.component.ts", lineNumber: 23 }); })();
