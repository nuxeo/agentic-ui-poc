import { UserPreferenceValues } from '@alfresco/adf-core';
import { of } from 'rxjs';

import { initialiseAppConfigAndLanguage } from './provide-app-config';
import { DEFAULT_APP_BOOTSTRAP_CONFIG } from '@nuxeo-satori/platform/app-config';
import { signal } from '@angular/core';

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
