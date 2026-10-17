import { Directive, inject, TemplateRef } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Content rendered under each comment's and reply's text — a sentiment badge, a translation:
 * `<ng-template nxsCommentExtra let-comment>…</ng-template>`.
 */
export class NxsCommentExtraDirective {
    template = inject(TemplateRef);
    static ngTemplateContextGuard(_directive, _context) {
        return true;
    }
    static ɵfac = function NxsCommentExtraDirective_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsCommentExtraDirective)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: NxsCommentExtraDirective, selectors: [["ng-template", "nxsCommentExtra", ""]] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsCommentExtraDirective, [{
        type: Directive,
        args: [{ selector: 'ng-template[nxsCommentExtra]', standalone: true }]
    }], null, null); })();
