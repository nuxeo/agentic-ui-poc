import { DateAdapter } from '@angular/material/core';
import * as i0 from "@angular/core";
/** A date as {@link CalendarDayAdapter} holds one: a plain object, never a JS `Date`. */
export interface CalendarDay {
    readonly year: number;
    /** 0 to 11, as `DateAdapter` counts months. */
    readonly month: number;
    readonly day: number;
}
/**
 * A host's date adapter whose dates are not JS `Date`s, as Luxon's and Moment's are not: each date
 * is a `{ year, month, day }` object. It writes and reads `yyyy-mm-dd` and implements every method
 * Material's datepicker calls, so a spec can type into, pick from and read back a field the way a
 * host with a date library would. A component that assumes JS dates, by calling `getTime()` or
 * `toISOString()` on a field's value or by giving a field a JS `Date`, fails against it; Material's
 * `NativeDateAdapter` and its subclasses hold JS dates and cannot show that.
 */
export declare class CalendarDayAdapter extends DateAdapter<CalendarDay> {
    getYear(date: CalendarDay): number;
    getMonth(date: CalendarDay): number;
    getDate(date: CalendarDay): number;
    getDayOfWeek(date: CalendarDay): number;
    getMonthNames(style: 'long' | 'short' | 'narrow'): string[];
    getDateNames(): string[];
    getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[];
    getYearName(date: CalendarDay): string;
    getFirstDayOfWeek(): number;
    getNumDaysInMonth(date: CalendarDay): number;
    clone(date: CalendarDay): CalendarDay;
    createDate(year: number, month: number, day: number): CalendarDay;
    today(): CalendarDay;
    parse(value: unknown): CalendarDay | null;
    format(date: CalendarDay): string;
    addCalendarYears(date: CalendarDay, years: number): CalendarDay;
    addCalendarMonths(date: CalendarDay, months: number): CalendarDay;
    addCalendarDays(date: CalendarDay, days: number): CalendarDay;
    toIso8601(date: CalendarDay): string;
    isDateInstance(obj: unknown): boolean;
    isValid(date: CalendarDay): boolean;
    invalid(): CalendarDay;
    /** `yyyy-mm-dd`, the one text it takes as unambiguous; otherwise as `DateAdapter` does. */
    deserialize(value: unknown): CalendarDay | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<CalendarDayAdapter, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<CalendarDayAdapter>;
}
//# sourceMappingURL=calendar-day-adapter.mock.d.ts.map