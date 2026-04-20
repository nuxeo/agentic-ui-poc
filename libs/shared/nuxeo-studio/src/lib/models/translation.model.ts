export interface TranslationConfig {
  /** Locale code, e.g. 'en', 'fr', 'de' */
  locale: string;
  /** Display name, e.g. 'English', 'French' */
  displayName: string;
  /** Key-value i18n pairs */
  entries: Record<string, string>;
}

export function createDefaultTranslation(
  locale = 'en',
  displayName = 'English',
): TranslationConfig {
  return {
    locale,
    displayName,
    entries: {},
  };
}
