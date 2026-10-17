import { Injectable, InjectionToken, inject } from '@angular/core';
import { TranslateParser, provideMissingTranslationHandler, } from '@ngx-translate/core';
import { PLATFORM_EN_TRANSLATIONS } from './platform-en';
import * as i0 from "@angular/core";
/**
 * A host's own missing-translation handler, consulted for keys the platform has no English for.
 *
 * ngx-translate allows one `MissingTranslationHandler` per application, so a host that already has
 * one provides it under this token instead, and keeps its behaviour for every other key.
 */
export const PLATFORM_MISSING_TRANSLATION_NEXT = new InjectionToken('PLATFORM_MISSING_TRANSLATION_NEXT');
/**
 * Answers a missing platform key with its English, interpolating parameters as a catalogue value
 * would be; any other key goes to `PLATFORM_MISSING_TRANSLATION_NEXT`, or behaves as ngx-translate's
 * default (the key itself) when there is none.
 *
 * It only runs when the key is missing from the current and the fallback language, so a host
 * catalogue that has the key always wins.
 */
export class PlatformEnglishMissingTranslationHandler {
    parser = inject(TranslateParser);
    next = inject(PLATFORM_MISSING_TRANSLATION_NEXT, { optional: true });
    handle(params) {
        const english = PLATFORM_EN_TRANSLATIONS[params.key];
        if (english !== undefined) {
            return (this.parser.interpolate(english, params.interpolateParams) ??
                english);
        }
        return this.next ? this.next.handle(params) : undefined;
    }
    static ɵfac = function PlatformEnglishMissingTranslationHandler_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PlatformEnglishMissingTranslationHandler)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: PlatformEnglishMissingTranslationHandler, factory: PlatformEnglishMissingTranslationHandler.ɵfac });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PlatformEnglishMissingTranslationHandler, [{
        type: Injectable
    }], null, null); })();
/**
 * Opt-in English for the platform's own keys, for a host that does not ship the application
 * catalogue:
 *
 *     provideTranslateService({ missingTranslationHandler: providePlatformEnglishFallback() })
 *
 * It is not installed automatically, because it takes the application's single missing-translation
 * slot; see `PLATFORM_MISSING_TRANSLATION_NEXT` to keep a handler you already have.
 */
export function providePlatformEnglishFallback() {
    return provideMissingTranslationHandler(PlatformEnglishMissingTranslationHandler);
}
