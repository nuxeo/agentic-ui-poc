import { Injectable, Pipe, PipeTransform, inject, signal } from '@angular/core';

import { ConfigStorageService } from './config-storage.service';

const LOCALE_PREF_KEY = 'nx-active-locale';

/**
 * Loads Studio Designer translation configs and provides
 * runtime key-value lookups. Supports dynamic locale switching.
 */
@Injectable({ providedIn: 'root' })
export class TranslationLoaderService {
  private readonly storage = inject(ConfigStorageService);

  private readonly _activeLocale = signal<string>(localStorage.getItem(LOCALE_PREF_KEY) || 'en');
  readonly activeLocale = this._activeLocale.asReadonly();

  private readonly _entries = signal<Record<string, string>>({});
  readonly entries = this._entries.asReadonly();

  /**
   * Initialize: load translations for the current locale.
   */
  init(): void {
    this.loadLocale(this._activeLocale());
  }

  /**
   * Switch to a different locale.
   */
  switchLocale(locale: string): void {
    this._activeLocale.set(locale);
    localStorage.setItem(LOCALE_PREF_KEY, locale);
    this.loadLocale(locale);
  }

  /**
   * Translate a key. Returns the translated value or the key itself as fallback.
   */
  translate(key: string, params?: Record<string, string>): string {
    const entries = this._entries();
    let value = entries[key] ?? key;

    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        value = value.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
      }
    }

    return value;
  }

  /**
   * Get all available locale codes from configured translations.
   */
  getAvailableLocales(): string[] {
    return this.storage.getTranslations().map((t) => t.locale);
  }

  private loadLocale(locale: string): void {
    const translations = this.storage.getTranslations();
    const config = translations.find((t) => t.locale === locale);
    this._entries.set(config?.entries ?? {});
  }
}

/**
 * Pipe for use in templates: {{ 'key' | nxTranslate }}
 * or {{ 'key' | nxTranslate:{ param: 'value' } }}
 */
@Pipe({ name: 'nxTranslate', standalone: true, pure: false })
export class NxTranslatePipe implements PipeTransform {
  private readonly loader = inject(TranslationLoaderService);

  transform(key: string, params?: Record<string, string>): string {
    return this.loader.translate(key, params);
  }
}
