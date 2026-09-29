import { Injectable, InjectionToken, Provider, inject } from '@angular/core';
import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
  TranslateParser,
  provideMissingTranslationHandler,
  type InterpolationParameters,
} from '@ngx-translate/core';

import { PLATFORM_EN_TRANSLATIONS } from './platform-en';

/**
 * A host's own missing-translation handler, consulted for keys the platform has no English for.
 *
 * ngx-translate allows one `MissingTranslationHandler` per application, so a host that already has
 * one provides it under this token instead, and keeps its behaviour for every other key.
 */
export const PLATFORM_MISSING_TRANSLATION_NEXT = new InjectionToken<MissingTranslationHandler>(
  'PLATFORM_MISSING_TRANSLATION_NEXT',
);

/**
 * Answers a missing platform key with its English, interpolating parameters as a catalogue value
 * would be; any other key goes to `PLATFORM_MISSING_TRANSLATION_NEXT`, or behaves as ngx-translate's
 * default (the key itself) when there is none.
 *
 * It only runs when the key is missing from the current and the fallback language, so a host
 * catalogue that has the key always wins.
 */
@Injectable()
export class PlatformEnglishMissingTranslationHandler implements MissingTranslationHandler {
  private readonly parser = inject(TranslateParser);
  private readonly next = inject(PLATFORM_MISSING_TRANSLATION_NEXT, { optional: true });

  handle(params: MissingTranslationHandlerParams) {
    const english = PLATFORM_EN_TRANSLATIONS[params.key];
    if (english !== undefined) {
      return (
        this.parser.interpolate(english, params.interpolateParams as InterpolationParameters) ??
        english
      );
    }
    return this.next ? this.next.handle(params) : undefined;
  }
}

/**
 * Opt-in English for the platform's own keys, for a host that does not ship the application
 * catalogue:
 *
 *     provideTranslateService({ missingTranslationHandler: providePlatformEnglishFallback() })
 *
 * It is not installed automatically, because it takes the application's single missing-translation
 * slot; see `PLATFORM_MISSING_TRANSLATION_NEXT` to keep a handler you already have.
 */
export function providePlatformEnglishFallback(): Provider {
  return provideMissingTranslationHandler(PlatformEnglishMissingTranslationHandler);
}
