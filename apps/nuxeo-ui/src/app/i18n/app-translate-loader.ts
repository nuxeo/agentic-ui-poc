import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AppConfigService } from '@agentic-ui/shared/app-config';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';

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

/** A translation folder in adf-core's sense: a name and a path under the base href. */
interface TranslationFolder {
  readonly name: string;
  path: string;
}

/**
 * WORKAROUND(adf-hx): W6 — adf-hx's own i18n catalogues seeded, because its components register
 * them too late for the registration to matter.
 *
 * Catalogues seeded at construction, keyed by the name their owner registers under.
 *
 * adf-core's own loader seeds its folder in its constructor, and these are seeded for the same
 * reason: without them adf-hx components render raw keys — `ADF-DATATABLE.ACCESSIBILITY.SELECT_ALL`
 * from adf-core, `MANAGE_VERSIONS.DIALOG.TITLE` from adf-hx. All three are copied in by asset
 * globs in `angular.json`.
 *
 * The adf-hx folders are seeded rather than left to arrive on their own, and that distinction
 * is the bug this fixes. adf-hx components *do* register their catalogue — `provideTranslations`
 * in each component's own `providers` — but registration happens when the component is
 * constructed, which is long after the language has loaded, and `init` below is a no-op. So the
 * registration landed and the strings still never arrived. The versions panel rendered
 * `MANAGE_VERSIONS.DIALOG.TITLE` as its heading.
 *
 * The names match upstream's exactly so `providerRegistered` recognises its own registration
 * and `registerProvider` updates the path in place instead of adding a duplicate folder.
 */
const SEEDED_FOLDERS: readonly TranslationFolder[] = [
  { name: 'adf-core', path: 'assets/adf-core' },
  {
    name: 'adf-enterprise-adf-hx-content-services-ui',
    path: 'assets/adf-enterprise-adf-hx-content-services-ui',
  },
  {
    name: 'adf-enterprise-adf-hx-content-services-services',
    path: 'assets/adf-enterprise-adf-hx-content-services-services',
  },
];

/**
 * Loads the shipped translation catalogue and layers the manifest's `labels` over it.
 *
 * That second step is the Layer 0 point of this class: relabelling the product for a
 * customer is a manifest edit, not a rebuild. The English catalogue is also compiled in
 * as a fallback, so a failed fetch degrades to English rather than to raw keys.
 *
 * WORKAROUND(adf-hx): W2 — five undocumented loader methods duck-typed without importing adf-core.
 *
 * ## Why it implements five methods that are not on `TranslateLoader`
 *
 * adf-core's `TranslationService` does not treat the ngx-translate loader as a
 * `TranslateLoader`. It takes `translate.currentLoader` and calls `setDefaultLang`,
 * `providerRegistered`, `registerProvider`, `getFullTranslationJSON` and `init` on it.
 * With a plain `TranslateLoader` in place, every adf-hx component dies with
 * `TypeError: this.customLoader.setDefaultLang is not a function`.
 *
 * There are three ways to satisfy that, and only one works here:
 *
 * - Replace this class with adf-core's `TranslateLoaderService`. Deletes the
 *   manifest-labels layering, which is a shipped Layer 0 capability.
 * - Extend adf-core's `TranslateLoaderService`. Works, and puts `@alfresco/adf-core` on
 *   an import chain from `app.config.ts`, moving adf-core into the **initial** bundle —
 *   measured at 1.71 MB → 2.86 MB, past the 2 MB budget error.
 * - Implement the contract here, importing nothing from adf-core. Costs the forty lines
 *   below and keeps adf-core in the lazily-loaded POC chunk.
 *
 * This is the third. It is a duck-typed implementation of an **undocumented** contract,
 * so an adf-core upgrade could add a method and break it — which surfaces as the same
 * `TypeError` on a different name rather than as a silent failure.
 *
 * Precedence, lowest to highest: registered folders, this app's catalogue, the manifest's
 * `labels`. A customer's relabelling wins over both, which is the point of Layer 0.
 */
@Injectable({ providedIn: 'root' })
export class AppTranslateLoader implements TranslateLoader {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);

  private defaultLang = 'en';
  private readonly folders: TranslationFolder[] = SEEDED_FOLDERS.map((folder) => ({ ...folder }));
  /** Last merged folder catalogue per language, for the synchronous read below. */
  private readonly folderCache = new Map<string, Record<string, string>>();

  getTranslation(lang: string): Observable<Record<string, string>> {
    const folders$ = this.folders.map((folder) =>
      this.http
        .get<unknown>(`${folder.path}/${TRANSLATION_DIRECTORY}/${encodeURIComponent(lang)}.json`)
        .pipe(catchError(() => of({}))),
    );
    const app$ = this.http
      .get<unknown>(translationUrl(lang, document.baseURI))
      .pipe(catchError(() => of(EN_FALLBACK_TRANSLATIONS)));

    return forkJoin([...folders$, app$]).pipe(
      map((catalogues) => {
        const app = catalogues.pop();
        const folders = catalogues.reduce<Record<string, string>>(
          (acc, catalogue) => ({ ...acc, ...flattenCatalogue(catalogue) }),
          {},
        );
        this.folderCache.set(lang, folders);
        return { ...folders, ...flattenCatalogue(app), ...this.config.manifest().labels };
      }),
    );
  }

  /* ---- the adf-core loader contract ---- */

  setDefaultLang(value: string): void {
    this.defaultLang = value || 'en';
  }

  providerRegistered(name: string): boolean {
    return this.folders.some((folder) => folder.name === name);
  }

  registerProvider(name: string, path: string): void {
    const existing = this.folders.find((folder) => folder.name === name);
    if (existing) existing.path = path;
    else this.folders.push({ name, path });
  }

  /**
   * adf-core reads translations synchronously here. It returns whatever the last
   * `getTranslation` cached rather than fetching: a synchronous method cannot honestly
   * perform a network request, and an empty object is the correct answer for a language
   * that has not loaded — a fabricated one would render wrong strings.
   */
  getFullTranslationJSON(lang: string): Record<string, string> {
    return this.folderCache.get(lang) ?? this.folderCache.get(this.defaultLang) ?? {};
  }

  /**
   * A no-op on purpose. adf-core's loader uses `init` to prime a fetch queue; here
   * `getTranslation` loads every registered folder in one pass, so there is nothing to
   * queue. A folder registered *after* the current language has loaded is picked up on
   * the next language load rather than immediately — acceptable because the only
   * registrations happen at bootstrap.
   */
  init(_lang: string): void {
    /* nothing to prime */
  }
}
