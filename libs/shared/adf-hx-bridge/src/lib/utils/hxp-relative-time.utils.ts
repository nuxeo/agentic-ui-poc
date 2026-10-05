import { formatRelativeTime } from '@nuxeo-satori/platform/nuxeo-client';

/**
 * Relative timestamp for adf-hx surfaces.
 *
 * Delegates to `formatRelativeTime`, which uses `Intl.RelativeTimeFormat`. The hand-rolled
 * version this replaced built the phrase by concatenation and so was English-only, and could
 * not have been fixed with a catalogue key — see that function for why.
 *
 * The locale is a parameter because this is a free function with no injector, and it has to
 * follow the app's Layer 0 `defaultLanguage` rather than the browser's.
 *
 * REQUIRED, with no `'en'` default. The default existed and the only production caller — the
 * adf-hx details panel — omitted it, so every timestamp on that panel was English while the text
 * around it was translated. A default locale in a localisation helper is a silent opt-out.
 */
export function hxpRelativeTime(dateStr: string | null | undefined, locale: string): string {
  return formatRelativeTime(dateStr, locale);
}
