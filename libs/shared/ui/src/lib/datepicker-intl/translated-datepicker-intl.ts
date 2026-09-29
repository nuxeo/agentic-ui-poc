import { Injectable, Provider, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { TranslateService } from '@ngx-translate/core';
import { merge } from 'rxjs';

type DatepickerLabel = Exclude<
  keyof MatDatepickerIntl,
  'changes' | 'formatYearRange' | 'formatYearRangeLabel'
>;

const LABEL_KEYS: Record<DatepickerLabel, string> = {
  calendarLabel: 'app.datepicker.calendar',
  openCalendarLabel: 'app.datepicker.open-calendar',
  closeCalendarLabel: 'app.datepicker.close-calendar',
  prevMonthLabel: 'app.datepicker.previous-month',
  nextMonthLabel: 'app.datepicker.next-month',
  prevYearLabel: 'app.datepicker.previous-year',
  nextYearLabel: 'app.datepicker.next-year',
  prevMultiYearLabel: 'app.datepicker.previous-24-years',
  nextMultiYearLabel: 'app.datepicker.next-24-years',
  switchToMonthViewLabel: 'app.datepicker.choose-date',
  switchToMultiYearViewLabel: 'app.datepicker.choose-month-and-year',
  startDateLabel: 'app.datepicker.start-date',
  endDateLabel: 'app.datepicker.end-date',
  comparisonDateLabel: 'app.datepicker.comparison-range',
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
@Injectable()
export class TranslatedDatepickerIntl extends MatDatepickerIntl {
  private readonly translate = inject(TranslateService);
  private readonly englishDefaults = Object.fromEntries(
    (Object.keys(LABEL_KEYS) as DatepickerLabel[]).map((field) => [field, this[field]]),
  ) as Record<DatepickerLabel, string>;

  constructor() {
    super();
    this.refresh();
    merge(this.translate.onLangChange, this.translate.onTranslationChange)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.refresh());
  }

  override formatYearRange(start: string, end: string): string {
    return this.resolve('app.datepicker.year-range', super.formatYearRange(start, end), {
      start,
      end,
    });
  }

  override formatYearRangeLabel(start: string, end: string): string {
    return this.resolve('app.datepicker.year-range-label', super.formatYearRangeLabel(start, end), {
      start,
      end,
    });
  }

  private refresh(): void {
    for (const field of Object.keys(LABEL_KEYS) as DatepickerLabel[]) {
      this[field] = this.resolve(LABEL_KEYS[field], this.englishDefaults[field]);
    }
    this.changes.next();
  }

  private resolve(key: string, fallback: string, params?: Record<string, string>): string {
    const value = this.translate.instant(key, params);
    return typeof value === 'string' && value !== key ? value : fallback;
  }
}

/** Replaces Material's English `MatDatepickerIntl` for this component and its date pickers. */
export function provideTranslatedDatepickerIntl(): Provider {
  return { provide: MatDatepickerIntl, useClass: TranslatedDatepickerIntl };
}
