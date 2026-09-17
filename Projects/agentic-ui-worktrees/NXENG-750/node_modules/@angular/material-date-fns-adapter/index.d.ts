import * as i0 from '@angular/core';
import { Provider } from '@angular/core';
import { DateAdapter, MatDateFormats } from '@angular/material/core';
import { Locale } from 'date-fns';

/** Adds date-fns support to Angular Material. */
declare class DateFnsAdapter extends DateAdapter<Date, Locale> {
    constructor(...args: unknown[]);
    getYear(date: Date): number;
    getMonth(date: Date): number;
    getDate(date: Date): number;
    getDayOfWeek(date: Date): number;
    getMonthNames(style: 'long' | 'short' | 'narrow'): string[];
    getDateNames(): string[];
    getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[];
    getYearName(date: Date): string;
    getFirstDayOfWeek(): number;
    getNumDaysInMonth(date: Date): number;
    clone(date: Date): Date;
    createDate(year: number, month: number, date: number): Date;
    today(): Date;
    parse(value: unknown, parseFormat: string | string[]): Date | null;
    format(date: Date, displayFormat: string): string;
    addCalendarYears(date: Date, years: number): Date;
    addCalendarMonths(date: Date, months: number): Date;
    addCalendarDays(date: Date, days: number): Date;
    toIso8601(date: Date): string;
    /**
     * Returns the given value if given a valid Date or null. Deserializes valid ISO 8601 strings
     * (https://www.ietf.org/rfc/rfc3339.txt) into valid Dates and empty string into null. Returns an
     * invalid date for all other values.
     */
    deserialize(value: unknown): Date | null;
    isDateInstance(obj: unknown): obj is Date;
    isValid(date: Date): boolean;
    invalid(): Date;
    setTime(target: Date, hours: number, minutes: number, seconds: number): Date;
    getHours(date: Date): number;
    getMinutes(date: Date): number;
    getSeconds(date: Date): number;
    parseTime(value: unknown, parseFormat: string | string[]): Date | null;
    addSeconds(date: Date, amount: number): Date;
    private _parse;
    static ɵfac: i0.ɵɵFactoryDeclaration<DateFnsAdapter, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DateFnsAdapter>;
}

declare const MAT_DATE_FNS_FORMATS: MatDateFormats;

declare class DateFnsModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<DateFnsModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<DateFnsModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<DateFnsModule>;
}
declare class MatDateFnsModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MatDateFnsModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MatDateFnsModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MatDateFnsModule>;
}
declare function provideDateFnsAdapter(formats?: MatDateFormats): Provider[];

export { DateFnsAdapter, DateFnsModule, MAT_DATE_FNS_FORMATS, MatDateFnsModule, provideDateFnsAdapter };
