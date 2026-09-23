import { UserPreferenceValues } from '@alfresco/adf-core';
import { of } from 'rxjs';

import { initialiseAppConfigAndLanguage, provideAppConfig } from './provide-app-config';
import { AppConfigService, DEFAULT_APP_BOOTSTRAP_CONFIG } from '@nuxeo-satori/platform/app-config';
import { FactoryProvider, LOCALE_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

/**
 * Two behaviours here are invisible from outside and each was a shipped defect.
 *
 * W14: adf-core's `TranslationService` calls `translate.use()` off its own preference the
 * moment any adf-hx surface constructs, so setting the language is not enough — the
 * preference has to be written too, and written on every boot, because `set()` persists and
 * stored locale beats configuration in `initUserLanguage()`.
 *
 * And the formatting guard: `translate.use('xx')` is harmless because strings fall through to
 * English, but Angular's date pipes throw `NG0701` for a locale with no registered data. A
 * customer's typo produced eleven `InvalidPipeArgument` errors in one capture with the strings
 * looking fine, which is what makes it easy to miss.
 */
describe('initialiseAppConfigAndLanguage', () => {
  function harness(defaultLanguage: string) {
    const order: string[] = [];
    const config = {
      load: jasmine.createSpy('load').and.callFake(async () => {
        order.push('load');
      }),
      // A real signal, not an arrow. `AppConfigService.bootstrap` is a `Signal`, which
      // carries a brand a bare function does not have — and the real config shape, because a
      // partial literal was rejected too. Both caught by narrowing the signature rather than
      // casting past it.
      bootstrap: signal({ ...DEFAULT_APP_BOOTSTRAP_CONFIG, defaultLanguage }),
    };
    const translate = {
      setFallbackLang: jasmine.createSpy('setFallbackLang'),
      use: jasmine.createSpy('use').and.callFake((lang: string) => {
        order.push(`use:${lang}`);
        return of({});
      }),
    };
    const userPreferences = {
      set: jasmine.createSpy('set').and.callFake((key: string, value: string) => {
        order.push(`set:${key}=${value}`);
      }),
    };
    return { config, translate, userPreferences, order };
  }

  // No casts: the function takes only the members it uses, so these doubles satisfy it
  // structurally and a signature change becomes a compile error here.
  const run = async (language: string) => {
    const h = harness(language);
    await initialiseAppConfigAndLanguage(h.config, h.translate, h.userPreferences)();
    return h;
  };

  it('loads the configuration before reading the language out of it', async () => {
    const h = await run('fr');
    // Sequencing is the reason this lives in one initializer: Angular runs them concurrently
    // and the catalogue to load is named by configuration that has only just arrived.
    expect(h.order[0]).toBe('load');
    expect(h.order).toContain('use:fr');
  });

  it('falls back to English for strings it cannot find', async () => {
    const h = await run('fr');
    expect(h.translate.setFallbackLang).toHaveBeenCalledWith('en');
  });

  it("writes the language into adf-core's preference, which is the W14 fix", async () => {
    const h = await run('fr');
    // Without this, adf-core reverts the whole application to English the moment an adf-hx
    // surface renders — no reload involved.
    expect(h.userPreferences.set).toHaveBeenCalledWith(UserPreferenceValues.Locale, 'fr');
  });

  it('writes that preference on every boot, not only the first', async () => {
    // `set()` persists, and stored locale wins over configuration in `initUserLanguage()`. A
    // write-once would strand a customer who later changes `defaultLanguage` on the old
    // language forever, on any browser that had already run the app.
    const first = await run('fr');
    const second = await run('de');
    expect(first.userPreferences.set).toHaveBeenCalledWith(UserPreferenceValues.Locale, 'fr');
    expect(second.userPreferences.set).toHaveBeenCalledWith(UserPreferenceValues.Locale, 'de');
  });

  it('still uses an unshipped locale for strings, because the fallback handles them', async () => {
    const h = await run('xx');
    expect(h.translate.use).toHaveBeenCalledWith('xx');
  });

  it('does NOT hand an unshipped locale to the formatting pipes', async () => {
    const h = await run('xx');
    // The string language and the formatting locale are allowed to diverge, deliberately.
    expect(h.userPreferences.set).toHaveBeenCalledWith(UserPreferenceValues.Locale, 'en');
    expect(h.userPreferences.set).not.toHaveBeenCalledWith(UserPreferenceValues.Locale, 'xx');
  });

  it('passes English straight through', async () => {
    const h = await run('en');
    expect(h.userPreferences.set).toHaveBeenCalledWith(UserPreferenceValues.Locale, 'en');
  });

  it('honours German, so the guard is a real list and not a French special case', async () => {
    const h = await run('de');
    expect(h.userPreferences.set).toHaveBeenCalledWith(UserPreferenceValues.Locale, 'de');
  });
});

/**
 * Angular's `LOCALE_ID`, which is a THIRD mechanism alongside the two above.
 *
 * `translate.use()` sets the string language; `UserPreferencesService` sets adf-core's
 * formatting locale. Neither touches `LOCALE_ID`, and without a provider Angular keeps its
 * built-in `en-US` — so every `DatePipe` and `inject(LOCALE_ID)` call site formats in English
 * whatever Layer 0 says. `docs/i18n-status.md` carried this as gap 10 while a change threading
 * `locale` through a dozen date helpers was merged against that constant default.
 *
 * These assert the provider is actually registered and actually reads configuration. Asserting
 * `resolveFormattingLocale` alone would not: it was already correct as an inline expression, and
 * the defect was that nothing connected it to DI.
 */
describe('LOCALE_ID provider', () => {
  function injectLocaleFor(defaultLanguage: string): string {
    const localeProvider = provideAppConfig().find(
      (provider): provider is FactoryProvider =>
        typeof provider === 'object' && 'provide' in provider && provider.provide === LOCALE_ID,
    );
    // An explicit failure rather than a confusing undefined deref: if the provider is ever
    // dropped, the symptom in production is silent English dates, so it must be loud here.
    expect(localeProvider).withContext('provideAppConfig() must register LOCALE_ID').toBeDefined();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AppConfigService,
          useValue: { bootstrap: signal({ ...DEFAULT_APP_BOOTSTRAP_CONFIG, defaultLanguage }) },
        },
        localeProvider as FactoryProvider,
      ],
    });
    return TestBed.inject(LOCALE_ID);
  }

  it('resolves French from configuration rather than Angular default en-US', () => {
    // The load-bearing assertion of the whole locale change. Before the provider existed this
    // returned 'en-US' for every configuration, which is what made the threaded `locale`
    // parameters inert.
    expect(injectLocaleFor('fr')).toBe('fr');
  });

  it('resolves German too, so it is a real lookup and not a French special case', () => {
    expect(injectLocaleFor('de')).toBe('de');
  });

  it('falls back to en for a locale with no registered Angular data', () => {
    // Same guard as adf-core's preference: the date pipes throw NG0701 rather than degrading,
    // so a customer typo in `defaultLanguage` must not reach them.
    expect(injectLocaleFor('xx')).toBe('en');
  });

  it('differs from Angular default when configured, proving the provider is consulted', () => {
    // A test that only checked 'en' would pass with no provider at all, because Angular's
    // default already starts with those two letters.
    expect(injectLocaleFor('fr')).not.toBe('en-US');
  });
});
