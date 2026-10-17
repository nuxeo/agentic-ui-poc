import { Directive, ElementRef, DestroyRef, afterNextRender, inject } from '@angular/core';
import { observeMatTabListKeyboardA11y } from './mat-tab-list-keyboard-a11y';
import * as i0 from "@angular/core";
/**
 * Sets IBM-detectable inline `onkeydown` on Material tablists inside `mat-tab-group`.
 * Apply as `libMatTabListKeydown` on the group host.
 */
export class MatTabListKeydownDirective {
    host = inject(ElementRef);
    destroyRef = inject(DestroyRef);
    constructor() {
        afterNextRender(() => {
            const cleanup = observeMatTabListKeyboardA11y(this.host.nativeElement);
            if (cleanup) {
                this.destroyRef.onDestroy(cleanup);
            }
        });
    }
    static ɵfac = function MatTabListKeydownDirective_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MatTabListKeydownDirective)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: MatTabListKeydownDirective, selectors: [["mat-tab-group", "libMatTabListKeydown", ""]] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MatTabListKeydownDirective, [{
        type: Directive,
        args: [{
                selector: 'mat-tab-group[libMatTabListKeydown]',
                standalone: true,
            }]
    }], () => [], null); })();
