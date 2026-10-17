import { Pipe, inject } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { NXS_DATE_MASK_SAMPLE, nxsDateMask } from './locale-date';
import * as i0 from "@angular/core";
/**
 * `{{ 'common.date-mask' | translate | nxsDateMask }}`: the translated date hint, in the order and
 * with the separators the field's own date adapter writes a date in, so the hint reads what the
 * field parses wherever the adapter reads back the dates it writes. See `nxsDateMask`.
 *
 * The adapter is the one the component using the pipe injects: `provideNxsDateAdapter()`'s, or the
 * host's own when it has one. The translate pipe upstream owns the words and the language.
 *
 * Impure, because a host can switch the adapter's locale while the translated text stays the same,
 * and the parser follows that at once; the hint then follows it on the next check.
 */
export class NxsDateMaskPipe {
    adapter = inject(DateAdapter);
    formats = inject(MAT_DATE_FORMATS);
    translate = inject(TranslateService);
    transform(translatedMask) {
        const { year, month, day } = NXS_DATE_MASK_SAMPLE;
        const written = this.adapter.format(this.adapter.createDate(year, month, day), this.formats.display.dateInput);
        return nxsDateMask(written, translatedMask ?? '', this.translate.getCurrentLang() ?? '');
    }
    static ɵfac = function NxsDateMaskPipe_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsDateMaskPipe)(); };
    static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "nxsDateMask", type: NxsDateMaskPipe, pure: false });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsDateMaskPipe, [{
        type: Pipe,
        args: [{ name: 'nxsDateMask', standalone: true, pure: false }]
    }], null, null); })();
