import { type PipeTransform } from '@angular/core';
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
export declare class NxsDateMaskPipe implements PipeTransform {
    private readonly adapter;
    private readonly formats;
    private readonly translate;
    transform(translatedMask: string | null | undefined): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsDateMaskPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<NxsDateMaskPipe, "nxsDateMask", true>;
}
//# sourceMappingURL=date-mask.pipe.d.ts.map