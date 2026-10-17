import { Injectable } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import * as i0 from "@angular/core";
const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_MS = 24 * 60 * 60 * 1000;
/** How many letters of a name each style keeps: all of it, three, or one. */
const NAME_LENGTH = { long: undefined, short: 3, narrow: 1 };
const shorten = (names, style) => names.map((name) => name.slice(0, NAME_LENGTH[style]));
/** Milliseconds from 1970 to the day's UTC midnight, for arithmetic on days alone. */
function utc({ year, month, day }) {
    const at = new Date(0);
    at.setUTCFullYear(year, month, day);
    return at.getTime();
}
function fromUtc(time) {
    const at = new Date(time);
    return { year: at.getUTCFullYear(), month: at.getUTCMonth(), day: at.getUTCDate() };
}
/**
 * A host's date adapter whose dates are not JS `Date`s, as Luxon's and Moment's are not: each date
 * is a `{ year, month, day }` object. It writes and reads `yyyy-mm-dd` and implements every method
 * Material's datepicker calls, so a spec can type into, pick from and read back a field the way a
 * host with a date library would. A component that assumes JS dates, by calling `getTime()` or
 * `toISOString()` on a field's value or by giving a field a JS `Date`, fails against it; Material's
 * `NativeDateAdapter` and its subclasses hold JS dates and cannot show that.
 */
export class CalendarDayAdapter extends DateAdapter {
    getYear(date) {
        return date.year;
    }
    getMonth(date) {
        return date.month;
    }
    getDate(date) {
        return date.day;
    }
    getDayOfWeek(date) {
        return new Date(utc(date)).getUTCDay();
    }
    getMonthNames(style) {
        return shorten(MONTHS, style);
    }
    getDateNames() {
        return Array.from({ length: 31 }, (_, i) => String(i + 1));
    }
    getDayOfWeekNames(style) {
        return shorten(WEEKDAYS, style);
    }
    getYearName(date) {
        return String(date.year);
    }
    getFirstDayOfWeek() {
        return 0;
    }
    getNumDaysInMonth(date) {
        return fromUtc(utc({ year: date.year, month: date.month + 1, day: 0 })).day;
    }
    clone(date) {
        return { ...date };
    }
    createDate(year, month, day) {
        const date = { year, month, day };
        if (!this.isValid(date))
            throw new Error(`CalendarDayAdapter: no day ${year}-${month}-${day}`);
        return date;
    }
    today() {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
    }
    parse(value) {
        if (this.isDateInstance(value))
            return this.clone(value);
        if (typeof value !== 'string' || !value.trim())
            return null;
        const match = /^\s*(\d{4})-(\d{1,2})-(\d{1,2})\s*$/.exec(value);
        if (!match)
            return this.invalid();
        const date = { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
        return this.isValid(date) ? date : this.invalid();
    }
    format(date) {
        if (!this.isValid(date))
            throw new Error('CalendarDayAdapter: cannot format an invalid date');
        return this.toIso8601(date);
    }
    addCalendarYears(date, years) {
        return this.addCalendarMonths(date, years * 12);
    }
    addCalendarMonths(date, months) {
        const index = date.year * 12 + date.month + months;
        const target = { year: Math.floor(index / 12), month: ((index % 12) + 12) % 12, day: 1 };
        return { ...target, day: Math.min(date.day, this.getNumDaysInMonth(target)) };
    }
    addCalendarDays(date, days) {
        return fromUtc(utc(date) + days * DAY_MS);
    }
    toIso8601(date) {
        const two = (n) => String(n).padStart(2, '0');
        return `${String(date.year).padStart(4, '0')}-${two(date.month + 1)}-${two(date.day)}`;
    }
    isDateInstance(obj) {
        return (typeof obj === 'object' &&
            obj !== null &&
            !(obj instanceof Date) &&
            ['year', 'month', 'day'].every((field) => typeof obj[field] === 'number'));
    }
    isValid(date) {
        const { year, month, day } = date;
        if (![year, month, day].every(Number.isInteger) || month < 0 || month > 11 || day < 1) {
            return false;
        }
        return day <= fromUtc(utc({ year, month: month + 1, day: 0 })).day;
    }
    invalid() {
        return { year: Number.NaN, month: Number.NaN, day: Number.NaN };
    }
    /** `yyyy-mm-dd`, the one text it takes as unambiguous; otherwise as `DateAdapter` does. */
    deserialize(value) {
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value))
            return this.parse(value);
        return super.deserialize(value);
    }
    static ɵfac = /*@__PURE__*/ (() => { let ɵCalendarDayAdapter_BaseFactory; return function CalendarDayAdapter_Factory(__ngFactoryType__) { return (ɵCalendarDayAdapter_BaseFactory || (ɵCalendarDayAdapter_BaseFactory = i0.ɵɵgetInheritedFactory(CalendarDayAdapter)))(__ngFactoryType__ || CalendarDayAdapter); }; })();
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: CalendarDayAdapter, factory: CalendarDayAdapter.ɵfac });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CalendarDayAdapter, [{
        type: Injectable
    }], null, null); })();
//# sourceMappingURL=calendar-day-adapter.mock.js.map