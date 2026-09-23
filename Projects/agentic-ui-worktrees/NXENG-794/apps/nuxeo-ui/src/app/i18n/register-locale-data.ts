import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';

/**
 * Angular locale data for every language we ship a catalogue for.
 *
 * ## Why this file exists
 *
 * Translating strings and formatting dates are two different mechanisms, and having the first
 * does not give you the second. `DatePipe`, `DecimalPipe` and `CurrencyPipe` format against
 * Angular's **locale data** — month names, date order, decimal separator — which is shipped
 * per-locale in `@angular/common/locales` and must be registered explicitly. Only `en-US` is
 * built in.
 *
 * Ask a pipe to format in a locale whose data is not registered and it does not degrade: it
 * throws `NG0701: Missing locale data for the locale "fr"`, which surfaces as
 * `NG02100: InvalidPipeArgument` wherever a date renders.
 *
 * ## Why it was not needed until now
 *
 * It was needed and the defect was masked. adf-core's `TranslationService` was forcing the
 * application back to `en` whenever an adf-hx surface rendered (`W14`), so no pipe was ever
 * handed `fr`. Fixing that made the locale actually apply, and the missing data threw
 * immediately — thirty-six console errors on the French pass of the evidence capture.
 *
 * That ordering is worth keeping in mind: **the i18n bug was hiding the l10n bug.** A
 * half-applied locale looks like a working one right up until it works.
 *
 * ## Adding a locale
 *
 * A locale needs three things that are easy to do only two of: a catalogue in
 * `apps/nuxeo-ui/public/i18n/`, an entry in `availableLanguages`, and an entry here.
 * `checkLocaleDataRegistered` in `scripts/review-guardrails.mjs` fails the build when a
 * catalogue has no matching registration, because the symptom otherwise appears far from the
 * cause — as a pipe error on a page that has nothing to do with the locale that was added.
 *
 * `en` is not listed: Angular bundles it, and registering it would be a no-op that the
 * guardrail would then have to special-case in the opposite direction.
 */
const LOCALE_DATA: ReadonlyArray<readonly [locale: string, data: unknown]> = [
  ['fr', localeFr],
  ['de', localeDe],
];

/** Registers Angular locale data for every non-English locale we ship. */
export function registerShippedLocaleData(): void {
  for (const [locale, data] of LOCALE_DATA) {
    registerLocaleData(data, locale);
  }
}

/** The locales registered here, for the guardrail and for tests. */
export const REGISTERED_LOCALES: readonly string[] = LOCALE_DATA.map(([locale]) => locale);
