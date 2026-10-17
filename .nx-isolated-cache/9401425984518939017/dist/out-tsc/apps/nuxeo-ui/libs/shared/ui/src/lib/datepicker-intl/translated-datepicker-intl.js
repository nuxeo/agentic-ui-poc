import { Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { TranslateService } from '@ngx-translate/core';
import { merge } from 'rxjs';
import * as i0 from "@angular/core";
const LABEL_KEYS = {
    calendarLabel: 'shared-ui.datepicker.calendar',
    openCalendarLabel: 'shared-ui.datepicker.open-calendar',
    closeCalendarLabel: 'shared-ui.datepicker.close-calendar',
    prevMonthLabel: 'shared-ui.datepicker.previous-month',
    nextMonthLabel: 'shared-ui.datepicker.next-month',
    prevYearLabel: 'shared-ui.datepicker.previous-year',
    nextYearLabel: 'shared-ui.datepicker.next-year',
    prevMultiYearLabel: 'shared-ui.datepicker.previous-24-years',
    nextMultiYearLabel: 'shared-ui.datepicker.next-24-years',
    switchToMonthViewLabel: 'shared-ui.datepicker.choose-date',
    switchToMultiYearViewLabel: 'shared-ui.datepicker.choose-month-and-year',
    startDateLabel: 'shared-ui.datepicker.start-date',
    endDateLabel: 'shared-ui.datepicker.end-date',
    comparisonDateLabel: 'shared-ui.datepicker.comparison-range',
};
/**
 * Angular Material's date picker labels, from our catalogue.
 *
 * Material ships its own English strings — "Open calendar", "Next month" — and they stayed English
 * in every locale. Re-read on every language or catalogue change and announced through `changes`,
 * which is how Material's picker knows to re-render. A key the catalogue does not supply keeps
 * Material's English rather than showing the key.
 *
 * Provide it with `provideTranslatedDatepickerIntl()` on every component that imports
 * `MatDatepickerModule`, not only at the root: that module lists `MatDatepickerIntl` in its own
 * providers, so a standalone component importing it gets a fresh English instance that shadows
 * any root override.
 */
export class TranslatedDatepickerIntl extends MatDatepickerIntl {
    translate = inject(TranslateService);
    englishDefaults = Object.fromEntries(Object.keys(LABEL_KEYS).map((field) => [field, this[field]]));
    constructor() {
        super();
        this.refresh();
        merge(this.translate.onLangChange, this.translate.onTranslationChange)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.refresh());
    }
    formatYearRange(start, end) {
        return this.resolve('shared-ui.datepicker.year-range', super.formatYearRange(start, end), {
            start,
            end,
        });
    }
    formatYearRangeLabel(start, end) {
        return this.resolve('shared-ui.datepicker.year-range-label', super.formatYearRangeLabel(start, end), {
            start,
            end,
        });
    }
    refresh() {
        for (const field of Object.keys(LABEL_KEYS)) {
            this[field] = this.resolve(LABEL_KEYS[field], this.englishDefaults[field]);
        }
        this.changes.next();
    }
    resolve(key, fallback, params) {
        const value = this.translate.instant(key, params);
        return typeof value === 'string' && value !== key ? value : fallback;
    }
    static ɵfac = function TranslatedDatepickerIntl_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TranslatedDatepickerIntl)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: TranslatedDatepickerIntl, factory: TranslatedDatepickerIntl.ɵfac });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(TranslatedDatepickerIntl, [{
        type: Injectable
    }], () => [], null); })();
/** Replaces Material's English `MatDatepickerIntl` for this component and its date pickers. */
export function provideTranslatedDatepickerIntl() {
    return { provide: MatDatepickerIntl, useClass: TranslatedDatepickerIntl };
}
