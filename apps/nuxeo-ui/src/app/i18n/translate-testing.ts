import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of, type Observable } from 'rxjs';

import { EN_FALLBACK_TRANSLATIONS } from './en-fallback';

/**
 * The translate module for this application's **Karma** specs.
 *
 * ## Why this is not the library helper
 *
 * `tools/i18n/test-translate-setup.ts` reads `en.json` with `node:fs`, which is fine under
 * Vitest and impossible here — `nuxeo-ui` runs its specs in a real browser through Karma, where
 * there is no filesystem.
 *
 * ## Why the fallback map rather than the catalogue
 *
 * `EN_FALLBACK_TRANSLATIONS` is compiled in, so it needs no loading of any kind, and it already
 * holds every key bound to an accessible name — which is what these specs query by. A spec
 * that needs a key outside it gets the key passed through, which is visible and easy to
 * diagnose, rather than a silent empty string.
 *
 * Importing the JSON catalogue instead would work, but it would put a `public/` asset into the
 * application's module graph purely for tests, and the asset is served at runtime rather than
 * bundled. Keeping the two apart is the point of `en-fallback.ts` existing at all.
 */
class FallbackCatalogueLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of(EN_FALLBACK_TRANSLATIONS);
  }
}

/** Import this in any `nuxeo-ui` spec whose component template uses the translate pipe. */
export function testTranslateModule() {
  return TranslateModule.forRoot({
    loader: { provide: TranslateLoader, useClass: FallbackCatalogueLoader },
    lang: 'en',
    fallbackLang: 'en',
  });
}
