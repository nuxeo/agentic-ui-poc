import { Directive, TemplateRef, inject } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Marks the template every tab body renders from: `<ng-template nxsTabBody let-tab>`, usually an
 * `@switch (tab.id)` over the packaged bodies with an extension outlet as the default.
 */
export class NxsTabBodyDirective {
    template = inject(TemplateRef);
    static ngTemplateContextGuard(_directive, _context) {
        return true;
    }
    static ɵfac = function NxsTabBodyDirective_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsTabBodyDirective)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: NxsTabBodyDirective, selectors: [["ng-template", "nxsTabBody", ""]] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsTabBodyDirective, [{
        type: Directive,
        args: [{ selector: 'ng-template[nxsTabBody]', standalone: true }]
    }], null, null); })();
