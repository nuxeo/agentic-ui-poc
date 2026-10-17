import { LOCALE_ID, Pipe, inject } from '@angular/core';
import { dateMaskFor } from './date-mask';
import * as i0 from "@angular/core";
/**
 * `{{ 'common.date-mask' | translate | dateMask }}` — the translated date hint, reordered into
 * the active region's field order.
 *
 * It takes the translated value rather than the key so that `TranslatePipe` upstream keeps
 * owning the language: that pipe is already impure and re-emits on a language change, so this
 * one can stay pure and reshape whatever it is handed. `LOCALE_ID` cannot change without a
 * reload, so there is nothing else here to react to.
 */
export class DateMaskPipe {
    localeId = inject(LOCALE_ID);
    transform(translatedMask) {
        return dateMaskFor(this.localeId, translatedMask ?? '');
    }
    static ɵfac = function DateMaskPipe_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DateMaskPipe)(); };
    static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "dateMask", type: DateMaskPipe, pure: true });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DateMaskPipe, [{
        type: Pipe,
        args: [{
                name: 'dateMask',
                standalone: true,
            }]
    }], null, null); })();
