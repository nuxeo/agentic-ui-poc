import { type Provider } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import * as i0 from "@angular/core";
/** A locale id from what `MAT_DATE_LOCALE` holds: an id, or a date library's locale with a `code`. */
export declare function nxsLocaleId(locale: unknown, fallback?: string): string;
/**
 * The order the locale writes a date's numeric fields in, such as `['day', 'month', 'year']`: the
 * order of the date the field itself writes. For some locales `Intl` orders a two-digit day and
 * month differently from the plain numbers the field shows — Maltese `31/12/2026` but `12/31/2026`
 * — and a parser reading the first would swap the day and month of every date the field wrote.
 */
export declare function nxsDateFieldOrder(locale: string): ('year' | 'month' | 'day')[];
/**
 * The date `text` means in `locale`, at local midnight; an invalid date when it is not one; `null`
 * when it is blank.
 *
 * The fields are read in the order the locale writes them, so `03/04/2026` is 3 April in French and
 * 4 March in American English, whatever the separators. A four-digit number, or one above 31, is the
 * year wherever it is, and a year first is followed by the month, so `2026-04-03` reads the same
 * everywhere but in the two locales that write the year first and then the day. A month may be written as a word in
 * the locale or in English, and a word the locale writes around a date, such as Bulgarian `г.`, is
 * read past. Without a year, the current one is meant. Digits typed in any script — full-width,
 * Arabic-Indic, Devanagari, Thai, Tibetan — are read as digits.
 */
export declare function nxsParseLocaleDate(text: string, locale: string, today?: Date): Date | null;
/**
 * Material's native adapter, reading a typed date in the locale's order.
 *
 * `NativeDateAdapter.parse` is `Date.parse`, which reads `nn/nn/yyyy` as an American date in every
 * locale: `03/04/2026` typed in French became 4 March. This keeps everything else the native adapter
 * does and replaces that, with the Gregorian calendar throughout.
 */
export declare class NxsLocaleDateAdapter extends NativeDateAdapter {
    constructor();
    setLocale(locale: unknown): void;
    parse(value: unknown): Date | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsLocaleDateAdapter, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NxsLocaleDateAdapter>;
}
/**
 * Providers for a date field: the date adapter and formats `hostDateAdapter` decides on.
 *
 * The adapter kept may not hold JS `Date`s — Luxon's holds `DateTime`s — so a component using
 * these providers gives its fields, and reads from them, the adapter's own dates, crossing to and
 * from the JS dates it computes with through `nxsDateToAdapter` and `nxsDateFromAdapter`.
 */
export declare function provideNxsDateAdapter(): Provider[];
/**
 * The English `common.date-mask`. It is the one mask whose letters are known to be in English order
 * whatever the active language, because it is what answers for a language whose catalogue has no
 * mask of its own. A spec holds it to the English catalogue, so the two cannot drift apart.
 */
export declare const NXS_ENGLISH_DATE_MASK = "mm/dd/yyyy";
/** 31 December 2026, as `DateAdapter.createDate` takes it: its day, month and year differ. */
export declare const NXS_DATE_MASK_SAMPLE: {
    readonly year: 2026;
    readonly month: 11;
    readonly day: 31;
};
/**
 * The hint for a date field — `jj/mm/aaaa` — in the order, and with the separators, of `written`:
 * the sample date (31 December 2026) as the field's own date adapter writes it. The letters are the
 * translated mask's, read in the order of `maskLanguage`, the language the catalogue answered in,
 * as `maskOrder` decides it — `fr_FR` is French; the English mask is read in English order whatever the language, because it is what answers for a
 * catalogue without one.
 *
 * So the hint follows the parser rather than the catalogue: a French catalogue's `jj/mm/aaaa` reads
 * `mm/jj/aaaa` where the adapter writes month first, and the English `mm/dd/yyyy` reads
 * `dd/mm/yyyy` where it writes day first. A year the adapter writes with two digits gets two
 * letters, one with four gets four. Anything that cannot be lined up — a mask with a literal such
 * as `年`, an adapter that writes the month as a word or a word such as Bulgarian `г.` — gives
 * `written` itself rather than a mask that might not agree with the parser.
 *
 * Either way the hint is only as good as the adapter reading back what it writes: the field's
 * order comes from what the adapter writes, and the parse from what it reads. `NxsLocaleDateAdapter`
 * does, which its spec checks in every language `Intl` formats a date in. A host's adapter is trusted to; one that writes
 * with `display.dateInput` and reads with a different `parse.dateInput` may not.
 */
export declare function nxsDateMask(written: string, mask: string, maskLanguage: string): string;
/**
 * The calendar's labels from the catalogue, re-read when the language or catalogue changes. A key
 * the catalogue lacks keeps Material's English rather than showing the key. Provided by the date
 * field itself: `MatDatepickerModule` provides its own English one, which shadows a host's.
 */
export declare class NxsDatepickerIntl extends MatDatepickerIntl {
    private readonly translate;
    private readonly english;
    constructor();
    formatYearRange(start: string, end: string): string;
    formatYearRangeLabel(start: string, end: string): string;
    private refresh;
    private resolve;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsDatepickerIntl, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NxsDatepickerIntl>;
}
//# sourceMappingURL=locale-date.d.ts.map