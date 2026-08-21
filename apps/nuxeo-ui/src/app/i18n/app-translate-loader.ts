import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AppConfigService } from '@agentic-ui/shared/app-config';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, catchError, map, of } from 'rxjs';

import { EN_FALLBACK_TRANSLATIONS } from './en-fallback';

/** Catalogues are shipped inside the bundle; customer overrides come from the manifest instead. */
export const TRANSLATION_DIRECTORY = 'i18n';

export function translationUrl(lang: string, baseUri: string): string {
  const url = new URL(`${TRANSLATION_DIRECTORY}/${encodeURIComponent(lang)}.json`, baseUri);
  return `${url.pathname}${url.search}`;
}

/** Keeps only string values: ngx-translate would otherwise render `[object Object]`. */
export function flattenCatalogue(
  source: unknown,
  prefix = '',
  target: Record<string, string> = {},
): Record<string, string> {
  if (typeof source !== 'object' || source === null || Array.isArray(source)) return target;
  for (const [key, value] of Object.entries(source)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      target[path] = value;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      flattenCatalogue(value, path, target);
    }
  }
  return target;
}

/**
 * Loads the shipped translation catalogue and layers the manifest's `labels`
 * over it.
 *
 * That second step is the Layer 0 point of this class: relabelling the product
 * for a customer is a manifest edit, not a rebuild. The English catalogue is
 * also compiled in as a fallback, so a failed fetch degrades to English rather
 * than to raw translation keys.
 */
@Injectable({ providedIn: 'root' })
export class AppTranslateLoader implements TranslateLoader {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);

  getTranslation(lang: string): Observable<Record<string, string>> {
    return this.http.get<unknown>(translationUrl(lang, document.baseURI)).pipe(
      map((catalogue) => flattenCatalogue(catalogue)),
      catchError(() => of(EN_FALLBACK_TRANSLATIONS)),
      map((catalogue) => ({ ...catalogue, ...this.config.manifest().labels })),
    );
  }
}
