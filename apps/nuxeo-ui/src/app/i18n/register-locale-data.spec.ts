import { formatDate, formatNumber } from '@angular/common';

import { REGISTERED_LOCALES, registerShippedLocaleData } from './register-locale-data';

/**
 * The claim is not "the function runs". It is that a date and a number formatted in each
 * shipped locale come back in that locale's own conventions instead of throwing `NG0701`.
 *
 * So these assert through `formatDate` and `formatNumber` — the same Angular entry points
 * `DatePipe` and `DecimalPipe` use — rather than spying on `registerLocaleData`. A spy would
 * pass if the wrong data were registered under the right name, which is the mistake worth
 * catching: the failure this file exists to prevent was thirty-six console errors on the
 * French evidence pass, and no spy would have seen it.
 */
describe('registerShippedLocaleData', () => {
  const MIDSUMMER = new Date(2026, 6, 14);

  beforeEach(() => {
    registerShippedLocaleData();
  });

  it('registers data for every locale it advertises', () => {
    // If these two ever disagree the guardrail is checking the wrong list.
    expect([...REGISTERED_LOCALES].sort()).toEqual(['de', 'fr']);
  });

  it('formats a date in French rather than throwing NG0701', () => {
    // The literal defect: before registration this threw `Missing locale data for "fr"`.
    expect(formatDate(MIDSUMMER, 'longDate', 'fr')).toContain('juillet');
  });

  it('formats a date in German rather than throwing NG0701', () => {
    expect(formatDate(MIDSUMMER, 'longDate', 'de')).toContain('Juli');
  });

  it('uses each locale s own separators, not English ones', () => {
    // A locale registered under the wrong data would still format — just wrongly. French uses
    // a comma for the decimal mark and German a full stop for thousands.
    expect(formatNumber(1234.5, 'fr', '1.1-1')).toContain(',');
    expect(formatNumber(1234.5, 'de', '1.1-1')).toContain('.');
  });

  it('is safe to call more than once, because APP_INITIALIZER ordering is not guaranteed', () => {
    expect(() => {
      registerShippedLocaleData();
      registerShippedLocaleData();
    }).not.toThrow();
    expect(formatDate(MIDSUMMER, 'longDate', 'fr')).toContain('juillet');
  });

  it('leaves English alone, which Angular bundles', () => {
    // `en` is deliberately absent from LOCALE_DATA. Registering it would be a no-op the
    // guardrail would then have to special-case in the other direction.
    expect(REGISTERED_LOCALES).not.toContain('en');
    expect(formatDate(MIDSUMMER, 'longDate', 'en-US')).toContain('July');
  });
});
